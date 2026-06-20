
-- Phase 2: Switch to email-based identity for bazi_calculations, legion_stories, story_regeneration_credits

-- 1. Add user_email columns (nullable for backward compatibility with legacy user_id rows)
ALTER TABLE public.bazi_calculations ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.legion_stories ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.story_regeneration_credits ADD COLUMN IF NOT EXISTS user_email TEXT;

-- story_regeneration_credits.user_id was NOT NULL — relax it so email-only rows can exist
ALTER TABLE public.story_regeneration_credits ALTER COLUMN user_id DROP NOT NULL;

-- 2. Indexes for fast email lookups
CREATE INDEX IF NOT EXISTS idx_bazi_calculations_user_email ON public.bazi_calculations(user_email);
CREATE INDEX IF NOT EXISTS idx_legion_stories_user_email ON public.legion_stories(user_email);
CREATE INDEX IF NOT EXISTS idx_credits_user_email ON public.story_regeneration_credits(user_email);

-- 3. Drop existing RLS policies (auth.uid based) and replace with permissive policies
--    Authentication is now handled by the central system; this site keeps records keyed by email.
--    NOTE: This is intentional per product decision — records are visible to anyone with the email.
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname='public'
      AND tablename IN ('bazi_calculations','legion_stories','story_regeneration_credits')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 4. New permissive policies (frontend filters by email)
CREATE POLICY "anon and auth can read all bazi_calculations"
  ON public.bazi_calculations FOR SELECT USING (true);
CREATE POLICY "anon and auth can insert bazi_calculations"
  ON public.bazi_calculations FOR INSERT WITH CHECK (true);
CREATE POLICY "anon and auth can update bazi_calculations"
  ON public.bazi_calculations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon and auth can delete bazi_calculations"
  ON public.bazi_calculations FOR DELETE USING (true);

CREATE POLICY "anon and auth can read all legion_stories"
  ON public.legion_stories FOR SELECT USING (true);
CREATE POLICY "anon and auth can insert legion_stories"
  ON public.legion_stories FOR INSERT WITH CHECK (true);
CREATE POLICY "anon and auth can update legion_stories"
  ON public.legion_stories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon and auth can delete legion_stories"
  ON public.legion_stories FOR DELETE USING (true);

CREATE POLICY "anon and auth can read credits"
  ON public.story_regeneration_credits FOR SELECT USING (true);
CREATE POLICY "anon and auth can insert credits"
  ON public.story_regeneration_credits FOR INSERT WITH CHECK (true);
CREATE POLICY "anon and auth can update credits"
  ON public.story_regeneration_credits FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Grant anon role full access (no JWT in this app)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bazi_calculations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legion_stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_regeneration_credits TO anon;
