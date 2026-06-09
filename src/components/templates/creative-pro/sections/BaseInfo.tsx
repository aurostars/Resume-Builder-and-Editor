import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { cn, formatDateString } from "@/lib/utils";
import { BasicInfo, getBorderRadiusValue, GlobalSettings } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import SectionWrapper from "../../shared/SectionWrapper";
import { useTranslations, useLocale } from "@/i18n/compat/client";
import GithubContribution from "@/components/shared/GithubContribution";
import { getCustomFieldDisplayText, getCustomFieldHref, shouldShowCustomFieldLabelPrefix } from "@/lib/customField";

interface BaseInfoProps {
    basic: BasicInfo | undefined;
    globalSettings: GlobalSettings | undefined;
    template?: ResumeTemplate;
}

const BaseInfo = ({ basic = {} as BasicInfo, globalSettings, template }: BaseInfoProps) => {
    const t = useTranslations("workbench");
    const locale = useLocale();
    const useIconMode = globalSettings?.useIconMode ?? false;

    const getIcon = (iconName: string | undefined) => {
        const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType;
        return IconComponent ? <IconComponent className="h-4 w-4 shrink-0" /> : null;
    };

    const getOrderedFields = React.useMemo(() => {
        if (!basic.fieldOrder) {
            return [{ key: "email", value: basic.email, icon: basic.icons?.email || "Mail", label: "电子邮箱", visible: true, custom: false }]
                .filter((item) => Boolean(item.value && item.visible));
        }
        return basic.fieldOrder
            .filter((field) => field.visible !== false && field.key !== "name" && field.key !== "title")
            .map((field) => ({
                key: field.key, value: field.key === "birthDate" && basic[field.key] ? formatDateString(basic[field.key] as string, locale) : (basic[field.key] as string),
                icon: basic.icons?.[field.key] || "User", label: field.label, visible: field.visible, custom: field.custom,
            }))
            .filter((item) => Boolean(item.value));
    }, [basic]);

    const allFields = [
        ...getOrderedFields,
        ...(basic.customFields?.filter((field) => field.visible !== false && Boolean(getCustomFieldDisplayText(field))).map((field) => ({
            key: field.id, value: getCustomFieldDisplayText(field), icon: field.icon, label: field.label, visible: true, custom: true, displayLabel: field.displayLabel, href: getCustomFieldHref(field),
        })) || []),
    ];

    const nameField = basic.fieldOrder?.find((f) => f.key === "name") || { key: "name", label: "姓名", visible: true };
    const titleField = basic.fieldOrder?.find((f) => f.key === "title") || { key: "title", label: "职位", visible: true };

    const PhotoComponent = basic.photo && basic.photoConfig?.visible && (
        <motion.div layout="position" className="flex justify-center">
            <div style={{ width: `${basic.photoConfig?.width || 100}px`, height: `${basic.photoConfig?.height || 100}px`, borderRadius: getBorderRadiusValue(basic.photoConfig || { borderRadius: "none", customBorderRadius: 0 }), overflow: "hidden" }}>
                <img src={basic.photo} alt={`${basic.name}'s photo`} className="w-full h-full object-cover" />
            </div>
        </motion.div>
    );

    return (
        <SectionWrapper sectionId="basic">
            <div className="flex flex-col gap-4">
                {PhotoComponent}
                <div className="flex flex-col items-center text-center gap-2">
                    {nameField.visible !== false && basic[nameField.key] && (
                        <motion.h1 layout="position" className="font-bold text-white" style={{ fontSize: "24px" }}>{basic[nameField.key] as string}</motion.h1>
                    )}
                    {titleField.visible !== false && basic[titleField.key] && (
                        <motion.h2 layout="position" className="text-white/90" style={{ fontSize: "16px" }}>{basic[titleField.key] as string}</motion.h2>
                    )}
                </div>
                <motion.div layout="position" className="flex flex-col gap-2 text-white/80" style={{ fontSize: `${globalSettings?.baseFontSize || 14}px` }}>
                    {allFields.map((item) => {
                        const customFieldHref = item.custom && "href" in item && typeof item.href === "string" ? item.href : null;

                        return (
                        <motion.div key={item.key} className="flex items-start gap-2">
                            {useIconMode ? (
                                <>
                                    {getIcon(item.icon)}
                                    {item.key === "email" ? <a href={`mailto:${item.value}`} className="underline text-white/90 break-all">{item.value}</a> : customFieldHref ? <a href={customFieldHref} target="_blank" rel="noopener noreferrer" className="underline text-white/90 break-all">{item.value}</a> : <span className="break-all">{item.value}</span>}
                                </>
                            ) : (
                                <>
                                    {!item.custom && <span className="shrink-0">{t(`basicPanel.basicFields.${item.key}`)}:</span>}
                                    {item.custom && shouldShowCustomFieldLabelPrefix(item) && <span className="shrink-0">{item.label}:</span>}
                                    {customFieldHref ? <a href={customFieldHref} target="_blank" rel="noopener noreferrer" className="underline text-white/90 break-all" suppressHydrationWarning>{item.value}</a> : <span className="break-all" suppressHydrationWarning>{item.value}</span>}
                                </>
                            )}
                        </motion.div>
                    )})}
                </motion.div>
            </div>
            {basic.githubContributionsVisible && (
                <GithubContribution className="mt-4" githubKey={basic.githubKey} username={basic.githubUseName} />
            )}
        </SectionWrapper>
    );
};

export default BaseInfo;
