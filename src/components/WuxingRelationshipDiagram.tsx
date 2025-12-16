import { useMemo } from "react";
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
const WUXING_COLORS: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  '木': { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/30' },
  '火': { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', glow: 'shadow-red-500/30' },
  '土': { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50', glow: 'shadow-amber-500/30' },
  '金': { text: 'text-slate-300', bg: 'bg-slate-400/20', border: 'border-slate-400/50', glow: 'shadow-slate-400/30' },
  '水': { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50', glow: 'shadow-blue-500/30' },
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

// 五行符號
const WUXING_SYMBOLS: Record<string, string> = {
  '木': '☵',
  '火': '☲',
  '土': '☷',
  '金': '☰',
  '水': '☱',
};

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

  return (
    <div className="relative p-4 rounded-lg bg-gradient-to-b from-indigo-950/80 to-indigo-900/60 border border-indigo-500/30">
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
          <>
            {/* 柱位顯示 */}
            <div key={pillar} className="text-center">
              <div className="text-[10px] text-indigo-300/70 mb-1">{pillarNames[pillar]}</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="space-y-1">
                      {/* 天干五行 */}
                      <div className={`mx-auto w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center ${WUXING_COLORS[pillarWuxing[pillar].stem].border} ${WUXING_COLORS[pillarWuxing[pillar].stem].bg}`}>
                        <span className={`text-lg font-bold ${WUXING_COLORS[pillarWuxing[pillar].stem].text}`}>
                          {pillarWuxing[pillar].stem}
                        </span>
                      </div>
                      {/* 地支五行 */}
                      <div className={`mx-auto w-10 h-10 rounded-lg border-2 flex flex-col items-center justify-center ${WUXING_COLORS[pillarWuxing[pillar].branch].border} ${WUXING_COLORS[pillarWuxing[pillar].branch].bg}`}>
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
                      <div className={`px-2 py-1 rounded text-xs font-bold border ${getRelationStyle(relations[index].stemRelation.type)}`}>
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
                      <div className={`px-2 py-1 rounded text-xs font-bold border ${getRelationStyle(relations[index].branchRelation.type)}`}>
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
          </>
        ))}
      </div>

      {/* 五行循環圖 */}
      <div className="mt-6 pt-4 border-t border-indigo-500/30">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-[10px] text-indigo-300/70">五行相生相剋循環</span>
        </div>
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            {/* 五行環形排列 */}
            {(['木', '火', '土', '金', '水'] as const).map((element, i) => {
              const angle = (i * 72 - 90) * (Math.PI / 180); // 從頂部開始，順時針
              const radius = 70;
              const x = 96 + Math.cos(angle) * radius;
              const y = 96 + Math.sin(angle) * radius;
              const colors = WUXING_COLORS[element];
              
              return (
                <TooltipProvider key={element}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:shadow-lg ${colors.bg} ${colors.border} ${colors.glow}`}
                        style={{ left: x, top: y }}
                      >
                        <span className={`text-xl font-bold ${colors.text}`}>{element}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-stone-900 border-stone-700">
                      <div className="text-xs text-stone-200 space-y-1">
                        <div className={`font-bold ${colors.text}`}>{element}</div>
                        <div>生：{GENERATING_CYCLE[element]}</div>
                        <div>剋：{OVERCOMING_CYCLE[element]}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}

            {/* 相生箭頭（外圈綠色） */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
              <defs>
                <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e" />
                </marker>
              </defs>
              {/* 相生：木→火→土→金→水→木 */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle1 = (i * 72 - 90) * (Math.PI / 180);
                const angle2 = ((i + 1) * 72 - 90) * (Math.PI / 180);
                const r1 = 80; // 外圈
                const r2 = 80;
                const x1 = 96 + Math.cos(angle1) * r1;
                const y1 = 96 + Math.sin(angle1) * r1;
                const x2 = 96 + Math.cos(angle2) * r2;
                const y2 = 96 + Math.sin(angle2) * r2;
                // 控制點，用於弧形
                const midAngle = ((i * 72 + (i + 1) * 72) / 2 - 90) * (Math.PI / 180);
                const cx = 96 + Math.cos(midAngle) * 95;
                const cy = 96 + Math.sin(midAngle) * 95;
                
                return (
                  <path
                    key={`gen-${i}`}
                    d={`M${x1},${y1} Q${cx},${cy} ${x2},${y2}`}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    markerEnd="url(#arrowGreen)"
                  />
                );
              })}
            </svg>

            {/* 相剋箭頭（內圈紅色） */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
              <defs>
                <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
                </marker>
              </defs>
              {/* 相剋：木→土→水→火→金→木 (跳兩個) */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle1 = (i * 72 - 90) * (Math.PI / 180);
                const angle2 = ((i + 2) * 72 - 90) * (Math.PI / 180);
                const r = 50; // 內圈
                const x1 = 96 + Math.cos(angle1) * r;
                const y1 = 96 + Math.sin(angle1) * r;
                const x2 = 96 + Math.cos(angle2) * r;
                const y2 = 96 + Math.sin(angle2) * r;
                
                return (
                  <line
                    key={`over-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#ef4444"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                    strokeDasharray="3,2"
                    markerEnd="url(#arrowRed)"
                  />
                );
              })}
            </svg>

            {/* 中心標籤 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-[10px] text-indigo-300/70">相生相剋</div>
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
