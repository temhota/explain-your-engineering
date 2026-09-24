"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Check, MessageSquare } from "lucide-react";
import { useTrainer } from "@/store/provider";
import { demoAnswers, demoFollowUp, demoFeedback } from "@/lib/demo";
import { Review } from "./review";
import { Recorder } from "./recorder";
import styles from "./trainer.module.css";
export function SessionPanel() {
  const session = useTrainer((s) => s.session);
  const request = useTrainer((s) => s.request);
  const error = useTrainer((s) => s.error);
  const edit = useTrainer((s) => s.editAnswer);
  const confirm = useTrainer((s) => s.confirmAnswer);
  const begin = useTrainer((s) => s.beginRequest);
  const acceptQuestion = useTrainer((s) => s.acceptFollowUp);
  const acceptReview = useTrainer((s) => s.acceptFeedback);
  const fail = useTrainer((s) => s.failRequest);
  const cancel = useTrainer((s) => s.cancelRequest);
  const start = useTrainer((s) => s.start);
  const abort = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      abort.current?.abort();
      cancel();
    },
    [cancel],
  );
  if (!session)
    return (
      <section className={styles.empty}>
        <MessageSquare size={36} />
        <h1>A good answer starts with a question.</h1>
        <p>Choose a topic or bring a story from your own work.</p>
        <Link className={styles.primary} href="/">
          Choose a practice <ArrowRight size={16} />
        </Link>
      </section>
    );
  const first =
    session.stage === "answering" || session.stage === "ready-follow-up";
  const answer = first ? session.answer1 : session.answer2;
  async function generate(operation: "follow-up" | "feedback") {
    if (!session) return;
    const token = begin(operation);
    if (session.demo) {
      if (operation === "follow-up") acceptQuestion(token, demoFollowUp);
      else acceptReview(token, demoFeedback);
      return;
    }
    abort.current = new AbortController();
    try {
      const response = await fetch(`/api/${operation}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: session.context,
          answer1: session.answer1,
          answer2: session.answer2,
          followUp: session.followUp,
        }),
        signal: abort.current.signal,
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error?.message ?? "The request failed. Please try again.",
        );
      if (operation === "follow-up") acceptQuestion(token, body.question);
      else acceptReview(token, body.feedback);
    } catch (e) {
      fail(token, e instanceof Error ? e.message : "The request failed.");
    }
  }
  if (session.stage === "complete")
    return (
      <>
        <Review session={session} />
        <div className={styles.actions}>
          <button
            className={styles.primary}
            onClick={() => start(session.context, session.demo)}
          >
            Try this question again <ArrowRight size={16} />
          </button>
          <Link href="/history" className={styles.secondary}>
            View history
          </Link>
        </div>
      </>
    );
  return (
    <div className={styles.sessionLayout}>
      <section>
        {session.demo && (
          <p className={styles.notice}>
            <strong>Scripted example.</strong> Fictional answers and a prepared
            review show the full experience. No AI requests are made.
          </p>
        )}
        {!session.demo && (
          <p className={styles.notice}>
            Live follow-up and review requests send your confirmed answers and
            the complete selected experience card (if any) to OpenAI.
            Transcription sends your audio. Use non-confidential examples.
            Deleting saved browser data does not delete provider-held data.{" "}
            <a
              href="https://developers.openai.com/api/docs/guides/your-data"
              target="_blank"
              rel="noreferrer"
            >
              OpenAI data policy
            </a>
            .
          </p>
        )}
        <div className={styles.steps}>
          <span className={first ? styles.activeStep : ""}>
            01 · Your answer
          </span>
          <span className={!first ? styles.activeStep : ""}>
            02 · Dig deeper
          </span>
          <span>03 · Debrief</span>
        </div>
        <div className={styles.question}>
          <p className={styles.eyebrow}>
            {session.context.mode === "technology"
              ? "Technical practice"
              : "Your experience"}{" "}
            / {first ? "Main question" : "Follow-up"}
          </p>
          <h1>{first ? session.context.question : session.followUp}</h1>
        </div>
        <div className={styles.card}>
          <div className={styles.sectionHeading}>
            <h2>Your answer</h2>
            <span className={styles.pill}>
              {session.demo ? "Example" : "Text input"}
            </span>
          </div>
          {!session.demo &&
            (session.stage === "answering" ||
              session.stage === "answering-follow-up") && (
              <Recorder
                key={`${session.id}-${first}`}
                disabled={!!request}
                onTranscript={(text) => {
                  if (
                    !answer ||
                    window.confirm(
                      "Replace the current answer with this transcript?",
                    )
                  )
                    edit(first ? 1 : 2, text);
                }}
              />
            )}
          <label className={styles.label} htmlFor="answer">
            {session.demo
              ? "Read the example response"
              : "Explain your thinking in English"}
          </label>
          <textarea
            id="answer"
            value={answer}
            readOnly={session.demo || !!request}
            maxLength={12000}
            placeholder="Start with your decision. Explain why, then give an example…"
            onChange={(e) => edit(first ? 1 : 2, e.target.value)}
            rows={8}
          />
          <div className={styles.answerFooter}>
            <span>
              {answer.trim().split(/\s+/).filter(Boolean).length} words · no
              perfect script needed
            </span>
            {session.demo && !answer && (
              <button
                className={styles.secondary}
                onClick={() => edit(first ? 1 : 2, demoAnswers[first ? 0 : 1])}
              >
                Use example answer
              </button>
            )}
          </div>
          <div className={styles.actions}>
            {(session.stage === "answering" ||
              session.stage === "answering-follow-up") && (
              <button
                className={styles.primary}
                disabled={!answer.trim()}
                onClick={confirm}
              >
                Confirm answer <Check size={16} />
              </button>
            )}
            {session.stage === "ready-follow-up" && (
              <button
                className={styles.primary}
                disabled={!!request}
                onClick={() => generate("follow-up")}
              >
                {request
                  ? "Preparing your question…"
                  : session.demo
                    ? "Show follow-up"
                    : "Get follow-up"}{" "}
                <ArrowRight size={16} />
              </button>
            )}
            {session.stage === "ready-feedback" && (
              <button
                className={styles.primary}
                disabled={!!request}
                onClick={() => generate("feedback")}
              >
                {request
                  ? "Reviewing your answers…"
                  : session.demo
                    ? "Show example review"
                    : "Review my answers"}{" "}
                <ArrowRight size={16} />
              </button>
            )}
            {request && (
              <button
                className={styles.secondary}
                onClick={() => {
                  abort.current?.abort();
                  cancel();
                }}
              >
                Cancel request
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </div>
        {!first && (
          <details className={styles.previous}>
            <summary>Revisit your first answer</summary>
            <p>{session.answer1}</p>
            <button
              className={styles.secondary}
              onClick={() => {
                if (
                  window.confirm(
                    "Editing the first answer clears the follow-up and second answer. Continue?",
                  )
                )
                  edit(1, session.answer1);
              }}
            >
              Edit first answer
            </button>
          </details>
        )}
      </section>
      <aside className={styles.coach}>
        <span className={styles.coachIcon}>✳</span>
        <p className={styles.eyebrow}>A useful way to answer</p>
        <h2>Make your thinking visible.</h2>
        <ol>
          <li>
            <strong>Lead with the answer.</strong>
            <span>What did you choose or conclude?</span>
          </li>
          <li>
            <strong>Explain the trade-off.</strong>
            <span>Why this approach over another?</span>
          </li>
          <li>
            <strong>Make it concrete.</strong>
            <span>Use a small example from your work.</span>
          </li>
        </ol>
        <p className={styles.muted}>
          You’re practising an explanation, not reciting a definition.
        </p>
      </aside>
    </div>
  );
}
