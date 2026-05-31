// 视频合成工作流 API 客户端
// 契约来自后端 MaterialFeign / MaterialTagFeign / VoiceoverFeign

import { apiFetch, apiUrl, apiEventSource } from '../lib/apiClient'

// ── 类型 ──

export type MaterialKind = 'VIDEO' | 'IMAGE'
export type MaterialSourceType = 'MANUAL_UPLOAD' | 'DECONSTRUCTION_AGENT'
export type VoiceoverSource = 'UPLOAD' | 'TTS_DOUBAO'

// 素材镜头类型（一对一分类）。与后端 MaterialCategory 枚举对齐
export type MaterialCategory =
  | 'HOOK'
  | 'EFFICACY'
  | 'MAKEUP_DEMO'
  | 'MAKEUP_DEMO_NEGATIVE'
  | 'PRODUCT_REVEAL'
  | 'LIVE_VOICEOVER'
  | 'CELEBRITY_TESTIMONIAL'
  | 'KOL_TESTIMONIAL'
  | 'STREET_INTERVIEW'

export const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string }[] = [
  { value: 'HOOK', label: '钩子' },
  { value: 'EFFICACY', label: '功效可视化' },
  { value: 'MAKEUP_DEMO', label: '妆效展示-正例' },
  { value: 'MAKEUP_DEMO_NEGATIVE', label: '妆效展示-反例' },
  { value: 'PRODUCT_REVEAL', label: '产品亮相' },
  { value: 'LIVE_VOICEOVER', label: '实测口播' },
  { value: 'CELEBRITY_TESTIMONIAL', label: '明星证言' },
  { value: 'KOL_TESTIMONIAL', label: '达人证言' },
  { value: 'STREET_INTERVIEW', label: '口碑街访' },
]

export const UNCATEGORIZED_KEY = '__UNCATEGORIZED__'

export function categoryLabel(value: string | undefined | null): string {
  if (!value) return '未分类'
  if (value === UNCATEGORIZED_KEY) return '未分类'
  return MATERIAL_CATEGORIES.find(c => c.value === value)?.label ?? value
}

export interface MaterialTagDTO {
  id: number
  name: string
  category: string
  color?: string
  description?: string
}

export interface MaterialClipDTO {
  id: number
  ossKey: string
  kind: MaterialKind
  originalName: string
  durationMs?: number
  width?: number
  height?: number
  fps?: number
  bitrate?: number
  fileSize?: number
  sha256?: string
  sourceType?: MaterialSourceType
  sourceExtra?: string
  category?: MaterialCategory
  tags?: MaterialTagDTO[]
  accessUrl?: string
  createAt?: string
  updateAt?: string
}

export interface VoiceoverAssetDTO {
  id: number
  ossKey: string
  source: VoiceoverSource
  textContent?: string
  voiceCode?: string
  speed?: number
  durationMs?: number
  fileSize?: number
  format?: string
  category?: MaterialCategory
  accessUrl?: string
  createAt?: string
  updateAt?: string
}

export interface UploadSignatureDTO {
  ossKey: string
  uploadUrl: string
  accessUrl: string
  expiresInSeconds: number
}

export interface PageInfo<T> {
  total: number
  pageSize: number
  pageIndex: number
  records: T[]
}

interface Result<T> {
  success: boolean
  data: T
  errorCode?: number
  errorMessage?: string
}

async function unwrap<T>(r: Response): Promise<T> {
  if (!r.ok) {
    throw new Error(`HTTP ${r.status} ${r.statusText}`)
  }
  const j = (await r.json()) as Result<T>
  if (j.success === false) {
    throw new Error(j.errorMessage ?? 'request failed')
  }
  return j.data
}

function qs(obj: Record<string, unknown>): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v == null || v === '') continue
    if (Array.isArray(v)) {
      v.forEach(x => parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(x))}`))
    } else {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    }
  }
  return parts.length ? '?' + parts.join('&') : ''
}

// ── 素材分类文件夹（动态分类） ──

export interface MaterialFolderDTO {
  id: number
  code: string
  name: string
  sortNo: number
  color?: string
  description?: string
}

export async function listFolders(): Promise<MaterialFolderDTO[]> {
  const r = await apiFetch(`/api/material-folders`)
  return unwrap<MaterialFolderDTO[]>(r)
}

export async function createFolder(input: {
  code?: string
  name: string
  sortNo?: number
  color?: string
  description?: string
}): Promise<MaterialFolderDTO> {
  const r = await apiFetch(`/api/material-folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return unwrap<MaterialFolderDTO>(r)
}

export async function updateFolder(id: number, input: {
  name: string
  sortNo?: number
  color?: string
  description?: string
}): Promise<MaterialFolderDTO> {
  const r = await apiFetch(`/api/material-folders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return unwrap<MaterialFolderDTO>(r)
}

export async function deleteFolder(id: number): Promise<void> {
  const r = await apiFetch(`/api/material-folders/${id}`, { method: 'DELETE' })
  await unwrap<void>(r)
}

// ── 标签 ──

export async function listTags(category?: string): Promise<MaterialTagDTO[]> {
  const r = await apiFetch(`/api/material-tags${qs({ category })}`)
  return unwrap<MaterialTagDTO[]>(r)
}

export async function createTag(input: { name: string; category: string; color?: string; description?: string }): Promise<MaterialTagDTO> {
  const r = await apiFetch(`/api/material-tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return unwrap<MaterialTagDTO>(r)
}

export async function deleteTag(id: number): Promise<void> {
  const r = await apiFetch(`/api/material-tags/${id}`, { method: 'DELETE' })
  await unwrap<void>(r)
}

// ── 素材 ──

export interface MaterialPageQuery {
  pageIndex?: number
  pageSize?: number
  kind?: MaterialKind
  name?: string
  tagIds?: number[]
  sourceType?: MaterialSourceType
  /** 分类筛选；传 UNCATEGORIZED_KEY 表示只看未分类 */
  category?: MaterialCategory | typeof UNCATEGORIZED_KEY
}

export async function pageMaterials(q: MaterialPageQuery): Promise<PageInfo<MaterialClipDTO>> {
  const r = await apiFetch(`/api/materials${qs(q as Record<string, unknown>)}`)
  return unwrap<PageInfo<MaterialClipDTO>>(r)
}

export async function getMaterial(id: number): Promise<MaterialClipDTO> {
  const r = await apiFetch(`/api/materials/${id}`)
  return unwrap<MaterialClipDTO>(r)
}

export interface CreateMaterialInput {
  ossKey: string
  kind: MaterialKind
  originalName: string
  /** 镜头类型，必填 */
  category: MaterialCategory
  durationMs?: number
  width?: number
  height?: number
  fps?: number
  bitrate?: number
  fileSize?: number
  sha256?: string
  sourceType?: MaterialSourceType
  sourceExtra?: string
  tagIds?: number[]
}

export async function createMaterial(input: CreateMaterialInput): Promise<MaterialClipDTO> {
  const r = await apiFetch(`/api/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return unwrap<MaterialClipDTO>(r)
}

export async function updateMaterialTags(id: number, tagIds: number[]): Promise<MaterialClipDTO> {
  const r = await apiFetch(`/api/materials/${id}/tags`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tagIds }),
  })
  return unwrap<MaterialClipDTO>(r)
}

export async function deleteMaterial(id: number): Promise<void> {
  const r = await apiFetch(`/api/materials/${id}`, { method: 'DELETE' })
  await unwrap<void>(r)
}

// ── 配音 ──

export interface VoiceoverPageQuery {
  pageIndex?: number
  pageSize?: number
  source?: VoiceoverSource
  text?: string
  /** 分类筛选；传 UNCATEGORIZED_KEY 表示只看未分类 */
  category?: MaterialCategory | typeof UNCATEGORIZED_KEY
}

export async function pageVoiceovers(q: VoiceoverPageQuery): Promise<PageInfo<VoiceoverAssetDTO>> {
  const r = await apiFetch(`/api/voiceovers${qs(q as Record<string, unknown>)}`)
  return unwrap<PageInfo<VoiceoverAssetDTO>>(r)
}

export interface CreateVoiceoverInput {
  ossKey: string
  /** 镜头类型，必填 */
  category: MaterialCategory
  source?: VoiceoverSource
  textContent?: string
  voiceCode?: string
  speed?: number
  durationMs?: number
  fileSize?: number
  format?: string
}

export async function createVoiceover(input: CreateVoiceoverInput): Promise<VoiceoverAssetDTO> {
  const r = await apiFetch(`/api/voiceovers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return unwrap<VoiceoverAssetDTO>(r)
}

export async function deleteVoiceover(id: number): Promise<void> {
  const r = await apiFetch(`/api/voiceovers/${id}`, { method: 'DELETE' })
  await unwrap<void>(r)
}

// ── OSS 直传 ──

export type UploadBizType = 'material' | 'voiceover' | 'output' | 'source'

export async function generateUploadSignature(input: {
  bizType: UploadBizType
  filename: string
  sha256?: string
  contentType?: string
}): Promise<UploadSignatureDTO> {
  const r = await apiFetch(`/api/materials/upload-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return unwrap<UploadSignatureDTO>(r)
}

export async function putToOss(uploadUrl: string, file: File, contentType?: string): Promise<void> {
  const headers: Record<string, string> = {}
  if (contentType) headers['Content-Type'] = contentType
  const r = await fetch(uploadUrl, { method: 'PUT', headers, body: file })
  if (!r.ok) {
    throw new Error(`OSS PUT ${r.status} ${r.statusText}`)
  }
}

// ── OSS 未配置时的本地直传（POST multipart 到后端，落本地磁盘） ──
//   ossKey 形如 local:///tmp/composition/material/202604/<sha256>.mp4
//   sha256 由后端在落盘时计算（material），voiceover 用 uuid

export interface LocalUploadResult {
  ossKey: string
  originalName: string
  fileSize: number
  sha256?: string
}

export async function uploadDirectToBackend(
  bizType: 'material' | 'voiceover' | 'source',
  file: File,
): Promise<LocalUploadResult> {
  const fd = new FormData()
  fd.append('bizType', bizType)
  fd.append('file', file)
  const r = await apiFetch(`/api/composition/local-files`, { method: 'POST', body: fd })
  return unwrap<LocalUploadResult>(r)
}

/** 把 local://绝对路径 转成可在浏览器 GET 的 URL（用于播放/下载成片或本地素材） */
export function localFileUrl(ossKey: string): string {
  return apiUrl(`/api/composition/local-files?key=${encodeURIComponent(ossKey)}`)
}

// ── 服务器端目录浏览（渲染弹窗"修改"按钮用） ──

export interface DirEntry {
  name: string
  path: string
}

export interface DirListing {
  path: string
  parent?: string
  exists: boolean
  writable: boolean
  dirs: DirEntry[]
}

export async function listDir(path?: string): Promise<DirListing> {
  const r = await apiFetch(`/api/composition/dir/list${qs({ path })}`)
  return unwrap<DirListing>(r)
}

export async function mkdir(parent: string, name: string): Promise<DirEntry> {
  const r = await apiFetch(`/api/composition/dir/mkdir?path=${encodeURIComponent(parent)}&name=${encodeURIComponent(name)}`, {
    method: 'POST',
  })
  return unwrap<DirEntry>(r)
}

/** 计算文件 sha256（前端） */
export async function sha256OfFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/** 探测视频时长/分辨率/fps（基于浏览器原生 video 标签） */
export async function probeVideo(file: File): Promise<{ durationMs?: number; width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.src = url
    v.onloadedmetadata = () => {
      const result = {
        durationMs: Math.round(v.duration * 1000),
        width: v.videoWidth,
        height: v.videoHeight,
      }
      URL.revokeObjectURL(url)
      resolve(result)
    }
    v.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({})
    }
  })
}

/** 探测音频时长（基于浏览器原生 audio 标签） */
export async function probeAudio(file: File): Promise<{ durationMs?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('audio')
    a.preload = 'metadata'
    a.src = url
    a.onloadedmetadata = () => {
      const result = { durationMs: Math.round(a.duration * 1000) }
      URL.revokeObjectURL(url)
      resolve(result)
    }
    a.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({})
    }
  })
}

// ─────────────────────────── 项目 / 章节 / 渲染 ───────────────────────────

export type CompositionMode = 'SUN_WUKONG' | 'ZHU_GE_LIANG'
export type ChapterSource = 'CATEGORY' | 'FOLDER'
export type CombinationStrategy = 'ROOKIE' | 'MATRIX'
export type ProjectStatus = 'DRAFT' | 'READY' | 'ARCHIVED'
export type ChapterAudioMode =
  | 'ONE_VO_MULTI_CLIP'
  | 'FILL_CLIPS_FOR_VO'
  | 'LOOP_CLIP_FOR_VO'
  | 'NO_VO_FIXED_COUNT'
  | 'NO_VO_MIN_DURATION'
export type OverflowTrim = 'TRIM_HEAD' | 'TRIM_TAIL' | 'TRIM_BOTH'
export type RenderStatus =
  | 'PENDING' | 'ASSEMBLING' | 'DOWNLOADING' | 'ENCODING'
  | 'UPLOADING' | 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'CANCELLED' | 'RUNNING'

export interface CompositionChapterDTO {
  id?: number
  projectId?: number
  sortNo?: number
  name?: string
  category?: MaterialCategory
  audioMode: ChapterAudioMode
  voiceoverId?: number
  /** 章节多配音池（每条作品按 plan hash 随机抽一个） */
  voiceoverIds?: number[]
  fixedClipCount?: number
  minDurationMs?: number
  allowVoiceoverReuse?: boolean
  stripOriginalAudio?: boolean
  overflowTrim?: OverflowTrim
  /** 模式 2 长度处理：CROP 剪切 / SPEED 变速 */
  lengthAdjustMode?: 'CROP' | 'SPEED'
  /** 配音重复率：ONCE / REUSE */
  audioReuseMode?: 'ONCE' | 'REUSE'
  /** 模式 3 循环策略 */
  loopStrategy?: 'FILL_THEN_CROP' | 'FIXED_ROUNDS_THEN_SPEED'
  /** 模式 3 循环轮次 */
  loopRounds?: number
  repeatRate?: number
  tagFilterIds?: number[]
  tagFilter?: MaterialTagDTO[]
  /** FOLDER 模式：直接绑定的素材 clipId 列表（按文件名顺序） */
  materialClipIds?: number[]
  /** FOLDER 模式：来源子目录名 */
  sourceFolderName?: string
  /** 是否在素材之间加转场（前端开关） */
  transitionEnabled?: boolean
}

export type BgmLoopMode = 'LOOP' | 'PICK_AGAIN'

export interface CompositionProjectDTO {
  id: number
  name: string
  description?: string
  mode: CompositionMode
  /** CATEGORY=按 9 枚举自动建章节；FOLDER=用户上传文件夹解析 */
  chapterSource?: ChapterSource
  combinationStrategy?: CombinationStrategy
  targetCount?: number
  globalBgmVoiceoverId?: number
  /** BGM 库：voiceover_asset.id 列表 */
  bgmVoiceoverIds?: number[]
  /** LOOP=BGM 循环；PICK_AGAIN=再随机抽一首 */
  bgmLoopMode?: BgmLoopMode
  /** BGM 音量 0-100 */
  bgmVolume?: number
  /** 从第几章开始应用 BGM（1-based） */
  bgmStartChapter?: number
  outputWidth?: number
  outputHeight?: number
  outputFps?: number
  status: ProjectStatus
  chapters?: CompositionChapterDTO[]
  createAt?: string
  updateAt?: string
}

export interface RenderJobDTO {
  id: number
  projectId: number
  totalCount?: number
  successCount?: number
  failedCount?: number
  status: RenderStatus
  progressPercent?: number
  currentStage?: string
  errorMsg?: string
  startedAt?: string
  finishedAt?: string
  createAt?: string
}

export interface RenderOutputDTO {
  id: number
  jobId: number
  projectId: number
  planHash: string
  ossKey?: string
  accessUrl?: string
  durationMs?: number
  width?: number
  height?: number
  fileSize?: number
  status: RenderStatus
  errorMsg?: string
  startedAt?: string
  finishedAt?: string
}

export interface CompositionPlanPreviewDTO {
  requestedCount: number
  generatedCount: number
  plans: Array<{
    planHash: string
    estimatedDurationMs?: number
    chapters: Array<{
      chapterId: number
      chapterName?: string
      audioMode: string
      voiceoverId?: number
      picks: Array<{
        clipId: number
        originalName?: string
        startMs?: number
        endMs?: number
        takenDurationMs?: number
        trimmed?: boolean
      }>
    }>
  }>
}

// ── Project APIs ──

export async function pageProjects(q: { pageIndex?: number; pageSize?: number; mode?: CompositionMode; status?: ProjectStatus; name?: string; chapterSource?: ChapterSource }): Promise<PageInfo<CompositionProjectDTO>> {
  const r = await apiFetch(`/api/composition-projects${qs(q as Record<string, unknown>)}`)
  return unwrap<PageInfo<CompositionProjectDTO>>(r)
}

export async function getProject(id: number): Promise<CompositionProjectDTO> {
  const r = await apiFetch(`/api/composition-projects/${id}`)
  return unwrap<CompositionProjectDTO>(r)
}

export async function createProject(input: { name: string; mode: CompositionMode; chapterSource?: ChapterSource; description?: string; combinationStrategy?: CombinationStrategy; targetCount?: number; outputWidth?: number; outputHeight?: number; outputFps?: number }): Promise<CompositionProjectDTO> {
  const r = await apiFetch(`/api/composition-projects`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  })
  return unwrap<CompositionProjectDTO>(r)
}

export async function updateProject(id: number, input: Partial<CompositionProjectDTO>): Promise<CompositionProjectDTO> {
  const r = await apiFetch(`/api/composition-projects/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  })
  return unwrap<CompositionProjectDTO>(r)
}

export async function deleteProject(id: number): Promise<void> {
  const r = await apiFetch(`/api/composition-projects/${id}`, { method: 'DELETE' })
  await unwrap<void>(r)
}

export async function saveChapters(projectId: number, chapters: CompositionChapterDTO[]): Promise<CompositionProjectDTO> {
  const r = await apiFetch(`/api/composition-projects/${projectId}/chapters`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chapters }),
  })
  return unwrap<CompositionProjectDTO>(r)
}

// ── FOLDER 模式：解析章节目录后写入章节 ──

export interface ImportChapterInput {
  sortNo: number
  name?: string
  sourceFolderName: string
  materialClipIds: number[]
  /** 章节主配音；voiceoverIds 非空时取第一个；用于兼容显示 */
  voiceoverId?: number
  /** 章节多配音池：解析章节文件夹时所有 mp3 都进来 */
  voiceoverIds?: number[]
  fixedClipCount?: number
}

export interface ImportChaptersPayload {
  chapters: ImportChapterInput[]
  bgmVoiceoverIds?: number[]
  bgmLoopMode?: BgmLoopMode
  bgmVolume?: number
  bgmStartChapter?: number
}

export async function importChapters(projectId: number, payload: ImportChaptersPayload): Promise<CompositionProjectDTO> {
  const r = await apiFetch(`/api/composition-projects/${projectId}/import-chapters`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return unwrap<CompositionProjectDTO>(r)
}

export async function previewProject(id: number, count?: number): Promise<CompositionPlanPreviewDTO> {
  const r = await apiFetch(`/api/composition-projects/${id}/preview${qs({ count })}`)
  return unwrap<CompositionPlanPreviewDTO>(r)
}

export interface RenderConfigPayload {
  /** 9:16 / 3:4 / 16:9 / 4:3 / 1:1 */
  aspectRatio?: string
  /** 720P / 1080P / 4K */
  resolution?: string
  fps?: number
  container?: 'MP4' | 'MOV'
  codec?: 'H264' | 'HEVC'
  /** 0-100 */
  mirrorProb?: number
  /** 100-200 */
  trimMin?: number
  trimMax?: number
  /** DIRECT / PREVIEW_EDIT / LEGACY */
  exportType?: 'DIRECT' | 'PREVIEW_EDIT' | 'LEGACY'
  exportPath?: string
}

export async function submitRender(
  projectId: number,
  count?: number,
  renderConfig?: RenderConfigPayload,
  selectedPlanHashes?: string[],
): Promise<RenderJobDTO> {
  const r = await apiFetch(`/api/composition-projects/${projectId}/render`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, renderConfig, selectedPlanHashes }),
  })
  return unwrap<RenderJobDTO>(r)
}

// ── Render Job APIs ──

export async function pageRenderJobs(q: { projectId?: number; status?: RenderStatus; pageIndex?: number; pageSize?: number }): Promise<PageInfo<RenderJobDTO>> {
  const r = await apiFetch(`/api/render-jobs${qs(q as Record<string, unknown>)}`)
  return unwrap<PageInfo<RenderJobDTO>>(r)
}

export async function getRenderJob(id: number): Promise<RenderJobDTO> {
  const r = await apiFetch(`/api/render-jobs/${id}`)
  return unwrap<RenderJobDTO>(r)
}

export async function listRenderOutputs(jobId: number): Promise<RenderOutputDTO[]> {
  const r = await apiFetch(`/api/render-jobs/${jobId}/outputs`)
  return unwrap<RenderOutputDTO[]>(r)
}

export async function cancelRenderJob(id: number): Promise<void> {
  const r = await apiFetch(`/api/render-jobs/${id}/cancel`, { method: 'POST' })
  await unwrap<void>(r)
}

export async function renderOutputSignedUrl(id: number): Promise<UploadSignatureDTO> {
  const r = await apiFetch(`/api/render-outputs/${id}/signed-url`)
  return unwrap<UploadSignatureDTO>(r)
}

// ── SSE 进度 ──

export interface RenderProgressEvent {
  jobId: number
  outputId?: number
  stage?: string
  percent?: number
}

export interface RenderCompleteEvent {
  jobId: number
  status: RenderStatus
  success: number
  failed: number
  total: number
}

export function subscribeRenderProgress(
  jobId: number,
  onProgress: (e: RenderProgressEvent) => void,
  onComplete?: (e: RenderCompleteEvent) => void,
): () => void {
  const es = apiEventSource(`/api/render-jobs/${jobId}/stream`)
  es.addEventListener('render.progress', (ev) => {
    try { onProgress(JSON.parse((ev as MessageEvent).data) as RenderProgressEvent) } catch { /* swallow */ }
  })
  es.addEventListener('render.complete', (ev) => {
    try { onComplete?.(JSON.parse((ev as MessageEvent).data) as RenderCompleteEvent) } catch { /* swallow */ }
    es.close()
  })
  return () => es.close()
}

// ─────────────────────────── 视频拆解 ───────────────────────────

export interface SegmentDTO {
  startMs: number
  endMs: number
  /** material_folder.code（动态分类） */
  category?: string
  name?: string
  memo?: string
  materialClipId?: number
}

export interface SourceVideoDTO {
  id: number
  ossKey: string
  originalName: string
  durationMs?: number
  fileSize?: number
  width?: number
  height?: number
  segments: SegmentDTO[]
  status: 'DRAFT' | 'EXPORTED'
  createAt?: string
  updateAt?: string
}

export async function pageSourceVideos(q: { pageIndex?: number; pageSize?: number; status?: 'DRAFT' | 'EXPORTED'; name?: string } = {}): Promise<PageInfo<SourceVideoDTO>> {
  const r = await apiFetch(`/api/source-videos${qs(q as Record<string, unknown>)}`)
  return unwrap<PageInfo<SourceVideoDTO>>(r)
}

export async function getSourceVideo(id: number): Promise<SourceVideoDTO> {
  const r = await apiFetch(`/api/source-videos/${id}`)
  return unwrap<SourceVideoDTO>(r)
}

export async function createSourceVideo(input: {
  ossKey: string
  originalName: string
  durationMs?: number
  fileSize?: number
  width?: number
  height?: number
}): Promise<SourceVideoDTO> {
  const r = await apiFetch(`/api/source-videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return unwrap<SourceVideoDTO>(r)
}

/** 通过 URL 导入：后端流式下载视频到本地 → 入库 */
export async function importSourceVideoFromUrl(url: string, originalName?: string): Promise<SourceVideoDTO> {
  const r = await apiFetch(`/api/source-videos/import-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, originalName }),
  })
  return unwrap<SourceVideoDTO>(r)
}

export async function updateSourceVideoSegments(id: number, segments: SegmentDTO[]): Promise<SourceVideoDTO> {
  const r = await apiFetch(`/api/source-videos/${id}/segments`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments }),
  })
  return unwrap<SourceVideoDTO>(r)
}

/** 切片导出：按 segments ffmpeg 切出 mp4 → 入素材库 */
export async function exportSourceVideoSplit(id: number): Promise<SourceVideoDTO> {
  const r = await apiFetch(`/api/source-videos/${id}/split`, { method: 'POST' })
  return unwrap<SourceVideoDTO>(r)
}

/** 自动拆解：抽音轨 → 百炼 ASR → LLM 归类 → 写入 segments（DRAFT） */
export async function autoSplitSourceVideo(id: number): Promise<SourceVideoDTO> {
  const r = await apiFetch(`/api/source-videos/${id}/auto-split`, { method: 'POST' })
  return unwrap<SourceVideoDTO>(r)
}

export async function deleteSourceVideo(id: number): Promise<void> {
  const r = await apiFetch(`/api/source-videos/${id}`, { method: 'DELETE' })
  await unwrap<void>(r)
}
