import { test, expect, type Page } from "@playwright/test";
async function provider(page: Page) {
  await page.route("**/api/follow-up", async (route) => {
    expect(route.request().postDataJSON().answer1).toBe(
      "I keep derived values out of state.",
    );
    await route.fulfill({
      json: { question: "What trade-off did that introduce?" },
    });
  });
  await page.route("**/api/feedback", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.answer2).toBe("I measure the cost before optimizing.");
    await route.fulfill({
      json: {
        feedback: {
          communication: [
            {
              kind: "strength",
              answer: 1,
              quote: "I keep derived values",
              observation: "Your decision is explicit.",
              action: "Give one concrete example.",
              sourceIds: [],
            },
          ],
          technical: [
            {
              kind: "gap",
              answer: 2,
              quote: "I measure the cost",
              observation: "Name the measurement.",
              action: "Explain render duration.",
              sourceIds: [],
            },
          ],
        },
      },
    });
  });
}
async function complete(page: Page) {
  await page
    .getByLabel("Explain your thinking in English")
    .fill("I keep derived values out of state.");
  await page.getByRole("button", { name: "Confirm answer" }).click();
  await page.getByRole("button", { name: "Get follow-up" }).click();
  await expect(
    page.getByRole("heading", { name: "What trade-off did that introduce?" }),
  ).toBeVisible();
  await page
    .getByLabel("Explain your thinking in English")
    .fill("I measure the cost before optimizing.");
  await page.getByRole("button", { name: "Confirm answer" }).click();
  await page.getByRole("button", { name: "Review my answers" }).click();
  await expect(
    page.getByRole("heading", { name: "Communication", exact: true }),
  ).toBeVisible();
}
test("public example completes and persists without API calls", async ({
  page,
}) => {
  let apiCalls = 0;
  page.on("request", (request) => {
    if (request.url().includes("/api/")) apiCalls++;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Try the example" }).click();
  await page.getByRole("button", { name: "Use example answer" }).click();
  await page.getByRole("button", { name: "Confirm answer" }).click();
  await page.getByRole("button", { name: "Show follow-up" }).click();
  await page.getByRole("button", { name: "Use example answer" }).click();
  await page.getByRole("button", { name: "Confirm answer" }).click();
  await page.getByRole("button", { name: "Show example review" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your debrief" }),
  ).toBeVisible();
  expect(apiCalls).toBe(0);
  expect(errors).toEqual([]);
});
test("technology practice completes with a deterministic provider and repeats independently", async ({
  page,
}) => {
  await provider(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore React", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Practise", exact: true })
    .first()
    .click();
  await complete(page);
  await page.getByRole("link", { name: "View history" }).click();
  await expect(page.getByRole("button", { name: "Read review" })).toHaveCount(
    1,
  );
  await page.getByRole("button", { name: "Repeat", exact: true }).click();
  await expect(page.getByLabel("Explain your thinking in English")).toHaveValue(
    "",
  );
});
test("personal story survives reload and completes an experience interview", async ({
  page,
}) => {
  await provider(page);
  await page.goto("/");
  await page.getByRole("tab", { name: "My experience" }).click();
  await page.getByRole("button", { name: "Add a story" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Offline drafts");
  await page
    .getByLabel("Your decision", { exact: true })
    .fill("Save drafts locally.");
  await page.getByRole("button", { name: "Save story" }).click();
  await page.reload();
  await page.getByRole("tab", { name: "My experience" }).click();
  await expect(
    page.getByRole("heading", { name: "Offline drafts" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Practise", exact: true }).click();
  await complete(page);
});
test("disabled endpoints reject direct requests", async ({ request }) => {
  for (const operation of ["feedback", "follow-up", "transcription"])
    expect(
      (await request.post(`/api/${operation}`, { data: {} })).status(),
    ).toBe(403);
});
test("failed requests preserve answers and can be retried", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore JavaScript" }).click();
  await page
    .getByRole("button", { name: "Practise", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Explain your thinking in English")
    .fill("A closure keeps access to lexical bindings.");
  await page.getByRole("button", { name: "Confirm answer" }).click();
  await page.getByRole("button", { name: "Get follow-up" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Live AI is disabled" }),
  ).toBeVisible();
  await expect(page.getByLabel("Explain your thinking in English")).toHaveValue(
    "A closure keeps access to lexical bindings.",
  );
  await expect(
    page.getByRole("button", { name: "Get follow-up" }),
  ).toBeEnabled();
});
test("records browser audio for playback", async ({ page, browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Synthetic microphone provided by Chromium only; actual Safari microphone requires a manual device check.",
  );
  await page.addInitScript(() => {
    // A real synthetic MediaStream avoids dependence on the host microphone service.
    // MediaRecorder, timing, blob creation and playback remain browser-native.
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        // Chromium's generator supplies real samples without a host audio device.
        const Generator = (
          window as unknown as {
            MediaStreamTrackGenerator: new (options: {
              kind: string;
            }) => MediaStreamTrack & { writable: WritableStream };
          }
        ).MediaStreamTrackGenerator;
        const AudioFrame = (
          window as unknown as {
            AudioData: new (options: object) => { close: () => void };
          }
        ).AudioData;
        const track = new Generator({ kind: "audio" });
        const writer = track.writable.getWriter();
        let frame = 0;
        const timer = setInterval(() => {
          const samples = Float32Array.from(
            { length: 960 },
            (_, i) =>
              Math.sin(((frame * 960 + i) * 2 * Math.PI * 440) / 48000) * 0.1,
          );
          const data = new AudioFrame({
            format: "f32",
            sampleRate: 48000,
            numberOfFrames: 960,
            numberOfChannels: 1,
            timestamp: frame++ * 20000,
            data: samples,
          });
          void writer.write(data).finally(() => data.close());
        }, 20);
        const stop = track.stop.bind(track);
        track.stop = () => {
          clearInterval(timer);
          stop();
          void writer.close();
        };
        return new MediaStream([track]);
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore React", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Practise", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Record an answer" }).click();
  await expect(page.getByRole("button", { name: /Stop ·/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Stop · [1-9]/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Stop ·/ }).click();
  await expect(page.getByLabel("Your recorded answer")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Transcribe recording" }),
  ).toBeEnabled();
});

test("a stale tab cannot overwrite a newer saved answer", async ({
  context,
  page,
}) => {
  const other = await context.newPage();
  for (const tab of [page, other]) {
    await tab.goto("/");
    await tab.getByRole("button", { name: "Try the example" }).waitFor();
  }
  await page.getByRole("button", { name: "Try the example" }).click();
  await page.getByRole("button", { name: "Use example answer" }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("eye-practice")!).state.session
            ?.answer1,
      ),
    )
    .toContain("derive");
  await other.getByRole("button", { name: "Try the example" }).click();
  await expect(
    other.getByRole("alert").filter({ hasText: "another tab" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Read the example response")).not.toHaveValue(
    "",
  );
});
