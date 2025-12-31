import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, UserRound, Mail, Phone, ShieldAlert } from "lucide-react";
import { useGuestMode } from "@/hooks/useGuestMode";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRateLimitedAuth } from "@/hooks/useRateLimitedAuth";

export default function Auth() {
  const navigate = useNavigate();
  const { enableGuestMode } = useGuestMode();
  const { signInWithFallback, signUpWithFallback, isLoading: authLoading } = useRateLimitedAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("phone");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  useEffect(() => {
    // 檢查是否已登入
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = authMethod === "email" ? email : phone;
    if (!identifier || !password) {
      toast.error("請填寫所有欄位");
      return;
    }

    setIsLoading(true);
    setRateLimitWarning(null);
    
    try {
      const credentials = authMethod === "email" 
        ? { email, password } 
        : { phone, password };
      
      const result = await signInWithFallback(credentials);

      if (!result.success) {
        // Check for rate limit warning
        if (result.error?.includes('頻繁') || result.rateLimitRemaining === 0) {
          setRateLimitWarning('登入嘗試次數已達上限，請15分鐘後再試');
        }
        toast.error(result.error || '登入失敗');
      } else {
        toast.success("登入成功！");
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error("登入失敗：" + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = authMethod === "email" ? email : phone;
    if (!identifier || !password || !confirmPassword) {
      toast.error("請填寫所有欄位");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("兩次輸入的密碼不一致");
      return;
    }

    if (password.length < 8) {
      toast.error("密碼至少需要8個字元");
      return;
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error("密碼必須包含大寫字母、小寫字母和數字");
      return;
    }

    if (authMethod === "phone" && !phone.match(/^\+?[1-9]\d{1,14}$/)) {
      toast.error("請輸入有效的手機號碼（含國碼，例如：+886912345678）");
      return;
    }

    setIsLoading(true);
    setRateLimitWarning(null);
    
    try {
      const credentials = authMethod === "email" 
        ? { email, password } 
        : { phone, password };
      
      const result = await signUpWithFallback(credentials);

      if (!result.success) {
        // Check for rate limit warning
        if (result.error?.includes('頻繁') || result.rateLimitRemaining === 0) {
          setRateLimitWarning('註冊嘗試次數已達上限，請1小時後再試');
        }
        toast.error(result.error || '註冊失敗');
      } else {
        toast.success("註冊成功！正在登入...");
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error("註冊失敗：" + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    enableGuestMode();
    toast.success("已切換到訪客模式");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border-primary/20 card-glow">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            虹靈御所八字人生兵法
          </h1>
          <p className="text-muted-foreground mt-2">登入或註冊開始你的命盤之旅</p>
        </div>

        {/* Rate limit warning banner */}
        {rateLimitWarning && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>{rateLimitWarning}</span>
          </div>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">登入</TabsTrigger>
            <TabsTrigger value="signup">註冊</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-3">
                <Label>登入方式</Label>
                <RadioGroup 
                  value={authMethod} 
                  onValueChange={(value) => setAuthMethod(value as "email" | "phone")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="signin-phone-option" />
                    <Label htmlFor="signin-phone-option" className="cursor-pointer flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      手機
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="signin-email-option" />
                    <Label htmlFor="signin-email-option" className="cursor-pointer flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {authMethod === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="signin-email">電子郵件</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="signin-phone">手機號碼</Label>
                  <Input
                    id="signin-phone"
                    type="tel"
                    placeholder="+886912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">請包含國碼，例如：+886</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signin-password">密碼</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登入中...
                  </>
                ) : (
                  "登入"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-3">
                <Label>註冊方式</Label>
                <RadioGroup 
                  value={authMethod} 
                  onValueChange={(value) => setAuthMethod(value as "email" | "phone")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="signup-phone-option" />
                    <Label htmlFor="signup-phone-option" className="cursor-pointer flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      手機
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="signup-email-option" />
                    <Label htmlFor="signup-email-option" className="cursor-pointer flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {authMethod === "email" ? (
                <div className="space-y-2">
                  <Label htmlFor="signup-email">電子郵件</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">手機號碼</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+886912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">請包含國碼，例如：+886</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-password">密碼</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="至少8個字元，含大小寫及數字"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">密碼須包含大寫、小寫字母及數字</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">確認密碼</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="再次輸入密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-input border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    註冊中...
                  </>
                ) : (
                  "註冊"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Guest Mode Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                或
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleGuestMode}
            className="w-full mt-4 border-dashed border-2"
          >
            <UserRound className="mr-2 h-4 w-4" />
            以訪客身份繼續
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            訪客模式下可體驗功能，但無法儲存計算歷史
          </p>
        </div>
      </Card>
    </div>
  );
}
