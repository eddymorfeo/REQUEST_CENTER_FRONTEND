"use client";

import * as React from "react";
import { ChevronDown, LogOut } from "lucide-react";

import { useAuth } from "@/hooks/auth/useAuth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

function getRoleLabel(role?: string) {
  const normalized = role?.toUpperCase();
  if (normalized === "ADMIN" || normalized === "ADMINISTRADOR") return "Administrador";
  if (normalized === "ANALYST" || normalized === "ANALISTA") return "Analista";
  if (normalized === "FISCAL") return "Fiscal";
  return role || "Usuario";
}

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    role?: string;
    avatar?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();

  const initials = React.useMemo(() => getInitials(user.name), [user.name]);
  const roleLabel = React.useMemo(() => getRoleLabel(user.role), [user.role]);
  const avatarSrc = user.avatar?.trim() ? user.avatar : undefined;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-14 rounded-xl px-2 text-slate-800 hover:bg-blue-50 hover:text-blue-700 data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Avatar className="size-9 rounded-full">
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={user.name} className="object-cover" /> : null}
                <AvatarFallback className="rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">{user.name}</span>
                <span className="truncate text-xs text-slate-500">{roleLabel}</span>
              </div>

              <ChevronDown className="ml-auto size-4 text-slate-500 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl p-2"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                <Avatar className="size-10 rounded-full">
                  {avatarSrc ? <AvatarImage src={avatarSrc} alt={user.name} className="object-cover" /> : null}
                  <AvatarFallback className="rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  {/* <span className="truncate text-xs text-muted-foreground">{roleLabel}</span> */}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 rounded-lg" onClick={logout}>
              <LogOut className="size-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
