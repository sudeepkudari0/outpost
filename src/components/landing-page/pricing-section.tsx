'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '1 brand account',
      '5 posts per month',
      'Bring your own AI key',
      'Basic scheduling',
      'Community support',
    ],
    highlighted: false,
  },
  {
    name: 'Creator',
    price: '$9',
    description: 'For growing creators',
    features: [
      '3 brand accounts',
      '100 posts per month',
      'Bring your own AI key',
      'Advanced scheduling',
      'Priority support',
      'Analytics dashboard',
    ],
    highlighted: true,
  },
  {
    name: 'Agency',
    price: '$29',
    description: 'For agencies & teams',
    features: [
      'Unlimited brands',
      'Unlimited posts',
      'Bring your own AI key',
      'Team collaboration',
      '24/7 support',
      'Advanced analytics',
      'Custom integrations',
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-blue-600">Simple, Transparent Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. Always free to start.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 ${
                plan.highlighted
                  ? 'scale-105 md:scale-110 border-primary/50 shadow-lg shadow-primary/20 hover:bg-white/15 hover:border-white/30'
                  : 'hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold text-blue-600">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>

                <Button
                  className={`w-full mb-8 rounded-full ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'border border-white/20 hover:bg-white/10 text-foreground'
                  }`}
                >
                  Get Started
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
