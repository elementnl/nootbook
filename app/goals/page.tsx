export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase/server";
import { DailyGoals } from "@/lib/types";
import GoalsForm from "@/components/GoalsForm";

export default async function GoalsPage() {
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("noot_daily_goals")
    .select("*")
    .limit(1)
    .single();

  const goals: DailyGoals | null = data;

  return (
    <div className="max-w-lg md:max-w-2xl mx-auto px-4 md:px-8 pb-24 md:pb-8 pt-6 md:pt-8">
      <div className="animate-fade-in-up">
        <h1 className="font-display text-xl md:text-2xl font-bold text-text-primary tracking-tight">
          Daily Goals
        </h1>
        <p className="text-sm text-text-muted mt-1 mb-6">
          Set your calorie and macronutrient targets
        </p>
      </div>
      <GoalsForm goals={goals} />
    </div>
  );
}
