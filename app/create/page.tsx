"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TimelineBuilder, { type TimelineEventInput } from "@/components/TimelineBuilder";

export default function CreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  // 照片本地预览
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 时间线
  const [timelineEvents, setTimelineEvents] = useState<TimelineEventInput[]>([]);

  // 未登录时重定向到登录页
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/create");
    }
  }, [status, router]);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    birthYear: "",
    deathYear: "",
    gender: "male",
    bio: "",
    personality: "",
    traits: [] as string[],
    quotes: [] as string[],
    quoteInput: "",
    photos: [] as string[],
    voiceSample: false,
    plan: "pro",
    visibility: "PUBLIC" as "PUBLIC" | "FAMILY" | "PRIVATE",
    accessPassword: "",
    relationship: "",
    region: "",
  });

  const steps = [
    { num: 1, title: "基本信息", icon: "📝" },
    { num: 2, title: "生平故事", icon: "📖" },
    { num: 3, title: "性格特征", icon: "🧠" },
    { num: 4, title: "照片资料", icon: "📸" },
    { num: 5, title: "语音样本", icon: "🎙️" },
    { num: 6, title: "选择方案", icon: "⭐" },
  ];

  const traitOptions = ["温和", "幽默", "严肃", "开朗", "内向", "热情", "睿智", "坚韧", "温柔", "严谨", "乐观", "沉静"];

  const relationshipOptions = ["父母", "配偶", "子女", "师友", "战友", "恩师", "其他"];
  const regionOptions = ["华北", "东北", "华东", "华中", "华南", "西南", "西北", "港澳台", "海外", "其他"];

  const toggleTrait = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter((t) => t !== trait)
        : [...prev.traits, trait],
    }));
  };

  const addQuote = () => {
    if (!formData.quoteInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      quotes: [...prev.quotes, prev.quoteInput.trim()],
      quoteInput: "",
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name && formData.birthYear && formData.deathYear;
      case 2: return formData.bio.length > 10;
      case 3: return formData.traits.length > 0;
      default: return true;
    }
  };

  // 照片处理
  const handlePhotoSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(f.type)
    );

    const valid = fileArray.filter((f) => f.size <= 10 * 1024 * 1024);
    if (valid.length < fileArray.length) {
      setError("部分照片超过10MB已被过滤");
    }

    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setPhotoFiles((prev) => [...prev, ...valid]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setUploadProgress("");

    try {
      // 1. 创建纪念馆
      const res = await fetch("/api/memorials/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title || `${formData.name} · ${formData.birthYear}-${formData.deathYear}`,
          bio: formData.bio,
          personality: formData.personality || undefined,
          traits: formData.traits,
          quotes: formData.quotes,
          birthYear: parseInt(formData.birthYear),
          deathYear: parseInt(formData.deathYear),
          timeline: timelineEvents,
          visibility: formData.visibility,
          relationship: formData.relationship || undefined,
          region: formData.region || undefined,
          accessPassword:
            formData.visibility === "PRIVATE" && formData.accessPassword
              ? formData.accessPassword
              : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setError("请先登录后再创建纪念馆");
          setTimeout(() => router.push("/login?callbackUrl=/create"), 1500);
          return;
        }
        setError(data.error || "创建失败");
        setSubmitting(false);
        return;
      }

      // 2. 上传照片（纪念馆创建后拿到slug）
      if (photoFiles.length > 0) {
        setUploadProgress("正在上传照片...");
        for (let i = 0; i < photoFiles.length; i++) {
          const fileFormData = new FormData();
          fileFormData.append("file", photoFiles[i]);
          fileFormData.append("memorialSlug", data.slug);

          try {
            await fetch("/api/upload", {
              method: "POST",
              body: fileFormData,
            });
            setUploadProgress(`上传照片 ${i + 1}/${photoFiles.length}...`);
          } catch {
            // 照片上传失败不阻塞流程
          }
        }
      }

      router.push(`/memorial/${data.slug}`);
    } catch {
      setError("网络错误，请稍后重试");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {status !== "authenticated" ? (
        <section className="pt-24 pb-12 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-mist-400">正在验证登录状态...</p>
          </div>
        </section>
      ) : (
      <section className="pt-24 pb-12 flex-1">
        <div className="max-w-3xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
              <span className="text-gradient-purple">创建纪念馆</span>
            </h1>
            <p className="text-mist-400">为你爱的人，建造一座永恒的数字纪念空间</p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-between mb-10 overflow-x-auto pb-2">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                      step > s.num
                        ? "bg-gradient-to-br from-amethyst-500 to-amethyst-700 text-white shadow-lg shadow-amethyst-500/30"
                        : step === s.num
                        ? "bg-gradient-to-br from-amethyst-500 to-amethyst-700 text-white shadow-lg shadow-amethyst-500/40 scale-110"
                        : "bg-midnight-800 text-mist-400 border border-amethyst-500/15"
                    }`}
                  >
                    {step > s.num ? "✓" : s.icon}
                  </div>
                  <span className={`text-xs mt-1.5 hidden md:block ${step >= s.num ? "text-amethyst-400" : "text-mist-400"}`}>
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 md:w-12 h-0.5 mx-1 ${step > s.num ? "bg-amethyst-500" : "bg-midnight-700"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 glow-border">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-white mb-4">基本信息</h2>

                <div>
                  <label className="text-sm text-mist-300 mb-2 block">姓名 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="逝者姓名"
                    className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm text-mist-300 mb-2 block">称谓</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="如：人民教师 · 1948-2023"
                    className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-mist-300 mb-2 block">出生年份 *</label>
                    <input
                      type="number"
                      value={formData.birthYear}
                      onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                      placeholder="1948"
                      className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-mist-300 mb-2 block">逝世年份 *</label>
                    <input
                      type="number"
                      value={formData.deathYear}
                      onChange={(e) => setFormData({ ...formData, deathYear: e.target.value })}
                      placeholder="2023"
                      className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-mist-300 mb-2 block">性别</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, gender: "male" })}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        formData.gender === "male"
                          ? "bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30"
                          : "bg-midnight-700/40 text-mist-400 border border-transparent"
                      }`}
                    >
                      男
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, gender: "female" })}
                      className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        formData.gender === "female"
                          ? "bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30"
                          : "bg-midnight-700/40 text-mist-400 border border-transparent"
                      }`}
                    >
                      女
                    </button>
                  </div>
                </div>

                {/* Relationship type */}
                <div>
                  <label className="text-sm text-mist-300 mb-2 block">关系类型</label>
                  <div className="flex flex-wrap gap-2">
                    {relationshipOptions.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, relationship: r })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          formData.relationship === r
                            ? "bg-gradient-to-r from-amethyst-600 to-amethyst-500 text-white shadow-lg shadow-amethyst-500/20"
                            : "bg-midnight-700/40 text-mist-400 border border-amethyst-500/15 hover:border-amethyst-500/30"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div>
                  <label className="text-sm text-mist-300 mb-2 block">地区</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full bg-midnight-700/60 text-mist-200 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                  >
                    <option value="">不指定</option>
                    {regionOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Bio + Timeline */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-white mb-4">生平故事</h2>
                <p className="text-sm text-mist-400">请描述逝者的生平经历。信息越丰富，AI复刻越真实。</p>

                <div>
                  <label className="text-sm text-mist-300 mb-2 block">生平简介 *</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="请描述逝者的生平、职业、成就、性格特点等..."
                    rows={6}
                    className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors resize-none"
                  />
                  <div className="text-right text-xs text-mist-400 mt-1">{formData.bio.length} 字</div>
                </div>

                {/* Timeline Builder */}
                <div>
                  <label className="text-sm text-mist-300 mb-3 block">生平时间线（可选）</label>
                  <TimelineBuilder
                    events={timelineEvents}
                    onEventsChange={setTimelineEvents}
                  />
                </div>

                <div>
                  <label className="text-sm text-mist-300 mb-2 block">经典语录（可选）</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.quoteInput}
                      onChange={(e) => setFormData({ ...formData, quoteInput: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQuote(); } }}
                      placeholder="TA常说的一句话..."
                      className="flex-1 bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                    />
                    <button
                      onClick={addQuote}
                      className="btn-secondary text-sm px-4"
                    >
                      添加
                    </button>
                  </div>
                  {formData.quotes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.quotes.map((q, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-mist-300 border-l-2 border-amethyst-500/30 pl-3">
                          <span className="flex-1 italic">"{q}"</span>
                          <button
                            onClick={() => setFormData({ ...formData, quotes: formData.quotes.filter((_, idx) => idx !== i) })}
                            className="text-rose-400 hover:text-rose-300 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card p-4 bg-amethyst-500/5">
                  <div className="flex gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-sm text-mist-300 font-medium mb-1">提示</p>
                      <p className="text-xs text-mist-400 leading-relaxed">
                        你可以上传TA的日记、信件、朋友圈、聊天记录等文字资料，帮助AI更准确地还原TA的说话风格。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Personality */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-white mb-4">性格特征</h2>
                <p className="text-sm text-mist-400">选择最符合TA性格的标签（可多选）</p>

                <div className="flex flex-wrap gap-3">
                  {traitOptions.map((trait) => (
                    <button
                      key={trait}
                      onClick={() => toggleTrait(trait)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        formData.traits.includes(trait)
                          ? "bg-gradient-to-r from-amethyst-600 to-amethyst-500 text-white shadow-lg shadow-amethyst-500/20 scale-105"
                          : "bg-midnight-700/40 text-mist-400 border border-amethyst-500/15 hover:border-amethyst-500/30"
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-sm text-mist-300 mb-2 block">性格描述（可选）</label>
                  <textarea
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    placeholder="更详细地描述TA的性格、说话习惯、爱好等..."
                    rows={4}
                    className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors resize-none"
                  />
                </div>

                {formData.traits.length > 0 && (
                  <div className="glass-card p-4">
                    <p className="text-xs text-mist-400 mb-2">已选择 {formData.traits.length} 个特征：</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.traits.map((t) => (
                        <span key={t} className="px-3 py-1 rounded-full bg-amethyst-500/20 text-xs text-amethyst-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-white mb-4">照片资料</h2>
                <p className="text-sm text-mist-400">上传逝者的照片，第一张将自动设为纪念馆头像</p>

                {error && (
                  <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                    {error}
                  </div>
                )}

                {/* Upload Area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files.length > 0) handlePhotoSelect(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    dragOver
                      ? "border-amethyst-500/60 bg-amethyst-500/10 scale-[1.02]"
                      : "border-amethyst-500/20 hover:border-amethyst-500/40 hover:bg-amethyst-500/5"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handlePhotoSelect(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <div className="text-5xl mb-3">📸</div>
                  <p className="text-sm text-mist-200 font-medium mb-1">点击或拖拽上传照片</p>
                  <p className="text-xs text-mist-400">支持 JPG、PNG、WebP、GIF，单张不超过 10MB</p>
                  <p className="text-xs text-mist-400 mt-1">已选择 {photoFiles.length} 张</p>
                </div>

                {/* Photo Preview Grid */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {photoPreviews.map((url, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-midnight-800 border border-amethyst-500/15"
                      >
                        <img src={url} alt={`预览 ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-gold-500/20 text-xs text-gold-300 border border-gold-500/30">
                            头像
                          </div>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="glass-card p-4 bg-amethyst-500/5">
                  <div className="flex gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-sm text-mist-300 font-medium mb-1">照片说明</p>
                      <p className="text-xs text-mist-400 leading-relaxed">
                        照片将在纪念馆创建后自动上传。第一张照片会设为纪念馆头像，后续可在编辑页面管理照片。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Voice */}
            {step === 5 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-white mb-4">语音样本</h2>
                <p className="text-sm text-mist-400">上传逝者的语音录音，用于克隆原声</p>

                <div className="glass-card p-8 text-center">
                  <div className="text-5xl mb-4">🎙️</div>
                  <h3 className="text-lg font-semibold text-white mb-2">上传语音样本</h3>
                  <p className="text-sm text-mist-400 mb-6">至少需要 3 分钟的清晰录音</p>

                  <div className="border-2 border-dashed border-amethyst-500/20 rounded-2xl p-8 hover:border-amethyst-500/40 transition-colors cursor-pointer mb-4">
                    <p className="text-sm text-mist-300">点击或拖拽上传音频文件</p>
                    <p className="text-xs text-mist-400 mt-1">支持 MP3、WAV、M4A 格式</p>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button className="btn-secondary text-sm py-2 px-4">
                      🎤 开始录音
                    </button>
                    <span className="text-xs text-mist-400">或上传已有录音</span>
                  </div>
                </div>

                <div className="glass-card p-4 bg-gold-400/5 border-gold-400/20">
                  <div className="flex gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p className="text-sm text-gold-300 font-medium mb-1">Pro版功能</p>
                      <p className="text-xs text-mist-400 leading-relaxed">
                        语音克隆是Pro版功能。基础版用户可先跳过此步，后续升级后补充。
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setFormData({ ...formData, voiceSample: !formData.voiceSample })}
                  className="text-sm text-mist-400 hover:text-amethyst-400 transition-colors"
                >
                  {formData.voiceSample ? "✓ " : ""}暂不上传，稍后补充
                </button>
              </div>
            )}

            {/* Step 6: Plan + Privacy */}
            {step === 6 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-semibold text-white mb-4">隐私与可见性</h2>
                <p className="text-sm text-mist-400">设置谁可以访问这座纪念馆，创建后仍可随时修改。</p>

                <div className="space-y-3">
                  {[
                    { value: "PUBLIC", label: "公开", desc: "所有人都能浏览这座纪念馆", icon: "🌐" },
                    { value: "FAMILY", label: "亲友", desc: "仅持有邀请码的人可以浏览", icon: "👨‍👩‍👧‍👦" },
                    { value: "PRIVATE", label: "私密", desc: "仅你自己可见，可设置访问密码分享", icon: "🔒" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, visibility: opt.value as any })}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                        formData.visibility === opt.value
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
                        {formData.visibility === opt.value && (
                          <span className="ml-auto text-amethyst-400">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {formData.visibility === "PRIVATE" && (
                  <div className="glass-card p-4 bg-amethyst-500/5">
                    <label className="text-sm text-mist-300 mb-2 block">访问密码（可选）</label>
                    <input
                      type="password"
                      value={formData.accessPassword}
                      onChange={(e) => setFormData({ ...formData, accessPassword: e.target.value })}
                      placeholder="设置后，凭密码即可访问（至少4位）"
                      className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-3 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
                    />
                    <p className="text-xs text-mist-400 mt-2">
                      不设密码则仅你自己可见。设密码后，可把密码告知想分享的人。
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-amethyst-500/10">
                  <h2 className="text-xl font-semibold text-white mb-4 mt-4">选择方案</h2>

                  <div className="space-y-3">
                    {[
                      { id: "basic", name: "基础版", price: "¥0", desc: "永久免费", features: ["纪念馆创建", "基础信息展示", "生平时间线", "祭奠互动", "AI对话（每日3条）"] },
                      { id: "pro", name: "Pro版", price: "¥299/年", desc: "推荐", features: ["基础版全部功能", "无限AI对话", "语音克隆", "时光信箱", "照片墙500张", "视频纪念"] },
                      { id: "family", name: "家族版", price: "¥899/年", desc: "家族传承", features: ["Pro版全部功能", "家族树", "记忆胶囊", "跨代际传承", "无限存储", "专属客服"] },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setFormData({ ...formData, plan: plan.id })}
                        className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                          formData.plan === plan.id
                            ? "bg-amethyst-500/10 border-2 border-amethyst-500/40 glow-border"
                            : "bg-midnight-800/40 border-2 border-transparent hover:border-amethyst-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-white">{plan.name}</span>
                            {plan.desc === "推荐" && (
                              <span className="px-2 py-0.5 rounded-full bg-amethyst-500/20 text-xs text-amethyst-300">推荐</span>
                            )}
                          </div>
                          <span className="text-lg font-bold text-gradient-gold">{plan.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {plan.features.map((f) => (
                            <span key={f} className="text-xs text-mist-400">✓ {f}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-amethyst-500/10">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || submitting}
                className="btn-secondary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← 上一步
              </button>

              {step < 6 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="btn-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  下一步 →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-gold text-sm disabled:opacity-50"
                >
                  {submitting ? (uploadProgress || "创建中...") : "✨ 创建纪念馆"}
                </button>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="glass-card p-4 mt-6 flex gap-3">
            <span className="text-xl flex-shrink-0">🔒</span>
            <div>
              <p className="text-sm text-mist-300 font-medium mb-1">隐私保护承诺</p>
              <p className="text-xs text-mist-400 leading-relaxed">
                所有上传的数据均经过加密存储，归你所有。你可以随时导出或删除所有数据。
                AI复刻功能遵循知情同意原则，需要本人授权或直系亲属同意。
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
}
