// Backward compatibility — new code should import from @/lib/ai/providers
export type { ProviderID as AIModelType } from "@/lib/ai/providers";

// Legacy type kept for any remaining references
export type AIValidationContext = Record<string, string | undefined>;

export interface AIModelConfig {
  url: (endpoint?: string) => string;
  requiresModelId: boolean;
  defaultModel?: string;
  headers: (apiKey: string) => Record<string, string>;
  validate: (context: AIValidationContext) => boolean;
}

/**
 * @deprecated Use PROVIDERS from @/lib/ai/providers and the unified chat() interface instead.
 * Kept for API route handlers that still rely on url/headers/requiresModelId.
 */
export const AI_MODEL_CONFIGS: Record<string, AIModelConfig> = {
  doubao: {
    url: () => "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!(ctx.doubaoApiKey && ctx.doubaoModelId),
  },
  deepseek: {
    url: () => "https://api.deepseek.com/v1/chat/completions",
    requiresModelId: false,
    defaultModel: "deepseek-chat",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!ctx.deepseekApiKey,
  },
  openai: {
    url: (endpoint?: string) =>
      `${(endpoint || "").trim().replace(/\/+$/, "")}/chat/completions`,
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!(ctx.openaiApiKey && ctx.openaiModelId && ctx.openaiApiEndpoint),
  },
  gemini: {
    url: () => "https://generativelanguage.googleapis.com/v1beta",
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    }),
    validate: (ctx) => !!(ctx.geminiApiKey && ctx.geminiModelId),
  },
  claude: {
    url: () => "https://api.anthropic.com/v1/messages",
    requiresModelId: true,
    defaultModel: "claude-sonnet-4-20250514",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    validate: (ctx) => !!(ctx.claudeApiKey),
  },
  qwen: {
    url: () => "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    requiresModelId: true,
    defaultModel: "qwen-plus",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!(ctx.qwenApiKey),
  },
  zhipu: {
    url: () => "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    requiresModelId: true,
    defaultModel: "glm-4-flash",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!(ctx.zhipuApiKey),
  },
  mimo: {
    url: () => "https://api.mimo.xiaomi.com/v1/chat/completions",
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!(ctx.mimoApiKey && ctx.mimoModelId),
  },
  custom: {
    url: (endpoint?: string) =>
      `${(endpoint || "").trim().replace(/\/+$/, "")}/chat/completions`,
    requiresModelId: true,
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    validate: (ctx) => !!(ctx.customApiKey && ctx.customModelId && ctx.customEndpoint),
  },
};
