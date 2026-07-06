import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const letterSchema = z.object({
  memorialSlug: z.string(),
  authorName: z.string().min(1, "请输入你的名字"),
  content: z.string().min(10, "信件内容至少10字").max(5000, "信件不能超过5000字"),
  deliverInDays: z.number().int().min(1).max(365).default(7),
});

// 投递时光信件
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = letterSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "参数有误" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const memorial = await prisma.memorial.findUnique({
      where: { slug: result.data.memorialSlug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    const deliverAt = new Date();
    deliverAt.setDate(deliverAt.getDate() + result.data.deliverInDays);

    const letter = await prisma.timeLetter.create({
      data: {
        memorialId: memorial.id,
        authorName: result.data.authorName,
        authorId: session?.user?.id || null,
        content: result.data.content,
        deliverAt,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      id: letter.id,
      deliverAt: letter.deliverAt,
      message: "信件已封存，将在指定日期送达",
    });
  } catch {
    return NextResponse.json({ error: "投递失败" }, { status: 500 });
  }
}

// 获取纪念馆的时光信件
export async function GET(req: Request) {
  try {
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

    const session = await getServerSession(authOptions);
    const isOwner = memorial.ownerId === session?.user?.id;

    // 非owner只能看到已到期的信件
    const where = isOwner
      ? { memorialId: memorial.id }
      : {
          memorialId: memorial.id,
          status: { in: ["DELIVERED", "REPLIED"] },
          deliverAt: { lte: new Date() },
        };

    const letters = await prisma.timeLetter.findMany({
      where,
      orderBy: { deliverAt: "asc" },
    });

    return NextResponse.json(letters);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
