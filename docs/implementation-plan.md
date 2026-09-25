# Explain Your Engineering implementation plan

Spec: design.md. Approved Next.js/Zustand plan. Implementation proceeds in stages with review before merging. Stage branches are stacked until user review; no automatic merge to main.

## Task 1: Text practice foundation
Create per-provider Zustand store, explicit session transitions, client shell and deterministic fictional demonstration. Verify isolation, invalid transitions, stale results and the full text flow.
## Task 2: Audio and transcription
Browser recorder hook, cleanup, three-minute limit, MIME negotiation, editable transcription, server upload route. Verify denial, cleanup and failures without losing text.
## Task 3: Topics, experience and persistence
Twelve source-backed technology questions, experience CRUD, snapshots, guarded versioned storage, post-mount hydration. Verify reload, invalid data, storage failure and independent history.
## Task 4: AI follow-up and feedback
Server-only provider, input validation, editorial criteria, quote and source validation. Verify disabled endpoints, malformed output and actual local API when a key is available.
## Task 5: History and resilience
Repeat, delete, review, accessible responsive UI, cancellation. Verify E2E text flows, error recovery and keyboard use.
## Task 6: Delivery
CI, English README, architecture notes, screenshots, walkthrough video, public demo with AI disabled. Fresh review; do not claim live API or Safari verification without evidence.
