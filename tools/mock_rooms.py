"""Temporary MOCK rooms for the admitted patients, until the real rooms are recorded.

    python -I tools/mock_rooms.py --real --apply     # give every admitted patient WITHOUT a room a mock room
    python -I tools/mock_rooms.py --real --undo      # remove every mock room again (only the ones this script wrote)

Rooms look like "101 A (temp)": the "(temp)" stays visible on every screen so nobody mistakes it for the real room. Males get rooms 101 and up,
females 201 and up, two beds (A, B) per room, in a stable order. Each patient that gets one is flagged 'mock room' in patients.flags, which is how
--undo finds them. A patient who already has a real room is never touched. A copy of the affected rows (id, room, flags only) is saved before --apply.
Prints counts only.
"""
import importlib.util
import json
import os
import sys
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
FLAG = "mock room"
SUFFIX = ""   # 16 Nov: the owner asked for no "(temp)" on screen; the flag "mock room" still marks these rooms for --undo


def main():
    if "--real" not in sys.argv or not ("--apply" in sys.argv or "--undo" in sys.argv):
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
        rows = call("GET", "patients?select=id,flags&flags=cs.%7B%22" + urllib.parse.quote(FLAG) + "%22%7D&limit=2000")
        for r in rows:
            call("PATCH", "patients?id=eq." + r["id"], {"room": None, "flags": [f for f in (r.get("flags") or []) if f != FLAG]}, "return=minimal")
        print("mock rooms removed:", len(rows))
        return

    rows = call("GET", "patients?select=id,sex,room,flags&status=eq.admitted&order=id&limit=1000")
    todo = [r for r in rows if not (r.get("room") or "").strip()]
    bdir = os.path.join(HERE, "..", "..", "backups", "real-before-mock-rooms-2026-11-16")
    os.makedirs(bdir, exist_ok=True)
    json.dump([{"id": r["id"], "room": r.get("room"), "flags": r.get("flags")} for r in rows], open(os.path.join(bdir, "patients_rooms.json"), "w"))
    n = {"M": 0, "F": 0}
    for r in todo:
        g = "F" if r.get("sex") == "F" else "M"
        i = n[g]
        n[g] += 1
        room = (301 if g == "F" else 201) + i // 2
        label = f"{room} {'AB'[i % 2]}{SUFFIX}"
        flags = list(r.get("flags") or [])
        if FLAG not in flags:
            flags.append(FLAG)
        call("PATCH", "patients?id=eq." + r["id"], {"room": label, "flags": flags}, "return=minimal")
    print(json.dumps({"admitted": len(rows), "already had a room": len(rows) - len(todo), "mock rooms given": len(todo),
                      "male rooms": (n["M"] + 1) // 2, "female rooms": (n["F"] + 1) // 2}))


if __name__ == "__main__":
    main()
