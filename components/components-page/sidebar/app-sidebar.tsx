"use client";

import * as React from "react";
import { usersApi } from "@/api/users/users.api";
import { useAuth } from "@/hooks/auth/useAuth";
import { NavMain } from "@/components/components-page/sidebar/nav-main";
import { NavUser } from "@/components/components-page/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { buildSidebarConfigForUser } from "./config/sidebar.mapper";
import { isAdmin } from "@/utils/guards/role.guard";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [avatarSrc, setAvatarSrc] = React.useState("");

  React.useEffect(() => {
    let currentUrl: string | null = null;
    let cancelled = false;

    async function loadAvatar() {
      if (!user?.id || !user.profilePhotoUrl) {
        setAvatarSrc("");
        return;
      }

      try {
        const blob = await usersApi.downloadAvatar(user.id);
        if (cancelled) return;
        currentUrl = URL.createObjectURL(blob);
        setAvatarSrc(currentUrl);
      } catch {
        if (!cancelled) setAvatarSrc("");
      }
    }

    void loadAvatar();

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [user?.id, user?.profilePhotoUrl]);

  const sidebarUser = React.useMemo(
    () => ({
      name: user?.fullName ?? "Usuario",
      email: user?.email ?? "",
      role: user?.roleCode ?? "",
      avatar: avatarSrc,
    }),
    [avatarSrc, user?.fullName, user?.email, user?.roleCode]
  );

  const config = React.useMemo(() => buildSidebarConfigForUser(user), [user]);

  const navMain = React.useMemo(() => {
    const admin = isAdmin();
    return config.navMain.filter((item) => {
      if (item.url === "/settings") return admin;
      return true;
    });
  }, [config.navMain]);

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white" {...props}>
      <SidebarHeader className="px-4 pb-6 pt-5">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
            R
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-base font-semibold text-slate-950">Request Center</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-3">
        <NavUser user={sidebarUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
