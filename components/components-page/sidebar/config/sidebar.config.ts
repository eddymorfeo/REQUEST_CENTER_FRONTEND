import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  Settings2,
  SquareTerminal,
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
      title: "Solicitudes",
      url: "/requests",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Lista", url: "/requests?view=list" },
        { title: "Tablero", url: "/requests?view=board" },
      ],
    },
    // {
    //   title: "Modelos",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     { title: "Tipos de Solicitud", url: "/catalogs/request-types" },
    //     { title: "Prioridades", url: "/catalogs/priorities" },
    //     { title: "Estados", url: "/catalogs/status" },
    //   ],
    // },
    // {
    //   title: "Documentación",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     { title: "Introducción", url: "/docs" },
    //     { title: "Guía rápida", url: "/docs/get-started" },
    //   ],
    // },
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
