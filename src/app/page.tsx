import { HeroSection } from "@/components/landing/hero";
import {
  FeaturesSection,
  TransformationSlider,
  TestimonialsSection,
  PricingSection,
  FaqSection,
  NewsletterSection,
  FinalCtaSection,
} from "@/components/landing/sections";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: undefined,
  description:
    "EsiFit — Your Body. Your Data. Your Progress. Premium fitness dashboards, workouts, nutrition, and calm analytics.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TransformationSlider />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <NewsletterSection />
      <FinalCtaSection />
    </>
  );
}
