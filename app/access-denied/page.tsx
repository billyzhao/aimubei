import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-8xl mb-6">🔒</div>
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-purple mb-4">
        这盏灯只为主人亮着
      </h1>
      <p className="text-mist-300 max-w-md mb-10 leading-relaxed">
        这个纪念馆设置了访问权限，只有亲友才能进入。
        <br />
        如果你是本纪念馆的亲友，请向馆主索取邀请码。
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="btn-primary text-base px-8 py-3">
          回到首页
        </Link>
        <Link href="/memorials" className="btn-secondary text-base px-8 py-3">
          浏览公开纪念馆
        </Link>
      </div>
    </div>
  );
}
