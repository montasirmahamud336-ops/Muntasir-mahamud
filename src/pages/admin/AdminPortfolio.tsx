import { FormEvent, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getMediaPublicUrl, listMedia, listWorks, softDeleteWork, upsertWork } from "@/cms/api";
import type { CmsMedia, CmsStatus, CmsWork } from "@/cms/types";

interface WorkForm {
  title: string;
  category: string;
  description: string;
  client: string;
  image_media_id: string;
  image_url: string;
  service_key: string;
  status: CmsStatus;
}

const initialForm: WorkForm = {
  title: "",
  category: "web",
  description: "",
  client: "",
  image_media_id: "",
  image_url: "",
  service_key: "web",
  status: "published",
};

const workToForm = (item: CmsWork): WorkForm => ({
  title: item.title,
  category: item.category,
  description: item.description,
  client: item.client ?? "",
  image_media_id: item.image_media_id ?? "",
  image_url: item.image_url ?? "",
  service_key: item.service_key ?? "",
  status: item.status,
});

const categoryOptions = [
  { value: "engineering", label: "Engineering" },
  { value: "web", label: "Web Design" },
  { value: "automation", label: "Automation Tools" },
  { value: "graphics", label: "Graphics" },
  { value: "video", label: "Video Editing" },
  { value: "general", label: "General" },
];

const serviceOptions = [
  { value: "autocad", label: "AutoCAD" },
  { value: "web", label: "Web Development" },
  { value: "automation", label: "Automation" },
  { value: "graphics", label: "Graphic Design" },
  { value: "video", label: "Video Editing" },
  { value: "", label: "Not linked" },
];

export default function AdminPortfolio() {
  const [items, setItems] = useState<CmsWork[]>([]);
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkForm>(initialForm);
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
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [items, activeTab, search]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [works, mediaList] = await Promise.all([listWorks(true), listMedia()]);
      setItems(works);
      setMedia(mediaList);

      if (!selectedId && works.length > 0) {
        setSelectedId(works[0].id);
        setForm(workToForm(works[0]));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load portfolio works.";
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

  const onSelect = (item: CmsWork) => {
    setSelectedId(item.id);
    setForm(workToForm(item));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await upsertWork(
        {
          title: form.title,
          category: form.category,
          description: form.description,
          client: form.client || null,
          image_media_id: form.image_media_id || null,
          image_url: form.image_url || null,
          service_key: form.service_key || null,
          status: form.status,
        },
        selectedId || undefined,
      );

      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save work.";
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
      await softDeleteWork(selectedId);
      await load();
      setSelectedId(null);
      setForm(initialForm);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete work.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading portfolio works...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground">Manage live works shown on your portfolio page.</p>
        </div>
        <Button type="button" onClick={onNew} className="gap-2">
          <Upload className="h-4 w-4" />
          New Work
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>All Works</CardTitle>
              <CardDescription>Draft and published portfolio entries.</CardDescription>
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
                placeholder="Search works"
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
                  <p className="font-medium">{item.title}</p>
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
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-2 text-xs text-primary capitalize">{item.category}</p>
              </button>
            ))}
            {filteredItems.length === 0 && <p className="text-sm text-muted-foreground">No works found.</p>}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>{selected ? "Edit Work" : "Create Work"}</CardTitle>
            <CardDescription>Published works appear instantly on the portfolio page.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
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
                  <label className="mb-1 block text-sm font-medium">Category</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Service Link (Get Started)</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.service_key}
                    onChange={(e) => setForm((prev) => ({ ...prev, service_key: e.target.value }))}
                  >
                    {serviceOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Client (optional)</label>
                <Input
                  value={form.client}
                  onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Thumbnail (Media Library)</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.image_media_id}
                    onChange={(e) => {
                      const mediaId = e.target.value;
                      const mediaItem = media.find((item) => item.id === mediaId);
                      setForm((prev) => ({
                        ...prev,
                        image_media_id: mediaId,
                        image_url: mediaItem ? getMediaPublicUrl(mediaItem.storage_path) : prev.image_url,
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
                  <label className="mb-1 block text-sm font-medium">Or direct image URL</label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  <BriefcaseBusiness className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Work"}
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
