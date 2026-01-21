import { list, put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { blobs } = await list({ prefix: `posts/${id}/` });
    const metaBlob = blobs.find(b => b.pathname.endsWith('meta.json'));

    if (!metaBlob) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 기존 메타데이터 읽기
    const res = await fetch(metaBlob.url);
    const post = await res.json();

    // 만료일을 5일 후로 변경
    const newExpiresAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    post.expiresAt = newExpiresAt.toISOString();
    post.completedAt = new Date().toISOString();

    // 업데이트된 메타데이터 저장
    await put(
      `posts/${id}/meta.json`,
      JSON.stringify(post),
      { access: 'public', contentType: 'application/json' }
    );

    return NextResponse.json({
      success: true,
      expiresAt: newExpiresAt.toISOString()
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
