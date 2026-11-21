import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { confirmReset, requestReset, saveProfile } from "@/lib/two/api";
import { Button, ErrorNote, Field, Logo, Splash } from "./ui";

export function WelcomePage() {
  const { user, isPending } = useCurrentUserState();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step !== 0) return;
    const timer = window.setTimeout(() => setStep(1), 900);
    return () => window.clearTimeout(timer);
  }, [step]);
  if (isPending) return <Splash />;
  if (user) return <Navigate to="/" />;
  const slides = [
    {
      title: "Answer apart. Reveal together.",
      body: "You each reply in private. Nothing is shown until both of you have submitted.",
    },
    {
      title: "One partner. A shared space.",
      body: "Find them by username, or hold an email invite until they join.",
    },
    {
      title: "Questions with somewhere to go.",
      body: "Light, romantic, or serious. Different answers are a conversation, not a score.",
    },
  ];
  return (
    <main className="grid min-h-dvh bg-cream px-6 py-10 text-ink">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <Logo />
        {step === 0 ? (
          <div className="my-auto">
            <h1 className="font-display text-5xl">TWO OF US</h1>
            <p className="mt-3 text-muted">Every question brings you closer.</p>
          </div>
        ) : (
          <div className="my-auto rise">
            <p className="text-sm text-muted">0{step} / 03</p>
            <h1 className="mt-3 font-display text-4xl">{slides[step - 1]?.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{slides[step - 1]?.body}</p>
          </div>
        )}
        <div className="space-y-3">
          {step > 0 && step < 3 ? (
            <Button className="w-full" onClick={() => setStep((value) => value + 1)}>
              Continue
            </Button>
          ) : null}
          {step === 3 ? (
            <>
              <Link to="/join" className="flex min-h-11 items-center justify-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper">
                Create an account
              </Link>
              <Link to="/login" className="flex min-h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-medium">
                I already have one
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function AuthScreen({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-cream px-6 py-10 text-ink">
      <div className="mx-auto w-full max-w-md space-y-6">
        <Logo />
        <h1 className="font-display text-4xl">{title}</h1>
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
