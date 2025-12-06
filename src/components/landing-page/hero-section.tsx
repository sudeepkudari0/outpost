'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Hero Badge */}
      <div className="inline-block mb-6 bg-[#ffe66d] dark:bg-yellow-500  px-4 py-2 border-2 border-[#1a1a1a] font-mono text-sm rotate-[-2deg] transform">
        BUILT BY ONE DEVELOPER IN 3 MONTHS
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
        Because{' '}
        <span className="inline-block bg-[#ff6b35] text-white px-3 rotate-[-1deg] transform">
          $99/month
        </span>
        <br />
        for scheduling is insane
      </h1>

      {/* Subtitle */}
      <div className="bg-white dark:bg-gray-900 p-4 border-l-4 border-[#4ecdc4] max-w-2xl mb-8 text-lg">
        💡 I got tired of paying for Buffer Pro. So I built this. Now 200+
        creators use it daily to schedule posts across 6 platforms with
        AI-powered content generation.
      </div>

      {/* Meta Stats */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 px-5 py-3 border-[3px] border-[#1a1a1a] font-mono text-sm">
          <strong className="block text-[#ff6b35] text-xl">$10/mo</strong>
          vs $99 for Hootsuite
        </div>
        <div className="bg-white dark:bg-gray-900 px-5 py-3 border-[3px] border-[#1a1a1a] font-mono text-sm">
          <strong className="block text-[#ff6b35] text-xl">Your AI Key</strong>
          OpenAI, Claude, Gemini
        </div>
        <div className="bg-white dark:bg-gray-900 px-5 py-3 border-[3px] border-[#1a1a1a] font-mono text-sm">
          <strong className="block text-[#ff6b35] text-xl">6 Platforms</strong>
          Instagram, X, LinkedIn...
        </div>
        <div className="bg-white dark:bg-gray-900 px-5 py-3 border-[3px] border-[#1a1a1a] font-mono text-sm">
          <strong className="block text-[#ff6b35] text-xl">Sub-200ms</strong>
          API response time
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/login">
          <Button
            size="lg"
            className="bg-[#1a1a1a] text-white border-[3px] border-[#1a1a1a] hover:bg-white hover:text-[#1a1a1a] font-mono text-lg px-8 py-6 transition-all"
          >
            Start Free (No CC Required)
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button
            size="lg"
            variant="outline"
            className="bg-white dark:bg-gray-900 text-[#1a1a1a] dark:text-white border-[3px] border-[#1a1a1a] font-mono text-lg px-8 py-6"
          >
            Read Build Story <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
