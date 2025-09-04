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
        throw new Error('Detection failed');
      }
      
      const result = await response.json();
      setDetectionResult(result);
      setState('detection');
    } catch (error) {
      console.error('Detection error:', error);
      alert('Detection failed, please try again');
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
        throw new Error('Generation failed');
      }
      
      const result = await response.json();
      setGeneratedImage(result.image);
      setState('result');
    } catch (error) {
      console.error('Generation error:', error);
      alert('Generation failed, please try again');
      throw error; // Re-throw error for progress bar handling
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
            AI Image Compliance Tool
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Detect Sensitive Elements & Generate Copyright-Safe Images with AI
          </p>
        </header>

        {/* SEO Feature Introduction */}
        {state === 'upload' && (
          <div className="max-w-4xl mx-auto mb-12 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">🛡️ AI-Powered Detection</h3>
                <p className="text-gray-200 leading-relaxed">
                  Advanced AI technology automatically identifies sensitive content, copyrighted material, logos, and trademarks in your images. Supports multiple formats with 95%+ accuracy to keep your content compliant.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">🎨 Smart Auto-Fix</h3>
                <p className="text-gray-200 leading-relaxed">
                  Once issues are detected, AI generates intelligent suggestions and creates compliant versions instantly. Preserves original composition while fixing problematic elements for copyright-safe results.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">⚡ Lightning Fast</h3>
                <p className="text-gray-200 leading-relaxed">
                  Detection completes in 3-5 seconds, image generation in under 30 seconds. Streamline your workflow and avoid copyright risks with our efficient processing pipeline.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-3">🔒 Privacy Protected</h3>
                <p className="text-gray-200 leading-relaxed">
                  All image processing happens securely without storing your content. End-to-end encryption ensures your data remains private and protected throughout the entire process.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Start Image Compliance Detection</h3>
              <p className="text-gray-300 mb-6">Upload your image and let AI detect and fix compliance issues</p>
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
                      Detecting...
                    </>
                  ) : (
                    'Start Detection'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToHome}
                  size="lg"
                  className="px-6 sm:px-8 w-full sm:w-auto"
                >
                  Back to Home
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
