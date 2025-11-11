import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";

interface BaziInputFormProps {
  onCalculate: (formData: any) => void;
  isCalculating: boolean;
}

export const BaziInputForm = ({ onCalculate, isCalculating }: BaziInputFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    gender: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證表單
    if (!formData.name || !formData.year || !formData.month || !formData.day || !formData.hour || !formData.gender) {
      return;
    }

    const birthDate = new Date(
      parseInt(formData.year),
      parseInt(formData.month) - 1,
      parseInt(formData.day),
      parseInt(formData.hour)
    );

    onCalculate({
      ...formData,
      birthDate,
    });
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 card-glow">
      <div className="flex items-center gap-3 mb-6">
        <CalendarIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">資料輸入區</h2>
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
            <Label htmlFor="gender" className="text-foreground">性別</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="請選擇性別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男</SelectItem>
                <SelectItem value="female">女</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 出生日期時間 */}
        <div className="space-y-2">
          <Label className="text-foreground">出生日期與時間</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <Input
              type="number"
              placeholder="時辰"
              min="0"
              max="23"
              value={formData.hour}
              onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
              className="bg-input border-border text-foreground"
              required
            />
          </div>
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
    </Card>
  );
};
