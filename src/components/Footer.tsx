import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook, Mail, Send, ExternalLink } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Import logos
import logoChaoxuanNew from '@/assets/logo-chaoxuan-new.png';
import logoHonglingNew from '@/assets/logo-honglingyusuo-new.png';

const currentYear = new Date().getFullYear();

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/momo_chao_/", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/momochao.tw", label: "Facebook" },
  { icon: Youtube, href: "https://www.youtube.com/@momochao", label: "YouTube" },
];

const footerLinks = {
  explore: [
    { label: "八字解析", href: "/bazi" },
    { label: "八字學院", href: "/academy" },
    { label: "角色圖鑑", href: "/gallery" },
    { label: "導覽地圖", href: "/map" },
  ],
  external: [
    { label: "元壹宇宙", href: "https://www.yyuniverse.com/", external: true },
    { label: "默默超思維訓練系統", href: "https://mmclogic.com/", external: true },
    { label: "元壹占卜系統", href: "https://mirror.yyuniverse.com/", external: true },
    { label: "四時八字人生兵法", href: "https://bazi.rainbow-sanctuary.com/", external: true },
  ],
  about: [
    { label: "關於我們", href: "/about" },
    { label: "隱私政策", href: "/privacy" },
    { label: "使用條款", href: "/terms" },
  ],
};

const Footer = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("請輸入電子郵件地址");
      return;
    }
    
    setIsSubscribing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("訂閱成功！感謝您的支持");
    setEmail("");
    setIsSubscribing(false);
  };

  return (
    <footer className={`
      relative py-12 sm:py-16 px-4 sm:px-6 border-t
      ${theme === 'dark' 
        ? 'bg-slate-950 border-slate-800' 
        : 'bg-slate-100 border-slate-200'
      }
    `}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Brand with Logos */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={logoChaoxuanNew} 
                  alt="超烜創意" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-3">
                <img 
                  src={logoHonglingNew} 
                  alt="虹靈御所" 
                  className="h-8 w-auto object-contain"
                />
              </div>
            </div>

            <p className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              鏡子非劇本，真實即命運。
              <br />
              我們不預測未來，只幫你看清現在。
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`
                    p-2.5 rounded-full transition-all duration-300
                    ${theme === 'dark' 
                      ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div className="space-y-4">
            <h4 className={`text-sm font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white/90' : 'text-slate-900'
            }`}>
              探索
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className={`text-sm transition-colors hover:text-amber-500 ${
                      theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External Links */}
          <div className="space-y-4">
            <h4 className={`text-sm font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white/90' : 'text-slate-900'
            }`}>
              生態系統
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.external.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm transition-colors hover:text-amber-500 inline-flex items-center gap-1.5 ${
                      theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                    }`}
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className={`text-sm font-semibold uppercase tracking-wider ${
              theme === 'dark' ? 'text-white/90' : 'text-slate-900'
            }`}>
              訂閱電子報
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-10 ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30' 
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isSubscribing}
                className="h-10 w-10 shrink-0 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-white/40' : 'text-slate-500'
            }`}>
              獲取最新八字洞見與系統更新
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`
          py-4 px-4 rounded-lg mb-8 text-center
          ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-200/50'}
        `}>
          <p className={`text-xs leading-relaxed max-w-3xl mx-auto ${
            theme === 'dark' ? 'text-white/50' : 'text-slate-500'
          }`}>
            本網站提供之八字命理分析屬於自我探索工具，旨在提供觀點與行動建議。
            本內容不構成且不取代任何醫療、心理、法律或財務等專業意見。
            若您正面臨重大決策，請諮詢合格專業人士。
          </p>
        </div>

        {/* Bottom Bar */}
        <div className={`
          pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4
          ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}
        `}>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-white/40' : 'text-slate-500'
          }`}>
            © {currentYear} 超烜創意 / 虹靈御所
          </p>
          <div className={`flex items-center gap-3 text-xs ${
            theme === 'dark' ? 'text-white/40' : 'text-slate-500'
          }`}>
            <Link to="/privacy" className="hover:text-amber-500 transition-colors">
              隱私政策
            </Link>
            <span>|</span>
            <Link to="/terms" className="hover:text-amber-500 transition-colors">
              使用條款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
