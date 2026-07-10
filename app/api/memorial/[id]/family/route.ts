import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFamilyRelations, addFamilyRelation } from "@/lib/data";

// 取得以本纪念馆为视角的关系列表
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const relations = await getFamilyRelations(params.id);
  return NextResponse.json(relations);
}

// 添加家族关系（馆主鉴权）
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { relatedSlug, type, note } = body;
    if (!relatedSlug || !type) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 });
    }
    const rel = await addFamilyRelation(
      session.user.id,
      params.id,
      relatedSlug,
      type,
      note
    );
    return NextResponse.json(rel);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "添加失败" },
      { status: 400 }
    );
  }
}
