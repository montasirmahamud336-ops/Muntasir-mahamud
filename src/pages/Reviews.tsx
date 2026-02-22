import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D } from "@/components/Card3D";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { getMediaPublicUrl, listMedia, listTestimonials } from "@/cms/api";
import { initialsFromName } from "@/cms/utils";
import type { CmsMedia, CmsTestimonial } from "@/cms/types";

interface DisplayTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  photoUrl?: string;
}

export default function Reviews() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CmsTestimonial[]>([]);
  const [media, setMedia] = useState<CmsMedia[]>([]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [publishedTestimonials, mediaLibrary] = await Promise.all([
          listTestimonials(false),
          listMedia(),
        ]);
        setItems(publishedTestimonials);
        setMedia(mediaLibrary);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load testimonials.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mediaMap = useMemo(() => new Map(media.map((item) => [item.id, item])), [media]);

  const testimonials: DisplayTestimonial[] = useMemo(
    () =>
      items.map((item, index) => {
        const mediaItem = item.client_photo_media_id ? mediaMap.get(item.client_photo_media_id) : null;
        const photoUrl = item.client_photo_url || (mediaItem ? getMediaPublicUrl(mediaItem.storage_path) : undefined);

        return {
          id: item.id,
          name: item.client_name,
          role: "Client",
          company: `Review #${index + 1}`,
          content: item.review_text,
          rating: item.rating,
          avatar: initialsFromName(item.client_name),
          photoUrl,
        };
      }),
    [items, mediaMap],
  );

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  useEffect(() => {
    if (currentSlide >= testimonials.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, testimonials.length]);

  const nextSlide = () => {
    if (testimonials.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    if (testimonials.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentSlide];

  return (
    <Layout>
      <section className="section pt-32">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block text-glow">Testimonials</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-3d">
              Client <span className="gradient-text">Reviews</span>
            </h1>
            <p className="section-subtitle mx-auto">
              Published testimonials managed from your CMS admin panel.
            </p>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-12" />

          {loading && <p className="text-center text-muted-foreground">Loading reviews...</p>}
          {error && <p className="text-center text-destructive">{error}</p>}

          {!loading && !error && testimonials.length === 0 && (
            <p className="text-center text-muted-foreground">No published reviews yet.</p>
          )}

          {!loading && !error && testimonials.length > 0 && (
            <>
              <AnimatedSection delay={0.2} className="mb-20">
                <div className="relative max-w-4xl mx-auto perspective">
                  <Card3D className="p-8 md:p-12">
                    <Quote className="absolute top-4 right-4 w-24 h-24 text-primary/10" />

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current.id}
                        initial={{ opacity: 0, x: 50, rotateY: -10 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -50, rotateY: 10 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          {current.photoUrl ? (
                            <img
                              src={current.photoUrl}
                              alt={current.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-primary/30"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg glow-sm">
                              {current.avatar}
                            </div>
                          )}
                          <div>
                            <h3 className="text-xl font-heading font-semibold">{current.name}</h3>
                            <p className="text-muted-foreground text-sm">
                              {current.role} at {current.company}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: current.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 fill-primary text-primary"
                              style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" }}
                            />
                          ))}
                        </div>

                        <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
                          "{current.content}"
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-8">
                      <div className="flex gap-2">
                        {testimonials.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setIsAutoPlaying(false);
                              setCurrentSlide(index);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              currentSlide === index
                                ? "w-8 bg-primary glow-sm"
                                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={prevSlide}
                          className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-primary/50 hover:glow-sm transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={nextSlide}
                          className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-primary/50 hover:glow-sm transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </Card3D>
                </div>
              </AnimatedSection>

              <GlowDivider className="max-w-4xl mx-auto mb-12" />

              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <StaggerItem key={testimonial.id}>
                    <div className="perspective h-full">
                      <Card3D className="h-full">
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                          ))}
                        </div>

                        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                          "{testimonial.content}"
                        </p>

                        <div className="flex items-center gap-3 mt-auto">
                          {testimonial.photoUrl ? (
                            <img
                              src={testimonial.photoUrl}
                              alt={testimonial.name}
                              className="w-10 h-10 rounded-xl object-cover border border-primary/30"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-medium text-sm">
                              {testimonial.avatar}
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-sm">{testimonial.name}</h4>
                            <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                          </div>
                        </div>
                      </Card3D>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
