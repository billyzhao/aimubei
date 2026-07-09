import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { hashPassword } from "@/lib/password";

const createSchema = z.object({
  name: z.string().min(1, "请输入逝者姓名").max(50, "姓名不能超过50字"),
  title: z.string().min(1, "请输入标题").max(100, "标题不能超过100字"),
  bio: z.string().min(10, "请输入生平简介（至少10字）").max(2000, "简介不能超过2000字"),
  personality: z.string().max(500, "性格描述不能超过500字").optional(),
  traits: z.array(z.string()).default([]),
  quotes: z.array(z.string()).default([]),
  birthYear: z.number().int().min(1800, "出生年份不合法").max(new Date().getFullYear()),
  deathYear: z.number().int().min(1800, "逝世年份不合法").max(new Date().getFullYear()),
  timeline: z.array(z.object({
    year: z.number().int(),
    title: z.string(),
    description: z.string(),
    icon: z.string().default("🌿"),
  })).default([]),
  visibility: z.enum(["PUBLIC", "FAMILY", "PRIVATE"]).default("PUBLIC"),
  accessPassword: z.string().min(4, "密码至少4位").max(64).optional(),
  relationship: z.string().max(20, "关系类型不合法").optional(),
  region: z.string().max(20, "地区不合法").optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = createSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "输入信息有误" },
        { status: 400 }
      );
    }

    const data = result.data;

    // 私密纪念馆且设置了密码时，哈希存储
    let accessPasswordHash: string | null = null;
    if (data.visibility === "PRIVATE" && data.accessPassword) {
      accessPasswordHash = await hashPassword(data.accessPassword);
    }

    // 生成 slug：纯 ASCII 字符，避免中文 URL 编码问题
    const randomStr = Math.random().toString(36).substring(2, 8);
    const slug = `m-${Date.now().toString(36)}-${randomStr}`;

    const memorial = await prisma.memorial.create({
      data: {
        slug,
        name: data.name,
        title: data.title,
        bio: data.bio,
        personality: data.personality || null,
        traits: JSON.stringify(data.traits),
        quotes: JSON.stringify(data.quotes),
        birthYear: data.birthYear,
        deathYear: data.deathYear,
        ownerId: session.user.id,
        visibility: data.visibility,
        isPublic: data.visibility === "PUBLIC",
        accessPassword: accessPasswordHash,
        relationship: data.relationship || null,
        region: data.region || null,
        timeline: data.timeline.length
          ? {
              create: data.timeline.map((t, i) => ({
                ...t,
                order: i,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json({
      id: memorial.slug,
      slug: memorial.slug,
      name: memorial.name,
    });
  } catch (error) {
    console.error("创建纪念馆失败:", error);
    return NextResponse.json(
      { error: "创建失败，请稍后重试" },
      { status: 500 }
    );
  }
}
