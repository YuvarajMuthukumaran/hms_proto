"""Put the downloaded old-HMS PDFs (discharge summaries, prescriptions) into a PRIVATE storage bucket and link them to hms_history.

    python -I tools/upload_old_pdfs.py --registry <HMS_FULLY.csv> --api3 <API3_..._ALL_4811.json> --dis-dir <discharge_pdfs> --rx-dir <prescription_pdfs>
        dry run: prints COUNTS and sizes only
    ... --load --real
        creates the bucket 'old-hms-pdfs' (private), uploads, and writes data.file on the matching hms_history rows

Which files: every discharge summary that has a PDF, and the prescription PDFs of the patients who are inpatients now (--rx all adds every registry patient: ~2.7 GB).
Remote names are opaque ('d/<document id>.pdf', 'rx/<prescription id>.pdf'): no UHID or name in a path. Reading is allowed only to signed-in team roles by
supabase/migrations/20261116000100_old_pdfs.sql. Never prints names, UHIDs or file names.
"""
import csv
import importlib.util
import json
import os
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
BUCKET = "old-hms-pdfs"


def arg(name):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv and sys.argv.index(name) + 1 < len(sys.argv) else None


def norm(u):
    return re.sub(r"[^A-Z0-9]", "", (u or "").upper())


def plan():
    spec = importlib.util.spec_from_file_location("import_registry", os.path.join(HERE, "import_registry.py"))
    ir = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ir)
    rows = list(csv.DictReader(open(arg("--registry"), encoding="utf-8-sig")))
    pts, _, _, _ = ir.clean(rows)
    by = {norm(u): p for p in pts for u in p["uhids"]}
    ipd = {p["id"] for p in pts if p.get("panel") == "IPD"}
    out = []  # (kind, ref, local path, remote path, size)
    # discharge summaries: file <UHID>_<document id>.pdf, document ids from the API-3 output
    docs = {}
    for r in json.load(open(arg("--api3"), encoding="utf-8-sig")):
        if not isinstance(r.get("response"), dict):
            continue
        for d in r["response"].get("discharge_data") or []:
            f = (d or {}).get("Fileformat") or {}
            docs[str(f.get("id"))] = norm((r.get("request") or {}).get("uhid"))
    for fn in os.listdir(arg("--dis-dir")):
        m = re.match(r"(.+)_(\d+)\.pdf$", fn)
        if m and docs.get(m.group(2)) == norm(m.group(1)) and norm(m.group(1)) in by:
            p = os.path.join(arg("--dis-dir"), fn)
            out.append(("discharge_doc", m.group(2), p, "d/" + m.group(2) + ".pdf", os.path.getsize(p)))
    every = arg("--rx") == "all"
    for fn in os.listdir(arg("--rx-dir")):
        m = re.match(r"(.+)_(\d+)\.pdf$", fn)
        if not m:
            continue
        p0 = by.get(norm(m.group(1)))
        if p0 and (every or p0["id"] in ipd):
            p = os.path.join(arg("--rx-dir"), fn)
            out.append(("prescription", m.group(2), p, "rx/" + m.group(2) + ".pdf", os.path.getsize(p)))
    return out


def main():
    if not (arg("--registry") and arg("--api3") and arg("--dis-dir") and arg("--rx-dir")):
        sys.exit(__doc__)
    files = plan()
    c = Counter(f[0] for f in files)
    mb = {k: round(sum(f[4] for f in files if f[0] == k) / 1048576) for k in c}
    print(json.dumps({"files": dict(c), "MB": mb, "total MB": sum(mb.values())}))
    if "--load" not in sys.argv:
        print("dry run: nothing uploaded (add --load --real)")
        return
    spec = importlib.util.spec_from_file_location("ir2", os.path.join(HERE, "import_registry.py"))
    ir = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ir)
    if "--real" not in sys.argv:
        sys.argv.append("--real")
    e = ir.env()
    url, key = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key or "fmattgrlsgnfcvmxndkk" in url or e.get("TULASI_REAL_DATA_OK") != "yes":
        sys.exit("Refused: needs the REAL project in tools/.env.real with TULASI_REAL_DATA_OK=yes (never the demo).")
    H = {"apikey": key, "Authorization": "Bearer " + key}

    def call(method, path, data=None, headers=None):
        req = urllib.request.Request(url + path, data=data, method=method, headers=dict(H, **(headers or {})))
        return urllib.request.urlopen(req).read()

    try:  # private bucket; an existing one is fine
        call("POST", "/storage/v1/bucket", json.dumps({"id": BUCKET, "name": BUCKET, "public": False}).encode(), {"Content-Type": "application/json"})
        print("bucket created (private)")
    except urllib.error.HTTPError as ex:
        print("bucket already there" if ex.code in (400, 409) else f"bucket HTTP {ex.code}")

    def up(f):
        try:
            call("POST", f"/storage/v1/object/{BUCKET}/{f[3]}", open(f[2], "rb").read(), {"Content-Type": "application/pdf", "x-upsert": "true"})
            return f
        except Exception:
            return None

    done = []
    with ThreadPoolExecutor(4) as ex:
        for i, r in enumerate(ex.map(up, files), 1):
            if r:
                done.append(r)
            if i % 100 == 0:
                print("uploaded", len(done), "of", i)
    print("uploaded", len(done), "of", len(files))
    # link: data.file on the matching hms_history rows
    have = {(f[0], f[1]): f[3] for f in done}
    rows, off = [], 0
    while True:
        chunk = json.loads(call("GET", f"/rest/v1/hms_history?select=id,kind,ref,data&kind=in.(discharge_doc,prescription)&order=id&limit=1000&offset={off}"))
        rows += chunk
        if len(chunk) < 1000:
            break
        off += 1000
    n = 0
    for r in rows:
        f = have.get((r["kind"], r["ref"]))
        if not f or (r.get("data") or {}).get("file") == f:
            continue
        d = dict(r.get("data") or {}, file=f)
        call("PATCH", f"/rest/v1/hms_history?id=eq.{r['id']}", json.dumps({"data": d}).encode(), {"Content-Type": "application/json", "Prefer": "return=minimal"})
        n += 1
    print("rows linked to a stored PDF:", n)


if __name__ == "__main__":
    main()
