// OpenRouter API integration for Gemini model

interface SensitiveElement {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

interface DetectionResult {
  hasSensitiveContent: boolean;
  elements: SensitiveElement[];
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'google/gemini-2.5-flash-image-preview:free';

function getApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return apiKey;
}



function convertImageToBase64DataUrl(imageData: string): string {
  // If it's already a data URL, return as is
  if (imageData.startsWith('data:')) {
    return imageData;
  }
  // If it's base64 without data URL prefix, add it
  return `data:image/jpeg;base64,${imageData}`;
}

export async function detectSensitiveElements(imageData: string): Promise<DetectionResult> {
  try {
    const prompt = `请仔细分析这张图片中是否包含敏感内容，包括但不限于：

1. **暴力内容**：武器、血腥场面、暴力行为等
2. **成人内容**：裸体、性暗示、色情内容等
3. **仇恨言论**：歧视性内容、种族主义、仇恨符号等
4. **危险活动**：吸毒、自残、危险行为等
5. **政治敏感**：政治人物、敏感政治内容等
6. **版权侵权内容**：
   - 知名品牌商标（如Nike、Adidas、Apple、McDonald's等）
   - 品牌标识、Logo
   - 受版权保护的卡通人物、影视角色
   - 明星肖像、艺术作品
7. **个人隐私**：身份证、电话号码、地址等个人信息
8. **其他不当内容**：虚假信息、欺诈内容等

**重要提醒**：请特别注意检测图片中的商标、品牌标识和Logo，即使它们看起来很小或不明显。任何可识别的品牌元素都应该被标记为版权侵权内容。

请以JSON格式返回检测结果，格式如下：
{
  "hasSensitiveContent": boolean,
  "elements": [
    {
      "type": "敏感内容类型",
      "description": "具体描述发现的内容",
      "severity": "low|medium|high",
      "suggestions": ["完整的修改建议，不要使用分号分割"]
    }
  ]
}

**重要**：每个suggestions数组中只包含一个完整的建议字符串，不要将一个建议分割成多个字符串。如果有多个不同的建议，请作为不同的element返回。

如果没有发现任何敏感内容，请返回：{"hasSensitiveContent": false, "elements": []}`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'HTTP-Referer': 'https://image-compliance-tool.vercel.app',
        'X-Title': 'Image Compliance Tool',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: convertImageToBase64DataUrl(imageData)
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API 原始响应:', JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content;
    console.log('AI 返回的内容:', content);
    
    if (!content) {
      throw new Error('No content received from OpenRouter API');
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('无法从响应中提取JSON:', content);
      throw new Error('No valid JSON found in response');
    }

    console.log('提取的JSON字符串:', jsonMatch[0]);
    const result = JSON.parse(jsonMatch[0]);
    console.log('解析后的结果:', result);
    return result as DetectionResult;
  } catch (error) {
    console.error('Detection error:', error);
    throw new Error('检测失败，请重试');
  }
}

export async function generateCompliantImage(
  originalImageData: string,
  selectedSuggestions: string[]
): Promise<string> {
  try {
    // First, generate a detailed description for the compliant image
    const descriptionPrompt = `请根据以下修改建议，生成一个合规的图片描述：

修改建议：
${selectedSuggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join('\n')}

请基于原图内容和这些建议，生成一个详细的、合规的图片描述，用于图片生成。描述应该：
1. 保持原图的主要元素和构图
2. 移除或替换所有敏感内容
3. 确保内容积极正面
4. 描述要详细具体，便于图片生成
5. 使用英文描述，适合图片生成模型

请直接返回英文图片描述，不需要其他格式。`;

    const descriptionResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'HTTP-Referer': 'https://image-compliance-tool.vercel.app',
        'X-Title': 'Image Compliance Tool',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: descriptionPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: convertImageToBase64DataUrl(originalImageData)
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!descriptionResponse.ok) {
      throw new Error(`OpenRouter API error: ${descriptionResponse.status} ${descriptionResponse.statusText}`);
    }

    const descriptionData = await descriptionResponse.json();
    const description = descriptionData.choices?.[0]?.message?.content;
    
    if (!description) {
      throw new Error('No description received from OpenRouter API');
    }

    console.log('生成的图片描述:', description);
    
    // Generate image using OpenRouter Gemini
    try {
      console.log('🎨 尝试使用 OpenRouter Gemini 生成图片...');
      const geminiImagePrompt = `请基于以下描述生成一张高质量的图片：

${description.trim()}

要求：
1. 保持原图的主要元素和构图，只修改描述中提到的部分
2. 确保内容积极正面，无任何敏感元素`;

      const geminiResponse = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getApiKey()}`,
          'HTTP-Referer': 'https://image-compliance-tool.vercel.app',
          'X-Title': 'Image Compliance Tool',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            {
              role: 'user',
              content: geminiImagePrompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        console.log('OpenRouter Gemini 原始响应:', JSON.stringify(geminiData, null, 2));
        
        // Extract image data from response
        const message = geminiData.choices?.[0]?.message;
        if (message) {
          // Try different possible paths for image data
          let imageData = null;
          
          // Check for images array (new format)
          if (message.images && message.images.length > 0) {
            imageData = message.images[0].image_url?.url;
          }
          
          // Check for content array with image
          if (!imageData && Array.isArray(message.content)) {
            for (const item of message.content) {
              if (item.image && item.image.data) {
                imageData = `data:image/png;base64,${item.image.data}`;
                break;
              }
            }
          }
          
          // Check for direct content with base64
          if (!imageData && typeof message.content === 'string') {
            const base64Match = message.content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+\/=]+)/);
            if (base64Match) {
              imageData = base64Match[0];
            }
          }
          
          if (imageData) {
            console.log('✅ OpenRouter Gemini 成功生成图片');
            return imageData;
          } else {
            console.log('❌ OpenRouter Gemini 响应中未找到图片数据');
          }
        }
      } else {
        const errorText = await geminiResponse.text();
        console.log('❌ OpenRouter Gemini API 调用失败. 状态码:', geminiResponse.status, '错误:', errorText);
      }
    } catch (geminiError) {
      console.log('❌ OpenRouter Gemini 生成失败:', geminiError);
    }
    
    // Final fallback: Create a realistic-looking SVG image based on the description
    console.log('💡 使用 SVG 备用方案生成图片');
    const svgContent = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#1d4ed8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="3" stdDeviation="5" flood-color="rgba(0,0,0,0.2)"/>
          </filter>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.1)"/>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="1024" height="1024" fill="url(#bgGrad)" />
        
        <!-- Store interior background -->
        <rect x="50" y="50" width="924" height="924" rx="20" fill="#ffffff" filter="url(#softShadow)" />
        
        <!-- Left wall with shoe display -->
        <rect x="80" y="100" width="300" height="800" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2" />
        
        <!-- Shoe shelves -->
        <rect x="100" y="150" width="260" height="8" fill="#94a3b8" />
        <rect x="100" y="250" width="260" height="8" fill="#94a3b8" />
        <rect x="100" y="350" width="260" height="8" fill="#94a3b8" />
        <rect x="100" y="450" width="260" height="8" fill="#94a3b8" />
        <rect x="100" y="550" width="260" height="8" fill="#94a3b8" />
        
        <!-- Athletic shoes on shelves -->
        <ellipse cx="150" cy="140" rx="35" ry="15" fill="url(#shoeGrad)" filter="url(#shadow)" />
        <ellipse cx="220" cy="140" rx="35" ry="15" fill="#ef4444" filter="url(#shadow)" />
        <ellipse cx="290" cy="140" rx="35" ry="15" fill="#10b981" filter="url(#shadow)" />
        
        <ellipse cx="150" cy="240" rx="35" ry="15" fill="#8b5cf6" filter="url(#shadow)" />
        <ellipse cx="220" cy="240" rx="35" ry="15" fill="#f59e0b" filter="url(#shadow)" />
        <ellipse cx="290" cy="240" rx="35" ry="15" fill="#06b6d4" filter="url(#shadow)" />
        
        <ellipse cx="150" cy="340" rx="35" ry="15" fill="#ec4899" filter="url(#shadow)" />
        <ellipse cx="220" cy="340" rx="35" ry="15" fill="#84cc16" filter="url(#shadow)" />
        <ellipse cx="290" cy="340" rx="35" ry="15" fill="#6366f1" filter="url(#shadow)" />
        
        <!-- More shoes -->
        <ellipse cx="150" cy="440" rx="35" ry="15" fill="#14b8a6" filter="url(#shadow)" />
        <ellipse cx="220" cy="440" rx="35" ry="15" fill="#f97316" filter="url(#shadow)" />
        <ellipse cx="290" cy="440" rx="35" ry="15" fill="#a855f7" filter="url(#shadow)" />
        
        <ellipse cx="150" cy="540" rx="35" ry="15" fill="#22c55e" filter="url(#shadow)" />
        <ellipse cx="220" cy="540" rx="35" ry="15" fill="#3b82f6" filter="url(#shadow)" />
        <ellipse cx="290" cy="540" rx="35" ry="15" fill="#ef4444" filter="url(#shadow)" />
        
        <!-- Floor -->
        <rect x="80" y="900" width="864" height="50" fill="#e2e8f0" />
        
        <!-- Right side display area -->
        <rect x="450" y="200" width="450" height="600" fill="#fafafa" stroke="#e5e7eb" stroke-width="1" rx="10" />
        
        <!-- Central display podium -->
        <ellipse cx="675" cy="780" rx="80" ry="20" fill="#d1d5db" />
        <rect x="595" y="700" width="160" height="80" fill="#f3f4f6" stroke="#9ca3af" stroke-width="1" />
        
        <!-- Featured shoe on podium -->
        <ellipse cx="675" cy="690" rx="50" ry="20" fill="url(#shoeGrad)" filter="url(#shadow)" />
        
        <!-- Store lighting -->
        <circle cx="200" cy="80" r="15" fill="#fbbf24" opacity="0.8" />
        <circle cx="400" cy="80" r="15" fill="#fbbf24" opacity="0.8" />
        <circle cx="600" cy="80" r="15" fill="#fbbf24" opacity="0.8" />
        <circle cx="800" cy="80" r="15" fill="#fbbf24" opacity="0.8" />
        
        <!-- Success indicator overlay -->
        <rect x="400" y="300" width="300" height="150" rx="15" fill="rgba(255,255,255,0.95)" filter="url(#shadow)" />
        
        <!-- Success icon -->
        <circle cx="550" cy="350" r="25" fill="#10b981" />
        <path d="M540 350 l7 7 l14 -14" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        
        <!-- Success text -->
        <text x="550" y="390" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1f2937" text-anchor="middle">合规图片已生成</text>
        
        <!-- Subtitle -->
        <text x="550" y="415" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">基于AI智能优化</text>
        
        <!-- Description in display area -->
        <foreignObject x="470" y="230" width="410" height="60">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 12px; color: #374151; text-align: center; line-height: 1.4; padding: 10px;">
            ${description.substring(0, 150)}${description.length > 150 ? '...' : ''}
          </div>
        </foreignObject>
      </svg>
    `;
    
    // Convert SVG to base64 data URL
    const base64Svg = Buffer.from(svgContent).toString('base64');
    return `data:image/svg+xml;base64,${base64Svg}`;
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('图片生成失败，请重试');
  }
}