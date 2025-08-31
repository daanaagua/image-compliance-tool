'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestSVGPage() {
  const [testImage, setTestImage] = useState<string>('');
  
  // 创建一个测试SVG
  const createTestSVG = () => {
    const svgContent = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad1)" />
        <circle cx="200" cy="150" r="50" fill="white" opacity="0.8" />
        <text x="200" y="160" font-family="Arial, sans-serif" font-size="20" fill="#333" text-anchor="middle">测试图片</text>
        <text x="200" y="200" font-family="Arial, sans-serif" font-size="14" fill="#666" text-anchor="middle">SVG格式显示测试</text>
      </svg>
    `;
    
    // 转换为base64 data URL
    const base64Svg = Buffer.from(svgContent).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
    
    console.log('生成的SVG data URL:', dataUrl.substring(0, 100) + '...');
    setTestImage(dataUrl);
  };
  
  // 测试API生成的图片格式
  const testAPIImage = async () => {
    try {
      // 创建一个简单的测试图片
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('TEST', 25, 55);
      }
      
      const testImageData = canvas.toDataURL();
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: testImageData, 
          suggestions: ['测试图片生成'] 
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('API返回的图片类型:', result.image?.substring(0, 50));
        setTestImage(result.image);
      } else {
        console.error('API调用失败:', response.status);
      }
    } catch (error) {
      console.error('测试API错误:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold">SVG图片显示测试</h1>
          <p className="text-muted-foreground mt-2">测试SVG图片在前端的显示效果</p>
        </header>
        
        <div className="flex gap-4 justify-center">
          <Button onClick={createTestSVG}>生成测试SVG</Button>
          <Button onClick={testAPIImage} variant="outline">测试API图片</Button>
          <Button onClick={() => setTestImage('')} variant="destructive">清除图片</Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>图片显示区域</CardTitle>
            {testImage && (
              <p className="text-sm text-muted-foreground">
                图片类型: {testImage.startsWith('data:image/svg+xml') ? 'SVG' : testImage.startsWith('data:image/png') ? 'PNG' : '其他'}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
              {testImage ? (
                <div className="space-y-4">
                  <img
                    src={testImage}
                    alt="测试图片"
                    className="max-w-full max-h-[400px] border rounded"
                    onLoad={() => console.log('图片加载成功')}
                    onError={(e) => {
                      console.error('图片加载失败:', e);
                      console.log('图片URL:', testImage.substring(0, 100));
                    }}
                  />
                  <div className="text-sm text-muted-foreground">
                    <p>数据长度: {testImage.length} 字符</p>
                    <p>前缀: {testImage.substring(0, 50)}...</p>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <p>点击上方按钮生成测试图片</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button onClick={() => window.location.href = '/'} variant="outline">
            返回主页
          </Button>
        </div>
      </div>
    </div>
  );
}