import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

interface ReadingProgressBarProps {
  className?: string;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ className }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [percentage, setPercentage] = useState(0);
  
  // Dynamic gradient hue based on scroll progress
  const hue = useTransform(scrollYProgress, [0, 0.5, 1], [200, 280, 45]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 0.8, 0.8, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setPercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
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
      </motion.div>
    </div>
  );
};
