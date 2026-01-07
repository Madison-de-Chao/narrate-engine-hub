/**
 * 兵符資料庫（Edge Function 專用極簡版）
 */

export interface BingfuInfo {
  alias: string;
  storyFragment: string;
  interpretation: Record<string, string>;
}

// 極簡版兵符資料庫
const db: Record<string, BingfuInfo> = {
  '天乙貴人': { alias: '貴人符', storyFragment: '貴人踏雲而來，向{commander}頷首護航。', interpretation: { year: '祖上有貴人', month: '職場貴人相助', day: '命主常遇貴人', hour: '子女有貴人緣' } },
  '文昌': { alias: '文曲符', storyFragment: '{advisor}手持古籍，智慧光芒閃爍。', interpretation: { month: '學業考試運強', hour: '子女聰慧' } },
  '驛馬': { alias: '驛站符', storyFragment: '快馬疾馳，{advisor}知曉：驛馬入命，注定奔波。', interpretation: { year: '祖輩多遷徙', month: '事業多變動', day: '命主好動', hour: '晚年不安定' } },
  '將星': { alias: '號令符', storyFragment: '{commander}站高台，三軍肅穆。', interpretation: { year: '家族有權勢', month: '事業有領導才能', day: '命主有統帥氣質', hour: '子女有領導潛質' } },
  '華蓋': { alias: '華蓋符', storyFragment: '{commander}獨自翻典籍，與天地對話。', interpretation: { year: '祖上有宗教藝術緣', month: '喜研究玄學', day: '命主清高孤傲', hour: '晚年好靜' } },
  '羊刃': { alias: '狂刃符', storyFragment: '{commander}佩劍嗡鳴，泛起血紅光芒。', interpretation: { year: '祖輩有血光', month: '事業宜穩', day: '命主性格剛烈', hour: '晚年防意外' } },
  '桃花': { alias: '桃花符', storyFragment: '桃花盛開，{commander}凝視飄落花瓣。', interpretation: { year: '早年有桃花', month: '工作中有桃花', day: '命主桃花旺', hour: '晚年有情感糾葛' } },
  '紅鸞': { alias: '紅鸞符', storyFragment: '紅鳳盤旋{commander}頭頂，婚緣將至。', interpretation: { year: '年支見紅鸞，婚期近' } },
  '天喜': { alias: '天喜符', storyFragment: '營帳響起喜慶樂聲，天喜星照。', interpretation: { year: '年支見天喜，有喜事' } },
  '孤辰': { alias: '孤星符', storyFragment: '{commander}獨立山巔，走不同的路。', interpretation: { year: '早年孤獨', month: '事業需獨立', day: '命主性格孤傲', hour: '晚年孤寂' } },
  '魁罡': { alias: '魁罡符', storyFragment: '{commander}渾身散發攝人威嚴。', interpretation: { day: '命主聰明剛毅，有領導才能' } },
  '空亡': { alias: '虛空符', storyFragment: '{commander}伸手，只抓到虛無。', interpretation: { year: '祖蔭較薄', month: '事業有起伏', day: '命主需放下執著', hour: '子女緣淡薄' } },
};

export function getBingfuInfo(name: string): BingfuInfo | null {
  if (db[name]) return db[name];
  for (const [k, v] of Object.entries(db)) {
    if (name.includes(k) || k.includes(name)) return v;
  }
  return null;
}

export function getBingfuInterpretation(name: string, pillar: 'year' | 'month' | 'day' | 'hour'): string | null {
  return getBingfuInfo(name)?.interpretation[pillar] || null;
}

export function fillStoryFragment(fragment: string, commander: string, advisor: string): string {
  return fragment.replace(/{commander}/g, commander).replace(/{advisor}/g, advisor);
}
