"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DailyGoals } from "@/lib/types";
import CalorieCalculator from "./CalorieCalculator";

export default function GoalsForm({
  goals,
}: {
  goals: DailyGoals | null;
}) {
  const [calories, setCalories] = useState(goals?.calories_target ?? 2000);
  const [protein, setProtein] = useState(goals?.protein_pct ?? 35);
  const [carbs, setCarbs] = useState(goals?.carbs_pct ?? 40);
  const [fat, setFat] = useState(goals?.fat_pct ?? 25);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const router = useRouter();

  const totalPct = protein + carbs + fat;

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calories_target: calories,
        protein_pct: protein,
        carbs_pct: carbs,
        fat_pct: fat,
      }),
    });

    setLoading(false);
    setSaved(true);
    router.refresh();

    setTimeout(() => setSaved(false), 2000);
  }

  const proteinGrams = Math.round((calories * (protein / 100)) / 4);
  const carbsGrams = Math.round((calories * (carbs / 100)) / 4);
  const fatGrams = Math.round((calories * (fat / 100)) / 9);

  return (
    <div className="space-y-6">
      {/* Calorie Target */}
      <div className="bg-bg-surface rounded-xl border border-border p-4 animate-fade-in-up hover-lift">
        <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-3">
          Daily Calorie Target
        </label>
        <input
          type="number"
          value={calories || ""}
          onChange={(e) => setCalories(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full border border-border rounded-xl px-4 py-3 bg-bg-input text-text-primary font-display text-lg font-bold tabular-nums"
          step={50}
          placeholder="2000"
        />
        <button
          onClick={() => setShowCalculator(true)}
          className="mt-3 text-sm text-accent hover:text-accent-hover font-medium transition-colors press-scale flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="8" y1="10" x2="10" y2="10" />
            <line x1="14" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="10" y2="14" />
            <line x1="14" y1="14" x2="16" y2="14" />
            <line x1="8" y1="18" x2="10" y2="18" />
            <line x1="14" y1="18" x2="16" y2="18" />
          </svg>
          Calculate calories
        </button>
      </div>

      {/* Macro Split */}
      <div className="bg-bg-surface rounded-xl border border-border p-4 animate-fade-in-up hover-lift" style={{ animationDelay: "60ms" }}>
        <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-4">
          Macronutrient Split
        </label>
        <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
          <MacroSlider
            label="Protein"
            pct={protein}
            grams={proteinGrams}
            color="text-macro-protein"
            onChange={setProtein}
          />
          <MacroSlider
            label="Carbs"
            pct={carbs}
            grams={carbsGrams}
            color="text-macro-carbs"
            onChange={setCarbs}
          />
          <MacroSlider
            label="Fat"
            pct={fat}
            grams={fatGrams}
            color="text-macro-fat"
            onChange={setFat}
          />
        </div>

        {totalPct !== 100 && (
          <p className="text-sm text-warning mt-4 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Total is {totalPct}% — should add up to 100%
          </p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-accent text-accent-text py-3 rounded-xl font-medium disabled:opacity-50 transition-colors hover:bg-accent-hover press-scale"
      >
        {loading ? "Saving..." : saved ? "Saved!" : "Save Goals"}
      </button>

      {showCalculator && (
        <CalorieCalculator
          onConfirm={(cal) => {
            setCalories(cal);
            setShowCalculator(false);
          }}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  );
}

function MacroSlider({
  label,
  pct,
  grams,
  color,
  onChange,
}: {
  label: string;
  pct: number;
  grams: number;
  color: string;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className={`font-display text-sm font-semibold ${color} flex items-baseline gap-1`}>
          {label}:
          <input
            type="number"
            value={pct || ""}
            onChange={(e) => {
              if (e.target.value === "") { onChange(0); return; }
              const v = Math.max(0, Math.min(100, Number(e.target.value)));
              onChange(v);
            }}
            min={0}
            max={100}
            className="w-10 bg-transparent border-b border-current text-center text-sm font-semibold tabular-nums appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span>%</span>
        </label>
        <span className="text-xs text-text-muted tabular-nums">{grams}g</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
