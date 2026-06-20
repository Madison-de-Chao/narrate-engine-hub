/**
 * useIdentity
 * --------------------------------------------------------------
 * 本網站不再做使用者驗證；僅以「email」作為身份識別。
 * email 儲存在 localStorage('rsbzs_user_email')，跨頁面同步。
 *
 * 任何權限判斷請以中央 check-entitlement 為準（見 useUnifiedMembership）。
 */
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'rsbzs_user_email';
const EVENT_NAME = 'rsbzs:identity-changed';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v && EMAIL_REGEX.test(v) ? v.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function useIdentity() {
  const [email, setEmailState] = useState<string | null>(() => readEmail());

  useEffect(() => {
    const sync = () => setEmailState(readEmail());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT_NAME, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT_NAME, sync);
    };
  }, []);

  const setEmail = useCallback((next: string) => {
    const trimmed = next.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmed)) {
      throw new Error('請輸入有效的 email');
    }
    window.localStorage.setItem(STORAGE_KEY, trimmed);
    window.dispatchEvent(new Event(EVENT_NAME));
    setEmailState(trimmed);
  }, []);

  const clearEmail = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
    setEmailState(null);
  }, []);

  return { email, setEmail, clearEmail, hasIdentity: !!email };
}

export function isValidEmail(v: string) {
  return EMAIL_REGEX.test(v.trim());
}