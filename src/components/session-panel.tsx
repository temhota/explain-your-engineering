"use client";
import { useStartPractice } from "@/hooks/use-start-practice";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Alert, Button, Collapse, Input, Space, Tag, Typography } from "antd";
import { useConfirm } from "@/hooks/use-confirm";
import { useTrainer, useTrainerApi } from "@/store/provider";
import { demoAnswers, demoFollowUp, demoFeedback } from "@/lib/demo";
import { Review } from "./review";
import { Recorder } from "./recorder";
import styles from "./trainer.module.css";
export function SessionPanel({ live = true }: { live?: boolean }) {
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
  const start = useStartPractice();
  const ask = useConfirm();
  const store = useTrainerApi();
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
        <Typography.Title level={2}>No practice in progress</Typography.Title>
        <p>Choose a question or an experience to begin.</p>
        <Link href="/">Choose a practice</Link>
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
      <div className={styles.sessionLayout}>
        <Review session={session} />
        <Space className={styles.actions} wrap>
          <Button
            type="primary"
            onClick={() => void start(session.context, session.demo)}
          >
            Try this question again
          </Button>
          <Link href="/history">View history</Link>
        </Space>
      </div>
    );
  return (
    <div className={styles.sessionLayout}>
      {session.demo && (
        <Alert
          className={styles.notice}
          type="info"
          showIcon
          title="Scripted example"
          description="Fictional answers and a prepared review. No AI requests are made."
        />
      )}
      {!session.demo && !live && (
        <Alert
          className={styles.notice}
          type="info"
          showIcon
          title="Text practice only"
          description="Recording and AI feedback are unavailable in this deployment. Your answer is saved in this browser."
        />
      )}
      <div className={styles.question}>
        <Space wrap>
          <Tag color="blue">
            {session.context.mode === "technology"
              ? "Technology"
              : "Your experience"}
          </Tag>
          <Typography.Text type="secondary">
            {first ? "Question 1 of 2" : "Question 2 of 2"}
          </Typography.Text>
        </Space>
        <Typography.Title level={2}>
          {first ? session.context.question : session.followUp}
        </Typography.Title>
      </div>
      {!session.demo &&
        live &&
        (session.stage === "answering" ||
          session.stage === "answering-follow-up") && (
          <Recorder
            key={`${session.id}-${first}`}
            disabled={!!request}
            onTranscript={async (text) => {
              if (
                !answer ||
                (await ask(
                  "Replace your answer?",
                  "The transcript will replace the text you have entered.",
                  "Use transcript",
                  "Keep text",
                ))
              ) {
                const latest = store.getState().session;
                if (
                  latest?.id === session.id &&
                  (first ? latest.answer1 : latest.answer2) === answer
                )
                  edit(first ? 1 : 2, text);
              }
            }}
          />
        )}
      <label className={styles.label} htmlFor="answer">
        {session.demo
          ? "Read the example response"
          : "Explain your thinking in English"}
      </label>
      <Input.TextArea
        id="answer"
        value={answer}
        readOnly={session.demo || !!request}
        maxLength={12000}
        placeholder="Your answer…"
        onChange={(e) => edit(first ? 1 : 2, e.target.value)}
        rows={8}
      />
      <div className={styles.answerFooter}>
        <Typography.Text type="secondary">
          {answer.trim().split(/\s+/).filter(Boolean).length} words
        </Typography.Text>
        {session.demo && !answer && (
          <Button
            onClick={() => edit(first ? 1 : 2, demoAnswers[first ? 0 : 1])}
          >
            Use example answer
          </Button>
        )}
      </div>
      {!session.demo && live && (
        <Typography.Paragraph type="secondary" className={styles.privacy}>
          AI requests send your answers and selected experience card to OpenAI.
          Transcription sends audio.
        </Typography.Paragraph>
      )}
      <Space className={styles.actions} wrap>
        {(session.stage === "answering" ||
          session.stage === "answering-follow-up") && (
          <Button type="primary" disabled={!answer.trim()} onClick={confirm}>
            Confirm answer
          </Button>
        )}
        {session.stage === "ready-follow-up" && (
          <Button
            type="primary"
            loading={!!request}
            disabled={!!request || (!session.demo && !live)}
            onClick={() => generate("follow-up")}
          >
            {session.demo ? "Show follow-up" : "Get follow-up"}
          </Button>
        )}
        {session.stage === "ready-feedback" && (
          <Button
            type="primary"
            loading={!!request}
            disabled={!!request || (!session.demo && !live)}
            onClick={() => generate("feedback")}
          >
            {session.demo ? "Show example review" : "Review my answers"}
          </Button>
        )}
        {request && (
          <Button
            onClick={() => {
              abort.current?.abort();
              cancel();
            }}
          >
            Cancel request
          </Button>
        )}
      </Space>
      {error && (
        <Alert className={styles.notice} type="error" showIcon title={error} />
      )}
      <Collapse
        className={styles.details}
        items={[
          {
            key: "tips",
            label: "Answering tips",
            children: (
              <p>
                State your answer, explain the reasoning, then give a concrete
                example. If you are unsure, say what you would check.
              </p>
            ),
          },
          ...(!session.demo && live
            ? [
                {
                  key: "privacy",
                  label: "Data use",
                  children: (
                    <p>
                      Use non-confidential examples. Deleting browser data does
                      not delete provider-held data.{" "}
                      <a
                        href="https://developers.openai.com/api/docs/guides/your-data"
                        target="_blank"
                        rel="noreferrer"
                      >
                        OpenAI data policy
                      </a>
                      .
                    </p>
                  ),
                },
              ]
            : []),
          ...(!first
            ? [
                {
                  key: "first",
                  label: "Revisit your first answer",
                  children: (
                    <>
                      <p className={styles.transcript}>{session.answer1}</p>
                      <Button
                        onClick={async () => {
                          if (
                            await ask(
                              "Edit the first answer?",
                              "This clears the follow-up, second answer and review.",
                              "Edit answer",
                            )
                          ) {
                            if (store.getState().session?.id === session.id)
                              edit(1, session.answer1);
                          }
                        }}
                      >
                        Edit first answer
                      </Button>
                    </>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
