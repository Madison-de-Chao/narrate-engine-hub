
-- ============================================================
-- 嚴格 RLS：鎖死 anon/authenticated 直接存取資料
-- 所有讀寫一律透過 service_role（即透過 Edge Function gateway）
-- 例外：admin 可直接讀寫（透過已登入的 auth.uid + has_role）
-- ============================================================

-- 1) bazi_calculations
DROP POLICY IF EXISTS "anon and auth can read all bazi_calculations" ON public.bazi_calculations;
DROP POLICY IF EXISTS "anon and auth can insert bazi_calculations"   ON public.bazi_calculations;
DROP POLICY IF EXISTS "anon and auth can update bazi_calculations"   ON public.bazi_calculations;
DROP POLICY IF EXISTS "anon and auth can delete bazi_calculations"   ON public.bazi_calculations;

CREATE POLICY "deny anon"                      ON public.bazi_calculations FOR ALL    TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny authenticated by default"  ON public.bazi_calculations FOR ALL    TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "admin can read all"             ON public.bazi_calculations FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin can delete all"           ON public.bazi_calculations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- 2) legion_stories
DROP POLICY IF EXISTS "anon and auth can read all legion_stories" ON public.legion_stories;
DROP POLICY IF EXISTS "anon and auth can insert legion_stories"   ON public.legion_stories;
DROP POLICY IF EXISTS "anon and auth can update legion_stories"   ON public.legion_stories;
DROP POLICY IF EXISTS "anon and auth can delete legion_stories"   ON public.legion_stories;

CREATE POLICY "deny anon"                     ON public.legion_stories FOR ALL    TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny authenticated by default" ON public.legion_stories FOR ALL    TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "admin can read all"            ON public.legion_stories FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin can delete all"          ON public.legion_stories FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- 3) story_regeneration_credits
DROP POLICY IF EXISTS "anon and auth can read credits"   ON public.story_regeneration_credits;
DROP POLICY IF EXISTS "anon and auth can insert credits" ON public.story_regeneration_credits;
DROP POLICY IF EXISTS "anon and auth can update credits" ON public.story_regeneration_credits;

CREATE POLICY "deny anon"                     ON public.story_regeneration_credits FOR ALL TO anon          USING (false) WITH CHECK (false);
CREATE POLICY "deny authenticated by default" ON public.story_regeneration_credits FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "admin can read all"            ON public.story_regeneration_credits FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- 4) 公開統計（首頁 HomeStatsSection 用，無需暴露原始資料表）
CREATE OR REPLACE FUNCTION public.public_site_stats()
RETURNS TABLE(total_calculations bigint, active_subscriptions bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.bazi_calculations),
    (SELECT count(*) FROM public.subscriptions WHERE status='active' AND (expires_at IS NULL OR expires_at > now()));
$$;

REVOKE ALL ON FUNCTION public.public_site_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_site_stats() TO anon, authenticated;
