import { z } from "zod";
import { FOOD_CATEGORIES, GENDERS } from "@/lib/constants";

const genderValues = GENDERS.map((g) => g.value) as [string, ...string[]];

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  gender: z.enum(genderValues),
  age: z.coerce.number().int().min(10, "Age looks too low").max(100, "Age looks too high"),
  heightCm: z.coerce.number().min(80, "Height looks too low").max(260, "Height looks too high"),
  weightKg: z.coerce.number().min(25, "Weight looks too low").max(400, "Weight looks too high"),
  bodyFatPct: z
    .union([z.coerce.number().min(2).max(70), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  activityLevel: z.string().min(1),
});

export const customFoodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  category: z.enum(FOOD_CATEGORIES as unknown as [string, ...string[]]),
  calories: z.coerce.number().min(0).max(2000),
  proteinG: z.coerce.number().min(0).max(100),
  carbsG: z.coerce.number().min(0).max(100),
  fatG: z.coerce.number().min(0).max(100),
});

export const planSchema = z.object({
  name: z.string().trim().min(1, "Give your plan a name").max(120),
  goalType: z.enum(["cut", "bulk", "maintain"]),
  startWeightKg: z.coerce.number().min(25).max(400),
  targetWeightKg: z
    .union([z.coerce.number().min(25).max(400), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  startBodyFatPct: z
    .union([z.coerce.number().min(2).max(70), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  targetBodyFatPct: z
    .union([z.coerce.number().min(2).max(70), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  dailyCalories: z.coerce.number().int().min(500).max(10000),
  tdee: z.coerce.number().int().min(500).max(20000),
  startedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid start date"),
  notes: z.string().trim().max(500).optional().default(""),
});

export const mealSchema = z.object({
  name: z.string().trim().min(1, "Name your meal").max(60),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const logEntrySchema = z.object({
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  foodId: z.coerce.number().int().positive(),
  grams: z.coerce.number().min(1, "Enter a weight in grams").max(5000, "That seems too high"),
  mealId: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.literal("none")])
    .optional()
    .transform((value) =>
      value === "" || value === "none" || value === undefined ? null : value
    ),
});

export const quickLogSchema = logEntrySchema;

export const deleteEntrySchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const planIdSchema = z.object({ id: z.coerce.number().int().positive() });

export const foodIdSchema = z.object({ id: z.coerce.number().int().positive() });

export const pageDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Flatten a ZodError into a single human-readable message. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
