import { list, del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
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

    const res = await fetch(metaBlob.url);
    const post = await res.json();

    return NextResponse.json({ post });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { blobs } = await list({ prefix: `posts/${id}/` });

    for (const blob of blobs) {
      await del(blob.url);
    }

    return NextResponse.json({ success: true, deleted: blobs.length });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
