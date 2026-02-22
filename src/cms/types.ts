export type CmsStatus = "draft" | "published";
export type CmsPageType = "system" | "custom";

export type CmsBlockType = "heading" | "paragraph" | "image" | "button" | "html";

export interface CmsHeadingBlockData {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: "left" | "center" | "right";
}

export interface CmsParagraphBlockData {
  html: string;
}

export interface CmsImageBlockData {
  mediaId?: string;
  src?: string;
  alt?: string;
  caption?: string;
}

export interface CmsButtonBlockData {
  text: string;
  link: string;
  variant?: "primary" | "outline";
  newTab?: boolean;
}

export interface CmsHtmlBlockData {
  html: string;
}

export interface CmsBlock {
  id: string;
  type: CmsBlockType;
  data:
    | CmsHeadingBlockData
    | CmsParagraphBlockData
    | CmsImageBlockData
    | CmsButtonBlockData
    | CmsHtmlBlockData;
}

export interface CmsColumn {
  id: string;
  width: number; // 1..12
  blocks: CmsBlock[];
}

export interface CmsRow {
  id: string;
  columns: CmsColumn[];
}

export interface CmsSection {
  id: string;
  name: string;
  rows: CmsRow[];
}

export interface CmsPageContent {
  sections: CmsSection[];
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  seo_title: string | null;
  meta_description: string | null;
  status: CmsStatus;
  page_type: CmsPageType;
  template_key: string | null;
  use_builder: boolean;
  content: CmsPageContent;
  created_at: string;
  updated_at: string;
}

export interface CmsPageInput {
  title: string;
  slug: string;
  seo_title?: string | null;
  meta_description?: string | null;
  status: CmsStatus;
  page_type: CmsPageType;
  template_key?: string | null;
  use_builder?: boolean;
  content?: CmsPageContent;
}

export interface CmsAdminUser {
  id: string;
  auth_user_id: string;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
}

export interface CmsMedia {
  id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
}

export interface CmsTestimonial {
  id: string;
  client_name: string;
  client_photo_media_id: string | null;
  client_photo_url: string | null;
  review_text: string;
  rating: number;
  status: CmsStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsTestimonialInput {
  client_name: string;
  client_photo_media_id?: string | null;
  client_photo_url?: string | null;
  review_text: string;
  rating: number;
  status: CmsStatus;
}

export interface CmsWork {
  id: string;
  title: string;
  category: string;
  description: string;
  client: string | null;
  image_media_id: string | null;
  image_url: string | null;
  service_key: string | null;
  status: CmsStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsWorkInput {
  title: string;
  category: string;
  description: string;
  client?: string | null;
  image_media_id?: string | null;
  image_url?: string | null;
  service_key?: string | null;
  status: CmsStatus;
}

export interface CmsSetting {
  id: string;
  setting_key: string;
  setting_value: unknown;
}

export const emptyPageContent = (): CmsPageContent => ({ sections: [] });

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const createBlock = (type: CmsBlockType): CmsBlock => {
  const base = { id: createId(), type } as CmsBlock;

  switch (type) {
    case "heading":
      return { ...base, data: { text: "New heading", level: 2, align: "left" } };
    case "paragraph":
      return { ...base, data: { html: "<p>Write your content...</p>" } };
    case "image":
      return { ...base, data: { src: "", alt: "" } };
    case "button":
      return { ...base, data: { text: "Click here", link: "/", variant: "primary", newTab: false } };
    case "html":
      return { ...base, data: { html: "<div>Custom HTML</div>" } };
    default:
      return { ...base, data: { html: "" } as CmsHtmlBlockData };
  }
};

export const createColumn = (width = 12): CmsColumn => ({
  id: createId(),
  width,
  blocks: [],
});

export const createRow = (): CmsRow => ({
  id: createId(),
  columns: [createColumn()],
});

export const createSection = (name = "New Section"): CmsSection => ({
  id: createId(),
  name,
  rows: [createRow()],
});
