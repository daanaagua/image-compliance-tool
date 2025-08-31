'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}

export function ProgressBar({ isActive, onComplete, className }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'slow' | 'fast' | 'waiting' | 'complete'>('slow');

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setStage('slow');
      return;
    }

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    // 第一阶段：慢速进度 (0% -> 15%)
    if (stage === 'slow' && progress < 15) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 2 + 0.5; // 0.5-2.5% 每次
          if (newProgress >= 15) {
            setStage('fast');
            return 15;
          }
          return newProgress;
        });
      }, 200); // 每200ms更新一次
    }
    // 第二阶段：快速进度 (15% -> 75%)
    else if (stage === 'fast' && progress < 75) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 8 + 5; // 5-13% 每次
          if (newProgress >= 75) {
            setStage('waiting');
            return 75;
          }
          return newProgress;
        });
      }, 100); // 每100ms更新一次，更快
    }
    // 第三阶段：慢速到90% (75% -> 90%)
    else if (stage === 'waiting' && progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 1 + 0.2; // 0.2-1.2% 每次
          if (newProgress >= 90) {
            return 90;
          }
          return newProgress;
        });
      }, 300); // 每300ms更新一次，很慢
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isActive, stage, progress]);

  // 外部调用完成进度条
  const completeProgress = () => {
    setStage('complete');
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        return newProgress;
      });
    }, 50); // 快速完成最后10%
  };

  // 暴露完成方法给父组件
  useEffect(() => {
    if (isActive && stage === 'waiting' && progress >= 90) {
      // 当到达90%时，等待外部调用完成
      (window as Window & { completeProgress?: () => void }).completeProgress = completeProgress;
    }
  }, [stage, progress, isActive, completeProgress]);

  if (!isActive && progress === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">
          {stage === 'slow' && 'Analyzing image content...'}
      {stage === 'fast' && 'Detecting sensitive elements...'}
      {stage === 'waiting' && 'Generating compliant image...'}
      {stage === 'complete' && 'Processing complete!'}
        </span>
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-gray-200 dark:bg-gray-700"
      />
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {stage === 'slow' && '🔍 AI is deeply analyzing your image...'}
      {stage === 'fast' && '⚡ Quickly identifying potential risk elements...'}
      {stage === 'waiting' && '🎨 Carefully crafting compliant alternatives...'}
      {stage === 'complete' && '✅ All processing completed!'}
      </div>
    </div>
  );
}

// 导出完成进度条的方法
export const completeProgressBar = () => {
  const windowWithProgress = window as Window & { completeProgress?: () => void };
  if (windowWithProgress.completeProgress) {
    windowWithProgress.completeProgress();
  }
};