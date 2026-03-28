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
