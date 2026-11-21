import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { confirmReset, requestReset, saveProfile } from "@/lib/two/api";
import { Button, ErrorNote, Field, Logo, Pill, Splash, Wordmark } from "./ui";

const FEATURES = [
  {
    title: "Answer apart, reveal together",
    body: "You each reply in private. Nothing is shown until both of you have submitted — enforced on the server, not just hidden on screen.",
  },
  {
    title: "Seven ways to ask",
    body: "Getting to know you, how well do you know me, love, deep conversations, fun, would you rather, and truth or dare.",
  },
  {
    title: "A daily question",
    body: "One question a day, the same for both of you. A gentle rhythm that does not punish a missed day.",
  },
  {
    title: "Notes and memories",
    body: "Leave a private note, save a favourite answer, and watch finished rounds gather into a shared history.",
  },
  {
    title: "Built for distance",
    body: "Two phones, two cities, two time zones. Take turns or answer together — the round waits for you.",
  },
  {
    title: "No compatibility score",
    body: "Matching answers are a moment, not a grade. Different answers are a conversation, not a verdict.",
  },
] as const;

const STEPS = [
  { n: "01", title: "Create your account", body: "A name, an email, a password. Or continue with Google or X." },
  { n: "02", title: "Invite your person", body: "Search their username, or hold an email invite until they join." },
  { n: "03", title: "Start a round", body: "Pick a category, answer in private, and reveal when you are both in." },
] as const;

export function WelcomePage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <Splash />;
  if (user) return <Navigate to="/" />;

  return (
    <main className="min-h-dvh bg-cream text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line/70 glass">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5 lg:px-8">
          <Wordmark compact />
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden min-h-9 items-center rounded-full px-4 text-sm font-medium text-muted transition-colors hover:text-ink sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/join"
              className="inline-flex min-h-9 items-center rounded-full bg-rose-deep px-4 text-sm font-medium text-paper transition hover:brightness-110"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="surface-wash absolute inset-0" aria-hidden="true" />
        <div className="surface-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/80 px-3 py-1.5 text-xs font-medium text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-rose pulse-ring" />
                A private game for two
              </span>
              <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight lg:text-6xl">
                Every question
                <br />
                brings you <span className="text-gradient">closer</span>.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
                Two of Us is a question game for couples — including the long-distance kind. Answer
                in private, reveal together, and keep the conversations that matter.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/join"
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-deep px-7 text-sm font-medium text-paper shadow-[var(--shadow-soft)] transition hover:brightness-110 active:scale-[0.99]"
                >
                  Create your account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-paper px-7 text-sm font-medium transition hover:border-rose/60"
                >
                  I already have one
                </Link>
              </div>
              <p className="mt-5 text-xs text-muted">
                Free to play · No compatibility score · Skip anything, nothing is owed
              </p>
            </div>

            {/* Hero card mock */}
            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <div className="float-slow rounded-[2rem] border border-line bg-paper p-5 shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-between">
                  <Pill tone="rose">Question 3 of 8</Pill>
                  <span className="text-xs text-muted">Love &amp; Romance</span>
                </div>
                <p className="mt-5 font-display text-2xl leading-snug">
                  What small thing does the other person do that you would miss most?
                </p>
                <div className="mt-5 space-y-2.5">
                  <div className="rounded-2xl border border-line bg-cream px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">You</p>
                    <p className="mt-1 text-sm">The way you hum while making coffee.</p>
                  </div>
                  <div className="rounded-2xl border border-rose/30 bg-blush px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Them</p>
                    <p className="mt-1 text-sm">How you always leave a light on for me.</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Pill tone="sage">Revealed</Pill>
                  <Pill tone="lavender">Both answered</Pill>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-line bg-paper px-4 py-3 shadow-[var(--shadow-soft)] sm:block">
                <p className="font-display text-2xl leading-none tabular-nums">12</p>
                <p className="mt-1 text-[11px] text-muted">day streak</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-paper/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-deep">What is inside</p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight lg:text-4xl">
              Small questions, asked properly.
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Not a quiz to win. A set of prompts that give the two of you somewhere to go.
            </p>
          </div>
          <div className="stagger mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[var(--radius-card)] border border-line bg-paper p-5 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <h3 className="font-display text-lg leading-snug">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-deep">How it works</p>
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight lg:text-4xl">
                Three steps to your first round.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted">
                It takes about two minutes to set up, and the first game is ready straight away.
              </p>
            </div>
            <ol className="space-y-3">
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-paper p-5"
                >
                  <span className="font-display text-2xl leading-none text-rose/70 tabular-nums">{step.n}</span>
                  <span>
                    <span className="block font-medium">{step.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="surface-wash relative overflow-hidden rounded-[2rem] border border-line px-6 py-12 text-center lg:px-12 lg:py-16">
            <h2 className="mx-auto max-w-xl font-display text-3xl leading-tight tracking-tight lg:text-4xl">
              Start with one question tonight.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted">
              Create an account, invite your person, and see what you both say.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/join"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-rose-deep px-7 text-sm font-medium text-paper transition hover:brightness-110"
              >
                Create your account
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-paper px-7 text-sm font-medium transition hover:border-rose/60"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row lg:px-8">
          <Wordmark compact />
          <p>Made for two people, including the long-distance kind.</p>
        </div>
      </footer>
    </main>
  );
}

function AuthScreen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="surface-wash min-h-dvh bg-cream px-6 py-10 text-ink">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Link to="/welcome" aria-label="Back to the start">
          <Logo />
        </Link>
        <h1 className="font-display text-4xl tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  );
}

export function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  if (isPending) return <Splash />;
  if (user) return <Navigate to="/" />;
  return (
    <AuthScreen title="Welcome back">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          void authClient.signIn
            .email({ email, password })
            .then((result) => {
              if (result.error) {
                setError(result.error.message ?? "Could not sign in.");
                setPending(false);
                return;
              }
              void navigate({ to: "/" });
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Could not sign in.");
              setPending(false);
            });
        }}
      >
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <ErrorNote>{error}</ErrorNote>
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="space-y-3">
        {GROK_PROVIDERS.map((provider) => (
          <Button key={provider.providerId} variant="ghost" className="w-full" type="button" onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}>
            Continue with {provider.label}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted">
        <Link to="/recover" className="underline">Forgot password</Link>
        {" · "}
        <Link to="/join" className="underline">Create an account</Link>
      </p>
    </AuthScreen>
  );
}

export function JoinPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  if (isPending) return <Splash />;
  if (user) return <Navigate to="/setup" />;
  return (
    <AuthScreen title="Create your account">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (password.length < 8) {
            setError("Use at least 8 characters.");
            return;
          }
          setPending(true);
          setError("");
          void authClient.signUp
            .email({ email, password, name: name.trim() || "Friend" })
            .then((result) => {
              if (result.error) {
                setError(result.error.message ?? "Could not create the account.");
                setPending(false);
                return;
              }
              void navigate({ to: "/setup" });
            })
            .catch((reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Could not create the account.");
              setPending(false);
            });
        }}
      >
        <Field label="Your name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Field label="Password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <p className="text-sm text-muted">This web version does not send a verification email. Your account still works. Google and X are available on the sign-in screen.</p>
        <ErrorNote>{error}</ErrorNote>
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-muted">
        Already joined? <Link to="/login" className="underline">Sign in</Link>
      </p>
    </AuthScreen>
  );
}

export function RecoverPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  return (
    <AuthScreen title="Reset password">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          void requestReset({ data: { email } }).then((result) => {
            setMessage(result.message);
            setPreview(result.previewCode);
          });
        }}
      >
        <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Button className="w-full" type="submit">Send a reset code</Button>
      </form>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
      {preview ? <p className="rounded-2xl bg-lavender px-4 py-3 font-medium tabular-nums">Code {preview}</p> : null}
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          void confirmReset({ data: { email, code, password } }).then((result) => {
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setDone(true);
          });
        }}
      >
        <Field label="Code" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} />
        <Field label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <ErrorNote>{error}</ErrorNote>
        {done ? <p className="text-sm">Password updated. <Link to="/login" className="underline">Sign in</Link></p> : null}
        <Button variant="soft" className="w-full" type="submit">Set new password</Button>
      </form>
    </AuthScreen>
  );
}

export function SetupPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<"" | "woman" | "man" | "nonbinary" | "unspecified">("");
  const [birthYear, setBirthYear] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user?.displayName]);
  if (isPending) return <Splash />;
  if (!user) return <RedirectToSignIn to="/welcome" />;
  return (
    <AuthScreen title="Make your profile">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          void saveProfile({
            data: {
              username,
              displayName,
              bio: "",
              gender: gender || null,
              showGender: false,
              birthYear: birthYear ? Number(birthYear) : null,
              ageConfirmed,
            },
          }).then((result) => {
            setPending(false);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            void navigate({ to: "/" });
          });
        }}
      >
        <Field label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
        <Field label="Username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="lovelyemma" required />
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Gender, if you want it on record</span>
          <select className="min-h-11 w-full rounded-2xl border border-line bg-paper px-4" value={gender} onChange={(event) => setGender(event.target.value as typeof gender)}>
            <option value="">Skip</option>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
            <option value="nonbinary">Non-binary</option>
            <option value="unspecified">Prefer not to say</option>
          </select>
        </label>
        <Field label="Birth year, optional" inputMode="numeric" value={birthYear} onChange={(event) => setBirthYear(event.target.value)} placeholder="1996" />
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} />
          <span>I am 18 or older. This only unlocks the option for more intimate questions later.</span>
        </label>
        <ErrorNote>{error}</ErrorNote>
        <Button className="w-full" type="submit" disabled={pending}>{pending ? "Saving…" : "Enter TWO OF US"}</Button>
      </form>
    </AuthScreen>
  );
}
