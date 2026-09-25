"use client";
import { useConfirm } from "./use-confirm";
import { useTrainer } from "@/store/provider";
import type { Context } from "@/lib/domain";

export function useStartPractice() {
  const start = useTrainer((state) => state.start);
  const confirm = useConfirm();
  return async (context: Context, demo: boolean) => {
    if (start(context, demo)) return true;
    if (
      !(await confirm(
        "Start a new practice?",
        "Your unfinished answer will be discarded.",
        "Discard and start",
        "Keep practising",
      ))
    )
      return false;
    return start(context, demo, true);
  };
}
