import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";
import tenGodsData from "@/data/ten_gods.json";
import hiddenStemsData from "@/data/hidden_stems.json";
import { Sparkles, Star, Shield, Zap, User, Calendar, Info, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { ShenshaMatch, RARITY_CONFIG, CATEGORY_CONFIG } from "@/data/shenshaTypes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TraditionalBaziDisplayProps {
  baziResult: BaziResult;
}

// 藏干詳細資訊類型
interface HiddenStemDetail {
  stem: string;
  weight: number;
  ratio: number;
  type: '本氣' | '中氣' | '餘氣';
}

// 五行顏色映射
const WUXING_COLORS: Record<string, string> = {
  '甲': 'text-green-400', '乙': 'text-green-400',
  '丙': 'text-red-400', '丁': 'text-red-400',
  '戊': 'text-yellow-500', '己': 'text-yellow-500',
  '庚': 'text-slate-300', '辛': 'text-slate-300',
  '壬': 'text-blue-400', '癸': 'text-blue-400',
};

// 五行背景映射
const WUXING_BG: Record<string, string> = {
  '甲': 'bg-green-500/20', '乙': 'bg-green-500/20',
  '丙': 'bg-red-500/20', '丁': 'bg-red-500/20',
  '戊': 'bg-yellow-500/20', '己': 'bg-yellow-500/20',
  '庚': 'bg-slate-500/20', '辛': 'bg-slate-500/20',
  '壬': 'bg-blue-500/20', '癸': 'bg-blue-500/20',
};

export const TraditionalBaziDisplay = ({ baziResult }: TraditionalBaziDisplayProps) => {
  const { pillars, hiddenStems, tenGods, nayin, shensha, name, birthDate, gender } = baziResult;
  const [expandedShensha, setExpandedShensha] = useState<string | null>(null);

  // 格式化時辰顯示
  const getHourLabel = (branch: string) => {
    const hourMap: Record<string, string> = {
      '子': '子時 (23:00-01:00)',
      '丑': '丑時 (01:00-03:00)',
      '寅': '寅時 (03:00-05:00)',
      '卯': '卯時 (05:00-07:00)',
      '辰': '辰時 (07:00-09:00)',
      '巳': '巳時 (09:00-11:00)',
      '午': '午時 (11:00-13:00)',
      '未': '未時 (13:00-15:00)',
      '申': '申時 (15:00-17:00)',
      '酉': '酉時 (17:00-19:00)',
      '戌': '戌時 (19:00-21:00)',
      '亥': '亥時 (21:00-23:00)'
    };
    return hourMap[branch] || branch;
  };

  // 獲取藏干詳細資訊
  const getHiddenStemDetails = (branch: string): HiddenStemDetail[] => {
    const data = hiddenStemsData.hiddenStems[branch as keyof typeof hiddenStemsData.hiddenStems];
    return (data?.stems || []) as HiddenStemDetail[];
  };

  // 檢查 shensha 是否為新格式 (ShenshaMatch[])
  const isNewShenshaFormat = (sha: unknown): sha is ShenshaMatch => {
    return typeof sha === 'object' && sha !== null && 'evidence' in sha;
  };

  // 取得神煞列表（兼容新舊格式）
  const getShenshaList = (): (ShenshaMatch | string)[] => {
    if (!shensha || shensha.length === 0) return [];
    return shensha;
  };

  const shenshaList = getShenshaList();

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 relative overflow-hidden">
      {/* 裝飾性邊框光效 */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 opacity-50" />
      <div className="absolute inset-[1px] rounded-lg bg-card" />
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-foreground mb-6">傳統八字排盤</h2>
        
        <div className="space-y-6">
          {/* 基本資料區 */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 rounded-xl p-5 border border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              命主基本資料
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">姓名</span>
                <p className="text-lg font-bold text-foreground">{name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">性別</span>
                <p className="text-lg font-semibold text-foreground">
                  {gender === 'male' ? '男' : gender === 'female' ? '女' : gender}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> 出生日期
                </span>
                <p className="text-lg font-semibold text-foreground">
                  {birthDate ? format(new Date(birthDate), 'yyyy年MM月dd日') : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">出生時辰</span>
                <p className="text-lg font-semibold text-foreground">
                  {getHourLabel(pillars.hour.branch)}
                </p>
              </div>
            </div>
          </div>

          {/* 四柱八字 + 藏干整合顯示 */}
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {["year", "month", "day", "hour"].map((pillar, index) => {
              const pillarData = pillars[pillar as keyof typeof pillars];
              const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
              const hiddenDetails = getHiddenStemDetails(pillarData.branch);
              
              return (
                <div key={pillar} className="text-center group">
                  <div className="text-sm text-muted-foreground mb-2">{pillarNames[index]}</div>
                  <div className="relative bg-muted/30 rounded-lg p-3 md:p-4 border border-border/50 transition-all duration-300 group-hover:border-primary/50">
                    {/* 懸停時的邊框發光 */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" style={{ filter: 'blur(4px)' }} />
                    <div className="relative z-10 space-y-3">
                      {/* 天干 */}
                      <div className={`text-2xl md:text-3xl font-bold ${WUXING_COLORS[pillarData.stem] || 'text-primary'}`}>
                        {pillarData.stem}
                      </div>
                      {/* 地支 */}
                      <div className="text-2xl md:text-3xl font-bold text-secondary">{pillarData.branch}</div>
                      
                      {/* 藏干詳細 */}
                      <div className="pt-2 border-t border-border/30 space-y-1">
                        <div className="text-[10px] text-muted-foreground mb-1">藏干</div>
                        {hiddenDetails.map((detail, idx) => (
                          <TooltipProvider key={idx}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`flex items-center justify-between px-2 py-0.5 rounded ${WUXING_BG[detail.stem] || 'bg-muted/30'}`}>
                                  <span className={`text-sm font-medium ${WUXING_COLORS[detail.stem] || 'text-foreground'}`}>
                                    {detail.stem}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {detail.ratio}%
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <div className="text-xs">
                                  <div className="font-semibold">{detail.type}</div>
                                  <div>權重: {detail.weight}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* 納音 */}
                  <div className="mt-2 text-xs text-primary/80">
                    {nayin[pillar as keyof typeof nayin] || "-"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 十神 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              十神
            </h3>
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {["year", "month", "day", "hour"].map((pillar) => {
                const gods = tenGods[pillar as keyof typeof tenGods] || { stem: "", branch: "" };
                const stemGodInfo = tenGodsData.tenGodsRules[gods.stem as keyof typeof tenGodsData.tenGodsRules];
                const branchGodInfo = tenGodsData.tenGodsRules[gods.branch as keyof typeof tenGodsData.tenGodsRules];
                
                return (
                  <div key={pillar} className="bg-gradient-to-br from-card/80 to-card/40 rounded-lg p-3 md:p-4 border border-border/50 space-y-2 hover:border-accent/50 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-[10px] text-muted-foreground">天干</span>
                      </div>
                      <div className="text-base md:text-lg font-bold text-accent">{gods.stem || "-"}</div>
                      {stemGodInfo && (
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {stemGodInfo.象徵}
                        </div>
                      )}
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-secondary" />
                        <span className="text-[10px] text-muted-foreground">地支</span>
                      </div>
                      <div className="text-base md:text-lg font-bold text-secondary">{gods.branch || "-"}</div>
                      {branchGodInfo && (
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {branchGodInfo.象徵}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 神煞 - 完整呈現 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              神煞
              {shenshaList.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  共 {shenshaList.length} 個
                </Badge>
              )}
            </h3>
            
            {shenshaList.length === 0 ? (
              <p className="text-sm text-muted-foreground">暫無神煞資訊</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shenshaList.map((sha, index) => {
                  if (isNewShenshaFormat(sha)) {
                    // 新格式：ShenshaMatch
                    const rarityConfig = RARITY_CONFIG[sha.rarity] || RARITY_CONFIG['N'];
                    const categoryConfig = CATEGORY_CONFIG[sha.category] || CATEGORY_CONFIG['特殊'];
                    const isExpanded = expandedShensha === `${sha.name}-${index}`;
                    
                    return (
                      <Collapsible
                        key={`${sha.name}-${index}`}
                        open={isExpanded}
                        onOpenChange={() => setExpandedShensha(isExpanded ? null : `${sha.name}-${index}`)}
                      >
                        <div 
                          className="relative p-4 rounded-lg border-2 bg-card/50 transition-all duration-300 group overflow-hidden"
                          style={{ borderColor: `${categoryConfig.color}40` }}
                        >
                          {/* 稀有度光效 */}
                          <div 
                            className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none"
                            style={{ 
                              background: `radial-gradient(circle at top right, ${rarityConfig.color}, transparent 70%)` 
                            }}
                          />
                          
                          <div className="relative z-10">
                            {/* 標題列 */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{categoryConfig.icon}</span>
                                <h4 className="font-bold text-lg" style={{ color: categoryConfig.color }}>
                                  {sha.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] px-1.5"
                                  style={{ borderColor: rarityConfig.color, color: rarityConfig.color }}
                                >
                                  {rarityConfig.label}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5">
                                  {sha.category}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* 效果說明 */}
                            <p className="text-sm text-foreground mb-2">{sha.effect}</p>
                            <p className="text-xs text-muted-foreground mb-3">{sha.modernMeaning}</p>
                            
                            {/* Buff/Debuff */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {sha.buff && (
                                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                  ↑ {sha.buff}
                                </span>
                              )}
                              {sha.debuff && (
                                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                                  ↓ {sha.debuff}
                                </span>
                              )}
                            </div>
                            
                            {/* 展開證據鏈 */}
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                <Info className="w-3 h-3" />
                                <span>查看推導過程</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-muted-foreground">錨點依據：</span>
                                    <span className="text-foreground ml-1">{sha.evidence.anchor_basis}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">錨點值：</span>
                                    <span className="text-primary font-medium ml-1">{sha.evidence.anchor_value}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">命中柱位：</span>
                                    <span className="text-foreground ml-1">{sha.evidence.matched_pillar}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">命中值：</span>
                                    <span className="text-secondary font-medium ml-1">{sha.evidence.matched_value}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">命中原因：</span>
                                  <span className="text-foreground ml-1">{sha.evidence.why_matched}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">規則來源：</span>
                                  <span className="text-accent ml-1">{sha.evidence.rule_ref}</span>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </div>
                      </Collapsible>
                    );
                  } else {
                    // 舊格式：純字串
                    return (
                      <div 
                        key={index} 
                        className="relative p-4 rounded-lg border-2 border-primary/30 bg-card/50 transition-all duration-300"
                      >
                        <h4 className="font-bold text-lg text-primary">{sha}</h4>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
