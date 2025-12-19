import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Users, 
  Sparkles, 
  BookOpen, 
  Star, 
  Swords,
  Shield,
  TrendingUp,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { WuxingCycleDiagram } from '@/components/WuxingCycleDiagram';
import { TenGodsDiagram } from '@/components/TenGodsDiagram';
import { ShenShaDiagram } from '@/components/ShenShaDiagram';

interface ZoneContent {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  overview: string;
  sections: {
    title: string;
    content: string;
  }[];
  relatedZones: string[];
  hasInteractiveDiagram?: boolean;
}

const ZONE_CONTENTS: Record<string, ZoneContent> = {
  bazi: {
    id: 'bazi',
    name: '命盤核心',
    subtitle: '四柱八字',
    icon: <Compass className="w-8 h-8" />,
    color: 'from-amber-500 to-yellow-400',
    overview: '四柱八字是中華傳統命理學的核心，由年、月、日、時四柱組成，每柱包含一個天干和一個地支，共八個字，故稱「八字」。',
    sections: [
      {
        title: '四柱的意義',
        content: '年柱代表祖先根基與早年運勢（1-16歲），月柱象徵父母緣分與青年發展（17-32歲），日柱為命主本人與配偶宮，時柱則預示子女運與晚年境遇（49歲以後）。'
      },
      {
        title: '天干與地支',
        content: '十天干：甲乙丙丁戊己庚辛壬癸，代表天的能量。十二地支：子丑寅卯辰巳午未申酉戌亥，對應十二生肖，代表地的力量。天干地支相配，形成六十甲子循環。'
      },
      {
        title: '日主的重要性',
        content: '日干又稱「日主」或「日元」，代表命主本人。以日主為核心，可以推算出與其他干支的關係，進而判斷一個人的性格、才能、運勢等各方面特質。'
      },
      {
        title: '陰陽五行基礎',
        content: '每個天干地支都有其陰陽屬性和五行歸屬。甲丙戊庚壬為陽干，乙丁己辛癸為陰干。五行金木水火土相生相剋，構成命理分析的基礎框架。'
      }
    ],
    relatedZones: ['wuxing', 'tenGods', 'nayin']
  },
  tenGods: {
    id: 'tenGods',
    name: '十神殿堂',
    subtitle: '性格與關係',
    icon: <Users className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-400',
    overview: '十神是根據日主與其他干支的生剋關係而定的十種符號，揭示了命主的性格特質、人際關係與人生際遇。',
    sections: [
      {
        title: '十神分類',
        content: '十神分為五組：比肩劫財（與日主同類）、食神傷官（日主所生）、正財偏財（日主所剋）、正官七殺（剋日主者）、正印偏印（生日主者）。'
      },
      {
        title: '比劫星 - 自我與競爭',
        content: '比肩代表自信、獨立、朋友；劫財象徵競爭、行動力、投機。比劫旺者個性強，但也可能爭強好勝，不易聚財。'
      },
      {
        title: '食傷星 - 才華與表達',
        content: '食神主口福、藝術、溫和；傷官代表才華、創意、反叛。食傷旺者聰明伶俐，表達能力強，但過旺可能恃才傲物。'
      },
      {
        title: '財星 - 財富與慾望',
        content: '正財代表穩定收入、勤儉；偏財象徵意外之財、投資。財星旺者重視物質，財運佳，但也可能過度追求錢財。'
      },
      {
        title: '官殺星 - 事業與壓力',
        content: '正官主名聲、責任、紀律；七殺代表權威、魄力、壓力。官殺旺者事業心強，但過旺可能壓力過大或遇小人。'
      },
      {
        title: '印星 - 學習與庇護',
        content: '正印主學問、母親、貴人；偏印代表偏門學問、獨立思考。印星旺者智慧高，受長輩庇護，但過旺可能過度依賴。'
      }
    ],
    relatedZones: ['bazi', 'personality', 'fortune'],
    hasInteractiveDiagram: true
  },
  shensha: {
    id: 'shensha',
    name: '神煞迷宮',
    subtitle: '吉凶星曜',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-400',
    overview: '神煞是八字命理中的特殊星曜，分為吉神和凶煞，為命運增添色彩與變數，可作為輔助判斷的參考。',
    sections: [
      {
        title: '吉神類',
        content: '天乙貴人（遇難呈祥）、天德月德（逢凶化吉）、文昌星（學業有成）、將星（領導才能）、驛馬（遷移發展）等，都是對命主有利的星曜。'
      },
      {
        title: '凶煞類',
        content: '羊刃（衝動傷害）、七殺（壓力挑戰）、劫煞（損失風險）、亡神（精神困擾）、華蓋（孤獨清高）等，提醒命主需注意的人生課題。'
      },
      {
        title: '桃花類',
        content: '桃花星主異性緣和人緣，分為內桃花（正緣）和外桃花（濫桃花）。紅鸞天喜主婚姻喜慶，咸池主風流韻事，需要綜合判斷。'
      },
      {
        title: '神煞組合',
        content: '多個神煞同時出現會產生特殊效應，如「貴人遇華蓋」主高雅獨特，「驛馬遇羊刃」主奔波辛苦。組合解讀需要豐富經驗。'
      }
    ],
    relatedZones: ['bazi', 'legion', 'fortune'],
    hasInteractiveDiagram: true
  },
  wuxing: {
    id: 'wuxing',
    name: '五行殿',
    subtitle: '金木水火土',
    icon: <Star className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-400',
    overview: '五行學說是中華哲學的基石，金木水火土五種元素相生相剋，構成宇宙萬物運行的基本法則。',
    sections: [
      {
        title: '五行特質',
        content: '木主仁（正直、成長）、火主禮（熱情、光明）、土主信（穩重、包容）、金主義（果斷、收斂）、水主智（靈活、智慧）。每種五行都有其獨特的能量特性。'
      },
      {
        title: '五行相生',
        content: '木生火（鑽木取火）、火生土（灰燼成土）、土生金（礦藏於土）、金生水（金屬凝露）、水生木（灌溉樹木）。相生關係代表滋養與支持。'
      },
      {
        title: '五行相剋',
        content: '木剋土（根穿土地）、土剋水（土壩阻水）、水剋火（水滅火焰）、火剋金（火煉金屬）、金剋木（斧伐樹木）。相剋關係代表制約與平衡。'
      },
      {
        title: '五行平衡',
        content: '命盤中五行的強弱分布影響人的性格與運勢。五行平衡者性情穩定，某行過旺或過弱則可能產生偏頗。可透過後天調整來達到平衡。'
      }
    ],
    relatedZones: ['bazi', 'nayin', 'personality'],
    hasInteractiveDiagram: true
  },
  nayin: {
    id: 'nayin',
    name: '納音寶庫',
    subtitle: '六十甲子',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-orange-500 to-red-400',
    overview: '納音是六十甲子的另一種分類方式，將六十組干支配上三十種物象，揭示更深層的命理意涵。',
    sections: [
      {
        title: '納音起源',
        content: '納音源自古代音律學，將宮商角徵羽五音與六十甲子相配。每兩組干支共用一個納音，形成三十種納音，各有其象徵意義。'
      },
      {
        title: '金類納音',
        content: '海中金、劍鋒金、白蠟金、沙中金、金箔金、釵釧金。金類納音多主堅定、剛毅，但不同的金各有特色，如劍鋒金鋒利剛強，金箔金華麗脆弱。'
      },
      {
        title: '木類納音',
        content: '大林木、楊柳木、松柏木、平地木、桑拓木、石榴木。木類納音主成長、仁慈，如大林木氣勢磅礴，楊柳木柔順靈活。'
      },
      {
        title: '水類納音',
        content: '澗下水、泉中水、長流水、天河水、大海水、井泉水。水類納音主智慧、流動，如大海水包容萬物，泉中水清澈純淨。'
      },
      {
        title: '火類納音',
        content: '爐中火、山頭火、霹靂火、山下火、覆燈火、天上火。火類納音主熱情、光明，如霹靂火威力驚人，覆燈火溫和照亮。'
      },
      {
        title: '土類納音',
        content: '路旁土、城頭土、屋上土、壁上土、大驛土、沙中土。土類納音主穩重、包容，如城頭土堅固守護，沙中土變動不定。'
      }
    ],
    relatedZones: ['bazi', 'wuxing', 'personality']
  },
  legion: {
    id: 'legion',
    name: '四時軍團',
    subtitle: '命運戰場',
    icon: <Swords className="w-8 h-8" />,
    color: 'from-red-500 to-rose-400',
    overview: '四時軍團將八字四柱擬人化為年、月、日、時四大軍團，每個軍團都有其獨特的戰士角色與使命。',
    sections: [
      {
        title: '軍團概念',
        content: '年柱為「傳承軍團」代表家族根基，月柱為「成長軍團」主導青年發展，日柱為「核心軍團」是命主本命，時柱為「未來軍團」掌管子息與晚運。'
      },
      {
        title: '統帥與謀士',
        content: '每個軍團的天干為統帥，地支為謀士。統帥決定軍團的行動風格，謀士則藏有藏干，提供內在的支援力量。'
      },
      {
        title: '軍團互動',
        content: '四個軍團之間存在合作與衝突關係。天干相合形成同盟，地支相沖則產生對抗。軍團和諧者人生順遂，衝突多者挑戰不斷。'
      },
      {
        title: '軍團任務',
        content: '根據神煞和十神的配置，每個軍團承擔不同的人生任務。有的軍團主攻事業，有的負責感情，有的守護健康，有的創造財富。'
      }
    ],
    relatedZones: ['bazi', 'tenGods', 'shensha']
  },
  personality: {
    id: 'personality',
    name: '性格分析',
    subtitle: '內在探索',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-indigo-500 to-violet-400',
    overview: '八字性格分析從命盤結構解讀個人的天生性格特質、優勢潛能與成長課題。',
    sections: [
      {
        title: '日主性格',
        content: '十個日主各有特性：甲木正直、乙木柔韌、丙火熱情、丁火細膩、戊土穩重、己土謙和、庚金剛毅、辛金敏感、壬水奔放、癸水聰穎。'
      },
      {
        title: '十神影響',
        content: '命盤中十神的強弱分布塑造性格特點。官殺重者自律負責，食傷旺者創意豐富，印星強者重視學習，財星旺者務實進取，比劫多者獨立自主。'
      },
      {
        title: '五行個性',
        content: '五行的偏重也影響性格。木旺者有朝氣，火旺者有魅力，土旺者踏實，金旺者有原則，水旺者善變通。五行均衡者性情中庸。'
      },
      {
        title: '成長建議',
        content: '了解自己的命盤結構，可以揚長避短。過旺的五行需要節制，不足的五行可以後天補充。認識自己是成長的第一步。'
      }
    ],
    relatedZones: ['bazi', 'tenGods', 'wuxing']
  },
  fortune: {
    id: 'fortune',
    name: '運勢預測',
    subtitle: '流年大運',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'from-sky-500 to-blue-400',
    overview: '大運與流年是動態的運勢指標，揭示人生不同階段的機遇與挑戰。',
    sections: [
      {
        title: '大運週期',
        content: '大運以十年為一個週期，從月柱起運，順逆行依陰陽而定。每個大運都帶來不同的人生主題，影響十年的運勢走向。'
      },
      {
        title: '流年變化',
        content: '流年是每一年的干支，與命盤產生互動。流年逢喜用神則運勢順遂，逢忌神則需謹慎應對。重要的流年常帶來人生轉折。'
      },
      {
        title: '運勢判斷',
        content: '運勢好壞取決於大運流年與命盤的配合。喜用神得力時機遇多，忌神當道時挑戰多。但吉凶相伴，危機也可能是轉機。'
      },
      {
        title: '趨吉避凶',
        content: '了解運勢週期可以更好地規劃人生。運勢好時積極進取，運勢差時保守蓄力。順應天時，把握機遇，是命理智慧的實踐。'
      }
    ],
    relatedZones: ['bazi', 'tenGods', 'shensha']
  }
};

const ZoneGuide: React.FC = () => {
  const { zoneId } = useParams<{ zoneId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const zone = zoneId ? ZONE_CONTENTS[zoneId] : null;

  if (!zone) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'text-paper' : 'text-void'
      }`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">找不到此區域</h1>
          <Button onClick={() => navigate('/')}>返回首頁</Button>
        </div>
      </div>
    );
  }

  const relatedZones = zone.relatedZones
    .map(id => ZONE_CONTENTS[id])
    .filter(Boolean);

  return (
    <div className="min-h-screen pb-20">
      {/* 頂部裝飾 */}
      <div className={`relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-void via-card to-background' 
          : 'bg-gradient-to-b from-paper via-white to-background'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-20 bg-gradient-to-br ${zone.color}`} />
        </div>

        {/* 返回按鈕 */}
        <div className="relative z-10 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className={`gap-2 ${
              theme === 'dark' ? 'text-paper/70 hover:text-paper' : 'text-void/70 hover:text-void'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            返回地圖
          </Button>
        </div>

        {/* 區域標題 */}
        <motion.div 
          className="relative z-10 text-center px-4 pb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${zone.color} text-white mb-4 shadow-lg`}>
            {zone.icon}
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-paper' : 'text-void'
          }`}>
            {zone.name}
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gold' : 'text-amber-600'
          }`}>
            {zone.subtitle}
          </p>
        </motion.div>
      </div>

      {/* 內容區域 */}
      <div className="max-w-3xl mx-auto px-4 -mt-4">
        {/* 概述 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-2xl mb-6 ${
            theme === 'dark' 
              ? 'bg-card/80 border border-gold/20' 
              : 'bg-white shadow-lg border border-ink/5'
          }`}
        >
          <p className={`text-lg leading-relaxed ${
            theme === 'dark' ? 'text-paper/90' : 'text-void/90'
          }`}>
            {zone.overview}
          </p>

          {/* 互動圖表區域 */}
          {zone.hasInteractiveDiagram && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              {zone.id === 'wuxing' && <WuxingCycleDiagram />}
              {zone.id === 'tenGods' && <TenGodsDiagram />}
              {zone.id === 'shensha' && <ShenShaDiagram />}
            </motion.div>
          )}
        </motion.div>

        {/* 詳細章節 */}
        <div className="space-y-4">
          {zone.sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`p-5 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-card/50 border border-gold/10 hover:border-gold/30' 
                  : 'bg-white/80 shadow border border-ink/5 hover:shadow-md'
              } transition-all duration-300`}
            >
              <h3 className={`font-bold text-lg mb-2 flex items-center gap-2 ${
                theme === 'dark' ? 'text-gold' : 'text-amber-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${zone.color}`} />
                {section.title}
              </h3>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 相關區域 */}
        {relatedZones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <h2 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              探索相關區域
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedZones.map(related => (
                <button
                  key={related.id}
                  onClick={() => navigate(`/guide/${related.id}`)}
                  className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-card/50 border border-gold/10 hover:border-gold/40 hover:bg-card/80'
                      : 'bg-white shadow border border-ink/5 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${related.color} flex items-center justify-center text-white shrink-0`}>
                    {React.cloneElement(related.icon as React.ReactElement, { className: 'w-5 h-5' })}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className={`font-medium truncate ${
                      theme === 'dark' ? 'text-paper' : 'text-void'
                    }`}>
                      {related.name}
                    </div>
                    <div className={`text-xs truncate ${
                      theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                    }`}>
                      {related.subtitle}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${
                    theme === 'dark' ? 'text-gold/50' : 'text-amber-500/50'
                  }`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 返回按鈕 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/')}
            className={`gap-2 ${
              theme === 'dark'
                ? 'bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            <Compass className="w-5 h-5" />
            返回導覽地圖
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ZoneGuide;
