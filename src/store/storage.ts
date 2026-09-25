import { z } from "zod";
import type { PersistStorage } from "zustand/middleware";
import { experienceSchema, sessionSchema } from "@/lib/domain";
export const savedSchema = z.object({
  session: sessionSchema.nullable(),
  history: z.array(sessionSchema),
  experiences: z.array(experienceSchema),
});
export type SavedState = z.infer<typeof savedSchema>;
export interface StorageSource {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}
export function guardedStorage(
  source: StorageSource,
  report: (message: string) => void,
): PersistStorage<SavedState> & { flush: () => Promise<void> } {
  let pending = Promise.resolve();
  let lastFailure: string | null = null;
  const failed = (message: string) => {
    lastFailure = message;
    report(message);
  };
  let locked = false;
  let baseline: string | null = null;
  let loaded = false;
  return {
    flush: async () => {
      await pending;
      if (lastFailure) throw new Error(lastFailure);
    },
    getItem: (name) => {
      try {
        const raw = source.getItem(name);
        baseline = raw;
        loaded = true;
        if (raw === null) return null;
        const envelope = z
          .object({ version: z.literal(1), state: savedSchema })
          .parse(JSON.parse(raw));
        return envelope;
      } catch {
        locked = true;
        failed(
          "Saved browser data could not be restored. Existing data has not been overwritten. Clear saved data to start again.",
        );
        return null;
      }
    },
    setItem: (name, value) => {
      const write = () => {
        if (locked || !loaded) return;
        try {
          if (source.getItem(name) !== baseline) {
            locked = true;
            failed(
              "Saved data changed in another tab. Saving is paused in this tab to protect those changes. Copy your unsaved text before reloading; practise in one tab at a time.",
            );
            return;
          }
          const serialized = JSON.stringify(value);
          source.setItem(name, serialized);
          baseline = serialized;
          lastFailure = null;
        } catch {
          failed(
            "Your latest changes could not be saved in this browser. Keep this tab open and free some storage.",
          );
        }
      };
      // Web Locks serialize compare-and-write across this app's browser tabs.
      if (
        source === browserStorage &&
        typeof navigator !== "undefined" &&
        navigator.locks
      ) {
        pending = navigator.locks
          .request(name, write)
          .catch(() =>
            failed(
              "Browser storage is unavailable. Keep this tab open to retain your changes.",
            ),
          );
        return pending;
      }
      write();
    },
    removeItem: async (name) => {
      source.removeItem(name);
      baseline = null;
      loaded = true;
      locked = false;
      lastFailure = null;
    },
  };
}
export const browserStorage: StorageSource = {
  getItem: (key) =>
    typeof window === "undefined" ? null : window.localStorage.getItem(key),
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};
