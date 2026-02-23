import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("noot_food_entries")
      .update({
        name: body.name,
        quantity: body.quantity,
        quantity_grams: body.quantity_grams,
        calories: body.calories,
        protein_g: body.protein_g,
        carbs_g: body.carbs_g,
        fat_g: body.fat_g,
        fiber_g: body.fiber_g,
        iron_mg: body.iron_mg,
        sodium_mg: body.sodium_mg,
        sugar_g: body.sugar_g,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating food entry:", error);
    return NextResponse.json(
      { error: "Failed to update food entry" },
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

    const { error } = await supabase
      .from("noot_food_entries")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting food entry:", error);
    return NextResponse.json(
      { error: "Failed to delete food entry" },
      { status: 500 }
    );
  }
}
