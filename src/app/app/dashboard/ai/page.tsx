import { useEffect, useState } from "react";
import { Check, ExternalLink, Sparkles } from "lucide-react";
import { useTranslations } from "@/i18n/compat/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeepSeekLogo from "@/components/ai/icon/IconDeepseek";
import IconDoubao from "@/components/ai/icon/IconDoubao";
import IconOpenAi from "@/components/ai/icon/IconOpenAi";
import IconClaude from "@/components/ai/icon/IconClaude";
import IconQwen from "@/components/ai/icon/IconQwen";
import IconZhipu from "@/components/ai/icon/IconZhipu";
import IconMimo from "@/components/ai/icon/IconMimo";
import IconCustom from "@/components/ai/icon/IconCustom";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { ProviderID } from "@/lib/ai/providers";
import { cn } from "@/lib/utils";

type FieldType = "apiKey" | "modelId" | "endpoint";

interface ModelMeta {
  id: ProviderID;
  icon: React.FC<{ className?: string }>;
  link: string;
  color: string;
  bgColor: string;
  fields: FieldType[];
}

const MODEL_META: ModelMeta[] = [
  {
    id: "deepseek",
    icon: DeepSeekLogo,
    link: "https://platform.deepseek.com",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/50",
    fields: ["apiKey", "modelId"],
  },
  {
    id: "doubao",
    icon: IconDoubao,
    link: "https://console.volcengine.com/ark",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    fields: ["apiKey", "modelId"],
  },
  {
    id: "openai",
    icon: IconOpenAi,
    link: "https://platform.openai.com/api-keys",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    fields: ["apiKey", "modelId", "endpoint"],
  },
  {
    id: "gemini",
    icon: Sparkles,
    link: "https://aistudio.google.com/app/apikey",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    fields: ["apiKey", "modelId"],
  },
  {
    id: "claude",
    icon: IconClaude,
    link: "https://console.anthropic.com/",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    fields: ["apiKey", "modelId", "endpoint"],
  },
  {
    id: "qwen",
    icon: IconQwen,
    link: "https://dashscope.console.aliyun.com/",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/50",
    fields: ["apiKey", "modelId"],
  },
  {
    id: "zhipu",
    icon: IconZhipu,
    link: "https://open.bigmodel.cn/",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    fields: ["apiKey", "modelId"],
  },
  {
    id: "mimo",
    icon: IconMimo,
    link: "https://dev.mi.com/",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/50",
    fields: ["apiKey", "modelId"],
  },
  {
    id: "custom",
    icon: IconCustom,
    link: "",
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/50",
    fields: ["apiKey", "modelId", "endpoint"],
  },
];

const AISettingsPage = () => {
  const { providers, selectedModel, setSelectedModel, setProviderField } =
    useAIConfigStore();
  const [currentModel, setCurrentModel] = useState<ProviderID>(selectedModel);

  const t = useTranslations();

  useEffect(() => {
    setCurrentModel(selectedModel);
  }, [selectedModel]);

  const handleFieldChange = (
    providerId: ProviderID,
    field: FieldType,
    value: string
  ) => {
    setProviderField(providerId, field, value);
  };

  const isProviderConfigured = (meta: ModelMeta): boolean => {
    const settings = providers[meta.id];
    if (!settings.apiKey) return false;
    // For providers that require modelId, check it too
    if (meta.fields.includes("modelId") && meta.id !== "deepseek") {
      if (!settings.modelId) return false;
    }
    // For providers with endpoint, require it for openai and custom
    if (
      meta.fields.includes("endpoint") &&
      (meta.id === "openai" || meta.id === "custom")
    ) {
      if (!settings.endpoint) return false;
    }
    return true;
  };

  const getFieldLabel = (modelId: ProviderID, field: FieldType): string => {
    if (field === "apiKey") {
      return t(`dashboard.settings.ai.${modelId}.apiKey`);
    }
    if (field === "modelId") {
      return t(`dashboard.settings.ai.${modelId}.modelId`);
    }
    if (field === "endpoint") {
      return t(`dashboard.settings.ai.${modelId}.apiEndpoint`);
    }
    return "";
  };

  return (
    <div className="mx-auto py-4 px-4">
      <div className="flex gap-8">
        <div className="w-64 space-y-6">
          <div className="flex flex-col space-y-1">
            {MODEL_META.map((meta) => {
              const Icon = meta.icon;
              const isChecked = selectedModel === meta.id;
              const isViewing = currentModel === meta.id;
              const configured = isProviderConfigured(meta);
              return (
                <div
                  key={meta.id}
                  onClick={() => {
                    setCurrentModel(meta.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left border",
                    "transition-all duration-200 cursor-pointer",
                    "hover:bg-primary/10 hover:border-primary/30",
                    isViewing
                      ? "bg-primary/10 border-primary/40"
                      : "border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0",
                      isViewing ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-start">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isViewing && "text-primary"
                      )}
                    >
                      {t(`dashboard.settings.ai.${meta.id}.title`)}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {configured
                        ? t("common.configured")
                        : t("common.notConfigured")}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Select ${t(`dashboard.settings.ai.${meta.id}.title`)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedModel(meta.id);
                      setCurrentModel(meta.id);
                    }}
                    className={cn(
                      "h-6 w-6 rounded-md flex items-center justify-center border transition-all",
                      "shrink-0",
                      isChecked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-transparent border-muted-foreground/40 text-transparent hover:border-primary/40"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          {MODEL_META.map(
            (meta) =>
              meta.id === currentModel && (
                <div key={meta.id} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <div className={cn("shrink-0", meta.color)}>
                        <meta.icon className="h-6 w-6" />
                      </div>
                      {t(`dashboard.settings.ai.${meta.id}.title`)}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      {t(`dashboard.settings.ai.${meta.id}.description`)}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {meta.fields.map((field) => (
                      <div key={field} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">
                            {getFieldLabel(meta.id, field)}
                          </Label>
                          {field === "apiKey" && meta.link && (
                            <a
                              href={meta.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              {t("dashboard.settings.ai.getApiKey")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <Input
                          value={providers[meta.id][field === "endpoint" ? "endpoint" : field]}
                          onChange={(e) =>
                            handleFieldChange(meta.id, field, e.target.value)
                          }
                          type={field === "apiKey" ? "password" : "text"}
                          placeholder={getFieldLabel(meta.id, field)}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};
export const runtime = "edge";

export default AISettingsPage;
