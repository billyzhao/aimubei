import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const timelineSchema = z.object({
  memorialSlug: z.string(),
  year: z.number().int(),
  title: z.string().min(1, "请输入标题"),
  description: z.string().min(1, "请输入描述"),
  icon: z.string().default("🌿"),
});

// 添加时间线事件
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await req.json();
    const result = timelineSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "参数有误" },
        { status: 400 }
      );
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: result.data.memorialSlug },
      include: { _count: { select: { timeline: true } } },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    if (memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const event = await prisma.timelineEvent.create({
      data: {
        memorialId: memorial.id,
        year: result.data.year,
        title: result.data.title,
        description: result.data.description,
        icon: result.data.icon,
        order: memorial._count.timeline,
      },
    });

    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}

// 删除时间线事件
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "缺少事件ID" }, { status: 400 });
    }

    const event = await prisma.timelineEvent.findUnique({
      where: { id: eventId },
      include: { memorial: true },
    });

    if (!event) {
      return NextResponse.json({ error: "事件不存在" }, { status: 404 });
    }

    if (event.memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    await prisma.timelineEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "已删除" });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
