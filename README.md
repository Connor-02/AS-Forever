# Engagement Party Media Platform

A mobile-first MVP for collecting engagement party photos and videos in real time.

Guests scan a QR code, upload media from their phone camera or gallery, and hosts manage everything from a protected admin page.

## Why This Project

This platform is designed for events where guests need a simple, no-friction upload experience and hosts need a lightweight dashboard to review and manage photos.

## Core Experience

### Guest Flow

- Scan event QR code
- Open `/upload`
- Take a photo, record a video, or choose multiple media files from gallery
- Optionally add name and caption
- Upload with progress feedback and success/error states

### Host Flow

- Open `/admin`
- Sign in with env-based admin password
- View all uploads (newest first)
- Delete uploads (removes storage object + database record)

### Public Gallery (Optional)

- `/gallery` displays all uploaded media in a view-only format

## Routes

- `/` landing page
- `/upload` guest upload page
- `/admin` protected host gallery
- `/gallery` public shared gallery

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Storage)
- Vercel deployment

## Data Model

Table: `photos`

- `id`
- `created_at`
- `file_path`
- `public_url`
- `guest_name`
- `caption`
- `approved`

Storage bucket: `event-photos`

Use this bucket as **private** so files are not directly downloadable via public URLs.

## Supabase Setup

1. Run SQL in [`supabase/schema.sql`](./supabase/schema.sql).
2. Create a private Storage bucket named `event-photos`.
3. Add a storage policy allowing `service_role` to manage objects in `event-photos`.

The app handles viewing through short-lived signed URLs and keeps original file downloads on admin-only routes.

Upload limits:
- Images: up to 10MB each
- Videos: up to 50MB each

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/upload`
- `http://localhost:3000/admin`
- `http://localhost:3000/gallery`

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add all required env vars in Vercel project settings.
4. Deploy.
5. Set `NEXT_PUBLIC_SITE_URL` to your production domain.

## QR Code

Create a QR code pointing to:

```text
https://your-domain.com/upload
```

Place it at the event so guests can upload instantly.
