import { beforeEach, describe, expect, it } from "vitest";
import { createMockUser, initAuthCrossTabSync, useAuthStore } from "@/stores/auth-store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      status: "anonymous",
      expiresAt: null,
      rememberMe: true,
    });
    localStorage.clear();
  });

  it("logs in and sets authenticated status", () => {
    const user = createMockUser({ email: "a@esifit.app", name: "Aria", tier: "free" });
    useAuthStore.getState().login(user, true);
    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user?.email).toBe("a@esifit.app");
    expect(state.expiresAt).toBeTypeOf("number");
  });

  it("logs out to anonymous", () => {
    const user = createMockUser({ email: "a@esifit.app", name: "Aria" });
    useAuthStore.getState().login(user);
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().status).toBe("anonymous");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("marks session expired when past expiresAt", () => {
    const user = createMockUser({ email: "a@esifit.app", name: "Aria" });
    useAuthStore.getState().login(user);
    useAuthStore.setState({ expiresAt: Date.now() - 1000 });
    useAuthStore.getState().checkExpiry();
    expect(useAuthStore.getState().status).toBe("expired");
  });

  it("updates profile fields used by onboarding/GOAL shape", () => {
    const user = createMockUser({ email: "a@esifit.app", name: "Aria" });
    useAuthStore.getState().login(user);
    useAuthStore.getState().updateProfile({
      primaryGoal: "build_muscle",
      experienceLevel: "intermediate",
      equipment: ["full_gym"],
      age: 29,
      weightKg: 70,
      onboardingCompleted: true,
    });
    const profile = useAuthStore.getState().user?.profile;
    expect(profile?.primaryGoal).toBe("build_muscle");
    expect(profile?.experienceLevel).toBe("intermediate");
    expect(profile?.onboardingCompleted).toBe(true);
  });

  it("syncs logout across tabs via BroadcastChannel", async () => {
    const cleanup = initAuthCrossTabSync();
    const user = createMockUser({ email: "a@esifit.app", name: "Aria" });
    useAuthStore.getState().login(user);

    const channel = new BroadcastChannel("esifit-auth-sync");
    channel.postMessage({ type: "logout" });

    await new Promise((r) => setTimeout(r, 20));
    expect(useAuthStore.getState().status).toBe("anonymous");
    channel.close();
    cleanup();
  });
});

describe("VIP gating helpers", () => {
  it("createMockUser maps tier to role", () => {
    expect(createMockUser({ email: "v@e.com", name: "V", tier: "vip" }).role).toBe("VIP");
    expect(createMockUser({ email: "c@e.com", name: "C", tier: "coach" }).role).toBe("Coach");
  });
});
