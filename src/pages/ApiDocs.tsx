import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Book, Code, Zap, Shield, Palette, FileText, Workflow, Variable } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const ApiDocs = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const baseUrl = "https://ncpqlfwllxkwkxcqmrdi.supabase.co/functions/v1";

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("已複製到剪貼板");
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
  -H "X-API-Key: YOUR_API_KEY" \\
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
    "X-API-Key": "YOUR_API_KEY"
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
    "X-API-Key": "YOUR_API_KEY"
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

  // Template integration examples
  const templateIntegrationExample = `// 步驟 1: 獲取八字數據
const baziResponse = await fetch("${baseUrl}/bazi-api", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "YOUR_BAZI_API_KEY"
  },
  body: JSON.stringify({
    name: "王小明",
    gender: "男",
    birthDate: "1990-05-15",
    birthTime: "14:30"
  })
});
const baziData = await baziResponse.json();

// 步驟 2: 構建您的自訂提示模板
const promptTemplate = \`
你是一位專業的命理分析師，請根據以下八字資料進行分析：

【基本資料】
姓名：\${baziData.data.name}
性別：\${baziData.data.gender}

【四柱八字】
年柱：\${baziData.data.pillars.year.stem}\${baziData.data.pillars.year.branch}（\${baziData.data.pillars.year.nayin}）
月柱：\${baziData.data.pillars.month.stem}\${baziData.data.pillars.month.branch}（\${baziData.data.pillars.month.nayin}）
日柱：\${baziData.data.pillars.day.stem}\${baziData.data.pillars.day.branch}（\${baziData.data.pillars.day.nayin}）
時柱：\${baziData.data.pillars.hour.stem}\${baziData.data.pillars.hour.branch}（\${baziData.data.pillars.hour.nayin}）

【五行分數】
木：\${baziData.data.wuxingScores.木}
火：\${baziData.data.wuxingScores.火}
土：\${baziData.data.wuxingScores.土}
金：\${baziData.data.wuxingScores.金}
水：\${baziData.data.wuxingScores.水}

【神煞】
\${baziData.data.shensha.join('、')}

請以現代心理學角度分析此人的性格特質與人生方向。
\`;

// 步驟 3: 調用您選擇的 AI 服務進行解讀
const aiResponse = await fetch("YOUR_AI_API_ENDPOINT", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_AI_API_KEY"
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [
      { role: "system", content: "你是專業命理分析師" },
      { role: "user", content: promptTemplate }
    ]
  })
});`;

  const legionTemplateExample = `// 軍團敘事風格模板範例
const createLegionPrompt = (baziData) => {
  const commanderMap = {
    '甲': '【森林將軍】甲木日主 - 參天大樹，正直剛毅',
    '乙': '【花蔓軍師】乙木日主 - 藤蔓花草，柔韌機敏',
    '丙': '【烈日戰神】丙火日主 - 太陽之火，光明磊落',
    '丁': '【誓燈法師】丁火日主 - 燭火之光，細膩溫暖',
    '戊': '【山岳守護】戊土日主 - 高山巨石，穩重可靠',
    '己': '【大地母親】己土日主 - 田園沃土，包容滋養',
    '庚': '【天鍛騎士】庚金日主 - 刀劍之金，剛強果決',
    '辛': '【靈晶鑑定師】辛金日主 - 珠玉之金，細緻精準',
    '壬': '【龍河船長】壬水日主 - 江河大海，奔放自由',
    '癸': '【甘露天使】癸水日主 - 雨露甘霖，滋潤萬物'
  };

  const advisorMap = {
    '子': '夜行刺客', '丑': '封藏守衛', '寅': '雷虎獵人',
    '卯': '玉兔使者', '辰': '泥雲龍法師', '巳': '蛇焰術士',
    '午': '日鬃騎兵', '未': '牧角調和者', '申': '金杖靈猴戰士',
    '酉': '鳳羽判衡者', '戌': '烽火戰犬統領', '亥': '潮典海豚智者'
  };

  const dayStem = baziData.data.pillars.day.stem;
  const dayBranch = baziData.data.pillars.day.branch;

  return \`
## 🏰 命盤軍團總覽

### 指揮官（日主）
\${commanderMap[dayStem] || dayStem}

### 主顧問（日支）
\${dayBranch}\${advisorMap[dayBranch] || ''}

### 神煞裝備
\${baziData.data.shenshaDetails?.map(s => 
  \`- 【\${s.type === '吉' ? '✨吉神' : s.type === '凶' ? '⚔️凶煞' : '🔮中性'}】\${s.name}（\${s.position}）\`
).join('\\n') || '無特殊裝備'}

### 五行軍力配置
🌳 木軍：\${baziData.data.wuxingScores.木} | 🔥 火軍：\${baziData.data.wuxingScores.火}
🏔️ 土軍：\${baziData.data.wuxingScores.土} | ⚔️ 金軍：\${baziData.data.wuxingScores.金}
💧 水軍：\${baziData.data.wuxingScores.水}

請以遊戲化的軍團敘事風格，分析這位指揮官的特質與人生戰略。
\`;
};`;

  const psychologyTemplateExample = `// 現代心理學風格模板範例
const createPsychologyPrompt = (baziData) => {
  const wuxing = baziData.data.wuxingScores;
  const totalScore = wuxing.木 + wuxing.火 + wuxing.土 + wuxing.金 + wuxing.水;
  
  // 計算各元素百分比
  const percentages = {
    木: ((wuxing.木 / totalScore) * 100).toFixed(1),
    火: ((wuxing.火 / totalScore) * 100).toFixed(1),
    土: ((wuxing.土 / totalScore) * 100).toFixed(1),
    金: ((wuxing.金 / totalScore) * 100).toFixed(1),
    水: ((wuxing.水 / totalScore) * 100).toFixed(1)
  };

  return \`
## 🧠 性格心理分析報告

### 受測者資訊
- 姓名：\${baziData.data.name}
- 性別：\${baziData.data.gender}

### 五行能量分布（心理特質傾向）
| 元素 | 比例 | 對應特質 |
|------|------|----------|
| 木 | \${percentages.木}% | 創造力、成長性、規劃能力 |
| 火 | \${percentages.火}% | 熱情、表達力、領導力 |
| 土 | \${percentages.土}% | 穩定性、實務能力、信任感 |
| 金 | \${percentages.金}% | 決斷力、條理性、執行力 |
| 水 | \${percentages.水}% | 智慧、適應力、溝通能力 |

### 陰陽能量比例
- 陰性能量：\${baziData.data.yinyangRatio.yin}（內斂、深思、感性）
- 陽性能量：\${baziData.data.yinyangRatio.yang}（外向、行動、理性）

### 十神關係網絡
\${JSON.stringify(baziData.data.tenGods, null, 2)}

請根據以上數據，以現代心理學 MBTI、大五人格等理論框架，
分析此人的性格特質、人際關係模式、職業傾向與成長建議。
\`;
};`;

  // Variables reference data
  const variablesReference = [
    { 
      category: "基本資料", 
      icon: "👤",
      variables: [
        { name: "name", type: "string", desc: "姓名" },
        { name: "gender", type: "string", desc: "性別（男/女）" },
        { name: "birthDate", type: "string", desc: "出生日期" },
        { name: "birthTime", type: "string", desc: "出生時間" },
      ]
    },
    { 
      category: "四柱資料", 
      icon: "🏛️",
      variables: [
        { name: "pillars.year.stem", type: "string", desc: "年干（天干）" },
        { name: "pillars.year.branch", type: "string", desc: "年支（地支）" },
        { name: "pillars.year.nayin", type: "string", desc: "年柱納音" },
        { name: "pillars.month.stem", type: "string", desc: "月干" },
        { name: "pillars.month.branch", type: "string", desc: "月支" },
        { name: "pillars.month.nayin", type: "string", desc: "月柱納音" },
        { name: "pillars.day.stem", type: "string", desc: "日干（日主）⭐" },
        { name: "pillars.day.branch", type: "string", desc: "日支" },
        { name: "pillars.day.nayin", type: "string", desc: "日柱納音" },
        { name: "pillars.hour.stem", type: "string", desc: "時干" },
        { name: "pillars.hour.branch", type: "string", desc: "時支" },
        { name: "pillars.hour.nayin", type: "string", desc: "時柱納音" },
      ]
    },
    { 
      category: "五行分析", 
      icon: "🔥",
      variables: [
        { name: "wuxingScores.木", type: "number", desc: "木的分數" },
        { name: "wuxingScores.火", type: "number", desc: "火的分數" },
        { name: "wuxingScores.土", type: "number", desc: "土的分數" },
        { name: "wuxingScores.金", type: "number", desc: "金的分數" },
        { name: "wuxingScores.水", type: "number", desc: "水的分數" },
      ]
    },
    { 
      category: "陰陽比例", 
      icon: "☯️",
      variables: [
        { name: "yinyangRatio.yin", type: "number", desc: "陰的數量" },
        { name: "yinyangRatio.yang", type: "number", desc: "陽的數量" },
      ]
    },
    { 
      category: "十神關係", 
      icon: "👥",
      variables: [
        { name: "tenGods.yearStem", type: "string", desc: "年干十神" },
        { name: "tenGods.monthStem", type: "string", desc: "月干十神" },
        { name: "tenGods.hourStem", type: "string", desc: "時干十神" },
        { name: "tenGods.yearBranch", type: "object", desc: "年支藏干十神" },
        { name: "tenGods.monthBranch", type: "object", desc: "月支藏干十神" },
        { name: "tenGods.dayBranch", type: "object", desc: "日支藏干十神" },
        { name: "tenGods.hourBranch", type: "object", desc: "時支藏干十神" },
      ]
    },
    { 
      category: "神煞列表", 
      icon: "⚔️",
      variables: [
        { name: "shensha", type: "array", desc: "神煞名稱陣列" },
        { name: "shenshaDetails", type: "array", desc: "神煞詳細資訊陣列" },
        { name: "shenshaDetails[].name", type: "string", desc: "神煞名稱" },
        { name: "shenshaDetails[].position", type: "string", desc: "神煞位置（年/月/日/時）" },
        { name: "shenshaDetails[].type", type: "string", desc: "神煞類型（吉/凶/中性）" },
        { name: "shenshaDetails[].description", type: "string", desc: "神煞說明" },
      ]
    },
  ];

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
            <Link to="/prompt-templates">
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4 mr-2" />
                提示模板
              </Button>
            </Link>
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
            您可以結合自訂的提示模板，將專業數據轉換為各種風格的現代化解讀方案。
          </p>
          
          <div className="grid md:grid-cols-4 gap-4">
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4 text-purple-500" />
                  模板自訂
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">支援自訂提示模板生成解讀</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Reference */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概覽</TabsTrigger>
            <TabsTrigger value="endpoint">端點說明</TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              模板指南
            </TabsTrigger>
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
                    <CodeBlock code={'X-API-Key: YOUR_API_KEY'} id="auth-header" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 核心概念：專業數據 + 自訂解讀</CardTitle>
                <CardDescription>了解如何將 API 數據轉換為個性化的解讀內容</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-lg text-center bg-primary/5">
                    <div className="text-3xl mb-2">1️⃣</div>
                    <h5 className="font-medium mb-1">調用八字 API</h5>
                    <p className="text-xs text-muted-foreground">
                      傳入出生資料，獲取專業八字數據
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg text-center bg-primary/5">
                    <div className="text-3xl mb-2">2️⃣</div>
                    <h5 className="font-medium mb-1">構建提示模板</h5>
                    <p className="text-xs text-muted-foreground">
                      將數據嵌入您設計的自訂模板
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg text-center bg-primary/5">
                    <div className="text-3xl mb-2">3️⃣</div>
                    <h5 className="font-medium mb-1">AI 生成解讀</h5>
                    <p className="text-xs text-muted-foreground">
                      調用 AI 將模板轉換為自然語言
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>設計理念：</strong>我們的 API 只負責提供專業的八字測算原始數據，
                    您可以根據自己的業務需求，設計各種風格的提示模板（軍團敘事、心理分析、傳統命理等），
                    結合您選擇的 AI 服務，生成完全客製化的解讀內容。
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>可用端點</CardTitle>
                <CardDescription>RSBZS v3.0 提供兩類 API 端點</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* V1 API Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-primary/20 text-primary border-primary/30">v3.0 NEW</Badge>
                      <h4 className="font-medium">SKU 1 & 2 - 標準化 API</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Badge className="bg-green-500">POST</Badge>
                        <code className="text-sm font-mono">/v1-bazi-calculate</code>
                        <Badge variant="secondary" className="text-xs">SKU 1</Badge>
                        <span className="text-sm text-muted-foreground ml-auto">基礎八字計算</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Badge className="bg-green-500">POST</Badge>
                        <code className="text-sm font-mono">/v1-bazi-analyze</code>
                        <Badge variant="secondary" className="text-xs">SKU 2</Badge>
                        <span className="text-sm text-muted-foreground ml-auto">進階分析（含十神、神煞、性格）</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ✨ 新版 API 支援真太陽時校正、跨日修正、藏干本氣十神等進階功能
                    </p>
                  </div>

                  {/* Legacy API Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Legacy</Badge>
                      <h4 className="font-medium text-muted-foreground">傳統 API</h4>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Badge className="bg-green-500">POST</Badge>
                      <code className="text-sm">/bazi-api</code>
                      <span className="text-sm text-muted-foreground ml-auto">計算八字命盤</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoint" className="space-y-6">
            {/* V1 Calculate API */}
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-green-500">POST</Badge>
                  <CardTitle className="font-mono">/v1-bazi-calculate</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/30">SKU 1</Badge>
                  <Badge variant="outline" className="text-xs">v3.0</Badge>
                </div>
                <CardDescription>基礎八字計算 API - 輸入出生時間，輸出四柱八字基礎數據</CardDescription>
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
                          <td className="p-3"><code>year</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">出生年份（西元年，如 1990）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>month</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">出生月份（1-12）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>day</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">出生日期（1-31）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>hour</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">出生時辰（0-23）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>minute</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">出生分鐘（0-59）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>tzOffsetMinutesEast</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">時區偏移（分鐘），東半球為正。例如 UTC+8 = 480</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>solarTimeMode</code></td>
                          <td className="p-3">string</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">NONE（不校正）、LMT（地方平太陽時）、TST（真太陽時）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>ziMode</code></td>
                          <td className="p-3">string</td>
                          <td className="p-3"><Badge variant="destructive" className="text-xs">必填</Badge></td>
                          <td className="p-3">EARLY（早子時換日）、LATE（晚子時不換日）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>longitude</code></td>
                          <td className="p-3">number</td>
                          <td className="p-3"><Badge variant="outline" className="text-xs">選填</Badge></td>
                          <td className="p-3">出生地經度（東經為正），用於太陽時計算</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">請求範例</h4>
                  <CodeBlock code={`{
  "year": 1990,
  "month": 5,
  "day": 15,
  "hour": 14,
  "minute": 30,
  "tzOffsetMinutesEast": 480,
  "longitude": 121.47,
  "solarTimeMode": "TST",
  "ziMode": "EARLY"
}`} id="v1-calculate-request" />
                </div>
                <div>
                  <h4 className="font-medium mb-3">回應範例</h4>
                  <CodeBlock code={`{
  "success": true,
  "data": {
    "pillars": {
      "year": { "stem": "庚", "branch": "午" },
      "month": { "stem": "辛", "branch": "巳" },
      "day": { "stem": "甲", "branch": "子" },
      "hour": { "stem": "辛", "branch": "未" }
    },
    "hiddenStems": { ... },
    "nayin": { "year": "路旁土", "month": "白蠟金", "day": "海中金", "hour": "路旁土" },
    "wuxing": { "wood": 1.6, "fire": 2.4, "earth": 1.8, "metal": 3.2, "water": 1.0 },
    "yinyang": { "yang": 50, "yin": 50 },
    "meta": {
      "birthUtc": "1990-05-15T06:30:00.000Z",
      "solarAdjustedTime": "14:36:00",
      "dayDelta": 0,
      "solarMode": "TST",
      "ziMode": "EARLY"
    }
  },
  "version": "3.0.0"
}`} id="v1-calculate-response" />
                </div>
              </CardContent>
            </Card>

            {/* V1 Analyze API */}
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-green-500">POST</Badge>
                  <CardTitle className="font-mono">/v1-bazi-analyze</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/30">SKU 2</Badge>
                  <Badge variant="outline" className="text-xs">v3.0</Badge>
                </div>
                <CardDescription>進階八字分析 API - 包含十神、神煞、性格分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📌 請求參數與 <code>/v1-bazi-calculate</code> 相同，回應包含額外的分析欄位。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-3">額外回應欄位</h4>
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
                          <td className="p-3"><code>tenGods</code></td>
                          <td className="p-3">四柱十神分析（使用藏干本氣計算）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>shensha</code></td>
                          <td className="p-3">神煞列表（天乙貴人、文昌、桃花、驛馬等）</td>
                        </tr>
                        <tr className="border-t">
                          <td className="p-3"><code>personality</code></td>
                          <td className="p-3">性格特質分析（基於日元五行與十神組合）</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">回應範例（額外欄位）</h4>
                  <CodeBlock code={`{
  "tenGods": {
    "year": { "stem": "偏財", "branch": "傷官" },
    "month": { "stem": "正財", "branch": "食神" },
    "day": { "stem": "日元", "branch": "正印" },
    "hour": { "stem": "正財", "branch": "正官" }
  },
  "shensha": [
    { "name": "天乙貴人", "category": "吉神", "pillar": "hour", "description": "逢凶化吉" }
  ],
  "personality": [
    { "trait": "仁慈", "strength": 80, "description": "富有同情心，善良正直" }
  ]
}`} id="v1-analyze-extra" />
                </div>
              </CardContent>
            </Card>

            {/* Legacy API */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500">POST</Badge>
                  <CardTitle>/bazi-api</CardTitle>
                  <Badge variant="outline" className="text-xs">Legacy</Badge>
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
                          <td className="p-3">性別（male/female 或 男/女）</td>
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
                          <td className="p-3">神煞詳細資訊（名稱、位置、類型、說明）</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEW: Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  模板使用指南
                </CardTitle>
                <CardDescription>
                  學習如何將八字 API 數據整合到您的自訂提示模板中
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold mb-2">🎯 核心概念</h4>
                  <p className="text-sm text-muted-foreground">
                    八字 API 提供<strong>原始的專業測算數據</strong>，您可以設計自己的「提示模板」，
                    將這些數據傳遞給 AI 模型（如 GPT-4、Claude、Gemini），生成各種風格的解讀內容。
                    這讓您能夠<strong>完全掌控</strong>最終呈現給用戶的解讀風格與內容深度。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">完整整合流程</h4>
                  <CodeBlock code={templateIntegrationExample} id="template-integration" language="javascript" />
                </div>
              </CardContent>
            </Card>

            {/* Variables Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Variable className="h-5 w-5" />
                  可用變數參考
                </CardTitle>
                <CardDescription>
                  所有可在模板中使用的 API 回應變數
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {variablesReference.map((section) => (
                    <div key={section.category}>
                      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <span>{section.icon}</span>
                        {section.category}
                      </h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-2">變數路徑</th>
                              <th className="text-left p-2">類型</th>
                              <th className="text-left p-2">說明</th>
                            </tr>
                          </thead>
                          <tbody>
                            {section.variables.map((v) => (
                              <tr key={v.name} className="border-t border-border/50">
                                <td className="p-2">
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    data.{v.name}
                                  </code>
                                </td>
                                <td className="p-2 text-muted-foreground text-xs">{v.type}</td>
                                <td className="p-2 text-sm">{v.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Template Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  模板風格範例
                </CardTitle>
                <CardDescription>
                  參考這些範例設計您自己的解讀風格
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="legion" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="legion">🏰 軍團敘事風格</TabsTrigger>
                    <TabsTrigger value="psychology">🧠 心理分析風格</TabsTrigger>
                  </TabsList>

                  <TabsContent value="legion">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        將傳統八字概念轉換為遊戲化的軍團敘事：日主化身「指揮官」，
                        地支成為「顧問」，神煞則是「裝備」。
                      </p>
                      <CodeBlock code={legionTemplateExample} id="legion-template" language="javascript" />
                    </div>
                  </TabsContent>

                  <TabsContent value="psychology">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        將五行能量轉換為心理學框架分析，結合 MBTI、大五人格等現代理論。
                      </p>
                      <CodeBlock code={psychologyTemplateExample} id="psychology-template" language="javascript" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader>
                <CardTitle>模板設計最佳實踐</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/20">
                    <h5 className="font-medium mb-2 text-green-600">✅ 推薦做法</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• 明確定義 AI 的角色與語調</li>
                      <li>• 結構化呈現八字數據（使用表格或列表）</li>
                      <li>• 指定期望的輸出格式與長度</li>
                      <li>• 加入具體的分析指引與範例</li>
                      <li>• 針對不同用戶群設計不同模板</li>
                    </ul>
                  </div>
                  <div className="p-4 border rounded-lg bg-red-500/5 border-red-500/20">
                    <h5 className="font-medium mb-2 text-red-600">⚠️ 避免事項</h5>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• 模板過於簡短缺乏指引</li>
                      <li>• 未說明期望的輸出風格</li>
                      <li>• 數據呈現雜亂無章</li>
                      <li>• 忽略用戶隱私考量</li>
                      <li>• 過度依賴 AI 自行發揮</li>
                    </ul>
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
                          <td className="p-3"><Badge variant="outline">403</Badge></td>
                          <td className="p-3">API Key 已停用或超出配額</td>
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
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/api-console">
                <Button size="lg">
                  <Zap className="h-4 w-4 mr-2" />
                  前往 API 控制台
                </Button>
              </Link>
              <Link to="/prompt-templates">
                <Button size="lg" variant="outline">
                  <Palette className="h-4 w-4 mr-2" />
                  瀏覽提示模板
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDocs;
