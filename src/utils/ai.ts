export type Mood = "good" | "neutral" | "sad";

export function buildPrompt(mood: Mood): string {
  const moodLabel =
    mood === "good" ? "🙂 good" : mood === "neutral" ? "😐 neutral" : "😔 sad";

  return [
    "SYSTEM: You are ZenPulse — a calm, premium meditation coach.",
    "TASK: Generate a short daily affirmation for the user.",
    "RULES:",
    "- Output 1–2 sentences only.",
    "- Tone: warm, grounded, non-clinical, no medical claims.",
    "- Avoid emojis in the output.",
    "- Make it feel premium and calming.",
    `CONTEXT: Mood = ${moodLabel}`,
    "OUTPUT: Just the affirmation text.",
  ].join("\n");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function detectMoodFromPrompt(prompt: string): Mood {
  const p = prompt.toLowerCase();
  if (p.includes("sad") || p.includes("😔")) return "sad";
  if (p.includes("neutral") || p.includes("😐")) return "neutral";
  return "good";
}

/**
 * Realistic mock of an LLM call:
 * - variable latency
 * - mood-aware output
 * - 1–2 sentences
 */
export async function mockLLM(prompt: string): Promise<string> {
  const mood = detectMoodFromPrompt(prompt);
  await sleep(700 + Math.floor(Math.random() * 700)); // 700–1400ms

  const good = [
    "Today you already have enough strength to move gently and steadily toward what matters.",
    "Let your breath be a quiet reminder: you can take this day one calm step at a time.",
    "Keep it simple today — show up with kindness, and the rest will follow naturally.",
  ];

  const neutral = [
    "If you feel in-between, that’s okay — choose one small, steady action and let it be enough.",
    "Take a slow breath and soften your shoulders; you don’t need to rush this moment.",
    "Meet the day with gentle attention — progress can be quiet and still real.",
  ];

  const sad = [
    "Be tender with yourself today; even a small breath is a real step forward.",
    "You don’t have to carry everything at once — let this moment hold you for a second.",
    "Inhale patience, exhale pressure; you can move through today with softness and care.",
  ];

  // sometimes return 2 sentences (still within 1–2)
  const twoSentencesChance = Math.random() < 0.35;

  if (mood === "sad") {
    const a = pick(sad);
    if (!twoSentencesChance) return a;
    const b = pick(neutral);
    return `${a} ${b}`;
  }

  if (mood === "neutral") {
    const a = pick(neutral);
    if (!twoSentencesChance) return a;
    const b = pick(good);
    return `${a} ${b}`;
  }

  const a = pick(good);
  if (!twoSentencesChance) return a;
  const b = pick(neutral);
  return `${a} ${b}`;
}