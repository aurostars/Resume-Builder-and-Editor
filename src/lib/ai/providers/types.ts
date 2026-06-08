export type ProviderID =
  | "doubao"
  | "deepseek"
  | "openai"
  | "gemini"
  | "claude"
  | "qwen"
  | "zhipu"
  | "mimo"
  | "custom";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderConfig {
  apiKey: string;
  modelId?: string;
  endpoint?: string;
}

export interface AIProvider {
  id: ProviderID;
  name: string;
  chat(messages: Message[], config: ProviderConfig): Promise<ReadableStream<Uint8Array>>;
  validate(config: ProviderConfig): boolean;
}
