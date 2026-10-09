import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { n } from "@/lib/utils";

export type ProfileView = {
  gender: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct: number | null;
  activityLevel: string;
  bmr: number | null;
  tdee: number | null;
  updatedAt: Date | null;
};

export async function getProfile(userId: number): Promise<ProfileView | null> {
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    gender: row.gender,
    age: row.age,
    heightCm: n(row.heightCm),
    weightKg: n(row.weightKg),
    bodyFatPct: row.bodyFatPct === null ? null : n(row.bodyFatPct),
    activityLevel: row.activityLevel,
    bmr: row.bmr === null ? null : n(row.bmr),
    tdee: row.tdee === null ? null : n(row.tdee),
    updatedAt: row.updatedAt,
  };
}
