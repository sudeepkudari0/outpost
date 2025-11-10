'use client';

import { BarChart3, Brain, Lock, Smartphone, Users, Zap } from 'lucide-react';

const benefits = [
  {
    icon: Brain,
    title: 'AI-Powered Content',
    description:
      'Generate engaging captions and content ideas instantly with advanced AI, or bring your own API key for complete control.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Scheduling',
    description:
      'Schedule posts across all platforms in seconds. Optimize posting times with intelligent analytics.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Work seamlessly with your team. Assign tasks, approve content, and manage workflows in one place.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description:
      'Track performance across platforms with comprehensive dashboards. Understand what resonates with your audience.',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption and compliance standards. Your data is always protected and secure.',
  },
  {
    icon: Smartphone,
    title: 'Multi-Platform Support',
    description:
      'Manage Instagram, TikTok, LinkedIn, Twitter, and more from a single dashboard.',
  },
];

export function ComparisonSection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-blue-600">Why Choose PostPilot?</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Built for creators and teams who want to grow faster. Everything you
            need to manage, create, and analyze your social presence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-primary/20 group"
              >
                <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
