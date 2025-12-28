import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { commanderAvatars } from "@/assets/commanders";
import { advisorAvatars } from "@/assets/advisors";
import { GAN_CHARACTERS, ZHI_CHARACTERS } from "@/lib/legionTranslator/characterData";

// 封面資料介面
export interface CoverPageData {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
  yearPillar: { stem: string; branch: string };
  monthPillar: { stem: string; branch: string };
  dayPillar: { stem: string; branch: string };
  hourPillar: { stem: string; branch: string };
}

// 神煞資料介面
export interface ShenshaItem {
  name: string;
  position?: string;
  category?: string;
  effect?: string;
  modernMeaning?: string;
  rarity?: string;
}

// 軍團角色資料介面
export interface LegionCharacterData {
  stem: string;
  branch: string;
  commanderTitle: string;
  commanderBuff: string;
  commanderDebuff: string;
  advisorTitle: string;
  advisorBuff: string;
  advisorDebuff: string;
  tenGodStem?: string;
  tenGodBranch?: string;
}

export interface PdfOptions {
  includeCover: boolean;
  includePillars: boolean;
  includeShensha: boolean;
  includeLegionDetails: boolean; // 新增：軍團詳解頁
  includeYearStory: boolean;
  includeMonthStory: boolean;
  includeDayStory: boolean;
  includeHourStory: boolean;
}

export interface ReportData {
  name: string;
  gender: string;
  birthDate: string;
  pillars: {
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
  tenGods?: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  hiddenStems?: {
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
  wuxing?: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinyang?: {
    yin: number;
    yang: number;
  };
  legionStories?: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
  shensha?: ShenshaItem[];
}

// 默認選項
const defaultPdfOptions: PdfOptions = {
  includeCover: true,
  includePillars: true,
  includeShensha: true,
  includeLegionDetails: true,
  includeYearStory: true,
  includeMonthStory: true,
  includeDayStory: true,
  includeHourStory: true,
};

// 共用樣式常量 - 提升一致性與專業感
const COLORS = {
  gold: '#c8aa64',
  goldLight: '#dcc88c',
  goldDark: '#a08050',
  bgPrimary: '#0a0a0f',
  bgSecondary: '#141420',
  bgCard: 'rgba(25, 25, 35, 0.9)',
  textPrimary: '#e8e8e8',
  textSecondary: '#a0a0a0',
  textMuted: '#707070',
  border: 'rgba(180, 140, 80, 0.3)',
  green: '#4ade80',
  red: '#f87171',
  purple: '#a855f7',
  orange: '#f97316',
  blue: '#60a5fa',
};

// 中文字體配置 - 確保 PDF 渲染正確
const FONTS = {
  // 標題用字體：思源宋體為主，多層 fallback 確保相容性
  heading: '"Noto Serif TC", "ZCOOL XiaoWei", "Source Han Serif TC", "Source Han Serif", "SimSun", "PMingLiU", serif',
  // 內文用字體：思源黑體為主，確保可讀性
  base: '"Noto Sans TC", "Noto Serif TC", "Microsoft JhengHei", "PingFang TC", "Heiti TC", sans-serif',
  // 數字與英文：搭配無襯線字體
  mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
};

// 字體預載入函數 - 確保 PDF 生成前字體已載入
const ensureFontsLoaded = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  
  // 檢查字體是否已載入
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
    
    // 額外等待確保中文字體完全載入
    const testElement = document.createElement('span');
    testElement.style.cssText = `
      font-family: ${FONTS.heading};
      position: absolute;
      visibility: hidden;
      font-size: 72px;
    `;
    testElement.textContent = '虹靈御所測試字體載入';
    document.body.appendChild(testElement);
    
    // 短暫延遲確保渲染
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.removeChild(testElement);
  }
};

// 創建共用頁眉組件
const createHeader = (subtitle?: string) => `
  <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid ${COLORS.border};">
    <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
      <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark});"></div>
      <h2 style="font-size: 18px; color: ${COLORS.gold}; margin: 0; letter-spacing: 6px; font-weight: 500;">虹靈御所</h2>
      <div style="width: 60px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.goldDark});"></div>
    </div>
    ${subtitle ? `<p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 8px 0 0 0; letter-spacing: 3px;">${subtitle}</p>` : ''}
  </div>
`;

// 創建共用頁腳組件
const createFooter = (dateStr: string, pageInfo: string) => `
  <div style="position: absolute; bottom: 30px; left: 50px; right: 50px;">
    <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.border}, transparent); margin-bottom: 15px;"></div>
    <div style="display: flex; justify-content: space-between; font-size: 10px; color: ${COLORS.textMuted}; letter-spacing: 1px;">
      <span>${dateStr}</span>
      <span style="color: ${COLORS.goldDark};">虹靈御所 · 超烜創意</span>
      <span>${pageInfo}</span>
    </div>
  </div>
`;

// 創建報告 HTML 容器
const createReportContainer = (reportData: ReportData, coverData?: CoverPageData, options: PdfOptions = defaultPdfOptions): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 794px;
    background: ${COLORS.bgPrimary};
    color: ${COLORS.textPrimary};
    font-family: ${FONTS.base};
    padding: 0;
    position: absolute;
    left: -9999px;
    top: 0;
  `;
  document.body.appendChild(container);

  // 獲取當前日期時間
  const now = new Date();
  const dateStr = now.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const genderText = reportData.gender === 'male' ? '乾造（男）' : '坤造（女）';

  // 封面頁 - 精緻專業設計
  const coverPage = `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 50%, ${COLORS.bgPrimary} 100%);
      position: relative;
      padding: 0;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
    ">
      <!-- 精緻邊框 -->
      <div style="position: absolute; inset: 20px; border: 2px solid ${COLORS.gold}; pointer-events: none;"></div>
      <div style="position: absolute; inset: 28px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      
      <!-- 角落裝飾 -->
      <div style="position: absolute; top: 20px; left: 20px; width: 40px; height: 40px;">
        <div style="position: absolute; top: 0; left: 0; width: 25px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; top: 0; left: 0; width: 2px; height: 25px; background: ${COLORS.gold};"></div>
      </div>
      <div style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px;">
        <div style="position: absolute; top: 0; right: 0; width: 25px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; top: 0; right: 0; width: 2px; height: 25px; background: ${COLORS.gold};"></div>
      </div>
      <div style="position: absolute; bottom: 20px; left: 20px; width: 40px; height: 40px;">
        <div style="position: absolute; bottom: 0; left: 0; width: 25px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 2px; height: 25px; background: ${COLORS.gold};"></div>
      </div>
      <div style="position: absolute; bottom: 20px; right: 20px; width: 40px; height: 40px;">
        <div style="position: absolute; bottom: 0; right: 0; width: 25px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 2px; height: 25px; background: ${COLORS.gold};"></div>
      </div>
      
      <!-- 主內容區 -->
      <div style="padding: 80px 60px; height: calc(100% - 160px); display: flex; flex-direction: column;">
        
        <!-- 品牌標題 -->
        <div style="text-align: center; margin-bottom: 50px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 25px; margin-bottom: 20px;">
            <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.gold});"></div>
            <span style="font-size: 14px; color: ${COLORS.goldDark}; letter-spacing: 8px;">八字人生兵法</span>
            <div style="width: 80px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.gold});"></div>
          </div>
          <h1 style="
            font-size: 56px;
            font-family: ${FONTS.heading};
            color: ${COLORS.gold};
            margin: 0;
            font-weight: 600;
            letter-spacing: 16px;
            text-shadow: 0 4px 20px rgba(200, 170, 100, 0.3);
          ">虹靈御所</h1>
          <p style="font-size: 16px; color: ${COLORS.textMuted}; margin: 15px 0 0 0; letter-spacing: 4px;">個人命理研究報告</p>
        </div>
        
        <!-- 命主資訊卡片 -->
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <div style="
            text-align: center;
            padding: 50px 80px;
            background: ${COLORS.bgCard};
            border: 1px solid ${COLORS.border};
            border-radius: 4px;
          ">
            <p style="font-size: 12px; color: ${COLORS.textMuted}; margin: 0 0 15px 0; letter-spacing: 6px;">命主</p>
            <h2 style="
              font-size: 52px;
              font-family: ${FONTS.heading};
              color: ${COLORS.goldLight};
              margin: 0 0 15px 0;
              font-weight: 600;
              letter-spacing: 10px;
            ">${reportData.name}</h2>
            <p style="font-size: 15px; color: ${COLORS.textSecondary}; margin: 0 0 30px 0; letter-spacing: 2px;">${genderText}</p>
            
            <div style="width: 120px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark}, transparent); margin: 0 auto 25px;"></div>
            
            <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 0 0 8px 0; letter-spacing: 3px;">出生時間</p>
            <p style="font-size: 18px; color: ${COLORS.textSecondary}; margin: 0; letter-spacing: 2px;">${reportData.birthDate}</p>
          </div>
          
          <!-- 四柱展示 -->
          <div style="margin-top: 50px;">
            <div style="display: flex; justify-content: center; gap: 20px;">
              ${['year', 'month', 'day', 'hour'].map((key, idx) => {
                const pillar = reportData.pillars[key as keyof typeof reportData.pillars];
                const labels = ['年柱', '月柱', '日柱', '時柱'];
                const pillarColors = [COLORS.gold, COLORS.green, COLORS.purple, COLORS.orange];
                return `
                  <div style="text-align: center;">
                    <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0 0 8px 0; letter-spacing: 2px;">${labels[idx]}</p>
                    <div style="
                      background: ${COLORS.bgCard};
                      border: 1px solid ${pillarColors[idx]}40;
                      border-top: 3px solid ${pillarColors[idx]};
                      padding: 18px 22px;
                      min-width: 70px;
                    ">
                      <p style="font-size: 28px; color: ${COLORS.goldLight}; margin: 0; font-family: ${FONTS.heading};">${pillar.stem}</p>
                      <div style="width: 30px; height: 1px; background: ${pillarColors[idx]}40; margin: 8px auto;"></div>
                      <p style="font-size: 28px; color: ${COLORS.textSecondary}; margin: 0; font-family: ${FONTS.heading};">${pillar.branch}</p>
                    </div>
                    <p style="font-size: 9px; color: ${COLORS.textMuted}; margin: 8px 0 0 0;">${reportData.nayin[key as keyof typeof reportData.nayin]}</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        
        <!-- 底部資訊 -->
        <div style="text-align: center; margin-top: auto;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
            <div style="width: 100px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.border});"></div>
            <div style="width: 6px; height: 6px; border: 1px solid ${COLORS.goldDark}; transform: rotate(45deg);"></div>
            <div style="width: 100px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.border});"></div>
          </div>
          <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 0 0 8px 0; font-style: italic; letter-spacing: 1px;">「命理展示的是一條相對好走但不一定是你要走的路，選擇權在於你」</p>
          <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0; letter-spacing: 2px;">${dateStr} 製表</p>
        </div>
      </div>
      
      <!-- 印章 -->
      <div style="
        position: absolute;
        right: 60px;
        bottom: 100px;
        width: 70px;
        height: 70px;
        border: 2px solid #c84040;
        transform: rotate(-8deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="font-size: 22px; color: #c84040; font-weight: bold; letter-spacing: 2px;">御所</span>
      </div>
    </div>
  `;

  // 四柱詳解頁 - 優化版
  const pillarLabels = {
    year: { name: '年柱', legion: '祖源軍團', icon: '👑', color: COLORS.gold },
    month: { name: '月柱', legion: '關係軍團', icon: '🤝', color: COLORS.green },
    day: { name: '日柱', legion: '核心軍團', icon: '⭐', color: COLORS.purple },
    hour: { name: '時柱', legion: '未來軍團', icon: '🚀', color: COLORS.orange }
  };

  const pillarsPage = `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
      position: relative;
      padding: 40px 50px;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
    ">
      <!-- 邊框 -->
      <div style="position: absolute; inset: 15px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      
      ${createHeader('四時軍團戰略命理系統')}
      
      <!-- 標題 -->
      <div style="text-align: center; margin: 15px 0 30px 0;">
        <h3 style="font-size: 22px; color: ${COLORS.goldLight}; margin: 0; letter-spacing: 5px; font-weight: 500;">四柱命盤詳解</h3>
      </div>
      
      <!-- 四柱卡片網格 -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin-bottom: 25px;">
        ${(['year', 'month', 'day', 'hour'] as const).map(key => {
          const pillar = reportData.pillars[key];
          const nayin = reportData.nayin[key];
          const tenGod = reportData.tenGods?.[key];
          const hidden = reportData.hiddenStems?.[key] || [];
          const label = pillarLabels[key];
          return `
            <div style="
              background: ${COLORS.bgCard};
              border: 1px solid ${label.color}30;
              border-left: 4px solid ${label.color};
              padding: 20px;
            ">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 22px;">${label.icon}</span>
                <div>
                  <span style="font-size: 15px; color: ${label.color}; font-weight: 600;">${label.name}</span>
                  <span style="font-size: 10px; color: ${COLORS.textMuted}; margin-left: 8px;">${label.legion}</span>
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: rgba(10, 10, 15, 0.5); margin-bottom: 15px;">
                <span style="font-size: 32px; color: ${COLORS.goldLight}; letter-spacing: 6px; font-family: ${FONTS.heading};">${pillar.stem}${pillar.branch}</span>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="color: ${COLORS.textMuted}; min-width: 32px;">納音</span>
                  <span style="color: ${COLORS.textSecondary};">${nayin}</span>
                </div>
                ${tenGod ? `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${COLORS.textMuted}; min-width: 32px;">十神</span>
                    <span style="color: ${COLORS.textSecondary};">${tenGod.stem} / ${tenGod.branch}</span>
                  </div>
                ` : ''}
                ${hidden.length > 0 ? `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${COLORS.textMuted}; min-width: 32px;">藏干</span>
                    <span style="color: ${COLORS.textSecondary};">${hidden.join('、')}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- 五行與陰陽並排 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px;">
        ${reportData.wuxing ? `
          <div style="background: ${COLORS.bgCard}; border: 1px solid ${COLORS.border}; padding: 22px;">
            <h4 style="font-size: 13px; color: ${COLORS.gold}; margin: 0 0 18px 0; letter-spacing: 2px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 3px; height: 14px; background: ${COLORS.gold};"></span>
              五行分布
            </h4>
            <div style="display: flex; gap: 8px;">
              ${[
                { key: 'wood', name: '木', color: '#4ade80' },
                { key: 'fire', name: '火', color: '#f87171' },
                { key: 'earth', name: '土', color: '#fbbf24' },
                { key: 'metal', name: '金', color: '#e5e5e5' },
                { key: 'water', name: '水', color: '#60a5fa' }
              ].map(el => {
                const total = Object.values(reportData.wuxing!).reduce((a, b) => a + b, 0);
                const value = reportData.wuxing![el.key as keyof typeof reportData.wuxing];
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return `
                  <div style="flex: 1; text-align: center;">
                    <div style="
                      width: 38px;
                      height: 38px;
                      border-radius: 50%;
                      background: ${el.color}15;
                      border: 2px solid ${el.color}50;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      margin: 0 auto 6px;
                    ">
                      <span style="font-size: 15px; color: ${el.color}; font-weight: 600;">${el.name}</span>
                    </div>
                    <p style="font-size: 13px; color: ${el.color}; margin: 0; font-weight: 600;">${value}</p>
                    <p style="font-size: 9px; color: ${COLORS.textMuted}; margin: 2px 0 0 0;">${pct}%</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        
        ${reportData.yinyang ? `
          <div style="background: ${COLORS.bgCard}; border: 1px solid ${COLORS.border}; padding: 22px;">
            <h4 style="font-size: 13px; color: ${COLORS.gold}; margin: 0 0 18px 0; letter-spacing: 2px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 3px; height: 14px; background: ${COLORS.gold};"></span>
              陰陽比例
            </h4>
            <div style="height: 32px; border-radius: 4px; overflow: hidden; display: flex; background: #1a1a24;">
              <div style="
                width: ${(reportData.yinyang.yang / (reportData.yinyang.yang + reportData.yinyang.yin)) * 100}%;
                background: linear-gradient(90deg, #c8b464, #dcc88c);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <span style="font-size: 11px; color: #1a1a1a; font-weight: 600;">☀ 陽 ${reportData.yinyang.yang}</span>
              </div>
              <div style="flex: 1; background: linear-gradient(90deg, #4a4a8a, #6464c8); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 11px; color: #e0e0e0; font-weight: 600;">☽ 陰 ${reportData.yinyang.yin}</span>
              </div>
            </div>
            <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 10px 0 0 0; text-align: center;">
              ${reportData.yinyang.yang > reportData.yinyang.yin ? '陽氣較旺，性格偏外向積極' : 
                reportData.yinyang.yang < reportData.yinyang.yin ? '陰氣較重，性格偏內斂沉穩' : '陰陽平衡，性格較為中和'}
            </p>
          </div>
        ` : ''}
      </div>
      
      ${createFooter(dateStr, '第 2 頁')}
    </div>
  `;

  // 神煞分析頁 - 根據選項決定是否包含
  const shenshaPages = (options.includeShensha && reportData.shensha && reportData.shensha.length > 0) ? 
    createShenshaPages(reportData.shensha, dateStr) : '';

  // 軍團詳解頁 - 根據選項決定是否包含
  const legionDetailsPages = options.includeLegionDetails ? 
    createLegionDetailsPages(reportData.pillars, reportData.tenGods, dateStr) : '';

  // 計算頁數
  let pageNum = 2; // 封面是第1頁，四柱是第2頁
  if (options.includePillars) {
    pageNum = 2;
  }
  const shenshaPageCount = options.includeShensha && reportData.shensha ? Math.ceil(reportData.shensha.length / 6) : 0;
  const legionDetailsPageCount = options.includeLegionDetails ? 2 : 0; // 軍團詳解固定2頁（每頁2個軍團）

  // 軍團故事頁 - 根據選項決定是否包含每個故事
  const storyTypeOptions: Record<'year' | 'month' | 'day' | 'hour', boolean> = {
    year: options.includeYearStory,
    month: options.includeMonthStory,
    day: options.includeDayStory,
    hour: options.includeHourStory,
  };
  
  const storyPages = (['year', 'month', 'day', 'hour'] as const)
    .filter(type => storyTypeOptions[type] && reportData.legionStories?.[type])
    .map((type, idx) => createStoryPage(
      type,
      reportData.legionStories![type]!,
      reportData.pillars[type],
      reportData.nayin[type],
      dateStr,
      (options.includePillars ? 2 : 1) + shenshaPageCount + legionDetailsPageCount + idx + 1
    ))
    .join('');

  // 組合頁面 - 根據選項決定包含哪些
  let content = coverPage;
  if (options.includePillars) {
    content += pillarsPage;
  }
  content += shenshaPages + legionDetailsPages + storyPages;

  container.innerHTML = content;
  return container;
};

// 創建軍團詳解頁面 - 優化專業設計
const createLegionDetailsPages = (
  pillars: ReportData['pillars'],
  tenGods: ReportData['tenGods'],
  dateStr: string
): string => {
  const legionConfig = {
    year: { 
      name: '祖源軍團', 
      icon: '👑', 
      color: '#fbbf24', 
      description: '家族傳承 · 童年根基',
      gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #fbbf24, #f59e0b)'
    },
    month: { 
      name: '關係軍團', 
      icon: '🤝', 
      color: '#4ade80', 
      description: '社交人脈 · 事業發展',
      gradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #4ade80, #22c55e)'
    },
    day: { 
      name: '核心軍團', 
      icon: '⭐', 
      color: '#c084fc', 
      description: '核心自我 · 婚姻感情',
      gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.12) 0%, rgba(192, 132, 252, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #c084fc, #a855f7)'
    },
    hour: { 
      name: '未來軍團', 
      icon: '🚀', 
      color: '#f97316', 
      description: '未來規劃 · 子女傳承',
      gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #f97316, #ea580c)'
    },
  };

  // 將四柱分成兩頁，每頁兩個軍團
  const legionGroups: Array<Array<'year' | 'month' | 'day' | 'hour'>> = [
    ['year', 'month'],
    ['day', 'hour']
  ];

  return legionGroups.map((group, pageIdx) => `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
      position: relative;
      padding: 40px 50px;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
    ">
      <!-- 背景裝飾光暈 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(ellipse 50% 35% at 25% 15%, ${group[0] ? legionConfig[group[0]].color : COLORS.gold}08 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 75% 85%, ${group[1] ? legionConfig[group[1]].color : COLORS.gold}08 0%, transparent 60%);
        pointer-events: none;
      "></div>
      
      <!-- 精緻邊框 -->
      <div style="position: absolute; inset: 15px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      <div style="position: absolute; inset: 20px; border: 1px solid ${COLORS.gold}10; pointer-events: none;"></div>
      
      ${createHeader('四時軍團戰略命理系統')}
      
      <!-- 頁面標題 -->
      <div style="text-align: center; margin: 10px 0 25px 0; position: relative;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 220px;
          height: 50px;
          background: radial-gradient(ellipse, ${COLORS.gold}08 0%, transparent 70%);
        "></div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
          <div style="width: 40px; height: 2px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark});"></div>
          <h3 style="font-size: 24px; color: ${COLORS.goldLight}; margin: 0; letter-spacing: 6px; font-weight: 500;">
            軍團角色詳解
          </h3>
          <div style="width: 40px; height: 2px; background: linear-gradient(270deg, transparent, ${COLORS.goldDark});"></div>
        </div>
        <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 8px 0 0 0; letter-spacing: 2px;">
          ${pageIdx === 0 ? '祖源軍團 · 關係軍團' : '核心軍團 · 未來軍團'}
        </p>
      </div>
      
      <!-- 兩個軍團卡片 -->
      ${group.map(pillarKey => {
        const config = legionConfig[pillarKey];
        const pillar = pillars[pillarKey];
        const tenGod = tenGods?.[pillarKey];
        const ganChar = GAN_CHARACTERS[pillar.stem];
        const zhiChar = ZHI_CHARACTERS[pillar.branch];
        const commanderAvatar = commanderAvatars[pillar.stem] || '';
        const advisorAvatar = advisorAvatars[pillar.branch] || '';
        
        return `
          <div style="
            background: ${config.gradient};
            border: 1px solid ${config.color}30;
            border-radius: 14px;
            padding: 22px 25px;
            margin-bottom: 18px;
            position: relative;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
            overflow: hidden;
          ">
            <!-- 頂部發光線 -->
            <div style="
              position: absolute; 
              top: 0; 
              left: 40px; 
              right: 40px; 
              height: 2px; 
              background: linear-gradient(90deg, transparent, ${config.color}80, transparent);
            "></div>
            
            <!-- 左側色條 -->
            <div style="
              position: absolute;
              left: 0;
              top: 20px;
              bottom: 20px;
              width: 4px;
              background: ${config.borderGradient};
              border-radius: 0 2px 2px 0;
            "></div>
            
            <!-- 軍團標題區 -->
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-left: 8px;">
              <span style="
                font-size: 38px; 
                filter: drop-shadow(0 0 10px ${config.color}50);
              ">${config.icon}</span>
              <div style="flex: 1;">
                <h4 style="
                  font-size: 20px; 
                  color: ${config.color}; 
                  margin: 0; 
                  font-weight: 600; 
                  letter-spacing: 4px;
                  text-shadow: 0 0 15px ${config.color}30;
                ">${config.name}</h4>
                <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 4px 0 0 0; letter-spacing: 2px;">${config.description}</p>
              </div>
              <div style="
                padding: 12px 22px; 
                background: rgba(10, 10, 15, 0.5); 
                border-radius: 10px; 
                border: 1px solid ${config.color}25;
              ">
                <span style="
                  font-size: 24px; 
                  color: ${COLORS.goldLight}; 
                  letter-spacing: 5px;
                  font-family: ${FONTS.heading};
                  text-shadow: 0 0 10px ${COLORS.gold}30;
                ">${pillar.stem}${pillar.branch}</span>
              </div>
            </div>
            
            <!-- 角色卡片區 -->
            <div style="display: flex; gap: 16px;">
              <!-- 主將卡 -->
              <div style="
                flex: 1; 
                background: linear-gradient(135deg, rgba(15, 15, 22, 0.8) 0%, rgba(12, 12, 18, 0.8) 100%); 
                border-radius: 10px; 
                padding: 16px 18px; 
                border: 1px solid ${COLORS.gold}15;
                position: relative;
              ">
                <!-- 卡片角落裝飾 -->
                <div style="position: absolute; top: 0; left: 0; width: 12px; height: 12px; border-left: 2px solid ${config.color}60; border-top: 2px solid ${config.color}60;"></div>
                
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
                  ${commanderAvatar ? `
                    <div style="position: relative;">
                      <img src="${commanderAvatar}" alt="${ganChar?.title || pillar.stem}" style="
                        width: 58px; 
                        height: 58px; 
                        border-radius: 50%; 
                        border: 2px solid ${config.color}50; 
                        object-fit: cover; 
                        background: #1a1a24;
                        box-shadow: 0 4px 15px ${config.color}30;
                      " crossorigin="anonymous" />
                      <div style="
                        position: absolute;
                        inset: -3px;
                        border-radius: 50%;
                        border: 1px solid ${config.color}30;
                      "></div>
                    </div>
                  ` : `
                    <div style="
                      width: 58px; 
                      height: 58px; 
                      border-radius: 50%; 
                      background: linear-gradient(135deg, ${config.color}25, ${config.color}08); 
                      border: 2px solid ${config.color}50; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      font-size: 22px; 
                      color: ${config.color};
                      box-shadow: 0 4px 15px ${config.color}20;
                    ">${pillar.stem}</div>
                  `}
                  <div>
                    <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0; letter-spacing: 1px;">🗡️ 主將 · 天干</p>
                    <p style="font-size: 17px; color: ${COLORS.goldLight}; margin: 5px 0 0 0; font-weight: 600; letter-spacing: 1px;">${ganChar?.title || pillar.stem}</p>
                    ${tenGod?.stem ? `<p style="font-size: 10px; color: ${COLORS.textSecondary}; margin: 4px 0 0 0;">十神：<span style="color: ${config.color};">${tenGod.stem}</span></p>` : ''}
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="
                    padding: 10px 12px; 
                    background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.03) 100%); 
                    border-radius: 8px; 
                    border-left: 3px solid ${COLORS.green};
                  ">
                    <p style="font-size: 9px; color: ${COLORS.green}; margin: 0 0 4px 0; letter-spacing: 1px;">✨ BUFF 增益</p>
                    <p style="font-size: 11px; color: #a8d8b8; margin: 0; line-height: 1.6;">${ganChar?.buff || '待查詢'}</p>
                  </div>
                  <div style="
                    padding: 10px 12px; 
                    background: linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.03) 100%); 
                    border-radius: 8px; 
                    border-left: 3px solid ${COLORS.red};
                  ">
                    <p style="font-size: 9px; color: ${COLORS.red}; margin: 0 0 4px 0; letter-spacing: 1px;">⚠️ DEBUFF 減益</p>
                    <p style="font-size: 11px; color: #dca8a8; margin: 0; line-height: 1.6;">${ganChar?.debuff || '待查詢'}</p>
                  </div>
                </div>
              </div>
              
              <!-- 軍師卡 -->
              <div style="
                flex: 1; 
                background: linear-gradient(135deg, rgba(15, 15, 22, 0.8) 0%, rgba(12, 12, 18, 0.8) 100%); 
                border-radius: 10px; 
                padding: 16px 18px; 
                border: 1px solid ${COLORS.gold}15;
                position: relative;
              ">
                <!-- 卡片角落裝飾 -->
                <div style="position: absolute; top: 0; right: 0; width: 12px; height: 12px; border-right: 2px solid ${config.color}60; border-top: 2px solid ${config.color}60;"></div>
                
                <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
                  ${advisorAvatar ? `
                    <div style="position: relative;">
                      <img src="${advisorAvatar}" alt="${zhiChar?.title || pillar.branch}" style="
                        width: 58px; 
                        height: 58px; 
                        border-radius: 50%; 
                        border: 2px solid ${config.color}50; 
                        object-fit: cover; 
                        background: #1a1a24;
                        box-shadow: 0 4px 15px ${config.color}30;
                      " crossorigin="anonymous" />
                      <div style="
                        position: absolute;
                        inset: -3px;
                        border-radius: 50%;
                        border: 1px solid ${config.color}30;
                      "></div>
                    </div>
                  ` : `
                    <div style="
                      width: 58px; 
                      height: 58px; 
                      border-radius: 50%; 
                      background: linear-gradient(135deg, ${config.color}25, ${config.color}08); 
                      border: 2px solid ${config.color}50; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      font-size: 22px; 
                      color: ${config.color};
                      box-shadow: 0 4px 15px ${config.color}20;
                    ">${pillar.branch}</div>
                  `}
                  <div>
                    <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0; letter-spacing: 1px;">🔮 軍師 · 地支</p>
                    <p style="font-size: 17px; color: ${COLORS.goldLight}; margin: 5px 0 0 0; font-weight: 600; letter-spacing: 1px;">${zhiChar?.title || pillar.branch}</p>
                    ${tenGod?.branch ? `<p style="font-size: 10px; color: ${COLORS.textSecondary}; margin: 4px 0 0 0;">十神：<span style="color: ${config.color};">${tenGod.branch}</span></p>` : ''}
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="
                    padding: 10px 12px; 
                    background: linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.03) 100%); 
                    border-radius: 8px; 
                    border-left: 3px solid ${COLORS.green};
                  ">
                    <p style="font-size: 9px; color: ${COLORS.green}; margin: 0 0 4px 0; letter-spacing: 1px;">✨ BUFF 增益</p>
                    <p style="font-size: 11px; color: #a8d8b8; margin: 0; line-height: 1.6;">${zhiChar?.buff || '待查詢'}</p>
                  </div>
                  <div style="
                    padding: 10px 12px; 
                    background: linear-gradient(135deg, rgba(248, 113, 113, 0.1) 0%, rgba(248, 113, 113, 0.03) 100%); 
                    border-radius: 8px; 
                    border-left: 3px solid ${COLORS.red};
                  ">
                    <p style="font-size: 9px; color: ${COLORS.red}; margin: 0 0 4px 0; letter-spacing: 1px;">⚠️ DEBUFF 減益</p>
                    <p style="font-size: 11px; color: #dca8a8; margin: 0; line-height: 1.6;">${zhiChar?.debuff || '待查詢'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
      
      ${createFooter(dateStr, `軍團詳解 ${pageIdx + 1}/2`)}
    </div>
  `).join('');
};

// 創建神煞分析頁 - 優化專業設計
const createShenshaPages = (shensha: ShenshaItem[], dateStr: string): string => {
  const itemsPerPage = 5; // 減少每頁數量以留出更多空間
  const pages: string[] = [];
  
  const categoryConfig: Record<string, { color: string; icon: string; gradient: string }> = {
    '吉神': { color: '#4ade80', icon: '🌟', gradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.03) 100%)' },
    '凶神': { color: '#f87171', icon: '⚡', gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.12) 0%, rgba(248, 113, 113, 0.03) 100%)' },
    '貴人': { color: '#c084fc', icon: '👑', gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.12) 0%, rgba(192, 132, 252, 0.03) 100%)' },
    '桃花': { color: '#f472b6', icon: '🌸', gradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.12) 0%, rgba(244, 114, 182, 0.03) 100%)' },
    '學堂': { color: '#60a5fa', icon: '📚', gradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(96, 165, 250, 0.03) 100%)' },
    '特殊': { color: '#fbbf24', icon: '✨', gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.03) 100%)' }
  };

  const rarityConfig: Record<string, { text: string; color: string; bgGradient: string }> = {
    'SSR': { text: '傳說', color: '#fbbf24', bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' },
    'SR': { text: '稀有', color: '#c084fc', bgGradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)' },
    'R': { text: '精良', color: '#60a5fa', bgGradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' },
    'N': { text: '普通', color: '#9ca3af', bgGradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' }
  };
  
  for (let i = 0; i < shensha.length; i += itemsPerPage) {
    const pageItems = shensha.slice(i, i + itemsPerPage);
    const pageNum = Math.floor(i / itemsPerPage) + 1;
    const totalPages = Math.ceil(shensha.length / itemsPerPage);
    
    pages.push(`
      <div style="
        width: 794px;
        min-height: 1123px;
        background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
        position: relative;
        padding: 40px 50px;
        box-sizing: border-box;
        page-break-after: always;
        overflow: hidden;
      ">
        <!-- 背景裝飾光暈 -->
        <div style="
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 50% 30% at 80% 10%, ${COLORS.gold}08 0%, transparent 60%),
            radial-gradient(ellipse 40% 25% at 20% 90%, ${COLORS.gold}05 0%, transparent 60%);
          pointer-events: none;
        "></div>
        
        <!-- 精緻邊框 -->
        <div style="position: absolute; inset: 15px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
        <div style="position: absolute; inset: 20px; border: 1px solid ${COLORS.gold}15; pointer-events: none;"></div>
        
        ${createHeader('四時軍團戰略命理系統')}
        
        <!-- 頁面標題 -->
        <div style="text-align: center; margin: 10px 0 28px 0; position: relative;">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 50px;
            background: radial-gradient(ellipse, ${COLORS.gold}08 0%, transparent 70%);
          "></div>
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <div style="width: 40px; height: 2px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark});"></div>
            <h3 style="font-size: 24px; color: ${COLORS.goldLight}; margin: 0; letter-spacing: 6px; font-weight: 500;">
              神煞分析
            </h3>
            <div style="width: 40px; height: 2px; background: linear-gradient(270deg, transparent, ${COLORS.goldDark});"></div>
          </div>
          <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 8px 0 0 0; letter-spacing: 2px;">
            命盤神煞星曜解析 · 共 ${shensha.length} 顆星
          </p>
        </div>
        
        <!-- 神煞卡片列表 -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${pageItems.map(item => {
            const category = item.category || '特殊';
            const catConfig = categoryConfig[category] || categoryConfig['特殊'];
            const rarity = item.rarity && rarityConfig[item.rarity] ? rarityConfig[item.rarity] : null;
            return `
              <div style="
                background: ${catConfig.gradient};
                border: 1px solid ${catConfig.color}25;
                border-radius: 12px;
                padding: 20px 24px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              ">
                <!-- 左側色條 -->
                <div style="
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 4px;
                  background: linear-gradient(180deg, ${catConfig.color}, ${catConfig.color}60);
                "></div>
                
                <!-- 右上角裝飾光暈 -->
                <div style="
                  position: absolute;
                  top: -20px;
                  right: -20px;
                  width: 100px;
                  height: 100px;
                  background: radial-gradient(circle, ${catConfig.color}10 0%, transparent 70%);
                  pointer-events: none;
                "></div>
                
                <!-- 標題行 -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                  <span style="font-size: 20px; filter: drop-shadow(0 0 6px ${catConfig.color}40);">${catConfig.icon}</span>
                  <span style="font-size: 18px; color: ${COLORS.goldLight}; font-weight: 600; letter-spacing: 2px;">${item.name}</span>
                  ${rarity ? `
                    <span style="
                      font-size: 10px;
                      color: #0a0a0f;
                      background: ${rarity.bgGradient};
                      padding: 3px 12px;
                      border-radius: 20px;
                      font-weight: 600;
                      letter-spacing: 1px;
                      box-shadow: 0 2px 8px ${rarity.color}40;
                    ">${rarity.text}</span>
                  ` : ''}
                  <span style="
                    font-size: 11px;
                    color: ${catConfig.color};
                    margin-left: auto;
                    padding: 4px 14px;
                    background: ${catConfig.color}15;
                    border-radius: 20px;
                    border: 1px solid ${catConfig.color}30;
                  ">${category}</span>
                </div>
                
                ${item.position ? `
                  <p style="font-size: 12px; color: ${COLORS.gold}; margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;">
                    <span style="opacity: 0.7;">📍</span>
                    <span>落於：${item.position}</span>
                  </p>
                ` : ''}
                
                ${item.effect ? `
                  <p style="font-size: 13px; color: ${COLORS.textSecondary}; margin: 0 0 10px 0; line-height: 1.7;">${item.effect}</p>
                ` : ''}
                
                ${item.modernMeaning ? `
                  <div style="
                    margin-top: 12px;
                    padding: 12px 16px;
                    background: rgba(10, 10, 15, 0.4);
                    border-radius: 8px;
                    border-left: 3px solid ${catConfig.color}60;
                  ">
                    <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 0 0 6px 0; display: flex; align-items: center; gap: 6px;">
                      <span>💡</span>
                      <span style="letter-spacing: 2px;">現代解讀</span>
                    </p>
                    <p style="font-size: 12px; color: ${COLORS.textSecondary}; margin: 0; line-height: 1.6;">${item.modernMeaning}</p>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        ${createFooter(dateStr, `神煞分析 ${pageNum}/${totalPages}`)}
      </div>
    `);
  }
  
  return pages.join('');
};

// 創建軍團故事頁 - 優化專業設計
const createStoryPage = (
  type: 'year' | 'month' | 'day' | 'hour',
  story: string,
  pillar: { stem: string; branch: string },
  nayin: string,
  dateStr: string,
  pageNum: number
): string => {
  const legionConfig = {
    year: { 
      name: '祖源軍團', 
      subtitle: '家族傳承 · 童年根基',
      icon: '👑', 
      color: '#fbbf24',
      gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #fbbf24, #f59e0b)'
    },
    month: { 
      name: '關係軍團', 
      subtitle: '社交人脈 · 事業發展',
      icon: '🤝', 
      color: '#4ade80',
      gradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #4ade80, #22c55e)'
    },
    day: { 
      name: '核心軍團', 
      subtitle: '核心自我 · 婚姻感情',
      icon: '⭐', 
      color: '#c084fc',
      gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.15) 0%, rgba(192, 132, 252, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #c084fc, #a855f7)'
    },
    hour: { 
      name: '未來軍團', 
      subtitle: '未來規劃 · 子女傳承',
      icon: '🚀', 
      color: '#f97316',
      gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #f97316, #ea580c)'
    }
  };
  
  const config = legionConfig[type];
  const pillarLabels = { year: '年柱', month: '月柱', day: '日柱', hour: '時柱' };
  
  // 處理故事內容，分段顯示
  const storyParagraphs = story.split('\n').filter(p => p.trim());
  
  return `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%);
      position: relative;
      padding: 40px 50px;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
    ">
      <!-- 背景裝飾光暈 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(ellipse 60% 40% at 50% 20%, ${config.color}08 0%, transparent 50%),
          radial-gradient(ellipse 40% 30% at 20% 80%, ${COLORS.gold}05 0%, transparent 50%),
          radial-gradient(ellipse 40% 30% at 80% 80%, ${config.color}05 0%, transparent 50%);
        pointer-events: none;
      "></div>
      
      <!-- 精緻邊框 -->
      <div style="position: absolute; inset: 15px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      
      <!-- 角落彩色裝飾 -->
      <div style="position: absolute; top: 15px; left: 15px; width: 25px; height: 25px;">
        <div style="position: absolute; top: 0; left: 0; width: 20px; height: 3px; background: ${config.borderGradient};"></div>
        <div style="position: absolute; top: 0; left: 0; width: 3px; height: 20px; background: ${config.borderGradient};"></div>
      </div>
      <div style="position: absolute; top: 15px; right: 15px; width: 25px; height: 25px;">
        <div style="position: absolute; top: 0; right: 0; width: 20px; height: 3px; background: ${config.borderGradient};"></div>
        <div style="position: absolute; top: 0; right: 0; width: 3px; height: 20px; background: ${config.borderGradient};"></div>
      </div>
      <div style="position: absolute; bottom: 15px; left: 15px; width: 25px; height: 25px;">
        <div style="position: absolute; bottom: 0; left: 0; width: 20px; height: 3px; background: ${config.borderGradient};"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 3px; height: 20px; background: ${config.borderGradient};"></div>
      </div>
      <div style="position: absolute; bottom: 15px; right: 15px; width: 25px; height: 25px;">
        <div style="position: absolute; bottom: 0; right: 0; width: 20px; height: 3px; background: ${config.borderGradient};"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 3px; height: 20px; background: ${config.borderGradient};"></div>
      </div>
      
      ${createHeader('四時軍團戰略命理系統')}
      
      <!-- 軍團標題卡片 -->
      <div style="
        text-align: center;
        padding: 35px 40px;
        background: ${config.gradient};
        border: 1px solid ${config.color}30;
        border-radius: 16px;
        margin-bottom: 25px;
        position: relative;
        box-shadow: 
          0 10px 40px rgba(0, 0, 0, 0.25),
          inset 0 1px 0 ${config.color}20;
      ">
        <!-- 頂部發光線 -->
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 50%;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${config.color}, transparent);
        "></div>
        
        <!-- 圖標與標題 -->
        <span style="
          font-size: 52px; 
          display: block; 
          margin-bottom: 12px; 
          filter: drop-shadow(0 0 15px ${config.color}50);
        ">${config.icon}</span>
        
        <h3 style="
          font-size: 30px;
          color: ${config.color};
          margin: 0 0 8px 0;
          font-weight: 600;
          letter-spacing: 8px;
          text-shadow: 0 0 25px ${config.color}30;
        ">${config.name}</h3>
        
        <p style="font-size: 12px; color: ${COLORS.textMuted}; margin: 0 0 20px 0; letter-spacing: 3px;">${config.subtitle}</p>
        
        <!-- 柱位資訊 -->
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 20px;
          padding: 14px 35px;
          background: rgba(10, 10, 15, 0.5);
          border-radius: 30px;
          border: 1px solid ${config.color}25;
        ">
          <div style="text-align: center;">
            <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0 0 4px 0; letter-spacing: 2px;">${pillarLabels[type]}</p>
            <span style="
              font-size: 28px; 
              color: ${COLORS.goldLight}; 
              letter-spacing: 6px; 
              font-family: ${FONTS.heading};
              text-shadow: 0 0 10px ${COLORS.gold}30;
            ">${pillar.stem}${pillar.branch}</span>
          </div>
          <div style="width: 1px; height: 35px; background: linear-gradient(180deg, transparent, ${config.color}50, transparent);"></div>
          <div style="text-align: center;">
            <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0 0 4px 0; letter-spacing: 2px;">納音</p>
            <span style="font-size: 16px; color: ${COLORS.textSecondary};">${nayin}</span>
          </div>
        </div>
      </div>
      
      <!-- 故事內容區 -->
      <div style="
        background: linear-gradient(135deg, rgba(25, 25, 35, 0.8) 0%, rgba(20, 20, 28, 0.8) 100%);
        border: 1px solid ${config.color}20;
        border-radius: 12px;
        padding: 28px 32px;
        position: relative;
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
      ">
        <!-- 左上角裝飾線 -->
        <div style="
          position: absolute; 
          top: 0; 
          left: 25px; 
          width: 80px; 
          height: 3px; 
          background: linear-gradient(90deg, ${config.color}, transparent);
          border-radius: 0 0 2px 2px;
        "></div>
        
        <!-- 標題 -->
        <h4 style="
          font-size: 16px; 
          color: ${COLORS.gold}; 
          margin: 0 0 20px 0; 
          display: flex; 
          align-items: center; 
          gap: 12px;
          letter-spacing: 2px;
        ">
          <span style="
            width: 4px;
            height: 20px;
            background: ${config.borderGradient};
            border-radius: 2px;
            box-shadow: 0 0 8px ${config.color}50;
          "></span>
          <span>軍團故事</span>
          <span style="
            font-size: 11px;
            color: ${COLORS.textMuted};
            font-weight: normal;
            margin-left: auto;
          ">AI 命理敘事</span>
        </h4>
        
        <!-- 故事文字 -->
        <div style="
          font-size: 14px;
          color: ${COLORS.textSecondary};
          line-height: 2.1;
          white-space: pre-wrap;
          text-align: justify;
          letter-spacing: 0.5px;
        ">${story}</div>
        
        <!-- 底部裝飾 -->
        <div style="
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid ${COLORS.border};
          text-align: center;
        ">
          <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0; font-style: italic; letter-spacing: 1px;">
            「此故事根據命盤特徵生成，僅供參考與啟發」
          </p>
        </div>
      </div>
      
      ${createFooter(dateStr, `${config.name}敘事`)}
    </div>
  `;
};

// ========================
// 字體載入檢測 - 優化中文字體支援
// ========================
const waitForFonts = async (timeout = 5000): Promise<boolean> => {
  console.log('[PDF] Waiting for fonts to load...');
  
  try {
    // Step 1: 等待瀏覽器字體 API ready
    if (document.fonts && typeof document.fonts.ready !== 'undefined') {
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, timeout))
      ]);
      console.log('[PDF] Browser fonts API ready');
    }
    
    // Step 2: 預載入中文字體 - 創建測試元素強制載入
    const fontTestContainer = document.createElement('div');
    fontTestContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      visibility: hidden;
      font-size: 72px;
    `;
    
    // 測試所有使用的字體
    const fontTests = [
      { family: FONTS.heading, text: '虹靈御所八字命理' },
      { family: FONTS.base, text: '四時軍團戰略系統' },
    ];
    
    fontTests.forEach(({ family, text }) => {
      const span = document.createElement('span');
      span.style.fontFamily = family;
      span.textContent = text;
      fontTestContainer.appendChild(span);
    });
    
    document.body.appendChild(fontTestContainer);
    
    // Step 3: 等待字體渲染
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Step 4: 清理測試元素
    document.body.removeChild(fontTestContainer);
    
    console.log('[PDF] Chinese fonts preloaded successfully');
    return true;
    
  } catch (e) {
    console.warn('[PDF] Font loading check failed:', e);
    // Fallback: 等待固定時間
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  }
};

// ========================
// 圖片預載入
// ========================
const waitForImages = async (container: HTMLElement, timeout = 3000): Promise<void> => {
  console.log('[PDF] Waiting for images to load...');
  const images = container.querySelectorAll('img');
  if (images.length === 0) {
    console.log('[PDF] No images found');
    return;
  }

  const imagePromises = Array.from(images).map(img => {
    if (img.complete && img.naturalHeight > 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const handler = () => {
        img.removeEventListener('load', handler);
        img.removeEventListener('error', handler);
        resolve();
      };
      img.addEventListener('load', handler);
      img.addEventListener('error', handler);
    });
  });

  await Promise.race([
    Promise.all(imagePromises),
    new Promise(resolve => setTimeout(resolve, timeout))
  ]);
  console.log('[PDF] Images loaded or timeout reached');
};

// ========================
// 安全的 html2canvas 封裝
// ========================
const safeHtml2Canvas = async (element: HTMLElement, pageIndex: number): Promise<HTMLCanvasElement | null> => {
  // Monkey-patch createPattern 防止 0x0 canvas 錯誤
  const originalCreatePattern = CanvasRenderingContext2D.prototype.createPattern;
  
  CanvasRenderingContext2D.prototype.createPattern = function(
    image: CanvasImageSource,
    repetition: string | null
  ): CanvasPattern | null {
    try {
      // 檢查 canvas 或 image 尺寸
      if (image instanceof HTMLCanvasElement || image instanceof OffscreenCanvas) {
        if (image.width === 0 || image.height === 0) {
          console.warn('[PDF] Detected 0x0 canvas in createPattern, using fallback');
          const dummy = document.createElement('canvas');
          dummy.width = 1;
          dummy.height = 1;
          return originalCreatePattern.call(this, dummy, repetition);
        }
      }
      if (image instanceof HTMLImageElement) {
        if (image.width === 0 || image.height === 0 || !image.complete) {
          console.warn('[PDF] Detected invalid image in createPattern');
          return null;
        }
      }
    } catch (e) {
      console.warn('[PDF] createPattern check error:', e);
    }
    return originalCreatePattern.call(this, image, repetition);
  };

  try {
    console.log(`[PDF] html2canvas starting for page ${pageIndex + 1}...`);
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a0a0f',
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
      removeContainer: false,
      
      // 忽略問題元素
      ignoreElements: (el) => {
        // 忽略 0x0 canvas
        if (el instanceof HTMLCanvasElement) {
          if (el.width === 0 || el.height === 0) {
            console.log('[PDF] Ignoring 0x0 canvas element');
            return true;
          }
        }
        
        // 忽略 0x0 元素
        if (el instanceof HTMLElement) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return true;
          }
          // 檢查 rect
          try {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
              // 只忽略非佈局元素
              if (!['DIV', 'SPAN', 'P'].includes(el.tagName)) {
                return true;
              }
            }
          } catch {
            // ignore
          }
        }
        
        return false;
      },
      
      // 克隆後處理
      onclone: (clonedDoc, clonedElement) => {
        console.log(`[PDF] onclone for page ${pageIndex + 1}`);
        
        // 確保可見性
        if (clonedElement instanceof HTMLElement) {
          clonedElement.style.visibility = 'visible';
          clonedElement.style.position = 'relative';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
        }
        
        // 修復所有 0x0 canvas
        clonedDoc.querySelectorAll('canvas').forEach((canvas) => {
          const c = canvas as HTMLCanvasElement;
          if (c.width === 0 || c.height === 0) {
            console.log('[PDF] Fixing 0x0 canvas in cloned doc');
            c.width = 1;
            c.height = 1;
            c.style.width = '1px';
            c.style.height = '1px';
          }
        });
        
        // 修復 SVG 問題
        clonedDoc.querySelectorAll('svg').forEach((svg) => {
          const s = svg as SVGElement;
          if (!s.getAttribute('width') || !s.getAttribute('height')) {
            const rect = s.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              s.setAttribute('width', String(rect.width));
              s.setAttribute('height', String(rect.height));
            }
          }
        });
        
        // 確保所有圖片有 crossorigin
        clonedDoc.querySelectorAll('img').forEach((img) => {
          img.crossOrigin = 'anonymous';
        });
      }
    });
    
    console.log(`[PDF] html2canvas completed for page ${pageIndex + 1}, canvas size: ${canvas.width}x${canvas.height}`);
    
    // 驗證 canvas
    if (canvas.width === 0 || canvas.height === 0) {
      console.error(`[PDF] Canvas for page ${pageIndex + 1} has 0 dimensions`);
      return null;
    }
    
    return canvas;
    
  } catch (error) {
    console.error(`[PDF] html2canvas failed for page ${pageIndex + 1}:`, error);
    return null;
  } finally {
    // 恢復原始 createPattern
    CanvasRenderingContext2D.prototype.createPattern = originalCreatePattern;
  }
};

// ========================
// 主要導出函數
// ========================
export const generatePDF = async (
  _elementId: string, 
  fileName: string, 
  coverData?: CoverPageData, 
  reportData?: ReportData,
  options: PdfOptions = defaultPdfOptions
) => {
  console.log('[PDF] ========================================');
  console.log('[PDF] Starting PDF generation...', { fileName, options });
  console.log('[PDF] ========================================');
  
  if (!reportData) {
    console.error('[PDF] No report data provided');
    throw new Error('No report data provided');
  }

  console.log('[PDF] Report data received:', { 
    name: reportData.name, 
    gender: reportData.gender,
    hasLegionStories: !!reportData.legionStories,
    legionStoriesKeys: reportData.legionStories ? Object.keys(reportData.legionStories) : [],
    hasShensha: !!reportData.shensha?.length,
    shenshaCount: reportData.shensha?.length || 0
  });

  let container: HTMLDivElement | null = null;
  
  try {
    // Step 1: 等待字體載入
    await waitForFonts();
    
    // Step 2: 創建報告 HTML
    console.log('[PDF] Creating report container...');
    container = createReportContainer(reportData, coverData, options);
    container.setAttribute('data-pdf-container', 'true');
    console.log('[PDF] Container created, children count:', container.children.length);
    
    // Step 3: 等待圖片載入
    await waitForImages(container);
    
    // Step 4: 額外等待確保 DOM 穩定
    console.log('[PDF] Waiting for DOM to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 5: 獲取所有頁面
    const pages: HTMLElement[] = [];
    for (let i = 0; i < container.children.length; i++) {
      const child = container.children[i];
      if (child instanceof HTMLElement) {
        // 強制觸發 layout
        void child.offsetWidth;
        void child.offsetHeight;
        
        if (child.offsetWidth > 0 && child.offsetHeight > 0) {
          pages.push(child);
          console.log(`[PDF] Page ${pages.length} found, size: ${child.offsetWidth}x${child.offsetHeight}`);
        } else {
          console.warn(`[PDF] Skipping child ${i} with 0 dimensions`);
        }
      }
    }
    
    console.log(`[PDF] Total pages found: ${pages.length}`);
    
    if (pages.length === 0) {
      console.error('[PDF] No valid pages found!');
      console.error('[PDF] Container innerHTML preview:', container.innerHTML.substring(0, 500));
      throw new Error('No valid pages found in container');
    }
    
    // Step 6: 創建 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    let renderedPages = 0;
    
    // Step 7: 逐頁渲染
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      console.log(`[PDF] Processing page ${i + 1}/${pages.length}...`);
      
      try {
        const canvas = await safeHtml2Canvas(page, i);
        
        if (!canvas) {
          console.warn(`[PDF] Page ${i + 1} rendering returned null, skipping`);
          continue;
        }
        
        // 轉換為圖片
        let imgData: string;
        try {
          imgData = canvas.toDataURL('image/jpeg', 0.92);
          if (!imgData || imgData === 'data:,') {
            console.error(`[PDF] Page ${i + 1} canvas.toDataURL failed`);
            continue;
          }
        } catch (e) {
          console.error(`[PDF] Page ${i + 1} toDataURL error:`, e);
          continue;
        }
        
        // 添加到 PDF
        if (renderedPages > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        renderedPages++;
        console.log(`[PDF] Page ${i + 1} added to PDF successfully`);
        
      } catch (pageError) {
        console.error(`[PDF] Error processing page ${i + 1}:`, pageError);
        // 繼續處理其他頁面
      }
    }
    
    // Step 8: 檢查結果
    if (renderedPages === 0) {
      throw new Error('No pages were successfully rendered to PDF');
    }
    
    // Step 9: 下載 PDF
    console.log(`[PDF] Saving PDF with ${renderedPages} pages...`);
    pdf.save(fileName);
    console.log('[PDF] ========================================');
    console.log('[PDF] PDF saved successfully!');
    console.log('[PDF] ========================================');
    
  } catch (error) {
    console.error('[PDF] ========================================');
    console.error('[PDF] PDF generation failed:', error);
    console.error('[PDF] ========================================');
    throw error;
  } finally {
    // 清理臨時容器
    if (container && container.parentNode) {
      document.body.removeChild(container);
      console.log('[PDF] Cleanup completed');
    }
  }
};

// 保持向後兼容的簡化版本
export const generateSimplePDF = async (elementId: string, fileName: string, coverData?: CoverPageData) => {
  await generatePDF(elementId, fileName, coverData);
};
