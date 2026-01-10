import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import '@/styles/print.css';

interface ReportData {
  name: string;
  gender: string;
  birthDate: string;
  pillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  nayin: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  wuxing?: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinyang?: {
    yin: number;
    yang: number;
  };
  shensha?: Array<{
    name: string;
    position?: string;
    category?: string;
    effect?: string;
    modernMeaning?: string;
    rarity?: string;
  }>;
}

const ReportPrint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 從 location.state 獲取報告資料
    const data = location.state?.reportData as ReportData;
    
    if (!data) {
      console.error('[ReportPrint] No report data found in location.state');
      navigate('/');
      return;
    }

    setReportData(data);

    // 設定頁面標題為檔名（用於 PDF 下載時的預設檔名）
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `${data.name}_八字命盤報告_${dateStr}`;
    document.title = fileName;

    // 等待所有資源載入完成
    const loadTimer = setTimeout(() => {
      setIsReady(true);
      // 自動觸發列印對話框
      window.print();
    }, 1000); // 給 1 秒時間讓圖片載入

    return () => {
      clearTimeout(loadTimer);
      // 離開時恢復原本的標題
      document.title = '虹靈御所';
    };
  }, [location.state, navigate]);

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* 列印控制按鈕 - 只在螢幕上顯示 */}
      <div className="print:hidden fixed top-4 left-4 z-50 flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Button
          onClick={() => window.print()}
          disabled={!isReady}
          className="bg-background/80 backdrop-blur-sm"
        >
          {!isReady ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              準備中...
            </>
          ) : (
            '列印 / 下載 PDF'
          )}
        </Button>
      </div>

      {/* 報告內容 - 使用列印專用樣式 */}
      <div className="report-print-container">
        {/* 封面頁 */}
        <div className="report-page report-cover">
          <div className="cover-content">
            <div className="cover-header">
              <div className="cover-logo">
                <img 
                  src="/src/assets/logo.png" 
                  alt="虹靈御所" 
                  className="logo-image"
                />
              </div>
              <h1 className="cover-title">虹靈御所</h1>
              <p className="cover-subtitle">個人命理研究報告</p>
            </div>

            <div className="cover-info">
              <h2 className="cover-name">{reportData.name}</h2>
              <p className="cover-detail">{reportData.gender === 'male' ? '乾造（男）' : '坤造（女）'}</p>
              <p className="cover-detail">出生時間</p>
              <p className="cover-date">{reportData.birthDate}</p>
            </div>

            <div className="cover-pillars">
              <div className="pillar-item">
                <div className="pillar-label">年柱</div>
                <div className="pillar-chars">
                  <span>{reportData.pillars.year.stem}</span>
                  <span>{reportData.pillars.year.branch}</span>
                </div>
                <div className="pillar-nayin">{reportData.nayin.year}</div>
              </div>
              <div className="pillar-item">
                <div className="pillar-label">月柱</div>
                <div className="pillar-chars">
                  <span>{reportData.pillars.month.stem}</span>
                  <span>{reportData.pillars.month.branch}</span>
                </div>
                <div className="pillar-nayin">{reportData.nayin.month}</div>
              </div>
              <div className="pillar-item">
                <div className="pillar-label">日柱</div>
                <div className="pillar-chars">
                  <span>{reportData.pillars.day.stem}</span>
                  <span>{reportData.pillars.day.branch}</span>
                </div>
                <div className="pillar-nayin">{reportData.nayin.day}</div>
              </div>
              <div className="pillar-item">
                <div className="pillar-label">時柱</div>
                <div className="pillar-chars">
                  <span>{reportData.pillars.hour.stem}</span>
                  <span>{reportData.pillars.hour.branch}</span>
                </div>
                <div className="pillar-nayin">{reportData.nayin.hour}</div>
              </div>
            </div>

            <div className="cover-footer">
              <p className="disclaimer">
                本報告為基於您個人資訊的命理分析，旨在提供自我探索的參考路徑，而非對未來的絕對定論。您的人生選擇，終將由您自己決定。
              </p>
              <p className="cover-date-stamp">
                {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })} 製表
              </p>
            </div>
          </div>
        </div>

        {/* 後續頁面將在下一步實作 */}
      </div>
    </>
  );
};

export default ReportPrint;
