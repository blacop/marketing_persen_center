import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, RefreshCw, Download, FileText, Scissors, Trash2,
  Video, Image, Music, ExternalLink, FolderOpen, Eye, AlertCircle,
  CheckSquare, Square, X, Zap,
} from 'lucide-react'
import { cmRemote } from '../../../lib/cm/cmApi'

// ─── Mock 文案样本 ────────────────────────────────────────────────────────────

const MOCK_CAPTIONS = [
  '这款产品真的太绝了！用了一周皮肤状态明显改善，毛孔细了，肤色也亮了很多。每天早晚各用一次，配合精华效果翻倍。非常推荐给熬夜党和皮肤敏感的姐妹们！',
  '实测好物分享！这个面霜成分干净，适合敏感肌，上脸不油腻，保湿力超强。尤其是秋冬换季皮肤干到爆的时候，一抹就救了！价格也很友好，强烈安利！',
  '好用到哭的一款精华！滴管设计很卫生，质地轻薄好吸收，一点都不粘。坚持用了两个月，细纹淡了，皮肤弹性变好了。这绝对是我今年回购最多的护肤品！',
  '种草了好久终于入手！外包装简约高级，开盖就是淡淡的香味，不刺激。涂抹均匀后皮肤像喝饱水一样，第二天早起皮肤还是水润的状态。真的值得买！',
]

// ─── 类型定义 ────────────────────────────────────────────────────────────────

type MediaType = 'video' | 'image' | 'audio'
type TaskStatus = 'pending' | 'downloading' | 'done' | 'failed'

interface LinkIngestItem {
  id: string
  title: string
  sourceUrl: string
  mediaType: MediaType
  createdAt: string
  downloadStatus: TaskStatus
  downloadProgress: number
  downloadUrl?: string
  quality: string
  captionStatus: TaskStatus
  captionProgress: number
  captionText?: string
  // 真实后端字段
  platform?: string
  mediaUrl?: string
  assetCode?: string
  streamUrl?: string
  audioAssetCode?: string
  audioUrl?: string
  thumbnailUrl?: string
  durationSec?: number
  width?: number
  height?: number
  errMsg?: string
}

// ─── 本地存储 ────────────────────────────────────────────────────────────────

const STORE_KEY = 'cm_link_ingest_tasks'

function loadTasks(): LinkIngestItem[] {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] }
}
function saveTasks(items: LinkIngestItem[]): void {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
}
function uid(): string {
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── 链接解析 ────────────────────────────────────────────────────────────────

function extractUrls(raw: string): string[] {
  // 自动清洗无关文本，提取 http/https 链接
  const matches = raw.match(/https?:\/\/[^\s，。,\n\r]+/g) ?? []
  return [...new Set(matches.map(u => u.trim()).filter(Boolean))]
}

function removeEmoji(str: string): string {
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim()
}

// 从 URL 推测标题（取域名+路径末段，后续后端返回真实标题）
function guessTitle(url: string, stripEmoji: boolean): string {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    const raw = parts.length > 0 ? `#${parts[parts.length - 1]}` : u.hostname
    return stripEmoji ? removeEmoji(raw) : raw
  } catch {
    const raw = url.slice(0, 30)
    return stripEmoji ? removeEmoji(raw) : raw
  }
}

// ─── 后端 API stub（后端上线后替换） ─────────────────────────────────────────

async function apiCreateTasks(urls: string[], opts: {
  autoDownload: boolean
  autoCaption: boolean
  stripEmoji: boolean
}): Promise<LinkIngestItem[]> {
  const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '/').replace(',', '')
  // 调真实后端解析
  try {
    const parsed = await cmRemote.linkIngestParse({ urls, stripEmoji: opts.stripEmoji })
    return parsed.map(p => ({
      id: uid(),
      title: p.title ?? guessTitle(p.sourceUrl, opts.stripEmoji),
      sourceUrl: p.sourceUrl,
      platform: p.platform,
      mediaType: (p.mediaType as MediaType) ?? 'video',
      mediaUrl: p.mediaUrl,
      createdAt: now,
      downloadStatus: p.errMsg ? 'failed' : (opts.autoDownload ? 'downloading' : 'pending'),
      downloadProgress: 0,
      quality: '1080p',
      captionStatus: p.errMsg ? 'failed' : (opts.autoCaption ? 'downloading' : 'pending'),
      captionProgress: 0,
      durationSec: p.durationSec,
      errMsg: p.errMsg,
    }))
  } catch (e) {
    console.warn('[LinkIngest] parse failed, fallback to mock:', e)
  }

  // 兜底 mock（保留旧行为防止后端宕机阻塞前端）
  const items: LinkIngestItem[] = []
  for (const url of urls) {
    const baseTitle = guessTitle(url, opts.stripEmoji)
    const types: MediaType[] = ['video', 'image', 'audio']
    for (const mediaType of types) {
      items.push({
        id: uid(), title: baseTitle, sourceUrl: url, mediaType, createdAt: now,
        downloadStatus: opts.autoDownload ? 'downloading' : 'pending',
        downloadProgress: 0, quality: '1080p',
        captionStatus: opts.autoCaption && mediaType !== 'image' ? 'downloading' : 'pending',
        captionProgress: 0,
      })
    }
  }
  return items
}

// ─── 分页常量 ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function LinkIngest() {
  const nav = useNavigate()

  // 输入区
  const [linkText, setLinkText] = useState('')
  const [autoDownload, setAutoDownload] = useState(false)
  const [stripEmoji, setStripEmoji] = useState(true)
  const [autoCaption, setAutoCaption] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState<string | null>(null)

  // 任务列表
  const [tasks, setTasks] = useState<LinkIngestItem[]>(() => loadTasks())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  // 文案预览弹窗
  const [captionModal, setCaptionModal] = useState<{ text: string; title: string } | null>(null)
  // 封面 / 音频预览
  const [thumbModal, setThumbModal] = useState<{ url: string; title: string } | null>(null)
  const [audioModal, setAudioModal] = useState<{ url: string; title: string } | null>(null)

  // 进度模拟 ticker
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 持久化
  useEffect(() => { saveTasks(tasks) }, [tasks])

  // 模拟进度推进
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTasks(prev => {
        let changed = false
        const next = prev.map(t => {
          // 进度伪推进：只在真实后端响应前用作视觉反馈，封顶 90%。
          // 真实后端在 startDownload/startCaption 收到结果时把状态设为 done/failed。
          let { downloadProgress, captionProgress } = t
          if (t.downloadStatus === 'downloading' && downloadProgress < 90) {
            downloadProgress = Math.min(90, downloadProgress + Math.random() * 5 + 1)
            changed = true
          }
          if (t.captionStatus === 'downloading' && captionProgress < 90) {
            captionProgress = Math.min(90, captionProgress + Math.random() * 4 + 1)
            changed = true
          }
          return { ...t, downloadProgress, captionProgress }
        })
        return changed ? next : prev
      })
    }, 800)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  // ─── 操作处理 ──────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    const urls = extractUrls(linkText)
    if (urls.length === 0) { setCreateErr('未检测到有效链接，请粘贴 http/https 地址'); return }
    setCreating(true); setCreateErr(null)
    try {
      const items = await apiCreateTasks(urls, { autoDownload, autoCaption, stripEmoji })
      setTasks(prev => [...items, ...prev])
      setLinkText('')
      setPage(1)
    } catch (e) {
      setCreateErr(e instanceof Error ? e.message : '创建失败')
    } finally { setCreating(false) }
  }

  const startDownload = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task || task.downloadStatus !== 'pending') return
    setTasks(prev => prev.map(t => t.id === id ? { ...t, downloadStatus: 'downloading', downloadProgress: 5 } : t))
    try {
      const res = await cmRemote.linkIngestDownload({
        sourceUrl: task.sourceUrl, mediaUrl: task.mediaUrl, title: task.title, platform: task.platform,
      })
      if (res.status === 'SUCCEEDED' && res.assetCode) {
        setTasks(prev => prev.map(t => t.id === id ? {
          ...t, downloadStatus: 'done', downloadProgress: 100,
          assetCode: res.assetCode, streamUrl: res.streamUrl, durationSec: res.durationSec,
          audioAssetCode: res.audioAssetCode, audioUrl: res.audioStreamUrl,
          thumbnailUrl: res.thumbnailUrl,
          width: res.width, height: res.height,
        } : t))
      } else {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, downloadStatus: 'failed', errMsg: res.errMsg } : t))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '下载失败'
      setTasks(prev => prev.map(t => t.id === id ? { ...t, downloadStatus: 'failed', errMsg: msg } : t))
    }
  }

  const startCaption = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task || task.captionStatus !== 'pending' || task.downloadStatus !== 'done' || !task.assetCode) return
    setTasks(prev => prev.map(t => t.id === id ? { ...t, captionStatus: 'downloading', captionProgress: 10 } : t))
    try {
      const res = await cmRemote.linkIngestTranscribe({ inputAssetCode: task.assetCode })
      if (res.status === 'SUCCEEDED') {
        setTasks(prev => prev.map(t => t.id === id ? {
          ...t, captionStatus: 'done', captionProgress: 100, captionText: res.captionText,
        } : t))
      } else {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, captionStatus: 'failed', errMsg: res.errMsg } : t))
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '转写失败'
      setTasks(prev => prev.map(t => t.id === id ? { ...t, captionStatus: 'failed', errMsg: msg } : t))
    }
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  const setQuality = (id: string, q: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, quality: q } : t))
  }

  // 批量
  const batchDownload = () => {
    const ids = selected.size > 0 ? selected : new Set(paginated.map(t => t.id))
    setTasks(prev => prev.map(t =>
      ids.has(t.id) && t.downloadStatus === 'pending'
        ? { ...t, downloadStatus: 'downloading', downloadProgress: 0 } : t))
  }
  const batchCaption = () => {
    const ids = selected.size > 0 ? selected : new Set(paginated.map(t => t.id))
    setTasks(prev => prev.map(t =>
      ids.has(t.id) && t.captionStatus === 'pending' && t.mediaType !== 'image' && t.downloadStatus === 'done'
        ? { ...t, captionStatus: 'downloading', captionProgress: 0 } : t))
  }
  const batchDelete = () => {
    const ids = selected.size > 0 ? selected : new Set<string>()
    if (ids.size === 0) return
    setTasks(prev => prev.filter(t => !ids.has(t.id)))
    setSelected(new Set())
  }

  // 全选当前页
  const toggleSelectAll = useCallback(() => {
    const pageIds = paginated.map(t => t.id)
    const allSelected = pageIds.every(id => selected.has(id))
    const next = new Set(selected)
    if (allSelected) pageIds.forEach(id => next.delete(id))
    else pageIds.forEach(id => next.add(id))
    setSelected(next)
  }, [selected, tasks, page]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  // ─── 派生数据 ──────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE))
  const paginated = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const dlActive = tasks.filter(t => t.downloadStatus === 'downloading').length
  const dlDone = tasks.filter(t => t.downloadStatus === 'done').length
  const dlFailed = tasks.filter(t => t.downloadStatus === 'failed').length
  const dlTotal = tasks.length
  const dlProgress = dlTotal === 0 ? 0 : Math.round((dlDone / dlTotal) * 100)

  const capActive = tasks.filter(t => t.captionStatus === 'downloading').length
  const capDone = tasks.filter(t => t.captionStatus === 'done').length
  const capFailed = tasks.filter(t => t.captionStatus === 'failed').length

  const pageAllSelected = paginated.length > 0 && paginated.every(t => selected.has(t.id))

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1500, margin: '0 auto' }}>
      {/* 返回 */}
      <button onClick={() => nav('/cutmatrix')} style={css.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      {/* 标题 */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
          <Download size={20} color="#14b8a6" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          提取视频及文案
          <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>Step 1 / 7</span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          粘贴 top 视频链接，批量抓取无水印媒体并自动转写口播文案入库。
        </div>
      </div>

      {/* 输入区 */}
      <div style={{ ...css.card, marginBottom: 16 }}>
        <textarea
          value={linkText}
          onChange={e => setLinkText(e.target.value)}
          placeholder="在这里粘贴链接，支持多条，自动清洗无关文本"
          style={css.textarea}
          rows={5}
        />

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 24px', marginTop: 12 }}>
          <label style={css.checkLabel}>
            <input type="checkbox" checked={autoDownload} onChange={e => setAutoDownload(e.target.checked)} style={{ marginRight: 6 }} />
            创建任务后自动开始下载
          </label>
          <label style={css.checkLabel}>
            <input type="checkbox" checked={stripEmoji} onChange={e => setStripEmoji(e.target.checked)} style={{ marginRight: 6 }} />
            <span>
              自动去除文件名中的表情符号
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 4 }}>推荐勾选，防止后续剪辑流程出现兼容问题</span>
            </span>
          </label>
          <label style={css.checkLabel}>
            <input type="checkbox" checked={autoCaption} onChange={e => setAutoCaption(e.target.checked)} style={{ marginRight: 6 }} />
            创建任务后自动开始提取文案
          </label>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleCreate}
              disabled={creating || !linkText.trim()}
              style={{ ...css.btnPrimary, background: '#14b8a6', padding: '9px 22px', fontSize: '0.85rem', opacity: creating || !linkText.trim() ? 0.6 : 1 }}
            >
              {creating ? '创建中…' : '创建任务'}
            </button>
          </div>
        </div>

        {createErr && (
          <div style={{ ...css.errBox, marginTop: 10 }}>
            <AlertCircle size={13} /> {createErr}
          </div>
        )}
      </div>

      {/* 进度汇总 */}
      <div style={{ ...css.card, marginBottom: 16, display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <ProgressRow
          label="下载总进度"
          progress={dlProgress}
          idle={dlActive === 0}
          summary={dlActive > 0 ? `处理中 ${dlActive}，完成 ${dlDone}，失败 ${dlFailed}` : '空闲'}
        />
        <div style={{ width: 1, height: 32, background: 'var(--border-light)' }} />
        <ProgressRow
          label="文案总进度"
          progress={capDone + capActive === 0 ? 0 : Math.round((capDone / Math.max(1, capDone + capActive + capFailed)) * 100)}
          idle={capActive === 0}
          summary={`处理中 ${capActive}，完成 ${capDone}，失败 ${capFailed}`}
        />
      </div>

      {/* 批量操作栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          当前页已选 {paginated.filter(t => selected.has(t.id)).length} 条
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setTasks(loadTasks())} style={css.btnGhost}>
            <RefreshCw size={12} style={{ marginRight: 4 }} />刷新
          </button>
          <button onClick={batchDownload} style={css.btnGhost}>
            <Download size={12} style={{ marginRight: 4 }} />批量下载
          </button>
          <button onClick={batchCaption} style={css.btnGhost}>
            <FileText size={12} style={{ marginRight: 4 }} />批量提取文案
          </button>
          <button style={css.btnGhost}>
            <Scissors size={12} style={{ marginRight: 4 }} />批量擦除字幕
          </button>
          <button
            onClick={batchDelete}
            disabled={selected.size === 0}
            style={{ ...css.btnGhost, color: '#ef4444', opacity: selected.size === 0 ? 0.4 : 1 }}
          >
            <Trash2 size={12} style={{ marginRight: 4 }} />批量删除
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div style={{ ...css.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ ...css.th, width: 36 }}>
                <span onClick={toggleSelectAll} style={{ cursor: 'pointer' }}>
                  {pageAllSelected
                    ? <CheckSquare size={14} color="#14b8a6" />
                    : <Square size={14} color="var(--text-muted)" />}
                </span>
              </th>
              <th style={css.th}>标题</th>
              <th style={css.th}>来源URL</th>
              <th style={{ ...css.th, width: 50 }}>类型</th>
              <th style={{ ...css.th, width: 130 }}>创建时间</th>
              <th style={{ ...css.th, width: 260 }}>下载 / 擦除字幕</th>
              <th style={{ ...css.th, width: 200 }}>提取文案</th>
              <th style={{ ...css.th, width: 90 }}>其他</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  暂无任务，粘贴链接后点击「创建任务」
                </td>
              </tr>
            )}
            {paginated.map((t, idx) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: idx < paginated.length - 1 ? '1px solid var(--border-light)' : 'none',
                  background: selected.has(t.id) ? 'rgba(20,184,166,0.04)' : 'transparent',
                }}
              >
                {/* 复选 */}
                <td style={css.td} onClick={() => toggleOne(t.id)} className="cursor-pointer">
                  {selected.has(t.id)
                    ? <CheckSquare size={14} color="#14b8a6" style={{ cursor: 'pointer' }} />
                    : <Square size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                </td>

                {/* 标题 */}
                <td style={{ ...css.td, maxWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t.thumbnailUrl ? (
                      <img
                        src={t.thumbnailUrl}
                        alt=""
                        onClick={() => setThumbModal({ url: t.thumbnailUrl!, title: t.title })}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0, cursor: 'pointer', border: '1px solid var(--border-light)' }}
                      />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 4, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MediaIcon type={t.mediaType} />
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }} title={t.title}>
                        {t.title || '—'}
                      </div>
                      {t.audioUrl && (
                        <button
                          onClick={() => setAudioModal({ url: t.audioUrl!, title: t.title })}
                          style={{ ...css.linkBtn, padding: '1px 4px', marginTop: 2, fontSize: '0.66rem' }}
                        >
                          <Music size={9} style={{ marginRight: 2 }} />听音频
                        </button>
                      )}
                    </div>
                  </div>
                </td>

                {/* 来源URL */}
                <td style={{ ...css.td, maxWidth: 180 }}>
                  <a
                    href={t.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#14b8a6', textDecoration: 'none', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 170 }}
                    title={t.sourceUrl}
                  >
                    {t.sourceUrl}
                  </a>
                </td>

                {/* 类型 */}
                <td style={{ ...css.td, textAlign: 'center' }}>
                  <MediaIcon type={t.mediaType} />
                </td>

                {/* 创建时间 */}
                <td style={{ ...css.td, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {t.createdAt}
                </td>

                {/* 下载 / 擦除字幕 */}
                <td style={css.td}>
                  <DownloadCell item={t} onStart={() => startDownload(t.id)} onQuality={q => setQuality(t.id, q)} onErase={() => nav('/cutmatrix/wf/subtitle-erase', { state: { videoUrl: t.sourceUrl, title: t.title } })} />
                </td>

                {/* 提取文案 */}
                <td style={css.td}>
                  <CaptionCell
                    item={t}
                    onStart={() => startCaption(t.id)}
                    onViewCaption={() => setCaptionModal({ text: t.captionText ?? '', title: t.title })}
                    onFission={() => nav('/cutmatrix/wf/script-fission', { state: { captionText: t.captionText, title: t.title } })}
                  />
                </td>

                {/* 其他 */}
                <td style={css.td}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {t.mediaType === 'image' && t.downloadStatus === 'done' && (
                      <button style={css.linkBtn}><Eye size={11} style={{ marginRight: 2 }} />预览</button>
                    )}
                    <button onClick={() => deleteTask(t.id)} style={{ ...css.linkBtn, color: '#ef4444' }}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>共 {tasks.length} 条</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...css.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
          >上一页</button>
          <span style={{ padding: '4px 10px', borderRadius: 6, background: '#14b8a6', color: '#fff', fontWeight: 700, fontSize: '0.74rem' }}>{page}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...css.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
          >下一页</button>
        </div>
      </div>

      {/* 文案预览弹窗 */}
      {captionModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setCaptionModal(null)}
        >
          <div
            style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', width: '90%', maxWidth: 560, padding: '22px 24px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setCaptionModal(null)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={16} />
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>提取文案</div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 14, paddingRight: 24 }}>{captionModal.title || '—'}</div>
            <div style={{ fontSize: '0.84rem', lineHeight: 1.9, color: 'var(--text-primary)', background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', minHeight: 80, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {captionModal.text || '（暂无文案）'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={() => setCaptionModal(null)} style={{ ...css.btnGhost, fontSize: '0.78rem' }}>关闭</button>
              <button
                onClick={() => {
                  setCaptionModal(null)
                  nav('/cutmatrix/wf/script-fission', { state: { captionText: captionModal.text, title: captionModal.title } })
                }}
                style={{ ...css.btnPrimary, background: '#14b8a6', fontSize: '0.78rem', gap: 5 }}
              >
                <Zap size={13} />前往裂变
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 封面预览弹窗 */}
      {thumbModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setThumbModal(null)}
        >
          <div
            style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16, position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setThumbModal(null)}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', color: '#fff', padding: 4, borderRadius: 4 }}
            >
              <X size={16} />
            </button>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 10 }}>{thumbModal.title || '封面'}</div>
            <img src={thumbModal.url} alt="" style={{ maxWidth: '85vw', maxHeight: '75vh', display: 'block', borderRadius: 8 }} />
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <a href={thumbModal.url} download style={{ ...css.linkBtn, fontSize: '0.74rem' }}>
                <Download size={11} style={{ marginRight: 3 }} />下载封面
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 音频预览弹窗 */}
      {audioModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setAudioModal(null)}
        >
          <div
            style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', width: '90%', maxWidth: 480, padding: '22px 24px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setAudioModal(null)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            >
              <X size={16} />
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>抽取音频</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14, paddingRight: 24 }}>{audioModal.title || '—'}</div>
            <audio src={audioModal.url} controls style={{ width: '100%' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <a href={audioModal.url} download style={{ ...css.btnGhost, fontSize: '0.76rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Download size={12} />下载 MP3
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 子组件 ──────────────────────────────────────────────────────────────────

function ProgressRow({ label, progress, idle, summary }: { label: string; progress: number; idle: boolean; summary: string }) {
  return (
    <div style={{ flex: 1, minWidth: 240 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.76rem' }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: idle ? 'var(--text-muted)' : '#14b8a6', fontSize: '0.72rem' }}>{summary}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: idle ? 'var(--border-light)' : 'linear-gradient(90deg,#14b8a6,#06b6d4)', width: `${progress}%`, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function MediaIcon({ type }: { type: MediaType }) {
  if (type === 'video') return <Video size={16} color="var(--accent-primary)" />
  if (type === 'image') return <Image size={16} color="#f59e0b" />
  return <Music size={16} color="#14b8a6" />
}

const QUALITY_OPTIONS = ['360p', '480p', '720p', '1080p', '1080p 1080p（视频）']

function DownloadCell({ item, onStart, onQuality, onErase }: {
  item: LinkIngestItem
  onStart: () => void
  onQuality: (q: string) => void
  onErase?: () => void
}) {
  if (item.mediaType !== 'video') {
    // 图片 / 音频
    if (item.downloadStatus === 'pending' || item.downloadStatus === 'failed') {
      return (
        <button onClick={onStart} style={css.linkBtn}>
          <Download size={11} style={{ marginRight: 3 }} />下载
        </button>
      )
    }
    if (item.downloadStatus === 'downloading') {
      return <MiniProgress value={item.downloadProgress} />
    }
    return <span style={{ fontSize: '0.72rem', color: '#22c55e' }}>已完成</span>
  }

  // 视频
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {(item.downloadStatus === 'pending' || item.downloadStatus === 'failed') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            value={item.quality}
            onChange={e => onQuality(e.target.value)}
            style={{ ...css.select, fontSize: '0.72rem', padding: '3px 6px' }}
          >
            {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={onStart} style={css.linkBtn}>下载</button>
        </div>
      )}
      {item.downloadStatus === 'downloading' && (
        <div>
          <select value={item.quality} onChange={e => onQuality(e.target.value)} style={{ ...css.select, fontSize: '0.72rem', padding: '3px 6px', marginBottom: 4 }}>
            {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <MiniProgress value={item.downloadProgress} />
        </div>
      )}
      {item.downloadStatus === 'done' && (
        <div>
          <select value={item.quality} onChange={e => onQuality(e.target.value)} style={{ ...css.select, fontSize: '0.72rem', padding: '3px 6px', marginBottom: 4 }}>
            {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button style={css.linkBtn}><ExternalLink size={10} style={{ marginRight: 2 }} />打开</button>
            <button style={css.linkBtn}><FolderOpen size={10} style={{ marginRight: 2 }} />打开文件夹</button>
            <button onClick={onErase} style={css.linkBtn}><Scissors size={10} style={{ marginRight: 2 }} />擦除字幕</button>
          </div>
        </div>
      )}
    </div>
  )
}

function CaptionCell({ item, onStart, onViewCaption, onFission }: {
  item: LinkIngestItem
  onStart: () => void
  onViewCaption?: () => void
  onFission?: () => void
}) {
  if (item.mediaType === 'image') {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>—</span>
  }
  if (item.captionStatus === 'pending') {
    if (item.downloadStatus !== 'done') {
      return <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>下载后可提取</span>
    }
    return (
      <button onClick={onStart} style={css.linkBtn}>
        <FileText size={11} style={{ marginRight: 3 }} />提取文案
      </button>
    )
  }
  if (item.captionStatus === 'downloading') {
    return <MiniProgress value={item.captionProgress} label="处理中" color="var(--accent-primary)" />
  }
  if (item.captionStatus === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button onClick={onViewCaption} style={css.linkBtn}>
            <Eye size={10} style={{ marginRight: 2 }} />查看文案
          </button>
          <button onClick={onFission} style={{ ...css.linkBtn, color: 'var(--accent-primary)' }}>
            <Zap size={10} style={{ marginRight: 2 }} />前往裂变
          </button>
        </div>
        {item.captionText && (
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.captionText}
          </div>
        )}
      </div>
    )
  }
  return <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>失败</span>
}

function MiniProgress({ value, label = '处理中', color = '#14b8a6' }: { value: number; label?: string; color?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>
        <span>{label}</span><span>{Math.round(value)}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'var(--bg-secondary)', overflow: 'hidden', width: 120 }}>
        <div style={{ height: '100%', borderRadius: 99, background: color, width: `${value}%`, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ─── 样式 ─────────────────────────────────────────────────────────────────────

const css = {
  card: {
    background: 'var(--bg-card)',
    borderRadius: 12,
    border: '1px solid var(--border-light)',
    padding: '14px 16px',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-light)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    lineHeight: 1.6,
  } as React.CSSProperties,
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.78rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    userSelect: 'none',
  } as React.CSSProperties,
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#14b8a6',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: 7,
    border: '1px solid var(--border-light)',
    background: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    fontSize: '0.74rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: 4,
    border: 'none',
    background: 'transparent',
    color: '#14b8a6',
    fontSize: '0.72rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  } as React.CSSProperties,
  select: {
    padding: '4px 8px',
    borderRadius: 6,
    border: '1px solid var(--border-light)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.78rem',
    outline: 'none',
  } as React.CSSProperties,
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: 14,
    padding: '5px 12px',
    borderRadius: 7,
    border: '1px solid var(--border-light)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.74rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  errBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 7,
    fontSize: '0.74rem',
    background: 'rgba(239,68,68,0.08)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
  } as React.CSSProperties,
  th: {
    padding: '10px 12px',
    textAlign: 'left' as const,
    fontWeight: 600,
    fontSize: '0.74rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle' as const,
  },
  pageBtn: {
    padding: '4px 12px',
    borderRadius: 6,
    border: '1px solid var(--border-light)',
    background: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    fontSize: '0.74rem',
    cursor: 'pointer',
  } as React.CSSProperties,
}
