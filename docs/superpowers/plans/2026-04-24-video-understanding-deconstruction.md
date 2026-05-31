# Video Understanding Deconstruction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add async real video-understanding deconstruction to Agent Playground with local file upload, URL import, task polling, and structured output.

**Architecture:** Keep the old record-based deconstruction endpoint untouched and add a new async task pipeline under the same video deconstruction controller. Store temporary media files locally, extract frames/audio with ffmpeg, analyze with a replaceable provider abstraction, and poll task snapshots from the frontend until terminal state.

**Tech Stack:** Java 21, Spring Boot Web, JUnit 5, React 19, TypeScript, Vite, fetch, ffmpeg/ffprobe, OpenAI-compatible HTTP APIs.

---

## File map

- Create: `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/2026-04-24-video-understanding-deconstruction-design.md`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/plans/2026-04-24-video-understanding-deconstruction.md`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/VideoDeconstructionFeign.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/VideoDeconstructionSubmitUrlCmd.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoDeconstructionTaskDTO.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/VideoDeconstructionTaskGetQry.java`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/controller/VideoDeconstructionController.java`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoDeconstructionCmdExecutor.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoDeconstructionTaskQryExecutor.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoUnderstandingTaskAppService.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/LocalTempVideoStorageService.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/FfmpegVideoPreprocessor.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/VideoUnderstandingAnalyzer.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/OpenAIVideoUnderstandingAnalyzer.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/VideoUnderstandingTaskRegistry.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoUnderstandingTaskAppServiceTest.java`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/infrastructure/service/LocalTempVideoStorageServiceTest.java`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentApi.ts`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.ts`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.test.ts`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentPlayground.tsx`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/styles/index.css`

### Task 1: Add failing backend task lifecycle tests

**Files:**
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoUnderstandingTaskAppServiceTest.java`

- [ ] Write a failing test for async submit → running → succeeded using a manual executor and fake analyzer.
- [ ] Run `mvn test -pl marketing-person-infrastructure -Dtest=VideoUnderstandingTaskAppServiceTest` and observe failure.
- [ ] Implement the minimal task registry and app service pieces needed to pass.
- [ ] Re-run the same test and confirm pass.

### Task 2: Add failing backend local storage test

**Files:**
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/infrastructure/service/LocalTempVideoStorageServiceTest.java`

- [ ] Write a failing test proving uploaded files are copied into a task-local temp directory.
- [ ] Run `mvn test -pl marketing-person-infrastructure -Dtest=LocalTempVideoStorageServiceTest` and observe failure.
- [ ] Implement the minimal local temp storage service.
- [ ] Re-run the same test and confirm pass.

### Task 3: Add API surface and controller/executor wiring

**Files:**
- Modify client/interface/controller/executor files listed above.

- [ ] Write or extend failing tests for submit/get DTO mapping.
- [ ] Run targeted backend tests and confirm failure.
- [ ] Add upload/url/get endpoints plus DTOs/cmds/qrys.
- [ ] Re-run targeted tests and confirm pass.

### Task 4: Implement media preprocessing and provider abstraction

**Files:**
- Create preprocessor / analyzer files listed above.

- [ ] Add a failing test around app service progress updates or fake prepared assets usage.
- [ ] Run targeted backend tests and confirm failure.
- [ ] Implement ffprobe/ffmpeg orchestration, prepared asset model, and replaceable analyzer abstraction.
- [ ] Re-run targeted backend tests and confirm pass.

### Task 5: Update frontend workflow A for async upload/url flow

**Files:**
- Modify frontend files listed above.

- [ ] Extend `agentPlaygroundApi.test.ts` with a failing test for async task polling.
- [ ] Run `npm test -- agentPlaygroundApi.test.ts` and observe failure.
- [ ] Implement upload/url submit helpers, polling logic, and workflow A UI changes.
- [ ] Re-run `npm test -- agentPlaygroundApi.test.ts agentPlaygroundHistory.test.ts` and confirm pass.

### Task 6: Full verification

**Files:**
- No new files.

- [ ] Run `mvn test -pl marketing-person-infrastructure -Dtest=VideoUnderstandingTaskAppServiceTest,LocalTempVideoStorageServiceTest,VideoKnowledgeBuildAppServiceTest`.
- [ ] Run `npm test -- agentPlaygroundApi.test.ts agentPlaygroundHistory.test.ts`.
- [ ] Run `npm run build` in `/Users/any/Documents/code/beukay/marketing-person-center/frontend`.
- [ ] If all pass, summarize implementation boundaries and any known runtime prerequisites (OpenAI key, ffmpeg in PATH).
