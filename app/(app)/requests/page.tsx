"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { buildLoginRedirectUrl, isLoggedIn } from "@/utils/guards/auth.guard";
import { RequestsPage } from "@/components/components-page/requests/requests-page";

export default function Requests() {

      const router = useRouter();

  React.useEffect(() => {
    if (!isLoggedIn()) {
      const nextPath = window.location.pathname + window.location.search;
      router.replace(buildLoginRedirectUrl(nextPath));
    }
  }, [router]);

  if (!isLoggedIn()) return null;

    return <RequestsPage />;
}