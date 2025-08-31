# 图片合规检测工具

一个基于 Next.js 和 Google Gemini AI 的图片敏感元素检测和修改工具。

## 功能特性

- 🎨 **现代化界面**: 采用深色主题的响应式设计
- 📤 **智能上传**: 支持拖拽上传和点击选择图片
- 🔍 **AI检测**: 使用 Google Gemini AI 检测图片中的敏感元素
- ✏️ **交互式修改**: 选择性应用修改建议
- 🖼️ **一键生成**: 自动生成合规图片
- 💾 **便捷下载**: 支持下载修改后的图片

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI组件**: Shadcn UI + Tailwind CSS
- **AI服务**: Google Gemini AI (通过 OpenRouter)
- **文件处理**: react-dropzone
- **语言**: TypeScript

## 项目状态

✅ **已完成**: 项目已成功迁移到OpenRouter API，支持真实的AI功能。

- ✅ 图片上传功能正常
- ✅ 界面交互完整
- ✅ 真实的敏感元素检测功能 (通过OpenRouter)
- ✅ 基于AI的图片描述生成
- ✅ 完整的错误处理和用户反馈
- ✅ 下载功能可用

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env.local` 文件：

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

1. **上传图片**: 拖拽或点击上传区域选择图片
2. **查看检测结果**: 系统会自动分析并显示检测到的敏感元素
3. **选择修改建议**: 勾选需要应用的修改建议
4. **生成合规图片**: 点击"生成合规图片"按钮
5. **下载结果**: 下载修改后的图片或重新开始

## 项目结构

```
src/
├── app/                 # App Router 页面
│   ├── api/            # API 路由
│   └── page.tsx        # 主页面
├── components/          # React 组件
│   ├── ui/             # UI 基础组件
│   ├── image-upload.tsx
│   ├── sensitive-elements.tsx
│   └── result-display.tsx
├── lib/                # 工具库
│   ├── gemini.ts       # Gemini AI 集成 (模拟版)
│   └── gemini-real.ts  # Gemini AI 集成 (真实版)
└── types/              # TypeScript 类型定义
```

## 部署

项目已配置 GitHub 仓库，支持部署到 Vercel、Netlify 等平台。

### Vercel 部署

1. 连接 GitHub 仓库到 Vercel
2. 设置环境变量 `OPENROUTER_API_KEY`
3. 部署完成

## 开发说明

### API配置

项目现在使用OpenRouter API来访问Google Gemini模型：

1. **获取API密钥**: 访问 [OpenRouter](https://openrouter.ai/) 获取API密钥
2. **配置环境变量**: 在 `.env.local` 文件中设置 `OPENROUTER_API_KEY`
3. **模型**: 使用 `google/gemini-2.5-flash-lite-preview-06-17`

### 测试API连接

使用提供的测试脚本：

```bash
node test-gemini.js
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
