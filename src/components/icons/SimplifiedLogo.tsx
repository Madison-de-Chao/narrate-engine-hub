import React from 'react';

export const SimplifiedLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 外圈 */}
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="none"
    />
    
    {/* 中央菱形 */}
    <path
      d="M12 6 L16 12 L12 18 L8 12 Z"
      fill="currentColor"
      opacity="0.3"
    />
    
    {/* 四個方位點 */}
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <circle cx="20" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
    <circle cx="4" cy="12" r="1" fill="currentColor" />
    
    {/* 內部十字線 */}
    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
  </svg>
);
