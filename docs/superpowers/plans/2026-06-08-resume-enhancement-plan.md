# Magic Resume Enhancement - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance magic-resume with expanded AI providers, richer theme colors, new templates, AI features, and export formats.

**Architecture:** Fork-based incremental enhancement. Each phase produces a working product. AI providers share a unified adapter interface. New templates follow existing registry pattern. Export formats extend the existing PdfExport dialog.

**Tech Stack:** TanStack Start, Vite, React, Zustand, Tailwind CSS, HeroUI, Tiptap, react-colorful, docx (new dep for Word export)

---

## Phase 1: API Provider Expansion

### Task 1: Define unified provider types

**Files:**
- Create: `src/lib/ai/providers/types.ts`
- Modify: `src/config/ai.ts`

- [ ] **Step 1: Create the provider types file**

```typescript
// src/lib/ai/providers/types.ts
export type ProviderID =
  | "doubao"
  | "deepseek"
  | "openai"
  | "gemini"
  | "claude"
  | "qwen"
  | "zhipu"
  | "mimo"
  | "custom";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderConfig {
  apiKey: string;
  modelId?: string;
  endpoint?: string;
}

export interface AIProvider {
  id: ProviderID;
  name: string;
  chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>>;
  validate(config: ProviderConfig): boolean;
}
```

- [ ] **Step 2: Verify file created correctly**

Run: `ls src/lib/ai/providers/types.ts`
Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add src/lib/ai/providers/types.ts
git commit -m "feat: add unified AI provider type definitions"
```

---

### Task 2: Implement OpenAI-compatible base provider

**Files:**
- Create: `src/lib/ai/providers/openai-compatible.ts`

This is the shared base for DeepSeek, Doubao, Qwen, Zhipu, MiMo, Custom, and OpenAI itself.

- [ ] **Step 1: Create the OpenAI-compatible base**

```typescript
// src/lib/ai/providers/openai-compatible.ts
import { AIProvider, Message, ProviderConfig, ProviderID } from "./types";

interface OpenAICompatibleOptions {
  id: ProviderID;
  name: string;
  defaultEndpoint: string;
  defaultModel?: string;
  requiresModelId: boolean;
  headersFactory?: (apiKey: string) => Record<string, string>;
}

export function createOpenAICompatibleProvider(options: OpenAICompatibleOptions): AIProvider {
  const {
    id,
    name,
    defaultEndpoint,
    defaultModel,
    requiresModelId,
    headersFactory,
  } = options;

  const getHeaders = headersFactory ?? ((apiKey: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }));

  return {
    id,
    name,
    validate(config: ProviderConfig): boolean {
      if (!config.apiKey) return false;
      if (requiresModelId && !config.modelId) return false;
      if (id === "custom" && !config.endpoint) return false;
      return true;
    },
    async chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>> {
      const endpoint = config.endpoint?.trim().replace(/\/+$/, "") || defaultEndpoint;
      const url = `${endpoint}/chat/completions`;
      const model = config.modelId || defaultModel || "";

      const response = await fetch(url, {
        method: "POST",
        headers: getHeaders(config.apiKey),
        body: JSON.stringify({
          model,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Provider ${name} error ${response.status}: ${text}`);
      }

      if (!response.body) {
        throw new Error(`Provider ${name} returned no body`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      return new ReadableStream<Uint8Array>({
        async pull(controller) {
          let pending = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }

            pending += decoder.decode(value, { stream: true });
            const lines = pending.split(/\r?\n/);
            pending = lines.pop() ?? "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;

              try {
                const data = JSON.parse(payload);
                if (data.error?.message) {
                  controller.error(new Error(data.error.message));
                  return;
                }
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // skip malformed lines
              }
            }
          }
        },
      });
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/providers/openai-compatible.ts
git commit -m "feat: add OpenAI-compatible base provider factory"
```

---

### Task 3: Implement all OpenAI-compatible providers

**Files:**
- Create: `src/lib/ai/providers/deepseek.ts`
- Create: `src/lib/ai/providers/doubao.ts`
- Create: `src/lib/ai/providers/openai.ts`
- Create: `src/lib/ai/providers/qwen.ts`
- Create: `src/lib/ai/providers/zhipu.ts`
- Create: `src/lib/ai/providers/mimo.ts`
- Create: `src/lib/ai/providers/custom.ts`

- [ ] **Step 1: Create each provider file**

```typescript
// src/lib/ai/providers/deepseek.ts
import { createOpenAICompatibleProvider } from "./openai-compatible";

export const deepseekProvider = createOpenAICompatibleProvider({
  id: "deepseek",
  name: "DeepSeek",
  defaultEndpoint: "https://api.deepseek.com/v1",
  defaultModel: "deepseek-chat",
  requiresModelId: false,
});
```

```typescript
// src/lib/ai/providers/doubao.ts
import { createOpenAICompatibleProvider } from "./openai-compatible";

export const doubaoProvider = createOpenAICompatibleProvider({
  id: "doubao",
  name: "豆包",
  defaultEndpoint: "https://ark.cn-beijing.volces.com/api/v3",
  requiresModelId: true,
});
```

```typescript
// src/lib/ai/providers/openai.ts
import { createOpenAICompatibleProvider } from "./openai-compatible";

export const openaiProvider = createOpenAICompatibleProvider({
  id: "openai",
  name: "OpenAI",
  defaultEndpoint: "",
  requiresModelId: true,
});
```

```typescript
// src/lib/ai/providers/qwen.ts
import { createOpenAICompatibleProvider } from "./openai-compatible";

export const qwenProvider = createOpenAICompatibleProvider({
  id: "qwen",
  name: "通义千问",
  defaultEndpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  defaultModel: "qwen-plus",
  requiresModelId: true,
});
```

```typescript
// src/lib/ai/providers/zhipu.ts
import { createOpenAICompatibleProvider } from "./openai-compatible";

export const zhipuProvider = createOpenAICompatibleProvider({
  id: "zhipu",
  name: "智谱 GLM",
  defaultEndpoint: "https://open.bigmodel.cn/api/paas/v4",
  defaultModel: "glm-4-flash",
  requiresModelId: true,
});
```

```typescript
// src/lib/ai/providers/mimo.ts
import { createOpenAICompatibleProvider } from "./openai-compatible";

export const mimoProvider = createOpenAICompatibleProvider({
  id: "mimo",
  name: "小米 MiMo",
  defaultEndpoint: "https://api.mimo.xiaomi.com/v1",
  defaultModel: "MiMo-7B",
  requiresModelId: true,
});
```

```typescript
// src/lib/ai/providers/custom.ts
import { createOpenAICompatibleProvider } from "./openai-compatible";

export const customProvider = createOpenAICompatibleProvider({
  id: "custom",
  name: "自定义端点",
  defaultEndpoint: "",
  requiresModelId: true,
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/providers/deepseek.ts src/lib/ai/providers/doubao.ts src/lib/ai/providers/openai.ts src/lib/ai/providers/qwen.ts src/lib/ai/providers/zhipu.ts src/lib/ai/providers/mimo.ts src/lib/ai/providers/custom.ts
git commit -m "feat: add all OpenAI-compatible provider implementations"
```

---

### Task 4: Implement Claude (Anthropic) provider

**Files:**
- Create: `src/lib/ai/providers/claude.ts`

Claude uses a different API format (Messages API with separate system param and content arrays).

- [ ] **Step 1: Create the Claude provider**

```typescript
// src/lib/ai/providers/claude.ts
import { AIProvider, Message, ProviderConfig } from "./types";

export const claudeProvider: AIProvider = {
  id: "claude",
  name: "Claude (Anthropic)",

  validate(config: ProviderConfig): boolean {
    return !!(config.apiKey && config.modelId);
  },

  async chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>> {
    const endpoint = config.endpoint?.trim().replace(/\/+$/, "") || "https://api.anthropic.com";
    const url = `${endpoint}/v1/messages`;

    const systemMessage = messages.find((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model: config.modelId,
      max_tokens: 4096,
      stream: true,
      messages: nonSystemMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    if (systemMessage) {
      body.system = systemMessage.content;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Claude API error ${response.status}: ${text}`);
    }

    if (!response.body) {
      throw new Error("Claude API returned no body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async pull(controller) {
        let pending = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }

          pending += decoder.decode(value, { stream: true });
          const lines = pending.split(/\r?\n/);
          pending = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const event = JSON.parse(payload);
              if (event.type === "content_block_delta" && event.delta?.text) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
              if (event.type === "message_stop") {
                controller.close();
                return;
              }
              if (event.type === "error") {
                controller.error(new Error(event.error?.message || "Claude stream error"));
                return;
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      },
    });
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/providers/claude.ts
git commit -m "feat: add Claude (Anthropic) provider with Messages API"
```

---

### Task 5: Implement Gemini provider (migrate existing)

**Files:**
- Create: `src/lib/ai/providers/gemini.ts`

- [ ] **Step 1: Create Gemini provider wrapping existing SDK logic**

```typescript
// src/lib/ai/providers/gemini.ts
import { AIProvider, Message, ProviderConfig } from "./types";
import { getGeminiModelInstance } from "@/lib/server/gemini";

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Gemini",

  validate(config: ProviderConfig): boolean {
    return !!(config.apiKey && config.modelId);
  },

  async chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";

    const modelInstance = getGeminiModelInstance({
      apiKey: config.apiKey,
      model: config.modelId || "gemini-flash-latest",
      systemInstruction: systemMessage?.content,
      generationConfig: { temperature: 0.4 },
    });

    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const result = await modelInstance.generateContentStream(lastUserMessage);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/providers/gemini.ts
git commit -m "feat: add Gemini provider wrapping existing SDK"
```

---

### Task 6: Create provider registry and index

**Files:**
- Create: `src/lib/ai/providers/index.ts`

- [ ] **Step 1: Create the registry index**

```typescript
// src/lib/ai/providers/index.ts
import { AIProvider, ProviderID } from "./types";
import { deepseekProvider } from "./deepseek";
import { doubaoProvider } from "./doubao";
import { openaiProvider } from "./openai";
import { geminiProvider } from "./gemini";
import { claudeProvider } from "./claude";
import { qwenProvider } from "./qwen";
import { zhipuProvider } from "./zhipu";
import { mimoProvider } from "./mimo";
import { customProvider } from "./custom";

export const PROVIDERS: Record<ProviderID, AIProvider> = {
  deepseek: deepseekProvider,
  doubao: doubaoProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
  claude: claudeProvider,
  qwen: qwenProvider,
  zhipu: zhipuProvider,
  mimo: mimoProvider,
  custom: customProvider,
};

export function getProvider(id: ProviderID): AIProvider {
  const provider = PROVIDERS[id];
  if (!provider) throw new Error(`Unknown provider: ${id}`);
  return provider;
}

export type { AIProvider, ProviderID, Message, ProviderConfig } from "./types";
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/providers/index.ts
git commit -m "feat: add provider registry with all 9 providers"
```

---

### Task 7: Refactor AI config store to support new providers

**Files:**
- Modify: `src/store/useAIConfigStore.ts`
- Modify: `src/config/ai.ts`

- [ ] **Step 1: Update the AI config store**

Replace the current flat field structure with a generic `providers` record while keeping backward compatibility with the LocalStorage persisted data.

```typescript
// src/store/useAIConfigStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProviderID, PROVIDERS } from "@/lib/ai/providers";

interface ProviderSettings {
  apiKey: string;
  modelId: string;
  endpoint: string;
}

interface AIConfigState {
  selectedModel: ProviderID;
  providers: Record<ProviderID, ProviderSettings>;
  setSelectedModel: (model: ProviderID) => void;
  setProviderField: (provider: ProviderID, field: keyof ProviderSettings, value: string) => void;
  isConfigured: () => boolean;
  getProviderConfig: (id?: ProviderID) => { apiKey: string; modelId: string; endpoint: string };
}

const defaultProviderSettings = (): ProviderSettings => ({
  apiKey: "",
  modelId: "",
  endpoint: "",
});

const createDefaultProviders = (): Record<ProviderID, ProviderSettings> => ({
  doubao: defaultProviderSettings(),
  deepseek: defaultProviderSettings(),
  openai: defaultProviderSettings(),
  gemini: { apiKey: "", modelId: "gemini-flash-latest", endpoint: "" },
  claude: { apiKey: "", modelId: "claude-sonnet-4-20250514", endpoint: "" },
  qwen: { apiKey: "", modelId: "qwen-plus", endpoint: "" },
  zhipu: { apiKey: "", modelId: "glm-4-flash", endpoint: "" },
  mimo: { apiKey: "", modelId: "", endpoint: "" },
  custom: defaultProviderSettings(),
});

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      selectedModel: "deepseek",
      providers: createDefaultProviders(),
      setSelectedModel: (model: ProviderID) => set({ selectedModel: model }),
      setProviderField: (provider, field, value) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: { ...state.providers[provider], [field]: value },
          },
        })),
      isConfigured: () => {
        const state = get();
        const provider = PROVIDERS[state.selectedModel];
        const config = state.providers[state.selectedModel];
        return provider.validate(config);
      },
      getProviderConfig: (id) => {
        const state = get();
        const providerId = id || state.selectedModel;
        return state.providers[providerId];
      },
    }),
    {
      name: "ai-config-storage",
      migrate: (persisted: any, version: number) => {
        // Migrate from old flat structure to new providers record
        if (persisted && !persisted.providers) {
          const providers = createDefaultProviders();
          if (persisted.doubaoApiKey) {
            providers.doubao.apiKey = persisted.doubaoApiKey;
            providers.doubao.modelId = persisted.doubaoModelId || "";
          }
          if (persisted.deepseekApiKey) {
            providers.deepseek.apiKey = persisted.deepseekApiKey;
            providers.deepseek.modelId = persisted.deepseekModelId || "";
          }
          if (persisted.openaiApiKey) {
            providers.openai.apiKey = persisted.openaiApiKey;
            providers.openai.modelId = persisted.openaiModelId || "";
            providers.openai.endpoint = persisted.openaiApiEndpoint || "";
          }
          if (persisted.geminiApiKey) {
            providers.gemini.apiKey = persisted.geminiApiKey;
            providers.gemini.modelId = persisted.geminiModelId || "gemini-flash-latest";
          }
          return { selectedModel: persisted.selectedModel || "deepseek", providers };
        }
        return persisted;
      },
      version: 1,
    }
  )
);
```

- [ ] **Step 2: Update `src/config/ai.ts` to re-export from new location**

```typescript
// src/config/ai.ts — keep for backward compatibility during migration
export type { ProviderID as AIModelType } from "@/lib/ai/providers";
export { PROVIDERS as AI_MODEL_CONFIGS } from "@/lib/ai/providers";
```

- [ ] **Step 3: Run dev server to verify no build errors**

Run: `cd D:/1111coe/magic-resume && pnpm dev`
Expected: dev server starts without TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/store/useAIConfigStore.ts src/config/ai.ts
git commit -m "refactor: migrate AI config store to unified provider system"
```

---

### Task 8: Update AI settings page for new providers

**Files:**
- Modify: `src/app/app/dashboard/ai/page.tsx`
- Create: `src/components/ai/icon/IconClaude.tsx`
- Create: `src/components/ai/icon/IconQwen.tsx`
- Create: `src/components/ai/icon/IconZhipu.tsx`
- Create: `src/components/ai/icon/IconMimo.tsx`
- Create: `src/components/ai/icon/IconCustom.tsx`

- [ ] **Step 1: Create simple SVG icon components for each new provider**

Each icon is a simple functional component returning an SVG. Use the provider's brand color as the primary fill. Example pattern:

```typescript
// src/components/ai/icon/IconClaude.tsx
import React from "react";

const IconClaude: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
  </svg>
);
export default IconClaude;
```

Create similar files for IconQwen, IconZhipu, IconMimo, IconCustom.

- [ ] **Step 2: Rewrite the AI settings page to use the new store**

The page should iterate over a `models` array derived from the provider registry. Each model card shows: provider name, icon, API key input, optional model ID input, optional endpoint input. The structure follows the existing pattern but uses `setProviderField` instead of individual setters.

Key changes to `src/app/app/dashboard/ai/page.tsx`:
- Import from `@/lib/ai/providers` and new icons
- Replace individual state fields with `providers[currentModel].apiKey` etc.
- Replace `handleApiKeyChange` / `handleModelIdChange` with a single `handleFieldChange(provider, field, value)`
- Add all 9 providers to the `models` array

- [ ] **Step 3: Update i18n locale files**

Add to both `src/i18n/locales/zh.json` and `src/i18n/locales/en.json`:

```json
{
  "dashboard": {
    "settings": {
      "ai": {
        "claude": { "title": "Claude (Anthropic)", "description": "Anthropic 的 Claude 模型", "apiKey": "API Key", "modelId": "模型 ID" },
        "qwen": { "title": "通义千问", "description": "阿里云的通义千问大模型", "apiKey": "API Key", "modelId": "模型 ID" },
        "zhipu": { "title": "智谱 GLM", "description": "智谱 AI 的 GLM 系列模型", "apiKey": "API Key", "modelId": "模型 ID" },
        "mimo": { "title": "小米 MiMo", "description": "小米的 MiMo 大模型", "apiKey": "API Key", "modelId": "模型 ID" },
        "custom": { "title": "自定义端点", "description": "兼容 OpenAI 格式的自定义 API", "apiKey": "API Key", "modelId": "模型名称", "apiEndpoint": "API 端点 URL" }
      }
    }
  }
}
```

- [ ] **Step 4: Run dev server and verify the AI settings page renders all providers**

Run: `pnpm dev`
Expected: navigate to AI settings page, all 9 providers listed

- [ ] **Step 5: Commit**

```bash
git add src/app/app/dashboard/ai/page.tsx src/components/ai/icon/ src/i18n/locales/
git commit -m "feat: update AI settings page with all 9 providers"
```

---

### Task 9: Refactor polish/grammar API routes to use new provider system

**Files:**
- Modify: `src/routes/api/polish.ts`
- Modify: `src/routes/api/grammar.ts`

- [ ] **Step 1: Refactor the polish route**

Replace the manual fetch + Gemini branching with a call to `getProvider(modelType).chat(messages, config)`. The route body becomes significantly simpler:

```typescript
// Key section of src/routes/api/polish.ts (inside the POST handler)
import { getProvider, ProviderID } from "@/lib/ai/providers";

// ... parse body ...
const provider = getProvider(modelType as ProviderID);
const stream = await provider.chat(
  [
    { role: "system", content: systemPrompt },
    { role: "user", content },
  ],
  { apiKey, modelId: model, endpoint: apiEndpoint }
);

return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
```

- [ ] **Step 2: Apply same refactor to grammar route**

- [ ] **Step 3: Test with existing provider (DeepSeek) to verify streaming still works**

Run: `pnpm dev`, configure a DeepSeek key, use the polish feature on a resume entry.
Expected: text streams in as before.

- [ ] **Step 4: Commit**

```bash
git add src/routes/api/polish.ts src/routes/api/grammar.ts
git commit -m "refactor: simplify API routes using unified provider system"
```

---

## Phase 2: Theme Color Presets

### Task 10: Add theme color preset data

**Files:**
- Create: `src/config/themeColors.ts`
- Modify: `src/types/resume.ts`

- [ ] **Step 1: Create theme colors config**

```typescript
// src/config/themeColors.ts
export interface ThemeColor {
  id: string;
  name: string;
  nameEn: string;
  value: string;
}

export interface ThemeColorGroup {
  id: string;
  name: string;
  nameEn: string;
  colors: ThemeColor[];
}

export const THEME_COLOR_GROUPS: ThemeColorGroup[] = [
  {
    id: "fresh",
    name: "清新雅致",
    nameEn: "Fresh & Elegant",
    colors: [
      { id: "fog-blue", name: "雾蓝", nameEn: "Fog Blue", value: "#5B7FA6" },
      { id: "lake-blue", name: "湖水蓝", nameEn: "Lake Blue", value: "#6B9DAD" },
      { id: "sky-blue", name: "天青", nameEn: "Sky Blue", value: "#8EA8C3" },
      { id: "gray-green", name: "灰绿", nameEn: "Gray Green", value: "#7C9885" },
      { id: "bamboo-green", name: "竹青", nameEn: "Bamboo Green", value: "#9CAFA2" },
    ],
  },
  {
    id: "romantic",
    name: "柔和浪漫",
    nameEn: "Soft & Romantic",
    colors: [
      { id: "wisteria", name: "紫藤", nameEn: "Wisteria", value: "#B07BAC" },
      { id: "rose-pink", name: "玫瑰粉", nameEn: "Rose Pink", value: "#C4878E" },
      { id: "almond", name: "杏仁", nameEn: "Almond", value: "#D4A574" },
      { id: "mint-cream", name: "薄荷奶绿", nameEn: "Mint Cream", value: "#A3C4BC" },
      { id: "lilac", name: "淡丁香", nameEn: "Lilac", value: "#C9B8D4" },
    ],
  },
  {
    id: "business",
    name: "沉稳商务",
    nameEn: "Business",
    colors: [
      { id: "deep-sea", name: "深海蓝", nameEn: "Deep Sea", value: "#2C5F7C" },
      { id: "dark-green", name: "墨绿", nameEn: "Dark Green", value: "#4A6741" },
      { id: "dark-purple", name: "暗紫", nameEn: "Dark Purple", value: "#6B4C6E" },
      { id: "dark-brown", name: "深棕", nameEn: "Dark Brown", value: "#8C5E3C" },
      { id: "graphite", name: "石墨灰", nameEn: "Graphite", value: "#4A5568" },
    ],
  },
];

export const ALL_PRESET_COLORS = THEME_COLOR_GROUPS.flatMap((g) => g.colors.map((c) => c.value));
```

- [ ] **Step 2: Update THEME_COLORS in `src/types/resume.ts`**

Replace the old array with the new presets plus the original basic colors:

```typescript
// In src/types/resume.ts, replace the THEME_COLORS export:
import { ALL_PRESET_COLORS } from "@/config/themeColors";

export const THEME_COLORS = [
  "#000000",
  "#333333",
  "#666666",
  ...ALL_PRESET_COLORS,
];
```

- [ ] **Step 3: Commit**

```bash
git add src/config/themeColors.ts src/types/resume.ts
git commit -m "feat: add 15 new theme color presets in 3 groups"
```

---

### Task 11: Update the theme color picker UI

**Files:**
- Modify: `src/components/editor/SidePanel.tsx`

- [ ] **Step 1: Update the color grid to show grouped presets**

In `SidePanel.tsx`, replace the flat color grid with grouped display. Import `THEME_COLOR_GROUPS` and render each group with a label and its color swatches:

```tsx
import { THEME_COLOR_GROUPS } from "@/config/themeColors";

// Inside the theme section's children:
<div className="space-y-3 pt-1">
  {THEME_COLOR_GROUPS.map((group) => (
    <div key={group.id} className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{group.name}</span>
      <div className="flex flex-wrap gap-2">
        {group.colors.map((color) => (
          <button
            key={color.id}
            title={color.name}
            onClick={() => debouncedSetColor(color.value)}
            className={cn(
              "w-6 h-6 rounded-full transition-all duration-200",
              themeColor === color.value
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "ring-1 ring-border hover:ring-primary/50 hover:scale-110"
            )}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  ))}
  {/* Keep the original basic colors row */}
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground w-16 shrink-0">基础</span>
    <div className="flex flex-wrap gap-2">
      {["#000000", "#333333", "#666666"].map((c) => (
        <button
          key={c}
          onClick={() => debouncedSetColor(c)}
          className={cn(
            "w-6 h-6 rounded-full transition-all duration-200",
            themeColor === c
              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
              : "ring-1 ring-border hover:ring-primary/50 hover:scale-110"
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Run dev server and verify the theme color picker shows 3 groups**

Run: `pnpm dev`
Expected: color presets appear in grouped rows with Chinese labels

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/SidePanel.tsx
git commit -m "feat: display theme colors in grouped preset layout"
```

---

## Phase 3: New Resume Templates

### Task 12: Create Academic template

**Files:**
- Create: `src/components/templates/academic/config.ts`
- Create: `src/components/templates/academic/index.tsx`
- Create: `src/components/templates/academic/sections/BaseInfo.tsx`
- Create: `src/components/templates/academic/sections/SectionTitle.tsx`
- Create: `src/components/templates/academic/sections/PublicationsSection.tsx`
- Create: `src/components/templates/academic/sections/ResearchProjectsSection.tsx`
- Create: `src/components/templates/academic/sections/ConferencesSection.tsx`
- Create: `src/components/templates/academic/sections/AcademicServicesSection.tsx`
- Modify: `src/components/templates/registry.ts`

- [ ] **Step 1: Create academic config**

```typescript
// src/components/templates/academic/config.ts
import { ResumeTemplate } from "@/types/template";

export const academicConfig: ResumeTemplate = {
  id: "academic",
  name: "学术/科研",
  description: "适合学术研究人员，突出论文发表与科研项目",
  thumbnail: "academic",
  layout: "academic",
  colorScheme: {
    primary: "#2C5F7C",
    secondary: "#4b5563",
    background: "#ffffff",
    text: "#1f2937",
  },
  spacing: {
    sectionGap: 12,
    itemGap: 8,
    contentPadding: 32,
  },
  basic: {
    layout: "center",
  },
  availableSections: [
    "education", "experience", "skills", "projects",
    "selfEvaluation", "certificates",
  ],
};
```

- [ ] **Step 2: Create academic index.tsx following the classic template pattern**

The template uses a single-column layout with compact spacing. It renders standard sections plus academic-specific custom sections (publications, research projects, conferences, academic services rendered via CustomSection).

- [ ] **Step 3: Create section components following existing patterns**

Each section component (PublicationsSection, etc.) follows the same pattern as ExperienceSection — accepts items array, renders with compact styling, uses the template's color scheme.

- [ ] **Step 4: Register in registry.ts**

Add to TEMPLATE_REGISTRY:
```typescript
import { academicConfig } from "./academic/config";
import AcademicTemplate from "./academic";

// In the array:
{ config: academicConfig, Component: AcademicTemplate },
```

- [ ] **Step 5: Run dev and verify template appears in template selection**

- [ ] **Step 6: Commit**

```bash
git add src/components/templates/academic/ src/components/templates/registry.ts
git commit -m "feat: add Academic/Research resume template"
```

---

### Task 13: Create Creative-Pro (Designer) template

**Files:**
- Create: `src/components/templates/creative-pro/config.ts`
- Create: `src/components/templates/creative-pro/index.tsx`
- Create: `src/components/templates/creative-pro/sections/` (BaseInfo, SectionTitle, PortfolioSection, SkillVisualization, DesignTools)
- Modify: `src/components/templates/registry.ts`

- [ ] **Step 1: Create creative-pro config**

```typescript
// src/components/templates/creative-pro/config.ts
import { ResumeTemplate } from "@/types/template";

export const creativeProConfig: ResumeTemplate = {
  id: "creative-pro",
  name: "设计师/创意岗",
  description: "适合设计师和创意岗位，突出作品集与视觉技能",
  thumbnail: "creativePro",
  layout: "creative-pro",
  colorScheme: {
    primary: "#B07BAC",
    secondary: "#6b7280",
    background: "#ffffff",
    text: "#1f2937",
  },
  spacing: {
    sectionGap: 24,
    itemGap: 16,
    contentPadding: 40,
  },
  basic: {
    layout: "left",
  },
  availableSections: [
    "education", "experience", "skills", "projects",
    "selfEvaluation", "certificates",
  ],
};
```

- [ ] **Step 2: Create creative-pro index.tsx with left-right layout (30%/70%)**

The template uses a two-column flex layout. Left sidebar (30%) contains BaseInfo, SkillVisualization, DesignTools. Right main area (70%) contains Experience, Education, Portfolio, Projects.

- [ ] **Step 3: Create section components**

- PortfolioSection: renders portfolio links with descriptions
- SkillVisualization: renders skills as progress bars with percentages
- DesignTools: renders tool icons/labels in a grid

- [ ] **Step 4: Register in registry.ts**

- [ ] **Step 5: Run dev and verify template renders**

- [ ] **Step 6: Commit**

```bash
git add src/components/templates/creative-pro/ src/components/templates/registry.ts
git commit -m "feat: add Creative-Pro designer resume template"
```

---

## Phase 4: AI New Features

### Task 14: Create shared AI action hook and prompts

**Files:**
- Create: `src/hooks/useAIAction.ts`
- Create: `src/config/prompts/generate.ts`
- Create: `src/config/prompts/jd-optimize.ts`
- Create: `src/config/prompts/star-rewrite.ts`
- Create: `src/config/prompts/translate.ts`

- [ ] **Step 1: Create useAIAction hook**

A reusable hook that handles: POSTing to a route, reading the stream, managing loading/error/result state.

```typescript
// src/hooks/useAIAction.ts
import { useState, useCallback, useRef } from "react";

interface UseAIActionOptions {
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export function useAIAction(routePath: string, options?: UseAIActionOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (payload: Record<string, unknown>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setResult("");
    let fullText = "";

    try {
      const response = await fetch(routePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setResult(fullText);
        options?.onChunk?.(chunk);
      }

      options?.onComplete?.(fullText);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err);
        options?.onError?.(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [routePath, options]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { execute, abort, isLoading, result, error };
}
```

- [ ] **Step 2: Create system prompt files**

Each prompt file exports a function that returns the system prompt string. Keep prompts in Chinese with bilingual instructions.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAIAction.ts src/config/prompts/
git commit -m "feat: add useAIAction hook and AI prompt templates"
```

---

### Task 15: Implement resume generation API route

**Files:**
- Create: `src/routes/api/generate.ts`

- [ ] **Step 1: Create the generate route**

Accepts target position, experience, template, language. Uses the configured AI provider to generate a structured resume JSON. Returns as stream.

- [ ] **Step 2: Test with a configured provider**

- [ ] **Step 3: Commit**

---

### Task 16: Implement JD optimization API route and UI

**Files:**
- Create: `src/routes/api/jd-optimize.ts`
- Create: `src/components/ai/JdOptimizeDialog.tsx`

- [ ] **Step 1: Create route that accepts resume + JD, returns suggestions**
- [ ] **Step 2: Create dialog UI with JD text input and suggestion list**
- [ ] **Step 3: Add "JD Optimize" button to the editor toolbar**
- [ ] **Step 4: Test end-to-end**
- [ ] **Step 5: Commit**

---

### Task 17: Implement STAR rewrite API route and UI

**Files:**
- Create: `src/routes/api/star-rewrite.ts`
- Create: `src/components/ai/StarRewriteButton.tsx`

- [ ] **Step 1: Create route that accepts single experience text, returns STAR version**
- [ ] **Step 2: Create inline button component that triggers rewrite with preview**
- [ ] **Step 3: Add button next to experience description fields**
- [ ] **Step 4: Test end-to-end**
- [ ] **Step 5: Commit**

---

### Task 18: Implement translation API route and UI

**Files:**
- Create: `src/routes/api/translate.ts`
- Create: `src/components/ai/TranslateDialog.tsx`

- [ ] **Step 1: Create route that accepts full resume JSON + target language**
- [ ] **Step 2: Create dialog with language selector, generates new resume copy**
- [ ] **Step 3: Add "Translate" button to editor toolbar**
- [ ] **Step 4: Test end-to-end**
- [ ] **Step 5: Commit**

---

## Phase 5: Export Formats

### Task 19: Add Word (.docx) export

**Files:**
- Modify: `package.json` (add `docx` dependency)
- Create: `src/routes/api/export/docx.ts`
- Modify: `src/components/shared/PdfExport.tsx`

- [ ] **Step 1: Install docx dependency**

Run: `pnpm add docx`

- [ ] **Step 2: Create the docx export route**

```typescript
// src/routes/api/export/docx.ts
// Accepts resume JSON, generates a .docx buffer using the docx library
// Maps sections to Word paragraphs with heading styles and theme colors
```

- [ ] **Step 3: Add Word export card to PdfExport dialog**

Add a new ExportCard for Word alongside existing PDF/Print/JSON/Markdown cards. The onClick triggers a POST to `/api/export/docx` and downloads the result as a .docx file.

- [ ] **Step 4: Add i18n strings for Word export**

- [ ] **Step 5: Test export produces valid .docx file**

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/routes/api/export/ src/components/shared/PdfExport.tsx src/i18n/locales/
git commit -m "feat: add Word (.docx) export format"
```

---

### Task 20: Verify existing Markdown export and finalize

**Files:**
- Verify: `src/utils/markdown.ts` (already exists and works)
- Verify: `src/components/shared/PdfExport.tsx` (already has Markdown export card)

- [ ] **Step 1: Verify Markdown export works correctly**

The existing codebase already has Markdown export built into PdfExport.tsx (using `exportResumeAsMarkdown` from `src/utils/export.ts`). Confirm it produces correct output.

Run: `pnpm dev`, open a resume, click export → Markdown
Expected: downloads a valid .md file with proper formatting

- [ ] **Step 2: If any issues, fix them. Otherwise mark complete.**

- [ ] **Step 3: Final commit for Phase 5**

```bash
git commit --allow-empty -m "chore: verify Markdown export working correctly"
```

---

## Post-Implementation

- [ ] **Run full build to verify no errors:** `pnpm build`
- [ ] **Generate template snapshots for new templates:** `pnpm run generate-snapshots`
- [ ] **Verify all 9 AI providers can be configured and selected**
- [ ] **Verify theme color presets display correctly in both light/dark mode**
- [ ] **Test each AI feature (generate, JD optimize, STAR, translate) with at least one provider**
- [ ] **Test Word export with a filled resume**
