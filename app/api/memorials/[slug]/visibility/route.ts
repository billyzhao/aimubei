import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const visibilitySchema = z.object({
  visibility: z.enum(["PUBLIC", "FAMILY", "PRIVATE"]),
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
      return NextResponse.json({ error: "参数有误" }, { status: 400 });
    }

    const updated = await prisma.memorial.update({
      where: { id: memorial.id },
      data: {
        visibility: result.data.visibility,
        isPublic: result.data.visibility === "PUBLIC",
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
