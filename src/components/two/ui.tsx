import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={cn("h-11 w-11", className)} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="two-logo-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-rose)" />
          <stop offset="100%" stopColor="var(--color-rose-deep)" />
        </linearGradient>
        <linearGradient id="two-logo-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-lavender-deep)" />
          <stop offset="100%" stopColor="var(--color-lavender)" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="var(--color-paper)" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="17.25" fill="none" stroke="var(--color-line)" strokeWidth="1.5" />
      <circle cx="26" cy="32" r="11.5" fill="none" stroke="url(#two-logo-a)" strokeWidth="3.5" />
      <circle cx="38" cy="32" r="11.5" fill="none" stroke="url(#two-logo-b)" strokeWidth="3.5" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Logo className={compact ? "h-9 w-9" : undefined} />
      <div>
        <p className={cn("font-display leading-none tracking-tight text-ink", compact ? "text-base" : "text-lg")}>
          TWO OF US
        </p>
        {!compact ? <p className="mt-1 text-xs text-muted">Every question brings you closer.</p> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "soft" | "ghost" | "quiet" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-rose-deep text-paper shadow-[0_1px_2px_rgb(0_0_0/0.08)] hover:brightness-110 active:brightness-95",
  soft: "bg-lavender text-ink hover:brightness-[0.97] active:brightness-95",
  ghost: "border border-line bg-paper text-ink hover:border-rose/60 hover:bg-cream",
  quiet: "text-muted hover:text-ink hover:bg-cream",
  danger: "bg-rose-deep text-paper hover:brightness-110",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-7 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  loading = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150",
        "active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("h-4 w-4 animate-spin", className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  as: Tag = "section",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
  interactive?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-card)] border border-line bg-paper p-5 shadow-[var(--shadow-soft)]",
        interactive && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl leading-tight">{title}</h2>
        {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "rose" | "lavender" | "sage" | "amber";
  className?: string;
}) {
  const tones = {
    neutral: "bg-cream text-muted border-line",
    rose: "bg-blush text-ink border-transparent",
    lavender: "bg-lavender text-ink border-transparent",
    sage: "bg-sage text-ink border-transparent",
    amber: "bg-amber text-ink border-transparent",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

const FIELD_BASE =
  "w-full rounded-2xl border border-line bg-paper px-4 text-base text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-4 focus:ring-rose/10";

export function Field({
  label,
  hint,
  error,
  className,
  ...props
}: { label: string; hint?: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-2 text-sm text-ink">
      <span className="font-medium">{label}</span>
      <input className={cn(FIELD_BASE, "min-h-11", error && "border-rose", className)} {...props} />
      {hint && !error ? <span className="block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="block text-xs text-rose-deep">{error}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  className,
  ...props
}: { label?: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-2 text-sm text-ink">
      {label ? <span className="font-medium">{label}</span> : null}
      <textarea className={cn(FIELD_BASE, "resize-y py-3 leading-relaxed", className)} {...props} />
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 py-1",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span
          aria-hidden="true"
          className={cn(
            "block h-6 w-11 rounded-full border transition-colors duration-200",
            checked ? "border-transparent bg-rose-deep" : "border-line bg-cream",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-paper shadow-sm transition-transform duration-200",
            checked && "translate-x-5",
          )}
        />
      </span>
    </label>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-full border border-line bg-paper p-1", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 flex-1 rounded-full px-4 text-sm font-medium transition-colors",
              active ? "bg-ink text-paper" : "text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export function Avatar({
  name,
  src,
  size = "md",
  className,
  ring = false,
}: {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}) {
  const sizes = {
    xs: "h-7 w-7 text-xs",
    sm: "h-9 w-9 text-sm",
    md: "h-12 w-12 text-lg",
    lg: "h-16 w-16 text-2xl",
    xl: "h-24 w-24 text-4xl",
  }[size];
  const base = cn(
    "shrink-0 rounded-full object-cover",
    sizes,
    ring && "ring-2 ring-paper",
    className,
  );
  if (src) return <img src={src} alt="" className={base} />;
  return (
    <span
      className={cn(
        base,
        "grid place-items-center bg-gradient-to-br from-blush to-lavender font-display text-ink",
      )}
      aria-hidden="true"
    >
      {name.trim().slice(0, 1).toUpperCase() || "?"}
    </span>
  );
}

export function AvatarPair({
  a,
  b,
  size = "md",
}: {
  a: { name: string; src?: string | null };
  b: { name: string; src?: string | null };
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex items-center">
      <Avatar name={a.name} src={a.src} size={size} ring />
      <Avatar name={b.name} src={b.src} size={size} ring className="-ml-3" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export function ErrorNote({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-2xl border border-rose/30 bg-blush px-4 py-3 text-sm leading-relaxed text-ink"
    >
      {children}
    </p>
  );
}

export function SuccessNote({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <p
      role="status"
      className="rounded-2xl border border-sage-deep/25 bg-sage px-4 py-3 text-sm leading-relaxed text-ink"
    >
      {children}
    </p>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-paper/60 px-6 py-10 text-center">
      {icon ? (
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-cream text-muted">
          {icon}
        </span>
      ) : null}
      <p className="font-display text-xl">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{body}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-2xl", className)} aria-hidden="true" />;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label={label}>
      <Skeleton className="h-9 w-44 rounded-full" />
      <Skeleton className="h-32 rounded-[var(--radius-card)]" />
      <Skeleton className="h-24 rounded-[var(--radius-card)]" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-[var(--radius-card)]" />
        <Skeleton className="h-24 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}

export function Splash() {
  return (
    <div className="surface-wash grid min-h-dvh place-items-center bg-cream px-6 text-ink">
      <div className="rise text-center">
        <Logo className="float-slow mx-auto h-16 w-16" />
        <h1 className="mt-5 font-display text-4xl tracking-tight">TWO OF US</h1>
        <p className="mt-2 text-sm text-muted">Every question brings you closer.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data display                                                        */
/* ------------------------------------------------------------------ */

export function StatTile({
  value,
  label,
  hint,
  tone = "neutral",
}: {
  value: ReactNode;
  label: string;
  hint?: string;
  tone?: "neutral" | "rose" | "lavender" | "sage";
}) {
  const tones = {
    neutral: "bg-paper",
    rose: "bg-blush",
    lavender: "bg-lavender",
    sage: "bg-sage",
  }[tone];
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-line p-4", tones)}>
      <p className="font-display text-3xl leading-none tabular-nums">{value}</p>
      <p className="mt-2 text-sm font-medium">{label}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-line", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-rose to-rose-deep transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function pretty(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function relative(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return pretty(iso);
}

export async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that picture.");
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
  bitmap.close();
  const url = canvas.toDataURL("image/jpeg", 0.82);
  if (url.length > 120000) throw new Error("That picture is still too large.");
  return url;
}
