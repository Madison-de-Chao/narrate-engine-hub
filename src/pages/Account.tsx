import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Crown, Shield, LogOut, Edit2, Check, X, Loader2, Sparkles } from 'lucide-react';
import { useMember } from '@/lib/member';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedMembership } from '@/hooks/useUnifiedMembership';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface Subscription {
  id: string;
  status: string;
  plan: string;
  started_at: string | null;
  expires_at: string | null;
}

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading, updateProfile } = useMember();
  const { toast } = useToast();
  const { hasAccess, loading: membershipLoading } = useUnifiedMembership('bazi-premium');
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [loading, user, navigate]);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoadingSubscription(false);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: '已登出',
      description: '期待您的再次造訪！',
    });
    navigate('/');
  };

  const startEditingName = () => {
    setEditedName(profile?.display_name || '');
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const saveDisplayName = async () => {
    if (!editedName.trim()) {
      toast({
        title: '錯誤',
        description: '暱稱不能為空',
        variant: 'destructive',
      });
      return;
    }

    setSavingName(true);
    try {
      await updateProfile({ display_name: editedName.trim() });
      toast({
        title: '更新成功',
        description: '您的暱稱已更新',
      });
      setIsEditingName(false);
    } catch (error) {
      toast({
        title: '更新失敗',
        description: '請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setSavingName(false);
    }
  };

  // 會員狀態徽章（統一顯示，不區分來源）- Cosmic Architect 風格
  const getMembershipBadge = () => {
    if (membershipLoading) {
      return <Badge variant="secondary" className="bg-cosmic-surface/50 border-cosmic-gold/30"><Loader2 className="w-3 h-3 animate-spin mr-1" />載入中</Badge>;
    }
    
    if (!hasAccess) {
      return <Badge variant="secondary" className="bg-cosmic-surface/50 border-cosmic-gold/30 text-cosmic-gold/70">免費版</Badge>;
    }
    
    // 統一顯示為 Premium 會員 - Cosmic Architect 金色光輝風格
    return (
      <Badge 
        className="
          relative overflow-hidden
          bg-gradient-to-r from-cosmic-gold via-cosmic-gold-bright to-cosmic-gold 
          text-cosmic-void border-0
          shadow-[0_0_20px_hsl(var(--cosmic-gold)/0.6)]
          animate-pulse-glow
        "
      >
        {/* Shimmer overlay */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        <Crown className="w-3 h-3 mr-1 relative z-10 drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]" />
        <span className="relative z-10 font-bold">Premium 會員</span>
      </Badge>
    );
  };

  const getSubscriptionBadge = () => {
    if (!subscription || subscription.status !== 'active') {
      return <Badge variant="secondary" className="bg-cosmic-surface/50 border-cosmic-gold/30 text-cosmic-gold/70">免費版</Badge>;
    }
    
    const planLabels: Record<string, string> = {
      monthly: '月訂閱',
      yearly: '年訂閱',
      lifetime: '終身會員',
      premium: 'Premium',
    };
    
    // Cosmic Architect 金色光輝風格的訂閱徽章
    return (
      <Badge 
        className="
          relative overflow-hidden
          bg-gradient-to-r from-cosmic-gold via-cosmic-gold-bright to-cosmic-gold 
          text-cosmic-void border-0
          shadow-[0_0_20px_hsl(var(--cosmic-gold)/0.6)]
          animate-pulse-glow
        "
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        <Crown className="w-3 h-3 mr-1 relative z-10 drop-shadow-[0_0_4px_rgba(0,0,0,0.3)]" />
        <span className="relative z-10 font-bold">{planLabels[subscription.plan] || subscription.plan}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'yyyy年MM月dd日', { locale: zhTW });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cosmic-void">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-cosmic-gold" />
          <div className="absolute inset-0 blur-xl bg-cosmic-gold/30 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-cosmic-void relative overflow-hidden">
      {/* 星空背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--cosmic-deep)),hsl(var(--cosmic-void)))]" />
        <div className="stars opacity-40" />
        {/* 星雲效果 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cosmic-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Header - Cosmic Architect 風格 */}
        <div className="text-center space-y-4">
          {/* 頭像光環 */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-cosmic-gold/30 to-cosmic-gold-bright/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-gold/20 to-cosmic-gold-bright/10 border-2 border-cosmic-gold/50 flex items-center justify-center shadow-[0_0_30px_hsl(var(--cosmic-gold)/0.3)]">
              <User className="w-10 h-10 text-cosmic-gold" />
            </div>
          </div>
          
          {/* 標題 */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cosmic-gold via-cosmic-gold-bright to-cosmic-gold bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--cosmic-gold)/0.5)]">
            會員中心
          </h1>
          
          <div className="flex items-center justify-center gap-2">
            {getMembershipBadge()}
          </div>
          
          <p className="text-cosmic-muted text-sm">
            管理您的帳戶與訂閱
          </p>
        </div>

        {/* Profile Card - Cosmic Architect 風格 */}
        <Card className="bg-cosmic-deep/80 backdrop-blur-md border-cosmic-gold/30 shadow-[0_0_30px_hsl(var(--cosmic-gold)/0.1)] relative overflow-hidden">
          {/* 裝飾角落 */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cosmic-gold/40 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cosmic-gold/40 rounded-tr-lg" />
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cosmic-gold">
              <Shield className="w-5 h-5" />
              個人資料
            </CardTitle>
            <CardDescription className="text-cosmic-muted">您的帳戶基本資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cosmic-surface/50 border border-cosmic-gold/20">
                  <User className="w-5 h-5 text-cosmic-gold" />
                </div>
                <div>
                  <p className="text-xs text-cosmic-muted">暱稱</p>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 w-40 bg-cosmic-surface/50 border-cosmic-gold/30 focus:border-cosmic-gold text-foreground"
                        placeholder="輸入暱稱"
                        disabled={savingName}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={saveDisplayName}
                        disabled={savingName}
                        className="h-8 w-8 p-0 hover:bg-cosmic-gold/10"
                      >
                        {savingName ? (
                          <Loader2 className="w-4 h-4 animate-spin text-cosmic-gold" />
                        ) : (
                          <Check className="w-4 h-4 text-green-400" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditingName}
                        disabled={savingName}
                        className="h-8 w-8 p-0 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ) : (
                    <p className="font-medium text-foreground">
                      {profile?.display_name || '未設定'}
                    </p>
                  )}
                </div>
              </div>
              {!isEditingName && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startEditingName}
                  className="text-cosmic-gold hover:text-cosmic-gold-bright hover:bg-cosmic-gold/10"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Separator className="bg-cosmic-gold/20" />

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cosmic-surface/50 border border-cosmic-gold/20">
                <Mail className="w-5 h-5 text-cosmic-gold" />
              </div>
              <div>
                <p className="text-xs text-cosmic-muted">電子郵件</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            <Separator className="bg-cosmic-gold/20" />

            {/* Member Since */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cosmic-surface/50 border border-cosmic-gold/20">
                <Calendar className="w-5 h-5 text-cosmic-gold" />
              </div>
              <div>
                <p className="text-xs text-cosmic-muted">註冊日期</p>
                <p className="font-medium text-foreground">
                  {user.created_at ? formatDate(user.created_at) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card - Cosmic Architect 風格 */}
        <Card className="bg-cosmic-deep/80 backdrop-blur-md border-cosmic-gold/30 shadow-[0_0_30px_hsl(var(--cosmic-gold)/0.1)] relative overflow-hidden">
          {/* 裝飾角落 */}
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-cosmic-gold/40 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cosmic-gold/40 rounded-br-lg" />
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-cosmic-gold">
                  <Crown className="w-5 h-5" />
                  訂閱狀態
                </CardTitle>
                <CardDescription className="text-cosmic-muted">您目前的訂閱方案</CardDescription>
              </div>
              {getSubscriptionBadge()}
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubscription ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-cosmic-gold" />
              </div>
            ) : subscription && subscription.status === 'active' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-cosmic-gold/10 border border-cosmic-gold/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-cosmic-muted">開始日期</p>
                      <p className="font-medium text-foreground">{formatDate(subscription.started_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-cosmic-muted">到期日期</p>
                      <p className="font-medium text-foreground">
                        {subscription.expires_at ? formatDate(subscription.expires_at) : '永久有效'}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-center text-cosmic-muted">
                  <Sparkles className="w-4 h-4 inline mr-1 text-cosmic-gold" />
                  感謝您的支持！您可以享用所有 Premium 功能。
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-cosmic-gold/10 blur-xl" />
                  <div className="relative w-16 h-16 rounded-full bg-cosmic-surface/50 border border-cosmic-gold/20 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-cosmic-muted" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">您目前使用免費版</p>
                  <p className="text-sm mt-1 text-cosmic-muted">
                    升級以解鎖完整軍團故事和詳細分析
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/subscribe')}
                  className="bg-gradient-to-r from-cosmic-gold via-cosmic-gold-bright to-cosmic-gold text-cosmic-void font-bold hover:shadow-[0_0_30px_hsl(var(--cosmic-gold)/0.5)] transition-all duration-300"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  升級 Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions - Cosmic Architect 風格 */}
        <Card className="bg-cosmic-deep/80 backdrop-blur-md border-cosmic-gold/30 shadow-[0_0_30px_hsl(var(--cosmic-gold)/0.1)]">
          <CardContent className="pt-6">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              登出帳戶
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
