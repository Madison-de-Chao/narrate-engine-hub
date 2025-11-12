import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BaziResult } from "@/pages/Index";

interface TraditionalBaziDisplayProps {
  baziResult: BaziResult;
}

export const TraditionalBaziDisplay = ({ baziResult }: TraditionalBaziDisplayProps) => {
  const { pillars, hiddenStems, tenGods, nayin, shensha } = baziResult;

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 card-glow">
      <h2 className="text-2xl font-bold text-foreground mb-6">傳統八字排盤</h2>
      
      <div className="space-y-6">
        {/* 四柱八字 */}
        <div className="grid grid-cols-4 gap-4">
          {["year", "month", "day", "hour"].map((pillar, index) => {
            const pillarData = pillars[pillar as keyof typeof pillars];
            const pillarNames = ["年柱", "月柱", "日柱", "時柱"];
            
            return (
              <div key={pillar} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{pillarNames[index]}</div>
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <div className="text-3xl font-bold text-primary mb-2">{pillarData.stem}</div>
                  <div className="text-3xl font-bold text-secondary">{pillarData.branch}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 藏干 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">藏干</h3>
          <div className="grid grid-cols-4 gap-4">
        {["year", "month", "day", "hour"].map((pillar) => {
              const stems = hiddenStems[pillar as keyof typeof hiddenStems] || [];
              return (
                <div key={pillar} className="bg-muted/20 rounded p-3 text-center">
                  <div className="flex justify-center gap-1">
                    {Array.isArray(stems) && stems.map((stem: string, idx: number) => (
                      <span key={idx} className="text-sm text-muted-foreground">
                        {stem}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 十神 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">十神</h3>
          <div className="grid grid-cols-4 gap-4">
            {["year", "month", "day", "hour"].map((pillar) => {
              const gods = tenGods[pillar as keyof typeof tenGods] || { stem: "", branch: "" };
              return (
                <div key={pillar} className="bg-muted/20 rounded p-3 text-center space-y-1">
                  <div className="text-sm text-accent">{gods.stem || "-"}</div>
                  <div className="text-sm text-secondary">{gods.branch || "-"}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 納音 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">納音五行</h3>
          <div className="grid grid-cols-4 gap-4">
            {["year", "month", "day", "hour"].map((pillar) => {
              const nayinValue = nayin[pillar as keyof typeof nayin] || "-";
              return (
                <div key={pillar} className="bg-muted/20 rounded p-3 text-center">
                  <div className="text-sm text-primary">{nayinValue}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 神煞 */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">神煞</h3>
          <div className="flex flex-wrap gap-2">
            {shensha.map((sha, index) => (
              <Badge key={index} variant="outline" className="bg-accent/20 text-accent border-accent/50">
                {sha}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
