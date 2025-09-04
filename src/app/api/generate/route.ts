import { NextRequest, NextResponse } from 'next/server';
import { generateCompliantImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { image, suggestions } = await request.json();
    
    if (!image || !suggestions || !Array.isArray(suggestions)) {
      return NextResponse.json(
        { error: 'Please provide image data and modification suggestions' },
        { status: 400 }
      );
    }

    // 移除data:image/jpeg;base64,前缀
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const resultImageDataUrl = await generateCompliantImage(base64Data, suggestions);
    
    return NextResponse.json({ 
      image: resultImageDataUrl 
    });
  } catch (error) {
    console.error('生成API错误:', error);
    return NextResponse.json(
      { error: 'Generation failed, please try again' },
      { status: 500 }
    );
  }
}