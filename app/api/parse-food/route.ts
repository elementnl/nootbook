import { NextResponse } from "next/server";
import { parseFood } from "@/lib/ai";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    const result = await parseFood(input);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error parsing food:", error);
    return NextResponse.json(
      { error: "Failed to parse food input" },
      { status: 500 }
    );
  }
}
