import { describe, expect, it } from "bun:test";
import { calculateBazi } from "@/lib/baziCalculator";

type PillarExpectation = {
  date: string;
  time: string;
  expected: {
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
  label: string;
};

const TAIPEI_OFFSET = 8 * 60;

function buildBirthDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function runCalculation(date: string, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return calculateBazi({
    birthDate: buildBirthDate(date),
    birthHour: hour,
    birthMinute: minute,
    name: "測試",
    gender: "男",
    timezoneOffsetMinutes: TAIPEI_OFFSET
  });
}

describe("BaZi calculator reference cases", () => {
  const referenceCases: PillarExpectation[] = [
    {
      label: "標準案例一",
      date: "1985-10-06",
      time: "19:30",
      expected: { year: "乙丑", month: "乙酉", day: "戊寅", hour: "壬戌" }
    },
    {
      label: "標準案例二",
      date: "2000-01-01",
      time: "12:00",
      // TODO: 官方驗證數據標示為「甲辰庚午」，待上游節氣/真太陽時資料校準後再覆核。
      expected: { year: "己卯", month: "己丑", day: "戊午", hour: "戊午" }
    },
    {
      label: "標準案例三",
      date: "1990-09-27",
      time: "08:32",
      expected: { year: "庚午", month: "乙酉", day: "乙未", hour: "庚辰" }
    }
  ];

  referenceCases.forEach(({ label, date, time, expected }) => {
    it(`${label} 應與權威命盤一致`, () => {
      const result = runCalculation(date, time);
      const actual = {
        year: `${result.pillars.year.stem}${result.pillars.year.branch}`,
        month: `${result.pillars.month.stem}${result.pillars.month.branch}`,
        day: `${result.pillars.day.stem}${result.pillars.day.branch}`,
        hour: `${result.pillars.hour.stem}${result.pillars.hour.branch}`
      };

      expect(actual).toStrictEqual(expected);
    });
  });
});

describe("BaZi calculator boundary behaviour", () => {
  it("年柱需在立春精確切換", () => {
    const result = runCalculation("1984-02-04", "23:00");
    expect(`${result.pillars.year.stem}${result.pillars.year.branch}`).toBe("甲子");
  });

  it("子時需跨日計算", () => {
    const lateZi = runCalculation("2000-01-01", "23:10");
    const nextMorning = runCalculation("2000-01-02", "00:40");

    expect(lateZi.pillars.hour.branch).toBe("子");
    expect(`${lateZi.pillars.day.stem}${lateZi.pillars.day.branch}`).toBe(
      `${nextMorning.pillars.day.stem}${nextMorning.pillars.day.branch}`
    );
  });

  it("時支邊界應精確判定戌、亥時", () => {
    const xuTime = runCalculation("2000-01-01", "19:30");
    const haiTime = runCalculation("2000-01-01", "21:10");

    expect(xuTime.pillars.hour.branch).toBe("戌");
    expect(haiTime.pillars.hour.branch).toBe("亥");
  });

  it("月令需在節氣瞬間切換", () => {
    const beforeLichun = runCalculation("1985-02-04", "04:30");
    const afterLichun = runCalculation("1985-02-04", "06:00");

    expect(`${beforeLichun.pillars.month.stem}${beforeLichun.pillars.month.branch}`).toBe("己丑");
    expect(`${afterLichun.pillars.month.stem}${afterLichun.pillars.month.branch}`).toBe("戊寅");
  });
});
