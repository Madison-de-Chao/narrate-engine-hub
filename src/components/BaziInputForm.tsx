import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, History, User, ChevronDown, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
const GUEST_STORAGE_KEY = 'bazi_guest_form_data';

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

interface HistoryRecord {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  gender: string;
  location: string | null;
  hour_branch: string;
  created_at: string;
}

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
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [dataSource, setDataSource] = useState<'none' | 'history' | 'guest'>('none');
  const [deleteTarget, setDeleteTarget] = useState<HistoryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 從 localStorage 載入訪客資料
  const loadGuestData = () => {
    try {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setDataSource('guest');
        return true;
      }
    } catch (err) {
      console.error('載入訪客資料失敗:', err);
    }
    return false;
  };

  // 儲存訪客資料到 localStorage
  const saveGuestData = (data: typeof formData) => {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('儲存訪客資料失敗:', err);
    }
  };

  // 載入會員歷史記錄
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) {
        // 訪客模式：從 localStorage 載入
        loadGuestData();
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bazi_calculations')
          .select('id, name, birth_date, birth_time, gender, location, hour_branch, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        
        if (data && data.length > 0) {
          setHistoryRecords(data);
          // 自動載入最新記錄
          applyHistoryRecord(data[0]);
        }
      } catch (err) {
        console.error('載入歷史記錄失敗:', err);
      }
    };

    loadHistory();
  }, [userId]);

  // 應用歷史記錄到表單
  const applyHistoryRecord = (record: HistoryRecord) => {
    const birthDate = new Date(record.birth_date);
    let hour = '';
    if (record.birth_time) {
      const timeParts = record.birth_time.split(':');
      hour = timeParts[0];
    } else if (record.hour_branch) {
      hour = BRANCH_TO_HOUR[record.hour_branch] || '';
    }

    setFormData({
      name: record.name || '',
      year: birthDate.getFullYear().toString(),
      month: (birthDate.getMonth() + 1).toString(),
      day: birthDate.getDate().toString(),
      hour: hour,
      gender: record.gender || '',
      location: record.location || '',
    });
    setDataSource('history');
  };

  // 格式化日期顯示
  const formatHistoryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 刪除歷史記錄
  const handleDeleteRecord = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('bazi_calculations')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setHistoryRecords(prev => prev.filter(r => r.id !== deleteTarget.id));
      toast.success('已刪除記錄');
    } catch (err) {
      console.error('刪除記錄失敗:', err);
      toast.error('刪除失敗，請稍後再試');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證表單
    if (!formData.name || !formData.year || !formData.month || !formData.day || !formData.hour || !formData.gender) {
      return;
    }

    // 訪客模式：儲存到 localStorage
    if (!userId) {
      saveGuestData(formData);
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
    <>
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
          
          <div className="flex items-center gap-2">
            {/* 歷史記錄下拉選單（會員專用） */}
            {userId && historyRecords.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <History className="w-4 h-4" />
                    <span className="hidden sm:inline">歷史記錄</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {historyRecords.map((record) => (
                    <div key={record.id} className="flex items-center group">
                      <DropdownMenuItem
                        onClick={() => applyHistoryRecord(record)}
                        className="flex-1 flex flex-col items-start gap-0.5 cursor-pointer"
                      >
                        <span className="font-medium">{record.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatHistoryDate(record.birth_date)} · {record.gender === 'male' ? '男' : '女'}
                        </span>
                      </DropdownMenuItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(record);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* 資料來源提示 */}
            {dataSource !== 'none' && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {dataSource === 'history' ? (
                  <>
                    <History className="w-3.5 h-3.5" />
                    <span>已載入歷史</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5" />
                    <span>已載入上次</span>
                  </>
                )}
              </div>
            )}
          </div>
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

    {/* 刪除確認對話框 */}
    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認刪除</AlertDialogTitle>
          <AlertDialogDescription>
            確定要刪除「{deleteTarget?.name}」的命盤記錄嗎？此操作無法復原。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteRecord}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            刪除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
