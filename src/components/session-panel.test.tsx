import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { TrainerProvider } from "@/store/provider";
import { createTrainerStore } from "@/store/trainer";
import { SessionPanel } from "./session-panel";
it("completes an explicitly labelled fictional walkthrough", async () => {
  const store = createTrainerStore();
  store.getState().start(
    {
      mode: "technology",
      questionId: "react-effects",
      version: 1,
      title: "Effects",
      question: "When do you need an Effect?",
    },
    true,
  );
  render(
    <TrainerProvider store={store}>
      <SessionPanel />
    </TrainerProvider>,
  );
  const user = userEvent.setup();
  expect(screen.getByText(/scripted example/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /use example answer/i }));
  await user.click(screen.getByRole("button", { name: /confirm answer/i }));
  await user.click(screen.getByRole("button", { name: /show follow-up/i }));
  await user.click(screen.getByRole("button", { name: /use example answer/i }));
  await user.click(screen.getByRole("button", { name: /confirm answer/i }));
  await user.click(
    screen.getByRole("button", { name: /show example review/i }),
  );
  expect(
    await screen.findByRole("heading", { name: "Communication" }),
  ).toBeInTheDocument();
  expect(store.getState().history).toHaveLength(1);
});
it("cancels the active operation when leaving the session screen", async () => {
  const store = createTrainerStore();
  store.getState().start(
    {
      mode: "technology",
      questionId: "react-effects",
      version: 1,
      title: "Effects",
      question: "When do you need an Effect?",
    },
    false,
  );
  store.getState().editAnswer(1, "Derived values do not need an effect.");
  store.getState().confirmAnswer();
  const original = globalThis.fetch;
  globalThis.fetch = () => new Promise(() => {});
  try {
    const view = render(
      <TrainerProvider store={store}>
        <SessionPanel />
      </TrainerProvider>,
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Get follow-up" }));
    expect(store.getState().request).not.toBeNull();
    view.unmount();
    expect(store.getState().request).toBeNull();
  } finally {
    globalThis.fetch = original;
  }
});

it("explains offline practice before recording and disables unavailable AI actions", async () => {
  const store = createTrainerStore();
  store
    .getState()
    .start(
      {
        mode: "technology",
        questionId: "js-closures",
        version: 1,
        title: "Closures",
        question: "Explain a closure.",
      },
      false,
    );
  render(
    <TrainerProvider store={store}>
      <SessionPanel live={false} />
    </TrainerProvider>,
  );
  expect(
    screen.getByText(/recording and AI feedback are unavailable/i),
  ).toBeVisible();
  expect(
    screen.queryByRole("button", { name: "Record an answer" }),
  ).not.toBeInTheDocument();
  await userEvent
    .setup()
    .type(
      screen.getByLabelText("Explain your thinking in English"),
      "A lexical binding.",
    );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Confirm answer" }));
  expect(screen.getByRole("button", { name: "Get follow-up" })).toBeDisabled();
});
