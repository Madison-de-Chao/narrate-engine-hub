import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  X,
  Info,
  Heart,
  Share2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WuxingCycleDiagram } from '@/components/WuxingCycleDiagram';
import { TenGodsDiagram } from '@/components/TenGodsDiagram';
import { ShenShaDiagram } from '@/components/ShenShaDiagram';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// localStorage keys
const FAVORITES_STORAGE_KEY = 'bazi-academy-favorites';
const VIEWED_STORAGE_KEY = 'bazi-academy-viewed';

// Helper functions for favorites
const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites: string[]): void => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
};

// Helper functions for viewed concepts
const getViewed = (): string[] => {
  try {
    const stored = localStorage.getItem(VIEWED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveViewed = (viewed: string[]): void => {
  try {
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(viewed));
  } catch (e) {
    console.error('Failed to save viewed:', e);
  }
};

// 概念卡片資料結構
interface ConceptCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  color: string;
  icon?: React.ReactNode;
  example?: string;
}

// 區域概念資料
const ZONE_CONCEPTS: Record<string, ConceptCard[]> = {
  bazi: [
    {
      id: 'four-pillars',
      title: '四柱',
      subtitle: '年月日時',
      description: '八字由四柱組成，每柱代表人生不同層面：年柱代表祖上與早年運勢，月柱代表父母與成長環境，日柱代表自我與配偶，時柱代表子女與晚年。',
      details: [
        '年柱：代表祖輩、16歲前的運勢',
        '月柱：代表父母、16-32歲的運勢',
        '日柱：代表自己與配偶、32-48歲的運勢',
        '時柱：代表子女、48歲後的運勢'
      ],
      color: 'from-amber-500 to-yellow-400',
      example: '例如：甲子年 乙丑月 丙寅日 丁卯時'
    },
    {
      id: 'heavenly-stems',
      title: '天干',
      subtitle: '甲乙丙丁戊己庚辛壬癸',
      description: '天干共有十個，代表天的能量。分別是甲、乙、丙、丁、戊、己、庚、辛、壬、癸，各自對應不同的五行屬性。',
      details: [
        '甲乙：木，甲為陽木（大樹），乙為陰木（花草）',
        '丙丁：火，丙為陽火（太陽），丁為陰火（燭火）',
        '戊己：土，戊為陽土（高山），己為陰土（田園）',
        '庚辛：金，庚為陽金（劍斧），辛為陰金（珠玉）',
        '壬癸：水，壬為陽水（大海），癸為陰水（雨露）'
      ],
      color: 'from-sky-500 to-blue-400'
    },
    {
      id: 'earthly-branches',
      title: '地支',
      subtitle: '子丑寅卯辰巳午未申酉戌亥',
      description: '地支共有十二個，代表地的能量，也對應十二生肖。地支藏有天干，稱為藏干，是八字分析的重要依據。',
      details: [
        '子（鼠）：藏癸水',
        '丑（牛）：藏己土、癸水、辛金',
        '寅（虎）：藏甲木、丙火、戊土',
        '卯（兔）：藏乙木',
        '辰（龍）：藏戊土、乙木、癸水',
        '巳（蛇）：藏丙火、戊土、庚金',
        '午（馬）：藏丁火、己土',
        '未（羊）：藏己土、丁火、乙木',
        '申（猴）：藏庚金、壬水、戊土',
        '酉（雞）：藏辛金',
        '戌（狗）：藏戊土、辛金、丁火',
        '亥（豬）：藏壬水、甲木'
      ],
      color: 'from-emerald-500 to-teal-400'
    },
    {
      id: 'day-master',
      title: '日主',
      subtitle: '命主核心',
      description: '日柱的天干稱為「日主」或「日元」，代表命主本人。所有十神、五行分析都以日主為中心展開。',
      details: [
        '日主是整個八字的核心',
        '日主的五行決定了其他干支與你的關係',
        '日主強弱影響整體命局格局',
        '分析八字時，首先要確定日主'
      ],
      color: 'from-purple-500 to-pink-400',
      example: '例如日柱為「丙寅」，則日主為「丙火」'
    }
  ],
  legion: [
    {
      id: 'year-legion',
      title: '年柱軍團',
      subtitle: '祖上傳承',
      description: '年柱代表家族傳承與早年環境，是你人生起點的能量基礎。年柱的天干為統帥，地支為軍師。',
      details: [
        '統帥（年干）：家族賦予你的核心特質',
        '軍師（年支）：祖輩的智慧與資源',
        '影響範圍：16歲前的成長環境',
        '戰略意義：人生的起始資源與根基'
      ],
      color: 'from-amber-600 to-orange-500'
    },
    {
      id: 'month-legion',
      title: '月柱軍團',
      subtitle: '成長力量',
      description: '月柱代表父母與成長過程，是形塑你性格的關鍵時期。月柱的能量影響你的事業發展方向。',
      details: [
        '統帥（月干）：父母給予的教育方向',
        '軍師（月支）：社會環境的影響',
        '影響範圍：16-32歲的發展期',
        '戰略意義：事業與社會定位的基礎'
      ],
      color: 'from-rose-500 to-red-500'
    },
    {
      id: 'day-legion',
      title: '日柱軍團',
      subtitle: '自我核心',
      description: '日柱代表命主本人，是八字的核心。日干為你的本質，日支為你最親密的夥伴（配偶宮）。',
      details: [
        '統帥（日干）：你的核心本質與性格',
        '軍師（日支）：配偶與內心深處的渴望',
        '影響範圍：32-48歲的壯年期',
        '戰略意義：個人實力與婚姻的關鍵'
      ],
      color: 'from-violet-500 to-purple-500'
    },
    {
      id: 'hour-legion',
      title: '時柱軍團',
      subtitle: '未來展望',
      description: '時柱代表子女與晚年，是你人生成就的最終呈現。時柱的能量預示著你的人生歸宿。',
      details: [
        '統帥（時干）：子女的特質與發展',
        '軍師（時支）：晚年的生活品質',
        '影響範圍：48歲後的晚年',
        '戰略意義：人生最終成就與傳承'
      ],
      color: 'from-cyan-500 to-blue-500'
    }
  ],
  tenGods: [
    {
      id: 'comparison-rob',
      title: '比劫',
      subtitle: '比肩・劫財',
      description: '與日主同五行的干支，代表兄弟姐妹、朋友、競爭者。比肩為同陰陽，劫財為異陰陽。',
      details: [
        '比肩：志同道合的夥伴，互相扶持',
        '劫財：競爭對手，也是刺激成長的力量',
        '正面：獨立、自信、人緣好',
        '過多：固執、爭財、人際紛爭'
      ],
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 'output-stars',
      title: '食傷',
      subtitle: '食神・傷官',
      description: '日主所生的干支，代表才華、表達、子女。食神溫和內斂，傷官張揚外放。',
      details: [
        '食神：溫和的創造力，享受生活',
        '傷官：強烈的表現欲，才華橫溢',
        '正面：聰明、創意、口才好',
        '過多：任性、叛逆、不守規矩'
      ],
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'wealth-stars',
      title: '財星',
      subtitle: '正財・偏財',
      description: '日主所剋的干支，代表財富、父親（男命）、妻子（男命）。正財穩定，偏財投機。',
      details: [
        '正財：穩定收入，踏實理財',
        '偏財：意外之財，投資運氣',
        '正面：務實、有經濟頭腦',
        '過多：貪財、物質主義'
      ],
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'authority-stars',
      title: '官殺',
      subtitle: '正官・七殺',
      description: '剋日主的干支，代表事業、上司、丈夫（女命）。正官溫和有禮，七殺強勢霸道。',
      details: [
        '正官：正當的權力與地位',
        '七殺：強烈的野心與衝勁',
        '正面：有責任感、領導力強',
        '過多：壓力大、受制於人'
      ],
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'resource-stars',
      title: '印星',
      subtitle: '正印・偏印',
      description: '生日主的干支，代表母親、貴人、學識。正印溫暖呵護，偏印獨特另類。',
      details: [
        '正印：傳統學識，長輩庇護',
        '偏印：另類思維，特殊才能',
        '正面：有學問、受人照顧',
        '過多：依賴、懶散、想太多'
      ],
      color: 'from-teal-500 to-cyan-500'
    }
  ],
  shensha: [
    {
      id: 'noble-stars',
      title: '貴人星',
      subtitle: '天乙貴人・文昌貴人',
      description: '貴人星代表生命中的貴人與助力，遇到困難時會有人相助。貴人多者，一生順遂。',
      details: [
        '天乙貴人：最大的貴人星，化解災厄',
        '文昌貴人：學業與考試的助力',
        '天德貴人：道德與品行的守護',
        '月德貴人：人緣與福報的象徵'
      ],
      color: 'from-amber-400 to-yellow-400'
    },
    {
      id: 'romance-stars',
      title: '桃花星',
      subtitle: '桃花・紅鸞・天喜',
      description: '桃花星代表人緣與異性緣，適度的桃花帶來好姻緣，過多則可能感情紛擾。',
      details: [
        '桃花：異性緣，人緣好',
        '紅鸞：正緣桃花，婚姻吉星',
        '天喜：喜事臨門，心情愉悅',
        '咸池：風流桃花，需注意分寸'
      ],
      color: 'from-pink-400 to-rose-400'
    },
    {
      id: 'talent-stars',
      title: '才華星',
      subtitle: '華蓋・文昌・學堂',
      description: '才華星代表智慧與才能，擁有這些星曜的人通常聰明、有藝術天賦。',
      details: [
        '華蓋：藝術天賦，獨處能力',
        '文昌：學業出眾，文采過人',
        '學堂：求學順利，考運佳',
        '太極貴人：悟性高，通靈性'
      ],
      color: 'from-purple-400 to-violet-400'
    },
    {
      id: 'warning-stars',
      title: '警示星',
      subtitle: '羊刃・亡神・劫煞',
      description: '警示星提醒需要注意的生命課題，不代表凶險，而是需要謹慎處理的領域。',
      details: [
        '羊刃：衝動與傷害的警示',
        '亡神：意外與損失的提醒',
        '劫煞：破財與被騙的防範',
        '應對方式：謹慎行事，化解為吉'
      ],
      color: 'from-red-400 to-orange-400'
    }
  ],
  wuxing: [
    {
      id: 'wood',
      title: '木',
      subtitle: '仁・生長',
      description: '木代表生長、仁慈、向上的力量。木旺者性格直爽、有上進心，但可能固執。',
      details: [
        '方位：東方',
        '季節：春季',
        '顏色：青色、綠色',
        '性格：仁慈、正直、有同情心',
        '器官：肝、膽、眼睛',
        '過旺：固執、急躁',
        '不足：缺乏決斷力'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'fire',
      title: '火',
      subtitle: '禮・光明',
      description: '火代表熱情、禮儀、光明的力量。火旺者性格開朗、熱情，但可能急躁。',
      details: [
        '方位：南方',
        '季節：夏季',
        '顏色：紅色、紫色',
        '性格：熱情、禮貌、有魅力',
        '器官：心臟、小腸',
        '過旺：急躁、衝動',
        '不足：缺乏熱情'
      ],
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'earth',
      title: '土',
      subtitle: '信・穩重',
      description: '土代表穩重、信用、承載的力量。土旺者性格敦厚、守信，但可能保守。',
      details: [
        '方位：中央',
        '季節：四季之交',
        '顏色：黃色、棕色',
        '性格：忠厚、穩重、守信用',
        '器官：脾、胃',
        '過旺：固執、保守',
        '不足：缺乏安全感'
      ],
      color: 'from-yellow-600 to-amber-600'
    },
    {
      id: 'metal',
      title: '金',
      subtitle: '義・剛毅',
      description: '金代表剛毅、義氣、收斂的力量。金旺者性格果斷、講義氣，但可能過於嚴厲。',
      details: [
        '方位：西方',
        '季節：秋季',
        '顏色：白色、金色',
        '性格：剛毅、果斷、有義氣',
        '器官：肺、大腸',
        '過旺：過於剛硬',
        '不足：缺乏決斷力'
      ],
      color: 'from-gray-400 to-slate-500'
    },
    {
      id: 'water',
      title: '水',
      subtitle: '智・流動',
      description: '水代表智慧、靈活、流動的力量。水旺者性格聰明、適應力強，但可能善變。',
      details: [
        '方位：北方',
        '季節：冬季',
        '顏色：黑色、藍色',
        '性格：聰明、靈活、有智慧',
        '器官：腎、膀胱',
        '過旺：善變、多疑',
        '不足：缺乏智慧'
      ],
      color: 'from-blue-500 to-cyan-500'
    }
  ],
  nayin: [
    {
      id: 'nayin-intro',
      title: '納音概述',
      subtitle: '六十甲子',
      description: '納音是將六十甲子配以五行，每兩組干支共用一個納音。納音揭示更深層的命理意涵。',
      details: [
        '每個納音包含兩組干支',
        '共有30種納音五行組合',
        '納音描述能量的質地與特性',
        '可用於分析命局的深層特質'
      ],
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'nayin-metal',
      title: '金之納音',
      subtitle: '六種金相',
      description: '金的納音有六種：海中金、劍鋒金、白蠟金、砂中金、金箔金、釵釧金，各有不同特質。',
      details: [
        '海中金：深藏不露的財富',
        '劍鋒金：鋒利進取的能量',
        '白蠟金：純淨明亮的特質',
        '砂中金：待挖掘的潛能',
        '金箔金：華麗外表的裝飾',
        '釵釧金：精緻優雅的品味'
      ],
      color: 'from-gray-400 to-amber-400'
    },
    {
      id: 'nayin-wood',
      title: '木之納音',
      subtitle: '六種木相',
      description: '木的納音有六種：大林木、楊柳木、松柏木、平地木、桑拓木、石榴木，展現不同生命力。',
      details: [
        '大林木：茂盛繁榮的格局',
        '楊柳木：柔韌靈活的性格',
        '松柏木：堅毅長青的意志',
        '平地木：平穩成長的特質',
        '桑拓木：實用務實的能力',
        '石榴木：多子多福的象徵'
      ],
      color: 'from-green-500 to-emerald-400'
    }
  ],
  personality: [
    {
      id: 'day-master-personality',
      title: '日主性格',
      subtitle: '核心本質',
      description: '日主的五行決定了你的核心性格基調，是了解自己的第一步。',
      details: [
        '甲木：如大樹般正直，有領導力',
        '乙木：如花草般柔韌，有適應力',
        '丙火：如太陽般熱情，有感染力',
        '丁火：如燭火般溫暖，有洞察力',
        '戊土：如高山般穩重，有承擔力',
        '己土：如田園般包容，有滋養力',
        '庚金：如劍斧般果斷，有執行力',
        '辛金：如珠玉般精緻，有審美力',
        '壬水：如大海般深沉，有智慧力',
        '癸水：如雨露般細膩，有感知力'
      ],
      color: 'from-violet-500 to-purple-500'
    },
    {
      id: 'ten-gods-personality',
      title: '十神性格',
      subtitle: '性格層次',
      description: '命局中哪個十神最旺，會大幅影響你的行為模式與處事風格。',
      details: [
        '比劫旺：獨立自主、重視朋友',
        '食傷旺：創意豐富、表達欲強',
        '財星旺：務實理財、重視物質',
        '官殺旺：責任感強、追求地位',
        '印星旺：愛學習、重視精神'
      ],
      color: 'from-blue-500 to-indigo-500'
    }
  ],
  fortune: [
    {
      id: 'dayun',
      title: '大運',
      subtitle: '十年運勢',
      description: '大運是每十年一變的運勢週期，決定了人生不同階段的主要發展方向。',
      details: [
        '大運由月柱推算而來',
        '每十年換一個大運',
        '男陽女陰順行，男陰女陽逆行',
        '大運決定該時期的主要運勢基調'
      ],
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'liunian',
      title: '流年',
      subtitle: '年度運勢',
      description: '流年是每年的運勢，與大運結合分析，可以預測當年的吉凶禍福。',
      details: [
        '流年即當年的干支',
        '流年與命局的互動產生吉凶',
        '流年可沖合命局中的干支',
        '重要決策需參考流年運勢'
      ],
      color: 'from-sky-500 to-blue-500'
    }
  ]
};

interface ConceptExplorerProps {
  zoneId: string;
  zoneName: string;
  onBack: () => void;
}

export const ConceptExplorer: React.FC<ConceptExplorerProps> = ({
  zoneId,
  zoneName,
  onBack
}) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewed, setViewed] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load favorites and viewed from localStorage on mount
  useEffect(() => {
    setFavorites(getFavorites());
    setViewed(getViewed());
  }, []);

  // Mark current concept as viewed
  useEffect(() => {
    if (currentConcept) {
      const fullId = `${zoneId}-${currentConcept.id}`;
      if (!viewed.includes(fullId)) {
        const newViewed = [...viewed, fullId];
        setViewed(newViewed);
        saveViewed(newViewed);
      }
    }
  }, [currentIndex, zoneId]);

  const allConcepts = ZONE_CONCEPTS[zoneId] || [];
  const concepts = showFavoritesOnly 
    ? allConcepts.filter(c => favorites.includes(`${zoneId}-${c.id}`))
    : allConcepts;
  const currentConcept = concepts[currentIndex];

  // Calculate progress
  const viewedInZone = allConcepts.filter(c => viewed.includes(`${zoneId}-${c.id}`)).length;
  const progressPercent = allConcepts.length > 0 ? Math.round((viewedInZone / allConcepts.length) * 100) : 0;

  // Toggle favorite status
  const toggleFavorite = useCallback((conceptId: string) => {
    const fullId = `${zoneId}-${conceptId}`;
    setFavorites(prev => {
      const newFavorites = prev.includes(fullId)
        ? prev.filter(id => id !== fullId)
        : [...prev, fullId];
      saveFavorites(newFavorites);
      
      if (newFavorites.includes(fullId)) {
        toast.success('已加入收藏');
      } else {
        toast.info('已取消收藏');
      }
      
      return newFavorites;
    });
  }, [zoneId]);

  const isFavorite = useCallback((conceptId: string) => {
    return favorites.includes(`${zoneId}-${conceptId}`);
  }, [favorites, zoneId]);

  const isViewed = useCallback((conceptId: string) => {
    return viewed.includes(`${zoneId}-${conceptId}`);
  }, [viewed, zoneId]);

  const favoritesCount = allConcepts.filter(c => favorites.includes(`${zoneId}-${c.id}`)).length;

  // Share functionality
  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: theme === 'dark' ? '#1a1a2e' : '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      setShareImageUrl(imageUrl);
      setShareDialogOpen(true);
    } catch (error) {
      console.error('Failed to generate share image:', error);
      toast.error('生成分享圖片失敗');
    } finally {
      setIsSharing(false);
    }
  };

  const downloadShareImage = () => {
    if (!shareImageUrl || !currentConcept) return;
    
    const link = document.createElement('a');
    link.download = `八字學堂-${currentConcept.title}.png`;
    link.href = shareImageUrl;
    link.click();
    toast.success('圖片已下載');
  };

  const copyShareImage = async () => {
    if (!shareImageUrl) return;
    
    try {
      const response = await fetch(shareImageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast.success('圖片已複製到剪貼簿');
    } catch (error) {
      console.error('Failed to copy image:', error);
      toast.error('複製圖片失敗，請嘗試下載');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < concepts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100 && currentIndex > 0) {
      handlePrev();
    } else if (info.offset.x < -100 && currentIndex < concepts.length - 1) {
      handleNext();
    }
  };

  // 是否顯示互動圖表
  const showInteractiveDiagram = () => {
    if (zoneId === 'wuxing') return <WuxingCycleDiagram className="mt-4" />;
    if (zoneId === 'tenGods') return <TenGodsDiagram className="mt-4" />;
    if (zoneId === 'shensha') return <ShenShaDiagram className="mt-4" />;
    return null;
  };

  if (concepts.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-background' : 'bg-gray-50'
      }`}>
        <div className="text-center px-4">
          {showFavoritesOnly ? (
            <>
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">尚無收藏的概念</p>
              <p className="text-sm text-muted-foreground/70 mb-4">
                點擊卡片右上角的愛心即可收藏
              </p>
              <Button 
                onClick={() => setShowFavoritesOnly(false)} 
                variant="outline"
              >
                查看全部概念
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">此區域內容正在準備中...</p>
              <Button onClick={onBack} variant="outline">返回</Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${
      theme === 'dark' ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* 頂部導航 */}
      <div className={`sticky top-0 z-10 px-4 py-3 ${
        theme === 'dark' 
          ? 'bg-card/95 backdrop-blur-sm border-b border-border' 
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h2 className={`font-bold ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>
            {zoneName}
          </h2>
          <div className="flex items-center gap-2">
            {/* 收藏篩選按鈕 */}
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setCurrentIndex(0);
              }}
              className="gap-1 text-xs"
              disabled={favoritesCount === 0 && !showFavoritesOnly}
            >
              <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              {favoritesCount}
            </Button>
            <Badge variant="outline" className="text-xs">
              {concepts.length > 0 ? `${currentIndex + 1} / ${concepts.length}` : '0'}
            </Badge>
          </div>
        </div>
        
        {/* 學習進度條 */}
        <div className="mt-2 px-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}>
              <Eye className="w-3 h-3 inline mr-1" />
              學習進度
            </span>
            <span className={theme === 'dark' ? 'text-primary' : 'text-amber-600'}>
              {viewedInZone}/{allConcepts.length} ({progressPercent}%)
            </span>
          </div>
          <div className={`h-1.5 rounded-full overflow-hidden ${
            theme === 'dark' ? 'bg-muted' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-primary to-primary/70' 
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 進度指示器 */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 justify-center">
          {concepts.map((concept, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all relative ${
                idx === currentIndex 
                  ? 'w-6 bg-primary' 
                  : isViewed(concept.id)
                    ? 'w-1.5 bg-green-500/50 hover:bg-green-500/70'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 卡片區域 */}
      <div ref={containerRef} className="px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentConcept.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            {/* 主卡片 */}
            <div 
              ref={cardRef}
              className={`relative rounded-3xl overflow-hidden ${
                theme === 'dark' 
                  ? 'bg-card border border-border' 
                  : 'bg-white shadow-xl'
              }`}
            >
              {/* 漸變頭部 */}
              <div className={`h-32 bg-gradient-to-r ${currentConcept.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                
                {/* 已讀標記 */}
                {isViewed(currentConcept.id) && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/80 backdrop-blur-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                    <span className="text-xs text-white font-medium">已讀</span>
                  </div>
                )}
                
                {/* 標題區 */}
                <div className="absolute bottom-4 left-6 right-20">
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                    {currentConcept.title}
                  </h1>
                  <p className="text-white/90 text-sm mt-1">
                    {currentConcept.subtitle}
                  </p>
                </div>

                {/* 右上角按鈕組 */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {/* 分享按鈕 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    disabled={isSharing}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/20 backdrop-blur-sm hover:bg-black/30"
                  >
                    <Share2 className={`w-5 h-5 text-white ${isSharing ? 'animate-pulse' : ''}`} />
                  </button>
                  
                  {/* 收藏按鈕 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(currentConcept.id);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isFavorite(currentConcept.id)
                        ? 'bg-white/30 backdrop-blur-sm'
                        : 'bg-black/20 backdrop-blur-sm hover:bg-black/30'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 transition-all ${
                        isFavorite(currentConcept.id) 
                          ? 'text-red-400 fill-red-400 scale-110' 
                          : 'text-white'
                      }`} 
                    />
                  </button>
                </div>
              </div>

              {/* 內容區 */}
              <div className="p-6">
                <p className={`text-base leading-relaxed mb-6 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  {currentConcept.description}
                </p>

                {/* 詳細內容 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-amber-600'}`} />
                    <span className={`font-semibold text-sm ${
                      theme === 'dark' ? 'text-foreground' : 'text-gray-800'
                    }`}>
                      詳細說明
                    </span>
                  </div>
                  
                  {currentConcept.details.map((detail, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-start gap-3 p-3 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-muted/50' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        theme === 'dark'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-foreground/80' : 'text-gray-600'
                      }`}>
                        {detail}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* 範例 */}
                {currentConcept.example && (
                  <div className={`mt-6 p-4 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-amber-600'}`} />
                      <span className={`font-semibold text-sm ${
                        theme === 'dark' ? 'text-primary' : 'text-amber-700'
                      }`}>
                        範例
                      </span>
                    </div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-foreground/70' : 'text-amber-800'
                    }`}>
                      {currentConcept.example}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 互動圖表區域 */}
        {showInteractiveDiagram()}

        {/* 導航按鈕 */}
        <div className="flex justify-between items-center mt-6 px-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            上一個
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentIndex === concepts.length - 1}
            className="gap-2"
          >
            下一個
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* 滑動提示 */}
        <p className={`text-center text-xs mt-4 ${
          theme === 'dark' ? 'text-muted-foreground' : 'text-gray-400'
        }`}>
          ← 左右滑動切換概念 →
        </p>
      </div>

      {/* 分享對話框 */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              分享概念卡片
            </DialogTitle>
          </DialogHeader>
          
          {shareImageUrl && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-border">
                <img 
                  src={shareImageUrl} 
                  alt="分享預覽" 
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={downloadShareImage}
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="w-4 h-4 rotate-[-90deg]" />
                  下載圖片
                </Button>
                <Button 
                  variant="outline"
                  onClick={copyShareImage}
                  className="flex-1 gap-2"
                >
                  複製圖片
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                下載後可分享至 LINE、Facebook、Instagram 等社群平台
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
