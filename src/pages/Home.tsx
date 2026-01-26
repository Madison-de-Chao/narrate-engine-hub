import React, { useState, useCallback, useEffect } from 'react';
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
  Zap,
  Quote,
  Briefcase,
  Heart,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useMember, MemberLoginWidget } from '@/lib/member';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

// Import logos (only keeping main ones for hero)
import logoSishi from '@/assets/logo-sishi.png';
import logoMain from '@/assets/logo-honglingyusuo-new.png';

const Home = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, loading } = useMember();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  // Embla Carousel for testimonials on mobile
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleToast = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    toast(options);
  };

  // Testimonials data
  const testimonials = [
    {
      icon: Briefcase,
      category: '職涯規劃',
      name: 'Amy・產品經理',
      quote: '報告讓我看見自己傾向「統籌規劃」而非「第一線執行」，幫我釐清了轉職方向。不是說「你應該怎麼做」，而是讓我自己對照後做出選擇。',
      badge: '自我驗證後轉職成功',
      gradient: 'from-emerald-500 to-teal-500',
      quoteColor: 'text-emerald-400/40',
      quoteColorLight: 'text-emerald-500/40',
      badgeClass: 'bg-emerald-500/20 text-emerald-400',
      hoverBorderDark: 'hover:border-emerald-500/30',
      hoverBorderLight: 'hover:border-emerald-500/50'
    },
    {
      icon: Heart,
      category: '人際互動',
      name: 'Kevin・工程師',
      quote: '原來我習慣用「理性分析」回應情感需求，難怪總是雞同鴨講。報告把模式講得很具體，讓我知道可以從哪裡調整。',
      badge: '理解溝通盲點',
      gradient: 'from-rose-500 to-pink-500',
      quoteColor: 'text-rose-400/40',
      quoteColorLight: 'text-rose-500/40',
      badgeClass: 'bg-rose-500/20 text-rose-400',
      hoverBorderDark: 'hover:border-rose-500/30',
      hoverBorderLight: 'hover:border-rose-500/50'
    },
    {
      icon: TrendingUp,
      category: '個人成長',
      name: '小雯・自由工作者',
      quote: '喜歡報告裡的「可執行建議」，不是抽象的「多休息」，而是「每週安排一天不接案」這種具體做法。',
      badge: '落地可執行',
      gradient: 'from-violet-500 to-purple-500',
      quoteColor: 'text-violet-400/40',
      quoteColorLight: 'text-violet-500/40',
      badgeClass: 'bg-violet-500/20 text-violet-400',
      hoverBorderDark: 'hover:border-violet-500/30',
      hoverBorderLight: 'hover:border-violet-500/50'
    }
  ];

  const features = [
    {
      icon: Compass,
      title: '精準八字排盤',
      description: '運用天文演算法，精確計算四柱八字、十神、神煞，並清楚呈現計算依據。',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Users,
      title: '四時軍團敘事',
      description: '把抽象命理轉成可讀、可記、可對照的「軍團角色故事」，幫你更快理解命盤結構。',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: BookOpen,
      title: '八字學院',
      description: '系統化整理命理知識：從入門概念到進階應用，讓你能獨立判讀關鍵資訊。',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Shield,
      title: '專業可信任',
      description: '規則透明、邏輯可驗證；不恐嚇、不宿命、不操控——只提供你能自己檢驗的解讀框架。',
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

      {/* Hero Section - 優化手機版 */}
      <section className="relative pt-8 sm:pt-12 pb-12 sm:pb-20 px-4 sm:px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Logos Section - with hover effects */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 mb-8 sm:mb-10"
          >
            <motion.img 
              src={logoSishi} 
              alt="四時" 
              className="h-14 sm:h-18 md:h-24 w-auto object-contain cursor-pointer"
              whileHover={{ 
                scale: 1.08, 
                filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            />
            <motion.img 
              src={logoMain} 
              alt="虹靈御所" 
              className="h-12 sm:h-16 md:h-20 w-auto object-contain cursor-pointer"
              whileHover={{ 
                scale: 1.08, 
                filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))',
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
            />
          </motion.div>

          {/* Brand Badge */}
          <motion.div variants={itemVariants}>
            <Badge 
              className="mb-4 sm:mb-6 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
              RSBZS v3.0 · 八字人生兵法
            </Badge>
          </motion.div>

          {/* Main Title - 手機版字級縮小 */}
          <motion.h1 
            variants={itemVariants}
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 sm:mb-6 leading-tight ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}
          >
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              八字命盤
            </span>
            <br />
            <span className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${theme === 'dark' ? 'text-paper/90' : 'text-void/90'}`}>
              專業可信任的自我探索
            </span>
          </motion.h1>

          {/* Subtitle - 手機版單行顯示 */}
          <motion.p 
            variants={itemVariants}
            className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2 ${
              theme === 'dark' ? 'text-paper/70' : 'text-void/70'
            }`}
          >
            這份分析是一面鏡子，不是劇本——它提供視角與路徑；選擇權永遠在你手上。
            <span className="hidden sm:inline"><br />我們只做三件事：把資訊說清楚、把邏輯做扎實、把建議寫到你能執行。</span>
          </motion.p>

          {/* CTA Buttons - 手機版全寬 */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2"
          >
            <Button
              size="lg"
              onClick={() => navigate('/bazi')}
              className="
                relative overflow-hidden w-full sm:w-auto
                bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 
                text-void font-semibold
                shadow-[0_0_20px_rgba(251,191,36,0.4)]
                hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]
                transition-all duration-300
                px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg
              "
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 relative z-10" />
              <span className="relative z-10">立即解析八字</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 relative z-10" />
            </Button>

            {!loading && !user && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLoginDialog(true)}
                className={`
                  w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg
                  ${theme === 'dark' 
                    ? 'border-paper/30 text-paper hover:bg-paper/10' 
                    : 'border-void/30 text-void hover:bg-void/10'
                  }
                `}
              >
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                登入 / 註冊會員
              </Button>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - 手機版優化 */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className={`
                  h-full transition-all duration-300 
                  hover:scale-[1.02] sm:hover:scale-105 hover:shadow-lg
                  ${theme === 'dark' 
                    ? 'bg-slate-900/60 border-slate-700/50 hover:border-amber-500/30' 
                    : 'bg-white/80 border-slate-200 hover:border-amber-500/50'
                  }
                `}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex sm:block items-center gap-3 sm:gap-0">
                      <div className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl sm:mb-4 flex items-center justify-center shrink-0
                        bg-gradient-to-br ${feature.color}
                      `}>
                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 sm:flex-none">
                        <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${
                          theme === 'dark' ? 'text-paper' : 'text-void'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className={`text-xs sm:text-sm leading-relaxed ${
                          theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                        }`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Method Section - 手機版優化 */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Card className={`
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-amber-500/20' 
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
            }
          `}>
            <CardContent className="p-5 sm:p-8 md:p-10">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-4 sm:mb-6 text-amber-500" />
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif mb-4 sm:mb-6 text-center ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                信任與方法
              </h2>
              <div className={`space-y-4 sm:space-y-5 text-sm sm:text-base md:text-lg leading-relaxed ${
                theme === 'dark' ? 'text-paper/80' : 'text-void/80'
              }`}>
                <p className="text-center">
                  我們相信：命盤不是用來替你下結論，而是用來幫你看見模式。
                </p>
                <p className={`text-center text-xs sm:text-sm ${theme === 'dark' ? 'text-paper/60' : 'text-void/60'}`}>
                  你會在報告中看到：
                </p>
                <ul className="space-y-2 sm:space-y-3 max-w-xl mx-auto text-sm sm:text-base">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>你目前的能量配置與傾向（清楚）</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>哪些資訊屬於可驗證、哪些屬於推論（克制）</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>可落地的行動建議與提醒（可執行）</span>
                  </li>
                </ul>
                <p className={`text-xs sm:text-sm text-center pt-2 sm:pt-4 ${
                  theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                }`}>
                  （提醒：本服務為自我探索工具，不取代醫療、法律、財務等專業意見。）
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Testimonials / Use Cases Section */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif mb-3 sm:mb-4 ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              應用場景
            </h2>
            <p className={`text-sm sm:text-base max-w-xl mx-auto ${
              theme === 'dark' ? 'text-paper/60' : 'text-void/60'
            }`}>
              看看其他人如何運用八字分析，找到屬於自己的視角
            </p>
          </motion.div>

          {/* Mobile Carousel */}
          {isMobile ? (
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="flex-[0_0_85%] min-w-0 pl-4 first:pl-0">
                      <Card className={`
                        h-full transition-all duration-300
                        ${theme === 'dark' 
                          ? 'bg-slate-900/60 border-slate-700/50' 
                          : 'bg-white/80 border-slate-200'
                        }
                      `}>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center`}>
                              <testimonial.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                                {testimonial.category}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
                                {testimonial.name}
                              </p>
                            </div>
                          </div>
                          <Quote className={`w-6 h-6 mb-2 ${theme === 'dark' ? testimonial.quoteColor : testimonial.quoteColorLight}`} />
                          <p className={`text-sm leading-relaxed mb-4 ${
                            theme === 'dark' ? 'text-paper/80' : 'text-void/80'
                          }`}>
                            {testimonial.quote}
                          </p>
                          <Badge className={`${testimonial.badgeClass} border-0 text-xs`}>
                            {testimonial.badge}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={scrollPrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/80 text-paper/70 hover:bg-slate-700' 
                    : 'bg-white/80 text-void/70 hover:bg-white shadow-md'
                }`}
                aria-label="上一個"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-800/80 text-paper/70 hover:bg-slate-700' 
                    : 'bg-white/80 text-void/70 hover:bg-white shadow-md'
                }`}
                aria-label="下一個"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-4">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === selectedIndex
                        ? 'bg-amber-500 w-4'
                        : theme === 'dark' ? 'bg-paper/30' : 'bg-void/30'
                    }`}
                    aria-label={`跳至第 ${index + 1} 則`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Desktop Grid */
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className={`
                    h-full transition-all duration-300 hover:shadow-lg
                    ${theme === 'dark' 
                      ? `bg-slate-900/60 border-slate-700/50 ${testimonial.hoverBorderDark}` 
                      : `bg-white/80 border-slate-200 ${testimonial.hoverBorderLight}`
                    }
                  `}>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center`}>
                          <testimonial.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-paper' : 'text-void'}`}>
                            {testimonial.category}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-paper/50' : 'text-void/50'}`}>
                            {testimonial.name}
                          </p>
                        </div>
                      </div>
                      <Quote className={`w-6 h-6 mb-2 ${theme === 'dark' ? testimonial.quoteColor : testimonial.quoteColorLight}`} />
                      <p className={`text-sm leading-relaxed mb-4 ${
                        theme === 'dark' ? 'text-paper/80' : 'text-void/80'
                      }`}>
                        {testimonial.quote}
                      </p>
                      <Badge className={`${testimonial.badgeClass} border-0 text-xs`}>
                        {testimonial.badge}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Disclaimer for testimonials */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`text-center mt-6 sm:mt-8 text-xs ${
              theme === 'dark' ? 'text-paper/40' : 'text-void/40'
            }`}
          >
            * 以上為匿名使用者分享的應用心得，不代表特定結果保證
          </motion.p>
        </div>
      </section>

      {/* Brand Philosophy Section - 手機版優化 */}
      <section className="relative py-10 sm:py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Card className={`
            ${theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-amber-500/20' 
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
            }
          `}>
            <CardContent className="p-5 sm:p-8 md:p-10 text-center">
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif mb-4 sm:mb-6 ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                品牌核心理念
              </h2>
              <div className={`space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg leading-relaxed ${
                theme === 'dark' ? 'text-paper/80' : 'text-void/80'
              }`}>
                <p className="quote-classical text-base sm:text-lg md:text-xl px-2">
                  「這份分析是鏡子，不是劇本：提供視角與路徑，但選擇權永遠在你手上。」
                </p>
                <div className={`pt-3 sm:pt-4 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                }`}>
                  <Badge variant="outline" className="border-amber-500/40 text-xs">✓ 清楚</Badge>
                  <Badge variant="outline" className="border-amber-500/40 text-xs">✓ 克制</Badge>
                  <Badge variant="outline" className="border-amber-500/40 text-xs">✓ 有美感</Badge>
                  <Badge variant="outline" className="border-amber-500/40 text-xs">✓ 可執行</Badge>
                </div>
                <p className={`text-xs sm:text-sm pt-2 sm:pt-4 ${
                  theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                }`}>
                  不恐嚇、不宿命、不操控——用尊重與可驗證的方式，陪你理解自己。
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Final CTA Section - 手機版優化 */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold font-serif mb-4 sm:mb-6 ${
            theme === 'dark' ? 'text-paper' : 'text-void'
          }`}>
            準備好探索你的命盤了嗎？
          </h2>
          <p className={`text-sm sm:text-base mb-6 sm:mb-8 ${theme === 'dark' ? 'text-paper/60' : 'text-void/60'}`}>
            輸入出生資訊，即可生成一份清晰可讀的八字分析報告。
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/bazi')}
            className="
              relative overflow-hidden w-full sm:w-auto
              bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 
              text-void font-semibold
              shadow-[0_0_20px_rgba(251,191,36,0.4)]
              hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]
              transition-all duration-300
              px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg
            "
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 mr-2 relative z-10" />
            <span className="relative z-10">開始八字解析</span>
          </Button>
        </motion.div>
      </section>

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
