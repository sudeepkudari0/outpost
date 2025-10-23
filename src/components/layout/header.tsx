'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
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
