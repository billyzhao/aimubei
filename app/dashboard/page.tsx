import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotificationActivity from "@/components/NotificationActivity";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMemorialsByOwner } from "@/lib/data";

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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const memorials = await getMemorialsByOwner(session.user.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-12 flex-1">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">
                <span className="text-gradient-purple">我的纪念馆</span>
              </h1>
              <p className="text-mist-400 text-sm">欢迎回来，{session.user.name}</p>
            </div>
            <Link href="/create" className="btn-primary text-sm py-2.5 px-5">
              ➕ 创建新纪念馆
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="glass-card p-5 text-center">
              <div className="text-3xl font-bold text-gradient-gold mb-1">{memorials.length}</div>
              <div className="text-xs text-mist-400">纪念馆数量</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl font-bold text-gradient-gold mb-1">
                {memorials.reduce((sum, m) => sum + m.visitorCount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-mist-400">总访问量</div>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="text-3xl font-bold text-gradient-gold mb-1">
                {memorials.reduce((sum, m) => sum + m.tributeCount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-mist-400">总祭奠数</div>
            </div>
          </div>

          {/* Memorial List */}
          {memorials.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white mb-4">我创建的纪念馆</h2>
              {memorials.map((m) => (
                <div
                  key={m.id}
                  className="glass-card p-5 hover:glow-border transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-midnight-700 to-midnight-800 border border-amethyst-500/20 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        getAvatarEmoji(m.title, [])
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/memorial/${m.slug}`} className="text-lg font-semibold text-white group-hover:text-amethyst-400 transition-colors">
                          {m.name}
                        </Link>
                        {m.isVerified && (
                          <span className="px-2 py-0.5 rounded-full bg-amethyst-500/10 text-xs text-amethyst-300 border border-amethyst-500/20">
                            ✓ 已认证
                          </span>
                        )}
                        {m.visibility === "PRIVATE" && (
                          <span className="px-2 py-0.5 rounded-full bg-midnight-700 text-xs text-mist-400 border border-amethyst-500/10">
                            🔒 私密
                          </span>
                        )}
                        {m.visibility === "FAMILY" && (
                          <span className="px-2 py-0.5 rounded-full bg-midnight-700 text-xs text-mist-400 border border-amethyst-500/10">
                            👨‍👩‍👧‍👦 亲友
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-mist-400 mb-2">{m.title}</p>
                      <div className="flex items-center gap-4 text-xs text-mist-400">
                        <span>👁️ {m.visitorCount.toLocaleString()} 访问</span>
                        <span>🌸 {m.tributeCount.toLocaleString()} 祭奠</span>
                        <span>📸 {m.photoCount} 照片</span>
                        <span>📅 {new Date(m.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/edit/${m.slug}`}
                        className="px-3 py-2 rounded-xl bg-amethyst-500/10 text-amethyst-300 border border-amethyst-500/20 text-xs hover:bg-amethyst-500/20 transition-colors"
                      >
                        ✏️ 编辑
                      </Link>
                      <Link
                        href={`/memorial/${m.slug}`}
                        className="text-amethyst-400 group-hover:translate-x-1 transition-transform"
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-16 text-center">
              <div className="text-6xl mb-6">🕯️</div>
              <h3 className="text-xl font-semibold text-white mb-3">还没有创建纪念馆</h3>
              <p className="text-mist-400 text-sm mb-8 max-w-md mx-auto">
                为你爱的人，创建一座永恒的数字纪念空间。让思念有处安放，让记忆永远鲜活。
              </p>
              <Link href="/create" className="btn-gold text-sm inline-block">
                ✨ 开始创建
              </Link>
            </div>
          )}

          {/* Latest Activity (通知动态) */}
          <div id="activity" className="mt-12 scroll-mt-24">
            <NotificationActivity />
          </div>

          {/* Account Settings Preview */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-white mb-4">账户信息</h2>
            <div className="glass-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-2xl text-white font-semibold">
                  {session.user.name?.[0] || "U"}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{session.user.name}</div>
                  <div className="text-sm text-mist-400">{session.user.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-mist-400 text-xs mb-1">账户类型</div>
                  <div className="text-mist-200">免费用户</div>
                </div>
                <div>
                  <div className="text-mist-400 text-xs mb-1">会员到期</div>
                  <div className="text-mist-200">—</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-amethyst-500/10">
                <Link href="/settings" className="btn-secondary text-sm inline-block">
                  ⚙️ 账户设置
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
