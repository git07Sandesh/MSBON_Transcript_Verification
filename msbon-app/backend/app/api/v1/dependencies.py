"""FastAPI auth dependencies.

Validates Supabase access tokens. Newer Supabase projects sign access
tokens with **ES256** (asymmetric), not the legacy HS256 + shared secret.
We verify by:

1. Fetching the project's JWKS once and caching it in-process.
2. Reading ``kid`` from the incoming token's header.
3. Looking up the matching JWK and decoding with ``python-jose``.
4. If ``kid`` is missing from the cache (key rotation), refresh once.

For older projects still using HS256 we fall back to ``SUPABASE_JWT_SECRET``.

Per the Supabase security checklist, our app role lives in
``app_metadata.role`` — never ``user_metadata`` (which is user-editable).
The token's top-level ``role`` claim is the Postgres role
(``authenticated``/``anon``), unrelated to our RBAC.
"""
from __future__ import annotations

import logging
from threading import Lock
from typing import Any

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError

from app.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

SUPABASE_AUDIENCE = "authenticated"
_JWKS_CACHE: dict[str, dict[str, Any]] = {}
_JWKS_LOCK = Lock()


def _jwks_url() -> str:
    return f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"


def _refresh_jwks() -> None:
    """Pull the project's current JWKS into the in-process cache, keyed by kid."""
    with _JWKS_LOCK:
        try:
            resp = httpx.get(_jwks_url(), timeout=5.0)
            resp.raise_for_status()
            keys = resp.json().get("keys", [])
            _JWKS_CACHE.clear()
            for k in keys:
                if k.get("kid"):
                    _JWKS_CACHE[k["kid"]] = k
            logger.info("Refreshed Supabase JWKS, %d keys cached", len(_JWKS_CACHE))
        except Exception as exc:
            logger.warning("Failed to refresh Supabase JWKS: %s", exc)


def _get_key(kid: str) -> dict[str, Any] | None:
    if kid not in _JWKS_CACHE:
        _refresh_jwks()
    return _JWKS_CACHE.get(kid)


def _decode_es256(token: str, header: dict[str, Any]) -> dict[str, Any]:
    kid = header.get("kid")
    if not kid:
        raise HTTPException(status_code=401, detail="Token has no kid")
    key = _get_key(kid)
    if not key:
        raise HTTPException(status_code=401, detail="Unknown signing key")
    return jwt.decode(
        token,
        key,
        algorithms=["ES256"],
        audience=SUPABASE_AUDIENCE,
        options={"verify_iss": False},
    )


def _decode_hs256(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        settings.supabase_jwt_secret or settings.jwt_secret,
        algorithms=["HS256"],
        audience=SUPABASE_AUDIENCE,
        options={"verify_iss": False},
    )


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=401,
        detail={"success": False, "error": {"code": "UNAUTHORIZED",
                 "message": message, "details": None}},
    )


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate a Supabase access token. Returns the decoded payload with a
    flattened top-level ``role`` (sourced from ``app_metadata.role``) so
    existing RBAC code can keep using ``token.get("role")``.
    """
    token = credentials.credentials
    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        raise _unauthorized("Malformed token")

    alg = header.get("alg", "")
    try:
        if alg == "ES256":
            payload = _decode_es256(token, header)
        elif alg == "HS256":
            payload = _decode_hs256(token)
        else:
            raise _unauthorized(f"Unsupported alg: {alg}")
    except ExpiredSignatureError:
        raise _unauthorized("Token expired")
    except JWTError:
        raise _unauthorized("Invalid token")

    # NEVER read role from user_metadata — that's user-editable.
    app_meta = payload.get("app_metadata") or {}
    payload["role"] = app_meta.get("role", "viewer")
    return payload
