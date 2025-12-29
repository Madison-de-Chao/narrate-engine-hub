import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

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

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      setPercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      {/* Background */}
      <div className="h-1 bg-muted/30 backdrop-blur-sm">
        {/* Progress bar */}
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-primary/80 to-accent origin-left"
          style={{ scaleX }}
        />
      </div>
      
      {/* Percentage indicator */}
      <motion.div
        className="absolute top-1 right-2 text-xs font-medium text-muted-foreground/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: percentage > 0 ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {percentage}%
      </motion.div>
    </div>
  );
};
