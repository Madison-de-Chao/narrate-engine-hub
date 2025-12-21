import { ReactNode, useEffect, useState } from 'react';
import { useMembershipStatus, getMembershipLabel } from '@/hooks/useMembershipStatus';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, LogIn, ExternalLink, Crown, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface EntitlementGuardProps {
  children: ReactNode;
  productId?: string;
  fallbackUrl?: string;
}

export function EntitlementGuard({ 
  children, 
  productId,
  fallbackUrl = 'https://momo.maison-de-chao.com'
}: EntitlementGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { hasAccess, loading, error, source, tier } = useMembershipStatus(productId);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">驗證授權中...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>請先登入</CardTitle>
            <CardDescription>
              您需要登入才能訪問此內容
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate('/auth')} className="w-full">
              前往登入
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (but still allow access check to proceed)
  if (error && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">驗證錯誤</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              重試
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No access
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle>需要會員資格</CardTitle>
            <CardDescription>
              此內容僅開放給付費會員，請先購買會員資格以解鎖完整功能
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button 
              onClick={() => window.open(fallbackUrl, '_blank')}
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              前往購買會員
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has access - render children with optional membership badge
  return <>{children}</>;
}

// Export a badge component for showing membership status
export function MembershipBadge({ 
  source, 
  tier, 
  className 
}: { 
  source: 'central' | 'local' | 'none'; 
  tier: string;
  className?: string;
}) {
  if (source === 'none') return null;

  const label = getMembershipLabel(source, tier as any);
  const isCentral = source === 'central';

  return (
    <Badge 
      variant="secondary" 
      className={`${isCentral ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'} ${className}`}
    >
      {isCentral ? <Building2 className="h-3 w-3 mr-1" /> : <Crown className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}
