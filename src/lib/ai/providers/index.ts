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
