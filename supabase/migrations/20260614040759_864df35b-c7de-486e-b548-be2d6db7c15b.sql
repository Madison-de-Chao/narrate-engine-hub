
-- 1) Subscriptions: prevent self-upgrade to premium
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscriptions;
CREATE POLICY "Users can create their own subscription"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status IN ('inactive','cancelled','pending')
    AND plan = 'free'
    AND payment_reference IS NULL
  );

-- 2) Prompt templates: require auth to read system/shared templates
DROP POLICY IF EXISTS "Users can view system templates" ON public.prompt_templates;
CREATE POLICY "Authenticated users can view shared templates"
  ON public.prompt_templates FOR SELECT
  TO authenticated
  USING (is_public = true);

-- 3) Legion stories: remove anonymous-calculation leak
DROP POLICY IF EXISTS "Users can view legion stories for their calculations" ON public.legion_stories;
CREATE POLICY "Users can view legion stories for their calculations"
  ON public.legion_stories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bazi_calculations bc
      WHERE bc.id = legion_stories.calculation_id
        AND bc.user_id = auth.uid()
    )
  );
