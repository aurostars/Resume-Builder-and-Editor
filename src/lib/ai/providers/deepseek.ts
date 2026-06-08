import { createOpenAICompatibleProvider } from "./openai-compatible";

export const deepseekProvider = createOpenAICompatibleProvider({
  id: "deepseek",
  name: "DeepSeek",
  defaultEndpoint: "https://api.deepseek.com/v1",
  defaultModel: "deepseek-chat",
  requiresModelId: false,
});
