import { ComparisonSection } from '@/components/landing-page/comparison-section';
import { DemoSection } from '@/components/landing-page/demo-section';
import { FeaturesSection } from '@/components/landing-page/features-section';
import { FinalCTABanner } from '@/components/landing-page/final-cta-banner';
import { HeroSection } from '@/components/landing-page/hero-section';
import { HowItWorksSection } from '@/components/landing-page/how-it-works-section';
import { PricingSection } from '@/components/landing-page/pricing-section';
import { TestimonialsSection } from '@/components/landing-page/testimonials-section';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ComparisonSection />
      <DemoSection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTABanner />
      <Footer />
    </main>
  );
}
