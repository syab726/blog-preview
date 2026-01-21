'use client';

export default function CopyButton() {
  const handleCopy = () => {
    const content = document.getElementById('copy-content');
    if (content) {
      const range = document.createRange();
      range.selectNodeContents(content);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('copy');
      alert('복사되었습니다! 네이버 블로그에 붙여넣기 하세요.');
    }
  };

  return (
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
  );
}
