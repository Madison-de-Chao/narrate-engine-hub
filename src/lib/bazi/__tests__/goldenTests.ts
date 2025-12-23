/**
 * RSBZS Golden Test Suite
 * 包含節氣邊界、閏年、跨日案例的驗證測試
 * 
 * Phase 2: QA 驗證層
 */

import type { BirthLocalInput, BaziCalculationResult } from "@/types/bazi";

// ============================================
// 測試案例類型
// ============================================

export interface GoldenTestCase {
  id: string;
  name: string;
  category: 'solar_term_boundary' | 'leap_year' | 'cross_day' | 'standard' | 'edge_case';
  input: BirthLocalInput;
  expected: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
    dayDelta?: number;
  };
  notes?: string;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  expected: GoldenTestCase['expected'];
  actual: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
    dayDelta?: number;
  };
  errors: string[];
}

// ============================================
// Golden Test Cases
// ============================================

export const GOLDEN_TEST_CASES: GoldenTestCase[] = [
  // === 節氣邊界案例 ===
  {
    id: 'ST-001',
    name: '立春前一日（仍屬前一年）',
    category: 'solar_term_boundary',
    input: {
      year: 2024,
      month: 2,
      day: 3,
      hour: 23,
      minute: 30,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '癸', branch: '卯' }, // 2023 年癸卯
      monthPillar: { stem: '乙', branch: '丑' },
      dayPillar: { stem: '辛', branch: '丑' },
      hourPillar: { stem: '戊', branch: '子' }
    },
    notes: '2024 年立春為 2/4 16:27，此案例在立春前'
  },
  {
    id: 'ST-002',
    name: '立春當日立春後（屬新年）',
    category: 'solar_term_boundary',
    input: {
      year: 2024,
      month: 2,
      day: 4,
      hour: 17,
      minute: 0,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' }, // 2024 年甲辰
      monthPillar: { stem: '丙', branch: '寅' },
      dayPillar: { stem: '壬', branch: '寅' },
      hourPillar: { stem: '戊', branch: '酉' }
    },
    notes: '2024 年立春為 2/4 16:27，此案例在立春後'
  },
  {
    id: 'ST-003',
    name: '驚蟄節氣邊界',
    category: 'solar_term_boundary',
    input: {
      year: 2024,
      month: 3,
      day: 5,
      hour: 11,
      minute: 0,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' },
      monthPillar: { stem: '丁', branch: '卯' }, // 驚蟄後入卯月
      dayPillar: { stem: '壬', branch: '午' },
      hourPillar: { stem: '丙', branch: '午' }
    },
    notes: '2024 年驚蟄為 3/5 10:23'
  },

  // === 閏年案例 ===
  {
    id: 'LY-001',
    name: '閏年 2/29 有效日期',
    category: 'leap_year',
    input: {
      year: 2024,
      month: 2,
      day: 29,
      hour: 12,
      minute: 0,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' },
      monthPillar: { stem: '丙', branch: '寅' },
      dayPillar: { stem: '丁', branch: '亥' },
      hourPillar: { stem: '丙', branch: '午' }
    },
    notes: '2024 為閏年，2/29 有效'
  },
  {
    id: 'LY-002',
    name: '世紀閏年 2000/2/29',
    category: 'leap_year',
    input: {
      year: 2000,
      month: 2,
      day: 29,
      hour: 0,
      minute: 0,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '庚', branch: '辰' },
      monthPillar: { stem: '戊', branch: '寅' },
      dayPillar: { stem: '甲', branch: '午' },
      hourPillar: { stem: '甲', branch: '子' }
    },
    notes: '2000 年可被 400 整除，為閏年'
  },

  // === 跨日案例 ===
  {
    id: 'CD-001',
    name: '真太陽時向前跨日（西部經度）',
    category: 'cross_day',
    input: {
      year: 2024,
      month: 6,
      day: 15,
      hour: 23,
      minute: 50,
      second: 0,
      tzOffsetMinutesEast: 480,
      longitude: 80, // 新疆烏魯木齊附近
      solarTimeMode: 'LMT',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' },
      monthPillar: { stem: '庚', branch: '午' },
      dayPillar: { stem: '甲', branch: '申' }, // 跨日前一天
      hourPillar: { stem: '甲', branch: '子' },
      dayDelta: -1
    },
    notes: 'E80 使用 UTC+8，太陽時慢約 2 小時 40 分'
  },
  {
    id: 'CD-002',
    name: '子時早子時換日',
    category: 'cross_day',
    input: {
      year: 2024,
      month: 7,
      day: 1,
      hour: 23,
      minute: 30,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY' // 早子時：23 點算次日
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' },
      monthPillar: { stem: '庚', branch: '午' },
      dayPillar: { stem: '乙', branch: '未' }, // 7/2 的日柱
      hourPillar: { stem: '丙', branch: '子' }
    },
    notes: '早子時模式下 23:00 後計入次日'
  },
  {
    id: 'CD-003',
    name: '子時晚子時不換日',
    category: 'cross_day',
    input: {
      year: 2024,
      month: 7,
      day: 1,
      hour: 23,
      minute: 30,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'LATE' // 晚子時：23 點仍屬當日
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' },
      monthPillar: { stem: '庚', branch: '午' },
      dayPillar: { stem: '甲', branch: '午' }, // 7/1 的日柱
      hourPillar: { stem: '甲', branch: '子' }
    },
    notes: '晚子時模式下 23:00 仍屬當日'
  },

  // === 標準案例 ===
  {
    id: 'STD-001',
    name: '標準案例：1985/9/22 基準日',
    category: 'standard',
    input: {
      year: 1985,
      month: 9,
      day: 22,
      hour: 12,
      minute: 0,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '乙', branch: '丑' },
      monthPillar: { stem: '乙', branch: '酉' },
      dayPillar: { stem: '甲', branch: '子' }, // 基準日甲子
      hourPillar: { stem: '庚', branch: '午' }
    },
    notes: '1985/9/22 為日柱計算基準日（甲子日）'
  },
  {
    id: 'STD-002',
    name: '標準案例：1984 甲子年',
    category: 'standard',
    input: {
      year: 1984,
      month: 3,
      day: 15,
      hour: 8,
      minute: 30,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '甲', branch: '子' }, // 甲子年
      monthPillar: { stem: '丁', branch: '卯' },
      dayPillar: { stem: '丙', branch: '戌' },
      hourPillar: { stem: '壬', branch: '辰' }
    },
    notes: '1984 年為甲子年基準'
  },

  // === 邊緣案例 ===
  {
    id: 'EDGE-001',
    name: '午夜 00:00 邊界',
    category: 'edge_case',
    input: {
      year: 2024,
      month: 8,
      day: 15,
      hour: 0,
      minute: 0,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'LATE'
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' },
      monthPillar: { stem: '壬', branch: '申' },
      dayPillar: { stem: '辛', branch: '酉' },
      hourPillar: { stem: '戊', branch: '子' }
    },
    notes: '午夜 00:00 屬子時'
  },
  {
    id: 'EDGE-002',
    name: '年末 12/31 23:59',
    category: 'edge_case',
    input: {
      year: 2024,
      month: 12,
      day: 31,
      hour: 23,
      minute: 59,
      second: 59,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'LATE'
    },
    expected: {
      yearPillar: { stem: '甲', branch: '辰' }, // 仍是 2024 甲辰年（未過立春）
      monthPillar: { stem: '丙', branch: '子' },
      dayPillar: { stem: '丙', branch: '寅' },
      hourPillar: { stem: '戊', branch: '子' }
    },
    notes: '年末仍用當年年柱（以立春為年分界）'
  },
  {
    id: 'EDGE-003',
    name: '最早支援年份 1850',
    category: 'edge_case',
    input: {
      year: 1850,
      month: 6,
      day: 15,
      hour: 12,
      minute: 0,
      second: 0,
      tzOffsetMinutesEast: 480,
      solarTimeMode: 'NONE',
      ziMode: 'EARLY'
    },
    expected: {
      yearPillar: { stem: '庚', branch: '戌' },
      monthPillar: { stem: '壬', branch: '午' },
      dayPillar: { stem: '壬', branch: '戌' },
      hourPillar: { stem: '丙', branch: '午' }
    },
    notes: '系統支援的最早年份'
  }
];

// ============================================
// 測試執行器
// ============================================

/**
 * 執行單一測試案例
 */
export function runSingleTest(
  testCase: GoldenTestCase,
  calculateFn: (input: BirthLocalInput) => BaziCalculationResult
): TestResult {
  const errors: string[] = [];
  
  try {
    const result = calculateFn(testCase.input);
    
    const actual = {
      yearPillar: result.pillars.year,
      monthPillar: result.pillars.month,
      dayPillar: result.pillars.day,
      hourPillar: result.pillars.hour,
      dayDelta: result.meta?.dayDelta
    };

    // 比對年柱
    if (actual.yearPillar.stem !== testCase.expected.yearPillar.stem ||
        actual.yearPillar.branch !== testCase.expected.yearPillar.branch) {
      errors.push(`年柱不符：期望 ${testCase.expected.yearPillar.stem}${testCase.expected.yearPillar.branch}，實際 ${actual.yearPillar.stem}${actual.yearPillar.branch}`);
    }

    // 比對月柱
    if (actual.monthPillar.stem !== testCase.expected.monthPillar.stem ||
        actual.monthPillar.branch !== testCase.expected.monthPillar.branch) {
      errors.push(`月柱不符：期望 ${testCase.expected.monthPillar.stem}${testCase.expected.monthPillar.branch}，實際 ${actual.monthPillar.stem}${actual.monthPillar.branch}`);
    }

    // 比對日柱
    if (actual.dayPillar.stem !== testCase.expected.dayPillar.stem ||
        actual.dayPillar.branch !== testCase.expected.dayPillar.branch) {
      errors.push(`日柱不符：期望 ${testCase.expected.dayPillar.stem}${testCase.expected.dayPillar.branch}，實際 ${actual.dayPillar.stem}${actual.dayPillar.branch}`);
    }

    // 比對時柱
    if (actual.hourPillar.stem !== testCase.expected.hourPillar.stem ||
        actual.hourPillar.branch !== testCase.expected.hourPillar.branch) {
      errors.push(`時柱不符：期望 ${testCase.expected.hourPillar.stem}${testCase.expected.hourPillar.branch}，實際 ${actual.hourPillar.stem}${actual.hourPillar.branch}`);
    }

    // 比對跨日
    if (testCase.expected.dayDelta !== undefined && actual.dayDelta !== testCase.expected.dayDelta) {
      errors.push(`跨日偏移不符：期望 ${testCase.expected.dayDelta}，實際 ${actual.dayDelta}`);
    }

    return {
      testId: testCase.id,
      passed: errors.length === 0,
      expected: testCase.expected,
      actual,
      errors
    };
  } catch (e) {
    return {
      testId: testCase.id,
      passed: false,
      expected: testCase.expected,
      actual: {
        yearPillar: { stem: '', branch: '' },
        monthPillar: { stem: '', branch: '' },
        dayPillar: { stem: '', branch: '' },
        hourPillar: { stem: '', branch: '' }
      },
      errors: [`執行錯誤：${e instanceof Error ? e.message : String(e)}`]
    };
  }
}

/**
 * 執行全部測試
 */
export function runAllTests(
  calculateFn: (input: BirthLocalInput) => BaziCalculationResult
): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
  summary: Record<string, { passed: number; failed: number }>;
} {
  const results = GOLDEN_TEST_CASES.map(tc => runSingleTest(tc, calculateFn));
  
  const summary: Record<string, { passed: number; failed: number }> = {};
  
  for (const tc of GOLDEN_TEST_CASES) {
    if (!summary[tc.category]) {
      summary[tc.category] = { passed: 0, failed: 0 };
    }
  }
  
  for (const result of results) {
    const tc = GOLDEN_TEST_CASES.find(t => t.id === result.testId)!;
    if (result.passed) {
      summary[tc.category].passed++;
    } else {
      summary[tc.category].failed++;
    }
  }

  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
    summary
  };
}

/**
 * 按類別執行測試
 */
export function runTestsByCategory(
  category: GoldenTestCase['category'],
  calculateFn: (input: BirthLocalInput) => BaziCalculationResult
): TestResult[] {
  const testCases = GOLDEN_TEST_CASES.filter(tc => tc.category === category);
  return testCases.map(tc => runSingleTest(tc, calculateFn));
}

/**
 * 格式化測試結果報告
 */
export function formatTestReport(results: ReturnType<typeof runAllTests>): string {
  const lines: string[] = [
    '========================================',
    'RSBZS Golden Test Suite - 測試報告',
    '========================================',
    '',
    `總計: ${results.total} | 通過: ${results.passed} | 失敗: ${results.failed}`,
    '',
    '--- 分類統計 ---'
  ];

  for (const [category, stats] of Object.entries(results.summary)) {
    const status = stats.failed === 0 ? '✓' : '✗';
    lines.push(`${status} ${category}: ${stats.passed}/${stats.passed + stats.failed}`);
  }

  const failedResults = results.results.filter(r => !r.passed);
  if (failedResults.length > 0) {
    lines.push('', '--- 失敗案例詳情 ---');
    for (const result of failedResults) {
      const tc = GOLDEN_TEST_CASES.find(t => t.id === result.testId)!;
      lines.push(``, `[${result.testId}] ${tc.name}`);
      for (const error of result.errors) {
        lines.push(`  ❌ ${error}`);
      }
    }
  }

  lines.push('', '========================================');
  return lines.join('\n');
}
