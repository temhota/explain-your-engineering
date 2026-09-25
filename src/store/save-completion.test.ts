import { afterEach, expect, it, vi } from "vitest";
import { createTrainerStore } from "./trainer";
afterEach(() => vi.unstubAllGlobals());
it("does not acknowledge saving a story until its browser write finishes", async () => {
  const jobs: (() => void)[] = [];
  vi.stubGlobal("navigator", {
    locks: {
      request: (_name: string, write: () => void) =>
        new Promise<void>((resolve) =>
          jobs.push(() => {
            write();
            resolve();
          }),
        ),
    },
  });
  const store = createTrainerStore();
  await store.persist.rehydrate();
  jobs.splice(0).forEach((run) => run());
  let finished = false;
  const result = Promise.resolve(
    store.getState().saveExperience({
      id: "one",
      title: "Search",
      context: "",
      role: "",
      constraints: "",
      decision: "Derive values",
      result: "",
    }),
  ).then(() => {
    finished = true;
  });
  await Promise.resolve();
  expect(finished).toBe(false);
  jobs.splice(0).forEach((run) => run());
  await result;
  expect(
    JSON.parse(localStorage.getItem("eye-practice")!).state.experiences[0]
      .title,
  ).toBe("Search");
});
it("allows retrying a story after a transient storage failure", async () => {
  let raw: string | null = null;
  let fail = false;
  const source = {
    getItem: () => raw,
    setItem: (_key: string, value: string) => {
      if (fail) throw new Error("quota");
      raw = value;
    },
    removeItem: () => {
      raw = null;
    },
  };
  const store = createTrainerStore(source);
  await store.persist.rehydrate();
  const card = {
    id: "one",
    title: "Search",
    context: "",
    role: "",
    constraints: "",
    decision: "Derive values",
    result: "",
  };
  fail = true;
  await expect(store.getState().saveExperience(card)).rejects.toThrow();
  fail = false;
  await expect(store.getState().saveExperience(card)).resolves.toBeUndefined();
  expect(store.getState().storageError).toBeNull();
});
