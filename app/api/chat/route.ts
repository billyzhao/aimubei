import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateReply, buildChatContext, callDeepSeekStream, DEEPSEEK_API_KEY } from "@/lib/ai";

// AI 对话（支持流式和非流式）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { memorialSlug, message, stream } = body;

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

    // 如果请求流式输出且有 API Key，使用 SSE
    if (stream && DEEPSEEK_API_KEY) {
      const context = await buildChatContext(memorial.id, message);
      if (!context) {
        return NextResponse.json({ error: "上下文构建失败" }, { status: 500 });
      }

      try {
        const apiStream = await callDeepSeekStream(context.messages);

        // 创建一个 TransformStream 来处理 SSE 格式
        const encoder = new TextEncoder();
        let fullReply = "";

        const transformedStream = new ReadableStream({
          async start(controller) {
            const reader = apiStream.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim();
                    if (data === "[DONE]") {
                      controller.close();
                      return;
                    }
                    try {
                      const parsed = JSON.parse(data);
                      const content = parsed.choices?.[0]?.delta?.content;
                      if (content) {
                        fullReply += content;
                        controller.enqueue(
                          encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                        );
                      }
                    } catch {
                      // skip invalid JSON
                    }
                  }
                }
              }

              // 保存完整的 AI 回复
              if (fullReply) {
                await prisma.chatMessage.create({
                  data: {
                    memorialId: memorial.id,
                    userId: session?.user?.id || null,
                    role: "assistant",
                    content: fullReply,
                  },
                });
              }

              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(transformedStream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      } catch (error) {
        console.error("流式输出失败，降级到非流式:", error);
      }
    }

    // 非流式输出
    const { reply, usedLLM } = await generateReply(memorial.id, message);

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
      usedLLM,
    });
  } catch (error) {
    console.error("对话失败:", error);
    return NextResponse.json(
      { error: "对话服务暂时不可用" },
      { status: 500 }
    );
  }
}

// 获取对话历史
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

    const messages = await prisma.chatMessage.findMany({
      where: { memorialId: memorial.id },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
