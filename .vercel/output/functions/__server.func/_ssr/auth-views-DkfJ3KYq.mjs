import { o as __toESM } from "../_runtime.mjs";
import { S as useNavigate, Z as require_react, b as Link, w as require_jsx_runtime, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-IWHfIGH2.mjs";
import { i as GROK_PROVIDERS } from "./server-C7Umldfu.mjs";
import { r as useCurrentUserState, t as RedirectToSignIn } from "./gates-CI9FVQNg.mjs";
import { S as confirmReset, W as requestReset, a as Field, c as Splash, i as ErrorNote, n as Button, q as saveProfile, s as Logo } from "./ui-oiZltzWj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-views-DkfJ3KYq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WelcomePage() {
	const { user, isPending } = useCurrentUserState();
	const [step, setStep] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (step !== 0) return;
		const timer = window.setTimeout(() => setStep(1), 900);
		return () => window.clearTimeout(timer);
	}, [step]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	const slides = [
		{
			title: "Answer apart. Reveal together.",
			body: "You each reply in private. Nothing is shown until both of you have submitted."
		},
		{
			title: "One partner. A shared space.",
			body: "Find them by username, or hold an email invite until they join."
		},
		{
			title: "Questions with somewhere to go.",
			body: "Light, romantic, or serious. Different answers are a conversation, not a score."
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh bg-cream px-6 py-10 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-md flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-5xl",
						children: "TWO OF US"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted",
						children: "Every question brings you closer."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-auto rise",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"0",
								step,
								" / 03"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 font-display text-4xl",
							children: slides[step - 1]?.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-base leading-relaxed text-muted",
							children: slides[step - 1]?.body
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [step > 0 && step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: () => setStep((value) => value + 1),
						children: "Continue"
					}) : null, step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/join",
						className: "flex min-h-11 items-center justify-center rounded-full bg-rose-deep px-5 text-sm font-medium text-paper",
						children: "Create an account"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "flex min-h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-medium",
						children: "I already have one"
					})] }) : null]
				})
			]
		})
	});
}
function AuthScreen({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-cream px-6 py-10 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-md space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: title
				}),
				children
			]
		})
	});
}
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthScreen, {
		title: "Welcome back",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: (event) => {
					event.preventDefault();
					setPending(true);
					setError("");
					authClient.signIn.email({
						email,
						password
					}).then((result) => {
						if (result.error) {
							setError(result.error.message ?? "Could not sign in.");
							setPending(false);
							return;
						}
						navigate({ to: "/" });
					}).catch((reason) => {
						setError(reason instanceof Error ? reason.message : "Could not sign in.");
						setPending(false);
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Email",
						type: "email",
						autoComplete: "email",
						value: email,
						onChange: (event) => setEmail(event.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						type: "password",
						autoComplete: "current-password",
						value: password,
						onChange: (event) => setPassword(event.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						type: "submit",
						disabled: pending,
						children: pending ? "Signing in…" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "ghost",
					className: "w-full",
					type: "button",
					onClick: () => void signIn(provider.providerId, { callbackURL: "/" }),
					children: ["Continue with ", provider.label]
				}, provider.providerId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/recover",
						className: "underline",
						children: "Forgot password"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/join",
						className: "underline",
						children: "Create an account"
					})
				]
			})
		]
	});
}
function JoinPage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/setup" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthScreen, {
		title: "Create your account",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (password.length < 8) {
					setError("Use at least 8 characters.");
					return;
				}
				setPending(true);
				setError("");
				authClient.signUp.email({
					email,
					password,
					name: name.trim() || "Friend"
				}).then((result) => {
					if (result.error) {
						setError(result.error.message ?? "Could not create the account.");
						setPending(false);
						return;
					}
					navigate({ to: "/setup" });
				}).catch((reason) => {
					setError(reason instanceof Error ? reason.message : "Could not create the account.");
					setPending(false);
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Your name",
					autoComplete: "name",
					value: name,
					onChange: (event) => setName(event.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Email",
					type: "email",
					autoComplete: "email",
					value: email,
					onChange: (event) => setEmail(event.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Password",
					type: "password",
					autoComplete: "new-password",
					value: password,
					onChange: (event) => setPassword(event.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "This web version does not send a verification email. Your account still works. Google and X are available on the sign-in screen."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					type: "submit",
					disabled: pending,
					children: pending ? "Creating…" : "Create account"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: ["Already joined? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				className: "underline",
				children: "Sign in"
			})]
		})]
	});
}
function RecoverPage() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthScreen, {
		title: "Reset password",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					requestReset({ data: { email } }).then((result) => {
						setMessage(result.message);
						setPreview(result.previewCode);
					});
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Email",
					type: "email",
					value: email,
					onChange: (event) => setEmail(event.target.value),
					required: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					type: "submit",
					children: "Send a reset code"
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: message
			}) : null,
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "rounded-2xl bg-lavender px-4 py-3 font-medium tabular-nums",
				children: ["Code ", preview]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: (event) => {
					event.preventDefault();
					setError("");
					confirmReset({ data: {
						email,
						code,
						password
					} }).then((result) => {
						if (!result.ok) {
							setError(result.error);
							return;
						}
						setDone(true);
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Code",
						inputMode: "numeric",
						value: code,
						onChange: (event) => setCode(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "New password",
						type: "password",
						value: password,
						onChange: (event) => setPassword(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
					done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: ["Password updated. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "underline",
							children: "Sign in"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "soft",
						className: "w-full",
						type: "submit",
						children: "Set new password"
					})
				]
			})
		]
	});
}
function SetupPage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [username, setUsername] = (0, import_react.useState)("");
	const [displayName, setDisplayName] = (0, import_react.useState)("");
	const [gender, setGender] = (0, import_react.useState)("");
	const [birthYear, setBirthYear] = (0, import_react.useState)("");
	const [ageConfirmed, setAgeConfirmed] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (user?.displayName) setDisplayName(user.displayName);
	}, [user?.displayName]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, { to: "/welcome" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthScreen, {
		title: "Make your profile",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-4",
			onSubmit: (event) => {
				event.preventDefault();
				setPending(true);
				setError("");
				saveProfile({ data: {
					username,
					displayName,
					bio: "",
					gender: gender || null,
					showGender: false,
					birthYear: birthYear ? Number(birthYear) : null,
					ageConfirmed
				} }).then((result) => {
					setPending(false);
					if (!result.ok) {
						setError(result.error);
						return;
					}
					navigate({ to: "/" });
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Display name",
					value: displayName,
					onChange: (event) => setDisplayName(event.target.value),
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Username",
					value: username,
					onChange: (event) => setUsername(event.target.value),
					placeholder: "lovelyemma",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block space-y-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Gender, if you want it on record"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "min-h-11 w-full rounded-2xl border border-line bg-paper px-4",
						value: gender,
						onChange: (event) => setGender(event.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Skip"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "woman",
								children: "Woman"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "man",
								children: "Man"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "nonbinary",
								children: "Non-binary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "unspecified",
								children: "Prefer not to say"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Birth year, optional",
					inputMode: "numeric",
					value: birthYear,
					onChange: (event) => setBirthYear(event.target.value),
					placeholder: "1996"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-start gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: "mt-1 h-5 w-5",
						checked: ageConfirmed,
						onChange: (event) => setAgeConfirmed(event.target.checked)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I am 18 or older. This only unlocks the option for more intimate questions later." })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					type: "submit",
					disabled: pending,
					children: pending ? "Saving…" : "Enter TWO OF US"
				})
			]
		})
	});
}
//#endregion
export { WelcomePage as a, SetupPage as i, LoginPage as n, RecoverPage as r, JoinPage as t };
