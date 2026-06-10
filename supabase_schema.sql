-- ═══════════════════════════════════════════════════════════
--  AllergyTrack – Supabase séma
--  Futtasd le a Supabase Dashboard → SQL Editor oldalon
-- ═══════════════════════════════════════════════════════════

-- ── profiles tábla ──────────────────────────────────────────
create table public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  display_name    text,
  avatar_url      text,
  bio             text,
  allergen_profile jsonb default '[]'::jsonb,
  app_settings    jsonb default '{}'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Row Level Security bekapcsolása
alter table public.profiles enable row level security;

-- Csak saját profil olvasható
create policy "Own profile select"
  on public.profiles for select
  using (auth.uid() = id);

-- Csak saját profil frissíthető
create policy "Own profile update"
  on public.profiles for update
  using (auth.uid() = id);

-- Csak saját profil szúrható be
create policy "Own profile insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Automatikus profil létrehozás regisztrációkor
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── updated_at automatikus frissítése ───────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
