import { describe, expect, it } from 'vitest'
import { appendPlaygroundHistory, type PlaygroundHistoryItem } from './agentPlaygroundHistory'

describe('appendPlaygroundHistory', () => {
  it('keeps only the newest 50 history records', () => {
    const items = Array.from({ length: 51 }, (_, i) => ({
      id: String(i),
      agent: 'video-deconstruction' as const,
      createdAt: new Date(2026, 3, 24, 0, i).toISOString(),
      status: 'success' as const,
      durationMs: i,
      requestPayload: { i },
    }))

    const result = items.reduce<PlaygroundHistoryItem[]>((acc, item) => appendPlaygroundHistory(acc, item), [])
    expect(result).toHaveLength(50)
    expect(result[0].id).toBe('50')
    expect(result[result.length - 1]?.id).toBe('1')
  })
})
