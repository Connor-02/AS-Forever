# AGENTS.md

## Goal
Build a deployable MVP engagement party photo-sharing app.

## Product summary
Guests scan a QR code and upload photos from their phone.
Hosts log into an admin page to view and manage uploads.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Routes
- `/` landing page
- `/upload` guest upload
- `/admin` protected gallery
- `/gallery` optional public gallery

## Database
Use a `photos` table with:
- id
- created_at
- file_path
- public_url
- guest_name
- caption
- approved

## Storage
Use bucket:
- `event-photos`

## Constraints
- Mobile first
- Clean and elegant UI
- MVP first
- Minimal dependencies
- Secure handling of env vars
- Validate images only
- Max upload size 10MB

## Admin
Use the simplest practical protection for MVP, ideally env-based password gate unless a better lightweight option is clearly preferable.

## Output expectations
Before coding:
1. inspect repo
2. give a short plan
3. implement fully
4. provide setup steps, SQL, envs, and deployment steps

## Code style
- clean names
- reusable components
- strong typing
- minimal comments
- no dead code