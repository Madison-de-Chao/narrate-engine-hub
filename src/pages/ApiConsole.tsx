import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Copy, Eye, EyeOff, Trash2, Key, BarChart3, Book, RefreshCw, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface ApiKey {
  id: string;
  name: string;
  api_key_hash: string | null;
  api_key_prefix: string | null;
  is_active: boolean;
  requests_count: number;
  last_used_at: string | null;
  created_at: string;
}

const ApiConsole = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);

  // SHA-256 hash function for API key
  const hashApiKey = async (apiKey: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchApiKeys();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchApiKeys();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchApiKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("無法載入 API Keys");
      console.error(error);
      return;
    }

    setApiKeys(data || []);
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);
    
    let key = 'bz_';
    for (let i = 0; i < 32; i++) {
      key += chars[randomValues[i] % chars.length];
    }
    return key;
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("請輸入 API Key 名稱");
      return;
    }

    if (!session?.user?.id) {
      toast.error("請先登入");
      return;
    }

    setIsCreating(true);
    const apiKey = generateApiKey();
    const apiKeyHash = await hashApiKey(apiKey);
    const apiKeyPrefix = apiKey.substring(0, 7);

    const { error } = await supabase
      .from('api_keys')
      .insert({
        user_id: session.user.id,
        name: newKeyName.trim(),
        api_key_hash: apiKeyHash,
        api_key_prefix: apiKeyPrefix,
      });

    if (error) {
      toast.error("建立 API Key 失敗");
      console.error(error);
    } else {
      setNewKeyName("");
      setDialogOpen(false);
      setNewlyCreatedKey(apiKey);
      setShowNewKeyDialog(true);
      fetchApiKeys();
    }

    setIsCreating(false);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  };

  const toggleKeyStatus = async (keyId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: !currentStatus })
      .eq('id', keyId);

    if (error) {
      toast.error("更新失敗");
      console.error(error);
    } else {
      toast.success(currentStatus ? "API Key 已停用" : "API Key 已啟用");
      fetchApiKeys();
    }
  };

  const deleteApiKey = async (keyId: string) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (error) {
      toast.error("刪除失敗");
      console.error(error);
    } else {
      toast.success("API Key 已刪除");
      fetchApiKeys();
    }
  };

  const getDisplayKey = (key: ApiKey) => {
    // Only show prefix for hashed keys
    if (key.api_key_prefix) {
      return key.api_key_prefix + '•'.repeat(28);
    }
    return '•'.repeat(35);
  };

  const handleCopyKey = () => {
    // Keys are now always hashed - cannot be copied after creation
    toast.error("金鑰僅在建立時顯示一次，如需使用請重新產生新金鑰。");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>請先登入</CardTitle>
            <CardDescription>您需要登入才能管理 API Keys</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>
              前往登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests_count, 0);
  const activeKeys = apiKeys.filter(key => key.is_active).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">API 控制台</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/api-docs">
              <Button variant="outline" size="sm">
                <Book className="h-4 w-4 mr-2" />
                API 文檔
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">返回首頁</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>API Keys 數量</CardDescription>
              <CardTitle className="text-3xl">{apiKeys.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-500 font-medium">{activeKeys}</span> 個啟用中
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>總請求次數</CardDescription>
              <CardTitle className="text-3xl">{totalRequests.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">累計 API 調用</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>帳戶狀態</CardDescription>
              <CardTitle className="text-3xl">
                <Badge className="text-lg px-3 py-1">免費版</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">每月 1,000 次請求</p>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>管理您的 API 存取金鑰</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchApiKeys}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      新增 API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新增 API Key</DialogTitle>
                      <DialogDescription>
                        為您的應用程式建立新的 API Key
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="keyName">API Key 名稱</Label>
                        <Input
                          id="keyName"
                          placeholder="例如：我的網站、測試專案"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={createApiKey} disabled={isCreating}>
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        建立
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* New Key Created Dialog */}
                <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-green-600">🔑 API Key 已建立</DialogTitle>
                      <DialogDescription>
                        請立即複製並妥善保存您的 API Key。<strong className="text-destructive">此金鑰只會顯示一次，關閉後將無法再次查看！</strong>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <code className="text-sm break-all font-mono">{newlyCreatedKey}</code>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          if (newlyCreatedKey) {
                            navigator.clipboard.writeText(newlyCreatedKey);
                            toast.success("API Key 已複製到剪貼簿");
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        複製 API Key
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowNewKeyDialog(false);
                          setNewlyCreatedKey(null);
                        }}
                      >
                        我已保存，關閉
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">還沒有 API Key</h3>
                <p className="text-muted-foreground mb-4">
                  建立您的第一個 API Key 開始使用八字 API
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  新增 API Key
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名稱</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead className="text-center">狀態</TableHead>
                    <TableHead className="text-center">請求次數</TableHead>
                    <TableHead>最後使用</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {getDisplayKey(key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyKey()}
                            title="此金鑰已加密，無法複製"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Badge variant="secondary" className="text-xs">已加密</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={key.is_active}
                          onCheckedChange={() => toggleKeyStatus(key.id, key.is_active)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {key.requests_count.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {key.last_used_at
                          ? format(new Date(key.last_used_at), 'yyyy/MM/dd HH:mm', { locale: zhTW })
                          : '從未使用'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteApiKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>快速開始</CardTitle>
            <CardDescription>使用您的 API Key 發送第一個請求</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`curl -X POST "https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1/bazi-api" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "name": "張三",
    "gender": "男",
    "birthDate": "1990-05-15",
    "birthTime": "14:30"
  }'`}</code>
            </pre>
            <p className="text-sm text-muted-foreground mt-3">
              ⚠️ 建立新金鑰後請立即複製保存，金鑰只會在建立時顯示一次。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiConsole;
