import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 添加祭奠（献花/点烛/留言）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memorialSlug, type, visitorName, content } = body;

    if (!memorialSlug || !type || !visitorName) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: memorialSlug },
    });

    if (!memorial) {
      return NextResponse.json(
        { error: "纪念馆不存在" },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    const tribute = await prisma.tribute.create({
      data: {
        memorialId: memorial.id,
        type,
        visitorName,
        visitorId: session?.user?.id || null,
        content: content || null,
      },
    });

    await prisma.memorial.update({
      where: { id: memorial.id },
      data: { tributeCount: { increment: 1 } },
    });

    return NextResponse.json({
      id: tribute.id,
      type: tribute.type,
      visitor: tribute.visitorName,
      content: tribute.content || undefined,
      timestamp: tribute.createdAt.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("添加祭奠失败:", error);
    return NextResponse.json(
      { error: "操作失败" },
      { status: 500 }
    );
  }
}
