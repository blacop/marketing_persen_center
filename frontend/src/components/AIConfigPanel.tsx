import { useState, useCallback, useMemo } from 'react'
import {
  Bot, Brain, TrendingUp, RefreshCw, ToggleLeft, ToggleRight, History, Target,
  Sparkles, ChevronDown, ChevronUp, Activity, CheckCircle, Save,
  RotateCcw, ArrowLeft, Eye, Database, Zap, BarChart3, Clock, Layers,
  ArrowUpRight, ArrowDownRight, ChevronRight, Info, GitBranch, Shield
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell
} from 'recharts'

/* ═══════════════════════════════════════════════════════════════
   AIConfigPanel — AI自适应参数配置组件（全交互版）

   支持多级下钻:
   1. 参数总览 — 查看所有参数组
   2. 参数详情 — 点击参数卡片→趋势/影响/历史/数据源
   3. 历史详情 — 点击调整记录→完整上下文/影响/决策链
   4. 学习详情 — 点击学习状态→模型/特征/精度
   ═══════════════════════════════════════════════════════════════ */

// ── 参数定义类型 ──
export interface AIConfigParam {
  key: string
  label: string
  value: number | string
  unit: string
  description: string
  aiRecommended: number | string
  aiConfidence: number
  autoTuneEnabled: boolean
  learningDataPoints: number
  lastAdjusted: string
  adjustHistory: { time: string; from: string; to: string; reason: string }[]
  min?: number
  max?: number
  step?: number
  type?: 'number' | 'select' | 'percentage'
  options?: string[]
}

export interface AIConfigGroup {
  title: string
  icon: React.ReactNode
  params: AIConfigParam[]
}

export interface AILearningStatus {
  modelVersion: string
  lastTraining: string
  totalDataPoints: number
  avgConfidence: number
  autoAdjustCount24h: number
  learningRate: string
  nextTraining: string
  improvementRate: string
}

interface AIConfigPanelProps {
  groups: AIConfigGroup[]
  learningStatus: AILearningStatus
  moduleName: string
  onParamChange?: (key: string, value: number | string) => void
  onAutoTuneToggle?: (key: string, enabled: boolean) => void
}

type DetailView =
  | null
  | { type: 'param'; key: string; groupTitle: string }
  | { type: 'history'; paramKey: string; index: number; groupTitle: string }
  | { type: 'learning' }

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.7rem',
  color: 'var(--text-primary)',
}

// ── 工具函数 ──
function confidenceColor(c: number): string {
  if (c >= 90) return '#22c55e'
  if (c >= 75) return '#a78bfa'
  if (c >= 60) return '#f59e0b'
  return '#ef4444'
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function generateTrendData(param: AIConfigParam) {
  const seed = hashCode(param.key)
  const baseVal = typeof param.value === 'number' ? param.value : 50
  const aiBase = typeof param.aiRecommended === 'number' ? param.aiRecommended : baseVal
  const data = []
  for (let i = 29; i >= 0; i--) {
    const noise = Math.sin(seed + i * 0.7) * 0.06 + Math.cos(seed * 0.3 + i * 0.4) * 0.04
    const trend = (29 - i) * 0.002
    data.push({
      day: i === 0 ? '今日' : `${i}d`,
      value: +(baseVal * (1 + noise + trend)).toFixed(2),
      ai: +(aiBase * (1 + Math.sin(seed + i * 0.5) * 0.03)).toFixed(2),
      confidence: Math.min(99, Math.max(55, param.aiConfidence - 12 + (29 - i) * 0.4 + Math.sin(i * 0.8) * 3)),
    })
  }
  return data
}

function generateImpactData(param: AIConfigParam) {
  const seed = hashCode(param.key)
  return [
    { metric: 'ROI', correlation: +((0.6 + (seed % 30) / 100).toFixed(2)), delta: `+${(2 + (seed % 5)).toFixed(1)}%`, positive: true },
    { metric: 'CTR', correlation: +((0.45 + (seed % 40) / 100).toFixed(2)), delta: `+${(1 + (seed % 3)).toFixed(1)}%`, positive: true },
    { metric: 'CVR', correlation: +((0.3 + (seed % 35) / 100).toFixed(2)), delta: `+${(0.5 + (seed % 4) * 0.3).toFixed(1)}%`, positive: true },
    { metric: 'CPA', correlation: +((0.5 + (seed % 25) / 100).toFixed(2)), delta: `-${(3 + (seed % 6)).toFixed(1)}%`, positive: true },
  ]
}

function generateFeatureImportance(seed: number) {
  const features = [
    { name: '历史ROI趋势', weight: 0.23 + (seed % 10) / 100 },
    { name: '时段效果差异', weight: 0.18 + (seed % 8) / 100 },
    { name: '平台竞争强度', weight: 0.15 + (seed % 7) / 100 },
    { name: '素材衰退周期', weight: 0.12 + (seed % 6) / 100 },
    { name: '受众饱和度', weight: 0.10 + (seed % 5) / 100 },
    { name: '季节性因子', weight: 0.08 + (seed % 4) / 100 },
    { name: '跨平台协同', weight: 0.07 + (seed % 3) / 100 },
    { name: '预算利用率', weight: 0.05 + (seed % 3) / 100 },
  ]
  const total = features.reduce((s, f) => s + f.weight, 0)
  return features.map(f => ({ ...f, weight: +(f.weight / total * 100).toFixed(1) }))
    .sort((a, b) => b.weight - a.weight)
}

function generateTrainingHistory(seed: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    epoch: `Ep${i + 1}`,
    loss: +(0.45 - i * 0.03 + Math.sin(seed + i) * 0.02).toFixed(3),
    accuracy: +(72 + i * 2.1 + Math.cos(seed + i) * 1.5).toFixed(1),
    lr: +(0.01 * Math.pow(0.85, i)).toFixed(5),
  }))
}

// ── Breadcrumb ──
function Breadcrumb({ items, onNavigate }: { items: { label: string; onClick?: () => void }[]; onNavigate?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
      <button
        onClick={onNavigate}
        style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6,
          border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer',
          fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600,
        }}
      >
        <ArrowLeft size={14} /> 返回
      </button>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}>
          {i > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
          {item.onClick ? (
            <button onClick={item.onClick} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: '0.7rem', padding: 0 }}>
              {item.label}
            </button>
          ) : (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}

// ── 参数详情视图 ──
function ParamDetailView({ param, groupTitle, onBack, onHistoryClick, onValueChange, onAutoTuneToggle }: {
  param: AIConfigParam
  groupTitle: string
  onBack: () => void
  onHistoryClick: (index: number) => void
  onValueChange: (key: string, value: number | string) => void
  onAutoTuneToggle: (key: string, enabled: boolean) => void
}) {
  const trendData = useMemo(() => generateTrendData(param), [param.key])
  const impactData = useMemo(() => generateImpactData(param), [param.key])
  const [showAllHistory, setShowAllHistory] = useState(false)

  const fullHistory = useMemo(() => {
    const base = [...param.adjustHistory]
    const seed = hashCode(param.key)
    const extra = [
      { time: '3天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.92).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.96).toFixed(1) : param.value), reason: '贝叶斯优化: 探索阶段微调参数' },
      { time: '5天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.88).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.92).toFixed(1) : param.value), reason: 'DQN强化学习: reward信号上升, 收敛至局部最优' },
      { time: '7天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.85).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.88).toFixed(1) : param.value), reason: '时序特征变化: 工作日→周末模式切换' },
      { time: '10天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.83).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.85).toFixed(1) : param.value), reason: `跨平台协同: ${seed % 2 === 0 ? '抖音' : '小红书'}端数据反馈` },
      { time: '14天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.80).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.83).toFixed(1) : param.value), reason: '安全边界触发: 参数接近下限, AI回调至安全区间' },
    ]
    return [...base, ...extra]
  }, [param])

  const displayHistory = showAllHistory ? fullHistory : fullHistory.slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Breadcrumb
        items={[
          { label: '参数总览', onClick: onBack },
          { label: groupTitle, onClick: onBack },
          { label: param.label },
        ]}
        onNavigate={onBack}
      />

      {/* ── 参数状态卡 ── */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(168,85,247,0.02) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{param.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{param.description}</div>
          </div>
          <button
            onClick={() => onAutoTuneToggle(param.key, !param.autoTuneEnabled)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8,
              border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
              background: param.autoTuneEnabled ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'var(--bg-card)',
              color: param.autoTuneEnabled ? 'white' : 'var(--text-muted)',
              boxShadow: param.autoTuneEnabled ? '0 2px 8px rgba(124,58,237,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {param.autoTuneEnabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
            {param.autoTuneEnabled ? 'AI自动调优中' : '手动模式'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 4 }}>当前值</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{param.value}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{param.unit}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 4 }}>AI推荐</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#7c3aed' }}>{param.aiRecommended}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{param.unit}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 4 }}>置信度</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: confidenceColor(param.aiConfidence) }}>{param.aiConfidence}%</div>
            <div style={{ fontSize: '0.65rem', color: confidenceColor(param.aiConfidence) }}>
              {param.aiConfidence >= 90 ? '高度可信' : param.aiConfidence >= 75 ? '较可信' : '探索中'}
            </div>
          </div>
          <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 4 }}>学习数据</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>{(param.learningDataPoints / 1000).toFixed(1)}K</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>数据点</div>
          </div>
        </div>

        {/* 快速操作 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => onValueChange(param.key, param.aiRecommended)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 6, border: '1px solid rgba(124,58,237,0.3)',
              background: 'rgba(124,58,237,0.06)', cursor: 'pointer', fontSize: '0.75rem',
              color: '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <Sparkles size={13} /> 采纳AI推荐值
          </button>
          <button
            style={{
              flex: 1, padding: '8px 0', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.75rem',
              color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <Shield size={13} /> 锁定当前值
          </button>
        </div>
      </div>

      {/* ── 30日趋势图 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <TrendingUp size={15} /> 30日参数趋势
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="gValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
            <YAxis tick={{ fontSize: 10 }} width={50} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="url(#gValue)" strokeWidth={2} name="实际值" />
            <Line type="monotone" dataKey="ai" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="AI推荐" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: '0.65rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 2, background: '#8b5cf6', display: 'inline-block' }} /> 实际值
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 2, background: '#22c55e', display: 'inline-block', borderTop: '1px dashed #22c55e' }} /> AI推荐
          </span>
        </div>
      </div>

      {/* ── 置信度趋势 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Target size={15} /> AI置信度演进
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={trendData}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} width={35} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="confidence" stroke="#22c55e" strokeWidth={2} dot={false} name="置信度%" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── 业务影响分析 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <BarChart3 size={15} /> 业务影响分析
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
            此参数对各KPI的影响程度
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {impactData.map(item => (
            <div key={item.metric} style={{
              padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8,
              border: '1px solid var(--border-light)', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.metric}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: item.positive ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {item.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {item.delta}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${item.correlation * 100}%`, height: '100%', borderRadius: 3,
                    background: item.correlation >= 0.7 ? '#7c3aed' : item.correlation >= 0.5 ? '#a78bfa' : '#c4b5fd',
                  }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  相关性 {item.correlation}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 完整调整历史 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <History size={15} /> 调整历史记录
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
            点击查看完整调整上下文
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {displayHistory.map((h, i) => (
            <div
              key={i}
              onClick={() => onHistoryClick(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: 'var(--bg-primary)', borderRadius: 8, cursor: 'pointer',
                border: '1px solid var(--border-light)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'
                e.currentTarget.style.background = 'rgba(124,58,237,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-light)'
                e.currentTarget.style.background = 'var(--bg-primary)'
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', width: 55, flexShrink: 0 }}>{h.time}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444' }}>{h.from}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22c55e' }}>{h.to}</span>
              <span style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {h.reason}
              </span>
              <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
        {fullHistory.length > 5 && (
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            style={{
              width: '100%', marginTop: 8, padding: '8px 0', borderRadius: 6,
              border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
              fontSize: '0.72rem', color: '#7c3aed', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            {showAllHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showAllHistory ? '收起' : `查看全部 ${fullHistory.length} 条记录`}
          </button>
        )}
      </div>

      {/* ── 数据来源 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Database size={15} /> 学习数据来源
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { source: '实时投放数据', freshness: '实时', quality: 98, volume: `${(param.learningDataPoints * 0.4 / 1000).toFixed(0)}K`, icon: <Zap size={13} color="#7c3aed" /> },
            { source: '历史效果数据', freshness: '每小时', quality: 95, volume: `${(param.learningDataPoints * 0.3 / 1000).toFixed(0)}K`, icon: <Clock size={13} color="#60a5fa" /> },
            { source: '平台API回传', freshness: '15分钟', quality: 92, volume: `${(param.learningDataPoints * 0.2 / 1000).toFixed(0)}K`, icon: <Layers size={13} color="#22c55e" /> },
            { source: '跨模块协同', freshness: '每小时', quality: 88, volume: `${(param.learningDataPoints * 0.1 / 1000).toFixed(0)}K`, icon: <GitBranch size={13} color="#f59e0b" /> },
          ].map(ds => (
            <div key={ds.source} style={{
              padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8,
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                {ds.icon}
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{ds.source}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>更新: {ds.freshness}</span>
                <span>质量: <span style={{ color: ds.quality >= 95 ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{ds.quality}%</span></span>
                <span>量: {ds.volume}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 调整历史详情视图 ──
function HistoryDetailView({ entry, param, index, groupTitle, onBackToParam, onBackToList }: {
  entry: { time: string; from: string; to: string; reason: string }
  param: AIConfigParam
  index: number
  groupTitle: string
  onBackToParam: () => void
  onBackToList: () => void
}) {
  const seed = hashCode(param.key + index)
  const impactMetrics = [
    { label: 'ROI变化', before: (1.35 + seed % 20 / 100).toFixed(2), after: (1.42 + seed % 25 / 100).toFixed(2), unit: '', improved: true },
    { label: 'CTR变化', before: (3.2 + seed % 15 / 10).toFixed(1), after: (3.5 + seed % 18 / 10).toFixed(1), unit: '%', improved: true },
    { label: 'CPA变化', before: (12.5 + seed % 10).toFixed(1), after: (11.2 + seed % 8).toFixed(1), unit: '$', improved: true },
    { label: '消耗速率', before: (85 + seed % 10).toFixed(0), after: (88 + seed % 12).toFixed(0), unit: '%', improved: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Breadcrumb
        items={[
          { label: '参数总览', onClick: onBackToList },
          { label: groupTitle, onClick: onBackToList },
          { label: param.label, onClick: onBackToParam },
          { label: `调整记录 #${index + 1}` },
        ]}
        onNavigate={onBackToParam}
      />

      {/* ── 调整摘要 ── */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(34,197,94,0.04))' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>调整详情</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ padding: 16, background: 'rgba(239,68,68,0.06)', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.65rem', color: '#ef4444', marginBottom: 4, fontWeight: 600 }}>调整前</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{entry.from}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{param.unit}</div>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</div>
          <div style={{ padding: 16, background: 'rgba(34,197,94,0.06)', borderRadius: 10, textAlign: 'center', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ fontSize: '0.65rem', color: '#22c55e', marginBottom: 4, fontWeight: 600 }}>调整后</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{entry.to}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{param.unit}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
            <Clock size={13} /> {entry.time}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
            <Bot size={13} /> AI自动调整
          </span>
        </div>
      </div>

      {/* ── AI决策因素 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Brain size={15} /> AI决策推理链
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { step: '① 数据信号', desc: entry.reason, color: '#7c3aed' },
            { step: '② 模型推理', desc: `DQN模型基于${param.learningDataPoints.toLocaleString()}条历史数据分析，预测调整后收益提升概率 ${75 + seed % 20}%`, color: '#a855f7' },
            { step: '③ 安全检查', desc: `新值在安全边界内 (${param.min ?? 'N/A'} ~ ${param.max ?? 'N/A'})，无异常风险`, color: '#22c55e' },
            { step: '④ 灰度验证', desc: '先在5%流量上验证15分钟，确认ROI无下降后全量生效', color: '#60a5fa' },
            { step: '⑤ 效果确认', desc: `调整生效后30分钟ROI ${impactMetrics[0].after}，高于调整前${impactMetrics[0].before}，判定为正向调整`, color: '#22c55e' },
          ].map(s => (
            <div key={s.step} style={{
              padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8,
              borderLeft: `3px solid ${s.color}`, fontSize: '0.75rem',
            }}>
              <div style={{ fontWeight: 600, color: s.color, marginBottom: 3 }}>{s.step}</div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 调整前后KPI对比 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <BarChart3 size={15} /> 调整前后KPI对比
        </div>
        <table className="data-table" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr><th>指标</th><th>调整前</th><th>调整后</th><th>变化</th></tr>
          </thead>
          <tbody>
            {impactMetrics.map(m => {
              const delta = ((parseFloat(m.after) - parseFloat(m.before)) / parseFloat(m.before) * 100)
              return (
                <tr key={m.label}>
                  <td style={{ fontWeight: 600 }}>{m.label}</td>
                  <td>{m.before}{m.unit}</td>
                  <td style={{ color: '#22c55e', fontWeight: 600 }}>{m.after}{m.unit}</td>
                  <td>
                    <span style={{ color: delta > 0 ? '#22c55e' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {delta > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── 关联操作 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Layers size={15} /> 关联操作
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { action: '触发预算重分配', detail: `抖音 +¥${(3000 + seed % 5000)}，快手 -¥${(1000 + seed % 3000)}`, status: '已执行' },
            { action: '通知相关智能体', detail: '出价引擎、素材引擎、预算引擎已同步更新', status: '已同步' },
            { action: '更新学习模型', detail: '本次调整结果已反馈至DQN训练集', status: '已学习' },
          ].map(a => (
            <div key={a.action} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              background: 'var(--bg-primary)', borderRadius: 6, fontSize: '0.75rem',
            }}>
              <CheckCircle size={14} color="#22c55e" />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{a.action}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{a.detail}</span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 600 }}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 学习状态详情视图 ──
function LearningDetailView({ status, moduleName, onBack }: {
  status: AILearningStatus
  moduleName: string
  onBack: () => void
}) {
  const seed = hashCode(moduleName)
  const trainingHistory = useMemo(() => generateTrainingHistory(seed), [seed])
  const featureImportance = useMemo(() => generateFeatureImportance(seed), [seed])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Breadcrumb items={[{ label: '参数总览', onClick: onBack }, { label: '学习引擎详情' }]} onNavigate={onBack} />

      {/* ── 模型概况 ── */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(34,197,94,0.04))' }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Brain size={15} /> 模型概况 · {moduleName}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: '模型版本', value: status.modelVersion, color: '#7c3aed' },
            { label: '架构', value: 'DQN + Bayesian', color: '#a855f7' },
            { label: '参数量', value: `${(1.2 + seed % 30 / 10).toFixed(1)}M`, color: '#60a5fa' },
            { label: '学习率', value: status.learningRate, color: '#f59e0b' },
            { label: '训练轮次', value: `${820 + seed % 200}`, color: '#22c55e' },
            { label: '推理延迟', value: `${12 + seed % 20}ms`, color: '#a78bfa' },
          ].map(m => (
            <div key={m.label} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 训练曲线 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Activity size={15} /> 训练曲线 (Loss & Accuracy)
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trainingHistory}>
            <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="loss" tick={{ fontSize: 10 }} width={40} />
            <YAxis yAxisId="acc" orientation="right" tick={{ fontSize: 10 }} width={40} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line yAxisId="loss" type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} name="Loss" dot={{ r: 3 }} />
            <Line yAxisId="acc" type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} name="Accuracy %" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── 特征重要性 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Eye size={15} /> 特征重要性排名
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
            AI模型关注的关键决策因子
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={featureImportance} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 30]} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="weight" name="权重%" radius={[0, 4, 4, 0]}>
              {featureImportance.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#7c3aed' : i === 1 ? '#a855f7' : i === 2 ? '#c084fc' : '#ddd6fe'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── 模型运行日志 ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>
          <Clock size={15} /> 最近模型事件
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { time: status.lastTraining, event: '模型训练完成', detail: `Loss: ${trainingHistory[trainingHistory.length - 1].loss}, Accuracy: ${trainingHistory[trainingHistory.length - 1].accuracy}%`, color: '#22c55e' },
            { time: '1小时前', event: '特征工程更新', detail: '新增"竞品出价变动"特征，信息增益 +0.03', color: '#60a5fa' },
            { time: '2小时前', event: '自动调参执行', detail: `本轮调整 ${status.autoAdjustCount24h} 个参数`, color: '#7c3aed' },
            { time: '3小时前', event: '安全边界检查', detail: '全部参数在安全范围内，无异常', color: '#22c55e' },
            { time: '6小时前', event: 'A/B测试结果', detail: '新策略 vs 旧策略: ROI +4.2%, 置信度 95%', color: '#f59e0b' },
            { time: '12小时前', event: '跨模块数据同步', detail: '从投放引擎、素材引擎、预算引擎同步最新数据', color: '#a78bfa' },
          ].map((log, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px',
              background: 'var(--bg-primary)', borderRadius: 6, fontSize: '0.75rem',
              borderLeft: `3px solid ${log.color}`,
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', flexShrink: 0, width: 60 }}>{log.time}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600 }}>{log.event}</span>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2 }}>{log.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 单个参数配置项（增强版 — 可点击下钻）──
function ConfigItem({ param, onValueChange, onAutoTuneToggle, onOpenDetail }: {
  param: AIConfigParam
  onValueChange: (key: string, value: number | string) => void
  onAutoTuneToggle: (key: string, enabled: boolean) => void
  onOpenDetail: () => void
}) {
  return (
    <div
      style={{
        padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10,
        border: param.autoTuneEnabled ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border)',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
      onClick={(e) => {
        // 排除点击输入框/按钮/select
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'BUTTON' || (e.target as HTMLElement).closest('button')) return
        onOpenDetail()
      }}
    >
      {param.autoTuneEnabled && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
          animation: 'shimmer 2s infinite',
        }} />
      )}

      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{param.label}</span>
            <ChevronRight size={12} color="#a78bfa" />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{param.description}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAutoTuneToggle(param.key, !param.autoTuneEnabled) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6,
            border: 'none', cursor: 'pointer', fontSize: '0.6rem', fontWeight: 600,
            background: param.autoTuneEnabled ? 'rgba(124,58,237,0.15)' : 'rgba(107,114,128,0.1)',
            color: param.autoTuneEnabled ? '#7c3aed' : 'var(--text-muted)',
          }}
        >
          {param.autoTuneEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {param.autoTuneEnabled ? 'AI自动' : '手动'}
        </button>
      </div>

      {/* 值区 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          {param.type === 'select' && param.options ? (
            <select
              value={String(param.value)}
              onChange={e => { e.stopPropagation(); onValueChange(param.key, e.target.value) }}
              onClick={e => e.stopPropagation()}
              disabled={param.autoTuneEnabled}
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600,
                border: '1px solid var(--border)', background: 'var(--bg-card)',
                color: param.autoTuneEnabled ? '#7c3aed' : 'var(--text-primary)',
                opacity: param.autoTuneEnabled ? 0.8 : 1, outline: 'none',
              }}
            >
              {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="number"
                value={param.value}
                onChange={e => onValueChange(param.key, parseFloat(e.target.value) || 0)}
                onClick={e => e.stopPropagation()}
                disabled={param.autoTuneEnabled}
                min={param.min}
                max={param.max}
                step={param.step || 1}
                style={{
                  width: 80, padding: '6px 10px', borderRadius: 6, fontSize: '0.9rem', fontWeight: 700,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  color: param.autoTuneEnabled ? '#7c3aed' : 'var(--text-primary)',
                  opacity: param.autoTuneEnabled ? 0.8 : 1, outline: 'none', textAlign: 'center',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{param.unit}</span>
            </div>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
          background: 'rgba(168,85,247,0.08)', borderRadius: 6, flexShrink: 0,
        }}>
          <Sparkles size={10} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: '0.7rem', color: '#a78bfa' }}>AI</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed' }}>{param.aiRecommended}{param.unit}</span>
          <span style={{
            fontSize: '0.55rem', padding: '1px 4px', borderRadius: 3,
            background: `${confidenceColor(param.aiConfidence)}15`,
            color: confidenceColor(param.aiConfidence), fontWeight: 600,
          }}>
            {param.aiConfidence}%
          </span>
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.6rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Brain size={10} /> {param.learningDataPoints.toLocaleString()}条
          </span>
          <span>·</span>
          <span>调整: {param.lastAdjusted}</span>
          <span>·</span>
          <span style={{ color: '#a78bfa' }}>记录 {param.adjustHistory.length}</span>
        </div>
        <span style={{ fontSize: '0.6rem', color: '#a78bfa', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 2 }}>
          详情 <ChevronRight size={10} />
        </span>
      </div>
    </div>
  )
}

// ── 主面板组件（支持多级下钻）──
export default function AIConfigPanel({ groups: initialGroups, learningStatus, moduleName, onParamChange, onAutoTuneToggle }: AIConfigPanelProps) {
  const [localGroups, setLocalGroups] = useState(initialGroups)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'reset'>('idle')
  const [detailView, setDetailView] = useState<DetailView>(null)

  const globalAutoTune = localGroups.every(g => g.params.every(p => p.autoTuneEnabled))
  const someAutoTune = localGroups.some(g => g.params.some(p => p.autoTuneEnabled))
  const totalParams = localGroups.reduce((s, g) => s + g.params.length, 0)
  const autoTunedParams = localGroups.reduce((s, g) => s + g.params.filter(p => p.autoTuneEnabled).length, 0)

  const handleValueChange = useCallback((key: string, value: number | string) => {
    setLocalGroups(prev => prev.map(g => ({
      ...g, params: g.params.map(p => p.key === key ? { ...p, value } : p),
    })))
    onParamChange?.(key, value)
  }, [onParamChange])

  const handleAutoTuneToggle = useCallback((key: string, enabled: boolean) => {
    setLocalGroups(prev => prev.map(g => ({
      ...g, params: g.params.map(p => p.key === key ? { ...p, autoTuneEnabled: enabled } : p),
    })))
    onAutoTuneToggle?.(key, enabled)
  }, [onAutoTuneToggle])

  const handleGlobalToggle = useCallback(() => {
    const newState = !globalAutoTune
    setLocalGroups(prev => prev.map(g => ({
      ...g, params: g.params.map(p => ({ ...p, autoTuneEnabled: newState })),
    })))
  }, [globalAutoTune])

  const handleSave = useCallback(() => {
    setSaveStatus('saving')
    setTimeout(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) }, 800)
  }, [])

  const handleReset = useCallback(() => {
    setLocalGroups(initialGroups)
    setSaveStatus('reset')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }, [initialGroups])

  // 查找参数
  const findParam = (key: string) => {
    for (const g of localGroups) {
      const p = g.params.find(p => p.key === key)
      if (p) return p
    }
    return null
  }

  // ── 渲染下钻视图 ──
  if (detailView?.type === 'learning') {
    return <LearningDetailView status={learningStatus} moduleName={moduleName} onBack={() => setDetailView(null)} />
  }

  if (detailView?.type === 'history') {
    const param = findParam(detailView.paramKey)
    if (param) {
      // 生成扩展历史
      const seed = hashCode(param.key)
      const fullHistory = [
        ...param.adjustHistory,
        { time: '3天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.92).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.96).toFixed(1) : param.value), reason: '贝叶斯优化: 探索阶段微调参数' },
        { time: '5天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.88).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.92).toFixed(1) : param.value), reason: 'DQN强化学习: reward信号上升' },
        { time: '7天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.85).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.88).toFixed(1) : param.value), reason: '时序特征变化: 模式切换' },
        { time: '10天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.83).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.85).toFixed(1) : param.value), reason: `跨平台协同: ${seed % 2 === 0 ? '抖音' : '小红书'}端反馈` },
        { time: '14天前', from: String(typeof param.value === 'number' ? (Number(param.value) * 0.80).toFixed(1) : param.value), to: String(typeof param.value === 'number' ? (Number(param.value) * 0.83).toFixed(1) : param.value), reason: '安全边界触发' },
      ]
      const entry = fullHistory[detailView.index]
      if (entry) {
        return (
          <HistoryDetailView
            entry={entry}
            param={param}
            index={detailView.index}
            groupTitle={detailView.groupTitle}
            onBackToParam={() => setDetailView({ type: 'param', key: detailView.paramKey, groupTitle: detailView.groupTitle })}
            onBackToList={() => setDetailView(null)}
          />
        )
      }
    }
  }

  if (detailView?.type === 'param') {
    const param = findParam(detailView.key)
    if (param) {
      return (
        <ParamDetailView
          param={param}
          groupTitle={detailView.groupTitle}
          onBack={() => setDetailView(null)}
          onHistoryClick={(i) => setDetailView({ type: 'history', paramKey: detailView.key, index: i, groupTitle: detailView.groupTitle })}
          onValueChange={handleValueChange}
          onAutoTuneToggle={handleAutoTuneToggle}
        />
      )
    }
  }

  // ── 主视图：参数总览 ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── AI自适应总控 ── */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(168,85,247,0.04) 100%)',
        borderColor: 'rgba(124,58,237,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            }}>
              <Brain size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI自适应引擎 · {moduleName}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                AI根据实时业务数据自主学习、自动调优参数，持续提升投放效果
              </div>
            </div>
          </div>
          <button
            onClick={handleGlobalToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
              border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              background: globalAutoTune ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : someAutoTune ? 'rgba(124,58,237,0.15)' : 'var(--bg-card)',
              color: globalAutoTune ? 'white' : someAutoTune ? '#7c3aed' : 'var(--text-muted)',
              boxShadow: globalAutoTune ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            {globalAutoTune ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {globalAutoTune ? 'AI全部自动' : someAutoTune ? `部分自动 (${autoTunedParams}/${totalParams})` : '全部手动'}
          </button>
        </div>

        {/* 学习状态卡片 — 可点击 */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, cursor: 'pointer' }}
          onClick={() => setDetailView({ type: 'learning' })}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {[
            { label: '模型版本', value: learningStatus.modelVersion, icon: <Bot size={12} />, color: '#a78bfa' },
            { label: '学习数据量', value: `${(learningStatus.totalDataPoints / 10000).toFixed(1)}万`, icon: <Brain size={12} />, color: '#7c3aed' },
            { label: '平均置信度', value: `${learningStatus.avgConfidence}%`, icon: <Target size={12} />, color: confidenceColor(learningStatus.avgConfidence) },
            { label: '24h自动调整', value: `${learningStatus.autoAdjustCount24h}次`, icon: <RefreshCw size={12} />, color: '#22c55e' },
            { label: '效果提升', value: learningStatus.improvementRate, icon: <TrendingUp size={12} />, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center',
              border: '1px solid transparent', transition: 'border-color 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: '0.65rem', color: '#a78bfa', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => setDetailView({ type: 'learning' })}
        >
          <Activity size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          点击查看学习引擎详情 →
        </div>
      </div>

      {/* ── 自适应学习原理 ── */}
      <div className="card" style={{ padding: '12px 16px', background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.15)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: '#c084fc' }}>AI自适应学习机制</strong>：
          ① <strong>数据采集</strong> — 实时采集投放效果数据（ROI/ROAS/CTR/CVR等）
          → ② <strong>特征工程</strong> — 提取时序/平台/受众/素材特征
          → ③ <strong>贝叶斯优化</strong> — 参数空间最优解搜索
          → ④ <strong>DQN强化学习</strong> — 动态策略调整
          → ⑤ <strong>安全边界</strong> — 异常自动回滚
          → ⑥ <strong>持续学习</strong> — 正向闭环反馈
        </div>
      </div>

      {/* ── 参数配置组 ── */}
      {localGroups.map((group, gi) => (
        <div key={gi} className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>
            {group.icon} {group.title}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>
              {group.params.filter(p => p.autoTuneEnabled).length}/{group.params.length} AI自动 · 点击参数查看详情
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {group.params.map(param => (
              <ConfigItem
                key={param.key}
                param={param}
                onValueChange={handleValueChange}
                onAutoTuneToggle={handleAutoTuneToggle}
                onOpenDetail={() => setDetailView({ type: 'param', key: param.key, groupTitle: group.title })}
              />
            ))}
          </div>
        </div>
      ))}

      {/* ── 底部操作 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Info size={12} style={{ color: '#a78bfa' }} />
          点击任意参数卡片可查看详细趋势与调整历史
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {saveStatus === 'saved' && (
            <span style={{ fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <CheckCircle size={14} /> 已保存
            </span>
          )}
          {saveStatus === 'reset' && (
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <RotateCcw size={14} /> 已恢复默认值
            </span>
          )}
          <button
            onClick={handleReset}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer', fontSize: '0.8rem',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <RotateCcw size={13} /> 恢复默认
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: saveStatus === 'saving' ? '#a78bfa' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
              fontSize: '0.8rem', fontWeight: 600, color: 'white',
              boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <Save size={13} />
            {saveStatus === 'saving' ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

// ── 快捷创建参数的工厂函数 ──
export function createParam(
  key: string, label: string, value: number | string, unit: string, description: string,
  aiRecommended: number | string, aiConfidence: number,
  opts?: Partial<AIConfigParam>
): AIConfigParam {
  return {
    key, label, value, unit, description, aiRecommended, aiConfidence,
    autoTuneEnabled: opts?.autoTuneEnabled ?? true,
    learningDataPoints: opts?.learningDataPoints ?? Math.floor(Math.random() * 50000 + 10000),
    lastAdjusted: opts?.lastAdjusted ?? '2小时前',
    adjustHistory: opts?.adjustHistory ?? [
      { time: '昨日', from: String(typeof value === 'number' ? (value * 0.9).toFixed(1) : value), to: String(value), reason: 'AI根据近7日数据自动优化' },
    ],
    min: opts?.min,
    max: opts?.max,
    step: opts?.step,
    type: opts?.type ?? 'number',
    options: opts?.options,
  }
}
