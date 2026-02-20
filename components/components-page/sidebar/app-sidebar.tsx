"use client";

import * as React from "react";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const sidebarUser = React.useMemo(
    () => ({
      name: user?.fullName ?? "Usuario",
      email: user?.email ?? "",
      avatar: "",
    }),
    [user?.fullName, user?.email]
  );

  const config = React.useMemo(() => buildSidebarConfigForUser(user), [user]);

  return (
    <Sidebar collapsible="icon" {...props}>

      <SidebarContent>
        <NavMain items={config.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
