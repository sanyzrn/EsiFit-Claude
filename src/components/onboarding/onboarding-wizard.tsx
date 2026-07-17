"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField, TextInput } from "@/components/ui/form";
import { GlassCard } from "@/components/ui/card";
import type {
  EquipmentAccess,
  ExperienceLevel,
  NotificationPreference,
  PrimaryGoal,
  Sex,
  UserProfile,
} from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const STEPS = 6;

const goals: { id: PrimaryGoal; label: string }[] = [
  { id: "lose_weight", label: "Lose weight" },
  { id: "build_muscle", label: "Build muscle" },
  { id: "improve_endurance", label: "Improve endurance" },
  { id: "general_health", label: "General health" },
  { id: "athletic_performance", label: "Athletic performance" },
];

const experience: { id: ExperienceLevel; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

const equipmentOptions: { id: EquipmentAccess; label: string }[] = [
  { id: "full_gym", label: "Full gym" },
  { id: "home_gym", label: "Home gym (basic)" },
  { id: "bodyweight", label: "Bodyweight only" },
  { id: "specific", label: "Specific equipment" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<UserProfile>(() => ({
    ...DEFAULT_PROFILE,
    ...user?.profile,
    weightKg: user?.profile.weightKg,
    heightCm: user?.profile.heightCm,
    age: user?.profile.age,
    sex: user?.profile.sex,
    targetWeightKg: user?.profile.targetWeightKg,
  }));

  const progress = useMemo(() => `${step} of ${STEPS}`, [step]);

  function patch(p: Partial<UserProfile>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function finish(completed: boolean, skipped: boolean) {
    updateProfile({
      ...draft,
      onboardingCompleted: completed,
      onboardingSkipped: skipped,
      // ensure GOAL-aligned defaults
      primaryGoal: draft.primaryGoal || "general_health",
      experienceLevel: draft.experienceLevel || "beginner",
      equipment: draft.equipment.length ? draft.equipment : ["bodyweight"],
      notificationPreference: draft.notificationPreference || "gentle",
    });
    toast.success(completed ? "Profile ready. Welcome to your dashboard." : "You can finish this anytime — no pressure.");
    router.push("/dashboard");
  }

  function next() {
    if (step < STEPS) setStep((s) => s + 1);
    else finish(true, false);
  }

  function skip() {
    if (step < STEPS) setStep((s) => s + 1);
    else finish(false, true);
  }

  return (
    <div className="relative min-h-[100dvh] gradient-hero px-4 pb-16 pt-28">
      <div className="mx-auto w-full max-w-xl">
        <p className="type-caption mb-2 font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">Onboarding · Step {progress}</p>
        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--plasma)] transition-all duration-[var(--duration-smooth)]"
            style={{ width: `${(step / STEPS) * 100}%` }}
          />
        </div>
        <GlassCard className="p-6 sm:p-8">
          {step === 1 && (
            <StepFrame title="What's your primary goal?" subtitle="This gently shapes your dashboard emphasis.">
              <div className="grid gap-2">
                {goals.map((g) => (
                  <Choice key={g.id} active={draft.primaryGoal === g.id} onClick={() => patch({ primaryGoal: g.id })}>
                    {g.label}
                  </Choice>
                ))}
              </div>
            </StepFrame>
          )}
          {step === 2 && (
            <StepFrame title="Experience level" subtitle="We'll keep recommendations appropriately challenging.">
              <div className="grid gap-2">
                {experience.map((g) => (
                  <Choice key={g.id} active={draft.experienceLevel === g.id} onClick={() => patch({ experienceLevel: g.id })}>
                    {g.label}
                  </Choice>
                ))}
              </div>
            </StepFrame>
          )}
          {step === 3 && (
            <StepFrame title="Equipment access" subtitle="Multi-select what you usually have available.">
              <div className="grid gap-2">
                {equipmentOptions.map((g) => {
                  const active = draft.equipment.includes(g.id);
                  return (
                    <Choice
                      key={g.id}
                      active={active}
                      onClick={() =>
                        patch({
                          equipment: active ? draft.equipment.filter((e) => e !== g.id) : [...draft.equipment, g.id],
                        })
                      }
                    >
                      {g.label}
                    </Choice>
                  );
                })}
              </div>
            </StepFrame>
          )}
          {step === 4 && (
            <StepFrame title="Basic biometrics" subtitle="Used to pre-fill calculators later — never shared publicly.">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Age" htmlFor="age">
                  <TextInput
                    id="age"
                    type="number"
                    min={13}
                    max={100}
                    value={draft.age ?? ""}
                    onChange={(e) => patch({ age: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </FormField>
                <FormField label="Sex" htmlFor="sex">
                  <select
                    id="sex"
                    className="h-11 w-full rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-3"
                    value={draft.sex ?? ""}
                    onChange={(e) => patch({ sex: (e.target.value || undefined) as Sex | undefined })}
                  >
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </FormField>
                <FormField label="Height (cm)" htmlFor="height">
                  <TextInput
                    id="height"
                    type="number"
                    value={draft.heightCm ?? ""}
                    onChange={(e) => patch({ heightCm: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </FormField>
                <FormField label="Current weight (kg)" htmlFor="weight">
                  <TextInput
                    id="weight"
                    type="number"
                    value={draft.weightKg ?? ""}
                    onChange={(e) => patch({ weightKg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </FormField>
                <FormField label="Target weight (optional)" htmlFor="target">
                  <TextInput
                    id="target"
                    type="number"
                    value={draft.targetWeightKg ?? ""}
                    onChange={(e) => patch({ targetWeightKg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </FormField>
              </div>
            </StepFrame>
          )}
          {step === 5 && (
            <StepFrame title="Reminders" subtitle="A gentle default you can refine later.">
              {(
                [
                  ["off", "Off"],
                  ["gentle", "Gentle"],
                  ["frequent", "Frequent"],
                ] as [NotificationPreference, string][]
              ).map(([id, label]) => (
                <Choice key={id} active={draft.notificationPreference === id} onClick={() => patch({ notificationPreference: id })}>
                  {label}
                </Choice>
              ))}
            </StepFrame>
          )}
          {step === 6 && (
            <StepFrame title="Connect a wearable" subtitle="Coming soon — reserve the slot without blocking you.">
              <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--surface-glass-border)] bg-[var(--surface-2)] p-5">
                <p className="type-h4">Wearable import</p>
                <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">
                  Apple Health, Google Fit, and WHOOP-style imports arrive in a later phase. You can continue without connecting.
                </p>
                <Button
                  className="mt-4"
                  variant="secondary"
                  onClick={() => patch({ wearableConnected: !draft.wearableConnected })}
                >
                  {draft.wearableConnected ? "Placeholder connected" : "Mark interest (placeholder)"}
                </Button>
              </div>
            </StepFrame>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={skip}>
              Skip for now
            </Button>
            <div className="flex gap-2">
              {step > 1 ? (
                <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              ) : null}
              <Button onClick={next}>{step === STEPS ? "Go to dashboard" : "Continue"}</Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function StepFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="type-h2">{title}</h1>
      <p className="type-body-sm mt-2 text-[var(--foreground-muted)]">{subtitle}</p>
      <div className="mt-6 space-y-2">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-[var(--radius-md)] border px-4 py-3 text-left type-body-sm font-semibold transition-colors",
        active
          ? "border-[var(--mint)] bg-[var(--mint-dim)] text-[var(--foreground)]"
          : "border-[var(--surface-glass-border)] bg-[var(--surface-2)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </button>
  );
}
