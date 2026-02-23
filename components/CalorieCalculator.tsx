"use client";

import { useState } from "react";

type Gender = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type Activity = "sedentary" | "light" | "moderate" | "very" | "extra";

const activityOptions: { key: Activity; label: string; desc: string }[] = [
  { key: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { key: "light", label: "Lightly active", desc: "Exercise 1–3 days/week" },
  { key: "moderate", label: "Moderately active", desc: "Exercise 3–5 days/week" },
  { key: "very", label: "Very active", desc: "Exercise 6–7 days/week" },
  { key: "extra", label: "Extra active", desc: "Hard exercise + physical job" },
];

const activityMultipliers: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

interface Props {
  onConfirm: (calories: number) => void;
  onClose: () => void;
}

export default function CalorieCalculator({ onConfirm, onClose }: Props) {
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<Gender>("male");
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(10);
  const [weight, setWeight] = useState(170);
  const [activity, setActivity] = useState<Activity>("moderate");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [rate, setRate] = useState(1.0);

  // Convert to metric
  const heightCm = (heightFt * 12 + heightIn) * 2.54;
  const weightKg = weight * 0.453592;

  // Mifflin-St Jeor BMR
  const bmr =
    gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = bmr * activityMultipliers[activity];

  // 1 lb ≈ 3500 cal → lbs/week × 500 cal/day
  const dailyAdjustment = goal === "maintain" ? 0 : rate * 500;
  const targetCalories = Math.round(
    goal === "lose"
      ? tdee - dailyAdjustment
      : goal === "gain"
        ? tdee + dailyAdjustment
        : tdee
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-bg-surface rounded-2xl border border-border w-full max-w-md max-h-[85vh] overflow-y-auto p-5 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Calculate Calories
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 press-scale"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={age || ""}
                onChange={(e) => setAge(e.target.value === "" ? 0 : Number(e.target.value))}
                min={10}
                max={100}
                placeholder="25"
                className="w-full border border-border rounded-lg px-3 py-2 bg-bg-input text-text-primary text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
                Gender
              </label>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["male", "female"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors press-scale ${
                      gender === g
                        ? "bg-accent text-accent-text"
                        : "bg-bg-input text-text-secondary hover:bg-bg-surface-hover"
                    }`}
                  >
                    {g === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
              Height
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="number"
                  value={heightFt || ""}
                  onChange={(e) => setHeightFt(e.target.value === "" ? 0 : Number(e.target.value))}
                  min={3}
                  max={8}
                  placeholder="5"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-bg-input text-text-primary text-sm tabular-nums"
                />
                <span className="text-xs text-text-muted shrink-0">ft</span>
              </div>
              <div className="flex-1 flex items-center gap-1.5">
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value === "" ? 0 : Number(e.target.value))}
                  min={0}
                  max={11}
                  placeholder="10"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-bg-input text-text-primary text-sm tabular-nums"
                />
                <span className="text-xs text-text-muted shrink-0">in</span>
              </div>
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
              Weight
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={weight || ""}
                onChange={(e) => setWeight(e.target.value === "" ? 0 : Number(e.target.value))}
                min={50}
                max={500}
                placeholder="170"
                className="w-full border border-border rounded-lg px-3 py-2 bg-bg-input text-text-primary text-sm tabular-nums"
              />
              <span className="text-xs text-text-muted shrink-0">lbs</span>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
              Activity Level
            </label>
            <div className="space-y-1.5">
              {activityOptions.map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => setActivity(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors press-scale ${
                    activity === key
                      ? "bg-accent-subtle border border-accent text-text-primary font-medium"
                      : "bg-bg-input border border-border text-text-secondary hover:bg-bg-surface-hover"
                  }`}
                >
                  {label}
                  <span className="text-text-muted ml-1">— {desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium block mb-1.5">
              Goal
            </label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["lose", "maintain", "gain"] as Goal[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors press-scale ${
                    goal === g
                      ? "bg-accent text-accent-text"
                      : "bg-bg-input text-text-secondary hover:bg-bg-surface-hover"
                  }`}
                >
                  {g === "lose" ? "Lose" : g === "maintain" ? "Maintain" : "Gain"}
                </button>
              ))}
            </div>
          </div>

          {/* Rate slider */}
          {goal !== "maintain" && (
            <div className="animate-scale-in">
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-[10px] uppercase tracking-widest text-text-muted font-medium">
                  Rate
                </label>
                <span className="text-sm font-display font-semibold text-text-primary tabular-nums">
                  {rate.toFixed(rate % 1 === 0 ? 0 : 1)} lb/week
                </span>
              </div>
              <input
                type="range"
                min={goal === "gain" ? 0.25 : 0.5}
                max={goal === "gain" ? 1 : 2}
                step={0.25}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>Gradual</span>
                <span>Aggressive</span>
              </div>
            </div>
          )}

          {/* Live result */}
          <div className="bg-bg-surface-hover rounded-xl p-4 text-center border border-border-light">
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-1">
              {goal === "lose"
                ? "Deficit"
                : goal === "gain"
                  ? "Surplus"
                  : "Maintenance"}{" "}
              Calories
            </p>
            <p className="font-display text-3xl font-bold text-text-primary tabular-nums">
              {targetCalories}
            </p>
            <p className="text-xs text-text-muted mt-1">calories per day</p>
            {goal !== "maintain" && (
              <p className="text-xs text-text-muted mt-0.5">
                ~{rate.toFixed(rate % 1 === 0 ? 0 : 1)} lb/week{" "}
                {goal === "lose" ? "loss" : "gain"}
              </p>
            )}
          </div>

          <button
            onClick={() => onConfirm(targetCalories)}
            className="w-full bg-accent text-accent-text py-3 rounded-xl font-medium transition-colors hover:bg-accent-hover press-scale"
          >
            Set as Target
          </button>
        </div>
      </div>
    </div>
  );
}
