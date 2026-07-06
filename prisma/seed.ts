import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始种子数据导入...");

  // 1. 创建演示用户
  const demoPassword = await bcrypt.hash("demo123456", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@evermind.cn" },
    update: {},
    create: {
      email: "demo@evermind.cn",
      name: "演示用户",
      password: demoPassword,
      role: "USER",
    },
  });
  console.log(`✅ 创建演示用户: ${demoUser.email}`);

  // 2. 创建演示纪念馆
  const memorials = [
    {
      slug: "zhanglaoshi",
      name: "张明远",
      title: "人民教师 · 1948-2023",
      bio: "从教四十载，桃李满天下。一生坚守三尺讲台，用粉笔书写春秋，用板擦擦去岁月。他相信教育不是灌输，而是点燃火焰。",
      personality: "温和、睿智、幽默，说话总是慢条斯理，但每句话都有分量。喜欢引用古诗词，爱泡浓茶。",
      traits: ["温和", "睿智", "幽默", "师者风范"],
      quotes: [
        "教书育人，不是灌满一桶水，而是点燃一把火。",
        "人生如茶，不会苦一辈子，但总会苦一阵子。",
        "桃李不言，下自成蹊。",
      ],
      birthYear: 1948,
      deathYear: 2023,
      isVerified: true,
      visitorCount: 3287,
      tributeCount: 456,
      timeline: [
        { year: 1948, title: "出生", description: "出生于山东济南一个书香门第", icon: "🌿" },
        { year: 1966, title: "高中毕业", description: "正值特殊年代，未能立即上大学", icon: "📖" },
        { year: 1972, title: "开始执教", description: "在乡村中学开始教学生涯，教语文和历史", icon: "✏️" },
        { year: 1978, title: "恢复高考", description: "考入山东师范大学中文系", icon: "🎓" },
        { year: 1982, title: "重返讲台", description: "毕业后回到中学，此后再未离开讲台", icon: "🏫" },
        { year: 1995, title: "获评特级教师", description: "全省最年轻的语文特级教师之一", icon: "🏆" },
        { year: 2008, title: "退休", description: "退休后仍坚持免费辅导乡村学生", icon: "🌅" },
        { year: 2023, title: "安详离世", description: "在睡梦中安详离世，享年75岁", icon: "🍂" },
      ],
      tributes: [
        { type: "flower", visitorName: "学生 李明", createdAt: new Date("2024-01-15") },
        { type: "candle", visitorName: "女儿 张小月", createdAt: new Date("2024-01-10") },
        { type: "message", visitorName: "学生 王芳", content: "张老师，感谢您当年的鼓励，我现在也成为了一名老师。", createdAt: new Date("2024-01-08") },
        { type: "flower", visitorName: "匿名访客", createdAt: new Date("2024-01-05") },
        { type: "message", visitorName: "同事 赵老师", content: "明远兄，讲台上的风采至今难忘。", createdAt: new Date("2023-12-30") },
      ],
    },
    {
      slug: "linnainai",
      name: "林秀珍",
      title: "慈母 · 1952-2024",
      bio: "一位普通的母亲，却用一生诠释了什么叫无私的爱。她做过缝纫工、摆过地摊、开过早餐店，只为了供三个孩子读书。",
      personality: "乐观、坚韧、爱唠叨但充满爱。最拿手的是红烧肉和韭菜盒子。说话带着浓重的乡音。",
      traits: ["慈祥", "坚韧", "乐观", "唠叨的爱"],
      quotes: [
        "妈不累，你们好好学习就行。",
        "人啊，只要还能动，就不能闲着。",
        "吃亏是福，别跟人计较。",
      ],
      birthYear: 1952,
      deathYear: 2024,
      isVerified: true,
      visitorCount: 1543,
      tributeCount: 289,
      timeline: [
        { year: 1952, title: "出生", description: "出生于河南农村，家中排行老三", icon: "🌾" },
        { year: 1972, title: "结婚", description: "与同村青年结婚，开始操持家务", icon: "💞" },
        { year: 1975, title: "长子出生", description: "大儿子出生，开始做缝纫补贴家用", icon: "👶" },
        { year: 1985, title: "进城打拼", description: "全家搬到县城，摆地摊卖早点", icon: "🏙️" },
        { year: 1995, title: "开早餐店", description: "攒够钱开了自己的早餐店，供三个孩子读书", icon: "🥟" },
        { year: 2015, title: "孩子们成才", description: "三个孩子全部大学毕业，各自成家立业", icon: "🎉" },
        { year: 2020, title: "确诊疾病", description: "确诊慢性病，但仍乐观面对生活", icon: "💊" },
        { year: 2024, title: "安详离世", description: "在家人陪伴下安详离世，享年72岁", icon: "🕊️" },
      ],
      tributes: [
        { type: "flower", visitorName: "儿子 林大伟", createdAt: new Date("2024-06-01") },
        { type: "candle", visitorName: "孙女 林小雨", createdAt: new Date("2024-05-28") },
        { type: "message", visitorName: "邻居 张婶", content: "秀珍姐，你的韭菜盒子是我吃过最好吃的。", createdAt: new Date("2024-05-20") },
      ],
    },
    {
      slug: "chenyisheng",
      name: "陈志远",
      title: "医者 · 1965-2024",
      bio: "从医三十年的外科医生，主刀过超过一万台手术。他常说：'每一台手术，都是一条命背后的一家人。'",
      personality: "严谨、冷静、专业，但私下非常温暖。喜欢在手术前听古典乐放松。说话简洁有力。",
      traits: ["严谨", "专业", "温暖", "医者仁心"],
      quotes: [
        "刀尖上的事，容不得半点马虎。",
        "病人把命交给你，你就得对得起这份信任。",
        "做医生，不是为了挣钱，是为了救人。",
      ],
      birthYear: 1965,
      deathYear: 2024,
      isVerified: true,
      visitorCount: 2156,
      tributeCount: 378,
      timeline: [
        { year: 1965, title: "出生", description: "出生于医学世家，父亲是老中医", icon: "🌿" },
        { year: 1983, title: "考入医学院", description: "以优异成绩考入北京医科大学", icon: "📚" },
        { year: 1990, title: "从医", description: "进入三甲医院外科，开始从医生涯", icon: "🏥" },
        { year: 2000, title: "主任医师", description: "成为最年轻的主任医师", icon: "⚕️" },
        { year: 2010, title: "援非医疗", description: "参加援非医疗队，在非洲工作两年", icon: "🌍" },
        { year: 2020, title: "抗疫一线", description: "主动请缨参加抗疫，连续工作三个月", icon: "🛡️" },
        { year: 2024, title: "积劳成疾", description: "因长期过度劳累离世，享年59岁", icon: "🕯️" },
      ],
      tributes: [
        { type: "flower", visitorName: "患者家属 王女士", createdAt: new Date("2024-06-10") },
        { type: "message", visitorName: "学生 刘医生", content: "陈老师，您教我的第一台手术，我这辈子都记得。", createdAt: new Date("2024-06-08") },
        { type: "candle", visitorName: "同事 赵主任", createdAt: new Date("2024-06-05") },
      ],
    },
  ];

  for (const m of memorials) {
    const { timeline, tributes, ...memorialData } = m;

    // 先删除已有记录的关联数据（timeline + tributes），再 upsert
    const existing = await prisma.memorial.findUnique({
      where: { slug: m.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.timelineEvent.deleteMany({ where: { memorialId: existing.id } });
      await prisma.tribute.deleteMany({ where: { memorialId: existing.id } });
    }

    const memorial = await prisma.memorial.upsert({
      where: { slug: m.slug },
      update: {
        name: memorialData.name,
        title: memorialData.title,
        bio: memorialData.bio,
        personality: memorialData.personality,
        traits: JSON.stringify(m.traits),
        quotes: JSON.stringify(m.quotes),
        birthYear: memorialData.birthYear,
        deathYear: memorialData.deathYear,
        isVerified: memorialData.isVerified,
        visitorCount: memorialData.visitorCount,
        tributeCount: memorialData.tributeCount,
      },
      create: {
        ...memorialData,
        ownerId: demoUser.id,
        traits: JSON.stringify(m.traits),
        quotes: JSON.stringify(m.quotes),
      },
    });

    // 重新导入时间线
    for (let i = 0; i < timeline.length; i++) {
      await prisma.timelineEvent.create({
        data: {
          ...timeline[i],
          order: i,
          memorialId: memorial.id,
        },
      });
    }

    // 重新导入祭奠
    for (const t of tributes) {
      await prisma.tribute.create({
        data: {
          ...t,
          memorialId: memorial.id,
        },
      });
    }

    console.log(`✅ 创建纪念馆: ${memorial.name} (${memorial.slug})`);
  }

  console.log("\n🎉 种子数据导入完成！");
  console.log(`   演示账号: demo@evermind.cn / demo123456`);
}

main()
  .catch((e) => {
    console.error("❌ 种子数据导入失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
