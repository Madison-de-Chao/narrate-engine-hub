/**
 * 中央會員系統（主站 story_builder_hub）配置
 *
 * 本網站已棄用本地認證 UI；所有登入/註冊/密碼重設/訂閱皆跳轉主站執行。
 * 主站登入完成後，需以 URL fragment 形式回傳本地 Supabase 的 access_token 與 refresh_token：
 *   <CENTRAL_AUTH_BASE_URL>?return_to=<本站 callback URL>
 * 主站完成後 redirect 到 <本站 callback URL>#access_token=...&refresh_token=...
 *
 * ⚠️ 待主站正式提供 SSO endpoint 後，請更新下列常數。
 */

const FALLBACK_CENTRAL_BASE = "https://story-builder-hub.lovable.app";

function readEnv(key: string): string | undefined {
  // Vite 環境變數
  try {
    const env = (import.meta as unknown as { env?: Record<string, string> }).env;
    return env?.[key];
  } catch {
    return undefined;
  }
}

/** 主站根網址 */
export const CENTRAL_SITE_URL =
  readEnv("VITE_CENTRAL_SITE_URL") || FALLBACK_CENTRAL_BASE;

/** 主站登入頁 */
export const CENTRAL_AUTH_URL =
  readEnv("VITE_CENTRAL_AUTH_URL") || `${CENTRAL_SITE_URL}/auth`;

/** 主站登出端點 */
export const CENTRAL_LOGOUT_URL =
  readEnv("VITE_CENTRAL_LOGOUT_URL") || `${CENTRAL_SITE_URL}/auth/logout`;

/** 主站訂閱/升級頁 */
export const CENTRAL_SUBSCRIBE_URL =
  readEnv("VITE_CENTRAL_SUBSCRIBE_URL") || `${CENTRAL_SITE_URL}/subscribe`;

/** 主站帳號管理頁 */
export const CENTRAL_ACCOUNT_URL =
  readEnv("VITE_CENTRAL_ACCOUNT_URL") || `${CENTRAL_SITE_URL}/account`;

/**
 * 取得本站 callback URL（主站登入完成後 redirect 回此處）
 */
export function getLocalCallbackUrl(returnTo?: string): string {
  if (typeof window === "undefined") return "/auth/callback";
  const url = new URL("/auth/callback", window.location.origin);
  if (returnTo) url.searchParams.set("return_to", returnTo);
  return url.toString();
}

/**
 * 跳轉主站登入頁
 */
export function redirectToCentralLogin(returnTo?: string): void {
  if (typeof window === "undefined") return;
  const callback = getLocalCallbackUrl(returnTo || window.location.pathname);
  const url = new URL(CENTRAL_AUTH_URL);
  url.searchParams.set("return_to", callback);
  url.searchParams.set("source", "rsbzs");
  window.location.href = url.toString();
}

/**
 * 跳轉主站訂閱頁
 */
export function redirectToCentralSubscribe(): void {
  if (typeof window === "undefined") return;
  const url = new URL(CENTRAL_SUBSCRIBE_URL);
  url.searchParams.set("source", "rsbzs");
  url.searchParams.set("return_to", window.location.origin);
  window.location.href = url.toString();
}

/**
 * 跳轉主站帳號管理頁
 */
export function redirectToCentralAccount(): void {
  if (typeof window === "undefined") return;
  window.location.href = CENTRAL_ACCOUNT_URL;
}