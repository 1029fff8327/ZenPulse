export type Meditation = {
  id: string;
  title: string;
  minutes: number;
  isPremium: boolean;
  imageUrl: string;
};

export const MEDITATIONS: Meditation[] = [
  {
    id: "morning-calm",
    title: "Morning Calm Reset",
    minutes: 7,
    isPremium: false,
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "deep-breath",
    title: "Deep Breathing Ritual",
    minutes: 10,
    isPremium: false,
    imageUrl:
      "https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sleep-drift",
    title: "Sleep Drift (Body Scan)",
    minutes: 12,
    isPremium: true,
    imageUrl:
      "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "focus-flow",
    title: "Focus Flow",
    minutes: 8,
    isPremium: true,
    imageUrl:
      "https://images.unsplash.com/photo-1522098543979-ffc7f79f5f14?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "anxiety-release",
    title: "Anxiety Release",
    minutes: 9,
    isPremium: true,
    imageUrl:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  },
];