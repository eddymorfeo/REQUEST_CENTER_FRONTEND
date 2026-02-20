import * as React from "react"
import { AppSidebar } from "@/components/components-page/sidebar/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppBreadcrumb } from "@/components/components-page/sidebar/app-breadcrumb"
import { Separator } from "@/components/ui/separator"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        {/* ✅ Barra superior tipo shadcn (colapsable + breadcrumb) */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AppBreadcrumb />
        </header>

        <main className="p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
