import { auth } from '@/auth';
import { ComparisonSection } from '@/components/landing-page/comparison-section';
import { FeaturesSection } from '@/components/landing-page/features-section';
import { FinalCTABanner } from '@/components/landing-page/final-cta-banner';
import { HeroSection } from '@/components/landing-page/hero-section';
import { HowItWorksSection } from '@/components/landing-page/how-it-works-section';
import { PricingSection } from '@/components/landing-page/pricing-section';
import { Footer } from '@/components/layout/footer';
import { LandingPageHeader } from '@/components/layout/header';
import { User } from 'next-auth';

export default async function HomePage() {
  const session = await auth();
  return (
    <main className="min-h-screen bg-background">
      <LandingPageHeader user={session?.user as User | null} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ComparisonSection />
      {/* <DemoSection /> */}
      <PricingSection />
      {/* <TestimonialsSection /> */}
      <FinalCTABanner />
      <Footer />
    </main>
  );
}
