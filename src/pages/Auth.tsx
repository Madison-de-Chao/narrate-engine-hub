import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ExternalLink, UserRound, Home } from "lucide-react";
import { useGuestMode } from "@/hooks/useGuestMode";
import { redirectToCentralLogin, CENTRAL_SITE_URL } from "@/config/centralAuth";
import { toast } from "sonner";

/**
 * 本網站已棄用本地認證 UI。
 * 此頁面僅作為「跳轉主站登入」的中繼站；
 * 若使用者已登入則直接導向首頁，否則自動跳轉主站。
 */
export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enableGuestMode } = useGuestMode();
  const [redirecting, setRedirecting] = useState(false);

  const returnTo = searchParams.get("return_to") || "/";
  const autoRedirect = searchParams.get("auto") !== "0";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(returnTo, { replace: true });
      } else if (autoRedirect) {
        // 自動跳主站
        setRedirecting(true);
        setTimeout(() => redirectToCentralLogin(returnTo), 600);
      }
    });
  }, [navigate, returnTo, autoRedirect]);

  const handleGoCentral = () => {
    setRedirecting(true);
    redirectToCentralLogin(returnTo);
  };

  const handleGuest = () => {
    enableGuestMode();
    toast.success("已切換到訪客模式");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--cosmic-nebula)/0.15),_transparent_50%)] pointer-events-none" />
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border-primary/20 cosmic-glow relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold cosmic-title-gradient">
            虹靈御所八字人生兵法
          </h1>
          <p className="text-muted-foreground mt-2">
            登入由主站統一管理
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-md border border-border/40">
            <p className="mb-2">
              為提供跨產品一致的會員體驗，本站已整合至中央會員系統。
            </p>
            <p>
              點下方按鈕將前往主站登入；登入完成後會自動返回本站。
            </p>
          </div>

          <Button
            onClick={handleGoCentral}
            disabled={redirecting}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {redirecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在前往主站…
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                前往主站登入 / 註冊
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleGuest}
            className="w-full border-dashed border-2"
            disabled={redirecting}
          >
            <UserRound className="mr-2 h-4 w-4" />
            以訪客身份繼續
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full"
            disabled={redirecting}
          >
            <Home className="mr-2 h-4 w-4" />
            回到首頁
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-2">
            主站位置：
            <span className="font-mono break-all"> {CENTRAL_SITE_URL}</span>
          </p>
        </div>
      </Card>
    </div>
  );
}