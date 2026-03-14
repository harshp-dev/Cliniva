import { LandingHeader } from "@/components/features/landing/landing-header";
import { HeroSection } from "@/components/features/landing/hero-section";
import { StatsSection } from "@/components/features/landing/stats-section";
import { BenefitsSection } from "@/components/features/landing/benefits-section";
import { FeaturesSection } from "@/components/features/landing/features-section";
import { PricingSection } from "@/components/features/landing/pricing-section";
import { TestimonialsSection } from "@/components/features/landing/testimonials-section";
import { BlogSection } from "@/components/features/landing/blog-section";
import { LandingFooter } from "@/components/features/landing/landing-footer";
import { FooterBottomSection } from "@/components/features/landing/footer-bottom-section";
import { ScrollAnimations } from "@/components/features/landing/scroll-animations";

export default function Home() {
  return (
    <>
      <ScrollAnimations />
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <BlogSection />
        <LandingFooter />
        <FooterBottomSection />
      </main>
    </>
  );
}
