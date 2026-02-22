import { useEffect, useMemo, useState } from "react";
import { Copy, ImagePlus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { deleteMedia, getMediaPublicUrl, listMedia, uploadMedia } from "@/cms/api";
import type { CmsMedia } from "@/cms/types";

export default function AdminMedia() {
  const [items, setItems] = useState<CmsMedia[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.file_name.toLowerCase().includes(query));
  }, [items, search]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listMedia();
      setItems(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load media.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      await uploadMedia(file, altText || undefined);
      setFile(null);
      setAltText("");
      setMessage("Media uploaded successfully.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: CmsMedia) => {
    const proceed = window.confirm(`Delete ${item.file_name}?`);
    if (!proceed) return;

    setError(null);
    setMessage(null);

    try {
      await deleteMedia(item.id, item.storage_path);
      setMessage("Media deleted.");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed.";
      setError(msg);
    }
  };

  if (loading) {
    return <p>Loading media...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
        <p className="text-muted-foreground">Upload once and reuse images across pages and testimonials.</p>
      </div>

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>Image optimization runs before upload.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
          <div className="space-y-3">
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <Input
              placeholder="Alt text (optional)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
          </div>
          <div className="md:col-start-3">
            <Button type="button" onClick={handleUpload} disabled={!file || uploading} className="w-full gap-2 md:w-auto">
              <ImagePlus className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>All Media</CardTitle>
            <CardDescription>{items.length} file(s) available</CardDescription>
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search files"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
          {message && <p className="mb-3 text-sm text-emerald-600">{message}</p>}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filtered.map((item) => {
              const url = getMediaPublicUrl(item.storage_path);
              return (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-border/70 bg-background/60">
                  <img src={url} alt={item.alt_text || item.file_name} className="h-44 w-full object-cover" />
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium" title={item.file_name}>
                      {item.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.width && item.height ? `${item.width}x${item.height}` : "Image file"}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => void navigator.clipboard.writeText(url)}
                      >
                        <Copy className="mr-1 h-3.5 w-3.5" />
                        URL
                      </Button>
                      <Button type="button" size="sm" variant="destructive" className="flex-1" onClick={() => void handleDelete(item)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No media found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
