import { App, ConfigProvider } from "antd";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TrainerProvider } from "@/store/provider";
import { createTrainerStore } from "@/store/trainer";
import { useStartPractice } from "./use-start-practice";
const context = {
  mode: "technology" as const,
  questionId: "js-closures",
  version: 1,
  title: "Closures",
  question: "Explain a closure.",
};
function Launcher() {
  const start = useStartPractice();
  return (
    <button onClick={() => void start(context, true)}>Start another</button>
  );
}
it("uses an accessible in-app confirmation and preserves the draft on cancel", async () => {
  const nativeConfirm = vi.spyOn(window, "confirm").mockReturnValue(false);
  const store = createTrainerStore();
  store.getState().start(context, false);
  store.getState().editAnswer(1, "My draft");
  render(
    <ConfigProvider theme={{ token: { motion: false } }}>
      <App>
        <TrainerProvider store={store}>
          <Launcher />
        </TrainerProvider>
      </App>
    </ConfigProvider>,
  );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Start another" }));
  await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Keep practising" }));
  expect(store.getState().session?.answer1).toBe("My draft");
  expect(nativeConfirm).not.toHaveBeenCalled();
  nativeConfirm.mockRestore();
});
