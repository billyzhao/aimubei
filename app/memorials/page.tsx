import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllMemorials } from "@/lib/data";
import MemorialSearch from "@/components/MemorialSearch";

export const metadata: Metadata = {
  title: "纪念馆列表 — 永念 EverMind",
  description: "浏览所有公开纪念馆，每一个名字背后都是一段值得铭记的故事。献花、点烛、与AI对话。",
  keywords: ["纪念馆", "数字纪念", "在线祭奠", "AI对话", "永念", "EverMind"],
  openGraph: {
    title: "纪念馆列表 — 永念 EverMind",
    description: "浏览所有公开纪念馆，每一个名字背后都是一段值得铭记的故事。",
    siteName: "永念 EverMind",
  },
};

function getAvatarEmoji(title: string, traits: string[]): string {
  const text = title + traits.join("");
  if (/教师|老师|教/.test(text)) return "📖";
  if (/医|药|诊/.test(text)) return "⚕️";
  if (/母|妈|奶奶|外婆/.test(text)) return "🥟";
  if (/父|爸|爷爷|外公/.test(text)) return "🕯️";
  if (/军|兵|战/.test(text)) return "🎖️";
  if (/艺|画|音|琴/.test(text)) return "🎨";
  return "🌿";
}

export default async function MemorialsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q || "";
  const allMemorials = await getAllMemorials();

  const filtered = q
    ? allMemorials.filter(
        (m) =>
          m.name.includes(q) ||
          m.title.includes(q) ||
          m.bio.includes(q)
      )
    : allMemorials;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-amethyst-400 text-sm tracking-widest uppercase mb-3">纪念馆</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span className="text-gradient-purple">每一个名字</span>，都是一段故事
            </h1>
            <p className="text-mist-400 max-w-2xl mx-auto">
              在这里，每一个生命都被温柔铭记。浏览纪念馆，献上一束花，点亮一支烛。
            </p>
          </div>

          {/* Search Bar */}
          <div className="glass-card p-4 mb-8">
            <MemorialSearch initialQuery={q} />
          </div>

          {/* Memorial Cards */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((memorial) => (
                <Link
                  key={memorial.slug}
                  href={`/memorial/${memorial.slug}`}
                  className="glass-card overflow-hidden hover:glow-border transition-all duration-300 group"
                >
                  {/* Cover */}
                  <div className="h-40 bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 starfield opacity-30" />
                    {memorial.avatar ? (
                      <img src={memorial.avatar} alt={memorial.name} className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                        {getAvatarEmoji(memorial.title, memorial.traits ?? [])}
                      </div>
                    )}
                    {memorial.isVerified && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-amethyst-500/20 text-xs text-amethyst-300 border border-amethyst-500/30 backdrop-blur-sm">
                        ✓ 已认证
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-amethyst-400 transition-colors mb-1">
                      {memorial.name}
                    </h3>
                    <p className="text-sm text-mist-400 mb-3">{memorial.title}</p>
                    <p className="text-xs text-mist-400 leading-relaxed overflow-hidden" style={{ maxHeight: "2.6em" }}>
                      {memorial.bio}
                    </p>

                    {/* Traits */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(memorial.traits ?? []).slice(0, 3).map((trait: string) => (
                        <span
                          key={trait}
                          className="px-2 py-0.5 rounded-full bg-amethyst-500/10 text-xs text-amethyst-300 border border-amethyst-500/15"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-mist-400 pt-3 border-t border-amethyst-500/10">
                      <span className="flex items-center gap-1">👁️ {memorial.visitorCount.toLocaleString()}</span>
                      <span className="flex items-center gap-1">🌸 {memorial.tributeCount.toLocaleString()}</span>
                      <span className="ml-auto text-amethyst-400 group-hover:translate-x-1 transition-transform">
                        进入 →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Create New Card */}
              <Link
                href="/create"
                className="glass-card border-dashed border-2 border-amethyst-500/20 flex flex-col items-center justify-center p-12 hover:glow-border transition-all duration-300 group min-h-[300px]"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">➕</div>
                <h3 className="text-lg font-semibold text-white mb-2">创建新纪念馆</h3>
                <p className="text-sm text-mist-400 text-center">为你爱的人，留一盏灯</p>
              </Link>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-mist-400 mb-2">未找到匹配的纪念馆</p>
              <p className="text-sm text-mist-400/60">试试其他关键词，或<a href="/memorials" className="text-amethyst-400 hover:underline">查看全部</a></p>
            </div>
          )}
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
