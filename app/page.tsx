import Link from 'next/link';
import { list } from '@vercel/blob';

interface Post {
  id: string;
  title: string;
  createdAt: string;
  expiresAt: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const { blobs } = await list({ prefix: 'posts/' });
    const metaBlobs = blobs.filter(b => b.pathname.endsWith('meta.json'));

    const posts = await Promise.all(
      metaBlobs.map(async (blob) => {
        const res = await fetch(blob.url, { cache: 'no-store' });
        return res.json();
      })
    );

    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return posts;
  } catch {
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '10px' }}>블로그 미리보기</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        네이버 블로그에 복사할 콘텐츠 임시 저장소
      </p>

      {posts.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#666' }}>등록된 포스트가 없습니다.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post: Post) => {
            const daysLeft = Math.ceil(
              (new Date(post.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <li key={post.id} style={{
                border: '1px solid #ddd',
                padding: '20px',
                marginBottom: '15px',
                borderRadius: '8px',
                background: '#fff'
              }}>
                <Link href={`/post/${post.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                  <h2 style={{ margin: 0, fontSize: '1.3em' }}>{post.title}</h2>
                  <p style={{ color: '#666', margin: '10px 0 0', fontSize: '0.9em' }}>
                    생성: {new Date(post.createdAt).toLocaleDateString('ko-KR')} |
                    <span style={{ color: daysLeft <= 2 ? '#dc2626' : '#666' }}>
                      {' '}{daysLeft}일 후 삭제
                    </span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
