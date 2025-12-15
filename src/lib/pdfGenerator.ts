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
    // 使用 html2canvas 將 HTML 轉換為 canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      // 避免 html2canvas 嘗試移除已被清掉的容器而觸發 NotFoundError
      removeContainer: false,
    });

    // 計算 PDF 尺寸
    const imgWidth = 210; // A4 寬度 (mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // 創建 PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    
    // 如果內容高度超過一頁，需要分頁
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 高度

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
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
