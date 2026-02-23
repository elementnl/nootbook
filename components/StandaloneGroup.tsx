"use client";

import { useState } from "react";
import { FoodEntry } from "@/lib/types";
import DiaryEntry from "./DiaryEntry";

interface Props {
  entries: FoodEntry[];
}

export default function StandaloneGroup({ entries }: Props) {
  const [expanded, setExpanded] = useState(false);

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  return (
    <div className="bg-bg-surface rounded-xl border border-border overflow-hidden hover-lift">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-bg-surface-hover transition-colors press-scale"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-1 h-4 bg-text-muted rounded-full shrink-0" />
          <span className="font-display text-sm font-bold text-text-primary truncate">
            Other items
          </span>
          <span className="text-xs text-text-muted shrink-0">
            {entries.length} item{entries.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 ml-2">
          <div className="text-right">
            <span className="font-display text-sm font-bold text-text-primary tabular-nums">
              {Math.round(totalCalories)}
            </span>
            <span className="text-xs text-text-muted ml-0.5">cal</span>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-text-muted transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="animate-expand">
          <div className="px-4 border-t border-border-light">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <DiaryEntry entry={entry} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
