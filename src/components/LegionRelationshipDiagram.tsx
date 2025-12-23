import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Heart, Swords, Link2 } from "lucide-react";
import type { FullLegionArmy, PillarKey, WuxingElement } from "@/lib/legionTranslator/types";

interface LegionRelationshipDiagramProps {
  army: FullLegionArmy;
}

// 五行相生相剋關係
const WUXING_GENERATES: Record<WuxingElement, WuxingElement> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
};

const WUXING_CONTROLS: Record<WuxingElement, WuxingElement> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
};

const WUXING_COLORS: Record<WuxingElement, string> = {
  '木': '#22c55e',
  '火': '#ef4444',
  '土': '#a16207',
  '金': '#94a3b8',
  '水': '#3b82f6'
};

const LEGION_INFO: Record<PillarKey, { name: string; shortName: string; position: { x: number; y: number } }> = {
  year: { name: '年柱 · 祖源軍', shortName: '年', position: { x: 15, y: 25 } },
  month: { name: '月柱 · 社會軍', shortName: '月', position: { x: 85, y: 25 } },
  day: { name: '日柱 · 核心軍', shortName: '日', position: { x: 15, y: 75 } },
  hour: { name: '時柱 · 未來軍', shortName: '時', position: { x: 85, y: 75 } }
};

type RelationType = '相生' | '相剋' | '比和' | '被生' | '被剋';

interface LegionRelation {
  from: PillarKey;
  to: PillarKey;
  type: RelationType;
  fromElement: WuxingElement;
  toElement: WuxingElement;
  description: string;
}

// 獲取軍團主將元素
function getLegionElement(army: FullLegionArmy, key: PillarKey): WuxingElement {
  const legionMap = {
    year: army.familyLegion,
    month: army.growthLegion,
    day: army.selfLegion,
    hour: army.futureLegion
  };
  return (legionMap[key]?.general?.character?.element as WuxingElement) || '木';
}

// 計算兩軍團間的關係
function calculateRelation(fromElement: WuxingElement, toElement: WuxingElement): { type: RelationType; description: string } {
  if (fromElement === toElement) {
    return { type: '比和', description: '同氣連枝，相互扶持' };
  }
  if (WUXING_GENERATES[fromElement] === toElement) {
    return { type: '相生', description: `${fromElement}生${toElement}，前者滋養後者` };
  }
  if (WUXING_GENERATES[toElement] === fromElement) {
    return { type: '被生', description: `${toElement}生${fromElement}，後者滋養前者` };
  }
  if (WUXING_CONTROLS[fromElement] === toElement) {
    return { type: '相剋', description: `${fromElement}剋${toElement}，前者制約後者` };
  }
  if (WUXING_CONTROLS[toElement] === fromElement) {
    return { type: '被剋', description: `${toElement}剋${fromElement}，後者制約前者` };
  }
  return { type: '比和', description: '中性關係' };
}

// 獲取關係圖標和顏色
function getRelationStyle(type: RelationType): { icon: typeof Heart; color: string; bgColor: string } {
  switch (type) {
    case '相生':
      return { icon: Heart, color: 'text-green-400', bgColor: 'bg-green-500/20' };
    case '被生':
      return { icon: Heart, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
    case '相剋':
      return { icon: Swords, color: 'text-red-400', bgColor: 'bg-red-500/20' };
    case '被剋':
      return { icon: Zap, color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    case '比和':
    default:
      return { icon: Link2, color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
  }
}

export const LegionRelationshipDiagram = ({ army }: LegionRelationshipDiagramProps) => {
  // 獲取各軍團元素
  const elements: Record<PillarKey, WuxingElement> = {
    year: getLegionElement(army, 'year'),
    month: getLegionElement(army, 'month'),
    day: getLegionElement(army, 'day'),
    hour: getLegionElement(army, 'hour')
  };

  // 計算關係（只計算關鍵關係）
  const keyRelations: LegionRelation[] = [
    // 年 -> 月（傳承）
    { from: 'year', to: 'month', ...calculateRelation(elements.year, elements.month), fromElement: elements.year, toElement: elements.month },
    // 月 -> 日（發展）
    { from: 'month', to: 'day', ...calculateRelation(elements.month, elements.day), fromElement: elements.month, toElement: elements.day },
    // 日 -> 時（延續）
    { from: 'day', to: 'hour', ...calculateRelation(elements.day, elements.hour), fromElement: elements.day, toElement: elements.hour },
    // 年 -> 日（根基）
    { from: 'year', to: 'day', ...calculateRelation(elements.year, elements.day), fromElement: elements.year, toElement: elements.day },
    // 月 -> 時（事業延續）
    { from: 'month', to: 'hour', ...calculateRelation(elements.month, elements.hour), fromElement: elements.month, toElement: elements.hour },
    // 年 -> 時（傳承延續）
    { from: 'year', to: 'hour', ...calculateRelation(elements.year, elements.hour), fromElement: elements.year, toElement: elements.hour },
  ];

  // 統計關係類型
  const relationStats = keyRelations.reduce((acc, rel) => {
    acc[rel.type] = (acc[rel.type] || 0) + 1;
    return acc;
  }, {} as Record<RelationType, number>);

  const generateCount = (relationStats['相生'] || 0) + (relationStats['被生'] || 0);
  const controlCount = (relationStats['相剋'] || 0) + (relationStats['被剋'] || 0);
  const harmonyCount = relationStats['比和'] || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-purple-400" />
            四柱軍團關係圖
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* 關係統計 */}
          <div className="flex justify-center gap-4 mb-6">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 px-3 py-1">
              <Heart className="w-3 h-3 mr-1" />
              相生 {generateCount} 組
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 px-3 py-1">
              <Swords className="w-3 h-3 mr-1" />
              相剋 {controlCount} 組
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1">
              <Link2 className="w-3 h-3 mr-1" />
              比和 {harmonyCount} 組
            </Badge>
          </div>

          {/* 視覺化關係圖 */}
          <div className="relative h-[280px] mb-6">
            {/* 四個軍團節點 */}
            {(Object.entries(LEGION_INFO) as [PillarKey, typeof LEGION_INFO[PillarKey]][]).map(([key, info], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${info.position.x}%`, top: `${info.position.y}%` }}
              >
                <div 
                  className="w-20 h-20 rounded-xl flex flex-col items-center justify-center border-2 shadow-lg transition-all duration-300 hover:scale-110"
                  style={{ 
                    borderColor: WUXING_COLORS[elements[key]],
                    background: `linear-gradient(135deg, ${WUXING_COLORS[elements[key]]}20, ${WUXING_COLORS[elements[key]]}05)`
                  }}
                >
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: WUXING_COLORS[elements[key]] }}
                  >
                    {info.shortName}
                  </span>
                  <span className="text-xs text-muted-foreground">{elements[key]}</span>
                </div>
              </motion.div>
            ))}

            {/* 關係連線 (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
                </marker>
                <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
                </marker>
                <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" />
                </marker>
              </defs>
              
              {/* 主要連線：年-月、月-日、日-時 */}
              {keyRelations.slice(0, 3).map((rel, idx) => {
                const fromPos = LEGION_INFO[rel.from].position;
                const toPos = LEGION_INFO[rel.to].position;
                const isGenerate = rel.type === '相生' || rel.type === '被生';
                const isControl = rel.type === '相剋' || rel.type === '被剋';
                const color = isGenerate ? '#22c55e' : isControl ? '#ef4444' : '#3b82f6';
                const markerId = isGenerate ? 'arrowGreen' : isControl ? 'arrowRed' : 'arrowBlue';
                
                return (
                  <motion.line
                    key={`line-${idx}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ delay: 0.5 + idx * 0.2, duration: 0.5 }}
                    x1={`${fromPos.x}%`}
                    y1={`${fromPos.y}%`}
                    x2={`${toPos.x}%`}
                    y2={`${toPos.y}%`}
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray={isControl ? "5,5" : "none"}
                    markerEnd={`url(#${markerId})`}
                  />
                );
              })}
            </svg>
          </div>

          {/* 詳細關係列表 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">軍團間關係詳解</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {keyRelations.map((rel, idx) => {
                const style = getRelationStyle(rel.type);
                const Icon = style.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + idx * 0.1, duration: 0.3 }}
                    className={`flex items-center gap-2 p-2 rounded-lg ${style.bgColor} border border-border/30`}
                  >
                    <div className="flex items-center gap-1 min-w-[80px]">
                      <span 
                        className="font-medium text-sm"
                        style={{ color: WUXING_COLORS[rel.fromElement] }}
                      >
                        {LEGION_INFO[rel.from].shortName}柱
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span 
                        className="font-medium text-sm"
                        style={{ color: WUXING_COLORS[rel.toElement] }}
                      >
                        {LEGION_INFO[rel.to].shortName}柱
                      </span>
                    </div>
                    <Badge variant="outline" className={`${style.color} text-xs`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {rel.type}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* 綜合評估 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
          >
            <h4 className="font-medium text-foreground mb-2">軍團協作評估</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {generateCount > controlCount 
                ? `四柱之間以相生為主（${generateCount}組），整體呈現滋養扶持的格局，各階段人生能量流轉順暢，有利於穩步發展。`
                : controlCount > generateCount
                ? `四柱之間相剋關係較多（${controlCount}組），人生中可能面臨較多挑戰與磨練，但也蘊含突破與成長的契機。`
                : `四柱關係較為平衡，相生與相剋各半，人生既有助力也有考驗，關鍵在於如何運用智慧化解衝突、借力發展。`
              }
              {harmonyCount > 0 && ` 有${harmonyCount}組比和關係，表示某些人生階段能得到同頻共振的支持。`}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
