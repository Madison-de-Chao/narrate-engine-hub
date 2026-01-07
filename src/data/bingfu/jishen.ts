/**
 * 吉神兵符 - 15張
 * 帶來正面加成的神煞
 */

import type { BingfuDefinition } from './index';

export const jishenBingfu: BingfuDefinition[] = [
  {
    id: 'tianyi_guiren',
    name: '天乙貴人',
    alias: '貴人符',
    category: 'jishen',
    rarity: 'SSR',
    effect: {
      buff: '貴人扶持，逢凶化吉',
      debuff: '依賴他人，自主能力弱',
    },
    legionInterpretation: {
      year: '祖上有貴人庇佑',
      month: '職場有貴人相助',
      day: '命主常遇貴人',
      hour: '子女有貴人緣',
    },
    judgment: '依日干查：甲戊庚見丑未，乙己見子申，丙丁見亥酉，壬癸見卯巳，辛見寅午',
    storyFragment: '一道金光自天際劃落，一位身披華服的貴人踏雲而來，向{commander}微微頷首：「此戰，我將為你護航。」這是天乙貴人的加持——在最危急時刻，總有意想不到的援手。',
  },
  {
    id: 'wenchang',
    name: '文昌',
    alias: '文曲符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '學業考運佳，聰明才智',
      debuff: '書呆子傾向，過度理論化',
    },
    legionInterpretation: {
      month: '學業順遂，考試運強',
      hour: '子女聰慧好學',
    },
    judgment: '依日干查文昌支：甲見巳，乙見午，丙見申，丁見酉，戊見申，己見酉，庚見亥，辛見子，壬見寅，癸見卯',
    storyFragment: '{advisor}手持一卷泛黃的古籍，眼中閃爍著智慧的光芒。「知識就是力量，」他低聲說道，「文昌星照耀此地，讓我們的每一個策略都精準無誤。」',
  },
  {
    id: 'taiji_guiren',
    name: '太極貴人',
    alias: '智慧符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '智慧深厚，悟性極高',
      debuff: '過度思慮',
    },
    legionInterpretation: {
      day: '命主智慧超群',
      hour: '子女悟性佳',
    },
    judgment: '依日干配對：甲乙見子午，丙丁見卯酉，戊己見丑未辰戌，庚辛見寅亥，壬癸見巳申',
    storyFragment: '陰陽魚在{commander}頭頂緩緩旋轉，黑白交融，萬物之理在腦海中清晰浮現。太極貴人的智慧，讓迷霧中的道路變得清晰。',
  },
  {
    id: 'tiande',
    name: '天德',
    alias: '德佑符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '人緣佳，遇事化險為夷',
      debuff: '過於隨和',
    },
    legionInterpretation: {
      year: '家族有人脈根基',
      day: '命主性格溫厚',
    },
    judgment: '以月支推算天德干或支',
    storyFragment: '一股溫和的氣場籠罩著營地，{commander}感到心中一片祥和。「天德護體，」老兵說道，「今日縱有刀兵，也傷不了我們。」',
  },
  {
    id: 'jinyu',
    name: '金輿',
    alias: '財庫符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '財富積聚，物質豐足',
      debuff: '守財奴傾向',
    },
    legionInterpretation: {
      year: '家族有財庫根基',
      day: '命主偏重物質',
    },
    judgment: '依日干查：甲見辰戌，乙見丑未等',
    storyFragment: '金色的戰車緩緩駛入營地，車上滿載著糧草輜重。{advisor}微笑道：「金輿入命，物資充足，此戰無後顧之憂。」',
  },
  {
    id: 'fuxing_guiren',
    name: '福星貴人',
    alias: '福星符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '福祿綿長，順遂平安',
      debuff: '安逸缺乏拼勁',
    },
    legionInterpretation: {
      month: '青年期得福氣',
      hour: '晚景安穩',
    },
    judgment: '以日干配對查支',
    storyFragment: '紫色的星光灑落，照亮了{commander}的前路。福星高照，縱使荊棘滿途，也總有一條平坦的小徑。',
  },
  {
    id: 'tianchu',
    name: '天廚',
    alias: '饋食符',
    category: 'jishen',
    rarity: 'R',
    effect: {
      buff: '飲食福氣，口福不淺',
      debuff: '過度享樂',
    },
    legionInterpretation: {
      hour: '子女有福氣',
    },
    judgment: '依日干支查',
    storyFragment: '營帳中飄來陣陣香氣，{advisor}端來一碗熱騰騰的湯羹：「天廚入命，縱使戰場艱難，也不會餓著肚子。」',
  },
  {
    id: 'santai',
    name: '三台',
    alias: '權輔符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '官祿輔助，地位提升',
      debuff: '官場依附過重',
    },
    legionInterpretation: {
      month: '青年有晉升機遇',
    },
    judgment: '依日支查',
    storyFragment: '三顆星辰排列成階梯狀，照耀在{commander}頭頂。「三台星現，」謀士說道，「升遷之路，已然開啟。」',
  },
  {
    id: 'bazuo',
    name: '八座',
    alias: '高位符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '高位加持，社會地位顯著',
      debuff: '虛榮心重',
    },
    legionInterpretation: {
      day: '命主社會地位顯著',
    },
    judgment: '依日支查',
    storyFragment: '八方來朝，座上之位虛席以待。{commander}站在高台上，俯瞰眾軍，這是八座星賦予的威嚴。',
  },
  {
    id: 'tianguan_guiren',
    name: '天官貴人',
    alias: '官印符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '官祿扶助，仕途順遂',
      debuff: '官場糾葛',
    },
    legionInterpretation: {
      month: '工作順遂',
    },
    judgment: '依干支查',
    storyFragment: '一枚金印從天而降，穩穩落在{commander}手中。「天官賜福，」使者宣讀，「汝之官途，將一帆風順。」',
  },
  {
    id: 'tianxi',
    name: '天喜',
    alias: '喜慶符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '喜事臨門，吉慶連連',
      debuff: '喜事過多耗財',
    },
    legionInterpretation: {
      hour: '子女婚嫁之喜',
    },
    judgment: '依年支查對應支',
    storyFragment: '喜鵲繞梁，紅綢飄揚，營地中洋溢著喜慶的氣氛。「天喜星動，」老兵露出笑容，「好事將近。」',
  },
  {
    id: 'hongluan',
    name: '紅鸞',
    alias: '良緣符',
    category: 'jishen',
    rarity: 'SSR',
    effect: {
      buff: '正緣出現，良緣天定',
      debuff: '過早成婚或情事',
    },
    legionInterpretation: {
      day: '命主感情運旺',
      hour: '子女良緣',
    },
    judgment: '依年支查對應支',
    storyFragment: '一隻火紅的鸞鳥劃過天際，落在{commander}肩頭。「紅鸞星動，」{advisor}微笑道，「命中註定的人，就在不遠處。」',
  },
  {
    id: 'jiangxing',
    name: '將星',
    alias: '號令符',
    category: 'jishen',
    rarity: 'SSR',
    effect: {
      buff: '領導力提升，號令三軍',
      debuff: '好勝好權',
    },
    legionInterpretation: {
      year: '家族有領袖氣質',
      day: '命主有領導才華',
    },
    judgment: '寅午戌局見午；申子辰局見子；巳酉丑局見酉；亥卯未局見卯',
    storyFragment: '{commander}高舉令旗，萬軍齊呼。「將星入命，」軍師說道，「天生的統帥，生來就是要指揮千軍萬馬。」',
  },
  {
    id: 'huagai',
    name: '華蓋',
    alias: '靈感符',
    category: 'jishen',
    rarity: 'SSR',
    effect: {
      buff: '藝術靈感，才華橫溢',
      debuff: '孤高寡合',
    },
    legionInterpretation: {
      day: '命主有藝術氣質',
      hour: '子女有靈性',
    },
    judgment: '寅午戌局見戌；申子辰局見辰；巳酉丑局見丑；亥卯未局見未',
    storyFragment: '一頂華麗的傘蓋懸浮在{commander}頭頂，散發著七彩光芒。「華蓋罩身，」{advisor}嘆道，「這是藝術家的命格，超凡脫俗，卻也難免曲高和寡。」',
  },
  {
    id: 'xuetang',
    name: '學堂',
    alias: '學堂符',
    category: 'jishen',
    rarity: 'R',
    effect: {
      buff: '學習力與文采提升',
      debuff: '書卷氣過重，行動偏慢',
    },
    legionInterpretation: {
      month: '青年求學順利',
      day: '命主重視學習',
      hour: '子女聰慧好學',
    },
    judgment: '臨文昌或日支得長生之地',
    storyFragment: '帳中燈火通明，{advisor}攤開兵書與卷軸。「學堂星照，」他笑道，「知識就是武器，讓我們磨礪策略。」',
  },
  {
    id: 'yuede',
    name: '月德',
    alias: '月佑符',
    category: 'jishen',
    rarity: 'SR',
    effect: {
      buff: '月光庇佑，化解災厄',
      debuff: null,
    },
    legionInterpretation: {
      month: '青年期得月德庇護',
    },
    judgment: '以月支推算',
    storyFragment: '銀色的月光灑落，為{commander}的盔甲鍍上一層柔和的光暈。「月德護體，」老兵說道，「今夜的戰鬥，我們必將平安。」',
  },
];
