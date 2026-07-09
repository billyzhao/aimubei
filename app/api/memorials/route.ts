import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 获取公开纪念馆列表
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const yearParam = searchParams.get("year");
  const year = yearParam && /^\d{4}$/.test(yearParam) ? parseInt(yearParam, 10) : undefined;

  const isYearQuery = !!q && /^\d{4}$/.test(q);
  const yearFromQ = isYearQuery ? parseInt(q, 10) : undefined;
  const searchYear = year ?? yearFromQ;

  const where: any = {
    isPublic: true,
  };
  const or: any[] = [];

  if (q && !isYearQuery) {
    or.push(
      { name: { contains: q } },
      { title: { contains: q } },
      { bio: { contains: q } },
      { personality: { contains: q } },
      { traits: { contains: q } },
      { quotes: { contains: q } }
    );
  }
  if (searchYear) {
    or.push({ birthYear: searchYear }, { deathYear: searchYear });
  }
  if (or.length) where.OR = or;

  const memorials = await prisma.memorial.findMany({
    where,
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
