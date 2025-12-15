import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, History } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";

// 時辰選項（子時到亥時）
const HOUR_OPTIONS = [
  { value: "23", label: "子時 (23:00-01:00)" },
  { value: "1", label: "丑時 (01:00-03:00)" },
  { value: "3", label: "寅時 (03:00-05:00)" },
  { value: "5", label: "卯時 (05:00-07:00)" },
  { value: "7", label: "辰時 (07:00-09:00)" },
  { value: "9", label: "巳時 (09:00-11:00)" },
  { value: "11", label: "午時 (11:00-13:00)" },
  { value: "13", label: "未時 (13:00-15:00)" },
  { value: "15", label: "申時 (15:00-17:00)" },
  { value: "17", label: "酉時 (17:00-19:00)" },
  { value: "19", label: "戌時 (19:00-21:00)" },
  { value: "21", label: "亥時 (21:00-23:00)" }
];

// 時辰地支到小時的映射
const BRANCH_TO_HOUR: Record<string, string> = {
  '子': '23', '丑': '1', '寅': '3', '卯': '5',
  '辰': '7', '巳': '9', '午': '11', '未': '13',
  '申': '15', '酉': '17', '戌': '19', '亥': '21'
};

interface BaziInputFormProps {
  onCalculate: (formData: Record<string, unknown>) => void;
  isCalculating: boolean;
  userId?: string | null;
}

export const BaziInputForm = ({ onCalculate, isCalculating, userId }: BaziInputFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    gender: "",
    location: "",
  });
  const [hasHistory, setHasHistory] = useState(false);

  // 自動載入上次計算記錄
  useEffect(() => {
    const loadLastCalculation = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('bazi_calculations')
          .select('name, birth_date, birth_time, gender, location, hour_branch')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) return;

        // 解析日期
        const birthDate = new Date(data.birth_date);
        // 從 birth_time 或 hour_branch 取得小時
        let hour = '';
        if (data.birth_time) {
          const timeParts = data.birth_time.split(':');
          hour = timeParts[0];
        } else if (data.hour_branch) {
          hour = BRANCH_TO_HOUR[data.hour_branch] || '';
        }

        setFormData({
          name: data.name || '',
          year: birthDate.getFullYear().toString(),
          month: (birthDate.getMonth() + 1).toString(),
          day: birthDate.getDate().toString(),
          hour: hour,
          gender: data.gender || '',
          location: data.location || '',
        });
        setHasHistory(true);
      } catch (err) {
        console.error('載入歷史記錄失敗:', err);
      }
    };

    loadLastCalculation();
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證表單
    if (!formData.name || !formData.year || !formData.month || !formData.day || !formData.hour || !formData.gender) {
      return;
    }

    // 使用UTC創建日期，然後傳入中國時區偏移（+8小時 = 480分鐘）
    const birthDate = new Date(
      Date.UTC(
        parseInt(formData.year),
        parseInt(formData.month) - 1,
        parseInt(formData.day),
        0, 0, 0
      )
    );

    onCalculate({
      ...formData,
      birthDate,
      birthHour: parseInt(formData.hour),
      birthMinute: 0,
      timezoneOffsetMinutes: 480 // UTC+8 中國標準時間
    });
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 relative overflow-hidden">
      {/* 邊框光效 */}
      <div className="absolute inset-0 rounded-lg opacity-50 pointer-events-none"
           style={{ boxShadow: 'inset 0 0 30px rgba(var(--primary), 0.1)' }} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">資料輸入區</h2>
          </div>
          {hasHistory && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="w-3.5 h-3.5" />
              <span>已載入上次記錄</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">姓名</Label>
              <Input
                id="name"
                placeholder="請輸入您的姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-border text-foreground"
                required
              />
            </div>

            {/* 性別 */}
            <div className="space-y-2">
              <Label id="gender-label" className="text-foreground">性別</Label>
              <RadioGroup
                className="flex gap-4"
                aria-labelledby="gender-label"
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="gender-male" value="male" />
                  <Label htmlFor="gender-male" className="text-foreground cursor-pointer">男</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="gender-female" value="female" />
                  <Label htmlFor="gender-female" className="text-foreground cursor-pointer">女</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* 出生日期 */}
          <div className="space-y-2">
            <Label className="text-foreground">出生日期</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                placeholder="年份"
                min="1900"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="bg-input border-border text-foreground"
                required
              />
              <Input
                type="number"
                placeholder="月份"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="bg-input border-border text-foreground"
                required
              />
              <Input
                type="number"
                placeholder="日期"
                min="1"
                max="31"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="bg-input border-border text-foreground"
                required
              />
            </div>
          </div>

          {/* 出生時辰 */}
          <div className="space-y-2">
            <Label htmlFor="hour" className="text-foreground">出生時辰</Label>
            <Select value={formData.hour} onValueChange={(value) => setFormData({ ...formData, hour: value })}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="請選擇時辰" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[300px] z-[9999]">
                {HOUR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 出生地點 */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-foreground">出生地點（選填）</Label>
            <Input
              id="location"
              placeholder="例：台北市"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* 提交按鈕 */}
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)] transition-all"
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                正在排盤中...
              </>
            ) : (
              "🔮 生成命盤"
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};
