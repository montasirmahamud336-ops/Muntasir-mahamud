import { useEffect } from "react";

export function usePageSeo(title?: string | null, description?: string | null) {
  useEffect(() => {
    if (title && title.trim()) {
      document.title = title;
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
