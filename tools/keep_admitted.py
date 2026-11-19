"""Keep only the patients who are really in the hospital now (meeting 19 Nov 2026: about 90, not 192).

All 192 former IPD patients were admitted on 15 Nov because the old export has no stay dates, so the portal cannot tell who is still here.
Give it the list of UHIDs that are really admitted (one per line, a plain text file kept OUTSIDE the repo; from the ward census or the old HMS bed list).
Everyone else who is "admitted" is discharged (status discharged, today's date) and goes back to the registry / OPD record.

    python -I tools/keep_admitted.py --real --ids "C:\\path\\to\\current_inpatients.txt"           (dry run: counts only)
    python -I tools/keep_admitted.py --real --ids "C:\\path\\to\\current_inpatients.txt" --apply   (really discharges them)

Counts only are printed, never names, UHIDs or phones. A dry run changes nothing. Roll back: the discharged patients can be admitted again from the Registry.
"""
import datetime
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))


def env():
    vals = dict(os.environ)
    p = os.path.join(HERE, ".env.real" if "--real" in sys.argv else ".env.import")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.strip().split("=", 1)
                vals.setdefault(k.strip(), v.strip().strip('"'))
    return vals


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv and sys.argv.index(name) + 1 < len(sys.argv) else None


def main():
    ids_file = arg("--ids")
    if not ids_file or not os.path.exists(ids_file):
        sys.exit(__doc__)
    keep = {l.strip().upper() for l in open(ids_file, encoding="utf-8") if l.strip()}
    e = env()
    url, key = e["SUPABASE_URL"], e["SUPABASE_SERVICE_ROLE_KEY"]
    h = {"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"}
    rows = json.load(urllib.request.urlopen(urllib.request.Request(url + "/rest/v1/patients?select=id,uhid&status=eq.admitted&limit=5000", headers=h)))
    drop = [r["id"] for r in rows if str(r.get("uhid") or "").strip().upper() not in keep]
    known = {str(r.get("uhid") or "").strip().upper() for r in rows}
    print("admitted now:", len(rows), "| in your list:", len(keep), "| of those found:", len(keep & known), "| would be discharged:", len(drop))
    if len(keep & known) < len(keep):
        print("warning:", len(keep - known), "UHIDs in your list are not among the admitted patients (check the file)")
    if "--apply" not in sys.argv:
        print("dry run, nothing changed. Add --apply to discharge them.")
        return
    if len(keep & known) == 0:
        sys.exit("none of your UHIDs matched: refusing to discharge everyone")
    today = datetime.date.today().isoformat()
    for i in range(0, len(drop), 100):
        chunk = drop[i:i + 100]
        flt = "id=in.(" + ",".join(chunk) + ")"
        urllib.request.urlopen(urllib.request.Request(url + "/rest/v1/patients?" + flt, method="PATCH", headers=dict(h, Prefer="return=minimal"),
                                                      data=json.dumps({"status": "discharged"}).encode()))
        urllib.request.urlopen(urllib.request.Request(url + "/rest/v1/admissions?status=eq.admitted&patient_id=in.(" + ",".join(chunk) + ")", method="PATCH",
                                                      headers=dict(h, Prefer="return=minimal"), data=json.dumps({"status": "discharged", "discharged_at": today}).encode()))
    print("discharged:", len(drop))


if __name__ == "__main__":
    main()
