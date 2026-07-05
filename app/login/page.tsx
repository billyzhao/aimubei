"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("邮箱或密码不正确");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif text-gold-400">永念 EverMind</h1>
          </Link>
          <p className="text-mist-400 mt-2 text-sm">登录你的纪念空间</p>
        </div>

        <div className="bg-midnight-800/60 backdrop-blur-xl border border-amethyst-700/30 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-mist-300 mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-midnight-900/80 border border-amethyst-700/30 text-mist-200 placeholder:text-mist-400/50 focus:outline-none focus:border-amethyst-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-mist-300 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-midnight-900/80 border border-amethyst-700/30 text-mist-200 placeholder:text-mist-400/50 focus:outline-none focus:border-amethyst-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amethyst-600 to-amethyst-500 text-white font-medium hover:from-amethyst-500 hover:to-amethyst-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-amethyst-700/20 text-center">
            <p className="text-sm text-mist-400">
              还没有账号？{" "}
              <Link href="/register" className="text-amethyst-400 hover:text-amethyst-300 transition-colors">
                注册新账号
              </Link>
            </p>
          </div>

          <div className="mt-4 px-4 py-3 rounded-lg bg-amethyst-700/10 border border-amethyst-700/20 text-center">
            <p className="text-xs text-mist-400">
              演示账号：demo@evermind.cn / demo123456
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-mist-400 hover:text-mist-300 transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-mist-400">加载中...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
