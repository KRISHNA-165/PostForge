# Blog Platform API (server)

Express API powered by Supabase (Auth + DB).

## Setup
```
npm install
copy .env.example .env  # fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run dev             # http://localhost:5000
```

Optional: Create tables/policies in Supabase using `SCHEMA.sql` in this folder.

## Environment
- `PORT` (default 5000)
- `CLIENT_URL` (default http://localhost:5173)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Routes
Base URL: `/api`

### Auth `/api/auth`
- `POST /register` { email, password, name }
- `POST /login` { email, password }
- `POST /logout`
- `GET /me` Bearer token -> current user + profile

### Posts `/api/posts`
- `GET /` query: page, limit, search, author_id
- `GET /:id`
- `POST /` Bearer -> create { title, content, excerpt?, tags[], image_url? }
- `PUT /:id` Bearer -> update own
- `DELETE /:id` Bearer -> delete own
- `POST /:id/like` Bearer -> toggle like

### Comments `/api/comments`
- `GET /post/:postId`
- `POST /` Bearer -> { content, post_id, parent_id? }
- `PUT /:id` Bearer -> update own
- `DELETE /:id` Bearer -> delete own (and replies)

### Profiles `/api/profiles`
- `GET /:id`
- `PUT /:id` Bearer -> update own { name, bio, avatar_url }
- `GET /:id/posts` query: page, limit

### Bookmarks `/api/bookmarks`
- `GET /` query: user_id? (or inferred from token)
- `POST /:postId` Bearer -> add
- `DELETE /:postId` Bearer -> remove

### AI `/api/ai`
- `POST /suggest` { title?, content } -> Returns titles, outlines, excerpt suggestions

## Notes
- All protected routes require `Authorization: Bearer <access_token>` from Supabase Auth.
- CORS allows `CLIENT_URL`. Adjust in `index.js` for deployment.
