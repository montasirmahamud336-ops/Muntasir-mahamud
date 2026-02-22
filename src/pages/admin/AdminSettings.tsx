import { FormEvent, useEffect, useState } from "react";
import { Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { listSettings, upsertSetting } from "@/cms/api";

interface SettingsForm {
  public_site_name: string;
  public_default_seo_title: string;
  public_default_meta_description: string;
}

const defaults: SettingsForm = {
  public_site_name: "",
  public_default_seo_title: "",
  public_default_meta_description: "",
};

const parseSetting = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
};

export default function AdminSettings() {
  const [form, setForm] = useState<SettingsForm>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const settings = await listSettings();
        const map = new Map(settings.map((item) => [item.setting_key, item.setting_value]));

        setForm({
          public_site_name: parseSetting(map.get("public_site_name")),
          public_default_seo_title: parseSetting(map.get("public_default_seo_title")),
          public_default_meta_description: parseSetting(map.get("public_default_meta_description")),
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load settings.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await Promise.all([
        upsertSetting("public_site_name", form.public_site_name),
        upsertSetting("public_default_seo_title", form.public_default_seo_title),
        upsertSetting("public_default_meta_description", form.public_default_meta_description),
      ]);
      setMessage("Settings saved.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save settings.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Global site settings and default SEO values.</p>
      </div>

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Public site metadata loaded by CMS pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Site Name</label>
              <Input
                value={form.public_site_name}
                onChange={(e) => setForm((prev) => ({ ...prev, public_site_name: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Default SEO Title</label>
              <Input
                value={form.public_default_seo_title}
                onChange={(e) => setForm((prev) => ({ ...prev, public_default_seo_title: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Default Meta Description</label>
              <Textarea
                rows={4}
                value={form.public_default_meta_description}
                onChange={(e) => setForm((prev) => ({ ...prev, public_default_meta_description: e.target.value }))}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-emerald-600">{message}</p>}

            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Credentials are read from environment variables.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-start gap-3 text-sm text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 text-primary" />
          <p>
            Local CMS login uses <code>CMS_ADMIN_USERNAME</code> and <code>CMS_ADMIN_PASSWORD</code>. Update your
            <code> .env </code> and restart the CMS server to apply changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
