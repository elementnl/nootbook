# nootbook

AI-powered nutrition tracker. Log food in natural language, get instant calorie and macro breakdowns.

Built with Next.js, Supabase, and Claude.

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Run the SQL migration in `supabase-auth-migration.sql` on your Supabase project
5. `npm run dev`

## License

MIT
