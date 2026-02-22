import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AnimatedSection } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D } from "@/components/Card3D";
import {
  ExternalLink,
  Eye,
  Settings,
  Globe,
  Cpu,
  Palette,
  Video,
  BriefcaseBusiness,
} from "lucide-react";
import { getMediaPublicUrl, listMedia, listWorks } from "@/cms/api";
import type { CmsMedia, CmsWork } from "@/cms/types";

interface DisplayProject {
  id: string;
  title: string;
  category: string;
  description: string;
  client: string | null;
  serviceKey: string | null;
  imageUrl?: string;
}

const categoryLabelMap: Record<string, string> = {
  engineering: "Engineering",
  web: "Web Design",
  automation: "Automation Tools",
  graphics: "Graphics",
  video: "Video Editing",
  general: "General",
};

const categoryVisualMap: Record<string, { icon: typeof Settings; color: string }> = {
  engineering: { icon: Settings, color: "from-rose-600 to-red-500" },
  web: { icon: Globe, color: "from-red-700 to-orange-500" },
  automation: { icon: Cpu, color: "from-stone-700 to-zinc-600" },
  graphics: { icon: Palette, color: "from-amber-600 to-orange-500" },
  video: { icon: Video, color: "from-red-500 to-amber-500" },
  general: { icon: BriefcaseBusiness, color: "from-neutral-700 to-stone-600" },
};

const fallbackProjects: DisplayProject[] = [
  {
    id: "fallback-1",
    title: "Industrial P&ID Drawing",
    category: "engineering",
    description: "Complete piping and instrumentation diagram for a chemical processing plant.",
    client: "Rafsan Engineering",
    serviceKey: "autocad",
  },
  {
    id: "fallback-2",
    title: "Corporate Website",
    category: "web",
    description: "Modern responsive website for a consulting firm.",
    client: "NorthLine Consulting",
    serviceKey: "web",
  },
  {
    id: "fallback-3",
    title: "Automation Reporting Tool",
    category: "automation",
    description: "Python-based automation for data processing and reporting.",
    client: "DataGrid Labs",
    serviceKey: "automation",
  },
  {
    id: "fallback-4",
    title: "Brand Identity Package",
    category: "graphics",
    description: "Complete branding suite including logo and marketing materials.",
    client: "StudioArc",
    serviceKey: "graphics",
  },
  {
    id: "fallback-5",
    title: "Product Promo Video",
    category: "video",
    description: "Professional product showcase video with motion graphics.",
    client: "Pixel Bay",
    serviceKey: "video",
  },
];

const categoryToService: Record<string, string> = {
  engineering: "autocad",
  web: "web",
  automation: "automation",
  graphics: "graphics",
  video: "video",
  general: "web",
};

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [works, setWorks] = useState<CmsWork[]>([]);
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const [publishedWorks, mediaLibrary] = await Promise.all([listWorks(false), listMedia()]);
        setWorks(publishedWorks);
        setMedia(mediaLibrary);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load portfolio works.";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mediaMap = useMemo(() => new Map(media.map((item) => [item.id, item])), [media]);

  const allProjects = useMemo<DisplayProject[]>(() => {
    if (works.length === 0) {
      return fallbackProjects;
    }

    return works.map((item) => {
      const mediaItem = item.image_media_id ? mediaMap.get(item.image_media_id) : null;
      const imageUrl = item.image_url || (mediaItem ? getMediaPublicUrl(mediaItem.storage_path) : undefined);

      return {
        id: item.id,
        title: item.title,
        category: item.category || "general",
        description: item.description,
        client: item.client,
        serviceKey: item.service_key,
        imageUrl,
      };
    });
  }, [works, mediaMap]);

  const categories = useMemo(() => {
    const ordered = Array.from(new Set(allProjects.map((project) => project.category || "general")));
    return [
      { id: "all", name: "All Projects" },
      ...ordered.map((category) => ({
        id: category,
        name: categoryLabelMap[category] || category,
      })),
    ];
  }, [allProjects]);

  useEffect(() => {
    const exists = categories.some((category) => category.id === activeCategory);
    if (!exists) {
      setActiveCategory("all");
    }
  }, [activeCategory, categories]);

  const filteredProjects =
    activeCategory === "all"
      ? allProjects
      : allProjects.filter((project) => project.category === activeCategory);

  return (
    <Layout>
      <section className="section pt-32">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block text-glow">My Work</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-3d">
              Featured <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="section-subtitle mx-auto">
              Explore published portfolio works managed from your CMS admin panel.
            </p>
          </AnimatedSection>

          {error && (
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Live portfolio sync failed. Showing fallback projects.
            </p>
          )}

          <AnimatedSection delay={0.2} className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground glow"
                    : "glass hover:border-primary/50"
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-12" />

          {loading && <p className="mb-6 text-center text-muted-foreground">Loading portfolio works...</p>}

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const visual = categoryVisualMap[project.category] || categoryVisualMap.general;
                const Icon = visual.icon;

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="perspective"
                  >
                    <Card3D className="h-full">
                      <div
                        className={`w-full aspect-video rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group ${
                          project.imageUrl ? "bg-muted" : `bg-gradient-to-br ${visual.color}`
                        }`}
                      >
                        {project.imageUrl ? (
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <Icon className="w-16 h-16 text-white/30 group-hover:text-white/50 transition-all duration-300 group-hover:scale-110" />
                        )}

                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            type="button"
                            onClick={() => navigate(`/contact?subject=${encodeURIComponent(`Project Inquiry: ${project.title}`)}`)}
                            className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            type="button"
                            onClick={() =>
                              navigate(
                                `/get-started?service=${
                                  project.serviceKey || categoryToService[project.category] || "web"
                                }`,
                              )
                            }
                            className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xl font-heading font-semibold">{project.title}</h3>
                        <p className="text-muted-foreground text-sm">{project.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary capitalize glow-sm">
                            {categoryLabelMap[project.category] || project.category}
                          </span>
                          {project.client && (
                            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                              {project.client}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card3D>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {!loading && filteredProjects.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">No published work found in this category.</p>
          )}
        </div>
      </section>

      <GlowDivider className="max-w-4xl mx-auto" />

      <section className="section">
        <div className="container mx-auto">
          <AnimatedSection>
            <div className="perspective">
              <Card3D className="p-12 text-center">
                <h2 className="text-3xl font-heading font-bold mb-4 text-3d">Have a Project in Mind?</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  I'm always excited to work on new and challenging projects. Let's discuss how we can bring your
                  ideas to life.
                </p>
                <Link to="/contact">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="btn-primary inline-block">
                    Start a Project
                  </motion.button>
                </Link>
              </Card3D>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
