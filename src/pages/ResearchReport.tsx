import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Shield, 
  Users, 
  Globe, 
  Sparkles,
  Database,
  Palette,
  Lock,
  Brain,
  Target,
  Zap,
  FileText,
  Building2,
  Gamepad2,
  HeartPulse,
  Bot,
  Download,
  FileDown,
  ScrollText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { downloadDocPdf, downloadDocWord, DocSection } from "@/lib/documentDownloadUtils";

// ============ 研究報告下載用章節 ============
const getResearchSections = (): DocSection[] => [
  {
    title: '完整系統介紹',
    items: [
      '「RSBZS四時軍團八字人生兵法系統」是一套由超烜創意團隊研發，結合傳統命理學與現代 AI 技術的全方位八字分析平台。',
      '系統全名為 Rainbow Sanctuary BaZi System（RSBZS），消費者品牌名稱為「虹靈御所」。',
      '核心理念：「這份分析是鏡子，不是劇本」——提供觀察角度與可執行建議，選擇權永遠在使用者手上。',
      '系統追求四大品質：清楚（精準呈現能量配置）、克制（區分可驗證資訊與推論）、有美感（宇宙建築師視覺風格）、可執行（每段分析附帶具體行動建議）。',
      '技術基礎：支援 1850-2100 年節氣精準計算、真太陽時校正、跨日子時處理，計算精度達太陽黃經 < 0.01° 誤差。',
      '獨創「四時八字軍團兵法」敘事框架：將八字四柱映射為四個軍團（家族軍團/成長軍團/自我軍團/未來軍團），每個軍團包含指揮官（天干）、軍師（地支）、副將（主氣藏干）、特種兵（餘氣藏干）與戰場環境（納音五行）。',
      '角色體系：10 位天干指揮官（甲木森林將軍、乙木花蔓軍師、丙火烈日戰神等）+ 12 位地支軍師（子水夜行刺客、丑土封藏守衛等），共 22 個完整角色設定與全身動態圖。',
      'Buff/Debuff 系統：將十神轉化為技能樹效果（比劫盟友支援、食傷創意輸出、財星資源掌控、官殺責任挑戰、印星後援智慧），五行轉化為基礎屬性，神煞轉化為兵符特殊事件。',
      '前端技術棧：React 18 + TypeScript + Vite 5 + Tailwind CSS + shadcn/ui + Framer Motion，採用「宇宙建築師」深藍金色 HUD 視覺風格。',
      '後端架構：PostgreSQL + Row Level Security + Edge Functions（Deno），支援 RESTful API 與即時訂閱系統。',
      '輸出格式：響應式網頁 UI（桌面/平板/手機）+ 高擬真度 A4 PDF 報告匯出 + Word 文件匯出。',
      '會員系統：支援免費版（基礎計算）、月訂閱（NT$99/月，完整報告）、年訂閱（NT$799/年），以及故事重生資格購買。',
      '報告章節結構：摘要 → 八字排盤 → 十神分析 → 神煞統計 → 性格分析 → 軍團敘事 → 圖表分析 → 計算紀錄，共 8 大章節。',
      '安全機制：RLS 資料存取控制、登入鎖定保護、API 速率限制、HTTPS 加密傳輸。',
    ]
  },
  {
    title: '文件總覽與關鍵內容提取',
    items: [
      'RSBZS 系統是結合命理學與人工智慧（AI）技術的現代化八字運算平台，目標是建構「AI 時代的命理基礎設施」。',
      '核心技術支柱：高精度天文曆法（節氣計算覆蓋 1850-2100 年）、數學化干支推演模型、微服務容器化架構。',
      '採用雙層品牌策略：虹靈御所（面向大眾，命理即生活）× RSBZS（面向開發者，命理即基礎設施）。',
      '三大產品 SKU：RS-Core（高精度運算引擎）、RS-Matrix（命理資料矩陣化與 AI 特徵抽取）、Hong Ling Assets（IP 資產與敘事模組）。',
      '商業模式以 API 計價（免費/開發者/商業三層）與 IP 授權（買斷/分潤/聯名）雙軌並行。',
      '系統已完成核心引擎開發、前端 UI 設計、PDF/Word 匯出、會員訂閱、角色圖鑑、AI 諮詢等完整功能。',
    ]
  },
  {
    title: '系統架構與品牌策略分析',
    items: [
      '虹靈御所（Rainbow Sanctuary）：面向大眾的消費品牌，主打「命理即生活、命理即藝術」，強調人文關懷與體驗設計。',
      'RSBZS（Rainbow Sanctuary BaZi System）：底層技術品牌，定位為 AI 時代命理基礎設施提供者。',
      '技術精度優勢：採用天文演算法精確推算節氣時刻，支援全球任意經緯度的真太陽時校正。',
      '數學建模優勢：將干支推演、藏干規則、十神關係、五行分佈等傳統命理邏輯完全數學化，確保可追溯性。',
      '架構設計：前端 React SPA + 後端 Edge Functions + PostgreSQL，支援水平擴展與獨立部署。',
      '視覺設計語言：「宇宙建築師」風格——深藍漸層背景、金色點綴、HUD 資訊框架、星空粒子效果。',
    ]
  },
  {
    title: '三大產品 SKU 深度解析',
    items: [
      'RS-Core 功能：四柱計算、藏干推演、十神分析、五行統計、陰陽比例、納音對照、神煞檢測。',
      'RS-Core 技術指標：節氣精度 < 0.01°、支援 1850-2100 年、真太陽時校正、RESTful API、JSON 輸出。',
      'RS-Core 已實現的 API 端點：calculate-bazi（基礎計算）、internal-bazi-api（內部完整計算）、v1-bazi-calculate（公開 API v1）、v1-bazi-analyze（AI 分析）。',
      'RS-Matrix 功能：命理資料向量化表示、命格聚類分析、相似命盤推薦、AI 模型訓練資料生成。',
      'RS-Matrix 應用場景：心理測驗建模（結合命格分類與心理學理論）、個人化推薦引擎、行為預測模型。',
      'Hong Ling Assets 內容：22 個完整角色設定（10 天干 + 12 地支）、全身動態圖、角色故事腳本、Buff/Debuff 技能描述。',
      'Hong Ling Assets 授權模式：角色形象授權（遊戲/動畫）、敘事模組 API（故事生成）、聯名開發（品牌合作）。',
    ]
  },
  {
    title: '技術規格與創新點',
    items: [
      '天文曆法：基於太陽黃經度數精確推算 24 節氣時刻，涵蓋 1850-2100 年完整節氣資料庫。',
      '時間校正系統：支援真太陽時（均時差 + 經度時差）、標準時區、UTC 之間的自動轉換。',
      '跨日子時處理：正確處理 23:00-01:00 子時的日柱歸屬問題，消除傳統命理中的常見爭議。',
      '干支推演引擎：以數學公式取代查表法，年柱/月柱/日柱/時柱均有獨立推演函數。',
      '十神計算系統：基於日主與其他天干的五行生剋關係，自動判定十神類型並生成社會化詮釋。',
      '神煞檢測引擎：支援 40+ 種傳統神煞規則，以 JSON 資料驅動，可擴展自定義規則。',
      '五行統計模型：綜合天干、地支、藏干權重計算五行分佈比例，並視覺化呈現。',
      'PDF 生成技術：採用 html2canvas + jsPDF 方案，支援中文字型、漸層背景、高解析度輸出。',
      'Code Splitting：路由級別懶加載 + 圖片動態載入 + 手動 chunk 分包，首屏載入優化。',
    ]
  },
  {
    title: '商業模式與市場定位',
    items: [
      'API 免費試用層：每月 100 次呼叫，基礎命盤計算，適合開發者評估。',
      'API 開發者層：每月 10,000 次呼叫，進階分析功能，技術支援，適合中小型應用。',
      'API 商業授權層：無限呼叫，完整功能存取，專屬技術顧問，SLA 保證，適合企業級應用。',
      'IP 一次性買斷：獲得指定角色/故事/敘事模組的永久使用權，適合遊戲與動畫製作。',
      'IP 分潤合作：共同開發內容，按營收比例分配，適合內容平台與媒體公司。',
      'IP 聯名開發：品牌方與虹靈御所聯名合作，共同推出產品，適合品牌行銷。',
      '垂直市場 — AI 助手：提供命理分析模組，增強 AI 助手的文化深度與個人化能力。',
      '垂直市場 — 心理測驗：結合命格分類設計心理測驗題目，提升準確度與趣味性。',
      '垂直市場 — 遊戲：利用角色資產建構世界觀，提供文化敘事深度與沉浸感。',
    ]
  },
  {
    title: '使用者體驗與敘事風格設計',
    items: [
      '敘事風格：以軍事兵法為主軸，融合療癒、詩意元素，將抽象命理轉化為可記憶的角色故事。',
      '視覺設計：「宇宙建築師」風格——深藍 (#0a1628) 至靛藍漸層、金色 (#d4af37) 點綴、半透明 HUD 框架。',
      '互動體驗：Framer Motion 動畫、視差滾動、角色燈箱模式、觸控滑動支援。',
      '報告閱讀體驗：章節目錄導航、閱讀進度條、側邊快速跳轉、回到頂端按鈕。',
      'PDF 匯出體驗：封面（品牌/日期/版本）→ 目錄 → 章節內容 → 免責聲明，版面與網頁一致。',
      '角色圖鑑體驗：五行篩選、收藏功能、全螢幕燈箱、角色比較、關係圖譜、瀏覽歷史。',
      'AI 諮詢體驗：基於命盤資料的 AI 即時問答，支援多種語氣風格切換。',
      '響應式設計：桌面寬螢幕佈局、平板中等佈局、手機單欄佈局，所有功能在三種裝置上均可正常使用。',
    ]
  },
  {
    title: '技術驗證與實驗設計',
    items: [
      '節氣精度驗證：將系統計算的節氣時刻與香港天文台歷史資料比對，誤差控制在 1 分鐘內。',
      '真太陽時校正驗證：根據經緯度計算地理時差與均時差，與實際日晷時間比對驗證。',
      '命盤一致性測試：同一組輸入（姓名/日期/時間/地點）多次運算，確保輸出結果 100% 一致。',
      '十神正確性驗證：與傳統命理書籍的案例比對，確保十神判定邏輯正確。',
      '神煞規則驗證：針對 40+ 種神煞規則進行單元測試，覆蓋率達 95% 以上。',
      '跨瀏覽器測試：Chrome/Firefox/Safari/Edge 四大瀏覽器相容性驗證。',
      'PDF 輸出驗證：中文字型正確顯示、版面不跑版、章節順序一致、頁碼連續。',
      '效能基準測試：首屏載入 < 3 秒、八字計算回應 < 500ms、PDF 生成 < 10 秒。',
    ]
  },
  {
    title: '風險評估與倫理考量',
    items: [
      '文化敏感性：嚴格避免觸發迷信或不當心理暗示，所有表述使用「傾向」「可能」而非「一定」「注定」。',
      '使用者數據保護：敏感資料（出生日期/地點）儲存加密，RLS 確保僅本人可存取。',
      '技術濫用預防：API 速率限制、帳號鎖定機制，防止命理結果被用於歧視或不當評判。',
      '免責聲明：每份報告均包含完整免責聲明，明確說明不構成醫療/心理/法律/財務建議。',
      '品牌語氣準則：不恐嚇、不宿命、不操控——以尊重與可驗證的方式，陪使用者理解自己。',
      '隱私保護：報告頁面不被搜尋引擎收錄、分享圖不暴露敏感資訊、前端日誌不記錄個人資料。',
    ]
  },
  {
    title: '總結與未來發展建議',
    items: [
      'RSBZS 已完成從概念驗證到產品化的完整歷程，具備技術精度、產品完整度與商業可行性。',
      '技術深化方向：持續優化天文曆法精度、擴展 AI 模型融合（GPT/Gemini）、強化效能優化。',
      '產品擴展方向：增加流年流月動態推演、開發行動端 APP、支援更多語言版本。',
      '市場拓展方向：開放 API 生態系統、建立開發者社群、推動垂直市場合作。',
      '內容深化方向：擴展角色故事庫、增加更多敘事風格、開發互動式學習課程。',
      '國際化方向：支援英文/日文/韓文介面、適配不同文化的命理習慣與敘事偏好。',
    ]
  },
];

const ResearchReport = () => {
  const tableOfContents = [
    { id: "system-intro", title: "〇、完整系統介紹", icon: Globe },
    { id: "overview", title: "一、文件總覽與關鍵內容提取", icon: BookOpen },
    { id: "architecture", title: "二、系統架構與品牌策略分析", icon: Layers },
    { id: "products", title: "三、三大產品 SKU 深度解析", icon: Cpu },
    { id: "technical", title: "四、技術規格與創新點", icon: Zap },
    { id: "business", title: "五、商業模式與市場定位", icon: TrendingUp },
    { id: "ux", title: "六、使用者體驗與敘事風格設計", icon: Palette },
    { id: "validation", title: "七、技術驗證與實驗設計", icon: Target },
    { id: "ethics", title: "八、風險評估與倫理考量", icon: Shield },
    { id: "conclusion", title: "九、總結與未來發展建議", icon: Sparkles },
  ];

  const brandComparison = [
    { brand: "虹靈御所", keywords: "藝術、文化、命理敘事、體驗", description: "面向大眾，提供命理內容、心理測驗、遊戲等應用" },
    { brand: "RSBZS", keywords: "AI、基礎設施、API、精度", description: "面向開發者與企業，提供命理運算與資料服務" },
  ];

  const verticalMarkets = [
    { market: "AI 助手", application: "提供命理分析模組、個人化建議生成", advantage: "增強 AI 助手的文化深度與人文關懷能力", icon: Bot },
    { market: "心理測驗", application: "結合 RS-Matrix 特徵向量與命格分類設計題目", advantage: "提升測驗準確度與文化趣味性", icon: HeartPulse },
    { market: "遊戲與虛擬世界", application: "利用 Hong Ling Assets 建構角色與世界觀", advantage: "提供文化敘事與角色深度，提升沉浸感", icon: Gamepad2 },
  ];

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStage, setDownloadStage] = useState('');

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setDownloadProgress(0);
    try {
      await downloadDocPdf({
        title: 'RSBZS四時軍團八字人生兵法系統',
        subtitle: '整合性研究報告',
        filename: 'RSBZS_研究報告',
        sections: getResearchSections(),
      }, setDownloadProgress, setDownloadStage);
      toast.success('PDF 研究報告下載成功');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('PDF 下載失敗，請重試');
    } finally {
      setTimeout(() => { setDownloading(false); setDownloadProgress(0); }, 500);
    }
  };

  const handleDownloadWord = async () => {
    setDownloading(true);
    setDownloadProgress(0);
    try {
      await downloadDocWord({
        title: 'RSBZS四時軍團八字人生兵法系統',
        subtitle: '整合性研究報告',
        filename: 'RSBZS_研究報告',
        sections: getResearchSections(),
      }, setDownloadProgress, setDownloadStage);
      toast.success('Word 研究報告下載成功');
    } catch (error) {
      console.error('Word download error:', error);
      toast.error('Word 下載失敗，請重試');
    } finally {
      setTimeout(() => { setDownloading(false); setDownloadProgress(0); }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回首頁</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
                <FileDown className="w-4 h-4 mr-2" />
                下載 PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadWord} disabled={downloading}>
                <ScrollText className="w-4 h-4 mr-2" />
                下載 Word
              </Button>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <FileText className="w-3 h-3 mr-1" />
                研究報告 v1.0
            </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            完整研究報告
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            RSBZS 虹靈御所主題式八字系統
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            系統架構、產品設計、技術創新與商業模式整合性研究報告
          </p>
          <p className="text-sm text-muted-foreground">
            Rainbow Sanctuary BaZi System | AI 時代命理基礎設施
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-primary" />
                目錄
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tableOfContents.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                  >
                    <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item.title}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Section 0: System Introduction */}
          <section id="system-intro">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    〇、完整系統介紹
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      <strong className="text-foreground text-lg">「RSBZS四時軍團八字人生兵法系統」</strong>（Rainbow Sanctuary BaZi System）是一套由超烜創意團隊研發，結合傳統命理學與現代 AI 技術的全方位八字分析平台。消費者品牌名稱為<strong className="text-primary">「虹靈御所」</strong>。
                    </p>
                  </div>

                  {/* 核心理念 */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-primary/10">
                    <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      核心理念
                    </h4>
                    <blockquote className="italic text-primary border-l-2 border-primary/50 pl-4 mb-3">
                      「這份分析是鏡子，不是劇本」——提供觀察角度與可執行建議，選擇權永遠在使用者手上。
                    </blockquote>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: '清楚', desc: '精準呈現能量配置與傾向' },
                        { label: '克制', desc: '區分可驗證資訊與推論' },
                        { label: '有美感', desc: '宇宙建築師視覺風格' },
                        { label: '可執行', desc: '具體可落地的行動建議' },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded bg-background/50 text-center">
                          <p className="font-bold text-primary text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 四時軍團框架 */}
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      四時八字軍團兵法框架
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      獨創的敘事系統將八字四柱映射為四個軍團，每個軍團包含完整的角色體系：
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { legion: '家族軍團（年柱）', desc: '代表家庭背景、長輩關係、童年印記' },
                        { legion: '成長軍團（月柱）', desc: '代表社會角色、事業方向、同儕互動' },
                        { legion: '自我軍團（日柱）', desc: '代表核心人格、親密關係、內在驅力' },
                        { legion: '未來軍團（時柱）', desc: '代表子女緣分、晚年發展、理想追求' },
                      ].map((item, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">{i + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{item.legion}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 角色體系 */}
                  <div>
                    <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      角色體系（22 個完整角色）
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="font-medium text-sm mb-2 text-foreground">10 位天干指揮官</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['甲木·森林將軍', '乙木·花蔓軍師', '丙火·烈日戰神', '丁火·誓燈法師', '戊土·山岳守護', '己土·大地母親', '庚金·天鍛騎士', '辛金·靈晶鑑定師', '壬水·龍河船長', '癸水·甘露天使'].map((name, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="font-medium text-sm mb-2 text-foreground">12 位地支軍師</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['子水·夜行刺客', '丑土·封藏守衛', '寅木·雷虎獵人', '卯木·玉兔使者', '辰土·泥雲龍法師', '巳火·蛇焰術士', '午火·日鬃騎兵', '未土·牧角調和者', '申金·金杖靈猴戰士', '酉金·鳳羽判衡者', '戌土·烽火戰犬統領', '亥水·潮典海豚智者'].map((name, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 技術與輸出 */}
                  <div className="grid md:grid-cols-3 gap-3">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <Cpu className="w-5 h-5 text-primary mb-2" />
                        <p className="font-medium text-sm">技術棧</p>
                        <p className="text-xs text-muted-foreground">React 18 + TS + Vite 5 + PostgreSQL + Edge Functions</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <FileText className="w-5 h-5 text-primary mb-2" />
                        <p className="font-medium text-sm">輸出格式</p>
                        <p className="text-xs text-muted-foreground">響應式網頁 + A4 PDF + Word 文件</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <Lock className="w-5 h-5 text-primary mb-2" />
                        <p className="font-medium text-sm">安全機制</p>
                        <p className="text-xs text-muted-foreground">RLS + 登入鎖定 + API 速率限制 + HTTPS</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 1: Overview */}
          <section id="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    一、文件總覽與關鍵內容提取
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    RSBZS 系統是一套結合命理學與人工智慧（AI）技術的現代化八字運算平台。其核心在於以<strong className="text-foreground">高精度天文曆法、數學建模與微服務架構</strong>，打造可擴展、可驗證且適用於多元垂直市場的命理基礎設施。
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    系統採用<strong className="text-foreground">雙層品牌策略</strong>，分別面向大眾用戶與開發者／企業，並以三大產品 SKU（RS-Core、RS-Matrix、Hong Ling Assets）支撐不同應用場景。技術創新涵蓋時間與空間精度、運算一致性、系統穩定性與容器化部署，商業模式則以 <strong className="text-foreground">API 計價與 IP 授權雙軌並行</strong>，展現高度的市場整合潛力與競爭優勢。
                  </p>
                  <div className="grid md:grid-cols-3 gap-3 not-prose">
                    {[
                      { label: '計算精度', value: '< 0.01° 太陽黃經誤差' },
                      { label: '節氣覆蓋', value: '1850-2100 年完整資料' },
                      { label: '神煞規則', value: '40+ 種傳統規則支援' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-center">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-bold text-primary text-sm mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 2: Architecture */}
          <section id="architecture">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    二、系統架構與品牌策略分析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="brand-architecture">
                      <AccordionTrigger className="text-base font-medium">
                        2.1 雙層品牌架構解析
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-muted-foreground">
                          RSBZS 採用「虹靈御所 × RSBZS」雙層品牌架構，分別定位於文化敘事與技術基礎設施層級：
                        </p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Palette className="w-4 h-4 text-pink-500" />
                                虹靈御所 (Rainbow Sanctuary)
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                              面向大眾，主打「命理即生活」、「命理即藝術」的敘事風格，強調人文關懷、心理測驗、遊戲互動等體驗。品牌關鍵字包括藝術、文化、命理敘事、體驗。
                            </CardContent>
                          </Card>
                          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-blue-500" />
                                RSBZS
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                              作為底層技術品牌，定位為「AI 時代命理基礎設施」，專注於高精度命理運算引擎、API 服務、系統一致性與可擴展性。
                            </CardContent>
                          </Card>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="brand-positioning">
                      <AccordionTrigger className="text-base font-medium">
                        2.2 品牌定位與關鍵字映射
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-medium">品牌層級</th>
                                <th className="text-left py-3 px-4 font-medium">關鍵字</th>
                                <th className="text-left py-3 px-4 font-medium">定位說明</th>
                              </tr>
                            </thead>
                            <tbody>
                              {brandComparison.map((item, index) => (
                                <tr key={index} className="border-b border-border/50">
                                  <td className="py-3 px-4 font-medium text-foreground">{item.brand}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-1">
                                      {item.keywords.split("、").map((keyword, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {keyword}
                                        </Badge>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-muted-foreground">{item.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="advantages">
                      <AccordionTrigger className="text-base font-medium">
                        2.3 命理 × AI 結合的差異化優勢
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3">
                          {[
                            { title: "技術精度與一致性", desc: "採用高精度天文曆法（NASA JPL DE430）、全球地理座標支援、真太陽時校正", icon: Target },
                            { title: "數學建模與可追溯性", desc: "將干支推演、五行分佈等命理邏輯數學化，所有運算結果可追溯", icon: Database },
                            { title: "微服務與容器化架構", desc: "支援高併發 API 請求、動態擴容、雲端／本地部署", icon: Layers },
                            { title: "敘事與體驗設計", desc: "多元敘事風格、互動動畫、音效支援，增強用戶黏著度", icon: Palette },
                          ].map((item, index) => (
                            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                              <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-foreground">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 3: Products */}
          <section id="products">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" />
                    三、三大產品 SKU 深度解析
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* RS-Core */}
                  <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">SKU 1</Badge>
                        RS-Core：高精度八字運算引擎
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">功能與交付物</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>八字命盤計算（年、月、日、時四柱）</li>
                          <li>流年流月推演（動態運勢分析）</li>
                          <li>命格分類與標籤（如正官、偏財、食神等）</li>
                          <li>五行分佈統計、陰陽能量比例</li>
                          <li>十神關係分析、命盤時間軸推演</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">核心賣點</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">誤差 &lt; 0.01°</Badge>
                          <Badge variant="outline">真太陽時校正</Badge>
                          <Badge variant="outline">RESTful API</Badge>
                          <Badge variant="outline">可追溯運算</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* RS-Matrix */}
                  <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge className="bg-violet-500/20 text-violet-600 border-violet-500/30">SKU 2</Badge>
                        RS-Matrix：命理資料矩陣化與 AI 特徵抽取
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">功能與交付物</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>命理資料矩陣化處理（向量化表示）</li>
                          <li>特徵抽取與相似性分析（如命格聚類、相似命盤推薦）</li>
                          <li>支援 AI 模型訓練、心理測驗建模、遊戲角色生成</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">核心賣點</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">AI 模型訓練</Badge>
                          <Badge variant="outline">心理測驗建模</Badge>
                          <Badge variant="outline">向量特徵</Badge>
                          <Badge variant="outline">聚類分析</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hong Ling Assets */}
                  <Card className="bg-gradient-to-br from-rose-500/5 to-pink-500/5 border-rose-500/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge className="bg-rose-500/20 text-rose-600 border-rose-500/30">SKU 3</Badge>
                        Hong Ling Assets：命理 IP 資產與敘事模組
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">功能與交付物</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>命理相關 IP 資產（命格故事、角色設定、敘事模組）</li>
                          <li>角色卡、命格故事腳本、敘事模組 API</li>
                          <li>支援遊戲、動畫、小說、心理測驗等內容創作</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">核心賣點</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">IP 授權</Badge>
                          <Badge variant="outline">角色生成</Badge>
                          <Badge variant="outline">敘事模組</Badge>
                          <Badge variant="outline">聯名開發</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 4: Technical */}
          <section id="technical">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    四、技術規格與創新點
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="time-space">
                      <AccordionTrigger className="text-base font-medium">
                        4.1 時間與空間定義的技術創新
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        {[
                          { title: "高精度天文曆法", desc: "採用 NASA JPL DE430 資料庫，精確計算日月五星位置", icon: Globe },
                          { title: "多時間基準支援", desc: "真太陽時、地方時、UTC 轉換，自動校正地理時差", icon: Zap },
                          { title: "全球地理座標", desc: "用戶可輸入精確經緯度，系統自動計算均時差", icon: Target },
                        ].map((item, index) => (
                          <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                            <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="consistency">
                      <AccordionTrigger className="text-base font-medium">
                        4.2 運算邏輯修正與一致性驗證
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        {[
                          { title: "干支推演數學化", desc: "消除模糊規則與例外條件，提升運算一致性與可追溯性" },
                          { title: "一致性驗證模組", desc: "確保不同輸入條件下的運算結果一致" },
                          { title: "可解釋性 AI（XAI）", desc: "支援 SHAP 值分析、特徵貢獻度展示" },
                        ].map((item, index) => (
                          <div key={index} className="p-3 rounded-lg bg-muted/50">
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="architecture">
                      <AccordionTrigger className="text-base font-medium">
                        4.3 系統穩定性與可擴展性設計
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        {[
                          { title: "微服務架構", desc: "各運算模組獨立部署，支援高併發 API 請求與動態擴容" },
                          { title: "容器化部署", desc: "支援雲端與本地部署，便於開發者整合與測試" },
                          { title: "SDK 與 CLI 工具", desc: "提供多語言 SDK 與命令列工具" },
                        ].map((item, index) => (
                          <div key={index} className="p-3 rounded-lg bg-muted/50">
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="data">
                      <AccordionTrigger className="text-base font-medium">
                        4.4 資料來源、數據治理與隱私保護
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-3">
                          <Card className="bg-muted/30">
                            <CardContent className="p-4">
                              <Database className="w-5 h-5 text-primary mb-2" />
                              <p className="font-medium text-sm">多元資料來源</p>
                              <p className="text-xs text-muted-foreground">傳統命理典籍、現代天文資料庫、全球用戶數據</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-muted/30">
                            <CardContent className="p-4">
                              <Shield className="w-5 h-5 text-primary mb-2" />
                              <p className="font-medium text-sm">數據治理</p>
                              <p className="text-xs text-muted-foreground">資料標註、匿名化處理、數據質量監控</p>
                            </CardContent>
                          </Card>
                          <Card className="bg-muted/30">
                            <CardContent className="p-4">
                              <Lock className="w-5 h-5 text-primary mb-2" />
                              <p className="font-medium text-sm">隱私保護</p>
                              <p className="text-xs text-muted-foreground">HTTPS 加密、分級存取、符合 GDPR</p>
                            </CardContent>
                          </Card>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="ai">
                      <AccordionTrigger className="text-base font-medium">
                        4.5 AI 模型與演算法設計
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        {[
                          { title: "深度學習 × 時序建模", desc: "結合 LSTM、Transformer 等模型，提升命盤動態推演精度", icon: Brain },
                          { title: "知識圖譜構建", desc: "建立跨體系因果網絡，支援多元命理融合診斷", icon: Layers },
                          { title: "強化學習 × 決策優化", desc: "推送最佳決策時間、方位與行動建議", icon: Target },
                        ].map((item, index) => (
                          <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                            <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 5: Business */}
          <section id="business">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    五、商業模式與市場定位
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* API Pricing */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" />
                      5.1 API 計價模式
                    </h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        { tier: "免費試用層", desc: "基礎命盤計算與簡易分析", target: "新用戶與開發者" },
                        { tier: "開發者層", desc: "高頻 API 請求、進階命理分析", target: "中小型應用" },
                        { tier: "商業授權層", desc: "大規模運算、專屬技術支援", target: "企業級應用" },
                      ].map((item, index) => (
                        <Card key={index} className="bg-muted/30">
                          <CardContent className="p-4">
                            <Badge variant="outline" className="mb-2">{item.tier}</Badge>
                            <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                            <p className="text-xs text-primary">適合：{item.target}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* IP Licensing */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      5.2 IP 授權模式
                    </h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        { mode: "一次性買斷", desc: "獲得角色、故事、敘事模組的永久使用權" },
                        { mode: "分潤合作", desc: "共同開發內容，按營收比例分配權益" },
                        { mode: "聯名開發", desc: "與品牌方進行聯名合作，提升影響力" },
                      ].map((item, index) => (
                        <Card key={index} className="bg-muted/30">
                          <CardContent className="p-4">
                            <p className="font-medium text-foreground mb-1">{item.mode}</p>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Vertical Markets */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      5.3 垂直市場整合潛力
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium">垂直市場</th>
                            <th className="text-left py-3 px-4 font-medium">應用方式</th>
                            <th className="text-left py-3 px-4 font-medium">優勢說明</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verticalMarkets.map((item, index) => (
                            <tr key={index} className="border-b border-border/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <item.icon className="w-4 h-4 text-primary" />
                                  <span className="font-medium">{item.market}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">{item.application}</td>
                              <td className="py-3 px-4 text-muted-foreground">{item.advantage}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 6: UX */}
          <section id="ux">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    六、使用者體驗與敘事風格設計
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { title: "多元敘事風格", desc: "軍事、療癒、詩意、神話、毒舌等風格，滿足不同用戶心理需求" },
                      { title: "互動體驗設計", desc: "粒子動畫背景、打字機效果、響應式設計、音效支援" },
                      { title: "個人化報告生成", desc: "根據用戶選擇的敘事語氣與命盤特徵，自動生成個人化報告" },
                      { title: "心理測驗融合", desc: "結合 RS-Matrix 的命格分類與心理學理論設計測驗" },
                    ].map((item, index) => (
                      <Card key={index} className="bg-muted/30">
                        <CardContent className="p-4">
                          <p className="font-medium text-foreground mb-1">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 7: Validation */}
          <section id="validation">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    七、技術驗證與實驗設計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {[
                      { title: "天文曆法校正", desc: "採用 NASA JPL DE430 資料庫，與國際標準曆法比對" },
                      { title: "真太陽時校正", desc: "根據經緯度自動計算地理時差與均時差，與實際日晷時間比對" },
                      { title: "命盤一致性驗證", desc: "同一組輸入條件下多次運算結果一致，可追溯至原始資料" },
                      { title: "A/B Test", desc: "針對不同運算邏輯、敘事風格進行多變量最佳化" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 8: Ethics */}
          <section id="ethics">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    八、風險評估與倫理考量
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { title: "個資安全與隱私保護", desc: "API 支援匿名分析，採用 HTTPS 加密、分級存取權限，符合 GDPR", icon: Lock },
                      { title: "演算法偏見與決策透明", desc: "引入可解釋性 AI（XAI）、SHAP 值分析，提升系統透明度", icon: Brain },
                      { title: "人機協作模式", desc: "AI 算命為輔助工具，最終決策結合人類命理師的專業判斷", icon: Users },
                      { title: "跨文化倫理框架", desc: "建立多元倫理準則，強調命盤為「緣起」，尊重個人自由意志", icon: Globe },
                    ].map((item, index) => (
                      <Card key={index} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <item.icon className="w-4 h-4 text-primary" />
                            <p className="font-medium text-foreground">{item.title}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>

          {/* Section 9: Conclusion */}
          <section id="conclusion">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    九、總結與未來發展建議
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">9.1 綜合評估：AI 時代命理基礎設施的可行性</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        { aspect: "技術層面", desc: "高精度天文資料、一致性邏輯、微服務架構為基礎" },
                        { aspect: "產品層面", desc: "三大 SKU 滿足從基礎運算到內容創作的多元需求" },
                        { aspect: "商業層面", desc: "API 計價 × IP 授權雙軌並行，具備良好變現能力" },
                        { aspect: "市場層面", desc: "可廣泛應用於 AI 助手、心理測驗、遊戲等新興領域" },
                      ].map((item, index) => (
                        <div key={index} className="p-3 rounded-lg bg-background/50">
                          <p className="font-medium text-primary text-sm">{item.aspect}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">9.2 未來發展建議</h3>
                    <div className="space-y-3">
                      {[
                        "技術深化與國際化：持續優化天文曆法、地理座標校正、AI 模型融合等技術",
                        "垂直市場深度整合：開發定制化解決方案與專屬授權服務",
                        "用戶體驗 × 敘事創新：持續優化敘事風格、互動體驗設計",
                        "倫理規範與社會責任：建立多元倫理框架、強化隱私保護",
                        "學術研究與技術驗證：與學術機構合作開展系統精度驗證",
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-primary">{index + 1}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center py-4">
                    <p className="text-muted-foreground italic">
                      「RSBZS 虹靈御所主題式八字系統，憑藉其雙層品牌架構、三大產品 SKU、技術創新、商業模式整合與多元市場應用，已然成為 AI 時代命理基礎設施的領航者。」
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Separator className="mb-8" />
          <p className="text-sm text-muted-foreground">
            © 2024-2025 RSBZS 虹靈御所主題式八字系統 | Rainbow Sanctuary BaZi System
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            本研究報告僅供參考，版權所有
          </p>
        </motion.div>
      </main>

      {/* 下載進度對話框 */}
      <Dialog open={downloading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Download className="h-5 w-5 animate-bounce" />
              正在生成文件
            </DialogTitle>
            <DialogDescription>
              請稍候，正在生成研究報告文件...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Progress value={downloadProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center">{downloadStage}</p>
            <p className="text-xs text-muted-foreground text-center">{downloadProgress}%</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResearchReport;
