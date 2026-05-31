/**
 * 视频矩阵 (Cutmatrix) API 客户端
 * 与现有 agentApi 完全隔离，调用 /cm/* 命名空间
 *
 * P0 阶段：段落对齐编排器先实现，其它 stub 留空待后端接入
 */
import { apiFetch } from '../apiClient'

interface CmEnvelope<T> {
  success?: boolean
  code?: number
  msg?: string
  message?: string
  data?: T
}

async function cmGet<T>(path: string): Promise<T> {
  const r = await apiFetch(path, { method: 'GET' })
  if (!r.ok) throw new Error(`请求失败: ${r.status}`)
  const j = (await r.json()) as CmEnvelope<T>
  const ok = j.success === undefined ? (j.code === undefined || j.code === 0 || j.code === 200) : j.success
  if (!ok) throw new Error(j.msg ?? j.message ?? '请求失败')
  return j.data as T
}

async function cmPost<T>(path: string, body: unknown): Promise<T> {
  const r = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`请求失败: ${r.status}`)
  const j = (await r.json()) as CmEnvelope<T>
  const ok = j.success === undefined
    ? (j.code === undefined || j.code === 0 || j.code === 200)
    : j.success
  if (!ok) throw new Error(j.msg ?? j.message ?? '请求失败')
  return j.data as T
}

// ─── 段落对齐 ─────────────────────────────────────────────────
export interface CmParagraphSection {
  sectionNo: number
  stageCode: string       // HOOK / SCENE / BENEFIT / PROOF_CTA
  stageName: string
  narrationDurationSec: number
  requiredTags: string[]
}

export interface CmParagraphAlignCmd {
  skuId: string
  narrationUrl?: string
  sections: CmParagraphSection[]
  candidatePoolSize?: number
}

export interface CmComposeClip {
  sectionNo: number
  stageCode: string
  segmentId: string | number
  videoId: string
  startSec: number
  endSec: number
}

export interface CmComposeResult {
  taskCode: string
  status: string
  clips: CmComposeClip[]
  resultVideoUrl?: string
  totalDurationSec: number
}

export const cmApi = {
  /** P0: 段落对齐编排（含 mock fallback） */
  alignParagraphs: (cmd: CmParagraphAlignCmd): Promise<CmComposeResult> =>
    cmPost<BackendAlignResult>('/cm/compose/paragraphAlign', mapAlignCmdToBackend(cmd))
      .then(mapAlignResultFromBackend)
      .catch(err => {
        // 后端未上线时的 mock：返回伪计划，方便前端先跑通
        console.warn('[cmApi] paragraphAlign fallback to mock:', err)
        return mockParagraphAlignResult(cmd)
      }),

  /** Tab 切换 / 收藏占位 — 暂为本地 localStorage */
  toggleFavorite: (key: string): boolean => {
    const set = new Set(loadFavorites())
    if (set.has(key)) set.delete(key); else set.add(key)
    localStorage.setItem('cm_favorites', JSON.stringify([...set]))
    return set.has(key)
  },
}

/**
 * 后端真实 API 直连层（与 cmStore localStorage 共存，逐步替换）.
 * 后端契约：/cm/* 命名空间 + collectionCode/chapterCode/segmentCode 业务键.
 */
export interface CmRemoteCollection {
  id: number; collectionCode: string; name: string; skuId?: string; mode: string;
  createAt?: string; createName?: string;
}
export interface CmRemoteChapter {
  id: number; chapterCode: string; collectionCode: string; name: string;
  stageCode: string; orderNo: number; segmentCount?: number;
}
export interface CmRemoteSegment {
  id: number; segmentCode: string; collectionCode: string; chapterCode: string;
  videoUrl: string; startSec: number; endSec: number; durationSec: number;
  noMirror?: number; orderNo?: number; stageCode?: string;
  sceneTags?: string; sellingPointTags?: string; hookType?: string; caption?: string;
  sourceType?: string; sourceSegmentId?: string; sourceVideoId?: string;
}

export interface CmComposeBackendResult {
  taskCode: string;
  collectionCode: string;
  mode: string;
  status: string;
  totalDurationSec: number;
  resultVideoUrl?: string;
  errorMsg?: string;
  clips: Array<{
    sectionNo: number; stageCode: string; segmentCode: string;
    videoUrl: string; startSec: number; endSec: number; durationSec: number;
  }>;
}

export const cmRemote = {
  createCollection: (name: string, mode: string, skuId?: string) =>
    cmPost<CmRemoteCollection>(
      '/cm/collection/create', { name, mode: mapModeToBackend(mode), skuId }),

  listCollections: (skuId?: string, mode?: string) =>
    cmPost<CmRemoteCollection[]>(
      '/cm/collection/list', { skuId, mode: mode ? mapModeToBackend(mode) : undefined }),

  deleteCollection: (collectionCode: string) =>
    cmPostQuery<boolean>('/cm/collection/delete', { collectionCode }),

  importFromDeconstruction: (collectionCode: string, deconstructionIds: string[]) =>
    cmPost<number>('/cm/segment/importFromDeconstruction', { collectionCode, deconstructionIds }),

  listChapters: (collectionCode: string) =>
    cmPostQuery<CmRemoteChapter[]>('/cm/chapter/list', { collectionCode }),

  listSegments: (collectionCode: string, chapterCode?: string) =>
    cmPostQuery<CmRemoteSegment[]>('/cm/segment/list',
      chapterCode ? { collectionCode, chapterCode } : { collectionCode }),

  paragraphAlign: (cmd: {
    collectionCode: string; skuId?: string; narrationUrl?: string;
    sections: Array<{ sectionNo: number; stageCode: string; stageName?: string; narrationDurationSec: number; requiredTags?: string[] }>;
  }) => cmPost<CmComposeBackendResult>('/cm/compose/paragraphAlign', cmd),

  sunwukong: (collectionCode: string, durationSec: number, narrationAssetCode?: string, seed?: number) =>
    cmPost<CmComposeBackendResult>('/cm/compose/sunwukong', { collectionCode, durationSec, narrationAssetCode, seed }),

  zhuge: (collectionCode: string, durationSec: number, seed?: number) =>
    cmPost<CmComposeBackendResult>('/cm/compose/zhuge', { collectionCode, durationSec, seed }),

  uploadAsset: async (file: File): Promise<{ assetCode: string; size: number; originalName: string; streamUrl: string }> => {
    const fd = new FormData()
    fd.append('file', file)
    const r = await apiFetch('/cm/asset/upload', { method: 'POST', body: fd })
    if (!r.ok) throw new Error(`上传失败: ${r.status}`)
    const j = await r.json()
    if (j.success === false) throw new Error(j.errorMessage ?? '上传失败')
    return j.data
  },

  /** 5 个原子小工具 */
  toolAspectConvert: (cmd: { inputAssetCode: string; targetAspect: string; shortEdge?: number; mode?: string }) =>
    cmPost<CmToolBackendResult>('/cm/tool/aspectConvert', cmd),
  toolAudioOps: (cmd: { inputAssetCode: string; removeOriginal?: boolean; bgmAssetCode?: string; volume?: number; bgmVolume?: number }) =>
    cmPost<CmToolBackendResult>('/cm/tool/audioOps', cmd),
  toolUniformSplit: (cmd: { inputAssetCode: string; segmentSec: number }) =>
    cmPost<CmToolBackendResult>('/cm/tool/uniformSplit', cmd),
  toolSilenceFilter: (cmd: {
    inputAssetCode: string
    noiseDb?: number
    minSilenceSec?: number
    padBeforeSec?: number
    padAfterSec?: number
    headTailOnly?: boolean
    pacing?: 'slow' | 'medium' | 'fast' | 'custom'
  }) => cmPost<CmToolBackendResult>('/cm/tool/silenceFilter', cmd),
  toolSceneSplit: (cmd: { inputAssetCode: string; sceneThreshold?: number; minSegmentSec?: number }) =>
    cmPost<CmToolBackendResult>('/cm/tool/sceneSplit', cmd),

  /**
   * 擦除字幕：对指定区域（百分比坐标）擦除字幕/水印。
   * fillMode:
   *   'delogo'  — FFmpeg 周边像素插值修复（默认，速度快）
   *   'black'   — 黑色矩形直接覆盖（最快）
   *   'aliyun'  — 阿里云 VIAPI 智能擦除，AI 修复效果最优（需配置 access key）
   */
  toolSubtitleErase: (cmd: {
    inputAssetCode: string
    regions: Array<{ x: number; y: number; w: number; h: number }>
    fillMode?: 'delogo' | 'black' | 'aliyun' | 'local'
  }) => cmPost<CmToolBackendResult>('/cm/tool/subtitleErase', cmd),

  /** 生成字幕：ASR → SRT/VTT，可选硬烧 */
  toolSubtitleGen: (cmd: {
    inputAssetCode: string
    format?: 'srt' | 'vtt' | 'both'
    lang?: 'zh' | 'en'
    burnIn?: boolean
  }) => cmPost<CmToolBackendResult>('/cm/tool/subtitleGen', cmd),

  /** 添加背景：纯色或图片 + 视频 overlay */
  toolAddBg: (cmd: {
    inputAssetCode: string
    bgImageAssetCode?: string
    bgColor?: string
    outWidth?: number
    outHeight?: number
    scaleMode?: 'fit' | 'cover'
    scaleRatio?: number
    anchor?: 'center' | 'top' | 'bottom'
  }) => cmPost<CmToolBackendResult>('/cm/tool/addBg', cmd),

  /** 裂变文字样式：在视频上叠 N 种文字版本 */
  toolTextStyleFission: (cmd: {
    inputAssetCode: string
    text: string
    count?: number
    fontSize?: number
    fontColor?: string
    borderColor?: string
    xPct?: number
    yPct?: number
    stylePreset?: 'default' | 'shock' | 'cute' | 'business'
  }) => cmPost<CmToolBackendResult>('/cm/tool/textStyleFission', cmd),

  // ─── link-ingest 卡片 ─────────────────────────────────────────────────

  /** 解析 URL 列表 → 每条返回 platform/title/mediaUrl/durationSec/errMsg */
  linkIngestParse: (cmd: { urls: string[]; stripEmoji?: boolean }) =>
    cmPost<LinkIngestParseResultItem[]>('/cm/link-ingest/parse', cmd),

  /** 解析后下载到 cm-storage，返回 assetCode */
  linkIngestDownload: (cmd: { sourceUrl: string; mediaUrl?: string; title?: string; platform?: string }) =>
    cmPost<LinkIngestDownloadResult>('/cm/link-ingest/download', cmd),

  /** 抽音 + ASR 转写 */
  linkIngestTranscribe: (cmd: { inputAssetCode: string; lang?: string }) =>
    cmPost<LinkIngestTranscribeResult>('/cm/link-ingest/transcribe', cmd),

  // ─── script-fission 卡片 ─────────────────────────────────────────────

  /** 文案裂变：每分镜 N 个版本，返回矩阵 */
  scriptFission: (cmd: {
    title?: string
    shots: Array<{ name: string; content: string }>
    count: number
    style?: 'default' | 'colloquial' | 'kol' | 'live-commerce'
  }) => cmPost<ScriptFissionResult>('/cm/script/fission', cmd),

  /** 智能拆解：LLM 把口播文案切成精细分镜 */
  scriptDecompose: (cmd: { text: string; maxShots?: number; style?: 'default' | 'kol' }) =>
    cmPost<ScriptDecomposeResult>('/cm/script/decompose', cmd),

  /** AI 文案调整：脚本迁移 + 加码（品牌替换 / 卖点切换 / 风格调整） */
  scriptAdjust: (cmd: {
    shots: Array<{ name: string; content: string }>
    matrix?: string[][]
    productUrl?: string
    instruction?: string
  }) => cmPost<ScriptAdjustResult>('/cm/script/adjust', cmd),

  /** 话术合规审核：标记风险句 + 修改建议 */
  complianceAudit: (cmd: { text: string; category?: string }) =>
    cmPost<ComplianceAuditResult>('/cm/compliance/audit', cmd),

  // ─── semantic-split 卡片 ─────────────────────────────────────────────────

  /** 按语义拆解：ASR + LLM 聚合片段 + 文件夹分类 */
  semanticSplit: (cmd: {
    inputAssetCode: string
    mode: 'live' | 'short'
    folders?: Array<{ id: string; name: string; keywords?: string }>
  }) => cmPost<SemanticSplitResult>('/cm/semantic/split', cmd),

  /** 批量切片导出（mp4 + 剪映 draft.json，打 zip） */
  semanticExport: (cmd: {
    inputAssetCode: string
    segments: SemanticSegment[]
    folders?: Array<{ id: string; name: string; keywords?: string }>
    format?: 'mp4' | 'jianying' | 'both'
  }) => cmPost<SemanticExportResult>('/cm/semantic/export', cmd),

  // ─── live-loop 卡片（直播话术循环检测） ───────────────────────────────

  /** 检测直播话术循环：ASR + LLM 识别每轮产品讲解 + 关键卖点高亮 */
  liveLoopDetect: (cmd: {
    inputAssetCode: string
    lang?: string
    minLoopSec?: number
  }) => cmPost<LiveLoopDetectResult>('/cm/live-loop/detect', cmd),

  /** 批量切片导出选中循环（mp4 zip） */
  liveLoopExport: (cmd: {
    inputAssetCode: string
    loops: LiveLoop[]
    format?: 'mp4' | 'mov'
    codec?: 'h264' | 'hevc'
  }) => cmPost<{ status: 'SUCCEEDED' | 'FAILED'; zipUrl?: string; clipCount?: number; errMsg?: string }>('/cm/live-loop/export', cmd),

  // ─── chapter-extract 卡片 ────────────────────────────────────────────

  /** 提取章节结构：ASR + LLM 识别章节边界，自动分类到目标文件夹 */
  chapterExtract: (cmd: {
    inputAssetCode: string
    type: string
    folders?: Array<{ id: string; name: string; keywords?: string }>
  }) => cmPost<ChapterExtractResult>('/cm/chapter-extract/run', cmd),

  /** 导出章节切片（mp4 zip，按文件夹组织） */
  chapterExport: (cmd: {
    inputAssetCode: string
    chapters: ChapterExtractChapter[]
    folders?: Array<{ id: string; name: string }>
    format?: 'mp4' | 'mov'
  }) => cmPost<{ status: 'SUCCEEDED' | 'FAILED'; zipUrl?: string; clipCount?: number; errMsg?: string }>('/cm/chapter-extract/export', cmd),

  // ─── tts-batch 卡片 ──────────────────────────────────────────────────

  /** 批量语音合成 */
  ttsBatch: (cmd: {
    title?: string
    voiceId: string
    speed?: number
    items: Array<{ shotIdx: number; versionIdx: number; name: string; text: string }>
  }) => cmPost<TtsBatchResult>('/cm/tts/batch', cmd),

  /** 获取可用音色列表 */
  ttsVoices: () => cmGet<TtsVoiceListResult>('/cm/tts/voices'),

  /** 探活 */
  ping: () => cmPost<unknown>('/cm/collection/list', {}).then(() => true).catch(() => false),
}

export interface LinkIngestParseResultItem {
  sourceUrl: string
  platform: string
  title?: string
  mediaType?: string
  mediaUrl?: string
  durationSec?: number
  errMsg?: string
}

export interface LinkIngestDownloadResult {
  status: 'SUCCEEDED' | 'FAILED'
  assetCode?: string
  streamUrl?: string
  audioAssetCode?: string
  audioStreamUrl?: string
  thumbnailAssetCode?: string
  thumbnailUrl?: string
  sizeBytes?: number
  durationSec?: number
  width?: number
  height?: number
  errMsg?: string
}

export interface LinkIngestTranscribeResult {
  status: 'SUCCEEDED' | 'FAILED'
  captionText?: string
  segments?: Array<{ start: number; end: number; text: string }>
  provider?: string
  errMsg?: string
}

export interface ScriptFissionResult {
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED'
  matrix?: string[][]
  provider?: string
  elapsedMs?: number
  errMsg?: string
}

export interface ScriptDecomposeResult {
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED'
  shots?: Array<{ name: string; content: string }>
  provider?: string
  fallbackUsed?: boolean
  elapsedMs?: number
  errMsg?: string
}

export interface ScriptAdjustResult {
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED'
  matrix?: string[][]
  productSummary?: string
  provider?: string
  elapsedMs?: number
  errMsg?: string
}

export interface SemanticSegment {
  idx: number
  start: number
  end: number
  text: string
  folderId?: string
  folderName?: string
  confidence?: number
  /** 软删除：标记为移除，时间轴显示斜线、回放跳过、不入导出 */
  isRemoved?: boolean
}

export interface SemanticSplitResult {
  status: 'SUCCEEDED' | 'FAILED'
  segments?: SemanticSegment[]
  durationSec?: number
  provider?: string
  elapsedMs?: number
  errMsg?: string
}

/** 单条话术循环（一轮产品讲解的完整周期） */
export interface LiveLoop {
  idx: number
  productName: string
  start: number
  end: number
  /** 该循环内的逐句转写 */
  sentences: Array<{
    start: number
    end: number
    text: string
    /** 是否被识别为黄金卖点 / 钩子话术，前端绿色高亮 */
    isHighlight?: boolean
  }>
  /** 该循环命中的关键词（产品名 / 卖点词，用于左侧 chip 展示） */
  keywords?: string[]
  /** 用户是否勾选导出 */
  selected?: boolean
}

export interface LiveLoopDetectResult {
  status: 'SUCCEEDED' | 'FAILED'
  loops?: LiveLoop[]
  durationSec?: number
  provider?: string
  elapsedMs?: number
  errMsg?: string
}

// ─── chapter-extract ─────────────────────────────────────────────────────────

export interface ChapterExtractChapter {
  /** 章节唯一标识（后端生成） */
  id: string
  /** 章节标题，如"产品介绍""促单环节" */
  title: string
  startSec: number
  endSec: number
  /** 该章节口播文案摘要 */
  caption: string
  /** 自动分类到的文件夹 id（与请求中的 folders 对应） */
  folderId?: string
  /** 自动标签 */
  tags?: string[]
  /** 剪辑指导：针对该章节的画面/剪辑建议（基于爆款视频分析）*/
  editingGuide?: string
  /** 所属产品名称（直播/带货类型拆解后按产品分组） */
  productName?: string
}

export interface ChapterExtractResult {
  status: 'SUCCEEDED' | 'FAILED'
  chapters?: ChapterExtractChapter[]
  provider?: string
  elapsedMs?: number
  errMsg?: string
}

export interface SemanticExportResult {
  status: 'SUCCEEDED' | 'FAILED'
  zipUrl?: string
  jianyingDraftUrl?: string
  clips?: Array<{
    idx: number
    folderName: string
    fileName: string
    assetCode?: string
    streamUrl?: string
    durationSec: number
  }>
  errMsg?: string
}

export interface ComplianceAuditResult {
  status: 'SUCCEEDED' | 'FAILED'
  overallRisk?: 'high' | 'medium' | 'low' | 'safe' | 'unknown'
  summary?: string
  risks: Array<{
    idx?: number
    text?: string
    riskType?: string
    level?: 'high' | 'medium' | 'low'
    violation?: string
    suggestion?: string
    regulation?: string
  }>
  provider?: string
  elapsedMs?: number
  errMsg?: string
}

export interface TtsVoice {
  id: string
  name: string
  gender: 'male' | 'female'
  style: string
  lang: string
  starred: boolean
}

export interface TtsVoiceListResult {
  voices: TtsVoice[]
  provider: string
}

export interface TtsBatchResult {
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED'
  folderName?: string
  zipUrl?: string
  files: Array<{
    shotIdx: number
    versionIdx: number
    name: string
    assetCode?: string
    streamUrl?: string
    durationSec?: number
    status: 'success' | 'failed'
    errMsg?: string
  }>
  provider?: string
  elapsedMs?: number
  errMsg?: string
}

export interface CmToolBackendResult {
  status: 'SUCCEEDED' | 'FAILED'
  resultAssetCode?: string
  streamUrl?: string
  resultAssetCodes?: string[]
  streamUrls?: string[]
  durationSec?: number
  message?: string
  stderrTail?: string
}

async function cmPostQuery<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join('&')
  const url = qs ? `${path}?${qs}` : path
  const r = await apiFetch(url, { method: 'POST' })
  if (!r.ok) throw new Error(`请求失败: ${r.status}`)
  const j = (await r.json()) as CmEnvelope<T>
  const ok = j.success === undefined ? (j.code === undefined || j.code === 0 || j.code === 200) : j.success
  if (!ok) throw new Error(j.msg ?? j.message ?? '请求失败')
  return j.data as T
}

function mapModeToBackend(mode: string): string {
  switch (mode) {
    case 'paragraph-align': return 'PARAGRAPH_ALIGN'
    case 'zhuge': return 'ZHUGE'
    case 'sunwukong': return 'SUNWUKONG'
    default: return mode.toUpperCase()
  }
}

function mapAlignCmdToBackend(cmd: CmParagraphAlignCmd): Record<string, unknown> {
  // 兼容老 mock 调用：cmd 携带 skuId / 不携带 collectionCode 时，沿用本地 mock 路径
  const localCollections = cmStore.listCollections()
  const matched = localCollections.find(c => c.skuId === cmd.skuId)
  return {
    collectionCode: (matched as unknown as { collectionCode?: string })?.collectionCode ?? matched?.id ?? cmd.skuId,
    skuId: cmd.skuId,
    narrationUrl: cmd.narrationUrl,
    sections: cmd.sections.map(s => ({
      sectionNo: s.sectionNo,
      stageCode: s.stageCode,
      stageName: s.stageName,
      narrationDurationSec: s.narrationDurationSec,
      requiredTags: s.requiredTags,
    })),
  }
}

interface BackendAlignResult {
  taskCode: string
  status: string
  totalDurationSec: number
  resultVideoUrl?: string
  clips: Array<{
    sectionNo: number
    stageCode: string
    segmentCode: string
    videoUrl: string
    startSec: number
    endSec: number
  }>
}

function mapAlignResultFromBackend(r: BackendAlignResult): CmComposeResult {
  return {
    taskCode: r.taskCode,
    status: r.status,
    totalDurationSec: r.totalDurationSec,
    resultVideoUrl: r.resultVideoUrl,
    clips: (r.clips ?? []).map(c => ({
      sectionNo: c.sectionNo,
      stageCode: c.stageCode,
      segmentId: c.segmentCode,
      videoId: c.videoUrl,
      startSec: c.startSec,
      endSec: c.endSec,
    })),
  }
}

export function loadFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem('cm_favorites') ?? '[]') } catch { return [] }
}

// ─── 素材库 (P0 用 localStorage 占位, 后端上线后切到 /cm/material/*) ──
export type CmStageCode = 'HOOK' | 'SCENE' | 'BENEFIT' | 'PROOF_CTA' | 'UNTAGGED'

export const STAGE_NAMES: Record<CmStageCode, string> = {
  HOOK: '01_钩子',
  SCENE: '02_场景痛点',
  BENEFIT: '03_方案卖点',
  PROOF_CTA: '04_证明收束',
  UNTAGGED: '99_待分类',
}

export interface CmCollection {
  id: string
  name: string
  skuId?: string
  mode: 'zhuge' | 'sunwukong' | 'paragraph-align'
  createdAt: string
}

export interface CmChapter {
  id: string
  collectionId: string
  name: string
  stageCode: CmStageCode
  orderNo: number
  voiceClipUrl?: string
}

export interface CmSegment {
  id: string
  collectionId: string
  chapterId: string
  videoUrl: string
  startSec: number
  endSec: number
  durationSec: number
  noMirror: boolean
  orderNo: number
  /** 标签 */
  stageCode?: CmStageCode
  sceneTags?: string[]
  sellingPointTags?: string[]
  hookType?: string
  /** 来源溯源 */
  sourceType: 'UPLOAD' | 'DECONSTRUCTION' | 'ZIP' | 'FEISHU'
  sourceSegmentId?: string
  sourceVideoId?: string
  /** 显示用 */
  caption?: string
}

const COLL_KEY = 'cm_collections'
const CHAP_KEY = 'cm_chapters'
const SEG_KEY = 'cm_segments'

function loadJson<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[] } catch { return [] }
}
function saveJson<T>(key: string, items: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(items)) } catch {/* ignore */}
}
function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const cmStore = {
  // collections
  listCollections: (): CmCollection[] => loadJson<CmCollection>(COLL_KEY),
  createCollection: (name: string, mode: CmCollection['mode'], skuId?: string): CmCollection => {
    const c: CmCollection = { id: uid('coll'), name, mode, skuId, createdAt: new Date().toISOString() }
    saveJson(COLL_KEY, [c, ...loadJson<CmCollection>(COLL_KEY)])
    return c
  },
  deleteCollection: (id: string): void => {
    saveJson(COLL_KEY, loadJson<CmCollection>(COLL_KEY).filter(c => c.id !== id))
    saveJson(CHAP_KEY, loadJson<CmChapter>(CHAP_KEY).filter(c => c.collectionId !== id))
    saveJson(SEG_KEY, loadJson<CmSegment>(SEG_KEY).filter(s => s.collectionId !== id))
  },

  // chapters
  listChapters: (collectionId: string): CmChapter[] =>
    loadJson<CmChapter>(CHAP_KEY).filter(c => c.collectionId === collectionId).sort((a, b) => a.orderNo - b.orderNo),
  upsertChapter: (chapter: Omit<CmChapter, 'id'> & { id?: string }): CmChapter => {
    const all = loadJson<CmChapter>(CHAP_KEY)
    if (chapter.id) {
      const idx = all.findIndex(c => c.id === chapter.id)
      if (idx >= 0) { all[idx] = chapter as CmChapter; saveJson(CHAP_KEY, all); return all[idx] }
    }
    const c: CmChapter = { ...chapter, id: uid('ch') }
    saveJson(CHAP_KEY, [...all, c])
    return c
  },
  ensureChapter: (collectionId: string, stageCode: CmStageCode): CmChapter => {
    const existing = loadJson<CmChapter>(CHAP_KEY).find(c => c.collectionId === collectionId && c.stageCode === stageCode)
    if (existing) return existing
    const order = stageCode === 'HOOK' ? 1 : stageCode === 'SCENE' ? 2 : stageCode === 'BENEFIT' ? 3 : stageCode === 'PROOF_CTA' ? 4 : 99
    return cmStore.upsertChapter({ collectionId, stageCode, name: STAGE_NAMES[stageCode], orderNo: order })
  },
  deleteChapter: (id: string): void => {
    saveJson(CHAP_KEY, loadJson<CmChapter>(CHAP_KEY).filter(c => c.id !== id))
    saveJson(SEG_KEY, loadJson<CmSegment>(SEG_KEY).filter(s => s.chapterId !== id))
  },

  // segments
  listSegments: (collectionId: string, chapterId?: string): CmSegment[] =>
    loadJson<CmSegment>(SEG_KEY)
      .filter(s => s.collectionId === collectionId && (!chapterId || s.chapterId === chapterId))
      .sort((a, b) => a.orderNo - b.orderNo),
  addSegments: (segs: Omit<CmSegment, 'id'>[]): CmSegment[] => {
    const all = loadJson<CmSegment>(SEG_KEY)
    const created: CmSegment[] = segs.map(s => ({ ...s, id: uid('seg') }))
    saveJson(SEG_KEY, [...all, ...created])
    return created
  },
  deleteSegment: (id: string): void => {
    saveJson(SEG_KEY, loadJson<CmSegment>(SEG_KEY).filter(s => s.id !== id))
  },

  clearAll: (): void => {
    [COLL_KEY, CHAP_KEY, SEG_KEY].forEach(k => localStorage.removeItem(k))
  },
}

function mockParagraphAlignResult(cmd: CmParagraphAlignCmd): CmComposeResult {
  const clips: CmComposeClip[] = []
  let cursor = 0
  cmd.sections.forEach(sec => {
    const need = sec.narrationDurationSec
    let acc = 0
    let idx = 0
    while (acc < need) {
      const clipLen = Math.min(5, need - acc + 1.5)
      clips.push({
        sectionNo: sec.sectionNo,
        stageCode: sec.stageCode,
        segmentId: `mock-${sec.sectionNo}-${idx}`,
        videoId: 'video-task-mock',
        startSec: cursor,
        endSec: cursor + clipLen,
      })
      cursor += clipLen
      acc += clipLen
      idx += 1
    }
  })
  return {
    taskCode: `cm-mock-${Date.now()}`,
    status: 'MOCK',
    clips,
    totalDurationSec: cursor,
  }
}
