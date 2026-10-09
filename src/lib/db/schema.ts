import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * MacroVault relational schema (PostgreSQL / Neon).
 *
 * Isolation model: every user-owned row carries `user_id` and every query is
 * scoped by the authenticated user id. The `foods` table is shared: the 1,000
 * seeded items have `is_custom = false` and `created_by = NULL`, while user
 * created foods carry the owning user id and `is_custom = true`.
 */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
);

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 hash of the opaque session token stored in the cookie.
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
);

export const profiles = pgTable("profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  gender: varchar("gender", { length: 16 }).notNull().default("male"),
  age: integer("age").notNull().default(30),
  heightCm: numeric("height_cm", { precision: 5, scale: 1 }).notNull().default("170"),
  weightKg: numeric("weight_kg", { precision: 5, scale: 1 }).notNull().default("70"),
  bodyFatPct: numeric("body_fat_pct", { precision: 4, scale: 1 }),
  activityLevel: varchar("activity_level", { length: 32 })
    .notNull()
    .default("moderate"),
  bmr: numeric("bmr", { precision: 7, scale: 1 }),
  tdee: numeric("tdee", { precision: 7, scale: 1 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const foods = pgTable(
  "foods",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    calories: integer("calories").notNull(),
    proteinG: numeric("protein_g", { precision: 6, scale: 1 }).notNull().default("0"),
    carbsG: numeric("carbs_g", { precision: 6, scale: 1 }).notNull().default("0"),
    fatG: numeric("fat_g", { precision: 6, scale: 1 }).notNull().default("0"),
    isCustom: boolean("is_custom").notNull().default(false),
    createdBy: integer("created_by").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("foods_name_idx").on(table.name),
    index("foods_category_idx").on(table.category),
    index("foods_created_by_idx").on(table.createdBy),
  ]
);

export const plans = pgTable(
  "plans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    goalType: varchar("goal_type", { length: 16 }).notNull(), // cut | bulk | maintain
    startWeightKg: numeric("start_weight_kg", { precision: 5, scale: 1 }).notNull(),
    targetWeightKg: numeric("target_weight_kg", { precision: 5, scale: 1 }),
    startBodyFatPct: numeric("start_body_fat_pct", { precision: 4, scale: 1 }),
    targetBodyFatPct: numeric("target_body_fat_pct", { precision: 4, scale: 1 }),
    dailyCalories: integer("daily_calories").notNull(),
    tdeeAtCreation: integer("tdee_at_creation").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"), // active | closed | archived
    startedAt: date("started_at").notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("plans_user_id_idx").on(table.userId),
    index("plans_status_idx").on(table.status),
  ]
);

export const meals = pgTable(
  "meals",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    name: varchar("name", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("meals_user_date_idx").on(table.userId, table.logDate),
  ]
);

export const logEntries = pgTable(
  "log_entries",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    mealId: integer("meal_id").references(() => meals.id, {
      onDelete: "cascade",
    }),
    foodId: integer("food_id").references(() => foods.id, {
      onDelete: "set null",
    }),
    // Snapshotted food name keeps history stable even if foods change later.
    foodName: varchar("food_name", { length: 255 }).notNull(),
    grams: numeric("grams", { precision: 7, scale: 1 }).notNull(),
    calories: numeric("calories", { precision: 8, scale: 1 }).notNull(),
    proteinG: numeric("protein_g", { precision: 7, scale: 1 }).notNull(),
    carbsG: numeric("carbs_g", { precision: 7, scale: 1 }).notNull(),
    fatG: numeric("fat_g", { precision: 7, scale: 1 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("log_entries_user_date_idx").on(table.userId, table.logDate),
    index("log_entries_meal_idx").on(table.mealId),
    index("log_entries_food_idx").on(table.foodId),
  ]
);

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Food = typeof foods.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type LogEntry = typeof logEntries.$inferSelect;
