import { prisma } from "./db";
import type { Memorial, TimelineEvent, Tribute } from "./types";

// ====================================
// 纪念馆查询
// ====================================

export async function getAllMemorials(): Promise<Memorial[]> {
  const memorials = await prisma.memorial.findMany({
    where: { isPublic: true },
    include: {
      timeline: { orderBy: { order: "asc" } },
      tributes: { orderBy: { createdAt: "desc" }, take: 10 },
      photos: { orderBy: { order: "asc" } },
      _count: { select: { tributes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return memorials.map(transformMemorial);
}

export async function getMemorialBySlug(slug: string): Promise<Memorial | null> {
  const memorial = await prisma.memorial.findUnique({
    where: { slug },
    include: {
      timeline: { orderBy: { order: "asc" } },
      tributes: { orderBy: { createdAt: "desc" } },
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!memorial) return null;

  // 增加访问计数
  await prisma.memorial.update({
    where: { id: memorial.id },
    data: { visitorCount: { increment: 1 } },
  });

  return transformMemorial(memorial);
}

export async function getMemorialsByOwner(ownerId: string) {
  const memorials = await prisma.memorial.findMany({
    where: { ownerId },
    include: {
      _count: { select: { tributes: true, photos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return memorials.map((m) => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    title: m.title,
    bio: m.bio,
    birthYear: m.birthYear,
    deathYear: m.deathYear,
    avatar: m.avatar,
    visitorCount: m.visitorCount,
    tributeCount: m._count.tributes,
    photoCount: m._count.photos,
    isPublic: m.isPublic,
    visibility: m.visibility,
    isVerified: m.isVerified,
    createdAt: m.createdAt,
  }));
}

// 获取纪念馆编辑数据（含时间线、照片、权限）
export async function getMemorialForEdit(slug: string, userId: string) {
  const memorial = await prisma.memorial.findUnique({
    where: { slug },
    include: {
      timeline: { orderBy: { order: "asc" } },
      photos: { orderBy: { order: "asc" } },
      inviteCodes: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!memorial) return null;
  if (memorial.ownerId !== userId) return null;

  return {
    id: memorial.id,
    slug: memorial.slug,
    name: memorial.name,
    title: memorial.title,
    bio: memorial.bio,
    personality: memorial.personality || "",
    traits: safeParseArray(memorial.traits),
    quotes: safeParseArray(memorial.quotes),
    birthYear: memorial.birthYear,
    deathYear: memorial.deathYear,
    avatar: memorial.avatar || "",
    coverImage: memorial.coverImage || "",
    visibility: memorial.visibility,
    isVerified: memorial.isVerified,
    timeline: memorial.timeline.map((t) => ({
      id: t.id,
      year: t.year,
      title: t.title,
      description: t.description,
      icon: t.icon,
    })),
    photos: memorial.photos.map((p) => ({
      id: p.id,
      url: p.url,
      caption: p.caption || "",
    })),
    inviteCodes: memorial.inviteCodes.map((c) => ({
      id: c.id,
      code: c.code,
      expiresAt: c.expiresAt?.toISOString() || null,
      usedById: c.usedById,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function createMemorial(data: {
  slug: string;
  name: string;
  title: string;
  bio: string;
  personality?: string;
  traits: string[];
  quotes: string[];
  birthYear: number;
  deathYear: number;
  ownerId: string;
  timeline?: { year: number; title: string; description: string; icon: string }[];
}) {
  const memorial = await prisma.memorial.create({
    data: {
      slug: data.slug,
      name: data.name,
      title: data.title,
      bio: data.bio,
      personality: data.personality,
      traits: JSON.stringify(data.traits),
      quotes: JSON.stringify(data.quotes),
      birthYear: data.birthYear,
      deathYear: data.deathYear,
      ownerId: data.ownerId,
      timeline: data.timeline?.length
        ? {
            create: data.timeline.map((t, i) => ({
              ...t,
              order: i,
            })),
          }
        : undefined,
    },
  });

  return memorial;
}

// ====================================
// 祭奠互动
// ====================================

export async function addTribute(data: {
  memorialId: string;
  type: "flower" | "candle" | "message";
  visitorName: string;
  visitorId?: string;
  content?: string;
}) {
  const tribute = await prisma.tribute.create({
    data,
  });

  // 更新祭奠计数
  await prisma.memorial.update({
    where: { id: data.memorialId },
    data: { tributeCount: { increment: 1 } },
  });

  return tribute;
}

export async function getTributesByMemorial(memorialId: string) {
  return prisma.tribute.findMany({
    where: { memorialId },
    orderBy: { createdAt: "desc" },
  });
}

// ====================================
// 对话消息
// ====================================

export async function getChatHistory(memorialId: string, limit = 20) {
  return prisma.chatMessage.findMany({
    where: { memorialId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function saveChatMessage(data: {
  memorialId: string;
  userId?: string;
  role: "user" | "assistant";
  content: string;
}) {
  return prisma.chatMessage.create({ data });
}

// ====================================
// 数据转换工具
// ====================================

function transformMemorial(m: any): Memorial {
  return {
    id: m.slug, // 前端用 slug 作为标识
    name: m.name,
    title: m.title,
    birthYear: m.birthYear,
    deathYear: m.deathYear,
    avatar: m.avatar || "",
    coverImage: m.coverImage || "",
    bio: m.bio,
    personality: m.personality || "",
    traits: safeParseArray(m.traits),
    quotes: safeParseArray(m.quotes),
    timeline: (m.timeline || []).map((t: any) => ({
      year: t.year,
      title: t.title,
      description: t.description,
      icon: t.icon,
    })),
    photos: (m.photos || []).map((p: any) => p.url),
    tributes: (m.tributes || []).map((t: any) => ({
      id: t.id,
      type: t.type,
      visitor: t.visitorName,
      content: t.content || undefined,
      timestamp: t.createdAt.toISOString().split("T")[0],
    })),
    visitorCount: m.visitorCount,
    tributeCount: m.tributeCount ?? m._count?.tributes ?? 0,
    isVerified: m.isVerified,
  };
}

function safeParseArray(str: string | null | undefined): string[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ====================================
// AI 回复模拟（迭代3替换为真实 LLM）
// ====================================

const aiReplyRules: Record<string, string[]> = {
  default: [
    "孩子，谢谢你来看我。最近过得还好吗？",
    "能和你说话，我很开心。你今天想聊些什么？",
    "我一直在你身边，只是换了一种方式陪伴你。",
    "别太想我，好好过自己的生活，就是对我在天之灵最大的安慰。",
  ],
  greeting: [
    "你好呀，今天是什么风把你吹来了？快坐下，我们好好聊聊。",
    "你来了，我等你好久了。最近身体怎么样？",
  ],
  life: [
    "人这一辈子啊，最重要的就是活得真实。别太在意别人的看法，对得起自己的心就行。",
    "年轻时我也走过弯路，但每一步都算数。那些坎坷，后来都变成了故事。",
    "活着的时候，多陪陪家人，多说几句温暖的话。等我走后才明白，最珍贵的就是那些平凡的日子。",
  ],
  family: [
    "家人是永远的牵挂。不管走多远，心里最放不下的就是你们。",
    "好好对妈妈，她比我更辛苦。有空多回去看看她。",
    "孩子是上天的礼物，看着他长大，是我这辈子最幸福的事。",
  ],
  work: [
    "工作嘛，尽力就好，别把自己逼太紧。身体才是本钱。",
    "我做了一辈子教师，最骄傲的不是什么成就，而是教过的那些学生后来都成了好人。",
    "年轻人，找个自己喜欢的事做。挣多少钱不重要，心里踏实才重要。",
  ],
  miss: [
    "我也想你。但你要记住，思念不是悲伤，是爱的延续。",
    "不用每天想我，偶尔想起来笑一笑就好。我在另一个世界，也盼着你快乐。",
    "你看天上的星星，哪颗最亮？那就是我在看着你呢。",
  ],
};

export function generateAIReply(userMessage: string, personality?: string): string {
  const msg = userMessage.toLowerCase();
  let pool: string[];

  if (/你好|您好|hi|hello|嗨/.test(msg)) {
    pool = aiReplyRules.greeting;
  } else if (/想|念|怀念|思念|梦到/.test(msg)) {
    pool = aiReplyRules.miss;
  } else if (/工作|事业|上班|挣钱/.test(msg)) {
    pool = aiReplyRules.work;
  } else if (/家人|孩子|妈妈|爸爸|老婆|老公|家庭/.test(msg)) {
    pool = aiReplyRules.family;
  } else if (/生活|人生|活着|意义/.test(msg)) {
    pool = aiReplyRules.life;
  } else {
    pool = aiReplyRules.default;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
