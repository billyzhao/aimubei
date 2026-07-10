import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteMemoryCapsule } from "@/lib/data";

// 删除记忆胶囊（仅创建者/馆主）
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; capsuleId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  try {
    await deleteMemoryCapsule(session.user.id, params.capsuleId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "删除失败" },
      { status: 400 }
    );
  }
}
