"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ParsedFoodResponse } from "@/lib/types";

export default function FoodInput({ date }: { date: string }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ParsedFoodResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [input]);

  async function handleParse() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const res = await fetch("/api/parse-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) throw new Error("Failed to parse food");

      const data: ParsedFoodResponse = await res.json();
      setPreview(data);
    } catch {
      setError("Failed to parse food. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/food-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: preview.items,
          meal_name: preview.meal_name,
          date,
        }),
      });

      if (!res.ok) throw new Error("Failed to save entries");

      setInput("");
      setPreview(null);
      router.refresh();
    } catch {
      setError("Failed to save entries. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setPreview(null);
    setError(null);
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview && (
        <div className="bg-bg-surface rounded-xl border border-border p-4 space-y-3 animate-scale-in">
          {preview.meal_name && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-medium text-accent">
                Meal
              </span>
              <span className="font-display text-sm font-bold text-text-primary">
                {preview.meal_name}
              </span>
            </div>
          )}
          <div className="space-y-0">
            {preview.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2.5 border-b border-border-light last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    {item.name}
                  </span>
                  <span className="text-xs text-text-muted ml-1.5">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium text-text-primary tabular-nums">
                    {Math.round(item.calories)}
                  </span>
                  <span className="text-text-muted">cal</span>
                </div>
              </div>
            ))}
          </div>
          {preview.items.length > 1 && (
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div className="flex gap-3 text-[10px] tracking-wide text-text-muted">
                <span className="text-macro-protein">
                  P {Math.round(preview.items.reduce((s, i) => s + i.protein_g, 0))}g
                </span>
                <span className="text-macro-carbs">
                  C {Math.round(preview.items.reduce((s, i) => s + i.carbs_g, 0))}g
                </span>
                <span className="text-macro-fat">
                  F {Math.round(preview.items.reduce((s, i) => s + i.fat_g, 0))}g
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-display font-bold text-text-primary tabular-nums">
                  {Math.round(preview.items.reduce((s, i) => s + i.calories, 0))}
                </span>
                <span className="text-xs text-text-muted">cal</span>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-success text-white text-sm py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors press-scale"
            >
              {loading ? "Saving..." : "Confirm"}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-bg-surface-hover text-text-secondary text-sm py-2.5 rounded-lg font-medium transition-colors press-scale"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-error text-sm px-1">{error}</p>
      )}

      {/* Input */}
      <div className="relative space-y-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !preview) {
              e.preventDefault();
              handleParse();
            }
          }}
          placeholder="What did you eat? e.g. 2 eggs, bowl of rice..."
          rows={1}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm md:text-base bg-bg-input text-text-primary placeholder-text-muted focus:border-accent resize-none overflow-hidden"
          disabled={loading || !!preview}
        />
        {loading && !preview && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-input/80 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <svg className="animate-spin h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="loading-pulse">Analyzing...</span>
            </div>
          </div>
        )}
        {input.trim() && !preview && (
          <button
            onClick={handleParse}
            disabled={loading}
            className="md:hidden w-full bg-accent text-accent-text py-2.5 rounded-xl text-sm font-medium disabled:opacity-40 transition-all hover:bg-accent-hover press-scale animate-fade-in-up"
          >
            {loading ? (
              <span className="loading-pulse">Analyzing...</span>
            ) : (
              "Add"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
