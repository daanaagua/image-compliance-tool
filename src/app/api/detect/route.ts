import { NextRequest, NextResponse } from 'next/server';
import { detectSensitiveElements } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: '请提供图片数据' },
        { status: 400 }
      );
    }

    // 移除data:image/jpeg;base64,前缀
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    const result = await detectSensitiveElements(base64Data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('检测API错误:', error);
    return NextResponse.json(
      { error: '检测失败，请重试' },
      { status: 500 }
    );
  }
}