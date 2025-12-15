import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Mountain, Droplets, Flame, TreeDeciduous, Gem } from "lucide-react";

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

// 納音詳細解讀
const NAYIN_MEANINGS: Record<string, { image: string; traits: string; fortune: string }> = {
  '海中金': { image: '深藏海底的珍貴金礦', traits: '內斂深沉，潛力無限，大器晚成', fortune: '中年後運勢漸開，財運厚積薄發' },
  '劍鋒金': { image: '鋒利無比的寶劍', traits: '鋒芒畢露，才華橫溢，剛強果斷', fortune: '事業有成但需謹言慎行' },
  '白蠟金': { image: '精緻細膩的白金', traits: '溫潤典雅，重視外表，品味不凡', fortune: '適合藝術創作和精緻產業' },
  '砂中金': { image: '沙土中的金粒', traits: '隱而不露，需要挖掘，有隱藏才華', fortune: '需貴人相助方能發揮' },
  '金箔金': { image: '輕薄如紙的金箔', traits: '外表光鮮，華而不實，適合裝飾性工作', fortune: '財來財去，宜穩健理財' },
  '釵釧金': { image: '女子首飾的金飾', traits: '精緻美麗，注重細節，人緣極佳', fortune: '適合服務業和美學相關行業' },
  '爐中火': { image: '熔爐中的烈火', traits: '熱情如火，精力充沛，領導力強', fortune: '事業心強，宜創業' },
  '山頭火': { image: '山頂燃燒的火焰', traits: '光芒四射，引人注目，志向遠大', fortune: '名聲在外，但需注意不要過於張揚' },
  '霹靂火': { image: '雷電之火', traits: '爆發力強，才華驚人，變化多端', fortune: '突發機會多，需把握時機' },
  '山下火': { image: '山腳下的篝火', traits: '溫暖親切，腳踏實地，穩重可靠', fortune: '穩健發展，家庭和睦' },
  '覆燈火': { image: '燈籠內的燭火', traits: '內斂溫馨，照亮他人，默默奉獻', fortune: '適合服務和教育行業' },
  '天上火': { image: '太陽般的光芒', traits: '光明正大，領袖氣質，胸懷大志', fortune: '能成大事，但需謙虛' },
  '澗下水': { image: '山澗中的清泉', traits: '清澈純淨，靈活變通，適應力強', fortune: '宜流動性工作，財運隨緣' },
  '泉中水': { image: '地底湧出的泉水', traits: '源源不絕，持久穩定，有耐力', fortune: '長期穩定的財運' },
  '長流水': { image: '奔流不息的河水', traits: '活力充沛，永不停歇，進取心強', fortune: '事業發展順利，財源廣進' },
  '天河水': { image: '天上的銀河', traits: '高遠清雅，理想主義，格局宏大', fortune: '適合學術研究和精神領域' },
  '大溪水': { image: '寬廣的溪流', traits: '包容大度，人緣極佳，善於溝通', fortune: '人脈帶來財運' },
  '大海水': { image: '浩瀚無垠的大海', traits: '深不可測，胸懷寬廣，氣度恢宏', fortune: '大起大落，宜穩中求進' },
  '路旁土': { image: '道路兩旁的泥土', traits: '樸實無華，任勞任怨，穩定可靠', fortune: '腳踏實地方能成功' },
  '城頭土': { image: '城牆上的堅土', traits: '堅固穩重，有保護欲，責任感強', fortune: '適合管理和安全相關行業' },
  '屋上土': { image: '屋頂的泥瓦', traits: '有遮蔽保護之意，顧家愛家', fortune: '家庭運好，房產運佳' },
  '壁上土': { image: '牆壁上的泥土', traits: '需要支撐，依賴他人，善於配合', fortune: '與人合作事半功倍' },
  '大驛土': { image: '驛站的大道', traits: '四通八達，人際廣闘，善於交際', fortune: '貴人運強，事業多變' },
  '沙中土': { image: '沙漠中的土地', traits: '需要滋潤，潛力待發，耐得住考驗', fortune: '早年辛苦，中晚年順遂' },
  '桑柘木': { image: '桑樹和柘樹', traits: '柔韌有彈性，適應力強，務實勤勞', fortune: '穩健發展，細水長流' },
  '楊柳木': { image: '隨風搖曳的柳樹', traits: '柔美優雅，多才多藝，感情豐富', fortune: '藝術天賦，感情運多變' },
  '松柏木': { image: '常青的松柏', traits: '堅韌不拔，長壽健康，正直剛毅', fortune: '長久穩定，晚年安康' },
  '平地木': { image: '平原上的樹木', traits: '平穩安定，中庸之道，不偏不倚', fortune: '平順發展，無大起大落' },
  '石榴木': { image: '結實纍纍的石榴樹', traits: '多產富饒，子孫運好，有結果', fortune: '努力有回報，家庭圓滿' },
  '大林木': { image: '茂密的森林', traits: '氣勢磅礡，發展空間大，有格局', fortune: '大事業有成，需長期經營' },
};

// 五行顏色和圖標
const ELEMENT_CONFIG: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  '金': { color: 'text-amber-400', bgColor: 'from-amber-500/20 to-amber-500/5', icon: <Gem className="w-4 h-4" /> },
  '木': { color: 'text-green-400', bgColor: 'from-green-500/20 to-green-500/5', icon: <TreeDeciduous className="w-4 h-4" /> },
  '水': { color: 'text-blue-400', bgColor: 'from-blue-500/20 to-blue-500/5', icon: <Droplets className="w-4 h-4" /> },
  '火': { color: 'text-red-400', bgColor: 'from-red-500/20 to-red-500/5', icon: <Flame className="w-4 h-4" /> },
  '土': { color: 'text-yellow-600', bgColor: 'from-yellow-600/20 to-yellow-600/5', icon: <Mountain className="w-4 h-4" /> },
};

export const NayinAnalysis = ({ nayin }: NayinAnalysisProps) => {
  const pillars = [
    { key: 'year', label: '年柱', desc: '代表祖上、童年' },
    { key: 'month', label: '月柱', desc: '代表父母、青年' },
    { key: 'day', label: '日柱', desc: '代表自己、中年' },
    { key: 'hour', label: '時柱', desc: '代表子女、晚年' },
  ] as const;

  // 統計納音五行分布
  const elementCounts: Record<string, number> = {};
  Object.values(nayin).forEach(n => {
    const element = NAYIN_ELEMENTS[n] || '土';
    elementCounts[element] = (elementCounts[element] || 0) + 1;
  });

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-amber-500/5 via-transparent to-violet-500/5 opacity-50" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            納音五行分析
          </h3>
          <div className="flex gap-2">
            {Object.entries(elementCounts).map(([element, count]) => (
              <Badge 
                key={element} 
                variant="outline" 
                className={`${ELEMENT_CONFIG[element]?.color || 'text-muted-foreground'}`}
              >
                {element} × {count}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map(({ key, label, desc }) => {
            const nayinName = nayin[key];
            const element = NAYIN_ELEMENTS[nayinName] || '土';
            const meaning = NAYIN_MEANINGS[nayinName];
            const config = ELEMENT_CONFIG[element] || ELEMENT_CONFIG['土'];
            
            return (
              <div 
                key={key}
                className={`rounded-xl p-4 bg-gradient-to-br ${config.bgColor} border border-border/30`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={config.color}>{config.icon}</span>
                    <span className="font-semibold text-foreground">{label}</span>
                  </div>
                  <Badge className={`${config.color} bg-transparent border-current`}>
                    {nayinName}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">{desc}</p>
                
                {meaning && (
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="text-foreground font-medium">象意：</span>
                      {meaning.image}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground font-medium">特質：</span>
                      {meaning.traits}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground font-medium">運勢：</span>
                      {meaning.fortune}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 納音組合解讀 */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
          <h4 className="font-semibold text-foreground mb-2">納音組合解讀</h4>
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
            {Object.keys(elementCounts).length >= 4 ? '五行較為平衡，適應力強。' : 
             Object.keys(elementCounts).length <= 2 ? '五行較為集中，個性鮮明，專注力強。' :
             '五行分布適中，發展多元。'}
          </p>
        </div>
      </div>
    </Card>
  );
};
