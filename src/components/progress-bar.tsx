'use client';

import { useEffect, useState, useCallback } from 'react';
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

    let interval: NodeJS.Timeout | null = null;

    // Stage 1: Slow progress (0% -> 15%)
    if (stage === 'slow' && progress < 15) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 2 + 0.5; // 0.5-2.5% each time
          if (newProgress >= 15) {
            setStage('fast');
            return 15;
          }
          return newProgress;
        });
      }, 200); // Update every 200ms
    }
    // Stage 2: Fast progress (15% -> 75%)
    else if (stage === 'fast' && progress < 75) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 8 + 5; // 5-13% each time
          if (newProgress >= 75) {
            setStage('waiting');
            return 75;
          }
          return newProgress;
        });
      }, 100); // Update every 100ms, faster
    }
    // Stage 3: Slow to 90% (75% -> 90%)
    else if (stage === 'waiting' && progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 1 + 0.2; // 0.2-1.2% each time
          if (newProgress >= 90) {
            return 90;
          }
          return newProgress;
        });
      }, 300); // Update every 300ms, very slow
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, stage, progress]);

  // External call to complete progress bar
  const completeProgress = useCallback(() => {
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
    }, 50); // Quickly complete the last 10%
  }, [onComplete]);

  // Expose completion method to parent component
  useEffect(() => {
    if (isActive && stage === 'waiting' && progress >= 90) {
      // When reaching 90%, wait for external call to complete
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

// Export method to complete progress bar
export const completeProgressBar = () => {
  const windowWithProgress = window as Window & { completeProgress?: () => void };
  if (windowWithProgress.completeProgress) {
    windowWithProgress.completeProgress();
  }
};