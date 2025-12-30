import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Trophy,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedMembership } from '@/hooks/useUnifiedMembership';
import { PageHeader } from '@/components/PageHeader';
import { AiTeacher } from '@/components/AiTeacher';
import { ConceptExplorer } from '@/components/ConceptExplorer';
import { useAcademyAchievements, RARITY_COLORS } from '@/hooks/useAcademyAchievements';
import { AchievementBadge } from '@/components/AchievementBadge';
import { AchievementUnlockToast } from '@/components/AchievementUnlockToast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CourseZone {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isFree: boolean;
  conceptCount: number;
}

const COURSE_ZONES: CourseZone[] = [
  {
    id: 'bazi',
    name: '命盤核心',
    subtitle: '四柱八字',
    icon: <Compass className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-400',
    description: '學習四柱八字的基本架構，了解天干地支與命盤的核心概念。',
    isFree: true,
    conceptCount: 4
  },
  {
    id: 'legion',
    name: '四時軍團',
    subtitle: '命運戰場',
    icon: <Swords className="w-6 h-6" />,
    color: 'from-red-500 to-rose-400',
    description: '探索年月日時四大軍團的角色與使命，理解命盤的動態互動。',
    isFree: true,
    conceptCount: 4
  },
  {
    id: 'tenGods',
    name: '十神殿堂',
    subtitle: '性格與關係',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-400',
    description: '深入學習十神體系，解讀性格特質與人際關係的奧秘。',
    isFree: false,
    conceptCount: 5
  },
  {
    id: 'shensha',
    name: '神煞迷宮',
    subtitle: '吉凶星曜',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-400',
    description: '探索各類吉神凶煞，掌握命運中的特殊星曜力量。',
    isFree: false,
    conceptCount: 4
  },
  {
    id: 'wuxing',
    name: '五行殿',
    subtitle: '金木水火土',
    icon: <Star className="w-6 h-6" />,
    color: 'from-emerald-500 to-teal-400',
    description: '理解五行相生相剋的法則，掌握命理分析的基礎框架。',
    isFree: false,
    conceptCount: 5
  },
  {
    id: 'nayin',
    name: '納音寶庫',
    subtitle: '六十甲子',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-orange-500 to-red-400',
    description: '學習六十甲子納音的象徵意義，探索更深層的命理意涵。',
    isFree: false,
    conceptCount: 3
  },
  {
    id: 'personality',
    name: '性格分析',
    subtitle: '內在探索',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-indigo-500 to-violet-400',
    description: '從命盤結構解讀天生性格特質，發掘優勢潛能與成長課題。',
    isFree: false,
    conceptCount: 2
  },
  {
    id: 'fortune',
    name: '運勢預測',
    subtitle: '流年大運',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-sky-500 to-blue-400',
    description: '學習大運與流年的運勢判斷方法，掌握趨吉避凶的智慧。',
    isFree: false,
    conceptCount: 2
  }
];

const BaziAcademy: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [userId, setUserId] = useState<string | undefined>();
  const [isAiTeacherOpen, setIsAiTeacherOpen] = useState(false);
  const [activeZone, setActiveZone] = useState<CourseZone | null>(null);
  const [achievementsDialogOpen, setAchievementsDialogOpen] = useState(false);
  const { hasAccess: isPremium } = useUnifiedMembership('bazi-premium');
  
  // 成就系統
  const {
    zoneCompletionStatus,
    completedZonesCount,
    totalViewedConcepts,
    unlockedAchievements,
    unlockedIds,
    newlyUnlocked,
    clearNewlyUnlocked,
    currentTitle,
    allAchievements,
    refreshViewed
  } = useAcademyAchievements();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleZoneClick = (zone: CourseZone) => {
    if (!zone.isFree && !isPremium) {
      navigate('/subscribe');
      return;
    }
    setActiveZone(zone);
  };

  const handleBackFromZone = () => {
    setActiveZone(null);
    refreshViewed(); // 返回時刷新進度
  };

  // 取得區域進度
  const getZoneProgress = (zoneId: string) => {
    const status = zoneCompletionStatus[zoneId];
    return status ? { viewed: status.viewed, total: status.total, completed: status.completed } : { viewed: 0, total: 0, completed: false };
  };

  // 如果正在瀏覽某個區域，顯示概念探索器
  if (activeZone) {
    return (
      <>
        <ConceptExplorer
          zoneId={activeZone.id}
          zoneName={activeZone.name}
          onBack={handleBackFromZone}
        />
        <AchievementUnlockToast
          achievement={newlyUnlocked}
          onClose={clearNewlyUnlocked}
        />
      </>
    );
  }

  const freeZones = COURSE_ZONES.filter(z => z.isFree);
  const premiumZones = COURSE_ZONES.filter(z => !z.isFree);

  return (
    <div className={`min-h-screen pb-20 ${
      theme === 'dark' ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* 頂部導航欄 */}
      <PageHeader title="八字學堂" />

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

          {/* 成就與進度區 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* 當前稱號 */}
            <div className={`px-4 py-2 rounded-full ${
              theme === 'dark' 
                ? 'bg-amber-500/20 border border-amber-500/30' 
                : 'bg-amber-100 border border-amber-300'
            }`}>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
              }`}>
                🏅 {currentTitle}
              </span>
            </div>

            {/* 成就按鈕 */}
            <Button
              variant="outline"
              onClick={() => setAchievementsDialogOpen(true)}
              className={`gap-2 ${
                theme === 'dark'
                  ? 'border-gold/30 text-gold hover:bg-gold/10'
                  : 'border-amber-300 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              成就 {unlockedAchievements.length}/{allAchievements.length}
            </Button>
          </motion.div>

          {/* 學習進度 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 max-w-xs mx-auto"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={theme === 'dark' ? 'text-paper/70' : 'text-void/70'}>
                總進度
              </span>
              <span className={theme === 'dark' ? 'text-gold' : 'text-amber-600'}>
                {totalViewedConcepts}/29 概念 · {completedZonesCount}/8 區域
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${
              theme === 'dark' ? 'bg-muted' : 'bg-gray-200'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((totalViewedConcepts / 29) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-amber-400 to-yellow-400'
                }`}
              />
            </div>
          </motion.div>

          {/* AI 老師按鈕 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
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
            {freeZones.map((zone, index) => {
              const progress = getZoneProgress(zone.id);
              return (
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
                  } ${progress.completed ? 'ring-2 ring-green-500/50' : ''}`}
                >
                  {/* 完成標記 */}
                  {progress.completed && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${zone.color} flex items-center justify-center text-white shadow-md`}>
                      {zone.icon}
                    </div>
                    <div className="flex-1 pr-6">
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
                      <p className={`text-sm mb-2 ${
                        theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                      }`}>
                        {zone.description}
                      </p>
                      {/* 進度條 */}
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                          theme === 'dark' ? 'bg-muted' : 'bg-gray-200'
                        }`}>
                          <div 
                            className={`h-full rounded-full transition-all ${
                              progress.completed ? 'bg-green-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${(progress.viewed / progress.total) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs ${
                          progress.completed 
                            ? 'text-green-500' 
                            : theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                        }`}>
                          {progress.viewed}/{progress.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

          {!isPremium && (
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
            {premiumZones.map((zone, index) => {
              const progress = getZoneProgress(zone.id);
              return (
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
                  } ${!isPremium ? 'opacity-80' : ''} ${progress.completed ? 'ring-2 ring-green-500/50' : ''}`}
                >
                  {/* 鎖定或完成標記 */}
                  {!isPremium ? (
                    <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-void/80' : 'bg-gray-100'
                    }`}>
                      <Lock className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      }`} />
                    </div>
                  ) : progress.completed && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
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
                      <p className={`text-sm mb-2 ${
                        theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                      }`}>
                        {zone.description}
                      </p>
                      {/* 進度條 */}
                      {isPremium && (
                        <div className="flex items-center gap-2">
                          <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                            theme === 'dark' ? 'bg-muted' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-full rounded-full transition-all ${
                                progress.completed ? 'bg-green-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${(progress.viewed / progress.total) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs ${
                            progress.completed 
                              ? 'text-green-500' 
                              : theme === 'dark' ? 'text-paper/50' : 'text-void/50'
                          }`}>
                            {progress.viewed}/{progress.total}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
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

      {/* 成就對話框 */}
      <Dialog open={achievementsDialogOpen} onOpenChange={setAchievementsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              學習成就
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 當前稱號 */}
            <div className={`p-4 rounded-xl text-center ${
              theme === 'dark' ? 'bg-muted' : 'bg-amber-50'
            }`}>
              <p className="text-sm text-muted-foreground mb-1">當前稱號</p>
              <p className={`text-xl font-bold ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              }`}>
                🏅 {currentTitle}
              </p>
            </div>

            {/* 成就列表 */}
            <div className="space-y-3">
              {allAchievements.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={unlockedIds.includes(achievement.id)}
                  showDetails
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 成就解鎖提示 */}
      <AchievementUnlockToast
        achievement={newlyUnlocked}
        onClose={clearNewlyUnlocked}
      />
    </div>
  );
};

export default BaziAcademy;
