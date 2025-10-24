import { auth } from '@/auth';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { DashboardHeader } from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getDashboardSidebarNavigation } from '@/config/sidebar-navigation';
import type React from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user?.role as 'ADMIN' | 'USER') ?? 'USER';
  const navigation = getDashboardSidebarNavigation(role);
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar navigation={navigation} />
        <SidebarInset>
          <DashboardHeader title="Dashboard" />
          <div className="p-2 pb-20 md:pb-2">
            <div className="rounded-2xl bg-background/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
          <BottomNavigation />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
