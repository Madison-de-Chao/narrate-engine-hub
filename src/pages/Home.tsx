import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants, type Easing } from 'framer-motion';
import { 
  Compass, 
  Sparkles, 
  BookOpen, 
  Users, 
  Shield, 
  ArrowRight,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useMember, MemberLoginWidget } from '@/lib/member';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, loading } = useMember();
  const { toast } = useToast();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleToast = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    toast(options);
  };

  const features = [
    {
      icon: Compass,
      title: '精準八字排盤',
      description: '運用天文演算法，精確計算四柱八字、十神、神煞',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Users,
      title: '四時軍團敘事',
      description: '將抽象命理轉化為生動的軍團角色故事，易懂易記',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: BookOpen,
      title: '八字學院',
      description: '系統化學習命理知識，從入門到進階一應俱全',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Shield,
      title: '專業可信任',
      description: '規則透明、邏輯可驗證，不恐嚇、不宿命、不操控',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const easeOut: Easing = [0.4, 0, 0.2, 1];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: easeOut }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 星空背景效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Brand Badge */}
          <motion.div variants={itemVariants}>
            <Badge 
              className="mb-6 px-4 py-1.5 text-sm bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              RSBZS v3.0 · 虹靈御所八字人生兵法
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold font-serif mb-6 leading-tight ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}
          >
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              八字命盤
            </span>
            <br />
            <span className={theme === 'dark' ? 'text-paper/90' : 'text-void/90'}>
              專業可信任的自我探索
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${
              theme === 'dark' ? 'text-paper/70' : 'text-void/70'
            }`}
          >
            這份分析是「鏡子」，不是「劇本」——提供視角與路徑，但選擇權永遠在你手上。
            <br className="hidden sm:block" />
            我們追求清楚、克制、有美感、可執行。
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/bazi')}
              className="
                relative overflow-hidden
                bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 
                text-void font-semibold
                shadow-[0_0_20px_rgba(251,191,36,0.4)]
                hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]
                transition-all duration-300
                px-8 py-6 text-lg
              "
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <Zap className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">立即解析八字</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
            </Button>

            {!loading && !user && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLoginDialog(true)}
                className={`
                  px-8 py-6 text-lg
                  ${theme === 'dark' 
                    ? 'border-paper/30 text-paper hover:bg-paper/10' 
                    : 'border-void/30 text-void hover:bg-void/10'
                  }
                `}
              >
                <Crown className="w-5 h-5 mr-2" />
                登入 / 註冊會員
              </Button>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`
                  h-full transition-all duration-300 
                  hover:scale-105 hover:shadow-lg
                  ${theme === 'dark' 
                    ? 'bg-slate-900/60 border-slate-700/50 hover:border-amber-500/30' 
                    : 'bg-white/80 border-slate-200 hover:border-amber-500/50'
                  }
                `}>
                  <CardContent className="p-6">
                    <div className={`
                      w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                      bg-gradient-to-br ${feature.color}
                    `}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      theme === 'dark' ? 'text-paper' : 'text-void'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                    }`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand Philosophy Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <Card className={`
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-amber-500/20' 
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
            }
          `}>
            <CardContent className="p-8 sm:p-10 text-center">
              <Star className="w-10 h-10 mx-auto mb-6 text-amber-500" />
              <h2 className={`text-2xl sm:text-3xl font-bold font-serif mb-6 ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                品牌核心理念
              </h2>
              <div className={`space-y-4 text-base sm:text-lg leading-relaxed ${
                theme === 'dark' ? 'text-paper/80' : 'text-void/80'
              }`}>
                <p className="quote-classical">
                  「這份分析是鏡子，不是劇本：提供視角與路徑，但選擇權永遠在你手上。」
                </p>
                <div className={`pt-4 flex flex-wrap justify-center gap-3 text-sm ${
                  theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                }`}>
                  <Badge variant="outline" className="border-amber-500/40">✓ 清楚</Badge>
                  <Badge variant="outline" className="border-amber-500/40">✓ 克制</Badge>
                  <Badge variant="outline" className="border-amber-500/40">✓ 有美感</Badge>
                  <Badge variant="outline" className="border-amber-500/40">✓ 可執行</Badge>
                </div>
                <p className={`text-sm pt-4 ${
                  theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                }`}>
                  不恐嚇、不宿命、不操控——以尊重與可驗證的方式，陪你理解自己。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className={`text-2xl sm:text-3xl font-bold font-serif mb-6 ${
            theme === 'dark' ? 'text-paper' : 'text-void'
          }`}>
            準備好探索你的命盤了嗎？
          </h2>
          <p className={`mb-8 ${theme === 'dark' ? 'text-paper/60' : 'text-void/60'}`}>
            輸入出生資訊，3 分鐘獲得清晰可讀的八字分析報告
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/bazi')}
            className="
              relative overflow-hidden
              bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 
              text-void font-semibold
              shadow-[0_0_20px_rgba(251,191,36,0.4)]
              hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]
              transition-all duration-300
              px-10 py-6 text-lg
            "
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <Compass className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10">開始八字解析</span>
          </Button>
        </motion.div>
      </section>

      {/* Login/Register Dialog */}
      {/* Login/Register Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
          <MemberLoginWidget
            onClose={() => setShowLoginDialog(false)}
            onSuccess={() => {
              setShowLoginDialog(false);
              toast({
                title: '登入成功！',
                description: '歡迎回到虹靈御所',
              });
            }}
            onToast={handleToast}
            showGoogleLogin={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
