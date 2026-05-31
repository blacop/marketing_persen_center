import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Globe, TrendingUp, DollarSign, BarChart3, Zap, Brain,
  ArrowUpRight, Bot, Shield, Map, Activity, ArrowRight,
  Layers, Target, RefreshCw
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── 30日全球GMV趋势数据 ──────────────────────────────────────────────────────
const gmvTrendData = [
  { day: '3/17', domestic: 820, intl: 142 },
  { day: '3/19', domestic: 845, intl: 150 },
  { day: '3/21', domestic: 862, intl: 156 },
  { day: '3/23', domestic: 878, intl: 162 },
  { day: '3/25', domestic: 890, intl: 168 },
  { day: '3/27', domestic: 905, intl: 172 },
  { day: '3/29', domestic: 918, intl: 178 },
  { day: '3/31', domestic: 930, intl: 183 },
  { day: '4/2',  domestic: 942, intl: 188 },
  { day: '4/4',  domestic: 935, intl: 184 },
  { day: '4/6',  domestic: 948, intl: 191 },
  { day: '4/8',  domestic: 955, intl: 193 },
  { day: '4/9',  domestic: 952, intl: 195 },
  { day: '4/10', domestic: 988, intl: 210 },
  { day: '4/11', domestic: 1024, intl: 228 },
  { day: '4/12', domestic: 1068, intl: 238 },
  { day: '4/13', domestic: 1095, intl: 252 },
  { day: '4/14', domestic: 1112, intl: 258 },
  { day: '4/15', domestic: 1125, intl: 266 },
]

// ─── 平台消耗分布 ─────────────────────────────────────────────────────────────
const platformSpendData = [
  { name: '抖音', spend: 98, color: '#e8365d' },
  { name: '快手', spend: 72, color: '#ff7a95' },
  { name: '小红书', spend: 58, color: '#ec4899' },
  { name: 'Facebook', spend: 41, color: '#0ea5e9' },
  { name: '天猫', spend: 20, color: '#f59e0b' },
  { name: 'TikTok全球', spend: 28, color: '#06b6d4' },
  { name: 'Google', spend: 9, color: '#10b981' },
]

// ─── 国际市场数据 ─────────────────────────────────────────────────────────────
const intlMarkets = [
  { flag: '🇺🇸', country: '美国', spend: '$2.8万', gmv: '$11.8万', roas: 4.2, platform: 'Meta+Google', trend: '+12%', color: '#0ea5e9', newCustomers: 1280, topProduct: '唇釉丝绒Velvet' },
  { flag: '🇯🇵', country: '日本', spend: '$0.9万', gmv: '$4.6万', roas: 5.1, platform: 'TikTok JP', trend: '+22%', color: '#e8365d', newCustomers: 640, topProduct: '眼影盘星空色' },
  { flag: '🇬🇧', country: '英国', spend: '$1.2万', gmv: '$4.6万', roas: 3.8, platform: 'Instagram', trend: '+8%', color: '#38bdf8', newCustomers: 520, topProduct: '粉底液水光' },
  { flag: '🇸🇬', country: '新加坡', spend: '$0.6万', gmv: '$2.9万', roas: 4.8, platform: 'TikTok SEA', trend: '+18%', color: '#06b6d4', newCustomers: 380, topProduct: '唇釉丝绒' },
  { flag: '🇩🇪', country: '德国', spend: '$0.5万', gmv: '$1.6万', roas: 3.2, platform: 'Facebook', trend: '+5%', color: '#94a3b8', newCustomers: 210, topProduct: '卸妆水温和' },
  { flag: '🇫🇷', country: '法国', spend: '$0.4万', gmv: '$1.4万', roas: 3.5, platform: 'Instagram', trend: '+9%', color: '#a78bfa', newCustomers: 185, topProduct: '高光修容盘' },
  { flag: '🇦🇺', country: '澳大利亚', spend: '$0.3万', gmv: '$1.1万', roas: 3.7, platform: 'Meta+TikTok', trend: '+15%', color: '#34d399', newCustomers: 155, topProduct: '粉底液水光' },
  { flag: '🇰🇷', country: '韩国', spend: '$0.2万', gmv: '$0.8万', roas: 4.0, platform: 'Instagram', trend: '+28%', color: '#f472b6', newCustomers: 120, topProduct: '唇釉丝绒' },
]

// ─── AI决策记录 ──────────────────────────────────────────────────────────────
const aiDecisions = [
  {
    id: 'GD-001',
    time: '8分钟前',
    team: '全球',
    action: '汇率波动预警：USD/CNY升至7.26，建议国际团队提前锁汇，对冲预算风险',
    confidence: 94,
    impact: '节省汇兑成本约¥3,200',
    color: '#0ea5e9',
  },
  {
    id: 'GD-002',
    time: '15分钟前',
    team: '国内',
    action: '抖音唇釉系列CPA上升→AI自动下调出价12%，切换oCPM智能出价模式',
    confidence: 96,
    impact: '预计节省¥6,800/日',
    color: '#e8365d',
  },
  {
    id: 'GD-003',
    time: '23分钟前',
    team: '国际',
    action: '日本TikTok妆容视频CTR飙升至8.4%→AI建议加速日本市场放量，预算+¥12万',
    confidence: 91,
    impact: '预计增加GMV $3.2万',
    color: '#06b6d4',
  },
]

// ─── AI Config ────────────────────────────────────────────────────────────────
const globalAIGroups: AIConfigGroup[] = [
  {
    title: '全球预算分配策略',
    icon: <Globe size={15} />,
    params: [
      createParam('intl_budget_ratio', '国际预算占比', 19, '%', '国际投放预算占全球总预算的比例', 22, 87, {
        min: 5, max: 50, step: 1, learningDataPoints: 42000,
        adjustHistory: [
          { time: '昨日', from: '16', to: '19', reason: '日本/新加坡ROAS持续超预期，AI上调国际占比' },
          { time: '3天前', from: '14', to: '16', reason: '国际团队人员到位，AI逐步提升国际预算' },
        ],
      }),
      createParam('global_daily_cap', '全球日消耗上限', 42.8, '万USD', '全球所有平台单日总消耗上限', 45, 92, {
        min: 20, max: 100, step: 0.5, learningDataPoints: 68000,
        adjustHistory: [
          { time: '2小时前', from: '40', to: '42.8', reason: '大促预热期，AI上调日消耗上限加速曝光' },
        ],
      }),
      createParam('emergency_reserve', '紧急备用预算', 5, '%', '保留作为应急调配的预算比例', 8, 84, {
        min: 2, max: 20, step: 1, learningDataPoints: 31000,
        adjustHistory: [
          { time: '1周前', from: '3', to: '5', reason: '近期汇率波动加剧，AI提升应急备用比例' },
        ],
      }),
    ],
  },
  {
    title: '国内/国际比例优化',
    icon: <Layers size={15} />,
    params: [
      createParam('domestic_roas_floor', '国内ROAS底线', 3.5, 'x', '国内平台ROAS低于此值自动减量', 3.8, 90, {
        min: 2.0, max: 6.0, step: 0.1, learningDataPoints: 85000,
        adjustHistory: [
          { time: '4小时前', from: '3.2', to: '3.5', reason: '国内市场进入旺季，AI提升ROAS准入门槛' },
        ],
      }),
      createParam('intl_roas_floor', '国际ROAS底线', 3.0, 'x', '国际平台ROAS低于此值自动减量', 3.2, 88, {
        min: 1.5, max: 5.0, step: 0.1, learningDataPoints: 52000,
        adjustHistory: [
          { time: '昨日', from: '2.8', to: '3.0', reason: '国际市场整体ROAS提升，AI上调准入门槛' },
        ],
      }),
      createParam('rebalance_freq', '预算再平衡频率', 4, '小时', '国内/国际预算比例自动再平衡触发间隔', 2, 86, {
        min: 1, max: 24, step: 1, learningDataPoints: 28000,
        adjustHistory: [
          { time: '2天前', from: '6', to: '4', reason: '跨时区市场节奏差异加大，AI缩短再平衡周期' },
        ],
      }),
    ],
  },
  {
    title: '汇率风险对冲',
    icon: <Shield size={15} />,
    params: [
      createParam('fx_alert_threshold', '汇率波动告警阈值', 1.5, '%', '单日USD/CNY波动超过此值触发风控告警', 1.2, 93, {
        min: 0.5, max: 5.0, step: 0.1, learningDataPoints: 45000,
        adjustHistory: [
          { time: '今日', from: '2.0', to: '1.5', reason: '近期汇率波动频繁，AI提前预警门槛' },
        ],
      }),
      createParam('hedge_ratio', '对冲预算比例', 30, '%', '国际预算中通过锁汇等方式对冲汇率风险的比例', 35, 88, {
        min: 0, max: 80, step: 5, learningDataPoints: 22000,
        adjustHistory: [
          { time: '1周前', from: '20', to: '30', reason: '全球货币政策不确定性上升，AI提升对冲比例' },
        ],
      }),
    ],
  },
]

const globalLearningStatus: AILearningStatus = {
  modelVersion: 'GlobalIntel-v2.3.1',
  lastTraining: '今日 06:00',
  totalDataPoints: 2850000,
  avgConfidence: 91.8,
  autoAdjustCount24h: 89,
  learningRate: '在线自适应',
  nextTraining: '今日 18:00',
  improvementRate: '+4.2%',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlobalDashboard() {
  const navigate = useNavigate()
  const [activeTeam, setActiveTeam] = useState<'global' | 'domestic' | 'intl'>('global')

  useRegisterAIConfig(globalAIGroups, globalLearningStatus, '🌍 全球投流总控台')

  // ─── KPI Cards ─────────────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: '全球总消耗',
      value: '$42.8万',
      sub: '¥306万',
      delta: '+18.2%',
      icon: DollarSign,
      color: '#e8365d',
    },
    {
      label: '全球总GMV',
      value: '$186万',
      sub: '¥1,335万',
      delta: '+24.6%',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      label: '综合全球ROAS',
      value: '4.34x',
      sub: '全平台加权',
      delta: '+0.42x',
      icon: BarChart3,
      color: '#f59e0b',
    },
    {
      label: '覆盖市场',
      value: '12个',
      sub: '国家/地区',
      delta: '+2个本月',
      icon: Map,
      color: '#0ea5e9',
    },
    {
      label: '活跃平台',
      value: '7个',
      sub: '国内4 + 国际3',
      delta: '全部在线',
      icon: Activity,
      color: '#06b6d4',
    },
    {
      label: '今日AI决策',
      value: '89条',
      sub: '国内62 + 国际27',
      delta: '+11条 vs昨日',
      icon: Bot,
      color: '#8b5cf6',
    },
  ]

  // ─── Tab styles ─────────────────────────────────────────────────────────────
  const tabStyle = (key: string): React.CSSProperties => ({
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    background: activeTeam === key ? (key === 'domestic' ? '#e8365d' : key === 'intl' ? '#0ea5e9' : 'var(--accent)') : 'var(--bg-secondary)',
    color: activeTeam === key ? '#fff' : 'var(--text-secondary)',
  })

  return (
    <div className="page-wrapper">
      {/* ── 页面头部 ──────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={22} color="#0ea5e9" />
            <h1 className="page-title" style={{ margin: 0 }}>🌍 全球投流总控台</h1>
          </div>
          <p className="page-subtitle" style={{ marginTop: 4 }}>
            Marie Dalgar Global · 国内+国际双团队 · 今日全球消耗$42.8万 / GMV$186万
          </p>
        </div>

        {/* 实时指示器 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
            boxShadow: '0 0 6px #22c55e', display: 'inline-block',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>全球实时在线</span>
          <RefreshCw size={13} color="var(--text-muted)" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>每30秒更新</span>
        </div>
      </div>

      <div className="page-content">

        {/* ── 团队切换 Tab ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button style={tabStyle('global')} onClick={() => setActiveTeam('global')}>
            🌐 全球总览
          </button>
          <button style={tabStyle('domestic')} onClick={() => setActiveTeam('domestic')}>
            🇨🇳 国内团队
          </button>
          <button style={tabStyle('intl')} onClick={() => setActiveTeam('intl')}>
            🌍 国际团队
          </button>
        </div>

        {/* ── 全球 KPI 卡片 (6列) ─────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}>
          {kpiCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="card" style={{ padding: '16px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: `${card.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={17} color={card.color} />
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '2px 7px', borderRadius: 5,
                    background: 'rgba(34,197,94,0.1)',
                    fontSize: '0.68rem', fontWeight: 700, color: '#22c55e',
                  }}>
                    <ArrowUpRight size={10} />
                    {card.delta}
                  </div>
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 2 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0ea5e9', fontWeight: 600, marginBottom: 2 }}>{card.sub}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{card.label}</div>
              </div>
            )
          })}
        </div>

        {/* ── 国内 vs 国际对比卡片 ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* 国内团队 */}
          <div className="card" style={{ padding: 20, borderLeft: '3px solid #e8365d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🇨🇳</span>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>国内团队</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Domestic · 抖音/快手/小红书/天猫</div>
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
                background: 'rgba(232,54,93,0.12)', color: '#e8365d',
              }}>主力战场</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: '消耗', value: '¥248万', color: '#e8365d' },
                { label: 'GMV', value: '¥1,125万', color: '#22c55e' },
                { label: 'ROAS', value: '4.54x', color: '#f59e0b' },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <Bot size={11} color="#8b5cf6" style={{ marginRight: 4 }} />
                AI决策 <strong style={{ color: '#8b5cf6' }}>62条</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <Zap size={11} color="#22c55e" style={{ marginRight: 4 }} />
                节省预算 <strong style={{ color: '#22c55e' }}>¥8.2万</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {['抖音', '快手', '小红书', '天猫'].map(p => (
                <span key={p} style={{
                  padding: '2px 9px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600,
                  background: 'rgba(232,54,93,0.08)', color: '#e8365d', border: '1px solid rgba(232,54,93,0.2)',
                }}>{p}</span>
              ))}
            </div>

            <button
              onClick={() => navigate('/ads')}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #e8365d, #ff7a95)',
                color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              进入国内投放 <ArrowRight size={14} />
            </button>
          </div>

          {/* 国际团队 */}
          <div className="card" style={{ padding: 20, borderLeft: '3px solid #0ea5e9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.4rem' }}>🌍</span>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>国际团队</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>International · Facebook/TikTok/Google</div>
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
                background: 'rgba(14,165,233,0.12)', color: '#0ea5e9',
              }}>高速扩张</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: '消耗', value: '$8.1万', color: '#0ea5e9' },
                { label: 'GMV', value: '$37万', color: '#22c55e' },
                { label: 'ROAS', value: '4.57x', color: '#f59e0b' },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <Bot size={11} color="#8b5cf6" style={{ marginRight: 4 }} />
                AI决策 <strong style={{ color: '#8b5cf6' }}>27条</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <Zap size={11} color="#22c55e" style={{ marginRight: 4 }} />
                节省预算 <strong style={{ color: '#22c55e' }}>$1.8万</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {['Facebook', 'TikTok', 'Google', 'Instagram'].map(p => (
                <span key={p} style={{
                  padding: '2px 9px', borderRadius: 5, fontSize: '0.65rem', fontWeight: 600,
                  background: 'rgba(14,165,233,0.08)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)',
                }}>{p}</span>
              ))}
            </div>

            <button
              onClick={() => navigate('/intl/dashboard')}
              style={{
                width: '100%', padding: '9px 0', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              进入国际投放 <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ── 图表区 2列 ───────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>

          {/* 7日全球GMV趋势 */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  7日全球GMV趋势
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  国内GMV(万¥) vs 国际GMV(折合万¥)
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e8365d' }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>国内</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#0ea5e9' }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>国际</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={gmvTrendData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gmvDomestic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8365d" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#e8365d" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gmvIntl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: '0.75rem' }}
                  formatter={(v: unknown, name: unknown) => [`${v}万¥`, name === 'domestic' ? '国内GMV' : '国际GMV']}
                />
                <Area type="monotone" dataKey="domestic" stroke="#e8365d" strokeWidth={2} fill="url(#gmvDomestic)" name="domestic" />
                <Area type="monotone" dataKey="intl" stroke="#0ea5e9" strokeWidth={2} fill="url(#gmvIntl)" name="intl" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 全球平台消耗分布 */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: 4 }}>
              全球平台消耗分布
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              单位：万¥（国际平台已按实时汇率折算）
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={platformSpendData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 50 }}
              >
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: '0.75rem' }}
                  formatter={(v: unknown) => [`¥${v}万`, '消耗']}
                />
                <Bar dataKey="spend" radius={[0, 5, 5, 0]}>
                  {platformSpendData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 国际市场表现 ─────────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>国际市场表现</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>6个主要出海市场 · 实时ROI监控</div>
            </div>
            <button
              onClick={() => navigate('/intl/dashboard')}
              style={{
                padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(14,165,233,0.3)',
                background: 'rgba(14,165,233,0.08)', color: '#0ea5e9',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              查看全部 <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {intlMarkets.map(market => (
              <div key={market.country} style={{
                background: 'var(--bg-secondary)', borderRadius: 10, padding: '14px 16px',
                border: '1px solid var(--border-light)',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.5rem' }}>{market.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{market.country}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>主平台 {market.platform}</div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '2px 7px', borderRadius: 5,
                    background: 'rgba(34,197,94,0.1)',
                    fontSize: '0.65rem', fontWeight: 700, color: '#22c55e',
                  }}>
                    <ArrowUpRight size={9} />
                    {market.trend}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: market.color }}>{market.spend}</div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 1 }}>消耗</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#22c55e' }}>{market.gmv}</div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 1 }}>GMV</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: market.roas >= 4.5 ? '#22c55e' : market.roas >= 3.5 ? '#f59e0b' : '#ef4444' }}>
                      {market.roas}x
                    </div>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 1 }}>ROAS</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>新客: <strong style={{ color: market.color }}>{market.newCustomers}</strong></span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>🏆 {market.topProduct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 全球AI决策概览 ────────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(139,92,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={16} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>全球AI决策概览</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>今日89条跨团队AI决策 · 实时执行</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/ai-decisions')}
              style={{
                padding: '6px 14px', borderRadius: 7, border: '1px solid rgba(139,92,246,0.3)',
                background: 'rgba(139,92,246,0.08)', color: '#8b5cf6',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              查看全部决策 <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {aiDecisions.map(d => (
              <div key={d.id} style={{
                background: 'var(--bg-secondary)', borderRadius: 10, padding: '14px 16px',
                borderLeft: `3px solid ${d.color}`,
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    padding: '2px 8px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700,
                    background: `${d.color}18`, color: d.color, marginBottom: 4, textAlign: 'center',
                  }}>{d.team}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    置信度 <strong style={{ color: d.color }}>{d.confidence}%</strong>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 5 }}>
                    {d.action}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: '0.68rem', color: '#22c55e', fontWeight: 600,
                      background: 'rgba(34,197,94,0.1)', padding: '1px 7px', borderRadius: 4,
                    }}>
                      {d.impact}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.time}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI模型矩阵 Banner ────────────────────────────────────────────────── */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Target size={14} color="#e8365d" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>全球智能模型矩阵</span>
            <span style={{
              padding: '1px 7px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700,
              background: 'rgba(34,197,94,0.1)', color: '#22c55e',
            }}>4 模型在线</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {[
              { name: 'CTR-Predictor-DeepFM', color: '#e8365d' },
              { name: 'BudgetMO-Optimizer', color: '#f59e0b' },
              { name: 'Lookalike-Expander', color: '#0ea5e9' },
              { name: 'AnomalyDetector-LSTM', color: '#8b5cf6' },
            ].map(m => (
              <ModelBadge key={m.name} name={m.name} color={m.color} />
            ))}
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              · MultiCurrency-ROAS · GlobalTrend-Radar · CrossBorder-Lookalike
            </span>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
