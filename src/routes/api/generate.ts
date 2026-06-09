import { createFileRoute } from "@tanstack/react-router";
import { getProvider, ProviderID } from "@/lib/ai/providers";
import { getGeneratePrompt } from "@/config/prompts";

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, modelType, apiEndpoint, targetPosition, experience, language } = body as {
            apiKey: string;
            model: string;
            modelType: string;
            apiEndpoint?: string;
            targetPosition: string;
            experience: string;
            language?: "zh" | "en";
          };

          const systemPrompt = getGeneratePrompt(language || "zh");
          const userContent = `目标岗位：${targetPosition}\n\n个人经历要点：\n${experience}`;

          const provider = getProvider(modelType as ProviderID);
          const stream = await provider.chat(
            [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
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
          console.error("Generate error:", error);
          return Response.json(
            { error: { message: error?.message || "Unknown error" } },
            { status: 500 }
          );
        }
      },
    },
  },
});
