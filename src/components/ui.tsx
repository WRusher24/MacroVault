import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/* ============================ Buttons ============================ */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-sm hover:opacity-90 active:opacity-95",
  secondary: "bg-primary-soft text-ink hover:opacity-80",
  outline: "border border-line bg-surface text-ink hover:bg-elevated",
  ghost: "text-muted hover:bg-elevated hover:text-ink",
  danger: "bg-negative text-white hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string
): string {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-colors tap",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props} />
  );
}

/* ============================ Card ============================ */

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ============================ Form fields ============================ */

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-xs font-medium text-muted", className)}
    >
      {children}
    </label>
  );
}

export const inputClasses =
  "h-11 w-full rounded-xl border border-line bg-elevated px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-ring";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClasses, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClasses, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(inputClasses, "h-auto min-h-20 py-2.5", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

/* ============================ Progress ============================ */

export function ProgressBar({
  value,
  max,
  tone = "primary",
  className,
}: {
  value: number;
  max: number;
  tone?: "primary" | "positive" | "negative" | "warning";
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const toneClass =
    tone === "positive"
      ? "bg-positive"
      : tone === "negative"
        ? "bg-negative"
        : tone === "warning"
          ? "bg-warning"
          : "bg-primary";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-line", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", toneClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function MacroBar({
  proteinG,
  carbsG,
  fatG,
  className,
}: {
  proteinG: number;
  carbsG: number;
  fatG: number;
  className?: string;
}) {
  const pCal = proteinG * 4;
  const cCal = carbsG * 4;
  const fCal = fatG * 9;
  const total = pCal + cCal + fCal;
  const pct = (v: number) => (total <= 0 ? 0 : (v / total) * 100);
  return (
    <div className={cn("flex h-2 w-full overflow-hidden rounded-full bg-line", className)}>
      <div className="h-full bg-[#3b82f6]" style={{ width: `${pct(pCal)}%` }} />
      <div className="h-full bg-[#f59e0b]" style={{ width: `${pct(cCal)}%` }} />
      <div className="h-full bg-[#ef4444]" style={{ width: `${pct(fCal)}%` }} />
    </div>
  );
}

/* ============================ Misc ============================ */

export function Stat({
  label,
  value,
  sub,
  tone = "ink",
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "ink" | "primary" | "positive" | "negative" | "warning";
  className?: string;
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "positive"
        ? "text-positive"
        : tone === "negative"
          ? "text-negative"
          : tone === "warning"
            ? "text-warning"
            : "text-ink";
  return (
    <div className={cn("rounded-xl border border-line bg-surface p-3", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", toneClass)}>{value}</p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted">{sub}</p> : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "positive" | "negative" | "warning";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-elevated text-muted border-line",
    primary: "bg-primary-soft text-primary border-transparent",
    positive: "bg-positive/10 text-positive border-transparent",
    negative: "bg-negative/10 text-negative border-transparent",
    warning: "bg-warning/10 text-warning border-transparent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-10 text-center">
      {icon ? <div className="mb-3 text-muted">{icon}</div> : null}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
