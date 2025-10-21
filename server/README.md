# FastAPI Backend

This folder contains the Python/FastAPI implementation of the memo backend.  
It replaces the original Express server but exposes the same REST contract so
the existing React client keeps working without any code changes.

## Features

- `POST /api/auth/register` – create accounts (bcrypt password hashing & JWT issuance)
- `POST /api/auth/login` – authenticate users and return JWT tokens
- `GET /api/posts` – list posts (descending by creation time)
- `POST /api/posts` – create a post (auth required)
- `PUT /api/posts/:id` – edit a post (author only)
- `DELETE /api/posts/:id` – delete a post (author only)
- `POST /api/posts/:id/comments` – add comments (auth required)
- `PUT /api/posts/:id/comments/:commentId` – edit comment (author only)
- `DELETE /api/posts/:id/comments/:commentId` – remove comment (author only)

MongoDB is accessed through Motor (async driver) and the data shape matches the
structure produced by the former Mongoose schemas.

## Getting Started

```bash
cd server
python -m venv .venv                 # optional but recommended
.venv\Scripts\activate               # Windows PowerShell
pip install -r requirements.txt
```

= Optional: seed the database with fake data using [Faker](https://faker.readthedocs.io/):

```bash
python scripts/seed.py
```

Create an `.env` file (optional) to override defaults:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/memo-app
JWT_SECRET=change_this_secret
```

Run the development server:

```bash
uvicorn app.main:app --reload --port 5000
```

The API is now available at `http://localhost:5000`. Point the React client at
this URL (e.g. `REACT_APP_API_URL=http://localhost:5000`) and everything will
work exactly as before.
