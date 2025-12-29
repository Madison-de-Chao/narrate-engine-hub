import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Loader2, X } from 'lucide-react';
import { z } from 'zod';
import { useMember } from './MemberContext';

const emailSchema = z.string().email('請輸入有效的 Email 地址');
const passwordSchema = z.string().min(6, '密碼至少需要 6 個字元');

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export interface MemberLoginWidgetProps {
  /** 關閉按鈕回調 */
  onClose?: () => void;
  /** 登入/註冊成功回調 */
  onSuccess?: () => void;
  /** 成功後導向路徑 */
  redirectTo?: string;
  /** 是否顯示標題 */
  showTitle?: boolean;
  /** 緊湊模式 */
  compact?: boolean;
  /** 是否顯示 Google 登入 */
  showGoogleLogin?: boolean;
  /** 自訂樣式類名 */
  className?: string;
  /** 自訂導航函數（用於 React Router 以外的路由方案） */
  onNavigate?: (path: string) => void;
  /** Toast 通知函數 */
  onToast?: (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => void;
}

/**
 * 會員登入小工具
 */
export function MemberLoginWidget({ 
  onClose, 
  onSuccess,
  redirectTo = '/',
  showTitle = true,
  compact = false,
  showGoogleLogin = true,
  className = '',
  onNavigate,
  onToast,
}: MemberLoginWidgetProps) {
  const { signIn, signUp, signInWithGoogle, user } = useMember();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const toast = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    if (onToast) {
      onToast(options);
    } else {
      // 降級到 alert
      const message = `${options.title}: ${options.description}`;
      if (options.variant === 'destructive') {
        console.error(message);
      }
      alert(message);
    }
  };

  const validateForm = () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: 'Email 格式錯誤',
        description: '請輸入有效的 Email 地址',
        variant: 'destructive',
      });
      return false;
    }

    try {
      passwordSchema.parse(password);
    } catch {
      toast({
        title: '密碼格式錯誤',
        description: '密碼至少需要 6 個字元',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: '登入失敗',
          description: error.message === 'Invalid login credentials' 
            ? 'Email 或密碼錯誤' 
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '登入成功',
          description: '歡迎回來！',
        });
        onSuccess?.();
        navigate(redirectTo);
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({
          title: '註冊失敗',
          description: error.message.includes('already registered')
            ? '此 Email 已被註冊'
            : error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '註冊成功！',
          description: '歡迎加入會員平台',
        });
        onSuccess?.();
        navigate(redirectTo);
      }
    }

    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Google 登入失敗',
        description: error.message,
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  };

  // If user is already logged in
  if (user) {
    return (
      <div className={`hlw-widget hlw-logged-in ${className}`}>
        <div className="hlw-icon-container">
          <Sparkles className="hlw-icon" />
        </div>
        <h3 className="hlw-title">您已登入</h3>
        <p className="hlw-subtitle">歡迎回來！</p>
        <button 
          onClick={() => navigate('/')}
          className="hlw-button hlw-button-primary"
        >
          開始探索
          <ArrowRight className="hlw-button-icon" />
        </button>
      </div>
    );
  }

  return (
    <div className={`hlw-widget ${className}`}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="hlw-close-button"
          aria-label="關閉"
        >
          <X className="hlw-close-icon" />
        </button>
      )}

      {/* Title */}
      {showTitle && (
        <div className="hlw-header">
          <div className="hlw-icon-container">
            <Sparkles className="hlw-icon" />
          </div>
          <h3 className="hlw-title">會員登入</h3>
          <p className="hlw-subtitle">一個帳號，暢享所有服務</p>
        </div>
      )}

      {/* Tab switcher */}
      <div className={`hlw-tabs ${compact ? 'hlw-tabs-compact' : ''}`}>
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`hlw-tab ${isLogin ? 'hlw-tab-active' : ''}`}
        >
          登入
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`hlw-tab ${!isLogin ? 'hlw-tab-active' : ''}`}
        >
          註冊
        </button>
      </div>

      <form onSubmit={handleSubmit} className={`hlw-form ${compact ? 'hlw-form-compact' : ''}`}>
        {/* Display name field (signup only) */}
        <div className={`hlw-field ${isLogin ? 'hlw-field-hidden' : ''}`}>
          <label htmlFor="hlw-displayName" className="hlw-label">
            <User className="hlw-label-icon" />
            暱稱
          </label>
          <input
            id="hlw-displayName"
            type="text"
            placeholder="您的暱稱"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="hlw-input"
            disabled={isSubmitting}
          />
        </div>

        <div className="hlw-field">
          <label htmlFor="hlw-email" className="hlw-label">
            <Mail className="hlw-label-icon" />
            Email
          </label>
          <input
            id="hlw-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="hlw-input"
            disabled={isSubmitting}
          />
        </div>

        <div className="hlw-field">
          <label htmlFor="hlw-password" className="hlw-label">
            <Lock className="hlw-label-icon" />
            密碼
          </label>
          <div className="hlw-password-container">
            <input
              id="hlw-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hlw-input hlw-input-password"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hlw-password-toggle"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="hlw-password-icon" /> : <Eye className="hlw-password-icon" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="hlw-button hlw-button-primary hlw-button-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="hlw-button-icon hlw-spin" />
              處理中...
            </>
          ) : (
            isLogin ? '登入' : '註冊'
          )}
        </button>

        {/* Google Sign In */}
        {showGoogleLogin && (
          <>
            <div className="hlw-divider">
              <span className="hlw-divider-text">或</span>
            </div>

            <button
              type="button"
              className="hlw-button hlw-button-outline hlw-button-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="hlw-button-icon hlw-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span className="hlw-button-text">使用 Google 帳號</span>
            </button>
          </>
        )}
      </form>
    </div>
  );
}
