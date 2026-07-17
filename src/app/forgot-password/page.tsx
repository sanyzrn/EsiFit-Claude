import { createMetadata } from "@/lib/seo";
import { ForgotPasswordFlow } from "@/components/auth/password-and-2fa";

export const metadata = createMetadata({ title: "Forgot password", path: "/forgot-password" });

export default function ForgotPasswordPage() {
  return <ForgotPasswordFlow />;
}
