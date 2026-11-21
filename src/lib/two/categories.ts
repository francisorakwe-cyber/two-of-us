export const CATEGORIES = [
  {
    id: "know",
    name: "Getting to Know You",
    blurb: "Childhood, habits, and the small things that stayed.",
  },
  {
    id: "mirror",
    name: "How Well Do You Know Me?",
    blurb: "Answer for yourself, then guess what they will say.",
  },
  {
    id: "love",
    name: "Love and Romance",
    blurb: "Affection, gestures, and the memories you keep.",
  },
  {
    id: "deep",
    name: "Deep Conversations",
    blurb: "Trust, plans, and what you actually need.",
  },
  {
    id: "fun",
    name: "Fun and Crazy",
    blurb: "Odd questions with no serious point except the laugh.",
  },
  {
    id: "rather",
    name: "Would You Rather?",
    blurb: "Two choices. Pick one and see if they do too.",
  },
  {
    id: "spark",
    name: "Truth or Dare",
    blurb: "Playful prompts. Skip anything. Nothing is owed.",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((item) => item.id);

export function categoryName(id: string): string {
  if (id === "mix") return "Random mix";
  return CATEGORIES.find((item) => item.id === id)?.name ?? "Game";
}

export function shortCategory(id: string): string {
  const names: Record<string, string> = {
    know: "Know",
    mirror: "Mirror",
    love: "Love",
    deep: "Deep",
    fun: "Fun",
    rather: "Rather",
    spark: "Spark",
    mix: "Mix",
  };
  return names[id] ?? "Game";
}
