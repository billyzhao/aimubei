"use client";

import { useState, useEffect } from "react";

interface TimeLetterItem {
  id: string;
  authorName: string;
  content: string;
  status: string;
  deliverAt: string;
  aiReply: string | null;
  createdAt: string;
}

interface TimeLetterPanelProps {
  memorialSlug: string;
  memorialName: string;
}

export default function TimeLetterPanel({
  memorialSlug,
  memorialName,
}: TimeLetterPanelProps) {
  const [letters, setLetters] = useState<TimeLetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    authorName: "",
    content: "",
    deliverInDays: "7",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLetters();
  }, [memorialSlug]);

  const loadLetters = async () => {
    try {
      const res = await fetch(
        `/api/letters?memorialSlug=${memorialSlug}`
      );
      if (res.ok) {
        const data = await res.json();
        setLetters(data);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.authorName.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorialSlug,
          authorName: formData.authorName,
          content: formData.content,
          deliverInDays: parseInt(formData.deliverInDays),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "投递失败");
        return;
      }

      const data = await res.json();
      setMessage(`✓ 信件已封存，将于 ${new Date(data.deliverAt).toLocaleDateString("zh-CN")} 送达`);
      setFormData({ authorName: "", content: "", deliverInDays: "7" });
      setWriting(false);
      loadLetters();
      setTimeout(() => setMessage(""), 5000);
    } catch {
      setMessage("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now;
    return {
      date: date.toLocaleDateString("zh-CN"),
      isPast,
    };
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
            <span>📮</span>
            时光信箱
          </h3>
          <p className="text-sm text-mist-400 mt-1">
            给{memorialName}写一封信，在指定日期送达
          </p>
        </div>
        {!writing && (
          <button
            onClick={() => setWriting(true)}
            className="btn-secondary text-sm"
          >
            ✉️ 写信
          </button>
        )}
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amethyst-500/10 border border-amethyst-500/30 text-amethyst-300 text-sm animate-fade-in">
          {message}
        </div>
      )}

      {/* 写信表单 */}
      {writing && (
        <div className="space-y-4 mb-6 animate-fade-in">
          <div>
            <label className="text-sm text-mist-300 mb-2 block">你的名字 *</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              placeholder="你的名字"
              className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
            />
          </div>
          <div>
            <label className="text-sm text-mist-300 mb-2 block">信件内容 *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={`写给${memorialName}的话...`}
              rows={5}
              className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 resize-none"
            />
            <div className="text-right text-xs text-mist-400 mt-1">
              {formData.content.length} 字
            </div>
          </div>
          <div>
            <label className="text-sm text-mist-300 mb-2 block">送达时间</label>
            <div className="flex gap-2">
              {[
                { days: "1", label: "1天后" },
                { days: "7", label: "1周后" },
                { days: "30", label: "1个月后" },
                { days: "365", label: "1年后" },
              ].map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setFormData({ ...formData, deliverInDays: opt.days })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    formData.deliverInDays === opt.days
                      ? "bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30"
                      : "bg-midnight-700/40 text-mist-400 border border-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.authorName.trim() || !formData.content.trim()}
              className="btn-primary text-sm disabled:opacity-30"
            >
              {submitting ? "投递中..." : "📮 投递信件"}
            </button>
            <button
              onClick={() => setWriting(false)}
              className="btn-secondary text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 信件列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-mist-400 text-sm">加载中...</div>
        ) : letters.length > 0 ? (
          letters.map((letter) => {
            const { date, isPast } = formatDate(letter.deliverAt);
            return (
              <div
                key={letter.id}
                className="p-4 rounded-xl bg-midnight-700/40 border border-amethyst-500/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-mist-200">
                    {letter.authorName}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isPast
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-amethyst-500/10 text-amethyst-400 border border-amethyst-500/20"
                    }`}
                  >
                    {isPast ? "已送达" : `将于 ${date} 送达`}
                  </span>
                </div>
                <p className="text-sm text-mist-300 leading-relaxed">
                  {letter.content}
                </p>
                {letter.aiReply && (
                  <div className="mt-3 pt-3 border-t border-amethyst-500/10">
                    <div className="text-xs text-amethyst-400 mb-1">✨ AI回信</div>
                    <p className="text-sm text-mist-300 italic leading-relaxed">
                      {letter.aiReply}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          !writing && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📮</div>
              <p className="text-sm text-mist-400">还没有人写下信件</p>
              <p className="text-xs text-mist-400/60 mt-1">
                写一封信给{memorialName}，让思念穿越时间
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
