import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getTodayEastern } from "@/lib/date";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("noot_meals")
    .select("*, noot_food_entries(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Save meal as reusable template
export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("noot_meals")
      .update({ is_template: true })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving meal as template:", error);
    return NextResponse.json(
      { error: "Failed to save meal as template" },
      { status: 500 }
    );
  }
}

// "Use meal" - clones a template's entries into today's diary
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = getTodayEastern();

    // Get the template meal and its entries
    const { data: template, error: templateError } = await supabase
      .from("noot_meals")
      .select("*, noot_food_entries(*)")
      .eq("id", id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Meal template not found" },
        { status: 404 }
      );
    }

    // Create a new meal instance for today
    const { data: newMeal, error: mealError } = await supabase
      .from("noot_meals")
      .insert({ name: template.name, is_template: false, servings: template.servings ?? 1, user_id: user.id })
      .select()
      .single();

    if (mealError) {
      return NextResponse.json({ error: mealError.message }, { status: 500 });
    }

    // Clone entries
    const entries = template.noot_food_entries.map(
      (entry: Record<string, unknown>) => ({
        date: today,
        meal_id: newMeal.id,
        name: entry.name,
        quantity: entry.quantity,
        quantity_grams: entry.quantity_grams,
        calories: entry.calories,
        protein_g: entry.protein_g,
        carbs_g: entry.carbs_g,
        fat_g: entry.fat_g,
        fiber_g: entry.fiber_g,
        iron_mg: entry.iron_mg,
        sodium_mg: entry.sodium_mg,
        sugar_g: entry.sugar_g,
        raw_ai_response: entry.raw_ai_response,
        user_id: user.id,
      })
    );

    const { data, error } = await supabase
      .from("noot_food_entries")
      .insert(entries)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meal: newMeal, entries: data });
  } catch (error) {
    console.error("Error using meal template:", error);
    return NextResponse.json(
      { error: "Failed to use meal template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("noot_meals").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return NextResponse.json(
      { error: "Failed to delete meal" },
      { status: 500 }
    );
  }
}
