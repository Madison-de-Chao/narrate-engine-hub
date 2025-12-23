import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Package, 
  Sparkles, 
  History, 
  Server, 
  Database, 
  Cpu, 
  Shield,
  Zap,
  BookOpen,
  Swords,
  Calculator,
  FileJson,
  CheckCircle2,
  Clock,
  MapPin,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RSBZS_VERSION, ASSET_BUNDLE_MANIFEST } from "@/data/sku3-asset-bundle";

const VersionInfo = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calculator,
      title: "八字計算引擎",
      description: "精確的四柱八字計算，支援真太陽時校正與時區調整",
      badge: "Core"
    },
    {
      icon: Swords,
      title: "神煞規則引擎",
      description: "傳統版 (20+) 與軍團版 (34+) 雙規則集支援",
      badge: "SKU 3"
    },
    {
      icon: Sparkles,
      title: "AI 軍團故事生成",
      description: "四時軍團個性化敘事，結合命盤數據標籤",
      badge: "AI"
    },
    {
      icon: BookOpen,
      title: "八字學院",
      description: "互動式學習課程，從基礎到進階",
      badge: "Premium"
    },
    {
      icon: Server,
      title: "API v1 端點",
      description: "/v1/bazi/calculate 與 /v1/bazi/analyze 標準化接口",
      badge: "SKU 1-2"
    },
    {
      icon: FileJson,
      title: "資產包系統",
      description: "模組化 JSON 數據包，支援獨立授權",
      badge: "SKU 3"
    },
    {
      icon: Shield,
      title: "安全驗證",
      description: "輸入驗證服務與邊界檢查機制",
      badge: "Security"
    },
    {
      icon: Database,
      title: "節氣數據庫",
      description: "1850-2100 年完整節氣資料，香港天文台校正",
      badge: "Data"
    }
  ];

  const changelog = [
    {
      version: "3.0.0",
      date: "2024-12",
      type: "major",
      changes: [
        "新增 tzOffsetMinutesEast 與 dayDelta 邏輯",
        "完成 applySolarTime 含 EoT 公式",
        "修正地支十神演算法（藏干本氣）",
        "建立 ValidationService 後端防呆",
        "新增 Golden Test Suite（節氣邊界、閏年、跨日）",
        "定義 /v1/bazi/calculate (SKU 1) API",
        "定義 /v1/bazi/analyze (SKU 2) API",
        "加入 X-Powered-By: RSBZS 標頭",
        "整理 JSON 資產包為 SKU 3",
        "更新品牌標識為 RSBZS v3.0"
      ]
    },
    {
      version: "2.5.0",
      date: "2024-11",
      type: "minor",
      changes: [
        "新增模組化神煞規則引擎",
        "支援傳統版與軍團版規則集切換",
        "新增四時軍團分析系統",
        "改善 PDF 報告生成",
        "新增分享圖片功能"
      ]
    },
    {
      version: "2.0.0",
      date: "2024-10",
      type: "major",
      changes: [
        "重構八字計算核心",
        "新增 AI 軍團故事生成",
        "導入真太陽時計算",
        "新增八字學院課程系統",
        "建立會員訂閱機制"
      ]
    }
  ];

  const skuInfo = [
    {
      sku: "SKU 1",
      name: "Calculate API",
      endpoint: "/v1/bazi/calculate",
      description: "基礎八字計算，回傳四柱、藏干、納音"
    },
    {
      sku: "SKU 2",
      name: "Analyze API",
      endpoint: "/v1/bazi/analyze",
      description: "進階分析，含十神、神煞、性格分析"
    },
    {
      sku: "SKU 3",
      name: "Asset Bundle",
      endpoint: "JSON 資產包",
      description: "完整數據檔案授權，含節氣、神煞、課程"
    }
  ];

  const technicalSpecs = [
    {
      icon: Sun,
      title: "真太陽時計算 (TST)",
      status: "passed",
      items: [
        { label: "LMT 偏移計算", detail: "(longitude - standardMeridian) × 240秒", file: "solarTime.ts:106" },
        { label: "均時差 (EoT)", detail: "標準天文公式 9.87sin(2B) - 7.53cos(B) - 1.5sin(B)", file: "solarTime.ts:21-37" },
        { label: "三模式支援", detail: "NONE / LMT / TST", file: "solarTime.ts:82-97" }
      ]
    },
    {
      icon: Clock,
      title: "跨日修正 (Day Delta)",
      status: "passed",
      items: [
        { label: "dayDelta 計算", detail: "Math.floor(adjustedTotalSeconds / 86400)", file: "solarTime.ts:131" },
        { label: "日柱調整", detail: "solarAdjustedDate + dayDelta", file: "engine.ts:333-334" },
        { label: "子時換日規則", detail: "早子時/晚子時模式", file: "engine.ts:338-347" }
      ]
    },
    {
      icon: Database,
      title: "節氣精度 (HKO)",
      status: "passed",
      items: [
        { label: "多資料源優先", detail: "PRECISE → HKO → COMPLETE", file: "solarTermsService.ts:197-216" },
        { label: "資料覆蓋", detail: "1850-2100 年完整資料", file: "complete_solar_terms_1850_2100.json" },
        { label: "時區轉換", detail: "UTC+8 正確處理", file: "solarTermsService.ts:104-132" }
      ]
    },
    {
      icon: MapPin,
      title: "地支十神修正",
      status: "passed",
      items: [
        { label: "本氣查詢", detail: "getMainHiddenStem() 函數", file: "tenGodsCalculator.ts:42-50" },
        { label: "地支十神", detail: "使用藏干本氣計算", file: "tenGodsCalculator.ts:120-131" },
        { label: "四柱十神", detail: "calculateFourPillarsTenGods()", file: "tenGodsCalculator.ts:161-189" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {RSBZS_VERSION.displayName}
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                {RSBZS_VERSION.codename}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              紅鸞八字計算系統 · 版本資訊與更新日誌
            </p>
          </div>
        </motion.div>

        {/* Version Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold font-mono text-foreground">
                        v{RSBZS_VERSION.full}
                      </span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Latest
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {RSBZS_VERSION.copyright}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="font-mono">
                    <Cpu className="h-3 w-3 mr-1" />
                    Build: {ASSET_BUNDLE_MANIFEST.buildDate}
                  </Badge>
                  <Badge variant="secondary" className="font-mono">
                    <Zap className="h-3 w-3 mr-1" />
                    {ASSET_BUNDLE_MANIFEST.sku}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SKU Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            產品 SKU
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {skuInfo.map((item, index) => (
              <Card key={item.sku} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.sku}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded block mb-2 truncate">
                    {item.endpoint}
                  </code>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            功能清單
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground text-sm">
                            {feature.title}
                          </h3>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {feature.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technical Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            技術規格驗證
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">
              4/4 通過
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            根據 RSBZS v3.0 白皮書規格進行技術符合度驗證
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {technicalSpecs.map((spec, index) => (
              <motion.div
                key={spec.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
              >
                <Card className="h-full border-green-500/20 bg-green-500/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-green-500/20">
                          <spec.icon className="h-4 w-4 text-green-400" />
                        </div>
                        <CardTitle className="text-sm">{spec.title}</CardTitle>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {spec.items.map((item, i) => (
                        <li key={i} className="text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-foreground font-medium">{item.label}</span>
                            <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 shrink-0">
                              ✓
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-0.5">{item.detail}</p>
                          <code className="text-[10px] text-primary/70">{item.file}</code>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Changelog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            更新日誌
          </h2>
          <div className="space-y-4">
            {changelog.map((release, index) => (
              <Card key={release.version} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold font-mono text-foreground">
                        v{release.version}
                      </span>
                      <Badge 
                        variant={release.type === 'major' ? 'default' : 'secondary'}
                        className={release.type === 'major' ? 'bg-primary' : ''}
                      >
                        {release.type === 'major' ? '重大更新' : '功能更新'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{release.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {release.changes.map((change, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Separator className="mb-6" />
          <p className="text-sm text-muted-foreground">
            {RSBZS_VERSION.copyright} · Powered by RSBZS Engine
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Response Header: X-Powered-By: RSBZS
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default VersionInfo;
