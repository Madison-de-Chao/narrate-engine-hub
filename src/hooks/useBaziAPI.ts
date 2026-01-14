/**
 * useBaziAPI - React Hook 封裝 Bazi API SDK
 * 簡化在 React 元件中使用八字 API
 */

import { useState, useCallback, useMemo } from 'react';
import {
  BaziAPIClient,
  BaziCalculateRequest,
  BaziCalculateResponse,
  BaziV1Response,
  BaziAPIError,
  BaziSDKConfig,
} from '@/lib/bazi-api-sdk';

/** API 請求狀態 */
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

/** Hook 回傳的狀態與方法 */
export interface UseBaziAPIReturn<T> {
  /** 請求資料 */
  data: T | null;
  /** 錯誤資訊 */
  error: BaziAPIError | null;
  /** 請求狀態 */
  status: RequestStatus;
  /** 是否載入中 */
  isLoading: boolean;
  /** 是否成功 */
  isSuccess: boolean;
  /** 是否錯誤 */
  isError: boolean;
  /** 重置狀態 */
  reset: () => void;
}

/** 計算方法回傳 */
export interface UseBaziCalculateReturn extends UseBaziAPIReturn<BaziCalculateResponse> {
  /** 執行計算 */
  calculate: (request: BaziCalculateRequest) => Promise<BaziCalculateResponse | null>;
}

/** V1 計算方法回傳 */
export interface UseBaziV1CalculateReturn extends UseBaziAPIReturn<BaziV1Response> {
  /** 執行 V1 計算 */
  calculate: (request: BaziCalculateRequest) => Promise<BaziV1Response | null>;
}

/** V1 分析方法回傳 */
export interface UseBaziV1AnalyzeReturn extends UseBaziAPIReturn<BaziV1Response> {
  /** 執行 V1 分析 */
  analyze: (request: BaziCalculateRequest) => Promise<BaziV1Response | null>;
}

/** 完整 Hook 配置 */
export interface UseBaziAPIConfig extends Partial<BaziSDKConfig> {
  /** API 金鑰（必填） */
  apiKey: string;
  /** 成功回調 */
  onSuccess?: (data: unknown) => void;
  /** 錯誤回調 */
  onError?: (error: BaziAPIError) => void;
}

/**
 * 建立基礎請求狀態 Hook
 */
function useRequestState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<BaziAPIError | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setStatus('idle');
  }, []);

  const startLoading = useCallback(() => {
    setError(null);
    setStatus('loading');
  }, []);

  const setSuccess = useCallback((result: T) => {
    setData(result);
    setError(null);
    setStatus('success');
  }, []);

  const setErrorState = useCallback((err: BaziAPIError) => {
    setError(err);
    setStatus('error');
  }, []);

  return {
    data,
    error,
    status,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    reset,
    startLoading,
    setSuccess,
    setErrorState,
  };
}

/**
 * Legacy API 計算 Hook
 * 
 * @example
 * ```tsx
 * const { calculate, data, isLoading, error } = useBaziCalculate({
 *   apiKey: 'your-api-key'
 * });
 * 
 * const handleSubmit = async () => {
 *   await calculate({
 *     name: '張三',
 *     gender: 'male',
 *     birthDate: '1990-05-15',
 *     birthTime: '14:30'
 *   });
 * };
 * ```
 */
export function useBaziCalculate(config: UseBaziAPIConfig): UseBaziCalculateReturn {
  const client = useMemo(() => new BaziAPIClient(config), [config]);
  const state = useRequestState<BaziCalculateResponse>();

  const calculate = useCallback(
    async (request: BaziCalculateRequest): Promise<BaziCalculateResponse | null> => {
      state.startLoading();
      try {
        const result = await client.calculate(request);
        state.setSuccess(result);
        config.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof BaziAPIError
          ? err
          : new BaziAPIError(
              err instanceof Error ? err.message : '未知錯誤',
              0,
              'UNKNOWN'
            );
        state.setErrorState(apiError);
        config.onError?.(apiError);
        return null;
      }
    },
    [client, state, config]
  );

  return {
    ...state,
    calculate,
  };
}

/**
 * V1 API 計算 Hook
 * 
 * @example
 * ```tsx
 * const { calculate, data, isLoading } = useBaziV1Calculate({
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export function useBaziV1Calculate(config: UseBaziAPIConfig): UseBaziV1CalculateReturn {
  const client = useMemo(() => new BaziAPIClient(config), [config]);
  const state = useRequestState<BaziV1Response>();

  const calculate = useCallback(
    async (request: BaziCalculateRequest): Promise<BaziV1Response | null> => {
      state.startLoading();
      try {
        const result = await client.v1Calculate(request);
        state.setSuccess(result);
        config.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof BaziAPIError
          ? err
          : new BaziAPIError(
              err instanceof Error ? err.message : '未知錯誤',
              0,
              'UNKNOWN'
            );
        state.setErrorState(apiError);
        config.onError?.(apiError);
        return null;
      }
    },
    [client, state, config]
  );

  return {
    ...state,
    calculate,
  };
}

/**
 * V1 API 分析 Hook
 * 
 * @example
 * ```tsx
 * const { analyze, data, isLoading } = useBaziV1Analyze({
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export function useBaziV1Analyze(config: UseBaziAPIConfig): UseBaziV1AnalyzeReturn {
  const client = useMemo(() => new BaziAPIClient(config), [config]);
  const state = useRequestState<BaziV1Response>();

  const analyze = useCallback(
    async (request: BaziCalculateRequest): Promise<BaziV1Response | null> => {
      state.startLoading();
      try {
        const result = await client.v1Analyze(request);
        state.setSuccess(result);
        config.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof BaziAPIError
          ? err
          : new BaziAPIError(
              err instanceof Error ? err.message : '未知錯誤',
              0,
              'UNKNOWN'
            );
        state.setErrorState(apiError);
        config.onError?.(apiError);
        return null;
      }
    },
    [client, state, config]
  );

  return {
    ...state,
    analyze,
  };
}

/**
 * 統一 API Hook - 提供所有 API 方法
 * 
 * @example
 * ```tsx
 * const api = useBaziAPI({ apiKey: 'your-key' });
 * 
 * // Legacy API
 * await api.legacy.calculate(request);
 * 
 * // V1 API
 * await api.v1.calculate(request);
 * await api.v1.analyze(request);
 * ```
 */
export function useBaziAPI(config: UseBaziAPIConfig) {
  const legacy = useBaziCalculate(config);
  const v1Calculate = useBaziV1Calculate(config);
  const v1Analyze = useBaziV1Analyze(config);

  return {
    /** Legacy API 方法 */
    legacy,
    /** V1 API 方法 */
    v1: {
      ...v1Calculate,
      analyze: v1Analyze.analyze,
      analyzeState: {
        data: v1Analyze.data,
        error: v1Analyze.error,
        status: v1Analyze.status,
        isLoading: v1Analyze.isLoading,
        isSuccess: v1Analyze.isSuccess,
        isError: v1Analyze.isError,
      },
    },
    /** 重置所有狀態 */
    resetAll: () => {
      legacy.reset();
      v1Calculate.reset();
      v1Analyze.reset();
    },
  };
}

export default useBaziAPI;
