import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentAdmin } from "@/cms/api";
import type { CmsAdminUser } from "@/cms/types";

export function AdminGuard() {
  const [admin, setAdmin] = useState<CmsAdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const currentAdmin = await getCurrentAdmin();
        if (mounted) {
          setAdmin(currentAdmin);
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return <div className="min-h-screen grid place-items-center">Checking admin access...</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
