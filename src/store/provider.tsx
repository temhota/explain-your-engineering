'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createTrainerStore, type TrainerState, type TrainerStore } from './trainer';
const StoreContext = createContext<TrainerStore | null>(null);
export function TrainerProvider({ children, store: supplied }: { children: ReactNode; store?: TrainerStore }) {
  const [store] = useState(() => supplied ?? createTrainerStore());
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
export function useTrainer<T>(selector: (state: TrainerState) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error('TrainerProvider is missing.');
  return useStore(store, selector);
}
