import { $t as union, Jt as number, Kt as literal, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BNjEkSqG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-oiZltzWj.js
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getShell = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2b7856fd9b3962181e29c3a92dfb5262edef4cb8e5b85e708935947265caf2d0"));
var saveProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	username: string().min(1).max(24),
	displayName: string().min(1).max(40),
	bio: string().max(160).optional(),
	gender: _enum([
		"woman",
		"man",
		"nonbinary",
		"unspecified"
	]).nullable().optional(),
	showGender: boolean().optional(),
	birthYear: number().int().nullable().optional(),
	ageConfirmed: boolean().optional()
}).parse(input)).handler(createSsrRpc("b4098a3f216d26600bb330625ba6782ec3b617bbbc95f63bff0324738785cba7"));
var saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	theme: _enum([
		"system",
		"light",
		"dark"
	]).optional(),
	allowMature: boolean().optional(),
	ageConfirmed: boolean().optional(),
	showGender: boolean().optional(),
	bio: string().max(160).optional(),
	displayName: string().min(1).max(40).optional(),
	avatar: string().max(12e4).nullable().optional(),
	notifInvites: boolean().optional(),
	notifGames: boolean().optional(),
	notifTurns: boolean().optional(),
	notifDaily: boolean().optional(),
	gender: _enum([
		"woman",
		"man",
		"nonbinary",
		"unspecified"
	]).nullable().optional(),
	birthYear: number().int().nullable().optional()
}).parse(input)).handler(createSsrRpc("e3aa81605de8eeae2064533e0942e101953af8e88680f54e0df94253a79e4517"));
var searchPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => object({ q: string().max(24) }).parse(input)).handler(createSsrRpc("59bcc2242beccbe546568e3312779fcde9724893a928191c682c98ccaf4dc644"));
var sendInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ username: string().min(2).max(24) }).parse(input)).handler(createSsrRpc("3b2ce25b988cdd2c7670224fba19b169c19d2cde0910c27424a5e3e9f421c75b"));
var inviteByEmail = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ email: string().email().max(120) }).parse(input)).handler(createSsrRpc("4f02bbafc0cb1c1409dd868c745c84b12a1092cc8e16c1c819d705b0757a947a"));
var listInvites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("680aeceb2fcf5e5561052aedf71bcf53534fbb7dd3acef9189ed6f871360b4c9"));
var respondInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: string().min(8),
	accept: boolean()
}).parse(input)).handler(createSsrRpc("156c07a82005bd64da9bc499aef5d2c21bc0003cd807f371f7ae4fea725ec76a"));
var disconnectPartner = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("2b29b6e54d445b8ee805543564e41fe1dcd42be400a69c09be5987a59011ec08"));
var getHome = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("280d6e309b71b75d568557efacf66fa0bfebd8c2cafd1e0d2cd4f8602c4371fe"));
var submitDaily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	body: string().max(800),
	choiceIndex: number().int().min(0).max(7).nullable(),
	skipped: boolean()
}).parse(input)).handler(createSsrRpc("34fcebd2b8d17e76490f765ded37eda83dd9a4c0f2aa598560e2e59ccf250b20"));
var completeChallenge = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("795848ebe514b9bea849da4b80f09c457f71c59845b54cb84fb33b5e8f25c41d"));
var gameInput = object({
	category: string(),
	mode: _enum(["together", "turns"]),
	count: union([
		literal(5),
		literal(8),
		literal(12)
	]),
	difficulty: _enum([
		"any",
		"easy",
		"medium",
		"deep"
	])
});
var createGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => gameInput.parse(input)).handler(createSsrRpc("2d694b2c37b94d76142f0f2e0c2d7a37bcb1e3b7708cbd2c4d9c1a7f27d1061f"));
var createFavoriteGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ mode: _enum(["together", "turns"]) }).parse(input)).handler(createSsrRpc("018802b38be03e2f87130ef30a5d5bfc12ac9558d33a7aeec009c83b1d1f1c9e"));
var getPlay = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => object({ gameId: string().min(8) }).parse(input)).handler(createSsrRpc("ebd75517f01877af74ba030b4175c36bb4e53646809b0645ee58e09a9c62890a"));
var submitAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	gameId: string().min(8),
	position: number().int().min(0),
	body: string().max(800),
	choiceIndex: number().int().min(0).max(7).nullable(),
	prediction: string().max(200),
	predictionIndex: number().int().min(0).max(7).nullable(),
	skipped: boolean()
}).parse(input)).handler(createSsrRpc("01cea4bc63b658f48ab9dfbbbdb35cc09909848cd174c084c2aff7af718bd375"));
var reactToAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	gameId: string().min(8),
	position: number().int().min(0),
	kind: _enum([
		"warm",
		"laugh",
		"curious",
		"keep"
	])
}).parse(input)).handler(createSsrRpc("992bb7c9e4d8ff1d895073abcb18b8d0964199784c217de453c5b8e50f44adcc"));
var advanceGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	gameId: string().min(8),
	from: number().int().min(0)
}).parse(input)).handler(createSsrRpc("f16f96c964a5113595f24bce7067ac3d697db175595a97563216b6657663d7ac"));
var endGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ gameId: string().min(8) }).parse(input)).handler(createSsrRpc("b0a1bc876fc685f1e12c459ec7d14d18e143b735cbd048a4f02100fd196ce188"));
var cancelGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ gameId: string().min(8) }).parse(input)).handler(createSsrRpc("95c211b4c0cea99ca69d135f6bf7eb151033f3951dfee5f2bfa323e60453a89d"));
var toggleFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ questionId: string().min(2) }).parse(input)).handler(createSsrRpc("017d3e93c933df814fc57068fd30a29b6e45f813c177c1cb3c22945b329ac8a0"));
var saveFavoriteAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ answerId: string().min(8) }).parse(input)).handler(createSsrRpc("543f4080efde824657459e8e5c51fb80686d715a4a64f7cc8568583febc67541"));
var listFavorites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("121efddfbda0c006aa05db3b57e337bb039096d007c4a839e814faa95a47d795"));
var listNotes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("dc9747f1be335241756172d71e8eeb59019fa83f508b22efb5cddc12c7a32704"));
var addNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ body: string().min(1).max(500) }).parse(input)).handler(createSsrRpc("8fc1431efc98f8221d78761ba592f622772085e7971d9714d3ed1bac0e0b467a"));
var deleteNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: string().min(8) }).parse(input)).handler(createSsrRpc("e149960463a2ad692f6f714019bcf25f97aace881d0686a894cfae818961e959"));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2f9430f0400d29f74b2d8e8fc641c77e446c6d5012c3ee0c722a4f0bdeca874f"));
var markNotifications = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: string().optional() }).parse(input)).handler(createSsrRpc("62908172ac46c9a75b4db7f4544f5b1bb062e0ece3ada152a88db4bf3fc47407"));
var getUs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("6606cb045f4d3e57e8313c391726019420521571de29b9d3bf5c0e0f22b2da0d"));
var getProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d52a189a6ce312c7d87a0088068e6e28827e70a0f0b34fee05c966b4a542e772"));
var reportQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	questionId: string().min(2),
	reason: string().min(3).max(280)
}).parse(input)).handler(createSsrRpc("35e1c0e4408ee186543474a50e22be6cee6921d341dec6263a26c9cef54bd84a"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ message: string().min(1).max(500) }).parse(input)).handler(createSsrRpc("ce8881eaccf89b4bd7d6e745a73fe3bd95e124ca0a2af8747c26796427be976c"));
var requestReset = createServerFn({ method: "POST" }).validator((input) => object({ email: string().email().max(120) }).parse(input)).handler(createSsrRpc("c41f49996c87f6a41a7867a5ae5f40448c7d46a34aa87805cf544b4f67bc8cb2"));
var confirmReset = createServerFn({ method: "POST" }).validator((input) => object({
	email: string().email().max(120),
	code: string().min(6).max(8),
	password: string().min(8).max(72)
}).parse(input)).handler(createSsrRpc("02a510d7ea335e0e5370c47850a047e4152fabe8294fcf007c717221d55b5380"));
var deleteAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ phrase: string() }).parse(input)).handler(createSsrRpc("72b75d0be5f3c611ac19a7822d799eb66ae2f2849c4efe22e9055cb7e86803a7"));
var claimStudio = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ key: string().max(40) }).parse(input)).handler(createSsrRpc("f4460eace6b3d3feab118449d7104888765ab16cb53e9e298d38edfe3495c74d"));
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("65965ab3522113e0a9f4a7b61f548d4759b244f549517296ccaa7c5e5538ad19"));
var adminSaveQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: string().max(40).optional(),
	text: string().min(8).max(400),
	category: string(),
	difficulty: _enum([
		"easy",
		"medium",
		"deep"
	]),
	answerType: _enum([
		"short",
		"long",
		"choice",
		"rather",
		"dare"
	]),
	choices: array(string().min(1).max(80)).max(6),
	sensitivity: _enum([
		"low",
		"medium",
		"high"
	]),
	audience: _enum(["all", "18plus"]),
	active: boolean()
}).parse(input)).handler(createSsrRpc("71a409c179117433688ab90ef6f330172c6bae4f3212d7b7670a8e5a8fa69dea"));
var adminSetActive = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: string(),
	active: boolean()
}).parse(input)).handler(createSsrRpc("9bb77765355d57af80835782185d6abe25da2daf7e395f0c87eb06ab8516a6c6"));
var adminSetReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: string(),
	status: _enum([
		"open",
		"reviewed",
		"hidden"
	])
}).parse(input)).handler(createSsrRpc("9d4d843602dda12b0c905bbe482e4ddc27414d16d7477a310be66299340700d9"));
var adminAnnounce = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	title: string().min(2).max(80),
	body: string().min(2).max(280)
}).parse(input)).handler(createSsrRpc("d5964af24608e3091bb80fa5be510fb46d4d861c0726831571a02a78112e2644"));
var adminSearchQuestions = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => object({ q: string().max(60) }).parse(input)).handler(createSsrRpc("d524966b6bc5ec9968b7fade969b6ba68a39da53642d618822bd7f339e71921d"));
function cn(...parts) {
	return parts.filter(Boolean).join(" ");
}
function Logo({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		className: cn("h-11 w-11", className),
		viewBox: "0 0 64 64",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "64",
				height: "64",
				rx: "18",
				fill: "var(--color-paper)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "26",
				cy: "32",
				r: "12",
				fill: "none",
				stroke: "var(--color-rose)",
				strokeWidth: "3.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "38",
				cy: "32",
				r: "12",
				fill: "none",
				stroke: "var(--color-lavender-deep)",
				strokeWidth: "3.5"
			})
		]
	});
}
function Wordmark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-lg leading-none text-ink",
			children: "TWO OF US"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: "Every question brings you closer."
		})] })]
	});
}
function Button({ variant = "primary", className, type = "button", ...props }) {
	const look = {
		primary: "bg-rose-deep text-paper",
		soft: "bg-lavender text-ink",
		ghost: "border border-line bg-paper text-ink"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition active:scale-[0.99] disabled:opacity-50", look, className),
		...props
	});
}
function Field({ label, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-2 text-sm text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "min-h-11 w-full rounded-2xl border border-line bg-paper px-4 text-base text-ink outline-none focus:border-rose",
			...props
		})]
	});
}
function Card({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-3xl border border-line bg-paper p-5", className),
		children
	});
}
function Avatar({ name, src, className }) {
	if (src) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src,
		alt: "",
		className: cn("h-12 w-12 rounded-full object-cover", className)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("grid h-12 w-12 place-items-center rounded-full bg-blush font-display text-lg text-ink", className),
		children: name.slice(0, 1).toUpperCase() || "?"
	});
}
function ErrorNote({ children }) {
	if (!children) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-2xl bg-blush px-4 py-3 text-sm text-ink",
		children
	});
}
function Loading({ label = "Loading" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		"aria-busy": "true",
		"aria-label": label,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-40 rounded-full bg-blush" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 rounded-3xl bg-paper" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 rounded-3xl bg-paper" })
		]
	});
}
function pretty(iso) {
	if (!iso) return "";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
	return date.toLocaleDateString(void 0, {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
async function fileToDataUrl(file) {
	const bitmap = await createImageBitmap(file);
	const size = 256;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not read that picture.");
	const scale = Math.max(size / bitmap.width, size / bitmap.height);
	const width = bitmap.width * scale;
	const height = bitmap.height * scale;
	ctx.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
	bitmap.close();
	const url = canvas.toDataURL("image/jpeg", .82);
	if (url.length > 12e4) throw new Error("That picture is still too large.");
	return url;
}
function Splash() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-cream px-6 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rise text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "mx-auto h-16 w-16" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 font-display text-4xl",
					children: "TWO OF US"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Every question brings you closer."
				})
			]
		})
	});
}
//#endregion
export { toggleFavorite as $, getHome as A, markNotifications as B, createFavoriteGame as C, disconnectPartner as D, deleteNote as E, inviteByEmail as F, respondInvite as G, reactToAnswer as H, listFavorites as I, saveSettings as J, saveFavoriteAnswer as K, listInvites as L, getProgress as M, getShell as N, endGame as O, getUs as P, submitDaily as Q, listNotes as R, confirmReset as S, deleteAccount as T, reportQuestion as U, pretty as V, requestReset as W, sendInvite as X, searchPeople as Y, submitAnswer as Z, advanceGame as _, Field as a, cn as b, Splash as c, adminAnnounce as d, adminOverview as f, adminSetReport as g, adminSetActive as h, ErrorNote as i, getPlay as j, fileToDataUrl as k, Wordmark as l, adminSearchQuestions as m, Button as n, Loading as o, adminSaveQuestion as p, saveProfile as q, Card as r, Logo as s, Avatar as t, addNote as u, cancelGame as v, createGame as w, completeChallenge as x, claimStudio as y, listNotifications as z };
