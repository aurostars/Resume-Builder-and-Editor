import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import { ResumeData } from "@/types/resume";

function htmlToPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function createBulletParagraphs(html: string, fontSize: number): Paragraph[] {
  const text = htmlToPlainText(html);
  return text
    .split("\n")
    .filter((line) => line.trim())
    .map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line.replace(/^•\s*/, ""), size: fontSize })],
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
    );
}

export function generateDocx(resume: ResumeData, themeColor?: string): Document {
  const color = (themeColor || "#333333").replace("#", "");
  const sections: Paragraph[] = [];
  const baseFontSize = 22; // 11pt in half-points
  const headerFontSize = 28; // 14pt

  // Basic info / header
  const basic = resume.basic;
  if (basic?.name) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: basic.name, bold: true, size: 36, color })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }
  if (basic?.title) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: basic.title, size: 26, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  const contactParts: string[] = [];
  if (basic?.phone) contactParts.push(basic.phone);
  if (basic?.email) contactParts.push(basic.email);
  if (basic?.location) contactParts.push(basic.location);
  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join(" | "), size: baseFontSize, color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Separator
  sections.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color } },
      spacing: { after: 200 },
    })
  );

  // Helper: section heading
  const addSectionHeading = (title: string) => {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: headerFontSize, color })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color } },
      })
    );
  };

  // Process enabled sections in order
  const enabledSections = resume.menuSections
    ?.filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order) || [];

  for (const section of enabledSections) {
    switch (section.id) {
      case "basic":
        break; // already rendered above

      case "experience":
        if (resume.experience?.length) {
          addSectionHeading(section.title || "Work Experience");
          for (const exp of resume.experience) {
            if (!exp.visible) continue;
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: exp.company || "", bold: true, size: baseFontSize }),
                  new TextRun({ text: exp.position ? ` — ${exp.position}` : "", size: baseFontSize }),
                ],
                spacing: { before: 120, after: 40 },
              })
            );
            if (exp.date) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: exp.date, size: baseFontSize - 2, color: "999999", italics: true })],
                  spacing: { after: 80 },
                })
              );
            }
            if (exp.details) {
              sections.push(...createBulletParagraphs(exp.details, baseFontSize));
            }
          }
        }
        break;

      case "education":
        if (resume.education?.length) {
          addSectionHeading(section.title || "Education");
          for (const edu of resume.education) {
            if (!edu.visible) continue;
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: edu.school || "", bold: true, size: baseFontSize }),
                  new TextRun({ text: edu.major ? ` — ${edu.major}` : "", size: baseFontSize }),
                ],
                spacing: { before: 120, after: 40 },
              })
            );
            const dateParts: string[] = [];
            if (edu.degree) dateParts.push(edu.degree);
            const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(" - ");
            if (dateRange) dateParts.push(dateRange);
            if (dateParts.length > 0) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: dateParts.join(" | "), size: baseFontSize - 2, color: "999999", italics: true })],
                  spacing: { after: 80 },
                })
              );
            }
            if (edu.description) {
              sections.push(...createBulletParagraphs(edu.description, baseFontSize));
            }
          }
        }
        break;

      case "projects":
        if (resume.projects?.length) {
          addSectionHeading(section.title || "Projects");
          for (const proj of resume.projects) {
            if (!proj.visible) continue;
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: proj.name || "", bold: true, size: baseFontSize }),
                  new TextRun({ text: proj.role ? ` — ${proj.role}` : "", size: baseFontSize }),
                ],
                spacing: { before: 120, after: 40 },
              })
            );
            if (proj.date) {
              sections.push(
                new Paragraph({
                  children: [new TextRun({ text: proj.date, size: baseFontSize - 2, color: "999999", italics: true })],
                  spacing: { after: 80 },
                })
              );
            }
            if (proj.description) {
              sections.push(...createBulletParagraphs(proj.description, baseFontSize));
            }
          }
        }
        break;

      case "skills":
        if (resume.skillContent) {
          addSectionHeading(section.title || "Skills");
          sections.push(...createBulletParagraphs(resume.skillContent, baseFontSize));
        }
        break;

      case "selfEvaluation":
        if (resume.selfEvaluationContent) {
          addSectionHeading(section.title || "Summary");
          const text = htmlToPlainText(resume.selfEvaluationContent);
          sections.push(
            new Paragraph({
              children: [new TextRun({ text, size: baseFontSize })],
              spacing: { after: 120 },
            })
          );
        }
        break;

      default:
        // Custom sections
        if (resume.customData && section.id in resume.customData) {
          addSectionHeading(section.title || section.id);
          const items = resume.customData[section.id];
          if (Array.isArray(items)) {
            for (const item of items) {
              if (!item.visible) continue;
              if (item.title) {
                sections.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: item.title, bold: true, size: baseFontSize }),
                      new TextRun({ text: item.subtitle ? ` — ${item.subtitle}` : "", size: baseFontSize }),
                    ],
                    spacing: { before: 120, after: 40 },
                  })
                );
              }
              if (item.dateRange) {
                sections.push(
                  new Paragraph({
                    children: [new TextRun({ text: item.dateRange, size: baseFontSize - 2, color: "999999", italics: true })],
                    spacing: { after: 80 },
                  })
                );
              }
              if (item.description) {
                sections.push(...createBulletParagraphs(item.description, baseFontSize));
              }
            }
          }
        }
        break;
    }
  }

  return new Document({
    sections: [{ children: sections }],
  });
}

export async function exportResumeAsDocx({
  resume,
  title,
  themeColor,
  onStart,
  onEnd,
  successMessage,
  errorMessage,
}: {
  resume?: ResumeData | null;
  title?: string;
  themeColor?: string;
  onStart?: () => void;
  onEnd?: () => void;
  successMessage?: string;
  errorMessage?: string;
}) {
  const { toast } = await import("sonner");
  onStart?.();

  try {
    if (!resume) throw new Error("No active resume");

    const doc = generateDocx(resume, themeColor);
    const buffer = await Packer.toBlob(doc);

    const safeName = (title || resume.title || "resume")
      .trim()
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ") || "resume";

    const url = window.URL.createObjectURL(buffer);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeName}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);

    if (successMessage) toast.success(successMessage);
  } catch (error) {
    console.error("Word export error:", error);
    if (errorMessage) toast.error(errorMessage);
  } finally {
    onEnd?.();
  }
}
