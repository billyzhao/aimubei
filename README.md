# 永念 EverMind — AI数字纪念空间

> 用AI技术让逝者的记忆活下去，把冰冷的石碑变成可交互的数字纪念空间，让思念可以对话。

## 📋 项目简介

永念（EverMind）是一个AI驱动的数字纪念平台，通过AI人格复刻、语音克隆、时光信箱等核心技术，让用户能够以对话的方式缅怀逝去的亲人。

**当前版本**：v0.1.0 — 原型演示版

## ✨ 核心功能

- **AI人格复刻** — 基于逝者文字资料训练专属LLM，还原说话风格和性格
- **语音克隆** — 3分钟语音样本复刻逝者原声
- **时光信箱** — 生前预录定时信件 + AI以逝者口吻回信
- **家族传承** — 家族树 + 记忆胶囊，跨代际记忆传递
- **数字祭奠** — 献花、点烛、留言，在线表达思念
- **生平时间线** — 可视化展示逝者一生的重要时刻

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **部署**: 静态导出 / Docker

## 🚀 本地运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务
npm start
```

访问 http://localhost:3000

## 📂 项目结构

```
aimubei/
├── app/
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页
│   ├── globals.css          # 全局样式
│   ├── memorial/[id]/       # 纪念馆详情页
│   ├── memorials/           # 纪念馆列表页
│   └── create/              # 创建纪念馆向导
├── components/
│   ├── Navbar.tsx           # 导航栏
│   ├── Footer.tsx           # 页脚
│   ├── MemorialChat.tsx     # AI对话组件
│   ├── Timeline.tsx         # 时间线组件
│   └── TributePanel.tsx     # 祭奠面板组件
├── lib/
│   └── mockData.ts          # 模拟数据
└── package.json
```

## 📄 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 产品介绍、功能展示、价格方案 |
| 纪念馆列表 | `/memorials` | 浏览所有纪念馆 |
| 纪念馆详情 | `/memorial/[id]` | AI对话、时间线、祭奠互动 |
| 创建纪念馆 | `/create` | 6步创建向导 |

## ⚠️ 原型说明

当前为原型演示版本：
- AI对话回复为模拟数据，非真实AI生成
- 所有用户数据为预设的演示数据
- 照片墙使用占位符
- 创建向导为UI演示，不实际保存数据

## 📜 License

MIT
