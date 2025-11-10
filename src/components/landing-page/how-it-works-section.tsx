'use client';

import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Connect Your Accounts',
    description:
      'Link your Instagram, Twitter, LinkedIn, TikTok, and more in seconds.',
  },
  {
    number: '02',
    title: 'Add Your AI Key',
    description:
      'Bring your own API key from OpenAI, Claude, Gemini, or any provider.',
  },
  {
    number: '03',
    title: 'Generate & Schedule',
    description:
      'Let AI write your posts, preview them, and schedule for optimal times.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-blue-600">How It Works</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Get started in three simple steps.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {step.number}
                  </span>
                </div>
              </div>
              <div className="flex-1 pt-2">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden sm:flex flex-col items-center gap-2 ml-4">
                  <ArrowRight className="w-5 h-5 text-primary/50 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
