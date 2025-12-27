import React, { useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Pillar {
  stem: string;
  branch: string;
}

interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

interface WuxingRelationshipDiagramProps {
  pillars: Pillars;
}

// 天干/地支對應五行
const WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 五行顏色
const WUXING_COLORS: Record<string, { text: string; bg: string; border: string; glow: string; hex: string }> = {
  '木': { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/30', hex: '#34d399' },
  '火': { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', glow: 'shadow-red-500/30', hex: '#f87171' },
  '土': { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50', glow: 'shadow-amber-500/30', hex: '#fbbf24' },
  '金': { text: 'text-slate-300', bg: 'bg-slate-400/20', border: 'border-slate-400/50', glow: 'shadow-slate-400/30', hex: '#cbd5e1' },
  '水': { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', glow: 'shadow-blue-500/30', hex: '#60a5fa' },
};

// 五行相生關係
const GENERATING_CYCLE: Record<string, string> = {
  '木': '火', // 木生火
  '火': '土', // 火生土
  '土': '金', // 土生金
  '金': '水', // 金生水
  '水': '木', // 水生木
};

// 五行相剋關係
const OVERCOMING_CYCLE: Record<string, string> = {
  '木': '土', // 木剋土
  '土': '水', // 土剋水
  '水': '火', // 水剋火
  '火': '金', // 火剋金
  '金': '木', // 金剋木
};

// 五行順序（循環用）
const WUXING_ORDER = ['木', '火', '土', '金', '水'];

type RelationType = 'generating' | 'overcoming' | 'same' | 'none';

interface RelationInfo {
  type: RelationType;
  description: string;
  arrow: string;
}

// 分析兩個五行之間的關係
const analyzeRelation = (from: string, to: string): RelationInfo => {
  if (from === to) {
    return { type: 'same', description: '比和', arrow: '=' };
  }
  if (GENERATING_CYCLE[from] === to) {
    return { type: 'generating', description: `${from}生${to}`, arrow: '→' };
  }
  if (GENERATING_CYCLE[to] === from) {
    return { type: 'generating', description: `${to}生${from}`, arrow: '←' };
  }
  if (OVERCOMING_CYCLE[from] === to) {
    return { type: 'overcoming', description: `${from}剋${to}`, arrow: '⊸' };
  }
  if (OVERCOMING_CYCLE[to] === from) {
    return { type: 'overcoming', description: `${to}剋${from}`, arrow: '⊷' };
  }
  return { type: 'none', description: '', arrow: '' };
};

export const WuxingRelationshipDiagram = ({ pillars }: WuxingRelationshipDiagramProps) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  // 計算各柱五行
  const pillarWuxing = useMemo(() => ({
    year: { stem: WUXING_MAP[pillars.year.stem], branch: WUXING_MAP[pillars.year.branch] },
    month: { stem: WUXING_MAP[pillars.month.stem], branch: WUXING_MAP[pillars.month.branch] },
    day: { stem: WUXING_MAP[pillars.day.stem], branch: WUXING_MAP[pillars.day.branch] },
    hour: { stem: WUXING_MAP[pillars.hour.stem], branch: WUXING_MAP[pillars.hour.branch] },
  }), [pillars]);

  // 柱位順序（從左到右：時日月年）
  const pillarOrder: Array<'hour' | 'day' | 'month' | 'year'> = ['hour', 'day', 'month', 'year'];
  const pillarNames = { hour: '時柱', day: '日柱', month: '月柱', year: '年柱' };

  // 計算相鄰柱之間的關係
  const relations = useMemo(() => {
    const result: Array<{
      from: string;
      to: string;
      stemRelation: RelationInfo;
      branchRelation: RelationInfo;
    }> = [];

    for (let i = 0; i < pillarOrder.length - 1; i++) {
      const fromPillar = pillarOrder[i];
      const toPillar = pillarOrder[i + 1];
      result.push({
        from: pillarNames[fromPillar],
        to: pillarNames[toPillar],
        stemRelation: analyzeRelation(pillarWuxing[fromPillar].stem, pillarWuxing[toPillar].stem),
        branchRelation: analyzeRelation(pillarWuxing[fromPillar].branch, pillarWuxing[toPillar].branch),
      });
    }
    return result;
  }, [pillarWuxing]);

  // 關係類型對應的顏色
  const getRelationStyle = (type: RelationType) => {
    switch (type) {
      case 'generating':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
      case 'overcoming':
        return 'text-red-400 bg-red-500/20 border-red-500/40';
      case 'same':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      default:
        return 'text-stone-400 bg-stone-500/20 border-stone-500/40';
    }
  };

  // 獲取懸停時的相關元素
  const getRelatedElements = (element: string) => {
    return {
      generates: GENERATING_CYCLE[element],
      generatedBy: WUXING_ORDER.find(e => GENERATING_CYCLE[e] === element),
      overcomes: OVERCOMING_CYCLE[element],
      overcomedBy: WUXING_ORDER.find(e => OVERCOMING_CYCLE[e] === element),
    };
  };

  // 判斷元素是否與懸停元素相關
  const isRelated = (element: string) => {
    if (!hoveredElement) return false;
    const related = getRelatedElements(hoveredElement);
    return element === related.generates || 
           element === related.generatedBy ||
           element === related.overcomes ||
           element === related.overcomedBy;
  };

  // 判斷是否為生或剋的目標
  const getRelationType = (element: string): 'generates' | 'generatedBy' | 'overcomes' | 'overcomedBy' | null => {
    if (!hoveredElement) return null;
    const related = getRelatedElements(hoveredElement);
    if (element === related.generates) return 'generates';
    if (element === related.generatedBy) return 'generatedBy';
    if (element === related.overcomes) return 'overcomes';
    if (element === related.overcomedBy) return 'overcomedBy';
    return null;
  };

  return (
    <div className="relative p-4 rounded-lg bg-gradient-to-b from-indigo-950/80 to-indigo-900/60 border border-indigo-500/30">
      {/* CSS 動畫樣式 */}
      <style>{`
        @keyframes flowPulse {
          0%, 100% { stroke-dashoffset: 0; opacity: 0.6; }
          50% { stroke-dashoffset: -20; opacity: 1; }
        }
        @keyframes flowGlow {
          0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
          50% { filter: drop-shadow(0 0 8px currentColor); }
        }
        @keyframes elementPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 rgba(255,255,255,0); }
          50% { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 20px rgba(255,255,255,0.3); }
        }
        @keyframes particleFlow {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        .flow-active {
          animation: flowPulse 1.5s ease-in-out infinite, flowGlow 1.5s ease-in-out infinite;
        }
        .element-pulse {
          animation: elementPulse 1s ease-in-out infinite;
        }
        .particle-flow {
          stroke-dasharray: 5, 15;
          animation: particleFlow 1s linear infinite;
        }
        .relation-highlight {
          transition: all 0.3s ease;
        }
        .relation-highlight.active-gen {
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
        }
        .relation-highlight.active-over {
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
        }
      `}</style>

      {/* 標題 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-indigo-400/60" />
        <span className="text-sm font-bold text-indigo-300 tracking-widest">
          五 行 生 剋 關 係
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-indigo-400/60" />
      </div>

      {/* 五行相生相剋圖示說明 */}
      <div className="flex justify-center gap-4 mb-4 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">→</span>
          <span className="text-stone-400">相生</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50 flex items-center justify-center text-red-400">⊸</span>
          <span className="text-stone-400">相剋</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500/50 flex items-center justify-center text-blue-400">=</span>
          <span className="text-stone-400">比和</span>
        </div>
      </div>

      {/* 主體圖示區 */}
      <div className="grid grid-cols-7 gap-1 items-center">
        {pillarOrder.map((pillar, index) => (
          <React.Fragment key={pillar}>
            {/* 柱位顯示 */}
            <div key={pillar} className="text-center">
              <div className="text-[10px] text-indigo-300/70 mb-1">{pillarNames[pillar]}</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1">
                      {/* 天干五行 */}
                      <div className={`mx-auto w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${WUXING_COLORS[pillarWuxing[pillar].stem].border} ${WUXING_COLORS[pillarWuxing[pillar].stem].bg} hover:scale-110 hover:shadow-lg`}>
                        <span className={`text-lg font-bold ${WUXING_COLORS[pillarWuxing[pillar].stem].text}`}>
                          {pillarWuxing[pillar].stem}
                        </span>
                      </div>
                      {/* 地支五行 */}
                      <div className={`mx-auto w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${WUXING_COLORS[pillarWuxing[pillar].branch].border} ${WUXING_COLORS[pillarWuxing[pillar].branch].bg} hover:scale-110 hover:shadow-lg`}>
                        <span className={`text-lg font-bold ${WUXING_COLORS[pillarWuxing[pillar].branch].text}`}>
                          {pillarWuxing[pillar].branch}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-stone-900 border-stone-700">
                    <div className="text-xs text-stone-200">
                      <div>天干：{pillars[pillar].stem} ({pillarWuxing[pillar].stem})</div>
                      <div>地支：{pillars[pillar].branch} ({pillarWuxing[pillar].branch})</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* 關係箭頭 */}
            {index < pillarOrder.length - 1 && (
              <div key={`relation-${index}`} className="flex flex-col items-center justify-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`px-2 py-1 rounded text-xs font-bold border transition-all duration-300 hover:scale-110 ${getRelationStyle(relations[index].stemRelation.type)} ${relations[index].stemRelation.type === 'generating' ? 'hover:shadow-emerald-500/50 hover:shadow-lg' : relations[index].stemRelation.type === 'overcoming' ? 'hover:shadow-red-500/50 hover:shadow-lg' : 'hover:shadow-blue-500/50 hover:shadow-lg'}`}>
                        {relations[index].stemRelation.arrow || '—'}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-stone-900 border-stone-700">
                      <div className="text-xs text-stone-200">
                        <div className="font-bold mb-1">天干關係</div>
                        <div>{relations[index].stemRelation.description || '無特殊關係'}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`px-2 py-1 rounded text-xs font-bold border transition-all duration-300 hover:scale-110 ${getRelationStyle(relations[index].branchRelation.type)} ${relations[index].branchRelation.type === 'generating' ? 'hover:shadow-emerald-500/50 hover:shadow-lg' : relations[index].branchRelation.type === 'overcoming' ? 'hover:shadow-red-500/50 hover:shadow-lg' : 'hover:shadow-blue-500/50 hover:shadow-lg'}`}>
                        {relations[index].branchRelation.arrow || '—'}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-stone-900 border-stone-700">
                      <div className="text-xs text-stone-200">
                        <div className="font-bold mb-1">地支關係</div>
                        <div>{relations[index].branchRelation.description || '無特殊關係'}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 五行循環圖 */}
      <div className="mt-6 pt-4 border-t border-indigo-500/30">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] text-indigo-300/70">五行相生相剋循環（懸停查看關係）</span>
        </div>
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            {/* 相生箭頭（外圈綠色） */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
              <defs>
                <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
                </marker>
                <marker id="arrowGreenActive" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#4ade80" />
                </marker>
                <linearGradient id="flowGradientGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0" />
                  <stop offset="50%" stopColor="#4ade80" stopOpacity="1" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* 相生：木→火→土→金→水→木 */}
              {[0, 1, 2, 3, 4].map((i) => {
                const fromElement = WUXING_ORDER[i];
                const toElement = WUXING_ORDER[(i + 1) % 5];
                const angle1 = (i * 72 - 90) * (Math.PI / 180);
                const angle2 = ((i + 1) * 72 - 90) * (Math.PI / 180);
                const r1 = 80;
                const r2 = 80;
                const x1 = 96 + Math.cos(angle1) * r1;
                const y1 = 96 + Math.sin(angle1) * r1;
                const x2 = 96 + Math.cos(angle2) * r2;
                const y2 = 96 + Math.sin(angle2) * r2;
                const midAngle = ((i * 72 + (i + 1) * 72) / 2 - 90) * (Math.PI / 180);
                const cx = 96 + Math.cos(midAngle) * 95;
                const cy = 96 + Math.sin(midAngle) * 95;
                
                const isActiveGen = hoveredElement === fromElement;
                const isActiveReceive = hoveredElement === toElement;
                const isActive = isActiveGen || isActiveReceive;
                
                return (
                  <g key={`gen-${i}`}>
                    <path
                      d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`}
                      fill="none"
                      stroke={isActive ? "#4ade80" : "#22c55e"}
                      strokeWidth={isActive ? "3" : "1.5"}
                      strokeOpacity={isActive ? "1" : "0.6"}
                      markerEnd={isActive ? "url(#arrowGreenActive)" : "url(#arrowGreen)"}
                      className={isActive ? "flow-active" : "transition-all duration-300"}
                    />
                    {isActive && (
                      <path
                        d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`}
                        fill="none"
                        stroke="#4ade80"
                        strokeWidth="2"
                        className="particle-flow"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 相剋箭頭（內圈紅色） */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
              <defs>
                <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
                </marker>
                <marker id="arrowRedActive" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#f87171" />
                </marker>
              </defs>
              {/* 相剋：木→土→水→火→金→木 (跳兩個) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const fromElement = WUXING_ORDER[i];
                const toElement = WUXING_ORDER[(i + 2) % 5];
                const angle1 = (i * 72 - 90) * (Math.PI / 180);
                const angle2 = ((i + 2) * 72 - 90) * (Math.PI / 180);
                const r = 50;
                const x1 = 96 + Math.cos(angle1) * r;
                const y1 = 96 + Math.sin(angle1) * r;
                const x2 = 96 + Math.cos(angle2) * r;
                const y2 = 96 + Math.sin(angle2) * r;
                
                const isActiveOver = hoveredElement === fromElement;
                const isActiveReceive = hoveredElement === toElement;
                const isActive = isActiveOver || isActiveReceive;
                
                return (
                  <g key={`over-${i}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isActive ? "#f87171" : "#ef4444"}
                      strokeWidth={isActive ? "2.5" : "1"}
                      strokeOpacity={isActive ? "1" : "0.5"}
                      strokeDasharray={isActive ? "none" : "3,2"}
                      markerEnd={isActive ? "url(#arrowRedActive)" : "url(#arrowRed)"}
                      className={isActive ? "flow-active" : "transition-all duration-300"}
                    />
                    {isActive && (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#f87171"
                        strokeWidth="2"
                        className="particle-flow"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 五行環形排列 */}
            {(['木', '火', '土', '金', '水'] as const).map((element, i) => {
              const angle = (i * 72 - 90) * (Math.PI / 180);
              const radius = 70;
              const x = 96 + Math.cos(angle) * radius;
              const y = 96 + Math.sin(angle) * radius;
              const colors = WUXING_COLORS[element];
              const isHovered = hoveredElement === element;
              const relationType = getRelationType(element);
              
              return (
                <TooltipProvider key={element}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${colors.bg} ${colors.border} ${colors.glow} ${isHovered ? 'element-pulse scale-125 z-10' : ''} ${relationType === 'generates' || relationType === 'generatedBy' ? 'relation-highlight active-gen ring-2 ring-emerald-400' : ''} ${relationType === 'overcomes' || relationType === 'overcomedBy' ? 'relation-highlight active-over ring-2 ring-red-400' : ''}`}
                        style={{ left: x, top: y }}
                        onMouseEnter={() => setHoveredElement(element)}
                        onMouseLeave={() => setHoveredElement(null)}
                      >
                        <span className={`text-xl font-bold ${colors.text}`}>{element}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-stone-900 border-stone-700">
                      <div className="text-xs text-stone-200 space-y-1">
                        <div className={`font-bold ${colors.text}`}>{element}</div>
                        <div className="text-emerald-400">生：{GENERATING_CYCLE[element]}（我生）</div>
                        <div className="text-emerald-300">被生：{WUXING_ORDER.find(e => GENERATING_CYCLE[e] === element)}（生我）</div>
                        <div className="text-red-400">剋：{OVERCOMING_CYCLE[element]}（我剋）</div>
                        <div className="text-red-300">被剋：{WUXING_ORDER.find(e => OVERCOMING_CYCLE[e] === element)}（剋我）</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}

            {/* 中心標籤 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-[10px] text-indigo-300/70">
                {hoveredElement ? (
                  <span className={WUXING_COLORS[hoveredElement].text}>{hoveredElement}</span>
                ) : '相生相剋'}
              </div>
            </div>
          </div>
        </div>

        {/* 圖例說明 */}
        <div className="flex justify-center gap-6 mt-3 text-[10px] text-stone-400">
          <div className="flex items-center gap-1">
            <div className="w-4 h-px bg-emerald-500"></div>
            <span>相生（順時針）</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-px bg-red-500 border-dashed" style={{ borderStyle: 'dashed' }}></div>
            <span>相剋（五角星）</span>
          </div>
        </div>
      </div>
    </div>
  );
};