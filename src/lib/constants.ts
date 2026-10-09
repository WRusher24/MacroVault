export type Gender = "male" | "female";
export type GoalType = "cut" | "bulk" | "maintain";
export type PlanStatus = "active" | "closed" | "archived";
export type ThemeId = "light" | "dark" | "sepia" | "ice";

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export type ActivityLevel = {
  value: string;
  label: string;
  description: string;
  factor: number;
};

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description: "Little or no exercise, desk job",
    factor: 1.2,
  },
  {
    value: "light",
    label: "Lightly active",
    description: "Light exercise 1-3 days per week",
    factor: 1.375,
  },
  {
    value: "moderate",
    label: "Moderately active",
    description: "Moderate exercise 3-5 days per week",
    factor: 1.55,
  },
  {
    value: "active",
    label: "Very active",
    description: "Hard exercise 6-7 days per week",
    factor: 1.725,
  },
  {
    value: "athlete",
    label: "Extra active",
    description: "Very hard training or physical job",
    factor: 1.9,
  },
];

export function activityFactor(value: string): number {
  return ACTIVITY_LEVELS.find((level) => level.value === value)?.factor ?? 1.55;
}

export function activityLabel(value: string): string {
  return ACTIVITY_LEVELS.find((level) => level.value === value)?.label ?? "Moderately active";
}

export const FOOD_CATEGORIES = [
  "Proteins",
  "Grains",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Fats",
  "Snacks",
  "Prepared Foods",
  "Beverages",
] as const;

export const MEAL_PRESETS = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;

export const THEMES: {
  id: ThemeId;
  label: string;
  description: string;
  swatch: string[];
}[] = [
  {
    id: "light",
    label: "Light Minimalist",
    description: "Crisp whites, soft grays, dark slate text",
    swatch: ["#f6f7f9", "#ffffff", "#16a34a", "#141a24"],
  },
  {
    id: "dark",
    label: "Dark Modern",
    description: "Deep charcoal with high-contrast accents",
    swatch: ["#0b1017", "#121a25", "#34d399", "#e7edf3"],
  },
  {
    id: "sepia",
    label: "Warm Sepia",
    description: "Soft warm paper with earthy brown tones",
    swatch: ["#f3ead8", "#fbf5e9", "#a2582a", "#4a3b2a"],
  },
  {
    id: "ice",
    label: "Cool Slate",
    description: "Subtle blue-gray, modern tech aesthetic",
    swatch: ["#eaeff5", "#ffffff", "#2f6fb0", "#1b2735"],
  },
];

export const KCAL_PER_KG_FAT = 7700;

export const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "cut", label: "Cut (lose fat)" },
  { value: "bulk", label: "Bulk (gain mass)" },
  { value: "maintain", label: "Maintain" },
];
