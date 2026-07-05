import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-amethyst-500/10 bg-midnight-950 mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amethyst-500 to-amethyst-700 flex items-center justify-center text-sm">
                🕯️
              </div>
              <span className="text-lg font-serif font-semibold text-gradient-purple">永念 EverMind</span>
            </div>
            <p className="text-sm text-mist-400 leading-relaxed">
              用AI技术让记忆永存，让思念可以对话。
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-mist-200 mb-3">产品</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/memorials" className="text-mist-400 hover:text-amethyst-400 transition-colors">浏览纪念馆</Link></li>
              <li><Link href="/create" className="text-mist-400 hover:text-amethyst-400 transition-colors">创建纪念馆</Link></li>
              <li><Link href="/#features" className="text-mist-400 hover:text-amethyst-400 transition-colors">核心功能</Link></li>
              <li><Link href="/#pricing" className="text-mist-400 hover:text-amethyst-400 transition-colors">价格方案</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-mist-200 mb-3">关于</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#about" className="text-mist-400 hover:text-amethyst-400 transition-colors">关于我们</Link></li>
              <li><a href="#" className="text-mist-400 hover:text-amethyst-400 transition-colors">隐私政策</a></li>
              <li><a href="#" className="text-mist-400 hover:text-amethyst-400 transition-colors">用户协议</a></li>
              <li><a href="#" className="text-mist-400 hover:text-amethyst-400 transition-colors">伦理准则</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-mist-200 mb-3">联系</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-mist-400">support@evermind.ai</li>
              <li className="text-mist-400">客服微信：evermind_ai</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-amethyst-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-mist-400">
            © 2024 永念 EverMind. 保留所有权利.
          </p>
          <p className="text-xs text-mist-400">
            本产品为原型演示版本 · AI回复均为模拟数据
          </p>
        </div>
      </div>
    </footer>
  );
}
