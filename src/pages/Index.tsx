import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BaziInputForm } from "@/components/BaziInputForm";
import { TraditionalBaziDisplay } from "@/components/TraditionalBaziDisplay";
import { LegionCards } from "@/components/LegionCards";
import { AnalysisCharts } from "@/components/AnalysisCharts";
import { CalculationLogs } from "@/components/CalculationLogs";
import { ReportSummary } from "@/components/ReportSummary";
import { ReportNavigation } from "@/components/ReportNavigation";
import { ShenshaStats } from "@/components/ShenshaStats";
import { NayinAnalysis } from "@/components/NayinAnalysis";
import { PersonalityAnalysis } from "@/components/PersonalityAnalysis";
import { TenGodsAnalysis } from "@/components/TenGodsAnalysis";
import { ProfessionalReportHeader } from "@/components/ProfessionalReportHeader";
import { ShareImageDialog } from "@/components/ShareImageDialog";
import { PremiumGate } from "@/components/PremiumGate";
import { AiFortuneConsult } from "@/components/AiFortuneConsult";
import { LegionSummoningOverlay } from "@/components/LegionSummoningOverlay";
import { PageHeader } from "@/components/PageHeader";
import { ReportSection, ReportDivider, ReportProgress, ReportControls, ReadingProgressBar } from "@/components/report";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Download, Loader2, LogOut, UserRound, Sparkles, Swords, BookOpen, Crown, Shield, Share2, MessageCircle, Facebook, LayoutDashboard, Scroll, BarChart3, FileText, User } from "lucide-react";
import { generatePDF, type CoverPageData, type ReportData, type PdfOptions } from "@/lib/pdfGenerator";
import { PdfOptionsDialog, type PdfOptions as DialogPdfOptions } from "@/components/PdfOptionsDialog";
import { toast } from "sonner";
import { FunctionsHttpError, type User as SupabaseUser, type Session } from "@supabase/supabase-js";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useUnifiedMembership } from '@/hooks/useUnifiedMembership';
import { MembershipBadge } from "@/components/EntitlementGuard";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logoSishi from "@/assets/logo-sishi.png";
import logoHonglingyusuo from "@/assets/logo-honglingyusuo-new.png";
import logoChaoxuan from "@/assets/logo-chaoxuan-new.png";
import { getFourSeasonsTeam } from "@/lib/fourSeasonsAnalyzer";
import { ModularShenshaEngine } from "@/lib/shenshaRuleEngine";
import type { ShenshaMatch } from "@/data/shenshaTypes";

import type { FourSeasonsTeam } from "@/lib/fourSeasonsAnalyzer";
import type { CalculationLogs as CalculationLogsType } from "@/lib/baziCalculator";

export interface BaziResult {
  name: string;
  birthDate: Date;
  gender: string;
  pillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  hiddenStems: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  tenGods: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  shensha: (ShenshaMatch | string)[];  // 支援新舊格式
  wuxing: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinyang: {
    yin: number;
    yang: number;
  };
  fourSeasonsTeam?: FourSeasonsTeam;
  calculationLogs?: CalculationLogsType;
  legionStories?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
}

const Index = () => {
  const navigate = useNavigate();
  const { isGuest, disableGuestMode } = useGuestMode();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatingUserName, setCalculatingUserName] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState('summary');
  const [shenshaRuleset, setShenshaRuleset] = useState<'trad' | 'legion'>('trad');
  const [isAiConsultOpen, setIsAiConsultOpen] = useState(false);
  const [isPdfOptionsOpen, setIsPdfOptionsOpen] = useState(false);
  
  // 章節展開狀態管理
  const [sectionExpandedState, setSectionExpandedState] = useState<Record<string, boolean>>({
    summary: true,
    bazi: true,
    legion: true,
    tenGods: true,
    shensha: true,
    personality: true,
    nayin: true,
    analysis: true,
    logs: true,
  });
  
  const { hasAccess, source: membershipSource, tier, loading: membershipLoading } = useUnifiedMembership('bazi-premium');
  const { isAdmin } = useAdminStatus(user?.id);

  // 計算展開章節數量
  const expandedCount = Object.values(sectionExpandedState).filter(Boolean).length;
  const totalSections = Object.keys(sectionExpandedState).length;

  // 全部展開/收合
  const handleExpandAll = () => {
    setSectionExpandedState(prev => 
      Object.fromEntries(Object.keys(prev).map(k => [k, true]))
    );
  };

  const handleCollapseAll = () => {
    setSectionExpandedState(prev => 
      Object.fromEntries(Object.keys(prev).map(k => [k, false]))
    );
  };

  // 單個章節展開狀態變化
  const handleSectionExpandedChange = (sectionId: string, expanded: boolean) => {
    setSectionExpandedState(prev => ({ ...prev, [sectionId]: expanded }));
  };

  // 升級處理函數
  const handleUpgrade = () => {
    // 跳轉到訂閱頁面
    navigate("/subscribe");
  };

  // Section refs for scrolling
  const sectionRefs = {
    summary: useRef<HTMLDivElement>(null),
    bazi: useRef<HTMLDivElement>(null),
    tenGods: useRef<HTMLDivElement>(null),
    shensha: useRef<HTMLDivElement>(null),
    personality: useRef<HTMLDivElement>(null),
    legion: useRef<HTMLDivElement>(null),
    analysis: useRef<HTMLDivElement>(null),
    logs: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current) {
      const headerOffset = 140;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // 设置认证状态监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only redirect to auth if not in guest mode and no session
        if (!session && !isGuest) {
          navigate("/auth");
        }
      }
    );

    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Only redirect to auth if not in guest mode and no session
      if (!session && !isGuest) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isGuest]);

  const handleLogout = async () => {
    if (isGuest) {
      disableGuestMode();
      toast.success("已退出訪客模式");
      navigate("/auth");
    } else {
      await supabase.auth.signOut();
      toast.success("已登出");
      navigate("/auth");
    }
  };

  const generateLegionStories = async (result: BaziResult, calculationId?: string) => {
    const legionTypes = [
      { type: 'year', pillar: 'year' },
      { type: 'month', pillar: 'month' },
      { type: 'day', pillar: 'day' },
      { type: 'hour', pillar: 'hour' }
    ];

    const stories: { [key: string]: string } = {};
    
    // 計算神煞並按柱位分組
    const { calculateShenshaWithEvidence } = await import('@/lib/shenshaCalculator');
    const allShenshaMatches = calculateShenshaWithEvidence(
      result.pillars.day.stem,
      result.pillars.year.branch,
      result.pillars.month.branch,
      result.pillars.day.branch,
      result.pillars.hour.branch
    );
    
    // 按 matched_pillar 分組神煞
    const shenshaByPillar: Record<string, string[]> = {
      year: [],
      month: [],
      day: [],
      hour: []
    };
    
    allShenshaMatches.forEach(match => {
      const pillar = match.evidence.matched_pillar;
      if (pillar && shenshaByPillar[pillar]) {
        shenshaByPillar[pillar].push(match.name);
      }
    });

    // 計算數據標籤（用於 AI 敘事）
    const calculateDataLabels = () => {
      const wuxing = result.wuxing;
      const dayStem = result.pillars.day.stem;
      
      // 計算日主強弱
      const dayStemElement = getElementFromStem(dayStem);
      const sameElement = getSameElementScore(wuxing, dayStemElement);
      const oppositeElement = getOppositeElementScore(wuxing, dayStemElement);
      const strengthRatio = sameElement / (sameElement + oppositeElement + 0.01);
      
      let strengthTag = '中和';
      if (strengthRatio > 0.55) strengthTag = '身強';
      else if (strengthRatio < 0.45) strengthTag = '身弱';
      
      // 找出主導五行
      const elements = Object.entries(wuxing);
      const sorted = elements.sort((a, b) => b[1] - a[1]);
      const dominantElement = sorted[0][0];
      
      // 找出主導十神
      const tenGodCounts: Record<string, number> = {};
      Object.values(result.tenGods).forEach(tg => {
        if (tg.stem) tenGodCounts[tg.stem] = (tenGodCounts[tg.stem] || 0) + 1;
        if (tg.branch) tenGodCounts[tg.branch] = (tenGodCounts[tg.branch] || 0) + 1;
      });
      const sortedTenGods = Object.entries(tenGodCounts).sort((a, b) => b[1] - a[1]);
      const dominantTenGod = sortedTenGods[0]?.[0] ? `${sortedTenGods[0][0]}旺` : '待分析';
      
      // 特殊格局（從神煞中提取高稀有度的）
      const specialPatterns: string[] = [];
      allShenshaMatches.forEach(m => {
        if (m.rarity === 'SSR' || m.rarity === 'SR') {
          specialPatterns.push(m.name);
        }
      });
      
      return {
        strengthTag,
        dominantElement: translateElement(dominantElement),
        dominantTenGod,
        specialPatterns
      };
    };
    
    const dataLabels = calculateDataLabels();
    
    for (const { type, pillar } of legionTypes) {
      try {
        const pillarData = result.pillars[pillar as keyof typeof result.pillars];
        // 獲取該柱位專屬的神煞列表
        const pillarShensha = shenshaByPillar[pillar] || [];
        
        const { data: storyData, error } = await supabase.functions.invoke('generate-legion-story', {
          body: {
            legionType: type,
            pillarData: {
              stem: pillarData.stem,
              branch: pillarData.branch,
              nayin: result.nayin[pillar as keyof typeof result.nayin],
              tenGod: result.tenGods[pillar as keyof typeof result.tenGods],
              hiddenStems: result.hiddenStems[pillar as keyof typeof result.hiddenStems],
              shensha: pillarShensha,
              // 傳入數據標籤給 AI
              dataLabels
            },
            name: result.name,
            calculationId: calculationId
          }
        });

        if (error) {
          console.error(`生成${type}軍團故事失敗:`, error);
          stories[type] = '故事生成中...';
        } else if (storyData?.story) {
          stories[type] = storyData.story;
        }
      } catch (error) {
        console.error(`生成${type}軍團故事錯誤:`, error);
        stories[type] = '故事生成失敗，請稍後重試';
      }
    }

    // 更新結果中的故事
    setBaziResult(prev => prev ? {
      ...prev,
      legionStories: stories
    } : null);

    toast.success("軍團傳說故事生成完成！");
  };

  // 輔助函數：獲取天干五行
  const getElementFromStem = (stem: string): string => {
    const stemElements: Record<string, string> = {
      '甲': 'wood', '乙': 'wood',
      '丙': 'fire', '丁': 'fire',
      '戊': 'earth', '己': 'earth',
      '庚': 'metal', '辛': 'metal',
      '壬': 'water', '癸': 'water'
    };
    return stemElements[stem] || 'earth';
  };

  // 輔助函數：計算同類五行分數
  const getSameElementScore = (wuxing: BaziResult['wuxing'], element: string): number => {
    const supportMap: Record<string, string[]> = {
      'wood': ['wood', 'water'],
      'fire': ['fire', 'wood'],
      'earth': ['earth', 'fire'],
      'metal': ['metal', 'earth'],
      'water': ['water', 'metal']
    };
    const supporting = supportMap[element] || [];
    return supporting.reduce((sum, el) => sum + (wuxing[el as keyof typeof wuxing] || 0), 0);
  };

  // 輔助函數：計算異類五行分數
  const getOppositeElementScore = (wuxing: BaziResult['wuxing'], element: string): number => {
    const opposeMap: Record<string, string[]> = {
      'wood': ['metal', 'fire', 'earth'],
      'fire': ['water', 'earth', 'metal'],
      'earth': ['wood', 'metal', 'water'],
      'metal': ['fire', 'water', 'wood'],
      'water': ['earth', 'wood', 'fire']
    };
    const opposing = opposeMap[element] || [];
    return opposing.reduce((sum, el) => sum + (wuxing[el as keyof typeof wuxing] || 0), 0);
  };

  // 輔助函數：翻譯五行名稱
  const translateElement = (element: string): string => {
    const map: Record<string, string> = {
      'wood': '木', 'fire': '火', 'earth': '土', 'metal': '金', 'water': '水'
    };
    return map[element] || element;
  };

  const handleCalculate = async (formData: Record<string, unknown>) => {
    // Guest users can calculate but won't save to database
    if (!session && !isGuest) {
      toast.error("請先登入");
      navigate("/auth");
      return;
    }

    setCalculatingUserName(formData.name as string);
    setIsCalculating(true);
    
    try {
      // 调用后端计算 API
      const { data, error } = await supabase.functions.invoke('calculate-bazi', {
        body: {
          name: formData.name as string,
          gender: formData.gender as string,
          birthDate: (formData.birthDate as Date).toISOString(),
          birthTime: `${formData.hour}:00`,
          location: formData.location || null,
          useSolarTime: true,
          timezoneOffsetMinutes: formData.timezoneOffsetMinutes || 480
        }
      });

      if (error) throw error;

      if (data?.calculation) {
        // 計算四時軍團分析
        const fourSeasonsTeam = getFourSeasonsTeam(data.calculation.pillars);
        
        // 使用模組化神煞引擎計算神煞（含完整證據鏈）
        const shenshaEngine = new ModularShenshaEngine(shenshaRuleset);
        const shenshaMatches = shenshaEngine.calculate({
          dayStem: data.calculation.pillars.day.stem,
          yearBranch: data.calculation.pillars.year.branch,
          monthBranch: data.calculation.pillars.month.branch,
          dayBranch: data.calculation.pillars.day.branch,
          hourBranch: data.calculation.pillars.hour.branch,
          yearStem: data.calculation.pillars.year.stem,
          monthStem: data.calculation.pillars.month.stem,
          hourStem: data.calculation.pillars.hour.stem,
        });
        
        console.log('神煞計算結果:', shenshaMatches);
        
        const result: BaziResult = {
          name: formData.name as string,
          birthDate: formData.birthDate as Date,
          gender: formData.gender as string,
          pillars: data.calculation.pillars,
          hiddenStems: data.calculation.hiddenStems || {
            year: [],
            month: [],
            day: [],
            hour: []
          },
          tenGods: data.calculation.tenGods || {
            year: { stem: "待計算", branch: "待計算" },
            month: { stem: "待計算", branch: "待計算" },
            day: { stem: "待計算", branch: "待計算" },
            hour: { stem: "待計算", branch: "待計算" }
          },
          nayin: data.calculation.nayin,
          shensha: shenshaMatches,  // 使用新的模組化引擎計算結果
          wuxing: data.calculation.wuxingScores,
          yinyang: data.calculation.yinyangRatio,
          fourSeasonsTeam,
          calculationLogs: data.calculation.calculationLogs,
          legionStories: {}
        };
        
        setBaziResult(result);
        
        // Show different message for guest users
        if (isGuest) {
          toast.success("命盤生成成功！正在生成軍團傳說故事...");
        } else {
          toast.success("命盤生成成功！正在生成軍團傳說故事...");
        }

        // 生成四個軍團的AI故事
        generateLegionStories(result, data.calculation.id);
      }
    } catch (error: unknown) {
      console.error("計算失敗:", error);
      let errorMessage = 'Unknown error';
      
      if (error instanceof FunctionsHttpError) {
        try {
          const errorContext = await error.context.json();
          console.log('Function returned an error', errorContext);
          errorMessage = errorContext.error || error.message;
        } catch {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error("計算失敗：" + errorMessage);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadReport = async (options?: DialogPdfOptions) => {
    if (!baziResult) return;
    
    // 如果沒有提供選項，開啟選項對話框
    if (!options) {
      setIsPdfOptionsOpen(true);
      return;
    }
    
    setIsPdfOptionsOpen(false);
    setIsDownloading(true);
    try {
      const fileName = `${baziResult.name}_八字命盤報告_${new Date().toLocaleDateString("zh-TW").replace(/\//g, "")}.pdf`;
      
      // 準備封面資料
      const birthDateStr = baziResult.birthDate instanceof Date 
        ? baziResult.birthDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })
        : String(baziResult.birthDate);
      
      const coverData: CoverPageData = {
        name: baziResult.name,
        birthDate: birthDateStr,
        birthTime: baziResult.birthDate instanceof Date 
          ? baziResult.birthDate.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
          : "",
        gender: baziResult.gender,
        yearPillar: baziResult.pillars.year,
        monthPillar: baziResult.pillars.month,
        dayPillar: baziResult.pillars.day,
        hourPillar: baziResult.pillars.hour,
      };
      
      // 準備報告資料
      // 轉換神煞資料為 PDF 格式
      const shenshaForPdf = baziResult.shensha
        .filter((s): s is ShenshaMatch => typeof s !== 'string' && 'name' in s)
        .map((s) => ({
          name: s.name,
          position: s.evidence?.matched_pillar || '',
          category: s.category,
          effect: s.effect,
          modernMeaning: s.modernMeaning,
          rarity: s.rarity,
        }));

      const reportData: ReportData = {
        name: baziResult.name,
        gender: baziResult.gender,
        birthDate: birthDateStr,
        pillars: baziResult.pillars,
        nayin: baziResult.nayin,
        tenGods: baziResult.tenGods,
        hiddenStems: baziResult.hiddenStems,
        wuxing: baziResult.wuxing,
        yinyang: baziResult.yinyang,
        legionStories: baziResult.legionStories,
        shensha: shenshaForPdf,
      };
      
      // 轉換選項格式
      const pdfOptions: PdfOptions = {
        includeCover: options.includeCover,
        includeTableOfContents: options.includeTableOfContents,
        includePillars: options.includePillars,
        includeShensha: options.includeShensha,
        includeLegionDetails: options.includeLegionDetails,
        includeYearStory: options.includeYearStory,
        includeMonthStory: options.includeMonthStory,
        includeDayStory: options.includeDayStory,
        includeHourStory: options.includeHourStory,
      };
      
      await generatePDF("bazi-report-content", fileName, coverData, reportData, pdfOptions);
      toast.success(`報告下載成功！`);
    } catch (error) {
      console.error("下載報告失敗:", error);
      toast.error("下載報告失敗，請稍後再試");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
    {/* 頂部閱讀進度條 */}
    <ReadingProgressBar />
    
    {/* Loading 動畫覆蓋層 */}
    <LegionSummoningOverlay isVisible={isCalculating} userName={calculatingUserName} />
    
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* 頂部標題 */}
      <PageHeader
        showHomeButton={false}
        showAdminLink
        showMembershipBadge
        className="bg-background/80 py-6"
        leftSection={
          <div className="flex items-center gap-3">
            <img 
              src={logoSishi}
              alt="四時系統" 
              className="h-14 md:h-16 object-contain"
            />
            <div className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/version')}
                className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-0.5 rounded hover:bg-primary/20"
              >
                RSBZS v3.0
              </Button>
            </div>
          </div>
        }
        centerSection={
          <div className="flex-1 text-center">
            <h1 className="text-sm md:text-base font-semibold text-foreground/90">
              虹靈御所八字人生兵法
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              八字不是宿命，而是靈魂的戰場
            </p>
          </div>
        }
        rightSection={
          <>
            {isGuest && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-md">
                <UserRound className="h-4 w-4" />
                <span>訪客模式</span>
              </div>
            )}
            {(user || isGuest) && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isGuest ? "退出訪客" : "登出"}
              </Button>
            )}
          </>
        }
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Guest Mode Alert */}
        {isGuest && (
          <Alert className="border-primary/50 bg-primary/5">
            <UserRound className="h-4 w-4" />
            <AlertDescription>
              您正在使用訪客模式。
              <Button
                variant="link"
                className="h-auto p-0 ml-1"
                onClick={() => navigate("/auth")}
              >
                註冊帳戶
              </Button>
              以儲存您的計算歷史和享受完整功能。
            </AlertDescription>
          </Alert>
        )}
        

        {/* 區域1：資料輸入區 */}
        <section className="animate-fade-in space-y-4">
          {/* 神煞規則集切換 */}
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm text-muted-foreground">神煞規則集：</span>
            <ToggleGroup
              type="single"
              value={shenshaRuleset}
              onValueChange={(value) => value && setShenshaRuleset(value as 'trad' | 'legion')}
              className="bg-muted/50 rounded-lg p-1"
            >
              <ToggleGroupItem
                value="trad"
                aria-label="傳統版"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-4"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                傳統版 (20)
              </ToggleGroupItem>
              <ToggleGroupItem
                value="legion"
                aria-label="軍團版"
                className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground px-4"
              >
                <Swords className="h-4 w-4 mr-2" />
                軍團版 (34)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <BaziInputForm onCalculate={handleCalculate} isCalculating={isCalculating} userId={user?.id} />
        </section>

        {/* 當有計算結果時顯示以下區域 */}
        {baziResult && (
          <>
            {/* 報告導航 */}
            <ReportNavigation activeSection={activeSection} onSectionChange={scrollToSection} />

            {/* 下載與分享按鈕 */}
            <section className="animate-fade-in space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => handleDownloadReport()}
                  disabled={isDownloading}
                  className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-primary-foreground font-bold text-lg px-8 py-6 shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)] transition-all"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      正在生成報告...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      下載完整報告
                    </>
                  )}
                </Button>
                
                <ShareImageDialog 
                  name={baziResult.name}
                  gender={baziResult.gender}
                  pillars={baziResult.pillars}
                  nayin={baziResult.nayin}
                  legionStories={baziResult.legionStories}
                  wuxing={baziResult.wuxing}
                />
              </div>
              
              {/* PDF 選項對話框 */}
              <PdfOptionsDialog
                open={isPdfOptionsOpen}
                onOpenChange={setIsPdfOptionsOpen}
                onGenerate={(options) => handleDownloadReport(options)}
                isDownloading={isDownloading}
                hasLegionStories={{
                  year: !!baziResult.legionStories?.year,
                  month: !!baziResult.legionStories?.month,
                  day: !!baziResult.legionStories?.day,
                  hour: !!baziResult.legionStories?.hour,
                }}
              />
              
              {/* 快速社群分享 */}
              <div className="flex flex-wrap justify-center gap-3">
                <span className="text-sm text-muted-foreground self-center">快速分享：</span>
                <Button 
                  onClick={() => {
                    const text = `✨ ${baziResult.name}的八字命盤 ✨\n\n四柱：${baziResult.pillars.year.stem}${baziResult.pillars.year.branch} ${baziResult.pillars.month.stem}${baziResult.pillars.month.branch} ${baziResult.pillars.day.stem}${baziResult.pillars.day.branch} ${baziResult.pillars.hour.stem}${baziResult.pillars.hour.branch}\n\n🔮 虹靈御所 - 八字人生兵法\n你不是棋子，而是指揮官`;
                    const lineUrl = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`;
                    window.open(lineUrl, '_blank', 'width=600,height=600');
                    toast.success("已開啟 LINE 分享");
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-[#00B900]/10 border-[#00B900]/50 text-[#00B900] hover:bg-[#00B900]/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  LINE
                </Button>
                <Button 
                  onClick={() => {
                    const text = `✨ ${baziResult.name}的八字命盤 ✨\n\n四柱：${baziResult.pillars.year.stem}${baziResult.pillars.year.branch} ${baziResult.pillars.month.stem}${baziResult.pillars.month.branch} ${baziResult.pillars.day.stem}${baziResult.pillars.day.branch} ${baziResult.pillars.hour.stem}${baziResult.pillars.hour.branch}\n\n🔮 虹靈御所 - 八字人生兵法\n你不是棋子，而是指揮官`;
                    const fbUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
                    window.open(fbUrl, '_blank', 'width=600,height=600');
                    toast.success("已開啟 Facebook 分享");
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-[#1877F2]/10 border-[#1877F2]/50 text-[#1877F2] hover:bg-[#1877F2]/20"
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button 
                  onClick={() => {
                    const text = `✨ ${baziResult.name}的八字命盤 ✨\n\n四柱：${baziResult.pillars.year.stem}${baziResult.pillars.year.branch} ${baziResult.pillars.month.stem}${baziResult.pillars.month.branch} ${baziResult.pillars.day.stem}${baziResult.pillars.day.branch} ${baziResult.pillars.hour.stem}${baziResult.pillars.hour.branch}\n\n🔮 虹靈御所 - 八字人生兵法`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                    window.open(twitterUrl, '_blank', 'width=600,height=600');
                    toast.success("已開啟 X (Twitter) 分享");
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-foreground/30 hover:bg-foreground/10"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </Button>
              </div>
            </section>

            {/* 報告內容區 - 用於 PDF 生成 */}
            <div id="bazi-report-content" className="space-y-6 relative">
              {/* 專業報告頭部 */}
              <section className="animate-fade-in">
                <ProfessionalReportHeader 
                  name={baziResult.name}
                  gender={baziResult.gender}
                  birthDate={baziResult.birthDate instanceof Date 
                    ? baziResult.birthDate.toLocaleDateString("zh-TW") 
                    : String(baziResult.birthDate)}
                  dayMaster={baziResult.pillars.day.stem}
                />
              </section>

              {/* 章節控制面板 */}
              <ReportControls
                expandedCount={expandedCount}
                totalCount={totalSections}
                onExpandAll={handleExpandAll}
                onCollapseAll={handleCollapseAll}
              />

              {/* 命盤總覽 */}
              <ReportSection
                ref={sectionRefs.summary}
                id="summary"
                title="命盤總覽"
                subtitle="核心指標與運勢概覽"
                icon={LayoutDashboard}
                iconColor="text-indigo-400"
                bgGradient="from-report-card via-report-card to-report-bg"
                borderColor="border-indigo-500/30"
                order={1}
                expanded={sectionExpandedState.summary}
                onExpandedChange={(expanded) => handleSectionExpandedChange('summary', expanded)}
              >
                <ReportSummary baziResult={baziResult} />
              </ReportSection>

              <ReportDivider variant="decorative" />

              {/* 傳統八字排盤區 */}
              <ReportSection
                ref={sectionRefs.bazi}
                id="bazi"
                title="傳統八字排盤"
                subtitle="四柱干支與藏干分析"
                icon={Scroll}
                iconColor="text-amber-400"
                bgGradient="from-report-card via-report-card to-report-bg"
                borderColor="border-amber-500/30"
                order={2}
                expanded={sectionExpandedState.bazi}
                onExpandedChange={(expanded) => handleSectionExpandedChange('bazi', expanded)}
              >
                <TraditionalBaziDisplay baziResult={baziResult} />
              </ReportSection>

              <ReportDivider variant="decorative" />

              {/* 四時軍團故事區（兵法為重）*/}
              <ReportSection
                ref={sectionRefs.legion}
                id="legion"
                title="四時軍團傳說"
                subtitle="軍團敘事與兵法智慧"
                icon={Shield}
                iconColor="text-orange-400"
                bgGradient="from-report-card via-report-card to-report-bg"
                borderColor="border-orange-500/30"
                order={3}
                expanded={sectionExpandedState.legion}
                onExpandedChange={(expanded) => handleSectionExpandedChange('legion', expanded)}
              >
                <LegionCards baziResult={baziResult} shenshaRuleset={shenshaRuleset} isPremium={hasAccess} onUpgrade={handleUpgrade} />
              </ReportSection>

              <ReportDivider variant="gradient" />

              {/* ===== 詳細分析區開始（收費內容）===== */}
              
              {/* 十神關係分析區 */}
              <ReportSection
                ref={sectionRefs.tenGods}
                id="tenGods"
                title="十神深度分析"
                subtitle="命理核心關係解讀"
                icon={Crown}
                iconColor="text-purple-400"
                bgGradient="from-report-card via-report-card to-report-bg"
                borderColor="border-purple-500/30"
                order={4}
                expanded={sectionExpandedState.tenGods}
                onExpandedChange={(expanded) => handleSectionExpandedChange('tenGods', expanded)}
              >
                <PremiumGate isPremium={hasAccess} title="十神深度分析" description="升級收費版解鎖完整十神關係解讀" onUpgrade={handleUpgrade} membershipSource={membershipSource} tier={tier}>
                  <TenGodsAnalysis baziResult={baziResult} />
                </PremiumGate>
              </ReportSection>

              {/* 神煞統計分析區 */}
              {baziResult.shensha && baziResult.shensha.length > 0 && (
                <ReportSection
                  ref={sectionRefs.shensha}
                  id="shensha"
                  title="神煞統計分析"
                  subtitle="吉凶星曜與運勢影響"
                  icon={Sparkles}
                  iconColor="text-fuchsia-400"
                  bgGradient="from-report-card via-report-card to-report-bg"
                  borderColor="border-fuchsia-500/30"
                  order={5}
                  expanded={sectionExpandedState.shensha}
                  onExpandedChange={(expanded) => handleSectionExpandedChange('shensha', expanded)}
                >
                  <PremiumGate isPremium={hasAccess} title="神煞統計分析" description="升級收費版查看完整神煞統計與解讀" onUpgrade={handleUpgrade} membershipSource={membershipSource} tier={tier}>
                    <ShenshaStats shenshaList={baziResult.shensha.filter((s): s is ShenshaMatch => typeof s === 'object' && 'evidence' in s)} />
                  </PremiumGate>
                </ReportSection>
              )}

              {/* 性格深度分析區 */}
              <ReportSection
                ref={sectionRefs.personality}
                id="personality"
                title="性格深度剖析"
                subtitle="內在特質與行為模式"
                icon={User}
                iconColor="text-teal-400"
                bgGradient="from-report-card via-report-card to-report-bg"
                borderColor="border-teal-500/30"
                order={6}
                expanded={sectionExpandedState.personality}
                onExpandedChange={(expanded) => handleSectionExpandedChange('personality', expanded)}
              >
                <PremiumGate isPremium={hasAccess} title="性格深度剖析" description="升級收費版獲取完整性格分析報告" onUpgrade={handleUpgrade} membershipSource={membershipSource} tier={tier}>
                  <PersonalityAnalysis baziResult={baziResult} />
                </PremiumGate>
              </ReportSection>

              {/* 納音五行分析區 */}
              <ReportSection
                id="nayin"
                title="納音五行詳解"
                subtitle="六十甲子納音命理"
                icon={BookOpen}
                iconColor="text-cyan-400"
                bgGradient="from-report-card via-report-card to-report-bg"
                borderColor="border-cyan-500/30"
                order={7}
                expanded={sectionExpandedState.nayin}
                onExpandedChange={(expanded) => handleSectionExpandedChange('nayin', expanded)}
              >
                <PremiumGate isPremium={hasAccess} title="納音五行詳解" description="升級收費版了解納音深層含義" onUpgrade={handleUpgrade} membershipSource={membershipSource} tier={tier}>
                  <NayinAnalysis nayin={baziResult.nayin} />
                </PremiumGate>
              </ReportSection>

              {/* 五行陰陽分析區 */}
              <ReportSection
                ref={sectionRefs.analysis}
                id="analysis"
                title="五行陰陽圖表"
                subtitle="命盤能量分布可視化"
                icon={BarChart3}
                iconColor="text-emerald-400"
                bgGradient="from-report-card via-report-card to-report-bg"
                borderColor="border-emerald-500/30"
                order={8}
                expanded={sectionExpandedState.analysis}
                onExpandedChange={(expanded) => handleSectionExpandedChange('analysis', expanded)}
              >
                <PremiumGate isPremium={hasAccess} title="五行陰陽圖表" description="升級收費版查看完整五行平衡分析" onUpgrade={handleUpgrade} membershipSource={membershipSource} tier={tier}>
                  <AnalysisCharts baziResult={baziResult} />
                </PremiumGate>
              </ReportSection>

              {/* 計算日誌區 */}
              {baziResult.calculationLogs && (
                <ReportSection
                  ref={sectionRefs.logs}
                  id="logs"
                  title="計算日誌"
                  subtitle="排盤過程與演算紀錄"
                  icon={FileText}
                  iconColor="text-slate-400"
                  bgGradient="from-report-card via-report-card to-report-bg"
                  borderColor="border-slate-500/30"
                  decorative={false}
                  order={9}
                  expanded={sectionExpandedState.logs}
                  onExpandedChange={(expanded) => handleSectionExpandedChange('logs', expanded)}
                >
                  <CalculationLogs logs={baziResult.calculationLogs} />
                </ReportSection>
              )}

              {/* 側邊進度指示器 */}
              <ReportProgress
                sections={[
                  { id: 'summary', label: '總覽' },
                  { id: 'bazi', label: '八字排盤' },
                  { id: 'legion', label: '軍團故事' },
                  { id: 'tenGods', label: '十神分析' },
                  { id: 'shensha', label: '神煞分析' },
                  { id: 'personality', label: '性格分析' },
                  { id: 'analysis', label: '五行分析' },
                  { id: 'logs', label: '計算日誌' },
                ]}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
            </div>
          </>
        )}
      </main>

      {/* 底部 */}
      <footer className="border-t border-border/50 mt-16 py-8 bg-stone-950/50">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img 
              src={logoHonglingyusuo}
              alt="虹靈御所 Rainbow Sanctuary - 八字命理系統" 
              className="h-12 object-contain"
            />
            <p className="text-muted-foreground text-center">
              你不是棋子，而是指揮官
            </p>
            <img 
              src={logoChaoxuan}
              alt="超烜創意 Maison de Chao - 創意設計" 
              className="h-12 object-contain"
            />
          </div>
          
          {/* 版權宣告 */}
          <div className="pt-4 border-t border-border/30 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              © 2025 虹靈御所 HongLing YuSuo｜超烜創意 Chaoxuan Creative. All Rights Reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              本系統僅供參考，命理展示的是一條「相對好走但不一定是你要走的路」，選擇權在於你。
            </p>
          </div>
        </div>
      </footer>

      {/* AI 命理諮詢 */}
      <AiFortuneConsult 
        isOpen={isAiConsultOpen}
        onClose={() => setIsAiConsultOpen(false)}
        baziResult={baziResult}
      />
    </div>
    </>
  );
};

export default Index;
