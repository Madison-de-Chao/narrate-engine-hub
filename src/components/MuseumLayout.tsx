import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Map, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

interface MuseumLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  showRibbon?: boolean;
}

// 不顯示博物館導覽條的路由
const EXCLUDED_ROUTES = ['/admin', '/auth'];

export const MuseumLayout: React.FC<MuseumLayoutProps> = ({ 
  children, 
  showBackButton = true,
  showRibbon = true 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const isHome = location.pathname === '/';
  const isExcludedRoute = EXCLUDED_ROUTES.some(route => location.pathname.startsWith(route));
  
  // 在排除的路由中不顯示博物館 UI
  const shouldShowRibbon = showRibbon && !isExcludedRoute;
  const shouldShowBackButton = showBackButton && !isExcludedRoute;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-void text-paper' 
        : 'bg-paper text-void'
    }`}>
      {/* 背景紋理 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5 mix-blend-multiply z-0" 
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 result=%27noise%27/%3E%3C/filter%3E%3Crect width=%27400%27 height=%27400%27 filter=%27url(%23noiseFilter)%27/%3E%3C/svg%3E")'
        }}
      />

      {/* 頂部導覽條 */}
      {shouldShowRibbon && (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-void/90 backdrop-blur-sm border-b border-gold/30' 
            : 'bg-paper/90 backdrop-blur-sm border-b border-ink/20'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-xs tracking-wider ${
                theme === 'dark' ? 'text-paper/60' : 'text-void/60'
              }`}>
                科博館等級官方導覽 · 專業可信任
              </span>
              <span className={`text-xs hidden sm:inline ${
                theme === 'dark' ? 'text-paper/40' : 'text-void/40'
              }`}>
                Immersive teaching · Guided cognition
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 主題切換按鈕 */}
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className={`rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gold/10 text-paper/70 hover:text-paper' 
                    : 'hover:bg-ink/10 text-void/70 hover:text-void'
                }`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              
              <span className={`text-xs hidden sm:inline ${
                theme === 'dark' ? 'text-paper/60' : 'text-void/60'
              }`}>
                LIVE 導覽模式
              </span>
              
              <Button
                onClick={() => navigate('/')}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors duration-300 shadow-md flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-void hover:from-amber-300 hover:to-amber-200'
                    : 'bg-gradient-to-r from-ink to-slate-800 text-paper hover:from-slate-800 hover:to-slate-700'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">立即體驗</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* 主要內容區 */}
      <div className={`relative z-10 ${shouldShowRibbon ? 'pt-16' : ''}`}>
        {/* 返回按鈕 */}
        {shouldShowBackButton && !isHome && (
          <button
            onClick={handleBack}
            className={`fixed top-20 left-4 sm:left-6 z-40 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300 ${
              theme === 'dark'
                ? 'hover:bg-gold/10 text-paper/70 hover:text-paper'
                : 'hover:bg-ink/10 text-void/70 hover:text-void'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">返回</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
};
