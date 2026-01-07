/**
 * 開運建議模板 - 根據日主五行與強弱狀態提供個性化建議
 * 10 種組合：5 五行 × 2 強弱狀態
 */

export interface FortuneAdvice {
  favorable: string;
  unfavorable: string;
  lifestyle: string;
  career: string;
  relationship: string;
  health: string;
  luckyItems: string[];
  luckyColors: string[];
  luckyDirections: string[];
}

export interface ElementStrengthAdvice {
  strong: FortuneAdvice;
  weak: FortuneAdvice;
  balanced: FortuneAdvice;
}

// 日主五行 + 強弱 開運建議模板
export const FORTUNE_ADVICE_TEMPLATES: Record<string, ElementStrengthAdvice> = {
  // ===== 木日主 =====
  wood: {
    strong: {
      favorable: '從事創意表達（火）、投資理財（土）或管理規範（金）相關工作，將旺盛精力轉化為成果',
      unfavorable: '過度依賴學習進修（水）或與同行競爭內耗（木），易造成精力過剩無處宣洩',
      lifestyle: '多參與戶外活動消耗精力，避免久坐；適合創業或承擔領導角色',
      career: '適合創意產業、投資管理、法律仲裁、建築設計等需要決斷力的行業',
      relationship: '主動付出關懷，避免過度控制；學習傾聽與妥協，感情更和諧',
      health: '注意肝膽疏泄，避免壓抑情緒；多運動促進氣血循環',
      luckyItems: ['紅色水晶', '陶瓷擺件', '金屬飾品'],
      luckyColors: ['紅', '橙', '黃', '白'],
      luckyDirections: ['南方', '西方', '中央']
    },
    weak: {
      favorable: '多親近貴人前輩（水）、與志同道合者合作（木），從穩健的環境中成長',
      unfavorable: '過度追求財富（土）或承擔過大責任壓力（金），易耗損本就不足的精力',
      lifestyle: '保持規律作息，避免過度勞累；多親近大自然，吸收木氣',
      career: '適合教育、文化、環保、醫療等滋養型行業，或跟隨有實力的團隊發展',
      relationship: '尋找能支持你的伴侶，避免消耗型關係；重視家庭後援',
      health: '養護肝臟，多吃綠色蔬菜；保持情緒穩定，避免暴怒傷肝',
      luckyItems: ['綠植盆栽', '水晶球', '木質手串'],
      luckyColors: ['綠', '藍', '黑'],
      luckyDirections: ['東方', '北方']
    },
    balanced: {
      favorable: '保持現有的平衡狀態，適度發展各方面能力',
      unfavorable: '避免極端行為，不宜過度追求任何單一目標',
      lifestyle: '維持均衡的生活節奏，工作與休息並重',
      career: '適合多元發展，可嘗試跨領域合作',
      relationship: '以平等互惠為原則，維持感情的動態平衡',
      health: '注重整體調理，不偏廢任何養生方法',
      luckyItems: ['五行平衡擺件'],
      luckyColors: ['綠', '自然色系'],
      luckyDirections: ['東方']
    }
  },

  // ===== 火日主 =====
  fire: {
    strong: {
      favorable: '投入務實穩定的領域（土）、追求物質成就（金）或承擔社會責任（水），讓熱情有具體出口',
      unfavorable: '過度學習思考（木）或與人爭強好勝（火），易導致躁動不安、過度消耗',
      lifestyle: '學習沉靜內斂，避免衝動行事；培養耐心，先想後做',
      career: '適合房地產、金融投資、政府機構、水利環保等需要穩定性的行業',
      relationship: '控制熱情的表達頻率，給對方空間；避免過度追求或掌控',
      health: '注意心臟血壓，避免過度亢奮；多喝水，保持內心平靜',
      luckyItems: ['黃水晶', '金銀飾品', '藍色配件'],
      luckyColors: ['黃', '白', '藍', '黑'],
      luckyDirections: ['中央', '西方', '北方']
    },
    weak: {
      favorable: '多接觸文化知識（木）、與熱情積極的人為伍（火），從中汲取能量與動力',
      unfavorable: '過度追求穩定安逸（土）或承受過大壓力責任（水），易澆熄本就微弱的熱情',
      lifestyle: '多曬太陽，保持積極樂觀；參與激勵人心的活動，點燃內在火焰',
      career: '適合教育培訓、文化創意、演藝傳媒等能激發熱情的行業',
      relationship: '尋找能點燃你熱情的伴侶，避免過於冷淡的關係',
      health: '溫養心臟，避免寒涼食物；保持運動習慣，促進血液循環',
      luckyItems: ['紅寶石', '綠植', '木質飾品'],
      luckyColors: ['紅', '橙', '綠'],
      luckyDirections: ['南方', '東方']
    },
    balanced: {
      favorable: '維持熱情與理性的平衡，適度表達自我',
      unfavorable: '避免大起大落的情緒波動',
      lifestyle: '規律但不失活力的生活方式',
      career: '適合需要熱情但也要求穩定的職位',
      relationship: '真誠熱情但不過度，保持適當距離',
      health: '心臟保養與情緒管理並重',
      luckyItems: ['紅色配飾'],
      luckyColors: ['紅', '紫'],
      luckyDirections: ['南方']
    }
  },

  // ===== 土日主 =====
  earth: {
    strong: {
      favorable: '發展專業技能（金）、拓展社交人脈（水）或承擔挑戰性任務（木），將厚重實力轉化為成就',
      unfavorable: '過度沉迷學習不付諸行動（火）或守成不變（土），易造成固執保守、錯失良機',
      lifestyle: '走出舒適圈，接受新挑戰；避免過度囤積，學會流通與分享',
      career: '適合金融科技、貿易物流、法律諮詢、企業管理等需要開拓性的行業',
      relationship: '主動表達感受，避免悶在心裡；接納變化，感情更有活力',
      health: '注意脾胃消化，避免過度進補；多運動防止體重增加',
      luckyItems: ['白水晶', '藍寶石', '綠色植物'],
      luckyColors: ['白', '藍', '綠'],
      luckyDirections: ['西方', '北方', '東方']
    },
    weak: {
      favorable: '多接受溫暖關懷（火）、與踏實可靠的人合作（土），建立穩固的根基與支持系統',
      unfavorable: '過度追求技能變現（金）或分散精力於太多目標（水），易動搖本就不穩的根基',
      lifestyle: '建立規律的生活節奏，培養穩定的人際關係；避免頻繁變動',
      career: '適合農業、餐飲、行政、服務業等穩健型行業，或選擇有保障的大型組織',
      relationship: '尋找能給你安全感的伴侶，重視家庭的穩定與溫暖',
      health: '養護脾胃，三餐定時定量；多接觸土地，如園藝或郊遊',
      luckyItems: ['黃玉', '紅瑪瑙', '陶瓷器物'],
      luckyColors: ['黃', '紅', '橙'],
      luckyDirections: ['中央', '南方']
    },
    balanced: {
      favorable: '維持穩定中求發展的態度',
      unfavorable: '避免過度保守或過度冒進',
      lifestyle: '穩中求進，適度接受新事物',
      career: '適合需要穩定性但也有發展空間的職位',
      relationship: '踏實經營，細水長流',
      health: '脾胃調理是養生根本',
      luckyItems: ['黃色系飾品'],
      luckyColors: ['黃', '棕'],
      luckyDirections: ['中央']
    }
  },

  // ===== 金日主 =====
  metal: {
    strong: {
      favorable: '發展智慧謀略（水）、追求創意自由（木）或接受熱情洗禮（火），將鋒利化為柔韌',
      unfavorable: '過度追求穩定資源（土）或與人爭鋒相對（金），易造成剛愎自用、人際衝突',
      lifestyle: '學習柔軟變通，避免過度強硬；培養藝術審美，增添生活情趣',
      career: '適合科研開發、創意設計、國際貿易、文化藝術等需要靈活性的行業',
      relationship: '放下標準與要求，接納對方的不完美；學習表達溫柔的一面',
      health: '注意肺部呼吸系統，避免過度壓抑情緒；多做深呼吸與冥想',
      luckyItems: ['藍水晶', '綠幽靈', '紅色配件'],
      luckyColors: ['藍', '綠', '紅'],
      luckyDirections: ['北方', '東方', '南方']
    },
    weak: {
      favorable: '多獲取資源支持（土）、與有實力的人結盟（金），逐步建立自己的專業權威',
      unfavorable: '過度消耗精力於研究思考（水）或分散資源於多個項目（木），易使本就薄弱的實力更加分散',
      lifestyle: '專注發展核心專業，避免分心；重視積累與儲蓄',
      career: '適合金融財務、精密工藝、司法法律等需要專業深度的行業',
      relationship: '尋找能給你支持與資源的伴侶，重視務實的生活基礎',
      health: '養護肺氣，多做呼吸練習；避免過度勞累，保持充足睡眠',
      luckyItems: ['黃水晶', '白玉', '金屬飾品'],
      luckyColors: ['黃', '白', '金'],
      luckyDirections: ['中央', '西方']
    },
    balanced: {
      favorable: '在堅持原則與靈活變通間取得平衡',
      unfavorable: '避免過度完美主義',
      lifestyle: '維持專業形象但不失親和力',
      career: '適合專業性強但也需人際互動的職位',
      relationship: '真誠但不過度挑剔',
      health: '肺部保養，注意呼吸道健康',
      luckyItems: ['金銀飾品'],
      luckyColors: ['白', '銀'],
      luckyDirections: ['西方']
    }
  },

  // ===== 水日主 =====
  water: {
    strong: {
      favorable: '投入創意發展（木）、追求成就表現（火）或建立穩定根基（土），讓智慧落地生根',
      unfavorable: '過度沉迷研究分析（金）或流於空想漂泊（水），易造成想法太多行動太少',
      lifestyle: '將想法付諸實踐，設定具體目標；避免過度社交，專注核心事務',
      career: '適合創意產業、教育培訓、市場行銷、房地產等需要將想法落地的行業',
      relationship: '選定目標後專一經營，避免三心二意；用行動證明真心',
      health: '注意腎臟泌尿系統，避免過度操勞；保持情緒穩定，避免憂思過度',
      luckyItems: ['綠幽靈', '紅瑪瑙', '黃玉'],
      luckyColors: ['綠', '紅', '黃'],
      luckyDirections: ['東方', '南方', '中央']
    },
    weak: {
      favorable: '多獲取專業資源（金）、與智慧型的人交流學習（水），厚積薄發提升內涵',
      unfavorable: '過度追求表現與成就（火）或承擔過大責任壓力（土），易使本就薄弱的精力更加耗散',
      lifestyle: '保持低調，專注學習與積累；避免過度消耗精力，量力而行',
      career: '適合研究開發、諮詢顧問、學術教育等需要深度思考的行業',
      relationship: '尋找能在精神上支持你的伴侶，重視心靈的交流與共鳴',
      health: '養護腎氣，避免過度消耗；保持充足睡眠，適度補充水分',
      luckyItems: ['黑曜石', '白水晶', '金屬擺件'],
      luckyColors: ['黑', '藍', '白'],
      luckyDirections: ['北方', '西方']
    },
    balanced: {
      favorable: '在思考與行動間保持平衡',
      unfavorable: '避免過度分析導致決策延遲',
      lifestyle: '靈活適應變化但不失方向感',
      career: '適合需要智慧與應變能力的職位',
      relationship: '深情但不過度依賴',
      health: '腎臟保養，注意水液代謝',
      luckyItems: ['藍色水晶'],
      luckyColors: ['藍', '黑'],
      luckyDirections: ['北方']
    }
  }
};

// 根據日主五行和強弱獲取開運建議
export function getFortuneAdvice(
  dayMasterElement: string,
  strength: '身強' | '身弱' | '中和'
): FortuneAdvice {
  const elementAdvice = FORTUNE_ADVICE_TEMPLATES[dayMasterElement];
  if (!elementAdvice) {
    return FORTUNE_ADVICE_TEMPLATES.earth.balanced; // 預設
  }

  switch (strength) {
    case '身強':
      return elementAdvice.strong;
    case '身弱':
      return elementAdvice.weak;
    case '中和':
    default:
      return elementAdvice.balanced;
  }
}

// 獲取完整的開運建議文字
export function getDetailedAdvice(
  dayMasterElement: string,
  strength: '身強' | '身弱' | '中和'
): {
  summary: { favorable: string; unfavorable: string };
  details: {
    lifestyle: string;
    career: string;
    relationship: string;
    health: string;
  };
  lucky: {
    items: string[];
    colors: string[];
    directions: string[];
  };
} {
  const advice = getFortuneAdvice(dayMasterElement, strength);
  
  return {
    summary: {
      favorable: advice.favorable,
      unfavorable: advice.unfavorable
    },
    details: {
      lifestyle: advice.lifestyle,
      career: advice.career,
      relationship: advice.relationship,
      health: advice.health
    },
    lucky: {
      items: advice.luckyItems,
      colors: advice.luckyColors,
      directions: advice.luckyDirections
    }
  };
}
