import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import Footer from '@/components/Footer';

const Privacy = () => {
  const { theme } = useTheme();

  const sections = [
    {
      icon: Eye,
      title: '資料蒐集範圍',
      content: [
        '出生日期、時間與地點（用於八字計算）',
        '姓名或暱稱（用於報告標示，非必填）',
        '電子郵件地址（用於帳戶註冊與通知）',
        '使用紀錄與偏好設定（用於改善服務體驗）'
      ]
    },
    {
      icon: Database,
      title: '資料使用目的',
      content: [
        '提供八字命盤計算與分析服務',
        '儲存您的計算紀錄以供日後查閱',
        '發送服務相關通知與更新',
        '改善網站功能與使用者體驗',
        '進行匿名化統計分析（不含個人識別資訊）'
      ]
    },
    {
      icon: Lock,
      title: '資料保護措施',
      content: [
        '所有資料傳輸皆使用 HTTPS 加密協定',
        '敏感資料儲存採用業界標準加密技術',
        '定期進行安全性檢測與更新',
        '嚴格限制內部人員存取權限',
        '不在網址、分享圖或前端日誌暴露敏感資訊'
      ]
    },
    {
      icon: Shield,
      title: '您的權利',
      content: [
        '查閱：您可隨時查看您的個人資料',
        '更正：您可要求更正不正確的資料',
        '刪除：您可要求刪除您的帳戶與相關資料',
        '匯出：您可要求匯出您的資料副本',
        '撤回同意：您可隨時撤回對資料處理的同意'
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-void' : 'bg-slate-50'}`}>
      {/* Header */}
      <header className={`
        sticky top-0 z-50 py-4 px-4 sm:px-6 border-b backdrop-blur-sm
        ${theme === 'dark' 
          ? 'bg-void/80 border-slate-800' 
          : 'bg-white/80 border-slate-200'
        }
      `}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={theme === 'dark' ? 'text-paper/70 hover:text-paper' : ''}
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首頁
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <Shield className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h1 className={`text-3xl sm:text-4xl font-bold font-serif mb-4 ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              隱私政策
            </h1>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-paper/50' : 'text-void/50'
            }`}>
              最後更新日期：2025 年 1 月
            </p>
          </div>

          {/* Introduction */}
          <Card className={`mb-8 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-paper/80' : 'text-void/80'
              }`}>
                虹靈御所（以下簡稱「本站」）重視您的隱私權益。本隱私政策說明我們如何蒐集、使用、保護及處理您的個人資料。使用本站服務即表示您同意本政策之內容。
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className={`${
                theme === 'dark' 
                  ? 'bg-slate-900/60 border-slate-700/50' 
                  : 'bg-white border-slate-200'
              }`}>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-paper' : 'text-void'
                    }`}>
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-2">
                    {section.content.map((item, i) => (
                      <li key={i} className={`flex items-start gap-2 ${
                        theme === 'dark' ? 'text-paper/70' : 'text-void/70'
                      }`}>
                        <span className="text-amber-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Third Party */}
          <Card className={`mt-6 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                第三方服務
              </h2>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                本站可能使用第三方服務（如 Google Analytics、支付服務商等）來提供或改善服務。這些第三方服務有其各自的隱私政策，我們建議您查閱相關條款。我們不會將您的個人資料出售給任何第三方。
              </p>
            </CardContent>
          </Card>

          {/* Cookie Policy */}
          <Card className={`mt-6 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                Cookie 使用
              </h2>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                本站使用 Cookie 和類似技術來維持您的登入狀態、記住您的偏好設定，並分析網站使用情況。您可透過瀏覽器設定管理或停用 Cookie，但這可能影響部分功能的正常運作。
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className={`mt-6 ${
            theme === 'dark' 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-amber-500" />
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-paper' : 'text-void'
                }`}>
                  聯絡我們
                </h2>
              </div>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                如您對本隱私政策有任何疑問，或希望行使您的資料權利，請透過以下方式聯繫我們：
                <br />
                <a 
                  href="mailto:contact@honglingyusuo.com" 
                  className="text-amber-500 hover:underline"
                >
                  contact@honglingyusuo.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
