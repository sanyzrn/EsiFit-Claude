import { createMetadata } from "@/lib/seo";
import { VerifyEmailScreen } from "@/components/auth/verify-email";

export const metadata = createMetadata({ title: "Verify email", path: "/verify-email" });

export default function VerifyEmailPage() {
  return <VerifyEmailScreen />;
}
