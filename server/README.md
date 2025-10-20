memo-project server

Setup:

1. cd server
2. cp .env.example .env and edit values
3. npm install
4. npm run dev

Endpoints:

- GET / -> health
- POST /api/auth/register -> { username, password }
- POST /api/auth/login -> { username, password }
- GET /api/posts -> list posts
- POST /api/posts -> create post (auth required)
- POST /api/posts/:id/comments -> add comment (auth required)
