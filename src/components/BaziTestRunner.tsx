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

// 邊界測試案例
const testCases: TestCase[] = [
  {
    id: "1994-10-31-0130",
    name: "1994年10月31日 01:30（回歸測試）",
    description: "寒露後，戌月，丁丑時",
    input: {
      birthDate: "1994-10-31",
      birthTime: "01:30",
      name: "測試案例1",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "戌" },
      monthPillar: { stem: "甲", branch: "戌" },
      dayPillar: { stem: "庚", branch: "寅" },
      hourPillar: { stem: "丁", branch: "丑" }
    }
  },
  {
    id: "1994-02-03-1200",
    name: "1994年2月3日 12:00（立春前一天）",
    description: "癸酉年丑月，立春前應屬前一年",
    input: {
      birthDate: "1994-02-03",
      birthTime: "12:00",
      name: "測試案例2",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "癸", branch: "酉" },
      monthPillar: { stem: "乙", branch: "丑" },
      dayPillar: { stem: "丙", branch: "辰" },
      hourPillar: { stem: "甲", branch: "午" }
    }
  },
  {
    id: "1994-02-04-1200",
    name: "1994年2月4日 12:00（立春當天）",
    description: "甲戌年寅月，立春後進入新年",
    input: {
      birthDate: "1994-02-04",
      birthTime: "12:00",
      name: "測試案例3",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "戌" },
      monthPillar: { stem: "丙", branch: "寅" },
      dayPillar: { stem: "丁", branch: "巳" },
      hourPillar: { stem: "丙", branch: "午" }
    }
  },
  {
    id: "2000-02-04-2000",
    name: "2000年2月4日 20:00（千禧年立春）",
    description: "庚辰年，立春後驗證",
    input: {
      birthDate: "2000-02-04",
      birthTime: "20:00",
      name: "測試案例4",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "庚", branch: "辰" },
      monthPillar: { stem: "戊", branch: "寅" },
      dayPillar: { stem: "甲", branch: "午" },
      hourPillar: { stem: "甲", branch: "戌" }
    }
  },
  {
    id: "1990-01-05-0600",
    name: "1990年1月5日 06:00（小寒邊界）",
    description: "小寒當天，丑月開始",
    input: {
      birthDate: "1990-01-05",
      birthTime: "06:00",
      name: "測試案例5",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "己", branch: "巳" },
      monthPillar: { stem: "丁", branch: "丑" },
      dayPillar: { stem: "癸", branch: "丑" },
      hourPillar: { stem: "乙", branch: "卯" }
    }
  },
  {
    id: "1985-09-22-1200",
    name: "1985年9月22日 12:00（日柱基準日）",
    description: "甲子日柱基準日驗證",
    input: {
      birthDate: "1985-09-22",
      birthTime: "12:00",
      name: "測試案例6",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "乙", branch: "丑" },
      monthPillar: { stem: "乙", branch: "酉" },
      dayPillar: { stem: "甲", branch: "子" },
      hourPillar: { stem: "庚", branch: "午" }
    }
  },
  {
    id: "1987-02-04-0000",
    name: "1987年2月4日 00:00（立春日子時）",
    description: "立春日午夜子時邊界測試",
    input: {
      birthDate: "1987-02-04",
      birthTime: "00:30",
      name: "測試案例7",
      gender: "male"
    },
    expected: {
      yearPillar: { stem: "丁", branch: "卯" },
      monthPillar: { stem: "壬", branch: "寅" },
      dayPillar: { stem: "庚", branch: "寅" },
      hourPillar: { stem: "丙", branch: "子" }
    }
  },
  {
    id: "1994-10-08-1000",
    name: "1994年10月8日 10:00（寒露當天）",
    description: "寒露節氣當天，戌月開始",
    input: {
      birthDate: "1994-10-08",
      birthTime: "10:00",
      name: "測試案例8",
      gender: "female"
    },
    expected: {
      yearPillar: { stem: "甲", branch: "戌" },
      monthPillar: { stem: "甲", branch: "戌" },
      dayPillar: { stem: "丁", branch: "亥" },
      hourPillar: { stem: "乙", branch: "巳" }
    }
  }
];

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
