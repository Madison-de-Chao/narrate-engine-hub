/**
 * 陰陽兵符 - 10張
 * 與陰陽平衡、特殊狀態相關的神煞
 */

import type { BingfuDefinition } from './index';

export const yinyangBingfu: BingfuDefinition[] = [
  {
    id: 'huagai_yinyang',
    name: '華蓋',
    alias: '靈感符',
    category: 'yinyang',
    rarity: 'SSR',
    effect: {
      buff: '靈感創意、藝術才華',
      debuff: '孤僻孤高',
    },
    legionInterpretation: {
      day: '命主個性孤傲',
      hour: '子女藝術傾向',
    },
    judgment: '寅午戌局見戌；申子辰局見辰；巳酉丑局見丑；亥卯未局見未',
    storyFragment: '華蓋如傘，罩住{commander}，與世隔絕卻靈感泉湧。「藝術家的命，」{advisor}嘆道，「注定與凡俗不同。」',
  },
  {
    id: 'yincha_yangcuo',
    name: '陰差陽錯',
    alias: '錯緣符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '緣分錯配、婚姻阻滯',
    },
    legionInterpretation: {
      day: '命主婚緣錯配',
      hour: '子女婚姻挫折',
    },
    judgment: '依年月日時組合，若干支衝突為此煞',
    storyFragment: '明明是天作之合，卻總是錯過。{commander}望著遠去的背影，{advisor}嘆道：「陰差陽錯，緣分弄人。」',
  },
  {
    id: 'kongwang',
    name: '空亡',
    alias: '旬空符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: '可脫困、隱身遁逃',
      debuff: '計畫落空',
    },
    legionInterpretation: {
      month: '青年多失落',
      hour: '晚年易孤寂',
    },
    judgment: '六十甲子每旬兩支為空',
    storyFragment: '{commander}的身影突然變得虛幻，敵人的攻擊穿透而過。「空亡庇護，」{advisor}解釋，「這是脫困的時機，但也意味著某些計畫將化為泡影。」',
  },
  {
    id: 'tiansha_guxing',
    name: '天煞孤星',
    alias: '孤煞符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '孤獨無靠',
    },
    legionInterpretation: {
      day: '命主孤高',
      hour: '子女孤寂',
    },
    judgment: '依日支查沖刑',
    storyFragment: '星空下，{commander}獨自守夜，身邊空無一人。「天煞孤星，」老兵遠遠看著，「他注定要獨自承擔一切。」',
  },
  {
    id: 'tianluo',
    name: '天羅',
    alias: '羅網符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '阻礙重重，被困難纏繞',
    },
    legionInterpretation: {
      year: '家族被困',
      day: '命主受制',
    },
    judgment: '辰戌為天羅',
    storyFragment: '一張無形的網從天而降，將{commander}困在原地。「天羅降臨，」{advisor}急道，「四處皆是阻礙，需要尋找突破口。」',
  },
  {
    id: 'diwang',
    name: '地網',
    alias: '陷阱符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '受限、陷阱重重',
    },
    legionInterpretation: {
      month: '青年困阻',
      hour: '子女難展',
    },
    judgment: '丑未為地網',
    storyFragment: '腳下的大地突然塌陷，{commander}落入陷阱。「地網之困，」{advisor}大喊，「每一步都要小心！」',
  },
  {
    id: 'fuyin',
    name: '伏吟',
    alias: '重複符',
    category: 'yinyang',
    rarity: 'R',
    effect: {
      buff: null,
      debuff: '重複挫折、停滯不前',
    },
    legionInterpretation: {
      day: '命主反覆無進展',
    },
    judgment: '八字干支與流年重複',
    storyFragment: '同樣的失敗，同樣的挫折，{commander}彷彿陷入了時間的迴圈。「伏吟之象，」{advisor}嘆道，「歷史在重演，我們需要打破這個循環。」',
  },
  {
    id: 'fanyin',
    name: '反吟',
    alias: '對沖符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '巨大衝突、劇烈變動',
    },
    legionInterpretation: {
      month: '青年劇烈變動',
      hour: '晚年衝擊',
    },
    judgment: '八字與流年正沖',
    storyFragment: '兩股力量猛烈碰撞，{commander}被震得後退數步。「反吟之衝，」{advisor}警告，「這是巨大的轉折，福禍難料。」',
  },
  {
    id: 'tianxing_yinyang',
    name: '天刑',
    alias: '刑符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '官非刑責',
    },
    legionInterpretation: {
      day: '命主易觸法律',
    },
    judgment: '寅巳申、丑戌未、子卯等三刑',
    storyFragment: '法槌落下，判決已定。{commander}低下頭，{advisor}在旁嘆息：「天刑難逃，法律之前，人人平等。」',
  },
  {
    id: 'tiansha_yinyang',
    name: '天煞',
    alias: '災符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '災禍連連',
    },
    legionInterpretation: {
      year: '家族動盪',
    },
    judgment: '依流年地支推',
    storyFragment: '黑雲壓頂，風雨欲來。「天煞之年，」老兵望天長嘆，「這一年，只能步步為營。」',
  },
  {
    id: 'kuigang',
    name: '魁罡',
    alias: '魁罡符',
    category: 'yinyang',
    rarity: 'SR',
    effect: {
      buff: '威嚴果決，行動力強',
      debuff: '剛烈孤傲，易招衝突',
    },
    legionInterpretation: {
      day: '命主聰明剛毅，有領導才能',
      hour: '子女性格剛直',
    },
    judgment: '庚辰、庚戌、庚申、壬辰日為魁罡日',
    storyFragment: '{commander}渾身散發攝人威嚴，氣場如刃。「魁罡在命，」{advisor}點頭，「天生的強將，但需學會收斂銳氣。」',
  },
];
