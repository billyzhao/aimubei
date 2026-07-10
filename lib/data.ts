import { prisma } from "./db";
import type { Memorial, TimelineEvent, Tribute } from "./types";

// ====================================
// 纪念馆查询
// ====================================

// 纪念馆排序方式
export type MemorialSort = "newest" | "popular" | "tributes";

export async function getAllMemorials(opts: {
  sort?: MemorialSort;
  relationship?: string;
  region?: string;
} = {}): Promise<Memorial[]> {
  const where: any = { isPublic: true };
  if (opts.relationship) where.relationship = opts.relationship;
  if (opts.region) where.region = opts.region;

  const orderBy: any =
    opts.sort === "popular"
      ? [{ visitorCount: "desc" }, { createdAt: "desc" }]
      : opts.sort === "tributes"
      ? [{ tributeCount: "desc" }, { createdAt: "desc" }]
      : { createdAt: "desc" };

  const memorials = await prisma.memorial.findMany({
    where,
    include: {
      timeline: { orderBy: { order: "asc" } },
      tributes: { orderBy: { createdAt: "desc" }, take: 10 },
      photos: { orderBy: { order: "asc" } },
      _count: { select: { tributes: true } },
    },
    orderBy,
  });

  return memorials.map(transformMemorial);
}

// ====================================
// 全文搜索（服务端 SQL 级）
// 覆盖：姓名 / 标题 / 生平 / 性格 / 标签(JSON) / 语录(JSON)
// 年代：输入 4 位数字自动当生卒年匹配，也支持显式 year 参数
// 仅搜索 PUBLIC 纪念馆（私密/亲友不出现在公开搜索结果）
// ====================================
export async function searchMemorials(opts: {
  q?: string;
  year?: number;
  sort?: MemorialSort;
  relationship?: string;
  region?: string;
} = {}): Promise<Memorial[]> {
  const q = opts.q?.trim();
  const isYearQuery = !!q && /^\d{4}$/.test(q);
  const yearFromQ = isYearQuery ? parseInt(q, 10) : undefined;
  const year = opts.year ?? yearFromQ;

  const where: any = { visibility: "PUBLIC" };
  // 标签筛选（与关键词/年代是 AND 关系，叠加在顶层 where）
  if (opts.relationship) where.relationship = opts.relationship;
  if (opts.region) where.region = opts.region;
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
  if (year) {
    or.push({ birthYear: year }, { deathYear: year });
  }
  if (or.length) where.OR = or;

  const rows = await prisma.memorial.findMany({
    where,
    include: { _count: { select: { tributes: true, photos: true } } },
    orderBy: { createdAt: "desc" },
  });

  const mapped = rows.map((m) => transformMemorial(m));

  // 关键词搜索：按相关度打分排序，命中姓名权重最高
  if (q && !isYearQuery) {
    const scored = mapped.map((m) => ({ m, s: scoreMemorial(m, q) }));
    scored.sort((a, b) => b.s - a.s || b.m.visitorCount - a.m.visitorCount);
    return scored.map((x) => x.m);
  }

  // 指定排序维度（无关键词时生效）
  if (opts.sort === "popular") {
    mapped.sort((a, b) => b.visitorCount - a.visitorCount);
  } else if (opts.sort === "tributes") {
    mapped.sort((a, b) => b.tributeCount - a.tributeCount);
  }
  return mapped;
}

// 相关度打分：name > title > bio > personality > traits/quotes
function scoreMemorial(m: Memorial, q: string): number {
  let s = 0;
  if (m.name.includes(q)) s += 100;
  if (m.title.includes(q)) s += 50;
  if (m.bio.includes(q)) s += 20;
  if ((m.personality || "").includes(q)) s += 15;
  if ((m.traits || []).some((t) => t.includes(q))) s += 10;
  if ((m.quotes || []).some((t) => t.includes(q))) s += 10;
  return s;
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

  return transformMemorial(memorial);
}

// 获取纪念馆原始数据（不含访问计数，用于访问控制检查）
export async function getMemorialRaw(slug: string) {
  return prisma.memorial.findUnique({
    where: { slug },
    include: {
      timeline: { orderBy: { order: "asc" } },
      tributes: { orderBy: { createdAt: "desc" } },
      photos: { orderBy: { order: "asc" } },
    },
  });
}

// 检查纪念馆访问权限
// token: 来自 cookie 或 URL 的访问凭证
//   - FAMILY 邀请码: "invite:<CODE>"
//   - PRIVATE 密码:  "pw:<bcryptHash>"
// 返回: { allowed: true } 或 { allowed: false, reason, requireInvite?, requirePassword? }
export async function checkMemorialAccess(
  memorial: { id: string; ownerId: string; visibility: string; accessPassword?: string | null } | null,
  session: { user?: { id?: string } } | null,
  token?: string | null
): Promise<{ allowed: boolean; reason?: string; requireInvite?: boolean; requirePassword?: boolean }> {
  if (!memorial) return { allowed: false, reason: "not_found" };

  // PUBLIC：任何人可访问
  if (memorial.visibility === "PUBLIC") return { allowed: true };

  // Owner 始终可访问
  if (session?.user?.id && memorial.ownerId === session.user.id) return { allowed: true };

  // 凭证校验（cookie / URL 邀请码）
  if (token) {
    if (memorial.visibility === "PRIVATE" && token.startsWith("pw:")) {
      const hash = token.slice(3);
      if (hash && hash === memorial.accessPassword) return { allowed: true };
    }
    if (memorial.visibility === "FAMILY" && token.startsWith("invite:")) {
      const code = token.slice(7).toUpperCase();
      const invite = await prisma.inviteCode.findFirst({
        where: {
          code,
          memorialId: memorial.id,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });
      if (invite) return { allowed: true };
    }
  }

  // PRIVATE：设置了密码则需要密码，否则仅 owner
  if (memorial.visibility === "PRIVATE") {
    return {
      allowed: false,
      reason: "private",
      requirePassword: !!memorial.accessPassword,
    };
  }

  // FAMILY：需要邀请码
  if (memorial.visibility === "FAMILY") {
    return { allowed: false, reason: "family", requireInvite: true };
  }

  return { allowed: true };
}

// 获取纪念馆用于展示（含访问控制）
// 返回 { memorial, isOwner } 或 { denied: {...} }
export async function getMemorialForView(
  slug: string,
  session: { user?: { id?: string } } | null,
  token?: string | null
): Promise<
  | { memorial: Memorial; isOwner: boolean }
  | { denied: { reason: string; requireInvite?: boolean; requirePassword?: boolean; name: string } }
> {
  const raw = await getMemorialRaw(slug);
  if (!raw) {
    return { denied: { reason: "not_found", name: "" } };
  }

  const access = await checkMemorialAccess(raw, session, token);
  if (!access.allowed) {
    return {
      denied: {
        reason: access.reason || "forbidden",
        requireInvite: access.requireInvite,
        requirePassword: access.requirePassword,
        name: raw.name,
      },
    };
  }

  // 授权访问才增加计数
  await incrementVisitorCount(raw.id);

  const memorial = transformMemorial(raw);
  const isOwner = !!(session?.user?.id && raw.ownerId === session.user.id);
  return { memorial, isOwner };
}

// 增加访问计数（仅授权访问时调用）
export async function incrementVisitorCount(memorialId: string) {
  await prisma.memorial.update({
    where: { id: memorialId },
    data: { visitorCount: { increment: 1 } },
  });
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
    relationship: m.relationship || null,
    region: m.region || null,
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
    family: await getFamilyRelations(memorial.id),
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
  relationship?: string;
  region?: string;
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
      relationship: data.relationship || null,
      region: data.region || null,
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
// 首页精选纪念馆
// ====================================

export async function getFeaturedMemorials(limit = 6, sort: MemorialSort = "popular"): Promise<Memorial[]> {
  const orderBy: any =
    sort === "newest"
      ? { createdAt: "desc" }
      : sort === "tributes"
      ? [{ tributeCount: "desc" }, { visitorCount: "desc" }]
      : [{ tributeCount: "desc" }, { visitorCount: "desc" }];

  const memorials = await prisma.memorial.findMany({
    where: { visibility: "PUBLIC" },
    orderBy,
    take: limit,
    include: {
      _count: { select: { tributes: true, photos: true } },
    },
  });

  return memorials.map((m) => ({
    id: m.slug,
    slug: m.slug,
    name: m.name,
    title: m.title,
    bio: m.bio,
    birthYear: m.birthYear,
    deathYear: m.deathYear,
    avatar: m.avatar || "",
    visitorCount: m.visitorCount,
    tributeCount: m._count.tributes,
    photoCount: m._count.photos,
    isPublic: m.isPublic,
    visibility: m.visibility,
    isVerified: m.isVerified,
    createdAt: m.createdAt,
  }));
}

export async function getPublicMemorialCount(): Promise<number> {
  return prisma.memorial.count({
    where: { visibility: "PUBLIC" },
  });
}

// ====================================
// 推荐与发现（C3）
// ====================================

// 相关纪念馆：基于共享标签（关系类型 + 地区 + 性格标签）相似度打分
// 优先返回有相关度的馆，不足时用热门 PUBLIC 馆补齐
export async function getRelatedMemorials(
  current: { slug: string; relationship?: string | null; region?: string | null; traits?: string[] },
  limit = 4
): Promise<Memorial[]> {
  const candidates = await prisma.memorial.findMany({
    where: { visibility: "PUBLIC", slug: { not: current.slug } },
    include: { _count: { select: { tributes: true, photos: true } } },
    orderBy: [{ tributeCount: "desc" }, { visitorCount: "desc" }],
    take: 50,
  });

  const curRel = current.relationship || null;
  const curRegion = current.region || null;
  const curTraits = new Set((current.traits || []).map((t) => t.toLowerCase()));

  const scored = candidates.map((m) => {
    let s = 0;
    if (curRel && m.relationship === curRel) s += 3;
    if (curRegion && m.region === curRegion) s += 2;
    const mTraits = safeParseArray(m.traits).map((t) => t.toLowerCase());
    for (const t of mTraits) if (curTraits.has(t)) s += 1;
    return { m: transformMemorial(m), s };
  });

  scored.sort((a, b) => b.s - a.s || b.m.visitorCount - a.m.visitorCount);
  const withScore = scored.filter((x) => x.s > 0).map((x) => x.m);
  const filler = scored.filter((x) => x.s === 0).map((x) => x.m);
  return [...withScore, ...filler].slice(0, limit);
}

// 个性化推荐：登录用户基于其拥有的纪念馆标签，推荐相似的 PUBLIC 馆（排除自己拥有的）
// 无自有馆（新用户）时降级为热门榜
export async function getRecommendedMemorials(userId: string, limit = 4): Promise<Memorial[]> {
  const owned = await getMemorialsByOwner(userId);
  if (owned.length === 0) {
    return getFeaturedMemorials(limit, "popular");
  }

  const ownedSlugs = new Set(owned.map((m) => m.slug));
  const relSet = new Set(owned.map((m) => m.relationship).filter(Boolean) as string[]);
  const regionSet = new Set(owned.map((m) => m.region).filter(Boolean) as string[]);

  const candidates = await prisma.memorial.findMany({
    where: { visibility: "PUBLIC", slug: { notIn: Array.from(ownedSlugs) } },
    include: { _count: { select: { tributes: true, photos: true } } },
    orderBy: [{ tributeCount: "desc" }, { visitorCount: "desc" }],
    take: 50,
  });

  const scored = candidates.map((m) => {
    let s = 0;
    if (relSet.has(m.relationship || "")) s += 3;
    if (regionSet.has(m.region || "")) s += 2;
    return { m: transformMemorial(m), s };
  });

  scored.sort((a, b) => b.s - a.s || b.m.visitorCount - a.m.visitorCount);
  const withScore = scored.filter((x) => x.s > 0).map((x) => x.m);
  const filler = scored.filter((x) => x.s === 0).map((x) => x.m);
  return [...withScore, ...filler].slice(0, limit);
}

// ====================================
// 家族关系（D2）
// ====================================

export interface FamilyNode {
  id: string;
  slug: string;
  name: string;
  title: string;
  avatar: string | null;
  relationship: string | null;
  birthYear: number;
  deathYear: number;
  note?: string | null;
}

export interface FamilyTree {
  parents: FamilyNode[];
  spouses: FamilyNode[];
  siblings: FamilyNode[];
  children: FamilyNode[];
}

// 编辑页用的「以本纪念馆为视角」的关系视图
export interface FamilyRelationView {
  id: string;
  otherId: string;
  otherSlug: string;
  otherName: string;
  otherTitle: string;
  otherAvatar: string | null;
  type: "PARENT" | "CHILD" | "SPOUSE" | "SIBLING"; // 从本纪念馆视角
  note: string | null;
}

const FAMILY_TYPES = ["PARENT", "CHILD", "SPOUSE", "SIBLING"] as const;

function invertType(t: string): string {
  if (t === "PARENT") return "CHILD";
  if (t === "CHILD") return "PARENT";
  return t; // SPOUSE / SIBLING 对称
}

function toFamilyNode(m: any, note?: string | null): FamilyNode {
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    title: m.title,
    avatar: m.avatar,
    relationship: m.relationship,
    birthYear: m.birthYear,
    deathYear: m.deathYear,
    note,
  };
}

// 取得以本纪念馆为视角的关系列表（双向合并）
// 将 id 或 slug 解析为真实纪念馆 cuid（兼容详情页传入 slug 的情况）
async function resolveMemorialId(idOrSlug: string): Promise<string | null> {
  const m = await prisma.memorial.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true },
  });
  return m?.id || null;
}

export async function getFamilyRelations(
  idOrSlug: string
): Promise<FamilyRelationView[]> {
  const memorialId = await resolveMemorialId(idOrSlug);
  if (!memorialId) return [];
  const rels = await prisma.familyRelation.findMany({
    where: { OR: [{ memorialId }, { relatedMemorialId: memorialId }] },
    include: {
      memorial: {
        select: { id: true, slug: true, name: true, title: true, avatar: true },
      },
      related: {
        select: { id: true, slug: true, name: true, title: true, avatar: true },
      },
    },
  });

  const out: FamilyRelationView[] = [];
  for (const r of rels) {
    let other: any;
    let type: FamilyRelationView["type"];
    if (r.memorialId === memorialId) {
      other = r.related;
      type = r.type as FamilyRelationView["type"];
    } else {
      other = r.memorial;
      type = invertType(r.type) as FamilyRelationView["type"];
    }
    out.push({
      id: r.id,
      otherId: other.id,
      otherSlug: other.slug,
      otherName: other.name,
      otherTitle: other.title,
      otherAvatar: other.avatar,
      type,
      note: r.note,
    });
  }
  return out;
}

// 构建家族树（父母 / 配偶 / 兄弟姐妹 / 子女）
export async function buildFamilyTree(idOrSlug: string): Promise<FamilyTree> {
  const memorialId = await resolveMemorialId(idOrSlug);
  const empty: FamilyTree = { parents: [], spouses: [], siblings: [], children: [] };
  if (!memorialId) return empty;
  const rels = await prisma.familyRelation.findMany({
    where: { OR: [{ memorialId }, { relatedMemorialId: memorialId }] },
    include: {
      memorial: {
        select: {
          id: true, slug: true, name: true, title: true, avatar: true,
          relationship: true, birthYear: true, deathYear: true,
        },
      },
      related: {
        select: {
          id: true, slug: true, name: true, title: true, avatar: true,
          relationship: true, birthYear: true, deathYear: true,
        },
      },
    },
  });

  const tree: FamilyTree = { parents: [], spouses: [], siblings: [], children: [] };
  for (const r of rels) {
    let other: any;
    let type: string;
    if (r.memorialId === memorialId) {
      other = r.related;
      type = r.type;
    } else {
      other = r.memorial;
      type = invertType(r.type);
    }
    const node = toFamilyNode(other, r.note);
    if (type === "PARENT") tree.parents.push(node);
    else if (type === "CHILD") tree.children.push(node);
    else if (type === "SPOUSE") tree.spouses.push(node);
    else if (type === "SIBLING") tree.siblings.push(node);
  }
  return tree;
}

// 添加家族关系（馆主鉴权）
export async function addFamilyRelation(
  ownerId: string,
  memorialId: string,
  relatedSlug: string,
  type: string,
  note?: string
) {
  const memorial = await prisma.memorial.findUnique({
    where: { id: memorialId },
    select: { ownerId: true },
  });
  if (!memorial || memorial.ownerId !== ownerId) {
    throw new Error("无权操作该纪念馆");
  }
  const related = await prisma.memorial.findUnique({
    where: { slug: relatedSlug },
    select: { id: true },
  });
  if (!related) throw new Error("关联的纪念馆不存在");
  if (related.id === memorialId) throw new Error("不能与自己建立关系");
  if (!(FAMILY_TYPES as readonly string[]).includes(type)) {
    throw new Error("关系类型无效");
  }

  return prisma.familyRelation.upsert({
    where: {
      memorialId_relatedMemorialId_type: {
        memorialId,
        relatedMemorialId: related.id,
        type,
      },
    },
    update: { note: note || null },
    create: {
      memorialId,
      relatedMemorialId: related.id,
      type,
      note: note || null,
    },
  });
}

// 删除家族关系（馆主鉴权）
export async function removeFamilyRelation(
  ownerId: string,
  memorialId: string,
  relId: string
) {
  const rel = await prisma.familyRelation.findUnique({ where: { id: relId } });
  if (!rel) return;
  const memorial = await prisma.memorial.findUnique({
    where: { id: rel.memorialId },
    select: { ownerId: true },
  });
  if (!memorial || memorial.ownerId !== ownerId) {
    throw new Error("无权操作该纪念馆");
  }
  await prisma.familyRelation.delete({ where: { id: relId } });
}


// ====================================
// 记忆胶囊（定时解锁 + 解锁通知）
// ====================================

export type CapsuleVisibility = "PRIVATE" | "FAMILY" | "PUBLIC";
const CAPSULE_VISIBILITIES: readonly CapsuleVisibility[] = [
  "PRIVATE",
  "FAMILY",
  "PUBLIC",
];

export interface MemoryCapsuleView {
  id: string;
  title: string;
  // 锁定时 content 为 null（内容封存不可见）
  content: string | null;
  creatorName: string;
  visibility: CapsuleVisibility;
  unlockAt: string;
  isUnlocked: boolean; // 是否已到期解锁
  isOwner: boolean; // 当前查看者是否为创建者/馆主
  createdAt: string;
}

// 创建记忆胶囊（仅馆主）
export async function createMemoryCapsule(
  userId: string,
  userName: string,
  idOrSlug: string,
  data: {
    title: string;
    content: string;
    unlockAt: Date;
    visibility?: string;
  }
) {
  const memorial = await prisma.memorial.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true, ownerId: true },
  });
  if (!memorial) throw new Error("纪念馆不存在");
  if (memorial.ownerId !== userId) throw new Error("无权操作该纪念馆");

  const title = data.title?.trim();
  const content = data.content?.trim();
  if (!title) throw new Error("请填写胶囊标题");
  if (!content || content.length < 5) throw new Error("胶囊内容至少 5 字");
  if (title.length > 60) throw new Error("标题不能超过 60 字");
  if (content.length > 5000) throw new Error("内容不能超过 5000 字");
  if (!(data.unlockAt instanceof Date) || isNaN(data.unlockAt.getTime())) {
    throw new Error("解锁日期无效");
  }
  const visibility: CapsuleVisibility = CAPSULE_VISIBILITIES.includes(
    data.visibility as CapsuleVisibility
  )
    ? (data.visibility as CapsuleVisibility)
    : "FAMILY";

  // 到期日已过则视为立即解锁
  const alreadyUnlocked = data.unlockAt.getTime() <= Date.now();

  return prisma.memoryCapsule.create({
    data: {
      memorialId: memorial.id,
      creatorId: userId,
      creatorName: userName,
      title,
      content,
      unlockAt: data.unlockAt,
      visibility,
      isUnlocked: alreadyUnlocked,
      notified: alreadyUnlocked, // 创建即解锁的无需再通知
    },
  });
}

// 惰性解锁：将到期未标记的胶囊置为已解锁，并给馆主发通知（仅一次）
async function unlockDueCapsules(memorialId: string) {
  const due = await prisma.memoryCapsule.findMany({
    where: {
      memorialId,
      isUnlocked: false,
      unlockAt: { lte: new Date() },
    },
  });
  if (due.length === 0) return;

  const memorial = await prisma.memorial.findUnique({
    where: { id: memorialId },
    select: { id: true, slug: true, name: true, ownerId: true },
  });

  for (const c of due) {
    await prisma.memoryCapsule.update({
      where: { id: c.id },
      data: { isUnlocked: true, notified: true },
    });
    if (memorial && !c.notified) {
      try {
        await createNotification({
          userId: memorial.ownerId,
          memorialId: memorial.id,
          memorialSlug: memorial.slug,
          memorialName: memorial.name,
          type: "CAPSULE_UNLOCKED",
          content: `记忆胶囊「${c.title}」已到期解锁`,
        });
      } catch {
        // 通知失败不影响解锁
      }
    }
  }
}

// 列出记忆胶囊（惰性解锁 + 可见性过滤 + 锁定内容遮罩）
export async function listMemoryCapsules(
  idOrSlug: string,
  viewer: { userId?: string | null } | null
): Promise<MemoryCapsuleView[]> {
  const memorial = await prisma.memorial.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true, ownerId: true },
  });
  if (!memorial) return [];

  await unlockDueCapsules(memorial.id);

  const isOwner = !!(viewer?.userId && viewer.userId === memorial.ownerId);
  const isLoggedIn = !!viewer?.userId;

  const capsules = await prisma.memoryCapsule.findMany({
    where: { memorialId: memorial.id },
    orderBy: { unlockAt: "asc" },
  });

  const out: MemoryCapsuleView[] = [];
  for (const c of capsules) {
    // 可见性过滤
    if (c.visibility === "PRIVATE" && !isOwner) continue;
    if (c.visibility === "FAMILY" && !isOwner && !isLoggedIn) continue;
    // PUBLIC：所有能访问本馆的人可见

    out.push({
      id: c.id,
      // 锁定态遮罩内容（含馆主，保持"封存"仪式感）
      content: c.isUnlocked ? c.content : null,
      title: c.title,
      creatorName: c.creatorName,
      visibility: c.visibility as CapsuleVisibility,
      unlockAt: c.unlockAt.toISOString(),
      isUnlocked: c.isUnlocked,
      isOwner,
      createdAt: c.createdAt.toISOString(),
    });
  }
  return out;
}

// 删除记忆胶囊（仅创建者/馆主）
export async function deleteMemoryCapsule(userId: string, capsuleId: string) {
  const capsule = await prisma.memoryCapsule.findUnique({
    where: { id: capsuleId },
    select: { id: true, creatorId: true, memorialId: true },
  });
  if (!capsule) return;
  const memorial = await prisma.memorial.findUnique({
    where: { id: capsule.memorialId },
    select: { ownerId: true },
  });
  const allowed =
    capsule.creatorId === userId || memorial?.ownerId === userId;
  if (!allowed) throw new Error("无权删除该胶囊");
  await prisma.memoryCapsule.delete({ where: { id: capsuleId } });
}

// 惰性投递时光信件：到期的 PENDING 信件 → 生成 AI 回信并置为 REPLIED
export async function deliverDueLetters(memorialId: string) {
  const due = await prisma.timeLetter.findMany({
    where: {
      memorialId,
      status: "PENDING",
      deliverAt: { lte: new Date() },
    },
  });
  if (due.length === 0) return;

  const memorial = await prisma.memorial.findUnique({
    where: { id: memorialId },
    select: { personality: true },
  });

  for (const letter of due) {
    const aiReply = generateAIReply(
      letter.content,
      memorial?.personality || undefined
    );
    await prisma.timeLetter.update({
      where: { id: letter.id },
      data: { status: "REPLIED", aiReply },
    });
  }
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

export function transformMemorial(m: any): Memorial {
  return {
    id: m.slug, // 前端用 slug 作为标识
    slug: m.slug,
    name: m.name,
    title: m.title,
    birthYear: m.birthYear,
    deathYear: m.deathYear,
    avatar: m.avatar || "",
    coverImage: m.coverImage || "",
    bio: m.bio,
    personality: m.personality || "",
    relationship: m.relationship || null,
    region: m.region || null,
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
    isPublic: m.visibility === "PUBLIC",
    visibility: m.visibility || "PUBLIC",
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

// ====================================
// 通知系统
// ====================================

export async function createNotification(data: {
  userId: string;
  memorialId: string;
  memorialSlug: string;
  memorialName: string;
  type: "NEW_MESSAGE" | "NEW_VISITOR" | "CAPSULE_UNLOCKED";
  content?: string | null;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      memorialId: data.memorialId,
      memorialSlug: data.memorialSlug,
      memorialName: data.memorialName,
      type: data.type,
      content: data.content || null,
    },
  });
}

export async function getNotificationsByUser(userId: string, limit = 20) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((n) => ({
    id: n.id,
    userId: n.userId,
    memorialId: n.memorialId,
    memorialSlug: n.memorialSlug,
    memorialName: n.memorialName,
    type: n.type as "NEW_MESSAGE" | "NEW_VISITOR" | "CAPSULE_UNLOCKED",
    content: n.content,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
