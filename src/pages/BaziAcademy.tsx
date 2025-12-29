import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Users, 
  Sparkles, 
  BookOpen, 
  Star, 
  Swords,
  Shield,
  TrendingUp,
  Crown,
  Lock,
  GraduationCap,
  MessageCircle,
  CheckCircle,
  ChevronRight,
  Home,
  LogOut
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedMembership } from '@/hooks/useUnifiedMembership';
import { MembershipBadge } from '@/components/EntitlementGuard';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { AiTeacher } from '@/components/AiTeacher';
import { InteractiveLearning } from '@/components/InteractiveLearning';

interface CourseZone {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isFree: boolean;
}

const COURSE_ZONES: CourseZone[] = [
  {
    id: 'bazi',
    name: '命盤核心',
    subtitle: '四柱八字',
    icon: <Compass className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-400',
    description: '學習四柱八字的基本架構，了解天干地支與命盤的核心概念。',
    isFree: true
  },
  {
    id: 'legion',
    name: '四時軍團',
    subtitle: '命運戰場',
    icon: <Swords className="w-6 h-6" />,
    color: 'from-red-500 to-rose-400',
    description: '探索年月日時四大軍團的角色與使命，理解命盤的動態互動。',
    isFree: true
  },
  {
    id: 'tenGods',
    name: '十神殿堂',
    subtitle: '性格與關係',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-400',
    description: '深入學習十神體系，解讀性格特質與人際關係的奧秘。',
    isFree: false
  },
  {
    id: 'shensha',
    name: '神煞迷宮',
    subtitle: '吉凶星曜',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-400',
    description: '探索各類吉神凶煞，掌握命運中的特殊星曜力量。',
    isFree: false
  },
  {
    id: 'wuxing',
    name: '五行殿',
    subtitle: '金木水火土',
    icon: <Star className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-400',
    description: '理解五行相生相剋的法則，掌握命理分析的基礎框架。',
    isFree: false
  },
  {
    id: 'nayin',
    name: '納音寶庫',
    subtitle: '六十甲子',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-orange-500 to-red-400',
    description: '學習六十甲子納音的象徵意義，探索更深層的命理意涵。',
    isFree: false
  },
  {
    id: 'personality',
    name: '性格分析',
    subtitle: '內在探索',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-indigo-500 to-violet-400',
    description: '從命盤結構解讀天生性格特質，發掘優勢潛能與成長課題。',
    isFree: false
  },
  {
    id: 'fortune',
    name: '運勢預測',
    subtitle: '流年大運',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-sky-500 to-blue-400',
    description: '學習大運與流年的運勢判斷方法，掌握趨吉避凶的智慧。',
    isFree: false
  }
];

const BaziAcademy: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [userId, setUserId] = useState<string | undefined>();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAiTeacherOpen, setIsAiTeacherOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState<{ zoneId: string; lessonId: string } | null>(null);
  const { hasAccess: isPremium, source: membershipSource, tier, loading } = useUnifiedMembership('bazi-premium');
  const { progress, getZoneProgress, completeLesson, getZoneLessons, isLessonCompleted } = useAcademyProgress();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleZoneClick = (zone: CourseZone) => {
    if (!zone.isFree && !isPremium) {
      navigate('/subscribe');
      return;
    }
    // 開始該區域的第一個未完成課程
    const lessons = getZoneLessons(zone.id);
    const firstIncomplete = lessons.find(l => !isLessonCompleted(zone.id, l)) || lessons[0];
    setActiveLesson({ zoneId: zone.id, lessonId: firstIncomplete });
  };

  const handleLessonComplete = (score: number) => {
    if (activeLesson) {
      completeLesson(activeLesson.zoneId, activeLesson.lessonId, score);
      // 自動進入下一課
      const lessons = getZoneLessons(activeLesson.zoneId);
      const currentIndex = lessons.indexOf(activeLesson.lessonId);
      if (currentIndex < lessons.length - 1) {
        setActiveLesson({ zoneId: activeLesson.zoneId, lessonId: lessons[currentIndex + 1] });
      } else {
        setActiveLesson(null);
      }
    }
  };

  // 如果正在學習課程，顯示互動學習組件
  if (activeLesson) {
    return (
      <InteractiveLearning
        zoneId={activeLesson.zoneId}
        lessonId={activeLesson.lessonId}
        lessonTitle={activeLesson.lessonId}
        onComplete={handleLessonComplete}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  const freeZones = COURSE_ZONES.filter(z => z.isFree);
  const premiumZones = COURSE_ZONES.filter(z => !z.isFree);

  return (
    <div className={`min-h-screen pb-20 ${
      theme === 'dark' ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* 頂部導航欄 */}
      <header className={`sticky top-0 z-50 backdrop-blur-sm border-b ${
        theme === 'dark' ? 'bg-background/95 border-border/50' : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              返回首頁
            </Button>
            
            <h1 className={`text-lg font-bold ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              八字學堂
            </h1>
            
            <div className="flex items-center gap-2">
              {user && !loading && (
                isPremium ? (
                  <MembershipBadge source={membershipSource} tier={tier} />
                ) : (
                  <Button
                    onClick={() => navigate('/subscribe')}
                    variant="outline"
                    size="sm"
                    className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                  >
                    <Crown className="mr-1 h-3 w-3" />
                    升級
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 頂部橫幅 */}
      <div className={`relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-void via-card to-background' 
          : 'bg-gradient-to-b from-amber-50 via-white to-gray-50'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20 ${
            theme === 'dark' ? 'bg-amber-500' : 'bg-amber-300'
          }`} />
        </div>

        <motion.div 
          className="relative z-10 text-center px-4 py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-amber-500 to-amber-700' 
              : 'bg-gradient-to-br from-amber-400 to-amber-600'
          } text-white shadow-lg`}>
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-paper' : 'text-void'
          }`}>
            八字學堂
          </h1>
          <p className={`text-lg mb-4 ${
            theme === 'dark' ? 'text-gold' : 'text-amber-600'
          }`}>
            系統化學習八字命理知識
          </p>
          <p className={`max-w-md mx-auto ${
            theme === 'dark' ? 'text-paper/70' : 'text-void/70'
          }`}>
            從基礎到進階，循序漸進掌握命理精髓
          </p>

          {/* AI 老師按鈕 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Button
              onClick={() => setIsAiTeacherOpen(true)}
              className={`gap-2 px-6 py-5 text-lg rounded-full shadow-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              向 AI 老師提問
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* 課程區域 */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        {/* 免費課程 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              免費課程
            </h2>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
              Free
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeZones.map((zone, index) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => handleZoneClick(zone)}
                className={`relative p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-card/80 border border-gold/20 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10' 
                    : 'bg-white shadow border border-transparent hover:border-amber-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${zone.color} flex items-center justify-center text-white shadow-md`}>
                    {zone.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-paper' : 'text-void'
                    }`}>
                      {zone.name}
                    </h3>
                    <p className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-gold' : 'text-amber-600'
                    }`}>
                      {zone.subtitle}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                    }`}>
                      {zone.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 付費課程 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              進階課程
            </h2>
            <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>

          {!isPremium && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded-xl mb-4 flex items-center justify-between ${
                theme === 'dark' 
                  ? 'bg-amber-500/10 border border-amber-500/30' 
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Crown className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={theme === 'dark' ? 'text-paper' : 'text-void'}>
                  訂閱解鎖全部進階課程
                </span>
              </div>
              <Button
                onClick={() => navigate('/subscribe')}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                立即訂閱
              </Button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumZones.map((zone, index) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => handleZoneClick(zone)}
                className={`relative p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-card/80 border border-gold/20 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10' 
                    : 'bg-white shadow border border-transparent hover:border-amber-300 hover:shadow-md'
                } ${!isPremium ? 'opacity-80' : ''}`}
              >
                {/* 鎖定標記 */}
                {!isPremium && (
                  <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-void/80' : 'bg-gray-100'
                  }`}>
                    <Lock className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    }`} />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${zone.color} flex items-center justify-center text-white shadow-md ${
                    !isPremium ? 'opacity-70' : ''
                  }`}>
                    {zone.icon}
                  </div>
                  <div className="flex-1 pr-8">
                    <h3 className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-paper' : 'text-void'
                    }`}>
                      {zone.name}
                    </h3>
                    <p className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-gold' : 'text-amber-600'
                    }`}>
                      {zone.subtitle}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                    }`}>
                      {zone.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 返回首頁 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className={theme === 'dark' ? 'text-paper/70 hover:text-paper' : 'text-void/70 hover:text-void'}
          >
            返回首頁
          </Button>
        </motion.div>
      </div>

      {/* AI 老師對話框 */}
      <AiTeacher 
        isOpen={isAiTeacherOpen} 
        onClose={() => setIsAiTeacherOpen(false)} 
      />
    </div>
  );
};

export default BaziAcademy;
