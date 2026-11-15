"""Create one login per role in a Supabase project and write each role's set-password link to a local file.

    python -I tools/make_accounts.py --email you@gmail.com --site https://tulasi-hms-proto.vercel.app

Accounts are you+psychiatrist@gmail.com, you+nurse@gmail.com, ... (Gmail delivers all of them to you).
Each account's role is stored in app_metadata.role, which the user cannot change; the database takes the role from it.
No password is set here: open each link, choose the password on the page. The links go to tools/invite-links.txt
(git-ignored); they work once and expire, so run the script again for fresh ones.

Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment or tools/.env.import.
"""
import json
import os
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
# link path -> account role (the floor coordinator link is hidden for now)
ROLES = [("psychiatrist", "psychiatrist"), ("psychologist", "psychologist"), ("nurse", "nurse"), ("rmo", "rmo"),
         ("floor-lead-psychiatrist", "floor-lead-psychiatrist"), ("floor-lead-psychologist", "floor-lead-psychologist"),
         ("patient-experience-lead", "patient-experience-lead")]


def env():
    vals = dict(os.environ)
    p = os.path.join(HERE, ".env.real" if "--real" in sys.argv else ".env.import")  # --real: the real-patient project
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.strip().split("=", 1)
                vals.setdefault(k.strip(), v.strip().strip('"'))
    return vals


def arg(name):
    if name in sys.argv:
        i = sys.argv.index(name)
        if i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return None


def call(url, key, method, path, body=None):
    req = urllib.request.Request(url + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            t = r.read().decode()
            return r.status, (json.loads(t) if t else {})
    except urllib.error.HTTPError as e:
        t = e.read().decode()
        try:
            return e.code, json.loads(t)
        except ValueError:
            return e.code, {"msg": t}


def main():
    base, site = arg("--email"), (arg("--site") or "").rstrip("/")
    if not base or "@" not in base or not site:
        sys.exit(__doc__)
    user, domain = base.split("@", 1)
    e = env()
    url, key = e.get("SUPABASE_URL"), e.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in tools/.env.import")
    out = []
    for path, role in ROLES:
        email = f"{user}+{path}@{domain}"
        redirect = f"{site}/{path}"
        st, res = call(url, key, "POST", "/auth/v1/admin/generate_link", {"type": "invite", "email": email, "redirect_to": redirect})
        kind = "invite"
        if st >= 300:  # the account exists already: a password-reset link instead
            st, res = call(url, key, "POST", "/auth/v1/admin/generate_link", {"type": "recovery", "email": email, "redirect_to": redirect})
            kind = "reset"
        if st >= 300:
            sys.exit(f"{path}: could not make a link (HTTP {st}): {res.get('msg') or res.get('error_description') or res}")
        uid = res.get("id") or (res.get("user") or {}).get("id")
        link = res.get("action_link") or (res.get("properties") or {}).get("action_link")
        st2, _ = call(url, key, "PUT", f"/auth/v1/admin/users/{uid}", {"app_metadata": {"role": role}, "email_confirm": True})
        if st2 >= 300:
            sys.exit(f"{path}: could not set the role (HTTP {st2})")
        out.append(f"{path}\t{email}\t{kind}\t{link}")
        print(f"{path}: account ready ({kind} link written)")
    p = os.path.join(HERE, "invite-links.txt")
    with open(p, "w", encoding="utf-8") as f:
        f.write("Open each link in a browser, choose the password, then sign in at the role's address.\n")
        f.write("Links work once and expire; run tools/make_accounts.py again for fresh ones.\n\n")
        f.write("\n".join(out) + "\n")
    print("links written to tools/invite-links.txt")


if __name__ == "__main__":
    main()
