// Targeted regression check for 1994-10-31 01:30 UTC+8
import assert from "node:assert";

const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function toLocal(dateUtc, tzMinutes) {
  return new Date(dateUtc.getTime() + tzMinutes * 60 * 1000);
}

function createUtcFromLocalParts(birth, hour, minute, tzMinutes) {
  return new Date(Date.UTC(
    birth.getUTCFullYear(),
    birth.getUTCMonth(),
    birth.getUTCDate(),
    hour,
    minute
  ) - tzMinutes * 60 * 1000);
}

function calculateYearPillar(birthUtc) {
  // Approximate lichun: Feb 4th 05:30 UTC (fallback in edge function)
  const year = birthUtc.getUTCFullYear();
  const lichunApprox = new Date(Date.UTC(year, 1, 4, 5, 30));
  const adjustedYear = birthUtc < lichunApprox ? year - 1 : year;
  const stemIndex = (adjustedYear - 4) % 10;
  const branchIndex = (adjustedYear - 4) % 12;
  return {
    stem: TIANGAN[stemIndex < 0 ? stemIndex + 10 : stemIndex],
    branch: DIZHI[branchIndex < 0 ? branchIndex + 12 : branchIndex],
  };
}

function calculateMonthPillarSimple(yearStem, month) {
  const branchIndexMap = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0];
  const branchIndex = branchIndexMap[month - 1];
  const stemStartMap = {
    "甲": 2, "己": 2,
    "乙": 4, "庚": 4,
    "丙": 6, "辛": 6,
    "丁": 8, "壬": 8,
    "戊": 0, "癸": 0
  };
  const startStem = stemStartMap[yearStem] || 0;
  const offsetFromYin = (branchIndex - 2 + 12) % 12;
  const stemIndex = (startStem + offsetFromYin) % 10;
  return { stem: TIANGAN[stemIndex], branch: DIZHI[branchIndex] };
}

function calculateDayPillar(birthLocal, tzMinutes) {
  const baseDateLocal = new Date(Date.UTC(1985, 8, 22) - tzMinutes * 60 * 1000);
  const diffDays = Math.floor((birthLocal.getTime() - baseDateLocal.getTime()) / 86400000);
  const stemIndex = ((diffDays % 10) + 10) % 10;
  const branchIndex = ((diffDays % 12) + 12) % 12;
  return { stem: TIANGAN[stemIndex], branch: DIZHI[branchIndex] };
}

function calculateHourPillar(dayStem, hour) {
  const stemStartMap = {
    "甲": 0, "己": 0,
    "乙": 2, "庚": 2,
    "丙": 4, "辛": 4,
    "丁": 6, "壬": 6,
    "戊": 8, "癸": 8
  };
  const hourBranch = Math.floor((hour + 1) / 2) % 12;
  const startStem = stemStartMap[dayStem] || 0;
  const stemIndex = (startStem + hourBranch) % 10;
  return { stem: TIANGAN[stemIndex], branch: DIZHI[hourBranch] };
}

function run() {
  const tzOffset = 480;
  const birth = new Date("1994-10-31");
  const hour = 1;
  const minute = 30;
  const birthUtc = createUtcFromLocalParts(birth, hour, minute, tzOffset);
  const birthLocal = toLocal(birthUtc, tzOffset);

  const yearPillar = calculateYearPillar(birthUtc);
  const monthPillar = calculateMonthPillarSimple(yearPillar.stem, birthLocal.getUTCMonth() + 1);
  const dayPillar = calculateDayPillar(birthLocal, tzOffset);
  const hourPillar = calculateHourPillar(dayPillar.stem, hour);

  assert.deepStrictEqual(yearPillar, { stem: "甲", branch: "戌" });
  assert.deepStrictEqual(monthPillar, { stem: "甲", branch: "戌" });
  assert.deepStrictEqual(dayPillar, { stem: "庚", branch: "寅" });
  assert.deepStrictEqual(hourPillar, { stem: "丁", branch: "丑" });
  console.log("Regression check passed for 1994-10-31 01:30 UTC+8.");
}

run();
