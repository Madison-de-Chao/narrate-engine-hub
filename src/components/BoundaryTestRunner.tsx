/**
 * 八字計算引擎邊界測試組件
 * 針對節氣交界點（±1分鐘）和子時交界點進行自動化測試
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
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Clock, Calendar } from "lucide-react";
import { calculateBaziStrict, type BirthLocalInput } from "@/lib/bazi";
import { cn } from "@/lib/utils";

// ============================================
// 測試案例定義
// ============================================

interface BoundaryTestCase {
  id: string;
  name: string;
  description: string;
  category: "solar_term" | "zi_hour" | "day_boundary" | "solar_time";
  input: BirthLocalInput;
  expected: {
    yearStem?: string;
    yearBranch?: string;
    monthStem?: string;
    monthBranch?: string;
    dayStem?: string;
    dayBranch?: string;
    hourStem?: string;
    hourBranch?: string;
  };
  notes?: string;
}

// 節氣交界測試案例
const SOLAR_TERM_BOUNDARY_TESTS: BoundaryTestCase[] = [
  {
    id: "lichun-before-1min",
    name: "立春前1分鐘",
    description: "2024-02-04 17:26 (立春17:27前1分鐘，北京時間)",
    category: "solar_term",
    input: {
      year: 2024, month: 2, day: 4, hour: 17, minute: 26, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { yearBranch: "卯" }, // 癸卯年
    notes: "立春前應為癸卯年（資料：UTC 09:27 = 北京 17:27）"
  },
  {
    id: "lichun-exact",
    name: "立春當刻",
    description: "2024-02-04 17:27 (立春精確時刻，北京時間)",
    category: "solar_term",
    input: {
      year: 2024, month: 2, day: 4, hour: 17, minute: 27, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { yearBranch: "辰" }, // 甲辰年
    notes: "立春後應為甲辰年（資料：UTC 09:27 = 北京 17:27）"
  },
  {
    id: "lichun-after-1min",
    name: "立春後1分鐘",
    description: "2024-02-04 17:28 (立春後1分鐘，北京時間)",
    category: "solar_term",
    input: {
      year: 2024, month: 2, day: 4, hour: 17, minute: 28, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { yearBranch: "辰" }, // 甲辰年
    notes: "立春後應為甲辰年"
  },
  {
    id: "jingzhe-boundary",
    name: "驚蟄交界",
    description: "2024-03-05 12:23 (驚蟄時刻，北京時間：UTC 04:23 + 8hr)",
    category: "solar_term",
    input: {
      year: 2024, month: 3, day: 5, hour: 12, minute: 23, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { monthBranch: "卯" }, // 卯月
    notes: "驚蟄後應為卯月（資料：UTC 04:23 = 北京 12:23）"
  }
];

// 子時交界測試案例
const ZI_HOUR_BOUNDARY_TESTS: BoundaryTestCase[] = [
  {
    id: "zi-22-59",
    name: "22:59 亥時末",
    description: "測試22:59是否正確為亥時",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 15, hour: 22, minute: 59, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { hourBranch: "亥" },
    notes: "22:59 應為亥時"
  },
  {
    id: "zi-23-00",
    name: "23:00 子時始",
    description: "測試23:00是否正確為子時",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 15, hour: 23, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { hourBranch: "子" },
    notes: "23:00 應為子時"
  },
  {
    id: "zi-23-01",
    name: "23:01 子時",
    description: "測試23:01子時（早子時模式）",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 15, hour: 23, minute: 1, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { hourBranch: "子" },
    notes: "23:01 早子時模式，日柱應算次日"
  },
  {
    id: "zi-23-59",
    name: "23:59 子時末",
    description: "測試23:59子時邊界",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 15, hour: 23, minute: 59, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { hourBranch: "子" },
    notes: "23:59 仍為子時"
  },
  {
    id: "zi-00-01",
    name: "00:01 子時",
    description: "測試00:01是否仍為子時",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 16, hour: 0, minute: 1, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { hourBranch: "子" },
    notes: "00:01 仍為子時"
  },
  {
    id: "zi-00-59",
    name: "00:59 子時末",
    description: "測試00:59子時邊界",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 16, hour: 0, minute: 59, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { hourBranch: "子" },
    notes: "00:59 仍為子時"
  },
  {
    id: "zi-01-00",
    name: "01:00 丑時始",
    description: "測試01:00是否正確為丑時",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 16, hour: 1, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: { hourBranch: "丑" },
    notes: "01:00 應為丑時"
  },
  // 晚子時模式測試
  {
    id: "zi-late-23-01",
    name: "晚子時 23:01",
    description: "測試23:01晚子時模式",
    category: "zi_hour",
    input: {
      year: 2024, month: 6, day: 15, hour: 23, minute: 1, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "LATE"
    },
    expected: { hourBranch: "子" },
    notes: "23:01 晚子時模式，日柱仍為當日"
  }
];

// 日柱換日測試
const DAY_BOUNDARY_TESTS: BoundaryTestCase[] = [
  {
    id: "day-early-zi-change",
    name: "早子時換日",
    description: "23:30 早子時模式，日柱應為次日",
    category: "day_boundary",
    input: {
      year: 2024, month: 1, day: 1, hour: 23, minute: 30, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "EARLY"
    },
    expected: {}, // 僅驗證邏輯，需人工核對
    notes: "早子時23:30日柱應為1月2日的日柱"
  },
  {
    id: "day-late-zi-same",
    name: "晚子時不換日",
    description: "23:30 晚子時模式，日柱仍為當日",
    category: "day_boundary",
    input: {
      year: 2024, month: 1, day: 1, hour: 23, minute: 30, second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: "NONE",
      ziMode: "LATE"
    },
    expected: {},
    notes: "晚子時23:30日柱仍為1月1日的日柱"
  }
];

// 真太陽時測試
const SOLAR_TIME_TESTS: BoundaryTestCase[] = [
  {
    id: "tst-taipei",
    name: "台北真太陽時",
    description: "測試台北經度(121.5°)的真太陽時校正",
    category: "solar_time",
    input: {
      year: 2024, month: 6, day: 21, hour: 12, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      longitude: 121.5,
      solarTimeMode: "TST",
      ziMode: "EARLY"
    },
    expected: {},
    notes: "夏至日中午，真太陽時校正約+6分鐘"
  },
  {
    id: "tst-urumqi",
    name: "烏魯木齊真太陽時",
    description: "測試烏魯木齊經度(87.6°)的真太陽時校正",
    category: "solar_time",
    input: {
      year: 2024, month: 6, day: 21, hour: 14, minute: 0, second: 0,
      tzOffsetMinutesEast: 480,
      longitude: 87.6,
      solarTimeMode: "TST",
      ziMode: "EARLY"
    },
    expected: {},
    notes: "新疆與北京差約2小時，應校正為約12:00真太陽時"
  },
  {
    id: "tst-day-delta-forward",
    name: "真太陽時跨日(+1)",
    description: "測試真太陽時導致的跨日(往後)",
    category: "solar_time",
    input: {
      year: 2024, month: 6, day: 21, hour: 23, minute: 55, second: 0,
      tzOffsetMinutesEast: 480,
      longitude: 125, // 比標準經線更東
      solarTimeMode: "LMT",
      ziMode: "EARLY"
    },
    expected: {},
    notes: "23:55 + 20分鐘偏移 → 跨到次日00:15"
  }
];

const ALL_TESTS = [
  ...SOLAR_TERM_BOUNDARY_TESTS,
  ...ZI_HOUR_BOUNDARY_TESTS,
  ...DAY_BOUNDARY_TESTS,
  ...SOLAR_TIME_TESTS
];

// ============================================
// 測試執行結果
// ============================================

interface TestResult extends BoundaryTestCase {
  actual: {
    yearStem: string;
    yearBranch: string;
    monthStem: string;
    monthBranch: string;
    dayStem: string;
    dayBranch: string;
    hourStem: string;
    hourBranch: string;
    meta?: {
      solarAdjustedTime: string;
      dayDelta: number;
    };
  };
  passed: boolean;
  error?: string;
}

// ============================================
// 組件
// ============================================

export function BoundaryTestRunner() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const runTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    for (const testCase of ALL_TESTS) {
      try {
        const result = calculateBaziStrict(testCase.input, true);
        
        const actual = {
          yearStem: result.pillars.year.stem,
          yearBranch: result.pillars.year.branch,
          monthStem: result.pillars.month.stem,
          monthBranch: result.pillars.month.branch,
          dayStem: result.pillars.day.stem,
          dayBranch: result.pillars.day.branch,
          hourStem: result.pillars.hour.stem,
          hourBranch: result.pillars.hour.branch,
          meta: result.meta ? {
            solarAdjustedTime: result.meta.solarAdjustedTime,
            dayDelta: result.meta.dayDelta
          } : undefined
        };

        // 檢查預期值
        let passed = true;
        const expected = testCase.expected;
        
        if (expected.yearStem && actual.yearStem !== expected.yearStem) passed = false;
        if (expected.yearBranch && actual.yearBranch !== expected.yearBranch) passed = false;
        if (expected.monthStem && actual.monthStem !== expected.monthStem) passed = false;
        if (expected.monthBranch && actual.monthBranch !== expected.monthBranch) passed = false;
        if (expected.dayStem && actual.dayStem !== expected.dayStem) passed = false;
        if (expected.dayBranch && actual.dayBranch !== expected.dayBranch) passed = false;
        if (expected.hourStem && actual.hourStem !== expected.hourStem) passed = false;
        if (expected.hourBranch && actual.hourBranch !== expected.hourBranch) passed = false;

        // 如果沒有預期值，標記為需人工審核
        const hasExpected = Object.keys(expected).length > 0;

        testResults.push({
          ...testCase,
          actual,
          passed: hasExpected ? passed : true,
          error: hasExpected ? undefined : "需人工審核"
        });
      } catch (err) {
        testResults.push({
          ...testCase,
          actual: {
            yearStem: "", yearBranch: "",
            monthStem: "", monthBranch: "",
            dayStem: "", dayBranch: "",
            hourStem: "", hourBranch: ""
          },
          passed: false,
          error: err instanceof Error ? err.message : "未知錯誤"
        });
      }
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
    const passed = filtered.filter(r => r.passed && !r.error?.includes("人工")).length;
    const needReview = filtered.filter(r => r.error?.includes("人工")).length;
    const failed = filtered.filter(r => !r.passed && !r.error?.includes("人工")).length;
    return { total: filtered.length, passed, needReview, failed };
  };

  const renderResults = (testResults: TestResult[]) => (
    <ScrollArea className="h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">測試案例</TableHead>
            <TableHead>年柱</TableHead>
            <TableHead>月柱</TableHead>
            <TableHead>日柱</TableHead>
            <TableHead>時柱</TableHead>
            <TableHead>元數據</TableHead>
            <TableHead className="text-right">狀態</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testResults.map((result) => (
            <TableRow key={result.id} className={cn(
              result.error && !result.error.includes("人工") && "bg-destructive/10"
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
                </div>
              </TableCell>
              <TableCell>
                <div className={cn(
                  "font-mono",
                  result.expected.yearBranch && result.actual.yearBranch !== result.expected.yearBranch
                    ? "text-destructive"
                    : "text-foreground"
                )}>
                  {result.actual.yearStem}{result.actual.yearBranch}
                </div>
                {result.expected.yearBranch && (
                  <div className="text-xs text-muted-foreground">
                    預期: {result.expected.yearStem || ""}{result.expected.yearBranch}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className={cn(
                  "font-mono",
                  result.expected.monthBranch && result.actual.monthBranch !== result.expected.monthBranch
                    ? "text-destructive"
                    : "text-foreground"
                )}>
                  {result.actual.monthStem}{result.actual.monthBranch}
                </div>
                {result.expected.monthBranch && (
                  <div className="text-xs text-muted-foreground">
                    預期: {result.expected.monthStem || ""}{result.expected.monthBranch}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="font-mono">
                  {result.actual.dayStem}{result.actual.dayBranch}
                </div>
              </TableCell>
              <TableCell>
                <div className={cn(
                  "font-mono",
                  result.expected.hourBranch && result.actual.hourBranch !== result.expected.hourBranch
                    ? "text-destructive"
                    : "text-foreground"
                )}>
                  {result.actual.hourStem}{result.actual.hourBranch}
                </div>
                {result.expected.hourBranch && (
                  <div className="text-xs text-muted-foreground">
                    預期: {result.expected.hourBranch}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {result.actual.meta && (
                  <div className="text-xs space-y-0.5">
                    <div>太陽時: {result.actual.meta.solarAdjustedTime}</div>
                    {result.actual.meta.dayDelta !== 0 && (
                      <div className="text-amber-500">
                        跨日: {result.actual.meta.dayDelta > 0 ? '+' : ''}{result.actual.meta.dayDelta}
                      </div>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                {result.error?.includes("人工") ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    待審核
                  </Badge>
                ) : result.passed ? (
                  <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    通過
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    失敗
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
          <Clock className="w-5 h-5" />
          邊界測試套件（Strict Mode 引擎）
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          針對節氣交界點、子時交界點、真太陽時跨日等邊界情況進行自動化測試
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isRunning} className="w-full" size="lg">
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              執行測試中...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              執行邊界測試 ({ALL_TESTS.length} 個案例)
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
                <div className="text-2xl font-bold text-emerald-600">{stats.passed}</div>
                <div className="text-xs text-muted-foreground">通過</div>
              </Card>
              <Card className="p-3 bg-amber-500/10">
                <div className="text-2xl font-bold text-amber-600">{stats.needReview}</div>
                <div className="text-xs text-muted-foreground">待審核</div>
              </Card>
              <Card className="p-3 bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">失敗</div>
              </Card>
            </div>

            {/* 分類標籤 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="solar_term">節氣</TabsTrigger>
                <TabsTrigger value="zi_hour">子時</TabsTrigger>
                <TabsTrigger value="day_boundary">日柱</TabsTrigger>
                <TabsTrigger value="solar_time">太陽時</TabsTrigger>
              </TabsList>
              <TabsContent value="all">{renderResults(results)}</TabsContent>
              <TabsContent value="solar_term">{renderResults(filterResults("solar_term"))}</TabsContent>
              <TabsContent value="zi_hour">{renderResults(filterResults("zi_hour"))}</TabsContent>
              <TabsContent value="day_boundary">{renderResults(filterResults("day_boundary"))}</TabsContent>
              <TabsContent value="solar_time">{renderResults(filterResults("solar_time"))}</TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
