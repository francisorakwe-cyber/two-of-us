import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  CircleUser,
  Home,
  LayoutGrid,
  LogOut,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { getShell, saveSettings } from "@/lib/two/api";
import { Avatar, ErrorNote, Logo, Splash, Wordmark, cn } from "./ui";

export type ShellData = Extract<Awaited<ReturnType<typeof getShell>>, { ok: true }>;

const ShellContext = createContext<ShellData | null>(null);

export function useShell() {
  const value = useContext(ShellContext);
  if (!value) throw new Error("Shell missing");
  return value;
}

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/games", label: "Games", icon: LayoutGrid },
  { to: "/us", label: "Us", icon: Users },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: CircleUser },
] as const;

const SIDE_LINKS = [
  { to: "/daily", label: "Daily question" },
  { to: "/notes", label: "Notes" },
  { to: "/favorites", label: "Favourites" },
  { to: "/invites", label: "Invitations" },
  { to: "/settings", label: "Settings" },
] as const;

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("two-theme", next ? "dark" : "light");
    void saveSettings({ data: { theme: next ? "dark" : "light" } }).catch(() => undefined);
  }
  return { dark, toggle };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [shell, setShell] = useState<ShellData | null>(null);
  const [error, setError] = useState("");
  const { dark, toggle } = useTheme();

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
        const isDark = theme === "dark" || (theme === "system" && prefersDark);
        document.documentElement.dataset.theme = isDark ? "dark" : "light";
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

  return (
    <ShellContext.Provider value={shell}>
      <div className="min-h-dvh bg-cream text-ink">
        <div className="mx-auto flex min-h-dvh w-full max-w-[92rem]">
          {/* Desktop sidebar */}
          <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col justify-between border-r border-line px-5 py-7 lg:flex">
            <div>
              <Link to="/" aria-label="Home">
                <Wordmark />
              </Link>
              <nav className="mt-8 space-y-1" aria-label="Main">
                {TABS.map((tab) => {
                  const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.to}
                      to={tab.to}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                        active ? "bg-paper text-ink shadow-[var(--shadow-soft)]" : "text-muted hover:bg-paper/60 hover:text-ink",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      {tab.label}
                      {tab.to === "/us" && shell.incoming > 0 ? (
                        <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1.5 text-[11px] font-semibold text-paper">
                          {shell.incoming}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-7 border-t border-line pt-5">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-muted">More</p>
                <nav className="mt-2 space-y-0.5" aria-label="Secondary">
                  {SIDE_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm transition-colors",
                        pathname.startsWith(link.to) ? "text-ink" : "text-muted hover:text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
                  className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper text-muted transition-colors hover:text-ink"
                >
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link
                  to="/settings"
                  aria-label="Settings"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper text-muted transition-colors hover:text-ink"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut().catch(() => undefined)}
                  aria-label="Sign out"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper text-muted transition-colors hover:text-ink"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              <Link to="/profile" className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3">
                <Avatar name={shell.profile.displayName} src={shell.profile.avatar} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{shell.profile.displayName}</span>
                  <span className="block truncate text-xs text-muted">@{shell.profile.username}</span>
                </span>
              </Link>
            </div>
          </aside>

          {/* Main column */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line glass px-5 py-3 lg:hidden">
              <Link to="/" aria-label="Home" className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <span className="font-display text-sm tracking-tight">TWO OF US</span>
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted"
                >
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link
                  to="/notifications"
                  aria-label={`Notifications${shell.unread ? `, ${shell.unread} unread` : ""}`}
                  className="relative grid h-9 w-9 place-items-center rounded-full text-muted"
                >
                  <Bell className="h-4 w-4" />
                  {shell.unread > 0 ? (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose" />
                  ) : null}
                </Link>
              </div>
            </header>

            <main className={cn("flex-1 px-5 pt-6 lg:px-10 lg:pt-10", bare ? "pb-10" : "pb-28 lg:pb-14")}>
              <div className="mx-auto w-full max-w-3xl">{children}</div>
            </main>

            {/* Mobile tab bar */}
            {!bare && (
              <nav
                className="fixed inset-x-0 bottom-0 z-20 border-t border-line glass lg:hidden"
                aria-label="Main"
              >
                <ul className="mx-auto grid max-w-lg grid-cols-5">
                  {TABS.map((tab) => {
                    const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
                    const Icon = tab.icon;
                    return (
                      <li key={tab.to}>
                        <Link
                          to={tab.to}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                            active ? "text-rose-deep" : "text-muted",
                          )}
                        >
                          <Icon className={cn("h-5 w-5", active && "scale-110")} aria-hidden="true" />
                          {tab.label}
                          {tab.to === "/us" && shell.incoming > 0 ? (
                            <span className="absolute right-[22%] top-2.5 h-2 w-2 rounded-full bg-rose" />
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </ShellContext.Provider>
  );
}

export function PageHeader({
  title,
  subtitle,
  back,
  action,
}: {
  title: string;
  subtitle?: string;
  back?: { to: string; label: string };
  action?: ReactNode;
}) {
  return (
    <header className="mb-6">
      {back ? (
        <Link to={back.to} className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink">
          <span aria-hidden="true">←</span> {back.label}
        </Link>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight tracking-tight lg:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
