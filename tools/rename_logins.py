"""Give every role login a role address (psychiatrist@tulasi-portal.example, nurse@..., ...) so the sign-in page needs only
the password: the page works out the address from the role link. Passwords and roles are not changed.

    python -I tools/rename_logins.py            # demo project (tools/.env.import)
    python -I tools/rename_logins.py --real     # real project (tools/.env.real)

.example is a reserved domain: no one can own it and no mail is sent there. A forgotten password is reset with
tools/set_passwords.py, not by email.
"""
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DOMAIN = "tulasi-portal.example"


def env():
    vals = dict(os.environ)
    p = os.path.join(HERE, ".env.real" if "--real" in sys.argv else ".env.import")
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
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    h = {"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"}
    users = json.load(urllib.request.urlopen(urllib.request.Request(url + "/auth/v1/admin/users?per_page=100", headers=h)))["users"]
    for u in users:
        role = (u.get("app_metadata") or {}).get("role")
        if not role:
            continue
        new = f"{role}@{DOMAIN}"
        if u.get("email") == new:
            print("already:", new)
            continue
        req = urllib.request.Request(url + "/auth/v1/admin/users/" + u["id"], method="PUT", headers=h,
                                     data=json.dumps({"email": new, "email_confirm": True}).encode())
        urllib.request.urlopen(req)
        print("renamed:", role, "->", new)


if __name__ == "__main__":
    main()
