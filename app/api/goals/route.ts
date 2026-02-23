import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("noot_daily_goals")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get the existing goals row (RLS scopes to current user)
    const { data: existing } = await supabase
      .from("noot_daily_goals")
      .select("id")
      .limit(1)
      .single();

    if (!existing) {
      // Create if doesn't exist
      const { data, error } = await supabase
        .from("noot_daily_goals")
        .insert({
          calories_target: body.calories_target,
          protein_pct: body.protein_pct,
          carbs_pct: body.carbs_pct,
          fat_pct: body.fat_pct,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    // Update existing
    const { data, error } = await supabase
      .from("noot_daily_goals")
      .update({
        calories_target: body.calories_target,
        protein_pct: body.protein_pct,
        carbs_pct: body.carbs_pct,
        fat_pct: body.fat_pct,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating goals:", error);
    return NextResponse.json(
      { error: "Failed to update goals" },
      { status: 500 }
    );
  }
}
