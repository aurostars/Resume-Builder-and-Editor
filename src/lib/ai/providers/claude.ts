import { AIProvider, Message, ProviderConfig } from "./types";

export const claudeProvider: AIProvider = {
  id: "claude",
  name: "Claude (Anthropic)",

  validate(config: ProviderConfig): boolean {
    return !!(config.apiKey && config.modelId);
  },

  async chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>> {
    const endpoint = config.endpoint?.trim().replace(/\/+$/, "") || "https://api.anthropic.com";
    const url = `${endpoint}/v1/messages`;

    const systemMessage = messages.find((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model: config.modelId,
      max_tokens: 4096,
      stream: true,
      messages: nonSystemMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    if (systemMessage) {
      body.system = systemMessage.content;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Claude API error ${response.status}: ${text}`);
    }

    if (!response.body) {
      throw new Error("Claude API returned no body");
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
              const event = JSON.parse(payload);
              if (event.type === "content_block_delta" && event.delta?.text) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
              if (event.type === "message_stop") {
                controller.close();
                return;
              }
              if (event.type === "error") {
                controller.error(new Error(event.error?.message || "Claude stream error"));
                return;
              }
            } catch { /* skip malformed */ }
          }
        }
      },
    });
  },
};
