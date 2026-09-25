"use client";
import { useStartPractice } from "@/hooks/use-start-practice";
import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { useTrainer } from "@/store/provider";
import type { Experience } from "@/lib/domain";
import styles from "./trainer.module.css";
const empty: Experience = {
  id: "",
  title: "",
  context: "",
  role: "",
  constraints: "",
  decision: "",
  result: "",
};
const fields = [
  ["title", "Title", 120],
  ["context", "Situation", 4000],
  ["role", "Your role", 2000],
  ["constraints", "Constraints", 2000],
  ["decision", "Your decision", 4000],
  ["result", "Outcome (optional)", 2000],
] as const;
export function Experiences({ onPractice }: { onPractice: () => void }) {
  const cards = useTrainer((s) => s.experiences);
  const save = useTrainer((s) => s.saveExperience);
  const remove = useTrainer((s) => s.deleteExperience);
  const start = useStartPractice();
  const [draft, setDraft] = useState<Experience | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <div className={styles.sectionHeading}>
        <div>
          <h2>Your experience</h2>
          <p className={styles.muted}>
            Save a technical decision to practise explaining. Omit confidential
            details.
          </p>
        </div>
        <button
          disabled={saving}
          className={styles.secondary}
          onClick={() => {
            setDraft({ ...empty, id: crypto.randomUUID() });
            setError(null);
          }}
        >
          <Plus size={15} />
          Add a story
        </button>
      </div>
      {draft && (
        <form
          className={`${styles.card} ${styles.form}`}
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setError(null);
            try {
              await save(draft);
              setDraft(null);
            } catch (error) {
              setError(
                error instanceof Error && !error.message.startsWith("[")
                  ? error.message
                  : "Add a title and keep each field within its character limit.",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <h2>
            {cards.some((c) => c.id === draft.id)
              ? "Edit your story"
              : "New experience"}
          </h2>
          {fields
            .filter(([field]) => field === "title" || field === "decision")
            .map(([field, label, limit]) => (
              <label key={field}>
                {label}
                {field === "title" ? (
                  <input
                    disabled={saving}
                    required
                    value={draft[field]}
                    maxLength={limit}
                    onChange={(e) =>
                      setDraft({ ...draft, [field]: e.target.value })
                    }
                  />
                ) : (
                  <textarea
                    disabled={saving}
                    rows={3}
                    value={draft[field]}
                    maxLength={limit}
                    onChange={(e) =>
                      setDraft({ ...draft, [field]: e.target.value })
                    }
                  />
                )}
              </label>
            ))}
          <details className={styles.formDetails} key={draft.id}>
            <summary>Add context, role or outcome (optional)</summary>
            {fields
              .filter(([field]) => field !== "title" && field !== "decision")
              .map(([field, label, limit]) => (
                <label key={field}>
                  {label}
                  {field === "title" ? (
                    <input
                      disabled={saving}
                      required
                      value={draft[field]}
                      maxLength={limit}
                      onChange={(e) =>
                        setDraft({ ...draft, [field]: e.target.value })
                      }
                    />
                  ) : (
                    <textarea
                      disabled={saving}
                      rows={3}
                      value={draft[field]}
                      maxLength={limit}
                      onChange={(e) =>
                        setDraft({ ...draft, [field]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
          </details>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save story"}
            </button>
            <button
              disabled={saving}
              className={styles.secondary}
              type="button"
              onClick={() => setDraft(null)}
            >
              Cancel
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
      <div className={styles.list}>
        {cards.map((card) => (
          <article className={styles.listItem} key={card.id}>
            <div>
              <h3>{card.title}</h3>
              <p>{card.role || "Your engineering experience"}</p>
            </div>
            <div className={styles.actions}>
              <button
                disabled={saving}
                className={styles.primary}
                onClick={() => {
                  if (
                    start(
                      {
                        mode: "experience",
                        title: card.title,
                        question: `Walk me through a technical decision you made while working on ${card.title}. Explain your role, the alternatives and the trade-off.`,
                        experience: card,
                      },
                      false,
                    )
                  )
                    onPractice();
                }}
              >
                Practise <ArrowRight size={14} />
              </button>
              <button
                disabled={saving}
                className={styles.secondary}
                onClick={() => setDraft({ ...card })}
              >
                Edit
              </button>
              <button
                disabled={saving}
                className={styles.secondary}
                onClick={() => {
                  if (
                    window.confirm(
                      "Delete this story? Saved attempts keep their own copy.",
                    )
                  )
                    remove(card.id);
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {!cards.length && !draft && (
        <div className={styles.card}>
          <h3>Start with one decision you remember.</h3>
          <p>
            A performance trade-off, an API integration, or a bug you traced to
            its cause. You don’t need a dramatic story or invented metrics.
          </p>
        </div>
      )}
    </>
  );
}
