"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import type { Notification } from "@/lib/types";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [navQuery, setNavQuery] = useState("");
  const lastScrollY = useRef(0);
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = navQuery.trim();
    router.push(`/memorials${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

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
        <div className="hidden lg:flex items-center gap-6">
          <NavLink href="/" label="首页" />
          <NavLink href="/memorials" label="纪念馆" />
          <NavLink href="/create" label="创建" />
          <NavLink href="/#features" label="功能" />
          <NavLink href="/#about" label="关于" />
        </div>

        {/* Desktop search */}
        <form onSubmit={handleNavSearch} className="hidden md:flex items-center ml-2">
          <input
            type="text"
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            placeholder="搜索纪念馆..."
            className="w-40 xl:w-52 bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-lg pl-3 pr-8 py-1.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
          />
          <button
            type="submit"
            aria-label="搜索"
            className="ml-[-2rem] text-mist-400 hover:text-amethyst-300 transition-colors"
          >
            🔍
          </button>
        </form>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {status === "loading" ? (
            <div className="w-20 h-8 bg-midnight-700/50 rounded-lg animate-pulse" />
          ) : session?.user ? (
            <>
              <NotificationBell />
              <UserMenu
                user={session.user}
                open={userMenuOpen}
                setOpen={setUserMenuOpen}
                onSignOut={() => signOut({ callbackUrl: "/" })}
              />
            </>
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
              <MobileNavLink href="/dashboard#activity" label="最新动态" onClick={() => setIsOpen(false)} />
              <MobileNavLink href="/settings" label="账户设置" onClick={() => setIsOpen(false)} />
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

function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnread(data.unread || 0);
      }
    } catch {
      /* 静默失败，不影响主流程 */
    }
  }, [session?.user]);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 60000);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!session?.user) return null;

  const handleNotifClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await fetch(`/api/notifications/${n.id}`, { method: "POST" });
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    router.push(`/memorial/${n.memorialSlug}`);
  };

  const markAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  const fmtTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "刚刚";
    if (min < 60) return `${min}分钟前`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}小时前`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}天前`;
    return new Date(iso).toLocaleDateString("zh-CN");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="通知"
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-midnight-700/50 transition-colors"
      >
        <span className="text-mist-300">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[11px] font-semibold flex items-center justify-center leading-none">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[88vw] bg-midnight-800 border border-amethyst-700/30 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-amethyst-700/20">
              <span className="text-sm font-medium text-white">通知</span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-amethyst-300 hover:text-amethyst-200 transition-colors"
                >
                  全部已读
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-mist-400">
                  暂无通知
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`block w-full text-left px-4 py-3 border-b border-amethyst-500/10 last:border-0 transition-colors hover:bg-midnight-700/50 ${
                      n.isRead ? "" : "bg-amethyst-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">
                        {n.type === "NEW_MESSAGE" ? "💬" : "👣"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-mist-100 truncate">
                          <span className="text-amethyst-300 font-medium">
                            {n.type === "NEW_MESSAGE" ? "新留言" : "新访客"}
                          </span>
                          · {n.memorialName}
                        </p>
                        {n.content && (
                          <p className="text-xs text-mist-400 mt-0.5 line-clamp-2">
                            {n.content}
                          </p>
                        )}
                        <p className="text-[11px] text-mist-500 mt-1">
                          {fmtTime(n.createdAt)}
                          {!n.isRead && (
                            <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amethyst-400 align-middle" />
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <Link
              href="/dashboard#activity"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-mist-400 py-2.5 hover:text-amethyst-300 transition-colors border-t border-amethyst-700/20"
            >
              查看全部
            </Link>
          </div>
        </>
      )}
    </div>
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
            <Link
              href="/settings"
              className="block px-4 py-3 text-sm text-mist-200 hover:bg-midnight-700/50 transition-colors"
              onClick={() => setOpen(false)}
            >
              账户设置
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
