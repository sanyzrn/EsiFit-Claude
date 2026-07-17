import { createMetadata } from "@/lib/seo";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = createMetadata({ title: "Onboarding", path: "/onboarding" });

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
