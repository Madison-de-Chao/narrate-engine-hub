import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Trophy, 
  Lightbulb,
  RefreshCw,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Flame,
  Star,
  Zap,
  Target,
  Brain,
  Shuffle,
  Timer
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface MatchPair {
  id: string;
  term: string;
  definition: string;
}

interface FillBlank {
  id: string;
  sentence: string;
  blanks: string[];
  options: string[];
}

interface LessonContent {
  id: string;
  title: string;
  introduction: string;
  keyPoints: string[];
  quiz: QuizQuestion[];
  matchGame?: MatchPair[];
  fillBlanks?: FillBlank[];
}

interface InteractiveLearningProps {
  zoneId: string;
  lessonId: string;
  lessonTitle: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

// 成就類型
type Achievement = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_correct', title: '初試啼聲', icon: <Star className="w-6 h-6" />, color: 'from-yellow-400 to-amber-500' },
  { id: 'streak_3', title: '三連勝', icon: <Flame className="w-6 h-6" />, color: 'from-orange-400 to-red-500' },
  { id: 'streak_5', title: '五連霸', icon: <Zap className="w-6 h-6" />, color: 'from-purple-400 to-pink-500' },
  { id: 'perfect', title: '完美無缺', icon: <Trophy className="w-6 h-6" />, color: 'from-green-400 to-emerald-500' },
  { id: 'speed_demon', title: '閃電快手', icon: <Timer className="w-6 h-6" />, color: 'from-blue-400 to-cyan-500' },
];

// 課程內容（整合原有內容並新增互動遊戲）
const LESSON_CONTENT: Record<string, Record<string, LessonContent>> = {
  bazi: {
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
          explanation: '四柱指的是年柱、月柱、日柱、時柱，分別代表人生不同階段。'
        },
        {
          id: 'q2',
          question: '天干共有幾個？',
          options: ['8個', '10個', '12個', '60個'],
          correctIndex: 1,
          explanation: '天干共有十個：甲、乙、丙、丁、戊、己、庚、辛、壬、癸。'
        },
        {
          id: 'q3',
          question: '日柱主要代表什麼？',
          options: ['祖先與童年', '父母與青年', '自己與配偶', '子女與晚年'],
          correctIndex: 2,
          explanation: '日柱代表命主本人，日干為「日元」，是八字分析的核心。日支則與配偶相關。'
        }
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
          explanation: '丙為陽火，象徵太陽，光明磊落、熱情奔放。'
        },
        {
          id: 'q2',
          question: '下列哪個天干屬於陰金？',
          options: ['庚', '辛', '戊', '己'],
          correctIndex: 1,
          explanation: '辛為陰金，象徵珠玉、首飾，細膩精緻。庚為陽金。'
        }
      ],
      matchGame: [
        { id: 'm1', term: '甲木', definition: '大樹（陽木）' },
        { id: 'm2', term: '丙火', definition: '太陽（陽火）' },
        { id: 'm3', term: '戊土', definition: '高山（陽土）' },
        { id: 'm4', term: '庚金', definition: '刀劍（陽金）' },
        { id: 'm5', term: '壬水', definition: '江河（陽水）' },
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
          explanation: '寅午戌三合火局，寅木生午火，戌土藏火庫。'
        },
        {
          id: 'q2',
          question: '下列哪組地支相沖？',
          options: ['子丑', '寅亥', '卯酉', '巳申'],
          correctIndex: 2,
          explanation: '卯酉相沖，為東西方位對沖。其他選項都是相合關係。'
        }
      ],
      matchGame: [
        { id: 'm1', term: '申子辰', definition: '三合水局' },
        { id: 'm2', term: '寅午戌', definition: '三合火局' },
        { id: 'm3', term: '巳酉丑', definition: '三合金局' },
        { id: 'm4', term: '亥卯未', definition: '三合木局' },
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
          explanation: '八字以立春為年柱交替點，而非農曆新年。'
        }
      ]
    }
  },
  legion: {
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
          explanation: '年柱代表童年時期（1-16歲），反映祖先能量和早年環境。'
        }
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
          explanation: '月柱又稱「提綱」，是確定八字格局的關鍵。'
        }
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
          explanation: '日支為配偶宮，與婚姻感情密切相關。'
        }
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
          explanation: '時柱代表子女宮，也反映晚年運勢。'
        }
      ]
    }
  },
  wuxing: {
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
          explanation: '水主智，特性為潤下、靈活、智慧。'
        }
      ],
      matchGame: [
        { id: 'm1', term: '木', definition: '生長、仁愛' },
        { id: 'm2', term: '火', definition: '熱情、禮儀' },
        { id: 'm3', term: '土', definition: '穩重、信義' },
        { id: 'm4', term: '金', definition: '決斷、義氣' },
        { id: 'm5', term: '水', definition: '智慧、靈活' },
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
          explanation: '土生金，土中蘊藏金屬礦脈。'
        }
      ],
      matchGame: [
        { id: 'm1', term: '木生火', definition: '木燃燒產生火焰' },
        { id: 'm2', term: '火生土', definition: '燃燒後成為灰燼' },
        { id: 'm3', term: '土生金', definition: '土中蘊含礦藏' },
        { id: 'm4', term: '金生水', definition: '金屬凝結水珠' },
        { id: 'm5', term: '水生木', definition: '水滋潤樹木生長' },
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
          explanation: '水剋火，水能滅火，這是自然界的基本法則。'
        }
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
          explanation: '五行偏旺需要洩氣（生其他五行）或剋制，以達到平衡。'
        }
      ]
    }
  },
  tenGods: {
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
          explanation: '正印是異性生我者，如陽日主見陰印星，代表母親和貴人。'
        }
      ],
      matchGame: [
        { id: 'm1', term: '比肩', definition: '同性同五行，兄弟朋友' },
        { id: 'm2', term: '劫財', definition: '異性同五行，競爭夥伴' },
        { id: 'm3', term: '正印', definition: '異性生我，母親貴人' },
        { id: 'm4', term: '偏印', definition: '同性生我，偏門學問' },
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
          explanation: '偏財在男命中代表父親，也代表意外之財和情人。'
        }
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
          explanation: '正官是異性剋我，七殺是同性剋我，陰陽配置不同導致作用差異。'
        }
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
          explanation: '十神皆以日干為中心推算，日干是判斷其他天干地支十神的基準。'
        }
      ]
    }
  },
  shensha: {
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
          explanation: '天乙貴人是最重要的吉神，主逢凶化吉、遇難呈祥。'
        }
      ],
      matchGame: [
        { id: 'm1', term: '天乙貴人', definition: '逢凶化吉、貴人相助' },
        { id: 'm2', term: '文昌星', definition: '聰明智慧、考試順利' },
        { id: 'm3', term: '天德貴人', definition: '行善積德、逢難呈祥' },
        { id: 'm4', term: '月德貴人', definition: '心地善良、自有天助' },
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
          explanation: '羊刃代表性格剛強、做事果斷，但也需注意血光之災。'
        }
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
          explanation: '貴人可以解煞，凶煞遇貴人其凶性會大大減輕。'
        }
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
          explanation: '現代論命以十神格局為主，神煞作為輔助參考，不宜過度依賴。'
        }
      ]
    }
  },
  nayin: {
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
          explanation: '六十甲子每兩個干支共用一個納音，共30組納音。'
        }
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
          explanation: '六十甲子從甲子開始，子為地支之首，甲為天干之首。'
        }
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
          explanation: '海中金是納音五行中的金類，代表深藏不露的金屬能量。'
        }
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
          explanation: '傳統上以年柱納音代表此人的根本屬性，稱為「年命」。'
        }
      ]
    }
  },
  personality: {
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
          explanation: '日干代表命主本人，是解讀性格的核心依據。'
        }
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
          explanation: '食傷代表才華與創意，食傷旺者創意豐富、表達能力佳。'
        }
      ],
      matchGame: [
        { id: 'm1', term: '比劫旺', definition: '領導力強、善於合作' },
        { id: 'm2', term: '印星旺', definition: '學習力強、有貴人緣' },
        { id: 'm3', term: '食傷旺', definition: '創意豐富、表達力佳' },
        { id: 'm4', term: '財官旺', definition: '務實穩重、事業心強' },
      ]
    },
    '成長課題': {
      id: 'growth',
      title: '成長課題',
      introduction: '八字中的弱點和挑戰正是今生需要學習和成長的課題。',
      keyPoints: [
        '五行缺失需要後天補足',
        '十神偏枯需要平衡調整',
        '凶煞帶來的課題需要面對',
        '挑戰也是成長的機會',
      ],
      quiz: [
        {
          id: 'q1',
          question: '面對八字中的弱點，正確態度是？',
          options: ['完全放棄', '視為課題成長', '怨天尤人', '尋求改命'],
          correctIndex: 1,
          explanation: '八字的弱點是今生的成長課題，需要積極面對和學習。'
        }
      ]
    },
    '綜合分析': {
      id: 'comprehensive',
      title: '綜合分析',
      introduction: '性格分析需要綜合八字所有因素，不可偏執一端。',
      keyPoints: [
        '日干為體，其他為用',
        '強弱虛實需整體判斷',
        '大運流年會調整性格表現',
        '環境和教育也會影響性格',
      ],
      quiz: [
        {
          id: 'q1',
          question: '除了八字，還有什麼會影響性格？',
          options: ['只看八字即可', '環境和教育', '完全不可知', '只看生肖'],
          correctIndex: 1,
          explanation: '性格受先天八字和後天環境教育共同影響。'
        }
      ]
    }
  },
  fortune: {
    '大運概念': {
      id: 'dayun',
      title: '大運概念',
      introduction: '大運是人生運勢的主要週期，每十年一個大運。',
      keyPoints: [
        '大運從月柱推算而來',
        '男陽女陰順排，男陰女陽逆排',
        '每個大運影響十年運勢',
        '大運干支分管前五年和後五年',
      ],
      quiz: [
        {
          id: 'q1',
          question: '一個大運影響多少年？',
          options: ['1年', '5年', '10年', '12年'],
          correctIndex: 2,
          explanation: '每個大運為期十年，天干管前五年，地支管後五年。'
        }
      ]
    },
    '流年判讀': {
      id: 'liunian',
      title: '流年判讀',
      introduction: '流年是每年的運勢，與大運配合分析當年吉凶。',
      keyPoints: [
        '流年以當年的天干地支為準',
        '流年與大運相配合判斷',
        '流年與八字產生互動',
        '關注流年的沖合會刑',
      ],
      quiz: [
        {
          id: 'q1',
          question: '判斷某年運勢需要看什麼？',
          options: ['只看八字', '只看流年', '流年配合大運和八字', '只看生肖'],
          correctIndex: 2,
          explanation: '流年運勢需要結合大運和原局八字綜合判斷。'
        }
      ]
    },
    '運勢週期': {
      id: 'cycle',
      title: '運勢週期',
      introduction: '人生運勢有其規律週期，了解週期可以更好把握時機。',
      keyPoints: [
        '十年一大運，運勢起伏',
        '流年每年變化',
        '流月、流日也有影響',
        '注意關鍵的轉運時刻',
      ],
      quiz: [
        {
          id: 'q1',
          question: '運勢週期中最重要的轉變點是？',
          options: ['每天', '每月', '每年', '交大運時'],
          correctIndex: 3,
          explanation: '交大運是最重要的轉變點，代表十年運勢的改變。'
        }
      ]
    },
    '趨吉避凶': {
      id: 'qiuji',
      title: '趨吉避凶',
      introduction: '了解運勢後，可以採取行動趨吉避凶，把握機會。',
      keyPoints: [
        '運旺時積極進取',
        '運弱時保守守成',
        '利用吉星時機行事',
        '凶年多行善積德',
      ],
      quiz: [
        {
          id: 'q1',
          question: '運勢較弱的年份應該如何應對？',
          options: ['加倍投資', '保守守成', '聽天由命', '完全不動'],
          correctIndex: 1,
          explanation: '運勢較弱時宜保守守成，不宜冒進，待運轉再行大事。'
        }
      ]
    }
  }
};

// 默認課程內容
const getDefaultContent = (zoneId: string, lessonId: string): LessonContent => ({
  id: `${zoneId}-${lessonId}`,
  title: lessonId,
  introduction: `歡迎學習「${lessonId}」課程。`,
  keyPoints: ['課程內容正在準備中', '請先完成其他課程', '更多內容即將推出'],
  quiz: [
    {
      id: 'default',
      question: '您準備好開始學習了嗎？',
      options: ['是的，我準備好了', '我再想想', '先看看其他課程', '需要更多時間'],
      correctIndex: 0,
      explanation: '太好了！讓我們開始學習吧。'
    }
  ]
});

// 配對遊戲組件
const MatchGame: React.FC<{
  pairs: MatchPair[];
  onComplete: (allCorrect: boolean) => void;
  theme: string;
}> = ({ pairs, onComplete, theme }) => {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<MatchPair[]>([]);

  useEffect(() => {
    setShuffledDefinitions([...pairs].sort(() => Math.random() - 0.5));
  }, [pairs]);

  const handleTermClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    setSelectedTerm(id);
    setWrongPair(null);
  };

  const handleDefinitionClick = (pair: MatchPair) => {
    if (!selectedTerm || matchedPairs.includes(pair.id)) return;
    
    if (selectedTerm === pair.id) {
      const newMatched = [...matchedPairs, pair.id];
      setMatchedPairs(newMatched);
      setSelectedTerm(null);
      
      if (newMatched.length === pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    } else {
      setWrongPair(pair.id);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTerm(null);
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Shuffle className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-amber-600'}`} />
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>
          配對遊戲
        </h3>
      </div>
      
      <p className={`text-center text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
        點擊左邊的詞彙，再點擊右邊對應的解釋
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* 詞彙列 */}
        <div className="space-y-2">
          {pairs.map((pair) => {
            const isMatched = matchedPairs.includes(pair.id);
            const isSelected = selectedTerm === pair.id;
            
            return (
              <motion.button
                key={pair.id}
                onClick={() => handleTermClick(pair.id)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl text-center font-medium transition-all ${
                  isMatched
                    ? 'bg-green-500/20 text-green-500 border-2 border-green-500'
                    : isSelected
                      ? theme === 'dark'
                        ? 'bg-primary/30 border-2 border-primary text-primary'
                        : 'bg-amber-100 border-2 border-amber-500 text-amber-700'
                      : theme === 'dark'
                        ? 'bg-card border-2 border-border hover:border-primary/50 text-foreground'
                        : 'bg-white border-2 border-gray-200 hover:border-amber-300 text-gray-800'
                }`}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                animate={isMatched ? { scale: [1, 1.1, 1] } : {}}
              >
                {pair.term}
                {isMatched && <CheckCircle className="inline-block ml-2 w-4 h-4" />}
              </motion.button>
            );
          })}
        </div>

        {/* 解釋列 */}
        <div className="space-y-2">
          {shuffledDefinitions.map((pair) => {
            const isMatched = matchedPairs.includes(pair.id);
            const isWrong = wrongPair === pair.id;
            
            return (
              <motion.button
                key={pair.id}
                onClick={() => handleDefinitionClick(pair)}
                disabled={isMatched || !selectedTerm}
                className={`w-full p-3 rounded-xl text-center text-sm transition-all ${
                  isMatched
                    ? 'bg-green-500/20 text-green-500 border-2 border-green-500'
                    : isWrong
                      ? 'bg-red-500/20 text-red-500 border-2 border-red-500'
                      : theme === 'dark'
                        ? 'bg-card border-2 border-border hover:border-primary/50 text-foreground'
                        : 'bg-white border-2 border-gray-200 hover:border-amber-300 text-gray-800'
                } ${!selectedTerm && !isMatched ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={!isMatched && selectedTerm ? { scale: 1.02 } : {}}
                whileTap={!isMatched && selectedTerm ? { scale: 0.98 } : {}}
                animate={
                  isWrong 
                    ? { x: [0, -10, 10, -10, 10, 0] } 
                    : isMatched 
                      ? { scale: [1, 1.1, 1] } 
                      : {}
                }
              >
                {pair.definition}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Badge variant="outline" className="text-sm">
          已配對 {matchedPairs.length} / {pairs.length}
        </Badge>
      </div>
    </div>
  );
};

// 成就彈窗組件
const AchievementPopup: React.FC<{
  achievement: Achievement;
  onClose: () => void;
}> = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
    >
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r ${achievement.color} text-white`}>
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          {achievement.icon}
        </motion.div>
        <div>
          <div className="text-xs opacity-80">🎉 成就解鎖!</div>
          <div className="font-bold">{achievement.title}</div>
        </div>
      </div>
    </motion.div>
  );
};

// 連續答對火焰效果
const StreakFire: React.FC<{ streak: number }> = ({ streak }) => {
  if (streak < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        <Flame className={`w-5 h-5 ${
          streak >= 5 ? 'text-purple-500' : streak >= 3 ? 'text-orange-500' : 'text-yellow-500'
        }`} />
      </motion.div>
      <span className={`font-bold ${
        streak >= 5 ? 'text-purple-500' : streak >= 3 ? 'text-orange-500' : 'text-yellow-500'
      }`}>
        {streak}連勝!
      </span>
    </motion.div>
  );
};

export const InteractiveLearning: React.FC<InteractiveLearningProps> = ({
  zoneId,
  lessonId,
  onComplete,
  onBack
}) => {
  const { theme } = useTheme();
  const [stage, setStage] = useState<'intro' | 'keypoints' | 'matchgame' | 'quiz' | 'result'>('intro');
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [startTime] = useState(Date.now());
  const [matchGameCompleted, setMatchGameCompleted] = useState(false);

  const content = LESSON_CONTENT[zoneId]?.[lessonId] || getDefaultContent(zoneId, lessonId);
  const totalQuestions = content.quiz.length;
  const currentQuestion = content.quiz[currentQuestionIndex];
  const hasMatchGame = content.matchGame && content.matchGame.length > 0;

  // 解鎖成就
  const unlockAchievement = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement && !unlockedAchievements.find(a => a.id === achievementId)) {
      setUnlockedAchievements(prev => [...prev, achievement]);
      setShowAchievement(achievement);
    }
  };

  const handleNextPoint = () => {
    if (currentPointIndex < content.keyPoints.length - 1) {
      setCurrentPointIndex(prev => prev + 1);
    } else if (hasMatchGame && !matchGameCompleted) {
      setStage('matchgame');
    } else {
      setStage('quiz');
    }
  };

  const handleMatchGameComplete = () => {
    setMatchGameCompleted(true);
    unlockAchievement('first_correct');
    setStage('quiz');
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // 檢查成就
      if (correctAnswers === 0) unlockAchievement('first_correct');
      if (newStreak === 3) unlockAchievement('streak_3');
      if (newStreak === 5) unlockAchievement('streak_5');
    } else {
      setStreak(0);
    }
    setAnswers(prev => [...prev, isCorrect]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // 檢查完美成就
      if (correctAnswers === totalQuestions) {
        unlockAchievement('perfect');
      }
      // 檢查速度成就（30秒內完成）
      if (Date.now() - startTime < 30000) {
        unlockAchievement('speed_demon');
      }
      setStage('result');
    }
  };

  const handleComplete = () => {
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    onComplete(score);
  };

  const handleRetry = () => {
    setStage('intro');
    setCurrentPointIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(0);
    setAnswers([]);
    setStreak(0);
    setMatchGameCompleted(false);
  };

  const progressPercentage = stage === 'intro' ? 5 : 
    stage === 'keypoints' ? 10 + ((currentPointIndex + 1) / content.keyPoints.length) * 25 :
    stage === 'matchgame' ? 40 :
    stage === 'quiz' ? 45 + ((currentQuestionIndex + 1) / totalQuestions) * 45 : 100;

  return (
    <div className={`min-h-screen pb-20 ${
      theme === 'dark' ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* 成就彈窗 */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementPopup 
            achievement={showAchievement} 
            onClose={() => setShowAchievement(null)} 
          />
        )}
      </AnimatePresence>

      {/* 頂部進度條 */}
      <div className={`sticky top-0 z-10 px-4 py-3 ${
        theme === 'dark' ? 'bg-card/95 backdrop-blur-sm border-b border-border' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="flex items-center gap-3">
            <StreakFire streak={streak} />
            <span className={`text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* 介紹階段 */}
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <motion.div 
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-primary to-amber-600' 
                      : 'bg-gradient-to-br from-amber-400 to-amber-600'
                  } text-white shadow-lg`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <BookOpen className="w-10 h-10" />
                </motion.div>
                <h1 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {content.title}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="outline" className="gap-1">
                    <Brain className="w-3 h-3" />
                    {content.keyPoints.length} 知識點
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Target className="w-3 h-3" />
                    {totalQuestions} 題測驗
                  </Badge>
                  {hasMatchGame && (
                    <Badge variant="outline" className="gap-1">
                      <Shuffle className="w-3 h-3" />
                      配對遊戲
                    </Badge>
                  )}
                </div>
              </div>

              <motion.div 
                className={`p-6 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-card border border-border' 
                    : 'bg-white shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className={`text-lg leading-relaxed ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  {content.introduction}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => setStage('keypoints')}
                  className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  開始學習冒險
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 知識點階段 */}
          {stage === 'keypoints' && (
            <motion.div
              key={`keypoint-${currentPointIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
                  知識點 {currentPointIndex + 1} / {content.keyPoints.length}
                </div>
                <div className="flex gap-1">
                  {content.keyPoints.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx <= currentPointIndex
                          ? theme === 'dark' ? 'bg-primary' : 'bg-amber-500'
                          : theme === 'dark' ? 'bg-muted' : 'bg-gray-200'
                      }`}
                      animate={idx === currentPointIndex ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  ))}
                </div>
              </div>

              <motion.div 
                className={`p-8 rounded-2xl min-h-[200px] flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-card via-card to-primary/10 border border-border' 
                    : 'bg-gradient-to-br from-white via-white to-amber-50 shadow-lg'
                }`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-primary/20 text-primary' : 'bg-amber-100 text-amber-600'
                    }`}
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Lightbulb className="w-6 h-6" />
                  </motion.div>
                  <p className={`text-xl leading-relaxed ${
                    theme === 'dark' ? 'text-foreground' : 'text-gray-800'
                  }`}>
                    {content.keyPoints[currentPointIndex]}
                  </p>
                </div>
              </motion.div>

              <Button
                onClick={handleNextPoint}
                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
              >
                {currentPointIndex < content.keyPoints.length - 1 
                  ? '下一個知識點' 
                  : hasMatchGame 
                    ? '開始配對遊戲' 
                    : '開始測驗挑戰'}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* 配對遊戲階段 */}
          {stage === 'matchgame' && content.matchGame && (
            <motion.div
              key="matchgame"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-card border border-border' 
                  : 'bg-white shadow-lg'
              }`}>
                <MatchGame 
                  pairs={content.matchGame}
                  onComplete={handleMatchGameComplete}
                  theme={theme}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setStage('quiz')}
                className="w-full"
              >
                跳過配對遊戲
              </Button>
            </motion.div>
          )}

          {/* 測驗階段 */}
          {stage === 'quiz' && currentQuestion && (
            <motion.div
              key={`quiz-${currentQuestionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
                  題目 {currentQuestionIndex + 1} / {totalQuestions}
                </div>
                <StreakFire streak={streak} />
              </div>

              <motion.div 
                className={`p-6 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-card border border-border' 
                    : 'bg-white shadow-lg'
                }`}
                layout
              >
                <h2 className={`text-xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQuestion.correctIndex;
                    const showResult = showExplanation;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500 text-green-600 dark:text-green-400'
                              : isSelected
                                ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400'
                                : theme === 'dark'
                                  ? 'bg-muted/50 border-border text-muted-foreground'
                                  : 'bg-gray-100 border-gray-200 text-gray-400'
                            : isSelected
                              ? theme === 'dark'
                                ? 'bg-primary/20 border-primary'
                                : 'bg-amber-100 border-amber-400'
                              : theme === 'dark'
                                ? 'bg-muted/50 border-border hover:bg-muted hover:border-primary/50'
                                : 'bg-gray-50 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                        } border-2`}
                        whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                        animate={
                          showResult && isCorrect 
                            ? { scale: [1, 1.05, 1] }
                            : showResult && isSelected && !isCorrect
                              ? { x: [0, -5, 5, -5, 5, 0] }
                              : {}
                        }
                      >
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              showResult
                                ? isCorrect
                                  ? 'bg-green-500 text-white'
                                  : isSelected
                                    ? 'bg-red-500 text-white'
                                    : theme === 'dark' ? 'bg-muted text-muted-foreground' : 'bg-gray-200 text-gray-500'
                                : theme === 'dark' ? 'bg-muted text-foreground' : 'bg-gray-200 text-gray-700'
                            }`}
                            animate={showResult && isCorrect ? { rotate: [0, 360] } : {}}
                          >
                            {showResult && isCorrect ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : showResult && isSelected ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </motion.div>
                          <span className={showResult && !isCorrect && !isSelected ? 'opacity-50' : ''}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 解釋 */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-6 p-4 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-amber-50 border border-amber-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
                            theme === 'dark' ? 'text-primary' : 'text-amber-600'
                          }`} />
                        </motion.div>
                        <p className={theme === 'dark' ? 'text-foreground' : 'text-gray-700'}>
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? '下一題' : '查看結果'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 結果階段 */}
          {stage === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${
                  correctAnswers === totalQuestions
                    ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                    : correctAnswers >= totalQuestions / 2
                      ? 'bg-gradient-to-br from-primary to-amber-600'
                      : 'bg-gradient-to-br from-orange-400 to-red-500'
                } text-white shadow-2xl`}
              >
                <Trophy className="w-14 h-14" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {correctAnswers === totalQuestions 
                    ? '🎉 完美通關！' 
                    : correctAnswers >= totalQuestions / 2
                      ? '👏 表現優秀！'
                      : '💪 繼續加油！'}
                </h2>
                <p className={`text-xl ${
                  theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  答對 {correctAnswers} / {totalQuestions} 題
                </p>
              </motion.div>

              {/* 成就展示 */}
              {unlockedAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-card border border-border' : 'bg-white shadow-lg'
                  }`}
                >
                  <h3 className={`text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    🏆 獲得成就
                  </h3>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {unlockedAchievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${achievement.color} text-white text-sm`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {achievement.icon}
                        {achievement.title}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div 
                className={`p-6 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-card border border-border' 
                    : 'bg-white shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex justify-center gap-2 mb-4">
                  {answers.map((correct, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        correct 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </motion.div>
                  ))}
                </div>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  得分：<span className="font-bold text-3xl text-primary">{Math.round((correctAnswers / totalQuestions) * 100)}</span> 分
                </p>
              </motion.div>

              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 h-14 gap-2 rounded-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  重新挑戰
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 h-14 gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
                >
                  完成課程
                  <CheckCircle className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
