// @vitest-environment node
import { expect, it, vi, afterEach } from "vitest";
import { transcribeRequest } from "./transcription";
afterEach(() => vi.unstubAllEnvs());
it("rejects requests before reading audio when live AI is disabled", async () => {
  vi.stubEnv("AI_ENABLED", "false");
  const response = await transcribeRequest(
    new Request("http://localhost/api/transcription", {
      method: "POST",
      body: "not audio",
    }),
  );
  expect(response.status).toBe(403);
});
it("rejects an empty or unsupported audio upload", async () => {
  vi.stubEnv("AI_ENABLED", "true");
  const data = new FormData();
  data.append("file", new File(["hello"], "note.txt", { type: "text/plain" }));
  const response = await transcribeRequest(
    new Request("http://localhost/api/transcription", {
      method: "POST",
      body: data,
    }),
  );
  expect(response.status).toBe(400);
});
it("rejects oversized multipart bodies without trusting content-length", async () => {
  vi.stubEnv("AI_ENABLED", "true");
  const request = new Request("http://localhost/api/transcription", {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data; boundary=test" },
    body: new Uint8Array(12 * 1024 * 1024),
  });
  expect(request.headers.has("content-length")).toBe(false);
  const response = await transcribeRequest(request);
  expect(response.status).toBe(413);
});
