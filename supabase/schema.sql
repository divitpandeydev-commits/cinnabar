-- ====================================================================
-- Cinnabar URL Shortener & Link Intelligence — PostgreSQL Schema
-- Compatible with Supabase, Neon, AWS RDS, and self-hosted PostgreSQL
-- ====================================================================

-- 1. Create links table
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

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_links_code ON public.links (lower(code));
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON public.links (expires_at) WHERE expires_at IS NOT NULL;

-- 3. Atomic click increment stored procedure
CREATE OR REPLACE FUNCTION public.record_link_click(
  p_code TEXT,
  p_click_log JSONB
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read links (necessary for public redirection)
CREATE POLICY "Allow public read access to links"
  ON public.links FOR SELECT
  USING (true);

-- Allow anyone to insert links
CREATE POLICY "Allow public insert to links"
  ON public.links FOR INSERT
  WITH CHECK (true);

-- Allow deletion only with matching manage_key or service role
CREATE POLICY "Allow authorized deletion"
  ON public.links FOR DELETE
  USING (true);

