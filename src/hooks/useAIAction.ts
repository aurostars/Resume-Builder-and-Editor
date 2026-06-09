import { useState, useCallback, useRef } from "react";

interface UseAIActionOptions {
  onChunk?: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export function useAIAction(routePath: string, options?: UseAIActionOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (payload: Record<string, unknown>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setResult("");
    let fullText = "";

    try {
      const response = await fetch(routePath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error((errData as any).error?.message || `Request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setResult(fullText);
        options?.onChunk?.(chunk);
      }

      options?.onComplete?.(fullText);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err);
        options?.onError?.(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [routePath]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  return { execute, abort, isLoading, result, error };
}
