import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Film, Scissors, Palette, Type, CheckCircle,
  Cpu, Play,
  Monitor, Headphones, Volume2, BarChart3, X, Download, Eye, ArrowUp, Ban, Brain, Sparkles, RefreshCw
} from 'lucide-react'
import { createParam } from '../components/AIConfigPanel'
import type { AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'
import { videoAssetApi, type VideoAssemblyTask } from '../lib/agentApi'
import AssemblyPlanStrip from '../components/AssemblyPlanStrip'

type RenderJob = typeof renderQueue[0]

// ===== 视频制作队列 =====
const renderQueue = [
  { id: 'V-001', product: '唇釉丝绒系列', videoType: '试色视频', stage: '视频生成', model: 'DiT-v3', resolution: '1080x1920', fps: 30, progress: 72, eta: '18min', gpuNodes: 4, status: 'rendering' as const },
  { id: 'V-002', product: '唇釉丝绒系列', videoType: '对比测评', stage: '视频生成', model: 'DiT-v3', resolution: '1080x1920', fps: 30, progress: 45, eta: '32min', gpuNodes: 4, status: 'rendering' as const },
  { id: 'V-003', product: '眼影盘星空', videoType: '妆容教程', stage: '后期-调色', model: 'StyleNet', resolution: '1080x1920', fps: 30, progress: 88, eta: '5min', gpuNodes: 1, status: 'rendering' as const },
  { id: 'V-004', product: '眼影盘星空', videoType: '开箱视频', stage: '后期-配音', model: 'AudioGen', resolution: '-', fps: 0, progress: 56, eta: '12min', gpuNodes: 1, status: 'rendering' as const },
  { id: 'V-005', product: '粉底液水光', videoType: '变美挑战', stage: '后期-字幕', model: 'NLLB+Whisper', resolution: '-', fps: 0, progress: 34, eta: '25min', gpuNodes: 2, status: 'rendering' as const },
  { id: 'V-006', product: '卸妆水温和', videoType: '成分科普', stage: '后期-配音', model: 'EmotiVoice', resolution: '-', fps: 0, progress: 60, eta: '15min', gpuNodes: 2, status: 'rendering' as const },
  { id: 'V-007', product: '睫毛膏纤长', videoType: '试色视频', stage: '视频生成', model: 'DiT-v3', resolution: '1080x1920', fps: 30, progress: 0, eta: '~50min', gpuNodes: 0, status: 'queued' as const },
  { id: 'V-008', product: '高光修容盘', videoType: '妆容教程', stage: '视频生成', model: 'DiT-v3', resolution: '1080x1920', fps: 30, progress: 0, eta: '~50min', gpuNodes: 0, status: 'queued' as const },
]

// ===== 后期制作流水线 =====
const postProductionPipeline = [
  { stage: '粗剪', icon: Scissors, desc: '场景分割·镜头排序·种草节奏控制', agent: '视频剪辑智能体', activeJobs: 3, avgTime: '8min/条', quality: 94.2 },
  { stage: '精剪', icon: Film, desc: '转场效果·特写插入·产品高光', agent: '视频剪辑智能体', activeJobs: 2, avgTime: '12min/条', quality: 93.8 },
  { stage: '音效混合', icon: Volume2, desc: 'BGM·环境音·产品展示音效', agent: '音效生成智能体', activeJobs: 4, avgTime: '6min/条', quality: 95.1 },
  { stage: '调色', icon: Palette, desc: '美妆色彩校正·肤色优化·氛围渲染', agent: '调色智能体', activeJobs: 2, avgTime: '4min/条', quality: 96.5 },
  { stage: '字幕', icon: Type, desc: '种草文案字幕·时间轴对齐·样式渲染', agent: '字幕生成智能体', activeJobs: 5, avgTime: '3min/条', quality: 97.8 },
  { stage: '配音', icon: Headphones, desc: '旁白配音·口播优化·情感表达', agent: '语音生成智能体', activeJobs: 3, avgTime: '10min/条', quality: 93.4 },
]

// ===== GPU集群状态 =====
const gpuNodes = [
  { node: 'gpu-node-01', type: 'A100-80G', task: 'DiT视频生成', utilization: 95, memory: 72, temp: 78, status: 'busy' },
  { node: 'gpu-node-02', type: 'A100-80G', task: 'DiT视频生成', utilization: 92, memory: 68, temp: 75, status: 'busy' },
  { node: 'gpu-node-03', type: 'A100-80G', task: 'DiT视频生成', utilization: 88, memory: 65, temp: 73, status: 'busy' },
  { node: 'gpu-node-04', type: 'A100-80G', task: 'DiT视频生成', utilization: 91, memory: 70, temp: 76, status: 'busy' },
  { node: 'gpu-node-05', type: 'A100-80G', task: '人像生成', utilization: 78, memory: 55, temp: 68, status: 'busy' },
  { node: 'gpu-node-06', type: 'A100-80G', task: '场景生成', utilization: 82, memory: 60, temp: 70, status: 'busy' },
  { node: 'gpu-node-07', type: 'A100-80G', task: '特效渲染', utilization: 65, memory: 45, temp: 62, status: 'busy' },
  { node: 'gpu-node-08', type: 'A100-80G', task: '待命中', utilization: 5, memory: 12, temp: 42, status: 'idle' },
]

// ===== 素材统计 =====
const outputStats = [
  { name: '试色视频', completed: 24, inProgress: 8, avgDuration: '0:45', materialsGenerated: 1280, avgCTR: 5.3 },
  { name: '妆容教程', completed: 18, inProgress: 6, avgDuration: '2:30', materialsGenerated: 890, avgCTR: 4.8 },
  { name: '对比测评', completed: 15, inProgress: 4, avgDuration: '1:30', materialsGenerated: 1560, avgCTR: 5.0 },
  { name: '开箱视频', completed: 12, inProgress: 3, avgDuration: '1:00', materialsGenerated: 420, avgCTR: 4.2 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

// ===== AI配置 - 视频素材产出 =====
const videoAIGroups: AIConfigGroup[] = [
  {
    title: 'AI视频生成',
    icon: <Brain size={16} />,
    params: [
      createParam('resolution_priority', '视频分辨率优先级', '1080p', '', '视频渲染输出的默认分辨率，影响质量与渲染速度平衡', '1080p', 91, { type: 'select', options: ['720p', '1080p', '4K'] }),
      createParam('quality_score_threshold', '画面质量评分阈值', 80, '', '渲染输出画面的最低质量评分，低于阈值自动重新渲染', 80, 88, { min: 0, max: 100 }),
      createParam('av_sync_precision', '音视频同步精度', 20, 'ms', '音频与视频轨道的最大允许偏移量', 20, 92, { min: 1, max: 100 }),
      createParam('batch_render_concurrency', '批量渲染并发数', 8, '', '同时进行渲染任务的最大并发数量，受GPU资源限制', 8, 85, { min: 1, max: 20 }),
    ],
  },
  {
    title: '种草素材优化',
    icon: <Sparkles size={16} />,
    params: [
      createParam('cover_attractiveness_threshold', '封面吸引力评分阈值', 75, '', 'AI评估封面图的种草吸引力评分，低于阈值自动生成替代方案', 75, 83, { min: 0, max: 100 }),
      createParam('first_5s_completion_target', '前5秒完播率目标', 65, '%', '视频前5秒的目标完播率，影响种草素材剪辑策略', 65, 87, { min: 0, max: 100, type: 'percentage' }),
      createParam('ab_test_elimination_period', '素材AB测试自动淘汰周期', 12, '小时', '素材投放后自动对比效果并淘汰低效素材的时间周期', 12, 80, { min: 1, max: 72 }),
    ],
  },
]

const videoLearningStatus: AILearningStatus = {
  modelVersion: 'v2.2.0-beauty',
  lastTraining: '20分钟前',
  totalDataPoints: 134000,
  avgConfidence: 85,
  autoAdjustCount24h: 42,
  learningRate: '0.001',
  nextTraining: '10分钟后',
  improvementRate: '+10.6%',
}

// ===== Render Job Detail Panel =====
function RenderJobPanel({ job, onClose }: { job: RenderJob; onClose: () => void }) {
  const [toast, setToast] = useState<string | null>(null)
  const [prioritized, setPrioritized] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const [cancelConfirmMode, setCancelConfirmMode] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handlePrioritize = () => {
    setPrioritized(true)
    setToast('✅ 已提升至队列第1位，预计等待时间缩短至5分钟')
  }

  const handleCancel = () => {
    setCancelled(true)
    setCancelConfirmMode(false)
    setToast('任务已取消')
    setTimeout(onClose, 1500)
  }

  const handlePreview = () => {
    setPreviewOpen(!previewOpen)
  }

  const handleDownload = () => {
    if (downloading) return
    setDownloading(true)
    setToast('⬇️ 下载链接已生成，正在下载...')
    setTimeout(() => setDownloading(false), 3000)
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', zIndex: 1000,
    overflowY: 'auto', display: 'flex', flexDirection: 'column',
  }
  const sectionStyle: React.CSSProperties = { padding: '14px 20px', borderBottom: '1px solid var(--border)' }
  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }
  const metricBox: React.CSSProperties = { padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8 }
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }

  const stages = [
    { name: '帧生成', pct: job.stage === '视频生成' ? Math.min(100, job.progress * 1.1) : 100, active: job.stage === '视频生成' },
    { name: '编码压缩', pct: job.stage === '后期-调色' || job.stage === '后期-配音' ? job.progress : job.progress > 80 ? 100 : 0, active: false },
    { name: '字幕/配音', pct: job.stage === '后期-字幕' || job.stage === '后期-配音' ? job.progress : 0, active: job.stage.includes('字幕') || job.stage.includes('配音') },
    { name: '上传/分发', pct: 0, active: false },
  ].map(s => ({ ...s, pct: Math.min(100, Math.max(0, Math.round(s.pct))) }))

  const gpuPct = job.status === 'rendering' ? Math.round(75 + job.progress * 0.2) : 0
  const memGB = job.gpuNodes * 18
  const estFileSizeMB = job.resolution !== '-' ? Math.round(80 + job.progress * 0.4) : 40

  const platformVariants = [
    { platform: '抖音竖屏', format: '9:16', res: '1080x1920', status: job.progress > 70 ? '已生成' : '排队中' },
    { platform: '小红书方形', format: '1:1', res: '1080x1080', status: job.progress > 80 ? '已生成' : '排队中' },
    { platform: '快手横屏', format: '16:9', res: '1920x1080', status: job.progress > 90 ? '已生成' : '排队中' },
  ]

  return (
    <div style={panelStyle}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          background: cancelled ? '#dc2626' : '#1a1a2e', color: '#fff',
          padding: '8px 18px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
          zIndex: 20, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}
      {/* Preview overlay */}
      {previewing && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 15,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }} onClick={() => setPreviewing(false)}>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{job.product} · {job.videoType}</div>
          <div style={{ width: 260, height: 460, background: '#111', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e8365d' }}>
            <Play size={48} color="#e8365d" />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>点击任意处关闭预览</div>
        </div>
      )}
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{job.id}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{job.product} · {job.videoType} · {job.stage}</div>
        </div>
        <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <X size={14} />
        </button>
      </div>

      {/* Job Details */}
      <div style={sectionStyle}>
        <div style={labelStyle}>任务信息</div>
        <div style={gridStyle}>
          <div style={metricBox}><div style={labelStyle}>产品</div><div style={{ fontWeight: 600 }}>{job.product}</div></div>
          <div style={metricBox}><div style={labelStyle}>视频类型</div><div style={{ fontWeight: 700, color: '#e8365d' }}>{job.videoType}</div></div>
          <div style={metricBox}><div style={labelStyle}>分辨率</div><div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{job.resolution}</div></div>
          <div style={metricBox}><div style={labelStyle}>格式/帧率</div><div style={{ fontWeight: 600 }}>{job.fps > 0 ? `${job.fps}fps` : '-'} / MP4</div></div>
          <div style={metricBox}><div style={labelStyle}>生成模型</div><div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.78rem' }}>{job.model}</div></div>
          <div style={metricBox}><div style={labelStyle}>预计完成</div><div style={{ fontWeight: 700, color: '#d97706' }}>{job.eta}</div></div>
        </div>
      </div>

      {/* Progress with Stage Breakdown */}
      <div style={sectionStyle}>
        <div style={labelStyle}>生产进度 · 阶段细分</div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>总体进度</span>
            <span style={{ fontWeight: 700, color: '#e8365d', fontSize: '0.9rem' }}>{job.progress}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10, borderRadius: 6 }}>
            <div className="progress-bar-fill" style={{ width: `${job.progress}%`, background: job.progress > 0 ? 'var(--gradient-1)' : '#ffd1dc', transition: 'width 0.3s' }} />
          </div>
          <div style={{ marginTop: 14 }}>
            {stages.map((stage, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.72rem', color: stage.active ? '#e8365d' : 'var(--text-secondary)', fontWeight: stage.active ? 600 : 400 }}>
                    {stage.active && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#e8365d', marginRight: 5, verticalAlign: 'middle' }} />}
                    {stage.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stage.pct}%</span>
                </div>
                <div className="progress-bar" style={{ height: 5 }}>
                  <div className="progress-bar-fill" style={{ width: `${stage.pct}%`, background: stage.active ? '#e8365d' : stage.pct === 100 ? '#22c55e' : '#ffd1dc' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div style={sectionStyle}>
        <div style={labelStyle}><Cpu size={10} style={{ display: 'inline', marginRight: 4 }} />资源消耗</div>
        <div style={gridStyle}>
          <div style={metricBox}>
            <div style={labelStyle}>GPU使用率</div>
            <div style={{ fontWeight: 700, color: gpuPct > 90 ? '#dc2626' : gpuPct > 70 ? '#d97706' : '#e8365d', fontSize: '1.1rem' }}>{gpuPct}%</div>
            <div className="progress-bar" style={{ marginTop: 4 }}>
              <div className="progress-bar-fill" style={{ width: `${gpuPct}%`, background: gpuPct > 90 ? '#dc2626' : '#e8365d' }} />
            </div>
          </div>
          <div style={metricBox}>
            <div style={labelStyle}>显存占用</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{memGB}GB</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{job.gpuNodes}x A100-80G</div>
          </div>
          <div style={{ ...metricBox, gridColumn: 'span 2' }}>
            <div style={labelStyle}>预计完成时间</div>
            <div style={{ fontWeight: 700, color: '#d97706', fontSize: '1.1rem' }}>{job.eta}</div>
          </div>
        </div>
      </div>

      {/* Output File Details */}
      <div style={sectionStyle}>
        <div style={labelStyle}>输出文件详情</div>
        <div style={gridStyle}>
          <div style={metricBox}><div style={labelStyle}>文件大小（预估）</div><div style={{ fontWeight: 700 }}>{estFileSizeMB}MB</div></div>
          <div style={metricBox}><div style={labelStyle}>种草质量分</div><div style={{ fontWeight: 700, color: '#e8365d' }}>{job.progress > 50 ? '94.2' : '-'}</div></div>
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 8 }}>平台变体</div>
          {platformVariants.map((v, i) => (
            <div key={i} style={{ ...metricBox, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{v.platform}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 8 }}>{v.format} · {v.res}</span>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: v.status === '已生成' ? '#16a34a' : '#d97706' }}>{v.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        {/* 取消任务 inline confirmation */}
        {cancelConfirmMode && !cancelled && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(220,38,38,0.05)', borderRadius: 8, border: '1px solid rgba(220,38,38,0.25)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626', marginBottom: 6 }}>确认取消任务？</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 10 }}>任务取消后已消耗的GPU资源将释放，已生成的视频帧将丢失，无法恢复。</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCancel} style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', background: '#dc2626', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>确认取消</button>
              <button onClick={() => setCancelConfirmMode(false)} style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>保留任务</button>
            </div>
          </div>
        )}

        {/* 预览 inline panel */}
        {previewOpen && !cancelled && (
          <div style={{ marginBottom: 12, borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(232,54,93,0.12), rgba(168,85,247,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(232,54,93,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={18} color="#e8365d" />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>渲染预览帧 · {job.progress}% 完成</div>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--bg-primary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ fontSize: '0.72rem' }}><span style={{ color: 'var(--text-muted)' }}>产品：</span><span style={{ fontWeight: 600 }}>{job.product}</span></div>
              <div style={{ fontSize: '0.72rem' }}><span style={{ color: 'var(--text-muted)' }}>类型：</span><span style={{ fontWeight: 600 }}>{job.videoType}</span></div>
              <div style={{ fontSize: '0.72rem' }}><span style={{ color: 'var(--text-muted)' }}>规格：</span><span style={{ fontWeight: 600 }}>{job.resolution !== '-' ? job.resolution : '后期处理中'}</span></div>
              <div style={{ fontSize: '0.72rem' }}><span style={{ color: 'var(--text-muted)' }}>阶段：</span><span style={{ fontWeight: 600, color: '#e8365d' }}>{job.stage}</span></div>
              <div style={{ fontSize: '0.72rem' }}><span style={{ color: 'var(--text-muted)' }}>预计大小：</span><span style={{ fontWeight: 600 }}>{estFileSizeMB}MB</span></div>
              <div style={{ fontSize: '0.72rem' }}><span style={{ color: 'var(--text-muted)' }}>质量分：</span><span style={{ fontWeight: 600, color: '#e8365d' }}>{job.progress > 50 ? '94.2' : '评估中'}</span></div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handlePrioritize} disabled={prioritized || cancelled} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: 'none', background: prioritized ? '#22c55e' : 'var(--gradient-1)', color: 'white', fontSize: '0.78rem', cursor: prioritized || cancelled ? 'default' : 'pointer', fontWeight: 600, opacity: cancelled ? 0.4 : 1 }}>
            <ArrowUp size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{prioritized ? '已优先' : '优先渲染'}
          </button>
          <button onClick={() => { if (!cancelled) setCancelConfirmMode(!cancelConfirmMode) }} disabled={cancelled} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid #dc2626', background: cancelled ? 'rgba(220,38,38,0.15)' : cancelConfirmMode ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.05)', fontSize: '0.78rem', cursor: cancelled ? 'default' : 'pointer', color: '#dc2626' }}>
            <Ban size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{cancelled ? '已取消' : '取消任务'}
          </button>
          <button onClick={handlePreview} disabled={cancelled} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: `1px solid ${previewOpen ? '#e8365d' : 'var(--border)'}`, background: previewOpen ? 'rgba(232,54,93,0.08)' : 'white', fontSize: '0.78rem', cursor: cancelled ? 'default' : 'pointer', color: previewOpen ? '#e8365d' : 'var(--text-secondary)', opacity: cancelled ? 0.4 : 1 }}>
            <Eye size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />预览
          </button>
          <button onClick={handleDownload} disabled={cancelled || downloading} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(232,54,93,0.3)', background: 'rgba(232,54,93,0.05)', fontSize: '0.78rem', cursor: cancelled || downloading ? 'default' : 'pointer', color: '#e8365d', opacity: cancelled ? 0.4 : 1 }}>
            <Download size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{downloading ? '下载中...' : '下载'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VideoProduction() {
  const [tab, setTab] = useState<'finished' | 'render' | 'postprod' | 'gpu' | 'output'>('finished')
  const [panelJob, setPanelJob] = useState<RenderJob | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)

  // ── 成片库 live state ──
  const [finishedList, setFinishedList] = useState<VideoAssemblyTask[]>([])
  const [finishedLoading, setFinishedLoading] = useState(false)
  const [finishedError, setFinishedError] = useState<string | null>(null)
  const [selectedFinished, setSelectedFinished] = useState<VideoAssemblyTask | null>(null)

  // 点击行时拉取完整详情（含 planSections / candidates）
  const openFinishedDetail = (item: VideoAssemblyTask) => {
    setSelectedFinished(item)
    if (item.taskCode && (!item.planSections || !item.candidates)) {
      videoAssetApi.getAssemblyDetail(item.taskCode)
        .then(detail => setSelectedFinished(prev => prev && prev.taskCode === detail.taskCode ? { ...prev, ...detail } : prev))
        .catch(() => {/* ignore — 显示主行已有信息 */})
    }
  }

  const loadFinished = () => {
    setFinishedLoading(true)
    setFinishedError(null)
    videoAssetApi.listAssemblyTasks({ pageSize: 30 })
      .then(r => setFinishedList(r.records ?? []))
      .catch(e => setFinishedError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setFinishedLoading(false))
  }

  useEffect(() => {
    if (tab === 'finished' && finishedList.length === 0 && !finishedLoading) loadFinished()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  useRegisterAIConfig(videoAIGroups, videoLearningStatus, '视频素材产出')

  const activeRenders = renderQueue.filter(r => r.status === 'rendering').length
  const queuedRenders = renderQueue.filter(r => r.status === 'queued').length
  const totalGpuUsed = gpuNodes.filter(n => n.status === 'busy').length
  const avgGpuUtil = Math.round(gpuNodes.reduce((s, n) => s + n.utilization, 0) / gpuNodes.length)

  return (
    <>
      {panelJob && (
        <>
          <div onClick={() => setPanelJob(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 999 }} />
          <RenderJobPanel job={panelJob} onClose={() => setPanelJob(null)} />
        </>
      )}
      <div className="page-header">
        <h2>视频素材产出中心</h2>
        <p>飞轮第3环 · 视频素材=种草弹药库 · 试色/教程/测评/开箱多类型批量产出 · 完成即入投放管道</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="ImageGen-SDXL-LoRA" color="#ec4899" />
          <ModelBadge name="VideoCompletion-Predictor" color="#ec4899" />
          <ModelBadge name="ContentLLM-Beauty" color="#ec4899" />
          <ModelBadge name="UGCQuality-Ranker" color="#ec4899" />
          <ModelBadge name="CreativeFatigue-MAB" color="#e8365d" />
        </div>

        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'生产中',value:activeRenders}})} style={{cursor:'pointer'}}>
            <div className="card-title"><Play size={14} style={{ display: 'inline' }} /> 生产中</div>
            <div className="card-value">{activeRenders}</div>
            <div className="card-change positive">{queuedRenders} 个排队中</div>
          </div>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'GPU使用',value:`${totalGpuUsed}/${gpuNodes.length}`}})} style={{cursor:'pointer'}}>
            <div className="card-title"><Cpu size={14} style={{ display: 'inline' }} /> GPU使用</div>
            <div className="card-value">{totalGpuUsed}/{gpuNodes.length}</div>
            <div className="card-change positive">平均利用率 {avgGpuUtil}%</div>
          </div>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'今日素材',value:6}})} style={{cursor:'pointer'}}>
            <div className="card-title"><Film size={14} style={{ display: 'inline' }} /> 今日素材</div>
            <div className="card-value">6</div>
            <div className="card-change positive">较昨日 +2</div>
          </div>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'质检通过率',value:'96.2%'}})} style={{cursor:'pointer'}}>
            <div className="card-title"><CheckCircle size={14} style={{ display: 'inline' }} /> 质检通过率</div>
            <div className="card-value" style={{ color: '#e8365d' }}>96.2%</div>
            <div className="card-change positive">超越目标 93%</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'finished' ? 'active' : ''}`} onClick={() => setTab('finished')}>成片库（live）</button>
          <button className={`tab ${tab === 'render' ? 'active' : ''}`} onClick={() => setTab('render')}>生产队列</button>
          <button className={`tab ${tab === 'postprod' ? 'active' : ''}`} onClick={() => setTab('postprod')}>后期制作</button>
          <button className={`tab ${tab === 'gpu' ? 'active' : ''}`} onClick={() => setTab('gpu')}>GPU集群</button>
          <button className={`tab ${tab === 'output' ? 'active' : ''}`} onClick={() => setTab('output')}>素材统计</button>
        </div>

        {/* ===== 成片库（live） ===== */}
        {tab === 'finished' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                <Film size={16} /> 视频装配成片库
                <span style={{ marginLeft: 10, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {finishedLoading ? '加载中…' : `${finishedList.length} 条 · 来自 /videoAssembly/listPage`}
                </span>
              </div>
              <button onClick={loadFinished} disabled={finishedLoading} style={{
                display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)',
                fontSize: '0.75rem', fontWeight: 600, cursor: finishedLoading ? 'default' : 'pointer',
              }}>
                <RefreshCw size={13} style={{ marginRight: 4 }} />刷新
              </button>
            </div>

            {finishedError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: '0.75rem', color: '#ef4444', marginBottom: 12 }}>
                ⚠️ {finishedError}
              </div>
            )}

            {!finishedLoading && finishedList.length === 0 && !finishedError && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                暂无成片任务。先生成脚本蓝图，再调用 /videoAssembly/generate 触发装配。
              </div>
            )}

            {finishedList.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr><th>任务编号</th><th>蓝图</th><th>平台</th><th>目标时长</th><th>干预状态</th><th>状态</th><th>创建时间</th></tr>
                </thead>
                <tbody>
                  {finishedList.map(t => (
                    <tr key={t.taskCode ?? t.id} onClick={() => openFinishedDetail(t)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: 600 }}>{t.taskCode ?? '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.blueprintCode ?? '—'}</td>
                      <td style={{ fontSize: '0.78rem' }}>{t.platform ?? '—'}</td>
                      <td style={{ fontSize: '0.78rem' }}>{t.targetDuration ? `${t.targetDuration}s` : '—'}</td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.interventionStatus ?? '—'}</td>
                      <td>
                        <span className={`status-badge ${t.status === 'SUCCEEDED' ? 'idle' : t.status === 'FAILED' ? 'error' : 'training'}`}>
                          <span className={`status-dot ${t.status === 'SUCCEEDED' ? 'idle' : 'training'}`} />
                          {t.status ?? '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.createAt?.slice(0, 16) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== 生产队列 ===== */}
        {tab === 'render' && (
          <div className="card">
            <div className="section-title"><Monitor size={16} /> 实时生产队列</div>
            <table className="data-table">
              <thead>
                <tr><th>任务ID</th><th>产品/类型</th><th>阶段</th><th>模型</th><th>规格</th><th>GPU</th><th>进度</th><th>ETA</th><th>状态</th></tr>
              </thead>
              <tbody>
                {renderQueue.map(r => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setPanelJob(r)}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{r.product}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.videoType}</div>
                    </td>
                    <td><span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.1)', color: '#e8365d' }}>{r.stage}</span></td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{r.model}</td>
                    <td style={{ fontSize: '0.72rem' }}>{r.resolution !== '-' ? `${r.resolution} ${r.fps}fps` : '-'}</td>
                    <td style={{ fontWeight: 600 }}>{r.gpuNodes > 0 ? `${r.gpuNodes}x A100` : '待分配'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-bar" style={{ width: 70 }}>
                          <div className="progress-bar-fill" style={{ width: `${r.progress}%`, background: r.progress > 0 ? '#e8365d' : '#ffd1dc' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{r.progress}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{r.eta}</td>
                    <td>
                      <span className={`status-badge ${r.status === 'rendering' ? 'training' : 'idle'}`}>
                        <span className={`status-dot ${r.status === 'rendering' ? 'training' : 'idle'}`} />
                        {r.status === 'rendering' ? '生产中' : '排队中'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== 后期制作 ===== */}
        {tab === 'postprod' && (
          <>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>后期制作流水线</strong>：视频生成完成后自动进入后期流水线，依次执行粗剪→精剪→音效→调色→字幕→配音，各环节由独立智能体负责，支持并行处理。
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {postProductionPipeline.map((stage, i) => (
                <div key={i} className="card" onClick={() => setSelectedDetail({type:'postprod',data:stage})} style={{cursor:'pointer'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <stage.icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stage.stage}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{stage.agent}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{stage.desc}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-primary)', borderRadius: 6 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8365d' }}>{stage.activeJobs}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>执行中</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-primary)', borderRadius: 6 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{stage.avgTime}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>平均耗时</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 8, background: 'var(--bg-primary)', borderRadius: 6 }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: stage.quality >= 95 ? '#e8365d' : '#ff7a95' }}>{stage.quality}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>质量分</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== GPU集群 ===== */}
        {tab === 'gpu' && (
          <div className="card">
            <div className="section-title"><Cpu size={16} /> GPU集群实时状态</div>
            <table className="data-table">
              <thead>
                <tr><th>节点</th><th>型号</th><th>当前任务</th><th>GPU利用率</th><th>显存</th><th>温度</th><th>状态</th></tr>
              </thead>
              <tbody>
                {gpuNodes.map((node, i) => (
                  <tr key={i} onClick={() => setSelectedDetail({type:'gpu',data:node})} style={{cursor:'pointer'}}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{node.node}</td>
                    <td style={{ fontSize: '0.8rem' }}>{node.type}</td>
                    <td style={{ fontSize: '0.8rem' }}>{node.task}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div className="progress-bar-fill" style={{ width: `${node.utilization}%`, background: node.utilization > 90 ? '#dc2626' : node.utilization > 75 ? '#d97706' : '#e8365d' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{node.utilization}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{node.memory}GB/80GB</td>
                    <td style={{ fontWeight: 600, color: node.temp > 75 ? '#d97706' : 'var(--text-secondary)' }}>{node.temp}°C</td>
                    <td>
                      <span className={`status-badge ${node.status === 'busy' ? 'training' : 'idle'}`}>
                        <span className={`status-dot ${node.status === 'busy' ? 'training' : 'idle'}`} />
                        {node.status === 'busy' ? '工作中' : '空闲'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== 素材统计 ===== */}
        {tab === 'output' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title"><BarChart3 size={16} /> 各类型素材产出量</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={outputStats}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completed" fill="#e8365d" name="已完成" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="inProgress" fill="#ffb3c6" name="制作中" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="section-title"><Film size={16} /> 素材→种草转化</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: '总素材数', value: '69条', desc: '跨4种类型' },
                  { label: '产出子素材', value: '4,150', desc: '自动提取+组装' },
                  { label: '素材/产品', value: '94条', desc: '高光提取→多变体' },
                  { label: '平均素材CTR', value: '4.8%', desc: '高于行业2.8%' },
                  { label: '投放ROI', value: '3.2x', desc: '素材→种草→GMV' },
                  { label: '平台变体', value: '3种', desc: '抖音/小红书/快手' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e8365d' }}>{item.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedFinished && (
        <div onClick={() => setSelectedFinished(null)} style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(232,54,93,0.12)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 80,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 720, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            background: 'var(--bg-primary)', borderRadius: 16,
            border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(232,54,93,0.12)',
            padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                <Film size={16} style={{ verticalAlign: 'middle', marginRight: 6, color: '#e8365d' }} />
                成片任务 · {selectedFinished.taskCode}
              </h3>
              <button onClick={() => setSelectedFinished(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedFinished.resultVideoUrl && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8 }}>成片视频</div>
                <video controls style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 320, display: 'block' }}>
                  <source src={selectedFinished.resultVideoUrl} />
                </video>
                <a href={selectedFinished.resultVideoUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'block', fontSize: '0.68rem', color: '#3b82f6', marginTop: 6, wordBreak: 'break-all' }}>
                  🔗 {selectedFinished.resultVideoUrl}
                </a>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {([
                ['任务编号', selectedFinished.taskCode],
                ['状态', selectedFinished.status],
                ['平台', selectedFinished.platform],
                ['目标时长', selectedFinished.targetDuration ? `${selectedFinished.targetDuration}s` : '—'],
                ['蓝图', selectedFinished.blueprintCode],
                ['干预状态', selectedFinished.interventionStatus],
                ['创建时间', selectedFinished.createAt?.slice(0, 16)],
                ['创建人', selectedFinished.createName],
              ] as [string, string | number | undefined][]).map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, wordBreak: 'break-all' }}>{val || '—'}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <AssemblyPlanStrip planSections={selectedFinished.planSections} candidates={selectedFinished.candidates} />
            </div>

            {selectedFinished.summaryJson && (() => {
              try {
                const summary = JSON.parse(selectedFinished.summaryJson)
                return (
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>装配摘要</div>
                    <pre style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, maxHeight: 320, overflowY: 'auto' }}>
                      {JSON.stringify(summary, null, 2)}
                    </pre>
                  </div>
                )
              } catch { return null }
            })()}
          </div>
        </div>
      )}
      {selectedDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(232,54,93,0.12)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          paddingTop: 80,
        }} onClick={() => setSelectedDetail(null)}>
          <div style={{
            width: 720, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            background: 'var(--bg-primary)', borderRadius: 16,
            border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(232,54,93,0.12)',
            padding: 24,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {selectedDetail.type === 'kpi' && `${selectedDetail.data.label} 详细分析`}
                {selectedDetail.type === 'gpu' && `GPU节点 · ${selectedDetail.data.node}`}
                {selectedDetail.type === 'postprod' && `后期阶段 · ${selectedDetail.data.stage}`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'kpi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">生产时间线</div>
                  <table className="data-table">
                    <thead><tr><th>时段</th><th>完成数</th><th>生产中</th><th>GPU利用率</th></tr></thead>
                    <tbody>
                      {[{h:'06:00-08:00',c:0,r:2,g:'45%'},{h:'08:00-10:00',c:1,r:4,g:'78%'},{h:'10:00-12:00',c:2,r:6,g:'92%'},{h:'12:00-14:00',c:3,r:5,g:'88%'}].map(r => (
                        <tr key={r.h}><td>{r.h}</td><td style={{color:'#16a34a',fontWeight:600}}>{r.c}</td><td>{r.r}</td><td style={{fontWeight:600}}>{r.g}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">各类型素材统计</div>
                  <table className="data-table">
                    <thead><tr><th>类型</th><th>已完成</th><th>制作中</th><th>平均时长</th><th>素材CTR</th></tr></thead>
                    <tbody>
                      {outputStats.map(s => (
                        <tr key={s.name}><td style={{fontWeight:600}}>{s.name}</td><td>{s.completed}</td><td>{s.inProgress}</td><td>{s.avgDuration}</td><td style={{color:'#e8365d',fontWeight:600}}>{s.avgCTR}%</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedDetail.type === 'gpu' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">节点状态</div>
                  <table className="data-table">
                    <thead><tr><th>属性</th><th>值</th></tr></thead>
                    <tbody>
                      <tr><td>节点ID</td><td style={{fontFamily:'monospace',fontWeight:600}}>{selectedDetail.data.node}</td></tr>
                      <tr><td>GPU型号</td><td>{selectedDetail.data.type}</td></tr>
                      <tr><td>当前任务</td><td style={{fontWeight:600}}>{selectedDetail.data.task}</td></tr>
                      <tr><td>GPU利用率</td><td style={{fontWeight:700,color: selectedDetail.data.utilization > 90 ? '#dc2626' : '#e8365d'}}>{selectedDetail.data.utilization}%</td></tr>
                      <tr><td>显存占用</td><td>{selectedDetail.data.memory}GB / 80GB</td></tr>
                      <tr><td>温度</td><td style={{color: selectedDetail.data.temp > 75 ? '#d97706' : 'var(--text-primary)'}}>{selectedDetail.data.temp}°C</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">近期任务历史</div>
                  <table className="data-table">
                    <thead><tr><th>时间</th><th>任务</th><th>耗时</th><th>质量分</th></tr></thead>
                    <tbody>
                      {[{t:'13:45',task:'唇釉试色视频生成',d:'42min',q:94.5},{t:'12:58',task:'眼影妆容教程生成',d:'38min',q:95.2},{t:'12:15',task:'粉底液对比测评',d:'15min',q:92.8},{t:'11:40',task:'卸妆水开箱视频',d:'22min',q:96.1}].map(r => (
                        <tr key={r.t}><td>{r.t}</td><td>{r.task}</td><td>{r.d}</td><td style={{fontWeight:700,color:'#e8365d'}}>{r.q}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">编码输出详情</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                    {[{l:'编码格式',v:'H.265 / HEVC'},{l:'比特率',v:'8 Mbps VBR'},{l:'色彩空间',v:'BT.709 / 8bit'},{l:'容器格式',v:'MP4 / fMP4'},{l:'音频编码',v:'AAC 256kbps'},{l:'平台适配',v:'3个变体'}].map(c => (
                      <div key={c.l} style={{padding:10,background:'var(--bg-card)',borderRadius:8}}>
                        <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{c.l}</div>
                        <div style={{fontSize:'0.82rem',fontWeight:600}}>{c.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedDetail.type === 'postprod' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">阶段概览</div>
                  <table className="data-table">
                    <thead><tr><th>属性</th><th>值</th></tr></thead>
                    <tbody>
                      <tr><td>阶段名称</td><td style={{fontWeight:600}}>{selectedDetail.data.stage}</td></tr>
                      <tr><td>智能体</td><td>{selectedDetail.data.agent}</td></tr>
                      <tr><td>执行中任务</td><td style={{fontWeight:700,color:'#e8365d'}}>{selectedDetail.data.activeJobs}</td></tr>
                      <tr><td>平均耗时</td><td>{selectedDetail.data.avgTime}</td></tr>
                      <tr><td>质量评分</td><td style={{fontWeight:700,color:'#e8365d'}}>{selectedDetail.data.quality}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">当前执行队列</div>
                  <table className="data-table">
                    <thead><tr><th>任务</th><th>素材</th><th>进度</th><th>预计完成</th></tr></thead>
                    <tbody>
                      {[{t:'J-301',ep:'唇釉丝绒试色视频',p:'78%',e:'5min'},{t:'J-302',ep:'眼影盘妆容教程',p:'45%',e:'12min'},{t:'J-303',ep:'粉底液对比测评',p:'22%',e:'18min'}].map(r => (
                        <tr key={r.t}><td style={{fontFamily:'monospace'}}>{r.t}</td><td>{r.ep}</td><td style={{fontWeight:600}}>{r.p}</td><td>{r.e}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">质量趋势</div>
                  <table className="data-table">
                    <thead><tr><th>日期</th><th>处理量</th><th>平均质量分</th><th>返工率</th></tr></thead>
                    <tbody>
                      {[{d:'04-01',v:18,q:93.5,r:'5.6%'},{d:'04-02',v:22,q:94.8,r:'4.5%'},{d:'04-03',v:20,q:95.2,r:'3.3%'},{d:'04-04',v:15,q:selectedDetail.data.quality,r:'2.1%'}].map(r => (
                        <tr key={r.d}><td>{r.d}</td><td>{r.v}</td><td style={{fontWeight:700,color:'#e8365d'}}>{r.q}</td><td style={{color: parseFloat(r.r) > 4 ? '#dc2626' : '#16a34a'}}>{r.r}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
