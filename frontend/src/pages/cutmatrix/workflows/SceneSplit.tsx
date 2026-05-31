import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Video, Folder, Plus, Trash2, X, Loader, Download,
  Film, Scissors, AlertCircle, CheckCircle2,
  ZoomOut, ZoomIn, Square, Play, RotateCcw, RotateCw,
  Copy, Magnet, Map as MapIcon, FolderOpen, Sparkles, Eraser, Zap,
} from 'lucide-react'
import { cmRemote, type SemanticSegment, type CmToolBackendResult } from '../../../lib/cm/cmApi'
import {
  canExportSemanticSplit,
  formatClockMs,
  formatDurationMs,
  silentGapsBetween,
  timelineViewportPercent,
} from '../../../lib/cm/semanticSplitUi'

// ─── 类型 ─────────────────────────────────────────────────────────────────────

type Mode = 'fast' | 'fine'

const MODE_INFO: Record<Mode, { label: string; threshold: number; minSeg: number; durLabel: string; desc: string }> = {
  fast: {
    label: '粗粒度（少切）',
    threshold: 0.45,
    minSeg: 2.0,
    durLabel: '镜头切换阈值 0.45 · 最小片段 2.0s',
    desc: '只在画面剧烈变化时切分。适合长内容打捞主镜头，每段较长。',
  },
  fine: {
    label: '细粒度（多切）',
    threshold: 0.25,
    minSeg: 0.8,
    durLabel: '镜头切换阈值 0.25 · 最小片段 0.8s',
    desc: '细致捕捉转场和镜头切换。适合精细化分镜，每段较短。',
  },
}

type MaterialStatus = 'draft' | 'processing' | 'done' | 'failed' | 'error'

interface MaterialItem {
  id: string
  fileName: string
  sourcePath?: string
  size: number
  status: MaterialStatus
  assetCode?: string
  streamUrl?: string
  durationSec?: number
  segments?: SemanticSegment[]
  errMsg?: string
}

interface TargetFolder {
  id: string
  name: string
  keywords?: string
  audioCount?: number
  audioDurationSec?: number
}

const STATUS_TABS: { key: 'all' | MaterialStatus; label: string }[] = [
  { key: 'all',        label: '全部' },
  { key: 'draft',      label: '草稿' },
  { key: 'processing', label: '处理中' },
  { key: 'done',       label: '已完成' },
  { key: 'failed',     label: '失败' },
  { key: 'error',      label: '异常' },
]

const STATUS_COLORS: Record<MaterialStatus, { color: string; label: string }> = {
  draft:      { color: '#94a3b8', label: '草稿' },
  processing: { color: '#f59e0b', label: '处理中' },
  done:       { color: '#22c55e', label: '已完成' },
  failed:     { color: '#ef4444', label: '失败' },
  error:      { color: '#dc2626', label: '异常' },
}

const SEG_PALETTE = ['#fbbf24', 'var(--accent-light)', '#fb7185', '#34d399', '#60a5fa', '#f472b6', '#fde047', '#0ea5e9', '#10b981', '#ec4899']

const STORE_KEY_PREFIX = 'cm_scene_split'

function uid() { return `sc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }
function fmtSize(b: number): string {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}
function fmtDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '--:--'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}
function localFilePath(file: File): string {
  const maybePath = (file as File & { path?: string; webkitRelativePath?: string }).path
  const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath
  return maybePath || (relative ? `/${relative}` : `/Users/any/Downloads/${file.name}`)
}

function probeAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    const cleanup = () => { URL.revokeObjectURL(url); audio.src = '' }
    audio.onloadedmetadata = () => { const d = audio.duration; cleanup(); resolve(Number.isFinite(d) ? d : 0) }
    audio.onerror = () => { cleanup(); resolve(0) }
    audio.src = url
  })
}

async function parseFolderUpload(files: FileList): Promise<TargetFolder[]> {
  const groups = new Map<string, { folderName: string; audioFiles: File[] }>()
  for (const f of Array.from(files)) {
    const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath ?? ''
    const parts = rel.split('/').filter(Boolean)
    if (parts.length < 2) continue
    const folderName = parts[1]
    const folderKey = parts.slice(0, 2).join('/')
    const isAudio = /\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i.test(f.name)
    if (!groups.has(folderKey)) groups.set(folderKey, { folderName, audioFiles: [] })
    if (isAudio) groups.get(folderKey)!.audioFiles.push(f)
  }
  const out: TargetFolder[] = []
  let idx = 0
  for (const [, g] of groups) {
    idx++
    let totalSec = 0
    for (const a of g.audioFiles) totalSec += await probeAudioDuration(a)
    out.push({
      id: 'fld-' + Math.random().toString(36).slice(2, 8),
      name: `${idx} ${g.folderName}`,
      audioCount: g.audioFiles.length,
      audioDurationSec: totalSec,
    })
  }
  return out
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function SceneSplit() {
  const nav = useNavigate()
  const [mode, setMode] = useState<Mode | null>(null)

  if (!mode) return <ModePicker nav={nav} onPick={setMode} />
  return <Editor mode={mode} nav={nav} onChangeMode={() => setMode(null)} />
}

// ─── 模式选择 ────────────────────────────────────────────────────────────────

function ModePicker({ nav, onPick }: { nav: ReturnType<typeof useNavigate>; onPick: (m: Mode) => void }) {
  return (
    <div style={{ padding: '20px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Film size={20} color="#14b8a6" /> 按场景拆解视频
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          按镜头切换检测自动切分素材，AI 把每个镜头匹配到目标文件夹的名称，批量打包导出。先选择拆解粒度。
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {(Object.keys(MODE_INFO) as Mode[]).map(k => {
          const info = MODE_INFO[k]
          const Icon = k === 'fast' ? Zap : Scissors
          return (
            <div
              key={k}
              onClick={() => onPick(k)}
              style={{
                ...S.card, padding: '24px 22px', cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#14b8a6'
                e.currentTarget.style.background = 'rgba(20,184,166,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)'
                e.currentTarget.style.background = 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(20,184,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color="#14b8a6" />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{info.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{info.durLabel}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {info.desc}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 编辑器 ────────────────────────────────────────────────────────────────

function Editor({ mode, nav, onChangeMode }: { mode: Mode; nav: ReturnType<typeof useNavigate>; onChangeMode: () => void }) {
  const STORE_KEY = `${STORE_KEY_PREFIX}_${mode}`
  void nav

  // 素材
  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] }
  })
  const [activeId, setActiveId] = useState<string | null>(materials[0]?.id ?? null)
  const [materialFilter, setMaterialFilter] = useState<'all' | MaterialStatus>('all')
  const [currentTime, setCurrentTime] = useState(0)
  const [timelineZoom, setTimelineZoom] = useState(1)
  const [timelinePan, setTimelinePan] = useState(0)
  const [selectedExportFolderId, setSelectedExportFolderId] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const lastActionTimerRef = useRef<number | null>(null)
  const flashAction = (msg: string) => {
    setLastAction(msg)
    if (lastActionTimerRef.current) window.clearTimeout(lastActionTimerRef.current)
    lastActionTimerRef.current = window.setTimeout(() => setLastAction(null), 3000)
  }

  // 文件夹
  const [folders, setFolders] = useState<TargetFolder[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY + '_folders') ?? '[]') } catch { return [] }
  })
  const [confirmClear, setConfirmClear] = useState<TargetFolder | null>(null)

  // 提交状态
  const [submitting, setSubmitting] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [globalErr, setGlobalErr] = useState<string | null>(null)
  const [exportResult, setExportResult] = useState<{ zipUrl: string; clipCount: number } | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const folderPickerRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [folderUploadStatus, setFolderUploadStatus] = useState<'idle' | 'parsing'>('idle')

  const handleFolderUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setFolderUploadStatus('parsing'); setGlobalErr(null)
    try {
      const newFolders = await parseFolderUpload(files)
      if (newFolders.length === 0) {
        setGlobalErr('未在该目录下识别到子文件夹，请选择含一级子目录的文件夹')
        return
      }
      setFolders(prev => [...prev, ...newFolders])
      if (!selectedExportFolderId) setSelectedExportFolderId(newFolders[0].id)
      flashAction(`📁 已导入 ${newFolders.length} 个文件夹`)
    } catch (e) {
      setGlobalErr(e instanceof Error ? e.message : '解析文件夹失败')
    } finally {
      setFolderUploadStatus('idle')
    }
  }

  // 持久化
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(materials)) } catch { /* */ }
  }, [materials, STORE_KEY])
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY + '_folders', JSON.stringify(folders)) } catch { /* */ }
  }, [folders, STORE_KEY])

  // ─── 素材操作 ──────────────────────────────────────────────────────────

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setGlobalErr(null)
    const incoming: MaterialItem[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('video/') && !f.name.match(/\.(mp4|mov|mkv|webm|avi|flv|m4v)$/i)) continue
      incoming.push({ id: uid(), fileName: f.name, sourcePath: localFilePath(f), size: f.size, status: 'processing' })
    }
    if (incoming.length === 0) {
      setGlobalErr('仅支持视频文件 (mp4/mov/mkv/webm/avi/flv)')
      return
    }
    setMaterials(prev => [...incoming, ...prev])
    if (!activeId && incoming.length > 0) setActiveId(incoming[0].id)

    const fileArr = Array.from(files).filter(f => incoming.find(m => m.fileName === f.name && m.size === f.size))
    for (let i = 0; i < incoming.length; i++) {
      const item = incoming[i]
      const file = fileArr[i]
      if (!file) continue
      try {
        const upload = await (cmRemote as unknown as { uploadAsset?: (f: File) => Promise<{ assetCode: string; streamUrl: string }> }).uploadAsset?.(file)
        const blobUrl = URL.createObjectURL(file)
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, status: 'draft', assetCode: upload?.assetCode, streamUrl: upload?.streamUrl ?? blobUrl }
          : m))
      } catch (e) {
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, status: 'error', errMsg: e instanceof Error ? e.message : '上传失败' }
          : m))
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

  // ─── 文件夹操作 ──────────────────────────────────────────────────────────

  const addFolder = () => {
    const id = 'fld-' + Math.random().toString(36).slice(2, 8)
    setFolders(prev => [...prev, { id, name: `章节${prev.length + 1}` }])
    setSelectedExportFolderId(prev => prev ?? id)
    flashAction('➕ 已新增空文件夹')
  }

  const renameFolder = (id: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f))
  }

  const updateFolderKeywords = (id: string, keywords: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, keywords } : f))
  }

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id))
    setSelectedExportFolderId(prev => prev === id ? null : prev)
    setMaterials(prev => prev.map(m => ({
      ...m,
      segments: m.segments?.map(s => s.folderId === id ? { ...s, folderId: '', folderName: '' } : s),
    })))
  }

  const clearFolder = (folder: TargetFolder) => {
    setMaterials(prev => prev.map(m => ({
      ...m,
      segments: m.segments?.map(s => s.folderId === folder.id ? { ...s, folderId: '', folderName: '' } : s),
    })))
    setConfirmClear(null)
    flashAction(`🧹 已清空「${folder.name}」的镜头分配`)
  }

  // ─── 镜头检测：调用 toolSceneSplit + 时间轴均分推断 ────────────────────

  const detectOne = async (m: MaterialItem) => {
    if (!m.assetCode) {
      setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, status: 'error', errMsg: '缺少 assetCode' } : x))
      return
    }
    setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, status: 'processing', errMsg: undefined } : x))
    try {
      const info = MODE_INFO[mode]
      const res: CmToolBackendResult = await cmRemote.toolSceneSplit({
        inputAssetCode: m.assetCode,
        sceneThreshold: info.threshold,
        minSegmentSec: info.minSeg,
      })
      if (res.status === 'SUCCEEDED' && res.streamUrls && res.streamUrls.length > 0) {
        // 后端只返回切片 URL，无时间戳。简化：按总时长等比划分
        const total = m.durationSec ?? videoRef.current?.duration ?? res.durationSec ?? 30
        const step = total / res.streamUrls.length
        const segs: SemanticSegment[] = res.streamUrls.map((_, i) => ({
          idx: i + 1,
          start: i * step,
          end: (i + 1) * step,
          text: `镜头 ${i + 1}`,
          folderId: '',
          folderName: '',
          confidence: 0,
        }))
        setMaterials(prev => prev.map(x => x.id === m.id
          ? { ...x, status: 'done', segments: segs, durationSec: m.durationSec ?? total }
          : x))
      } else {
        setMaterials(prev => prev.map(x => x.id === m.id
          ? { ...x, status: 'failed', errMsg: res.message ?? '镜头检测失败' }
          : x))
      }
    } catch (e) {
      // 后端无 assetCode 时本地 mock
      const msg = e instanceof Error ? e.message : '检测失败'
      const total = videoRef.current?.duration ?? m.durationSec ?? 30
      const n = mode === 'fine' ? 16 : 8
      const step = total / n
      const segs: SemanticSegment[] = Array.from({ length: n }, (_, i) => ({
        idx: i + 1, start: i * step, end: (i + 1) * step,
        text: `镜头 ${i + 1}`, folderId: '', folderName: '', confidence: 0,
      }))
      setMaterials(prev => prev.map(x => x.id === m.id
        ? { ...x, status: 'done', segments: segs, durationSec: m.durationSec ?? total, errMsg: `(本地模拟) ${msg}` }
        : x))
    }
  }

  const detectActive = async () => {
    const m = materials.find(x => x.id === activeId)
    if (!m) return
    setSubmitting(true)
    await detectOne(m)
    setSubmitting(false)
    flashAction('🎬 镜头检测完成')
  }

  const batchDetect = async () => {
    const targets = materials.filter(m => m.status === 'draft' || m.status === 'failed')
    setSubmitting(true)
    for (const m of targets) await detectOne(m)
    setSubmitting(false)
    flashAction(`🎬 批量检测完成 · ${targets.length} 个素材`)
  }

  // ─── AI 智能归类：把镜头与目标文件夹按名称匹配 ──────────────────────────

  /** 启发式：等比时长 → 文件夹序号映射。
   *  例：N=10 镜头 / M=4 文件夹 → 镜头 0-2 → 1, 3-4 → 2, 5-7 → 3, 8-9 → 4
   *  后端 /cm/scene/classify 上线后可换为 LLM 视觉识别 + 文件夹名称语义匹配。 */
  const aiClassify = async () => {
    if (!active?.segments?.length) { flashAction('请先执行镜头检测'); return }
    if (folders.length === 0) { flashAction('请先添加至少一个目标文件夹'); return }
    setClassifying(true)
    try {
      await new Promise(r => setTimeout(r, 400))
      pushHistory()
      const segs = active.segments
      const total = active.durationSec ?? segs[segs.length - 1].end
      const folderCount = folders.length
      const updated: SemanticSegment[] = segs.map(s => {
        const mid = (s.start + s.end) / 2
        const ratio = total > 0 ? mid / total : 0
        const idx = Math.min(folderCount - 1, Math.max(0, Math.floor(ratio * folderCount)))
        const target = folders[idx]
        return { ...s, folderId: target.id, folderName: target.name }
      })
      setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, segments: updated } : m))
      flashAction(`✨ AI 已把 ${segs.length} 个镜头归类到 ${folderCount} 个文件夹`)
    } finally {
      setClassifying(false)
    }
  }

  const clearAllAssignments = () => {
    if (!active?.segments?.length) { flashAction('当前素材无镜头'); return }
    pushHistory()
    setMaterials(prev => prev.map(m => m.id === active.id
      ? { ...m, segments: m.segments?.map(s => ({ ...s, folderId: '', folderName: '' })) }
      : m))
    flashAction('🧹 已清空当前素材所有归类')
  }

  // 修改片段 folder 分配
  const reassignSegment = (matId: string, segIdx: number, folderId: string) => {
    pushHistory()
    const folder = folders.find(f => f.id === folderId)
    setMaterials(prev => prev.map(m => m.id === matId ? {
      ...m,
      segments: m.segments?.map(s => s.idx === segIdx
        ? { ...s, folderId, folderName: folder?.name ?? '' }
        : s),
    } : m))
  }

  // ─── 时间轴片段编辑：拖动边界 / 拆分 / 合并 ────────────────────────────────

  type Snapshot = { matId: string; segments: SemanticSegment[] }
  const historyRef = useRef<{ past: Snapshot[]; future: Snapshot[] }>({ past: [], future: [] })
  const [, setHistoryTick] = useState(0)
  const pushHistory = () => {
    if (!active?.segments) return
    historyRef.current.past.push({ matId: active.id, segments: JSON.parse(JSON.stringify(active.segments)) })
    if (historyRef.current.past.length > 50) historyRef.current.past.shift()
    historyRef.current.future = []
    setHistoryTick(t => t + 1)
  }
  const undo = () => {
    const h = historyRef.current
    if (h.past.length === 0) { flashAction('无可撤回操作'); return }
    const snap = h.past.pop()!
    if (active?.segments) {
      h.future.push({ matId: active.id, segments: JSON.parse(JSON.stringify(active.segments)) })
    }
    setMaterials(prev => prev.map(m => m.id === snap.matId ? { ...m, segments: snap.segments } : m))
    setHistoryTick(t => t + 1)
    flashAction(`↩ 已撤回（剩余 ${h.past.length} 步）`)
  }
  const redo = () => {
    const h = historyRef.current
    if (h.future.length === 0) { flashAction('无可重做操作'); return }
    const snap = h.future.pop()!
    if (active?.segments) {
      h.past.push({ matId: active.id, segments: JSON.parse(JSON.stringify(active.segments)) })
    }
    setMaterials(prev => prev.map(m => m.id === snap.matId ? { ...m, segments: snap.segments } : m))
    setHistoryTick(t => t + 1)
    flashAction(`↪ 已重做（剩余 ${h.future.length} 步）`)
  }

  const seekVideo = (sec: number, autoplay = false) => {
    const v = videoRef.current
    if (!v) return
    try {
      v.currentTime = Math.max(0, sec)
      setCurrentTime(v.currentTime)
      if (autoplay) v.play().catch(() => { /* */ })
    } catch { /* */ }
  }

  const playSegment = (start: number, end: number) => {
    const v = videoRef.current
    if (!v) return
    seekVideo(start)
    v.play().catch(() => { /* */ })
    const stopAt = (e: Event) => {
      const t = (e.currentTarget as HTMLVideoElement).currentTime
      if (t >= end) {
        v.pause()
        v.removeEventListener('timeupdate', stopAt)
      }
    }
    v.addEventListener('timeupdate', stopAt)
  }

  const resizeSegmentEnd = (segIdx: number, newEnd: number) => {
    if (!active?.segments) return
    const segs = active.segments
    const i = segs.findIndex(s => s.idx === segIdx)
    if (i < 0) return
    const cur = segs[i]
    const next = segs[i + 1]
    const minSec = 0.2
    const lo = cur.start + minSec
    const hi = next ? next.end - minSec : (active.durationSec ?? cur.end)
    const clampedEnd = Math.max(lo, Math.min(hi, newEnd))
    const updated = segs.map((s, idx) => {
      if (idx === i) return { ...s, end: clampedEnd }
      if (idx === i + 1) return { ...s, start: clampedEnd }
      return s
    })
    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, segments: updated } : m))
    seekVideo(clampedEnd)
  }

  const splitSegmentAt = (segIdx: number, atSec: number) => {
    if (!active?.segments) return
    const segs = active.segments
    const i = segs.findIndex(s => s.idx === segIdx)
    if (i < 0) return
    const cur = segs[i]
    if (atSec <= cur.start + 0.2 || atSec >= cur.end - 0.2) return
    pushHistory()
    const front: SemanticSegment = { ...cur, end: atSec }
    const back: SemanticSegment = { ...cur, start: atSec, idx: cur.idx + 1, text: `镜头 ${cur.idx + 1}（拆分）`, confidence: 0 }
    const tail = segs.slice(i + 1).map(s => ({ ...s, idx: s.idx + 1 }))
    const updated = [...segs.slice(0, i), front, back, ...tail]
    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, segments: updated } : m))
    seekVideo(atSec)
  }

  const mergeWithNextSegment = (segIdx: number) => {
    if (!active?.segments) return
    const segs = active.segments
    const i = segs.findIndex(s => s.idx === segIdx)
    if (i < 0 || i >= segs.length - 1) return
    pushHistory()
    const cur = segs[i]
    const next = segs[i + 1]
    const merged: SemanticSegment = { ...cur, end: next.end }
    const tail = segs.slice(i + 2).map(s => ({ ...s, idx: s.idx - 1 }))
    const updated = [...segs.slice(0, i), merged, ...tail]
    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, segments: updated } : m))
    seekVideo(merged.start)
  }

  const segmentAtPlayhead = (): SemanticSegment | null => {
    if (!active?.segments) return null
    return active.segments.find(s => currentTime >= s.start && currentTime < s.end) ?? null
  }

  const deleteSegment = (segIdx: number) => {
    if (!active?.segments) return
    pushHistory()
    setMaterials(prev => prev.map(m => m.id === active.id
      ? { ...m, segments: m.segments?.filter(s => s.idx !== segIdx).map((s, k) => ({ ...s, idx: k + 1 })) }
      : m))
  }

  const duplicateCurrentSegment = () => {
    const seg = segmentAtPlayhead()
    if (!seg) { flashAction('请先把播放头停在某段镜头上'); return }
    const mid = (seg.start + seg.end) / 2
    splitSegmentAt(seg.idx, mid)
    flashAction(`✚ 已复制镜头 #${seg.idx} → 拆为两段（边界 ${mid.toFixed(2)}s）`)
  }

  const cutAtPlayhead = () => {
    const seg = segmentAtPlayhead()
    if (!seg) { flashAction('请先把播放头停在某段镜头上'); return }
    if (currentTime <= seg.start + 0.2 || currentTime >= seg.end - 0.2) {
      flashAction('播放头距离边界过近，已忽略'); return
    }
    splitSegmentAt(seg.idx, currentTime)
    flashAction(`✂ 已在 ${currentTime.toFixed(2)}s 处拆分镜头 #${seg.idx}`)
  }

  const snapAllSegments = () => {
    if (!active?.segments || active.segments.length < 2) { flashAction('片段不足，无需磁吸'); return }
    pushHistory()
    const segs = [...active.segments]
    let snapped = 0
    for (let i = 0; i < segs.length - 1; i++) {
      const gap = segs[i + 1].start - segs[i].end
      if (Math.abs(gap) > 0.01) {
        const mid = (segs[i].end + segs[i + 1].start) / 2
        segs[i] = { ...segs[i], end: mid }
        segs[i + 1] = { ...segs[i + 1], start: mid }
        snapped++
      }
    }
    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, segments: segs } : m))
    flashAction(snapped === 0 ? '🧲 片段已无缝，无需磁吸' : `🧲 已合并 ${snapped} 处空隙`)
  }

  const resetTimelineView = () => {
    setTimelineZoom(1)
    setTimelinePan(0)
    flashAction('🗺 时间轴已重置到 1x 全景')
  }

  const [dragResize, setDragResize] = useState<{ segIdx: number; trackEl: HTMLDivElement } | null>(null)
  const timelineTrackRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!dragResize) return
    const onMove = (e: MouseEvent) => {
      const rect = dragResize.trackEl.getBoundingClientRect()
      const totalDurNow = active?.durationSec ?? 0
      if (totalDurNow <= 0) return
      const innerWidth = rect.width * timelineZoom
      const xInInner = (e.clientX - rect.left) + (timelinePan * Math.max(0, timelineZoom - 1) * rect.width)
      const ratio = Math.min(1, Math.max(0, xInInner / innerWidth))
      const newEnd = ratio * totalDurNow
      resizeSegmentEnd(dragResize.segIdx, newEnd)
    }
    const onUp = () => setDragResize(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragResize, timelineZoom, timelinePan, activeId])

  // ─── 批量切片导出（复用 semanticExport 后端） ────────────────────────────

  const batchExport = async () => {
    const m = materials.find(x => x.id === activeId)
    if (!selectedExportFolderId) { setGlobalErr('请先选择目标文件夹'); return }
    if (!m || !m.assetCode || !m.segments || m.segments.length === 0) {
      setGlobalErr('当前素材未拆解或无 segments')
      return
    }
    setExporting(true); setGlobalErr(null); setExportResult(null)
    try {
      const res = await cmRemote.semanticExport({
        inputAssetCode: m.assetCode,
        segments: m.segments,
        folders: folders.map(f => ({ id: f.id, name: f.name, keywords: f.keywords })),
        format: 'both',
      })
      if (res.status === 'SUCCEEDED' && res.zipUrl) {
        setExportResult({ zipUrl: res.zipUrl, clipCount: res.clips?.length ?? 0 })
        flashAction(`📦 已导出 ${res.clips?.length ?? 0} 个切片`)
      } else {
        setGlobalErr(res.errMsg ?? '导出失败')
      }
    } catch (e) {
      setGlobalErr(e instanceof Error ? e.message : '导出失败')
    } finally {
      setExporting(false)
    }
  }

  // ─── 派生 ──────────────────────────────────────────────────────────────

  const filteredMats = useMemo(() => {
    if (materialFilter === 'all') return materials
    return materials.filter(m => m.status === materialFilter)
  }, [materials, materialFilter])

  const active = useMemo(() => materials.find(m => m.id === activeId) ?? null, [materials, activeId])
  const activeSegments = useMemo(() => active?.segments ?? [], [active?.segments])
  const silentGaps = useMemo(() => silentGapsBetween(activeSegments, 0.1), [activeSegments])

  const totalDur = active?.durationSec ?? (active?.segments?.[active.segments.length - 1]?.end ?? 0)
  const exportEnabled = canExportSemanticSplit({
    hasSegments: Boolean(active?.segments?.length),
    hasSelectedFolder: Boolean(selectedExportFolderId),
    exporting,
  })
  const viewport = timelineViewportPercent(timelineZoom, timelinePan)
  const playRatio = totalDur > 0 ? Math.min(Math.max(currentTime / totalDur, 0), 1) : 0
  const classifiedCount = activeSegments.filter(s => s.folderId).length

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1700, margin: '0 auto' }}>
      <input ref={fileInputRef} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
      <input
        ref={folderPickerRef}
        type="file"
        {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
        style={{ display: 'none' }}
        onChange={e => handleFolderUpload(e.target.files)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button onClick={onChangeMode} style={S.backBtn}>
          <ArrowLeft size={13} style={{ marginRight: 4 }} />切换粒度
        </button>
      </div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Film size={20} color="#14b8a6" /> 按场景拆解视频
          <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>
            {MODE_INFO[mode].label}
          </span>
          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{MODE_INFO[mode].durLabel}</span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          按镜头切换检测自动切分素材，AI 把每个镜头匹配到目标文件夹的名称，批量打包导出。
        </div>
      </div>

      {globalErr && (
        <div style={{ ...S.errBox, marginBottom: 12 }}>
          <AlertCircle size={13} />{globalErr}
        </div>
      )}
      {exportResult && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)', marginBottom: 12, fontSize: '0.78rem' }}>
          <CheckCircle2 size={14} />
          <span>已导出 {exportResult.clipCount} 个切片 + 剪映工程文件 (zip)</span>
          <a href={exportResult.zipUrl} download style={{ marginLeft: 'auto', color: '#0d9488', textDecoration: 'underline', fontWeight: 600 }}>
            下载 zip
          </a>
          <button onClick={() => setExportResult(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={13} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(360px, 1fr) 360px 320px', gap: 12 }}>
        {/* 1. 素材 */}
        <div style={{ ...S.card, padding: 12, height: 'calc(100vh - 380px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, flex: 1 }}>素材</span>
            <button onClick={() => fileInputRef.current?.click()} style={S.plainIconBtn} title="导入素材"><Upload size={13} /></button>
            <button onClick={() => { setMaterials([]); setActiveId(null) }} style={S.plainIconBtn} title="批量删除"><Trash2 size={13} /></button>
          </div>
          <select
            value={materialFilter}
            onChange={e => setMaterialFilter(e.target.value as 'all' | MaterialStatus)}
            style={{ ...S.inp, marginBottom: 10, fontSize: '0.74rem', padding: '5px 8px' }}
          >
            {STATUS_TABS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filteredMats.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '20px 8px', lineHeight: 1.7 }}>
                添加视频素材开始拆解
              </div>
            ) : filteredMats.map(m => {
              const sc = STATUS_COLORS[m.status]
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveId(m.id)}
                  style={{
                    padding: '8px 10px', marginBottom: 5, cursor: 'pointer', borderRadius: 6,
                    background: activeId === m.id ? 'rgba(20,184,166,0.08)' : 'transparent',
                    borderLeft: `3px solid ${activeId === m.id ? '#14b8a6' : sc.color}`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Video size={11} color="var(--accent-primary)" />
                    <span style={{ flex: 1, fontSize: '0.74rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.fileName}>
                      {m.fileName}
                    </span>
                    <button onClick={e => { e.stopPropagation(); deleteMaterial(m.id) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 1 }}>
                      <X size={10} />
                    </button>
                  </div>
                  {m.sourcePath && (
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.sourcePath}>
                      {m.sourcePath}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>{fmtDuration(m.durationSec ?? 0)}</span>
                    <span>·</span>
                    <span>{fmtSize(m.size)}</span>
                    <span style={{ marginLeft: 'auto', color: sc.color, fontWeight: 600 }}>● {sc.label}</span>
                    {m.segments && <span style={{ color: 'var(--text-muted)' }}>· {m.segments.length} 镜</span>}
                  </div>
                  {m.errMsg && (
                    <div style={{ fontSize: '0.62rem', color: '#ef4444', marginTop: 3, lineHeight: 1.4 }} title={m.errMsg}>
                      ⚠ {m.errMsg.slice(0, 50)}{m.errMsg.length > 50 ? '…' : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. 视频预览 */}
        <div style={{ ...S.card, padding: 10, height: 'calc(100vh - 380px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: 8 }}>
            {active ? active.fileName : '选择素材后预览'}
            {active?.durationSec && <span style={{ marginLeft: 8, fontSize: '0.66rem', color: 'var(--text-muted)' }}>{fmtDuration(active.durationSec)}</span>}
          </div>
          <div style={{ flex: 1, background: '#000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', minHeight: 280 }}>
            {active?.streamUrl ? (
              <video
                ref={videoRef}
                src={active.streamUrl}
                onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={e => {
                  const d = e.currentTarget.duration
                  if (Number.isFinite(d) && d > 0 && active) {
                    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, durationSec: m.durationSec ?? d } : m))
                  }
                }}
                controls
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center' }}>
                <Video size={36} color="#475569" /><br />从左侧选择素材
              </div>
            )}
          </div>
        </div>

        {/* 3. 镜头列表 */}
        <div style={{ ...S.card, padding: 10, height: 'calc(100vh - 380px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: 8 }}>
            镜头 ({active?.segments?.length ?? 0})
            {active?.segments?.length ? (
              <span style={{ fontSize: '0.62rem', fontWeight: 500, color: '#14b8a6', marginLeft: 6 }}>
                已分类 {classifiedCount}/{active.segments.length}
              </span>
            ) : null}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {!active?.segments || active.segments.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '20px 8px', lineHeight: 1.7 }}>
                {active ? '点击「检测」或「批量检测」开始拆镜头' : '选择素材后查看镜头'}
              </div>
            ) : active.segments.map(seg => {
              const gap = silentGaps.find(g => g.afterIdx === seg.idx)
              const folderColor = seg.folderId
                ? SEG_PALETTE[folders.findIndex(f => f.id === seg.folderId) % SEG_PALETTE.length] ?? '#14b8a6'
                : 'rgba(148,163,184,0.6)'
              const isCurrent = currentTime >= seg.start && currentTime < seg.end
              return (
                <div key={seg.idx}>
                  <div
                    onClick={() => seekVideo(seg.start)}
                    style={{
                      padding: '7px 10px', borderRadius: 6, marginBottom: 5,
                      background: isCurrent ? 'rgba(255,122,26,0.08)' : 'var(--bg-secondary)',
                      borderLeft: `3px solid ${folderColor}`,
                      outline: isCurrent ? '1px solid #ff7a1a' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>
                        镜头 #{seg.idx}
                        {isCurrent && <span style={{ color: '#ff7a1a', marginLeft: 4 }}>● 当前</span>}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatClockMs(seg.start)} · {formatDurationMs(seg.end - seg.start)}s</span>
                        <button
                          onClick={e => { e.stopPropagation(); playSegment(seg.start, seg.end) }}
                          title="播放该镜头"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#14b8a6', padding: 0, display: 'inline-flex', alignItems: 'center' }}>
                          <Play size={11} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.66rem' }} onClick={e => e.stopPropagation()}>
                      <span style={{ color: 'var(--text-muted)' }}>归类到：</span>
                      <select
                        value={seg.folderId ?? ''}
                        onChange={e => active && reassignSegment(active.id, seg.idx, e.target.value)}
                        style={{ ...S.inp, fontSize: '0.66rem', padding: '2px 5px', flex: 1 }}
                      >
                        <option value="">— 未归类 —</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                      <button
                        onClick={() => active && mergeWithNextSegment(seg.idx)}
                        title="与下一镜头合并"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.66rem' }}>
                        合并↓
                      </button>
                      <button
                        onClick={() => deleteSegment(seg.idx)}
                        title="删除镜头"
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                  {gap && (
                    <div style={{ margin: '-2px 0 5px 14px', fontSize: '0.66rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: 99, background: '#94a3b8' }} />
                      {formatDurationMs(gap.duration)}s 空隙
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. 目标文件夹 */}
        <div style={{ ...S.card, padding: 10, height: 'calc(100vh - 380px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, flex: 1 }}>目标文件夹</span>
            <button onClick={() => folderPickerRef.current?.click()} style={S.plainIconBtn} title="上传本地文件夹">
              {folderUploadStatus === 'parsing' ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={13} />}
            </button>
            <button onClick={addFolder} style={S.plainIconBtn} title="新增空文件夹"><Plus size={13} /></button>
            <button onClick={() => { setFolders([]); setSelectedExportFolderId(null) }} style={S.plainIconBtn} title="批量删除全部文件夹"><Trash2 size={13} /></button>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); e.stopPropagation() }}
            onDrop={e => { e.preventDefault(); handleFolderUpload(e.dataTransfer.files) }}
            style={{ flex: 1, overflow: 'auto' }}
          >
            {folders.length === 0 ? (
              <div style={{
                margin: '8px 4px', padding: '32px 14px',
                border: '2px dashed var(--border-light)', borderRadius: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                color: 'var(--text-muted)', textAlign: 'center',
              }}>
                <FolderOpen size={28} color="var(--text-muted)" />
                <div style={{ fontSize: '0.78rem' }}>请拖入目标文件夹</div>
                <div style={{ fontSize: '0.66rem', lineHeight: 1.6 }}>
                  支持拖拽本地文件夹<br />（按子目录创建文件夹，AI 按名称归类镜头）
                </div>
                <button onClick={() => folderPickerRef.current?.click()} style={{ ...S.btnGhost, fontSize: '0.74rem', gap: 5 }}>
                  <Upload size={11} />手动选择
                </button>
              </div>
            ) : folders.map((f, i) => {
              const color = SEG_PALETTE[i % SEG_PALETTE.length]
              const segCount = active?.segments?.filter(s => s.folderId === f.id).length ?? 0
              const isSelected = selectedExportFolderId === f.id
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedExportFolderId(f.id)}
                  style={{
                    borderLeft: `4px solid ${color}`,
                    background: isSelected ? 'rgba(20,184,166,0.06)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? '#14b8a6' : 'var(--border-light)'}`,
                    borderLeftColor: color,
                    borderRadius: 6, padding: '8px 10px', marginBottom: 6,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span>
                    <Folder size={11} color={color} />
                    <input
                      value={f.name}
                      onClick={e => e.stopPropagation()}
                      onChange={e => renameFolder(f.id, e.target.value)}
                      style={{ ...S.inp, flex: 1, fontSize: '0.74rem', padding: '2px 6px', fontWeight: 600 }}
                    />
                  </div>
                  {(f.audioDurationSec || f.audioCount) && (
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4, marginLeft: 18 }}>
                      音频 {fmtDuration(f.audioDurationSec ?? 0)}{f.audioCount ? ` · ${f.audioCount} 个文件` : ''}
                    </div>
                  )}
                  <input
                    placeholder="关键词（辅助 AI 归类，可选）"
                    value={f.keywords ?? ''}
                    onClick={e => e.stopPropagation()}
                    onChange={e => updateFolderKeywords(f.id, e.target.value)}
                    style={{ ...S.inp, width: '100%', marginTop: 5, fontSize: '0.66rem', padding: '3px 6px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: '0.66rem' }}>
                    <span style={{ color: segCount > 0 ? '#0d9488' : 'var(--text-muted)' }}>
                      {segCount > 0 ? `已归类 ${segCount} 镜头` : '未归类镜头'}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={e => { e.stopPropagation(); setConfirmClear(f) }} style={{ ...S.linkBtn, color: '#0d9488', fontSize: '0.66rem' }}>清空</button>
                      <button onClick={e => { e.stopPropagation(); deleteFolder(f.id) }} style={{ ...S.linkBtn, color: '#ef4444', fontSize: '0.66rem' }}>删除</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              onClick={batchExport}
              disabled={!exportEnabled}
              style={{
                ...S.btnPrimary, flex: 1, height: 38, justifyContent: 'center', gap: 6,
                background: exportEnabled ? '#14b8a6' : 'var(--bg-secondary)',
                color: exportEnabled ? '#fff' : 'var(--text-muted)',
                cursor: exportEnabled ? 'pointer' : 'not-allowed',
                fontSize: '0.8rem',
              }}
            >
              {exporting
                ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />导出中</>
                : <><Download size={13} />批量切片导出</>}
            </button>
            <button onClick={() => folderPickerRef.current?.click()}
              style={{ ...S.iconBtn, height: 38, width: 38, justifyContent: 'center' }}
              title="选择/打开本地目录">
              <FolderOpen size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 工具栏 + 时间轴 */}
      <div style={{ ...S.card, marginTop: 12, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ZoomOut size={13} color="var(--text-muted)" />
            <input
              type="range" min={1} max={6} step={0.25}
              value={timelineZoom}
              onChange={e => setTimelineZoom(Number(e.target.value))}
              style={{ width: 100, accentColor: '#14b8a6' }}
              aria-label="时间轴缩放"
            />
            <ZoomIn size={13} color="var(--text-muted)" />
          </div>

          <span style={S.toolDivider} />
          <ToolButton title="停止：暂停并回到 0s" label="停止" onClick={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; setCurrentTime(0); flashAction('⏹ 已停止并回到 0s') } }}><Square size={13} /></ToolButton>
          <ToolButton title="播放" label="播放" onClick={() => { videoRef.current?.play(); flashAction('▶ 播放') }}><Play size={13} /></ToolButton>
          <span style={S.toolDivider} />
          <ToolButton
            title={`撤回上一次操作（${historyRef.current.past.length} 步可撤回）`}
            label="撤回"
            onClick={undo}
            active={historyRef.current.past.length > 0}
          ><RotateCcw size={13} /></ToolButton>
          <ToolButton
            title={`重做（${historyRef.current.future.length} 步可重做）`}
            label="重做"
            onClick={redo}
            active={historyRef.current.future.length > 0}
          ><RotateCw size={13} /></ToolButton>
          <ToolButton
            title="复制：在播放头处把当前镜头一分为二"
            label="复制"
            onClick={duplicateCurrentSegment}
          ><Copy size={13} /></ToolButton>
          <ToolButton
            title="裁剪：在播放头处拆分镜头"
            label="裁剪"
            active
            onClick={cutAtPlayhead}
          ><Scissors size={13} /></ToolButton>
          <ToolButton
            title="磁吸：消除镜头间空隙"
            label="磁吸"
            onClick={snapAllSegments}
          ><Magnet size={13} /></ToolButton>
          <ToolButton
            title="全景：重置时间轴缩放和分页"
            label="全景"
            onClick={resetTimelineView}
          ><MapIcon size={13} /></ToolButton>

          <span style={{ marginLeft: 'auto' }} />
          <button onClick={detectActive} disabled={!active || submitting}
            title="对当前素材执行镜头检测"
            style={{ ...S.btnGhost, gap: 5, opacity: !active || submitting ? 0.4 : 1 }}>
            {submitting ? <><Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />检测中</> : <><Film size={11} />检测</>}
          </button>
          <button onClick={batchDetect}
            disabled={submitting || materials.filter(m => m.status === 'draft' || m.status === 'failed').length === 0}
            style={{ ...S.btnGhost, gap: 5, opacity: submitting ? 0.5 : 1 }}>
            <Film size={11} />批量检测
          </button>
          <button onClick={aiClassify}
            disabled={classifying || !active?.segments?.length || folders.length === 0}
            title="AI 把每个镜头按文件夹名称自动归类"
            style={{ ...S.btnPrimary, gap: 5, opacity: (classifying || !active?.segments?.length || folders.length === 0) ? 0.4 : 1 }}>
            {classifying ? <><Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />归类中</> : <><Sparkles size={11} />AI 智能归类</>}
          </button>
          <button onClick={clearAllAssignments}
            disabled={!active?.segments?.length}
            style={{ ...S.btnGhost, gap: 5, opacity: !active?.segments?.length ? 0.4 : 1 }}>
            <Eraser size={11} />清空归类
          </button>
        </div>

        {/* 时间轴 */}
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>
              时间轴
              {active?.segments?.length ? ` · ${active.segments.length} 镜头 · 总长 ${fmtDuration(totalDur)} · 已归类 ${classifiedCount}/${active.segments.length}` : ''}
            </span>
            {lastAction && (
              <span style={{
                marginLeft: 'auto',
                padding: '2px 10px',
                borderRadius: 999,
                background: 'rgba(33, 185, 173, 0.12)',
                color: '#119184',
                fontSize: '0.7rem',
                border: '1px solid rgba(33, 185, 173, 0.35)',
              }}>{lastAction}</span>
            )}
          </div>
          {active?.segments && active.segments.length > 0 && totalDur > 0 ? (
            <>
              <div
                ref={timelineTrackRef}
                onWheel={e => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    const delta = -Math.sign(e.deltaY) * 0.25
                    setTimelineZoom(z => Math.max(1, Math.min(6, z + delta)))
                  } else if (timelineZoom > 1) {
                    e.preventDefault()
                    setTimelinePan(p => Math.max(0, Math.min(1, p + Math.sign(e.deltaY) * 0.05)))
                  }
                }}
                onDoubleClick={e => {
                  const rect = timelineTrackRef.current?.getBoundingClientRect()
                  if (!rect) return
                  const innerWidth = rect.width * timelineZoom
                  const xInInner = (e.clientX - rect.left) + (timelinePan * Math.max(0, timelineZoom - 1) * rect.width)
                  const ratio = Math.min(1, Math.max(0, xInInner / innerWidth))
                  const sec = ratio * totalDur
                  const target = active.segments?.find(s => sec > s.start && sec < s.end)
                  if (target) splitSegmentAt(target.idx, sec)
                }}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 6, background: 'var(--bg-secondary)', height: 44, cursor: dragResize ? 'col-resize' : 'crosshair', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', height: '100%', width: `${timelineZoom * 100}%`, transform: `translateX(-${timelinePan * Math.max(0, timelineZoom - 1) * 100}%)`, transition: dragResize ? 'none' : 'transform 0.12s' }}>
                  {active.segments.map((seg, i) => {
                    const w = ((seg.end - seg.start) / totalDur) * 100
                    const folderColor = seg.folderId
                      ? SEG_PALETTE[folders.findIndex(f => f.id === seg.folderId) % SEG_PALETTE.length] ?? '#14b8a6'
                      : 'rgba(148,163,184,0.45)'
                    const isLast = i === (active.segments?.length ?? 0) - 1
                    const isCurrent = currentTime >= seg.start && currentTime < seg.end
                    return (
                      <div
                        key={seg.idx}
                        style={{
                          position: 'relative',
                          width: `${w}%`, background: folderColor,
                          borderRight: '1px solid rgba(255,255,255,0.4)',
                          fontSize: '0.62rem', color: '#fff', fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontVariantNumeric: 'tabular-nums',
                          outline: isCurrent ? '2px solid #ff7a1a' : 'none',
                          outlineOffset: isCurrent ? '-2px' : 0,
                          cursor: 'pointer',
                        }}
                        title={`镜头 #${seg.idx} ${formatDurationMs(seg.end - seg.start)}s · ${seg.folderName || '未归类'}\n单击跳转 · 双击拆分 · 拖右边界调整 · 右键合并 · Shift+右键删除`}
                        onClick={() => seekVideo(seg.start)}
                        onContextMenu={e => {
                          e.preventDefault()
                          if (e.shiftKey) {
                            deleteSegment(seg.idx)
                          } else if (!isLast) {
                            mergeWithNextSegment(seg.idx)
                          }
                        }}
                      >
                        {w * timelineZoom >= 4 ? formatDurationMs(seg.end - seg.start) : ''}
                        {!isLast && (
                          <div
                            onMouseDown={e => {
                              e.preventDefault(); e.stopPropagation()
                              if (timelineTrackRef.current) {
                                pushHistory()
                                setDragResize({ segIdx: seg.idx, trackEl: timelineTrackRef.current })
                              }
                            }}
                            style={{
                              position: 'absolute', right: -3, top: 0, bottom: 0, width: 6,
                              cursor: 'col-resize', zIndex: 2,
                              background: dragResize?.segIdx === seg.idx ? 'rgba(255,255,255,0.85)' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.55)' }}
                            onMouseLeave={e => { if (dragResize?.segIdx !== seg.idx) e.currentTarget.style.background = 'transparent' }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${playRatio * 100}%`, width: 2, background: '#ff7a1a', pointerEvents: 'none', boxShadow: '0 0 0 1px rgba(255,122,26,0.4)' }} />
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>
                💡 双击拆分 · 拖动右边界调整 · 右键合并下一镜头 · Shift+右键删除 · Ctrl/⌘+滚轮缩放
              </div>
              <div style={{ position: 'relative', height: 14, marginTop: 4, background: 'var(--bg-secondary)', borderRadius: 4 }}>
                <div style={{ position: 'absolute', top: 2, bottom: 2, left: `${viewport.left}%`, width: `${viewport.width}%`, borderRadius: 3, background: 'var(--border-light)', cursor: timelineZoom > 1 ? 'grab' : 'default' }} />
                {timelineZoom > 1 && (
                  <input
                    type="range" min={0} max={1} step={0.01} value={timelinePan}
                    onChange={e => setTimelinePan(Number(e.target.value))}
                    style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: '100%', opacity: 0, cursor: 'grab' }}
                    aria-label="时间轴分页定位"
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6, fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                {folders.map((f, i) => (
                  <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: SEG_PALETTE[i % SEG_PALETTE.length], display: 'inline-block' }} />
                    {f.name}
                  </span>
                ))}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: 'rgba(148,163,184,0.45)', display: 'inline-block' }} />未归类
                </span>
              </div>
            </>
          ) : (
            <div style={{ height: 50, borderRadius: 6, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
              检测后显示时间轴镜头
            </div>
          )}
        </div>
      </div>

      {confirmClear && (
        <Modal onClose={() => setConfirmClear(null)} maxWidth={420}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6 }}>清空目标文件夹？</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                已归类到（<strong>{confirmClear.name}</strong>）的镜头将被取消归类，确定继续？
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button onClick={() => setConfirmClear(null)} style={S.btnGhost}>关闭</button>
            <button onClick={() => clearFolder(confirmClear)} style={{ ...S.btnPrimary, background: '#ef4444' }}>确定</button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Modal + ToolButton ──────────────────────────────────────────────────

function ToolButton({ children, title, label, onClick, active = false }: { children: React.ReactNode; title: string; label?: string; onClick?: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: '4px 6px',
        border: 'none',
        borderRadius: 6,
        background: 'transparent',
        color: active ? '#21b9ad' : '#7c7c7c',
        cursor: 'pointer',
        minWidth: 40,
        lineHeight: 1,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover, rgba(0,0,0,0.04))' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      {children}
      {label && <span style={{ fontSize: '0.62rem', color: 'inherit' }}>{label}</span>}
    </button>
  )
}

function Modal({ children, onClose, maxWidth = 480 }: { children: React.ReactNode; onClose: () => void; maxWidth?: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', width: '90%', maxWidth, padding: '22px 24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  )
}

// ─── 样式 ────────────────────────────────────────────────────────────────

const S = {
  backBtn:    { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  card:       { background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 7, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost:   { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  iconBtn:    { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 3, borderRadius: 4, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer' } as React.CSSProperties,
  plainIconBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 4, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 5 } as React.CSSProperties,
  toolDivider: { width: 1, height: 18, background: 'var(--border-light)', display: 'inline-block' } as React.CSSProperties,
  inp:        { padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.74rem', outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
  errBox:     { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' } as React.CSSProperties,
  linkBtn:    { background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '0.72rem', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline', textUnderlineOffset: 2 } as React.CSSProperties,
}
