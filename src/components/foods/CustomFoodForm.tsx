"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCustomFoodAction } from "@/lib/actions/foods";
import { emptyFormState } from "@/lib/actions/state";
import { FOOD_CATEGORIES } from "@/lib/constants";
import { Button, Field, Input, Select } from "@/components/ui";

export function CustomFoodForm() {
  const [state, formAction, pending] = useActionState(
    createCustomFoodAction,
    emptyFormState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <Field label="Food name" htmlFor="name">
        <Input
          id="name"
          name="name"
          dir="auto"
          placeholder="e.g. Homemade protein bar"
          required
          maxLength={120}
        />
      </Field>

      <Field label="Category" htmlFor="category">
        <Select id="category" name="category" defaultValue="Proteins" required>
          {FOOD_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Calories (per 100 g)" htmlFor="calories">
          <Input
            id="calories"
            name="calories"
            inputMode="decimal"
            placeholder="kcal"
            required
          />
        </Field>
        <Field label="Protein (g)" htmlFor="proteinG">
          <Input id="proteinG" name="proteinG" inputMode="decimal" placeholder="0" required />
        </Field>
        <Field label="Carbs (g)" htmlFor="carbsG">
          <Input id="carbsG" name="carbsG" inputMode="decimal" placeholder="0" required />
        </Field>
        <Field label="Fat (g)" htmlFor="fatG">
          <Input id="fatG" name="fatG" inputMode="decimal" placeholder="0" required />
        </Field>
      </div>

      {state.error ? (
        <p className="rounded-xl bg-negative/10 px-3 py-2 text-xs font-medium text-negative">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl bg-positive/10 px-3 py-2 text-xs font-medium text-positive">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Adding…" : "Add custom food"}
      </Button>
    </form>
  );
}
