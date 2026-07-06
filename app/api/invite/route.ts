import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

// 生成邀请码
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await req.json();
    const schema = z.object({
      memorialSlug: z.string(),
      expiresInDays: z.number().optional().default(30),
    });

    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "参数有误" }, { status: 400 });
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: result.data.memorialSlug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    if (memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + result.data.expiresInDays);

    const invite = await prisma.inviteCode.create({
      data: {
        code,
        memorialId: memorial.id,
        createdById: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      code: invite.code,
      expiresAt: invite.expiresAt,
      inviteUrl: `/memorial/${memorial.slug}?invite=${code}`,
    });
  } catch {
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}

// 获取纪念馆的所有邀请码
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memorialSlug = searchParams.get("memorialSlug");

    if (!memorialSlug) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: memorialSlug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    if (memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权查看" }, { status: 403 });
    }

    const codes = await prisma.inviteCode.findMany({
      where: { memorialId: memorial.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(codes);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
