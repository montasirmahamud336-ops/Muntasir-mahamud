-- CMS core schema for custom admin panel
-- Run this in Supabase SQL editor

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'cms_status'
      and n.nspname = 'public'
  ) then
    create type public.cms_status as enum ('draft', 'published');
  end if;
end
$$;

create table if not exists public.cms_admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  username text unique not null,
  email text unique not null,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  seo_title text,
  meta_description text,
  status public.cms_status not null default 'draft',
  page_type text not null default 'custom' check (page_type in ('system', 'custom')),
  template_key text,
  use_builder boolean not null default false,
  content jsonb not null default '{"sections":[]}'::jsonb,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_pages_slug_valid check (slug ~ '^[a-z0-9]+(?:[\/-][a-z0-9]+)*$')
);

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text unique not null,
  mime_type text,
  file_size integer,
  width integer,
  height integer,
  alt_text text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_photo_media_id uuid references public.cms_media(id) on delete set null,
  client_photo_url text,
  review_text text not null,
  rating integer not null check (rating between 1 and 5),
  status public.cms_status not null default 'draft',
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cms_admin_users_updated_at on public.cms_admin_users;
create trigger trg_cms_admin_users_updated_at
before update on public.cms_admin_users
for each row execute function public.set_updated_at();

drop trigger if exists trg_cms_pages_updated_at on public.cms_pages;
create trigger trg_cms_pages_updated_at
before update on public.cms_pages
for each row execute function public.set_updated_at();

drop trigger if exists trg_cms_media_updated_at on public.cms_media;
create trigger trg_cms_media_updated_at
before update on public.cms_media
for each row execute function public.set_updated_at();

drop trigger if exists trg_cms_testimonials_updated_at on public.cms_testimonials;
create trigger trg_cms_testimonials_updated_at
before update on public.cms_testimonials
for each row execute function public.set_updated_at();

drop trigger if exists trg_cms_settings_updated_at on public.cms_settings;
create trigger trg_cms_settings_updated_at
before update on public.cms_settings
for each row execute function public.set_updated_at();

create or replace function public.is_cms_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.cms_admin_users a
    where a.auth_user_id = user_id and a.is_active = true
  );
$$;

alter table public.cms_admin_users enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_testimonials enable row level security;
alter table public.cms_settings enable row level security;

-- Admin users lookup for username/password login mapping
drop policy if exists "cms_admin_lookup" on public.cms_admin_users;
create policy "cms_admin_lookup"
on public.cms_admin_users
for select
using (is_active = true);

drop policy if exists "cms_admin_manage_admin_users" on public.cms_admin_users;
create policy "cms_admin_manage_admin_users"
on public.cms_admin_users
for all
using (public.is_cms_admin(auth.uid()))
with check (public.is_cms_admin(auth.uid()));

drop policy if exists "cms_admin_bootstrap_first_user" on public.cms_admin_users;
create policy "cms_admin_bootstrap_first_user"
on public.cms_admin_users
for insert
with check (
  auth.uid() = auth_user_id
  and not exists (select 1 from public.cms_admin_users)
);

-- Pages
drop policy if exists "public_read_published_pages" on public.cms_pages;
create policy "public_read_published_pages"
on public.cms_pages
for select
using (status = 'published');

drop policy if exists "admin_read_all_pages" on public.cms_pages;
create policy "admin_read_all_pages"
on public.cms_pages
for select
using (public.is_cms_admin(auth.uid()));

drop policy if exists "admin_manage_pages" on public.cms_pages;
create policy "admin_manage_pages"
on public.cms_pages
for all
using (public.is_cms_admin(auth.uid()))
with check (public.is_cms_admin(auth.uid()));

-- Testimonials
drop policy if exists "public_read_published_testimonials" on public.cms_testimonials;
create policy "public_read_published_testimonials"
on public.cms_testimonials
for select
using (status = 'published' and deleted_at is null);

drop policy if exists "admin_read_all_testimonials" on public.cms_testimonials;
create policy "admin_read_all_testimonials"
on public.cms_testimonials
for select
using (public.is_cms_admin(auth.uid()));

drop policy if exists "admin_manage_testimonials" on public.cms_testimonials;
create policy "admin_manage_testimonials"
on public.cms_testimonials
for all
using (public.is_cms_admin(auth.uid()))
with check (public.is_cms_admin(auth.uid()));

-- Media
drop policy if exists "public_read_media" on public.cms_media;
create policy "public_read_media"
on public.cms_media
for select
using (true);

drop policy if exists "admin_manage_media" on public.cms_media;
create policy "admin_manage_media"
on public.cms_media
for all
using (public.is_cms_admin(auth.uid()))
with check (public.is_cms_admin(auth.uid()));

-- Settings
drop policy if exists "public_read_public_settings" on public.cms_settings;
create policy "public_read_public_settings"
on public.cms_settings
for select
using (setting_key like 'public_%');

drop policy if exists "admin_manage_settings" on public.cms_settings;
create policy "admin_manage_settings"
on public.cms_settings
for all
using (public.is_cms_admin(auth.uid()))
with check (public.is_cms_admin(auth.uid()));

-- Storage bucket for CMS media
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

drop policy if exists "public_read_cms_media_objects" on storage.objects;
create policy "public_read_cms_media_objects"
on storage.objects
for select
using (bucket_id = 'cms-media');

drop policy if exists "admin_upload_cms_media_objects" on storage.objects;
create policy "admin_upload_cms_media_objects"
on storage.objects
for insert
with check (bucket_id = 'cms-media' and public.is_cms_admin(auth.uid()));

drop policy if exists "admin_update_cms_media_objects" on storage.objects;
create policy "admin_update_cms_media_objects"
on storage.objects
for update
using (bucket_id = 'cms-media' and public.is_cms_admin(auth.uid()));

drop policy if exists "admin_delete_cms_media_objects" on storage.objects;
create policy "admin_delete_cms_media_objects"
on storage.objects
for delete
using (bucket_id = 'cms-media' and public.is_cms_admin(auth.uid()));

-- Seed system pages (keeps existing website pages editable from CMS)
insert into public.cms_pages (title, slug, seo_title, meta_description, status, page_type, template_key, use_builder)
values
  ('Home', 'home', 'Home', 'Home page', 'published', 'system', 'home', false),
  ('About', 'about', 'About', 'About page', 'published', 'system', 'about', false),
  ('Services', 'services', 'Services', 'Services page', 'published', 'system', 'services', false),
  ('Portfolio', 'portfolio', 'Portfolio', 'Portfolio page', 'published', 'system', 'portfolio', false),
  ('Reviews', 'reviews', 'Reviews', 'Reviews page', 'published', 'system', 'reviews', false),
  ('Contact', 'contact', 'Contact', 'Contact page', 'published', 'system', 'contact', false),
  ('Get Started', 'get-started', 'Get Started', 'Start your project', 'published', 'system', 'get-started', false),
  ('Engineering Drawings', 'services/engineering-drawings', 'Engineering Drawings', 'Engineering drawings service', 'published', 'system', 'services-engineering-drawings', false),
  ('Web Development', 'services/web-development', 'Web Development', 'Web development service', 'published', 'system', 'services-web-development', false),
  ('Graphic Design', 'services/graphic-design', 'Graphic Design', 'Graphic design service', 'published', 'system', 'services-graphic-design', false),
  ('Video Editing', 'services/video-editing', 'Video Editing', 'Video editing service', 'published', 'system', 'services-video-editing', false)
on conflict (slug) do nothing;

insert into public.cms_settings (setting_key, setting_value)
values
  ('public_site_name', '"Muhammad Muntasir Mahmud"'::jsonb),
  ('public_default_seo_title', '"Muhammad Muntasir Mahmud - Portfolio"'::jsonb),
  ('public_default_meta_description', '"Technical and creative freelancer portfolio website."'::jsonb)
on conflict (setting_key) do nothing;
