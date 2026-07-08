"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  slug: string;
  reason: string;
  requireInvite?: boolean;
  requirePassword?: boolean;
  memorialName?: string;
}

export default function AccessDenied({
  slug,
  reason,
  requireInvite,
  requirePassword,
  memorialName,
}: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 若 URL 带 invite 参数，自动尝试验证（亲友纪念馆分享链接直达）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("invite");
    if (code && requireInvite) {
      setInvite(code);
      void submit("invite", code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (type: "password" | "invite", value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/memorials/${slug}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "password" ? { password: value } : { invite: value }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "验证失败");
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const title =
    reason === "family"
      ? "这是一个亲友纪念馆"
      : reason === "private"
      ? "这是一个私密纪念馆"
      : "无法访问";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="pt-24 pb-12 flex-1 flex items-center justify-center px-6">
        <div className="glass-card p-8 md:p-10 max-w-md w-full glow-border text-center animate-fade-in">
          <div className="text-5xl mb-4">{reason === "family" ? "👨‍👩‍👧‍👦" : "🔒"}</div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">{title}</h1>
          {memorialName && (
            <p className="text-mist-400 text-sm mb-6">
              纪念馆「{memorialName}」设置了访问权限，需要验证后才能进入。
            </p>
          )}

          {requirePassword && (
            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit("password", password);
                }}
                placeholder="请输入访问密码"
                className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
              />
              <button
                onClick={() => void submit("password", password)}
                disabled={loading}
                className="btn-primary text-sm w-full disabled:opacity-50"
              >
                {loading ? "验证中..." : "🔓 进入纪念馆"}
              </button>
            </div>
          )}

          {requireInvite && (
            <div className="space-y-3">
              <input
                type="text"
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit("invite", invite);
                }}
                placeholder="请输入邀请码"
                className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors tracking-widest font-mono uppercase"
              />
              <button
                onClick={() => void submit("invite", invite)}
                disabled={loading}
                className="btn-primary text-sm w-full disabled:opacity-50"
              >
                {loading ? "验证中..." : "🔓 使用邀请码进入"}
              </button>
              <p className="text-xs text-mist-400 leading-relaxed mt-2">
                如果你是纪念馆主人，请
                <Link href="/dashboard" className="text-amethyst-400 hover:underline">
                  登录后从控制台进入
                </Link>
                。
              </p>
            </div>
          )}

          {!requirePassword && !requireInvite && (
            <p className="text-mist-400 text-sm">
              该纪念馆仅对所有者可见。如果你是主人，请
              <Link href="/login" className="text-amethyst-400 hover:underline">
                登录
              </Link>
              。
            </p>
          )}

          {error && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/memorials"
              className="text-sm text-mist-400 hover:text-amethyst-400 transition-colors"
            >
              ← 返回纪念馆列表
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
