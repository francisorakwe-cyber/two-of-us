import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, p as useRouterState, w as require_jsx_runtime, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useCurrentUserState, t as RedirectToSignIn } from "./gates-CI9FVQNg.mjs";
import { N as getShell, b as cn, c as Splash, i as ErrorNote, l as Wordmark } from "./ui-oiZltzWj.mjs";
import { _ as ChartColumn, d as House, h as CircleUser, l as LayoutGrid, n as Users } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-B48EGGjk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ShellContext = (0, import_react.createContext)(null);
function useShell() {
	const value = (0, import_react.useContext)(ShellContext);
	if (!value) throw new Error("Shell missing");
	return value;
}
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const [shell, setShell] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let live = true;
		getShell().then((result) => {
			if (!live) return;
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setShell(result);
			const theme = result.profile.theme;
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			const dark = theme === "dark" || theme === "system" && prefersDark;
			document.documentElement.dataset.theme = dark ? "dark" : "light";
			if (theme === "system") localStorage.removeItem("two-theme");
			else localStorage.setItem("two-theme", theme);
		}).catch((reason) => {
			if (live) setError(reason instanceof Error ? reason.message : "Could not open your space.");
		});
		return () => {
			live = false;
		};
	}, [user?.id, pathname]);
	if (isPending || user && !shell && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Splash, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, { to: "/welcome" });
	if (!shell) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-cream px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error })
	});
	if (!shell.profile.username) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/setup" });
	const bare = pathname.startsWith("/play");
	const tabs = [
		{
			to: "/",
			label: "Home",
			icon: House
		},
		{
			to: "/games",
			label: "Games",
			icon: LayoutGrid
		},
		{
			to: "/us",
			label: "Us",
			icon: Users,
			dot: shell.incoming > 0
		},
		{
			to: "/progress",
			label: "Progress",
			icon: ChartColumn
		},
		{
			to: "/profile",
			label: "Profile",
			icon: CircleUser
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShellContext.Provider, {
		value: shell,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-dvh bg-cream text-ink xl:grid xl:grid-cols-[1fr_30rem_1fr]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden xl:flex xl:flex-col xl:justify-between xl:px-12 xl:py-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
							className: "mt-10 space-y-4 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "1. Answer on your own." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "2. Their words stay hidden." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3. Reveal only when you both have answered." })
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xs text-sm text-muted",
						children: "Made for two people, including the long-distance kind."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-dvh flex-col xl:border-x xl:border-line",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("flex-1 px-5 pt-6", bare ? "pb-8" : "pb-28"),
						children
					}), !bare && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "sticky bottom-0 z-10 border-t border-line bg-paper/95 backdrop-blur",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid grid-cols-5",
							children: tabs.map((tab) => {
								const active = tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
								const Icon = tab.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: tab.to,
									className: cn("relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs", active ? "text-rose-deep" : "text-muted"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "h-5 w-5",
											"aria-hidden": "true"
										}),
										tab.label,
										"dot" in tab && tab.dot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-5 top-3 h-2 w-2 rounded-full bg-rose" }) : null
									]
								}) }, tab.to);
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", { className: "hidden xl:block" })
			]
		})
	});
}
//#endregion
export { useShell as n, AppShell as t };
