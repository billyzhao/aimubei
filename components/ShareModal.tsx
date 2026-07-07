"use client";

import { useState, useEffect, useRef } from "react";

interface ShareModalProps {
  url: string;
  title: string;
  name: string;
  bio?: string;
  avatar?: string;
  onClose: () => void;
}

export default function ShareModal({
  url,
  title,
  name,
  bio,
  avatar,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  useEffect(() => {
    // 使用 QR Server API 生成二维码
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fullUrl)}`);
  }, [fullUrl]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = fullUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWeibo = () => {
    const text = `缅怀 ${name} — ${title}`;
    const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "width=600,height=500");
  };

  const shareToQQ = () => {
    const text = `缅怀 ${name} — ${title}`;
    const summary = bio ? bio.substring(0, 80) : "";
    const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(text)}&summary=${encodeURIComponent(summary)}`;
    window.open(shareUrl, "_blank", "width=600,height=500");
  };

  const shareToTwitter = () => {
    const text = `缅怀 ${name} — ${title}`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank", "width=600,height=500");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight-900/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="glass-card p-6 max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-midnight-700/60 text-mist-400 hover:text-mist-200 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-serif font-bold text-white mb-1">分享纪念馆</h3>
          <p className="text-xs text-mist-400">让更多人记得 TA</p>
        </div>

        {/* Preview Card */}
        <div className="glass-card p-4 mb-6 flex items-center gap-3 bg-amethyst-500/5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              "🕯️"
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{name}</div>
            <div className="text-xs text-mist-400 truncate">{title}</div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-midnight-700/40 hover:bg-amethyst-500/10 border border-transparent hover:border-amethyst-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-amethyst-500/15 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              {copied ? "✓" : "🔗"}
            </div>
            <span className="text-xs text-mist-300">{copied ? "已复制" : "复制链接"}</span>
          </button>

          <button
            onClick={shareToWeibo}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-midnight-700/40 hover:bg-amethyst-500/10 border border-transparent hover:border-amethyst-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              📕
            </div>
            <span className="text-xs text-mist-300">微博</span>
          </button>

          <button
            onClick={shareToQQ}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-midnight-700/40 hover:bg-amethyst-500/10 border border-transparent hover:border-amethyst-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              💬
            </div>
            <span className="text-xs text-mist-300">QQ</span>
          </button>

          <button
            onClick={shareToTwitter}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-midnight-700/40 hover:bg-amethyst-500/10 border border-transparent hover:border-amethyst-500/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500/15 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
              🐦
            </div>
            <span className="text-xs text-mist-300">Twitter</span>
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-xs text-mist-400">微信扫一扫</div>
          <div className="w-40 h-40 rounded-2xl bg-white p-3">
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
            )}
          </div>
          <p className="text-xs text-mist-400 text-center max-w-[240px]">
            扫描二维码在微信中打开，分享给亲友
          </p>
        </div>

        {/* URL Display */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-midnight-700/60 border border-amethyst-500/10 flex items-center gap-2">
          <span className="text-xs text-mist-400 truncate flex-1">{fullUrl}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-amethyst-400 hover:text-amethyst-300 flex-shrink-0"
          >
            {copied ? "✓ 已复制" : "复制"}
          </button>
        </div>
      </div>
    </div>
  );
}
