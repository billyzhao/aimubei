import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MemorialChat from "@/components/MemorialChat";
import Timeline from "@/components/Timeline";
import TributePanel from "@/components/TributePanel";
import PhotoWall from "@/components/PhotoWall";
import TimeLetterPanel from "@/components/TimeLetterPanel";
import AnimatedSection from "@/components/AnimatedSection";
import ParticleBackground from "@/components/ParticleBackground";
import VisitorStats from "@/components/VisitorStats";
import ShareButton from "@/components/ShareButton";
import { getMemorialBySlug, getAllMemorials } from "@/lib/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Memorial } from "@/lib/types";

function getAvatarEmoji(memorial: { name: string; title: string; traits?: string[] }): string {
  const title = memorial.title + (memorial.traits || []).join("");
  if (/教师|老师|教/.test(title)) return "📖";
  if (/医|药|诊/.test(title)) return "⚕️";
  if (/母|妈|奶奶|外婆/.test(title)) return "🥟";
  if (/父|爸|爷爷|外公/.test(title)) return "🕯️";
  if (/军|兵|战/.test(title)) return "🎖️";
  if (/艺|画|音|琴/.test(title)) return "🎨";
  return "🌿";
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://evermind.cn";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const memorial = await getMemorialBySlug(params.id);

  if (!memorial) {
    return {
      title: "纪念馆未找到 — 永念 EverMind",
    };
  }

  const title = `${memorial.name} — ${memorial.title}`;
  const description = memorial.bio
    ? memorial.bio.substring(0, 160)
    : `缅怀 ${memorial.name}，在永念 EverMind 数字纪念空间中，让思念可以对话。`;

  // og:image 回退链：头像 → 首张照片 → 默认品牌图
  const ogImage =
    memorial.avatar ||
    (memorial.photos && memorial.photos.length > 0 ? memorial.photos[0] : "") ||
    "/og-default.png";

  return {
    title,
    description,
    keywords: [memorial.name, memorial.title, "纪念馆", "数字纪念", "AI纪念", "永念", "EverMind"],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/memorial/${memorial.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/memorial/${memorial.slug}`,
      images: [{ url: ogImage, alt: `${memorial.name} 纪念馆`, width: 1200, height: 630 }],
      siteName: "永念 EverMind",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function MemorialPage({ params }: { params: { id: string } }) {
  const memorial: Memorial | null = await getMemorialBySlug(params.id);

  if (!memorial) {
    notFound();
  }

  // 获取其他纪念馆
  const allMemorials = await getAllMemorials();
  const otherMemorials = allMemorials.filter((m) => m.id !== memorial.id).slice(0, 3);

  // 检查是否是owner（显示编辑按钮）
  const session = await getServerSession(authOptions);
  const memorialRecord = await getAllMemorials();
  const currentMemorial = memorialRecord.find((m) => m.id === params.id);
  let isOwner = false;
  if (session?.user?.id && currentMemorial) {
    const { prisma } = await import("@/lib/db");
    const dbMemorial = await prisma.memorial.findUnique({
      where: { slug: params.id },
      select: { ownerId: true },
    });
    isOwner = dbMemorial?.ownerId === session.user.id;
  }

  // 统计各类祭奠数量
  const tributes = memorial.tributes || [];
  const flowerCount = tributes.filter((t) => t.type === "flower").length;
  const candleCount = tributes.filter((t) => t.type === "candle").length;
  const messageCount = tributes.filter((t) => t.type === "message").length;

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />

      {/* Memorial Header */}
      <section className="relative pt-16 overflow-hidden">
        <ParticleBackground />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amethyst-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          {isOwner && (
            <Link
              href={`/edit/${memorial.id}`}
              className="float-right text-sm px-4 py-2 rounded-xl bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30 hover:bg-amethyst-500/30 transition-colors"
            >
              ✏️ 编辑纪念馆
            </Link>
          )}

          <div className="flex items-center gap-2 mb-6">
            <Link href="/memorials" className="text-mist-400 hover:text-amethyst-400 text-sm inline-flex items-center gap-1 transition-colors">
              ← 返回纪念馆列表
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <ShareButton
                slug={memorial.slug || ""}
                name={memorial.name}
                title={memorial.title}
                bio={memorial.bio}
                avatar={memorial.avatar}
              />
            </div>
          </div>

          {/* Memorial Card */}
          <AnimatedSection>
            <div className="glass-card p-8 md:p-12 glow-border">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-midnight-700 to-midnight-800 border-2 border-amethyst-500/30 flex items-center justify-center text-6xl md:text-7xl shadow-lg shadow-amethyst-500/20 overflow-hidden">
                    {memorial.avatar ? (
                      <img src={memorial.avatar} alt={memorial.name} className="w-full h-full object-cover" />
                    ) : (
                      getAvatarEmoji(memorial)
                    )}
                  </div>
                  {memorial.isVerified && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-xs text-amethyst-400">
                      <span>✓</span> 已认证纪念馆
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                    {memorial.name}
                  </h1>
                  <p className="text-mist-400 mb-4">{memorial.title}</p>

                  {/* Traits */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    {(memorial.traits || []).map((trait: string) => (
                      <span
                        key={trait}
                        className="px-3 py-1 rounded-full bg-amethyst-500/10 text-xs text-amethyst-300 border border-amethyst-500/20"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>

                  <p className="text-mist-300 leading-relaxed text-sm md:text-base max-w-2xl">
                    {memorial.bio}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-6 mt-6 justify-center md:justify-start">
                    <div>
                      <div className="text-2xl font-bold text-gradient-gold">{memorial.visitorCount.toLocaleString()}</div>
                      <div className="text-xs text-mist-400">访问</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gradient-gold">{memorial.tributeCount.toLocaleString()}</div>
                      <div className="text-xs text-mist-400">祭奠</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gradient-gold">{memorial.deathYear - memorial.birthYear}</div>
                      <div className="text-xs text-mist-400">岁</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              {(memorial.quotes || []).length > 0 && (
                <div className="mt-8 pt-8 border-t border-amethyst-500/10">
                  <div className="text-center">
                    <div className="text-3xl text-amethyst-500/30 mb-2 font-serif">&ldquo;</div>
                    <p className="text-lg md:text-xl font-serif text-mist-200 italic">
                      {(memorial.quotes || [])[0]}
                    </p>
                    <p className="text-sm text-mist-400 mt-2">— {memorial.name}</p>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Visitor Stats Panel */}
      <section className="max-w-6xl mx-auto px-6 pb-4 w-full">
        <AnimatedSection delay={0.2}>
          <VisitorStats
            visitorCount={memorial.visitorCount}
            tributeCount={memorial.tributeCount}
            flowerCount={flowerCount}
            candleCount={candleCount}
            messageCount={messageCount}
          />
        </AnimatedSection>
      </section>

      {/* Main Content - Two Column */}
      <section className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: AI Chat */}
          <div className="lg:col-span-3">
            <AnimatedSection delay={0.1}>
              <div className="mb-4">
                <h2 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
                  <span className="text-amethyst-400">✨</span>
                  AI 对话
                </h2>
                <p className="text-sm text-mist-400 mt-1">与{memorial.name}的AI数字形象对话，感受TA的说话风格</p>
              </div>
              <MemorialChat memorial={memorial} />

              {/* Personality Info */}
              {memorial.personality && (
                <div className="glass-card p-6 mt-6">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span>🧠</span> AI人格特征
                  </h3>
                  <p className="text-sm text-mist-400 leading-relaxed mb-4">
                    {memorial.personality}
                  </p>
                  {(memorial.quotes || []).length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-mist-400 mb-2">经典语录：</div>
                      {(memorial.quotes || []).map((quote: string, i: number) => (
                        <div key={i} className="text-sm text-mist-300 italic border-l-2 border-amethyst-500/30 pl-3">
                          &ldquo;{quote}&rdquo;
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AnimatedSection>
          </div>

          {/* Right: Tribute Panel */}
          <div className="lg:col-span-2">
            <AnimatedSection delay={0.2}>
              <div className="mb-4">
                <h2 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
                  <span className="text-gold-400">🕯️</span>
                  祭奠纪念
                </h2>
                <p className="text-sm text-mist-400 mt-1">献花、点烛、留言，表达你的思念</p>
              </div>
              <TributePanel
                tributes={memorial.tributes || []}
                memorialName={memorial.name}
                memorialSlug={memorial.slug}
                tributeCount={memorial.tributeCount}
                visitorCount={memorial.visitorCount}
              />
            </AnimatedSection>
          </div>
        </div>

        {/* Timeline Section */}
        {(memorial.timeline || []).length > 0 && (
          <div className="mt-16">
            <AnimatedSection>
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                  <span className="text-gradient-purple">生平时间线</span>
                </h2>
                <p className="text-sm text-mist-400">{memorial.name}的一生，每一个重要时刻</p>
              </div>
            </AnimatedSection>
            <div className="max-w-3xl mx-auto">
              <Timeline events={memorial.timeline ?? []} name={memorial.name} />
            </div>
          </div>
        )}

        {/* Photo Wall */}
        <div className="mt-16">
          <AnimatedSection>
            <div className="mb-8 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                <span className="text-gradient-purple">记忆照片墙</span>
              </h2>
              <p className="text-sm text-mist-400">那些被定格的温暖瞬间</p>
            </div>
            <PhotoWall photos={memorial.photos || []} />
          </AnimatedSection>
        </div>

        {/* Time Letter */}
        <div className="mt-16">
          <AnimatedSection>
            <TimeLetterPanel
              memorialSlug={memorial.id}
              memorialName={memorial.name}
            />
          </AnimatedSection>
        </div>

        {/* Other Memorials */}
        {otherMemorials.length > 0 && (
          <div className="mt-16">
            <AnimatedSection>
              <h2 className="text-xl font-serif font-semibold text-white mb-6 text-center">
                其他纪念馆
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {otherMemorials.map((m) => (
                  <Link
                    key={m.id}
                    href={`/memorial/${m.id}`}
                    className="glass-card p-5 hover:glow-border transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center text-2xl">
                        {getAvatarEmoji(m)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-amethyst-400 transition-colors">
                          {m.name}
                        </div>
                        <div className="text-xs text-mist-400">{m.title}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </AnimatedSection>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
