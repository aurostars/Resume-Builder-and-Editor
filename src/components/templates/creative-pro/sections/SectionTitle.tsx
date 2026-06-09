import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";

interface SectionTitleProps {
  type: string;
  title?: string;
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ type, title, globalSettings, showTitle = true }) => {
  const { activeResume } = useResumeStore();
  const templateContext = useTemplateContext();
  const menuSections = templateContext?.menuSections ?? activeResume?.menuSections ?? [];

  const renderTitle = React.useMemo(() => {
    if (type === "custom") return title;
    return menuSections.find((s) => s.id === type)?.title;
  }, [menuSections, type, title]);

  const themeColor = globalSettings?.themeColor || "#B07BAC";

  if (!showTitle) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
      <div style={{ width: "4px", height: "20px", backgroundColor: themeColor, flexShrink: 0 }} />
      <h2 style={{ fontSize: `${globalSettings?.headerSize || 16}px`, fontWeight: 600, color: themeColor, margin: 0 }}>
        {renderTitle}
      </h2>
    </div>
  );
};

export default SectionTitle;
