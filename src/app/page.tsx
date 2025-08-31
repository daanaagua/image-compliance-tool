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

  const handleGenerateCompliantImage = async (selectedSuggestions: string[]): Promise<void> => {
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
      throw error; // 重新抛出错误以便进度条处理
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-12">
        <header className="text-center space-y-4 sm:space-y-6 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-3 sm:mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI图片工具站
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            专业的AI驱动图片处理平台，提供合规检测、智能生成、格式转换等一站式服务
          </p>
        </header>

        {/* SEO功能介绍 */}
        {state === 'upload' && (
          <div className="max-w-4xl mx-auto mb-12 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">🛡️ 智能合规检测</h3>
                <p className="text-gray-200 leading-relaxed">
                  采用先进的AI技术，自动识别图片中的敏感内容、版权侵权、不当元素等问题。支持多种图片格式，检测准确率高达95%以上，为您的内容安全保驾护航。
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">🎨 一键智能修复</h3>
                <p className="text-gray-200 leading-relaxed">
                  检测到问题后，AI会自动生成修复建议，并能一键生成符合规范的新图片。保持原图主要元素和构图，只修改问题部分，确保内容积极正面。
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">⚡ 快速高效处理</h3>
                <p className="text-gray-200 leading-relaxed">
                  平均检测时间仅需3-5秒，图片生成时间30秒内完成。支持批量处理，大幅提升工作效率，让内容审核变得简单快捷。
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">🔒 隐私安全保障</h3>
                <p className="text-gray-200 leading-relaxed">
                  所有图片处理均在安全环境中进行，不会保存或泄露您的图片内容。采用端到端加密传输，确保数据安全和用户隐私。
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">开始使用图片合规检测</h3>
              <p className="text-gray-300 mb-6">上传您的图片，让AI为您检测并修复合规问题</p>
            </div>
          </div>
        )}

        <main className="space-y-6 sm:space-y-8 px-2 sm:px-4">
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
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Button
                  onClick={handleStartDetection}
                  disabled={isDetecting}
                  size="lg"
                  className="px-6 sm:px-8 w-full sm:w-auto"
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
                  className="px-6 sm:px-8 w-full sm:w-auto"
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

        <footer className="text-center text-muted-foreground text-sm px-4">
          <p>Powered by Google Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}
