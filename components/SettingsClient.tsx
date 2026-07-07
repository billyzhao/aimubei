"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
}

export default function SettingsClient({ user }: { user: UserData }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "avatar">("profile");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile
  const [name, setName] = useState(user.name || "");

  // Password
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存失败");
      }

      setMessage({ type: "success", text: "个人信息已更新" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "保存失败" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "两次输入的新密码不一致" });
      return;
    }

    if (passwords.new.length < 6) {
      setMessage({ type: "error", text: "新密码至少需要6个字符" });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "修改失败");
      }

      setMessage({ type: "success", text: "密码已更新" });
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "修改失败" });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "请选择图片文件" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "头像不能超过5MB" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const res = await fetch("/api/settings/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "上传失败");
      }

      const data = await res.json();
      setAvatarUrl(data.avatar);
      setMessage({ type: "success", text: "头像已更新" });
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "上传失败" });
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "个人信息", icon: "👤" },
    { id: "avatar" as const, label: "头像", icon: "🖼️" },
    { id: "password" as const, label: "修改密码", icon: "🔒" },
  ];

  return (
    <section className="pt-24 pb-12 flex-1">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-mist-400 hover:text-amethyst-400 text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            ← 返回仪表盘
          </Link>
          <h1 className="text-3xl font-serif font-bold">
            <span className="text-gradient-purple">账户设置</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(null); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30"
                  : "bg-midnight-800/40 text-mist-400 border border-transparent hover:border-amethyst-500/15"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm mb-4 ${
            message.type === "success"
              ? "bg-emethyst-500/10 border border-emethyst-500/30 text-emethyst-300"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="glass-card p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <div>
                <label className="text-sm text-mist-300 mb-2 block">昵称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的昵称"
                  className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
                />
              </div>

              <div>
                <label className="text-sm text-mist-300 mb-2 block">邮箱</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-midnight-700/30 text-mist-400 rounded-xl px-4 py-3 text-sm border border-amethyst-500/10 cursor-not-allowed"
                />
                <p className="text-xs text-mist-400 mt-1">邮箱不可修改</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amethyst-500/10">
                <div>
                  <div className="text-xs text-mist-400 mb-1">账户类型</div>
                  <div className="text-sm text-mist-200">
                    {user.role === "ADMIN" ? "管理员" : "普通用户"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-mist-400 mb-1">注册时间</div>
                  <div className="text-sm text-mist-200">
                    {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || name === (user.name || "")}
                  className="btn-primary text-sm px-6 py-2.5 disabled:opacity-30"
                >
                  {saving ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          )}

          {/* Avatar Tab */}
          {activeTab === "avatar" && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-3xl text-white font-semibold overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0] || "U"
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-secondary text-sm px-5 py-2.5"
                >
                  {uploading ? "上传中..." : "选择图片"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]);
                    e.target.value = "";
                  }}
                />

                <p className="text-xs text-mist-400 text-center">
                  支持 JPG、PNG、WebP 格式，大小不超过 5MB
                </p>

                {avatarUrl && (
                  <button
                    onClick={async () => {
                      setAvatarUrl("");
                      await fetch("/api/settings/profile", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatar: null }),
                      });
                      setMessage({ type: "success", text: "头像已移除" });
                      router.refresh();
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    移除头像
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="space-y-5">
              <div>
                <label className="text-sm text-mist-300 mb-2 block">当前密码</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="输入当前密码"
                  className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
                />
              </div>

              <div>
                <label className="text-sm text-mist-300 mb-2 block">新密码</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="至少6个字符"
                  className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
                />
              </div>

              <div>
                <label className="text-sm text-mist-300 mb-2 block">确认新密码</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="再次输入新密码"
                  className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
                  className="btn-primary text-sm px-6 py-2.5 disabled:opacity-30"
                >
                  {saving ? "修改中..." : "修改密码"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
