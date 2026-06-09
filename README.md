# 智能简历编辑工具

一款本地运行的智能简历编辑器，支持多种 AI 大模型接入、丰富的模板和配色方案、AI 辅助写作功能以及多格式导出。

所有数据存储在本地，API Key 不会上传到任何服务器。

---

## 功能特性

### AI 模型支持（9 个提供商 + 自定义端点）

| 提供商 | 默认模型 | 说明 |
|--------|----------|------|
| DeepSeek | deepseek-chat | 国产大模型，性价比高 |
| 豆包 (ByteDance) | 用户指定 | 字节跳动火山引擎 |
| OpenAI | 用户指定 | GPT 系列，支持自定义端点 |
| Gemini (Google) | gemini-flash-latest | Google AI Studio |
| Claude (Anthropic) | claude-sonnet-4-20250514 | Anthropic Messages API |
| 通义千问 (阿里) | qwen-plus | 阿里云 DashScope |
| 智谱 GLM | glm-4-flash | 智谱 AI 开放平台 |
| 小米 MiMo | 用户指定 | 小米 AI 开放平台 |
| 自定义端点 | 用户指定 | 兼容 OpenAI 格式的任意 API |

所有 OpenAI 兼容的提供商共享统一的流式 SSE 解析逻辑，Claude 和 Gemini 各有独立适配器。

### 简历模板（11 套）

- **经典** — 标准单栏布局
- **现代** — 清新现代风格
- **模块标题背景色** — 标题区域带彩色背景
- **时间线** — 左侧时间轴布局
- **极简** — 最小化装饰
- **优雅** — 精致排版
- **创意** — 活泼的设计风格
- **编辑** — 杂志编辑风格
- **瑞士** — Swiss Style 网格布局
- **学术/科研** — 适合学术人员，衬线字体，紧凑排版，突出论文和科研项目
- **设计师/创意岗** — 左右双栏（30%/70%），紫色调，大留白，适合设计师和创意岗位

### 主题色预设（3 组 15 色 + 基础色 + 自定义）

| 色组 | 风格 | 包含颜色 |
|------|------|----------|
| 清新雅致 | 淡雅、清爽、专业 | 雾蓝、湖水蓝、天青、灰绿、竹青 |
| 柔和浪漫 | 轻柔、文艺、有气质 | 紫藤、玫瑰粉、杏仁、薄荷奶绿、淡丁香 |
| 沉稳商务 | 稳重、大气、可信赖 | 深海蓝、墨绿、暗紫、深棕、石墨灰 |

支持 react-colorful 自定义任意颜色。

### AI 辅助功能

| 功能 | 说明 |
|------|------|
| 一键生成简历 | 输入目标岗位 + 个人经历要点，AI 生成完整结构化简历 |
| 针对 JD 优化 | 粘贴职位描述，AI 分析简历与 JD 的匹配度并给出修改建议 |
| STAR 法则改写 | 将工作经历描述改写为 Situation-Task-Action-Result 格式 |
| 多语言翻译 | 将整份简历翻译为中文或英文，生成新副本不覆盖原文 |
| 内容润色 | 优化措辞，使表达更专业 |
| 语法纠错 | 修正语法和拼写错误 |

### 导出格式

- **PDF** — 高精度渲染，100% 还原格式
- **PDF (备份)** — 调用系统打印另存为 PDF
- **Word (.docx)** — 纯客户端生成，方便后续编辑
- **Markdown (.md)** — 标准 CommonMark，适合粘贴给 AI 或其他编辑器
- **JSON** — 完整配置备份，支持一键导入恢复

---

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装和运行

```bash
# 克隆项目
git clone <your-repo-url>
cd magic-resume

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

启动后在浏览器打开 `http://localhost:5173` 即可使用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

---

## 使用指南

### 1. 配置 AI 模型

进入 **设置 → AI 配置**，选择你使用的 AI 提供商：

1. 输入对应的 API Key
2. 如果需要，填写模型 ID（如 `deepseek-chat`、`glm-4-flash`）
3. 对于自定义端点，填写完整的 API 基础 URL（如 `http://localhost:11434/v1`）

配置保存在浏览器 LocalStorage 中，不会上传。

### 2. 创建简历

- **手动创建**：选择一个模板，逐项填写内容
- **AI 一键生成**：点击"AI 生成"，输入目标岗位和个人经历要点，AI 自动生成完整简历

### 3. 编辑和优化

- 在编辑器中直接修改各区块内容
- 使用 **STAR 改写** 按钮优化工作经历描述
- 使用 **JD 优化** 功能对齐目标岗位要求
- 使用 **润色** 和 **语法纠错** 提升内容质量

### 4. 调整样式

- 在右侧面板选择模板
- 选择主题色（预设色组或自定义）
- 调整字体大小、间距、边距等全局设置
- 拖拽排序各区块顺序

### 5. 导出简历

点击导出按钮，选择目标格式：
- 投递简历推荐 **PDF**
- 需要继续编辑选 **Word**
- 分享给 AI 选 **Markdown**
- 备份数据选 **JSON**

---

## 项目结构

```
src/
├── lib/ai/providers/       # AI 提供商适配器（统一接口）
│   ├── types.ts            # AIProvider 接口定义
│   ├── openai-compatible.ts # OpenAI 兼容基座工厂
│   ├── claude.ts           # Anthropic Messages API 适配
│   ├── gemini.ts           # Google Gemini SDK 适配
│   └── {provider}.ts       # 各提供商实例
├── config/
│   ├── themeColors.ts      # 主题色预设配置
│   └── prompts/            # AI 功能 System Prompt
├── components/
│   ├── templates/          # 简历模板
│   │   ├── academic/       # 学术/科研模板
│   │   ├── creative-pro/   # 设计师/创意岗模板
│   │   └── registry.ts    # 模板注册表
│   └── ai/                 # AI 功能 UI 组件
├── routes/api/             # 后端 API 路由（TanStack Start）
├── hooks/useAIAction.ts    # AI 流式请求通用 Hook
├── store/useAIConfigStore.ts # AI 配置状态管理
└── utils/
    ├── export.ts           # PDF/JSON/Markdown 导出
    ├── exportDocx.ts       # Word 导出
    └── markdown.ts         # Markdown 生成
```

---

## 技术栈

- **框架**：TanStack Start + Vite + React
- **状态管理**：Zustand (persist middleware)
- **样式**：Tailwind CSS + HeroUI
- **富文本**：Tiptap
- **颜色选择**：react-colorful
- **Word 生成**：docx (纯 JS，零原生依赖)
- **PDF 导出**：远程渲染服务 / 浏览器打印
- **国际化**：支持中文/英文

---

## 自定义端点使用示例

如果你使用 Ollama、LM Studio、vLLM 等本地模型服务，选择"自定义端点"：

| 工具 | 端点 URL | 模型名 |
|------|----------|--------|
| Ollama | `http://localhost:11434/v1` | `qwen2.5:7b` |
| LM Studio | `http://localhost:1234/v1` | `loaded-model` |
| vLLM | `http://localhost:8000/v1` | 你部署的模型名 |

API Key 填任意非空字符串即可（本地服务通常不校验）。

---

## 增强改造说明

本项目基于原版 magic-resume 进行了以下增强：

### Phase 1: API 提供商扩展
- 新建统一的 AIProvider 接口和提供商注册表
- 新增 5 个提供商（Claude、通义千问、智谱、MiMo、自定义端点）
- 重构 AI 配置 Store，支持动态提供商切换
- 简化 API 路由逻辑（从 ~200 行降到 ~40 行）

### Phase 2: 主题色预设
- 新增 15 个温和色彩预设，按 3 组分类展示
- 保留自定义颜色选择器

### Phase 3: 新增模板
- 学术/科研模板：单栏、衬线字体、紧凑排版
- 设计师/创意岗模板：双栏布局、无衬线字体、大留白

### Phase 4: AI 新功能
- 一键生成整份简历
- 针对 JD 定制优化（对比分析 + 修改建议）
- STAR 法则改写（内联预览 + 一键替换）
- 多语言翻译（中英互译，生成副本）
- 通用 `useAIAction` Hook 支持流式响应和中断

### Phase 5: 导出格式
- 新增 Word (.docx) 导出（纯客户端，零服务端依赖）
- 验证并保留已有 Markdown 导出

---

## 隐私说明

- 所有简历数据存储在浏览器 LocalStorage，不会上传到任何服务器
- API Key 仅存储在本地，直接从浏览器发送到对应 AI 服务商
- PDF 导出使用远程渲染服务（可替换为本地 Puppeteer）
- Word 和 Markdown 导出完全在客户端完成

---

## License

基于 [magic-resume](https://github.com/JOYCEQL/magic-resume) 开源项目改造，遵循 Apache 2.0 协议。
