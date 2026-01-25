import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Sun, Moon, User, LogOut, Crown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationMapDropdown } from '@/components/NavigationMapDropdown';
import { SimplifiedLogo } from '@/components/icons/SimplifiedLogo';
import { MemberLoginWidget, useMember } from '@/lib/member';
import { useUnifiedMembership } from '@/hooks/useUnifiedMembership';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const { user, profile, signOut, loading } = useMember();
  const { hasAccess, loading: membershipLoading } = useUnifiedMembership('bazi-premium');
  const { toast } = useToast();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
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

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: '已登出',
      description: '期待您的再次造訪！',
    });
  };

  const handleToast = (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    toast(options);
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
              <button
                onClick={() => navigate('/')}
                className={`transition-colors ${
                  theme === 'dark' ? 'text-gold hover:text-gold/80' : 'text-ink hover:text-ink/80'
                }`}
                aria-label="返回首頁"
              >
                <SimplifiedLogo className="w-6 h-6" />
              </button>
              <span className={`text-xs tracking-wider ${
                theme === 'dark' ? 'text-paper/60' : 'text-void/60'
              }`}>
                虹靈御所八字導覽 · 專業可信任
              </span>
              <span className={`text-xs hidden sm:inline ${
                theme === 'dark' ? 'text-paper/40' : 'text-void/40'
              }`}>
                Immersive teaching · Guided cognition
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 會員登入按鈕與徽章 */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-2">
                    {/* Premium 會員徽章（統一顯示，不區分來源） */}
                    {!membershipLoading && hasAccess && (
                      <Badge className="hidden sm:flex bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`rounded-lg transition-colors ${
                            theme === 'dark' 
                              ? 'hover:bg-gold/10 text-paper/70 hover:text-paper' 
                              : 'hover:bg-ink/10 text-void/70 hover:text-void'
                          }`}
                        >
                          <User className="w-4 h-4 mr-1.5" />
                          <span className="text-xs hidden sm:inline">
                            {profile?.display_name || user.email?.split('@')[0] || '會員'}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/account')}>
                          <User className="w-4 h-4 mr-2" />
                          會員中心
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={handleSignOut}
                          className="text-destructive focus:text-destructive"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          登出
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowLoginDialog(true)}
                    variant="ghost"
                    size="sm"
                    className={`rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'hover:bg-gold/10 text-paper/70 hover:text-paper' 
                        : 'hover:bg-ink/10 text-void/70 hover:text-void'
                    }`}
                  >
                    <User className="w-4 h-4 mr-1.5" />
                    <span className="text-xs">登入</span>
                  </Button>
                )
              )}

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
              
              <NavigationMapDropdown />
            </div>
          </div>
        </header>
      )}

      {/* 主要內容區 */}
      <div className={`relative z-10 ${shouldShowRibbon ? 'pt-16' : ''}`}>
        {/* 返回按鈕 */}
        {shouldShowBackButton && !isHome && (
          <div className="absolute top-4 left-4 sm:left-6 z-40">
            <button
              onClick={handleBack}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300 ${
                theme === 'dark'
                  ? 'hover:bg-gold/10 text-paper/70 hover:text-paper'
                  : 'hover:bg-ink/10 text-void/70 hover:text-void'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-semibold hidden sm:inline">返回</span>
            </button>
          </div>
        )}

        {children}
        
        {/* 全站頁尾 */}
        {!isExcludedRoute && <Footer />}
      </div>

      {/* 登入彈窗 */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
          <MemberLoginWidget
            onClose={() => setShowLoginDialog(false)}
            onSuccess={() => setShowLoginDialog(false)}
            onToast={handleToast}
            showGoogleLogin={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
