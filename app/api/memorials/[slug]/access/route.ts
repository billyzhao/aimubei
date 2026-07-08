import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 天

// 验证纪念馆访问凭证（密码 / 邀请码），成功则下发 httpOnly cookie
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const memorial = await prisma.memorial.findUnique({
      where: { slug: params.slug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    // PRIVATE 密码验证
    if (typeof body.password === "string") {
      if (memorial.visibility !== "PRIVATE" || !memorial.accessPassword) {
        return NextResponse.json({ error: "该纪念馆无需密码或不是私密纪念馆" }, { status: 400 });
      }
      const ok = await verifyPassword(body.password, memorial.accessPassword);
      if (!ok) {
        return NextResponse.json({ error: "密码错误" }, { status: 403 });
      }
      const res = NextResponse.json({ ok: true });
      res.cookies.set(`mem_access_${memorial.slug}`, `pw:${memorial.accessPassword}`, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
      return res;
    }

    // FAMILY 邀请码验证
    if (typeof body.invite === "string") {
      if (memorial.visibility !== "FAMILY") {
        return NextResponse.json({ error: "该纪念馆不是亲友纪念馆" }, { status: 400 });
      }
      const code = body.invite.trim().toUpperCase();
      const invite = await prisma.inviteCode.findFirst({
        where: {
          code,
          memorialId: memorial.id,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });
      if (!invite) {
        return NextResponse.json({ error: "邀请码无效或已过期" }, { status: 403 });
      }
      const res = NextResponse.json({ ok: true });
      res.cookies.set(`mem_access_${memorial.slug}`, `invite:${code}`, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ error: "缺少验证参数" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}

// 退出访问（清除 cookie）
export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(`mem_access_${params.slug}`, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
