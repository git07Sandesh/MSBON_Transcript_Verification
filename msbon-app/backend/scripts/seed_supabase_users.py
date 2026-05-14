"""One-off script: provision the three demo users in Supabase Auth.

Re-runnable. If a user already exists, their role is reset to the
expected value so the script is idempotent.

Run:
    cd msbon-app/backend
    source .venv/bin/activate
    python -m scripts.seed_supabase_users

The role is written to ``app_metadata.role`` (NOT user_metadata) per the
Supabase security checklist, only ``app_metadata`` is safe for
authorization decisions.
"""
from __future__ import annotations

import sys
from typing import Iterable

from supabase import Client, create_client

from app.config import settings


DEMO_USERS: list[dict[str, str]] = [
    {"email": "admin@msbon.local",     "password": "demo", "role": "admin"},
    {"email": "reviewer1@msbon.local", "password": "demo", "role": "reviewer"},
    {"email": "viewer1@msbon.local",   "password": "demo", "role": "viewer"},
]


def _admin_client() -> Client:
    if not settings.supabase_configured:
        raise SystemExit(
            "Supabase env vars are not all set. Need SUPABASE_URL, "
            "SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET."
        )
    # The admin (service-role) client bypasses RLS and unlocks the
    # GoTrue admin endpoints (create user with auto-confirmed email,
    # set app_metadata, etc.).
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _list_users(client: Client) -> Iterable[dict]:
    """Page through every user in the project."""
    page = 1
    per_page = 200
    while True:
        resp = client.auth.admin.list_users(page=page, per_page=per_page)
        users = resp if isinstance(resp, list) else getattr(resp, "users", [])
        if not users:
            break
        yield from users
        if len(users) < per_page:
            break
        page += 1


def upsert_demo_user(client: Client, email: str, password: str, role: str) -> str:
    existing = next((u for u in _list_users(client) if getattr(u, "email", None) == email), None)
    app_metadata = {"role": role, "provider": "email"}

    if existing is None:
        created = client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,        # skip the confirmation email, demo only
            "app_metadata": app_metadata,
        })
        user = getattr(created, "user", created)
        return f"created  {email}  → {user.id}  role={role}"

    # Already exists, make sure role is current and password still works.
    user_id = existing.id
    client.auth.admin.update_user_by_id(user_id, {
        "password": password,
        "app_metadata": app_metadata,
        "email_confirm": True,
    })
    return f"updated  {email}  → {user_id}  role={role}"


def main() -> int:
    client = _admin_client()
    print(f"Provisioning {len(DEMO_USERS)} demo users in {settings.supabase_url}\n")
    for u in DEMO_USERS:
        try:
            line = upsert_demo_user(client, u["email"], u["password"], u["role"])
            print(" ", line)
        except Exception as exc:
            print(f"  FAILED  {u['email']}: {exc}")
            return 1
    print("\nDone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
