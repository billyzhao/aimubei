"use client";

import { useState, useEffect } from "react";

interface MemoryCapsuleItem {
  id: string;
  title: string;
  content: string | null;
  creatorName: string;
  visibility: "PRIVATE" | "FAMILY" | "PUBLIC";
  unlockAt: string;
  isUnlocked: boolean;
  isOwner: boolean;
  createdAt: string;
}

interface MemoryCapsulePanelProps {
  memorialSlug: string;
  memorialName: string;
  isOwner: boolean;
}

const VISIBILITY_META: Record<
  string,
  { label: string; icon: string; desc: string }
> = {
  PRIVATE: { label: "仅自己", icon: "🔒", desc: "只有你能看到" },
  FAMILY: { label: "亲友可见", icon: "👨‍👩‍👧", desc: "登录的亲友可见" },
  PUBLIC: { label: "公开", icon: "🌍", desc: "所有访客可见" },
};

export default function MemoryCapsulePanel({
  memorialSlug,
  memorialName,
  isOwner,
}: MemoryCapsulePanelProps) {
  const [capsules, setCapsules] = useState<MemoryCapsuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    unlockAt: defaultUnlockDate(),
    visibility: "FAMILY",
  });

  useEffect(() => {
    loadCapsules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memorialSlug]);

  const loadCapsules = async () => {
    try {
      const res = await fetch(`/api/memorial/${memorialSlug}/capsules`);
      if (res.ok) {
        const data = await res.json();
        setCapsules(data);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/memorial/${memorialSlug}/capsules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          unlockAt: new Date(formData.unlockAt).toISOString(),
          visibility: formData.visibility,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "封存失败");
        return;
      }
      setMessage(
        `✓ 记忆胶囊已封存，将于 ${new Date(
          data.unlockAt
        ).toLocaleDateString("zh-CN")} 解锁`
      );
      setFormData({
        title: "",
        content: "",
        unlockAt: defaultUnlockDate(),
        visibility: "FAMILY",
      });
      setWriting(false);
      loadCapsules();
      setTimeout(() => setMessage(""), 5000);
    } catch {
      setMessage("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这枚记忆胶囊吗？此操作不可恢复。")) return;
    try {
      const res = await fetch(
        `/api/memorial/${memorialSlug}/capsules/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setCapsules((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // 静默失败
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
            <span>🎁</span>
            记忆胶囊
          </h3>
          <p className="text-sm text-mist-400 mt-1">
            把珍贵的记忆与寄语封存，在特别的日子为{memorialName}的亲人解锁
          </p>
        </div>
        {isOwner && !writing && (
          <button
            onClick={() => setWriting(true)}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            🕰️ 封存胶囊
          </button>
        )}
      </div>

      {message && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amethyst-500/10 border border-amethyst-500/30 text-amethyst-300 text-sm animate-fade-in">
          {message}
        </div>
      )}

      {/* 封存表单（仅馆主） */}
      {isOwner && writing && (
        <div className="space-y-4 mb-6 animate-fade-in">
          <div>
            <label className="text-sm text-mist-300 mb-2 block">胶囊标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="例如：给孙儿十八岁的一封信"
              maxLength={60}
              className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
            />
          </div>
          <div>
            <label className="text-sm text-mist-300 mb-2 block">
              封存的记忆 / 寄语 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="写下想在未来某一天，传递给亲人的话..."
              rows={5}
              maxLength={5000}
              className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 resize-none"
            />
            <div className="text-right text-xs text-mist-400 mt-1">
              {formData.content.length} / 5000 字
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-mist-300 mb-2 block">解锁日期</label>
              <input
                type="date"
                value={formData.unlockAt}
                onChange={(e) =>
                  setFormData({ ...formData, unlockAt: e.target.value })
                }
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
              />
            </div>
            <div>
              <label className="text-sm text-mist-300 mb-2 block">可见范围</label>
              <select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({ ...formData, visibility: e.target.value })
                }
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
              >
                {Object.entries(VISIBILITY_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.icon} {meta.label}（{meta.desc}）
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !formData.title.trim() ||
                !formData.content.trim()
              }
              className="btn-primary text-sm disabled:opacity-30"
            >
              {submitting ? "封存中..." : "🕰️ 封存胶囊"}
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

      {/* 胶囊列表 */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-mist-400 text-sm">加载中...</div>
        ) : capsules.length > 0 ? (
          capsules.map((c) => (
            <CapsuleCard key={c.id} capsule={c} onDelete={handleDelete} />
          ))
        ) : (
          !writing && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎁</div>
              <p className="text-sm text-mist-400">还没有封存的记忆胶囊</p>
              <p className="text-xs text-mist-400/60 mt-1">
                {isOwner
                  ? "封存一段记忆，让它在特别的日子被亲人开启"
                  : "让珍贵的记忆，在时间里静静等待开启"}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function CapsuleCard({
  capsule,
  onDelete,
}: {
  capsule: MemoryCapsuleItem;
  onDelete: (id: string) => void;
}) {
  const meta = VISIBILITY_META[capsule.visibility] || VISIBILITY_META.FAMILY;
  const unlockDate = new Date(capsule.unlockAt);
  const countdown = getCountdown(unlockDate);

  return (
    <div
      className={`p-4 rounded-xl border ${
        capsule.isUnlocked
          ? "bg-midnight-700/40 border-amethyst-500/15"
          : "bg-midnight-800/50 border-amethyst-500/10"
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0">
            {capsule.isUnlocked ? "📖" : "🔒"}
          </span>
          <span className="text-sm font-medium text-mist-100 truncate">
            {capsule.title}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-midnight-700/60 text-mist-400 border border-amethyst-500/10">
            {meta.icon} {meta.label}
          </span>
          {capsule.isOwner && (
            <button
              onClick={() => onDelete(capsule.id)}
              className="text-xs text-mist-500 hover:text-red-400 transition-colors"
              title="删除"
            >
              删除
            </button>
          )}
        </div>
      </div>

      {capsule.isUnlocked ? (
        <>
          <p className="text-sm text-mist-300 leading-relaxed whitespace-pre-wrap">
            {capsule.content}
          </p>
          <div className="mt-2 text-xs text-mist-500">
            — {capsule.creatorName} 封存 · 已于{" "}
            {unlockDate.toLocaleDateString("zh-CN")} 解锁
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-mist-400 italic">
            这枚胶囊仍在封存中，内容尚未开启……
          </p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amethyst-500/10 text-amethyst-400 border border-amethyst-500/20 shrink-0 ml-2">
            {countdown}
          </span>
        </div>
      )}
    </div>
  );
}

// 默认解锁日期：一年后（YYYY-MM-DD）
function defaultUnlockDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

function getCountdown(unlockDate: Date): string {
  const now = new Date();
  const diff = unlockDate.getTime() - now.getTime();
  if (diff <= 0) return "即将解锁";
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `约 ${years} 年后解锁`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `约 ${months} 个月后解锁`;
  }
  return `${days} 天后解锁`;
}
