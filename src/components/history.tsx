"use client";
import { useStartPractice } from "@/hooks/use-start-practice";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrainer } from "@/store/provider";
import { Review } from "./review";
import styles from "./trainer.module.css";
export function HistoryPanel() {
  const history = useTrainer((s) => s.history);
  const remove = useTrainer((s) => s.deleteAttempt);
  const start = useStartPractice();
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const attempt = history.find((item) => item.id === selected);
  return (
    <>
      <section className={styles.pageHeading}>
        <div>
          <h1>History</h1>
          <p>Review completed attempts or repeat a question.</p>
        </div>
      </section>
      {history.length === 0 ? (
        <section className={styles.empty}>
          <h2>No completed attempts</h2>
          <p>Finish a practice to save its answers and feedback here.</p>
          <Link className={styles.primary} href="/">
            Choose a practice
          </Link>
        </section>
      ) : (
        <div className={styles.list}>
          {history.map((item) => (
            <article key={item.id} className={styles.listItem}>
              <div>
                <h3>{item.context.title}</h3>
                <p>
                  {new Date(item.createdAt).toLocaleString("en-GB")} ·{" "}
                  {item.demo
                    ? "Scripted example"
                    : item.context.mode === "technology"
                      ? "Technology"
                      : "My experience"}
                </p>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.secondary}
                  onClick={() => setSelected(item.id)}
                >
                  Read review
                </button>
                <button
                  className={styles.secondary}
                  onClick={() => {
                    if (start(item.context, item.demo)) router.push("/session");
                  }}
                >
                  Repeat
                </button>
                <button
                  className={styles.secondary}
                  onClick={() => {
                    if (window.confirm("Delete this saved attempt?"))
                      remove(item.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {attempt && <Review session={attempt} />}
    </>
  );
}
