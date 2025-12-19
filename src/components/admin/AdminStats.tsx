import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalCalculations: number;
  recentSignups: number;
}

interface TrendData {
  date: string;
  users: number;
  subscriptions: number;
}

export const AdminStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalCalculations: 0,
    recentSignups: 0
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
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

        // 獲取過去30天趨勢數據
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        const { data: subscriptionsData } = await supabase
          .from('subscriptions')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        // 構建趨勢數據
        const trendMap = new Map<string, { users: number; subscriptions: number }>();
        
        // 初始化過去30天
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          trendMap.set(dateStr, { users: 0, subscriptions: 0 });
        }

        // 填充用戶數據
        profilesData?.forEach(profile => {
          const dateStr = new Date(profile.created_at!).toISOString().split('T')[0];
          const existing = trendMap.get(dateStr);
          if (existing) {
            existing.users += 1;
          }
        });

        // 填充訂閱數據
        subscriptionsData?.forEach(sub => {
          const dateStr = new Date(sub.created_at).toISOString().split('T')[0];
          const existing = trendMap.get(dateStr);
          if (existing) {
            existing.subscriptions += 1;
          }
        });

        // 轉換為數組並計算累積值
        let cumulativeUsers = usersCount || 0;
        let cumulativeSubscriptions = subscriptionsCount || 0;
        
        // 計算初始值（減去過去30天的增量）
        profilesData?.forEach(() => cumulativeUsers--);
        subscriptionsData?.forEach(() => cumulativeSubscriptions--);
        
        const trends: TrendData[] = [];
        trendMap.forEach((value, key) => {
          cumulativeUsers += value.users;
          cumulativeSubscriptions += value.subscriptions;
          trends.push({
            date: key.slice(5), // 只顯示 MM-DD
            users: cumulativeUsers,
            subscriptions: cumulativeSubscriptions
          });
        });

        setTrendData(trends);
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

  const chartConfig = {
    users: {
      label: "用戶數",
      color: "hsl(var(--primary))"
    },
    subscriptions: {
      label: "訂閱數",
      color: "hsl(142, 76%, 36%)"
    }
  };

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

      {/* 用戶增長趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle>用戶增長趨勢</CardTitle>
          <CardDescription>過去30天用戶累積數量</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorUsers)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 訂閱趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle>訂閱趨勢</CardTitle>
          <CardDescription>過去30天訂閱累積數量</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="subscriptions" 
                stroke="hsl(142, 76%, 36%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 轉換率卡片 */}
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