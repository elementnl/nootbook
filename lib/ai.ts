import Anthropic from "@anthropic-ai/sdk";
import { ParsedFoodResponse } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Step 1: Fast call — estimate nutrition + flag confidence
const FAST_SYSTEM_PROMPT = `You are a nutrition data assistant. The user will describe food they ate.

Return a JSON object with nutrition data AND a "needs_search" boolean.

Set "needs_search": true ONLY when the input contains:
- A specific brand name (e.g., "Dave's Killer Bread", "Chobani", "Fairlife", "Quest bar")
- A specific restaurant or chain (e.g., "Costco pizza", "Chili's mozzarella sticks", "McDonald's Big Mac")
- An uncommon or specialty food you're not confident about

Set "needs_search": false for common, generic foods like:
- Basic ingredients: chicken, rice, eggs, bread, milk, yogurt, fruits, vegetables
- Simple descriptions: "bowl of rice", "2 eggs", "banana", "greek yogurt"
- Home-cooked meals with listed ingredients: "chicken stir fry with 200g chicken, vegetables"
- Common ethnic foods: roti, dal, paneer, tacos, pasta, sushi (generic)

When "needs_search" is false, provide your best nutrition estimate directly.
When "needs_search" is true, still provide your best guess — it will be refined with a web search.

## Response format

### Home-cooked meals (break down ingredients):
{
  "needs_search": false,
  "meal_name": "Sweet and Sour Chicken",
  "items": [
    { "name": "chicken breast", "quantity": "200g", "quantity_grams": 200, "calories": 330, "protein_g": 62, "carbs_g": 0, "fat_g": 7.2, "fiber_g": 0, "iron_mg": 1.4, "sodium_mg": 130, "sugar_g": 0 }
  ]
}
Include cooking fats (oil, butter) as separate items when they'd realistically be used.

### Store-bought / restaurant / pre-made items — return as SINGLE item:
{
  "needs_search": true,
  "items": [
    { "name": "Costco Cheese Pizza", "quantity": "1 slice (~300g)", "quantity_grams": 300, "calories": 700, "protein_g": 28, "carbs_g": 70, "fat_g": 28, "fiber_g": 3, "iron_mg": 4, "sodium_mg": 1200, "sugar_g": 8 }
  ]
}

### Multiple independent items:
Return each as its own item in the "items" array. No "meal_name". Set "needs_search" based on whether ANY item needs lookup.

## CRITICAL — Quantity math
When the user specifies a quantity (e.g., "3 slices", "2 eggs"), ALL nutrition values MUST reflect the TOTAL for that entire quantity. Multiply per-unit values by the count.

## Rules
- Use USDA nutritional data as your reference for common foods.
- If the user provides a weight (e.g., "150g"), calculate nutrition for that exact weight.
- If the user provides a vague description (e.g., "a bowl of rice"), use a reasonable default serving size.
- Err on the side of slightly overestimating rather than underestimating.
- Always return valid JSON. No markdown fences. No commentary. Just the JSON object.
- All numeric values should be numbers, not strings.`;

// Step 2: Web search call — only used when needs_search is true
const SEARCH_SYSTEM_PROMPT = `You are a nutrition data assistant. Use the web search tool to look up accurate nutrition information for the foods described.

Search for the specific brand, restaurant, or product mentioned. Use the search results to provide accurate nutrition data.

After searching, return ONLY a valid JSON object with this structure:
{
  "items": [
    { "name": "...", "quantity": "...", "quantity_grams": number, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number, "iron_mg": number, "sodium_mg": number, "sugar_g": number }
  ]
}

Or with a meal_name if it's a home-cooked meal:
{
  "meal_name": "...",
  "items": [...]
}

## CRITICAL — Quantity math
When the user specifies a quantity, ALL values MUST reflect the TOTAL. Look up per-unit nutrition, then multiply by the count.

## Rules
- For branded items, search for the exact brand and product name.
- For restaurant items, search for that restaurant's specific nutrition info.
- Do NOT break restaurant/store-bought items into ingredients — return as single items.
- Err on the side of slightly overestimating rather than underestimating.
- Your final message must contain ONLY the JSON object. No other text.
- All numeric values should be numbers, not strings.`;

function extractJson(text: string): Record<string, unknown> {
  let jsonStr = text;

  // Try to find JSON in markdown code fences first
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  // Find the first { and last } to extract JSON
  const firstBrace = jsonStr.indexOf("{");
  const lastBrace = jsonStr.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No valid JSON found in AI response");
  }
  jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);

  return JSON.parse(jsonStr);
}

export async function parseFood(input: string): Promise<ParsedFoodResponse> {
  const startTime = Date.now();

  // Step 1: Fast call — get nutrition estimate + confidence flag
  console.log(`[parseFood] Step 1: Fast estimate for "${input}"`);

  const fastMessage = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: FAST_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: input },
      { role: "assistant", content: "{" },
    ],
  });

  const fastRaw =
    fastMessage.content[0].type === "text" ? fastMessage.content[0].text : "";
  const fastJson = extractJson("{" + fastRaw);
  const needsSearch = fastJson.needs_search === true;

  const step1Time = Date.now() - startTime;
  console.log(
    `[parseFood] Step 1 done in ${step1Time}ms — needs_search: ${needsSearch}`
  );

  if (!needsSearch) {
    // Remove the needs_search flag before returning
    const { needs_search, ...result } = fastJson;
    console.log(`[parseFood] Returning fast result:`, JSON.stringify(result));

    if (Array.isArray(result)) {
      return { items: result } as ParsedFoodResponse;
    }
    return result as unknown as ParsedFoodResponse;
  }

  // Step 2: Web search for branded/restaurant items
  console.log(`[parseFood] Step 2: Web search for "${input}"`);

  const searchMessage = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8096,
    system: SEARCH_SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      },
    ],
    messages: [{ role: "user", content: input }],
  });

  // Log search queries used
  const searchQueries = searchMessage.content
    .filter(
      (block): block is Anthropic.ServerToolUseBlock =>
        block.type === "server_tool_use" && block.name === "web_search"
    )
    .map((block) => (block.input as { query: string }).query);
  console.log(`[parseFood] Web searches performed:`, searchQueries);

  // Find the last text block which contains the JSON
  const textBlocks = searchMessage.content.filter(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (textBlocks.length === 0) {
    // Fallback to the fast estimate if web search produced no text
    console.log(`[parseFood] No text from web search — falling back to fast result`);
    const { needs_search, ...result } = fastJson;
    return result as unknown as ParsedFoodResponse;
  }

  const lastText = textBlocks[textBlocks.length - 1].text;
  const searchResult = extractJson(lastText);

  const totalTime = Date.now() - startTime;
  console.log(
    `[parseFood] Step 2 done in ${totalTime}ms total. Result:`,
    JSON.stringify(searchResult)
  );

  if (Array.isArray(searchResult)) {
    return { items: searchResult } as ParsedFoodResponse;
  }
  return searchResult as unknown as ParsedFoodResponse;
}
