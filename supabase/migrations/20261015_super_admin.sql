-- ==============================================================================
-- VIBETALK SUPER ADMIN PANEL — COMPREHENSIVE PRODUCTION DATABASE SCHEMA & RLS
-- Target: Supabase / PostgreSQL (Version 15+)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE public.admin_role_enum AS ENUM ('super_admin', 'admin', 'moderator', 'support_agent', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.report_type_enum AS ENUM ('user', 'message', 'profile', 'group');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.report_status_enum AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.report_severity_enum AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.restriction_type_enum AS ENUM ('warning', 'mute', 'suspension', 'ban');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. ADMIN ROLES & MEMBERSHIP TABLE
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role public.admin_role_enum NOT NULL DEFAULT 'moderator',
  avatar_url TEXT,
  is_mfa_enabled BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. ADMIN AUDIT LOGS (IMMUTABLE SECURITY EVENTS)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role public.admin_role_enum NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_label TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'denied')),
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. USER RESTRICTIONS & ENFORCEMENT
CREATE TABLE IF NOT EXISTS public.user_restrictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_display_name TEXT NOT NULL,
  restriction_type public.restriction_type_enum NOT NULL,
  reason TEXT NOT NULL,
  applied_by TEXT NOT NULL,
  applied_by_name TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. MODERATION REPORTS & QUEUE
CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type public.report_type_enum NOT NULL,
  target_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  reported_by_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence_snippet TEXT,
  severity public.report_severity_enum NOT NULL DEFAULT 'medium',
  status public.report_status_enum NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  internal_notes TEXT,
  actions_taken TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. PLATFORM SETTINGS & FEATURE FLAGS
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_settings',
  site_name TEXT NOT NULL DEFAULT 'VibeTalk',
  logo_url TEXT DEFAULT '/favicon.ico',
  favicon_url TEXT DEFAULT '/favicon.ico',
  terms_url TEXT DEFAULT 'https://vibetalk.app/terms',
  privacy_url TEXT DEFAULT 'https://vibetalk.app/privacy',
  guidelines_url TEXT DEFAULT 'https://vibetalk.app/community-guidelines',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_notice TEXT DEFAULT 'Scheduled maintenance in progress.',
  registration_availability TEXT NOT NULL DEFAULT 'open',
  max_upload_size_mb INTEGER NOT NULL DEFAULT 25,
  message_rate_limit_per_min INTEGER NOT NULL DEFAULT 60,
  call_duration_limit_minutes INTEGER NOT NULL DEFAULT 120,
  allowed_file_types TEXT[] DEFAULT ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/webm'],
  session_timeout_hours INTEGER NOT NULL DEFAULT 24,
  require_admin_mfa BOOLEAN NOT NULL DEFAULT true,
  feature_flags JSONB NOT NULL DEFAULT '{
    "audioCalling": true,
    "videoCalling": true,
    "publicConnectRooms": true,
    "quickMatch": true,
    "dailyRewards": true,
    "directMessaging": true,
    "profileBadges": true
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT
);

-- 8. PLATFORM ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.admin_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all',
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'published',
  views_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. SYSTEM HEALTH MONITORING LOGS
CREATE TABLE IF NOT EXISTS public.system_health_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  uptime_percent NUMERIC(5,2) NOT NULL DEFAULT 99.95,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_events ENABLE ROW LEVEL SECURITY;

-- Helper security function: is user a verified admin?
CREATE OR REPLACE FUNCTION public.is_authorized_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE email = user_email
      AND status = 'active'
      AND role IN ('super_admin', 'admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Only authorized admins can read/write administrative tables
CREATE POLICY admin_roles_policy ON public.admin_roles
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_roles WHERE role = 'super_admin' AND status = 'active')
  );

CREATE POLICY admin_audit_logs_read ON public.admin_audit_logs
  FOR SELECT
  USING (
    public.is_authorized_admin(auth.jwt() ->> 'email')
  );

CREATE POLICY admin_audit_logs_insert ON public.admin_audit_logs
  FOR INSERT
  WITH CHECK (
    public.is_authorized_admin(auth.jwt() ->> 'email')
  );

CREATE POLICY moderation_reports_policy ON public.moderation_reports
  FOR ALL
  USING (
    public.is_authorized_admin(auth.jwt() ->> 'email')
  );

CREATE POLICY platform_settings_select ON public.platform_settings
  FOR SELECT
  USING (true);

CREATE POLICY platform_settings_update ON public.platform_settings
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_roles WHERE role IN ('super_admin', 'admin') AND status = 'active')
  );

CREATE POLICY admin_announcements_read ON public.admin_announcements
  FOR SELECT
  USING (status = 'published' OR public.is_authorized_admin(auth.jwt() ->> 'email'));

-- 11. IMMUTABILITY TRIGGER FOR AUDIT LOGS
CREATE OR REPLACE FUNCTION public.enforce_audit_log_immutability()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Admin audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.admin_audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
  BEFORE UPDATE OR DELETE ON public.admin_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_audit_log_immutability();

-- 12. INITIAL SEED SUPER ADMIN RECORD
INSERT INTO public.admin_roles (id, email, display_name, role, status, is_mfa_enabled)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'superadmin@vibetalk.internal',
  'Victoria Stone (Super Admin)',
  'super_admin',
  'active',
  true
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.platform_settings (id, site_name, maintenance_mode)
VALUES ('global_settings', 'VibeTalk', false)
ON CONFLICT (id) DO NOTHING;
