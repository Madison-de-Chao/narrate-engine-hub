/**
 * 刑沖害破兵符 - 14張
 * 與地支刑沖害破相關的神煞
 */

import type { BingfuDefinition } from './index';

export const xingchonghaipoBingfu: BingfuDefinition[] = [
  // ===== 沖（5張）=====
  {
    id: 'ziwu_chong',
    name: '子午沖',
    alias: '水火沖符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: '能量激發',
      debuff: '情緒不穩，內心衝突',
    },
    legionInterpretation: {
      day: '命主情緒起伏大',
    },
    judgment: '子與午相沖',
    storyFragment: '水火交鋒，蒸騰起滾滾白霧。{commander}感到內心的平靜被打破，「子午相沖，」{advisor}解釋，「水火不容，心神難安。」',
  },
  {
    id: 'maoyou_chong',
    name: '卯酉沖',
    alias: '東西沖符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '是非口舌',
    },
    legionInterpretation: {
      day: '命主易招口舌',
    },
    judgment: '卯與酉相沖',
    storyFragment: '東風西風交會，帶來陣陣口舌之爭。「卯酉沖動，」{advisor}皺眉，「這段時間，少說話為妙。」',
  },
  {
    id: 'yinshen_chong',
    name: '寅申沖',
    alias: '驛馬沖符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: '行動力激發',
      debuff: '衝突劇烈',
    },
    legionInterpretation: {
      day: '命主多動盪',
    },
    judgment: '寅與申相沖',
    storyFragment: '虎嘯猿啼，寅申交鋒，戰場上刀光劍影。「這是驛馬之沖，」{advisor}說道，「劇烈的變動即將到來。」',
  },
  {
    id: 'chenxu_chong',
    name: '辰戌沖',
    alias: '天羅沖符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '家宅不安',
    },
    legionInterpretation: {
      year: '家族不安',
      day: '命主家庭波折',
    },
    judgment: '辰與戌相沖',
    storyFragment: '營帳搖晃，地動山搖。「辰戌沖動，」{advisor}穩住身形，「家宅不寧，需要安撫後方。」',
  },
  {
    id: 'chouwei_chong',
    name: '丑未沖',
    alias: '財庫沖符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '財務、土地之爭',
    },
    legionInterpretation: {
      year: '家族財產糾紛',
      day: '命主財務波動',
    },
    judgment: '丑與未相沖',
    storyFragment: '兩方人馬為了一塊土地爭執不休。「丑未相沖，」{advisor}嘆道，「財庫不穩，這場糾紛難以善了。」',
  },
  {
    id: 'sihai_chong',
    name: '巳亥沖',
    alias: '水火驛沖符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: '衝突激發轉機',
      debuff: '情緒拉扯，反覆奔波',
    },
    legionInterpretation: {
      day: '命主行動多變',
      hour: '晚年常有奔波',
    },
    judgment: '巳與亥相沖',
    storyFragment: '火蛇與海潮正面撞擊，霧氣騰起。「巳亥相沖，」{advisor}提醒，「行程與情緒都容易被拉扯，需要穩住節奏。」',
  },
  
  // ===== 刑（4張）=====
  {
    id: 'yinsishen_xing',
    name: '寅巳申三刑',
    alias: '無恩刑符',
    category: 'xingchonghaipo',
    rarity: 'SSR',
    effect: {
      buff: null,
      debuff: '官非口舌，恩將仇報',
    },
    legionInterpretation: {
      day: '命主易遭背叛',
    },
    judgment: '寅巳申三支齊見',
    storyFragment: '昔日的盟友突然反目，刀劍相向。「寅巳申三刑，」{advisor}痛心道，「這是無恩之刑，恩將仇報。」',
  },
  {
    id: 'chouxuwei_xing',
    name: '丑戌未三刑',
    alias: '恃勢刑符',
    category: 'xingchonghaipo',
    rarity: 'SSR',
    effect: {
      buff: null,
      debuff: '家族矛盾，倚仗權勢',
    },
    legionInterpretation: {
      year: '家族內鬥',
    },
    judgment: '丑戌未三支齊見',
    storyFragment: '家族內部分崩離析，各懷鬼胎。「丑戌未三刑，」{advisor}搖頭，「恃勢之刑，因權勢而反目。」',
  },
  {
    id: 'zimao_xing',
    name: '子卯刑',
    alias: '無禮刑符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '性格乖張，不知禮節',
    },
    legionInterpretation: {
      day: '命主性格偏激',
    },
    judgment: '子與卯相刑',
    storyFragment: '{commander}對長輩出言不遜，眾人側目。「子卯相刑，」老兵嘆息，「無禮之刑，不懂進退。」',
  },
  {
    id: 'chenwu_xing',
    name: '辰午刑',
    alias: '自刑符',
    category: 'xingchonghaipo',
    rarity: 'R',
    effect: {
      buff: null,
      debuff: '行動受阻，自我限制',
    },
    legionInterpretation: {
      day: '命主作繭自縛',
    },
    judgment: '辰與辰自刑，或午與午自刑',
    storyFragment: '{commander}明明有路可走，卻偏偏選擇了死胡同。「自刑之象，」{advisor}無奈道，「最大的敵人是自己。」',
  },
  
  // ===== 害（4張）=====
  {
    id: 'ziwei_hai',
    name: '子未害',
    alias: '感情害符',
    category: 'xingchonghaipo',
    rarity: 'R',
    effect: {
      buff: null,
      debuff: '感情糾葛',
    },
    legionInterpretation: {
      day: '命主感情不順',
    },
    judgment: '子與未相害',
    storyFragment: '心愛之人轉身離去，{commander}伸手卻抓不住。「子未相害，」{advisor}嘆道，「感情之路，荊棘滿途。」',
  },
  {
    id: 'chouwu_hai',
    name: '丑午害',
    alias: '家庭害符',
    category: 'xingchonghaipo',
    rarity: 'R',
    effect: {
      buff: null,
      debuff: '家庭矛盾',
    },
    legionInterpretation: {
      year: '家族矛盾',
    },
    judgment: '丑與午相害',
    storyFragment: '家人之間爭吵不休，{commander}夾在中間左右為難。「丑午相害，」老兵說道，「家和萬事興，家不和則萬事衰。」',
  },
  {
    id: 'yinsi_hai',
    name: '寅巳害',
    alias: '官災害符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '官非官災',
    },
    legionInterpretation: {
      day: '命主易遭官災',
    },
    judgment: '寅與巳相害',
    storyFragment: '一紙訴狀從天而降，{commander}被捲入官司。「寅巳相害，」{advisor}皺眉，「這場官司，怕是難以善了。」',
  },
  {
    id: 'shenhai_hai',
    name: '申亥害',
    alias: '背叛害符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: null,
      debuff: '人際背叛',
    },
    legionInterpretation: {
      day: '命主易遭背叛',
    },
    judgment: '申與亥相害',
    storyFragment: '信任的部下暗中倒戈，{commander}後背發涼。「申亥相害，」{advisor}警告，「防人之心不可無。」',
  },
  
  // ===== 破（1張）=====
  {
    id: 'youxu_po',
    name: '酉戌破',
    alias: '破敗符',
    category: 'xingchonghaipo',
    rarity: 'R',
    effect: {
      buff: null,
      debuff: '財務破損、合作瓦解',
    },
    legionInterpretation: {
      day: '命主合作易散',
    },
    judgment: '酉與戌相破',
    storyFragment: '合作協議付之一炬，曾經的盟友分道揚鑣。「酉戌相破，」{advisor}嘆息，「破鏡難圓，這段合作結束了。」',
  },
  
  // ===== 驛馬（機動）=====
  {
    id: 'yima',
    name: '驛馬',
    alias: '驛站符',
    category: 'xingchonghaipo',
    rarity: 'SR',
    effect: {
      buff: '行動力與遷徙機遇',
      debuff: '奔波漂泊，難以安定',
    },
    legionInterpretation: {
      year: '祖輩多遷徙',
      month: '事業多變動',
      day: '命主奔波勞碌',
      hour: '晚年易搬遷',
    },
    judgment: '申子辰馬在寅；寅午戌馬在申；巳酉丑馬在亥；亥卯未馬在巳',
    storyFragment: '快馬疾馳而過，{advisor}緊握韁繩：「驛馬入命，注定奔波，但也帶來遠方的機遇。」',
  },
];
