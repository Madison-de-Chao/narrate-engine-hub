import jsPDF from "jspdf";

// 傳統中國風格邊框繪製
const drawTraditionalBorder = (pdf: jsPDF, width: number, height: number) => {
  // 外框 - 雙線邊框
  pdf.setDrawColor(180, 140, 80); // 金色
  pdf.setLineWidth(1.5);
  pdf.rect(6, 6, width - 12, height - 12);
  
  pdf.setLineWidth(0.5);
  pdf.rect(8, 8, width - 16, height - 16);
  
  // 四角裝飾 - 傳統雲紋
  const cornerSize = 15;
  pdf.setDrawColor(160, 120, 60);
  pdf.setLineWidth(0.8);
  
  // 左上角
  drawCornerDecoration(pdf, 10, 10, cornerSize, 'tl');
  // 右上角
  drawCornerDecoration(pdf, width - 10, 10, cornerSize, 'tr');
  // 左下角
  drawCornerDecoration(pdf, 10, height - 10, cornerSize, 'bl');
  // 右下角
  drawCornerDecoration(pdf, width - 10, height - 10, cornerSize, 'br');
};

// 繪製角落裝飾
const drawCornerDecoration = (pdf: jsPDF, x: number, y: number, size: number, position: 'tl' | 'tr' | 'bl' | 'br') => {
  const lines: [number, number, number, number][] = [];
  
  switch (position) {
    case 'tl':
      lines.push([x, y + size, x, y], [x, y, x + size, y]);
      lines.push([x + 3, y + size - 3, x + 3, y + 3], [x + 3, y + 3, x + size - 3, y + 3]);
      break;
    case 'tr':
      lines.push([x - size, y, x, y], [x, y, x, y + size]);
      lines.push([x - size + 3, y + 3, x - 3, y + 3], [x - 3, y + 3, x - 3, y + size - 3]);
      break;
    case 'bl':
      lines.push([x, y - size, x, y], [x, y, x + size, y]);
      lines.push([x + 3, y - size + 3, x + 3, y - 3], [x + 3, y - 3, x + size - 3, y - 3]);
      break;
    case 'br':
      lines.push([x - size, y, x, y], [x, y, x, y - size]);
      lines.push([x - size + 3, y - 3, x - 3, y - 3], [x - 3, y - 3, x - 3, y - size + 3]);
      break;
  }
  
  lines.forEach(([x1, y1, x2, y2]) => {
    pdf.line(x1, y1, x2, y2);
  });
};

// 繪製傳統印章
const drawSeal = (pdf: jsPDF, x: number, y: number, text: string, size: number = 18) => {
  const sealSize = size;
  
  // 印章外框
  pdf.setDrawColor(180, 50, 50);
  pdf.setLineWidth(size > 30 ? 2 : 1.2);
  pdf.rect(x - sealSize / 2, y - sealSize / 2, sealSize, sealSize);
  
  // 印章內框
  pdf.setLineWidth(size > 30 ? 0.8 : 0.4);
  pdf.rect(x - sealSize / 2 + 3, y - sealSize / 2 + 3, sealSize - 6, sealSize - 6);
  
  // 印章文字
  pdf.setTextColor(180, 50, 50);
  pdf.setFontSize(size > 30 ? size / 2.5 : 8);
  pdf.text(text, x, y + (size > 30 ? size / 6 : 3), { align: "center" });
};

// 繪製大型封面印章
const drawLargeSeal = (pdf: jsPDF, x: number, y: number, text: string) => {
  const sealSize = 50;
  
  // 外框
  pdf.setDrawColor(180, 50, 50);
  pdf.setLineWidth(2.5);
  pdf.rect(x - sealSize / 2, y - sealSize / 2, sealSize, sealSize);
  
  // 內框
  pdf.setLineWidth(1);
  pdf.rect(x - sealSize / 2 + 4, y - sealSize / 2 + 4, sealSize - 8, sealSize - 8);
  
  // 裝飾線
  pdf.setLineWidth(0.5);
  pdf.rect(x - sealSize / 2 + 6, y - sealSize / 2 + 6, sealSize - 12, sealSize - 12);
  
  // 印章文字 - 兩行顯示
  pdf.setTextColor(180, 50, 50);
  pdf.setFontSize(14);
  if (text.length <= 2) {
    pdf.text(text, x, y + 5, { align: "center" });
  } else {
    const half = Math.ceil(text.length / 2);
    pdf.text(text.slice(0, half), x, y - 2, { align: "center" });
    pdf.text(text.slice(half), x, y + 10, { align: "center" });
  }
};

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

// 報告資料介面
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

// 繪製封面頁
const drawCoverPage = (pdf: jsPDF, data: CoverPageData) => {
  const pdfWidth = 210;
  const pdfHeight = 297;
  
  // 深色背景
  pdf.setFillColor(15, 15, 20);
  pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
  
  // 傳統邊框
  drawTraditionalBorder(pdf, pdfWidth, pdfHeight);
  
  // 額外裝飾邊框
  pdf.setDrawColor(140, 110, 60);
  pdf.setLineWidth(0.3);
  pdf.rect(12, 12, pdfWidth - 24, pdfHeight - 24);
  
  // 頂部裝飾圖案
  pdf.setDrawColor(180, 140, 80);
  pdf.setLineWidth(0.8);
  const centerX = pdfWidth / 2;
  
  // 上方祥雲紋飾
  for (let i = 0; i < 3; i++) {
    const offset = (i - 1) * 25;
    pdf.circle(centerX + offset, 35, 3, 'S');
    pdf.circle(centerX + offset - 4, 33, 2, 'S');
    pdf.circle(centerX + offset + 4, 33, 2, 'S');
  }
  
  // 主標題區
  pdf.setFontSize(28);
  pdf.setTextColor(200, 170, 100);
  pdf.text("虹靈御所", centerX, 60, { align: "center" });
  
  pdf.setFontSize(16);
  pdf.setTextColor(160, 140, 90);
  pdf.text("八字人生兵法命盤", centerX, 72, { align: "center" });
  
  // 標題下裝飾線
  pdf.setDrawColor(180, 140, 80);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - 60, 80, centerX + 60, 80);
  pdf.circle(centerX - 62, 80, 1.5, 'S');
  pdf.circle(centerX + 62, 80, 1.5, 'S');
  
  // 命主姓名區
  pdf.setFontSize(10);
  pdf.setTextColor(140, 130, 100);
  pdf.text("命主", centerX, 100, { align: "center" });
  
  pdf.setFontSize(32);
  pdf.setTextColor(220, 200, 140);
  pdf.text(data.name, centerX, 118, { align: "center" });
  
  // 性別標示
  pdf.setFontSize(10);
  pdf.setTextColor(120, 120, 120);
  const genderText = data.gender === 'male' ? '乾造（男）' : '坤造（女）';
  pdf.text(genderText, centerX, 128, { align: "center" });
  
  // 生辰資訊區
  pdf.setDrawColor(100, 80, 50);
  pdf.setLineWidth(0.3);
  pdf.line(centerX - 50, 140, centerX + 50, 140);
  
  pdf.setFontSize(9);
  pdf.setTextColor(140, 140, 140);
  pdf.text("出生時間", centerX, 150, { align: "center" });
  
  pdf.setFontSize(12);
  pdf.setTextColor(180, 170, 140);
  pdf.text(`${data.birthDate}  ${data.birthTime}`, centerX, 162, { align: "center" });
  
  // 四柱八字區
  pdf.setDrawColor(160, 130, 80);
  pdf.setLineWidth(0.5);
  pdf.line(centerX - 70, 178, centerX + 70, 178);
  
  pdf.setFontSize(10);
  pdf.setTextColor(140, 130, 100);
  pdf.text("四柱八字", centerX, 188, { align: "center" });
  
  // 繪製四柱
  const pillarLabels = ["年柱", "月柱", "日柱", "時柱"];
  const pillars = [data.yearPillar, data.monthPillar, data.dayPillar, data.hourPillar];
  const pillarStartX = centerX - 52;
  const pillarSpacing = 35;
  
  pillars.forEach((pillar, index) => {
    const x = pillarStartX + index * pillarSpacing;
    
    // 柱標籤
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(pillarLabels[index], x, 198, { align: "center" });
    
    // 柱框
    pdf.setDrawColor(140, 110, 70);
    pdf.setLineWidth(0.5);
    pdf.rect(x - 12, 202, 24, 40);
    
    // 天干
    pdf.setFontSize(16);
    pdf.setTextColor(200, 180, 120);
    pdf.text(pillar.stem, x, 218, { align: "center" });
    
    // 分隔線
    pdf.setDrawColor(100, 80, 50);
    pdf.setLineWidth(0.3);
    pdf.line(x - 10, 222, x + 10, 222);
    
    // 地支
    pdf.setFontSize(16);
    pdf.setTextColor(180, 160, 100);
    pdf.text(pillar.branch, x, 238, { align: "center" });
  });
  
  // 大型印章
  drawLargeSeal(pdf, pdfWidth - 45, pdfHeight - 70, "御所");
  
  // 底部裝飾線
  pdf.setDrawColor(140, 110, 60);
  pdf.setLineWidth(0.5);
  pdf.line(20, pdfHeight - 35, pdfWidth - 20, pdfHeight - 35);
  
  // 底部說明文字
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text("命理展示的是一條「相對好走但不一定是你要走的路」", centerX, pdfHeight - 25, { align: "center" });
  pdf.text("選擇權在於你", centerX, pdfHeight - 18, { align: "center" });
};

// 繪製頁眉頁腳
const drawHeaderFooter = (pdf: jsPDF, pageNum: number, totalPages: number, dateStr: string, timeStr: string) => {
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 15;
  
  // 頁眉
  pdf.setFontSize(11);
  pdf.setTextColor(200, 170, 100);
  pdf.text("虹靈御所八字人生兵法", pdfWidth / 2, 14, { align: "center" });
  
  pdf.setFontSize(7);
  pdf.setTextColor(140, 140, 140);
  pdf.text("四時軍團戰略命理系統", pdfWidth / 2, 19, { align: "center" });
  
  // 頁眉裝飾線
  pdf.setDrawColor(160, 130, 80);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 22, pdfWidth - margin, 22);
  
  // 印章
  if (pageNum === 1) {
    drawSeal(pdf, pdfWidth - 28, 16, "御所");
  }
  
  // 頁腳分隔線
  pdf.setDrawColor(100, 80, 50);
  pdf.setLineWidth(0.3);
  pdf.line(margin, pdfHeight - 16, pdfWidth - margin, pdfHeight - 16);
  
  // 頁腳內容
  pdf.setFontSize(6);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`製表日期：${dateStr} ${timeStr}`, margin, pdfHeight - 11);
  
  pdf.setTextColor(100, 100, 100);
  pdf.text("© 2025 虹靈御所｜超烜創意", pdfWidth / 2, pdfHeight - 11, { align: "center" });
  
  pdf.setTextColor(140, 140, 140);
  pdf.text(`第 ${pageNum} 頁 / 共 ${totalPages} 頁`, pdfWidth - margin, pdfHeight - 11, { align: "right" });
  
  // 哲學語句
  pdf.setFontSize(5);
  pdf.setTextColor(80, 80, 80);
  pdf.text("本報告僅供參考，命理展示的是一條「相對好走但不一定是你要走的路」，選擇權在於你", pdfWidth / 2, pdfHeight - 6, { align: "center" });
};

// 繪製四柱詳解頁
const drawPillarsPage = (pdf: jsPDF, data: ReportData) => {
  const pdfWidth = 210;
  const centerX = pdfWidth / 2;
  const margin = 18;
  let y = 32;
  
  // 背景
  pdf.setFillColor(15, 15, 20);
  pdf.rect(0, 0, pdfWidth, 297, 'F');
  drawTraditionalBorder(pdf, pdfWidth, 297);
  
  // 區域標題
  pdf.setFontSize(14);
  pdf.setTextColor(200, 170, 100);
  pdf.text("四柱命盤詳解", centerX, y, { align: "center" });
  y += 15;
  
  // 四柱卡片
  const pillarLabels = ["年柱 (祖源軍團)", "月柱 (關係軍團)", "日柱 (核心軍團)", "時柱 (未來軍團)"];
  const pillarKeys = ['year', 'month', 'day', 'hour'] as const;
  const cardWidth = 80;
  const cardHeight = 55;
  
  pillarKeys.forEach((key, index) => {
    const pillar = data.pillars[key];
    const nayin = data.nayin[key];
    const tenGod = data.tenGods?.[key];
    const hiddenStems = data.hiddenStems?.[key] || [];
    
    const row = Math.floor(index / 2);
    const col = index % 2;
    const cardX = margin + col * (cardWidth + 10);
    const cardY = y + row * (cardHeight + 10);
    
    // 卡片背景
    pdf.setFillColor(25, 25, 35);
    pdf.setDrawColor(140, 110, 70);
    pdf.setLineWidth(0.5);
    pdf.rect(cardX, cardY, cardWidth, cardHeight, 'FD');
    
    // 柱名稱
    pdf.setFontSize(9);
    pdf.setTextColor(180, 150, 90);
    pdf.text(pillarLabels[index], cardX + cardWidth / 2, cardY + 8, { align: "center" });
    
    // 天干地支
    pdf.setFontSize(18);
    pdf.setTextColor(220, 200, 140);
    pdf.text(`${pillar.stem}${pillar.branch}`, cardX + cardWidth / 2, cardY + 25, { align: "center" });
    
    // 納音
    pdf.setFontSize(8);
    pdf.setTextColor(160, 140, 100);
    pdf.text(`納音：${nayin}`, cardX + cardWidth / 2, cardY + 35, { align: "center" });
    
    // 十神
    if (tenGod) {
      pdf.setFontSize(7);
      pdf.setTextColor(140, 120, 90);
      pdf.text(`十神：${tenGod.stem} / ${tenGod.branch}`, cardX + cardWidth / 2, cardY + 43, { align: "center" });
    }
    
    // 藏干
    if (hiddenStems.length > 0) {
      pdf.setFontSize(6);
      pdf.setTextColor(120, 100, 80);
      pdf.text(`藏干：${hiddenStems.join('、')}`, cardX + cardWidth / 2, cardY + 50, { align: "center" });
    }
  });
  
  y += cardHeight * 2 + 30;
  
  // 五行分析
  if (data.wuxing) {
    pdf.setFontSize(12);
    pdf.setTextColor(200, 170, 100);
    pdf.text("五行分布", margin, y, { align: "left" });
    y += 10;
    
    const elements = [
      { name: '木', value: data.wuxing.wood, color: [100, 180, 100] as [number, number, number] },
      { name: '火', value: data.wuxing.fire, color: [200, 100, 100] as [number, number, number] },
      { name: '土', value: data.wuxing.earth, color: [180, 150, 100] as [number, number, number] },
      { name: '金', value: data.wuxing.metal, color: [200, 200, 180] as [number, number, number] },
      { name: '水', value: data.wuxing.water, color: [100, 150, 200] as [number, number, number] },
    ];
    
    const total = Object.values(data.wuxing).reduce((a, b) => a + b, 0);
    const barMaxWidth = 100;
    
    elements.forEach((el, idx) => {
      const barY = y + idx * 12;
      const barWidth = total > 0 ? (el.value / total) * barMaxWidth : 0;
      
      // 標籤
      pdf.setFontSize(9);
      pdf.setTextColor(180, 170, 150);
      pdf.text(el.name, margin, barY + 4, { align: "left" });
      
      // 進度條背景
      pdf.setFillColor(40, 40, 50);
      pdf.rect(margin + 15, barY, barMaxWidth, 8, 'F');
      
      // 進度條
      pdf.setFillColor(...el.color);
      pdf.rect(margin + 15, barY, barWidth, 8, 'F');
      
      // 數值
      pdf.setFontSize(8);
      pdf.setTextColor(160, 160, 160);
      pdf.text(`${el.value}`, margin + 120, barY + 5, { align: "left" });
    });
    
    y += 70;
  }
  
  // 陰陽比例
  if (data.yinyang) {
    pdf.setFontSize(12);
    pdf.setTextColor(200, 170, 100);
    pdf.text("陰陽比例", margin, y, { align: "left" });
    y += 10;
    
    const total = data.yinyang.yin + data.yinyang.yang;
    const yangWidth = total > 0 ? (data.yinyang.yang / total) * 100 : 50;
    const yinWidth = 100 - yangWidth;
    
    // 陽
    pdf.setFillColor(200, 180, 100);
    pdf.rect(margin, y, yangWidth, 12, 'F');
    
    // 陰
    pdf.setFillColor(100, 100, 150);
    pdf.rect(margin + yangWidth, y, yinWidth, 12, 'F');
    
    // 標籤
    pdf.setFontSize(8);
    pdf.setTextColor(50, 50, 50);
    pdf.text(`陽 ${data.yinyang.yang}`, margin + 5, y + 8, { align: "left" });
    pdf.setTextColor(220, 220, 220);
    pdf.text(`陰 ${data.yinyang.yin}`, margin + 95, y + 8, { align: "right" });
  }
};

// 繪製軍團故事頁
const drawLegionStoryPage = (pdf: jsPDF, legionType: string, story: string, pillar: { stem: string; branch: string }, nayin: string) => {
  const pdfWidth = 210;
  const centerX = pdfWidth / 2;
  const margin = 18;
  let y = 32;
  
  // 背景
  pdf.setFillColor(15, 15, 20);
  pdf.rect(0, 0, pdfWidth, 297, 'F');
  drawTraditionalBorder(pdf, pdfWidth, 297);
  
  // 軍團配置
  const legionConfig: Record<string, { name: string; icon: string; color: [number, number, number] }> = {
    year: { name: "祖源軍團", icon: "👑", color: [234, 179, 8] },
    month: { name: "關係軍團", icon: "🤝", color: [16, 185, 129] },
    day: { name: "核心軍團", icon: "⭐", color: [168, 85, 247] },
    hour: { name: "未來軍團", icon: "🚀", color: [249, 115, 22] },
  };
  
  const config = legionConfig[legionType] || legionConfig.year;
  
  // 軍團標題
  pdf.setFontSize(16);
  pdf.setTextColor(...config.color);
  pdf.text(`${config.icon} ${config.name}`, centerX, y, { align: "center" });
  y += 12;
  
  // 柱位資訊
  pdf.setFontSize(12);
  pdf.setTextColor(200, 180, 140);
  pdf.text(`${pillar.stem}${pillar.branch} · ${nayin}`, centerX, y, { align: "center" });
  y += 15;
  
  // 分隔線
  pdf.setDrawColor(140, 110, 70);
  pdf.setLineWidth(0.5);
  pdf.line(margin + 20, y, pdfWidth - margin - 20, y);
  y += 12;
  
  // 故事內容
  pdf.setFontSize(10);
  pdf.setTextColor(180, 175, 165);
  
  // 文字自動換行
  const maxWidth = pdfWidth - margin * 2 - 10;
  const lineHeight = 6;
  const paragraphs = story.split('\n').filter(p => p.trim());
  
  paragraphs.forEach(paragraph => {
    const lines = pdf.splitTextToSize(paragraph, maxWidth);
    lines.forEach((line: string) => {
      if (y > 270) return; // 防止超出頁面
      pdf.text(line, margin + 5, y);
      y += lineHeight;
    });
    y += 4; // 段落間距
  });
};

// 繪製神煞分析頁
const drawShenshaPage = (pdf: jsPDF, shensha: ShenshaItem[], pageIndex: number) => {
  const pdfWidth = 210;
  const centerX = pdfWidth / 2;
  const margin = 18;
  let y = 32;
  
  // 背景
  pdf.setFillColor(15, 15, 20);
  pdf.rect(0, 0, pdfWidth, 297, 'F');
  drawTraditionalBorder(pdf, pdfWidth, 297);
  
  // 頁面標題
  pdf.setFontSize(14);
  pdf.setTextColor(200, 170, 100);
  const titleText = pageIndex === 0 ? "神煞分析" : `神煞分析（續 ${pageIndex + 1}）`;
  pdf.text(titleText, centerX, y, { align: "center" });
  y += 8;
  
  // 副標題
  pdf.setFontSize(8);
  pdf.setTextColor(140, 130, 100);
  pdf.text("命盤中的特殊星曜與其解讀", centerX, y, { align: "center" });
  y += 12;
  
  // 分類顏色配置
  const categoryColors: Record<string, [number, number, number]> = {
    "吉神": [100, 200, 100],
    "貴人": [200, 180, 100],
    "桃花": [255, 150, 180],
    "凶煞": [200, 100, 100],
    "特殊": [150, 150, 200],
  };
  
  // 稀有度配置
  const rarityConfig: Record<string, { text: string; color: [number, number, number] }> = {
    "SSR": { text: "極稀有", color: [255, 200, 50] },
    "SR": { text: "稀有", color: [200, 150, 255] },
    "R": { text: "普通", color: [150, 200, 255] },
  };
  
  // 每個神煞的卡片
  const cardHeight = 32;
  const cardWidth = pdfWidth - margin * 2;
  const maxItemsPerPage = 7;
  
  shensha.forEach((item, index) => {
    if (index >= maxItemsPerPage) return;
    
    const cardY = y + index * (cardHeight + 4);
    
    // 卡片背景
    pdf.setFillColor(25, 25, 35);
    pdf.setDrawColor(100, 80, 60);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, cardY, cardWidth, cardHeight, 'FD');
    
    // 左側分類色條
    const category = item.category || "特殊";
    const categoryColor = categoryColors[category] || categoryColors["特殊"];
    pdf.setFillColor(...categoryColor);
    pdf.rect(margin, cardY, 3, cardHeight, 'F');
    
    // 神煞名稱
    pdf.setFontSize(12);
    pdf.setTextColor(220, 200, 140);
    pdf.text(item.name, margin + 8, cardY + 10);
    
    // 稀有度標籤
    if (item.rarity && rarityConfig[item.rarity]) {
      const rarity = rarityConfig[item.rarity];
      pdf.setFontSize(7);
      pdf.setTextColor(...rarity.color);
      pdf.text(`[${rarity.text}]`, margin + 8 + pdf.getTextWidth(item.name) + 4, cardY + 10);
    }
    
    // 分類標籤
    pdf.setFontSize(7);
    pdf.setTextColor(...categoryColor);
    pdf.text(category, margin + cardWidth - 20, cardY + 10, { align: "right" });
    
    // 落宮位置
    if (item.position) {
      pdf.setFontSize(8);
      pdf.setTextColor(160, 140, 100);
      pdf.text(`落於：${item.position}`, margin + 8, cardY + 18);
    }
    
    // 效果說明
    if (item.effect) {
      pdf.setFontSize(8);
      pdf.setTextColor(150, 145, 135);
      const effectText = pdf.splitTextToSize(`效果：${item.effect}`, cardWidth - 20);
      effectText.slice(0, 2).forEach((line: string, lineIdx: number) => {
        pdf.text(line, margin + 8, cardY + (item.position ? 25 : 18) + lineIdx * 5);
      });
    }
    
    // 現代解讀（如果有空間）
    if (item.modernMeaning && !item.position) {
      pdf.setFontSize(7);
      pdf.setTextColor(120, 115, 105);
      const modernText = pdf.splitTextToSize(`現代解讀：${item.modernMeaning}`, cardWidth - 20);
      pdf.text(modernText[0] || '', margin + 8, cardY + 28);
    }
  });
  
  // 頁面底部說明
  y = 265;
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text("神煞解讀僅供參考，命運掌握在自己手中", centerX, y, { align: "center" });
};

// 主要導出函數
export const generatePDF = async (_elementId: string, fileName: string, coverData?: CoverPageData, reportData?: ReportData) => {
  const pdfWidth = 210;
  const pdfHeight = 297;
  
  // 創建 PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // 獲取當前日期時間
  const now = new Date();
  const dateStr = now.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const timeStr = now.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // 計算總頁數
  let totalPages = 1; // 封面
  if (reportData) {
    totalPages += 1; // 四柱詳解頁
    // 神煞分析頁
    if (reportData.shensha && reportData.shensha.length > 0) {
      totalPages += Math.ceil(reportData.shensha.length / 7);
    }
    // 軍團故事頁
    const storyTypes = ['year', 'month', 'day', 'hour'] as const;
    storyTypes.forEach(type => {
      if (reportData.legionStories?.[type]) {
        totalPages += 1;
      }
    });
  }
  
  // 繪製封面
  if (coverData) {
    drawCoverPage(pdf, coverData);
  } else {
    // 簡單封面
    pdf.setFillColor(15, 15, 20);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    drawTraditionalBorder(pdf, pdfWidth, pdfHeight);
    pdf.setFontSize(24);
    pdf.setTextColor(200, 170, 100);
    pdf.text("八字人生兵法", pdfWidth / 2, pdfHeight / 2, { align: "center" });
  }
  
  // 繪製報告內容頁
  if (reportData) {
    let pageNum = 1;
    
    // 四柱詳解頁
    pdf.addPage();
    pageNum++;
    drawPillarsPage(pdf, reportData);
    drawHeaderFooter(pdf, pageNum, totalPages, dateStr, timeStr);
    
    // 神煞分析頁
    if (reportData.shensha && reportData.shensha.length > 0) {
      const shenshaPerPage = 7;
      const totalShenshaPages = Math.ceil(reportData.shensha.length / shenshaPerPage);
      
      for (let i = 0; i < totalShenshaPages; i++) {
        pdf.addPage();
        pageNum++;
        const pageItems = reportData.shensha.slice(i * shenshaPerPage, (i + 1) * shenshaPerPage);
        drawShenshaPage(pdf, pageItems, i);
        drawHeaderFooter(pdf, pageNum, totalPages, dateStr, timeStr);
      }
    }
    
    // 軍團故事頁
    const storyTypes = ['year', 'month', 'day', 'hour'] as const;
    storyTypes.forEach(type => {
      const story = reportData.legionStories?.[type];
      if (story) {
        pdf.addPage();
        pageNum++;
        drawLegionStoryPage(pdf, type, story, reportData.pillars[type], reportData.nayin[type]);
        drawHeaderFooter(pdf, pageNum, totalPages, dateStr, timeStr);
      }
    });
  }

  // 下載 PDF
  pdf.save(fileName);
};

// 保持向後兼容的簡化版本
export const generateSimplePDF = async (elementId: string, fileName: string, coverData?: CoverPageData) => {
  await generatePDF(elementId, fileName, coverData);
};
