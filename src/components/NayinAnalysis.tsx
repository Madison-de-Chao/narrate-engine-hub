import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Mountain, Droplets, Flame, TreeDeciduous, Gem,
  BookOpen, User, TrendingUp, Star
} from "lucide-react";

interface NayinAnalysisProps {
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

// 納音五行對應
const NAYIN_ELEMENTS: Record<string, string> = {
  '海中金': '金', '劍鋒金': '金', '白蠟金': '金', '砂中金': '金', '金箔金': '金', '釵釧金': '金',
  '爐中火': '火', '山頭火': '火', '霹靂火': '火', '山下火': '火', '覆燈火': '火', '天上火': '火',
  '澗下水': '水', '泉中水': '水', '長流水': '水', '天河水': '水', '大溪水': '水', '大海水': '水',
  '路旁土': '土', '城頭土': '土', '屋上土': '土', '壁上土': '土', '大驛土': '土', '沙中土': '土',
  '桑柘木': '木', '楊柳木': '木', '松柏木': '木', '平地木': '木', '石榴木': '木', '大林木': '木',
};

// 完整三十納音詳細解讀（根據 PDF 三十納音總表）
const NAYIN_MEANINGS: Record<string, {
  image: string;
  traits: string;
  fortune: string;
  theme: string;
  detail: string;
  career: string;
  relationship: string;
  health: string;
}> = {
  // 金類
  '海中金': {
    image: '深藏海底的珍貴金礦，沉潛蓄勢，待時而動',
    traits: '內斂深沉，潛力無限，大器晚成，重視內涵',
    fortune: '中年後運勢漸開，財運厚積薄發，宜長期投資',
    theme: '潛龍勿用，韜光養晦',
    detail: '海中金象徵深藏不露的智慧與才華。如同海底珍藏的金礦，外表平凡，內裡珍貴。此命之人需經歷沉潛期，方能綻放光芒。',
    career: '研究開發、學術研究、投資理財、深度分析類工作',
    relationship: '感情深沉持久，一旦認定便會忠貞不渝',
    health: '注意腎臟和泌尿系統保養'
  },
  '劍鋒金': {
    image: '鋒利無比的寶劍，光芒四射，鋒芒畢露',
    traits: '才華橫溢，剛強果斷，直言不諱，有正義感',
    fortune: '事業有成但需謹言慎行，鋒芒太露易招是非',
    theme: '鋒芒畢露，以剛克柔',
    detail: '劍鋒金代表已成器的精金寶劍。此命之人才華出眾，做事果斷，但需注意過於鋒利容易傷人傷己。',
    career: '法律、軍警、外科醫生、技術專家、評論家',
    relationship: '感情直接果斷，愛恨分明，需學會柔軟',
    health: '注意肝膽和情緒管理'
  },
  '白蠟金': {
    image: '精緻細膩的白金，溫潤典雅，細膩珍貴',
    traits: '溫潤典雅，重視外表，品味不凡，善於社交',
    fortune: '適合藝術創作和精緻產業，人緣帶財',
    theme: '溫潤如玉，以柔克剛',
    detail: '白蠟金如同精煉的白金，質地純淨，光澤柔和。此命之人有藝術天賦，注重生活品質。',
    career: '設計、珠寶、美容、時尚、藝術創作',
    relationship: '感情細膩浪漫，重視精神契合',
    health: '注意皮膚和呼吸系統'
  },
  '砂中金': {
    image: '沙土中的金粒，隱而不露，需要挖掘',
    traits: '有隱藏才華，韌性十足，善於等待時機',
    fortune: '需貴人相助方能發揮，大器晚成型',
    theme: '沙裡淘金，厚積薄發',
    detail: '砂中金象徵尚未被發現的金礦。此命之人才華需要被發掘，宜主動展現自我。',
    career: '技術研發、資源開發、考古、地質、投資',
    relationship: '感情低調內斂，需主動表達',
    health: '注意脾胃消化系統'
  },
  '金箔金': {
    image: '輕薄如紙的金箔，華麗裝飾，金光閃閃',
    traits: '外表光鮮，善於包裝，適合裝飾性工作',
    fortune: '財來財去，宜穩健理財，重視實質勝於外表',
    theme: '金玉其外，內功為本',
    detail: '金箔金雖然光彩奪目但質地輕薄。此命之人外表出眾，但需注意內在實力的培養。',
    career: '廣告、公關、演藝、形象設計、展覽策劃',
    relationship: '感情容易被外表吸引，需看重內涵',
    health: '注意心臟和血液循環'
  },
  '釵釧金': {
    image: '女子首飾的精美金飾，精緻美麗，人見人愛',
    traits: '精緻細膩，注重細節，人緣極佳，善於社交',
    fortune: '適合服務業和美學相關行業，貴人運強',
    theme: '精緻典雅，以美服人',
    detail: '釵釧金如同精美的金飾，令人賞心悅目。此命之人審美眼光獨特，善於創造美好事物。',
    career: '珠寶設計、美容美髮、服裝、婚禮策劃',
    relationship: '感情浪漫優雅，重視儀式感',
    health: '注意骨骼和關節保養'
  },
  // 火類
  '爐中火': {
    image: '熔爐中的烈火，熱情如火，精力充沛',
    traits: '熱情如火，精力充沛，領導力強，有魄力',
    fortune: '事業心強，宜創業，但需控制脾氣',
    theme: '烈火熔金，百煉成鋼',
    detail: '爐中火代表熔煉的烈火，能化腐朽為神奇。此命之人精力旺盛，具有改變現狀的能力。',
    career: '創業、製造業、餐飲、能源、鋼鐵冶煉',
    relationship: '感情熱烈主動，但需控制佔有慾',
    health: '注意心血管和情緒控制'
  },
  '山頭火': {
    image: '山頂燃燒的火焰，光芒四射，引人注目',
    traits: '光芒四射，引人注目，志向遠大，有理想',
    fortune: '名聲在外，但需注意不要過於張揚',
    theme: '高瞻遠矚，照耀四方',
    detail: '山頭火如同山頂的篝火，遠近可見。此命之人有領袖氣質，但高處不勝寒，需謹慎。',
    career: '管理、政治、宗教、教育、公益',
    relationship: '感情高調浪漫，重視社會地位',
    health: '注意頭部和神經系統'
  },
  '霹靂火': {
    image: '雷電之火，爆發力強，變化多端',
    traits: '爆發力強，才華驚人，變化多端，創意無限',
    fortune: '突發機會多，需把握時機，貴人相助',
    theme: '電光石火，一鳴驚人',
    detail: '霹靂火象徵雷電的力量，突然而至，威力驚人。此命之人有突發奇才，但需穩定發展。',
    career: '演藝、科技創新、電子、發明、特效',
    relationship: '感情來得快去得也快，需學會穩定',
    health: '注意神經系統和睡眠品質'
  },
  '山下火': {
    image: '山腳下的篝火，溫暖親切，腳踏實地',
    traits: '溫暖親切，腳踏實地，穩重可靠，有人情味',
    fortune: '穩健發展，家庭和睦，晚年安康',
    theme: '溫暖人心，腳踏實地',
    detail: '山下火如同山腳的篝火，溫暖而不灼人。此命之人性情溫和，給人安全感。',
    career: '服務業、餐飲、社工、心理諮詢、社區工作',
    relationship: '感情穩定可靠，重視家庭',
    health: '注意消化系統和情緒調節'
  },
  '覆燈火': {
    image: '燈籠內的燭火，內斂溫馨，照亮他人',
    traits: '內斂溫馨，照亮他人，默默奉獻，有服務精神',
    fortune: '適合服務和教育行業，積德得福',
    theme: '燈火傳心，照亮他人',
    detail: '覆燈火如同燈籠中的燭火，不熄不滅，照亮黑暗。此命之人適合幕後工作，默默付出。',
    career: '教育、護理、宗教、慈善、輔導',
    relationship: '感情細水長流，默默付出',
    health: '注意眼睛和肝臟保養'
  },
  '天上火': {
    image: '太陽般的光芒，光明正大，領袖氣質',
    traits: '光明正大，領袖氣質，胸懷大志，格局宏大',
    fortune: '能成大事，但需謙虛，高處不勝寒',
    theme: '普照萬物，光明磊落',
    detail: '天上火如同太陽，普照大地。此命之人格局宏大，但需防止高高在上而脫離群眾。',
    career: '政治、大企業管理、公益、宗教領袖',
    relationship: '感情大氣磊落，但可能忽略細節',
    health: '注意心臟和眼睛'
  },
  // 水類
  '澗下水': {
    image: '山澗中的清泉，清澈純淨，靈活變通',
    traits: '清澈純淨，靈活變通，適應力強，頭腦靈活',
    fortune: '宜流動性工作，財運隨緣，機會多變',
    theme: '清流不息，靈動自如',
    detail: '澗下水如同山間清泉，純淨而靈動。此命之人聰明機智，善於變通。',
    career: '媒體、旅遊、物流、諮詢、自由職業',
    relationship: '感情靈活多變，需增加穩定性',
    health: '注意腎臟和泌尿系統'
  },
  '泉中水': {
    image: '地底湧出的泉水，源源不絕，持久穩定',
    traits: '源源不絕，持久穩定，有耐力，內涵豐富',
    fortune: '長期穩定的財運，細水長流型',
    theme: '源源不絕，厚積薄發',
    detail: '泉中水象徵地下湧出的泉水，永不乾涸。此命之人內涵豐富，後勁十足。',
    career: '研究、教育、長期投資、水利、環保',
    relationship: '感情持久穩定，越久越深',
    health: '注意骨骼和關節'
  },
  '長流水': {
    image: '奔流不息的河水，活力充沛，永不停歇',
    traits: '活力充沛，永不停歇，進取心強，有衝勁',
    fortune: '事業發展順利，財源廣進，但需注意方向',
    theme: '奔流向海，勇往直前',
    detail: '長流水如同奔流的河水，向著大海前進。此命之人有明確目標，勇於追求。',
    career: '物流、貿易、運輸、互聯網、連鎖經營',
    relationship: '感情主動積極，但需顧及對方感受',
    health: '注意血液循環和腿部'
  },
  '天河水': {
    image: '天上的銀河，高遠清雅，理想主義',
    traits: '高遠清雅，理想主義，格局宏大，有遠見',
    fortune: '適合學術研究和精神領域，不宜求近利',
    theme: '銀河璀璨，志在高遠',
    detail: '天河水如同天上的銀河，遙遠而美麗。此命之人有崇高理想，但需腳踏實地。',
    career: '學術研究、航空航天、宗教哲學、藝術',
    relationship: '感情理想化，需接受現實',
    health: '注意精神健康和睡眠'
  },
  '大溪水': {
    image: '寬廣的溪流，包容大度，人緣極佳',
    traits: '包容大度，人緣極佳，善於溝通，有親和力',
    fortune: '人脈帶來財運，社交場合得利',
    theme: '海納百川，包容萬物',
    detail: '大溪水象徵寬廣的溪流，匯聚百川。此命之人善於整合資源，人緣極好。',
    career: '人力資源、公關、社交平台、談判調解',
    relationship: '感情大度包容，善於溝通',
    health: '注意腸胃和消化'
  },
  '大海水': {
    image: '浩瀚無垠的大海，深不可測，胸懷寬廣',
    traits: '深不可測，胸懷寬廣，氣度恢宏，有大格局',
    fortune: '大起大落，宜穩中求進，忌冒險',
    theme: '浩瀚無邊，深藏不露',
    detail: '大海水代表浩瀚的海洋，既能載舟亦能覆舟。此命之人格局大但需謹慎。',
    career: '國際貿易、航運、大型企業、投資',
    relationship: '感情深沉寬廣，但可能讓人難以捉摸',
    health: '注意腎臟和情緒波動'
  },
  // 土類
  '路旁土': {
    image: '道路兩旁的泥土，樸實無華，任勞任怨',
    traits: '樸實無華，任勞任怨，穩定可靠，有耐心',
    fortune: '腳踏實地方能成功，勿好高騖遠',
    theme: '腳踏實地，穩步前行',
    detail: '路旁土如同道路旁的泥土，默默承載。此命之人務實可靠，但需提升自我價值。',
    career: '基層管理、服務業、交通、農業、建築',
    relationship: '感情踏實可靠，但可能缺乏浪漫',
    health: '注意脾胃和筋骨'
  },
  '城頭土': {
    image: '城牆上的堅土，堅固穩重，有保護欲',
    traits: '堅固穩重，有保護欲，責任感強，可靠',
    fortune: '適合管理和安全相關行業，穩健發展',
    theme: '城牆堡壘，守護一方',
    detail: '城頭土象徵城牆的堅土，保衛家園。此命之人有責任感，善於守護。',
    career: '安保、管理、房地產、城市規劃、保險',
    relationship: '感情有保護欲，給人安全感',
    health: '注意骨骼和關節'
  },
  '屋上土': {
    image: '屋頂的泥瓦，有遮蔽保護之意，顧家愛家',
    traits: '顧家愛家，重視家庭，有保護意識',
    fortune: '家庭運好，房產運佳，適合置產',
    theme: '庇護家園，遮風擋雨',
    detail: '屋上土如同屋頂的瓦片，遮風擋雨。此命之人重視家庭，適合從事房產相關。',
    career: '房地產、建築、室內設計、家具、物業',
    relationship: '感情以家庭為重，顧家型',
    health: '注意呼吸系統和皮膚'
  },
  '壁上土': {
    image: '牆壁上的泥土，需要支撐，善於配合',
    traits: '需要支撐，依賴他人，善於配合，團隊精神',
    fortune: '與人合作事半功倍，獨立較難成事',
    theme: '依附借力，合作共贏',
    detail: '壁上土象徵牆上的泥土，需要依附。此命之人善於合作，但需增強獨立性。',
    career: '團隊工作、助理、行政、配角、支援',
    relationship: '感情依賴性強，需要安全感',
    health: '注意脾胃和情緒'
  },
  '大驛土': {
    image: '驛站的大道，四通八達，人際廣闘',
    traits: '四通八達，人際廣闘，善於交際，機會多',
    fortune: '貴人運強，事業多變，機遇眾多',
    theme: '四通八達，廣結善緣',
    detail: '大驛土如同交通要道，來往頻繁。此命之人人脈廣泛，但需專注發展。',
    career: '交通物流、貿易、仲介、旅遊、社交平台',
    relationship: '感情選擇多，但需專一',
    health: '注意腳部和循環系統'
  },
  '沙中土': {
    image: '沙漠中的土地，需要滋潤，潛力待發',
    traits: '需要滋潤，潛力待發，耐得住考驗，堅韌',
    fortune: '早年辛苦，中晚年順遂，大器晚成',
    theme: '沙漠綠洲，厚積薄發',
    detail: '沙中土如同沙漠中等待滋潤的土地。此命之人需要環境支持，方能發揮潛力。',
    career: '開發、拓荒、創業、資源開發',
    relationship: '感情需要培養，不適合急躁',
    health: '注意脾胃和皮膚乾燥'
  },
  // 木類
  '桑柘木': {
    image: '桑樹和柘樹，柔韌有彈性，務實勤勞',
    traits: '柔韌有彈性，適應力強，務實勤勞，有韌性',
    fortune: '穩健發展，細水長流，勤勞致富',
    theme: '柔韌不折，勤勞致富',
    detail: '桑柘木象徵實用的桑樹，能養蠶織絲。此命之人務實勤勞，善於創造價值。',
    career: '紡織、服裝、農業、加工、實業',
    relationship: '感情務實穩定，重視實際',
    health: '注意肝膽和筋骨'
  },
  '楊柳木': {
    image: '隨風搖曳的柳樹，柔美優雅，多才多藝',
    traits: '柔美優雅，多才多藝，感情豐富，有藝術天賦',
    fortune: '藝術天賦，感情運多變，宜穩定發展',
    theme: '隨風搖曳，柔美多情',
    detail: '楊柳木如同隨風飄動的柳枝，柔美而有韌性。此命之人感性浪漫，有藝術天賦。',
    career: '藝術、音樂、舞蹈、文學、設計',
    relationship: '感情豐富浪漫，但容易感傷',
    health: '注意情緒和神經系統'
  },
  '松柏木': {
    image: '常青的松柏，堅韌不拔，長壽健康',
    traits: '堅韌不拔，長壽健康，正直剛毅，有氣節',
    fortune: '長久穩定，晚年安康，適合長期發展',
    theme: '松柏長青，堅貞不渝',
    detail: '松柏木象徵四季常青的松柏，經冬不凋。此命之人意志堅定，有長遠眼光。',
    career: '教育、醫療、公務、長期項目、傳統行業',
    relationship: '感情忠貞專一，長久穩定',
    health: '注意肺部和呼吸系統'
  },
  '平地木': {
    image: '平原上的樹木，平穩安定，中庸之道',
    traits: '平穩安定，中庸之道，不偏不倚，穩重',
    fortune: '平順發展，無大起大落，安穩度日',
    theme: '平穩中正，安居樂業',
    detail: '平地木如同平原上的樹木，穩定生長。此命之人性格溫和，適合穩定環境。',
    career: '行政、文職、教育、農業、基層管理',
    relationship: '感情平穩安定，少波瀾',
    health: '注意脾胃和消化'
  },
  '石榴木': {
    image: '結實纍纍的石榴樹，多產富饒，子孫運好',
    traits: '多產富饒，子孫運好，有結果，努力有回報',
    fortune: '努力有回報，家庭圓滿，子女有成',
    theme: '碩果纍纍，開花結果',
    detail: '石榴木象徵多子多福的石榴樹，果實纍纍。此命之人付出必有回報，家庭美滿。',
    career: '教育、農業、生育相關、零售、連鎖經營',
    relationship: '感情重視家庭，多子多福',
    health: '注意生殖系統和腸胃'
  },
  '大林木': {
    image: '茂密的森林，氣勢磅礡，發展空間大',
    traits: '氣勢磅礡，發展空間大，有格局，志向遠大',
    fortune: '大事業有成，需長期經營，宜團隊作戰',
    theme: '森林茂盛，蔚為大觀',
    detail: '大林木象徵茂密的森林，氣勢宏大。此命之人格局大，適合大型事業。',
    career: '大企業、集團、林業、環保、團隊管理',
    relationship: '感情大度寬容，有領袖風範',
    health: '注意肝臟和情緒調節'
  },
};

// 五行顏色和圖標配置
const ELEMENT_CONFIG: Record<string, { 
  color: string; 
  bgColor: string; 
  borderColor: string;
  icon: React.ReactNode;
  lightColor: string;
}> = {
  '金': { 
    color: 'text-amber-400', 
    bgColor: 'from-amber-500/20 to-amber-500/5', 
    borderColor: 'border-amber-500/30',
    lightColor: 'text-amber-300',
    icon: <Gem className="w-4 h-4" /> 
  },
  '木': { 
    color: 'text-green-400', 
    bgColor: 'from-green-500/20 to-green-500/5', 
    borderColor: 'border-green-500/30',
    lightColor: 'text-green-300',
    icon: <TreeDeciduous className="w-4 h-4" /> 
  },
  '水': { 
    color: 'text-blue-400', 
    bgColor: 'from-blue-500/20 to-blue-500/5', 
    borderColor: 'border-blue-500/30',
    lightColor: 'text-blue-300',
    icon: <Droplets className="w-4 h-4" /> 
  },
  '火': { 
    color: 'text-red-400', 
    bgColor: 'from-red-500/20 to-red-500/5', 
    borderColor: 'border-red-500/30',
    lightColor: 'text-red-300',
    icon: <Flame className="w-4 h-4" /> 
  },
  '土': { 
    color: 'text-yellow-600', 
    bgColor: 'from-yellow-600/20 to-yellow-600/5', 
    borderColor: 'border-yellow-600/30',
    lightColor: 'text-yellow-500',
    icon: <Mountain className="w-4 h-4" /> 
  },
};

export const NayinAnalysis = ({ nayin }: NayinAnalysisProps) => {
  const pillars = [
    { key: 'year' as const, label: '年柱', desc: '代表祖業根基、童年環境', period: '1-16歲' },
    { key: 'month' as const, label: '月柱', desc: '代表事業發展、父母關係', period: '17-32歲' },
    { key: 'day' as const, label: '日柱', desc: '代表自身核心、配偶特質', period: '33-48歲' },
    { key: 'hour' as const, label: '時柱', desc: '代表子女成就、晚年運勢', period: '49歲後' },
  ];

  // 統計納音五行分布
  const elementCounts: Record<string, number> = {};
  Object.values(nayin).forEach(n => {
    const element = NAYIN_ELEMENTS[n] || '土';
    elementCounts[element] = (elementCounts[element] || 0) + 1;
  });

  // 日柱納音為主要分析對象
  const dayNayin = nayin.day;
  const dayElement = NAYIN_ELEMENTS[dayNayin] || '土';
  const dayMeaning = NAYIN_MEANINGS[dayNayin];
  const dayConfig = ELEMENT_CONFIG[dayElement];

  return (
    <Card className="p-6 border-2 border-amber-500/40 bg-gradient-to-br from-amber-950 via-amber-900/80 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-50" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            納音五行分析
          </h3>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(elementCounts).map(([element, count]) => (
              <Badge 
                key={element} 
                variant="outline" 
                className={`${ELEMENT_CONFIG[element]?.color || 'text-muted-foreground'} ${ELEMENT_CONFIG[element]?.borderColor || ''}`}
              >
                {ELEMENT_CONFIG[element]?.icon}
                <span className="ml-1">{element} × {count}</span>
              </Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="overview">四柱納音</TabsTrigger>
            <TabsTrigger value="detail">日柱詳解</TabsTrigger>
            <TabsTrigger value="guidance">人生指引</TabsTrigger>
          </TabsList>

          {/* 四柱納音總覽 */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pillars.map(({ key, label, desc, period }) => {
                const nayinName = nayin[key];
                const element = NAYIN_ELEMENTS[nayinName] || '土';
                const meaning = NAYIN_MEANINGS[nayinName];
                const config = ELEMENT_CONFIG[element];
                
                return (
                  <div 
                    key={key}
                    className={`rounded-xl p-4 bg-gradient-to-br ${config.bgColor} border ${config.borderColor}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        <span className="font-semibold text-foreground">{label}</span>
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          {period}
                        </Badge>
                      </div>
                      <Badge className={`${config.color} bg-transparent border-current`}>
                        {nayinName}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{desc}</p>
                    
                    {meaning && (
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">
                          <span className={`${config.lightColor} font-medium`}>象意：</span>
                          {meaning.image}
                        </p>
                        <p className="text-muted-foreground">
                          <span className={`${config.lightColor} font-medium`}>特質：</span>
                          {meaning.traits}
                        </p>
                        <p className="text-muted-foreground italic text-xs">
                          「{meaning.theme}」
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 納音組合解讀 */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                納音組合解讀
              </h4>
              <p className="text-sm text-muted-foreground">
                您的命盤納音以
                <span className="font-semibold text-foreground mx-1">
                  {Object.entries(elementCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([e]) => e)
                    .join('、')}
                </span>
                為主，
                {Object.keys(elementCounts).length >= 4 ? '五行較為平衡，適應力強，能夠在不同領域都有所發展。' : 
                 Object.keys(elementCounts).length <= 2 ? '五行較為集中，個性鮮明，專注力強，宜深耕特定領域。' :
                 '五行分布適中，發展多元，可在主次分明中尋找平衡。'}
              </p>
            </div>
          </TabsContent>

          {/* 日柱詳解 */}
          <TabsContent value="detail" className="mt-4 space-y-4">
            {dayMeaning && (
              <>
                <div className={`p-5 rounded-xl bg-gradient-to-br ${dayConfig.bgColor} border ${dayConfig.borderColor}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-full bg-background/30 ${dayConfig.color}`}>
                      {dayConfig.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">{dayNayin}</h4>
                      <p className={`text-sm ${dayConfig.lightColor}`}>{dayElement}命 · 日柱納音</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-background/20">
                      <p className="text-sm text-foreground leading-relaxed">
                        {dayMeaning.detail}
                      </p>
                    </div>
                    
                    <div className="text-center py-2">
                      <p className={`text-lg font-bold ${dayConfig.color}`}>
                        「{dayMeaning.theme}」
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/30">
                    <h5 className="font-semibold text-violet-300 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      象徵意涵
                    </h5>
                    <p className="text-sm text-muted-foreground">{dayMeaning.image}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30">
                    <h5 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      性格特質
                    </h5>
                    <p className="text-sm text-muted-foreground">{dayMeaning.traits}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30">
                    <h5 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      運勢趨向
                    </h5>
                    <p className="text-sm text-muted-foreground">{dayMeaning.fortune}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30">
                    <h5 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      健康提示
                    </h5>
                    <p className="text-sm text-muted-foreground">{dayMeaning.health}</p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* 人生指引 */}
          <TabsContent value="guidance" className="mt-4 space-y-4">
            {dayMeaning && (
              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30">
                  <h5 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                    💼 事業發展方向
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dayMeaning.career}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dayMeaning.career.split('、').slice(0, 4).map((career, idx) => (
                      <Badge key={idx} variant="outline" className="text-blue-400 border-blue-400/30">
                        {career.replace(/[，。]/g, '')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30">
                  <h5 className="font-semibold text-pink-300 mb-3 flex items-center gap-2">
                    💖 感情關係特質
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dayMeaning.relationship}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30">
                  <h5 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                    🍀 綜合運勢提示
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dayMeaning.fortune}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <h5 className="font-semibold text-foreground mb-2">📜 納音五行哲理</h5>
                  <p className="text-sm text-muted-foreground">
                    納音是天干地支組合後所化出的五行屬性，代表命格的本質特徵。
                    <span className={dayConfig.color}>{dayNayin}</span>屬
                    <span className={dayConfig.color}>{dayElement}</span>，
                    象徵「{dayMeaning.theme}」的人生主題。
                    理解自身納音特質，方能順勢而為，發揮天賦優勢。
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
