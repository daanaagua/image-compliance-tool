'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/image-upload';
import { SensitiveElements } from '@/components/sensitive-elements';
import { ResultDisplay } from '@/components/result-display';
import { Button } from '@/components/ui/button';
import { DetectionResult } from '@/lib/gemini';

type AppState = 'upload' | 'ready' | 'detection' | 'result';

export default function Home() {
  const [state, setState] = useState<AppState>('upload');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (file: File, dataUrl: string) => {
    setUploadedImage(dataUrl);
    setState('ready');
  };

  const handleStartDetection = async () => {
    setIsDetecting(true);
    
    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: uploadedImage }),
      });
      
      if (!response.ok) {
        throw new Error('检测失败');
      }
      
      const result = await response.json();
      setDetectionResult(result);
      setState('detection');
    } catch (error) {
      console.error('检测错误:', error);
      alert('检测失败，请重试');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleGenerateCompliantImage = async (selectedSuggestions: string[]) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: uploadedImage, 
          suggestions: selectedSuggestions 
        }),
      });
      
      if (!response.ok) {
        throw new Error('生成失败');
      }
      
      const result = await response.json();
      setGeneratedImage(result.image);
      setState('result');
    } catch (error) {
      console.error('生成错误:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `compliant-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartOver = () => {
    setState('upload');
    setUploadedImage('');
    setDetectionResult(null);
    setGeneratedImage('');
  };

  const handleBackToHome = () => {
    setState('upload');
    setUploadedImage('');
    setDetectionResult(null);
    setGeneratedImage('');
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    setState('upload');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            图片合规检测工具
          </h1>
          <p className="text-xl text-muted-foreground">
            使用AI检测敏感元素，一键生成合规图片
          </p>
        </header>

        <main className="space-y-8">
          {state === 'upload' && (
            <ImageUpload
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onRemoveImage={handleRemoveImage}
              isLoading={isDetecting}
            />
          )}

          {state === 'ready' && uploadedImage && (
            <div className="space-y-6">
              <ImageUpload
                onImageUpload={handleImageUpload}
                uploadedImage={uploadedImage}
                onRemoveImage={handleRemoveImage}
                isLoading={isDetecting}
              />
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleStartDetection}
                  disabled={isDetecting}
                  size="lg"
                  className="px-8"
                >
                  {isDetecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      检测中...
                    </>
                  ) : (
                    '开始检测'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToHome}
                  size="lg"
                  className="px-8"
                >
                  返回主页
                </Button>
              </div>
            </div>
          )}

          {state === 'detection' && detectionResult && (
            <SensitiveElements
              detectionResult={detectionResult}
              onGenerateCompliantImage={handleGenerateCompliantImage}
              isGenerating={isGenerating}
              onBackToHome={handleBackToHome}
            />
          )}

          {state === 'result' && generatedImage && (
            <ResultDisplay
              generatedImage={generatedImage}
              onDownload={handleDownload}
              onStartOver={handleStartOver}
              onBackToHome={handleBackToHome}
            />
          )}
        </main>

        <footer className="text-center text-muted-foreground">
          <p>Powered by Google Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}
