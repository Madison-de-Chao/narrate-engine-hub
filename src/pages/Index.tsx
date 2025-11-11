import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BaziInputForm } from "@/components/BaziInputForm";
import { TraditionalBaziDisplay } from "@/components/TraditionalBaziDisplay";
import { LegionCards } from "@/components/LegionCards";
import { AnalysisCharts } from "@/components/AnalysisCharts";
import { Button } from "@/components/ui/button";
import { Download, Loader2, LogOut } from "lucide-react";
import { generatePDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";
import type { User, Session } from "@supabase/supabase-js";

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
  hiddenStems: any;
  tenGods: any;
  nayin: any;
  shensha: string[];
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
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // 设置认证状态监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("已退出登录");
    navigate("/auth");
  };

  const handleCalculate = async (formData: any) => {
    if (!session) {
      toast.error("请先登录");
      navigate("/auth");
      return;
    }

    setIsCalculating(true);
    
    try {
      // 调用后端计算 API
      const { data, error } = await supabase.functions.invoke('calculate-bazi', {
        body: {
          name: formData.name,
          gender: formData.gender,
          birthDate: formData.birthDate.toISOString(),
          birthTime: `${formData.hour}:00`,
          location: formData.location || null,
          useSolarTime: true
        }
      });

      if (error) throw error;

      if (data?.calculation) {
        const result: BaziResult = {
          name: formData.name,
          birthDate: formData.birthDate,
          gender: formData.gender,
          pillars: data.calculation.pillars,
          hiddenStems: {},
          tenGods: {},
          nayin: data.calculation.nayin,
          shensha: [],
          wuxing: data.calculation.wuxingScores,
          yinyang: data.calculation.yinyangRatio
        };
        
        setBaziResult(result);
        toast.success("命盘生成成功！");
      }
    } catch (error: any) {
      console.error("计算失败:", error);
      toast.error("计算失败：" + error.message);
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
      {/* 顶部标题 */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <img 
              src="/src/assets/logo-sishi.png" 
              alt="四時系統" 
              className="h-16 md:h-20 object-contain"
            />
            <div className="flex-1 text-center">
              <p className="text-lg md:text-xl text-muted-foreground">
                八字不是宿命，而是靈魂的戰場
              </p>
            </div>
            {user && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                登出
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* 區域1：資料輸入區 */}
        <section className="animate-fade-in">
          <BaziInputForm onCalculate={handleCalculate} isCalculating={isCalculating} />
        </section>

        {/* 當有計算結果時顯示以下區域 */}
        {baziResult && (
          <>
            {/* 下載按鈕 */}
            <section className="animate-fade-in flex justify-center">
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
              {/* 區域2：傳統八字排盤區 */}
              <section className="animate-fade-in">
                <TraditionalBaziDisplay baziResult={baziResult} />
              </section>

              {/* 區域3：四時軍團分析區 */}
              <section className="animate-fade-in">
                <LegionCards baziResult={baziResult} />
              </section>

              {/* 區域4：詳細分析區 */}
              <section className="animate-fade-in">
                <AnalysisCharts baziResult={baziResult} />
              </section>
            </div>
          </>
        )}
      </main>

      {/* 底部 */}
      <footer className="border-t border-border/50 mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img 
              src="/src/assets/logo-honglingyusuo.png" 
              alt="虹靈御所" 
              className="h-12 object-contain"
            />
            <p className="text-muted-foreground text-center">
              你不是棋子，而是指揮官
            </p>
            <img 
              src="/src/assets/logo-chaoxuan.png" 
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
