import React, { useState } from "react";
import { useAIAction } from "@/hooks/useAIAction";
import { useAIConfigStore } from "@/store/useAIConfigStore";

interface TranslateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeJson: string;
  onTranslated: (data: any) => void;
}

const TranslateDialog: React.FC<TranslateDialogProps> = ({ isOpen, onClose, resumeJson, onTranslated }) => {
  const [targetLanguage, setTargetLanguage] = useState<"zh" | "en">("en");
  const { selectedModel, getProviderConfig } = useAIConfigStore();
  const { execute, abort, isLoading, error } = useAIAction("/api/translate", {
    onComplete: (text) => {
      try {
        const data = JSON.parse(text);
        onTranslated(data);
      } catch {
        // parse failed
      }
    },
  });

  const handleTranslate = () => {
    const config = getProviderConfig();
    execute({
      apiKey: config.apiKey,
      model: config.modelId,
      modelType: selectedModel,
      apiEndpoint: config.endpoint,
      resume: resumeJson,
      targetLanguage,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">翻译简历</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">目标语言</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as "zh" | "en")}
              className="w-full px-3 py-2 border rounded-md text-sm"
              disabled={isLoading}
            >
              <option value="en">English (英文)</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <p className="text-sm text-gray-500">
            翻译后将创建一份新的简历副本，不会覆盖原始内容。
          </p>

          {isLoading && (
            <div className="text-sm text-gray-500">
              正在翻译中...
              <button onClick={abort} className="ml-2 text-red-500 hover:underline">取消</button>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50" disabled={isLoading}>
            取消
          </button>
          <button
            onClick={handleTranslate}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "翻译中..." : "开始翻译"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslateDialog;
