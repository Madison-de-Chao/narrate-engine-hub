import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Sparkles, Crown } from "lucide-react";

interface LegionSummoningOverlayProps {
  isVisible: boolean;
  userName?: string;
}

export const LegionSummoningOverlay = ({ isVisible, userName = "您" }: LegionSummoningOverlayProps) => {
  const steps = [
    { icon: Swords, text: "正在召喚您的守護軍團...", delay: 0 },
    { icon: Shield, text: "編織命盤星象...", delay: 1.5 },
    { icon: Sparkles, text: "解析天干地支能量...", delay: 3 },
    { icon: Crown, text: "軍團整裝完畢！", delay: 4.5 }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md"
        >
          <div className="text-center space-y-8 p-8">
            {/* 主要動畫區域 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              {/* 外圈光環 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-40 h-40 mx-auto rounded-full border-2 border-primary/30"
                style={{
                  background: "conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.3), transparent)"
                }}
              />
              
              {/* 內圈光環 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 w-32 h-32 mx-auto rounded-full border border-accent/40"
              />
              
              {/* 中心圖標 */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 20px hsl(var(--primary) / 0.3)",
                    "0 0 40px hsl(var(--primary) / 0.5)",
                    "0 0 20px hsl(var(--primary) / 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative w-40 h-40 mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Swords className="w-16 h-16 text-primary" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* 文字動畫 */}
            <div className="space-y-4">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground"
              >
                {userName}的命盤正在生成
              </motion.h2>
              
              {/* 步驟提示 */}
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.delay, duration: 0.5 }}
                    className="flex items-center justify-center gap-2 text-muted-foreground"
                  >
                    <step.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm">{step.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 底部提示 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs text-muted-foreground/60 max-w-xs mx-auto"
            >
              八字不是宿命，而是靈魂的戰場。真正的選擇權在您手中。
            </motion.p>

            {/* 進度條 */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full max-w-xs mx-auto"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
