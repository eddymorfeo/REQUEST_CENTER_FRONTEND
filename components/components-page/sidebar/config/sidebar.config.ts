import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  HomeIcon,
  Settings2,
  SquareTerminal,
  User2,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: Array<{ title: string; url: string }>;
};

export type SidebarConfig = {
  navMain: SidebarNavItem[];
};

export const sidebarConfig: SidebarConfig = {
  navMain: [

    {
      title: "Inicio",
      url: "/dashboard",
      icon: HomeIcon,
      isActive: true,
      items: [
        { title: "Dashboard", url: "/dashboard" },
      ],
    },

    {
      title: "Solicitudes",
      url: "/requests",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Lista", url: "/requests?view=list" },
        { title: "Tablero", url: "/requests?view=board" },
      ],
    },
    {
      title: "Administración",
      url: "/settings",
      icon: Settings2,
      isActive: true,
      items: [
        { title: "Usuarios", url: "/settings/users" },
        { title: "Prioridades", url: "/settings/priorities" },
        { title: "Estados", url: "/settings/status" },
        { title: "Grupos", url: "/settings/groups" },
      ],
    },
    {
      title: "Cuenta",
      url: "/account",
      icon: User2,
      isActive: true,
      items: [
        { title: "Mi cuenta", url: "/account" },
      ],
    },
    // {
    //   title: "Configuración",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     { title: "Usuarios", url: "/settings/users" },
    //     { title: "Roles", url: "/settings/roles" },
    //   ],
    // },
  ],
};
