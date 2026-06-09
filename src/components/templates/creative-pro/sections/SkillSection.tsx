import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";

interface SkillSectionProps {
    skill?: string;
    globalSettings?: GlobalSettings;
    showTitle?: boolean;
}

const SkillSection = ({ skill, globalSettings, showTitle = true }: SkillSectionProps) => {
    // Parse skill content to extract skill items with proficiency levels if present
    // For now, we'll render the rich text content as-is
    // In a real implementation, you might want to parse structured skill data

    return (
        <SectionWrapper sectionId="skills" style={{ marginTop: `${globalSettings?.sectionSpacing || 12}px` }}>
            <SectionTitle type="skills" globalSettings={globalSettings} showTitle={showTitle} />
            <motion.div style={{ marginTop: `${globalSettings?.paragraphSpacing}px` }}>
                <motion.div className="text-white/90" layout="position"
                    style={{ fontSize: `${globalSettings?.baseFontSize || 14}px`, lineHeight: globalSettings?.lineHeight || 1.6 }}
                    dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(skill) }}
                />
            </motion.div>
        </SectionWrapper>
    );
};

export default SkillSection;
