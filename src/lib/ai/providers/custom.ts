import { createOpenAICompatibleProvider } from "./openai-compatible";

export const customProvider = createOpenAICompatibleProvider({
  id: "custom",
  name: "自定义端点",
  defaultEndpoint: "",
  requiresModelId: true,
});
