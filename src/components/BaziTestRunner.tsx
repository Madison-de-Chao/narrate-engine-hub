import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TestCase {
  id: string;
  name: string;
  description: string;
  input: {
    birthDate: string;
    birthTime: string;
    name: string;
    gender: string;
  };
  expected: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
  };
}

interface TestResult {
  id: string;
  passed: boolean;
  actual?: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
  };
  errors: string[];
}

// 標準測試案例（系統必過樣本）
const standardTestCases: TestCase[] = [
  {
    id: "standard-1985-10-06",
    name: "1985年10月6日 19:30（標準樣本1）",
    description: "規格書指定對照盤，寒露後酉月",
    input: {
      birthDate: "1985-10-06",
      birthTime: "19:30",
      name: "標準測試1",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "乙", branch: "丑" },
      monthPillar: { stem: "乙", branch: "酉" },
      dayPillar: { stem: "戊", branch: "寅" },
      hourPillar: { stem: "壬", branch: "戌" }
    }
  },
  {
    id: "standard-2000-01-01",
    name: "2000年1月1日 12:00（標準樣本2）",
    description: "規格書指定對照盤，千禧年元旦",
    input: {
      birthDate: "2000-01-01",
      birthTime: "12:00",
      name: "標準測試2",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "己", branch: "卯" },
      monthPillar: { stem: "丁", branch: "丑" },
      dayPillar: { stem: "甲", branch: "辰" },
      hourPillar: { stem: "庚", branch: "午" }
    }
  },
  {
    id: "standard-1990-09-27",
    name: "1990年9月27日 08:32（標準樣本3）",
    description: "規格書指定對照盤，白露後酉月",
    input: {
      birthDate: "1990-09-27",
      birthTime: "08:32",
      name: "標準測試3",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "庚", branch: "午" },
      monthPillar: { stem: "乙", branch: "酉" },
      dayPillar: { stem: "乙", branch: "未" },
      hourPillar: { stem: "庚", branch: "辰" }
    }
  }
];

// 邊界測試案例
const boundaryTestCases: TestCase[] = [
  {
    id: "boundary-lichun-1984",
    name: "1984年2月4日 23:00（立春後年柱換年）",
    description: "立春後，年柱切到新年甲子年",
    input: {
      birthDate: "1984-02-04",
      birthTime: "23:00",
      name: "年柱邊界測試",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "子" },
      monthPillar: { stem: "丙", branch: "寅" },
      dayPillar: { stem: "癸", branch: "丑" },
      hourPillar: { stem: "癸", branch: "子" }
    }
  },
  {
    id: "boundary-zi-hour-A",
    name: "1994年10月31日 23:10（子時跨日A）",
    description: "23:10為子時，日柱視為次日",
    input: {
      birthDate: "1994-10-31",
      birthTime: "23:10",
      name: "子時跨日A",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "戌" },
      monthPillar: { stem: "甲", branch: "戌" },
      dayPillar: { stem: "辛", branch: "卯" },
      hourPillar: { stem: "戊", branch: "子" }
    }
  },
  {
    id: "boundary-zi-hour-B",
    name: "1994年11月1日 00:40（子時跨日B）",
    description: "00:40仍為子時，日柱為當日",
    input: {
      birthDate: "1994-11-01",
      birthTime: "00:40",
      name: "子時跨日B",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "戌" },
      monthPillar: { stem: "甲", branch: "戌" },
      dayPillar: { stem: "辛", branch: "卯" },
      hourPillar: { stem: "戊", branch: "子" }
    }
  },
  {
    id: "boundary-hour-xu",
    name: "1990年5月15日 19:30（戌時邊界）",
    description: "19:30應為戌時（19:00-20:59），非亥時",
    input: {
      birthDate: "1990-05-15",
      birthTime: "19:30",
      name: "戌時測試",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "庚", branch: "午" },
      monthPillar: { stem: "辛", branch: "巳" },
      dayPillar: { stem: "壬", branch: "寅" },
      hourPillar: { stem: "庚", branch: "戌" }
    }
  },
  {
    id: "boundary-hour-hai",
    name: "1990年5月15日 21:10（亥時邊界）",
    description: "21:10應為亥時（21:00-22:59）",
    input: {
      birthDate: "1990-05-15",
      birthTime: "21:10",
      name: "亥時測試",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "庚", branch: "午" },
      monthPillar: { stem: "辛", branch: "巳" },
      dayPillar: { stem: "壬", branch: "寅" },
      hourPillar: { stem: "辛", branch: "亥" }
    }
  },
  {
    id: "boundary-hanlu-before",
    name: "1994年10月8日 06:00（寒露前）",
    description: "寒露當日但在寒露時刻前（23:25 UTC），仍為酉月",
    input: {
      birthDate: "1994-10-08",
      birthTime: "06:00",
      name: "寒露前測試",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "戌" },
      monthPillar: { stem: "癸", branch: "酉" },
      dayPillar: { stem: "丁", branch: "亥" },
      hourPillar: { stem: "癸", branch: "卯" }
    }
  },
  {
    id: "boundary-hanlu-after",
    name: "1994年10月9日 10:00（寒露後）",
    description: "寒露後，戌月開始",
    input: {
      birthDate: "1994-10-09",
      birthTime: "10:00",
      name: "寒露後測試",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "戌" },
      monthPillar: { stem: "甲", branch: "戌" },
      dayPillar: { stem: "戊", branch: "子" },
      hourPillar: { stem: "丁", branch: "巳" }
    }
  },
  {
    id: "boundary-xiaohan-before",
    name: "1990年1月5日 06:00（小寒前）",
    description: "小寒當日但在小寒前（22:33 local），仍為子月",
    input: {
      birthDate: "1990-01-05",
      birthTime: "06:00",
      name: "小寒前測試",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "己", branch: "巳" },
      monthPillar: { stem: "丙", branch: "子" },
      dayPillar: { stem: "癸", branch: "丑" },
      hourPillar: { stem: "乙", branch: "卯" }
    }
  },
  {
    id: "boundary-xiaohan-after",
    name: "1990年1月5日 23:00（小寒後）",
    description: "小寒後（22:33 local），丑月開始",
    input: {
      birthDate: "1990-01-05",
      birthTime: "23:00",
      name: "小寒後測試",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "己", branch: "巳" },
      monthPillar: { stem: "丁", branch: "丑" },
      dayPillar: { stem: "甲", branch: "寅" },
      hourPillar: { stem: "甲", branch: "子" }
    }
  }
];

// 合併所有測試案例
const testCases: TestCase[] = [...standardTestCases, ...boundaryTestCases];

export const BaziTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const comparePillar = (
    actual: { stem: string; branch: string } | undefined,
    expected: { stem: string; branch: string }
  ): boolean => {
    if (!actual) return false;
    return actual.stem === expected.stem && actual.branch === expected.branch;
  };

  const runSingleTest = async (testCase: TestCase): Promise<TestResult> => {
    try {
      const birthDate = new Date(testCase.input.birthDate);
      const [hour] = testCase.input.birthTime.split(':').map(Number);

      const { data, error } = await supabase.functions.invoke('calculate-bazi', {
        body: {
          name: testCase.input.name,
          gender: testCase.input.gender,
          birthDate: birthDate.toISOString(),
          birthTime: `${hour}:00`,
          useSolarTime: true,
          timezoneOffsetMinutes: 480
        }
      });

      if (error) {
        return {
          id: testCase.id,
          passed: false,
          errors: [`API 錯誤: ${error.message}`]
        };
      }

      const pillars = data?.calculation?.pillars;
      if (!pillars) {
        return {
          id: testCase.id,
          passed: false,
          errors: ['無法取得四柱資料']
        };
      }

      const errors: string[] = [];
      const actual = {
        yearPillar: pillars.year,
        monthPillar: pillars.month,
        dayPillar: pillars.day,
        hourPillar: pillars.hour
      };

      if (!comparePillar(pillars.year, testCase.expected.yearPillar)) {
        errors.push(`年柱: 期望 ${testCase.expected.yearPillar.stem}${testCase.expected.yearPillar.branch}, 實際 ${pillars.year?.stem}${pillars.year?.branch}`);
      }
      if (!comparePillar(pillars.month, testCase.expected.monthPillar)) {
        errors.push(`月柱: 期望 ${testCase.expected.monthPillar.stem}${testCase.expected.monthPillar.branch}, 實際 ${pillars.month?.stem}${pillars.month?.branch}`);
      }
      if (!comparePillar(pillars.day, testCase.expected.dayPillar)) {
        errors.push(`日柱: 期望 ${testCase.expected.dayPillar.stem}${testCase.expected.dayPillar.branch}, 實際 ${pillars.day?.stem}${pillars.day?.branch}`);
      }
      if (!comparePillar(pillars.hour, testCase.expected.hourPillar)) {
        errors.push(`時柱: 期望 ${testCase.expected.hourPillar.stem}${testCase.expected.hourPillar.branch}, 實際 ${pillars.hour?.stem}${pillars.hour?.branch}`);
      }

      return {
        id: testCase.id,
        passed: errors.length === 0,
        actual,
        errors
      };
    } catch (err) {
      return {
        id: testCase.id,
        passed: false,
        errors: [`執行錯誤: ${err instanceof Error ? err.message : String(err)}`]
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const testCase of testCases) {
      setCurrentTest(testCase.id);
      const result = await runSingleTest(testCase);
      setResults(prev => [...prev, result]);
      // 稍微延遲避免 API 過載
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest(null);
    setIsRunning(false);
    
    const passedCount = results.filter(r => r.passed).length + 1; // +1 for last test
    toast.success(`測試完成: ${passedCount}/${testCases.length} 通過`);
  };

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return (
    <Card className="bg-stone-900/80 border-amber-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-amber-300">八字節氣邊界測試</span>
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                測試中...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                執行測試
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 統計摘要 */}
        {results.length > 0 && (
          <div className="flex gap-4 mb-4">
            <Badge variant="outline" className="bg-emerald-950/50 border-emerald-500/50 text-emerald-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              通過: {passedCount}
            </Badge>
            <Badge variant="outline" className="bg-rose-950/50 border-rose-500/50 text-rose-300">
              <XCircle className="h-3 w-3 mr-1" />
              失敗: {failedCount}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              總計: {testCases.length}
            </Badge>
          </div>
        )}

        {/* 測試案例列表 */}
        <div className="space-y-3">
          {testCases.map((testCase) => {
            const result = results.find(r => r.id === testCase.id);
            const isCurrentlyRunning = currentTest === testCase.id;

            return (
              <div
                key={testCase.id}
                className={`p-3 rounded-lg border transition-colors ${
                  result?.passed
                    ? 'bg-emerald-950/30 border-emerald-500/30'
                    : result && !result.passed
                    ? 'bg-rose-950/30 border-rose-500/30'
                    : isCurrentlyRunning
                    ? 'bg-amber-950/30 border-amber-500/50 animate-pulse'
                    : 'bg-stone-800/50 border-stone-700/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {result ? (
                        result.passed ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400" />
                        )
                      ) : isCurrentlyRunning ? (
                        <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-stone-600" />
                      )}
                      <span className="font-medium text-sm">{testCase.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {testCase.description}
                    </p>
                    <div className="text-xs text-stone-400 mt-1 ml-6">
                      期望: {testCase.expected.yearPillar.stem}{testCase.expected.yearPillar.branch} {testCase.expected.monthPillar.stem}{testCase.expected.monthPillar.branch} {testCase.expected.dayPillar.stem}{testCase.expected.dayPillar.branch} {testCase.expected.hourPillar.stem}{testCase.expected.hourPillar.branch}
                    </div>
                  </div>
                </div>

                {/* 錯誤詳情 */}
                {result && !result.passed && result.errors.length > 0 && (
                  <div className="mt-2 ml-6 p-2 bg-rose-950/50 rounded text-xs text-rose-300 space-y-1">
                    {result.errors.map((error, idx) => (
                      <div key={idx}>❌ {error}</div>
                    ))}
                  </div>
                )}

                {/* 實際結果 */}
                {result?.actual && (
                  <div className="mt-2 ml-6 text-xs text-stone-400">
                    實際: {result.actual.yearPillar.stem}{result.actual.yearPillar.branch} {result.actual.monthPillar.stem}{result.actual.monthPillar.branch} {result.actual.dayPillar.stem}{result.actual.dayPillar.branch} {result.actual.hourPillar.stem}{result.actual.hourPillar.branch}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
