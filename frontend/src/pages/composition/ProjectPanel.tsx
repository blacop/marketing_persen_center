import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Trash2, X, Loader2, Play, ChevronLeft, RefreshCw, Eye, Download, FolderUp, AlertCircle, CheckCircle2, SlidersHorizontal, Folder,
} from 'lucide-react'
import {
  type BgmLoopMode, type ChapterAudioMode, type CompositionChapterDTO, type CompositionPlanPreviewDTO,
  type CompositionProjectDTO, type ImportChapterInput, type RenderJobDTO, type RenderOutputDTO, type VoiceoverAssetDTO,
  cancelRenderJob, createMaterial, createProject, createVoiceover, deleteProject, getProject, importChapters,
  listRenderOutputs, localFileUrl, pageProjects, pageRenderJobs, pageVoiceovers,
  previewProject, probeAudio, probeVideo, renderOutputSignedUrl, saveChapters, sha256OfFile,
  submitRender, subscribeRenderProgress, updateProject, uploadDirectToBackend,
} from '../../api/composition'

const VIDEO_EXTS = ['.mp4', '.mov', '.mkv', '.avi', '.webm', '.m4v']
const AUDIO_EXTS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']
const BGM_FOLDER_NAME = 'bgm'

const card: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
  borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)',
}
const btn: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
}
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--gradient-1)', color: '#fff', border: 'none' }
const btnDanger: React.CSSProperties = { ...btn, color: 'var(--danger)' }
const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-light)',
  background: 'var(--bg-secondary)', fontSize: 13, color: 'var(--text-primary)', outline: 'none',
}
const numStyle: React.CSSProperties = {
  ...inputStyle, padding: '4px 8px', width: 70, textAlign: 'center',
}

// 主题色：按图取近似青绿色（#10b981 ~ teal-500）
const TEAL = '#10b981'
const TEAL_BG = '#ecfdf5'
const WARN_BG = '#fff7ed'
const WARN_BORDER = '#fed7aa'
const WARN_TEXT = '#9a3412'

type View = { type: 'list' } | { type: 'editor'; projectId: number }

export default function ProjectPanel() {
  const [view, setView] = useState<View>({ type: 'list' })
  return view.type === 'list'
    ? <ProjectList onOpen={(id) => setView({ type: 'editor', projectId: id })} />
    : <ProjectEditor projectId={view.projectId} onBack={() => setView({ type: 'list' })} />
}

// ─────────────────────────── 项目列表 ───────────────────────────

function ProjectList({ onOpen }: { onOpen: (id: number) => void }) {
  const [data, setData] = useState<CompositionProjectDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [parsed, setParsed] = useState<ParsedRoot | null>(null)
  const [pendingName, setPendingName] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<UploadProgress>({ current: 0, total: 0, label: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { void reload() }, [])

  async function reload() {
    setLoading(true)
    try {
      // 只展示 FOLDER 项目（CATEGORY 老项目隐藏）
      const p = await pageProjects({ pageIndex: 1, pageSize: 50, chapterSource: 'FOLDER' })
      setData(p.records ?? [])
      setTotal(p.total ?? 0)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  function handleFiles(files: File[]) {
    if (files.length === 0) return
    const result = parseFolderToChapters(files)
    if (result.chapters.length === 0) {
      setError('未在所选目录中识别到任何章节子目录（每个章节子目录需包含至少 1 个视频文件）')
      return
    }
    setParsed(result)
    setPendingName(topFolderName(files) || '未命名工作文件夹')
  }

  function onPickerChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    handleFiles(files)
    e.target.value = ''
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    if (busy || parsed) return
    const items = e.dataTransfer?.items
    if (!items || items.length === 0) return
    try {
      const files = await collectFilesFromDataTransfer(items)
      handleFiles(files)
    } catch (err) {
      setError('读取拖入文件夹失败：' + String(err))
    }
  }

  async function onConfirmCreate() {
    if (!parsed) return
    if (!pendingName.trim()) { setError('请输入项目名'); return }
    setBusy(true)
    setError(null)
    try {
      const p = await createProject({
        name: pendingName.trim(),
        mode: 'ZHU_GE_LIANG',
        chapterSource: 'FOLDER',
      })
      const updated = await uploadParsedFolder(p.id, parsed, setProgress)
      setParsed(null)
      setPendingName('')
      await reload()
      onOpen(updated.id)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  function cancelParsed() {
    setParsed(null)
    setPendingName('')
  }

  return (
    <div>
      {error && <ErrorBar msg={error} onClose={() => setError(null)} />}

      {/* 拖拽 / 选择工作文件夹入口 */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!busy && !parsed) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          ...card,
          padding: '64px 32px',
          marginBottom: 16,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: dragging ? TEAL : 'var(--border-light)',
          background: dragging ? TEAL_BG : 'var(--bg-card)',
          transition: 'all 0.15s ease',
        }}
      >
        <Folder size={36} color={dragging ? TEAL : 'var(--text-secondary)'} />
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginTop: 16 }}>
          拖动工作文件夹到此处
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '24px auto', maxWidth: 280, color: 'var(--text-muted)', fontSize: 12,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          <span>或</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
        </div>

        <button
          style={{
            ...btn, padding: '10px 24px', fontSize: 14,
            background: TEAL, color: '#fff', border: 'none',
          }}
          disabled={busy || !!parsed}
          onClick={() => inputRef.current?.click()}
        >
          选择工作文件夹
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          style={{ display: 'none' }}
          onChange={onPickerChanged}
        />

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          工作文件夹需满足特定结构，请提前整理。
          <span style={{ color: TEAL, fontWeight: 500, marginLeft: 4 }} title="每个章节为一个子目录，章节内至少 1 个视频；可选：根目录下 bgm/ 子目录的音频会作为 BGM 库；章节内多余音频会作为多配音池。">
            点击查看详细要求。
          </span>
        </div>
      </div>

      {/* 解析后的预览 + 项目命名 */}
      {parsed && (
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            预览：{parsed.chapters.length} 个章节 · BGM {parsed.bgmAudios.length} 首
          </div>
          {parsed.warnings.length > 0 && (
            <div style={{ background: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: 6, padding: 8, marginBottom: 12 }}>
              {parsed.warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: WARN_TEXT }}>⚠ {w}</div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflow: 'auto', marginBottom: 12 }}>
            {parsed.chapters.map((ch, i) => (
              <div key={i} style={{ fontSize: 12, padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: 4 }}>
                <div style={{ fontWeight: 500 }}>{i + 1}. {ch.folderName}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  🎬 {ch.videos.length} 个视频
                  {ch.audios.length > 0 ? <> · 🎙 {ch.audios.length} 个音频</> : <> · 无配音</>}
                </div>
              </div>
            ))}
            {parsed.bgmAudios.length > 0 && (
              <div style={{ fontSize: 12, padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: 4 }}>
                <div style={{ fontWeight: 500 }}>🎵 BGM 库</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  {parsed.bgmAudios.map(f => f.name).join(', ')}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>项目名</span>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={pendingName}
              onChange={e => setPendingName(e.target.value)}
              disabled={busy}
            />
          </div>

          {busy ? (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                上传中 {progress.current}/{progress.total} · {progress.label}
              </div>
              <div style={{ height: 6, borderRadius: 4, background: 'var(--rose-50)', overflow: 'hidden' }}>
                <div style={{
                  width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '0%',
                  height: '100%', background: TEAL, transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...btnPrimary, background: TEAL }}
                onClick={onConfirmCreate}
                disabled={!pendingName.trim()}
              >
                创建项目并上传（{parsed.chapters.length} 章 + {parsed.bgmAudios.length} 首 BGM）
              </button>
              <button style={btn} onClick={cancelParsed}>取消</button>
            </div>
          )}
        </div>
      )}

      {/* 已有项目列表 */}
      <div style={{ ...card, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          共 {total} 个项目 {loading && <Loader2 size={12} className="spin" />}
        </div>
        <button style={btn} onClick={reload}><RefreshCw size={14} />刷新</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {data.map(p => (
          <div key={p.id} style={{ ...card, padding: 16, cursor: 'pointer' }} onClick={() => onOpen(p.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  🧙 诸葛亮 · {p.combinationStrategy}{p.targetCount ? ` · 目标 ${p.targetCount} 条` : ''}
                </div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                background: p.status === 'READY' ? 'var(--success-light)'
                          : p.status === 'ARCHIVED' ? '#f3f4f6'
                          : 'var(--rose-100)',
                color: p.status === 'READY' ? '#15803d'
                     : p.status === 'ARCHIVED' ? '#6b7280'
                     : 'var(--rose-700)',
              }}>{p.status}</span>
            </div>
            {p.description && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.description}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button style={{ ...btn, fontSize: 11, padding: '4px 8px' }} onClick={(e) => { e.stopPropagation(); onOpen(p.id) }}>编辑</button>
              <button
                style={{ ...btnDanger, fontSize: 11, padding: '4px 8px' }}
                onClick={async (e) => {
                  e.stopPropagation()
                  if (!confirm(`删除项目 ${p.name}?`)) return
                  await deleteProject(p.id); reload()
                }}
              ><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
        {data.length === 0 && !loading && (
          <div style={{ ...card, gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
            暂无项目，拖入或选择工作文件夹即可创建
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────── 渲染弹窗类型 ───────────────────────────

type RenderStep = 'closed' | 'config' | 'tasks' | 'format'
type AspectRatio = '9:16' | '3:4' | '16:9' | '4:3' | '1:1'
type ExportType = 'DIRECT' | 'PREVIEW_EDIT' | 'LEGACY'
type Resolution = '720P' | '1080P' | '4K'
type Container = 'MP4' | 'MOV'
type Codec = 'H264' | 'HEVC'

interface RenderTaskCfg {
  exportPath: string
  aspectRatio: AspectRatio
  mirrorProb: number      // 0-100
  trimMin: number         // 100-200
  trimMax: number
}

interface RenderFormatCfg {
  exportType: ExportType
  exportPath: string
  resolution: Resolution
  fps: number
  container: Container
  codec: Codec
}

function aspectFromOutput(w?: number, h?: number): AspectRatio {
  if (!w || !h) return '9:16'
  const r = w / h
  if (Math.abs(r - 9 / 16) < 0.05) return '9:16'
  if (Math.abs(r - 3 / 4) < 0.05) return '3:4'
  if (Math.abs(r - 16 / 9) < 0.05) return '16:9'
  if (Math.abs(r - 4 / 3) < 0.05) return '4:3'
  if (Math.abs(r - 1) < 0.05) return '1:1'
  return '9:16'
}

// ─────────────────────────── 项目编辑器 ───────────────────────────

function ProjectEditor({ projectId, onBack }: { projectId: number; onBack: () => void }) {
  const [project, setProject] = useState<CompositionProjectDTO | null>(null)
  const [voiceovers, setVoiceovers] = useState<VoiceoverAssetDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draftChapters, setDraftChapters] = useState<CompositionChapterDTO[]>([])
  const [renderJobs, setRenderJobs] = useState<RenderJobDTO[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [previewData, setPreviewData] = useState<CompositionPlanPreviewDTO | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [chapterView, setChapterView] = useState<'card' | 'table'>('card')
  const [renderStep, setRenderStep] = useState<RenderStep>('closed')
  const [taskCfg, setTaskCfg] = useState<RenderTaskCfg | null>(null)
  const [previewedPlans, setPreviewedPlans] = useState<CompositionPlanPreviewDTO['plans']>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [taskSel, setTaskSel] = useState<Set<string>>(new Set())
  const [fmtCfg, setFmtCfg] = useState<RenderFormatCfg | null>(null)

  useEffect(() => { void load() }, [projectId])

  async function load() {
    setLoading(true)
    try {
      const [p, vs, jobs] = await Promise.all([
        getProject(projectId),
        pageVoiceovers({ pageIndex: 1, pageSize: 200 }),
        pageRenderJobs({ projectId, pageIndex: 1, pageSize: 20 }),
      ])
      setProject(p)
      setVoiceovers(vs.records ?? [])
      setRenderJobs(jobs.records ?? [])
      const chs = p.chapters ?? []
      setDraftChapters(chs)
      setSelectedIdx(0)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }

  async function onSaveChapters() {
    if (!project) return
    setSaving(true)
    try {
      const updated = await saveChapters(project.id, draftChapters)
      setProject(updated)
    } catch (e) { setError(String(e)) } finally { setSaving(false) }
  }

  async function onPreview() {
    if (!project) return
    setPreviewing(true)
    try {
      const updated = await saveChapters(project.id, draftChapters)
      setProject(updated)
      const p = await previewProject(project.id)
      setPreviewData(p)
    } catch (e) { setError(String(e)) } finally { setPreviewing(false) }
  }

  function openRenderFlow() {
    if (!project) return
    setTaskCfg({
      exportPath: '',
      aspectRatio: aspectFromOutput(project.outputWidth, project.outputHeight),
      mirrorProb: 50,
      trimMin: 101,
      trimMax: 120,
    })
    setRenderStep('config')
  }

  async function gotoTasksStep() {
    if (!project) return
    setPreviewLoading(true)
    setRenderStep('tasks')
    try {
      // 先保证章节是最新的，再调 preview，保证 hash 与最终 submit 时一致
      await saveChapters(project.id, draftChapters)
      const result = await previewProject(project.id, estimatedCount)
      const plans = result.plans ?? []
      setPreviewedPlans(plans)
      // 默认全选
      setTaskSel(new Set(plans.map(p => p.planHash)))
    } catch (e) {
      setError(String(e))
      setRenderStep('config')
    } finally {
      setPreviewLoading(false)
    }
  }

  function gotoFormatStep() {
    if (!project) return
    setFmtCfg({
      exportType: 'DIRECT',
      exportPath: taskCfg?.exportPath ?? '',
      resolution: project.outputHeight && project.outputHeight >= 2160 ? '4K'
        : project.outputHeight && project.outputHeight <= 720 ? '720P' : '1080P',
      fps: project.outputFps ?? 30,
      container: 'MP4',
      codec: 'H264',
    })
    setRenderStep('format')
  }

  async function actuallyStartExport() {
    if (!project || !taskCfg || !fmtCfg) return
    setRenderStep('closed')
    setSubmitting(true)
    try {
      const hashes = Array.from(taskSel)
      const count = hashes.length > 0 ? hashes.length : project.targetCount
      const job = await submitRender(project.id, count, {
        aspectRatio: taskCfg.aspectRatio,
        resolution: fmtCfg.resolution,
        fps: fmtCfg.fps,
        container: fmtCfg.container,
        codec: fmtCfg.codec,
        mirrorProb: taskCfg.mirrorProb,
        trimMin: taskCfg.trimMin,
        trimMax: taskCfg.trimMax,
        exportType: fmtCfg.exportType,
        exportPath: fmtCfg.exportPath || taskCfg.exportPath,
      }, hashes.length > 0 ? hashes : undefined)
      setRenderJobs([job, ...renderJobs])
    } catch (e) { setError(String(e)) } finally { setSubmitting(false) }
  }

  async function onImportedFolder(updated: CompositionProjectDTO) {
    setProject(updated)
    setDraftChapters(updated.chapters ?? [])
    setSelectedIdx(0)
  }

  async function onUpdateProjectBgm(patch: Partial<CompositionProjectDTO>) {
    if (!project) return
    const next = { ...project, ...patch }
    setProject(next)
    try {
      const saved = await updateProject(project.id, {
        name: next.name,
        description: next.description,
        mode: next.mode,
        chapterSource: next.chapterSource,
        combinationStrategy: next.combinationStrategy,
        targetCount: next.targetCount,
        globalBgmVoiceoverId: next.globalBgmVoiceoverId,
        bgmVoiceoverIds: next.bgmVoiceoverIds,
        bgmLoopMode: next.bgmLoopMode,
        bgmVolume: next.bgmVolume,
        bgmStartChapter: next.bgmStartChapter,
        outputWidth: next.outputWidth,
        outputHeight: next.outputHeight,
        outputFps: next.outputFps,
        status: next.status,
      })
      setProject(saved)
    } catch (e) { setError(String(e)) }
  }

  // 注意：所有 hooks 必须在任何条件返回之前调用，避免渲染间 hook 顺序变化
  const estimate = useMemo(() => {
    if (draftChapters.length === 0) return { count: 0, unbounded: false }
    let prod = 1
    let hasUnbounded = false
    for (const ch of draftChapters) {
      const c = computeChapterCombinations(ch)
      if (c.type === 'atLeastOne') { hasUnbounded = true; continue }
      if (c.value === 0) return { count: 0, unbounded: false }
      prod *= c.value
    }
    const target = project?.targetCount ?? prod
    // 有"≥1"章节时上限未知，按项目目标条数兜底（实际 planner 也是按 targetCount 跑）
    if (hasUnbounded) return { count: Math.max(1, target), unbounded: true }
    return { count: Math.max(1, Math.min(prod, target)), unbounded: false }
  }, [draftChapters, project?.targetCount])
  const estimatedCount = estimate.count

  if (loading || !project) {
    return <div style={card}><Loader2 size={16} className="spin" /> 加载中...</div>
  }

  const hasChapters = draftChapters.length > 0
  const currentChapter = hasChapters ? draftChapters[selectedIdx] : null

  return (
    <div>
      {error && <ErrorBar msg={error} onClose={() => setError(null)} />}

      {/* Header */}
      <div style={{ ...card, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={btn} onClick={onBack}><ChevronLeft size={14} />返回</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{project.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              🧙 诸葛亮 · 文件夹模式 · {project.combinationStrategy} · 目标 {project.targetCount} 条 · {project.outputWidth}×{project.outputHeight}@{project.outputFps}fps
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} onClick={onSaveChapters} disabled={saving || !hasChapters}>
            {saving && <Loader2 size={12} className="spin" />} 保存章节
          </button>
          <button style={btn} onClick={onPreview} disabled={previewing || !hasChapters}>
            {previewing ? <Loader2 size={12} className="spin" /> : <Eye size={14} />} 预览组合
          </button>
          <button style={btnPrimary} onClick={openRenderFlow} disabled={submitting || !hasChapters}>
            {submitting ? <Loader2 size={12} className="spin" /> : <Play size={14} />} 开始渲染
          </button>
        </div>
      </div>

      {/* 没有章节时：占满宽度的解析章节目录入口 */}
      {!hasChapters && (
        <FolderImportPanel
          project={project}
          existingChapters={draftChapters}
          onImported={onImportedFolder}
          onError={setError}
        />
      )}

      {/* 有章节时：卡片视图（BGM/列表/详情）或 表格视图（BGM/章节表） */}
      {hasChapters && chapterView === 'card' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 280px 1fr', gap: 16, marginBottom: 16, minHeight: 560 }}>
          <BgmLibraryPanel
            project={project}
            voiceovers={voiceovers}
            onChange={onUpdateProjectBgm}
          />
          <ChapterListPanel
            chapters={draftChapters}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
            viewMode={chapterView}
            onToggleView={() => setChapterView('table')}
          />
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {currentChapter ? (
              <ChapterDetailPanel
                key={currentChapter.id ?? selectedIdx}
                chapter={currentChapter}
                voiceovers={voiceovers}
                onChange={(updated) => {
                  const next = [...draftChapters]
                  next[selectedIdx] = updated
                  setDraftChapters(next)
                }}
              />
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>请在左侧选择一个章节</div>
            )}
          </div>
        </div>
      )}

      {hasChapters && chapterView === 'table' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, marginBottom: 16, minHeight: 560 }}>
          <BgmLibraryPanel
            project={project}
            voiceovers={voiceovers}
            onChange={onUpdateProjectBgm}
          />
          <ChapterTablePanel
            chapters={draftChapters}
            voiceovers={voiceovers}
            viewMode={chapterView}
            onToggleView={() => setChapterView('card')}
            onChapterChange={(idx, updated) => {
              const next = [...draftChapters]
              next[idx] = updated
              setDraftChapters(next)
            }}
          />
        </div>
      )}

      {/* 重新解析：FOLDER 项目已有章节时，提供入口 */}
      {hasChapters && (
        <FolderImportPanel
          project={project}
          existingChapters={draftChapters}
          onImported={onImportedFolder}
          onError={setError}
        />
      )}

      {/* 渲染任务 */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>渲染任务</div>
          <button style={btn} onClick={async () => {
            const jobs = await pageRenderJobs({ projectId: project.id, pageIndex: 1, pageSize: 20 })
            setRenderJobs(jobs.records ?? [])
          }}><RefreshCw size={12} />刷新</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {renderJobs.map(job => <RenderJobCard key={job.id} job={job} />)}
          {renderJobs.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20, fontSize: 13 }}>暂无渲染任务</div>}
        </div>
      </div>

      {previewData && (
        <Modal onClose={() => setPreviewData(null)} title={`组合预览（${previewData.generatedCount} / ${previewData.requestedCount}）`}>
          <div style={{ maxHeight: 500, overflow: 'auto' }}>
            {previewData.plans.map((p, i) => (
              <div key={p.planHash} style={{ ...card, marginBottom: 8, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>方案 {i + 1} · {((p.estimatedDurationMs ?? 0) / 1000).toFixed(1)}s</div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{p.planHash.slice(0, 32)}…</div>
                {p.chapters.map(ch => (
                  <div key={ch.chapterId} style={{ marginTop: 8, fontSize: 12 }}>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {ch.chapterName ?? `章节 ${ch.chapterId}`} · {ch.audioMode}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {ch.picks.map(pk =>
                        `${pk.originalName}${pk.trimmed ? '✂︎' : ''} (${((pk.takenDurationMs ?? 0) / 1000).toFixed(1)}s)`
                      ).join(' → ')}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* 渲染流程弹窗：① 渲染配置 → ② 选片导出 → ③ 导出格式 */}
      {renderStep === 'config' && taskCfg && (
        <RenderConfigModal
          estimated={estimatedCount}
          estimatedUnbounded={estimate.unbounded}
          cfg={taskCfg}
          onChange={setTaskCfg}
          onClose={() => setRenderStep('closed')}
          onConfirm={gotoTasksStep}
        />
      )}
      {renderStep === 'tasks' && taskCfg && (
        <RenderTasksModal
          plans={previewedPlans}
          loading={previewLoading}
          selected={taskSel}
          onChangeSelected={setTaskSel}
          onClose={() => setRenderStep('closed')}
          onConfirm={gotoFormatStep}
        />
      )}
      {renderStep === 'format' && fmtCfg && (
        <RenderFormatModal
          cfg={fmtCfg}
          onChange={setFmtCfg}
          onClose={() => setRenderStep('closed')}
          onConfirm={actuallyStartExport}
        />
      )}
    </div>
  )
}

// ─────────────────────────── BGM 库面板 ───────────────────────────

function BgmLibraryPanel({ project, voiceovers, onChange }: {
  project: CompositionProjectDTO
  voiceovers: VoiceoverAssetDTO[]
  onChange: (patch: Partial<CompositionProjectDTO>) => void
}) {
  const ids = project.bgmVoiceoverIds ?? []
  const bgmCount = ids.length
  const loopMode: BgmLoopMode = project.bgmLoopMode ?? 'LOOP'
  const volume = project.bgmVolume ?? 70
  const startChapter = project.bgmStartChapter ?? 1
  const bgmFiles = useMemo(
    () => ids.map(id => voiceovers.find(v => v.id === id)).filter((v): v is VoiceoverAssetDTO => v != null),
    [ids, voiceovers],
  )

  return (
    <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>背景音乐库</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>自动同步背景音乐文件夹</div>
      </div>

      {bgmCount === 0 ? (
        <div style={{
          background: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: 8,
          padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <AlertCircle size={14} color={WARN_TEXT} />
          <div style={{ fontSize: 12, color: WARN_TEXT }}>未发现素材，建议检查工作文件夹</div>
        </div>
      ) : (
        <div style={{
          background: TEAL_BG, border: `1px solid ${TEAL}`, borderRadius: 8,
          padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <CheckCircle2 size={14} color={TEAL} />
          <div style={{ fontSize: 12, color: '#065f46' }}>已同步 {bgmCount} 首 BGM</div>
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
        每条作品，随机选取一个背景音乐。如果背景音乐播完时，视频还有内容，那么
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="radio" name={`bgm-loop-${project.id}`} checked={loopMode === 'LOOP'}
                 onChange={() => onChange({ bgmLoopMode: 'LOOP' })}
                 style={{ accentColor: TEAL }} />
          循环播放该背景音乐
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="radio" name={`bgm-loop-${project.id}`} checked={loopMode === 'PICK_AGAIN'}
                 onChange={() => onChange({ bgmLoopMode: 'PICK_AGAIN' })}
                 style={{ accentColor: TEAL }} />
          再随机选取一个背景音乐
        </label>
      </div>

      <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0 16px' }} />

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>音量</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min={0} max={100} step={1}
                 value={volume}
                 onChange={e => onChange({ bgmVolume: Number(e.target.value) })}
                 style={{ flex: 1, accentColor: TEAL }} />
          <input type="number" min={0} max={100} value={volume}
                 onChange={e => onChange({ bgmVolume: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                 style={numStyle} />
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border-light)', margin: '0 0 16px' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span>从第</span>
        <input type="number" min={1} value={startChapter}
               onChange={e => onChange({ bgmStartChapter: Math.max(1, Number(e.target.value) || 1) })}
               style={numStyle} />
        <span>个章节开始应用背景音乐</span>
      </div>

      {bgmFiles.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ marginBottom: 4 }}>已收录：</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 100, overflow: 'auto' }}>
            {bgmFiles.map(v => (
              <div key={v.id} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                   title={v.ossKey}>
                · {v.ossKey?.split('/').pop() ?? `#${v.id}`} {v.durationMs ? `(${(v.durationMs / 1000).toFixed(1)}s)` : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────── 章节列表 ───────────────────────────

function ChapterListPanel({ chapters, selectedIdx, onSelect, viewMode, onToggleView }: {
  chapters: CompositionChapterDTO[]
  selectedIdx: number
  onSelect: (idx: number) => void
  viewMode: 'card' | 'table'
  onToggleView: () => void
}) {
  return (
    <div style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>章节</div>
        <ViewToggleButton viewMode={viewMode} onToggle={onToggleView} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'auto', flex: 1 }}>
        {chapters.map((ch, i) => {
          const active = i === selectedIdx
          const matCount = ch.materialClipIds?.length ?? 0
          const voCount = (ch.voiceoverIds && ch.voiceoverIds.length > 0)
            ? ch.voiceoverIds.length
            : (ch.voiceoverId ? 1 : 0)
          const combo = computeChapterCombinations(ch)
          const lacking = matCount === 0
          return (
            <button key={ch.id ?? i} onClick={() => onSelect(i)} style={{
              border: 'none',
              background: active ? '#f3f4f6' : 'transparent',
              borderLeft: active ? `3px solid ${TEAL}` : '3px solid transparent',
              borderRadius: 6,
              padding: '10px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 13,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEAL, minWidth: 16 }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ch.name || ch.sourceFolderName || `章节 ${i + 1}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 11, color: 'var(--text-muted)', paddingLeft: 26 }}>
                <span title="视频素材数">🎬 {matCount}</span>
                <span title="配音数">🎙 {voCount}</span>
                <span title="可生成的章节内组合数">≣ {comboLabel(combo)}</span>
                {lacking && <AlertCircle size={12} color="#f59e0b" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ViewToggleButton({ viewMode, onToggle }: {
  viewMode: 'card' | 'table'
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={viewMode === 'card' ? '切换为表格视图' : '切换为卡片视图'}
      style={{
        background: '#f3f4f6',
        border: 'none',
        borderRadius: 6,
        padding: '4px 6px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        color: TEAL,
      }}
    >
      <SlidersHorizontal size={14} />
    </button>
  )
}

// ─────────────────────────── 章节表格视图 ───────────────────────────

function ChapterTablePanel({ chapters, voiceovers, viewMode, onToggleView, onChapterChange }: {
  chapters: CompositionChapterDTO[]
  voiceovers: VoiceoverAssetDTO[]
  viewMode: 'card' | 'table'
  onToggleView: () => void
  onChapterChange: (idx: number, ch: CompositionChapterDTO) => void
}) {
  const cellStyle: React.CSSProperties = {
    padding: '10px 12px', verticalAlign: 'middle', fontSize: 12, borderBottom: '1px solid var(--border-light)',
  }
  const headBg = '#f9fafb'
  const headStyle: React.CSSProperties = {
    ...cellStyle, fontWeight: 600, color: 'var(--text-secondary)', background: headBg,
    position: 'sticky', top: 0, zIndex: 2, borderBottom: '1px solid var(--border)',
  }
  // 前三列粘性偏移：# 40 / 章节名 140 / 素材数&组合数 160
  const stickyOffsets = [0, 40, 180]
  const headStickyStyle = (col: 0 | 1 | 2): React.CSSProperties => ({
    ...headStyle, left: stickyOffsets[col], zIndex: 3,
    boxShadow: col === 2 ? 'inset -1px 0 0 var(--border-light)' : undefined,
  })
  const cellStickyStyle = (col: 0 | 1 | 2, rowBg: string): React.CSSProperties => ({
    ...cellStyle, position: 'sticky', left: stickyOffsets[col], background: rowBg, zIndex: 1,
    boxShadow: col === 2 ? 'inset -1px 0 0 var(--border-light)' : undefined,
  })
  const noParamStyle: React.CSSProperties = { color: 'var(--text-muted)' }
  const tableInputStyle: React.CSSProperties = { ...inputStyle, padding: '4px 8px', fontSize: 12, width: '100%' }

  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>章节</div>
        <ViewToggleButton viewMode={viewMode} onToggle={onToggleView} />
      </div>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={{ ...headStickyStyle(0), width: 40, textAlign: 'center' }}>#</th>
              <th style={{ ...headStickyStyle(1), width: 140 }}>章节名</th>
              <th style={{ ...headStickyStyle(2), width: 160 }}>素材数 &amp; 组合数</th>
              <th style={{ ...headStyle, width: 90, textAlign: 'center' }}>去除原音</th>
              <th style={{ ...headStyle, width: 170 }}>章节模式</th>
              <th style={{ ...headStyle, width: 130 }}>选取 N 个视频</th>
              <th style={{ ...headStyle, width: 130 }}>至少 X 秒</th>
              <th style={{ ...headStyle, width: 200 }}>配音</th>
              <th style={{ ...headStyle, width: 160 }}>视频重复率</th>
              <th style={{ ...headStyle, width: 80, textAlign: 'center' }}>转场</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((ch, i) => {
              const audioMode = ch.audioMode
              const matCount = ch.materialClipIds?.length ?? 0
              const voCount = (ch.voiceoverIds && ch.voiceoverIds.length > 0)
                ? ch.voiceoverIds.length
                : (ch.voiceoverId ? 1 : 0)
              const combo = computeChapterCombinations(ch)
              const lacking = matCount === 0
              const needsFixedCount = audioMode !== 'NO_VO_MIN_DURATION'
              const needsMinDuration = audioMode === 'NO_VO_MIN_DURATION'
              const needsVoiceover = audioMode === 'ONE_VO_MULTI_CLIP'
                || audioMode === 'FILL_CLIPS_FOR_VO'
                || audioMode === 'LOOP_CLIP_FOR_VO'
              const onChange = (patch: Partial<CompositionChapterDTO>) => onChapterChange(i, { ...ch, ...patch })
              const rowBg = i % 2 === 0 ? 'var(--bg-card)' : '#fafafb'
              return (
                <tr key={ch.id ?? i} style={{ background: rowBg }}>
                  <td style={{ ...cellStickyStyle(0, rowBg), textAlign: 'center', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ ...cellStickyStyle(1, rowBg), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}
                      title={ch.name ?? ch.sourceFolderName ?? ''}>
                    {ch.name || ch.sourceFolderName || `章节 ${i + 1}`}
                  </td>
                  <td style={cellStickyStyle(2, rowBg)}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      🎬 {matCount} &nbsp; 🎙 {voCount} &nbsp; ≣ {comboLabel(combo)}
                      {lacking && <AlertCircle size={11} color="#f59e0b" style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                    </span>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <input type="checkbox" checked={!!ch.stripOriginalAudio}
                           onChange={e => onChange({ stripOriginalAudio: e.target.checked })}
                           style={{ accentColor: TEAL }} />
                  </td>
                  <td style={cellStyle}>
                    <select style={tableInputStyle} value={audioMode}
                            onChange={e => onChange({ audioMode: e.target.value as ChapterAudioMode })}>
                      <option value="ONE_VO_MULTI_CLIP">一个配音多个视频</option>
                      <option value="FILL_CLIPS_FOR_VO">为配音填充画面</option>
                      <option value="LOOP_CLIP_FOR_VO">为配音循环画面</option>
                      <option value="NO_VO_FIXED_COUNT">无配音 固定素材数</option>
                      <option value="NO_VO_MIN_DURATION">无配音 至少 X 秒</option>
                    </select>
                  </td>
                  <td style={cellStyle}>
                    {needsFixedCount ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>选取</span>
                        <input type="number" min={1} max={Math.max(1, matCount)}
                               value={ch.fixedClipCount ?? 1}
                               onChange={e => onChange({ fixedClipCount: Math.max(1, Number(e.target.value) || 1) })}
                               style={{ ...tableInputStyle, width: 60 }} />
                        <span>个</span>
                      </div>
                    ) : (
                      <span style={noParamStyle}>无此参数</span>
                    )}
                  </td>
                  <td style={cellStyle}>
                    {needsMinDuration ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>≥</span>
                        <input type="number" min={1} step={1}
                               value={Math.round((ch.minDurationMs ?? 5000) / 1000)}
                               onChange={e => onChange({ minDurationMs: Math.max(1000, (Number(e.target.value) || 1) * 1000) })}
                               style={{ ...tableInputStyle, width: 60 }} />
                        <span>秒</span>
                      </div>
                    ) : (
                      <span style={noParamStyle}>无此参数</span>
                    )}
                  </td>
                  <td style={cellStyle}>
                    {needsVoiceover ? (
                      <select style={tableInputStyle} value={ch.voiceoverId ?? ''}
                              onChange={e => onChange({ voiceoverId: e.target.value ? Number(e.target.value) : undefined })}>
                        <option value="">（无）</option>
                        {voiceovers.map(v => (
                          <option key={v.id} value={v.id}>
                            #{v.id} · {((v.durationMs ?? 0) / 1000).toFixed(1)}s
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={noParamStyle}>无此参数</span>
                    )}
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="range" min={0} max={1} step={0.05}
                             value={ch.repeatRate ?? 0}
                             onChange={e => onChange({ repeatRate: Number(e.target.value) })}
                             style={{ flex: 1, accentColor: TEAL }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 30, textAlign: 'right' }}>
                        {((ch.repeatRate ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <input type="checkbox" checked={!!ch.transitionEnabled}
                           onChange={e => onChange({ transitionEnabled: e.target.checked })}
                           style={{ accentColor: TEAL }} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────── 章节详情面板 ───────────────────────────

function ChapterDetailPanel({ chapter, voiceovers, onChange }: {
  chapter: CompositionChapterDTO
  voiceovers: VoiceoverAssetDTO[]
  onChange: (c: CompositionChapterDTO) => void
}) {
  const combo = computeChapterCombinations(chapter)
  const matCount = chapter.materialClipIds?.length ?? 0
  const voList = useMemo(() => voiceovers, [voiceovers])
  const audioMode = chapter.audioMode
  const repeatRate = chapter.repeatRate ?? 0
  const transition = !!chapter.transitionEnabled

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 顶部状态条 */}
      <div style={{
        background: TEAL_BG, padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${TEAL}33`,
      }}>
        <div style={{ fontSize: 14, color: '#065f46' }}>
          本章节预计可生成 <strong style={{ fontSize: 18, color: '#047857' }}>{comboLabel(combo)}</strong> 个组合
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#047857' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> 一个组合内，无重复素材
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={12} /> 组合之间，无相同排列
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 章节模式 5 radio */}
        <section>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>章节模式</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 13 }}>
            <ModeRadio name={`mode-${chapter.id}`} value="ONE_VO_MULTI_CLIP" current={audioMode}
                       onChange={v => onChange({ ...chapter, audioMode: v })}>一个配音多个视频</ModeRadio>
            <ModeRadio name={`mode-${chapter.id}`} value="FILL_CLIPS_FOR_VO" current={audioMode}
                       onChange={v => onChange({ ...chapter, audioMode: v })}>为配音填充画面</ModeRadio>
            <ModeRadio name={`mode-${chapter.id}`} value="LOOP_CLIP_FOR_VO" current={audioMode}
                       onChange={v => onChange({ ...chapter, audioMode: v })}>为配音循环情节</ModeRadio>
            <ModeRadio name={`mode-${chapter.id}`} value="NO_VO_FIXED_COUNT" current={audioMode}
                       onChange={v => onChange({ ...chapter, audioMode: v })}>无配音 固定素材数</ModeRadio>
            <ModeRadio name={`mode-${chapter.id}`} value="NO_VO_MIN_DURATION" current={audioMode}
                       onChange={v => onChange({ ...chapter, audioMode: v })}>无配音 至少 x 秒</ModeRadio>
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--border-light)' }} />

        {/* ───── 视频库（5 个模式都有） ───── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>视频库</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>自动同步工作文件夹</div>
          </div>
          {audioMode === 'LOOP_CLIP_FOR_VO' ? (
            // 模式 3 文档要求子章节，本项目暂未实现 → 友善 banner 占位
            <div style={{
              background: '#f3f4f6', border: '1px solid var(--border-light)', borderRadius: 8,
              padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <AlertCircle size={14} color="var(--text-muted)" />
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {matCount === 0 ? '未发现子章节，建议检查工作文件夹' : `已同步 ${matCount} 个素材（注：循环情节模式建议二级子目录，子章节支持开发中）`}
              </div>
            </div>
          ) : matCount === 0 ? (
            <div style={{
              background: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: 8,
              padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <AlertCircle size={14} color={WARN_TEXT} />
              <div style={{ fontSize: 12, color: WARN_TEXT }}>未发现素材，建议检查工作文件夹</div>
            </div>
          ) : (
            <div style={{
              background: TEAL_BG, border: `1px solid ${TEAL}`, borderRadius: 8,
              padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <CheckCircle2 size={14} color={TEAL} />
              <div style={{ fontSize: 13, color: '#065f46' }}>已同步 {matCount} 个素材</div>
            </div>
          )}
        </section>

        {/* ───── 模式 1：随机选取一条配音与 N 个视频 ───── */}
        {audioMode === 'ONE_VO_MULTI_CLIP' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>随机选取一条配音与</span>
              <input type="number" min={1} max={Math.max(1, matCount)}
                     value={chapter.fixedClipCount ?? 1}
                     onChange={e => onChange({ ...chapter, fixedClipCount: Math.max(1, Number(e.target.value) || 1) })}
                     style={numStyle} />
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>个视频，然后对视频整体变速，使其与音频时长一致。</div>
          </section>
        )}

        {/* ───── 模式 4：随机选取 N 个视频组成本章节 ───── */}
        {audioMode === 'NO_VO_FIXED_COUNT' && (
          <section style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span>随机选取</span>
            <input type="number" min={1} max={Math.max(1, matCount)}
                   value={chapter.fixedClipCount ?? 1}
                   onChange={e => onChange({ ...chapter, fixedClipCount: Math.max(1, Number(e.target.value) || 1) })}
                   style={numStyle} />
            <span>个视频组成本章节。</span>
          </section>
        )}

        {/* ───── 模式 5：随机选取视频，至少 X 秒 ───── */}
        {audioMode === 'NO_VO_MIN_DURATION' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>随机选取视频，使本章节时长至少</span>
              <input type="number" min={1} step={1}
                     value={Math.round((chapter.minDurationMs ?? 10000) / 1000)}
                     onChange={e => onChange({ ...chapter, minDurationMs: Math.max(1000, (Number(e.target.value) || 1) * 1000) })}
                     style={numStyle} />
              <span>秒。</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              如需精确控制时长，请在章节模式中选择前 3 种，用配音约束时长。
            </div>
          </section>
        )}

        {/* ───── 模式 3：循环策略 + 循环轮次 ───── */}
        {audioMode === 'LOOP_CLIP_FOR_VO' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ color: 'var(--text-secondary)' }}>每条作品，随机选取一条配音，然后按子章节顺序，随机选取视频</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" name={`loop-${chapter.id}`}
                     checked={(chapter.loopStrategy ?? 'FIXED_ROUNDS_THEN_SPEED') === 'FILL_THEN_CROP'}
                     onChange={() => onChange({ ...chapter, loopStrategy: 'FILL_THEN_CROP' })}
                     style={{ accentColor: TEAL }} />
              以正常速度循环，直到视频填满音频，然后剪切视频结尾
            </label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 6, cursor: 'pointer', flexDirection: 'column' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="radio" name={`loop-${chapter.id}`}
                       checked={(chapter.loopStrategy ?? 'FIXED_ROUNDS_THEN_SPEED') === 'FIXED_ROUNDS_THEN_SPEED'}
                       onChange={() => onChange({ ...chapter, loopStrategy: 'FIXED_ROUNDS_THEN_SPEED' })}
                       style={{ accentColor: TEAL }} />
                循环特定轮次，对视频整体变速，使其与音频时长一致
              </span>
              {(chapter.loopStrategy ?? 'FIXED_ROUNDS_THEN_SPEED') === 'FIXED_ROUNDS_THEN_SPEED' && (
                <div style={{ marginLeft: 22, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>循环</span>
                  <input type="number" min={1} value={chapter.loopRounds ?? 1}
                         onChange={e => onChange({ ...chapter, loopRounds: Math.max(1, Number(e.target.value) || 1) })}
                         style={numStyle} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>轮情节</span>
                </div>
              )}
            </label>
          </section>
        )}

        {/* ───── 视频重复率（5 模式都有） ───── */}
        <section>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>视频重复率</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ ...btn, padding: '4px 12px', cursor: 'default', fontSize: 12 }}>最小</span>
            <input type="range" min={0} max={1} step={0.05}
                   value={repeatRate}
                   onChange={e => onChange({ ...chapter, repeatRate: Number(e.target.value) })}
                   style={{ flex: 1, accentColor: TEAL }} />
            <span style={{ ...btn, padding: '4px 12px', cursor: 'default', fontSize: 12 }}>最大</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>原「质量模式」</span>
            <span>原「数量模式」</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            如果本章节素材相对其他章节较少，请设置相对较高的重复率。
          </div>
        </section>

        {/* ───── 配音库（仅模式 1/2/3） ───── */}
        {(audioMode === 'ONE_VO_MULTI_CLIP' || audioMode === 'FILL_CLIPS_FOR_VO' || audioMode === 'LOOP_CLIP_FOR_VO') && (
          <>
            <div style={{ height: 1, background: 'var(--border-light)' }} />
            <section>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>配音库</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>自动同步工作文件夹</div>
              </div>
              {(chapter.voiceoverIds && chapter.voiceoverIds.length > 0) ? (
                <div style={{
                  background: TEAL_BG, border: `1px solid ${TEAL}`, borderRadius: 8,
                  padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center',
                }}>
                  <CheckCircle2 size={14} color={TEAL} />
                  <div style={{ fontSize: 13, color: '#065f46' }}>已同步 {chapter.voiceoverIds.length} 个素材</div>
                </div>
              ) : (
                <select style={inputStyle} value={chapter.voiceoverId ?? ''}
                        onChange={e => onChange({ ...chapter, voiceoverId: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">（无配音）</option>
                  {voList.map(v => (
                    <option key={v.id} value={v.id}>
                      #{v.id} · {((v.durationMs ?? 0) / 1000).toFixed(1)}s · {v.textContent?.slice(0, 30) ?? v.ossKey?.split('/').pop()}
                    </option>
                  ))}
                </select>
              )}
            </section>

            {/* 模式 2：长度处理方式 + 超长裁剪策略 */}
            {audioMode === 'FILL_CLIPS_FOR_VO' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ color: 'var(--text-secondary)' }}>每条作品，随机选取一条配音，以配音为准</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name={`len-${chapter.id}`}
                         checked={(chapter.lengthAdjustMode ?? 'CROP') === 'CROP'}
                         onChange={() => onChange({ ...chapter, lengthAdjustMode: 'CROP' })}
                         style={{ accentColor: TEAL }} />
                  剪切视频时长
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name={`len-${chapter.id}`}
                         checked={(chapter.lengthAdjustMode ?? 'CROP') === 'SPEED'}
                         onChange={() => onChange({ ...chapter, lengthAdjustMode: 'SPEED' })}
                         style={{ accentColor: TEAL }} />
                  改变视频速度
                </label>
                {(chapter.lengthAdjustMode ?? 'CROP') === 'CROP' && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ color: 'var(--text-secondary)' }}>如果拼接后的视频比配音长，那么</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="radio" name={`trim-${chapter.id}`}
                             checked={chapter.overflowTrim === 'TRIM_HEAD'}
                             onChange={() => onChange({ ...chapter, overflowTrim: 'TRIM_HEAD' })}
                             style={{ accentColor: TEAL }} />
                      剪掉视频头部，对齐配音时长
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="radio" name={`trim-${chapter.id}`}
                             checked={(chapter.overflowTrim ?? 'TRIM_BOTH') === 'TRIM_BOTH'}
                             onChange={() => onChange({ ...chapter, overflowTrim: 'TRIM_BOTH' })}
                             style={{ accentColor: TEAL }} />
                      视频头尾各剪掉一半，对齐配音时长
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="radio" name={`trim-${chapter.id}`}
                             checked={chapter.overflowTrim === 'TRIM_TAIL'}
                             onChange={() => onChange({ ...chapter, overflowTrim: 'TRIM_TAIL' })}
                             style={{ accentColor: TEAL }} />
                      剪掉视频尾部，对齐配音时长
                    </label>
                  </div>
                )}
              </section>
            )}

            {/* 配音重复率（模式 1/2/3） */}
            <section>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>配音重复率</div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name={`audioReuse-${chapter.id}`}
                         checked={chapter.audioReuseMode === 'ONCE'}
                         onChange={() => onChange({ ...chapter, audioReuseMode: 'ONCE' })}
                         style={{ accentColor: TEAL }} />
                  每个配音只用一次
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name={`audioReuse-${chapter.id}`}
                         checked={(chapter.audioReuseMode ?? 'REUSE') === 'REUSE'}
                         onChange={() => onChange({ ...chapter, audioReuseMode: 'REUSE' })}
                         style={{ accentColor: TEAL }} />
                  允许重复使用
                </label>
              </div>
            </section>
          </>
        )}

        <div style={{ height: 1, background: 'var(--border-light)' }} />

        {/* 去除原音 */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!chapter.stripOriginalAudio}
                 onChange={e => onChange({ ...chapter, stripOriginalAudio: e.target.checked })}
                 style={{ accentColor: TEAL }} />
          去除视频素材原音
        </label>

        <div style={{ height: 1, background: 'var(--border-light)' }} />

        {/* 转场 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={transition}
                   onChange={e => onChange({ ...chapter, transitionEnabled: e.target.checked })}
                   style={{ accentColor: TEAL }} />
            转场
          </label>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>可能导致 DR 渲染出错，请谨慎开启</span>
        </div>
      </div>
    </div>
  )
}

function ModeRadio({ name, value, current, onChange, children }: {
  name: string
  value: ChapterAudioMode
  current: ChapterAudioMode
  onChange: (v: ChapterAudioMode) => void
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
      <input type="radio" name={name} checked={current === value}
             onChange={() => onChange(value)}
             style={{ accentColor: TEAL }} />
      {children}
    </label>
  )
}

// ─────────────────────────── 组合数计算 ───────────────────────────

type ChapterCombination = { type: 'exact'; value: number } | { type: 'atLeastOne' }

function computeChapterCombinations(ch: CompositionChapterDTO): ChapterCombination {
  const N = ch.materialClipIds?.length ?? 0
  const K = ch.fixedClipCount ?? 1
  const repeat = ch.repeatRate ?? 0
  // 多配音池：组合数 × 配音数（每个 voiceover 都是独立维度）
  const V = (ch.voiceoverIds && ch.voiceoverIds.length > 0)
    ? ch.voiceoverIds.length
    : (ch.voiceoverId ? 1 : 1)
  if (N === 0) return { type: 'exact', value: 0 }
  const mul = (base: ChapterCombination): ChapterCombination => {
    if (base.type !== 'exact') return base
    return { type: 'exact', value: base.value * V }
  }
  switch (ch.audioMode) {
    case 'NO_VO_FIXED_COUNT':
    case 'ONE_VO_MULTI_CLIP': {
      if (repeat === 0) {
        // P(N, K) = N! / (N-K)!
        if (K > N) return { type: 'exact', value: 0 }
        let p = 1
        for (let i = 0; i < K; i++) p *= (N - i)
        return mul({ type: 'exact', value: p })
      }
      // 允许重复 → N^K
      return mul({ type: 'exact', value: Math.pow(N, K) })
    }
    case 'LOOP_CLIP_FOR_VO':
      return mul({ type: 'exact', value: N })
    case 'FILL_CLIPS_FOR_VO':
    case 'NO_VO_MIN_DURATION':
      return { type: 'atLeastOne' }
    default:
      return { type: 'atLeastOne' }
  }
}

function comboLabel(c: ChapterCombination): string {
  if (c.type === 'atLeastOne') return '≥1'
  if (c.value > 9999) return `${(c.value / 1000).toFixed(0)}k+`
  return String(c.value)
}

// ─────────────────────────── FOLDER 模式：解析章节目录 ───────────────────────────

interface ParsedChapter {
  folderName: string
  videos: File[]
  audios: File[]
}

interface ParsedRoot {
  chapters: ParsedChapter[]
  bgmAudios: File[]
  warnings: string[]
}

type FilePathed = File & { webkitRelativePath?: string; _path?: string }

function fileRelPath(f: File): string {
  const fp = f as FilePathed
  return fp._path ?? fp.webkitRelativePath ?? fp.name
}

/** 把一组带 webkitRelativePath 的 File 解析成章节列表 + bgm 列表 */
function parseFolderToChapters(files: File[]): ParsedRoot {
  const warnings: string[] = []
  const byChapter = new Map<string, ParsedChapter>()
  const bgmAudios: File[] = []
  for (const f of files) {
    const path = fileRelPath(f)
    const segments = path.split('/').filter(Boolean)
    if (segments.length < 3) continue // 文件直接在根目录或 1 级深，跳过
    const folderName = segments[1]
    const filename = segments[segments.length - 1]
    if (filename.startsWith('.')) continue
    const lower = filename.toLowerCase()
    const ext = lower.slice(lower.lastIndexOf('.'))

    // 根目录下 bgm/ 子目录的音频文件 → BGM 库
    if (folderName.toLowerCase() === BGM_FOLDER_NAME) {
      if (AUDIO_EXTS.includes(ext)) bgmAudios.push(f)
      continue
    }

    let bucket = byChapter.get(folderName)
    if (!bucket) {
      bucket = { folderName, videos: [], audios: [] }
      byChapter.set(folderName, bucket)
    }
    if (VIDEO_EXTS.includes(ext)) bucket.videos.push(f)
    else if (AUDIO_EXTS.includes(ext)) bucket.audios.push(f)
  }

  const chapters = Array.from(byChapter.values()).sort((a, b) =>
    a.folderName.localeCompare(b.folderName, 'zh-Hans-CN'))
  for (const ch of chapters) {
    ch.videos.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    ch.audios.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  }
  bgmAudios.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))

  for (const ch of chapters) {
    if (ch.videos.length === 0) warnings.push(`「${ch.folderName}」缺少视频素材，将被跳过`)
  }

  return {
    chapters: chapters.filter(c => c.videos.length > 0),
    bgmAudios,
    warnings,
  }
}

interface UploadProgress { current: number; total: number; label: string }

/** 上传 parsed 中的所有视频/章节配音/BGM，并写入到指定项目的章节列表。 */
async function uploadParsedFolder(
  projectId: number,
  parsed: ParsedRoot,
  onProgress: (p: UploadProgress) => void,
): Promise<CompositionProjectDTO> {
  const chapterFileCount = parsed.chapters.reduce(
    (s, c) => s + c.videos.length + c.audios.length, 0,
  )
  const totalFiles = chapterFileCount + parsed.bgmAudios.length
  let done = 0
  onProgress({ current: 0, total: totalFiles, label: '准备上传…' })

  const chapterInputs: ImportChapterInput[] = []
  for (let chIdx = 0; chIdx < parsed.chapters.length; chIdx++) {
    const ch = parsed.chapters[chIdx]
    const clipIds: number[] = []
    for (const videoFile of ch.videos) {
      onProgress({ current: done, total: totalFiles, label: `${ch.folderName} / ${videoFile.name}` })
      const sha = await sha256OfFile(videoFile).catch(() => undefined)
      const probe = await probeVideo(videoFile)
      const upl = await uploadDirectToBackend('material', videoFile)
      const created = await createMaterial({
        ossKey: upl.ossKey,
        kind: 'VIDEO',
        originalName: videoFile.name,
        durationMs: probe.durationMs,
        width: probe.width,
        height: probe.height,
        fileSize: videoFile.size,
        sha256: sha ?? upl.sha256,
        sourceType: 'MANUAL_UPLOAD',
      } as Parameters<typeof createMaterial>[0])
      clipIds.push(created.id)
      done += 1
      onProgress({ current: done, total: totalFiles, label: `${ch.folderName} / ${videoFile.name}` })
    }
    const voiceoverIds: number[] = []
    for (const audioFile of ch.audios) {
      onProgress({ current: done, total: totalFiles, label: `${ch.folderName} / ${audioFile.name}` })
      const probe = await probeAudio(audioFile)
      const upl = await uploadDirectToBackend('voiceover', audioFile)
      const ext = audioFile.name.slice(audioFile.name.lastIndexOf('.') + 1).toLowerCase()
      const vo = await createVoiceover({
        ossKey: upl.ossKey,
        source: 'UPLOAD',
        durationMs: probe.durationMs,
        fileSize: audioFile.size,
        format: ext,
      } as Parameters<typeof createVoiceover>[0])
      voiceoverIds.push(vo.id)
      done += 1
      onProgress({ current: done, total: totalFiles, label: `${ch.folderName} / ${audioFile.name}` })
    }
    chapterInputs.push({
      sortNo: chIdx + 1,
      name: ch.folderName,
      sourceFolderName: ch.folderName,
      materialClipIds: clipIds,
      voiceoverId: voiceoverIds[0],
      voiceoverIds,
      fixedClipCount: clipIds.length,
    })
  }

  const bgmIds: number[] = []
  for (const audioFile of parsed.bgmAudios) {
    onProgress({ current: done, total: totalFiles, label: `bgm / ${audioFile.name}` })
    const probe = await probeAudio(audioFile)
    const upl = await uploadDirectToBackend('voiceover', audioFile)
    const ext = audioFile.name.slice(audioFile.name.lastIndexOf('.') + 1).toLowerCase()
    const vo = await createVoiceover({
      ossKey: upl.ossKey,
      source: 'UPLOAD',
      durationMs: probe.durationMs,
      fileSize: audioFile.size,
      format: ext,
    } as Parameters<typeof createVoiceover>[0])
    bgmIds.push(vo.id)
    done += 1
    onProgress({ current: done, total: totalFiles, label: `bgm / ${audioFile.name}` })
  }

  onProgress({ current: totalFiles, total: totalFiles, label: '写入章节…' })
  return importChapters(projectId, {
    chapters: chapterInputs,
    bgmVoiceoverIds: bgmIds,
  })
}

/** 推断顶层文件夹名（拖入或选择目录时所有文件第一段路径）。 */
function topFolderName(files: File[]): string {
  for (const f of files) {
    const path = fileRelPath(f)
    const seg = path.split('/').filter(Boolean)
    if (seg.length > 1) return seg[0]
  }
  return ''
}

/** 把拖入的 DataTransferItem 树递归展开成 File[]，并在每个 File 上挂 _path。 */
async function collectFilesFromDataTransfer(items: DataTransferItemList): Promise<File[]> {
  const out: File[] = []
  const roots: FileSystemEntry[] = []
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (it.kind !== 'file') continue
    const entry = (it as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry | null }).webkitGetAsEntry?.()
    if (entry) roots.push(entry)
  }
  async function walk(entry: FileSystemEntry, prefix: string): Promise<void> {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry
      const file = await new Promise<File>((res, rej) =>
        fileEntry.file(res, rej))
      Object.defineProperty(file, '_path', { value: `${prefix}${entry.name}`, enumerable: false })
      out.push(file)
      return
    }
    if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry
      const reader = dirEntry.createReader()
      const sub: FileSystemEntry[] = []
      while (true) {
        const batch = await new Promise<FileSystemEntry[]>((res, rej) =>
          reader.readEntries(res, rej))
        if (batch.length === 0) break
        sub.push(...batch)
      }
      for (const child of sub) {
        await walk(child, `${prefix}${entry.name}/`)
      }
    }
  }
  for (const root of roots) {
    await walk(root, '')
  }
  return out
}

function FolderImportPanel({ project, existingChapters, onImported, onError }: {
  project: CompositionProjectDTO
  existingChapters: CompositionChapterDTO[]
  onImported: (updated: CompositionProjectDTO) => void
  onError: (msg: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<ParsedRoot | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' })
  const hasExisting = existingChapters.length > 0

  function onPickDirectory() {
    inputRef.current?.click()
  }

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const result = parseFolderToChapters(files)
    if (result.chapters.length === 0) {
      onError('未在所选目录中识别到任何章节子目录（每个章节子目录需包含至少 1 个视频文件）')
      return
    }
    setParsed(result)
    e.target.value = ''
  }

  async function onConfirmUpload() {
    if (!parsed) return
    setUploading(true)
    try {
      const updated = await uploadParsedFolder(project.id, parsed, setProgress)
      onImported(updated)
      setParsed(null)
    } catch (e) {
      onError(String(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ ...card, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>📁 章节目录</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            选择一个文件夹（内含已排序的章节子目录，每章节内有视频素材+若干音频作为多配音池；根目录下 <code>bgm/</code> 子目录的音频会作为 BGM 库）。
            重新解析将<strong style={{ color: 'var(--rose-700)' }}>替换</strong>现有章节与 BGM。
          </div>
        </div>
        <button style={btnPrimary} onClick={onPickDirectory} disabled={uploading}>
          <FolderUp size={14} /> {hasExisting ? '重新解析章节目录' : '解析章节目录'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          style={{ display: 'none' }}
          onChange={onFilesSelected}
        />
      </div>

      {parsed && parsed.warnings.length > 0 && (
        <div style={{ background: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: 6, padding: 8, marginTop: 12 }}>
          {parsed.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: WARN_TEXT }}>⚠ {w}</div>
          ))}
        </div>
      )}

      {parsed && (
        <div style={{ marginTop: 12, border: '1px solid var(--border-light)', borderRadius: 6, padding: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            预览：{parsed.chapters.length} 个章节 · BGM {parsed.bgmAudios.length} 首
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflow: 'auto' }}>
            {parsed.chapters.map((ch, i) => (
              <div key={i} style={{ fontSize: 12, padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: 4 }}>
                <div style={{ fontWeight: 500 }}>{i + 1}. {ch.folderName}</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  🎬 {ch.videos.length} 个视频
                  {ch.audios.length > 0 ? <> · 🎙 {ch.audios[0].name}</> : <> · 无配音</>}
                </div>
              </div>
            ))}
            {parsed.bgmAudios.length > 0 && (
              <div style={{ fontSize: 12, padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: 4 }}>
                <div style={{ fontWeight: 500 }}>🎵 BGM 库</div>
                <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  {parsed.bgmAudios.map(f => f.name).join(', ')}
                </div>
              </div>
            )}
          </div>
          {uploading ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                上传中 {progress.current}/{progress.total} · {progress.label}
              </div>
              <div style={{ height: 6, borderRadius: 4, background: 'var(--rose-50)', overflow: 'hidden' }}>
                <div style={{
                  width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '0%',
                  height: '100%', background: 'var(--gradient-1)', transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={btnPrimary} onClick={onConfirmUpload}>
                确认上传并写入章节（{parsed.chapters.length} 章 + {parsed.bgmAudios.length} 首 BGM）
              </button>
              <button style={btn} onClick={() => setParsed(null)}>取消</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────── 渲染任务卡片 ───────────────────────────

function RenderJobCard({ job }: { job: RenderJobDTO }) {
  const [expanded, setExpanded] = useState(false)
  const [outputs, setOutputs] = useState<RenderOutputDTO[]>([])
  const [progress, setProgress] = useState({ percent: job.progressPercent ?? 0, stage: job.currentStage ?? '' })
  const [status, setStatus] = useState(job.status)

  const isLive = status === 'PENDING' || status === 'RUNNING' || status === 'ASSEMBLING' || status === 'DOWNLOADING' || status === 'ENCODING' || status === 'UPLOADING'

  useEffect(() => {
    if (!isLive) return
    const cleanup = subscribeRenderProgress(job.id,
      e => setProgress({ percent: e.percent ?? 0, stage: e.stage ?? '' }),
      e => { setStatus(e.status); setProgress({ percent: 100, stage: e.status }) }
    )
    return cleanup
  }, [isLive, job.id])

  const expand = useMemo(() => async () => {
    setExpanded(!expanded)
    if (!expanded) {
      const list = await listRenderOutputs(job.id)
      setOutputs(list)
    }
  }, [expanded, job.id])

  const statusColor = {
    SUCCESS: '#15803d', PARTIAL: '#ea580c', FAILED: '#dc2626', CANCELLED: '#6b7280',
  }[status as string] ?? 'var(--accent-primary)'

  return (
    <div style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={expand}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            Job #{job.id} · <span style={{ color: statusColor }}>{status}</span>
            {progress.stage && isLive && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>({progress.stage})</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {job.successCount ?? 0} 成功 / {job.failedCount ?? 0} 失败 / 共 {job.totalCount} 条
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isLive && (
            <button style={{ ...btn, fontSize: 11, padding: '4px 8px' }} onClick={async (e) => {
              e.stopPropagation()
              if (confirm('取消该渲染任务?')) {
                await cancelRenderJob(job.id)
                setStatus('CANCELLED')
              }
            }}>取消</button>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{expanded ? '收起' : '展开'}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, height: 6, borderRadius: 4, background: 'var(--rose-50)', overflow: 'hidden' }}>
        <div style={{
          width: `${progress.percent}%`, height: '100%',
          background: status === 'FAILED' ? 'var(--danger)' : 'var(--gradient-1)',
          transition: 'width 0.4s ease',
        }} />
      </div>
      {expanded && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {outputs.map(o => <RenderOutputRow key={o.id} output={o} />)}
          {outputs.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>暂无产出</div>}
        </div>
      )}
    </div>
  )
}

function RenderOutputRow({ output }: { output: RenderOutputDTO }) {
  const ok = output.status === 'SUCCESS'
  const isLocal = output.ossKey?.startsWith('local://')
  const localPath = isLocal && output.ossKey ? output.ossKey.slice('local://'.length) : null
  const isLua = localPath?.endsWith('.lua')
  const inlineSrc = ok && isLocal && !isLua && output.ossKey ? localFileUrl(output.ossKey) : null
  const dofileCmd = isLua && localPath ? `dofile('${localPath}')` : null
  const [copied, setCopied] = useState(false)

  async function openInNewTab() {
    try {
      if (isLocal && output.ossKey) {
        window.open(localFileUrl(output.ossKey), '_blank')
        return
      }
      const sig = await renderOutputSignedUrl(output.id)
      window.open(sig.accessUrl, '_blank')
    } catch (e) { alert(String(e)) }
  }

  async function copyCmd() {
    if (!dofileCmd) return
    try {
      await navigator.clipboard.writeText(dofileCmd)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) { alert('复制失败：' + String(e)) }
  }

  return (
    <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6, fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: 'monospace' }}>#{output.id}</span>
          <span style={{ marginLeft: 8, color: ok ? '#15803d' : 'var(--danger)' }}>{output.status}</span>
          {isLua && <span style={{ marginLeft: 8, color: TEAL, fontSize: 11 }}>📜 DaVinci 命令</span>}
          {!isLua && output.durationMs && <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>{(output.durationMs / 1000).toFixed(1)}s</span>}
          {output.errorMsg && <span style={{ marginLeft: 8, color: 'var(--danger)', fontSize: 11 }} title={output.errorMsg}>{output.errorMsg.slice(0, 40)}…</span>}
        </div>
        {ok && output.ossKey && !isLua && (
          <button style={{ ...btn, fontSize: 11, padding: '2px 8px' }} onClick={openInNewTab}>
            <Download size={10} />新页打开
          </button>
        )}
      </div>
      {inlineSrc && (
        <video
          controls
          preload="metadata"
          src={inlineSrc}
          style={{ marginTop: 8, width: '100%', maxHeight: 360, background: '#000', borderRadius: 4 }}
        />
      )}
      {dofileCmd && (
        <div style={{ marginTop: 8, padding: 10, background: '#f9fafb', border: '1px solid var(--border-light)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
            打开 DaVinci Resolve → Workspace → Console，粘贴下面的命令：
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code style={{
              flex: 1, fontFamily: 'monospace', fontSize: 11, padding: '6px 10px',
              background: 'var(--bg-card)', borderRadius: 4, overflow: 'auto',
              whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>{dofileCmd}</code>
            <button
              style={{ ...btn, fontSize: 11, padding: '4px 10px', background: copied ? '#10b981' : undefined, color: copied ? '#fff' : undefined, border: copied ? 'none' : undefined }}
              onClick={copyCmd}
            >{copied ? '✓ 已复制' : '复制'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────── 通用 ───────────────────────────

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,10,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, minWidth: 480, maxWidth: 720, boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ErrorBar({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{ ...card, borderColor: 'var(--danger)', color: 'var(--danger)', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={16} /></button>
    </div>
  )
}

// ─────────────────────────── 渲染流程弹窗 ───────────────────────────

function ModalShell({ onClose, width = 720, children }: {
  onClose: () => void
  width?: number
  children: React.ReactNode
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(61,10,26,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 12, padding: 32,
        width, maxWidth: '92vw', maxHeight: '92vh', overflow: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function RenderConfigModal({ estimated, estimatedUnbounded, cfg, onChange, onClose, onConfirm }: {
  estimated: number
  estimatedUnbounded?: boolean
  cfg: RenderTaskCfg
  onChange: (c: RenderTaskCfg) => void
  onClose: () => void
  onConfirm: () => void
}) {
  function patch(p: Partial<RenderTaskCfg>) { onChange({ ...cfg, ...p }) }
  const aspects: { v: AspectRatio; label: string }[] = [
    { v: '9:16', label: '竖屏 9:16' },
    { v: '3:4', label: '竖屏 3:4' },
    { v: '16:9', label: '横屏 16:9' },
    { v: '4:3', label: '横屏 4:3' },
    { v: '1:1', label: '方形 1:1' },
  ]
  return (
    <ModalShell onClose={onClose} width={760}>
      {/* 顶部：预估 + 两条✓ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          预估可生成 <span style={{ fontSize: 22, color: TEAL, margin: '0 4px' }}>{estimatedUnbounded ? '≥ ' : ''}{estimated}</span> 个作品
        </div>
        <div style={{ fontSize: 12, color: '#047857', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} /> 一个作品内，无重复素材
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} /> 作品之间，无相同排列
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border-light)', marginBottom: 20 }} />

      {/* 导出比例 */}
      <section style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>导出比例</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 12px' }}>
          请选择大多数视频素材的比例
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
          {aspects.map(a => (
            <label key={a.v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" name="aspect" checked={cfg.aspectRatio === a.v}
                     onChange={() => patch({ aspectRatio: a.v })}
                     style={{ accentColor: TEAL }} />
              {a.label}
            </label>
          ))}
        </div>
      </section>

      <div style={{ height: 1, background: 'var(--border-light)', marginBottom: 20 }} />

      {/* 镜像概率 */}
      <section style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>镜像概率</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>
          每个作品中的每个素材，随机水平翻转的概率。
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          如果希望锁定某个素材不发生翻转，如包含文字的素材，请在文件名中添加{' '}
          <code style={{ background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 4 }}>t=</code>
          ，例如{' '}
          <code style={{ background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 4 }}>t=IMG_0001.mp4</code>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min={0} max={100} step={1} value={cfg.mirrorProb}
                 onChange={e => patch({ mirrorProb: Number(e.target.value) })}
                 style={{ flex: 1, accentColor: TEAL }} />
          <input type="number" min={0} max={100} value={cfg.mirrorProb}
                 onChange={e => patch({ mirrorProb: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                 style={{ ...numStyle, width: 80 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
        </div>
      </section>

      <div style={{ height: 1, background: 'var(--border-light)', marginBottom: 20 }} />

      {/* 随机裁剪范围 */}
      <section style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>随机裁剪范围</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 12px' }}>
          每个作品中的每个素材，随机放大后裁剪画面边缘的范围
        </div>
        <DualRange min={100} max={200}
                   low={cfg.trimMin} high={cfg.trimMax}
                   onChange={(lo, hi) => patch({ trimMin: lo, trimMax: hi })} />
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button style={btn} onClick={onClose}>关闭</button>
        <button style={btnPrimary} onClick={onConfirm} disabled={estimated === 0}>
          导出
        </button>
      </div>
    </ModalShell>
  )
}

function DualRange({ min, max, low, high, onChange }: {
  min: number
  max: number
  low: number
  high: number
  onChange: (low: number, high: number) => void
}) {
  // 简化的双滑块：用两个 range 叠在一起 + 两个数字框
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', flex: 1, height: 32, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, background: 'var(--border-light)', borderRadius: 2 }} />
        <div style={{
          position: 'absolute', height: 4, background: TEAL, borderRadius: 2,
          left: `${((low - min) / (max - min)) * 100}%`,
          right: `${100 - ((high - min) / (max - min)) * 100}%`,
        }} />
        <input type="range" min={min} max={max} step={1} value={low}
               onChange={e => {
                 const v = Math.min(Number(e.target.value), high - 1)
                 onChange(v, high)
               }}
               style={{ position: 'absolute', width: '100%', accentColor: TEAL, background: 'transparent', pointerEvents: 'auto' }} />
        <input type="range" min={min} max={max} step={1} value={high}
               onChange={e => {
                 const v = Math.max(Number(e.target.value), low + 1)
                 onChange(low, v)
               }}
               style={{ position: 'absolute', width: '100%', accentColor: TEAL, background: 'transparent', pointerEvents: 'auto' }} />
      </div>
      <input type="number" min={min} max={max - 1} value={low}
             onChange={e => onChange(Math.min(Math.max(min, Number(e.target.value) || min), high - 1), high)}
             style={{ ...numStyle, width: 80 }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
      <span style={{ color: 'var(--text-muted)' }}>-</span>
      <input type="number" min={min + 1} max={max} value={high}
             onChange={e => onChange(low, Math.max(Math.min(max, Number(e.target.value) || max), low + 1))}
             style={{ ...numStyle, width: 80 }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
    </div>
  )
}

function RenderTasksModal({ plans, loading, selected, onChangeSelected, onClose, onConfirm }: {
  plans: CompositionPlanPreviewDTO['plans']
  loading: boolean
  selected: Set<string>
  onChangeSelected: (s: Set<string>) => void
  onClose: () => void
  onConfirm: () => void
}) {
  const total = plans.length
  const allSelected = total > 0 && selected.size === total
  function toggleAll() {
    if (allSelected) onChangeSelected(new Set())
    else onChangeSelected(new Set(plans.map(p => p.planHash)))
  }
  function toggleOne(hash: string) {
    const s = new Set(selected)
    if (s.has(hash)) s.delete(hash); else s.add(hash)
    onChangeSelected(s)
  }
  return (
    <ModalShell onClose={onClose} width={920}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>选片导出</div>
        <button style={btn} onClick={toggleAll} disabled={loading || total === 0}>
          {allSelected ? '取消全选' : '批量选择'}
        </button>
      </div>

      <div style={{ marginTop: 16, maxHeight: 480, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 50, textAlign: 'left', padding: 12, fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}></th>
              <th style={{ width: 60, textAlign: 'left', padding: 12, fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}>序号</th>
              <th style={{ width: 90, textAlign: 'left', padding: 12, fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}>时长</th>
              <th style={{ textAlign: 'left', padding: 12, fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}>组合摘要</th>
              <th style={{ width: 100, textAlign: 'left', padding: 12, fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}>是否已导出</th>
              <th style={{ width: 100, textAlign: 'left', padding: 12, fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'var(--bg-card)' }}>导出时间</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <Loader2 size={14} className="spin" /> 正在生成组合方案…
              </td></tr>
            )}
            {!loading && plans.map((p, i) => {
              const checked = selected.has(p.planHash)
              const summary = (p.chapters ?? []).map(c => c.chapterName ?? `章节 ${c.chapterId}`).join(' → ')
              const dur = ((p.estimatedDurationMs ?? 0) / 1000).toFixed(1)
              return (
                <tr key={p.planHash}>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border-light)' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOne(p.planHash)}
                           style={{ accentColor: TEAL, width: 16, height: 16 }} />
                  </td>
                  <td style={{ padding: 12, fontSize: 13, borderBottom: '1px solid var(--border-light)' }}>{i + 1}</td>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>{dur}s</td>
                  <td style={{ padding: 12, fontSize: 12, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 360 }}
                      title={summary}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {p.planHash.slice(0, 16)}…
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>否</td>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-light)' }}>未导出</td>
                </tr>
              )
            })}
            {!loading && plans.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>未生成可用组合，请检查素材池</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          共 {total} 个组合，已选 {selected.size}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn} onClick={onClose}>关闭</button>
          <button style={btnPrimary} onClick={onConfirm} disabled={selected.size === 0 || loading}>
            选择导出（{selected.size}）
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

function RenderFormatModal({ cfg, onChange, onClose, onConfirm }: {
  cfg: RenderFormatCfg
  onChange: (c: RenderFormatCfg) => void
  onClose: () => void
  onConfirm: () => void
}) {
  function patch(p: Partial<RenderFormatCfg>) { onChange({ ...cfg, ...p }) }
  const isLegacy = cfg.exportType === 'LEGACY'
  return (
    <ModalShell onClose={onClose} width={920}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* 左：导出格式 */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>导出格式</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FormatRadio name="exportType" value="DIRECT" current={cfg.exportType}
                         onChange={v => patch({ exportType: v })}
                         title="直接导出视频" desc="生成 DaVinci Resolve 命令，自动装配时间线并加入渲染队列。" />
            <FormatRadio name="exportType" value="PREVIEW_EDIT" current={cfg.exportType}
                         onChange={v => patch({ exportType: v })}
                         title="预览、编辑并导出" desc="生成 DaVinci Resolve 命令，仅装配时间线供手工调整，调整满意后再导出。" />
            <FormatRadio name="exportType" value="LEGACY" current={cfg.exportType}
                         onChange={v => patch({ exportType: v })}
                         title="导出视频（旧版）" desc="效果不佳，建议使用「直接导出视频」。将于 2026 年 4 月 1 日下线。" />
          </div>
        </div>

        {/* 右：参数 */}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>参数</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>分辨率</span>
              <select style={inputStyle} value={cfg.resolution}
                      onChange={e => patch({ resolution: e.target.value as Resolution })}>
                <option value="720P">720P</option>
                <option value="1080P">1080P</option>
                <option value="4K">4K</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>帧率</span>
              <select style={inputStyle} value={cfg.fps}
                      onChange={e => patch({ fps: Number(e.target.value) })}>
                <option value={24}>24</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>格式</div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name="container" checked={cfg.container === 'MP4'}
                         onChange={() => patch({ container: 'MP4' })}
                         style={{ accentColor: TEAL }} />
                  MP4
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="radio" name="container" checked={cfg.container === 'MOV'}
                         onChange={() => patch({ container: 'MOV' })}
                         style={{ accentColor: TEAL }} />
                  MOV
                </label>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>编码</div>
              <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" name="codec" checked={cfg.codec === 'H264'}
                           onChange={() => patch({ codec: 'H264' })}
                           style={{ accentColor: TEAL }} />
                    H.264
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 22 }}>通用编码</span>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" name="codec" checked={cfg.codec === 'HEVC'}
                           onChange={() => patch({ codec: 'HEVC' })}
                           style={{ accentColor: TEAL }} />
                    HEVC
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 22 }}>高效编码，节省空间</span>
                </label>
              </div>
            </div>

            {!isLegacy && (
              <div style={{ background: TEAL_BG, border: `1px solid ${TEAL}`, borderRadius: 8, padding: 12, fontSize: 12, color: '#065f46', lineHeight: 1.6 }}>
                <div>请确保已安装 DaVinci Resolve（19+）</div>
                <div>导出后在 Resolve 的 Workspace → Console 粘贴 dofile(...) 命令执行</div>
                <div style={{ marginTop: 6 }}>
                  <a href="https://www.blackmagicdesign.com/products/davinciresolve" target="_blank" rel="noreferrer"
                     style={{ color: TEAL, textDecoration: 'underline' }}>DaVinci Resolve 官方下载</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
        <button style={btn} onClick={onClose}>关闭</button>
        <button style={btnPrimary} onClick={onConfirm}>开始导出</button>
      </div>
    </ModalShell>
  )
}

function FormatRadio({ name, value, current, onChange, title, desc }: {
  name: string
  value: ExportType
  current: ExportType
  onChange: (v: ExportType) => void
  title: string
  desc: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
      <input type="radio" name={name} checked={current === value}
             onChange={() => onChange(value)}
             style={{ accentColor: TEAL, marginTop: 4 }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </label>
  )
}

