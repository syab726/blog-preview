import { list } from '@vercel/blob';
import { notFound } from 'next/navigation';
import CopyButton from './CopyButton';

async function getPost(id: string) {
  try {
    const { blobs } = await list({ prefix: `posts/${id}/` });
    const metaBlob = blobs.find(b => b.pathname.endsWith('meta.json'));

    if (!metaBlob) return null;

    const res = await fetch(metaBlob.url, { cache: 'no-store' });
    return res.json();
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const expiresAt = new Date(post.expiresAt);
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // 본문에서 이미지 태그를 실제 이미지로 교체
  let bodyHtml = post.body;
  const imageTagPattern = /\*\*\[이미지:\s*([^\]]+)\]\*\*/g;
  let imageIndex = 0;

  bodyHtml = bodyHtml.replace(imageTagPattern, () => {
    if (imageIndex < post.images.length) {
      const imgUrl = post.images[imageIndex];
      imageIndex++;
      return `<img src="${imgUrl}" alt="관상 이미지" style="max-width:100%; height:auto; display:block; margin:20px auto;" />`;
    }
    return '';
  });

  // 마크다운 기본 변환
  bodyHtml = bodyHtml
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.5em; font-weight:bold; margin:24px 0 12px;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.25em; font-weight:bold; margin:20px 0 10px;">$1</h3>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin:12px 0;">')
    .replace(/\n/g, '<br/>');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 상단 안내 */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <strong>임시 페이지</strong> - {daysLeft}일 후 자동 삭제됩니다.
        <br />
        <small>아래 내용을 전체 선택(Ctrl+A) 후 복사(Ctrl+C)하여 네이버 블로그에 붙여넣기 하세요.</small>
      </div>

      {/* 복사할 콘텐츠 영역 */}
      <div
        id="copy-content"
        style={{
          border: '2px dashed #ccc',
          padding: '30px',
          background: '#fff'
        }}
      >
        {/* 제목 */}
        <h1 style={{
          fontSize: '2em',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          {post.title}
        </h1>

        {/* 본문 */}
        <div
          dangerouslySetInnerHTML={{ __html: `<p style="margin:12px 0;">${bodyHtml}</p>` }}
        />

        {/* 해시태그 */}
        <div style={{
          marginTop: '30px',
          color: '#1a73e8',
          fontWeight: 'bold'
        }}>
          {post.hashtags.map((tag: string) => `#${tag}`).join(' ')}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a
            href="https://facewisdom-ai.xyz?utm_source=naver_blog&utm_medium=organic&utm_campaign=blog_cta"
            style={{
              display: 'inline-block',
              background: '#2563eb',
              color: 'white',
              padding: '15px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1em'
            }}
          >
            AI 관상 분석 받아보기
          </a>
          <p style={{ color: '#666', marginTop: '10px', fontSize: '0.9em' }}>
            나의 얼굴에 숨겨진 운명이 궁금하다면?
          </p>
        </div>
      </div>

      {/* 복사 버튼 */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <CopyButton />
      </div>
    </div>
  );
}
