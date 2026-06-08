-- ═══════════════════════════════════════════════════════════════════
-- Room Expense Tracker — Supabase SQL Schema (v2 with password)
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- If you already ran v1, just run the ALTER TABLE line below.
-- ═══════════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ── rooms ────────────────────────────────────────────────────────────
create table if not exists rooms (
  id            uuid primary key default uuid_generate_v4(),
  code          text not null unique,
  password_hash text not null default '',
  notes         text default '',
  created_at    timestamptz default now()
);

-- If you already have the table from v1, just add the column:
-- ALTER TABLE rooms ADD COLUMN IF NOT EXISTS password_hash text not null default '';

-- ── roommates ─────────────────────────────────────────────────────────
create table if not exists roommates (
  id          uuid primary key default uuid_generate_v4(),
  room_id     uuid not null references rooms(id) on delete cascade,
  name        text not null,
  created_at  timestamptz default now(),
  unique(room_id, name)
);

-- ── expenses ──────────────────────────────────────────────────────────
create table if not exists expenses (
  id           uuid primary key default uuid_generate_v4(),
  room_id      uuid not null references rooms(id) on delete cascade,
  date         date not null,
  amount       numeric(12,2) not null,
  description  text not null,
  paid_by      text not null,
  split_among  text[] not null default '{}',
  category     text default 'General',
  created_at   timestamptz default now()
);

-- ── deposits ──────────────────────────────────────────────────────────
create table if not exists deposits (
  id            uuid primary key default uuid_generate_v4(),
  room_id       uuid not null references rooms(id) on delete cascade,
  date          date not null,
  amount        numeric(12,2) not null,
  deposited_by  text not null,
  created_at    timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────
alter table rooms     enable row level security;
alter table roommates enable row level security;
alter table expenses  enable row level security;
alter table deposits  enable row level security;

drop policy if exists "Public access rooms"     on rooms;
drop policy if exists "Public access roommates" on roommates;
drop policy if exists "Public access expenses"  on expenses;
drop policy if exists "Public access deposits"  on deposits;

create policy "Public access rooms"     on rooms     for all using (true) with check (true);
create policy "Public access roommates" on roommates for all using (true) with check (true);
create policy "Public access expenses"  on expenses  for all using (true) with check (true);
create policy "Public access deposits"  on deposits  for all using (true) with check (true);
