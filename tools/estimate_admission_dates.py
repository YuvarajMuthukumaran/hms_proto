"""Estimate the admission date of admitted patients from their old-HMS "IPD visit" records (hms_history, kind 'visit').

    python -I tools/estimate_admission_dates.py --real              # dry run, counts only
    python -I tools/estimate_admission_dates.py --real --apply      # write
    python -I tools/estimate_admission_dates.py --real --undo       # put the dates back as they were

Rule: the IPD visit dates of a patient are grouped into stays (a gap of more than 14 days starts a new one); the estimate is the FIRST date of the
LATEST group. Only admitted patients that have such visits are touched; a date that a doctor already set by hand is never replaced (their
flag 'admission date set by doctor' or an admitted_at other than the bulk-admission date 2026-11-15 is kept). Each patient that gets an estimate
is flagged 'admission date estimated' (the portal says "estimated" next to it). A copy of the old values (id, admitted_at, flags) is saved in
backups\real-before-admission-estimate-2026-11-16. Prints counts only, never a name or UHID.
"""
import collections
import datetime
import importlib.util
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BDIR = os.path.join(HERE, "..", "..", "backups", "real-before-admission-estimate-2026-11-16")
FLAG = "admission date estimated"
BULK = "2026-11-15"


def main():
    if "--real" not in sys.argv:
        sys.exit(__doc__)
    spec = importlib.util.spec_from_file_location("ir", os.path.join(HERE, "import_registry.py"))
    ir = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ir)
    e = ir.env()
    url, key = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key or "fmattgrlsgnfcvmxndkk" in url or e.get("TULASI_REAL_DATA_OK") != "yes":
        sys.exit("Refused: needs the REAL project in tools/.env.real with TULASI_REAL_DATA_OK=yes.")
    H = {"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"}

    def call(method, path, body=None, prefer=None):
        req = urllib.request.Request(url + "/rest/v1/" + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                     headers=dict(H, **({"Prefer": prefer} if prefer else {})))
        raw = urllib.request.urlopen(req).read()
        return json.loads(raw) if raw else None

    if "--undo" in sys.argv:
        old = json.load(open(os.path.join(BDIR, "patients.json")))
        for r in old:
            call("PATCH", "patients?id=eq." + r["id"], {"admitted_at": r["admitted_at"], "flags": r["flags"]}, "return=minimal")
            call("PATCH", "admissions?patient_id=eq." + r["id"] + "&status=eq.admitted", {"admitted_at": r["admitted_at"]}, "return=minimal")
        print("restored", len(old))
        return

    adm = {r["id"]: r for r in call("GET", "patients?select=id,admitted_at,flags&status=eq.admitted&limit=1000")}
    by = collections.defaultdict(set)
    for r in call("GET", "hms_history?select=patient_id,event_date,title&kind=eq.visit&limit=5000"):
        if r["patient_id"] in adm and r["title"] == "IPD visit" and r["event_date"]:
            by[r["patient_id"]].add(r["event_date"][:10])
    plan = {}
    for pid, ds in by.items():
        p = adm[pid]
        cur = str(p.get("admitted_at") or "")[:10]
        if cur and cur != BULK:
            continue      # a doctor already set it
        days = sorted(datetime.date.fromisoformat(d) for d in ds)
        start = days[0]
        for prev, nxt in zip(days, days[1:]):
            if (nxt - prev).days > 14:
                start = nxt
        plan[pid] = start.isoformat()
    print(json.dumps({"admitted": len(adm), "with IPD visits": len(by), "dates to estimate": len(plan)}))
    if "--apply" not in sys.argv:
        print("dry run: nothing written (add --apply)")
        return
    os.makedirs(BDIR, exist_ok=True)
    json.dump([{"id": i, "admitted_at": adm[i].get("admitted_at"), "flags": adm[i].get("flags")} for i in plan], open(os.path.join(BDIR, "patients.json"), "w"))
    for pid, d in plan.items():
        flags = list(adm[pid].get("flags") or [])
        if FLAG not in flags:
            flags.append(FLAG)
        call("PATCH", "patients?id=eq." + pid, {"admitted_at": d, "flags": flags}, "return=minimal")
        call("PATCH", "admissions?patient_id=eq." + pid + "&status=eq.admitted", {"admitted_at": d}, "return=minimal")
    print("estimated dates written:", len(plan))


if __name__ == "__main__":
    main()
