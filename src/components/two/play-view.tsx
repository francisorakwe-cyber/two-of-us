import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Check, CircleHelp, Heart, Smile, Star, X } from "lucide-react";
import {
  advanceGame,
  cancelGame,
  endGame,
  getPlay,
  reactToAnswer,
  reportQuestion,
  saveFavoriteAnswer,
  submitAnswer,
  toggleFavorite,
} from "@/lib/two/api";
import { useToast } from "./toast";
import {
  Avatar,
  Button,
  Card,
  ErrorNote,
  Loading,
  Pill,
  ProgressBar,
  TextArea,
  cn,
} from "./ui";

type Play = Extract<Awaited<ReturnType<typeof getPlay>>, { ok: true }>;

const REACTIONS = [
  { id: "warm", label: "Warm", icon: Heart },
  { id: "laugh", label: "Funny", icon: Smile },
  { id: "curious", label: "Curious", icon: CircleHelp },
  { id: "keep", label: "Keep", icon: Bookmark },
] as const;

export function PlayView({ gameId }: { gameId: string }) {
  const toast = useToast();
  const [state, setState] = useState<Play | null>(null);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [prediction, setPrediction] = useState("");
  const [predictionIndex, setPredictionIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState("");
  const [showReport, setShowReport] = useState(false);

  async function reload() {
    const result = await getPlay({ data: { gameId } });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setState(result);
    setError("");
  }

  useEffect(() => {
    let live = true;
    getPlay({ data: { gameId } }).then((result) => {
      if (!live) return;
      if (!result.ok) setError(result.error);
      else setState(result);
    });
    return () => {
      live = false;
    };
  }, [gameId]);

  useEffect(() => {
    if (!state || (state.phase !== "wait_partner" && state.phase !== "wait_turn")) return;
    const timer = window.setInterval(() => {
      void reload();
    }, 4000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.phase, gameId]);

  useEffect(() => {
    setBody("");
    setChoice(null);
    setPrediction("");
    setPredictionIndex(null);
  }, [state?.question?.id, state?.phase]);

  if (!state && !error) return <Loading label="Opening the game" />;
  if (!state) return <ErrorNote>{error}</ErrorNote>;

  const current = state;
  const question = state.question;
  const mirror = state.game.category === "mirror";
  const choiceType = question?.answerType === "choice" || question?.answerType === "rather";
  const progress = state.game.total > 0 ? state.game.index : 0;

  async function send(skipped: boolean) {
    if (!question) return;
    setBusy(true);
    setError("");
    const result = await submitAnswer({
      data: {
        gameId,
        position: current.game.index,
        body,
        choiceIndex: choice,
        prediction,
        predictionIndex,
        skipped,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setError("error" in result ? result.error : "Could not send that answer.");
      return;
    }
    if ("phase" in result) setState(result);
  }

  return (
    <div className="rise space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/games"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-ink"
        >
          <span aria-hidden="true">←</span> Games
        </Link>
        <span className="text-sm text-muted tabular-nums">
          {state.phase === "completed" ? "Round complete" : `${state.game.index + 1} / ${state.game.total}`}
        </span>
      </div>

      {state.phase !== "completed" && state.phase !== "cancelled" ? (
        <ProgressBar value={progress} max={state.game.total} />
      ) : null}

      <div className="flex items-center gap-2 text-sm text-muted">
        <Pill tone="lavender">{state.game.categoryLabel}</Pill>
        <Pill tone="neutral">{state.game.mode === "turns" ? "Take turns" : "Answer together"}</Pill>
        <span className="ml-auto flex items-center gap-1.5">
          <Avatar name={state.partner.displayName} src={state.partner.avatar} size="xs" />
          <span className="truncate">{state.partner.displayName}</span>
        </span>
      </div>

      <ErrorNote>{error}</ErrorNote>

      {state.phase === "cancelled" ? (
        <Card>
          <h1 className="font-display text-3xl leading-tight">This round was cancelled.</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">Anything not yet revealed stays hidden.</p>
          <Link
            to="/"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper"
          >
            Back home
          </Link>
        </Card>
      ) : null}

      {state.phase === "wait_turn" ? (
        <Card className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lavender">
            <Avatar name={state.partner.displayName} src={state.partner.avatar} size="md" />
          </span>
          <h1 className="mt-4 font-display text-2xl leading-tight">Waiting for {state.partner.displayName}.</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            It is their turn. You will get the question after they answer. Their words stay hidden until you
            have both submitted.
          </p>
          <p className="mt-4 text-xs text-muted">This page checks again every few seconds.</p>
        </Card>
      ) : null}

      {state.phase === "answer" && question ? (
        <Card className="pop">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              {question.answerType === "dare"
                ? "Dare"
                : question.answerType === "rather"
                  ? "Would you rather"
                  : "Question"}
            </p>
            <button
              type="button"
              aria-label={state.saved ? "Remove from favourites" : "Save question"}
              aria-pressed={state.saved}
              onClick={() => {
                void toggleFavorite({ data: { questionId: question.id } }).then((result) => {
                  if (result.ok) {
                    setState({ ...state, saved: result.saved });
                    toast.success(result.saved ? "Saved to favourites." : "Removed from favourites.");
                  }
                });
              }}
              className="-mr-1 rounded-full p-1.5 transition-colors hover:bg-cream"
            >
              <Star className={cn("h-5 w-5", state.saved ? "fill-rose text-rose" : "text-muted")} />
            </button>
          </div>

          <h1 className="mt-3 font-display text-3xl leading-tight">{question.text}</h1>

          {choiceType ? (
            <div className="mt-5 space-y-2">
              {question.choices.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setChoice(index)}
                  aria-pressed={choice === index}
                  className={cn(
                    "min-h-12 w-full rounded-2xl border px-4 text-left text-sm transition-colors",
                    index === choice
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
              rows={question.answerType === "long" ? 5 : 3}
              placeholder={
                question.answerType === "dare" ? "A short note after you do it, or skip." : "Your answer"
              }
              className="mt-5"
            />
          )}

          {mirror && !choiceType ? (
            <label className="mt-4 block text-sm">
              <span className="font-medium">What will {state.partner.displayName} say?</span>
              <input
                value={prediction}
                onChange={(event) => setPrediction(event.target.value)}
                placeholder="Your guess"
                className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-paper px-4 outline-none focus:border-rose focus:ring-4 focus:ring-rose/10"
              />
            </label>
          ) : null}

          {mirror && choiceType ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium">What will they pick?</p>
              {question.choices.map((option, index) => (
                <button
                  key={`p-${option}`}
                  type="button"
                  onClick={() => setPredictionIndex(index)}
                  aria-pressed={predictionIndex === index}
                  className={cn(
                    "min-h-11 w-full rounded-2xl border px-4 text-left text-sm transition-colors",
                    index === predictionIndex
                      ? "border-transparent bg-lavender-deep text-paper"
                      : "border-line bg-lavender/50 text-ink hover:border-lavender-deep/50",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex gap-3">
            <Button className="flex-1" size="lg" loading={busy} disabled={busy} onClick={() => void send(false)}>
              Submit
            </Button>
            <Button variant="ghost" size="lg" disabled={busy} onClick={() => void send(true)}>
              Skip
            </Button>
          </div>
        </Card>
      ) : null}

      {state.phase === "wait_partner" ? (
        <Card className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage">
            <Check className="h-6 w-6 text-sage-deep" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl leading-tight">Your answer is in.</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            {state.partner.displayName} has not submitted yet. You will not see their answer before they do.
            You can leave and come back.
          </p>
          {state.mine ? (
            <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-left text-sm">
              {state.mine.skipped ? "You skipped." : state.mine.body}
            </p>
          ) : null}
        </Card>
      ) : null}

      {state.phase === "reveal" && question && state.mine && state.partnerAnswer && state.tone ? (
        <div className="space-y-4">
          <Card className="pop">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Revealed</p>
            <h1 className="mt-3 font-display text-3xl leading-tight">{question.text}</h1>
            <p className="mt-4 font-medium">{state.tone.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{state.tone.detail}</p>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <AnswerCard
              name="You"
              text={state.mine.skipped ? "Skipped" : state.mine.body}
              guess={mirror ? state.mine.prediction : null}
              tone="neutral"
            />
            <AnswerCard
              name={state.partner.displayName}
              text={state.partnerAnswer.skipped ? "Skipped" : state.partnerAnswer.body}
              guess={mirror ? state.partnerAnswer.prediction : null}
              tone="rose"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">React</p>
            <div className="grid grid-cols-4 gap-2">
              {REACTIONS.map((item) => {
                const Icon = item.icon;
                const active = state.reactions.mine === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      void reactToAnswer({ data: { gameId, position: state.game.index, kind: item.id } }).then(() =>
                        reload(),
                      );
                    }}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border text-xs transition-colors",
                      active
                        ? "border-transparent bg-blush text-ink"
                        : "border-line bg-paper text-muted hover:border-rose/40 hover:text-ink",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active && "fill-rose text-rose-deep")} aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {state.partnerAnswer.id ? (
            <button
              type="button"
              className="text-sm text-muted underline transition-colors hover:text-rose-deep"
              onClick={() =>
                void saveFavoriteAnswer({ data: { answerId: state.partnerAnswer!.id } }).then(() =>
                  toast.success("Their answer saved."),
                )
              }
            >
              Save their answer
            </button>
          ) : null}

          <Button
            className="w-full"
            size="lg"
            loading={busy}
            onClick={() => {
              setBusy(true);
              void advanceGame({ data: { gameId, from: state.game.index } }).then((result) => {
                setBusy(false);
                if (result.ok && "phase" in result) setState(result);
                else if (!result.ok) setError(result.error);
              });
            }}
          >
            {state.game.index + 1 >= state.game.total ? "See the round" : "Next question"}
          </Button>
        </div>
      ) : null}

      {state.phase === "completed" && state.results ? (
        <div className="space-y-4">
          <Card className="surface-wash text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper">
              <Check className="h-6 w-6 text-rose-deep" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-3xl leading-tight">Round finished.</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {state.results.choiceCompared > 0
                ? `Same picks: ${state.results.samePicks} of ${state.results.choiceCompared}. Different picks are not a verdict.`
                : "Open answers sit side by side. There is no compatibility score."}
            </p>
            {state.results.predictionChances > 0 ? (
              <p className="mt-3 text-sm">
                You called {state.results.youCalled} of {state.results.predictionChances}. They called{" "}
                {state.results.theyCalled}.
              </p>
            ) : null}
          </Card>

          <div className="stagger space-y-3">
            {state.results.pairs.map((pair) => (
              <Card key={pair.position}>
                <p className="font-display text-xl leading-snug">{pair.question.text}</p>
                <p className="mt-2 text-sm font-medium">{pair.tone.title}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted">You · </span>
                    {pair.mine.skipped ? "Skipped" : pair.mine.body}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted">{state.partner.displayName} · </span>
                    {pair.partner.skipped ? "Skipped" : pair.partner.body}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/progress"
              className="inline-flex min-h-11 items-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper"
            >
              See progress
            </Link>
            <Link
              to="/games"
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-5 text-sm font-medium"
            >
              Play another
            </Link>
          </div>
        </div>
      ) : null}

      {state.phase !== "completed" && state.phase !== "cancelled" ? (
        <div className="space-y-3 border-t border-line pt-4">
          {showReport ? (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                const id = question?.id;
                if (!id || report.trim().length < 3) return;
                void reportQuestion({ data: { questionId: id, reason: report } }).then((result) => {
                  if (result.ok) {
                    setReport("");
                    setShowReport(false);
                    toast.success("Report sent. Thank you.");
                  }
                });
              }}
            >
              <input
                value={report}
                onChange={(event) => setReport(event.target.value)}
                placeholder="What is wrong with this question?"
                aria-label="Report reason"
                className="min-h-11 flex-1 rounded-full border border-line bg-paper px-4 text-sm outline-none focus:border-rose"
              />
              <Button variant="ghost" type="submit">
                Send
              </Button>
              <Button variant="quiet" type="button" onClick={() => setShowReport(false)} aria-label="Cancel report">
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="text-xs text-muted underline transition-colors hover:text-ink"
            >
              Report this question
            </button>
          )}
          <div className="flex gap-4 text-sm text-muted">
            <button
              type="button"
              className="transition-colors hover:text-ink"
              onClick={() =>
                void endGame({ data: { gameId } }).then((result) => {
                  if (result.ok && "phase" in result) setState(result);
                })
              }
            >
              Finish here
            </button>
            <button
              type="button"
              className="transition-colors hover:text-ink"
              onClick={() => void cancelGame({ data: { gameId } }).then(() => reload())}
            >
              Cancel round
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnswerCard({
  name,
  text,
  guess,
  tone,
}: {
  name: string;
  text: string;
  guess?: string | null;
  tone: "neutral" | "rose";
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border p-4",
        tone === "rose" ? "border-rose/30 bg-blush" : "border-line bg-cream",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{name}</p>
      <p className="mt-2 text-base leading-relaxed">{text}</p>
      {guess ? <p className="mt-2 text-sm text-muted">Guessed: {guess}</p> : null}
    </div>
  );
}
