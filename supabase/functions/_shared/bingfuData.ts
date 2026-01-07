/**
 * 兵符資料庫（Edge Function 專用簡化版）
 */

export interface BingfuInfo {
  alias: string;
  storyFragment: string;
  interpretation: Record<string, string>;
}

// 精簡版兵符資料庫 - 只包含最常用的兵符
export const bingfuDatabase: Record<string, BingfuInfo> = {
  '天乙貴人': { alias: '貴人符', storyFragment: '一位身披華服的貴人踏雲而來，向{commander}頷首：「此戰，我將為你護航。」', interpretation: { year: '祖上有貴人', month: '職場貴人相助', day: '命主常遇貴人', hour: '子女有貴人緣' } },
  '文昌': { alias: '文曲符', storyFragment: '{advisor}手持古籍，眼中閃爍智慧光芒。「文昌星照耀此地，策略精準無誤。」', interpretation: { month: '學業考試運強', hour: '子女聰慧' } },
  '文昌貴人': { alias: '文曲符', storyFragment: '{advisor}手持古籍，眼中閃爍智慧光芒。「文昌星照耀此地，策略精準無誤。」', interpretation: { month: '學業考試運強', hour: '子女聰慧' } },
  '驛馬': { alias: '驛站符', storyFragment: '一匹快馬疾馳而過。{advisor}看著塵土：「驛馬入命，注定奔波之人。」', interpretation: { year: '祖輩多遷徙', month: '事業多變動', day: '命主好動', hour: '晚年不安定' } },
  '將星': { alias: '號令符', storyFragment: '{commander}站在高台，一聲令下，三軍肅穆。這是將星的威嚴——天生領導者。', interpretation: { year: '家族有權勢', month: '事業有領導才能', day: '命主有統帥氣質', hour: '子女有領導潛質' } },
  '華蓋': { alias: '華蓋符', storyFragment: '{commander}獨自翻閱典籍。「華蓋入命，」老兵說，「這種人與天地對話，有常人難解的智慧。」', interpretation: { year: '祖上有宗教藝術緣', month: '喜研究玄學', day: '命主清高孤傲', hour: '晚年好靜' } },
  '天德': { alias: '德佑符', storyFragment: '溫和的氣場籠罩營地，{commander}心中祥和。「天德護體，今日縱有刀兵，也傷不了我們。」', interpretation: { year: '家族有人脈', day: '命主性格溫厚' } },
  '月德': { alias: '月德符', storyFragment: '月光灑下，傷病漸癒。{advisor}望月：「月德照臨，是上天恩賜。」', interpretation: { month: '月份有德，貴人運佳' } },
  '金輿': { alias: '座騎符', storyFragment: '金鬃神駒踏雲而來。「金輿星賜予，出行無憂，身份尊貴。」', interpretation: { day: '出入有車馬之便' } },
  '羊刃': { alias: '狂刃符', storyFragment: '{commander}佩劍發出嗡鳴，劍身泛起血紅光芒。「羊刃發動了，」老兵緊張地說，「控制不住會傷自己。」', interpretation: { year: '祖輩有血光', month: '事業宜穩不宜激進', day: '命主性格剛烈', hour: '晚年防意外' } },
  '劫煞': { alias: '奪財符', storyFragment: '蒙面黑影直奔軍餉而去。「劫煞發動！」{commander}大喊，「守住財庫！」', interpretation: { year: '家族有財產損失', month: '事業防破財', day: '命主易遭劫', hour: '晚年財運不穩' } },
  '桃花': { alias: '桃花符', storyFragment: '桃樹開滿粉色花朵。{commander}凝視飄落的花瓣。「桃花入命，」老兵笑道，「異性緣不請自來。」', interpretation: { year: '早年有桃花', month: '工作中有桃花', day: '命主桃花旺', hour: '晚年有情感糾葛' } },
  '紅鸞': { alias: '紅鸞符', storyFragment: '紅色鳳凰盤旋在{commander}頭頂。「紅鸞星動！」老兵大喜，「婚姻緣分將至！」', interpretation: { year: '年支見紅鸞，婚期近' } },
  '天喜': { alias: '天喜符', storyFragment: '營帳內響起喜慶樂聲。{advisor}露出笑容。「天喜星照，喜事將臨。」', interpretation: { year: '年支見天喜，有喜事' } },
  '孤辰': { alias: '孤星符', storyFragment: '{commander}獨自站在山巔。「孤辰入命，」老兵遠望，「這種人注定走不同的路。」', interpretation: { year: '早年孤獨', month: '事業需獨立', day: '命主性格孤傲', hour: '晚年孤寂' } },
  '寡宿': { alias: '寡宿符', storyFragment: '月圓之夜，{advisor}獨自對月飲酒。「寡宿星動，感情之路難以圓滿。」', interpretation: { day: '婚姻需謹慎' } },
  '魁罡': { alias: '魁罡符', storyFragment: '{commander}渾身散發攝人威嚴。「魁罡日生，」老兵耳語，「天生帝王之氣，但也容易剛愎自用。」', interpretation: { day: '命主聰明剛毅，有領導才能' } },
  '空亡': { alias: '虛空符', storyFragment: '{commander}伸手想抓住什麼，卻只抓到虛無。「空亡入命，」老兵嘆息，「有些事注定求而不得。」', interpretation: { year: '祖蔭較薄', month: '事業有起伏', day: '命主需放下執著', hour: '子女緣淡薄' } },
  '天羅': { alias: '天羅符', storyFragment: '無形大網從天空降下，{commander}感到呼吸困難。「天羅地網，困局已至。」', interpretation: { day: '命主易陷困境' } },
  '地網': { alias: '地網符', storyFragment: '腳下土地變得泥濘，{advisor}每步都異常艱難。「地網纏身，進退維谷。」', interpretation: { day: '命主易陷困境' } },
};

export function getBingfuInfo(name: string): BingfuInfo | null {
  if (bingfuDatabase[name]) return bingfuDatabase[name];
  for (const [key, value] of Object.entries(bingfuDatabase)) {
    if (name.includes(key) || key.includes(name)) return value;
  }
  return null;
}

export function getBingfuInterpretation(name: string, pillar: 'year' | 'month' | 'day' | 'hour'): string | null {
  const bf = getBingfuInfo(name);
  return bf?.interpretation[pillar] || null;
}

export function fillStoryFragment(fragment: string, commander: string, advisor: string): string {
  return fragment.replace(/{commander}/g, commander).replace(/{advisor}/g, advisor);
}
