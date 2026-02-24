"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Meal, FoodEntry } from "@/lib/types";

interface MealWithEntries extends Meal {
  noot_food_entries: FoodEntry[];
}

export default function MealsPage() {
  const [meals, setMeals] = useState<MealWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullRecipeIds, setFullRecipeIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetch("/api/meals")
      .then((res) => res.json())
      .then((data) => {
        setMeals(data);
        setLoading(false);
      });
  }, []);

  async function handleUseMeal(mealId: string) {
    await fetch(`/api/meals/${mealId}`, { method: "POST" });
    router.push("/");
  }

  async function handleDeleteMeal(mealId: string) {
    await fetch(`/api/meals/${mealId}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  }

  if (loading) {
    return (
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 md:px-8 pb-24 md:pb-8 pt-6 md:pt-8">
        <h1 className="font-display text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Saved Meals
        </h1>
        <p className="text-sm text-text-muted mt-1 mb-6">
          Reuse your favorite meals
        </p>
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-bg-surface rounded-xl border border-border p-4 h-20 loading-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg md:max-w-2xl mx-auto px-4 md:px-8 pb-24 md:pb-8 pt-6 md:pt-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Saved Meals
        </h1>
        <p className="text-sm text-text-muted mt-1 mb-6">
          Reuse your favorite meals
        </p>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-12 animate-fade-in-up">
          <p className="text-text-muted text-sm">No saved meals yet.</p>
          <p className="text-text-muted text-xs mt-1">
            When you log a meal, you can save it as a template
          </p>
        </div>
      ) : (
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {meals.map((meal, index) => {
            const s = meal.servings ?? 1;
            const isFullRecipe = fullRecipeIds.has(meal.id);
            const multiplier = isFullRecipe ? s : 1;
            const totalCal = meal.noot_food_entries.reduce(
              (sum, e) => sum + e.calories,
              0
            ) * multiplier;

            return (
              <div
                key={meal.id}
                className="bg-bg-surface rounded-xl border border-border p-4 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 60}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display font-bold text-sm text-text-primary">
                      {meal.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {meal.noot_food_entries.length} items &middot;{" "}
                      {Math.round(totalCal)} cal
                      {s > 1 && ` · ${s} servings`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseMeal(meal.id)}
                      className="text-xs bg-accent text-accent-text px-3.5 py-1.5 rounded-lg font-medium transition-colors hover:bg-accent-hover press-scale"
                    >
                      Use today
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-text-muted hover:text-error p-1.5 rounded-md hover:bg-bg-surface-hover transition-colors press-scale"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                {s > 1 && (
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        setFullRecipeIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(meal.id)) next.delete(meal.id);
                          else next.add(meal.id);
                          return next;
                        });
                      }}
                      className="text-[10px] uppercase tracking-widest text-accent font-medium hover:text-accent-hover transition-colors press-scale"
                    >
                      {isFullRecipe ? "Per serving" : "Full recipe"}
                    </button>
                  </div>
                )}
                <div className="border-t border-border-light pt-2 space-y-1.5">
                  {meal.noot_food_entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-text-secondary">
                        {entry.name}{" "}
                        <span className="text-text-muted">
                          ({entry.quantity})
                        </span>
                      </span>
                      <span className="text-text-muted tabular-nums">
                        {Math.round(entry.calories * multiplier)} cal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
