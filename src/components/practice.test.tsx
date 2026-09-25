import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TrainerProvider } from "@/store/provider";
import { createTrainerStore } from "@/store/trainer";
import { Practice } from "./practice";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
it("shows questions immediately and filters without an extra selection screen", async () => {
  render(
    <TrainerProvider store={createTrainerStore()}>
      <Practice
        live={false}
        questions={[
          {
            id: "js-closures",
            version: 1,
            sourceIds: [],
            topic: "JavaScript",
            title: "Closures",
            question: "Explain a closure.",
          },
          {
            id: "react-effects",
            version: 1,
            sourceIds: [],
            topic: "React",
            title: "Effects",
            question: "When do you need an effect?",
          },
        ]}
      />
    </TrainerProvider>,
  );
  expect(screen.getByText("Explain a closure.")).toBeVisible();
  expect(screen.getByText("When do you need an effect?")).toBeVisible();
  await userEvent
    .setup()
    .click(screen.getByRole("radio", { name: "React" }).closest("label")!);
  expect(screen.queryByText("Explain a closure.")).not.toBeInTheDocument();
  expect(screen.getByText("When do you need an effect?")).toBeVisible();
});
