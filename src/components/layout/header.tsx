'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { User } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buttonVariants } from '../ui/button';
import { UserNav } from '../user-nav';

export function LandingPageHeader({ user }: { user: User | null }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="flex items-center font-bold text-3xl">
              <span className="text-[#2F527E]">Out</span>
              <span className="text-[#4DCDDB]">Post - AI</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function DashboardHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const rawTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'dashboard';

  const getTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return user.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard';
      case '/dashboard/connections':
        return 'Connections';
      case '/dashboard/create-post':
        return 'Create Post';
      case '/dashboard/posts':
        return 'Posts';
      case '/dashboard/settings':
        return 'Settings';
      case '/dashboard/api-keys':
        return 'API Key Management';
      case '/dashboard/team':
        return 'Team';
      default: {
        const t = rawTitle;
        return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
      }
    }
  };

  const getDescription = () => {
    switch (pathname) {
      case '/dashboard':
        return user.role === 'ADMIN' ? 'Platform Overview' : 'Dashboard';
      case '/dashboard/connections':
        return 'Manage your profiles and social integrations';
      case '/dashboard/create-post':
        return 'Create a new post';
      case '/dashboard/posts':
        return 'View and edit your scheduled and published content';
      case '/dashboard/settings':
        return 'Manage your account settings';
      case '/dashboard/api-keys':
        return 'Manage your AI provider keys and application API credentials';
      case '/dashboard/team':
        return 'Manage your team and invites';
      default:
        return 'Dashboard';
    }
  };
  return (
    <>
      {/* Mobile header - only UserNav on top left */}
      <header className="absolute top-0 right-2 z-30 p-2 md:hidden">
        <UserNav user={user} />
      </header>

      {/* Desktop header */}
      <header className="sticky top-0 z-20 p-4 pl-0 hidden md:block">
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-background/60 px-6 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{getTitle()}</h1>
            <span className="text-md text-muted-foreground">
              {getDescription()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </div>
      </header>
    </>
  );
}
