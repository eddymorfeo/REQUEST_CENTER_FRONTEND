"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRequestsData } from "@/hooks/requests/useRequestsData";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusIcon, RefreshCw } from "lucide-react";

import { RequestsSkeleton } from "./requests-skeleton";
import { RequestsBoardView } from "./views/requests-board-view";
import { RequestsListView } from "./views/requests-list-view";
import { useAuth } from "@/hooks/auth/useAuth";

export function RequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = (searchParams.get("view") ?? "board") as "board" | "list";
  const { isLoading, statuses, requests, refresh } = useRequestsData();

  const { user } = useAuth();
  const isAdmin = user?.roleCode === "ADMIN";

  const setView = (next: "board" | "list") => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    router.push(url.pathname + url.search);
  };

  if (isLoading) return <RequestsSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Solicitudes</h1>
          <p className="text-sm text-muted-foreground">
            Visualiza todas las solicitudes agrupadas por estado.
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

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="board">Tablero</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <RequestsBoardView statuses={statuses} requests={requests} />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <RequestsListView statuses={statuses} requests={requests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}