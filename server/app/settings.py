import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Runtime configuration loaded from environment variables."""

    APP_NAME = "Memo FastAPI"
    APP_VERSION = "0.1.0"

    PORT = int(os.getenv("PORT", "5000"))
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/memo-app")
    JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRE_DELTA = timedelta(days=7)


settings = Settings()
