import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Wrench,
  MessageSquareQuote,
  Image,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cmsAdminLogout } from "@/cms/api";

const links = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Pages", to: "/admin/pages", icon: FileText },
  { label: "Page Builder", to: "/admin/page-builder", icon: Wrench },
  { label: "Portfolio", to: "/admin/portfolio", icon: BriefcaseBusiness },
  { label: "Testimonials", to: "/admin/testimonials", icon: MessageSquareQuote },
  { label: "Media", to: "/admin/media", icon: Image },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

export function AdminShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeLabel = useMemo(() => {
    const current = links.find((item) =>
      item.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.to),
    );
    return current?.label ?? "Dashboard";
  }, [location.pathname]);

  const handleLogout = async () => {
    await cmsAdminLogout();
    navigate("/admin/login", { replace: true });
  };

  const renderNavLinks = (onClick?: () => void) => (
    <nav className="space-y-2">
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/admin"}
          onClick={onClick}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              isActive
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border/60 bg-card/70 p-6 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin CMS</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Website Control</h1>
          <p className="mt-1 text-xs text-muted-foreground">Custom management panel</p>
        </div>

        {renderNavLinks()}

        <div className="mt-auto space-y-2 border-t border-border/60 pt-5">
          <Button type="button" variant="outline" className="w-full justify-start" onClick={() => navigate("/")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Website
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Admin</p>
              <p className="text-sm font-semibold">{activeLabel}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {menuOpen && (
        <div className="border-b border-border/60 bg-card/90 p-4 backdrop-blur lg:hidden">
          {renderNavLinks(() => setMenuOpen(false))}
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setMenuOpen(false);
                navigate("/");
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Website
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setMenuOpen(false);
                void handleLogout();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 py-5 lg:ml-72 lg:px-8 lg:py-8">
        <main className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
