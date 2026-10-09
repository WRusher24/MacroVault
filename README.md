# MacroVault

A production-ready, mobile-first platform for tracking calories, macros and
cut / bulk / maintenance goals. Built for fitness enthusiasts who want a fast,
distraction-free experience on their phone.

MacroVault ships with a **1,000-item food database**, a **Mifflin-St Jeor TDEE
calculator**, flexible **structured meals and one-tap quick logging**, and a
**cumulative deficit/surplus engine** for every plan you run. It deliberately
avoids volatile weight charts in favour of calm, meaningful progress numbers.

---

## Feature highlights

- **Multi-user auth** — email + password with bcrypt hashing, opaque session
  cookies, and 100% per-user data isolation.
- **Four themes** — Light Minimalist, Dark Modern, Warm Sepia, and Cool Slate,
  switchable instantly from Settings with no page reload or layout shift.
- **Mobile-first UI** — fixed thumb-friendly bottom navigation
  (Log · Plans · Foods · Settings), large touch targets, safe-area aware.
- **TDEE calculator** — BMR via Mifflin-St Jeor, activity multiplier, optional
  lean-mass (Katch-McArdle) cross-check, and live deficit/surplus projections.
- **Cut / Bulk / Maintain plans** — create, close, archive and reactivate.
  Plans are optional; tracking works fine without one.
- **1,000 seeded foods** — Proteins, Grains, Fruits, Vegetables, Dairy, Fats,
  Snacks and Prepared Foods, all stored per 100 g.
- **Custom foods** — add your own items, private to your account.
- **Smart suggestions** — your top 3 most frequently logged foods, one tap away.
- **Flexible logging** — structured meal containers (Breakfast, Lunch, Dinner,
  Snacks, or custom) *and* quick single-item logging to the day.
- **Daily archive** — every finished day rolls into the History view.
- **Plan progress** — cumulative deficit/surplus, days in deficit/surplus and
  estimated fat mass change, with no weight-chart anxiety.

---

## Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Actions, Turbopack) |
| Language   | TypeScript (strict)                                |
| Styling    | Tailwind CSS v4 with a CSS-variable theme engine   |
| Database   | Neon PostgreSQL                                    |
| ORM        | Drizzle ORM + drizzle-kit migrations               |
| Auth       | bcryptjs + database-backed session cookies         |
| Validation | Zod                                                |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
copy .env.example .env.local      # Windows
# cp .env.example .env.local      # macOS / Linux
# -> then edit DATABASE_URL and SESSION_SECRET

# 3. Create the schema and load the 1,000 foods
npm run db:setup

# 4. Run the app
npm run dev
```

Open <http://localhost:3000>, create an account, and start logging.

> Full setup, database and Vercel deployment instructions live in
> [`DEPLOYS_GUIDE.md`](./DEPLOYS_GUIDE.md).
> A walkthrough of every screen is in [`USER_GUIDE.md`](./USER_GUIDE.md).

---

## npm scripts

| Script                | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `npm run dev`         | Start the development server                                       |
| `npm run build`       | Production build                                                   |
| `npm run start`       | Serve the production build                                         |
| `npm run typecheck`   | `tsc --noEmit`                                                     |
| `npm run db:generate` | Generate SQL migrations from the Drizzle schema                    |
| `npm run db:migrate`  | Apply migrations to the database                                   |
| `npm run db:push`     | Push the schema directly (no migration files)                      |
| `npm run db:seed`     | Load all 1,000 foods from `foods_seed.json`                        |
| `npm run db:seed:sql` | Load foods by executing `foods_seed.sql` instead                   |
| `npm run db:setup`    | Migrate + seed in one step                                         |
| `npm run db:verify`   | Run the schema/seed test suite against an in-memory Postgres (PGlite) |
| `npm run db:studio`   | Open Drizzle Studio                                                |

---

## Repository layout

```
MacroVault V2/
├─ foods_seed.json            # 1,000 foods (JSON, source of truth for seeding)
├─ foods_seed.sql             # Same dataset as an executable SQL script
├─ drizzle/                   # Generated SQL migrations
├─ scripts/
│  ├─ migrate.ts              # Applies migrations
│  ├─ seed.ts                 # Seeds from foods_seed.json
│  ├─ seed-sql.ts             # Seeds from foods_seed.sql
│  └─ verify-db.ts            # In-memory schema + seed verification
└─ src/
   ├─ app/
   │  ├─ (auth)/              # /login, /register
   │  ├─ (app)/               # authenticated shell + pages
   │  │  ├─ dashboard/        # daily log, meals, quick add
   │  │  ├─ foods/            # search, browse, custom foods
   │  │  ├─ plans/            # list, new (TDEE + goal), detail progress
   │  │  ├─ history/          # daily archive
   │  │  └─ settings/         # body metrics, theme, account
   │  ├─ layout.tsx           # theme bootstrap + fonts
   │  └─ globals.css          # theme engine + Tailwind tokens
   ├─ components/             # UI primitives + feature components
   ├─ lib/
   │  ├─ actions/             # server actions (auth, foods, log, plans)
   │  ├─ auth/                # password hashing + sessions
   │  ├─ calc/tdee.ts         # BMR/TDEE/plan math
   │  ├─ data/                # read-only query layer
   │  ├─ db/                  # Drizzle client + schema
   │  ├─ constants.ts         # activity levels, categories, themes
   │  ├─ dates.ts             # date-only helpers
   │  ├─ utils.ts             # cn(), numeric helpers
   │  └─ validation.ts        # Zod schemas
   └─ proxy.ts                # route protection (Next 16 "proxy")
```

---

## Data model

| Table         | Purpose                                                        |
| ------------- | -------------------------------------------------------------- |
| `users`       | Accounts (email, bcrypt hash, display name)                    |
| `sessions`    | Hashed session tokens with expiry                              |
| `profiles`    | Body metrics + cached BMR/TDEE (1:1 with a user)               |
| `foods`       | Shared seed foods **and** per-user custom foods                |
| `plans`       | Cut / bulk / maintain plans with status lifecycle              |
| `meals`       | Named meal containers per day                                  |
| `log_entries` | Individual food portions (snapshots macros at log time)        |

Full column definitions are in [`src/lib/db/schema.ts`](./src/lib/db/schema.ts).

---

## The six operational rules, and where they live

1. **Auth & isolation** — `src/lib/auth/*`, `src/lib/db/schema.ts`, every query
   in `src/lib/data/*` is scoped by `user_id`.
2. **TDEE & plan calculator** — `src/lib/calc/tdee.ts`,
   `src/components/plans/PlanForm.tsx`.
3. **Food database & seeding** — `foods_seed.json`, `scripts/seed.ts`,
   `src/components/foods/*`.
4. **Logging** — `src/lib/actions/log.ts`,
   `src/components/FoodPicker.tsx`, `src/components/log/*`.
5. **Plan progress** — `computePlanProgress()` in `src/lib/calc/tdee.ts`,
   rendered in `src/app/(app)/plans/[id]/page.tsx`.
6. **Docs** — `DEPLOYS_GUIDE.md` and `USER_GUIDE.md` in the project root.
