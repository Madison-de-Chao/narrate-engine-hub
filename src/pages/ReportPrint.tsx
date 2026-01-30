import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react';
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

// 生成 STARDATE 格式日期
const generateStardate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const dayOfYear = Math.floor((now.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return `${year}.${String(dayOfYear).padStart(3, '0')}`;
};

const ReportPrint = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const stardate = generateStardate();

  useEffect(() => {
    const data = location.state?.reportData as ReportData;
    
    if (!data) {
      console.error('[ReportPrint] No report data found in location.state');
      navigate('/');
      return;
    }

    setReportData(data);

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const fileName = `${data.name}_八字命盤報告_${dateStr}`;
    document.title = fileName;

    console.log('[ReportPrint] Report data loaded:', data);
    
    const loadTimer = setTimeout(() => {
      console.log('[ReportPrint] Ready to print');
      setIsReady(true);
      setTimeout(() => {
        window.print();
      }, 500);
    }, 3000);

    return () => {
      clearTimeout(loadTimer);
      document.title = '虹靈御所';
    };
  }, [location.state, navigate]);

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-void">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cosmic-gold" />
          <span className="text-cosmic-text-dim text-sm">正在載入報告...</span>
        </div>
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

  // 軍團配置
  const legionConfig: Record<string, { name: string; icon: string; navPoint: string; color: string }> = {
    year: { name: '祖源軍團', icon: '👑', navPoint: 'ORIGIN-LEGION', color: '#c8aa64' },
    month: { name: '關係軍團', icon: '🤝', navPoint: 'SOCIAL-LEGION', color: '#10b981' },
    day: { name: '核心軍團', icon: '⭐', navPoint: 'CORE-LEGION', color: '#a855f7' },
    hour: { name: '未來軍團', icon: '🚀', navPoint: 'FUTURE-LEGION', color: '#f97316' },
  };

  return (
    <>
      {/* 列印控制按鈕 - 只在螢幕上顯示 */}
      <div className="print:hidden fixed top-4 left-4 z-50 flex gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="bg-cosmic-void/80 backdrop-blur-sm border-cosmic-gold/30 text-cosmic-text hover:bg-cosmic-gold/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <Button
          onClick={() => window.print()}
          disabled={!isReady}
          className="bg-cosmic-gold/20 backdrop-blur-sm border border-cosmic-gold/40 text-cosmic-gold hover:bg-cosmic-gold/30"
        >
          {!isReady ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              準備中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              列印 / 下載 PDF
            </>
          )}
        </Button>
      </div>

      {/* 報告內容 - 使用列印專用樣式 */}
      <div className="report-print-container">
        {/* 第1頁：封面頁 */}
        <div className="report-page report-cover">
          <div className="cover-content">
            {/* STARDATE */}
            <div className="stardate">
              STARDATE {stardate}
            </div>

            <div className="cover-header">
              <div className="cover-logo">
                <img 
                  src={logoImage} 
                  alt="虹靈御所" 
                  className="logo-image"
                />
              </div>
              <h1 className="cover-title">八字人生兵法</h1>
              <p className="cover-subtitle">四時軍團戰略命理系統</p>
            </div>

            <div className="cover-info">
              <h2 className="cover-name">{reportData.name}</h2>
              <p className="cover-detail">{reportData.gender === 'male' ? '乾造（男）' : '坤造（女）'}</p>
              <p className="cover-detail">出生時間</p>
              <p className="cover-date">{reportData.birthDate}</p>
            </div>

            <div className="cover-pillars">
              <div className="pillar-item">
                <div className="pillar-label">年柱 · YEAR</div>
                <div className="pillar-chars">
                  <span>{reportData.pillars.year.stem}</span>
                  <span>{reportData.pillars.year.branch}</span>
                </div>
                <div className="pillar-nayin">{reportData.nayin.year}</div>
              </div>
              <div className="pillar-item">
                <div className="pillar-label">月柱 · MONTH</div>
                <div className="pillar-chars">
                  <span>{reportData.pillars.month.stem}</span>
                  <span>{reportData.pillars.month.branch}</span>
                </div>
                <div className="pillar-nayin">{reportData.nayin.month}</div>
              </div>
              <div className="pillar-item">
                <div className="pillar-label">日柱 · DAY</div>
                <div className="pillar-chars">
                  <span>{reportData.pillars.day.stem}</span>
                  <span>{reportData.pillars.day.branch}</span>
                </div>
                <div className="pillar-nayin">{reportData.nayin.day}</div>
              </div>
              <div className="pillar-item">
                <div className="pillar-label">時柱 · HOUR</div>
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
          <div className="stardate">STARDATE {stardate}</div>
          <div className="nav-point">
            <span className="nav-point-label">NAV-POINT: PILLARS-ANALYSIS</span>
          </div>

          <div className="page-header">
            <h2 className="page-title">四柱命盤詳解</h2>
            <p className="page-subtitle">Five Elements & Yin-Yang Balance</p>
          </div>

          <div style={{ marginTop: '18mm' }}>
            {/* 四柱表格 */}
            <div style={{ marginBottom: '12mm' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                color: '#c8aa64', 
                marginBottom: '8mm', 
                textAlign: 'center',
                letterSpacing: '4px'
              }}>四柱干支</h3>
              <table>
                <thead>
                  <tr>
                    <th>年柱</th>
                    <th>月柱</th>
                    <th>日柱</th>
                    <th>時柱</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{reportData.pillars.year.stem}{reportData.pillars.year.branch}</td>
                    <td>{reportData.pillars.month.stem}{reportData.pillars.month.branch}</td>
                    <td>{reportData.pillars.day.stem}{reportData.pillars.day.branch}</td>
                    <td>{reportData.pillars.hour.stem}{reportData.pillars.hour.branch}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: '12px', color: '#a0a0b0', fontWeight: 400 }}>{reportData.nayin.year}</td>
                    <td style={{ fontSize: '12px', color: '#a0a0b0', fontWeight: 400 }}>{reportData.nayin.month}</td>
                    <td style={{ fontSize: '12px', color: '#a0a0b0', fontWeight: 400 }}>{reportData.nayin.day}</td>
                    <td style={{ fontSize: '12px', color: '#a0a0b0', fontWeight: 400 }}>{reportData.nayin.hour}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 五行與陰陽 */}
            {wuxingPercent && yinyangPercent && (
              <div style={{ display: 'flex', gap: '10mm', marginTop: '12mm' }}>
                {/* 五行能量分佈 */}
                <div style={{ flex: 1.2 }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#c8aa64', 
                    marginBottom: '6mm', 
                    textAlign: 'center',
                    letterSpacing: '2px'
                  }}>五行能量分佈</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4mm' }}>
                    {[
                      { name: '木 Wood', value: wuxingPercent.wood, className: 'wood' },
                      { name: '火 Fire', value: wuxingPercent.fire, className: 'fire' },
                      { name: '土 Earth', value: wuxingPercent.earth, className: 'earth' },
                      { name: '金 Metal', value: wuxingPercent.metal, className: 'metal' },
                      { name: '水 Water', value: wuxingPercent.water, className: 'water' },
                    ].map(element => (
                      <div key={element.className}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm', fontSize: '11px', color: '#a0a0b0' }}>
                          <span>{element.name}</span>
                          <span style={{ color: '#c8aa64' }}>{element.value}%</span>
                        </div>
                        <div className="wuxing-bar">
                          <div className={`wuxing-bar-fill ${element.className}`} style={{ width: `${element.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 陰陽平衡 */}
                <div style={{ flex: 0.8 }}>
                  <h3 style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: '#c8aa64', 
                    marginBottom: '6mm', 
                    textAlign: 'center',
                    letterSpacing: '2px'
                  }}>陰陽平衡</h3>
                  <div className="taiji-container" style={{ height: '80mm' }}>
                    <svg width="120" height="120" viewBox="0 0 200 200">
                      <defs>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <circle cx="100" cy="100" r="95" fill="none" stroke="#c8aa64" strokeWidth="1" opacity="0.3"/>
                      <circle cx="100" cy="100" r="90" fill="#e8e8e8" stroke="#c8aa64" strokeWidth="2"/>
                      <path d="M 100 10 A 90 90 0 0 1 100 190 A 45 45 0 0 1 100 100 A 45 45 0 0 0 100 10" fill="#0a0a14"/>
                      <circle cx="100" cy="55" r="12" fill="#0a0a14"/>
                      <circle cx="100" cy="145" r="12" fill="#e8e8e8"/>
                      <text x="100" y="62" textAnchor="middle" fill="#e8e8e8" fontSize="10" fontWeight="600">陽</text>
                      <text x="100" y="152" textAnchor="middle" fill="#0a0a14" fontSize="10" fontWeight="600">陰</text>
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '4mm' }}>
                    <span style={{ fontSize: '12px', color: '#e8e8e8', marginRight: '12px' }}>陽 {yinyangPercent.yang}%</span>
                    <span style={{ fontSize: '12px', color: '#a0a0b0' }}>陰 {yinyangPercent.yin}%</span>
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
            <div className="stardate">STARDATE {stardate}</div>
            <div className="nav-point">
              <span className="nav-point-label">NAV-POINT: SHENSHA-ANALYSIS</span>
            </div>

            <div className="page-header">
              <h2 className="page-title">神煞命格分析</h2>
              <p className="page-subtitle">Divine Stars & Fate Patterns</p>
            </div>

            <div style={{ marginTop: '15mm' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6mm' }}>
                {reportData.shensha.slice(0, 8).map((shen, index) => (
                  <div key={index} className="shensha-card">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4mm' }}>
                      <div className="shensha-icon">
                        {shen.name.charAt(0)}
                      </div>
                      <div style={{ marginLeft: '4mm' }}>
                        <h4 className="shensha-name">{shen.name}</h4>
                        {shen.position && (
                          <p className="shensha-position">{shen.position}</p>
                        )}
                      </div>
                    </div>
                    {shen.effect && (
                      <p className="shensha-effect">
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

        {/* 軍團故事頁面（每個有故事的柱一頁） */}
        {reportData.legionStories && Object.entries(reportData.legionStories).map(([pillarName, story]) => {
          if (!story || typeof story !== 'string') return null;
          
          const legion = legionConfig[pillarName as keyof typeof legionConfig];
          if (!legion) return null;
          
          const pillar = reportData.pillars[pillarName as keyof typeof reportData.pillars];
          if (!pillar) return null;
          
          return (
            <div key={pillarName} className="report-page report-content-page legion-story-page">
              <div className="stardate">STARDATE {stardate}</div>
              <div className="nav-point">
                <span className="nav-point-label">NAV-POINT: {legion.navPoint}</span>
              </div>

              <div className="page-header">
                <h2 className="page-title">
                  <span style={{ marginRight: '8px' }}>{legion.icon}</span>
                  {legion.name}
                </h2>
                <p className="page-subtitle">
                  {pillar.stem}{pillar.branch} · {reportData.nayin[pillarName as keyof typeof reportData.nayin]}
                </p>
              </div>

              <div style={{ marginTop: '12mm' }}>
                {/* 天干和地支角色 */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '6mm',
                  marginBottom: '8mm'
                }}>
                  <div className="legion-character-card" style={{ borderColor: legion.color }}>
                    <h4 className="legion-character-title" style={{ color: legion.color }}>
                      ⚔️ 天干：{pillar.stem}
                    </h4>
                    <p className="legion-character-description">
                      指揮官 · 主導能量
                    </p>
                  </div>
                  <div className="legion-character-card" style={{ borderColor: legion.color }}>
                    <h4 className="legion-character-title" style={{ color: legion.color }}>
                      🛡️ 地支：{pillar.branch}
                    </h4>
                    <p className="legion-character-description">
                      軍師 · 策略智慧
                    </p>
                  </div>
                </div>

                {/* 軍團故事 */}
                <div className="legion-story-content">
                  {story}
                </div>
              </div>

              <div className="page-footer">
                <p>虹靈御所 Rainbow Sanctuary © {new Date().getFullYear()}</p>
              </div>
            </div>
          );
        })}

        {/* 免責聲明完整版 */}
        <div className="report-page report-content-page">
          <div className="stardate">STARDATE {stardate}</div>
          <div className="nav-point">
            <span className="nav-point-label">NAV-POINT: TERMS-OF-SERVICE</span>
          </div>

          <div className="page-header">
            <h2 className="page-title">服務條款與免責聲明</h2>
            <p className="page-subtitle">Terms of Service & Disclaimer</p>
          </div>

          <div style={{ marginTop: '12mm', fontSize: '11px', lineHeight: 1.8, color: '#a0a0b0' }}>
            <p style={{ marginBottom: '8mm', textAlign: 'center', fontSize: '12px', fontWeight: 500, color: '#e8e8e8' }}>
              歡迎您使用虹靈御所（Rainbow Sanctuary）的個人命理分析服務。<br/>
              在您深入探索本報告之前，請仔細閱讀以下條款。
            </p>

            <div className="disclaimer-section" style={{ marginBottom: '5mm' }}>
              <h3>1. 服務性質</h3>
              <p>
                本報告是基於傳統的八字命理學術，結合獨創的「四時軍團系統」進行的個人特質與潛能分析。我們的目標是提供一個全新的視角，協助您「看見」自己的內在結構、「感受」生命的韻律、並在需要時「療癒」內心的困惑。本服務屬於文化研究與自我探索工具，不構成任何形式的醫療、法律、財務或專業建議。
              </p>
            </div>

            <div className="disclaimer-section" style={{ marginBottom: '5mm' }}>
              <h3>2. 非專業建議聲明</h3>
              <p>
                本報告所提供的內容，包括但不限於性格分析、運勢預測、人際關係建議等，均為基於傳統命理學的詮釋與推論，不應被視為專業的心理諮詢、醫療診斷、法律意見或投資建議。若您在健康、法律、財務或其他專業領域有具體需求，請務必尋求相關領域合格專業人士的協助。
              </p>
            </div>

            <div className="disclaimer-section" style={{ marginBottom: '5mm' }}>
              <h3>3. 資訊的局限性</h3>
              <p>
                命理分析的準確性受多種因素影響，包含但不限於您提供的出生資訊的精確度。本報告的解讀與觀點僅為一種可能性，不保證完全符合您過去、現在或未來的實際情況。生命是動態且充滿變數的，個人的自由意志與後天努力，將對人生軌跡產生關鍵影響。
              </p>
            </div>

            <div className="disclaimer-section" style={{ marginBottom: '5mm' }}>
              <h3>4. 個人責任</h3>
              <p>
                您對本報告資訊的理解、詮釋及使用，皆為您個人的選擇與責任。虹靈御所對於您根據本報告所採取的任何行動及其結果，不承擔任何形式的法律或道義責任。
              </p>
            </div>

            <div className="disclaimer-section" style={{ marginBottom: '5mm' }}>
              <h3>5. 版權聲明</h3>
              <p>
                本報告的全部內容，包括但不限於文字、圖像、圖表及整體設計，其版權均為虹靈御所所有。未經書面授權，嚴禁以任何形式複製、轉載、修改或公開傳播。
              </p>
            </div>

            <div className="disclaimer-footer">
              <p className="brand-promise">
                我們的承諾是「Always Bring Care & Truth」
              </p>
              <p className="brand-message">
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
