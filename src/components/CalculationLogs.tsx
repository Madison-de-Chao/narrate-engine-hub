/**
 * 計算日誌顯示組件
 * 顯示八字計算的詳細過程，方便用戶理解推算邏輯
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, FileText, Calculator, Calendar, Clock, Sparkles } from "lucide-react";
import type { CalculationLogs } from "@/lib/baziCalculator";

interface CalculationLogsProps {
  logs?: CalculationLogs;
  className?: string;
}

interface LogSectionProps {
  title: string;
  icon: React.ReactNode;
  logs: string[];
  color: string;
  defaultOpen?: boolean;
}

const LogSection = ({ title, icon, logs, color, defaultOpen = false }: LogSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (logs.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-between p-3 h-auto hover:bg-${color}/10`}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
            <Badge variant="secondary" className="ml-2">
              {logs.length} 條
            </Badge>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-3 space-y-1">
          {logs.map((log, index) => (
            <div
              key={index}
              className="text-sm text-muted-foreground pl-6 py-1 border-l-2 border-border/50 hover:border-primary/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground/60 mr-2">
                {String(index + 1).padStart(2, '0')}.
              </span>
              {log}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export function CalculationLogs({ logs, className = "" }: CalculationLogsProps) {
  const [showAll, setShowAll] = useState(false);

  if (!logs) {
    return null;
  }

  const hasLogs = 
    logs.year_log.length > 0 ||
    logs.month_log.length > 0 ||
    logs.day_log.length > 0 ||
    logs.hour_log.length > 0 ||
    logs.solar_terms_log.length > 0 ||
    logs.five_elements_log.length > 0;

  if (!hasLogs) {
    return null;
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            計算日誌
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "收起全部" : "展開全部"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          八字推算的詳細計算過程，包含立春分界、節氣判斷、五虎遁、五鼠遁等傳統命理計算邏輯
        </p>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        <LogSection
          title="年柱計算"
          icon={<Calendar className="h-4 w-4 text-amber-500" />}
          logs={logs.year_log}
          color="amber"
          defaultOpen={showAll}
        />
        <LogSection
          title="月柱計算"
          icon={<Calendar className="h-4 w-4 text-emerald-500" />}
          logs={logs.month_log}
          color="emerald"
          defaultOpen={showAll}
        />
        <LogSection
          title="日柱計算"
          icon={<Calculator className="h-4 w-4 text-blue-500" />}
          logs={logs.day_log}
          color="blue"
          defaultOpen={showAll}
        />
        <LogSection
          title="時柱計算"
          icon={<Clock className="h-4 w-4 text-purple-500" />}
          logs={logs.hour_log}
          color="purple"
          defaultOpen={showAll}
        />
        <LogSection
          title="節氣判斷"
          icon={<Sparkles className="h-4 w-4 text-orange-500" />}
          logs={logs.solar_terms_log}
          color="orange"
          defaultOpen={showAll}
        />
        <LogSection
          title="五行統計"
          icon={<Sparkles className="h-4 w-4 text-cyan-500" />}
          logs={logs.five_elements_log}
          color="cyan"
          defaultOpen={showAll}
        />
      </CardContent>
    </Card>
  );
}
