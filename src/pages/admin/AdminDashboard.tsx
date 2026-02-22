import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareQuote,
  PenSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ensureSystemPages, getDashboardStats, listPages, slugToPath } from "@/cms/api";
import type { CmsPage } from "@/cms/types";

const statMeta = [
  { key: "pages", label: "Total Pages", icon: FileText, tone: "text-blue-500" },
  { key: "works", label: "Portfolio Works", icon: BriefcaseBusiness, tone: "text-violet-500" },
  { key: "testimonials", label: "Testimonials", icon: MessageSquareQuote, tone: "text-emerald-500" },
  { key: "media", label: "Media Files", icon: ImageIcon, tone: "text-orange-500" },
] as const;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pages: 0, works: 0, testimonials: 0, media: 0 });
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        await ensureSystemPages();
        const [dashboardStats, pageList] = await Promise.all([getDashboardStats(), listPages()]);
        setStats({
          pages: Number(dashboardStats.pages || 0),
          works: Number(dashboardStats.works || 0),
          testimonials: Number(dashboardStats.testimonials || 0),
          media: Number(dashboardStats.media || 0),
        });
        setPages(pageList.slice(0, 6));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load dashboard.";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of pages, testimonials, and media assets.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statMeta.map((item) => (
          <Card key={item.key} className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : stats[item.key]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="border-border/60 bg-card/70 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Pages</CardTitle>
              <CardDescription>Latest page entries in CMS.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/pages">Manage Pages</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pages.map((page) => (
              <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/50 p-3">
                <div>
                  <p className="font-medium">{page.title}</p>
                  <p className="text-xs text-muted-foreground">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      page.status === "published"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-yellow-500/15 text-yellow-600"
                    }`}
                  >
                    {page.status}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link to={slugToPath(page.slug)} target="_blank" rel="noreferrer">
                      Open
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {!loading && pages.length === 0 && <p className="text-sm text-muted-foreground">No pages found.</p>}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70 lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common CMS tasks.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild className="justify-start">
              <Link to="/admin/pages">
                <PenSquare className="mr-2 h-4 w-4" />
                Create or Edit Page
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/portfolio">
                <BriefcaseBusiness className="mr-2 h-4 w-4" />
                Manage Portfolio
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/page-builder">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Open Page Builder
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/testimonials">
                <MessageSquareQuote className="mr-2 h-4 w-4" />
                Manage Testimonials
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/media">
                <ImageIcon className="mr-2 h-4 w-4" />
                Open Media Library
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
