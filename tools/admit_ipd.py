"""Admit every imported IPD patient who is not admitted yet (owner's decision, 15 Nov 2026).

    python -I tools/admit_ipd.py --real --psychiatrist "Anu Yadav" --psychologist "Kiran Kumari"

Sets status admitted, today's date as the admission date (the old export has no admission date), the treating team,
and the ward from sex (Female ward / Male ward); adds one open admissions row per patient. Room and MHCA section are
left empty for the psychiatrist to record. Prints counts only.
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
    psy, psych = arg("--psychiatrist"), arg("--psychologist")
    if not psy or not psych:
        sys.exit(__doc__)
    e = env()
    url, key = e["SUPABASE_URL"], e["SUPABASE_SERVICE_ROLE_KEY"]
    h = {"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"}
    rows = json.load(urllib.request.urlopen(urllib.request.Request(
        url + "/rest/v1/patients?select=id,sex&panel=eq.IPD&status=neq.admitted&limit=5000", headers=h)))
    today = datetime.date.today().isoformat()
    n = 0
    for sex, ward in (("F", "Female ward"), (None, "Male ward")):
        ids = [r["id"] for r in rows if (r.get("sex") == "F") == (sex == "F")]
        for i in range(0, len(ids), 100):
            chunk = ids[i:i + 100]
            flt = "id=in.(" + ",".join(chunk) + ")"
            body = {"status": "admitted", "admitted_at": today, "floor": ward, "psychiatrist": psy, "psychologist": psych}
            urllib.request.urlopen(urllib.request.Request(url + "/rest/v1/patients?" + flt, method="PATCH", headers=dict(h, Prefer="return=minimal"),
                                                          data=json.dumps(body).encode()))
            adm = [{"patient_id": p, "admitted_at": today, "floor": ward, "psychiatrist": psy, "psychologist": psych,
                    "status": "admitted", "updated_role": "import"} for p in chunk]
            urllib.request.urlopen(urllib.request.Request(url + "/rest/v1/admissions", method="POST", headers=dict(h, Prefer="return=minimal"),
                                                          data=json.dumps(adm).encode()))
            n += len(chunk)
        print(ward, len(ids))
    print("admitted", n)


if __name__ == "__main__":
    main()
