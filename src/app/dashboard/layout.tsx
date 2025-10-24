import { auth } from '@/auth';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
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
          <header className="sticky top-0 z-20 p-2">
            <div className="flex items-center justify-end gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <ThemeToggle />
              <UserNav />
            </div>
          </header>
          <div className="p-2 pb-20 md:pb-2">
            <div className="rounded-lg border bg-background/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <main className="flex-1 overflow-auto p-4">{children}</main>
            </div>
          </div>
          <BottomNavigation />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
