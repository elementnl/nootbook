import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getTodayEastern } from "@/lib/date";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || getTodayEastern();

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("noot_food_entries")
    .select("*, noot_meals(name)")
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, meal_name, date } = body;

    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const entryDate = date || getTodayEastern();

    let meal_id: string | null = null;

    // If there's a meal name, create the meal first
    if (meal_name) {
      const { data: meal, error: mealError } = await supabase
        .from("noot_meals")
        .insert({ name: meal_name, is_template: false, user_id: user.id })
        .select()
        .single();

      if (mealError) {
        return NextResponse.json(
          { error: mealError.message },
          { status: 500 }
        );
      }
      meal_id = meal.id;
    }

    // Insert all food entries
    const entries = items.map((item: Record<string, unknown>) => ({
      date: entryDate,
      meal_id,
      name: item.name,
      quantity: item.quantity,
      quantity_grams: item.quantity_grams,
      calories: item.calories,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      fiber_g: item.fiber_g,
      iron_mg: item.iron_mg,
      sodium_mg: item.sodium_mg,
      sugar_g: item.sugar_g,
      raw_ai_response: item,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from("noot_food_entries")
      .insert(entries)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating food entries:", error);
    return NextResponse.json(
      { error: "Failed to create food entries" },
      { status: 500 }
    );
  }
}
