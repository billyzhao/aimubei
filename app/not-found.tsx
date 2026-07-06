import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-8xl mb-6 animate-float">🕯️</div>
      <h1 className="text-6xl md:text-8xl font-serif font-bold text-gradient-purple mb-4">
        404
      </h1>
      <p className="text-xl md:text-2xl text-mist-200 mb-2">
        纪念馆不在这里
      </p>
      <p className="text-mist-400 max-w-md mb-10 leading-relaxed">
        也许这盏灯已经熄灭，也许地址有误。
        <br />
        不如回到首页，为你爱的人点亮一盏新的灯。
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="btn-primary text-base px-8 py-3">
          回到首页
        </Link>
        <Link href="/memorials" className="btn-secondary text-base px-8 py-3">
          浏览纪念馆
        </Link>
      </div>

      {/* Decorative floating elements */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-amethyst-600/5 rounded-full blur-3xl animate-float" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
    </div>
  );
}
