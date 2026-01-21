import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { postId, imageIndex, imageData } = await request.json();

    if (!postId || imageIndex === undefined || !imageData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // base64 데이터에서 prefix 제거
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Vercel Blob에 업로드
    const blob = await put(`posts/${postId}/image-${imageIndex + 1}.png`, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      imageIndex,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Image upload error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
