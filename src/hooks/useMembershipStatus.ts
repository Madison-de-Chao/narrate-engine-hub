import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MembershipSource = 'central' | 'local' | 'none';

export interface MembershipStatus {
  hasAccess: boolean;
  source: MembershipSource;
  loading: boolean;
  error: string | null;
  tier: 'free' | 'monthly' | 'yearly' | 'lifetime' | 'central';
  expiresAt: string | null;
  refetch: () => Promise<void>;
}

const CACHE_KEY = 'membership_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedMembership {
  hasAccess: boolean;
  source: MembershipSource;
  tier: MembershipStatus['tier'];
  expiresAt: string | null;
  productId?: string;
  timestamp: number;
}

export function useMembershipStatus(productId?: string): MembershipStatus {
  const [hasAccess, setHasAccess] = useState(false);
  const [source, setSource] = useState<MembershipSource>('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<MembershipStatus['tier']>('free');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

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

      if (productId && parsed.productId && parsed.productId !== productId) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, [productId]);

  const setCache = useCallback((data: Omit<CachedMembership, 'timestamp'>) => {
    try {
      const cacheData: CachedMembership = {
        ...data,
        productId,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // Ignore cache errors
    }
  }, [productId]);

  const checkMembership = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setHasAccess(false);
        setSource('none');
        setTier('free');
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = getCached();
      if (cached) {
        setHasAccess(cached.hasAccess);
        setSource(cached.source);
        setTier(cached.tier);
        setExpiresAt(cached.expiresAt);
        setLoading(false);
        return;
      }

      // Helper: check local subscription
      const checkLocalSubscription = async (): Promise<{
        hasAccess: boolean;
        tier: MembershipStatus['tier'];
        expiresAt: string | null;
      }> => {
        const { data, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subError) {
          console.error('Local subscription check error:', subError);
          return { hasAccess: false, tier: 'free', expiresAt: null };
        }

        if (data) {
          const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
          if (notExpired) {
            return {
              hasAccess: true,
              tier: data.plan as MembershipStatus['tier'],
              expiresAt: data.expires_at,
            };
          }
        }

        return { hasAccess: false, tier: 'free', expiresAt: null };
      };

      // Try central API first
      const queryParams = productId ? `?product_id=${encodeURIComponent(productId)}` : '';
      const { data, error: fnError } = await supabase.functions.invoke(
        `check-entitlement${queryParams}`,
        { method: 'GET' }
      );

      // Check for central API success
      if (!fnError && data && data.hasAccess === true && !data.error) {
        setHasAccess(true);
        setSource('central');
        setTier('central');
        setExpiresAt(data.expiresAt || null);
        setCache({
          hasAccess: true,
          source: 'central',
          tier: 'central',
          expiresAt: data.expiresAt || null,
        });
        return;
      }

      // Central failed or no access - check local subscription
      const localResult = await checkLocalSubscription();

      if (localResult.hasAccess) {
        setHasAccess(true);
        setSource('local');
        setTier(localResult.tier);
        setExpiresAt(localResult.expiresAt);
        setCache({
          hasAccess: true,
          source: 'local',
          tier: localResult.tier,
          expiresAt: localResult.expiresAt,
        });
        return;
      }

      // No access from either source
      setHasAccess(false);
      setSource('none');
      setTier('free');
      setExpiresAt(null);

      // Set error only if central failed with an error message
      if (fnError) {
        setError(fnError.message);
      } else if (data?.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Unexpected error checking membership:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHasAccess(false);
      setSource('none');
    } finally {
      setLoading(false);
    }
  }, [productId, getCached, setCache]);

  useEffect(() => {
    checkMembership();
  }, [checkMembership]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        localStorage.removeItem(CACHE_KEY);
        checkMembership();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkMembership]);

  return {
    hasAccess,
    source,
    loading,
    error,
    tier,
    expiresAt,
    refetch: checkMembership,
  };
}

// Display helpers
export const MEMBERSHIP_LABELS: Record<MembershipSource, string> = {
  central: '中央會員',
  local: '本地會員',
  none: '免費版',
};

export const TIER_LABELS: Record<MembershipStatus['tier'], string> = {
  free: '免費版',
  monthly: '月訂閱',
  yearly: '年訂閱',
  lifetime: '終身版',
  central: '中央會員',
};

export function getMembershipLabel(source: MembershipSource, tier: MembershipStatus['tier']): string {
  if (source === 'central') return '中央會員';
  if (source === 'local') return TIER_LABELS[tier] || '本地會員';
  return '免費版';
}
