"use client";

import { useRouter } from "next/navigation";
import { getTodayEastern } from "@/lib/date";

interface Props {
  date: string;
}

export default function DateNavigator({ date }: Props) {
  const router = useRouter();

  const dateObj = new Date(date + "T00:00:00");
  const today = getTodayEastern();
  const isToday = date === today;

  function navigate(offset: number) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split("T")[0];

    if (newDate === today) {
      router.push("/");
    } else {
      router.push(`/?date=${newDate}`);
    }
  }

  const formatted = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between py-1">
      <button
        onClick={() => navigate(-1)}
        className="p-2 -ml-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors press-scale"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="text-center">
        {isToday ? (
          <div>
            <span className="font-display text-base md:text-lg font-bold text-text-primary">Today</span>
            <p className="text-xs text-text-muted mt-0.5">{formatted}</p>
          </div>
        ) : (
          <span className="font-display text-sm font-semibold text-text-primary">{formatted}</span>
        )}
      </div>
      <button
        onClick={() => navigate(1)}
        disabled={isToday}
        className="p-2 -mr-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface-hover transition-colors disabled:opacity-20 disabled:hover:bg-transparent press-scale"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
