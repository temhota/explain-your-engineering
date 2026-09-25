"use client";
import { Alert, Button, Spin } from "antd";
import { useConfirm } from "@/hooks/use-confirm";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import {
  createTrainerStore,
  type TrainerState,
  type TrainerStore,
} from "./trainer";
const StoreContext = createContext<TrainerStore | null>(null);
export function TrainerProvider({
  children,
  store: supplied,
}: {
  children: ReactNode;
  store?: TrainerStore;
}) {
  const [store] = useState(() => supplied ?? createTrainerStore());
  useEffect(() => {
    if (!supplied) void store.persist.rehydrate();
  }, [store, supplied]);
  return (
    <StoreContext.Provider value={store}>
      {supplied ? children : <Hydrated>{children}</Hydrated>}
    </StoreContext.Provider>
  );
}
export function useTrainerApi() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("TrainerProvider is missing.");
  return store;
}
export function useTrainer<T>(selector: (state: TrainerState) => T): T {
  return useStore(useTrainerApi(), selector);
}

function Hydrated({ children }: { children: ReactNode }) {
  const ready = useTrainer((s) => s.hydrated);
  const error = useTrainer((s) => s.storageError);
  const clear = useTrainer((s) => s.clearSavedData);
  const confirm = useConfirm();
  if (!ready)
    return (
      <div role="status" style={{ padding: 32 }}>
        <Spin /> Opening your practice…
      </div>
    );
  return (
    <>
      {error && (
        <Alert
          type="warning"
          showIcon
          title={error}
          action={
            <Button
              onClick={async () => {
                if (
                  await confirm(
                    "Clear saved data?",
                    "This deletes all cards, drafts and history in this browser.",
                    "Clear data",
                  )
                )
                  await clear();
              }}
            >
              Clear saved data
            </Button>
          }
        />
      )}
      {children}
    </>
  );
}
