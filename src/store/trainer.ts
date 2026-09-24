import { createStore } from 'zustand/vanilla';
import type { Context, Feedback, Operation, Session } from '@/lib/domain';

export interface TrainerState {
  session: Session | null;
  history: Session[];
  request: { token: string; operation: Operation } | null;
  error: string | null;
  start: (context: Context, demo: boolean) => void;
  editAnswer: (answer: 1 | 2, text: string) => void;
  confirmAnswer: () => void;
  beginRequest: (operation: Operation) => string;
  acceptFollowUp: (token: string, question: string) => void;
  acceptFeedback: (token: string, feedback: Feedback) => void;
  failRequest: (token: string, message: string) => void;
  cancelRequest: () => void;
  deleteAttempt: (id: string) => void;
}

export function createTrainerStore() {
  return createStore<TrainerState>()((set, get) => ({
    session: null, history: [], request: null, error: null,
    start: (context, demo) => set({ session: { id: crypto.randomUUID(), createdAt: new Date().toISOString(), context: structuredClone(context), demo, stage: 'answering', answer1: '', answer2: '', followUp: null, feedback: null }, request: null, error: null }),
    editAnswer: (answer, text) => {
      const session = get().session; if (!session) return;
      if (text.length > 12000) return;
      if (answer === 2 && !session.followUp) return;
      set({ session: { ...session, id: session.stage === 'complete' ? crypto.randomUUID() : session.id, feedback: null,
        ...(answer === 1 ? { answer1: text, answer2: '', followUp: null, stage: 'answering' as const } : { answer2: text, stage: 'answering-follow-up' as const }) }, request: null, error: null });
    },
    confirmAnswer: () => {
      const session = get().session; if (!session) throw new Error('Start a practice first.');
      const first = session.stage === 'answering';
      if (!first && session.stage !== 'answering-follow-up') throw new Error('This answer is already confirmed.');
      if (!(first ? session.answer1 : session.answer2).trim()) throw new Error('Add an answer before continuing.');
      set({ session: { ...session, stage: first ? 'ready-follow-up' : 'ready-feedback' }, error: null });
    },
    beginRequest: (operation) => {
      const { session, request } = get();
      if (request || !session || session.stage !== (operation === 'follow-up' ? 'ready-follow-up' : 'ready-feedback')) throw new Error('The session is not ready for this request.');
      const token = crypto.randomUUID(); set({ request: { token, operation }, error: null }); return token;
    },
    acceptFollowUp: (token, question) => {
      const { session, request } = get();
      if (!session || request?.token !== token || request.operation !== 'follow-up') return;
      set({ session: { ...session, followUp: question, stage: 'answering-follow-up' }, request: null });
    },
    acceptFeedback: (token, feedback) => {
      const { session, request, history } = get();
      if (!session || request?.token !== token || request.operation !== 'feedback') return;
      const completed = { ...session, feedback, stage: 'complete' as const };
      set({ session: completed, request: null, history: [structuredClone(completed), ...history.filter(item => item.id !== session.id)] });
    },
    failRequest: (token, message) => { if (get().request?.token === token) set({ request: null, error: message }); },
    cancelRequest: () => set({ request: null, error: null }),
    deleteAttempt: (id) => set(state => ({ history: state.history.filter(item => item.id !== id), session: state.session?.id === id ? null : state.session })),
  }));
}
export type TrainerStore = ReturnType<typeof createTrainerStore>;
