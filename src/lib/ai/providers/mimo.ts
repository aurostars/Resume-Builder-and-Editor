import { createOpenAICompatibleProvider } from "./openai-compatible";

export const mimoProvider = createOpenAICompatibleProvider({
  id: "mimo",
  name: "小米 MiMo",
  defaultEndpoint: "https://api.mimo.xiaomi.com/v1",
  defaultModel: "MiMo-7B",
  requiresModelId: true,
});
