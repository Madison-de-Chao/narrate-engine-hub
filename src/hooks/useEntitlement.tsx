import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EntitlementResult {
  hasAccess: boolean;
  email?: string;
  productId?: string;
  entitlements?: Array<{
    id: string;
    product_id: string;
    expires_at?: string;
  }>;
  expiresAt?: string | null;
  error?: string;
}

interface UseEntitlementReturn {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
  entitlements: EntitlementResult['entitlements'];
  expiresAt: string | null;
  refetch: () => Promise<void>;
}

const CACHE_KEY = 'entitlement_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedEntitlement {
  data: EntitlementResult;
  timestamp: number;
}

export function useEntitlement(productId?: string): UseEntitlementReturn {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementResult['entitlements']>([]);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const getCachedEntitlement = useCallback((): EntitlementResult | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedEntitlement = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  }, []);

  const setCachedEntitlement = useCallback((data: EntitlementResult) => {
    try {
      const cacheData: CachedEntitlement = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch {
      // Ignore cache errors
    }
  }, []);

  const checkEntitlement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = getCachedEntitlement();
      if (cached) {
        setHasAccess(cached.hasAccess);
        setEntitlements(cached.entitlements || []);
        setExpiresAt(cached.expiresAt || null);
        setLoading(false);
        return;
      }

      // Call edge function
      const queryParams = productId ? `?product_id=${encodeURIComponent(productId)}` : '';
      const { data, error: fnError } = await supabase.functions.invoke<EntitlementResult>(
        `check-entitlement${queryParams}`,
        {
          method: 'GET',
        }
      );

      if (fnError) {
        console.error('Entitlement check error:', fnError);
        setError(fnError.message);
        setHasAccess(false);
      } else if (data) {
        setHasAccess(data.hasAccess);
        setEntitlements(data.entitlements || []);
        setExpiresAt(data.expiresAt || null);
        setCachedEntitlement(data);
      }
    } catch (err) {
      console.error('Unexpected error checking entitlement:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [productId, getCachedEntitlement, setCachedEntitlement]);

  useEffect(() => {
    checkEntitlement();
  }, [checkEntitlement]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        localStorage.removeItem(CACHE_KEY);
        checkEntitlement();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkEntitlement]);

  return {
    hasAccess,
    loading,
    error,
    entitlements,
    expiresAt,
    refetch: checkEntitlement,
  };
}
