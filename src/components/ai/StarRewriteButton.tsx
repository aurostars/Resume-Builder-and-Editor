import React, { useState } from "react";
import { useAIAction } from "@/hooks/useAIAction";
import { useAIConfigStore } from "@/store/useAIConfigStore";

interface StarRewriteButtonProps {
  content: string;
  context?: string;
  onApply: (newContent: string) => void;
}

const StarRewriteButton: React.FC<StarRewriteButtonProps> = ({ content, context, onApply }) => {
  const [showPreview, setShowPreview] = useState(false);
  const { selectedModel, getProviderConfig } = useAIConfigStore();
  const { execute, abort, isLoading, result, error } = useAIAction("/api/star-rewrite", {
    onComplete: () => setShowPreview(true),
  });

  const handleRewrite = () => {
    const config = getProviderConfig();
    execute({
      apiKey: config.apiKey,
      model: config.modelId,
      modelType: selectedModel,
      apiEndpoint: config.endpoint,
      content,
      context,
    });
  };

  const handleApply = () => {
    onApply(result);
    setShowPreview(false);
  };

  const handleCancel = () => {
    setShowPreview(false);
    abort();
  };

  return (
    <div className="inline-flex flex-col">
      <button
        onClick={handleRewrite}
        disabled={isLoading || !content.trim()}
        className="text-xs text-primary hover:underline disabled:opacity-50"
        title="使用 STAR 法则改写"
      >
        {isLoading ? "改写中..." : "STAR 改写"}
      </button>

      {showPreview && result && (
        <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 text-sm">
          <div className="mb-2 text-xs text-gray-500">STAR 改写预览：</div>
          <div dangerouslySetInnerHTML={{ __html: result }} className="prose prose-sm max-w-none" />
          <div className="flex gap-2 mt-2">
            <button onClick={handleApply} className="text-xs px-2 py-1 bg-primary text-white rounded">
              替换
            </button>
            <button onClick={handleCancel} className="text-xs px-2 py-1 border rounded">
              取消
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

export default StarRewriteButton;
