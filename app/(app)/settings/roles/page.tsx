"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { buildLoginRedirectUrl, isLoggedIn } from "@/utils/guards/auth.guard";
import { isAdmin } from "@/utils/guards/role.guard";
import RolesListView from "@/components/components-page/settings/roles/roles-list-view";

export default function RolesPage() {
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoggedIn()) {
      const nextPath = window.location.pathname + window.location.search;
      router.replace(buildLoginRedirectUrl(nextPath));
      return;
    }

    if (!isAdmin()) {
      router.replace("/dashboard");
      return;
    }
  }, [router]);

  if (!isLoggedIn() || !isAdmin()) return null;

  return <RolesListView />;
}