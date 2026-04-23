"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useRequestsData } from "@/hooks/requests/useRequestsData";
import { Button } from "@/components/ui/button";
import { PlusIcon, RefreshCw } from "lucide-react";

import { RequestsSkeleton } from "./requests-skeleton";
import { RequestsListView } from "./views/requests-list-view";
import { useAuth } from "@/hooks/auth/useAuth";

export function RequestsPage() {
  const router = useRouter();
  const { isLoading, statuses, requests, refresh } = useRequestsData();

  const { user } = useAuth();
  const isAdmin = user?.roleCode === "ADMIN";

  if (isLoading) return <RequestsSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Solicitudes</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza todas las solicitudes registradas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button
              variant="outline"
              onClick={() => router.push("/requests/new")}
              className="gap-2"
            >
              <PlusIcon className="size-4" />
              Crear Solicitud
            </Button>
          ) : null}

          <Button variant="outline" onClick={refresh} className="gap-2">
            <RefreshCw className="size-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <RequestsListView statuses={statuses} requests={requests} />
    </div>
  );
}