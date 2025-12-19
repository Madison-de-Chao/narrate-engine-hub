import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_NAMES } from '@/hooks/usePremiumStatus';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  profile?: {
    email: string | null;
    display_name: string | null;
  };
}

export const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  
  // 新增訂閱相關
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [allUsers, setAllUsers] = useState<Array<{ id: string; email: string | null; display_name: string | null }>>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [addPlan, setAddPlan] = useState('monthly');

  const fetchSubscriptions = async () => {
    try {
      // 分開查詢訂閱和用戶資料
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // 獲取所有用戶資料
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, display_name');

      // 合併資料
      const subsWithProfiles = (subsData || []).map(sub => ({
        ...sub,
        profile: profilesData?.find(p => p.id === sub.user_id) || null
      }));

      setSubscriptions(subsWithProfiles);
    } catch (error) {
      console.error('獲取訂閱列表失敗:', error);
      toast.error('獲取訂閱列表失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('獲取用戶列表失敗:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchAllUsers();
  }, []);

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setNewPlan(subscription.plan);
    setNewStatus(subscription.status);
    setNewExpiresAt(subscription.expires_at ? subscription.expires_at.split('T')[0] : '');
  };

  const handleSave = async () => {
    if (!editingSubscription) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan: newPlan,
          status: newStatus,
          expires_at: newExpiresAt ? new Date(newExpiresAt).toISOString() : null
        })
        .eq('id', editingSubscription.id);

      if (error) throw error;

      toast.success('訂閱更新成功');
      setEditingSubscription(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('更新訂閱失敗:', error);
      toast.error('更新訂閱失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedUserId) {
      toast.error('請選擇用戶');
      return;
    }

    setSaving(true);
    try {
      // 計算到期日
      const expiresAt = new Date();
      if (addPlan === 'monthly') {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (addPlan === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: selectedUserId,
          plan: addPlan,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: addPlan === 'lifetime' ? null : expiresAt.toISOString()
        });

      if (error) throw error;

      toast.success('訂閱新增成功');
      setShowAddDialog(false);
      setSelectedUserId('');
      setAddPlan('monthly');
      fetchSubscriptions();
    } catch (error) {
      console.error('新增訂閱失敗:', error);
      toast.error('新增訂閱失敗');
    } finally {
      setSaving(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sub.profile?.email?.toLowerCase().includes(searchLower) ||
      sub.profile?.display_name?.toLowerCase().includes(searchLower) ||
      sub.plan.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">有效</Badge>;
      case 'expired':
        return <Badge variant="secondary">已過期</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">已取消</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">訂閱管理</h2>
          <p className="text-muted-foreground">管理用戶訂閱狀態</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增訂閱
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增訂閱</DialogTitle>
              <DialogDescription>為用戶手動開通會員</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>選擇用戶</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇用戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.display_name || user.email || user.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>訂閱方案</Label>
                <Select value={addPlan} onValueChange={setAddPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">月訂閱</SelectItem>
                    <SelectItem value="yearly">年訂閱</SelectItem>
                    <SelectItem value="lifetime">終身版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                取消
              </Button>
              <Button onClick={handleAddSubscription} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                確認新增
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                  <TableHead>方案</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>到期日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      暫無訂閱記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {sub.profile?.display_name || '未設定'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {sub.profile?.email || sub.user_id.slice(0, 8)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{PLAN_NAMES[sub.plan] || sub.plan}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        {sub.expires_at 
                          ? new Date(sub.expires_at).toLocaleDateString('zh-TW')
                          : '永久'}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(sub)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>編輯訂閱</DialogTitle>
                              <DialogDescription>
                                {sub.profile?.display_name || sub.profile?.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>訂閱方案</Label>
                                <Select value={newPlan} onValueChange={setNewPlan}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="free">免費版</SelectItem>
                                    <SelectItem value="monthly">月訂閱</SelectItem>
                                    <SelectItem value="yearly">年訂閱</SelectItem>
                                    <SelectItem value="lifetime">終身版</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>狀態</Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">有效</SelectItem>
                                    <SelectItem value="inactive">未啟用</SelectItem>
                                    <SelectItem value="expired">已過期</SelectItem>
                                    <SelectItem value="cancelled">已取消</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>到期日</Label>
                                <Input
                                  type="date"
                                  value={newExpiresAt}
                                  onChange={(e) => setNewExpiresAt(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                儲存
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
