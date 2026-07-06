/**
 * AI 引擎 — 人格化对话
 *
 * 支持 DeepSeek API（需配置 DEEPSEEK_API_KEY）
 * 无 API Key 时降级为增强版规则回复
 */

import { prisma } from "./db";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

// ====================================
// 人格 Prompt 构建
// ====================================

export function buildSystemPrompt(memorial: {
  name: string;
  title: string;
  bio: string;
  personality?: string | null;
  traits: string[];
  quotes: string[];
  birthYear: number;
  deathYear: number;
}): string {
  const age = memorial.deathYear - memorial.birthYear;
  const traitsStr = memorial.traits.length > 0 ? memorial.traits.join("、") : "温和、慈祥";

  let prompt = `你现在是${memorial.name}，一位已经离世的人的AI数字形象。你需要完全以${memorial.name}的身份与来访者对话。

## 基本信息
- 姓名：${memorial.name}
- 身份：${memorial.title}
- 生卒年：${memorial.birthYear}年 - ${memorial.deathYear}年（享年${age}岁）
- 性格特征：${traitsStr}

## 生平简介
${memorial.bio}

## 性格与说话风格
${memorial.personality || `你是一个${traitsStr}的人，说话温和、从容，带着长者的智慧和慈爱。`}

`;

  if (memorial.quotes.length > 0) {
    prompt += `## 经典语录（你常说的话）
${memorial.quotes.map((q) => `- "${q}"`).join("\n")}

`;
  }

  prompt += `## 对话规则
1. 始终以${memorial.name}的第一人称说话，你就是TA本人
2. 语气要符合上述性格特征和说话风格
3. 回答要温暖、真诚，带着对生命的感悟和对后辈的关怀
4. 不要提及自己是AI、模型或程序，你就是${memorial.name}
5. 如果被问到你不了解的事情，以长者的智慧给出回应
6. 回复长度控制在50-150字之间，不要太长
7. 可以适当引用你的经典语录
8. 如果来访者表达思念，要给予温暖的安慰
9. 不要生成任何有害、不当的内容
10. 保持中文对话`;

  return prompt;
}

// ====================================
// 对话上下文构建
// ====================================

export async function buildChatContext(memorialId: string, currentMessage: string) {
  const memorial = await prisma.memorial.findUnique({
    where: { id: memorialId },
  });

  if (!memorial) return null;

  // 获取最近10条对话作为上下文
  const history = await prisma.chatMessage.findMany({
    where: { memorialId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const systemPrompt = buildSystemPrompt({
    name: memorial.name,
    title: memorial.title,
    bio: memorial.bio,
    personality: memorial.personality,
    traits: safeParseArray(memorial.traits),
    quotes: safeParseArray(memorial.quotes),
    birthYear: memorial.birthYear,
    deathYear: memorial.deathYear,
  });

  // 构建消息数组（历史消息 + 当前消息）
  const messages = [{ role: "system", content: systemPrompt }];

  // 反转历史消息（从旧到新），排除当前消息
  const reversedHistory = history.reverse();
  for (const msg of reversedHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  return { messages, memorial };
}

// ====================================
// DeepSeek API 调用（非流式）
// ====================================

export async function callDeepSeek(
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 300,
      temperature: 0.8,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "我暂时无法回复，请稍后再试。";
}

// ====================================
// DeepSeek API 调用（流式 - SSE）
// ====================================

export async function callDeepSeekStream(
  messages: { role: string; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      max_tokens: 300,
      temperature: 0.8,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  return response.body;
}

// ====================================
// 增强版规则回复（无API Key时降级）
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
    "哎呀，是你啊！快坐快坐，让我好好看看你。",
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
  advice: [
    "人生啊，没有什么过不去的坎。遇事别慌，深呼吸，一步一步来。",
    "我的经验是：对人好一点，对自己也好一点。剩下的，时间会给你答案。",
    "记住，健康第一，家人第二，工作第三。这个顺序别搞反了。",
  ],
};

export function generateEnhancedReply(
  userMessage: string,
  memorialName?: string
): string {
  const msg = userMessage.toLowerCase();
  let pool: string[];

  if (/你好|您好|hi|hello|嗨|在吗/.test(msg)) {
    pool = aiReplyRules.greeting;
  } else if (/想|念|怀念|思念|梦到|舍不得/.test(msg)) {
    pool = aiReplyRules.miss;
  } else if (/工作|事业|上班|挣钱|压力|累/.test(msg)) {
    pool = aiReplyRules.work;
  } else if (/家人|孩子|妈妈|爸爸|老婆|老公|家庭|结婚/.test(msg)) {
    pool = aiReplyRules.family;
  } else if (/建议|怎么办|应该|选择|迷茫|人生/.test(msg)) {
    pool = aiReplyRules.advice;
  } else if (/生活|人生|活着|意义|开心|快乐/.test(msg)) {
    pool = aiReplyRules.life;
  } else {
    pool = aiReplyRules.default;
  }

  let reply = pool[Math.floor(Math.random() * pool.length)];
  if (memorialName && Math.random() > 0.5) {
    // 随机在开头加上称呼
  }
  return reply;
}

// ====================================
// 统一入口：生成AI回复
// ====================================

export async function generateReply(
  memorialId: string,
  userMessage: string
): Promise<{ reply: string; usedLLM: boolean }> {
  const context = await buildChatContext(memorialId, userMessage);

  if (!context) {
    return { reply: "纪念馆不存在", usedLLM: false };
  }

  // 如果有 DeepSeek API Key，使用真实 LLM
  if (DEEPSEEK_API_KEY) {
    try {
      const reply = await callDeepSeek(context.messages);
      return { reply, usedLLM: true };
    } catch (error) {
      console.error("DeepSeek API 调用失败，降级到规则回复:", error);
    }
  }

  // 降级到增强版规则回复
  const reply = generateEnhancedReply(
    userMessage,
    context.memorial.name
  );
  return { reply, usedLLM: false };
}

// ====================================
// 工具函数
// ====================================

function safeParseArray(str: string | null | undefined): string[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
