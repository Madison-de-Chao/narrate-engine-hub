/**
 * @deprecated 請使用 useUnifiedMembership 替代
 * 此檔案保留向後相容性，實際邏輯已移至 useUnifiedMembership
 */

import { useUnifiedMembership, getMembershipLabel } from './useUnifiedMembership';
import type { MembershipSource, MembershipTier } from '@/lib/unified-member-sdk';

export type { MembershipSource, MembershipTier };

export interface MembershipStatus {
  hasAccess: boolean;
  source: MembershipSource;
  loading: boolean;
  error: string | null;
  tier: MembershipTier;
  expiresAt: string | null;
  refetch: () => Promise<void>;
}

/**
 * @deprecated 請使用 useUnifiedMembership 替代
 */
export function useMembershipStatus(productId?: string): MembershipStatus {
  const membership = useUnifiedMembership(productId);
  
  return {
    hasAccess: membership.hasAccess,
    source: membership.source,
    loading: membership.loading,
    error: membership.error,
    tier: membership.tier,
    expiresAt: membership.expiresAt,
    refetch: membership.refetch,
  };
}

// 重新導出標籤相關函數
export const MEMBERSHIP_LABELS: Record<MembershipSource, string> = {
  sales_auth: '銷售認證會員',
  central: '中央會員',
  local: '本地會員',
  none: '免費版',
};

export const TIER_LABELS: Record<MembershipTier, string> = {
  free: '免費版',
  monthly: '月訂閱',
  yearly: '年訂閱',
  lifetime: '終身版',
  central: '中央會員',
  premium: '付費會員',
};

export { getMembershipLabel };
