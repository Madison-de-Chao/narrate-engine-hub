import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  Trophy, 
  Lightbulb,
  RefreshCw,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Flame,
  Star,
  Zap,
  Target,
  Brain,
  Shuffle,
  Timer
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LESSON_CONTENT as ACADEMY_LESSON_CONTENT, type QuizQuestion, type MatchPair, type FillBlank, type LessonContent } from '@/data/academyLessons';

interface InteractiveLearningProps {
  zoneId: string;
  lessonId: string;
  lessonTitle: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

// 成就類型
type Achievement = {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_correct', title: '初試啼聲', icon: <Star className="w-6 h-6" />, color: 'from-yellow-400 to-amber-500' },
  { id: 'streak_3', title: '三連勝', icon: <Flame className="w-6 h-6" />, color: 'from-orange-400 to-red-500' },
  { id: 'streak_5', title: '五連霸', icon: <Zap className="w-6 h-6" />, color: 'from-purple-400 to-pink-500' },
  { id: 'perfect', title: '完美無缺', icon: <Trophy className="w-6 h-6" />, color: 'from-green-400 to-emerald-500' },
  { id: 'speed_demon', title: '閃電快手', icon: <Timer className="w-6 h-6" />, color: 'from-blue-400 to-cyan-500' },
];

// 默認課程內容（當找不到對應課程時使用）

// 默認課程內容
const getDefaultContent = (zoneId: string, lessonId: string): LessonContent => ({
  id: `${zoneId}-${lessonId}`,
  title: lessonId,
  introduction: `歡迎學習「${lessonId}」課程。`,
  keyPoints: ['課程內容正在準備中', '請先完成其他課程', '更多內容即將推出'],
  quiz: [
    {
      id: 'default',
      question: '您準備好開始學習了嗎？',
      options: ['是的，我準備好了', '我再想想', '先看看其他課程', '需要更多時間'],
      correctIndex: 0,
      explanation: '太好了！讓我們開始學習吧。'
    }
  ]
});

// 配對遊戲組件
const MatchGame: React.FC<{
  pairs: MatchPair[];
  onComplete: (allCorrect: boolean) => void;
  theme: string;
}> = ({ pairs, onComplete, theme }) => {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<MatchPair[]>([]);

  useEffect(() => {
    setShuffledDefinitions([...pairs].sort(() => Math.random() - 0.5));
  }, [pairs]);

  const handleTermClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    setSelectedTerm(id);
    setWrongPair(null);
  };

  const handleDefinitionClick = (pair: MatchPair) => {
    if (!selectedTerm || matchedPairs.includes(pair.id)) return;
    
    if (selectedTerm === pair.id) {
      const newMatched = [...matchedPairs, pair.id];
      setMatchedPairs(newMatched);
      setSelectedTerm(null);
      
      if (newMatched.length === pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    } else {
      setWrongPair(pair.id);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedTerm(null);
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Shuffle className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-amber-600'}`} />
        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-foreground' : 'text-gray-900'}`}>
          配對遊戲
        </h3>
      </div>
      
      <p className={`text-center text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
        點擊左邊的詞彙，再點擊右邊對應的解釋
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* 詞彙列 */}
        <div className="space-y-2">
          {pairs.map((pair) => {
            const isMatched = matchedPairs.includes(pair.id);
            const isSelected = selectedTerm === pair.id;
            
            return (
              <motion.button
                key={pair.id}
                onClick={() => handleTermClick(pair.id)}
                disabled={isMatched}
                className={`w-full p-3 rounded-xl text-center font-medium transition-all ${
                  isMatched
                    ? 'bg-green-500/20 text-green-500 border-2 border-green-500'
                    : isSelected
                      ? theme === 'dark'
                        ? 'bg-primary/30 border-2 border-primary text-primary'
                        : 'bg-amber-100 border-2 border-amber-500 text-amber-700'
                      : theme === 'dark'
                        ? 'bg-card border-2 border-border hover:border-primary/50 text-foreground'
                        : 'bg-white border-2 border-gray-200 hover:border-amber-300 text-gray-800'
                }`}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                animate={isMatched ? { scale: [1, 1.1, 1] } : {}}
              >
                {pair.term}
                {isMatched && <CheckCircle className="inline-block ml-2 w-4 h-4" />}
              </motion.button>
            );
          })}
        </div>

        {/* 解釋列 */}
        <div className="space-y-2">
          {shuffledDefinitions.map((pair) => {
            const isMatched = matchedPairs.includes(pair.id);
            const isWrong = wrongPair === pair.id;
            
            return (
              <motion.button
                key={pair.id}
                onClick={() => handleDefinitionClick(pair)}
                disabled={isMatched || !selectedTerm}
                className={`w-full p-3 rounded-xl text-center text-sm transition-all ${
                  isMatched
                    ? 'bg-green-500/20 text-green-500 border-2 border-green-500'
                    : isWrong
                      ? 'bg-red-500/20 text-red-500 border-2 border-red-500'
                      : theme === 'dark'
                        ? 'bg-card border-2 border-border hover:border-primary/50 text-foreground'
                        : 'bg-white border-2 border-gray-200 hover:border-amber-300 text-gray-800'
                } ${!selectedTerm && !isMatched ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={!isMatched && selectedTerm ? { scale: 1.02 } : {}}
                whileTap={!isMatched && selectedTerm ? { scale: 0.98 } : {}}
                animate={
                  isWrong 
                    ? { x: [0, -10, 10, -10, 10, 0] } 
                    : isMatched 
                      ? { scale: [1, 1.1, 1] } 
                      : {}
                }
              >
                {pair.definition}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <Badge variant="outline" className="text-sm">
          已配對 {matchedPairs.length} / {pairs.length}
        </Badge>
      </div>
    </div>
  );
};

// 成就彈窗組件
const AchievementPopup: React.FC<{
  achievement: Achievement;
  onClose: () => void;
}> = ({ achievement, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
    >
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r ${achievement.color} text-white`}>
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          {achievement.icon}
        </motion.div>
        <div>
          <div className="text-xs opacity-80">🎉 成就解鎖!</div>
          <div className="font-bold">{achievement.title}</div>
        </div>
      </div>
    </motion.div>
  );
};

// 連續答對火焰效果
const StreakFire: React.FC<{ streak: number }> = ({ streak }) => {
  if (streak < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0]
        }}
        transition={{ repeat: Infinity, duration: 0.5 }}
      >
        <Flame className={`w-5 h-5 ${
          streak >= 5 ? 'text-purple-500' : streak >= 3 ? 'text-orange-500' : 'text-yellow-500'
        }`} />
      </motion.div>
      <span className={`font-bold ${
        streak >= 5 ? 'text-purple-500' : streak >= 3 ? 'text-orange-500' : 'text-yellow-500'
      }`}>
        {streak}連勝!
      </span>
    </motion.div>
  );
};

export const InteractiveLearning: React.FC<InteractiveLearningProps> = ({
  zoneId,
  lessonId,
  onComplete,
  onBack
}) => {
  const { theme } = useTheme();
  const [stage, setStage] = useState<'intro' | 'keypoints' | 'matchgame' | 'quiz' | 'result'>('intro');
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [streak, setStreak] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [startTime] = useState(Date.now());
  const [matchGameCompleted, setMatchGameCompleted] = useState(false);

  const content = ACADEMY_LESSON_CONTENT[zoneId]?.[lessonId] || getDefaultContent(zoneId, lessonId);
  const totalQuestions = content.quiz.length;
  const currentQuestion = content.quiz[currentQuestionIndex];
  const hasMatchGame = content.matchGame && content.matchGame.length > 0;

  // 解鎖成就
  const unlockAchievement = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement && !unlockedAchievements.find(a => a.id === achievementId)) {
      setUnlockedAchievements(prev => [...prev, achievement]);
      setShowAchievement(achievement);
    }
  };

  const handleNextPoint = () => {
    if (currentPointIndex < content.keyPoints.length - 1) {
      setCurrentPointIndex(prev => prev + 1);
    } else if (hasMatchGame && !matchGameCompleted) {
      setStage('matchgame');
    } else {
      setStage('quiz');
    }
  };

  const handleMatchGameComplete = () => {
    setMatchGameCompleted(true);
    unlockAchievement('first_correct');
    setStage('quiz');
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // 檢查成就
      if (correctAnswers === 0) unlockAchievement('first_correct');
      if (newStreak === 3) unlockAchievement('streak_3');
      if (newStreak === 5) unlockAchievement('streak_5');
    } else {
      setStreak(0);
    }
    setAnswers(prev => [...prev, isCorrect]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // 檢查完美成就
      if (correctAnswers === totalQuestions) {
        unlockAchievement('perfect');
      }
      // 檢查速度成就（30秒內完成）
      if (Date.now() - startTime < 30000) {
        unlockAchievement('speed_demon');
      }
      setStage('result');
    }
  };

  const handleComplete = () => {
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    onComplete(score);
  };

  const handleRetry = () => {
    setStage('intro');
    setCurrentPointIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrectAnswers(0);
    setAnswers([]);
    setStreak(0);
    setMatchGameCompleted(false);
  };

  const progressPercentage = stage === 'intro' ? 5 : 
    stage === 'keypoints' ? 10 + ((currentPointIndex + 1) / content.keyPoints.length) * 25 :
    stage === 'matchgame' ? 40 :
    stage === 'quiz' ? 45 + ((currentQuestionIndex + 1) / totalQuestions) * 45 : 100;

  return (
    <div className={`min-h-screen pb-20 ${
      theme === 'dark' ? 'bg-background' : 'bg-gray-50'
    }`}>
      {/* 成就彈窗 */}
      <AnimatePresence>
        {showAchievement && (
          <AchievementPopup 
            achievement={showAchievement} 
            onClose={() => setShowAchievement(null)} 
          />
        )}
      </AnimatePresence>

      {/* 頂部進度條 */}
      <div className={`sticky top-0 z-10 px-4 py-3 ${
        theme === 'dark' ? 'bg-card/95 backdrop-blur-sm border-b border-border' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div className="flex items-center gap-3">
            <StreakFire streak={streak} />
            <span className={`text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* 介紹階段 */}
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <motion.div 
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-primary to-amber-600' 
                      : 'bg-gradient-to-br from-amber-400 to-amber-600'
                  } text-white shadow-lg`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <BookOpen className="w-10 h-10" />
                </motion.div>
                <h1 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {content.title}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Badge variant="outline" className="gap-1">
                    <Brain className="w-3 h-3" />
                    {content.keyPoints.length} 知識點
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Target className="w-3 h-3" />
                    {totalQuestions} 題測驗
                  </Badge>
                  {hasMatchGame && (
                    <Badge variant="outline" className="gap-1">
                      <Shuffle className="w-3 h-3" />
                      配對遊戲
                    </Badge>
                  )}
                </div>
              </div>

              <motion.div 
                className={`p-6 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-card border border-border' 
                    : 'bg-white shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className={`text-lg leading-relaxed ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  {content.introduction}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => setStage('keypoints')}
                  className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  開始學習冒險
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* 知識點階段 */}
          {stage === 'keypoints' && (
            <motion.div
              key={`keypoint-${currentPointIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
                  知識點 {currentPointIndex + 1} / {content.keyPoints.length}
                </div>
                <div className="flex gap-1">
                  {content.keyPoints.map((_, idx) => (
                    <motion.div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx <= currentPointIndex
                          ? theme === 'dark' ? 'bg-primary' : 'bg-amber-500'
                          : theme === 'dark' ? 'bg-muted' : 'bg-gray-200'
                      }`}
                      animate={idx === currentPointIndex ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  ))}
                </div>
              </div>

              <motion.div 
                className={`p-8 rounded-2xl min-h-[200px] flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-card via-card to-primary/10 border border-border' 
                    : 'bg-gradient-to-br from-white via-white to-amber-50 shadow-lg'
                }`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div 
                    className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      theme === 'dark' ? 'bg-primary/20 text-primary' : 'bg-amber-100 text-amber-600'
                    }`}
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Lightbulb className="w-6 h-6" />
                  </motion.div>
                  <p className={`text-xl leading-relaxed ${
                    theme === 'dark' ? 'text-foreground' : 'text-gray-800'
                  }`}>
                    {content.keyPoints[currentPointIndex]}
                  </p>
                </div>
              </motion.div>

              <Button
                onClick={handleNextPoint}
                className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
              >
                {currentPointIndex < content.keyPoints.length - 1 
                  ? '下一個知識點' 
                  : hasMatchGame 
                    ? '開始配對遊戲' 
                    : '開始測驗挑戰'}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* 配對遊戲階段 */}
          {stage === 'matchgame' && content.matchGame && (
            <motion.div
              key="matchgame"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-card border border-border' 
                  : 'bg-white shadow-lg'
              }`}>
                <MatchGame 
                  pairs={content.matchGame}
                  onComplete={handleMatchGameComplete}
                  theme={theme}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setStage('quiz')}
                className="w-full"
              >
                跳過配對遊戲
              </Button>
            </motion.div>
          )}

          {/* 測驗階段 */}
          {stage === 'quiz' && currentQuestion && (
            <motion.div
              key={`quiz-${currentQuestionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'}`}>
                  題目 {currentQuestionIndex + 1} / {totalQuestions}
                </div>
                <StreakFire streak={streak} />
              </div>

              <motion.div 
                className={`p-6 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-card border border-border' 
                    : 'bg-white shadow-lg'
                }`}
                layout
              >
                <h2 className={`text-xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQuestion.correctIndex;
                    const showResult = showExplanation;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500 text-green-600 dark:text-green-400'
                              : isSelected
                                ? 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400'
                                : theme === 'dark'
                                  ? 'bg-muted/50 border-border text-muted-foreground'
                                  : 'bg-gray-100 border-gray-200 text-gray-400'
                            : isSelected
                              ? theme === 'dark'
                                ? 'bg-primary/20 border-primary'
                                : 'bg-amber-100 border-amber-400'
                              : theme === 'dark'
                                ? 'bg-muted/50 border-border hover:bg-muted hover:border-primary/50'
                                : 'bg-gray-50 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                        } border-2`}
                        whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                        animate={
                          showResult && isCorrect 
                            ? { scale: [1, 1.05, 1] }
                            : showResult && isSelected && !isCorrect
                              ? { x: [0, -5, 5, -5, 5, 0] }
                              : {}
                        }
                      >
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              showResult
                                ? isCorrect
                                  ? 'bg-green-500 text-white'
                                  : isSelected
                                    ? 'bg-red-500 text-white'
                                    : theme === 'dark' ? 'bg-muted text-muted-foreground' : 'bg-gray-200 text-gray-500'
                                : theme === 'dark' ? 'bg-muted text-foreground' : 'bg-gray-200 text-gray-700'
                            }`}
                            animate={showResult && isCorrect ? { rotate: [0, 360] } : {}}
                          >
                            {showResult && isCorrect ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : showResult && isSelected ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              String.fromCharCode(65 + index)
                            )}
                          </motion.div>
                          <span className={showResult && !isCorrect && !isSelected ? 'opacity-50' : ''}>
                            {option}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 解釋 */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-6 p-4 rounded-xl ${
                        theme === 'dark' 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'bg-amber-50 border border-amber-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${
                            theme === 'dark' ? 'text-primary' : 'text-amber-600'
                          }`} />
                        </motion.div>
                        <p className={theme === 'dark' ? 'text-foreground' : 'text-gray-700'}>
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handleNextQuestion}
                    className="w-full h-14 text-lg gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? '下一題' : '查看結果'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 結果階段 */}
          {stage === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${
                  correctAnswers === totalQuestions
                    ? 'bg-gradient-to-br from-green-400 to-emerald-600'
                    : correctAnswers >= totalQuestions / 2
                      ? 'bg-gradient-to-br from-primary to-amber-600'
                      : 'bg-gradient-to-br from-orange-400 to-red-500'
                } text-white shadow-2xl`}
              >
                <Trophy className="w-14 h-14" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-900'
                }`}>
                  {correctAnswers === totalQuestions 
                    ? '🎉 完美通關！' 
                    : correctAnswers >= totalQuestions / 2
                      ? '👏 表現優秀！'
                      : '💪 繼續加油！'}
                </h2>
                <p className={`text-xl ${
                  theme === 'dark' ? 'text-muted-foreground' : 'text-gray-600'
                }`}>
                  答對 {correctAnswers} / {totalQuestions} 題
                </p>
              </motion.div>

              {/* 成就展示 */}
              {unlockedAchievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-card border border-border' : 'bg-white shadow-lg'
                  }`}
                >
                  <h3 className={`text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-muted-foreground' : 'text-gray-500'
                  }`}>
                    🏆 獲得成就
                  </h3>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {unlockedAchievements.map((achievement) => (
                      <motion.div
                        key={achievement.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${achievement.color} text-white text-sm`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {achievement.icon}
                        {achievement.title}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div 
                className={`p-6 rounded-2xl ${
                  theme === 'dark' 
                    ? 'bg-card border border-border' 
                    : 'bg-white shadow-lg'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex justify-center gap-2 mb-4">
                  {answers.map((correct, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        correct 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </motion.div>
                  ))}
                </div>
                <p className={`text-lg ${
                  theme === 'dark' ? 'text-foreground' : 'text-gray-700'
                }`}>
                  得分：<span className="font-bold text-3xl text-primary">{Math.round((correctAnswers / totalQuestions) * 100)}</span> 分
                </p>
              </motion.div>

              <motion.div 
                className="flex gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 h-14 gap-2 rounded-xl"
                >
                  <RefreshCw className="w-5 h-5" />
                  重新挑戰
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 h-14 gap-2 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 rounded-xl shadow-lg"
                >
                  完成課程
                  <CheckCircle className="w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
