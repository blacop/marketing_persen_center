import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Video, X, Loader, Scissors, Download,
  CheckSquare, Square, RefreshCw, Trash2, FileVideo,
} from 'lucide-react'
import { cmRemote, type CmToolBackendResult } from '../../../lib/cm/cmApi'

interface MaterialItem {
  id: string
  fileName: string
  size: number
  uploadState: 'idle' | 'uploading' | 'ready' | 'error'
  assetCode?: string
  streamUrl?: string
  durationSec?: number
}

interface SplitResult {
  idx: number
  url: string
  assetCode?: string
}

interface SplitTask {
  id: string
  fileName: string
  segmentSec: number
  createdAt: string
  completedAt?: string
  status: 'processing' | 'done' | 'failed'
  results: SplitResult[]
  msg?: string
}

const STORE_KEY = 'cm_uniform_split_tasks'

function loadTasks(): SplitTask[] { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] } }
function saveTasks(t: SplitTask[]): void { try { localStorage.setItem(STORE_KEY, JSON.stringify(t)) } catch { /* ignore */ } }
function uid() { return `us-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

function fmtSize(b: number): string {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

export default function UniformSplit() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'create' | 'queue'>('create')

  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [segmentSec, setSegmentSec] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [tasks, setTasks] = useState<SplitTask[]>(() => loadTasks())
  const [view, setView] = useState<SplitTask | null>(null)

  const upload = async (file: File): Promise<{ assetCode?: string; streamUrl?: string }> => {
    try {
      const r = await (cmRemote as unknown as { uploadAsset?: (f: File) => Promise<{ assetCode: string; streamUrl: string }> }).uploadAsset?.(file)
      if (r) return r
    } catch { /* fallback */ }
    return { streamUrl: URL.createObjectURL(file) }
  }

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const incoming: MaterialItem[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('video/') && !f.name.match(/\.(mp4|mov|mkv|webm|avi|flv)$/i)) continue
      incoming.push({ id: uid(), fileName: f.name, size: f.size, uploadState: 'uploading' })
    }
    if (incoming.length === 0) return
    setMaterials(prev => [...prev, ...incoming])
    if (!activeId) setActiveId(incoming[0].id)

    const arr = Array.from(files)
    for (let i = 0; i < incoming.length; i++) {
      const item = incoming[i]
      const file = arr[i]
      const { assetCode, streamUrl } = await upload(file)
      setMaterials(prev => prev.map(m => m.id === item.id ? { ...m, uploadState: 'ready', assetCode, streamUrl } : m))
    }
  }

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
    if (activeId === id) {
      const remain = materials.filter(m => m.id !== id)
      setActiveId(remain[0]?.id ?? null)
    }
  }

  const splitOne = async (m: MaterialItem) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
    const taskId = uid()
    const taskBase: SplitTask = {
      id: taskId, fileName: m.fileName, segmentSec, createdAt: now, status: 'processing', results: [],
    }
    setTasks(prev => [taskBase, ...prev])

    try {
      let res: CmToolBackendResult
      if (m.assetCode) {
        res = await cmRemote.toolUniformSplit({ inputAssetCode: m.assetCode, segmentSec })
      } else {
        await new Promise(r => setTimeout(r, 1200))
        // mock: 用本地 streamUrl 复制 N 份
        const n = Math.max(2, Math.round((m.durationSec ?? 30) / segmentSec))
        res = {
          status: 'SUCCEEDED',
          streamUrls: Array.from({ length: n }, () => m.streamUrl ?? ''),
          message: `mock 切分为 ${n} 段（每段 ${segmentSec}s）`,
        } as CmToolBackendResult
      }
      const completed = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
      const results: SplitResult[] = (res.streamUrls ?? []).map((url, i) => ({
        idx: i + 1, url, assetCode: res.resultAssetCodes?.[i],
      }))
      const final: SplitTask = {
        ...taskBase, completedAt: completed,
        status: res.status === 'SUCCEEDED' ? 'done' : 'failed',
        results, msg: res.message,
      }
      setTasks(prev => { const next = prev.map(t => t.id === taskId ? final : t); saveTasks(next); return next })
    } catch (e) {
      const failed: SplitTask = { ...taskBase, status: 'failed', msg: e instanceof Error ? e.message : '切分失败' }
      setTasks(prev => { const next = prev.map(t => t.id === taskId ? failed : t); saveTasks(next); return next })
    }
  }

  const submitActive = async () => {
    const m = materials.find(x => x.id === activeId)
    if (!m || m.uploadState !== 'ready') return
    setSubmitting(true)
    await splitOne(m)
    setSubmitting(false)
    setTab('queue')
  }
  const submitAll = async () => {
    const ready = materials.filter(m => m.uploadState === 'ready')
    setSubmitting(true)
    for (const m of ready) await splitOne(m)
    setSubmitting(false)
    setTab('queue')
  }

  const active = useMemo(() => materials.find(m => m.id === activeId) ?? null, [materials, activeId])

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1500, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Scissors size={20} color="#14b8a6" /> 平均切分
          <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>
            FFmpeg segment
          </span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          按时长平均切分素材，一次生成多个等长切片。
        </div>
      </div>

      <div style={{ display: 'flex', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: 'var(--border-light)', marginBottom: 14 }}>
        {(['create', 'queue'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', fontSize: '0.84rem', cursor: 'pointer',
            borderBottomWidth: 2, borderBottomStyle: 'solid',
            borderBottomColor: tab === t ? '#14b8a6' : 'transparent',
            color: tab === t ? '#14b8a6' : 'var(--text-muted)',
            fontWeight: tab === t ? 700 : 500, marginBottom: -2,
          }}>{t === 'create' ? '创建任务' : '任务队列'}</button>
        ))}
      </div>

      {tab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 320px 1fr', gap: 14 }}>
          {/* 素材 */}
          <div style={{ ...S.card, padding: 12, height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              <Upload size={13} />添加视频
            </button>
            <input ref={fileInputRef} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
            <div style={{ flex: 1, overflow: 'auto' }}>
              {materials.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.74rem', padding: '24px 8px' }}>支持批量视频</div>
              ) : materials.map(m => (
                <div key={m.id} onClick={() => setActiveId(m.id)} style={{
                  padding: '7px 9px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                  background: activeId === m.id ? 'rgba(20,184,166,0.1)' : 'transparent',
                  border: `1px solid ${activeId === m.id ? '#14b8a6' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Video size={12} color="var(--accent-primary)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.fileName}>{m.fileName}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {fmtSize(m.size)}
                      <span style={{ marginLeft: 6, color: m.uploadState === 'ready' ? '#22c55e' : '#f59e0b' }}>
                        {m.uploadState === 'ready' ? '✓' : '⋯'}
                      </span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteMaterial(m.id) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 参数 */}
          <div style={{ ...S.card, padding: 16, height: 'calc(100vh - 280px)', overflow: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: 8 }}>每段时长</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <input type="range" min={1} max={60} step={1} value={segmentSec}
                onChange={e => setSegmentSec(Number(e.target.value))} style={{ flex: 1, accentColor: '#14b8a6' }} />
              <input type="number" value={segmentSec} onChange={e => setSegmentSec(Math.max(1, Math.min(60, Number(e.target.value))))}
                style={{ ...S.inp, width: 60, textAlign: 'center' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>秒</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {[3, 5, 10, 15, 20, 30, 60].map(p => (
                <button key={p} onClick={() => setSegmentSec(p)}
                  style={{
                    padding: '4px 10px', borderRadius: 99,
                    border: '1px solid var(--border-light)',
                    background: segmentSec === p ? 'rgba(20,184,166,0.12)' : 'var(--bg-primary)',
                    color: segmentSec === p ? '#14b8a6' : 'var(--text-muted)',
                    fontSize: '0.72rem', fontWeight: segmentSec === p ? 700 : 400,
                    cursor: 'pointer',
                  }}>
                  {p}s
                </button>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--border-light)', margin: '12px 0' }} />

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>
              使用 ffmpeg <code style={S.code}>-f segment</code> 切分。<br />
              <strong>注意</strong>：默认 <code style={S.code}>-c copy</code> 不重新编码，速度极快但可能在非关键帧位置切，导致前几帧轻微缺失。
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitActive} disabled={!active || active.uploadState !== 'ready' || submitting}
                style={{ ...S.btnGhost, flex: 1, justifyContent: 'center', opacity: !active || active.uploadState !== 'ready' || submitting ? 0.4 : 1 }}>
                切分当前
              </button>
              <button onClick={submitAll} disabled={materials.filter(m => m.uploadState === 'ready').length === 0 || submitting}
                style={{ ...S.btnPrimary, flex: 2, justifyContent: 'center', gap: 5, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />处理中</> : '批量切分'}
              </button>
            </div>
          </div>

          {/* 预览 */}
          <div style={{ ...S.card, padding: 16, height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 10 }}>
              {active ? active.fileName : '从左侧选择视频'}
              {active?.durationSec && <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                时长 {active.durationSec.toFixed(1)}s · 预计 {Math.ceil(active.durationSec / segmentSec)} 段
              </span>}
            </div>
            <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              {active?.streamUrl ? (
                <video src={active.streamUrl} controls
                  onLoadedMetadata={e => {
                    const dur = (e.target as HTMLVideoElement).duration
                    setMaterials(prev => prev.map(x => x.id === active.id ? { ...x, durationSec: dur } : x))
                  }}
                  style={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>添加视频后预览</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'queue' && <QueueView tasks={tasks} setTasks={setTasks} onView={setView} />}

      {view && (
        <Modal onClose={() => setView(null)} maxWidth={780}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{view.fileName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            {view.results.length} 段 · 每段 {view.segmentSec}s
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, maxHeight: 460, overflow: 'auto' }}>
            {view.results.map(r => (
              <div key={r.idx} style={{ ...S.card, padding: 8 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>第 {r.idx} 段</span>
                  <a href={r.url} download style={S.linkBtn}><Download size={10} /></a>
                </div>
                <video src={r.url} controls style={{ width: '100%', borderRadius: 4, background: '#000' }} />
              </div>
            ))}
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function QueueView({ tasks, setTasks, onView }: { tasks: SplitTask[]; setTasks: (t: SplitTask[]) => void; onView: (t: SplitTask) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = (id: string) => { const n = new Set(selected); if (n.has(id)) n.delete(id); else n.add(id); setSelected(n) }
  const deleteOne = (id: string) => { const next = tasks.filter(t => t.id !== id); setTasks(next); saveTasks(next) }
  const deleteSelected = () => { if (selected.size === 0) return; const next = tasks.filter(t => !selected.has(t.id)); setTasks(next); saveTasks(next); setSelected(new Set()) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>共 {tasks.length} 条 · 已选 {selected.size}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTasks(loadTasks())} style={S.btnGhost}><RefreshCw size={11} style={{ marginRight: 4 }} />刷新</button>
          <button onClick={deleteSelected} disabled={selected.size === 0} style={{ ...S.btnGhost, color: '#ef4444', opacity: selected.size === 0 ? 0.4 : 1 }}>
            <Trash2 size={11} style={{ marginRight: 4 }} />删除已选
          </button>
        </div>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ ...S.th, width: 40 }}></th>
              <th style={{ ...S.th, width: 50 }}>序号</th>
              <th style={S.th}>文件名</th>
              <th style={{ ...S.th, width: 80 }}>段长</th>
              <th style={{ ...S.th, width: 70 }}>段数</th>
              <th style={{ ...S.th, width: 140 }}>创建时间</th>
              <th style={{ ...S.th, width: 70 }}>状态</th>
              <th style={{ ...S.th, width: 90 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (<tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>暂无记录</td></tr>)}
            {tasks.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={S.td} onClick={() => toggle(t.id)}>
                  {selected.has(t.id) ? <CheckSquare size={13} color="#14b8a6" style={{ cursor: 'pointer' }} /> : <Square size={13} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                </td>
                <td style={{ ...S.td, color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ ...S.td, maxWidth: 240 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.fileName}>{t.fileName}</span></td>
                <td style={S.td}>{t.segmentSec}s</td>
                <td style={S.td}><span style={{ color: '#14b8a6', fontWeight: 600 }}><FileVideo size={10} style={{ verticalAlign: '-1px' }} /> {t.results.length}</span></td>
                <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.createdAt}</td>
                <td style={S.td}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.status === 'done' ? '#22c55e' : t.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                    {t.status === 'done' ? '成功' : t.status === 'failed' ? '失败' : '处理中'}
                  </span>
                </td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {t.status === 'done' && t.results.length > 0 && <button onClick={() => onView(t)} style={S.linkBtn}>查看</button>}
                    <button onClick={() => deleteOne(t.id)} style={{ ...S.linkBtn, color: '#ef4444' }}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Modal({ children, onClose, maxWidth = 480 }: { children: React.ReactNode; onClose: () => void; maxWidth?: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', width: '90%', maxWidth, padding: '20px 22px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        {children}
      </div>
    </div>
  )
}

const S = {
  backBtn:  { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  card:     { background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost: { display: 'inline-flex', alignItems: 'center', padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.76rem', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  linkBtn:  { background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '0.72rem', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline', textUnderlineOffset: 2, display: 'inline-flex', alignItems: 'center', gap: 3 } as React.CSSProperties,
  inp:      { padding: '5px 8px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.76rem', outline: 'none' } as React.CSSProperties,
  th:       { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const },
  td:       { padding: '8px 12px', verticalAlign: 'middle' as const },
  code:     { padding: '1px 5px', borderRadius: 4, background: 'var(--bg-secondary)', fontFamily: 'monospace', fontSize: '0.7rem', color: '#14b8a6' } as React.CSSProperties,
}
