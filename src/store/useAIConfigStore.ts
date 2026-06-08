import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProviderID, PROVIDERS } from "@/lib/ai/providers";

export interface ProviderSettings {
  apiKey: string;
  modelId: string;
  endpoint: string;
}

const createDefaultProviders = (): Record<ProviderID, ProviderSettings> => ({
  doubao: { apiKey: "", modelId: "", endpoint: "" },
  deepseek: { apiKey: "", modelId: "", endpoint: "" },
  openai: { apiKey: "", modelId: "", endpoint: "" },
  gemini: { apiKey: "", modelId: "gemini-flash-latest", endpoint: "" },
  claude: { apiKey: "", modelId: "claude-sonnet-4-20250514", endpoint: "" },
  qwen: { apiKey: "", modelId: "qwen-plus", endpoint: "" },
  zhipu: { apiKey: "", modelId: "glm-4-flash", endpoint: "" },
  mimo: { apiKey: "", modelId: "", endpoint: "" },
  custom: { apiKey: "", modelId: "", endpoint: "" },
});

interface AIConfigState {
  selectedModel: ProviderID;
  providers: Record<ProviderID, ProviderSettings>;
  setSelectedModel: (model: ProviderID) => void;
  setProviderField: (provider: ProviderID, field: keyof ProviderSettings, value: string) => void;
  getProviderConfig: (id?: ProviderID) => ProviderSettings;
  isConfigured: () => boolean;
  // Deprecated compat getters (remove after Task 8 updates all consumers)
  doubaoApiKey: string;
  doubaoModelId: string;
  deepseekApiKey: string;
  deepseekModelId: string;
  openaiApiKey: string;
  openaiModelId: string;
  openaiApiEndpoint: string;
  geminiApiKey: string;
  geminiModelId: string;
  // Deprecated compat setters (remove after Task 8 updates all consumers)
  setDoubaoApiKey: (v: string) => void;
  setDoubaoModelId: (v: string) => void;
  setDeepseekApiKey: (v: string) => void;
  setDeepseekModelId: (v: string) => void;
  setOpenaiApiKey: (v: string) => void;
  setOpenaiModelId: (v: string) => void;
  setOpenaiApiEndpoint: (v: string) => void;
  setGeminiApiKey: (v: string) => void;
  setGeminiModelId: (v: string) => void;
}

/** Compute deprecated flat fields from the providers record */
function computeCompatFields(providers: Record<ProviderID, ProviderSettings>) {
  return {
    doubaoApiKey: providers.doubao.apiKey,
    doubaoModelId: providers.doubao.modelId,
    deepseekApiKey: providers.deepseek.apiKey,
    deepseekModelId: providers.deepseek.modelId,
    openaiApiKey: providers.openai.apiKey,
    openaiModelId: providers.openai.modelId,
    openaiApiEndpoint: providers.openai.endpoint,
    geminiApiKey: providers.gemini.apiKey,
    geminiModelId: providers.gemini.modelId,
  };
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => {
      const defaultProviders = createDefaultProviders();

      const setProviderField = (provider: ProviderID, field: keyof ProviderSettings, value: string) =>
        set((state) => {
          const newProviders = {
            ...state.providers,
            [provider]: { ...state.providers[provider], [field]: value },
          };
          return {
            providers: newProviders,
            ...computeCompatFields(newProviders),
          };
        });

      return {
        selectedModel: "deepseek" as ProviderID,
        providers: defaultProviders,

        // Compat fields — initialized from defaults
        ...computeCompatFields(defaultProviders),

        setSelectedModel: (model: ProviderID) => set({ selectedModel: model }),

        setProviderField,

        getProviderConfig: (id?: ProviderID) => {
          const state = get();
          const providerId = id || state.selectedModel;
          return state.providers[providerId];
        },

        isConfigured: () => {
          const state = get();
          const provider = PROVIDERS[state.selectedModel];
          const settings = state.providers[state.selectedModel];
          return provider.validate({
            apiKey: settings.apiKey,
            modelId: settings.modelId || undefined,
            endpoint: settings.endpoint || undefined,
          });
        },

        // Deprecated compat setters — delegate to setProviderField
        setDoubaoApiKey: (v: string) => setProviderField("doubao", "apiKey", v),
        setDoubaoModelId: (v: string) => setProviderField("doubao", "modelId", v),
        setDeepseekApiKey: (v: string) => setProviderField("deepseek", "apiKey", v),
        setDeepseekModelId: (v: string) => setProviderField("deepseek", "modelId", v),
        setOpenaiApiKey: (v: string) => setProviderField("openai", "apiKey", v),
        setOpenaiModelId: (v: string) => setProviderField("openai", "modelId", v),
        setOpenaiApiEndpoint: (v: string) => setProviderField("openai", "endpoint", v),
        setGeminiApiKey: (v: string) => setProviderField("gemini", "apiKey", v),
        setGeminiModelId: (v: string) => setProviderField("gemini", "modelId", v),
      };
    },
    {
      name: "ai-config-storage",
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0 || !persisted.providers) {
          // Migrate from flat fields to nested providers structure
          const providers = createDefaultProviders();
          if (persisted.doubaoApiKey) {
            providers.doubao = {
              apiKey: persisted.doubaoApiKey,
              modelId: persisted.doubaoModelId || "",
              endpoint: "",
            };
          }
          if (persisted.deepseekApiKey) {
            providers.deepseek = {
              apiKey: persisted.deepseekApiKey,
              modelId: persisted.deepseekModelId || "",
              endpoint: "",
            };
          }
          if (persisted.openaiApiKey) {
            providers.openai = {
              apiKey: persisted.openaiApiKey,
              modelId: persisted.openaiModelId || "",
              endpoint: persisted.openaiApiEndpoint || "",
            };
          }
          if (persisted.geminiApiKey) {
            providers.gemini = {
              apiKey: persisted.geminiApiKey,
              modelId: persisted.geminiModelId || "gemini-flash-latest",
              endpoint: "",
            };
          }
          return {
            selectedModel: persisted.selectedModel || "deepseek",
            providers,
            ...computeCompatFields(providers),
          };
        }
        return persisted;
      },
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        providers: state.providers,
      }),
    }
  )
);
