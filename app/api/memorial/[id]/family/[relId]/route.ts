import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { removeFamilyRelation } from "@/lib/data";

// 删除家族关系（馆主鉴权）
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; relId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  try {
    await removeFamilyRelation(session.user.id, params.id, params.relId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "删除失败" },
      { status: 400 }
    );
  }
}
