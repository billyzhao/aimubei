import React from "react";

// 安全高亮命中子串：将文本按关键词拆成 React 节点，命中部分用 <mark> 包裹。
// 不使用 dangerouslySetInnerHTML，避免 XSS。
export function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query || !text) return <>{text}</>;

  const lower = text.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const j = lower.indexOf(q, i);
    if (j === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (j > i) parts.push(text.slice(i, j));
    parts.push(
      <mark key={key++} className="bg-amethyst-500/30 text-white rounded px-0.5">
        {text.slice(j, j + q.length)}
      </mark>
    );
    i = j + q.length;
  }
  return <>{parts}</>;
}
