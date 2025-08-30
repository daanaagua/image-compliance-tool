import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
export const imageModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

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
  const prompt = `请仔细分析这张图片，检测其中可能存在的敏感元素，包括：
1. 商标和品牌标识
2. 版权文字或标识
3. 知名产品或角色
4. 受保护的艺术作品片段

请以JSON格式返回检测结果，格式如下：
{
  "hasSensitiveContent": boolean,
  "elements": [
    {
      "id": "unique_id",
      "type": "trademark|copyright|product|character|artwork",
      "content": "具体内容描述",
      "location": "位置描述",
      "riskLevel": "high|medium|low",
      "suggestion": "修改建议"
    }
  ],
  "overallRisk": "high|medium|low"
}`;

  try {
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // 提取JSON部分
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析检测结果');
    }

    return JSON.parse(jsonMatch[0]) as DetectionResult;
  } catch (error) {
    console.error('检测敏感元素时出错:', error);
    throw new Error('检测失败，请重试');
  }
}

export async function generateCompliantImage(
  originalImageBase64: string,
  selectedSuggestions: string[]
): Promise<string> {
  const prompt = `请根据以下修改建议，对图片进行修改以确保合规：
${selectedSuggestions.join('\n')}

请生成一张修改后的图片，确保移除或替换所有敏感元素。`;

  try {
    const result = await imageModel.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: originalImageBase64,
        },
      },
    ]);

    const response = await result.response;
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error('未能生成图片');
  } catch (error) {
    console.error('生成合规图片时出错:', error);
    throw new Error('生成失败，请重试');
  }
}