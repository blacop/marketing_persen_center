# Agent Playground V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Agent Playground page for real video deconstruction and content structure card generation, with raw JSON, logic trace, and local history.

**Architecture:** Add a new route and page that uses a small frontend adapter layer to call existing backend APIs and normalize their results into one execution shape. Keep workflow-specific parsing in the adapter, keep local history in `localStorage`, and keep the page UI focused on three columns: workflow list, input form, and result panel.

**Tech Stack:** React 19, TypeScript, React Router, existing fetch-based API client, localStorage, Vite.

---

## File map

- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/2026-04-24-agent-playground-design.md`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/App.tsx`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/components/Layout.tsx`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentApi.ts`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.ts`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundHistory.ts`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentPlayground.tsx`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/styles/index.css`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/package.json`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.test.ts`
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundHistory.test.ts`

### Task 1: Extend spec and add API surface for playground workflows

**Files:**
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/2026-04-24-agent-playground-design.md`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentApi.ts`
- Test: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { extractTracePayload } from './agentPlaygroundApi'

describe('extractTracePayload', () => {
  it('parses deconstructionJson into trace payload', () => {
    expect(extractTracePayload('{"step":"parsed"}')).toEqual({ step: 'parsed' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- agentPlaygroundApi.test.ts`
Expected: FAIL because test runner or module/function is missing.

- [ ] **Step 3: Write minimal implementation**

Add playground-facing API types to `agentApi.ts`, including video deconstruction request/response types and content structure card request/response types. Create `extractTracePayload` in `agentPlaygroundApi.ts` with JSON parse fallback to raw string or `null`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- agentPlaygroundApi.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-04-24-agent-playground-design.md frontend/src/lib/agentApi.ts frontend/src/lib/agentPlaygroundApi.ts frontend/src/lib/agentPlaygroundApi.test.ts frontend/package.json package-lock.json
git commit -m "feat: add playground api adapters"
```

### Task 2: Add local history storage with bounded retention

**Files:**
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundHistory.ts`
- Test: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundHistory.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { appendPlaygroundHistory } from './agentPlaygroundHistory'

describe('appendPlaygroundHistory', () => {
  it('keeps only the newest 50 history records', () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      id: String(i),
      workflow: 'video-deconstruction' as const,
      createdAt: new Date(2026, 3, 24, 0, i).toISOString(),
      status: 'success' as const,
      durationMs: i,
      requestPayload: { i },
    }))

    const result = items.reduce((acc, item) => appendPlaygroundHistory(acc, item), [] as typeof items)
    expect(result).toHaveLength(50)
    expect(result[0].id).toBe('50')
    expect(result.at(-1)?.id).toBe('1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- agentPlaygroundHistory.test.ts`
Expected: FAIL because helper does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement pure helpers for append/load/save/clear around `marketing-person-center.agent-playground.history.v1`, with parse failure fallback to empty array and max length 50.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- agentPlaygroundHistory.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/agentPlaygroundHistory.ts frontend/src/lib/agentPlaygroundHistory.test.ts
git commit -m "feat: add playground local history store"
```

### Task 3: Build adapter layer for real workflows

**Files:**
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.ts`
- Test: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from 'vitest'
import { createPlaygroundApi } from './agentPlaygroundApi'

describe('runContentStructureCard', () => {
  it('maps logicTrace into tracePayload', async () => {
    const api = createPlaygroundApi({
      generateContentStructureCard: vi.fn().mockResolvedValue({
        cardId: 'csc-1',
        cardJson: '{"openingHook":"hello"}',
        logicTrace: '{"selectedKnowledgeId":"k-1"}',
      }),
      deconstructVideo: vi.fn(),
    })

    const result = await api.runContentStructureCard({ skuId: 'SEED_CUSHION_2' })
    expect(result.tracePayload).toEqual({ selectedKnowledgeId: 'k-1' })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- agentPlaygroundApi.test.ts`
Expected: FAIL because adapter factory or methods are incomplete.

- [ ] **Step 3: Write minimal implementation**

Implement `createPlaygroundApi`, `runVideoDeconstruction`, and `runContentStructureCard`, measuring duration, normalizing request/response shape, and setting `tracePayload` according to spec.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- agentPlaygroundApi.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/agentPlaygroundApi.ts frontend/src/lib/agentPlaygroundApi.test.ts frontend/src/lib/agentApi.ts
git commit -m "feat: add real workflow playground adapters"
```

### Task 4: Add the Agent Playground page and route

**Files:**
- Create: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentPlayground.tsx`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/App.tsx`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/components/Layout.tsx`
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/styles/index.css`

- [ ] **Step 1: Write the failing test**

Because there is no existing React test harness, define a minimal manual verification target instead of a component test for this UI task:

```text
Navigate to /agent-playground.
Expected before implementation: route missing or page not found.
```

- [ ] **Step 2: Run app to verify it fails**

Run: `npm run dev`
Expected: navigating to `/agent-playground` shows no dedicated page.

- [ ] **Step 3: Write minimal implementation**

Create the page with:
- left workflow list with 2 enabled and 2 reserved items
- middle forms for the two workflows
- right panel with idle empty state, Result, Raw JSON, Logic Trace, and History tabs
- execute wiring through `agentPlaygroundApi`
- local history append on success and error
- nav entry in sidebar and route registration in `App.tsx`

- [ ] **Step 4: Run app to verify it passes**

Run: `npm run dev`
Expected: `/agent-playground` loads, both real workflows execute, reserved workflows remain disabled, idle state shows guidance text.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/AgentPlayground.tsx frontend/src/App.tsx frontend/src/components/Layout.tsx frontend/src/styles/index.css
git commit -m "feat: add agent playground page"
```

### Task 5: Install test tooling and run verification

**Files:**
- Modify: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/package.json`
- Test: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.test.ts`
- Test: `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundHistory.test.ts`

- [ ] **Step 1: Write the failing test command**

Run:

```bash
npm test -- agentPlaygroundApi.test.ts
```

Expected: command fails before test tooling is configured.

- [ ] **Step 2: Install and configure minimal test tooling**

Add `vitest` script and dev dependency, using Node environment for utility tests.

- [ ] **Step 3: Run targeted tests to verify they pass**

Run:

```bash
npm test -- agentPlaygroundApi.test.ts agentPlaygroundHistory.test.ts
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: Vite build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/lib/agentPlaygroundApi.test.ts frontend/src/lib/agentPlaygroundHistory.test.ts
git commit -m "test: add playground verification coverage"
```

## Self-review

- Spec coverage: includes the two real workflows, reserved placeholders, local history, trace payload mapping, and idle-state output panel.
- Placeholder scan: no TODO/TBD markers remain; each task names concrete files and commands.
- Type consistency: `recordId` is handled as `number` on the frontend and `Long`-compatible payload to the backend.
