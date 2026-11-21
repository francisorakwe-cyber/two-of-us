import { createHash, randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { CATEGORY_IDS, categoryName, shortCategory } from "./categories";
import {
  CHALLENGES,
  achievementList,
  dailyIndex,
  predictionHit,
  revealTone,
  streakFromDays,
  type RevealTone,
} from "./logic";

const STUDIO_KEY = "closer-2026";

type Profile = {
  user_id: string;
  username: string | null;
  display_name: string;
  bio: string;
  avatar: string | null;
  gender: string | null;
  show_gender: boolean;
  birth_year: number | null;
  age_confirmed: boolean;
  allow_mature: boolean;
  theme: string;
  role: string;
  notif_invites: boolean;
  notif_games: boolean;
  notif_turns: boolean;
  notif_daily: boolean;
};

type Conn = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: unknown;
  connected_at: unknown;
};

type GameRow = {
  id: string;
  player_a: string;
  player_b: string;
  category: string;
  mode: string;
  status: string;
  current_index: number;
  question_ids: string;
  created_by: string;
  seen_a: boolean;
  seen_b: boolean;
  created_at: unknown;
  updated_at: unknown;
  completed_at: unknown;
};

type QuestionRow = {
  id: string;
  text: string;
  category: string;
  difficulty: string;
  answer_type: string;
  choices: string;
  sensitivity: string;
  audience: string;
  active: boolean;
};

type AnswerRow = {
  id: string;
  game_id: string;
  position: number;
  user_id: string;
  body: string;
  choice_index: number | null;
  prediction: string | null;
  prediction_index: number | null;
  skipped: boolean;
};

function iso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  const text = String(value);
  return text || null;
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseIds(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parseChoices(raw: string): string[] {
  try {
    const value = JSON.parse(raw) as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function cleanUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

function validUsername(name: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(name);
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

function fail(error: string) {
  return { ok: false as const, error };
}

async function db(): Promise<Sql> {
  return getSql();
}

async function today(sql: Sql): Promise<string> {
  const rows = await sql<{ day: string }>`select (timezone('Africa/Lagos', now()))::date as day`;
  const day = rows[0]?.day;
  return typeof day === "string" ? day.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

async function markDay(sql: Sql, userId: string) {
  await sql`insert into activity_days (user_id, day) values (${userId}, (timezone('Africa/Lagos', now()))::date) on conflict do nothing`;
}

async function notify(
  sql: Sql,
  userId: string,
  kind: "invite" | "game" | "turn" | "daily" | "system",
  title: string,
  body: string,
  href: string | null,
) {
  const rows = await sql<Pick<Profile, "notif_invites" | "notif_games" | "notif_turns" | "notif_daily">>`
    select notif_invites, notif_games, notif_turns, notif_daily from profiles where user_id = ${userId}`;
  const prefs = rows[0];
  if (!prefs) return;
  const allowed =
    kind === "invite" ? prefs.notif_invites :
    kind === "game" ? prefs.notif_games :
    kind === "turn" ? prefs.notif_turns :
    kind === "daily" ? prefs.notif_daily :
    true;
  if (!allowed) return;
  await sql`insert into notifications (id, user_id, kind, title, body, href) values (${randomUUID()}, ${userId}, ${kind}, ${title}, ${body}, ${href})`;
}

async function loadProfile(sql: Sql, userId: string): Promise<Profile | null> {
  const rows = await sql<Profile>`select * from profiles where user_id = ${userId}`;
  return rows[0] ?? null;
}

async function ensureProfile(sql: Sql, userId: string) {
  const authRows = await sql<{ name: string; email: string; emailVerified: boolean }>`
    select "name", "email", "emailVerified" from "user" where "id" = ${userId}`;
  const authUser = authRows[0];
  if (!authUser) return null;
  const starter = (authUser.name || "Friend").slice(0, 40);
  await sql`insert into profiles (user_id, display_name) values (${userId}, ${starter}) on conflict (user_id) do nothing`;
  const email = authUser.email.toLowerCase();
  const invites = await sql<{ id: string; from_user_id: string }>`
    select id, from_user_id from email_invites where email = ${email} and status = 'pending'`;
  for (const invite of invites) {
    const created = await openConnection(sql, invite.from_user_id, userId);
    await sql`update email_invites set status = 'claimed' where id = ${invite.id}`;
    if (created.ok) {
      const from = await loadProfile(sql, invite.from_user_id);
      await notify(sql, userId, "invite", "Connection invite", `${from?.display_name || "Someone"} invited you to play.`, "/invites");
    }
  }
  const profile = await loadProfile(sql, userId);
  return profile ? { profile, email: authUser.email, emailVerified: Boolean(authUser.emailVerified) } : null;
}

async function accepted(sql: Sql, userId: string): Promise<Conn | null> {
  const rows = await sql<Conn>`
    select * from connections
    where status = 'accepted' and (requester_id = ${userId} or recipient_id = ${userId})
    limit 1`;
  return rows[0] ?? null;
}

function otherOf(conn: Conn, userId: string): string {
  return conn.requester_id === userId ? conn.recipient_id : conn.requester_id;
}

async function openConnection(sql: Sql, from: string, to: string) {
  if (from === to) return fail("You cannot connect with yourself.");
  const toProfile = await loadProfile(sql, to);
  if (!toProfile?.username) return fail("That person does not have an account yet.");
  if (await accepted(sql, from)) return fail("You already have a partner. Disconnect first.");
  const existing = await sql<{ id: string; status: string }>`
    select id, status from connections
    where status in ('pending', 'accepted')
      and ((requester_id = ${from} and recipient_id = ${to}) or (requester_id = ${to} and recipient_id = ${from}))
    limit 1`;
  if (existing[0]) return fail("An invite is already open between you.");
  const id = randomUUID();
  try {
    await sql`insert into connections (id, requester_id, recipient_id, status) values (${id}, ${from}, ${to}, 'pending')`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/unique|duplicate/i.test(message)) return fail("An invite is already open between you.");
    throw error;
  }
  return { ok: true as const, id };
}

async function ensureQuestions(sql: Sql) {
  const countRows = await sql<{ n: number }>`select count(*) as n from questions`;
  if (num(countRows[0]?.n) >= 200) return;
  const mod = (await import("./bank")) as {
    BANK: Array<{
      id: string;
      text: string;
      category: string;
      difficulty: string;
      answerType: string;
      choices: string[];
      sensitivity: string;
      audience: string;
    }>;
  };
  const bank = mod.BANK ?? [];
  if (bank.length === 0) return;
  const values: unknown[] = [];
  const chunks: string[] = [];
  bank.forEach((q, index) => {
    const base = index * 8;
    chunks.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`);
    values.push(q.id, q.text, q.category, q.difficulty, q.answerType, JSON.stringify(q.choices ?? []), q.sensitivity, q.audience);
  });
  await sql.query(
    `insert into questions (id, text, category, difficulty, answer_type, choices, sensitivity, audience)
     values ${chunks.join(", ")}
     on conflict (id) do nothing`,
    values,
  );
}

async function partnerCard(sql: Sql, userId: string) {
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
    allowMature: profile.allow_mature && profile.age_confirmed,
  };
}

function sensitiveOk(me: Profile, partnerAllows: boolean): boolean {
  return me.allow_mature && me.age_confirmed && partnerAllows;
}

async function pickQuestionIds(
  sql: Sql,
  opts: { category: string; difficulty: string; count: number; sensitive: boolean },
): Promise<string[]> {
  const run = async (difficulty: string) => {
    const params: unknown[] = [];
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
    const rows = await sql.query<{ id: string }>(
      `select id from questions where ${where} order by random() limit $${params.length}`,
      params,
    );
    return rows.map((row) => row.id);
  };
  const first = await run(opts.difficulty);
  if (first.length >= Math.min(3, opts.count) || opts.difficulty === "any") return first;
  return run("any");
}

async function loadGame(sql: Sql, gameId: string, userId: string): Promise<GameRow | null> {
  const rows = await sql<GameRow>`select * from games where id = ${gameId}`;
  const game = rows[0];
  if (!game) return null;
  if (game.player_a !== userId && game.player_b !== userId) return null;
  return game;
}

async function loadQuestion(sql: Sql, id: string): Promise<QuestionRow | null> {
  const rows = await sql<QuestionRow>`select * from questions where id = ${id}`;
  return rows[0] ?? null;
}

function shapeQuestion(row: QuestionRow) {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    difficulty: row.difficulty,
    answerType: row.answer_type,
    choices: parseChoices(row.choices),
    sensitivity: row.sensitivity,
  };
}

function shapeAnswer(row: {
  id?: string;
  body: string;
  choice_index: number | null;
  prediction?: string | null;
  prediction_index?: number | null;
  skipped: boolean;
}) {
  return {
    id: row.id ?? "",
    body: row.body,
    choiceIndex: row.choice_index,
    prediction: row.prediction ?? null,
    predictionIndex: row.prediction_index ?? null,
    skipped: row.skipped,
  };
}

function toneFor(question: QuestionRow, mine: AnswerRow, theirs: AnswerRow): RevealTone {
  return revealTone({
    answerType: question.answer_type,
    aSkipped: mine.skipped,
    bSkipped: theirs.skipped,
    aChoice: mine.choice_index,
    bChoice: theirs.choice_index,
    aText: mine.body,
    bText: theirs.body,
  });
}

async function answersAt(sql: Sql, gameId: string, position: number, userId: string) {
  const rows = await sql<AnswerRow>`
    select * from answers where game_id = ${gameId} and position = ${position} and user_id = ${userId}`;
  return rows[0] ?? null;
}

async function bothIn(sql: Sql, gameId: string, position: number): Promise<boolean> {
  const rows = await sql<{ n: number }>`
    select count(*) as n from answers where game_id = ${gameId} and position = ${position}`;
  return num(rows[0]?.n) >= 2;
}

function turnOwner(game: GameRow, index: number, answered: string[]): string | null {
  if (game.mode !== "turns") return null;
  const order = index % 2 === 0 ? [game.player_a, game.player_b] : [game.player_b, game.player_a];
  return order.find((id) => !answered.includes(id)) ?? null;
}

async function buildResults(sql: Sql, game: GameRow, userId: string) {
  const ids = parseIds(game.question_ids);
  const rows = await sql<AnswerRow>`select * from answers where game_id = ${game.id}`;
  const reactions = await sql<{ position: number; user_id: string; kind: string }>`
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
      if (predictionHit(mine.prediction_index, mine.prediction ?? "", theirs.choice_index, theirs.body, question.answer_type)) {
        youCalled += 1;
      }
      if (predictionHit(theirs.prediction_index, theirs.prediction ?? "", mine.choice_index, mine.body, question.answer_type)) {
        theyCalled += 1;
      }
    }
    pairs.push({
      position,
      question: shapeQuestion(question),
      mine: shapeAnswer(mine),
      partner: shapeAnswer(theirs),
      tone,
      myReaction: reactions.find((item) => item.position === position && item.user_id === userId)?.kind ?? null,
      partnerReaction: reactions.find((item) => item.position === position && item.user_id === partnerId)?.kind ?? null,
    });
  }
  return { pairs, samePicks, choiceCompared, youCalled, theyCalled, predictionChances };
}

async function playState(sql: Sql, game: GameRow, userId: string) {
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
    partnerSeen: userId === game.player_a ? game.seen_b : game.seen_a,
  };
  const partnerView = {
    displayName: partner?.display_name ?? "Partner",
    username: partner?.username ?? "",
    avatar: partner?.avatar ?? null,
  };
  if (game.status === "cancelled") {
    return { ok: true as const, game: base, phase: "cancelled" as const, partner: partnerView, question: null, mine: null, partnerSubmitted: false, partnerAnswer: null, reactions: { mine: null, partner: null }, tone: null, saved: false, results: null };
  }
  if (game.status === "completed") {
    const results = await buildResults(sql, game, userId);
    return { ok: true as const, game: base, phase: "completed" as const, partner: partnerView, question: null, mine: null, partnerSubmitted: false, partnerAnswer: null, reactions: { mine: null, partner: null }, tone: null, saved: false, results };
  }
  const position = game.current_index;
  const questionId = ids[position];
  const question = questionId ? await loadQuestion(sql, questionId) : null;
  const mine = await answersAt(sql, game.id, position, userId);
  const revealed = await bothIn(sql, game.id, position);
  const partnerSubmitted = revealed || Boolean((await sql<{ user_id: string }>`
    select user_id from answers where game_id = ${game.id} and position = ${position} and user_id = ${partnerId}`)[0]);
  const theirs = revealed ? await answersAt(sql, game.id, position, partnerId) : null;
  const answeredIds = (await sql<{ user_id: string }>`
    select user_id from answers where game_id = ${game.id} and position = ${position}`).map((row) => row.user_id);
  const owner = turnOwner(game, position, answeredIds);
  let phase: "wait_turn" | "answer" | "wait_partner" | "reveal" = "answer";
  if (revealed && mine && theirs) phase = "reveal";
  else if (mine) phase = "wait_partner";
  else if (game.mode === "turns" && owner && owner !== userId) phase = "wait_turn";
  const showQuestion = phase !== "wait_turn" && question;
  const fav = question ? await sql<{ question_id: string }>`
    select question_id from favorite_questions where user_id = ${userId} and question_id = ${question.id}` : [];
  const reactionRows = revealed ? await sql<{ user_id: string; kind: string }>`
    select user_id, kind from reactions where game_id = ${game.id} and position = ${position}` : [];
  const tone = mine && theirs && question ? toneFor(question, mine, theirs) : null;
  return {
    ok: true as const,
    game: base,
    phase,
    partner: partnerView,
    question: showQuestion ? shapeQuestion(question) : null,
    mine: mine ? shapeAnswer(mine) : null,
    partnerSubmitted,
    partnerAnswer: theirs ? shapeAnswer(theirs) : null,
    reactions: {
      mine: reactionRows.find((row) => row.user_id === userId)?.kind ?? null,
      partner: reactionRows.find((row) => row.user_id === partnerId)?.kind ?? null,
    },
    tone,
    saved: fav.length > 0,
    results: null,
  };
}

async function streakFor(sql: Sql, userId: string): Promise<number> {
  const day = await today(sql);
  const rows = await sql<{ day: string }>`select day from activity_days where user_id = ${userId} order by day desc limit 40`;
  return streakFromDays(rows.map((row) => String(row.day).slice(0, 10)), day);
}

export const getShell = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  await ensureQuestions(sql);
  const ensured = await ensureProfile(sql, context.userId);
  if (!ensured) return fail("Account not found.");
  const unreadRows = await sql<{ n: number }>`select count(*) as n from notifications where user_id = ${context.userId} and read = false`;
  const incomingRows = await sql<{ n: number }>`select count(*) as n from connections where recipient_id = ${context.userId} and status = 'pending'`;
  const partner = await partnerCard(sql, context.userId);
  return {
    ok: true as const,
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
      notifDaily: ensured.profile.notif_daily,
    },
  };
});

export const saveProfile = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({
    username: z.string().min(1).max(24),
    displayName: z.string().min(1).max(40),
    bio: z.string().max(160).optional(),
    gender: z.enum(["woman", "man", "nonbinary", "unspecified"]).nullable().optional(),
    showGender: z.boolean().optional(),
    birthYear: z.number().int().nullable().optional(),
    ageConfirmed: z.boolean().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const ensured = await ensureProfile(sql, context.userId);
    if (!ensured) return fail("Account not found.");
    const username = cleanUsername(data.username);
    if (!validUsername(username)) return fail("Usernames are 3–20 characters: letters, numbers, underscores.");
    const taken = await sql<{ user_id: string }>`select user_id from profiles where username = ${username} and user_id <> ${context.userId}`;
    if (taken[0]) return fail("That username is taken.");
    const displayName = data.displayName.trim();
    if (!displayName) return fail("Add a display name.");
    const yearNow = Number((await today(sql)).slice(0, 4));
    const birthYear = data.birthYear ?? null;
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
    return { ok: true as const };
  });

export const saveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({
    theme: z.enum(["system", "light", "dark"]).optional(),
    allowMature: z.boolean().optional(),
    ageConfirmed: z.boolean().optional(),
    showGender: z.boolean().optional(),
    bio: z.string().max(160).optional(),
    displayName: z.string().min(1).max(40).optional(),
    avatar: z.string().max(120000).nullable().optional(),
    notifInvites: z.boolean().optional(),
    notifGames: z.boolean().optional(),
    notifTurns: z.boolean().optional(),
    notifDaily: z.boolean().optional(),
    gender: z.enum(["woman", "man", "nonbinary", "unspecified"]).nullable().optional(),
    birthYear: z.number().int().nullable().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const profile = await loadProfile(sql, context.userId);
    if (!profile) return fail("Set up your profile first.");
    if (data.avatar && !data.avatar.startsWith("data:image/")) return fail("Use a JPEG, PNG, or WebP picture.");
    const yearNow = Number((await today(sql)).slice(0, 4));
    const birthYear = data.birthYear === undefined ? profile.birth_year : data.birthYear;
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
        bio = ${data.bio === undefined ? profile.bio : data.bio.trim()},
        display_name = ${data.displayName === undefined ? profile.display_name : data.displayName.trim()},
        avatar = ${data.avatar === undefined ? profile.avatar : data.avatar},
        notif_invites = ${data.notifInvites ?? profile.notif_invites},
        notif_games = ${data.notifGames ?? profile.notif_games},
        notif_turns = ${data.notifTurns ?? profile.notif_turns},
        notif_daily = ${data.notifDaily ?? profile.notif_daily},
        gender = ${data.gender === undefined ? profile.gender : data.gender},
        birth_year = ${birthYear},
        updated_at = now()
      where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const searchPeople = createServerFn({ method: "GET" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ q: z.string().max(24) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const q = cleanUsername(data.q).replace(/[%_\\]/g, "");
    if (q.length < 2) return { ok: true as const, people: [] as Array<{ username: string; displayName: string; avatar: string | null }> };
    const like = `%${q}%`;
    const rows = await sql<{ username: string; display_name: string; avatar: string | null }>`
      select username, display_name, avatar from profiles
      where user_id <> ${context.userId} and username is not null and (username like ${like} or lower(display_name) like ${like})
      order by username asc limit 8`;
    return {
      ok: true as const,
      people: rows.map((row) => ({ username: row.username, displayName: row.display_name, avatar: row.avatar })),
    };
  });

export const sendInvite = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ username: z.string().min(2).max(24) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    await ensureProfile(sql, context.userId);
    const username = cleanUsername(data.username);
    const found = await sql<{ user_id: string }>`select user_id from profiles where username = ${username}`;
    if (!found[0]) return fail("No one uses that username.");
    const created = await openConnection(sql, context.userId, found[0].user_id);
    if (!created.ok) return created;
    const me = await loadProfile(sql, context.userId);
    await notify(sql, found[0].user_id, "invite", "Connection invite", `${me?.display_name || "Someone"} wants to play with you.`, "/invites");
    return { ok: true as const };
  });

export const inviteByEmail = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ email: z.string().email().max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    await ensureProfile(sql, context.userId);
    const email = data.email.trim().toLowerCase();
    const existingUser = await sql<{ id: string }>`select "id" from "user" where lower("email") = ${email}`;
    if (existingUser[0]) {
      const created = await openConnection(sql, context.userId, existingUser[0].id);
      if (!created.ok) return created;
      const me = await loadProfile(sql, context.userId);
      await notify(sql, existingUser[0].id, "invite", "Connection invite", `${me?.display_name || "Someone"} wants to play with you.`, "/invites");
      return { ok: true as const, held: false };
    }
    const id = randomUUID();
    try {
      await sql`insert into email_invites (id, from_user_id, email, status) values (${id}, ${context.userId}, ${email}, 'pending')`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/unique|duplicate/i.test(message)) return fail("That email invite is already waiting.");
      throw error;
    }
    return { ok: true as const, held: true };
  });

export const listInvites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const incoming = await sql<{ id: string; display_name: string; username: string | null; avatar: string | null; created_at: unknown }>`
    select c.id, p.display_name, p.username, p.avatar, c.created_at
    from connections c join profiles p on p.user_id = c.requester_id
    where c.recipient_id = ${context.userId} and c.status = 'pending'
    order by c.created_at desc`;
  const outgoing = await sql<{ id: string; display_name: string; username: string | null; created_at: unknown }>`
    select c.id, p.display_name, p.username, c.created_at
    from connections c join profiles p on p.user_id = c.recipient_id
    where c.requester_id = ${context.userId} and c.status = 'pending'
    order by c.created_at desc`;
  return {
    ok: true as const,
    incoming: incoming.map((row) => ({ id: row.id, displayName: row.display_name, username: row.username, avatar: row.avatar, createdAt: iso(row.created_at) })),
    outgoing: outgoing.map((row) => ({ id: row.id, displayName: row.display_name, username: row.username, createdAt: iso(row.created_at) })),
  };
});

export const respondInvite = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().min(8), accept: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    if (!data.accept) {
      const rows = await sql<{ requester_id: string }>`
        update connections set status = 'declined', responded_at = now()
        where id = ${data.id} and recipient_id = ${context.userId} and status = 'pending'
        returning requester_id`;
      if (!rows[0]) return fail("That invite is no longer open.");
      return { ok: true as const };
    }
    const me = await accepted(sql, context.userId);
    if (me) return fail("You already have a partner. Disconnect first.");
    const pending = await sql<Conn>`select * from connections where id = ${data.id} and recipient_id = ${context.userId} and status = 'pending'`;
    if (!pending[0]) return fail("That invite is no longer open.");
    if (await accepted(sql, pending[0].requester_id)) return fail("They already connected with someone else.");
    const updated = await sql<{ id: string }>`
      update connections set status = 'accepted', responded_at = now(), connected_at = now()
      where id = ${data.id} and recipient_id = ${context.userId} and status = 'pending'
        and not exists (
          select 1 from connections c
          where c.status = 'accepted' and c.id <> connections.id
            and (c.requester_id in (connections.requester_id, connections.recipient_id)
              or c.recipient_id in (connections.requester_id, connections.recipient_id))
        )
      returning id`;
    if (!updated[0]) return fail("Could not accept. One of you may already be connected.");
    const profile = await loadProfile(sql, context.userId);
    await notify(sql, pending[0].requester_id, "invite", "You are connected", `${profile?.display_name || "Your partner"} accepted. Your space is open.`, "/us");
    return { ok: true as const };
  });

export const disconnectPartner = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const rows = await sql<{ requester_id: string; recipient_id: string }>`
    update connections set status = 'disconnected', responded_at = now()
    where status = 'accepted' and (requester_id = ${context.userId} or recipient_id = ${context.userId})
    returning requester_id, recipient_id`;
  const row = rows[0];
  if (!row) return fail("You are not connected.");
  const other = row.requester_id === context.userId ? row.recipient_id : row.requester_id;
  const me = await loadProfile(sql, context.userId);
  await notify(sql, other, "system", "Connection ended", `${me?.display_name || "Your partner"} disconnected. Shared games stay in each of your histories.`, "/us");
  return { ok: true as const };
});

export const getHome = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  await ensureQuestions(sql);
  const ensured = await ensureProfile(sql, context.userId);
  if (!ensured) return fail("Account not found.");
  const partner = await partnerCard(sql, context.userId);
  const day = await today(sql);
  const eligible = await sql<{ id: string }>`
    select id from questions where active = true and sensitivity <> 'high' and audience <> '18plus' and answer_type <> 'dare' order by id asc`;
  let dailyQuestion: QuestionRow | null = null;
  if (eligible.length) {
    const pick = eligible[dailyIndex(day, eligible.length)]?.id;
    if (pick) {
      await sql`insert into daily_picks (day, question_id) values (${day}::date, ${pick}) on conflict (day) do nothing`;
      const picked = await sql<{ question_id: string }>`select question_id from daily_picks where day = ${day}::date`;
      dailyQuestion = picked[0] ? await loadQuestion(sql, picked[0].question_id) : null;
    }
  }
  const mineDaily = await sql<AnswerRow & { user_id: string }>`
    select * from daily_answers where user_id = ${context.userId} and day = ${day}::date`;
  let partnerDaily: AnswerRow | null = null;
  let partnerDailySubmitted = false;
  if (partner) {
    const exists = await sql<{ user_id: string }>`select user_id from daily_answers where user_id = ${partner.userId} and day = ${day}::date`;
    partnerDailySubmitted = Boolean(exists[0]);
    if (mineDaily[0] && partnerDailySubmitted) {
      const full = await sql<AnswerRow>`select * from daily_answers where user_id = ${partner.userId} and day = ${day}::date`;
      partnerDaily = full[0] ?? null;
    }
  }
  let challenge: { title: string; done: boolean } | null = null;
  if (partner) {
    const key = pairKey(context.userId, partner.userId);
    const title = CHALLENGES[dailyIndex(day, CHALLENGES.length)] ?? CHALLENGES[0];
    await sql`insert into couple_challenges (pair_key, day, title) values (${key}, ${day}::date, ${title}) on conflict (pair_key, day) do nothing`;
    const row = await sql<{ title: string; done: boolean }>`select title, done from couple_challenges where pair_key = ${key} and day = ${day}::date`;
    if (row[0]) challenge = { title: row[0].title, done: row[0].done };
  }
  const continueRows = await sql<GameRow>`
    select * from games
    where status = 'active' and (player_a = ${context.userId} or player_b = ${context.userId})
    order by updated_at desc limit 1`;
  const recent = await sql<{ id: string; title: string; body: string; href: string | null; created_at: unknown; read: boolean }>`
    select id, title, body, href, created_at, read from notifications where user_id = ${context.userId} order by created_at desc limit 4`;
  const announcement = await sql<{ title: string; body: string }>`
    select title, body from announcements where active = true order by created_at desc limit 1`;
  const dailyTone = dailyQuestion && mineDaily[0] && partnerDaily
    ? revealTone({
        answerType: dailyQuestion.answer_type,
        aSkipped: mineDaily[0].skipped,
        bSkipped: partnerDaily.skipped,
        aChoice: mineDaily[0].choice_index,
        bChoice: partnerDaily.choice_index,
        aText: mineDaily[0].body,
        bText: partnerDaily.body,
      })
    : null;
  return {
    ok: true as const,
    name: ensured.profile.display_name,
    streak: await streakFor(sql, context.userId),
    partner,
    announcement: announcement[0] ?? null,
    continueGame: continueRows[0]
      ? { id: continueRows[0].id, category: continueRows[0].category, label: categoryName(continueRows[0].category), mode: continueRows[0].mode }
      : null,
    daily: dailyQuestion
      ? {
          question: shapeQuestion(dailyQuestion),
          submitted: Boolean(mineDaily[0]),
          partnerSubmitted: partnerDailySubmitted,
          mine: mineDaily[0] ? shapeAnswer(mineDaily[0]) : null,
          partnerAnswer: partnerDaily ? shapeAnswer(partnerDaily) : null,
          tone: dailyTone,
        }
      : null,
    challenge,
    recent: recent.map((row) => ({ id: row.id, title: row.title, body: row.body, href: row.href, createdAt: iso(row.created_at), read: row.read })),
  };
});

export const submitDaily = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({
    body: z.string().max(800),
    choiceIndex: z.number().int().min(0).max(7).nullable(),
    skipped: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const day = await today(sql);
    const picked = await sql<{ question_id: string }>`select question_id from daily_picks where day = ${day}::date`;
    if (!picked[0]) return fail("Today's question is not ready.");
    const question = await loadQuestion(sql, picked[0].question_id);
    if (!question) return fail("That question is missing.");
    const existing = await sql<{ user_id: string }>`select user_id from daily_answers where user_id = ${context.userId} and day = ${day}::date`;
    if (existing[0]) return fail("You already answered today.");
    let body = data.body.trim();
    let choiceIndex = data.choiceIndex;
    if (!data.skipped && (question.answer_type === "choice" || question.answer_type === "rather")) {
      const choices = parseChoices(question.choices);
      if (choiceIndex == null || !choices[choiceIndex]) return fail("Pick one option.");
      body = choices[choiceIndex];
    } else if (!data.skipped && body.length < 1) {
      return fail("Write an answer, or skip.");
    }
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
      const other = await sql<{ user_id: string }>`select user_id from daily_answers where user_id = ${partner.userId} and day = ${day}::date`;
      await notify(
        sql,
        partner.userId,
        "daily",
        other[0] ? "Today's answers are ready" : "Daily question",
        other[0] ? "You can both see today's answers now." : `${me?.display_name || "Your partner"} answered today's question.`,
        "/daily",
      );
    }
    return { ok: true as const };
  });

export const completeChallenge = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const partner = await partnerCard(sql, context.userId);
  if (!partner) return fail("Connect a partner first.");
  const day = await today(sql);
  const key = pairKey(context.userId, partner.userId);
  const rows = await sql<{ pair_key: string }>`
    update couple_challenges set done = true, done_by = ${context.userId}
    where pair_key = ${key} and day = ${day}::date
    returning pair_key`;
  if (!rows[0]) return fail("No challenge for today yet.");
  await markDay(sql, context.userId);
  return { ok: true as const };
});

const gameInput = z.object({
  category: z.string(),
  mode: z.enum(["together", "turns"]),
  count: z.union([z.literal(5), z.literal(8), z.literal(12)]),
  difficulty: z.enum(["any", "easy", "medium", "deep"]),
});

export const createGame = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => gameInput.parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    await ensureQuestions(sql);
    if (data.category !== "mix" && !CATEGORY_IDS.includes(data.category as never)) return fail("Unknown category.");
    const me = await loadProfile(sql, context.userId);
    if (!me?.username) return fail("Finish your profile first.");
    const partner = await partnerCard(sql, context.userId);
    if (!partner) return fail("Connect a partner before you start a game.");
    const ids = await pickQuestionIds(sql, {
      category: data.category,
      difficulty: data.difficulty,
      count: data.count,
      sensitive: sensitiveOk(me, partner.allowMature),
    });
    if (ids.length < 3) return fail("Not enough questions in that set yet.");
    const id = randomUUID();
    await sql`
      insert into games (id, player_a, player_b, category, mode, status, current_index, question_ids, created_by, seen_a, seen_b)
      values (${id}, ${context.userId}, ${partner.userId}, ${data.category}, ${data.mode}, 'active', 0, ${JSON.stringify(ids)}, ${context.userId}, true, false)`;
    await notify(sql, partner.userId, "game", "New game", `${me.display_name} started ${categoryName(data.category)}.`, `/play/${id}`);
    return { ok: true as const, id };
  });

export const createFavoriteGame = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ mode: z.enum(["together", "turns"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const me = await loadProfile(sql, context.userId);
    const partner = await partnerCard(sql, context.userId);
    if (!me || !partner) return fail("Connect a partner first.");
    const favs = await sql<{ question_id: string }>`select question_id from favorite_questions where user_id = ${context.userId}`;
    if (favs.length < 3) return fail("Save at least three questions first.");
    const params: unknown[] = favs.map((row) => row.question_id);
    const placeholders = params.map((_, index) => `$${index + 1}`).join(", ");
    let text = `select id from questions where active = true and id in (${placeholders})`;
    if (!sensitiveOk(me, partner.allowMature)) text += " and sensitivity <> 'high' and audience <> '18plus'";
    text += " order by random() limit 8";
    const rows = await sql.query<{ id: string }>(text, params);
    if (rows.length < 3) return fail("Not enough active favourites to play.");
    const id = randomUUID();
    const ids = rows.map((row) => row.id);
    await sql`
      insert into games (id, player_a, player_b, category, mode, status, current_index, question_ids, created_by, seen_a, seen_b)
      values (${id}, ${context.userId}, ${partner.userId}, 'mix', ${data.mode}, 'active', 0, ${JSON.stringify(ids)}, ${context.userId}, true, false)`;
    await notify(sql, partner.userId, "game", "New game", `${me.display_name} started a round from favourite questions.`, `/play/${id}`);
    return { ok: true as const, id };
  });

export const getPlay = createServerFn({ method: "GET" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ gameId: z.string().min(8) }).parse(input))
  .handler(async ({ data, context }) => {
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

export const submitAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({
    gameId: z.string().min(8),
    position: z.number().int().min(0),
    body: z.string().max(800),
    choiceIndex: z.number().int().min(0).max(7).nullable(),
    prediction: z.string().max(200),
    predictionIndex: z.number().int().min(0).max(7).nullable(),
    skipped: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const game = await loadGame(sql, data.gameId, context.userId);
    if (!game || game.status !== "active") return fail("This game is not open.");
    if (data.position !== game.current_index) return fail("That question has moved on.");
    const ids = parseIds(game.question_ids);
    const question = await loadQuestion(sql, ids[data.position] ?? "");
    if (!question) return fail("Question missing.");
    const already = await answersAt(sql, game.id, data.position, context.userId);
    if (already) return fail("You already submitted this answer.");
    const answered = (await sql<{ user_id: string }>`
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
    } else if (body.length < 1) {
      return fail("Write an answer, or skip.");
    } else if (game.category === "mirror" && prediction.length < 1) {
      return fail("Add what you think they will say.");
    }
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
    const partnerDone = Boolean((await sql<{ user_id: string }>`
      select user_id from answers where game_id = ${game.id} and position = ${data.position} and user_id = ${partnerId}`)[0]);
    await notify(
      sql,
      partnerId,
      partnerDone ? "game" : "turn",
      partnerDone ? "Answers are ready" : game.mode === "turns" ? "Your turn" : "Partner answered",
      partnerDone
        ? "You can both reveal this question now."
        : `${me?.display_name || "Your partner"} is waiting on this question.`,
      `/play/${game.id}`,
    );
    const fresh = await loadGame(sql, game.id, context.userId);
    return fresh ? playState(sql, fresh, context.userId) : fail("Game missing.");
  });

export const reactToAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({
    gameId: z.string().min(8),
    position: z.number().int().min(0),
    kind: z.enum(["warm", "laugh", "curious", "keep"]),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const game = await loadGame(sql, data.gameId, context.userId);
    if (!game) return fail("That game is not yours.");
    if (!(await bothIn(sql, game.id, data.position))) return fail("Reactions open after you both answer.");
    await sql`
      insert into reactions (game_id, position, user_id, kind)
      values (${game.id}, ${data.position}, ${context.userId}, ${data.kind})
      on conflict (game_id, position, user_id) do update set kind = ${data.kind}`;
    return { ok: true as const };
  });

export const advanceGame = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ gameId: z.string().min(8), from: z.number().int().min(0) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const game = await loadGame(sql, data.gameId, context.userId);
    if (!game || game.status !== "active") return fail("This game is not open.");
    if (game.current_index !== data.from) {
      return playState(sql, game, context.userId);
    }
    if (!(await bothIn(sql, game.id, game.current_index))) return fail("Wait until both answers are in.");
    const total = parseIds(game.question_ids).length;
    if (game.current_index + 1 >= total) {
      await sql`update games set status = 'completed', completed_at = now(), updated_at = now() where id = ${game.id} and current_index = ${data.from}`;
    } else {
      await sql`update games set current_index = current_index + 1, updated_at = now() where id = ${game.id} and current_index = ${data.from} and status = 'active'`;
    }
    const fresh = await loadGame(sql, game.id, context.userId);
    return fresh ? playState(sql, fresh, context.userId) : fail("Game missing.");
  });

export const endGame = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ gameId: z.string().min(8) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const game = await loadGame(sql, data.gameId, context.userId);
    if (!game || game.status !== "active") return fail("This game is not open.");
    await sql`update games set status = 'completed', completed_at = now(), updated_at = now() where id = ${game.id}`;
    const fresh = await loadGame(sql, game.id, context.userId);
    return fresh ? playState(sql, fresh, context.userId) : fail("Game missing.");
  });

export const cancelGame = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ gameId: z.string().min(8) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const game = await loadGame(sql, data.gameId, context.userId);
    if (!game || game.status !== "active") return fail("This game is not open.");
    await sql`update games set status = 'cancelled', updated_at = now() where id = ${game.id}`;
    const partnerId = game.player_a === context.userId ? game.player_b : game.player_a;
    const me = await loadProfile(sql, context.userId);
    await notify(sql, partnerId, "game", "Game cancelled", `${me?.display_name || "Your partner"} cancelled this round. Unrevealed answers stay hidden.`, "/games");
    return { ok: true as const };
  });

export const toggleFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ questionId: z.string().min(2) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const existing = await sql<{ question_id: string }>`
      select question_id from favorite_questions where user_id = ${context.userId} and question_id = ${data.questionId}`;
    if (existing[0]) {
      await sql`delete from favorite_questions where user_id = ${context.userId} and question_id = ${data.questionId}`;
      return { ok: true as const, saved: false };
    }
    const question = await loadQuestion(sql, data.questionId);
    if (!question) return fail("Question not found.");
    await sql`insert into favorite_questions (user_id, question_id) values (${context.userId}, ${data.questionId})`;
    return { ok: true as const, saved: true };
  });

export const saveFavoriteAnswer = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ answerId: z.string().min(8) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const rows = await sql<AnswerRow>`select * from answers where id = ${data.answerId}`;
    const answer = rows[0];
    if (!answer) return fail("Answer not found.");
    const game = await loadGame(sql, answer.game_id, context.userId);
    if (!game) return fail("That answer is not in your games.");
    if (!(await bothIn(sql, answer.game_id, answer.position))) return fail("You can save an answer only after it is revealed.");
    await sql`
      insert into favorite_answers (user_id, answer_id) values (${context.userId}, ${data.answerId})
      on conflict do nothing`;
    return { ok: true as const };
  });

export const listFavorites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const questions = await sql<QuestionRow>`
    select q.* from favorite_questions f join questions q on q.id = f.question_id
    where f.user_id = ${context.userId} order by f.created_at desc`;
  const links = await sql<{ answer_id: string }>`
    select answer_id from favorite_answers where user_id = ${context.userId} order by created_at desc`;
  const answers: Array<{ id: string; body: string; question: string; author: string }> = [];
  for (const link of links) {
    const rows = await sql<AnswerRow>`select * from answers where id = ${link.answer_id}`;
    const answer = rows[0];
    if (!answer) continue;
    const game = await loadGame(sql, answer.game_id, context.userId);
    if (!game || !(await bothIn(sql, answer.game_id, answer.position))) continue;
    const questionId = parseIds(game.question_ids)[answer.position];
    const question = questionId ? await loadQuestion(sql, questionId) : null;
    const author = await loadProfile(sql, answer.user_id);
    answers.push({
      id: answer.id,
      body: answer.skipped ? "Skipped" : answer.body,
      question: question?.text ?? "",
      author: author?.display_name ?? "Partner",
    });
  }
  return { ok: true as const, questions: questions.map(shapeQuestion), answers };
});

export const listNotes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const partner = await partnerCard(sql, context.userId);
  if (!partner) return { ok: true as const, partner: null, notes: [] as Array<{ id: string; body: string; mine: boolean; createdAt: string | null }> };
  const rows = await sql<{ id: string; author_id: string; body: string; created_at: unknown }>`
    select id, author_id, body, created_at from notes
    where (author_id = ${context.userId} and partner_id = ${partner.userId})
       or (author_id = ${partner.userId} and partner_id = ${context.userId})
    order by created_at desc limit 80`;
  return {
    ok: true as const,
    partner: { displayName: partner.displayName },
    notes: rows.map((row) => ({ id: row.id, body: row.body, mine: row.author_id === context.userId, createdAt: iso(row.created_at) })),
  };
});

export const addNote = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ body: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const partner = await partnerCard(sql, context.userId);
    if (!partner) return fail("Connect a partner before leaving notes.");
    const body = data.body.trim();
    if (!body) return fail("Write something first.");
    await sql`insert into notes (id, author_id, partner_id, body) values (${randomUUID()}, ${context.userId}, ${partner.userId}, ${body})`;
    const me = await loadProfile(sql, context.userId);
    await notify(sql, partner.userId, "system", "A new note", `${me?.display_name || "Your partner"} left a note in your space.`, "/notes");
    return { ok: true as const };
  });

export const deleteNote = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().min(8) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    const rows = await sql<{ id: string }>`delete from notes where id = ${data.id} and author_id = ${context.userId} returning id`;
    if (!rows[0]) return fail("You can only remove notes you wrote.");
    return { ok: true as const };
  });

export const listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const rows = await sql<{ id: string; title: string; body: string; href: string | null; read: boolean; created_at: unknown; kind: string }>`
    select id, title, body, href, read, created_at, kind from notifications
    where user_id = ${context.userId} order by created_at desc limit 40`;
  return {
    ok: true as const,
    items: rows.map((row) => ({ id: row.id, title: row.title, body: row.body, href: row.href, read: row.read, kind: row.kind, createdAt: iso(row.created_at) })),
  };
});

export const markNotifications = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    if (data.id) {
      await sql`update notifications set read = true where id = ${data.id} and user_id = ${context.userId}`;
    } else {
      await sql`update notifications set read = true where user_id = ${context.userId} and read = false`;
    }
    return { ok: true as const };
  });

export const getUs = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const partner = await partnerCard(sql, context.userId);
  const games = await sql<{ id: string; category: string; mode: string; status: string; completed_at: unknown; question_ids: string }>`
    select id, category, mode, status, completed_at, question_ids from games
    where status = 'completed' and (player_a = ${context.userId} or player_b = ${context.userId})
    order by completed_at desc limit 12`;
  const notes = partner
    ? await sql<{ id: string; body: string; author_id: string }>`
        select id, body, author_id from notes
        where (author_id = ${context.userId} and partner_id = ${partner.userId})
           or (author_id = ${partner.userId} and partner_id = ${context.userId})
        order by created_at desc limit 3`
    : [];
  return {
    ok: true as const,
    partner,
    memories: games.map((game) => ({
      id: game.id,
      label: categoryName(game.category),
      mode: game.mode,
      questions: parseIds(game.question_ids).length,
      completedAt: iso(game.completed_at),
    })),
    notes: notes.map((note) => ({ id: note.id, body: note.body, mine: note.author_id === context.userId })),
  };
});

export const getProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  const partner = await partnerCard(sql, context.userId);
  const answerCount = await sql<{ n: number }>`select count(*) as n from answers where user_id = ${context.userId} and skipped = false`;
  const games = await sql<{ id: string; category: string; status: string; question_ids: string; player_a: string; player_b: string; completed_at: unknown }>`
    select id, category, status, question_ids, player_a, player_b, completed_at from games
    where player_a = ${context.userId} or player_b = ${context.userId}`;
  const completed = games.filter((game) => game.status === "completed");
  const noteCount = await sql<{ n: number }>`select count(*) as n from notes where author_id = ${context.userId}`;
  const categories = new Set(games.map((game) => game.category).filter((id) => id !== "mix"));
  let samePicks = 0;
  let choiceCompared = 0;
  let differentPicks = 0;
  let youCalled = 0;
  let predictionChances = 0;
  const byCategory: Record<string, number> = {};
  if (completed.length) {
    const ids = completed.map((game) => game.id);
    const placeholders = ids.map((_, index) => `$${index + 1}`).join(", ");
    const answerRows = await sql.query<AnswerRow>(
      `select * from answers where game_id in (${placeholders})`,
      ids,
    );
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
          if (predictionHit(mine.prediction_index, mine.prediction ?? "", theirs.choice_index, theirs.body, question.answer_type)) {
            youCalled += 1;
          }
        }
      }
    }
  }
  const favourite = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const streak = await streakFor(sql, context.userId);
  const dayRows = await sql<{ day: string }>`
    select day from activity_days where user_id = ${context.userId} order by day desc limit 120`;
  const activeDays = dayRows.map((row) => String(row.day).slice(0, 10));
  const stats = {
    gamesCompleted: completed.length,
    answers: num(answerCount[0]?.n),
    streak,
    notes: num(noteCount[0]?.n),
    connected: Boolean(partner),
    categoriesPlayed: categories.size,
    predictionsCorrect: youCalled,
  };
  const chart = ["know", "mirror", "love", "deep", "fun", "rather", "spark", "mix"].map((id) => ({
    id,
    name: shortCategory(id),
    count: byCategory[id] ?? 0,
  }));
  return {
    ok: true as const,
    stats,
    samePicks,
    differentPicks,
    choiceCompared,
    predictionChances,
    favourite: favourite ? categoryName(favourite[0]) : null,
    badges: achievementList(stats),
    chart,
    activeDays,
    recent: completed.slice(0, 6).map((game) => ({
      id: game.id,
      label: categoryName(game.category),
      completedAt: iso(game.completed_at),
    })),
  };
});

export const reportQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ questionId: z.string().min(2), reason: z.string().min(3).max(280) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    await sql`insert into reports (id, reporter_id, question_id, reason) values (${randomUUID()}, ${context.userId}, ${data.questionId}, ${data.reason.trim()})`;
    return { ok: true as const };
  });

export const reportClientError = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ message: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    await sql`insert into error_logs (id, user_id, message) values (${randomUUID()}, ${context.userId}, ${data.message.slice(0, 500)})`;
    return { ok: true as const };
  });

export const requestReset = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ email: z.string().email().max(120) }).parse(input))
  .handler(async ({ data }) => {
    const sql = await db();
    const email = data.email.trim().toLowerCase();
    const users = await sql<{ id: string }>`select "id" from "user" where lower("email") = ${email}`;
    const generic = "If that email has a password account, you can set a new one.";
    if (!users[0]) return { ok: true as const, previewCode: null as string | null, message: generic };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = createHash("sha256").update(`${email}:${code}`).digest("hex");
    await sql`insert into password_resets (id, email, code_hash, expires_at) values (${randomUUID()}, ${email}, ${codeHash}, now() + interval '15 minutes')`;
    const preview = !process.env.DATABASE_URL;
    return {
      ok: true as const,
      previewCode: preview ? code : null,
      message: preview
        ? "This preview cannot send email. Use the one-time code below. It expires in 15 minutes."
        : "Email delivery is not connected on this build. If you still know the password, change it in Settings. Google and X sign-in stay available.",
    };
  });

export const confirmReset = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    email: z.string().email().max(120),
    code: z.string().min(6).max(8),
    password: z.string().min(8).max(72),
  }).parse(input))
  .handler(async ({ data }) => {
    const sql = await db();
    const email = data.email.trim().toLowerCase();
    const codeHash = createHash("sha256").update(`${email}:${data.code.trim()}`).digest("hex");
    const rows = await sql<{ id: string }>`
      select id from password_resets
      where email = ${email} and code_hash = ${codeHash} and used = false and expires_at > now()
      order by expires_at desc limit 1`;
    if (!rows[0]) return fail("That code is wrong or expired.");
    const user = await sql<{ id: string }>`select "id" from "user" where lower("email") = ${email}`;
    if (!user[0]) return fail("Account not found.");
    const { hashPassword } = await import("better-auth/crypto");
    const hashed = await hashPassword(data.password);
    const updated = await sql<{ id: string }>`
      update "account" set "password" = ${hashed}, "updatedAt" = now()
      where "userId" = ${user[0].id} and "providerId" = 'credential'
      returning "id"`;
    if (!updated[0]) return fail("This account uses Google or X. Sign in that way instead.");
    await sql`update password_resets set used = true where id = ${rows[0].id}`;
    return { ok: true as const };
  });

export const deleteAccount = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ phrase: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    if (data.phrase.trim() !== "DELETE") return fail("Type DELETE to confirm.");
    const sql = await db();
    const partner = await partnerCard(sql, context.userId);
    if (partner) {
      const me = await loadProfile(sql, context.userId);
      await notify(sql, partner.userId, "system", "Partner account deleted", `${me?.display_name || "Your partner"} deleted their account. Shared games were removed.`, "/us");
    }
    const gameIds = await sql<{ id: string }>`select id from games where player_a = ${context.userId} or player_b = ${context.userId}`;
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
    return { ok: true as const };
  });

async function adminGate(sql: Sql, userId: string) {
  const profile = await loadProfile(sql, userId);
  return profile?.role === "admin";
}

export const claimStudio = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ key: z.string().max(40) }).parse(input))
  .handler(async ({ data, context }) => {
    if (data.key.trim() !== STUDIO_KEY) return fail("That studio key is not valid.");
    const sql = await db();
    await ensureProfile(sql, context.userId);
    await sql`update profiles set role = 'admin', updated_at = now() where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
  const sql = await db();
  if (!(await adminGate(sql, context.userId))) return fail("Studio access only.");
  const users = await sql<{ n: number }>`select count(*) as n from profiles`;
  const games = await sql<{ n: number }>`select count(*) as n from games`;
  const answers = await sql<{ n: number }>`select count(*) as n from answers`;
  const openReports = await sql<{ n: number }>`select count(*) as n from reports where status = 'open'`;
  const questions = await sql<QuestionRow>`select * from questions order by created_at desc limit 30`;
  const reports = await sql<{ id: string; question_id: string | null; reason: string; status: string; created_at: unknown }>`
    select id, question_id, reason, status, created_at from reports order by created_at desc limit 20`;
  const errors = await sql<{ id: string; message: string; created_at: unknown }>`
    select id, message, created_at from error_logs order by created_at desc limit 15`;
  const announcements = await sql<{ id: string; title: string; body: string; active: boolean }>`
    select id, title, body, active from announcements order by created_at desc limit 8`;
  return {
    ok: true as const,
    counts: {
      people: num(users[0]?.n),
      games: num(games[0]?.n),
      answers: num(answers[0]?.n),
      reports: num(openReports[0]?.n),
    },
    questions: questions.map((row) => ({ ...shapeQuestion(row), active: row.active, audience: row.audience })),
    reports: reports.map((row) => ({ id: row.id, questionId: row.question_id, reason: row.reason, status: row.status, createdAt: iso(row.created_at) })),
    errors: errors.map((row) => ({ id: row.id, message: row.message, createdAt: iso(row.created_at) })),
    announcements: announcements,
  };
});

export const adminSaveQuestion = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({
    id: z.string().max(40).optional(),
    text: z.string().min(8).max(400),
    category: z.string(),
    difficulty: z.enum(["easy", "medium", "deep"]),
    answerType: z.enum(["short", "long", "choice", "rather", "dare"]),
    choices: z.array(z.string().min(1).max(80)).max(6),
    sensitivity: z.enum(["low", "medium", "high"]),
    audience: z.enum(["all", "18plus"]),
    active: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    if (!(await adminGate(sql, context.userId))) return fail("Studio access only.");
    if (!CATEGORY_IDS.includes(data.category as never)) return fail("Unknown category.");
    if ((data.answerType === "choice" || data.answerType === "rather") && data.choices.length < 2) {
      return fail("Add at least two choices.");
    }
    if (data.answerType === "rather" && data.choices.length !== 2) return fail("Would You Rather needs exactly two choices.");
    const choices = JSON.stringify(data.answerType === "choice" || data.answerType === "rather" ? data.choices : []);
    if (data.id) {
      const rows = await sql<{ id: string }>`
        update questions set text = ${data.text.trim()}, category = ${data.category}, difficulty = ${data.difficulty},
          answer_type = ${data.answerType}, choices = ${choices}, sensitivity = ${data.sensitivity},
          audience = ${data.audience}, active = ${data.active}
        where id = ${data.id} returning id`;
      if (!rows[0]) return fail("Question not found.");
      return { ok: true as const, id: data.id };
    }
    const id = `c${randomUUID().slice(0, 8)}`;
    await sql`
      insert into questions (id, text, category, difficulty, answer_type, choices, sensitivity, audience, active)
      values (${id}, ${data.text.trim()}, ${data.category}, ${data.difficulty}, ${data.answerType}, ${choices}, ${data.sensitivity}, ${data.audience}, ${data.active})`;
    return { ok: true as const, id };
  });

export const adminSetActive = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string(), active: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    if (!(await adminGate(sql, context.userId))) return fail("Studio access only.");
    await sql`update questions set active = ${data.active} where id = ${data.id}`;
    return { ok: true as const };
  });

export const adminSetReport = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ id: z.string(), status: z.enum(["open", "reviewed", "hidden"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    if (!(await adminGate(sql, context.userId))) return fail("Studio access only.");
    const report = await sql<{ question_id: string | null }>`select question_id from reports where id = ${data.id}`;
    await sql`update reports set status = ${data.status} where id = ${data.id}`;
    if (data.status === "hidden" && report[0]?.question_id) {
      await sql`update questions set active = false where id = ${report[0].question_id}`;
    }
    return { ok: true as const };
  });

export const adminAnnounce = createServerFn({ method: "POST" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ title: z.string().min(2).max(80), body: z.string().min(2).max(280) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    if (!(await adminGate(sql, context.userId))) return fail("Studio access only.");
    await sql`insert into announcements (id, title, body, active) values (${randomUUID()}, ${data.title.trim()}, ${data.body.trim()}, true)`;
    return { ok: true as const };
  });

export const adminSearchQuestions = createServerFn({ method: "GET" }).middleware([authMiddleware])
  .validator((input: unknown) => z.object({ q: z.string().max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await db();
    if (!(await adminGate(sql, context.userId))) return fail("Studio access only.");
    const q = data.q.trim().replace(/[%_\\]/g, "");
    const like = `%${q}%`;
    const rows = q
      ? await sql<QuestionRow>`select * from questions where text ilike ${like} order by id asc limit 40`
      : await sql<QuestionRow>`select * from questions order by created_at desc limit 30`;
    return { ok: true as const, questions: rows.map((row) => ({ ...shapeQuestion(row), active: row.active, audience: row.audience })) };
  });
