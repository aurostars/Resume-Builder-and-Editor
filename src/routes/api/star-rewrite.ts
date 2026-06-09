import { createFileRoute } from "@tanstack/react-router";
import { getProvider, ProviderID } from "@/lib/ai/providers";
import { getStarRewritePrompt } from "@/config/prompts";

export const Route = createFileRoute("/api/star-rewrite")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, modelType, apiEndpoint, content, context } = body as {
            apiKey: string;
            model: string;
            modelType: string;
            apiEndpoint?: string;
            content: string;
            context?: string;
          };

          const systemPrompt = getStarRewritePrompt();
          let userContent = content;
          if (context) {
            userContent = `岗位背景：${context}\n\n经历描述：\n${content}`;
          }

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
          console.error("STAR rewrite error:", error);
          return Response.json(
            { error: { message: error?.message || "Unknown error" } },
            { status: 500 }
          );
        }
      },
    },
  },
});
