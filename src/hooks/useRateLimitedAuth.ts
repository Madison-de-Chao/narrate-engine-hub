import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
  rateLimitRemaining?: number;
  isLocked?: boolean;
  lockedUntil?: string;
}

/**
 * Hook for rate-limited authentication with account lockout protection
 * Uses the auth-rate-limit edge function to prevent brute force attacks
 */
export function useRateLimitedAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ isLocked: boolean; lockedUntil?: Date } | null>(null);

  const callAuthEndpoint = async (
    action: 'login' | 'signup' | 'reset_password',
    credentials: { email?: string; phone?: string; password?: string }
  ): Promise<AuthResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('auth-rate-limit', {
        body: {
          action,
          ...credentials
        }
      });

      if (error) {
        // Check if it's a rate limit or lockout error
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          return { 
            success: false, 
            error: '請求過於頻繁，請稍後再試' 
          };
        }
        return { success: false, error: error.message || '驗證失敗' };
      }

      // Check for account lockout
      if (data?.isLocked) {
        const lockedUntil = data.lockedUntil ? new Date(data.lockedUntil) : undefined;
        setLockoutInfo({ isLocked: true, lockedUntil });
        return { 
          success: false, 
          error: data.error || '帳戶已被鎖定',
          isLocked: true,
          lockedUntil: data.lockedUntil
        };
      }

      if (data?.error) {
        return { 
          success: false, 
          error: data.error,
          rateLimitRemaining: data.rateLimitRemaining
        };
      }

      // Clear lockout info on successful login
      setLockoutInfo(null);

      // If edge function succeeded, sync the session with client
      if (data?.success && data?.data?.session) {
        await supabase.auth.setSession(data.data.session);
      }

      return { 
        success: true, 
        data: data?.data,
        rateLimitRemaining: data?.rateLimitRemaining
      };
    } catch (err) {
      console.error('Auth error:', err);
      return { 
        success: false, 
        error: '服務暫時不可用，請稍後再試' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (credentials: { email?: string; phone?: string; password: string }) => {
    return callAuthEndpoint('login', credentials);
  };

  const signUp = async (credentials: { email?: string; phone?: string; password: string }) => {
    return callAuthEndpoint('signup', credentials);
  };

  const resetPassword = async (email: string) => {
    return callAuthEndpoint('reset_password', { email });
  };

  /**
   * Fallback to direct Supabase auth if edge function is unavailable
   * This provides resilience while still having rate limiting as primary protection
   */
  const signInWithFallback = async (credentials: { email?: string; phone?: string; password: string }) => {
    const result = await signIn(credentials);
    
    // If edge function failed due to service error (not rate limit or lockout), try direct auth
    if (!result.success && !result.isLocked && result.error === '服務暫時不可用，請稍後再試') {
      console.log('Falling back to direct Supabase auth');
      try {
        const { error } = await supabase.auth.signInWithPassword(
          credentials.email 
            ? { email: credentials.email, password: credentials.password }
            : { phone: credentials.phone!, password: credentials.password }
        );
        
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: '登入失敗' };
      }
    }
    
    return result;
  };

  const signUpWithFallback = async (credentials: { email?: string; phone?: string; password: string }) => {
    const result = await signUp(credentials);
    
    if (!result.success && result.error === '服務暫時不可用，請稍後再試') {
      console.log('Falling back to direct Supabase auth');
      try {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp(
          credentials.email 
            ? { email: credentials.email, password: credentials.password, options: { emailRedirectTo: redirectUrl } }
            : { phone: credentials.phone!, password: credentials.password }
        );
        
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: '註冊失敗' };
      }
    }
    
    return result;
  };

  return {
    isLoading,
    lockoutInfo,
    signIn,
    signUp,
    resetPassword,
    signInWithFallback,
    signUpWithFallback,
    clearLockout: () => setLockoutInfo(null)
  };
}
