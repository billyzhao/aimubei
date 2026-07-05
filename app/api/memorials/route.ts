import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 获取公开纪念馆列表
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const memorials = await prisma.memorial.findMany({
    where: {
      isPublic: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { title: { contains: q } },
              { bio: { contains: q } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { tributes: true } },
    },
    orderBy: { visitorCount: "desc" },
  });

  return NextResponse.json(
    memorials.map((m) => ({
      id: m.slug,
      name: m.name,
      title: m.title,
      bio: m.bio,
      birthYear: m.birthYear,
      deathYear: m.deathYear,
      avatar: m.avatar,
      visitorCount: m.visitorCount,
      tributeCount: m._count.tributes,
      isVerified: m.isVerified,
    }))
  );
}
