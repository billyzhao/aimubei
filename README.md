# 永念 EverMind — AI数字纪念空间

用AI技术让逝者的记忆活下去，把冰冷的石碑变成可交互的数字纪念空间，让思念可以对话。

## 技术栈

- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **数据库**：Prisma ORM + SQLite（开发）/ PostgreSQL（生产）
- **认证**：NextAuth.js（邮箱密码登录）
- **容器化**：Docker Compose（PostgreSQL + Redis + MinIO）

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库 + 导入演示数据
npm run db:push
npm run db:seed

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

**演示账号**：demo@evermind.cn / demo123456

## 数据库管理

```bash
# 查看数据库（可视化）
npm run db:studio

# 重置数据库
npm run db:reset
```

## Docker 部署（可选）

```bash
# 启动 PostgreSQL + Redis + MinIO
docker-compose up -d

# 修改 .env 中的 DATABASE_URL 切换到 PostgreSQL
# 然后重新推送 schema
npx prisma db push
```

## 项目结构

```
aimubei/
├── app/                    # Next.js App Router
│   ├── api/                # API 路由
│   │   ├── auth/[...nextauth]/  # NextAuth 认证
│   │   ├── chat/           # AI 对话 API
│   │   ├── memorials/      # 纪念馆 CRUD
│   │   ├── register/       # 用户注册
│   │   └── tributes/       # 祭奠互动
│   ├── create/             # 创建纪念馆向导
│   ├── dashboard/          # 用户个人中心
│   ├── login/              # 登录页
│   ├── memorial/[id]/      # 纪念馆详情页
│   ├── memorials/          # 纪念馆列表
│   ├── register/           # 注册页
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 首页
├── components/             # React 组件
├── lib/                    # 工具库
│   ├── auth.ts             # NextAuth 配置
│   ├── data.ts             # 数据查询层
│   ├── db.ts               # Prisma 客户端
│   └── types.ts            # 共享类型
├── prisma/                 # Prisma 配置
│   ├── schema.prisma       # 数据库 Schema
│   └── seed.ts             # 种子数据
├── docker-compose.yml      # Docker 编排
└── .env                    # 环境变量
```

## 迭代进度

- [x] **Iteration 0** — 原型验证（v0.1.0）
- [x] **Iteration 1** — 工程地基 + 用户系统（v0.2.0）
- [ ] **Iteration 2** — 纪念馆核心功能
- [ ] **Iteration 3** — AI 引擎集成
- [ ] **Iteration 4** — 高级功能 + 正式上线

## License

MIT
