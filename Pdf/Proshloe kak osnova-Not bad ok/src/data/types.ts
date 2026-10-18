export type TemplateItem = {
  tpl: string;
  family: "nav" | "hero" | "statement" | "about" | "services" | "process" | "formats" | "projectCover" | "projectContent" | "gallery" | "contact" | "footer";
  group: "Каркас" | "Секции" | "Обложка проекта" | "Контент проекта" | "Галерея проекта";
  label: string;
  code: string;
  icon: string;
  kind: "static";
  single: boolean;
  desc: string;
  styleSystem: "default";
  html: string;
};

export type VariantMeta = {
  id: string;
  num: number;
  name: string;
  idea: string;
  dramaturgy: string;
  pages: number;
};
