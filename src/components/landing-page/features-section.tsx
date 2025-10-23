'use client';

import { Brain, Calendar, ImageIcon, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Post Generator',
    description:
      'Create engaging captions with your own AI key. Use OpenAI, Claude, Gemini, or any provider.',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduler',
    description:
      'Plan and post everywhere from one dashboard. Schedule weeks in advance with precision.',
  },
  {
    icon: ImageIcon,
    title: 'Post Previews',
    description:
      'See exactly how your post looks before publishing. Perfect every detail before going live.',
  },
  {
    icon: Zap,
    title: 'Multi-Brand Support',
    description:
      'Manage multiple brands or clients easily. Scale your social media presence effortlessly.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-blue-600">Powerful Features</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Everything you need to automate your social media strategy and save
            hours every week.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-primary/20 group p-8"
              >
                <div className="mb-4 inline-block p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
