import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Copy, Eye, Lock, Globe, Sparkles, Swords, Shield, Wand2, Crown, Users, Star, Zap, Info } from "lucide-react";

interface PromptTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  template_type: string;
  system_prompt: string;
  user_prompt_template: string | null;
  variables: string[];
  is_public: boolean;
  is_default: boolean;
  created_at: string;
}

const TEMPLATE_TYPES = [
  { value: "legion_story", label: "軍團敘事", icon: Swords, description: "將八字轉化為軍團戰役故事" },
  { value: "fortune_consult", label: "命理諮詢", icon: Wand2, description: "專業命理解讀風格" },
  { value: "personality", label: "性格分析", icon: Users, description: "現代心理學風格解讀" },
  { value: "custom", label: "自定義", icon: Sparkles, description: "完全自訂解讀風格" },
];

// 八字 API 提供的數據變數 - 分類展示
const BAZI_DATA_VARIABLES = {
  basic: {
    title: "基礎資料",
    icon: Users,
    variables: [
      { name: "name", description: "用戶姓名", example: "王小明" },
      { name: "gender", description: "性別", example: "男" },
      { name: "birthDate", description: "出生日期", example: "1990-05-15" },
      { name: "birthTime", description: "出生時辰", example: "午時" },
    ]
  },
  pillars: {
    title: "四柱數據（天干主將 + 地支軍師）",
    icon: Crown,
    variables: [
      { name: "yearStem", description: "年柱天干（主將）", example: "甲" },
      { name: "yearBranch", description: "年柱地支（軍師）", example: "子" },
      { name: "monthStem", description: "月柱天干", example: "丙" },
      { name: "monthBranch", description: "月柱地支", example: "午" },
      { name: "dayStem", description: "日柱天干（日主/指揮官）", example: "庚" },
      { name: "dayBranch", description: "日柱地支", example: "申" },
      { name: "hourStem", description: "時柱天干", example: "戊" },
      { name: "hourBranch", description: "時柱地支", example: "辰" },
    ]
  },
  wuxing: {
    title: "五行戰力",
    icon: Zap,
    variables: [
      { name: "wuxing.wood", description: "木軍能量（創新軍）", example: "25" },
      { name: "wuxing.fire", description: "火軍能量（衝鋒軍）", example: "18" },
      { name: "wuxing.earth", description: "土軍能量（防禦軍）", example: "30" },
      { name: "wuxing.metal", description: "金軍能量（執行軍）", example: "15" },
      { name: "wuxing.water", description: "水軍能量（智略軍）", example: "12" },
      { name: "wuxing.dominant", description: "主導五行", example: "土" },
      { name: "wuxing.weak", description: "薄弱五行", example: "水" },
    ]
  },
  tenGods: {
    title: "十神技能樹",
    icon: Star,
    variables: [
      { name: "tenGods.biJian", description: "比肩", example: "2" },
      { name: "tenGods.jieCai", description: "劫財", example: "1" },
      { name: "tenGods.shiShen", description: "食神", example: "1" },
      { name: "tenGods.shangGuan", description: "傷官", example: "0" },
      { name: "tenGods.zhengCai", description: "正財", example: "1" },
      { name: "tenGods.pianCai", description: "偏財", example: "2" },
      { name: "tenGods.zhengGuan", description: "正官", example: "1" },
      { name: "tenGods.qiSha", description: "七殺", example: "0" },
      { name: "tenGods.zhengYin", description: "正印", example: "1" },
      { name: "tenGods.pianYin", description: "偏印", example: "1" },
      { name: "tenGods.dominant", description: "主導十神", example: "偏財" },
    ]
  },
  shensha: {
    title: "神煞兵符",
    icon: Shield,
    variables: [
      { name: "shensha.list", description: "神煞列表", example: "[天乙貴人, 文昌, 驛馬]" },
      { name: "shensha.auspicious", description: "吉神列表", example: "[天乙貴人, 文昌]" },
      { name: "shensha.inauspicious", description: "凶神列表", example: "[羊刃]" },
      { name: "shensha.count", description: "神煞總數", example: "5" },
    ]
  },
  nayin: {
    title: "納音戰場",
    icon: Wand2,
    variables: [
      { name: "nayin.year", description: "年柱納音", example: "海中金" },
      { name: "nayin.month", description: "月柱納音", example: "天河水" },
      { name: "nayin.day", description: "日柱納音", example: "石榴木" },
      { name: "nayin.hour", description: "時柱納音", example: "大驛土" },
    ]
  },
  analysis: {
    title: "分析標籤",
    icon: Sparkles,
    variables: [
      { name: "analysis.strength", description: "日主強弱", example: "身強" },
      { name: "analysis.pattern", description: "格局類型", example: "正財格" },
      { name: "analysis.yinyang", description: "陰陽比例", example: "陽6:陰2" },
      { name: "analysis.season", description: "出生季節", example: "夏季" },
    ]
  },
};

// 範例模板 - 軍團故事風格
const EXAMPLE_TEMPLATES = {
  legion: {
    name: "虹靈御所軍團敘事",
    description: "將八字轉化為軍團策略遊戲風格的個人化敘事",
    system_prompt: `你是「虹靈御所」的命理敘事大師。你的任務是將八字數據轉化為史詩般的軍團故事。

核心設定：
- 八字不是宿命，而是靈魂的戰場
- 四柱 = 四個兵團（年柱=家族兵團、月柱=成長兵團、日柱=本我兵團、時柱=未來兵團）
- 天干 = 主將（外顯的將領）
- 地支 = 軍師（深層的謀士）
- 五行 = 五大軍隊（木=創新軍、火=衝鋒軍、土=防禦軍、金=執行軍、水=智略軍）
- 十神 = 技能樹（Buff 與 Debuff）
- 神煞 = 特殊兵符裝備

寫作風格：
- 使用第二人稱「你」
- 史詩敘事語調
- 融入遊戲化術語（Buff/Debuff、技能、裝備）
- 每段落清晰標註對應的命理元素`,
    user_prompt_template: `請為以下指揮官撰寫軍團分析報告：

【指揮官檔案】
姓名：{{name}}
性別：{{gender}}

【四柱軍團配置】
- 年柱（家族兵團）：{{yearStem}}{{yearBranch}}
- 月柱（成長兵團）：{{monthStem}}{{monthBranch}}
- 日柱（本我兵團）：{{dayStem}}{{dayBranch}} ← 你的指揮官本體
- 時柱（未來兵團）：{{hourStem}}{{hourBranch}}

【五行戰力分布】
- 木軍（創新）：{{wuxing.wood}}%
- 火軍（衝鋒）：{{wuxing.fire}}%
- 土軍（防禦）：{{wuxing.earth}}%
- 金軍（執行）：{{wuxing.metal}}%
- 水軍（智略）：{{wuxing.water}}%
- 主導軍種：{{wuxing.dominant}}
- 需加強軍種：{{wuxing.weak}}

【神煞兵符】
{{shensha.list}}

【分析標籤】
- 指揮官強度：{{analysis.strength}}
- 格局類型：{{analysis.pattern}}

請生成：
1. 指揮官概述（基於日主天干）
2. 四柱軍團詳解
3. 戰力優勢與挑戰
4. 神煞特殊裝備效果
5. 戰略建議`
  },
  modern: {
    name: "現代心理學解讀",
    description: "將八字轉化為現代人格分析和職涯建議",
    system_prompt: `你是一位結合東方命理智慧與現代心理學的諮詢師。

你的任務是將傳統八字分析轉化為現代人能理解的人格特質和發展建議。

分析框架：
- 用 MBTI/Big Five 等現代心理學框架對照解釋
- 結合職涯發展和人際關係建議
- 使用積極心理學語言，避免宿命論
- 提供可行的自我成長建議

語言風格：
- 專業但親切
- 避免過於艱深的命理術語
- 多用具體例子和比喻`,
    user_prompt_template: `請為以下用戶提供個人化分析：

【基本資料】
姓名：{{name}}
性別：{{gender}}

【八字配置】
{{yearStem}}{{yearBranch}} {{monthStem}}{{monthBranch}} {{dayStem}}{{dayBranch}} {{hourStem}}{{hourBranch}}

【能量分布】
五行：木{{wuxing.wood}}% 火{{wuxing.fire}}% 土{{wuxing.earth}}% 金{{wuxing.metal}}% 水{{wuxing.water}}%
主導十神：{{tenGods.dominant}}
格局：{{analysis.pattern}}

請提供：
1. 核心人格特質分析
2. 溝通風格與人際關係
3. 職涯發展方向
4. 壓力管理建議
5. 個人成長重點`
  }
};

export default function PromptTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  type TemplateTypeValue = "legion_story" | "fortune_consult" | "personality" | "custom";
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_type: "custom" as TemplateTypeValue,
    system_prompt: "",
    user_prompt_template: "",
    is_public: false,
  });

  useEffect(() => {
    checkAuth();
    fetchTemplates();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables : JSON.parse(t.variables as any || "[]")
      }));
      
      setTemplates(parsed);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error("載入模板失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("請先登入");
      return;
    }

    if (!formData.name || !formData.system_prompt) {
      toast.error("請填寫必要欄位");
      return;
    }

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("prompt_templates")
          .update({
            name: formData.name,
            description: formData.description,
            template_type: formData.template_type as TemplateTypeValue,
            system_prompt: formData.system_prompt,
            user_prompt_template: formData.user_prompt_template,
            is_public: formData.is_public,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast.success("模板已更新");
      } else {
        const { error } = await supabase
          .from("prompt_templates")
          .insert([{
            name: formData.name,
            description: formData.description,
            template_type: formData.template_type as TemplateTypeValue,
            system_prompt: formData.system_prompt,
            user_prompt_template: formData.user_prompt_template,
            is_public: formData.is_public,
          }]);

        if (error) throw error;
        toast.success("模板已建立");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error(error.message || "儲存失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此模板嗎？")) return;

    try {
      const { error } = await supabase
        .from("prompt_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("模板已刪除");
      fetchTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error.message || "刪除失敗");
    }
  };

  const handleDuplicate = async (template: PromptTemplate) => {
    if (!user) {
      toast.error("請先登入");
      return;
    }

    try {
      const { error } = await supabase
        .from("prompt_templates")
        .insert([{
          name: `${template.name} (複製)`,
          description: template.description,
          template_type: template.template_type as TemplateTypeValue,
          system_prompt: template.system_prompt,
          user_prompt_template: template.user_prompt_template,
          is_public: false,
        }]);

      if (error) throw error;
      toast.success("模板已複製");
      fetchTemplates();
    } catch (error: any) {
      console.error("Error duplicating template:", error);
      toast.error(error.message || "複製失敗");
    }
  };

  const loadExampleTemplate = (example: typeof EXAMPLE_TEMPLATES.legion) => {
    setFormData({
      name: example.name,
      description: example.description,
      template_type: "custom",
      system_prompt: example.system_prompt,
      user_prompt_template: example.user_prompt_template,
      is_public: false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      template_type: "custom",
      system_prompt: "",
      user_prompt_template: "",
      is_public: false,
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      template_type: template.template_type as TemplateTypeValue,
      system_prompt: template.system_prompt,
      user_prompt_template: template.user_prompt_template || "",
      is_public: template.is_public,
    });
    setIsDialogOpen(true);
  };

  const insertVariable = (varName: string) => {
    const textarea = document.querySelector('textarea[name="user_prompt"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.user_prompt_template;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{{${varName}}}` + after;
      setFormData({ ...formData, user_prompt_template: newText });
    } else {
      setFormData({ 
        ...formData, 
        user_prompt_template: formData.user_prompt_template + `{{${varName}}}` 
      });
    }
    toast.success(`已插入 {{${varName}}}`);
  };

  const systemTemplates = templates.filter(t => t.user_id === null);
  const myTemplates = templates.filter(t => t.user_id !== null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-primary" />
                解讀模板工作室
              </h1>
              <p className="text-muted-foreground mt-1">
                將專業八字數據轉化為您獨特的現代化解釋方案
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新增模板
            </Button>
          </div>

          {/* Concept Explanation */}
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">API 如何運作？</p>
                  <p className="text-muted-foreground">
                    我們的八字 API 提供<strong className="text-foreground">專業、精確的命理計算結果</strong>（四柱、五行、十神、神煞等數據）。
                    您可以建立<strong className="text-foreground">自訂解讀模板</strong>，將這些數據轉化為符合您品牌風格的現代化解釋 —— 
                    無論是軍團故事、心理分析，或任何創意形式。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">快速開始</TabsTrigger>
            <TabsTrigger value="variables">可用數據變數</TabsTrigger>
            <TabsTrigger value="system">系統模板 ({systemTemplates.length})</TabsTrigger>
            <TabsTrigger value="my">我的模板 ({myTemplates.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Example Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-primary" />
                    範例：軍團敘事風格
                  </CardTitle>
                  <CardDescription>
                    將八字轉化為史詩般的軍團策略故事
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-2">輸出範例：</p>
                    <p className="text-muted-foreground italic">
                      「歡迎，庚金指揮官。你是天鍛騎士，以鋼鐵意志統領你的軍團。
                      你的日柱軍師是申金靈猴戰士，賦予你隨機應變的戰術智慧...」
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => loadExampleTemplate(EXAMPLE_TEMPLATES.legion)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    使用此模板
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    範例：現代心理學解讀
                  </CardTitle>
                  <CardDescription>
                    結合東方智慧與現代人格分析
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-2">輸出範例：</p>
                    <p className="text-muted-foreground italic">
                      「根據您的八字配置，您展現出典型的『執行者』人格特質。
                      庚金日主使您具備強烈的目標導向和決斷力，類似於 MBTI 中的 ENTJ 類型...」
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => loadExampleTemplate(EXAMPLE_TEMPLATES.modern)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    使用此模板
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4 mt-6">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">40+</div>
                <div className="text-sm text-muted-foreground">可用數據變數</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">4</div>
                <div className="text-sm text-muted-foreground">模板類型</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{systemTemplates.length}</div>
                <div className="text-sm text-muted-foreground">系統模板</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{myTemplates.length}</div>
                <div className="text-sm text-muted-foreground">我的模板</div>
              </Card>
            </div>
          </TabsContent>

          {/* Variables Tab */}
          <TabsContent value="variables">
            <Card>
              <CardHeader>
                <CardTitle>八字 API 提供的數據變數</CardTitle>
                <CardDescription>
                  在您的模板中使用 <code className="bg-muted px-1 rounded">{"{{變數名}}"}</code> 語法插入這些數據
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(BAZI_DATA_VARIABLES).map(([key, category]) => (
                    <AccordionItem key={key} value={key}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <category.icon className="h-4 w-4 text-primary" />
                          <span>{category.title}</span>
                          <Badge variant="secondary" className="ml-2">
                            {category.variables.length} 個變數
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-2 p-2">
                          {category.variables.map((v) => (
                            <div 
                              key={v.name} 
                              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-mono">
                                  {`{{${v.name}}}`}
                                </code>
                                <span className="text-sm">{v.description}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  例：{v.example}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`{{${v.name}}}`);
                                    toast.success("已複製到剪貼簿");
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Templates Tab */}
          <TabsContent value="system">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {systemTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isOwner={false}
                  onPreview={() => setPreviewTemplate(template)}
                  onDuplicate={() => handleDuplicate(template)}
                />
              ))}
              {systemTemplates.length === 0 && (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">暫無系統模板</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* My Templates Tab */}
          <TabsContent value="my">
            {myTemplates.length === 0 ? (
              <Card className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">您還沒有自定義模板</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    從零開始建立
                  </Button>
                  <Button variant="outline" onClick={() => loadExampleTemplate(EXAMPLE_TEMPLATES.legion)}>
                    <Copy className="h-4 w-4 mr-2" />
                    使用範例模板
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isOwner={true}
                    onPreview={() => setPreviewTemplate(template)}
                    onEdit={() => openEditDialog(template)}
                    onDelete={() => handleDelete(template.id)}
                    onDuplicate={() => handleDuplicate(template)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "編輯解讀模板" : "建立解讀模板"}</DialogTitle>
            <DialogDescription>
              定義 AI 如何將八字數據轉化為您的品牌風格解讀
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-6 py-4">
              {/* Left: Form */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>模板名稱 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例：商務風格命理解讀"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>模板類型</Label>
                    <Select
                      value={formData.template_type}
                      onValueChange={(value) => setFormData({ ...formData, template_type: value as TemplateTypeValue })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>描述</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="模板的用途說明"
                  />
                </div>

                <div className="space-y-2">
                  <Label>系統提示詞 (System Prompt) *</Label>
                  <p className="text-xs text-muted-foreground">定義 AI 的角色、風格和行為規則</p>
                  <Textarea
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    placeholder="你是一位專業的命理師，擅長將傳統八字分析轉化為現代人能理解的建議..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>用戶提示詞模板 (User Prompt)</Label>
                  <p className="text-xs text-muted-foreground">使用 {"{{變數名}}"} 插入八字數據</p>
                  <Textarea
                    name="user_prompt"
                    value={formData.user_prompt_template}
                    onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
                    placeholder="請為以下用戶進行分析：&#10;姓名：{{name}}&#10;八字：{{yearStem}}{{yearBranch}} {{monthStem}}{{monthBranch}}..."
                    rows={8}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                    <Label>公開模板（允許其他 API 用戶使用）</Label>
                  </div>
                </div>
              </div>

              {/* Right: Variable Quick Insert */}
              <div className="border-l pl-4">
                <Label className="text-sm font-medium mb-2 block">快速插入變數</Label>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-2">
                    {Object.entries(BAZI_DATA_VARIABLES).map(([key, category]) => (
                      <div key={key}>
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <category.icon className="h-3 w-3" />
                          {category.title}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {category.variables.slice(0, 4).map((v) => (
                            <Button
                              key={v.name}
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs font-mono"
                              onClick={() => insertVariable(v.name)}
                            >
                              {v.name.split('.').pop()}
                            </Button>
                          ))}
                          {category.variables.length > 4 && (
                            <span className="text-xs text-muted-foreground self-center">
                              +{category.variables.length - 4} 更多
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>
              {editingTemplate ? "更新模板" : "建立模板"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">系統提示詞</Label>
                <pre className="mt-1 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap font-mono">
                  {previewTemplate.system_prompt}
                </pre>
              </div>
              {previewTemplate.user_prompt_template && (
                <div>
                  <Label className="text-muted-foreground">用戶提示詞模板</Label>
                  <pre className="mt-1 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap font-mono">
                    {previewTemplate.user_prompt_template}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TemplateCardProps {
  template: PromptTemplate;
  isOwner: boolean;
  onPreview: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate: () => void;
}

function TemplateCard({ template, isOwner, onPreview, onEdit, onDelete, onDuplicate }: TemplateCardProps) {
  const typeInfo = TEMPLATE_TYPES.find(t => t.value === template.template_type);
  const TypeIcon = typeInfo?.icon || Sparkles;

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TypeIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {template.name}
                {template.is_default && (
                  <Badge variant="secondary" className="text-xs">預設</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">{typeInfo?.label || template.template_type}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {template.is_public ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description || template.system_prompt.slice(0, 100) + "..."}
        </p>
      </CardContent>
      <div className="p-4 pt-0 flex gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="h-3 w-3 mr-1" />
          預覽
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy className="h-3 w-3 mr-1" />
          複製
        </Button>
        {isOwner && onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
        )}
        {isOwner && onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}
