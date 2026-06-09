import React, { useState } from "react";
import { useAIAction } from "@/hooks/useAIAction";
import { useAIConfigStore } from "@/store/useAIConfigStore";

interface Suggestion {
  section: string;
  original: string;
  optimized: string;
  reason: string;
}

interface JdOptimizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeContent: string;
  onApplySuggestion?: (suggestion: Suggestion) => void;
}

const JdOptimizeDialog: React.FC<JdOptimizeDialogProps> = ({ isOpen, onClose, resumeContent, onApplySuggestion }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { selectedModel, getProviderConfig } = useAIConfigStore();
  const { execute, abort, isLoading, error } = useAIAction("/api/jd-optimize", {
    onComplete: (text) => {
      try {
        const data = JSON.parse(text);
        if (data.suggestions) setSuggestions(data.suggestions);
      } catch {
        // parse failed
      }
    },
  });

  const handleOptimize = () => {
    const config = getProviderConfig();
    setSuggestions([]);
    execute({
      apiKey: config.apiKey,
      model: config.modelId,
      modelType: selectedModel,
      apiEndpoint: config.endpoint,
      resume: resumeContent,
      jobDescription,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">针对 JD 优化简历</h2>

        {suggestions.length === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">粘贴目标职位描述 (JD)</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="粘贴完整的职位描述..."
                rows={8}
                className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                disabled={isLoading}
              />
            </div>

            {isLoading && (
              <div className="text-sm text-gray-500">
                正在分析中...
                <button onClick={abort} className="ml-2 text-red-500 hover:underline">取消</button>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">共 {suggestions.length} 条优化建议</p>
            {suggestions.map((s, i) => (
              <div key={i} className="border rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded">{s.section}</span>
                  {onApplySuggestion && (
                    <button
                      onClick={() => onApplySuggestion(s)}
                      className="text-xs text-primary hover:underline"
                    >
                      采纳
                    </button>
                  )}
                </div>
                <div className="text-sm">
                  <p className="text-gray-400 line-through">{s.original}</p>
                  <p className="text-gray-800 dark:text-gray-200 mt-1">{s.optimized}</p>
                </div>
                <p className="text-xs text-gray-500">{s.reason}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
            关闭
          </button>
          {suggestions.length === 0 && (
            <button
              onClick={handleOptimize}
              disabled={isLoading || !jobDescription.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "分析中..." : "开始分析"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JdOptimizeDialog;
