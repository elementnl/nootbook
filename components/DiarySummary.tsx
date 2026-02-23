"use client";

import { useState } from "react";
import { FoodEntry, DailyGoals } from "@/lib/types";

interface Props {
  entries: FoodEntry[];
  goals: DailyGoals | null;
}

export default function DiarySummary({ entries, goals }: Props) {
  const [showMicros, setShowMicros] = useState(false);

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein_g,
      carbs: acc.carbs + entry.carbs_g,
      fat: acc.fat + entry.fat_g,
      fiber: acc.fiber + (entry.fiber_g ?? 0),
      sugar: acc.sugar + (entry.sugar_g ?? 0),
      sodium: acc.sodium + (entry.sodium_mg ?? 0),
      iron: acc.iron + (entry.iron_mg ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, iron: 0 }
  );

  const calorieTarget = goals?.calories_target ?? 2000;
  const caloriePct = Math.min((totals.calories / calorieTarget) * 100, 100);

  const proteinTarget = goals
    ? (calorieTarget * (goals.protein_pct / 100)) / 4
    : 150;
  const carbsTarget = goals
    ? (calorieTarget * (goals.carbs_pct / 100)) / 4
    : 200;
  const fatTarget = goals
    ? (calorieTarget * (goals.fat_pct / 100)) / 9
    : 67;

  return (
    <div className="bg-bg-surface rounded-2xl border border-border p-5 md:p-6 animate-scale-in hover-lift">
      <div className="md:flex md:items-start md:gap-8">
        {/* Calories - hero stat */}
        <div className="md:flex-1">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="font-display text-3xl md:text-4xl font-bold text-text-primary tabular-nums tracking-tight">
                {Math.round(totals.calories)}
              </span>
              <span className="text-sm text-text-muted ml-1.5">
                / {calorieTarget} cal
              </span>
            </div>
            <span className="text-xs text-text-muted tabular-nums">
              {Math.round(calorieTarget - totals.calories)} remaining
            </span>
          </div>
          <div className="w-full bg-bar-track rounded-full h-2 md:h-2.5">
            <div
              className="bg-accent h-2 md:h-2.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${caloriePct}%` }}
            />
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-4 mt-5 md:mt-0 md:w-[280px] md:shrink-0">
          <MacroBar
            label="Protein"
            current={totals.protein}
            target={proteinTarget}
            color="bg-macro-protein"
            textColor="text-macro-protein"
          />
          <MacroBar
            label="Carbs"
            current={totals.carbs}
            target={carbsTarget}
            color="bg-macro-carbs"
            textColor="text-macro-carbs"
          />
          <MacroBar
            label="Fat"
            current={totals.fat}
            target={fatTarget}
            color="bg-macro-fat"
            textColor="text-macro-fat"
          />
        </div>
      </div>

      {/* Micronutrients toggle */}
      <div className="mt-4 pt-3 border-t border-border-light">
        <button
          onClick={() => setShowMicros(!showMicros)}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-muted font-medium hover:text-text-secondary transition-colors press-scale"
        >
          More details
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${showMicros ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showMicros && (
          <div className="animate-expand">
            <div className="grid grid-cols-4 gap-4 mt-3">
              <MicroBar
                label="Fiber"
                current={totals.fiber}
                target={28}
                unit="g"
              />
              <MicroBar
                label="Sugar"
                current={totals.sugar}
                unit="g"
              />
              <MicroBar
                label="Sodium"
                current={totals.sodium}
                target={2300}
                unit="mg"
              />
              <MicroBar
                label="Iron"
                current={totals.iron}
                target={18}
                unit="mg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MacroBar({
  label,
  current,
  target,
  color,
  textColor,
}: {
  label: string;
  current: number;
  target: number;
  color: string;
  textColor: string;
}) {
  const pct = Math.min((current / target) * 100, 100);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-1">
        {label}
      </p>
      <p className="text-sm tabular-nums">
        <span className={`font-display font-bold ${textColor}`}>
          {Math.round(current)}
        </span>
        <span className="text-text-muted text-xs">/{Math.round(target)}g</span>
      </p>
      <div className="w-full bg-bar-track rounded-full h-1.5 mt-1.5">
        <div
          className={`${color} h-1.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MicroBar({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target?: number;
  unit: string;
}) {
  const pct = target ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-text-muted font-medium mb-1">
        {label}
      </p>
      <p className="text-xs tabular-nums">
        <span className="font-display font-bold text-text-secondary">
          {Math.round(current)}
        </span>
        <span className="text-text-muted text-[10px]">
          {target ? `/${target}${unit}` : unit}
        </span>
      </p>
      {target && (
        <div className="w-full bg-bar-track rounded-full h-1 mt-1.5">
          <div
            className="bg-text-muted h-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
