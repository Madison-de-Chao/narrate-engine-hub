import { useState } from "react";
import { BaziInputForm } from "@/components/BaziInputForm";
import { TraditionalBaziDisplay } from "@/components/TraditionalBaziDisplay";
import { LegionCards } from "@/components/LegionCards";
import { AnalysisCharts } from "@/components/AnalysisCharts";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generatePDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";

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
  const [baziResult, setBaziResult] = useState<BaziResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCalculate = async (formData: any) => {
    setIsCalculating(true);
    
    // TODO: 調用後端計算 API
    // 暫時使用模擬數據
    setTimeout(() => {
      const mockResult: BaziResult = {
        name: formData.name,
        birthDate: formData.birthDate,
        gender: formData.gender,
        pillars: {
          year: { stem: "乙", branch: "丑" },
          month: { stem: "乙", branch: "酉" },
          day: { stem: "戊", branch: "寅" },
          hour: { stem: "壬", branch: "戌" },
        },
        hiddenStems: {
          year: ["癸", "辛", "己"],
          month: ["辛"],
          day: ["甲", "丙", "戊"],
          hour: ["辛", "丁", "戊"],
        },
        tenGods: {
          year: { stem: "偏印", branch: "比肩" },
          month: { stem: "偏印", branch: "傷官" },
          day: { stem: "日主", branch: "偏財" },
          hour: { stem: "正財", branch: "食神" },
        },
        nayin: {
          year: "海中金",
          month: "泉中水",
          day: "城牆土",
          hour: "大海水",
        },
        shensha: ["天乙貴人", "文昌貴人", "桃花", "驛馬"],
        wuxing: {
          wood: 3.2,
          fire: 1.8,
          earth: 4.5,
          metal: 3.8,
          water: 2.7,
        },
        yinyang: {
          yin: 45,
          yang: 55,
        },
      };
      
      setBaziResult(mockResult);
      setIsCalculating(false);
    }, 2000);
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
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent text-neon">
            🌈 虹靈御所八字人生兵法
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            八字不是宿命，而是靈魂的戰場
          </p>
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
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 虹靈御所 • 你不是棋子，而是指揮官</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
