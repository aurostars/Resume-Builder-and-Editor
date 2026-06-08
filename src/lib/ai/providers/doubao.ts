import { createOpenAICompatibleProvider } from "./openai-compatible";

export const doubaoProvider = createOpenAICompatibleProvider({
  id: "doubao",
  name: "豆包",
  defaultEndpoint: "https://ark.cn-beijing.volces.com/api/v3",
  requiresModelId: true,
});
