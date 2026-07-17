"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, PasswordStrength, TextInput } from "@/components/ui/form";
import { OtpInput } from "@/components/ui/otp-input";
import { delay } from "@/stores/auth-store";

const requestSchema = z.object({ email: z.email("Enter a valid email") });
const resetSchema = z
  .object({
    password: z.string().min(8, "Password needs 8+ characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

export function ForgotPasswordFlow() {
  const [step, setStep] = useState<"request" | "check" | "reset" | "done">("request");
  const [email, setEmail] = useState("");

  const requestForm = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });
  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onRequest(values: z.infer<typeof requestSchema>) {
    await delay(700);
    setEmail(values.email);
    toast.success("If that email exists, a reset link is on the way.");
    setStep("check");
  }

  async function onReset(values: z.infer<typeof resetSchema>) {
    await delay(700);
    void values;
    toast.success("Password updated. You can sign in now.");
    setStep("done");
  }

  if (step === "request") {
    return (
      <AuthShell title="Reset password" subtitle="We'll email you a secure link." footer={<Link href="/login">Back to sign in</Link>}>
        <form className="space-y-4" onSubmit={requestForm.handleSubmit(onRequest)} noValidate>
          <FormField label="Email" htmlFor="email" error={requestForm.formState.errors.email?.message}>
            <TextInput id="email" type="email" {...requestForm.register("email")} />
          </FormField>
          <Button type="submit" className="w-full" loading={requestForm.formState.isSubmitting}>
            Send reset link
          </Button>
        </form>
      </AuthShell>
    );
  }

  if (step === "check") {
    return (
      <AuthShell title="Check your email" subtitle={`Instructions sent to ${email}.`}>
        <div className="space-y-3">
          <Button className="w-full" onClick={() => setStep("reset")}>
            I have a reset code
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep("request")}>
            Use a different email
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (step === "reset") {
    const password = resetForm.watch("password"); // eslint-disable-line react-hooks/incompatible-library -- RHF watch for strength meter
    return (
      <AuthShell title="Choose a new password" subtitle="Make it strong and unique.">
        <form className="space-y-4" onSubmit={resetForm.handleSubmit(onReset)} noValidate>
          <FormField label="New password" htmlFor="password" error={resetForm.formState.errors.password?.message}>
            <TextInput id="password" type="password" {...resetForm.register("password")} />
            <PasswordStrength password={password || ""} />
          </FormField>
          <FormField label="Confirm" htmlFor="confirm" error={resetForm.formState.errors.confirm?.message}>
            <TextInput id="confirm" type="password" {...resetForm.register("confirm")} />
          </FormField>
          <Button type="submit" className="w-full" loading={resetForm.formState.isSubmitting}>
            Update password
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="You're set" subtitle="Your password has been updated.">
      <Button className="w-full" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    </AuthShell>
  );
}

export function TwoFactorForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function verify() {
    if (code.length < 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      await delay(600);
      toast.success("2FA verified (mock).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app.">
      <div className="space-y-6">
        <OtpInput value={code} onChange={setCode} />
        <Button className="w-full" loading={loading} onClick={verify}>
          Verify
        </Button>
      </div>
    </AuthShell>
  );
}
