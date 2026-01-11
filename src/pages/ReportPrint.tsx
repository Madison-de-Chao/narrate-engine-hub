import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import '@/styles/print.css';
import logoImage from '@/assets/logo.png';

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
  tenGods?: any;
  hiddenStems?: any;
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
  legionStories?: any;
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
    console.log('[ReportPrint] Report data loaded:', data);
    
    const loadTimer = setTimeout(() => {
      console.log('[ReportPrint] Ready to print');
      setIsReady(true);
      // 自動觸發列印對話框
      setTimeout(() => {
        window.print();
      }, 500); // 再等 0.5 秒確保狀態更新
    }, 3000); // 給 3 秒時間讓內容完全渲染

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

  // 計算五行百分比
  const wuxingTotal = reportData.wuxing 
    ? Object.values(reportData.wuxing).reduce((a, b) => a + b, 0)
    : 0;
  
  const wuxingPercent = reportData.wuxing && wuxingTotal > 0 ? {
    wood: Math.round((reportData.wuxing.wood / wuxingTotal) * 100),
    fire: Math.round((reportData.wuxing.fire / wuxingTotal) * 100),
    earth: Math.round((reportData.wuxing.earth / wuxingTotal) * 100),
    metal: Math.round((reportData.wuxing.metal / wuxingTotal) * 100),
    water: Math.round((reportData.wuxing.water / wuxingTotal) * 100),
  } : null;

  // 計算陰陽百分比
  const yinyangTotal = reportData.yinyang 
    ? reportData.yinyang.yin + reportData.yinyang.yang
    : 0;
  
  const yinyangPercent = reportData.yinyang && yinyangTotal > 0 ? {
    yin: Math.round((reportData.yinyang.yin / yinyangTotal) * 100),
    yang: Math.round((reportData.yinyang.yang / yinyangTotal) * 100),
  } : null;

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
        {/* 第1頁：封面頁 */}
        <div className="report-page report-cover">
          <div className="cover-content">
            <div className="cover-header">
              <div className="cover-logo">
                <img 
                  src={logoImage} 
                  alt="虹靈御所" 
                  className="logo-image"
                />
              </div>
              <h1 className="cover-title">八字人生兵法</h1>
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

        {/* 第2頁：四柱命盤詳解 */}
        <div className="report-page report-content-page">
          <div className="page-header">
            <h2 className="page-title">四柱命盤詳解</h2>
            <p className="page-subtitle">Five Elements & Yin-Yang Balance</p>
          </div>

          <div style={{ marginTop: '20mm' }}>
            {/* 四柱表格 */}
            <div style={{ marginBottom: '15mm' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', marginBottom: '10mm', textAlign: 'center' }}>四柱干支</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #c8aa64' }}>
                    <th style={{ padding: '8mm', fontSize: '14px', fontWeight: 600 }}>年柱</th>
                    <th style={{ padding: '8mm', fontSize: '14px', fontWeight: 600 }}>月柱</th>
                    <th style={{ padding: '8mm', fontSize: '14px', fontWeight: 600 }}>日柱</th>
                    <th style={{ padding: '8mm', fontSize: '14px', fontWeight: 600 }}>時柱</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '8mm', fontSize: '24px', fontWeight: 600, color: '#c8aa64' }}>
                      {reportData.pillars.year.stem}{reportData.pillars.year.branch}
                    </td>
                    <td style={{ padding: '8mm', fontSize: '24px', fontWeight: 600, color: '#c8aa64' }}>
                      {reportData.pillars.month.stem}{reportData.pillars.month.branch}
                    </td>
                    <td style={{ padding: '8mm', fontSize: '24px', fontWeight: 600, color: '#c8aa64' }}>
                      {reportData.pillars.day.stem}{reportData.pillars.day.branch}
                    </td>
                    <td style={{ padding: '8mm', fontSize: '24px', fontWeight: 600, color: '#c8aa64' }}>
                      {reportData.pillars.hour.stem}{reportData.pillars.hour.branch}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6mm', fontSize: '12px', color: '#666' }}>{reportData.nayin.year}</td>
                    <td style={{ padding: '6mm', fontSize: '12px', color: '#666' }}>{reportData.nayin.month}</td>
                    <td style={{ padding: '6mm', fontSize: '12px', color: '#666' }}>{reportData.nayin.day}</td>
                    <td style={{ padding: '6mm', fontSize: '12px', color: '#666' }}>{reportData.nayin.hour}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 五行與陰陽 */}
            {wuxingPercent && yinyangPercent && (
              <div style={{ display: 'flex', gap: '10mm', marginTop: '15mm' }}>
                {/* 五行能量分佈 */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8mm', textAlign: 'center' }}>五行能量分佈</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5mm' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm', fontSize: '12px' }}>
                        <span>木 Wood</span>
                        <span>{wuxingPercent.wood}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8mm', backgroundColor: '#e0e0e0', borderRadius: '4mm', overflow: 'hidden' }}>
                        <div style={{ width: `${wuxingPercent.wood}%`, height: '100%', backgroundColor: '#10b981' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm', fontSize: '12px' }}>
                        <span>火 Fire</span>
                        <span>{wuxingPercent.fire}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8mm', backgroundColor: '#e0e0e0', borderRadius: '4mm', overflow: 'hidden' }}>
                        <div style={{ width: `${wuxingPercent.fire}%`, height: '100%', backgroundColor: '#ef4444' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm', fontSize: '12px' }}>
                        <span>土 Earth</span>
                        <span>{wuxingPercent.earth}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8mm', backgroundColor: '#e0e0e0', borderRadius: '4mm', overflow: 'hidden' }}>
                        <div style={{ width: `${wuxingPercent.earth}%`, height: '100%', backgroundColor: '#f59e0b' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm', fontSize: '12px' }}>
                        <span>金 Metal</span>
                        <span>{wuxingPercent.metal}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8mm', backgroundColor: '#e0e0e0', borderRadius: '4mm', overflow: 'hidden' }}>
                        <div style={{ width: `${wuxingPercent.metal}%`, height: '100%', backgroundColor: '#94a3b8' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm', fontSize: '12px' }}>
                        <span>水 Water</span>
                        <span>{wuxingPercent.water}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8mm', backgroundColor: '#e0e0e0', borderRadius: '4mm', overflow: 'hidden' }}>
                        <div style={{ width: `${wuxingPercent.water}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 陰陽平衡 */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8mm', textAlign: 'center' }}>陰陽平衡</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100mm' }}>
                    <div style={{ position: 'relative', width: '80mm', height: '80mm' }}>
                      {/* 太極圖（簡化版） */}
                      <svg width="100%" height="100%" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="95" fill="white" stroke="#1a1a2e" strokeWidth="2"/>
                        <path d="M 100 5 A 95 95 0 0 1 100 195 A 47.5 47.5 0 0 1 100 100 A 47.5 47.5 0 0 0 100 5" fill="#1a1a2e"/>
                        <circle cx="100" cy="52.5" r="12" fill="white"/>
                        <circle cx="100" cy="147.5" r="12" fill="#1a1a2e"/>
                        <text x="100" y="60" textAnchor="middle" fill="#1a1a2e" fontSize="14" fontWeight="600">陽 {yinyangPercent.yang}%</text>
                        <text x="100" y="160" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">陰 {yinyangPercent.yin}%</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="page-footer">
            <p>虹靈御所 Rainbow Sanctuary © {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* 第3頁：神煞命格分析 */}
        {reportData.shensha && reportData.shensha.length > 0 && (
          <div className="report-page report-content-page">
            <div className="page-header">
              <h2 className="page-title">神煞命格分析</h2>
              <p className="page-subtitle">Divine Stars & Fate Patterns</p>
            </div>

            <div style={{ marginTop: '20mm' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm' }}>
                {reportData.shensha.slice(0, 8).map((shen, index) => (
                  <div key={index} style={{ 
                    padding: '6mm', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '4mm',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4mm' }}>
                      <div style={{ 
                        width: '12mm', 
                        height: '12mm', 
                        borderRadius: '50%', 
                        backgroundColor: '#c8aa64',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '4mm',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'white'
                      }}>
                        {shen.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>{shen.name}</h4>
                        {shen.position && (
                          <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{shen.position}</p>
                        )}
                      </div>
                    </div>
                    {shen.effect && (
                      <p style={{ fontSize: '11px', color: '#444', lineHeight: 1.6, margin: 0 }}>
                        {shen.effect}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="page-footer">
              <p>虹靈御所 Rainbow Sanctuary © {new Date().getFullYear()}</p>
            </div>
          </div>
        )}

        {/* 第4頁：免責聲明完整版 */}
        <div className="report-page report-content-page">
          <div className="page-header">
            <h2 className="page-title">服務條款與免責聲明</h2>
            <p className="page-subtitle">Terms of Service & Disclaimer</p>
          </div>

          <div style={{ marginTop: '15mm', fontSize: '11px', lineHeight: 1.8, color: '#333' }}>
            <p style={{ marginBottom: '8mm', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>
              歡迎您使用虹靈御所（Rainbow Sanctuary）的個人命理分析服務。<br/>
              在您深入探索本報告之前，請仔細閱讀以下條款。
            </p>

            <div style={{ marginBottom: '6mm' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '3mm' }}>1. 服務性質</h3>
              <p style={{ margin: 0 }}>
                本報告是基於傳統的八字命理學術，結合獨創的「四時軍團系統」進行的個人特質與潛能分析。我們的目標是提供一個全新的視角，協助您「看見」自己的內在結構、「感受」生命的韻律、並在需要時「療癒」內心的困惑。本服務屬於文化研究與自我探索工具，不構成任何形式的醫療、法律、財務或專業建議。
              </p>
            </div>

            <div style={{ marginBottom: '6mm' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '3mm' }}>2. 非專業建議聲明</h3>
              <p style={{ margin: 0 }}>
                本報告所提供的內容，包括但不限於性格分析、運勢預測、人際關係建議等，均為基於傳統命理學的詮釋與推論，不應被視為專業的心理諮詢、醫療診斷、法律意見或投資建議。若您在健康、法律、財務或其他專業領域有具體需求，請務必尋求相關領域合格專業人士的協助。
              </p>
            </div>

            <div style={{ marginBottom: '6mm' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '3mm' }}>3. 資訊的局限性</h3>
              <p style={{ margin: 0 }}>
                命理分析的準確性受多種因素影響，包含但不限於您提供的出生資訊的精確度。本報告的解讀與觀點僅為一種可能性，不保證完全符合您過去、現在或未來的實際情況。生命是動態且充滿變數的，個人的自由意志與後天努力，將對人生軌跡產生關鍵影響。
              </p>
            </div>

            <div style={{ marginBottom: '6mm' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '3mm' }}>4. 個人責任</h3>
              <p style={{ margin: 0 }}>
                您對本報告資訊的理解、詮釋及使用，皆為您個人的選擇與責任。虹靈御所對於您根據本報告所採取的任何行動及其結果，不承擔任何形式的法律或道義責任。
              </p>
            </div>

            <div style={{ marginBottom: '6mm' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', marginBottom: '3mm' }}>5. 版權聲明</h3>
              <p style={{ margin: 0 }}>
                本報告的全部內容，包括但不限於文字、圖像、圖表及整體設計，其版權均為虹靈御所所有。未經書面授權，嚴禁以任何形式複製、轉載、修改或公開傳播。
              </p>
            </div>

            <div style={{ marginTop: '12mm', padding: '6mm', backgroundColor: '#f5f5f5', borderRadius: '4mm', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#c8aa64' }}>
                我們的承諾是「Always Bring Care & Truth」
              </p>
              <p style={{ margin: '3mm 0 0 0', fontSize: '11px', color: '#666' }}>
                我們致力於提供真誠且有溫度的分析，陪伴您走在自我探索的道路上。<br/>
                感謝您的信任與理解。
              </p>
            </div>
          </div>

          <div className="page-footer">
            <p>虹靈御所 Rainbow Sanctuary © {new Date().getFullYear()} | Always Bring Care & Truth</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportPrint;
