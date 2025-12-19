import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

// 創建報告 HTML 容器
const createReportContainer = (reportData: ReportData, coverData?: CoverPageData): HTMLDivElement => {
  const container = document.createElement('div');
  container.style.cssText = `
    width: 794px;
    background: linear-gradient(135deg, #0f0f14 0%, #1a1a24 50%, #0f0f14 100%);
    color: #e5e5e5;
    font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
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

  // 封面頁
  const coverPage = `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, #0a0a0f 0%, #141420 50%, #0a0a0f 100%);
      position: relative;
      padding: 60px 50px;
      box-sizing: border-box;
      page-break-after: always;
    ">
      <!-- 邊框裝飾 -->
      <div style="
        position: absolute;
        inset: 20px;
        border: 2px solid rgba(180, 140, 80, 0.5);
        pointer-events: none;
      "></div>
      <div style="
        position: absolute;
        inset: 25px;
        border: 1px solid rgba(180, 140, 80, 0.3);
        pointer-events: none;
      "></div>
      
      <!-- 角落裝飾 -->
      <div style="position: absolute; top: 25px; left: 25px; width: 30px; height: 30px; border-left: 2px solid #b48c50; border-top: 2px solid #b48c50;"></div>
      <div style="position: absolute; top: 25px; right: 25px; width: 30px; height: 30px; border-right: 2px solid #b48c50; border-top: 2px solid #b48c50;"></div>
      <div style="position: absolute; bottom: 25px; left: 25px; width: 30px; height: 30px; border-left: 2px solid #b48c50; border-bottom: 2px solid #b48c50;"></div>
      <div style="position: absolute; bottom: 25px; right: 25px; width: 30px; height: 30px; border-right: 2px solid #b48c50; border-bottom: 2px solid #b48c50;"></div>
      
      <!-- 主標題 -->
      <div style="text-align: center; margin-top: 80px;">
        <h1 style="
          font-size: 48px;
          color: #c8aa64;
          margin: 0 0 15px 0;
          font-weight: bold;
          letter-spacing: 8px;
          text-shadow: 0 2px 10px rgba(200, 170, 100, 0.3);
        ">虹靈御所</h1>
        <p style="
          font-size: 24px;
          color: #a08c5a;
          margin: 0;
          letter-spacing: 4px;
        ">八字人生兵法命盤</p>
        <div style="
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #b48c50, transparent);
          margin: 30px auto;
        "></div>
      </div>
      
      <!-- 命主資訊 -->
      <div style="text-align: center; margin-top: 60px;">
        <p style="font-size: 16px; color: #8c8270; margin: 0 0 10px 0;">命主</p>
        <h2 style="
          font-size: 42px;
          color: #dcc88c;
          margin: 0 0 10px 0;
          font-weight: bold;
          letter-spacing: 6px;
        ">${reportData.name}</h2>
        <p style="font-size: 14px; color: #787878; margin: 0;">${genderText}</p>
      </div>
      
      <!-- 生辰資訊 -->
      <div style="text-align: center; margin-top: 40px;">
        <div style="
          width: 150px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #645032, transparent);
          margin: 0 auto 15px;
        "></div>
        <p style="font-size: 12px; color: #8c8c8c; margin: 0 0 8px 0;">出生時間</p>
        <p style="font-size: 18px; color: #b4aa8c; margin: 0;">${reportData.birthDate}</p>
      </div>
      
      <!-- 四柱 -->
      <div style="margin-top: 50px;">
        <div style="
          width: 200px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #a08050, transparent);
          margin: 0 auto 20px;
        "></div>
        <p style="text-align: center; font-size: 14px; color: #8c8270; margin: 0 0 20px 0;">四柱八字</p>
        <div style="display: flex; justify-content: center; gap: 30px;">
          ${['year', 'month', 'day', 'hour'].map((key, idx) => {
            const pillar = reportData.pillars[key as keyof typeof reportData.pillars];
            const labels = ['年柱', '月柱', '日柱', '時柱'];
            return `
              <div style="text-align: center;">
                <p style="font-size: 12px; color: #646464; margin: 0 0 8px 0;">${labels[idx]}</p>
                <div style="
                  background: rgba(30, 30, 40, 0.8);
                  border: 1px solid rgba(140, 110, 70, 0.5);
                  border-radius: 8px;
                  padding: 15px 20px;
                ">
                  <p style="font-size: 28px; color: #c8b48c; margin: 0;">${pillar.stem}</p>
                  <div style="width: 30px; height: 1px; background: rgba(180, 140, 80, 0.3); margin: 8px auto;"></div>
                  <p style="font-size: 28px; color: #b4a078; margin: 0;">${pillar.branch}</p>
                </div>
                <p style="font-size: 11px; color: #787864; margin: 8px 0 0 0;">${reportData.nayin[key as keyof typeof reportData.nayin]}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <!-- 印章 -->
      <div style="
        position: absolute;
        right: 80px;
        bottom: 120px;
        width: 80px;
        height: 80px;
        border: 3px solid #b43232;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 66px;
          height: 66px;
          border: 1.5px solid #b43232;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            font-size: 24px;
            color: #b43232;
            font-weight: bold;
            letter-spacing: 2px;
          ">御所</span>
        </div>
      </div>
      
      <!-- 底部 -->
      <div style="
        position: absolute;
        bottom: 50px;
        left: 50px;
        right: 50px;
        text-align: center;
      ">
        <div style="
          width: calc(100% - 40px);
          height: 1px;
          background: linear-gradient(90deg, transparent, #8c6e3c, transparent);
          margin: 0 auto 15px;
        "></div>
        <p style="font-size: 11px; color: #646464; margin: 0 0 5px 0;">命理展示的是一條「相對好走但不一定是你要走的路」</p>
        <p style="font-size: 11px; color: #646464; margin: 0;">選擇權在於你</p>
        <p style="font-size: 10px; color: #505050; margin: 15px 0 0 0;">${dateStr} 製表</p>
      </div>
    </div>
  `;

  // 四柱詳解頁
  const pillarLabels = {
    year: { name: '年柱', legion: '祖源軍團', icon: '👑' },
    month: { name: '月柱', legion: '關係軍團', icon: '🤝' },
    day: { name: '日柱', legion: '核心軍團', icon: '⭐' },
    hour: { name: '時柱', legion: '未來軍團', icon: '🚀' }
  };

  const pillarsPage = `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, #0f0f14 0%, #141420 100%);
      position: relative;
      padding: 40px 50px;
      box-sizing: border-box;
      page-break-after: always;
    ">
      <!-- 頁眉 -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-size: 18px; color: #c8aa64; margin: 0 0 5px 0;">虹靈御所八字人生兵法</h2>
        <p style="font-size: 11px; color: #8c8c8c; margin: 0;">四時軍團戰略命理系統</p>
        <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #a08050, transparent); margin-top: 15px;"></div>
      </div>
      
      <!-- 標題 -->
      <h3 style="font-size: 20px; color: #c8aa64; text-align: center; margin: 20px 0 30px 0;">四柱命盤詳解</h3>
      
      <!-- 四柱卡片 -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
        ${(['year', 'month', 'day', 'hour'] as const).map(key => {
          const pillar = reportData.pillars[key];
          const nayin = reportData.nayin[key];
          const tenGod = reportData.tenGods?.[key];
          const hidden = reportData.hiddenStems?.[key] || [];
          const label = pillarLabels[key];
          return `
            <div style="
              background: rgba(25, 25, 35, 0.8);
              border: 1px solid rgba(140, 110, 70, 0.4);
              border-radius: 10px;
              padding: 20px;
            ">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 20px;">${label.icon}</span>
                <span style="font-size: 14px; color: #b4965a;">${label.name} (${label.legion})</span>
              </div>
              <div style="text-align: center; margin-bottom: 15px;">
                <span style="font-size: 32px; color: #dcc88c; letter-spacing: 4px;">${pillar.stem}${pillar.branch}</span>
              </div>
              <div style="font-size: 12px; color: #a0967a; margin-bottom: 8px;">
                <span style="color: #787864;">納音：</span>${nayin}
              </div>
              ${tenGod ? `
                <div style="font-size: 12px; color: #a0967a; margin-bottom: 8px;">
                  <span style="color: #787864;">十神：</span>${tenGod.stem} / ${tenGod.branch}
                </div>
              ` : ''}
              ${hidden.length > 0 ? `
                <div style="font-size: 11px; color: #787864;">
                  <span>藏干：</span>${hidden.join('、')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- 五行分布 -->
      ${reportData.wuxing ? `
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 16px; color: #c8aa64; margin: 0 0 15px 0;">五行分布</h4>
          <div style="display: flex; gap: 20px;">
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
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: ${el.color}20;
                    border: 2px solid ${el.color}60;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 8px;
                  ">
                    <span style="font-size: 18px; color: ${el.color}; font-weight: bold;">${el.name}</span>
                  </div>
                  <p style="font-size: 14px; color: #a0a0a0; margin: 0;">${value}</p>
                  <p style="font-size: 11px; color: #787878; margin: 4px 0 0 0;">${pct}%</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- 陰陽比例 -->
      ${reportData.yinyang ? `
        <div style="margin-bottom: 30px;">
          <h4 style="font-size: 16px; color: #c8aa64; margin: 0 0 15px 0;">陰陽比例</h4>
          <div style="
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
            display: flex;
            background: #1e1e28;
          ">
            <div style="
              width: ${(reportData.yinyang.yang / (reportData.yinyang.yang + reportData.yinyang.yin)) * 100}%;
              background: linear-gradient(90deg, #c8b464, #a08c50);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="font-size: 12px; color: #1a1a1a; font-weight: bold;">陽 ${reportData.yinyang.yang}</span>
            </div>
            <div style="
              flex: 1;
              background: linear-gradient(90deg, #5050a0, #6464c8);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="font-size: 12px; color: #e0e0e0; font-weight: bold;">陰 ${reportData.yinyang.yin}</span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <!-- 頁腳 -->
      <div style="
        position: absolute;
        bottom: 30px;
        left: 50px;
        right: 50px;
      ">
        <div style="width: 100%; height: 1px; background: rgba(100, 80, 50, 0.5); margin-bottom: 10px;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #646464;">
          <span>${dateStr}</span>
          <span>© 虹靈御所｜超烜創意</span>
          <span>第 2 頁</span>
        </div>
      </div>
    </div>
  `;

  // 神煞分析頁
  const shenshaPages = reportData.shensha && reportData.shensha.length > 0 ? 
    createShenshaPages(reportData.shensha, dateStr) : '';

  // 軍團故事頁
  const storyPages = (['year', 'month', 'day', 'hour'] as const)
    .filter(type => reportData.legionStories?.[type])
    .map((type, idx) => createStoryPage(
      type,
      reportData.legionStories![type]!,
      reportData.pillars[type],
      reportData.nayin[type],
      dateStr,
      3 + (reportData.shensha ? Math.ceil(reportData.shensha.length / 6) : 0) + idx
    ))
    .join('');

  container.innerHTML = coverPage + pillarsPage + shenshaPages + storyPages;
  return container;
};

// 創建神煞分析頁
const createShenshaPages = (shensha: ShenshaItem[], dateStr: string): string => {
  const itemsPerPage = 6;
  const pages: string[] = [];
  
  const categoryColors: Record<string, string> = {
    '吉神': '#4ade80',
    '凶神': '#f87171',
    '貴人': '#c084fc',
    '桃花': '#f472b6',
    '學堂': '#60a5fa',
    '特殊': '#fbbf24'
  };

  const rarityConfig: Record<string, { text: string; color: string }> = {
    'SSR': { text: '傳說', color: '#fbbf24' },
    'SR': { text: '稀有', color: '#c084fc' },
    'R': { text: '精良', color: '#60a5fa' },
    'N': { text: '普通', color: '#9ca3af' }
  };
  
  for (let i = 0; i < shensha.length; i += itemsPerPage) {
    const pageItems = shensha.slice(i, i + itemsPerPage);
    const pageNum = Math.floor(i / itemsPerPage) + 3;
    
    pages.push(`
      <div style="
        width: 794px;
        min-height: 1123px;
        background: linear-gradient(180deg, #0f0f14 0%, #141420 100%);
        position: relative;
        padding: 40px 50px;
        box-sizing: border-box;
        page-break-after: always;
      ">
        <!-- 頁眉 -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="font-size: 18px; color: #c8aa64; margin: 0 0 5px 0;">虹靈御所八字人生兵法</h2>
          <p style="font-size: 11px; color: #8c8c8c; margin: 0;">四時軍團戰略命理系統</p>
          <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #a08050, transparent); margin-top: 15px;"></div>
        </div>
        
        <!-- 標題 -->
        <h3 style="font-size: 20px; color: #c8aa64; text-align: center; margin: 20px 0 30px 0;">
          神煞分析 ${i > 0 ? `(續 ${Math.floor(i / itemsPerPage) + 1})` : ''}
        </h3>
        
        <!-- 神煞卡片 -->
        <div style="display: flex; flex-direction: column; gap: 15px;">
          ${pageItems.map(item => {
            const category = item.category || '特殊';
            const catColor = categoryColors[category] || categoryColors['特殊'];
            const rarity = item.rarity && rarityConfig[item.rarity] ? rarityConfig[item.rarity] : null;
            return `
              <div style="
                background: rgba(25, 25, 35, 0.8);
                border: 1px solid rgba(100, 80, 60, 0.4);
                border-left: 4px solid ${catColor};
                border-radius: 8px;
                padding: 15px 20px;
              ">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <span style="font-size: 16px; color: #dcc88c; font-weight: bold;">${item.name}</span>
                  ${rarity ? `<span style="font-size: 10px; color: ${rarity.color}; background: ${rarity.color}20; padding: 2px 6px; border-radius: 4px;">${rarity.text}</span>` : ''}
                  <span style="font-size: 11px; color: ${catColor}; margin-left: auto;">${category}</span>
                </div>
                ${item.position ? `<p style="font-size: 12px; color: #a0967a; margin: 0 0 6px 0;">落於：${item.position}</p>` : ''}
                ${item.effect ? `<p style="font-size: 12px; color: #96918a; margin: 0 0 6px 0; line-height: 1.5;">${item.effect}</p>` : ''}
                ${item.modernMeaning ? `<p style="font-size: 11px; color: #787872; margin: 0; line-height: 1.4;">現代解讀：${item.modernMeaning}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- 頁腳 -->
        <div style="
          position: absolute;
          bottom: 30px;
          left: 50px;
          right: 50px;
        ">
          <div style="width: 100%; height: 1px; background: rgba(100, 80, 50, 0.5); margin-bottom: 10px;"></div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #646464;">
            <span>${dateStr}</span>
            <span>© 虹靈御所｜超烜創意</span>
            <span>第 ${pageNum} 頁</span>
          </div>
        </div>
      </div>
    `);
  }
  
  return pages.join('');
};

// 創建軍團故事頁
const createStoryPage = (
  type: 'year' | 'month' | 'day' | 'hour',
  story: string,
  pillar: { stem: string; branch: string },
  nayin: string,
  dateStr: string,
  pageNum: number
): string => {
  const legionConfig = {
    year: { name: '祖源軍團', icon: '👑', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.1)' },
    month: { name: '關係軍團', icon: '🤝', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.1)' },
    day: { name: '核心軍團', icon: '⭐', color: '#c084fc', bgColor: 'rgba(192, 132, 252, 0.1)' },
    hour: { name: '未來軍團', icon: '🚀', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' }
  };
  
  const config = legionConfig[type];
  
  return `
    <div style="
      width: 794px;
      min-height: 1123px;
      background: linear-gradient(180deg, #0f0f14 0%, #141420 100%);
      position: relative;
      padding: 40px 50px;
      box-sizing: border-box;
      page-break-after: always;
    ">
      <!-- 頁眉 -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-size: 18px; color: #c8aa64; margin: 0 0 5px 0;">虹靈御所八字人生兵法</h2>
        <p style="font-size: 11px; color: #8c8c8c; margin: 0;">四時軍團戰略命理系統</p>
        <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #a08050, transparent); margin-top: 15px;"></div>
      </div>
      
      <!-- 軍團標題 -->
      <div style="
        text-align: center;
        padding: 30px;
        background: ${config.bgColor};
        border: 1px solid ${config.color}40;
        border-radius: 16px;
        margin-bottom: 30px;
      ">
        <span style="font-size: 48px;">${config.icon}</span>
        <h3 style="font-size: 28px; color: ${config.color}; margin: 15px 0 10px 0; font-weight: bold;">${config.name}</h3>
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
          <span style="font-size: 24px; color: #c8b48c;">${pillar.stem}${pillar.branch}</span>
          <span style="font-size: 14px; color: #a0967a; align-self: center;">${nayin}</span>
        </div>
      </div>
      
      <!-- 故事內容 -->
      <div style="
        background: rgba(20, 20, 30, 0.6);
        border: 1px solid rgba(140, 110, 70, 0.3);
        border-radius: 12px;
        padding: 30px;
      ">
        <h4 style="font-size: 16px; color: #c8aa64; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
          <span style="width: 4px; height: 20px; background: ${config.color}; border-radius: 2px;"></span>
          軍團故事
        </h4>
        <div style="
          font-size: 14px;
          color: #b4b0a0;
          line-height: 1.8;
          white-space: pre-wrap;
        ">${story}</div>
      </div>
      
      <!-- 頁腳 -->
      <div style="
        position: absolute;
        bottom: 30px;
        left: 50px;
        right: 50px;
      ">
        <div style="width: 100%; height: 1px; background: rgba(100, 80, 50, 0.5); margin-bottom: 10px;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #646464;">
          <span>${dateStr}</span>
          <span>© 虹靈御所｜超烜創意</span>
          <span>第 ${pageNum} 頁</span>
        </div>
      </div>
    </div>
  `;
};

// 主要導出函數
export const generatePDF = async (_elementId: string, fileName: string, coverData?: CoverPageData, reportData?: ReportData) => {
  if (!reportData) {
    console.error('No report data provided');
    return;
  }

  // 創建報告 HTML
  const container = createReportContainer(reportData, coverData);
  
  // 等待字體和圖片加載
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // 獲取所有頁面
    const pages = container.querySelectorAll<HTMLElement>('[style*="page-break-after"]');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // 使用 html2canvas 截圖
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0f',
        logging: false,
        windowWidth: 794,
        windowHeight: 1123
      });
      
      // 轉換為圖片並加入 PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (i > 0) {
        pdf.addPage();
      }
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }
    
    // 下載 PDF
    pdf.save(fileName);
    
  } finally {
    // 清理臨時容器
    document.body.removeChild(container);
  }
};

// 保持向後兼容的簡化版本
export const generateSimplePDF = async (elementId: string, fileName: string, coverData?: CoverPageData) => {
  await generatePDF(elementId, fileName, coverData);
};
