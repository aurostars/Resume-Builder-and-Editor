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

  const themeColor = globalSettings?.themeColor || "#2C5F7C";

  if (!showTitle) return null;

  return (
    <div style={{ borderBottom: `1.5px solid ${themeColor}`, paddingBottom: "4px", marginBottom: "8px" }}>
      <h2 style={{
        fontSize: `${globalSettings?.headerSize || 16}px`,
        fontWeight: 600,
        color: themeColor,
        margin: 0,
      }}>
        {renderTitle}
      </h2>
    </div>
  );
};

export default SectionTitle;
