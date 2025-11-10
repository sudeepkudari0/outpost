'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FinalCTABanner() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-5xl sm:text-6xl font-bold mb-6">
          <span className="text-blue-600">Generate. Schedule. Relax.</span>
        </h2>

        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Join thousands of creators and agencies already using PostPilot to
          automate their social media strategy.
        </p>

        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 text-lg"
        >
          Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="text-sm text-muted-foreground mt-6">
          No credit card required. Start free, upgrade anytime.
        </p>
      </div>
    </section>
  );
}
