-- 模板類型
CREATE TYPE public.template_type AS ENUM ('legion_story', 'fortune_consult', 'personality', 'custom');

-- Prompt 模板表
CREATE TABLE public.prompt_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = 系統模板
    name text NOT NULL,
    description text,
    template_type template_type NOT NULL,
    system_prompt text NOT NULL,
    user_prompt_template text, -- 可包含變數如 {{pillars}}, {{wuxing}}
    variables jsonb DEFAULT '["pillars", "wuxing", "shensha", "tenGods", "nayin", "gender", "name"]',
    is_public boolean DEFAULT false,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- API 方案表
CREATE TABLE public.api_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    features jsonb NOT NULL DEFAULT '["bazi_calculation"]',
    price_per_request numeric(10,4) DEFAULT 0,
    monthly_quota integer DEFAULT 1000,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 擴展 api_keys 表
ALTER TABLE public.api_keys 
ADD COLUMN plan_id uuid REFERENCES public.api_plans(id),
ADD COLUMN default_template_id uuid REFERENCES public.prompt_templates(id);

-- 啟用 RLS
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_plans ENABLE ROW LEVEL SECURITY;

-- Prompt 模板 RLS 政策
CREATE POLICY "Users can view system templates" ON public.prompt_templates
FOR SELECT USING (user_id IS NULL OR is_public = true);

CREATE POLICY "Users can view their own templates" ON public.prompt_templates
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" ON public.prompt_templates
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.prompt_templates
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.prompt_templates
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all templates" ON public.prompt_templates
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- API Plans RLS（公開讀取，管理員管理）
CREATE POLICY "Everyone can view active plans" ON public.api_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.api_plans
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 插入預設系統模板
INSERT INTO public.prompt_templates (user_id, name, description, template_type, system_prompt, user_prompt_template, is_default) VALUES
(NULL, '四時軍團故事', '以軍團統帥和謀士角色生成命理故事', 'legion_story', 
'你是一位精通八字命理的故事大師，擅長將命理分析轉化為生動的軍團故事。請根據用戶的八字資料，以四時軍團的世界觀來詮釋其命格特質。', 
'用戶姓名：{{name}}
性別：{{gender}}
四柱：{{pillars}}
五行分數：{{wuxing}}
神煞：{{shensha}}

請為這位用戶生成一段軍團故事，描述其命格特質和人生方向。', true),

(NULL, '傳統命理分析', '經典八字命理分析風格', 'fortune_consult',
'你是一位資深命理師，精通八字、五行、十神分析。請以專業但易懂的方式解讀命盤。',
'用戶姓名：{{name}}
性別：{{gender}}
四柱：{{pillars}}
五行：{{wuxing}}
十神：{{tenGods}}
納音：{{nayin}}

請提供專業的命理分析。', true),

(NULL, '性格分析', '聚焦於性格特質的現代化解讀', 'personality',
'你是一位心理學與命理學結合的專家，擅長從八字中解讀性格特質。請避免迷信說法，用現代心理學語言詮釋。',
'用戶：{{name}} ({{gender}})
四柱：{{pillars}}
五行比例：{{wuxing}}

請分析此人的性格特質、優勢和潛在挑戰。', true);

-- 插入預設 API 方案
INSERT INTO public.api_plans (name, description, features, price_per_request, monthly_quota) VALUES
('基礎計算', '純八字計算，返回四柱、五行、神煞等原始數據', '["bazi_calculation"]', 0.001, 10000),
('標準方案', '計算 + 使用系統預設模板生成 AI 分析', '["bazi_calculation", "ai_story", "system_templates"]', 0.01, 5000),
('專業方案', '計算 + 自定義 Prompt 模板', '["bazi_calculation", "ai_story", "custom_prompt"]', 0.02, 3000);