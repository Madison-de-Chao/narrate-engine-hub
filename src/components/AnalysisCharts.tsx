import { Card } from "@/components/ui/card";
import { BaziResult } from "@/pages/Index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FourSeasonsCard } from "./FourSeasonsCard";

interface AnalysisChartsProps {
  baziResult: BaziResult;
}

export const AnalysisCharts = ({ baziResult }: AnalysisChartsProps) => {
  const { wuxing, yinyang, fourSeasonsTeam } = baziResult;

  // 計算五行百分比
  const totalWuxing = Object.values(wuxing).reduce((sum, val) => sum + val, 0);
  const wuxingPercent = {
    wood: (wuxing.wood / totalWuxing) * 100,
    fire: (wuxing.fire / totalWuxing) * 100,
    earth: (wuxing.earth / totalWuxing) * 100,
    metal: (wuxing.metal / totalWuxing) * 100,
    water: (wuxing.water / totalWuxing) * 100,
  };

  const wuxingData = [
    { name: "木", value: wuxing.wood, percent: wuxingPercent.wood, color: "bg-green-500", icon: "🌳" },
    { name: "火", value: wuxing.fire, percent: wuxingPercent.fire, color: "bg-red-500", icon: "🔥" },
    { name: "土", value: wuxing.earth, percent: wuxingPercent.earth, color: "bg-yellow-600", icon: "⛰️" },
    { name: "金", value: wuxing.metal, percent: wuxingPercent.metal, color: "bg-gray-400", icon: "⚔️" },
    { name: "水", value: wuxing.water, percent: wuxingPercent.water, color: "bg-blue-500", icon: "💧" },
  ];

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 card-glow">
      <h2 className="text-2xl font-bold text-foreground mb-6">詳細分析報告</h2>

      <Tabs defaultValue="fourseasons" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="fourseasons">四時軍團</TabsTrigger>
          <TabsTrigger value="balance">平衡度</TabsTrigger>
          <TabsTrigger value="influence">影響分析</TabsTrigger>
          <TabsTrigger value="suggestions">建議</TabsTrigger>
        </TabsList>

        {/* 四時軍團分析 */}
        <TabsContent value="fourseasons" className="mt-6">
          {fourSeasonsTeam ? (
            <FourSeasonsCard fourSeasonsTeam={fourSeasonsTeam} />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              四時軍團分析資料載入中...
            </Card>
          )}
        </TabsContent>

        {/* 平衡度分析 */}
        <TabsContent value="balance" className="space-y-6 mt-6">
          {/* 陰陽平衡 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">☯️ 陰陽平衡度</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground">陽</span>
                  <span className="text-sm text-primary font-semibold">{yinyang.yang}%</span>
                </div>
                <Progress value={yinyang.yang} className="h-3 bg-muted" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-foreground">陰</span>
                  <span className="text-sm text-secondary font-semibold">{yinyang.yin}%</span>
                </div>
                <Progress value={yinyang.yin} className="h-3 bg-muted" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {yinyang.yang > yinyang.yin
                ? "陽性能量較強，個性較為外向、主動、積極"
                : "陰性能量較強，個性較為內斂、穩重、深思"}
            </p>
          </div>

          {/* 五行平衡 */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">🌟 五行平衡度</h3>
            <div className="space-y-4">
              {wuxingData.map((element) => (
                <div key={element.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{element.icon}</span>
                      <span className="text-sm font-medium text-foreground">{element.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {element.value.toFixed(1)} ({element.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${element.color} transition-all duration-500`}
                      style={{ width: `${element.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 影響分析 */}
        <TabsContent value="influence" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "💭 內在個性", content: "穩重務實，具有強烈的責任感和執行力。善於規劃與組織，但有時過於保守。" },
              { title: "🎯 外在行事", content: "行事謹慎，注重細節。對人友善但保持適當距離，重視承諾與信用。" },
              { title: "💼 事業運勢", content: "適合需要耐心和穩定性的工作。建議從事管理、教育或專業技術領域。" },
              { title: "💖 愛情關係", content: "感情細膩但不輕易表達。需要時間建立信任，一旦投入則十分專一。" },
            ].map((item, index) => (
              <Card key={index} className="p-4 bg-muted/30 border-border/50">
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 建議 */}
        <TabsContent value="suggestions" className="space-y-4 mt-6">
          <Card className="p-4 bg-accent/10 border-accent/30">
            <h4 className="font-semibold text-accent mb-2">✨ 發展建議</h4>
            <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
              <li>加強木火能量，多接觸綠色植物和陽光</li>
              <li>培養創造力和表達能力，平衡過強的土性</li>
              <li>適度放鬆完美主義，學會接受不確定性</li>
              <li>發展人際網絡，擴展視野和機會</li>
            </ul>
          </Card>

          <Card className="p-4 bg-primary/10 border-primary/30">
            <h4 className="font-semibold text-primary mb-2">⚠️ 注意事項</h4>
            <ul className="text-sm text-foreground space-y-2 list-disc list-inside">
              <li>避免過度執著於細節而忽略大局</li>
              <li>注意健康，特別是脾胃和消化系統</li>
              <li>學會適時表達情緒，不要過度壓抑</li>
              <li>保持靈活性，適應環境變化</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
