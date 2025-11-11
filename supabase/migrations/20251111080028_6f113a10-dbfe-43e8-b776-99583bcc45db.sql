-- 創建軍團故事表
CREATE TABLE public.legion_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id UUID NOT NULL REFERENCES public.bazi_calculations(id) ON DELETE CASCADE,
  legion_type TEXT NOT NULL CHECK (legion_type IN ('family', 'growth', 'self', 'future')),
  story TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE public.legion_stories ENABLE ROW LEVEL SECURITY;

-- 創建策略：用戶只能查看自己的故事
CREATE POLICY "Users can view their own legion stories"
ON public.legion_stories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bazi_calculations
    WHERE bazi_calculations.id = legion_stories.calculation_id
    AND bazi_calculations.user_id = auth.uid()
  )
);

-- 創建策略：用戶可以插入自己的故事
CREATE POLICY "Users can insert their own legion stories"
ON public.legion_stories
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bazi_calculations
    WHERE bazi_calculations.id = legion_stories.calculation_id
    AND bazi_calculations.user_id = auth.uid()
  )
);

-- 創建索引以提升查詢效能
CREATE INDEX idx_legion_stories_calculation_id ON public.legion_stories(calculation_id);
CREATE INDEX idx_legion_stories_legion_type ON public.legion_stories(legion_type);