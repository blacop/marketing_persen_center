import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, ChevronRight, Search, Star, Folder, X, Loader, AlertCircle, Download, Package, FileJson, Upload, Mic } from 'lucide-react'
import JSZip from 'jszip'
import { cmRemote, type TtsVoice } from '../../../lib/cm/cmApi'
import { apiFetch } from '../../../lib/apiClient'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Shot { id: string; name: string; content: string }

interface TtsTask {
  id: string
  folderName: string
  shotCount: number
  audioCount: number
  createdAt: string
  completedAt?: string
  status: 'queued' | 'done' | 'failed'
  expiresAt?: string
  shots: Array<{ name: string; audios: AudioFile[] }>
  voiceId?: string
  voiceName?: string
  speed?: number
  errMsg?: string
}

interface AudioFile {
  fileName: string
  audioUrl?: string
  durationSec?: number
  status?: 'success' | 'failed'
  errMsg?: string
}

// ─── 音色卡片色彩调色盘（按 id hash 取色） ────────────────────────────────────

const PALETTE = ['#f59e0b', '#3b82f6', '#ef4444', 'var(--accent-primary)', '#ec4899', '#14b8a6', '#22c55e', '#06b6d4']

function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return PALETTE[Math.abs(h) % PALETTE.length]
}

interface VoiceCard {
  id: string
  name: string
  type: string
  lang: string
  starred: boolean
  color: string
}

function toCard(v: TtsVoice): VoiceCard {
  return {
    id: v.id, name: v.name, type: v.style, lang: v.lang,
    starred: v.starred, color: colorFor(v.id),
  }
}

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORE_KEY = 'cm_tts_tasks'
function loadTasks(): TtsTask[] { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] } }
function saveTasks(t: TtsTask[]): void { try { localStorage.setItem(STORE_KEY, JSON.stringify(t)) } catch { /* ignore */ } }
function uid() { return `tts-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

// ─── 下载工具 ────────────────────────────────────────────────────────────────

/** 把绝对 URL（如 http://localhost:30000/cm/asset/stream/xxx）转成相对路径，
 *  避免跨源 CORS。Vite 已 proxy /cm/* → backend。生产环境同源也兼容。 */
function relativizeUrl(url: string): string {
  if (!url) return url
  try {
    const u = new URL(url, window.location.origin)
    if (u.origin === window.location.origin) return u.pathname + u.search
    // 跨源 → 提取 /cm/* 路径走 Vite proxy
    if (u.pathname.startsWith('/cm/')) return u.pathname + u.search
    return url
  } catch {
    return url
  }
}

/** 浏览器触发下载 Blob */
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 单文件下载（fetch 拿 blob 后强制 download） */
async function downloadSingleFile(audioUrl: string, fileName: string) {
  const r = await apiFetch(relativizeUrl(audioUrl))
  if (!r.ok) throw new Error(`下载失败 HTTP ${r.status}`)
  const blob = await r.blob()
  triggerBlobDownload(blob, fileName)
}

/** 把一个 shot 文件夹（含 N 条音频）打 zip 下载 */
async function downloadShotFolder(shotName: string, audios: Array<{ fileName: string; audioUrl?: string }>, taskFolder: string) {
  const zip = new JSZip()
  const folder = zip.folder(shotName)
  if (!folder) throw new Error('zip folder 创建失败')
  let n = 0
  for (const a of audios) {
    if (!a.audioUrl) continue
    try {
      const r = await apiFetch(relativizeUrl(a.audioUrl))
      if (!r.ok) continue
      const buf = await r.arrayBuffer()
      folder.file(a.fileName, buf)
      n++
    } catch (e) {
      console.warn(`[zip] ${a.fileName} skip:`, e)
    }
  }
  if (n === 0) throw new Error('未能下载任何音频')
  const out = await zip.generateAsync({ type: 'blob' })
  triggerBlobDownload(out, `${taskFolder.replace(/\.zip$/, '')}-${shotName}.zip`)
}

/** 整个任务打包：每 shot 一个子文件夹 */
async function downloadTaskZip(
  taskFolder: string,
  shots: Array<{ name: string; audios: Array<{ fileName: string; audioUrl?: string }> }>,
  onProgress?: (done: number, total: number) => void,
) {
  const zip = new JSZip()
  let total = 0
  shots.forEach(s => total += s.audios.filter(a => a.audioUrl).length)
  let done = 0

  for (const shot of shots) {
    const folder = zip.folder(shot.name)
    if (!folder) continue
    for (const a of shot.audios) {
      if (!a.audioUrl) continue
      try {
        const r = await apiFetch(relativizeUrl(a.audioUrl))
        if (!r.ok) continue
        const buf = await r.arrayBuffer()
        folder.file(a.fileName, buf)
      } catch (e) {
        console.warn(`[zip] ${a.fileName} skip:`, e)
      }
      done++
      onProgress?.(done, total)
    }
  }

  const out = await zip.generateAsync({ type: 'blob' })
  const fname = taskFolder.endsWith('.zip') ? taskFolder : `${taskFolder}.zip`
  triggerBlobDownload(out, fname)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TtsBatch() {
  const nav = useNavigate()
  const loc = useLocation()
  const state = loc.state as { shots?: Shot[]; matrix?: string[][]; count?: number; title?: string } | null

  // 文案数据（可来自 ScriptFission state / 手动输入 / 文件导入）
  const [shots, setShots] = useState<Shot[]>(state?.shots ?? [])
  const [matrix, setMatrix] = useState<string[][]>(state?.matrix ?? [])
  const [count, setCount] = useState<number>(state?.count ?? 0)
  const [title, setTitle] = useState<string>(state?.title ?? '')

  const hasShots = shots.length > 0 && count > 0

  const [tab, setTab] = useState<'create' | 'queue'>('create')
  // 0=输入阶段（手动/导入文件）, 1=勾选版本, 2=音色 + 语速
  const [subStep, setSubStep] = useState<0 | 1 | 2>(hasShots ? 1 : 0)

  // 输入阶段
  const [inputMode, setInputMode] = useState<'manual' | 'import'>('manual')
  const [manualText, setManualText] = useState('')
  const [importErr, setImportErr] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const importFileRef = useRef<HTMLInputElement | null>(null)
  const MAX_MANUAL_CHARS = 1000

  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>()
    shots.forEach((_, si) => { for (let vi = 0; vi < count; vi++) s.add(`${si}-${vi}`) })
    return s
  })

  const [speed, setSpeed] = useState(1.0)
  const [voiceId, setVoiceId] = useState('Cherry')
  const [voiceSearch, setVoiceSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState<string | null>(null)

  // 后端拉音色
  const [voices, setVoices] = useState<VoiceCard[]>([])
  const [voiceProvider, setVoiceProvider] = useState<string>('')

  useEffect(() => {
    cmRemote.ttsVoices()
      .then(res => {
        setVoices(res.voices.map(toCard))
        setVoiceProvider(res.provider)
        // 默认选第一条 starred
        const first = res.voices.find(v => v.starred) ?? res.voices[0]
        if (first) setVoiceId(first.id)
      })
      .catch(e => console.warn('[TtsBatch] load voices failed:', e))
  }, [])

  const [tasks, setTasks] = useState<TtsTask[]>(() => loadTasks())
  const [viewModal, setViewModal] = useState<TtsTask | null>(null)

  // ─── Selection helpers ────────────────────────────────────────────────────

  const versionAllSelected = (vi: number) => shots.every((_, si) => selected.has(`${si}-${vi}`))

  const toggleVersion = (vi: number) => {
    const next = new Set(selected)
    const all = versionAllSelected(vi)
    shots.forEach((_, si) => { if (all) next.delete(`${si}-${vi}`); else next.add(`${si}-${vi}`) })
    setSelected(next)
  }

  const toggleCell = (si: number, vi: number) => {
    const next = new Set(selected)
    const key = `${si}-${vi}`
    if (next.has(key)) next.delete(key); else next.add(key)
    setSelected(next)
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  const charCount = [...selected].reduce((acc, key) => {
    const [si, vi] = key.split('-').map(Number)
    return acc + (matrix[si]?.[vi]?.length ?? 0)
  }, 0)

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitErr(null)
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = Date.now().toString().slice(-6)
    const folderName = `${title || '文案裂变'}-${dateStr}-${timeStr}.zip`

    // 构造 items 列表
    const items: Array<{ shotIdx: number; versionIdx: number; name: string; text: string }> = []
    shots.forEach((shot, si) => {
      for (let vi = 0; vi < count; vi++) {
        if (!selected.has(`${si}-${vi}`)) continue
        const text = matrix[si]?.[vi]
        if (!text) continue
        items.push({
          shotIdx: si + 1, versionIdx: vi + 1,
          name: `${si + 1}-${shot.name}-版本${vi + 1}`, text,
        })
      }
    })

    if (items.length === 0) {
      setSubmitErr('未勾选任何分镜')
      setSubmitting(false)
      return
    }

    const voiceName = voices.find(v => v.id === voiceId)?.name ?? voiceId

    try {
      const res = await cmRemote.ttsBatch({
        title: title || '文案裂变', voiceId, speed, items,
      })

      // 按 shotIdx 聚合 files
      const shotMap = new Map<number, AudioFile[]>()
      ;(res.files ?? []).forEach(f => {
        const arr = shotMap.get(f.shotIdx) ?? []
        arr.push({
          fileName: `${f.name}.wav`,
          audioUrl: f.streamUrl,
          durationSec: f.durationSec,
          status: f.status, errMsg: f.errMsg,
        })
        shotMap.set(f.shotIdx, arr)
      })
      const shotsAgg = shots.map((shot, si) => ({
        name: `${si + 1}${shot.name}`,
        audios: shotMap.get(si + 1) ?? [],
      })).filter(s => s.audios.length > 0)

      const expires = new Date(Date.now() + 86400000).toLocaleString('zh-CN', { hour12: false }).replace(',', '')
      const task: TtsTask = {
        id: uid(),
        folderName: res.folderName ?? folderName,
        shotCount: shotsAgg.length,
        audioCount: items.length,
        createdAt: now,
        completedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', ''),
        status: res.status === 'FAILED' ? 'failed' : 'done',
        expiresAt: expires,
        shots: shotsAgg,
        voiceId, voiceName, speed,
        errMsg: res.errMsg ?? undefined,
      }
      const next = [task, ...tasks]
      setTasks(next); saveTasks(next)
      setTab('queue')
    } catch (e) {
      setSubmitErr(e instanceof Error ? e.message : '合成失败')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTask = (id: string) => {
    const next = tasks.filter(t => t.id !== id)
    setTasks(next); saveTasks(next)
  }

  // 下载状态：taskId → '0/12' | null
  const [downloadingTask, setDownloadingTask] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<string>('')
  const [downloadErr, setDownloadErr] = useState<string | null>(null)

  const handleDownloadTaskZip = async (t: TtsTask) => {
    if (downloadingTask) return
    setDownloadingTask(t.id)
    setDownloadProgress('0/' + t.audioCount)
    setDownloadErr(null)
    try {
      await downloadTaskZip(t.folderName, t.shots, (done, total) => {
        setDownloadProgress(`${done}/${total}`)
      })
    } catch (e) {
      setDownloadErr(e instanceof Error ? e.message : '打包失败')
    } finally {
      setDownloadingTask(null)
      setDownloadProgress('')
    }
  }

  const handleDownloadFolder = async (taskFolder: string, shotName: string, audios: AudioFile[]) => {
    try {
      await downloadShotFolder(shotName, audios, taskFolder)
    } catch (e) {
      setDownloadErr(e instanceof Error ? e.message : '文件夹打包失败')
    }
  }

  const handleDownloadSingle = async (audio: AudioFile) => {
    if (!audio.audioUrl) return
    try {
      await downloadSingleFile(audio.audioUrl, audio.fileName)
    } catch (e) {
      setDownloadErr(e instanceof Error ? e.message : '下载失败')
    }
  }

  const filteredVoices = voices.filter(v =>
    !v.starred && (voiceSearch === '' || v.name.includes(voiceSearch) || v.lang.includes(voiceSearch) || v.type.includes(voiceSearch))
  )
  const starredVoices = voices.filter(v => v.starred)

  // ─── 输入阶段处理 ─────────────────────────────────────────────────────────

  /** 应用输入到 shots/matrix 并跳到 subStep 1 */
  const applyShotsMatrix = (newShots: Shot[], newMatrix: string[][], newCount: number, newTitle: string) => {
    setShots(newShots)
    setMatrix(newMatrix)
    setCount(newCount)
    setTitle(newTitle)
    // 默认全选
    const sel = new Set<string>()
    newShots.forEach((_, si) => { for (let vi = 0; vi < newCount; vi++) sel.add(`${si}-${vi}`) })
    setSelected(sel)
    setSubStep(1)
  }

  /** 手动输入：按换行符切分 → 每行一个分镜，1 版本 */
  const handleManualSubmit = () => {
    const text = manualText.trim()
    if (!text) {
      setImportErr('请输入文案')
      return
    }
    setImportErr(null)
    // 按换行切；空行跳过
    const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0)
    if (lines.length === 0) {
      setImportErr('文案为空')
      return
    }
    const newShots: Shot[] = lines.map((content, i) => ({ id: `m-${Date.now()}-${i}`, name: `分镜${i + 1}`, content }))
    const newMatrix: string[][] = lines.map(l => [l])
    applyShotsMatrix(newShots, newMatrix, 1, '手动输入')
  }

  /** 解析 JSON 内容并应用 */
  const parseImportedJson = (raw: string) => {
    let obj: unknown
    try {
      obj = JSON.parse(raw)
    } catch (e) {
      setImportErr('JSON 解析失败：' + (e instanceof Error ? e.message : String(e)))
      return
    }

    // 支持两种 schema:
    // A. { title, versions, shots: [{name, content, versions: [...] }] }  ← 来自 ScriptFission saveResult
    // B. { title?, shots: [{name, content}], matrix: string[][] }          ← 通用
    // C. ["string", ...]                                                    ← 简单数组，每条独立分镜
    const o = obj as Record<string, unknown>
    let parsedShots: Shot[] = []
    let parsedMatrix: string[][] = []
    let parsedCount = 0
    let parsedTitle = ''

    if (Array.isArray(obj)) {
      // schema C
      const arr = obj as string[]
      parsedShots = arr.map((s, i) => ({ id: `i-${Date.now()}-${i}`, name: `分镜${i + 1}`, content: String(s) }))
      parsedMatrix = arr.map(s => [String(s)])
      parsedCount = 1
      parsedTitle = '导入文案'
    } else if (Array.isArray(o.shots)) {
      const shotArr = o.shots as Array<Record<string, unknown>>
      parsedTitle = (o.title as string) ?? '导入文案'

      // schema A: shots 内部含 versions
      const hasInlineVersions = shotArr.length > 0 && Array.isArray(shotArr[0].versions)
      if (hasInlineVersions) {
        parsedShots = shotArr.map((s, i) => ({
          id: `i-${Date.now()}-${i}`,
          name: (s.name as string) ?? `分镜${i + 1}`,
          content: (s.content as string) ?? '',
        }))
        parsedMatrix = shotArr.map(s => (s.versions as string[]) ?? [])
        parsedCount = (o.versions as number) ?? Math.max(...parsedMatrix.map(m => m.length))
      } else if (Array.isArray(o.matrix)) {
        // schema B
        parsedShots = shotArr.map((s, i) => ({
          id: `i-${Date.now()}-${i}`,
          name: (s.name as string) ?? `分镜${i + 1}`,
          content: (s.content as string) ?? '',
        }))
        parsedMatrix = o.matrix as string[][]
        parsedCount = parsedMatrix[0]?.length ?? 1
      } else {
        // 仅有 shots，无 matrix → 把 content 当唯一版本
        parsedShots = shotArr.map((s, i) => ({
          id: `i-${Date.now()}-${i}`,
          name: (s.name as string) ?? `分镜${i + 1}`,
          content: (s.content as string) ?? '',
        }))
        parsedMatrix = parsedShots.map(s => [s.content])
        parsedCount = 1
      }
    } else {
      setImportErr('JSON 结构不识别。期望：数组 ["..."] 或 {shots:[...], matrix:[[...]]}')
      return
    }

    if (parsedShots.length === 0) {
      setImportErr('未解析出任何分镜')
      return
    }
    setImportErr(null)
    applyShotsMatrix(parsedShots, parsedMatrix, parsedCount, parsedTitle)
  }

  const handleImportFile = (file: File) => {
    if (!file.name.match(/\.json$/i)) {
      setImportErr('仅支持 .json 文件')
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      const raw = e.target?.result
      if (typeof raw === 'string') parseImportedJson(raw)
    }
    reader.onerror = () => setImportErr('文件读取失败')
    reader.readAsText(file)
  }

  // 派生：手动输入 stats
  const manualLines = manualText.trim() ? manualText.trim().split(/\n+/).filter(l => l.trim().length > 0).length : 0

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1300, margin: '0 auto' }}>
      <button onClick={() => nav(-1)} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回
      </button>

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 0 }}>
          <Mic size={18} color="#14b8a6" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          语音合成
          <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>内测中</span>
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: 0 }}>
        {(['create', 'queue'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', border: 'none', background: 'transparent',
            fontSize: '0.85rem',
            fontWeight: tab === t ? 700 : 400,
            color: tab === t ? '#14b8a6' : 'var(--text-muted)',
            borderBottom: tab === t ? '2px solid #14b8a6' : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1,
          }}>
            {t === 'create' ? '创建任务' : `任务队列${tasks.length > 0 ? ` (${tasks.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── 创建任务 ── */}
      {tab === 'create' && (
        <>
          {/* Sub-step 0: 输入阶段（手动 / 文件导入） */}
          {subStep === 0 && (
            <div style={{ paddingTop: 20 }}>
              {/* 模式切换 */}
              <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <label style={{ ...S.modeRadio, ...(inputMode === 'import' ? S.modeRadioActive : {}) }}>
                  <input type="radio" name="inputMode" checked={inputMode === 'import'} onChange={() => setInputMode('import')} style={{ marginRight: 8 }} />
                  导入已裂变文案
                </label>
                <label style={{ ...S.modeRadio, ...(inputMode === 'manual' ? S.modeRadioActive : {}) }}>
                  <input type="radio" name="inputMode" checked={inputMode === 'manual'} onChange={() => setInputMode('manual')} style={{ marginRight: 8 }} />
                  手动输入
                </label>
              </div>

              {importErr && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem',
                  background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)', marginBottom: 12,
                }}>
                  <AlertCircle size={13} />{importErr}
                </div>
              )}

              {inputMode === 'import' && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault()
                    setDragOver(false)
                    const f = e.dataTransfer.files[0]
                    if (f) handleImportFile(f)
                  }}
                  style={{
                    border: `2px dashed ${dragOver ? '#14b8a6' : 'var(--border-light)'}`,
                    background: dragOver ? 'rgba(20,184,166,0.04)' : 'var(--bg-card)',
                    borderRadius: 12, padding: '60px 30px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <FileJson size={48} color="#94a3b8" />
                  <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>拖拽 JSON 文件到此处</div>
                  <button onClick={() => importFileRef.current?.click()} style={S.btnPrimary}>
                    <Upload size={13} style={{ marginRight: 5 }} />选择文件
                  </button>
                  <input
                    ref={importFileRef} type="file" accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImportFile(f) }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
                    支持来自「文案裂变」保存的 .json，或自定义结构：<br />
                    <code style={{ fontSize: '0.66rem' }}>{`{"shots":[{"name":"...","content":"..."}],"matrix":[[...]]}`}</code> · <code style={{ fontSize: '0.66rem' }}>{`["文案 1","文案 2"]`}</code>
                  </div>
                </div>
              )}

              {inputMode === 'manual' && (
                <div>
                  <textarea
                    value={manualText}
                    onChange={e => setManualText(e.target.value.slice(0, MAX_MANUAL_CHARS))}
                    placeholder="在此输入文本"
                    style={{
                      width: '100%', minHeight: 280, padding: '14px 16px',
                      borderRadius: 10, border: '1px solid var(--border-light)',
                      background: 'var(--bg-primary)', color: 'var(--text-primary)',
                      fontSize: '0.86rem', lineHeight: 1.7, resize: 'vertical',
                      fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.7 }}>
                    默认生成一整段音频文件。若需要生成多个，请使用回车手动换行。<br />
                    程序将在手动换行处分割为多个音频文件。
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {inputMode === 'manual'
                    ? <>{manualText.length}/{MAX_MANUAL_CHARS} 字 · {manualLines || 1} 条音频</>
                    : <>请选择 JSON 文件或拖拽到上方</>}
                </span>
                <button
                  onClick={() => {
                    if (inputMode === 'manual') handleManualSubmit()
                    else importFileRef.current?.click()
                  }}
                  disabled={inputMode === 'manual' && !manualText.trim()}
                  style={{ ...S.btnPrimary, gap: 5, opacity: (inputMode === 'manual' && !manualText.trim()) ? 0.4 : 1 }}
                >
                  下一步 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Sub-step 1: 选择版本 */}
          {subStep === 1 && (
            <>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                标题：{title || '—'}　　勾选需要生成配音的版本
              </div>

              <div style={{ ...S.card, padding: 0, overflow: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 600 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-secondary)' }}>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ ...S.th, width: 130 }}>分镜名称</th>
                      {Array.from({ length: count }, (_, vi) => (
                        <th key={vi} style={S.th}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', justifyContent: 'center' }}>
                            <input
                              type="checkbox"
                              checked={versionAllSelected(vi)}
                              onChange={() => toggleVersion(vi)}
                              style={{ accentColor: '#14b8a6' }}
                            />
                            版本 {vi + 1}
                          </label>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shots.length === 0 && (
                      <tr>
                        <td colSpan={count + 1} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          暂无数据，请从文案裂变页面跳转
                        </td>
                      </tr>
                    )}
                    {shots.map((shot, si) => (
                      <tr key={shot.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ ...S.td, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', fontSize: '0.74rem' }}>
                          {shot.name}
                        </td>
                        {Array.from({ length: count }, (_, vi) => (
                          <td key={vi} style={S.td}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={selected.has(`${si}-${vi}`)}
                                onChange={() => toggleCell(si, vi)}
                                style={{ accentColor: '#14b8a6', marginTop: 3, flexShrink: 0 }}
                              />
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                {matrix[si]?.[vi] ?? '—'}
                              </span>
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {charCount} 字 / {selected.size} 条音频
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!state?.shots && (
                    <button onClick={() => setSubStep(0)} style={S.btnGhost}>上一步</button>
                  )}
                  <button
                    onClick={() => setSubStep(2)}
                    disabled={selected.size === 0}
                    style={{ ...S.btnPrimary, gap: 5, opacity: selected.size === 0 ? 0.4 : 1 }}
                  >
                    下一步 <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Sub-step 2: 音色 + 语速 */}
          {subStep === 2 && (
            <div style={{ paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '10px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>{charCount} 字 / {selected.size} 条音频</span>
              </div>

              {/* 语速 */}
              <div style={{ ...S.card, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 14 }}>语速</div>
                <input
                  type="range"
                  min={0.5} max={2.0} step={0.05}
                  value={speed}
                  onChange={e => setSpeed(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#14b8a6', marginBottom: 4 }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#14b8a6', fontWeight: 600, marginBottom: 10 }}>
                  {speed.toFixed(2)}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SPEED_PRESETS.map(p => (
                    <button
                      key={p}
                      onClick={() => setSpeed(p)}
                      style={{ ...S.speedChip, ...(Math.abs(speed - p) < 0.01 ? S.speedChipActive : {}) }}
                    >
                      {p.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 收藏音色 */}
              <div style={{ ...S.card, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 14 }}>收藏音色</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))', gap: 10 }}>
                  {starredVoices.map(v => (
                    <VoiceCard key={v.id} voice={v} selected={voiceId === v.id} onSelect={() => setVoiceId(v.id)} />
                  ))}
                </div>
              </div>

              {/* 选择音色 */}
              <div style={S.card}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 14 }}>选择音色</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
                    <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      value={voiceSearch}
                      onChange={e => setVoiceSearch(e.target.value)}
                      placeholder="搜索名称或 ID"
                      style={{ ...S.inp, paddingLeft: 30, width: '100%', boxSizing: 'border-box' as const }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(196px, 1fr))', gap: 10 }}>
                  {filteredVoices.map(v => (
                    <VoiceCard key={v.id} voice={v} selected={voiceId === v.id} onSelect={() => setVoiceId(v.id)} />
                  ))}
                </div>
              </div>

              {submitErr && (
                <div style={{
                  marginTop: 12, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem',
                  background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                  border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <AlertCircle size={13} />{submitErr}
                </div>
              )}
              {voiceProvider && (
                <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ✓ TTS 提供方：{voiceProvider} · {voices.length} 个音色
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button onClick={() => setSubStep(1)} style={S.btnGhost}>上一步</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !voiceId}
                  style={{ ...S.btnPrimary, opacity: submitting ? 0.6 : 1, gap: 5 }}
                >
                  {submitting ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />合成中…</> : '提交任务'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── 任务队列 ── */}
      {tab === 'queue' && (
        <div style={{ paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>
              {tasks.filter(t => t.status === 'queued').length} 个排队中，{tasks.filter(t => t.status === 'done').length} 个已完成，{tasks.filter(t => t.status === 'failed').length} 个失败
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setTasks(loadTasks())} style={S.btnGhost}>
                <RefreshCw size={12} style={{ marginRight: 4 }} />刷新
              </button>
              <button
                onClick={() => { const next = tasks.filter(t => t.status !== 'done'); setTasks(next); saveTasks(next) }}
                style={S.btnGhost}
              >
                删除已完成
              </button>
            </div>
          </div>

          {downloadErr && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)', marginBottom: 10,
            }}>
              <AlertCircle size={13} />{downloadErr}
              <button onClick={() => setDownloadErr(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                <X size={12} />
              </button>
            </div>
          )}

          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ ...S.th, width: 40 }}>序号</th>
                  <th style={S.th}>文件夹名</th>
                  <th style={{ ...S.th, width: 60 }}>分镜数</th>
                  <th style={{ ...S.th, width: 60 }}>音频数</th>
                  <th style={{ ...S.th, width: 140 }}>创建时间</th>
                  <th style={{ ...S.th, width: 140 }}>完成时间</th>
                  <th style={{ ...S.th, width: 60 }}>状态</th>
                  <th style={{ ...S.th, width: 140 }}>过期时间</th>
                  <th style={{ ...S.th, width: 80 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      暂无任务
                    </td>
                  </tr>
                )}
                {tasks.map((t, idx) => (
                  <tr key={t.id} style={{ borderBottom: idx < tasks.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <td style={{ ...S.td, textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ ...S.td, maxWidth: 260 }}>
                      <span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {t.folderName}
                      </span>
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' }}>{t.shotCount}</td>
                    <td style={{ ...S.td, textAlign: 'center' }}>{t.audioCount}</td>
                    <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.createdAt}</td>
                    <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.completedAt ?? '—'}</td>
                    <td style={S.td}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.status === 'done' ? '#22c55e' : t.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                        {t.status === 'done' ? '成功' : t.status === 'failed' ? '失败' : '排队中'}
                      </span>
                    </td>
                    <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.expiresAt ?? '—'}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {t.status === 'done' && (
                          <button onClick={() => setViewModal(t)} style={S.linkBtn}>查看</button>
                        )}
                        {t.status === 'done' && t.audioCount > 0 && (
                          <button
                            onClick={() => handleDownloadTaskZip(t)}
                            disabled={downloadingTask === t.id}
                            style={{ ...S.linkBtn, color: downloadingTask === t.id ? 'var(--text-muted)' : '#14b8a6', display: 'inline-flex', alignItems: 'center', gap: 2 }}
                          >
                            {downloadingTask === t.id
                              ? <><Loader size={10} style={{ animation: 'spin 1s linear infinite' }} />打包 {downloadProgress}</>
                              : <><Download size={10} />下载</>}
                          </button>
                        )}
                        <button onClick={() => deleteTask(t.id)} style={{ ...S.linkBtn, color: '#ef4444' }}>删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 查看文件夹 Modal */}
      {viewModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setViewModal(null)}
        >
          <div
            style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', width: '90%', maxWidth: 600, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{viewModal.folderName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                  {viewModal.shotCount} 个分镜，{viewModal.audioCount} 条音频
                </div>
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '12px 20px', flex: 1 }}>
              {/* 整包下载按钮 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '8px 10px', background: 'rgba(20,184,166,0.06)', borderRadius: 7 }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  共 {viewModal.audioCount} 条音频，{viewModal.shotCount} 个分镜
                </span>
                <button
                  onClick={() => handleDownloadTaskZip(viewModal)}
                  disabled={downloadingTask === viewModal.id}
                  style={{ ...S.btnPrimary, gap: 5, padding: '6px 14px', fontSize: '0.74rem' }}
                >
                  {downloadingTask === viewModal.id
                    ? <><Loader size={11} style={{ animation: 'spin 1s linear infinite' }} />打包 {downloadProgress}</>
                    : <><Package size={11} />整包下载 .zip</>}
                </button>
              </div>

              {viewModal.shots?.map((shot, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, background: 'var(--bg-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Folder size={14} color="#f59e0b" />
                    <span style={{ flex: 1 }}>{shot.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      {shot.audios.length} 个文件
                    </span>
                    <button
                      onClick={() => handleDownloadFolder(viewModal.folderName, shot.name, shot.audios)}
                      style={{ ...S.linkBtn, gap: 3, color: '#14b8a6' }}
                      title="把本文件夹打 zip 下载"
                    >
                      <Package size={11} />文件夹
                    </button>
                  </div>
                  {shot.audios.map((audio, j) => (
                    <div key={j} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '5px 10px 5px 30px', fontSize: '0.74rem',
                      color: audio.status === 'failed' ? '#ef4444' : 'var(--text-secondary)',
                      borderLeft: '2px solid var(--border-light)', marginLeft: 10,
                    }}>
                      <span style={{ color: '#14b8a6', fontSize: '0.68rem' }}>♪</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={audio.fileName}>
                        {audio.fileName}
                      </span>
                      {audio.durationSec != null && (
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
                          {audio.durationSec.toFixed(1)}s
                        </span>
                      )}
                      {audio.audioUrl && audio.status !== 'failed' ? (
                        <>
                          <audio controls style={{ height: 22, maxWidth: 160 }} src={audio.audioUrl} />
                          <button
                            onClick={() => handleDownloadSingle(audio)}
                            style={{ ...S.linkBtn, padding: 2, color: '#14b8a6' }}
                            title="下载本条"
                          >
                            <Download size={11} />
                          </button>
                        </>
                      ) : audio.errMsg ? (
                        <span style={{ fontSize: '0.62rem', color: '#ef4444' }} title={audio.errMsg}>
                          失败
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── VoiceCard ────────────────────────────────────────────────────────────────

function VoiceCard({ voice, selected, onSelect }: { voice: VoiceCard; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10,
        border: `1px solid ${selected ? '#14b8a6' : 'var(--border-light)'}`,
        background: selected ? 'rgba(20,184,166,0.06)' : 'var(--bg-primary)',
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: voice.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
        {voice.name.slice(0, 1)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voice.name}</span>
          {voice.starred && <Star size={11} color="#f59e0b" fill="#f59e0b" style={{ flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{voice.type}</div>
        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 1 }}>{voice.lang}</div>
        <button
          onClick={e => e.stopPropagation()}
          style={{ marginTop: 6, padding: '2px 10px', borderRadius: 20, border: '1px solid var(--border-light)', background: 'transparent', fontSize: '0.68rem', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          试听
        </button>
      </div>
    </div>
  )
}

// ─── 样式 ─────────────────────────────────────────────────────────────────────

const S = {
  backBtn: { display: 'inline-flex', alignItems: 'center', marginBottom: 16, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  tab: { padding: '10px 20px', border: 'none', background: 'transparent', fontSize: '0.84rem', color: 'var(--text-muted)', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2, fontWeight: 500 } as React.CSSProperties,
  tabActive: { color: '#14b8a6', borderBottomColor: '#14b8a6', fontWeight: 700 } as React.CSSProperties,
  card: { background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 18px' } as React.CSSProperties,
  th: { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const },
  td: { padding: '8px 12px', verticalAlign: 'middle' as const },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '8px 18px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost: { display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  linkBtn: { background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '0.72rem', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline', textUnderlineOffset: 2 } as React.CSSProperties,
  inp: { padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none' } as React.CSSProperties,
  speedChip: { padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-muted)', fontSize: '0.76rem', cursor: 'pointer' } as React.CSSProperties,
  speedChipActive: { borderColor: '#14b8a6', background: 'rgba(20,184,166,0.1)', color: '#14b8a6', fontWeight: 700 } as React.CSSProperties,
  modeRadio: {
    display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: 8,
    border: '1px solid var(--border-light)', cursor: 'pointer', userSelect: 'none' as const,
    background: 'var(--bg-card)', fontSize: '0.84rem', fontWeight: 500,
  } as React.CSSProperties,
  modeRadioActive: {
    borderColor: '#14b8a6', background: 'rgba(20,184,166,0.06)', color: '#14b8a6', fontWeight: 700,
  } as React.CSSProperties,
}
