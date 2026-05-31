import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Megaphone, TrendingUp, DollarSign, Calendar, Search,
  Play, Pause, CheckCircle, Clock, AlertTriangle,
  BarChart3, Zap, Target, Eye,
  ChevronDown, Layers, Flag,
  ShoppingBag, Bot, RefreshCw, Brain,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   美妆活动管理中心 —— 营销活动全生命周期管理 + AI自动驾驶
   活动级管理 · AI计划自动建/管/停 · 跨平台同步 · 效果分析
   ═══════════════════════════════════════════════════════════════ */

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  running: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: '投放中', icon: <Play size={10} /> },
  paused: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: '已暂停', icon: <Pause size={10} /> },
  completed: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', label: '已结束', icon: <CheckCircle size={10} /> },
  draft: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: '草稿', icon: <Clock size={10} /> },
  review: { color: '#e8365d', bg: 'rgba(232,54,93,0.12)', label: '审核中', icon: <Eye size={10} /> },
  error: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: '异常', icon: <AlertTriangle size={10} /> },
}

const productLineConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  lip: { color: '#e8365d', icon: <ShoppingBag size={12} />, label: '唇部' },
  eye: { color: '#ff7a95', icon: <ShoppingBag size={12} />, label: '眼部' },
  base: { color: '#ff9eb5', icon: <ShoppingBag size={12} />, label: '底妆' },
  skincare: { color: '#ffb3c6', icon: <ShoppingBag size={12} />, label: '护肤' },
  cross: { color: '#ffc8d5', icon: <Layers size={12} />, label: '跨产品线' },
}

const campaigns = [
  {
    id: 'C-2026-0601', name: '618大促唇釉全系列', vertical: 'lip', product: '唇釉丝绒系列',
    status: 'running', priority: 'critical',
    platforms: ['抖音', '小红书', '天猫', '京东'],
    regions: ['全国'],
    startDate: '2026-05-25', endDate: '2026-06-18',
    budget: 2500000, spent: 985000, dailySpend: 85000,
    impressions: 125000000, clicks: 5000000, installs: 0, conversions: 185000,
    ctr: 4.0, cvr: 3.7, cpi: 0, roas: 0, roi: 3.85,
    agentStatus: 'auto-scaling', agentNote: '唇釉系列ROI 3.85超目标，AI自动扩量30%',
    creatives: 48, activeCreatives: 38, topCreative: '试色对比视频A3',
    abTests: 5, activeAbTests: 3,
    plans: 88, activePlans: 72,
    trend: [65, 72, 80, 88, 95, 102, 98, 108, 115, 122, 118, 125, 132, 128],
  },
  {
    id: 'C-2026-0592', name: '眼影盘星空限定首发', vertical: 'eye', product: '眼影盘星空',
    status: 'running', priority: 'high',
    platforms: ['小红书', '抖音'],
    regions: ['全国'],
    startDate: '2026-04-01', endDate: '2026-05-31',
    budget: 1200000, spent: 488000, dailySpend: 42000,
    impressions: 68000000, clicks: 2720000, installs: 0, conversions: 95000,
    ctr: 4.0, cvr: 3.5, cpi: 0, roas: 0, roi: 3.52,
    agentStatus: 'monitoring', agentNote: '种草指数92，小红书搜索增量+38%，转化稳定',
    creatives: 32, activeCreatives: 25, topCreative: '开箱试色教程B2',
    abTests: 4, activeAbTests: 2,
    plans: 52, activePlans: 42,
    trend: [88, 92, 98, 105, 112, 118, 115, 122, 128, 135, 130, 138, 142, 140],
  },
  {
    id: 'C-2026-0605', name: '38女神节底妆系列', vertical: 'base', product: '粉底液水光',
    status: 'completed', priority: 'high',
    platforms: ['抖音', '快手', '天猫'],
    regions: ['全国'],
    startDate: '2026-03-01', endDate: '2026-03-15',
    budget: 800000, spent: 782000, dailySpend: 0,
    impressions: 52000000, clicks: 1820000, installs: 0, conversions: 68000,
    ctr: 3.5, cvr: 3.73, cpi: 0, roas: 0, roi: 3.38,
    agentStatus: 'completed', agentNote: '活动已结束，GMV¥264万超目标15%',
    creatives: 28, activeCreatives: 0, topCreative: '粉底液对比测评C5',
    abTests: 3, activeAbTests: 0,
    plans: 42, activePlans: 0,
    trend: [95, 108, 120, 135, 142, 138, 145, 152, 148, 155, 162, 158, 148, 132],
  },
  {
    id: 'C-2026-0612', name: '情人节限定唇色', vertical: 'lip', product: '唇釉限定版',
    status: 'completed', priority: 'medium',
    platforms: ['小红书', '抖音'],
    regions: ['全国'],
    startDate: '2026-02-08', endDate: '2026-02-14',
    budget: 500000, spent: 495000, dailySpend: 0,
    impressions: 35000000, clicks: 1400000, installs: 0, conversions: 52000,
    ctr: 4.0, cvr: 3.71, cpi: 0, roas: 0, roi: 3.95,
    agentStatus: 'completed', agentNote: '情人节活动大爆发，GMV¥195万超目标25%',
    creatives: 22, activeCreatives: 0, topCreative: '限定唇色礼盒开箱',
    abTests: 2, activeAbTests: 0,
    plans: 32, activePlans: 0,
    trend: [62, 78, 92, 108, 125, 148, 168, 152, 128, 102, 85, 72, 58, 45],
  },
  {
    id: 'C-2026-0621', name: '夏日防晒卸妆专题', vertical: 'skincare', product: '卸妆水温和',
    status: 'running', priority: 'medium',
    platforms: ['小红书', '快手', '天猫'],
    regions: ['全国'],
    startDate: '2026-04-15', endDate: '2026-07-31',
    budget: 600000, spent: 128000, dailySpend: 22000,
    impressions: 22000000, clicks: 880000, installs: 0, conversions: 32000,
    ctr: 4.0, cvr: 3.64, cpi: 0, roas: 0, roi: 3.29,
    agentStatus: 'optimizing', agentNote: '防晒+卸妆组合内容种草效果好，AI优化中',
    creatives: 18, activeCreatives: 15, topCreative: '防晒卸妆双测评',
    abTests: 3, activeAbTests: 2,
    plans: 28, activePlans: 22,
    trend: [48, 55, 62, 68, 75, 82, 78, 85, 92, 98, 95, 102, 108, 105],
  },
  {
    id: 'G-2026-0501', name: 'US Summer Lip Collection Launch', vertical: 'lip', product: 'Lip Gloss Velvet Series',
    status: 'running', priority: 'high',
    platforms: ['Meta', 'TikTok Global', 'Google'],
    regions: ['🇺🇸 US', '🇬🇧 UK'],
    startDate: '2026-04-01', endDate: '2026-06-30',
    budget: 500000, spent: 185000, dailySpend: 18000,
    impressions: 28000000, clicks: 980000, installs: 0, conversions: 24500,
    ctr: 3.5, cvr: 2.5, cpi: 0, roas: 4.2, roi: 4.2,
    agentStatus: 'auto-scaling', agentNote: 'US市场ROAS 4.2x超目标，AI自动扩量TikTok+Meta',
    creatives: 24, activeCreatives: 18, topCreative: 'TikTok UGC试色挑战#LipRouge',
    abTests: 3, activeAbTests: 2,
    plans: 42, activePlans: 34,
    trend: [55, 62, 70, 78, 85, 92, 98, 105, 112, 118, 115, 122, 128, 132],
  },
  {
    id: 'G-2026-0508', name: 'JP × SEA Beauty Viral Campaign', vertical: 'eye', product: '眼影盘星空版',
    status: 'running', priority: 'high',
    platforms: ['TikTok Global', 'Meta'],
    regions: ['🇯🇵 JP', '🇸🇬 SG', '🇹🇭 TH'],
    startDate: '2026-03-15', endDate: '2026-05-31',
    budget: 320000, spent: 148000, dailySpend: 14000,
    impressions: 18500000, clicks: 720000, installs: 0, conversions: 18200,
    ctr: 3.9, cvr: 2.5, cpi: 0, roas: 5.1, roi: 5.1,
    agentStatus: 'monitoring', agentNote: 'JP市场ROAS 5.1x全球最高，AI已识别并扩大JP预算',
    creatives: 18, activeCreatives: 14, topCreative: 'JP版试色挑战竖版短视频',
    abTests: 2, activeAbTests: 1,
    plans: 32, activePlans: 26,
    trend: [72, 80, 88, 95, 102, 110, 108, 115, 122, 130, 128, 136, 142, 148],
  },
  {
    id: 'G-2026-0515', name: 'EU Skincare Compliance Launch', vertical: 'skincare', product: '玻尿酸精华液',
    status: 'paused', priority: 'medium',
    platforms: ['Meta', 'Google'],
    regions: ['🇩🇪 DE', '🇫🇷 FR', '🇬🇧 UK'],
    startDate: '2026-04-10', endDate: '2026-07-31',
    budget: 280000, spent: 42000, dailySpend: 0,
    impressions: 6200000, clicks: 198000, installs: 0, conversions: 4800,
    ctr: 3.2, cvr: 2.4, cpi: 0, roas: 3.2, roi: 3.2,
    agentStatus: 'compliance-hold', agentNote: 'EU GDPR合规审查中，AI已暂停年龄定向，等待法务确认',
    creatives: 12, activeCreatives: 0, topCreative: 'Skincare Routine Story',
    abTests: 1, activeAbTests: 0,
    plans: 18, activePlans: 0,
    trend: [45, 52, 60, 68, 58, 42, 35, 28, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 'C-2026-0638', name: '双11美妆超级大促', vertical: 'cross', product: '全品线',
    status: 'draft', priority: 'critical',
    platforms: ['抖音', '小红书', '快手', '天猫', '京东'],
    regions: ['全国'],
    startDate: '2026-10-25', endDate: '2026-11-11',
    budget: 5000000, spent: 0, dailySpend: 0,
    impressions: 0, clicks: 0, installs: 0, conversions: 0,
    ctr: 0, cvr: 0, cpi: 0, roas: 0, roi: 0,
    agentStatus: 'planning', agentNote: '双11策略规划中，AI预测GMV目标¥2000万',
    creatives: 0, activeCreatives: 0, topCreative: '-',
    abTests: 0, activeAbTests: 0,
    plans: 0, activePlans: 0,
    trend: [],
  },
]

const campaignStats = {
  total: campaigns.length,
  running: campaigns.filter(c => c.status === 'running').length,
  totalSpend: campaigns.reduce((s, c) => s + c.spent, 0),
  totalConversions: campaigns.reduce((s, c) => s + c.conversions, 0),
  avgROI: (campaigns.filter(c => c.roi > 0).reduce((s, c) => s + c.roi, 0) / campaigns.filter(c => c.roi > 0).length).toFixed(2),
  aiOps: 2148,
}

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

export default function CampaignManagement() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null)
  const [filterVertical, setFilterVertical] = useState<string>('all')
  const [filterRegion, setFilterRegion] = useState<'全部' | '国内' | '国际'>('全部')

  const campaignAIGroups: AIConfigGroup[] = [
    {
      title: '活动投放策略',
      icon: <Target size={16} />,
      params: [
        createParam('campaign_roi_target', '活动ROI目标', 3.2, '', '活动整体ROI最低目标，低于此值触发优化建议', 3.0, 89, { min: 1.5, max: 8.0, step: 0.1, learningDataPoints: 58300, adjustHistory: [
          { time: '3小时前', from: '3.0', to: '3.2', reason: '618预热期效果好，AI上调目标' },
        ] }),
        createParam('daily_budget_step', '预算自动调整步幅', 10, '%', 'AI自动增/减预算的单次步幅', 8, 85, { min: 5, max: 30, step: 5, learningDataPoints: 38900, adjustHistory: [
          { time: '2天前', from: '8', to: '10', reason: '618冲刺期需要更快调整响应速度' },
        ] }),
        createParam('creative_refresh_days', '素材刷新周期', 5, '天', '活动素材定期刷新的周期天数', 4, 84, { min: 2, max: 14, step: 1, learningDataPoints: 44600, adjustHistory: [
          { time: '昨日', from: '7', to: '5', reason: '618期间用户内容消费频次高，缩短刷新周期' },
        ] }),
        createParam('cross_platform_sync', '跨平台同步策略', '实时同步', '', '各平台计划的同步时机', 'AI异步优化', 90, { type: 'select', options: ['实时同步', 'AI异步优化', '手动同步'], learningDataPoints: 25600, adjustHistory: [
          { time: '3天前', from: '手动同步', to: 'AI异步优化', reason: '手动同步延迟太高，切换AI自动同步' },
        ] }),
      ],
    },
    {
      title: 'GMV目标管理',
      icon: <DollarSign size={16} />,
      params: [
        createParam('gmv_daily_target', 'GMV日目标', 2950000, '¥', '全渠道每日GMV目标，AI据此分配各平台预算', 2800000, 88, { min: 1000000, max: 10000000, step: 100000, learningDataPoints: 45200, adjustHistory: [
          { time: '昨日', from: '2800000', to: '2950000', reason: '618备战期上调日GMV目标' },
        ] }),
        createParam('big_sale_budget_multiplier', '大促预算倍数', 2.5, 'x', '大促活动期间预算相对日常的倍数', 2.2, 82, { min: 1.0, max: 5.0, step: 0.5, autoTuneEnabled: false, learningDataPoints: 28600, adjustHistory: [
          { time: '1周前', from: '2.0', to: '2.5', reason: '618蓄水期提前，手动上调大促预算倍数' },
        ] }),
      ],
    },
  ]

  const campaignLearningStatus: AILearningStatus = {
    modelVersion: 'v3.5.0-campaign',
    lastTraining: '28分钟前',
    totalDataPoints: 485000,
    avgConfidence: 88,
    autoAdjustCount24h: 385,
    learningRate: '0.001',
    nextTraining: '32分钟后',
    improvementRate: '+8.5%',
  }
  useRegisterAIConfig(campaignAIGroups, campaignLearningStatus, '美妆活动管理')

  const intlPlatforms = ['Meta', 'TikTok Global', 'Google']
  const filtered = campaigns.filter(c => {
    const matchSearch = c.name.includes(searchTerm) || c.product.includes(searchTerm)
    const matchVertical = filterVertical === 'all' || c.vertical === filterVertical
    const isIntl = c.platforms.some(p => intlPlatforms.includes(p))
    const matchRegion = filterRegion === '全部' || (filterRegion === '国际' ? isIntl : !isIntl)
    return matchSearch && matchVertical && matchRegion
  })

  return (
    <>
      <div className="page-header">
        <h2>美妆活动管理</h2>
        <p>玛丽黛佳活动全生命周期管理 · 新品首发/618大促/双11/情人节限定/夏日防晒/38女神节 · AI自动驾驶</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="BudgetMO-Optimizer" color="#06b6d4" />
          <ModelBadge name="BayesianAB-Engine" color="#10b981" />
          <ModelBadge name="TrafficPacing-RL" color="#f97316" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
          <ModelBadge name="NewSKU-ColdStart" color="#8b5cf6" />
        </div>

        {/* ── AI决策中心 · 计划执行状态 ── */}
        {(() => {
          const campaignDecisions = [
            { id: 'DC-003', title: '「底妆日销计划」出价偏高，建议降价8%', confidence: 92, status: '执行中', model: 'BidOptimizer-DQN', impact: '降低CPA ¥12/单', time: '11:40' },
            { id: 'DC-007', title: '「唇釉冬季新品」冷启A/B测已完成，方案B获胜', confidence: 95, status: '已完成', model: 'BayesianAB-Engine', impact: 'CVR+23%', time: '11:25' },
            { id: 'DC-015', title: '晚间预算时段重分配，加码21-23点', confidence: 89, status: '执行中', model: 'TrafficPacing-RL', impact: 'ROI+0.3x', time: '11:00' },
            { id: 'DC-020', title: '「粉底液618大促」计划审批，建议新增5%预算', confidence: 87, status: '待确认', model: 'BudgetMO-Optimizer', impact: '+¥50,000预算', time: '10:45' },
          ]
          const statusStyle: Record<string, { background: string; color: string }> = {
            '执行中': { background: 'rgba(52,211,153,0.12)', color: '#34d399' },
            '已完成': { background: 'rgba(99,102,241,0.12)', color: '#818cf8' },
            '待确认': { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
          }
          return (
            <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 5px #6366f1' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 计划执行状态</span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 7, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>全平台联动</span>
                </div>
                <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.65rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部决策 →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {campaignDecisions.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 34, flexShrink: 0 }}>{d.time}</span>
                    <span style={{ flex: 1, fontSize: '0.72rem' }}>{d.title}</span>
                    <ModelBadge name={d.model} color="#818cf8" />
                    <span style={{ fontSize: '0.62rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                    <span style={{ fontSize: '0.58rem', padding: '1px 7px', borderRadius: 5, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                    <span style={{ fontSize: '0.6rem', color: d.confidence >= 90 ? '#34d399' : '#fbbf24', flexShrink: 0 }}>{d.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* 统计摘要 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: '活动总数', value: campaignStats.total, color: '#e8365d' },
            { label: '进行中', value: campaignStats.running, color: '#34d399' },
            { label: '总消耗', value: `¥${(campaignStats.totalSpend / 10000).toFixed(0)}万`, color: '#ff7a95' },
            { label: '总转化', value: `${(campaignStats.totalConversions / 10000).toFixed(1)}万`, color: '#60a5fa' },
            { label: '综合ROI', value: campaignStats.avgROI, color: '#fbbf24' },
            { label: 'AI操作', value: `${campaignStats.aiOps}次`, color: '#e8365d' },
          ].map((m, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* 搜索与筛选 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="搜索活动名称或产品..."
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.82rem' }} />
            </div>
            {/* 国内/国际筛选 */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['全部', '国内', '国际'] as const).map(r => (
                <button key={r} onClick={() => setFilterRegion(r)} style={{
                  padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                  background: filterRegion === r ? (r === '国内' ? '#e8365d' : r === '国际' ? '#3b82f6' : 'var(--accent-primary)') : 'var(--bg-primary)',
                  color: filterRegion === r ? '#fff' : 'var(--text-muted)',
                  border: filterRegion === r ? 'none' : '1px solid var(--border)',
                }}>
                  {r === '国内' ? '🇨🇳 国内' : r === '国际' ? '🌍 国际' : '全部'}
                </button>
              ))}
            </div>
          </div>
          {/* 品线筛选 */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ key: 'all', label: '全部品线' }, ...Object.entries(productLineConfig).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
              <button key={f.key} onClick={() => setFilterVertical(f.key)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.72rem', background: filterVertical === f.key ? '#e8365d' : 'var(--bg-primary)', color: filterVertical === f.key ? 'white' : 'var(--text-muted)' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 活动列表 */}
        {filtered.map((campaign, idx) => {
          const pLine = productLineConfig[campaign.vertical]
          const sConf = statusConfig[campaign.status]
          return (
            <div key={idx} className="card" style={{ marginBottom: 12, cursor: 'pointer', borderLeft: `4px solid ${pLine?.color || '#e8365d'}` }}
              onClick={() => setSelectedCampaign(selectedCampaign?.id === campaign.id ? null : campaign)}>
              {(() => {
                const isIntl = campaign.platforms.some(p => ['Meta', 'TikTok Global', 'Google'].includes(p))
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Flag size={14} color={pLine?.color} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{campaign.name}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: pLine ? `${pLine.color}20` : 'rgba(232,54,93,0.1)', color: pLine?.color }}>{pLine?.label}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: sConf.bg, color: sConf.color, display: 'flex', alignItems: 'center', gap: 4 }}>{sConf.icon}{sConf.label}</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 10, fontWeight: 700, background: isIntl ? 'rgba(59,130,246,0.1)' : 'rgba(232,54,93,0.08)', color: isIntl ? '#3b82f6' : '#e8365d' }}>{isIntl ? '🌍 国际' : '🇨🇳 国内'}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{campaign.startDate} → {campaign.endDate}</span>
                    <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: 4, background: campaign.priority === 'critical' ? 'rgba(239,68,68,0.1)' : campaign.priority === 'high' ? 'rgba(245,158,11,0.1)' : 'rgba(96,165,250,0.1)', color: campaign.priority === 'critical' ? '#ef4444' : campaign.priority === 'high' ? '#f59e0b' : '#60a5fa' }}>
                      {campaign.priority === 'critical' ? '最高优先' : campaign.priority === 'high' ? '高优先' : '普通'}
                    </span>
                  </div>
                )
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 8 }}>
                {[
                  { label: '预算', value: `¥${(campaign.budget / 10000).toFixed(0)}万` },
                  { label: '已消耗', value: `¥${(campaign.spent / 10000).toFixed(0)}万` },
                  { label: '日消耗', value: campaign.dailySpend > 0 ? `¥${(campaign.dailySpend / 10000).toFixed(1)}万` : '-' },
                  { label: '曝光量', value: campaign.impressions > 0 ? `${(campaign.impressions / 1000000).toFixed(0)}M` : '-' },
                  { label: '转化数', value: campaign.conversions > 0 ? `${(campaign.conversions / 10000).toFixed(1)}万` : '-' },
                  { label: 'CTR', value: campaign.ctr > 0 ? `${campaign.ctr}%` : '-' },
                  { label: 'ROI', value: campaign.roi > 0 ? `${campaign.roi}` : '-', color: campaign.roi >= 3.0 ? '#22c55e' : '#f59e0b' },
                  { label: '活跃计划', value: `${campaign.activePlans}/${campaign.plans}` },
                ].map((kpi, i) => (
                  <div key={i} style={{ padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: (kpi as any).color || 'var(--text-primary)' }}>{kpi.value}</div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {campaign.platforms.map(p => {
                    const isIntlP = ['Meta', 'TikTok Global', 'Google'].includes(p)
                    return (
                      <span key={p} style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, background: isIntlP ? 'rgba(59,130,246,0.1)' : 'rgba(232,54,93,0.08)', color: isIntlP ? '#3b82f6' : '#e8365d' }}>{p}</span>
                    )
                  })}
                </div>
                <div style={{ fontSize: '0.65rem', color: campaign.agentStatus === 'auto-scaling' ? '#34d399' : campaign.agentStatus === 'completed' ? '#60a5fa' : '#e8365d' }}>
                  <Bot size={10} style={{ display: 'inline', marginRight: 4 }} />{campaign.agentNote}
                </div>
              </div>

              {selectedCampaign?.id === campaign.id && campaign.trend.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>GMV趋势</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <AreaChart data={campaign.trend.map((v, i) => ({ day: `D${i+1}`, value: v }))}>
                      <XAxis dataKey="day" tick={{ fontSize: 8 }} />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="value" stroke="#e8365d" fill="rgba(232,54,93,0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Top素材</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{campaign.topCreative}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>A/B测试</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{campaign.activeAbTests}/{campaign.abTests}进行中</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>活跃素材</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{campaign.activeCreatives}/{campaign.creatives}</div>
                    </div>
                    <div style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>预算进度</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{campaign.budget > 0 ? `${((campaign.spent / campaign.budget) * 100).toFixed(0)}%` : '-'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

      </div>
    </>
  )
}
