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
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Copy, Eye, Lock, Globe } from "lucide-react";

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
  { value: "legion_story", label: "軍團故事" },
  { value: "fortune_consult", label: "命理諮詢" },
  { value: "personality", label: "性格分析" },
  { value: "custom", label: "自定義" },
];

const AVAILABLE_VARIABLES = [
  { name: "name", description: "用戶姓名" },
  { name: "gender", description: "性別" },
  { name: "pillars", description: "四柱 (年月日時)" },
  { name: "wuxing", description: "五行分數" },
  { name: "shensha", description: "神煞列表" },
  { name: "tenGods", description: "十神配置" },
  { name: "nayin", description: "納音五行" },
  { name: "hiddenStems", description: "藏干信息" },
];

export default function PromptTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);

  type TemplateTypeValue = "legion_story" | "fortune_consult" | "personality" | "custom";
  
  // Form state
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
      
      // Parse variables from JSON
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
        // Update
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
        // Create
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

  const systemTemplates = templates.filter(t => t.user_id === null);
  const myTemplates = templates.filter(t => t.user_id !== null);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Prompt 模板管理</h1>
              <p className="text-muted-foreground">管理 AI 生成內容的提示詞模板</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增模板
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "編輯模板" : "新增模板"}</DialogTitle>
                <DialogDescription>
                  建立自定義 Prompt 模板，可在 API 調用時使用
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>模板名稱 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例：商務風格分析"
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
                            {type.label}
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
                  <Textarea
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    placeholder="定義 AI 的角色和行為..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>用戶提示詞模板</Label>
                  <Textarea
                    value={formData.user_prompt_template}
                    onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
                    placeholder="使用 {{變數名}} 插入數據..."
                    rows={6}
                  />
                  <div className="text-xs text-muted-foreground">
                    可用變數：{AVAILABLE_VARIABLES.map(v => `{{${v.name}}}`).join("、")}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                    />
                    <Label>公開模板（允許其他用戶使用）</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingTemplate ? "更新" : "建立"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Available Variables Reference */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">可用變數參考</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map((v) => (
                <Badge key={v.name} variant="secondary" className="font-mono">
                  {`{{${v.name}}}`} - {v.description}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Tabs defaultValue="system">
          <TabsList className="mb-4">
            <TabsTrigger value="system">系統模板 ({systemTemplates.length})</TabsTrigger>
            <TabsTrigger value="my">我的模板 ({myTemplates.length})</TabsTrigger>
          </TabsList>

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
            </div>
          </TabsContent>

          <TabsContent value="my">
            {myTemplates.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">您還沒有自定義模板</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  建立第一個模板
                </Button>
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

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
              <DialogDescription>{previewTemplate?.description}</DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">系統提示詞</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {previewTemplate.system_prompt}
                  </pre>
                </div>
                {previewTemplate.user_prompt_template && (
                  <div>
                    <Label className="text-muted-foreground">用戶提示詞模板</Label>
                    <pre className="mt-1 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {previewTemplate.user_prompt_template}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
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
  const typeLabel = TEMPLATE_TYPES.find(t => t.value === template.template_type)?.label || template.template_type;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {template.name}
              {template.is_default && (
                <Badge variant="secondary" className="text-xs">預設</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{typeLabel}</CardDescription>
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
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </div>
    </Card>
  );
}
