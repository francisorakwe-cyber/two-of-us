import assert from "node:assert/strict";
import test from "node:test";
import { achievementList, predictionHit, revealTone, shiftDay, streakFromDays } from "./logic.ts";

test("choice match and difference stay friendly", () => {
  const match = revealTone({
    answerType: "choice",
    aSkipped: false,
    bSkipped: false,
    aChoice: 1,
    bChoice: 1,
    aText: "Quiet",
    bText: "Quiet",
  });
  assert.equal(match.tone, "match");
  const diff = revealTone({
    answerType: "rather",
    aSkipped: false,
    bSkipped: false,
    aChoice: 0,
    bChoice: 1,
    aText: "A",
    bText: "B",
  });
  assert.equal(diff.tone, "different");
  assert.match(diff.detail, /not a problem/i);
});

test("long answers are not scored", () => {
  const tone = revealTone({
    answerType: "long",
    aSkipped: false,
    bSkipped: false,
    aChoice: null,
    bChoice: null,
    aText: "same words",
    bText: "same words",
  });
  assert.equal(tone.tone, "open");
});

test("prediction hits only exact choice or text", () => {
  assert.equal(predictionHit(2, "", 2, "Hot", "choice"), true);
  assert.equal(predictionHit(1, "", 2, "Hot", "choice"), false);
  assert.equal(predictionHit(null, "  Lagos ", null, "lagos", "short"), true);
});

test("streak rests after a missed day and keeps yesterday open", () => {
  assert.equal(streakFromDays(["2026-11-19", "2026-11-20"], "2026-11-21"), 2);
  assert.equal(streakFromDays(["2026-11-18", "2026-11-19"], "2026-11-21"), 0);
  assert.equal(streakFromDays(["2026-11-20", "2026-11-21"], "2026-11-21"), 2);
  assert.equal(shiftDay("2026-03-01", -1), "2026-02-28");
});

test("badges do not invent a compatibility score", () => {
  const badges = achievementList({
    gamesCompleted: 0,
    answers: 1,
    streak: 0,
    notes: 0,
    connected: false,
    categoriesPlayed: 1,
    predictionsCorrect: 0,
  });
  assert.equal(badges.find((badge) => badge.id === "first-answer")?.earned, true);
  assert.equal(badges.some((badge) => /compatib/i.test(badge.title + badge.detail)), false);
});
