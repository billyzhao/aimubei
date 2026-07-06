"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TimelineEventItem {
  id: string;
  year: number;
  title: string;
  description: string;
  icon: string;
}

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
}

interface InviteCodeItem {
  id: string;
  code: string;
  expiresAt: string | null;
  usedById: string | null;
  createdAt: string;
}

interface MemorialEditData {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  personality: string;
  traits: string[];
  quotes: string[];
  birthYear: number;
  deathYear: number;
  avatar: string;
  coverImage: string;
  visibility: string;
  isVerified: boolean;
  timeline: TimelineEventItem[];
  photos: PhotoItem[];
  inviteCodes: InviteCodeItem[];
}

export default function EditMemorialClient({
  memorial,
}: {
  memorial: MemorialEditData;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "basic" | "timeline" | "photos" | "permissions" | "danger"
  >("basic");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Basic info form state
  const [formData, setFormData] = useState({
    name: memorial.name,
    title: memorial.title,
    bio: memorial.bio,
    personality: memorial.personality,
    traits: memorial.traits,
    quotes: memorial.quotes,
    birthYear: memorial.birthYear.toString(),
    deathYear: memorial.deathYear.toString(),
  });

  // Timeline state
  const [timeline, setTimeline] = useState<TimelineEventItem[]>(memorial.timeline);
  const [newEvent, setNewEvent] = useState({
    year: "",
    title: "",
    description: "",
    icon: "🌿",
  });

  // Photos state
  const [photos, setPhotos] = useState<PhotoItem[]>(memorial.photos);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permissions state
  const [visibility, setVisibility] = useState(memorial.visibility);
  const [inviteCodes, setInviteCodes] = useState<InviteCodeItem[]>(memorial.inviteCodes);
  const [generating, setGenerating] = useState(false);

  const traitOptions = [
    "温和", "幽默", "严肃", "开朗", "内向", "热情",
    "睿智", "坚韧", "温柔", "严谨", "乐观", "沉静",
  ];

  const toggleTrait = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter((t) => t !== trait)
        : [...prev.traits, trait],
    }));
  };

  // === Save basic info ===
  const handleSaveBasic = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/memorials/${memorial.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          bio: formData.bio,
          personality: formData.personality || undefined,
          traits: formData.traits,
          quotes: formData.quotes,
          birthYear: parseInt(formData.birthYear),
          deathYear: parseInt(formData.deathYear),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "保存失败");
        return;
      }

      setMessage("✓ 保存成功");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("网络错误");
    } finally {
      setSaving(false);
    }
  };

  // === Timeline CRUD ===
  const handleAddEvent = async () => {
    if (!newEvent.year || !newEvent.title || !newEvent.description) return;
    try {
      const res = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memorialSlug: memorial.slug,
          year: parseInt(newEvent.year),
          title: newEvent.title,
          description: newEvent.description,
          icon: newEvent.icon,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "添加失败");
        return;
      }

      const event = await res.json();
      setTimeline((prev) => [...prev, event]);
      setNewEvent({ year: "", title: "", description: "", icon: "🌿" });
      setMessage("✓ 时间线事件已添加");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("网络错误");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("确定删除这个时间线事件？")) return;
    try {
      await fetch(`/api/timeline?eventId=${eventId}`, { method: "DELETE" });
      setTimeline((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      setMessage("删除失败");
    }
  };

  // === Photo upload ===
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("memorialSlug", memorial.slug);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "上传失败");
        return;
      }
      const photo = await res.json();
      setPhotos((prev) => [...prev, photo]);
      setMessage("✓ 照片上传成功");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("上传失败");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("确定删除这张照片？")) return;
    try {
      await fetch(`/api/upload?photoId=${photoId}`, { method: "DELETE" });
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch {
      setMessage("删除失败");
    }
  };

  // === Permissions ===
  const handleVisibilityChange = async (v: string) => {
    setVisibility(v);
    try {
      const res = await fetch(`/api/memorials/${memorial.slug}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: v }),
      });
      if (res.ok) {
        setMessage("✓ 权限已更新");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("设置失败");
    }
  };

  const handleGenerateInvite = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorialSlug: memorial.slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCodes((prev) => [
          {
            id: Date.now().toString(),
            code: data.code,
            expiresAt: data.expiresAt,
            usedById: null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setMessage("✓ 邀请码已生成");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("生成失败");
    } finally {
      setGenerating(false);
    }
  };

  // === Delete memorial ===
  const handleDeleteMemorial = async () => {
    if (!confirm(`确定要永久删除「${memorial.name}」的纪念馆吗？此操作不可撤销！`)) return;
    if (!confirm("再次确认：删除后所有数据将永久丢失，无法恢复。确定继续？")) return;
    try {
      const res = await fetch(`/api/memorials/${memorial.slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch {
      setMessage("删除失败");
    }
  };

  const tabs = [
    { key: "basic", label: "基本信息", icon: "📝" },
    { key: "timeline", label: "时间线", icon: "📅" },
    { key: "photos", label: "照片管理", icon: "📸" },
    { key: "permissions", label: "权限管理", icon: "🔒" },
    { key: "danger", label: "危险区", icon: "⚠️" },
  ] as const;

  return (
    <section className="pt-24 pb-12 flex-1">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href={`/memorial/${memorial.slug}`}
              className="text-mist-400 hover:text-amethyst-400 text-sm mb-2 inline-flex items-center gap-1 transition-colors"
            >
              ← 返回纪念馆
            </Link>
            <h1 className="text-3xl font-serif font-bold">
              <span className="text-gradient-purple">编辑纪念馆</span>
            </h1>
            <p className="text-mist-400 text-sm mt-1">{memorial.name}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-amethyst-500/10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-amethyst-400"
                  : "text-mist-400 hover:text-mist-300"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amethyst-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-amethyst-500/10 border border-amethyst-500/30 text-amethyst-300 text-sm animate-fade-in">
            {message}
          </div>
        )}

        {/* === Basic Info Tab === */}
        {activeTab === "basic" && (
          <div className="glass-card p-8 space-y-5 animate-fade-in">
            <div>
              <label className="text-sm text-mist-300 mb-2 block">姓名 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-mist-300 mb-2 block">称谓</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-mist-300 mb-2 block">出生年份 *</label>
                <input
                  type="number"
                  value={formData.birthYear}
                  onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                  className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-mist-300 mb-2 block">逝世年份 *</label>
                <input
                  type="number"
                  value={formData.deathYear}
                  onChange={(e) => setFormData({ ...formData, deathYear: e.target.value })}
                  className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-mist-300 mb-2 block">生平简介 *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={5}
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-sm text-mist-300 mb-2 block">性格标签</label>
              <div className="flex flex-wrap gap-2">
                {traitOptions.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => toggleTrait(trait)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      formData.traits.includes(trait)
                        ? "bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30"
                        : "bg-midnight-700/40 text-mist-400 border border-transparent"
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-mist-300 mb-2 block">性格描述</label>
              <textarea
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                rows={3}
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSaveBasic}
              disabled={saving}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {saving ? "保存中..." : "💾 保存修改"}
            </button>
          </div>
        )}

        {/* === Timeline Tab === */}
        {activeTab === "timeline" && (
          <div className="space-y-6 animate-fade-in">
            {/* Add new event */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">添加时间线事件</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <input
                  type="number"
                  value={newEvent.year}
                  onChange={(e) => setNewEvent({ ...newEvent, year: e.target.value })}
                  placeholder="年份"
                  className="bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
                />
                <input
                  type="text"
                  value={newEvent.icon}
                  onChange={(e) => setNewEvent({ ...newEvent, icon: e.target.value })}
                  placeholder="图标"
                  className="bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
                />
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="标题"
                  className="bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 col-span-2"
                />
              </div>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="描述..."
                rows={2}
                className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-3 py-2 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 resize-none mb-3"
              />
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.year || !newEvent.title || !newEvent.description}
                className="btn-primary text-sm disabled:opacity-30"
              >
                ➕ 添加事件
              </button>
            </div>

            {/* Existing events */}
            <div className="space-y-3">
              {timeline.map((event, i) => (
                <div key={event.id} className="glass-card p-4 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-midnight-700 border border-amethyst-500/20 flex items-center justify-center text-lg flex-shrink-0">
                    {event.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-gradient-gold font-mono">{event.year}</span>
                      <span className="text-sm font-semibold text-white">{event.title}</span>
                      <span className="text-xs text-mist-400">#{i + 1}</span>
                    </div>
                    <p className="text-sm text-mist-400">{event.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-rose-400 hover:text-rose-300 text-xs flex-shrink-0"
                  >
                    删除
                  </button>
                </div>
              ))}
              {timeline.length === 0 && (
                <div className="text-center py-12 text-mist-400 text-sm">
                  暂无时间线事件，添加第一个吧
                </div>
              )}
            </div>
          </div>
        )}

        {/* === Photos Tab === */}
        {activeTab === "photos" && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">上传照片</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="border-2 border-dashed border-amethyst-500/20 rounded-2xl p-8 text-center hover:border-amethyst-500/40 transition-colors cursor-pointer block"
              >
                <div className="text-4xl mb-3">{uploading ? "⏳" : "📸"}</div>
                <p className="text-sm text-mist-300">
                  {uploading ? "上传中..." : "点击上传照片"}
                </p>
                <p className="text-xs text-mist-400 mt-1">JPG、PNG、WebP、GIF，不超过10MB</p>
              </label>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                已上传照片 ({photos.length})
              </h3>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="glass-card overflow-hidden group relative">
                      <img
                        src={photo.url}
                        alt={photo.caption || "纪念馆照片"}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-2">
                        <p className="text-xs text-mist-400 truncate">
                          {photo.caption || "无说明"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500/80 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-mist-400 text-sm">
                  暂无照片，上传第一张吧
                </div>
              )}
            </div>
          </div>
        )}

        {/* === Permissions Tab === */}
        {activeTab === "permissions" && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">访问权限</h3>
              <div className="space-y-3">
                {[
                  { value: "PUBLIC", label: "公开", desc: "所有人都能浏览纪念馆", icon: "🌐" },
                  { value: "FAMILY", label: "亲友", desc: "仅持有邀请码的人可以浏览", icon: "👨‍👩‍👧‍👦" },
                  { value: "PRIVATE", label: "私密", desc: "仅你自己可以浏览", icon: "🔒" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleVisibilityChange(opt.value)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      visibility === opt.value
                        ? "bg-amethyst-500/10 border-2 border-amethyst-500/40"
                        : "bg-midnight-800/40 border-2 border-transparent hover:border-amethyst-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{opt.label}</div>
                        <div className="text-xs text-mist-400">{opt.desc}</div>
                      </div>
                      {visibility === opt.value && (
                        <span className="ml-auto text-amethyst-400">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Invite Codes */}
            {visibility === "FAMILY" && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">邀请码管理</h3>
                  <button
                    onClick={handleGenerateInvite}
                    disabled={generating}
                    className="btn-secondary text-sm disabled:opacity-50"
                  >
                    {generating ? "生成中..." : "➕ 生成邀请码"}
                  </button>
                </div>

                {inviteCodes.length > 0 ? (
                  <div className="space-y-2">
                    {inviteCodes.map((code) => (
                      <div
                        key={code.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-midnight-700/40 border border-amethyst-500/10"
                      >
                        <div className="font-mono text-lg font-bold text-amethyst-300 tracking-wider">
                          {code.code}
                        </div>
                        <div className="flex-1 text-xs text-mist-400">
                          {code.usedById ? (
                            <span className="text-mist-400">已使用</span>
                          ) : code.expiresAt && new Date(code.expiresAt) < new Date() ? (
                            <span className="text-rose-400">已过期</span>
                          ) : (
                            <span className="text-green-400">有效</span>
                          )}
                          {code.expiresAt && (
                            <span className="ml-2">
                              到期: {new Date(code.expiresAt).toLocaleDateString("zh-CN")}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/memorial/${memorial.slug}?invite=${code.code}`
                            );
                            setMessage("✓ 链接已复制");
                            setTimeout(() => setMessage(""), 3000);
                          }}
                          className="text-xs text-amethyst-400 hover:text-amethyst-300"
                        >
                          复制链接
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-mist-400 text-center py-4">
                    暂无邀请码，点击上方按钮生成
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* === Danger Zone === */}
        {activeTab === "danger" && (
          <div className="glass-card p-6 border-rose-500/20 animate-fade-in">
            <h3 className="text-lg font-semibold text-rose-300 mb-4">⚠️ 危险操作</h3>
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-2">删除纪念馆</h4>
              <p className="text-xs text-mist-400 mb-4 leading-relaxed">
                删除后，纪念馆的所有数据（时间线、照片、祭奠记录、对话记录）将永久丢失，无法恢复。
              </p>
              <button
                onClick={handleDeleteMemorial}
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm hover:bg-rose-500/30 transition-colors"
              >
                🗑️ 永久删除纪念馆
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
