/**
 * 命理角色轉譯模組 - 納音戰場數據
 * 六十甲子納音對應的戰場環境設定
 */

import type { NayinBattlefield, WuxingElement } from './types';

// 納音五行對照
const NAYIN_ELEMENTS: Record<string, WuxingElement> = {
  '海中金': '金', '爐中火': '火', '大林木': '木', '路旁土': '土', '劍鋒金': '金',
  '山頭火': '火', '澗下水': '水', '城頭土': '土', '白蠟金': '金', '楊柳木': '木',
  '泉中水': '水', '屋上土': '土', '霹靂火': '火', '松柏木': '木', '長流水': '水',
  '沙中金': '金', '山下火': '火', '平地木': '木', '壁上土': '土', '金箔金': '金',
  '覆燈火': '火', '天河水': '水', '大驛土': '土', '釵釧金': '金', '桑柘木': '木',
  '大溪水': '水', '沙中土': '土', '天上火': '火', '石榴木': '木', '大海水': '水'
};

// 納音戰場詳細設定
export const NAYIN_BATTLEFIELDS: Record<string, NayinBattlefield> = {
  '海中金': {
    name: '海中金',
    element: '金',
    environment: '深海寶藏之地，金光隱藏在無盡的海洋深處',
    advantages: ['隱藏實力', '防禦堅固', '深不可測'],
    challenges: ['行動受限', '難以發揮', '壓力沉重'],
    buffCondition: '金、水屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '火屬性角色在此戰場受到-30%削弱',
    storyContext: '在幽深的海底，金屬光芒閃爍其中，軍團必須適應水壓與黑暗，方能發掘隱藏的寶藏與力量。'
  },
  '爐中火': {
    name: '爐中火',
    element: '火',
    environment: '熔爐煉獄之地，烈火熊熊燃燒不息',
    advantages: ['鍛造提升', '淬煉意志', '火力全開'],
    challenges: ['持續消耗', '高溫灼傷', '急躁衝動'],
    buffCondition: '火、木屬性角色在此戰場獲得+25%戰力',
    debuffCondition: '金屬性角色在此戰場受到-35%削弱',
    storyContext: '烈焰之爐中，唯有經得起淬煉者方能百鍛成鋼，軍團在此地經受最嚴酷的試煉。'
  },
  '大林木': {
    name: '大林木',
    element: '木',
    environment: '蒼天巨木之林，參天大樹遮天蔽日',
    advantages: ['生機勃發', '隱蔽優勢', '資源豐富'],
    challenges: ['視野受阻', '地形複雜', '野獸出沒'],
    buffCondition: '木、水屬性角色在此戰場獲得+22%戰力',
    debuffCondition: '金屬性角色在此戰場受到-25%削弱',
    storyContext: '在古老的原始森林中，萬物蓬勃生長，軍團依托大樹的庇護，積蓄力量準備反攻。'
  },
  '路旁土': {
    name: '路旁土',
    element: '土',
    environment: '荒野驛道之地，塵土飛揚的行旅要道',
    advantages: ['行動自由', '補給便利', '情報流通'],
    challenges: ['無險可守', '暴露目標', '易遭伏擊'],
    buffCondition: '土、火屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '木屬性角色在此戰場受到-20%削弱',
    storyContext: '塵土飛揚的驛道上，軍團需保持警覺，隨時應對來自四面八方的挑戰。'
  },
  '劍鋒金': {
    name: '劍鋒金',
    element: '金',
    environment: '劍氣縱橫之地，銳利的劍光劃破長空',
    advantages: ['攻擊力強', '決斷果敢', '銳不可當'],
    challenges: ['殺氣過重', '傷敵一千自損八百', '過於激進'],
    buffCondition: '金、土屬性角色在此戰場獲得+28%戰力',
    debuffCondition: '木屬性角色在此戰場受到-35%削弱',
    storyContext: '劍氣衝霄的戰場上，唯有最銳利的意志才能存活，軍團在此展現其最強的戰鬥力。'
  },
  '山頭火': {
    name: '山頭火',
    element: '火',
    environment: '山巔烽火之地，火光照亮遠方',
    advantages: ['視野開闘', '居高臨下', '振奮士氣'],
    challenges: ['暴露位置', '風勢影響', '難以隱蔽'],
    buffCondition: '火、木屬性角色在此戰場獲得+22%戰力',
    debuffCondition: '水屬性角色在此戰場受到-25%削弱',
    storyContext: '山頂烽火台上，烈焰映照天際，軍團以此為據點，向四方發號施令。'
  },
  '澗下水': {
    name: '澗下水',
    element: '水',
    environment: '幽谷清泉之地，潺潺溪水流過山澗',
    advantages: ['隱蔽行動', '補給充足', '療傷恢復'],
    challenges: ['行動受限', '地形複雜', '容易被圍'],
    buffCondition: '水、金屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '土屬性角色在此戰場受到-22%削弱',
    storyContext: '幽深山澗中，清泉滋潤萬物，軍團在此休養生息，積蓄下一戰的力量。'
  },
  '城頭土': {
    name: '城頭土',
    element: '土',
    environment: '堅城高牆之地，固若金湯的堡壘',
    advantages: ['防禦堅固', '居高臨下', '資源儲備'],
    challenges: ['機動性差', '易被圍困', '糧草消耗'],
    buffCondition: '土、火屬性角色在此戰場獲得+25%戰力',
    debuffCondition: '木屬性角色在此戰場受到-20%削弱',
    storyContext: '高聳的城牆上，軍團據險而守，固若金湯的防線令敵人望而卻步。'
  },
  '白蠟金': {
    name: '白蠟金',
    element: '金',
    environment: '晶瑩剔透之地，精緻如白蠟般的金屬光澤',
    advantages: ['精緻細膩', '技術優勢', '品質保證'],
    challenges: ['過於脆弱', '經不起打擊', '實用性差'],
    buffCondition: '金、水屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '火屬性角色在此戰場受到-25%削弱',
    storyContext: '如白蠟般精緻的戰場，軍團需以巧勝拙，發揮技術優勢而非硬碰硬。'
  },
  '楊柳木': {
    name: '楊柳木',
    element: '木',
    environment: '柔韌楊柳之地，垂柳依依的水岸',
    advantages: ['柔韌適應', '以柔克剛', '恢復力強'],
    challenges: ['缺乏攻擊力', '過於被動', '容易退縮'],
    buffCondition: '木、水屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '金屬性角色在此戰場受到-15%削弱',
    storyContext: '楊柳岸邊，軍團學會以柔軟的姿態應對強敵，如柳枝般不折而彎。'
  },
  '泉中水': {
    name: '泉中水',
    element: '水',
    environment: '清澈泉眼之地，源源不斷的活水',
    advantages: ['資源不斷', '淨化療癒', '生生不息'],
    challenges: ['流動不定', '難以把握', '缺乏爆發'],
    buffCondition: '水、木屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '土屬性角色在此戰場受到-18%削弱',
    storyContext: '清泉汩汩而出，軍團在此獲得源源不斷的補給，維持長久的戰鬥力。'
  },
  '屋上土': {
    name: '屋上土',
    element: '土',
    environment: '屋脊高台之地，俯瞰萬家燈火',
    advantages: ['居高臨下', '庇護眾生', '穩定根基'],
    challenges: ['視野有限', '難以機動', '過於安逸'],
    buffCondition: '土、火屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '木屬性角色在此戰場受到-15%削弱',
    storyContext: '高處不勝寒，軍團在屋脊之上庇護百姓，承擔守護家園的責任。'
  },
  '霹靂火': {
    name: '霹靂火',
    element: '火',
    environment: '雷霆烈焰之地，電光火石的爆裂戰場',
    advantages: ['爆發力強', '出其不意', '威力驚人'],
    challenges: ['難以控制', '傷敵自傷', '不可持續'],
    buffCondition: '火、木屬性角色在此戰場獲得+30%戰力',
    debuffCondition: '金、水屬性角色在此戰場受到-30%削弱',
    storyContext: '雷電交加的戰場上，軍團如霹靂般一擊致命，以最猛烈的攻勢擊潰敵人。'
  },
  '松柏木': {
    name: '松柏木',
    element: '木',
    environment: '蒼松翠柏之地，四季常青的堅毅之林',
    advantages: ['堅韌不拔', '長青不衰', '意志堅定'],
    challenges: ['過於固執', '缺乏變通', '成長緩慢'],
    buffCondition: '木、水屬性角色在此戰場獲得+22%戰力',
    debuffCondition: '金屬性角色在此戰場受到-20%削弱',
    storyContext: '松柏長青之地，軍團學習到堅韌不拔的精神，無論寒暑都堅守陣地。'
  },
  '長流水': {
    name: '長流水',
    element: '水',
    environment: '奔流不息之地，大江東去的壯闘河川',
    advantages: ['源遠流長', '氣勢磅礴', '包容萬象'],
    challenges: ['方向難控', '力量分散', '泥沙俱下'],
    buffCondition: '水、金屬性角色在此戰場獲得+22%戰力',
    debuffCondition: '土屬性角色在此戰場受到-25%削弱',
    storyContext: '奔騰不息的長河中，軍團順流而下，以排山倒海之勢席捲戰場。'
  },
  '沙中金': {
    name: '沙中金',
    element: '金',
    environment: '沙海藏金之地，漫漫黃沙中隱藏的金礦',
    advantages: ['隱藏實力', '厚積薄發', '出人意料'],
    challenges: ['難以發掘', '環境惡劣', '消耗極大'],
    buffCondition: '金、土屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '木屬性角色在此戰場受到-25%削弱',
    storyContext: '漫天黃沙中，軍團如埋藏的金礦，在最關鍵的時刻綻放光芒。'
  },
  '山下火': {
    name: '山下火',
    element: '火',
    environment: '山腳火海之地，蔓延的野火燎原',
    advantages: ['蔓延迅速', '勢不可擋', '熱情高漲'],
    challenges: ['難以控制', '四處蔓延', '消耗過快'],
    buffCondition: '火、木屬性角色在此戰場獲得+22%戰力',
    debuffCondition: '水屬性角色在此戰場受到-22%削弱',
    storyContext: '山腳燎原之火，軍團借勢而起，如野火般迅速擴張勢力範圍。'
  },
  '平地木': {
    name: '平地木',
    element: '木',
    environment: '廣袤平原之地，一望無際的樹林',
    advantages: ['發展空間大', '根基穩固', '包容性強'],
    challenges: ['無險可守', '容易分散', '競爭激烈'],
    buffCondition: '木、水屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '金屬性角色在此戰場受到-15%削弱',
    storyContext: '廣闘平原上，軍團自由發展，在開闊的土地上建立自己的根基。'
  },
  '壁上土': {
    name: '壁上土',
    element: '土',
    environment: '懸崖峭壁之地，聳立的土石高牆',
    advantages: ['險要難攻', '防禦堅固', '居高臨下'],
    challenges: ['困守孤城', '補給困難', '難以突圍'],
    buffCondition: '土、金屬性角色在此戰場獲得+22%戰力',
    debuffCondition: '木屬性角色在此戰場受到-20%削弱',
    storyContext: '壁立千仞的戰場上，軍團依托地勢，建立起堅不可摧的防線。'
  },
  '金箔金': {
    name: '金箔金',
    element: '金',
    environment: '華麗金箔之地，薄如蟬翼的金光閃耀',
    advantages: ['華麗耀眼', '裝飾增益', '形象加分'],
    challenges: ['過於脆弱', '華而不實', '不堪一擊'],
    buffCondition: '金、土屬性角色在此戰場獲得+15%戰力',
    debuffCondition: '火屬性角色在此戰場受到-20%削弱',
    storyContext: '金光閃閃的戰場上，軍團以華麗的陣容震懾敵人，但需警惕表面功夫。'
  },
  '覆燈火': {
    name: '覆燈火',
    element: '火',
    environment: '燈火闌珊之地，溫暖而持久的燈光',
    advantages: ['持久照明', '溫暖人心', '指引方向'],
    challenges: ['光芒有限', '易被撲滅', '範圍受限'],
    buffCondition: '火、木屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '水屬性角色在此戰場受到-18%削弱',
    storyContext: '燈火如豆的戰場上，軍團在黑暗中堅持照亮前路，給予同伴希望。'
  },
  '天河水': {
    name: '天河水',
    element: '水',
    environment: '銀河傾瀉之地，天上甘霖普降人間',
    advantages: ['覆蓋面廣', '淨化一切', '恩澤萬物'],
    challenges: ['捉摸不定', '難以掌控', '來去無蹤'],
    buffCondition: '水、金屬性角色在此戰場獲得+25%戰力',
    debuffCondition: '火屬性角色在此戰場受到-30%削弱',
    storyContext: '銀河傾瀉的戰場上，軍團如天河之水，恩澤四方卻也變幻莫測。'
  },
  '大驛土': {
    name: '大驛土',
    element: '土',
    environment: '繁忙驛站之地，四通八達的交通要衝',
    advantages: ['資訊暢通', '補給便利', '人脈廣闘'],
    challenges: ['難以安寧', '魚龍混雜', '易生是非'],
    buffCondition: '土、火屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '水屬性角色在此戰場受到-18%削弱',
    storyContext: '繁忙驛道上，軍團把握各方情報，在資訊的洪流中佔據先機。'
  },
  '釵釧金': {
    name: '釵釧金',
    element: '金',
    environment: '珠寶華貴之地，精緻首飾的璀璨世界',
    advantages: ['精緻優雅', '價值連城', '吸引注目'],
    challenges: ['過於脆弱', '不宜戰鬥', '易招覬覦'],
    buffCondition: '金、水屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '火屬性角色在此戰場受到-22%削弱',
    storyContext: '珠寶璀璨的戰場上，軍團以精緻取勝，在優雅中展現實力。'
  },
  '桑柘木': {
    name: '桑柘木',
    element: '木',
    environment: '桑麻田園之地，勤勞耕作的豐收之境',
    advantages: ['踏實穩健', '收穫滿滿', '自給自足'],
    challenges: ['平淡無奇', '缺乏野心', '安於現狀'],
    buffCondition: '木、水屬性角色在此戰場獲得+18%戰力',
    debuffCondition: '金屬性角色在此戰場受到-15%削弱',
    storyContext: '桑田沃野中，軍團以勤勞積累實力，穩紮穩打地壯大自己。'
  },
  '大溪水': {
    name: '大溪水',
    element: '水',
    environment: '大溪奔流之地，山間溪水匯聚成河',
    advantages: ['匯聚力量', '靈活機動', '生機勃勃'],
    challenges: ['難以控制', '方向不定', '力量分散'],
    buffCondition: '水、木屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '土屬性角色在此戰場受到-20%削弱',
    storyContext: '山溪奔騰的戰場上，軍團如水流匯聚，集合各方力量形成洪流。'
  },
  '沙中土': {
    name: '沙中土',
    element: '土',
    environment: '沙漠綠洲之地，黃沙中的珍貴土地',
    advantages: ['珍貴稀有', '堅守陣地', '絕處逢生'],
    challenges: ['環境惡劣', '資源匱乏', '孤立無援'],
    buffCondition: '土、火屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '水屬性角色在此戰場受到-18%削弱',
    storyContext: '沙漠綠洲中，軍團在惡劣環境中堅守，珍惜每一分資源。'
  },
  '天上火': {
    name: '天上火',
    element: '火',
    environment: '烈日當空之地，太陽直射的熾熱戰場',
    advantages: ['光芒萬丈', '無遠弗屆', '能量充沛'],
    challenges: ['過於耀眼', '難以隱藏', '消耗巨大'],
    buffCondition: '火、木屬性角色在此戰場獲得+28%戰力',
    debuffCondition: '金、水屬性角色在此戰場受到-28%削弱',
    storyContext: '烈日高懸的戰場上，軍團沐浴在無盡的光芒中，以最強的姿態迎戰。'
  },
  '石榴木': {
    name: '石榴木',
    element: '木',
    environment: '石榴花開之地，紅艷果實累累的園林',
    advantages: ['碩果纍纍', '子孫興旺', '喜慶吉祥'],
    challenges: ['招搖過市', '易遭嫉妒', '守成不易'],
    buffCondition: '木、火屬性角色在此戰場獲得+20%戰力',
    debuffCondition: '金屬性角色在此戰場受到-18%削弱',
    storyContext: '石榴紅艷的戰場上，軍團慶祝豐收的同時也需警惕覬覦的目光。'
  },
  '大海水': {
    name: '大海水',
    element: '水',
    environment: '汪洋大海之地，無邊無際的海洋世界',
    advantages: ['包容萬象', '深不可測', '力量無窮'],
    challenges: ['難以掌控', '變幻莫測', '風浪無情'],
    buffCondition: '水、金屬性角色在此戰場獲得+28%戰力',
    debuffCondition: '火、土屬性角色在此戰場受到-30%削弱',
    storyContext: '汪洋大海之中，軍團如同滄海一粟，卻也蘊含著無窮的潛力與可能。'
  }
};

// 獲取納音戰場
export function getNayinBattlefield(nayin: string): NayinBattlefield | null {
  return NAYIN_BATTLEFIELDS[nayin] || null;
}

// 獲取納音五行
export function getNayinElement(nayin: string): WuxingElement | null {
  return NAYIN_ELEMENTS[nayin] || null;
}

// 計算戰場對角色的影響
export function calculateBattlefieldEffect(
  battlefield: NayinBattlefield,
  characterElement: WuxingElement
): { buff: number; description: string } {
  const battlefieldElement = battlefield.element;
  
  // 五行相生相剋關係
  const generates: Record<WuxingElement, WuxingElement> = {
    木: '火', 火: '土', 土: '金', 金: '水', 水: '木'
  };
  const controls: Record<WuxingElement, WuxingElement> = {
    木: '土', 土: '水', 水: '火', 火: '金', 金: '木'
  };
  
  // 同元素加成
  if (battlefieldElement === characterElement) {
    return {
      buff: 20,
      description: `${characterElement}屬性角色在${battlefield.name}戰場如魚得水，戰力提升20%`
    };
  }
  
  // 戰場生角色
  if (generates[battlefieldElement] === characterElement) {
    return {
      buff: 15,
      description: `${battlefield.name}戰場的${battlefieldElement}氣滋養${characterElement}屬性，戰力提升15%`
    };
  }
  
  // 角色生戰場
  if (generates[characterElement] === battlefieldElement) {
    return {
      buff: -5,
      description: `${characterElement}屬性在${battlefield.name}戰場消耗能量支援環境，戰力略減5%`
    };
  }
  
  // 戰場克角色
  if (controls[battlefieldElement] === characterElement) {
    return {
      buff: -25,
      description: `${battlefield.name}戰場的${battlefieldElement}氣克制${characterElement}屬性，戰力大減25%`
    };
  }
  
  // 角色克戰場
  if (controls[characterElement] === battlefieldElement) {
    return {
      buff: 10,
      description: `${characterElement}屬性可駕馭${battlefield.name}戰場，戰力提升10%`
    };
  }
  
  return {
    buff: 0,
    description: `${characterElement}屬性在${battlefield.name}戰場表現中性`
  };
}
