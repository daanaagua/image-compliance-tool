import { GoogleGenAI } from '@google/genai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY
});

export interface SensitiveElement {
  id: string;
  type: 'trademark' | 'copyright' | 'product' | 'character' | 'artwork';
  content: string;
  location: string;
  riskLevel: 'high' | 'medium' | 'low';
  suggestion: string;
}

export interface DetectionResult {
  hasSensitiveContent: boolean;
  elements: SensitiveElement[];
  overallRisk: 'high' | 'medium' | 'low';
}

export async function detectSensitiveElements(imageBase64: string): Promise<DetectionResult> {
  // 临时返回模拟数据，避免API调用问题
  console.log('使用模拟数据进行检测...');
  
  // 模拟检测结果
  const mockResult: DetectionResult = {
    hasSensitiveContent: true,
    elements: [
      {
        id: 'mock-1',
        type: 'trademark',
        content: '检测到可能的商标标识',
        location: '图片中央区域',
        riskLevel: 'medium',
        suggestion: '建议模糊处理或替换为通用图标'
      },
      {
        id: 'mock-2',
        type: 'product',
        content: '检测到知名产品',
        location: '图片左上角',
        riskLevel: 'high',
        suggestion: '建议完全移除或替换为类似的通用产品'
      }
    ],
    overallRisk: 'high'
  };
  
  // 添加延迟模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockResult;
}

export async function generateCompliantImage(
  originalImageBase64: string,
  selectedSuggestions: string[]
): Promise<string> {
  console.log('使用模拟数据生成合规图片...');
  
  // 模拟图片生成延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 返回原图片（实际应用中这里会返回修改后的图片）
  return originalImageBase64;
}