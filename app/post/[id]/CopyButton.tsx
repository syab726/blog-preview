'use client';

import { useState } from 'react';

export default function CopyButton() {
  const [isMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
    return false;
  });

  // PC용 복사 (기존 방식 - HTML+이미지 포함)
  const handleCopyPC = () => {
    const content = document.getElementById('copy-content');
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

  // 모바일용 복사 (Clipboard API 사용)
  const handleCopyMobile = async () => {
    const content = document.getElementById('copy-content');
    if (!content) return;

    try {
      // HTML 형식으로 복사 시도
      const htmlContent = content.innerHTML;
      const textContent = content.innerText;

      // ClipboardItem 지원 여부 확인
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([textContent], { type: 'text/plain' });

        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob
          })
        ]);

        alert('복사되었습니다!\n\n네이버 블로그 앱에서 붙여넣기 하세요.\n(이미지가 안 보이면 PC에서 다시 시도해주세요)');
      } else {
        // 폴백: 텍스트만 복사
        await navigator.clipboard.writeText(textContent);
        alert('텍스트만 복사되었습니다.\n\n이미지 포함 복사는 PC에서 해주세요.');
      }
    } catch (error) {
      console.error('복사 실패:', error);
      // 최후의 폴백
      handleCopyPC();
    }
  };

  const handleCopy = () => {
    if (isMobile) {
      handleCopyMobile();
    } else {
      handleCopyPC();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
      <button
        onClick={handleCopy}
        style={{
          background: '#22c55e',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1em',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        전체 내용 복사하기
      </button>

      {isMobile && (
        <p style={{
          color: '#666',
          fontSize: '0.85em',
          margin: 0,
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          모바일에서는 이미지가 복사되지 않을 수 있습니다.<br/>
          이미지 포함 복사는 <strong>PC</strong>에서 해주세요.
        </p>
      )}
    </div>
  );
}
