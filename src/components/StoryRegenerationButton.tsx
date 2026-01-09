/**
 * 故事重生按鈕元件
 * 顯示重生資格與觸發重生流程
 */

import { useState } from 'react';
import { RefreshCw, Lock, Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface StoryRegenerationButtonProps {
  creditsRemaining: number;
  isLocked: boolean;
  onRegenerate: () => Promise<void>;
  isRegenerating?: boolean;
  className?: string;
}

export function StoryRegenerationButton({
  creditsRemaining,
  isLocked,
  onRegenerate,
  isRegenerating = false,
  className = '',
}: StoryRegenerationButtonProps) {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRegenerate = async () => {
    setIsDialogOpen(false);
    await onRegenerate();
  };

  // 未鎖定狀態 - 不顯示重生按鈕
  if (!isLocked) {
    return null;
  }

  // 沒有重生資格
  if (creditsRemaining <= 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          故事已鎖定
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/subscribe')}
          className="gap-1"
        >
          <ShoppingCart className="h-4 w-4" />
          購買重生資格
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="secondary" className="gap-1">
        <Sparkles className="h-3 w-3" />
        重生資格: {creditsRemaining}
      </Badge>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isRegenerating}
            className="gap-1 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            重新生成故事
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-500" />
              確認重新生成軍團故事？
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>此操作將：</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>刪除現有的四篇軍團故事（無法復原）</li>
                <li>使用 AI 重新生成全新故事</li>
                <li>消耗 1 次重生資格（剩餘 {creditsRemaining} 次）</li>
              </ul>
              <p className="text-amber-600 font-medium mt-3">
                ⚠️ 舊版本故事將不會保留
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerate}
              className="bg-amber-600 hover:bg-amber-700"
            >
              確認重生
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
