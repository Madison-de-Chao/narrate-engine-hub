/**
 * 故事鎖定狀態指示器
 * 顯示故事生成時間與鎖定狀態
 */

import { Lock, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface StoryLockIndicatorProps {
  isLocked: boolean;
  createdAt?: string;
  version?: number;
  userName?: string;
  className?: string;
}

export function StoryLockIndicator({
  isLocked,
  createdAt,
  version = 1,
  userName,
  className = '',
}: StoryLockIndicatorProps) {
  const formattedDate = createdAt
    ? format(new Date(createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhTW })
    : null;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {isLocked ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-600">
                <Lock className="h-3 w-3" />
                已鎖定
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">故事已永久鎖定</p>
              <p className="text-muted-foreground">此故事已綁定至您的帳號，無法被覆蓋。如需重新生成，請使用重生資格。</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-600">
            <span className="animate-pulse">●</span>
            待生成
          </Badge>
        )}

        {formattedDate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>故事生成時間</p>
            </TooltipContent>
          </Tooltip>
        )}

        {version > 1 && (
          <Badge variant="secondary" className="text-xs">
            v{version}
          </Badge>
        )}

        {userName && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <User className="h-3 w-3" />
            {userName}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
