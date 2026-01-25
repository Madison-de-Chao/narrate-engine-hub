import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, Scale, Ban, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import Footer from '@/components/Footer';

const Terms = () => {
  const { theme } = useTheme();

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
            <FileText className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h1 className={`text-3xl sm:text-4xl font-bold font-serif mb-4 ${
              theme === 'dark' ? 'text-paper' : 'text-void'
            }`}>
              使用條款
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
                歡迎使用虹靈御所（以下簡稱「本站」）提供的八字命理分析服務。使用本站服務前，請詳閱以下條款。繼續使用本站即表示您同意遵守本使用條款。
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className={`mb-6 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-paper' : 'text-void'
                }`}>
                  服務說明
                </h2>
              </div>
              <div className={`space-y-4 ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                <p>
                  本站提供八字命理計算與分析服務，包括但不限於：四柱八字排盤、十神分析、神煞解讀、四時軍團敘事等功能。
                </p>
                <p>
                  本站之服務內容可能隨時更新或調整，我們將盡力維持服務品質，但不保證服務不會中斷或完全無誤。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer - Important */}
          <Card className={`mb-6 ${
            theme === 'dark' 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-red-50 border-red-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-paper' : 'text-void'
                }`}>
                  重要免責聲明
                </h2>
              </div>
              <div className={`space-y-4 ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                <p className="font-medium">
                  本報告為八字（命理）系統的結構化呈現與解讀參考，目的在於提供觀察角度與可執行建議。
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">1.</span>
                    <span>本內容<strong>不構成</strong>醫療診斷、心理治療、法律建議、財務／投資建議或任何形式之專業服務。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">2.</span>
                    <span>文中之趨勢、傾向、可能性描述，<strong>不等同於保證結果</strong>；使用者仍需依自身狀況做出判斷與選擇。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">3.</span>
                    <span>涉及健康、心理、法律、財務等重大議題，請尋求<strong>合格專業人士</strong>協助。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">4.</span>
                    <span>使用本內容即表示您理解並同意以上聲明。</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Obligations */}
          <Card className={`mb-6 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-paper' : 'text-void'
                }`}>
                  使用者責任
                </h2>
              </div>
              <div className={`space-y-4 ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                <p>使用本站服務時，您同意：</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>提供正確的出生資訊以確保分析準確性</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>不將本站內容用於非法、詐騙或傷害他人之目的</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>不擅自複製、散布或商業使用本站內容</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>不嘗試入侵、破壞或干擾本站系統運作</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>理解分析結果僅供參考，最終決定權在您自己手上</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className={`mb-6 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                智慧財產權
              </h2>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                本站所有內容，包括但不限於文字、圖像、程式碼、設計、商標、角色設定等，均受智慧財產權法保護。未經本站書面同意，不得擅自使用、複製、修改或散布任何內容。您的個人報告僅限個人使用，不得用於商業目的。
              </p>
            </CardContent>
          </Card>

          {/* Subscription & Refund */}
          <Card className={`mb-6 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                訂閱與退款
              </h2>
              <div className={`space-y-4 ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                <p>
                  Premium 會員服務採訂閱制，相關費用與權益依訂閱方案說明為準。
                </p>
                <p>
                  由於數位內容之特性，一經使用即難以回復原狀，退款政策將依個案處理。如有爭議，請聯繫客服協助。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Amendments */}
          <Card className={`mb-6 ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-700/50' 
              : 'bg-white border-slate-200'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-paper' : 'text-void'
              }`}>
                條款修訂
              </h2>
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-paper/70' : 'text-void/70'
              }`}>
                本站保留隨時修訂本使用條款之權利。重大變更將透過網站公告或電子郵件通知。您於變更後繼續使用本站服務，即視為同意修訂後之條款。
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className={`${
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
                如您對本使用條款有任何疑問，請透過以下方式聯繫我們：
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

export default Terms;
