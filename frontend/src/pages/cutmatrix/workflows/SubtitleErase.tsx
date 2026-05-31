import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, RefreshCw, Download, Trash2, Play, Pause,
  CheckSquare, Square, Video, Save, Eye, X,
  Upload, Loader, AlertCircle, Sparkles, Info,
} from 'lucide-react'
import { cmRemote } from '../../../lib/cm/cmApi'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubtitleRegion {
  x: number   // % from left
  y: number   // % from top
  w: number   // % width
  h: number   // % height
}

type RegionMode = 'single' | 'dual'
type FillMode = 'delogo' | 'black' | 'aliyun'
type EraseStatus = 'processing' | 'done' | 'failed'

interface EraseTask {
  id: string
  seq: number
  fileName: string
  fillMode: FillMode
  createdAt: string
  completedAt?: string
  status: EraseStatus
  expiresAt?: string
  resultUrl?: string
  errMsg?: string
}

type UploadState = 'idle' | 'uploading' | 'ready' | 'error'

interface MaterialItem {
  id: string
  title: string
  streamUrl: string       // for video player preview
  assetCode?: string      // required for API submit
  uploadState: UploadState
  uploadErr?: string
}

type TabKey = 'create' | 'queue'

// ─── Drag state ──────────────────────────────────────────────────────────────

type DragState =
  | { type: 'idle' }
  | { type: 'move'; rIdx: number; ox: number; oy: number; initR: SubtitleRegion }
  | { type: 'resize'; rIdx: number; corner: number; ox: number; oy: number; initR: SubtitleRegion }

// ─── Storage ─────────────────────────────────────────────────────────────────

const TASK_KEY = 'cm_subtitle_erase_tasks'

function loadTasks(): EraseTask[] {
  try { return JSON.parse(localStorage.getItem(TASK_KEY) ?? '[]') } catch { return [] }
}
function saveTasks(ts: EraseTask[]): void {
  try { localStorage.setItem(TASK_KEY, JSON.stringify(ts)) } catch { /* ignore */ }
}
function uid(): string { return `se-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }

function addDays(date: Date, n: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d.toLocaleString('zh-CN', { hour12: false }).replace(',', '')
}
function nowStr(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SubtitleErase() {
  const nav = useNavigate()
  const loc = useLocation()
  const locState = loc.state as { videoUrl?: string; title?: string } | null

  const [tab, setTab] = useState<TabKey>('create')

  // 素材列表
  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const initial: MaterialItem[] = []
    // 从 LinkIngest 导航传入的视频（sourceUrl 是平台链接，只能预览，需要另行上传才能处理）
    if (locState?.videoUrl) {
      initial.push({
        id: uid(),
        title: locState.title ?? '来自链接采集',
        streamUrl: locState.videoUrl,
        uploadState: 'idle',   // 还未上传到后端
      })
    }
    return initial
  })

  const [activeMat, setActiveMat] = useState<MaterialItem | null>(materials[0] ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const deleteMaterial = (id: string) => {
    setMaterials(ms => ms.filter(m => m.id !== id))
    setActiveMat(prev => {
      if (prev?.id !== id) return prev
      const remaining = materials.filter(m => m.id !== id)
      return remaining[0] ?? null
    })
  }

  // 区域设置
  const [mode, setMode] = useState<RegionMode>('single')
  const [regions, setRegions] = useState<SubtitleRegion[]>([
    { x: 5, y: 72, w: 90, h: 14 },
  ])
  const [fillMode, setFillMode] = useState<FillMode>('delogo')

  // 提交状态
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState<string | null>(null)

  // 播放状态
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // 拖拽
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState>({ type: 'idle' })

  // 任务队列
  const [tasks, setTasks] = useState<EraseTask[]>(() => loadTasks())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => { saveTasks(tasks) }, [tasks])

  // 模式切换同步区域数量
  useEffect(() => {
    if (mode === 'single') {
      setRegions(rs => rs.slice(0, 1))
    } else if (regions.length < 2) {
      setRegions(rs => [...rs, { x: 5, y: 5, w: 90, h: 12 }])
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // 切换素材时重置播放状态
  useEffect(() => {
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [activeMat?.id])

  // ─── 文件上传 ──────────────────────────────────────────────────────────────

  const handleFileSelect = async (file: File) => {
    const id = uid()
    const localUrl = URL.createObjectURL(file)
    const mat: MaterialItem = {
      id, title: file.name, streamUrl: localUrl, uploadState: 'uploading',
    }
    setMaterials(ms => [...ms, mat])
    setActiveMat(mat)

    try {
      const result = await cmRemote.uploadAsset(file)
      setMaterials(ms => ms.map(m => m.id === id
        ? { ...m, streamUrl: result.streamUrl, assetCode: result.assetCode, uploadState: 'ready' }
        : m))
      setActiveMat(prev => prev?.id === id
        ? { ...prev, streamUrl: result.streamUrl, assetCode: result.assetCode, uploadState: 'ready' }
        : prev)
    } catch (e) {
      const err = e instanceof Error ? e.message : '上传失败'
      setMaterials(ms => ms.map(m => m.id === id ? { ...m, uploadState: 'error', uploadErr: err } : m))
      setActiveMat(prev => prev?.id === id ? { ...prev, uploadState: 'error', uploadErr: err } : prev)
    }
  }

  // ─── 区域拖拽 ──────────────────────────────────────────────────────────────

  const getRelPos = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { rx: 0, ry: 0 }
    return {
      rx: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      ry: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    }
  }, [])

  const onMouseMove = useCallback((e: MouseEvent) => {
    const ds = dragRef.current
    if (ds.type === 'idle') return
    const { rx, ry } = getRelPos(e)
    const dx = rx - ds.ox
    const dy = ry - ds.oy
    const MIN = 4

    setRegions(rs => rs.map((r, i) => {
      if (ds.type === 'move' && i === ds.rIdx) {
        return {
          ...r,
          x: Math.max(0, Math.min(100 - r.w, ds.initR.x + dx)),
          y: Math.max(0, Math.min(100 - r.h, ds.initR.y + dy)),
        }
      }
      if (ds.type === 'resize' && i === ds.rIdx) {
        const { x, y, w, h } = ds.initR
        if (ds.corner === 0) {         // TL
          const nx = Math.max(0, Math.min(x + dx, x + w - MIN))
          const ny = Math.max(0, Math.min(y + dy, y + h - MIN))
          return { x: nx, y: ny, w: w - (nx - x), h: h - (ny - y) }
        } else if (ds.corner === 1) {  // TR
          const ny = Math.max(0, Math.min(y + dy, y + h - MIN))
          return { x, y: ny, w: Math.max(MIN, Math.min(100 - x, w + dx)), h: h - (ny - y) }
        } else if (ds.corner === 2) {  // BR
          return { x, y, w: Math.max(MIN, Math.min(100 - x, w + dx)), h: Math.max(MIN, Math.min(100 - y, h + dy)) }
        } else {                       // BL
          const nx = Math.max(0, Math.min(x + dx, x + w - MIN))
          return { x: nx, y, w: w - (nx - x), h: Math.max(MIN, Math.min(100 - y, h + dy)) }
        }
      }
      return r
    }))
  }, [getRelPos])

  const onMouseUp = useCallback(() => { dragRef.current = { type: 'idle' } }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const startMove = (e: React.MouseEvent, rIdx: number) => {
    e.preventDefault(); e.stopPropagation()
    const { rx, ry } = getRelPos(e)
    dragRef.current = { type: 'move', rIdx, ox: rx, oy: ry, initR: { ...regions[rIdx] } }
  }
  const startResize = (e: React.MouseEvent, rIdx: number, corner: number) => {
    e.preventDefault(); e.stopPropagation()
    const { rx, ry } = getRelPos(e)
    dragRef.current = { type: 'resize', rIdx, corner, ox: rx, oy: ry, initR: { ...regions[rIdx] } }
  }

  // ─── 视频控制 ──────────────────────────────────────────────────────────────

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
  }
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  // ─── 提交任务（真实 API 调用） ─────────────────────────────────────────────

  const submitTask = async () => {
    if (!activeMat) return
    setSubmitErr(null)

    // 需要 assetCode 才能调用后端
    if (!activeMat.assetCode) {
      setSubmitErr(
        activeMat.uploadState === 'uploading'
          ? '视频上传中，请稍候…'
          : '请先上传视频文件到服务器（点击「添加素材」选择本地文件）'
      )
      return
    }

    const taskId = uid()
    const newTask: EraseTask = {
      id: taskId,
      seq: tasks.length + 1,
      fileName: activeMat.title.length > 40 ? activeMat.title.slice(0, 40) + '…' : activeMat.title,
      fillMode,
      createdAt: nowStr(),
      status: 'processing',
    }
    setTasks(prev => [...prev, newTask])
    setTab('queue')
    setSubmitting(true)

    try {
      const result = await cmRemote.toolSubtitleErase({
        inputAssetCode: activeMat.assetCode,
        regions: regions.map(r => ({ x: r.x, y: r.y, w: r.w, h: r.h })),
        fillMode,
      })

      const completedAt = nowStr()
      const succeeded = result.status === 'SUCCEEDED'
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t,
        status: succeeded ? 'done' : 'failed',
        completedAt,
        expiresAt: succeeded ? addDays(new Date(), 1) : undefined,
        resultUrl: result.streamUrl,
        errMsg: succeeded ? undefined : (result.message ?? result.stderrTail?.slice(-200)),
      } : t))
    } catch (e) {
      const msg = e instanceof Error ? e.message : '请求失败'
      setTasks(prev => prev.map(t => t.id === taskId ? {
        ...t, status: 'failed', completedAt: nowStr(), errMsg: msg,
      } : t))
    } finally {
      setSubmitting(false)
    }
  }

  // ─── 任务队列操作 ──────────────────────────────────────────────────────────

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id).map((t, i) => ({ ...t, seq: i + 1 })))
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
  }
  const deleteAllDone = () => {
    setTasks(prev => prev.filter(t => t.status !== 'done').map((t, i) => ({ ...t, seq: i + 1 })))
    setSelected(new Set())
  }
  const batchDelete = () => {
    setTasks(prev => prev.filter(t => !selected.has(t.id)).map((t, i) => ({ ...t, seq: i + 1 })))
    setSelected(new Set())
  }
  const toggleOne = (id: string) => {
    const next = new Set(selected); if (next.has(id)) next.delete(id); else next.add(id); setSelected(next)
  }
  const allSelected = tasks.length > 0 && tasks.every(t => selected.has(t.id))
  const toggleAll = () => allSelected ? setSelected(new Set()) : setSelected(new Set(tasks.map(t => t.id)))

  const processing = tasks.filter(t => t.status === 'processing').length
  const done = tasks.filter(t => t.status === 'done').length
  const failed = tasks.filter(t => t.status === 'failed').length

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1500, margin: '0 auto' }}>
      <button onClick={() => nav(-1)} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回
      </button>

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
          <Video size={18} color="#14b8a6" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          擦除字幕
          {fillMode === 'delogo' && (
            <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>FFmpeg delogo</span>
          )}
          {fillMode === 'black' && (
            <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(100,116,139,0.15)', color: '#64748b', fontWeight: 700 }}>黑色覆盖</span>
          )}
          {fillMode === 'aliyun' && (
            <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(249,115,22,0.12)', color: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Sparkles size={10} />阿里云智能擦除
            </span>
          )}
        </h2>
      </div>

      {/* Tab 切换 */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: 0 }}>
        {(['create', 'queue'] as TabKey[]).map(k => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{
              padding: '8px 20px', border: 'none', background: 'transparent',
              fontSize: '0.85rem',
              fontWeight: tab === k ? 700 : 400,
              color: tab === k ? '#14b8a6' : 'var(--text-muted)',
              borderBottom: tab === k ? '2px solid #14b8a6' : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1,
            }}
          >
            {k === 'create' ? '创建任务' : `任务队列${tasks.length > 0 ? ` (${tasks.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Tab: 创建任务 ──────────────────────────────────────────────────── */}
      {tab === 'create' && (
        <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 230px)', minHeight: 520 }}>

          {/* 左侧素材面板 */}
          <div style={{ width: 210, flexShrink: 0, borderRight: '1px solid var(--border-light)', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-card)' }}>
            {/* 隐藏 file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = '' }}
            />

            <button
              style={{ ...S.btnGhost, justifyContent: 'center', gap: 6, fontSize: '0.76rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={13} />上传本地视频
            </button>
            <button style={{ ...S.btnGhost, justifyContent: 'center', gap: 6, fontSize: '0.76rem' }}>
              <Save size={13} />保存当前区域为模板
            </button>

            <div style={{ flex: 1, overflowY: 'auto', marginTop: 4 }}>
              {materials.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 24, lineHeight: 1.7 }}>
                  点击「上传本地视频」<br />添加待处理素材
                </div>
              )}
              {materials.map(m => (
                <div
                  key={m.id}
                  onClick={() => setActiveMat(m)}
                  style={{
                    padding: '7px 8px', borderRadius: 6, fontSize: '0.73rem', cursor: 'pointer',
                    marginBottom: 3,
                    background: activeMat?.id === m.id ? 'rgba(20,184,166,0.12)' : 'transparent',
                    color: activeMat?.id === m.id ? '#14b8a6' : 'var(--text-secondary)',
                    border: activeMat?.id === m.id ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.title}>
                      {m.title}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteMaterial(m.id) }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0, display: 'flex', alignItems: 'center' }}
                      title="移除素材"
                    >
                      <X size={11} />
                    </button>
                  </div>
                  <div style={{ marginTop: 2 }}>
                    {m.uploadState === 'uploading' && (
                      <span style={{ fontSize: '0.66rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Loader size={10} className="spin" />上传中…
                      </span>
                    )}
                    {m.uploadState === 'ready' && (
                      <span style={{ fontSize: '0.66rem', color: '#22c55e' }}>✓ 已上传</span>
                    )}
                    {m.uploadState === 'error' && (
                      <span style={{ fontSize: '0.66rem', color: '#ef4444' }}>✕ 上传失败</span>
                    )}
                    {m.uploadState === 'idle' && (
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>仅预览，需重新上传</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 8 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>模板</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>暂无模板</div>
            </div>
          </div>

          {/* 主编辑区 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* 顶部工具栏 */}
            <div style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', flexWrap: 'wrap' }}>
                {/* 区域模式 */}
                <div style={{ display: 'flex', gap: 16 }}>
                  {(['single', 'dual'] as RegionMode[]).map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', cursor: 'pointer' }}>
                      <input type="radio" name="regionMode" value={m} checked={mode === m} onChange={() => setMode(m)} style={{ accentColor: '#14b8a6' }} />
                      {m === 'single' ? '单区域' : '双区域'}
                    </label>
                  ))}
                </div>

                <div style={{ width: 1, height: 16, background: 'var(--border-light)', flexShrink: 0 }} />

                {/* 填充模式 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>擦除方式：</span>
                  {([
                    { v: 'delogo', label: '插值修复',   activeColor: '#14b8a6', activeBg: 'rgba(20,184,166,0.1)',   activeBorder: 'rgba(20,184,166,0.6)' },
                    { v: 'black',  label: '黑色覆盖',   activeColor: '#64748b', activeBg: 'rgba(100,116,139,0.1)', activeBorder: 'rgba(100,116,139,0.5)' },
                    { v: 'aliyun', label: '阿里云智能', activeColor: '#f97316', activeBg: 'rgba(249,115,22,0.1)',  activeBorder: 'rgba(249,115,22,0.6)', icon: <Sparkles size={10} /> },
                  ] as { v: FillMode; label: string; activeColor: string; activeBg: string; activeBorder: string; icon?: React.ReactNode }[]).map(({ v, label, activeColor, activeBg, activeBorder, icon }) => (
                    <button
                      key={v}
                      onClick={() => setFillMode(v)}
                      style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        border: fillMode === v ? `1px solid ${activeBorder}` : '1px solid var(--border-light)',
                        background: fillMode === v ? activeBg : 'transparent',
                        color: fillMode === v ? activeColor : 'var(--text-secondary)',
                        fontWeight: fillMode === v ? 700 : 400,
                      }}
                    >
                      {fillMode === v && icon}
                      {label}
                    </button>
                  ))}
                </div>

                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  当前素材比例 {activeMat ? '9:16' : '—'}
                </span>
              </div>

              {/* 阿里云模式说明栏 */}
              {fillMode === 'aliyun' && (
                <div style={{ margin: '0 16px 10px', padding: '8px 12px', borderRadius: 8, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Info size={13} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: '0.72rem', color: '#c2410c', lineHeight: 1.6 }}>
                    <strong>阿里云 VIAPI 智能擦除</strong>：AI 修复效果最优，处理时间较长（通常 30s～3min）。
                    需在服务端配置 <code style={{ background: 'rgba(249,115,22,0.1)', padding: '0 4px', borderRadius: 3 }}>cm.aliyun.access-key-id</code> 与 <code style={{ background: 'rgba(249,115,22,0.1)', padding: '0 4px', borderRadius: 3 }}>cm.aliyun.access-key-secret</code>，
                    且 <code style={{ background: 'rgba(249,115,22,0.1)', padding: '0 4px', borderRadius: 3 }}>cutmatrix.base-url</code> 须为阿里云可访问的公网地址。
                  </div>
                </div>
              )}
            </div>

            {/* 视频 + 区域覆盖层 */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', overflow: 'hidden', position: 'relative' }}>
              {!activeMat ? (
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <Video size={40} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: '0.84rem' }}>从左侧上传素材</div>
                </div>
              ) : activeMat.uploadState === 'uploading' ? (
                <div style={{ textAlign: 'center', color: '#999' }}>
                  <Loader size={32} style={{ marginBottom: 10, animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '0.84rem' }}>上传中…</div>
                </div>
              ) : (
                <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <video
                    ref={videoRef}
                    src={activeMat.streamUrl}
                    style={{ maxHeight: '100%', maxWidth: '100%', display: 'block', objectFit: 'contain' }}
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                    onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
                    onEnded={() => setPlaying(false)}
                  />
                  {/* 区域覆盖层 */}
                  <div ref={containerRef} style={{ position: 'absolute', inset: 0, cursor: 'crosshair' }}>
                    {regions.map((r, rIdx) => (
                      <RegionBox
                        key={rIdx}
                        region={r}
                        label={mode === 'dual' ? `字幕区域 ${rIdx + 1}` : '字幕区域'}
                        onMove={e => startMove(e, rIdx)}
                        onResize={(e, corner) => startResize(e, rIdx, corner)}
                      />
                    ))}
                  </div>
                  {!playing && (
                    <button onClick={togglePlay} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                      <Play size={20} fill="#fff" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 播放控制 + 提交 */}
            <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', padding: '8px 16px', flexShrink: 0 }}>
              {submitErr && (
                <div style={{ ...S.errBox, marginBottom: 8 }}>
                  <AlertCircle size={13} />{submitErr}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <button onClick={togglePlay} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {fmt(currentTime)} / {fmt(duration)}
                </span>
                <button
                  onClick={submitTask}
                  disabled={submitting || !activeMat || activeMat.uploadState !== 'ready'}
                  style={{
                    ...S.btnPrimary,
                    marginLeft: 'auto',
                    opacity: (submitting || !activeMat || activeMat.uploadState !== 'ready') ? 0.5 : 1,
                    gap: 6,
                  }}
                >
                  {submitting
                    ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />处理中…</>
                    : fillMode === 'aliyun'
                      ? <><Sparkles size={13} />提交云端任务</>
                      : '提交任务'}
                </button>
              </div>
              <input
                type="range" min={0} max={duration || 1} value={currentTime}
                onChange={e => {
                  const v = Number(e.target.value)
                  if (videoRef.current) videoRef.current.currentTime = v
                  setCurrentTime(v)
                }}
                style={{ width: '100%', accentColor: '#14b8a6', height: 4 }}
              />
              {activeMat && activeMat.uploadState !== 'ready' && (
                <div style={{ fontSize: '0.68rem', color: '#f59e0b', marginTop: 4 }}>
                  {activeMat.uploadState === 'idle' && '⚠ 该素材来自链接，需重新上传本地文件后才能提交处理'}
                  {activeMat.uploadState === 'error' && `⚠ 上传失败：${activeMat.uploadErr ?? '未知错误'}`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: 任务队列 ──────────────────────────────────────────────────── */}
      {tab === 'queue' && (
        <div style={{ paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>任务队列</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                共 {tasks.length} 个任务，处理中 {processing}，已完成 {done}，失败 {failed}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setTasks(loadTasks())} style={S.btnGhost}>
                <RefreshCw size={12} style={{ marginRight: 4 }} />刷新
              </button>
              <button onClick={deleteAllDone} style={S.btnGhost}>
                <Trash2 size={12} style={{ marginRight: 4 }} />删除全部已完成
              </button>
              <button style={{ ...S.btnPrimary, gap: 6 }}>
                <Download size={13} />下载全部
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>当前页已选 {selected.size} 条</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.btnGhost}><Download size={12} style={{ marginRight: 4 }} />批量下载</button>
              <button onClick={batchDelete} disabled={selected.size === 0} style={{ ...S.btnGhost, color: '#ef4444', opacity: selected.size === 0 ? 0.4 : 1 }}>
                <Trash2 size={12} style={{ marginRight: 4 }} />批量删除
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ ...S.th, width: 36 }}>
                    <span onClick={toggleAll} style={{ cursor: 'pointer' }}>
                      {allSelected ? <CheckSquare size={14} color="#14b8a6" /> : <Square size={14} color="var(--text-muted)" />}
                    </span>
                  </th>
                  <th style={{ ...S.th, width: 50 }}>序号</th>
                  <th style={S.th}>文件名</th>
                  <th style={{ ...S.th, width: 100 }}>擦除方式</th>
                  <th style={{ ...S.th, width: 150 }}>创建时间</th>
                  <th style={{ ...S.th, width: 150 }}>完成时间</th>
                  <th style={{ ...S.th, width: 90 }}>状态</th>
                  <th style={{ ...S.th, width: 150 }}>过期时间</th>
                  <th style={{ ...S.th, width: 110 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      暂无任务，在「创建任务」标签页提交
                    </td>
                  </tr>
                )}
                {tasks.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: idx < tasks.length - 1 ? '1px solid var(--border-light)' : 'none', background: selected.has(t.id) ? 'rgba(20,184,166,0.04)' : 'transparent' }}>
                    <td style={S.td} onClick={() => toggleOne(t.id)}>
                      {selected.has(t.id)
                        ? <CheckSquare size={14} color="#14b8a6" style={{ cursor: 'pointer' }} />
                        : <Square size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                    </td>
                    <td style={{ ...S.td, color: 'var(--text-muted)' }}>{t.seq}</td>
                    <td style={{ ...S.td, maxWidth: 260 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.fileName}>
                        {t.fileName}
                      </div>
                      {t.errMsg && (
                        <div style={{ fontSize: '0.66rem', color: '#ef4444', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.errMsg}>
                          {t.errMsg}
                        </div>
                      )}
                    </td>
                    <td style={S.td}><FillModeBadge mode={t.fillMode} /></td>
                    <td style={{ ...S.td, color: 'var(--text-muted)', fontSize: '0.72rem' }}>{t.createdAt}</td>
                    <td style={{ ...S.td, color: 'var(--text-muted)', fontSize: '0.72rem' }}>{t.completedAt ?? '—'}</td>
                    <td style={S.td}><StatusBadge status={t.status} /></td>
                    <td style={{ ...S.td, color: 'var(--text-muted)', fontSize: '0.72rem' }}>{t.expiresAt ?? '—'}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {t.status === 'done' && t.resultUrl && (
                          <button onClick={() => setPreviewUrl(t.resultUrl!)} style={S.linkBtn}>
                            <Eye size={11} style={{ marginRight: 2 }} />查看
                          </button>
                        )}
                        {t.status === 'processing' && (
                          <span style={{ fontSize: '0.7rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />处理中
                          </span>
                        )}
                        <button onClick={() => deleteTask(t.id)} style={{ ...S.linkBtn, color: '#ef4444' }}>
                          <Trash2 size={11} style={{ marginRight: 2 }} />删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 视频预览 Modal */}
      {previewUrl && (
        <div onClick={() => setPreviewUrl(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button onClick={() => setPreviewUrl(null)} style={{ position: 'absolute', top: -36, right: 0, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={22} />
            </button>
            <video src={previewUrl} controls autoPlay style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: 8 }} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── 区域框 ───────────────────────────────────────────────────────────────────

function RegionBox({ region, label, onMove, onResize }: {
  region: SubtitleRegion; label: string
  onMove: (e: React.MouseEvent) => void
  onResize: (e: React.MouseEvent, corner: number) => void
}) {
  const { x, y, w, h } = region
  const corners = [
    { c: 0, style: { top: -4, left: -4, cursor: 'nw-resize' } },
    { c: 1, style: { top: -4, right: -4, cursor: 'ne-resize' } },
    { c: 2, style: { bottom: -4, right: -4, cursor: 'se-resize' } },
    { c: 3, style: { bottom: -4, left: -4, cursor: 'sw-resize' } },
  ]
  return (
    <div
      onMouseDown={onMove}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, border: '2px dashed rgba(20,184,166,0.9)', background: 'rgba(20,184,166,0.15)', cursor: 'move', boxSizing: 'border-box', userSelect: 'none' }}
    >
      <div style={{ position: 'absolute', top: 2, left: 4, fontSize: 10, color: '#14b8a6', fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap' }}>{label}</div>
      {corners.map(({ c, style }) => (
        <div key={c} onMouseDown={e => onResize(e, c)} style={{ position: 'absolute', width: 8, height: 8, background: '#14b8a6', borderRadius: 1, ...style }} />
      ))}
    </div>
  )
}

// ─── 填充模式徽章 ─────────────────────────────────────────────────────────────

function FillModeBadge({ mode }: { mode: FillMode }) {
  if (mode === 'aliyun') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600, color: '#f97316', background: 'rgba(249,115,22,0.1)' }}>
        <Sparkles size={9} />阿里云
      </span>
    )
  }
  return (
    <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}>
      {mode === 'black' ? '黑色' : 'delogo'}
    </span>
  )
}

// ─── 状态徽章 ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EraseStatus }) {
  const map: Record<EraseStatus, { label: string; color: string; bg: string }> = {
    processing: { label: '处理中', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    done:       { label: '成功',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
    failed:     { label: '失败',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  }
  const { label, color, bg } = map[status]
  return <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, color, background: bg }}>{label}</span>
}

// ─── 样式 ─────────────────────────────────────────────────────────────────────

const S = {
  backBtn:   { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  btnGhost:  { display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  btnPrimary:{ display: 'inline-flex', alignItems: 'center', padding: '7px 16px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 } as React.CSSProperties,
  linkBtn:   { display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: 4, border: 'none', background: 'transparent', color: '#14b8a6', fontSize: '0.72rem', cursor: 'pointer' } as React.CSSProperties,
  errBox:    { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' } as React.CSSProperties,
  th: { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const },
  td: { padding: '10px 12px', verticalAlign: 'middle' as const },
}
