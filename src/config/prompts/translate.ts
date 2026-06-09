export function getTranslatePrompt(targetLanguage: "zh" | "en"): string {
  const langName = targetLanguage === "zh" ? "中文" : "English";
  return `你是一位专业的翻译人员，擅长简历和商务文档翻译。将提供的简历内容翻译为${langName}。

要求：
1. 保持专业术语的准确性
2. 符合目标语言的简历写作习惯和表达方式
3. 人名、公司名如有通用译名则翻译，否则保留原文
4. 保持 HTML 标签结构不变（<ul><li>等）
5. 技术术语保留英文原文（如 React、Python 等）
6. 输出必须是有效 JSON，与输入结构完全一致

将输入的 JSON 中所有文本字段翻译为${langName}，输出相同结构的 JSON。只输出 JSON，不要额外文字。`;
}
