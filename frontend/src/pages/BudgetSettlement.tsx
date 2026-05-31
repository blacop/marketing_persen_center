import { useState } from 'react'
import { DollarSign, TrendingUp, AlertTriangle, Shield, Bot, Brain, ArrowUpRight, Clock, CreditCard, Zap, Globe } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area, Line } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

const tabs = ['AI智能预算分配', '超预算保护与预警', '分账与结算'] as const

const platformBudget = [
  { platform: '抖音巨量', budget: 380 },
  { platform: '小红书聚光', budget: 250 },
  { platform: '快手磁力', budget: 180 },
  { platform: '天猫品销宝', budget: 90 },
  { platform: '京东京准通', budget: 50 },
  { platform: '抖音DOU+', budget: 30 },
  { platform: 'Meta Ads', budget: 185 },
  { platform: 'TikTok Global', budget: 165 },
  { platform: 'Google/YT', budget: 95 },
]

const businessLines = [
  { name: '唇妆', value: 310, color: '#e8365d' },
  { name: '眼妆', value: 210, color: '#ff7a95' },
  { name: '底妆', value: 460, color: '#ffb3c6' },
]

const aiLogs = [
  { time: '10:30', action: '底妆 ROI上升至3.8→AI自动调增¥15万→从眼妆线调拨' },
  { time: '09:45', action: '抖音巨量引擎CPM上涨12%→AI分流¥8万到小红书聚光' },
  { time: '08:20', action: '唇妆「唇釉618促销」CPA降至¥8→AI追加¥12万预算' },
  { time: '07:15', action: '快手磁力搜索竞价激烈→AI降低出价5%并转移¥6万至天猫品销宝' },
  { time: '06:00', action: '凌晨低竞价时段→AI预加载底妆广告素材，锁定¥20万低价流量' },
]

const speedData = [
  { platform: '抖音巨量', current: 82, target: 75, status: 'warning' },
  { platform: '小红书聚光', current: 68, target: 72, status: 'normal' },
  { platform: '快手磁力', current: 71, target: 70, status: 'normal' },
  { platform: '天猫品销宝', current: 93, target: 80, status: 'danger' },
  { platform: '京东京准通', current: 55, target: 65, status: 'normal' },
  { platform: '抖音DOU+', current: 44, target: 60, status: 'normal' },
  { platform: 'Meta Ads', current: 74, target: 72, status: 'warning' },
  { platform: 'TikTok Global', current: 63, target: 68, status: 'normal' },
  { platform: 'Google/YT', current: 57, target: 60, status: 'normal' },
]

const alerts = [
  { level: '严重', platform: '天猫品销宝', line: '底妆', msg: '消耗速度超目标16%，预计4月18日耗尽预算', action: 'AI已自动降速15%' },
  { level: '警告', platform: '抖音巨量', line: '唇妆', msg: '北美市场CPM持续走高，ROI跌破2.5阈值', action: 'AI建议转移¥20万至小红书聚光' },
  { level: '警告', platform: '快手磁力', line: '眼妆', msg: '搜索广告CPC上涨8%，预算消耗加速', action: 'AI已降低出价并缩减受众' },
  { level: '提示', platform: '小红书聚光', line: '底妆', msg: '华南地区素材疲劳，CTR下降0.3%', action: 'AI已切换备选素材包' },
  { level: '警告', platform: 'Meta Ads', line: '海外', msg: 'EUR/CNY汇率波动达2.8%超阈值，EU广告实际成本偏高', action: 'AI已启用汇率对冲缓冲，自动调低EU出价3%' },
  { level: '提示', platform: 'TikTok Global', line: '海外', msg: 'JP市场TikTok算法近期偏好UGC测评内容，专业广告CTR略降', action: 'AI建议追加KOL素材比例至60%' },
]

const profitSplit = [
  { name: '品牌方', value: 30, color: '#e8365d' },
  { name: '达人', value: 20, color: '#ff7a95' },
  { name: '平台', value: 15, color: '#ffb3c6' },
  { name: '公司利润', value: 35, color: '#ffc8d5' },
]

const settlements = [
  { id: 'SET-0403-001', type: '产品线分账', party: '唇釉丝绒系列', amount: 52300, status: 'completed', time: '14:20' },
  { id: 'SET-0403-002', type: '达人佣金', party: '@Sakura_Chan', amount: 8720, status: 'completed', time: '14:15' },
  { id: 'SET-0403-003', type: '平台服务费', party: '抖音巨量 Ads', amount: 15400, status: 'completed', time: '13:50' },
  { id: 'SET-0403-004', type: '产品线分账', party: '眼影盘星空', amount: 31200, status: 'processing', time: '13:30' },
  { id: 'SET-0403-005', type: '达人佣金', party: '@Maria_Beauty', amount: 5960, status: 'completed', time: '13:10' },
  { id: 'SET-0403-006', type: '公司利润', party: '内部结转', amount: 67800, status: 'completed', time: '12:45' },
  { id: 'SET-0403-007', type: '平台服务费', party: 'Meta Ads (Facebook)', amount: 89600, status: 'completed', time: '12:30' },
  { id: 'SET-0403-008', type: '平台服务费', party: 'TikTok for Business', amount: 64000, status: 'processing', time: '11:55' },
  { id: 'SET-0403-009', type: '平台服务费', party: 'Google Ads', amount: 46000, status: 'completed', time: '11:40' },
]

const monthlySummary = [
  { month: '1月', copyright: 156, talent: 104, platform: 78, profit: 182 },
  { month: '2月', copyright: 168, talent: 112, platform: 84, profit: 196 },
  { month: '3月', copyright: 183, talent: 122, platform: 91, profit: 213 },
]

const tooltipStyle = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
}

// ── Budget detail data ──
const budgetDetailData: Record<string, {
  breakdown: { name: string; budget: number; spend: number }[]
  daily7: { day: string; budget: number; actual: number }[]
  aiHistory: { time: string; from: string; to: string; amount: string; reason: string }[]
  projectedSpend: number
  projectedBudget: number
  risk: 'low' | 'medium' | 'high'
}> = {
  '唇妆': {
    breakdown: [{ name: '抖音巨量', budget: 130, spend: 112 }, { name: '小红书聚光', budget: 110, spend: 98 }, { name: '快手磁力', budget: 70, spend: 60 }],
    daily7: [
      { day: '3/28', budget: 10.3, actual: 9.8 }, { day: '3/29', budget: 10.3, actual: 10.5 },
      { day: '3/30', budget: 10.3, actual: 9.2 }, { day: '3/31', budget: 10.3, actual: 11.0 },
      { day: '4/1', budget: 10.3, actual: 10.8 }, { day: '4/2', budget: 10.3, actual: 9.9 },
      { day: '4/3', budget: 10.3, actual: 10.1 },
    ],
    aiHistory: [
      { time: '08:20', from: '眼妆', to: '唇妆', amount: '¥12万', reason: '唇妆「唇釉618促销」CPA降至¥8，ROI高于阈值' },
      { time: '3/31 14:00', from: '唇妆', to: '底妆', amount: '¥8万', reason: '底妆华南ROI跃升至4.2' },
    ],
    projectedSpend: 285, projectedBudget: 310, risk: 'low',
  },
  '眼妆': {
    breakdown: [{ name: '抖音巨量', budget: 85, spend: 70 }, { name: '快手磁力', budget: 75, spend: 68 }, { name: '小红书聚光', budget: 50, spend: 42 }],
    daily7: [
      { day: '3/28', budget: 7.0, actual: 6.4 }, { day: '3/29', budget: 7.0, actual: 6.8 },
      { day: '3/30', budget: 7.0, actual: 7.3 }, { day: '3/31', budget: 7.0, actual: 6.9 },
      { day: '4/1', budget: 7.0, actual: 6.5 }, { day: '4/2', budget: 7.0, actual: 7.1 },
      { day: '4/3', budget: 7.0, actual: 6.7 },
    ],
    aiHistory: [
      { time: '09:45', from: '眼妆', to: '小红书聚光', amount: '¥8万', reason: '抖音巨量北美CPM上涨12%，分流至小红书聚光' },
      { time: '07:15', from: '眼妆', to: '天猫品销宝', amount: '¥6万', reason: '快手磁力搜索竞价激烈，AI降低出价并转移' },
    ],
    projectedSpend: 190, projectedBudget: 210, risk: 'low',
  },
  '底妆': {
    breakdown: [{ name: '抖音巨量', budget: 165, spend: 158 }, { name: '快手磁力', budget: 130, spend: 145 }, { name: '天猫品销宝', budget: 90, spend: 98 }, { name: '小红书聚光', budget: 75, spend: 62 }],
    daily7: [
      { day: '3/28', budget: 15.3, actual: 14.8 }, { day: '3/29', budget: 15.3, actual: 16.1 },
      { day: '3/30', budget: 15.3, actual: 17.0 }, { day: '3/31', budget: 15.3, actual: 16.4 },
      { day: '4/1', budget: 15.3, actual: 15.9 }, { day: '4/2', budget: 15.3, actual: 17.2 },
      { day: '4/3', budget: 15.3, actual: 16.8 },
    ],
    aiHistory: [
      { time: '10:30', from: '眼妆', to: '底妆', amount: '¥15万', reason: '底妆 ROI上升至3.8，超目标阈值' },
      { time: '06:00', from: '市场', to: '底妆', amount: '¥20万', reason: '凌晨低竞价时段，锁定低价流量' },
    ],
    projectedSpend: 450, projectedBudget: 460, risk: 'high',
  },
}

const overlayStyleBS: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.45)', zIndex: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
}

// ── AI配置: 预算引擎 ──
const budgetAIConfigGroups: AIConfigGroup[] = [
  {
    title: '智能预算分配',
    icon: <Brain size={16} />,
    params: [
      createParam('dailyBudgetFluctuation', '日预算波动阈值', 15, '%', '允许AI在此范围内自动调整日预算分配', 15, 91, { min: 0, max: 50 }),
      createParam('crossPlatformTransferCap', '跨平台调拨比例上限', 30, '%', '单次跨平台预算调拨不超过此比例', 30, 88, { min: 0, max: 100 }),
      createParam('roiSafetyLine', 'ROI安全线', 1.2, '', '低于此ROI的计划自动降低预算优先级', 1.2, 93, { min: 0.5, max: 3.0, step: 0.1 }),
      createParam('minGuaranteedBudget', '最低保量预算', 500, '¥', '每个投放计划的最低预算保障金额', 500, 86, { min: 100, max: 10000, step: 100 }),
    ],
  },
  {
    title: '结算与风控',
    icon: <Shield size={16} />,
    params: [
      createParam('anomalyDetectSensitivity', '异常消耗检测灵敏度', 7, '', '1-10档，越高越敏感，误报越多', 7, 89, { min: 1, max: 10 }),
      createParam('autoPauseLossThreshold', '自动暂停亏损阈值', 20, '%', '计划亏损超过此比例时AI自动暂停', 20, 92, { min: 0, max: 100 }),
      createParam('budgetReleaseDelay', '预算释放延迟', 5, '分钟', '暂停计划后预算释放到可再分配池的等待时间', 5, 85, { min: 0, max: 60 }),
    ],
  },
]

const budgetAILearningStatus: AILearningStatus = {
  modelVersion: 'v2.8.0-budget',
  lastTraining: '25分钟前',
  totalDataPoints: 285000,
  avgConfidence: 89,
  autoAdjustCount24h: 56,
  learningRate: '0.003',
  nextTraining: '35分钟后',
  improvementRate: '+12.4%',
}

// ── Multi-currency config ──
type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY'

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'CNY', label: 'CNY ¥', symbol: '¥' },
  { code: 'USD', label: 'USD $', symbol: '$' },
  { code: 'EUR', label: 'EUR €', symbol: '€' },
  { code: 'GBP', label: 'GBP £', symbol: '£' },
  { code: 'JPY', label: 'JPY ¥', symbol: '¥' },
]

// Exchange rates relative to 1 CNY
const FX_RATES: Record<CurrencyCode, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  GBP: 0.11,
  JPY: 20.6,
}

// International budget data (base values in CNY 万/日)
const intlBudget = [
  { platform: 'Facebook/Instagram', dailyCNY: 18.5, roas: 3.2 },
  { platform: 'TikTok Global',      dailyCNY: 24.0, roas: 2.8 },
  { platform: 'Google/YouTube',     dailyCNY: 15.0, roas: 3.6 },
]

export default function BudgetSettlement() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [currency, setCurrency] = useState<CurrencyCode>('CNY')
  useRegisterAIConfig(budgetAIConfigGroups, budgetAILearningStatus, '预算引擎')

  // Helper: convert a CNY value and format it with the active symbol
  const fx = (cnyValue: number, decimals = 1) => {
    const converted = cnyValue * FX_RATES[currency]
    const sym = CURRENCIES.find(c => c.code === currency)!.symbol
    return `${sym}${converted.toFixed(decimals)}`
  }

  return (
    <>
      {/* ══ Budget Detail Slide-over ══ */}
      {selectedBudget && (() => {
        const det = budgetDetailData[selectedBudget]
        const line = businessLines.find(l => l.name === selectedBudget)!
        const riskLabel = det.risk === 'high' ? '高风险' : det.risk === 'medium' ? '中风险' : '低风险'
        const riskColor = det.risk === 'high' ? '#ef4444' : det.risk === 'medium' ? '#fbbf24' : '#22c55e'
        return (
          <div style={overlayStyleBS} onClick={() => setSelectedBudget(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 480, height: '100vh', background: 'var(--bg-card)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: line.color }} />
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{selectedBudget} 业务线预算详情</span>
                </div>
                <button onClick={() => setSelectedBudget(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
              </div>

              {/* Business line / platform breakdown */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>平台预算分配</div>
                {det.breakdown.map(b => (
                  <div key={b.name} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{b.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>¥{b.spend}K / ¥{b.budget}K</span>
                    </div>
                    <div style={{ height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min((b.spend / b.budget) * 100, 100)}%`, background: b.spend > b.budget ? '#ef4444' : line.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Daily budget vs actual (last 7 days) */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>近7日预算vs实际消耗 (¥K)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {det.daily7.map(d => (
                    <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 36, flexShrink: 0 }}>{d.day}</span>
                      <div style={{ flex: 1, position: 'relative', height: 18, background: 'var(--border)', borderRadius: 4, overflow: 'visible' }}>
                        <div style={{ position: 'absolute', height: '100%', width: `${Math.min((d.actual / (d.budget * 1.3)) * 100, 100)}%`, background: d.actual > d.budget ? '#ef4444' : line.color, borderRadius: 4, opacity: 0.8 }} />
                        <div style={{ position: 'absolute', left: `${(d.budget / (d.budget * 1.3)) * 100}%`, top: -3, bottom: -3, width: 2, background: '#fbbf24', borderRadius: 1 }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', width: 42, textAlign: 'right', color: d.actual > d.budget ? '#ef4444' : '#22c55e', fontWeight: 600 }}>¥{d.actual}K</span>
                    </div>
                  ))}
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>黄线 = 预算上限</div>
                </div>
              </div>

              {/* AI reallocation history */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI预算调拨记录</div>
                {det.aiHistory.map((h, i) => (
                  <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-light)', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#e8365d' }}>{h.time}</span>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(99,102,241,0.12)', color: '#e8365d', padding: '1px 7px', borderRadius: 8 }}>{h.from} → {h.to}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', marginLeft: 'auto' }}>{h.amount}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{h.reason}</div>
                  </div>
                ))}
              </div>

              {/* Projected spend + risk */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>月末预测</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>月预算</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>¥{det.projectedBudget}K</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>预计消耗</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: det.projectedSpend > det.projectedBudget ? '#ef4444' : '#22c55e' }}>¥{det.projectedSpend}K</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px 6px', background: `${riskColor}10`, borderRadius: 8, border: `1px solid ${riskColor}30` }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>超支风险</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: riskColor }}>{riskLabel}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '调整预算', color: 'var(--accent-primary)', bg: 'var(--accent-primary)', text: '#fff' },
                  { label: '锁定预算', color: '#e8365d', bg: 'transparent', text: '#e8365d', border: '#e8365d' },
                  { label: '查看账单', color: '#ff7a95', bg: 'transparent', text: '#ff7a95', border: '#ff7a95' },
                ].map(btn => (
                  <button key={btn.label} onClick={() => setSelectedBudget(null)} style={{
                    padding: '8px 18px', borderRadius: 8, border: btn.border ? `1px solid ${btn.border}` : 'none',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    background: btn.bg, color: btn.text,
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>AI预算引擎</h2>
            <p>AI自主决策预算分配 · 跨平台跨业务线实时优化 · 自动分账结算</p>
          </div>
          {/* Currency switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 6px' }}>
            <Globe size={13} style={{ color: 'var(--text-muted)', marginRight: 2 }} />
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                style={{
                  padding: '4px 11px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  transition: 'all 0.15s',
                  background: currency === c.code ? '#0ea5e9' : 'transparent',
                  color: currency === c.code ? '#fff' : 'var(--text-muted)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="page-content">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: activeTab === i ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: activeTab === i ? '#fff' : 'var(--text-muted)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 0 && (
          <>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-title"><DollarSign size={14} style={{ marginRight: 4 }} />总预算池</div>
                <div className="card-value">¥98万/月</div>
                <div className="card-change positive">已消耗 ¥37.6万 (38.4%)</div>
              </div>
              <div className="card">
                <div className="card-title"><Brain size={14} style={{ marginRight: 4 }} />AI预测月末消耗</div>
                <div className="card-value">¥92万</div>
                <div className="card-change positive">剩余¥6万缓冲</div>
              </div>
              <div className="card">
                <div className="card-title"><TrendingUp size={14} style={{ marginRight: 4 }} />今日AI调整</div>
                <div className="card-value">17次</div>
                <div className="card-change positive">净调拨 ¥4.1万</div>
              </div>
              <div className="card">
                <div className="card-title"><Zap size={14} style={{ marginRight: 4 }} />综合ROI</div>
                <div className="card-value">3.2x</div>
                <div className="card-change positive"><ArrowUpRight size={12} /> +0.3 vs 昨日</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Bot size={18} style={{ color: '#e8365d' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI预算分配逻辑</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                基于实时ROI、计划生命周期、平台竞价环境，每小时重新计算最优分配。当ROI高于阈值时自动扩量，低于阈值时自动收缩，跨平台、跨业务线全局寻优。
              </p>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>三线预算分配</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 160, height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={businessLines} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                          {businessLines.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1 }}>
                    {businessLines.map((line, i) => (
                      <div key={i} onClick={() => setSelectedBudget(line.name)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', borderRadius: 6, paddingLeft: 4, paddingRight: 4, transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: line.color }} />
                          <span style={{ fontSize: '0.85rem' }}>{line.name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>¥{line.value}K</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 8 }}>{(line.value / 9.8).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>跨平台分配</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={platformBudget}>
                    <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v: number) => `¥${v}K`} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="budget" fill="#e8365d" radius={[4, 4, 0, 0]} name="预算(K)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Clock size={16} style={{ color: '#ffb3c6' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI今日预算调整日志</span>
              </div>
              {aiLogs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < aiLogs.length - 1 ? '1px solid var(--border-light)' : 'none', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '0.8rem', minWidth: 50 }}>{log.time}</span>
                  <Bot size={14} style={{ color: 'var(--accent-primary)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.83rem', color: 'var(--text-primary)' }}>{log.action}</span>
                </div>
              ))}
            </div>

            {/* ── 汇率风险提示 banner ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)',
              borderRadius: 10, padding: '10px 16px', marginTop: 16,
            }}>
              <AlertTriangle size={15} style={{ color: '#fbbf24', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: '#fde68a', fontWeight: 600, flex: 1 }}>
                当前USD/CNY = 7.18 · 汇率波动±2%已纳入预算安全垫
              </span>
              <ModelBadge name="MultiCurrency-ROAS" color="#0ea5e9" />
            </div>

            {/* ── 国际预算分配卡 ── */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(14,165,233,0.35)',
              borderRadius: 12, padding: 24, marginTop: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Globe size={16} style={{ color: '#0ea5e9' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0ea5e9' }}>🌍 国际预算分配</span>
                <span style={{
                  marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 9px', borderRadius: 20,
                  background: 'rgba(14,165,233,0.12)', color: '#38bdf8', fontWeight: 600,
                }}>海外投放</span>
              </div>

              {intlBudget.map((row, i) => {
                const dailyConverted = (row.dailyCNY * FX_RATES[currency]).toFixed(1)
                const sym = CURRENCIES.find(c => c.code === currency)!.symbol
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 9,
                    background: 'rgba(14,165,233,0.06)',
                    border: '1px solid rgba(14,165,233,0.14)',
                    marginBottom: i < intlBudget.length - 1 ? 8 : 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{row.platform}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>日预算</span>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                          {sym}{dailyConverted}万/日
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>ROAS</span>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#22c55e', fontFamily: 'monospace' }}>
                          {row.roas.toFixed(1)}x
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Total row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 9, marginTop: 10,
                background: 'rgba(14,165,233,0.14)',
                border: '1px solid rgba(14,165,233,0.3)',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0ea5e9' }}>合计 · Total International</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0ea5e9', fontFamily: 'monospace' }}>
                  {fx(intlBudget.reduce((sum, r) => sum + r.dailyCNY, 0))}万/日
                </span>
              </div>
            </div>
          </>
        )}

        {activeTab === 1 && (
          <>
            <div className="grid-3" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-title"><Shield size={14} style={{ marginRight: 4 }} />80% 预警线</div>
                <div className="card-value" style={{ color: '#fbbf24' }}>预警</div>
                <div className="card-change">触发通知 + AI关注</div>
              </div>
              <div className="card">
                <div className="card-title"><AlertTriangle size={14} style={{ marginRight: 4 }} />95% 降速线</div>
                <div className="card-value" style={{ color: '#f97316' }}>降速</div>
                <div className="card-change">AI自动降低出价30%</div>
              </div>
              <div className="card">
                <div className="card-title"><Shield size={14} style={{ marginRight: 4 }} />100% 暂停线</div>
                <div className="card-value" style={{ color: '#ef4444' }}>暂停</div>
                <div className="card-change">自动暂停所有投放</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>预算消耗速度监控（当前 vs 目标 %/月进度）</div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={speedData}>
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="current" fill="#e8365d" name="当前消耗速度%" radius={[4, 4, 0, 0]} />
                  <Line dataKey="target" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 4 }} name="目标速度%" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Brain size={16} style={{ color: '#e8365d' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI超预算预测</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 4px 0' }}>
                基于当前消耗速度和历史趋势，AI预测天猫品销宝-底妆线将在4月18日触及100%预算上限，抖音巨量-唇妆线将在4月25日触及95%降速线。其余平台/业务线消耗正常。
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>
                <AlertTriangle size={16} style={{ color: '#fbbf24', marginRight: 6 }} />
                预警列表
              </div>
              {alerts.map((alert, i) => (
                <div key={i} style={{ padding: '12px 16px', marginBottom: i < alerts.length - 1 ? 8 : 0, background: 'var(--bg-primary)', borderRadius: 8, borderLeft: `3px solid ${alert.level === '严重' ? '#ef4444' : alert.level === '警告' ? '#f97316' : '#e8365d'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: alert.level === '严重' ? 'rgba(239,68,68,0.15)' : alert.level === '警告' ? 'rgba(249,115,22,0.15)' : 'rgba(99,102,241,0.15)', color: alert.level === '严重' ? '#fca5a5' : alert.level === '警告' ? '#fdba74' : '#a5b4fc' }}>{alert.level}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{alert.platform} · {alert.line}</span>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 4px 0' }}>{alert.msg}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-primary)', fontSize: '0.78rem' }}>
                    <Bot size={12} /> {alert.action}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 2 && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>自动分账规则</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 150, height: 150 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={profitSplit} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                          {profitSplit.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1 }}>
                    {profitSplit.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < profitSplit.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                          <span style={{ fontSize: '0.85rem' }}>{item.name}</span>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>T+0自动结算状态</span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', color: '#86efac', fontWeight: 600 }}>系统正常</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>今日结算笔数</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>48</div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>今日结算总额</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>¥18.1万</div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>平均结算时效</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>2.3s</div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>结算成功率</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>99.8%</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <CreditCard size={16} style={{ color: '#ffb3c6' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>今日分账明细</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>结算ID</th><th>类型</th><th>对方</th><th>金额</th><th>状态</th><th>时间</th></tr>
                </thead>
                <tbody>
                  {settlements.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{s.id}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4, background: s.type.includes('版权') ? 'rgba(99,102,241,0.15)' : s.type.includes('达人') ? 'rgba(139,92,246,0.15)' : s.type.includes('平台') ? 'rgba(168,85,247,0.15)' : 'rgba(196,181,253,0.15)', color: s.type.includes('版权') ? '#a5b4fc' : s.type.includes('达人') ? '#ffc8d5' : s.type.includes('平台') ? '#c084fc' : '#e9d5ff' }}>
                          {s.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{s.party}</td>
                      <td style={{ fontWeight: 600 }}>¥{s.amount.toLocaleString()}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 4, background: s.status === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: s.status === 'completed' ? '#86efac' : '#fde68a' }}>
                          {s.status === 'completed' ? '已结算' : '处理中'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{s.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16 }}>月度分账汇总（单位: ¥K）</div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={monthlySummary}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `¥${v}K`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area dataKey="profit" fill="rgba(196,181,253,0.2)" stroke="#ffc8d5" name="公司利润" />
                  <Bar dataKey="copyright" fill="#e8365d" name="品牌方" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="talent" fill="#ff7a95" name="达人" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="platform" fill="#ffb3c6" name="平台" radius={[2, 2, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </>
  )
}
