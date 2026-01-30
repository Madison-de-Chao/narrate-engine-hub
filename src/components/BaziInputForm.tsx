import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, History, User, ChevronDown, Trash2, Sparkles, RefreshCw, Clock, MapPin, Settings2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CitySelector, CITY_DATABASE } from "@/components/CitySelector";
import { TimeWheelSelector } from "@/components/TimeWheelSelector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import type { SolarTimeMode, ZiMode } from "@/types/bazi";
import { TIMEZONE_PRESETS, fromJsTimezoneOffset } from "@/types/bazi";

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

// 舊的城市經度預設（保留向後兼容）- 現使用 CitySelector
const CITY_LONGITUDES = CITY_DATABASE;

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
    minute: "0",
    gender: "",
    location: "",
  });
  
  // 進階設定
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [usePreciseTime, setUsePreciseTime] = useState(false);
  const [longitude, setLongitude] = useState<string>("");
  const [solarTimeMode, setSolarTimeMode] = useState<SolarTimeMode>("NONE");
  const [ziMode, setZiMode] = useState<ZiMode>("EARLY");
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [dataSource, setDataSource] = useState<'none' | 'history' | 'guest' | 'demo'>('none');
  const [deleteTarget, setDeleteTarget] = useState<HistoryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGuestSyncPrompt, setShowGuestSyncPrompt] = useState(false);
  const [pendingGuestData, setPendingGuestData] = useState<typeof formData | null>(null);

  // 從 localStorage 載入訪客資料
  const loadGuestData = () => {
    try {
      const saved = localStorage.getItem(GUEST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setDataSource('guest');
        return parsed;
      }
    } catch (err) {
      console.error('載入訪客資料失敗:', err);
    }
    return null;
  };

  // 儲存訪客資料到 localStorage
  const saveGuestData = (data: typeof formData) => {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('儲存訪客資料失敗:', err);
    }
  };

  // 清除訪客資料
  const clearGuestData = () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  };

  // 載入示範資料（僅本機測試用）
  const loadDemoData = () => {
    const demoData = {
      name: "示範用戶",
      year: "1990",
      month: "6",
      day: "15",
      hour: "9",
      minute: "0",
      gender: "male",
      location: "台北市",
    };
    setFormData(demoData);
    setDataSource('demo');
    toast.success("已載入示範資料，可直接點擊「生成命盤」測試");
  };

  // 載入會員歷史記錄 + 訪客資料同步提示
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) {
        // 訪客模式：從 localStorage 載入
        loadGuestData();
        return;
      }

      // 會員模式：先檢查是否有訪客暫存資料需要同步
      const guestData = (() => {
        try {
          const saved = localStorage.getItem(GUEST_STORAGE_KEY);
          if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return null;
      })();

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
        } else if (guestData && guestData.name) {
          // 無歷史紀錄但有訪客資料 → 提示同步
          setPendingGuestData(guestData);
          setShowGuestSyncPrompt(true);
          setFormData({ ...guestData, minute: guestData.minute || "0" });
          setDataSource('guest');
        }
      } catch (err) {
        console.error('載入歷史記錄失敗:', err);
        // 若載入失敗但有訪客資料，仍然載入
        if (guestData && guestData.name) {
          setFormData({ ...guestData, minute: guestData.minute || "0" });
          setDataSource('guest');
        }
      }
    };

    loadHistory();
  }, [userId]);

  // 同步訪客資料到會員帳號（直接填入表單，下次計算時會存入資料庫）
  const handleSyncGuestData = () => {
    if (pendingGuestData) {
      setFormData({ ...pendingGuestData, minute: (pendingGuestData as any).minute || "0" });
      setDataSource('guest');
      clearGuestData();
      setShowGuestSyncPrompt(false);
      toast.success("已載入訪客暫存資料，計算後將自動存入帳號");
    }
  };

  // 忽略訪客資料
  const handleIgnoreGuestData = () => {
    clearGuestData();
    setShowGuestSyncPrompt(false);
    setPendingGuestData(null);
    toast.info("已忽略訪客資料");
  };

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
      minute: record.birth_time ? record.birth_time.split(':')[1] || "0" : "0",
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

  // 處理城市選擇（支援新的 CitySelector）
  const handleCitySelect = (city: string, data?: typeof CITY_DATABASE[string]) => {
    setSelectedCity(city);
    const cityData = data || CITY_LONGITUDES[city];
    if (cityData) {
      setLongitude(cityData.longitude.toString());
      setFormData(prev => ({ ...prev, location: cityData.label }));
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

    // 使用UTC創建日期
    const birthDate = new Date(
      Date.UTC(
        parseInt(formData.year),
        parseInt(formData.month) - 1,
        parseInt(formData.day),
        0, 0, 0
      )
    );

    // 決定時區偏移
    let tzOffset: number = 480; // 預設台灣時區
    if (selectedCity && CITY_LONGITUDES[selectedCity]) {
      tzOffset = CITY_LONGITUDES[selectedCity].tzOffset;
    }

    onCalculate({
      ...formData,
      birthDate,
      birthHour: parseInt(formData.hour),
      birthMinute: usePreciseTime ? parseInt(formData.minute || "0") : 0,
      timezoneOffsetMinutes: tzOffset,
      // 新增進階設定
      longitude: longitude ? parseFloat(longitude) : undefined,
      solarTimeMode,
      ziMode,
      usePreciseTime
    });
  };

  return (
    <>
    <Card className="relative overflow-hidden border-cosmic-gold/30 bg-cosmic-deep/90 backdrop-blur-sm">
      {/* 星空背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-void" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cosmic-nebula/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-cosmic-nebula2/10 rounded-full blur-3xl" />
      </div>
      
      {/* 邊框光效 */}
      <div className="absolute inset-0 rounded-lg pointer-events-none border border-cosmic-gold/10"
           style={{ boxShadow: 'inset 0 0 40px rgba(200, 170, 100, 0.05)' }} />
      
      {/* 四角裝飾 */}
      <svg className="absolute top-0 left-0 w-8 h-8 pointer-events-none" viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L16 0 M0 0 L0 16" stroke="hsl(var(--cosmic-gold))" strokeWidth="1.5" opacity="0.5" />
        <path d="M4 4 L10 4 M4 4 L4 10" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.3" />
      </svg>
      <svg className="absolute top-0 right-0 w-8 h-8 pointer-events-none rotate-90" viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L16 0 M0 0 L0 16" stroke="hsl(var(--cosmic-gold))" strokeWidth="1.5" opacity="0.5" />
        <path d="M4 4 L10 4 M4 4 L4 10" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.3" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none -rotate-90" viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L16 0 M0 0 L0 16" stroke="hsl(var(--cosmic-gold))" strokeWidth="1.5" opacity="0.5" />
        <path d="M4 4 L10 4 M4 4 L4 10" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.3" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none rotate-180" viewBox="0 0 32 32" fill="none">
        <path d="M0 0 L16 0 M0 0 L0 16" stroke="hsl(var(--cosmic-gold))" strokeWidth="1.5" opacity="0.5" />
        <path d="M4 4 L10 4 M4 4 L4 10" stroke="hsl(var(--cosmic-gold))" strokeWidth="1" opacity="0.3" />
      </svg>
      
      <div className="relative z-10 p-6">
        {/* HUD 標識 */}
        <div className="absolute top-2 right-4 text-[9px] font-mono text-cosmic-gold/40 tracking-widest">
          COSMIC-INPUT // LIVE
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cosmic-gold/10 border border-cosmic-gold/30">
              <CalendarIcon className="w-5 h-5 text-cosmic-gold" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-cosmic-text font-serif">資料輸入區</h2>
              <p className="text-xs text-cosmic-text-dim font-mono tracking-wide">DATA ENTRY MODULE</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 資料來源提示 */}
            {dataSource !== 'none' && (
              <div className="flex items-center gap-1.5 text-xs text-cosmic-gold/80 bg-cosmic-gold/10 border border-cosmic-gold/20 px-2.5 py-1 rounded">
                {dataSource === 'history' ? (
                  <>
                    <History className="w-3.5 h-3.5" />
                    <span>已載入歷史</span>
                  </>
                ) : dataSource === 'demo' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>示範資料</span>
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

        {/* 訪客資料同步提示（登入後偵測到訪客暫存） */}
        {showGuestSyncPrompt && pendingGuestData && (
          <div className="mb-6 p-4 bg-cosmic-accent/10 rounded-xl border border-cosmic-accent/40">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cosmic-accent/20 rounded-full border border-cosmic-accent/30">
                <RefreshCw className="w-5 h-5 text-cosmic-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-cosmic-text mb-1">發現訪客暫存資料</h4>
                <p className="text-sm text-cosmic-text-dim mb-3">
                  偵測到您之前以訪客身份輸入的資料（{pendingGuestData.name}），是否要同步到帳號？
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSyncGuestData} className="bg-cosmic-accent hover:bg-cosmic-accent/90 text-cosmic-void">
                    同步資料
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleIgnoreGuestData} className="border-cosmic-gold/30 text-cosmic-text hover:bg-cosmic-gold/10">
                    忽略
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 空狀態提示（會員無歷史紀錄時） */}
        {userId && historyRecords.length === 0 && !showGuestSyncPrompt && (
          <div className="mb-6 p-5 bg-cosmic-surface/30 rounded-xl border border-cosmic-gold/20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-cosmic-gold/10 rounded-full mb-3 border border-cosmic-gold/30">
              <History className="w-6 h-6 text-cosmic-gold/70" />
            </div>
            <h4 className="font-bold text-cosmic-text mb-1">尚無測算紀錄</h4>
            <p className="text-sm text-cosmic-text-dim mb-4">
              完成第一次測算後，紀錄將自動保存於此
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDemoData}
              className="gap-1.5 border-cosmic-gold/30 text-cosmic-gold hover:bg-cosmic-gold/10"
            >
              <Sparkles className="w-4 h-4" />
              載入示範資料測試
            </Button>
          </div>
        )}

        {/* 登入測算紀錄區塊（會員專用） */}
        {userId && historyRecords.length > 0 && (
          <div className="mb-6 p-4 bg-cosmic-surface/20 rounded-xl border border-cosmic-gold/20">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-cosmic-gold" />
              <h3 className="font-bold text-lg text-cosmic-text">登入測算紀錄</h3>
              <span className="text-xs text-cosmic-text-dim bg-cosmic-gold/10 px-2 py-0.5 rounded-full border border-cosmic-gold/20">
                共 {historyRecords.length} 筆
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {historyRecords.slice(0, 6).map((record, index) => (
                <div
                  key={record.id}
                  className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    dataSource === 'history' && formData.name === record.name
                      ? 'bg-cosmic-gold/15 border-cosmic-gold/50 shadow-[0_0_15px_rgba(200,170,100,0.2)]'
                      : 'bg-cosmic-surface/30 border-cosmic-gold/10 hover:border-cosmic-gold/30 hover:bg-cosmic-surface/50'
                  }`}
                  onClick={() => applyHistoryRecord(record)}
                >
                  {index === 0 && (
                    <span className="absolute -top-2 -right-2 text-xs bg-cosmic-accent text-cosmic-void px-2 py-0.5 rounded-full font-medium">
                      最新
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cosmic-text truncate">{record.name}</p>
                      <p className="text-xs text-cosmic-text-dim">
                        {formatHistoryDate(record.birth_date)} · {record.gender === 'male' ? '乾造' : '坤造'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(record);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {historyRecords.length > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground hover:text-foreground">
                    查看更多 ({historyRecords.length - 6} 筆)
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64">
                  {historyRecords.slice(6).map((record) => (
                    <div key={record.id} className="flex items-center group">
                      <DropdownMenuItem
                        onClick={() => applyHistoryRecord(record)}
                        className="flex-1 flex flex-col items-start gap-0.5 cursor-pointer"
                      >
                        <span className="font-medium">{record.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatHistoryDate(record.birth_date)} · {record.gender === 'male' ? '乾造' : '坤造'}
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
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 姓名 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-cosmic-text font-medium">姓名</Label>
              <Input
                id="name"
                placeholder="請輸入您的姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text placeholder:text-cosmic-text-dim/50 focus:border-cosmic-gold/50 focus:ring-cosmic-gold/20"
                required
              />
            </div>

            {/* 性別 */}
            <div className="space-y-2">
              <Label id="gender-label" className="text-cosmic-text font-medium">性別</Label>
              <RadioGroup
                className="flex gap-4"
                aria-labelledby="gender-label"
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="gender-male" value="male" className="border-cosmic-gold/40 text-cosmic-gold" />
                  <Label htmlFor="gender-male" className="text-cosmic-text cursor-pointer">男</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="gender-female" value="female" className="border-cosmic-gold/40 text-cosmic-gold" />
                  <Label htmlFor="gender-female" className="text-cosmic-text cursor-pointer">女</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* 出生日期 */}
          <div className="space-y-2">
            <Label className="text-cosmic-text font-medium">出生日期</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                placeholder="年份"
                min="1900"
                max="2100"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text placeholder:text-cosmic-text-dim/50 focus:border-cosmic-gold/50"
                required
              />
              <Input
                type="number"
                placeholder="月份"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text placeholder:text-cosmic-text-dim/50 focus:border-cosmic-gold/50"
                required
              />
              <Input
                type="number"
                placeholder="日期"
                min="1"
                max="31"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text placeholder:text-cosmic-text-dim/50 focus:border-cosmic-gold/50"
                required
              />
            </div>
          </div>

          {/* 出生時辰 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="hour" className="text-cosmic-text font-medium">出生時辰</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="precise-time-toggle"
                  checked={usePreciseTime}
                  onCheckedChange={setUsePreciseTime}
                  className="scale-75 data-[state=checked]:bg-cosmic-gold"
                />
                <Label htmlFor="precise-time-toggle" className="text-xs text-cosmic-text-dim cursor-pointer">
                  精確分鐘
                </Label>
              </div>
            </div>
            <div className="flex gap-4">
              {/* 下拉選單 */}
              <div className="flex-1">
                <Select value={formData.hour} onValueChange={(value) => setFormData({ ...formData, hour: value })}>
                  <SelectTrigger className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text">
                    <SelectValue placeholder="請選擇時辰" />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-deep border-cosmic-gold/30 max-h-[300px] z-[9999]">
                    {HOUR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-cosmic-text focus:bg-cosmic-gold/20 focus:text-cosmic-gold">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 十二時辰圓盤 */}
              <div className="flex-1">
                <TimeWheelSelector
                  value={formData.hour}
                  onChange={(value) => setFormData({ ...formData, hour: value })}
                />
              </div>
              
              {usePreciseTime && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="分"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                    className="w-20 bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text"
                  />
                  <span className="text-cosmic-text-dim text-sm">分</span>
                </div>
              )}
            </div>
            {usePreciseTime && (
              <p className="text-xs text-cosmic-gold/70 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                節氣交界精確到分鐘，輸入精確時間可提高準確度
              </p>
            )}
          </div>

          {/* 出生城市 - 整合經度選擇 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-cosmic-text font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cosmic-gold/70" />
                出生城市
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="solar-time-toggle"
                  checked={solarTimeMode === "TST"}
                  onCheckedChange={(checked) => {
                    setSolarTimeMode(checked ? "TST" : "NONE");
                    if (checked && !longitude && !selectedCity) {
                      toast.info("請選擇出生城市以啟用真太陽時計算");
                    }
                  }}
                  disabled={!longitude && !selectedCity}
                  className="scale-75 data-[state=checked]:bg-cosmic-gold"
                />
                <div className="relative group">
                  <Label htmlFor="solar-time-toggle" className={`text-xs cursor-pointer ${(!longitude && !selectedCity) ? 'text-cosmic-text-dim/50' : 'text-cosmic-gold'}`}>
                    真太陽時 ✨
                  </Label>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-cosmic-deep border border-cosmic-gold/30 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-50">
                    <p className="text-xs text-cosmic-text font-medium mb-1">真太陽時 (TST)</p>
                    <p className="text-xs text-cosmic-text-dim">根據出生地經度校正時間，考慮地球自轉與公轉的均時差，是專業命理師推薦的高精度計算方式。</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 城市選擇器（帶搜尋功能） */}
            <CitySelector
              value={selectedCity}
              onSelect={handleCitySelect}
              placeholder="搜尋出生城市..."
            />
            
            {/* 或手動輸入地點 */}
            <Input
              id="location"
              placeholder="或輸入其他地點名稱"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text placeholder:text-cosmic-text-dim/50"
            />
            {solarTimeMode === "TST" && longitude && (
              <p className="text-xs text-cosmic-gold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                已啟用真太陽時校正 (經度: {parseFloat(longitude).toFixed(2)}°E)
              </p>
            )}
          </div>

          {/* 進階設定 Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2 border-cosmic-gold/30 text-cosmic-text bg-cosmic-surface/30 hover:bg-cosmic-gold/10 hover:text-cosmic-gold">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  <span>進階設定</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4 p-4 border border-cosmic-gold/20 rounded-lg bg-cosmic-surface/20">
              {/* 精確時間開關 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cosmic-gold/70" />
                  <Label htmlFor="precise-time" className="text-cosmic-text">精確時間輸入</Label>
                </div>
                <Switch
                  id="precise-time"
                  checked={usePreciseTime}
                  onCheckedChange={setUsePreciseTime}
                  className="data-[state=checked]:bg-cosmic-gold"
                />
              </div>
              <p className="text-xs text-cosmic-text-dim -mt-2 ml-6">
                啟用後可輸入精確的分鐘數，提高計算準確度
              </p>

              {/* 城市/經度選擇 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cosmic-gold/70" />
                  <Label className="text-cosmic-text">出生城市經度</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedCity} onValueChange={handleCitySelect}>
                    <SelectTrigger className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text">
                      <SelectValue placeholder="選擇城市" />
                    </SelectTrigger>
                    <SelectContent className="bg-cosmic-deep border-cosmic-gold/30 z-[9999]">
                      {Object.entries(CITY_LONGITUDES).map(([city, data]) => (
                        <SelectItem key={city} value={city} className="text-cosmic-text focus:bg-cosmic-gold/20">
                          {data.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="自訂經度"
                    value={longitude}
                    onChange={(e) => {
                      setLongitude(e.target.value);
                      setSelectedCity("");
                    }}
                    className="bg-cosmic-surface/50 border-cosmic-gold/20 text-cosmic-text"
                  />
                </div>
                <p className="text-xs text-cosmic-text-dim">
                  東經為正數，西經為負數。用於計算真太陽時。
                </p>
              </div>

              {/* 真太陽時模式 */}
              <div className="space-y-2">
                <Label className="text-cosmic-text">太陽時模式</Label>
                <RadioGroup
                  className="flex flex-col gap-2"
                  value={solarTimeMode}
                  onValueChange={(value) => setSolarTimeMode(value as SolarTimeMode)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="solar-none" value="NONE" className="border-cosmic-gold/40 text-cosmic-gold" />
                    <Label htmlFor="solar-none" className="text-cosmic-text cursor-pointer flex-1">
                      <span className="font-medium">標準時區</span>
                      <span className="text-xs text-cosmic-text-dim ml-2">使用當地標準時間</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="solar-lmt" value="LMT" disabled={!longitude} className="border-cosmic-gold/40 text-cosmic-gold" />
                    <Label htmlFor="solar-lmt" className={`cursor-pointer flex-1 ${!longitude ? 'opacity-50' : ''} text-cosmic-text`}>
                      <span className="font-medium">平太陽時 (LMT)</span>
                      <span className="text-xs text-cosmic-text-dim ml-2">僅經度補償</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="solar-tst" value="TST" disabled={!longitude} className="border-cosmic-gold/40 text-cosmic-gold" />
                    <Label htmlFor="solar-tst" className={`cursor-pointer flex-1 ${!longitude ? 'opacity-50' : ''} text-cosmic-text`}>
                      <span className="font-medium">真太陽時 (TST)</span>
                      <span className="text-xs text-cosmic-text-dim ml-2">經度 + 均時差補償（專業）</span>
                    </Label>
                  </div>
                </RadioGroup>
                {!longitude && solarTimeMode !== "NONE" && (
                  <p className="text-xs text-amber-400">⚠️ 請先選擇城市或輸入經度</p>
                )}
              </div>

              {/* 子時模式 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-cosmic-text">子時換日規則</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-cosmic-gold/60 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm p-4 bg-cosmic-deep border-cosmic-gold/30">
                        <div className="space-y-2">
                          <p className="font-bold text-cosmic-text">子時換日爭議</p>
                          <p className="text-xs text-cosmic-text-dim">
                            子時（23:00-01:00）跨越午夜，究竟何時換日是命理界數百年來的重要議題。
                          </p>
                          <p className="text-xs text-cosmic-text-dim">
                            此爭議源於古代計時方式與現代時鐘的差異，至今仍無定論。
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <RadioGroup
                  className="flex flex-col gap-3"
                  value={ziMode}
                  onValueChange={(value) => setZiMode(value as ZiMode)}
                >
                  {/* 早子時選項 */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-cosmic-gold/20 hover:border-cosmic-gold/40 hover:bg-cosmic-gold/5 transition-colors">
                    <RadioGroupItem id="zi-early" value="EARLY" className="mt-1 border-cosmic-gold/40 text-cosmic-gold" />
                    <Label htmlFor="zi-early" className="text-cosmic-text cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">早子時派</span>
                        <span className="text-xs bg-cosmic-gold/20 text-cosmic-gold px-2 py-0.5 rounded">推薦</span>
                        <span className="text-xs text-cosmic-text-dim">(23:00換日)</span>
                      </div>
                      <p className="text-xs text-cosmic-text-dim leading-relaxed">
                        認為子時一到（23:00）即換日。此派源於《子平真詮》等經典，認為天氣交接於子正（23:00），故日柱應隨之更換。為當代多數命理師採用的主流派別。
                      </p>
                    </Label>
                  </div>
                  
                  {/* 晚子時選項 */}
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-cosmic-gold/20 hover:border-cosmic-gold/40 hover:bg-cosmic-gold/5 transition-colors">
                    <RadioGroupItem id="zi-late" value="LATE" className="mt-1 border-cosmic-gold/40 text-cosmic-gold" />
                    <Label htmlFor="zi-late" className="text-cosmic-text cursor-pointer flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">晚子時派</span>
                        <span className="text-xs text-cosmic-text-dim">(00:00換日)</span>
                      </div>
                      <p className="text-xs text-cosmic-text-dim leading-relaxed">
                        認為需到午夜（00:00）才換日，23:00-00:00 屬「夜子時」仍歸當日。此派認為日柱應以太陽過下中天為準，與現代曆法同步。部分港台命理師採用此法。
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
                
                {/* 歷史背景說明 */}
                <div className="p-3 bg-cosmic-surface/30 rounded-lg border border-cosmic-gold/10">
                  <div className="flex items-start gap-2">
                    <History className="w-4 h-4 text-cosmic-gold/60 mt-0.5 shrink-0" />
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-cosmic-text">歷史背景</p>
                      <p className="text-xs text-cosmic-text-dim leading-relaxed">
                        古代中國以「銅壺滴漏」計時，一晝夜分為十二時辰，子時橫跨今之 23:00-01:00。
                        由於古人日落而息、日出而作，子時（深夜）換日的精確時刻在實務上較少觸及。
                      </p>
                      <p className="text-xs text-cosmic-text-dim leading-relaxed">
                        清代以降，隨著西方時鐘傳入，「子初」（23:00）與「子正」（00:00）之辨才成為討論焦點。
                        兩派各有典籍依據，建議可分別測試，選擇與自身經歷更相符者。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 提交按鈕 */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-cosmic-gold via-cosmic-gold-bright to-cosmic-gold text-cosmic-void font-bold text-lg py-6 shadow-[0_0_25px_rgba(200,170,100,0.4)] hover:shadow-[0_0_35px_rgba(200,170,100,0.6)] transition-all hover:scale-[1.01]"
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
