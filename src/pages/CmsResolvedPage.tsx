import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getPublishedPageBySlug, getPublishedPageByTemplateKey } from "@/cms/api";
import type { CmsPage } from "@/cms/types";
import { pathToSlug, slugToPath } from "@/cms/utils";
import { CmsBuilderPageRenderer } from "@/cms/public/CmsBuilderPageRenderer";
import { usePageSeo } from "@/cms/public/usePageSeo";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Reviews from "@/pages/Reviews";
import Contact from "@/pages/Contact";
import GetStarted from "@/pages/GetStarted";
import EngineeringDrawings from "@/pages/services/EngineeringDrawings";
import WebDevelopment from "@/pages/services/WebDevelopment";
import GraphicDesign from "@/pages/services/GraphicDesign";
import VideoEditing from "@/pages/services/VideoEditing";
import NotFound from "@/pages/NotFound";

const templates: Record<string, () => JSX.Element> = {
  home: () => <Home />,
  about: () => <About />,
  services: () => <Services />,
  portfolio: () => <Portfolio />,
  reviews: () => <Reviews />,
  contact: () => <Contact />,
  "get-started": () => <GetStarted />,
  "services-engineering-drawings": () => <EngineeringDrawings />,
  "services-web-development": () => <WebDevelopment />,
  "services-graphic-design": () => <GraphicDesign />,
  "services-video-editing": () => <VideoEditing />,
};

const legacySlugToTemplateKey: Record<string, string> = {
  home: "home",
  about: "about",
  services: "services",
  portfolio: "portfolio",
  reviews: "reviews",
  contact: "contact",
  "get-started": "get-started",
  "services/engineering-drawings": "services-engineering-drawings",
  "services/web-development": "services-web-development",
  "services/graphic-design": "services-graphic-design",
  "services/video-editing": "services-video-editing",
};

const pageCache = new Map<string, CmsPage | null>();

const resolveFallback = (slug: string) => {
  const direct = templates[slug];
  if (direct) {
    return direct;
  }

  const legacyKey = legacySlugToTemplateKey[slug];
  if (!legacyKey) {
    return null;
  }

  return templates[legacyKey] || null;
};

export default function CmsResolvedPage() {
  const location = useLocation();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLookupError, setHasLookupError] = useState(false);
  const [redirectSlug, setRedirectSlug] = useState<string | null>(null);

  const slug = pathToSlug(location.pathname);
  const fallbackTemplate = useMemo(() => resolveFallback(slug), [slug]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const cached = pageCache.get(slug);
      const shouldBlock = !fallbackTemplate && !pageCache.has(slug);

      if (mounted) {
        setHasLookupError(false);
        setRedirectSlug(null);
        setLoading(shouldBlock);
        setPage(cached ?? null);
      }

      try {
        const data = await getPublishedPageBySlug(slug);

        if (!mounted) {
          return;
        }

        pageCache.set(slug, data);
        setPage(data);

        if (!data && legacySlugToTemplateKey[slug]) {
          const movedPage = await getPublishedPageByTemplateKey(legacySlugToTemplateKey[slug]);
          if (movedPage && movedPage.slug !== slug) {
            setRedirectSlug(movedPage.slug);
          }
        }
      } catch {
        if (!mounted) {
          return;
        }

        setHasLookupError(true);
        if (!fallbackTemplate) {
          setPage(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [fallbackTemplate, slug]);

  usePageSeo(page?.seo_title || page?.title || null, page?.meta_description || null);

  if (redirectSlug) {
    return <Navigate to={slugToPath(redirectSlug)} replace />;
  }

  if (page) {
    if (page.page_type === "system" && !page.use_builder && page.template_key) {
      const Template = templates[page.template_key];
      if (Template) {
        return <Template />;
      }
    }

    return <CmsBuilderPageRenderer page={page} />;
  }

  if (fallbackTemplate) {
    const FallbackTemplate = fallbackTemplate;
    return <FallbackTemplate />;
  }

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading...</div>;
  }

  if (hasLookupError) {
    return <NotFound />;
  }

  return <NotFound />;
}
