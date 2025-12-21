// 八字學堂課程內容資料庫
// 包含完整課程內容、進階題目和互動遊戲

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
}

export interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

export interface FillBlank {
  id: string;
  sentence: string;
  blanks: string[];
  options: string[];
}

export interface LessonContent {
  id: string;
  title: string;
  introduction: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
  matchGame?: MatchPair[];
  fillBlanks?: FillBlank[];
}

// ==================== 八字基礎課程 ====================
export const BAZI_LESSONS: Record<string, LessonContent> = {
  '四柱基礎': {
    id: 'bazi-basics',
    title: '四柱基礎',
    introduction: '四柱八字是中國傳統命理學的核心，由年、月、日、時四柱組成，每柱各有天干與地支，共八個字，故稱「八字」。',
    keyPoints: [
      '四柱分別代表：年柱（祖先、童年）、月柱（父母、青年）、日柱（自己、配偶）、時柱（子女、晚年）',
      '天干共十個：甲、乙、丙、丁、戊、己、庚、辛、壬、癸',
      '地支共十二個：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥',
      '天干地支相配，形成六十甲子循環',
    ],
    quiz: [
      {
        id: 'q1',
        question: '八字中「四柱」指的是什麼？',
        options: ['金木水火', '東西南北', '年月日時', '春夏秋冬'],
        correctIndex: 2,
        explanation: '四柱指的是年柱、月柱、日柱、時柱，分別代表人生不同階段。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '天干共有幾個？',
        options: ['8個', '10個', '12個', '60個'],
        correctIndex: 1,
        explanation: '天干共有十個：甲、乙、丙、丁、戊、己、庚、辛、壬、癸。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '日柱主要代表什麼？',
        options: ['祖先與童年', '父母與青年', '自己與配偶', '子女與晚年'],
        correctIndex: 2,
        explanation: '日柱代表命主本人，日干為「日元」，是八字分析的核心。日支則與配偶相關。',
        difficulty: 'basic'
      },
      {
        id: 'q4',
        question: '地支「子」對應的生肖是？',
        options: ['牛', '虎', '鼠', '兔'],
        correctIndex: 2,
        explanation: '地支「子」對應十二生肖中的鼠，子時為深夜11點至1點。',
        difficulty: 'basic'
      },
      {
        id: 'q5',
        question: '六十甲子是如何形成的？',
        options: ['10天干+12地支=22', '10×12=120再除2', '天干地支依次相配', '隨機組合'],
        correctIndex: 2,
        explanation: '天干地支依次相配，陽干配陽支、陰干配陰支，形成60組循環。',
        difficulty: 'intermediate'
      },
      {
        id: 'q6',
        question: '以下哪個不是天干？',
        options: ['甲', '子', '丙', '戊'],
        correctIndex: 1,
        explanation: '「子」是地支，不是天干。天干為甲乙丙丁戊己庚辛壬癸。',
        difficulty: 'basic'
      },
      {
        id: 'q7',
        question: '月柱代表人生哪個階段？',
        options: ['1-16歲', '17-32歲', '33-48歲', '49歲以後'],
        correctIndex: 1,
        explanation: '月柱代表青年時期（17-32歲），也代表父母宮和事業宮。',
        difficulty: 'intermediate'
      },
      {
        id: 'q8',
        question: '下列哪組天干屬於陰干？',
        options: ['甲丙戊庚壬', '乙丁己辛癸', '甲乙丙丁戊', '己庚辛壬癸'],
        correctIndex: 1,
        explanation: '乙丁己辛癸為陰干（偶數位置），甲丙戊庚壬為陽干（奇數位置）。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '年柱', definition: '祖先、童年（1-16歲）' },
      { id: 'm2', term: '月柱', definition: '父母、青年（17-32歲）' },
      { id: 'm3', term: '日柱', definition: '自己、配偶（33-48歲）' },
      { id: 'm4', term: '時柱', definition: '子女、晚年（49歲後）' },
    ],
    fillBlanks: [
      {
        id: 'f1',
        sentence: '天干共有___個，地支共有___個，組合成___甲子',
        blanks: ['十', '十二', '六十'],
        options: ['八', '十', '十二', '六十', '一百二十']
      }
    ]
  },
  '天干詳解': {
    id: 'tiangan',
    title: '天干詳解',
    introduction: '十天干是八字命理的基礎元素，每個天干都有其獨特的五行屬性和陰陽特質。',
    keyPoints: [
      '甲乙屬木：甲為陽木（大樹）、乙為陰木（花草）',
      '丙丁屬火：丙為陽火（太陽）、丁為陰火（燭光）',
      '戊己屬土：戊為陽土（高山）、己為陰土（田園）',
      '庚辛屬金：庚為陽金（刀劍）、辛為陰金（珠玉）',
      '壬癸屬水：壬為陽水（江河）、癸為陰水（雨露）',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「丙火」象徵什麼？',
        options: ['燭光', '太陽', '閃電', '營火'],
        correctIndex: 1,
        explanation: '丙為陽火，象徵太陽，光明磊落、熱情奔放。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '下列哪個天干屬於陰金？',
        options: ['庚', '辛', '戊', '己'],
        correctIndex: 1,
        explanation: '辛為陰金，象徵珠玉、首飾，細膩精緻。庚為陽金。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '「甲木」的象徵物是？',
        options: ['花草', '藤蔓', '大樹', '落葉'],
        correctIndex: 2,
        explanation: '甲為陽木，象徵參天大樹，性格剛正不阿、直來直往。',
        difficulty: 'basic'
      },
      {
        id: 'q4',
        question: '以下哪個天干屬水？',
        options: ['戊', '己', '庚', '癸'],
        correctIndex: 3,
        explanation: '癸屬陰水，象徵雨露。壬癸皆屬水。',
        difficulty: 'basic'
      },
      {
        id: 'q5',
        question: '「己土」象徵什麼？',
        options: ['高山', '田園', '沙漠', '岩石'],
        correctIndex: 1,
        explanation: '己為陰土，象徵田園沃土，能包容滋養萬物。',
        difficulty: 'intermediate'
      },
      {
        id: 'q6',
        question: '下列天干五行配對，何者錯誤？',
        options: ['甲-木', '丙-火', '庚-水', '壬-水'],
        correctIndex: 2,
        explanation: '庚屬金，不屬水。庚為陽金，象徵刀劍。',
        difficulty: 'intermediate'
      },
      {
        id: 'q7',
        question: '「丁火」與「丙火」的主要區別是？',
        options: ['一個是木一個是火', '一個是陰一個是陽', '一個強一個弱', '沒有區別'],
        correctIndex: 1,
        explanation: '丙為陽火如太陽，丁為陰火如燭光，陰陽屬性不同。',
        difficulty: 'intermediate'
      },
      {
        id: 'q8',
        question: '象徵「江河大海」的天干是？',
        options: ['癸', '壬', '亥', '子'],
        correctIndex: 1,
        explanation: '壬為陽水，象徵江河大海，氣勢磅礴。癸為陰水如雨露。',
        difficulty: 'intermediate'
      },
      {
        id: 'q9',
        question: '甲木日主最喜歡遇到什麼？',
        options: ['庚金來剋', '丙火來洩', '癸水來生', '己土來合'],
        correctIndex: 2,
        explanation: '水生木，癸水能滋養甲木，使其茁壯成長。',
        difficulty: 'advanced'
      },
      {
        id: 'q10',
        question: '天干合化中，「甲己合」合化成什麼五行？',
        options: ['木', '火', '土', '金'],
        correctIndex: 2,
        explanation: '甲己合化土，條件具備時會轉化為土的五行。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '甲木', definition: '大樹（陽木）' },
      { id: 'm2', term: '乙木', definition: '花草（陰木）' },
      { id: 'm3', term: '丙火', definition: '太陽（陽火）' },
      { id: 'm4', term: '丁火', definition: '燭光（陰火）' },
      { id: 'm5', term: '戊土', definition: '高山（陽土）' },
      { id: 'm6', term: '己土', definition: '田園（陰土）' },
      { id: 'm7', term: '庚金', definition: '刀劍（陽金）' },
      { id: 'm8', term: '辛金', definition: '珠玉（陰金）' },
      { id: 'm9', term: '壬水', definition: '江河（陽水）' },
      { id: 'm10', term: '癸水', definition: '雨露（陰水）' },
    ],
    fillBlanks: [
      {
        id: 'f1',
        sentence: '丙丁屬___，戊己屬___，庚辛屬___',
        blanks: ['火', '土', '金'],
        options: ['木', '火', '土', '金', '水']
      }
    ]
  },
  '地支詳解': {
    id: 'dizhi',
    title: '地支詳解',
    introduction: '十二地支對應十二生肖，也與月份、時辰密切相關。',
    keyPoints: [
      '地支藏干：每個地支內含一至三個天干',
      '三合局：申子辰合水、寅午戌合火、巳酉丑合金、亥卯未合木',
      '六合：子丑合、寅亥合、卯戌合、辰酉合、巳申合、午未合',
      '相沖：子午沖、丑未沖、寅申沖、卯酉沖、辰戌沖、巳亥沖',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「寅午戌」三合形成什麼局？',
        options: ['水局', '火局', '金局', '木局'],
        correctIndex: 1,
        explanation: '寅午戌三合火局，寅木生午火，戌土藏火庫。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '下列哪組地支相沖？',
        options: ['子丑', '寅亥', '卯酉', '巳申'],
        correctIndex: 2,
        explanation: '卯酉相沖，為東西方位對沖。其他選項都是相合關係。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '「子」地支藏什麼天干？',
        options: ['只藏癸水', '藏壬癸水', '藏甲木', '藏丙火'],
        correctIndex: 0,
        explanation: '子為純水之地支，只藏癸水（本氣）。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '「申子辰」三合形成什麼局？',
        options: ['木局', '火局', '土局', '水局'],
        correctIndex: 3,
        explanation: '申子辰三合水局，子為水之旺地，申辰為水之生墓之地。',
        difficulty: 'basic'
      },
      {
        id: 'q5',
        question: '以下哪組是六合關係？',
        options: ['子午', '寅申', '卯戌', '辰戌'],
        correctIndex: 2,
        explanation: '卯戌六合，卯戌合火。其他選項為相沖關係。',
        difficulty: 'intermediate'
      },
      {
        id: 'q6',
        question: '地支「午」對應哪個生肖和月份？',
        options: ['蛇，四月', '馬，五月', '羊，六月', '猴，七月'],
        correctIndex: 1,
        explanation: '午為馬，對應農曆五月（芒種至小暑）。',
        difficulty: 'intermediate'
      },
      {
        id: 'q7',
        question: '「寅」地支的藏干包含？',
        options: ['甲丙戊', '甲乙丙', '甲丙庚', '甲戊庚'],
        correctIndex: 0,
        explanation: '寅藏甲木（本氣）、丙火（中氣）、戊土（餘氣）。',
        difficulty: 'advanced'
      },
      {
        id: 'q8',
        question: '以下哪個是地支相刑關係？',
        options: ['子午刑', '寅巳申刑', '卯酉刑', '辰戌刑'],
        correctIndex: 1,
        explanation: '寅巳申為無恩之刑，三者互刑。子午為相沖非相刑。',
        difficulty: 'advanced'
      },
      {
        id: 'q9',
        question: '地支「辰戌丑未」合稱什麼？',
        options: ['四生', '四旺', '四庫', '四絕'],
        correctIndex: 2,
        explanation: '辰戌丑未為四土，又稱四庫（墓庫），能藏納五行。',
        difficulty: 'intermediate'
      },
      {
        id: 'q10',
        question: '子丑合化成什麼五行？',
        options: ['水', '土', '金', '木'],
        correctIndex: 1,
        explanation: '子丑合化土，子水遇丑土合而化土。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '申子辰', definition: '三合水局' },
      { id: 'm2', term: '寅午戌', definition: '三合火局' },
      { id: 'm3', term: '巳酉丑', definition: '三合金局' },
      { id: 'm4', term: '亥卯未', definition: '三合木局' },
      { id: 'm5', term: '子丑', definition: '六合土' },
      { id: 'm6', term: '寅亥', definition: '六合木' },
    ],
    fillBlanks: [
      {
        id: 'f1',
        sentence: '子午相___，寅亥相___，卯戌相___',
        blanks: ['沖', '合', '合'],
        options: ['沖', '合', '刑', '害', '破']
      }
    ]
  },
  '八字排盤': {
    id: 'paipan',
    title: '八字排盤',
    introduction: '排盤是將出生時間轉換成八字命盤的過程，需要掌握萬年曆和節氣知識。',
    keyPoints: [
      '年柱以立春為界，非農曆新年',
      '月柱以節氣為準，每月兩個節氣',
      '日柱以子時為界（晚上11點）',
      '時柱分為十二個時辰，每個時辰兩小時',
    ],
    quiz: [
      {
        id: 'q1',
        question: '八字命盤中，年柱的更替以什麼為準？',
        options: ['農曆新年', '立春', '元旦', '冬至'],
        correctIndex: 1,
        explanation: '八字以立春為年柱交替點，而非農曆新年。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '一個時辰等於幾個小時？',
        options: ['1小時', '2小時', '3小時', '4小時'],
        correctIndex: 1,
        explanation: '一天24小時分為12時辰，每個時辰2小時。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '子時是幾點到幾點？',
        options: ['0:00-2:00', '23:00-1:00', '1:00-3:00', '22:00-0:00'],
        correctIndex: 1,
        explanation: '子時從晚上23:00到凌晨1:00，橫跨兩天。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '農曆正月的節氣界限是？',
        options: ['小寒至立春', '立春至驚蟄', '雨水至春分', '驚蟄至清明'],
        correctIndex: 1,
        explanation: '正月寅月以立春為起點，驚蟄為終點。',
        difficulty: 'intermediate'
      },
      {
        id: 'q5',
        question: '如果一個人出生在農曆臘月二十但立春之後，年柱屬於？',
        options: ['前一年', '當年', '要看時辰', '要看月份'],
        correctIndex: 1,
        explanation: '立春後出生，年柱即屬新的一年，無論農曆日期。',
        difficulty: 'advanced'
      },
      {
        id: 'q6',
        question: '「早子時」與「夜子時」的區別是？',
        options: ['沒有區別', '23-24點為夜子時，0-1點為早子時', '一個在今天一個在明天', '以上皆是'],
        correctIndex: 3,
        explanation: '夜子時（23-24點）屬今天，早子時（0-1點）屬明天，日柱不同。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '子時', definition: '23:00-01:00' },
      { id: 'm2', term: '丑時', definition: '01:00-03:00' },
      { id: 'm3', term: '寅時', definition: '03:00-05:00' },
      { id: 'm4', term: '卯時', definition: '05:00-07:00' },
      { id: 'm5', term: '辰時', definition: '07:00-09:00' },
      { id: 'm6', term: '巳時', definition: '09:00-11:00' },
    ],
    fillBlanks: [
      {
        id: 'f1',
        sentence: '年柱以___為界，月柱以___為準',
        blanks: ['立春', '節氣'],
        options: ['農曆新年', '立春', '節氣', '元旦', '冬至']
      }
    ]
  }
};

// ==================== 軍團課程 ====================
export const LEGION_LESSONS: Record<string, LessonContent> = {
  '年柱軍團': {
    id: 'year-legion',
    title: '年柱軍團',
    introduction: '年柱軍團代表祖先的能量傳承，影響童年時期（1-16歲）的運勢。',
    keyPoints: [
      '年柱代表祖先庇蔭與家族根基',
      '年干代表祖父、年支代表祖母',
      '年柱與月柱相生相合者，家庭和睦',
      '年柱受沖剋者，童年較多波折',
    ],
    quiz: [
      {
        id: 'q1',
        question: '年柱主要影響人生哪個階段？',
        options: ['1-16歲', '17-32歲', '33-48歲', '49歲以後'],
        correctIndex: 0,
        explanation: '年柱代表童年時期（1-16歲），反映祖先能量和早年環境。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '年柱在傳統命理中代表什麼宮位？',
        options: ['父母宮', '祖德宮', '配偶宮', '子女宮'],
        correctIndex: 1,
        explanation: '年柱為祖德宮，代表祖先庇蔭和家族根基。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '年柱有天乙貴人代表什麼？',
        options: ['晚年富貴', '童年受祖蔭', '事業有成', '婚姻美滿'],
        correctIndex: 1,
        explanation: '年柱有貴人，代表祖上積德，童年時期容易受到長輩照顧。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '年干', definition: '代表祖父、外在形象' },
      { id: 'm2', term: '年支', definition: '代表祖母、內在根基' },
      { id: 'm3', term: '年柱逢沖', definition: '童年多變動或波折' },
      { id: 'm4', term: '年柱逢合', definition: '家族和睦有靠山' },
    ]
  },
  '月柱軍團': {
    id: 'month-legion',
    title: '月柱軍團',
    introduction: '月柱軍團代表父母的影響力，主導青年時期（17-32歲）的發展。',
    keyPoints: [
      '月柱為「提綱」，是八字格局的關鍵',
      '月干代表父親、月支代表母親',
      '月令決定日主的強弱旺衰',
      '月柱也代表事業宮和兄弟宮',
    ],
    quiz: [
      {
        id: 'q1',
        question: '月柱在八字中又稱為什麼？',
        options: ['命宮', '提綱', '福德', '遷移'],
        correctIndex: 1,
        explanation: '月柱又稱「提綱」，是確定八字格局的關鍵。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「月令」指的是？',
        options: ['月份的天干', '月份的地支', '月柱整體', '月份的節氣'],
        correctIndex: 1,
        explanation: '月令特指月柱的地支，是判斷日主旺衰的關鍵。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '月柱與日柱天合地合代表？',
        options: ['與父母緣薄', '與父母關係密切', '事業不順', '婚姻不利'],
        correctIndex: 1,
        explanation: '月日天合地合，代表與父母感情深厚，得父母助力。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '月干', definition: '代表父親、外在事業' },
      { id: 'm2', term: '月支（月令）', definition: '代表母親、格局根基' },
      { id: 'm3', term: '月柱逢財', definition: '父母經濟條件好' },
      { id: 'm4', term: '月柱逢印', definition: '父母疼愛照顧' },
    ]
  },
  '日柱軍團': {
    id: 'day-legion',
    title: '日柱軍團',
    introduction: '日柱軍團是八字的核心，日干代表命主本人，日支代表配偶宮。',
    keyPoints: [
      '日干為「日元」或「日主」，代表自己',
      '日支為「配偶宮」，影響婚姻感情',
      '日柱代表中年時期（33-48歲）',
      '十神皆以日干為中心推算',
    ],
    quiz: [
      {
        id: 'q1',
        question: '日支在八字中代表什麼宮位？',
        options: ['父母宮', '兄弟宮', '配偶宮', '子女宮'],
        correctIndex: 2,
        explanation: '日支為配偶宮，與婚姻感情密切相關。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「日元」指的是？',
        options: ['日柱地支', '日柱天干', '月柱天干', '年柱天干'],
        correctIndex: 1,
        explanation: '日元即日柱天干，代表命主本人，是八字分析的中心。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '日支為桃花星代表？',
        options: ['配偶長相好', '容易離婚', '沒有桃花', '事業有貴人'],
        correctIndex: 0,
        explanation: '日支坐桃花，配偶通常長相出眾或有魅力。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '日柱干支相同（如甲寅、乙卯）稱為？',
        options: ['天地德合', '日坐專祿', '魁罡日', '日坐長生'],
        correctIndex: 1,
        explanation: '日干坐於該干的祿位，稱為「日坐專祿」，自立自強。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '日干（日元）', definition: '命主本人、自我核心' },
      { id: 'm2', term: '日支', definition: '配偶宮、婚姻品質' },
      { id: 'm3', term: '日支逢沖', definition: '婚姻多變動' },
      { id: 'm4', term: '日支逢合', definition: '配偶緣分深' },
    ]
  },
  '時柱軍團': {
    id: 'hour-legion',
    title: '時柱軍團',
    introduction: '時柱軍團代表子女運勢和晚年福祿，影響49歲以後的人生。',
    keyPoints: [
      '時柱代表子女宮，反映子嗣緣分',
      '時干代表兒子、時支代表女兒',
      '時柱也代表晚年的居所和歸宿',
      '時柱有吉星者，晚年得子女孝順',
    ],
    quiz: [
      {
        id: 'q1',
        question: '時柱主要代表哪方面的運勢？',
        options: ['事業財運', '婚姻感情', '子女晚年', '健康疾病'],
        correctIndex: 2,
        explanation: '時柱代表子女宮，也反映晚年運勢。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '時柱有財星代表？',
        options: ['子女緣薄', '晚年富裕', '事業有成', '婚姻美滿'],
        correctIndex: 1,
        explanation: '時柱見財，晚年經濟狀況好，也代表子女能賺錢。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '時柱逢空亡的影響是？',
        options: ['子女緣薄或較晚得子', '事業不順', '婚姻不利', '祖業難守'],
        correctIndex: 0,
        explanation: '時柱空亡可能子女緣較薄，或較晚年才得子。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '時干', definition: '代表兒子、晚年事業' },
      { id: 'm2', term: '時支', definition: '代表女兒、最終歸宿' },
      { id: 'm3', term: '時柱逢印', definition: '子女孝順有學問' },
      { id: 'm4', term: '時柱逢傷官', definition: '子女聰明有才華' },
    ]
  }
};

// ==================== 五行課程 ====================
export const WUXING_LESSONS: Record<string, LessonContent> = {
  '五行基礎': {
    id: 'wuxing-basics',
    title: '五行基礎',
    introduction: '五行學說是中國古代哲學的核心，認為宇宙萬物由金、木、水、火、土五種基本元素組成。',
    keyPoints: [
      '木：生長、仁愛、條達',
      '火：熱情、禮儀、光明',
      '土：穩重、信義、包容',
      '金：決斷、義氣、收斂',
      '水：智慧、靈活、潤下',
    ],
    quiz: [
      {
        id: 'q1',
        question: '五行中「水」的特性是什麼？',
        options: ['條達生長', '收斂決斷', '智慧靈活', '熱情禮儀'],
        correctIndex: 2,
        explanation: '水主智，特性為潤下、靈活、智慧。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '五行中「金」對應的德性是？',
        options: ['仁', '禮', '信', '義'],
        correctIndex: 3,
        explanation: '金主義，對應義氣、決斷的德性。木仁、火禮、土信、水智。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '五行與五臟的對應，何者正確？',
        options: ['木-心', '火-肝', '土-脾', '金-腎'],
        correctIndex: 2,
        explanation: '土對應脾胃。木-肝、火-心、金-肺、水-腎。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '五行與方位的對應，「木」對應？',
        options: ['東方', '西方', '南方', '北方'],
        correctIndex: 0,
        explanation: '木屬東方。火南、金西、水北、土中央。',
        difficulty: 'basic'
      },
      {
        id: 'q5',
        question: '五行與季節的對應，「金」對應？',
        options: ['春', '夏', '秋', '冬'],
        correctIndex: 2,
        explanation: '金屬秋季。木春、火夏、水冬、土四季（長夏）。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '木', definition: '生長、仁愛、東方、春季' },
      { id: 'm2', term: '火', definition: '熱情、禮儀、南方、夏季' },
      { id: 'm3', term: '土', definition: '穩重、信義、中央、長夏' },
      { id: 'm4', term: '金', definition: '決斷、義氣、西方、秋季' },
      { id: 'm5', term: '水', definition: '智慧、靈活、北方、冬季' },
    ]
  },
  '相生關係': {
    id: 'wuxing-sheng',
    title: '相生關係',
    introduction: '五行相生是一種促進、滋養的關係，形成循環不息的生命力。',
    keyPoints: [
      '木生火：木燃燒生火',
      '火生土：火燒成灰燼成土',
      '土生金：土中蘊藏礦金',
      '金生水：金屬遇冷凝結水珠',
      '水生木：水滋養樹木生長',
    ],
    quiz: [
      {
        id: 'q1',
        question: '下列哪個是正確的相生關係？',
        options: ['火生木', '金生火', '水生金', '土生金'],
        correctIndex: 3,
        explanation: '土生金，土中蘊藏金屬礦脈。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「水生木」的自然原理是？',
        options: ['水能滅火', '水滋潤樹木', '水沖刷土地', '水凝結成冰'],
        correctIndex: 1,
        explanation: '水能滋養樹木生長，使草木茂盛。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '在八字中，什麼是「印星」的本質？',
        options: ['我剋者', '剋我者', '生我者', '同我者'],
        correctIndex: 2,
        explanation: '印星是生我者，如水生木，水就是木的印星。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '木日主見水是什麼十神關係？',
        options: ['食傷', '財星', '印星', '官殺'],
        correctIndex: 2,
        explanation: '水生木，水是木的印星（生我者為印）。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '木生火', definition: '木燃燒產生火焰' },
      { id: 'm2', term: '火生土', definition: '燃燒後成為灰燼' },
      { id: 'm3', term: '土生金', definition: '土中蘊含礦藏' },
      { id: 'm4', term: '金生水', definition: '金屬凝結水珠' },
      { id: 'm5', term: '水生木', definition: '水滋潤樹木生長' },
    ],
    fillBlanks: [
      {
        id: 'f1',
        sentence: '生我者為___，我生者為___',
        blanks: ['印', '食傷'],
        options: ['印', '比劫', '食傷', '財', '官殺']
      }
    ]
  },
  '相剋關係': {
    id: 'wuxing-ke',
    title: '相剋關係',
    introduction: '五行相剋是一種制約、控制的關係，維持萬物的平衡。',
    keyPoints: [
      '木剋土：樹根穿透土地',
      '土剋水：土能堵水築壩',
      '水剋火：水能滅火',
      '火剋金：火能熔化金屬',
      '金剋木：刀斧砍伐樹木',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「火」會被什麼五行剋制？',
        options: ['木', '土', '金', '水'],
        correctIndex: 3,
        explanation: '水剋火，水能滅火，這是自然界的基本法則。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '下列哪個是正確的相剋關係？',
        options: ['木剋水', '火剋土', '土剋水', '金剋火'],
        correctIndex: 2,
        explanation: '土剋水，土能築壩堵水。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '在八字中，「剋我者」是什麼十神？',
        options: ['印星', '比劫', '食傷', '官殺'],
        correctIndex: 3,
        explanation: '剋我者為官殺，如金剋木，金就是木的官殺。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '五行相剋的順序是？',
        options: ['木火土金水', '木土水火金', '金木土水火', '水火金木土'],
        correctIndex: 1,
        explanation: '木剋土、土剋水、水剋火、火剋金、金剋木。',
        difficulty: 'intermediate'
      },
      {
        id: 'q5',
        question: '土日主見木是什麼十神關係？',
        options: ['財星', '印星', '官殺', '食傷'],
        correctIndex: 2,
        explanation: '木剋土，木是土的官殺（剋我者為官殺）。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '木剋土', definition: '樹根穿透土地' },
      { id: 'm2', term: '土剋水', definition: '土能堵水築壩' },
      { id: 'm3', term: '水剋火', definition: '水能撲滅火焰' },
      { id: 'm4', term: '火剋金', definition: '火能熔化金屬' },
      { id: 'm5', term: '金剋木', definition: '刀斧砍伐樹木' },
    ]
  },
  '五行平衡': {
    id: 'wuxing-balance',
    title: '五行平衡',
    introduction: '八字命理追求五行平衡，過旺或過弱都會帶來人生課題。',
    keyPoints: [
      '五行俱全者，性格較為圓融',
      '五行有缺者，可透過後天補足',
      '身強者需洩氣或剋制',
      '身弱者需生扶或比助',
    ],
    quiz: [
      {
        id: 'q1',
        question: '當八字五行偏旺時，應該如何調節？',
        options: ['繼續加強', '洩氣或剋制', '保持不變', '完全相反'],
        correctIndex: 1,
        explanation: '五行偏旺需要洩氣（生其他五行）或剋制，以達到平衡。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「身弱」的八字需要什麼？',
        options: ['財星和官殺', '印星和比劫', '食傷和財星', '官殺和傷官'],
        correctIndex: 1,
        explanation: '身弱需要印星（生扶）和比劫（幫身）來增強日主力量。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '八字缺水的人適合從事什麼行業？',
        options: ['餐飲業', '金融業', '建築業', '農業'],
        correctIndex: 1,
        explanation: '金融、航運、物流等流動性行業屬水，適合補水。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '五行「土」過旺可能有什麼問題？',
        options: ['固執己見', '優柔寡斷', '衝動暴躁', '冷漠無情'],
        correctIndex: 0,
        explanation: '土旺者可能過於固執、保守，缺乏變通。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '身強', definition: '需要洩氣或剋制' },
      { id: 'm2', term: '身弱', definition: '需要生扶或比助' },
      { id: 'm3', term: '五行俱全', definition: '性格較為圓融' },
      { id: 'm4', term: '五行有缺', definition: '可透過後天補足' },
    ]
  }
};

// ==================== 十神課程 ====================
export const TENGODS_LESSONS: Record<string, LessonContent> = {
  '比劫印星': {
    id: 'bijie-yinxing',
    title: '比劫印星',
    introduction: '比肩、劫財、正印、偏印是八字十神中與日主同類或生扶日主的神。',
    keyPoints: [
      '比肩：與日主同性同五行，代表兄弟姐妹、朋友',
      '劫財：與日主異性同五行，代表競爭者、合作夥伴',
      '正印：異性生日主者，代表母親、貴人、學業',
      '偏印：同性生日主者，代表繼母、偏門學問',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「正印」在十神中代表什麼關係？',
        options: ['生我者（異性）', '我生者（同性）', '剋我者（異性）', '我剋者（同性）'],
        correctIndex: 0,
        explanation: '正印是異性生我者，如陽日主見陰印星，代表母親和貴人。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「比肩」與「劫財」的區別是？',
        options: ['五行不同', '陰陽相同與否', '強弱不同', '位置不同'],
        correctIndex: 1,
        explanation: '比肩與日主同性，劫財與日主異性，但五行相同。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '「偏印」又稱為什麼？',
        options: ['正母', '梟神', '食神', '傷官'],
        correctIndex: 1,
        explanation: '偏印又稱梟神、梟印，因偏印會剋制食神。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '比劫旺的八字有什麼特點？',
        options: ['缺乏主見', '獨立自主、不服輸', '依賴心重', '謹慎保守'],
        correctIndex: 1,
        explanation: '比劫旺者個性獨立、自尊心強、不願屈服。',
        difficulty: 'intermediate'
      },
      {
        id: 'q5',
        question: '甲木日主見癸水是什麼十神？',
        options: ['正印', '偏印', '比肩', '劫財'],
        correctIndex: 1,
        explanation: '癸水生甲木，且癸與甲同為陰陽相同（都為陽），故為偏印。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '比肩', definition: '同性同五行，兄弟朋友' },
      { id: 'm2', term: '劫財', definition: '異性同五行，競爭夥伴' },
      { id: 'm3', term: '正印', definition: '異性生我，母親貴人' },
      { id: 'm4', term: '偏印（梟神）', definition: '同性生我，偏門學問' },
    ]
  },
  '食傷財星': {
    id: 'shishang-caixing',
    title: '食傷財星',
    introduction: '食神、傷官、正財、偏財是日主所生或所剋的十神，代表才華與財運。',
    keyPoints: [
      '食神：同性我生者，代表才華、口福、女命子女',
      '傷官：異性我生者，代表叛逆、創意、技藝',
      '正財：異性我剋者，代表穩定收入、正妻',
      '偏財：同性我剋者，代表意外之財、父親',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「偏財」在男命中常代表什麼？',
        options: ['母親', '正妻', '父親', '子女'],
        correctIndex: 2,
        explanation: '偏財在男命中代表父親，也代表意外之財和情人。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「食神」的特質是？',
        options: ['衝動叛逆', '溫和有福', '權威強勢', '保守固執'],
        correctIndex: 1,
        explanation: '食神溫和有福氣，享受生活，與傷官的銳利不同。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '傷官旺的人適合什麼職業？',
        options: ['公務員', '藝術創作者', '會計師', '銀行職員'],
        correctIndex: 1,
        explanation: '傷官代表創意、技藝，適合藝術、設計、表演等創作領域。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '「傷官見官」有什麼影響？',
        options: ['官運亨通', '易有官非是非', '財運大發', '婚姻美滿'],
        correctIndex: 1,
        explanation: '傷官剋官，傷官見官容易有口舌是非、與上司不合。',
        difficulty: 'advanced'
      },
      {
        id: 'q5',
        question: '丙火日主見戊土是什麼十神？',
        options: ['食神', '傷官', '正財', '偏財'],
        correctIndex: 0,
        explanation: '丙火生戊土，丙與戊皆為陽，同性我生者為食神。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '食神', definition: '同性我生，才華口福' },
      { id: 'm2', term: '傷官', definition: '異性我生，創意叛逆' },
      { id: 'm3', term: '正財', definition: '異性我剋，穩定收入' },
      { id: 'm4', term: '偏財', definition: '同性我剋，意外之財' },
    ]
  },
  '官殺體系': {
    id: 'guansha',
    title: '官殺體系',
    introduction: '正官與七殺是剋制日主的十神，代表壓力、約束和權力。',
    keyPoints: [
      '正官：異性剋我者，代表工作、上司、女命丈夫',
      '七殺：同性剋我者，代表壓力、小人、男命子女',
      '官殺混雜需要制化',
      '官星太旺需要印星化解',
    ],
    quiz: [
      {
        id: 'q1',
        question: '七殺與正官的主要區別是什麼？',
        options: ['五行不同', '陰陽同異', '位置不同', '強弱不同'],
        correctIndex: 1,
        explanation: '正官是異性剋我，七殺是同性剋我，陰陽配置不同導致作用差異。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '女命的「正官」通常代表？',
        options: ['父親', '兄弟', '丈夫', '兒子'],
        correctIndex: 2,
        explanation: '女命正官為夫星，代表丈夫或正式交往對象。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '「殺印相生」是什麼意思？',
        options: ['七殺剋印星', '印星化解七殺', '七殺生印星', '印星剋七殺'],
        correctIndex: 1,
        explanation: '七殺太旺時，用印星來化解七殺的剋力，轉化為生扶日主。',
        difficulty: 'advanced'
      },
      {
        id: 'q4',
        question: '「官殺混雜」有什麼問題？',
        options: ['財運亨通', '事業穩定', '目標不清、壓力混亂', '婚姻美滿'],
        correctIndex: 2,
        explanation: '官殺混雜代表壓力來源多且複雜，容易迷失方向。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '正官', definition: '異性剋我，規範約束' },
      { id: 'm2', term: '七殺', definition: '同性剋我，壓力挑戰' },
      { id: 'm3', term: '殺印相生', definition: '印化七殺之凶' },
      { id: 'm4', term: '食神制殺', definition: '食神制約七殺' },
    ]
  },
  '十神綜合': {
    id: 'shishen-zonghe',
    title: '十神綜合',
    introduction: '十神的組合搭配形成不同的命局格局，需要綜合分析。',
    keyPoints: [
      '十神分為四組：比劫、印星、食傷、財官',
      '十神喜忌取決於日主強弱',
      '十神之間存在生剋制化關係',
      '十神在不同柱位有不同含義',
    ],
    quiz: [
      {
        id: 'q1',
        question: '十神體系的核心參照點是什麼？',
        options: ['年干', '月支', '日干', '時支'],
        correctIndex: 2,
        explanation: '十神皆以日干為中心推算，日干是判斷其他天干地支十神的基準。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '身強者喜用什麼十神？',
        options: ['印星、比劫', '食傷、財官', '印星、官殺', '比劫、財星'],
        correctIndex: 1,
        explanation: '身強需要洩耗，食傷洩秀、財星耗身、官殺剋身。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '以下哪個是正確的十神生剋順序？',
        options: ['印生比、比生食、食生財、財生官', '比生印、印生官、官生財、財生食', '官生印、印生比、比生食、食生財', '財生官、官生印、印生食、食生比'],
        correctIndex: 0,
        explanation: '印生比劫、比劫生食傷、食傷生財星、財星生官殺、官殺生印星。',
        difficulty: 'advanced'
      },
      {
        id: 'q4',
        question: '「財破印」是什麼意思？',
        options: ['財星生印星', '財星剋制印星', '印星剋制財星', '財印互生'],
        correctIndex: 1,
        explanation: '財星剋印，財旺則印弱，可能影響學業、貴人運。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '身強', definition: '喜食傷財官' },
      { id: 'm2', term: '身弱', definition: '喜印星比劫' },
      { id: 'm3', term: '財破印', definition: '財星剋制印星' },
      { id: 'm4', term: '傷官見官', definition: '傷官剋制正官' },
    ]
  }
};

// ==================== 神煞課程 ====================
export const SHENSHA_LESSONS: Record<string, LessonContent> = {
  '吉神總覽': {
    id: 'jishen',
    title: '吉神總覽',
    introduction: '吉神是八字中帶來正面能量的星曜，如天乙貴人、文昌星等。',
    keyPoints: [
      '天乙貴人：逢凶化吉、貴人相助',
      '文昌星：聰明智慧、考試順利',
      '天德貴人：行善積德、逢難呈祥',
      '月德貴人：心地善良、自有天助',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「天乙貴人」的主要作用是什麼？',
        options: ['增加財運', '逢凶化吉', '提升桃花', '強化事業'],
        correctIndex: 1,
        explanation: '天乙貴人是最重要的吉神，主逢凶化吉、遇難呈祥。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「文昌星」對哪方面最有幫助？',
        options: ['財運', '婚姻', '學業考試', '健康'],
        correctIndex: 2,
        explanation: '文昌主聰明智慧，對學業考試特別有利。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '八字有多個貴人代表什麼？',
        options: ['貴人太多反而不好', '一生多貴人相助', '會互相抵消', '只有一個有效'],
        correctIndex: 1,
        explanation: '貴人多代表人緣好、常有人幫助，是好的徵兆。',
        difficulty: 'intermediate'
      },
      {
        id: 'q4',
        question: '「太極貴人」的特質是？',
        options: ['武藝高強', '對玄學命理有天賦', '善於經商', '擅長社交'],
        correctIndex: 1,
        explanation: '太極貴人對易學、命理、玄學有特殊興趣和天賦。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '天乙貴人', definition: '逢凶化吉、貴人相助' },
      { id: 'm2', term: '文昌星', definition: '聰明智慧、考試順利' },
      { id: 'm3', term: '天德貴人', definition: '行善積德、逢難呈祥' },
      { id: 'm4', term: '月德貴人', definition: '心地善良、自有天助' },
      { id: 'm5', term: '太極貴人', definition: '玄學天賦、悟性高' },
    ]
  },
  '凶煞總覽': {
    id: 'xiongsha',
    title: '凶煞總覽',
    introduction: '凶煞帶來挑戰和考驗，但也可能轉化為成長動力。',
    keyPoints: [
      '羊刃：性格剛烈、易有血光',
      '七殺：壓力挑戰、競爭對手',
      '孤辰寡宿：性格獨立、緣分較薄',
      '劫煞：意外損失、需防小人',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「羊刃」主要代表什麼特質？',
        options: ['溫和體貼', '性格剛烈', '聰明伶俐', '財運亨通'],
        correctIndex: 1,
        explanation: '羊刃代表性格剛強、做事果斷，但也需注意血光之災。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「孤辰寡宿」會帶來什麼影響？',
        options: ['財運亨通', '桃花旺盛', '性格獨立、親緣較薄', '事業有成'],
        correctIndex: 2,
        explanation: '孤辰寡宿代表個性獨立，但與親人緣分較薄。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '凶煞在八字中一定是壞事嗎？',
        options: ['是的，必須化解', '不一定，可能轉化為動力', '完全沒有影響', '只影響健康'],
        correctIndex: 1,
        explanation: '凶煞可能帶來挑戰，但也可能激發潛能，成為成長動力。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '羊刃', definition: '性格剛烈、易有血光' },
      { id: 'm2', term: '孤辰', definition: '男命獨立、親緣薄' },
      { id: 'm3', term: '寡宿', definition: '女命獨立、親緣薄' },
      { id: 'm4', term: '劫煞', definition: '意外損失、防小人' },
    ]
  },
  '神煞搭配': {
    id: 'shensha-dapei',
    title: '神煞搭配',
    introduction: '神煞之間會產生互動，搭配不同會改變其吉凶性質。',
    keyPoints: [
      '貴人解煞：凶煞遇貴人可化解',
      '煞聚成災：多煞聚集危害加重',
      '吉神互助：多吉神疊加效果更佳',
      '神煞需看整體命局判斷',
    ],
    quiz: [
      {
        id: 'q1',
        question: '凶煞遇到貴人星會怎樣？',
        options: ['危害加重', '可以化解', '完全無效', '效果翻倍'],
        correctIndex: 1,
        explanation: '貴人可以解煞，凶煞遇貴人其凶性會大大減輕。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「羊刃」遇「七殺」是吉是凶？',
        options: ['大凶', '互相制衡可能反吉', '完全無影響', '只看流年'],
        correctIndex: 1,
        explanation: '羊刃駕殺，羊刃與七殺互相制衡，反而可能成就格局。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '貴人解煞', definition: '凶煞遇貴人可化解' },
      { id: 'm2', term: '羊刃駕殺', definition: '羊刃七殺互相制衡' },
      { id: 'm3', term: '吉神疊加', definition: '多吉神效果更佳' },
      { id: 'm4', term: '煞聚成災', definition: '多煞聚集危害加重' },
    ]
  },
  '神煞應用': {
    id: 'shensha-yingyong',
    title: '神煞應用',
    introduction: '神煞在實際論命中需要結合整體八字來判斷其影響力。',
    keyPoints: [
      '神煞需配合十神分析',
      '神煞在不同柱位影響不同',
      '神煞受沖合會改變性質',
      '現代論命神煞僅作參考',
    ],
    quiz: [
      {
        id: 'q1',
        question: '現代八字論命對神煞的態度是？',
        options: ['完全依賴', '完全忽略', '作為參考', '只看凶煞'],
        correctIndex: 2,
        explanation: '現代論命以十神格局為主，神煞作為輔助參考，不宜過度依賴。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '神煞在年柱和時柱有什麼區別？',
        options: ['沒有區別', '年柱影響早年，時柱影響晚年', '只看年柱', '只看時柱'],
        correctIndex: 1,
        explanation: '神煞在不同柱位影響不同的人生階段。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '年柱神煞', definition: '影響童年和祖運' },
      { id: 'm2', term: '月柱神煞', definition: '影響青年和父母' },
      { id: 'm3', term: '日柱神煞', definition: '影響中年和婚姻' },
      { id: 'm4', term: '時柱神煞', definition: '影響晚年和子女' },
    ]
  }
};

// ==================== 納音課程 ====================
export const NAYIN_LESSONS: Record<string, LessonContent> = {
  '納音概念': {
    id: 'nayin-concept',
    title: '納音概念',
    introduction: '納音是古代音律與五行結合的學問，六十甲子各有其納音五行。',
    keyPoints: [
      '納音源於古代音律，與五音對應',
      '六十甲子分為三十組納音',
      '每組納音由兩個干支組成',
      '納音反映較深層的命理信息',
    ],
    quiz: [
      {
        id: 'q1',
        question: '六十甲子共有多少組納音？',
        options: ['10組', '12組', '30組', '60組'],
        correctIndex: 2,
        explanation: '六十甲子每兩個干支共用一個納音，共30組納音。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '納音的起源是什麼？',
        options: ['天文學', '古代音律', '易經', '佛教'],
        correctIndex: 1,
        explanation: '納音源於古代音律學，與宮商角徵羽五音相關。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '納音', definition: '音律與五行結合' },
      { id: 'm2', term: '三十組', definition: '六十甲子的納音數' },
      { id: 'm3', term: '年命', definition: '年柱的納音五行' },
      { id: 'm4', term: '五音', definition: '宮商角徵羽' },
    ]
  },
  '六十甲子': {
    id: 'sixty-jiazi',
    title: '六十甲子',
    introduction: '六十甲子是天干地支的完整循環，每60年為一個週期。',
    keyPoints: [
      '天干10個 × 地支12個 = 最小公倍數60',
      '六十甲子從「甲子」開始，到「癸亥」結束',
      '古人以六十甲子紀年、紀月、紀日、紀時',
      '六十甲子可用於推算大運和流年',
    ],
    quiz: [
      {
        id: 'q1',
        question: '六十甲子的第一個干支是？',
        options: ['甲寅', '甲子', '子甲', '甲辰'],
        correctIndex: 1,
        explanation: '六十甲子從甲子開始，子為地支之首，甲為天干之首。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '六十甲子的最後一個干支是？',
        options: ['癸亥', '癸酉', '辛亥', '壬戌'],
        correctIndex: 0,
        explanation: '六十甲子從甲子到癸亥，共60組循環。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '為什麼是60而不是120？',
        options: ['古人規定', '陽干配陽支、陰干配陰支', '方便計算', '與天文有關'],
        correctIndex: 1,
        explanation: '陽干只配陽支、陰干只配陰支，所以是10和12的最小公倍數除以2等於30再乘2等於60。',
        difficulty: 'advanced'
      },
    ],
    matchGame: [
      { id: 'm1', term: '甲子', definition: '六十甲子之首' },
      { id: 'm2', term: '癸亥', definition: '六十甲子之尾' },
      { id: 'm3', term: '60年', definition: '甲子循環週期' },
      { id: 'm4', term: '陽配陽', definition: '干支配對原則' },
    ]
  },
  '納音五行': {
    id: 'nayin-wuxing',
    title: '納音五行',
    introduction: '納音五行有30種，如海中金、爐中火、大林木等，各有獨特意象。',
    keyPoints: [
      '金類：海中金、劍鋒金、白蠟金、砂中金、金箔金、釵釧金',
      '木類：大林木、楊柳木、松柏木、平地木、桑拓木、石榴木',
      '水類：澗下水、泉中水、長流水、天河水、大溪水、大海水',
      '火類：爐中火、山頭火、霹靂火、山下火、覆燈火、天上火',
      '土類：路旁土、城頭土、屋上土、壁上土、大驛土、沙中土',
    ],
    quiz: [
      {
        id: 'q1',
        question: '「海中金」屬於哪種五行？',
        options: ['水', '金', '木', '土'],
        correctIndex: 1,
        explanation: '海中金是納音五行中的金類，代表深藏不露的金屬能量。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '「大林木」象徵什麼？',
        options: ['小花小草', '參天大樹', '枯木', '浮萍'],
        correctIndex: 1,
        explanation: '大林木象徵茂盛的森林，代表成長茁壯的能量。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '納音五行與正五行有何不同？',
        options: ['完全相同', '納音更細緻，有30種', '正五行更細緻', '互相矛盾'],
        correctIndex: 1,
        explanation: '納音五行將每種五行細分為六種，共30種，比正五行更細緻。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '海中金', definition: '深藏不露、潛力巨大' },
      { id: 'm2', term: '劍鋒金', definition: '鋒利銳氣、果斷決絕' },
      { id: 'm3', term: '大林木', definition: '茂盛成長、生機勃勃' },
      { id: 'm4', term: '天河水', definition: '高遠清澈、智慧超群' },
      { id: 'm5', term: '霹靂火', definition: '威力驚人、能量爆發' },
    ]
  },
  '納音應用': {
    id: 'nayin-apply',
    title: '納音應用',
    introduction: '納音在傳統命理中用於推算合婚、擇日等，現代多作參考。',
    keyPoints: [
      '年柱納音代表此人的根本屬性',
      '納音相生者較為和諧',
      '納音相剋者需注意關係',
      '納音也用於風水擇日',
    ],
    quiz: [
      {
        id: 'q1',
        question: '傳統上看一個人的納音五行，主要看哪一柱？',
        options: ['年柱', '月柱', '日柱', '時柱'],
        correctIndex: 0,
        explanation: '傳統上以年柱納音代表此人的根本屬性，稱為「年命」。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '納音合婚中，什麼關係最佳？',
        options: ['相剋', '相生', '相同', '相沖'],
        correctIndex: 1,
        explanation: '納音相生者彼此滋養，關係較為和諧。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '年命', definition: '年柱納音五行' },
      { id: 'm2', term: '納音相生', definition: '關係和諧' },
      { id: 'm3', term: '納音相剋', definition: '需注意磨合' },
      { id: 'm4', term: '納音擇日', definition: '選擇吉日用納音' },
    ]
  }
};

// ==================== 性格課程 ====================
export const PERSONALITY_LESSONS: Record<string, LessonContent> = {
  '性格解讀': {
    id: 'personality-read',
    title: '性格解讀',
    introduction: '從八字可以解讀一個人天生的性格特質和行為模式。',
    keyPoints: [
      '日干代表核心性格',
      '十神分佈影響處事風格',
      '五行旺衰決定性格傾向',
      '神煞增添性格特色',
    ],
    quiz: [
      {
        id: 'q1',
        question: '解讀性格時，最重要的參考是？',
        options: ['年柱', '月柱', '日干', '時柱'],
        correctIndex: 2,
        explanation: '日干代表命主本人，是解讀性格的核心依據。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '甲木日主的典型性格是？',
        options: ['柔順配合', '正直剛強', '靈活多變', '謹慎保守'],
        correctIndex: 1,
        explanation: '甲木如參天大樹，性格正直、有主見、不輕易妥協。',
        difficulty: 'intermediate'
      },
      {
        id: 'q3',
        question: '丁火日主與丙火日主的性格差異？',
        options: ['完全相同', '丁較內斂溫和、丙較外放熱情', '丁較強勢', '丙較內斂'],
        correctIndex: 1,
        explanation: '丙火如太陽外放熱情，丁火如燭光內斂溫和。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '甲木', definition: '正直剛強、有主見' },
      { id: 'm2', term: '丙火', definition: '熱情外放、有領導力' },
      { id: 'm3', term: '戊土', definition: '穩重踏實、包容力強' },
      { id: 'm4', term: '庚金', definition: '果斷決絕、重義氣' },
      { id: 'm5', term: '壬水', definition: '聰明靈活、適應力強' },
    ]
  },
  '優勢潛能': {
    id: 'advantage',
    title: '優勢潛能',
    introduction: '每個八字都有其獨特的優勢領域，了解可以更好發揮。',
    keyPoints: [
      '比劫旺者：領導力強、善於合作',
      '印星旺者：學習力強、有貴人緣',
      '食傷旺者：創意豐富、表達力佳',
      '財官旺者：務實穩重、事業心強',
    ],
    quiz: [
      {
        id: 'q1',
        question: '食傷星旺的人通常有什麼優勢？',
        options: ['領導能力', '創意表達', '財務管理', '人際關係'],
        correctIndex: 1,
        explanation: '食傷代表才華與創意，食傷旺者創意豐富、表達能力佳。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '印星旺的人適合什麼發展方向？',
        options: ['業務銷售', '學術研究', '體力勞動', '冒險投資'],
        correctIndex: 1,
        explanation: '印星代表學習和思考，適合學術、教育、研究等領域。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '比劫旺', definition: '領導力、合作力' },
      { id: 'm2', term: '印星旺', definition: '學習力、貴人運' },
      { id: 'm3', term: '食傷旺', definition: '創意力、表達力' },
      { id: 'm4', term: '財官旺', definition: '執行力、事業心' },
    ]
  },
  '成長課題': {
    id: 'growth',
    title: '成長課題',
    introduction: '八字中的缺失或過旺之處，往往是需要修煉的人生課題。',
    keyPoints: [
      '五行有缺者需要後天補足',
      '十神偏枯代表某方面需加強',
      '凶煞可轉化為成長動力',
      '了解課題才能突破瓶頸',
    ],
    quiz: [
      {
        id: 'q1',
        question: '八字缺財星的人需要注意什麼？',
        options: ['加強理財觀念', '多讀書', '加強運動', '多交朋友'],
        correctIndex: 0,
        explanation: '缺財星者可能對金錢較無概念，需要培養理財意識。',
        difficulty: 'intermediate'
      },
      {
        id: 'q2',
        question: '印星過旺可能有什麼問題？',
        options: ['過於激進', '依賴心重、缺乏獨立', '過於物質', '過於冷漠'],
        correctIndex: 1,
        explanation: '印星過旺可能過度依賴他人，需要培養獨立自主能力。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '缺財', definition: '培養理財意識' },
      { id: 'm2', term: '缺印', definition: '加強學習求知' },
      { id: 'm3', term: '缺官', definition: '培養自律守規' },
      { id: 'm4', term: '缺比劫', definition: '學習與人合作' },
    ]
  },
  '綜合分析': {
    id: 'comprehensive',
    title: '綜合分析',
    introduction: '性格分析需要綜合各方面因素，才能得出準確結論。',
    keyPoints: [
      '日干為體，其他為用',
      '強弱虛實影響表現方式',
      '大運流年會調整性格表現',
      '後天環境也會影響性格發展',
    ],
    quiz: [
      {
        id: 'q1',
        question: '性格分析時，「體用」指的是？',
        options: ['身體和用途', '日干為體、其他為用', '先天和後天', '理論和實踐'],
        correctIndex: 1,
        explanation: '日干代表本體（體），其他十神代表外在表現（用）。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '體', definition: '日干本體' },
      { id: 'm2', term: '用', definition: '其他十神表現' },
      { id: 'm3', term: '強', definition: '性格特質明顯' },
      { id: 'm4', term: '弱', definition: '性格特質需補強' },
    ]
  }
};

// ==================== 運勢課程 ====================
export const FORTUNE_LESSONS: Record<string, LessonContent> = {
  '大運概念': {
    id: 'dayun-concept',
    title: '大運概念',
    introduction: '大運是八字命理中推算人生不同階段運勢的方法，每運管十年。',
    keyPoints: [
      '大運由月柱推算而來',
      '男命陽年生人順排，陰年生人逆排',
      '女命陰年生人順排，陽年生人逆排',
      '每運管十年，前五年看天干，後五年看地支',
    ],
    quiz: [
      {
        id: 'q1',
        question: '大運是從哪一柱推算的？',
        options: ['年柱', '月柱', '日柱', '時柱'],
        correctIndex: 1,
        explanation: '大運由月柱依順序推算而來。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '每一步大運管多少年？',
        options: ['5年', '10年', '12年', '20年'],
        correctIndex: 1,
        explanation: '每一步大運管十年，前五年看天干，後五年看地支。',
        difficulty: 'basic'
      },
      {
        id: 'q3',
        question: '男命甲年生人大運如何排？',
        options: ['順排', '逆排', '不排大運', '隨機'],
        correctIndex: 0,
        explanation: '男命陽年（甲丙戊庚壬年）生人順排大運。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '大運', definition: '十年運勢週期' },
      { id: 'm2', term: '順排', definition: '依干支順序往後' },
      { id: 'm3', term: '逆排', definition: '依干支順序往前' },
      { id: 'm4', term: '起運歲數', definition: '開始行大運年齡' },
    ]
  },
  '流年判讀': {
    id: 'liunian',
    title: '流年判讀',
    introduction: '流年是指每一年的干支，反映當年的運勢起伏。',
    keyPoints: [
      '流年干支每年不同',
      '流年與命局產生生剋沖合',
      '流年與大運共同作用於命局',
      '流年吉凶要看與喜用神的關係',
    ],
    quiz: [
      {
        id: 'q1',
        question: '2024年是什麼干支年？',
        options: ['癸卯', '甲辰', '乙巳', '丙午'],
        correctIndex: 1,
        explanation: '2024年是甲辰年，龍年。',
        difficulty: 'basic'
      },
      {
        id: 'q2',
        question: '流年沖日支代表什麼？',
        options: ['財運亨通', '可能有變動或挑戰', '學業進步', '沒有影響'],
        correctIndex: 1,
        explanation: '流年沖日支可能帶來變動，如搬家、換工作、感情變化等。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '流年', definition: '當年干支運勢' },
      { id: 'm2', term: '流年沖', definition: '可能有變動' },
      { id: 'm3', term: '流年合', definition: '可能有機遇' },
      { id: 'm4', term: '犯太歲', definition: '流年沖或合命局' },
    ]
  },
  '運勢週期': {
    id: 'cycle',
    title: '運勢週期',
    introduction: '人生運勢有週期性起伏，了解週期可以更好把握時機。',
    keyPoints: [
      '大運十年一變',
      '流年每年不同',
      '流月、流日影響短期',
      '好運時把握機會，壞運時積蓄能量',
    ],
    quiz: [
      {
        id: 'q1',
        question: '運勢不好時應該怎麼做？',
        options: ['冒險一搏', '積蓄能量、韜光養晦', '什麼都不做', '抱怨命運'],
        correctIndex: 1,
        explanation: '運勢低迷時宜韜光養晦，積蓄能量等待好運到來。',
        difficulty: 'basic'
      },
    ],
    matchGame: [
      { id: 'm1', term: '大運', definition: '十年週期' },
      { id: 'm2', term: '流年', definition: '一年週期' },
      { id: 'm3', term: '流月', definition: '一月週期' },
      { id: 'm4', term: '流日', definition: '一日週期' },
    ]
  },
  '趨吉避凶': {
    id: 'guidance',
    title: '趨吉避凶',
    introduction: '了解運勢後，可以採取措施趨吉避凶，改善人生。',
    keyPoints: [
      '補足八字五行缺失',
      '選擇有利的方位和行業',
      '把握好運時機積極行動',
      '運勢低迷時保守為主',
    ],
    quiz: [
      {
        id: 'q1',
        question: '八字缺水的人可以如何補足？',
        options: ['多穿紅色', '從事水相關行業', '多去南方', '多吃辣'],
        correctIndex: 1,
        explanation: '缺水可從事水相關行業（如航運、水利），或往北方發展。',
        difficulty: 'intermediate'
      },
    ],
    matchGame: [
      { id: 'm1', term: '補五行', definition: '從事相關行業或方位' },
      { id: 'm2', term: '趨吉', definition: '把握好運積極行動' },
      { id: 'm3', term: '避凶', definition: '壞運時保守謹慎' },
      { id: 'm4', term: '喜用神', definition: '命局所需五行' },
    ]
  }
};

// 整合所有課程
export const LESSON_CONTENT: Record<string, Record<string, LessonContent>> = {
  bazi: BAZI_LESSONS,
  legion: LEGION_LESSONS,
  wuxing: WUXING_LESSONS,
  tenGods: TENGODS_LESSONS,
  shensha: SHENSHA_LESSONS,
  nayin: NAYIN_LESSONS,
  personality: PERSONALITY_LESSONS,
  fortune: FORTUNE_LESSONS,
};

// 取得所有課程的題目總數
export const getTotalQuestions = (): number => {
  let total = 0;
  Object.values(LESSON_CONTENT).forEach(zone => {
    Object.values(zone).forEach(lesson => {
      total += lesson.quiz.length;
    });
  });
  return total;
};

// 取得指定難度的題目
export const getQuestionsByDifficulty = (difficulty: 'basic' | 'intermediate' | 'advanced'): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  Object.values(LESSON_CONTENT).forEach(zone => {
    Object.values(zone).forEach(lesson => {
      lesson.quiz.forEach(q => {
        if (q.difficulty === difficulty) {
          questions.push(q);
        }
      });
    });
  });
  return questions;
};
