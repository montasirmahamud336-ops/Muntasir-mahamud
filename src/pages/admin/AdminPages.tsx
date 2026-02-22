import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, FilePlus2, Globe, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createPage, listPages, slugToPath, updatePage } from "@/cms/api";
import type { CmsPage, CmsPageInput, CmsStatus, CmsPageType } from "@/cms/types";
import { slugify } from "@/cms/utils";

interface PageForm {
  title: string;
  slug: string;
  seo_title: string;
  meta_description: string;
  status: CmsStatus;
  page_type: CmsPageType;
  template_key: string;
  use_builder: boolean;
}

const initialForm: PageForm = {
  title: "",
  slug: "",
  seo_title: "",
  meta_description: "",
  status: "draft",
  page_type: "custom",
  template_key: "",
  use_builder: true,
};

const pageToForm = (page: CmsPage): PageForm => ({
  title: page.title,
  slug: page.slug,
  seo_title: page.seo_title ?? "",
  meta_description: page.meta_description ?? "",
  status: page.status,
  page_type: page.page_type,
  template_key: page.template_key ?? "",
  use_builder: page.use_builder,
});

export default function AdminPages() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<PageForm>(initialForm);
  const [activeTab, setActiveTab] = useState<"all" | CmsStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPage = useMemo(() => pages.find((x) => x.id === selectedId) ?? null, [pages, selectedId]);

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pages.filter((page) => {
      const statusMatch = activeTab === "all" ? true : page.status === activeTab;
      if (!statusMatch) {
        return false;
      }
      if (!query) {
        return true;
      }
      return page.title.toLowerCase().includes(query) || page.slug.toLowerCase().includes(query);
    });
  }, [pages, activeTab, search]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listPages();
      setPages(data);

      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
        setForm(pageToForm(data[0]));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load pages.";
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
    setForm({
      ...initialForm,
      title: "New Page",
      slug: `new-page-${Date.now().toString().slice(-4)}`,
    });
  };

  const onSelect = (page: CmsPage) => {
    setSelectedId(page.id);
    setForm(pageToForm(page));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: CmsPageInput = {
        title: form.title,
        slug: slugify(form.slug),
        seo_title: form.seo_title || null,
        meta_description: form.meta_description || null,
        status: form.status,
        page_type: form.page_type,
        template_key: form.template_key || null,
        use_builder: form.use_builder,
      };

      let saved: CmsPage;
      if (selectedId) {
        saved = await updatePage(selectedId, payload);
      } else {
        saved = await createPage(payload);
      }

      const updated = await listPages();
      setPages(updated);
      setSelectedId(saved.id);
      setForm(pageToForm(saved));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save page.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading pages...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pages</h2>
          <p className="text-muted-foreground">Create, edit, and publish website pages.</p>
        </div>
        <Button type="button" onClick={onNew} className="gap-2">
          <FilePlus2 className="h-4 w-4" />
          New Page
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>All Pages</CardTitle>
              <CardDescription>Filter and select pages for editing.</CardDescription>
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
                placeholder="Search title or slug"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {filteredPages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelect(page)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  selectedId === page.id
                    ? "border-primary bg-primary/10"
                    : "border-border/70 bg-background/60 hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{page.title}</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                      page.status === "published"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-yellow-500/15 text-yellow-600"
                    }`}
                  >
                    {page.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">/{page.slug}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 capitalize">
                    {page.page_type === "system" ? <Archive className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                    {page.page_type}
                  </span>
                </div>
              </button>
            ))}
            {filteredPages.length === 0 && <p className="text-sm text-muted-foreground">No pages found.</p>}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>{selectedId ? "Edit Page" : "Create Page"}</CardTitle>
            <CardDescription>Configure page metadata, status, and rendering mode.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Page Title</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Page Slug (URL)</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">SEO Title</label>
                  <Input
                    value={form.seo_title}
                    onChange={(e) => setForm((prev) => ({ ...prev, seo_title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Page Status</label>
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

              <div>
                <label className="mb-1 block text-sm font-medium">Meta Description</label>
                <Textarea
                  rows={4}
                  value={form.meta_description}
                  onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Page Type</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.page_type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        page_type: e.target.value as CmsPageType,
                        use_builder: e.target.value === "custom" ? true : prev.use_builder,
                      }))
                    }
                  >
                    <option value="custom">Custom (Builder)</option>
                    <option value="system">System (Existing Page)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Template Key (for system pages)</label>
                  <Input
                    value={form.template_key}
                    onChange={(e) => setForm((prev) => ({ ...prev, template_key: e.target.value }))}
                    placeholder="home / about / services"
                    disabled={form.page_type !== "system"}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.use_builder}
                  onChange={(e) => setForm((prev) => ({ ...prev, use_builder: e.target.checked }))}
                />
                Use Page Builder content for this page
              </label>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Page"}
                </Button>

                {selectedPage && (
                  <Button type="button" asChild variant="outline">
                    <Link to={`/admin/page-builder/${selectedPage.id}`}>Open Builder</Link>
                  </Button>
                )}

                {selectedPage && (
                  <Button type="button" asChild variant="outline">
                    <Link to={slugToPath(selectedPage.slug)} target="_blank" rel="noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Open Live URL
                    </Link>
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
