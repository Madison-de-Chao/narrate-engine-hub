import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';

interface ReadingProgressBarProps {
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ className }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [percentage, setPercentage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasShownCelebration, setHasShownCelebration] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Dynamic gradient hue based on scroll progress
  const glowOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.8, 0.8, 1]);

  const generateParticles = useCallback(() => {
    const colors = [
      'hsl(45, 100%, 60%)',   // Gold
      'hsl(280, 80%, 65%)',   // Purple
      'hsl(200, 90%, 60%)',   // Blue
      'hsl(340, 80%, 60%)',   // Pink
      'hsl(160, 80%, 50%)',   // Teal
    ];
    
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      });
    }
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const newPercentage = Math.round(latest * 100);
      setPercentage(newPercentage);
      
      // Trigger celebration at 100%
      if (newPercentage >= 100 && !hasShownCelebration) {
        setShowCelebration(true);
        setHasShownCelebration(true);
        generateParticles();
        
        // Hide celebration after animation
        setTimeout(() => {
          setShowCelebration(false);
        }, 3000);
      }
      
      // Reset celebration flag if user scrolls back up
      if (newPercentage < 95) {
        setHasShownCelebration(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, hasShownCelebration, generateParticles]);

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
        {/* Background track */}
        <div className="h-1.5 bg-muted/20 backdrop-blur-md">
          {/* Animated glow layer */}
          <motion.div
            className="absolute inset-0 h-1.5 blur-md"
            style={{
              scaleX,
              originX: 0,
              background: `linear-gradient(90deg, 
                hsl(var(--primary)) 0%, 
                hsl(var(--accent)) 50%, 
                hsl(45 100% 60%) 100%)`,
              opacity: glowOpacity
            }}
          />
          
          {/* Main progress bar */}
          <motion.div
            className="relative h-full origin-left"
            style={{ 
              scaleX,
              background: `linear-gradient(90deg, 
                hsl(var(--primary)) 0%, 
                hsl(280 80% 65%) 35%,
                hsl(var(--accent)) 65%, 
                hsl(45 100% 55%) 100%)`
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
        </div>
        
        {/* Percentage indicator with glow */}
        <motion.div
          className="absolute top-2.5 right-3 flex items-center gap-1.5"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: percentage > 0 ? 1 : 0, y: percentage > 0 ? 0 : -5 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: percentage >= 100 
                ? 'hsl(45 100% 55%)' 
                : `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <span className={`text-xs font-semibold tracking-wider ${
            percentage >= 100 
              ? 'text-amber-400' 
              : 'text-foreground/70'
          }`}>
            {percentage}%
          </span>
          
          {/* Completion icon */}
          <AnimatePresence>
            {percentage >= 100 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                }}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  y: 50
                }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1.2, 1, 0.5],
                  y: [50, -100, -200, -300],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2.5,
                  delay: particle.delay,
                  ease: 'easeOut'
                }}
              >
                <Star 
                  className="fill-current" 
                  style={{ 
                    color: particle.color,
                    width: particle.size,
                    height: particle.size,
                    filter: `drop-shadow(0 0 ${particle.size / 2}px ${particle.color})`
                  }} 
                />
              </motion.div>
            ))}
            
            {/* Center celebration message */}
            <motion.div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
            >
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: 2,
                  ease: 'easeInOut'
                }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
                  🎉 閱讀完成！
                </div>
                <motion.div
                  className="mt-2 text-lg text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  恭喜你完成了這份報告的閱讀
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
