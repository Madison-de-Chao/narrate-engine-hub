import html2canvas from "html2canvas";
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

// 繪製封面頁
const drawCoverPage = (pdf: jsPDF, data: CoverPageData) => {
  const pdfWidth = 210;
  const pdfHeight = 297;
  
  // 深色背景
  pdf.setFillColor(10, 10, 15);
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

// 繪製頁面標題裝飾線
const drawTitleDecoration = (pdf: jsPDF, x: number, y: number, width: number) => {
  pdf.setDrawColor(160, 130, 80);
  pdf.setLineWidth(0.5);
  
  // 左側裝飾
  pdf.line(x, y, x + 30, y);
  pdf.circle(x + 33, y, 1.5, 'S');
  
  // 右側裝飾
  pdf.line(x + width - 30, y, x + width, y);
  pdf.circle(x + width - 33, y, 1.5, 'S');
};

export const generatePDF = async (elementId: string, fileName: string, coverData?: CoverPageData) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("找不到要下載的元素");
  }

  const cleanupClone = () => {
    document.querySelectorAll(".html2canvas-container").forEach((container) => {
      (container as HTMLElement).remove();
    });
  };

  try {
    // 為 PDF 添加專用樣式
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(style);

    // 確保所有圖片都已載入
    const images = element.querySelectorAll('img');
    await Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            }
          })
      )
    );

    // 使用 html2canvas 將 HTML 轉換為 canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#0a0a0f",
      removeContainer: true,
      allowTaint: true,
      imageTimeout: 30000,
      onclone: (clonedDoc) => {
        // 移除可能導致問題的動畫元素
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.querySelectorAll('.animate-pulse, .animate-spin').forEach((el) => {
            (el as HTMLElement).style.animation = 'none';
          });
          // 確保所有元素都有明確的寬高
          clonedElement.querySelectorAll('canvas').forEach((canvasEl) => {
            if ((canvasEl as HTMLCanvasElement).width === 0 || (canvasEl as HTMLCanvasElement).height === 0) {
              (canvasEl as HTMLElement).style.display = 'none';
            }
          });
        }
      }
    });

    // 移除臨時樣式
    document.head.removeChild(style);

    // A4 尺寸
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15;
    const headerHeight = 25;
    const footerHeight = 18;
    const contentWidth = pdfWidth - (margin * 2);
    
    // 計算內容尺寸
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
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

    // 計算總頁數（加1是因為有封面頁）
    const pageContentHeight = pdfHeight - headerHeight - footerHeight;
    const totalContentPages = Math.ceil(imgHeight / pageContentHeight);
    const hasCover = !!coverData;
    const totalPages = totalContentPages + (hasCover ? 1 : 0);
    
    // 如果有封面資料，先繪製封面
    if (coverData) {
      drawCoverPage(pdf, coverData);
    }
    
    // 添加主圖片
    const imgData = canvas.toDataURL("image/png", 1.0);
    
    for (let page = 0; page < totalContentPages; page++) {
      // 封面後的每一頁都需要新增頁面
      pdf.addPage();
      
      // 深色背景
      pdf.setFillColor(10, 10, 15);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // 添加傳統邊框
      drawTraditionalBorder(pdf, pdfWidth, pdfHeight);
      
      // 頁眉
      pdf.setFontSize(12);
      pdf.setTextColor(200, 170, 100); // 金色標題
      pdf.text("虹靈御所八字人生兵法", pdfWidth / 2, 14, { align: "center" });
      
      pdf.setFontSize(8);
      pdf.setTextColor(140, 140, 140);
      pdf.text("軍團戰略命理系統", pdfWidth / 2, 19, { align: "center" });
      
      // 標題裝飾線
      drawTitleDecoration(pdf, margin, 22, contentWidth);
      
      // 添加印章 (僅首頁)
      if (page === 0) {
        drawSeal(pdf, pdfWidth - 28, 16, "御所");
      }
      
      // 計算當前頁的圖片裁切
      const sourceY = page * pageContentHeight * (canvas.width / imgWidth);
      const sourceHeight = Math.min(
        pageContentHeight * (canvas.width / imgWidth),
        canvas.height - sourceY
      );
      
      // 創建裁切後的 canvas
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, sourceHeight,
          0, 0, canvas.width, sourceHeight
        );
        
        const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
        
        pdf.addImage(
          pageImgData,
          "PNG",
          margin,
          headerHeight,
          imgWidth,
          pageImgHeight,
          undefined,
          'FAST'
        );
      }
      
      // 頁尾
      pdf.setDrawColor(100, 80, 50);
      pdf.setLineWidth(0.3);
      pdf.line(margin, pdfHeight - footerHeight + 2, pdfWidth - margin, pdfHeight - footerHeight + 2);
      
      pdf.setFontSize(6);
      pdf.setTextColor(120, 120, 120);
      
      // 左側日期
      pdf.text(`製表日期：${dateStr} ${timeStr}`, margin, pdfHeight - 12);
      
      // 版權宣告
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        "© 2025 虹靈御所 HongLing YuSuo｜超烜創意 Chaoxuan Creative",
        pdfWidth / 2,
        pdfHeight - 12,
        { align: "center" }
      );
      
      // 哲學語句
      pdf.setFontSize(5);
      pdf.setTextColor(80, 80, 80);
      pdf.text(
        "本報告僅供參考，命理展示的是一條「相對好走但不一定是你要走的路」，選擇權在於你",
        pdfWidth / 2,
        pdfHeight - 7,
        { align: "center" }
      );
      
      // 右側頁碼（內容頁從第2頁開始，封面是第1頁）
      pdf.setFontSize(6);
      pdf.setTextColor(140, 140, 140);
      const currentPage = hasCover ? page + 2 : page + 1;
      pdf.text(`第 ${currentPage} 頁 / 共 ${totalPages} 頁`, pdfWidth - margin, pdfHeight - 12, { align: "right" });
    }

    // 下載 PDF
    pdf.save(fileName);
  } catch (error) {
    console.error("生成 PDF 時發生錯誤:", error);
    throw error;
  } finally {
    cleanupClone();
  }
};
