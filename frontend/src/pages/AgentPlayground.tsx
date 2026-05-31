import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  Braces,
  CheckCircle2,
  Clock3,
  FileCode2,
  FileText,
  History,
  Link2,
  Play,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react'
import AgentMatrix from './AgentMatrix'
import { agentPlaygroundApi, type PlaygroundAgentType, type PlaygroundExecutionResult } from '../lib/agentPlaygroundApi'
import { findRunnablePreset } from '../lib/newAgentCatalog'
import { loadPlaygroundHistory, pushPlaygroundHistory, type PlaygroundHistoryItem } from '../lib/agentPlaygroundHistory'
import { getVideoStreamUrl } from '../lib/agentApi'
import type { VideoDeconstructionTask } from '../lib/agentApi'

type DetailTab = 'result' | 'raw' | 'trace' | 'history'
type ExecutionState = 'idle' | 'submitting' | 'success' | 'error'
type VideoSourceMode = 'local-file' | 'remote-url'

type VideoFormState = {
  sourceMode: VideoSourceMode
  file: File | null
  videoUrl: string
  skuId: string
  sourceLabel: string
}

type CardFormState = {
  skuId: string
  marketingNode: string
  targetAudience: string
  accountId: string
}

type ScriptFormState = {
  skuId: string
  marketingNode: string
  targetAudience: string
  platform: string
}

type QianchuanDeliveryFormState = {
  videoUrl: string
  productName: string
  campaignName: string
  dailyBudget: string
  targetAudience: string
}

type QianchuanDataFormState = {
  advertiserIds: string
  startDate: string
  endDate: string
  dimension: string
}

const defaultVideoForm: VideoFormState = {
  sourceMode: 'local-file',
  file: null,
  videoUrl: '',
  skuId: 'SEED_CUSHION_2',
  sourceLabel: '本地测试视频',
}

const defaultCardForm: CardFormState = {
  skuId: 'SEED_CUSHION_2',
  marketingNode: '日常投放',
  targetAudience: '干皮/混干皮',
  accountId: 'account-1',
}

const defaultScriptForm: ScriptFormState = {
  skuId: 'SEED_CUSHION_2',
  marketingNode: '日常投放',
  targetAudience: '25-35岁职场女性',
  platform: 'DOUYIN',
}

const defaultDeliveryForm: QianchuanDeliveryFormState = {
  videoUrl: '',
  productName: 'SEED_CUSHION_2 气垫',
  campaignName: '玛丽黛佳气垫日常投放',
  dailyBudget: '500',
  targetAudience: '25-35岁女性',
}

const defaultDataForm: QianchuanDataFormState = {
  advertiserIds: '',
  startDate: '',
  endDate: '',
  dimension: 'ad',
}

function prettyJson(value: unknown) {
  if (value === undefined) return ''
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

function historyTitle(item: PlaygroundHistoryItem) {
  const request = (item.requestPayload ?? {}) as Record<string, unknown>
  if (typeof request.fileName === 'string' && request.fileName) return request.fileName
  if (typeof request.videoUrl === 'string' && request.videoUrl) return request.videoUrl
  if (typeof request.blueprintCode === 'string' && request.blueprintCode) return request.blueprintCode
  if (typeof request.message === 'string' && request.message) return request.message.slice(0, 24)
  if (typeof request.skuId === 'string' && request.skuId) return request.skuId
  return '最近一次运行'
}

function historyToExecutionResult(item: PlaygroundHistoryItem): PlaygroundExecutionResult {
  return {
    agent: item.agent,
    mode: 'REAL',
    status: item.status,
    startedAt: item.createdAt,
    durationMs: item.durationMs,
    requestPayload: item.requestPayload,
    responsePayload: item.responsePayload,
    tracePayload: item.tracePayload,
    errorMessage: item.errorMessage,
    rawJson: item.responsePayload,
    logicTrace: item.tracePayload,
    output: item.responsePayload,
  }
}

function tabButtonStyle(active: boolean): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '14px 18px',
    border: 'none',
    background: 'transparent',
    borderBottom: active ? '2px solid #ff4d73' : '2px solid transparent',
    color: active ? '#ff4d73' : '#94a3b8',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
  }
}

function emptyState(title: string, desc: string) {
  return (
    <div className="playground-empty-state" style={{ minHeight: 520, textAlign: 'center', flexDirection: 'column' }}>
      <Sparkles size={44} color="#fbbf24" />
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  )
}

function AgentDetailView({ agentKey }: { agentKey: PlaygroundAgentType }) {
  const navigate = useNavigate()
  const preset = findRunnablePreset(agentKey)
  const [activeTab, setActiveTab] = useState<DetailTab>('result')
  const [executionState, setExecutionState] = useState<ExecutionState>('idle')
  const [latestResult, setLatestResult] = useState<PlaygroundExecutionResult | null>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [liveTask, setLiveTask] = useState<VideoDeconstructionTask | null>(null)
  const [videoForm, setVideoForm] = useState<VideoFormState>(defaultVideoForm)
  const [cardForm, setCardForm] = useState<CardFormState>(defaultCardForm)
  const [scriptForm, setScriptForm] = useState<ScriptFormState>(defaultScriptForm)
  const [assemblyCode, setAssemblyCode] = useState('BP_SEED_001')
  const [message, setMessage] = useState('请帮我分析最近一周唇釉投放 ROI 下滑的原因，并给出可执行建议。')
  const [deliveryForm, setDeliveryForm] = useState<QianchuanDeliveryFormState>(defaultDeliveryForm)
  const [dataForm, setDataForm] = useState<QianchuanDataFormState>(defaultDataForm)
  const [historyItems, setHistoryItems] = useState<PlaygroundHistoryItem[]>(() => loadPlaygroundHistory().filter((item) => item.agent === agentKey))

  useEffect(() => {
    setActiveTab('result')
    setExecutionState('idle')
    setLatestResult(null)
    setValidationMessage('')
    setLiveTask(null)
    setVideoForm(defaultVideoForm)
    setCardForm(defaultCardForm)
    setScriptForm(defaultScriptForm)
    setAssemblyCode('BP_SEED_001')
    setMessage('请帮我分析最近一周唇釉投放 ROI 下滑的原因，并给出可执行建议。')
    setDeliveryForm(defaultDeliveryForm)
    setDataForm(defaultDataForm)
    setHistoryItems(loadPlaygroundHistory().filter((item) => item.agent === agentKey))
  }, [agentKey])

  const recentRuns = useMemo(() => historyItems.slice(0, 3), [historyItems])

  if (!preset) {
    return <Navigate to="/agent-playground" replace />
  }

  function persistResult(result: PlaygroundExecutionResult) {
    setLatestResult(result)
    setExecutionState(result.status)
    const allItems = pushPlaygroundHistory(result)
    setHistoryItems(allItems.filter((item) => item.agent === agentKey))
  }

  function fillExample() {
    if (agentKey === 'video-deconstruction') {
      setVideoForm({
        sourceMode: 'remote-url',
        file: null,
        videoUrl: 'https://cdn.example.com/product_demo_v2.mp4',
        skuId: 'SEED_CUSHION_2',
        sourceLabel: '产品演示视频',
      })
      return
    }
    if (agentKey === 'content-structure-card') {
      setCardForm({
        skuId: 'SEED_CUSHION_2',
        marketingNode: '新品种草',
        targetAudience: '油皮/混油皮',
        accountId: 'account-douyin-01',
      })
      return
    }
    if (agentKey === 'script-blueprint') {
      setScriptForm({
        skuId: 'SEED_CUSHION_2',
        marketingNode: '新品种草',
        targetAudience: '25-35岁敏感肌女性',
        platform: 'XIAOHONGSHU',
      })
      return
    }
    if (agentKey === 'video-assembly') {
      setAssemblyCode('BP_RUNTIME_DEMO_001')
      return
    }
    if (agentKey === 'qianchuan-delivery') {
      setDeliveryForm({
        videoUrl: 'https://cdn.example.com/mary-cushion-demo.mp4',
        productName: 'SEED_CUSHION_2 气垫',
        campaignName: '玛丽黛佳气垫新品种草-小红书引流',
        dailyBudget: '1000',
        targetAudience: '25-35岁敏感肌女性',
      })
      return
    }
    if (agentKey === 'qianchuan-data') {
      setDataForm({
        advertiserIds: 'ADV_001',
        startDate: '2026-04-01',
        endDate: '2026-04-23',
        dimension: 'material',
      })
      return
    }
    setMessage('请为新品唇釉生成一份适合小红书种草和抖音投流联动的策略建议。')
  }

  function clearForm() {
    setValidationMessage('')
    setLiveTask(null)
    setLatestResult(null)
    setExecutionState('idle')
    setActiveTab('result')
    setVideoForm({ ...defaultVideoForm, file: null, videoUrl: '' })
    setCardForm(defaultCardForm)
    setScriptForm(defaultScriptForm)
    setAssemblyCode('')
    setMessage('')
    setDeliveryForm({ ...defaultDeliveryForm, videoUrl: '' })
    setDataForm({ ...defaultDataForm, advertiserIds: '' })
  }

  async function handleRun() {
    setValidationMessage('')
    setExecutionState('submitting')
    setActiveTab('result')

    if (agentKey === 'video-deconstruction') {
      if (!videoForm.skuId.trim()) {
        setValidationMessage('请填写 skuId（必填）。')
        setExecutionState('idle')
        return
      }
      const hasFile = !!videoForm.file
      const hasUrl = !!videoForm.videoUrl.trim()
      if (!hasFile && !hasUrl) {
        setValidationMessage('请提供视频链接或上传本地视频文件（二选一，必填）。')
        setExecutionState('idle')
        return
      }
      const onTaskUpdate = (task: VideoDeconstructionTask) => setLiveTask(task)
      // 优先使用本地文件，否则用 URL
      const result = hasFile
        ? await agentPlaygroundApi.runVideoDeconstructionUpload({
          file: videoForm.file as File,
          skuId: videoForm.skuId.trim(),
          sourceLabel: videoForm.sourceLabel.trim() || undefined,
          onTaskUpdate,
        })
        : await agentPlaygroundApi.runVideoDeconstructionUrl({
          skuId: videoForm.skuId.trim(),
          videoUrl: videoForm.videoUrl.trim(),
          sourceLabel: videoForm.sourceLabel.trim() || undefined,
          onTaskUpdate,
        })
      persistResult(result)
      return
    }

    if (agentKey === 'content-structure-card') {
      const result = await agentPlaygroundApi.runContentStructureCard(cardForm)
      persistResult(result)
      return
    }

    if (agentKey === 'script-blueprint') {
      const result = await agentPlaygroundApi.runScriptBlueprint(scriptForm)
      persistResult(result)
      return
    }

    if (agentKey === 'video-assembly') {
      if (!assemblyCode.trim()) {
        setValidationMessage('请填写 blueprintCode。')
        setExecutionState('idle')
        return
      }
      const result = await agentPlaygroundApi.runVideoAssembly({ blueprintCode: assemblyCode.trim() })
      persistResult(result)
      return
    }

    if (agentKey === 'qianchuan-delivery') {
      if (!deliveryForm.videoUrl.trim()) {
        setValidationMessage('请填写视频素材 URL。')
        setExecutionState('idle')
        return
      }
      const result = await agentPlaygroundApi.runQianchuanDelivery(deliveryForm)
      persistResult(result)
      return
    }

    if (agentKey === 'qianchuan-data') {
      if (!dataForm.advertiserIds.trim() || !dataForm.startDate || !dataForm.endDate) {
        setValidationMessage('请填写广告主ID和日期范围。')
        setExecutionState('idle')
        return
      }
      const result = await agentPlaygroundApi.runQianchuanData(dataForm)
      persistResult(result)
      return
    }

    if (!message.trim()) {
      setValidationMessage('请输入调试消息。')
      setExecutionState('idle')
      return
    }
    const result = await agentPlaygroundApi.runBeukayClaw({ message: message.trim() })
    persistResult(result)
  }

  function renderInputForm() {
    const inputStyle: CSSProperties = {
      width: '100%',
      border: '1px solid var(--border)',
      borderRadius: 14,
      background: 'rgba(255,255,255,0.96)',
      padding: '12px 14px',
      color: 'var(--text-primary)',
      outline: 'none',
      fontSize: '0.95rem',
    }

    const textAreaStyle: CSSProperties = {
      ...inputStyle,
      minHeight: 140,
      resize: 'vertical',
      fontFamily: 'inherit',
    }

    if (agentKey === 'video-deconstruction') {
      const reqTag = (
        <span style={{ color: '#e8365d', fontSize: '0.7rem', fontWeight: 700, marginLeft: 4 }}>*必填</span>
      )
      const optTag = (
        <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: 4 }}>选填</span>
      )
      return (
        <div className="playground-form-stack">
          {/* skuId + sourceLabel */}
          <div className="playground-form-grid">
            <label className="playground-field">
              <span>skuId {reqTag}</span>
              <input value={videoForm.skuId} onChange={(e) => setVideoForm((v) => ({ ...v, skuId: e.target.value }))} placeholder="SEED_CUSHION_2" />
            </label>
            <label className="playground-field">
              <span>sourceLabel {optTag}</span>
              <input value={videoForm.sourceLabel} onChange={(e) => setVideoForm((v) => ({ ...v, sourceLabel: e.target.value }))} placeholder="本地测试视频" />
            </label>
          </div>

          {/* 视频 URL */}
          <label className="playground-field playground-field-full">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Link2 size={14} /> 视频链接 URL
              {reqTag}
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: 2 }}>（与本地文件二选一）</span>
            </span>
            <input
              value={videoForm.videoUrl}
              onChange={(e) => setVideoForm((v) => ({ ...v, videoUrl: e.target.value }))}
              placeholder="https://cdn.example.com/v.mp4"
              style={{ borderColor: videoForm.videoUrl ? '#22c55e' : undefined }}
            />
          </label>

          {/* 分隔线 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: '0.72rem' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            或
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* 本地视频文件 */}
          <label className="playground-field playground-field-full">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Upload size={14} /> 本地视频文件
              {reqTag}
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: 2 }}>（与视频链接二选一）</span>
            </span>
            <div style={{
              border: `2px dashed ${videoForm.file ? '#22c55e' : '#cbd5e1'}`,
              borderRadius: 14, background: '#fff', minHeight: 120, display: 'grid', placeItems: 'center', padding: 16,
            }}>
              <div style={{ textAlign: 'center' }}>
                <Upload size={28} color={videoForm.file ? '#22c55e' : '#94a3b8'} />
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569', marginTop: 8 }}>
                  {videoForm.file ? videoForm.file.name : '点击选择或拖拽视频文件'}
                </div>
                {!videoForm.file && (
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 4 }}>MP4、MOV、AVI、MKV</div>
                )}
                <input
                  type="file" accept="video/*"
                  onChange={(e) => setVideoForm((v) => ({ ...v, file: e.target.files?.[0] ?? null }))}
                  style={{ marginTop: 10 }}
                />
              </div>
            </div>
          </label>
        </div>
      )
    }

    if (agentKey === 'content-structure-card') {
      return (
        <div className="playground-form-grid">
          <label className="playground-field"><span>skuId</span><input value={cardForm.skuId} onChange={(e) => setCardForm((value) => ({ ...value, skuId: e.target.value }))} /></label>
          <label className="playground-field"><span>marketingNode</span><input value={cardForm.marketingNode} onChange={(e) => setCardForm((value) => ({ ...value, marketingNode: e.target.value }))} /></label>
          <label className="playground-field"><span>targetAudience</span><input value={cardForm.targetAudience} onChange={(e) => setCardForm((value) => ({ ...value, targetAudience: e.target.value }))} /></label>
          <label className="playground-field"><span>accountId</span><input value={cardForm.accountId} onChange={(e) => setCardForm((value) => ({ ...value, accountId: e.target.value }))} /></label>
        </div>
      )
    }

    if (agentKey === 'script-blueprint') {
      return (
        <div className="playground-form-grid">
          <label className="playground-field"><span>skuId</span><input value={scriptForm.skuId} onChange={(e) => setScriptForm((value) => ({ ...value, skuId: e.target.value }))} /></label>
          <label className="playground-field"><span>marketingNode</span><input value={scriptForm.marketingNode} onChange={(e) => setScriptForm((value) => ({ ...value, marketingNode: e.target.value }))} /></label>
          <label className="playground-field"><span>targetAudience</span><input value={scriptForm.targetAudience} onChange={(e) => setScriptForm((value) => ({ ...value, targetAudience: e.target.value }))} /></label>
          <label className="playground-field"><span>platform</span><input value={scriptForm.platform} onChange={(e) => setScriptForm((value) => ({ ...value, platform: e.target.value }))} /></label>
        </div>
      )
    }

    if (agentKey === 'video-assembly') {
      return (
        <div className="playground-form-grid">
          <label className="playground-field playground-field-full">
            <span>blueprintCode</span>
            <input value={assemblyCode} onChange={(e) => setAssemblyCode(e.target.value)} placeholder="BP_RUNTIME_DEMO_001" />
          </label>
        </div>
      )
    }

    if (agentKey === 'qianchuan-delivery') {
      return (
        <div className="playground-form-grid">
          <label className="playground-field playground-field-full">
            <span>视频素材 URL</span>
            <input value={deliveryForm.videoUrl} onChange={(e) => setDeliveryForm((v) => ({ ...v, videoUrl: e.target.value }))} placeholder="https://cdn.example.com/video.mp4" />
          </label>
          <label className="playground-field"><span>商品名称</span><input value={deliveryForm.productName} onChange={(e) => setDeliveryForm((v) => ({ ...v, productName: e.target.value }))} /></label>
          <label className="playground-field"><span>计划名称</span><input value={deliveryForm.campaignName} onChange={(e) => setDeliveryForm((v) => ({ ...v, campaignName: e.target.value }))} /></label>
          <label className="playground-field"><span>日预算（元）</span><input value={deliveryForm.dailyBudget} onChange={(e) => setDeliveryForm((v) => ({ ...v, dailyBudget: e.target.value }))} placeholder="500" /></label>
          <label className="playground-field"><span>定向人群</span><input value={deliveryForm.targetAudience} onChange={(e) => setDeliveryForm((v) => ({ ...v, targetAudience: e.target.value }))} placeholder="25-35岁女性" /></label>
        </div>
      )
    }

    if (agentKey === 'qianchuan-data') {
      return (
        <div className="playground-form-grid">
          <label className="playground-field playground-field-full">
            <span>广告主 ID（多个用逗号分隔）</span>
            <input value={dataForm.advertiserIds} onChange={(e) => setDataForm((v) => ({ ...v, advertiserIds: e.target.value }))} placeholder="ADV_001,ADV_002" />
          </label>
          <label className="playground-field"><span>开始日期</span><input type="date" value={dataForm.startDate} onChange={(e) => setDataForm((v) => ({ ...v, startDate: e.target.value }))} /></label>
          <label className="playground-field"><span>结束日期</span><input type="date" value={dataForm.endDate} onChange={(e) => setDataForm((v) => ({ ...v, endDate: e.target.value }))} /></label>
          <label className="playground-field"><span>统计维度</span>
            <select value={dataForm.dimension} onChange={(e) => setDataForm((v) => ({ ...v, dimension: e.target.value }))} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 14, background: 'rgba(255,255,255,0.96)', padding: '12px 14px', color: 'var(--text-primary)', outline: 'none', fontSize: '0.95rem' }}>
              <option value="ad">广告计划维度</option>
              <option value="material">素材维度</option>
              <option value="advertiser">广告主维度</option>
              <option value="live">直播维度</option>
            </select>
          </label>
        </div>
      )
    }

    return (
      <div className="playground-form-grid">
        <label className="playground-field playground-field-full">
          <span>调试消息</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} style={textAreaStyle} placeholder="请输入调试消息" />
        </label>
      </div>
    )
  }

  function renderResultPanel() {
    if (!latestResult) {
      return emptyState('运行后结果将在此展示', '填写左侧参数，点击「运行 Agent」即可')
    }

    if (latestResult.status === 'error') {
      return (
        <div className="playground-empty-state error" style={{ minHeight: 520, textAlign: 'center', flexDirection: 'column' }}>
          <Sparkles size={44} color="#f87171" />
          <h4>执行失败</h4>
          <p>{latestResult.errorMessage ?? '本次调用失败'}</p>
        </div>
      )
    }

    return (
      <div className="playground-result-stack">
        <div className="playground-key-grid">
          <div className="playground-key-card">
            <div className="playground-key-label">状态</div>
            <div className="playground-key-value">成功</div>
          </div>
          <div className="playground-key-card">
            <div className="playground-key-label">耗时</div>
            <div className="playground-key-value">{latestResult.durationMs}ms</div>
          </div>
          <div className="playground-key-card">
            <div className="playground-key-label">开始时间</div>
            <div className="playground-key-value">{new Date(latestResult.startedAt).toLocaleString()}</div>
          </div>
          <div className="playground-key-card">
            <div className="playground-key-label">Agent</div>
            <div className="playground-key-value">{preset.name}</div>
          </div>
        </div>
        <pre className="playground-code-block">{prettyJson(latestResult.output ?? latestResult.responsePayload ?? latestResult.rawJson ?? null)}</pre>
        {agentKey === 'video-deconstruction' && (() => {
          const detail = latestResult.responsePayload as Record<string, unknown> | undefined
          const videoId = detail?.videoId as string | undefined
          const videoPlayUrl = getVideoStreamUrl(videoId)
          if (!videoPlayUrl) return null
          return (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, letterSpacing: '0.06em', fontWeight: 700 }}>源视频</div>
              <video controls style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 260, display: 'block' }}>
                <source src={videoPlayUrl} />
              </video>
            </div>
          )
        })()}
        {agentKey === 'video-assembly' && (() => {
          const data = (latestResult.output ?? latestResult.responsePayload) as Record<string, unknown> | undefined
          const resultVideoUrl = data?.resultVideoUrl as string | undefined
          if (!resultVideoUrl) return null
          return (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 6, letterSpacing: '0.06em', fontWeight: 700 }}>成片视频</div>
              <video controls style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 280, display: 'block' }}>
                <source src={resultVideoUrl} />
              </video>
              <a href={resultVideoUrl} target="_blank" rel="noreferrer"
                style={{ display: 'block', fontSize: '0.68rem', color: '#3b82f6', marginTop: 6, wordBreak: 'break-all' }}>
                🔗 {resultVideoUrl}
              </a>
            </div>
          )
        })()}
        {agentKey === 'video-deconstruction' && (
          <a href="#/asset-library?tab=1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: 'rgba(245,158,11,0.10)', color: '#f59e0b', borderRadius: 8,
            fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', marginTop: 4,
            border: '1px solid rgba(245,158,11,0.25)',
          }}>
            ✂️ 在素材库查看拆解片段
          </a>
        )}
        {agentKey === 'video-assembly' && (
          <a href="#/asset-library?tab=2" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: 'rgba(232,54,93,0.08)', color: '#e8365d', borderRadius: 8,
            fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', marginTop: 4,
            border: '1px solid rgba(232,54,93,0.20)',
          }}>
            🎬 在素材库查看成片
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="page-content" style={{ paddingTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/agent-playground')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 14, border: '1px solid #dbe3ef', background: '#fff', fontSize: '0.95rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> 返回目录
          </button>
          <span style={{ color: '#cbd5e1', fontSize: '1.4rem', lineHeight: 1 }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'var(--gradient-1)', color: '#fff' }}>
              <Sparkles size={18} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Agent Playground</div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 999, border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span>{preset.name}</span>
          <span style={{ color: '#94a3b8' }}>· 在线可运行</span>
        </div>
      </div>

      <div className="playground-shell">
        <aside className="playground-sidebar" style={{ minHeight: 760 }}>
          <div style={{ width: 70, height: 70, borderRadius: 24, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #fff1f4 0%, #ffe4eb 100%)', fontSize: '2rem', marginBottom: 18 }}>
            {preset.iconEmoji}
          </div>

          <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, marginBottom: 6 }}>当前 Agent</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{preset.name}</div>
          <div style={{ fontSize: '0.92rem', color: '#94a3b8', marginTop: 4 }}>{preset.subGroup} · {preset.clusterLabel.replace(' / ', '与')}</div>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#64748b', marginTop: 18 }}>{preset.description}</div>

          <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
            {[
              { label: '状态', value: '在线可运行', color: '#22c55e' },
              { label: '能力点', value: `${preset.capabilityCount} 个`, color: 'var(--text-primary)' },
              { label: '业务域', value: preset.domain, color: 'var(--text-primary)' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.92rem', color: '#94a3b8' }}>
                <span>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 800 }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: '#e2e8f0', margin: '24px 0' }} />
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#94a3b8', marginBottom: 14 }}>能力标签</div>
          <div className="playground-pill-row" style={{ marginTop: 0 }}>
            {preset.tags.map((tag) => (
              <span key={tag} className="playground-pill" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>{tag}</span>
            ))}
          </div>

          <div style={{ height: 1, background: '#e2e8f0', margin: '24px 0' }} />
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#94a3b8', marginBottom: 14 }}>最近运行</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {recentRuns.length === 0 ? (
              <div style={{ borderRadius: 16, background: '#f8fafc', padding: 14, color: '#94a3b8', fontSize: '0.86rem' }}>暂无运行记录</div>
            ) : recentRuns.map((item) => (
              <button key={item.id} onClick={() => { setLatestResult(historyToExecutionResult(item)); setActiveTab('result') }} style={{ border: 'none', textAlign: 'left', borderRadius: 16, background: '#f8fafc', padding: 14, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.status === 'success' ? '#22c55e' : '#f59e0b' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{historyTitle(item)}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleString()} · {item.status === 'success' ? '成功' : '失败'}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="playground-panel" style={{ minHeight: 760, background: '#fff', borderColor: '#e2e8f0' }}>
          <div className="playground-panel-head" style={{ marginBottom: 18 }}>
            <div>
              <div className="playground-panel-kicker">输入参数</div>
            </div>
            <span className={`playground-status-chip ${executionState}`} style={executionState === 'idle' ? { background: '#fff7ed', color: '#f59e0b' } : undefined}>
              {executionState === 'idle' ? 'IDLE' : executionState === 'submitting' ? 'RUNNING' : executionState.toUpperCase()}
            </span>
          </div>

          {renderInputForm()}

          {validationMessage && <div className="playground-inline-alert" style={{ marginTop: 14 }}>{validationMessage}</div>}
          {liveTask && executionState === 'submitting' && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#334155' }}>{liveTask.stage ?? liveTask.status}</div>
              <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: 4 }}>{liveTask.statusMessage ?? '处理中...'}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>{liveTask.progressPercent ?? 0}%</div>
            </div>
          )}

          <div className="playground-actions" style={{ justifyContent: 'space-between', marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="playground-primary-button" onClick={() => void handleRun()} disabled={executionState === 'submitting'}>
                <Play size={16} /> 运行 Agent
              </button>
              <button type="button" className="playground-ghost-button" onClick={fillExample}>
                <Wand2 size={16} /> 填充示例
              </button>
            </div>
            <button type="button" className="playground-ghost-button" onClick={clearForm}>
              <Trash2 size={16} /> 清空
            </button>
          </div>
        </section>

        <section className="playground-panel" style={{ minHeight: 760, background: '#fff', borderColor: '#e2e8f0', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { key: 'result', label: 'Result', icon: CheckCircle2 },
                { key: 'raw', label: 'Raw JSON', icon: Braces },
                { key: 'trace', label: 'Logic Trace', icon: Activity },
                { key: 'history', label: 'History', icon: History },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setActiveTab(key as DetailTab)} style={tabButtonStyle(activeTab === key as DetailTab)}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, minHeight: 620 }}>
            {activeTab === 'result' && renderResultPanel()}
            {activeTab === 'raw' && (
              latestResult
                ? <pre className="playground-code-block" style={{ marginTop: 0, minHeight: 540 }}>{prettyJson(latestResult.rawJson ?? latestResult.responsePayload ?? latestResult.output ?? null)}</pre>
                : emptyState('Raw JSON 暂无内容', '运行一次 Agent 后，这里会展示完整原始响应')
            )}
            {activeTab === 'trace' && (
              latestResult
                ? <pre className="playground-code-block" style={{ marginTop: 0, minHeight: 540 }}>{prettyJson(latestResult.logicTrace ?? latestResult.tracePayload ?? null)}</pre>
                : emptyState('Logic Trace 暂无内容', '运行一次 Agent 后，这里会展示推理链路或 trace 数据')
            )}
            {activeTab === 'history' && (
              historyItems.length === 0
                ? emptyState('还没有历史记录', '运行该 Agent 后，最近历史会自动沉淀到这里')
                : (
                  <div className="playground-history-panel">
                    <div className="playground-history-header">
                      <div>
                        <h4>最近历史</h4>
                        <p>点击任意记录可回放到结果区查看。</p>
                      </div>
                      <div className="playground-history-meta"><Clock3 size={14} /> 共 {historyItems.length} 条</div>
                    </div>
                    <div className="playground-history-list">
                      {historyItems.map((item) => (
                        <button key={item.id} className="playground-history-item" onClick={() => { setLatestResult(historyToExecutionResult(item)); setActiveTab('result') }}>
                          <div className="playground-history-main">
                            <div className="playground-history-title">
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.status === 'success' ? '#22c55e' : '#f59e0b' }} />
                              <strong>{historyTitle(item)}</strong>
                            </div>
                            <span className={`playground-status-chip ${item.status === 'success' ? 'success' : 'error'}`}>{item.status === 'success' ? 'SUCCESS' : 'ERROR'}</span>
                          </div>
                          <div className="playground-history-meta">
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                            <span>·</span>
                            <span>{item.durationMs}ms</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function AgentPlayground() {
  const { agentKey } = useParams<{ agentKey?: PlaygroundAgentType }>()

  if (!agentKey) {
    return <AgentMatrix />
  }

  return <AgentDetailView agentKey={agentKey as PlaygroundAgentType} />
}
