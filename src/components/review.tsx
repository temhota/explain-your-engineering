"use client";
import { Card, Collapse, Space, Tag, Typography } from "antd";
import type { Session } from "@/lib/domain";
import { sources } from "@/lib/questions";
import styles from "./trainer.module.css";
export function Review({ session }: { session: Session }) {
  if (!session.feedback) return null;
  return (
    <div className={styles.review}>
      <div className={styles.sectionHeading}>
        <Typography.Title level={2}>Feedback</Typography.Title>
        <Tag>{session.demo ? "Example review" : "AI-assisted review"}</Tag>
      </div>
      <Typography.Paragraph type="secondary">
        Check technical claims against the sources. This feedback is for
        practice.
      </Typography.Paragraph>
      <Space orientation="vertical" size="large" className={styles.fullWidth}>
        {(["communication", "technical"] as const).map((section) => (
          <Card
            key={section}
            title={
              <h3>
                {section === "communication"
                  ? "Communication"
                  : "Technical reasoning"}
              </h3>
            }
          >
            {session.feedback![section].map((item, i) => (
              <article className={styles.observation} key={i}>
                <Tag
                  color={
                    item.kind === "strength"
                      ? "success"
                      : item.kind === "gap"
                        ? "warning"
                        : "processing"
                  }
                >
                  {item.kind === "strength"
                    ? "Working well"
                    : item.kind === "gap"
                      ? "Try next time"
                      : "Worth checking"}
                </Tag>
                <blockquote>
                  “{item.quote}”{" "}
                  <Typography.Text type="secondary">
                    — answer {item.answer}
                  </Typography.Text>
                </blockquote>
                <Typography.Paragraph>{item.observation}</Typography.Paragraph>
                <Typography.Paragraph>
                  <strong>Next step:</strong> {item.action}
                </Typography.Paragraph>
                <Space wrap>
                  {item.sourceIds.map((id) =>
                    sources[id] ? (
                      <Typography.Link
                        key={id}
                        href={sources[id].url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {sources[id].title}
                      </Typography.Link>
                    ) : null,
                  )}
                </Space>
              </article>
            ))}
            {!session.feedback![section].length && (
              <Typography.Text type="secondary">
                No specific observations for this section.
              </Typography.Text>
            )}
          </Card>
        ))}
      </Space>
      <Collapse
        className={styles.details}
        items={[
          {
            key: "answers",
            label: "Read your answers",
            children: (
              <>
                <Typography.Title level={5}>
                  {session.context.question}
                </Typography.Title>
                <p className={styles.transcript}>{session.answer1}</p>
                <Typography.Title level={5}>
                  {session.followUp}
                </Typography.Title>
                <p className={styles.transcript}>{session.answer2}</p>
              </>
            ),
          },
        ]}
      />
    </div>
  );
}
