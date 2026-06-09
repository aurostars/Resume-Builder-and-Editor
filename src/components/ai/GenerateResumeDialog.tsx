import React, { useState } from "react";
import { useAIAction } from "@/hooks/useAIAction";
import { useAIConfigStore } from "@/store/useAIConfigStore";

interface GenerateResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: any) => void;
}

const GenerateResumeDialog: React.FC<GenerateResumeDialogProps> = ({ isOpen, onClose, onGenerated }) => {
  const [targetPosition, setTargetPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [language, setLanguage] = useState<"zh" | "en">("zh");
  const { selectedModel, getProviderConfig } = useAIConfigStore();
  const { execute, abort, isLoading, result, error } = useAIAction("/api/generate", {
    onComplete: (text) => {
      try {
        const data = JSON.parse(text);
        onGenerated(data);
      } catch {
        // JSON parse failed - result might be partial
      }
    },
  });

  const handleGenerate = () => {
    const config = getProviderConfig();
    execute({
      apiKey: config.apiKey,
      model: config.modelId,
      modelType: selectedModel,
      apiEndpoint: config.endpoint,
      targetPosition,
      experience,
      language,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-semibold mb-4">AI 一键生成简历</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">目标岗位</label>
            <input
              type="text"
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
              placeholder="如：前端开发工程师"
              className="w-full px-3 py-2 border rounded-md text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">个人经历要点</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="简要描述你的工作经历、技能、教育背景等关键信息..."
              rows={6}
              className="w-full px-3 py-2 border rounded-md text-sm resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">语言</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "zh" | "en")}
              className="w-full px-3 py-2 border rounded-md text-sm"
              disabled={isLoading}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          {isLoading && (
            <div className="text-sm text-gray-500">
              正在生成中...
              <button onClick={abort} className="ml-2 text-red-500 hover:underline">取消</button>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !targetPosition.trim() || !experience.trim()}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? "生成中..." : "开始生成"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateResumeDialog;
