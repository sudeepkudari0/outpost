'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          <span className="text-blue-600">Schedule weeks of content</span>
          <br />
          <span className="text-foreground">in minutes, not hours.</span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Connect your social accounts, bring your own AI key, and let PostPilot
          handle the planning, writing, and scheduling. Manage multiple brands
          from one dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'default' }),
              'bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8'
            )}
          >
            Start Free <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 hover:bg-white/10 rounded-full px-8 bg-transparent"
          >
            <Play className="w-4 h-4 mr-2" /> Watch Demo
          </Button>
        </div>

        <div className="mt-16 relative">
          <Image
            src="/images/dashboard.png"
            alt="Hero Section"
            className="rounded-2xl"
            width={1000}
            height={1000}
          />
        </div>
      </div>
    </section>
  );
}
