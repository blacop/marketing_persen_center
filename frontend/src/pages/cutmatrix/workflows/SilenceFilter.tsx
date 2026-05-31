import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Play, Pause, Music, Video, AlertCircle, Loader,
  RefreshCw, X, Trash2, CheckSquare, Square, Zap, Download, Folder, FolderOpen,
} from 'lucide-react'
import JSZip from 'jszip'
import { cmRemote, type CmToolBackendResult } from '../../../lib/cm/cmApi'
import { apiFetch } from '../../../lib/apiClient'

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const ALLOWED_EXT = ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'opus',
                     'mp4', 'mov', 'mkv', 'webm', 'avi', 'flv']

type Pacing = 'slow' | 'medium' | 'fast' | 'custom'

const PACING_PRESETS: Record<Exclude<Pacing, 'custom'>, { noiseDb: number; minSilence: number; padBefore: number; padAfter: number; desc: string }> = {
  slow:   { noiseDb: -40, minSilence: 0.8, padBefore: 0.30, padAfter: 0.20, desc: '适用于讲述、教学、操作演示' },
  medium: { noiseDb: -30, minSilence: 0.5, padBefore: 0.15, padAfter: 0.10, desc: '适用于自媒体中视频、长视频' },
  fast:   { noiseDb: -25, minSilence: 0.3, padBefore: 0.05, padAfter: 0.05, desc: '适用于短视频、广告' },
}

// ─── 类型 ─────────────────────────────────────────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'ready' | 'error' | 'unsupported' | 'duplicate'

interface MaterialItem {
  id: string
  fileName: string
  size: number
  ext: string
  uploadState: UploadState
  assetCode?: string
  streamUrl?: string
  errMsg?: string
  resultUrl?: string
  resultStatus?: 'idle' | 'processing' | 'done' | 'failed'
  resultMsg?: string
}

interface FilterTask {
  id: string
  fileName: string
  createdAt: string
  completedAt?: string
  status: 'processing' | 'done' | 'failed'
  resultUrl?: string
  /** 原始素材 URL，用于工程文件导出时反推剪辑点 */
  sourceUrl?: string
  expiresAt?: string
  msg?: string
  pacing: Pacing
  /** 分析参数：用于工程文件导出时复算静音段 */
  analysisParams?: {
    noiseDb: number
    minSilenceSec: number
    padBefore: number
    padAfter: number
    headTailOnly: boolean
  }
}

const STORE_KEY = 'cm_silence_filter_tasks'
function loadTasks(): FilterTask[] { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] } }
function saveTasks(t: FilterTask[]): void { try { localStorage.setItem(STORE_KEY, JSON.stringify(t)) } catch { /* ignore */ } }
function uid() { return `sf-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

function fmtSize(b: number): string {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

function getExt(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

function isAudio(ext: string): boolean {
  return ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'opus'].includes(ext)
}

// 跨源 → Vite proxy 相对路径
function relativizeUrl(url: string): string {
  if (!url) return url
  try {
    const u = new URL(url, window.location.origin)
    if (u.origin === window.location.origin) return u.pathname + u.search
    if (u.pathname.startsWith('/cm/')) return u.pathname + u.search
    return url
  } catch { return url }
}

async function downloadResultFile(url: string, fileName: string) {
  const r = await apiFetch(relativizeUrl(url))
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const blob = await r.blob()
  const a = document.createElement('a')
  const objUrl = URL.createObjectURL(blob)
  a.href = objUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(objUrl), 1000)
}

// ─── 导出格式/位置 ────────────────────────────────────────────────────────────

type ExportFormat = 'media' | 'proxy' | 'segments' | 'premiere' | 'finalcut' | 'davinci' | 'jianying'
type ExportLocation = 'with-source' | 'flatten' | 'preserve-tree'

interface FormatOption {
  id: ExportFormat
  label: string
  desc: string
  hint?: string
  /** 实现类别：直接下载结果文件 / 生成工程 / 待后端 */
  kind: 'media' | 'project' | 'backend-only'
  /** 工程文件扩展名 */
  projectExt?: string
}

const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'media',    label: '导出媒体文件',    desc: '格式、参数同原文件，可直接播放。', hint: '导出整段视频，粗处理素材',     kind: 'media' },
  { id: 'proxy',    label: '导出高速中转文件', desc: '低码率代理文件，需后端 ffmpeg 转码。', hint: '需后端支持',                  kind: 'backend-only' },
  { id: 'segments', label: '导出切片',        desc: '按保留片段输出 N 个独立文件，需后端 ffmpeg 切割。', hint: '需后端支持',     kind: 'backend-only' },
  { id: 'premiere', label: '导入 Premiere',    desc: 'Adobe Premiere Pro · FCP7 XML · 版本 2022 及以上',  kind: 'project', projectExt: 'xml' },
  { id: 'finalcut', label: '导入 Final Cut Pro', desc: 'Apple FCPXML 1.10 · 版本 10.6.1 及以上',          kind: 'project', projectExt: 'fcpxml' },
  { id: 'davinci',  label: '导入 DaVinci Resolve', desc: 'DR 通过 FCPXML 导入 · 版本 19 及以上',           kind: 'project', projectExt: 'fcpxml' },
  { id: 'jianying', label: '导入剪映',        desc: '生成草稿 zip · 解压至剪映草稿目录 · 版本 5.8 及以上', hint: '需手动放置', kind: 'project', projectExt: 'zip' },
]

const LOCATION_OPTIONS: { id: ExportLocation; label: string }[] = [
  { id: 'with-source', label: '与素材放在一起' },
  { id: 'flatten',     label: '放到指定位置并平铺' },
  { id: 'preserve-tree', label: '放到指定位置并保留文件夹结构' },
]

const EXPORT_PREFS_KEY = 'cm_silence_filter_export_prefs'
interface ExportPrefs { format: ExportFormat; location: ExportLocation; path: string }
function loadExportPrefs(): ExportPrefs {
  try {
    const v = JSON.parse(localStorage.getItem(EXPORT_PREFS_KEY) ?? 'null') as ExportPrefs | null
    if (v && v.format && v.location) return v
  } catch { /* ignore */ }
  return { format: 'media', location: 'flatten', path: '~/Movies/cutmatrix-silence' }
}
function saveExportPrefs(p: ExportPrefs): void {
  try { localStorage.setItem(EXPORT_PREFS_KEY, JSON.stringify(p)) } catch { /* ignore */ }
}

// ─── 静音段分析（与 RealWaveform 同算法） ────────────────────────────────────

interface SilenceAnalysis {
  durationSec: number
  /** 静音段（秒） */
  silences: Array<[number, number]>
  /** 保留段（秒），即剪辑后实际使用的素材时间码 */
  keeps: Array<[number, number]>
}

async function analyzeSilence(
  url: string,
  params: { noiseDb: number; minSilenceSec: number; padBefore: number; padAfter: number; headTailOnly: boolean },
): Promise<SilenceAnalysis> {
  const r = await apiFetch(relativizeUrl(url))
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const buf = await r.arrayBuffer()
  const Ctx: typeof AudioContext = (window.AudioContext
    ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext
  if (!Ctx) throw new Error('AudioContext 不可用')
  const ac = new Ctx()
  try {
    const audio = await ac.decodeAudioData(buf.slice(0))
    const ch = audio.getChannelData(0)
    const sr = audio.sampleRate
    const win = Math.max(1, Math.floor(sr * 0.02)) // 20ms RMS 窗
    const buckets = Math.floor(ch.length / win)
    const rms = new Float32Array(buckets)
    for (let i = 0; i < buckets; i++) {
      let sumSq = 0
      const s = i * win
      const e = s + win
      for (let j = s; j < e; j++) { const v = ch[j]; sumSq += v * v }
      rms[i] = Math.sqrt(sumSq / win)
    }
    const thresh = Math.pow(10, params.noiseDb / 20)
    const secPerBucket = win / sr
    const minBuckets = Math.max(1, Math.round(params.minSilenceSec / secPerBucket))
    const padBeforeBuckets = Math.round(params.padBefore / secPerBucket)
    const padAfterBuckets = Math.round(params.padAfter / secPerBucket)
    const runs: Array<[number, number]> = []
    let runStart = -1
    for (let i = 0; i < buckets; i++) {
      const isSil = rms[i] <= thresh
      if (isSil) { if (runStart < 0) runStart = i }
      else if (runStart >= 0) {
        if (i - runStart >= minBuckets) runs.push([runStart, i - 1])
        runStart = -1
      }
    }
    if (runStart >= 0 && (buckets - runStart) >= minBuckets) runs.push([runStart, buckets - 1])

    let final = runs
    if (params.headTailOnly) {
      final = runs.length > 0 ? [runs[0], runs[runs.length - 1]].filter((v, i, a) => i === a.indexOf(v)) : []
    }
    const silenceBucketRanges = final.map(([a, b]) => [
      Math.min(b, a + padBeforeBuckets),
      Math.max(a, b - padAfterBuckets),
    ] as [number, number]).filter(([a, b]) => b > a)

    const silences: Array<[number, number]> = silenceBucketRanges.map(([a, b]) => [
      a * secPerBucket,
      (b + 1) * secPerBucket,
    ])
    // 反推保留段
    const dur = audio.duration
    const keeps: Array<[number, number]> = []
    let cursor = 0
    for (const [a, b] of silences) {
      if (a > cursor) keeps.push([cursor, a])
      cursor = Math.max(cursor, b)
    }
    if (cursor < dur) keeps.push([cursor, dur])

    return { durationSec: dur, silences, keeps }
  } finally {
    ac.close().catch(() => { /* */ })
  }
}

// ─── 工程文件生成器 ──────────────────────────────────────────────────────────

const FCPXML_NTSC_FRAME_DEN = 30000
const FCPXML_NTSC_FRAME_NUM = 1001
function secToFCPXMLTime(sec: number): string {
  // 整 1001/30000s 帧（≈ 29.97fps）
  const frames = Math.round(sec * FCPXML_NTSC_FRAME_DEN / FCPXML_NTSC_FRAME_NUM)
  return `${frames * FCPXML_NTSC_FRAME_NUM}/${FCPXML_NTSC_FRAME_DEN}s`
}

/** EDL CMX 3600 — DR/PR/FCP 通用最低保障 */
function buildEDL(t: FilterTask, a: SilenceAnalysis): string {
  const title = t.fileName.replace(/\.[^.]+$/, '').slice(0, 60)
  const lines: string[] = [`TITLE: ${title}`, 'FCM: NON-DROP FRAME', '']
  const fps = 30
  const tc = (sec: number): string => {
    const totalFrames = Math.round(sec * fps)
    const f = totalFrames % fps
    const totalSec = Math.floor(totalFrames / fps)
    const s = totalSec % 60
    const m = Math.floor(totalSec / 60) % 60
    const h = Math.floor(totalSec / 3600)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`
  }
  let recCursor = 0
  a.keeps.forEach(([s, e], idx) => {
    const dur = e - s
    const recIn = recCursor
    const recOut = recCursor + dur
    const num = String(idx + 1).padStart(3, '0')
    lines.push(`${num}  AX       V     C        ${tc(s)} ${tc(e)} ${tc(recIn)} ${tc(recOut)}`)
    lines.push(`* FROM CLIP NAME: ${t.fileName}`)
    lines.push('')
    recCursor = recOut
  })
  return lines.join('\n')
}

/** Adobe Premiere FCP7 XML（xmeml v5）——  PR 2022+ 兼容 */
function buildPremiereXML(t: FilterTask, a: SilenceAnalysis): string {
  const fps = 30
  const sec2frame = (s: number) => Math.round(s * fps)
  const totalFrames = a.keeps.reduce((acc, [s, e]) => acc + sec2frame(e - s), 0)
  const sourceFrames = sec2frame(a.durationSec)
  const fileId = 'file-1'
  const escapedName = t.fileName.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  let recCursor = 0
  const clipitems = a.keeps.map(([s, e], idx) => {
    const dur = sec2frame(e - s)
    const inF = sec2frame(s)
    const outF = sec2frame(e)
    const start = recCursor
    const end = recCursor + dur
    recCursor = end
    return `        <clipitem id="clip-${idx + 1}">
          <name>${escapedName}</name>
          <enabled>TRUE</enabled>
          <duration>${sourceFrames}</duration>
          <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
          <start>${start}</start>
          <end>${end}</end>
          <in>${inF}</in>
          <out>${outF}</out>
          <file id="${fileId}">${idx === 0 ? `
            <name>${escapedName}</name>
            <pathurl>file://${encodeURI(t.fileName)}</pathurl>
            <rate><timebase>${fps}</timebase></rate>
            <duration>${sourceFrames}</duration>
            <media><video><samplecharacteristics><width>1920</width><height>1080</height></samplecharacteristics></video></media>
          ` : ''}</file>
        </clipitem>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence id="seq-1">
    <name>${escapedName} (silence-filtered)</name>
    <duration>${totalFrames}</duration>
    <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
    <media>
      <video>
        <track>
${clipitems}
        </track>
      </video>
    </media>
  </sequence>
</xmeml>
`
}

/** Apple FCPXML 1.10 —— FCP / DaVinci Resolve 通用 */
function buildFCPXML(t: FilterTask, a: SilenceAnalysis): string {
  const escapedName = t.fileName.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const fmtId = 'r1', assetId = 'r2'
  const totalDur = a.keeps.reduce((acc, [s, e]) => acc + (e - s), 0)
  let cursor = 0
  const clips = a.keeps.map(([s, e], idx) => {
    const dur = e - s
    const offset = cursor
    cursor += dur
    return `        <asset-clip name="${escapedName}-${idx + 1}" ref="${assetId}" offset="${secToFCPXMLTime(offset)}" start="${secToFCPXMLTime(s)}" duration="${secToFCPXMLTime(dur)}"/>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
    <format id="${fmtId}" name="FFVideoFormat1080p2997" frameDuration="${FCPXML_NTSC_FRAME_NUM}/${FCPXML_NTSC_FRAME_DEN}s" width="1920" height="1080"/>
    <asset id="${assetId}" name="${escapedName}" src="file://${encodeURI(t.fileName)}" start="0s" duration="${secToFCPXMLTime(a.durationSec)}" hasVideo="1" hasAudio="1" format="${fmtId}"/>
  </resources>
  <library>
    <event name="CutMatrix SilenceFilter">
      <project name="${escapedName} (silence-filtered)">
        <sequence format="${fmtId}" duration="${secToFCPXMLTime(totalDur)}" tcStart="0s" tcFormat="NDF">
          <spine>
${clips}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`
}

/** 剪映草稿 zip：draft_content.json + draft_meta_info.json + README + EDL 备份 */
async function buildJianyingZip(t: FilterTask, a: SilenceAnalysis): Promise<Blob> {
  const draftId = crypto.randomUUID()
  const matId = crypto.randomUUID()
  const trackId = crypto.randomUUID()
  const nowMs = Date.now()
  const nowUs = nowMs * 1000
  const totalUs = Math.round(a.keeps.reduce((acc, [s, e]) => acc + (e - s), 0) * 1_000_000)
  const sourceUs = Math.round(a.durationSec * 1_000_000)

  let cursorUs = 0
  const segments = a.keeps.map(([s, e]) => {
    const durUs = Math.round((e - s) * 1_000_000)
    const startUs = Math.round(s * 1_000_000)
    const seg = {
      id: crypto.randomUUID(),
      material_id: matId,
      source_timerange: { start: startUs, duration: durUs },
      target_timerange: { start: cursorUs, duration: durUs },
      extra_material_refs: [] as string[],
      speed: 1.0,
      volume: 1.0,
      visible: true,
      enable_adjust: true,
      enable_color_curves: true,
      enable_color_wheels: true,
      enable_lut: true,
      reverse: false,
      track_attribute: 0,
      track_render_index: 0,
      uniform_scale: { on: true, value: 1.0 },
    }
    cursorUs += durUs
    return seg
  })

  const draftContent = {
    id: draftId,
    version: 480000,
    fps: 30.0,
    duration: totalUs,
    canvas_config: { ratio: 'original', width: 1920, height: 1080 },
    color_space: 0,
    create_time: nowUs,
    update_time: nowUs,
    materials: {
      videos: [{
        id: matId,
        type: 'video',
        path: `<请改为绝对路径>/${t.fileName}`,
        material_name: t.fileName,
        duration: sourceUs,
        width: 1920, height: 1080,
        has_audio: true,
        crop: { lower_left_x: 0, lower_left_y: 1, lower_right_x: 1, lower_right_y: 1, upper_left_x: 0, upper_left_y: 0, upper_right_x: 1, upper_right_y: 0 },
        crop_ratio: 'free', crop_scale: 1.0,
        gameplay: null, intensifies_audio_path: '', intensifies_path: '',
      }],
      audios: [], texts: [], stickers: [], effects: [], transitions: [],
      images: [], shapes: [], videos_attached: [], audio_effects: [], audio_fades: [],
      sound_channel_mappings: [], speeds: [], placeholders: [], canvases: [], chromas: [],
      audio_balances: [], beats: [], color_curves: [], handwrites: [], hsls: [],
      log_color_wheels: [], loudnesses: [], manual_deformations: [], masks: [],
      material_animations: [], material_colors: [], primary_color_wheels: [],
      realtime_denoises: [], smart_crops: [], tail_leaders: [], video_effects: [],
      video_trackings: [], vocal_separations: [],
    },
    tracks: [{
      id: trackId,
      type: 'video',
      attribute: 0,
      flag: 0,
      segments,
    }],
    extra_info: null,
    keyframe_graph_list: [], keyframes: { adjusts: [], audios: [], effects: [], filters: [], handwrites: [], stickers: [], texts: [], videos: [] },
    last_modified_platform: { app_id: 0, app_source: 'cutmatrix', app_version: '5.8.0', device_id: '', hard_disk_id: '', mac_address: '', os: 'mac', os_version: '14.0' },
    mutable_config: null, name: '', new_version: '5.8.0',
    platform: { app_id: 0, app_source: 'cutmatrix', app_version: '5.8.0', device_id: '', hard_disk_id: '', mac_address: '', os: 'mac', os_version: '14.0' },
    relationships: [], render_index_track_mode_on: false, retouch_cover: null, source: 'default',
    static_cover_image_path: '', time_marks: null,
  }

  const draftName = `${t.fileName.replace(/\.[^.]+$/, '')}-silence-filtered`
  const draftMeta = {
    cloud_package_completed_time: '',
    draft_cloud_capcut_purchase_info: '',
    draft_cloud_last_action_download: false,
    draft_cloud_materials: [],
    draft_cloud_purchase_info: '',
    draft_cloud_template_id: '',
    draft_cloud_tutorial_info: '',
    draft_cloud_videocut_purchase_info: '',
    draft_cover: 'draft_cover.jpg',
    draft_deeplink_url: '',
    draft_enterprise_info: { draft_enterprise_extra: '', draft_enterprise_id: '', draft_enterprise_name: '', enterprise_material: [] },
    draft_fold_path: '',
    draft_id: draftId,
    draft_is_ai_packaging_used: false,
    draft_is_ai_shorts: false,
    draft_is_ai_translate: false,
    draft_is_article_video_draft: false,
    draft_is_from_deeplink: 'false',
    draft_is_invisible: false,
    draft_materials: [{ type: 0, value: [{ create_time: nowMs, duration: sourceUs, extra_info: t.fileName, file_Path: `<请改为绝对路径>/${t.fileName}`, height: 1080, id: matId, import_time: nowMs, import_time_ms: nowUs, item_source: 1, md5: '', metetype: 'video', roughcut_time_range: { duration: sourceUs, start: 0 }, sub_time_range: { duration: -1, start: -1 }, type: 0, width: 1920 }] }],
    draft_materials_copied_info: [],
    draft_name: draftName,
    draft_new_version: '',
    draft_removable_storage_device: '',
    draft_root_path: '',
    draft_segment_extra_info: [],
    draft_timeline_materials_size_: 0,
    draft_type: '',
    tm_draft_cloud_completed: '',
    tm_draft_cloud_modified: 0,
    tm_draft_create: nowMs,
    tm_draft_modified: nowMs,
    tm_draft_removed: 0,
    tm_duration: totalUs,
  }

  const readme = `# 剪映草稿导入说明

本 zip 由 CutMatrix · 极速过滤 生成，包含一个剪映草稿文件夹。

## 安装步骤
1. 解压本 zip
2. 把解压出的 \`${draftName}/\` 整个文件夹复制到剪映草稿目录：
   - macOS: ~/Movies/JianyingPro/User Data/Projects/com.lveditor.draft/
   - Windows: %USERPROFILE%/AppData/Local/JianyingPro/User Data/Projects/com.lveditor.draft/
3. 打开 \`${draftName}/draft_content.json\`，把 \`materials.videos[0].path\` 和 \`draft_materials\` 中的 \`<请改为绝对路径>/${t.fileName}\` 改成你本机素材的绝对路径
4. 启动剪映（若已开启需重启），在草稿列表选择 "${draftName}"

## 注意
- 剪映 5.8 以上版本测试通过；新版本可能要求更多字段
- 如导入失败，可使用同包内 \`fallback.edl\` 在 PR/FCP/DR 中导入
- 时间码基于客户端音频解码，与后端 ffmpeg 切割结果可能存在 ±1 帧偏差
`

  const zip = new JSZip()
  const folder = zip.folder(draftName)!
  folder.file('draft_content.json', JSON.stringify(draftContent, null, 2))
  folder.file('draft_meta_info.json', JSON.stringify(draftMeta, null, 2))
  zip.file('README.txt', readme)
  zip.file('fallback.edl', buildEDL(t, a))
  return await zip.generateAsync({ type: 'blob' })
}

function downloadBlob(content: Blob | string, fileName: string, mime = 'application/octet-stream'): void {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function SilenceFilter() {
  const nav = useNavigate()

  const [tab, setTab] = useState<'create' | 'queue'>('create')

  // 素材
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // 参数
  const [pacing, setPacing] = useState<Pacing>('fast')
  const [noiseDb, setNoiseDb] = useState(-26.92)
  const [padBefore, setPadBefore] = useState(0.15)
  const [padAfter, setPadAfter] = useState(0.05)
  const [headTailOnly, setHeadTailOnly] = useState(false)

  // 任务队列
  const [tasks, setTasks] = useState<FilterTask[]>(() => loadTasks())
  const [confirmReset, setConfirmReset] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [batchErr, setBatchErr] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const audioRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)

  // ─── 添加素材 ────────────────────────────────────────────────────────────

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBatchErr(null)

    const incoming: MaterialItem[] = []
    let skipped = 0

    for (const f of Array.from(files)) {
      const ext = getExt(f.name)

      // 跳过 zip / 图片 / 未知格式
      if (!ALLOWED_EXT.includes(ext)) {
        skipped++
        continue
      }
      // 去重（同名同大小）
      if (materials.some(m => m.fileName === f.name && m.size === f.size)) {
        skipped++
        continue
      }
      if (incoming.some(m => m.fileName === f.name && m.size === f.size)) {
        skipped++
        continue
      }

      incoming.push({
        id: uid(),
        fileName: f.name,
        size: f.size,
        ext,
        uploadState: 'uploading',
      })
    }

    if (incoming.length === 0) {
      setBatchErr(`已忽略 ${skipped} 个无效文件（仅支持音频/视频，已自动过滤 zip/jpg/重复项）`)
      return
    }

    setMaterials(prev => [...prev, ...incoming])
    if (!activeId && incoming.length > 0) setActiveId(incoming[0].id)

    // 并发上传（mock：实际用 cmRemote.uploadAsset，先降级为本地 URL）
    const fileArr = Array.from(files).filter(f => incoming.find(m => m.fileName === f.name && m.size === f.size))
    for (let i = 0; i < incoming.length; i++) {
      const item = incoming[i]
      const file = fileArr[i]
      if (!file) continue
      try {
        let assetCode: string | undefined
        let streamUrl: string | undefined
        try {
          const upload = await (cmRemote as unknown as { uploadAsset?: (f: File) => Promise<{ assetCode: string; streamUrl: string }> }).uploadAsset?.(file)
          if (upload) { assetCode = upload.assetCode; streamUrl = upload.streamUrl }
        } catch { /* fall through to blob URL */ }
        const blobUrl = URL.createObjectURL(file)
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, uploadState: 'ready', assetCode, streamUrl: streamUrl ?? blobUrl, resultStatus: 'idle' }
          : m))
      } catch (e) {
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, uploadState: 'error', errMsg: e instanceof Error ? e.message : '上传失败' }
          : m))
      }
    }

    if (skipped > 0) {
      setBatchErr(`已忽略 ${skipped} 个无效文件（仅支持音频/视频，已自动过滤 zip/jpg/重复项）`)
    }
  }

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
    if (activeId === id) {
      const remaining = materials.filter(m => m.id !== id)
      setActiveId(remaining[0]?.id ?? null)
    }
  }

  // ─── 节奏切换：自动应用预设参数 ──────────────────────────────────────────

  useEffect(() => {
    if (pacing === 'custom') return
    const p = PACING_PRESETS[pacing]
    setNoiseDb(p.noiseDb)
    setPadBefore(p.padBefore)
    setPadAfter(p.padAfter)
  }, [pacing])

  // ─── 持久化任务 ──────────────────────────────────────────────────────────
  useEffect(() => { saveTasks(tasks) }, [tasks])

  // ─── 提交单个 / 批量过滤 ─────────────────────────────────────────────────

  const filterOne = async (m: MaterialItem): Promise<FilterTask> => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
    const taskId = uid()
    const taskBase: FilterTask = {
      id: taskId, fileName: m.fileName, createdAt: now,
      status: 'processing', pacing,
    }
    setTasks(prev => [taskBase, ...prev])

    try {
      const noise = Math.round(noiseDb)
      let res: CmToolBackendResult
      if (m.assetCode) {
        res = await cmRemote.toolSilenceFilter({
          inputAssetCode: m.assetCode,
          noiseDb: noise,
          minSilenceSec: pacing === 'custom' ? 0.5 : PACING_PRESETS[pacing].minSilence,
          padBeforeSec: padBefore,
          padAfterSec: padAfter,
          headTailOnly,
          pacing,
        })
      } else {
        // 本地 mock
        await new Promise(r => setTimeout(r, 1000))
        res = {
          status: 'SUCCEEDED',
          streamUrl: m.streamUrl,
          message: `mock 过滤：${pacing} 节奏，阈值 ${noise}dB，前后保留 ${padBefore}/${padAfter}s`,
        } as CmToolBackendResult
      }

      const completed = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
      const expires = new Date(Date.now() + 86400000).toLocaleString('zh-CN', { hour12: false }).replace(',', '')
      const minSil = pacing === 'custom' ? 0.5 : PACING_PRESETS[pacing].minSilence
      const done: FilterTask = {
        ...taskBase,
        completedAt: completed,
        expiresAt: expires,
        status: res.status === 'SUCCEEDED' ? 'done' : 'failed',
        resultUrl: res.streamUrl,
        sourceUrl: m.streamUrl,
        msg: res.message,
        analysisParams: {
          noiseDb: noise,
          minSilenceSec: minSil,
          padBefore,
          padAfter,
          headTailOnly,
        },
      }
      setTasks(prev => prev.map(t => t.id === taskId ? done : t))
      setMaterials(prev => prev.map(mat => mat.id === m.id
        ? { ...mat, resultUrl: res.streamUrl, resultStatus: res.status === 'SUCCEEDED' ? 'done' : 'failed', resultMsg: res.message }
        : mat))
      return done
    } catch (e) {
      const failed: FilterTask = { ...taskBase, status: 'failed', msg: e instanceof Error ? e.message : '处理失败' }
      setTasks(prev => prev.map(t => t.id === taskId ? failed : t))
      return failed
    }
  }

  const handleRefilterActive = async () => {
    const m = materials.find(x => x.id === activeId)
    if (!m || m.uploadState !== 'ready') return
    setSubmitting(true)
    await filterOne(m)
    setSubmitting(false)
  }

  const handleRefilterAll = async () => {
    const ready = materials.filter(m => m.uploadState === 'ready')
    if (ready.length === 0) return
    setConfirmReset(false)
    setSubmitting(true)
    for (const m of ready) await filterOne(m)
    setSubmitting(false)
  }

  // ─── 派生 ────────────────────────────────────────────────────────────────

  const active = useMemo(() => materials.find(m => m.id === activeId) ?? null, [materials, activeId])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play(); setPlaying(true) }
  }
  useEffect(() => { setPlaying(false) }, [activeId])

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1500, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={20} color="#14b8a6" /> 极速过滤
          <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>
            FFmpeg silencedetect
          </span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          一键去除静音段落，无需语义识别。支持口播、直播切片、长视频粗处理。仅接受音频/视频文件，自动忽略 zip/图片/重复项。
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-light)', marginBottom: 16 }}>
        {(['create', 'queue'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
            {t === 'create' ? '创建任务' : '任务队列'}
          </button>
        ))}
      </div>

      {/* ── 创建任务 ── */}
      {tab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 360px 1fr', gap: 14 }}>
          {/* 左侧：素材列表 */}
          <div style={{ ...S.card, padding: 12, height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', gap: 6, marginBottom: 10 }}
            >
              <Upload size={13} />添加素材
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*,video/*"
              style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)}
            />
            {batchErr && (
              <div style={{ ...S.errBox, fontSize: '0.7rem', marginBottom: 8 }}>
                <AlertCircle size={11} />{batchErr}
              </div>
            )}
            <div style={{ overflow: 'auto', flex: 1 }}>
              {materials.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.74rem', padding: '24px 8px', lineHeight: 1.7 }}>
                  点击「添加素材」<br />仅支持音频 / 视频<br />自动过滤 zip/图片/重复项
                </div>
              ) : (
                materials.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    style={{
                      padding: '7px 9px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                      background: activeId === m.id ? 'rgba(20,184,166,0.1)' : 'transparent',
                      border: `1px solid ${activeId === m.id ? '#14b8a6' : 'transparent'}`,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {isAudio(m.ext) ? <Music size={12} color="#14b8a6" /> : <Video size={12} color="var(--accent-primary)" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.fileName}>
                        {m.fileName}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{fmtSize(m.size)}</span>
                        <span style={{ color: m.uploadState === 'ready' ? '#22c55e' : m.uploadState === 'uploading' ? '#f59e0b' : '#ef4444' }}>
                          {m.uploadState === 'ready' ? '✓' : m.uploadState === 'uploading' ? '⋯' : '!'}
                          {m.resultStatus === 'done' && ' 已过滤'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteMaterial(m.id) }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 中间：参数面板 */}
          <div style={{ ...S.card, padding: 16, overflow: 'auto', height: 'calc(100vh - 240px)' }}>
            <label style={S.checkLabel}>
              <input type="checkbox" checked={headTailOnly} onChange={e => setHeadTailOnly(e.target.checked)} style={{ marginRight: 6 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>只去除片头片尾静音</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>建议使用剪辑节奏「快」</div>
              </div>
            </label>

            <div style={{ height: 1, background: 'var(--border-light)', margin: '14px 0' }} />

            {/* 剪辑节奏 */}
            <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 10 }}>剪辑节奏</div>
            {(['slow', 'medium', 'fast', 'custom'] as Pacing[]).map(p => (
              <label key={p} style={{ ...S.checkLabel, padding: '5px 0', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="pacing"
                    checked={pacing === p}
                    onChange={() => setPacing(p)}
                    style={{ marginRight: 8 }}
                  />
                  <span style={{ fontSize: '0.78rem', fontWeight: pacing === p ? 600 : 400 }}>
                    {p === 'slow' ? '慢' : p === 'medium' ? '中等' : p === 'fast' ? '快' : '自定义'}
                  </span>
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {p !== 'custom' ? PACING_PRESETS[p].desc : '手动调整下方参数'}
                </span>
              </label>
            ))}

            <div style={{ height: 1, background: 'var(--border-light)', margin: '14px 0' }} />

            {/* 参数 */}
            <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 12 }}>参数</div>

            <div style={{ marginBottom: 14, opacity: pacing === 'custom' ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                <span>如果音量小于 <strong style={{ color: '#14b8a6' }}>{noiseDb.toFixed(2)} dB</strong>，则视为「无用片段」</span>
              </div>
              <input
                type="range" min={-70} max={0} step={0.01}
                value={noiseDb}
                disabled={pacing !== 'custom'}
                onChange={e => setNoiseDb(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#14b8a6' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                <span>-70 dB</span><span>0 dB</span>
              </div>
            </div>

            <div style={{ marginBottom: 14, opacity: pacing === 'custom' ? 1 : 0.6 }}>
              <div style={{ fontSize: '0.74rem', marginBottom: 4 }}>
                每个「有用片段」前，保留 <strong style={{ color: '#14b8a6' }}>{padBefore.toFixed(2)}</strong> 秒
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>（{Math.round(padBefore * 60)} 帧）</span>
              </div>
              <input
                type="range" min={0} max={2} step={0.05}
                value={padBefore}
                disabled={pacing !== 'custom'}
                onChange={e => setPadBefore(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#14b8a6' }}
              />
            </div>

            <div style={{ marginBottom: 14, opacity: pacing === 'custom' ? 1 : 0.6 }}>
              <div style={{ fontSize: '0.74rem', marginBottom: 4 }}>
                每个「有用片段」后，保留 <strong style={{ color: '#14b8a6' }}>{padAfter.toFixed(2)}</strong> 秒
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>（{Math.round(padAfter * 60)} 帧）</span>
              </div>
              <input
                type="range" min={0} max={2} step={0.05}
                value={padAfter}
                disabled={pacing !== 'custom'}
                onChange={e => setPadAfter(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#14b8a6' }}
              />
            </div>

            <div style={{ height: 1, background: 'var(--border-light)', margin: '14px 0' }} />

            {/* 上次参数 */}
            {tasks[0] && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 4 }}>上次参数</div>
                <div>{tasks[0].pacing} 节奏 / {tasks[0].fileName}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={handleRefilterActive}
                disabled={!active || active.uploadState !== 'ready' || submitting}
                style={{ ...S.btnGhost, flex: 1, justifyContent: 'center', opacity: !active || active.uploadState !== 'ready' || submitting ? 0.4 : 1 }}
              >
                重新过滤
              </button>
              <button
                onClick={() => setConfirmReset(true)}
                disabled={materials.filter(m => m.uploadState === 'ready').length === 0 || submitting}
                style={{ ...S.btnPrimary, flex: 2, justifyContent: 'center', gap: 5, opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />处理中</> : '全部重新过滤'}
              </button>
            </div>
          </div>

          {/* 右侧：预览 */}
          <div style={{ ...S.card, padding: 16, height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 10 }}>
              {active ? active.fileName : '从左侧选择素材'}
            </div>
            {!active ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', flexDirection: 'column', gap: 6 }}>
                <Music size={32} color="var(--text-muted)" />
                <span>添加素材后可在此预览波形</span>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
                  {active.streamUrl ? (
                    isAudio(active.ext) ? (
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <Music size={56} color="#14b8a6" />
                        <audio
                          ref={audioRef as unknown as React.RefObject<HTMLAudioElement>}
                          src={active.resultUrl ?? active.streamUrl}
                          style={{ display: 'block', marginTop: 12, width: 320 }}
                          controls
                        />
                      </div>
                    ) : (
                      <video
                        ref={audioRef}
                        src={active.resultUrl ?? active.streamUrl}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        controls
                      />
                    )
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                      {active.uploadState === 'uploading' ? '上传中…' : '尚未上传'}
                    </div>
                  )}
                </div>

                {/* 真实波形 */}
                <div style={{ marginTop: 12 }}>
                  <RealWaveform
                    src={active.resultUrl ?? active.streamUrl}
                    noiseDb={noiseDb}
                    minSilenceSec={pacing === 'custom' ? 0.5 : PACING_PRESETS[pacing].minSilence}
                    padBefore={padBefore}
                    padAfter={padAfter}
                    headTailOnly={headTailOnly}
                    hasResult={active.resultStatus === 'done'}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <button onClick={togglePlay} style={S.iconBtn}>
                    {playing ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <span style={{ flex: 1 }}>
                    {active.resultStatus === 'done' ? <span style={{ color: '#22c55e', fontWeight: 600 }}>已过滤完成 · 播放为过滤后结果</span>
                      : active.resultStatus === 'processing' ? <span style={{ color: '#f59e0b' }}>处理中…</span>
                      : <span>原始素材</span>}
                  </span>
                  {active.resultMsg && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }} title={active.resultMsg}>
                      {active.resultMsg.slice(0, 40)}{active.resultMsg.length > 40 ? '…' : ''}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 任务队列 ── */}
      {tab === 'queue' && (
        <QueueView tasks={tasks} setTasks={setTasks} />
      )}

      {/* 确认弹窗 */}
      {confirmReset && (
        <Modal onClose={() => setConfirmReset(false)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertCircle size={20} color="#ef4444" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6 }}>批量重新过滤</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                将重置所有素材的过滤结果，清空之前的任务记录。建议调整参数至大体满意后，再执行批量操作。是否继续？
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button onClick={() => setConfirmReset(false)} style={S.btnGhost}>关闭</button>
            <button onClick={handleRefilterAll} style={S.btnPrimary}>确定</button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── 真实波形 ────────────────────────────────────────────────────────────────
// 思路：fetch streamUrl → AudioContext.decodeAudioData → 取首通道 → 按 canvas 宽度
// 桶化求峰值（peaks）+ 桶化求 RMS（rms）。peaks 画灰色背景，rms 画彩色前景。
// 静音判定：每桶 RMS 转 dB，<= noiseDb 视为静音。连续静音桶聚合为 run，
// run 时长 < minSilenceSec 视为短停顿不切；其余按 padBefore/padAfter 收缩。
// headTailOnly：只保留首/尾两个 cut。

const peaksCacheRef: { current: Map<string, { peaks: Float32Array; rms: Float32Array; durationSec: number }> } = { current: new Map() }

interface RealWaveformProps {
  src?: string
  noiseDb: number
  minSilenceSec: number
  padBefore: number
  padAfter: number
  headTailOnly: boolean
  hasResult: boolean
}

function RealWaveform(props: RealWaveformProps) {
  const { src, noiseDb, minSilenceSec, padBefore, padAfter, headTailOnly, hasResult } = props
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [width, setWidth] = useState(640)
  const [decoded, setDecoded] = useState<{ peaks: Float32Array; rms: Float32Array; durationSec: number } | null>(null)
  const [decodeStatus, setDecodeStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle')
  const [decodeErr, setDecodeErr] = useState<string | null>(null)

  // 容器宽度自适应
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(Math.max(120, Math.floor(e.contentRect.width)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 解码音频（按 width 桶化）
  useEffect(() => {
    let cancelled = false
    if (!src) { setDecoded(null); setDecodeStatus('idle'); return }
    const cacheKey = `${src}@${width}`
    const cached = peaksCacheRef.current.get(cacheKey)
    if (cached) { setDecoded(cached); setDecodeStatus('done'); return }
    setDecodeStatus('loading'); setDecodeErr(null)
    ;(async () => {
      try {
        // 后端可能返回 http://localhost:30000/cm/...绝对地址 → 跨域 fetch 失败 (Failed to fetch)
        // vite proxy /cm → 30000；把绝对 URL 转为同源相对路径，走代理避开 CORS
        let fetchUrl = src
        if (/^https?:\/\//i.test(src)) {
          try {
            const u = new URL(src)
            // 同 origin 直接用；不同 origin 但 path 是 /cm/* → 改用相对路径走 vite 代理
            if (u.origin !== window.location.origin && u.pathname.startsWith('/cm/')) {
              fetchUrl = u.pathname + u.search
            }
          } catch { /* keep src */ }
        }
        const r = await apiFetch(fetchUrl)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const buf = await r.arrayBuffer()
        // Safari 兼容：webkitAudioContext
        const Ctx: typeof AudioContext = (window.AudioContext
          ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext
        if (!Ctx) throw new Error('AudioContext 不可用')
        const ac = new Ctx()
        const audio = await ac.decodeAudioData(buf.slice(0))
        const ch = audio.getChannelData(0)
        const buckets = Math.max(120, width)
        const sub = Math.max(1, Math.floor(ch.length / buckets))
        const peaks = new Float32Array(buckets)
        const rms = new Float32Array(buckets)
        for (let i = 0; i < buckets; i++) {
          const s = i * sub
          const e = Math.min(ch.length, s + sub)
          let mx = 0, sumSq = 0, n = 0
          for (let j = s; j < e; j++) {
            const v = ch[j]
            const a = v < 0 ? -v : v
            if (a > mx) mx = a
            sumSq += v * v; n++
          }
          peaks[i] = mx
          rms[i] = n > 0 ? Math.sqrt(sumSq / n) : 0
        }
        ac.close().catch(() => { /* */ })
        if (cancelled) return
        const out = { peaks, rms, durationSec: audio.duration }
        peaksCacheRef.current.set(cacheKey, out)
        setDecoded(out); setDecodeStatus('done')
      } catch (e) {
        if (cancelled) return
        setDecodeErr(e instanceof Error ? e.message : '解码失败')
        setDecodeStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [src, width])

  // 静音区间计算（基于 rms + minSilenceSec + padBefore/padAfter + headTailOnly）
  const silenceRanges = useMemo<Array<[number, number]>>(() => {
    if (!decoded) return []
    const { rms, durationSec } = decoded
    const buckets = rms.length
    const secPerBucket = durationSec / buckets
    const minBuckets = Math.max(1, Math.round(minSilenceSec / secPerBucket))
    const padBeforeBuckets = Math.round(padBefore / secPerBucket)
    const padAfterBuckets = Math.round(padAfter / secPerBucket)
    // dB 阈值 → 线性振幅；负无穷取 0
    const thresh = Math.pow(10, noiseDb / 20)
    const runs: Array<[number, number]> = []
    let runStart = -1
    for (let i = 0; i < buckets; i++) {
      const isSil = rms[i] <= thresh
      if (isSil) { if (runStart < 0) runStart = i }
      else if (runStart >= 0) {
        const len = i - runStart
        if (len >= minBuckets) runs.push([runStart, i - 1])
        runStart = -1
      }
    }
    if (runStart >= 0 && (buckets - runStart) >= minBuckets) runs.push([runStart, buckets - 1])

    let final = runs
    if (headTailOnly) final = runs.length > 0 ? [runs[0], runs[runs.length - 1]].filter((v, i, a) => i === a.indexOf(v)) : []
    // pad: 收缩 cut 区段（保留前后 pad 秒不切）
    return final.map(([a, b]) => [
      Math.min(b, a + padBeforeBuckets),
      Math.max(a, b - padAfterBuckets),
    ] as [number, number]).filter(([a, b]) => b > a)
  }, [decoded, noiseDb, minSilenceSec, padBefore, padAfter, headTailOnly])

  // 绘制
  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const dpr = window.devicePixelRatio || 1
    const W = width
    const H = 120  // 提高一倍 — 原 60 太矮
    cvs.width = W * dpr; cvs.height = H * dpr
    cvs.style.width = `${W}px`; cvs.style.height = `${H}px`
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    // 背景
    ctx.fillStyle = 'rgba(148,163,184,0.08)'
    ctx.fillRect(0, 0, W, H)

    // 阈值（dB → 线性振幅）
    const thresh = Math.pow(10, noiseDb / 20)

    if (!decoded) {
      // 没数据时画阈值参考线占位
      const halfH = H / 2
      const threshY = thresh * (halfH - 2)
      ctx.strokeStyle = 'rgba(239,68,68,0.55)'
      ctx.setLineDash([3, 3]); ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, halfH - threshY); ctx.lineTo(W, halfH - threshY); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, halfH + threshY); ctx.lineTo(W, halfH + threshY); ctx.stroke()
      ctx.setLineDash([])
      return
    }

    const { peaks, rms } = decoded
    const buckets = peaks.length
    const bw = W / buckets
    const halfH = H / 2

    // 归一化：找全段最大 peak，把所有值放大到 ~95% 半高
    let peakMax = 0
    for (let i = 0; i < buckets; i++) if (peaks[i] > peakMax) peakMax = peaks[i]
    if (peakMax < 0.01) peakMax = 0.01  // 避免除零
    const norm = 0.95 / peakMax
    // 画峰值用 sqrt 提升小信号可见度（gamma 0.5）
    const shape = (v: number) => Math.sqrt(Math.max(0, Math.min(1, v * norm)))

    // 静音区背景叠层
    ctx.fillStyle = 'rgba(148,163,184,0.22)'
    for (const [a, b] of silenceRanges) {
      ctx.fillRect(a * bw, 0, (b - a + 1) * bw, H)
    }

    const isCut = (i: number) => silenceRanges.some(([a, b]) => i >= a && i <= b)

    // peaks 淡色
    for (let i = 0; i < buckets; i++) {
      const h = Math.max(0.5, shape(peaks[i]) * (halfH - 1))
      ctx.fillStyle = isCut(i) ? 'rgba(148,163,184,0.45)' : 'rgba(20,184,166,0.45)'
      ctx.fillRect(i * bw, halfH - h, Math.max(0.8, bw - 0.4), h * 2)
    }

    // rms 深色
    for (let i = 0; i < buckets; i++) {
      const h = Math.max(0.5, shape(rms[i]) * (halfH - 1))
      ctx.fillStyle = isCut(i) ? 'rgba(100,116,139,0.9)' : '#14b8a6'
      ctx.fillRect(i * bw, halfH - h, Math.max(0.8, bw - 0.4), h * 2)
    }

    // 阈值线（同 shape 归一化，跟波形一致基准）
    const threshShape = shape(thresh)
    const threshY = threshShape * (halfH - 2)
    ctx.strokeStyle = 'rgba(239,68,68,0.7)'
    ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(0, halfH - threshY); ctx.lineTo(W, halfH - threshY); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, halfH + threshY); ctx.lineTo(W, halfH + threshY); ctx.stroke()
    ctx.setLineDash([])

    // 0 轴
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.beginPath(); ctx.moveTo(0, halfH); ctx.lineTo(W, halfH); ctx.stroke()
  }, [decoded, width, silenceRanges, noiseDb])

  const cutDur = useMemo(() => {
    if (!decoded) return 0
    const sec = decoded.durationSec / decoded.rms.length
    return silenceRanges.reduce((acc, [a, b]) => acc + (b - a + 1) * sec, 0)
  }, [decoded, silenceRanges])

  return (
    <div ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 4, gap: 8 }}>
        <span>
          真实波形 <span style={{ color: '#14b8a6', fontWeight: 600 }}>绿=保留</span> ·
          <span style={{ color: '#64748b', fontWeight: 600 }}> 灰=静音剪掉</span> ·
          <span style={{ color: '#ef4444' }}> 红虚线=阈值</span>
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>
          {decoded ? `${decoded.durationSec.toFixed(2)}s · 切除 ${cutDur.toFixed(2)}s（${silenceRanges.length} 段）` : '—'}
          {hasResult ? ' · 已应用' : ' · 预览'}
        </span>
      </div>
      <div style={{ position: 'relative', height: 120, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
        {decodeStatus === 'loading' && (
          <div style={overlayCenter}>
            <Loader size={14} style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />
            正在解码音频…
          </div>
        )}
        {decodeStatus === 'error' && (
          <div style={{ ...overlayCenter, color: '#ef4444' }}>波形解码失败：{decodeErr}</div>
        )}
        {decodeStatus === 'idle' && !src && (
          <div style={overlayCenter}>添加素材后显示真实波形</div>
        )}
      </div>
    </div>
  )
}

const overlayCenter: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.7rem', color: 'var(--text-muted)', pointerEvents: 'none',
}

// ─── 任务队列 ────────────────────────────────────────────────────────────────

function QueueView({ tasks, setTasks }: { tasks: FilterTask[]; setTasks: (t: FilterTask[]) => void }) {
  const [view, setView] = useState<FilterTask | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [downloadErr, setDownloadErr] = useState<string | null>(null)
  const [exportTask, setExportTask] = useState<FilterTask | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const deleteOne = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
    selected.delete(id); setSelected(new Set(selected))
  }
  const deleteSelected = () => {
    if (selected.size === 0) return
    setTasks(tasks.filter(t => !selected.has(t.id)))
    setSelected(new Set())
  }
  const toggle = (id: string) => {
    const n = new Set(selected); if (n.has(id)) n.delete(id); else n.add(id); setSelected(n)
  }

  const handleExport = async (t: FilterTask, prefs: ExportPrefs): Promise<void> => {
    const opt = FORMAT_OPTIONS.find(o => o.id === prefs.format)!
    const base = t.fileName.replace(/\.[^.]+$/, '')
    if (opt.kind === 'media') {
      if (!t.resultUrl) throw new Error('结果文件不存在')
      const ext = t.fileName.match(/\.([^.]+)$/)?.[1] ?? 'mp4'
      await downloadResultFile(t.resultUrl, `${base}-filtered.${ext}`)
    } else if (opt.kind === 'backend-only') {
      throw new Error(`${opt.label} 需后端支持（ffmpeg 转码/切割），尚未实装`)
    } else {
      // project
      if (!t.sourceUrl) throw new Error('原始素材 URL 缺失，无法生成工程文件')
      if (!t.analysisParams) throw new Error('分析参数缺失')
      const a = await analyzeSilence(t.sourceUrl, t.analysisParams)
      if (a.keeps.length === 0) throw new Error('未检测到任何保留段，工程文件为空')
      switch (prefs.format) {
        case 'premiere':
          downloadBlob(buildPremiereXML(t, a), `${base}.xml`, 'application/xml')
          break
        case 'finalcut':
        case 'davinci':
          downloadBlob(buildFCPXML(t, a), `${base}.fcpxml`, 'application/xml')
          break
        case 'jianying': {
          const blob = await buildJianyingZip(t, a)
          downloadBlob(blob, `${base}-jianying-draft.zip`, 'application/zip')
          break
        }
      }
    }
    saveExportPrefs(prefs)
    setToast(`${opt.label} 已导出`)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>共 {tasks.length} 条记录，已选 {selected.size}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTasks(loadTasks())} style={S.btnGhost}>
            <RefreshCw size={11} style={{ marginRight: 4 }} />刷新
          </button>
          <button onClick={deleteSelected} disabled={selected.size === 0} style={{ ...S.btnGhost, color: '#ef4444', opacity: selected.size === 0 ? 0.4 : 1 }}>
            <Trash2 size={11} style={{ marginRight: 4 }} />删除已选
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
              <th style={{ ...S.th, width: 40 }}></th>
              <th style={{ ...S.th, width: 50 }}>序号</th>
              <th style={S.th}>文件名</th>
              <th style={{ ...S.th, width: 70 }}>节奏</th>
              <th style={{ ...S.th, width: 140 }}>创建时间</th>
              <th style={{ ...S.th, width: 140 }}>完成时间</th>
              <th style={{ ...S.th, width: 70 }}>状态</th>
              <th style={{ ...S.th, width: 140 }}>过期时间</th>
              <th style={{ ...S.th, width: 130 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>暂无记录</td></tr>
            )}
            {tasks.map((t, idx) => (
              <tr key={t.id} style={{ borderBottom: idx < tasks.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={S.td} onClick={() => toggle(t.id)}>
                  {selected.has(t.id) ? <CheckSquare size={14} color="#14b8a6" /> : <Square size={14} color="var(--text-muted)" />}
                </td>
                <td style={{ ...S.td, color: 'var(--text-muted)' }}>{idx + 1}</td>
                <td style={{ ...S.td, maxWidth: 240 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.fileName}</span>
                </td>
                <td style={S.td}>{t.pacing}</td>
                <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.createdAt}</td>
                <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.completedAt ?? '—'}</td>
                <td style={S.td}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.status === 'done' ? '#22c55e' : t.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                    {t.status === 'done' ? '成功' : t.status === 'failed' ? '失败' : '处理中'}
                  </span>
                </td>
                <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.expiresAt ?? '—'}</td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.status === 'done' && t.resultUrl && (
                      <button onClick={() => setView(t)} style={S.linkBtn}>查看</button>
                    )}
                    {t.status === 'done' && t.resultUrl && (
                      <button
                        onClick={() => setExportTask(t)}
                        style={{ ...S.linkBtn, color: '#14b8a6', display: 'inline-flex', alignItems: 'center', gap: 2 }}
                      >
                        <Download size={10} />导出
                      </button>
                    )}
                    <button onClick={() => deleteOne(t.id)} style={{ ...S.linkBtn, color: '#ef4444' }}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view && (
        <Modal onClose={() => setView(null)} maxWidth={680}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 700 }}>{view.fileName}</div>
            {view.resultUrl && (
              <button
                onClick={() => setExportTask(view)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 7, border: 'none',
                  background: '#14b8a6', color: '#fff', fontSize: '0.74rem',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Download size={11} />导出
              </button>
            )}
          </div>
          {view.resultUrl && (
            view.fileName.match(/\.(mp3|wav|m4a|aac|flac|ogg|opus)$/i)
              ? <audio src={view.resultUrl} controls style={{ width: '100%' }} />
              : <video src={view.resultUrl} controls style={{ width: '100%', maxHeight: 360 }} />
          )}
          {view.msg && (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>{view.msg}</div>
          )}
        </Modal>
      )}

      {exportTask && (
        <ExportDialog
          task={exportTask}
          onClose={() => setExportTask(null)}
          onExport={handleExport}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 10000,
          background: '#0f172a', color: '#fff', padding: '10px 16px',
          borderRadius: 8, fontSize: '0.78rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>{toast}</div>
      )}
    </div>
  )
}

// ─── ExportDialog ─────────────────────────────────────────────────────────────

function ExportDialog({
  task, onClose, onExport,
}: {
  task: FilterTask
  onClose: () => void
  onExport: (t: FilterTask, prefs: ExportPrefs) => Promise<void>
}) {
  const initial = useMemo(() => loadExportPrefs(), [])
  const [format, setFormat] = useState<ExportFormat>(initial.format)
  const [location, setLocation] = useState<ExportLocation>(initial.location)
  const [path, setPath] = useState(initial.path)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const opt = FORMAT_OPTIONS.find(o => o.id === format)!
  const isProject = opt.kind === 'project'
  const isBackendOnly = opt.kind === 'backend-only'

  // 工程文件类型与后端转码任务不支持位置选择（前者走浏览器下载，后者待实装）
  const locationDisabled = isProject || isBackendOnly

  const start = async () => {
    setBusy(true); setErr(null)
    try {
      await onExport(task, { format, location, path })
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : '导出失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => !busy && onClose()}
    >
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: 14, width: '92%', maxWidth: 760,
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>导出 — {task.fileName}</div>
          <button onClick={() => !busy && onClose()} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{
          margin: '12px 22px 0', padding: '8px 12px',
          background: '#fff7e6', border: '1px solid #ffd591', borderLeft: '3px solid #faad14',
          borderRadius: 6, fontSize: '0.74rem', color: '#874d00',
        }}>本功能免费活动中，无限制导出、无广告。</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, padding: '14px 22px 4px' }}>
          {/* 导出格式 */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>导出格式</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {FORMAT_OPTIONS.map(o => {
                const active = format === o.id
                const disabled = o.kind === 'backend-only'
                const hintColor = o.kind === 'backend-only'
                  ? { color: '#92400e', bg: 'rgba(245,158,11,0.18)' }
                  : { color: '#0f766e', bg: 'rgba(20,184,166,0.12)' }
                return (
                  <label key={o.id} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '8px 10px', borderRadius: 8,
                    border: `1px solid ${active ? '#14b8a6' : 'transparent'}`,
                    background: active ? 'rgba(20,184,166,0.06)' : 'transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.55 : 1,
                  }}>
                    <input
                      type="radio" name="export-format"
                      checked={active}
                      onChange={() => !disabled && setFormat(o.id)}
                      disabled={disabled}
                      style={{ marginTop: 4, accentColor: '#14b8a6' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{o.label}</span>
                        {o.hint && (
                          <span style={{
                            fontSize: '0.66rem', color: hintColor.color,
                            background: hintColor.bg,
                            padding: '1px 6px', borderRadius: 4,
                          }}>{o.hint}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{o.desc}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 导出位置 */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>导出位置</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {LOCATION_OPTIONS.map(l => (
                <label key={l.id} style={{
                  display: 'flex', gap: 8, alignItems: 'center',
                  fontSize: '0.78rem', padding: '4px 0',
                  cursor: locationDisabled ? 'not-allowed' : 'pointer',
                  opacity: locationDisabled ? 0.5 : 1,
                }}>
                  <input
                    type="radio" name="export-location"
                    checked={location === l.id}
                    onChange={() => setLocation(l.id)}
                    disabled={locationDisabled}
                    style={{ accentColor: '#14b8a6' }}
                  />
                  <span>{l.label}</span>
                </label>
              ))}
            </div>

            {isProject && (
              <div style={{ marginTop: 10, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                工程文件通过浏览器下载到默认目录；剪映草稿需手动放入草稿目录（zip 内含 README）。
              </div>
            )}
            {isBackendOnly && (
              <div style={{ marginTop: 10, fontSize: '0.7rem', color: '#92400e' }}>
                此选项需后端 ffmpeg 实装，目前不可用。
              </div>
            )}
            {isProject && (
              <div style={{ marginTop: 8, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                工程文件 = 在剪辑软件里打开，按当前过滤参数还原剪辑点（保留段直接拼接）。需要重新解码音频分析时间码，可能耗时数秒。
              </div>
            )}

            {!locationDisabled && location !== 'with-source' && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 6 }}>请选择导出位置</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 10px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                  borderRadius: 6, color: 'var(--text-secondary)', minWidth: 0,
                }} title={path}>
                  <Folder size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{path}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button style={S.btnGhost} onClick={() => alert(`打开：${path}`)}>
                    <FolderOpen size={11} style={{ marginRight: 4 }} />打开
                  </button>
                  <button style={S.btnPrimary} onClick={() => {
                    const next = prompt('修改导出路径', path)
                    if (next) setPath(next)
                  }}>修改</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {err && (
          <div style={{ ...S.errBox, margin: '0 22px 8px' }}>
            <AlertCircle size={12} />{err}
          </div>
        )}

        <div style={{
          padding: '12px 22px', borderTop: '1px solid var(--border-light)',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <button onClick={() => !busy && onClose()} style={S.btnGhost} disabled={busy}>关闭</button>
          <button onClick={start} style={{ ...S.btnPrimary, opacity: (busy || isBackendOnly) ? 0.6 : 1 }} disabled={busy || isBackendOnly}>
            {busy
              ? <><Loader size={11} style={{ marginRight: 4, animation: 'spin 1s linear infinite' }} />导出中</>
              : <><Download size={11} style={{ marginRight: 4 }} />开始导出</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ children, onClose, maxWidth = 480 }: { children: React.ReactNode; onClose: () => void; maxWidth?: number }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', width: '90%', maxWidth, padding: '20px 22px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  )
}

// ─── 样式 ─────────────────────────────────────────────────────────────────────

const S = {
  backBtn:  { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  tab:      { padding: '10px 20px', border: 'none', background: 'transparent', fontSize: '0.84rem', color: 'var(--text-muted)', cursor: 'pointer', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: 'transparent', marginBottom: -2, fontWeight: 500 } as React.CSSProperties,
  tabActive:{ color: '#14b8a6', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: '#14b8a6', fontWeight: 700 } as React.CSSProperties,
  card:     { background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost: { display: 'inline-flex', alignItems: 'center', padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.76rem', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  iconBtn:  { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer' } as React.CSSProperties,
  linkBtn:  { background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '0.72rem', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline', textUnderlineOffset: 2 } as React.CSSProperties,
  checkLabel: { display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' as const } as React.CSSProperties,
  errBox:   { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, fontSize: '0.72rem', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' } as React.CSSProperties,
  th:       { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const },
  td:       { padding: '8px 12px', verticalAlign: 'middle' as const },
}
