"use client";

import { useState } from "react";
import type { Tribute } from "@/lib/types";

interface TributePanelProps {
  tributes: Tribute[];
  memorialName: string;
  memorialSlug: string;
  tributeCount: number;
  visitorCount: number;
}

export default function TributePanel({ tributes, memorialName, memorialSlug, tributeCount, visitorCount }: TributePanelProps) {
  const [activeTab, setActiveTab] = useState<"all" | "flower" | "candle" | "message">("all");
  const [message, setMessage] = useState("");
  const [localTributes, setLocalTributes] = useState(tributes);
  const [submitting, setSubmitting] = useState(false);

  const filteredTributes = activeTab === "all" ? localTributes : localTributes.filter((t) => t.type === activeTab);

  const handleTribute = async (type: "flower" | "candle") => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/tributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialSlug, type, visitorName: "访客" }),
      });

      if (!res.ok) throw new Error("请求失败");

      const data = await res.json();
      setLocalTributes((prev) => [data, ...prev]);
    } catch {
      // 失败时仍然显示（乐观更新）
      const newTribute: Tribute = {
        id: `t${Date.now()}`,
        type,
        visitor: "你",
        timestamp: new Date().toISOString().split("T")[0],
      };
      setLocalTributes((prev) => [newTribute, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || submitting) return;

    const content = message.trim();
    setSubmitting(true);

    try {
      const res = await fetch("/api/tributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialSlug, type: "message", visitorName: "访客", content }),
      });

      if (!res.ok) throw new Error("请求失败");

      const data = await res.json();
      setLocalTributes((prev) => [data, ...prev]);
      setMessage("");
    } catch {
      const newTribute: Tribute = {
        id: `t${Date.now()}`,
        type: "message",
        visitor: "你",
        content,
        timestamp: new Date().toISOString().split("T")[0],
      };
      setLocalTributes((prev) => [newTribute, ...prev]);
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  const iconMap = {
    flower: "🌸",
    candle: "🕯️",
    message: "✉️",
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleTribute("flower")}
          disabled={submitting}
          className="glass-card p-6 text-center group hover:glow-border transition-all duration-300 disabled:opacity-50"
        >
          <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">🌸</div>
          <div className="text-sm text-mist-300 font-medium">献花</div>
          <div className="text-xs text-mist-400 mt-1">表达思念</div>
        </button>
        <button
          onClick={() => handleTribute("candle")}
          disabled={submitting}
          className="glass-card p-6 text-center group hover:glow-border transition-all duration-300 disabled:opacity-50"
        >
          <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300 animate-flicker">🕯️</div>
          <div className="text-sm text-mist-300 font-medium">点烛</div>
          <div className="text-xs text-mist-400 mt-1">照亮归途</div>
        </button>
      </div>

      {/* Leave Message */}
      <div className="glass-card p-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`给${memorialName}留言...`}
          className="w-full bg-transparent text-mist-200 placeholder-mist-400/50 text-sm resize-none focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || submitting}
            className="px-4 py-1.5 rounded-lg bg-amethyst-500/20 text-amethyst-300 text-sm border border-amethyst-500/20 hover:bg-amethyst-500/30 disabled:opacity-40 transition-colors"
          >
            {submitting ? "发送中..." : "留言"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-mist-400">
          <span>👁️</span>
          <span>{visitorCount.toLocaleString()} 次访问</span>
        </div>
        <div className="flex items-center gap-2 text-mist-400">
          <span>🌸</span>
          <span>{(tributeCount + localTributes.length - tributes.length).toLocaleString()} 次祭奠</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-amethyst-500/10">
        {([
          { key: "all", label: "全部" },
          { key: "flower", label: "献花" },
          { key: "candle", label: "点烛" },
          { key: "message", label: "留言" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-amethyst-400"
                : "text-mist-400 hover:text-mist-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amethyst-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tribute List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTributes.map((tribute) => (
          <div key={tribute.id} className="glass-card p-4 flex gap-3 animate-fade-in">
            <div className="text-2xl flex-shrink-0">{iconMap[tribute.type]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-mist-200">{tribute.visitor}</span>
                <span className="text-xs text-mist-400">{tribute.timestamp}</span>
              </div>
              {tribute.content && (
                <p className="text-sm text-mist-300 leading-relaxed">{tribute.content}</p>
              )}
              {!tribute.content && (
                <p className="text-xs text-mist-400 italic">
                  {tribute.type === "flower" ? "献上了一束花" : "点亮了一支烛"}
                </p>
              )}
            </div>
          </div>
        ))}
        {filteredTributes.length === 0 && (
          <div className="text-center py-8 text-mist-400 text-sm">
            暂无记录
          </div>
        )}
      </div>
    </div>
  );
}
