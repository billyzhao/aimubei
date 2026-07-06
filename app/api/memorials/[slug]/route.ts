import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(50).optional(),
  title: z.string().max(100).optional(),
  bio: z.string().min(10, "简介至少10字").max(2000).optional(),
  personality: z.string().max(500).optional(),
  traits: z.array(z.string()).optional(),
  quotes: z.array(z.string()).optional(),
  birthYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  deathYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
});

// 获取单个纪念馆详情（编辑用）
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const memorial = await prisma.memorial.findUnique({
      where: { slug: params.slug },
      include: {
        timeline: { orderBy: { order: "asc" } },
        photos: { orderBy: { order: "asc" } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    return NextResponse.json(memorial);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 更新纪念馆
export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: params.slug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    if (memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权编辑他人的纪念馆" }, { status: 403 });
    }

    const body = await req.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "输入信息有误" },
        { status: 400 }
      );
    }

    const data = result.data;
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.personality !== undefined) updateData.personality = data.personality || null;
    if (data.traits !== undefined) updateData.traits = JSON.stringify(data.traits);
    if (data.quotes !== undefined) updateData.quotes = JSON.stringify(data.quotes);
    if (data.birthYear !== undefined) updateData.birthYear = data.birthYear;
    if (data.deathYear !== undefined) updateData.deathYear = data.deathYear;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;

    const updated = await prisma.memorial.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json({
      slug: updated.slug,
      name: updated.name,
      message: "更新成功",
    });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除纪念馆
export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: params.slug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    if (memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权删除他人的纪念馆" }, { status: 403 });
    }

    await prisma.memorial.delete({
      where: { id: memorial.id },
    });

    return NextResponse.json({ message: "纪念馆已删除" });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
