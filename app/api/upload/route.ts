import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const memorialSlug = formData.get("memorialSlug") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (!memorialSlug) {
      return NextResponse.json({ error: "缺少纪念馆标识" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPG、PNG、WebP、GIF 格式" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "文件大小不能超过 10MB" },
        { status: 400 }
      );
    }

    // 验证纪念馆归属权
    const memorial = await prisma.memorial.findUnique({
      where: { slug: memorialSlug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    if (memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权上传" }, { status: 403 });
    }

    // 生成唯一文件名
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomBytes(8).toString("hex")}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);

    // 确保目录存在
    await mkdir(uploadDir, { recursive: true });

    // 写入文件
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;

    // 保存到数据库
    const photoCount = await prisma.photo.count({
      where: { memorialId: memorial.id },
    });

    const photo = await prisma.photo.create({
      data: {
        memorialId: memorial.id,
        url,
        caption: caption || null,
        order: photoCount,
      },
    });

    // 如果是第一张照片且纪念馆没有头像，设为头像
    if (photoCount === 0 && !memorial.avatar) {
      await prisma.memorial.update({
        where: { id: memorial.id },
        data: { avatar: url },
      });
    }

    return NextResponse.json({
      id: photo.id,
      url: photo.url,
      caption: photo.caption,
    });
  } catch (error) {
    console.error("上传失败:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

// 获取纪念馆的所有照片
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memorialSlug = searchParams.get("memorialSlug");

    if (!memorialSlug) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: memorialSlug },
    });

    if (!memorial) {
      return NextResponse.json({ error: "纪念馆不存在" }, { status: 404 });
    }

    const photos = await prisma.photo.findMany({
      where: { memorialId: memorial.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 删除照片
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("photoId");

    if (!photoId) {
      return NextResponse.json({ error: "缺少照片ID" }, { status: 400 });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { memorial: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    if (photo.memorial.ownerId !== session.user.id) {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    await prisma.photo.delete({
      where: { id: photoId },
    });

    return NextResponse.json({ message: "已删除" });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
