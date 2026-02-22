import { FormEvent, useEffect, useMemo, useState } from "react";
import { Archive, Search, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { listMedia, listTestimonials, softDeleteTestimonial, upsertTestimonial, getMediaPublicUrl } from "@/cms/api";
import type { CmsMedia, CmsStatus, CmsTestimonial } from "@/cms/types";

interface TestimonialForm {
  client_name: string;
  client_photo_media_id: string;
  client_photo_url: string;
  review_text: string;
  rating: number;
  status: CmsStatus;
}

const initialForm: TestimonialForm = {
  client_name: "",
  client_photo_media_id: "",
  client_photo_url: "",
  review_text: "",
  rating: 5,
  status: "published",
};

const testimonialToForm = (item: CmsTestimonial): TestimonialForm => ({
  client_name: item.client_name,
  client_photo_media_id: item.client_photo_media_id ?? "",
  client_photo_url: item.client_photo_url ?? "",
  review_text: item.review_text,
  rating: item.rating,
  status: item.status,
});

export default function AdminTestimonials() {
  const [items, setItems] = useState<CmsTestimonial[]>([]);
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(initialForm);
  const [activeTab, setActiveTab] = useState<"all" | CmsStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => items.find((x) => x.id === selectedId) || null, [items, selectedId]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const statusMatch = activeTab === "all" ? true : item.status === activeTab;
      if (!statusMatch) return false;
      if (!query) return true;
      return (
        item.client_name.toLowerCase().includes(query) ||
        item.review_text.toLowerCase().includes(query)
      );
    });
  }, [items, activeTab, search]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [testimonials, mediaList] = await Promise.all([listTestimonials(true), listMedia()]);
      setItems(testimonials);
      setMedia(mediaList);

      if (!selectedId && testimonials.length > 0) {
        setSelectedId(testimonials[0].id);
        setForm(testimonialToForm(testimonials[0]));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load testimonials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNew = () => {
    setSelectedId(null);
    setForm(initialForm);
  };

  const onSelect = (item: CmsTestimonial) => {
    setSelectedId(item.id);
    setForm(testimonialToForm(item));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await upsertTestimonial(
        {
          client_name: form.client_name,
          client_photo_media_id: form.client_photo_media_id || null,
          client_photo_url: form.client_photo_url || null,
          review_text: form.review_text,
          rating: form.rating,
          status: form.status,
        },
        selectedId || undefined,
      );

      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save testimonial.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const onSoftDelete = async () => {
    if (!selectedId) return;

    setSaving(true);
    setError(null);

    try {
      await softDeleteTestimonial(selectedId);
      await load();
      setSelectedId(null);
      setForm(initialForm);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete testimonial.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading testimonials...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Testimonials</h2>
          <p className="text-muted-foreground">Manage review content shown on the live website.</p>
        </div>
        <Button type="button" onClick={onNew} className="gap-2">
          <Upload className="h-4 w-4" />
          New Review
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>Draft and published review entries.</CardDescription>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | CmsStatus)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  selectedId === item.id
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-background/60 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{item.client_name}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                      item.status === "published"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-yellow-500/15 text-yellow-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.review_text}</p>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-3.5 w-3.5 ${idx < item.rating ? "fill-current text-amber-500" : "text-muted-foreground/40"}`}
                    />
                  ))}
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && <p className="text-sm text-muted-foreground">No testimonials found.</p>}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>{selected ? "Edit Review" : "Create Review"}</CardTitle>
            <CardDescription>Published reviews appear immediately on live site.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Client Name</label>
                  <Input
                    value={form.client_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, client_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as CmsStatus }))}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Client Photo (Media Library)</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.client_photo_media_id}
                    onChange={(e) => {
                      const mediaId = e.target.value;
                      const mediaItem = media.find((item) => item.id === mediaId);
                      setForm((prev) => ({
                        ...prev,
                        client_photo_media_id: mediaId,
                        client_photo_url: mediaItem ? getMediaPublicUrl(mediaItem.storage_path) : prev.client_photo_url,
                      }));
                    }}
                  >
                    <option value="">No image</option>
                    {media.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.file_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Or direct photo URL</label>
                  <Input
                    value={form.client_photo_url}
                    onChange={(e) => setForm((prev) => ({ ...prev, client_photo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Rating (1-5)</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) || 1 }))}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Review Text</label>
                <Textarea
                  rows={6}
                  value={form.review_text}
                  onChange={(e) => setForm((prev) => ({ ...prev, review_text: e.target.value }))}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Review"}
                </Button>
                {selected && (
                  <Button type="button" variant="destructive" onClick={onSoftDelete} disabled={saving}>
                    Delete (Move to Draft)
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
