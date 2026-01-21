import { list } from '@vercel/blob';
import PostAccordion from './components/PostAccordion';

interface Post {
  id: string;
  title: string;
  body: string;
  hashtags: string[];
  images: string[];
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
    <main style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px 30px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '1.5em', marginBottom: '5px', color: '#333' }}>블로그 콘텐츠 관리</h1>
        <p style={{ color: '#666', margin: 0, fontSize: '0.9em' }}>
          클릭하여 펼치고 → 복사 → 네이버 블로그에 붙여넣기 → 완료 버튼
        </p>
      </div>

      {posts.length === 0 ? (
        <div style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#999', fontSize: '1.1em' }}>등록된 콘텐츠가 없습니다.</p>
        </div>
      ) : (
        <div>
          {posts.map((post: Post) => (
            <PostAccordion key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
