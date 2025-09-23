-- Supabase schema for Event Blog Platform
-- Run in Supabase SQL editor

create table if not exists public.profiles (
  id uuid primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  excerpt text,
  tags text[] default '{}',
  image_url text,
  author_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_title_trgm_idx on public.posts using gin (title gin_trgm_ops);
create index if not exists posts_content_trgm_idx on public.posts using gin (content gin_trgm_ops);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_parent_id_idx on public.comments(parent_id);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);
create index if not exists likes_post_id_idx on public.likes(post_id);
create index if not exists likes_user_id_idx on public.likes(user_id);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);
create index if not exists bookmarks_post_id_idx on public.bookmarks(post_id);
create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);

-- Enable row level security (adjust policies to your needs)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;

-- Basic policies (public read, owner write). Tune for production.
create policy if not exists "profiles_read_all" on public.profiles for select using (true);
create policy if not exists "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy if not exists "posts_read_all" on public.posts for select using (true);
create policy if not exists "posts_insert_auth" on public.posts for insert with check (auth.uid() = author_id);
create policy if not exists "posts_update_own" on public.posts for update using (auth.uid() = author_id);
create policy if not exists "posts_delete_own" on public.posts for delete using (auth.uid() = author_id);

create policy if not exists "comments_read_all" on public.comments for select using (true);
create policy if not exists "comments_insert_auth" on public.comments for insert with check (auth.uid() = user_id);
create policy if not exists "comments_update_own" on public.comments for update using (auth.uid() = user_id);
create policy if not exists "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

create policy if not exists "likes_read_all" on public.likes for select using (true);
create policy if not exists "likes_mutate_auth" on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "bookmarks_read_all" on public.bookmarks for select using (true);
create policy if not exists "bookmarks_mutate_auth" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
