import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Book, Code, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const ApiDocs = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const baseUrl = "https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1";

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id, language = "json" }: { code: string; id: string; language?: string }) => (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  const requestExample = `{
  "name": "張三",
  "gender": "男",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "timezoneOffsetMinutes": 480
}`;

  const responseExample = `{
  "success": true,
  "data": {
    "name": "張三",
    "gender": "男",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "pillars": {
      "year": { "stem": "庚", "branch": "午", "nayin": "路旁土" },
      "month": { "stem": "辛", "branch": "巳", "nayin": "白蠟金" },
      "day": { "stem": "甲", "branch": "子", "nayin": "海中金" },
      "hour": { "stem": "辛", "branch": "未", "nayin": "路旁土" }
    },
    "wuxingScores": { "木": 2, "火": 3, "土": 2, "金": 3, "水": 1 },
    "yinyangRatio": { "yin": 5, "yang": 3 },
    "tenGods": { ... },
    "shensha": [ ... ],
    "shenshaDetails": [ ... ]
  }
}`;

  const curlExample = `curl -X POST "${baseUrl}/bazi-api" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "name": "張三",
    "gender": "男",
    "birthDate": "1990-05-15",
    "birthTime": "14:30"
  }'`;

  const jsExample = `const response = await fetch("${baseUrl}/bazi-api", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    name: "張三",
    gender: "男",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    timezoneOffsetMinutes: 480
  })
});

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

url = "${baseUrl}/bazi-api"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
}
payload = {
    "name": "張三",
    "gender": "男",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "timezoneOffsetMinutes": 480
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">八字 API 文檔</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/api-console">
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                API 控制台
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">返回首頁</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Introduction */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">歡迎使用八字 API</h2>
          <p className="text-muted-foreground text-lg mb-6">
            八字 API 提供專業的八字命理計算服務，包括四柱排盤、十神分析、神煞計算等功能。
            適用於命理應用、占卜網站、個人化服務等場景。
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  高效能
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">毫秒級響應，支援高並發請求</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  安全可靠
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">API Key 認證，HTTPS 加密傳輸</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  易於整合
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">RESTful API，JSON 格式回應</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Reference */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概覽</TabsTrigger>
            <TabsTrigger value="endpoint">端點說明</TabsTrigger>
            <TabsTrigger value="examples">程式範例</TabsTrigger>
            <TabsTrigger value="errors">錯誤處理</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Base URL</h4>
                    <CodeBlock code={baseUrl} id="base-url" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">認證方式</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      在請求標頭中加入 API Key：
                    </p>
                    <CodeBlock code='x-api-key: YOUR_API_KEY' id="auth-header" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>可用端點</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Badge className="bg-green-500">POST</Badge>
                    <code className="text-sm">/bazi-api</code>
                    <span className="text-sm text-muted-foreground ml-auto">計算八字命盤</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoint" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500">POST</Badge>
                  <CardTitle>/bazi-api</CardTitle>
                </div>
                <CardDescription>計算八字命盤，包含四柱、十神、神煞分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">請求參數</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">參數名</th>
                          <th className="text-left p-3">類型</th>
                          <th className="text-left p-3">必填</th>
                          <th className="text-left p-3">說明</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3"><code>name</code></td>
                          <td className="p-3">string</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">姓名</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>gender</code></td>
                          <td className="p-3">string</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">性別（男/女）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>birthDate</code></td>
                          <td className="p-3">string</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">出生日期 (YYYY-MM-DD)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>birthTime</code></td>
                          <td className="p-3">string</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">出生時間 (HH:mm)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>timezoneOffsetMinutes</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="outline" className="text-xs">選填</Badge></td>
                          <td className="p-3">時區偏移（分鐘），預設 480 (UTC+8)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">請求範例</h4>
                  <CodeBlock code={requestExample} id="request-example" />
                </div>

                <div>
                  <h4 className="font-medium mb-3">回應範例</h4>
                  <CodeBlock code={responseExample} id="response-example" />
                </div>

                <div>
                  <h4 className="font-medium mb-3">回應欄位說明</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">欄位</th>
                          <th className="text-left p-3">說明</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3"><code>pillars</code></td>
                          <td className="p-3">四柱資訊（年柱、月柱、日柱、時柱），包含天干、地支、納音</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>wuxingScores</code></td>
                          <td className="p-3">五行分數統計（木、火、土、金、水）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>yinyangRatio</code></td>
                          <td className="p-3">陰陽比例</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>tenGods</code></td>
                          <td className="p-3">十神分析結果</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>shensha</code></td>
                          <td className="p-3">神煞名稱列表</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>shenshaDetails</code></td>
                          <td className="p-3">神煞詳細資訊</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Tabs defaultValue="curl" className="space-y-4">
              <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="curl">
                <Card>
                  <CardHeader>
                    <CardTitle>cURL 範例</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={curlExample} id="curl-example" language="bash" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="javascript">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript / TypeScript 範例</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={jsExample} id="js-example" language="javascript" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="python">
                <Card>
                  <CardHeader>
                    <CardTitle>Python 範例</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={pythonExample} id="python-example" language="python" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>錯誤回應格式</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  code={`{
  "success": false,
  "error": "錯誤訊息描述"
}`}
                  id="error-format"
                />

                <div>
                  <h4 className="font-medium mb-3">常見錯誤碼</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3">HTTP 狀態碼</th>
                          <th className="text-left p-3">說明</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="p-3"><Badge variant="outline">400</Badge></td>
                          <td className="p-3">請求參數錯誤，缺少必填欄位或格式不正確</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><Badge variant="outline">401</Badge></td>
                          <td className="p-3">未授權，API Key 無效或已過期</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><Badge variant="outline">429</Badge></td>
                          <td className="p-3">請求過於頻繁，已超出速率限制</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><Badge variant="outline">500</Badge></td>
                          <td className="p-3">伺服器內部錯誤</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-3">準備好開始了嗎？</h3>
            <p className="text-muted-foreground mb-6">
              前往 API 控制台獲取您的 API Key，開始使用八字 API
            </p>
            <Link to="/api-console">
              <Button size="lg">
                <Zap className="h-4 w-4 mr-2" />
                前往 API 控制台
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;
