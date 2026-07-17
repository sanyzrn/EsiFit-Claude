"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormField, PasswordStrength, TextInput } from "@/components/ui/form";
import { createMockUser, delay, useAuthStore } from "@/stores/auth-store";

const schema = z
  .object({
    name: z.string().min(2, "Name needs at least 2 characters"),
    email: z.email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password needs 8+ characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
    mode: "onBlur",
  });
  const password = watch("password"); // eslint-disable-line react-hooks/incompatible-library -- RHF watch for strength meter

  async function onSubmit(values: FormValues) {
    try {
      await delay(800);
      const user = createMockUser({
        email: values.email,
        name: values.name,
        tier: "free",
        verified: false,
      });
      login(user, true);
      toast.success("Account created — verify your email next.");
      router.push("/verify-email");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create account.");
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Identity first. Personalization comes next — short and skippable."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--mint)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <TextInput id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <TextInput id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <TextInput
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={password || ""} />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirm" error={errors.confirm?.message}>
          <TextInput
            id="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
        </FormField>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
