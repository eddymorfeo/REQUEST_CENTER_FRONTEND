"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

function getPathFromUrl(url: string) {
  return url.split("?")[0] || url;
}

function isUrlActive(pathname: string, url: string) {
  const path = getPathFromUrl(url);
  if (path === "/dashboard") return pathname === "/dashboard";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="mb-3 h-auto px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Platform
      </SidebarGroupLabel>

      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const hasChildren = Boolean(item.items?.length);
          const isActive =
            isUrlActive(pathname, item.url) ||
            Boolean(item.items?.some((subItem) => isUrlActive(pathname, subItem.url)));

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive}
                    className={cn(
                      "h-10 rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors",
                      "hover:bg-blue-50 hover:text-blue-700",
                      "data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-none",
                      "[&>svg]:text-slate-500 data-[active=true]:[&>svg]:text-blue-600"
                    )}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    <span>{item.title}</span>
                    {hasChildren ? (
                      <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    ) : null}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {hasChildren ? (
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-5 mt-1 border-l border-slate-200 px-2 py-1">
                      {item.items?.map((subItem) => {
                        const isSubActive = isUrlActive(pathname, subItem.url);

                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubActive}
                              className={cn(
                                "h-9 rounded-lg px-3 text-sm font-medium text-slate-700",
                                "hover:bg-blue-50 hover:text-blue-700",
                                "data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:font-semibold"
                              )}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
