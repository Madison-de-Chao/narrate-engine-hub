import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Crown, ExternalLink, Loader2 } from "lucide-react";
import {
  CENTRAL_SITE_URL,
  redirectToCentralSubscribe,
} from "@/config/centralAuth";

/**
 * 訂閱/升級已交由主站處理。本頁僅提供一個跳轉入口。
 */
export default function Subscribe() {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // 自動跳轉
    const t = setTimeout(() => {
      setRedirecting(true);
      redirectToCentralSubscribe();
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-lg p-8 text-center bg-card/80 backdrop-blur-sm border-primary/20">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 px-4 py-2 rounded-full border border-amber-500/30 mb-4">
          <Crown className="h-5 w-5" />
          <span className="font-medium">升級 / 訂閱</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          訂閱由主站統一管理
        </h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          為提供跨產品一致的會員權益，所有訂閱與付款流程已整合至中央會員系統。
          完成購買後，本站會員權限會自動同步。
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => {
              setRedirecting(true);
              redirectToCentralSubscribe();
            }}
            disabled={redirecting}
            size="lg"
            className="w-full"
          >
            {redirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在前往主站…
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                前往主站查看方案
              </>
            )}
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6 font-mono break-all">
          {CENTRAL_SITE_URL}
        </p>
      </Card>
    </div>
  );
}