import { createOpenAICompatibleProvider } from "./openai-compatible";
import { ProviderConfig } from "./types";

const base = createOpenAICompatibleProvider({
  id: "openai",
  name: "OpenAI",
  defaultEndpoint: "",
  requiresModelId: true,
});

export const openaiProvider = {
  ...base,
  validate(config: ProviderConfig): boolean {
    return !!(config.apiKey && config.modelId && config.endpoint);
  },
};
