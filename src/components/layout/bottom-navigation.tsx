'use client';

import { getDashboardSidebarNavigation } from '@/config/sidebar-navigation';
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
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type IconName = 'Home' | 'FileText' | 'LucideLink' | 'Key' | 'Users' | 'Plus';

function Icon({ name, className }: { name: IconName; className?: string }) {
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

export function BottomNavigation() {
  const pathname = usePathname();
  const { data } = useSession();
  const role = (data?.user?.role as 'ADMIN' | 'USER' | undefined) ?? 'USER';

  const sections = getDashboardSidebarNavigation(role);
  const flatItems = sections.flatMap(s => s.items);

  const createPost = flatItems.find(i => i.href === '/dashboard/create-post');
  const navItems = flatItems.filter(i => i.href !== '/dashboard/create-post');

  // Show up to 4 items around the center FAB on small screens
  const items = navItems.slice(0, 4);

  if (items.length === 0) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg shadow-lg shadow-slate-900/5 dark:shadow-slate-900/20 md:hidden">
      <div className="relative mx-auto flex h-16 max-w-full items-center justify-between px-6">
        <div className="flex flex-1 items-center justify-start gap-6">
          {items.slice(0, 2).map(item => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  name={item.icon as IconName}
                  className={cn('h-5 w-5', isActive && 'text-foreground')}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium leading-tight',
                    isActive && 'text-foreground'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <Link
            href={createPost?.href ?? '/dashboard/create-post'}
            className="pointer-events-auto -translate-y-1/3 rounded-full bg-primary p-4 text-primary-foreground shadow-lg ring-1 ring-black/5"
            aria-label="Create post"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-6">
          {items.slice(2, 4).map(item => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  name={item.icon as IconName}
                  className={cn('h-5 w-5', isActive && 'text-foreground')}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium leading-tight',
                    isActive && 'text-foreground'
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
