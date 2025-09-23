# Event Blog App

Monorepo with:
- Backend API: Node.js (Express) + Supabase (Auth + DB). Prisma optional.
- Web: React + Vite + Redux Toolkit + SCSS + SEO (react-helmet-async) + Rich text (React Quill).
- Mobile: Flutter (GetX) skeleton with API integration (scaffold provided).

## Quickstart

### Prerequisites
- Node.js 18+
- npm 9+
- Optional: Supabase project (URL + Service Role Key)
- Optional: Flutter 3.22+ (for mobile)

### 1) Backend API (server)
```
cd server
npm install
copy .env.example .env  # create and fill values
npm run dev             # starts on http://localhost:5000
```

`.env.example`:
```
PORT=5000
CLIENT_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2) Web app
```
cd .
npm install
npm run dev:client      # http://localhost:5173
```

### 3) Mobile (Flutter)
If Flutter is installed:
```
cd mobile
flutter create .
flutter pub add get http shared_preferences flutter_widget_from_html
flutter run
```
If Flutter is not available, use the web app for evaluation; mobile instructions are provided.

## Features
- Authentication: email/password via Supabase Auth, JWT session handling
- Blog CRUD: create, read, update, delete own posts; images, tags
- Feed, post detail, profile with user’s posts
- Search by title/content, pagination
- Likes and bookmarks
- Comments and replies
- Rich text editor (web)
- SEO via `react-helmet-async`
- AI content suggestions endpoint (`/api/ai/suggest`)

## Scripts
- Root: `npm run dev:client` (web)
- Server: `npm run dev` (API)

## AI Usage
- Used AI to scaffold routes, React pages, Redux slices, and boilerplate.
- Prompts: task breakdowns, schema-first API, iterative diff edits, validation with zod.

## Notes
- Ensure Supabase tables: `profiles`, `posts`, `comments`, `likes`, `bookmarks`.
- Environment variables must be set for auth.
