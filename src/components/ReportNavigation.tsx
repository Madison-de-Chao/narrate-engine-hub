import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Scroll, 
  Shield, 
  BarChart3, 
  FileText,
  ChevronDown
} from "lucide-react";

interface ReportNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'summary', label: '總覽', icon: LayoutDashboard },
  { id: 'bazi', label: '八字排盤', icon: Scroll },
  { id: 'legion', label: '四時軍團', icon: Shield },
  { id: 'analysis', label: '詳細分析', icon: BarChart3 },
  { id: 'logs', label: '計算日誌', icon: FileText },
];

export const ReportNavigation = ({ activeSection, onSectionChange }: ReportNavigationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* 桌面版導航 */}
      <nav className="hidden md:flex sticky top-24 z-40 justify-center gap-2 p-3 bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 shadow-lg">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <Button
              key={section.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "gap-2 transition-all duration-300",
                isActive && "shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </Button>
          );
        })}
      </nav>

      {/* 移動版導航 */}
      <div className="md:hidden sticky top-20 z-40">
        <div className="mx-4">
          <Button
            variant="outline"
            className="w-full justify-between bg-card/90 backdrop-blur-md"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              {(() => {
                const current = sections.find(s => s.id === activeSection);
                const Icon = current?.icon || LayoutDashboard;
                return (
                  <>
                    <Icon className="w-4 h-4" />
                    {current?.label || '總覽'}
                  </>
                );
              })()}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </Button>
          
          {isExpanded && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-card/95 backdrop-blur-md rounded-xl border border-border/50 shadow-xl animate-fade-in">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onSectionChange(section.id);
                      setIsExpanded(false);
                    }}
                    className="w-full justify-start gap-2 mb-1"
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
