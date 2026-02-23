export interface FoodEntry {
  id: string;
  date: string;
  meal_id: string | null;
  name: string;
  quantity: string;
  quantity_grams: number | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  iron_mg: number | null;
  sodium_mg: number | null;
  sugar_g: number | null;
  raw_ai_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  name: string;
  is_template: boolean;
  created_at: string;
}

export interface DailyGoals {
  id: string;
  calories_target: number;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
  created_at: string;
  updated_at: string;
}

export interface ParsedFoodItem {
  name: string;
  quantity: string;
  quantity_grams: number | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  iron_mg: number;
  sodium_mg: number;
  sugar_g: number;
}

export interface ParsedFoodResponse {
  meal_name?: string;
  items: ParsedFoodItem[];
}
