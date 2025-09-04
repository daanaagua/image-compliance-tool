// Mock implementation - Google GenAI import commented out to avoid unused variable warning
// import { GoogleGenAI } from '@google/genai';

// if (!process.env.GOOGLE_GEMINI_API_KEY) {
//   throw new Error('GOOGLE_GEMINI_API_KEY is not set');
// }

// const ai = new GoogleGenAI({
//   apiKey: process.env.GOOGLE_GEMINI_API_KEY
// });

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

export async function detectSensitiveElements(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _imageBase64: string
): Promise<DetectionResult> {
  // Temporarily return mock data to avoid API call issues
  console.log('🔍 Using mock data for detection...');
  
  // Mock detection results
  const mockResult: DetectionResult = {
    hasSensitiveContent: true,
    elements: [
      {
        id: 'mock-1',
        type: 'trademark',
        content: 'Detected possible trademark elements',
        location: 'Central area of image',
        riskLevel: 'medium',
        suggestion: 'Recommend blurring or replacing with generic icons'
      },
      {
        id: 'mock-2',
        type: 'product',
        content: 'Detected well-known product',
        location: 'Upper left corner of image',
        riskLevel: 'high',
        suggestion: 'Recommend complete removal or replacement with similar generic product'
      }
    ],
    overallRisk: 'high'
  };
  
  // Add delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockResult;
}

export async function generateCompliantImage(
  originalImageBase64: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _selectedSuggestions: string[]
): Promise<string> {
  console.log('🎨 Using mock data to generate compliant image...');
  
  // Simulate image generation delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return original image (in actual application, this would return the modified image)
  return originalImageBase64;
}