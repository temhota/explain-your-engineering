"use client";
import { useStartPractice } from "@/hooks/use-start-practice";
import { useState } from "react";
import type { PublicQuestion, Topic } from "@/lib/questions";
import { Experiences } from "./experiences";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
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
  const start = useStartPractice();
  const router = useRouter();
  const launch = () => {
    if (start(demoContext, true)) router.push("/session");
  };
  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Small sessions. Clearer thinking.</p>
          <h1>
            You know your craft.
            <br />
            Find the words for it.
          </h1>
          <p>
            Practise explaining technical decisions, handle the follow-up, and
            leave with one thing to improve.
          </p>
        </div>
        <div className={styles.heroBadge}>
          <strong>5–8</strong>
          <span>minutes of practice</span>
        </div>
      </section>
      <section className={styles.feature}>
        <div>
          <p className={styles.eyebrow}>Take a look inside</p>
          <h2>One question. A little deeper.</h2>
          <p>
            Walk through a fictional React interview, from first answer to
            useful feedback.
          </p>
        </div>
        <button className={styles.primary} onClick={launch}>
          Try the example <ArrowRight size={16} />
        </button>
      </section>
      <div className={styles.tabs} role="tablist" aria-label="Practice mode">
        <button
          role="tab"
          aria-selected={mode === "technology"}
          onClick={() => setMode("technology")}
        >
          Technology questions
        </button>
        <button
          role="tab"
          aria-selected={mode === "experience"}
          onClick={() => setMode("experience")}
        >
          My experience
        </button>
      </div>
      {!live && (
        <p className={styles.muted}>
          Browse questions and prepare your stories here. Live transcription and
          AI feedback require a local setup; the example above works
          immediately.
        </p>
      )}
      {mode === "experience" ? (
        <Experiences onPractice={() => router.push("/session")} />
      ) : (
        <>
          <div className={styles.sectionHeading}>
            <h2>{topic ?? "Choose your starting point"}</h2>
            {topic ? (
              <button
                className={styles.secondary}
                onClick={() => setTopic(null)}
              >
                All topics
              </button>
            ) : (
              <span className={styles.muted}>
                12 questions · one thoughtful answer at a time
              </span>
            )}
          </div>
          {!topic ? (
            <div className={styles.grid}>
              {[
                {
                  name: "JavaScript" as const,
                  symbol: "JS",
                  text: "Explain the language behind the behaviour. Closures, async work and everyday trade-offs.",
                },
                {
                  name: "TypeScript" as const,
                  symbol: "TS",
                  text: "Make your reasoning explicit. Types, boundaries and the guarantees they can give.",
                },
                {
                  name: "React" as const,
                  symbol: "↗",
                  text: "Go beyond the happy path. State, rendering and keeping your interface in sync.",
                },
              ].map((item) => (
                <article key={item.name} className={styles.topicCard}>
                  <span className={styles.topicIcon}>{item.symbol}</span>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                  <button
                    className={styles.secondary}
                    onClick={() => setTopic(item.name)}
                  >
                    Explore {item.name} <ArrowRight size={14} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.list}>
              {questions
                .filter((q) => q.topic === topic)
                .map((q) => (
                  <article key={q.id} className={styles.listItem}>
                    <div>
                      <h3>{q.title}</h3>
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
                      Practise <ArrowRight size={14} />
                    </button>
                  </article>
                ))}
            </div>
          )}
        </>
      )}
      <p className={styles.bottomNote}>
        <ShieldCheck size={16} />
        Practice history is saved in this browser. Live AI sends answers and
        context to OpenAI. No account. No leaderboard.
      </p>
    </>
  );
}
