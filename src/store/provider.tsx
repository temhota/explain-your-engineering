'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createTrainerStore, type TrainerState, type TrainerStore } from './trainer';
const StoreContext = createContext<TrainerStore | null>(null);
export function TrainerProvider({ children, store: supplied }: { children: ReactNode; store?: TrainerStore }) {
  const [store] = useState(() => supplied ?? createTrainerStore());
  useEffect(() => { void store.persist.rehydrate(); }, [store]);
  return <StoreContext.Provider value={store}>{supplied ? children : <Hydrated>{children}</Hydrated>}</StoreContext.Provider>;
}
export function useTrainer<T>(selector: (state: TrainerState) => T): T {
  const store = useContext(StoreContext);
  if (!store) throw new Error('TrainerProvider is missing.');
  return useStore(store, selector);
}

function Hydrated({children}: {children:ReactNode}) {
 const ready=useTrainer(s=>s.hydrated); const error=useTrainer(s=>s.storageError); const clear=useTrainer(s=>s.clearSavedData);
 if(!ready)return <p role="status" style={{padding:32}}>Opening your practice room…</p>;
 return <>{error&&<div role="alert" style={{padding:16,background:'#fff1db'}}>{error} <button onClick={()=>{if(window.confirm('Clear all saved cards, drafts and history in this browser?'))void clear();}}>Clear saved data</button></div>}{children}</>;
}
