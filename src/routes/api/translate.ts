import { createFileRoute } from "@tanstack/react-router";
import { getProvider, ProviderID } from "@/lib/ai/providers";
import { getTranslatePrompt } from "@/config/prompts";

export const Route = createFileRoute("/api/translate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, modelType, apiEndpoint, resume, targetLanguage } = body as {
            apiKey: string;
            model: string;
            modelType: string;
            apiEndpoint?: string;
            resume: string;
            targetLanguage: "zh" | "en";
          };

          const systemPrompt = getTranslatePrompt(targetLanguage);

          const provider = getProvider(modelType as ProviderID);
          const stream = await provider.chat(
            [
              { role: "system", content: systemPrompt },
              { role: "user", content: resume },
            ],
            { apiKey, modelId: model, endpoint: apiEndpoint }
          );

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (error: any) {
          console.error("Translate error:", error);
          return Response.json(
            { error: { message: error?.message || "Unknown error" } },
            { status: 500 }
          );
        }
      },
    },
  },
});
