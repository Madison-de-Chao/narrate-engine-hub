// 這是修改後的 handleDownloadReport 函數，用於替換 Index.tsx 中的對應函數

const handleDownloadReport = async (_options?: DialogPdfOptions) => {
  if (!baziResult) return;
  
  // 準備報告資料
  const shenshaForPdf = baziResult.shensha
    .filter((s): s is ShenshaMatch => typeof s !== 'string' && 'name' in s)
    .map((s) => ({
      name: s.name,
      position: s.evidence?.matched_pillar || '',
      category: s.category,
      effect: s.effect,
      modernMeaning: s.modernMeaning,
      rarity: s.rarity,
    }));

  const birthDateStr = baziResult.birthDate instanceof Date 
    ? baziResult.birthDate.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })
    : String(baziResult.birthDate);

  const reportData: ReportData = {
    name: baziResult.name,
    gender: baziResult.gender,
    birthDate: birthDateStr,
    pillars: baziResult.pillars,
    nayin: baziResult.nayin,
    tenGods: baziResult.tenGods,
    hiddenStems: baziResult.hiddenStems,
    wuxing: baziResult.wuxing,
    yinyang: baziResult.yinyang,
    legionStories: baziResult.legionStories,
    shensha: shenshaForPdf,
  };
  
  // 跳轉到列印預覽頁面
  navigate('/report/print', { state: { reportData } });
};
