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

export interface PdfOptions {
  includeCover: boolean;
  includePillars: boolean;
  includeShensha: boolean;
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
  includeYearStory: true,
  includeMonthStory: true,
  includeDayStory: true,
  includeHourStory: true,
};

// 創建報告 HTML 容器
const createReportContainer = (reportData: ReportData, coverData?: CoverPageData, options: PdfOptions = defaultPdfOptions): HTMLDivElement => {
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
      overflow: hidden;
    ">
      <!-- 背景紋理 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(circle at 20% 20%, rgba(180, 140, 80, 0.03) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(180, 140, 80, 0.03) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(100, 80, 60, 0.02) 0%, transparent 60%);
        pointer-events: none;
      "></div>
      
      <!-- 水印圖案 -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(180, 140, 80, 0.02) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
      "></div>
      
      <!-- 八卦水印 -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(22.5deg);
        width: 400px;
        height: 400px;
        border: 1px dashed rgba(180, 140, 80, 0.05);
        border-radius: 50%;
        pointer-events: none;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        width: 350px;
        height: 350px;
        border: 1px dashed rgba(180, 140, 80, 0.04);
        border-radius: 50%;
        pointer-events: none;
      "></div>
      
      <!-- 外層邊框 -->
      <div style="
        position: absolute;
        inset: 15px;
        border: 3px solid rgba(180, 140, 80, 0.6);
        pointer-events: none;
        box-shadow: 0 0 30px rgba(180, 140, 80, 0.15) inset;
      "></div>
      <!-- 內層邊框 -->
      <div style="
        position: absolute;
        inset: 22px;
        border: 1px solid rgba(180, 140, 80, 0.4);
        pointer-events: none;
      "></div>
      <div style="
        position: absolute;
        inset: 28px;
        border: 1px solid rgba(180, 140, 80, 0.2);
        pointer-events: none;
      "></div>
      
      <!-- 角落裝飾 - 左上 -->
      <div style="position: absolute; top: 20px; left: 20px; width: 60px; height: 60px;">
        <div style="position: absolute; top: 0; left: 0; width: 40px; height: 3px; background: linear-gradient(90deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; top: 0; left: 0; width: 3px; height: 40px; background: linear-gradient(180deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; top: 5px; left: 5px; width: 20px; height: 20px; border-left: 2px solid #a08050; border-top: 2px solid #a08050;"></div>
        <div style="position: absolute; top: 8px; left: 8px; width: 6px; height: 6px; background: #c8aa64; transform: rotate(45deg);"></div>
      </div>
      <!-- 角落裝飾 - 右上 -->
      <div style="position: absolute; top: 20px; right: 20px; width: 60px; height: 60px;">
        <div style="position: absolute; top: 0; right: 0; width: 40px; height: 3px; background: linear-gradient(270deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; top: 0; right: 0; width: 3px; height: 40px; background: linear-gradient(180deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; top: 5px; right: 5px; width: 20px; height: 20px; border-right: 2px solid #a08050; border-top: 2px solid #a08050;"></div>
        <div style="position: absolute; top: 8px; right: 8px; width: 6px; height: 6px; background: #c8aa64; transform: rotate(45deg);"></div>
      </div>
      <!-- 角落裝飾 - 左下 -->
      <div style="position: absolute; bottom: 20px; left: 20px; width: 60px; height: 60px;">
        <div style="position: absolute; bottom: 0; left: 0; width: 40px; height: 3px; background: linear-gradient(90deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 3px; height: 40px; background: linear-gradient(0deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; bottom: 5px; left: 5px; width: 20px; height: 20px; border-left: 2px solid #a08050; border-bottom: 2px solid #a08050;"></div>
        <div style="position: absolute; bottom: 8px; left: 8px; width: 6px; height: 6px; background: #c8aa64; transform: rotate(45deg);"></div>
      </div>
      <!-- 角落裝飾 - 右下 -->
      <div style="position: absolute; bottom: 20px; right: 20px; width: 60px; height: 60px;">
        <div style="position: absolute; bottom: 0; right: 0; width: 40px; height: 3px; background: linear-gradient(270deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; bottom: 0; right: 0; width: 3px; height: 40px; background: linear-gradient(0deg, #c8aa64, transparent);"></div>
        <div style="position: absolute; bottom: 5px; right: 5px; width: 20px; height: 20px; border-right: 2px solid #a08050; border-bottom: 2px solid #a08050;"></div>
        <div style="position: absolute; bottom: 8px; right: 8px; width: 6px; height: 6px; background: #c8aa64; transform: rotate(45deg);"></div>
      </div>
      
      <!-- 頂部裝飾線 -->
      <div style="
        position: absolute;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        width: 200px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #b48c50, #c8aa64, #b48c50, transparent);
      "></div>
      
      <!-- 主標題區域 -->
      <div style="text-align: center; margin-top: 70px; position: relative;">
        <!-- 發光背景 -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 100px;
          background: radial-gradient(ellipse, rgba(200, 170, 100, 0.1) 0%, transparent 70%);
          filter: blur(20px);
        "></div>
        <h1 style="
          font-size: 52px;
          color: #c8aa64;
          margin: 0 0 15px 0;
          font-weight: bold;
          letter-spacing: 12px;
          text-shadow: 0 0 20px rgba(200, 170, 100, 0.4), 0 2px 10px rgba(0, 0, 0, 0.5);
          position: relative;
        ">虹靈御所</h1>
        <p style="
          font-size: 26px;
          color: #a08c5a;
          margin: 0;
          letter-spacing: 6px;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
        ">八字人生兵法命盤</p>
        
        <!-- 裝飾分隔線 -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 35px auto;
          width: 350px;
        ">
          <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #b48c50);"></div>
          <div style="width: 8px; height: 8px; background: #c8aa64; transform: rotate(45deg); margin: 0 15px;"></div>
          <div style="width: 12px; height: 12px; border: 2px solid #c8aa64; transform: rotate(45deg); margin: 0 5px;"></div>
          <div style="width: 8px; height: 8px; background: #c8aa64; transform: rotate(45deg); margin: 0 15px;"></div>
          <div style="flex: 1; height: 1px; background: linear-gradient(270deg, transparent, #b48c50);"></div>
        </div>
      </div>
      
      <!-- 命主資訊卡片 -->
      <div style="
        text-align: center;
        margin-top: 40px;
        padding: 30px 40px;
        background: linear-gradient(135deg, rgba(30, 28, 25, 0.9) 0%, rgba(25, 22, 20, 0.9) 100%);
        border: 1px solid rgba(180, 140, 80, 0.4);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        position: relative;
      ">
        <!-- 卡片角落裝飾 -->
        <div style="position: absolute; top: -3px; left: -3px; width: 15px; height: 15px; border-left: 2px solid #c8aa64; border-top: 2px solid #c8aa64;"></div>
        <div style="position: absolute; top: -3px; right: -3px; width: 15px; height: 15px; border-right: 2px solid #c8aa64; border-top: 2px solid #c8aa64;"></div>
        <div style="position: absolute; bottom: -3px; left: -3px; width: 15px; height: 15px; border-left: 2px solid #c8aa64; border-bottom: 2px solid #c8aa64;"></div>
        <div style="position: absolute; bottom: -3px; right: -3px; width: 15px; height: 15px; border-right: 2px solid #c8aa64; border-bottom: 2px solid #c8aa64;"></div>
        
        <p style="font-size: 14px; color: #8c8270; margin: 0 0 10px 0; letter-spacing: 4px;">命主</p>
        <h2 style="
          font-size: 48px;
          color: #dcc88c;
          margin: 0 0 10px 0;
          font-weight: bold;
          letter-spacing: 8px;
          text-shadow: 0 2px 10px rgba(220, 200, 140, 0.3);
        ">${reportData.name}</h2>
        <p style="font-size: 16px; color: #a09080; margin: 0;">${genderText}</p>
        
        <div style="
          width: 100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #645032, transparent);
          margin: 20px auto;
        "></div>
        <p style="font-size: 12px; color: #787878; margin: 0 0 8px 0;">出生時間</p>
        <p style="font-size: 20px; color: #b4aa8c; margin: 0; letter-spacing: 2px;">${reportData.birthDate}</p>
      </div>
      
      <!-- 四柱展示區 -->
      <div style="margin-top: 50px; position: relative;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
        ">
          <div style="flex: 1; max-width: 150px; height: 1px; background: linear-gradient(90deg, transparent, #a08050);"></div>
          <p style="font-size: 16px; color: #a08c5a; margin: 0 20px; letter-spacing: 4px;">四柱八字</p>
          <div style="flex: 1; max-width: 150px; height: 1px; background: linear-gradient(270deg, transparent, #a08050);"></div>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 25px;">
          ${['year', 'month', 'day', 'hour'].map((key, idx) => {
            const pillar = reportData.pillars[key as keyof typeof reportData.pillars];
            const labels = ['年柱', '月柱', '日柱', '時柱'];
            const icons = ['👑', '🤝', '⭐', '🚀'];
            return `
              <div style="text-align: center; position: relative;">
                <p style="font-size: 12px; color: #646464; margin: 0 0 8px 0;">${icons[idx]} ${labels[idx]}</p>
                <div style="
                  background: linear-gradient(180deg, rgba(35, 32, 28, 0.95) 0%, rgba(25, 22, 18, 0.95) 100%);
                  border: 2px solid rgba(180, 140, 80, 0.5);
                  border-radius: 12px;
                  padding: 20px 25px;
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                  position: relative;
                ">
                  <!-- 頂部發光 -->
                  <div style="
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60%;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #c8aa64, transparent);
                  "></div>
                  <p style="font-size: 32px; color: #dcc88c; margin: 0; text-shadow: 0 0 10px rgba(220, 200, 140, 0.3);">${pillar.stem}</p>
                  <div style="width: 40px; height: 2px; background: linear-gradient(90deg, transparent, rgba(180, 140, 80, 0.5), transparent); margin: 10px auto;"></div>
                  <p style="font-size: 32px; color: #b4a078; margin: 0;">${pillar.branch}</p>
                </div>
                <p style="font-size: 11px; color: #787864; margin: 10px 0 0 0;">${reportData.nayin[key as keyof typeof reportData.nayin]}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <!-- 印章 -->
      <div style="
        position: absolute;
        right: 70px;
        bottom: 130px;
        width: 90px;
        height: 90px;
        border: 3px solid #c84040;
        transform: rotate(-5deg);
        box-shadow: 0 4px 15px rgba(200, 64, 64, 0.3);
      ">
        <div style="
          position: absolute;
          inset: 4px;
          border: 2px solid #c84040;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            font-size: 28px;
            color: #c84040;
            font-weight: bold;
            letter-spacing: 4px;
            text-shadow: 0 0 5px rgba(200, 64, 64, 0.5);
          ">御所</span>
        </div>
      </div>
      
      <!-- 底部區域 -->
      <div style="
        position: absolute;
        bottom: 45px;
        left: 50px;
        right: 50px;
        text-align: center;
      ">
        <!-- 裝飾分隔線 -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        ">
          <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #8c6e3c);"></div>
          <div style="width: 6px; height: 6px; border: 1px solid #8c6e3c; transform: rotate(45deg); margin: 0 10px;"></div>
          <div style="flex: 1; height: 1px; background: linear-gradient(270deg, transparent, #8c6e3c);"></div>
        </div>
        <p style="font-size: 12px; color: #787878; margin: 0 0 5px 0; font-style: italic;">「命理展示的是一條相對好走但不一定是你要走的路」</p>
        <p style="font-size: 12px; color: #646464; margin: 0 0 15px 0;">選擇權在於你</p>
        <p style="font-size: 10px; color: #505050; margin: 0;">${dateStr} 製表 ｜ 虹靈御所・超烜創意</p>
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
      overflow: hidden;
    ">
      <!-- 背景裝飾 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(circle at 10% 90%, rgba(180, 140, 80, 0.02) 0%, transparent 30%),
          radial-gradient(circle at 90% 10%, rgba(180, 140, 80, 0.02) 0%, transparent 30%);
        pointer-events: none;
      "></div>
      
      <!-- 邊框 -->
      <div style="position: absolute; inset: 15px; border: 1px solid rgba(180, 140, 80, 0.3); pointer-events: none;"></div>
      
      <!-- 頁眉 -->
      <div style="text-align: center; margin-bottom: 30px; position: relative;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        ">
          <div style="width: 50px; height: 1px; background: linear-gradient(90deg, transparent, #a08050);"></div>
          <h2 style="font-size: 20px; color: #c8aa64; margin: 0; letter-spacing: 4px;">虹靈御所八字人生兵法</h2>
          <div style="width: 50px; height: 1px; background: linear-gradient(270deg, transparent, #a08050);"></div>
        </div>
        <p style="font-size: 12px; color: #8c8c8c; margin: 8px 0 0 0; letter-spacing: 2px;">四時軍團戰略命理系統</p>
        <div style="width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #a08050, transparent); margin-top: 20px;"></div>
      </div>
      
      <!-- 標題 -->
      <div style="text-align: center; margin: 25px 0 35px 0; position: relative;">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 50px;
          background: radial-gradient(ellipse, rgba(200, 170, 100, 0.08) 0%, transparent 70%);
        "></div>
        <h3 style="font-size: 24px; color: #dcc88c; margin: 0; letter-spacing: 6px; text-shadow: 0 0 15px rgba(200, 170, 100, 0.2);">四柱命盤詳解</h3>
      </div>
      
      <!-- 四柱卡片 -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 35px;">
        ${(['year', 'month', 'day', 'hour'] as const).map(key => {
          const pillar = reportData.pillars[key];
          const nayin = reportData.nayin[key];
          const tenGod = reportData.tenGods?.[key];
          const hidden = reportData.hiddenStems?.[key] || [];
          const label = pillarLabels[key];
          const colors = {
            year: '#fbbf24',
            month: '#4ade80',
            day: '#c084fc',
            hour: '#f97316'
          };
          const color = colors[key];
          return `
            <div style="
              background: linear-gradient(135deg, rgba(28, 28, 38, 0.9) 0%, rgba(22, 22, 30, 0.9) 100%);
              border: 1px solid ${color}40;
              border-radius: 12px;
              padding: 20px;
              position: relative;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            ">
              <!-- 頂部發光條 -->
              <div style="
                position: absolute;
                top: 0;
                left: 20px;
                right: 20px;
                height: 2px;
                background: linear-gradient(90deg, transparent, ${color}80, transparent);
              "></div>
              
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 24px;">${label.icon}</span>
                <div>
                  <span style="font-size: 16px; color: ${color}; font-weight: bold;">${label.name}</span>
                  <span style="font-size: 12px; color: #787878; margin-left: 8px;">${label.legion}</span>
                </div>
              </div>
              
              <div style="
                text-align: center;
                padding: 15px;
                background: rgba(15, 15, 20, 0.5);
                border-radius: 8px;
                margin-bottom: 15px;
                border: 1px solid rgba(255, 255, 255, 0.05);
              ">
                <span style="font-size: 36px; color: #dcc88c; letter-spacing: 8px; text-shadow: 0 0 10px rgba(220, 200, 140, 0.2);">${pillar.stem}${pillar.branch}</span>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 4px; height: 4px; background: ${color}; border-radius: 50%;"></div>
                  <span style="font-size: 12px; color: #787864;">納音：</span>
                  <span style="font-size: 12px; color: #a0967a;">${nayin}</span>
                </div>
                ${tenGod ? `
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 4px; height: 4px; background: ${color}; border-radius: 50%;"></div>
                    <span style="font-size: 12px; color: #787864;">十神：</span>
                    <span style="font-size: 12px; color: #a0967a;">${tenGod.stem} / ${tenGod.branch}</span>
                  </div>
                ` : ''}
                ${hidden.length > 0 ? `
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 4px; height: 4px; background: ${color}; border-radius: 50%;"></div>
                    <span style="font-size: 12px; color: #787864;">藏干：</span>
                    <span style="font-size: 12px; color: #a0967a;">${hidden.join('、')}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <!-- 五行分布 -->
      ${reportData.wuxing ? `
        <div style="
          margin-bottom: 30px;
          background: rgba(20, 20, 28, 0.6);
          border: 1px solid rgba(140, 110, 70, 0.3);
          border-radius: 12px;
          padding: 25px;
        ">
          <h4 style="font-size: 18px; color: #c8aa64; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
            <span style="width: 4px; height: 20px; background: linear-gradient(180deg, #c8aa64, #a08050); border-radius: 2px;"></span>
            五行分布
          </h4>
          <div style="display: flex; gap: 15px;">
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
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${el.color}15 0%, ${el.color}05 100%);
                    border: 2px solid ${el.color}50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 10px;
                    box-shadow: 0 0 15px ${el.color}20;
                  ">
                    <span style="font-size: 22px; color: ${el.color}; font-weight: bold; text-shadow: 0 0 5px ${el.color}40;">${el.name}</span>
                  </div>
                  <p style="font-size: 16px; color: ${el.color}; margin: 0; font-weight: bold;">${value}</p>
                  <p style="font-size: 12px; color: #787878; margin: 4px 0 0 0;">${pct}%</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- 陰陽比例 -->
      ${reportData.yinyang ? `
        <div style="
          margin-bottom: 30px;
          background: rgba(20, 20, 28, 0.6);
          border: 1px solid rgba(140, 110, 70, 0.3);
          border-radius: 12px;
          padding: 25px;
        ">
          <h4 style="font-size: 18px; color: #c8aa64; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px;">
            <span style="width: 4px; height: 20px; background: linear-gradient(180deg, #c8aa64, #a08050); border-radius: 2px;"></span>
            陰陽比例
          </h4>
          <div style="
            height: 40px;
            border-radius: 20px;
            overflow: hidden;
            display: flex;
            background: #1a1a24;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
          ">
            <div style="
              width: ${(reportData.yinyang.yang / (reportData.yinyang.yang + reportData.yinyang.yin)) * 100}%;
              background: linear-gradient(90deg, #c8b464, #dcc88c);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 2px 0 10px rgba(200, 180, 100, 0.3);
            ">
              <span style="font-size: 14px; color: #1a1a1a; font-weight: bold;">☀ 陽 ${reportData.yinyang.yang}</span>
            </div>
            <div style="
              flex: 1;
              background: linear-gradient(90deg, #4a4a8a, #6464c8);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="font-size: 14px; color: #e0e0e0; font-weight: bold;">☽ 陰 ${reportData.yinyang.yin}</span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <!-- 頁腳 -->
      <div style="
        position: absolute;
        bottom: 25px;
        left: 50px;
        right: 50px;
      ">
        <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(140, 110, 70, 0.5), transparent); margin-bottom: 12px;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #646464;">
          <span>${dateStr}</span>
          <span>虹靈御所｜超烜創意</span>
          <span>第 2 頁</span>
        </div>
      </div>
    </div>
  `;

  // 神煞分析頁 - 根據選項決定是否包含
  const shenshaPages = (options.includeShensha && reportData.shensha && reportData.shensha.length > 0) ? 
    createShenshaPages(reportData.shensha, dateStr) : '';

  // 計算頁數
  let pageNum = 2; // 封面是第1頁，四柱是第2頁
  if (options.includePillars) {
    pageNum = 2;
  }
  const shenshaPageCount = options.includeShensha && reportData.shensha ? Math.ceil(reportData.shensha.length / 6) : 0;

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
      (options.includePillars ? 2 : 1) + shenshaPageCount + idx + 1
    ))
    .join('');

  // 組合頁面 - 根據選項決定包含哪些
  let content = coverPage;
  if (options.includePillars) {
    content += pillarsPage;
  }
  content += shenshaPages + storyPages;

  container.innerHTML = content;
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
        overflow: hidden;
      ">
        <!-- 背景裝飾 -->
        <div style="
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 85% 15%, rgba(180, 140, 80, 0.03) 0%, transparent 25%),
            radial-gradient(circle at 15% 85%, rgba(180, 140, 80, 0.03) 0%, transparent 25%);
          pointer-events: none;
        "></div>
        
        <!-- 邊框 -->
        <div style="position: absolute; inset: 15px; border: 1px solid rgba(180, 140, 80, 0.25); pointer-events: none;"></div>
        
        <!-- 頁眉 -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
          ">
            <div style="width: 50px; height: 1px; background: linear-gradient(90deg, transparent, #a08050);"></div>
            <h2 style="font-size: 20px; color: #c8aa64; margin: 0; letter-spacing: 4px;">虹靈御所八字人生兵法</h2>
            <div style="width: 50px; height: 1px; background: linear-gradient(270deg, transparent, #a08050);"></div>
          </div>
          <p style="font-size: 12px; color: #8c8c8c; margin: 8px 0 0 0; letter-spacing: 2px;">四時軍團戰略命理系統</p>
          <div style="width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #a08050, transparent); margin-top: 20px;"></div>
        </div>
        
        <!-- 標題 -->
        <div style="text-align: center; margin: 20px 0 30px 0; position: relative;">
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 180px;
            height: 40px;
            background: radial-gradient(ellipse, rgba(200, 170, 100, 0.08) 0%, transparent 70%);
          "></div>
          <h3 style="font-size: 22px; color: #dcc88c; margin: 0; letter-spacing: 4px;">
            ✨ 神煞分析 ${i > 0 ? `(續 ${Math.floor(i / itemsPerPage) + 1})` : ''}
          </h3>
        </div>
        
        <!-- 神煞卡片 -->
        <div style="display: flex; flex-direction: column; gap: 15px;">
          ${pageItems.map(item => {
            const category = item.category || '特殊';
            const catColor = categoryColors[category] || categoryColors['特殊'];
            const rarity = item.rarity && rarityConfig[item.rarity] ? rarityConfig[item.rarity] : null;
            return `
              <div style="
                background: linear-gradient(135deg, rgba(28, 28, 38, 0.85) 0%, rgba(22, 22, 30, 0.85) 100%);
                border: 1px solid ${catColor}30;
                border-left: 4px solid ${catColor};
                border-radius: 10px;
                padding: 18px 22px;
                position: relative;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
              ">
                <!-- 右上角光暈 -->
                <div style="
                  position: absolute;
                  top: 0;
                  right: 0;
                  width: 80px;
                  height: 80px;
                  background: radial-gradient(circle at 100% 0%, ${catColor}08 0%, transparent 70%);
                  pointer-events: none;
                "></div>
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
                  <span style="font-size: 18px; color: #dcc88c; font-weight: bold;">${item.name}</span>
                  ${rarity ? `
                    <span style="
                      font-size: 10px;
                      color: ${rarity.color};
                      background: linear-gradient(135deg, ${rarity.color}15 0%, ${rarity.color}08 100%);
                      padding: 3px 10px;
                      border-radius: 12px;
                      border: 1px solid ${rarity.color}30;
                    ">${rarity.text}</span>
                  ` : ''}
                  <span style="
                    font-size: 11px;
                    color: ${catColor};
                    margin-left: auto;
                    padding: 2px 10px;
                    background: ${catColor}10;
                    border-radius: 4px;
                  ">${category}</span>
                </div>
                ${item.position ? `<p style="font-size: 12px; color: #a0967a; margin: 0 0 8px 0;">📍 落於：${item.position}</p>` : ''}
                ${item.effect ? `<p style="font-size: 13px; color: #a09890; margin: 0 0 8px 0; line-height: 1.6;">${item.effect}</p>` : ''}
                ${item.modernMeaning ? `<p style="font-size: 12px; color: #787872; margin: 0; line-height: 1.5; padding-left: 10px; border-left: 2px solid ${catColor}40;">💡 ${item.modernMeaning}</p>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- 頁腳 -->
        <div style="
          position: absolute;
          bottom: 25px;
          left: 50px;
          right: 50px;
        ">
          <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(140, 110, 70, 0.5), transparent); margin-bottom: 12px;"></div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #646464;">
            <span>${dateStr}</span>
            <span>虹靈御所｜超烜創意</span>
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
      overflow: hidden;
    ">
      <!-- 背景裝飾 -->
      <div style="
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(circle at 50% 30%, ${config.color}05 0%, transparent 40%),
          radial-gradient(circle at 20% 80%, rgba(180, 140, 80, 0.02) 0%, transparent 30%);
        pointer-events: none;
      "></div>
      
      <!-- 邊框 -->
      <div style="position: absolute; inset: 15px; border: 1px solid rgba(180, 140, 80, 0.25); pointer-events: none;"></div>
      <div style="position: absolute; top: 15px; left: 15px; width: 20px; height: 20px; border-left: 2px solid ${config.color}; border-top: 2px solid ${config.color};"></div>
      <div style="position: absolute; top: 15px; right: 15px; width: 20px; height: 20px; border-right: 2px solid ${config.color}; border-top: 2px solid ${config.color};"></div>
      <div style="position: absolute; bottom: 15px; left: 15px; width: 20px; height: 20px; border-left: 2px solid ${config.color}; border-bottom: 2px solid ${config.color};"></div>
      <div style="position: absolute; bottom: 15px; right: 15px; width: 20px; height: 20px; border-right: 2px solid ${config.color}; border-bottom: 2px solid ${config.color};"></div>
      
      <!-- 頁眉 -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        ">
          <div style="width: 50px; height: 1px; background: linear-gradient(90deg, transparent, #a08050);"></div>
          <h2 style="font-size: 20px; color: #c8aa64; margin: 0; letter-spacing: 4px;">虹靈御所八字人生兵法</h2>
          <div style="width: 50px; height: 1px; background: linear-gradient(270deg, transparent, #a08050);"></div>
        </div>
        <p style="font-size: 12px; color: #8c8c8c; margin: 8px 0 0 0; letter-spacing: 2px;">四時軍團戰略命理系統</p>
        <div style="width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #a08050, transparent); margin-top: 20px;"></div>
      </div>
      
      <!-- 軍團標題 -->
      <div style="
        text-align: center;
        padding: 35px;
        background: linear-gradient(135deg, ${config.bgColor} 0%, transparent 100%);
        border: 2px solid ${config.color}30;
        border-radius: 20px;
        margin-bottom: 30px;
        position: relative;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), inset 0 0 60px ${config.color}05;
      ">
        <!-- 頂部發光線 -->
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${config.color}, transparent);
        "></div>
        
        <span style="font-size: 56px; display: block; margin-bottom: 15px; filter: drop-shadow(0 0 10px ${config.color}40);">${config.icon}</span>
        <h3 style="
          font-size: 32px;
          color: ${config.color};
          margin: 0 0 15px 0;
          font-weight: bold;
          letter-spacing: 6px;
          text-shadow: 0 0 20px ${config.color}40;
        ">${config.name}</h3>
        
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 20px;
          padding: 12px 30px;
          background: rgba(15, 15, 20, 0.6);
          border-radius: 30px;
          border: 1px solid ${config.color}30;
        ">
          <span style="font-size: 28px; color: #dcc88c; letter-spacing: 4px; text-shadow: 0 0 10px rgba(220, 200, 140, 0.3);">${pillar.stem}${pillar.branch}</span>
          <div style="width: 1px; height: 25px; background: ${config.color}40;"></div>
          <span style="font-size: 16px; color: #a0967a;">${nayin}</span>
        </div>
      </div>
      
      <!-- 故事內容 -->
      <div style="
        background: linear-gradient(135deg, rgba(22, 22, 30, 0.8) 0%, rgba(18, 18, 25, 0.8) 100%);
        border: 1px solid ${config.color}25;
        border-radius: 16px;
        padding: 30px;
        position: relative;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
      ">
        <!-- 左上角裝飾 -->
        <div style="position: absolute; top: -1px; left: 20px; width: 60px; height: 3px; background: linear-gradient(90deg, ${config.color}, transparent);"></div>
        
        <h4 style="font-size: 18px; color: #c8aa64; margin: 0 0 20px 0; display: flex; align-items: center; gap: 12px;">
          <span style="
            width: 5px;
            height: 24px;
            background: linear-gradient(180deg, ${config.color}, ${config.color}50);
            border-radius: 3px;
            box-shadow: 0 0 10px ${config.color}40;
          "></span>
          軍團故事
        </h4>
        <div style="
          font-size: 15px;
          color: #b8b4a8;
          line-height: 2;
          white-space: pre-wrap;
          text-align: justify;
        ">${story}</div>
      </div>
      
      <!-- 頁腳 -->
      <div style="
        position: absolute;
        bottom: 25px;
        left: 50px;
        right: 50px;
      ">
        <div style="width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(140, 110, 70, 0.5), transparent); margin-bottom: 12px;"></div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #646464;">
          <span>${dateStr}</span>
          <span>虹靈御所｜超烜創意</span>
          <span>第 ${pageNum} 頁</span>
        </div>
      </div>
    </div>
  `;
};

// 主要導出函數
export const generatePDF = async (
  _elementId: string, 
  fileName: string, 
  coverData?: CoverPageData, 
  reportData?: ReportData,
  options: PdfOptions = defaultPdfOptions
) => {
  if (!reportData) {
    console.error('No report data provided');
    throw new Error('No report data provided');
  }

  // 創建報告 HTML，傳入選項
  const container = createReportContainer(reportData, coverData, options);
  
  // 將容器放到螢幕外（保持可渲染，避免輸出全黑）
  container.setAttribute('data-pdf-container', 'true');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.style.visibility = 'visible';
  
  // 等待字體和圖片加載 - 增加等待時間
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // 獲取所有頁面 - 使用更可靠的選擇器
    const pages = Array.from(container.children).filter(
      (child): child is HTMLElement => 
        child instanceof HTMLElement && 
        child.offsetWidth > 0 && 
        child.offsetHeight > 0
    );
    
    if (pages.length === 0) {
      console.error('No pages found in container');
      throw new Error('No pages found in container');
    }
    
    console.log(`Found ${pages.length} pages to render`);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // 確保頁面有尺寸
      if (page.offsetWidth === 0 || page.offsetHeight === 0) {
        console.warn(`Page ${i} has no dimensions, skipping`);
        continue;
      }
      
      console.log(`Rendering page ${i + 1}/${pages.length}, size: ${page.offsetWidth}x${page.offsetHeight}`);
      
      // 使用 html2canvas 截圖
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0f',
        logging: false,
        windowWidth: 794,
        windowHeight: 1123,
        // 忽略無法渲染的元素
        ignoreElements: (element) => {
          // 忽略寬度或高度為 0 的元素
          if (element instanceof HTMLElement) {
            const style = window.getComputedStyle(element);
            if (style.width === '0px' || style.height === '0px') {
              return true;
            }
          }
          return false;
        },
        onclone: (clonedDoc) => {
          // 確保克隆的文檔中的容器是可渲染的
          const clonedContainer = clonedDoc.body.querySelector('[data-pdf-container="true"]') as HTMLElement | null;
          if (clonedContainer) {
            clonedContainer.style.visibility = 'visible';
            clonedContainer.style.position = 'absolute';
            clonedContainer.style.left = '0';
            clonedContainer.style.top = '0';
          }
        }
      });
      
      // 檢查 canvas 是否有效
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn(`Canvas for page ${i} has no dimensions, skipping`);
        continue;
      }
      
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
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

// 保持向後兼容的簡化版本
export const generateSimplePDF = async (elementId: string, fileName: string, coverData?: CoverPageData) => {
  await generatePDF(elementId, fileName, coverData);
};
