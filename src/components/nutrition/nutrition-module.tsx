"use client";

import { useMemo, useState } from "react";
import { FOODS } from "@/lib/mock/catalog";
import { foodMacros, getSeedDataset } from "@/lib/mock/seed";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { RadialProgress } from "@/components/ui-extended/animated-metrics";
import { enqueueOffline, isOnline } from "@/lib/offline/queue";
import { toast } from "sonner";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";
type LogItem = { id: string; foodId: string; servings: number; slot: MealSlot };

type NutritionState = {
  waterMl: number;
  today: LogItem[];
  favorites: string[];
  addMeal: (item: Omit<LogItem, "id">) => void;
  addWater: (ml: number) => void;
  toggleFavorite: (foodId: string) => void;
};

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      waterMl: 0,
      today: [],
      favorites: [],
      addMeal: (item) =>
        set((s) => ({
          today: [...s.today, { ...item, id: `nm_${Date.now()}` }],
        })),
      addWater: (ml) => set((s) => ({ waterMl: s.waterMl + ml })),
      toggleFavorite: (foodId) => {
        const fav = get().favorites;
        set({
          favorites: fav.includes(foodId) ? fav.filter((f) => f !== foodId) : [...fav, foodId],
        });
      },
    }),
    { name: "esifit-nutrition", storage: createJSONStorage(() => localStorage) },
  ),
);

export function NutritionModule() {
  const [q, setQ] = useState("");
  const [slot, setSlot] = useState<MealSlot>("lunch");
  const today = useNutritionStore((s) => s.today);
  const waterMl = useNutritionStore((s) => s.waterMl);
  const favorites = useNutritionStore((s) => s.favorites);
  const addMeal = useNutritionStore((s) => s.addMeal);
  const addWater = useNutritionStore((s) => s.addWater);
  const toggleFavorite = useNutritionStore((s) => s.toggleFavorite);
  const seed = getSeedDataset();
  const seedToday = seed.nutritionDays.at(-1);

  const foods = FOODS.filter((f) => !q || f.name.toLowerCase().includes(q.toLowerCase()));

  const totals = useMemo(() => {
    return today.reduce(
      (acc, item) => {
        const m = foodMacros(item.foodId, item.servings);
        return {
          protein_g: acc.protein_g + m.protein_g,
          carbs_g: acc.carbs_g + m.carbs_g,
          fat_g: acc.fat_g + m.fat_g,
          calories: acc.calories + m.calories,
        };
      },
      { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 },
    );
  }, [today]);

  const targets = { calories: 2200, protein_g: 150, carbs_g: 220, fat_g: 70, water: 2800 };

  const shopping = useMemo(() => {
    const map = new Map<string, { name: string; category: string; qty: number }>();
    for (const day of seed.nutritionDays.slice(-7)) {
      for (const meal of day.meals) {
        const food = FOODS.find((f) => f.id === meal.foodId);
        if (!food) continue;
        const prev = map.get(food.id);
        map.set(food.id, {
          name: food.name,
          category: food.category,
          qty: (prev?.qty ?? 0) + meal.servings,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category));
  }, [seed.nutritionDays]);

  async function quickWater(ml: number) {
    addWater(ml);
    if (!isOnline()) {
      await enqueueOffline("water", { ml });
      toast.message("Water logged offline — will sync");
    } else toast.success(`+${ml} ml`);
  }

  async function logFood(foodId: string) {
    const item = { foodId, servings: 1, slot };
    addMeal(item);
    if (!isOnline()) {
      await enqueueOffline("meal", item);
      toast.message("Meal logged offline — will sync");
    } else toast.success("Added to today");
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <MacroCard label="Calories" value={totals.calories} target={targets.calories} />
        <MacroCard label="Protein" value={totals.protein_g} target={targets.protein_g} />
        <MacroCard label="Carbs" value={totals.carbs_g} target={targets.carbs_g} />
        <MacroCard label="Fat" value={totals.fat_g} target={targets.fat_g} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="type-h4">Water</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-32 w-16 overflow-hidden rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)]">
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--plasma)] to-[var(--mint)]"
                style={{ height: `${Math.min(100, (waterMl / targets.water) * 100)}%` }}
              />
            </div>
            <div>
              <p className="type-data-md">{waterMl} ml</p>
              <p className="type-caption text-[var(--foreground-muted)]">of {targets.water} ml</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => quickWater(250)}>
                  +250
                </Button>
                <Button size="sm" variant="secondary" onClick={() => quickWater(500)}>
                  +500
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="type-h4">Meal timeline</h2>
          <ul className="mt-4 space-y-2">
            {today.length === 0 ? (
              <li className="type-body-sm text-[var(--foreground-muted)]">
                No meals yet today. Seed suggestion: {seedToday?.meals[0] ? FOODS.find((f) => f.id === seedToday.meals[0]!.foodId)?.name : "oats"}.
              </li>
            ) : (
              today.map((item) => {
                const food = FOODS.find((f) => f.id === item.foodId);
                return (
                  <li key={item.id} className="flex justify-between type-body-sm">
                    <span>
                      <span className="text-[var(--foreground-subtle)]">{item.slot}</span> · {food?.name}
                    </span>
                    <span className="type-data-sm">{foodMacros(item.foodId, item.servings).calories} kcal</span>
                  </li>
                );
              })
            )}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1">
            <span className="type-caption font-semibold">Food database</span>
            <TextInput className="mt-1" placeholder="Search foods" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <select
            className="h-11 rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-3"
            value={slot}
            onChange={(e) => setSlot(e.target.value as MealSlot)}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((f) => (
            <div key={f.id} className="rounded-[var(--radius-md)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="type-body-sm font-semibold">{f.name}</p>
                  <p className="type-caption text-[var(--foreground-muted)]">
                    {f.calories} kcal · P{f.protein_g} C{f.carbs_g} F{f.fat_g}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleFavorite(f.id)} aria-label="Favorite">
                  {favorites.includes(f.id) ? "★" : "☆"}
                </Button>
              </div>
              <Button size="sm" className="mt-3" onClick={() => logFood(f.id)}>
                Add to {slot}
              </Button>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="type-h4">Recipe cards</h2>
          <div className="mt-4 space-y-3">
            {[
              { title: "High-protein bowl", items: ["f_chicken", "f_rice", "f_broccoli"], steps: ["Cook rice", "Grill chicken", "Steam broccoli", "Assemble"] },
              { title: "Recovery shake plate", items: ["f_whey", "f_banana", "f_almonds"], steps: ["Blend whey + banana", "Side of almonds", "Eat within 2h of training"] },
            ].map((r) => (
              <div key={r.title} className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
                <p className="type-h4">{r.title}</p>
                <p className="type-caption mt-1 text-[var(--foreground-muted)]">
                  {r.items.map((id) => FOODS.find((f) => f.id === id)?.name).join(" · ")}
                </p>
                <ol className="mt-2 list-decimal pl-4 type-body-sm text-[var(--foreground-muted)]">
                  {r.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h2 className="type-h4">Shopping list (week)</h2>
          <ul className="mt-4 space-y-2">
            {shopping.map((item) => (
              <li key={item.name} className="flex items-center gap-2 type-body-sm">
                <input type="checkbox" className="accent-[var(--mint)]" />
                <span className="flex-1">
                  {item.name}{" "}
                  <span className="type-caption text-[var(--foreground-subtle)]">({item.category})</span>
                </span>
                <span className="type-data-sm">×{item.qty.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function MacroCard({ label, value, target }: { label: string; value: number; target: number }) {
  return (
    <GlassCard className="flex items-center gap-3 p-4">
      <RadialProgress value={Math.min(100, (value / target) * 100)} size="sm" />
      <div>
        <p className="type-caption text-[var(--foreground-subtle)]">{label}</p>
        <p className="type-data-sm">
          {Math.round(value)} / {target}
        </p>
      </div>
    </GlassCard>
  );
}
