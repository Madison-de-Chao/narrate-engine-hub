-- 擴充 legion_stories 表：新增 user_id 與 is_locked 欄位
ALTER TABLE public.legion_stories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- 創建用戶故事重生資格表
CREATE TABLE IF NOT EXISTS public.story_regeneration_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 啟用 RLS
ALTER TABLE public.story_regeneration_credits ENABLE ROW LEVEL SECURITY;

-- RLS 政策：用戶只能查看自己的重生資格
CREATE POLICY "Users can view their own regeneration credits"
ON public.story_regeneration_credits
FOR SELECT
USING (auth.uid() = user_id);

-- RLS 政策：只有系統可以更新（透過 service role）
CREATE POLICY "Users can view own credits only"
ON public.story_regeneration_credits
FOR UPDATE
USING (auth.uid() = user_id);

-- 更新 legion_stories RLS 政策
DROP POLICY IF EXISTS "Users can view their own legion stories" ON public.legion_stories;
DROP POLICY IF EXISTS "Users can insert their own legion stories" ON public.legion_stories;
DROP POLICY IF EXISTS "Users can update their own legion stories" ON public.legion_stories;

CREATE POLICY "Users can view legion stories for their calculations"
ON public.legion_stories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bazi_calculations bc 
    WHERE bc.id = legion_stories.calculation_id 
    AND (bc.user_id = auth.uid() OR bc.user_id IS NULL)
  )
);

CREATE POLICY "Users can insert legion stories for their calculations"
ON public.legion_stories
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.bazi_calculations bc 
    WHERE bc.id = calculation_id 
    AND bc.user_id = auth.uid()
  )
);

-- 創建自動更新時間戳觸發器
CREATE OR REPLACE FUNCTION public.update_story_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_story_credits_timestamp
BEFORE UPDATE ON public.story_regeneration_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_story_credits_updated_at();

-- 創建索引優化查詢
CREATE INDEX IF NOT EXISTS idx_legion_stories_user_id ON public.legion_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_legion_stories_calculation_locked ON public.legion_stories(calculation_id, is_locked);
CREATE INDEX IF NOT EXISTS idx_story_credits_user_id ON public.story_regeneration_credits(user_id);