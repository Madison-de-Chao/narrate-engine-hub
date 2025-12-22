/**
 * 八字計算引擎 - 統一導出
 */

// 核心引擎
export { calculateBaziStrict, calculateBaziSimple } from "./engine";

// 真太陽時
export { 
  applySolarTime, 
  calculateEquationOfTimeSeconds,
  buildLocalDateTimeUtc,
  formatSolarTimeResult,
  getStandardTimezoneForLongitude
} from "./solarTime";

// 節氣服務
export {
  getSolarTermUtc,
  getSolarTermDetail,
  findNearestSolarTerm,
  parseSolarTermDate,
  getMonthBranchIndex,
  clearSolarTermCache,
  SOLAR_TERM_BRANCH_ORDER
} from "./solarTermsService";

// 地支互動
export {
  detectInteractions,
  getInteractionColor,
  getInteractionIcon
} from "./interactions";

// 驗證
export {
  validateBaziInput,
  quickValidateBaziInput,
  formatValidationErrors
} from "./validation";

// 類型重導出
export type {
  BirthLocalInput,
  SolarTimeMode,
  ZiMode,
  DayBoundaryMode,
  SolarTimeResult,
  ValidationError,
  ValidationResult,
  SolarTermSource,
  SolarTermResult,
  InteractionType,
  InteractionResult,
  FourPillars,
  PillarName,
  PillarDetail,
  HiddenStemEntry,
  WuxingScore,
  WuxingBreakdownEntry,
  CalculationLogs,
  CalculationMeta,
  BaziCalculationResult
} from "@/types/bazi";

export {
  fromJsTimezoneOffset,
  toJsTimezoneOffset,
  TIMEZONE_PRESETS,
  STANDARD_LONGITUDE_CHINA
} from "@/types/bazi";
