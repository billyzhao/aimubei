"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Notification } from "@/lib/types";

export default function NotificationActivity() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnread(data.unread || 0);
      }
    } catch {
      /* 静默失败 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const handleItemClick = async (n: Notification) => {
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
    router.push(`/memorial/${n.memorialSlug}`);
  };

  const markAllRead = async () => {
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
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">最新动态</h2>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-medium">
              {unread} 条未读
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-amethyst-300 hover:text-amethyst-200 transition-colors"
          >
            全部已读
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-midnight-700/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-sm text-mist-400">暂无动态</p>
          <p className="text-xs text-mist-500 mt-1">
            当有人在你的纪念馆留言，会在这里提醒你
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-midnight-700/40 ${
                n.isRead ? "" : "bg-amethyst-500/5"
              }`}
            >
              <span className="text-xl mt-0.5 shrink-0">
                {n.type === "NEW_MESSAGE" ? "💬" : "👣"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-mist-100">
                  <span className="text-amethyst-300 font-medium">
                    {n.type === "NEW_MESSAGE" ? "新留言" : "新访客"}
                  </span>
                  <span className="text-mist-400"> · {n.memorialName}</span>
                </p>
                {n.content && (
                  <p className="text-xs text-mist-400 mt-1 line-clamp-2">{n.content}</p>
                )}
                <p className="text-[11px] text-mist-500 mt-1 flex items-center gap-2">
                  {fmtTime(n.createdAt)}
                  {!n.isRead && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amethyst-400" />
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
