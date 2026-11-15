"""Dry run: plan what the old-HMS API output adds to the portal. Prints COUNTS ONLY, writes nothing anywhere.

    python -I tools/import_api_history.py --registry <HMS_FULLY.csv> --api3 <API3_..._ALL_4811.json> [--pull211 <UHID_Test_Output.json>]

Sources (all outside the repo, never committed):
  --api3     API-3 discharge-summary push for every registry UHID: relative name and one record per
             discharge-summary document (id, date added, PDF link). Everything else repeats the registry.
  --pull211  optional 4-API test pull (211 UHIDs): diagnosis text and visit history for the patients it matches.

What a later --load step would write (not built yet, needs the owner's go-ahead and a backup first):
  (API-3 "dob" is only an age text and "f_mobile" is the patient's own number, so neither is loaded.)
  hms_history (new table): one row per discharge document / visit / diagnosis.
This script never prints names, phones, addresses or UHIDs.
"""
import csv
import importlib.util
import json
import os
import re
import sys
from collections import Counter
from datetime import date, datetime
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))


def load_registry_module():
    spec = importlib.util.spec_from_file_location("import_registry", os.path.join(HERE, "import_registry.py"))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv and sys.argv.index(name) + 1 < len(sys.argv) else None


def norm_uhid(u):
    return re.sub(r"[^A-Z0-9]", "", (u or "").upper())


def norm_name(*parts):
    return re.sub(r"[^a-z]", "", " ".join(p or "" for p in parts).lower())


def iso_day(v):
    try:
        return datetime.strptime((v or "")[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def ir_env():
    if "--real" not in sys.argv:
        sys.argv.append("--real")
    return load_registry_module().env()


def blank(v):
    return v in (None, "", "null", "Data is not available")


def main():
    reg_path, a3_path, p211_path = arg("--registry"), arg("--api3"), arg("--pull211")
    if not reg_path or not a3_path:
        sys.exit(__doc__)
    load = "--load" in sys.argv
    out_rows = []  # rows for public.hms_history (never printed)
    ir = load_registry_module()
    rows = list(csv.DictReader(open(reg_path, encoding="utf-8-sig")))
    pts, _, _, _ = ir.clean(rows)
    by_uhid = {}
    for p in pts:
        for u in p["uhids"]:
            by_uhid[norm_uhid(u)] = p
    print("registry patients", len(pts), "uhid keys", len(by_uhid))

    # ---------- API-3 ----------
    recs = json.load(open(a3_path, encoding="utf-8-sig"))
    rep = Counter()
    docs_seen, doc_hosts, doc_years = set(), Counter(), Counter()
    per_patient_docs = Counter()
    matched_pids, pids_with_docs = set(), set()
    for r in recs:
        resp = r.get("response")
        if not isinstance(resp, dict):
            rep["response not JSON (skipped)"] += 1
            continue
        p = by_uhid.get(norm_uhid((r.get("request") or {}).get("uhid")))
        if not p:
            rep["uhid not in registry"] += 1
            continue
        rep["matched to registry patient"] += 1
        matched_pids.add(p["id"])
        h = ((resp.get("patient_data") or {}).get("Hospital")) or {}
        # identity check: same person?
        api_name = norm_name(h.get("name"), h.get("middle_name"), h.get("last_name"))
        reg_name = norm_name(p["name"])
        if api_name and reg_name:
            if api_name == reg_name:
                rep["name identical"] += 1
            elif set(api_name) and (api_name in reg_name or reg_name in api_name):
                rep["name partly same"] += 1
            else:
                rep["NAME DIFFERENT (check before load)"] += 1
                rep["  those are skipped on load"] += 1
                continue
        # date of birth
        dob = iso_day(h.get("dob"))
        if not dob:
            # API-3 "dob" is age text ("26 Yrs", "5 Mon 3 Days"), not a date: nothing to load from it
            rep["dob is age text, not a date (ignored)"] += 1
        else:
            rep["dob valid"] += 1
            if dob > date.today() or dob.year < 1900:
                rep["dob implausible"] += 1
            est = iso_day(p.get("dob_est"))
            if est:
                rep["dob within 2 yrs of registry estimate" if abs((dob - est).days) <= 730 else "dob differs from registry estimate by >2 yrs"] += 1
        # relative
        fname, fmob = (h.get("f_name") or "").strip(), ir.mobile(h.get("f_mobile"))
        rep["relative name present"] += bool(fname)
        rep["relative mobile valid"] += bool(fmob)
        rep["relative name and valid mobile"] += bool(fname and fmob)
        if fmob and fmob == p.get("mobile"):
            rep["relative mobile same as patient mobile"] += 1
        if fname and not any(norm_name(fname) == norm_name(x.get("name")) for x in p["relatives"]):
            rep["relative name is new (not in registry relatives)"] += 1
        # address
        if not blank(h.get("address")) and not p.get("address"):
            rep["address fills a gap in registry"] += 1
        # discharge documents
        n = 0
        for d in resp.get("discharge_data") or []:
            f = (d or {}).get("Fileformat") or {}
            if f.get("formname") != "19. Discharge Summary":
                rep["document of another form type"] += 1
                continue
            if f.get("id") in docs_seen:
                rep["duplicate document id"] += 1
                continue
            docs_seen.add(f.get("id"))
            n += 1
            added0 = iso_day(f.get("add_date"))
            dis = iso_day(f.get("discharge_date"))
            out_rows.append({"patient_id": p["id"], "kind": "discharge_doc", "ref": str(f.get("id")),
                             "event_date": str(added0) if added0 else None, "title": "Discharge summary",
                             "detail": None, "url": f.get("document_url") or None,
                             "data": {k: v for k, v in {
                                 "reason": f.get("discharge_reason_name"), "doctor": f.get("specialist_name"),
                                 "discharge_date": str(dis) if dis and dis.year > 1971 else None}.items() if not blank(v)}})
            u = urlparse(f.get("document_url") or "")
            doc_hosts[u.scheme + "://" + u.netloc] += 1
            added = iso_day(f.get("add_date"))
            doc_years[str(added.year) if added else "no date"] += 1
            rep["document has admission/discharge date"] += bool(f.get("admission_date") or f.get("discharge_date"))
        per_patient_docs[n] += 1
        if n:
            pids_with_docs.add(p["id"])
    out = {
        "api3_records": len(recs),
        **dict(rep),
        "distinct discharge documents": len(docs_seen),
        "patients by number of documents": dict(sorted(per_patient_docs.items())),
        "document link hosts": dict(doc_hosts),
        "documents by year added": dict(sorted(doc_years.items())),
        "patients matched": len(matched_pids),
    }
    # how many of the current IPD patients get documents
    ipd = {p["id"] for p in pts if p.get("panel") == "IPD"}
    out["registry IPD patients"] = len(ipd)
    out["IPD patients covered by API-3"] = len(ipd & matched_pids)
    out["patients with at least one discharge document"] = len(pids_with_docs)
    out["IPD patients with at least one discharge document"] = len(ipd & pids_with_docs)
    print(json.dumps(out, indent=1))

    # ---------- optional 211 pull ----------
    if p211_path:
        j = json.load(open(p211_path, encoding="utf-8-sig"))
        c = Counter()
        for uhid, v in j.items():
            p = by_uhid.get(norm_uhid(uhid))
            if not p:
                c["uhid not in registry"] += 1
                continue
            c["matched"] += 1
            dd = (((v.get("dischargeSummaryPush") or {}).get("response") or {}).get("data")) or {}
            c["with diagnosis text"] += not blank(dd.get("diagnosis"))
            if not blank(dd.get("diagnosis")):
                out_rows.append({"patient_id": p["id"], "kind": "diagnosis", "ref": "latest", "event_date": None,
                                 "title": "Diagnosis (old HMS)", "detail": dd["diagnosis"].strip(), "url": None, "data": {}})
            pr = (((v.get("patientProfileVisitSync") or {}).get("response") or {}).get("data")) or {}
            c["visits"] += len(pr.get("last_5_visit_dates") or [])
            for vv in pr.get("last_5_visit_dates") or []:
                out_rows.append({"patient_id": p["id"], "kind": "visit", "ref": str(vv.get("visit_id")),
                                 "event_date": str(iso_day(vv.get("visit_date")) or "") or None,
                                 "title": (vv.get("visit_type") or "") + " visit", "detail": vv.get("specialist_name") or None,
                                 "url": None, "data": {"time": vv.get("visit_time"), "category_id": vv.get("category_id")}})
            px = (((v.get("prescriptionSync") or {}).get("response") or {}).get("data")) or {}
            c["prescription records (diagnosis + PDF link, no drug names)"] += len(px.get("prescriptions") or [])
            for rx in px.get("prescriptions") or []:
                out_rows.append({"patient_id": p["id"], "kind": "prescription", "ref": str(rx.get("prescription_id")),
                                 "event_date": str(iso_day(rx.get("visit_date") or rx.get("date")) or "") or None,
                                 "title": "Prescription", "detail": (rx.get("diagnosis") or "").strip() or None,
                                 "url": ((rx.get("prescription_print") or {}).get("print_url")) or None,
                                 "data": {k: v for k, v in {"doctor": rx.get("specialist_name"), "doctor2": rx.get("specialist_name_2")}.items() if not blank(v) and v != "0"}})
            c["matched and registry IPD"] += p["id"] in ipd
        print("pull211:", json.dumps(dict(c), indent=1))
    # de-duplicate on the table's unique key (same document / visit seen twice)
    uniq = {(r["patient_id"], r["kind"], r["ref"]): r for r in out_rows}
    out_rows = list(uniq.values())
    print("rows for hms_history:", json.dumps(dict(Counter(r["kind"] for r in out_rows))),
          "patients touched:", len({r["patient_id"] for r in out_rows}))
    if not load:
        print("dry run: nothing written (add --load --real --backup-dir <folder> to load)")
        return
    load_rows(out_rows)


def load_rows(rows):
    import urllib.error
    import urllib.request
    e = ir_env()
    url, key = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY")
    bdir = arg("--backup-dir")
    if "--real" not in sys.argv or not bdir:
        sys.exit("Loading needs --real and --backup-dir <folder outside the repo>.")
    if not url or not key or "fmattgrlsgnfcvmxndkk" in url:
        sys.exit("Refused: need the REAL project in tools/.env.real (not the demo).")
    if e.get("TULASI_REAL_DATA_OK") != "yes":
        sys.exit("Refused: TULASI_REAL_DATA_OK=yes is not set in tools/.env.real.")
    h = {"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"}

    def get(path):
        return json.load(urllib.request.urlopen(urllib.request.Request(url + "/rest/v1/" + path, headers=h)))

    try:
        get("hms_history?select=id&limit=1")
    except urllib.error.HTTPError as ex:
        sys.exit(f"hms_history is not reachable (HTTP {ex.code}). Run supabase/migrations/20261115000100_hms_history.sql in the real project's SQL editor first.")
    # 1. backup of the tables this load relates to (kept outside the repo; contains patient data)
    os.makedirs(bdir, exist_ok=True)
    for t, order in (("patients", "id"), ("patient_records", "patient_id,kind"), ("hms_history", "id")):
        data, off = [], 0
        while True:
            chunk = get(f"{t}?select=*&order={order}&limit=1000&offset={off}")
            data += chunk
            if len(chunk) < 1000:
                break
            off += 1000
        json.dump(data, open(os.path.join(bdir, t + ".json"), "w", encoding="utf-8"))
        print(f"backup {t}: {len(data)} rows")
    # 2. only patients that exist in the database (foreign key)
    have, off = set(), 0
    while True:
        chunk = get(f"patients?select=id&order=id&limit=1000&offset={off}")
        have |= {r["id"] for r in chunk}
        if len(chunk) < 1000:
            break
        off += 1000
    ok = [r for r in rows if r["patient_id"] in have]
    print("rows with a patient in the database:", len(ok), "of", len(rows))
    for i in range(0, len(ok), 500):
        req = urllib.request.Request(url + "/rest/v1/hms_history?on_conflict=patient_id,kind,ref", method="POST",
                                     data=json.dumps(ok[i:i + 500]).encode(),
                                     headers=dict(h, Prefer="resolution=merge-duplicates,return=minimal"))
        urllib.request.urlopen(req).read()
    n, off = 0, 0
    while True:
        chunk = get(f"hms_history?select=id&order=id&limit=1000&offset={off}")
        n += len(chunk)
        if len(chunk) < 1000:
            break
        off += 1000
    print("loaded; hms_history now holds", n, "rows")


if __name__ == "__main__":
    main()
