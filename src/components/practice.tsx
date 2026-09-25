"use client";
import Link from "next/link";
import { useStartPractice } from "@/hooks/use-start-practice";
import { useState } from "react";
import type { PublicQuestion, Topic } from "@/lib/questions";
import { Experiences } from "./experiences";
import { useRouter } from "next/navigation";
import { useTrainer } from "@/store/provider";
import { demoContext } from "@/lib/demo";
import styles from "./trainer.module.css";
export function Practice({
  questions,
  live,
}: {
  questions: PublicQuestion[];
  live: boolean;
}) {
  const [mode, setMode] = useState<"technology" | "experience">("technology");
  const [topic, setTopic] = useState<Topic | null>(null);
  const session = useTrainer((s) => s.session);
  const start = useStartPractice();
  const router = useRouter();
  return (
    <>
      <header className={styles.pageHeading}>
        <div>
          <h1>Practice</h1>
          <p>Choose a question. Explain it in your own words.</p>
        </div>
        <button
          className={styles.textButton}
          onClick={() => {
            if (start(demoContext, true)) router.push("/session");
          }}
        >
          Try the example
        </button>
      </header>
      {session && session.stage !== "complete" && (
        <p className={styles.resume}>
          Unfinished practice: {session.context.title}.{" "}
          <Link href="/session">Continue your answer</Link>
        </p>
      )}
      <div className={styles.tabs} role="group" aria-label="Practice mode">
        <button
          aria-pressed={mode === "technology"}
          onClick={() => setMode("technology")}
        >
          Technology questions
        </button>
        <button
          aria-pressed={mode === "experience"}
          onClick={() => setMode("experience")}
        >
          My experience
        </button>
      </div>
      {!live && (
        <p className={styles.notice}>
          Text practice only here. Recording and AI feedback require a local API
          setup. The example includes a prepared review.
        </p>
      )}
      {mode === "experience" ? (
        <Experiences onPractice={() => router.push("/session")} />
      ) : (
        <>
          <div className={styles.filter} role="group" aria-label="Technology">
            {([null, "JavaScript", "TypeScript", "React"] as const).map(
              (value) => (
                <button
                  key={value ?? "all"}
                  aria-pressed={topic === value}
                  onClick={() => setTopic(value)}
                >
                  {value ?? "All"}
                </button>
              ),
            )}
          </div>
          <div className={styles.list}>
            {questions
              .filter((q) => !topic || q.topic === topic)
              .map((q, index) => (
                <article key={q.id} className={styles.listItem}>
                  <span className={styles.rowNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.rowContent}>
                    <p className={styles.meta}>{q.topic}</p>
                    <h2>{q.title}</h2>
                    <p>{q.question}</p>
                  </div>
                  <button
                    className={styles.secondary}
                    onClick={() => {
                      if (
                        start(
                          {
                            mode: "technology",
                            questionId: q.id,
                            version: q.version,
                            title: q.title,
                            question: q.question,
                          },
                          false,
                        )
                      )
                        router.push("/session");
                    }}
                  >
                    Practise
                  </button>
                </article>
              ))}
          </div>
        </>
      )}
    </>
  );
}
