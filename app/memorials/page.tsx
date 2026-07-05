import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockMemorials } from "@/lib/mockData";

export default function MemorialsPage() {
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

          {/* Search & Filter Bar */}
          <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="搜索纪念馆..."
                className="w-full bg-midnight-700/60 text-mist-200 placeholder-mist-400/50 rounded-xl px-4 py-2.5 text-sm border border-amethyst-500/15 focus:outline-none focus:border-amethyst-500/40 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {["全部", "教师", "医者", "家人", "军人", "艺术家"].map((tag, i) => (
                <button
                  key={tag}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    i === 0
                      ? "bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30"
                      : "bg-midnight-700/40 text-mist-400 border border-transparent hover:border-amethyst-500/20"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Memorial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMemorials.map((memorial) => (
              <Link
                key={memorial.id}
                href={`/memorial/${memorial.id}`}
                className="glass-card overflow-hidden hover:glow-border transition-all duration-300 group"
              >
                {/* Cover */}
                <div className="h-40 bg-gradient-to-br from-midnight-700 to-midnight-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 starfield opacity-30" />
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {memorial.id === "zhanglaoshi" ? "📖" : memorial.id === "linnainai" ? "🥟" : "⚕️"}
                  </div>
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
                  <p className="text-xs text-mist-400 leading-relaxed line-clamp-2 mb-4">
                    {memorial.bio}
                  </p>

                  {/* Traits */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {memorial.traits.slice(0, 3).map((trait) => (
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
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
