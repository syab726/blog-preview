'use client';

import { useState } from 'react';

interface Post {
  id: string;
  title: string;
  body: string;
  hashtags: string[];
  images: string[];
  createdAt: string;
  expiresAt: string;
}

export default function PostAccordion({ post }: { post: Post }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const createdDate = new Date(post.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 본문 HTML 변환 (네이버 블로그 호환)
  const convertToNaverHtml = () => {
    let html = post.body;
    let imageIndex = 0;

    // 이미지 태그를 실제 이미지로 교체 (네이버 호환 크기: 500px)
    const imageTagPattern = /\*\*\[이미지:\s*([^\]]+)\]\*\*/g;
    html = html.replace(imageTagPattern, () => {
      if (imageIndex < post.images.length) {
        const imgUrl = post.images[imageIndex];
        imageIndex++;
        return `<p style="text-align:center;"><img src="${imgUrl}" alt="관상 이미지" style="max-width:500px; width:100%; height:auto;" /></p>`;
      }
      return '';
    });

    // 마크다운 → HTML 변환 (검정 글자, 네이버 호환)
    html = html
      .replace(/^## (.+)$/gm, '<h2 style="font-size:22px; font-weight:bold; color:#000; margin:30px 0 15px; padding-bottom:10px; border-bottom:1px solid #eee;">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="font-size:18px; font-weight:bold; color:#000; margin:25px 0 12px;">$1</h3>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#000;">$1</strong>')
      .replace(/^- (.+)$/gm, '<p style="color:#000; margin:8px 0 8px 20px;">• $1</p>')
      .replace(/\n\n/g, '</p><p style="color:#000; line-height:1.8; margin:15px 0;">')
      .replace(/\n/g, '<br/>');

    return html;
  };

  const handleCopy = () => {
    const content = document.getElementById(`copy-content-${post.id}`);
    if (content) {
      const range = document.createRange();
      range.selectNodeContents(content);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('copy');
      selection?.removeAllRanges();
      alert('복사되었습니다! 네이버 블로그에 붙여넣기 하세요.');
    }
  };

  const handleComplete = async () => {
    if (!confirm('게시 완료하셨나요? 5일 후 이 콘텐츠가 삭제됩니다.')) {
      return;
    }

    setIsCompleting(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/complete`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsDeleted(true);
        alert('완료 처리되었습니다. 5일 후 자동 삭제됩니다.');
      } else {
        alert('오류가 발생했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  const bodyHtml = convertToNaverHtml();

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      marginBottom: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {/* 헤더 (클릭하여 토글) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '18px 20px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isOpen ? '1px solid #eee' : 'none',
          backgroundColor: isOpen ? '#fafafa' : '#fff'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1em', color: '#333' }}>{post.title}</h2>
          <p style={{ margin: '5px 0 0', fontSize: '0.85em', color: '#888' }}>
            생성일: {createdDate}
          </p>
        </div>
        <span style={{
          fontSize: '1.2em',
          color: '#666',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {/* 콘텐츠 (펼쳤을 때) */}
      {isOpen && (
        <div style={{ padding: '20px' }}>
          {/* 버튼 영역 */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: '#03C75A',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1em',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              전체 복사하기
            </button>
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: isCompleting ? '#ccc' : '#5c6bc0',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1em',
                fontWeight: 'bold',
                cursor: isCompleting ? 'not-allowed' : 'pointer'
              }}
            >
              {isCompleting ? '처리중...' : '게시 완료'}
            </button>
          </div>

          {/* 복사할 콘텐츠 영역 */}
          <div
            id={`copy-content-${post.id}`}
            style={{
              border: '2px dashed #ddd',
              padding: '30px',
              backgroundColor: '#fff',
              borderRadius: '8px'
            }}
          >
            {/* 제목 */}
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#000',
              marginBottom: '30px',
              lineHeight: '1.4'
            }}>
              {post.title}
            </h1>

            {/* 본문 */}
            <div
              style={{ color: '#000', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: `<p style="color:#000; line-height:1.8; margin:15px 0;">${bodyHtml}</p>` }}
            />

            {/* 해시태그 */}
            <div style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid #eee',
              color: '#03C75A',
              fontWeight: 'bold',
              fontSize: '15px'
            }}>
              {post.hashtags.map((tag: string) => `#${tag}`).join(' ')}
            </div>

            {/* CTA - 텍스트 링크 형식 (네이버 호환) */}
            <div style={{
              textAlign: 'center',
              marginTop: '40px',
              padding: '30px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '15px'
              }}>
                나의 얼굴에 숨겨진 운명이 궁금하다면?
              </p>
              <p style={{ margin: 0 }}>
                <a
                  href="https://facewisdom-ai.xyz?utm_source=naver_blog&utm_medium=organic&utm_campaign=blog_cta"
                  style={{
                    display: 'inline-block',
                    padding: '15px 40px',
                    backgroundColor: '#03C75A',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  ▶ AI 관상 무료 분석 받기
                </a>
              </p>
              <p style={{
                marginTop: '10px',
                fontSize: '13px',
                color: '#888'
              }}>
                facewisdom-ai.xyz
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
