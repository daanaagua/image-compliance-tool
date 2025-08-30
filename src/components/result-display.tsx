'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import Image from 'next/image';

interface ResultDisplayProps {
  generatedImage: string;
  onDownload: () => void;
  onStartOver: () => void;
}

export function ResultDisplay({ 
  generatedImage, 
  onDownload, 
  onStartOver 
}: ResultDisplayProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">合规图片生成完成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Image
            src={generatedImage}
            alt="生成的合规图片"
            width={800}
            height={600}
            className="w-full h-auto rounded-lg object-contain"
          />
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
        </div>
      </CardContent>
    </Card>
  );
}