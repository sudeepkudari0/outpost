'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

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
        <div className="mb-6 inline-block">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-4 py-2">
            <p className="text-xs sm:text-sm font-medium text-blue-600">
              AI-Powered Social Media Automation
            </p>
          </div>
        </div>

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
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
          >
            Start Free <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 hover:bg-white/10 rounded-full px-8 bg-transparent"
          >
            <Play className="w-4 h-4 mr-2" /> Watch Demo
          </Button>
        </div>

        <div className="mt-16 relative">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-1">
            <div className="bg-gradient-to-b from-primary/20 to-secondary/10 rounded-xl p-8 sm:p-12 min-h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary/50 rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Dashboard Preview
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  );
}
