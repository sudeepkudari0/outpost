'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import type {
  SidebarIconName,
  SidebarNavSection,
} from '@/config/sidebar-navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  Flame,
  Home,
  Key,
  LucideLink,
  Plus,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export function DashboardSidebar({
  navigation,
}: {
  navigation: SidebarNavSection[];
}) {
  const pathname = usePathname();
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b border-sidebar-border">
        <div
          className={cn(
            'flex items-center justify-between p-2',
            state === 'collapsed' && 'p-0'
          )}
        >
          <div className="flex items-center gap-2">
            {state === 'collapsed' ? (
              <SidebarTrigger className="h-8 w-8" />
            ) : (
              <Flame className="h-4 w-4" />
            )}
            <span
              className={cn('font-semibold', state === 'collapsed' && 'hidden')}
            >
              Dashboard
            </span>
          </div>
          <SidebarTrigger
            className={cn('-mr-1', state === 'collapsed' && 'hidden')}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className={cn('p-2', state === 'collapsed' && 'p-0')}>
        {navigation.map(section => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-medium text-blue-600 uppercase tracking-wider">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(item => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <a href={item.href} className="flex items-center gap-2">
                        {renderIcon(item.icon)}
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

export default DashboardSidebar;

function renderIcon(name: SidebarIconName) {
  const className = 'h-4 w-4';
  switch (name) {
    case 'Home':
      return <Home className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'LucideLink':
      return <LucideLink className={className} />;
    case 'Key':
      return <Key className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Plus':
      return <Plus className={className} />;
    default:
      return <Flame className={className} />;
  }
}
