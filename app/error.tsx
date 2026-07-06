"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-8xl mb-6">⚡</div>
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-purple mb-4">
        出了点问题
      </h1>
      <p className="text-mist-300 max-w-md mb-4 leading-relaxed">
        服务器暂时无法响应，就像一盏忽明忽暗的灯。
        <br />
        请稍后再试，或联系我们。
      </p>
      {error?.message && (
        <p className="text-xs text-mist-500 max-w-md mb-8 font-mono bg-midnight-800/50 rounded-lg px-4 py-2">
          {error.message}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="btn-primary text-base px-8 py-3"
        >
          重试
        </button>
        <Link href="/" className="btn-secondary text-base px-8 py-3">
          回到首页
        </Link>
      </div>
    </div>
  );
}
