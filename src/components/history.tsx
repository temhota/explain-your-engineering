"use client";
import { Button, Empty, List, Space, Typography } from "antd";
import { useStartPractice } from "@/hooks/use-start-practice";
import { useConfirm } from "@/hooks/use-confirm";
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
  const confirm = useConfirm();
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const attempt = history.find((item) => item.id === selected);
  return (
    <>
      <header className={styles.pageHeading}>
        <div>
          <Typography.Title level={2}>History</Typography.Title>
          <Typography.Text type="secondary">
            Review completed attempts or repeat a question.
          </Typography.Text>
        </div>
      </header>
      {!history.length ? (
        <Empty description="No completed attempts">
          <Link href="/">Choose a practice</Link>
        </Empty>
      ) : (
        <List
          dataSource={history}
          rowKey="id"
          renderItem={(item) => (
            <List.Item
              className={styles.listItem}
              extra={
                <Space wrap>
                  <Button onClick={() => setSelected(item.id)}>
                    Read review
                  </Button>
                  <Button
                    onClick={async () => {
                      if (await start(item.context, item.demo))
                        router.push("/session");
                    }}
                  >
                    Repeat
                  </Button>
                  <Button
                    danger
                    onClick={async () => {
                      if (
                        await confirm(
                          "Delete this attempt?",
                          "Its saved answers and review will be removed.",
                          "Delete attempt",
                        )
                      )
                        remove(item.id);
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              }
            >
              <List.Item.Meta
                title={item.context.title}
                description={`${new Date(item.createdAt).toLocaleString("en-GB")} · ${item.demo ? "Scripted example" : item.context.mode === "technology" ? "Technology" : "My experience"}`}
              />
            </List.Item>
          )}
        />
      )}
      {attempt && <Review session={attempt} />}
    </>
  );
}
