import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkMemorialAccess } from "@/lib/data";
import { z } from "zod";

// 从请求头解析指定名称的 cookie
function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

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

// 获取单个纪念馆详情（含 visibility 访问控制）
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

    // PUBLIC 纪念馆：任何人可访问
    if (memorial.visibility === "PUBLIC") {
      return NextResponse.json(memorial);
    }

    // 获取当前会话 + 访问凭证（密码/邀请码 cookie，或 URL ?invite=）
    const session = await getServerSession(authOptions);
    const cookieToken = getCookie(req, `mem_access_${memorial.slug}`);
    const urlInvite = new URL(req.url).searchParams.get("invite");
    const token = cookieToken || (urlInvite ? `invite:${urlInvite}` : undefined);

    const access = await checkMemorialAccess(
      {
        id: memorial.id,
        ownerId: memorial.ownerId,
        visibility: memorial.visibility,
        accessPassword: memorial.accessPassword,
      },
      session,
      token
    );

    if (!access.allowed) {
      const status = access.reason === "not_found" ? 404 : 403;
      return NextResponse.json(
        {
          error:
            access.reason === "private"
              ? "这是私密纪念馆，需要密码或所有者权限"
              : access.reason === "family"
              ? "这是亲友纪念馆，需要邀请码"
              : "无权访问",
          accessDenied: true,
          requirePassword: access.requirePassword,
          requireInvite: access.requireInvite,
        },
        { status }
      );
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
