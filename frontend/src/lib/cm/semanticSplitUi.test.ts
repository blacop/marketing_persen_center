import { describe, expect, it } from 'vitest'
import type { SemanticSegment } from './cmApi'
import {
  canExportSemanticSplit,
  currentCaptionAt,
  filterSegmentsByQuery,
  formatClockMs,
  formatDurationMs,
  silentGapsBetween,
  timelineViewportPercent,
} from './semanticSplitUi'

const segments: SemanticSegment[] = [
  { idx: 15, start: 23.71, end: 25.59, text: '既可爱又能隔绝彩妆对痘痘的污染', confidence: 0.91, folderId: 'f1' },
  { idx: 16, start: 25.75, end: 27.27, text: '我买的这些呢有80贴可以贴80个痘痘', confidence: 0.88 },
  { idx: 17, start: 30, end: 35.36, text: '星星痘痘贴很好看', confidence: 0.93 },
]

describe('semantic split UI helpers', () => {
  it('formats timestamps and durations with millisecond precision', () => {
    expect(formatClockMs(23.71)).toBe('00:00:23.710')
    expect(formatDurationMs(1.88)).toBe('01.880')
    expect(formatDurationMs(65.236)).toBe('01:05.236')
  })

  it('filters segment cards by transcript text or index', () => {
    expect(filterSegmentsByQuery(segments, '彩妆')).toHaveLength(1)
    expect(filterSegmentsByQuery(segments, '16')[0]?.idx).toBe(16)
    expect(filterSegmentsByQuery(segments, '')).toHaveLength(3)
  })

  it('selects the subtitle active at the current preview time', () => {
    expect(currentCaptionAt(segments, 24)?.idx).toBe(15)
    expect(currentCaptionAt(segments, 25.7)?.idx).toBeUndefined()
    expect(currentCaptionAt(segments, 26)?.idx).toBe(16)
  })

  it('detects short silent gaps between spoken segments', () => {
    expect(silentGapsBetween(segments, 0.1)).toEqual([
      { afterIdx: 15, start: 25.59, end: 25.75, duration: 0.16 },
      { afterIdx: 16, start: 27.27, end: 30, duration: 2.73 },
    ])
  })

  it('computes bottom scrollbar viewport from zoom and pan', () => {
    expect(timelineViewportPercent(1, 0)).toEqual({ left: 0, width: 100 })
    expect(timelineViewportPercent(4, 0.5)).toEqual({ left: 50, width: 25 })
  })

  it('requires a selected export folder before batch export is enabled', () => {
    expect(canExportSemanticSplit({ hasSegments: true, hasSelectedFolder: false, exporting: false })).toBe(false)
    expect(canExportSemanticSplit({ hasSegments: true, hasSelectedFolder: true, exporting: false })).toBe(true)
    expect(canExportSemanticSplit({ hasSegments: true, hasSelectedFolder: true, exporting: true })).toBe(false)
  })
})
