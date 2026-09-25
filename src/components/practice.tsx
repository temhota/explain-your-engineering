"use client";
import Link from "next/link";
import { Alert, Button, List, Radio, Tabs, Tag, Typography } from "antd";
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
  const [mode, setMode] = useState("technology");
  const [topic, setTopic] = useState<Topic | "All">("All");
  const session = useTrainer((s) => s.session);
  const start = useStartPractice();
  const router = useRouter();
  return (
    <>
      <header className={styles.pageHeading}>
        <div>
          <Typography.Title level={2}>Practice</Typography.Title>
          <Typography.Text type="secondary">
            Choose a question and explain your reasoning in English.
          </Typography.Text>
        </div>
        <Button
          onClick={async () => {
            if (await start(demoContext, true)) router.push("/session");
          }}
        >
          Try the example
        </Button>
      </header>
      {session && session.stage !== "complete" && (
        <Alert
          className={styles.notice}
          showIcon
          type="info"
          title={
            <>
              Unfinished practice: {session.context.title}.{" "}
              <Link href="/session">Continue your answer</Link>
            </>
          }
        />
      )}
      <Tabs
        activeKey={mode}
        onChange={setMode}
        items={[
          { key: "technology", label: "Technology questions" },
          { key: "experience", label: "My experience" },
        ]}
      />
      {!live && (
        <Alert
          className={styles.notice}
          type="info"
          showIcon
          title="Text practice only here"
          description="Recording and AI feedback require a local API setup. The example includes a prepared review."
        />
      )}
      {mode === "experience" ? (
        <Experiences onPractice={() => router.push("/session")} />
      ) : (
        <>
          <Radio.Group
            className={styles.filter}
            aria-label="Technology"
            optionType="button"
            buttonStyle="solid"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            options={["All", "JavaScript", "TypeScript", "React"]}
          />
          <List
            dataSource={questions.filter(
              (q) => topic === "All" || q.topic === topic,
            )}
            rowKey="id"
            renderItem={(q) => (
              <List.Item
                className={styles.listItem}
                extra={
                  <Button
                    onClick={async () => {
                      if (
                        await start(
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
                  </Button>
                }
              >
                <List.Item.Meta
                  title={
                    <>
                      <Tag>{q.topic}</Tag>
                      <Typography.Text strong>{q.title}</Typography.Text>
                    </>
                  }
                  description={q.question}
                />
              </List.Item>
            )}
          />
        </>
      )}
    </>
  );
}
