import { useEffect, useRef, useState } from 'react'
import {
  Copy, Paperclip, RotateCcw, Send, ThumbsDown, ThumbsUp, X,
} from 'lucide-react'
import {
  agentApi,
  videoAssetApi,
  invokeAgentStream,
  getVideoStreamUrl,
  type AgentConversationTurn,
  type VideoDeconstructionTask,
  type VideoSegment,
} from '../lib/agentApi'
import { buildBeukayClawMessage, formatAttachmentSize, readBeukayClawAttachment, type BeukayClawAttachment } from '../lib/beukayClawAttachments'
import SegmentClip from '../components/SegmentClip'

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: number
  type: 'user' | 'assistant'
  content: string
  time: string
  /** 拆解结果附带的源视频可播放 URL（通过 getVideoStreamUrl 生成） */
  videoUrl?: string
  /** 拆解出的片段（详情接口返回，用于片段预览） */
  segments?: VideoSegment[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_AGENT_ID = 'beukay-claw'
const DISPLAY_AGENT_NAME = 'Beukay agent'
const CLAW_ICON = '💄'
const THINKING_PLACEHOLDER = '⏳ Hermes 正在调用工具，请稍候…'

const SUGGESTIONS = [
  '帮我为 skuId=SEED_CUSHION_2 生成脚本蓝图，平台是小红书，目标人群是25-35岁敏感肌女性',
  '根据 blueprintCode=BP_RUNTIME_DEMO_001 生成视频装配方案',
  '分析最近一周唇釉投放 ROI 下滑原因，给出优化建议',
  '拆解视频 recordId=12 / skuId=LIP_GLOSS_105，识别 Hook 类型和卖点标签',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function isVideoFile(file: File) {
  return file.type.startsWith('video/')
}

function isTerminalTask(task: VideoDeconstructionTask) {
  return task.status === 'SUCCEEDED' || task.status === 'FAILED'
}

async function pollTask(
  initialTask: VideoDeconstructionTask,
  onUpdate: (t: VideoDeconstructionTask) => void,
): Promise<VideoDeconstructionTask> {
  let task = initialTask
  onUpdate(task)
  if (isTerminalTask(task)) return task
  for (let i = 0; i < 90; i++) {
    await sleep(2000)
    task = await agentApi.getVideoUnderstandingTask(initialTask.taskId)
    onUpdate(task)
    if (isTerminalTask(task)) return task
  }
  throw new Error('视频拆解轮询超时')
}

function makeWelcome(): ChatMessage {
  return {
    id: 1,
    type: 'assistant',
    content: `你好😉 我是 **${DISPLAY_AGENT_NAME}**，采用 **Hermes Tool Calling** 架构，可以自主调用多个专项 Agent 工具完成任务：\n\n- 🎥 **视频拆解** — 上传视频，自动拆解 Hook / 卖点 / 片段\n- 🧩 **结构卡生成** — 基于拆解结果生成内容结构卡\n- ⚡ **脚本蓝图** — 生成针对特定人群和平台的脚本框架\n- 🎬 **视频装配** — 基于蓝图自动装配视频\n- 📊 **千川投放 & 数据分析** — 投放策略与效果分析\n\n直接描述你的目标，或上传视频文件开始处理。`,
    time: nowTime(),
  }
}

function formatUserContent(content: string, attachments: BeukayClawAttachment[]) {
  if (attachments.length === 0) return content
  const fileSummary = attachments.map(f => `📎 ${f.name}（${formatAttachmentSize(f.size)}）`).join('\n')
  return `${content || '请处理这些上传文件'}\n\n${fileSummary}`
}

// ── Text formatting ────────────────────────────────────────────────────────────

function formatContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
          <span style={{ color: '#e8365d', flexShrink: 0 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      )
    }
    if (line === '' || line === '---') return <div key={i} style={{ height: 6 }} />
    return (
      <div key={i} style={{ marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    )
  })
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BeukayClaw() {
  const [messages, setMessages] = useState<ChatMessage[]>([makeWelcome()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<BeukayClawAttachment[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoSkuId, setVideoSkuId] = useState('SEED_CUSHION_2')
  const [attachmentLoading, setAttachmentLoading] = useState(false)
  const [feedbackMap, setFeedbackMap] = useState<Map<number, 'helpful' | 'unhelpful'>>(new Map())
  const [toast, setToast] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Build conversation history ────────────────────────────────────────────

  function buildHistory(): AgentConversationTurn[] {
    return messages
      .filter(m => m.id !== 1 && (m.type === 'user' || m.type === 'assistant'))
      .slice(-20)
      .map(m => ({ role: m.type as 'user' | 'assistant', content: m.content }))
      .filter(m => m.content)
  }

  // ── Send message ──────────────────────────────────────────────────────────

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if ((!content && attachments.length === 0 && !videoFile) || loading || attachmentLoading) return

    setInput('')
    setError(null)

    // ── Video file path: upload → poll → inject result → call agent ──────────
    if (videoFile && !text) {
      const file = videoFile
      const skuId = videoSkuId.trim() || 'UNKNOWN'
      setVideoFile(null)
      setAttachments([])

      const userContent = content || `请分析视频并完成全链路内容生成（skuId=${skuId}）`
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'user',
        content: `🎬 ${file.name}（skuId=${skuId}）\n${userContent}`,
        time: nowTime(),
      }])
      setLoading(true)

      const baseTs = Date.now()
      const uploadMsgId = baseTs + 1
      const streamMsgId = baseTs + 2
      setMessages(prev => [...prev, {
        id: uploadMsgId,
        type: 'assistant',
        content: `✅ 视频上传成功，正在拆解分析…（任务 ID 将在此更新）`,
        time: nowTime(),
      }])

      try {
        const submitted = await agentApi.submitVideoUnderstandingUpload(file, skuId)
        setMessages(prev => prev.map(m =>
          m.id === uploadMsgId
            ? { ...m, content: `✅ 视频上传成功，正在拆解分析…（任务 ID: \`${submitted.taskId}\`）` }
            : m
        ))

        const finalTask = await pollTask(submitted, () => {})

        if (finalTask.status !== 'SUCCEEDED' || !finalTask.result) {
          throw new Error(finalTask.errorMessage ?? finalTask.statusMessage ?? '视频拆解失败')
        }

        const r = finalTask.result

        // ── 1. 展示拆解结果给用户 ──────────────────────────────────────────
        const deconSummaryLines = [
          `✅ **视频拆解完成**（skuId=${skuId}）`,
          '',
          r.hookType ? `- **Hook 类型**：${r.hookType}` : null,
          r.titlePattern ? `- **标题模式**：${r.titlePattern}` : null,
          r.sceneTags ? `- **场景标签**：${r.sceneTags}` : null,
          r.sellingPointTags ? `- **卖点标签**：${r.sellingPointTags}` : null,
          r.emotionTags ? `- **情感标签**：${r.emotionTags}` : null,
          r.targetAudienceTags ? `- **目标受众**：${r.targetAudienceTags}` : null,
        ].filter((l): l is string => l !== null).join('\n')

        // videoId = taskId，转为流式 URL 供 <video> 播放
        const videoUrl = getVideoStreamUrl(r.videoId)
        setMessages(prev => prev.map(m =>
          m.id === uploadMsgId ? { ...m, content: deconSummaryLines, videoUrl } : m
        ))

        // 拉取拆解详情，把 segments 渲染成可独立播放的拆解片段缩略
        if (r.id) {
          videoAssetApi.getDeconstructionDetail(r.id)
            .then(detail => {
              if (detail.segments?.length) {
                setMessages(prev => prev.map(m =>
                  m.id === uploadMsgId ? { ...m, segments: detail.segments } : m
                ))
              }
            })
            .catch(() => {/* segments 获取失败不阻塞主流程 */})
        }

        // ── 2. 构建富上下文消息，交由 Hermes 自主调用后续 Agent ────────────
        const enrichedMsg = [
          userContent,
          '',
          `[视频拆解完成 skuId=${skuId}]`,
          `Hook类型: ${r.hookType ?? '—'}`,
          `标题模式: ${r.titlePattern ?? '—'}`,
          `场景标签: ${r.sceneTags ?? '—'}`,
          `卖点标签: ${r.sellingPointTags ?? '—'}`,
          `情感标签: ${r.emotionTags ?? '—'}`,
          `目标受众: ${r.targetAudienceTags ?? '—'}`,
          `请继续执行：结构卡生成 → 脚本蓝图 → 视频装配`,
        ].join('\n')

        const historySnap = buildHistory()
        setMessages(prev => [...prev, { id: streamMsgId, type: 'assistant', content: THINKING_PLACEHOLDER, time: nowTime() }])

        for await (const chunk of invokeAgentStream(DEFAULT_AGENT_ID, enrichedMsg, historySnap)) {
          setMessages(prev => prev.map(m => {
            if (m.id !== streamMsgId) return m
            const isPlaceholder = m.content === THINKING_PLACEHOLDER
            return { ...m, content: isPlaceholder ? chunk + '\n' : m.content + chunk + '\n' }
          }))
        }
        setMessages(prev => prev.map(m => {
          if (m.id !== streamMsgId) return m
          const trimmed = m.content.trimEnd()
          return { ...m, content: trimmed === THINKING_PLACEHOLDER ? '' : trimmed }
        }))
      } catch (e) {
        const raw = e instanceof Error ? e.message : '处理失败，请重试'
        const friendlyMsg = raw.includes('exitCode=127') || raw.toLowerCase().includes('command not found')
          ? 'Hermes CLI 未找到，请联系运维检查后端环境（hermes 未在 PATH 中）'
          : raw.includes('404') || raw.includes('请求失败：404')
            ? '流式接口暂不可用，后端可能未重启，请稍后重试'
            : raw
        setError(friendlyMsg)
        // 如果流式消息已创建：保留已有部分输出，追加错误；否则新增一条
        setMessages(prev => {
          const hasStream = prev.some(m => m.id === streamMsgId)
          if (hasStream) {
            return prev.map(m => {
              if (m.id !== streamMsgId) return m
              const existing = m.content.trimEnd()
              const isPlaceholder = existing === THINKING_PLACEHOLDER
              return { ...m, content: (!isPlaceholder && existing) ? `${existing}\n\n⚠️ ${friendlyMsg}` : `⚠️ ${friendlyMsg}` }
            })
          }
          return [...prev, { id: Date.now() + 3, type: 'assistant' as const, content: `⚠️ ${friendlyMsg}`, time: nowTime() }]
        })
      } finally {
        setLoading(false)
      }
      return
    }

    // ── Normal text / attachment message ──────────────────────────────────────
    const currentAttachments = text ? [] : attachments
    const apiContent = buildBeukayClawMessage(content || '请处理上传文件', currentAttachments)
    const displayContent = formatUserContent(content, currentAttachments)

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: displayContent,
      time: nowTime(),
    }])
    setAttachments([])
    setLoading(true)

    const replyMsgId = Date.now() + 1
    setMessages(prev => [...prev, { id: replyMsgId, type: 'assistant', content: THINKING_PLACEHOLDER, time: nowTime() }])

    try {
      for await (const chunk of invokeAgentStream(DEFAULT_AGENT_ID, apiContent, buildHistory())) {
        setMessages(prev => prev.map(m => {
          if (m.id !== replyMsgId) return m
          const isPlaceholder = m.content === THINKING_PLACEHOLDER
          return { ...m, content: isPlaceholder ? chunk + '\n' : m.content + chunk + '\n' }
        }))
      }
      // trim trailing newline; also clear placeholder if no chunks arrived
      setMessages(prev => prev.map(m => {
        if (m.id !== replyMsgId) return m
        const trimmed = m.content.trimEnd()
        return { ...m, content: trimmed === THINKING_PLACEHOLDER ? '' : trimmed }
      }))
    } catch (e) {
      const raw = e instanceof Error ? e.message : '调用失败，请重试'
      const friendlyMsg = raw.includes('exitCode=127') || raw.toLowerCase().includes('command not found')
        ? 'Hermes CLI 未找到，请联系运维检查后端环境（hermes 未在 PATH 中）'
        : raw.includes('404') || raw.includes('请求失败：404')
          ? '流式接口暂不可用，后端可能未重启，请稍后重试'
          : raw
      setError(friendlyMsg)
      setMessages(prev => prev.map(m => {
        if (m.id !== replyMsgId) return m
        const existing = m.content.trimEnd()
        const isPlaceholder = existing === THINKING_PLACEHOLDER
        return { ...m, content: (!isPlaceholder && existing) ? `${existing}\n\n⚠️ ${friendlyMsg}` : `⚠️ ${friendlyMsg}` }
      }))
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([makeWelcome()])
    setFeedbackMap(new Map())
    setError(null)
    setAttachments([])
    setVideoFile(null)
    setInput('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setAttachmentLoading(true)
    setError(null)
    try {
      const files = Array.from(fileList)
      const videos = files.filter(isVideoFile)
      const nonVideos = files.filter(f => !isVideoFile(f))

      if (videos.length > 0) {
        setVideoFile(videos[0])
        setAttachments(prev => [...prev, {
          id: `video-${videos[0].name}-${Date.now()}`,
          name: videos[0].name,
          type: videos[0].type,
          size: videos[0].size,
        }].slice(0, 6))
      }

      if (nonVideos.length > 0) {
        const next = await Promise.all(nonVideos.map(f => readBeukayClawAttachment(f)))
        setAttachments(prev => [...prev, ...next].slice(0, 6))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '文件读取失败')
    } finally {
      setAttachmentLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeAttachment(id: string) {
    setAttachments(prev => {
      const removed = prev.find(f => f.id === id)
      if (removed && removed.type.startsWith('video/')) setVideoFile(null)
      return prev.filter(f => f.id !== id)
    })
  }

  function handleFeedback(msgId: number, type: 'helpful' | 'unhelpful') {
    if (feedbackMap.has(msgId)) return
    setFeedbackMap(prev => new Map(prev).set(msgId, type))
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-card)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #ffe4ec, #ffd5a8)',
            border: '1px solid rgba(232,54,93,0.18)',
            boxShadow: '0 8px 22px rgba(255,122,149,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>{CLAW_ICON}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {DISPLAY_AGENT_NAME}
              <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', fontWeight: 600 }}>● 在线</span>
              <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: 10, background: 'rgba(232,54,93,0.08)', color: '#e8365d', border: '1px solid rgba(232,54,93,0.2)', fontWeight: 600 }}>🔧 Tool Calling</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Hermes 自主工具调用 · 描述目标即可 · 或上传视频自动拆解
            </div>
          </div>
        </div>
        <button onClick={clearChat} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
          fontSize: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-primary)',
          color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          <RotateCcw size={13} /> 清空对话
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: msg.type === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: msg.type === 'assistant' ? 20 : '0.75rem', fontWeight: 700, color: 'white',
              background: msg.type === 'assistant' ? 'linear-gradient(135deg, #ffe4ec, #ffd5a8)' : 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              border: msg.type === 'assistant' ? '1px solid rgba(232,54,93,0.15)' : 'none',
            }}>
              {msg.type === 'assistant' ? CLAW_ICON : '我'}
            </div>
            <div style={{ maxWidth: '76%' }}>
              <div style={{
                padding: '12px 16px', borderRadius: 14,
                borderTopLeftRadius: msg.type === 'user' ? 14 : 4,
                borderTopRightRadius: msg.type === 'user' ? 4 : 14,
                background: msg.type === 'user' ? 'linear-gradient(135deg, #e8365d, #ff7a95)' : 'var(--bg-card)',
                border: msg.type === 'user' ? 'none' : '1px solid var(--border-light)',
                color: msg.type === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: '0.85rem', lineHeight: 1.65,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                {msg.type === 'assistant' ? formatContent(msg.content) : msg.content}
                {msg.videoUrl && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>
                      🎬 源视频
                    </div>
                    <video
                      controls
                      style={{ width: '100%', maxHeight: 200, borderRadius: 8, background: '#000', display: 'block' }}
                    >
                      <source src={msg.videoUrl} />
                    </video>
                  </div>
                )}
                {msg.videoUrl && msg.segments && msg.segments.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>
                      ✂️ 拆解片段（{msg.segments.length} 段，点击播放循环）
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {msg.segments.map((seg, idx) => (
                        seg.startSec != null && seg.endSec != null ? (
                          <div key={idx}>
                            <SegmentClip
                              src={msg.videoUrl!}
                              startSec={seg.startSec}
                              endSec={seg.endSec}
                              label={seg.structureTag}
                              height={110}
                            />
                            {(seg.keyPhrase || seg.sellingPoint) && (
                              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                                {seg.keyPhrase ? <strong style={{ color: '#e8365d' }}>「{seg.keyPhrase}」</strong> : null}
                                {seg.sellingPoint && <span> · {seg.sellingPoint}</span>}
                              </div>
                            )}
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                {msg.type === 'assistant' && (
                  <>
                    <button title="复制" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }} onClick={() => navigator.clipboard.writeText(msg.content)}>
                      <Copy size={12} />
                    </button>
                    <button title="有帮助" onClick={() => handleFeedback(msg.id, 'helpful')} style={{ border: 'none', background: 'none', padding: 2, cursor: feedbackMap.has(msg.id) ? 'default' : 'pointer', color: feedbackMap.get(msg.id) === 'helpful' ? '#22c55e' : 'var(--text-muted)' }}>
                      <ThumbsUp size={12} />
                    </button>
                    <button title="没帮助" onClick={() => handleFeedback(msg.id, 'unhelpful')} style={{ border: 'none', background: 'none', padding: 2, cursor: feedbackMap.has(msg.id) ? 'default' : 'pointer', color: feedbackMap.get(msg.id) === 'unhelpful' ? '#e8365d' : 'var(--text-muted)' }}>
                      <ThumbsDown size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #ffe4ec, #ffd5a8)', border: '1px solid rgba(232,54,93,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{CLAW_ICON}</div>
            <div style={{ padding: '14px 18px', borderRadius: 14, borderTopLeftRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8365d', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => void sendMessage(s)} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: '0.75rem',
              border: '1px solid rgba(232,54,93,0.25)', background: 'rgba(232,54,93,0.05)',
              color: '#e8365d', cursor: 'pointer', fontWeight: 500,
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ margin: '0 24px 8px', padding: '8px 14px', borderRadius: 8, fontSize: '0.75rem', background: 'rgba(232,54,93,0.08)', border: '1px solid rgba(232,54,93,0.2)', color: '#e8365d', flexShrink: 0 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Video skuId inline input */}
      {videoFile && (
        <div style={{
          margin: '0 24px 8px', padding: '10px 14px',
          background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>🎬 视频已就绪，输入 skuId：</span>
          <input
            value={videoSkuId}
            onChange={e => setVideoSkuId(e.target.value)}
            placeholder="skuId"
            style={{
              flex: 1, padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(139,92,246,0.3)',
              background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none',
            }}
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>发送后自动拆解 → Agent 处理</span>
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-card)', flexShrink: 0 }}>
        {attachments.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {attachments.map(file => (
              <div key={file.id} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '6px 9px',
                borderRadius: 999, fontSize: '0.72rem', maxWidth: 280,
                background: file.type.startsWith('video/') ? 'rgba(139,92,246,0.08)' : 'rgba(232,54,93,0.06)',
                border: `1px solid ${file.type.startsWith('video/') ? 'rgba(139,92,246,0.2)' : 'rgba(232,54,93,0.18)'}`,
                color: file.type.startsWith('video/') ? '#7c3aed' : '#be123c',
              }}>
                <span>{file.type.startsWith('video/') ? '🎬' : '📎'}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{formatAttachmentSize(file.size)}</span>
                <button onClick={() => removeAttachment(file.id)} style={{ border: 'none', background: 'transparent', color: file.type.startsWith('video/') ? '#7c3aed' : '#be123c', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: 'var(--bg-primary)', border: '1.5px solid rgba(232,54,93,0.3)', borderRadius: 14, padding: '10px 12px' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,text/*,.json,.csv,.md,.yaml,.yml,.sql,.log,.tsx,.ts,.js,.jsx"
            style={{ display: 'none' }}
            onChange={e => void handleFilesSelected(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || attachmentLoading}
            title="上传文件或视频"
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: '1px solid rgba(232,54,93,0.18)',
              background: videoFile ? 'rgba(139,92,246,0.1)' : 'rgba(232,54,93,0.06)',
              color: videoFile ? '#7c3aed' : '#e8365d',
              cursor: loading || attachmentLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Paperclip size={15} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={videoFile
              ? `已选择视频（skuId=${videoSkuId}），可补充说明后发送…`
              : attachments.length > 0
                ? '补充说明如何使用这些文件…'
                : '描述你的目标，Agent 自主调用工具完成任务…'}
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)',
              lineHeight: 1.6, maxHeight: 120, overflowY: 'auto', fontFamily: 'inherit',
            }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`
            }}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={(!input.trim() && attachments.length === 0 && !videoFile) || loading || attachmentLoading}
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: (input.trim() || attachments.length > 0 || videoFile) && !loading && !attachmentLoading
                ? 'linear-gradient(135deg, #e8365d, #ff7a95)'
                : 'var(--border-light)',
              color: 'white',
              cursor: (input.trim() || attachments.length > 0 || videoFile) && !loading && !attachmentLoading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Send size={15} />
          </button>
        </div>

        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e88' }} />
          <span>
            {attachmentLoading ? '正在读取文件…' : `Hermes Tool Calling · 自主决策调用 Agent 工具 · ${DISPLAY_AGENT_NAME}`}
          </span>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'rgba(30,30,30,0.88)', color: 'white', padding: '7px 18px', borderRadius: 20, fontSize: '0.78rem', pointerEvents: 'none', zIndex: 9999 }}>
          感谢反馈
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
