from datetime import datetime
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import HTTPException, status


def ensure_object_id(value: str, *, field: str = "id") -> ObjectId:
    try:
        return ObjectId(value)
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid {field}") from exc


def str_object_id(value: ObjectId) -> str:
    return str(value)


def isoformat(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def build_author_payload(user_doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not user_doc:
        return None
    return {
        "_id": str_object_id(user_doc["_id"]),
        "username": user_doc.get("username", ""),
    }
