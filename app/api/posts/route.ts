import { put, list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, body, hashtags, images, topicId } = await request.json();

    const postId = `${topicId}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageBuffer = Buffer.from(images[i].data, 'base64');
        const blob = await put(`posts/${postId}/image-${i + 1}.jpg`, imageBuffer, {
          access: 'public',
          contentType: 'image/jpeg',
        });
        imageUrls.push(blob.url);
      }
    }

    const metadata = {
      id: postId,
      title,
      body,
      hashtags,
      images: imageUrls,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    await put(
      `posts/${postId}/meta.json`,
      JSON.stringify(metadata),
      { access: 'public', contentType: 'application/json' }
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    return NextResponse.json({
      success: true,
      id: postId,
      url: `${baseUrl}/post/${postId}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Post creation error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'posts/' });
    const metaBlobs = blobs.filter(b => b.pathname.endsWith('meta.json'));

    const posts = await Promise.all(
      metaBlobs.map(async (blob) => {
        const res = await fetch(blob.url);
        return res.json();
      })
    );

    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
