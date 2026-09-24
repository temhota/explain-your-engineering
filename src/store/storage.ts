import { z } from "zod";
import type { PersistStorage, StateStorage } from "zustand/middleware";
import { experienceSchema, sessionSchema } from "@/lib/domain";
export const savedSchema = z.object({
  session: sessionSchema.nullable(),
  history: z.array(sessionSchema),
  experiences: z.array(experienceSchema),
});
export type SavedState = z.infer<typeof savedSchema>;
export function guardedStorage(
  source: StateStorage,
  report: (message: string) => void,
): PersistStorage<SavedState> {
  let locked = false;
  return {
    getItem: async (name) => {
      try {
        const raw = await source.getItem(name);
        if (raw === null) return null;
        const envelope = z
          .object({ version: z.literal(1), state: savedSchema })
          .parse(JSON.parse(raw));
        return envelope;
      } catch {
        locked = true;
        report(
          "Saved browser data could not be restored. Existing data has not been overwritten. Clear saved data to start again.",
        );
        return null;
      }
    },
    setItem: async (name, value) => {
      if (locked) return;
      try {
        await source.setItem(name, JSON.stringify(value));
      } catch {
        report(
          "Your latest changes could not be saved in this browser. Keep this tab open and free some storage.",
        );
      }
    },
    removeItem: async (name) => {
      await source.removeItem(name);
      locked = false;
    },
  };
}
export const browserStorage: StateStorage = {
  getItem: (key) =>
    typeof window === "undefined" ? null : window.localStorage.getItem(key),
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};
