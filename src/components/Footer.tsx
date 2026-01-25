import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Mail, FileText, Shield, Map } from 'lucide-react';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`
      relative py-8 sm:py-12 px-4 sm:px-6 border-t
      ${theme === 'dark' 
        ? 'bg-slate-950/80 border-slate-800' 
        : 'bg-slate-50 border-slate-200'
      }
    `}>
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Content - 手機版改為 2x2 網格 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-3 sm:space-y-4">
            <h3 className={`text-base sm:text-lg font-bold font-serif ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              虹靈御所
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${
              theme === 'dark' ? 'text-paper/60' : 'text-void/60'
            }`}>
              RSBZS v3.0<br />
              八字人生兵法系統
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-paper/80' : 'text-void/80'
            }`}>
              快速連結
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link 
                  to="/bazi" 
                  className={`text-xs sm:text-sm transition-colors hover:text-amber-500 ${
                    theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                  }`}
                >
                  八字解析
                </Link>
              </li>
              <li>
                <Link 
                  to="/academy" 
                  className={`text-xs sm:text-sm transition-colors hover:text-amber-500 ${
                    theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                  }`}
                >
                  八字學院
                </Link>
              </li>
              <li>
                <Link 
                  to="/gallery" 
                  className={`text-xs sm:text-sm transition-colors hover:text-amber-500 ${
                    theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                  }`}
                >
                  角色圖鑑
                </Link>
              </li>
              <li>
                <Link 
                  to="/map" 
                  className={`text-xs sm:text-sm transition-colors hover:text-amber-500 inline-flex items-center gap-1 ${
                    theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                  }`}
                >
                  <Map className="w-3 h-3" />
                  導覽地圖
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-paper/80' : 'text-void/80'
            }`}>
              法律聲明
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link 
                  to="/privacy" 
                  className={`text-xs sm:text-sm transition-colors hover:text-amber-500 inline-flex items-center gap-1 ${
                    theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  隱私政策
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className={`text-xs sm:text-sm transition-colors hover:text-amber-500 inline-flex items-center gap-1 ${
                    theme === 'dark' ? 'text-paper/60' : 'text-void/60'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  使用條款
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className={`text-xs sm:text-sm font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-paper/80' : 'text-void/80'
            }`}>
              聯絡我們
            </h4>
            <a 
              href="mailto:contact@honglingyusuo.com"
              className={`text-xs sm:text-sm transition-colors hover:text-amber-500 inline-flex items-center gap-1.5 sm:gap-2 break-all ${
                theme === 'dark' ? 'text-paper/60' : 'text-void/60'
              }`}
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">contact@honglingyusuo.com</span>
              <span className="sm:hidden">聯絡信箱</span>
            </a>
          </div>
        </div>

        {/* Disclaimer - 手機版優化 */}
        <div className={`
          py-4 sm:py-6 px-3 sm:px-4 rounded-lg mb-6 sm:mb-8 text-center
          ${theme === 'dark' ? 'bg-slate-900/60' : 'bg-slate-100'}
        `}>
          <p className={`text-[10px] sm:text-xs leading-relaxed max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-paper/50' : 'text-void/50'
          }`}>
            本網站提供之八字命理分析屬於自我探索工具，旨在提供觀點與行動建議。
            <span className="hidden sm:inline">本內容不構成且不取代任何醫療、心理、法律或財務等專業意見。</span>
            若您正面臨重大決策，請諮詢合格專業人士。
          </p>
        </div>

        {/* Copyright */}
        <div className={`
          pt-4 sm:pt-6 border-t text-center
          ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}
        `}>
          <p className={`text-[10px] sm:text-xs ${
            theme === 'dark' ? 'text-paper/40' : 'text-void/40'
          }`}>
            © {currentYear} 虹靈御所. All rights reserved.
          </p>
          <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${
            theme === 'dark' ? 'text-paper/30' : 'text-void/30'
          }`}>
            RSBZS v3.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
