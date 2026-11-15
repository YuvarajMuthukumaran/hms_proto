"""Set one password on every role login of a Supabase project. You type the password; it is not stored anywhere.

    python -I tools/set_passwords.py

Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from tools/.env.import (or the environment).
On the demo project (fmattgrlsgnfcvmxndkk, made-up patients only) any password of 6+ characters is accepted.
On any other project (real patient data) the password must be at least 10 characters.
"""
import getpass
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DEMO_REF = "fmattgrlsgnfcvmxndkk"


def env():
    vals = dict(os.environ)
    p = os.path.join(HERE, ".env.import")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.strip().split("=", 1)
                vals.setdefault(k.strip(), v.strip().strip('"'))
    return vals


def main():
    e = env()
    url, key = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in tools/.env.import")
    demo = DEMO_REF in url
    print("Project:", url, "(demo, made-up patients)" if demo else "(REAL patient data)")
    pw = getpass.getpass("Password for every role login: ")
    if pw != getpass.getpass("Type it again: "):
        sys.exit("The two passwords are not the same. Nothing changed.")
    if len(pw) < (6 if demo else 10):
        sys.exit("Too short: at least %d characters on this project. Nothing changed." % (6 if demo else 10))
    h = {"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"}
    users = json.load(urllib.request.urlopen(urllib.request.Request(url + "/auth/v1/admin/users?per_page=100", headers=h)))["users"]
    n = 0
    for u in users:
        role = (u.get("app_metadata") or {}).get("role")
        if not role:
            continue
        req = urllib.request.Request(url + "/auth/v1/admin/users/" + u["id"], method="PUT", headers=h,
                                     data=json.dumps({"password": pw, "email_confirm": True}).encode())
        urllib.request.urlopen(req)
        print("set:", role, "-", u["email"])
        n += 1
    print(n, "logins updated. Sign in at https://tulasi-hms-proto.vercel.app/<role> with the email shown.")


if __name__ == "__main__":
    main()
