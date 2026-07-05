export interface Memorial {
  id: string;
  name: string;
  title: string;
  birthYear: number;
  deathYear: number;
  avatar: string;
  coverImage: string;
  bio: string;
  personality: string;
  traits: string[];
  quotes: string[];
  timeline: TimelineEvent[];
  photos: string[];
  tributes: Tribute[];
  visitorCount: number;
  tributeCount: number;
  isVerified: boolean;
}

export interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  icon: string;
}

export interface Tribute {
  id: string;
  type: "flower" | "candle" | "message";
  visitor: string;
  content?: string;
  timestamp: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// 模拟AI回复规则
export const aiReplyRules: Record<string, string[]> = {
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

export const mockMemorials: Memorial[] = [
  {
    id: "zhanglaoshi",
    name: "张明远",
    title: "人民教师 · 1948-2023",
    birthYear: 1948,
    deathYear: 2023,
    avatar: "",
    coverImage: "",
    bio: "从教四十载，桃李满天下。一生坚守三尺讲台，用粉笔书写春秋，用板擦擦去岁月。他相信教育不是灌输，而是点燃火焰。",
    personality: "温和、睿智、幽默，说话总是慢条斯理，但每句话都有分量。喜欢引用古诗词，爱泡浓茶。",
    traits: ["温和", "睿智", "幽默", "师者风范"],
    quotes: [
      "教书育人，不是灌满一桶水，而是点燃一把火。",
      "人生如茶，不会苦一辈子，但总会苦一阵子。",
      "桃李不言，下自成蹊。",
    ],
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
    photos: [],
    tributes: [
      { id: "t1", type: "flower", visitor: "学生 李明", timestamp: "2024-01-15" },
      { id: "t2", type: "candle", visitor: "女儿 张小月", timestamp: "2024-01-10" },
      { id: "t3", type: "message", visitor: "学生 王芳", content: "张老师，感谢您当年的鼓励，我现在也成为了一名老师。", timestamp: "2024-01-08" },
      { id: "t4", type: "flower", visitor: "匿名访客", timestamp: "2024-01-05" },
      { id: "t5", type: "message", visitor: "同事 赵老师", content: "明远兄，讲台上的风采至今难忘。", timestamp: "2023-12-30" },
    ],
    visitorCount: 3287,
    tributeCount: 456,
    isVerified: true,
  },
  {
    id: "linnainai",
    name: "林秀珍",
    title: "慈母 · 1952-2024",
    birthYear: 1952,
    deathYear: 2024,
    avatar: "",
    coverImage: "",
    bio: "一位普通的母亲，却用一生诠释了什么叫无私的爱。她做过缝纫工、摆过地摊、开过早餐店，只为了供三个孩子读书。",
    personality: "乐观、坚韧、爱唠叨但充满爱。最拿手的是红烧肉和韭菜盒子。说话带着浓重的乡音。",
    traits: ["慈祥", "坚韧", "乐观", "唠叨的爱"],
    quotes: [
      "妈不累，你们好好学习就行。",
      "人啊，只要还能动，就不能闲着。",
      "吃亏是福，别跟人计较。",
    ],
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
    photos: [],
    tributes: [
      { id: "t1", type: "flower", visitor: "儿子 林大伟", timestamp: "2024-06-01" },
      { id: "t2", type: "candle", visitor: "孙女 林小雨", timestamp: "2024-05-28" },
      { id: "t3", type: "message", visitor: "邻居 张婶", content: "秀珍姐，你的韭菜盒子是我吃过最好吃的。", timestamp: "2024-05-20" },
    ],
    visitorCount: 1543,
    tributeCount: 289,
    isVerified: true,
  },
  {
    id: "chenyisheng",
    name: "陈志远",
    title: "医者 · 1965-2024",
    birthYear: 1965,
    deathYear: 2024,
    avatar: "",
    coverImage: "",
    bio: "从医三十年的外科医生，主刀过超过一万台手术。他常说：'每一台手术，都是一条命背后的一家人。'",
    personality: "严谨、冷静、专业，但私下非常温暖。喜欢在手术前听古典乐放松。说话简洁有力。",
    traits: ["严谨", "专业", "温暖", "医者仁心"],
    quotes: [
      "刀尖上的事，容不得半点马虎。",
      "病人把命交给你，你就得对得起这份信任。",
      "做医生，不是为了挣钱，是为了救人。",
    ],
    timeline: [
      { year: 1965, title: "出生", description: "出生于医学世家，父亲是老中医", icon: "🌿" },
      { year: 1983, title: "考入医学院", description: "以优异成绩考入北京医科大学", icon: "📚" },
      { year: 1990, title: "从医", description: "进入三甲医院外科，开始从医生涯", icon: "🏥" },
      { year: 2000, title: "主任医师", description: "成为最年轻的主任医师", icon: "⚕️" },
      { year: 2010, title: "援非医疗", description: "参加援非医疗队，在非洲工作两年", icon: "🌍" },
      { year: 2020, title: "抗疫一线", description: "主动请缨参加抗疫，连续工作三个月", icon: "🛡️" },
      { year: 2024, title: "积劳成疾", description: "因长期过度劳累离世，享年59岁", icon: "🕯️" },
    ],
    photos: [],
    tributes: [
      { id: "t1", type: "flower", visitor: "患者家属 王女士", timestamp: "2024-06-10" },
      { id: "t2", type: "message", visitor: "学生 刘医生", content: "陈老师，您教我的第一台手术，我这辈子都记得。", timestamp: "2024-06-08" },
      { id: "t3", type: "candle", visitor: "同事 赵主任", timestamp: "2024-06-05" },
    ],
    visitorCount: 2156,
    tributeCount: 378,
    isVerified: true,
  },
];

export function getMemorialById(id: string): Memorial | undefined {
  return mockMemorials.find((m) => m.id === id);
}

export function generateAIReply(userMessage: string): string {
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
