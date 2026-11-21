import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as toggleFavorite, H as reactToAnswer, K as saveFavoriteAnswer, O as endGame, U as reportQuestion, Z as submitAnswer, _ as advanceGame, i as ErrorNote, j as getPlay, n as Button, o as Loading, r as Card, v as cancelGame } from "./ui-oiZltzWj.mjs";
import { a as Star, f as Heart, g as CircleHelp, o as Smile, v as Bookmark } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-BzEIgKth.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play._gameId-Df9O07BQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var REACTIONS = [
	{
		id: "warm",
		label: "Warm",
		icon: Heart
	},
	{
		id: "laugh",
		label: "Funny",
		icon: Smile
	},
	{
		id: "curious",
		label: "Curious",
		icon: CircleHelp
	},
	{
		id: "keep",
		label: "Keep",
		icon: Bookmark
	}
];
function PlayView({ gameId }) {
	const [state, setState] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [choice, setChoice] = (0, import_react.useState)(null);
	const [prediction, setPrediction] = (0, import_react.useState)("");
	const [predictionIndex, setPredictionIndex] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [report, setReport] = (0, import_react.useState)("");
	async function reload() {
		const result = await getPlay({ data: { gameId } });
		if (!result.ok) {
			setError(result.error);
			return;
		}
		setState(result);
		setError("");
	}
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (!state || state.phase !== "wait_partner" && state.phase !== "wait_turn") return;
		const timer = window.setInterval(() => {
			reload();
		}, 4e3);
		return () => window.clearInterval(timer);
	}, [state?.phase, gameId]);
	(0, import_react.useEffect)(() => {
		setBody("");
		setChoice(null);
		setPrediction("");
		setPredictionIndex(null);
	}, [state?.question?.id, state?.phase]);
	if (!state && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, { label: "Opening the game" });
	if (!state) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error });
	const current = state;
	const question = state.question;
	const mirror = state.game.category === "mirror";
	const choiceType = question?.answerType === "choice" || question?.answerType === "rather";
	async function send(skipped) {
		if (!question) return;
		setBusy(true);
		setError("");
		const result = await submitAnswer({ data: {
			gameId,
			position: current.game.index,
			body,
			choiceIndex: choice,
			prediction,
			predictionIndex,
			skipped
		} });
		setBusy(false);
		if (!result.ok) {
			setError("error" in result ? result.error : "Could not send that answer.");
			return;
		}
		if ("phase" in result) setState(result);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rise space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/games",
					children: "Games"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "tabular-nums",
					children: state.phase === "completed" ? "Round complete" : `${state.game.index + 1} / ${state.game.total}`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					state.game.categoryLabel,
					" · ",
					state.game.mode === "turns" ? "Take turns" : "Answer together",
					" · with ",
					state.partner.displayName
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
			state.phase === "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "This round was cancelled."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Anything not yet revealed stays hidden."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-5 inline-flex min-h-11 items-center text-sm font-medium text-rose-deep",
					children: "Back home"
				})
			] }) : null,
			state.phase === "wait_turn" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "font-display text-3xl",
				children: [
					"Waiting for ",
					state.partner.displayName,
					"."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm leading-relaxed text-muted",
				children: "It is their turn. You will get the question after they answer. Their words stay hidden until you have both submitted."
			})] }) : null,
			state.phase === "answer" && question ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-muted",
						children: question.answerType === "dare" ? "Dare" : question.answerType === "rather" ? "Would you rather" : "Question"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": state.saved ? "Remove from favourites" : "Save question",
						onClick: () => {
							toggleFavorite({ data: { questionId: question.id } }).then((result) => {
								if (result.ok) setState({
									...state,
									saved: result.saved
								});
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: state.saved ? "fill-rose text-rose" : "text-muted" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-3xl leading-tight",
					children: question.text
				}),
				choiceType ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5 space-y-2",
					children: question.choices.map((option, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setChoice(index),
						className: index === choice ? "min-h-11 w-full rounded-2xl bg-rose-deep px-4 text-left text-sm text-paper" : "min-h-11 w-full rounded-2xl border border-line px-4 text-left text-sm",
						children: option
					}, option))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: body,
					onChange: (event) => setBody(event.target.value),
					rows: question.answerType === "long" ? 5 : 3,
					placeholder: question.answerType === "dare" ? "A short note after you do it, or skip." : "Your answer",
					className: "mt-5 w-full rounded-2xl border border-line bg-cream px-4 py-3 text-base outline-none focus:border-rose"
				}),
				mirror && !choiceType ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium",
						children: [
							"What will ",
							state.partner.displayName,
							" say?"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: prediction,
						onChange: (event) => setPrediction(event.target.value),
						className: "mt-2 min-h-11 w-full rounded-2xl border border-line px-4"
					})]
				}) : null,
				mirror && choiceType ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "What will they pick?"
					}), question.choices.map((option, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPredictionIndex(index),
						className: index === predictionIndex ? "min-h-11 w-full rounded-2xl bg-lavender-deep px-4 text-left text-sm text-paper" : "min-h-11 w-full rounded-2xl bg-lavender px-4 text-left text-sm text-ink",
						children: option
					}, `p-${option}`))]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "flex-1",
						disabled: busy,
						onClick: () => void send(false),
						children: "Submit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						disabled: busy,
						onClick: () => void send(true),
						children: "Skip"
					})]
				})
			] }) : null,
			state.phase === "wait_partner" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Your answer is in."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: [state.partner.displayName, " has not submitted yet. You will not see their answer before they do. You can leave and come back."]
				}),
				state.mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded-2xl bg-cream px-4 py-3 text-sm",
					children: state.mine.skipped ? "You skipped." : state.mine.body
				}) : null
			] }) : null,
			state.phase === "reveal" && question && state.mine && state.partnerAnswer && state.tone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted",
							children: "Revealed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 font-display text-3xl leading-tight",
							children: question.text
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-medium",
							children: state.tone.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: state.tone.detail
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnswerCard, {
						name: "You",
						text: state.mine.skipped ? "Skipped" : state.mine.body,
						guess: mirror ? state.mine.prediction : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnswerCard, {
						name: state.partner.displayName,
						text: state.partnerAnswer.skipped ? "Skipped" : state.partnerAnswer.body,
						guess: mirror ? state.partnerAnswer.prediction : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-2",
						children: REACTIONS.map((item) => {
							const Icon = item.icon;
							const active = state.reactions.mine === item.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									reactToAnswer({ data: {
										gameId,
										position: state.game.index,
										kind: item.id
									} }).then(() => reload());
								},
								className: active ? "min-h-16 rounded-2xl bg-blush text-xs text-ink" : "min-h-16 rounded-2xl border border-line text-xs text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "mx-auto mb-1 h-4 w-4",
									"aria-hidden": "true"
								}), item.label]
							}, item.id);
						})
					}),
					state.partnerAnswer.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-muted underline",
						onClick: () => void saveFavoriteAnswer({ data: { answerId: state.partnerAnswer.id } }),
						children: "Save their answer"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: () => {
							setBusy(true);
							advanceGame({ data: {
								gameId,
								from: state.game.index
							} }).then((result) => {
								setBusy(false);
								if (result.ok && "phase" in result) setState(result);
								else if (!result.ok) setError(result.error);
							});
						},
						children: state.game.index + 1 >= state.game.total ? "See the round" : "Next question"
					})
				]
			}) : null,
			state.phase === "completed" && state.results ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl",
							children: "Round finished."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: state.results.choiceCompared > 0 ? `Same picks: ${state.results.samePicks} of ${state.results.choiceCompared}. Different picks are not a verdict.` : "Open answers sit side by side. There is no compatibility score."
						}),
						state.results.predictionChances > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm",
							children: [
								"You called ",
								state.results.youCalled,
								" of ",
								state.results.predictionChances,
								". They called ",
								state.results.theyCalled,
								"."
							]
						}) : null
					] }),
					state.results.pairs.map((pair) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl",
							children: pair.question.text
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-medium",
							children: pair.tone.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "You · "
							}), pair.mine.skipped ? "Skipped" : pair.mine.body]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [state.partner.displayName, " · "]
							}), pair.partner.skipped ? "Skipped" : pair.partner.body]
						})
					] }, pair.position)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/progress",
						className: "inline-flex min-h-11 items-center text-sm font-medium text-rose-deep",
						children: "See progress"
					})
				]
			}) : null,
			state.phase !== "completed" && state.phase !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						const id = question?.id;
						if (!id || report.trim().length < 3) return;
						reportQuestion({ data: {
							questionId: id,
							reason: report
						} }).then((result) => {
							if (result.ok) {
								setReport("");
								setError("");
							}
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: report,
						onChange: (event) => setReport(event.target.value),
						placeholder: "Report this question",
						className: "min-h-11 flex-1 rounded-full border border-line bg-paper px-4 text-sm"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						type: "submit",
						children: "Send"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 text-sm text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void endGame({ data: { gameId } }).then((result) => {
							if (result.ok && "phase" in result) setState(result);
						}),
						children: "Finish here"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void cancelGame({ data: { gameId } }).then(() => reload()),
						children: "Cancel round"
					})]
				})]
			}) : null
		]
	});
}
function AnswerCard({ name, text, guess }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-base",
				children: text
			}),
			guess ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: ["Guessed: ", guess]
			}) : null
		]
	});
}
var SplitComponent = function PlayRoute() {
	const { gameId } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayView, { gameId });
};
//#endregion
export { SplitComponent as component };
