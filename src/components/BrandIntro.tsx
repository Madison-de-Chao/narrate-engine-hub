import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrandIntroProps {
  onComplete: () => void;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 檢查是否已經顯示過（使用 sessionStorage）
    const hasShown = sessionStorage.getItem('brandIntroShown');
    if (hasShown) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // 2秒後自動關閉
    const timer = setTimeout(() => {
      sessionStorage.setItem('brandIntroShown', 'true');
      setIsVisible(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleClick = () => {
    sessionStorage.setItem('brandIntroShown', 'true');
    setIsVisible(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
          className="fixed inset-0 z-[100] cursor-pointer overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #000000 0%, #0a1628 50%, #000814 100%)',
          }}
        >
          {/* 星空背景 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 使用 CSS 動畫創建星塵效果 */}
            <div className="stars"></div>
            <div className="stars2"></div>
            <div className="stars3"></div>
          </div>

          {/* 裝飾性邊框 - 左上 */}
          <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <path d="M0 20 L0 0 L20 0" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
              <path d="M0 10 L0 0 L10 0" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>
          
          {/* 裝飾性邊框 - 右上 */}
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <path d="M80 0 L100 0 L100 20" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
              <path d="M90 0 L100 0 L100 10" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>
          
          {/* 裝飾性邊框 - 左下 */}
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <path d="M0 80 L0 100 L20 100" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
              <path d="M0 90 L0 100 L10 100" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>
          
          {/* 裝飾性邊框 - 右下 */}
          <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <path d="M100 80 L100 100 L80 100" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
              <path d="M100 90 L100 100 L90 100" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
            </svg>
          </div>

          {/* 中央內容 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative px-4"
            >
              {/* 光環效果 */}
              <div className="absolute inset-0 -m-20 sm:-m-32">
                <div 
                  className="w-full h-full rounded-full blur-3xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%)'
                  }}
                ></div>
              </div>

              {/* 核心文字 */}
              <div className="relative text-center">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-8 sm:mb-12"
                  style={{
                    color: '#D4AF37',
                    textShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
                  }}
                >
                  看見・感受・療癒
                </motion.h1>

                {/* 四柱符號 */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex justify-center gap-6 sm:gap-12 mb-6 sm:mb-8"
                >
                  {[
                    { label: '年柱', icon: (
                      <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="12" stroke="#D4AF37" strokeWidth="1" fill="none" />
                        <circle cx="24" cy="24" r="6" fill="#D4AF37" opacity="0.3" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                          const rad = (angle * Math.PI) / 180;
                          const x1 = 24 + 12 * Math.cos(rad);
                          const y1 = 24 + 12 * Math.sin(rad);
                          const x2 = 24 + 16 * Math.cos(rad);
                          const y2 = 24 + 16 * Math.sin(rad);
                          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="0.5" />;
                        })}
                      </svg>
                    )},
                    { label: '月柱', icon: (
                      <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                        <path d="M24 8 C16 8 12 16 12 24 C12 32 16 40 24 40 C28 40 32 36 32 28 C32 20 28 16 24 16 C20 16 18 20 18 24 C18 28 20 32 24 32" 
                          stroke="#D4AF37" strokeWidth="1" fill="none" />
                        <circle cx="24" cy="24" r="2" fill="#D4AF37" opacity="0.5" />
                      </svg>
                    )},
                    { label: '日柱', icon: (
                      <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                        <polygon points="24,12 28,20 36,22 30,28 32,36 24,32 16,36 18,28 12,22 20,20" 
                          stroke="#D4AF37" strokeWidth="1" fill="none" />
                        <circle cx="24" cy="24" r="4" fill="#D4AF37" opacity="0.3" />
                      </svg>
                    )},
                    { label: '時柱', icon: (
                      <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="14" stroke="#D4AF37" strokeWidth="1" fill="none" />
                        <circle cx="24" cy="24" r="2" fill="#D4AF37" />
                        <line x1="24" y1="24" x2="24" y2="14" stroke="#D4AF37" strokeWidth="1.5" />
                        <line x1="24" y1="24" x2="30" y2="24" stroke="#D4AF37" strokeWidth="1" />
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                          const rad = (angle * Math.PI) / 180;
                          const x = 24 + 12 * Math.cos(rad);
                          const y = 24 + 12 * Math.sin(rad);
                          return <circle key={i} cx={x} cy={y} r="0.5" fill="#D4AF37" opacity="0.5" />;
                        })}
                      </svg>
                    )},
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="mb-2">{item.icon}</div>
                      <div className="text-xs sm:text-sm" style={{ color: '#D4AF37', opacity: 0.8 }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* 提示文字 */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="text-xs sm:text-sm"
                  style={{ color: '#F4E4C1', opacity: 0.6 }}
                >
                  點擊任意處開始
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
