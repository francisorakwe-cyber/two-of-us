import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Compass, Eye, Moon, Shuffle, Sunrise, Zap, Laugh, Bell } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { authClient, signOut } from "@/lib/auth/client";
import { greeting } from "@/lib/two/logic";
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
  saveSettings,
  searchPeople,
  sendInvite,
  submitDaily,
} from "@/lib/two/api";
import { useShell } from "./shell";
import { Avatar, Button, Card, ErrorNote, Field, Loading, fileToDataUrl, pretty } from "./ui";

const ICONS = { know: Compass, mirror: Eye, love: Sunrise, deep: Moon, fun: Laugh, rather: Shuffle, spark: Zap };

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

export function HomeScreen() {
  const shell = useShell();
  const { data, error } = useLoader(() => getHome(), []);
  if (!data && !error) return <Loading />;
  if (!data) return <ErrorNote>{error}</ErrorNote>;
  if (!data.ok) return <ErrorNote>{data.error}</ErrorNote>;
  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{greeting(new Date().getHours())}</p>
          <h1 className="font-display text-4xl">{data.name}</h1>
        </div>
        <Link to="/notifications" className="relative grid h-11 w-11 place-items-center rounded-full bg-paper text-ink">
          <span className="sr-only">Notifications{shell.unread ? `, ${shell.unread} new` : ""}</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          {shell.unread > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose" /> : null}
        </Link>
      </header>
      {data.announcement ? (
        <Card className="bg-lavender">
          <p className="text-sm font-medium">{data.announcement.title}</p>
          <p className="mt-1 text-sm">{data.announcement.body}</p>
        </Card>
      ) : null}
      {data.partner ? (
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex">
              <Avatar name={shell.profile.displayName} src={shell.profile.avatar} />
              <Avatar className="-ml-3 ring-2 ring-paper" name={data.partner.displayName} src={data.partner.avatar} />
            </div>
            <div>
              <p className="font-medium">{data.partner.displayName}</p>
              <p className="text-sm text-muted">Connected {pretty(data.partner.connectedAt)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted tabular-nums">{data.streak > 0 ? `${data.streak} day streak. Miss a day and it simply rests.` : "Play when you feel like it. A missed day does not punish you."}</p>
        </Card>
      ) : (
        <Card>
          <h2 className="font-display text-2xl">Bring someone in.</h2>
          <p className="mt-2 text-sm text-muted">One partner at a time. Both of you accept before anything is shared.</p>
          <Link to="/connect" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-rose-deep">Find your partner</Link>
        </Card>
      )}
      {data.continueGame ? (
        <Link to="/play/$gameId" params={{ gameId: data.continueGame.id }} className="block">
          <Card className="bg-blush">
            <p className="text-sm">Continue</p>
            <p className="font-display text-2xl">{data.continueGame.label}</p>
          </Card>
        </Link>
      ) : null}
      {data.daily ? (
        <Card>
          <p className="text-sm text-muted">Question of the day</p>
          <p className="mt-2 font-display text-2xl">{data.daily.question.text}</p>
          <Link to="/daily" className="mt-4 inline-flex text-sm font-medium text-rose-deep">
            {data.daily.submitted ? "See today's card" : "Answer it"}
          </Link>
        </Card>
      ) : null}
      {data.challenge ? (
        <Card>
          <p className="text-sm text-muted">Today's couple prompt</p>
          <p className="mt-2">{data.challenge.title}</p>
          <p className="mt-2 text-sm text-muted">{data.challenge.done ? "Marked done." : "Optional. Nothing happens if you skip it."}</p>
        </Card>
      ) : null}
      <Link to="/games" className="flex min-h-12 items-center justify-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper">
        Play together
      </Link>
      {data.recent.length > 0 ? (
        <div className="space-y-2">
          <h2 className="font-display text-xl">Recent</h2>
          {data.recent.map((item) => (
            <a key={item.id} href={item.href || "/notifications"} className="block rounded-2xl border border-line bg-paper px-4 py-3">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-sm text-muted">{item.body}</p>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function GamesScreen() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Games</h1>
      <p className="text-sm text-muted">Pick a set. Then choose answer together, or take turns.</p>
      <Link to="/games/$category" params={{ category: "mix" }} className="block rounded-3xl bg-ink px-5 py-5 text-paper">
        <p className="font-display text-2xl">Random mix</p>
        <p className="mt-1 text-sm text-blush">A handful from across the deck.</p>
      </Link>
      {CATEGORIES.map((category) => {
        const Icon = ICONS[category.id];
        return (
          <Link key={category.id} to="/games/$category" params={{ category: category.id }} className="flex items-center gap-4 rounded-3xl border border-line bg-paper p-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lavender text-ink">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-medium">{category.name}</span>
              <span className="block text-sm text-muted">{category.blurb}</span>
            </span>
          </Link>
        );
      })}
      <Card>
        <p className="text-sm text-muted">TWO OF US is free. Sponsored placements, if they are added later, stay off question, reveal, and note screens.</p>
      </Card>
    </div>
  );
}

export function CategoryScreen({ category }: { category: string }) {
  const navigate = useNavigate();
  const known = category === "mix" || CATEGORIES.some((item) => item.id === category);
  const meta = CATEGORIES.find((item) => item.id === category);
  const [mode, setMode] = useState<"together" | "turns">("together");
  const [count, setCount] = useState<5 | 8 | 12>(8);
  const [difficulty, setDifficulty] = useState<"any" | "easy" | "medium" | "deep">("any");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!known) return <ErrorNote>That category does not exist.</ErrorNote>;
  return (
    <div className="space-y-5">
      <Link to="/games" className="text-sm text-muted">All games</Link>
      <h1 className="font-display text-4xl">{meta?.name ?? "Random mix"}</h1>
      <p className="text-sm text-muted">{meta?.blurb ?? "Questions from every category, still private until you both answer."}</p>
      {category === "spark" ? (
        <Card className="bg-lavender">
          <p className="text-sm">Skip any card. Mature prompts stay off unless you are both 18 or older and have opted in under Privacy.</p>
        </Card>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setMode("together")} className={mode === "together" ? "min-h-24 rounded-3xl bg-rose-deep p-4 text-left text-paper" : "min-h-24 rounded-3xl border border-line p-4 text-left"}>
          <span className="block font-medium">Answer together</span>
          <span className="mt-1 block text-sm opacity-80">Same question, either order.</span>
        </button>
        <button type="button" onClick={() => setMode("turns")} className={mode === "turns" ? "min-h-24 rounded-3xl bg-lavender-deep p-4 text-left text-paper" : "min-h-24 rounded-3xl border border-line p-4 text-left"}>
          <span className="block font-medium">Take turns</span>
          <span className="mt-1 block text-sm opacity-80">One answers, then the other.</span>
        </button>
      </div>
      <div className="flex gap-2">
        {([5, 8, 12] as const).map((value) => (
          <button key={value} type="button" onClick={() => setCount(value)} className={count === value ? "min-h-11 flex-1 rounded-full bg-ink text-sm text-paper" : "min-h-11 flex-1 rounded-full border border-line text-sm"}>
            {value}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(["any", "easy", "medium", "deep"] as const).map((value) => (
          <button key={value} type="button" onClick={() => setDifficulty(value)} className={difficulty === value ? "min-h-11 rounded-full bg-blush px-4 text-sm" : "min-h-11 rounded-full border border-line px-4 text-sm"}>
            {value}
          </button>
        ))}
      </div>
      <ErrorNote>{error}</ErrorNote>
      <Button
        className="w-full"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void createGame({ data: { category, mode, count, difficulty } }).then((result) => {
            setBusy(false);
            if (!result.ok) {
              setError(result.error);
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

export function UsScreen() {
  const { data, error } = useLoader(() => getUs(), []);
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load your space."}</ErrorNote>;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Us</h1>
      {data.partner ? (
        <Card>
          <div className="flex items-center gap-3">
            <Avatar name={data.partner.displayName} src={data.partner.avatar} />
            <div>
              <p className="font-medium">{data.partner.displayName}</p>
              <p className="text-sm text-muted">@{data.partner.username} · since {pretty(data.partner.connectedAt)}</p>
            </div>
          </div>
          {data.partner.bio ? <p className="mt-3 text-sm">{data.partner.bio}</p> : null}
          <Link to="/partner" className="mt-4 inline-flex text-sm font-medium text-rose-deep">Partner profile</Link>
        </Card>
      ) : (
        <Card>
          <p>No partner connected.</p>
          <Link to="/connect" className="mt-3 inline-flex text-sm font-medium text-rose-deep">Send an invite</Link>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/notes" className="rounded-3xl bg-lavender p-4"><span className="font-medium">Notes</span></Link>
        <Link to="/favorites" className="rounded-3xl bg-blush p-4"><span className="font-medium">Favourites</span></Link>
      </div>
      <h2 className="font-display text-2xl">Shared memories</h2>
      {data.memories.length === 0 ? <p className="text-sm text-muted">Finished rounds will gather here.</p> : null}
      {data.memories.map((memory) => (
        <Link key={memory.id} to="/play/$gameId" params={{ gameId: memory.id }} className="block rounded-3xl border border-line bg-paper p-4">
          <p className="font-medium">{memory.label}</p>
          <p className="text-sm text-muted">{memory.questions} questions · {pretty(memory.completedAt)}</p>
        </Link>
      ))}
      {data.notes.slice(0, 2).map((note) => (
        <p key={note.id} className="text-sm text-muted">{note.mine ? "You" : "Them"}: {note.body}</p>
      ))}
    </div>
  );
}

export function ProgressScreen() {
  const { data, error } = useLoader(() => getProgress(), []);
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load progress."}</ErrorNote>;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Progress</h1>
      <p className="text-sm text-muted">Counts, not a compatibility percentage.</p>
      <div className="grid grid-cols-2 gap-3">
        <Card><p className="font-display text-3xl tabular-nums">{data.stats.gamesCompleted}</p><p className="text-sm text-muted">Games finished</p></Card>
        <Card><p className="font-display text-3xl tabular-nums">{data.stats.answers}</p><p className="text-sm text-muted">Answers</p></Card>
        <Card><p className="font-display text-3xl tabular-nums">{data.samePicks}</p><p className="text-sm text-muted">Same picks</p></Card>
        <Card><p className="font-display text-3xl tabular-nums">{data.differentPicks}</p><p className="text-sm text-muted">Different picks</p></Card>
      </div>
      <Card>
        <p className="text-sm">{data.favourite ? `Most played: ${data.favourite}.` : "Play a round to see a favourite category."}</p>
        <p className="mt-2 text-sm text-muted">Streak: {data.stats.streak}. It rests when you miss a day. It does not scold you.</p>
        {data.predictionChances > 0 ? <p className="mt-2 text-sm">How Well Do You Know Me: you called {data.stats.predictionsCorrect} of {data.predictionChances}.</p> : null}
      </Card>
      <div className="h-56 rounded-3xl border border-line bg-paper p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chart} layout="vertical" margin={{ left: 8, right: 8 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={64} tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Bar dataKey="count" fill="var(--color-rose)" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h2 className="font-display text-2xl">Badges</h2>
      <ul className="space-y-2">
        {data.badges.map((badge) => (
          <li key={badge.id} className="flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3">
            <span>
              <span className="block text-sm font-medium">{badge.title}</span>
              <span className="block text-sm text-muted">{badge.detail}</span>
            </span>
            <span className="text-xs text-muted">{badge.earned ? "Earned" : "Not yet"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Profile</h1>
      <Card>
        <div className="flex items-center gap-3">
          <Avatar name={shell.profile.displayName} src={shell.profile.avatar} />
          <div>
            <p className="font-medium">{shell.profile.displayName}</p>
            <p className="text-sm text-muted">@{shell.profile.username}</p>
          </div>
        </div>
        <div className="mt-4"><UserButton /></div>
      </Card>
      <ul className="overflow-hidden rounded-3xl border border-line bg-paper">
        {rows.map(([href, label]) => (
          <li key={href} className="border-b border-line last:border-b-0">
            <Link to={href} className="flex min-h-12 items-center px-4 text-sm">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConnectScreen() {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<Array<{ username: string; displayName: string; avatar: string | null }>>([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (q.trim().length < 2) {
      setPeople([]);
      return;
    }
    const timer = window.setTimeout(() => {
      void searchPeople({ data: { q } }).then((result) => {
        if (result.ok) setPeople(result.people);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q]);
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Connect</h1>
      <p className="text-sm text-muted">Search by username. Email addresses are never shown in results.</p>
      <Field label="Username" value={q} onChange={(event) => setQ(event.target.value)} placeholder="david_92" />
      <ul className="space-y-2">
        {people.map((person) => (
          <li key={person.username} className="flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3">
            <span>
              <span className="block text-sm font-medium">{person.displayName}</span>
              <span className="block text-sm text-muted">@{person.username}</span>
            </span>
            <Button
              variant="soft"
              onClick={() => {
                void sendInvite({ data: { username: person.username } }).then((result) => {
                  setError(result.ok ? "" : result.error);
                  setMessage(result.ok ? "Invite sent." : "");
                });
              }}
            >
              Invite
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void inviteByEmail({ data: { email } }).then((result) => {
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setError("");
            setMessage(result.held ? "We'll hold that invite until they create an account." : "They already have an account. Invite sent.");
          });
        }}
      >
        <Field label="Or invite by email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Button type="submit" variant="ghost">Send email invite</Button>
      </form>
      <ErrorNote>{error}</ErrorNote>
      {message ? <p className="text-sm">{message}</p> : null}
      <Link to="/invites" className="text-sm font-medium text-rose-deep">See invitations</Link>
    </div>
  );
}

export function InvitesScreen() {
  const { data, error, setData } = useLoader(() => listInvites(), []);
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load invites."}</ErrorNote>;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Invitations</h1>
      {data.incoming.length === 0 ? <p className="text-sm text-muted">No invites waiting.</p> : null}
      {data.incoming.map((invite) => (
        <Card key={invite.id}>
          <p className="font-medium">{invite.displayName}</p>
          <p className="text-sm text-muted">@{invite.username}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => void respondInvite({ data: { id: invite.id, accept: true } }).then(() => listInvites().then(setData))}>Accept</Button>
            <Button variant="ghost" onClick={() => void respondInvite({ data: { id: invite.id, accept: false } }).then(() => listInvites().then(setData))}>Decline</Button>
          </div>
        </Card>
      ))}
      <h2 className="font-display text-2xl">Sent</h2>
      {data.outgoing.map((invite) => (
        <p key={invite.id} className="text-sm text-muted">Waiting on {invite.displayName}</p>
      ))}
    </div>
  );
}

export function DailyScreen() {
  const { data, error, setData } = useLoader(() => getHome(), []);
  const [body, setBody] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [note, setNote] = useState("");
  if (!data && !error) return <Loading />;
  if (!data || !data.ok || !data.daily) return <ErrorNote>{error || "Today's question is not ready."}</ErrorNote>;
  const daily = data.daily;
  const choiceType = daily.question.answerType === "choice" || daily.question.answerType === "rather";
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Today</h1>
      <Card>
        <p className="font-display text-3xl">{daily.question.text}</p>
        {daily.submitted ? (
          <div className="mt-4 space-y-3 text-sm">
            <p>You: {daily.mine?.skipped ? "Skipped" : daily.mine?.body}</p>
            {daily.partnerAnswer ? (
              <>
                <p>Them: {daily.partnerAnswer.skipped ? "Skipped" : daily.partnerAnswer.body}</p>
                {daily.tone ? <p className="text-muted">{daily.tone.title} {daily.tone.detail}</p> : null}
              </>
            ) : (
              <p className="text-muted">{daily.partnerSubmitted ? "Waiting to reveal." : "Their answer stays hidden until you have both submitted."}</p>
            )}
          </div>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submitDaily({ data: { body, choiceIndex: choice, skipped: false } }).then((result) => {
                setNote(result.ok ? "" : result.error);
                if (result.ok) void getHome().then(setData);
              });
            }}
          >
            {choiceType ? daily.question.choices.map((option, index) => (
              <button key={option} type="button" onClick={() => setChoice(index)} className={choice === index ? "min-h-11 w-full rounded-2xl bg-rose-deep px-4 text-left text-sm text-paper" : "min-h-11 w-full rounded-2xl border border-line px-4 text-left text-sm"}>
                {option}
              </button>
            )) : (
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} className="w-full rounded-2xl border border-line px-4 py-3" />
            )}
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void submitDaily({ data: { body: "", choiceIndex: null, skipped: true } }).then((result) => {
                if (result.ok) void getHome().then(setData);
                else setNote(result.error);
              })}
            >
              Skip today
            </Button>
          </form>
        )}
      </Card>
      {data.challenge ? (
        <Card>
          <p className="text-sm text-muted">Couple prompt</p>
          <p className="mt-2">{data.challenge.title}</p>
          {data.challenge.done ? <p className="mt-2 text-sm text-muted">Done for today.</p> : (
            <Button className="mt-4" variant="soft" onClick={() => void completeChallenge().then((result) => { if (result.ok) void getHome().then(setData); else setNote(result.error); })}>We did this</Button>
          )}
        </Card>
      ) : <p className="text-sm text-muted">Connect a partner to share the daily prompt.</p>}
      <ErrorNote>{note}</ErrorNote>
    </div>
  );
}

export function FavoritesScreen() {
  const navigate = useNavigate();
  const { data, error } = useLoader(() => listFavorites(), []);
  const [mode, setMode] = useState<"together" | "turns">("together");
  const [note, setNote] = useState("");
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load favourites."}</ErrorNote>;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Favourites</h1>
      <div className="flex gap-2">
        <Button variant={mode === "together" ? "primary" : "ghost"} onClick={() => setMode("together")}>Together</Button>
        <Button variant={mode === "turns" ? "primary" : "ghost"} onClick={() => setMode("turns")}>Turns</Button>
      </div>
      <Button onClick={() => void createFavoriteGame({ data: { mode } }).then((result) => {
        if (!result.ok) setNote(result.error);
        else void navigate({ to: "/play/$gameId", params: { gameId: result.id } });
      })}>Play saved questions</Button>
      <ErrorNote>{note}</ErrorNote>
      {data.questions.map((question) => (
        <Card key={question.id}><p>{question.text}</p></Card>
      ))}
      <h2 className="font-display text-2xl">Saved answers</h2>
      {data.answers.map((answer) => (
        <Card key={answer.id}>
          <p className="text-sm text-muted">{answer.question}</p>
          <p className="mt-2 text-sm">{answer.author}: {answer.body}</p>
        </Card>
      ))}
    </div>
  );
}

export function NotesScreen() {
  const { data, error, setData } = useLoader(() => listNotes(), []);
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load notes."}</ErrorNote>;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Notes</h1>
      <p className="text-sm text-muted">Visible to the two of you while you are connected. Not a group chat.</p>
      {data.partner ? (
        <form className="space-y-3" onSubmit={(event) => {
          event.preventDefault();
          void addNote({ data: { body } }).then((result) => {
            if (!result.ok) setNote(result.error);
            else {
              setBody("");
              void listNotes().then(setData);
            }
          });
        }}>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} className="w-full rounded-2xl border border-line bg-paper px-4 py-3" placeholder={`A note for ${data.partner.displayName}`} />
          <Button type="submit">Leave note</Button>
        </form>
      ) : <p className="text-sm">Connect a partner before writing notes.</p>}
      <ErrorNote>{note}</ErrorNote>
      {data.notes.map((item) => (
        <Card key={item.id}>
          <p className="text-sm">{item.body}</p>
          <p className="mt-2 text-xs text-muted">{item.mine ? "You" : "Them"} · {pretty(item.createdAt)}</p>
          {item.mine ? <button type="button" className="mt-2 text-sm text-muted" onClick={() => void deleteNote({ data: { id: item.id } }).then(() => listNotes().then(setData))}>Remove</button> : null}
        </Card>
      ))}
    </div>
  );
}

export function PartnerScreen() {
  const shell = useShell();
  const partner = shell.partner;
  const [note, setNote] = useState("");
  if (!partner) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-4xl">Partner</h1>
        <Link to="/connect" className="text-sm font-medium text-rose-deep">Connect someone</Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">{partner.displayName}</h1>
      <Avatar name={partner.displayName} src={partner.avatar} className="h-20 w-20" />
      <p className="text-sm text-muted">@{partner.username}</p>
      {partner.bio ? <p>{partner.bio}</p> : null}
      {partner.gender ? <p className="text-sm text-muted">{partner.gender}</p> : null}
      <p className="text-sm text-muted">Connected {pretty(partner.connectedAt)}</p>
      <Button variant="ghost" onClick={() => void disconnectPartner().then((result) => setNote(result.ok ? "Disconnected." : result.error))}>Disconnect</Button>
      <ErrorNote>{note}</ErrorNote>
    </div>
  );
}

export function NotificationsScreen() {
  const { data, error, setData } = useLoader(() => listNotifications(), []);
  if (!data && !error) return <Loading />;
  if (!data || !data.ok) return <ErrorNote>{error || "Could not load notifications."}</ErrorNote>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Notifications</h1>
        <button type="button" className="text-sm text-muted" onClick={() => void markNotifications({ data: {} }).then(() => listNotifications().then(setData))}>Mark all read</button>
      </div>
      <p className="text-sm text-muted">These stay inside the app. This web version does not send phone push alerts.</p>
      {data.items.length === 0 ? <p className="text-sm text-muted">Nothing yet.</p> : null}
      {data.items.map((item) => (
        <a
          key={item.id}
          href={item.href || "/notifications"}
          onClick={() => void markNotifications({ data: { id: item.id } })}
          className="block rounded-3xl border border-line bg-paper p-4"
        >
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-sm text-muted">{item.body}</p>
          <p className="mt-1 text-xs text-muted">{item.read ? "Read" : "New"} · {pretty(item.createdAt)}</p>
        </a>
      ))}
    </div>
  );
}

export function SettingsScreen() {
  const shell = useShell();
  const [theme, setTheme] = useState(shell.profile.theme);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Settings</h1>
      <Card className="space-y-3">
        <p className="text-sm font-medium">Appearance</p>
        {(["system", "light", "dark"] as const).map((value) => (
          <button key={value} type="button" onClick={() => {
            setTheme(value);
            void saveSettings({ data: { theme: value } });
          }} className={theme === value ? "min-h-11 w-full rounded-full bg-ink text-sm text-paper" : "min-h-11 w-full rounded-full border border-line text-sm"}>
            {value}
          </button>
        ))}
      </Card>
      <Card className="space-y-3">
        <p className="text-sm font-medium">In-app alerts</p>
        <Toggle label="Invites" checked={shell.profile.notifInvites} onChange={(notifInvites) => void saveSettings({ data: { notifInvites } })} />
        <Toggle label="Games" checked={shell.profile.notifGames} onChange={(notifGames) => void saveSettings({ data: { notifGames } })} />
        <Toggle label="Turns" checked={shell.profile.notifTurns} onChange={(notifTurns) => void saveSettings({ data: { notifTurns } })} />
        <Toggle label="Daily" checked={shell.profile.notifDaily} onChange={(notifDaily) => void saveSettings({ data: { notifDaily } })} />
      </Card>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        setError("");
        void authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true }).then((result) => {
          if (result.error) setError(result.error.message ?? "Could not change the password.");
          else setMessage("Password changed.");
        });
      }}>
        <Field label="Current password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        <Field label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        <Button type="submit" variant="ghost">Change password</Button>
      </form>
      {message ? <p className="text-sm">{message}</p> : null}
      <ErrorNote>{error}</ErrorNote>
      <p className="text-sm text-muted">Signed in as {shell.email}</p>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm">
      {label}
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5" />
    </label>
  );
}

export function PrivacyScreen() {
  const shell = useShell();
  const [message, setMessage] = useState("");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Privacy</h1>
      <Card>
        <p className="text-sm leading-relaxed">Answers are stored for the two players in a round. Your partner cannot read yours until they have submitted theirs as well. That rule is checked on the server, not only hidden on screen. Disconnecting ends the live space. Deleting your account removes shared rounds.</p>
      </Card>
      <Toggle label="Show gender to my partner" checked={shell.profile.showGender} onChange={(showGender) => void saveSettings({ data: { showGender } }).then(() => setMessage("Saved."))} />
      <Toggle label="I am 18 or older" checked={shell.profile.ageConfirmed} onChange={(ageConfirmed) => void saveSettings({ data: { ageConfirmed } }).then(() => setMessage("Saved."))} />
      <Toggle label="Allow intimate questions" checked={shell.profile.allowMature} onChange={(allowMature) => void saveSettings({ data: { allowMature } }).then((result) => setMessage(result.ok ? "Saved. Both of you must opt in." : result.error))} />
      <label className="block text-sm">
        Profile photo
        <input
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void fileToDataUrl(file).then((avatar) => saveSettings({ data: { avatar } })).then((result) => {
              setMessage(result.ok ? "Photo updated." : result.error);
            }).catch((reason: unknown) => setMessage(reason instanceof Error ? reason.message : "Could not use that photo."));
          }}
        />
      </label>
      {message ? <p className="text-sm">{message}</p> : null}
      <Link to="/delete-account" className="text-sm text-rose-deep">Delete account and data</Link>
    </div>
  );
}

export function HelpScreen() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Help</h1>
      <Card>
        <p className="font-medium">How a round works</p>
        <p className="mt-2 text-sm text-muted">One of you starts a game. You answer without seeing the other reply. When both are in, the reveal opens. Take Turns waits for the person whose turn it is. If someone leaves, the round stays until you finish or cancel it.</p>
      </Card>
      <Card>
        <p className="font-medium">Two phones</p>
        <p className="mt-2 text-sm text-muted">Sign each person into their own account. Search the username, accept the invite, then start a game. On one phone, sign out and sign in as the other person to play both sides.</p>
      </Card>
      <Card>
        <p className="font-medium">What this is not</p>
        <p className="mt-2 text-sm text-muted">Matching answers are not a relationship score. Skipping is allowed. Missing a day does not break anything except the streak count, and the streak only rests.</p>
      </Card>
      <p className="text-sm text-muted">Support: write from the account email you used to join. Question reports go to the studio queue.</p>
    </div>
  );
}

export function VerifyScreen() {
  const shell = useShell();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Email</h1>
      <Card>
        <p>{shell.email}</p>
        <p className="mt-2 text-sm text-muted">
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
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Delete account</h1>
      <p className="text-sm text-muted">This removes your profile, notes, and shared games. Your partner is told. It cannot be undone.</p>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        void deleteAccount({ data: { phrase } }).then(async (result) => {
          if (!result.ok) {
            setError(result.error);
            return;
          }
          await signOut().catch(() => undefined);
          void navigate({ to: "/welcome" });
        });
      }}>
        <Field label="Type DELETE" value={phrase} onChange={(event) => setPhrase(event.target.value)} />
        <Button type="submit">Delete everything</Button>
      </form>
      <ErrorNote>{error}</ErrorNote>
    </div>
  );
}

export function AdminScreen() {
  const shell = useShell();
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
      <div className="space-y-4">
        <h1 className="font-display text-4xl">Studio</h1>
        <p className="text-sm text-muted">Question editing is limited to studio roles.</p>
        <form className="space-y-3" onSubmit={(event) => {
          event.preventDefault();
          void claimStudio({ data: { key } }).then((result) => {
            if (!result.ok) setError(result.error);
            else window.location.reload();
          });
        }}>
          <Field label="Studio key" type="password" value={key} onChange={(event) => setKey(event.target.value)} />
          <Button type="submit">Unlock</Button>
        </form>
        <ErrorNote>{error}</ErrorNote>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Studio</h1>
      {overview ? (
        <Card>
          <p className="text-sm tabular-nums">{overview.counts.people} people · {overview.counts.games} games · {overview.counts.answers} answers · {overview.counts.reports} open reports</p>
        </Card>
      ) : null}
      <form className="space-y-3" onSubmit={(event) => {
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
            setText("");
            void load();
          }
        });
      }}>
        <Field label="New question" value={text} onChange={(event) => setText(event.target.value)} />
        <Button type="submit">Add to Getting to Know You</Button>
      </form>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        void adminSearchQuestions({ data: { q: text } }).then((result) => {
          if (result.ok && overview) setOverview({ ...overview, questions: result.questions });
        });
      }}>
        <Button type="submit" variant="ghost">Search questions</Button>
      </form>
      <form className="space-y-3" onSubmit={(event) => {
        event.preventDefault();
        void adminAnnounce({ data: { title, body } }).then((result) => {
          setError(result.ok ? "" : result.error);
          if (result.ok) void load();
        });
      }}>
        <Field label="Announcement title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Field label="Announcement" value={body} onChange={(event) => setBody(event.target.value)} />
        <Button type="submit" variant="soft">Publish note</Button>
      </form>
      <ErrorNote>{error}</ErrorNote>
      {overview?.questions.map((question) => (
        <Card key={question.id}>
          <p className="text-sm">{question.text}</p>
          <p className="mt-1 text-xs text-muted">{question.category} · {question.active ? "active" : "hidden"}</p>
          <button type="button" className="mt-2 text-sm" onClick={() => void adminSetActive({ data: { id: question.id, active: !question.active } }).then(() => load())}>
            {question.active ? "Deactivate" : "Activate"}
          </button>
        </Card>
      ))}
      {overview?.reports.map((report) => (
        <Card key={report.id}>
          <p className="text-sm">{report.reason}</p>
          <div className="mt-2 flex gap-2">
            <Button variant="ghost" onClick={() => void adminSetReport({ data: { id: report.id, status: "reviewed" } }).then(() => load())}>Reviewed</Button>
            <Button variant="ghost" onClick={() => void adminSetReport({ data: { id: report.id, status: "hidden" } }).then(() => load())}>Hide question</Button>
          </div>
        </Card>
      ))}
      {overview?.errors.map((item) => (
        <p key={item.id} className="text-xs text-muted">{item.message}</p>
      ))}
    </div>
  );
}
