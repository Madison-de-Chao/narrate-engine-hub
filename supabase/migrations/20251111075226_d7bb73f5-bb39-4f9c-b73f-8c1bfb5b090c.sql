-- 修复函数 search_path 安全警告（使用 CASCADE）
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 重新创建触发器
CREATE TRIGGER update_bazi_calculations_updated_at
  BEFORE UPDATE ON public.bazi_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();