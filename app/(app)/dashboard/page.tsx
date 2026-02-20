"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { buildLoginRedirectUrl, isLoggedIn } from "@/utils/guards/auth.guard";

export default function DashboardPage() {

      const router = useRouter();

  React.useEffect(() => {
    if (!isLoggedIn()) {
      const nextPath = window.location.pathname + window.location.search;
      router.replace(buildLoginRedirectUrl(nextPath));
    }
  }, [router]);

  if (!isLoggedIn()) return null;

    return <div className="p-6">Dahsboard</div>;
}