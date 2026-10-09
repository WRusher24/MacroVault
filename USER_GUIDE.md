# MacroVault — User Guide

Welcome to MacroVault. This walkthrough covers every screen, from creating your
account to reading your plan progress. The app is designed to be used one-handed
on a phone; everything below is a couple of taps away.

---

## Contents

1. [Creating an account](#1-creating-an-account)
2. [Signing in and out](#2-signing-in-and-out)
3. [The bottom navigation](#3-the-bottom-navigation)
4. [Setting your body metrics (TDEE)](#4-setting-your-body-metrics-tdee)
5. [Choosing a theme](#5-choosing-a-theme)
6. [Creating a cut / bulk / maintain plan](#6-creating-a-cut--bulk--maintain-plan)
7. [Browsing and searching the food database](#7-browsing-and-searching-the-food-database)
8. [Adding your own custom foods](#8-adding-your-own-custom-foods)
9. [Logging food — Quick log](#9-logging-food--quick-log)
10. [Logging food — Structured meals](#10-logging-food--structured-meals)
11. [Editing and deleting entries](#11-editing-and-deleting-entries)
12. [Reviewing the daily archive](#12-reviewing-the-daily-archive)
13. [Reading your plan progress](#13-reading-your-plan-progress)
14. [Tracking without a plan (maintenance)](#14-tracking-without-a-plan-maintenance)
15. [FAQ and tips](#15-faq-and-tips)

---

## 1. Creating an account

1. Open the app and tap **Create an account**.
2. Enter a **name**, your **email**, and a **password** (at least 8 characters).
3. Tap **Create account**.

Registration is open and instant. Every account gets a completely separate data
container: your logs, custom foods, meals and plans are never visible to anyone
else. Passwords are hashed with bcrypt and are never stored in plain text.

## 2. Signing in and out

- **Sign in** with your email and password on the welcome screen.
- **Sign out** from **Settings → Session → Sign out**. Sessions last 30 days and
  are stored in a secure, HTTP-only cookie.

## 3. The bottom navigation

A fixed bar at the bottom of every screen switches between the four main areas:

| Tab          | What it does                                                    |
| ------------ | --------------------------------------------------------------- |
| **Log**      | Today's dashboard: calories, macros, meals and quick logging.   |
| **Plans**    | Create and manage cut / bulk / maintain plans.                  |
| **Foods**    | Search the database and manage your custom foods.               |
| **Settings** | Body metrics, theme, and account details.                       |

---

## 4. Setting your body metrics (TDEE)

Open **Settings**. The top card, **Body metrics & TDEE**, asks for:

- **Gender** — Male or Female.
- **Age** in years.
- **Height** in centimetres.
- **Weight** in kilograms.
- **Body fat %** — optional, but improves accuracy.
- **Activity level** — from *Sedentary* to *Extra active*.

As you type, the three stat tiles update live:

- **BMR (Basal Metabolic Rate)** — the energy you'd burn at complete rest,
  calculated with the **Mifflin-St Jeor** equation:
  - Men: `10 × weight + 6.25 × height − 5 × age + 5`
  - Women: `10 × weight + 6.25 × height − 5 × age − 161`
- **TDEE (Total Daily Energy Expenditure)** — your BMR multiplied by an
  activity factor (1.2 → 1.9). This is your **maintenance** calorie level: eat
  around this number and your weight holds steady.
- **Lean mass** — body weight minus fat mass (shown when you provide body fat %).

Tap **Save metrics** to store them. Your TDEE becomes the default calorie goal
on the dashboard when you have no active plan, and the baseline for plan math.

## 5. Choosing a theme

Also in **Settings**, the **Appearance** card offers four themes. Tap one to
apply it instantly — no reload, no flicker:

1. **Light Minimalist** — crisp whites and soft grays.
2. **Dark Modern** — deep charcoal with a high-contrast accent.
3. **Warm Sepia** — soft paper background with earthy browns.
4. **Cool Slate** — subtle blue-gray, modern tech feel.

Your choice is remembered on the device and applied before the page paints.

---

## 6. Creating a cut / bulk / maintain plan

Open the **Plans** tab and tap **New plan** (or **Create plan** from the
dashboard). This screen is a self-contained TDEE calculator and goal builder.

**Step 1 — Body metrics.** The fields are pre-filled from Settings if you've
saved them. Adjust anything and the BMR/TDEE tiles update live.

**Step 2 — Your goal.**

- **Plan name** — e.g. “Summer cut 2026”.
- **Start date** — defaults to today.
- **Target weight (kg)** *or* **Target body fat %** — set at least one so the
  app can estimate a timeframe. If you give a target body fat %, MacroVault
  converts it to a target weight by holding your lean mass constant.
- **Daily calories** — the intake you intend to follow. Shortcut buttons help:
  - **Set to maintenance** — uses your calculated TDEE.
  - **−500 kcal** — a classic moderate deficit.
  - **+300 kcal** — a lean surplus.
- **Notes** — anything you want to remember.

**Step 3 — Live projection.** As you type, the **Live projection** card updates:

- **Deficit / Surplus / Maintenance** badge.
- **Exact magnitude** — how many kcal per day above or below TDEE.
- **Weekly and monthly change** — estimated body-weight change in kg.
- **Estimated timeframe** — weeks (and months) to reach your target.
- **Warnings** — for example, if your calories point the wrong way for your
  goal, or if the deficit is aggressive (over 1,000 kcal/day).

Tap **Start this plan** to activate it. Plans are **optional** — you can use the
app for general tracking without ever creating one.

**Managing plans.** From the Plans tab or a plan's detail page you can:

- **Close** a plan — freezes its metrics for history.
- **Archive** a plan — keeps a historical snapshot.
- **Reactivate** a closed or archived plan.
- **Delete** a plan — permanent; your logged foods are untouched.

---

## 7. Browsing and searching the food database

Open the **Foods** tab. MacroVault ships with **1,000 foods**, each stored per
100 g with calories, protein, carbs and fat.

- **Search** by name in the search bar (e.g. `chicken`, `oats`, `apple`).
- **Filter** by category chips: Proteins, Grains, Fruits, Vegetables, Dairy,
  Fats, Snacks and Prepared Foods. Each chip shows how many items it contains.
- Every result card shows the food's per-100 g macros and a **Log** button that
  jumps straight to portion entry for today.

## 8. Adding your own custom foods

At the bottom of the **Foods** tab, open **Add a custom food**:

1. **Food name** — e.g. “Grandma's protein loaf”.
2. **Category** — pick the closest one.
3. **Calories, Protein, Carbs, Fat** — the values **per 100 g**.

Tap **Add custom food**. It appears under **My custom foods**, marked with a
**Custom** badge, and is visible **only to your account**. You can log it like
any other food, or delete it with the trash icon (existing logs keep their
snapshot and are unaffected).

---

## 9. Logging food — Quick log

Use Quick log when you want to record a single item without opening a meal.

1. On the **Log** tab, tap **Quick log a food** (or the **Top picks** chips at
   the top of the sheet).
2. Search for a food, or tap one of your **top 3 most frequently logged foods**
   for instant access.
3. Enter the **weight in grams** — type a value or tap a preset (50/100/150/200).
4. Check the live calorie/macro preview and tap **Add**.

The item is added to today's total and appears under **Quick items**. Your quick
logging habits feed the **Top picks** rail, which always surfaces your three
most-logged foods.

## 10. Logging food — Structured meals

Use meals to organize a day into Breakfast, Lunch, Dinner, Snacks, or anything
you like.

1. On the **Log** tab, tap **New meal** and choose a preset (Breakfast, Lunch,
   Dinner, Snacks) or type a custom name.
2. The meal card appears. Tap **Add food** inside it.
3. Search or use **Top picks**, choose the weight in grams, and tap **Add**.
4. Repeat for as many items as you want. The meal header and footer show the
   running **calories and P/C/F totals**.

All meals plus your quick items sum into the day's **Calories**, **Macros** and
progress ring at the top of the Log tab.

## 11. Editing and deleting entries

- Tap the **pencil** icon on any logged item to change its **gram weight**; the
  macros recalculate automatically.
- Tap the **trash** icon to remove an item.
- Tap the **trash** icon on a meal header to delete the whole meal and its items.

Use the **‹ ›** arrows at the top of the Log tab to review or fix past days.

---

## 12. Reviewing the daily archive

Open the calendar icon in the Log header (or **History**). Every date on which
you logged anything appears here, newest first, with:

- Total **calories** and **P/C/F** for the day.
- The number of items logged.
- A summary of your **days logged**, **average calories** and **average protein**.

Tap any day to jump back to that date's full log.

## 13. Reading your plan progress

Open a plan from the **Plans** tab to see its full picture — no weight charts,
just calm, meaningful numbers:

- **Plan setup** — daily calories, TDEE at creation, start weight and target.
- **Cumulative progress** over the plan's duration:
  - **Total deficit or surplus** in kcal since the plan began.
  - **Estimated fat mass change** from the calorie math (7,700 kcal ≈ 1 kg).
  - **Deficit days** and **Surplus days** for tracked days.
  - **Progress %** toward your estimated fat-loss or gain goal.
  - **Average intake** across tracked days.
- **Recent days** — your last ten tracked days with each day's surplus/deficit,
  tap through to the full log.

If you chose a target, the detail page also shows the **estimated weeks/months**
to reach it based on your daily intake.

---

## 14. Tracking without a plan (maintenance)

A plan is **not required**. With no active plan:

- The dashboard uses your **TDEE from Settings** as the calorie goal and shows
  a **“No active plan”** banner with a shortcut to create one.
- You can log foods, build meals, and archive history exactly as normal.
- When you're ready, create a plan in a few taps — logging continues seamlessly.

This makes MacroVault equally useful for maintenance, intuitive eating, or a
simple “what am I actually eating?” phase.

---

## 15. FAQ and tips

**Do I need to weigh everything in grams?**
Grams are the most accurate, but any value works — enter your best estimate.
Preset buttons (50/100/150/200 g) make common portions fast.

**Where does the food data come from?**
`foods_seed.json` — 1,000 items with per-100 g macros. You can add anything
missing as a custom food.

**Are my custom foods shared with other users?**
No. They are visible only to your account, as are all your logs and plans.

**What's the difference between BMR, TDEE and my plan calories?**
BMR is energy at rest; TDEE is BMR scaled by your activity (maintenance). Your
plan calories are the number you actually aim to eat — below TDEE for a cut,
above for a bulk, equal for maintenance.

**How accurate is the fat-mass estimate?**
It's a calorie-math estimate (7,700 kcal per kg of fat) and a helpful trend
indicator, not a medical measurement. Individual results vary with water,
muscle change, and adherence.

**Can I change themes later?**
Anytime — **Settings → Appearance**. The change applies instantly.

**How do I start over?**
Delete the plans you no longer want, remove any custom foods, and keep logging.
Past daily entries stay in **History** for your records.

---

_Track the trend, not the noise. MacroVault is here to make the numbers calm and
the decisions easy._
