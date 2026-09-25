"use client";
import { useTrainer } from "@/store/provider";
import type { Context } from "@/lib/domain";

export function useStartPractice() {
  const start = useTrainer((state) => state.start);
  return (context: Context, demo: boolean) => {
    if (start(context, demo)) return true;
    if (
      !window.confirm(
        "Discard your unfinished practice and start a new one? Cancel keeps your current answer.",
      )
    )
      return false;
    return start(context, demo, true);
  };
}
