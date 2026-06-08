import { createOpenAICompatibleProvider } from "./openai-compatible";

export const zhipuProvider = createOpenAICompatibleProvider({
  id: "zhipu",
  name: "智谱 GLM",
  defaultEndpoint: "https://open.bigmodel.cn/api/paas/v4",
  defaultModel: "glm-4-flash",
  requiresModelId: true,
});
