import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Layers, Play, Plus, Trash2, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Sparkles, Folder,
} from 'lucide-react'
import {
  cmRemote,
  type CmRemoteCollection, type CmRemoteChapter, type CmComposeBackendResult,
} from '../../../lib/cm/cmApi'
import SegmentClip from '../../../components/SegmentClip'

type StageCode = 'HOOK' | 'SCENE' | 'BENEFIT' | 'PROOF_CTA' | 'UNTAGGED'
const STAGE_NAMES: Record<StageCode, string> = {
  HOOK: '01_钩子',
  SCENE: '02_场景痛点',
  BENEFIT: '03_方案卖点',
  PROOF_CTA: '04_证明收束',
  UNTAGGED: '99_待分类',
}

interface SectionConfig {
  sectionNo: number
  stageCode: StageCode
  narrationDurationSec: number
  requiredTags: string[]
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { sectionNo: 1, stageCode: 'HOOK', narrationDurationSec: 5, requiredTags: [] },
  { sectionNo: 2, stageCode: 'SCENE', narrationDurationSec: 8, requiredTags: [] },
  { sectionNo: 3, stageCode: 'BENEFIT', narrationDurationSec: 12, requiredTags: [] },
  { sectionNo: 4, stageCode: 'PROOF_CTA', narrationDurationSec: 7, requiredTags: [] },
]

export default function ParagraphAlign() {
  const nav = useNavigate()
  const [colls, setColls] = useState<CmRemoteCollection[]>([])
  const [collCode, setCollCode] = useState<string | null>(null)
  const [chapters, setChapters] = useState<CmRemoteChapter[]>([])
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<CmComposeBackendResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    cmRemote.listCollections()
      .then(all => {
        setColls(all)
        if (!collCode && all.length > 0) setCollCode(all[0].collectionCode)
      })
      .catch(e => setErr(e instanceof Error ? e.message : '加载品名失败'))
  }, [])

  useEffect(() => {
    if (!collCode) { setChapters([]); return }
    cmRemote.listChapters(collCode).then(setChapters).catch(() => {/* ignore */})
  }, [collCode])

  const activeColl = colls.find(c => c.collectionCode === collCode)
  const totalDuration = sections.reduce((s, x) => s + x.narrationDurationSec, 0)

  const segCounts = useMemo(() => {
    const out = {} as Record<string, number>
    sections.forEach(s => {
      const ch = chapters.find(c => c.stageCode === s.stageCode)
      out[s.stageCode] = ch?.segmentCount ?? 0
    })
    return out
  }, [chapters, sections])

  const updateSec = (idx: number, patch: Partial<SectionConfig>) => {
    setSections(ss => ss.map((s, i) => i === idx ? { ...s, ...patch } : s))
  }
  const addSec = () => {
    setSections(ss => [...ss, { sectionNo: ss.length + 1, stageCode: 'UNTAGGED', narrationDurationSec: 5, requiredTags: [] }])
  }
  const rmSec = (idx: number) => {
    setSections(ss => ss.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sectionNo: i + 1 })))
  }

  const runAlign = async () => {
    if (!collCode) { setErr('请选择品名'); return }
    if (sections.length === 0) { setErr('请至少添加一个段落'); return }
    setRunning(true); setErr(null); setResult(null)
    try {
      const r = await cmRemote.paragraphAlign({
        collectionCode: collCode,
        skuId: activeColl?.skuId,
        sections: sections.map(s => ({
          sectionNo: s.sectionNo,
          stageCode: s.stageCode,
          stageName: STAGE_NAMES[s.stageCode],
          narrationDurationSec: s.narrationDurationSec,
          requiredTags: s.requiredTags,
        })),
      })
      setResult(r)
      if (r.status === 'FAILED') setErr(r.errorMsg ?? '编排失败')
    } catch (e) {
      setErr(e instanceof Error ? e.message : '编排失败')
    } finally { setRunning(false) }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
          <Layers size={20} color="var(--accent-primary)" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          段落对齐编排器
          <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'var(--gradient-1)', color: '#fff', fontWeight: 700 }}>本项目特化</span>
          <span style={{ marginLeft: 6, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 700 }}>backend live</span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
          配音按卖点段落切分 → 每段匹配标签镜头 → 累计时长 ≥ 配音时长 → 拼接尾部自然截断 → ffmpeg 实出 mp4。
          素材到 <Link to="/cutmatrix/explorer" style={{ color: 'var(--accent-primary)' }}>素材组织</Link> 创建品名并导入。
        </div>
      </div>

      <div style={{ marginBottom: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Folder size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>品名</span>
          {colls.length === 0 ? (
            <Link to="/cutmatrix/explorer" style={{ fontSize: '0.74rem', color: 'var(--accent-primary)' }}>
              请先到「素材组织」创建品名 →
            </Link>
          ) : (
            <select value={collCode ?? ''} onChange={e => setCollCode(e.target.value)} style={inp}>
              {colls.map(c => <option key={c.collectionCode} value={c.collectionCode}>{c.name} {c.skuId ? `· ${c.skuId}` : ''}</option>)}
            </select>
          )}
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>章节 {chapters.length} 个</span>
        </div>
      </div>

      <div style={{ marginBottom: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>段落配置 · 总配音 {totalDuration}s</div>
          <button onClick={addSec} style={btnGhost}>
            <Plus size={12} style={{ marginRight: 4 }} />新增段落
          </button>
        </div>

        <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
              <th style={th}>#</th>
              <th style={th}>章节标签</th>
              <th style={th}>配音时长(s)</th>
              <th style={th}>必须包含 tag</th>
              <th style={th}>素材池</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s, i) => {
              const count = segCounts[s.stageCode] ?? 0
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={td}><strong>{s.sectionNo}</strong></td>
                  <td style={td}>
                    <select value={s.stageCode} onChange={e => updateSec(i, { stageCode: e.target.value as StageCode })} style={{ ...inp, padding: '4px 8px' }}>
                      {(['HOOK', 'SCENE', 'BENEFIT', 'PROOF_CTA', 'UNTAGGED'] as StageCode[]).map(c => (
                        <option key={c} value={c}>{STAGE_NAMES[c]}</option>
                      ))}
                    </select>
                  </td>
                  <td style={td}>
                    <input type="number" min={1} value={s.narrationDurationSec} onChange={e => updateSec(i, { narrationDurationSec: Math.max(1, Number(e.target.value)) })} style={{ ...inp, padding: '4px 8px', width: 80 }} />
                  </td>
                  <td style={td}>
                    <input value={s.requiredTags.join(',')} onChange={e => updateSec(i, { requiredTags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="可选, 逗号分隔" style={{ ...inp, padding: '4px 8px' }} />
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: '0.74rem', color: count === 0 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{count} 段</span>
                  </td>
                  <td style={td}>
                    <button onClick={() => rmSec(i)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {err && <div style={errBox}><AlertCircle size={13} /> {err}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button onClick={runAlign} disabled={running || !collCode} style={{ ...btnPrimary, padding: '10px 20px', fontSize: '0.85rem' }}>
          <Play size={14} style={{ marginRight: 6 }} />
          {running ? '编排中（ffmpeg 渲染中…）' : '运行段落对齐 → 实出 mp4'}
        </button>
        <button onClick={() => { setSections(DEFAULT_SECTIONS); setResult(null); setErr(null) }} style={btnGhost}>
          <RefreshCw size={12} style={{ marginRight: 4 }} />重置
        </button>
      </div>

      {result && <ResultPanel result={result} />}

      {!result && !running && (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 12, border: '1px dashed var(--border-light)' }}>
          <Sparkles size={28} color="var(--accent-primary)" style={{ marginBottom: 10 }} />
          <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>设置好段落 → 点击运行 → 后端 ffmpeg concat 真实输出 mp4</div>
        </div>
      )}
    </div>
  )
}

function ResultPanel({ result }: { result: CmComposeBackendResult }) {
  const stageGroups = result.clips.reduce<Record<number, typeof result.clips>>((m, c) => {
    if (!m[c.sectionNo]) m[c.sectionNo] = []
    m[c.sectionNo].push(c)
    return m
  }, {})

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
          编排结果 · {result.clips.length} 个片段 · 总时长 {Number(result.totalDurationSec).toFixed(1)}s · 任务 {result.taskCode.slice(0, 16)}
        </div>
        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: result.status === 'SUCCEEDED' ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)', color: result.status === 'SUCCEEDED' ? '#15803d' : '#ef4444', fontWeight: 700 }}>
          {result.status}
        </span>
      </div>

      {result.resultVideoUrl && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>🎬 渲染成片预览</div>
          <video controls style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000' }}>
            <source src={result.resultVideoUrl} type="video/mp4" />
          </video>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>{result.resultVideoUrl}</div>
        </div>
      )}

      {Object.entries(stageGroups).sort(([a], [b]) => Number(a) - Number(b)).map(([secNo, clips]) => (
        <div key={secNo} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6, color: 'var(--accent-primary)' }}>
            段落 {secNo} · {clips[0]?.stageCode} · {clips.length} 个片段
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', padding: '4px 0' }}>
            {clips.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 160 }}>
                  <SegmentClip src={c.videoUrl} startSec={Number(c.startSec)} endSec={Number(c.endSec)} label={c.stageCode} height={100} />
                </div>
                {i < clips.length - 1 && <ArrowRight size={12} color="var(--text-muted)" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const inp: React.CSSProperties = { padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border-light)', fontSize: '0.78rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }
const backBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }
const errBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 12 }
const th: React.CSSProperties = { padding: '6px 8px', textAlign: 'left', fontWeight: 600, fontSize: '0.7rem' }
const td: React.CSSProperties = { padding: '6px 8px' }
