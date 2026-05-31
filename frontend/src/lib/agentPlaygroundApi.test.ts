import { describe, expect, it, vi } from 'vitest'
import { createPlaygroundApi, extractTracePayload } from './agentPlaygroundApi'

describe('extractTracePayload', () => {
  it('parses json strings into structured payload', () => {
    expect(extractTracePayload('{"step":"parsed"}')).toEqual({ step: 'parsed' })
  })

  it('falls back to raw string when json parsing fails', () => {
    expect(extractTracePayload('not-json')).toBe('not-json')
  })

  it('returns null for empty values', () => {
    expect(extractTracePayload('')).toBeNull()
  })
})

describe('createPlaygroundApi', () => {
  it('polls async local upload task until success and maps deconstructionJson into tracePayload', async () => {
    const file = { name: 'demo.mp4', size: 1024, type: 'video/mp4' } as File
    const getVideoUnderstandingTask = vi
      .fn()
      .mockResolvedValueOnce({
        taskId: 'task-1',
        status: 'RUNNING',
        progressPercent: 60,
        stage: 'ANALYZING',
        statusMessage: 'running',
      })
      .mockResolvedValueOnce({
        taskId: 'task-1',
        status: 'SUCCEEDED',
        progressPercent: 100,
        stage: 'COMPLETED',
        result: {
          videoId: 'task-1',
          skuId: 'SEED_CUSHION_2',
          deconstructionJson: '{"step":"video"}',
        },
      })

    const onTaskUpdate = vi.fn()
    const api = createPlaygroundApi({
      submitVideoUnderstandingUpload: vi.fn().mockResolvedValue({
        taskId: 'task-1',
        status: 'SUBMITTED',
        progressPercent: 0,
        stage: 'QUEUED',
      }),
      submitVideoUnderstandingUrl: vi.fn(),
      getVideoUnderstandingTask,
      generateContentStructureCard: vi.fn(),
      generateScriptBlueprint: vi.fn(),
      generateVideoAssembly: vi.fn(),
      invokeBeukayClaw: vi.fn(),
      invokeQianchuanDelivery: vi.fn(),
      invokeQianchuanData: vi.fn(),
      sleep: vi.fn().mockResolvedValue(undefined),
    })

    const result = await api.runVideoDeconstructionUpload({
      file,
      skuId: 'SEED_CUSHION_2',
      sourceLabel: 'demo',
      onTaskUpdate,
    })

    expect(result.agent).toBe('video-deconstruction')
    expect(result.status).toBe('success')
    expect(result.tracePayload).toEqual({ step: 'video' })
    expect(result.requestPayload).toMatchObject({
      sourceType: 'LOCAL_FILE',
      fileName: 'demo.mp4',
      skuId: 'SEED_CUSHION_2',
    })
    expect(getVideoUnderstandingTask).toHaveBeenCalledTimes(2)
    expect(onTaskUpdate).toHaveBeenCalledTimes(3)
  })

  it('maps logicTrace into tracePayload for content structure card agent', async () => {
    const api = createPlaygroundApi({
      submitVideoUnderstandingUpload: vi.fn(),
      submitVideoUnderstandingUrl: vi.fn(),
      getVideoUnderstandingTask: vi.fn(),
      generateContentStructureCard: vi.fn().mockResolvedValue({
        cardId: 'csc-1',
        skuId: 'SEED_CUSHION_2',
        cardJson: '{"openingHook":"hello"}',
        logicTrace: '{"selectedKnowledgeId":"k-1"}',
      }),
      generateScriptBlueprint: vi.fn(),
      generateVideoAssembly: vi.fn(),
      invokeBeukayClaw: vi.fn(),
      invokeQianchuanDelivery: vi.fn(),
      invokeQianchuanData: vi.fn(),
      sleep: vi.fn().mockResolvedValue(undefined),
    })

    const result = await api.runContentStructureCard({ skuId: 'SEED_CUSHION_2' })
    expect(result.agent).toBe('content-structure-card')
    expect(result.tracePayload).toEqual({ selectedKnowledgeId: 'k-1' })
    expect(result.status).toBe('success')
  })
})
