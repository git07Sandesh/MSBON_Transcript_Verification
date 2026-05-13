"""DEPRECATED. Authentication is now handled by Supabase Auth.

The frontend signs in directly with ``supabase.auth.signInWithPassword``;
the access token Supabase issues is verified by ``app.api.v1.dependencies.verify_token``
on every protected route. The local password store and the
``POST /api/v1/auth/login`` endpoint that this module previously exposed
are no longer reachable.

The router still exists so that an old client calling the old endpoint
gets a clear 410 Gone with a hint, instead of a confusing 404.
"""
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["auth"])


@router.post("/auth/login")
async def deprecated_login() -> None:
    raise HTTPException(
        status_code=410,
        detail={
            "success": False,
            "error": {
                "code": "LOGIN_MOVED",
                "message": "Sign-in has moved to Supabase Auth. "
                           "Use supabase.auth.signInWithPassword from the frontend.",
                "details": None,
            },
        },
    )
