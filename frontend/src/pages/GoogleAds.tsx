import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Play, Target, DollarSign, TrendingUp, Eye, Zap, Bot, Brain, Globe, BarChart3, Activity, Star, Users } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ===== Google Ads 核心逻辑：Search + YouTube + Display 三渠道协同 =====
// 英语市场为主（美国/英国/加拿大/澳大利亚）
// Search：关键词精准捕捉购买意图 → 高意向用户直接转化
// YouTube：视频品牌种草 → 提升品牌认知 + 再营销
// Display：再营销触达 + 宽泛品牌曝光 → 辅助转化

// ===== 7日趋势数据 =====
const dailyTrend = [
  { date: '04/09', search: 4200, youtube: 3300, display: 1400, gmv: 22000 },
  { date: '04/10', search: 4500, youtube: 3600, display: 1500, gmv: 24000 },
  { date: '04/11', search: 4800, youtube: 3800, display: 1600, gmv: 26000 },
  { date: '04/12', search: 5000, youtube: 4000, display: 1700, gmv: 28000 },
  { date: '04/13', search: 5200, youtube: 4200, display: 1800, gmv: 30000 },
  { date: '04/14', search: 5500, youtube: 4500, display: 1900, gmv: 58000 },
  { date: '04/15', search: 5850, youtube: 4940, display: 2210, gmv: 62000 },
]

// ===== 渠道分布 =====
const channelShare = [
  { name: 'Search', value: 45, color: '#4285f4' },
  { name: 'YouTube', value: 38, color: '#ff0000' },
  { name: 'Display', value: 17, color: '#34a853' },
]

// ===== 质量得分分布 =====
const qualityScoreDist = [
  { score: '1-3', count: 3 },
  { score: '4-5', count: 8 },
  { score: '6-7', count: 22 },
  { score: '8-9', count: 31 },
  { score: '10', count: 14 },
]

// ===== Top 关键词 =====
const topKeywords = [
  { keyword: 'marie dalgar lipstick', cpc: '$0.82', ctr: '5.4%', qs: 9, conversions: 128, match: 'Exact' },
  { keyword: 'foundation makeup', cpc: '$1.24', ctr: '3.8%', qs: 8, conversions: 96, match: 'Phrase' },
  { keyword: 'lip gloss beauty', cpc: '$0.68', ctr: '4.9%', qs: 9, conversions: 112, match: 'Exact' },
  { keyword: 'long lasting lipstick', cpc: '$0.95', ctr: '4.2%', qs: 8, conversions: 84, match: 'Phrase' },
  { keyword: 'chinese makeup brand', cpc: '$0.56', ctr: '6.1%', qs: 9, conversions: 76, match: 'Broad' },
  { keyword: 'velvet lip color', cpc: '$0.74', ctr: '4.7%', qs: 8, conversions: 68, match: 'Phrase' },
  { keyword: 'eye shadow palette', cpc: '$1.12', ctr: '3.5%', qs: 7, conversions: 54, match: 'Phrase' },
  { keyword: 'waterproof mascara beauty', cpc: '$0.89', ctr: '3.9%', qs: 7, conversions: 48, match: 'Broad' },
]

// ===== 否定词 =====
const negativeKeywords = [
  'cheap makeup', 'free samples', 'wholesale lipstick', 'diy lip gloss',
  'lipstick reviews reddit', 'dollar store makeup', 'halloween face paint',
]

// ===== 广告文案 =====
const adCopies = [
  { headline: 'Marie Dalgar Velvet Lip – Shop Now', ctr: '5.8%', conv: 142, status: 'Winner' },
  { headline: 'Award-Winning Chinese Beauty Brand', ctr: '4.2%', conv: 98, status: 'Testing' },
  { headline: 'Free Shipping on Orders Over $35', ctr: '3.9%', conv: 72, status: 'Paused' },
]

// ===== YouTube 视频广告活动 =====
const youtubeCampaigns = [
  { name: 'Marie Dalgar Foundation Tutorial', type: 'In-stream Skippable', viewRate: '28.6%', cpv: '$0.034', brandLift: '+12%', impressions: '1.2M', budget: '$2,800' },
  { name: 'Lip Color Transformation 15s', type: 'Non-skippable', viewRate: '100%', cpv: '$0.058', brandLift: '+8%', impressions: '680K', budget: '$1,600' },
  { name: 'Marie Dalgar Brand Story 6s', type: 'Bumper', viewRate: '100%', cpv: '$0.012', brandLift: '+5%', impressions: '2.1M', budget: '$980' },
  { name: 'Eye Shadow Demo – Discovery', type: 'Discovery', viewRate: '18.4%', cpv: '$0.042', brandLift: '+9%', impressions: '540K', budget: '$560' },
]

// ===== 再营销受众 =====
const remarketingAudiences = [
  { name: '购物车未付款', size: '42K', ctr: '4.8%', conv: 186, roas: '6.2x', status: 'Active' },
  { name: '过去30天访客', size: '128K', ctr: '2.9%', conv: 142, roas: '4.8x', status: 'Active' },
  { name: '高LTV用户', size: '18K', ctr: '6.1%', conv: 94, roas: '8.4x', status: 'Active' },
  { name: '视频观看50%+', size: '84K', ctr: '3.4%', conv: 76, roas: '4.1x', status: 'Active' },
  { name: '类似受众扩展', size: '320K', ctr: '1.8%', conv: 58, roas: '3.2x', status: 'Testing' },
]

// ===== 展示广告位 =====
const placements = [
  { site: 'allure.com', category: 'Beauty Blog', impressions: '280K', ctr: '0.82%', cpa: '$24.5' },
  { site: 'vogue.com', category: 'Fashion', impressions: '210K', ctr: '0.68%', cpa: '$31.2' },
  { site: 'cosmopolitan.com', category: 'Beauty Blog', impressions: '195K', ctr: '0.74%', cpa: '$28.8' },
  { site: 'refinery29.com', category: 'Fashion', impressions: '162K', ctr: '0.59%', cpa: '$36.4' },
  { site: 'nytimes.com/style', category: 'Lifestyle', impressions: '148K', ctr: '0.41%', cpa: '$44.2' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

export default function GoogleAds() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'overview' | 'search' | 'youtube' | 'display'>('overview')

  // ===== AI配置 =====
  const googleAIGroups: AIConfigGroup[] = [
    {
      title: '关键词出价策略',
      icon: <Search size={16} />,
      params: [
        createParam('target_cpa', '目标CPA', 28, '$', 'Google Search目标单次转化费用，AI根据历史数据动态调整出价', 26, 88, {
          min: 10, max: 120, step: 1, learningDataPoints: 48200, adjustHistory: [
            { time: '2小时前', from: '30', to: '28', reason: '搜索流量质量提升，AI降低目标CPA提高竞争力' },
            { time: '昨日', from: '25', to: '30', reason: '竞品加大投放，流量成本上升，AI上调CPA目标' },
          ],
        }),
        createParam('keyword_expansion_rate', '长尾词扩展系数', 2.4, 'x', '基于核心词自动扩展长尾词的覆盖倍数，越高探索更多长尾机会', 2.2, 85, {
          min: 1.0, max: 5.0, step: 0.1, learningDataPoints: 32600, adjustHistory: [
            { time: '1小时前', from: '2.0', to: '2.4', reason: 'Beauty搜索词CPC飙升，AI转向更多长尾词' },
            { time: '3天前', from: '3.0', to: '2.0', reason: '长尾词转化率低于阈值，AI收缩扩展范围' },
          ],
        }),
        createParam('quality_score_floor', '质量得分下限', 6, '分', '质量得分低于此值的关键词暂停投放，影响广告排名和CPC', 7, 90, {
          min: 3, max: 10, step: 1, learningDataPoints: 41800, adjustHistory: [
            { time: '2天前', from: '5', to: '6', reason: '低质量词CPC高转化差，AI提高质量得分门槛' },
          ],
        }),
        createParam('search_impression_share_target', '搜索曝光份额目标', 35, '%', '目标搜索曝光份额，决定是否需要提高出价或预算', 30, 82, {
          min: 10, max: 80, step: 5, learningDataPoints: 28400, adjustHistory: [
            { time: '昨日', from: '30', to: '35', reason: '竞品曝光份额上升，AI提高目标抢占份额' },
          ],
        }),
      ],
    },
    {
      title: 'YouTube投放优化',
      icon: <Play size={16} />,
      params: [
        createParam('skip_rate_threshold', '跳过率阈值', 65, '%', 'In-stream广告跳过率超过此值触发素材优化，前5秒内容至关重要', 60, 86, {
          min: 40, max: 90, step: 5, learningDataPoints: 35200, adjustHistory: [
            { time: '3小时前', from: '70', to: '65', reason: '当前素材前5秒吸引力不足，AI降低阈值触发重剪' },
            { time: '2天前', from: '60', to: '70', reason: '新素材跳过率自然偏高，AI放宽阈值' },
          ],
        }),
        createParam('cpv_target', '目标CPV', 0.038, '$', '目标每次观看费用，平衡观看量与成本', 0.035, 84, {
          min: 0.01, max: 0.15, step: 0.002, learningDataPoints: 28900, adjustHistory: [
            { time: '昨日', from: '0.032', to: '0.038', reason: '优质内容获取更高出价，AI上调CPV目标' },
          ],
        }),
        createParam('view_rate_target', '完播率目标', 30, '%', 'In-stream Skippable视频目标完播率，低于此值触发素材迭代', 28, 87, {
          min: 10, max: 60, step: 2, learningDataPoints: 31500, adjustHistory: [
            { time: '2天前', from: '25', to: '30', reason: '新素材完播率改善，AI提高目标值' },
          ],
        }),
        createParam('bumper_budget_ratio', 'Bumper广告预算占比', 18, '%', '6秒Bumper广告预算比例，用于强化品牌记忆', 15, 80, {
          min: 5, max: 40, step: 5, autoTuneEnabled: false, learningDataPoints: 18200, adjustHistory: [
            { time: '3天前', from: '12', to: '18', reason: '品牌认知提升需求，手动增加Bumper预算' },
          ],
        }),
      ],
    },
    {
      title: '展示网络定向',
      icon: <Target size={16} />,
      params: [
        createParam('frequency_cap', '频次上限', 5, '次/周', '每位用户每周最多看到展示广告的次数，防止广告疲劳', 4, 88, {
          min: 1, max: 15, step: 1, learningDataPoints: 22400, adjustHistory: [
            { time: '2天前', from: '7', to: '5', reason: '频次过高导致CTR下降，AI降低频次上限' },
          ],
        }),
        createParam('remarketing_window', '再营销时间窗口', 30, '天', '对访问过网站用户进行再营销的时间窗口', 21, 85, {
          min: 7, max: 90, step: 7, learningDataPoints: 26800, adjustHistory: [
            { time: '1周前', from: '21', to: '30', reason: '用户决策周期延长，AI扩大再营销窗口' },
          ],
        }),
        createParam('display_ctr_floor', 'Display最低CTR', 0.4, '%', '展示广告位CTR低于此值自动停投，淘汰低效版位', 0.5, 82, {
          min: 0.1, max: 2.0, step: 0.1, learningDataPoints: 19600, adjustHistory: [
            { time: '3天前', from: '0.3', to: '0.4', reason: '低CTR版位浪费预算，AI提高停投阈值' },
          ],
        }),
        createParam('smart_display_ratio', '智能展示广告占比', 40, '%', 'Google Smart Display自动生成广告的预算占比', 35, 79, {
          min: 10, max: 70, step: 10, learningDataPoints: 15800, adjustHistory: [
            { time: '5天前', from: '30', to: '40', reason: '智能展示广告ROAS高于手动设计，AI提高占比' },
          ],
        }),
      ],
    },
  ]

  const googleLearningStatus: AILearningStatus = {
    modelVersion: 'v2.8.1-google-ads',
    lastTraining: '45分钟前',
    totalDataPoints: 312000,
    avgConfidence: 87,
    autoAdjustCount24h: 184,
    learningRate: '0.0006 (Adam)',
    nextTraining: '2小时后',
    improvementRate: '+9.8%',
  }

  useRegisterAIConfig(googleAIGroups, googleLearningStatus, 'Google Ads')

  const tabs = [
    { key: 'overview', label: '总览' },
    { key: 'search', label: '搜索广告' },
    { key: 'youtube', label: 'YouTube广告' },
    { key: 'display', label: '展示广告' },
  ] as const

  const decisions = [
    { id: 'DC-G01', title: 'Beauty搜索词CPC飙升，转向长尾词策略', confidence: 88, status: '执行中', model: 'SearchQuery-Optimizer', platform: 'Google Search', impact: 'CPC降低22%', time: '11:35' },
    { id: 'DC-G02', title: 'YouTube素材前5秒跳过率过高，AI重剪', confidence: 85, status: '待确认', model: 'VideoCompletion-Predictor', platform: 'YouTube', impact: '完播率预计+18%', time: '11:10' },
    { id: 'DC-G03', title: '再营销受众列表更新，加入高LTV用户', confidence: 91, status: '已完成', model: 'CTR-Predictor-DeepFM', platform: 'Google Display', impact: 'CTR +0.6%', time: '10:45' },
  ]

  const statusStyle: Record<string, { background: string; color: string }> = {
    '执行中': { background: 'rgba(52,211,153,0.12)', color: '#34d399' },
    '已完成': { background: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    '待确认': { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  }

  const kpis = [
    { label: '今日消耗', value: '$1.3万', change: '+8.4%', positive: true, color: '#4285f4', icon: <DollarSign size={13} /> },
    { label: '今日GMV', value: '$6.2万', change: '+14.2%', positive: true, color: '#34a853', icon: <TrendingUp size={13} /> },
    { label: 'ROAS', value: '4.77x', change: '+0.31x', positive: true, color: '#4285f4', icon: <Target size={13} /> },
    { label: '搜索曝光份额', value: '34.2%', change: '行业均值28%', positive: true, color: '#fbbc04', icon: <Search size={13} /> },
    { label: 'YouTube观看率', value: '28.6%', change: 'In-stream均值22%', positive: true, color: '#ff0000', icon: <Play size={13} /> },
    { label: '关键词质量得分', value: '7.8/10', change: '优质词78%', positive: true, color: '#34a853', icon: <Star size={13} /> },
  ]

  return (
    <>
      <div className="page-header">
        <h2>Google · YouTube AI 投放</h2>
        <p>Google Ads · 搜索/展示/YouTube · 英语市场为主 · 今日消耗$1.3万 / GMV$6.2万 · ROAS 4.77x</p>
      </div>
      <div className="page-content">

        {/* ── 模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(66,133,244,0.06)', borderRadius: 10, border: '1px solid rgba(66,133,244,0.18)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="SearchQuery-Optimizer" color="#4285f4" />
          <ModelBadge name="VideoCompletion-Predictor" color="#ff0000" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#4285f4" />
          <ModelBadge name="MultiCurrency-ROAS" color="#34a853" />
        </div>

        {/* ── AI决策中心 · Google执行状态 ── */}
        <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4285f4', boxShadow: '0 0 5px #4285f4' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4285f4' }}>AI决策中心 · Google执行状态</span>
              <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 7, background: 'rgba(255,0,0,0.12)', color: '#ff0000' }}>Google Ads</span>
            </div>
            <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.65rem', color: '#4285f4', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部 →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {decisions.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 34, flexShrink: 0 }}>{d.time}</span>
                <span style={{ flex: 1, fontSize: '0.72rem' }}>{d.title}</span>
                <span style={{ fontSize: '0.6rem', color: '#4285f4', flexShrink: 0 }}>{d.platform}</span>
                <ModelBadge name={d.model} color="#4285f4" />
                <span style={{ fontSize: '0.62rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                <span style={{ fontSize: '0.58rem', padding: '1px 7px', borderRadius: 5, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                <span style={{ fontSize: '0.6rem', color: d.confidence >= 90 ? '#34d399' : '#fbbf24', flexShrink: 0 }}>{d.confidence}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI 卡片 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
          {kpis.map((k, i) => (
            <div key={i} className="card" style={{ borderTop: `3px solid ${k.color}` }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{k.icon} {k.label}</div>
              <div className="card-value" style={{ color: k.color }}>{k.value}</div>
              <div className={`card-change ${k.positive ? 'positive' : 'negative'}`}>{k.change}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '6px 16px',
                fontSize: '0.75rem',
                fontWeight: tab === t.key ? 700 : 400,
                color: tab === t.key ? '#4285f4' : 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid #4285f4' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ════════════════════════════════════
            Tab 0 – 总览
        ════════════════════════════════════ */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 7日渠道趋势 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <Activity size={13} style={{ display: 'inline', marginRight: 4 }} />7日渠道消耗趋势（$）
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={dailyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="search" name="Search" stroke="#4285f4" fill="rgba(66,133,244,0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="youtube" name="YouTube" stroke="#ff0000" fill="rgba(255,0,0,0.10)" strokeWidth={2} />
                  <Area type="monotone" dataKey="display" name="Display" stroke="#34a853" fill="rgba(52,168,83,0.10)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 渠道分布 + 质量得分分布 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}>
                  <Globe size={13} style={{ display: 'inline', marginRight: 4 }} />渠道预算分布
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={channelShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={({ name, value }) => `${name} ${value}%`} labelLine={false} style={{ fontSize: 10 }}>
                      {channelShare.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '占比']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 4 }}>
                  {channelShare.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.name} {c.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}>
                  <Star size={13} style={{ display: 'inline', marginRight: 4 }} />关键词质量得分分布
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={qualityScoreDist} barSize={18}>
                    <XAxis dataKey="score" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="关键词数" fill="#4285f4" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GMV趋势 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <TrendingUp size={13} style={{ display: 'inline', marginRight: 4 }} />7日GMV趋势（$）
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={dailyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="gmv" name="GMV" stroke="#34a853" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            Tab 1 – 搜索广告
        ════════════════════════════════════ */}
        {tab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Top 关键词 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <Search size={13} style={{ display: 'inline', marginRight: 4 }} />Top 8 关键词表现
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['关键词', '匹配方式', 'CPC', 'CTR', '质量得分', '转化数'].map((h, i) => (
                      <th key={i} style={{ padding: '6px 8px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topKeywords.map((kw, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '7px 8px', color: '#4285f4', fontFamily: 'monospace', fontSize: '0.68rem' }}>{kw.keyword}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 4, background: kw.match === 'Exact' ? 'rgba(66,133,244,0.15)' : kw.match === 'Phrase' ? 'rgba(251,188,4,0.15)' : 'rgba(52,168,83,0.15)', color: kw.match === 'Exact' ? '#4285f4' : kw.match === 'Phrase' ? '#fbbc04' : '#34a853' }}>{kw.match}</span>
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>{kw.cpc}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: parseFloat(kw.ctr) >= 4.5 ? '#34d399' : 'var(--text-primary)' }}>{kw.ctr}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <div style={{ width: 28, height: 5, borderRadius: 3, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                            <div style={{ width: `${kw.qs * 10}%`, height: '100%', background: kw.qs >= 8 ? '#34a853' : kw.qs >= 6 ? '#fbbc04' : '#ea4335' }} />
                          </div>
                          <span style={{ color: kw.qs >= 8 ? '#34d399' : kw.qs >= 6 ? '#fbbf24' : '#f87171' }}>{kw.qs}</span>
                        </div>
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 600 }}>{kw.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 否定关键词 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>
                <Zap size={13} style={{ display: 'inline', marginRight: 4 }} />否定关键词列表
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {negativeKeywords.map((kw, i) => (
                  <span key={i} style={{ fontSize: '0.65rem', padding: '3px 9px', borderRadius: 12, background: 'rgba(234,67,53,0.1)', color: '#ea4335', border: '1px solid rgba(234,67,53,0.2)' }}>- {kw}</span>
                ))}
              </div>
            </div>

            {/* 广告文案 CTR 对比 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <BarChart3 size={13} style={{ display: 'inline', marginRight: 4 }} />广告文案 CTR 对比
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {adCopies.map((ad, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 5, flexShrink: 0, background: ad.status === 'Winner' ? 'rgba(52,168,83,0.15)' : ad.status === 'Testing' ? 'rgba(251,188,4,0.15)' : 'rgba(128,128,128,0.15)', color: ad.status === 'Winner' ? '#34a853' : ad.status === 'Testing' ? '#fbbc04' : '#888' }}>{ad.status}</span>
                    <span style={{ flex: 1, fontSize: '0.72rem' }}>{ad.headline}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{ width: `${(parseFloat(ad.ctr) / 6.5) * 100}%`, height: '100%', background: '#4285f4' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4285f4', width: 32 }}>{ad.ctr}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ad.conv}次转化</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            Tab 2 – YouTube广告
        ════════════════════════════════════ */}
        {tab === 'youtube' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Top 视频 高亮 */}
            <div style={{ padding: '12px 16px', background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,0,0,0.18)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(255,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Play size={20} color="#ff0000" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 2 }}>Marie Dalgar Foundation Tutorial</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>In-stream Skippable · 最佳视频 · 1.2M曝光 · 品牌提升 +12%</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ff0000' }}>28.6%</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>观看率</div>
              </div>
            </div>

            {/* 视频活动表格 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <Play size={13} style={{ display: 'inline', marginRight: 4 }} />视频广告活动表现
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['活动名称', '类型', '观看率', 'CPV', '品牌提升', '曝光量', '预算'].map((h, i) => (
                      <th key={i} style={{ padding: '6px 8px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {youtubeCampaigns.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '7px 8px', color: 'var(--text-primary)' }}>{c.name}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.58rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(255,0,0,0.1)', color: '#ff4444' }}>{c.type}</span>
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: '#ff0000', fontWeight: 700 }}>{c.viewRate}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>{c.cpv}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: '#34d399' }}>{c.brandLift}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>{c.impressions}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: '#4285f4' }}>{c.budget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 观看率对比 BarChart */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <Eye size={13} style={{ display: 'inline', marginRight: 4 }} />各活动观看率对比
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={youtubeCampaigns.map(c => ({ name: c.type.split(' ')[0], rate: parseFloat(c.viewRate) }))} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '观看率']} />
                  <Bar dataKey="rate" name="观看率" fill="#ff0000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI素材建议 */}
            <div style={{ padding: '10px 14px', background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.15)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Brain size={16} color="#4285f4" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: '#4285f4' }}>VideoCompletion-Predictor · 素材优化建议</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  检测到In-stream素材前5秒跳过率达67%（阈值65%）。建议：① 将产品最终效果前置至0-3秒；② 加入字幕强化无声观看；③ 测试问句开头钩子（"Want flawless skin in 30 seconds?"）。预计完播率可提升至32%以上。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            Tab 3 – 展示广告
        ════════════════════════════════════ */}
        {tab === 'display' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 再营销受众 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <Users size={13} style={{ display: 'inline', marginRight: 4 }} />再营销受众表现
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['受众列表', '受众规模', 'CTR', '转化数', 'ROAS', '状态'].map((h, i) => (
                      <th key={i} style={{ padding: '6px 8px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {remarketingAudiences.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '7px 8px', fontWeight: 600 }}>{a.name}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>{a.size}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: parseFloat(a.ctr) >= 4 ? '#34d399' : 'var(--text-primary)' }}>{a.ctr}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>{a.conv}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 700, color: '#34a853' }}>{a.roas}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 5, background: a.status === 'Active' ? 'rgba(52,168,83,0.15)' : 'rgba(251,188,4,0.15)', color: a.status === 'Active' ? '#34a853' : '#fbbc04' }}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 版位分布 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <Globe size={13} style={{ display: 'inline', marginRight: 4 }} />投放版位分布
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['网站', '类别', '曝光量', 'CTR', 'CPA'].map((h, i) => (
                      <th key={i} style={{ padding: '6px 8px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {placements.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '7px 8px', color: '#4285f4', fontFamily: 'monospace', fontSize: '0.68rem' }}>{p.site}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 4, background: p.category === 'Beauty Blog' ? 'rgba(255,0,0,0.1)' : 'rgba(66,133,244,0.1)', color: p.category === 'Beauty Blog' ? '#ff4444' : '#4285f4' }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '7px 8px', textAlign: 'center' }}>{p.impressions}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: parseFloat(p.ctr) >= 0.7 ? '#34d399' : 'var(--text-muted)' }}>{p.ctr}</td>
                      <td style={{ padding: '7px 8px', textAlign: 'center', color: parseFloat(p.cpa.replace('$', '')) <= 30 ? '#34d399' : 'var(--text-primary)' }}>{p.cpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 频次上限设置 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>
                <Activity size={13} style={{ display: 'inline', marginRight: 4 }} />频次上限设置
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: '每周频次上限', value: '5次', sub: '防止广告疲劳', color: '#4285f4' },
                  { label: '每日频次上限', value: '2次', sub: '单日不超过2次', color: '#34a853' },
                  { label: '再营销窗口', value: '30天', sub: '访客跟踪周期', color: '#fbbc04' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: 2 }}>{item.label}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI建议 */}
            <div style={{ padding: '10px 14px', background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.15)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Bot size={16} color="#4285f4" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 4, color: '#4285f4' }}>CTR-Predictor-DeepFM · 再营销优化</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  高LTV受众（18K用户）ROAS达8.4x，远超其他受众。建议：① 将高LTV受众预算占比从15%提升至25%；② 对购物车未付款用户增加动态商品广告；③ 对类似受众扩展使用更宽泛的创意测试版本。AI预计整体ROAS可提升至5.1x。
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
