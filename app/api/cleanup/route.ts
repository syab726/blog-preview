import { list, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: 'posts/' });
    const metaBlobs = blobs.filter(b => b.pathname.endsWith('meta.json'));

    let deletedCount = 0;
    const now = new Date();

    for (const metaBlob of metaBlobs) {
      const res = await fetch(metaBlob.url);
      const post = await res.json();

      if (new Date(post.expiresAt) < now) {
        const postId = post.id;
        const { blobs: postBlobs } = await list({ prefix: `posts/${postId}/` });

        for (const blob of postBlobs) {
          await del(blob.url);
        }
        deletedCount++;
      }
    }

    return NextResponse.json({ success: true, deletedCount });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
