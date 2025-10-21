import logging
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status

from ..database import get_db
from ..security import create_access_token, hash_password, verify_password
from ..utils import str_object_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(payload: Dict[str, Any], db=Depends(get_db)):
    logger.debug("register payload: %s", payload)
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing fields")

    users = db["users"]
    existing = await users.find_one({"username": username})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username taken")

    now = datetime.utcnow()
    try:
        result = await users.insert_one(
            {
                "username": username,
                "password": hash_password(password),
                "created_at": now,
                "updated_at": now,
            }
        )
    except Exception as exc:  # pragma: no cover - runtime safeguard
        logger.exception("Failed to register user")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error") from exc

    user_id = result.inserted_id
    token = create_access_token({"id": str_object_id(user_id)})
    return {"user": {"id": str_object_id(user_id), "username": username}, "token": token}


@router.post("/login")
async def login(payload: Dict[str, Any], db=Depends(get_db)):
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing fields")

    users = db["users"]
    user = await users.find_one({"username": username})
    logger.debug("login attempt for %s: %s", username, "found" if user else "not found")
    if not user or not verify_password(password, user["password"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")

    token = create_access_token({"id": str_object_id(user["_id"])})
    return {"user": {"id": str_object_id(user["_id"]), "username": user["username"]}, "token": token}
