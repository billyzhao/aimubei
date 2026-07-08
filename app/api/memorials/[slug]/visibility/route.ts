import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { hashPassword } from "@/lib/password";

const visibilitySchema = z.object({
  visibility: z.enum(["PUBLIC", "FAMILY", "PRIVATE"]),
  accessPassword: z.string().min(4, "密码至少4位").max(64).optional(),
});

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
      return NextResponse.json({ error: "无权修改" }, { status: 403 });
    }

    const body = await req.json();
    const result = visibilitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "参数有误" }, { status: 400 });
    }

    const { visibility, accessPassword } = result.data;

    // 计算访问密码：仅 PRIVATE 且提供了密码时生效；否则清空
    let accessPasswordHash: string | null = null;
    if (visibility === "PRIVATE" && accessPassword) {
      accessPasswordHash = await hashPassword(accessPassword);
    }

    const updated = await prisma.memorial.update({
      where: { id: memorial.id },
      data: {
        visibility,
        isPublic: visibility === "PUBLIC",
        accessPassword: accessPasswordHash,
      },
    });

    return NextResponse.json({
      visibility: updated.visibility,
      message: "权限设置已更新",
    });
  } catch {
    return NextResponse.json({ error: "设置失败" }, { status: 500 });
  }
}
