import { createMetadata } from "@/lib/seo";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = createMetadata({ title: "Sign up", path: "/signup" });

export default function SignupPage() {
  return <SignupForm />;
}
