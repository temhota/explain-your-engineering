"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Alert } from "antd";
import { AudioOutlined, StopOutlined } from "@ant-design/icons";
import { useRecorder } from "@/hooks/use-recorder";
import styles from "./trainer.module.css";
export function Recorder({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void;
  disabled: boolean;
}) {
  const recorder = useRecorder();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const latestTranscript = useRef(onTranscript);
  useEffect(() => {
    latestTranscript.current = onTranscript;
  }, [onTranscript]);
  useEffect(() => () => controller.current?.abort(), []);
  async function transcribe() {
    if (!recorder.blob) return;
    setPending(true);
    setError(null);
    const abort = new AbortController();
    controller.current = abort;
    const data = new FormData();
    data.append(
      "file",
      recorder.blob,
      recorder.blob.type.includes("mp4") ? "answer.mp4" : "answer.webm",
    );
    try {
      const response = await fetch("/api/transcription", {
        method: "POST",
        body: data,
        signal: abort.signal,
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message ?? "Transcription failed.");
      if (!abort.signal.aborted) latestTranscript.current(body.text);
    } catch (e) {
      if (!abort.signal.aborted)
        setError(e instanceof Error ? e.message : "Transcription failed.");
    } finally {
      if (!abort.signal.aborted) setPending(false);
    }
  }
  return (
    <div className={styles.recording}>
      {recorder.status === "recording" ? (
        <Button onClick={recorder.stop}>
          <StopOutlined />
          Stop · {recorder.seconds}s / 180s
        </Button>
      ) : (
        <Button
          disabled={disabled || pending || recorder.status === "requesting"}
          onClick={() => void recorder.start()}
        >
          <AudioOutlined />
          {recorder.status === "requesting"
            ? "Waiting for microphone…"
            : recorder.blob
              ? "Record again"
              : "Record an answer"}
        </Button>
      )}
      {recorder.url && (
        <audio controls src={recorder.url} aria-label="Your recorded answer" />
      )}
      {recorder.blob && (
        <Button
          disabled={pending || disabled}
          onClick={() => void transcribe()}
        >
          {pending ? "Transcribing…" : "Transcribe recording"}
        </Button>
      )}
      {pending && (
        <Button
          onClick={() => {
            controller.current?.abort();
            setPending(false);
          }}
        >
          Cancel transcription
        </Button>
      )}
      <p className={styles.muted}>
        Up to 3 minutes. Transcribe sends audio to OpenAI. Review the text
        before confirming.
      </p>
      {(error || recorder.error) && (
        <Alert type="error" showIcon title={error || recorder.error} />
      )}
    </div>
  );
}
