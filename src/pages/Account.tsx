import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Crown, Shield, LogOut, Edit2, Check, X, Loader2, Globe, Database } from 'lucide-react';
import { useMember } from '@/lib/member';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme } = useTheme();
  const { user, profile, signOut, loading, updateProfile } = useMember();
  const { toast } = useToast();
  const { hasAccess, source, tier, loading: membershipLoading } = useUnifiedMembership('bazi-premium');
  
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

  // 會員來源徽章
  const getMembershipSourceBadge = () => {
    if (membershipLoading) {
      return <Badge variant="secondary"><Loader2 className="w-3 h-3 animate-spin mr-1" />載入中</Badge>;
    }
    
    if (!hasAccess) {
      return <Badge variant="secondary">免費版</Badge>;
    }
    
    if (source === 'central') {
      return (
        <Badge className="bg-gradient-to-r from-purple-500 to-violet-500 text-white border-0">
          <Globe className="w-3 h-3 mr-1" />
          中央會員
        </Badge>
      );
    }
    
    if (source === 'local') {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <Database className="w-3 h-3 mr-1" />
          本地會員
        </Badge>
      );
    }
    
    return <Badge variant="secondary">免費版</Badge>;
  };

  const getSubscriptionBadge = () => {
    if (!subscription || subscription.status !== 'active') {
      return <Badge variant="secondary">免費版</Badge>;
    }
    
    const planLabels: Record<string, string> = {
      monthly: '月訂閱',
      yearly: '年訂閱',
      lifetime: '終身會員',
      premium: 'Premium',
    };
    
    return (
      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
        <Crown className="w-3 h-3 mr-1" />
        {planLabels[subscription.plan] || subscription.plan}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return format(new Date(dateString), 'yyyy年MM月dd日', { locale: zhTW });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30' 
              : 'bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200'
          }`}>
            <User className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
            會員中心
          </h1>
          <div className="flex items-center justify-center gap-2">
            {getMembershipSourceBadge()}
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-paper/60' : 'text-void/60'}`}>
            管理您的帳戶與訂閱
          </p>
        </div>

        {/* Profile Card */}
        <Card className={theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              個人資料
            </CardTitle>
            <CardDescription>您的帳戶基本資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <User className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
                    暱稱
                  </p>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 w-40"
                        placeholder="輸入暱稱"
                        disabled={savingName}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={saveDisplayName}
                        disabled={savingName}
                        className="h-8 w-8 p-0"
                      >
                        {savingName ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditingName}
                        disabled={savingName}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <p className={`font-medium ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
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
                  className="text-amber-500 hover:text-amber-600"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Separator className={theme === 'dark' ? 'bg-slate-700' : ''} />

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <Mail className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
                  電子郵件
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                  {user.email}
                </p>
              </div>
            </div>

            <Separator className={theme === 'dark' ? 'bg-slate-700' : ''} />

            {/* Member Since */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}>
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className={`text-xs ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
                  註冊日期
                </p>
                <p className={`font-medium ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                  {user.created_at ? formatDate(user.created_at) : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className={theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  訂閱狀態
                </CardTitle>
                <CardDescription>您目前的訂閱方案</CardDescription>
              </div>
              {getSubscriptionBadge()}
            </div>
          </CardHeader>
          <CardContent>
            {loadingSubscription ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : subscription && subscription.status === 'active' ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-100'
                }`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
                        開始日期
                      </p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                        {formatDate(subscription.started_at)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
                        到期日期
                      </p>
                      <p className={`font-medium ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                        {subscription.expires_at ? formatDate(subscription.expires_at) : '永久有效'}
                      </p>
                    </div>
                  </div>
                </div>
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-paper/60' : 'text-void/60'}`}>
                  感謝您的支持！您可以享用所有 Premium 功能。
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <Crown className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                    您目前使用免費版
                  </p>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-paper/60' : 'text-void/60'}`}>
                    升級以解鎖完整軍團故事和詳細分析
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/subscribe')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  升級 Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className={theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : ''}>
          <CardContent className="pt-6">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
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
