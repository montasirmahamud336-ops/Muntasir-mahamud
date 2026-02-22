import { optimizeImage } from "@/cms/media";
import {
  createSection,
  emptyPageContent,
  type CmsAdminUser,
  type CmsMedia,
  type CmsPage,
  type CmsPageInput,
  type CmsSetting,
  type CmsTestimonial,
  type CmsTestimonialInput,
  type CmsWork,
  type CmsWorkInput,
} from "@/cms/types";
import { slugify } from "@/cms/utils";

const CMS_BASE_URL = String(import.meta.env.VITE_CMS_BACKEND_URL || "http://localhost:4000").replace(/\/+$/, "");
const CMS_TOKEN_KEY = "cms_admin_token";

export const slugToPath = (slug: string) => (slug === "home" ? "/" : `/${slug}`);

type ApiErrorPayload = { error?: string; message?: string };

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(CMS_TOKEN_KEY);
};

const setToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem(CMS_TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(CMS_TOKEN_KEY);
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (!isObject(payload)) {
    return fallback;
  }
  if (typeof payload.error === "string" && payload.error) {
    return payload.error;
  }
  if (typeof payload.message === "string" && payload.message) {
    return payload.message;
  }
  return fallback;
};

const toError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }
  return new Error("Unknown request error.");
};

const encodePathSegment = (value: string) => encodeURIComponent(value);

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status})`;
    const message = extractErrorMessage(payload, fallback);
    throw new Error(message);
  }

  return payload as T;
};

const request = async <T>(
  path: string,
  options: RequestInit = {},
  authRequired = false,
): Promise<T> => {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (authRequired) {
    const token = getToken();
    if (!token) {
      throw new Error("Please log in to CMS.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${CMS_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("CMS backend is not reachable. Start local CMS server.");
  }

  return parseJsonResponse<T>(response);
};

const requestJson = async <T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body: unknown,
  authRequired = false,
) =>
  request<T>(
    path,
    {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    authRequired,
  );

const isNotFoundError = (error: unknown) => {
  const message = toError(error).message.toLowerCase();
  return message.includes("not found");
};

export async function getCurrentAdmin(): Promise<CmsAdminUser | null> {
  if (!getToken()) {
    return null;
  }

  try {
    return await request<CmsAdminUser>("/api/auth/me", {}, true);
  } catch {
    setToken(null);
    return null;
  }
}

export async function cmsAdminLogin(username: string, password: string) {
  const result = await requestJson<{ token: string; admin: CmsAdminUser }>(
    "/api/auth/login",
    "POST",
    { username, password },
    false,
  );

  if (!result.token || !result.admin) {
    throw new Error("Invalid admin credentials.");
  }

  setToken(result.token);
  return result.admin;
}

export async function cmsAdminLogout() {
  try {
    if (getToken()) {
      await request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }, true);
    }
  } finally {
    setToken(null);
  }
}

export async function ensureSystemPages() {
  await request<{ ok: boolean }>("/api/pages/ensure-system", { method: "POST" }, true);
}

export async function listPages(): Promise<CmsPage[]> {
  const pages = await request<CmsPage[]>("/api/pages", {}, true);
  return (pages || []).map((x) => ({
    ...x,
    content: x.content || emptyPageContent(),
  }));
}

export async function getPageById(id: string): Promise<CmsPage | null> {
  try {
    const page = await request<CmsPage>(`/api/pages/${encodePathSegment(id)}`, {}, true);
    return {
      ...page,
      content: page.content || emptyPageContent(),
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw toError(error);
  }
}

export async function getPublishedPageBySlug(slug: string): Promise<CmsPage | null> {
  const cleanSlug = slugify(slug);
  const page = await request<CmsPage | null>(
    `/api/public/pages/by-slug?slug=${encodeURIComponent(cleanSlug)}`,
    {},
    false,
  );

  if (!page) {
    return null;
  }

  return {
    ...page,
    content: page.content || emptyPageContent(),
  };
}

export async function getPublishedPageByTemplateKey(templateKey: string): Promise<CmsPage | null> {
  const clean = String(templateKey || "").trim();
  const page = await request<CmsPage | null>(
    `/api/public/pages/by-template?templateKey=${encodeURIComponent(clean)}`,
    {},
    false,
  );

  if (!page) {
    return null;
  }

  return {
    ...page,
    content: page.content || emptyPageContent(),
  };
}

export async function getAnyPageBySlug(slug: string): Promise<CmsPage | null> {
  const cleanSlug = slugify(slug);
  const pages = await listPages();
  return pages.find((page) => page.slug === cleanSlug) || null;
}

export async function createPage(input: CmsPageInput): Promise<CmsPage> {
  const payload = {
    title: input.title,
    slug: slugify(input.slug),
    seo_title: input.seo_title ?? null,
    meta_description: input.meta_description ?? null,
    status: input.status,
    page_type: input.page_type,
    template_key: input.template_key ?? null,
    use_builder: Boolean(input.use_builder),
    content: input.content ?? { sections: [createSection("Hero Section")] },
  };

  const page = await requestJson<CmsPage>("/api/pages", "POST", payload, true);
  return {
    ...page,
    content: page.content || emptyPageContent(),
  };
}

export async function updatePage(id: string, patch: Partial<CmsPageInput>): Promise<CmsPage> {
  const updates: Record<string, unknown> = {};
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.slug !== undefined) updates.slug = slugify(patch.slug);
  if (patch.seo_title !== undefined) updates.seo_title = patch.seo_title;
  if (patch.meta_description !== undefined) updates.meta_description = patch.meta_description;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.page_type !== undefined) updates.page_type = patch.page_type;
  if (patch.template_key !== undefined) updates.template_key = patch.template_key;
  if (patch.use_builder !== undefined) updates.use_builder = patch.use_builder;
  if (patch.content !== undefined) updates.content = patch.content;

  const page = await requestJson<CmsPage>(
    `/api/pages/${encodePathSegment(id)}`,
    "PUT",
    updates,
    true,
  );

  return {
    ...page,
    content: page.content || emptyPageContent(),
  };
}

export async function listTestimonials(includeDraft = true): Promise<CmsTestimonial[]> {
  if (!includeDraft) {
    return request<CmsTestimonial[]>("/api/public/testimonials", {}, false);
  }

  return request<CmsTestimonial[]>("/api/testimonials?includeDraft=1", {}, true);
}

export async function upsertTestimonial(input: CmsTestimonialInput, id?: string): Promise<CmsTestimonial> {
  const payload = {
    client_name: input.client_name,
    client_photo_media_id: input.client_photo_media_id ?? null,
    client_photo_url: input.client_photo_url ?? null,
    review_text: input.review_text,
    rating: input.rating,
    status: input.status,
  };

  if (!id) {
    return requestJson<CmsTestimonial>("/api/testimonials", "POST", payload, true);
  }

  return requestJson<CmsTestimonial>(
    `/api/testimonials/${encodePathSegment(id)}`,
    "PUT",
    payload,
    true,
  );
}

export async function softDeleteTestimonial(id: string): Promise<void> {
  await request<{ ok: boolean }>(
    `/api/testimonials/${encodePathSegment(id)}`,
    { method: "DELETE" },
    true,
  );
}

export async function listWorks(includeDraft = true): Promise<CmsWork[]> {
  if (!includeDraft) {
    return request<CmsWork[]>("/api/public/works", {}, false);
  }

  return request<CmsWork[]>("/api/works?includeDraft=1", {}, true);
}

export async function upsertWork(input: CmsWorkInput, id?: string): Promise<CmsWork> {
  const payload = {
    title: input.title,
    category: input.category,
    description: input.description,
    client: input.client ?? null,
    image_media_id: input.image_media_id ?? null,
    image_url: input.image_url ?? null,
    service_key: input.service_key ?? null,
    status: input.status,
  };

  if (!id) {
    return requestJson<CmsWork>("/api/works", "POST", payload, true);
  }

  return requestJson<CmsWork>(
    `/api/works/${encodePathSegment(id)}`,
    "PUT",
    payload,
    true,
  );
}

export async function softDeleteWork(id: string): Promise<void> {
  await request<{ ok: boolean }>(
    `/api/works/${encodePathSegment(id)}`,
    { method: "DELETE" },
    true,
  );
}

export async function listMedia(): Promise<CmsMedia[]> {
  return request<CmsMedia[]>("/api/media", {}, false);
}

export function getMediaPublicUrl(storagePath: string) {
  if (/^https?:\/\//i.test(storagePath)) {
    return storagePath;
  }
  const safePath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${CMS_BASE_URL}/uploads/${safePath}`;
}

export async function uploadMedia(file: File, altText?: string): Promise<CmsMedia> {
  const token = getToken();
  if (!token) {
    throw new Error("Please log in to CMS.");
  }

  const optimizedResult = await optimizeImage(file);
  const uploadFile = optimizedResult.file;

  const body = new FormData();
  body.append("file", uploadFile, file.name);
  if (altText) {
    body.append("alt_text", altText);
  }

  let response: Response;
  try {
    response = await fetch(`${CMS_BASE_URL}/api/media`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });
  } catch {
    throw new Error("CMS backend is not reachable. Start local CMS server.");
  }

  return parseJsonResponse<CmsMedia>(response);
}

export async function deleteMedia(id: string, _storagePath: string): Promise<void> {
  await request<{ ok: boolean }>(
    `/api/media/${encodePathSegment(id)}`,
    { method: "DELETE" },
    true,
  );
}

export async function listSettings(): Promise<CmsSetting[]> {
  return request<CmsSetting[]>("/api/settings", {}, true);
}

export async function upsertSetting(setting_key: string, setting_value: unknown): Promise<void> {
  await requestJson<{ ok: boolean }>(
    `/api/settings/${encodePathSegment(setting_key)}`,
    "PUT",
    { setting_value },
    true,
  );
}

export async function getDashboardStats() {
  return request<{ pages: number; testimonials: number; works: number; media: number }>("/api/stats", {}, true);
}
