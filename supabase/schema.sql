-- Dev Portfolio Feed — schema + RLS policies
-- Run this in the Supabase SQL editor (or `supabase db push` with the CLI).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  code_snippet text,
  video_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists likes_post_id_idx on public.likes (post_id);
create index if not exists likes_user_id_idx on public.likes (user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a public.users row whenever someone signs up via Supabase Auth
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

-- users: profiles are publicly readable; a user may only edit their own row
create policy "Users are publicly readable" on public.users
  for select using (true);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- posts: publicly readable; only the author can insert/update/delete their own
create policy "Posts are publicly readable" on public.posts
  for select using (true);

create policy "Authenticated users can create posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Authors can update their own posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "Authors can delete their own posts" on public.posts
  for delete using (auth.uid() = user_id);

-- comments: publicly readable; only the author can insert/delete their own
create policy "Comments are publicly readable" on public.comments
  for select using (true);

create policy "Authenticated users can comment" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Authors can delete their own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- likes: publicly readable; only the liker can insert/delete their own
create policy "Likes are publicly readable" on public.likes
  for select using (true);

create policy "Authenticated users can like posts" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "Users can remove their own like" on public.likes
  for delete using (auth.uid() = user_id);
