"""Fill patients.dx for the admitted patients from the latest diagnosis written on their old-HMS prescriptions.

    python -I tools/fill_diagnosis.py --registry <HMS_FULLY.csv> --raw <api05_prescriptions.jsonl>                 # dry run, counts only
    python -I tools/fill_diagnosis.py --registry ... --raw ... --real --apply                                       # write
    python -I tools/fill_diagnosis.py --real --undo                                                                 # put dx back as it was

Only admitted patients whose dx is empty are touched; a diagnosis a doctor already wrote is never replaced. The list text is the first sentence of the latest
prescription diagnosis (max 140 characters); the full text goes to hms_history (kind 'diagnosis') when the patient has none there yet.
A copy of the old dx values (ids only) is saved before --apply. Prints counts only, never a diagnosis or a name.
"""
import csv
import importlib.util
import json
import os
import re
import sys
import urllib.request
from collections import defaultdict, Counter

HERE = os.path.dirname(os.path.abspath(__file__))
BDIR = os.path.join(HERE, "..", "..", "backups", "real-before-diagnosis-2026-11-16")


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv and sys.argv.index(name) + 1 < len(sys.argv) else None


def norm(u):
    return re.sub(r"[^A-Z0-9]", "", (u or "").upper())


def blank(v):
    return (v or "").strip() in ("", "Data is not available", "null", "NULL", "0")


def short(t):
    first = re.split(r"[\n;]|\.\s", t.strip())[0].strip(" .,-")
    return (first[:137] + "...") if len(first) > 140 else first


def main():
    spec = importlib.util.spec_from_file_location("ir", os.path.join(HERE, "import_registry.py"))
    ir = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ir)
    if "--real" in sys.argv:
        e = ir.env()
    else:
        e = {}
    url, key = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY")

    def call(method, path, body=None, prefer=None):
        req = urllib.request.Request(url + "/rest/v1/" + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                     headers={"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json", **({"Prefer": prefer} if prefer else {})})
        raw = urllib.request.urlopen(req).read()
        return json.loads(raw) if raw else None

    if "--undo" in sys.argv:
        if not url or "fmattgrlsgnfcvmxndkk" in url:
            sys.exit("Needs --real.")
        old = json.load(open(os.path.join(BDIR, "patients_dx.json")))
        for r in old:
            call("PATCH", "patients?id=eq." + r["id"], {"dx": r["dx"]}, "return=minimal")
        print("dx restored for", len(old))
        return
    rows = list(csv.DictReader(open(arg("--registry"), encoding="utf-8-sig")))
    pts, _, _, _ = ir.clean(rows)
    by = {norm(u): p for p in pts for u in p["uhids"]}
    ipd = {p["id"] for p in pts if p.get("panel") == "IPD"}
    best = {}
    for line in open(arg("--raw"), encoding="utf-8-sig"):
        try:
            r = json.loads(line)
        except ValueError:
            continue
        d = ((r.get("response") or {}).get("data")) if isinstance(r.get("response"), dict) else None
        for p in (d or {}).get("prescriptions") or []:
            pt = by.get(norm(p.get("uhid") or r.get("uhid")))
            if not pt or pt["id"] not in ipd:
                continue
            for k in ("diagnosis", "provisional_diagnosis", "disease"):
                if not blank(p.get(k)):
                    when = (p.get("visit_date") or p.get("date") or "")[:10]
                    if pt["id"] not in best or when >= best[pt["id"]][0]:
                        best[pt["id"]] = (when, p[k].strip())
                    break
    c = Counter()
    c["admitted (registry IPD)"] = len(ipd)
    c["with a prescription diagnosis"] = len(best)
    c["long text shortened for the list"] = sum(1 for v in best.values() if len(short(v[1])) != len(v[1].strip(" .,-")))
    if "--apply" not in sys.argv:
        print(json.dumps(dict(c)))
        print("dry run: nothing written (add --real --apply)")
        return
    if not url or "fmattgrlsgnfcvmxndkk" in url or e.get("TULASI_REAL_DATA_OK") != "yes":
        sys.exit("Refused: needs the REAL project in tools/.env.real with TULASI_REAL_DATA_OK=yes.")
    adm = call("GET", "patients?select=id,dx&status=eq.admitted&limit=1000")
    have = {r["patient_id"] for r in call("GET", "hms_history?select=patient_id&kind=eq.diagnosis&limit=10000")}
    todo = [r for r in adm if r["id"] in best and not (r.get("dx") or "").strip()]
    os.makedirs(BDIR, exist_ok=True)
    json.dump([{"id": r["id"], "dx": r.get("dx")} for r in todo], open(os.path.join(BDIR, "patients_dx.json"), "w"))
    hist = []
    for r in todo:
        call("PATCH", "patients?id=eq." + r["id"], {"dx": short(best[r["id"]][1])}, "return=minimal")
        if r["id"] not in have:
            hist.append({"patient_id": r["id"], "kind": "diagnosis", "ref": "latest", "event_date": best[r["id"]][0] or None,
                         "title": "Diagnosis (old HMS)", "detail": best[r["id"]][1], "url": None, "data": {}})
    if hist:
        call("POST", "hms_history?on_conflict=patient_id,kind,ref", hist, "resolution=merge-duplicates,return=minimal")
    c["dx filled"] = len(todo)
    c["already had a doctor-written dx (kept)"] = sum(1 for r in adm if r["id"] in best and (r.get("dx") or "").strip())
    c["full text added to the history card"] = len(hist)
    print(json.dumps(dict(c)))


if __name__ == "__main__":
    main()
