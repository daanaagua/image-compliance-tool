'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import Image from 'next/image';

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
        <CardTitle className="text-center">Compliant Image Generated</CardTitle>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Image type: {generatedImage?.startsWith('data:image/svg+xml') ? 'SVG' : generatedImage?.startsWith('data:image/png') ? 'PNG' : 'Unknown'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          {generatedImage ? (
            <div className="relative w-full max-w-2xl mx-auto" style={{ maxHeight: '600px' }}>
              <Image
                src={generatedImage}
                alt="Generated compliant image"
                width={800}
                height={600}
                className="w-full h-auto rounded-lg object-contain border"
                unoptimized
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => console.error('Image load error:', e)}
              />
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              Image data is empty
            </div>
          )}
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button onClick={onDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Image
          </Button>
          <Button 
            variant="outline" 
            onClick={onStartOver}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
          {onBackToHome && (
            <Button 
              variant="outline" 
              onClick={onBackToHome}
              className="flex items-center gap-2"
            >
              Back to Home
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}