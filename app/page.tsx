import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { ReactNode } from "react";
import MemorialCard from "@/components/MemorialCard";
import {
  getFeaturedMemorials,
  getPublicMemorialCount,
  getRecommendedMemorials,
} from "@/lib/data";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 首页依赖数据库，禁止构建期静态预渲染（DB 由容器 entrypoint 在运行时初始化）
export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const popular = await getFeaturedMemorials(6, "popular");
  const newest = await getFeaturedMemorials(6, "newest");
  const recommended =
    session?.user?.id
      ? await getRecommendedMemorials(session.user.id, 6)
      : [];
  const totalMemorials = await getPublicMemorialCount();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <HeroSection totalMemorials={totalMemorials} />

      {/* Hot Rail */}
      {popular.length > 0 && (
        <Rail title="🔥 热门纪念馆" subtitle="被祭奠与访问最多的纪念空间" href="/memorials">
          {popular.map((m) => (
            <MemorialCard key={m.slug} memorial={m} />
          ))}
        </Rail>
      )}

      {/* Newest Rail */}
      {newest.length > 0 && (
        <Rail title="🆕 最近新增" subtitle="新近创建的纪念馆" href="/memorials?sort=newest">
          {newest.map((m) => (
            <MemorialCard key={m.slug} memorial={m} />
          ))}
        </Rail>
      )}

      {/* Personalized Recommendation Rail (logged in only) */}
      {recommended.length > 0 && (
        <Rail
          title="💜 为你推荐"
          subtitle="根据你创建的纪念馆，也许你会想看看这些"
          href="/memorials"
        >
          {recommended.map((m) => (
            <MemorialCard key={m.slug} memorial={m} />
          ))}
        </Rail>
      )}

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amethyst-400 text-sm tracking-widest uppercase mb-3">
              核心功能
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span className="text-gradient-purple">四维纪念</span>，超越时空
            </h2>
            <p className="text-mist-400 max-w-2xl mx-auto">
              不只是存一张照片、一段文字。我们用AI让逝者的性格、声音、故事都能被唤醒。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              emoji="🧠"
              title="AI人格复刻"
              desc="基于逝者文字资料、聊天记录训练专属大模型，还原说话风格、性格特征和思维模式。"
              color="amethyst"
            />
            <FeatureCard
              emoji="🎙️"
              title="语音克隆"
              desc="只需3分钟语音样本，即可复刻逝者原声。让AI的回复带着熟悉的声音，如临其境。"
              color="gold"
            />
            <FeatureCard
              emoji="✉️"
              title="时光信箱"
              desc="生前预设定时信件，或让AI以逝者口吻回信。在生日、节日收到来自天堂的问候。"
              color="rose"
            />
            <FeatureCard
              emoji="🌳"
              title="家族传承"
              desc="家族树串联几代人的记忆，记忆胶囊封存给后代的寄语，让爱跨越时间代代相传。"
              color="mist"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-midnight-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amethyst-400 text-sm tracking-widest uppercase mb-3">
              使用流程
            </p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              三步创建，<span className="text-gradient-purple">永久保存</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard step="01" emoji="📝" title="录入信息" desc="上传逝者照片、生平故事、文字作品、聊天记录。信息越丰富，AI复刻越真实。" />
            <StepCard step="02" emoji="⚡" title="AI训练" desc="系统自动分析性格特征、语言风格，训练专属AI人格模型。训练完成即可对话。" />
            <StepCard step="03" emoji="💬" title="永久对话" desc="随时访问纪念馆，与逝者AI对话、献花祭奠、查看时间线。记忆永不褪色。" />
          </div>

          <div className="text-center mt-12">
            <Link href="/create" className="btn-primary text-base px-8 py-4">
              立即创建 →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 glow-border">
          <div className="text-5xl mb-4">🕯️</div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            为你爱的人，<span className="text-gradient-purple">留一盏灯</span>
          </h2>
          <p className="text-mist-400 mb-8 text-lg">
            记忆会褪色，但爱不会。今天就开始，为逝去的亲人创建一个永恒的数字纪念空间。
          </p>
          <Link href="/create" className="btn-primary text-base px-10 py-4">
            免费创建纪念馆 →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ---------- Sub-components ----------

function Rail({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold">{title}</h2>
            <p className="text-sm text-mist-400 mt-1">{subtitle}</p>
          </div>
          <Link
            href={href}
            className="text-sm text-amethyst-400 hover:text-amethyst-300 whitespace-nowrap"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      </div>
    </section>
  );
}

function HeroSection({ totalMemorials }: { totalMemorials: number }) {
  return (
    <section className="relative flex-1 flex items-center justify-center pt-16 overflow-hidden min-h-[80vh]">
      <div className="absolute inset-0 starfield opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amethyst-600/10 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-20">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="text-6xl">🕯️</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-gold-400/20 blur-xl rounded-full" />
          </div>
        </div>

        <p className="text-amethyst-400 text-sm tracking-[0.3em] uppercase mb-4">
          AI 数字纪念空间
        </p>

        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
          <span className="text-gradient-purple">让思念</span>
          <br />
          <span className="text-white">可以对话</span>
        </h1>

        <p className="text-lg md:text-xl text-mist-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          用AI技术让逝者的记忆活下去。
          <br />
          把冰冷的石碑，变成可交互的数字纪念空间。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create" className="btn-primary text-base px-8 py-4">
            创建纪念馆 →
          </Link>
          <Link href="/memorials" className="btn-secondary text-base px-8 py-4">
            浏览纪念馆
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-gradient-gold">{totalMemorials}</div>
            <div className="text-sm text-mist-400 mt-1">公开纪念馆</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gradient-gold">24h</div>
            <div className="text-sm text-mist-400 mt-1">AI随时在线</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gradient-gold">∞</div>
            <div className="text-sm text-mist-400 mt-1">记忆永存</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ emoji, title, desc, color }: { emoji: string; title: string; desc: string; color: string }) {
  const gradient =
    color === "gold"
      ? "from-gold-400/20 to-gold-500/20"
      : color === "rose"
      ? "from-rose-400/20 to-rose-500/20"
      : color === "mist"
      ? "from-mist-300/20 to-mist-400/20"
      : "from-amethyst-500/20 to-amethyst-700/20";

  return (
    <div className="glass-card p-6 hover:glow-border transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
        {emoji}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-mist-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, emoji, title, desc }: { step: string; emoji: string; title: string; desc: string }) {
  return (
    <div className="relative">
      <div className="glass-card p-8 h-full">
        <div className="text-5xl mb-4">{emoji}</div>
        <div className="text-amethyst-400 text-sm font-mono mb-2">STEP {step}</div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-sm text-mist-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
