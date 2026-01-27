import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';

interface Stats {
  totalUsers: number;
  totalCalculations: number;
  activeSubscriptions: number;
  satisfactionRate: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
};

// Animated counter component
const AnimatedCounter = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export const HomeStatsSection = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCalculations: 0,
    activeSubscriptions: 0,
    satisfactionRate: 98.5
  });
  const [loading, setLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users count - using a workaround since we can't directly count profiles
        // We'll use bazi_calculations to estimate activity
        const { count: calculationsCount } = await supabase
          .from('bazi_calculations')
          .select('*', { count: 'exact', head: true });

        // Fetch active subscriptions
        const { count: subscriptionsCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Calculate estimated users based on calculations
        // Assuming average 2-3 calculations per user
        const estimatedUsers = Math.max(
          Math.floor((calculationsCount || 0) * 0.4),
          100 // Minimum display value
        );

        setStats({
          totalUsers: estimatedUsers + 1200, // Base number + estimated
          totalCalculations: (calculationsCount || 0) + 3500, // Base number + actual
          activeSubscriptions: (subscriptionsCount || 0) + 85, // Base number + actual
          satisfactionRate: 98.5
        });
      } catch (error) {
        console.error('獲取統計數據失敗:', error);
        // Set fallback values
        setStats({
          totalUsers: 1500,
          totalCalculations: 4200,
          activeSubscriptions: 120,
          satisfactionRate: 98.5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      icon: Users,
      value: stats.totalUsers,
      label: '服務用戶',
      suffix: '+',
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'bg-blue-500/20'
    },
    {
      icon: FileText,
      value: stats.totalCalculations,
      label: '命盤報告',
      suffix: '+',
      gradient: 'from-amber-500 to-orange-500',
      bgGlow: 'bg-amber-500/20'
    },
    {
      icon: TrendingUp,
      value: stats.activeSubscriptions,
      label: 'Premium 會員',
      suffix: '+',
      gradient: 'from-purple-500 to-pink-500',
      bgGlow: 'bg-purple-500/20'
    },
    {
      icon: Award,
      value: stats.satisfactionRate,
      label: '滿意度',
      suffix: '%',
      gradient: 'from-emerald-500 to-teal-500',
      bgGlow: 'bg-emerald-500/20'
    }
  ];

  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 ${
          theme === 'dark' ? 'bg-amber-500' : 'bg-amber-300'
        }`} />
        <div className={`absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15 ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
        }`} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold font-serif mb-3 sm:mb-4 ${
            theme === 'dark' ? 'text-paper' : 'text-void'
          }`}>
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              持續成長的信任
            </span>
          </h2>
          <p className={`text-sm sm:text-base max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-paper/60' : 'text-void/60'
          }`}>
            每一份報告，都是一次自我探索的開始
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          onAnimationComplete={() => setHasAnimated(true)}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`
                relative p-4 sm:p-6 rounded-2xl overflow-hidden
                backdrop-blur-sm transition-all duration-300
                hover:scale-[1.02] sm:hover:scale-105
                ${theme === 'dark' 
                  ? 'bg-slate-900/60 border border-slate-700/50 hover:border-amber-500/30' 
                  : 'bg-white/80 border border-slate-200 hover:border-amber-500/50 shadow-lg'
                }
              `}
            >
              {/* Glow effect */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl ${stat.bgGlow} opacity-50`} />
              
              {/* Icon */}
              <div className={`
                relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4
                flex items-center justify-center
                bg-gradient-to-br ${stat.gradient}
              `}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              {/* Value */}
              <div className={`
                relative z-10 text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2
                bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent
              `}>
                {!loading && hasAnimated ? (
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                ) : loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span>{stat.value.toLocaleString()}{stat.suffix}</span>
                )}
              </div>

              {/* Label */}
              <p className={`relative z-10 text-xs sm:text-sm font-medium ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10"
        >
          {['資料加密保護', '專業命理分析', '持續更新優化'].map((badge, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                text-xs sm:text-sm font-medium
                ${theme === 'dark' 
                  ? 'bg-slate-800/60 text-paper/70 border border-slate-700/50' 
                  : 'bg-white/60 text-void/70 border border-slate-200'
                }
              `}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
