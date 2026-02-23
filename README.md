# nootbook

AI-powered nutrition tracker. Log what you ate in plain English and get instant calorie and macro breakdowns.

## How it works

Type something like "2 eggs, toast with butter, and a coffee" and nootbook uses LLMs to parse your input into structured nutrition data. For branded or restaurant items, it searches the web for accurate calorie counts. Everything is saved to your account so you can track daily intake against your goals.

## Features

- **Natural language food logging** — just describe what you ate
- **Smart AI parsing** — uses Claude Haiku for fast estimates on common foods, with web search fallback for branded/restaurant items
- **Daily dashboard** — calories, protein, carbs, fat with progress bars against your targets
- **Macro + micronutrient tracking** — expandable detail views for fiber, sugar, sodium, iron
- **Meal grouping** — entries are grouped into meals, saveable as templates for quick re-logging
- **Calorie calculator** — built-in BMR calculator (Mifflin-St Jeor) to help set daily targets
- **Responsive design** — mobile-first with a sidebar layout on desktop

## Tech stack

- **Next.js 16** (App Router, Server Components)
- **Supabase** (Postgres, Auth, Row Level Security)
- **Claude API** (Haiku 4.5 + web search tool)
- **Tailwind CSS v4**

## License

MIT
