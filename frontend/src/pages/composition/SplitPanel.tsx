import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Plus, Trash2, X, Loader2, ChevronLeft, RefreshCw, Upload, Scissors, Play, Pause, Folder, Download,
  ChevronsLeft, ChevronLeft as ChevLeft, ChevronRight as ChevRight, ChevronsRight, ZoomIn, ZoomOut, Sparkles,
  Link as LinkIcon, Search, Edit3, MapPin,
} from 'lucide-react'
import {
  type MaterialFolderDTO, type SegmentDTO, type SourceVideoDTO,
  autoSplitSourceVideo, createFolder, createSourceVideo, deleteFolder, deleteSourceVideo,
  exportSourceVideoSplit, getSourceVideo, importSourceVideoFromUrl, listFolders, localFileUrl,
  pageSourceVideos, probeVideo, updateFolder, updateSourceVideoSegments, uploadDirectToBackend,
} from '../../api/composition'
import { apiFetch } from '../../lib/apiClient'

const card: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
  borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)',
}
const btn: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4,
}
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--gradient-1)', color: '#fff', border: 'none' }
const btnDanger: React.CSSProperties = { ...btn, color: 'var(--danger)' }

// 默认色板（fallback 用，folder 自带 color 时优先取 folder.color）
const DEFAULT_PALETTE = ['#fbbf24', '#a78bfa', '#f59e0b', '#fb7185', '#34d399', '#60a5fa',
  '#f472b6', '#22d3ee', '#84cc16', '#fb923c', '#c084fc', '#10b981', '#3b82f6']

function colorOf(folders: MaterialFolderDTO[], code: string | undefined | null): string {
  if (!code) return '#9ca3af'
  const f = folders.find(f => f.code === code)
  if (f?.color) return f.color
  // 没找到 / 没设色 → 按 code 哈希到调色板
  let h = 0
  for (const c of code) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return DEFAULT_PALETTE[h % DEFAULT_PALETTE.length]
}

function labelOf(folders: MaterialFolderDTO[], code: string | undefined | null): string {
  if (!code) return '未分类'
  return folders.find(f => f.code === code)?.name ?? code
}

function fmt(ms: number | undefined): string {
  if (ms == null || isNaN(ms)) return '00:00.000'
  const total = Math.max(0, Math.floor(ms))
  const m = Math.floor(total / 60000)
  const s = Math.floor((total % 60000) / 1000)
  const ms3 = total % 1000
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms3).padStart(3, '0')}`
}

export default function SplitPanel() {
  const [list, setList] = useState<SourceVideoDTO[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [active, setActive] = useState<SourceVideoDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [autoSplitting, setAutoSplitting] = useState(false)
  const [urlImporting, setUrlImporting] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  // 视频播放状态
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentMs, setCurrentMs] = useState(0)

  // 时间线打点状态
  const [pendingStart, setPendingStart] = useState<number | null>(null) // IN 已打、OUT 待打
  const [pickerCategoryFor, setPickerCategoryFor] = useState<{ start: number; end: number } | null>(null)

  // 草稿 segments（保存前的本地状态）
  const [segments, setSegments] = useState<SegmentDTO[]>([])
  const [dirty, setDirty] = useState(false)

  // 时间线缩放（1x = 全宽；> 1 时横向滚动）
  const [zoom, setZoom] = useState(1)

  // 片段列表搜索
  const [segmentSearch, setSegmentSearch] = useState('')

  // 动态文件夹
  const [folders, setFolders] = useState<MaterialFolderDTO[]>([])
  const [folderEditor, setFolderEditor] = useState<{ mode: 'create' | 'edit'; id?: number; name: string; code?: string; color?: string; description?: string } | null>(null)
  const [importingFolder, setImportingFolder] = useState(false)
  const [batchCreateOpen, setBatchCreateOpen] = useState(false)
  const [batchCreateText, setBatchCreateText] = useState('')
  const [batchCreating, setBatchCreating] = useState(false)

  useEffect(() => { void reload(); void reloadFolders() }, [])
  useEffect(() => { if (activeId) void loadActive(activeId) }, [activeId])

  async function reloadFolders() {
    try { setFolders(await listFolders()) } catch (e) { setError(`加载文件夹失败：${String(e)}`) }
  }

  async function saveFolder() {
    if (!folderEditor) return
    const f = folderEditor
    if (!f.name.trim()) { setError('文件夹名称不能为空'); return }
    try {
      if (f.mode === 'create') {
        await createFolder({ name: f.name.trim(), code: f.code?.trim() || undefined, color: f.color, description: f.description })
      } else if (f.id) {
        await updateFolder(f.id, { name: f.name.trim(), color: f.color, description: f.description })
      }
      setFolderEditor(null)
      await reloadFolders()
    } catch (e) { setError(String(e)) }
  }

  async function onImportFolder() {
    // 用 File System Access API（Chrome/Edge）—— 能枚举空子目录
    const win = window as unknown as { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle> }
    if (typeof win.showDirectoryPicker !== 'function') {
      setError('浏览器不支持文件夹选择 API，请用 Chrome / Edge 最新版')
      return
    }
    let dirHandle: FileSystemDirectoryHandle
    try {
      dirHandle = await win.showDirectoryPicker()
    } catch (e) {
      if ((e as { name?: string }).name === 'AbortError') return
      setError(String(e))
      return
    }

    setError(null)
    setImportingFolder(true)
    try {
      const fd = new FormData()
      let subDirCount = 0
      // @ts-expect-error AsyncIterable on FileSystemDirectoryHandle
      for await (const entry of dirHandle.values()) {
        if (entry.kind !== 'directory') continue
        const subDirName = entry.name
        if (subDirName.startsWith('.')) continue
        // 显式声明这个子目录存在（即使为空）
        fd.append('subDir', subDirName)
        subDirCount++
        // @ts-expect-error AsyncIterable on FileSystemDirectoryHandle
        for await (const child of entry.values()) {
          if (child.kind !== 'file') continue
          if (child.name.startsWith('.')) continue
          const file = await child.getFile()
          fd.append('file', file)
          fd.append('path', `${subDirName}/${file.name}`)
        }
      }
      if (subDirCount === 0) {
        throw new Error('所选目录下没有任何子目录')
      }
      const r = await apiFetch(`/api/material-folder-import`, { method: 'POST', body: fd })
      if (!r.ok) {
        throw new Error(`HTTP ${r.status} ${r.statusText}`)
      }
      const j = await r.json() as { success: boolean; data?: MaterialFolderDTO[]; errorMessage?: string }
      if (!j.success) throw new Error(j.errorMessage ?? 'import failed')
      await reloadFolders()
    } catch (e) {
      setError(`文件夹导入失败：${String(e)}`)
    } finally {
      setImportingFolder(false)
    }
  }

  /** 批量新建文件夹：从文本框每行一个名字（数字前缀作为 sortNo） */
  async function runBatchCreate() {
    const lines = batchCreateText.split(/\r?\n/).map(s => s.trim()).filter(s => s.length > 0)
    if (lines.length === 0) {
      setError('请输入至少一个文件夹名（每行一个）')
      return
    }
    setBatchCreating(true)
    setError(null)
    let succ = 0, skip = 0
    for (const line of lines) {
      // 解析数字前缀作为 sortNo
      const m = line.match(/^(\d+)[\-_\s\.]?(.*)$/)
      let sortNo: number | undefined
      let displayName = line
      if (m) {
        sortNo = parseInt(m[1], 10)
        if (m[2] && m[2].trim()) displayName = m[2].trim()
      }
      const code = displayName || line
      try {
        await createFolder({ code, name: displayName, sortNo })
        succ++
      } catch (e) {
        const msg = String(e)
        // 已存在的 folder 由 service 层幂等返回，但若意外冲突就跳过继续
        if (msg.includes('Duplicate') || msg.includes('uk_code')) skip++
        else throw e
      }
    }
    setBatchCreating(false)
    setBatchCreateOpen(false)
    setBatchCreateText('')
    await reloadFolders()
    if (skip > 0) {
      setError(`成功创建 ${succ} 个，跳过 ${skip} 个已存在的`)
    }
  }

  async function removeFolder(id: number, name: string) {
    if (!confirm(`删除文件夹「${name}」？该文件夹下的素材会保留但变成未分类。`)) return
    try {
      await deleteFolder(id)
      await reloadFolders()
    } catch (e) { setError(String(e)) }
  }

  async function reload() {
    try {
      const p = await pageSourceVideos({ pageIndex: 1, pageSize: 50 })
      setList(p.records ?? [])
      if (!activeId && p.records && p.records.length > 0) {
        setActiveId(p.records[0].id)
      }
    } catch (e) { setError(String(e)) }
  }

  async function loadActive(id: number) {
    try {
      const v = await getSourceVideo(id)
      setActive(v)
      setSegments(v.segments ?? [])
      setDirty(false)
      setPendingStart(null)
      setCurrentMs(0)
    } catch (e) { setError(String(e)) }
  }

  async function onImportUrl() {
    const u = urlInput.trim()
    if (!u) return
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      setError('URL 必须以 http:// 或 https:// 开头')
      return
    }
    setError(null)
    setUrlImporting(true)
    try {
      const v = await importSourceVideoFromUrl(u)
      setShowUrlInput(false)
      setUrlInput('')
      setActiveId(v.id)
      await reload()
    } catch (e) {
      setError(`URL 导入失败：${String(e)}`)
    } finally {
      setUrlImporting(false)
    }
  }

  async function onUploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    for (const file of Array.from(files)) {
      try {
        setUploading(`${file.name}：探测元信息…`)
        const probe = await probeVideo(file)
        setUploading(`${file.name}：上传到后端…`)
        const up = await uploadDirectToBackend('source', file)
        setUploading(`${file.name}：入库…`)
        const v = await createSourceVideo({
          ossKey: up.ossKey, originalName: file.name, fileSize: up.fileSize,
          durationMs: probe.durationMs, width: probe.width, height: probe.height,
        })
        setActiveId(v.id)
      } catch (e) {
        setError(`上传 ${file.name} 失败：${String(e)}`)
      }
    }
    setUploading(null)
    await reload()
  }

  function onTimeUpdate() {
    const v = videoRef.current
    if (!v) return
    setCurrentMs(Math.floor(v.currentTime * 1000))
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  function seekTo(ms: number) {
    const v = videoRef.current
    if (!v) return
    const clamped = Math.max(0, Math.min(duration, ms))
    v.currentTime = clamped / 1000
    setCurrentMs(clamped)
  }

  function nudge(deltaMs: number) {
    seekTo(currentMs + deltaMs)
  }

  function markIn() {
    setPendingStart(currentMs)
  }

  function markOut() {
    if (pendingStart == null) {
      setError('请先打 IN 点')
      return
    }
    if (currentMs <= pendingStart) {
      setError('OUT 点必须晚于 IN 点')
      return
    }
    // 弹窗选 category
    setPickerCategoryFor({ start: pendingStart, end: currentMs })
  }

  function confirmCategory(code: string) {
    if (!pickerCategoryFor) return
    const newSeg: SegmentDTO = {
      startMs: pickerCategoryFor.start,
      endMs: pickerCategoryFor.end,
      category: code,
    }
    setSegments([...segments, newSeg].sort((a, b) => a.startMs - b.startMs))
    setPendingStart(null)
    setPickerCategoryFor(null)
    setDirty(true)
  }

  function deleteSegment(idx: number) {
    setSegments(segments.filter((_, i) => i !== idx))
    setDirty(true)
  }

  async function clearAllSegments() {
    if (!active) return
    const exported = segments.filter(s => s.materialClipId != null).length
    let msg = `确认清空全部 ${segments.length} 个片段？`
    if (exported > 0) msg += `\n（含 ${exported} 个已导出片段，素材库里的 mp4 不会被删，但片段关联会重置）`
    if (!confirm(msg)) return
    try {
      const v = await updateSourceVideoSegments(active.id, [])
      setActive(v); setSegments(v.segments ?? []); setDirty(false)
    } catch (e) { setError(String(e)) }
  }

  async function clearAllFolders() {
    if (folders.length === 0) return
    if (!confirm(`确认清空全部 ${folders.length} 个目标文件夹？已分配到这些文件夹的素材会变成"未分类"。`)) return
    try {
      // 串行删避免并发约束冲突
      for (const f of folders) {
        try { await deleteFolder(f.id) } catch (e) { console.warn('delete folder failed', f.id, e) }
      }
      await reloadFolders()
    } catch (e) { setError(String(e)) }
  }

  function reassignCategory(idx: number, code: string) {
    const next = [...segments]
    next[idx] = { ...next[idx], category: code }
    setSegments(next)
    setDirty(true)
  }

  function renameSegment(idx: number) {
    const cur = segments[idx]
    const name = window.prompt('片段名称', cur.name ?? '')
    if (name == null) return
    const next = [...segments]
    next[idx] = { ...cur, name: name.trim() || undefined }
    setSegments(next)
    setDirty(true)
  }

  async function saveSegments() {
    if (!active) return
    try {
      const v = await updateSourceVideoSegments(active.id, segments)
      setActive(v); setSegments(v.segments ?? []); setDirty(false)
    } catch (e) { setError(String(e)) }
  }

  async function runAutoSplit() {
    if (!active) return
    if (segments.length > 0) {
      if (!confirm(`已有 ${segments.length} 个片段。自动拆解会保留已导出的，新结果追加。继续？`)) return
    }
    setAutoSplitting(true)
    setError(null)
    try {
      const v = await autoSplitSourceVideo(active.id)
      setActive(v); setSegments(v.segments ?? []); setDirty(false)
    } catch (e) {
      setError(`自动拆解失败：${String(e)}`)
    } finally {
      setAutoSplitting(false)
    }
  }

  async function exportAll() {
    if (!active) return
    if (dirty) {
      await saveSegments()
    }
    setExporting(true)
    setError(null)
    try {
      const v = await exportSourceVideoSplit(active.id)
      setActive(v); setSegments(v.segments ?? []); setDirty(false)
      alert(`切片导出完成，共 ${v.segments.length} 段已写入素材库`)
    } catch (e) {
      setError(`切片导出失败：${String(e)}`)
    } finally {
      setExporting(false)
    }
  }

  const duration = active?.durationMs ?? 0

  const countByCat = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of segments) {
      if (s.category) m.set(s.category, (m.get(s.category) ?? 0) + 1)
    }
    return m
  }, [segments])

  // 键盘快捷键：空格=播放/暂停 / I=IN / O=OUT / ←→=跳 1s / Shift+←→=跳 0.1s
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!active) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.code === 'Space') { e.preventDefault(); togglePlay() }
      else if (e.key === 'i' || e.key === 'I') { e.preventDefault(); markIn() }
      else if (e.key === 'o' || e.key === 'O') { e.preventDefault(); markOut() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(e.shiftKey ? -100 : -1000) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nudge(e.shiftKey ? 100 : 1000) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, currentMs, pendingStart])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: 'calc(100vh - 200px)', minHeight: 600 }}>
      {error && <ErrorBar msg={error} onClose={() => setError(null)} />}

      {/* 顶部 4 栏：源视频 / 预览 / 片段列表 / 目标文件夹 */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 360px 280px', gap: 12, flex: 1, minHeight: 0 }}>
        {/* 左：源视频列表 */}
        <div style={{ ...card, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>源视频</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ ...btn, padding: '4px 8px' }} onClick={() => setShowUrlInput(s => !s)}
                      title="通过 URL 导入">
                <LinkIcon size={12} />URL
              </button>
              <label style={{ ...btnPrimary, cursor: 'pointer', padding: '4px 10px' }}>
                <Upload size={12} />本地
                <input type="file" multiple accept="video/*" style={{ display: 'none' }}
                       onChange={e => { void onUploadFiles(e.target.files); e.currentTarget.value = '' }} />
              </label>
            </div>
          </div>
          {showUrlInput && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="粘贴视频 URL，如 https://..."
                onKeyDown={e => { if (e.key === 'Enter' && !urlImporting) onImportUrl() }}
                style={{
                  flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 4,
                  border: '1px solid var(--border-light)', background: 'var(--bg-primary)',
                  color: 'var(--text-primary)', outline: 'none', minWidth: 0,
                }}
              />
              <button style={{ ...btnPrimary, padding: '4px 8px', fontSize: 11 }}
                      onClick={onImportUrl} disabled={urlImporting || !urlInput.trim()}>
                {urlImporting ? <Loader2 size={11} className="spin" /> : '下载'}
              </button>
            </div>
          )}
          {uploading && (
            <div style={{ fontSize: 11, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Loader2 size={12} className="spin" /> {uploading}
            </div>
          )}
          {urlImporting && (
            <div style={{ fontSize: 11, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Loader2 size={12} className="spin" /> 后端下载中…
            </div>
          )}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {list.map(v => {
              const isActive = v.id === activeId
              return (
                <button key={v.id} onClick={() => setActiveId(v.id)} style={{
                  border: 'none', textAlign: 'left',
                  background: isActive ? 'var(--rose-100)' : 'transparent',
                  color: isActive ? 'var(--rose-700)' : 'var(--text-primary)',
                  borderRadius: 6, padding: 8, cursor: 'pointer', fontSize: 12,
                }}>
                  <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.originalName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{fmt(v.durationMs)}</span>
                    <span>{v.status === 'EXPORTED' ? '已导出' : `${v.segments?.length ?? 0} 段`}</span>
                  </div>
                </button>
              )
            })}
            {list.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 20, textAlign: 'center' }}>暂无源视频</div>
            )}
          </div>
          {active && (
            <button style={{ ...btnDanger, justifyContent: 'center' }}
                    onClick={async () => {
                      if (!confirm(`删除源视频 ${active.originalName}？已切的素材不会被删`)) return
                      await deleteSourceVideo(active.id)
                      setActiveId(null); setActive(null); setSegments([])
                      await reload()
                    }}>
              <Trash2 size={11} />删除当前
            </button>
          )}
        </div>

        {/* 中：视频预览 */}
        <div style={{ ...card, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          {active ? (
            <video
              ref={videoRef}
              src={localFileUrl(active.ossKey)}
              controls
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              style={{ maxWidth: '100%', maxHeight: '100%', background: '#000', borderRadius: 8 }}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>请在左侧选择或导入一个源视频</div>
          )}
        </div>

        {/* 第 3 栏：片段列表（卡片式） */}
        <div style={{ ...card, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>片段列表</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{segments.length} 段</span>
            {segments.length > 0 && (
              <button onClick={clearAllSegments}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 2 }}
                      title="清空全部片段">
                <Trash2 size={11} />清空
              </button>
            )}
            <div style={{ position: 'relative', flex: 1, marginLeft: 'auto' }}>
              <Search size={11} color="var(--text-muted)" style={{ position: 'absolute', left: 8, top: 7 }} />
              <input
                value={segmentSearch}
                onChange={e => setSegmentSearch(e.target.value)}
                placeholder="搜索片段文本"
                style={{
                  width: '100%', fontSize: 11, padding: '4px 8px 4px 24px',
                  borderRadius: 4, border: '1px solid var(--border-light)',
                  background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none',
                }}
              />
              {segmentSearch && (
                <button onClick={() => setSegmentSearch('')}
                        style={{ position: 'absolute', right: 4, top: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {segments
              .map((s, i) => ({ s, i }))
              .filter(({ s }) => {
                if (!segmentSearch.trim()) return true
                const q = segmentSearch.trim().toLowerCase()
                return [s.name, s.memo, s.category && labelOf(folders, s.category)]
                  .some(t => t && t.toLowerCase().includes(q))
              })
              .map(({ s, i }) => (
                <SegmentCard key={i} idx={i} seg={s} folders={folders}
                             onSeek={() => seekTo(s.startMs)}
                             onRename={() => renameSegment(i)}
                             onDelete={() => deleteSegment(i)}
                             onChangeCategory={code => reassignCategory(i, code)} />
              ))}
            {segments.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 40, textAlign: 'center' }}>
                当前素材暂无片段
              </div>
            )}
          </div>
        </div>

        {/* 第 4 栏：目标文件夹（动态） */}
        <div style={{ ...card, padding: 12, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>目标文件夹</div>
              {folders.length > 0 && (
                <button onClick={clearAllFolders}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 2 }}
                        title="清空全部文件夹">
                  <Trash2 size={11} />清空
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button style={{ ...btn, padding: '3px 8px', fontSize: 11 }}
                      onClick={onImportFolder}
                      disabled={importingFolder}
                      title="上传整个目录：每个子目录创建一个文件夹（空目录也支持）">
                {importingFolder ? <Loader2 size={11} className="spin" /> : <Upload size={11} />}
                {importingFolder ? '导入中…' : '上传'}
              </button>
              <button style={{ ...btn, padding: '3px 8px', fontSize: 11 }}
                      onClick={() => setBatchCreateOpen(true)}
                      title="粘贴文件夹名（每行一个）批量创建——适合空目录场景">
                <Plus size={11} />批量
              </button>
              <button style={{ ...btn, padding: '3px 8px', fontSize: 11 }}
                      onClick={() => setFolderEditor({ mode: 'create', name: '', color: '#fbbf24' })}
                      title="新建文件夹">
                <Plus size={11} />新建
              </button>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {folders.map(f => {
              const n = countByCat.get(f.code) ?? 0
              const c = colorOf(folders, f.code)
              return (
                <div key={f.id} style={{
                  padding: '8px 10px', borderRadius: 6,
                  background: n > 0 ? `${c}15` : 'var(--bg-primary)',
                  borderLeft: `3px solid ${c}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500 }}>
                    <Folder size={12} color={c} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.sortNo ? `${f.sortNo} ` : ''}{f.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{n} 段</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                            onClick={() => setFolderEditor({ mode: 'edit', id: f.id, name: f.name, color: f.color, description: f.description })}
                            title="重命名">
                      <Edit3 size={11} />
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0 }}
                            onClick={() => removeFolder(f.id, f.name)}
                            title="删除">
                      <X size={12} />
                    </button>
                  </div>
                  {f.refAudioFilename && (
                    <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>🎙</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={f.refAudioFilename}>{f.refAudioFilename}</span>
                      {f.refAudioDurationMs != null && (
                        <span style={{ fontFamily: 'monospace' }}>
                          {(f.refAudioDurationMs / 1000).toFixed(3)}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {folders.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: 11, padding: 16, textAlign: 'center' }}>
                还没有文件夹，点上方「上传」选目录或「新建」单个
              </div>
            )}
          </div>
          <button style={{ ...btnPrimary, justifyContent: 'center' }}
                  disabled={!active || segments.length === 0 || exporting}
                  onClick={exportAll}>
            {exporting ? <Loader2 size={12} className="spin" /> : <Download size={12} />}
            批量切片导出
          </button>
        </div>
      </div>

      {/* 底部时间线 + 控制条 */}
      {active && (
        <div style={{ ...card, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Timeline duration={duration} currentMs={currentMs} segments={segments}
                    pendingStart={pendingStart} zoom={zoom} folders={folders} onSeek={seekTo}
                    onSegmentChange={(idx, seg) => {
                      const next = [...segments]
                      next[idx] = seg
                      setSegments(next)
                      setDirty(true)
                    }}
                    onSegmentCommit={() => {
                      // 拖拽完成后排序（保持时间顺序），并标 dirty 等用户保存
                      setSegments(prev => [...prev].sort((a, b) => a.startMs - b.startMs))
                    }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button style={btn} onClick={togglePlay} title="空格">
                {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? '暂停' : '播放'}
              </button>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                {fmt(currentMs)} / {fmt(duration)}
              </span>
              {/* 微调 */}
              <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
                <button style={{ ...btn, padding: '4px 6px' }} onClick={() => nudge(-1000)} title="← 1 秒">
                  <ChevronsLeft size={11} />
                </button>
                <button style={{ ...btn, padding: '4px 6px' }} onClick={() => nudge(-100)} title="Shift+← 0.1 秒">
                  <ChevLeft size={11} />
                </button>
                <button style={{ ...btn, padding: '4px 6px' }} onClick={() => nudge(100)} title="Shift+→ 0.1 秒">
                  <ChevRight size={11} />
                </button>
                <button style={{ ...btn, padding: '4px 6px' }} onClick={() => nudge(1000)} title="→ 1 秒">
                  <ChevronsRight size={11} />
                </button>
              </div>
              {/* 缩放 */}
              <div style={{ display: 'flex', gap: 2, marginLeft: 8, alignItems: 'center' }}>
                <button style={{ ...btn, padding: '4px 6px' }} onClick={() => setZoom(z => Math.max(1, z / 2))} title="缩小">
                  <ZoomOut size={11} />
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28, textAlign: 'center' }}>{zoom}x</span>
                <button style={{ ...btn, padding: '4px 6px' }} onClick={() => setZoom(z => Math.min(20, z * 2))} title="放大">
                  <ZoomIn size={11} />
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <button style={btn} onClick={markIn} disabled={!active} title="I 键">
                <Scissors size={12} />打 IN 点
              </button>
              <button style={btn} onClick={markOut} disabled={pendingStart == null} title="O 键">
                <Scissors size={12} />打 OUT 点
              </button>
              {pendingStart != null && (
                <span style={{ fontSize: 11, color: 'var(--accent-primary)' }}>
                  IN: {fmt(pendingStart)}
                </span>
              )}
              <button style={btn} onClick={() => setPendingStart(null)} disabled={pendingStart == null}>
                取消
              </button>
              <button style={btn} onClick={saveSegments} disabled={!dirty}>
                {dirty && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#f59e0b' }} />}
                保存
              </button>
              <button style={{ ...btnPrimary, padding: '6px 12px' }}
                      onClick={runAutoSplit} disabled={!active || autoSplitting}
                      title="抽音轨 → 百炼 ASR → LLM 归类">
                {autoSplitting ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />}
                {autoSplitting ? '拆解中（30-90 秒）' : '自动拆解'}
              </button>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            快捷键：<b>空格</b> 播放/暂停 · <b>I</b> 打 IN · <b>O</b> 打 OUT · <b>← →</b> ±1s · <b>Shift+← →</b> ±0.1s
          </div>
        </div>
      )}

      {/* 选 category 弹窗 */}
      {pickerCategoryFor && (
        <Modal onClose={() => setPickerCategoryFor(null)} title={`分配片段（${fmt(pickerCategoryFor.start)} → ${fmt(pickerCategoryFor.end)}）`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {folders.map(f => (
              <button key={f.id} onClick={() => confirmCategory(f.code)}
                      style={{
                        ...btn, padding: '10px 8px', fontSize: 12, justifyContent: 'center',
                        borderLeft: `4px solid ${colorOf(folders, f.code)}`,
                      }}>
                {f.name}
              </button>
            ))}
            {folders.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                还没有文件夹，请先到右侧「新建」一个
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button style={btn} onClick={() => setPickerCategoryFor(null)}>取消</button>
          </div>
        </Modal>
      )}

      {/* 批量新建文件夹弹窗 */}
      {batchCreateOpen && (
        <Modal onClose={() => setBatchCreateOpen(false)} title="批量新建文件夹">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            每行一个文件夹名。前缀数字（如 <code>1钩子</code>）会作为排序号，剩余文字作为名称。
            已存在的会跳过。
          </div>
          <textarea
            value={batchCreateText}
            onChange={e => setBatchCreateText(e.target.value)}
            placeholder={'1钩子\n2功效可视化\n3妆效展示\n4妆效展示-反例\n...'}
            rows={12}
            autoFocus
            style={{
              width: '100%', padding: '8px 10px', borderRadius: 6,
              border: '1px solid var(--border-light)', background: 'var(--bg-secondary)',
              fontSize: 13, color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
              fontFamily: 'monospace',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button style={btn} onClick={() => setBatchCreateOpen(false)}>取消</button>
            <button style={btnPrimary} onClick={runBatchCreate} disabled={batchCreating}>
              {batchCreating ? <Loader2 size={12} className="spin" /> : <Plus size={12} />}
              {batchCreating ? '创建中…' : '批量创建'}
            </button>
          </div>
        </Modal>
      )}

      {/* 文件夹新建/编辑弹窗 */}
      {folderEditor && (
        <Modal onClose={() => setFolderEditor(null)} title={folderEditor.mode === 'create' ? '新建文件夹' : '编辑文件夹'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ width: 80 }}>名称</span>
              <input
                value={folderEditor.name}
                onChange={e => setFolderEditor({ ...folderEditor, name: e.target.value })}
                style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-light)',
                         background: 'var(--bg-secondary)', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
                autoFocus
              />
            </label>
            {folderEditor.mode === 'create' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ width: 80 }}>code</span>
                <input
                  value={folderEditor.code ?? ''}
                  onChange={e => setFolderEditor({ ...folderEditor, code: e.target.value })}
                  placeholder="可空，后端自动生成"
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-light)',
                           background: 'var(--bg-secondary)', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
                />
              </label>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ width: 80 }}>颜色</span>
              <input type="color" value={folderEditor.color ?? '#fbbf24'}
                     onChange={e => setFolderEditor({ ...folderEditor, color: e.target.value })}
                     style={{ width: 60, height: 28, padding: 2, borderRadius: 4, border: '1px solid var(--border-light)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{folderEditor.color}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
              <span style={{ width: 80, paddingTop: 6 }}>说明</span>
              <textarea
                value={folderEditor.description ?? ''}
                onChange={e => setFolderEditor({ ...folderEditor, description: e.target.value })}
                placeholder="语义描述（自动拆解 LLM 用）"
                rows={2}
                style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-light)',
                         background: 'var(--bg-secondary)', fontSize: 12, color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button style={btn} onClick={() => setFolderEditor(null)}>取消</button>
            <button style={btnPrimary} onClick={saveFolder}>保存</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// 单个片段大卡片：序号 + 分类色条 + 时间 + 文案 + 操作按钮
function SegmentCard({ idx, seg, folders, onSeek, onRename, onDelete, onChangeCategory }: {
  idx: number
  seg: SegmentDTO
  folders: MaterialFolderDTO[]
  onSeek: () => void
  onRename: () => void
  onDelete: () => void
  onChangeCategory: (code: string) => void
}) {
  const [editingCat, setEditingCat] = useState(false)
  const color = colorOf(folders, seg.category)
  const exported = seg.materialClipId != null
  return (
    <div style={{
      position: 'relative',
      padding: '10px 12px 10px 14px',
      borderRadius: 6,
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderLeft: `4px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {/* 主体：序号 + 文本 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', minWidth: 18 }}>
          {idx + 1}
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1, wordBreak: 'break-word' }}>
          {seg.name || '（无内容）'}
        </span>
        {exported && (
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#dcfce7', color: '#15803d', whiteSpace: 'nowrap' }}>
            已导出
          </span>
        )}
      </div>
      {/* 时间 */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', marginLeft: 26 }}>
        {fmtSec(seg.startMs)} ~ {fmtSec(seg.endMs)}
      </div>
      {/* 操作行：分类下拉 + 跳转 + 重命名 + 删除 */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4, fontSize: 11, alignItems: 'center', marginLeft: 26 }}>
        {editingCat ? (
          <select
            autoFocus
            value={seg.category ?? ''}
            onChange={e => { onChangeCategory(e.target.value); setEditingCat(false) }}
            onBlur={() => setEditingCat(false)}
            style={{ fontSize: 11, padding: '1px 4px', borderRadius: 3 }}
          >
            <option value="">未分类</option>
            {folders.map(f => <option key={f.id} value={f.code}>{f.name}</option>)}
          </select>
        ) : (
          <button onClick={() => setEditingCat(true)}
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                    fontSize: 11, color: seg.category ? color : 'var(--text-muted)', fontWeight: 500,
                  }}
                  title="点击归类">
            {seg.category ? labelOf(folders, seg.category) : '+ 归类'}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <button onClick={onSeek}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', padding: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          <MapPin size={11} />跳转
        </button>
        <button onClick={onRename}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Edit3 size={11} />编辑
        </button>
        <button onClick={onDelete}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Trash2 size={11} />删除
        </button>
      </div>
    </div>
  )
}

function fmtSec(ms: number | undefined): string {
  if (ms == null) return '--'
  const total = Math.max(0, ms)
  const s = Math.floor(total / 1000)
  const ms3 = Math.floor(total % 1000)
  return `${String(s).padStart(2, '0')}.${String(ms3).padStart(3, '0')}`
}

// 时间线：横向条 + 时间刻度 + segments 彩色块（可拖整体/拖左右边缘）+ 游标 + IN 点 + 悬停 tooltip + 拖拽 scrub
type SegDrag = {
  idx: number
  mode: 'move' | 'left' | 'right'
  initial: SegmentDTO
  startMouseMs: number
}

function Timeline({ duration, currentMs, segments, pendingStart, zoom, folders, onSeek, onSegmentChange, onSegmentCommit }: {
  duration: number; currentMs: number; segments: SegmentDTO[];
  pendingStart: number | null; zoom: number;
  folders: MaterialFolderDTO[];
  onSeek: (ms: number) => void
  onSegmentChange?: (idx: number, seg: SegmentDTO) => void
  onSegmentCommit?: () => void
}) {
  const MIN_SEG_MS = 100
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [hoverMs, setHoverMs] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [segDrag, setSegDrag] = useState<SegDrag | null>(null)

  function pixelToMs(clientX: number): number {
    if (!innerRef.current || duration <= 0) return 0
    const rect = innerRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.floor(ratio * duration)
  }

  // 时间线 scrub 拖拽
  useEffect(() => {
    if (!dragging) return
    function onMove(ev: MouseEvent) { onSeek(pixelToMs(ev.clientX)) }
    function onUp() { setDragging(false) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    const prev = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = prev
    }
  }, [dragging, duration, onSeek])

  // 片段块拖拽
  useEffect(() => {
    if (!segDrag) return
    function onMove(ev: MouseEvent) {
      if (!segDrag) return
      const cur = pixelToMs(ev.clientX)
      const delta = cur - segDrag.startMouseMs
      const init = segDrag.initial
      let next: SegmentDTO = { ...init }
      const segLen = init.endMs - init.startMs
      if (segDrag.mode === 'move') {
        let s = init.startMs + delta
        s = Math.max(0, Math.min(s, duration - segLen))
        next.startMs = s
        next.endMs = s + segLen
      } else if (segDrag.mode === 'left') {
        let s = init.startMs + delta
        s = Math.max(0, Math.min(s, init.endMs - MIN_SEG_MS))
        next.startMs = s
      } else {
        let e = init.endMs + delta
        e = Math.max(init.startMs + MIN_SEG_MS, Math.min(e, duration))
        next.endMs = e
      }
      // 拖动期间不重置 materialClipId（已导出过的片段拖完会在保存时被识别为新位置，
      // 用户应该意识到调整后需要重新导出）
      onSegmentChange?.(segDrag.idx, next)
    }
    function onUp() { setSegDrag(null); onSegmentCommit?.() }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    const prev = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = prev
    }
  }, [segDrag, duration, onSegmentChange, onSegmentCommit])

  // 缩放后让当前播放位置自动滚动到可见区域
  useEffect(() => {
    if (!wrapRef.current || duration <= 0) return
    const wrap = wrapRef.current
    const ratio = currentMs / duration
    const targetX = ratio * wrap.scrollWidth * zoom / 1 // innerWidth = wrap.clientWidth * zoom
    const innerW = wrap.clientWidth * zoom
    const want = ratio * innerW
    // 仅当 zoom > 1 且当前游标超出可视区时滚动
    if (zoom > 1) {
      const visMin = wrap.scrollLeft
      const visMax = wrap.scrollLeft + wrap.clientWidth
      if (want < visMin + 40 || want > visMax - 40) {
        wrap.scrollLeft = Math.max(0, want - wrap.clientWidth / 2)
      }
    }
  }, [currentMs, zoom, duration])

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!innerRef.current || duration <= 0) return
    e.preventDefault()
    const rect = innerRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSeek(Math.floor(ratio * duration))
    setDragging(true)
  }

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!innerRef.current || duration <= 0) return
    const rect = innerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.max(0, Math.min(1, x / rect.width))
    setHoverMs(Math.floor(ratio * duration))
    // tooltip 位置相对外层 wrap，受滚动影响
    if (wrapRef.current) {
      const wrapRect = wrapRef.current.getBoundingClientRect()
      setHoverX(e.clientX - wrapRect.left)
    }
  }

  // 自适应刻度密度：让每格至少 60px 宽度
  const tickStepMs = useMemo(() => {
    if (duration <= 0) return 0
    const innerW = (wrapRef.current?.clientWidth ?? 800) * zoom
    const pxPerMs = innerW / duration
    const minPx = 60
    const minMs = minPx / pxPerMs
    const candidates = [100, 250, 500, 1000, 2000, 5000, 10000, 15000, 30000, 60000, 120000, 300000, 600000]
    return candidates.find(c => c >= minMs) ?? 600000
  }, [duration, zoom])

  const ticks = useMemo(() => {
    if (tickStepMs <= 0 || duration <= 0) return []
    const arr: number[] = []
    for (let t = 0; t <= duration; t += tickStepMs) arr.push(t)
    return arr
  }, [tickStepMs, duration])

  return (
    <div ref={wrapRef} style={{
      position: 'relative', overflowX: zoom > 1 ? 'auto' : 'hidden', overflowY: 'hidden',
      borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-primary)',
    }}>
      <div ref={innerRef}
           onMouseDown={onMouseDown}
           onMouseMove={onMove}
           onMouseLeave={() => setHoverMs(null)}
           style={{
             position: 'relative', height: 56, width: `${100 * zoom}%`,
             cursor: dragging ? 'grabbing' : 'pointer',
           }}>
        {/* 顶部刻度 */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 18, borderBottom: '1px solid var(--border-light)' }}>
          {ticks.map(t => (
            <div key={t} style={{
              position: 'absolute', left: `${(t / duration) * 100}%`,
              top: 0, height: '100%', borderLeft: '1px solid var(--border-light)',
              fontSize: 9, color: 'var(--text-muted)', paddingLeft: 3,
              fontFamily: 'monospace', whiteSpace: 'nowrap',
            }}>{fmtShort(t)}</div>
          ))}
        </div>
        {/* segments 彩色块 */}
        {segments.map((s, i) => {
          if (duration <= 0) return null
          const left = (s.startMs / duration) * 100
          const w = ((s.endMs - s.startMs) / duration) * 100
          const draggable = !!onSegmentChange
          function startSegDrag(mode: 'move' | 'left' | 'right', e: React.MouseEvent) {
            if (!draggable) return
            e.stopPropagation()
            e.preventDefault()
            setSegDrag({ idx: i, mode, initial: { ...s }, startMouseMs: pixelToMs(e.clientX) })
          }
          return (
            <div key={i} style={{
              position: 'absolute', top: 22, height: 28,
              left: `${left}%`, width: `${w}%`,
              background: colorOf(folders, s.category),
              opacity: 0.85, borderRadius: 3,
              cursor: draggable ? 'grab' : 'default',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
            onMouseDown={e => startSegDrag('move', e)}
            title={`${labelOf(folders, s.category)} ${fmt(s.startMs)} → ${fmt(s.endMs)}（拖动调整位置 / 边缘拖动调整起止）`}>
              {/* 左侧 resize 手柄 */}
              {draggable && (
                <div onMouseDown={e => startSegDrag('left', e)} style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: 6,
                  cursor: 'ew-resize', background: 'rgba(0,0,0,0.25)',
                  borderTopLeftRadius: 3, borderBottomLeftRadius: 3,
                }} />
              )}
              {/* 右侧 resize 手柄 */}
              {draggable && (
                <div onMouseDown={e => startSegDrag('right', e)} style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0, width: 6,
                  cursor: 'ew-resize', background: 'rgba(0,0,0,0.25)',
                  borderTopRightRadius: 3, borderBottomRightRadius: 3,
                }} />
              )}
            </div>
          )
        })}
        {/* IN 点 */}
        {pendingStart != null && duration > 0 && (
          <div style={{
            position: 'absolute', top: 18, bottom: 0,
            left: `${(pendingStart / duration) * 100}%`,
            width: 2, background: '#f59e0b', pointerEvents: 'none',
          }} />
        )}
        {/* 当前播放位置 */}
        {duration > 0 && (
          <div style={{
            position: 'absolute', top: 18, bottom: 0,
            left: `${(currentMs / duration) * 100}%`,
            width: 2, background: '#dc2626', pointerEvents: 'none',
          }} />
        )}
      </div>
      {/* 鼠标悬停 tooltip */}
      {hoverMs != null && (
        <div style={{
          position: 'absolute', top: 0, left: hoverX, transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10,
          padding: '2px 6px', borderRadius: 3, fontFamily: 'monospace',
          pointerEvents: 'none', zIndex: 5,
        }}>{fmt(hoverMs)}</div>
      )}
    </div>
  )
}

function fmtShort(ms: number): string {
  const total = Math.max(0, Math.floor(ms))
  const m = Math.floor(total / 60000)
  const s = Math.floor((total % 60000) / 1000)
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(61,10,26,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 12, padding: 20,
        minWidth: 480, maxWidth: 600, boxShadow: 'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ErrorBar({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      ...card, borderColor: 'var(--danger)', color: 'var(--danger)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: 13 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
        <X size={16} />
      </button>
    </div>
  )
}
