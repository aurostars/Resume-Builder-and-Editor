import { createOpenAICompatibleProvider } from "./openai-compatible";

export const qwenProvider = createOpenAICompatibleProvider({
  id: "qwen",
  name: "通义千问",
  defaultEndpoint: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  defaultModel: "qwen-plus",
  requiresModelId: true,
});
