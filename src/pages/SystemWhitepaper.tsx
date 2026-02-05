 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { 
   FileText, 
   Download, 
   Sparkles, 
   Shield, 
   Zap, 
   Target, 
   Users, 
   Globe, 
   BookOpen,
   ArrowLeft,
   FileDown,
   ScrollText,
   Layers,
   TrendingUp,
   Lock,
   Star,
   Award,
   Lightbulb,
   CheckCircle2,
   Crown
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Separator } from '@/components/ui/separator';
 import { toast } from 'sonner';
 
 // ============ 白皮書內容 ============
 const WHITEPAPER_SECTIONS = [
   {
     id: 'executive-summary',
     title: '執行摘要',
     icon: Star,
     content: [
       '虹靈御所基於 RSBZS v3.0（主題式八字系統）構建，是新一代專業八字命理分析平台。',
       '核心理念：「這份分析是鏡子，不是劇本」——我們提供視角與路徑，選擇權永遠在使用者手上。',
       '三大設計原則：清楚、克制、可執行。',
       '創新亮點：四時八字軍團兵法敘事系統，將抽象命理轉化為可讀、可記、可對照的角色故事。',
     ]
   },
   {
     id: 'vision',
     title: '願景與使命',
     icon: Target,
     content: [
       '願景：成為最值得信賴的命理自我探索工具，幫助使用者「看清、感受、療癒」。',
       '使命：透過精準計算與敘事化解讀，讓每個人都能理解自己的能量配置與傾向。',
       '價值主張：不預測未來，只幫你看清現在；不替你做決定，只提供可驗證的觀察框架。',
     ]
   },
   {
     id: 'technology',
     title: '技術創新',
     icon: Zap,
     content: [
       '天文精度計算：支援 1850-2100 年節氣精準計算，誤差控制在秒級。',
       '真太陽時校正：根據出生地經緯度進行太陽時校正，提升時辰判定準確度。',
       '十神社會化詮釋：將傳統十神概念轉化為現代社會關係與行為模式描述。',
       '結構化神煞分析：建立完整神煞規則引擎，支援自定義規則擴展。',
       'AI 故事生成：基於命盤結構生成個人化軍團敘事，提升理解與記憶。',
     ]
   },
   {
     id: 'legion-system',
     title: '四時八字軍團兵法',
     icon: Shield,
     content: [
       '指揮官系統（天干）：十位天干對應十種領導風格與核心驅動力。',
       '軍師系統（地支）：十二位地支對應十二種策略傾向與執行方式。',
       '戰場環境（納音）：六十甲子納音對應不同能量場域與情境設定。',
       '軍團組合：四柱形成的軍團組合，呈現完整的能量配置與互動關係。',
       '敘事轉化：將抽象的命理符號轉化為生動的角色故事，便於理解與記憶。',
     ]
   },
   {
     id: 'product-architecture',
     title: '產品架構',
     icon: Layers,
     content: [
       'RS-Core：八字計算核心引擎，提供精準的命盤計算與分析。',
       'RS-Matrix：擴展模組系統，包含神煞、十神、納音等進階分析。',
       'Hong Ling Assets：品牌資產系統，包含角色圖鑑、視覺設計、敘事內容。',
       '會員系統：分層權限設計，支援免費版、訂閱版、終身版。',
       'API 服務：提供開發者接入能力，支援第三方應用整合。',
     ]
   },
   {
     id: 'business-model',
     title: '商業模式',
     icon: TrendingUp,
     content: [
       'B2C 訂閱制：個人用戶透過訂閱解鎖完整功能，包含月訂閱與年訂閱方案。',
       '故事重生資格：額外購買項目，允許用戶重新生成 AI 故事內容。',
       'B2B API 授權：提供企業級 API 服務，按調用次數計費。',
       'IP 授權合作：角色形象與故事內容的授權合作機會。',
       '教育培訓：八字學院提供系統化學習內容。',
     ]
   },
   {
     id: 'security',
     title: '安全與隱私',
     icon: Lock,
     content: [
       '資料加密：所有敏感資料採用加密儲存與傳輸。',
       'Row Level Security：資料庫層級的存取控制，確保用戶只能存取自己的資料。',
       '權限分層：精細的角色權限管理，區分一般用戶、付費會員、管理員。',
       '合規聲明：明確告知分析內容不構成專業建議，涉及重大決策請諮詢專業人士。',
       '資料保護：不主動分享用戶個人資料，遵循隱私保護原則。',
     ]
   },
   {
     id: 'roadmap',
     title: '發展路線圖',
     icon: Globe,
     content: [
       '2024 Q4：RSBZS v3.0 核心功能完成，軍團敘事系統上線。',
       '2025 Q1：八字學院內容擴充，API 服務開放。',
       '2025 Q2：大運流年分析模組，合盤分析功能。',
       '2025 Q3：多語言支援，國際市場拓展。',
       '2025 Q4：AI 諮詢進階功能，個人化推薦系統。',
     ]
   },
 ];
 
 // ============ 下載功能 ============
 const generateWhitepaperContent = () => {
   const now = new Date();
   const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
   
   let content = `
 ╔══════════════════════════════════════════════════════════════════════════════╗
 ║                                                                              ║
 ║                                                                              ║
 ║                     虹靈御所 | RSBZS v3.0                                     ║
 ║                                                                              ║
 ║                         系 統 白 皮 書                                        ║
 ║                                                                              ║
 ║                                                                              ║
 ║                     ━━━━━━━━━━━━━━━━━━━━━━━                                   ║
 ║                                                                              ║
 ║                     「這份分析是鏡子，不是劇本」                                ║
 ║                                                                              ║
 ║                                                                              ║
 ║                     版本：v3.0                                               ║
 ║                     日期：${dateStr}                                          ║
 ║                                                                              ║
 ╚══════════════════════════════════════════════════════════════════════════════╝
 
 
 
 ════════════════════════════════════════════════════════════════════════════════
                                    目    錄
 ════════════════════════════════════════════════════════════════════════════════
 
 `;
 
   WHITEPAPER_SECTIONS.forEach((section, idx) => {
     content += `    ${idx + 1}. ${section.title}\n`;
   });
 
   content += `
 
 
 `;
 
   WHITEPAPER_SECTIONS.forEach((section, idx) => {
     content += `
 ════════════════════════════════════════════════════════════════════════════════
     第 ${idx + 1} 章：${section.title}
 ════════════════════════════════════════════════════════════════════════════════
 
 `;
     section.content.forEach((item, i) => {
       content += `    ${i + 1}. ${item}
 
 `;
     });
   });
 
   content += `
 
 ════════════════════════════════════════════════════════════════════════════════
                                    附    錄
 ════════════════════════════════════════════════════════════════════════════════
 
 
 【附錄 A：設計原則】
 
     清楚（Clarity）
     ───────────────
     精準呈現能量配置與傾向，避免模糊描述。每個重要段落都能指向一個可做的小動作。
     
     
     克制（Restraint）
     ───────────────
     區分可驗證資訊與推論，不恐嚇不宿命不操控。少形容詞，多結構與例子。
     
     
     可執行（Actionable）
     ───────────────
     提供具體可落地的行動建議與提醒。動詞＋時間窗＋驗收標準。
 
 
 【附錄 B：技術規格】
 
     前端技術棧
     ───────────────
     • React 18 + TypeScript
     • Vite 5 建構工具
     • Tailwind CSS + shadcn/ui
     • Framer Motion 動畫
     • TanStack Query 狀態管理
     
     
     後端技術棧
     ───────────────
     • Supabase (PostgreSQL)
     • Row Level Security
     • Edge Functions
     • Lovable AI 整合
 
 
 【附錄 C：品牌識別】
 
     視覺風格
     ───────────────
     Cosmic Architect 設計系統
     • 主色調：深藍/靛色 (cosmic-void)
     • 強調色：金色/琥珀色 (cosmic-gold)
     • 輔助色：紫色星雲 (cosmic-nebula)
     
     
     設計特徵
     ───────────────
     • HUD 風格邊框
     • 星空動態背景
     • 微光效果 (shimmer)
     • 書法風格中文排版
 
 
 
 ════════════════════════════════════════════════════════════════════════════════
                                  免 責 聲 明
 ════════════════════════════════════════════════════════════════════════════════
 
 
     1. 本報告為八字（命理）系統的結構化呈現與解讀參考，目的在於提供觀察
        角度與可執行建議。
     
     2. 本內容不構成醫療診斷、心理治療、法律建議、財務／投資建議或任何
        形式之專業服務。
     
     3. 文中之趨勢、傾向、可能性描述，不等同於保證結果；使用者仍需依自身
        狀況做出判斷與選擇。
     
     4. 涉及健康、心理、法律、財務等重大議題，請尋求合格專業人士協助。
     
     5. 使用本內容即表示你理解並同意以上聲明。
 
 
 
 ════════════════════════════════════════════════════════════════════════════════
 
 
 
                              © ${now.getFullYear()} 超烜創意 / 虹靈御所
                                      版本：RSBZS v3.0
                                      
                                      
                              ━━━━━━━━━━━━━━━━━━━━━━━
                                        END
                              ━━━━━━━━━━━━━━━━━━━━━━━
 
 `;
 
   return content;
 };
 
 const downloadWhitepaperTxt = () => {
   const content = generateWhitepaperContent();
   const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `虹靈御所_系統白皮書_${new Date().toISOString().split('T')[0]}.txt`;
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
   toast.success('白皮書下載成功');
 };
 
 const downloadWhitepaperMd = () => {
   const now = new Date();
   const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
   
   let md = `# 虹靈御所 | RSBZS v3.0 系統白皮書
 
 > **「這份分析是鏡子，不是劇本」**
 
 ---
 
 **版本**：v3.0  
 **日期**：${dateStr}  
 **發行**：超烜創意 / 虹靈御所
 
 ---
 
 ## 目錄
 
 `;
 
   WHITEPAPER_SECTIONS.forEach((section, idx) => {
     md += `${idx + 1}. [${section.title}](#${section.id})\n`;
   });
 
   md += `
 ---
 
 `;
 
   WHITEPAPER_SECTIONS.forEach((section, idx) => {
     md += `## ${idx + 1}. ${section.title} {#${section.id}}
 
 `;
     section.content.forEach((item) => {
       md += `- ${item}\n`;
     });
     md += '\n---\n\n';
   });
 
   md += `## 附錄
 
 ### A. 設計原則
 
 | 原則 | 說明 |
 |------|------|
 | **清楚** | 精準呈現能量配置與傾向，避免模糊描述 |
 | **克制** | 區分可驗證資訊與推論，不恐嚇不操控 |
 | **可執行** | 提供具體可落地的行動建議與提醒 |
 
 ### B. 技術規格
 
 #### 前端技術棧
 - React 18 + TypeScript
 - Vite 5 建構工具
 - Tailwind CSS + shadcn/ui
 - Framer Motion 動畫
 - TanStack Query 狀態管理
 
 #### 後端技術棧
 - Supabase (PostgreSQL)
 - Row Level Security
 - Edge Functions
 - Lovable AI 整合
 
 ### C. 品牌識別
 
 **視覺風格**：Cosmic Architect 設計系統
 
 | 元素 | 設定 |
 |------|------|
 | 主色調 | 深藍/靛色 (cosmic-void) |
 | 強調色 | 金色/琥珀色 (cosmic-gold) |
 | 輔助色 | 紫色星雲 (cosmic-nebula) |
 
 ---
 
 ## 免責聲明
 
 1. 本報告為八字（命理）系統的結構化呈現與解讀參考，目的在於提供觀察角度與可執行建議。
 
 2. 本內容不構成醫療診斷、心理治療、法律建議、財務／投資建議或任何形式之專業服務。
 
 3. 文中之趨勢、傾向、可能性描述，不等同於保證結果；使用者仍需依自身狀況做出判斷與選擇。
 
 4. 涉及健康、心理、法律、財務等重大議題，請尋求合格專業人士協助。
 
 5. 使用本內容即表示你理解並同意以上聲明。
 
 ---
 
 © ${now.getFullYear()} 超烜創意 / 虹靈御所  
 **版本**：RSBZS v3.0
 `;
 
   const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `虹靈御所_系統白皮書_${new Date().toISOString().split('T')[0]}.md`;
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
   toast.success('Markdown 白皮書下載成功');
 };
 
 // ============ 主元件 ============
 const SystemWhitepaper = () => {
   const navigate = useNavigate();
 
   return (
     <div className="min-h-screen bg-background">
       {/* 星空背景 */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--cosmic-nebula)/0.15),_transparent_50%)]" />
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--cosmic-nebula2)/0.1),_transparent_50%)]" />
       </div>
 
       <div className="relative container mx-auto px-4 py-8 max-w-4xl">
         {/* 頂部導航 */}
         <div className="flex items-center justify-between mb-8">
           <Button variant="ghost" onClick={() => navigate('/')}>
             <ArrowLeft className="w-4 h-4 mr-2" />
             返回首頁
           </Button>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={downloadWhitepaperTxt}>
               <FileDown className="w-4 h-4 mr-2" />
               下載 TXT
             </Button>
             <Button variant="outline" size="sm" onClick={downloadWhitepaperMd}>
               <ScrollText className="w-4 h-4 mr-2" />
               下載 Markdown
             </Button>
           </div>
         </div>
 
         {/* 封面區 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-16"
         >
           {/* 裝飾邊框 */}
           <div className="relative inline-block p-8 md:p-12">
             <div className="absolute inset-0 border-2 border-primary/30 rounded-lg" />
             <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
             <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
             
             <Badge className="mb-6 px-4 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 text-primary">
               <Crown className="w-3.5 h-3.5 mr-1.5" />
               RSBZS v3.0 系統白皮書
             </Badge>
             
             <h1 className="text-4xl md:text-6xl font-bold font-serif mb-4">
               <span className="cosmic-title-gradient">虹靈御所</span>
             </h1>
             
             <p className="text-xl md:text-2xl text-foreground/60 font-serif italic mb-6">
               「這份分析是鏡子，不是劇本」
             </p>
             
             <Separator className="my-6 max-w-xs mx-auto" />
             
             <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
               <p>版本：v3.0</p>
               <p>發行：超烜創意 / 虹靈御所</p>
               <p>{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}</p>
             </div>
           </div>
         </motion.div>
 
         {/* 目錄 */}
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="mb-12"
         >
           <Card className="border-primary/20">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-primary" />
                 目錄
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid sm:grid-cols-2 gap-2">
                 {WHITEPAPER_SECTIONS.map((section, idx) => (
                   <a
                     key={section.id}
                     href={`#${section.id}`}
                     className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                   >
                     <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                       {idx + 1}
                     </span>
                     <span className="group-hover:text-primary transition-colors">{section.title}</span>
                   </a>
                 ))}
               </div>
             </CardContent>
           </Card>
         </motion.div>
 
         {/* 章節內容 */}
         <div className="space-y-8">
           {WHITEPAPER_SECTIONS.map((section, idx) => (
             <motion.div
               key={section.id}
               id={section.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ delay: 0.1 }}
             >
               <Card className="overflow-hidden">
                 <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                       <section.icon className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                       <Badge variant="outline" className="mb-1">第 {idx + 1} 章</Badge>
                       <CardTitle>{section.title}</CardTitle>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="pt-6">
                   <ul className="space-y-4">
                     {section.content.map((item, i) => (
                       <li key={i} className="flex items-start gap-3">
                         <CheckCircle2 className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                         <span className="text-foreground/80 leading-relaxed">{item}</span>
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             </motion.div>
           ))}
         </div>
 
         {/* 附錄區 */}
         <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mt-16"
         >
           <h2 className="text-2xl font-bold font-serif mb-6 text-center">附錄</h2>
           
           <div className="grid md:grid-cols-3 gap-4">
             <Card className="text-center p-6">
               <Lightbulb className="w-8 h-8 mx-auto mb-3 text-primary" />
               <h4 className="font-semibold mb-2">設計原則</h4>
               <p className="text-sm text-muted-foreground">
                 清楚、克制、可執行
               </p>
             </Card>
             <Card className="text-center p-6">
               <Zap className="w-8 h-8 mx-auto mb-3 text-primary" />
               <h4 className="font-semibold mb-2">技術規格</h4>
               <p className="text-sm text-muted-foreground">
                 React + Supabase 現代架構
               </p>
             </Card>
             <Card className="text-center p-6">
               <Award className="w-8 h-8 mx-auto mb-3 text-primary" />
               <h4 className="font-semibold mb-2">品牌識別</h4>
               <p className="text-sm text-muted-foreground">
                 Cosmic Architect 視覺系統
               </p>
             </Card>
           </div>
         </motion.div>
 
         {/* 下載區塊 */}
         <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mt-12"
         >
           <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
             <CardContent className="py-8">
               <div className="text-center space-y-4">
                 <Download className="w-12 h-12 mx-auto text-primary" />
                 <h3 className="text-xl font-bold">下載完整白皮書</h3>
                 <p className="text-muted-foreground max-w-lg mx-auto">
                   下載精美排版的完整白皮書，包含所有章節與附錄
                 </p>
                 <div className="flex flex-wrap justify-center gap-3 pt-4">
                   <Button onClick={downloadWhitepaperTxt} variant="outline" size="lg">
                     <FileDown className="w-5 h-5 mr-2" />
                     下載 TXT 版本
                   </Button>
                   <Button onClick={downloadWhitepaperMd} size="lg" className="bg-gradient-to-r from-primary to-accent">
                     <ScrollText className="w-5 h-5 mr-2" />
                     下載 Markdown 版本
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground pt-2">
                   提示：Markdown 檔案可轉換為 PDF、Word 等格式
                 </p>
               </div>
             </CardContent>
           </Card>
         </motion.div>
 
         {/* 免責聲明 */}
         <div className="mt-12 p-6 rounded-lg bg-muted/30 border text-center">
           <Shield className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
           <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
             本白皮書所述之八字命理分析屬於自我探索工具，旨在提供觀點與行動建議。
             本內容不構成且不取代任何醫療、心理、法律或財務等專業意見。
             若您正面臨重大決策，請諮詢合格專業人士。
           </p>
         </div>
 
         {/* 版權 */}
         <div className="mt-8 text-center text-sm text-muted-foreground">
           <p>© {new Date().getFullYear()} 超烜創意 / 虹靈御所 · RSBZS v3.0</p>
         </div>
       </div>
     </div>
   );
 };
 
 export default SystemWhitepaper;