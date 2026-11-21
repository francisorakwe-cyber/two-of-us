import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={cn("h-11 w-11", className)} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="var(--color-paper)" />
      <circle cx="26" cy="32" r="12" fill="none" stroke="var(--color-rose)" strokeWidth="3.5" />
      <circle cx="38" cy="32" r="12" fill="none" stroke="var(--color-lavender-deep)" strokeWidth="3.5" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <div>
        <p className="font-display text-lg leading-none text-ink">TWO OF US</p>
        <p className="mt-1 text-xs text-muted">Every question brings you closer.</p>
      </div>
    </div>
  );
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" }) {
  const look = {
    primary: "bg-rose-deep text-paper",
    soft: "bg-lavender text-ink",
    ghost: "border border-line bg-paper text-ink",
  }[variant];
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition active:scale-[0.99] disabled:opacity-50",
        look,
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-2 text-sm text-ink">
      <span className="font-medium">{label}</span>
      <input
        className="min-h-11 w-full rounded-2xl border border-line bg-paper px-4 text-base text-ink outline-none focus:border-rose"
        {...props}
      />
    </label>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl border border-line bg-paper p-5", className)}>{children}</section>;
}

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  if (src) {
    return <img src={src} alt="" className={cn("h-12 w-12 rounded-full object-cover", className)} />;
  }
  return (
    <span className={cn("grid h-12 w-12 place-items-center rounded-full bg-blush font-display text-lg text-ink", className)}>
      {name.slice(0, 1).toUpperCase() || "?"}
    </span>
  );
}

export function ErrorNote({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="rounded-2xl bg-blush px-4 py-3 text-sm text-ink">{children}</p>;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={label}>
      <div className="h-8 w-40 rounded-full bg-blush" />
      <div className="h-28 rounded-3xl bg-paper" />
      <div className="h-28 rounded-3xl bg-paper" />
    </div>
  );
}

export function pretty(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
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

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-6 text-ink">
      <div className="rise text-center">
        <Logo className="mx-auto h-16 w-16" />
        <h1 className="mt-5 font-display text-4xl">TWO OF US</h1>
        <p className="mt-2 text-sm text-muted">Every question brings you closer.</p>
      </div>
    </div>
  );
}
