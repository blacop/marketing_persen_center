import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Video, TrendingUp, DollarSign, Users, Zap, Bot, Brain, Globe, Hash, Play, Target, Activity } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ===== TikTok Global (International) · Marie Dalgar 玛丽黛佳 =====
// Platforms: TikTok US / UK / JP / SEA (NOT 抖音 domestic)
// Key metrics: ROAS, Video Completion Rate, Creator ROAS, Hashtag Trend Index
// Ad formats: TopView, Brand Takeover, In-Feed, Branded Hashtag Challenge
// Attribution: MetaCAPI + TikTok Pixel server-side events

const TIKTOK_TEAL = '#00f2ea'
const TIKTOK_DARK = '#010101'

// ===== 7日ROAS趋势 =====
const roasTrend = [
  { date: '04/09', roas: 4.2, target: 4.0 },
  { date: '04/10', roas: 4.5, target: 4.0 },
  { date: '04/11', roas: 4.3, target: 4.0 },
  { date: '04/12', roas: 4.8, target: 4.0 },
  { date: '04/13', roas: 5.1, target: 4.0 },
  { date: '04/14', roas: 4.9, target: 4.0 },
  { date: '04/15', roas: 5.2, target: 4.0 },
]

// ===== 广告格式效果 =====
const adFormatData = [
  { format: 'TopView', roas: 8.2, spend: 12000, color: TIKTOK_TEAL },
  { format: 'Brand Takeover', roas: 6.4, spend: 8000, color: '#fe2c55' },
  { format: 'In-Feed', roas: 4.9, spend: 15000, color: '#25f4ee' },
  { format: 'Branded Hashtag', roas: 3.2, spend: 4000, color: '#a78bfa' },
]

// ===== 市场GMV分布 =====
const marketGmvData = [
  { name: 'US', value: 42, color: '#00f2ea' },
  { name: 'UK', value: 18, color: '#fe2c55' },
  { name: 'JP', value: 20, color: '#fbbf24' },
  { name: 'SEA', value: 15, color: '#34d399' },
  { name: 'Other', value: 5, color: '#818cf8' },
]

// ===== 实时热榜话题 =====
const trendingHashtags = [
  { tag: '#GlowUp', views: '2.4B', growth: '+38%', relevance: '高', color: TIKTOK_TEAL },
  { tag: '#MakeupTips', views: '1.8B', growth: '+22%', relevance: '高', color: '#fe2c55' },
  { tag: '#K-Beauty', views: '980M', growth: '+54%', relevance: '极高', color: '#fbbf24' },
]

// ===== Top 5 创意素材 =====
const topCreatives = [
  { name: 'Velvet Lip GRWM Tutorial', completionRate: 52.4, ctr: 6.8, roas: 7.2, market: 'US' },
  { name: '10sec Glow Transformation', completionRate: 48.1, ctr: 5.9, roas: 6.4, market: 'UK' },
  { name: '底妆奇迹 Foundation Review', completionRate: 61.3, ctr: 7.2, roas: 8.9, market: 'JP' },
  { name: 'Drugstore vs MarieDalgar', completionRate: 44.7, ctr: 5.1, roas: 5.8, market: 'SEA' },
  { name: 'Date Night Full Face', completionRate: 39.2, ctr: 4.6, roas: 5.2, market: 'US' },
]

// ===== 疲劳素材 =====
const fatiguedCreatives = [
  { name: 'Spring Color Palette Reveal', daysRunning: 9, ctrDrop: '-38%', status: '严重疲劳' },
  { name: 'ASMR Skincare Routine', daysRunning: 7, ctrDrop: '-24%', status: '轻度疲劳' },
  { name: 'Blush Draping Technique', daysRunning: 6, ctrDrop: '-19%', status: '预警' },
]

// ===== Creator合作 =====
const creators = [
  { handle: '@beautyqueen_us', followers: '820万', country: '美国', flag: '🇺🇸', roas: 6.2, category: '美妆/护肤', score: 9.1, status: '合作中' },
  { handle: '@makeupmuse_uk', followers: '340万', country: '英国', flag: '🇬🇧', roas: 5.8, category: '彩妆', score: 8.7, status: '合作中' },
  { handle: '@sakura_beauty_jp', followers: '210万', country: '日本', flag: '🇯🇵', roas: 7.1, category: '底妆', score: 9.4, status: '合作中' },
  { handle: '@asianbeauty_sg', followers: '180万', country: '新加坡', flag: '🇸🇬', roas: 5.4, category: '全品类', score: 8.2, status: '合作中' },
]

// ===== 市场表现 =====
const marketData = [
  { market: 'US', flag: '🇺🇸', spend: 16380, gmv: 80640, roas: 4.92, topProduct: '丝绒唇釉', trend: '话题 #GlowUp 带来自然流量增长', trendType: 'up' as const },
  { market: 'UK', flag: '🇬🇧', spend: 7020, gmv: 34560, roas: 4.92, topProduct: '眼影盘星空', trend: '夏季美妆需求上升，In-Feed效果优', trendType: 'up' as const },
  { market: 'JP', flag: '🇯🇵', spend: 7800, gmv: 38400, roas: 4.92, topProduct: '水光粉底液', trend: 'JP市场完播率最高达61%，素材质量强', trendType: 'up' as const },
  { market: 'SEA', flag: '🏳️', spend: 5850, gmv: 28800, roas: 4.92, topProduct: '修容高光盘', trend: 'Creator @asianbeauty_sg 带动转化', trendType: 'stable' as const },
  { market: 'Other', flag: '🌍', spend: 1950, gmv: 9600, roas: 4.92, topProduct: '睫毛膏纤长', trend: '市场测试阶段，重点观察澳大利亚', trendType: 'stable' as const },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

export default function TikTokGlobal() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'overview' | 'creative' | 'creator' | 'market'>('overview')

  // ===== AI Config =====
  const tiktokAIGroups: AIConfigGroup[] = [
    {
      title: 'TikTok出价策略',
      icon: <Target size={16} />,
      params: [
        createParam('roas_target', 'ROAS目标值', 4.5, 'x', 'TikTok Global各市场的最低ROAS安全线，低于阈值计划暂停', 4.2, 91, {
          min: 1.5, max: 12.0, step: 0.1, learningDataPoints: 38200,
          adjustHistory: [
            { time: '2小时前', from: '4.2', to: '4.5', reason: 'US市场#GlowUp话题带动自然流量，AI上调ROAS目标' },
            { time: '1天前', from: '4.8', to: '4.2', reason: 'JP市场完播率下滑，AI临时下调目标' },
          ],
        }),
        createParam('bid_strategy_global', 'Global出价模式', 'Lowest Cost', '', 'TikTok Ads Manager出价策略：Lowest Cost探索期，Target CPA稳定期，Value-Based高ROAS期', 'Value-Based', 88, {
          type: 'select', options: ['Lowest Cost', 'Target CPA', 'Value-Based', 'AI Dynamic'], learningDataPoints: 52100,
          adjustHistory: [
            { time: '3小时前', from: 'Target CPA', to: 'Lowest Cost', reason: 'US TopView库存充足，切换最低成本抢量' },
            { time: '2天前', from: 'Lowest Cost', to: 'Target CPA', reason: '冷启动完成，AI切换目标CPA稳定投放' },
          ],
        }),
        createParam('topview_budget_ratio', 'TopView预算占比', 30, '%', 'TopView ROAS最高(8.2x)，但库存有限且CPM高', 28, 85, {
          min: 5, max: 60, step: 5, learningDataPoints: 29800,
          adjustHistory: [
            { time: '昨日', from: '25', to: '30', reason: 'TopView ROAS超预期，AI提升预算占比' },
          ],
        }),
        createParam('hashtag_challenge_budget', 'Branded Hashtag预算', 4000, '$', 'Hashtag Challenge品牌认知目标，不做ROAS考核', 3500, 78, {
          min: 1000, max: 20000, step: 500, autoTuneEnabled: false, learningDataPoints: 12400,
          adjustHistory: [
            { time: '3天前', from: '3000', to: '4000', reason: '#K-Beauty话题热度上升，手动增加挑战赛预算' },
          ],
        }),
      ],
    },
    {
      title: '创意疲劳阈值',
      icon: <Video size={16} />,
      params: [
        createParam('completion_rate_min', '完播率最低阈值', 35, '%', 'TikTok核心质量信号，完播率低于此值触发素材替换', 32, 92, {
          min: 15, max: 70, step: 1, learningDataPoints: 41600,
          adjustHistory: [
            { time: '昨日', from: '30', to: '35', reason: 'JP市场整体完播率提升，AI上调阈值' },
            { time: '4天前', from: '40', to: '30', reason: 'SEA市场用户完播习惯差异，AI下调阈值' },
          ],
        }),
        createParam('fatigue_days', '素材疲劳天数', 6, '天', 'TikTok视频投放超过此天数后强制触发A/B换组', 5, 87, {
          min: 2, max: 21, step: 1, learningDataPoints: 35900,
          adjustHistory: [
            { time: '2天前', from: '5', to: '6', reason: 'JP高完播素材衰减慢，AI延长疲劳周期' },
          ],
        }),
        createParam('ctr_floor_tiktok', 'TikTok CTR下限', 4.0, '%', 'In-Feed广告CTR低于此值认定素材需更换', 3.8, 83, {
          min: 1.0, max: 10.0, step: 0.5, learningDataPoints: 28700,
          adjustHistory: [
            { time: '3天前', from: '3.5', to: '4.0', reason: '整体素材质量提升，AI上调CTR基线' },
          ],
        }),
        createParam('ab_sample_tiktok', 'A/B最小样本量', 2000, '次', 'TikTok素材A/B测试达到此曝光量才出结论', 2500, 90, {
          min: 500, max: 10000, step: 500, learningDataPoints: 44200,
          adjustHistory: [
            { time: '1周前', from: '1500', to: '2000', reason: '小样本结论不稳定，AI提升最小样本量' },
          ],
        }),
      ],
    },
    {
      title: 'Creator合作预算',
      icon: <Users size={16} />,
      params: [
        createParam('creator_budget_ratio', 'Creator预算占比', 22, '%', '总预算中用于Creator合作（含素材费+投放费）的比例', 25, 84, {
          min: 5, max: 50, step: 5, learningDataPoints: 19600,
          adjustHistory: [
            { time: '2天前', from: '18', to: '22', reason: 'Creator合作ROAS平均6.1x超标，AI提升预算占比' },
          ],
        }),
        createParam('creator_roas_min', 'Creator最低合作ROAS', 5.0, 'x', 'Creator合作内容投放低于此ROAS不续约', 4.8, 89, {
          min: 2.0, max: 12.0, step: 0.5, learningDataPoints: 23400,
          adjustHistory: [
            { time: '3天前', from: '4.5', to: '5.0', reason: '头部Creator表现超预期，AI提高合作门槛' },
          ],
        }),
        createParam('creator_tier_split', '达人层级分配', '头部50%/腰部40%/尾部10%', '', 'Creator预算在头部(100万+)/腰部(10-100万)/尾部(<10万)粉丝间的分配', '头部40%/腰部50%/尾部10%', 76, {
          type: 'select', options: ['头部50%/腰部40%/尾部10%', '头部40%/腰部50%/尾部10%', '头部30%/腰部50%/尾部20%'], autoTuneEnabled: false, learningDataPoints: 11200,
          adjustHistory: [
            { time: '1周前', from: '头部60%/腰部35%/尾部5%', to: '头部50%/腰部40%/尾部10%', reason: '腰部Creator性价比更高，手动调整层级分配' },
          ],
        }),
        createParam('creator_content_boost', 'Creator内容加投倍数', 2.5, 'x', '优质Creator内容通过Spark Ads加投的预算倍数', 3.0, 82, {
          min: 1.0, max: 8.0, step: 0.5, learningDataPoints: 16800,
          adjustHistory: [
            { time: '昨日', from: '2.0', to: '2.5', reason: '@sakura_beauty_jp内容完播率61%，AI提升加投倍数' },
          ],
        }),
      ],
    },
  ]

  const tiktokLearningStatus: AILearningStatus = {
    modelVersion: 'v2.8.0-tiktok-global',
    lastTraining: '2小时前',
    totalDataPoints: 284000,
    avgConfidence: 88,
    autoAdjustCount24h: 186,
    learningRate: '0.0006 (AdamW)',
    nextTraining: '4小时后',
    improvementRate: '+9.8%',
  }
  useRegisterAIConfig(tiktokAIGroups, tiktokLearningStatus, 'TikTok Global')

  const decisions = [
    { id: 'DC-T01', title: '#MakeupTutorial话题热度飙升，跟投TopView', confidence: 92, status: '执行中', model: 'GlobalTrend-Radar', platform: 'TikTok US', impact: '预计曝光+180万', time: '11:50' },
    { id: 'DC-T02', title: '日本市场完播率下滑，更换视频前3秒', confidence: 86, status: '待确认', model: 'VideoCompletion-Predictor', platform: 'TikTok JP', impact: '完播率预计+14%', time: '11:25' },
    { id: 'DC-T03', title: '东南亚Creator合作，批量素材测试', confidence: 88, status: '已完成', model: 'IntlCreator-Scorer', platform: 'TikTok SEA', impact: 'CTR +0.8%', time: '11:00' },
  ]

  const statusStyle: Record<string, { background: string; color: string }> = {
    '执行中': { background: 'rgba(0,242,234,0.12)', color: TIKTOK_TEAL },
    '已完成': { background: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    '待确认': { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  }

  const tabs = [
    { key: 'overview', label: '总览看板' },
    { key: 'creative', label: '创意表现' },
    { key: 'creator', label: 'Creator合作' },
    { key: 'market', label: '市场表现' },
  ] as const

  return (
    <>
      <div className="page-header">
        <h2>TikTok Global · AI 智能投放</h2>
        <p>TikTok for Business · 美国/英国/东南亚/日本 · 今日消耗$3.9万 / GMV$19.2万 · ROAS 4.92x</p>
      </div>
      <div className="page-content">

        {/* ── 模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: `rgba(0,242,234,0.06)`, borderRadius: 10, border: `1px solid rgba(0,242,234,0.2)` }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="MultiLingual-ContentLLM" color={TIKTOK_TEAL} />
          <ModelBadge name="GlobalTrend-Radar" color="#fe2c55" />
          <ModelBadge name="VideoCompletion-Predictor" color="#fbbf24" />
          <ModelBadge name="IntlCreator-Scorer" color="#a78bfa" />
          <ModelBadge name="MetaCAPI-Attribution" color="#34d399" />
        </div>

        {/* ── AI决策中心 · TikTok全球执行状态 ── */}
        <div style={{ marginBottom: 16, padding: '12px 14px', background: `rgba(0,242,234,0.05)`, border: `1px solid rgba(0,242,234,0.2)`, borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: TIKTOK_TEAL, boxShadow: `0 0 6px ${TIKTOK_TEAL}` }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: TIKTOK_TEAL }}>AI决策中心 · TikTok全球执行状态</span>
              <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 7, background: 'rgba(254,44,85,0.15)', color: '#fe2c55' }}>TikTok for Business</span>
            </div>
            <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.65rem', color: TIKTOK_TEAL, background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部 →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {decisions.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 34, flexShrink: 0 }}>{d.time}</span>
                <span style={{ flex: 1, fontSize: '0.72rem' }}>{d.title}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>{d.platform}</span>
                <ModelBadge name={d.model} color={TIKTOK_TEAL} />
                <span style={{ fontSize: '0.62rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                <span style={{ fontSize: '0.58rem', padding: '1px 7px', borderRadius: 5, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                <span style={{ fontSize: '0.6rem', color: d.confidence >= 90 ? '#34d399' : '#fbbf24', flexShrink: 0 }}>{d.confidence}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI卡片 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: '今日消耗', value: '$3.9万', change: '+24.6%', icon: <DollarSign size={13} />, color: TIKTOK_TEAL, positive: true },
            { label: '今日GMV', value: '$19.2万', change: '+31.2%', icon: <TrendingUp size={13} />, color: '#34d399', positive: true },
            { label: 'ROAS', value: '4.92x', change: '+0.54x', icon: <Target size={13} />, color: '#fbbf24', positive: true },
            { label: '完播率', value: '38.4%', change: 'TikTok核心指标', icon: <Play size={13} />, color: '#fe2c55', positive: true },
            { label: 'Creator合作数', value: '28个', change: '4个市场', icon: <Users size={13} />, color: '#a78bfa', positive: true },
            { label: '话题热度指数', value: '8.4/10', change: '#GlowUp 热榜', icon: <Hash size={13} />, color: TIKTOK_TEAL, positive: true },
          ].map((item, i) => (
            <div key={i} className="card" style={{ borderTop: `3px solid ${item.color}` }}>
              <div className="card-title">{item.icon} {item.label}</div>
              <div className="card-value" style={{ color: item.color }}>{item.value}</div>
              <div className={`card-change ${item.positive ? 'positive' : 'negative'}`}>{item.change}</div>
            </div>
          ))}
        </div>

        {/* ── Tab导航 ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '7px 16px', fontSize: '0.78rem', fontWeight: tab === t.key ? 700 : 400,
                color: tab === t.key ? TIKTOK_TEAL : 'var(--text-muted)',
                background: 'transparent', border: 'none', borderBottom: tab === t.key ? `2px solid ${TIKTOK_TEAL}` : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ────────────────────────────────────────────── */}
        {/* TAB 0: 总览看板 */}
        {/* ────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 7日ROAS趋势 + 广告格式效果 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}><TrendingUp size={13} style={{ display: 'inline', marginRight: 4 }} />7日ROAS趋势</div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={roasTrend}>
                    <defs>
                      <linearGradient id="roasGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={TIKTOK_TEAL} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={TIKTOK_TEAL} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[3.5, 5.5]} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}x`, 'ROAS']} />
                    <Area type="monotone" dataKey="roas" stroke={TIKTOK_TEAL} strokeWidth={2} fill="url(#roasGrad)" dot={{ fill: TIKTOK_TEAL, r: 3 }} />
                    <Area type="monotone" dataKey="target" stroke="#fe2c55" strokeWidth={1} strokeDasharray="4 3" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  <span style={{ color: TIKTOK_TEAL }}>— 实际ROAS</span>
                  <span style={{ color: '#fe2c55', marginLeft: 10 }}>-- 目标线 4.0x</span>
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}><Activity size={13} style={{ display: 'inline', marginRight: 4 }} />广告格式效果 · ROAS对比</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={adFormatData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 10]} />
                    <YAxis dataKey="format" type="category" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={85} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}x`, 'ROAS']} />
                    <Bar dataKey="roas" radius={[0, 4, 4, 0]}>
                      {adFormatData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Hashtag Challenge以品牌认知为主，不考核ROAS
                </div>
              </div>
            </div>

            {/* 市场GMV分布 + 实时热榜 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}><Globe size={13} style={{ display: 'inline', marginRight: 4 }} />市场GMV分布</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={marketGmvData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={2}>
                        {marketGmvData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}%`, 'GMV占比']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {marketGmvData.map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.72rem', flex: 1 }}>{m.name}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.color }}>{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}><Hash size={13} style={{ display: 'inline', marginRight: 4 }} />实时热榜话题</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {trendingHashtags.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: `rgba(0,242,234,0.05)`, borderRadius: 8, border: `1px solid rgba(0,242,234,0.12)` }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: h.color }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: h.color }}>{h.tag}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{h.views} 播放</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>{h.growth}</div>
                        <div style={{ fontSize: '0.58rem', padding: '1px 6px', borderRadius: 4, background: `rgba(0,242,234,0.12)`, color: TIKTOK_TEAL, marginTop: 2 }}>{h.relevance}相关</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', padding: '4px 0' }}>
                    <Globe size={10} style={{ display: 'inline', marginRight: 3 }} />
                    GlobalTrend-Radar · 数据来源: TikTok Creative Center API
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────── */}
        {/* TAB 1: 创意表现 */}
        {/* ────────────────────────────────────────────── */}
        {tab === 'creative' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* AI建议横幅 */}
            <div style={{ padding: '10px 14px', background: `rgba(0,242,234,0.07)`, border: `1px solid rgba(0,242,234,0.25)`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Brain size={15} color={TIKTOK_TEAL} />
              <span style={{ fontSize: '0.75rem', color: TIKTOK_TEAL, fontWeight: 600 }}>AI洞察</span>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-primary)' }}>基于完播率曲线，建议在第2秒加入产品特写 — VideoCompletion-Predictor 置信度 89%</span>
            </div>

            {/* Top 5 素材表格 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}><Video size={13} style={{ display: 'inline', marginRight: 4 }} />Top 5 创意素材表现</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['视频名称', '完播率', 'CTR', 'ROAS', '市场'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCreatives.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 10px', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Play size={11} color={TIKTOK_TEAL} />
                          {c.name}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.75rem' }}>
                        <span style={{ color: c.completionRate >= 50 ? '#34d399' : c.completionRate >= 35 ? '#fbbf24' : '#ef4444', fontWeight: 700 }}>
                          {c.completionRate}%
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.75rem' }}>
                        <span style={{ color: c.ctr >= 5.5 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>{c.ctr}%</span>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.75rem' }}>
                        <span style={{ color: TIKTOK_TEAL, fontWeight: 700 }}>{c.roas}x</span>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.75rem' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(0,242,234,0.1)', color: TIKTOK_TEAL, fontSize: '0.68rem' }}>{c.market}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 素材疲劳检测 */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>
                <Zap size={13} style={{ display: 'inline', marginRight: 4 }} />素材疲劳检测
                <span style={{ marginLeft: 8, fontSize: '0.65rem', padding: '1px 7px', borderRadius: 5, background: 'rgba(254,44,85,0.12)', color: '#fe2c55' }}>3条需处理</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fatiguedCreatives.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(254,44,85,0.05)', border: '1px solid rgba(254,44,85,0.15)', borderRadius: 7 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{f.name}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>已投放 {f.daysRunning} 天 · CTR下降 {f.ctrDrop}</div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', padding: '2px 8px', borderRadius: 5, fontWeight: 600,
                      background: f.status === '严重疲劳' ? 'rgba(239,68,68,0.15)' : f.status === '轻度疲劳' ? 'rgba(251,191,36,0.15)' : 'rgba(0,242,234,0.1)',
                      color: f.status === '严重疲劳' ? '#ef4444' : f.status === '轻度疲劳' ? '#fbbf24' : TIKTOK_TEAL,
                    }}>{f.status}</span>
                    <button style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 5, background: TIKTOK_TEAL, color: TIKTOK_DARK, border: 'none', cursor: 'pointer', fontWeight: 700 }}>AI换组</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────── */}
        {/* TAB 2: Creator合作 */}
        {/* ────────────────────────────────────────────── */}
        {tab === 'creator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {creators.map((c, i) => (
                <div key={i} className="card" style={{ border: `1px solid rgba(0,242,234,0.15)` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `rgba(0,242,234,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, border: `2px solid ${TIKTOK_TEAL}` }}>
                      {c.flag}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: TIKTOK_TEAL }}>{c.handle}</span>
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>{c.status}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                        {c.country} · {c.followers}粉丝 · {c.category}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div style={{ textAlign: 'center', padding: '6px 0', background: 'rgba(0,242,234,0.06)', borderRadius: 6 }}>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: TIKTOK_TEAL }}>{c.roas}x</div>
                          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>合作ROAS</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '6px 0', background: 'rgba(167,139,250,0.06)', borderRadius: 6 }}>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#a78bfa' }}>{c.score}</div>
                          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>AI评分</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '6px 0', background: 'rgba(251,191,36,0.06)', borderRadius: 6 }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24' }}>{c.followers}</div>
                          <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>粉丝量</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 5, background: 'rgba(0,242,234,0.1)', color: TIKTOK_TEAL, border: `1px solid rgba(0,242,234,0.3)`, cursor: 'pointer' }}>查看内容</button>
                    <button style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 5, background: TIKTOK_TEAL, color: TIKTOK_DARK, border: 'none', cursor: 'pointer', fontWeight: 700 }}>Spark Ads加投</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Bot size={14} color="#a78bfa" />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>IntlCreator-Scorer</span> · AI综合评分维度：粉丝质量、内容完播率、品牌契合度、历史带货ROAS、受众地域匹配度
              </span>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────── */}
        {/* TAB 3: 市场表现 */}
        {/* ────────────────────────────────────────────── */}
        {tab === 'market' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {marketData.slice(0, 3).map((m, i) => (
                <div key={i} className="card" style={{ borderTop: `3px solid ${TIKTOK_TEAL}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>{m.flag}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.market}</span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(0,242,234,0.1)', color: TIKTOK_TEAL, marginLeft: 'auto' }}>
                      {m.trendType === 'up' ? '↑ 增长' : '→ 稳定'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>消耗</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>${(m.spend / 10000).toFixed(1)}万</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>GMV</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>${(m.gmv / 10000).toFixed(1)}万</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>ROAS</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: TIKTOK_TEAL }}>{m.roas}x</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>爆品</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fbbf24' }}>{m.topProduct}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '6px 8px', background: 'rgba(0,242,234,0.04)', borderRadius: 5, borderLeft: `2px solid ${TIKTOK_TEAL}` }}>
                    {m.trend}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {marketData.slice(3).map((m, i) => (
                <div key={i} className="card" style={{ borderTop: '3px solid #818cf8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>{m.flag}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.market}</span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(129,140,248,0.1)', color: '#818cf8', marginLeft: 'auto' }}>→ 稳定</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
                    <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>消耗</div><div style={{ fontSize: '0.85rem', fontWeight: 700 }}>${(m.spend / 10000).toFixed(1)}万</div></div>
                    <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>GMV</div><div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>${(m.gmv / 10000).toFixed(1)}万</div></div>
                    <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>ROAS</div><div style={{ fontSize: '0.85rem', fontWeight: 700, color: TIKTOK_TEAL }}>{m.roas}x</div></div>
                    <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>爆品</div><div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fbbf24' }}>{m.topProduct}</div></div>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '6px 8px', background: 'rgba(129,140,248,0.04)', borderRadius: 5, borderLeft: '2px solid #818cf8' }}>
                    {m.trend}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
