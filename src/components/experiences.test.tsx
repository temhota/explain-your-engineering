import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, afterEach } from "vitest";
import { TrainerProvider } from "@/store/provider";
import { createTrainerStore } from "@/store/trainer";
import { Experiences } from "./experiences";
afterEach(cleanup);
it("creates a personal story with an optional result", async () => {
  const store = createTrainerStore();
  render(
    <TrainerProvider store={store}>
      <Experiences onPractice={() => {}} />
    </TrainerProvider>,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /add a story/i }));
  await user.type(screen.getByLabelText("Title"), "Offline drafts");
  await user.type(
    screen.getByLabelText("Your decision"),
    "Use local storage for drafts.",
  );
  await user.click(screen.getByRole("button", { name: "Save story" }));
  expect(store.getState().experiences[0].title).toBe("Offline drafts");
  expect(store.getState().experiences[0].result).toBe("");
});
