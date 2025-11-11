import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateBazi } from "@/lib/baziCalculator";

interface TestCase {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  expected: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  category: "standard" | "boundary";
  notes?: string;
}

const TEST_CASES: TestCase[] = [
  // 标准测试
  {
    id: "1",
    name: "标准测试1",
    date: "1985-10-06",
    time: "19:30",
    location: "台北",
    expected: { year: "乙丑", month: "乙酉", day: "戊寅", hour: "壬戌" },
    category: "standard"
  },
  {
    id: "2",
    name: "标准测试2",
    date: "2000-01-01",
    time: "12:00",
    location: "台北",
    expected: { year: "己卯", month: "丁丑", day: "甲辰", hour: "庚午" },
    category: "standard"
  },
  {
    id: "3",
    name: "标准测试3",
    date: "1990-09-27",
    time: "08:32",
    location: "台北",
    expected: { year: "庚午", month: "乙酉", day: "乙未", hour: "庚辰" },
    category: "standard"
  },
  // 边界测试
  {
    id: "4",
    name: "年柱换年边界",
    date: "1984-02-04",
    time: "23:00",
    location: "台北",
    expected: { year: "甲子", month: "", day: "", hour: "子" },
    category: "boundary",
    notes: "立春后应切换到甲子年"
  },
  {
    id: "5",
    name: "子时跨日A",
    date: "2000-01-01",
    time: "23:10",
    location: "台北",
    expected: { year: "", month: "", day: "", hour: "子" },
    category: "boundary",
    notes: "时支必为子，日柱应为次日"
  },
  {
    id: "6",
    name: "子时跨日B",
    date: "2000-01-02",
    time: "00:40",
    location: "台北",
    expected: { year: "", month: "", day: "", hour: "子" },
    category: "boundary",
    notes: "时支仍为子，日柱为次日"
  },
  {
    id: "7",
    name: "时支边界-戌时",
    date: "2000-01-01",
    time: "19:30",
    location: "台北",
    expected: { year: "", month: "", day: "", hour: "戌" },
    category: "boundary",
    notes: "19:30应为戌时"
  },
  {
    id: "8",
    name: "时支边界-亥时",
    date: "2000-01-01",
    time: "21:10",
    location: "台北",
    expected: { year: "", month: "", day: "", hour: "亥" },
    category: "boundary",
    notes: "21:10应为亥时"
  }
];

export default function BaziTest() {
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    const testResults: any[] = [];

    TEST_CASES.forEach((testCase) => {
      const [year, month, day] = testCase.date.split("-").map(Number);
      const [hour, minute] = testCase.time.split(":").map(Number);
      
      const birthDate = new Date(year, month - 1, day);
      
      const result = calculateBazi({
        birthDate,
        birthHour: hour,
        name: "测试",
        gender: "男"
      });

      const actual = {
        year: result.pillars.year.stem + result.pillars.year.branch,
        month: result.pillars.month.stem + result.pillars.month.branch,
        day: result.pillars.day.stem + result.pillars.day.branch,
        hour: result.pillars.hour.stem + result.pillars.hour.branch
      };

      const passed = {
        year: !testCase.expected.year || actual.year === testCase.expected.year,
        month: !testCase.expected.month || actual.month === testCase.expected.month,
        day: !testCase.expected.day || actual.day === testCase.expected.day,
        hour: !testCase.expected.hour || actual.hour === testCase.expected.hour
      };

      testResults.push({
        ...testCase,
        actual,
        passed,
        allPassed: passed.year && passed.month && passed.day && passed.hour
      });
    });

    setResults(testResults);
    setIsRunning(false);
  };

  const standardTests = results.filter(r => r.category === "standard");
  const boundaryTests = results.filter(r => r.category === "boundary");
  
  const standardPassed = standardTests.filter(r => r.allPassed).length;
  const boundaryPassed = boundaryTests.filter(r => r.allPassed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">八字计算系统测试</CardTitle>
            <p className="text-muted-foreground">验证计算准确性与边界处理</p>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={isRunning} size="lg" className="w-full">
              {isRunning ? "测试中..." : "运行所有测试"}
            </Button>
            
            {results.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="flex gap-4 text-lg font-semibold">
                  <div>标准测试: {standardPassed}/{standardTests.length} 通过</div>
                  <div>边界测试: {boundaryPassed}/{boundaryTests.length} 通过</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {results.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>标准测试结果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {standardTests.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{result.name}</h3>
                      <Badge variant={result.allPassed ? "default" : "destructive"}>
                        {result.allPassed ? "✓ 通过" : "✗ 失败"}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {result.date} {result.time} ({result.location})
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-muted-foreground">年柱</div>
                        <div className="font-mono">
                          预期: {result.expected.year || "N/A"}
                          <br />
                          实际: <span className={result.passed.year ? "text-green-600" : "text-red-600"}>
                            {result.actual.year}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">月柱</div>
                        <div className="font-mono">
                          预期: {result.expected.month || "N/A"}
                          <br />
                          实际: <span className={result.passed.month ? "text-green-600" : "text-red-600"}>
                            {result.actual.month}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">日柱</div>
                        <div className="font-mono">
                          预期: {result.expected.day || "N/A"}
                          <br />
                          实际: <span className={result.passed.day ? "text-green-600" : "text-red-600"}>
                            {result.actual.day}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">时柱</div>
                        <div className="font-mono">
                          预期: {result.expected.hour || "N/A"}
                          <br />
                          实际: <span className={result.passed.hour ? "text-green-600" : "text-red-600"}>
                            {result.actual.hour}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>边界测试结果</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {boundaryTests.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{result.name}</h3>
                      <Badge variant={result.allPassed ? "default" : "destructive"}>
                        {result.allPassed ? "✓ 通过" : "✗ 失败"}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {result.date} {result.time} ({result.location})
                    </div>
                    
                    {result.notes && (
                      <div className="text-sm bg-muted p-2 rounded">
                        规则: {result.notes}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div>
                        <div className="text-xs text-muted-foreground">年柱</div>
                        <div className="font-mono">
                          预期: {result.expected.year || "N/A"}
                          <br />
                          实际: <span className={result.passed.year ? "text-green-600" : "text-red-600"}>
                            {result.actual.year}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">月柱</div>
                        <div className="font-mono">
                          预期: {result.expected.month || "N/A"}
                          <br />
                          实际: <span className={result.passed.month ? "text-green-600" : "text-red-600"}>
                            {result.actual.month}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">日柱</div>
                        <div className="font-mono">
                          预期: {result.expected.day || "N/A"}
                          <br />
                          实际: <span className={result.passed.day ? "text-green-600" : "text-red-600"}>
                            {result.actual.day}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">时柱</div>
                        <div className="font-mono">
                          预期: {result.expected.hour || "N/A"}
                          <br />
                          实际: <span className={result.passed.hour ? "text-green-600" : "text-red-600"}>
                            {result.actual.hour}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}