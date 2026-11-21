import { $t as union, Jt as number, Kt as literal, Qt as string, Ut as array, Vt as _enum, Wt as boolean, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
import { a as categoryName, c as predictionHit, d as streakFromDays, i as achievementList, l as revealTone, n as CATEGORY_IDS, o as dailyIndex, r as CHALLENGES, u as shortCategory } from "./logic-CEZ1fjvJ.mjs";
import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BNjEkSqG.mjs";
import { r as getSql } from "./db-BfFs4sDf.mjs";
import { createHash, randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/api-KGgD5e6a.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var STUDIO_KEY = "closer-2026";
function iso(value) {
	if (value == null) return null;
	if (value instanceof Date) return value.toISOString();
	return String(value) || null;
}
function num(value) {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}
function parseIds(raw) {
	try {
		const value = JSON.parse(raw);
		return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
	} catch {
		return [];
	}
}
function parseChoices(raw) {
	try {
		const value = JSON.parse(raw);
		return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
	} catch {
		return [];
	}
}
function cleanUsername(raw) {
	return raw.trim().toLowerCase().replace(/^@/, "");
}
function validUsername(name) {
	return /^[a-z0-9_]{3,20}$/.test(name);
}
function pairKey(a, b) {
	return [a, b].sort().join(":");
}
function fail(error) {
	return {
		ok: false,
		error
	};
}
async function db() {
	return getSql();
}
async function today(sql) {
	const day = (await sql`select (timezone('Africa/Lagos', now()))::date as day`)[0]?.day;
	return typeof day === "string" ? day.slice(0, 10) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
async function markDay(sql, userId) {
	await sql`insert into activity_days (user_id, day) values (${userId}, (timezone('Africa/Lagos', now()))::date) on conflict do nothing`;
}
async function notify(sql, userId, kind, title, body, href) {
	const prefs = (await sql`
    select notif_invites, notif_games, notif_turns, notif_daily from profiles where user_id = ${userId}`)[0];
	if (!prefs) return;
	if (!(kind === "invite" ? prefs.notif_invites : kind === "game" ? prefs.notif_games : kind === "turn" ? prefs.notif_turns : kind === "daily" ? prefs.notif_daily : true)) return;
	await sql`insert into notifications (id, user_id, kind, title, body, href) values (${randomUUID()}, ${userId}, ${kind}, ${title}, ${body}, ${href})`;
}
async function loadProfile(sql, userId) {
	return (await sql`select * from profiles where user_id = ${userId}`)[0] ?? null;
}
async function ensureProfile(sql, userId) {
	const authUser = (await sql`
    select "name", "email", "emailVerified" from "user" where "id" = ${userId}`)[0];
	if (!authUser) return null;
	await sql`insert into profiles (user_id, display_name) values (${userId}, ${(authUser.name || "Friend").slice(0, 40)}) on conflict (user_id) do nothing`;
	const invites = await sql`
    select id, from_user_id from email_invites where email = ${authUser.email.toLowerCase()} and status = 'pending'`;
	for (const invite of invites) {
		const created = await openConnection(sql, invite.from_user_id, userId);
		await sql`update email_invites set status = 'claimed' where id = ${invite.id}`;
		if (created.ok) await notify(sql, userId, "invite", "Connection invite", `${(await loadProfile(sql, invite.from_user_id))?.display_name || "Someone"} invited you to play.`, "/invites");
	}
	const profile = await loadProfile(sql, userId);
	return profile ? {
		profile,
		email: authUser.email,
		emailVerified: Boolean(authUser.emailVerified)
	} : null;
}
async function accepted(sql, userId) {
	return (await sql`
    select * from connections
    where status = 'accepted' and (requester_id = ${userId} or recipient_id = ${userId})
    limit 1`)[0] ?? null;
}
function otherOf(conn, userId) {
	return conn.requester_id === userId ? conn.recipient_id : conn.requester_id;
}
async function openConnection(sql, from, to) {
	if (from === to) return fail("You cannot connect with yourself.");
	if (!(await loadProfile(sql, to))?.username) return fail("That person does not have an account yet.");
	if (await accepted(sql, from)) return fail("You already have a partner. Disconnect first.");
	if ((await sql`
    select id, status from connections
    where status in ('pending', 'accepted')
      and ((requester_id = ${from} and recipient_id = ${to}) or (requester_id = ${to} and recipient_id = ${from}))
    limit 1`)[0]) return fail("An invite is already open between you.");
	const id = randomUUID();
	try {
		await sql`insert into connections (id, requester_id, recipient_id, status) values (${id}, ${from}, ${to}, 'pending')`;
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/unique|duplicate/i.test(message)) return fail("An invite is already open between you.");
		throw error;
	}
	return {
		ok: true,
		id
	};
}
async function ensureQuestions(sql) {
	if (num((await sql`select count(*) as n from questions`)[0]?.n) >= 200) return;
	const bank = (await import("./bank-CnSCNJW8.mjs")).BANK ?? [];
	if (bank.length === 0) return;
	const values = [];
	const chunks = [];
	bank.forEach((q, index) => {
		const base = index * 8;
		chunks.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`);
		values.push(q.id, q.text, q.category, q.difficulty, q.answerType, JSON.stringify(q.choices ?? []), q.sensitivity, q.audience);
	});
	await sql.query(`insert into questions (id, text, category, difficulty, answer_type, choices, sensitivity, audience)
     values ${chunks.join(", ")}
     on conflict (id) do nothing`, values);
}
async function partnerCard(sql, userId) {
	const conn = await accepted(sql, userId);
	if (!conn) return null;
	const otherId = otherOf(conn, userId);
	const profile = await loadProfile(sql, otherId);
	if (!profile) return null;
	return {
		userId: otherId,
		connectionId: conn.id,
		username: profile.username,
		displayName: profile.display_name,
		avatar: profile.avatar,
		bio: profile.bio,
		gender: profile.show_gender ? profile.gender : null,
		connectedAt: iso(conn.connected_at),
		allowMature: profile.allow_mature && profile.age_confirmed
	};
}
function sensitiveOk(me, partnerAllows) {
	return me.allow_mature && me.age_confirmed && partnerAllows;
}
async function pickQuestionIds(sql, opts) {
	const run = async (difficulty) => {
		const params = [];
		let where = "active = true";
		if (!opts.sensitive) where += " and sensitivity <> 'high' and audience <> '18plus'";
		if (opts.category !== "mix") {
			params.push(opts.category);
			where += ` and category = $${params.length}`;
		}
		if (difficulty !== "any") {
			params.push(difficulty);
			where += ` and difficulty = $${params.length}`;
		}
		params.push(opts.count);
		return (await sql.query(`select id from questions where ${where} order by random() limit $${params.length}`, params)).map((row) => row.id);
	};
	const first = await run(opts.difficulty);
	if (first.length >= Math.min(3, opts.count) || opts.difficulty === "any") return first;
	return run("any");
}
async function loadGame(sql, gameId, userId) {
	const game = (await sql`select * from games where id = ${gameId}`)[0];
	if (!game) return null;
	if (game.player_a !== userId && game.player_b !== userId) return null;
	return game;
}
async function loadQuestion(sql, id) {
	return (await sql`select * from questions where id = ${id}`)[0] ?? null;
}
function shapeQuestion(row) {
	return {
		id: row.id,
		text: row.text,
		category: row.category,
		difficulty: row.difficulty,
		answerType: row.answer_type,
		choices: parseChoices(row.choices),
		sensitivity: row.sensitivity
	};
}
function shapeAnswer(row) {
	return {
		id: row.id ?? "",
		body: row.body,
		choiceIndex: row.choice_index,
		prediction: row.prediction ?? null,
		predictionIndex: row.prediction_index ?? null,
		skipped: row.skipped
	};
}
function toneFor(question, mine, theirs) {
	return revealTone({
		answerType: question.answer_type,
		aSkipped: mine.skipped,
		bSkipped: theirs.skipped,
		aChoice: mine.choice_index,
		bChoice: theirs.choice_index,
		aText: mine.body,
		bText: theirs.body
	});
}
async function answersAt(sql, gameId, position, userId) {
	return (await sql`
    select * from answers where game_id = ${gameId} and position = ${position} and user_id = ${userId}`)[0] ?? null;
}
async function bothIn(sql, gameId, position) {
	return num((await sql`
    select count(*) as n from answers where game_id = ${gameId} and position = ${position}`)[0]?.n) >= 2;
}
function turnOwner(game, index, answered) {
	if (game.mode !== "turns") return null;
	return (index % 2 === 0 ? [game.player_a, game.player_b] : [game.player_b, game.player_a]).find((id) => !answered.includes(id)) ?? null;
}
async function buildResults(sql, game, userId) {
	const ids = parseIds(game.question_ids);
	const rows = await sql`select * from answers where game_id = ${game.id}`;
	const reactions = await sql`
    select position, user_id, kind from reactions where game_id = ${game.id}`;
	const partnerId = game.player_a === userId ? game.player_b : game.player_a;
	let samePicks = 0;
	let choiceCompared = 0;
	let youCalled = 0;
	let theyCalled = 0;
	let predictionChances = 0;
	const pairs = [];
	for (let position = 0; position < ids.length; position += 1) {
		const mine = rows.find((row) => row.position === position && row.user_id === userId);
		const theirs = rows.find((row) => row.position === position && row.user_id === partnerId);
		if (!mine || !theirs) continue;
		const question = await loadQuestion(sql, ids[position] ?? "");
		if (!question) continue;
		const tone = toneFor(question, mine, theirs);
		if (question.answer_type === "choice" || question.answer_type === "rather") {
			if (!mine.skipped && !theirs.skipped) {
				choiceCompared += 1;
				if (tone.tone === "match") samePicks += 1;
			}
		}
		if (game.category === "mirror" && !mine.skipped && !theirs.skipped) {
			predictionChances += 1;
			if (predictionHit(mine.prediction_index, mine.prediction ?? "", theirs.choice_index, theirs.body, question.answer_type)) youCalled += 1;
			if (predictionHit(theirs.prediction_index, theirs.prediction ?? "", mine.choice_index, mine.body, question.answer_type)) theyCalled += 1;
		}
		pairs.push({
			position,
			question: shapeQuestion(question),
			mine: shapeAnswer(mine),
			partner: shapeAnswer(theirs),
			tone,
			myReaction: reactions.find((item) => item.position === position && item.user_id === userId)?.kind ?? null,
			partnerReaction: reactions.find((item) => item.position === position && item.user_id === partnerId)?.kind ?? null
		});
	}
	return {
		pairs,
		samePicks,
		choiceCompared,
		youCalled,
		theyCalled,
		predictionChances
	};
}
async function playState(sql, game, userId) {
	const partnerId = game.player_a === userId ? game.player_b : game.player_a;
	const partner = await loadProfile(sql, partnerId);
	const ids = parseIds(game.question_ids);
	const base = {
		id: game.id,
		category: game.category,
		categoryLabel: categoryName(game.category),
		mode: game.mode,
		status: game.status,
		index: game.current_index,
		total: ids.length,
		createdAt: iso(game.created_at),
		updatedAt: iso(game.updated_at),
		completedAt: iso(game.completed_at),
		partnerSeen: userId === game.player_a ? game.seen_b : game.seen_a
	};
	const partnerView = {
		displayName: partner?.display_name ?? "Partner",
		username: partner?.username ?? "",
		avatar: partner?.avatar ?? null
	};
	if (game.status === "cancelled") return {
		ok: true,
		game: base,
		phase: "cancelled",
		partner: partnerView,
		question: null,
		mine: null,
		partnerSubmitted: false,
		partnerAnswer: null,
		reactions: {
			mine: null,
			partner: null
		},
		tone: null,
		saved: false,
		results: null
	};
	if (game.status === "completed") return {
		ok: true,
		game: base,
		phase: "completed",
		partner: partnerView,
		question: null,
		mine: null,
		partnerSubmitted: false,
		partnerAnswer: null,
		reactions: {
			mine: null,
			partner: null
		},
		tone: null,
		saved: false,
		results: await buildResults(sql, game, userId)
	};
	const position = game.current_index;
	const questionId = ids[position];
	const question = questionId ? await loadQuestion(sql, questionId) : null;
	const mine = await answersAt(sql, game.id, position, userId);
	const revealed = await bothIn(sql, game.id, position);
	const partnerSubmitted = revealed || Boolean((await sql`
    select user_id from answers where game_id = ${game.id} and position = ${position} and user_id = ${partnerId}`)[0]);
	const theirs = revealed ? await answersAt(sql, game.id, position, partnerId) : null;
	const owner = turnOwner(game, position, (await sql`
    select user_id from answers where game_id = ${game.id} and position = ${position}`).map((row) => row.user_id));
	let phase = "answer";
	if (revealed && mine && theirs) phase = "reveal";
	else if (mine) phase = "wait_partner";
	else if (game.mode === "turns" && owner && owner !== userId) phase = "wait_turn";
	const showQuestion = phase !== "wait_turn" && question;
	const fav = question ? await sql`
    select question_id from favorite_questions where user_id = ${userId} and question_id = ${question.id}` : [];
	const reactionRows = revealed ? await sql`
    select user_id, kind from reactions where game_id = ${game.id} and position = ${position}` : [];
	const tone = mine && theirs && question ? toneFor(question, mine, theirs) : null;
	return {
		ok: true,
		game: base,
		phase,
		partner: partnerView,
		question: showQuestion ? shapeQuestion(question) : null,
		mine: mine ? shapeAnswer(mine) : null,
		partnerSubmitted,
		partnerAnswer: theirs ? shapeAnswer(theirs) : null,
		reactions: {
			mine: reactionRows.find((row) => row.user_id === userId)?.kind ?? null,
			partner: reactionRows.find((row) => row.user_id === partnerId)?.kind ?? null
		},
		tone,
		saved: fav.length > 0,
		results: null
	};
}
async function streakFor(sql, userId) {
	const day = await today(sql);
	const rows = await sql`select day from activity_days where user_id = ${userId} order by day desc limit 40`;
	return streakFromDays(rows.map((row) => String(row.day).slice(0, 10)), day);
}
var getShell_createServerFn_handler = createServerRpc({
	id: "2b7856fd9b3962181e29c3a92dfb5262edef4cb8e5b85e708935947265caf2d0",
	name: "getShell",
	filename: "src/lib/two/api.ts"
}, (opts) => getShell.__executeServer(opts));
var getShell = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getShell_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	await ensureQuestions(sql);
	const ensured = await ensureProfile(sql, context.userId);
	if (!ensured) return fail("Account not found.");
	const unreadRows = await sql`select count(*) as n from notifications where user_id = ${context.userId} and read = false`;
	const incomingRows = await sql`select count(*) as n from connections where recipient_id = ${context.userId} and status = 'pending'`;
	const partner = await partnerCard(sql, context.userId);
	return {
		ok: true,
		email: ensured.email,
		emailVerified: ensured.emailVerified,
		unread: num(unreadRows[0]?.n),
		incoming: num(incomingRows[0]?.n),
		partner,
		profile: {
			username: ensured.profile.username,
			displayName: ensured.profile.display_name,
			avatar: ensured.profile.avatar,
			bio: ensured.profile.bio,
			theme: ensured.profile.theme,
			role: ensured.profile.role,
			gender: ensured.profile.gender,
			showGender: ensured.profile.show_gender,
			birthYear: ensured.profile.birth_year,
			ageConfirmed: ensured.profile.age_confirmed,
			allowMature: ensured.profile.allow_mature,
			notifInvites: ensured.profile.notif_invites,
			notifGames: ensured.profile.notif_games,
			notifTurns: ensured.profile.notif_turns,
			notifDaily: ensured.profile.notif_daily
		}
	};
});
var saveProfile_createServerFn_handler = createServerRpc({
	id: "b4098a3f216d26600bb330625ba6782ec3b617bbbc95f63bff0324738785cba7",
	name: "saveProfile",
	filename: "src/lib/two/api.ts"
}, (opts) => saveProfile.__executeServer(opts));
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
}).parse(input)).handler(saveProfile_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const ensured = await ensureProfile(sql, context.userId);
	if (!ensured) return fail("Account not found.");
	const username = cleanUsername(data.username);
	if (!validUsername(username)) return fail("Usernames are 3–20 characters: letters, numbers, underscores.");
	if ((await sql`select user_id from profiles where username = ${username} and user_id <> ${context.userId}`)[0]) return fail("That username is taken.");
	const displayName = data.displayName.trim();
	if (!displayName) return fail("Add a display name.");
	const yearNow = Number((await today(sql)).slice(0, 4));
	let birthYear = data.birthYear ?? null;
	if (birthYear != null && (birthYear < 1920 || birthYear > yearNow)) return fail("Check the birth year.");
	let ageConfirmed = Boolean(data.ageConfirmed);
	if (birthYear != null && yearNow - birthYear < 18) ageConfirmed = false;
	const allowMature = ageConfirmed ? ensured.profile.allow_mature : false;
	await sql`
      update profiles set
        username = ${username},
        display_name = ${displayName},
        bio = ${(data.bio ?? "").trim()},
        gender = ${data.gender ?? null},
        show_gender = ${Boolean(data.showGender)},
        birth_year = ${birthYear},
        age_confirmed = ${ageConfirmed},
        allow_mature = ${allowMature},
        updated_at = now()
      where user_id = ${context.userId}`;
	return { ok: true };
});
var saveSettings_createServerFn_handler = createServerRpc({
	id: "e3aa81605de8eeae2064533e0942e101953af8e88680f54e0df94253a79e4517",
	name: "saveSettings",
	filename: "src/lib/two/api.ts"
}, (opts) => saveSettings.__executeServer(opts));
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
}).parse(input)).handler(saveSettings_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const profile = await loadProfile(sql, context.userId);
	if (!profile) return fail("Set up your profile first.");
	if (data.avatar && !data.avatar.startsWith("data:image/")) return fail("Use a JPEG, PNG, or WebP picture.");
	const yearNow = Number((await today(sql)).slice(0, 4));
	const birthYear = data.birthYear === void 0 ? profile.birth_year : data.birthYear;
	if (birthYear != null && (birthYear < 1920 || birthYear > yearNow)) return fail("Check the birth year.");
	let ageConfirmed = data.ageConfirmed ?? profile.age_confirmed;
	if (birthYear != null && yearNow - birthYear < 18) ageConfirmed = false;
	let allowMature = data.allowMature ?? profile.allow_mature;
	if (!ageConfirmed) allowMature = false;
	await sql`
      update profiles set
        theme = ${data.theme ?? profile.theme},
        allow_mature = ${allowMature},
        age_confirmed = ${ageConfirmed},
        show_gender = ${data.showGender ?? profile.show_gender},
        bio = ${data.bio === void 0 ? profile.bio : data.bio.trim()},
        display_name = ${data.displayName === void 0 ? profile.display_name : data.displayName.trim()},
        avatar = ${data.avatar === void 0 ? profile.avatar : data.avatar},
        notif_invites = ${data.notifInvites ?? profile.notif_invites},
        notif_games = ${data.notifGames ?? profile.notif_games},
        notif_turns = ${data.notifTurns ?? profile.notif_turns},
        notif_daily = ${data.notifDaily ?? profile.notif_daily},
        gender = ${data.gender === void 0 ? profile.gender : data.gender},
        birth_year = ${birthYear},
        updated_at = now()
      where user_id = ${context.userId}`;
	return { ok: true };
});
var searchPeople_createServerFn_handler = createServerRpc({
	id: "59bcc2242beccbe546568e3312779fcde9724893a928191c682c98ccaf4dc644",
	name: "searchPeople",
	filename: "src/lib/two/api.ts"
}, (opts) => searchPeople.__executeServer(opts));
var searchPeople = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => object({ q: string().max(24) }).parse(input)).handler(searchPeople_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const q = cleanUsername(data.q).replace(/[%_\\]/g, "");
	if (q.length < 2) return {
		ok: true,
		people: []
	};
	const like = `%${q}%`;
	return {
		ok: true,
		people: (await sql`
      select username, display_name, avatar from profiles
      where user_id <> ${context.userId} and username is not null and (username like ${like} or lower(display_name) like ${like})
      order by username asc limit 8`).map((row) => ({
			username: row.username,
			displayName: row.display_name,
			avatar: row.avatar
		}))
	};
});
var sendInvite_createServerFn_handler = createServerRpc({
	id: "3b2ce25b988cdd2c7670224fba19b169c19d2cde0910c27424a5e3e9f421c75b",
	name: "sendInvite",
	filename: "src/lib/two/api.ts"
}, (opts) => sendInvite.__executeServer(opts));
var sendInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ username: string().min(2).max(24) }).parse(input)).handler(sendInvite_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	await ensureProfile(sql, context.userId);
	const found = await sql`select user_id from profiles where username = ${cleanUsername(data.username)}`;
	if (!found[0]) return fail("No one uses that username.");
	const created = await openConnection(sql, context.userId, found[0].user_id);
	if (!created.ok) return created;
	const me = await loadProfile(sql, context.userId);
	await notify(sql, found[0].user_id, "invite", "Connection invite", `${me?.display_name || "Someone"} wants to play with you.`, "/invites");
	return { ok: true };
});
var inviteByEmail_createServerFn_handler = createServerRpc({
	id: "4f02bbafc0cb1c1409dd868c745c84b12a1092cc8e16c1c819d705b0757a947a",
	name: "inviteByEmail",
	filename: "src/lib/two/api.ts"
}, (opts) => inviteByEmail.__executeServer(opts));
var inviteByEmail = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ email: string().email().max(120) }).parse(input)).handler(inviteByEmail_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	await ensureProfile(sql, context.userId);
	const email = data.email.trim().toLowerCase();
	const existingUser = await sql`select "id" from "user" where lower("email") = ${email}`;
	if (existingUser[0]) {
		const created = await openConnection(sql, context.userId, existingUser[0].id);
		if (!created.ok) return created;
		const me = await loadProfile(sql, context.userId);
		await notify(sql, existingUser[0].id, "invite", "Connection invite", `${me?.display_name || "Someone"} wants to play with you.`, "/invites");
		return {
			ok: true,
			held: false
		};
	}
	const id = randomUUID();
	try {
		await sql`insert into email_invites (id, from_user_id, email, status) values (${id}, ${context.userId}, ${email}, 'pending')`;
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/unique|duplicate/i.test(message)) return fail("That email invite is already waiting.");
		throw error;
	}
	return {
		ok: true,
		held: true
	};
});
var listInvites_createServerFn_handler = createServerRpc({
	id: "680aeceb2fcf5e5561052aedf71bcf53534fbb7dd3acef9189ed6f871360b4c9",
	name: "listInvites",
	filename: "src/lib/two/api.ts"
}, (opts) => listInvites.__executeServer(opts));
var listInvites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listInvites_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const incoming = await sql`
    select c.id, p.display_name, p.username, p.avatar, c.created_at
    from connections c join profiles p on p.user_id = c.requester_id
    where c.recipient_id = ${context.userId} and c.status = 'pending'
    order by c.created_at desc`;
	const outgoing = await sql`
    select c.id, p.display_name, p.username, c.created_at
    from connections c join profiles p on p.user_id = c.recipient_id
    where c.requester_id = ${context.userId} and c.status = 'pending'
    order by c.created_at desc`;
	return {
		ok: true,
		incoming: incoming.map((row) => ({
			id: row.id,
			displayName: row.display_name,
			username: row.username,
			avatar: row.avatar,
			createdAt: iso(row.created_at)
		})),
		outgoing: outgoing.map((row) => ({
			id: row.id,
			displayName: row.display_name,
			username: row.username,
			createdAt: iso(row.created_at)
		}))
	};
});
var respondInvite_createServerFn_handler = createServerRpc({
	id: "156c07a82005bd64da9bc499aef5d2c21bc0003cd807f371f7ae4fea725ec76a",
	name: "respondInvite",
	filename: "src/lib/two/api.ts"
}, (opts) => respondInvite.__executeServer(opts));
var respondInvite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: string().min(8),
	accept: boolean()
}).parse(input)).handler(respondInvite_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if (!data.accept) {
		if (!(await sql`
        update connections set status = 'declined', responded_at = now()
        where id = ${data.id} and recipient_id = ${context.userId} and status = 'pending'
        returning requester_id`)[0]) return fail("That invite is no longer open.");
		return { ok: true };
	}
	if (await accepted(sql, context.userId)) return fail("You already have a partner. Disconnect first.");
	const pending = await sql`select * from connections where id = ${data.id} and recipient_id = ${context.userId} and status = 'pending'`;
	if (!pending[0]) return fail("That invite is no longer open.");
	if (await accepted(sql, pending[0].requester_id)) return fail("They already connected with someone else.");
	if (!(await sql`
      update connections set status = 'accepted', responded_at = now(), connected_at = now()
      where id = ${data.id} and recipient_id = ${context.userId} and status = 'pending'
        and not exists (
          select 1 from connections c
          where c.status = 'accepted' and c.id <> connections.id
            and (c.requester_id in (connections.requester_id, connections.recipient_id)
              or c.recipient_id in (connections.requester_id, connections.recipient_id))
        )
      returning id`)[0]) return fail("Could not accept. One of you may already be connected.");
	const profile = await loadProfile(sql, context.userId);
	await notify(sql, pending[0].requester_id, "invite", "You are connected", `${profile?.display_name || "Your partner"} accepted. Your space is open.`, "/us");
	return { ok: true };
});
var disconnectPartner_createServerFn_handler = createServerRpc({
	id: "2b29b6e54d445b8ee805543564e41fe1dcd42be400a69c09be5987a59011ec08",
	name: "disconnectPartner",
	filename: "src/lib/two/api.ts"
}, (opts) => disconnectPartner.__executeServer(opts));
var disconnectPartner = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(disconnectPartner_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const row = (await sql`
    update connections set status = 'disconnected', responded_at = now()
    where status = 'accepted' and (requester_id = ${context.userId} or recipient_id = ${context.userId})
    returning requester_id, recipient_id`)[0];
	if (!row) return fail("You are not connected.");
	await notify(sql, row.requester_id === context.userId ? row.recipient_id : row.requester_id, "system", "Connection ended", `${(await loadProfile(sql, context.userId))?.display_name || "Your partner"} disconnected. Shared games stay in each of your histories.`, "/us");
	return { ok: true };
});
var getHome_createServerFn_handler = createServerRpc({
	id: "280d6e309b71b75d568557efacf66fa0bfebd8c2cafd1e0d2cd4f8602c4371fe",
	name: "getHome",
	filename: "src/lib/two/api.ts"
}, (opts) => getHome.__executeServer(opts));
var getHome = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getHome_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	await ensureQuestions(sql);
	const ensured = await ensureProfile(sql, context.userId);
	if (!ensured) return fail("Account not found.");
	const partner = await partnerCard(sql, context.userId);
	const day = await today(sql);
	const eligible = await sql`
    select id from questions where active = true and sensitivity <> 'high' and audience <> '18plus' and answer_type <> 'dare' order by id asc`;
	let dailyQuestion = null;
	if (eligible.length) {
		const pick = eligible[dailyIndex(day, eligible.length)]?.id;
		if (pick) {
			await sql`insert into daily_picks (day, question_id) values (${day}::date, ${pick}) on conflict (day) do nothing`;
			const picked = await sql`select question_id from daily_picks where day = ${day}::date`;
			dailyQuestion = picked[0] ? await loadQuestion(sql, picked[0].question_id) : null;
		}
	}
	const mineDaily = await sql`
    select * from daily_answers where user_id = ${context.userId} and day = ${day}::date`;
	let partnerDaily = null;
	let partnerDailySubmitted = false;
	if (partner) {
		const exists = await sql`select user_id from daily_answers where user_id = ${partner.userId} and day = ${day}::date`;
		partnerDailySubmitted = Boolean(exists[0]);
		if (mineDaily[0] && partnerDailySubmitted) partnerDaily = (await sql`select * from daily_answers where user_id = ${partner.userId} and day = ${day}::date`)[0] ?? null;
	}
	let challenge = null;
	if (partner) {
		const key = pairKey(context.userId, partner.userId);
		await sql`insert into couple_challenges (pair_key, day, title) values (${key}, ${day}::date, ${CHALLENGES[dailyIndex(day, CHALLENGES.length)] ?? CHALLENGES[0]}) on conflict (pair_key, day) do nothing`;
		const row = await sql`select title, done from couple_challenges where pair_key = ${key} and day = ${day}::date`;
		if (row[0]) challenge = {
			title: row[0].title,
			done: row[0].done
		};
	}
	const continueRows = await sql`
    select * from games
    where status = 'active' and (player_a = ${context.userId} or player_b = ${context.userId})
    order by updated_at desc limit 1`;
	const recent = await sql`
    select id, title, body, href, created_at, read from notifications where user_id = ${context.userId} order by created_at desc limit 4`;
	const announcement = await sql`
    select title, body from announcements where active = true order by created_at desc limit 1`;
	const dailyTone = dailyQuestion && mineDaily[0] && partnerDaily ? revealTone({
		answerType: dailyQuestion.answer_type,
		aSkipped: mineDaily[0].skipped,
		bSkipped: partnerDaily.skipped,
		aChoice: mineDaily[0].choice_index,
		bChoice: partnerDaily.choice_index,
		aText: mineDaily[0].body,
		bText: partnerDaily.body
	}) : null;
	return {
		ok: true,
		name: ensured.profile.display_name,
		streak: await streakFor(sql, context.userId),
		partner,
		announcement: announcement[0] ?? null,
		continueGame: continueRows[0] ? {
			id: continueRows[0].id,
			category: continueRows[0].category,
			label: categoryName(continueRows[0].category),
			mode: continueRows[0].mode
		} : null,
		daily: dailyQuestion ? {
			question: shapeQuestion(dailyQuestion),
			submitted: Boolean(mineDaily[0]),
			partnerSubmitted: partnerDailySubmitted,
			mine: mineDaily[0] ? shapeAnswer(mineDaily[0]) : null,
			partnerAnswer: partnerDaily ? shapeAnswer(partnerDaily) : null,
			tone: dailyTone
		} : null,
		challenge,
		recent: recent.map((row) => ({
			id: row.id,
			title: row.title,
			body: row.body,
			href: row.href,
			createdAt: iso(row.created_at),
			read: row.read
		}))
	};
});
var submitDaily_createServerFn_handler = createServerRpc({
	id: "34fcebd2b8d17e76490f765ded37eda83dd9a4c0f2aa598560e2e59ccf250b20",
	name: "submitDaily",
	filename: "src/lib/two/api.ts"
}, (opts) => submitDaily.__executeServer(opts));
var submitDaily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	body: string().max(800),
	choiceIndex: number().int().min(0).max(7).nullable(),
	skipped: boolean()
}).parse(input)).handler(submitDaily_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const day = await today(sql);
	const picked = await sql`select question_id from daily_picks where day = ${day}::date`;
	if (!picked[0]) return fail("Today's question is not ready.");
	const question = await loadQuestion(sql, picked[0].question_id);
	if (!question) return fail("That question is missing.");
	if ((await sql`select user_id from daily_answers where user_id = ${context.userId} and day = ${day}::date`)[0]) return fail("You already answered today.");
	let body = data.body.trim();
	let choiceIndex = data.choiceIndex;
	if (!data.skipped && (question.answer_type === "choice" || question.answer_type === "rather")) {
		const choices = parseChoices(question.choices);
		if (choiceIndex == null || !choices[choiceIndex]) return fail("Pick one option.");
		body = choices[choiceIndex];
	} else if (!data.skipped && body.length < 1) return fail("Write an answer, or skip.");
	if (data.skipped) {
		body = "";
		choiceIndex = null;
	}
	await sql`
      insert into daily_answers (user_id, day, question_id, body, choice_index, skipped)
      values (${context.userId}, ${day}::date, ${question.id}, ${body}, ${choiceIndex}, ${data.skipped})`;
	await markDay(sql, context.userId);
	const partner = await partnerCard(sql, context.userId);
	if (partner) {
		const me = await loadProfile(sql, context.userId);
		const other = await sql`select user_id from daily_answers where user_id = ${partner.userId} and day = ${day}::date`;
		await notify(sql, partner.userId, "daily", other[0] ? "Today's answers are ready" : "Daily question", other[0] ? "You can both see today's answers now." : `${me?.display_name || "Your partner"} answered today's question.`, "/daily");
	}
	return { ok: true };
});
var completeChallenge_createServerFn_handler = createServerRpc({
	id: "795848ebe514b9bea849da4b80f09c457f71c59845b54cb84fb33b5e8f25c41d",
	name: "completeChallenge",
	filename: "src/lib/two/api.ts"
}, (opts) => completeChallenge.__executeServer(opts));
var completeChallenge = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(completeChallenge_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const partner = await partnerCard(sql, context.userId);
	if (!partner) return fail("Connect a partner first.");
	const day = await today(sql);
	const key = pairKey(context.userId, partner.userId);
	if (!(await sql`
    update couple_challenges set done = true, done_by = ${context.userId}
    where pair_key = ${key} and day = ${day}::date
    returning pair_key`)[0]) return fail("No challenge for today yet.");
	await markDay(sql, context.userId);
	return { ok: true };
});
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
var createGame_createServerFn_handler = createServerRpc({
	id: "2d694b2c37b94d76142f0f2e0c2d7a37bcb1e3b7708cbd2c4d9c1a7f27d1061f",
	name: "createGame",
	filename: "src/lib/two/api.ts"
}, (opts) => createGame.__executeServer(opts));
var createGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => gameInput.parse(input)).handler(createGame_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	await ensureQuestions(sql);
	if (data.category !== "mix" && !CATEGORY_IDS.includes(data.category)) return fail("Unknown category.");
	const me = await loadProfile(sql, context.userId);
	if (!me?.username) return fail("Finish your profile first.");
	const partner = await partnerCard(sql, context.userId);
	if (!partner) return fail("Connect a partner before you start a game.");
	const ids = await pickQuestionIds(sql, {
		category: data.category,
		difficulty: data.difficulty,
		count: data.count,
		sensitive: sensitiveOk(me, partner.allowMature)
	});
	if (ids.length < 3) return fail("Not enough questions in that set yet.");
	const id = randomUUID();
	await sql`
      insert into games (id, player_a, player_b, category, mode, status, current_index, question_ids, created_by, seen_a, seen_b)
      values (${id}, ${context.userId}, ${partner.userId}, ${data.category}, ${data.mode}, 'active', 0, ${JSON.stringify(ids)}, ${context.userId}, true, false)`;
	await notify(sql, partner.userId, "game", "New game", `${me.display_name} started ${categoryName(data.category)}.`, `/play/${id}`);
	return {
		ok: true,
		id
	};
});
var createFavoriteGame_createServerFn_handler = createServerRpc({
	id: "018802b38be03e2f87130ef30a5d5bfc12ac9558d33a7aeec009c83b1d1f1c9e",
	name: "createFavoriteGame",
	filename: "src/lib/two/api.ts"
}, (opts) => createFavoriteGame.__executeServer(opts));
var createFavoriteGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ mode: _enum(["together", "turns"]) }).parse(input)).handler(createFavoriteGame_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const me = await loadProfile(sql, context.userId);
	const partner = await partnerCard(sql, context.userId);
	if (!me || !partner) return fail("Connect a partner first.");
	const favs = await sql`select question_id from favorite_questions where user_id = ${context.userId}`;
	if (favs.length < 3) return fail("Save at least three questions first.");
	const params = favs.map((row) => row.question_id);
	let text = `select id from questions where active = true and id in (${params.map((_, index) => `$${index + 1}`).join(", ")})`;
	if (!sensitiveOk(me, partner.allowMature)) text += " and sensitivity <> 'high' and audience <> '18plus'";
	text += " order by random() limit 8";
	const rows = await sql.query(text, params);
	if (rows.length < 3) return fail("Not enough active favourites to play.");
	const id = randomUUID();
	const ids = rows.map((row) => row.id);
	await sql`
      insert into games (id, player_a, player_b, category, mode, status, current_index, question_ids, created_by, seen_a, seen_b)
      values (${id}, ${context.userId}, ${partner.userId}, 'mix', ${data.mode}, 'active', 0, ${JSON.stringify(ids)}, ${context.userId}, true, false)`;
	await notify(sql, partner.userId, "game", "New game", `${me.display_name} started a round from favourite questions.`, `/play/${id}`);
	return {
		ok: true,
		id
	};
});
var getPlay_createServerFn_handler = createServerRpc({
	id: "ebd75517f01877af74ba030b4175c36bb4e53646809b0645ee58e09a9c62890a",
	name: "getPlay",
	filename: "src/lib/two/api.ts"
}, (opts) => getPlay.__executeServer(opts));
var getPlay = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => object({ gameId: string().min(8) }).parse(input)).handler(getPlay_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const game = await loadGame(sql, data.gameId, context.userId);
	if (!game) return fail("That game is not yours.");
	if (game.player_a === context.userId && !game.seen_a) {
		await sql`update games set seen_a = true, updated_at = now() where id = ${game.id}`;
		game.seen_a = true;
	}
	if (game.player_b === context.userId && !game.seen_b) {
		await sql`update games set seen_b = true, updated_at = now() where id = ${game.id}`;
		game.seen_b = true;
	}
	return playState(sql, game, context.userId);
});
var submitAnswer_createServerFn_handler = createServerRpc({
	id: "01cea4bc63b658f48ab9dfbbbdb35cc09909848cd174c084c2aff7af718bd375",
	name: "submitAnswer",
	filename: "src/lib/two/api.ts"
}, (opts) => submitAnswer.__executeServer(opts));
var submitAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	gameId: string().min(8),
	position: number().int().min(0),
	body: string().max(800),
	choiceIndex: number().int().min(0).max(7).nullable(),
	prediction: string().max(200),
	predictionIndex: number().int().min(0).max(7).nullable(),
	skipped: boolean()
}).parse(input)).handler(submitAnswer_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const game = await loadGame(sql, data.gameId, context.userId);
	if (!game || game.status !== "active") return fail("This game is not open.");
	if (data.position !== game.current_index) return fail("That question has moved on.");
	const question = await loadQuestion(sql, parseIds(game.question_ids)[data.position] ?? "");
	if (!question) return fail("Question missing.");
	if (await answersAt(sql, game.id, data.position, context.userId)) return fail("You already submitted this answer.");
	const answered = (await sql`
      select user_id from answers where game_id = ${game.id} and position = ${data.position}`).map((row) => row.user_id);
	const owner = turnOwner(game, data.position, answered);
	if (owner && owner !== context.userId) return fail("It is not your turn.");
	const choices = parseChoices(question.choices);
	let body = data.body.trim();
	let choiceIndex = data.choiceIndex;
	let prediction = data.prediction.trim();
	let predictionIndex = data.predictionIndex;
	if (data.skipped) {
		body = "";
		choiceIndex = null;
		prediction = "";
		predictionIndex = null;
	} else if (question.answer_type === "choice" || question.answer_type === "rather") {
		if (choiceIndex == null || !choices[choiceIndex]) return fail("Pick one option.");
		body = choices[choiceIndex];
		if (game.category === "mirror") {
			if (predictionIndex == null || !choices[predictionIndex]) return fail("Predict their pick too.");
			prediction = choices[predictionIndex];
		}
	} else if (body.length < 1) return fail("Write an answer, or skip.");
	else if (game.category === "mirror" && prediction.length < 1) return fail("Add what you think they will say.");
	try {
		await sql`
        insert into answers (id, game_id, position, user_id, body, choice_index, prediction, prediction_index, skipped)
        values (${randomUUID()}, ${game.id}, ${data.position}, ${context.userId}, ${body}, ${choiceIndex}, ${prediction || null}, ${predictionIndex}, ${data.skipped})`;
	} catch (error) {
		const message = error instanceof Error ? error.message : "";
		if (/unique|duplicate/i.test(message)) return fail("You already submitted this answer.");
		throw error;
	}
	await sql`update games set updated_at = now() where id = ${game.id}`;
	await markDay(sql, context.userId);
	const partnerId = game.player_a === context.userId ? game.player_b : game.player_a;
	const me = await loadProfile(sql, context.userId);
	const partnerDone = Boolean((await sql`
      select user_id from answers where game_id = ${game.id} and position = ${data.position} and user_id = ${partnerId}`)[0]);
	await notify(sql, partnerId, partnerDone ? "game" : "turn", partnerDone ? "Answers are ready" : game.mode === "turns" ? "Your turn" : "Partner answered", partnerDone ? "You can both reveal this question now." : `${me?.display_name || "Your partner"} is waiting on this question.`, `/play/${game.id}`);
	const fresh = await loadGame(sql, game.id, context.userId);
	return fresh ? playState(sql, fresh, context.userId) : fail("Game missing.");
});
var reactToAnswer_createServerFn_handler = createServerRpc({
	id: "992bb7c9e4d8ff1d895073abcb18b8d0964199784c217de453c5b8e50f44adcc",
	name: "reactToAnswer",
	filename: "src/lib/two/api.ts"
}, (opts) => reactToAnswer.__executeServer(opts));
var reactToAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	gameId: string().min(8),
	position: number().int().min(0),
	kind: _enum([
		"warm",
		"laugh",
		"curious",
		"keep"
	])
}).parse(input)).handler(reactToAnswer_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const game = await loadGame(sql, data.gameId, context.userId);
	if (!game) return fail("That game is not yours.");
	if (!await bothIn(sql, game.id, data.position)) return fail("Reactions open after you both answer.");
	await sql`
      insert into reactions (game_id, position, user_id, kind)
      values (${game.id}, ${data.position}, ${context.userId}, ${data.kind})
      on conflict (game_id, position, user_id) do update set kind = ${data.kind}`;
	return { ok: true };
});
var advanceGame_createServerFn_handler = createServerRpc({
	id: "f16f96c964a5113595f24bce7067ac3d697db175595a97563216b6657663d7ac",
	name: "advanceGame",
	filename: "src/lib/two/api.ts"
}, (opts) => advanceGame.__executeServer(opts));
var advanceGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	gameId: string().min(8),
	from: number().int().min(0)
}).parse(input)).handler(advanceGame_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const game = await loadGame(sql, data.gameId, context.userId);
	if (!game || game.status !== "active") return fail("This game is not open.");
	if (game.current_index !== data.from) return playState(sql, game, context.userId);
	if (!await bothIn(sql, game.id, game.current_index)) return fail("Wait until both answers are in.");
	const total = parseIds(game.question_ids).length;
	if (game.current_index + 1 >= total) await sql`update games set status = 'completed', completed_at = now(), updated_at = now() where id = ${game.id} and current_index = ${data.from}`;
	else await sql`update games set current_index = current_index + 1, updated_at = now() where id = ${game.id} and current_index = ${data.from} and status = 'active'`;
	const fresh = await loadGame(sql, game.id, context.userId);
	return fresh ? playState(sql, fresh, context.userId) : fail("Game missing.");
});
var endGame_createServerFn_handler = createServerRpc({
	id: "b0a1bc876fc685f1e12c459ec7d14d18e143b735cbd048a4f02100fd196ce188",
	name: "endGame",
	filename: "src/lib/two/api.ts"
}, (opts) => endGame.__executeServer(opts));
var endGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ gameId: string().min(8) }).parse(input)).handler(endGame_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const game = await loadGame(sql, data.gameId, context.userId);
	if (!game || game.status !== "active") return fail("This game is not open.");
	await sql`update games set status = 'completed', completed_at = now(), updated_at = now() where id = ${game.id}`;
	const fresh = await loadGame(sql, game.id, context.userId);
	return fresh ? playState(sql, fresh, context.userId) : fail("Game missing.");
});
var cancelGame_createServerFn_handler = createServerRpc({
	id: "95c211b4c0cea99ca69d135f6bf7eb151033f3951dfee5f2bfa323e60453a89d",
	name: "cancelGame",
	filename: "src/lib/two/api.ts"
}, (opts) => cancelGame.__executeServer(opts));
var cancelGame = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ gameId: string().min(8) }).parse(input)).handler(cancelGame_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const game = await loadGame(sql, data.gameId, context.userId);
	if (!game || game.status !== "active") return fail("This game is not open.");
	await sql`update games set status = 'cancelled', updated_at = now() where id = ${game.id}`;
	await notify(sql, game.player_a === context.userId ? game.player_b : game.player_a, "game", "Game cancelled", `${(await loadProfile(sql, context.userId))?.display_name || "Your partner"} cancelled this round. Unrevealed answers stay hidden.`, "/games");
	return { ok: true };
});
var toggleFavorite_createServerFn_handler = createServerRpc({
	id: "017d3e93c933df814fc57068fd30a29b6e45f813c177c1cb3c22945b329ac8a0",
	name: "toggleFavorite",
	filename: "src/lib/two/api.ts"
}, (opts) => toggleFavorite.__executeServer(opts));
var toggleFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ questionId: string().min(2) }).parse(input)).handler(toggleFavorite_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if ((await sql`
      select question_id from favorite_questions where user_id = ${context.userId} and question_id = ${data.questionId}`)[0]) {
		await sql`delete from favorite_questions where user_id = ${context.userId} and question_id = ${data.questionId}`;
		return {
			ok: true,
			saved: false
		};
	}
	if (!await loadQuestion(sql, data.questionId)) return fail("Question not found.");
	await sql`insert into favorite_questions (user_id, question_id) values (${context.userId}, ${data.questionId})`;
	return {
		ok: true,
		saved: true
	};
});
var saveFavoriteAnswer_createServerFn_handler = createServerRpc({
	id: "543f4080efde824657459e8e5c51fb80686d715a4a64f7cc8568583febc67541",
	name: "saveFavoriteAnswer",
	filename: "src/lib/two/api.ts"
}, (opts) => saveFavoriteAnswer.__executeServer(opts));
var saveFavoriteAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ answerId: string().min(8) }).parse(input)).handler(saveFavoriteAnswer_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const answer = (await sql`select * from answers where id = ${data.answerId}`)[0];
	if (!answer) return fail("Answer not found.");
	if (!await loadGame(sql, answer.game_id, context.userId)) return fail("That answer is not in your games.");
	if (!await bothIn(sql, answer.game_id, answer.position)) return fail("You can save an answer only after it is revealed.");
	await sql`
      insert into favorite_answers (user_id, answer_id) values (${context.userId}, ${data.answerId})
      on conflict do nothing`;
	return { ok: true };
});
var listFavorites_createServerFn_handler = createServerRpc({
	id: "121efddfbda0c006aa05db3b57e337bb039096d007c4a839e814faa95a47d795",
	name: "listFavorites",
	filename: "src/lib/two/api.ts"
}, (opts) => listFavorites.__executeServer(opts));
var listFavorites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listFavorites_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const questions = await sql`
    select q.* from favorite_questions f join questions q on q.id = f.question_id
    where f.user_id = ${context.userId} order by f.created_at desc`;
	const links = await sql`
    select answer_id from favorite_answers where user_id = ${context.userId} order by created_at desc`;
	const answers = [];
	for (const link of links) {
		const answer = (await sql`select * from answers where id = ${link.answer_id}`)[0];
		if (!answer) continue;
		const game = await loadGame(sql, answer.game_id, context.userId);
		if (!game || !await bothIn(sql, answer.game_id, answer.position)) continue;
		const questionId = parseIds(game.question_ids)[answer.position];
		const question = questionId ? await loadQuestion(sql, questionId) : null;
		const author = await loadProfile(sql, answer.user_id);
		answers.push({
			id: answer.id,
			body: answer.skipped ? "Skipped" : answer.body,
			question: question?.text ?? "",
			author: author?.display_name ?? "Partner"
		});
	}
	return {
		ok: true,
		questions: questions.map(shapeQuestion),
		answers
	};
});
var listNotes_createServerFn_handler = createServerRpc({
	id: "dc9747f1be335241756172d71e8eeb59019fa83f508b22efb5cddc12c7a32704",
	name: "listNotes",
	filename: "src/lib/two/api.ts"
}, (opts) => listNotes.__executeServer(opts));
var listNotes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotes_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const partner = await partnerCard(sql, context.userId);
	if (!partner) return {
		ok: true,
		partner: null,
		notes: []
	};
	const rows = await sql`
    select id, author_id, body, created_at from notes
    where (author_id = ${context.userId} and partner_id = ${partner.userId})
       or (author_id = ${partner.userId} and partner_id = ${context.userId})
    order by created_at desc limit 80`;
	return {
		ok: true,
		partner: { displayName: partner.displayName },
		notes: rows.map((row) => ({
			id: row.id,
			body: row.body,
			mine: row.author_id === context.userId,
			createdAt: iso(row.created_at)
		}))
	};
});
var addNote_createServerFn_handler = createServerRpc({
	id: "8fc1431efc98f8221d78761ba592f622772085e7971d9714d3ed1bac0e0b467a",
	name: "addNote",
	filename: "src/lib/two/api.ts"
}, (opts) => addNote.__executeServer(opts));
var addNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ body: string().min(1).max(500) }).parse(input)).handler(addNote_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	const partner = await partnerCard(sql, context.userId);
	if (!partner) return fail("Connect a partner before leaving notes.");
	const body = data.body.trim();
	if (!body) return fail("Write something first.");
	await sql`insert into notes (id, author_id, partner_id, body) values (${randomUUID()}, ${context.userId}, ${partner.userId}, ${body})`;
	const me = await loadProfile(sql, context.userId);
	await notify(sql, partner.userId, "system", "A new note", `${me?.display_name || "Your partner"} left a note in your space.`, "/notes");
	return { ok: true };
});
var deleteNote_createServerFn_handler = createServerRpc({
	id: "e149960463a2ad692f6f714019bcf25f97aace881d0686a894cfae818961e959",
	name: "deleteNote",
	filename: "src/lib/two/api.ts"
}, (opts) => deleteNote.__executeServer(opts));
var deleteNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: string().min(8) }).parse(input)).handler(deleteNote_createServerFn_handler, async ({ data, context }) => {
	if (!(await (await db())`delete from notes where id = ${data.id} and author_id = ${context.userId} returning id`)[0]) return fail("You can only remove notes you wrote.");
	return { ok: true };
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "2f9430f0400d29f74b2d8e8fc641c77e446c6d5012c3ee0c722a4f0bdeca874f",
	name: "listNotifications",
	filename: "src/lib/two/api.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	return {
		ok: true,
		items: (await (await db())`
    select id, title, body, href, read, created_at, kind from notifications
    where user_id = ${context.userId} order by created_at desc limit 40`).map((row) => ({
			id: row.id,
			title: row.title,
			body: row.body,
			href: row.href,
			read: row.read,
			kind: row.kind,
			createdAt: iso(row.created_at)
		}))
	};
});
var markNotifications_createServerFn_handler = createServerRpc({
	id: "62908172ac46c9a75b4db7f4544f5b1bb062e0ece3ada152a88db4bf3fc47407",
	name: "markNotifications",
	filename: "src/lib/two/api.ts"
}, (opts) => markNotifications.__executeServer(opts));
var markNotifications = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ id: string().optional() }).parse(input)).handler(markNotifications_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if (data.id) await sql`update notifications set read = true where id = ${data.id} and user_id = ${context.userId}`;
	else await sql`update notifications set read = true where user_id = ${context.userId} and read = false`;
	return { ok: true };
});
var getUs_createServerFn_handler = createServerRpc({
	id: "6606cb045f4d3e57e8313c391726019420521571de29b9d3bf5c0e0f22b2da0d",
	name: "getUs",
	filename: "src/lib/two/api.ts"
}, (opts) => getUs.__executeServer(opts));
var getUs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getUs_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const partner = await partnerCard(sql, context.userId);
	const games = await sql`
    select id, category, mode, status, completed_at, question_ids from games
    where status = 'completed' and (player_a = ${context.userId} or player_b = ${context.userId})
    order by completed_at desc limit 12`;
	const notes = partner ? await sql`
        select id, body, author_id from notes
        where (author_id = ${context.userId} and partner_id = ${partner.userId})
           or (author_id = ${partner.userId} and partner_id = ${context.userId})
        order by created_at desc limit 3` : [];
	return {
		ok: true,
		partner,
		memories: games.map((game) => ({
			id: game.id,
			label: categoryName(game.category),
			mode: game.mode,
			questions: parseIds(game.question_ids).length,
			completedAt: iso(game.completed_at)
		})),
		notes: notes.map((note) => ({
			id: note.id,
			body: note.body,
			mine: note.author_id === context.userId
		}))
	};
});
var getProgress_createServerFn_handler = createServerRpc({
	id: "d52a189a6ce312c7d87a0088068e6e28827e70a0f0b34fee05c966b4a542e772",
	name: "getProgress",
	filename: "src/lib/two/api.ts"
}, (opts) => getProgress.__executeServer(opts));
var getProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getProgress_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const partner = await partnerCard(sql, context.userId);
	const answerCount = await sql`select count(*) as n from answers where user_id = ${context.userId} and skipped = false`;
	const games = await sql`
    select id, category, status, question_ids, player_a, player_b, completed_at from games
    where player_a = ${context.userId} or player_b = ${context.userId}`;
	const completed = games.filter((game) => game.status === "completed");
	const noteCount = await sql`select count(*) as n from notes where author_id = ${context.userId}`;
	const categories = new Set(games.map((game) => game.category).filter((id) => id !== "mix"));
	let samePicks = 0;
	let choiceCompared = 0;
	let differentPicks = 0;
	let youCalled = 0;
	let predictionChances = 0;
	const byCategory = {};
	if (completed.length) {
		const ids = completed.map((game) => game.id);
		const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
		const answerRows = await sql.query(`select * from answers where game_id in (${placeholders})`, ids);
		for (const game of completed) {
			byCategory[game.category] = (byCategory[game.category] ?? 0) + 1;
			const qids = parseIds(game.question_ids);
			const partnerId = game.player_a === context.userId ? game.player_b : game.player_a;
			for (let position = 0; position < qids.length; position += 1) {
				const mine = answerRows.find((row) => row.game_id === game.id && row.position === position && row.user_id === context.userId);
				const theirs = answerRows.find((row) => row.game_id === game.id && row.position === position && row.user_id === partnerId);
				if (!mine || !theirs) continue;
				const question = await loadQuestion(sql, qids[position] ?? "");
				if (!question || mine.skipped || theirs.skipped) continue;
				if (question.answer_type === "choice" || question.answer_type === "rather") {
					choiceCompared += 1;
					if (mine.choice_index === theirs.choice_index) samePicks += 1;
					else differentPicks += 1;
				}
				if (game.category === "mirror") {
					predictionChances += 1;
					if (predictionHit(mine.prediction_index, mine.prediction ?? "", theirs.choice_index, theirs.body, question.answer_type)) youCalled += 1;
				}
			}
		}
	}
	const favourite = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
	const streak = await streakFor(sql, context.userId);
	const stats = {
		gamesCompleted: completed.length,
		answers: num(answerCount[0]?.n),
		streak,
		notes: num(noteCount[0]?.n),
		connected: Boolean(partner),
		categoriesPlayed: categories.size,
		predictionsCorrect: youCalled
	};
	const chart = [
		"know",
		"mirror",
		"love",
		"deep",
		"fun",
		"rather",
		"spark",
		"mix"
	].map((id) => ({
		id,
		name: shortCategory(id),
		count: byCategory[id] ?? 0
	}));
	return {
		ok: true,
		stats,
		samePicks,
		differentPicks,
		choiceCompared,
		predictionChances,
		favourite: favourite ? categoryName(favourite[0]) : null,
		badges: achievementList(stats),
		chart,
		recent: completed.slice(0, 6).map((game) => ({
			id: game.id,
			label: categoryName(game.category),
			completedAt: iso(game.completed_at)
		}))
	};
});
var reportQuestion_createServerFn_handler = createServerRpc({
	id: "35e1c0e4408ee186543474a50e22be6cee6921d341dec6263a26c9cef54bd84a",
	name: "reportQuestion",
	filename: "src/lib/two/api.ts"
}, (opts) => reportQuestion.__executeServer(opts));
var reportQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	questionId: string().min(2),
	reason: string().min(3).max(280)
}).parse(input)).handler(reportQuestion_createServerFn_handler, async ({ data, context }) => {
	await (await db())`insert into reports (id, reporter_id, question_id, reason) values (${randomUUID()}, ${context.userId}, ${data.questionId}, ${data.reason.trim()})`;
	return { ok: true };
});
var reportClientError_createServerFn_handler = createServerRpc({
	id: "ce8881eaccf89b4bd7d6e745a73fe3bd95e124ca0a2af8747c26796427be976c",
	name: "reportClientError",
	filename: "src/lib/two/api.ts"
}, (opts) => reportClientError.__executeServer(opts));
var reportClientError = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ message: string().min(1).max(500) }).parse(input)).handler(reportClientError_createServerFn_handler, async ({ data, context }) => {
	await (await db())`insert into error_logs (id, user_id, message) values (${randomUUID()}, ${context.userId}, ${data.message.slice(0, 500)})`;
	return { ok: true };
});
var requestReset_createServerFn_handler = createServerRpc({
	id: "c41f49996c87f6a41a7867a5ae5f40448c7d46a34aa87805cf544b4f67bc8cb2",
	name: "requestReset",
	filename: "src/lib/two/api.ts"
}, (opts) => requestReset.__executeServer(opts));
var requestReset = createServerFn({ method: "POST" }).validator((input) => object({ email: string().email().max(120) }).parse(input)).handler(requestReset_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const email = data.email.trim().toLowerCase();
	const users = await sql`select "id" from "user" where lower("email") = ${email}`;
	const generic = "If that email has a password account, you can set a new one.";
	if (!users[0]) return {
		ok: true,
		previewCode: null,
		message: generic
	};
	const code = String(Math.floor(1e5 + Math.random() * 9e5));
	const codeHash = createHash("sha256").update(`${email}:${code}`).digest("hex");
	await sql`insert into password_resets (id, email, code_hash, expires_at) values (${randomUUID()}, ${email}, ${codeHash}, now() + interval '15 minutes')`;
	const preview = !process.env.DATABASE_URL;
	return {
		ok: true,
		previewCode: preview ? code : null,
		message: preview ? "This preview cannot send email. Use the one-time code below. It expires in 15 minutes." : "Email delivery is not connected on this build. If you still know the password, change it in Settings. Google and X sign-in stay available."
	};
});
var confirmReset_createServerFn_handler = createServerRpc({
	id: "02a510d7ea335e0e5370c47850a047e4152fabe8294fcf007c717221d55b5380",
	name: "confirmReset",
	filename: "src/lib/two/api.ts"
}, (opts) => confirmReset.__executeServer(opts));
var confirmReset = createServerFn({ method: "POST" }).validator((input) => object({
	email: string().email().max(120),
	code: string().min(6).max(8),
	password: string().min(8).max(72)
}).parse(input)).handler(confirmReset_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const email = data.email.trim().toLowerCase();
	const rows = await sql`
      select id from password_resets
      where email = ${email} and code_hash = ${createHash("sha256").update(`${email}:${data.code.trim()}`).digest("hex")} and used = false and expires_at > now()
      order by expires_at desc limit 1`;
	if (!rows[0]) return fail("That code is wrong or expired.");
	const user = await sql`select "id" from "user" where lower("email") = ${email}`;
	if (!user[0]) return fail("Account not found.");
	const { hashPassword } = await import("./crypto-QVkT-fgq.mjs").then((n) => n.t).then((n) => n.t);
	if (!(await sql`
      update "account" set "password" = ${await hashPassword(data.password)}, "updatedAt" = now()
      where "userId" = ${user[0].id} and "providerId" = 'credential'
      returning "id"`)[0]) return fail("This account uses Google or X. Sign in that way instead.");
	await sql`update password_resets set used = true where id = ${rows[0].id}`;
	return { ok: true };
});
var deleteAccount_createServerFn_handler = createServerRpc({
	id: "72b75d0be5f3c611ac19a7822d799eb66ae2f2849c4efe22e9055cb7e86803a7",
	name: "deleteAccount",
	filename: "src/lib/two/api.ts"
}, (opts) => deleteAccount.__executeServer(opts));
var deleteAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ phrase: string() }).parse(input)).handler(deleteAccount_createServerFn_handler, async ({ data, context }) => {
	if (data.phrase.trim() !== "DELETE") return fail("Type DELETE to confirm.");
	const sql = await db();
	const partner = await partnerCard(sql, context.userId);
	if (partner) {
		const me = await loadProfile(sql, context.userId);
		await notify(sql, partner.userId, "system", "Partner account deleted", `${me?.display_name || "Your partner"} deleted their account. Shared games were removed.`, "/us");
	}
	const gameIds = await sql`select id from games where player_a = ${context.userId} or player_b = ${context.userId}`;
	for (const game of gameIds) {
		await sql`delete from reactions where game_id = ${game.id}`;
		await sql`delete from answers where game_id = ${game.id}`;
	}
	await sql`delete from games where player_a = ${context.userId} or player_b = ${context.userId}`;
	await sql`delete from favorite_answers where user_id = ${context.userId}`;
	await sql`delete from favorite_questions where user_id = ${context.userId}`;
	await sql`delete from notes where author_id = ${context.userId} or partner_id = ${context.userId}`;
	await sql`delete from notifications where user_id = ${context.userId}`;
	await sql`delete from activity_days where user_id = ${context.userId}`;
	await sql`delete from daily_answers where user_id = ${context.userId}`;
	await sql`delete from connections where requester_id = ${context.userId} or recipient_id = ${context.userId}`;
	await sql`delete from email_invites where from_user_id = ${context.userId}`;
	await sql`delete from reports where reporter_id = ${context.userId}`;
	await sql`delete from profiles where user_id = ${context.userId}`;
	await sql`delete from "session" where "userId" = ${context.userId}`;
	await sql`delete from "account" where "userId" = ${context.userId}`;
	await sql`delete from "user" where "id" = ${context.userId}`;
	return { ok: true };
});
async function adminGate(sql, userId) {
	return (await loadProfile(sql, userId))?.role === "admin";
}
var claimStudio_createServerFn_handler = createServerRpc({
	id: "f4460eace6b3d3feab118449d7104888765ab16cb53e9e298d38edfe3495c74d",
	name: "claimStudio",
	filename: "src/lib/two/api.ts"
}, (opts) => claimStudio.__executeServer(opts));
var claimStudio = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({ key: string().max(40) }).parse(input)).handler(claimStudio_createServerFn_handler, async ({ data, context }) => {
	if (data.key.trim() !== STUDIO_KEY) return fail("That studio key is not valid.");
	const sql = await db();
	await ensureProfile(sql, context.userId);
	await sql`update profiles set role = 'admin', updated_at = now() where user_id = ${context.userId}`;
	return { ok: true };
});
var adminOverview_createServerFn_handler = createServerRpc({
	id: "65965ab3522113e0a9f4a7b61f548d4759b244f549517296ccaa7c5e5538ad19",
	name: "adminOverview",
	filename: "src/lib/two/api.ts"
}, (opts) => adminOverview.__executeServer(opts));
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(adminOverview_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	if (!await adminGate(sql, context.userId)) return fail("Studio access only.");
	const users = await sql`select count(*) as n from profiles`;
	const games = await sql`select count(*) as n from games`;
	const answers = await sql`select count(*) as n from answers`;
	const openReports = await sql`select count(*) as n from reports where status = 'open'`;
	const questions = await sql`select * from questions order by created_at desc limit 30`;
	const reports = await sql`
    select id, question_id, reason, status, created_at from reports order by created_at desc limit 20`;
	const errors = await sql`
    select id, message, created_at from error_logs order by created_at desc limit 15`;
	const announcements = await sql`
    select id, title, body, active from announcements order by created_at desc limit 8`;
	return {
		ok: true,
		counts: {
			people: num(users[0]?.n),
			games: num(games[0]?.n),
			answers: num(answers[0]?.n),
			reports: num(openReports[0]?.n)
		},
		questions: questions.map((row) => ({
			...shapeQuestion(row),
			active: row.active,
			audience: row.audience
		})),
		reports: reports.map((row) => ({
			id: row.id,
			questionId: row.question_id,
			reason: row.reason,
			status: row.status,
			createdAt: iso(row.created_at)
		})),
		errors: errors.map((row) => ({
			id: row.id,
			message: row.message,
			createdAt: iso(row.created_at)
		})),
		announcements
	};
});
var adminSaveQuestion_createServerFn_handler = createServerRpc({
	id: "71a409c179117433688ab90ef6f330172c6bae4f3212d7b7670a8e5a8fa69dea",
	name: "adminSaveQuestion",
	filename: "src/lib/two/api.ts"
}, (opts) => adminSaveQuestion.__executeServer(opts));
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
}).parse(input)).handler(adminSaveQuestion_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if (!await adminGate(sql, context.userId)) return fail("Studio access only.");
	if (!CATEGORY_IDS.includes(data.category)) return fail("Unknown category.");
	if ((data.answerType === "choice" || data.answerType === "rather") && data.choices.length < 2) return fail("Add at least two choices.");
	if (data.answerType === "rather" && data.choices.length !== 2) return fail("Would You Rather needs exactly two choices.");
	const choices = JSON.stringify(data.answerType === "choice" || data.answerType === "rather" ? data.choices : []);
	if (data.id) {
		if (!(await sql`
        update questions set text = ${data.text.trim()}, category = ${data.category}, difficulty = ${data.difficulty},
          answer_type = ${data.answerType}, choices = ${choices}, sensitivity = ${data.sensitivity},
          audience = ${data.audience}, active = ${data.active}
        where id = ${data.id} returning id`)[0]) return fail("Question not found.");
		return {
			ok: true,
			id: data.id
		};
	}
	const id = `c${randomUUID().slice(0, 8)}`;
	await sql`
      insert into questions (id, text, category, difficulty, answer_type, choices, sensitivity, audience, active)
      values (${id}, ${data.text.trim()}, ${data.category}, ${data.difficulty}, ${data.answerType}, ${choices}, ${data.sensitivity}, ${data.audience}, ${data.active})`;
	return {
		ok: true,
		id
	};
});
var adminSetActive_createServerFn_handler = createServerRpc({
	id: "9bb77765355d57af80835782185d6abe25da2daf7e395f0c87eb06ab8516a6c6",
	name: "adminSetActive",
	filename: "src/lib/two/api.ts"
}, (opts) => adminSetActive.__executeServer(opts));
var adminSetActive = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: string(),
	active: boolean()
}).parse(input)).handler(adminSetActive_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if (!await adminGate(sql, context.userId)) return fail("Studio access only.");
	await sql`update questions set active = ${data.active} where id = ${data.id}`;
	return { ok: true };
});
var adminSetReport_createServerFn_handler = createServerRpc({
	id: "9d4d843602dda12b0c905bbe482e4ddc27414d16d7477a310be66299340700d9",
	name: "adminSetReport",
	filename: "src/lib/two/api.ts"
}, (opts) => adminSetReport.__executeServer(opts));
var adminSetReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	id: string(),
	status: _enum([
		"open",
		"reviewed",
		"hidden"
	])
}).parse(input)).handler(adminSetReport_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if (!await adminGate(sql, context.userId)) return fail("Studio access only.");
	const report = await sql`select question_id from reports where id = ${data.id}`;
	await sql`update reports set status = ${data.status} where id = ${data.id}`;
	if (data.status === "hidden" && report[0]?.question_id) await sql`update questions set active = false where id = ${report[0].question_id}`;
	return { ok: true };
});
var adminAnnounce_createServerFn_handler = createServerRpc({
	id: "d5964af24608e3091bb80fa5be510fb46d4d861c0726831571a02a78112e2644",
	name: "adminAnnounce",
	filename: "src/lib/two/api.ts"
}, (opts) => adminAnnounce.__executeServer(opts));
var adminAnnounce = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	title: string().min(2).max(80),
	body: string().min(2).max(280)
}).parse(input)).handler(adminAnnounce_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if (!await adminGate(sql, context.userId)) return fail("Studio access only.");
	await sql`insert into announcements (id, title, body, active) values (${randomUUID()}, ${data.title.trim()}, ${data.body.trim()}, true)`;
	return { ok: true };
});
var adminSearchQuestions_createServerFn_handler = createServerRpc({
	id: "d524966b6bc5ec9968b7fade969b6ba68a39da53642d618822bd7f339e71921d",
	name: "adminSearchQuestions",
	filename: "src/lib/two/api.ts"
}, (opts) => adminSearchQuestions.__executeServer(opts));
var adminSearchQuestions = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => object({ q: string().max(60) }).parse(input)).handler(adminSearchQuestions_createServerFn_handler, async ({ data, context }) => {
	const sql = await db();
	if (!await adminGate(sql, context.userId)) return fail("Studio access only.");
	const q = data.q.trim().replace(/[%_\\]/g, "");
	const like = `%${q}%`;
	return {
		ok: true,
		questions: (q ? await sql`select * from questions where text ilike ${like} order by id asc limit 40` : await sql`select * from questions order by created_at desc limit 30`).map((row) => ({
			...shapeQuestion(row),
			active: row.active,
			audience: row.audience
		}))
	};
});
//#endregion
export { addNote_createServerFn_handler, adminAnnounce_createServerFn_handler, adminOverview_createServerFn_handler, adminSaveQuestion_createServerFn_handler, adminSearchQuestions_createServerFn_handler, adminSetActive_createServerFn_handler, adminSetReport_createServerFn_handler, advanceGame_createServerFn_handler, cancelGame_createServerFn_handler, claimStudio_createServerFn_handler, completeChallenge_createServerFn_handler, confirmReset_createServerFn_handler, createFavoriteGame_createServerFn_handler, createGame_createServerFn_handler, deleteAccount_createServerFn_handler, deleteNote_createServerFn_handler, disconnectPartner_createServerFn_handler, endGame_createServerFn_handler, getHome_createServerFn_handler, getPlay_createServerFn_handler, getProgress_createServerFn_handler, getShell_createServerFn_handler, getUs_createServerFn_handler, inviteByEmail_createServerFn_handler, listFavorites_createServerFn_handler, listInvites_createServerFn_handler, listNotes_createServerFn_handler, listNotifications_createServerFn_handler, markNotifications_createServerFn_handler, reactToAnswer_createServerFn_handler, reportClientError_createServerFn_handler, reportQuestion_createServerFn_handler, requestReset_createServerFn_handler, respondInvite_createServerFn_handler, saveFavoriteAnswer_createServerFn_handler, saveProfile_createServerFn_handler, saveSettings_createServerFn_handler, searchPeople_createServerFn_handler, sendInvite_createServerFn_handler, submitAnswer_createServerFn_handler, submitDaily_createServerFn_handler, toggleFavorite_createServerFn_handler };
