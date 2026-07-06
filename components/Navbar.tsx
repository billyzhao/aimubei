"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { data: session, status } = useSession();

  // Scroll hide/show behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Always show at top
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down → hide
        setVisible(false);
        setUserMenuOpen(false);
        setIsOpen(false);
      } else {
        // Scrolling up → show
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-midnight-950/70 backdrop-blur-xl border-b border-amethyst-500/10 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-lg shadow-lg shadow-amethyst-500/30 group-hover:shadow-amethyst-500/50 transition-shadow">
            🕯️
          </div>
          <span className="text-xl font-serif font-semibold text-gradient-purple">
            永念
          </span>
          <span className="text-xs text-mist-400 ml-1 hidden sm:inline">EverMind</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <NavLink href="/" label="首页" />
          <NavLink href="/memorials" label="纪念馆" />
          <NavLink href="/create" label="创建" />
          <NavLink href="/#features" label="功能" />
          <NavLink href="/#about" label="关于" />
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {status === "loading" ? (
            <div className="w-20 h-8 bg-midnight-700/50 rounded-lg animate-pulse" />
          ) : session?.user ? (
            <UserMenu
              user={session.user}
              open={userMenuOpen}
              setOpen={setUserMenuOpen}
              onSignOut={() => signOut({ callbackUrl: "/" })}
            />
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

        {/* Mobile menu button */}
        <button
          className="md:hidden text-mist-300 p-2 -mr-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "关闭菜单" : "打开菜单"}
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

      {/* Mobile menu (slide-down) */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 border-t border-amethyst-500/10" : "max-h-0"
        }`}
      >
        <div className="px-6 py-4 space-y-1 bg-midnight-900/95">
          <MobileNavLink href="/" label="首页" onClick={() => setIsOpen(false)} />
          <MobileNavLink href="/memorials" label="纪念馆" onClick={() => setIsOpen(false)} />
          <MobileNavLink href="/create" label="创建纪念馆" onClick={() => setIsOpen(false)} />
          <MobileNavLink href="/#features" label="功能介绍" onClick={() => setIsOpen(false)} />
          <MobileNavLink href="/#about" label="关于我们" onClick={() => setIsOpen(false)} />

          {session?.user ? (
            <>
              <div className="border-t border-amethyst-500/10 my-2 pt-2" />
              <MobileNavLink href="/dashboard" label="我的纪念馆" onClick={() => setIsOpen(false)} />
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-rose-300 rounded-lg hover:bg-midnight-700/50 transition-colors"
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-amethyst-500/10 my-2 pt-2" />
              <div className="flex gap-3 pt-1">
                <Link
                  href="/login"
                  className="flex-1 text-center text-mist-300 border border-amethyst-700/30 rounded-lg py-2.5 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center btn-primary text-sm py-2.5"
                  onClick={() => setIsOpen(false)}
                >
                  注册
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-mist-300 hover:text-white transition-colors text-sm">
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2.5 text-mist-200 hover:text-white rounded-lg hover:bg-midnight-700/50 transition-colors text-sm"
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function UserMenu({
  user,
  open,
  setOpen,
  onSignOut,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
  open: boolean;
  setOpen: (v: boolean) => void;
  onSignOut: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-midnight-700/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-sm text-white font-medium shrink-0">
          {user.name?.[0] || "U"}
        </div>
        <span className="text-sm text-mist-200 max-w-[80px] truncate">{user.name}</span>
        <svg
          className={`w-4 h-4 text-mist-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-52 bg-midnight-800 border border-amethyst-700/30 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-amethyst-700/20">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-mist-400 truncate">{user.email}</p>
            </div>
            <Link
              href="/dashboard"
              className="block px-4 py-3 text-sm text-mist-200 hover:bg-midnight-700/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              我的纪念馆
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full text-left px-4 py-3 text-sm text-rose-300 hover:bg-midnight-700/50 transition-colors"
            >
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}
