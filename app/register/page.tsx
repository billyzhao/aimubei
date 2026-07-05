"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        setLoading(false);
        return;
      }

      // 注册成功，自动登录
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("注册成功，但自动登录失败，请手动登录");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif text-gold-400">永念 EverMind</h1>
          </Link>
          <p className="text-mist-400 mt-2 text-sm">创建你的账号</p>
        </div>

        <div className="bg-midnight-800/60 backdrop-blur-xl border border-amethyst-700/30 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-mist-300 mb-2">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="你的名字"
                className="w-full px-4 py-3 rounded-xl bg-midnight-900/80 border border-amethyst-700/30 text-mist-200 placeholder:text-mist-400/50 focus:outline-none focus:border-amethyst-500 transition-colors"
              />
            </div>

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
                minLength={6}
                placeholder="至少6位"
                className="w-full px-4 py-3 rounded-xl bg-midnight-900/80 border border-amethyst-700/30 text-mist-200 placeholder:text-mist-400/50 focus:outline-none focus:border-amethyst-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amethyst-600 to-amethyst-500 text-white font-medium hover:from-amethyst-500 hover:to-amethyst-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-amethyst-700/20 text-center">
            <p className="text-sm text-mist-400">
              已有账号？{" "}
              <Link href="/login" className="text-amethyst-400 hover:text-amethyst-300 transition-colors">
                直接登录
              </Link>
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
