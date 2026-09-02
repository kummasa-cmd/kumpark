-- ============================================================
-- Enable Row Level Security on all public tables
--
-- This app never talks to Supabase via PostgREST/supabase-js —
-- it connects directly to Postgres with the `postgres` role
-- (see lib/db.ts, DATABASE_URL), which owns these tables and
-- therefore bypasses RLS automatically. Enabling RLS here does
-- NOT change app behavior; it only blocks the auto-generated
-- PostgREST API (which anyone with the project's anon key can
-- otherwise query) from reading/writing these tables, since no
-- policies are defined.
--
-- Safe to run multiple times.
-- ============================================================

ALTER TABLE IF EXISTS members            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS consultations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admins             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boards             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS member_inquiries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coachings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS board_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS site_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coaching_schedules ENABLE ROW LEVEL SECURITY;
