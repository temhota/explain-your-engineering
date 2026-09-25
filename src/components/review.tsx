import type { Session } from "@/lib/domain";
import { sources as sourceLinks } from "@/lib/questions";
import styles from "./trainer.module.css";
export function Review({ session }: { session: Session }) {
  if (!session.feedback) return null;
  return (
    <div className={styles.review}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>Feedback</h2>
        </div>
        <span className={styles.pill}>
          {session.demo ? "Example review" : "AI-assisted review"}
        </span>
      </div>
      <p className={styles.muted}>
        Check technical claims against the sources. This feedback is for
        practice.
      </p>
      <div className={styles.reviewGrid}>
        {(["communication", "technical"] as const).map((section) => (
          <section className={styles.card} key={section}>
            <h2>
              {section === "communication"
                ? "Communication"
                : "Technical reasoning"}
            </h2>
            {session.feedback![section].map((item, i) => (
              <article className={styles.observation} key={i}>
                <span className={styles.eyebrow}>
                  {item.kind === "strength"
                    ? "Working well"
                    : item.kind === "gap"
                      ? "Try next time"
                      : "Worth checking"}
                </span>
                <blockquote>
                  “{item.quote}” <small>— answer {item.answer}</small>
                </blockquote>
                <p>{item.observation}</p>
                <p>
                  <strong>Next step:</strong> {item.action}
                </p>
                {item.sourceIds.map((id) =>
                  sourceLinks[id] ? (
                    <a
                      key={id}
                      href={sourceLinks[id].url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {sourceLinks[id].title} ↗
                    </a>
                  ) : null,
                )}
              </article>
            ))}
            {session.feedback![section].length === 0 && (
              <p>No specific observations for this section.</p>
            )}
          </section>
        ))}
      </div>
      <details className={styles.card}>
        <summary>Read your answers</summary>
        <h3>{session.context.question}</h3>
        <p className={styles.transcript}>{session.answer1}</p>
        <h3>{session.followUp}</h3>
        <p className={styles.transcript}>{session.answer2}</p>
      </details>
    </div>
  );
}
