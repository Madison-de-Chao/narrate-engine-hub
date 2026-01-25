/**
 * 統一會員系統 React Hook
 * 整合中央會員 API 與本地訂閱的雙重驗證機制
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  MembershipSource,
  MembershipTier,
  Entitlement,
  getMembershipLabel,
  PRODUCT_IDS,
} from '@/lib/unified-member-sdk';

// ============ 類型定義 ============

export interface MembershipStatus {
  /** 是否有訪問權限 */
  hasAccess: boolean;
  /** 會員來源：central = 中央會員, local = 本地會員, none = 無會員 */
  source: MembershipSource;
  /** 本地訂閱等級 */
  tier: MembershipTier;
  /** 載入中 */
  loading: boolean;
  /** 錯誤訊息 */
  error: string | null;
  /** 到期時間 */
  expiresAt: string | null;
  /** 權限列表（來自中央系統） */
  entitlements: Entitlement[];
  /** 重新取得狀態 */
  refetch: () => Promise<void>;
}

interface CachedMembership {
  hasAccess: boolean;
  source: MembershipSource;
  tier: MembershipTier;
  expiresAt: string | null;
  entitlements: Entitlement[];
  productId?: string;
  timestamp: number;
}

// ============ 常量 ============

const CACHE_KEY = 'unified_membership_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ============ Hook 實作 ============

export function useUnifiedMembership(productId?: string): MembershipStatus {
  const [hasAccess, setHasAccess] = useState(false);
  const [source, setSource] = useState<MembershipSource>('none');
  const [tier, setTier] = useState<MembershipTier>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);

  // 快取讀取
  const getCached = useCallback((): CachedMembership | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedMembership = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      // 確保產品 ID 匹配（避免跨產品快取）
      if (productId && parsed.productId && parsed.productId !== productId) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, [productId]);

  // 快取寫入
  const setCache = useCallback((data: Omit<CachedMembership, 'timestamp'>) => {
    try {
      const cacheData: CachedMembership = {
        ...data,
        productId,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // 忽略快取錯誤
    }
  }, [productId]);

  // 清除快取
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // 忽略錯誤
    }
  }, []);

  // 檢查本地訂閱
  const checkLocalSubscription = useCallback(async (userId: string): Promise<{
    hasAccess: boolean;
    tier: MembershipTier;
    expiresAt: string | null;
  }> => {
    try {
      const { data, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) {
        console.error('[useUnifiedMembership] Local subscription check error:', subError);
        return { hasAccess: false, tier: 'free', expiresAt: null };
      }

      if (data) {
        const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
        if (notExpired) {
          return {
            hasAccess: true,
            tier: data.plan as MembershipTier,
            expiresAt: data.expires_at,
          };
        }
      }

      return { hasAccess: false, tier: 'free', expiresAt: null };
    } catch (err) {
      console.error('[useUnifiedMembership] Unexpected local check error:', err);
      return { hasAccess: false, tier: 'free', expiresAt: null };
    }
  }, []);

  // 主要檢查邏輯
  const checkMembership = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 檢查登入狀態
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setHasAccess(false);
        setSource('none');
        setTier('free');
        setEntitlements([]);
        setExpiresAt(null);
        setLoading(false);
        return;
      }

      // 檢查快取
      const cached = getCached();
      if (cached) {
        setHasAccess(cached.hasAccess);
        setSource(cached.source);
        setTier(cached.tier);
        setExpiresAt(cached.expiresAt);
        setEntitlements(cached.entitlements);
        setLoading(false);
        return;
      }

      // 使用預設產品 ID（向後相容）
      const effectiveProductId = productId || PRODUCT_IDS.REPORT_PLATFORM;

      // 呼叫中央 API（透過本地 edge function 代理）
      const queryParams = `?product_id=${encodeURIComponent(effectiveProductId)}`;
      const { data, error: fnError } = await supabase.functions.invoke(
        `check-entitlement${queryParams}`,
        { method: 'GET' }
      );

      // 中央 API 成功且有權限（包含 sales_auth 和 central）
      if (!fnError && data && data.hasAccess === true && !data.error) {
        const memberSource = data.source === 'sales_auth' ? 'sales_auth' : 'central';
        const memberTier = data.source === 'sales_auth' ? 'premium' : 'central';
        
        const result: Omit<CachedMembership, 'timestamp' | 'productId'> = {
          hasAccess: true,
          source: memberSource as MembershipSource,
          tier: memberTier as MembershipTier,
          expiresAt: data.expiresAt || null,
          entitlements: data.entitlements || [],
        };

        setHasAccess(true);
        setSource(memberSource as MembershipSource);
        setTier(memberTier as MembershipTier);
        setExpiresAt(result.expiresAt);
        setEntitlements(result.entitlements);
        setCache(result);
        return;
      }

      // 中央 API 失敗或無權限，檢查本地訂閱作為 fallback
      const localResult = await checkLocalSubscription(session.user.id);

      if (localResult.hasAccess) {
        const result: Omit<CachedMembership, 'timestamp' | 'productId'> = {
          hasAccess: true,
          source: 'local',
          tier: localResult.tier,
          expiresAt: localResult.expiresAt,
          entitlements: [],
        };

        setHasAccess(true);
        setSource('local');
        setTier(localResult.tier);
        setExpiresAt(localResult.expiresAt);
        setEntitlements([]);
        setCache(result);
        return;
      }

      // 兩者都無權限
      setHasAccess(false);
      setSource('none');
      setTier('free');
      setExpiresAt(null);
      setEntitlements([]);

      // 設置錯誤（僅供調試）
      if (fnError) {
        console.warn('[useUnifiedMembership] Central API error:', fnError);
      } else if (data?.error) {
        console.warn('[useUnifiedMembership] Central API returned error:', data.error);
      }
    } catch (err) {
      console.error('[useUnifiedMembership] Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHasAccess(false);
      setSource('none');
    } finally {
      setLoading(false);
    }
  }, [productId, getCached, setCache, checkLocalSubscription]);

  // 初始化檢查
  useEffect(() => {
    checkMembership();
  }, [checkMembership]);

  // 監聽登入狀態變化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        clearCache();
        checkMembership();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkMembership, clearCache]);

  return {
    hasAccess,
    source,
    tier,
    loading,
    error,
    expiresAt,
    entitlements,
    refetch: checkMembership,
  };
}

// ============ 輔助函數 ============

/**
 * 取得會員標籤顯示文字
 */
export { getMembershipLabel };

/**
 * 檢查是否為中央會員
 */
export function isCentralMember(source: MembershipSource): boolean {
  return source === 'central';
}

/**
 * 檢查是否為付費會員（中央或本地）
 */
export function isPaidMember(source: MembershipSource): boolean {
  return source === 'central' || source === 'local';
}
