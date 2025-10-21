"""Seed the MongoDB database with fake users, posts, and comments."""

import asyncio
import os
import sys
from datetime import datetime, timedelta

from bson import ObjectId
from faker import Faker
from motor.motor_asyncio import AsyncIOMotorClient

# Resolve repository/server paths so imports work regardless of cwd
SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

ENV_PATH = os.path.join(SERVER_DIR, ".env")
if os.path.exists(ENV_PATH):
    from dotenv import load_dotenv  # noqa: E402

    load_dotenv(ENV_PATH)

from app.security import hash_password  # noqa: E402
from app.settings import settings  # noqa: E402


fake = Faker()


async def seed(count_users: int = 5, posts_per_user: int = 4, comments_per_post: int = 3):
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.get_default_database()
    if db is None:
        db = client["memo-app"]

    users_collection = db["users"]
    posts_collection = db["posts"]

    print("Clearing existing data…")
    await users_collection.delete_many({})
    await posts_collection.delete_many({})

    user_ids = []

    print(f"Creating {count_users} users…")
    for _ in range(count_users):
        username = fake.unique.user_name()
        password = hash_password("password123")
        now = datetime.utcnow()
        result = await users_collection.insert_one(
            {
                "username": username,
                "password": password,
                "created_at": now,
                "updated_at": now,
            }
        )
        user_ids.append(result.inserted_id)

    print("Creating posts and comments…")
    for author_id in user_ids:
        for _ in range(posts_per_user):
            created_at = datetime.utcnow() - timedelta(days=fake.random_int(min=0, max=30))
            post_id = ObjectId()
            comments = []
            for _ in range(comments_per_post):
                commenter = fake.random_element(user_ids)
                comment_time = created_at + timedelta(hours=fake.random_int(min=1, max=48))
                comments.append(
                    {
                        "_id": ObjectId(),
                        "author": commenter,
                        "content": fake.sentence(nb_words=18),
                        "created_at": comment_time,
                        "updated_at": comment_time,
                    }
                )

            await posts_collection.insert_one(
                {
                    "_id": post_id,
                    "author": author_id,
                    "title": fake.sentence(nb_words=6),
                    "body": "\n\n".join(fake.paragraphs(nb=3)),
                    "imageUrl": fake.image_url(width=960, height=540),
                    "likes": fake.random_int(min=0, max=150),
                    "dislikes": fake.random_int(min=0, max=30),
                    "comments": comments,
                    "created_at": created_at,
                    "updated_at": created_at,
                }
            )

    print("Seeding complete!"
          "\nLogin with any generated username and password 'password123'.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
