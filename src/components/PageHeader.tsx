import { useNavigate } from 'react-router-dom';
import { Home, Crown, LogOut, Settings, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedMembership } from '@/hooks/useUnifiedMembership';
import { MembershipBadge } from '@/components/EntitlementGuard';
import { useIdentity } from '@/hooks/useIdentity';
import { toast } from 'sonner';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { redirectToCentralSubscribe } from '@/config/centralAuth';

interface PageHeaderProps {
  title?: string;
  showHomeButton?: boolean;
  showLogout?: boolean;
  showAdminLink?: boolean;
  showMembershipBadge?: boolean;
  className?: string;
  children?: React.ReactNode;
  leftSection?: React.ReactNode;
  centerSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  showHomeButton = true, 
  showLogout = false,
  showAdminLink = false,
  showMembershipBadge = true,
  className = '',
  children,
  leftSection,
  centerSection,
  rightSection
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { email, clearEmail, hasIdentity } = useIdentity();
  const { hasAccess, source: membershipSource, tier, loading: membershipLoading } = useUnifiedMembership();
  // Admin 入口本地暫無 user id 可查；先停用（主站尚未提供 admin role 介接）
  const { isAdmin } = useAdminStatus(undefined);

  const handleLogout = () => {
    clearEmail();
    toast.success("已清除身份");
    navigate("/auth");
  };

  return (
    <header className={`sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 ${className}`}>
      <div className="container max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左側 */}
          <div className="flex items-center gap-2">
            {leftSection}
            {showHomeButton && !leftSection && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                返回首頁
              </Button>
            )}
            {children}
          </div>
          
          {/* 中間區域 */}
          {centerSection ? (
            centerSection
          ) : title ? (
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {title}
            </h1>
          ) : null}
          
          {/* 右側 */}
          <div className="flex items-center gap-2">
            {/* 自定義右側區域 */}
            {rightSection}
            
            {/* 管理員入口 */}
            {showAdminLink && isAdmin && (
              <Button
                onClick={() => navigate('/admin')}
                variant="ghost"
                size="sm"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            
            {/* 會員狀態 */}
            {showMembershipBadge && hasIdentity && !membershipLoading && (
              hasAccess ? (
                <MembershipBadge source={membershipSource} tier={tier} />
              ) : (
              <Button
                onClick={() => redirectToCentralSubscribe()}
                variant="outline"
                size="sm"
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                title="前往主站升級"
              >
                <Crown className="mr-1 h-3 w-3" />
                升級
              </Button>
              )
            )}

            {/* 未設定身份 → 顯示前往設定 */}
            {showMembershipBadge && !hasIdentity && (
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <UserRound className="h-3 w-3" />
                設定身份
              </Button>
            )}

            {/* 登出按鈕 */}
            {showLogout && hasIdentity && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                title={`清除身份（${email}）`}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// 向後相容：保留同名 hook 供舊頁面使用，回傳一個近似 user 物件（僅含 email）。
export function usePageHeaderAuth() {
  const { email } = useIdentity();
  return { user: email ? ({ email, id: email } as { email: string; id: string }) : null };
}
