export type Tone = "match" | "near" | "different" | "open";

export type RevealInput = {
  answerType: string;
  aSkipped: boolean;
  bSkipped: boolean;
  aChoice: number | null;
  bChoice: number | null;
  aText: string;
  bText: string;
};

export type RevealTone = {
  tone: Tone;
  title: string;
  detail: string;
};

export function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function revealTone(input: RevealInput): RevealTone {
  if (input.aSkipped || input.bSkipped) {
    return {
      tone: "open",
      title: "One of you skipped this one.",
      detail: "Skipping is part of the game. Nothing is owed.",
    };
  }
  if (input.answerType === "long" || input.answerType === "dare") {
    return {
      tone: "open",
      title: "Two answers, side by side.",
      detail: "Open answers are not a score. Read them, then ask one more thing.",
    };
  }
  if (input.answerType === "choice" || input.answerType === "rather") {
    if (input.aChoice != null && input.aChoice === input.bChoice) {
      return {
        tone: "match",
        title: "You two are thinking alike!",
        detail: "Same pick. Ask what made it obvious.",
      };
    }
    return {
      tone: "different",
      title: "Interesting. You chose differently.",
      detail: "Different picks are a conversation, not a problem.",
    };
  }
  const a = norm(input.aText);
  const b = norm(input.bText);
  if (a && a === b) {
    return {
      tone: "match",
      title: "You two are thinking alike!",
      detail: "Almost the same words.",
    };
  }
  if (a && b && (a.includes(b) || b.includes(a)) && Math.min(a.length, b.length) >= 4) {
    return {
      tone: "near",
      title: "You're closer than you think.",
      detail: "Not identical, but the idea overlaps.",
    };
  }
  return {
    tone: "open",
    title: "Two ways of seeing it.",
    detail: "Different preferences are not a verdict on the two of you.",
  };
}

export function predictionHit(
  predictionIndex: number | null,
  predictionText: string,
  answerIndex: number | null,
  answerText: string,
  answerType: string,
): boolean {
  if (answerType === "choice" || answerType === "rather") {
    return predictionIndex != null && predictionIndex === answerIndex;
  }
  const guess = norm(predictionText);
  const actual = norm(answerText);
  return guess.length > 0 && guess === actual;
}

/** Consecutive days ending today, or yesterday if today is still open. */
export function streakFromDays(days: string[], today: string): number {
  const set = new Set(days);
  const y = shiftDay(today, -1);
  let cursor = set.has(today) ? today : set.has(y) ? y : "";
  if (!cursor) return 0;
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}

export function shiftDay(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export type StatsSnap = {
  gamesCompleted: number;
  answers: number;
  streak: number;
  notes: number;
  connected: boolean;
  categoriesPlayed: number;
  predictionsCorrect: number;
};

export type Badge = {
  id: string;
  title: string;
  detail: string;
  earned: boolean;
};

export function achievementList(stats: StatsSnap): Badge[] {
  const items: Badge[] = [
    {
      id: "first-answer",
      title: "You started",
      detail: "Answer one question.",
      earned: stats.answers >= 1,
    },
    {
      id: "ten",
      title: "Ten questions in",
      detail: "Answer ten questions.",
      earned: stats.answers >= 10,
    },
    {
      id: "fifty",
      title: "Still curious",
      detail: "Answer fifty questions.",
      earned: stats.answers >= 50,
    },
    {
      id: "game",
      title: "A full round",
      detail: "Finish a game together.",
      earned: stats.gamesCompleted >= 1,
    },
    {
      id: "five-games",
      title: "A habit of asking",
      detail: "Finish five games.",
      earned: stats.gamesCompleted >= 5,
    },
    {
      id: "streak-3",
      title: "Three days running",
      detail: "Play on three days in a row.",
      earned: stats.streak >= 3,
    },
    {
      id: "streak-7",
      title: "A week of questions",
      detail: "Play on seven days in a row.",
      earned: stats.streak >= 7,
    },
    {
      id: "connected",
      title: "A partner in the room",
      detail: "Accept a connection.",
      earned: stats.connected,
    },
    {
      id: "note",
      title: "A note, kept",
      detail: "Leave a private note.",
      earned: stats.notes >= 1,
    },
    {
      id: "called",
      title: "Paying attention",
      detail: "Predict five answers correctly.",
      earned: stats.predictionsCorrect >= 5,
    },
    {
      id: "deck",
      title: "The whole deck",
      detail: "Play every category at least once.",
      earned: stats.categoriesPlayed >= 7,
    },
  ];
  return items;
}

export const CHALLENGES = [
  "Cook the same simple meal while you are apart, then compare notes.",
  "Each of you send a photo of the sky where you are.",
  "Tell one story from this week that you have not told yet.",
  "Take a ten-minute walk and describe one thing you noticed.",
  "Name one thing the other person did that you appreciated.",
  "Plan one small thing to do together this weekend.",
  "Swap a song that fits today and say why you chose it.",
  "Add one more sentence to an answer from your last game.",
  "Name three ordinary things that felt good this week.",
  "Send a voice note instead of a text, if you both want to.",
  "Tidy one small corner and tell each other what you found.",
  "Describe the next meal you want to share.",
  "Ask a question that is not in the app.",
  "Spend ten unplanned minutes together, with nothing to finish.",
] as const;

export function dailyIndex(day: string, size: number): number {
  if (size <= 0) return 0;
  let hash = 0;
  for (const char of day) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return hash % size;
}

export function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
