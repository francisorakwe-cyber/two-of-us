import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  Bell,
  Bookmark,
  Check,
  Compass,
  Eye,
  Flame,
  Heart,
  Laugh,
  Moon,
  Search,
  Shuffle,
  Sparkles,
  Star,
  Sunrise,
  Users,
  Zap,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { authClient, signOut } from "@/lib/auth/client";
import { greeting, shiftDay } from "@/lib/two/logic";
import { CATEGORIES } from "@/lib/two/categories";
import {
  addNote,
  adminAnnounce,
  adminOverview,
  adminSaveQuestion,
  adminSearchQuestions,
  adminSetActive,
  adminSetReport,
  claimStudio,
  completeChallenge,
  createFavoriteGame,
  createGame,
  deleteAccount,
  deleteNote,
  disconnectPartner,
  getHome,
  getProgress,
  getUs,
  inviteByEmail,
  listFavorites,
  listInvites,
  listNotes,
  listNotifications,
  markNotifications,
  respondInvite,
  saveProfile,
  saveSettings,
  searchPeople,
  sendInvite,
  submitDaily,
} from "@/lib/two/api";
import { useShell, PageHeader } from "./shell";
import { useToast } from "./toast";
import {
  Avatar,
  AvatarPair,
  Button,
  Card,
  EmptyState,
  ErrorNote,
  Field,
  Loading,
  Pill,
  ProgressBar,
  SectionHeading,
  SegmentedControl,
  StatTile,
  Switch,
  TextArea,
  cn,
  fileToDataUrl,
  pretty,
  relative,
} from "./ui";

const ICONS = { know: Compass, mirror: Eye, love: Sunrise, deep: Moon, fun: Laugh, rather: Shuffle, spark: Zap };

const CATEGORY_TONES: Record<string, string> = {
  know: "bg-lavender",
  mirror: "bg-blush",
  love: "bg-rose/20",
  deep: "bg-sage",
  fun: "bg-amber",
  rather: "bg-lavender",
  spark: "bg-blush",
};

function useLoader<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    load()
      .then((value) => {
        if (live) setData(value);
      })
      .catch((reason: unknown) => {
        if (live) setError(reason instanceof Error ? reason.message : "Something went wrong.");
      });
    return () => {
      live = false;
    };
    // deps are explicit at the call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, error, setData };
}

/* ================================================================== */
/* Home                                                                */
/* ================================================================== */

export function HomeScreen() {
  const shell = useShell();
  const { data, error } = useLoader(() => getHome(), []);
  if (!data && !error) return <Loading />;
  if (!data) return <ErrorNote>{error}</ErrorNote>;
  if (!data.ok) return <ErrorNote>{data.error}</ErrorNote>;

  const firstName = data.name.split(" ")[0] || data.name;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{greeting(new Date().getHours())}</p>
          <h1 className="mt-0.5 font-display text-3xl leading-tight tracking-tight lg:text-4xl">{firstName}</h1>
        </div>
        <Link
          to="/notifications"
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-rose/60"
        >
          <span className="sr-only">Notifications{shell.unread ? `, ${shell.unread} new` : ""}</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          {shell.unread > 0 ? (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose ring-2 ring-paper" />
          ) : null}
        </Link>
      </header>

      {data.announcement ? (
        <Card className="border-lavender-deep/20 bg-lavender">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-lavender-deep" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{data.announcement.title}</p>
              <p className="mt-1 text-sm leading-relaxed">{data.announcement.body}</p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Partner + streak */}
      {data.partner ? (
        <Card className="surface-wash">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <AvatarPair
                a={{ name: shell.profile.displayName, src: shell.profile.avatar }}
                b={{ name: data.partner.displayName, src: data.partner.avatar }}
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{data.partner.displayName}</p>
                <p className="truncate text-sm text-muted">Connected {pretty(data.partner.connectedAt)}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="flex items-center justify-end gap-1 font-display text-3xl leading-none tabular-nums">
                {data.streak > 0 ? <Flame className="h-5 w-5 text-rose" aria-hidden="true" /> : null}
                {data.streak}
              </p>
              <p className="mt-1 text-xs text-muted">day streak</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {data.streak > 0
              ? "Miss a day and it simply rests. Nothing is lost."
              : "Play when you feel like it. A missed day does not punish you."}
          </p>
        </Card>
      ) : (
        <Card className="surface-wash">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-paper text-rose-deep">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl leading-tight">Bring someone in.</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                One partner at a time. Both of you accept before anything is shared.
              </p>
            </div>
          </div>
          <Link
            to="/connect"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-rose-deep px-5 text-sm font-medium text-paper transition hover:brightness-110"
          >
            Find your partner <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      )}

      {/* Continue */}
      {data.continueGame ? (
        <Link to="/play/$gameId" params={{ gameId: data.continueGame.id }} className="block">
          <Card interactive className="border-rose/25 bg-blush">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-rose-deep">Continue</p>
                <p className="mt-1 font-display text-2xl leading-tight">{data.continueGame.label}</p>
                <p className="mt-1 text-sm text-muted">
                  {data.continueGame.mode === "turns" ? "Take turns" : "Answer together"}
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-rose-deep">
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </Card>
        </Link>
      ) : null}

      {/* Daily */}
      {data.daily ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Question of the day</p>
            {data.daily.submitted ? <Pill tone="sage">Answered</Pill> : <Pill tone="rose">New</Pill>}
          </div>
          <p className="mt-3 font-display text-2xl leading-snug">{data.daily.question.text}</p>
          <Link
            to="/daily"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-rose-deep"
          >
            {data.daily.submitted ? "See today's card" : "Answer it"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      ) : null}

      {/* Challenge */}
      {data.challenge ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Today's couple prompt</p>
            {data.challenge.done ? <Pill tone="sage">Done</Pill> : null}
          </div>
          <p className="mt-3 text-base leading-relaxed">{data.challenge.title}</p>
          <p className="mt-2 text-sm text-muted">
            {data.challenge.done ? "Marked done for today." : "Optional. Nothing happens if you skip it."}
          </p>
        </Card>
      ) : null}

      <Link
        to="/games"
        className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-rose-deep px-5 text-sm font-medium text-paper shadow-[var(--shadow-soft)] transition hover:brightness-110 active:scale-[0.99]"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Play together
      </Link>

      {data.recent.length > 0 ? (
        <div className="space-y-3">
          <SectionHeading title="Recent" />
          <ul className="space-y-2">
            {data.recent.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href || "/notifications"}
                  className="block rounded-2xl border border-line bg-paper px-4 py-3 transition-colors hover:border-rose/40"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{item.body}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* Games                                                               */
/* ================================================================== */

export function GamesScreen() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    return CATEGORIES.filter(
      (category) =>
        category.name.toLowerCase().includes(q) || category.blurb.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games"
        subtitle="Pick a set, then answer together or take turns. Nothing is revealed until you both submit."
      />

      <Link
        to="/games/$category"
        params={{ category: "mix" }}
        className="group relative block overflow-hidden rounded-[var(--radius-card)] bg-ink px-6 py-6 text-paper shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
      >
        <div className="surface-wash absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blush">Start here</p>
            <p className="mt-1.5 font-display text-2xl leading-tight">Random mix</p>
            <p className="mt-1 text-sm text-blush/90">A handful from across the whole deck.</p>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper/15 transition-transform group-hover:translate-x-0.5">
            <Shuffle className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </Link>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories"
          aria-label="Search categories"
          className="min-h-11 w-full rounded-full border border-line bg-paper pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-4 focus:ring-rose/10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="No categories match"
          body="Try a different word, or start with the random mix."
          action={
            <Button variant="ghost" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ul className="stagger space-y-2.5">
          {filtered.map((category) => {
            const Icon = ICONS[category.id];
            return (
              <li key={category.id}>
                <Link
                  to="/games/$category"
                  params={{ category: category.id }}
                  className="group flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-paper p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose/40 hover:shadow-[var(--shadow-soft)]"
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-ink",
                      CATEGORY_TONES[category.id] ?? "bg-lavender",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{category.name}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-muted">{category.blurb}</span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="rounded-2xl border border-line bg-paper/60 px-4 py-3 text-xs leading-relaxed text-muted">
        Two of Us is free. Sponsored placements, if they are added later, stay off question, reveal, and note
        screens.
      </p>
    </div>
  );
}

export function CategoryScreen({ category }: { category: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const known = category === "mix" || CATEGORIES.some((item) => item.id === category);
  const meta = CATEGORIES.find((item) => item.id === category);
  const [mode, setMode] = useState<"together" | "turns">("together");
  const [count, setCount] = useState<5 | 8 | 12>(8);
  const [difficulty, setDifficulty] = useState<"any" | "easy" | "medium" | "deep">("any");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!known) return <ErrorNote>That category does not exist.</ErrorNote>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={meta?.name ?? "Random mix"}
        subtitle={meta?.blurb ?? "Questions from every category, still private until you both answer."}
        back={{ to: "/games", label: "All games" }}
      />

      {category === "spark" ? (
        <Card className="border-lavender-deep/20 bg-lavender">
          <p className="text-sm leading-relaxed">
            Skip any card. Mature prompts stay off unless you are both 18 or older and have opted in under
            Privacy.
          </p>
        </Card>
      ) : null}

      <div>
        <p className="mb-2.5 text-sm font-medium">How you play</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "together", title: "Answer together", body: "Same question, either order." },
              { value: "turns", title: "Take turns", body: "One answers, then the other." },
            ] as const
          ).map((option) => {
            const active = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                aria-pressed={active}
                className={cn(
                  "min-h-24 rounded-[var(--radius-card)] border p-4 text-left transition-all",
                  active
                    ? "border-transparent bg-rose-deep text-paper shadow-[var(--shadow-soft)]"
                    : "border-line bg-paper hover:border-rose/40",
                )}
              >
                <span className="block font-medium">{option.title}</span>
                <span className={cn("mt-1 block text-sm", active ? "text-paper/80" : "text-muted")}>
                  {option.body}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-sm font-medium">How many questions</p>
        <SegmentedControl
          className="w-full"
          value={String(count)}
          onChange={(value) => setCount(Number(value) as 5 | 8 | 12)}
          options={[
            { value: "5", label: "5" },
            { value: "8", label: "8" },
            { value: "12", label: "12" },
          ]}
        />
      </div>

      <div>
        <p className="mb-2.5 text-sm font-medium">Depth</p>
        <div className="flex flex-wrap gap-2">
          {(["any", "easy", "medium", "deep"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(value)}
              aria-pressed={difficulty === value}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm capitalize transition-colors",
                difficulty === value
                  ? "border-transparent bg-blush text-ink"
                  : "border-line bg-paper text-muted hover:text-ink",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <Button
        className="w-full"
        size="lg"
        loading={busy}
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError("");
          void createGame({ data: { category, mode, count, difficulty } }).then((result) => {
            setBusy(false);
            if (!result.ok) {
              setError(result.error);
              toast.error(result.error);
              return;
            }
            void navigate({ to: "/play/$gameId", params: { gameId: result.id } });
          });
        }}
      >
        {busy ? "Starting…" : "Start this round"}
      </Button>
    </div>
  );
}

/* ================================================================== */
/* Us                                                                  */
/* ================================================================== */

export function UsScreen() {
  const { data, error } = useLoader(() => getUs(), []);
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load your space."}</ErrorNote>;

  return (
    <div className="space-y-6">
      <PageHeader title="Us" subtitle="Your shared space: who you are, what you have kept, and what you have played." />

      {data.partner ? (
        <Card className="surface-wash">
          <div className="flex items-center gap-4">
            <Avatar name={data.partner.displayName} src={data.partner.avatar} size="lg" />
            <div className="min-w-0">
              <p className="font-display text-2xl leading-tight">{data.partner.displayName}</p>
              <p className="mt-0.5 truncate text-sm text-muted">
                @{data.partner.username} · since {pretty(data.partner.connectedAt)}
              </p>
            </div>
          </div>
          {data.partner.bio ? <p className="mt-4 text-sm leading-relaxed">{data.partner.bio}</p> : null}
          <Link
            to="/partner"
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-rose-deep"
          >
            Partner profile <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      ) : (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No partner connected"
          body="Invite someone by username or email. Both of you accept before anything is shared."
          action={
            <Link
              to="/connect"
              className="inline-flex min-h-11 items-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper"
            >
              Send an invite
            </Link>
          }
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/notes"
          className="group rounded-[var(--radius-card)] border border-line bg-lavender p-4 transition-transform hover:-translate-y-0.5"
        >
          <Heart className="h-5 w-5 text-lavender-deep" aria-hidden="true" />
          <span className="mt-3 block font-medium">Notes</span>
          <span className="mt-0.5 block text-xs text-muted">Private to the two of you</span>
        </Link>
        <Link
          to="/favorites"
          className="group rounded-[var(--radius-card)] border border-line bg-blush p-4 transition-transform hover:-translate-y-0.5"
        >
          <Star className="h-5 w-5 text-rose-deep" aria-hidden="true" />
          <span className="mt-3 block font-medium">Favourites</span>
          <span className="mt-0.5 block text-xs text-muted">Saved questions and answers</span>
        </Link>
      </div>

      <div className="space-y-3">
        <SectionHeading title="Shared memories" hint="Finished rounds, newest first." />
        {data.memories.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-5 w-5" />}
            title="Nothing here yet"
            body="Finished rounds will gather here, with every question you answered."
            action={
              <Link
                to="/games"
                className="inline-flex min-h-11 items-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper"
              >
                Play a round
              </Link>
            }
          />
        ) : (
          <ol className="relative space-y-2.5 border-l border-line pl-5">
            {data.memories.map((memory) => (
              <li key={memory.id} className="relative">
                <span
                  className="absolute -left-[1.6rem] top-4 h-2.5 w-2.5 rounded-full border-2 border-paper bg-rose"
                  aria-hidden="true"
                />
                <Link
                  to="/play/$gameId"
                  params={{ gameId: memory.id }}
                  className="block rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-rose/40"
                >
                  <p className="font-medium">{memory.label}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {memory.questions} questions · {pretty(memory.completedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      {data.notes.length > 0 ? (
        <div className="space-y-3">
          <SectionHeading
            title="Latest notes"
            action={
              <Link to="/notes" className="text-sm font-medium text-rose-deep">
                All notes
              </Link>
            }
          />
          <ul className="space-y-2">
            {data.notes.slice(0, 3).map((note) => (
              <li key={note.id} className="rounded-2xl border border-line bg-paper px-4 py-3">
                <p className="text-sm leading-relaxed">{note.body}</p>
                <p className="mt-1.5 text-xs text-muted">{note.mine ? "You" : "Them"}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/* Progress                                                            */
/* ================================================================== */

function StreakHeatmap({ days }: { days: string[] }) {
  const set = useMemo(() => new Set(days), [days]);
  const today = new Date().toISOString().slice(0, 10);
  // 12 weeks, ending this week. Columns are weeks, rows are weekdays.
  const cells: Array<{ day: string; active: boolean }> = [];
  const start = shiftDay(today, -83);
  for (let i = 0; i < 84; i += 1) {
    const day = shiftDay(start, i);
    cells.push({ day, active: set.has(day) });
  }
  const weeks: Array<Array<{ day: string; active: boolean }>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-1" role="img" aria-label={`${days.length} active days in the last 12 weeks`}>
        {weeks.map((week, index) => (
          <div key={index} className="flex flex-col gap-1">
            {week.map((cell) => (
              <span
                key={cell.day}
                title={`${cell.day}${cell.active ? " · played" : ""}`}
                className={cn(
                  "h-3 w-3 rounded-[3px]",
                  cell.active ? "bg-rose" : "bg-line/70",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressScreen() {
  const { data, error } = useLoader(() => getProgress(), []);
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load progress."}</ErrorNote>;

  const earned = data.badges.filter((badge) => badge.earned).length;
  const chartData = data.chart.filter((row) => row.count > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Progress" subtitle="Counts, not a compatibility percentage." />

      <div className="grid grid-cols-2 gap-3">
        <StatTile value={data.stats.gamesCompleted} label="Games finished" tone="rose" />
        <StatTile value={data.stats.answers} label="Answers given" tone="lavender" />
        <StatTile value={data.samePicks} label="Same picks" hint={`of ${data.choiceCompared} compared`} />
        <StatTile value={data.stats.streak} label="Day streak" hint="Rests, never resets to zero" tone="sage" />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Last 12 weeks</p>
            <p className="mt-0.5 text-xs text-muted">Each square is a day you played.</p>
          </div>
          <Pill tone="rose">
            <Flame className="h-3 w-3" aria-hidden="true" />
            {data.stats.streak} day
          </Pill>
        </div>
        <div className="mt-4">
          <StreakHeatmap days={data.activeDays ?? []} />
        </div>
      </Card>

      <Card>
        <p className="text-sm leading-relaxed">
          {data.favourite ? `Most played: ${data.favourite}.` : "Play a round to see a favourite category."}
        </p>
        {data.predictionChances > 0 ? (
          <p className="mt-2 text-sm text-muted">
            How Well Do You Know Me: you called {data.stats.predictionsCorrect} of {data.predictionChances}.
          </p>
        ) : null}
        {data.differentPicks > 0 ? (
          <p className="mt-2 text-sm text-muted">
            {data.differentPicks} different picks so far — each one a conversation, not a problem.
          </p>
        ) : null}
      </Card>

      {chartData.length > 0 ? (
        <Card>
          <p className="text-sm font-medium">Rounds by category</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={64}
                  tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-cream)" }}
                  contentStyle={{
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-line)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--color-ink)",
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} name="Rounds">
                  {chartData.map((row) => (
                    <Cell key={row.id} fill="var(--color-rose)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}

      <div className="space-y-3">
        <SectionHeading title="Badges" hint={`${earned} of ${data.badges.length} earned`} />
        <ProgressBar value={earned} max={data.badges.length} />
        <ul className="stagger grid gap-2 sm:grid-cols-2">
          {data.badges.map((badge) => (
            <li
              key={badge.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-3.5",
                badge.earned ? "border-line bg-paper" : "border-dashed border-line bg-paper/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  badge.earned ? "bg-sage text-sage-deep" : "bg-cream text-muted",
                )}
              >
                {badge.earned ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Star className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-sm font-medium", !badge.earned && "text-muted")}>
                  {badge.title}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{badge.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Profile                                                             */
/* ================================================================== */

export function ProfileScreen() {
  const shell = useShell();
  const rows = [
    ["/notifications", "Notifications"],
    ["/daily", "Daily question"],
    ["/favorites", "Favourite questions"],
    ["/notes", "Private notes"],
    ["/settings", "Settings"],
    ["/privacy", "Privacy"],
    ["/help", "Help and support"],
    ["/verify-email", "Email status"],
    ["/admin", "Question studio"],
    ["/delete-account", "Delete account"],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" />

      <Card className="surface-wash">
        <div className="flex items-center gap-4">
          <Avatar name={shell.profile.displayName} src={shell.profile.avatar} size="lg" />
          <div className="min-w-0">
            <p className="font-display text-2xl leading-tight">{shell.profile.displayName}</p>
            <p className="mt-0.5 truncate text-sm text-muted">@{shell.profile.username}</p>
          </div>
        </div>
        {shell.profile.bio ? <p className="mt-4 text-sm leading-relaxed">{shell.profile.bio}</p> : null}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            to="/edit-profile"
            className="inline-flex min-h-10 items-center rounded-full bg-rose-deep px-4 text-sm font-medium text-paper transition hover:brightness-110"
          >
            Edit profile
          </Link>
          <UserButton />
        </div>
      </Card>

      <ul className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper">
        {rows.map(([href, label]) => (
          <li key={href} className="border-b border-line last:border-b-0">
            <Link
              to={href}
              className="flex min-h-12 items-center justify-between px-4 text-sm transition-colors hover:bg-cream"
            >
              {label}
              <ArrowRight className="h-4 w-4 text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EditProfileScreen() {
  const shell = useShell();
  const toast = useToast();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(shell.profile.displayName);
  const [username, setUsername] = useState(shell.profile.username ?? "");
  const [bio, setBio] = useState(shell.profile.bio ?? "");
  const [avatar, setAvatar] = useState<string | null>(shell.profile.avatar);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Edit profile" back={{ to: "/profile", label: "Profile" }} />

      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={displayName} src={avatar} size="xl" />
          <div className="space-y-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-line bg-paper px-4 text-sm font-medium transition-colors hover:border-rose/60">
              Change photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void fileToDataUrl(file)
                    .then((url) => setAvatar(url))
                    .catch((reason: unknown) =>
                      setError(reason instanceof Error ? reason.message : "Could not use that photo."),
                    );
                }}
              />
            </label>
            {avatar ? (
              <button
                type="button"
                onClick={() => setAvatar(null)}
                className="block text-xs text-muted underline"
              >
                Remove photo
              </button>
            ) : null}
          </div>
        </div>
      </Card>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          void saveProfile({
            data: {
              username,
              displayName,
              bio,
              gender: (shell.profile.gender as "woman" | "man" | "nonbinary" | "unspecified" | null) ?? null,
              showGender: shell.profile.showGender,
              birthYear: shell.profile.birthYear,
              ageConfirmed: shell.profile.ageConfirmed,
            },
          })
            .then(async (result) => {
              if (!result.ok) {
                setError(result.error);
                toast.error(result.error);
                return;
              }
              if (avatar !== shell.profile.avatar) {
                await saveSettings({ data: { avatar } });
              }
              toast.success("Profile updated.");
              void navigate({ to: "/profile" });
            })
            .finally(() => setBusy(false));
        }}
      >
        <Field
          label="Display name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={40}
          required
        />
        <Field
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          hint="3–20 characters: letters, numbers, underscores. This is how your partner finds you."
          required
        />
        <TextArea
          label="Bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={3}
          maxLength={160}
          hint={`${bio.length}/160 — shown to your partner.`}
          placeholder="A line about you."
        />
        <ErrorNote>{error}</ErrorNote>
        <div className="flex gap-3">
          <Button type="submit" loading={busy} disabled={busy} className="flex-1">
            Save changes
          </Button>
          <Button type="button" variant="ghost" onClick={() => void navigate({ to: "/profile" })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ================================================================== */
/* Connect / invites                                                   */
/* ================================================================== */

export function ConnectScreen() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<Array<{ username: string; displayName: string; avatar: string | null }>>([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setPeople([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      void searchPeople({ data: { q } })
        .then((result) => {
          if (result.ok) setPeople(result.people);
        })
        .finally(() => setSearching(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connect"
        subtitle="Search by username. Email addresses are never shown in results."
        back={{ to: "/us", label: "Us" }}
      />

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search a username"
          aria-label="Search a username"
          className="min-h-11 w-full rounded-full border border-line bg-paper pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-4 focus:ring-rose/10"
        />
      </div>

      {searching && people.length === 0 ? <p className="text-sm text-muted">Searching…</p> : null}

      {q.trim().length >= 2 && !searching && people.length === 0 ? (
        <p className="text-sm text-muted">No one found with that username.</p>
      ) : null}

      <ul className="space-y-2">
        {people.map((person) => (
          <li
            key={person.username}
            className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Avatar name={person.displayName} src={person.avatar} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{person.displayName}</span>
                <span className="block truncate text-sm text-muted">@{person.username}</span>
              </span>
            </span>
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                void sendInvite({ data: { username: person.username } }).then((result) => {
                  setError(result.ok ? "" : result.error);
                  setMessage(result.ok ? "Invite sent." : "");
                  if (result.ok) toast.success("Invite sent.");
                  else toast.error(result.error);
                });
              }}
            >
              Invite
            </Button>
          </li>
        ))}
      </ul>

      <Card>
        <p className="text-sm font-medium">Or invite by email</p>
        <p className="mt-1 text-xs text-muted">
          If they do not have an account yet, we hold the invite until they join.
        </p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void inviteByEmail({ data: { email } }).then((result) => {
              if (!result.ok) {
                setError(result.error);
                toast.error(result.error);
                return;
              }
              setError("");
              const text = result.held
                ? "We'll hold that invite until they create an account."
                : "They already have an account. Invite sent.";
              setMessage(text);
              toast.success(text);
            });
          }}
        >
          <Field
            label="Their email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" variant="ghost">
            Send email invite
          </Button>
        </form>
      </Card>

      <ErrorNote>{error}</ErrorNote>
      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <Link to="/invites" className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-deep">
        See invitations <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function InvitesScreen() {
  const { data, error, setData } = useLoader(() => listInvites(), []);
  const toast = useToast();
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load invites."}</ErrorNote>;

  return (
    <div className="space-y-6">
      <PageHeader title="Invitations" back={{ to: "/us", label: "Us" }} />

      <div className="space-y-3">
        <SectionHeading title="Waiting for you" />
        {data.incoming.length === 0 ? (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No invites waiting"
            body="When someone invites you, it will appear here."
          />
        ) : (
          <ul className="space-y-2.5">
            {data.incoming.map((invite) => (
              <li key={invite.id}>
                <Card>
                  <div className="flex items-center gap-3">
                    <Avatar name={invite.displayName} src={invite.avatar} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{invite.displayName}</p>
                      <p className="truncate text-sm text-muted">@{invite.username}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() =>
                        void respondInvite({ data: { id: invite.id, accept: true } }).then(() => {
                          toast.success("Connected.");
                          void listInvites().then(setData);
                        })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        void respondInvite({ data: { id: invite.id, accept: false } }).then(() => {
                          void listInvites().then(setData);
                        })
                      }
                    >
                      Decline
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <SectionHeading title="Sent" />
        {data.outgoing.length === 0 ? (
          <p className="text-sm text-muted">You have not sent any invites.</p>
        ) : (
          <ul className="space-y-2">
            {data.outgoing.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3"
              >
                <span className="text-sm">{invite.displayName}</span>
                <Pill tone="amber">Waiting</Pill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Daily                                                               */
/* ================================================================== */

export function DailyScreen() {
  const { data, error, setData } = useLoader(() => getHome(), []);
  const toast = useToast();
  const [body, setBody] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!data && !error) return <Loading />;
  if (!data || !data.ok || !data.daily) return <ErrorNote>{error || "Today's question is not ready."}</ErrorNote>;

  const daily = data.daily;
  const choiceType = daily.question.answerType === "choice" || daily.question.answerType === "rather";

  return (
    <div className="space-y-6">
      <PageHeader title="Today" subtitle="One question, the same for both of you." back={{ to: "/", label: "Home" }} />

      <Card>
        <div className="flex items-center justify-between gap-3">
          <Pill tone="rose">Question of the day</Pill>
          {daily.submitted ? <Pill tone="sage">Answered</Pill> : null}
        </div>
        <p className="mt-4 font-display text-3xl leading-snug">{daily.question.text}</p>

        {daily.submitted ? (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-line bg-cream px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">You</p>
              <p className="mt-1 text-sm">{daily.mine?.skipped ? "Skipped" : daily.mine?.body}</p>
            </div>
            {daily.partnerAnswer ? (
              <>
                <div className="rounded-2xl border border-rose/30 bg-blush px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Them</p>
                  <p className="mt-1 text-sm">
                    {daily.partnerAnswer.skipped ? "Skipped" : daily.partnerAnswer.body}
                  </p>
                </div>
                {daily.tone ? (
                  <p className="text-sm text-muted">
                    <span className="font-medium text-ink">{daily.tone.title}</span> {daily.tone.detail}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted">
                {daily.partnerSubmitted
                  ? "Waiting to reveal."
                  : "Their answer stays hidden until you have both submitted."}
              </p>
            )}
          </div>
        ) : (
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              void submitDaily({ data: { body, choiceIndex: choice, skipped: false } })
                .then((result) => {
                  setNote(result.ok ? "" : result.error);
                  if (result.ok) {
                    toast.success("Answer saved.");
                    void getHome().then(setData);
                  } else toast.error(result.error);
                })
                .finally(() => setBusy(false));
            }}
          >
            {choiceType ? (
              <div className="space-y-2">
                {daily.question.choices.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setChoice(index)}
                    aria-pressed={choice === index}
                    className={cn(
                      "min-h-11 w-full rounded-2xl border px-4 text-left text-sm transition-colors",
                      choice === index
                        ? "border-transparent bg-rose-deep text-paper"
                        : "border-line bg-paper hover:border-rose/40",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <TextArea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                placeholder="Your answer"
                maxLength={800}
              />
            )}
            <div className="flex gap-3">
              <Button type="submit" loading={busy} disabled={busy} className="flex-1">
                Submit
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  void submitDaily({ data: { body: "", choiceIndex: null, skipped: true } }).then((result) => {
                    if (result.ok) void getHome().then(setData);
                    else setNote(result.error);
                  })
                }
              >
                Skip today
              </Button>
            </div>
          </form>
        )}
      </Card>

      {data.challenge ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Couple prompt</p>
          <p className="mt-2 text-base leading-relaxed">{data.challenge.title}</p>
          {data.challenge.done ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-sage-deep">
              <Check className="h-4 w-4" aria-hidden="true" /> Done for today.
            </p>
          ) : (
            <Button
              className="mt-4"
              variant="soft"
              onClick={() =>
                void completeChallenge().then((result) => {
                  if (result.ok) {
                    toast.success("Marked done.");
                    void getHome().then(setData);
                  } else setNote(result.error);
                })
              }
            >
              We did this
            </Button>
          )}
        </Card>
      ) : (
        <p className="text-sm text-muted">Connect a partner to share the daily prompt.</p>
      )}

      <ErrorNote>{note}</ErrorNote>
    </div>
  );
}

/* ================================================================== */
/* Favourites                                                          */
/* ================================================================== */

export function FavoritesScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, error } = useLoader(() => listFavorites(), []);
  const [mode, setMode] = useState<"together" | "turns">("together");
  const [note, setNote] = useState("");

  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load favourites."}</ErrorNote>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Favourites"
        subtitle="Questions and answers you have saved."
        back={{ to: "/us", label: "Us" }}
      />

      <Card>
        <p className="text-sm font-medium">Play your saved questions</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "together", label: "Together" },
              { value: "turns", label: "Turns" },
            ]}
          />
          <Button
            onClick={() =>
              void createFavoriteGame({ data: { mode } }).then((result) => {
                if (!result.ok) {
                  setNote(result.error);
                  toast.error(result.error);
                } else void navigate({ to: "/play/$gameId", params: { gameId: result.id } });
              })
            }
          >
            Start round
          </Button>
        </div>
      </Card>

      <ErrorNote>{note}</ErrorNote>

      <div className="space-y-3">
        <SectionHeading title="Saved questions" hint={`${data.questions.length} saved`} />
        {data.questions.length === 0 ? (
          <EmptyState
            icon={<Star className="h-5 w-5" />}
            title="No saved questions"
            body="Tap the star on any question during a round to keep it here."
          />
        ) : (
          <ul className="space-y-2">
            {data.questions.map((question) => (
              <li key={question.id} className="rounded-2xl border border-line bg-paper px-4 py-3">
                <p className="text-sm leading-relaxed">{question.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <SectionHeading title="Saved answers" hint={`${data.answers.length} saved`} />
        {data.answers.length === 0 ? (
          <p className="text-sm text-muted">Save an answer during a reveal to keep it here.</p>
        ) : (
          <ul className="space-y-2">
            {data.answers.map((answer) => (
              <li key={answer.id}>
                <Card>
                  <p className="text-xs text-muted">{answer.question}</p>
                  <p className="mt-2 text-sm leading-relaxed">
                    <span className="font-medium">{answer.author}</span> · {answer.body}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Notes                                                               */
/* ================================================================== */

export function NotesScreen() {
  const { data, error, setData } = useLoader(() => listNotes(), []);
  const toast = useToast();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load notes."}</ErrorNote>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        subtitle="Visible to the two of you while you are connected. Not a group chat."
        back={{ to: "/us", label: "Us" }}
      />

      {data.partner ? (
        <Card>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!body.trim()) return;
              setBusy(true);
              void addNote({ data: { body } })
                .then((result) => {
                  if (!result.ok) {
                    setNote(result.error);
                    toast.error(result.error);
                    return;
                  }
                  setBody("");
                  toast.success("Note left.");
                  void listNotes().then(setData);
                })
                .finally(() => setBusy(false));
            }}
          >
            <TextArea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={3}
              placeholder={`A note for ${data.partner.displayName}`}
            />
            <Button type="submit" loading={busy} disabled={busy || !body.trim()}>
              Leave note
            </Button>
          </form>
        </Card>
      ) : (
        <EmptyState
          icon={<Heart className="h-5 w-5" />}
          title="Connect a partner first"
          body="Notes are private to the two of you, so you need someone to write to."
          action={
            <Link
              to="/connect"
              className="inline-flex min-h-11 items-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper"
            >
              Find your partner
            </Link>
          }
        />
      )}

      <ErrorNote>{note}</ErrorNote>

      {data.notes.length === 0 ? (
        <p className="text-sm text-muted">No notes yet.</p>
      ) : (
        <ul className="stagger space-y-2.5">
          {data.notes.map((item) => (
            <li key={item.id}>
              <Card className={item.mine ? "bg-paper" : "bg-lavender/40"}>
                <p className="text-sm leading-relaxed">{item.body}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <p className="text-xs text-muted">
                    {item.mine ? "You" : "Them"} · {relative(item.createdAt)}
                  </p>
                  {item.mine ? (
                    <button
                      type="button"
                      className="text-xs text-muted underline transition-colors hover:text-rose-deep"
                      onClick={() =>
                        void deleteNote({ data: { id: item.id } }).then(() => {
                          toast.info("Note removed.");
                          void listNotes().then(setData);
                        })
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ================================================================== */
/* Partner                                                             */
/* ================================================================== */

export function PartnerScreen() {
  const shell = useShell();
  const toast = useToast();
  const partner = shell.partner;
  const [note, setNote] = useState("");

  if (!partner) {
    return (
      <div className="space-y-6">
        <PageHeader title="Partner" back={{ to: "/us", label: "Us" }} />
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No partner yet"
          body="Invite someone to start playing together."
          action={
            <Link
              to="/connect"
              className="inline-flex min-h-11 items-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper"
            >
              Connect someone
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={partner.displayName} back={{ to: "/us", label: "Us" }} />

      <Card className="surface-wash text-center">
        <Avatar name={partner.displayName} src={partner.avatar} size="xl" className="mx-auto" />
        <p className="mt-4 font-display text-2xl leading-tight">{partner.displayName}</p>
        <p className="mt-0.5 text-sm text-muted">@{partner.username}</p>
        {partner.bio ? <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed">{partner.bio}</p> : null}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {partner.gender ? <Pill tone="lavender">{partner.gender}</Pill> : null}
          <Pill tone="neutral">Connected {pretty(partner.connectedAt)}</Pill>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium">Disconnect</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          This ends the live space between you. Shared rounds and notes stop being visible to each other.
        </p>
        <Button
          variant="ghost"
          className="mt-3"
          onClick={() =>
            void disconnectPartner().then((result) => {
              if (result.ok) toast.success("Disconnected.");
              else {
                setNote(result.error);
                toast.error(result.error);
              }
            })
          }
        >
          Disconnect
        </Button>
      </Card>

      <ErrorNote>{note}</ErrorNote>
    </div>
  );
}

/* ================================================================== */
/* Notifications                                                       */
/* ================================================================== */

export function NotificationsScreen() {
  const { data, error, setData } = useLoader(() => listNotifications(), []);
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load notifications."}</ErrorNote>;

  const unread = data.items.filter((item) => !item.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="These stay inside the app. This web version does not send phone push alerts."
        back={{ to: "/", label: "Home" }}
        action={
          unread > 0 ? (
            <button
              type="button"
              className="shrink-0 text-sm text-muted underline transition-colors hover:text-ink"
              onClick={() => void markNotifications({ data: {} }).then(() => listNotifications().then(setData))}
            >
              Mark all read
            </button>
          ) : null
        }
      />

      {data.items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-5 w-5" />}
          title="Nothing yet"
          body="Invites, turns, and finished rounds will show up here."
        />
      ) : (
        <ul className="stagger space-y-2.5">
          {data.items.map((item) => (
            <li key={item.id}>
              <a
                href={item.href || "/notifications"}
                onClick={() => void markNotifications({ data: { id: item.id } })}
                className={cn(
                  "block rounded-[var(--radius-card)] border p-4 transition-colors",
                  item.read ? "border-line bg-paper" : "border-rose/30 bg-blush/60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  {!item.read ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose" /> : null}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                <p className="mt-1.5 text-xs text-muted">{relative(item.createdAt)}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ================================================================== */
/* Settings                                                            */
/* ================================================================== */

export function SettingsScreen() {
  const shell = useShell();
  const toast = useToast();
  const [theme, setTheme] = useState(shell.profile.theme);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function applyTheme(value: "system" | "light" | "dark") {
    setTheme(value);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = value === "dark" || (value === "system" && prefersDark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    if (value === "system") localStorage.removeItem("two-theme");
    else localStorage.setItem("two-theme", value);
    void saveSettings({ data: { theme: value } });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" back={{ to: "/profile", label: "Profile" }} />

      <Card className="space-y-3">
        <p className="text-sm font-medium">Appearance</p>
        <SegmentedControl
          className="w-full"
          value={theme}
          onChange={(value) => applyTheme(value as "system" | "light" | "dark")}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Card>

      <Card className="space-y-1">
        <p className="mb-2 text-sm font-medium">In-app alerts</p>
        <Switch
          label="Invites"
          description="When someone invites you to connect."
          checked={shell.profile.notifInvites}
          onChange={(notifInvites) => void saveSettings({ data: { notifInvites } })}
        />
        <Switch
          label="Games"
          description="When a round starts or finishes."
          checked={shell.profile.notifGames}
          onChange={(notifGames) => void saveSettings({ data: { notifGames } })}
        />
        <Switch
          label="Turns"
          description="When it is your turn to answer."
          checked={shell.profile.notifTurns}
          onChange={(notifTurns) => void saveSettings({ data: { notifTurns } })}
        />
        <Switch
          label="Daily"
          description="A nudge for the question of the day."
          checked={shell.profile.notifDaily}
          onChange={(notifDaily) => void saveSettings({ data: { notifDaily } })}
        />
      </Card>

      <Card>
        <p className="text-sm font-medium">Change password</p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            void authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true }).then((result) => {
              if (result.error) {
                setError(result.error.message ?? "Could not change the password.");
                toast.error(result.error.message ?? "Could not change the password.");
              } else {
                setMessage("Password changed.");
                toast.success("Password changed.");
                setCurrentPassword("");
                setNewPassword("");
              }
            });
          }}
        >
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <Button type="submit" variant="ghost">
            Change password
          </Button>
        </form>
        {message ? <p className="mt-3 text-sm text-sage-deep">{message}</p> : null}
        <ErrorNote>{error}</ErrorNote>
      </Card>

      <p className="text-sm text-muted">Signed in as {shell.email}</p>
    </div>
  );
}

/* ================================================================== */
/* Privacy                                                             */
/* ================================================================== */

export function PrivacyScreen() {
  const shell = useShell();
  const toast = useToast();
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader title="Privacy" back={{ to: "/profile", label: "Profile" }} />

      <Card>
        <p className="text-sm leading-relaxed">
          Answers are stored for the two players in a round. Your partner cannot read yours until they have
          submitted theirs as well. That rule is checked on the server, not only hidden on screen.
          Disconnecting ends the live space. Deleting your account removes shared rounds.
        </p>
      </Card>

      <Card className="space-y-1">
        <Switch
          label="Show gender to my partner"
          checked={shell.profile.showGender}
          onChange={(showGender) =>
            void saveSettings({ data: { showGender } }).then(() => {
              setMessage("Saved.");
              toast.success("Saved.");
            })
          }
        />
        <Switch
          label="I am 18 or older"
          checked={shell.profile.ageConfirmed}
          onChange={(ageConfirmed) =>
            void saveSettings({ data: { ageConfirmed } }).then(() => {
              setMessage("Saved.");
              toast.success("Saved.");
            })
          }
        />
        <Switch
          label="Allow intimate questions"
          description="Both of you must opt in before these appear."
          checked={shell.profile.allowMature}
          onChange={(allowMature) =>
            void saveSettings({ data: { allowMature } }).then((result) => {
              const text = result.ok ? "Saved. Both of you must opt in." : result.error;
              setMessage(text);
              if (result.ok) toast.success(text);
              else toast.error(text);
            })
          }
        />
      </Card>

      {message ? <p className="text-sm text-muted">{message}</p> : null}

      <Link to="/delete-account" className="inline-flex text-sm text-rose-deep underline">
        Delete account and data
      </Link>
    </div>
  );
}

/* ================================================================== */
/* Help                                                                */
/* ================================================================== */

export function HelpScreen() {
  const items = [
    {
      title: "How a round works",
      body: "One of you starts a game. You answer without seeing the other reply. When both are in, the reveal opens. Take Turns waits for the person whose turn it is. If someone leaves, the round stays until you finish or cancel it.",
    },
    {
      title: "Two phones",
      body: "Sign each person into their own account. Search the username, accept the invite, then start a game. On one phone, sign out and sign in as the other person to play both sides.",
    },
    {
      title: "What this is not",
      body: "Matching answers are not a relationship score. Skipping is allowed. Missing a day does not break anything except the streak count, and the streak only rests.",
    },
    {
      title: "Reporting a question",
      body: "Every question has a report field during a round. Reports go to the studio queue and are reviewed by hand.",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Help" subtitle="How Two of Us works, and what it is not." back={{ to: "/profile", label: "Profile" }} />
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.title}>
            <p className="font-medium">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted">
        Support: write from the account email you used to join. Question reports go to the studio queue.
      </p>
    </div>
  );
}

/* ================================================================== */
/* Verify / delete                                                     */
/* ================================================================== */

export function VerifyScreen() {
  const shell = useShell();
  return (
    <div className="space-y-6">
      <PageHeader title="Email" back={{ to: "/profile", label: "Profile" }} />
      <Card>
        <p className="font-medium">{shell.email}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {shell.emailVerified
            ? "This email is marked verified."
            : "Verification mail is not sent in this web version, so the account stays usable without it. Google or X sign-in does not need a password email."}
        </p>
      </Card>
    </div>
  );
}

export function DeleteScreen() {
  const navigate = useNavigate();
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader title="Delete account" back={{ to: "/profile", label: "Profile" }} />
      <Card className="border-rose/30">
        <p className="text-sm leading-relaxed">
          This removes your profile, notes, and shared games. Your partner is told. It cannot be undone.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            void deleteAccount({ data: { phrase } })
              .then(async (result) => {
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                await signOut().catch(() => undefined);
                void navigate({ to: "/welcome" });
              })
              .finally(() => setBusy(false));
          }}
        >
          <Field
            label="Type DELETE to confirm"
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            placeholder="DELETE"
          />
          <Button type="submit" variant="danger" loading={busy} disabled={busy || phrase !== "DELETE"}>
            Delete everything
          </Button>
        </form>
        <ErrorNote>{error}</ErrorNote>
      </Card>
    </div>
  );
}

/* ================================================================== */
/* Admin                                                               */
/* ================================================================== */

export function AdminScreen() {
  const shell = useShell();
  const toast = useToast();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<Extract<Awaited<ReturnType<typeof adminOverview>>, { ok: true }> | null>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() {
    const result = await adminOverview();
    if (result.ok) setOverview(result);
    else setError(result.error);
  }

  useEffect(() => {
    if (shell.profile.role === "admin") void load();
  }, [shell.profile.role]);

  if (shell.profile.role !== "admin") {
    return (
      <div className="space-y-6">
        <PageHeader title="Studio" back={{ to: "/profile", label: "Profile" }} />
        <Card>
          <p className="text-sm text-muted">Question editing is limited to studio roles.</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void claimStudio({ data: { key } }).then((result) => {
                if (!result.ok) setError(result.error);
                else window.location.reload();
              });
            }}
          >
            <Field label="Studio key" type="password" value={key} onChange={(event) => setKey(event.target.value)} />
            <Button type="submit">Unlock</Button>
          </form>
          <ErrorNote>{error}</ErrorNote>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Studio" subtitle="Questions, reports, and announcements." back={{ to: "/profile", label: "Profile" }} />

      {overview ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile value={overview.counts.people} label="People" />
          <StatTile value={overview.counts.games} label="Games" />
          <StatTile value={overview.counts.answers} label="Answers" />
          <StatTile value={overview.counts.reports} label="Open reports" tone="rose" />
        </div>
      ) : null}

      <Card>
        <p className="text-sm font-medium">Add a question</p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void adminSaveQuestion({
              data: {
                text,
                category: "know",
                difficulty: "easy",
                answerType: "short",
                choices: [],
                sensitivity: "low",
                audience: "all",
                active: true,
              },
            }).then((result) => {
              setError(result.ok ? "" : result.error);
              if (result.ok) {
                toast.success("Question added.");
                setText("");
                void load();
              } else toast.error(result.error);
            });
          }}
        >
          <Field label="Question text" value={text} onChange={(event) => setText(event.target.value)} required />
          <div className="flex gap-2">
            <Button type="submit">Add to Getting to Know You</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                void adminSearchQuestions({ data: { q: text } }).then((result) => {
                  if (result.ok && overview) setOverview({ ...overview, questions: result.questions });
                })
              }
            >
              Search
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <p className="text-sm font-medium">Announcement</p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void adminAnnounce({ data: { title, body } }).then((result) => {
              setError(result.ok ? "" : result.error);
              if (result.ok) {
                toast.success("Announcement published.");
                setTitle("");
                setBody("");
                void load();
              } else toast.error(result.error);
            });
          }}
        >
          <Field label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <Field label="Body" value={body} onChange={(event) => setBody(event.target.value)} required />
          <Button type="submit" variant="soft">
            Publish note
          </Button>
        </form>
      </Card>

      <ErrorNote>{error}</ErrorNote>

      {overview?.questions.length ? (
        <div className="space-y-3">
          <SectionHeading title="Questions" hint={`${overview.questions.length} shown`} />
          <ul className="space-y-2">
            {overview.questions.map((question) => (
              <li key={question.id} className="rounded-2xl border border-line bg-paper p-4">
                <p className="text-sm leading-relaxed">{question.text}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted">
                    {question.category} · {question.active ? "active" : "hidden"}
                  </p>
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() =>
                      void adminSetActive({ data: { id: question.id, active: !question.active } }).then(() => load())
                    }
                  >
                    {question.active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {overview?.reports.length ? (
        <div className="space-y-3">
          <SectionHeading title="Open reports" />
          <ul className="space-y-2">
            {overview.reports.map((report) => (
              <li key={report.id}>
                <Card>
                  <p className="text-sm leading-relaxed">{report.reason}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void adminSetReport({ data: { id: report.id, status: "reviewed" } }).then(() => load())}
                    >
                      Reviewed
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void adminSetReport({ data: { id: report.id, status: "hidden" } }).then(() => load())}
                    >
                      Hide question
                    </Button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {overview?.errors.length ? (
        <div className="space-y-1">
          <SectionHeading title="Recent errors" />
          {overview.errors.map((item) => (
            <p key={item.id} className="text-xs text-muted">
              {item.message}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
