import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listMemoryCapsules, createMemoryCapsule } from "@/lib/data";

// 列出记忆胶囊（惰性解锁 + 可见性过滤）
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const capsules = await listMemoryCapsules(params.id, {
    userId: session?.user?.id || null,
  });
  return NextResponse.json(capsules);
}

// 封存新的记忆胶囊（仅馆主）
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
    const { title, content, unlockAt, visibility } = body || {};
    if (!title || !content || !unlockAt) {
      return NextResponse.json({ error: "参数缺失" }, { status: 400 });
    }
    const unlockDate = new Date(unlockAt);
    if (isNaN(unlockDate.getTime())) {
      return NextResponse.json({ error: "解锁日期无效" }, { status: 400 });
    }
    const capsule = await createMemoryCapsule(
      session.user.id,
      session.user.name || "家人",
      params.id,
      { title, content, unlockAt: unlockDate, visibility }
    );
    return NextResponse.json({
      id: capsule.id,
      unlockAt: capsule.unlockAt,
      message: "记忆胶囊已封存",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "封存失败" },
      { status: 400 }
    );
  }
}
