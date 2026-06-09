# Magic Resume 增强改造设计文档

日期：2026-06-08
基础项目：magic-resume (fork)
架构：TanStack Start + Vite + React + Zustand + Tailwind CSS
运行模式：本地 Node 后端 + 浏览器前端

---

## 改造总览

基于 magic-resume fork 进行渐进式增强改造，按以下顺序实施：

1. API 提供商扩展
2. 主题色预设丰富
3. 新增简历模板（学术/科研、设计师/创意岗）
4. AI 新功能（一键生成、JD 优化、STAR 改写、多语言翻译）
5. 导出格式丰富（Word、Markdown）

---

## 1. API 提供商扩展

### 目标

将现有 4 个 LLM 提供商（DeepSeek、豆包、OpenAI、Gemini）扩展到 9 个，并增加通用兼容端点。

### 架构设计

新建 `/src/lib/ai/providers/` 目录，每个提供商一个文件，统一暴露适配器接口：

```typescript
interface AIProvider {
  id: string
  name: string
  chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream>
  validate(config: ProviderConfig): Promise<boolean>
}
```

### 提供商列表

| 提供商 | 文件 | API 格式 | 端点 |
|--------|------|----------|------|
| DeepSeek | `deepseek.ts` | OpenAI 兼容 | `api.deepseek.com/v1` |
| 豆包 (ByteDance) | `doubao.ts` | OpenAI 兼容 | `ark.cn-beijing.volces.com/api/v3` |
| OpenAI | `openai.ts` | OpenAI 原生 | 用户可自定义 |
| Gemini | `gemini.ts` | Google SDK | `generativelanguage.googleapis.com` |
| Claude (Anthropic) | `claude.ts` | Anthropic Messages API | `api.anthropic.com/v1` |
| 通义千问 (阿里) | `qwen.ts` | OpenAI 兼容 | `dashscope.aliyuncs.com/compatible-mode/v1` |
| 智谱 GLM | `zhipu.ts` | OpenAI 兼容 | `open.bigmodel.cn/api/paas/v4` |
| 小米 MiMo | `mimo.ts` | OpenAI 兼容（实施时确认，若不兼容则独立适配） | 小米 AI 开放平台 |
| 通用兼容端点 | `custom.ts` | OpenAI 兼容 | 用户自填 URL |

### 特殊处理

- **Claude：** Anthropic Messages API 格式与 OpenAI 不同（system 单独传、content 为数组），需独立适配器
- **Gemini：** 保留现有 SDK 方式，迁移到统一目录
- **通用端点：** 用户配置 URL + API Key + 模型名，按 OpenAI chat/completions 格式请求

### Store 扩展

`useAIConfigStore` 新增字段：

```typescript
interface AIConfigState {
  selectedModel: ProviderID
  // 每个提供商的配置
  providers: Record<ProviderID, {
    apiKey: string
    modelId?: string
    endpoint?: string  // custom 必填，其他可选（用于代理）
  }>
}
```

### UI

在现有 AI 设置面板增加新提供商的配置卡片，保持现有 UI 风格（HeroUI 组件）。

---

## 2. 主题色预设丰富

### 目标

新增 15 个温和色彩预设，分 3 组展示，替代现有偏暗的少量预设。

### 配置文件

新建 `/src/config/themeColors.ts`：

```typescript
interface ThemeColorGroup {
  id: string
  name: string        // 中文组名
  colors: ThemeColor[]
}

interface ThemeColor {
  id: string
  name: string        // 中文色名
  value: string       // HEX 值
}
```

### 色板定义

**清新雅致系：**
- 雾蓝 `#5B7FA6`
- 湖水蓝 `#6B9DAD`
- 天青 `#8EA8C3`
- 灰绿 `#7C9885`
- 竹青 `#9CAFA2`

**柔和浪漫系：**
- 紫藤 `#B07BAC`
- 玫瑰粉 `#C4878E`
- 杏仁 `#D4A574`
- 薄荷奶绿 `#A3C4BC`
- 淡丁香 `#C9B8D4`

**沉稳商务系：**
- 深海蓝 `#2C5F7C`
- 墨绿 `#4A6741`
- 暗紫 `#6B4C6E`
- 深棕 `#8C5E3C`
- 石墨灰 `#4A5568`

### UI 展示

在主题色选择区域按分组展示色块：
- 每组一行，组名标签在左
- 色块带 hover tooltip 显示中文名
- 点击即应用为当前简历的主题色
- 保留现有 react-colorful 自定义颜色选择器

---

## 3. 新增简历模板

### 通用架构

遵循现有模板结构：
```
/src/components/templates/{templateName}/
  config.ts        — 模板配置（ResumeTemplate 类型）
  index.tsx        — 主组件
  sections/        — 区块组件
```

注册到 `/src/components/templates/registry.ts` 的 `TEMPLATE_REGISTRY` 数组即可生效。

### 模板 A：学术/科研风格 (Academic)

**布局：** 单栏，信息密度高
**默认配色：** 深海蓝 `#2C5F7C`
**字体倾向：** 衬线体（中文宋体/英文 Georgia）
**间距：** 紧凑行距（1.3），小 sectionGap

**特有区块：**
- `publications` — 论文发表，支持 APA/GB-T 格式引用，标注一作/通讯
- `research-projects` — 科研项目/课题，含项目名称、角色、资助来源、经费金额
- `conferences` — 学术会议，区分口头报告/海报展示
- `academic-services` — 学术任职，审稿人、编委等

**通用区块复用：** 教育背景、工作经历（改标签为"学术经历"）、技能、自我评价

### 模板 B：设计师/创意岗风格 (Creative-Pro)

**布局：** 左右双栏（左窄右宽，约 30%/70%）
**默认配色：** 紫藤 `#B07BAC`
**字体倾向：** 无衬线（中文黑体/英文 Inter）
**间距：** 大留白（contentPadding: 40），大 sectionGap

**特有区块：**
- `portfolio` — 作品集展示，带链接和描述
- `skill-visualization` — 技能可视化，进度条形式展示熟练度
- `design-tools` — 设计工具栈，图标化展示（Figma、Photoshop、Sketch、Illustrator 等）

**通用区块复用：** 基本信息、教育背景、工作经历、自我评价

### 模板快照

两个模板各生成中英文快照（复用现有 `/scripts/generate-template-snapshots.ts`）。

---

## 4. AI 新功能

### 通用基础

- 所有 AI 功能共享第 1 部分设计的统一 provider 适配器层
- 流式返回统一用 SSE（Server-Sent Events）格式
- 前端统一 hook：`useAIAction(routePath, payload)` 处理加载态、流式展示、错误提示
- 系统 prompt 集中管理在 `/src/config/prompts/` 目录

### 4.1 一键生成整份简历

**后端路由：** `POST /api/generate`

**输入：**
```typescript
{
  targetPosition: string   // 目标岗位
  experience: string       // 个人经历要点（自由文本）
  templateId: string       // 选择的模板
  language: 'zh' | 'en'    // 语言
}
```

**输出：** 流式返回完整简历 JSON（匹配 ResumeStore 数据结构）

**交互流程：**
1. 新建简历时提供"AI 生成"选项
2. 弹窗：输入目标岗位 + 个人经历要点 + 选择模板
3. AI 生成过程中展示 loading 动画
4. 生成完毕直接填入编辑器

### 4.2 针对 JD 定制优化

**后端路由：** `POST /api/jd-optimize`

**输入：**
```typescript
{
  resume: ResumeData        // 当前简历内容
  jobDescription: string    // 目标 JD 文本
}
```

**输出：** 优化建议列表：
```typescript
{
  suggestions: Array<{
    section: string          // 涉及区块
    original: string         // 原文
    optimized: string        // 建议修改
    reason: string           // 修改理由
  }>
}
```

**交互流程：**
1. 工具栏"JD 优化"按钮 → 弹窗粘贴 JD
2. AI 分析后展示建议列表（diff 形式）
3. 每条建议可单独"采纳"或"忽略"

### 4.3 STAR 法则改写

**后端路由：** `POST /api/star-rewrite`

**输入：**
```typescript
{
  content: string            // 单条经历描述
  context?: string           // 可选：岗位背景信息
}
```

**输出：** STAR 格式改写文本（流式）

**交互流程：**
1. 每条经历描述旁的"STAR 改写"小按钮
2. 点击后 AI 改写，内联展示预览
3. 用户选择"替换"或"取消"

### 4.4 多语言翻译

**后端路由：** `POST /api/translate`

**输入：**
```typescript
{
  resume: ResumeData         // 完整简历数据
  targetLanguage: 'zh' | 'en'
}
```

**输出：** 翻译后的完整简历 JSON

**交互流程：**
1. 工具栏"翻译"按钮 → 选择目标语言
2. AI 翻译全部内容
3. 生成为新的简历副本（不覆盖原文），自动命名为"[原名]-EN"或"[原名]-中文"

---

## 5. 导出格式丰富

### 5.1 Word (.docx) 导出

**依赖：** `docx` npm 包（纯 JS 实现，零原生依赖）

**后端路由：** `POST /api/export/docx`

**实现逻辑：**
1. 接收简历 JSON + 当前模板 ID
2. 根据模板布局类型选择 Word 文档结构（单栏/双栏）
3. 映射样式：标题层级 → Word Heading 1/2/3，主题色 → 字体颜色/边框色
4. 生成 .docx Buffer，返回给前端下载

**限制说明：** Word 排版无法 100% 还原 HTML 模板视觉效果，以内容完整和结构清晰为优先。

### 5.2 Markdown 导出

**实现位置：** `/src/utils/exportMarkdown.ts`（纯前端，无需后端）

**格式规范：**
```markdown
# 姓名

> 联系方式 | 邮箱 | 地址

## 工作经历

### 公司名 — 职位（起止时间）

- 经历描述 1
- 经历描述 2

## 教育背景
...
```

**特点：** 标准 CommonMark，可直接贴入 GitHub Profile 或任何 Markdown 平台。

### 5.3 导出入口 UI

现有 PDF 导出按钮改为下拉菜单组件：
- PDF（默认，保持现有逻辑）
- Word (.docx)
- Markdown (.md)

---

## 实施顺序

渐进式推进，每步完成后即可使用：

1. **Phase 1：API 提供商扩展** — 重构 AI 层，接入所有提供商
2. **Phase 2：主题色预设** — 新增配色配置和 UI
3. **Phase 3：新增模板** — 学术/科研 + 设计师/创意岗
4. **Phase 4：AI 新功能** — 一键生成、JD 优化、STAR 改写、翻译
5. **Phase 5：导出格式** — Word + Markdown 导出

---

## 技术约束

- 保持本地运行，不依赖外部服务器（PDF 导出的远程服务可保留或替换为本地 Puppeteer）
- 所有 API Key 存储在浏览器 LocalStorage，不上传
- 新增依赖尽量选择零原生依赖的纯 JS 包，降低安装复杂度
- 保持现有 i18n 结构，新增功能需同时提供中英文文案
