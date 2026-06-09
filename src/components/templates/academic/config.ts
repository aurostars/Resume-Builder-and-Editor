import { ResumeTemplate } from "@/types/template";

export const academicConfig: ResumeTemplate = {
  id: "academic",
  name: "学术/科研",
  description: "适合学术研究人员，突出论文发表与科研项目",
  thumbnail: "academic",
  layout: "academic",
  colorScheme: {
    primary: "#2C5F7C",
    secondary: "#4b5563",
    background: "#ffffff",
    text: "#1f2937",
  },
  spacing: {
    sectionGap: 12,
    itemGap: 8,
    contentPadding: 32,
  },
  basic: {
    layout: "center",
  },
  availableSections: ["education", "experience", "skills", "projects", "selfEvaluation", "certificates"],
};
