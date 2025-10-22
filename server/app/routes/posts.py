from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from ..database import get_db
from ..dependencies import get_current_user
from ..utils import build_author_payload, ensure_object_id, isoformat, str_object_id

router = APIRouter(prefix="/api/posts", tags=["posts"])

VALID_CATEGORIES = {"game", "study", "dev"}


async def _collect_users(db, user_ids: Set[ObjectId]) -> Dict[ObjectId, Dict[str, Any]]:
    if not user_ids:
        return {}
    result: Dict[ObjectId, Dict[str, Any]] = {}
    async for doc in db["users"].find({"_id": {"$in": list(user_ids)}}):
        result[doc["_id"]] = doc
    return result


def _normalize_object_id(value: Any) -> ObjectId:
    if isinstance(value, ObjectId):
        return value
    return ObjectId(value)


def _normalize_category(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalized = value.strip().lower()
    if normalized in VALID_CATEGORIES:
        return normalized
    return None


async def _build_post_response(db, post: Dict[str, Any]) -> Dict[str, Any]:
    author_id = _normalize_object_id(post["author"])
    normalized_comments: List[Dict[str, Any]] = []
    user_ids: Set[ObjectId] = {author_id}
    for comment in post.get("comments", []):
        comment_author = _normalize_object_id(comment["author"])
        user_ids.add(comment_author)
        normalized_comments.append({**comment, "author": comment_author})

    users_map = await _collect_users(db, user_ids)

    def map_comment(c: Dict[str, Any]) -> Dict[str, Any]:
        author_doc = users_map.get(c["author"])
        return {
            "_id": str_object_id(c["_id"]),
            "id": str_object_id(c["_id"]),
            "content": c.get("content", ""),
            "author": build_author_payload(author_doc),
            "createdAt": isoformat(c.get("created_at") or c.get("createdAt")),
            "updatedAt": isoformat(c.get("updated_at") or c.get("updatedAt")),
        }

    author_doc = users_map.get(author_id)
    return {
        "_id": str_object_id(post["_id"]),
        "id": str_object_id(post["_id"]),
        "title": post.get("title", ""),
        "body": post.get("body", ""),
        "imageUrl": post.get("imageUrl"),
        "author": build_author_payload(author_doc),
        "createdAt": isoformat(post.get("created_at") or post.get("createdAt")),
        "updatedAt": isoformat(post.get("updated_at") or post.get("updatedAt")),
        "comments": [map_comment(c) for c in normalized_comments],
        "category": _normalize_category(post.get("category")),
        "views": post.get("views", 0),
        "likes": post.get("likes", 0),
        "dislikes": post.get("dislikes", 0),
    }


@router.get("/")
async def list_posts(db=Depends(get_db)):
    posts: List[Dict[str, Any]] = []
    async for post in db["posts"].find().sort("created_at", -1):
        posts.append(await _build_post_response(db, post))
    return posts


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: Dict[str, Any],
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    category = _normalize_category(payload.get("category"))
    title = (payload.get("title") or "").strip()
    body = (payload.get("body") or "").strip()
    image_url: Optional[str] = payload.get("imageUrl") or None
    if not title or not body:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing fields")

    now = datetime.utcnow()
    doc = {
        "author": current_user["_id"],
        "title": title,
        "body": body,
        "imageUrl": image_url,
        "comments": [],
        "likes": payload.get("likes", 0) or 0,
        "dislikes": payload.get("dislikes", 0) or 0,
        "views": payload.get("views", 0) or 0,
        "category": category,
        "created_at": now,
        "updated_at": now,
    }
    result = await db["posts"].insert_one(doc)
    inserted = await db["posts"].find_one({"_id": result.inserted_id})
    return await _build_post_response(db, inserted)


@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: str,
    payload: Dict[str, Any],
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = (payload.get("content") or "").strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing content")

    post_object_id = ensure_object_id(post_id, field="postId")
    comment_doc = {
        "_id": ObjectId(),
        "author": current_user["_id"],
        "content": content,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await db["posts"].update_one(
        {"_id": post_object_id},
        {"$push": {"comments": comment_doc}, "$set": {"updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    post = await db["posts"].find_one({"_id": post_object_id})
    return await _build_post_response(db, post)


@router.put("/{post_id}")
async def update_post(
    post_id: str,
    payload: Dict[str, Any],
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    post_object_id = ensure_object_id(post_id, field="postId")
    post = await db["posts"].find_one({"_id": post_object_id})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post["author"] != current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    updates: Dict[str, Any] = {}
    if "title" in payload and (payload["title"] or "").strip():
        updates["title"] = payload["title"].strip()
    if "body" in payload and (payload["body"] or "").strip():
        updates["body"] = payload["body"].strip()
    if "imageUrl" in payload:
        updates["imageUrl"] = payload["imageUrl"] or None
    if "category" in payload:
        updates["category"] = _normalize_category(payload.get("category"))

    if not updates:
        return await _build_post_response(db, post)

    updates["updated_at"] = datetime.utcnow()
    await db["posts"].update_one({"_id": post_object_id}, {"$set": updates})
    updated = await db["posts"].find_one({"_id": post_object_id})
    return await _build_post_response(db, updated)


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    post_object_id = ensure_object_id(post_id, field="postId")
    post = await db["posts"].find_one({"_id": post_object_id})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post["author"] != current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    await db["posts"].delete_one({"_id": post_object_id})
    return {"message": "Post deleted"}


@router.delete("/{post_id}/comments/{comment_id}")
async def delete_comment(
    post_id: str,
    comment_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    post_object_id = ensure_object_id(post_id, field="postId")
    comment_object_id = ensure_object_id(comment_id, field="commentId")

    post = await db["posts"].find_one({"_id": post_object_id})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment = next((c for c in post.get("comments", []) if c["_id"] == comment_object_id), None)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment["author"] != current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    await db["posts"].update_one(
        {"_id": post_object_id},
        {
            "$pull": {"comments": {"_id": comment_object_id}},
            "$set": {"updated_at": datetime.utcnow()},
        },
    )
    post = await db["posts"].find_one({"_id": post_object_id})
    return await _build_post_response(db, post)


@router.post("/{post_id}/views")
async def increment_post_views(post_id: str, db=Depends(get_db)):
    post_object_id = ensure_object_id(post_id, field="postId")
    updated = await db["posts"].find_one_and_update(
        {"_id": post_object_id},
        {"$inc": {"views": 1}, "$set": {"updated_at": datetime.utcnow()}},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return await _build_post_response(db, updated)


@router.put("/{post_id}/comments/{comment_id}")
async def update_comment(
    post_id: str,
    comment_id: str,
    payload: Dict[str, Any],
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    post_object_id = ensure_object_id(post_id, field="postId")
    comment_object_id = ensure_object_id(comment_id, field="commentId")
    content = (payload.get("content") or "").strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing content")

    post = await db["posts"].find_one({"_id": post_object_id})
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment = next((c for c in post.get("comments", []) if c["_id"] == comment_object_id), None)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment["author"] != current_user["_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    await db["posts"].update_one(
        {"_id": post_object_id, "comments._id": comment_object_id},
        {
            "$set": {
                "comments.$.content": content,
                "comments.$.updated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
        },
    )

    post = await db["posts"].find_one({"_id": post_object_id})
    return await _build_post_response(db, post)
