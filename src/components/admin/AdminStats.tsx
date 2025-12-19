import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, Calendar, Loader2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalCalculations: number;
  recentSignups: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalCalculations: 0,
    recentSignups: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 獲取總用戶數
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // 獲取活躍訂閱數
        const { count: subscriptionsCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // 獲取總計算數
        const { count: calculationsCount } = await supabase
          .from('bazi_calculations')
          .select('*', { count: 'exact', head: true });

        // 獲取最近7天註冊數
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: recentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());

        setStats({
          totalUsers: usersCount || 0,
          activeSubscriptions: subscriptionsCount || 0,
          totalCalculations: calculationsCount || 0,
          recentSignups: recentCount || 0
        });
      } catch (error) {
        console.error('獲取統計數據失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: '總用戶數',
      value: stats.totalUsers,
      description: '已註冊會員',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: '活躍訂閱',
      value: stats.activeSubscriptions,
      description: '付費會員',
      icon: CreditCard,
      color: 'text-green-500'
    },
    {
      title: '命盤計算',
      value: stats.totalCalculations,
      description: '總計算次數',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      title: '近7天註冊',
      value: stats.recentSignups,
      description: '新增用戶',
      icon: Calendar,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">數據統計</h2>
        <p className="text-muted-foreground">網站總覽與關鍵指標</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>訂閱轉換率</CardTitle>
          <CardDescription>付費用戶佔總用戶比例</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {stats.totalUsers > 0 
              ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) 
              : 0}%
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ 
                width: `${stats.totalUsers > 0 
                  ? (stats.activeSubscriptions / stats.totalUsers) * 100 
                  : 0}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
