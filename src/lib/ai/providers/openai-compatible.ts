import { AIProvider, Message, ProviderConfig, ProviderID } from "./types";

interface OpenAICompatibleOptions {
  id: ProviderID;
  name: string;
  defaultEndpoint: string;
  defaultModel?: string;
  requiresModelId: boolean;
  headersFactory?: (apiKey: string) => Record<string, string>;
}

export function createOpenAICompatibleProvider(options: OpenAICompatibleOptions): AIProvider {
  const { id, name, defaultEndpoint, defaultModel, requiresModelId, headersFactory } = options;

  const getHeaders = headersFactory ?? ((apiKey: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }));

  return {
    id,
    name,
    validate(config: ProviderConfig): boolean {
      if (!config.apiKey) return false;
      if (requiresModelId && !config.modelId) return false;
      if (id === "custom" && !config.endpoint) return false;
      return true;
    },
    async chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>> {
      const endpoint = config.endpoint?.trim().replace(/\/+$/, "") || defaultEndpoint;
      const url = `${endpoint}/chat/completions`;
      const model = config.modelId || defaultModel || "";

      const response = await fetch(url, {
        method: "POST",
        headers: getHeaders(config.apiKey),
        body: JSON.stringify({ model, messages, stream: true }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Provider ${name} error ${response.status}: ${text}`);
      }

      if (!response.body) {
        throw new Error(`Provider ${name} returned no body`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      return new ReadableStream<Uint8Array>({
        async pull(controller) {
          let pending = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) { controller.close(); return; }
            pending += decoder.decode(value, { stream: true });
            const lines = pending.split(/\r?\n/);
            pending = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const data = JSON.parse(payload);
                if (data.error?.message) { controller.error(new Error(data.error.message)); return; }
                const content = data.choices?.[0]?.delta?.content;
                if (content) { controller.enqueue(encoder.encode(content)); }
              } catch { /* skip malformed */ }
            }
          }
        },
      });
    },
  };
}
