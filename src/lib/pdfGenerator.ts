import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
      scale: 2.5, // 更高解析度
      useCORS: true,
      logging: false,
      backgroundColor: "#0a0a0f", // 深色背景
      removeContainer: false,
      allowTaint: true,
      imageTimeout: 15000,
    });

    // 移除臨時樣式
    document.head.removeChild(style);

    // A4 尺寸
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
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

    // 添加深色背景
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    // 添加頁眉
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text("虹靈御所八字人生兵法 | 軍團戰略命理系統", margin, 6);
    pdf.text(new Date().toLocaleDateString("zh-TW"), pdfWidth - margin, 6, { align: "right" });

    // 添加主圖片
    const imgData = canvas.toDataURL("image/png", 1.0);
    let yPosition = 12;
    
    // 計算分頁
    const pageContentHeight = pdfHeight - 24; // 扣除頁眉頁尾空間
    let heightLeft = imgHeight;
    let currentY = 0;
    let pageNum = 1;

    // 第一頁
    const firstPageHeight = Math.min(pageContentHeight, imgHeight);
    pdf.addImage(
      imgData, 
      "PNG", 
      margin, 
      yPosition, 
      imgWidth, 
      imgHeight,
      undefined,
      'FAST'
    );

    heightLeft -= pageContentHeight;

    // 添加更多頁面
    while (heightLeft > 0) {
      pdf.addPage();
      pageNum++;
      
      // 添加深色背景
      pdf.setFillColor(10, 10, 15);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // 添加頁眉
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text("虹靈御所八字人生兵法 | 軍團戰略命理系統", margin, 6);
      pdf.text(`第 ${pageNum} 頁`, pdfWidth - margin, 6, { align: "right" });

      currentY -= pageContentHeight;
      
      pdf.addImage(
        imgData, 
        "PNG", 
        margin, 
        currentY + yPosition, 
        imgWidth, 
        imgHeight,
        undefined,
        'FAST'
      );

      heightLeft -= pageContentHeight;
    }

    // 添加頁尾
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      
      // 底部信息
      pdf.text(
        "命理展示的是一條「相對好走但不一定是你要走的路」。這是上天給予的天賦與建議，而非不可改變的宿命。",
        pdfWidth / 2,
        pdfHeight - 6,
        { align: "center" }
      );
      pdf.text(`${i} / ${totalPages}`, pdfWidth - margin, pdfHeight - 6, { align: "right" });
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
