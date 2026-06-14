import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CENTRAL_AUTH_URL } from "@/config/centralAuth";
import { toast } from "sonner";

/**
 * 主站登入完成後 redirect 到此頁。
 * 預期格式：
 *   /auth/callback?return_to=/somewhere#access_token=...&refresh_token=...
 * 或主站直接交付 Supabase 標準的 hash session（implicit flow）。
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      try {
        // 1) 先看是否本來就有 session（避免重複處理）
        const { data: { session: existing } } = await supabase.auth.getSession();
        if (existing) {
          setStatus("ok");
          finishRedirect();
          return;
        }

        // 2) 解析 hash 內的 token
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const errorDescription = hashParams.get("error_description");

        if (errorDescription) {
          throw new Error(decodeURIComponent(errorDescription));
        }

        if (!accessToken || !refreshToken) {
          throw new Error(
            "未收到主站回傳的登入資訊。請確認主站已正確配置 SSO 回傳機制（access_token + refresh_token via URL fragment）。",
          );
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        // 3) 清掉 hash，避免 token 殘留在歷史紀錄
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );

        setStatus("ok");
        toast.success("登入成功");
        finishRedirect();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "登入失敗";
        setErrorMsg(msg);
        setStatus("error");
      }
    };

    const finishRedirect = () => {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("return_to") || "/";
      setTimeout(() => navigate(returnTo, { replace: true }), 500);
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border-primary/20 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">正在完成登入…</h2>
            <p className="text-sm text-muted-foreground">
              正在和主站驗證您的身份，請稍候。
            </p>
          </>
        )}
        {status === "ok" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">登入成功</h2>
            <p className="text-sm text-muted-foreground">即將返回原本頁面…</p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">登入未完成</h2>
            <p className="text-sm text-muted-foreground mb-4 break-all">
              {errorMsg}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  window.location.href = CENTRAL_AUTH_URL;
                }}
                variant="default"
              >
                重新前往主站
              </Button>
              <Button onClick={() => navigate("/")} variant="outline">
                返回首頁
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}