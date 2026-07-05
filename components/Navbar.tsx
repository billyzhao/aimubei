"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-midnight-950/70 backdrop-blur-xl border-b border-amethyst-500/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-lg shadow-lg shadow-amethyst-500/30 group-hover:shadow-amethyst-500/50 transition-shadow">
            🕯️
          </div>
          <span className="text-xl font-serif font-semibold text-gradient-purple">
            永念
          </span>
          <span className="text-xs text-mist-400 ml-1 hidden sm:inline">EverMind</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-mist-300 hover:text-white transition-colors text-sm">
            首页
          </Link>
          <Link href="/memorials" className="text-mist-300 hover:text-white transition-colors text-sm">
            纪念馆
          </Link>
          <Link href="/create" className="text-mist-300 hover:text-white transition-colors text-sm">
            创建纪念馆
          </Link>
          <Link href="/#features" className="text-mist-300 hover:text-white transition-colors text-sm">
            功能
          </Link>
          <Link href="/#about" className="text-mist-300 hover:text-white transition-colors text-sm">
            关于
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-20 h-8 bg-midnight-700/50 rounded-lg animate-pulse" />
          ) : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-midnight-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-sm text-white">
                  {session.user.name?.[0] || "U"}
                </div>
                <span className="text-sm text-mist-200">{session.user.name}</span>
                <svg className="w-4 h-4 text-mist-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-midnight-800 border border-amethyst-700/30 rounded-xl shadow-xl overflow-hidden">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-3 text-sm text-mist-200 hover:bg-midnight-700/50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    我的纪念馆
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-3 text-sm text-rose-300 hover:bg-midnight-700/50 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-mist-300 hover:text-white transition-colors text-sm">
                登录
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4">
                注册
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-mist-300 p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-midnight-900/95 border-t border-amethyst-500/10 px-6 py-4 space-y-3">
          <Link href="/" className="block text-mist-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
            首页
          </Link>
          <Link href="/memorials" className="block text-mist-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
            纪念馆
          </Link>
          <Link href="/create" className="block text-mist-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
            创建纪念馆
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="block text-mist-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
                我的纪念馆
              </Link>
              <button
                onClick={() => { signOut({ callbackUrl: "/" }); setIsOpen(false); }}
                className="block text-rose-300 py-2 w-full text-left"
              >
                退出登录
              </button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1 text-center text-mist-300 border border-amethyst-700/30 rounded-lg py-2" onClick={() => setIsOpen(false)}>
                登录
              </Link>
              <Link href="/register" className="flex-1 text-center btn-primary text-sm py-2" onClick={() => setIsOpen(false)}>
                注册
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
