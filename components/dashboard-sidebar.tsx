"use client";

import React from "react";
import { usePathname } from "next/navigation";
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
} from "@/components/ui/sidebar";
import {
  Flame,
  FileText,
  Home,
  Key,
  LucideLink,
  Plus,
  Users,
  LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation: {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    description?: string;
  }[];
}[] = [
  {
    title: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Posts", href: "/dashboard/posts", icon: FileText },
      { name: "Connections", href: "/dashboard/connections", icon: LucideLink },
      { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
      { name: "Users", href: "/dashboard/users", icon: Users },
    ],
  },
  {
    title: "ACTIVE",
    items: [
      {
        name: "Create Post",
        href: "/dashboard/create-post",
        icon: Plus,
        description: "create and manage social posts",
      },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            {state === "collapsed" ? (
              <SidebarTrigger className="h-8 w-8" />
            ) : (
              <Flame className="h-4 w-4" />
            )}
            <span
              className={cn("font-semibold", state === "collapsed" && "hidden")}
            >
              Dashboard
            </span>
          </div>
          <SidebarTrigger
            className={cn("-mr-1", state === "collapsed" && "hidden")}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-medium text-yellow-600 uppercase tracking-wider">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <a href={item.href} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
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
