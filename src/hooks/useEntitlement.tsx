/**
 * @deprecated 請使用 useUnifiedMembership 替代
 * 此檔案保留向後相容性
 */

import { useUnifiedMembership } from './useUnifiedMembership';
import type { Entitlement } from '@/lib/unified-member-sdk';

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
  details?: string;
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

/**
 * @deprecated 請使用 useUnifiedMembership 替代
 */
export function useEntitlement(productId?: string): UseEntitlementReturn {
  const membership = useUnifiedMembership(productId);

  // 轉換 entitlements 格式以保持向後相容
  const legacyEntitlements = membership.entitlements.map((e: Entitlement) => ({
    id: e.id,
    product_id: e.product_id,
    expires_at: e.ends_at || undefined,
  }));

  return {
    hasAccess: membership.hasAccess,
    loading: membership.loading,
    error: membership.error,
    entitlements: legacyEntitlements,
    expiresAt: membership.expiresAt,
    refetch: membership.refetch,
  };
}
