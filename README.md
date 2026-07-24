# Dev Portfolio Feed

A social feed where developers post projects — title, description, code snippets, and demo videos — and the community can like and comment. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Stack

- **Next.js 14** (App Router, Server Components, Server Actions)
- **Supabase** — Postgres database + Auth (email/password)
- **Tailwind CSS** + **shadcn/ui**
- Deploy target: **Vercel**

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). This creates the `users`, `posts`, `comments`, and `likes` tables, a trigger that populates `users` on signup, and Row Level Security policies.
3. Also run [`supabase/storage.sql`](supabase/storage.sql) (avatar upload bucket + RLS) and [`supabase/follows.sql`](supabase/follows.sql) (follow/unfollow table + RLS).
4. In **Project Settings → API**, copy the **Project URL** and **anon public** key.
5. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` (and your production URL's `/auth/callback` once deployed) as a redirect URL.

## 2. Configure environment variables

Copy the example file and fill in your Supabase values:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The feed (`/`) requires a session — logged-out visitors are redirected to `/login`. Sign up, confirm the email Supabase sends (or disable email confirmation in **Authentication → Providers → Email** for faster local testing), then log in and create a post.

## Project structure

```
src/app/
  page.tsx                 Feed (auth-gated, paginated 10/page, All/Following tabs)
  login/, signup/           Auth pages
  auth/actions.ts           Sign up / log in / log out server actions
  auth/callback/route.ts    Email confirmation callback
  posts/new/                Create post form
  posts/[id]/edit/          Edit post form (author-only)
  posts/actions.ts          Create/update/delete post, like/unlike, comment, delete comment
  profile/[id]/             Public profile + own-profile editor (name/bio/avatar/follow)
  profile/actions.ts        Update profile + avatar upload server action
  follows/actions.ts        Follow/unfollow server action
src/components/
  navbar.tsx, post-card.tsx, like-button.tsx, comment-section.tsx,
  video-embed.tsx, delete-post-button.tsx, follow-button.tsx
  ui/                       shadcn/ui components
src/lib/
  supabase/{client,server,middleware}.ts   Supabase client factories
  database.types.ts         Hand-written types matching supabase/schema.sql
supabase/schema.sql          Database schema + RLS policies
supabase/storage.sql         Avatar storage bucket + RLS policies
supabase/follows.sql         Follow/unfollow table + RLS policies
```

`video_url` accepts a YouTube, YouTube Shorts, or Vimeo link (embedded automatically) or a direct `.mp4`/`.webm`/`.ogg` file; anything else renders as a link.

Post authors get Edit/Delete controls on their own posts (delete is confirmed via a dialog), and comment authors get a delete (×) on their own comments — both enforced by RLS server-side, not just hidden in the UI.

Profiles show a Follow/Unfollow button (except your own) and follower/following counts. The feed has an "All" tab (everyone) and a "Following" tab (only people you follow), with an empty-state prompt if you're not following anyone yet.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in [Vercel](https://vercel.com/new).
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the Vercel project settings.
4. In Supabase **Authentication → URL Configuration**, add `https://<your-vercel-domain>/auth/callback` as a redirect URL.
5. Deploy.

## Not in this MVP

OAuth login, infinite-scroll (pagination is page-number based, not scroll-triggered), video uploads (video is a URL field only — avatars support file upload via Supabase Storage), notifications, and follower/following list pages (counts only, no clickable list yet).
