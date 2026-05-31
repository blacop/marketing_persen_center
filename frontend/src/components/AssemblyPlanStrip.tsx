import { useEffect, useState } from 'react'
import { Film, ArrowRight } from 'lucide-react'
import {
  videoAssetApi,
  getVideoStreamUrl,
  type VideoAssemblyPlanSection,
  type VideoAssemblyCandidate,
  type VideoSegment,
} from '../lib/agentApi'
import SegmentClip from './SegmentClip'

interface Props {
  planSections?: VideoAssemblyPlanSection[]
  candidates?: VideoAssemblyCandidate[]
  /** 默认 110 */
  clipHeight?: number
}

interface ResolvedClip {
  sectionNo: number
  videoUrl: string
  startSec: number
  endSec: number
  stageCode?: string
  reason?: string
}

const STAGE_NAME: Record<string, string> = {
  HOOK: '钩子',
  SCENE: '场景痛点',
  BENEFIT: '方案卖点',
  PROOF_CTA: '证明收束',
  PROOF: '证明',
  CTA: '行动号召',
}

function parseReason(raw?: string): { stageCode?: string; reason?: string } {
  if (!raw) return {}
  try {
    const j = JSON.parse(raw)
    return { stageCode: j.stageCode, reason: j.selectedReason ?? j.matchReason }
  } catch { return {} }
}

export default function AssemblyPlanStrip({ planSections, candidates, clipHeight = 110 }: Props) {
  const [resolved, setResolved] = useState<ResolvedClip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sections = planSections && planSections.length > 0
    ? planSections
    : (candidates ?? [])
        .filter(c => c.selected)
        .sort((a, b) => a.sectionNo - b.sectionNo)
        .map(c => ({ sectionNo: c.sectionNo, segmentId: c.segmentId, videoId: c.videoId, selectionReasonJson: c.matchReasonJson }))

  useEffect(() => {
    if (!sections.length) { setResolved([]); return }
    const uniqVideoIds = Array.from(new Set(sections.map(s => s.videoId).filter(Boolean) as string[]))
    if (!uniqVideoIds.length) return
    setLoading(true)
    setError(null)
    Promise.all(uniqVideoIds.map(vid => videoAssetApi.findDeconByVideoId(vid)
      .then(d => [vid, d] as const)
      .catch(() => [vid, null] as const)
    )).then(pairs => {
      const segByVideo = new Map<string, VideoSegment[]>()
      pairs.forEach(([vid, detail]) => { if (detail?.segments) segByVideo.set(vid, detail.segments) })
      const out: ResolvedClip[] = []
      for (const s of sections) {
        if (!s.videoId) continue
        const segs = segByVideo.get(s.videoId)
        if (!segs) continue
        const seg = segs.find(x => String(x.id ?? '') === String(s.segmentId ?? '') || x.index === Number(s.segmentId))
        if (!seg || seg.startSec == null || seg.endSec == null) continue
        const url = getVideoStreamUrl(s.videoId)
        if (!url) continue
        const meta = parseReason(s.selectionReasonJson)
        out.push({
          sectionNo: s.sectionNo,
          videoUrl: url,
          startSec: seg.startSec,
          endSec: seg.endSec,
          stageCode: meta.stageCode,
          reason: meta.reason,
        })
      }
      setResolved(out)
    }).catch(e => setError(e instanceof Error ? e.message : '装配预览加载失败'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sections)])

  if (!sections.length) {
    return (
      <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: 10 }}>
        装配任务尚无计划段落（planSections / candidates 都为空）
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Film size={14} color="#e8365d" />
        拼接计划预览（{sections.length} 段顺序播放）
        {loading && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>· 加载片段中…</span>}
      </div>

      {error && (
        <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.72rem', color: '#ef4444', marginBottom: 10 }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && resolved.length === 0 && !error && (() => {
        const uniqVideoIds = Array.from(new Set(sections.map(s => s.videoId).filter(Boolean) as string[]))
        if (uniqVideoIds.length === 0) {
          return (
            <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.72rem', color: '#b45309' }}>
              planSections 内没有可用的 videoId
            </div>
          )
        }
        return (
          <>
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.7rem', color: '#b45309', marginBottom: 10 }}>
              ⚠️ 段落时间轴未在拆解库中匹配（videoId 可能已被新拆解任务替换）。下方回退为源视频回放 + 文字版拼接计划。
            </div>
            {uniqVideoIds.map(vid => (
              <div key={vid} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'monospace' }}>{vid}</div>
                <video controls preload="metadata" style={{ width: '100%', maxHeight: 220, borderRadius: 8, background: '#000', display: 'block' }}>
                  <source src={getVideoStreamUrl(vid)} />
                </video>
              </div>
            ))}
            <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>拼接计划（{sections.length} 段）</div>
              {sections.map(s => {
                const meta = parseReason(s.selectionReasonJson)
                return (
                  <div key={s.sectionNo} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0', fontSize: '0.72rem' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#e8365d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>{s.sectionNo}</span>
                    <span style={{ fontWeight: 700 }}>{meta.stageCode ? (STAGE_NAME[meta.stageCode] ?? meta.stageCode) : `第 ${s.sectionNo} 段`}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>segmentId={String(s.segmentId ?? '—')}</span>
                    {meta.reason && <span style={{ color: '#8b5cf6' }}>· {meta.reason}</span>}
                  </div>
                )
              })}
            </div>
          </>
        )
      })()}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {resolved.map((clip, i) => (
          <div key={`${clip.sectionNo}-${i}`} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)', alignItems: 'flex-start' }}>
            <SegmentClip
              src={clip.videoUrl}
              startSec={clip.startSec}
              endSec={clip.endSec}
              label={`#${clip.sectionNo}`}
              height={clipHeight}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#e8365d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{clip.sectionNo}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {clip.stageCode ? (STAGE_NAME[clip.stageCode] ?? clip.stageCode) : `第 ${clip.sectionNo} 段`}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {clip.startSec}s – {clip.endSec}s · {(clip.endSec - clip.startSec).toFixed(1)}s
                </span>
                {i < resolved.length - 1 && <ArrowRight size={11} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />}
              </div>
              {clip.reason && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#8b5cf6' }}>选定理由：</strong>{clip.reason}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {candidates && candidates.length > resolved.length && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
            查看 Top-K 候选片段（共 {candidates.length} 条）
          </summary>
          <table style={{ width: '100%', marginTop: 8, fontSize: '0.7rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '6px 4px' }}>段</th>
                <th style={{ textAlign: 'left', padding: '6px 4px' }}>排名</th>
                <th style={{ textAlign: 'left', padding: '6px 4px' }}>segmentId</th>
                <th style={{ textAlign: 'left', padding: '6px 4px' }}>相似度</th>
                <th style={{ textAlign: 'left', padding: '6px 4px' }}>是否选中</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '6px 4px' }}>{c.sectionNo}</td>
                  <td style={{ padding: '6px 4px' }}>{c.rankNo ?? '—'}</td>
                  <td style={{ padding: '6px 4px', fontFamily: 'monospace' }}>{String(c.segmentId ?? '—')}</td>
                  <td style={{ padding: '6px 4px' }}>{c.similarityScore?.toFixed(3) ?? '—'}</td>
                  <td style={{ padding: '6px 4px' }}>{c.selected ? <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  )
}
