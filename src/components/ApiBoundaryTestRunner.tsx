/**
 * API 邊界測試組件
 * 調用 calculate-bazi edge function 進行邊界測試，
 * 並與本地 Strict Mode 引擎結果進行對比
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Server, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calculateBaziStrict, type BirthLocalInput } from "@/lib/bazi";
import { cn } from "@/lib/utils";

// ============================================
// 測試案例定義
// ============================================

interface ApiTestCase {
  id: string;
  name: string;
  description: string;
  category: "standard" | "solar_term" | "zi_hour" | "month_boundary";
  input: {
    name: string;        // Required by edge function
    gender: "male" | "female";  // Required by edge function
    birthDate: string;   // YYYY-MM-DD
    birthTime: string;   // HH:MM
    location?: string;
    useSolarTime?: boolean;
    timezoneOffsetMinutes?: number;
  };
  localInput: BirthLocalInput;
  notes?: string;
}

// 標準測試案例（API 格式）
const API_TEST_CASES: ApiTestCase[] = [
  {
    id: "std-2000-01-01",
    name: "2000年元旦",
    description: "2000-01-01 12:00 台北",
    category: "standard",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "2000-01-01",
      birthTime: "12:00",
      timezoneOffsetMinutes: 480,
      location: "台北"
    },
    localInput: {
      year: 2000, month: 1, day: 1, hour: 12, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "大雪(1999-12-07)後、小寒(2000-01-06)前 → 子月 → 丙子"
  },
  {
    id: "std-1990-05-15",
    name: "1990年中期",
    description: "1990-05-15 21:00 台北",
    category: "standard",
    input: {
      name: "測試用戶",
      gender: "female",
      birthDate: "1990-05-15",
      birthTime: "21:00",
      timezoneOffsetMinutes: 480,
      location: "台北"
    },
    localInput: {
      year: 1990, month: 5, day: 15, hour: 21, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "立夏(5月5日)後、芒種(6月6日)前 → 巳月"
  },
  {
    id: "std-1985-10-06",
    name: "1985年日柱驗證",
    description: "1985-10-06 12:00（規格書戊寅日）",
    category: "standard",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "1985-10-06",
      birthTime: "12:00",
      timezoneOffsetMinutes: 480
    },
    localInput: {
      year: 1985, month: 10, day: 6, hour: 12, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "日柱應為戊寅（錨點驗證）"
  },
  // 節氣邊界測試 (2024立春精確時間: 16:26:53 北京時間)
  {
    id: "lichun-2024-before",
    name: "2024立春前1分鐘",
    description: "2024-02-04 16:25 北京時間（立春16:26:53前）",
    category: "solar_term",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "2024-02-04",
      birthTime: "16:25",
      timezoneOffsetMinutes: 480
    },
    localInput: {
      year: 2024, month: 2, day: 4, hour: 16, minute: 25, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "立春16:26:53前，應為癸卯年、丙寅月"
  },
  {
    id: "lichun-2024-after",
    name: "2024立春後1分鐘",
    description: "2024-02-04 16:28 北京時間（立春16:26:53後）",
    category: "solar_term",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "2024-02-04",
      birthTime: "16:28",
      timezoneOffsetMinutes: 480
    },
    localInput: {
      year: 2024, month: 2, day: 4, hour: 16, minute: 28, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "立春16:26:53後，應為甲辰年、丙寅月"
  },
  // 子時測試
  {
    id: "zi-hour-23-00",
    name: "子時起點 23:00",
    description: "2024-06-15 23:00",
    category: "zi_hour",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "2024-06-15",
      birthTime: "23:00",
      timezoneOffsetMinutes: 480
    },
    localInput: {
      year: 2024, month: 6, day: 15, hour: 23, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "23:00 應為子時，早子時模式日柱應為次日"
  },
  {
    id: "zi-hour-22-59",
    name: "亥時末 22:59",
    description: "2024-06-15 22:59",
    category: "zi_hour",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "2024-06-15",
      birthTime: "22:59",
      timezoneOffsetMinutes: 480
    },
    localInput: {
      year: 2024, month: 6, day: 15, hour: 22, minute: 59, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "22:59 應為亥時"
  },
  // 月份邊界
  {
    id: "month-xiaoxue-before",
    name: "大雪前(子月前)",
    description: "1999-12-06 12:00（大雪12-07前）",
    category: "month_boundary",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "1999-12-06",
      birthTime: "12:00",
      timezoneOffsetMinutes: 480
    },
    localInput: {
      year: 1999, month: 12, day: 6, hour: 12, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "大雪前應為亥月"
  },
  {
    id: "month-xiaoxue-after",
    name: "大雪後(子月始)",
    description: "1999-12-08 12:00（大雪12-07後）",
    category: "month_boundary",
    input: {
      name: "測試用戶",
      gender: "male",
      birthDate: "1999-12-08",
      birthTime: "12:00",
      timezoneOffsetMinutes: 480
    },
    localInput: {
      year: 1999, month: 12, day: 8, hour: 12, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    notes: "大雪後應為子月"
  }
];

// ============================================
// 測試結果類型
// ============================================

interface PillarResult {
  stem: string;
  branch: string;
}

interface ApiTestResult extends ApiTestCase {
  apiResult?: {
    year: PillarResult;
    month: PillarResult;
    day: PillarResult;
    hour: PillarResult;
  };
  localResult?: {
    year: PillarResult;
    month: PillarResult;
    day: PillarResult;
    hour: PillarResult;
  };
  match: boolean;
  details: {
    yearMatch: boolean;
    monthMatch: boolean;
    dayMatch: boolean;
    hourMatch: boolean;
  };
  error?: string;
}

// ============================================
// 組件
// ============================================

export function ApiBoundaryTestRunner() {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const runApiTest = async (testCase: ApiTestCase): Promise<ApiTestResult> => {
    try {
      // 調用 API
      const { data, error } = await supabase.functions.invoke("calculate-bazi", {
        body: testCase.input
      });

      if (error) {
        throw new Error(`API Error: ${error.message}`);
      }

      // 調用本地引擎
      const localResult = calculateBaziStrict(testCase.localInput, false);

      // 解析 API 回應 - 支援嵌套結構
      const pillars = data.calculation?.pillars || data.pillars || {
        year: { stem: data.yearStem, branch: data.yearBranch },
        month: { stem: data.monthStem, branch: data.monthBranch },
        day: { stem: data.dayStem, branch: data.dayBranch },
        hour: { stem: data.hourStem, branch: data.hourBranch }
      };

      const apiPillars = {
        year: { stem: pillars.year?.stem, branch: pillars.year?.branch },
        month: { stem: pillars.month?.stem, branch: pillars.month?.branch },
        day: { stem: pillars.day?.stem, branch: pillars.day?.branch },
        hour: { stem: pillars.hour?.stem, branch: pillars.hour?.branch }
      };

      const localPillars = {
        year: localResult.pillars.year,
        month: localResult.pillars.month,
        day: localResult.pillars.day,
        hour: localResult.pillars.hour
      };

      const details = {
        yearMatch: 
          apiPillars.year.stem === localPillars.year.stem &&
          apiPillars.year.branch === localPillars.year.branch,
        monthMatch: 
          apiPillars.month.stem === localPillars.month.stem &&
          apiPillars.month.branch === localPillars.month.branch,
        dayMatch: 
          apiPillars.day.stem === localPillars.day.stem &&
          apiPillars.day.branch === localPillars.day.branch,
        hourMatch: 
          apiPillars.hour.stem === localPillars.hour.stem &&
          apiPillars.hour.branch === localPillars.hour.branch
      };

      return {
        ...testCase,
        apiResult: apiPillars,
        localResult: localPillars,
        match: details.yearMatch && details.monthMatch && details.dayMatch && details.hourMatch,
        details
      };
    } catch (err) {
      return {
        ...testCase,
        match: false,
        details: {
          yearMatch: false,
          monthMatch: false,
          dayMatch: false,
          hourMatch: false
        },
        error: err instanceof Error ? err.message : "未知錯誤"
      };
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    const testResults: ApiTestResult[] = [];

    for (const testCase of API_TEST_CASES) {
      const result = await runApiTest(testCase);
      testResults.push(result);
      // 給 UI 一點時間更新
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const filterResults = (category?: string) => {
    if (!category || category === "all") return results;
    return results.filter(r => r.category === category);
  };

  const getCategoryStats = (category: string) => {
    const filtered = filterResults(category);
    const matched = filtered.filter(r => r.match).length;
    const failed = filtered.filter(r => !r.match && !r.error).length;
    const errored = filtered.filter(r => !!r.error).length;
    return { total: filtered.length, matched, failed, errored };
  };

  const renderPillarCell = (
    apiPillar?: PillarResult, 
    localPillar?: PillarResult, 
    matches?: boolean
  ) => {
    if (!apiPillar || !localPillar) {
      return <span className="text-muted-foreground">—</span>;
    }
    
    return (
      <div className="space-y-1">
        <div className={cn(
          "font-mono font-medium",
          matches ? "text-emerald-600" : "text-destructive"
        )}>
          API: {apiPillar.stem}{apiPillar.branch}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          本地: {localPillar.stem}{localPillar.branch}
        </div>
      </div>
    );
  };

  const renderResults = (testResults: ApiTestResult[]) => (
    <ScrollArea className="h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">測試案例</TableHead>
            <TableHead>年柱</TableHead>
            <TableHead>月柱</TableHead>
            <TableHead>日柱</TableHead>
            <TableHead>時柱</TableHead>
            <TableHead className="text-right">狀態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testResults.map((result) => (
            <TableRow key={result.id} className={cn(
              result.error && "bg-destructive/10",
              !result.match && !result.error && "bg-amber-500/10"
            )}>
              <TableCell>
                <div>
                  <div className="font-semibold">{result.name}</div>
                  <div className="text-xs text-muted-foreground">{result.description}</div>
                  {result.notes && (
                    <div className="mt-1 text-xs text-primary/80 bg-primary/10 rounded px-2 py-0.5 inline-block">
                      {result.notes}
                    </div>
                  )}
                  {result.error && (
                    <div className="mt-1 text-xs text-destructive bg-destructive/10 rounded px-2 py-0.5">
                      {result.error}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {renderPillarCell(result.apiResult?.year, result.localResult?.year, result.details.yearMatch)}
              </TableCell>
              <TableCell>
                {renderPillarCell(result.apiResult?.month, result.localResult?.month, result.details.monthMatch)}
              </TableCell>
              <TableCell>
                {renderPillarCell(result.apiResult?.day, result.localResult?.day, result.details.dayMatch)}
              </TableCell>
              <TableCell>
                {renderPillarCell(result.apiResult?.hour, result.localResult?.hour, result.details.hourMatch)}
              </TableCell>
              <TableCell className="text-right">
                {result.error ? (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    錯誤
                  </Badge>
                ) : result.match ? (
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    一致
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    不一致
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );

  const stats = getCategoryStats("all");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          API 邊界測試（Edge Function vs 本地引擎）
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          調用 calculate-bazi edge function 並與本地 Strict Mode 引擎結果進行對比驗證
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isRunning} className="w-full" size="lg">
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              執行 API 測試中...
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4 mr-2" />
              執行 API 邊界測試 ({API_TEST_CASES.length} 個案例)
            </>
          )}
        </Button>

        {results.length > 0 && (
          <>
            {/* 統計摘要 */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3 bg-muted/30">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">總測試數</div>
              </Card>
              <Card className="p-3 bg-emerald-500/10">
                <div className="text-2xl font-bold text-emerald-600">{stats.matched}</div>
                <div className="text-xs text-muted-foreground">API/本地一致</div>
              </Card>
              <Card className="p-3 bg-amber-500/10">
                <div className="text-2xl font-bold text-amber-600">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">結果不一致</div>
              </Card>
              <Card className="p-3 bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">{stats.errored}</div>
                <div className="text-xs text-muted-foreground">API 錯誤</div>
              </Card>
            </div>

            {/* 分類標籤 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="standard">標準</TabsTrigger>
                <TabsTrigger value="solar_term">節氣</TabsTrigger>
                <TabsTrigger value="zi_hour">子時</TabsTrigger>
                <TabsTrigger value="month_boundary">月份</TabsTrigger>
              </TabsList>
              <TabsContent value="all">{renderResults(results)}</TabsContent>
              <TabsContent value="standard">{renderResults(filterResults("standard"))}</TabsContent>
              <TabsContent value="solar_term">{renderResults(filterResults("solar_term"))}</TabsContent>
              <TabsContent value="zi_hour">{renderResults(filterResults("zi_hour"))}</TabsContent>
              <TabsContent value="month_boundary">{renderResults(filterResults("month_boundary"))}</TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
