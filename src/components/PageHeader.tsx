import { useNavigate } from 'react-router-dom';
import { Home, Crown, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUnifiedMembership } from '@/hooks/useUnifiedMembership';
import { MembershipBadge } from '@/components/EntitlementGuard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAdminStatus } from '@/hooks/useAdminStatus';

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
  const [user, setUser] = useState<User | null>(null);
  const { hasAccess, source: membershipSource, tier, loading: membershipLoading } = useUnifiedMembership('bazi-premium');
  const { isAdmin } = useAdminStatus(user?.id);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("已登出");
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
            {showMembershipBadge && user && !membershipLoading && (
              hasAccess ? (
                <MembershipBadge source={membershipSource} tier={tier} />
              ) : (
                <Button
                  onClick={() => navigate('/subscribe')}
                  variant="outline"
                  size="sm"
                  className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  升級
                </Button>
              )
            )}

            {/* 登出按鈕 */}
            {showLogout && user && (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
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

// Export user state for external components that need it
export function usePageHeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  return { user };
}
