/**
 * 桃花兵符 - 6張
 * 與感情、人際、魅力相關的神煞
 */

import type { BingfuDefinition } from './index';

export const taohuaBingfu: BingfuDefinition[] = [
  {
    id: 'xianchi',
    name: '咸池',
    alias: '魅惑符',
    category: 'taohua',
    rarity: 'SR',
    effect: {
      buff: '異性緣強、人際魅力十足',
      debuff: '爛桃花、情感糾纏',
    },
    legionInterpretation: {
      month: '青年多艷遇',
      day: '命主感情複雜',
      hour: '子女多情',
    },
    judgment: '申子辰局桃花在酉；寅午戌局在卯；巳酉丑局在午；亥卯未局在子',
    storyFragment: '月光下，{commander}的身影格外迷人，無數異性的目光投向這邊。「咸池星動，」{advisor}搖頭道，「魅力是把雙刃劍，小心爛桃花。」',
  },
  {
    id: 'hongluan_taohua',
    name: '紅鸞',
    alias: '正緣符',
    category: 'taohua',
    rarity: 'SSR',
    effect: {
      buff: '正緣出現、婚嫁之兆',
      debuff: '過早情事',
    },
    legionInterpretation: {
      day: '命主遇良緣',
      hour: '子女婚嫁之喜',
    },
    judgment: '子年見卯；丑年見寅；循環類推',
    storyFragment: '紅鸞鳥翩翩飛來，銜著一根紅線落在{commander}肩上。「紅鸞星動，」老兵露出欣慰的笑容，「該成家了。」',
  },
  {
    id: 'tianxi_taohua',
    name: '天喜',
    alias: '喜慶符',
    category: 'taohua',
    rarity: 'SR',
    effect: {
      buff: '婚慶喜事',
      debuff: '喜事耗財',
    },
    legionInterpretation: {
      year: '家族添喜',
      month: '青年結婚',
      hour: '子女添丁',
    },
    judgment: '子年見酉；丑年見申；依年支遞推',
    storyFragment: '爆竹聲聲，紅燭高照，營地變成了喜堂。「天喜臨門，」{advisor}笑道，「雙喜臨門的日子到了。」',
  },
  {
    id: 'muyu_taohua',
    name: '沐浴桃花',
    alias: '魅惑沐浴符',
    category: 'taohua',
    rarity: 'R',
    effect: {
      buff: '外貌氣質提升',
      debuff: '酒色之累',
    },
    legionInterpretation: {
      day: '命主風流',
      hour: '子女愛美',
    },
    judgment: '日支落「沐浴」之地（以十二長生推算）',
    storyFragment: '{commander}站在溪邊，水珠在陽光下閃爍，氣質出塵。「沐浴桃花，」{advisor}打趣道，「天生的美人，走到哪裡都是焦點。」',
  },
  {
    id: 'liuxia',
    name: '流霞',
    alias: '酒色符',
    category: 'taohua',
    rarity: 'R',
    effect: {
      buff: '魅力加持',
      debuff: '酒色過度',
    },
    legionInterpretation: {
      day: '命主放縱',
      hour: '子女沉迷享樂',
    },
    judgment: '依年支查',
    storyFragment: '酒杯碰撞，歡聲笑語。{commander}舉杯暢飲，身邊美人如雲。「流霞入命，」老兵提醒道，「醉生夢死，小心誤了大事。」',
  },
  {
    id: 'taohuasha',
    name: '桃花煞',
    alias: '桃花符',
    category: 'taohua',
    rarity: 'SR',
    effect: {
      buff: '人緣佳',
      debuff: '情感困擾',
    },
    legionInterpretation: {
      day: '命主感情多波折',
    },
    judgment: '依日干查桃花位',
    storyFragment: '桃花飄落，{commander}的心卻亂了。「桃花煞動，」{advisor}嘆道，「人緣太好也是種煩惱，剪不斷理還亂。」',
  },
];
