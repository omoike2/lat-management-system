export type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

export const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export type DayLabel = (typeof DAY_LABELS)[number];

export const LEVELS = [100, 200, 300, 400, 500] as const;
export type Level = (typeof LEVELS)[number];

export type ChangeType = "venue" | "time" | "cancellation";
