import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { commanderAvatars } from "@/assets/commanders";
import { advisorAvatars } from "@/assets/advisors";
import { GAN_CHARACTERS, ZHI_CHARACTERS } from "@/lib/legionTranslator/characterData";
import { getShenshaIcon } from "@/lib/shenshaIconMapping";

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
  includeTableOfContents: boolean; // 目錄頁
  includePillars: boolean;
  includeShensha: boolean;
  includeLegionDetails: boolean; // 軍團詳解頁
  includeYearStory: boolean;
  includeMonthStory: boolean;
  includeDayStory: boolean;
  includeHourStory: boolean;
}

// PDF 生成進度回調類型
export type PdfProgressCallback = (progress: number, stage: string) => void;

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
  includeTableOfContents: true,
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

// 預載入圖片函數 - 確保頭像正確嵌入 PDF
const preloadImages = async (imageSrcs: string[]): Promise<Map<string, boolean>> => {
  const results = new Map<string, boolean>();
  
  const loadPromises = imageSrcs.map(src => {
    return new Promise<void>((resolve) => {
      if (!src) {
        resolve();
        return;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        results.set(src, true);
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`[PDF] Failed to preload image: ${src}`);
        results.set(src, false);
        resolve();
      };
      
      img.src = src;
    });
  });
  
  await Promise.all(loadPromises);
  return results;
};

// 獲取所有需要的頭像 URL
const collectAvatarUrls = (pillars: ReportData['pillars']): string[] => {
  const urls: string[] = [];
  
  Object.values(pillars).forEach(pillar => {
    const commanderAvatar = commanderAvatars[pillar.stem];
    const advisorAvatar = advisorAvatars[pillar.branch];
    
    if (commanderAvatar) urls.push(commanderAvatar);
    if (advisorAvatar) urls.push(advisorAvatar);
  });
  
  return urls;
};

// 生成頭像 HTML - 帶有 onerror fallback
const createAvatarHTML = (
  avatarSrc: string | undefined, 
  fallbackChar: string, 
  title: string, 
  color: string, 
  badge: string
): string => {
  if (!avatarSrc) {
    return `
      <div style="position: relative;">
        <div style="
          width: 64px; 
          height: 64px; 
          border-radius: 50%; 
          background: linear-gradient(135deg, ${color}30, ${color}10); 
          border: 3px solid ${color}60; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 26px; 
          color: ${color};
          font-family: ${FONTS.heading};
          box-shadow: 0 6px 20px ${color}25;
        ">${fallbackChar}</div>
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
          border-radius: 50%;
          border: 2px solid #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: ${badge === '干' ? '#0a0a0f' : '#fff'};
          font-weight: bold;
        ">${badge}</div>
      </div>
    `;
  }
  
  return `
    <div style="position: relative;">
      <img 
        src="${avatarSrc}" 
        alt="${title}" 
        style="
          width: 64px; 
          height: 64px; 
          border-radius: 50%; 
          border: 3px solid ${color}60; 
          object-fit: cover; 
          background: #1a1a24;
          box-shadow: 
            0 6px 20px ${color}35,
            inset 0 -2px 10px rgba(0, 0, 0, 0.3);
        " 
        crossorigin="anonymous"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div style="
        display: none;
        width: 64px; 
        height: 64px; 
        border-radius: 50%; 
        background: linear-gradient(135deg, ${color}30, ${color}10); 
        border: 3px solid ${color}60; 
        align-items: center; 
        justify-content: center; 
        font-size: 26px; 
        color: ${color};
        font-family: ${FONTS.heading};
        box-shadow: 0 6px 20px ${color}25;
      ">${fallbackChar}</div>
      <div style="
        position: absolute;
        inset: -5px;
        border-radius: 50%;
        border: 1px solid ${color}25;
        background: radial-gradient(circle, transparent 60%, ${color}10 100%);
        pointer-events: none;
      "></div>
      <div style="
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 22px;
        height: 22px;
        background: linear-gradient(135deg, ${badge === '干' ? COLORS.gold : color} 0%, ${badge === '干' ? '#f59e0b' : color}cc 100%);
        border-radius: 50%;
        border: 2px solid #0a0a0f;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: ${badge === '干' ? '#0a0a0f' : '#fff'};
        font-weight: bold;
      ">${badge}</div>
    </div>
  `;
};

// 章節配置 - 用於頁眉頁腳動態顯示
interface ChapterConfig {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
}

const CHAPTERS: Record<string, ChapterConfig> = {
  cover: { id: 'cover', name: '封面', subtitle: 'COVER', icon: '📕', color: COLORS.gold },
  toc: { id: 'toc', name: '目錄', subtitle: 'CONTENTS', icon: '📑', color: COLORS.gold },
  pillars: { id: 'pillars', name: '四柱命盤', subtitle: 'FOUR PILLARS', icon: '📜', color: COLORS.gold },
  shensha: { id: 'shensha', name: '神煞分析', subtitle: 'DIVINE STARS', icon: '✨', color: COLORS.purple },
  legion: { id: 'legion', name: '軍團詳解', subtitle: 'LEGION ANALYSIS', icon: '⚔️', color: COLORS.blue },
  storyYear: { id: 'storyYear', name: '祖源軍團', subtitle: 'ANCESTRAL LEGION', icon: '👑', color: COLORS.gold },
  storyMonth: { id: 'storyMonth', name: '關係軍團', subtitle: 'SOCIAL LEGION', icon: '🤝', color: COLORS.green },
  storyDay: { id: 'storyDay', name: '核心軍團', subtitle: 'CORE LEGION', icon: '⭐', color: COLORS.purple },
  storyHour: { id: 'storyHour', name: '未來軍團', subtitle: 'FUTURE LEGION', icon: '🚀', color: COLORS.orange },
};

// 創建增強版頁眉組件 - 帶章節標示與動態樣式
const createHeader = (subtitle?: string, chapter?: ChapterConfig, pageNum?: number, totalPages?: number) => {
  const chapterIndicator = chapter ? `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      <div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, ${chapter.color}15 0%, ${chapter.color}05 100%);
        border: 1px solid ${chapter.color}30;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">${chapter.icon}</div>
      <div>
        <p style="
          font-size: 9px;
          color: ${chapter.color};
          margin: 0;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.8;
        ">${chapter.subtitle}</p>
        <p style="
          font-size: 11px;
          color: ${COLORS.textSecondary};
          margin: 2px 0 0 0;
          letter-spacing: 2px;
          font-family: ${FONTS.heading};
        ">${chapter.name}</p>
      </div>
    </div>
  ` : '';

  const pageIndicator = (pageNum && totalPages) ? `
    <div style="
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    ">
      <div style="
        display: flex;
        align-items: baseline;
        gap: 4px;
      ">
        <span style="
          font-size: 18px;
          font-family: ${FONTS.mono};
          color: ${COLORS.gold};
          font-weight: 600;
        ">${String(pageNum).padStart(2, '0')}</span>
        <span style="
          font-size: 10px;
          color: ${COLORS.textMuted};
        ">/</span>
        <span style="
          font-size: 11px;
          font-family: ${FONTS.mono};
          color: ${COLORS.textMuted};
        ">${String(totalPages).padStart(2, '0')}</span>
      </div>
    </div>
  ` : '';

  return `
    <div style="
      position: relative;
      margin-bottom: 22px;
      padding-bottom: 18px;
      border-bottom: 1px solid ${COLORS.border};
    ">
      ${chapterIndicator}
      ${pageIndicator}
      
      <!-- 中央品牌標誌 -->
      <div style="text-align: center; padding-top: ${chapter ? '8px' : '0'};">
        <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
          <div style="
            width: 50px;
            height: 1px;
            background: linear-gradient(90deg, transparent, ${COLORS.goldDark});
          "></div>
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
          ">
            <h2 style="
              font-size: 16px;
              font-family: ${FONTS.heading};
              color: ${COLORS.gold};
              margin: 0;
              letter-spacing: 5px;
              font-weight: 500;
            ">虹靈御所</h2>
            ${subtitle ? `
              <p style="
                font-size: 9px;
                color: ${COLORS.textMuted};
                margin: 5px 0 0 0;
                letter-spacing: 2px;
              ">${subtitle}</p>
            ` : ''}
          </div>
          <div style="
            width: 50px;
            height: 1px;
            background: linear-gradient(270deg, transparent, ${COLORS.goldDark});
          "></div>
        </div>
      </div>
    </div>
  `;
};

// 創建增強版頁腳組件 - 帶動態頁碼與章節進度
const createFooter = (dateStr: string, pageInfo: string, chapter?: ChapterConfig, pageNum?: number, totalPages?: number) => {
  const progressPercent = (pageNum && totalPages) ? Math.round((pageNum / totalPages) * 100) : 0;
  
  return `
    <div style="position: absolute; bottom: 25px; left: 45px; right: 45px;">
      <!-- 進度條 -->
      ${(pageNum && totalPages) ? `
        <div style="
          width: 100%;
          height: 2px;
          background: ${COLORS.bgSecondary};
          border-radius: 1px;
          margin-bottom: 12px;
          overflow: hidden;
        ">
          <div style="
            width: ${progressPercent}%;
            height: 100%;
            background: linear-gradient(90deg, ${chapter?.color || COLORS.gold}60, ${chapter?.color || COLORS.gold});
            border-radius: 1px;
            transition: width 0.3s ease;
          "></div>
        </div>
      ` : `
        <div style="
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${COLORS.border}, transparent);
          margin-bottom: 12px;
        "></div>
      `}
      
      <!-- 頁腳內容 -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9px;
        color: ${COLORS.textMuted};
        letter-spacing: 0.5px;
      ">
        <!-- 左側：日期 -->
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 140px;
        ">
          <span style="
            width: 4px;
            height: 4px;
            background: ${COLORS.gold}40;
            border-radius: 50%;
          "></span>
          <span>${dateStr}</span>
        </div>
        
        <!-- 中央：品牌與章節 -->
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        ">
          <span style="
            color: ${COLORS.goldDark};
            font-size: 10px;
            letter-spacing: 2px;
          ">虹靈御所 · 超烜創意</span>
          ${chapter ? `
            <span style="
              font-size: 8px;
              color: ${chapter.color}80;
              letter-spacing: 1px;
            ">${chapter.icon} ${chapter.name}</span>
          ` : ''}
        </div>
        
        <!-- 右側：頁碼 -->
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 140px;
          justify-content: flex-end;
        ">
          ${(pageNum && totalPages) ? `
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
            ">
              <span style="
                font-size: 8px;
                color: ${COLORS.textMuted};
                letter-spacing: 1px;
              ">PAGE</span>
              <div style="
                display: flex;
                align-items: center;
                background: ${chapter?.color || COLORS.gold}10;
                border: 1px solid ${chapter?.color || COLORS.gold}20;
                border-radius: 4px;
                padding: 2px 8px;
              ">
                <span style="
                  font-size: 11px;
                  font-family: ${FONTS.mono};
                  color: ${chapter?.color || COLORS.gold};
                  font-weight: 600;
                ">${String(pageNum).padStart(2, '0')}</span>
                <span style="
                  font-size: 9px;
                  color: ${COLORS.textMuted};
                  margin: 0 3px;
                ">/</span>
                <span style="
                  font-size: 10px;
                  font-family: ${FONTS.mono};
                  color: ${COLORS.textMuted};
                ">${String(totalPages).padStart(2, '0')}</span>
              </div>
            </div>
          ` : `
            <span>${pageInfo}</span>
          `}
          <span style="
            width: 4px;
            height: 4px;
            background: ${COLORS.gold}40;
            border-radius: 50%;
          "></span>
        </div>
      </div>
    </div>
  `;
};

// 創建目錄頁
interface TocEntry {
  title: string;
  subtitle: string;
  icon: string;
  page: number;
  color: string;
  summary: string; // 新增：章節摘要
}

const createTableOfContentsPage = (entries: TocEntry[], dateStr: string, totalPages: number): string => {
  const tocRows = entries.map((entry, idx) => `
    <div style="
      display: flex;
      align-items: flex-start;
      padding: 18px 22px;
      background: ${idx % 2 === 0 ? 'rgba(30, 30, 45, 0.6)' : 'rgba(20, 20, 32, 0.4)'};
      border-left: 4px solid ${entry.color};
      margin-bottom: 3px;
      border-radius: 0 8px 8px 0;
      transition: all 0.3s ease;
    ">
      <!-- 圖標區域 -->
      <div style="
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, ${entry.color}20 0%, ${entry.color}08 100%);
        border: 1px solid ${entry.color}40;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 18px;
        flex-shrink: 0;
      ">
        <span style="
          font-size: 26px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">${entry.icon}</span>
      </div>
      
      <!-- 內容區域 -->
      <div style="flex: 1; min-width: 0;">
        <!-- 標題行 -->
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="
            font-size: 17px;
            font-family: ${FONTS.heading};
            color: ${COLORS.textPrimary};
            font-weight: 500;
            letter-spacing: 1.5px;
          ">${entry.title}</span>
          <span style="
            font-size: 10px;
            color: ${entry.color};
            margin-left: 10px;
            letter-spacing: 0.5px;
            opacity: 0.8;
          ">${entry.subtitle}</span>
          
          <!-- 點線連接 -->
          <div style="
            flex: 1;
            height: 1px;
            margin: 0 16px;
            background: repeating-linear-gradient(
              90deg,
              ${entry.color}30 0px,
              ${entry.color}30 4px,
              transparent 4px,
              transparent 8px
            );
          "></div>
          
          <!-- 頁碼 -->
          <span style="
            font-size: 20px;
            color: ${entry.color};
            font-weight: 700;
            font-family: ${FONTS.mono};
            min-width: 36px;
            text-align: right;
            letter-spacing: 1px;
            text-shadow: 0 0 10px ${entry.color}40;
          ">${String(entry.page).padStart(2, '0')}</span>
        </div>
        
        <!-- 摘要預覽 -->
        <p style="
          font-size: 11px;
          color: ${COLORS.textMuted};
          margin: 0;
          line-height: 1.7;
          letter-spacing: 0.3px;
          padding-right: 50px;
        ">${entry.summary}</p>
      </div>
    </div>
  `).join('');

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
      <!-- 背景裝飾 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(ellipse 60% 35% at 50% 5%, ${COLORS.gold}06 0%, transparent 60%),
          radial-gradient(ellipse 45% 45% at 5% 95%, ${COLORS.purple}04 0%, transparent 50%),
          radial-gradient(ellipse 45% 45% at 95% 95%, ${COLORS.gold}04 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${COLORS.bgSecondary}80 0%, transparent 70%);
        pointer-events: none;
      "></div>
      
      <!-- 精緻邊框 -->
      <div style="position: absolute; inset: 15px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      
      <!-- 角落裝飾 -->
      <div style="position: absolute; top: 15px; left: 15px; width: 30px; height: 30px;">
        <div style="position: absolute; top: 0; left: 0; width: 20px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; top: 0; left: 0; width: 2px; height: 20px; background: ${COLORS.gold};"></div>
      </div>
      <div style="position: absolute; top: 15px; right: 15px; width: 30px; height: 30px;">
        <div style="position: absolute; top: 0; right: 0; width: 20px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; top: 0; right: 0; width: 2px; height: 20px; background: ${COLORS.gold};"></div>
      </div>
      <div style="position: absolute; bottom: 15px; left: 15px; width: 30px; height: 30px;">
        <div style="position: absolute; bottom: 0; left: 0; width: 20px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 2px; height: 20px; background: ${COLORS.gold};"></div>
      </div>
      <div style="position: absolute; bottom: 15px; right: 15px; width: 30px; height: 30px;">
        <div style="position: absolute; bottom: 0; right: 0; width: 20px; height: 2px; background: ${COLORS.gold};"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 2px; height: 20px; background: ${COLORS.gold};"></div>
      </div>
      
      ${createHeader('四時軍團戰略命理系統')}
      
      <!-- 目錄標題區域 -->
      <div style="text-align: center; margin: 15px 0 35px 0;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 25px; margin-bottom: 18px;">
          <div style="width: 70px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark});"></div>
          <span style="font-size: 12px; color: ${COLORS.goldDark}; letter-spacing: 8px; text-transform: uppercase;">Contents</span>
          <div style="width: 70px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.goldDark});"></div>
        </div>
        <h3 style="
          font-size: 36px;
          font-family: ${FONTS.heading};
          color: ${COLORS.goldLight};
          margin: 0 0 12px 0;
          font-weight: 600;
          letter-spacing: 14px;
          text-shadow: 0 2px 15px rgba(200, 170, 100, 0.2);
        ">目 錄</h3>
        <p style="
          font-size: 11px;
          color: ${COLORS.textMuted};
          margin: 0;
          letter-spacing: 2px;
        ">點擊章節快速定位 · 探索您的命理全貌</p>
      </div>
      
      <!-- 目錄列表容器 -->
      <div style="
        background: linear-gradient(135deg, rgba(25, 25, 40, 0.95) 0%, rgba(20, 20, 35, 0.9) 100%);
        border: 1px solid ${COLORS.border};
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 
          0 15px 50px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.03);
      ">
        ${tocRows}
      </div>
      
      <!-- 底部裝飾 -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 35px;
        gap: 20px;
      ">
        <div style="width: 100px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.border});"></div>
        <div style="
          width: 8px; 
          height: 8px; 
          border: 1px solid ${COLORS.goldDark}; 
          transform: rotate(45deg);
          background: ${COLORS.gold}20;
        "></div>
        <div style="width: 100px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.border});"></div>
      </div>
      
      <!-- 提示文字 -->
      <p style="
        text-align: center;
        font-size: 10px;
        color: ${COLORS.textMuted};
        margin: 20px 0 0 0;
        letter-spacing: 1.5px;
        opacity: 0.7;
      ">本報告基於傳統八字命理學與現代心理學分析</p>
      
      ${createFooter(dateStr, '第 2 頁', CHAPTERS.toc, 2, totalPages)}
    </div>
  `;
}

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

  // ========================
  // 計算總頁數 - 必須在所有頁面生成之前計算
  // ========================
  const tocPageCount = options.includeTableOfContents ? 1 : 0;
  const pillarsPageCount = options.includePillars ? 1 : 0;
  const shenshaPageCount = options.includeShensha && reportData.shensha ? Math.ceil(reportData.shensha.length / 4) : 0;
  const legionDetailsPageCount = options.includeLegionDetails ? 2 : 0;
  
  const storyTypeOptions: Record<'year' | 'month' | 'day' | 'hour', boolean> = {
    year: options.includeYearStory,
    month: options.includeMonthStory,
    day: options.includeDayStory,
    hour: options.includeHourStory,
  };
  
  const storyPageCount = (['year', 'month', 'day', 'hour'] as const)
    .filter(type => storyTypeOptions[type] && reportData.legionStories?.[type]).length;
  
  // 總頁數 = 封面 + 目錄 + 四柱 + 神煞 + 軍團詳解 + 故事頁
  const totalPages = 1 + tocPageCount + pillarsPageCount + shenshaPageCount + legionDetailsPageCount + storyPageCount;
  
  // 各章節起始頁碼
  const pillarsStartPage = 1 + tocPageCount + 1;
  const shenshaStartPage = pillarsStartPage + pillarsPageCount;
  const legionStartPage = shenshaStartPage + shenshaPageCount;
  const storyStartPage = legionStartPage + legionDetailsPageCount;

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
          <!-- Logo -->
          <div style="display: flex; justify-content: center; margin-bottom: 30px;">
            <img src="/home/ubuntu/narrate-engine-hub/src/assets/logo.png" alt="虹靈御所" style="width: 120px; height: auto; filter: drop-shadow(0 4px 12px rgba(200, 170, 100, 0.3));" onerror="this.style.display='none'" />
          </div>
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
          <p style="font-size: 9px; color: #888; margin-top: 30px; letter-spacing: 1px; padding: 0 50px;">本報告為基於您個人資訊的命理分析，旨在提供自我探索的參考路徑，而非對未來的絕對定論。您的人生選擇，終將由您自己決定。</p>
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

  // 四柱詳解頁 - 專業增強版
  const pillarLabels = {
    year: { name: '年柱', legion: '祖源軍團', icon: '👑', color: COLORS.gold, element: '根基', bgGradient: 'linear-gradient(135deg, #c8aa6408 0%, #c8aa6402 100%)' },
    month: { name: '月柱', legion: '關係軍團', icon: '🤝', color: COLORS.green, element: '發展', bgGradient: 'linear-gradient(135deg, #4ade8008 0%, #4ade8002 100%)' },
    day: { name: '日柱', legion: '核心軍團', icon: '⭐', color: COLORS.purple, element: '核心', bgGradient: 'linear-gradient(135deg, #a855f708 0%, #a855f702 100%)' },
    hour: { name: '時柱', legion: '未來軍團', icon: '🚀', color: COLORS.orange, element: '歸宿', bgGradient: 'linear-gradient(135deg, #f9731608 0%, #f9731602 100%)' }
  };

  // 五行配置
  const wuxingConfig = [
    { key: 'wood', name: '木', color: '#4ade80', icon: '🌲', desc: '生發' },
    { key: 'fire', name: '火', color: '#f87171', icon: '🔥', desc: '光明' },
    { key: 'earth', name: '土', color: '#fbbf24', icon: '🏔️', desc: '承載' },
    { key: 'metal', name: '金', color: '#e5e5e5', icon: '⚔️', desc: '收斂' },
    { key: 'water', name: '水', color: '#60a5fa', icon: '🌊', desc: '潤下' }
  ];

  const pillarsPage = `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 50%, ${COLORS.bgPrimary} 100%);
      position: relative;
      padding: 40px 50px;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
    ">
      <!-- 多層背景裝飾 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(ellipse 80% 50% at 50% 0%, ${COLORS.gold}06 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 0% 50%, ${COLORS.purple}04 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 100% 50%, ${COLORS.blue}04 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 50% 100%, ${COLORS.gold}04 0%, transparent 60%);
        pointer-events: none;
      "></div>
      
      <!-- 八卦紋背景 -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 500px;
        background: 
          repeating-conic-gradient(from 0deg at 50% 50%, 
            ${COLORS.gold}02 0deg 45deg, 
            transparent 45deg 90deg);
        border-radius: 50%;
        opacity: 0.3;
        pointer-events: none;
      "></div>
      
      <!-- 精緻雙層邊框 -->
      <div style="position: absolute; inset: 12px; border: 2px solid ${COLORS.gold}40; pointer-events: none;"></div>
      <div style="position: absolute; inset: 18px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      
      <!-- 角落裝飾徽章 -->
      <div style="position: absolute; top: 12px; left: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; top: 0; left: 0; width: 22px; height: 3px; background: linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; top: 0; left: 0; width: 3px; height: 22px; background: linear-gradient(180deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; top: 5px; left: 5px; width: 8px; height: 8px; border: 1px solid ${COLORS.gold}50; transform: rotate(45deg);"></div>
      </div>
      <div style="position: absolute; top: 12px; right: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; top: 0; right: 0; width: 22px; height: 3px; background: linear-gradient(270deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; top: 0; right: 0; width: 3px; height: 22px; background: linear-gradient(180deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; border: 1px solid ${COLORS.gold}50; transform: rotate(45deg);"></div>
      </div>
      <div style="position: absolute; bottom: 12px; left: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; bottom: 0; left: 0; width: 22px; height: 3px; background: linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 3px; height: 22px; background: linear-gradient(0deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; bottom: 5px; left: 5px; width: 8px; height: 8px; border: 1px solid ${COLORS.gold}50; transform: rotate(45deg);"></div>
      </div>
      <div style="position: absolute; bottom: 12px; right: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; bottom: 0; right: 0; width: 22px; height: 3px; background: linear-gradient(270deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 3px; height: 22px; background: linear-gradient(0deg, ${COLORS.gold}, ${COLORS.gold}60);"></div>
        <div style="position: absolute; bottom: 5px; right: 5px; width: 8px; height: 8px; border: 1px solid ${COLORS.gold}50; transform: rotate(45deg);"></div>
      </div>
      
      ${createHeader('四時軍團戰略命理系統')}
      
      <!-- 增強版標題區域 -->
      <div style="text-align: center; margin: 10px 0 25px 0;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 12px;">
          <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark});"></div>
          <span style="font-size: 10px; color: ${COLORS.goldDark}; letter-spacing: 6px; text-transform: uppercase;">FOUR PILLARS ANALYSIS</span>
          <div style="width: 60px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.goldDark});"></div>
        </div>
        <h3 style="
          font-size: 28px; 
          font-family: ${FONTS.heading};
          color: ${COLORS.goldLight}; 
          margin: 0 0 8px 0; 
          letter-spacing: 8px; 
          font-weight: 600;
          text-shadow: 0 2px 15px ${COLORS.gold}25;
        ">四柱命盤詳解</h3>
        <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0; letter-spacing: 2px;">
          天干地支 · 納音五行 · 十神關係 · 藏干透出
        </p>
      </div>
      
      <!-- 四柱卡片網格 - 精緻版 -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px;">
        ${(['year', 'month', 'day', 'hour'] as const).map(key => {
          const pillar = reportData.pillars[key];
          const nayin = reportData.nayin[key];
          const tenGod = reportData.tenGods?.[key];
          const hidden = reportData.hiddenStems?.[key] || [];
          const label = pillarLabels[key];
          return `
            <div style="
              background: linear-gradient(145deg, rgba(25, 25, 38, 0.95) 0%, rgba(18, 18, 28, 0.9) 100%);
              border: 1px solid ${label.color}25;
              border-radius: 12px;
              overflow: hidden;
              position: relative;
              box-shadow: 
                0 8px 25px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.03);
            ">
              <!-- 頂部發光邊 -->
              <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, transparent, ${label.color}, transparent);
              "></div>
              
              <!-- 左側漸變條 -->
              <div style="
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 5px;
                background: linear-gradient(180deg, ${label.color}, ${label.color}40, ${label.color}10);
              "></div>
              
              <!-- 背景圖案 -->
              <div style="
                position: absolute;
                right: -20px;
                top: -20px;
                width: 100px;
                height: 100px;
                font-size: 80px;
                opacity: 0.04;
                pointer-events: none;
              ">${label.icon}</div>
              
              <div style="padding: 18px 18px 18px 22px;">
                <!-- 標題區 -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 14px;">
                  <div style="
                    width: 42px;
                    height: 42px;
                    background: linear-gradient(135deg, ${label.color}25 0%, ${label.color}08 100%);
                    border: 2px solid ${label.color}40;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px ${label.color}20;
                    position: relative;
                  ">
                    <span style="font-size: 22px; filter: drop-shadow(0 2px 4px ${label.color}40);">${label.icon}</span>
                    <!-- 脈動環 -->
                    <div style="position: absolute; inset: -3px; border: 1px solid ${label.color}20; border-radius: 14px;"></div>
                  </div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="
                        font-size: 16px; 
                        font-family: ${FONTS.heading};
                        color: ${label.color}; 
                        font-weight: 600;
                        letter-spacing: 2px;
                      ">${label.name}</span>
                      <span style="
                        font-size: 9px;
                        color: ${COLORS.textMuted};
                        background: ${label.color}12;
                        padding: 2px 8px;
                        border-radius: 8px;
                        border: 1px solid ${label.color}20;
                      ">${label.element}</span>
                    </div>
                    <span style="font-size: 10px; color: ${COLORS.textMuted}; letter-spacing: 1px;">${label.legion}</span>
                  </div>
                </div>
                
                <!-- 核心干支展示 - 印章風格 -->
                <div style="
                  text-align: center; 
                  padding: 16px 12px; 
                  background: linear-gradient(135deg, rgba(8, 8, 12, 0.8) 0%, rgba(12, 12, 18, 0.7) 100%);
                  border-radius: 10px;
                  border: 1px solid ${label.color}20;
                  margin-bottom: 14px;
                  position: relative;
                ">
                  <!-- 印章效果裝飾 -->
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 70px;
                    height: 70px;
                    border: 1px dashed ${label.color}15;
                    border-radius: 50%;
                    pointer-events: none;
                  "></div>
                  
                  <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <!-- 天干 -->
                    <div style="position: relative;">
                      <span style="
                        font-size: 36px; 
                        font-family: ${FONTS.heading};
                        color: ${COLORS.goldLight}; 
                        font-weight: 600;
                        text-shadow: 0 0 20px ${COLORS.gold}30;
                      ">${pillar.stem}</span>
                      <span style="
                        position: absolute;
                        top: -6px;
                        right: -12px;
                        font-size: 8px;
                        color: ${COLORS.gold};
                        background: ${COLORS.gold}15;
                        padding: 1px 4px;
                        border-radius: 3px;
                      ">干</span>
                    </div>
                    
                    <!-- 分隔線 -->
                    <div style="
                      width: 1px;
                      height: 40px;
                      background: linear-gradient(180deg, transparent, ${label.color}40, transparent);
                      margin: 0 8px;
                    "></div>
                    
                    <!-- 地支 -->
                    <div style="position: relative;">
                      <span style="
                        font-size: 36px; 
                        font-family: ${FONTS.heading};
                        color: ${COLORS.textSecondary}; 
                        font-weight: 600;
                        text-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
                      ">${pillar.branch}</span>
                      <span style="
                        position: absolute;
                        top: -6px;
                        right: -12px;
                        font-size: 8px;
                        color: ${COLORS.purple};
                        background: ${COLORS.purple}15;
                        padding: 1px 4px;
                        border-radius: 3px;
                      ">支</span>
                    </div>
                  </div>
                  
                  <!-- 納音標籤 -->
                  <div style="
                    margin-top: 10px;
                    padding: 4px 12px;
                    background: linear-gradient(90deg, transparent, ${label.color}08, transparent);
                    display: inline-block;
                    border-radius: 12px;
                  ">
                    <span style="font-size: 11px; color: ${label.color}; letter-spacing: 2px;">${nayin}</span>
                  </div>
                </div>
                
                <!-- 詳細資訊網格 -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px;">
                  ${tenGod ? `
                    <div style="
                      padding: 8px 10px;
                      background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%);
                      border-radius: 8px;
                      border: 1px solid rgba(168, 85, 247, 0.15);
                    ">
                      <span style="color: ${COLORS.textMuted}; display: block; margin-bottom: 3px; font-size: 9px;">十神</span>
                      <span style="color: ${COLORS.purple}; font-weight: 500;">${tenGod.stem}</span>
                      <span style="color: ${COLORS.textMuted};"> / </span>
                      <span style="color: ${COLORS.blue};">${tenGod.branch}</span>
                    </div>
                  ` : ''}
                  ${hidden.length > 0 ? `
                    <div style="
                      padding: 8px 10px;
                      background: linear-gradient(135deg, rgba(200, 170, 100, 0.08) 0%, rgba(200, 170, 100, 0.02) 100%);
                      border-radius: 8px;
                      border: 1px solid rgba(200, 170, 100, 0.15);
                    ">
                      <span style="color: ${COLORS.textMuted}; display: block; margin-bottom: 3px; font-size: 9px;">藏干</span>
                      <span style="color: ${COLORS.goldLight}; font-weight: 500; letter-spacing: 1px;">${hidden.join(' · ')}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- 五行與陰陽分析區 - 增強版 -->
      <div style="display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 14px;">
        ${reportData.wuxing ? `
          <div style="
            background: linear-gradient(145deg, rgba(25, 25, 38, 0.95) 0%, rgba(18, 18, 28, 0.9) 100%);
            border: 1px solid ${COLORS.border};
            border-radius: 12px;
            padding: 18px 20px;
            position: relative;
            overflow: hidden;
          ">
            <!-- 頂部發光邊 -->
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, ${COLORS.gold}60, transparent);"></div>
            
            <h4 style="
              font-size: 14px; 
              font-family: ${FONTS.heading};
              color: ${COLORS.gold}; 
              margin: 0 0 16px 0; 
              letter-spacing: 3px; 
              display: flex; 
              align-items: center; 
              gap: 10px;
            ">
              <span style="
                width: 4px; 
                height: 18px; 
                background: linear-gradient(180deg, ${COLORS.gold}, ${COLORS.goldDark});
                border-radius: 2px;
              "></span>
              五行能量分布
              <span style="font-size: 9px; color: ${COLORS.textMuted}; margin-left: auto; letter-spacing: 1px;">WUXING ENERGY</span>
            </h4>
            
            <!-- 五行圖表區 -->
            <div style="display: flex; gap: 6px; margin-bottom: 14px;">
              ${wuxingConfig.map(el => {
                const total = Object.values(reportData.wuxing!).reduce((a, b) => a + b, 0);
                const value = reportData.wuxing![el.key as keyof typeof reportData.wuxing];
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                const barHeight = Math.max(20, pct * 1.2);
                return `
                  <div style="flex: 1; text-align: center;">
                    <!-- 圓形能量圖 -->
                    <div style="
                      width: 60px;
                      height: 60px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, ${el.color}18 0%, ${el.color}05 100%);
                      border: 3px solid ${el.color}50;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      margin: 0 auto 8px;
                      position: relative;
                      box-shadow: 
                        0 4px 15px ${el.color}20,
                        inset 0 2px 10px ${el.color}10;
                    ">
                      <!-- 外環進度 -->
                      <div style="
                        position: absolute;
                        inset: -6px;
                        border-radius: 50%;
                        background: conic-gradient(${el.color}40 0deg ${pct * 3.6}deg, ${el.color}10 ${pct * 3.6}deg 360deg);
                        z-index: -1;
                      "></div>
                      <span style="font-size: 18px;">${el.icon}</span>
                    </div>
                    <p style="
                      font-size: 15px; 
                      color: ${el.color}; 
                      margin: 0; 
                      font-weight: 700;
                      text-shadow: 0 0 10px ${el.color}30;
                    ">${el.name}</p>
                    <p style="
                      font-size: 12px; 
                      color: ${COLORS.textSecondary}; 
                      margin: 2px 0;
                      font-weight: 600;
                    ">${value}</p>
                    <p style="font-size: 9px; color: ${COLORS.textMuted}; margin: 0;">${pct}%</p>
                  </div>
                `;
              }).join('')}
            </div>
            
            <!-- 五行長條圖 -->
            <div style="
              background: rgba(10, 10, 15, 0.5);
              border-radius: 8px;
              padding: 12px;
              border: 1px solid ${COLORS.border};
            ">
              ${wuxingConfig.map(el => {
                const total = Object.values(reportData.wuxing!).reduce((a, b) => a + b, 0);
                const value = reportData.wuxing![el.key as keyof typeof reportData.wuxing];
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return `
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="font-size: 10px; color: ${el.color}; width: 20px; text-align: center;">${el.name}</span>
                    <div style="flex: 1; height: 8px; background: rgba(30, 30, 45, 0.8); border-radius: 4px; overflow: hidden;">
                      <div style="
                        width: ${pct}%;
                        height: 100%;
                        background: linear-gradient(90deg, ${el.color}80, ${el.color});
                        border-radius: 4px;
                        box-shadow: 0 0 8px ${el.color}40;
                      "></div>
                    </div>
                    <span style="font-size: 9px; color: ${COLORS.textMuted}; width: 28px; text-align: right;">${pct}%</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
        
        ${reportData.yinyang ? `
          <div style="
            background: linear-gradient(145deg, rgba(25, 25, 38, 0.95) 0%, rgba(18, 18, 28, 0.9) 100%);
            border: 1px solid ${COLORS.border};
            border-radius: 12px;
            padding: 18px 16px;
            position: relative;
            overflow: hidden;
          ">
            <!-- 頂部發光邊 -->
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, ${COLORS.purple}60, transparent);"></div>
            
            <h4 style="
              font-size: 14px; 
              font-family: ${FONTS.heading};
              color: ${COLORS.gold}; 
              margin: 0 0 16px 0; 
              letter-spacing: 3px; 
              display: flex; 
              align-items: center; 
              gap: 10px;
            ">
              <span style="
                width: 4px; 
                height: 18px; 
                background: linear-gradient(180deg, ${COLORS.purple}, ${COLORS.blue});
                border-radius: 2px;
              "></span>
              陰陽平衡
            </h4>
            
            <!-- 太極圖示意 -->
            <div style="
              width: 120px;
              height: 120px;
              margin: 0 auto 16px;
              border-radius: 50%;
              background: linear-gradient(180deg, #dcc88c 50%, #4a4a8a 50%);
              position: relative;
              box-shadow: 
                0 4px 20px rgba(0, 0, 0, 0.3),
                inset 0 2px 10px rgba(255, 255, 255, 0.1);
              border: 2px solid ${COLORS.gold}30;
            ">
              <div style="
                position: absolute;
                top: 22px;
                left: 50%;
                transform: translateX(-50%);
                width: 18px;
                height: 18px;
                background: #4a4a8a;
                border-radius: 50%;
              "></div>
              <div style="
                position: absolute;
                bottom: 22px;
                left: 50%;
                transform: translateX(-50%);
                width: 18px;
                height: 18px;
                background: #dcc88c;
                border-radius: 50%;
              "></div>
            </div>
            
            <!-- 陰陽比例條 -->
            <div style="
              height: 28px; 
              border-radius: 14px; 
              overflow: hidden; 
              display: flex; 
              background: #1a1a24;
              margin-bottom: 12px;
              box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
            ">
              <div style="
                width: ${(reportData.yinyang.yang / (reportData.yinyang.yang + reportData.yinyang.yin)) * 100}%;
                background: linear-gradient(90deg, #b8a454, #dcc88c);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 2px 0 10px rgba(200, 170, 100, 0.3);
              ">
                <span style="font-size: 11px; color: #1a1a1a; font-weight: 700;">☀ ${reportData.yinyang.yang}</span>
              </div>
              <div style="
                flex: 1; 
                background: linear-gradient(90deg, #4a4a8a, #6464c8); 
                display: flex; 
                align-items: center; 
                justify-content: center;
              ">
                <span style="font-size: 11px; color: #e0e0e0; font-weight: 700;">☽ ${reportData.yinyang.yin}</span>
              </div>
            </div>
            
            <!-- 分析說明 -->
            <div style="
              padding: 10px 12px;
              background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(96, 165, 250, 0.05) 100%);
              border-radius: 8px;
              border: 1px solid rgba(168, 85, 247, 0.15);
            ">
              <p style="
                font-size: 10px; 
                color: ${COLORS.textSecondary}; 
                margin: 0; 
                text-align: center;
                line-height: 1.6;
              ">
                ${reportData.yinyang.yang > reportData.yinyang.yin 
                  ? '☀ 陽氣較旺<br><span style="color: ' + COLORS.textMuted + ';">性格外向積極、行動力強</span>' 
                  : reportData.yinyang.yang < reportData.yinyang.yin 
                    ? '☽ 陰氣較重<br><span style="color: ' + COLORS.textMuted + ';">性格內斂沉穩、思慮周全</span>' 
                    : '☯ 陰陽平衡<br><span style="color: ' + COLORS.textMuted + ';">性格中和、動靜皆宜</span>'}
              </p>
            </div>
          </div>
        ` : ''}
      </div>
      
      <!-- 底部裝飾 -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 18px;
        gap: 15px;
      ">
        <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.border});"></div>
        <span style="font-size: 9px; color: ${COLORS.textMuted}; letter-spacing: 2px;">天干地支 · 命理根基</span>
        <div style="width: 80px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.border});"></div>
      </div>
      
      ${createFooter(dateStr, '第 3 頁', CHAPTERS.pillars, pillarsStartPage, totalPages)}
    </div>
  `;

  // 神煞分析頁 - 根據選項決定是否包含
  const shenshaPages = (options.includeShensha && reportData.shensha && reportData.shensha.length > 0) ? 
    createShenshaPages(reportData.shensha, dateStr, shenshaStartPage, totalPages) : '';

  // 軍團詳解頁 - 根據選項決定是否包含
  const legionDetailsPages = options.includeLegionDetails ? 
    createLegionDetailsPages(reportData.pillars, reportData.tenGods, dateStr, legionStartPage, totalPages) : '';
  
  const storyPages = (['year', 'month', 'day', 'hour'] as const)
    .filter(type => storyTypeOptions[type] && reportData.legionStories?.[type])
    .map((type, idx) => createStoryPage(
      type,
      reportData.legionStories![type]!,
      reportData.pillars[type],
      reportData.nayin[type],
      dateStr,
      storyStartPage + idx,
      totalPages
    ))
    .join('');

  // 生成目錄頁 - 動態計算頁碼
  let tableOfContentsPage = '';
  if (options.includeTableOfContents) {
    const tocEntries: TocEntry[] = [];
    let currentPage = 2; // 目錄頁本身是第2頁
    currentPage++; // 目錄頁後的第一頁
    
    if (options.includePillars) {
      tocEntries.push({
        title: '四柱命盤詳解',
        subtitle: '天干地支・納音・十神・藏干分析',
        icon: '📜',
        page: currentPage,
        color: COLORS.gold,
        summary: '深入解析年、月、日、時四柱的天干地支組合，揭示命格根基與人生架構。'
      });
      currentPage++;
    }
    
    if (options.includeShensha && reportData.shensha && reportData.shensha.length > 0) {
      tocEntries.push({
        title: '神煞命格分析',
        subtitle: `共 ${reportData.shensha.length} 個神煞・吉凶解讀`,
        icon: '✨',
        page: currentPage,
        color: COLORS.purple,
        summary: '詳述命盤中各神煞的意涵與影響，助您掌握命運中的吉凶機遇。'
      });
      currentPage += shenshaPageCount;
    }
    
    if (options.includeLegionDetails) {
      tocEntries.push({
        title: '軍團角色詳解',
        subtitle: '主將・軍師・增益減益分析',
        icon: '⚔️',
        page: currentPage,
        color: COLORS.blue,
        summary: '以軍團隱喻呈現命格特質，包含統帥、謀士與各軍成員的能力解析。'
      });
      currentPage += legionDetailsPageCount;
    }
    
    // 軍團故事配置（含摘要）
    const storyConfig = {
      year: { 
        title: '👑 祖源軍團故事', 
        subtitle: '家族傳承・童年根基', 
        color: COLORS.gold,
        summary: '探索家族血脈的傳承力量，解讀童年經歷如何塑造您的人生基調。'
      },
      month: { 
        title: '🤝 關係軍團故事', 
        subtitle: '社交人脈・事業發展', 
        color: COLORS.green,
        summary: '揭示人際互動的模式與職場發展的潛能，助您建立成功的社交網絡。'
      },
      day: { 
        title: '⭐ 核心軍團故事', 
        subtitle: '核心自我・婚姻感情', 
        color: COLORS.purple,
        summary: '深入剖析內在自我與情感世界，理解真正的您以及理想的伴侶關係。'
      },
      hour: { 
        title: '🚀 未來軍團故事', 
        subtitle: '未來規劃・子女傳承', 
        color: COLORS.orange,
        summary: '展望人生下半場的發展方向，以及與後代之間的緣分與傳承。'
      }
    };
    
    (['year', 'month', 'day', 'hour'] as const).forEach(type => {
      if (storyTypeOptions[type] && reportData.legionStories?.[type]) {
        const config = storyConfig[type];
        tocEntries.push({
          title: config.title,
          subtitle: config.subtitle,
          icon: type === 'year' ? '👑' : type === 'month' ? '🤝' : type === 'day' ? '⭐' : '🚀',
          page: currentPage,
          color: config.color,
          summary: config.summary
        });
        currentPage++;
      }
    });
    
    tableOfContentsPage = createTableOfContentsPage(tocEntries, dateStr, totalPages);
  }

  // 組合頁面 - 根據選項決定包含哪些
  let content = coverPage;
  if (options.includeTableOfContents) {
    content += tableOfContentsPage;
  }
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
  dateStr: string,
  startPage: number = 1,
  totalPages: number = 1
): string => {
  const legionConfig = {
    year: { 
      name: '祖源軍團', 
      icon: '👑', 
      color: '#fbbf24', 
      description: '家族傳承 · 童年根基',
      gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #fbbf24, #f59e0b)',
      bgPattern: 'radial-gradient(circle at 85% 15%, rgba(251, 191, 36, 0.12) 0%, transparent 45%)',
      motto: '承先啟後，血脈傳承',
      element: '金'
    },
    month: { 
      name: '關係軍團', 
      icon: '🤝', 
      color: '#4ade80', 
      description: '社交人脈 · 事業發展',
      gradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #4ade80, #22c55e)',
      bgPattern: 'radial-gradient(circle at 85% 15%, rgba(74, 222, 128, 0.12) 0%, transparent 45%)',
      motto: '縱橫捭闔，廣結善緣',
      element: '木'
    },
    day: { 
      name: '核心軍團', 
      icon: '⭐', 
      color: '#c084fc', 
      description: '核心自我 · 婚姻感情',
      gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.15) 0%, rgba(192, 132, 252, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #c084fc, #a855f7)',
      bgPattern: 'radial-gradient(circle at 85% 15%, rgba(192, 132, 252, 0.12) 0%, transparent 45%)',
      motto: '自知者明，知己知彼',
      element: '火'
    },
    hour: { 
      name: '未來軍團', 
      icon: '🚀', 
      color: '#f97316', 
      description: '未來規劃 · 子女傳承',
      gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.03) 100%)',
      borderGradient: 'linear-gradient(180deg, #f97316, #ea580c)',
      bgPattern: 'radial-gradient(circle at 85% 15%, rgba(249, 115, 22, 0.12) 0%, transparent 45%)',
      motto: '開疆拓土，繼往開來',
      element: '水'
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
      background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 50%, ${COLORS.bgPrimary} 100%);
      position: relative;
      padding: 40px 50px;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
    ">
      <!-- 多層背景裝飾 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(ellipse 60% 40% at 25% 10%, ${group[0] ? legionConfig[group[0]].color : COLORS.gold}10 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 75% 90%, ${group[1] ? legionConfig[group[1]].color : COLORS.gold}10 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(20, 20, 30, 0.4) 0%, transparent 70%);
        pointer-events: none;
      "></div>
      
      <!-- 裝飾性網格背景 -->
      <div style="
        position: absolute;
        inset: 0;
        background-image: 
          linear-gradient(${COLORS.gold}03 1px, transparent 1px),
          linear-gradient(90deg, ${COLORS.gold}03 1px, transparent 1px);
        background-size: 60px 60px;
        opacity: 0.3;
        pointer-events: none;
      "></div>
      
      <!-- 精緻雙層邊框 -->
      <div style="position: absolute; inset: 12px; border: 2px solid ${COLORS.gold}40; pointer-events: none; border-radius: 4px;"></div>
      <div style="position: absolute; inset: 18px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      
      <!-- 角落裝飾徽章 -->
      <div style="position: absolute; top: 12px; left: 12px; width: 45px; height: 45px;">
        <div style="position: absolute; top: 0; left: 0; width: 30px; height: 3px; background: linear-gradient(90deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; top: 0; left: 0; width: 3px; height: 30px; background: linear-gradient(180deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; top: 8px; left: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
      </div>
      <div style="position: absolute; top: 12px; right: 12px; width: 45px; height: 45px;">
        <div style="position: absolute; top: 0; right: 0; width: 30px; height: 3px; background: linear-gradient(270deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; top: 0; right: 0; width: 3px; height: 30px; background: linear-gradient(180deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
      </div>
      <div style="position: absolute; bottom: 12px; left: 12px; width: 45px; height: 45px;">
        <div style="position: absolute; bottom: 0; left: 0; width: 30px; height: 3px; background: linear-gradient(90deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 3px; height: 30px; background: linear-gradient(0deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; bottom: 8px; left: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
      </div>
      <div style="position: absolute; bottom: 12px; right: 12px; width: 45px; height: 45px;">
        <div style="position: absolute; bottom: 0; right: 0; width: 30px; height: 3px; background: linear-gradient(270deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 3px; height: 30px; background: linear-gradient(0deg, ${COLORS.gold}, transparent);"></div>
        <div style="position: absolute; bottom: 8px; right: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
      </div>
      
      ${createHeader('四時軍團戰略命理系統')}
      
      <!-- 頁面標題區域 - 增強設計 -->
      <div style="text-align: center; margin: 8px 0 22px 0; position: relative;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 70px;
          background: radial-gradient(ellipse, ${COLORS.gold}10 0%, transparent 70%);
        "></div>
        
        <!-- 標題裝飾線 -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 50px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark});"></div>
            <div style="width: 6px; height: 6px; border: 1px solid ${COLORS.gold}; transform: rotate(45deg);"></div>
          </div>
          <span style="font-size: 11px; color: ${COLORS.goldDark}; letter-spacing: 6px; text-transform: uppercase;">LEGION PROFILE</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 6px; height: 6px; border: 1px solid ${COLORS.gold}; transform: rotate(45deg);"></div>
            <div style="width: 50px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.goldDark});"></div>
          </div>
        </div>
        
        <h3 style="
          font-size: 28px; 
          font-family: ${FONTS.heading};
          color: ${COLORS.goldLight}; 
          margin: 0; 
          letter-spacing: 8px; 
          font-weight: 600;
          text-shadow: 0 2px 15px rgba(200, 170, 100, 0.25);
        ">
          軍團角色詳解
        </h3>
        <p style="font-size: 12px; color: ${COLORS.textSecondary}; margin: 10px 0 0 0; letter-spacing: 3px;">
          ${pageIdx === 0 ? '👑 祖源軍團 · 🤝 關係軍團' : '⭐ 核心軍團 · 🚀 未來軍團'}
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
            border: 1px solid ${config.color}35;
            border-radius: 16px;
            padding: 0;
            margin-bottom: 20px;
            position: relative;
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
            overflow: hidden;
          ">
            <!-- 背景圖案 -->
            <div style="
              position: absolute;
              inset: 0;
              ${config.bgPattern};
              pointer-events: none;
            "></div>
            
            <!-- 頂部發光漸層條 -->
            <div style="
              position: absolute; 
              top: 0; 
              left: 0; 
              right: 0;
              height: 3px; 
              background: linear-gradient(90deg, transparent 10%, ${config.color}90 50%, transparent 90%);
            "></div>
            
            <!-- 左側漸層色帶 -->
            <div style="
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 5px;
              background: ${config.borderGradient};
            "></div>
            
            <!-- 軍團標題卡 - 精緻設計 -->
            <div style="
              padding: 18px 24px 14px 24px;
              background: linear-gradient(180deg, rgba(10, 10, 15, 0.4) 0%, transparent 100%);
              border-bottom: 1px solid ${config.color}20;
              position: relative;
            ">
              <div style="display: flex; align-items: center; gap: 16px;">
                <!-- 軍團圖標區 -->
                <div style="
                  width: 60px;
                  height: 60px;
                  background: linear-gradient(135deg, ${config.color}20 0%, ${config.color}05 100%);
                  border: 2px solid ${config.color}50;
                  border-radius: 14px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  position: relative;
                  box-shadow: 
                    0 4px 15px ${config.color}25,
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                ">
                  <span style="
                    font-size: 32px; 
                    filter: drop-shadow(0 2px 8px ${config.color}60);
                  ">${config.icon}</span>
                  <!-- 脈動光環 -->
                  <div style="
                    position: absolute;
                    inset: -4px;
                    border: 1px solid ${config.color}30;
                    border-radius: 18px;
                  "></div>
                </div>
                
                <!-- 軍團資訊 -->
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                    <h4 style="
                      font-size: 22px; 
                      font-family: ${FONTS.heading};
                      color: ${config.color}; 
                      margin: 0; 
                      font-weight: 600; 
                      letter-spacing: 5px;
                      text-shadow: 0 0 20px ${config.color}40;
                    ">${config.name}</h4>
                    <span style="
                      font-size: 9px;
                      color: ${COLORS.textMuted};
                      background: ${config.color}15;
                      padding: 3px 10px;
                      border-radius: 10px;
                      border: 1px solid ${config.color}25;
                      letter-spacing: 1px;
                    ">${config.element}行</span>
                  </div>
                  <p style="font-size: 11px; color: ${COLORS.textMuted}; margin: 0 0 6px 0; letter-spacing: 2px;">
                    ${config.description}
                  </p>
                  <p style="
                    font-size: 10px; 
                    color: ${config.color}80; 
                    margin: 0; 
                    font-style: italic;
                    letter-spacing: 1px;
                  ">『${config.motto}』</p>
                </div>
                
                <!-- 柱位顯示區 -->
                <div style="
                  padding: 14px 24px; 
                  background: linear-gradient(135deg, rgba(10, 10, 15, 0.7) 0%, rgba(15, 15, 22, 0.7) 100%); 
                  border-radius: 12px; 
                  border: 1px solid ${config.color}30;
                  text-align: center;
                  position: relative;
                  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
                ">
                  <p style="font-size: 9px; color: ${COLORS.textMuted}; margin: 0 0 6px 0; letter-spacing: 2px;">
                    ${pillarKey === 'year' ? '年柱' : pillarKey === 'month' ? '月柱' : pillarKey === 'day' ? '日柱' : '時柱'}
                  </p>
                  <span style="
                    font-size: 28px; 
                    color: ${COLORS.goldLight}; 
                    letter-spacing: 6px;
                    font-family: ${FONTS.heading};
                    font-weight: 600;
                    text-shadow: 0 0 15px ${COLORS.gold}30;
                  ">${pillar.stem}${pillar.branch}</span>
                </div>
              </div>
            </div>
            
            <!-- 角色卡片區 - 雙欄佈局 -->
            <div style="display: flex; gap: 16px; padding: 18px 22px 20px 22px;">
              <!-- 主將卡 -->
              <div style="
                flex: 1; 
                background: linear-gradient(145deg, rgba(12, 12, 18, 0.9) 0%, rgba(18, 18, 26, 0.85) 100%); 
                border-radius: 12px; 
                padding: 18px 20px; 
                border: 1px solid ${COLORS.gold}20;
                position: relative;
                box-shadow: 
                  0 4px 20px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.03);
              ">
                <!-- 角色類型標籤 -->
                <div style="
                  position: absolute;
                  top: -1px;
                  left: 20px;
                  background: linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%);
                  padding: 4px 14px;
                  border-radius: 0 0 8px 8px;
                  font-size: 9px;
                  color: #0a0a0f;
                  font-weight: 600;
                  letter-spacing: 2px;
                  box-shadow: 0 2px 8px ${config.color}40;
                ">🗡️ 主將</div>
                
                <!-- 頭像與標題 -->
                <div style="display: flex; align-items: center; gap: 14px; margin: 8px 0 16px 0;">
                  ${createAvatarHTML(commanderAvatar, pillar.stem, ganChar?.title || pillar.stem, config.color, '干')}
                  <div style="flex: 1;">
                    <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0 0 4px 0; letter-spacing: 1px;">天干 · Commander</p>
                    <p style="
                      font-size: 18px; 
                      font-family: ${FONTS.heading};
                      color: ${COLORS.goldLight}; 
                      margin: 0; 
                      font-weight: 600; 
                      letter-spacing: 2px;
                      text-shadow: 0 1px 8px ${COLORS.gold}20;
                    ">${ganChar?.title || pillar.stem}</p>
                    ${tenGod?.stem ? `
                      <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px;">
                        <span style="font-size: 10px; color: ${COLORS.textMuted};">十神:</span>
                        <span style="
                          font-size: 11px; 
                          color: ${config.color};
                          background: ${config.color}15;
                          padding: 2px 8px;
                          border-radius: 6px;
                          font-weight: 500;
                        ">${tenGod.stem}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <!-- Buff/Debuff 區域 -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="
                    padding: 12px 14px; 
                    background: linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.03) 100%); 
                    border-radius: 10px; 
                    border: 1px solid rgba(74, 222, 128, 0.2);
                    position: relative;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      left: 0;
                      top: 0;
                      bottom: 0;
                      width: 3px;
                      background: linear-gradient(180deg, ${COLORS.green}, ${COLORS.green}60);
                    "></div>
                    <p style="font-size: 10px; color: ${COLORS.green}; margin: 0 0 6px 0; letter-spacing: 1.5px; font-weight: 500;">✨ BUFF 增益技能</p>
                    <p style="font-size: 12px; color: #b8e8c8; margin: 0; line-height: 1.7;">${ganChar?.buff || '待查詢'}</p>
                  </div>
                  <div style="
                    padding: 12px 14px; 
                    background: linear-gradient(135deg, rgba(248, 113, 113, 0.12) 0%, rgba(248, 113, 113, 0.03) 100%); 
                    border-radius: 10px; 
                    border: 1px solid rgba(248, 113, 113, 0.2);
                    position: relative;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      left: 0;
                      top: 0;
                      bottom: 0;
                      width: 3px;
                      background: linear-gradient(180deg, ${COLORS.red}, ${COLORS.red}60);
                    "></div>
                    <p style="font-size: 10px; color: ${COLORS.red}; margin: 0 0 6px 0; letter-spacing: 1.5px; font-weight: 500;">⚠️ DEBUFF 減益弱點</p>
                    <p style="font-size: 12px; color: #e8b8b8; margin: 0; line-height: 1.7;">${ganChar?.debuff || '待查詢'}</p>
                  </div>
                </div>
              </div>
              
              <!-- 軍師卡 -->
              <div style="
                flex: 1; 
                background: linear-gradient(145deg, rgba(12, 12, 18, 0.9) 0%, rgba(18, 18, 26, 0.85) 100%); 
                border-radius: 12px; 
                padding: 18px 20px; 
                border: 1px solid ${COLORS.gold}20;
                position: relative;
                box-shadow: 
                  0 4px 20px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.03);
              ">
                <!-- 角色類型標籤 -->
                <div style="
                  position: absolute;
                  top: -1px;
                  right: 20px;
                  background: linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purple}cc 100%);
                  padding: 4px 14px;
                  border-radius: 0 0 8px 8px;
                  font-size: 9px;
                  color: #fff;
                  font-weight: 600;
                  letter-spacing: 2px;
                  box-shadow: 0 2px 8px ${COLORS.purple}40;
                ">🔮 軍師</div>
                
                <!-- 頭像與標題 -->
                <div style="display: flex; align-items: center; gap: 14px; margin: 8px 0 16px 0;">
                  ${createAvatarHTML(advisorAvatar, pillar.branch, zhiChar?.title || pillar.branch, COLORS.purple, '支')}
                  <div style="flex: 1;">
                    <p style="font-size: 10px; color: ${COLORS.textMuted}; margin: 0 0 4px 0; letter-spacing: 1px;">地支 · Advisor</p>
                    <p style="
                      font-size: 18px; 
                      font-family: ${FONTS.heading};
                      color: ${COLORS.goldLight}; 
                      margin: 0; 
                      font-weight: 600; 
                      letter-spacing: 2px;
                      text-shadow: 0 1px 8px ${COLORS.gold}20;
                    ">${zhiChar?.title || pillar.branch}</p>
                    ${tenGod?.branch ? `
                      <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px;">
                        <span style="font-size: 10px; color: ${COLORS.textMuted};">十神:</span>
                        <span style="
                          font-size: 11px; 
                          color: ${COLORS.purple};
                          background: ${COLORS.purple}15;
                          padding: 2px 8px;
                          border-radius: 6px;
                          font-weight: 500;
                        ">${tenGod.branch}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>
                
                <!-- Buff/Debuff 區域 -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="
                    padding: 12px 14px; 
                    background: linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.03) 100%); 
                    border-radius: 10px; 
                    border: 1px solid rgba(74, 222, 128, 0.2);
                    position: relative;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      left: 0;
                      top: 0;
                      bottom: 0;
                      width: 3px;
                      background: linear-gradient(180deg, ${COLORS.green}, ${COLORS.green}60);
                    "></div>
                    <p style="font-size: 10px; color: ${COLORS.green}; margin: 0 0 6px 0; letter-spacing: 1.5px; font-weight: 500;">✨ BUFF 增益技能</p>
                    <p style="font-size: 12px; color: #b8e8c8; margin: 0; line-height: 1.7;">${zhiChar?.buff || '待查詢'}</p>
                  </div>
                  <div style="
                    padding: 12px 14px; 
                    background: linear-gradient(135deg, rgba(248, 113, 113, 0.12) 0%, rgba(248, 113, 113, 0.03) 100%); 
                    border-radius: 10px; 
                    border: 1px solid rgba(248, 113, 113, 0.2);
                    position: relative;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      left: 0;
                      top: 0;
                      bottom: 0;
                      width: 3px;
                      background: linear-gradient(180deg, ${COLORS.red}, ${COLORS.red}60);
                    "></div>
                    <p style="font-size: 10px; color: ${COLORS.red}; margin: 0 0 6px 0; letter-spacing: 1.5px; font-weight: 500;">⚠️ DEBUFF 減益弱點</p>
                    <p style="font-size: 12px; color: #e8b8b8; margin: 0; line-height: 1.7;">${zhiChar?.debuff || '待查詢'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
      
      <!-- 底部裝飾 -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: auto;
        padding-top: 15px;
        gap: 15px;
      ">
        <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.border});"></div>
        <span style="font-size: 10px; color: ${COLORS.textMuted}; letter-spacing: 2px;">主將統帥 · 軍師謀策</span>
        <div style="width: 80px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.border});"></div>
      </div>
      
      ${createFooter(dateStr, `軍團詳解 ${pageIdx + 1}/2`, CHAPTERS.legion, startPage + pageIdx, totalPages)}
    </div>
  `).join('');
};

// 創建神煞分析頁 - 精緻專業設計（增強分類展示與卡片效果）
const createShenshaPages = (shensha: ShenshaItem[], dateStr: string, startPage: number = 1, totalPages: number = 1): string => {
  const itemsPerPage = 4; // 減少每頁數量以留出更多精緻空間
  const pages: string[] = [];
  
  // 增強的分類配置 - 更豐富的視覺效果
  const categoryConfig: Record<string, { 
    color: string; 
    colorLight: string;
    icon: string; 
    gradient: string;
    bgPattern: string;
    description: string;
    borderGlow: string;
  }> = {
    '吉神': { 
      color: '#4ade80', 
      colorLight: '#86efac',
      icon: '🌟', 
      gradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.18) 0%, rgba(74, 222, 128, 0.03) 100%)',
      bgPattern: 'radial-gradient(circle at 95% 5%, rgba(74, 222, 128, 0.15) 0%, transparent 40%)',
      description: '福運守護',
      borderGlow: '0 0 20px rgba(74, 222, 128, 0.15)'
    },
    '凶神': { 
      color: '#f87171', 
      colorLight: '#fca5a5',
      icon: '⚡', 
      gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.18) 0%, rgba(248, 113, 113, 0.03) 100%)',
      bgPattern: 'radial-gradient(circle at 95% 5%, rgba(248, 113, 113, 0.15) 0%, transparent 40%)',
      description: '化煞為權',
      borderGlow: '0 0 20px rgba(248, 113, 113, 0.15)'
    },
    '貴人': { 
      color: '#c084fc', 
      colorLight: '#d8b4fe',
      icon: '👑', 
      gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.18) 0%, rgba(192, 132, 252, 0.03) 100%)',
      bgPattern: 'radial-gradient(circle at 95% 5%, rgba(192, 132, 252, 0.15) 0%, transparent 40%)',
      description: '貴助提攜',
      borderGlow: '0 0 20px rgba(192, 132, 252, 0.15)'
    },
    '桃花': { 
      color: '#f472b6', 
      colorLight: '#f9a8d4',
      icon: '🌸', 
      gradient: 'linear-gradient(135deg, rgba(244, 114, 182, 0.18) 0%, rgba(244, 114, 182, 0.03) 100%)',
      bgPattern: 'radial-gradient(circle at 95% 5%, rgba(244, 114, 182, 0.15) 0%, transparent 40%)',
      description: '情緣魅力',
      borderGlow: '0 0 20px rgba(244, 114, 182, 0.15)'
    },
    '學堂': { 
      color: '#60a5fa', 
      colorLight: '#93c5fd',
      icon: '📚', 
      gradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.18) 0%, rgba(96, 165, 250, 0.03) 100%)',
      bgPattern: 'radial-gradient(circle at 95% 5%, rgba(96, 165, 250, 0.15) 0%, transparent 40%)',
      description: '文昌智慧',
      borderGlow: '0 0 20px rgba(96, 165, 250, 0.15)'
    },
    '特殊': { 
      color: '#fbbf24', 
      colorLight: '#fcd34d',
      icon: '✨', 
      gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.18) 0%, rgba(251, 191, 36, 0.03) 100%)',
      bgPattern: 'radial-gradient(circle at 95% 5%, rgba(251, 191, 36, 0.15) 0%, transparent 40%)',
      description: '獨特稀有',
      borderGlow: '0 0 20px rgba(251, 191, 36, 0.15)'
    }
  };

  // 增強的稀有度配置
  const rarityConfig: Record<string, { 
    text: string; 
    color: string; 
    bgGradient: string;
    glowColor: string;
    badge: string;
  }> = {
    'SSR': { 
      text: '傳說', 
      color: '#fbbf24', 
      bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
      glowColor: 'rgba(251, 191, 36, 0.5)',
      badge: '★★★'
    },
    'SR': { 
      text: '稀有', 
      color: '#c084fc', 
      bgGradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #c084fc 100%)',
      glowColor: 'rgba(192, 132, 252, 0.5)',
      badge: '★★'
    },
    'R': { 
      text: '精良', 
      color: '#60a5fa', 
      bgGradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #60a5fa 100%)',
      glowColor: 'rgba(96, 165, 250, 0.5)',
      badge: '★'
    },
    'N': { 
      text: '普通', 
      color: '#9ca3af', 
      bgGradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #9ca3af 100%)',
      glowColor: 'rgba(156, 163, 175, 0.3)',
      badge: ''
    }
  };

  // 統計各分類數量
  const categoryStats: Record<string, number> = {};
  shensha.forEach(item => {
    const cat = item.category || '特殊';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });
  
  const shenshaPageCount = Math.ceil(shensha.length / itemsPerPage);
  
  for (let i = 0; i < shensha.length; i += itemsPerPage) {
    const pageItems = shensha.slice(i, i + itemsPerPage);
    const pageNum = Math.floor(i / itemsPerPage) + 1;
    const isFirstPage = pageNum === 1;
    
    pages.push(`
      <div style="
        width: 794px;
        min-height: 1123px;
        background: linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 50%, ${COLORS.bgPrimary} 100%);
        position: relative;
        padding: 40px 50px;
        box-sizing: border-box;
        page-break-after: always;
        overflow: hidden;
      ">
        <!-- 多層動態背景 -->
        <div style="
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 70% 40% at 80% 5%, ${COLORS.purple}08 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 10% 95%, ${COLORS.gold}06 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 50%, rgba(20, 20, 35, 0.5) 0%, transparent 70%);
          pointer-events: none;
        "></div>
        
        <!-- 星辰背景點綴 -->
        <div style="
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 15% 20%, ${COLORS.gold}15 1px, transparent 1px),
            radial-gradient(circle at 85% 30%, ${COLORS.purple}15 1px, transparent 1px),
            radial-gradient(circle at 25% 70%, ${COLORS.blue}10 1px, transparent 1px),
            radial-gradient(circle at 75% 80%, ${COLORS.gold}10 1px, transparent 1px),
            radial-gradient(circle at 50% 15%, ${COLORS.purple}12 1px, transparent 1px);
          background-size: 100% 100%;
          pointer-events: none;
          opacity: 0.6;
        "></div>
        
        <!-- 精緻雙層邊框 -->
        <div style="position: absolute; inset: 12px; border: 2px solid ${COLORS.gold}30; border-radius: 4px; pointer-events: none;"></div>
        <div style="position: absolute; inset: 18px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
        
        <!-- 角落裝飾徽章 -->
        <div style="position: absolute; top: 12px; left: 12px; width: 45px; height: 45px;">
          <div style="position: absolute; top: 0; left: 0; width: 28px; height: 3px; background: linear-gradient(90deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; top: 0; left: 0; width: 3px; height: 28px; background: linear-gradient(180deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; top: 8px; left: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
        </div>
        <div style="position: absolute; top: 12px; right: 12px; width: 45px; height: 45px;">
          <div style="position: absolute; top: 0; right: 0; width: 28px; height: 3px; background: linear-gradient(270deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; top: 0; right: 0; width: 3px; height: 28px; background: linear-gradient(180deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
        </div>
        <div style="position: absolute; bottom: 12px; left: 12px; width: 45px; height: 45px;">
          <div style="position: absolute; bottom: 0; left: 0; width: 28px; height: 3px; background: linear-gradient(90deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; bottom: 0; left: 0; width: 3px; height: 28px; background: linear-gradient(0deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; bottom: 8px; left: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
        </div>
        <div style="position: absolute; bottom: 12px; right: 12px; width: 45px; height: 45px;">
          <div style="position: absolute; bottom: 0; right: 0; width: 28px; height: 3px; background: linear-gradient(270deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; bottom: 0; right: 0; width: 3px; height: 28px; background: linear-gradient(0deg, ${COLORS.gold}, transparent);"></div>
          <div style="position: absolute; bottom: 8px; right: 8px; width: 8px; height: 8px; background: ${COLORS.gold}; transform: rotate(45deg);"></div>
        </div>
        
        ${createHeader('四時軍團戰略命理系統')}
        
        <!-- 頁面標題區域 - 增強設計 -->
        <div style="text-align: center; margin: 8px 0 ${isFirstPage ? '20px' : '24px'} 0; position: relative;">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 280px;
            height: 70px;
            background: radial-gradient(ellipse, ${COLORS.purple}12 0%, transparent 70%);
          "></div>
          
          <!-- 標題裝飾線 -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 50px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.goldDark});"></div>
              <div style="width: 6px; height: 6px; border: 1px solid ${COLORS.purple}; transform: rotate(45deg);"></div>
            </div>
            <span style="font-size: 11px; color: ${COLORS.purple}; letter-spacing: 6px; text-transform: uppercase;">DIVINE STARS</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 6px; height: 6px; border: 1px solid ${COLORS.purple}; transform: rotate(45deg);"></div>
              <div style="width: 50px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.goldDark});"></div>
            </div>
          </div>
          
          <h3 style="
            font-size: 30px; 
            font-family: ${FONTS.heading};
            color: ${COLORS.goldLight}; 
            margin: 0; 
            letter-spacing: 10px; 
            font-weight: 600;
            text-shadow: 0 2px 20px rgba(200, 170, 100, 0.25);
          ">
            神煞命格分析
          </h3>
          <p style="font-size: 12px; color: ${COLORS.textSecondary}; margin: 10px 0 0 0; letter-spacing: 2px;">
            命盤星曜詳解 · 共 ${shensha.length} 顆神煞星
          </p>
        </div>
        
        ${isFirstPage ? `
          <!-- 首頁：分類統計概覽 -->
          <div style="
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 22px;
            flex-wrap: wrap;
          ">
            ${Object.entries(categoryStats).map(([cat, count]) => {
              const config = categoryConfig[cat] || categoryConfig['特殊'];
              return `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  padding: 8px 16px;
                  background: linear-gradient(135deg, ${config.color}12 0%, ${config.color}05 100%);
                  border: 1px solid ${config.color}30;
                  border-radius: 25px;
                  box-shadow: ${config.borderGlow};
                ">
                  <span style="font-size: 14px;">${config.icon}</span>
                  <span style="font-size: 11px; color: ${config.colorLight}; font-weight: 500; letter-spacing: 1px;">${cat}</span>
                  <span style="
                    font-size: 12px;
                    color: ${COLORS.bgPrimary};
                    background: ${config.color};
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 700;
                    min-width: 20px;
                    text-align: center;
                  ">${count}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
        
        <!-- 神煞卡片列表 - 增強設計 -->
        <div style="display: flex; flex-direction: column; gap: 18px;">
          ${pageItems.map((item, idx) => {
            const category = item.category || '特殊';
            const catConfig = categoryConfig[category] || categoryConfig['特殊'];
            const rarity = item.rarity && rarityConfig[item.rarity] ? rarityConfig[item.rarity] : null;
            return `
              <div style="
                background: ${catConfig.gradient};
                border: 1px solid ${catConfig.color}30;
                border-radius: 16px;
                padding: 0;
                position: relative;
                overflow: hidden;
                box-shadow: 
                  0 8px 32px rgba(0, 0, 0, 0.2),
                  ${catConfig.borderGlow},
                  inset 0 1px 0 rgba(255, 255, 255, 0.04);
              ">
                <!-- 背景圖案 -->
                <div style="
                  position: absolute;
                  inset: 0;
                  ${catConfig.bgPattern};
                  pointer-events: none;
                "></div>
                
                <!-- 頂部發光邊條 -->
                <div style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 3px;
                  background: linear-gradient(90deg, transparent 5%, ${catConfig.color}80 50%, transparent 95%);
                "></div>
                
                <!-- 左側漸層色帶 -->
                <div style="
                  position: absolute;
                  left: 0;
                  top: 0;
                  bottom: 0;
                  width: 5px;
                  background: linear-gradient(180deg, ${catConfig.colorLight}, ${catConfig.color}, ${catConfig.color}60);
                "></div>
                
                <!-- 右上角大圖標裝飾 -->
                <div style="
                  position: absolute;
                  top: -15px;
                  right: -10px;
                  font-size: 80px;
                  opacity: 0.06;
                  transform: rotate(15deg);
                  pointer-events: none;
                ">${catConfig.icon}</div>
                
                <!-- 卡片內容 -->
                <div style="padding: 20px 24px 18px 28px; position: relative;">
                  <!-- 標題區 -->
                  <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 14px;">
                    <!-- 圖標容器 -->
                    <div style="
                      width: 48px;
                      height: 48px;
                      background: linear-gradient(135deg, ${catConfig.color}25 0%, ${catConfig.color}08 100%);
                      border: 2px solid ${catConfig.color}40;
                      border-radius: 12px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 4px 15px ${catConfig.color}20;
                      flex-shrink: 0;
                      overflow: hidden;
                    ">
                      ${(() => {
                        const iconPath = getShenshaIcon(item.name);
                        if (iconPath) {
                          return `<img src="${iconPath}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><span style="font-size: 24px; filter: drop-shadow(0 2px 6px ${catConfig.color}50); display: none;">${catConfig.icon}</span>`;
                        }
                        return `<span style="font-size: 24px; filter: drop-shadow(0 2px 6px ${catConfig.color}50);">${catConfig.icon}</span>`;
                      })()}
                    </div>
                    
                    <!-- 名稱與標籤 -->
                    <div style="flex: 1;">
                      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                        <span style="
                          font-size: 20px;
                          font-family: ${FONTS.heading};
                          color: ${COLORS.goldLight}; 
                          font-weight: 600; 
                          letter-spacing: 2px;
                          text-shadow: 0 1px 10px rgba(200, 170, 100, 0.2);
                        ">${item.name}</span>
                        
                        ${rarity ? `
                          <span style="
                            font-size: 9px;
                            color: ${COLORS.bgPrimary};
                            background: ${rarity.bgGradient};
                            padding: 3px 10px;
                            border-radius: 12px;
                            font-weight: 700;
                            letter-spacing: 0.5px;
                            box-shadow: 0 2px 10px ${rarity.glowColor};
                            display: flex;
                            align-items: center;
                            gap: 4px;
                          ">
                            <span>${rarity.badge}</span>
                            <span>${rarity.text}</span>
                          </span>
                        ` : ''}
                      </div>
                      
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <!-- 分類標籤 -->
                        <span style="
                          font-size: 10px;
                          color: ${catConfig.colorLight};
                          padding: 3px 12px;
                          background: ${catConfig.color}15;
                          border-radius: 15px;
                          border: 1px solid ${catConfig.color}35;
                          letter-spacing: 1px;
                        ">${catConfig.description}</span>
                        
                        ${item.position ? `
                          <span style="
                            font-size: 10px;
                            color: ${COLORS.gold};
                            display: flex;
                            align-items: center;
                            gap: 4px;
                          ">
                            <span style="opacity: 0.7;">📍</span>
                            <span>${item.position}</span>
                          </span>
                        ` : ''}
                      </div>
                    </div>
                    
                    <!-- 右側分類徽章 -->
                    <div style="
                      padding: 8px 14px;
                      background: linear-gradient(135deg, ${catConfig.color}20 0%, ${catConfig.color}08 100%);
                      border: 1px solid ${catConfig.color}40;
                      border-radius: 10px;
                      text-align: center;
                    ">
                      <div style="font-size: 10px; color: ${COLORS.textMuted}; margin-bottom: 2px; letter-spacing: 1px;">類別</div>
                      <div style="font-size: 13px; color: ${catConfig.colorLight}; font-weight: 600; letter-spacing: 2px;">${category}</div>
                    </div>
                  </div>
                  
                  ${item.effect ? `
                    <!-- 傳統意涵 -->
                    <div style="
                      padding: 14px 18px;
                      background: linear-gradient(135deg, rgba(10, 10, 18, 0.5) 0%, rgba(15, 15, 25, 0.3) 100%);
                      border-radius: 10px;
                      border-left: 3px solid ${catConfig.color}50;
                      margin-bottom: 12px;
                    ">
                      <p style="
                        font-size: 13px; 
                        color: ${COLORS.textSecondary}; 
                        margin: 0; 
                        line-height: 1.8;
                        letter-spacing: 0.5px;
                      ">${item.effect}</p>
                    </div>
                  ` : ''}
                  
                  ${item.modernMeaning ? `
                    <!-- 現代解讀區塊 - 增強設計 -->
                    <div style="
                      padding: 14px 18px;
                      background: linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(96, 165, 250, 0.02) 100%);
                      border-radius: 10px;
                      border: 1px solid rgba(96, 165, 250, 0.2);
                      position: relative;
                      overflow: hidden;
                    ">
                      <!-- 裝飾背景 -->
                      <div style="
                        position: absolute;
                        top: -20px;
                        right: -20px;
                        width: 60px;
                        height: 60px;
                        background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
                        pointer-events: none;
                      "></div>
                      
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div style="
                          width: 22px;
                          height: 22px;
                          background: linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(96, 165, 250, 0.1) 100%);
                          border-radius: 6px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        ">
                          <span style="font-size: 12px;">💡</span>
                        </div>
                        <span style="font-size: 11px; color: ${COLORS.blue}; letter-spacing: 2px; font-weight: 500;">現代解讀</span>
                      </div>
                      <p style="
                        font-size: 12px; 
                        color: ${COLORS.textSecondary}; 
                        margin: 0; 
                        line-height: 1.7;
                        letter-spacing: 0.3px;
                      ">${item.modernMeaning}</p>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- 頁面裝飾底部 -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 25px;
          gap: 15px;
        ">
          <div style="width: 80px; height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.border});"></div>
          <span style="font-size: 10px; color: ${COLORS.textMuted}; letter-spacing: 3px;">星曜指引 · 趨吉避凶</span>
          <div style="width: 80px; height: 1px; background: linear-gradient(270deg, transparent, ${COLORS.border});"></div>
        </div>
        
        ${createFooter(dateStr, `神煞分析 ${pageNum}/${shenshaPageCount}`, CHAPTERS.shensha, startPage + pageNum - 1, totalPages)}
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
  pageNum: number,
  totalPages: number = 1
): string => {
  const legionConfig = {
    year: { 
      name: '祖源軍團', 
      subtitle: '家族傳承 · 童年根基',
      icon: '👑', 
      color: '#fbbf24',
      colorLight: '#fef3c7',
      gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #fbbf24, #f59e0b)',
      bgPattern: 'radial-gradient(circle at 10% 10%, rgba(251, 191, 36, 0.08) 0%, transparent 30%)'
    },
    month: { 
      name: '關係軍團', 
      subtitle: '社交人脈 · 事業發展',
      icon: '🤝', 
      color: '#4ade80',
      colorLight: '#dcfce7',
      gradient: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #4ade80, #22c55e)',
      bgPattern: 'radial-gradient(circle at 90% 10%, rgba(74, 222, 128, 0.08) 0%, transparent 30%)'
    },
    day: { 
      name: '核心軍團', 
      subtitle: '核心自我 · 婚姻感情',
      icon: '⭐', 
      color: '#c084fc',
      colorLight: '#f3e8ff',
      gradient: 'linear-gradient(135deg, rgba(192, 132, 252, 0.12) 0%, rgba(192, 132, 252, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #c084fc, #a855f7)',
      bgPattern: 'radial-gradient(circle at 50% 90%, rgba(192, 132, 252, 0.08) 0%, transparent 30%)'
    },
    hour: { 
      name: '未來軍團', 
      subtitle: '未來規劃 · 子女傳承',
      icon: '🚀', 
      color: '#f97316',
      colorLight: '#ffedd5',
      gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.02) 100%)',
      borderGradient: 'linear-gradient(180deg, #f97316, #ea580c)',
      bgPattern: 'radial-gradient(circle at 90% 90%, rgba(249, 115, 22, 0.08) 0%, transparent 30%)'
    }
  };
  
  const config = legionConfig[type];
  const pillarLabels = { year: '年柱', month: '月柱', day: '日柱', hour: '時柱' };
  
  // 處理故事內容，智能分段
  const storyParagraphs = story.split('\n').filter(p => p.trim());
  const formattedStory = storyParagraphs.map((para, idx) => {
    // 首段使用首字下沉效果
    if (idx === 0 && para.length > 10) {
      const firstChar = para.charAt(0);
      const restText = para.slice(1);
      return `
        <p style="
          font-size: 14px;
          color: ${COLORS.textSecondary};
          line-height: 2.2;
          margin: 0 0 18px 0;
          text-align: justify;
          letter-spacing: 0.6px;
        ">
          <span style="
            float: left;
            font-size: 48px;
            font-family: ${FONTS.heading};
            color: ${config.color};
            line-height: 1;
            margin: 0 12px 0 0;
            text-shadow: 0 2px 10px ${config.color}30;
          ">${firstChar}</span>${restText}
        </p>
      `;
    }
    return `
      <p style="
        font-size: 14px;
        color: ${COLORS.textSecondary};
        line-height: 2.2;
        margin: 0 0 16px 0;
        text-align: justify;
        letter-spacing: 0.6px;
        text-indent: 2em;
      ">${para}</p>
    `;
  }).join('');

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
      <!-- 多層背景裝飾 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          ${config.bgPattern},
          radial-gradient(ellipse 70% 50% at 50% 15%, ${config.color}06 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 15% 85%, ${COLORS.gold}04 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 85% 85%, ${config.color}04 0%, transparent 50%);
        pointer-events: none;
      "></div>
      
      <!-- 精緻雙層邊框 -->
      <div style="position: absolute; inset: 12px; border: 1px solid ${config.color}15; pointer-events: none;"></div>
      <div style="position: absolute; inset: 18px; border: 1px solid ${COLORS.border}; pointer-events: none;"></div>
      
      <!-- 角落裝飾 - 漸變色彩 -->
      <div style="position: absolute; top: 12px; left: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; top: 0; left: 0; width: 25px; height: 3px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; top: 0; left: 0; width: 3px; height: 25px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; top: 8px; left: 8px; width: 6px; height: 6px; background: ${config.color}; border-radius: 50%; box-shadow: 0 0 8px ${config.color};"></div>
      </div>
      <div style="position: absolute; top: 12px; right: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; top: 0; right: 0; width: 25px; height: 3px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; top: 0; right: 0; width: 3px; height: 25px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; background: ${config.color}; border-radius: 50%; box-shadow: 0 0 8px ${config.color};"></div>
      </div>
      <div style="position: absolute; bottom: 12px; left: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; bottom: 0; left: 0; width: 25px; height: 3px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 3px; height: 25px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; bottom: 8px; left: 8px; width: 6px; height: 6px; background: ${config.color}; border-radius: 50%; box-shadow: 0 0 8px ${config.color};"></div>
      </div>
      <div style="position: absolute; bottom: 12px; right: 12px; width: 35px; height: 35px;">
        <div style="position: absolute; bottom: 0; right: 0; width: 25px; height: 3px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 3px; height: 25px; background: ${config.borderGradient}; border-radius: 2px;"></div>
        <div style="position: absolute; bottom: 8px; right: 8px; width: 6px; height: 6px; background: ${config.color}; border-radius: 50%; box-shadow: 0 0 8px ${config.color};"></div>
      </div>
      
      ${createHeader('四時軍團戰略命理系統')}
      
      <!-- 軍團標題卡片 - 增強設計 -->
      <div style="
        text-align: center;
        padding: 30px 40px;
        background: ${config.gradient};
        border: 1px solid ${config.color}25;
        border-radius: 20px;
        margin-bottom: 22px;
        position: relative;
        box-shadow: 
          0 15px 50px rgba(0, 0, 0, 0.25),
          0 0 0 1px ${config.color}10,
          inset 0 1px 0 ${config.color}15;
      ">
        <!-- 頂部發光線 -->
        <div style="
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${config.color}, transparent);
          border-radius: 1px;
        "></div>
        
        <!-- 背景紋理 -->
        <div style="
          position: absolute;
          inset: 0;
          background: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              ${config.color}03 20px,
              ${config.color}03 40px
            );
          border-radius: 20px;
          pointer-events: none;
        "></div>
        
        <!-- 圖標容器 -->
        <div style="
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          background: radial-gradient(circle, ${config.color}20 0%, transparent 70%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            position: absolute;
            inset: 0;
            border: 2px solid ${config.color}30;
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
          <span style="
            font-size: 48px;
            filter: drop-shadow(0 0 20px ${config.color}60);
          ">${config.icon}</span>
        </div>
        
        <h3 style="
          font-size: 32px;
          font-family: ${FONTS.heading};
          color: ${config.color};
          margin: 0 0 8px 0;
          font-weight: 600;
          letter-spacing: 10px;
          text-shadow: 0 0 30px ${config.color}40;
          position: relative;
        ">${config.name}</h3>
        
        <p style="font-size: 12px; color: ${COLORS.textMuted}; margin: 0 0 18px 0; letter-spacing: 4px;">${config.subtitle}</p>
        
        <!-- 柱位資訊卡 -->
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 25px;
          padding: 16px 40px;
          background: linear-gradient(135deg, rgba(10, 10, 15, 0.7) 0%, rgba(15, 15, 22, 0.6) 100%);
          border-radius: 40px;
          border: 1px solid ${config.color}20;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
        ">
          <div style="text-align: center;">
            <p style="font-size: 9px; color: ${config.color}80; margin: 0 0 5px 0; letter-spacing: 3px; text-transform: uppercase;">${pillarLabels[type]}</p>
            <span style="
              font-size: 30px; 
              color: ${COLORS.goldLight}; 
              letter-spacing: 8px; 
              font-family: ${FONTS.heading};
              text-shadow: 0 0 15px ${COLORS.gold}40;
            ">${pillar.stem}${pillar.branch}</span>
          </div>
          
          <div style="width: 1px; height: 45px; background: linear-gradient(180deg, transparent, ${config.color}40, transparent);"></div>
          
          <div style="text-align: center;">
            <p style="font-size: 9px; color: ${config.color}80; margin: 0 0 5px 0; letter-spacing: 3px; text-transform: uppercase;">納音五行</p>
            <span style="font-size: 16px; color: ${COLORS.textSecondary}; letter-spacing: 1px;">${nayin}</span>
          </div>
        </div>
      </div>
      
      <!-- 故事內容區 - 書卷風格 -->
      <div style="
        background: linear-gradient(180deg, rgba(25, 25, 38, 0.9) 0%, rgba(20, 20, 30, 0.85) 100%);
        border: 1px solid ${config.color}15;
        border-radius: 16px;
        padding: 30px 35px;
        position: relative;
        box-shadow: 
          0 8px 30px rgba(0, 0, 0, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.02);
      ">
        <!-- 頂部裝飾條 -->
        <div style="
          position: absolute;
          top: -1px;
          left: 30px;
          right: 30px;
          height: 3px;
          background: linear-gradient(90deg, transparent, ${config.color}60, ${config.color}, ${config.color}60, transparent);
          border-radius: 0 0 3px 3px;
        "></div>
        
        <!-- 側邊裝飾線 -->
        <div style="
          position: absolute;
          left: 0;
          top: 30px;
          bottom: 30px;
          width: 4px;
          background: linear-gradient(180deg, ${config.color}, ${config.color}50, ${config.color});
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 12px ${config.color}40;
        "></div>
        
        <!-- 標題區 -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          padding-bottom: 15px;
          border-bottom: 1px solid ${COLORS.border};
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 8px;
              height: 24px;
              background: ${config.borderGradient};
              border-radius: 4px;
              box-shadow: 0 0 10px ${config.color}50;
            "></div>
            <span style="
              font-size: 17px;
              font-family: ${FONTS.heading};
              color: ${COLORS.gold};
              letter-spacing: 3px;
            ">軍團故事</span>
          </div>
          
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            background: ${config.color}10;
            border: 1px solid ${config.color}20;
            border-radius: 20px;
          ">
            <span style="font-size: 12px; color: ${config.color};">✦</span>
            <span style="font-size: 10px; color: ${COLORS.textMuted}; letter-spacing: 1px;">AI 命理敘事</span>
          </div>
        </div>
        
        <!-- 故事內容 - 首字下沉效果 -->
        <div style="padding-left: 12px;">
          ${formattedStory || `
            <p style="
              font-size: 14px;
              color: ${COLORS.textSecondary};
              line-height: 2.2;
              text-align: justify;
              letter-spacing: 0.6px;
            ">${story}</p>
          `}
        </div>
        
        <!-- 底部裝飾區 -->
        <div style="
          margin-top: 25px;
          padding-top: 18px;
          border-top: 1px solid ${COLORS.border};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        ">
          <div style="width: 40px; height: 1px; background: linear-gradient(90deg, transparent, ${config.color}50);"></div>
          <span style="font-size: 16px; color: ${config.color}60;">❖</span>
          <p style="
            font-size: 10px; 
            color: ${COLORS.textMuted}; 
            margin: 0; 
            font-style: italic; 
            letter-spacing: 1.5px;
          ">
            此故事根據命盤特徵生成，僅供參考與啟發
          </p>
          <span style="font-size: 16px; color: ${config.color}60;">❖</span>
          <div style="width: 40px; height: 1px; background: linear-gradient(270deg, transparent, ${config.color}50);"></div>
        </div>
      </div>
      
      ${createFooter(dateStr, `${config.name}敘事`, CHAPTERS[`story${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof CHAPTERS], pageNum, totalPages)}
    </div>
  `;
};

// ========================
// 字體載入檢測 - 優化中文字體支援
// ========================
const waitForFonts = async (timeout = 2000): Promise<boolean> => {
  console.log('[PDF] Waiting for fonts to load...');
  
  try {
    // 快速檢查字體 API，減少等待時間
    if (document.fonts && typeof document.fonts.ready !== 'undefined') {
      await Promise.race([
        document.fonts.ready,
        new Promise(resolve => setTimeout(resolve, timeout))
      ]);
      console.log('[PDF] Browser fonts API ready');
    }
    
    // 簡化字體預載入 - 只使用單一測試元素
    const fontTestContainer = document.createElement('div');
    fontTestContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      visibility: hidden;
      font-size: 48px;
    `;
    fontTestContainer.innerHTML = `
      <span style="font-family: ${FONTS.heading}">虹靈御所</span>
      <span style="font-family: ${FONTS.base}">八字命理</span>
    `;
    
    document.body.appendChild(fontTestContainer);
    
    // 減少等待時間 - 大部分字體已經透過 Google Fonts 預載入
    await new Promise(resolve => setTimeout(resolve, 100));
    
    document.body.removeChild(fontTestContainer);
    console.log('[PDF] Chinese fonts preloaded successfully');
    return true;
    
  } catch (e) {
    console.warn('[PDF] Font loading check failed:', e);
    // 縮短 fallback 時間
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
};

// ========================
// 圖片預載入
// ========================
const waitForImages = async (container: HTMLElement, timeout = 1500): Promise<void> => {
  console.log('[PDF] Waiting for images to load...');
  const images = container.querySelectorAll('img');
  if (images.length === 0) {
    console.log('[PDF] No images found');
    return;
  }

  // 平行處理圖片載入，使用較短的 timeout
  const imagePromises = Array.from(images).map(img => {
    if (img.complete && img.naturalHeight > 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const timeoutId = setTimeout(() => {
        img.removeEventListener('load', handler);
        img.removeEventListener('error', handler);
        resolve();
      }, 800); // 單張圖片最多等 800ms
      
      const handler = () => {
        clearTimeout(timeoutId);
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
const createDisclaimerPage = (dateStr: string, totalPages: number): string => {
  const pageNum = totalPages + 1;
  return `
    <div style="
      width: 794px; 
      height: 1123px; 
      background-color: ${COLORS.bgPrimary}; 
      color: ${COLORS.textSecondary}; 
      font-family: ${FONTS.base};
      padding: 45px;
      display: flex;
      flex-direction: column;
    ">
      ${createHeader('服務條款與免責聲明', CHAPTERS.toc, pageNum, totalPages + 1)}
      
      <div style="flex: 1; overflow-y: auto; padding: 20px; line-height: 1.8; font-size: 12px;">
        <h3 style="font-family: ${FONTS.heading}; color: ${COLORS.gold}; font-size: 18px; letter-spacing: 2px; margin-bottom: 20px; text-align: center;">虹靈御所｜個人命理報告服務條款與免責聲明</h3>
        <p style="margin-bottom: 15px;">歡迎您使用虹靈御所（Rainbow Sanctuary）的個人命理分析服務。在您深入探索本報告之前，請仔細閱讀以下條款，它將幫助您更清晰地理解本服務的性質與範疇。</p>
        
        <ol style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 15px;">
            <strong>服務性質</strong>：本報告是基於傳統的八字命理學術，結合獨創的「四時軍團系統」進行的個人特質與潛能分析。我們的目標是提供一個全新的視角，協助您「看見」自己的內在結構、「感受」生命的可能性，並從中找到「療癒」與成長的力量。這是一份自我探索的工具，而非預測未來的絕對定論。
          </li>
          <li style="margin-bottom: 15px;">
            <strong>非專業建議替代品</strong>：本報告的任何內容，均不應被視為醫療、金融、法律、心理治療等專業領域的建議。當您面臨人生重大決策（如健康、財務、法律等問題）時，我們強烈建議您尋求相關領域合格專業人士的協助。
          </li>
          <li style="margin-bottom: 15px;">
            <strong>資訊的局限性</strong>：命理分析的準確性受多種因素影響，包含但不限於您提供的出生資訊的精確度。本報告的解讀與觀點僅為一種可能性，不保證完全符合您過去、現在或未來的實際情況。生命是動態且充滿變數的，個人的自由意志與後天努力，將對人生軌跡產生關鍵影響。
          </li>
          <li style="margin-bottom: 15px;">
            <strong>個人責任</strong>：您對本報告資訊的理解、詮釋及使用，皆為您個人的選擇與責任。虹靈御所對於您根據本報告所採取的任何行動及其結果，不承擔任何形式的法律或道義責任。
          </li>
          <li style="margin-bottom: 15px;">
            <strong>版權聲明</strong>：本報告的全部內容，包括但不限於文字、圖像、圖表及整體設計，其版權均為虹靈御所所有。未經書面授權，嚴禁以任何形式複製、轉載、修改或公開傳播。
          </li>
        </ol>

        <p style="margin-top: 25px; text-align: center; font-style: italic; color: ${COLORS.goldDark};">我們的承諾是「Always Bring Care & Truth」。我們致力於提供真誠且有溫度的分析，陪伴您走在自我探索的道路上。感謝您的信任與理解。</p>
      </div>

      ${createFooter(dateStr, '免責聲明', CHAPTERS.toc, pageNum, totalPages + 1)}
    </div>
  `;
};

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
      scale: 1.5, // 降低 scale 從 2 到 1.5，顯著提升速度，品質仍足夠
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a0a0f',
      logging: false,
      windowWidth: 794,
      windowHeight: 1123,
      removeContainer: false,
      imageTimeout: 800, // 圖片載入超時 800ms
      
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
// 主要導出函數 - 支援進度回調
// ========================
export const generatePDF = async (
  _elementId: string, 
  fileName: string, 
  coverData?: CoverPageData, 
  reportData?: ReportData,
  options: PdfOptions = defaultPdfOptions,
  onProgress?: PdfProgressCallback
) => {
  const reportProgress = (progress: number, stage: string) => {
    onProgress?.(progress, stage);
    console.log(`[PDF] Progress: ${progress}% - ${stage}`);
  };
  
  reportProgress(0, '準備中...');
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
    // Step 1: 等待字體載入 (5%)
    reportProgress(5, '載入字體...');
    await waitForFonts();
    
    // Step 1.5: 預載入所有頭像圖片 (10%)
    reportProgress(10, '預載入圖片...');
    console.log('[PDF] Preloading avatar images...');
    const avatarUrls = collectAvatarUrls(reportData.pillars);
    const preloadedImages = await preloadImages(avatarUrls);
    console.log(`[PDF] Preloaded ${preloadedImages.size} images, success: ${[...preloadedImages.values()].filter(v => v).length}`);
    
    // Step 2: 創建報告 HTML (15%)
    reportProgress(15, '建立報告結構...');
    console.log('[PDF] Creating report container...');
    container = createReportContainer(reportData, coverData, options);
    container.setAttribute('data-pdf-container', 'true');
    console.log('[PDF] Container created, children count:', container.children.length);
    
    // Step 3: 等待圖片載入 (20%)
    reportProgress(20, '載入頁面資源...');
    await waitForImages(container);
    
    // Step 4: 減少 DOM 穩定等待時間
    console.log('[PDF] Waiting for DOM to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 150)); // 從 500ms 減少到 150ms
    
    // Step 5: 獲取所有頁面 (25%)
    reportProgress(25, '準備頁面...');
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
    
    // Step 6: 創建 PDF (30%)
    reportProgress(30, '初始化 PDF...');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true // 啟用壓縮
    });
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    let renderedPages = 0;
    
    // 計算每頁進度增量 (30% -> 95%)
    const progressPerPage = pages.length > 0 ? 65 / pages.length : 65;
    
    // Step 7: 逐頁渲染
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const currentProgress = Math.round(30 + (i * progressPerPage));
      reportProgress(currentProgress, `渲染頁面 ${i + 1}/${pages.length}...`);
      console.log(`[PDF] Processing page ${i + 1}/${pages.length}...`);
      
      try {
        const canvas = await safeHtml2Canvas(page, i);
        
        if (!canvas) {
          console.warn(`[PDF] Page ${i + 1} rendering returned null, skipping`);
          continue;
        }
        
        // 轉換為圖片 - 使用較低品質加速
        let imgData: string;
        try {
          imgData = canvas.toDataURL('image/jpeg', 0.85); // 從 0.92 降到 0.85
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
    
    // Step 8: 檢查結果 (95%)
    reportProgress(95, '完成最終處理...');
    if (renderedPages === 0) {
      throw new Error('No pages were successfully rendered to PDF');
    }
    
    // Step 9: 添加免責聲明頁面
    reportProgress(95, '正在加入免責聲明...');
    console.log(`[PDF] Adding disclaimer page...`);
    const currentDateStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
    const disclaimerHtml = createDisclaimerPage(currentDateStr, pages.length);
    const disclaimerContainer = document.createElement('div');
    disclaimerContainer.innerHTML = disclaimerHtml;
    document.body.appendChild(disclaimerContainer);
    await waitForImages(disclaimerContainer);
    const disclaimerCanvas = await safeHtml2Canvas(disclaimerContainer, pages.length);
    if (disclaimerCanvas) {
      pdf.addPage();
      const imgData = disclaimerCanvas.toDataURL('image/jpeg', 0.8);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    }
    document.body.removeChild(disclaimerContainer);

    pdf.save(fileName);
    reportProgress(100, '完成！');
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
