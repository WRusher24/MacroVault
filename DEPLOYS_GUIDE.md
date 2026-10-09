# MacroVault — Deployment & Operations Guide

This guide covers everything needed to run MacroVault locally, load the
1,000-food database, and deploy to production on Vercel with Neon PostgreSQL.

---

## 1. Prerequisites

- **Node.js 20 or newer** (developed on Node 24).
- **npm 10+** (or pnpm/yarn — the scripts are npm-first).
- A free **[Neon](https://neon.tech)** account (PostgreSQL, serverless).
- Optional: a **Vercel** account for deployment, and **Git** for version control.

---

## 2. Create the Neon database

1. Sign in to Neon and click **New Project**.
2. Choose a region close to your users and create the project.
3. Open **Connection Details** and copy the **Pooled connection** string. It
   looks like:

   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. Copy the **direct (non-pooled)** connection string too — it is useful for
   running migrations if the pooler gives you trouble.

> MacroVault sets `prepare: false` on the client so it works with Neon's
> PgBouncer pooler out of the box. SSL is enabled automatically for any
> non-localhost host.

---

## 3. Configure environment variables

```bash
copy .env.example .env.local     # Windows
cp .env.example .env.local       # macOS / Linux
```

Fill in:

| Variable             | Required | Notes                                                                 |
| -------------------- | -------- | --------------------------------------------------------------------- |
| `DATABASE_URL`       | yes      | Neon connection string. Use the **pooled** one for the app runtime.   |
| `SESSION_SECRET`     | yes      | 32+ random characters. Generate with the command below.               |
| `NEXT_PUBLIC_APP_URL`| no       | Canonical URL, e.g. `https://macrovault.vercel.app`.                   |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `drizzle.config.ts` loads `.env.local` first, then `.env`, so migrations and
> seeds see the same values as the app.

---

## 4. Create the schema and seed the foods (the big one)

MacroVault ships the food dataset in two interchangeable formats:

- **`foods_seed.json`** — 1,000 items, the source of truth.
- **`foods_seed.sql`** — the same rows as an executable PostgreSQL script.

### Option A — one command (recommended)

```bash
npm run db:setup      # runs db:migrate then db:seed
```

This will:

1. Apply every SQL file in `drizzle/` (tables, indexes, foreign keys).
2. Read `foods_seed.json` and insert all 1,000 foods in batches of 200.
3. Skip any rows that already exist (`ON CONFLICT (id) DO NOTHING`) and reset
   the `foods_id_seq` sequence so custom foods get correct ids.

### Option B — run the steps individually

```bash
npm run db:generate   # regenerate migrations from src/lib/db/schema.ts (optional)
npm run db:migrate    # apply migrations
npm run db:seed       # seed from foods_seed.json
```

### Option C — seed from the SQL file

```bash
npm run db:seed:sql   # executes foods_seed.sql statement by statement
```

The seed is **idempotent**: rerunning it never duplicates foods or errors on an
existing row.

### Expected dataset

| Category        | Count |
| --------------- | ----: |
| Proteins        |   200 |
| Grains          |   200 |
| Vegetables      |   200 |
| Dairy           |   140 |
| Fats            |   122 |
| Fruits          |   100 |
| Snacks          |    24 |
| Prepared Foods  |    14 |
| **Total**       |**1000** |

Every row stores `calories`, `protein_g`, `carbs_g` and `fat_g` **per 100 g**.

---

## 5. Run and test locally

```bash
npm run dev
```

Then visit <http://localhost:3000>:

1. Create an account (open registration — every account is isolated).
2. Go to **Settings**, enter your body metrics, and confirm the live BMR/TDEE.
3. Go to **Foods** and search for “chicken” — you should see seeded results.
4. Go to **Plans → New plan**, build a cut or bulk plan, and watch the live
   projection.
5. On **Log**, use **Quick log** and create a **Meal** to add several foods.

Useful checks:

```bash
npm run typecheck      # TypeScript
npm run build          # production build (no database required to compile)
npm run db:verify      # spins up an in-memory Postgres and validates the
                       # schema, the 1,000-food seed and the core queries
```

`db:verify` is a great pre-deploy smoke test: it does not touch your Neon
database and needs no environment variables.

---

## 6. Deploy to Vercel

### 6.1 Push to Git

```bash
git init
git add .
git commit -m "MacroVault"
git remote add origin https://github.com/<you>/macrovault.git
git push -u origin main
```

### 6.2 Import the project on Vercel

1. In Vercel, click **Add New → Project** and import the repository.
2. Framework preset should auto-detect **Next.js**. Leave the build command as
   `next build` and the output settings as default.
3. Add the **Environment Variables** (Production and Preview):
   - `DATABASE_URL` — your **pooled** Neon string.
   - `SESSION_SECRET` — your generated secret.
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL.
4. Click **Deploy**.

### 6.3 Prepare the production database

The first deploy only ships code. Create the schema and seed the foods against
the production database **once**, from your machine:

```bash
# point at production for a single command, without touching .env.local
# Windows PowerShell:
$env:DATABASE_URL="postgresql://...prod..."; npm run db:setup

# macOS / Linux:
DATABASE_URL="postgresql://...prod..." npm run db:setup
```

Because the seed is idempotent, you can safely rerun it after future deploys if
new foods are added to `foods_seed.json`.

> Tip: create a Neon **branch** for preview environments and point the Vercel
> Preview `DATABASE_URL` at it, so previews never touch production data.

### 6.4 Runtime notes

- **Node runtime**: all data access and auth run on the Node.js runtime
  (server actions), which is the default. No Edge-only constraints apply.
- **Connection pooling**: the app uses a small `postgres.js` pool per serverless
  instance plus Neon's pooler. This is the recommended combination.
- **Sessions**: stored in the `sessions` table; cookies are `httpOnly`,
  `SameSite=Lax`, and `Secure` in production.

---

## 7. Managing migrations over time

Whenever you change `src/lib/db/schema.ts`:

```bash
npm run db:generate    # writes a new drizzle/000X_*.sql file
git add drizzle && git commit -m "db: <change>"
npm run db:migrate     # apply to the target database
```

Commit the generated migration files — they are part of the deployment.

---

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `DATABASE_URL is not set` | You are missing `.env.local`. Copy `.env.example` and fill it in. |
| `self signed certificate` / SSL error | Ensure the host is not `localhost` and includes `sslmode=require`. The client forces SSL for remote hosts. |
| Migrations hang behind a pooler | Use the **direct** (non-pooled) Neon string for `npm run db:migrate`, then switch back to the pooled string for the app. |
| Seed looks incomplete | Run `npm run db:seed` again — it is idempotent, or run `npm run db:verify` to confirm the dataset is internally consistent. |
| `tsx` / `drizzle-kit` cannot start | Some npm versions gate install scripts. Run `npm rebuild esbuild` or `npm install-scripts approve esbuild` and retry. |
| Build fails on Vercel with a DB error | The app compiles without a database. Confirm the error is not from a custom top-level query; MacroVault initialises the client lazily. |
| Foods search returns nothing | Confirm the seed ran (`SELECT count(*) FROM foods;`). The app needs the 1,000 seed rows to be present. |

---

## 9. Security checklist

- [x] Passwords hashed with bcrypt (12 rounds); never returned to the client.
- [x] Session tokens are random 256-bit values; only their SHA-256 hash is
      stored, so a database leak does not expose live sessions.
- [x] Cookies are `httpOnly`, `SameSite=Lax`, `Secure` in production.
- [x] Every user-scoped query filters by the authenticated `user_id`.
- [x] Custom foods are visible only to their owner; seeds are shared read-only.
- [x] All mutations are validated with Zod on the server.
- [x] Route protection via `src/proxy.ts` plus a server-side `requireUser()`
      guard in the authenticated layout.
