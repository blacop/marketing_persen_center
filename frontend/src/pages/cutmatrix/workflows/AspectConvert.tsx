import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Video, X, Loader, RefreshCw, AlertCircle,
  Maximize2, CheckSquare, Square, Trash2,
} from 'lucide-react'
import { cmRemote, type CmToolBackendResult } from '../../../lib/cm/cmApi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────

type Aspect = '9:16' | '3:4' | '16:9' | '4:3' | '1:1'
type FitMode = 'crop' | 'fit'

interface MaterialItem {
  id: string
  fileName: string
  size: number
  uploadState: 'idle' | 'uploading' | 'ready' | 'error'
  assetCode?: string
  streamUrl?: string
  resultUrl?: string
  resultStatus?: 'idle' | 'processing' | 'done' | 'failed'
  errMsg?: string
}

interface ConvertTask {
  id: string
  fileName: string
  aspect: Aspect
  shortEdge: number
  mode: FitMode
  createdAt: string
  completedAt?: string
  status: 'processing' | 'done' | 'failed'
  resultUrl?: string
  msg?: string
}

const STORE_KEY = 'cm_aspect_convert_tasks'
const ASPECT_OPTIONS: { key: Aspect; label: string; ratio: number }[] = [
  { key: '9:16', label: '竖屏 9:16', ratio: 9 / 16 },
  { key: '3:4',  label: '竖屏 3:4',  ratio: 3 / 4  },
  { key: '16:9', label: '横屏 16:9', ratio: 16 / 9 },
  { key: '4:3',  label: '横屏 4:3',  ratio: 4 / 3  },
  { key: '1:1',  label: '方形 1:1',  ratio: 1      },
]

function loadTasks(): ConvertTask[] { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] } }
function saveTasks(t: ConvertTask[]): void { try { localStorage.setItem(STORE_KEY, JSON.stringify(t)) } catch { /* ignore */ } }
function uid() { return `ac-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

function fmtSize(b: number): string {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function AspectConvert() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'create' | 'queue'>('create')

  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [aspect, setAspect] = useState<Aspect>('9:16')
  const [shortEdge, setShortEdge] = useState(1080)
  const [mode, setMode] = useState<FitMode>('crop')

  const [submitting, setSubmitting] = useState(false)
  const [tasks, setTasks] = useState<ConvertTask[]>(() => loadTasks())
  const [view, setView] = useState<ConvertTask | null>(null)

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
      try {
        let assetCode: string | undefined
        let streamUrl: string | undefined
        try {
          const upload = await (cmRemote as unknown as { uploadAsset?: (f: File) => Promise<{ assetCode: string; streamUrl: string }> }).uploadAsset?.(file)
          if (upload) { assetCode = upload.assetCode; streamUrl = upload.streamUrl }
        } catch { /* fallback */ }
        const blobUrl = URL.createObjectURL(file)
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, uploadState: 'ready', assetCode, streamUrl: streamUrl ?? blobUrl, resultStatus: 'idle' } : m))
      } catch (e) {
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, uploadState: 'error', errMsg: e instanceof Error ? e.message : '上传失败' } : m))
      }
    }
  }

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
    if (activeId === id) {
      const remain = materials.filter(m => m.id !== id)
      setActiveId(remain[0]?.id ?? null)
    }
  }

  const convertOne = async (m: MaterialItem) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
    const taskId = uid()
    const taskBase: ConvertTask = {
      id: taskId, fileName: m.fileName, aspect, shortEdge, mode,
      createdAt: now, status: 'processing',
    }
    setTasks(prev => [taskBase, ...prev])
    setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, resultStatus: 'processing' } : x))

    try {
      let res: CmToolBackendResult
      if (m.assetCode) {
        res = await cmRemote.toolAspectConvert({
          inputAssetCode: m.assetCode,
          targetAspect: aspect, shortEdge, mode,
        })
      } else {
        await new Promise(r => setTimeout(r, 1000))
        res = { status: 'SUCCEEDED', streamUrl: m.streamUrl, message: `mock 转换：${aspect} / ${shortEdge}p / ${mode}` } as CmToolBackendResult
      }
      const completed = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
      const final: ConvertTask = {
        ...taskBase, completedAt: completed,
        status: res.status === 'SUCCEEDED' ? 'done' : 'failed',
        resultUrl: res.streamUrl, msg: res.message,
      }
      setTasks(prev => { const next = prev.map(t => t.id === taskId ? final : t); saveTasks(next); return next })
      setMaterials(prev => prev.map(x => x.id === m.id
        ? { ...x, resultUrl: res.streamUrl, resultStatus: res.status === 'SUCCEEDED' ? 'done' : 'failed' } : x))
    } catch (e) {
      const failed: ConvertTask = { ...taskBase, status: 'failed', msg: e instanceof Error ? e.message : '转换失败' }
      setTasks(prev => { const next = prev.map(t => t.id === taskId ? failed : t); saveTasks(next); return next })
    }
  }

  const submitActive = async () => {
    const m = materials.find(x => x.id === activeId)
    if (!m || m.uploadState !== 'ready') return
    setSubmitting(true)
    await convertOne(m)
    setSubmitting(false)
  }

  const submitAll = async () => {
    const ready = materials.filter(m => m.uploadState === 'ready')
    setSubmitting(true)
    for (const m of ready) await convertOne(m)
    setSubmitting(false)
  }

  const active = useMemo(() => materials.find(m => m.id === activeId) ?? null, [materials, activeId])
  const aspectRatio = ASPECT_OPTIONS.find(a => a.key === aspect)?.ratio ?? 1

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1500, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Maximize2 size={20} color="#14b8a6" /> 转换比例
          <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>
            FFmpeg scale + crop/pad
          </span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          批量转换视频画幅比例或尺寸，适配多平台投放规格。
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
          {/* 素材列表 */}
          <div style={{ ...S.card, padding: 12, height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              <Upload size={13} />添加素材
            </button>
            <input ref={fileInputRef} type="file" multiple accept="video/*" style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)} />
            <div style={{ flex: 1, overflow: 'auto' }}>
              {materials.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.74rem', padding: '24px 8px', lineHeight: 1.7 }}>
                  点击「添加素材」<br />支持批量视频
                </div>
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
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{fmtSize(m.size)}</span>
                      <span style={{ color: m.uploadState === 'ready' ? '#22c55e' : m.uploadState === 'uploading' ? '#f59e0b' : '#ef4444' }}>
                        {m.uploadState === 'ready' ? '✓' : m.uploadState === 'uploading' ? '⋯' : '!'}
                        {m.resultStatus === 'done' && ' 已转换'}
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

          {/* 参数面板 */}
          <div style={{ ...S.card, padding: 16, height: 'calc(100vh - 280px)', overflow: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: 10 }}>目标比例</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {ASPECT_OPTIONS.map(a => (
                <label key={a.key} style={{ ...S.radioCard, ...(aspect === a.key ? S.radioCardActive : {}) }}>
                  <input type="radio" checked={aspect === a.key} onChange={() => setAspect(a.key)} style={{ marginRight: 6 }} />
                  <span style={{ fontSize: '0.76rem' }}>{a.label}</span>
                </label>
              ))}
            </div>

            <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: 8 }}>短边像素</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input type="range" min={360} max={2160} step={60} value={shortEdge} onChange={e => setShortEdge(Number(e.target.value))} style={{ flex: 1, accentColor: '#14b8a6' }} />
              <input type="number" value={shortEdge} onChange={e => setShortEdge(Math.max(360, Math.min(2160, Number(e.target.value))))} style={{ ...S.inp, width: 70, textAlign: 'center' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>px</span>
            </div>

            <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: 8 }}>填充模式</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <label style={{ ...S.radioCard, ...(mode === 'crop' ? S.radioCardActive : {}), flex: 1 }}>
                <input type="radio" checked={mode === 'crop'} onChange={() => setMode('crop')} style={{ marginRight: 6 }} />
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600 }}>裁剪</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>填满画面，裁掉边缘</div>
                </div>
              </label>
              <label style={{ ...S.radioCard, ...(mode === 'fit' ? S.radioCardActive : {}), flex: 1 }}>
                <input type="radio" checked={mode === 'fit'} onChange={() => setMode('fit')} style={{ marginRight: 6 }} />
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 600 }}>适应</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>保留全部画面，黑边补齐</div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitActive} disabled={!active || active.uploadState !== 'ready' || submitting}
                style={{ ...S.btnGhost, flex: 1, justifyContent: 'center', opacity: !active || active.uploadState !== 'ready' || submitting ? 0.4 : 1 }}>
                转换当前
              </button>
              <button onClick={submitAll} disabled={materials.filter(m => m.uploadState === 'ready').length === 0 || submitting}
                style={{ ...S.btnPrimary, flex: 2, justifyContent: 'center', gap: 5, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />处理中</> : '批量转换'}
              </button>
            </div>
          </div>

          {/* 预览 */}
          <div style={{ ...S.card, padding: 16, height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 10 }}>
              {active ? active.fileName : '从左侧选择素材'}
              <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                目标 {aspect} · {shortEdge}p · {mode === 'crop' ? '裁剪' : '适应'}
              </span>
            </div>
            <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
              {active?.streamUrl ? (
                <div style={{
                  position: 'relative',
                  width: aspectRatio < 1 ? `${aspectRatio * 100}%` : '90%',
                  maxWidth: 480,
                  aspectRatio: `${aspectRatio}`,
                }}>
                  <video src={active.resultUrl ?? active.streamUrl} controls
                    style={{ width: '100%', height: '100%', objectFit: mode === 'crop' ? 'cover' : 'contain', background: '#000' }} />
                  <div style={{ position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 4, background: 'rgba(20,184,166,0.85)', color: '#fff', fontSize: '0.66rem', fontWeight: 700 }}>
                    {aspect}
                  </div>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>添加素材后预览目标比例</div>
              )}
            </div>
            {active?.resultStatus === 'done' && (
              <div style={{ ...S.successBox, marginTop: 8 }}>✓ 已转换 · 上方播放为转换后视频</div>
            )}
          </div>
        </div>
      )}

      {tab === 'queue' && <QueueView tasks={tasks} setTasks={setTasks} onView={setView} />}

      {view && (
        <Modal onClose={() => setView(null)} maxWidth={680}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{view.fileName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            {view.aspect} · {view.shortEdge}p · {view.mode === 'crop' ? '裁剪' : '适应'}
          </div>
          {view.resultUrl && <video src={view.resultUrl} controls style={{ width: '100%', maxHeight: 360 }} />}
          {view.msg && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>{view.msg}</div>}
        </Modal>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── 任务队列 ────────────────────────────────────────────────────────────────

function QueueView({ tasks, setTasks, onView }: { tasks: ConvertTask[]; setTasks: (t: ConvertTask[]) => void; onView: (t: ConvertTask) => void }) {
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
              <th style={{ ...S.th, width: 90 }}>比例</th>
              <th style={{ ...S.th, width: 80 }}>短边</th>
              <th style={{ ...S.th, width: 60 }}>模式</th>
              <th style={{ ...S.th, width: 140 }}>创建时间</th>
              <th style={{ ...S.th, width: 70 }}>状态</th>
              <th style={{ ...S.th, width: 90 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (<tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>暂无记录</td></tr>)}
            {tasks.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={S.td} onClick={() => toggle(t.id)}>
                  {selected.has(t.id) ? <CheckSquare size={13} color="#14b8a6" style={{ cursor: 'pointer' }} /> : <Square size={13} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                </td>
                <td style={{ ...S.td, color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ ...S.td, maxWidth: 240 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.fileName}>{t.fileName}</span>
                </td>
                <td style={S.td}>{t.aspect}</td>
                <td style={S.td}>{t.shortEdge}p</td>
                <td style={S.td}>{t.mode === 'crop' ? '裁剪' : '适应'}</td>
                <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.createdAt}</td>
                <td style={S.td}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.status === 'done' ? '#22c55e' : t.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                    {t.status === 'done' ? '成功' : t.status === 'failed' ? '失败' : '处理中'}
                  </span>
                </td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {t.status === 'done' && t.resultUrl && <button onClick={() => onView(t)} style={S.linkBtn}>查看</button>}
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
  linkBtn:  { background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '0.72rem', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline', textUnderlineOffset: 2 } as React.CSSProperties,
  inp:      { padding: '5px 8px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.76rem', outline: 'none' } as React.CSSProperties,
  th:       { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const },
  td:       { padding: '8px 12px', verticalAlign: 'middle' as const },
  radioCard: { display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: 7, border: '1px solid var(--border-light)', cursor: 'pointer', background: 'var(--bg-primary)' } as React.CSSProperties,
  radioCardActive: { borderColor: '#14b8a6', background: 'rgba(20,184,166,0.06)' } as React.CSSProperties,
  successBox: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, fontSize: '0.74rem', background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' } as React.CSSProperties,
}
