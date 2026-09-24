import { describe, it, expect } from "vitest";
import { createTrainerStore } from "./trainer";

const context = {
  mode: "technology" as const,
  questionId: "js-closures",
  version: 1,
  title: "Closures",
  question: "How does a closure work?",
};
const review = {
  communication: [
    {
      kind: "strength" as const,
      answer: 1 as const,
      quote: "lexical scope",
      observation: "Specific explanation.",
      action: "Add an example.",
      sourceIds: [],
    },
  ],
  technical: [],
};

describe("practice lifecycle", () => {
  it("isolates stores and refuses empty answers", () => {
    const a = createTrainerStore();
    const b = createTrainerStore();
    a.getState().start(context, false);
    expect(b.getState().session).toBeNull();
    expect(() => a.getState().confirmAnswer()).toThrow(/answer/i);
  });
  it("invalidates a follow-up and feedback when the original answer changes", () => {
    const store = createTrainerStore();
    const s = () => store.getState();
    s().start(context, false);
    s().editAnswer(1, "lexical scope");
    s().confirmAnswer();
    const token = s().beginRequest("follow-up");
    s().acceptFollowUp(token, "What happens in a loop?");
    s().editAnswer(2, "Each let binding is separate.");
    s().confirmAnswer();
    const feedbackToken = s().beginRequest("feedback");
    s().acceptFeedback(feedbackToken, review);
    expect(s().history).toHaveLength(1);
    s().editAnswer(1, "An updated explanation");
    expect(s().session?.followUp).toBeNull();
    expect(s().session?.feedback).toBeNull();
    expect(s().session?.answer2).toBe("");
    expect(s().history[0].answer1).toBe("lexical scope");
  });
  it("ignores a response after cancellation or a new session", () => {
    const store = createTrainerStore();
    const s = () => store.getState();
    s().start(context, false);
    s().editAnswer(1, "lexical scope");
    s().confirmAnswer();
    const token = s().beginRequest("follow-up");
    s().cancelRequest();
    s().acceptFollowUp(token, "Stale question");
    expect(s().session?.followUp).toBeNull();
    s().start(context, false);
    s().acceptFollowUp(token, "Still stale");
    expect(s().session?.followUp).toBeNull();
  });
  it("repeats as a new attempt without overwriting history", () => {
    const store = createTrainerStore();
    const s = () => store.getState();
    s().start(context, false);
    const original = s().session!.id;
    s().editAnswer(1, "lexical scope");
    s().confirmAnswer();
    s().acceptFollowUp(s().beginRequest("follow-up"), "Why?");
    s().editAnswer(2, "Because bindings are retained.");
    s().confirmAnswer();
    s().acceptFeedback(s().beginRequest("feedback"), review);
    s().start(s().history[0].context, false);
    expect(s().session!.id).not.toBe(original);
    expect(s().history[0].id).toBe(original);
  });
});
