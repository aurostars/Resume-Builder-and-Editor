import { createFileRoute } from "@tanstack/react-router";
import { getProvider, ProviderID } from "@/lib/ai/providers";
import { getJdOptimizePrompt } from "@/config/prompts";

export const Route = createFileRoute("/api/jd-optimize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { apiKey, model, modelType, apiEndpoint, resume, jobDescription } = body as {
            apiKey: string;
            model: string;
            modelType: string;
            apiEndpoint?: string;
            resume: string;
            jobDescription: string;
          };

          const systemPrompt = getJdOptimizePrompt();
          const userContent = `## 当前简历内容\n\n${resume}\n\n## 目标职位描述（JD）\n\n${jobDescription}`;

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
          console.error("JD optimize error:", error);
          return Response.json(
            { error: { message: error?.message || "Unknown error" } },
            { status: 500 }
          );
        }
      },
    },
  },
});
