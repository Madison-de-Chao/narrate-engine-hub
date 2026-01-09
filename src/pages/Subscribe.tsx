import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Crown, Check, ArrowLeft, Loader2, Sparkles, RefreshCw, Zap } from "lucide-react";
import { usePremiumStatus, PLAN_NAMES } from "@/hooks/usePremiumStatus";
import { useStoryRegeneration } from "@/hooks/useStoryRegeneration";
import type { User } from "@supabase/supabase-js";

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: '月訂閱',
    price: 'NT$ 99',
    period: '/月',
    description: '適合想體驗完整功能的用戶',
    features: [
      '完整軍團故事解鎖',
      '十神深度分析',
      '神煞統計與解讀',
      '性格深度剖析',
      '納音五行詳解',
      '五行陰陽圖表',
      '優先客服支援'
    ],
    popular: true
  },
  {
    id: 'yearly',
    name: '年訂閱',
    price: 'NT$ 799',
    period: '/年',
    originalPrice: 'NT$ 1,188',
    discount: '省 33%',
    description: '最划算的選擇，年省近400元',
    features: [
      '包含月訂閱所有功能',
      '專屬年度運勢報告',
      '優先體驗新功能',
      'VIP 專屬客服'
    ],
    popular: false
  }
];

// 故事重生資格套餐
const REGENERATION_PACKS = [
  {
    id: 'regen_1',
    name: '單次重生',
    credits: 1,
    price: 'NT$ 29',
    description: '重新生成一次軍團故事',
    popular: false
  },
  {
    id: 'regen_3',
    name: '三次重生',
    credits: 3,
    price: 'NT$ 69',
    originalPrice: 'NT$ 87',
    discount: '省 21%',
    description: '最熱門選擇',
    popular: true
  },
  {
    id: 'regen_10',
    name: '十次重生',
    credits: 10,
    price: 'NT$ 199',
    originalPrice: 'NT$ 290',
    discount: '省 31%',
    description: '資深玩家首選',
    popular: false
  }
];

export default function Subscribe() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { isPremium, tier, loading: premiumLoading } = usePremiumStatus(user?.id);
  const { creditsRemaining, isLoading: creditsLoading, refreshCredits } = useStoryRegeneration(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("請先登入");
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("請先登入");
      navigate("/auth");
      return;
    }

    setIsLoading(planId);

    try {
      // 這裡未來會串接統一金流 API
      // 目前先顯示提示訊息
      toast.info("金流串接開發中，敬請期待！\n\n請聯繫客服手動開通訂閱。", {
        duration: 5000
      });
      
      // 暫時：可以手動在後台開通訂閱
      // 未來會改成真正的金流串接
      
    } catch (error) {
      console.error("訂閱失敗:", error);
      toast.error("訂閱過程發生錯誤，請稍後再試");
    } finally {
      setIsLoading(null);
    }
  };

  const handlePurchaseCredits = async (packId: string, credits: number) => {
    if (!user) {
      toast.error("請先登入");
      navigate("/auth");
      return;
    }

    setIsLoading(packId);

    try {
      // 這裡未來會串接統一金流 API
      toast.info(`重生資格購買開發中，敬請期待！\n\n購買 ${credits} 次重生資格`, {
        duration: 5000
      });
      
    } catch (error) {
      console.error("購買失敗:", error);
      toast.error("購買過程發生錯誤，請稍後再試");
    } finally {
      setIsLoading(null);
    }
  };

  if (premiumLoading || creditsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* 返回按鈕 */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首頁
        </Button>

        {/* 標題區 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 px-4 py-2 rounded-full border border-amber-500/30 mb-4">
            <Crown className="h-5 w-5" />
            <span className="font-medium">升級會員</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
            解鎖完整命盤分析
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            升級會員即可解鎖所有進階分析功能，深入了解你的八字命盤，掌握人生方向
          </p>
        </div>

        {/* 已訂閱提示 */}
        {isPremium && (
          <Card className="mb-8 border-green-500/50 bg-green-500/10">
            <CardContent className="py-6 flex items-center justify-center gap-3">
              <Check className="h-6 w-6 text-green-500" />
              <span className="text-lg">
                您已是 <span className="font-bold text-green-400">{PLAN_NAMES[tier]}</span> 會員，享有完整功能
              </span>
            </CardContent>
          </Card>
        )}

        {/* 訂閱方案 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                plan.popular 
                  ? 'border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)]' 
                  : 'border-border/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    最熱門
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className={plan.popular ? "text-primary" : "text-muted-foreground"} />
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 價格 */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground line-through">{plan.originalPrice}</span>
                      <Badge variant="secondary" className="text-green-400 bg-green-500/20">
                        {plan.discount}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading !== null || (isPremium && tier === plan.id)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' 
                      : ''
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isLoading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      處理中...
                    </>
                  ) : isPremium && tier === plan.id ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      目前方案
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      立即訂閱
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 故事重生資格區 */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-amber-300 px-4 py-2 rounded-full border border-amber-500/30 mb-4">
              <RefreshCw className="h-5 w-5" />
              <span className="font-medium">故事重生資格</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">重新生成軍團故事</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              軍團故事生成後即鎖定。購買重生資格可重新生成專屬故事（舊版本不保留）
            </p>
            {creditsRemaining > 0 && (
              <Badge variant="secondary" className="mt-3 gap-1 text-base px-4 py-1">
                <Zap className="h-4 w-4" />
                目前剩餘: {creditsRemaining} 次重生資格
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {REGENERATION_PACKS.map((pack) => (
              <Card 
                key={pack.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  pack.popular 
                    ? 'border-amber-500/50 shadow-[0_0_15px_hsl(38,92%,50%,0.15)]' 
                    : 'border-border/50'
                }`}
              >
                {pack.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-amber-500 text-amber-950">
                      <Sparkles className="h-3 w-3 mr-1" />
                      推薦
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <RefreshCw className={pack.popular ? "text-amber-500" : "text-muted-foreground"} />
                    {pack.name}
                  </CardTitle>
                  <CardDescription>{pack.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{pack.price}</span>
                    </div>
                    {pack.originalPrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground line-through">{pack.originalPrice}</span>
                        <Badge variant="secondary" className="text-green-400 bg-green-500/20">
                          {pack.discount}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>可重新生成 {pack.credits} 次軍團故事</span>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    onClick={() => handlePurchaseCredits(pack.id, pack.credits)}
                    disabled={isLoading !== null}
                    className={`w-full ${
                      pack.popular 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-amber-950' 
                        : ''
                    }`}
                    variant={pack.popular ? "default" : "outline"}
                  >
                    {isLoading === pack.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        處理中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        購買
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">常見問題</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <Card className="p-4">
              <h3 className="font-medium mb-2">如何付款？</h3>
              <p className="text-sm text-muted-foreground">
                我們支援統一金流，可使用信用卡、超商付款等多種方式。
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">可以取消訂閱嗎？</h3>
              <p className="text-sm text-muted-foreground">
                可以隨時取消，取消後仍可使用至訂閱期滿。
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">故事重生資格是什麼？</h3>
              <p className="text-sm text-muted-foreground">
                軍團故事生成後會鎖定。若想重新生成，需使用重生資格，舊版本不會保留。
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">重生資格會過期嗎？</h3>
              <p className="text-sm text-muted-foreground">
                不會！購買的重生資格永久有效，可隨時使用。
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
