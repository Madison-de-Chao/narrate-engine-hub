import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Check, Terminal, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CurlGeneratorProps {
  baseUrl: string;
}

type ApiEndpoint = "bazi-api" | "v1-bazi-calculate" | "v1-bazi-analyze";

interface FormData {
  endpoint: ApiEndpoint;
  apiKey: string;
  // Legacy API fields
  name: string;
  gender: "male" | "female";
  birthDate: string;
  birthTime: string;
  timezoneOffsetMinutes: number;
  // V1 API fields
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  tzOffsetMinutesEast: number;
  longitude: number;
  solarTimeMode: "TST" | "LMT" | "STD";
  ziMode: "EARLY" | "LATE";
}

const CurlGenerator = ({ baseUrl }: CurlGeneratorProps) => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    endpoint: "bazi-api",
    apiKey: "YOUR_API_KEY",
    // Legacy defaults
    name: "張三",
    gender: "male",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    timezoneOffsetMinutes: 480,
    // V1 defaults
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    tzOffsetMinutesEast: 480,
    longitude: 121.47,
    solarTimeMode: "TST",
    ziMode: "EARLY",
  });

  const isLegacyApi = formData.endpoint === "bazi-api";

  const generatedCurl = useMemo(() => {
    let payload: Record<string, unknown>;
    
    if (isLegacyApi) {
      payload = {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        timezoneOffsetMinutes: formData.timezoneOffsetMinutes,
      };
    } else {
      payload = {
        year: formData.year,
        month: formData.month,
        day: formData.day,
        hour: formData.hour,
        minute: formData.minute,
        tzOffsetMinutesEast: formData.tzOffsetMinutesEast,
        longitude: formData.longitude,
        solarTimeMode: formData.solarTimeMode,
        ziMode: formData.ziMode,
      };
    }

    const payloadStr = JSON.stringify(payload, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : "  " + line))
      .join("\n");

    return `curl -X POST "${baseUrl}/${formData.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${formData.apiKey}" \\
  -d '${payloadStr}'`;
  }, [formData, baseUrl, isLegacyApi]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCurl);
    setCopied(true);
    toast.success("cURL 命令已複製到剪貼板");
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFormData({
      endpoint: formData.endpoint,
      apiKey: "YOUR_API_KEY",
      name: "張三",
      gender: "male",
      birthDate: "1990-05-15",
      birthTime: "14:30",
      timezoneOffsetMinutes: 480,
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      tzOffsetMinutesEast: 480,
      longitude: 121.47,
      solarTimeMode: "TST",
      ziMode: "EARLY",
    });
    toast.success("表單已重置");
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          cURL 命令生成器
        </CardTitle>
        <CardDescription>
          填入參數後自動生成可複製的 cURL 命令，方便快速測試 API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Endpoint Selection */}
        <div className="space-y-2">
          <Label>API 端點</Label>
          <Select
            value={formData.endpoint}
            onValueChange={(v) => updateField("endpoint", v as ApiEndpoint)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bazi-api">Legacy - bazi-api</SelectItem>
              <SelectItem value="v1-bazi-calculate">V1 SKU1 - v1-bazi-calculate</SelectItem>
              <SelectItem value="v1-bazi-analyze">V1 SKU2 - v1-bazi-analyze</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <Label>API 金鑰</Label>
          <Input
            value={formData.apiKey}
            onChange={(e) => updateField("apiKey", e.target.value)}
            placeholder="輸入您的 API 金鑰"
          />
        </div>

        {/* Conditional Fields based on API type */}
        {isLegacyApi ? (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground">Legacy API 參數</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="張三"
                />
              </div>
              <div className="space-y-2">
                <Label>性別</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => updateField("gender", v as "male" | "female")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男 (male)</SelectItem>
                    <SelectItem value="female">女 (female)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>出生日期</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateField("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>出生時間</Label>
                <Input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => updateField("birthTime", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>時區偏移 (分鐘)</Label>
              <Input
                type="number"
                value={formData.timezoneOffsetMinutes}
                onChange={(e) => updateField("timezoneOffsetMinutes", parseInt(e.target.value) || 0)}
                placeholder="480 = UTC+8"
              />
              <p className="text-xs text-muted-foreground">例：480 = 東八區 (UTC+8)，540 = 東九區 (UTC+9)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm text-muted-foreground">V1 API 參數</h4>
            
            {/* Date fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>年</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => updateField("year", parseInt(e.target.value) || 1990)}
                  min={1900}
                  max={2100}
                />
              </div>
              <div className="space-y-2">
                <Label>月</Label>
                <Input
                  type="number"
                  value={formData.month}
                  onChange={(e) => updateField("month", parseInt(e.target.value) || 1)}
                  min={1}
                  max={12}
                />
              </div>
              <div className="space-y-2">
                <Label>日</Label>
                <Input
                  type="number"
                  value={formData.day}
                  onChange={(e) => updateField("day", parseInt(e.target.value) || 1)}
                  min={1}
                  max={31}
                />
              </div>
            </div>

            {/* Time fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>時</Label>
                <Input
                  type="number"
                  value={formData.hour}
                  onChange={(e) => updateField("hour", parseInt(e.target.value) || 0)}
                  min={0}
                  max={23}
                />
              </div>
              <div className="space-y-2">
                <Label>分</Label>
                <Input
                  type="number"
                  value={formData.minute}
                  onChange={(e) => updateField("minute", parseInt(e.target.value) || 0)}
                  min={0}
                  max={59}
                />
              </div>
            </div>

            {/* Timezone and Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>時區偏移 (分鐘)</Label>
                <Input
                  type="number"
                  value={formData.tzOffsetMinutesEast}
                  onChange={(e) => updateField("tzOffsetMinutesEast", parseInt(e.target.value) || 480)}
                />
                <p className="text-xs text-muted-foreground">480 = UTC+8</p>
              </div>
              <div className="space-y-2">
                <Label>經度</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.longitude}
                  onChange={(e) => updateField("longitude", parseFloat(e.target.value) || 121.47)}
                />
                <p className="text-xs text-muted-foreground">用於真太陽時計算</p>
              </div>
            </div>

            {/* Solar Time Mode and Zi Mode */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>太陽時模式</Label>
                <Select
                  value={formData.solarTimeMode}
                  onValueChange={(v) => updateField("solarTimeMode", v as "TST" | "LMT" | "STD")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TST">TST - 真太陽時</SelectItem>
                    <SelectItem value="LMT">LMT - 地方平均時</SelectItem>
                    <SelectItem value="STD">STD - 標準時區時</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>子時規則</Label>
                <Select
                  value={formData.ziMode}
                  onValueChange={(v) => updateField("ziMode", v as "EARLY" | "LATE")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EARLY">早子時換日</SelectItem>
                    <SelectItem value="LATE">晚子時換日</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Generated cURL Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>生成的 cURL 命令</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>
                <RefreshCw className="h-4 w-4 mr-1" />
                重置
              </Button>
              <Button size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    複製
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="relative">
            <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap break-all">
              {generatedCurl}
            </pre>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p><strong>提示：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>將生成的命令貼到終端機即可執行測試</li>
            <li>記得將 <code className="bg-muted px-1 rounded">YOUR_API_KEY</code> 替換為實際的 API 金鑰</li>
            <li>Windows 使用者可能需要將 <code className="bg-muted px-1 rounded">\</code> 換為 <code className="bg-muted px-1 rounded">^</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurlGenerator;
