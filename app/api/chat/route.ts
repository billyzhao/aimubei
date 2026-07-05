import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAIReply } from "@/lib/data";

// AI 对话（迭代3替换为真实 LLM）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memorialSlug, message } = body;

    if (!memorialSlug || !message) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    const memorial = await prisma.memorial.findUnique({
      where: { slug: memorialSlug },
    });

    if (!memorial) {
      return NextResponse.json(
        { error: "纪念馆不存在" },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    // 保存用户消息
    await prisma.chatMessage.create({
      data: {
        memorialId: memorial.id,
        userId: session?.user?.id || null,
        role: "user",
        content: message,
      },
    });

    // 生成回复（迭代3替换为真实 LLM + RAG）
    const reply = generateAIReply(message, memorial.personality || undefined);

    // 保存 AI 回复
    await prisma.chatMessage.create({
      data: {
        memorialId: memorial.id,
        userId: session?.user?.id || null,
        role: "assistant",
        content: reply,
      },
    });

    return NextResponse.json({
      role: "assistant",
      content: reply,
    });
  } catch (error) {
    console.error("对话失败:", error);
    return NextResponse.json(
      { error: "对话服务暂时不可用" },
      { status: 500 }
    );
  }
}
