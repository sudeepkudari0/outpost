'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { client } from '@/lib/orpc/client';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
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
import { useEffect, useState } from 'react';

export function DashboardSidebar({
  navigation,
  role,
}: {
  navigation: SidebarNavSection[];
  role: 'ADMIN' | 'USER';
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
      {/* Quota Widget */}
      {role !== 'ADMIN' && (
        <SidebarFooter>
          <QuotaWidget />
        </SidebarFooter>
      )}
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

function QuotaWidget() {
  const { state } = useSidebar();
  const { data, isLoading } = useQuery({
    queryKey: ['quota', 'status'],
    queryFn: () => client.quota.status({}),
    staleTime: 30_000,
  });

  const isCollapsed = state === 'collapsed';

  // Detect BYOK from localStorage (client-only)
  const [hasBYOK, setHasBYOK] = useState(false);
  const [byokProvider, setByokProvider] = useState<'openai' | 'gemini' | null>(
    null
  );
  useEffect(() => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem('aiSettings')
          : null;
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const openaiKey = parsed?.openaiKey as string | undefined;
      const geminiKey = parsed?.geminiKey as string | undefined;
      const has = !!openaiKey || !!geminiKey;
      // Prefer showing OpenAI if both present
      const provider = openaiKey ? 'openai' : geminiKey ? 'gemini' : null;
      setHasBYOK(has);
      setByokProvider(has ? provider : null);
    } catch {}
  }, []);

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-3 bg-background/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">Usage</span>
        {!isCollapsed && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
            {data?.tier ?? '—'}
          </span>
        )}
      </div>

      {/* Profiles */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Profiles</span>
          <span className="tabular-nums">
            {isLoading
              ? '—'
              : data?.tier === 'ENTERPRISE'
                ? '∞'
                : `${data?.profiles?.used ?? 0}/${data?.profiles?.limit ?? 0}`}
          </span>
        </div>
        <Progress
          value={isLoading ? 0 : (data?.profiles.percentage ?? 0)}
          className="h-1.5"
        />
      </div>

      {/* Daily Posts */}
      <div className="space-y-1.5 mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Posts today</span>
          <span className="tabular-nums">
            {isLoading
              ? '—'
              : data?.tier === 'ENTERPRISE'
                ? '∞'
                : `${data?.posts?.daily?.used ?? 0}/${data?.posts?.daily?.limit ?? 0}`}
          </span>
        </div>
        <Progress
          value={isLoading ? 0 : (data?.posts.daily.percentage ?? 0)}
          className="h-1.5"
        />
      </div>

      {/* AI Usage */}
      <div className="space-y-1.5 mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AI units today</span>
          <span className="tabular-nums flex items-center gap-1">
            {isLoading
              ? '—'
              : data?.tier === 'ENTERPRISE'
                ? '∞'
                : hasBYOK
                  ? '∞'
                  : `${data?.ai?.daily?.used ?? 0}/${data?.ai?.daily?.limit ?? 0}`}
            {!isCollapsed && hasBYOK && (
              <Badge variant="secondary" className="h-4 text-[10px] px-1.5">
                Using your key{byokProvider ? ` · ${byokProvider}` : ''}
              </Badge>
            )}
          </span>
        </div>
        <Progress
          value={isLoading ? 0 : (data?.ai?.daily?.percentage ?? 0)}
          className="h-1.5"
        />
        {!isCollapsed &&
          !hasBYOK &&
          (() => {
            const aiDaily = data?.ai?.daily;
            const limit = aiDaily?.limit;
            const used = aiDaily?.used;
            const isFinitePlan = typeof limit === 'number' && limit !== -1;
            const isAtOrOverLimit =
              isFinitePlan && typeof used === 'number' && used >= limit;
            if (!isAtOrOverLimit) return null;
            return (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Daily AI limit reached
                </span>
                <a href="/dashboard/api-keys" className="no-underline">
                  <Badge className="h-4 text-[10px] px-1.5">
                    Use your own key
                  </Badge>
                </a>
              </div>
            );
          })()}
      </div>

      {!isCollapsed && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Need more? Upgrade for higher limits and advanced features.
        </p>
      )}
    </div>
  );
}
