import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar } = body;

    const data: { name?: string | null; avatar?: string | null } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.length > 50) {
        return NextResponse.json({ error: "昵称不合法" }, { status: 400 });
      }
      data.name = name || null;
    }

    if (avatar !== undefined) {
      data.avatar = avatar;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新个人信息失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
