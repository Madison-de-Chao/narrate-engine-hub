/**
 * 兵符資料庫（Edge Function 專用簡化版）
 * 用於故事生成時的兵符模板查找
 */

export interface BingfuInfo {
  id: string;
  name: string;
  alias: string;
  storyFragment: string;
  legionInterpretation: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
}

// 兵符資料庫
export const bingfuDatabase: Record<string, BingfuInfo> = {
  // === 吉神兵符 ===
  '天乙貴人': {
    id: 'tianyi_guiren',
    name: '天乙貴人',
    alias: '貴人符',
    storyFragment: '一道金光自天際劃落，一位身披華服的貴人踏雲而來，向{commander}微微頷首：「此戰，我將為你護航。」這是天乙貴人的加持——在最危急時刻，總有意想不到的援手。',
    legionInterpretation: { year: '祖上有貴人庇佑', month: '職場有貴人相助', day: '命主常遇貴人', hour: '子女有貴人緣' }
  },
  '文昌': {
    id: 'wenchang',
    name: '文昌',
    alias: '文曲符',
    storyFragment: '{advisor}手持一卷泛黃的古籍，眼中閃爍著智慧的光芒。「知識就是力量，」他低聲說道，「文昌星照耀此地，讓我們的每一個策略都精準無誤。」',
    legionInterpretation: { month: '學業順遂，考試運強', hour: '子女聰慧好學' }
  },
  '文昌貴人': {
    id: 'wenchang',
    name: '文昌貴人',
    alias: '文曲符',
    storyFragment: '{advisor}手持一卷泛黃的古籍，眼中閃爍著智慧的光芒。「知識就是力量，」他低聲說道，「文昌星照耀此地，讓我們的每一個策略都精準無誤。」',
    legionInterpretation: { month: '學業順遂，考試運強', hour: '子女聰慧好學' }
  },
  '太極貴人': {
    id: 'taiji_guiren',
    name: '太極貴人',
    alias: '智慧符',
    storyFragment: '陰陽魚在{commander}頭頂緩緩旋轉，黑白交融，萬物之理在腦海中清晰浮現。太極貴人的智慧，讓迷霧中的道路變得清晰。',
    legionInterpretation: { day: '命主智慧超群', hour: '子女悟性佳' }
  },
  '天德': {
    id: 'tiande',
    name: '天德',
    alias: '德佑符',
    storyFragment: '一股溫和的氣場籠罩著營地，{commander}感到心中一片祥和。「天德護體，」老兵說道，「今日縱有刀兵，也傷不了我們。」',
    legionInterpretation: { year: '家族有人脈根基', day: '命主性格溫厚' }
  },
  '月德': {
    id: 'yuede',
    name: '月德',
    alias: '月德符',
    storyFragment: '皎潔的月光灑下，所到之處傷病漸癒。{advisor}抬頭望月：「月德照臨，是上天的恩賜。」',
    legionInterpretation: { month: '月份有德，貴人運佳' }
  },
  '金輿': {
    id: 'jinyu',
    name: '金輿',
    alias: '座騎符',
    storyFragment: '一匹金鬃神駒踏雲而來，停在{commander}面前。「這是金輿星的賜予，」老兵讚嘆道，「有此神駒，出行無憂，身份尊貴。」',
    legionInterpretation: { day: '出入有車馬之便，地位尊榮' }
  },
  '驛馬': {
    id: 'yima',
    name: '驛馬',
    alias: '驛站符',
    storyFragment: '營帳外，一匹快馬疾馳而過。{advisor}看著馬蹄揚起的塵土：「驛馬入命，此人注定是奔波之人——不是追逐夢想，就是夢想追逐著他。」',
    legionInterpretation: { year: '祖輩多遷徙', month: '事業多變動', day: '命主好動，喜出行', hour: '晚年不安定' }
  },
  '將星': {
    id: 'jiangxing',
    name: '將星',
    alias: '號令符',
    storyFragment: '{commander}站在高台上，一聲令下，三軍肅穆。這就是將星的威嚴——天生的領導者，令出必行，萬人臣服。',
    legionInterpretation: { year: '家族有權勢', month: '事業有領導才能', day: '命主有統帥氣質', hour: '子女有領導潛質' }
  },
  '華蓋': {
    id: 'huagai',
    name: '華蓋',
    alias: '華蓋符',
    storyFragment: '{commander}獨自坐在帳中，翻閱著古老的典籍。「華蓋入命，」老兵輕聲對新兵說，「這種人看似孤獨，實則與天地對話，有著常人難以理解的智慧。」',
    legionInterpretation: { year: '祖上有宗教藝術緣', month: '喜研究玄學', day: '命主清高孤傲', hour: '晚年好靜' }
  },
  '天廚': {
    id: 'tianchu',
    name: '天廚',
    alias: '天廚符',
    storyFragment: '軍營中飄來陣陣香氣，{advisor}正在準備宴席。「天廚星照臨，」他笑道，「不只是口福，更是富足的象徵。」',
    legionInterpretation: { day: '命主有口福，衣食無憂' }
  },
  '福星貴人': {
    id: 'fuxing_guiren',
    name: '福星貴人',
    alias: '福星符',
    storyFragment: '一顆明亮的星辰在夜空中閃耀，{commander}感到一股溫暖的力量籠罩全身。「福星高照，」老兵說道，「今日必有好事降臨。」',
    legionInterpretation: { day: '命主福德深厚' }
  },
  '天官貴人': {
    id: 'tianguan_guiren',
    name: '天官貴人',
    alias: '天官符',
    storyFragment: '一位身著官服的長者從雲端降臨，向{commander}授予印信。「天官賜福，」他莊嚴地說，「你將獲得權力與地位。」',
    legionInterpretation: { day: '命主有官運' }
  },
  
  // === 凶煞兵符 ===
  '羊刃': {
    id: 'yangren',
    name: '羊刃',
    alias: '狂刃符',
    storyFragment: '{commander}腰間的佩劍突然發出嗡鳴，劍身泛起血紅色的光芒。「羊刃發動了，」老兵緊張地說，「這股力量能讓將軍所向披靡，但若控制不住，反會傷了自己。」',
    legionInterpretation: { year: '祖輩有血光', month: '事業宜穩不宜激進', day: '命主性格剛烈', hour: '晚年要防意外' }
  },
  '亡神': {
    id: 'wangshen',
    name: '亡神',
    alias: '亡靈符',
    storyFragment: '夜半時分，一陣陰風吹過營帳。{advisor}臉色微變：「亡神現身，這是衰敗的前兆，必須謹慎行事。」',
    legionInterpretation: { day: '謹防小人暗算' }
  },
  '劫煞': {
    id: 'jiesha',
    name: '劫煞',
    alias: '奪財符',
    storyFragment: '一個蒙面黑影從暗處竄出，直奔軍餉而去。「劫煞發動！」{commander}大喊，「守住財庫！」這便是劫煞的威力——突如其來的損失。',
    legionInterpretation: { year: '家族有財產損失', month: '事業防破財', day: '命主易遭劫', hour: '晚年財運不穩' }
  },
  '災煞': {
    id: 'zaisha',
    name: '災煞',
    alias: '災厄符',
    storyFragment: '天空突然烏雲密布，雷電交加。{advisor}仰望天際：「災煞臨頭，天災人禍皆需防範。」',
    legionInterpretation: { day: '注意天災人禍' }
  },
  '白虎': {
    id: 'baihu',
    name: '白虎',
    alias: '白虎符',
    storyFragment: '一聲虎嘯劃破長空，一頭白色巨虎在營地外徘徊。「白虎煞動，」老兵神色凝重，「血光之災近在眼前。」',
    legionInterpretation: { year: '家族有血光之災' }
  },
  '天狗': {
    id: 'tiangou',
    name: '天狗',
    alias: '天狗符',
    storyFragment: '天際突然暗了一角，一隻巨大的黑犬吞噬了部分天光。「天狗食日，」{advisor}喃喃道，「口舌是非將至。」',
    legionInterpretation: { year: '家族有是非' }
  },
  '喪門': {
    id: 'sangmen',
    name: '喪門',
    alias: '喪門符',
    storyFragment: '營門外突然傳來悲傷的哭聲，{commander}心中一沉。「喪門星動，」老兵低聲說，「恐有親人有難。」',
    legionInterpretation: { year: '家族有喪事' }
  },
  '披麻': {
    id: 'pima',
    name: '披麻',
    alias: '披麻符',
    storyFragment: '一陣陰風吹過，{advisor}看到有人身著素服從遠處走來。「披麻星現，」他嘆息道，「這是哀傷的預兆。」',
    legionInterpretation: { year: '家族有喪事之兆' }
  },
  '官符': {
    id: 'guanfu',
    name: '官符',
    alias: '官司符',
    storyFragment: '一紙公文從天而降，上面蓋著鮮紅的官印。{commander}展開一看，眉頭緊鎖。「官符煞動，」他說道，「官司纏身，不可不防。」',
    legionInterpretation: { year: '家族有官司', month: '事業有法律糾紛', day: '命主易惹官非' }
  },
  '病符': {
    id: 'bingfu',
    name: '病符',
    alias: '病厄符',
    storyFragment: '{advisor}突然感到一陣虛弱，臉色蒼白。「病符入命，」老兵趕緊扶住他，「這段時間要格外注意身體。」',
    legionInterpretation: { year: '注意健康' }
  },
  '天刑': {
    id: 'tianxing',
    name: '天刑',
    alias: '天刑符',
    storyFragment: '一道雷電從天而降，劈在{commander}面前的大樹上。「天刑震怒，」老兵驚呼，「這是上天的警示，行事需謹慎。」',
    legionInterpretation: { month: '注意法律問題' }
  },
  '五鬼': {
    id: 'wugui',
    name: '五鬼',
    alias: '五鬼符',
    storyFragment: '夜深人靜，五個模糊的身影在營帳周圍徘徊。{advisor}緊握符咒：「五鬼作祟，小人暗害，需多加防備。」',
    legionInterpretation: { year: '防小人陷害' }
  },
  '流霞': {
    id: 'liuxia',
    name: '流霞',
    alias: '流霞符',
    storyFragment: '一道詭異的紅光從天際劃過，{commander}的目光隨之而動。「流霞現世，」老兵說道，「女子需防產厄，男子需防意外。」',
    legionInterpretation: { day: '女命防產厄' }
  },
  
  // === 桃花兵符 ===
  '桃花': {
    id: 'taohua',
    name: '桃花',
    alias: '桃花符',
    storyFragment: '營帳外，一棵桃樹突然開滿了粉色的花朵。{commander}凝視著飄落的花瓣，眼中閃過一絲柔情。「桃花入命，」老兵笑道，「異性緣不請自來。」',
    legionInterpretation: { year: '早年有桃花', month: '工作中有桃花', day: '命主桃花旺', hour: '晚年有情感糾葛' }
  },
  '咸池': {
    id: 'xianchi',
    name: '咸池',
    alias: '咸池符',
    storyFragment: '月光下，一座美麗的池塘出現在眾人面前。{advisor}輕聲說：「咸池水動，魅惑之力覺醒，情感的考驗即將到來。」',
    legionInterpretation: { day: '命主風流多情' }
  },
  '紅鸞': {
    id: 'hongluan',
    name: '紅鸞',
    alias: '紅鸞符',
    storyFragment: '一隻紅色的鳳凰從天而降，盤旋在{commander}頭頂。「紅鸞星動！」老兵大喜，「這是婚姻緣分將至的吉兆！」',
    legionInterpretation: { year: '年支見紅鸞，婚期近' }
  },
  '天喜': {
    id: 'tianxi',
    name: '天喜',
    alias: '天喜符',
    storyFragment: '營帳內突然響起喜慶的樂聲，{advisor}臉上露出笑容。「天喜星照，」他說道，「喜事將臨，可能是婚嫁之喜，也可能是添丁之福。」',
    legionInterpretation: { year: '年支見天喜，有喜事' }
  },
  '沐浴桃花': {
    id: 'muyu_taohua',
    name: '沐浴桃花',
    alias: '沐浴符',
    storyFragment: '{commander}在溪邊沐浴，水中映出他迷人的倒影。「沐浴桃花，」老兵感嘆道，「這種天生的魅力，讓人無法抗拒。」',
    legionInterpretation: { day: '命主魅力四射' }
  },
  
  // === 陰陽兵符 ===
  '孤辰': {
    id: 'guchen',
    name: '孤辰',
    alias: '孤星符',
    storyFragment: '{commander}獨自站在山巔，俯瞰著萬里河山。「孤辰入命，」老兵遠遠望著他的背影，「這種人注定要走一條與眾不同的路。」',
    legionInterpretation: { year: '早年孤獨', month: '事業需獨立', day: '命主性格孤傲', hour: '晚年孤寂' }
  },
  '寡宿': {
    id: 'guasu',
    name: '寡宿',
    alias: '寡宿符',
    storyFragment: '月圓之夜，{advisor}獨自對月飲酒。「寡宿星動，」他輕嘆，「感情之路上，總是難以圓滿。」',
    legionInterpretation: { day: '婚姻需謹慎' }
  },
  '天羅': {
    id: 'tianluo',
    name: '天羅',
    alias: '天羅符',
    storyFragment: '一張無形的大網從天空降下，{commander}感到呼吸困難。「天羅地網，」老兵驚呼，「困局已至，需尋找突破口。」',
    legionInterpretation: { day: '命主易陷困境' }
  },
  '地網': {
    id: 'diwang',
    name: '地網',
    alias: '地網符',
    storyFragment: '腳下的土地突然變得泥濘，{advisor}每走一步都異常艱難。「地網纏身，」他咬牙說道，「進退維谷，只能硬闖。」',
    legionInterpretation: { day: '命主易陷困境' }
  },
  '空亡': {
    id: 'kongwang',
    name: '空亡',
    alias: '虛空符',
    storyFragment: '{commander}伸手想抓住什麼，卻只抓到一片虛無。「空亡入命，」老兵嘆息，「有些事，注定求而不得。」',
    legionInterpretation: { year: '祖蔭較薄', month: '事業有起伏', day: '命主需放下執著', hour: '子女緣淡薄' }
  },
  '魁罡': {
    id: 'kuigang',
    name: '魁罡',
    alias: '魁罡符',
    storyFragment: '{commander}站在中軍帳前，渾身散發著攝人的威嚴。「魁罡日生，」老兵對新兵耳語，「這種人天生帝王之氣，但也容易剛愎自用。」',
    legionInterpretation: { day: '命主聰明剛毅，有領導才能' }
  },
  '陰陽差錯': {
    id: 'yinyang_chacuo',
    name: '陰陽差錯',
    alias: '差錯符',
    storyFragment: '明明是大吉之兆，卻突然風雲變色。{advisor}皺眉：「陰陽差錯，吉凶難料，婚姻之事尤需謹慎。」',
    legionInterpretation: { day: '婚姻感情需多經營' }
  },
  '四廢': {
    id: 'sifei',
    name: '四廢',
    alias: '四廢符',
    storyFragment: '{commander}感到渾身無力，手中的劍變得異常沉重。「四廢日生，」老兵扶住他，「力量衰敗，需借助外力方能成事。」',
    legionInterpretation: { day: '命主需借助貴人' }
  },
  '十惡大敗': {
    id: 'shie_dabai',
    name: '十惡大敗',
    alias: '大敗符',
    storyFragment: '軍需官清點庫存後臉色大變：「糧草所剩無幾！」{commander}沉默片刻。老兵解釋道：「十惡大敗日，財庫空虛，需謹慎理財。」',
    legionInterpretation: { day: '命主財運需謹慎' }
  },
  
  // === 刑沖害破兵符 ===
  '反吟': {
    id: 'fanyin',
    name: '反吟',
    alias: '反吟符',
    storyFragment: '兩支軍隊正面相對，氣氛劍拔弩張。「反吟格局，」{advisor}憂慮地說，「正面衝突無法避免，只能正面迎戰。」',
    legionInterpretation: { day: '命主個性直接，易有衝突' }
  },
  '伏吟': {
    id: 'fuyin',
    name: '伏吟',
    alias: '伏吟符',
    storyFragment: '戰事陷入膠著，雙方都在等待對方先動。「伏吟之局，」{commander}嘆道，「停滯不前，只能耐心等待時機。」',
    legionInterpretation: { day: '命主做事易反覆' }
  },
};

/**
 * 根據神煞名稱獲取兵符資訊
 */
export function getBingfuInfo(shenshaName: string): BingfuInfo | null {
  // 直接匹配
  if (bingfuDatabase[shenshaName]) {
    return bingfuDatabase[shenshaName];
  }
  
  // 模糊匹配
  for (const [key, value] of Object.entries(bingfuDatabase)) {
    if (shenshaName.includes(key) || key.includes(shenshaName)) {
      return value;
    }
  }
  
  return null;
}

/**
 * 根據柱位獲取對應的解讀
 */
export function getBingfuInterpretation(
  shenshaName: string, 
  pillar: 'year' | 'month' | 'day' | 'hour'
): string | null {
  const bingfu = getBingfuInfo(shenshaName);
  if (!bingfu) return null;
  return bingfu.legionInterpretation[pillar] || null;
}

/**
 * 填充故事模板
 */
export function fillStoryFragment(
  storyFragment: string,
  commanderName: string,
  advisorName: string
): string {
  return storyFragment
    .replace(/{commander}/g, commanderName)
    .replace(/{advisor}/g, advisorName);
}
