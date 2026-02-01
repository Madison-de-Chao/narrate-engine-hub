import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Compass, 
  BookOpen, 
  Users, 
  Shield, 
  Zap,
  Layers,
  Heart,
  Eye,
  Target,
  Database,
  Code2,
  Palette,
  FileText,
  Crown,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';

// Import logo
import logoSishi from '@/assets/logo-sishi.png';
import logoHonglingNew from '@/assets/logo-honglingyusuo-new.png';

const About = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const coreValues = [
    {
      icon: Eye,
      title: '看清',
      subtitle: 'See Clearly',
      description: '把你的八字結構用清晰、可讀的方式呈現',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Heart,
      title: '感受',
      subtitle: 'Feel Deeply',
      description: '透過軍團敘事，讓抽象概念變得可記、可體會',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Target,
      title: '療癒',
      subtitle: 'Heal & Act',
      description: '提供可落地的行動建議，而非空泛的占卜結論',
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  const features = [
    {
      icon: Compass,
      title: '精準八字排盤',
      description: '涵蓋 1850-2100 年節氣資料庫，支援真太陽時校正，確保計算精確度'
    },
    {
      icon: Users,
      title: '四時軍團敘事',
      description: '獨創「指揮官 × 軍師 × 戰場」敘事框架，將十天干、十二地支、納音轉化為可記憶的角色故事'
    },
    {
      icon: Layers,
      title: '十神社會化詮釋',
      description: '不只是傳統術語解釋，更以「生活場景」呈現十神在人際、職涯、決策中的表現'
    },
    {
      icon: Shield,
      title: '結構化神煞分析',
      description: '規則邏輯透明、來源清楚；避免恐嚇式語言，若提風險必同時給防護建議'
    },
    {
      icon: BookOpen,
      title: '八字學院',
      description: '系統化教學內容，讓你從「看報告」進階到「能判讀」'
    },
    {
      icon: FileText,
      title: '專業 PDF 報告',
      description: '一鍵匯出 A4 格式報告，章節清楚、排版精美，可保存可列印'
    }
  ];

  const techStack = [
    { name: 'React 18 + TypeScript', category: '前端框架' },
    { name: 'Vite 5', category: '建置工具' },
    { name: 'shadcn/ui + Tailwind CSS', category: 'UI 元件' },
    { name: 'Framer Motion', category: '動畫引擎' },
    { name: 'TanStack Query', category: '資料管理' },
    { name: 'PostgreSQL + RLS', category: '資料庫' },
    { name: 'Edge Functions', category: '後端邏輯' }
  ];

  const brandPrinciples = [
    '這份分析是「鏡子」，不是「劇本」：提供視角與路徑，但選擇權永遠在你手上',
    '追求四件事：清楚、克制、有美感、可執行',
    '不恐嚇、不宿命、不操控：以尊重與可驗證的方式，陪你理解自己'
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-cosmic-void" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--cosmic-nebula)/0.2),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--cosmic-nebula2)/0.15),_transparent_60%)]" />
        <div className="cosmic-grid opacity-20" />
        
        {/* Animated Stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-gold/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="text-center mb-12 sm:mb-16">
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={logoSishi} 
                alt="四時" 
                className="h-24 sm:h-32 w-auto object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]"
              />
            </motion.div>

            <Badge className="mb-4 px-4 py-1.5 bg-gradient-to-r from-cosmic-gold/20 to-amber-500/20 border-cosmic-gold/40 text-cosmic-gold">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              RSBZS v3.0 · 八字人生兵法
            </Badge>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-4 cosmic-title-gradient">
              虹靈御所
            </h1>
            <p className="text-lg sm:text-xl text-cosmic-gold/80 font-medium mb-2">
              Hong Ling Yu Suo
            </p>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              一個讓你輸入出生資訊後，獲得「可讀、可理解、可落地」的八字分析頁面，
              <br className="hidden sm:block" />
              並可一鍵下載 PDF 保存的專業命理平台。
            </p>
          </motion.section>

          {/* Brand Core Values */}
          <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-center mb-8 text-foreground">
              核心理念
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="h-full bg-cosmic-deep/60 border-cosmic-gold/20 backdrop-blur-sm hover:border-cosmic-gold/40 transition-colors">
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center shadow-lg`}>
                        <value.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{value.title}</h3>
                      <p className="text-sm text-cosmic-gold/70 mb-3">{value.subtitle}</p>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Brand Principles */}
          <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
            <Card className="bg-gradient-to-br from-cosmic-deep/80 to-cosmic-void/60 border-cosmic-gold/30 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-cosmic-gold/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-cosmic-gold" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">品牌核心</h2>
                </div>
                <ul className="space-y-4">
                  {brandPrinciples.map((principle, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-cosmic-gold/20 flex items-center justify-center text-cosmic-gold text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-foreground/90 leading-relaxed">{principle}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.section>

          {/* Features Section */}
          <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-center mb-8 text-foreground">
              系統功能
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="h-full bg-cosmic-deep/50 border-border/50 hover:border-cosmic-gold/30 transition-colors backdrop-blur-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                          <feature.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Four Pillars Legion System */}
          <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
            <Card className="bg-gradient-to-br from-cosmic-deep/80 via-cosmic-void/60 to-cosmic-deep/80 border-cosmic-gold/30 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--cosmic-gold)/0.05),_transparent_70%)]" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">四時八字軍團兵法</h2>
                    <p className="text-sm text-cosmic-gold/70">獨創敘事系統</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="p-4 rounded-lg bg-cosmic-void/50 border border-cosmic-gold/20">
                    <h4 className="font-semibold text-cosmic-gold mb-2">🎖️ 指揮官 (天干)</h4>
                    <p className="text-sm text-muted-foreground">
                      甲木森林將軍、丙火烈日戰神、庚金天鍛騎士...
                      <br />每位指揮官代表你的核心能量與決策風格
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-cosmic-void/50 border border-cosmic-gold/20">
                    <h4 className="font-semibold text-cosmic-gold mb-2">🧭 軍師 (地支)</h4>
                    <p className="text-sm text-muted-foreground">
                      子水夜行刺客、卯木玉兔使者、午火日鬃騎兵...
                      <br />軍師揭示你的行動模式與時機感知
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-cosmic-void/50 border border-cosmic-gold/20">
                    <h4 className="font-semibold text-cosmic-gold mb-2">🌍 戰場 (納音)</h4>
                    <p className="text-sm text-muted-foreground">
                      海中金、爐中火、大林木...
                      <br />納音描繪你所處的環境氛圍與資源特質
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Tech Stack & Design System */}
          <motion.section variants={itemVariants} className="mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tech Stack */}
              <Card className="bg-cosmic-deep/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code2 className="w-5 h-5 text-primary" />
                    技術棧
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="bg-cosmic-surface/50 text-foreground/80 border-border/50"
                      >
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Design System */}
              <Card className="bg-cosmic-deep/50 border-border/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="w-5 h-5 text-cosmic-gold" />
                    設計系統
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    採用「宇宙建築師 Cosmic Architect」設計語言
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-cosmic-void border border-cosmic-gold/30" />
                      <span className="text-xs text-muted-foreground">cosmic-void</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-cosmic-deep border border-cosmic-gold/30" />
                      <span className="text-xs text-muted-foreground">cosmic-deep</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-r from-cosmic-gold to-amber-500" />
                      <span className="text-xs text-muted-foreground">cosmic-gold</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section variants={itemVariants} className="text-center">
            <Card className="bg-gradient-to-r from-cosmic-gold/10 via-amber-500/10 to-cosmic-gold/10 border-cosmic-gold/30 backdrop-blur-sm">
              <CardContent className="p-8 sm:p-10">
                <Zap className="w-10 h-10 mx-auto mb-4 text-cosmic-gold" />
                <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-4 text-foreground">
                  開始你的八字探索
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  輸入出生資訊，獲得專業、可讀、可落地的八字分析報告
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate('/bazi')}
                    className="bg-gradient-to-r from-primary via-cosmic-gold-bright to-accent text-primary-foreground font-semibold shadow-[var(--shadow-neon)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    立即解析八字
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/gallery')}
                    className="border-cosmic-gold/50 text-cosmic-gold hover:bg-cosmic-gold/10"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    瀏覽角色圖鑑
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Footer Note */}
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <Separator className="mb-6 bg-border/30" />
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logoHonglingNew} alt="虹靈御所" className="h-6 w-auto opacity-70" />
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              本內容屬於命理與自我探索的參考資訊，旨在提供觀點與行動建議，
              不構成且不取代任何醫療、心理、法律或投資等專業意見。
              若你正面臨重大決策，請諮詢合格專業人士。
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
