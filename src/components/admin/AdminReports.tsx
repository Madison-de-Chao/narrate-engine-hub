import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Eye, Trash2, Calendar, User, MapPin, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface BaziCalculation {
  id: string;
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  location: string | null;
  year_stem: string;
  year_branch: string;
  month_stem: string;
  month_branch: string;
  day_stem: string;
  day_branch: string;
  hour_stem: string;
  hour_branch: string;
  year_nayin: string | null;
  month_nayin: string | null;
  day_nayin: string | null;
  hour_nayin: string | null;
  created_at: string | null;
  user_id: string | null;
  shensha: unknown;
  ten_gods: unknown;
  wuxing_scores: unknown;
}

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
}

export const AdminReports = () => {
  const [reports, setReports] = useState<BaziCalculation[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<BaziCalculation | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bazi_calculations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setReports(data || []);

      // 獲取相關用戶資料
      const userIds = [...new Set(data?.filter(r => r.user_id).map(r => r.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', userIds);
        
        const profileMap = new Map<string, Profile>();
        profilesData?.forEach(p => profileMap.set(p.id, p));
        setProfiles(profileMap);
      }
    } catch (error) {
      console.error('獲取報告失敗:', error);
      toast.error('獲取報告失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此報告嗎？此操作無法復原。')) return;
    
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('bazi_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('報告已刪除');
    } catch (error) {
      console.error('刪除報告失敗:', error);
      toast.error('刪除報告失敗');
    } finally {
      setDeleting(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    const profile = report.user_id ? profiles.get(report.user_id) : null;
    return (
      report.name.toLowerCase().includes(searchLower) ||
      report.location?.toLowerCase().includes(searchLower) ||
      profile?.email?.toLowerCase().includes(searchLower) ||
      profile?.display_name?.toLowerCase().includes(searchLower)
    );
  });

  const formatPillar = (stem: string, branch: string) => `${stem}${branch}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">命理報告管理</h2>
          <p className="text-muted-foreground">查看和管理所有用戶的八字命盤報告</p>
        </div>
        <Button onClick={fetchReports} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 搜尋欄 */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜尋姓名、地點、用戶..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 統計卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">總報告數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">今日新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => {
                if (!r.created_at) return false;
                const today = new Date().toDateString();
                return new Date(r.created_at).toDateString() === today;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">已登入用戶報告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.user_id).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 報告列表 */}
      <Card>
        <CardHeader>
          <CardTitle>報告列表</CardTitle>
          <CardDescription>
            顯示 {filteredReports.length} 筆報告
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>性別</TableHead>
                  <TableHead>八字</TableHead>
                  <TableHead>用戶</TableHead>
                  <TableHead>建立時間</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      沒有找到報告
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => {
                    const profile = report.user_id ? profiles.get(report.user_id) : null;
                    return (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>
                          <Badge variant={report.gender === '男' ? 'default' : 'secondary'}>
                            {report.gender}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatPillar(report.year_stem, report.year_branch)}{' '}
                          {formatPillar(report.month_stem, report.month_branch)}{' '}
                          {formatPillar(report.day_stem, report.day_branch)}{' '}
                          {formatPillar(report.hour_stem, report.hour_branch)}
                        </TableCell>
                        <TableCell>
                          {profile ? (
                            <span className="text-sm">
                              {profile.display_name || profile.email?.split('@')[0]}
                            </span>
                          ) : (
                            <Badge variant="outline">訪客</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {report.created_at
                            ? format(new Date(report.created_at), 'yyyy/MM/dd HH:mm', { locale: zhTW })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>報告詳情 - {report.name}</DialogTitle>
                                  <DialogDescription>
                                    八字命盤完整資料
                                  </DialogDescription>
                                </DialogHeader>
                                <ScrollArea className="h-[60vh] pr-4">
                                  <div className="space-y-6">
                                    {/* 基本資料 */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        基本資料
                                      </h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="text-muted-foreground">姓名：</span>
                                          {report.name}
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">性別：</span>
                                          {report.gender}
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">出生日期：</span>
                                          {report.birth_date}
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">出生時間：</span>
                                          {report.birth_time}
                                        </div>
                                        {report.location && (
                                          <div className="col-span-2">
                                            <span className="text-muted-foreground">出生地點：</span>
                                            {report.location}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* 八字四柱 */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        八字四柱
                                      </h4>
                                      <div className="grid grid-cols-4 gap-3">
                                        {[
                                          { label: '年柱', stem: report.year_stem, branch: report.year_branch, nayin: report.year_nayin },
                                          { label: '月柱', stem: report.month_stem, branch: report.month_branch, nayin: report.month_nayin },
                                          { label: '日柱', stem: report.day_stem, branch: report.day_branch, nayin: report.day_nayin },
                                          { label: '時柱', stem: report.hour_stem, branch: report.hour_branch, nayin: report.hour_nayin },
                                        ].map((pillar, idx) => (
                                          <Card key={idx} className="text-center">
                                            <CardHeader className="pb-2 pt-3">
                                              <CardTitle className="text-xs text-muted-foreground">
                                                {pillar.label}
                                              </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                              <div className="text-2xl font-bold">
                                                {pillar.stem}{pillar.branch}
                                              </div>
                                              {pillar.nayin && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                  {pillar.nayin}
                                                </div>
                                              )}
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 五行分數 */}
                                    {report.wuxing_scores && (
                                      <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2">
                                          <FileText className="w-4 h-4" />
                                          五行分數
                                        </h4>
                                        <div className="grid grid-cols-5 gap-2">
                                          {Object.entries(report.wuxing_scores as Record<string, number>).map(([element, score]) => (
                                            <div key={element} className="text-center p-2 rounded-lg bg-muted">
                                              <div className="font-bold">{element}</div>
                                              <div className="text-sm text-muted-foreground">{score}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* 神煞資訊 */}
                                    {report.shensha && Array.isArray(report.shensha) && report.shensha.length > 0 && (
                                      <div className="space-y-3">
                                        <h4 className="font-semibold">神煞</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {(report.shensha as Array<{ name: string; type?: string }>).slice(0, 20).map((sha, idx) => (
                                            <Badge 
                                              key={idx} 
                                              variant={sha.type === '吉' ? 'default' : sha.type === '凶' ? 'destructive' : 'secondary'}
                                            >
                                              {sha.name}
                                            </Badge>
                                          ))}
                                          {(report.shensha as Array<unknown>).length > 20 && (
                                            <Badge variant="outline">
                                              +{(report.shensha as Array<unknown>).length - 20} 更多
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* 用戶資訊 */}
                                    {profile && (
                                      <div className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2">
                                          <User className="w-4 h-4" />
                                          用戶資訊
                                        </h4>
                                        <div className="text-sm">
                                          <div>
                                            <span className="text-muted-foreground">用戶名稱：</span>
                                            {profile.display_name || '-'}
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">電子郵件：</span>
                                            {profile.email || '-'}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                              disabled={deleting === report.id}
                              className="text-destructive hover:text-destructive"
                            >
                              {deleting === report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
