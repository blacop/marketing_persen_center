import type { SemanticSegment } from './cmApi'

export interface SilentGap {
  afterIdx: number
  start: number
  end: number
  duration: number
}

export function formatClockMs(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0
  const totalMs = Math.round(safe * 1000)
  const h = Math.floor(totalMs / 3_600_000)
  const m = Math.floor((totalMs % 3_600_000) / 60_000)
  const s = Math.floor((totalMs % 60_000) / 1000)
  const ms = totalMs % 1000
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

export function formatDurationMs(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0
  const totalMs = Math.round(safe * 1000)
  const m = Math.floor(totalMs / 60_000)
  const s = Math.floor((totalMs % 60_000) / 1000)
  const ms = totalMs % 1000
  if (m > 0) return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
  return `${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

export function filterSegmentsByQuery(segments: SemanticSegment[] = [], query: string): SemanticSegment[] {
  const q = query.trim().toLowerCase()
  if (!q) return segments
  return segments.filter(seg =>
    String(seg.idx).includes(q) ||
    seg.text.toLowerCase().includes(q) ||
    (seg.folderName ?? '').toLowerCase().includes(q),
  )
}

export function currentCaptionAt(segments: SemanticSegment[] = [], currentTime: number): SemanticSegment | undefined {
  return segments.find(seg => currentTime >= seg.start && currentTime <= seg.end)
}

export function silentGapsBetween(segments: SemanticSegment[] = [], minDuration = 0.1): SilentGap[] {
  const sorted = [...segments].sort((a, b) => a.start - b.start)
  return sorted
    .slice(0, -1)
    .map((seg, index) => {
      const next = sorted[index + 1]
      if (!next) return null
      const duration = Number((next.start - seg.end).toFixed(3))
      if (duration < minDuration) return null
      return { afterIdx: seg.idx, start: seg.end, end: next.start, duration }
    })
    .filter((gap): gap is SilentGap => gap != null)
}

export function timelineViewportPercent(zoom: number, panRatio: number): { left: number; width: number } {
  const safeZoom = Math.max(1, zoom)
  const width = Number((100 / safeZoom).toFixed(3))
  const maxLeft = Math.max(0, 100 - width)
  const left = Number(Math.min(Math.max(panRatio, 0) * 100, maxLeft).toFixed(3))
  return { left, width }
}

export function canExportSemanticSplit({
  hasSegments,
  hasSelectedFolder,
  exporting,
}: {
  hasSegments: boolean
  hasSelectedFolder: boolean
  exporting: boolean
}): boolean {
  return hasSegments && hasSelectedFolder && !exporting
}
