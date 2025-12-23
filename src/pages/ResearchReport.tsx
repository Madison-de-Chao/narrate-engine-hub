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
  Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ResearchReport = () => {
  const tableOfContents = [
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
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <FileText className="w-3 h-3 mr-1" />
              研究報告 v1.0
            </Badge>
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
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    《🔮 RSBZS 虹靈御所主題式八字系統》所描述的 RSBZS 系統，是一套結合命理學與人工智慧（AI）技術的現代化八字運算平台。其核心在於以<strong className="text-foreground">高精度天文曆法、數學建模與微服務架構</strong>，打造可擴展、可驗證且適用於多元垂直市場的命理基礎設施。
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    系統採用<strong className="text-foreground">雙層品牌策略</strong>，分別面向大眾用戶與開發者／企業，並以三大產品 SKU（RS-Core、RS-Matrix、Hong Ling Assets）支撐不同應用場景。技術創新涵蓋時間與空間精度、運算一致性、系統穩定性與容器化部署，商業模式則以 <strong className="text-foreground">API 計價與 IP 授權雙軌並行</strong>，展現高度的市場整合潛力與競爭優勢。
                  </p>
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
    </div>
  );
};

export default ResearchReport;
