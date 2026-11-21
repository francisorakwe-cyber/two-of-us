import { o as __toESM } from "../_runtime.mjs";
import { S as useNavigate, Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as signOut, t as authClient } from "./client-IWHfIGH2.mjs";
import { s as greeting, t as CATEGORIES } from "./logic-CEZ1fjvJ.mjs";
import { n as UserButton } from "./gates-CI9FVQNg.mjs";
import { A as getHome, B as markNotifications, C as createFavoriteGame, D as disconnectPartner, E as deleteNote, F as inviteByEmail, G as respondInvite, I as listFavorites, J as saveSettings, L as listInvites, M as getProgress, P as getUs, Q as submitDaily, R as listNotes, T as deleteAccount, V as pretty, X as sendInvite, Y as searchPeople, a as Field, d as adminAnnounce, f as adminOverview, g as adminSetReport, h as adminSetActive, i as ErrorNote, k as fileToDataUrl, m as adminSearchQuestions, n as Button, o as Loading, p as adminSaveQuestion, r as Card, t as Avatar, u as addNote, w as createGame, x as completeChallenge, y as claimStudio, z as listNotifications } from "./ui-oiZltzWj.mjs";
import { c as Moon, i as Sunrise, m as Compass, p as Eye, s as Shuffle, t as Zap, u as Laugh, y as Bell } from "../_libs/lucide-react.mjs";
import { n as useShell } from "./shell-B48EGGjk.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/screens-EhguTc_6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	know: Compass,
	mirror: Eye,
	love: Sunrise,
	deep: Moon,
	fun: Laugh,
	rather: Shuffle,
	spark: Zap
};
function useLoader(load, deps) {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let live = true;
		load().then((value) => {
			if (live) setData(value);
		}).catch((reason) => {
			if (live) setError(reason instanceof Error ? reason.message : "Something went wrong.");
		});
		return () => {
			live = false;
		};
	}, deps);
	return {
		data,
		error,
		setData
	};
}
function HomeScreen() {
	const shell = useShell();
	const { data, error } = useLoader(() => getHome(), []);
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error });
	if (!data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: data.error });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: greeting((/* @__PURE__ */ new Date()).getHours())
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: data.name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/notifications",
					className: "relative grid h-11 w-11 place-items-center rounded-full bg-paper text-ink",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "sr-only",
							children: ["Notifications", shell.unread ? `, ${shell.unread} new` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
							className: "h-5 w-5",
							"aria-hidden": "true"
						}),
						shell.unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-2 h-2 w-2 rounded-full bg-rose" }) : null
					]
				})]
			}),
			data.announcement ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-lavender",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: data.announcement.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm",
					children: data.announcement.body
				})]
			}) : null,
			data.partner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						name: shell.profile.displayName,
						src: shell.profile.avatar
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						className: "-ml-3 ring-2 ring-paper",
						name: data.partner.displayName,
						src: data.partner.avatar
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: data.partner.displayName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: ["Connected ", pretty(data.partner.connectedAt)]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted tabular-nums",
				children: data.streak > 0 ? `${data.streak} day streak. Miss a day and it simply rests.` : "Play when you feel like it. A missed day does not punish you."
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Bring someone in."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "One partner at a time. Both of you accept before anything is shared."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/connect",
					className: "mt-4 inline-flex min-h-11 items-center text-sm font-medium text-rose-deep",
					children: "Find your partner"
				})
			] }),
			data.continueGame ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/play/$gameId",
				params: { gameId: data.continueGame.id },
				className: "block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "bg-blush",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: "Continue"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: data.continueGame.label
					})]
				})
			}) : null,
			data.daily ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Question of the day"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-display text-2xl",
					children: data.daily.question.text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/daily",
					className: "mt-4 inline-flex text-sm font-medium text-rose-deep",
					children: data.daily.submitted ? "See today's card" : "Answer it"
				})
			] }) : null,
			data.challenge ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Today's couple prompt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2",
					children: data.challenge.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: data.challenge.done ? "Marked done." : "Optional. Nothing happens if you skip it."
				})
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/games",
				className: "flex min-h-12 items-center justify-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper",
				children: "Play together"
			}),
			data.recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl",
					children: "Recent"
				}), data.recent.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: item.href || "/notifications",
					className: "block rounded-2xl border border-line bg-paper px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: item.body
					})]
				}, item.id))]
			}) : null
		]
	});
}
function GamesScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Games"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Pick a set. Then choose answer together, or take turns."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/games/$category",
				params: { category: "mix" },
				className: "block rounded-3xl bg-ink px-5 py-5 text-paper",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl",
					children: "Random mix"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-blush",
					children: "A handful from across the deck."
				})]
			}),
			CATEGORIES.map((category) => {
				const Icon = ICONS[category.id];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/games/$category",
					params: { category: category.id },
					className: "flex items-center gap-4 rounded-3xl border border-line bg-paper p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-12 w-12 place-items-center rounded-2xl bg-lavender text-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "h-5 w-5",
							"aria-hidden": "true"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: category.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-muted",
						children: category.blurb
					})] })]
				}, category.id);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "TWO OF US is free. Sponsored placements, if they are added later, stay off question, reveal, and note screens."
			}) })
		]
	});
}
function CategoryScreen({ category }) {
	const navigate = useNavigate();
	const known = category === "mix" || CATEGORIES.some((item) => item.id === category);
	const meta = CATEGORIES.find((item) => item.id === category);
	const [mode, setMode] = (0, import_react.useState)("together");
	const [count, setCount] = (0, import_react.useState)(8);
	const [difficulty, setDifficulty] = (0, import_react.useState)("any");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (!known) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: "That category does not exist." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/games",
				className: "text-sm text-muted",
				children: "All games"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: meta?.name ?? "Random mix"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: meta?.blurb ?? "Questions from every category, still private until you both answer."
			}),
			category === "spark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "bg-lavender",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: "Skip any card. Mature prompts stay off unless you are both 18 or older and have opted in under Privacy."
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode("together"),
					className: mode === "together" ? "min-h-24 rounded-3xl bg-rose-deep p-4 text-left text-paper" : "min-h-24 rounded-3xl border border-line p-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: "Answer together"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm opacity-80",
						children: "Same question, either order."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode("turns"),
					className: mode === "turns" ? "min-h-24 rounded-3xl bg-lavender-deep p-4 text-left text-paper" : "min-h-24 rounded-3xl border border-line p-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: "Take turns"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm opacity-80",
						children: "One answers, then the other."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: [
					5,
					8,
					12
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCount(value),
					className: count === value ? "min-h-11 flex-1 rounded-full bg-ink text-sm text-paper" : "min-h-11 flex-1 rounded-full border border-line text-sm",
					children: value
				}, value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					"any",
					"easy",
					"medium",
					"deep"
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setDifficulty(value),
					className: difficulty === value ? "min-h-11 rounded-full bg-blush px-4 text-sm" : "min-h-11 rounded-full border border-line px-4 text-sm",
					children: value
				}, value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				disabled: busy,
				onClick: () => {
					setBusy(true);
					createGame({ data: {
						category,
						mode,
						count,
						difficulty
					} }).then((result) => {
						setBusy(false);
						if (!result.ok) {
							setError(result.error);
							return;
						}
						navigate({
							to: "/play/$gameId",
							params: { gameId: result.id }
						});
					});
				},
				children: busy ? "Starting…" : "Start this round"
			})
		]
	});
}
function UsScreen() {
	const { data, error } = useLoader(() => getUs(), []);
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data || !data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error || "Could not load your space." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Us"
			}),
			data.partner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						name: data.partner.displayName,
						src: data.partner.avatar
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: data.partner.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"@",
							data.partner.username,
							" · since ",
							pretty(data.partner.connectedAt)
						]
					})] })]
				}),
				data.partner.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm",
					children: data.partner.bio
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/partner",
					className: "mt-4 inline-flex text-sm font-medium text-rose-deep",
					children: "Partner profile"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No partner connected." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/connect",
				className: "mt-3 inline-flex text-sm font-medium text-rose-deep",
				children: "Send an invite"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/notes",
					className: "rounded-3xl bg-lavender p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Notes"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/favorites",
					className: "rounded-3xl bg-blush p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Favourites"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Shared memories"
			}),
			data.memories.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Finished rounds will gather here."
			}) : null,
			data.memories.map((memory) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/play/$gameId",
				params: { gameId: memory.id },
				className: "block rounded-3xl border border-line bg-paper p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: memory.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						memory.questions,
						" questions · ",
						pretty(memory.completedAt)
					]
				})]
			}, memory.id)),
			data.notes.slice(0, 2).map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					note.mine ? "You" : "Them",
					": ",
					note.body
				]
			}, note.id))
		]
	});
}
function ProgressScreen() {
	const { data, error } = useLoader(() => getProgress(), []);
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data || !data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error || "Could not load progress." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Progress"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Counts, not a compatibility percentage."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tabular-nums",
						children: data.stats.gamesCompleted
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Games finished"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tabular-nums",
						children: data.stats.answers
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Answers"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tabular-nums",
						children: data.samePicks
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Same picks"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl tabular-nums",
						children: data.differentPicks
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Different picks"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: data.favourite ? `Most played: ${data.favourite}.` : "Play a round to see a favourite category."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Streak: ",
						data.stats.streak,
						". It rests when you miss a day. It does not scold you."
					]
				}),
				data.predictionChances > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm",
					children: [
						"How Well Do You Know Me: you called ",
						data.stats.predictionsCorrect,
						" of ",
						data.predictionChances,
						"."
					]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-56 rounded-3xl border border-line bg-paper p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: data.chart,
						layout: "vertical",
						margin: {
							left: 8,
							right: 8
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								type: "number",
								hide: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								type: "category",
								dataKey: "name",
								width: 64,
								tick: {
									fill: "var(--color-muted)",
									fontSize: 12
								},
								axisLine: false,
								tickLine: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "count",
								fill: "var(--color-rose)",
								radius: [
									0,
									8,
									8,
									0
								]
							})
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Badges"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: data.badges.map((badge) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: badge.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm text-muted",
						children: badge.detail
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: badge.earned ? "Earned" : "Not yet"
					})]
				}, badge.id))
			})
		]
	});
}
function ProfileScreen() {
	const shell = useShell();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Profile"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					name: shell.profile.displayName,
					src: shell.profile.avatar
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: shell.profile.displayName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: ["@", shell.profile.username]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "overflow-hidden rounded-3xl border border-line bg-paper",
				children: [
					["/notifications", "Notifications"],
					["/daily", "Daily question"],
					["/favorites", "Favourite questions"],
					["/notes", "Private notes"],
					["/settings", "Settings"],
					["/privacy", "Privacy"],
					["/help", "Help and support"],
					["/verify-email", "Email status"],
					["/admin", "Question studio"],
					["/delete-account", "Delete account"]
				].map(([href, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: href,
						className: "flex min-h-12 items-center px-4 text-sm",
						children: label
					})
				}, href))
			})
		]
	});
}
function ConnectScreen() {
	const [q, setQ] = (0, import_react.useState)("");
	const [people, setPeople] = (0, import_react.useState)([]);
	const [email, setEmail] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (q.trim().length < 2) {
			setPeople([]);
			return;
		}
		const timer = window.setTimeout(() => {
			searchPeople({ data: { q } }).then((result) => {
				if (result.ok) setPeople(result.people);
			});
		}, 250);
		return () => window.clearTimeout(timer);
	}, [q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Connect"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Search by username. Email addresses are never shown in results."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Username",
				value: q,
				onChange: (event) => setQ(event.target.value),
				placeholder: "david_92"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: person.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-sm text-muted",
						children: ["@", person.username]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "soft",
						onClick: () => {
							sendInvite({ data: { username: person.username } }).then((result) => {
								setError(result.ok ? "" : result.error);
								setMessage(result.ok ? "Invite sent." : "");
							});
						},
						children: "Invite"
					})]
				}, person.username))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					inviteByEmail({ data: { email } }).then((result) => {
						if (!result.ok) {
							setError(result.error);
							return;
						}
						setError("");
						setMessage(result.held ? "We'll hold that invite until they create an account." : "They already have an account. Invite sent.");
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Or invite by email",
					type: "email",
					value: email,
					onChange: (event) => setEmail(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "ghost",
					children: "Send email invite"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/invites",
				className: "text-sm font-medium text-rose-deep",
				children: "See invitations"
			})
		]
	});
}
function InvitesScreen() {
	const { data, error, setData } = useLoader(() => listInvites(), []);
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data || !data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error || "Could not load invites." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Invitations"
			}),
			data.incoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No invites waiting."
			}) : null,
			data.incoming.map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: invite.displayName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: ["@", invite.username]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => void respondInvite({ data: {
							id: invite.id,
							accept: true
						} }).then(() => listInvites().then(setData)),
						children: "Accept"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => void respondInvite({ data: {
							id: invite.id,
							accept: false
						} }).then(() => listInvites().then(setData)),
						children: "Decline"
					})]
				})
			] }, invite.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Sent"
			}),
			data.outgoing.map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Waiting on ", invite.displayName]
			}, invite.id))
		]
	});
}
function DailyScreen() {
	const { data, error, setData } = useLoader(() => getHome(), []);
	const [body, setBody] = (0, import_react.useState)("");
	const [choice, setChoice] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)("");
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data || !data.ok || !data.daily) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error || "Today's question is not ready." });
	const daily = data.daily;
	const choiceType = daily.question.answerType === "choice" || daily.question.answerType === "rather";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Today"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl",
				children: daily.question.text
			}), daily.submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["You: ", daily.mine?.skipped ? "Skipped" : daily.mine?.body] }), daily.partnerAnswer ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Them: ", daily.partnerAnswer.skipped ? "Skipped" : daily.partnerAnswer.body] }), daily.tone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted",
					children: [
						daily.tone.title,
						" ",
						daily.tone.detail
					]
				}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: daily.partnerSubmitted ? "Waiting to reveal." : "Their answer stays hidden until you have both submitted."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					submitDaily({ data: {
						body,
						choiceIndex: choice,
						skipped: false
					} }).then((result) => {
						setNote(result.ok ? "" : result.error);
						if (result.ok) getHome().then(setData);
					});
				},
				children: [
					choiceType ? daily.question.choices.map((option, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setChoice(index),
						className: choice === index ? "min-h-11 w-full rounded-2xl bg-rose-deep px-4 text-left text-sm text-paper" : "min-h-11 w-full rounded-2xl border border-line px-4 text-left text-sm",
						children: option
					}, option)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: body,
						onChange: (event) => setBody(event.target.value),
						rows: 4,
						className: "w-full rounded-2xl border border-line px-4 py-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Submit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => void submitDaily({ data: {
							body: "",
							choiceIndex: null,
							skipped: true
						} }).then((result) => {
							if (result.ok) getHome().then(setData);
							else setNote(result.error);
						}),
						children: "Skip today"
					})
				]
			})] }),
			data.challenge ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Couple prompt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2",
					children: data.challenge.title
				}),
				data.challenge.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Done for today."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "soft",
					onClick: () => void completeChallenge().then((result) => {
						if (result.ok) getHome().then(setData);
						else setNote(result.error);
					}),
					children: "We did this"
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Connect a partner to share the daily prompt."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: note })
		]
	});
}
function FavoritesScreen() {
	const navigate = useNavigate();
	const { data, error } = useLoader(() => listFavorites(), []);
	const [mode, setMode] = (0, import_react.useState)("together");
	const [note, setNote] = (0, import_react.useState)("");
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data || !data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error || "Could not load favourites." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Favourites"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: mode === "together" ? "primary" : "ghost",
					onClick: () => setMode("together"),
					children: "Together"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: mode === "turns" ? "primary" : "ghost",
					onClick: () => setMode("turns"),
					children: "Turns"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => void createFavoriteGame({ data: { mode } }).then((result) => {
					if (!result.ok) setNote(result.error);
					else navigate({
						to: "/play/$gameId",
						params: { gameId: result.id }
					});
				}),
				children: "Play saved questions"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: note }),
			data.questions.map((question) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: question.text }) }, question.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Saved answers"
			}),
			data.answers.map((answer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: answer.question
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm",
				children: [
					answer.author,
					": ",
					answer.body
				]
			})] }, answer.id))
		]
	});
}
function NotesScreen() {
	const { data, error, setData } = useLoader(() => listNotes(), []);
	const [body, setBody] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data || !data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error || "Could not load notes." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Notes"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Visible to the two of you while you are connected. Not a group chat."
			}),
			data.partner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					addNote({ data: { body } }).then((result) => {
						if (!result.ok) setNote(result.error);
						else {
							setBody("");
							listNotes().then(setData);
						}
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: body,
					onChange: (event) => setBody(event.target.value),
					rows: 3,
					className: "w-full rounded-2xl border border-line bg-paper px-4 py-3",
					placeholder: `A note for ${data.partner.displayName}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Leave note"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "Connect a partner before writing notes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: note }),
			data.notes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: item.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted",
					children: [
						item.mine ? "You" : "Them",
						" · ",
						pretty(item.createdAt)
					]
				}),
				item.mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-2 text-sm text-muted",
					onClick: () => void deleteNote({ data: { id: item.id } }).then(() => listNotes().then(setData)),
					children: "Remove"
				}) : null
			] }, item.id))
		]
	});
}
function PartnerScreen() {
	const partner = useShell().partner;
	const [note, setNote] = (0, import_react.useState)("");
	if (!partner) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Partner"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/connect",
			className: "text-sm font-medium text-rose-deep",
			children: "Connect someone"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: partner.displayName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				name: partner.displayName,
				src: partner.avatar,
				className: "h-20 w-20"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["@", partner.username]
			}),
			partner.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: partner.bio }) : null,
			partner.gender ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: partner.gender
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Connected ", pretty(partner.connectedAt)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => void disconnectPartner().then((result) => setNote(result.ok ? "Disconnected." : result.error)),
				children: "Disconnect"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: note })
		]
	});
}
function NotificationsScreen() {
	const { data, error, setData } = useLoader(() => listNotifications(), []);
	if (!data && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loading, {});
	if (!data || !data.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error || "Could not load notifications." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Notifications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm text-muted",
					onClick: () => void markNotifications({ data: {} }).then(() => listNotifications().then(setData)),
					children: "Mark all read"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "These stay inside the app. This web version does not send phone push alerts."
			}),
			data.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nothing yet."
			}) : null,
			data.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: item.href || "/notifications",
				onClick: () => void markNotifications({ data: { id: item.id } }),
				className: "block rounded-3xl border border-line bg-paper p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: item.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: item.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							item.read ? "Read" : "New",
							" · ",
							pretty(item.createdAt)
						]
					})
				]
			}, item.id))
		]
	});
}
function SettingsScreen() {
	const shell = useShell();
	const [theme, setTheme] = (0, import_react.useState)(shell.profile.theme);
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Appearance"
				}), [
					"system",
					"light",
					"dark"
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTheme(value);
						saveSettings({ data: { theme: value } });
					},
					className: theme === value ? "min-h-11 w-full rounded-full bg-ink text-sm text-paper" : "min-h-11 w-full rounded-full border border-line text-sm",
					children: value
				}, value))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "In-app alerts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Invites",
						checked: shell.profile.notifInvites,
						onChange: (notifInvites) => void saveSettings({ data: { notifInvites } })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Games",
						checked: shell.profile.notifGames,
						onChange: (notifGames) => void saveSettings({ data: { notifGames } })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Turns",
						checked: shell.profile.notifTurns,
						onChange: (notifTurns) => void saveSettings({ data: { notifTurns } })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Daily",
						checked: shell.profile.notifDaily,
						onChange: (notifDaily) => void saveSettings({ data: { notifDaily } })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					authClient.changePassword({
						currentPassword,
						newPassword,
						revokeOtherSessions: true
					}).then((result) => {
						if (result.error) setError(result.error.message ?? "Could not change the password.");
						else setMessage("Password changed.");
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Current password",
						type: "password",
						value: currentPassword,
						onChange: (event) => setCurrentPassword(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "New password",
						type: "password",
						value: newPassword,
						onChange: (event) => setNewPassword(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "ghost",
						children: "Change password"
					})
				]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: ["Signed in as ", shell.email]
			})
		]
	});
}
function Toggle({ label, checked, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center justify-between text-sm",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked,
			onChange: (event) => onChange(event.target.checked),
			className: "h-5 w-5"
		})]
	});
}
function PrivacyScreen() {
	const shell = useShell();
	const [message, setMessage] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Privacy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed",
				children: "Answers are stored for the two players in a round. Your partner cannot read yours until they have submitted theirs as well. That rule is checked on the server, not only hidden on screen. Disconnecting ends the live space. Deleting your account removes shared rounds."
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "Show gender to my partner",
				checked: shell.profile.showGender,
				onChange: (showGender) => void saveSettings({ data: { showGender } }).then(() => setMessage("Saved."))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "I am 18 or older",
				checked: shell.profile.ageConfirmed,
				onChange: (ageConfirmed) => void saveSettings({ data: { ageConfirmed } }).then(() => setMessage("Saved."))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "Allow intimate questions",
				checked: shell.profile.allowMature,
				onChange: (allowMature) => void saveSettings({ data: { allowMature } }).then((result) => setMessage(result.ok ? "Saved. Both of you must opt in." : result.error))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: ["Profile photo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/*",
					className: "mt-2 block w-full text-sm",
					onChange: (event) => {
						const file = event.target.files?.[0];
						if (!file) return;
						fileToDataUrl(file).then((avatar) => saveSettings({ data: { avatar } })).then((result) => {
							setMessage(result.ok ? "Photo updated." : result.error);
						}).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Could not use that photo."));
					}
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/delete-account",
				className: "text-sm text-rose-deep",
				children: "Delete account and data"
			})
		]
	});
}
function HelpScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Help"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "How a round works"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "One of you starts a game. You answer without seeing the other reply. When both are in, the reveal opens. Take Turns waits for the person whose turn it is. If someone leaves, the round stays until you finish or cancel it."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "Two phones"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Sign each person into their own account. Search the username, accept the invite, then start a game. On one phone, sign out and sign in as the other person to play both sides."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: "What this is not"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Matching answers are not a relationship score. Skipping is allowed. Missing a day does not break anything except the streak count, and the streak only rests."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Support: write from the account email you used to join. Question reports go to the studio queue."
			})
		]
	});
}
function VerifyScreen() {
	const shell = useShell();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Email"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: shell.email }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: shell.emailVerified ? "This email is marked verified." : "Verification mail is not sent in this web version, so the account stays usable without it. Google or X sign-in does not need a password email."
		})] })]
	});
}
function DeleteScreen() {
	const navigate = useNavigate();
	const [phrase, setPhrase] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Delete account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "This removes your profile, notes, and shared games. Your partner is told. It cannot be undone."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					deleteAccount({ data: { phrase } }).then(async (result) => {
						if (!result.ok) {
							setError(result.error);
							return;
						}
						await signOut().catch(() => void 0);
						navigate({ to: "/welcome" });
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Type DELETE",
					value: phrase,
					onChange: (event) => setPhrase(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Delete everything"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error })
		]
	});
}
function AdminScreen() {
	const shell = useShell();
	const [key, setKey] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [overview, setOverview] = (0, import_react.useState)(null);
	const [text, setText] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	async function load() {
		const result = await adminOverview();
		if (result.ok) setOverview(result);
		else setError(result.error);
	}
	(0, import_react.useEffect)(() => {
		if (shell.profile.role === "admin") load();
	}, [shell.profile.role]);
	if (shell.profile.role !== "admin") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Studio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Question editing is limited to studio roles."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					claimStudio({ data: { key } }).then((result) => {
						if (!result.ok) setError(result.error);
						else window.location.reload();
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Studio key",
					type: "password",
					value: key,
					onChange: (event) => setKey(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Unlock"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Studio"
			}),
			overview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm tabular-nums",
				children: [
					overview.counts.people,
					" people · ",
					overview.counts.games,
					" games · ",
					overview.counts.answers,
					" answers · ",
					overview.counts.reports,
					" open reports"
				]
			}) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					adminSaveQuestion({ data: {
						text,
						category: "know",
						difficulty: "easy",
						answerType: "short",
						choices: [],
						sensitivity: "low",
						audience: "all",
						active: true
					} }).then((result) => {
						setError(result.ok ? "" : result.error);
						if (result.ok) {
							setText("");
							load();
						}
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "New question",
					value: text,
					onChange: (event) => setText(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Add to Getting to Know You"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					adminSearchQuestions({ data: { q: text } }).then((result) => {
						if (result.ok && overview) setOverview({
							...overview,
							questions: result.questions
						});
					});
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "ghost",
					children: "Search questions"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					adminAnnounce({ data: {
						title,
						body
					} }).then((result) => {
						setError(result.ok ? "" : result.error);
						if (result.ok) load();
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Announcement title",
						value: title,
						onChange: (event) => setTitle(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Announcement",
						value: body,
						onChange: (event) => setBody(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "soft",
						children: "Publish note"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
			overview?.questions.map((question) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: question.text
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted",
					children: [
						question.category,
						" · ",
						question.active ? "active" : "hidden"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-2 text-sm",
					onClick: () => void adminSetActive({ data: {
						id: question.id,
						active: !question.active
					} }).then(() => load()),
					children: question.active ? "Deactivate" : "Activate"
				})
			] }, question.id)),
			overview?.reports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: report.reason
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => void adminSetReport({ data: {
						id: report.id,
						status: "reviewed"
					} }).then(() => load()),
					children: "Reviewed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => void adminSetReport({ data: {
						id: report.id,
						status: "hidden"
					} }).then(() => load()),
					children: "Hide question"
				})]
			})] }, report.id)),
			overview?.errors.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: item.message
			}, item.id))
		]
	});
}
//#endregion
export { SettingsScreen as _, DeleteScreen as a, HelpScreen as c, NotesScreen as d, NotificationsScreen as f, ProgressScreen as g, ProfileScreen as h, DailyScreen as i, HomeScreen as l, PrivacyScreen as m, CategoryScreen as n, FavoritesScreen as o, PartnerScreen as p, ConnectScreen as r, GamesScreen as s, AdminScreen as t, InvitesScreen as u, UsScreen as v, VerifyScreen as y };
