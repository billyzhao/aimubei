"use client";

import { useEffect, useRef, useState } from "react";

interface SharePosterProps {
  name: string;
  title: string;
  bio?: string;
  avatar?: string;
  slug: string;
  onClose: () => void;
}

const W = 1080;
const H = 1440;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const chars = Array.from(text);
  let line = "";
  let lines: string[] = [];
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines) lines.push(line);
  // 截断最后一行加省略号
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxWidth && last.length > 0) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = last + (Array.from(text).length > lines.join("").length ? "…" : "");
  }
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
}

function loadImage(src: string | undefined | null): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function SharePoster({
  name,
  title,
  bio,
  avatar,
  slug,
  onClose,
}: SharePosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/memorial/${slug}`
      : `/memorial/${slug}`;

  const draw = (avatarImg: HTMLImageElement | null, qrImg: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = W;
    canvas.height = H;

    // 背景渐变
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#16122e");
    g.addColorStop(1, "#0a0818");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // 顶部柔光
    const rg = ctx.createRadialGradient(W / 2, H * 0.3, 40, W / 2, H * 0.3, 560);
    rg.addColorStop(0, "rgba(138,92,246,0.22)");
    rg.addColorStop(1, "rgba(138,92,246,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    // 品牌
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#e8c977";
    ctx.font = "600 36px serif";
    ctx.fillText("🕯  永念 EverMind", W / 2, 96);
    ctx.fillStyle = "#8b7fb5";
    ctx.font = "400 26px sans-serif";
    ctx.fillText("让思念可以对话", W / 2, 138);

    // 头像圆环
    const cx = W / 2;
    const cy = 340;
    const r = 150;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(212,175,55,0.65)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#1a1530";
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    if (avatarImg) {
      ctx.drawImage(avatarImg, cx - r, cy - r, 2 * r, 2 * r);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "120px serif";
      ctx.fillStyle = "#e8c977";
      ctx.fillText("🕯", cx, cy);
      ctx.textBaseline = "alphabetic";
    }
    ctx.restore();

    // 姓名
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 66px serif";
    ctx.fillText(name, W / 2, 580);

    // 称号
    ctx.fillStyle = "#c4b5fd";
    ctx.font = "400 36px sans-serif";
    ctx.fillText(title, W / 2, 636);

    // 生平
    ctx.fillStyle = "#a9a3c4";
    ctx.font = "400 30px sans-serif";
    wrapText(
      ctx,
      bio && bio.trim() ? bio.trim() : "在这里，留下你最深的思念与祝福，让爱与记忆永续。",
      W / 2,
      724,
      W - 180,
      48,
      4
    );

    // 分隔金线
    const lineY = 980;
    const lg = ctx.createLinearGradient(W / 2 - 220, 0, W / 2 + 220, 0);
    lg.addColorStop(0, "rgba(212,175,55,0)");
    lg.addColorStop(0.5, "rgba(212,175,55,0.7)");
    lg.addColorStop(1, "rgba(212,175,55,0)");
    ctx.strokeStyle = lg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 220, lineY);
    ctx.lineTo(W / 2 + 220, lineY);
    ctx.stroke();

    // 底部二维码 + 文案
    const qrSize = 220;
    const qrX = W / 2 - qrSize / 2;
    const qrY = 1060;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 24);
    ctx.fill();
    if (qrImg) {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } else {
      ctx.fillStyle = "#0a0818";
      ctx.font = "400 24px sans-serif";
      ctx.fillText("扫码", W / 2, qrY + qrSize / 2 - 10);
      ctx.fillText("进入纪念馆", W / 2, qrY + qrSize / 2 + 24);
    }

    ctx.fillStyle = "#e8c977";
    ctx.font = "500 32px sans-serif";
    ctx.fillText("扫码进入纪念馆，寄托哀思", W / 2, qrY + qrSize + 64);
    ctx.fillStyle = "#8b7fb5";
    ctx.font = "400 26px sans-serif";
    const shortUrl = fullUrl.replace(/^https?:\/\//, "");
    ctx.fillText(shortUrl, W / 2, qrY + qrSize + 110);

    setReady(true);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [av, qr] = await Promise.all([
        loadImage(avatar),
        loadImage(
          `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
            fullUrl
          )}`
        ),
      ]);
      if (!cancelled) draw(av, qr);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          setErr("导出失败，请截图保存");
          return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `永念-${name}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
    } catch {
      setErr("图片含外部资源无法自动保存，请长按图片或截图保存");
    }
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/png")
      );
      if (!blob) {
        setErr("导出失败，请截图保存");
        return;
      }
      const file = new File([blob], `永念-${name}.png`, { type: "image/png" });
      if (navigator.share) {
        await navigator.share({
          title: `缅怀 ${name}`,
          text: `缅怀 ${name} — ${title}`,
          files: [file],
        });
      } else {
        handleSave();
      }
    } catch {
      // 用户取消分享，不处理
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-midnight-900/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="flex flex-col items-center max-h-full">
        <div className="text-center mb-3">
          <h3 className="text-lg font-serif font-bold text-white">分享海报</h3>
          <p className="text-xs text-mist-400">保存图片，分享给亲友</p>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-amethyst-900/40 max-h-[60vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <canvas
            ref={canvasRef}
            style={{ width: "auto", height: "60vh", maxWidth: "90vw", objectFit: "contain" }}
          />
        </div>

        {err && <p className="text-xs text-rose-400 mt-2 text-center">{err}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleShare}
            disabled={!ready}
            className="px-5 py-2.5 rounded-xl bg-amethyst-500/20 text-amethyst-200 border border-amethyst-500/30 hover:bg-amethyst-500/30 disabled:opacity-40 transition-colors text-sm"
          >
            分享 / 保存
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-midnight-700/60 text-mist-300 border border-amethyst-500/10 hover:text-mist-100 transition-colors text-sm"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
