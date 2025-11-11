-- 创建八字计算结果表
CREATE TABLE IF NOT EXISTS public.bazi_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TIMESTAMPTZ NOT NULL,
  birth_time TEXT NOT NULL,
  location TEXT,
  use_solar_time BOOLEAN DEFAULT true,
  
  -- 四柱数据
  year_stem TEXT NOT NULL,
  year_branch TEXT NOT NULL,
  month_stem TEXT NOT NULL,
  month_branch TEXT NOT NULL,
  day_stem TEXT NOT NULL,
  day_branch TEXT NOT NULL,
  hour_stem TEXT NOT NULL,
  hour_branch TEXT NOT NULL,
  
  -- 藏干数据 (JSON)
  hidden_stems JSONB,
  
  -- 十神数据 (JSON)
  ten_gods JSONB,
  
  -- 纳音数据
  year_nayin TEXT,
  month_nayin TEXT,
  day_nayin TEXT,
  hour_nayin TEXT,
  
  -- 神煞数据 (JSON array)
  shensha JSONB,
  
  -- 五行分数 (JSON)
  wuxing_scores JSONB,
  
  -- 阴阳比例 (JSON)
  yinyang_ratio JSONB,
  
  -- 四时军团分析结果 (JSON)
  legion_analysis JSONB,
  
  -- AI 生成的军团故事 (JSON)
  legion_stories JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建节气数据表（用于精确计算）
CREATE TABLE IF NOT EXISTS public.solar_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  term_name TEXT NOT NULL,
  term_date TIMESTAMPTZ NOT NULL,
  solar_longitude NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_bazi_user_id ON public.bazi_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_bazi_created_at ON public.bazi_calculations(created_at);
CREATE INDEX IF NOT EXISTS idx_solar_terms_year ON public.solar_terms(year);
CREATE INDEX IF NOT EXISTS idx_solar_terms_term_name ON public.solar_terms(term_name);

-- 启用 RLS
ALTER TABLE public.bazi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_terms ENABLE ROW LEVEL SECURITY;

-- 八字计算结果的 RLS 策略
CREATE POLICY "Users can view their own calculations"
  ON public.bazi_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations"
  ON public.bazi_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
  ON public.bazi_calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
  ON public.bazi_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- 节气数据对所有人可读
CREATE POLICY "Everyone can read solar terms"
  ON public.solar_terms FOR SELECT
  USING (true);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 bazi_calculations 表添加更新时间触发器
CREATE TRIGGER update_bazi_calculations_updated_at
  BEFORE UPDATE ON public.bazi_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();