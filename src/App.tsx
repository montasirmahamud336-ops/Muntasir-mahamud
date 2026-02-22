import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { SmoothScroll } from "@/components/SmoothScroll";
import { AdminGuard } from "@/cms/admin/AdminGuard";
import { AdminShell } from "@/cms/admin/AdminShell";
import CmsResolvedPage from "@/pages/CmsResolvedPage";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPages from "@/pages/admin/AdminPages";
import AdminPageBuilder from "@/pages/admin/AdminPageBuilder";
import AdminPortfolio from "@/pages/admin/AdminPortfolio";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminMedia from "@/pages/admin/AdminMedia";
import AdminSettings from "@/pages/admin/AdminSettings";
import Auth from "@/pages/Auth";
import Chat from "@/pages/Chat";

const queryClient = new QueryClient();

function CmsAliasRedirect() {
  const location = useLocation();
  const adminPath = location.pathname.replace(/^\/cms/, "/admin") || "/admin";
  return <Navigate to={`${adminPath}${location.search}${location.hash}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="mmm-portfolio-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SmoothScroll />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/chat" element={<Chat />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/cms/login" element={<Navigate to="/admin/login" replace />} />

              <Route element={<AdminGuard />}>
                <Route path="/admin" element={<AdminShell />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="page-builder" element={<AdminPageBuilder />} />
                  <Route path="page-builder/:pageId" element={<AdminPageBuilder />} />
                  <Route path="portfolio" element={<AdminPortfolio />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="media" element={<AdminMedia />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="/cms/*" element={<CmsAliasRedirect />} />
              </Route>

              <Route path="*" element={<CmsResolvedPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
