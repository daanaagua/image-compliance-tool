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
    
    console.log('开始检测图片，图片数据长度:', base64Data.length);
    
    const result = await detectSensitiveElements(base64Data);
    
    console.log('检测结果:', JSON.stringify(result, null, 2));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('检测API错误:', error);
    return NextResponse.json(
      { error: '检测失败，请重试' },
      { status: 500 }
    );
  }
}