"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
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
      if (!abort.signal.aborted) onTranscript(body.text);
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
        <button className={styles.secondary} onClick={recorder.stop}>
          <Square size={15} />
          Stop · {recorder.seconds}s / 180s
        </button>
      ) : (
        <button
          className={styles.secondary}
          disabled={disabled || pending || recorder.status === "requesting"}
          onClick={() => void recorder.start()}
        >
          <Mic size={16} />
          {recorder.status === "requesting"
            ? "Waiting for microphone…"
            : recorder.blob
              ? "Record again"
              : "Record an answer"}
        </button>
      )}
      {recorder.url && (
        <audio controls src={recorder.url} aria-label="Your recorded answer" />
      )}
      {recorder.blob && (
        <button
          className={styles.secondary}
          disabled={pending || disabled}
          onClick={() => void transcribe()}
        >
          {pending ? "Transcribing…" : "Transcribe recording"}
        </button>
      )}
      {pending && (
        <button
          className={styles.secondary}
          onClick={() => {
            controller.current?.abort();
            setPending(false);
          }}
        >
          Cancel transcription
        </button>
      )}
      <p className={styles.muted}>
        Recording stays in this tab. Transcribe sends audio to OpenAI;
        confirming an answer lets you request AI analysis. Review the text
        before continuing.
      </p>
      {(error || recorder.error) && (
        <p role="alert" className={styles.error}>
          {error || recorder.error}
        </p>
      )}
    </div>
  );
}
