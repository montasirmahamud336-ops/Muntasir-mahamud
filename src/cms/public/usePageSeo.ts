import { useEffect } from "react";

export function usePageSeo(title?: string | null, description?: string | null) {
  useEffect(() => {
    const siteName = "Muntasir Mahmud";
    const cleanTitle = String(title || "").trim();
    const normalized = cleanTitle.toLowerCase();

    if (!cleanTitle || normalized === "lovable app") {
      document.title = siteName;
    } else if (normalized === siteName.toLowerCase()) {
      document.title = siteName;
    } else {
      document.title = `${cleanTitle} | ${siteName}`;
    }

    if (description !== undefined && description !== null) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [description, title]);
}
