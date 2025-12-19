import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Crown } from 'lucide-react';

interface User {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string | null;
  subscription?: {
    plan: string;
    status: string;
  } | null;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 獲取所有用戶
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // 獲取所有訂閱
        const { data: subscriptions, error: subsError } = await supabase
          .from('subscriptions')
          .select('user_id, plan, status');

        if (subsError) throw subsError;

        // 合併資料
        const usersWithSubs = (profiles || []).map(profile => ({
          ...profile,
          subscription: subscriptions?.find(sub => sub.user_id === profile.id) || null
        }));

        setUsers(usersWithSubs);
      } catch (error) {
        console.error('獲取用戶列表失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.display_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">用戶管理</h2>
        <p className="text-muted-foreground">查看所有註冊用戶</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜尋用戶..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用戶</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>會員狀態</TableHead>
                  <TableHead>註冊時間</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      暫無用戶
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user.display_name || '未設定'}
                          </span>
                          {user.subscription?.status === 'active' && (
                            <Crown className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email || '-'}
                      </TableCell>
                      <TableCell>
                        {user.subscription?.status === 'active' ? (
                          <Badge className="bg-amber-500">
                            {user.subscription.plan === 'monthly' && '月訂閱'}
                            {user.subscription.plan === 'yearly' && '年訂閱'}
                            {user.subscription.plan === 'lifetime' && '終身版'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">免費版</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.created_at 
                          ? new Date(user.created_at).toLocaleDateString('zh-TW')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
