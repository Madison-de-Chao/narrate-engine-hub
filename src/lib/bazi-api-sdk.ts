/**
 * 虹靈御所 八字 API SDK
 * TypeScript 客戶端封裝，提供類型定義與自動重試功能
 */

// ============ 類型定義 ============

/** 八字計算請求參數 */
export interface BaziCalculateRequest {
  /** 姓名 */
  name: string;
  /** 性別 ('male' | 'female' | '男' | '女') */
  gender: 'male' | 'female' | '男' | '女';
  /** 出生日期 (YYYY-MM-DD) */
  birthDate: string;
  /** 出生時間 (HH:MM) */
  birthTime: string;
  /** 時區偏移（分鐘，東時區為正） */
  timezoneOffsetMinutes?: number;
  /** 出生地點經度（用於真太陽時計算） */
  longitude?: number;
  /** 是否使用真太陽時 */
  useSolarTime?: boolean;
}

/** 單柱資訊 */
export interface Pillar {
  /** 天干 */
  stem: string;
  /** 地支 */
  branch: string;
  /** 納音 */
  nayin?: string;
}

/** 四柱結構 */
export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

/** 藏干項目 */
export interface HiddenStemItem {
  stem: string;
  type: '本氣' | '中氣' | '餘氣';
  ratio: number;
}

/** 藏干結構 */
export interface HiddenStems {
  year: HiddenStemItem[];
  month: HiddenStemItem[];
  day: HiddenStemItem[];
  hour: HiddenStemItem[];
}

/** 五行分數 */
export interface WuxingScores {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

/** 陰陽比例 */
export interface YinYangRatio {
  yin: number;
  yang: number;
  yinCount: number;
  yangCount: number;
}

/** 十神項目 */
export interface TenGodItem {
  pillar: string;
  stem: string;
  tenGod: string;
  branchTenGods?: Array<{
    stem: string;
    tenGod: string;
    type: string;
  }>;
}

/** 神煞項目 */
export interface ShenshaItem {
  name: string;
  category: string;
  effect: string;
  matched_pillar: string;
  matched_value: string;
  why_matched: string;
  rarity?: string;
}

/** 八字計算回應 (Legacy 格式) */
export interface BaziCalculateResponse {
  success: boolean;
  data?: {
    name: string;
    gender: string;
    birthDate: string;
    birthTime: string;
    pillars: FourPillars;
    hiddenStems: HiddenStems;
    wuxingScores: WuxingScores;
    yinyangRatio: YinYangRatio;
    tenGods?: TenGodItem[];
    shensha?: ShenshaItem[];
    calculatedAt: string;
  };
  error?: string;
  message?: string;
}

/** V1 API 回應格式 */
export interface BaziV1Response {
  version: string;
  timestamp: string;
  data: {
    input: {
      name: string;
      gender: string;
      birthDate: string;
      birthTime: string;
    };
    pillars: FourPillars;
    hiddenStems: HiddenStems;
    analysis: {
      wuxing: WuxingScores;
      yinyang: YinYangRatio;
      tenGods: TenGodItem[];
      shensha: ShenshaItem[];
    };
  };
}

/** SDK 配置選項 */
export interface BaziSDKConfig {
  /** API 金鑰 */
  apiKey: string;
  /** API 基礎 URL（預設為生產環境） */
  baseUrl?: string;
  /** 最大重試次數（預設 3） */
  maxRetries?: number;
  /** 初始重試延遲毫秒（預設 1000） */
  initialRetryDelay?: number;
  /** 請求超時毫秒（預設 30000） */
  timeout?: number;
}

/** API 錯誤類型 */
export class BaziAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'BaziAPIError';
  }
}

// ============ SDK 客戶端 ============

export class BaziAPIClient {
  private config: Required<BaziSDKConfig>;

  constructor(config: BaziSDKConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1',
      maxRetries: config.maxRetries ?? 3,
      initialRetryDelay: config.initialRetryDelay ?? 1000,
      timeout: config.timeout ?? 30000,
    };
  }

  /**
   * 帶指數退避的重試請求
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 處理各種 HTTP 狀態碼
      if (response.ok) {
        return await response.json();
      }

      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.error || errorBody.message || response.statusText;

      // 判斷是否可重試
      const retryable = [429, 500, 502, 503, 504].includes(response.status);

      if (retryable && retryCount < this.config.maxRetries) {
        const delay = this.config.initialRetryDelay * Math.pow(2, retryCount);
        const jitter = delay * 0.1 * Math.random();
        
        console.warn(
          `[BaziAPI] 請求失敗 (${response.status})，${delay + jitter}ms 後重試 (${retryCount + 1}/${this.config.maxRetries})`
        );

        await this.sleep(delay + jitter);
        return this.fetchWithRetry<T>(url, options, retryCount + 1);
      }

      throw new BaziAPIError(errorMessage, response.status, errorBody.code, retryable);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof BaziAPIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new BaziAPIError('請求超時', 408, 'TIMEOUT', true);
      }

      // 網路錯誤，嘗試重試
      if (retryCount < this.config.maxRetries) {
        const delay = this.config.initialRetryDelay * Math.pow(2, retryCount);
        console.warn(`[BaziAPI] 網路錯誤，${delay}ms 後重試`);
        await this.sleep(delay);
        return this.fetchWithRetry<T>(url, options, retryCount + 1);
      }

      throw new BaziAPIError(
        error instanceof Error ? error.message : '未知錯誤',
        0,
        'NETWORK_ERROR',
        true
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 計算八字（Legacy API）
   */
  async calculate(request: BaziCalculateRequest): Promise<BaziCalculateResponse> {
    return this.fetchWithRetry<BaziCalculateResponse>(
      `${this.config.baseUrl}/bazi-api`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * 計算八字（V1 API - 基礎計算）
   */
  async v1Calculate(request: BaziCalculateRequest): Promise<BaziV1Response> {
    return this.fetchWithRetry<BaziV1Response>(
      `${this.config.baseUrl}/v1-bazi-calculate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * 分析八字（V1 API - 進階分析）
   */
  async v1Analyze(request: BaziCalculateRequest): Promise<BaziV1Response> {
    return this.fetchWithRetry<BaziV1Response>(
      `${this.config.baseUrl}/v1-bazi-analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * 驗證 API 金鑰是否有效
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // 使用簡單的測試請求驗證
      await this.calculate({
        name: 'API Test',
        gender: 'male',
        birthDate: '2000-01-01',
        birthTime: '12:00',
      });
      return true;
    } catch (error) {
      if (error instanceof BaziAPIError && error.statusCode === 401) {
        return false;
      }
      throw error;
    }
  }
}

// ============ 工廠函數 ============

/**
 * 建立 Bazi API 客戶端
 * 
 * @example
 * ```typescript
 * import { createBaziClient } from '@/lib/bazi-api-sdk';
 * 
 * const client = createBaziClient({
 *   apiKey: 'your-api-key',
 *   maxRetries: 3
 * });
 * 
 * const result = await client.calculate({
 *   name: '張三',
 *   gender: 'male',
 *   birthDate: '1990-05-15',
 *   birthTime: '14:30'
 * });
 * ```
 */
export function createBaziClient(config: BaziSDKConfig): BaziAPIClient {
  return new BaziAPIClient(config);
}

// 預設導出
export default BaziAPIClient;
