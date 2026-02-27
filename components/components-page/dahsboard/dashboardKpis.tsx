"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hoursToDhM } from "./dashboardFormat";
import type { OverviewData, ProcessTimeData } from "@/api/metrics/metrics.api";
import { CheckCircle2, ClipboardList, Inbox, Timer, TrendingDown, TrendingUp } from "lucide-react";

type OpenStats = {
  openTotalHours?: {
    min?: number;
    max?: number;
    avg?: number;
  };
};

type Props = {
  overview: OverviewData | null;
  process: ProcessTimeData | null;
  openStats: OpenStats | null;
};

function toNum(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function DashboardKpis({ overview, process, openStats }: Props) {
  if (!overview || !process) return null;

  const closed = {
    max: toNum(process.leadHours?.max),
    min: toNum(process.leadHours?.min),
    avg: toNum(process.leadHours?.avg),
  };

  const open = {
    max: toNum(openStats?.openTotalHours?.max),
    min: toNum(openStats?.openTotalHours?.min),
    avg: toNum(openStats?.openTotalHours?.avg),
  };

  return (
    <div className="grid gap-4 md:grid-cols-18">
      <Card className="md:col-span-3 bg-gray-50">  {/* bg-linear-to-r/srgb from-green-10 to-blue-50 transition-colors */}
        <CardHeader>
          <div className="flex items-center gap-2">
            <div>
              <ClipboardList/>
            </div>
            <div>
              <CardTitle className="text-sm">Total creadas</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {overview.kpis.createdInRange}
        </CardContent>
      </Card>

      <Card className="md:col-span-3 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div>
              <Inbox/>
            </div>
            <div>
              <CardTitle className="text-sm">Solicitudes activas</CardTitle>
            </div>
          </div>          
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-3xl font-semibold">{overview.kpis.backlogTotal}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div>
              <CheckCircle2/>
            </div>
            <div>
              <CardTitle className="text-sm">Solicitudes terminadas</CardTitle>
            </div>
          </div>          
        </CardHeader>
        <CardContent className="text-3xl font-semibold">
          {overview.kpis.closedInRange}
        </CardContent>
      </Card>

      <Card className="md:col-span-3 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div>
              <TrendingUp/>
            </div>
            <div>
              <CardTitle className="text-sm">Tiempo máximo</CardTitle>
            </div>
          </div>  
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Terminadas</span>
            <span className="font-semibold">{hoursToDhM(closed.max)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Abiertas</span>
            <span className="font-semibold">{hoursToDhM(open.max)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div>
              <TrendingDown/>
            </div>
            <div>
              <CardTitle className="text-sm">Tiempo mínimo</CardTitle>
            </div>
          </div> 
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Terminadas</span>
            <span className="font-semibold">{hoursToDhM(closed.min)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Abiertas</span>
            <span className="font-semibold">{hoursToDhM(open.min)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div>
              <Timer/>
            </div>
            <div>
              <CardTitle className="text-sm">Tiempo promedio</CardTitle>
            </div>
          </div> 
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Terminadas</span>
            <span className="font-semibold">{hoursToDhM(closed.avg)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Abiertas</span>
            <span className="font-semibold">{hoursToDhM(open.avg)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}