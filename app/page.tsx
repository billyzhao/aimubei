import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 starfield opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amethyst-600/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-20">
          {/* Floating candle */}
          <div className="mb-8 flex justify-center animate-fade-in">
            <div className="relative">
              <div className="text-6xl animate-float">🕯️</div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-gold-400/20 blur-xl rounded-full" />
            </div>
          </div>

          <p className="text-amethyst-400 text-sm tracking-[0.3em] uppercase mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            AI 数字纪念空间
          </p>

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <span className="text-gradient-purple">让思念</span>
            <br />
            <span className="text-white">可以对话</span>
          </h1>

          <p className="text-lg md:text-xl text-mist-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            用AI技术让逝者的记忆活下去。
            <br />
            把冰冷的石碑，变成可交互的数字纪念空间。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            <Link href="/create" className="btn-primary text-base px-8 py-4">
              创建纪念馆 →
            </Link>
            <Link href="/memorials" className="btn-secondary text-base px-8 py-4">
              浏览纪念馆
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.9s" }}>
            <div>
              <div className="text-3xl font-bold text-gradient-gold">1,247</div>
              <div className="text-sm text-mist-400 mt-1">已建纪念馆</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-gold">58,932</div>
              <div className="text-sm text-mist-400 mt-1">累计访问</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gradient-gold">12,456</div>
              <div className="text-sm text-mist-400 mt-1">AI对话次数</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amethyst-400 text-sm tracking-widest uppercase mb-3">核心功能</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              <span className="text-gradient-purple">四维纪念</span>，超越时空
            </h2>
            <p className="text-mist-400 max-w-2xl mx-auto">
              不只是存一张照片、一段文字。我们用AI让逝者的性格、声音、故事都能被"唤醒"。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 hover:glow-border transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amethyst-500/20 to-amethyst-700/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                🧠
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI人格复刻</h3>
              <p className="text-sm text-mist-400 leading-relaxed">
                基于逝者文字资料、聊天记录训练专属大模型，还原说话风格、性格特征和思维模式。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 hover:glow-border transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-500/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                🎙️
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">语音克隆</h3>
              <p className="text-sm text-mist-400 leading-relaxed">
                只需3分钟语音样本，即可复刻逝者原声。让AI的回复带着熟悉的声音，如临其境。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 hover:glow-border transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400/20 to-rose-500/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                ✉️
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">时光信箱</h3>
              <p className="text-sm text-mist-400 leading-relaxed">
                生前预设定时信件，或让AI以逝者口吻回信。在生日、节日收到"来自天堂的问候"。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 hover:glow-border transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amethyst-400/20 to-mist-300/20 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                🌳
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">家族传承</h3>
              <p className="text-sm text-mist-400 leading-relaxed">
                家族树串联几代人的记忆，记忆胶囊封存给后代的寄语，让爱跨越时间代代相传。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-midnight-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amethyst-400 text-sm tracking-widest uppercase mb-3">使用流程</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              三步创建，<span className="text-gradient-purple">永久保存</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="glass-card p-8 h-full">
                <div className="text-5xl mb-4">📝</div>
                <div className="text-amethyst-400 text-sm font-mono mb-2">STEP 01</div>
                <h3 className="text-xl font-semibold text-white mb-3">录入信息</h3>
                <p className="text-sm text-mist-400 leading-relaxed">
                  上传逝者照片、生平故事、文字作品、聊天记录。信息越丰富，AI复刻越真实。
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 text-amethyst-500/30 text-2xl">→</div>
            </div>

            <div className="relative">
              <div className="glass-card p-8 h-full">
                <div className="text-5xl mb-4">⚡</div>
                <div className="text-amethyst-400 text-sm font-mono mb-2">STEP 02</div>
                <h3 className="text-xl font-semibold text-white mb-3">AI训练</h3>
                <p className="text-sm text-mist-400 leading-relaxed">
                  系统自动分析性格特征、语言风格，训练专属AI人格模型。训练完成即可对话。
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 text-amethyst-500/30 text-2xl">→</div>
            </div>

            <div>
              <div className="glass-card p-8 h-full">
                <div className="text-5xl mb-4">💬</div>
                <div className="text-amethyst-400 text-sm font-mono mb-2">STEP 03</div>
                <h3 className="text-xl font-semibold text-white mb-3">永久对话</h3>
                <p className="text-sm text-mist-400 leading-relaxed">
                  随时访问纪念馆，与逝者AI对话、献花祭奠、查看时间线。记忆永不褪色。
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/create" className="btn-primary text-base px-8 py-4">
              立即创建 →
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amethyst-400 text-sm tracking-widest uppercase mb-3">纪念馆示例</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              每个生命，<span className="text-gradient-purple">都值得被记住</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/memorial/zhanglaoshi" className="glass-card p-6 hover:glow-border transition-all duration-300 group">
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-amethyst-600/20 to-midnight-800 flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform">
                📖
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">张明远</h3>
              <p className="text-sm text-mist-400 mb-3">人民教师 · 1948-2023</p>
              <p className="text-xs text-mist-400 leading-relaxed">从教四十载，桃李满天下...</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-mist-400">
                <span>👁️ 3,287</span>
                <span>🌸 456</span>
                <span className="text-amethyst-400">已认证 ✓</span>
              </div>
            </Link>

            <Link href="/memorial/linnainai" className="glass-card p-6 hover:glow-border transition-all duration-300 group">
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-rose-400/20 to-midnight-800 flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform">
                🥟
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">林秀珍</h3>
              <p className="text-sm text-mist-400 mb-3">慈母 · 1952-2024</p>
              <p className="text-xs text-mist-400 leading-relaxed">一位普通的母亲，用一生诠释无私的爱...</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-mist-400">
                <span>👁️ 1,543</span>
                <span>🌸 289</span>
                <span className="text-amethyst-400">已认证 ✓</span>
              </div>
            </Link>

            <Link href="/memorial/chenyisheng" className="glass-card p-6 hover:glow-border transition-all duration-300 group">
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-mist-300/20 to-midnight-800 flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform">
                ⚕️
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">陈志远</h3>
              <p className="text-sm text-mist-400 mb-3">医者 · 1965-2024</p>
              <p className="text-xs text-mist-400 leading-relaxed">主刀过万台手术的外科医生...</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-mist-400">
                <span>👁️ 2,156</span>
                <span>🌸 378</span>
                <span className="text-amethyst-400">已认证 ✓</span>
              </div>
            </Link>
          </div>

          <div className="text-center mt-10">
            <Link href="/memorials" className="btn-secondary text-base px-8 py-4">
              查看全部纪念馆
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding bg-midnight-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amethyst-400 text-sm tracking-widest uppercase mb-3">价格方案</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              选择适合的，<span className="text-gradient-purple">让爱延续</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 text-center">
              <div className="text-3xl mb-3">🌿</div>
              <h3 className="text-xl font-semibold text-white mb-2">基础版</h3>
              <p className="text-mist-400 text-sm mb-4">永久免费</p>
              <div className="text-4xl font-bold text-white mb-6">¥0</div>
              <ul className="space-y-3 text-sm text-mist-400 text-left mb-8">
                <li>✓ 纪念馆创建</li>
                <li>✓ 基础信息展示</li>
                <li>✓ 生平时间线</li>
                <li>✓ 祭奠互动</li>
                <li className="text-mist-400/50">— AI对话（每日3条）</li>
                <li className="text-mist-400/50">— 语音克隆</li>
              </ul>
              <Link href="/create" className="btn-secondary w-full block text-center">免费开始</Link>
            </div>

            <div className="glass-card p-8 text-center relative glow-border">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amethyst-600 to-amethyst-500 rounded-full text-xs text-white font-medium">
                推荐
              </div>
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="text-xl font-semibold text-white mb-2">Pro版</h3>
              <p className="text-mist-400 text-sm mb-4">年付</p>
              <div className="text-4xl font-bold text-gradient-gold mb-1">¥299<span className="text-base text-mist-400">/年</span></div>
              <ul className="space-y-3 text-sm text-mist-400 text-left mb-8 mt-6">
                <li>✓ 基础版全部功能</li>
                <li>✓ 无限AI对话</li>
                <li>✓ 语音克隆（原声复刻）</li>
                <li>✓ 时光信箱</li>
                <li>✓ 照片墙（500张）</li>
                <li>✓ 视频纪念</li>
              </ul>
              <Link href="/create" className="btn-primary w-full block text-center">升级 Pro</Link>
            </div>

            <div className="glass-card p-8 text-center">
              <div className="text-3xl mb-3">🌳</div>
              <h3 className="text-xl font-semibold text-white mb-2">家族版</h3>
              <p className="text-mist-400 text-sm mb-4">年付</p>
              <div className="text-4xl font-bold text-white mb-6">¥899<span className="text-base text-mist-400">/年</span></div>
              <ul className="space-y-3 text-sm text-mist-400 text-left mb-8">
                <li>✓ Pro版全部功能</li>
                <li>✓ 家族树（多纪念馆）</li>
                <li>✓ 记忆胶囊</li>
                <li>✓ 跨代际传承</li>
                <li>✓ 无限照片存储</li>
                <li>✓ 专属客服</li>
              </ul>
              <Link href="/create" className="btn-secondary w-full block text-center">选择家族版</Link>
            </div>
          </div>
        </div>
      </section>

      {/* About / Ethics */}
      <section id="about" className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-6">🤝</div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            <span className="text-gradient-purple">科技向善</span>，敬畏生命
          </h2>
          <p className="text-mist-300 leading-relaxed mb-8 text-lg">
            我们深知这项技术的敏感与重量。永念始终遵循严格的伦理准则：
            AI复刻须经过本人生前授权或直系亲属知情同意；所有数据归用户所有，可随时删除；
            AI生成的回复始终标注"模拟"标识；我们设有心理安全监测机制，防止用户过度依赖。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="glass-card p-6">
              <div className="text-2xl mb-2">🔐</div>
              <h4 className="text-white font-semibold mb-1">数据主权</h4>
              <p className="text-sm text-mist-400">用户数据归用户所有，可随时导出或删除</p>
            </div>
            <div className="glass-card p-6">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="text-white font-semibold mb-1">知情同意</h4>
              <p className="text-sm text-mist-400">复刻须经本人授权或直系亲属同意</p>
            </div>
            <div className="glass-card p-6">
              <div className="text-2xl mb-2">💙</div>
              <h4 className="text-white font-semibold mb-1">心理安全</h4>
              <p className="text-sm text-mist-400">监测使用频率，防止过度依赖和情感伤害</p>
            </div>
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
