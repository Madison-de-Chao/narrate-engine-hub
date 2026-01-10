import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimeWheelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// 十二時辰配置
const TIME_SEGMENTS = [
  { value: "23", label: "子", time: "23-01", angle: 0 },
  { value: "1", label: "丑", time: "01-03", angle: 30 },
  { value: "3", label: "寅", time: "03-05", angle: 60 },
  { value: "5", label: "卯", time: "05-07", angle: 90 },
  { value: "7", label: "辰", time: "07-09", angle: 120 },
  { value: "9", label: "巳", time: "09-11", angle: 150 },
  { value: "11", label: "午", time: "11-13", angle: 180 },
  { value: "13", label: "未", time: "13-15", angle: 210 },
  { value: "15", label: "申", time: "15-17", angle: 240 },
  { value: "17", label: "酉", time: "17-19", angle: 270 },
  { value: "19", label: "戌", time: "19-21", angle: 300 },
  { value: "21", label: "亥", time: "21-23", angle: 330 },
];

export const TimeWheelSelector: React.FC<TimeWheelSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const handleSegmentClick = (segmentValue: string) => {
    onChange(segmentValue);
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative w-full max-w-[280px] aspect-square">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))' }}
        >
          {/* 外圈 */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1"
            opacity="0.3"
          />

          {/* 中圈 */}
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.5"
            opacity="0.5"
          />

          {/* 內圈 */}
          <circle
            cx="100"
            cy="100"
            r="25"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.5"
            opacity="0.5"
          />

          {/* 中心點 */}
          <circle
            cx="100"
            cy="100"
            r="3"
            fill="#D4AF37"
          />

          {/* 十二時辰扇形區域 */}
          {TIME_SEGMENTS.map((segment, index) => {
            const isSelected = value === segment.value;
            const isHovered = hoveredSegment === segment.value;
            const startAngle = segment.angle - 90; // 調整起始角度，使子時在頂部
            const endAngle = startAngle + 30;
            
            // 計算扇形路徑
            const innerRadius = 25;
            const outerRadius = 75;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = 100 + innerRadius * Math.cos(startRad);
            const y1 = 100 + innerRadius * Math.sin(startRad);
            const x2 = 100 + outerRadius * Math.cos(startRad);
            const y2 = 100 + outerRadius * Math.sin(startRad);
            const x3 = 100 + outerRadius * Math.cos(endRad);
            const y3 = 100 + outerRadius * Math.sin(endRad);
            const x4 = 100 + innerRadius * Math.cos(endRad);
            const y4 = 100 + innerRadius * Math.sin(endRad);
            
            const pathData = `
              M ${x1} ${y1}
              L ${x2} ${y2}
              A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3}
              L ${x4} ${y4}
              A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}
              Z
            `;

            return (
              <g key={segment.value}>
                {/* 扇形區域 */}
                <path
                  d={pathData}
                  fill={isSelected ? '#D4AF37' : 'transparent'}
                  fillOpacity={isSelected ? 0.3 : 0}
                  stroke="#D4AF37"
                  strokeWidth="0.5"
                  strokeOpacity={isSelected || isHovered ? 0.8 : 0.2}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredSegment(segment.value)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => handleSegmentClick(segment.value)}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))' : 'none',
                  }}
                />
                
                {/* 分隔線 */}
                <line
                  x1={x2}
                  y1={y2}
                  x2={100 + 95 * Math.cos(startRad)}
                  y2={100 + 95 * Math.sin(startRad)}
                  stroke="#D4AF37"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </g>
            );
          })}

          {/* 時辰標籤 */}
          {TIME_SEGMENTS.map((segment) => {
            const isSelected = value === segment.value;
            const labelAngle = segment.angle - 90 + 15; // 標籤位於扇形中央
            const labelRadius = 85;
            const labelRad = (labelAngle * Math.PI) / 180;
            const labelX = 100 + labelRadius * Math.cos(labelRad);
            const labelY = 100 + labelRadius * Math.sin(labelRad);

            return (
              <g key={`label-${segment.value}`}>
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isSelected ? '#D4AF37' : '#F4E4C1'}
                  fontSize="14"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  className="pointer-events-none select-none"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.8))' : 'none',
                  }}
                >
                  {segment.label}
                </text>
              </g>
            );
          })}

          {/* 外圈時間標記 */}
          {TIME_SEGMENTS.map((segment) => {
            const timeAngle = segment.angle - 90 + 15;
            const timeRadius = 50;
            const timeRad = (timeAngle * Math.PI) / 180;
            const timeX = 100 + timeRadius * Math.cos(timeRad);
            const timeY = 100 + timeRadius * Math.sin(timeRad);

            return (
              <text
                key={`time-${segment.value}`}
                x={timeX}
                y={timeY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#D4AF37"
                fontSize="6"
                opacity="0.5"
                className="pointer-events-none select-none"
              >
                {segment.time}
              </text>
            );
          })}
        </svg>

        {/* 中心提示文字 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs" style={{ color: '#D4AF37', opacity: 0.6 }}>
              {value ? TIME_SEGMENTS.find(s => s.value === value)?.label : '選擇'}
            </div>
            <div className="text-[10px]" style={{ color: '#F4E4C1', opacity: 0.5 }}>
              {value ? TIME_SEGMENTS.find(s => s.value === value)?.time : '時辰'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
