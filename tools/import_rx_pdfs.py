"""Read the medicine lines out of the old-HMS prescription PDFs and (optionally) add them to public.hms_history.

    python -I tools/import_rx_pdfs.py --registry <HMS_FULLY.csv> --pdfs <prescription_pdfs folder> --raw <api05_prescriptions.jsonl>
        dry run: parse every PDF, print COUNTS ONLY, write nothing
    ... --load --real --backup-dir <folder>
        upsert one hms_history row per prescription (kind 'prescription', ref = prescription id), with the medicines in data.meds

Files are named <UHID>_<prescription id>.pdf. A medicine line in the PDF looks like
    "3 T. Paroxetine CR 37.5 mg 0-0-1 X 4 weeks Days"      (number, drug, strength, schedule, X duration)
The original line text is always kept next to the parsed parts. These are OLD prescriptions for reference: they are never
written to the current medicine chart. Never prints names, UHIDs, phones or drug lines.
"""
import csv
import importlib.util
import json
import os
import re
import sys
from collections import Counter
from multiprocessing import Pool

HERE = os.path.dirname(os.path.abspath(__file__))


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv and sys.argv.index(name) + 1 < len(sys.argv) else None


def norm_uhid(u):
    return re.sub(r"[^A-Z0-9]", "", (u or "").upper())


# ---------- parsing ----------
LINE = re.compile(r"^\s*(\d{1,2})[.)]?\s+(.+?)\s+X\s*(\d+)\s*(day|days|week|weeks|wk|wks|month|months|mon)\b", re.I)
FORM = re.compile(r"^(T|TAB|TABS|TABLET|C|CAP|CAPS|CAPSULE|INJ|INJECTION|SYP|SYR|SYRUP|OINT|CREAM|DROPS?|GEL|LOTION|SOLN?|SUSP|SACHET|PATCH)\b\.?\s+", re.I)
SCHED = re.compile(r"(\d(?:\.\d+)?(?:\s?[-–]\s?\d(?:\.\d+)?){2,3}|\bSOS\b|\bOD\b|\bBD\b|\bTDS\b|\bQID\b|\bHS\b|\bSTAT\b|\bQHS\b|\bBID\b|\bTID\b)", re.I)
STRENGTH = re.compile(r"(\d+(?:[.,]\d+)?\s?(?:mg|mcg|µg|gm|g|ml|iu|units?|%))\b", re.I)


LINE_FOR = re.compile(r"^\s*(\d{1,2})[.)]?\s+(.+?)\s+(?:for|x)\s*(\d+)\s*(day|days|week|weeks|month|months)", re.I)
DUR = re.compile(r"(\d+)\s*(d[a-z]*|w[a-z]*|m[a-z]*)", re.I)


def _unit(u):
    return {"d": "days", "w": "weeks", "m": "months"}.get(u[0].lower(), "days")


def parse_med(line):
    m = LINE.match(line) or LINE_FOR.match(line)
    if not m and "*" in line:
        # the second prescription layout: "2 UVOX 150 MG**1-0-1***90*undefined"
        mm = re.match(r"^\s*(\d{1,2})[.)]?\s+([^*]+)\*(.*)$", line)
        if not mm or not STRENGTH.search(mm.group(2)):
            return None
        head, rest = mm.group(2).strip(), mm.group(3)
        sched = SCHED.search(rest)
        dur = None
        for tok in rest.split("*"):
            d = DUR.search(tok)
            if d:
                dur = f"{d.group(1)} {_unit(d.group(2))}"
                break
        if dur is None:
            nums = [t.strip() for t in rest.split("*") if re.fullmatch(r"\d{1,3}", t.strip())]
            if nums:
                dur = f"{nums[-1]} days"
        st = STRENGTH.search(head)
        form = ""
        f = FORM.match(head)
        if f:
            form, head = f.group(1).upper(), head[f.end():]
        st = STRENGTH.search(head)
        name = (head[:st.start()] if st else head).strip(" -,.:;")
        clean = re.sub(r"\*(undefined)", "", line)
        clean = re.sub(r"\*+", " ", clean)
        return {"line": re.sub(r"\s+", " ", clean).strip()[:200], "form": form, "name": name[:80],
                "strength": re.sub(r"\s+", " ", st.group(1)).lower() if st else "",
                "schedule": re.sub(r"\s+", "", sched.group(1)).upper() if sched else "", "duration": dur or ""}
    if not m:
        return None
    body, n, unit = m.group(2).strip(), m.group(3), m.group(4).lower()
    form = ""
    f = FORM.match(body)
    if f:
        form = f.group(1).upper()
        body = body[f.end():]
    sched = SCHED.search(body)
    schedule = re.sub(r"\s+", "", sched.group(1)).upper() if sched else ""
    head = body[:sched.start()] if sched else body
    st = STRENGTH.search(head)
    strength = re.sub(r"\s+", " ", st.group(1)).lower() if st else ""
    name = (head[:st.start()] if st else head).strip(" -,.:;")
    unit = {"wk": "week", "wks": "weeks", "mon": "month"}.get(unit, unit)
    return {"line": re.sub(r"\s+", " ", line).strip()[:200], "form": form, "name": name[:80], "strength": strength,
            "schedule": schedule, "duration": f"{n} {unit}"}


def read_pdf(path):
    import pypdf
    try:
        r = pypdf.PdfReader(path)
        txt = "\n".join((p.extract_text() or "") for p in r.pages)
    except Exception as e:  # unreadable file
        return {"ok": False, "err": type(e).__name__}
    lines = [l for l in txt.splitlines() if l.strip()]
    meds = [m for m in (parse_med(l) for l in lines) if m]
    # lines that look like a medicine (number + strength) but did not parse: measures recall
    cand = sum(1 for l in lines if re.match(r"^\s*\d{1,2}[.)]?\s+\S", l) and STRENGTH.search(l) and not parse_med(l))
    date = None
    for l in lines[:40]:
        d = re.search(r"Date\s*:?\s*(\d{1,2})[-/ ]([A-Za-z]{3}|\d{1,2})[-/ ](\d{4})", l)
        if d:
            date = d.group(0)
            break
    return {"ok": True, "chars": len(txt), "meds": meds, "cand": cand, "date": date}


def work(folder, f):
    m = re.match(r"(.+)_(\d+)\.pdf$", f)
    r = read_pdf(os.path.join(folder, f))
    r["uhid"], r["pid"] = (m.group(1), m.group(2)) if m else ("", "")
    return r


def main():
    reg_path, folder, raw_path = arg("--registry"), arg("--pdfs"), arg("--raw")
    if not (reg_path and folder and raw_path):
        sys.exit(__doc__)
    spec = importlib.util.spec_from_file_location("import_registry", os.path.join(HERE, "import_registry.py"))
    ir = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ir)
    rows = list(csv.DictReader(open(reg_path, encoding="utf-8-sig")))
    pts, _, _, _ = ir.clean(rows)
    by_uhid = {norm_uhid(u): p for p in pts for u in p["uhids"]}
    ipd = {p["id"] for p in pts if p.get("panel") == "IPD"}

    meta = {}
    for line in open(raw_path, encoding="utf-8-sig"):
        try:
            r = json.loads(line)
        except ValueError:
            continue
        d = ((r.get("response") or {}).get("data")) if isinstance(r.get("response"), dict) else None
        for p in (d or {}).get("prescriptions") or []:
            meta[str(p.get("prescription_id"))] = p

    files = sorted(f for f in os.listdir(folder) if f.lower().endswith(".pdf"))
    limit = arg("--limit")
    if limit:
        files = files[: int(limit)]
    from functools import partial
    with Pool(4) as pool:
        results = pool.map(partial(work, folder), files, chunksize=40)

    c = Counter()
    per_pdf_meds = Counter()
    out_rows, pat_with_meds, ipd_with_meds = [], set(), set()
    drugs = Counter()
    for r in results:
        c["pdfs"] += 1
        if not r["ok"]:
            c["unreadable pdf"] += 1
            continue
        p = by_uhid.get(norm_uhid(r["uhid"]))
        if not p:
            c["uhid not in registry (skipped)"] += 1
            continue
        c["matched to a registry patient"] += 1
        n = len(r["meds"])
        per_pdf_meds[min(n, 8)] += 1
        c["pdfs with medicine lines"] += bool(n)
        c["medicine lines"] += n
        c["possible medicine lines not parsed"] += r["cand"]
        if r["pid"] in meta:
            c["has API record (date, doctor, diagnosis)"] += 1
        if n:
            pat_with_meds.add(p["id"])
            if p["id"] in ipd:
                ipd_with_meds.add(p["id"])
            for m in r["meds"]:
                drugs[m["name"].lower()] += 1
        mt = meta.get(r["pid"]) or {}
        vd = (mt.get("visit_date") or "")[:10] or None
        out_rows.append({
            "patient_id": p["id"], "kind": "prescription", "ref": r["pid"], "event_date": vd,
            "title": "Prescription", "detail": (mt.get("diagnosis") or "").strip() or None,
            "url": ((mt.get("prescription_print") or {}).get("print_url")) or None,
            "data": {k: v for k, v in {"doctor": mt.get("specialist_name"), "doctor2": mt.get("specialist_name_2"),
                                         "meds": r["meds"], "pdf": True}.items() if v not in (None, "", "0", [])},
        })
    uniq = {(r["patient_id"], r["kind"], r["ref"]): r for r in out_rows}
    out_rows = list(uniq.values())
    print(json.dumps({
        **dict(c),
        "medicine lines per pdf (0..8+)": dict(sorted(per_pdf_meds.items())),
        "patients with at least one medicine": len(pat_with_meds),
        "registry IPD patients": len(ipd),
        "IPD patients with at least one medicine": len(ipd_with_meds),
        "distinct drug names": len(drugs),
        "rows for hms_history": len(out_rows),
    }, indent=1))
    if "--load" not in sys.argv:
        print("dry run: nothing written (add --load --real --backup-dir <folder>)")
        return
    load(out_rows)


def load(rows):
    import urllib.error
    import urllib.request
    spec = importlib.util.spec_from_file_location("import_registry", os.path.join(HERE, "import_registry.py"))
    ir = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ir)
    if "--real" not in sys.argv:
        sys.argv.append("--real")
    e = ir.env()
    url, key, bdir = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY"), arg("--backup-dir")
    if not bdir:
        sys.exit("Loading needs --backup-dir <folder outside the repo>.")
    if not url or not key or "fmattgrlsgnfcvmxndkk" in url or e.get("TULASI_REAL_DATA_OK") != "yes":
        sys.exit("Refused: needs the REAL project in tools/.env.real with TULASI_REAL_DATA_OK=yes (never the demo).")
    h = {"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"}

    def get(path):
        return json.load(urllib.request.urlopen(urllib.request.Request(url + "/rest/v1/" + path, headers=h)))

    os.makedirs(bdir, exist_ok=True)
    data, off = [], 0
    while True:
        chunk = get(f"hms_history?select=*&order=id&limit=1000&offset={off}")
        data += chunk
        if len(chunk) < 1000:
            break
        off += 1000
    json.dump(data, open(os.path.join(bdir, "hms_history.json"), "w", encoding="utf-8"))
    print("backup hms_history:", len(data), "rows")
    have, off = set(), 0
    while True:
        chunk = get(f"patients?select=id&order=id&limit=1000&offset={off}")
        have |= {r["id"] for r in chunk}
        if len(chunk) < 1000:
            break
        off += 1000
    ok = [r for r in rows if r["patient_id"] in have]
    print("rows with a patient in the database:", len(ok), "of", len(rows))
    for i in range(0, len(ok), 300):
        req = urllib.request.Request(url + "/rest/v1/hms_history?on_conflict=patient_id,kind,ref", method="POST",
                                     data=json.dumps(ok[i:i + 300]).encode(),
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
