 import React, { useState, useRef } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { 
   FileText, 
   Download, 
   Users, 
   Shield, 
   Database, 
   Code, 
   Map, 
   Crown, 
   BookOpen,
   ExternalLink,
   ChevronDown,
   ChevronRight,
   Sparkles,
   Layers,
   Lock,
   Globe,
   Zap,
   ArrowLeft,
   FileDown,
   ScrollText
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Separator } from '@/components/ui/separator';
 import { toast } from 'sonner';
 
 // ============ 路由對照表資料 ============
 const ROUTES_DATA = [
   { path: '/', name: '首頁', description: '品牌門戶，展示核心理念與功能亮點', access: '公開', category: '核心' },
   { path: '/bazi', name: '八字解析', description: '輸入出生資訊，獲得完整八字分析報告', access: '公開', category: '核心' },
   { path: '/about', name: '關於我們', description: '品牌理念、系統特色與核心價值說明', access: '公開', category: '品牌' },
   { path: '/subscribe', name: '訂閱方案', description: '會員方案說明與升級入口', access: '公開', category: '會員' },
   { path: '/auth', name: '登入/註冊', description: '會員登入、註冊與密碼重設', access: '公開', category: '會員' },
   { path: '/account', name: '會員中心', description: '個人資料編輯與訂閱狀態查看', access: '會員', category: '會員' },
   { path: '/gallery', name: '角色圖鑑', description: '指揮官與軍師角色圖鑑，支援收藏與燈箱', access: '公開', category: '內容' },
   { path: '/map', name: '導覽地圖', description: '系統功能視覺化導覽入口', access: '公開', category: '核心' },
   { path: '/academy', name: '八字學院', description: '系統化命理知識教學', access: 'Premium', category: '學習' },
   { path: '/guide/:zoneId', name: 'Zone Guide', description: '特定區域深度解讀', access: 'Premium', category: '學習' },
   { path: '/privacy', name: '隱私政策', description: '資料收集與使用說明', access: '公開', category: '法律' },
   { path: '/terms', name: '使用條款', description: '服務條款與免責聲明', access: '公開', category: '法律' },
   { path: '/version', name: '版本資訊', description: '系統版本歷史與更新日誌', access: '公開', category: '資訊' },
   { path: '/research', name: '研究報告', description: 'RSBZS 系統白皮書', access: '公開', category: '資訊' },
   { path: '/api-docs', name: 'API 文件', description: 'API 規格與使用說明', access: '公開', category: '開發' },
   { path: '/api-console', name: 'API 控制台', description: 'API 測試與管理', access: '會員', category: '開發' },
   { path: '/admin', name: '管理後台', description: '系統管理與數據統計', access: '管理員', category: '管理' },
   { path: '/report/print', name: '列印報告', description: '報告列印預覽頁面', access: '公開', category: '工具' },
   { path: '/export', name: '資料匯出', description: '報告資料匯出功能', access: '會員', category: '工具' },
   { path: '/prompt-templates', name: '提示詞模板', description: 'AI 提示詞管理', access: '會員', category: '開發' },
   { path: '/test', name: '測試頁面', description: '系統功能測試', access: '開發', category: '開發' },
 ];
 
 // ============ 資料表結構 ============
 const DATABASE_TABLES = [
   {
     name: 'profiles',
     description: '用戶個人資料',
     columns: [
       { name: 'id', type: 'UUID', description: '用戶 ID（關聯 auth.users）' },
       { name: 'email', type: 'TEXT', description: '電子郵件' },
       { name: 'display_name', type: 'TEXT', description: '顯示名稱' },
       { name: 'created_at', type: 'TIMESTAMP', description: '建立時間' },
       { name: 'updated_at', type: 'TIMESTAMP', description: '更新時間' },
     ]
   },
   {
     name: 'subscriptions',
     description: '會員訂閱記錄',
     columns: [
       { name: 'id', type: 'UUID', description: '訂閱 ID' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'plan', type: 'TEXT', description: '方案類型 (free/monthly/yearly/lifetime)' },
       { name: 'status', type: 'TEXT', description: '狀態 (active/inactive/cancelled/expired)' },
       { name: 'started_at', type: 'TIMESTAMP', description: '開始時間' },
       { name: 'expires_at', type: 'TIMESTAMP', description: '到期時間' },
       { name: 'payment_provider', type: 'TEXT', description: '付款提供者' },
       { name: 'payment_reference', type: 'TEXT', description: '付款參考編號' },
     ]
   },
   {
     name: 'bazi_calculations',
     description: '八字計算記錄',
     columns: [
       { name: 'id', type: 'UUID', description: '記錄 ID' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'name', type: 'TEXT', description: '姓名' },
       { name: 'birth_date', type: 'TIMESTAMP', description: '出生日期' },
       { name: 'birth_time', type: 'TEXT', description: '出生時間' },
       { name: 'gender', type: 'TEXT', description: '性別' },
       { name: 'location', type: 'TEXT', description: '出生地點' },
       { name: 'year_stem/branch', type: 'TEXT', description: '年柱天干/地支' },
       { name: 'month_stem/branch', type: 'TEXT', description: '月柱天干/地支' },
       { name: 'day_stem/branch', type: 'TEXT', description: '日柱天干/地支' },
       { name: 'hour_stem/branch', type: 'TEXT', description: '時柱天干/地支' },
       { name: 'hidden_stems', type: 'JSONB', description: '藏干資料' },
       { name: 'ten_gods', type: 'JSONB', description: '十神資料' },
       { name: 'shensha', type: 'JSONB', description: '神煞資料' },
       { name: 'wuxing_scores', type: 'JSONB', description: '五行分數' },
       { name: 'yinyang_ratio', type: 'JSONB', description: '陰陽比例' },
       { name: 'legion_analysis', type: 'JSONB', description: '軍團分析' },
       { name: 'legion_stories', type: 'JSONB', description: '軍團故事' },
     ]
   },
   {
     name: 'legion_stories',
     description: '軍團故事記錄',
     columns: [
       { name: 'id', type: 'UUID', description: '故事 ID' },
       { name: 'calculation_id', type: 'UUID', description: '關聯計算記錄' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'legion_type', type: 'TEXT', description: '軍團類型 (year/month/day/hour)' },
       { name: 'story', type: 'TEXT', description: '故事內容' },
       { name: 'is_locked', type: 'BOOLEAN', description: '是否鎖定' },
       { name: 'version', type: 'INTEGER', description: '版本號' },
     ]
   },
   {
     name: 'user_roles',
     description: '用戶角色權限',
     columns: [
       { name: 'id', type: 'UUID', description: '記錄 ID' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'role', type: 'ENUM', description: '角色 (admin/user)' },
     ]
   },
   {
     name: 'character_favorites',
     description: '角色收藏記錄',
     columns: [
       { name: 'id', type: 'UUID', description: '記錄 ID' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'character_id', type: 'TEXT', description: '角色 ID' },
       { name: 'character_type', type: 'TEXT', description: '角色類型 (gan/zhi)' },
     ]
   },
   {
     name: 'story_regeneration_credits',
     description: '故事重生資格',
     columns: [
       { name: 'id', type: 'UUID', description: '記錄 ID' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'credits_remaining', type: 'INTEGER', description: '剩餘次數' },
       { name: 'total_credits_purchased', type: 'INTEGER', description: '總購買次數' },
     ]
   },
   {
     name: 'api_keys',
     description: 'API 金鑰管理',
     columns: [
       { name: 'id', type: 'UUID', description: '金鑰 ID' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'name', type: 'TEXT', description: '金鑰名稱' },
       { name: 'api_key_hash', type: 'TEXT', description: '金鑰雜湊' },
       { name: 'api_key_prefix', type: 'TEXT', description: '金鑰前綴' },
       { name: 'is_active', type: 'BOOLEAN', description: '是否啟用' },
       { name: 'requests_count', type: 'INTEGER', description: '請求次數' },
     ]
   },
   {
     name: 'prompt_templates',
     description: 'AI 提示詞模板',
     columns: [
       { name: 'id', type: 'UUID', description: '模板 ID' },
       { name: 'user_id', type: 'UUID', description: '用戶 ID' },
       { name: 'name', type: 'TEXT', description: '模板名稱' },
       { name: 'template_type', type: 'ENUM', description: '類型 (legion_story/fortune_consult/personality/custom)' },
       { name: 'system_prompt', type: 'TEXT', description: '系統提示詞' },
       { name: 'user_prompt_template', type: 'TEXT', description: '用戶提示詞模板' },
       { name: 'is_public', type: 'BOOLEAN', description: '是否公開' },
     ]
   },
   {
     name: 'solar_terms',
     description: '節氣資料庫',
     columns: [
       { name: 'id', type: 'UUID', description: '記錄 ID' },
       { name: 'year', type: 'INTEGER', description: '年份' },
       { name: 'term_name', type: 'TEXT', description: '節氣名稱' },
       { name: 'term_date', type: 'TIMESTAMP', description: '節氣時間' },
       { name: 'solar_longitude', type: 'NUMERIC', description: '太陽黃經度數' },
     ]
   },
 ];
 
 // ============ 頁面內容詳細資料 ============
 const PAGE_CONTENTS = {
   home: {
     title: '首頁',
     path: '/',
     sections: [
       {
         name: '英雄區',
         content: [
           '品牌徽章：RSBZS v3.0 · 八字人生兵法',
           '主標題：八字命盤 — 專業可信任的自我探索',
           '副標題：這份分析是一面鏡子，不是劇本——它提供視角與路徑；選擇權永遠在你手上。',
           'CTA 按鈕：立即解析八字、登入/註冊會員',
         ]
       },
       {
         name: '動態統計',
         content: [
           '即時統計服務人數',
           '即時統計報告總數',
           '數據來源：bazi_calculations 與 subscriptions 資料表',
         ]
       },
       {
         name: '功能亮點',
         content: [
           '精準八字排盤：運用天文演算法，精確計算四柱八字、十神、神煞',
           '四時軍團敘事：把抽象命理轉成可讀、可記、可對照的「軍團角色故事」',
           '八字學院：系統化整理命理知識，從入門概念到進階應用',
           '專業可信任：規則透明、邏輯可驗證；不恐嚇、不宿命、不操控',
         ]
       },
       {
         name: '信任與方法',
         content: [
           '核心理念：命盤不是用來替你下結論，而是用來幫你看見模式',
           '報告特色：你目前的能量配置與傾向（清楚）',
           '報告特色：哪些資訊屬於可驗證、哪些屬於推論（克制）',
           '報告特色：可落地的行動建議與提醒（可執行）',
         ]
       },
       {
         name: '應用場景',
         content: [
           '職涯規劃案例：「報告讓我看見自己傾向統籌規劃而非第一線執行」',
           '人際互動案例：「原來我習慣用理性分析回應情感需求」',
           '個人成長案例：「喜歡報告裡的可執行建議，不是抽象的多休息」',
         ]
       },
     ]
   },
   bazi: {
     title: '八字解析',
     path: '/bazi',
     sections: [
       {
         name: '輸入表單',
         content: [
           '姓名輸入',
           '性別選擇（男/女）',
           '出生日期選擇（西曆）',
           '出生時間選擇（時辰）',
           '出生地點選擇（城市）',
           '真太陽時校正開關',
         ]
       },
       {
         name: '報告章節',
         content: [
           '摘要 Summary：核心傾向 3 點 + 行動建議',
           '八字排盤 Bazi：四柱、藏干、十神、納音呈現',
           '十神分析 Ten Gods：人如何運作的傾向解讀',
           '神煞統計 Shensha：傳統符號的參考視角',
           '性格分析 Personality：關係/選擇/壓力下的慣性',
           '軍團敘事 Legion：抽象能量轉化為角色故事',
           '圖表分析 Charts：五行/陰陽視覺化分布',
           '計算紀錄 Logs：透明度與除錯資訊',
         ]
       },
       {
         name: '功能按鈕',
         content: [
           '下載 PDF：生成高擬真度 A4 報告',
           '分享圖片：生成社群分享圖',
           'AI 諮詢：AI 輔助命理問答',
         ]
       },
     ]
   },
   subscribe: {
     title: '訂閱方案',
     path: '/subscribe',
     sections: [
       {
         name: '訂閱方案',
         content: [
           '月訂閱：NT$ 99/月',
           '年訂閱：NT$ 799/年（省 33%）',
           '功能包含：完整軍團故事、十神深度分析、神煞統計、性格剖析、納音詳解、五行陰陽圖表',
         ]
       },
       {
         name: '故事重生資格',
         content: [
           '單次重生：NT$ 29（1 次）',
           '三次重生：NT$ 69（3 次，省 21%）',
           '十次重生：NT$ 199（10 次，省 31%）',
         ]
       },
       {
         name: '常見問題',
         content: [
           '如何付款？支援統一金流、信用卡、超商付款',
           '可以取消訂閱嗎？可隨時取消，使用至期滿',
           '故事重生資格是什麼？軍團故事生成後鎖定，需使用重生資格重新生成',
           '重生資格會過期嗎？不會，永久有效',
         ]
       },
     ]
   },
   gallery: {
     title: '角色圖鑑',
     path: '/gallery',
     sections: [
       {
         name: '指揮官（天干）',
         content: [
           '甲木 · 森林將軍：帶領與統籌',
           '乙木 · 花蔓軍師：彈性與適應',
           '丙火 · 烈日戰神：熱情與光芒',
           '丁火 · 誓燈法師：細膩與堅持',
           '戊土 · 山岳守護：穩重與包容',
           '己土 · 大地母親：滋養與支持',
           '庚金 · 天鍛騎士：果決與正義',
           '辛金 · 靈晶鑑定師：精緻與敏銳',
           '壬水 · 龍河船長：智慧與流動',
           '癸水 · 甘露天使：柔和與滲透',
         ]
       },
       {
         name: '軍師（地支）',
         content: [
           '子水 · 夜行刺客、丑土 · 封藏守衛',
           '寅木 · 雷虎獵人、卯木 · 玉兔使者',
           '辰土 · 泥雲龍法師、巳火 · 蛇焰術士',
           '午火 · 日鬃騎兵、未土 · 牧角調和者',
           '申金 · 金杖靈猴戰士、酉金 · 鳳羽判衡者',
           '戌土 · 烽火戰犬統領、亥水 · 潮典海豚智者',
         ]
       },
       {
         name: '功能',
         content: [
           '五行篩選：依木/火/土/金/水篩選',
           '收藏功能：登入後可收藏角色',
           '燈箱模式：全螢幕檢視角色圖像',
           '角色比較：選擇兩個角色進行比較',
           '關係圖譜：查看角色間的關係網絡',
           '瀏覽歷史：記錄最近查看的角色',
         ]
       },
     ]
   },
   admin: {
     title: '管理後台',
     path: '/admin',
     sections: [
       {
         name: '統計模組',
         content: [
           '總用戶數統計',
           '訂閱轉換率',
           '用戶增長趨勢圖表（Recharts）',
           '報告生成統計',
         ]
       },
       {
         name: '報告管理',
         content: [
           '報告列表與搜尋',
           '報告詳情查看',
           '批次刪除功能',
         ]
       },
       {
         name: '訂閱管理',
         content: [
           '訂閱記錄搜尋',
           '計畫狀態編輯',
           '手動創建訂閱',
         ]
       },
       {
         name: '用戶管理',
         content: [
           '用戶列表與搜尋',
           '用戶詳細資料查看',
           '角色權限管理',
         ]
       },
     ]
   },
 };
 
 // ============ 會員系統功能 ============
 const MEMBER_FEATURES = [
   {
     category: '認證與登入',
     features: [
       { name: '電子郵件登入', description: '使用電子郵件與密碼登入' },
       { name: '會員註冊', description: '新用戶註冊流程' },
       { name: '密碼重設', description: '忘記密碼時的重設流程' },
       { name: '登入鎖定保護', description: '連續失敗登入後的帳號保護機制' },
     ]
   },
   {
     category: '會員權限',
     features: [
       { name: '免費版', description: '基礎八字計算與報告預覽' },
       { name: '月訂閱會員', description: '完整報告、軍團故事、深度分析' },
       { name: '年訂閱會員', description: '月訂閱功能 + 專屬年度運勢報告' },
       { name: '終身會員', description: '永久存取所有功能' },
     ]
   },
   {
     category: '中央會員整合',
     features: [
       { name: '統一會員系統', description: '與中央授權系統整合，支援跨產品權限' },
       { name: '權限驗證', description: '透過 check-entitlement Edge Function 驗證' },
       { name: '雙重驗證', description: '中央系統優先，本地訂閱作為 fallback' },
     ]
   },
   {
     category: '會員中心功能',
     features: [
       { name: '個人資料編輯', description: '更新顯示名稱等個人資訊' },
       { name: '訂閱狀態查看', description: '查看當前訂閱方案與到期時間' },
       { name: '報告歷史', description: '查看過去的八字計算記錄' },
       { name: '收藏管理', description: '管理角色收藏列表' },
     ]
   },
 ];
 
 // ============ 技術架構 ============
 const TECH_STACK = {
   frontend: [
     { name: 'React 18', description: 'UI 框架' },
     { name: 'TypeScript', description: '類型安全' },
     { name: 'Vite 5', description: '建構工具' },
     { name: 'React Router v6', description: '路由管理' },
     { name: 'TanStack Query', description: '伺服器狀態管理' },
   ],
   styling: [
     { name: 'Tailwind CSS', description: '原子化 CSS' },
     { name: 'shadcn/ui', description: 'UI 元件庫' },
     { name: 'Framer Motion', description: '動畫效果' },
     { name: 'Lucide Icons', description: '圖標系統' },
   ],
   backend: [
     { name: 'Supabase', description: 'BaaS 平台' },
     { name: 'PostgreSQL', description: '關聯式資料庫' },
     { name: 'Row Level Security', description: '資料存取控制' },
     { name: 'Edge Functions', description: '無伺服器函數' },
   ],
   integrations: [
     { name: 'Lovable AI', description: 'AI 生成服務' },
     { name: 'Vercel Analytics', description: '效能監控' },
     { name: 'html2canvas + jsPDF', description: 'PDF 生成' },
   ],
 };
 
 // ============ 文件下載功能 ============
 const generateDocumentContent = () => {
   const now = new Date();
   const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
   
   let content = `
 ╔══════════════════════════════════════════════════════════════╗
 ║                                                              ║
 ║           虹靈御所 | RSBZS v3.0 系統文件                       ║
 ║                                                              ║
 ║           生成日期：${dateStr}                                 ║
 ║                                                              ║
 ╚══════════════════════════════════════════════════════════════╝
 
 ════════════════════════════════════════════════════════════════
 第一章：系統概述
 ════════════════════════════════════════════════════════════════
 
 虹靈御所（Hong Ling Yu Suo）是基於 RSBZS v3.0（主題式八字系統）開發的
 專業八字命理分析平台。
 
 【品牌定位】
 一個讓使用者輸入出生資訊後，獲得「可讀、可理解、可落地」的八字分析頁面，
 並可一鍵下載／列印成 PDF 保存。
 
 【核心理念】
 • 這份分析是「鏡子」，不是「劇本」
 • 我們追求：清楚、克制、有美感、可執行
 • 不恐嚇、不宿命、不操控
 
 ════════════════════════════════════════════════════════════════
 第二章：完整路由對照表
 ════════════════════════════════════════════════════════════════
 
 `;
 
   // 路由表
   ROUTES_DATA.forEach(route => {
     content += `【${route.name}】
 路徑：${route.path}
 說明：${route.description}
 存取權限：${route.access}
 分類：${route.category}
 
 `;
   });
 
   content += `
 ════════════════════════════════════════════════════════════════
 第三章：公開頁面內容詳述
 ════════════════════════════════════════════════════════════════
 
 `;
 
   // 頁面內容
   Object.values(PAGE_CONTENTS).forEach(page => {
     content += `【${page.title}】（${page.path}）
 `;
     page.sections.forEach(section => {
       content += `\n  ▸ ${section.name}
 `;
       section.content.forEach(item => {
         content += `    • ${item}
 `;
       });
     });
     content += '\n';
   });
 
   content += `
 ════════════════════════════════════════════════════════════════
 第四章：會員系統功能說明
 ════════════════════════════════════════════════════════════════
 
 `;
 
   MEMBER_FEATURES.forEach(category => {
     content += `【${category.category}】
 `;
     category.features.forEach(feature => {
       content += `  • ${feature.name}：${feature.description}
 `;
     });
     content += '\n';
   });
 
   content += `
 ════════════════════════════════════════════════════════════════
 第五章：管理後台功能
 ════════════════════════════════════════════════════════════════
 
 管理後台路徑：/admin
 存取權限：僅限 admin 角色
 
 【模組一：統計儀表板】
   • 總用戶數統計
   • 訂閱轉換率分析
   • 用戶增長趨勢圖表
   • 報告生成統計
 
 【模組二：報告管理】
   • 報告列表與搜尋
   • 報告詳情查看
   • 批次刪除功能
 
 【模組三：訂閱管理】
   • 訂閱記錄搜尋
   • 計畫狀態編輯
   • 手動創建訂閱
 
 【模組四：用戶管理】
   • 用戶列表與搜尋
   • 用戶詳細資料
   • 角色權限管理
 
 ════════════════════════════════════════════════════════════════
 第六章：技術架構
 ════════════════════════════════════════════════════════════════
 
 【前端技術】
 `;
 
   TECH_STACK.frontend.forEach(tech => {
     content += `  • ${tech.name}：${tech.description}
 `;
   });
 
   content += `
 【樣式系統】
 `;
   TECH_STACK.styling.forEach(tech => {
     content += `  • ${tech.name}：${tech.description}
 `;
   });
 
   content += `
 【後端服務】
 `;
   TECH_STACK.backend.forEach(tech => {
     content += `  • ${tech.name}：${tech.description}
 `;
   });
 
   content += `
 【整合服務】
 `;
   TECH_STACK.integrations.forEach(tech => {
     content += `  • ${tech.name}：${tech.description}
 `;
   });
 
   content += `
 ════════════════════════════════════════════════════════════════
 第七章：資料表結構
 ════════════════════════════════════════════════════════════════
 
 `;
 
   DATABASE_TABLES.forEach(table => {
     content += `【${table.name}】${table.description}
 ┌──────────────────────────────────────────────────────────────┐
 `;
     table.columns.forEach(col => {
       content += `│ ${col.name.padEnd(25)} │ ${col.type.padEnd(12)} │ ${col.description}
 `;
     });
     content += `└──────────────────────────────────────────────────────────────┘
 
 `;
   });
 
   content += `
 ════════════════════════════════════════════════════════════════
 第八章：免責聲明
 ════════════════════════════════════════════════════════════════
 
 1. 本報告為八字（命理）系統的結構化呈現與解讀參考，目的在於提供觀察角度
    與可執行建議。
 
 2. 本內容不構成醫療診斷、心理治療、法律建議、財務／投資建議或任何形式
    之專業服務。
 
 3. 文中之趨勢、傾向、可能性描述，不等同於保證結果；使用者仍需依自身狀況
    做出判斷與選擇。
 
 4. 涉及健康、心理、法律、財務等重大議題，請尋求合格專業人士協助。
 
 5. 使用本內容即表示你理解並同意以上聲明。
 
 ════════════════════════════════════════════════════════════════
 
 © ${now.getFullYear()} 超烜創意 / 虹靈御所
 版本：RSBZS v3.0
 
 `;
 
   return content;
 };
 
 const downloadAsText = () => {
   const content = generateDocumentContent();
   const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `虹靈御所_系統文件_${new Date().toISOString().split('T')[0]}.txt`;
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
   toast.success('文件下載成功');
 };
 
 const downloadAsMarkdown = () => {
   const now = new Date();
   const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
   
   let md = `# 虹靈御所 | RSBZS v3.0 系統文件
 
 > 生成日期：${dateStr}
 
 ---
 
 ## 第一章：系統概述
 
 虹靈御所（Hong Ling Yu Suo）是基於 RSBZS v3.0（主題式八字系統）開發的專業八字命理分析平台。
 
 ### 品牌定位
 
 一個讓使用者輸入出生資訊後，獲得「可讀、可理解、可落地」的八字分析頁面，並可一鍵下載／列印成 PDF 保存。
 
 ### 核心理念
 
 - 這份分析是「鏡子」，不是「劇本」
 - 我們追求：清楚、克制、有美感、可執行
 - 不恐嚇、不宿命、不操控
 
 ---
 
 ## 第二章：完整路由對照表
 
 | 路徑 | 名稱 | 說明 | 存取權限 | 分類 |
 |------|------|------|----------|------|
 `;
 
   ROUTES_DATA.forEach(route => {
     md += `| \`${route.path}\` | ${route.name} | ${route.description} | ${route.access} | ${route.category} |\n`;
   });
 
   md += `
 ---
 
 ## 第三章：公開頁面內容詳述
 
 `;
 
   Object.values(PAGE_CONTENTS).forEach(page => {
     md += `### ${page.title}（\`${page.path}\`）
 
 `;
     page.sections.forEach(section => {
       md += `#### ${section.name}
 
 `;
       section.content.forEach(item => {
         md += `- ${item}\n`;
       });
       md += '\n';
     });
   });
 
   md += `---
 
 ## 第四章：會員系統功能說明
 
 `;
 
   MEMBER_FEATURES.forEach(category => {
     md += `### ${category.category}
 
 | 功能 | 說明 |
 |------|------|
 `;
     category.features.forEach(feature => {
       md += `| ${feature.name} | ${feature.description} |\n`;
     });
     md += '\n';
   });
 
   md += `---
 
 ## 第五章：管理後台功能
 
 **路徑**：\`/admin\`  
 **存取權限**：僅限 admin 角色
 
 ### 模組一：統計儀表板
 - 總用戶數統計
 - 訂閱轉換率分析
 - 用戶增長趨勢圖表
 - 報告生成統計
 
 ### 模組二：報告管理
 - 報告列表與搜尋
 - 報告詳情查看
 - 批次刪除功能
 
 ### 模組三：訂閱管理
 - 訂閱記錄搜尋
 - 計畫狀態編輯
 - 手動創建訂閱
 
 ### 模組四：用戶管理
 - 用戶列表與搜尋
 - 用戶詳細資料
 - 角色權限管理
 
 ---
 
 ## 第六章：技術架構
 
 ### 前端技術
 
 | 技術 | 用途 |
 |------|------|
 `;
 
   TECH_STACK.frontend.forEach(tech => {
     md += `| ${tech.name} | ${tech.description} |\n`;
   });
 
   md += `
 ### 樣式系統
 
 | 技術 | 用途 |
 |------|------|
 `;
 
   TECH_STACK.styling.forEach(tech => {
     md += `| ${tech.name} | ${tech.description} |\n`;
   });
 
   md += `
 ### 後端服務
 
 | 技術 | 用途 |
 |------|------|
 `;
 
   TECH_STACK.backend.forEach(tech => {
     md += `| ${tech.name} | ${tech.description} |\n`;
   });
 
   md += `
 ### 整合服務
 
 | 技術 | 用途 |
 |------|------|
 `;
 
   TECH_STACK.integrations.forEach(tech => {
     md += `| ${tech.name} | ${tech.description} |\n`;
   });
 
   md += `
 ---
 
 ## 第七章：資料表結構
 
 `;
 
   DATABASE_TABLES.forEach(table => {
     md += `### ${table.name}
 
 > ${table.description}
 
 | 欄位 | 類型 | 說明 |
 |------|------|------|
 `;
     table.columns.forEach(col => {
       md += `| ${col.name} | ${col.type} | ${col.description} |\n`;
     });
     md += '\n';
   });
 
   md += `---
 
 ## 第八章：免責聲明
 
 1. 本報告為八字（命理）系統的結構化呈現與解讀參考，目的在於提供觀察角度與可執行建議。
 
 2. 本內容不構成醫療診斷、心理治療、法律建議、財務／投資建議或任何形式之專業服務。
 
 3. 文中之趨勢、傾向、可能性描述，不等同於保證結果；使用者仍需依自身狀況做出判斷與選擇。
 
 4. 涉及健康、心理、法律、財務等重大議題，請尋求合格專業人士協助。
 
 5. 使用本內容即表示你理解並同意以上聲明。
 
 ---
 
 © ${now.getFullYear()} 超烜創意 / 虹靈御所  
 版本：RSBZS v3.0
 `;
 
   const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `虹靈御所_系統文件_${new Date().toISOString().split('T')[0]}.md`;
   document.body.appendChild(a);
   a.click();
   document.body.removeChild(a);
   URL.revokeObjectURL(url);
   toast.success('Markdown 文件下載成功');
 };
 
 // ============ 主元件 ============
 const SystemDocumentation = () => {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState('overview');
 
   return (
     <div className="min-h-screen bg-background">
       {/* 星空背景 */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--cosmic-nebula)/0.15),_transparent_50%)]" />
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--cosmic-nebula2)/0.1),_transparent_50%)]" />
       </div>
 
       <div className="relative container mx-auto px-4 py-8 max-w-6xl">
         {/* 頂部導航 */}
         <div className="flex items-center justify-between mb-8">
           <Button variant="ghost" onClick={() => navigate('/')}>
             <ArrowLeft className="w-4 h-4 mr-2" />
             返回首頁
           </Button>
           <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={downloadAsText}>
               <FileDown className="w-4 h-4 mr-2" />
               下載 TXT
             </Button>
             <Button variant="outline" size="sm" onClick={downloadAsMarkdown}>
               <ScrollText className="w-4 h-4 mr-2" />
               下載 Markdown
             </Button>
           </div>
         </div>
 
         {/* 標題區 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
         >
           <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 text-primary">
             <FileText className="w-3.5 h-3.5 mr-1.5" />
             RSBZS v3.0 系統文件
           </Badge>
           <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">
             <span className="cosmic-title-gradient">虹靈御所</span>
             <span className="text-foreground/80 text-3xl md:text-4xl block mt-2">
               完整系統文件
             </span>
           </h1>
           <p className="text-muted-foreground max-w-2xl mx-auto">
             包含所有公開頁面內容、會員系統、管理後台、技術架構與資料表結構的完整文件
           </p>
         </motion.div>
 
         {/* 主要內容 Tabs */}
         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
           <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
             <TabsTrigger value="overview" className="text-xs sm:text-sm">
               <Globe className="w-4 h-4 mr-1 hidden sm:inline" />
               概述
             </TabsTrigger>
             <TabsTrigger value="routes" className="text-xs sm:text-sm">
               <Map className="w-4 h-4 mr-1 hidden sm:inline" />
               路由
             </TabsTrigger>
             <TabsTrigger value="pages" className="text-xs sm:text-sm">
               <FileText className="w-4 h-4 mr-1 hidden sm:inline" />
               頁面
             </TabsTrigger>
             <TabsTrigger value="member" className="text-xs sm:text-sm">
               <Users className="w-4 h-4 mr-1 hidden sm:inline" />
               會員
             </TabsTrigger>
             <TabsTrigger value="tech" className="text-xs sm:text-sm">
               <Code className="w-4 h-4 mr-1 hidden sm:inline" />
               技術
             </TabsTrigger>
             <TabsTrigger value="database" className="text-xs sm:text-sm">
               <Database className="w-4 h-4 mr-1 hidden sm:inline" />
               資料庫
             </TabsTrigger>
           </TabsList>
 
           {/* 概述 */}
           <TabsContent value="overview">
             <div className="grid gap-6">
               <Card className="border-primary/20">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-primary" />
                     品牌定位
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <p className="text-foreground/80">
                     虹靈御所是基於 RSBZS v3.0（主題式八字系統）開發的專業八字命理分析平台，
                     讓使用者輸入出生資訊後，獲得「可讀、可理解、可落地」的八字分析報告。
                   </p>
                   <div className="grid md:grid-cols-3 gap-4 mt-4">
                     <div className="p-4 rounded-lg bg-muted/50 border">
                       <h4 className="font-semibold mb-2 flex items-center gap-2">
                         <Zap className="w-4 h-4 text-primary" />
                         清楚
                       </h4>
                       <p className="text-sm text-muted-foreground">
                         精準呈現能量配置與傾向，避免模糊描述
                       </p>
                     </div>
                     <div className="p-4 rounded-lg bg-muted/50 border">
                       <h4 className="font-semibold mb-2 flex items-center gap-2">
                         <Shield className="w-4 h-4 text-primary" />
                         克制
                       </h4>
                       <p className="text-sm text-muted-foreground">
                         區分可驗證資訊與推論，不恐嚇不操控
                       </p>
                     </div>
                     <div className="p-4 rounded-lg bg-muted/50 border">
                       <h4 className="font-semibold mb-2 flex items-center gap-2">
                         <BookOpen className="w-4 h-4 text-primary" />
                         可執行
                       </h4>
                       <p className="text-sm text-muted-foreground">
                         提供具體可落地的行動建議與提醒
                       </p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Layers className="w-5 h-5 text-primary" />
                     核心功能
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid md:grid-cols-2 gap-4">
                     <div className="space-y-3">
                       <h4 className="font-semibold">八字計算引擎</h4>
                       <ul className="space-y-1 text-sm text-muted-foreground">
                         <li>• 支援 1850-2100 年節氣精準計算</li>
                         <li>• 真太陽時校正功能</li>
                         <li>• 十神社會化詮釋</li>
                         <li>• 結構化神煞分析</li>
                       </ul>
                     </div>
                     <div className="space-y-3">
                       <h4 className="font-semibold">四時八字軍團兵法</h4>
                       <ul className="space-y-1 text-sm text-muted-foreground">
                         <li>• 指揮官（天干）角色系統</li>
                         <li>• 軍師（地支）角色系統</li>
                         <li>• 戰場環境（納音）設定</li>
                         <li>• AI 生成個人化故事</li>
                       </ul>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </TabsContent>
 
           {/* 路由對照表 */}
           <TabsContent value="routes">
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Map className="w-5 h-5 text-primary" />
                   完整路由對照表
                 </CardTitle>
                 <CardDescription>
                   系統所有頁面路徑與存取權限
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="overflow-x-auto">
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>路徑</TableHead>
                         <TableHead>名稱</TableHead>
                         <TableHead className="hidden md:table-cell">說明</TableHead>
                         <TableHead>權限</TableHead>
                         <TableHead className="hidden sm:table-cell">分類</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {ROUTES_DATA.map((route) => (
                         <TableRow key={route.path}>
                           <TableCell className="font-mono text-sm">{route.path}</TableCell>
                           <TableCell className="font-medium">{route.name}</TableCell>
                           <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                             {route.description}
                           </TableCell>
                           <TableCell>
                             <Badge variant={
                               route.access === '公開' ? 'secondary' :
                               route.access === '會員' ? 'default' :
                               route.access === 'Premium' ? 'default' :
                               'destructive'
                             } className={
                               route.access === 'Premium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : ''
                             }>
                               {route.access === 'Premium' && <Crown className="w-3 h-3 mr-1" />}
                               {route.access === '管理員' && <Lock className="w-3 h-3 mr-1" />}
                               {route.access}
                             </Badge>
                           </TableCell>
                           <TableCell className="hidden sm:table-cell">
                             <Badge variant="outline">{route.category}</Badge>
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           {/* 頁面內容 */}
           <TabsContent value="pages">
             <div className="space-y-4">
               <Accordion type="single" collapsible className="space-y-2">
                 {Object.entries(PAGE_CONTENTS).map(([key, page]) => (
                   <AccordionItem key={key} value={key} className="border rounded-lg px-4">
                     <AccordionTrigger className="hover:no-underline">
                       <div className="flex items-center gap-3">
                         <FileText className="w-5 h-5 text-primary" />
                         <span className="font-semibold">{page.title}</span>
                         <Badge variant="outline" className="font-mono text-xs">
                           {page.path}
                         </Badge>
                       </div>
                     </AccordionTrigger>
                     <AccordionContent className="pt-4">
                       <div className="space-y-4">
                         {page.sections.map((section, idx) => (
                           <div key={idx} className="pl-4 border-l-2 border-primary/30">
                             <h4 className="font-medium mb-2 text-foreground">{section.name}</h4>
                             <ul className="space-y-1">
                               {section.content.map((item, i) => (
                                 <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                   <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-primary/50" />
                                   {item}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         ))}
                       </div>
                     </AccordionContent>
                   </AccordionItem>
                 ))}
               </Accordion>
             </div>
           </TabsContent>
 
           {/* 會員系統 */}
           <TabsContent value="member">
             <div className="grid gap-6">
               {MEMBER_FEATURES.map((category, idx) => (
                 <Card key={idx}>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       {category.category === '認證與登入' && <Shield className="w-5 h-5 text-primary" />}
                       {category.category === '會員權限' && <Crown className="w-5 h-5 text-primary" />}
                       {category.category === '中央會員整合' && <Globe className="w-5 h-5 text-primary" />}
                       {category.category === '會員中心功能' && <Users className="w-5 h-5 text-primary" />}
                       {category.category}
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="grid sm:grid-cols-2 gap-3">
                       {category.features.map((feature, i) => (
                         <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                           <h4 className="font-medium mb-1">{feature.name}</h4>
                           <p className="text-sm text-muted-foreground">{feature.description}</p>
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
           </TabsContent>
 
           {/* 技術架構 */}
           <TabsContent value="tech">
             <div className="grid md:grid-cols-2 gap-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Code className="w-5 h-5 text-primary" />
                     前端技術
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     {TECH_STACK.frontend.map((tech, i) => (
                       <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                         <span className="font-medium">{tech.name}</span>
                         <span className="text-sm text-muted-foreground">{tech.description}</span>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Sparkles className="w-5 h-5 text-primary" />
                     樣式系統
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     {TECH_STACK.styling.map((tech, i) => (
                       <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                         <span className="font-medium">{tech.name}</span>
                         <span className="text-sm text-muted-foreground">{tech.description}</span>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Database className="w-5 h-5 text-primary" />
                     後端服務
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     {TECH_STACK.backend.map((tech, i) => (
                       <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                         <span className="font-medium">{tech.name}</span>
                         <span className="text-sm text-muted-foreground">{tech.description}</span>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
 
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Zap className="w-5 h-5 text-primary" />
                     整合服務
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-2">
                     {TECH_STACK.integrations.map((tech, i) => (
                       <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                         <span className="font-medium">{tech.name}</span>
                         <span className="text-sm text-muted-foreground">{tech.description}</span>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             </div>
           </TabsContent>
 
           {/* 資料庫 */}
           <TabsContent value="database">
             <div className="space-y-4">
               <Accordion type="single" collapsible className="space-y-2">
                 {DATABASE_TABLES.map((table) => (
                   <AccordionItem key={table.name} value={table.name} className="border rounded-lg px-4">
                     <AccordionTrigger className="hover:no-underline">
                       <div className="flex items-center gap-3">
                         <Database className="w-5 h-5 text-primary" />
                         <span className="font-mono font-semibold">{table.name}</span>
                         <span className="text-sm text-muted-foreground hidden sm:inline">
                           {table.description}
                         </span>
                       </div>
                     </AccordionTrigger>
                     <AccordionContent className="pt-4">
                       <div className="overflow-x-auto">
                         <Table>
                           <TableHeader>
                             <TableRow>
                               <TableHead>欄位</TableHead>
                               <TableHead>類型</TableHead>
                               <TableHead>說明</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {table.columns.map((col) => (
                               <TableRow key={col.name}>
                                 <TableCell className="font-mono text-sm">{col.name}</TableCell>
                                 <TableCell>
                                   <Badge variant="outline" className="font-mono text-xs">
                                     {col.type}
                                   </Badge>
                                 </TableCell>
                                 <TableCell className="text-muted-foreground text-sm">
                                   {col.description}
                                 </TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                       </div>
                     </AccordionContent>
                   </AccordionItem>
                 ))}
               </Accordion>
             </div>
           </TabsContent>
         </Tabs>
 
         {/* 下載區塊 */}
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.3 }}
           className="mt-12"
         >
           <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
             <CardContent className="py-8">
               <div className="text-center space-y-4">
                 <Download className="w-12 h-12 mx-auto text-primary" />
                 <h3 className="text-xl font-bold">下載完整文件</h3>
                 <p className="text-muted-foreground max-w-lg mx-auto">
                   下載包含所有系統文件的完整檔案，方便離線閱讀或分享
                 </p>
                 <div className="flex flex-wrap justify-center gap-3 pt-4">
                   <Button onClick={downloadAsText} variant="outline" size="lg">
                     <FileDown className="w-5 h-5 mr-2" />
                     下載 TXT 純文字
                   </Button>
                   <Button onClick={downloadAsMarkdown} size="lg" className="bg-gradient-to-r from-primary to-accent">
                     <ScrollText className="w-5 h-5 mr-2" />
                     下載 Markdown 文件
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground pt-2">
                   提示：Markdown 檔案可使用支援 MD 的編輯器開啟，或轉換為 PDF/Word
                 </p>
               </div>
             </CardContent>
           </Card>
         </motion.div>
 
         {/* 版權資訊 */}
         <div className="mt-8 text-center text-sm text-muted-foreground">
           <p>© {new Date().getFullYear()} 超烜創意 / 虹靈御所 · RSBZS v3.0</p>
         </div>
       </div>
     </div>
   );
 };
 
 export default SystemDocumentation;