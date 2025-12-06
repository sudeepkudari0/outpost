'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individuals getting started',
    features: [
      '✓ Up to 2 profiles',
      '✓ 10 posts/day, 300 posts/month',
      '✓ Connect Facebook, Instagram, LinkedIn, X, Threads',
      '✓ Basic posting & scheduling',
    ],
    highlighted: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/month',
    description: 'For growing teams and creators',
    features: [
      '✓ Up to 10 profiles',
      '✓ 100 posts/day, 3000 posts/month',
      '✓ AI generations: 5/day, 150/month',
      '✓ Bulk upload & advanced scheduling',
      '✓ Analytics (basic) & priority support',
      '✓ Connect all supported platforms',
    ],
    highlighted: true,
    badge: 'MOST POPULAR',
    cta: 'Upgrade',
  },
  {
    name: 'Business',
    price: '$20',
    period: '/month',
    description: 'For agencies and larger teams',
    features: [
      '✓ Up to 50 profiles',
      '✓ 500 posts/day, 15000 posts/month',
      '✓ AI generations: 15/day, 450/month',
      '✓ Team collaboration & white labeling',
      '✓ Advanced analytics & custom branding',
      '✓ Connect all supported platforms',
    ],
    highlighted: false,
    cta: 'Upgrade',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced needs',
    features: [
      '✓ Unlimited profiles, posts, and accounts',
      '✓ Unlimited AI generations',
      '✓ Dedicated support & SLA guarantee',
      '✓ Custom integrations & advanced security',
      '✓ Audit logs and enterprise features',
    ],
    highlighted: false,
    cta: 'Contact Sales',
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f5f5f0] dark:bg-gray-950 border-t-4 border-[#1a1a1a]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Pricing That Makes Sense
          </h2>
          <div className="text-xl max-w-3xl">
            No surprise fees. No "contact sales" bullshit (except Enterprise,
            obviously). What you see is what you pay. 💸
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-900 border-[3px] border-[#1a1a1a] p-6 relative ${
                plan.highlighted ? 'ring-4 ring-[#ff6b35] scale-105' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff6b35] text-white px-3 py-1 text-xs font-mono font-bold border-[2px] border-[#1a1a1a]">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-[#1a1a1a] dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
              </div>

              <Link href="/login">
                <Button
                  className={`w-full mb-6 font-mono border-[2px] border-[#1a1a1a] ${
                    plan.highlighted
                      ? 'bg-[#1a1a1a] text-white hover:bg-[#ff6b35]'
                      : 'bg-white dark:bg-gray-900 text-[#1a1a1a] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="text-sm font-mono">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Money Back Note */}
        <div className="mt-12 bg-[#ffe66d] dark:bg-yellow-500  p-6 border-[3px] border-[#1a1a1a] max-w-2xl mx-auto text-center">
          <div className="font-black text-xl mb-2">💰 Money-Back Guarantee</div>
          <div className="font-mono text-sm">
            Try it for 30 days. Not happy? Email me and I'll refund you. No
            questions asked.
            <br />
            (Seriously, I'm too busy building features to argue about refunds.)
          </div>
        </div>
      </div>
    </section>
  );
}
