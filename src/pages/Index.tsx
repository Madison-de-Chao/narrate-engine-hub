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
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Download, Loader2, LogOut, UserRound, Sparkles, Swords, BookOpen } from "lucide-react";
import { generatePDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import { FunctionsHttpError, type User, type Session } from "@supabase/supabase-js";
import { useGuestMode } from "@/hooks/useGuestMode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import logoSishi from "@/assets/logo-sishi.png";
import logoHonglingyusuo from "@/assets/logo-honglingyusuo.png";
import logoChaoxuan from "@/assets/logo-chaoxuan.png";
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState('summary');
  const [shenshaRuleset, setShenshaRuleset] = useState<'trad' | 'legion'>('trad');

  // Section refs for scrolling
  const sectionRefs = {
    summary: useRef<HTMLDivElement>(null),
    bazi: useRef<HTMLDivElement>(null),
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
    
    for (const { type, pillar } of legionTypes) {
      try {
        const pillarData = result.pillars[pillar as keyof typeof result.pillars];
        const { data: storyData, error } = await supabase.functions.invoke('generate-legion-story', {
          body: {
            legionType: type,
            pillarData: {
              stem: pillarData.stem,
              branch: pillarData.branch,
              nayin: result.nayin[pillar as keyof typeof result.nayin],
              tenGod: result.tenGods[pillar as keyof typeof result.tenGods],
              hiddenStems: result.hiddenStems[pillar as keyof typeof result.hiddenStems]
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

  const handleCalculate = async (formData: Record<string, unknown>) => {
    // Guest users can calculate but won't save to database
    if (!session && !isGuest) {
      toast.error("請先登入");
      navigate("/auth");
      return;
    }

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

  const handleDownloadReport = async () => {
    if (!baziResult) return;
    
    setIsDownloading(true);
    try {
      const fileName = `${baziResult.name}_八字命盤報告_${new Date().toLocaleDateString("zh-TW").replace(/\//g, "")}.pdf`;
      await generatePDF("bazi-report-content", fileName);
      toast.success("報告下載成功！");
    } catch (error) {
      console.error("下載報告失敗:", error);
      toast.error("下載報告失敗，請稍後再試");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* 頂部標題 */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <img 
              src={logoSishi}
              alt="四時系統" 
              className="h-16 md:h-20 object-contain"
            />
            <div className="flex-1 text-center">
              <p className="text-lg md:text-xl text-muted-foreground">
                八字不是宿命，而是靈魂的戰場
              </p>
            </div>
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </header>

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

            {/* 下載按鈕 */}
            <section className="animate-fade-in flex justify-center gap-4">
              <Button
                onClick={handleDownloadReport}
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
            </section>

            {/* 報告內容區 - 用於 PDF 生成 */}
            <div id="bazi-report-content" className="space-y-8">
              {/* 命盤總覽 */}
              <section ref={sectionRefs.summary} className="animate-fade-in scroll-mt-36">
                <ReportSummary baziResult={baziResult} />
              </section>

              {/* 傳統八字排盤區 */}
              <section ref={sectionRefs.bazi} className="animate-fade-in scroll-mt-36">
                <TraditionalBaziDisplay baziResult={baziResult} />
              </section>

              {/* 四時軍團分析區 */}
              <section ref={sectionRefs.legion} className="animate-fade-in scroll-mt-36">
                <LegionCards baziResult={baziResult} />
              </section>

              {/* 神煞統計分析區 */}
              {baziResult.shensha && baziResult.shensha.length > 0 && (
                <section className="animate-fade-in scroll-mt-36">
                  <ShenshaStats shenshaList={baziResult.shensha.filter((s): s is ShenshaMatch => typeof s === 'object' && 'evidence' in s)} />
                </section>
              )}

              {/* 詳細分析區 */}
              <section ref={sectionRefs.analysis} className="animate-fade-in scroll-mt-36">
                <AnalysisCharts baziResult={baziResult} />
              </section>

              {/* 計算日誌區 */}
              {baziResult.calculationLogs && (
                <section ref={sectionRefs.logs} className="animate-fade-in scroll-mt-36">
                  <CalculationLogs logs={baziResult.calculationLogs} />
                </section>
              )}
            </div>
          </>
        )}
      </main>

      {/* 底部 */}
      <footer className="border-t border-border/50 mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img 
              src={logoHonglingyusuo}
              alt="虹靈御所" 
              className="h-12 object-contain"
            />
            <p className="text-muted-foreground text-center">
              你不是棋子，而是指揮官
            </p>
            <img 
              src={logoChaoxuan}
              alt="超烜創意" 
              className="h-12 object-contain"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
