import { ResumeTemplate } from "@/types/template";

export const creativeProConfig: ResumeTemplate = {
  id: "creative-pro",
  name: "设计师/创意岗",
  description: "适合设计师和创意岗位，突出作品集与视觉技能",
  thumbnail: "creativePro",
  layout: "creative-pro",
  colorScheme: {
    primary: "#B07BAC",
    secondary: "#6b7280",
    background: "#ffffff",
    text: "#1f2937",
  },
  spacing: {
    sectionGap: 24,
    itemGap: 16,
    contentPadding: 40,
  },
  basic: {
    layout: "left",
  },
  availableSections: ["education", "experience", "skills", "projects", "selfEvaluation", "certificates"],
};
