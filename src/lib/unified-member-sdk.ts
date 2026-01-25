/**
 * 統一會員系統 SDK
 * 用於接入中央授權系統，實現跨產品的會員授權與權限管理
 * 
 * 基於 UNIFIED_MEMBER_SDK.md 規範實作
 */

// ============ 類型定義 ============

export interface ClientConfig {
  apiKey?: string;
  baseUrl?: string;
}

export interface Entitlement {
  id: string;
  product_id: string;
  status: 'active' | 'expired' | 'revoked';
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  notes?: string | null;
}

export interface CheckAccessResult {
  hasAccess: boolean;
  found: boolean;
  userId?: string;
  userEmail?: string;
  entitlement?: Entitlement;
  error?: string;
  centralStatus?: number;
  details?: string;
}

export interface UserEntitlements {
  userId: string;
  entitlements: Entitlement[];
}

export interface UserLookupResult {
  found: boolean;
  user?: {
    id: string;
    email: string;
  };
  profile?: {
    display_name: string | null;
    subscription_status: string;
  };
  entitlements: Entitlement[];
}

export type ProductId = 
  | 'report_platform' 
  | 'story_builder_hub' 
  | 'seek_monster' 
  | 'yuanyi_divination'
  | string;

// 產品 ID 對照表
export const PRODUCT_IDS = {
  REPORT_PLATFORM: 'report_platform',
  STORY_BUILDER_HUB: 'story_builder_hub',
  SEEK_MONSTER: 'seek_monster',
  YUANYI_DIVINATION: 'yuanyi_divination',
  // Legacy ID for backward compatibility
  BAZI_PREMIUM: 'bazi-premium',
} as const;

// 產品名稱對照
export const PRODUCT_NAMES: Record<string, string> = {
  'report_platform': '虹靈御所',
  'story_builder_hub': '四時八字人生兵法',
  'seek_monster': '尋妖記',
  'yuanyi_divination': '元壹卜卦系統',
  'bazi-premium': '八字命理',
};

// ============ 錯誤類別 ============

export class UnifiedMemberError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'UnifiedMemberError';
    this.statusCode = statusCode;
  }
}

// ============ SDK 主類別 ============

const DEFAULT_BASE_URL = 'https://yyzcgxnvtprojutnxisz.supabase.co/functions/v1';

export class UnifiedMemberClient {
  private apiKey?: string;
  private baseUrl: string;

  constructor(config: ClientConfig = {}) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  /**
   * 檢查用戶是否有特定產品的存取權限（使用 API Key + Email）
   */
  async checkAccess(email: string, productId: ProductId): Promise<CheckAccessResult> {
    if (!this.apiKey) {
      return {
        hasAccess: false,
        found: false,
        error: 'API Key not configured',
      };
    }

    try {
      const url = new URL(`${this.baseUrl}/check-entitlement`);
      url.searchParams.set('email', email);
      url.searchParams.set('product_id', productId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          hasAccess: false,
          found: false,
          error: errorData.error || `HTTP ${response.status}`,
          centralStatus: response.status,
        };
      }

      return await response.json();
    } catch (error) {
      return {
        hasAccess: false,
        found: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 查詢用戶的所有權限（透過 Email，需要 API Key）
   */
  async lookupUser(email: string, productId?: ProductId): Promise<UserLookupResult> {
    if (!this.apiKey) {
      throw new UnifiedMemberError('API Key not configured', 401);
    }

    const url = new URL(`${this.baseUrl}/entitlements-lookup`);
    url.searchParams.set('email', email);
    if (productId) {
      url.searchParams.set('product_id', productId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new UnifiedMemberError(
        `Failed to lookup user: ${response.status}`,
        response.status
      );
    }

    return await response.json();
  }

  /**
   * 使用 JWT Token 查詢當前用戶的權限
   */
  async getMyEntitlements(
    accessToken: string, 
    productId?: ProductId
  ): Promise<UserEntitlements> {
    const url = new URL(`${this.baseUrl}/entitlements-me`);
    if (productId) {
      url.searchParams.set('product_id', productId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new UnifiedMemberError(
        `Failed to get entitlements: ${response.status}`,
        response.status
      );
    }

    return await response.json();
  }

  /**
   * 快速檢查：用戶是否有任何有效權限
   */
  async hasAnyAccess(email: string): Promise<boolean> {
    const result = await this.lookupUser(email);
    return result.entitlements.some(e => e.is_active);
  }

  /**
   * 取得用戶的所有有效產品 ID
   */
  async getActiveProductIds(email: string): Promise<string[]> {
    const result = await this.lookupUser(email);
    return result.entitlements
      .filter(e => e.is_active)
      .map(e => e.product_id);
  }
}

// ============ 單例工廠 ============

let defaultClient: UnifiedMemberClient | null = null;

export function initializeClient(config: ClientConfig): UnifiedMemberClient {
  defaultClient = new UnifiedMemberClient(config);
  return defaultClient;
}

export function getClient(): UnifiedMemberClient {
  if (!defaultClient) {
    // 初始化一個沒有 API Key 的 client（僅支援 JWT 認證）
    defaultClient = new UnifiedMemberClient();
  }
  return defaultClient;
}

// ============ 會員來源與標籤 ============

export type MembershipSource = 'central' | 'local' | 'none';
export type MembershipTier = 'free' | 'monthly' | 'yearly' | 'lifetime' | 'central' | 'premium';

export const MEMBERSHIP_SOURCE_LABELS: Record<MembershipSource, string> = {
  central: '中央會員',
  local: '本地會員',
  none: '免費版',
};

export const MEMBERSHIP_TIER_LABELS: Record<MembershipTier, string> = {
  free: '免費版',
  monthly: '月訂閱',
  yearly: '年訂閱',
  lifetime: '終身版',
  central: '中央會員',
  premium: '付費會員',
};

export function getMembershipLabel(
  source: MembershipSource, 
  tier: MembershipTier
): string {
  if (source === 'central') return '中央會員';
  if (source === 'local') return MEMBERSHIP_TIER_LABELS[tier] || '本地會員';
  return '免費版';
}

export function getProductName(productId: string): string {
  return PRODUCT_NAMES[productId] || productId;
}
