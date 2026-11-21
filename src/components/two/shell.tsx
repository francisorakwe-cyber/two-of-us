import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, CircleUser, Home, LayoutGrid, Users } from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getShell } from "@/lib/two/api";
import { ErrorNote, Splash, Wordmark, cn } from "./ui";

export type ShellData = Extract<Awaited<ReturnType<typeof getShell>>, { ok: true }>;

const ShellContext = createContext<ShellData | null>(null);

export function useShell() {
  const value = useContext(ShellContext);
  if (!value) throw new Error("Shell missing");
  return value;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [shell, setShell] = useState<ShellData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let live = true;
    getShell()
      .then((result) => {
        if (!live) return;
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setShell(result);
        const theme = result.profile.theme;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const dark = theme === "dark" || (theme === "system" && prefersDark);
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        if (theme === "system") localStorage.removeItem("two-theme");
        else localStorage.setItem("two-theme", theme);
      })
      .catch((reason: unknown) => {
        if (live) setError(reason instanceof Error ? reason.message : "Could not open your space.");
      });
    return () => {
      live = false;
    };
  }, [user?.id, pathname]);

  if (isPending || (user && !shell && !error)) return <Splash />;
  if (!user) return <RedirectToSignIn to="/welcome" />;
  if (!shell) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream px-6">
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  }
  if (!shell.profile.username) return <Navigate to="/setup" />;

  const bare = pathname.startsWith("/play");
  const tabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/games", label: "Games", icon: LayoutGrid },
    { to: "/us", label: "Us", icon: Users, dot: shell.incoming > 0 },
    { to: "/progress", label: "Progress", icon: BarChart3 },
    { to: "/profile", label: "Profile", icon: CircleUser },
  ] as const;

  return (
    <ShellContext.Provider value={shell}>
      <div className="min-h-dvh bg-cream text-ink xl:grid xl:grid-cols-[1fr_30rem_1fr]">
        <aside className="hidden xl:flex xl:flex-col xl:justify-between xl:px-12 xl:py-12">
          <div className="max-w-sm">
            <Wordmark />
            <ol className="mt-10 space-y-4 text-sm text-muted">
              <li>1. Answer on your own.</li>
              <li>2. Their words stay hidden.</li>
              <li>3. Reveal only when you both have answered.</li>
            </ol>
          </div>
          <p className="max-w-xs text-sm text-muted">Made for two people, including the long-distance kind.</p>
        </aside>
        <div className="flex min-h-dvh flex-col xl:border-x xl:border-line">
          <div className={cn("flex-1 px-5 pt-6", bare ? "pb-8" : "pb-28")}>{children}</div>
          {!bare && (
            <nav className="sticky bottom-0 z-10 border-t border-line bg-paper/95 backdrop-blur">
              <ul className="grid grid-cols-5">
                {tabs.map((tab) => {
                  const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
                  const Icon = tab.icon;
                  return (
                    <li key={tab.to}>
                      <Link
                        to={tab.to}
                        className={cn(
                          "relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs",
                          active ? "text-rose-deep" : "text-muted",
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        {tab.label}
                        {"dot" in tab && tab.dot ? <span className="absolute right-5 top-3 h-2 w-2 rounded-full bg-rose" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
        <aside className="hidden xl:block" />
      </div>
    </ShellContext.Provider>
  );
}

export function TopLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <Link to={href} className="text-sm text-muted">
        Back
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl">{label}</h1>
        <Link to="/notifications" aria-label="Notifications" className="text-muted">
          <Bell className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
