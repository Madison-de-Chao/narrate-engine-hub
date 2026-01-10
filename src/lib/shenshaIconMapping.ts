// 神煞圖標映射表
// 將神煞名稱映射到對應的圖標路徑

export const shenshaIconMapping: Record<string, string> = {
  '學堂': '/shensha_icons/xuetang.png',
  '天乙貴人': '/shensha_icons/tianyiguiren.png',
  '文昌貴人': '/shensha_icons/wenchangguiren.png',
  '天德貴人': '/shensha_icons/tiandeguiren.png',
  '月德貴人': '/shensha_icons/yuedeguiren.png',
  '桃花': '/shensha_icons/taohua.png',
  '驛馬': '/shensha_icons/yima.png',
  '華蓋': '/shensha_icons/huagai.png',
  '羊刃': '/shensha_icons/yangren.png',
  '祿神': '/shensha_icons/lushen.png',
  '空亡': '/shensha_icons/kongwang.png',
  '孤辰': '/shensha_icons/gucheng.png',
  '寡宿': '/shensha_icons/guasu.png',
  '劫煞': '/shensha_icons/jiesha.png',
};

// 獲取神煞圖標路徑
export const getShenshaIcon = (shenshaName: string): string | undefined => {
  // 精確匹配
  if (shenshaIconMapping[shenshaName]) {
    return shenshaIconMapping[shenshaName];
  }
  
  // 模糊匹配（處理可能的變體名稱）
  for (const [key, value] of Object.entries(shenshaIconMapping)) {
    if (shenshaName.includes(key) || key.includes(shenshaName)) {
      return value;
    }
  }
  
  return undefined;
};

// 檢查神煞是否有圖標
export const hasShenshaIcon = (shenshaName: string): boolean => {
  return getShenshaIcon(shenshaName) !== undefined;
};
