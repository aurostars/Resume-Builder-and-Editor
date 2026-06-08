import { AIProvider, Message, ProviderConfig } from "./types";
import { getGeminiModelInstance } from "@/lib/server/gemini";

export const geminiProvider: AIProvider = {
  id: "gemini",
  name: "Gemini",

  validate(config: ProviderConfig): boolean {
    return !!(config.apiKey && config.modelId);
  },

  async chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>> {
    const systemMessage = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";

    const modelInstance = getGeminiModelInstance({
      apiKey: config.apiKey,
      model: config.modelId || "gemini-flash-latest",
      systemInstruction: systemMessage?.content,
      generationConfig: { temperature: 0.4 },
    });

    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const result = await modelInstance.generateContentStream(lastUserMessage);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  },
};
