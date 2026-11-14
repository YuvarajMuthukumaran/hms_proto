"""Import the old HMS patient export into Supabase (patients, staff, import_runs).

    python -I tools/import_registry.py <file.csv>              # dry run: clean, check, print counts only
    python -I tools/import_registry.py <file.csv> --load        # upsert into Supabase

--load reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment (or tools/.env.import,
which is git-ignored). The service role key never goes into the site, Vercel or git.

Real data guard: a file whose name does not end in .synthetic.csv is real patient data. It is only
loaded when TULASI_REAL_DATA_OK=yes is set, which means the project has real logins, row level
security by user, and written sign-off from Tulasi. This script never prints names, phones or addresses.
"""
import csv
import hashlib
import json
import os
import re
import sys
import urllib.request
from collections import Counter
from datetime import date, datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))


def env():
    vals = dict(os.environ)
    p = os.path.join(HERE, ".env.import")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.strip().split("=", 1)
                vals.setdefault(k.strip(), v.strip().strip('"'))
    return vals


def split(v):
    return [p.strip() for p in re.split(r";", v or "") if p.strip()]


def mobile(v):
    d = re.sub(r"\D", "", v or "")
    if len(d) == 12 and d.startswith("91"):
        d = d[2:]
    if len(d) == 11 and d.startswith("0"):
        d = d[1:]
    return "+91" + d if len(d) == 10 and d[0] in "6789" else None


def day(v):
    try:
        return datetime.strptime((v or "")[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def dob_est(detail, last):
    """'42 Yrs 6 Mo 7 Days' at the last visit -> estimated date of birth."""
    if not last:
        return None
    y = re.search(r"(\d+)\s*Yrs?", detail or "")
    m = re.search(r"(\d+)\s*Mo", detail or "")
    d = re.search(r"(\d+)\s*Days?", detail or "")
    if not y:
        return None
    days = int(y.group(1)) * 365.25 + (int(m.group(1)) * 30.44 if m else 0) + (int(d.group(1)) if d else 0)
    return last - timedelta(days=round(days))


def staff_role(name):
    # Owner's rule (14 Nov 2026): "Dr." = psychiatrist, others = psychologist; Anu Yadav counts as a psychiatrist for now.
    if name.lower().startswith("dr") or name.strip().lower() == "anu yadav":
        return "psychiatrist"
    return "psychologist"


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def pid_of(uhid):
    # stable id from the first UHID; not reversible to a name
    return "p" + hashlib.sha1(uhid.encode()).hexdigest()[:12]


def clean(rows):
    out, rejected, why = [], 0, Counter()
    for r in rows:
        flags = split(r.get("Data Flags (combined)"))
        uhids = split(r.get("UHID(s)"))
        if "Test/Demo record" in flags:
            rejected += 1
            why["test or demo record"] += 1
            continue
        if not uhids or not (r.get("Patient Name") or "").strip():
            rejected += 1
            why["no UHID or name"] += 1
            continue
        mobs = [m for m in (mobile(x) for x in split(r.get("Mobile Number(s)")) or [r.get("Mobile Number(s)", "")]) if m]
        last = day(r.get("Last Consultation Date"))
        age = r.get("Age (Yrs) (at last visit)", "")
        out.append({
            "id": pid_of(uhids[0]),
            "patient_no": int(r["Patient No."]) if (r.get("Patient No.") or "").isdigit() else None,
            "name": r["Patient Name"].strip(),
            "sex": {"Male": "M", "Female": "F"}.get(r.get("Gender", ""), "O"),
            "age": int(age) if age.isdigit() else None,
            "uhid": uhids[0],
            "uhids": uhids,
            "dob_est": (dob_est(r.get("Age (Detail) (at last visit)"), last) or "") and str(dob_est(r.get("Age (Detail) (at last visit)"), last)),
            "mobile": mobs[0] if mobs else None,
            "mobiles_other": mobs[1:],
            "address": (r.get("Address (latest)") or "").strip() or None,
            "relatives": [{"name": n, "rel": ""} for n in split(r.get("Relative(s)"))],
            "referral": (r.get("Referral(s)") or "").strip() or None,
            "panel": (split(r.get("Panel(s)")) or [None])[-1],
            "first_visit": str(day(r.get("First Consultation Date")) or "") or None,
            "last_visit": str(last or "") or None,
            "visit_count": int(r["Total Consultations"]) if (r.get("Total Consultations") or "").isdigit() else 0,
            "doctors_seen": split(r.get("Doctors Seen")),
            "registered_by": (r.get("Registered By (latest)") or "").strip() or None,
            "flags": flags + ([] if mobs else ["No valid mobile"]),
            "psychiatrist": next((d for d in split(r.get("Doctors Seen")) if staff_role(d) == "psychiatrist"), None),
            "psychologist": next((d for d in split(r.get("Doctors Seen")) if staff_role(d) == "psychologist"), None),
        })
    # merge duplicates that share a first UHID
    seen, merged = {}, 0
    for p in out:
        if p["id"] in seen:
            q = seen[p["id"]]
            q["uhids"] = list(dict.fromkeys(q["uhids"] + p["uhids"]))
            q["visit_count"] += p["visit_count"]
            merged += 1
        else:
            seen[p["id"]] = p
    return list(seen.values()), rejected, why, merged


def post(url, key, table, rows, conflict):
    for i in range(0, len(rows), 500):
        body = json.dumps(rows[i:i + 500]).encode()
        req = urllib.request.Request(f"{url}/rest/v1/{table}?on_conflict={conflict}", data=body, method="POST", headers={
            "apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal"})
        with urllib.request.urlopen(req) as res:
            if res.status >= 300:
                sys.exit(f"{table}: HTTP {res.status}")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path, load = sys.argv[1], "--load" in sys.argv
    synthetic = path.endswith(".synthetic.csv")
    rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
    pts, rejected, why, merged = clean(rows)
    names = Counter(d for p in pts for d in p["doctors_seen"])
    staff = [{"id": slug(n), "name": n, "role": staff_role(n), "source": "synthetic" if synthetic else "import"} for n in names]
    for p in pts:
        p["source"] = "synthetic" if synthetic else "import"
    report = {
        "rows_in": len(rows), "patients": len(pts), "rejected": rejected, "rejected_why": dict(why), "merged_same_uhid": merged,
        "no_valid_mobile": sum(1 for p in pts if not p["mobile"]), "under_18": sum(1 for p in pts if (p["age"] or 99) < 18),
        "panel": dict(Counter(p["panel"] or "missing" for p in pts)), "staff": dict(Counter(s["role"] for s in staff)),
        "no_dob_estimate": sum(1 for p in pts if not p["dob_est"]),
    }
    print(json.dumps(report, indent=1))  # counts only
    if not load:
        print("dry run: nothing loaded (add --load)")
        return
    e = env()
    if not synthetic and e.get("TULASI_REAL_DATA_OK") != "yes":
        sys.exit("Refused: this is real patient data. Load it only into a project with real logins and per-user access, "
                 "after written sign-off, then set TULASI_REAL_DATA_OK=yes.")
    url, key = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in tools/.env.import")
    for p in pts:
        p["dob_est"] = p["dob_est"] or None
    post(url, key, "staff", staff, "id")
    post(url, key, "patients", pts, "id")
    post(url, key, "import_runs", [{"source_file": os.path.basename(path), "synthetic": synthetic, "rows_in": len(rows),
                                     "rows_loaded": len(pts), "rows_rejected": rejected, "report": report}], "id")
    print(f"loaded {len(pts)} patients and {len(staff)} staff")


if __name__ == "__main__":
    main()
