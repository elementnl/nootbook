export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase/server";
import { FoodEntry, DailyGoals } from "@/lib/types";
import { getTodayEastern } from "@/lib/date";
import FoodInput from "@/components/FoodInput";
import DiaryEntry from "@/components/DiaryEntry";
import DiarySummary from "@/components/DiarySummary";
import MealGroup from "@/components/MealGroup";
import DateNavigator from "@/components/DateNavigator";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const today = getTodayEastern();
  const selectedDate = date || today;
  const isToday = selectedDate === today;

  const supabase = await createServerSupabase();

  const [entriesResult, goalsResult] = await Promise.all([
    supabase
      .from("noot_food_entries")
      .select("*, noot_meals(name)")
      .eq("date", selectedDate)
      .order("created_at", { ascending: true }),
    supabase.from("noot_daily_goals").select("*").limit(1).single(),
  ]);

  const entries: FoodEntry[] = entriesResult.data ?? [];
  const goals: DailyGoals | null = goalsResult.data;

  // Group entries: standalone vs meal-grouped
  const standalone: FoodEntry[] = [];
  const mealGroups: Record<string, { name: string; entries: FoodEntry[] }> = {};

  for (const entry of entries) {
    if (entry.meal_id) {
      if (!mealGroups[entry.meal_id]) {
        const mealData = entry as FoodEntry & { noot_meals?: { name: string } };
        mealGroups[entry.meal_id] = {
          name: mealData.noot_meals?.name ?? "Meal",
          entries: [],
        };
      }
      mealGroups[entry.meal_id].entries.push(entry);
    } else {
      standalone.push(entry);
    }
  }

  const mealGroupCount = Object.keys(mealGroups).length;

  return (
    <div className={`max-w-lg md:max-w-2xl mx-auto px-4 md:px-8 ${isToday ? "pb-44 md:pb-8" : "pb-24 md:pb-8"} pt-6 md:pt-8`}>
      <DateNavigator date={selectedDate} />

      <div className="mt-4 animate-fade-in-up">
        <DiarySummary entries={entries} goals={goals} />
      </div>

      <div className="mt-4 space-y-2.5">
        {Object.entries(mealGroups).map(([mealId, group], index) => (
          <div
            key={mealId}
            className="animate-fade-in-up"
            style={{ animationDelay: `${(index + 1) * 60}ms` }}
          >
            <MealGroup
              mealId={mealId}
              mealName={group.name}
              entries={group.entries}
            />
          </div>
        ))}

        {standalone.length > 0 && (
          <div
            className="bg-bg-surface rounded-xl border border-border px-4 animate-fade-in-up hover-lift"
            style={{ animationDelay: `${(mealGroupCount + 1) * 60}ms` }}
          >
            {standalone.map((entry) => (
              <DiaryEntry key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-10 animate-fade-in-up">
            <p className="text-text-muted text-sm">
              {isToday ? "No entries yet today." : "No entries for this day."}
            </p>
            {isToday && (
              <p className="text-text-muted text-xs mt-1">
                Add something you ate below
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile: fixed bottom dock */}
      {isToday && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 bg-input-dock-bg backdrop-blur-xl border-t border-border p-3 z-40">
          <div className="max-w-lg mx-auto">
            <FoodInput date={today} />
          </div>
        </div>
      )}

      {/* Desktop: inline input area */}
      {isToday && (
        <div className="hidden md:block mt-6 animate-fade-in-up" style={{ animationDelay: `${(mealGroupCount + 2) * 60}ms` }}>
          <div className="bg-bg-surface rounded-2xl border border-border p-5 hover-lift">
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-medium mb-3">
              Add food
            </p>
            <FoodInput date={today} />
          </div>
        </div>
      )}
    </div>
  );
}
