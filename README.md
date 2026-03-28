# Engagement Party Platform MVP

Deployable photo-sharing MVP built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## Features

- Guest upload flow at `/upload` (camera or gallery)
- File validation (images only, max 10MB)
- Upload progress UI
- Metadata storage in Supabase Postgres (`photos` table)
- Image storage in Supabase Storage bucket (`event-photos`)
- Password-protected host admin at `/admin`
- Admin photo deletion (removes storage object + DB row)
- Optional public gallery at `/gallery`
- Mobile-first responsive UI

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (DB + Storage)
- Vercel-ready

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Populate `.env.local` values from Supabase and your admin secrets.

4. Run app:

```bash
npm run dev
```

5. Open:

- `http://localhost:3000`
- `http://localhost:3000/upload`
- `http://localhost:3000/admin`
- `http://localhost:3000/gallery`

## Required Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

ADMIN_PASSWORD=change_this_to_a_strong_password
ADMIN_SESSION_SECRET=change_this_to_a_long_random_secret
```

## Supabase SQL (Table + Policies)

Run the SQL from [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.

### SQL Preview

```sql
create extension if not exists "pgcrypto";

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  file_path text not null unique,
  public_url text not null,
  guest_name text,
  caption text,
  approved boolean not null default true
);

create index if not exists photos_created_at_idx on public.photos (created_at desc);
create index if not exists photos_approved_idx on public.photos (approved);

alter table public.photos enable row level security;

drop policy if exists "service role full access photos" on public.photos;
create policy "service role full access photos"
  on public.photos
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "public read approved photos" on public.photos;
create policy "public read approved photos"
  on public.photos
  for select
  using (approved = true);
```

## Supabase Storage Setup

1. In Supabase Dashboard, create a bucket named `event-photos`.
2. Set bucket visibility to `Public` (needed for `public_url` image rendering).
3. Add storage policies (SQL editor):

```sql
-- Service role can manage all files in event-photos
drop policy if exists "service role full access event photos" on storage.objects;
create policy "service role full access event photos"
on storage.objects
for all
to public
using (
  bucket_id = 'event-photos' and auth.role() = 'service_role'
)
with check (
  bucket_id = 'event-photos' and auth.role() = 'service_role'
);
```

This app uploads/deletes via server-side route handlers using `SUPABASE_SERVICE_ROLE_KEY`.

## Deploy to Vercel

1. Push project to GitHub.
2. Import repository into Vercel.
3. Set all environment variables from `.env.example` in Vercel Project Settings.
4. Deploy.

Recommended:

- Set `NEXT_PUBLIC_SITE_URL` to your production URL (for QR generation/use).
- Use a strong `ADMIN_PASSWORD` and long random `ADMIN_SESSION_SECRET`.

## QR Code Usage

Generate a QR code that points to:

```text
https://your-production-domain.com/upload
```

Print it at the venue so guests can scan and upload quickly.
