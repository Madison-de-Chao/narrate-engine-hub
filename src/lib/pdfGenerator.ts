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
const drawSeal = (pdf: jsPDF, x: number, y: number, text: string) => {
  const sealSize = 18;
  
  // 印章外框
  pdf.setDrawColor(180, 50, 50);
  pdf.setLineWidth(1.2);
  pdf.rect(x - sealSize / 2, y - sealSize / 2, sealSize, sealSize);
  
  // 印章內框
  pdf.setLineWidth(0.4);
  pdf.rect(x - sealSize / 2 + 2, y - sealSize / 2 + 2, sealSize - 4, sealSize - 4);
  
  // 印章文字
  pdf.setTextColor(180, 50, 50);
  pdf.setFontSize(8);
  pdf.text(text, x, y + 3, { align: "center" });
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

export const generatePDF = async (elementId: string, fileName: string) => {
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

    // 使用 html2canvas 將 HTML 轉換為 canvas
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#0a0a0f",
      removeContainer: false,
      allowTaint: true,
      imageTimeout: 15000,
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

    // 計算總頁數
    const pageContentHeight = pdfHeight - headerHeight - footerHeight;
    const totalPages = Math.ceil(imgHeight / pageContentHeight);
    
    // 添加主圖片
    const imgData = canvas.toDataURL("image/png", 1.0);
    
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
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
      
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      
      // 左側日期
      pdf.text(`製表日期：${dateStr} ${timeStr}`, margin, pdfHeight - 10);
      
      // 中間哲學語句
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        "命理展示的是一條「相對好走但不一定是你要走的路」",
        pdfWidth / 2,
        pdfHeight - 10,
        { align: "center" }
      );
      
      // 右側頁碼
      pdf.setTextColor(140, 140, 140);
      pdf.text(`第 ${page + 1} 頁 / 共 ${totalPages} 頁`, pdfWidth - margin, pdfHeight - 10, { align: "right" });
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
