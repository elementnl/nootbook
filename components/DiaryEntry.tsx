"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FoodEntry } from "@/lib/types";

export default function DiaryEntry({ entry }: { entry: FoodEntry }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calories, setCalories] = useState(entry.calories);
  const [protein, setProtein] = useState(entry.protein_g);
  const [carbs, setCarbs] = useState(entry.carbs_g);
  const [fat, setFat] = useState(entry.fat_g);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/food-entries/${entry.id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/food-entries/${entry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...entry,
        calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
      }),
    });
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="bg-bg-surface rounded-xl border border-border p-4 space-y-3 animate-scale-in">
        <p className="text-sm font-medium text-text-primary">
          {entry.name}{" "}
          <span className="text-text-muted font-normal">{entry.quantity}</span>
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Cal", value: calories, setter: setCalories },
            { label: "Protein", value: protein, setter: setProtein },
            { label: "Carbs", value: carbs, setter: setCarbs },
            { label: "Fat", value: fat, setter: setFat },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium block mb-1">
                {label}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm bg-bg-input text-text-primary tabular-nums"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-sm bg-success text-white px-4 py-1.5 rounded-lg font-medium transition-colors press-scale"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm bg-bg-surface-hover text-text-secondary px-4 py-1.5 rounded-lg font-medium transition-colors press-scale"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border-light last:border-0">
      <div className="group flex items-center justify-between py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-medium text-text-primary truncate">
            {entry.name}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{entry.quantity}</p>
        </button>
        <div className="flex items-center gap-2 ml-3 md:relative">
          <div className="text-right">
            <p className="text-sm tabular-nums">
              <span className="font-display font-bold text-text-primary">
                {Math.round(entry.calories)}
              </span>
              <span className="text-text-muted text-xs ml-0.5">cal</span>
            </p>
            <p className="text-[10px] text-text-muted tabular-nums mt-0.5 tracking-wide">
              <span className="text-macro-protein">P{Math.round(entry.protein_g)}</span>
              {" "}
              <span className="text-macro-carbs">C{Math.round(entry.carbs_g)}</span>
              {" "}
              <span className="text-macro-fat">F{Math.round(entry.fat_g)}</span>
            </p>
          </div>
          <div className="flex gap-0.5 items-center opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 md:absolute md:inset-y-0 md:right-0 md:bg-bg-surface md:pl-2 md:rounded-md">
            <button
              onClick={() => setEditing(true)}
              className="text-text-muted hover:text-text-secondary p-1.5 rounded-md hover:bg-bg-surface-hover transition-colors press-scale"
              title="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-text-muted hover:text-error p-1.5 rounded-md hover:bg-bg-surface-hover transition-colors disabled:opacity-50 press-scale"
              title="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="animate-expand pb-3">
          <div className="grid grid-cols-4 gap-3 bg-bg-surface-hover rounded-lg px-3 py-2">
            {[
              { label: "Fiber", value: entry.fiber_g ?? 0, unit: "g" },
              { label: "Sugar", value: entry.sugar_g ?? 0, unit: "g" },
              { label: "Sodium", value: entry.sodium_mg ?? 0, unit: "mg" },
              { label: "Iron", value: entry.iron_mg ?? 0, unit: "mg" },
            ].map(({ label, value, unit }) => (
              <div key={label}>
                <p className="text-[9px] uppercase tracking-widest text-text-muted font-medium">
                  {label}
                </p>
                <p className="text-xs tabular-nums text-text-secondary font-medium mt-0.5">
                  {Math.round(value * 10) / 10}{unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
