# read-me

### Quick start

This is a **Next.js (TypeScript) + Supabase** app.

1. Set environment vars

```bash
cp .env.local.example .env.local
```

→ open .env.local and fill the required values
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

2. Go to the frontend directory

```bash
cd frontend
```

3. Install & run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and you’re set.

> Note: never commit `.env.local` (it should be gitignored).
