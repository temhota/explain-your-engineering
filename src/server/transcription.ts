import "server-only";
import { aiClient, errorResponse, liveGate, providerError } from "./http";
export async function transcribeRequest(request: Request): Promise<Response> {
  const gate = liveGate(request);
  if (gate) return gate;
  if (Number(request.headers.get("content-length") ?? 0) > 11 * 1024 * 1024)
    return errorResponse(413, "TOO_LARGE", "Keep recordings below 10 MB.");
  let form: FormData;
  try {
    if (!request.body)
      return errorResponse(400, "BAD_AUDIO", "Provide an audio file.");
    const reader = request.body.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 11 * 1024 * 1024) {
          await reader.cancel();
          return errorResponse(
            413,
            "TOO_LARGE",
            "Keep recordings below 10 MB.",
          );
        }
        chunks.push(new Uint8Array(value));
      }
    } finally {
      reader.releaseLock();
    }
    form = await new Response(new Blob(chunks), {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return errorResponse(400, "BAD_AUDIO", "Provide an audio file.");
  }
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    !file.size ||
    file.size > 10 * 1024 * 1024 ||
    ![
      "audio/webm",
      "audio/mp4",
      "audio/wav",
      "audio/mpeg",
      "audio/x-m4a",
    ].includes(file.type.split(";")[0])
  )
    return errorResponse(
      400,
      "BAD_AUDIO",
      "Provide a supported audio recording below 10 MB.",
    );
  try {
    const result = await aiClient().audio.transcriptions.create(
      {
        file,
        model: process.env.TRANSCRIPTION_MODEL ?? "gpt-4o-mini-transcribe",
        language: "en",
        prompt:
          "Technical interview. React, TypeScript, JavaScript, useEffect, useMemo, closures, promises, Zustand.",
      },
      { signal: request.signal },
    );
    if (!result.text?.trim())
      return errorResponse(
        422,
        "EMPTY_TRANSCRIPT",
        "No speech was recognised. Record again or type your answer.",
      );
    return Response.json({ text: result.text });
  } catch {
    return providerError();
  }
}
