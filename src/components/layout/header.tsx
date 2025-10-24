'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import Link from 'next/link';
import { UserNav } from '../user-nav';

export function LandingPageHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/postit-logo.png"
              alt="Social"
              width={1000}
              height={1000}
              className="w-[140px] h-[60px]"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 p-4 pl-0">
      <div className="flex items-center justify-between gap-2 rounded-2xl border bg-background/60 px-6 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 h-[60px]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
