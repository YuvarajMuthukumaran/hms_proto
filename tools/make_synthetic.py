"""Make a synthetic copy of the old HMS export: same columns, same shapes, made-up people.

Use it for building and testing. The real export holds real patients and must not be loaded
into a project without logins.

    python -I tools/make_synthetic.py out.synthetic.csv [rows]

Every name, phone, address and UHID is invented. Mobiles start with 90000 so they can never
reach a real phone in tests.
"""
import csv
import random
import sys
from datetime import date, timedelta

COLS = ["Patient No.", "Patient Name", "Alternate Names Seen", "UHID(s)", "Age (Yrs) (at last visit)",
        "Age (Detail) (at last visit)", "Gender", "Doctors Seen", "Referral(s)", "Mobile Number(s)",
        "Address (latest)", "Relative(s)", "First Consultation Date", "Last Consultation Date",
        "Total Consultations", "Panel(s)", "Registered By (latest)", "Data Flags (combined)",
        "Source Sr. No(s)", "Merged via Mobile+DOB (different UHIDs)"]

FIRST_M = ["Aarav", "Vivaan", "Aditya", "Arnav", "Kabir", "Ishaan", "Rohan", "Kunal", "Nikhil", "Varun", "Tarun", "Rahul", "Dev", "Yash", "Manav", "Siddharth"]
FIRST_F = ["Aanya", "Diya", "Isha", "Kavya", "Meera", "Riya", "Sana", "Tara", "Nisha", "Pooja", "Ritu", "Neha", "Anika", "Ira", "Myra", "Zoya"]
LAST = ["Sharma", "Verma", "Gupta", "Mehta", "Rao", "Iyer", "Nair", "Kapoor", "Malhotra", "Bose", "Das", "Sethi", "Jain", "Khanna", "Menon", "Qureshi"]
PLACES = ["Sector 14 Gurgaon Haryana India 122001", "Dwarka New Delhi Delhi India 110075", "Indirapuram Ghaziabad Uttar Pradesh India 201014",
          "Sector 62 Noida Uttar Pradesh India 201301", "Saket New Delhi Delhi India 110017", "DLF Phase 3 Gurgaon Haryana India 122002"]
# Clinician names are made up too; "Dr." marks a psychiatrist, the rest are psychologists.
DOCTORS = ["Dr. Aanya Sharma", "Dr. Kunal Sethi", "Dr. Rohan Mehta", "Dr. Nandini Rao", "Priya Nair", "Kiran Mehra", "Surabhi Sengar", "Ankit Verma"]
REGISTRARS = ["Meena Arora", "Front Desk 2", "Front Desk 3", "Front Desk 4"]


def age_detail(rng):
    y = rng.randint(8, 80)
    m = rng.randint(0, 11)
    d = rng.randint(0, 29)
    style = rng.random()
    if style < 0.3:
        return y, f"{y} Yrs"
    if style < 0.6:
        return y, f"{y} Yrs {m} Mo"
    return y, f"{y} Yrs {m} Mo {d} Days"


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "HMS_FULLY.synthetic.csv"
    if not out.endswith(".synthetic.csv"):
        sys.exit("The output name must end with .synthetic.csv so the importer knows it is not real data.")
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 4800
    rng = random.Random(14112026)
    start, end = date(2023, 10, 23), date(2026, 10, 11)
    span = (end - start).days
    with open(out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(COLS)
        for i in range(1, n + 1):
            male = rng.random() < 0.6
            name = f"{rng.choice(FIRST_M if male else FIRST_F)} {rng.choice(LAST)}"
            y, detail = age_detail(rng)
            first = start + timedelta(days=rng.randint(0, span))
            visits = 1 if rng.random() < 0.65 else rng.randint(2, 14)
            last = min(end, first + timedelta(days=rng.randint(0, 400))) if visits > 1 else first
            uhids = [f"{rng.choice(['2024-25', '2025-26', '2026-27'])}SY{i:05d}"]  # SY = synthetic, never a real UHID
            if rng.random() < 0.01:
                uhids.append(f"{rng.choice(['2024-25', '2025-26'])}SX{i:05d}")
            mobile = f"90000{rng.randint(10000, 99999)}"
            flags = []
            if rng.random() < 0.013:
                mobile = mobile[:9]
                flags.append("Invalid mobile")
            if rng.random() < 0.002:
                flags.append("Test/Demo record")
            panel = "IPD" if rng.random() < 0.05 else "OPD"
            if rng.random() < 0.003:
                panel = ""
                flags.append("Panel missing")
            docs = [rng.choice(DOCTORS)] + ([rng.choice(DOCTORS)] if rng.random() < 0.06 else [])
            rels = f"{rng.choice(FIRST_M + FIRST_F)} {name.split()[1]}" if rng.random() < 0.45 else ""
            w.writerow([i, name, name, "; ".join(uhids), y, detail, "Male" if male else "Female",
                        "; ".join(dict.fromkeys(docs)), rng.choice(DOCTORS) if rng.random() < 0.05 else "",
                        mobile, rng.choice(PLACES), rels, f"{first} 00:00:00", f"{last} 00:00:00", visits, panel,
                        rng.choice(REGISTRARS), "; ".join(flags), str(rng.randint(100, 9999)),
                        "Yes" if len(uhids) > 1 else "No"])
    print(f"wrote {n} synthetic rows to {out}")


if __name__ == "__main__":
    main()
