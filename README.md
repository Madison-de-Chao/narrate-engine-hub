# 虹靈御所 | RSBZS v3.0

> **主題式八字系統 (Rainbow Soul Bazi System)**  
> 讓使用者輸入出生資訊後，獲得「可讀、可理解、可落地」的八字分析報告

🌐 **線上展示**: [Lovable 預覽](https://id-preview--77bf5d47-53c6-44e3-ae4a-e2ca30c3fbb2.lovable.app)

---

## 📋 專案簡介

虹靈御所是一個現代化的八字命理平台，融合傳統命理智慧與現代科技，提供精準的八字計算與視覺化分析。我們的核心理念是：

> **「這份分析是鏡子，不是劇本：提供視角與路徑，但選擇權永遠在你手上。」**

### 品牌核心價值
- 🔍 **清楚** - 結構化呈現，易於理解
- 🎯 **克制** - 不恐嚇、不宿命、不操控
- 🎨 **有美感** - Cosmic Architect 視覺設計
- ⚡ **可執行** - 每個分析都附帶可落地的行動建議

---

## ✨ 核心功能

### 🔮 精準八字計算引擎
- **節氣資料庫**: 涵蓋 1850-2100 年完整節氣資料
- **真太陽時校正**: 支援經緯度校正，計算精確到秒
- **跨日修正**: 正確處理子時跨日問題
- **雙軌計算**: 支援嚴格模式與簡易模式

### 📊 結構化分析模組
- **十神分析**: 社會化詮釋，連結現代生活情境
- **神煞系統**: 40+ 傳統神煞，規則透明可查
- **五行圖表**: 視覺化能量分布與陰陽比例
- **納音解析**: 六十甲子納音與戰場環境對應

### ⚔️ 四時八字軍團兵法
獨特的敘事化系統，將八字轉化為角色故事：
- **指揮官 (天干)**: 10 位性格鮮明的領袖角色
- **軍師 (地支)**: 12 位策略顧問角色
- **戰場環境 (納音)**: 30 種戰場場景設定
- **Buff/Debuff 系統**: 五行生剋與十神強弱機制

### 📄 專業報告輸出
- **響應式網頁**: 桌面與手機最佳化閱讀體驗
- **PDF 匯出**: A4 高擬真度報告，章節順序一致
- **分享功能**: 角色卡片與成就分享圖

---

## 🚀 技術棧

| 層級 | 技術 |
|------|------|
| **前端框架** | React 18 + TypeScript |
| **建置工具** | Vite 5 |
| **UI 組件** | shadcn-ui + Radix UI |
| **樣式方案** | Tailwind CSS (Cosmic Architect 設計系統) |
| **動畫** | Framer Motion |
| **狀態管理** | TanStack React Query |
| **路由** | React Router DOM v6 |
| **後端** | Lovable Cloud (PostgreSQL + Edge Functions) |
| **認證** | Supabase Auth |
| **圖表** | Recharts |
| **PDF** | jsPDF + html2canvas |

---

## 🎨 設計系統：Cosmic Architect

採用「宇宙建築師」視覺風格，深藍與金色 HUD 美學：

```css
/* 核心色彩 Tokens */
--cosmic-void: 深空背景
--cosmic-deep: 深層空間
--cosmic-surface: 表面層
--cosmic-gold: 金色強調
--cosmic-accent: 青藍輝光
```

### 視覺特色
- 🌌 星雲漸層背景
- ✨ 金色邊框光暈
- 🔲 HUD 風格卡片
- 💫 呼吸動畫效果

---

## 📁 專案結構

```
src/
├── components/           # React 組件
│   ├── ui/              # shadcn-ui 基礎組件
│   ├── report/          # 報告相關組件
│   └── admin/           # 管理後台組件
├── pages/               # 路由頁面
├── hooks/               # 自定義 React Hooks
├── lib/                 # 核心邏輯
│   ├── bazi/           # 八字計算引擎
│   ├── legionTranslator/ # 軍團敘事轉譯器
│   └── member/         # 會員 SDK
├── data/               # 靜態資料
│   ├── shensha_trad/   # 傳統神煞規則
│   └── shensha_legion/ # 軍團神煞組合
├── assets/             # 角色圖片資源
│   ├── commanders/     # 指揮官頭像
│   └── advisors/       # 軍師頭像
└── integrations/       # 外部服務整合

supabase/
└── functions/          # Edge Functions
    ├── calculate-bazi/
    ├── generate-legion-story/
    └── ai-fortune-consult/
```

---

## 🛠️ 本地開發

### 環境需求
- Node.js 18+ (建議使用 LTS 版本)
- pnpm 或 npm

### 安裝步驟

```bash
# 1. 克隆儲存庫
git clone https://github.com/Madison-de-Chao/narrate-engine-hub.git

# 2. 進入專案目錄
cd narrate-engine-hub

# 3. 安裝依賴
pnpm install

# 4. 啟動開發伺服器
pnpm dev
```

開發伺服器將在 `http://localhost:8080` 啟動。

### 可用腳本

```bash
pnpm dev          # 啟動開發伺服器
pnpm build        # 建置生產版本
pnpm preview      # 預覽生產建置
pnpm lint         # 執行程式碼檢查
pnpm test         # 執行測試
```

---

## 📖 頁面路由

| 路由 | 說明 | 權限 |
|------|------|------|
| `/` | 首頁入口 | 公開 |
| `/bazi` | 八字分析主頁 | 公開 |
| `/gallery` | 角色圖鑑 | 公開 |
| `/map` | 導覽地圖 | 公開 |
| `/academy` | 八字學院 | Premium |
| `/guide/:zoneId` | Zone Guide | Premium |
| `/subscribe` | 訂閱方案 | 公開 |
| `/account` | 帳戶管理 | 登入 |
| `/admin` | 管理後台 | Admin |

---

## 📦 SKU 產品架構

基於 RSBZS 白皮書定義的三層產品：

### RS-Core (計算引擎)
- 精準八字排盤
- 節氣資料庫
- 真太陽時計算

### RS-Matrix (延伸分析)
- 十神詮釋系統
- 神煞分析引擎
- 軍團敘事轉譯

### Hong Ling Assets (資源包)
- 22 位角色視覺資源
- 30 種納音戰場
- 品牌設計素材

---

## 🔐 安全與隱私

- 報告頁面不被搜尋引擎收錄
- 敏感資訊不暴露於 URL 或日誌
- RLS 政策保護資料存取
- Premium 內容權限控管

---

## 📝 免責聲明

本內容屬於命理與自我探索的參考資訊，旨在提供觀點與行動建議，不構成且不取代任何醫療、心理、法律或投資等專業意見。若您正面臨重大決策，請諮詢合格專業人士。

---

## 🔧 使用 Lovable 編輯

本專案支援使用 [Lovable](https://lovable.dev) 平台進行視覺化編輯：

- **專案連結**: [Lovable 專案頁面](https://lovable.dev/projects/77bf5d47-53c6-44e3-ae4a-e2ca30c3fbb2)
- 透過 Lovable 進行的變更會自動提交到此儲存庫

---

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 本儲存庫
2. 創建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

---

## 👥 作者

**Madison-de-Chao** - [GitHub](https://github.com/Madison-de-Chao)

---

## 🔗 相關連結

- [線上預覽](https://id-preview--77bf5d47-53c6-44e3-ae4a-e2ca30c3fbb2.lovable.app)
- [問題追蹤](https://github.com/Madison-de-Chao/narrate-engine-hub/issues)
- [Lovable 專案](https://lovable.dev/projects/77bf5d47-53c6-44e3-ae4a-e2ca30c3fbb2)

---

<p align="center">
  <strong>虹靈御所 | RSBZS v3.0</strong><br>
  看清、感受、療癒
</p>

⭐ 如果這個專案對您有幫助，請給我們一個星星！
