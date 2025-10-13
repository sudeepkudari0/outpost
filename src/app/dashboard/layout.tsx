'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import type React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <SidebarInset>
          <div className="fixed top-0 right-0 p-3 flex items-center gap-3">
            <UserNav />
          </div>
          <main className="flex-1 overflow-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
