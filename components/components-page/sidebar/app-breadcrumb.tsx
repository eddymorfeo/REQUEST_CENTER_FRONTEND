"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function humanize(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const parts = (pathname ?? "/")
    .split("?")[0]
    .split("/")
    .filter(Boolean);

  if (parts.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {parts.map((p, idx) => {
          const isLast = idx === parts.length - 1;
          return (
            <React.Fragment key={`${p}-${idx}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{humanize(p)}</BreadcrumbPage>
                ) : (
                  <span className="text-muted-foreground">{humanize(p)}</span>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
