"use client";
import {
  Alert,
  Button,
  Collapse,
  Empty,
  Form,
  Input,
  List,
  Space,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useStartPractice } from "@/hooks/use-start-practice";
import { useConfirm } from "@/hooks/use-confirm";
import { useState } from "react";
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
export function Experiences({ onPractice }: { onPractice: () => void }) {
  const cards = useTrainer((s) => s.experiences);
  const save = useTrainer((s) => s.saveExperience);
  const remove = useTrainer((s) => s.deleteExperience);
  const start = useStartPractice();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Experience | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <div className={styles.sectionHeading}>
        <div>
          <Typography.Title level={4}>Your experience</Typography.Title>
          <Typography.Text type="secondary">
            Save a technical decision to practise explaining. Omit confidential
            details.
          </Typography.Text>
        </div>
        {!draft && (
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setDraft({ ...empty, id: crypto.randomUUID() });
              setError(null);
            }}
          >
            Add a story
          </Button>
        )}
      </div>
      {draft && (
        <Form
          key={draft.id}
          layout="vertical"
          className={styles.form}
          initialValues={draft}
          disabled={saving}
          onFinish={async (values) => {
            setSaving(true);
            setError(null);
            try {
              await save({ ...draft, ...values });
              setDraft(null);
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Could not save this story.",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <Typography.Title level={4}>
            {cards.some((c) => c.id === draft.id)
              ? "Edit your story"
              : "New experience"}
          </Typography.Title>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Give this experience a title.",
              },
            ]}
          >
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item label="Your decision" name="decision">
            <Input.TextArea rows={4} maxLength={4000} />
          </Form.Item>
          <Collapse
            className={styles.details}
            items={[
              {
                key: "context",
                label: "Add context, role or outcome (optional)",
                children: (
                  <>
                    <Form.Item label="Situation" name="context">
                      <Input.TextArea rows={2} maxLength={4000} />
                    </Form.Item>
                    <Form.Item label="Your role" name="role">
                      <Input.TextArea rows={2} maxLength={2000} />
                    </Form.Item>
                    <Form.Item label="Constraints" name="constraints">
                      <Input.TextArea rows={2} maxLength={2000} />
                    </Form.Item>
                    <Form.Item label="Outcome (optional)" name="result">
                      <Input.TextArea rows={2} maxLength={2000} />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              {saving ? "Saving…" : "Save story"}
            </Button>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
          </Space>
          {error && (
            <Alert
              className={styles.notice}
              type="error"
              showIcon
              title={error}
            />
          )}
        </Form>
      )}
      {cards.length > 0 && (
        <List
          dataSource={cards}
          rowKey="id"
          renderItem={(card) => (
            <List.Item
              className={styles.listItem}
              extra={
                <Space wrap>
                  <Button
                    disabled={saving}
                    type="primary"
                    onClick={async () => {
                      if (
                        await start(
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
                    Practise
                  </Button>
                  <Button
                    disabled={saving}
                    onClick={() => {
                      setDraft({ ...card });
                      setError(null);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    disabled={saving}
                    onClick={async () => {
                      if (
                        await confirm(
                          "Delete this story?",
                          "Saved attempts keep their own copy.",
                          "Delete story",
                        )
                      )
                        remove(card.id);
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              }
            >
              <List.Item.Meta
                title={card.title}
                description={card.role || "Your engineering experience"}
              />
            </List.Item>
          )}
        />
      )}
      {!cards.length && !draft && (
        <Empty description="No experience saved yet" />
      )}
    </>
  );
}
