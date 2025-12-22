import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, History, User, ChevronDown, Trash2, Sparkles, RefreshCw, Clock, MapPin, Settings2 } from "lucide-react";
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

// 常用城市經度預設
const CITY_LONGITUDES: Record<string, { longitude: number; tzOffset: number; label: string }> = {
  "台北": { longitude: 121.5654, tzOffset: 480, label: "台北 (121.57°E)" },
  "香港": { longitude: 114.1694, tzOffset: 480, label: "香港 (114.17°E)" },
  "北京": { longitude: 116.4074, tzOffset: 480, label: "北京 (116.41°E)" },
  "上海": { longitude: 121.4737, tzOffset: 480, label: "上海 (121.47°E)" },
  "新加坡": { longitude: 103.8198, tzOffset: 480, label: "新加坡 (103.82°E)" },
  "東京": { longitude: 139.6917, tzOffset: 540, label: "東京 (139.69°E)" },
  "首爾": { longitude: 126.9780, tzOffset: 540, label: "首爾 (126.98°E)" },
  "洛杉磯": { longitude: -118.2437, tzOffset: -480, label: "洛杉磯 (-118.24°E)" },
  "紐約": { longitude: -74.0060, tzOffset: -300, label: "紐約 (-74.01°E)" },
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

  // 處理城市選擇
  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    const cityData = CITY_LONGITUDES[city];
    if (cityData) {
      setLongitude(cityData.longitude.toString());
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
            {/* 資料來源提示 */}
            {dataSource !== 'none' && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
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
          <div className="mb-6 p-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl border border-accent/40">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/20 rounded-full">
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground mb-1">發現訪客暫存資料</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  偵測到您之前以訪客身份輸入的資料（{pendingGuestData.name}），是否要同步到帳號？
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSyncGuestData} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    同步資料
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleIgnoreGuestData}>
                    忽略
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 空狀態提示（會員無歷史紀錄時） */}
        {userId && historyRecords.length === 0 && !showGuestSyncPrompt && (
          <div className="mb-6 p-5 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/50 rounded-full mb-3">
              <History className="w-6 h-6 text-muted-foreground" />
            </div>
            <h4 className="font-bold text-foreground mb-1">尚無測算紀錄</h4>
            <p className="text-sm text-muted-foreground mb-4">
              完成第一次測算後，紀錄將自動保存於此
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDemoData}
              className="gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              載入示範資料測試
            </Button>
          </div>
        )}

        {/* 登入測算紀錄區塊（會員專用） */}
        {userId && historyRecords.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">登入測算紀錄</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                共 {historyRecords.length} 筆
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {historyRecords.slice(0, 6).map((record, index) => (
                <div
                  key={record.id}
                  className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    dataSource === 'history' && formData.name === record.name
                      ? 'bg-primary/20 border-primary/50 shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
                      : 'bg-card/60 border-border/50 hover:border-primary/30 hover:bg-card/80'
                  }`}
                  onClick={() => applyHistoryRecord(record)}
                >
                  {index === 0 && (
                    <span className="absolute -top-2 -right-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                      最新
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{record.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatHistoryDate(record.birth_date)} · {record.gender === 'male' ? '乾造' : '坤造'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-opacity shrink-0"
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
            <div className="flex gap-2">
              <Select value={formData.hour} onValueChange={(value) => setFormData({ ...formData, hour: value })}>
                <SelectTrigger className="bg-input border-border text-foreground flex-1">
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
              {usePreciseTime && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="分"
                    min="0"
                    max="59"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                    className="w-20 bg-input border-border text-foreground"
                  />
                  <span className="text-muted-foreground text-sm">分</span>
                </div>
              )}
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

          {/* 進階設定 Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  <span>進階設定</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4 p-4 border border-border/50 rounded-lg bg-muted/20">
              {/* 精確時間開關 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="precise-time" className="text-foreground">精確時間輸入</Label>
                </div>
                <Switch
                  id="precise-time"
                  checked={usePreciseTime}
                  onCheckedChange={setUsePreciseTime}
                />
              </div>
              <p className="text-xs text-muted-foreground -mt-2 ml-6">
                啟用後可輸入精確的分鐘數，提高計算準確度
              </p>

              {/* 城市/經度選擇 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-foreground">出生城市經度</Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={selectedCity} onValueChange={handleCitySelect}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="選擇城市" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-[9999]">
                      {Object.entries(CITY_LONGITUDES).map(([city, data]) => (
                        <SelectItem key={city} value={city}>
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
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  東經為正數，西經為負數。用於計算真太陽時。
                </p>
              </div>

              {/* 真太陽時模式 */}
              <div className="space-y-2">
                <Label className="text-foreground">太陽時模式</Label>
                <RadioGroup
                  className="flex flex-col gap-2"
                  value={solarTimeMode}
                  onValueChange={(value) => setSolarTimeMode(value as SolarTimeMode)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="solar-none" value="NONE" />
                    <Label htmlFor="solar-none" className="text-foreground cursor-pointer flex-1">
                      <span className="font-medium">標準時區</span>
                      <span className="text-xs text-muted-foreground ml-2">使用當地標準時間</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="solar-lmt" value="LMT" disabled={!longitude} />
                    <Label htmlFor="solar-lmt" className={`cursor-pointer flex-1 ${!longitude ? 'opacity-50' : ''}`}>
                      <span className="font-medium">平太陽時 (LMT)</span>
                      <span className="text-xs text-muted-foreground ml-2">僅經度補償</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="solar-tst" value="TST" disabled={!longitude} />
                    <Label htmlFor="solar-tst" className={`cursor-pointer flex-1 ${!longitude ? 'opacity-50' : ''}`}>
                      <span className="font-medium">真太陽時 (TST)</span>
                      <span className="text-xs text-muted-foreground ml-2">經度 + 均時差補償（專業）</span>
                    </Label>
                  </div>
                </RadioGroup>
                {!longitude && solarTimeMode !== "NONE" && (
                  <p className="text-xs text-amber-500">⚠️ 請先選擇城市或輸入經度</p>
                )}
              </div>

              {/* 子時模式 */}
              <div className="space-y-2">
                <Label className="text-foreground">子時換日規則</Label>
                <RadioGroup
                  className="flex gap-4"
                  value={ziMode}
                  onValueChange={(value) => setZiMode(value as ZiMode)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="zi-early" value="EARLY" />
                    <Label htmlFor="zi-early" className="text-foreground cursor-pointer">
                      <span className="font-medium">早子時</span>
                      <span className="text-xs text-muted-foreground ml-1">(23:00換日)</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="zi-late" value="LATE" />
                    <Label htmlFor="zi-late" className="text-foreground cursor-pointer">
                      <span className="font-medium">晚子時</span>
                      <span className="text-xs text-muted-foreground ml-1">(00:00換日)</span>
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  傳統八字多用「早子時」，23:00 起算入次日
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
