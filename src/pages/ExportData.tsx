import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileJson, Code, BookOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";

// 匯入所有資料
import baziCalculatorCode from "@/lib/baziCalculator.ts?raw";
import fourSeasonsAnalyzerCode from "@/lib/fourSeasonsAnalyzer.ts?raw";
import shenshaCalculatorCode from "@/lib/shenshaCalculator.ts?raw";
import shenshaRuleEngineCode from "@/lib/shenshaRuleEngine.ts?raw";
import shenshaTypesCode from "@/data/shenshaTypes.ts?raw";

// 傳統版神煞
import tianyiGuiren from "@/data/shensha_trad/tianyi_guiren.json";
import wenchangGuiren from "@/data/shensha_trad/wenchang_guiren.json";
import taijiGuiren from "@/data/shensha_trad/taiji_guiren.json";
import taohua from "@/data/shensha_trad/taohua.json";
import yima from "@/data/shensha_trad/yima.json";
import yangren from "@/data/shensha_trad/yangren.json";
import tiande from "@/data/shensha_trad/tiande.json";
import yuede from "@/data/shensha_trad/yuede.json";
import hongluan from "@/data/shensha_trad/hongluan.json";
import tianxi from "@/data/shensha_trad/tianxi.json";
import guchen from "@/data/shensha_trad/guchen.json";
import guasu from "@/data/shensha_trad/guasu.json";
import jiesha from "@/data/shensha_trad/jiesha.json";
import wangshen from "@/data/shensha_trad/wangshen.json";
import zaisha from "@/data/shensha_trad/zaisha.json";
import huagai from "@/data/shensha_trad/huagai.json";
import jiangxing from "@/data/shensha_trad/jiangxing.json";
import kongwang from "@/data/shensha_trad/kongwang.json";
import kuigang from "@/data/shensha_trad/kuigang.json";
import xianchi from "@/data/shensha_trad/xianchi.json";
import xuetang from "@/data/shensha_trad/xuetang.json";
import jinyu from "@/data/shensha_trad/jinyu.json";
import fuxingGuiren from "@/data/shensha_trad/fuxing_guiren.json";
import tianchu from "@/data/shensha_trad/tianchu.json";
import tianguanGuiren from "@/data/shensha_trad/tianguan_guiren.json";
import tiandeHe from "@/data/shensha_trad/tiande_he.json";
import yuedeHe from "@/data/shensha_trad/yuede_he.json";
import santai from "@/data/shensha_trad/santai.json";
import bazuo from "@/data/shensha_trad/bazuo.json";
import baihu from "@/data/shensha_trad/baihu.json";
import tiangou from "@/data/shensha_trad/tiangou.json";
import pima from "@/data/shensha_trad/pima.json";
import sangmen from "@/data/shensha_trad/sangmen.json";
import liuxia from "@/data/shensha_trad/liuxia.json";
import guanfu from "@/data/shensha_trad/guanfu.json";
import tianxing from "@/data/shensha_trad/tianxing.json";
import bingfu from "@/data/shensha_trad/bingfu.json";
import wugui from "@/data/shensha_trad/wugui.json";
import muyuTaohua from "@/data/shensha_trad/muyu_taohua.json";
import tianluo from "@/data/shensha_trad/tianluo.json";
import diwang from "@/data/shensha_trad/diwang.json";
import yinyangChacuo from "@/data/shensha_trad/yinyang_chacuo.json";
import fuyin from "@/data/shensha_trad/fuyin.json";
import fanyin from "@/data/shensha_trad/fanyin.json";
import shieDabai from "@/data/shensha_trad/shie_dabai.json";
import sifei from "@/data/shensha_trad/sifei.json";

// 軍團版神煞
import qiangTaohua from "@/data/shensha_legion/qiang_taohua.json";
import shuangGuiren from "@/data/shensha_legion/shuang_guiren.json";
import jixingGaozhao from "@/data/shensha_legion/jixing_gaozhao.json";
import yimaFenxing from "@/data/shensha_legion/yima_fenxing.json";
import wenchangHuagai from "@/data/shensha_legion/wenchang_huagai.json";
import hongluanTianxi from "@/data/shensha_legion/hongluan_tianxi.json";
import guchenGuasu from "@/data/shensha_legion/guchen_guasu.json";
import yangrenQisha from "@/data/shensha_legion/yangren_qisha.json";
import kongwangShuangkong from "@/data/shensha_legion/kongwang_shuangkong.json";
import kuigangChongchong from "@/data/shensha_legion/kuigang_chongchong.json";
import tianluoDiwang from "@/data/shensha_legion/tianluo_diwang.json";
import liuheGuiren from "@/data/shensha_legion/liuhe_guiren.json";
import sanheGuiju from "@/data/shensha_legion/sanhe_guiju.json";
import fudeGuiren from "@/data/shensha_legion/fude_guiren.json";

// 傳統版神煞列表
const tradShenshaList = [
  { name: "tianyi_guiren", data: tianyiGuiren },
  { name: "wenchang_guiren", data: wenchangGuiren },
  { name: "taiji_guiren", data: taijiGuiren },
  { name: "taohua", data: taohua },
  { name: "yima", data: yima },
  { name: "yangren", data: yangren },
  { name: "tiande", data: tiande },
  { name: "yuede", data: yuede },
  { name: "hongluan", data: hongluan },
  { name: "tianxi", data: tianxi },
  { name: "guchen", data: guchen },
  { name: "guasu", data: guasu },
  { name: "jiesha", data: jiesha },
  { name: "wangshen", data: wangshen },
  { name: "zaisha", data: zaisha },
  { name: "huagai", data: huagai },
  { name: "jiangxing", data: jiangxing },
  { name: "kongwang", data: kongwang },
  { name: "kuigang", data: kuigang },
  { name: "xianchi", data: xianchi },
  { name: "xuetang", data: xuetang },
  { name: "jinyu", data: jinyu },
  { name: "fuxing_guiren", data: fuxingGuiren },
  { name: "tianchu", data: tianchu },
  { name: "tianguan_guiren", data: tianguanGuiren },
  { name: "tiande_he", data: tiandeHe },
  { name: "yuede_he", data: yuedeHe },
  { name: "santai", data: santai },
  { name: "bazuo", data: bazuo },
  { name: "baihu", data: baihu },
  { name: "tiangou", data: tiangou },
  { name: "pima", data: pima },
  { name: "sangmen", data: sangmen },
  { name: "liuxia", data: liuxia },
  { name: "guanfu", data: guanfu },
  { name: "tianxing", data: tianxing },
  { name: "bingfu", data: bingfu },
  { name: "wugui", data: wugui },
  { name: "muyu_taohua", data: muyuTaohua },
  { name: "tianluo", data: tianluo },
  { name: "diwang", data: diwang },
  { name: "yinyang_chacuo", data: yinyangChacuo },
  { name: "fuyin", data: fuyin },
  { name: "fanyin", data: fanyin },
  { name: "shie_dabai", data: shieDabai },
  { name: "sifei", data: sifei }
];

// 軍團版神煞列表
const legionShenshaList = [
  { name: "qiang_taohua", data: qiangTaohua },
  { name: "shuang_guiren", data: shuangGuiren },
  { name: "jixing_gaozhao", data: jixingGaozhao },
  { name: "yima_fenxing", data: yimaFenxing },
  { name: "wenchang_huagai", data: wenchangHuagai },
  { name: "hongluan_tianxi", data: hongluanTianxi },
  { name: "guchen_guasu", data: guchenGuasu },
  { name: "yangren_qisha", data: yangrenQisha },
  { name: "kongwang_shuangkong", data: kongwangShuangkong },
  { name: "kuigang_chongchong", data: kuigangChongchong },
  { name: "tianluo_diwang", data: tianluoDiwang },
  { name: "liuhe_guiren", data: liuheGuiren },
  { name: "sanhe_guiju", data: sanheGuiju },
  { name: "fude_guiren", data: fudeGuiren }
];

const ExportData = () => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (content: string, filename: string, type = "application/json") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllAsJson = () => {
    setIsExporting(true);
    try {
      const allData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "3.0",
          description: "八字計算系統完整資料匯出"
        },
        coreModules: {
          baziCalculator: {
            description: "八字核心計算引擎",
            code: baziCalculatorCode
          },
          fourSeasonsAnalyzer: {
            description: "四時軍團分析器",
            code: fourSeasonsAnalyzerCode
          },
          shenshaCalculator: {
            description: "神煞計算器",
            code: shenshaCalculatorCode
          },
          shenshaRuleEngine: {
            description: "神煞規則引擎",
            code: shenshaRuleEngineCode
          },
          shenshaTypes: {
            description: "神煞類型定義",
            code: shenshaTypesCode
          }
        },
        traditionalShensha: tradShenshaList.reduce((acc, item) => {
          acc[item.name] = item.data;
          return acc;
        }, {} as Record<string, unknown>),
        legionShensha: legionShenshaList.reduce((acc, item) => {
          acc[item.name] = item.data;
          return acc;
        }, {} as Record<string, unknown>)
      };

      downloadFile(JSON.stringify(allData, null, 2), "bazi-complete-export.json");
      toast.success("匯出成功！");
    } catch (error) {
      toast.error("匯出失敗");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportTradShensha = () => {
    const data = tradShenshaList.reduce((acc, item) => {
      acc[item.name] = item.data;
      return acc;
    }, {} as Record<string, unknown>);
    downloadFile(JSON.stringify(data, null, 2), "shensha-traditional.json");
    toast.success("傳統版神煞已匯出！");
  };

  const exportLegionShensha = () => {
    const data = legionShenshaList.reduce((acc, item) => {
      acc[item.name] = item.data;
      return acc;
    }, {} as Record<string, unknown>);
    downloadFile(JSON.stringify(data, null, 2), "shensha-legion.json");
    toast.success("軍團版神煞已匯出！");
  };

  const exportCoreCode = () => {
    const codeBundle = `
// ==========================================
// 八字計算系統核心模組
// 匯出時間: ${new Date().toISOString()}
// ==========================================

// ==========================================
// 1. 八字計算引擎 (baziCalculator.ts)
// ==========================================
${baziCalculatorCode}

// ==========================================
// 2. 四時軍團分析器 (fourSeasonsAnalyzer.ts)
// ==========================================
${fourSeasonsAnalyzerCode}

// ==========================================
// 3. 神煞計算器 (shenshaCalculator.ts)
// ==========================================
${shenshaCalculatorCode}

// ==========================================
// 4. 神煞規則引擎 (shenshaRuleEngine.ts)
// ==========================================
${shenshaRuleEngineCode}

// ==========================================
// 5. 神煞類型定義 (shenshaTypes.ts)
// ==========================================
${shenshaTypesCode}
`;
    downloadFile(codeBundle, "bazi-core-modules.ts", "text/typescript");
    toast.success("核心模組程式碼已匯出！");
  };

  const exportFourSeasons = () => {
    downloadFile(fourSeasonsAnalyzerCode, "fourSeasonsAnalyzer.ts", "text/typescript");
    toast.success("四時軍團分析器已匯出！");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">八字系統資料匯出</h1>
          <p className="text-muted-foreground">
            匯出完整的八字計算邏輯、神煞規則和四時軍團設定
          </p>
        </div>

        {/* 完整匯出 */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              完整匯出
            </CardTitle>
            <CardDescription>
              一鍵匯出所有資料（核心模組 + 傳統神煞 + 軍團神煞）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={exportAllAsJson} 
              disabled={isExporting}
              size="lg"
              className="w-full"
            >
              <Download className="mr-2 h-5 w-5" />
              {isExporting ? "匯出中..." : "下載完整資料包 (JSON)"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 核心模組 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                核心計算模組
              </CardTitle>
              <CardDescription>
                八字計算引擎、神煞規則引擎的完整程式碼
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={exportCoreCode} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                匯出核心模組 (.ts)
              </Button>
            </CardContent>
          </Card>

          {/* 四時軍團 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                四時軍團設定
              </CardTitle>
              <CardDescription>
                春生、夏旺、秋收、冬藏軍團的完整配置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={exportFourSeasons} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                匯出四時軍團 (.ts)
              </Button>
            </CardContent>
          </Card>

          {/* 傳統神煞 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                傳統版神煞 ({tradShenshaList.length}個)
              </CardTitle>
              <CardDescription>
                天乙貴人、桃花、驛馬、華蓋等傳統神煞規則
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportTradShensha} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                匯出傳統神煞 (JSON)
              </Button>
            </CardContent>
          </Card>

          {/* 軍團神煞 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                軍團版神煞 ({legionShenshaList.length}個)
              </CardTitle>
              <CardDescription>
                強桃花、雙貴人、吉星高照等組合神煞規則
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={exportLegionShensha} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                匯出軍團神煞 (JSON)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 資料統計 */}
        <Card>
          <CardHeader>
            <CardTitle>資料統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">核心模組</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-green-500">{tradShenshaList.length}</div>
                <div className="text-sm text-muted-foreground">傳統神煞</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-purple-500">{legionShenshaList.length}</div>
                <div className="text-sm text-muted-foreground">軍團神煞</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-amber-500">4</div>
                <div className="text-sm text-muted-foreground">四時軍團</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 傳統神煞清單 */}
        <Card>
          <CardHeader>
            <CardTitle>傳統版神煞清單</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {tradShenshaList.map((item) => (
                <div 
                  key={item.name} 
                  className="p-2 text-sm rounded bg-muted text-center"
                  title={JSON.stringify(item.data, null, 2)}
                >
                  {(item.data as { name: string }).name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 軍團神煞清單 */}
        <Card>
          <CardHeader>
            <CardTitle>軍團版神煞清單</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {legionShenshaList.map((item) => (
                <div 
                  key={item.name} 
                  className="p-2 text-sm rounded bg-primary/10 text-center border border-primary/30"
                  title={JSON.stringify(item.data, null, 2)}
                >
                  {(item.data as { name: string }).name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportData;
