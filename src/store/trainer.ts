import { createStore } from "zustand/vanilla";
import {
  experienceSchema,
  type Experience,
  type Context,
  type Feedback,
  type Operation,
  type Session,
} from "@/lib/domain";
import { persist } from "zustand/middleware";
import { browserStorage, guardedStorage, type StorageSource } from "./storage";

export interface TrainerState {
  hydrated: boolean;
  storageError: string | null;
  experiences: Experience[];
  saveExperience: (card: Experience) => void;
  deleteExperience: (id: string) => void;
  clearSavedData: () => Promise<void>;
  session: Session | null;
  history: Session[];
  request: { token: string; operation: Operation } | null;
  error: string | null;
  start: (context: Context, demo: boolean, replace?: boolean) => boolean;
  editAnswer: (answer: 1 | 2, text: string) => void;
  confirmAnswer: () => void;
  beginRequest: (operation: Operation) => string;
  acceptFollowUp: (token: string, question: string) => void;
  acceptFeedback: (token: string, feedback: Feedback) => void;
  failRequest: (token: string, message: string) => void;
  cancelRequest: () => void;
  deleteAttempt: (id: string) => void;
}

export function createTrainerStore(source: StorageSource = browserStorage) {
  const report = (message: string) =>
    queueMicrotask(() => {
      if (store.getState().storageError !== message)
        store.setState({ storageError: message });
    });
  const storage = guardedStorage(source, report);
  const store = createStore<TrainerState>()(
    persist(
      (set, get) => ({
        hydrated: false,
        storageError: null,
        experiences: [],
        saveExperience: (card) => {
          const parsed = experienceSchema.parse(card);
          set((state) => ({
            experiences: [
              parsed,
              ...state.experiences.filter((item) => item.id !== card.id),
            ],
          }));
        },
        deleteExperience: (id) =>
          set((state) => ({
            experiences: state.experiences.filter((item) => item.id !== id),
          })),
        clearSavedData: async () => {
          try {
            await storage.removeItem("eye-practice");
            set({
              session: null,
              history: [],
              experiences: [],
              request: null,
              error: null,
              storageError: null,
            });
          } catch {
            report(
              "Saved data could not be cleared. Check your browser storage settings.",
            );
          }
        },
        session: null,
        history: [],
        request: null,
        error: null,
        start: (context, demo, replace = false) => {
          const current = get().session;
          if (
            !replace &&
            current &&
            current.stage !== "complete" &&
            (current.answer1.trim() ||
              current.answer2.trim() ||
              current.followUp)
          )
            return false;
          set({
            session: {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              context: structuredClone(context),
              demo,
              stage: "answering",
              answer1: "",
              answer2: "",
              followUp: null,
              feedback: null,
            },
            request: null,
            error: null,
          });
          return true;
        },
        editAnswer: (answer, text) => {
          const session = get().session;
          if (!session) return;
          if (text.length > 12000) return;
          if (answer === 2 && !session.followUp) return;
          set({
            session: {
              ...session,
              id:
                session.stage === "complete" ? crypto.randomUUID() : session.id,
              feedback: null,
              ...(answer === 1
                ? {
                    answer1: text,
                    answer2: "",
                    followUp: null,
                    stage: "answering" as const,
                  }
                : { answer2: text, stage: "answering-follow-up" as const }),
            },
            request: null,
            error: null,
          });
        },
        confirmAnswer: () => {
          const session = get().session;
          if (!session) throw new Error("Start a practice first.");
          const first = session.stage === "answering";
          if (!first && session.stage !== "answering-follow-up")
            throw new Error("This answer is already confirmed.");
          if (!(first ? session.answer1 : session.answer2).trim())
            throw new Error("Add an answer before continuing.");
          set({
            session: {
              ...session,
              stage: first ? "ready-follow-up" : "ready-feedback",
            },
            error: null,
          });
        },
        beginRequest: (operation) => {
          const { session, request } = get();
          if (
            request ||
            !session ||
            session.stage !==
              (operation === "follow-up" ? "ready-follow-up" : "ready-feedback")
          )
            throw new Error("The session is not ready for this request.");
          const token = crypto.randomUUID();
          set({ request: { token, operation }, error: null });
          return token;
        },
        acceptFollowUp: (token, question) => {
          const { session, request } = get();
          if (
            !session ||
            request?.token !== token ||
            request.operation !== "follow-up"
          )
            return;
          set({
            session: {
              ...session,
              followUp: question,
              stage: "answering-follow-up",
            },
            request: null,
          });
        },
        acceptFeedback: (token, feedback) => {
          const { session, request, history } = get();
          if (
            !session ||
            request?.token !== token ||
            request.operation !== "feedback"
          )
            return;
          const completed = {
            ...session,
            feedback,
            stage: "complete" as const,
          };
          set({
            session: completed,
            request: null,
            history: [
              structuredClone(completed),
              ...history.filter((item) => item.id !== session.id),
            ],
          });
        },
        failRequest: (token, message) => {
          if (get().request?.token === token)
            set({ request: null, error: message });
        },
        cancelRequest: () => set({ request: null, error: null }),
        deleteAttempt: (id) =>
          set((state) => ({
            history: state.history.filter((item) => item.id !== id),
            session: state.session?.id === id ? null : state.session,
          })),
      }),
      {
        name: "eye-practice",
        version: 1,
        storage,
        skipHydration: true,
        partialize: (state) => ({
          session: state.session,
          history: state.history,
          experiences: state.experiences,
        }),
        merge: (saved, current) => ({
          ...current,
          ...(saved as object),
          request: null,
          error: null,
        }),
        onRehydrateStorage: () => () => {
          store.setState({ hydrated: true });
        },
      },
    ),
  );
  return store;
}
export type TrainerStore = ReturnType<typeof createTrainerStore>;
