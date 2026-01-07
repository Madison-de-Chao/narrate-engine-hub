import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown, Sparkles, Building2, Zap, Star, Shield, ArrowRight, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMembershipLabel } from "@/hooks/useUnifiedMembership";
import type { MembershipSource, MembershipTier } from "@/lib/unified-member-sdk";

interface PremiumGateProps {
  isPremium: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
  onUpgrade?: () => void;
  /** 會員來源：central = 中央會員, local = 本地會員 */
  membershipSource?: MembershipSource;
  /** 本地會員等級 */
  tier?: MembershipTier;
}

// 閃爍的星星粒子動畫
const SparkleParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 1
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
  >
    <Star className="w-3 h-3 text-amber-400/60" fill="currentColor" />
  </motion.div>
);

export const PremiumGate = ({
  isPremium,
  children,
  title = "進階分析",
  description = "升級至收費版解鎖完整分析內容",
  onUpgrade,
  membershipSource = 'none',
  tier = 'free'
}: PremiumGateProps) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isPremium) {
    return (
      <div className="relative">
        {/* 會員標記 */}
        {membershipSource !== 'none' && (
          <div className="absolute top-2 right-2 z-10">
            <MembershipIndicator source={membershipSource} tier={tier} />
          </div>
        )}
        {children}
      </div>
    );
  }

  const features = [
    { icon: Crown, text: "完整軍團故事" },
    { icon: Shield, text: "十神深度分析" },
    { icon: Sparkles, text: "神煞統計解讀" },
    { icon: Zap, text: "性格深度剖析" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className="relative overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-stone-900/95 to-stone-950/95 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 動態邊框光暈 */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: isHovered 
              ? "inset 0 0 60px rgba(245,158,11,0.2), 0 0 40px rgba(245,158,11,0.15)"
              : "inset 0 0 30px rgba(245,158,11,0.1), 0 0 20px rgba(245,158,11,0.1)"
          }}
          transition={{ duration: 0.3 }}
        />

        {/* 浮動星星粒子 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <SparkleParticle key={i} delay={i * 0.4} />
          ))}
        </div>

        {/* 模糊遮罩預覽 */}
        <div className="absolute inset-0 z-0">
          <div className="blur-md opacity-20 pointer-events-none scale-95 grayscale">
            {children}
          </div>
          {/* 漸變遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/90 to-stone-950/95" />
        </div>
        
        {/* 鎖定覆蓋層 */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[320px] p-8">
          <div className="text-center space-y-6 max-w-lg">
            
            {/* 動態鎖定圖標 */}
            <motion.div 
              className="relative inline-block"
              animate={{ 
                y: isHovered ? -5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* 外圈光暈動畫 */}
              <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)",
                }}
              />
              
              {/* 中圈脈衝 */}
              <motion.div 
                className="absolute -inset-4 rounded-full bg-amber-500/20"
                animate={{
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* 主圖標 */}
              <motion.div 
                className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-5 rounded-full shadow-lg shadow-amber-500/40"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <AnimatePresence mode="wait">
                  {isHovered ? (
                    <motion.div
                      key="unlock"
                      initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Unlock className="h-10 w-10 text-stone-900" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lock"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Lock className="h-10 w-10 text-stone-900" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
            
            {/* 標題區 */}
            <motion.div 
              className="space-y-3"
              animate={{ y: isHovered ? -3 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                🔒 {title}
              </h3>
              <p className="text-amber-100/80 text-sm leading-relaxed">
                {description}
              </p>
            </motion.div>
            
            {/* 功能列表 - 動態顯示 */}
            <motion.div 
              className="grid grid-cols-2 gap-2 text-sm"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all cursor-default"
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  whileHover={{ scale: 1.02, x: 3 }}
                >
                  <feature.icon className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-200/90">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* 升級按鈕 - 強調動畫 */}
            <motion.div
              animate={{ y: isHovered ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onUpgrade}
                  className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:via-amber-300 hover:to-amber-400 text-stone-900 font-bold px-10 py-6 text-lg shadow-xl shadow-amber-500/30 group"
                >
                  {/* 按鈕光澤動畫 */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <span className="relative flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    立即升級解鎖
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </span>
                </Button>
              </motion.div>
            </motion.div>
            
            {/* 底部提示 */}
            <motion.p 
              className="text-xs text-amber-200/50 flex items-center justify-center gap-2"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-3 w-3" />
              解鎖全部進階分析功能
              <Sparkles className="h-3 w-3" />
            </motion.p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// 會員來源指示器
export const MembershipIndicator = ({ 
  source, 
  tier = 'free',
  showLabel = true 
}: { 
  source: MembershipSource; 
  tier?: MembershipTier;
  showLabel?: boolean;
}) => {
  if (source === 'none') return null;

  const isCentral = source === 'central';
  const label = getMembershipLabel(source, tier);

  return (
    <Badge 
      variant="outline"
      className={`${
        isCentral 
          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30' 
          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
      } transition-colors`}
    >
      {isCentral ? (
        <Building2 className="h-3 w-3" />
      ) : (
        <Crown className="h-3 w-3" />
      )}
      {showLabel && <span className="ml-1">{label}</span>}
    </Badge>
  );
};

// 簡化版的故事預覽遮罩 - 增強版
export const StoryPreviewGate = ({
  isPremium,
  fullStory,
  previewStory,
  onUpgrade,
  membershipSource = 'none',
  tier = 'free'
}: {
  isPremium: boolean;
  fullStory: string;
  previewStory: string;
  onUpgrade?: () => void;
  membershipSource?: MembershipSource;
  tier?: MembershipTier;
}) => {
  if (isPremium) {
    return (
      <div className="relative">
        {membershipSource !== 'none' && (
          <div className="absolute top-0 right-0">
            <MembershipIndicator source={membershipSource} tier={tier} showLabel={false} />
          </div>
        )}
        <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{fullStory}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <p className="text-foreground/90 leading-relaxed">
        {previewStory}
      </p>
      <motion.div 
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 cursor-pointer group"
        onClick={onUpgrade}
        whileHover={{ scale: 1.02, x: 3 }}
        whileTap={{ scale: 0.98 }}
      >
        <Lock className="h-3.5 w-3.5 text-amber-400 group-hover:hidden" />
        <Unlock className="h-3.5 w-3.5 text-amber-300 hidden group-hover:block" />
        <span className="text-sm text-amber-300 font-medium">升級解鎖完整故事</span>
        <motion.span
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
        </motion.span>
      </motion.div>
    </div>
  );
};
