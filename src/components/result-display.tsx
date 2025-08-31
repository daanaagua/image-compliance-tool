'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
// import Image from 'next/image'; // 暂时不使用Next.js Image组件，因为它对SVG data URL支持有问题

interface ResultDisplayProps {
  generatedImage: string;
  onDownload: () => void;
  onStartOver: () => void;
  onBackToHome?: () => void;
}

export function ResultDisplay({ 
  generatedImage, 
  onDownload, 
  onStartOver,
  onBackToHome
}: ResultDisplayProps) {
  // 添加调试信息
  console.log('ResultDisplay - generatedImage:', generatedImage?.substring(0, 100) + '...');
  console.log('ResultDisplay - image type:', generatedImage?.split(',')[0]);
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">合规图片生成完成</CardTitle>
        <p className="text-center text-sm text-muted-foreground mt-2">
          图片类型: {generatedImage?.startsWith('data:image/svg+xml') ? 'SVG' : generatedImage?.startsWith('data:image/png') ? 'PNG' : '未知'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          {generatedImage ? (
            <img
              src={generatedImage}
              alt="生成的合规图片"
              className="w-full h-auto rounded-lg object-contain max-w-2xl mx-auto border"
              style={{ maxHeight: '600px' }}
              onLoad={() => console.log('Image loaded successfully')}
              onError={(e) => console.error('Image load error:', e)}
            />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              图片数据为空
            </div>
          )}
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button onClick={onDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            下载图片
          </Button>
          <Button 
            variant="outline" 
            onClick={onStartOver}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            重新开始
          </Button>
          {onBackToHome && (
            <Button 
              variant="outline" 
              onClick={onBackToHome}
              className="flex items-center gap-2"
            >
              返回主页
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}