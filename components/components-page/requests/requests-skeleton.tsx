"use client";

export function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 rounded bg-muted animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}
