'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FinalCTABanner() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1a1a1a] text-white">
      <div className="max-w-4xl mx-auto">
        {/* Main CTA */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            Stop paying $99/month.
            <br />
            <span className="bg-[#ff6b35] px-3 inline-block rotate-[-1deg] transform mt-2">
              Start building.
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-[#ffe66d] dark:bg-yellow-500  text-[#1a1a1a] border-[3px] border-[#ffe66d] hover:bg-[#4ecdc4] font-mono text-lg px-8 py-6 font-bold"
              >
                Start Free (No CC Required)
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-400 font-mono">
            ✓ Free forever plan • ✓ Upgrade anytime • ✓ Cancel anytime
          </p>
        </div>
        {/* Built By Section */}
        <div className="bg-[#ff6b35] text-[#1a1a1a] p-6 text-center border-[3px] border-[#ff6b35]">
          <div className="font-black text-2xl mb-2">
            Built by Sudeep Kudari | Bengaluru, KA India
          </div>
          <div className="font-mono text-sm mb-3">
            Last deployed: 2 hours ago | v2.3.1
          </div>
          <div className="flex gap-4 justify-center text-sm font-mono">
            <a
              href="https://github.com/sudeepkudari0"
              target="_blank"
              className="underline hover:no-underline"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/sudeep-kudari"
              target="_blank"
              className="underline hover:no-underline"
            >
              LinkedIn
            </a>
            <a
              href="mailto:sudeepkudari0@gmail.com"
              target="_blank"
              className="underline hover:no-underline"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
