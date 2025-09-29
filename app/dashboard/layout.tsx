"use client";

import type React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ProfileSwitcher } from "@/components/profile-switcher";
import { ProfileProvider } from "@/components/profile-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProfileProvider>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <SidebarInset>
            <div className="fixed top-0 right-0 p-3">
              <ProfileSwitcher />
            </div>
            <main className="flex-1 overflow-auto">{children}</main>
          </SidebarInset>
        </div>
      </ProfileProvider>
    </SidebarProvider>
  );
}
