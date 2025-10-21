from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .settings import settings


class Mongo:
    """Holds a singleton Motor client + database reference."""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


mongo = Mongo()


async def connect_to_mongo() -> None:
    if mongo.client:
        return
    mongo.client = AsyncIOMotorClient(settings.MONGO_URI)
    mongo.db = mongo.client.get_default_database()
    if mongo.db is None:
        mongo.db = mongo.client["memo-app"]


async def close_mongo_connection() -> None:
    if mongo.client:
        mongo.client.close()
    mongo.client = None
    mongo.db = None


async def get_db() -> AsyncIOMotorDatabase:
    if mongo.client is None or mongo.db is None:
        await connect_to_mongo()
    assert mongo.db is not None
    return mongo.db
