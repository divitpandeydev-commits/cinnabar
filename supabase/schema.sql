-- ====================================================================
-- Cinnabar URL Shortener — Hardened PostgreSQL Schema (v2.0)
-- Production Security Hardening & Zero-Exposure Architecture
-- Safe for Existing Supabase Projects (Idempotent & Non-Destructive)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Table Verification
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.links (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NULL,
  clicks BIGINT NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMPTZ NULL,
  manage_key TEXT NOT NULL,
  click_logs JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- --------------------------------------------------------------------
-- 2. Performance Indexes
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_links_code ON public.links (lower(code));
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON public.links (expires_at) WHERE expires_at IS NOT NULL;

-- --------------------------------------------------------------------
-- 3. Hardened SECURITY DEFINER Stored Procedures
-- Fixed: Explicit search_path, fully qualified table names, restricted roles
-- --------------------------------------------------------------------

-- Stored Procedure A: Atomic Click Recording
CREATE OR REPLACE FUNCTION public.record_link_click(
  p_code TEXT,
  p_click_log JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  UPDATE public.links
  SET 
    clicks = clicks + 1,
    last_clicked_at = timezone('utc'::text, now()),
    click_logs = (
      SELECT jsonb_agg(elem)
      FROM (
        SELECT jsonb_build_array(p_click_log) || click_logs AS arr
      ) sub,
      jsonb_array_elements(arr) WITH ORDINALITY arr_elem(elem, ord)
      WHERE ord <= 50
    )
  WHERE lower(code) = lower(p_code);
END;
$$;

-- Stored Procedure B: Authorized Link Deletion
-- Matches manage_key server-side; rejects unauthorized attempts
CREATE OR REPLACE FUNCTION public.delete_link_with_key(
  p_code TEXT,
  p_manage_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_deleted_count INT;
BEGIN
  IF p_manage_key IS NULL OR trim(p_manage_key) = '' THEN
    RETURN FALSE;
  END IF;

  DELETE FROM public.links
  WHERE lower(code) = lower(p_code)
    AND manage_key = p_manage_key;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count > 0;
END;
$$;

-- Stored Procedure C: Controlled Link Ingestion
CREATE OR REPLACE FUNCTION public.create_short_link(
  p_id TEXT,
  p_code TEXT,
  p_original_url TEXT,
  p_expires_at TIMESTAMPTZ,
  p_manage_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_new_link public.links%ROWTYPE;
BEGIN
  IF p_code IS NULL OR trim(p_code) = '' THEN
    RAISE EXCEPTION 'Short code cannot be empty';
  END IF;

  IF p_original_url IS NULL OR trim(p_original_url) = '' THEN
    RAISE EXCEPTION 'Destination URL cannot be empty';
  END IF;

  IF p_manage_key IS NULL OR trim(p_manage_key) = '' THEN
    RAISE EXCEPTION 'Manage key cannot be empty';
  END IF;

  INSERT INTO public.links (
    id,
    code,
    original_url,
    created_at,
    expires_at,
    clicks,
    last_clicked_at,
    manage_key,
    click_logs
  ) VALUES (
    p_id,
    p_code,
    p_original_url,
    timezone('utc'::text, now()),
    p_expires_at,
    0,
    NULL,
    p_manage_key,
    '[]'::jsonb
  )
  RETURNING * INTO v_new_link;

  RETURN jsonb_build_object(
    'id', v_new_link.id,
    'code', v_new_link.code,
    'originalUrl', v_new_link.original_url,
    'createdAt', v_new_link.created_at,
    'expiresAt', v_new_link.expires_at,
    'clicks', v_new_link.clicks,
    'manageKey', v_new_link.manage_key
  );
END;
$$;

-- --------------------------------------------------------------------
-- 4. Function Execution Privileges
-- Revoke PUBLIC execution to prevent arbitrary RPC calls by anon users.
-- Grant execution strictly to service_role (the Next.js backend server).
-- --------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.record_link_click(TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_link_with_key(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_short_link(TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.record_link_click(TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_link_with_key(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_short_link(TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT) TO service_role;

-- --------------------------------------------------------------------
-- 5. Public View for Redirections & Ledger
-- Completely omits manage_key column; equipped with security_barrier
-- --------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_links
WITH (security_barrier = true) AS
SELECT 
  id,
  code,
  original_url,
  created_at,
  expires_at,
  clicks,
  last_clicked_at,
  click_logs
FROM public.links;

REVOKE ALL ON public.public_links FROM PUBLIC;
GRANT SELECT ON public.public_links TO anon, authenticated, service_role;

-- --------------------------------------------------------------------
-- 6. Table-Level and Column-Level Privilege Hardening
-- Revoke all table-level privileges from public roles to ensure
-- column-level permissions and RLS are strictly enforced.
-- --------------------------------------------------------------------
REVOKE ALL ON TABLE public.links FROM PUBLIC;
REVOKE ALL ON TABLE public.links FROM anon;
REVOKE ALL ON TABLE public.links FROM authenticated;

-- Explicitly revoke table-level SELECT from public roles
REVOKE SELECT ON TABLE public.links FROM PUBLIC, anon, authenticated;

-- Grant column-level SELECT on ONLY the non-sensitive columns
-- manage_key is EXCLUDED and cannot be read by anon or authenticated
GRANT SELECT (id, code, original_url, created_at, expires_at, clicks, last_clicked_at, click_logs)
  ON TABLE public.links TO anon, authenticated;

-- Grant full administrative privileges on table to service_role (backend server)
GRANT ALL ON TABLE public.links TO service_role;

-- --------------------------------------------------------------------
-- 7. Row Level Security (RLS) Configuration
-- --------------------------------------------------------------------
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Safely drop all legacy policies
DROP POLICY IF EXISTS "Allow public read access to links" ON public.links;
DROP POLICY IF EXISTS "Allow public insert to links" ON public.links;
DROP POLICY IF EXISTS "Allow authorized deletion" ON public.links;
DROP POLICY IF EXISTS "Allow public select of public columns" ON public.links;
DROP POLICY IF EXISTS "Deny direct public deletion" ON public.links;
DROP POLICY IF EXISTS "Deny direct public insertion" ON public.links;
DROP POLICY IF EXISTS "Allow public read of links" ON public.links;
DROP POLICY IF EXISTS "Deny public insert" ON public.links;
DROP POLICY IF EXISTS "Deny public update" ON public.links;
DROP POLICY IF EXISTS "Deny public delete" ON public.links;

-- Policy 1: Allow public read of granted columns
CREATE POLICY "Allow public read of links"
  ON public.links FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy 2: Deny all direct INSERT from public clients
-- Link creation MUST pass through Next.js backend with service_role
CREATE POLICY "Deny public insert"
  ON public.links FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- Policy 3: Deny all direct UPDATE from public clients
-- Click updates MUST pass through record_link_click procedure
CREATE POLICY "Deny public update"
  ON public.links FOR UPDATE
  TO anon, authenticated
  USING (false);

-- Policy 4: Deny all direct DELETE from public clients
-- Deletions MUST pass through Next.js backend with delete_link_with_key
CREATE POLICY "Deny public delete"
  ON public.links FOR DELETE
  TO anon, authenticated
  USING (false);
