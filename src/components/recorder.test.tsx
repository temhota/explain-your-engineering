import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { Recorder } from "./recorder";
vi.mock("@/hooks/use-recorder", () => ({
  useRecorder: () => ({
    blob: new Blob(["audio"], { type: "audio/webm" }),
    status: "idle",
    start: vi.fn(),
  }),
}));
afterEach(() => vi.unstubAllGlobals());
it("delivers a delayed transcript to the latest answer callback", async () => {
  let resolve!: (value: Response) => void;
  vi.stubGlobal(
    "fetch",
    () =>
      new Promise<Response>((r) => {
        resolve = r;
      }),
  );
  const old = vi.fn();
  const latest = vi.fn();
  const view = render(<Recorder disabled={false} onTranscript={old} />);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Transcribe recording" }));
  view.rerender(<Recorder disabled={false} onTranscript={latest} />);
  await act(async () => resolve(Response.json({ text: "Transcript" })));
  expect(old).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledWith("Transcript");
});
