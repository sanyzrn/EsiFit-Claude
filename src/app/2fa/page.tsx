import { createMetadata } from "@/lib/seo";
import { TwoFactorForm } from "@/components/auth/password-and-2fa";

export const metadata = createMetadata({ title: "Two-factor authentication", path: "/2fa" });

export default function TwoFactorPage() {
  return <TwoFactorForm />;
}
