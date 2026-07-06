#!/bin/sh
set -e

echo "=== 永念 EverMind 启动 ==="

# 1. 数据库迁移
echo "[1/3] 初始化数据库..."
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || {
    echo "prisma db push via npx failed, trying direct..."
    node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss
}

# 2. 检查是否需要种子数据
echo "[2/3] 检查种子数据..."
HAS_DATA=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.memorial.count().then(c => { console.log(c); p.\$disconnect(); }).catch(() => { console.log(0); p.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$HAS_DATA" = "0" ]; then
    echo "  数据库为空，执行种子数据初始化..."
    node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        async function main() {
            // 创建演示用户
            const demoUser = await prisma.user.upsert({
                where: { email: 'demo@evermind.cn' },
                update: {},
                create: {
                    email: 'demo@evermind.cn',
                    name: '演示用户',
                    password: '\$2b\$10\$G37uA9Kg4gbsBhnOrS0KouWtcBFis2q3FeL2K.xiwBviMjtHOkJdG',
                }
            });

            // 创建3个纪念馆
            const memorials = [
                {
                    slug: 'zhanglaoshi',
                    name: '张明远',
                    title: '一位深受学生爱戴的语文教师',
                    bio: '一位深受学生爱戴的语文教师，在三尺讲台上耕耘了四十个春秋。他生于1948年，逝于2023年，一生培养过三千多名学生。',
                    personality: '温文尔雅，学识渊博，对学生充满耐心和关爱。说话时喜欢引用古诗词，性格豁达开朗。',
                    traits: '[\"温文尔雅\",\"学识渊博\",\"豁达开朗\",\"关爱学生\"]',
                    quotes: '[\"教育的本质是一棵树摇动另一棵树\",\"读书破万卷，下笔如有神\"]',
                    birthYear: 1948,
                    deathYear: 2023,
                    ownerId: demoUser.id,
                    isPublic: true,
                    isVerified: true,
                },
                {
                    slug: 'linnainai',
                    name: '林秀芳',
                    title: '慈祥的祖母，家族的精神支柱',
                    bio: '一位慈祥的祖母，用一生诠释了什么是坚韧和爱。生于1932年，逝于2022年，享年九十岁。她经历了时代的变迁，始终用温暖的笑容面对生活。',
                    personality: '慈祥温和，坚韧不拔，总是用温暖的笑容面对困难。喜欢讲过去的故事，对孙辈充满疼爱。',
                    traits: '[\"慈祥温和\",\"坚韧不拔\",\"乐观豁达\",\"家庭至上\"]',
                    quotes: '[\"日子再难也要笑着过\",\"家和万事兴\"]',
                    birthYear: 1932,
                    deathYear: 2022,
                    ownerId: demoUser.id,
                    isPublic: true,
                    isVerified: true,
                },
                {
                    slug: 'wangxuezhe',
                    name: '王志远',
                    title: '年轻的科研工作者，星辰大海的追梦人',
                    bio: '一位年轻的科研工作者，将短暂的一生献给了天文学研究。生于1990年，逝于2024年，年仅34岁。他在星系演化领域做出了重要贡献。',
                    personality: '充满好奇心和求知欲，性格开朗乐观，对宇宙充满热爱。说话时喜欢用生动的比喻解释科学现象。',
                    traits: '[\"充满好奇\",\"乐观开朗\",\"执着追梦\",\"科学精神\"]',
                    quotes: '[\"我们都是星尘的孩子\",\"仰望星空，脚踏实地\"]',
                    birthYear: 1990,
                    deathYear: 2024,
                    ownerId: demoUser.id,
                    isPublic: true,
                    isVerified: true,
                }
            ];

            for (const m of memorials) {
                await prisma.memorial.upsert({
                    where: { slug: m.slug },
                    update: {},
                    create: m,
                });
                console.log('  创建纪念馆: ' + m.name);
            }

            // 添加时间线事件
            const zhang = await prisma.memorial.findUnique({ where: { slug: 'zhanglaoshi' } });
            if (zhang) {
                await prisma.timelineEvent.createMany({
                    data: [
                        { memorialId: zhang.id, year: 1948, title: '出生', description: '出生于书香门第', icon: '🌟', order: 1 },
                        { memorialId: zhang.id, year: 1970, title: '大学毕业', description: '毕业于中文系，走上教育之路', icon: '🎓', order: 2 },
                        { memorialId: zhang.id, year: 1972, title: '开始教书', description: '在市第一中学任教', icon: '📖', order: 3 },
                        { memorialId: zhang.id, year: 2023, title: '与世长辞', description: '安详离世，桃李满天下', icon: '🕯️', order: 4 },
                    ]
                });
            }

            console.log('  种子数据初始化完成');
        }

        main().catch(console.error).finally(() => prisma.\$disconnect());
    " 2>/dev/null && echo "  种子数据已加载" || echo "  种子数据加载跳过"
else
    echo "  数据库已有 $HAS_DATA 条纪念馆数据，跳过种子"
fi

# 3. 启动服务
echo "[3/3] 启动 EverMind..."
exec node server.js
