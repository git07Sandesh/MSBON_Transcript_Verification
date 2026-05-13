from enum import Enum
from typing import Callable
from fastapi import Depends, HTTPException
from app.api.v1.dependencies import verify_token


class Permission(str, Enum):
    MANAGE_PROGRAMS = "manage_programs"
    SUBMIT_REVIEW = "submit_review"
    VIEW_TRANSCRIPTS = "view_transcripts"
    EXPORT_AUDIT = "export_audit"
    UPLOAD_TRANSCRIPT = "upload_transcript"


ROLE_PERMISSIONS: dict[str, set[Permission]] = {
    "admin": {
        Permission.MANAGE_PROGRAMS,
        Permission.SUBMIT_REVIEW,
        Permission.VIEW_TRANSCRIPTS,
        Permission.EXPORT_AUDIT,
        Permission.UPLOAD_TRANSCRIPT,
    },
    "reviewer": {
        Permission.SUBMIT_REVIEW,
        Permission.VIEW_TRANSCRIPTS,
    },
    "viewer": {
        Permission.VIEW_TRANSCRIPTS,
    },
}


def require_permission(permission: Permission) -> Callable:
    """FastAPI dependency that checks the JWT token's role has the required permission."""
    async def _check(token: dict = Depends(verify_token)) -> None:
        role = token.get("role", "")
        allowed = ROLE_PERMISSIONS.get(role, set())
        if permission not in allowed:
            raise HTTPException(
                status_code=403,
                detail={"success": False, "error": {"code": "FORBIDDEN",
                         "message": "Insufficient permissions", "details": None}},
            )
    return _check
