import { FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Home, Mail, LogOut } from "lucide-react";
import { useIdentity, isValidEmail } from "@/hooks/useIdentity";
import { redirectToCentralSubscribe, CENTRAL_SITE_URL } from "@/config/centralAuth";
import { toast } from "sonner";

/**
 * 身份識別頁
 * --------------------------------------------------------------
 * 本站不再做使用者驗證；只請使用者輸入「在主站使用的 email」，
 * 作為查詢中央 Premium 權限的依據。
 *
 * ⚠️ 此 email 不會驗證真偽；僅作為個人收藏紀錄識別。
 */
export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { email, setEmail, clearEmail } = useIdentity();
  const [input, setInput] = useState(email ?? "");
  const [submitting, setSubmitting] = useState(false);

  const returnTo = searchParams.get("return_to") || "/";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = input.trim().toLowerCase();
    if (!isValidEmail(value)) {
      toast.error("請輸入有效的 email");
      return;
    }
    setSubmitting(true);
    try {
      setEmail(value);
      toast.success(`已登入為 ${value}`);
      navigate(returnTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "設定失敗");
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    clearEmail();
    setInput("");
    toast.success("已清除身份");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--cosmic-nebula)/0.15),_transparent_50%)] pointer-events-none" />
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border-primary/20 cosmic-glow relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold cosmic-title-gradient">虹靈御所八字人生兵法</h1>
          <p className="text-muted-foreground mt-2">身份識別</p>
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-md border border-border/40 mb-6">
          <p className="mb-2">
            本站不做獨立登入。請輸入你在
            <a
              href={CENTRAL_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline mx-1"
            >
              主站
            </a>
            購買 / 註冊用的 email，
            系統會以此 email 向主站查詢你的 Premium 權限。
          </p>
          <p className="text-xs">⚠️ 此 email 不會驗證真偽，僅作為個人收藏紀錄識別。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identity-email">主站 Email</Label>
            <Input
              id="identity-email"
              type="email"
              placeholder="you@example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="email"
              required
              maxLength={255}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Mail className="mr-2 h-4 w-4" />
            {email && email === input.trim().toLowerCase() ? "進入" : "設定為此身份"}
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => redirectToCentralSubscribe()}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            前往主站訂閱 / 升級
          </Button>

          {email && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClear}
              className="w-full text-muted-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              清除身份（{email}）
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            回到首頁
          </Button>
        </div>
      </Card>
    </div>
  );
}