import React from "react";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import BaseInfo from "./sections/BaseInfo";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import ProjectSection from "./sections/ProjectSection";
import SkillSection from "./sections/SkillSection";
import SelfEvaluationSection from "./sections/SelfEvaluationSection";
import CustomSection from "./sections/CustomSection";
import SectionTitle from "./sections/SectionTitle";
import SectionWrapper from "../shared/SectionWrapper";
import CertificatesSection from "../shared/CertificatesSection";

interface CreativeProTemplateProps {
    data: ResumeData;
    template: ResumeTemplate;
}

const CreativeProTemplate: React.FC<CreativeProTemplateProps> = ({ data, template }) => {
    const { colorScheme } = template;
    const enabledSections = data.menuSections.filter((s) => s.enabled).sort((a, b) => a.order - b.order);

    // Split sections: left sidebar gets "basic" and "skills", right gets everything else
    const leftSections = enabledSections.filter(s => s.id === "basic" || s.id === "skills");
    const rightSections = enabledSections.filter(s => s.id !== "basic" && s.id !== "skills");

    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case "basic":
                return <BaseInfo basic={data.basic} globalSettings={data.globalSettings} template={template} />;
            case "experience":
                return <ExperienceSection experiences={data.experience} globalSettings={data.globalSettings} />;
            case "education":
                return <EducationSection education={data.education} globalSettings={data.globalSettings} />;
            case "skills":
                return <SkillSection skill={data.skillContent} globalSettings={data.globalSettings} />;
            case "projects":
                return <ProjectSection projects={data.projects} globalSettings={data.globalSettings} />;
            case "certificates":
                return (
                    <SectionWrapper sectionId="certificates" style={{ marginTop: `${data.globalSettings?.sectionSpacing || 12}px` }}>
                        <SectionTitle type="certificates" globalSettings={data.globalSettings} />
                        <CertificatesSection certificates={data.certificates} />
                    </SectionWrapper>
                );
            case "selfEvaluation":
                return <SelfEvaluationSection content={data.selfEvaluationContent} globalSettings={data.globalSettings} />;
            default:
                if (sectionId in data.customData) {
                    const sectionTitle = data.menuSections.find((s) => s.id === sectionId)?.title || sectionId;
                    return <CustomSection title={sectionTitle} sectionId={sectionId} items={data.customData[sectionId]} globalSettings={data.globalSettings} />;
                }
                return null;
        }
    };

    // Calculate tinted background color from primary (lighter version)
    const tintedBg = `${colorScheme.primary}15`; // 15 is ~8% opacity in hex

    return (
        <div
            className="flex w-full min-h-screen"
            style={{
                backgroundColor: colorScheme.background,
                color: colorScheme.text,
                fontFamily: "Inter, 'Noto Sans SC', sans-serif",
            }}
        >
            {/* Left Sidebar - 30% */}
            <div
                className="flex flex-col"
                style={{
                    width: "30%",
                    backgroundColor: colorScheme.primary,
                    padding: `${template.spacing?.contentPadding || 40}px`,
                    gap: `${template.spacing?.sectionGap || 24}px`,
                }}
            >
                {leftSections.map((section) => (
                    <div key={section.id}>{renderSection(section.id)}</div>
                ))}
            </div>

            {/* Right Main Area - 70% */}
            <div
                className="flex flex-col flex-1"
                style={{
                    padding: `${template.spacing?.contentPadding || 40}px`,
                    gap: `${template.spacing?.sectionGap || 24}px`,
                }}
            >
                {rightSections.map((section) => (
                    <div key={section.id}>{renderSection(section.id)}</div>
                ))}
            </div>
        </div>
    );
};

export default CreativeProTemplate;
