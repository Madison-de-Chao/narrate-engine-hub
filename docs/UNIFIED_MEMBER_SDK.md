# 統一會員系統 - 外部專案整合指南

本文件說明如何將外部專案接入統一會員系統，實現跨產品的會員授權與權限管理。

## 目錄

1. [系統架構](#系統架構)
2. [快速開始](#快速開始)
3. [認證方式](#認證方式)
4. [API 端點](#api-端點)
5. [TypeScript SDK](#typescript-sdk)
6. [React 整合](#react-整合)
7. [整合範例](#整合範例)
8. [錯誤處理](#錯誤處理)
9. [最佳實踐](#最佳實踐)

---

## 系統架構

```
┌─────────────────────────────────────────────────────────────────┐
│                     統一會員系統 (中央授權)                        │
│  https://yyzcgxnvtprojutnxisz.supabase.co                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 使用者資料    │  │ 權限資料     │  │ 訂閱/消費記錄            │  │
│  │ (profiles)  │  │(entitlements)│ │ (subscriptions)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              │      Edge Functions      │                        │
│              │ • check-entitlement      │                        │
│              │ • entitlements-me        │                        │
│              │ • entitlements-lookup    │                        │
│              └────────────┬────────────┘                        │
└───────────────────────────┼─────────────────────────────────────┘
                            │ API
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  虹靈御所      │  │  尋妖記        │  │  元壹卜卦      │
│ report_platform│ │  seek_monster  │  │yuanyi_divination│
└───────────────┘  └───────────────┘  └───────────────┘
```

### 產品 ID 對照表

| 產品 ID | 產品名稱 | 說明 |
|---------|---------|------|
| `report_platform` | 虹靈御所 | 命理報告平台 |
| `story_builder_hub` | 四時八字人生兵法 | 命理桌遊系統 |
| `seek_monster` | 尋妖記 | 探索遊戲平台 |
| `yuanyi_divination` | 元壹卜卦系統 | 占問與指引 |

---

## 快速開始

### 1. 取得 API Key

在後台 `/admin/api-keys` 建立 API Key，格式為 `mk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. 安裝 SDK

複製 TypeScript SDK 到您的專案中（見下方 SDK 章節）

### 3. 初始化並驗證

```typescript
import { UnifiedMemberClient } from './unified-member-sdk';

const client = new UnifiedMemberClient({
  apiKey: 'mk_your_api_key_here',
  baseUrl: 'https://yyzcgxnvtprojutnxisz.supabase.co/functions/v1'
});

// 驗證用戶權限
const result = await client.checkAccess('user@example.com', 'yuanyi_divination');
if (result.hasAccess) {
  // 用戶有權限，允許存取
}
```

---

## 認證方式

### 方式一：API Key 認證（推薦用於後端）

適用於伺服器端對伺服器端的請求。

```http
GET /functions/v1/check-entitlement?product_id=yuanyi_divination&email=user@example.com
X-API-Key: mk_your_api_key_here
```

### 方式二：JWT 認證（用於前端）

適用於已登入用戶從前端查詢自己的權限。

```http
GET /functions/v1/entitlements-me?product_id=yuanyi_divination
Authorization: Bearer <user_jwt_token>
```

### 方式三：統一登入導向

將用戶導向統一登入頁面，登入後重新導向回您的應用。

```
https://your-unified-platform.com/auth/login?from=yuanyi_divination&redirect=https://your-app.com/callback
```

---

## API 端點

### 1. check-entitlement（檢查權限）

驗證指定用戶是否有特定產品的使用權限。

**端點**
```
GET /functions/v1/check-entitlement
```

**參數**

| 參數 | 類型 | 必填 | 說明 |
|-----|------|-----|------|
| `product_id` | string | ✅ | 產品 ID |
| `email` | string | ✅ | 用戶 Email |

**請求範例**
```bash
curl -X GET \
  "https://yyzcgxnvtprojutnxisz.supabase.co/functions/v1/check-entitlement?product_id=yuanyi_divination&email=user@example.com" \
  -H "X-API-Key: mk_your_api_key_here"
```

**回應範例**
```json
{
  "hasAccess": true,
  "found": true,
  "userId": "uuid-here",
  "userEmail": "user@example.com",
  "entitlement": {
    "id": "entitlement-uuid",
    "product_id": "yuanyi_divination",
    "status": "active",
    "starts_at": "2024-01-01T00:00:00Z",
    "ends_at": "2024-12-31T23:59:59Z"
  }
}
```

---

### 2. entitlements-me（查詢自己的權限）

已登入用戶查詢自己的所有權限。

**端點**
```
GET /functions/v1/entitlements-me
```

**認證**
```
Authorization: Bearer <jwt_token>
```

**參數**

| 參數 | 類型 | 必填 | 說明 |
|-----|------|-----|------|
| `product_id` | string | ❌ | 篩選特定產品 |

**回應範例**
```json
{
  "userId": "uuid-here",
  "entitlements": [
    {
      "id": "uuid",
      "product_id": "report_platform",
      "status": "active",
      "is_active": true,
      "starts_at": "2024-01-01T00:00:00Z",
      "ends_at": null
    },
    {
      "id": "uuid",
      "product_id": "yuanyi_divination",
      "status": "active",
      "is_active": true,
      "starts_at": "2024-06-01T00:00:00Z",
      "ends_at": "2025-06-01T00:00:00Z"
    }
  ]
}
```

---

### 3. entitlements-lookup（查詢用戶權限）

管理端透過 Email 查詢用戶的所有權限。

**端點**
```
GET /functions/v1/entitlements-lookup
```

**參數**

| 參數 | 類型 | 必填 | 說明 |
|-----|------|-----|------|
| `email` | string | ✅ | 用戶 Email |
| `product_id` | string | ❌ | 篩選特定產品 |

**回應範例**
```json
{
  "found": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "profile": {
    "display_name": "用戶名稱",
    "subscription_status": "active"
  },
  "entitlements": [
    {
      "id": "uuid",
      "product_id": "yuanyi_divination",
      "status": "active",
      "is_active": true,
      "starts_at": "2024-01-01T00:00:00Z",
      "ends_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## TypeScript SDK

將以下 SDK 複製到您的專案中：

```typescript
// unified-member-sdk.ts

/**
 * 統一會員系統 SDK
 * 用於外部專案接入中央授權系統
 */

// ============ 類型定義 ============

export interface ClientConfig {
  apiKey: string;
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

// ============ SDK 主類別 ============

export class UnifiedMemberClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://yyzcgxnvtprojutnxisz.supabase.co/functions/v1';
  }

  /**
   * 檢查用戶是否有特定產品的存取權限
   */
  async checkAccess(email: string, productId: ProductId): Promise<CheckAccessResult> {
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
   * 查詢用戶的所有權限（透過 Email）
   */
  async lookupUser(email: string, productId?: ProductId): Promise<UserLookupResult> {
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

// ============ 錯誤類別 ============

export class UnifiedMemberError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'UnifiedMemberError';
    this.statusCode = statusCode;
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
    throw new Error('UnifiedMemberClient not initialized. Call initializeClient() first.');
  }
  return defaultClient;
}
```

---

## React 整合

### React Hook

```typescript
// hooks/useProductAccess.ts

import { useState, useEffect, useCallback } from 'react';
import { UnifiedMemberClient, ProductId, Entitlement } from './unified-member-sdk';

interface UseProductAccessOptions {
  client: UnifiedMemberClient;
  productId: ProductId;
  userEmail?: string;
  accessToken?: string;
}

interface UseProductAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  entitlement: Entitlement | null;
  refetch: () => Promise<void>;
}

export function useProductAccess({
  client,
  productId,
  userEmail,
  accessToken,
}: UseProductAccessOptions): UseProductAccessResult {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);

  const checkAccess = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (accessToken) {
        // 使用 JWT 查詢
        const result = await client.getMyEntitlements(accessToken, productId);
        const ent = result.entitlements.find(e => e.product_id === productId && e.is_active);
        setHasAccess(!!ent);
        setEntitlement(ent || null);
      } else if (userEmail) {
        // 使用 API Key + Email 查詢
        const result = await client.checkAccess(userEmail, productId);
        setHasAccess(result.hasAccess);
        setEntitlement(result.entitlement || null);
        if (result.error) {
          setError(result.error);
        }
      } else {
        setHasAccess(false);
        setError('No userEmail or accessToken provided');
      }
    } catch (err) {
      setHasAccess(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [client, productId, userEmail, accessToken]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    hasAccess,
    isLoading,
    error,
    entitlement,
    refetch: checkAccess,
  };
}
```

### React Context Provider

```typescript
// context/UnifiedMemberContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { UnifiedMemberClient, ClientConfig } from './unified-member-sdk';

interface UnifiedMemberContextValue {
  client: UnifiedMemberClient;
}

const UnifiedMemberContext = createContext<UnifiedMemberContextValue | null>(null);

interface ProviderProps {
  config: ClientConfig;
  children: ReactNode;
}

export function UnifiedMemberProvider({ config, children }: ProviderProps) {
  const client = React.useMemo(() => new UnifiedMemberClient(config), [config]);

  return (
    <UnifiedMemberContext.Provider value={{ client }}>
      {children}
    </UnifiedMemberContext.Provider>
  );
}

export function useUnifiedMember(): UnifiedMemberContextValue {
  const context = useContext(UnifiedMemberContext);
  if (!context) {
    throw new Error('useUnifiedMember must be used within UnifiedMemberProvider');
  }
  return context;
}
```

### 使用範例

```tsx
// App.tsx
import { UnifiedMemberProvider } from './context/UnifiedMemberContext';

function App() {
  return (
    <UnifiedMemberProvider 
      config={{ 
        apiKey: 'mk_your_api_key_here',
        baseUrl: 'https://yyzcgxnvtprojutnxisz.supabase.co/functions/v1'
      }}
    >
      <MyApp />
    </UnifiedMemberProvider>
  );
}

// ProtectedFeature.tsx
import { useUnifiedMember } from './context/UnifiedMemberContext';
import { useProductAccess } from './hooks/useProductAccess';

function ProtectedFeature({ userEmail }: { userEmail: string }) {
  const { client } = useUnifiedMember();
  const { hasAccess, isLoading, error } = useProductAccess({
    client,
    productId: 'yuanyi_divination',
    userEmail,
  });

  if (isLoading) return <div>檢查權限中...</div>;
  if (error) return <div>錯誤: {error}</div>;
  if (!hasAccess) return <div>您沒有此功能的使用權限</div>;

  return <div>歡迎使用元壹卜卦系統！</div>;
}
```

---

## 整合範例

### 範例一：Next.js 中間件保護路由

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UnifiedMemberClient } from './lib/unified-member-sdk';

const client = new UnifiedMemberClient({
  apiKey: process.env.UNIFIED_MEMBER_API_KEY!,
});

export async function middleware(request: NextRequest) {
  // 從 cookie 取得用戶 email
  const userEmail = request.cookies.get('user_email')?.value;
  
  if (!userEmail) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 檢查權限
  const result = await client.checkAccess(userEmail, 'yuanyi_divination');
  
  if (!result.hasAccess) {
    return NextResponse.redirect(new URL('/no-access', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/protected/:path*',
};
```

### 範例二：Express.js 中間件

```typescript
// middleware/checkAccess.ts
import { Request, Response, NextFunction } from 'express';
import { UnifiedMemberClient } from './unified-member-sdk';

const client = new UnifiedMemberClient({
  apiKey: process.env.UNIFIED_MEMBER_API_KEY!,
});

export function requireAccess(productId: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = req.user?.email; // 假設已有用戶認證

    if (!userEmail) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await client.checkAccess(userEmail, productId);
      
      if (!result.hasAccess) {
        return res.status(403).json({ 
          error: 'No access to this product',
          productId 
        });
      }

      // 將權限資訊附加到 request
      req.entitlement = result.entitlement;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check access' });
    }
  };
}

// 使用
app.get('/api/divination', requireAccess('yuanyi_divination'), (req, res) => {
  res.json({ message: 'Welcome to divination API' });
});
```

### 範例三：統一登入流程

```typescript
// 1. 外部專案：導向統一登入
function redirectToLogin() {
  const currentUrl = window.location.href;
  const loginUrl = new URL('https://unified-platform.com/auth/login');
  loginUrl.searchParams.set('from', 'yuanyi_divination');
  loginUrl.searchParams.set('redirect', `${currentUrl}/auth/callback`);
  window.location.href = loginUrl.toString();
}

// 2. 外部專案：處理回調
// /auth/callback 頁面
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('token');
  const email = params.get('email');
  
  if (accessToken && email) {
    // 儲存認證資訊
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user_email', email);
    
    // 驗證權限
    const client = new UnifiedMemberClient({ apiKey: 'mk_xxx' });
    const result = await client.checkAccess(email, 'yuanyi_divination');
    
    if (result.hasAccess) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/no-access';
    }
  }
}
```

---

## 錯誤處理

### 常見錯誤碼

| HTTP 狀態碼 | 錯誤 | 說明 |
|------------|------|------|
| 401 | Unauthorized | API Key 無效或已過期 |
| 403 | Forbidden | 無權存取此資源 |
| 404 | Not Found | 用戶或產品不存在 |
| 429 | Too Many Requests | 請求頻率過高 |
| 500 | Internal Error | 伺服器錯誤 |

### 錯誤處理範例

```typescript
async function safeCheckAccess(email: string, productId: string) {
  try {
    const result = await client.checkAccess(email, productId);
    return result;
  } catch (error) {
    if (error instanceof UnifiedMemberError) {
      switch (error.statusCode) {
        case 401:
          console.error('API Key 無效，請檢查設定');
          break;
        case 429:
          console.error('請求過於頻繁，請稍後再試');
          break;
        default:
          console.error(`錯誤: ${error.message}`);
      }
    }
    return { hasAccess: false, found: false, error: error.message };
  }
}
```

---

## 最佳實踐

### 1. API Key 安全

- ❌ 不要在前端代碼中硬編碼 API Key
- ✅ 將 API Key 存放在環境變數中
- ✅ 在後端進行權限驗證

### 2. 快取權限結果

```typescript
const cache = new Map<string, { result: CheckAccessResult; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 分鐘

async function checkAccessWithCache(email: string, productId: string) {
  const cacheKey = `${email}:${productId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  const result = await client.checkAccess(email, productId);
  cache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}
```

### 3. 優雅降級

```typescript
async function checkAccessWithFallback(email: string, productId: string) {
  try {
    return await client.checkAccess(email, productId);
  } catch (error) {
    // 如果 API 無法連接，根據本地快取或預設行為處理
    console.error('無法連接授權伺服器，使用預設行為');
    return { hasAccess: false, found: false, error: 'Service unavailable' };
  }
}
```

### 4. 日誌記錄

```typescript
async function checkAccessWithLogging(email: string, productId: string) {
  const startTime = Date.now();
  const result = await client.checkAccess(email, productId);
  
  console.log({
    action: 'check_access',
    email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // 遮蔽 email
    productId,
    hasAccess: result.hasAccess,
    duration: Date.now() - startTime,
  });
  
  return result;
}
```

---

## 支援與聯繫

如有任何整合問題，請聯繫系統管理員。

---

*文件版本: 1.0.0*
*最後更新: 2025-12-28*
