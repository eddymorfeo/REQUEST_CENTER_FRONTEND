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
  const { isLoading, statuses, types, priorities, requests, refresh } = useRequestsData();

  const { user } = useAuth();
  const isAdmin = user?.roleCode === "ADMIN" || user?.roleCode === "ADMINISTRADOR";

  if (isLoading) return <RequestsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Solicitudes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualiza todas las solicitudes registradas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} className="gap-2">
            <RefreshCw className="size-4" />
            Actualizar
          </Button>

          {isAdmin ? (
            <Button
              onClick={() => router.push("/requests/new")}
              className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="size-4" />
              Nueva solicitud
            </Button>
          ) : null}
        </div>
      </div>

      <RequestsListView
        statuses={statuses}
        types={types}
        priorities={priorities}
        requests={requests}
        onRequestDeleted={refresh}
      />
    </div>
  );
}
