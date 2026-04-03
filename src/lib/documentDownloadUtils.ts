import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, ShadingType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface DocSection {
  title: string;
  items: string[];
}

export interface DocConfig {
  title: string;
  subtitle: string;
  filename: string;
  sections: DocSection[];
  appendixHtml?: string;
}

// ============ PDF 下載（html2canvas） ============
export const downloadDocPdf = async (
  config: DocConfig,
  setProgress: (p: number) => void,
  setStage: (s: string) => void
) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

  setStage('初始化 PDF 引擎...');
  setProgress(5);

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0; width: 794px;
    background: white; font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
  `;
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 封面
    setStage('生成封面...');
    setProgress(10);
    container.innerHTML = `
      <div style="width:794px;height:1123px;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:60px;box-sizing:border-box;position:relative;">
        <div style="position:absolute;inset:20px;border:2px solid #d4af37;border-radius:8px;"></div>
        <div style="position:absolute;inset:30px;border:1px solid #d4af3766;"></div>
        <div style="text-align:center;color:#d4af37;">
          <h1 style="font-size:48px;font-weight:bold;margin-bottom:16px;letter-spacing:4px;">虹靈御所</h1>
          <p style="font-size:24px;margin-bottom:8px;color:#fbbf24;">HONG LING YU SUO</p>
        </div>
        <div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,#d4af37,transparent);margin:40px 0;"></div>
        <h2 style="font-size:28px;color:white;font-weight:bold;margin-bottom:16px;text-align:center;">${config.title}</h2>
        <h3 style="font-size:20px;color:#94a3b8;margin-bottom:24px;text-align:center;">${config.subtitle}</h3>
        <p style="font-size:16px;color:#94a3b8;font-style:italic;margin-bottom:60px;">「這份分析是鏡子，不是劇本」</p>
        <div style="color:#64748b;font-size:14px;text-align:center;margin-top:auto;">
          <p>版本：v3.0</p>
          <p>日期：${dateStr}</p>
          <p>發行：超烜創意 / 虹靈御所</p>
        </div>
      </div>
    `;
    const coverCanvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
    pdf.addImage(coverCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // 目錄
    setStage('生成目錄...');
    setProgress(20);
    container.innerHTML = `
      <div style="width:794px;min-height:1123px;background:#fafafa;padding:60px;box-sizing:border-box;">
        <h2 style="font-size:28px;color:#1e3a8a;text-align:center;margin-bottom:40px;border-bottom:2px solid #d4af37;padding-bottom:16px;">目 錄</h2>
        <div style="padding:20px;">
          ${config.sections.map((s, i) => `
            <div style="display:flex;align-items:center;padding:12px 0;border-bottom:1px dashed #e5e7eb;">
              <span style="color:#d4af37;font-weight:bold;font-size:18px;width:30px;">${i + 1}.</span>
              <span style="color:#1f2937;font-size:16px;flex:1;">${s.title}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    pdf.addPage();
    const tocCanvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
    pdf.addImage(tocCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // 章節
    const total = config.sections.length;
    for (let i = 0; i < total; i++) {
      const section = config.sections[i];
      setProgress(25 + Math.floor((i / total) * 55));
      setStage(`生成章節 ${i + 1}/${total}: ${section.title}...`);

      container.innerHTML = `
        <div style="width:794px;min-height:1123px;background:#fafafa;padding:0;box-sizing:border-box;">
          <div style="background:linear-gradient(90deg,#0f172a,#1e3a5f);padding:20px 40px;margin-bottom:40px;">
            <h2 style="color:#d4af37;font-size:22px;margin:0;">第 ${i + 1} 章：${section.title}</h2>
          </div>
          <div style="padding:0 50px 50px;">
            ${section.items.map((item, j) => `
              <div style="margin-bottom:20px;padding:14px;background:white;border-left:3px solid #d4af37;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <span style="color:#1e3a8a;font-weight:bold;font-size:15px;">${j + 1}. </span>
                <span style="color:#374151;font-size:14px;line-height:1.8;">${item}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      pdf.addPage();
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    // 免責聲明
    setStage('生成免責聲明...');
    setProgress(90);
    container.innerHTML = `
      <div style="width:794px;min-height:1123px;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:60px;box-sizing:border-box;display:flex;flex-direction:column;">
        <h2 style="color:#d4af37;font-size:28px;text-align:center;margin-bottom:40px;">免責聲明</h2>
        <div style="background:rgba(255,255,255,0.05);border:1px solid #d4af3733;border-radius:8px;padding:40px;">
          <p style="color:#cbd5e1;font-size:14px;line-height:2;margin-bottom:16px;">1. 本報告為八字（命理）系統的結構化呈現與解讀參考，目的在於提供觀察角度與可執行建議。</p>
          <p style="color:#cbd5e1;font-size:14px;line-height:2;margin-bottom:16px;">2. 本內容不構成醫療診斷、心理治療、法律建議、財務／投資建議或任何形式之專業服務。</p>
          <p style="color:#cbd5e1;font-size:14px;line-height:2;margin-bottom:16px;">3. 文中之趨勢、傾向、可能性描述，不等同於保證結果；使用者仍需依自身狀況做出判斷與選擇。</p>
          <p style="color:#cbd5e1;font-size:14px;line-height:2;margin-bottom:16px;">4. 涉及健康、心理、法律、財務等重大議題，請尋求合格專業人士協助。</p>
          <p style="color:#cbd5e1;font-size:14px;line-height:2;">5. 使用本內容即表示你理解並同意以上聲明。</p>
        </div>
        <div style="margin-top:auto;text-align:center;color:#64748b;font-size:12px;">
          <p>© ${now.getFullYear()} 超烜創意 / 虹靈御所</p>
          <p>版本：RSBZS v3.0</p>
        </div>
      </div>
    `;
    pdf.addPage();
    const disclaimerCanvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
    pdf.addImage(disclaimerCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, pdfHeight);

    setStage('儲存 PDF 檔案...');
    setProgress(98);
    pdf.save(`${config.filename}_${now.toISOString().split('T')[0]}.pdf`);
    setProgress(100);
  } finally {
    document.body.removeChild(container);
  }
};

// ============ Word 下載（docx） ============
export const downloadDocWord = async (
  config: DocConfig,
  setProgress: (p: number) => void,
  setStage: (s: string) => void
) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });

  setStage('初始化 Word 引擎...');
  setProgress(10);

  const children: any[] = [];

  // 封面
  children.push(
    new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: '' })] }),
    new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: '' })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '虹 靈 御 所', bold: true, size: 72, color: '1E3A8A' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: 'HONG LING YU SUO', size: 32, color: 'D4AF37' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 12, color: 'D4AF37' },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: 'D4AF37' },
      },
      children: [new TextRun({ text: `  ${config.title}  `, bold: true, size: 48, color: '1E3A8A' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new TextRun({ text: config.subtitle, bold: true, size: 36, color: '333333' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: '「這份分析是鏡子，不是劇本」', italics: true, size: 28, color: '888888' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 600 },
      children: [new TextRun({ text: `版本：v3.0`, size: 28, color: '666666' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 100 },
      children: [new TextRun({ text: `日期：${dateStr}`, size: 28, color: '666666' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 100 },
      children: [new TextRun({ text: `發行：超烜創意 / 虹靈御所`, size: 28, color: '666666' })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // 目錄
  setStage('生成目錄...');
  setProgress(25);
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 600 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D4AF37' } },
      children: [new TextRun({ text: '目    錄', bold: true, size: 48, color: '1E3A8A' })],
    })
  );
  config.sections.forEach((s, i) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({ text: `第 ${i + 1} 章   `, size: 32, bold: true, color: 'D4AF37' }),
          new TextRun({ text: s.title, size: 32, color: '333333' }),
        ],
      })
    );
  });
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // 章節
  const total = config.sections.length;
  config.sections.forEach((section, idx) => {
    setProgress(30 + Math.floor((idx / total) * 45));
    setStage(`生成章節 ${idx + 1}/${total}: ${section.title}...`);

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 400 },
        shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
        children: [new TextRun({ text: `  第 ${idx + 1} 章：${section.title}  `, bold: true, size: 40, color: 'D4AF37' })],
      })
    );

    section.items.forEach((item, i) => {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({ text: `${i + 1}. `, bold: true, size: 28, color: '1E3A8A' }),
            new TextRun({ text: item, size: 28, color: '333333' }),
          ],
        })
      );
    });

    if (idx < total - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  // 免責聲明
  setStage('生成免責聲明...');
  setProgress(85);
  const disclaimers = [
    '1. 本報告為八字（命理）系統的結構化呈現與解讀參考，目的在於提供觀察角度與可執行建議。',
    '2. 本內容不構成醫療診斷、心理治療、法律建議、財務／投資建議或任何形式之專業服務。',
    '3. 文中之趨勢、傾向、可能性描述，不等同於保證結果；使用者仍需依自身狀況做出判斷與選擇。',
    '4. 涉及健康、心理、法律、財務等重大議題，請尋求合格專業人士協助。',
    '5. 使用本內容即表示你理解並同意以上聲明。',
  ];
  children.push(
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: 'D4AF37' },
        bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D4AF37' },
      },
      children: [new TextRun({ text: '  免 責 聲 明  ', bold: true, size: 44, color: '1E3A8A' })],
    })
  );
  disclaimers.forEach(d => {
    children.push(new Paragraph({ spacing: { before: 150, after: 150 }, children: [new TextRun({ text: d, size: 26, color: '444444' })] }));
  });
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 600 },
      children: [new TextRun({ text: `© ${now.getFullYear()} 超烜創意 / 虹靈御所`, size: 28, color: '666666' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 100 },
      children: [new TextRun({ text: '版本：RSBZS v3.0', size: 28, color: '666666' })],
    })
  );

  setStage('打包 Word 檔案...');
  setProgress(95);

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${config.filename}_${now.toISOString().split('T')[0]}.docx`);
  setProgress(100);
};
