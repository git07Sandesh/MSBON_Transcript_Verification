"""Public contact form endpoint.

No authentication: this is the only public-facing POST in the API. It
accepts the same payload the frontend ContactPage sends and currently
logs the message and returns 200. The capstone PoC does not persist these
messages or email anyone; that wiring is intentionally deferred.
"""
import asyncio
import logging
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactMessage(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    organization: Optional[str] = Field(default=None, max_length=200)
    message: str = Field(min_length=1, max_length=5000)
    is_state_board: bool = False


class ContactResponse(BaseModel):
    ok: bool = True


@router.post("", response_model=ContactResponse)
async def submit_contact(body: ContactMessage) -> ContactResponse:
    # Honest acknowledgement: log the inbound message so a developer can
    # eyeball the dev server output during the demo. No PII is persisted.
    logger.info(
        "Contact message received",
        extra={
            "name": body.name,
            "email": body.email,
            "organization": body.organization or "",
            "is_state_board": body.is_state_board,
            "message_length": len(body.message),
        },
    )
    # Small artificial delay so the frontend's "Sending…" state is visible.
    await asyncio.sleep(0.4)
    return ContactResponse(ok=True)
