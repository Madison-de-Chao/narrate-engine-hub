/**
 * 虹靈御所 八字 API SDK - TypeScript 類型定義
 * 
 * 此檔案導出所有 API 相關的 TypeScript 類型定義，
 * 讓開發者可以在自己的專案中直接使用這些類型。
 * 
 * @packageDocumentation
 * @module BaziAPITypes
 * @version 1.0.0
 * @author 虹靈御所開發團隊
 * @license MIT
 * 
 * @example 基本導入
 * ```typescript
 * import type { 
 *   BaziCalculateRequest, 
 *   BaziV1Response,
 *   FourPillars,
 *   TenGodItem 
 * } from '@/lib/bazi-api-types';
 * ```
 * 
 * @example 使用類型守衛
 * ```typescript
 * import { isWuxingElement, isTenGodName } from '@/lib/bazi-api-types';
 * 
 * if (isWuxingElement(userInput)) {
 *   // userInput 現在被推斷為 WuxingElement 類型
 *   console.log(`有效的五行：${userInput}`);
 * }
 * ```
 */

// ============ 請求類型 ============

/**
 * 八字計算請求參數
 * 
 * 用於向 Legacy API (`/bazi-api`) 發送計算請求。
 * 包含基本的出生資訊和可選的時間修正參數。
 * 
 * @example
 * ```typescript
 * const request: BaziCalculateRequest = {
 *   name: '王小明',
 *   gender: 'male',
 *   birthDate: '1990-05-15',
 *   birthTime: '14:30',
 *   longitude: 121.5,
 *   useSolarTime: true
 * };
 * ```
 * 
 * @see {@link BaziV1CalculateRequest} V1 版本的擴展請求參數
 * @see {@link BaziCalculateResponse} 對應的回應類型
 */
export interface BaziCalculateRequest {
  /** 
   * 姓名
   * @remarks 用於報告顯示，不影響計算結果
   */
  name: string;
  
  /** 
   * 性別
   * @remarks 支援中英文格式，內部會自動轉換
   * @example 'male' | 'female' | '男' | '女'
   */
  gender: 'male' | 'female' | '男' | '女';
  
  /** 
   * 出生日期
   * @remarks 格式：YYYY-MM-DD（ISO 8601）
   * @example '1990-05-15'
   */
  birthDate: string;
  
  /** 
   * 出生時間
   * @remarks 格式：HH:MM（24 小時制）
   * @example '14:30'
   */
  birthTime: string;
  
  /** 
   * 時區偏移（分鐘）
   * @remarks 東時區為正，西時區為負。例如：UTC+8 = 480
   * @default 480 (UTC+8 台北時區)
   */
  timezoneOffsetMinutes?: number;
  
  /** 
   * 出生地點經度
   * @remarks 用於真太陽時計算，範圍：-180 至 180
   * @example 121.5 (台北)
   */
  longitude?: number;
  
  /** 
   * 是否使用真太陽時
   * @remarks 啟用後會根據經度修正當地時間
   * @default false
   */
  useSolarTime?: boolean;
}

/**
 * V1 API 擴展請求參數
 * 
 * 繼承自 {@link BaziCalculateRequest}，提供更精細的時間控制和計算模式選項。
 * 用於 V1 API (`/v1-bazi-calculate`, `/v1-bazi-analyze`)。
 * 
 * @extends BaziCalculateRequest
 * 
 * @example 使用分離的日期時間欄位
 * ```typescript
 * const request: BaziV1CalculateRequest = {
 *   name: '王小明',
 *   gender: 'male',
 *   year: 1990,
 *   month: 5,
 *   day: 15,
 *   hour: 14,
 *   minute: 30,
 *   solarTimeMode: 'auto',
 *   ziMode: 'earlyZi'
 * };
 * ```
 * 
 * @example 使用字串格式
 * ```typescript
 * const request: BaziV1CalculateRequest = {
 *   name: '王小明',
 *   gender: 'male',
 *   birthDate: '1990-05-15',
 *   birthTime: '14:30',
 *   solarTimeMode: 'forced',
 *   longitude: 121.5
 * };
 * ```
 * 
 * @see {@link BaziCalculateRequest} 基礎請求類型
 * @see {@link BaziV1Response} 對應的回應類型
 */
export interface BaziV1CalculateRequest extends BaziCalculateRequest {
  /** 
   * 年份（可選）
   * @remarks 用於覆蓋 birthDate 中的年份
   * @example 1990
   */
  year?: number;
  
  /** 
   * 月份（可選）
   * @remarks 用於覆蓋 birthDate 中的月份，範圍：1-12
   * @example 5
   */
  month?: number;
  
  /** 
   * 日期（可選）
   * @remarks 用於覆蓋 birthDate 中的日期，範圍：1-31
   * @example 15
   */
  day?: number;
  
  /** 
   * 小時（可選）
   * @remarks 用於覆蓋 birthTime 中的小時，範圍：0-23
   * @example 14
   */
  hour?: number;
  
  /** 
   * 分鐘（可選）
   * @remarks 用於覆蓋 birthTime 中的分鐘，範圍：0-59
   * @example 30
   */
  minute?: number;
  
  /** 
   * 真太陽時計算模式
   * - `off`: 關閉真太陽時計算
   * - `auto`: 自動偵測（需提供經度）
   * - `forced`: 強制使用（需提供經度）
   * @default 'off'
   */
  solarTimeMode?: 'off' | 'auto' | 'forced';
  
  /** 
   * 子時處理模式
   * - `earlyZi`: 早子時（23:00-00:00 屬當日）
   * - `lateZi`: 晚子時（23:00-00:00 屬次日）
   * - `splitZi`: 分割子時（23:00-00:00 為夜子時，00:00-01:00 為正子時）
   * @default 'earlyZi'
   * @remarks 不同流派對子時的處理方式不同，此選項允許使用者選擇
   */
  ziMode?: 'earlyZi' | 'lateZi' | 'splitZi';
}

// ============ 基礎資料結構 ============

/**
 * 單柱資訊
 * 
 * 代表八字四柱中的單一柱位（年/月/日/時）。
 * 包含天干、地支及可選的納音資訊。
 * 
 * @example
 * ```typescript
 * const yearPillar: Pillar = {
 *   stem: '庚',    // 天干
 *   branch: '午',  // 地支
 *   nayin: '路旁土' // 納音
 * };
 * ```
 * 
 * @see {@link FourPillars} 四柱結構
 */
export interface Pillar {
  /** 
   * 天干
   * @remarks 十天干之一：甲、乙、丙、丁、戊、己、庚、辛、壬、癸
   * @example '甲'
   */
  stem: string;
  
  /** 
   * 地支
   * @remarks 十二地支之一：子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥
   * @example '子'
   */
  branch: string;
  
  /** 
   * 納音（可選）
   * @remarks 六十甲子納音，如「海中金」、「爐中火」等
   * @example '海中金'
   */
  nayin?: string;
}

/**
 * 四柱結構
 * 
 * 完整的八字四柱資訊，包含年、月、日、時四個柱位。
 * 這是八字命理的核心資料結構。
 * 
 * @example
 * ```typescript
 * const pillars: FourPillars = {
 *   year:  { stem: '庚', branch: '午', nayin: '路旁土' },
 *   month: { stem: '丁', branch: '亥', nayin: '屋上土' },
 *   day:   { stem: '甲', branch: '子', nayin: '海中金' },
 *   hour:  { stem: '丙', branch: '寅', nayin: '爐中火' }
 * };
 * ```
 * 
 * @see {@link Pillar} 單柱資訊
 */
export interface FourPillars {
  /** 
   * 年柱
   * @remarks 代表祖先、父母、童年運勢（0-16歲）
   */
  year: Pillar;
  
  /** 
   * 月柱
   * @remarks 代表兄弟姐妹、青年運勢（17-32歲）
   */
  month: Pillar;
  
  /** 
   * 日柱
   * @remarks 代表自己、配偶、中年運勢（33-48歲），日干為「日主」
   */
  day: Pillar;
  
  /** 
   * 時柱
   * @remarks 代表子女、晚年運勢（49歲以後）
   */
  hour: Pillar;
}

/**
 * 藏干類型
 * 
 * 地支中隱藏的天干分為三種類型，依力量強弱排序：
 * - `本氣`：主氣，力量最強
 * - `中氣`：次要氣，力量中等
 * - `餘氣`：殘餘氣，力量最弱
 * 
 * @example
 * ```typescript
 * // 寅木的藏干：本氣甲木、中氣丙火、餘氣戊土
 * const hiddenStems = [
 *   { stem: '甲', type: '本氣', ratio: 0.6 },
 *   { stem: '丙', type: '中氣', ratio: 0.3 },
 *   { stem: '戊', type: '餘氣', ratio: 0.1 }
 * ];
 * ```
 */
export type HiddenStemType = '本氣' | '中氣' | '餘氣';

/**
 * 藏干項目
 * 
 * 描述地支中單一藏干的詳細資訊。
 * 
 * @example
 * ```typescript
 * const mainQi: HiddenStemItem = {
 *   stem: '甲',
 *   type: '本氣',
 *   ratio: 0.6
 * };
 * ```
 * 
 * @see {@link HiddenStemType} 藏干類型
 * @see {@link HiddenStems} 完整藏干結構
 */
export interface HiddenStemItem {
  /** 
   * 天干
   * @remarks 藏於地支中的天干
   */
  stem: string;
  
  /** 
   * 藏干類型
   * @remarks 本氣 > 中氣 > 餘氣
   */
  type: HiddenStemType;
  
  /** 
   * 力量比例
   * @remarks 範圍 0-1，所有藏干比例總和為 1
   * @example 0.6 表示佔 60% 的力量
   */
  ratio: number;
}

/**
 * 藏干結構（按柱位）
 * 
 * 四柱各地支的藏干詳細資訊。
 * 
 * @example
 * ```typescript
 * const hiddenStems: HiddenStems = {
 *   year: [{ stem: '己', type: '本氣', ratio: 0.6 }, { stem: '丁', type: '中氣', ratio: 0.4 }],
 *   month: [{ stem: '壬', type: '本氣', ratio: 0.7 }, { stem: '甲', type: '餘氣', ratio: 0.3 }],
 *   day: [{ stem: '癸', type: '本氣', ratio: 1.0 }],
 *   hour: [{ stem: '甲', type: '本氣', ratio: 0.6 }, { stem: '丙', type: '中氣', ratio: 0.3 }, { stem: '戊', type: '餘氣', ratio: 0.1 }]
 * };
 * ```
 * 
 * @see {@link HiddenStemItem} 藏干項目
 */
export interface HiddenStems {
  /** 年柱藏干 */
  year: HiddenStemItem[];
  /** 月柱藏干 */
  month: HiddenStemItem[];
  /** 日柱藏干 */
  day: HiddenStemItem[];
  /** 時柱藏干 */
  hour: HiddenStemItem[];
}

/**
 * 柱位名稱（英文）
 * 
 * 用於 API 回應和程式內部處理。
 * 
 * @see {@link PillarNameChinese} 中文柱位名稱
 */
export type PillarName = 'year' | 'month' | 'day' | 'hour';

/**
 * 柱位名稱（中文）
 * 
 * 用於顯示和中文介面。
 * 
 * @see {@link PillarName} 英文柱位名稱
 */
export type PillarNameChinese = '年' | '月' | '日' | '時';

// ============ 五行與陰陽 ============

/**
 * 五行元素
 * 
 * 中國傳統哲學的五種基本元素，構成萬物的基礎。
 * 
 * 五行相生：木生火、火生土、土生金、金生水、水生木
 * 五行相剋：木剋土、土剋水、水剋火、火剋金、金剋木
 * 
 * @example
 * ```typescript
 * const element: WuxingElement = '木';
 * 
 * // 使用類型守衛驗證
 * if (isWuxingElement(userInput)) {
 *   console.log('有效的五行元素');
 * }
 * ```
 * 
 * @see {@link isWuxingElement} 五行類型守衛
 */
export type WuxingElement = '木' | '火' | '土' | '金' | '水';

/**
 * 五行分數
 * 
 * 記錄八字中各五行的力量分數。
 * 用於分析命局的五行平衡狀態。
 * 
 * @example
 * ```typescript
 * const scores: WuxingScores = {
 *   木: 2.5,
 *   火: 1.8,
 *   土: 3.2,
 *   金: 1.5,
 *   水: 2.0
 * };
 * 
 * // 計算總分
 * const total = Object.values(scores).reduce((a, b) => a + b, 0);
 * ```
 * 
 * @see {@link WuxingBreakdown} 五行詳細分析
 */
export interface WuxingScores {
  /** 木的力量分數 */
  木: number;
  /** 火的力量分數 */
  火: number;
  /** 土的力量分數 */
  土: number;
  /** 金的力量分數 */
  金: number;
  /** 水的力量分數 */
  水: number;
}

/**
 * 五行詳細分析
 * 
 * 單一五行元素的詳細分析資訊，包含分數、百分比和來源明細。
 * 
 * @example
 * ```typescript
 * const woodBreakdown: WuxingBreakdown = {
 *   element: '木',
 *   score: 2.5,
 *   percentage: 25,
 *   sources: [
 *     { pillar: 'year', type: 'stem', value: 1.5 },
 *     { pillar: 'day', type: 'hiddenStem', value: 1.0 }
 *   ]
 * };
 * ```
 * 
 * @see {@link WuxingScores} 五行分數
 * @see {@link WuxingSource} 五行來源
 */
export interface WuxingBreakdown {
  /** 五行名稱 */
  element: WuxingElement;
  /** 
   * 總分
   * @remarks 所有來源的分數總和
   */
  score: number;
  /** 
   * 百分比
   * @remarks 佔全部五行的比例 (0-100)
   */
  percentage: number;
  /** 
   * 來源明細
   * @remarks 詳細列出每個來源的貢獻
   */
  sources?: WuxingSource[];
}

/**
 * 五行來源
 * 
 * 描述五行分數的來源，可追蹤至具體的柱位和類型。
 * 
 * @example
 * ```typescript
 * const source: WuxingSource = {
 *   pillar: 'year',
 *   type: 'stem',
 *   value: 1.5
 * };
 * ```
 * 
 * @remarks 計算權重：
 * - 天干 (stem): 1.5
 * - 地支 (branch): 1.0
 * - 藏干 (hiddenStem): 依 ratio 計算 (本氣 0.6, 中氣 0.4, 餘氣 0.3)
 * - 月令: ×1.5 加成
 */
export interface WuxingSource {
  /** 柱位 */
  pillar: PillarName;
  /** 
   * 來源類型
   * - `stem`: 天干
   * - `branch`: 地支
   * - `hiddenStem`: 藏干
   */
  type: 'stem' | 'branch' | 'hiddenStem';
  /** 貢獻值 */
  value: number;
}

/**
 * 陰陽類型
 * 
 * 中國哲學的基本二元概念。
 * - `yin`: 陰（柔、靜、內）
 * - `yang`: 陽（剛、動、外）
 * 
 * @remarks 天干陰陽：甲丙戊庚壬為陽，乙丁己辛癸為陰
 * @remarks 地支陰陽：子寅辰午申戌為陽，丑卯巳未酉亥為陰
 */
export type YinYangType = 'yin' | 'yang';

/**
 * 陰陽比例
 * 
 * 八字中陰陽的分布比例。
 * 
 * @example
 * ```typescript
 * const ratio: YinYangRatio = {
 *   yin: 0.375,  // 37.5%
 *   yang: 0.625, // 62.5%
 *   yinCount: 3,
 *   yangCount: 5
 * };
 * ```
 * 
 * @remarks 八字共有 8 個字（4 天干 + 4 地支），陰陽數量總和為 8
 */
export interface YinYangRatio {
  /** 
   * 陰比例
   * @remarks 範圍 0-1
   */
  yin: number;
  /** 
   * 陽比例
   * @remarks 範圍 0-1，yin + yang = 1
   */
  yang: number;
  /** 
   * 陰數量
   * @remarks 八字中陰性元素的個數
   */
  yinCount: number;
  /** 
   * 陽數量
   * @remarks 八字中陽性元素的個數
   */
  yangCount: number;
}

// ============ 十神 ============

/**
 * 十神名稱
 * 
 * 十神是八字命理的核心概念，表示日主與其他天干的關係。
 * 
 * | 類別 | 同陰陽 | 異陰陽 |
 * |------|--------|--------|
 * | 比劫 | 比肩   | 劫財   |
 * | 食傷 | 食神   | 傷官   |
 * | 財星 | 偏財   | 正財   |
 * | 官殺 | 七殺   | 正官   |
 * | 印星 | 偏印   | 正印   |
 * 
 * @example
 * ```typescript
 * const god: TenGodName = '正官';
 * 
 * // 使用類型守衛驗證
 * if (isTenGodName(userInput)) {
 *   console.log('有效的十神');
 * }
 * ```
 * 
 * @see {@link isTenGodName} 十神類型守衛
 * @see {@link TenGodCategory} 十神類別
 */
export type TenGodName = 
  | '比肩' | '劫財'     // 比劫：同我者
  | '食神' | '傷官'     // 食傷：我生者
  | '正財' | '偏財'     // 財星：我剋者
  | '正官' | '七殺'     // 官殺：剋我者
  | '正印' | '偏印';    // 印星：生我者

/**
 * 十神類別
 * 
 * 將十神分為五大類，便於分析命局特徵。
 * 
 * @remarks
 * - **比劫**：競爭、合作、兄弟姐妹
 * - **食傷**：才華、創造力、子女
 * - **財星**：財富、物質、父親
 * - **官殺**：事業、壓力、丈夫（女命）
 * - **印星**：學習、保護、母親
 */
export type TenGodCategory = '比劫' | '食傷' | '財星' | '官殺' | '印星';

/**
 * 十神分支項目
 * 
 * 描述地支藏干對應的十神資訊。
 * 
 * @example
 * ```typescript
 * const branchItem: TenGodBranchItem = {
 *   stem: '甲',
 *   tenGod: '偏印',
 *   type: '本氣'
 * };
 * ```
 */
export interface TenGodBranchItem {
  /** 藏干天干 */
  stem: string;
  /** 對應十神 */
  tenGod: TenGodName | string;
  /** 藏干類型 */
  type: HiddenStemType;
}

/**
 * 十神項目
 * 
 * 單一柱位的十神完整資訊。
 * 
 * @example
 * ```typescript
 * const tenGod: TenGodItem = {
 *   pillar: '年',
 *   stem: '庚',
 *   tenGod: '七殺',
 *   branchTenGods: [
 *     { stem: '己', tenGod: '正印', type: '本氣' },
 *     { stem: '丁', tenGod: '傷官', type: '中氣' }
 *   ]
 * };
 * ```
 * 
 * @see {@link TenGodBranchItem} 地支藏干十神
 */
export interface TenGodItem {
  /** 
   * 柱位
   * @remarks 可為中文或英文格式
   */
  pillar: PillarNameChinese | string;
  /** 天干 */
  stem: string;
  /** 天干對應的十神 */
  tenGod: TenGodName | string;
  /** 
   * 地支藏干的十神
   * @remarks 可選，詳細列出地支中每個藏干的十神
   */
  branchTenGods?: TenGodBranchItem[];
}

/**
 * 十神統計
 * 
 * 單一十神的統計資訊。
 * 
 * @example
 * ```typescript
 * const stats: TenGodStats = {
 *   name: '正官',
 *   category: '官殺',
 *   count: 2,
 *   pillars: ['month', 'hour']
 * };
 * ```
 */
export interface TenGodStats {
  /** 十神名稱 */
  name: TenGodName;
  /** 所屬類別 */
  category: TenGodCategory;
  /** 
   * 出現次數
   * @remarks 包含天干和藏干中的出現
   */
  count: number;
  /** 出現的柱位列表 */
  pillars: PillarName[];
}

// ============ 神煞 ============

/**
 * 神煞類別
 * 
 * 神煞分類，用於區分不同性質的神煞。
 * 
 * @remarks
 * - **吉神**：帶來好運和保護的神煞
 * - **凶煞**：帶來挑戰或注意事項的神煞
 * - **桃花**：與感情、人緣相關的神煞
 * - **陰陽**：與陰陽能量相關的神煞
 * - **刑衝害破**：地支之間的特殊關係
 * - **其他**：未分類的神煞
 */
export type ShenshaCategory = 
  | '吉神' 
  | '凶煞' 
  | '桃花' 
  | '陰陽' 
  | '刑衝害破'
  | '其他';

/**
 * 神煞稀有度
 * 
 * 表示神煞的稀有程度。
 * 
 * @remarks
 * - `common`: 常見，約 30% 以上的八字會出現
 * - `uncommon`: 少見，約 10-30% 的八字會出現
 * - `rare`: 稀有，約 1-10% 的八字會出現
 * - `legendary`: 傳奇，少於 1% 的八字會出現
 */
export type ShenshaRarity = 
  | 'common'     // 常見
  | 'uncommon'   // 少見
  | 'rare'       // 稀有
  | 'legendary'; // 傳奇

/**
 * 神煞項目
 * 
 * 單一神煞的完整資訊，包含匹配規則和詮釋。
 * 
 * @example
 * ```typescript
 * const shensha: ShenshaItem = {
 *   name: '天乙貴人',
 *   category: '吉神',
 *   effect: '逢凶化吉，遇難呈祥',
 *   matched_pillar: 'year',
 *   matched_value: '丑',
 *   why_matched: '日主甲見丑為天乙貴人',
 *   rarity: 'uncommon',
 *   modern_meaning: '貴人運強，容易獲得他人幫助',
 *   buff_or_debuff: 'buff'
 * };
 * ```
 * 
 * @see {@link ShenshaCategory} 神煞類別
 * @see {@link ShenshaRarity} 神煞稀有度
 */
export interface ShenshaItem {
  /** 神煞名稱 */
  name: string;
  /** 
   * 神煞類別
   * @remarks 可能是標準類別或自定義字串
   */
  category: ShenshaCategory | string;
  /** 效果描述（傳統詮釋） */
  effect: string;
  /** 
   * 匹配柱位
   * @remarks 神煞出現的柱位
   */
  matched_pillar: PillarName | string;
  /** 
   * 匹配值
   * @remarks 觸發神煞的天干或地支
   */
  matched_value: string;
  /** 
   * 匹配原因
   * @remarks 解釋為何觸發此神煞
   */
  why_matched: string;
  /** 稀有度 */
  rarity?: ShenshaRarity;
  /** 
   * 規則參考
   * @remarks 來源典籍或規則編號
   */
  rule_ref?: string;
  /** 現代詮釋 */
  modern_meaning?: string;
  /** 
   * 吉凶屬性
   * - `buff`: 吉神，正面影響
   * - `debuff`: 凶煞，需要注意
   * - `neutral`: 中性，視情況而定
   */
  buff_or_debuff?: 'buff' | 'debuff' | 'neutral';
}

/**
 * 神煞統計
 * 
 * 八字中神煞的整體統計資訊。
 * 
 * @example
 * ```typescript
 * const stats: ShenshaStats = {
 *   auspicious: 5,
 *   inauspicious: 2,
 *   total: 8,
 *   byCategory: {
 *     '吉神': [...],
 *     '凶煞': [...],
 *     // ...
 *   }
 * };
 * ```
 */
export interface ShenshaStats {
  /** 吉神數量 */
  auspicious: number;
  /** 凶煞數量 */
  inauspicious: number;
  /** 總數 */
  total: number;
  /** 
   * 按類別分組
   * @remarks 以類別為鍵，神煞陣列為值
   */
  byCategory: Record<ShenshaCategory, ShenshaItem[]>;
}

// ============ 納音 ============

/**
 * 納音項目
 * 
 * 單一柱位的納音資訊。納音是六十甲子與五行的對應關係。
 * 
 * @example
 * ```typescript
 * const nayin: NayinItem = {
 *   pillar: 'day',
 *   ganzhi: '甲子',
 *   nayin: '海中金',
 *   element: '金'
 * };
 * ```
 * 
 * @remarks 六十甲子共有 30 種納音，每種納音對應兩個干支組合
 */
export interface NayinItem {
  /** 柱位 */
  pillar: PillarName;
  /** 干支組合 */
  ganzhi: string;
  /** 
   * 納音名稱
   * @example '海中金', '爐中火', '大林木'
   */
  nayin: string;
  /** 納音五行 */
  element: WuxingElement;
}

// ============ 回應類型 ============

/**
 * Legacy API 回應資料
 * 
 * `/bazi-api` 端點的回應資料結構。
 * 
 * @see {@link BaziCalculateResponse} 完整回應格式
 */
export interface BaziCalculateData {
  /** 姓名 */
  name: string;
  /** 性別 */
  gender: string;
  /** 出生日期 */
  birthDate: string;
  /** 出生時間 */
  birthTime: string;
  /** 四柱資訊 */
  pillars: FourPillars;
  /** 藏干資訊 */
  hiddenStems: HiddenStems;
  /** 五行分數 */
  wuxingScores: WuxingScores;
  /** 陰陽比例 */
  yinyangRatio: YinYangRatio;
  /** 十神列表（可選） */
  tenGods?: TenGodItem[];
  /** 神煞列表（可選） */
  shensha?: ShenshaItem[];
  /** 計算時間戳記 */
  calculatedAt: string;
}

/**
 * 八字計算回應 (Legacy 格式)
 * 
 * `/bazi-api` 端點的完整回應結構。
 * 
 * @example 成功回應
 * ```typescript
 * const response: BaziCalculateResponse = {
 *   success: true,
 *   data: {
 *     name: '王小明',
 *     gender: 'male',
 *     // ... 其他資料
 *   }
 * };
 * ```
 * 
 * @example 錯誤回應
 * ```typescript
 * const response: BaziCalculateResponse = {
 *   success: false,
 *   error: 'Invalid birth date format'
 * };
 * ```
 * 
 * @see {@link BaziCalculateData} 回應資料結構
 */
export interface BaziCalculateResponse {
  /** 是否成功 */
  success: boolean;
  /** 
   * 計算結果資料
   * @remarks 僅在 success=true 時存在
   */
  data?: BaziCalculateData;
  /** 
   * 錯誤訊息
   * @remarks 僅在 success=false 時存在
   */
  error?: string;
  /** 附加訊息 */
  message?: string;
}

/**
 * V1 API 輸入回顯
 * 
 * V1 API 回應中的輸入參數回顯。
 */
export interface BaziV1Input {
  /** 姓名 */
  name: string;
  /** 性別 */
  gender: string;
  /** 出生日期 */
  birthDate: string;
  /** 出生時間 */
  birthTime: string;
}

/**
 * V1 API 分析資料
 * 
 * V1 API 回應中的分析結果部分。
 */
export interface BaziV1Analysis {
  /** 五行分數 */
  wuxing: WuxingScores;
  /** 陰陽比例 */
  yinyang: YinYangRatio;
  /** 十神列表 */
  tenGods: TenGodItem[];
  /** 神煞列表 */
  shensha: ShenshaItem[];
}

/**
 * V1 API 回應資料
 * 
 * V1 API 回應的核心資料結構。
 * 
 * @see {@link BaziV1Response} 完整回應格式
 */
export interface BaziV1Data {
  /** 輸入參數回顯 */
  input: BaziV1Input;
  /** 四柱資訊 */
  pillars: FourPillars;
  /** 藏干資訊 */
  hiddenStems: HiddenStems;
  /** 分析結果 */
  analysis: BaziV1Analysis;
}

/**
 * V1 API 回應格式
 * 
 * `/v1-bazi-calculate` 和 `/v1-bazi-analyze` 端點的完整回應結構。
 * 
 * @example
 * ```typescript
 * const response: BaziV1Response = {
 *   version: '1.0',
 *   timestamp: '2024-01-15T10:30:00Z',
 *   data: {
 *     input: { ... },
 *     pillars: { ... },
 *     hiddenStems: { ... },
 *     analysis: { ... }
 *   }
 * };
 * ```
 * 
 * @see {@link BaziV1Data} 回應資料結構
 */
export interface BaziV1Response {
  /** 
   * API 版本
   * @example '1.0'
   */
  version: string;
  /** 
   * 時間戳記
   * @remarks ISO 8601 格式
   */
  timestamp: string;
  /** 計算結果資料 */
  data: BaziV1Data;
}

// ============ 配置與錯誤 ============

/**
 * SDK 配置選項
 * 
 * 用於初始化 BaziAPIClient 的配置參數。
 * 
 * @example
 * ```typescript
 * const config: BaziSDKConfig = {
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://your-domain.supabase.co/functions/v1',
 *   maxRetries: 3,
 *   initialRetryDelay: 1000,
 *   timeout: 30000
 * };
 * 
 * const client = new BaziAPIClient(config);
 * ```
 * 
 * @see BaziAPIClient SDK 客戶端類別
 */
export interface BaziSDKConfig {
  /** 
   * API 金鑰
   * @remarks 必填，用於身份驗證
   */
  apiKey: string;
  /** 
   * API 基礎 URL
   * @default 'https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1'
   */
  baseUrl?: string;
  /** 
   * 最大重試次數
   * @default 3
   * @remarks 429 和 5xx 錯誤會自動重試
   */
  maxRetries?: number;
  /** 
   * 初始重試延遲（毫秒）
   * @default 1000
   * @remarks 使用指數退避策略
   */
  initialRetryDelay?: number;
  /** 
   * 請求超時（毫秒）
   * @default 30000
   */
  timeout?: number;
}

/**
 * API 錯誤碼
 * 
 * 標準化的錯誤碼，便於錯誤處理。
 * 
 * | 錯誤碼 | HTTP 狀態碼 | 說明 |
 * |--------|-------------|------|
 * | UNAUTHORIZED | 401 | API 金鑰無效或缺失 |
 * | FORBIDDEN | 403 | 無權存取此資源 |
 * | NOT_FOUND | 404 | 端點不存在 |
 * | RATE_LIMITED | 429 | 請求過於頻繁 |
 * | VALIDATION_ERROR | 400 | 請求參數驗證失敗 |
 * | INTERNAL_ERROR | 500 | 伺服器內部錯誤 |
 * | TIMEOUT | 408 | 請求超時 |
 * | NETWORK_ERROR | - | 網路連線錯誤 |
 */
export type BaziErrorCode = 
  | 'UNAUTHORIZED'      // 401 - 未授權
  | 'FORBIDDEN'         // 403 - 禁止存取
  | 'NOT_FOUND'         // 404 - 資源不存在
  | 'RATE_LIMITED'      // 429 - 請求過於頻繁
  | 'VALIDATION_ERROR'  // 400 - 驗證錯誤
  | 'INTERNAL_ERROR'    // 500 - 內部錯誤
  | 'TIMEOUT'           // 408 - 請求超時
  | 'NETWORK_ERROR';    // 網路錯誤

/**
 * API 錯誤資訊
 * 
 * 結構化的錯誤資訊，便於錯誤處理和顯示。
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await client.calculate(request);
 * } catch (error) {
 *   if (isBaziAPIError(error)) {
 *     console.error(`錯誤 ${error.statusCode}: ${error.message}`);
 *     if (error.retryable) {
 *       // 可以重試
 *     }
 *   }
 * }
 * ```
 * 
 * @see {@link isBaziAPIError} 錯誤類型守衛
 */
export interface BaziErrorInfo {
  /** 錯誤訊息 */
  message: string;
  /** HTTP 狀態碼 */
  statusCode: number;
  /** 
   * 錯誤碼
   * @remarks 標準化的錯誤類型
   */
  errorCode?: BaziErrorCode;
  /** 
   * 是否可重試
   * @remarks 429 和 5xx 錯誤通常可重試
   */
  retryable: boolean;
}

// ============ 軍團相關類型 ============

/**
 * 軍團類型
 * 
 * 四時軍團系統將八字四柱映射為四個軍團。
 * 
 * | 軍團 | 柱位 | 象徵意義 |
 * |------|------|----------|
 * | family | 年柱 | 家族傳承、祖先庇護 |
 * | growth | 月柱 | 成長歷程、兄弟姐妹 |
 * | self | 日柱 | 自我本質、核心性格 |
 * | future | 時柱 | 未來願景、子女緣分 |
 */
export type LegionType = 'family' | 'growth' | 'self' | 'future';

/**
 * 軍團角色
 * 
 * 軍團中的成員角色。
 * 
 * | 角色 | 對應 | 說明 |
 * |------|------|------|
 * | commander | 天干 | 主將，決定軍團方向 |
 * | advisor | 地支 | 軍師，提供智謀支援 |
 * | lieutenant | 藏干本氣 | 副將，執行主要任務 |
 * | specialist | 藏干中氣/餘氣 | 特種兵，提供特殊能力 |
 */
export type LegionRole = 'commander' | 'advisor' | 'lieutenant' | 'specialist';

/**
 * 軍團成員
 * 
 * 單一軍團成員的詳細資訊。
 * 
 * @example
 * ```typescript
 * const commander: LegionMember = {
 *   role: 'commander',
 *   name: '森林將軍',
 *   element: '木',
 *   yinyang: 'yang',
 *   buff: '領導力強，善於開創',
 *   debuff: '過於強勢，容易衝突'
 * };
 * ```
 */
export interface LegionMember {
  /** 角色類型 */
  role: LegionRole;
  /** 角色名稱 */
  name: string;
  /** 所屬五行 */
  element: WuxingElement;
  /** 陰陽屬性 */
  yinyang: YinYangType;
  /** 
   * Buff 描述
   * @remarks 正面特質或優勢
   */
  buff?: string;
  /** 
   * Debuff 描述
   * @remarks 需要注意的特質或挑戰
   */
  debuff?: string;
}

/**
 * 軍團資訊
 * 
 * 完整的軍團資訊，包含所有成員和戰場環境。
 * 
 * @example
 * ```typescript
 * const legion: LegionInfo = {
 *   type: 'self',
 *   pillar: 'day',
 *   members: [
 *     { role: 'commander', name: '森林將軍', element: '木', yinyang: 'yang' },
 *     { role: 'advisor', name: '夜行刺客', element: '水', yinyang: 'yang' }
 *   ],
 *   battlefield: '海中金',
 *   battlefieldElement: '金'
 * };
 * ```
 * 
 * @see {@link LegionMember} 軍團成員
 */
export interface LegionInfo {
  /** 軍團類型 */
  type: LegionType;
  /** 對應柱位 */
  pillar: PillarName;
  /** 成員列表 */
  members: LegionMember[];
  /** 
   * 戰場（納音）
   * @remarks 納音決定戰場環境
   */
  battlefield: string;
  /** 戰場五行 */
  battlefieldElement: WuxingElement;
}

// ============ 工具類型 ============

/**
 * 深層唯讀
 * 
 * 將物件的所有屬性（包含巢狀）設為唯讀。
 * 
 * @typeParam T - 要轉換的類型
 * 
 * @example
 * ```typescript
 * type ReadonlyPillars = DeepReadonly<FourPillars>;
 * // 所有屬性都無法修改
 * ```
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 部分必填
 * 
 * 將指定屬性設為必填，其餘保持原狀。
 * 
 * @typeParam T - 原始類型
 * @typeParam K - 要設為必填的屬性鍵
 * 
 * @example
 * ```typescript
 * type RequiredName = PartialRequired<BaziCalculateRequest, 'name' | 'gender'>;
 * // name 和 gender 為必填，其餘為可選
 * ```
 */
export type PartialRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * API 回應包裝
 * 
 * 泛型回應類型，統一成功和失敗的回應格式。
 * 
 * @typeParam T - 成功時的資料類型
 * 
 * @example
 * ```typescript
 * type CalculateResult = ApiResponse<BaziCalculateData>;
 * 
 * function handleResponse(response: CalculateResult) {
 *   if (response.success) {
 *     console.log(response.data); // 類型為 BaziCalculateData
 *   } else {
 *     console.error(response.error); // 類型為 string
 *   }
 * }
 * ```
 */
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ============ 類型守衛 ============

/**
 * 檢查是否為有效的五行元素
 * 
 * 類型守衛函數，用於在運行時驗證並縮窄類型。
 * 
 * @param value - 要檢查的值
 * @returns 如果是有效的五行元素則返回 true
 * 
 * @example
 * ```typescript
 * const userInput: unknown = '木';
 * 
 * if (isWuxingElement(userInput)) {
 *   // userInput 現在被推斷為 WuxingElement 類型
 *   const element: WuxingElement = userInput;
 * }
 * ```
 * 
 * @see {@link WuxingElement} 五行元素類型
 */
export function isWuxingElement(value: unknown): value is WuxingElement {
  return typeof value === 'string' && ['木', '火', '土', '金', '水'].includes(value);
}

/**
 * 檢查是否為有效的十神名稱
 * 
 * 類型守衛函數，用於在運行時驗證並縮窄類型。
 * 
 * @param value - 要檢查的值
 * @returns 如果是有效的十神名稱則返回 true
 * 
 * @example
 * ```typescript
 * const userInput: unknown = '正官';
 * 
 * if (isTenGodName(userInput)) {
 *   // userInput 現在被推斷為 TenGodName 類型
 *   const god: TenGodName = userInput;
 * }
 * ```
 * 
 * @see {@link TenGodName} 十神名稱類型
 */
export function isTenGodName(value: unknown): value is TenGodName {
  return typeof value === 'string' && [
    '比肩', '劫財', '食神', '傷官', 
    '正財', '偏財', '正官', '七殺', 
    '正印', '偏印'
  ].includes(value);
}

/**
 * 檢查是否為有效的柱位名稱
 * 
 * 類型守衛函數，用於在運行時驗證並縮窄類型。
 * 
 * @param value - 要檢查的值
 * @returns 如果是有效的柱位名稱則返回 true
 * 
 * @example
 * ```typescript
 * const pillar: unknown = 'day';
 * 
 * if (isPillarName(pillar)) {
 *   // pillar 現在被推斷為 PillarName 類型
 *   const name: PillarName = pillar;
 * }
 * ```
 * 
 * @see {@link PillarName} 柱位名稱類型
 */
export function isPillarName(value: unknown): value is PillarName {
  return typeof value === 'string' && ['year', 'month', 'day', 'hour'].includes(value);
}

/**
 * 檢查是否為 BaziAPIError
 * 
 * 類型守衛函數，用於在 catch 區塊中識別 API 錯誤。
 * 
 * @param error - 要檢查的錯誤物件
 * @returns 如果是 BaziErrorInfo 類型則返回 true
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await client.calculate(request);
 * } catch (error) {
 *   if (isBaziAPIError(error)) {
 *     // error 現在被推斷為 BaziErrorInfo 類型
 *     console.error(`API 錯誤 ${error.statusCode}: ${error.message}`);
 *     
 *     if (error.retryable) {
 *       // 實作重試邏輯
 *     }
 *   } else {
 *     // 其他類型的錯誤
 *     console.error('未知錯誤:', error);
 *   }
 * }
 * ```
 * 
 * @see {@link BaziErrorInfo} 錯誤資訊類型
 */
export function isBaziAPIError(error: unknown): error is BaziErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}

/**
 * 檢查是否為有效的神煞類別
 * 
 * @param value - 要檢查的值
 * @returns 如果是有效的神煞類別則返回 true
 * 
 * @example
 * ```typescript
 * if (isShenshaCategory(category)) {
 *   // category 現在被推斷為 ShenshaCategory 類型
 * }
 * ```
 * 
 * @see {@link ShenshaCategory} 神煞類別類型
 */
export function isShenshaCategory(value: unknown): value is ShenshaCategory {
  return typeof value === 'string' && 
    ['吉神', '凶煞', '桃花', '陰陽', '刑衝害破', '其他'].includes(value);
}

/**
 * 檢查是否為有效的軍團類型
 * 
 * @param value - 要檢查的值
 * @returns 如果是有效的軍團類型則返回 true
 * 
 * @example
 * ```typescript
 * if (isLegionType(type)) {
 *   // type 現在被推斷為 LegionType 類型
 * }
 * ```
 * 
 * @see {@link LegionType} 軍團類型
 */
export function isLegionType(value: unknown): value is LegionType {
  return typeof value === 'string' && 
    ['family', 'growth', 'self', 'future'].includes(value);
}

/**
 * 檢查是否為有效的軍團角色
 * 
 * @param value - 要檢查的值
 * @returns 如果是有效的軍團角色則返回 true
 * 
 * @example
 * ```typescript
 * if (isLegionRole(role)) {
 *   // role 現在被推斷為 LegionRole 類型
 * }
 * ```
 * 
 * @see {@link LegionRole} 軍團角色類型
 */
export function isLegionRole(value: unknown): value is LegionRole {
  return typeof value === 'string' && 
    ['commander', 'advisor', 'lieutenant', 'specialist'].includes(value);
}
