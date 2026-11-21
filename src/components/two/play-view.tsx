import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, CircleHelp, Heart, Smile, Star } from "lucide-react";
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
import { Button, Card, ErrorNote, Loading } from "./ui";

type Play = Extract<Awaited<ReturnType<typeof getPlay>>, { ok: true }>;

const REACTIONS = [
  { id: "warm", label: "Warm", icon: Heart },
  { id: "laugh", label: "Funny", icon: Smile },
  { id: "curious", label: "Curious", icon: CircleHelp },
  { id: "keep", label: "Keep", icon: Bookmark },
] as const;

export function PlayView({ gameId }: { gameId: string }) {
  const [state, setState] = useState<Play | null>(null);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [prediction, setPrediction] = useState("");
  const [predictionIndex, setPredictionIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState("");

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
      <div className="flex items-center justify-between text-sm text-muted">
        <Link to="/games">Games</Link>
        <span className="tabular-nums">
          {state.phase === "completed" ? "Round complete" : `${state.game.index + 1} / ${state.game.total}`}
        </span>
      </div>
      <p className="text-sm text-muted">
        {state.game.categoryLabel} · {state.game.mode === "turns" ? "Take turns" : "Answer together"} · with {state.partner.displayName}
      </p>
      <ErrorNote>{error}</ErrorNote>

      {state.phase === "cancelled" ? (
        <Card>
          <h1 className="font-display text-3xl">This round was cancelled.</h1>
          <p className="mt-3 text-sm text-muted">Anything not yet revealed stays hidden.</p>
          <Link to="/" className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-rose-deep">Back home</Link>
        </Card>
      ) : null}

      {state.phase === "wait_turn" ? (
        <Card>
          <h1 className="font-display text-3xl">Waiting for {state.partner.displayName}.</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            It is their turn. You will get the question after they answer. Their words stay hidden until you have both submitted.
          </p>
        </Card>
      ) : null}

      {state.phase === "answer" && question ? (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs uppercase tracking-widest text-muted">{question.answerType === "dare" ? "Dare" : question.answerType === "rather" ? "Would you rather" : "Question"}</p>
            <button
              type="button"
              aria-label={state.saved ? "Remove from favourites" : "Save question"}
              onClick={() => {
                void toggleFavorite({ data: { questionId: question.id } }).then((result) => {
                  if (result.ok) setState({ ...state, saved: result.saved });
                });
              }}
            >
              <Star className={state.saved ? "fill-rose text-rose" : "text-muted"} />
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
                  className={index === choice ? "min-h-11 w-full rounded-2xl bg-rose-deep px-4 text-left text-sm text-paper" : "min-h-11 w-full rounded-2xl border border-line px-4 text-left text-sm"}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={question.answerType === "long" ? 5 : 3}
              placeholder={question.answerType === "dare" ? "A short note after you do it, or skip." : "Your answer"}
              className="mt-5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base outline-none focus:border-rose"
            />
          )}
          {mirror && !choiceType ? (
            <label className="mt-4 block text-sm">
              <span className="font-medium">What will {state.partner.displayName} say?</span>
              <input value={prediction} onChange={(event) => setPrediction(event.target.value)} className="mt-2 min-h-11 w-full rounded-2xl border border-line px-4" />
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
                  className={index === predictionIndex ? "min-h-11 w-full rounded-2xl bg-lavender-deep px-4 text-left text-sm text-paper" : "min-h-11 w-full rounded-2xl bg-lavender px-4 text-left text-sm text-ink"}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-5 flex gap-3">
            <Button className="flex-1" disabled={busy} onClick={() => void send(false)}>Submit</Button>
            <Button variant="ghost" disabled={busy} onClick={() => void send(true)}>Skip</Button>
          </div>
        </Card>
      ) : null}

      {state.phase === "wait_partner" ? (
        <Card>
          <h1 className="font-display text-3xl">Your answer is in.</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {state.partner.displayName} has not submitted yet. You will not see their answer before they do. You can leave and come back.
          </p>
          {state.mine ? <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm">{state.mine.skipped ? "You skipped." : state.mine.body}</p> : null}
        </Card>
      ) : null}

      {state.phase === "reveal" && question && state.mine && state.partnerAnswer && state.tone ? (
        <div className="space-y-4">
          <Card>
            <p className="text-xs uppercase tracking-widest text-muted">Revealed</p>
            <h1 className="mt-3 font-display text-3xl leading-tight">{question.text}</h1>
            <p className="mt-4 font-medium">{state.tone.title}</p>
            <p className="mt-1 text-sm text-muted">{state.tone.detail}</p>
          </Card>
          <AnswerCard name="You" text={state.mine.skipped ? "Skipped" : state.mine.body} guess={mirror ? state.mine.prediction : null} />
          <AnswerCard name={state.partner.displayName} text={state.partnerAnswer.skipped ? "Skipped" : state.partnerAnswer.body} guess={mirror ? state.partnerAnswer.prediction : null} />
          <div className="grid grid-cols-4 gap-2">
            {REACTIONS.map((item) => {
              const Icon = item.icon;
              const active = state.reactions.mine === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void reactToAnswer({ data: { gameId, position: state.game.index, kind: item.id } }).then(() => reload());
                  }}
                  className={active ? "min-h-16 rounded-2xl bg-blush text-xs text-ink" : "min-h-16 rounded-2xl border border-line text-xs text-muted"}
                >
                  <Icon className="mx-auto mb-1 h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {state.partnerAnswer.id ? (
            <button type="button" className="text-sm text-muted underline" onClick={() => void saveFavoriteAnswer({ data: { answerId: state.partnerAnswer!.id } })}>
              Save their answer
            </button>
          ) : null}
          <Button
            className="w-full"
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
          <Card>
            <h1 className="font-display text-3xl">Round finished.</h1>
            <p className="mt-3 text-sm text-muted">
              {state.results.choiceCompared > 0
                ? `Same picks: ${state.results.samePicks} of ${state.results.choiceCompared}. Different picks are not a verdict.`
                : "Open answers sit side by side. There is no compatibility score."}
            </p>
            {state.results.predictionChances > 0 ? (
              <p className="mt-2 text-sm">You called {state.results.youCalled} of {state.results.predictionChances}. They called {state.results.theyCalled}.</p>
            ) : null}
          </Card>
          {state.results.pairs.map((pair) => (
            <Card key={pair.position}>
              <p className="font-display text-xl">{pair.question.text}</p>
              <p className="mt-3 text-sm font-medium">{pair.tone.title}</p>
              <p className="mt-3 text-sm"><span className="text-muted">You · </span>{pair.mine.skipped ? "Skipped" : pair.mine.body}</p>
              <p className="mt-1 text-sm"><span className="text-muted">{state.partner.displayName} · </span>{pair.partner.skipped ? "Skipped" : pair.partner.body}</p>
            </Card>
          ))}
          <Link to="/progress" className="inline-flex min-h-11 items-center text-sm font-medium text-rose-deep">See progress</Link>
        </div>
      ) : null}

      {state.phase !== "completed" && state.phase !== "cancelled" ? (
        <div className="space-y-3 pt-2">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const id = question?.id;
              if (!id || report.trim().length < 3) return;
              void reportQuestion({ data: { questionId: id, reason: report } }).then((result) => {
                if (result.ok) {
                  setReport("");
                  setError("");
                }
              });
            }}
          >
            <input value={report} onChange={(event) => setReport(event.target.value)} placeholder="Report this question" className="min-h-11 flex-1 rounded-full border border-line bg-paper px-4 text-sm" />
            <Button variant="ghost" type="submit">Send</Button>
          </form>
          <div className="flex gap-4 text-sm text-muted">
            <button type="button" onClick={() => void endGame({ data: { gameId } }).then((result) => { if (result.ok && "phase" in result) setState(result); })}>Finish here</button>
            <button type="button" onClick={() => void cancelGame({ data: { gameId } }).then(() => reload())}>Cancel round</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnswerCard({ name, text, guess }: { name: string; text: string; guess?: string | null }) {
  return (
    <Card className="bg-cream">
      <p className="text-sm text-muted">{name}</p>
      <p className="mt-2 text-base">{text}</p>
      {guess ? <p className="mt-2 text-sm text-muted">Guessed: {guess}</p> : null}
    </Card>
  );
}
