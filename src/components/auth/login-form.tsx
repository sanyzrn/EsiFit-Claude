"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/ui/form";
import { createMockUser, delay, useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password needs 8+ characters"),
  rememberMe: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      toast.message("Your session expired. Please sign in again.");
    }
  }, [searchParams]);

  async function onSubmit(values: FormValues) {
    try {
      await delay(700);
      if (values.password === "failfail1") {
        throw new Error("Incorrect email or password.");
      }
      const email = values.email.toLowerCase();
      const tier = email.includes("vipplus")
        ? "vip-plus"
        : email.includes("vip")
          ? "vip"
          : email.includes("coach")
            ? "coach"
            : email.includes("admin")
              ? "admin"
              : "free";
      const user = createMockUser({
        email: values.email,
        name: values.email.split("@")[0] || "Member",
        tier,
        verified: true,
      });
      user.profile.onboardingCompleted = !email.includes("new");
      user.profile.onboardingSkipped = false;
      login(user, values.rememberMe);
      toast.success("Welcome back.");
      router.push(user.profile.onboardingCompleted ? "/dashboard" : "/onboarding");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't sign in.");
    }
  }

  async function social(provider: string) {
    try {
      await delay(500);
      const user = createMockUser({
        email: `${provider}@esifit.app`,
        name: provider === "google" ? "Alex Google" : "Sam Apple",
        tier: "free",
        verified: true,
      });
      user.profile.onboardingCompleted = true;
      login(user, true);
      toast.success(`Signed in with ${provider}`);
      router.push("/dashboard");
    } catch {
      toast.error("Social sign-in failed. Try email instead.");
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your calm fitness operating system."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-[var(--mint)] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <TextInput id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 type-body-sm text-[var(--foreground-muted)]">
            <input type="checkbox" className="accent-[var(--mint)]" {...register("rememberMe")} />
            Remember me
          </label>
          <Link href="/forgot-password" className="type-body-sm font-semibold text-[var(--plasma)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--surface-glass-border)]" />
        <span className="type-caption text-[var(--foreground-subtle)]">or</span>
        <div className="h-px flex-1 bg-[var(--surface-glass-border)]" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="secondary" onClick={() => social("google")}>
          Google
        </Button>
        <Button type="button" variant="secondary" onClick={() => social("apple")}>
          Apple
        </Button>
      </div>
      <p className="type-caption mt-4 text-[var(--foreground-subtle)]">
        Demo tips: email containing vip, vipplus, coach, or new (triggers onboarding).
      </p>
    </AuthShell>
  );
}
