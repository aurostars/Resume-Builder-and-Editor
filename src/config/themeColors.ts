export interface ThemeColor {
  id: string;
  name: string;
  nameEn: string;
  value: string;
}

export interface ThemeColorGroup {
  id: string;
  name: string;
  nameEn: string;
  colors: ThemeColor[];
}

export const THEME_COLOR_GROUPS: ThemeColorGroup[] = [
  {
    id: "fresh",
    name: "清新雅致",
    nameEn: "Fresh & Elegant",
    colors: [
      { id: "fog-blue", name: "雾蓝", nameEn: "Fog Blue", value: "#5B7FA6" },
      { id: "lake-blue", name: "湖水蓝", nameEn: "Lake Blue", value: "#6B9DAD" },
      { id: "sky-blue", name: "天青", nameEn: "Sky Blue", value: "#8EA8C3" },
      { id: "gray-green", name: "灰绿", nameEn: "Gray Green", value: "#7C9885" },
      { id: "bamboo-green", name: "竹青", nameEn: "Bamboo Green", value: "#9CAFA2" },
    ],
  },
  {
    id: "romantic",
    name: "柔和浪漫",
    nameEn: "Soft & Romantic",
    colors: [
      { id: "wisteria", name: "紫藤", nameEn: "Wisteria", value: "#B07BAC" },
      { id: "rose-pink", name: "玫瑰粉", nameEn: "Rose Pink", value: "#C4878E" },
      { id: "almond", name: "杏仁", nameEn: "Almond", value: "#D4A574" },
      { id: "mint-cream", name: "薄荷奶绿", nameEn: "Mint Cream", value: "#A3C4BC" },
      { id: "lilac", name: "淡丁香", nameEn: "Lilac", value: "#C9B8D4" },
    ],
  },
  {
    id: "business",
    name: "沉稳商务",
    nameEn: "Business",
    colors: [
      { id: "deep-sea", name: "深海蓝", nameEn: "Deep Sea", value: "#2C5F7C" },
      { id: "dark-green", name: "墨绿", nameEn: "Dark Green", value: "#4A6741" },
      { id: "dark-purple", name: "暗紫", nameEn: "Dark Purple", value: "#6B4C6E" },
      { id: "dark-brown", name: "深棕", nameEn: "Dark Brown", value: "#8C5E3C" },
      { id: "graphite", name: "石墨灰", nameEn: "Graphite", value: "#4A5568" },
    ],
  },
];

export const ALL_PRESET_COLORS = THEME_COLOR_GROUPS.flatMap((g) => g.colors.map((c) => c.value));
