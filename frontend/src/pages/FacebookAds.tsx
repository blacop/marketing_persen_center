import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Image, Target, DollarSign, TrendingUp, Users, Eye, Zap, Brain, Bot, Shield, AlertTriangle, BarChart3, Activity, Globe, Lock } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ===== Meta Ads 国际投放核心：CAPI归因 + 隐私安全定向 =====
// 玛丽黛佳出海模式：美国/英国/欧洲 三大市场并行
// 核心指标：ROAS = GMV / 广告消耗（以美元计）
// iOS ATT挑战：IDFA缺失导致归因断链，CAPI补充信号
// GDPR合规：EU市场限制行为定向，切换主题兴趣定向

const FB_BLUE = '#1877f2'
const IG_PINK = '#e1306c'

// ===== 7日ROAS趋势 =====
const roasTrend = [
  { date: '04/09', roas: 3.82, fb: 3.78, ig: 3.91 },
  { date: '04/10', roas: 3.95, fb: 3.88, ig: 4.08 },
  { date: '04/11', roas: 4.08, fb: 4.02, ig: 4.18 },
  { date: '04/12', roas: 4.15, fb: 4.10, ig: 4.24 },
  { date: '04/13', roas: 4.28, fb: 4.22, ig: 4.38 },
  { date: '04/14', roas: 4.19, fb: 4.14, ig: 4.28 },
  { date: '04/15', roas: 4.32, fb: 4.28, ig: 4.41 },
]

// ===== 市场分布 =====
const marketDistribution = [
  { name: 'US', value: 45, color: FB_BLUE },
  { name: 'UK', value: 22, color: '#1565d8' },
  { name: 'DE', value: 15, color: '#4299e1' },
  { name: 'FR', value: 12, color: IG_PINK },
  { name: 'Other', value: 6, color: '#a0aec0' },
]

// ===== 广告格式效果 =====
const formatPerformance = [
  { format: 'Reels', ctr: 3.42, spend: 22800, roas: 4.68 },
  { format: 'Stories', ctr: 2.95, spend: 18500, roas: 4.12 },
  { format: 'Feed', ctr: 2.41, spend: 11200, roas: 3.88 },
  { format: 'Carousel', ctr: 2.18, spend: 4700, roas: 3.55 },
]

// ===== 广告系列 =====
const campaigns = [
  { name: '底妆夏季新品', market: 'US', budget: '$1.8万/日', roas: 4.8, metric: 'ROAS 4.8x', status: '执行中', platform: 'Facebook', format: 'Reels+Feed' },
  { name: '唇彩全球种草', market: 'Global', budget: '$1.2万/日', roas: 3.9, metric: 'ROAS 3.9x', status: '执行中', platform: 'Instagram', format: 'Stories+Reels' },
  { name: '护肤欧洲市场', market: 'EU', budget: '$0.9万/日', roas: 3.4, metric: 'ROAS 3.4x', status: '暂停(GDPR审查)', platform: 'Facebook', format: 'Feed+Carousel' },
  { name: '眼影UK专项', market: 'UK', budget: '$0.6万/日', roas: 4.1, metric: 'ROAS 4.1x', status: '执行中', platform: 'Instagram', format: 'Reels+Stories' },
  { name: '品牌认知-全球', market: 'Global', budget: '$1.2万/日', roas: 0, metric: 'Reach 280万', status: '执行中', platform: 'Facebook+IG', format: 'Feed+Stories' },
]

// ===== 受众列表 =====
const audiences = [
  { name: '购买用户相似扩展', type: 'Lookalike', size: '280万', platform: 'US', status: '活跃', match: '2.8%相似度' },
  { name: '网站访客再营销', type: 'Custom', size: '45万', platform: 'Global', status: '活跃', match: 'Pixel匹配' },
  { name: '高价值用户LTV Top10%', type: 'Custom', size: '12万', platform: 'Global', status: '活跃', match: 'CAPI上传' },
  { name: '竞品兴趣受众', type: 'Interest', size: '890万', platform: 'US+UK', status: '活跃', match: '兴趣定向' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

const tabs = ['总览看板', '广告系列', '受众管理', '隐私合规']

export default function FacebookAds() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  // ===== AI配置 =====
  const metaAIGroups: AIConfigGroup[] = [
    {
      title: 'Meta广告出价策略',
      icon: <Target size={16} />,
      params: [
        createParam('roas_target', 'ROAS目标值', 4.2, 'x', '所有Meta计划的最低ROAS安全线，低于阈值的广告组将被标记并降预算', 4.0, 91, {
          min: 1.5, max: 10.0, step: 0.1, learningDataPoints: 48200, adjustHistory: [
            { time: '2小时前', from: '4.0', to: '4.2', reason: 'Reels素材ROAS持续超目标，AI上调基线' },
            { time: '昨日', from: '4.5', to: '4.0', reason: '欧洲市场GDPR限制导致整体ROAS下滑，AI下调目标' },
          ],
        }),
        createParam('bid_strategy', '出价策略', 'Cost Cap', '', 'Meta出价策略：Lowest Cost适合探索期，Cost Cap稳定CPA，Value Optimization提升高价值转化', 'AI Dynamic', 88, {
          type: 'select', options: ['Lowest Cost', 'Cost Cap', 'Bid Cap', 'Value Optimization', 'AI Dynamic'], learningDataPoints: 62400, adjustHistory: [
            { time: '3小时前', from: 'Lowest Cost', to: 'Cost Cap', reason: 'CTR下滑期控制CPA，AI切换Cost Cap策略' },
            { time: '2天前', from: 'Cost Cap', to: 'Lowest Cost', reason: '新广告系列冷启动，AI切换最低成本探索' },
          ],
        }),
        createParam('cpm_ceiling', 'CPM上限', 12, '$', '单千次展示最高出价上限，防止竞价过热导致ROAS亏损', 10, 84, {
          min: 3, max: 50, step: 1, learningDataPoints: 35800, adjustHistory: [
            { time: '昨日', from: '10', to: '12', reason: '美国市场竞争加剧，AI放宽CPM上限维持量级' },
          ],
        }),
        createParam('budget_pacing', '预算投放节奏', '均匀分配', '', '控制日预算在时间轴上的分配方式', 'AI加速', 86, {
          type: 'select', options: ['均匀分配', '前置加速', '黄金时段', 'AI加速'], learningDataPoints: 28900, adjustHistory: [
            { time: '4天前', from: '均匀分配', to: 'AI加速', reason: '检测到晚间转化率更高，AI切换加速策略' },
          ],
        }),
      ],
    },
    {
      title: 'CAPI归因配置',
      icon: <Shield size={16} />,
      params: [
        createParam('capi_match_rate_target', 'CAPI匹配率目标', 70, '%', 'Conversions API事件匹配率目标，低于阈值触发信号质量优化', 68, 79, {
          min: 40, max: 95, step: 1, learningDataPoints: 22400, adjustHistory: [
            { time: '3天前', from: '65', to: '70', reason: '邮件匹配信号质量提升，AI上调目标匹配率' },
          ],
        }),
        createParam('attribution_window', '归因窗口', 7, '天', '点击后归因窗口天数（iOS ATT限制下建议7天点击+1天浏览）', 7, 92, {
          min: 1, max: 28, step: 1, autoTuneEnabled: false, learningDataPoints: 41200, adjustHistory: [
            { time: '1周前', from: '28', to: '7', reason: 'iOS 14+ ATT限制，Meta建议切换7天窗口' },
          ],
        }),
        createParam('dedup_event_window', '去重事件窗口', 5, '分钟', 'CAPI与Pixel双信号去重窗口，防止同一转化事件重复计算', 5, 95, {
          min: 1, max: 60, step: 1, learningDataPoints: 18600, adjustHistory: [],
        }),
        createParam('signal_priority', '信号优先级', 'CAPI+Pixel', '', '归因信号来源优先级策略', 'CAPI优先', 87, {
          type: 'select', options: ['仅Pixel', '仅CAPI', 'CAPI+Pixel', 'CAPI优先'], learningDataPoints: 31500, adjustHistory: [
            { time: '2周前', from: '仅Pixel', to: 'CAPI优先', reason: 'iOS ATT导致Pixel信号丢失65%，切换CAPI优先' },
          ],
        }),
      ],
    },
    {
      title: '受众扩展阈值',
      icon: <Users size={16} />,
      params: [
        createParam('lookalike_pct', 'Lookalike扩展比例', 2, '%', '相似受众扩展范围：1-2%精准，3-5%均衡，6-10%泛流量', 3, 83, {
          min: 1, max: 10, step: 1, learningDataPoints: 29800, adjustHistory: [
            { time: '昨日', from: '3', to: '2', reason: '扩展3%时CPM飙升，AI收缩至2%精准模式' },
            { time: '4天前', from: '2', to: '3', reason: '精准受众频率过高，AI放宽扩展比例' },
          ],
        }),
        createParam('frequency_cap', '广告展示频次上限', 3.5, '次/周', '单用户每周最大广告展示频次，超出后降低出价避免疲劳', 3.0, 88, {
          min: 1.0, max: 10.0, step: 0.5, learningDataPoints: 44100, adjustHistory: [
            { time: '2天前', from: '3.0', to: '3.5', reason: 'Reels格式用户接受度高，AI放宽频次上限' },
          ],
        }),
        createParam('retargeting_window', '再营销时间窗口', 14, '天', '网站访客纳入再营销受众池的时间范围', 30, 81, {
          min: 3, max: 90, step: 1, learningDataPoints: 19200, adjustHistory: [
            { time: '1周前', from: '30', to: '14', reason: '30天窗口用户购买意图衰减明显，AI缩短窗口' },
          ],
        }),
        createParam('eu_targeting_mode', 'EU定向模式', '主题兴趣定向', '', 'GDPR合规下欧洲市场受众定向策略', '主题兴趣定向', 94, {
          type: 'select', options: ['行为定向', '主题兴趣定向', '宽泛定向', '上下文定向'], autoTuneEnabled: false, learningDataPoints: 15800, adjustHistory: [
            { time: '2周前', from: '行为定向', to: '主题兴趣定向', reason: 'GDPR合规要求，手动切换EU市场定向策略' },
          ],
        }),
      ],
    },
  ]

  const metaLearningStatus: AILearningStatus = {
    modelVersion: 'v2.8.1-meta-intl',
    lastTraining: '2小时前',
    totalDataPoints: 318000,
    avgConfidence: 87,
    autoAdjustCount24h: 142,
    learningRate: '0.0006 (AdamW)',
    nextTraining: '4小时后',
    improvementRate: '+9.8%',
  }

  useRegisterAIConfig(metaAIGroups, metaLearningStatus, 'Facebook国际投放')

  // ===== 决策列表 =====
  const decisions = [
    { id: 'DC-F01', title: '美国市场CTR下滑，Reels素材优先级提升', confidence: 89, status: '执行中', model: 'MetaCAPI-Attribution', platform: 'Facebook US', impact: '预计CTR+22%', time: '11:40' },
    { id: 'DC-F02', title: 'GDPR限制下扩展欧洲Lookalike受众', confidence: 84, status: '待确认', model: 'PrivacySafe-Targeting', platform: 'Instagram EU', impact: '触达+15万用户', time: '11:20' },
    { id: 'DC-F03', title: 'iOS ATT导致归因缺失，启用CAPI补充', confidence: 91, status: '已完成', model: 'MetaCAPI-Attribution', platform: '全平台', impact: '归因恢复率+38%', time: '11:00' },
  ]

  const statusStyle: Record<string, { background: string; color: string }> = {
    '执行中': { background: 'rgba(52,211,153,0.12)', color: '#34d399' },
    '已完成': { background: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    '待确认': { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
  }

  // ===== KPI数据 =====
  const kpis = [
    { label: '今日消耗', value: '$5.7万', change: '+12.4%', up: true, icon: DollarSign, color: FB_BLUE },
    { label: '今日GMV', value: '$24.6万', change: '+18.2%', up: true, icon: TrendingUp, color: '#10b981' },
    { label: 'ROAS', value: '4.32x', change: '+0.28x', up: true, icon: BarChart3, color: '#f59e0b' },
    { label: 'CPM', value: '$8.42', change: '-5.2%', up: false, icon: Eye, color: '#8b5cf6' },
    { label: 'CTR', value: '2.84%', change: '+0.3%', up: true, icon: Activity, color: IG_PINK },
    { label: 'CAPI匹配率', value: '68.4%', change: '', up: true, icon: Shield, color: '#06b6d4' },
  ]

  return (
    <>
      <div className="page-header">
        <h2>Facebook · Instagram AI 投放</h2>
        <p>Meta Ads · 美国/英国/欧洲市场 · 今日消耗$5.7万 / GMV$24.6万 · ROAS 4.32x</p>
      </div>

      <div className="page-content">

        {/* ── Model Banner ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: `rgba(24,119,242,0.06)`, borderRadius: 10, border: `1px solid rgba(24,119,242,0.18)` }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="MetaCAPI-Attribution" color={FB_BLUE} />
          <ModelBadge name="CrossBorder-Lookalike" color="#4299e1" />
          <ModelBadge name="PrivacySafe-Targeting" color="#06b6d4" />
          <ModelBadge name="CTR-Predictor-DeepFM" color={IG_PINK} />
          <ModelBadge name="MultiCurrency-ROAS" color="#10b981" />
        </div>

        {/* ── AI决策中心 · Facebook执行状态 ── */}
        <div style={{ marginBottom: 16, padding: '12px 14px', background: 'rgba(24,119,242,0.05)', border: `1px solid rgba(24,119,242,0.2)`, borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: FB_BLUE, boxShadow: `0 0 5px ${FB_BLUE}` }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5898f8' }}>AI决策中心 · Facebook执行状态</span>
              <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 7, background: 'rgba(225,48,108,0.15)', color: IG_PINK }}>Meta Ads</span>
            </div>
            <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.65rem', color: FB_BLUE, background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部 →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {decisions.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 34, flexShrink: 0 }}>{d.time}</span>
                <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(24,119,242,0.1)', color: '#93c5fd', flexShrink: 0 }}>{d.platform}</span>
                <span style={{ flex: 1, fontSize: '0.72rem' }}>{d.title}</span>
                <ModelBadge name={d.model} color={FB_BLUE} />
                <span style={{ fontSize: '0.62rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                <span style={{ fontSize: '0.58rem', padding: '1px 7px', borderRadius: 5, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                <span style={{ fontSize: '0.6rem', color: d.confidence >= 90 ? '#34d399' : '#fbbf24', flexShrink: 0 }}>{d.confidence}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 18 }}>
          {kpis.map(k => (
            <div key={k.label} className="card" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{k.label}</span>
                <k.icon size={14} color={k.color} />
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</div>
              {k.change && (
                <div style={{ fontSize: '0.65rem', marginTop: 4, color: k.up ? '#34d399' : '#f87171' }}>{k.change}</div>
              )}
              {!k.change && (
                <div style={{ fontSize: '0.65rem', marginTop: 4, color: '#06b6d4' }}>CAPI信号质量</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: '6px 14px', fontSize: '0.75rem', fontWeight: tab === i ? 700 : 400,
              color: tab === i ? FB_BLUE : 'var(--text-muted)',
              background: 'transparent', border: 'none', borderBottom: tab === i ? `2px solid ${FB_BLUE}` : '2px solid transparent',
              cursor: 'pointer', marginBottom: -1, transition: 'all 0.15s',
            }}>{t}</button>
          ))}
        </div>

        {/* ══════════════════════════ TAB 0 总览看板 ══════════════════════════ */}
        {tab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Row 1: ROAS趋势 + 市场分布 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>

              {/* ROAS趋势 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>7日 ROAS 趋势</span>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.65rem' }}>
                    <span style={{ color: FB_BLUE }}>● Facebook</span>
                    <span style={{ color: IG_PINK }}>● Instagram</span>
                    <span style={{ color: '#10b981' }}>● 综合</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={roasTrend}>
                    <defs>
                      <linearGradient id="roasGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={FB_BLUE} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={FB_BLUE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[3.5, 4.7]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}x`, '']} />
                    <Area type="monotone" dataKey="roas" stroke="#10b981" strokeWidth={2} fill="url(#roasGrad)" dot={false} name="综合" />
                    <Line type="monotone" dataKey="fb" stroke={FB_BLUE} strokeWidth={1.5} dot={false} name="Facebook" />
                    <Line type="monotone" dataKey="ig" stroke={IG_PINK} strokeWidth={1.5} dot={false} name="Instagram" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 市场分布 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 12 }}>市场消耗分布</div>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={marketDistribution} cx="50%" cy="50%" innerRadius={34} outerRadius={54} dataKey="value" paddingAngle={2}>
                      {marketDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                  {marketDistribution.map(m => (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-muted)' }}>{m.name}</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: 广告格式效果 + iOS ATT影响 */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>

              {/* 广告格式效果 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 12 }}>广告格式 CTR 效果对比</div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={formatPerformance} barSize={28}>
                    <XAxis dataKey="format" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[0, 4.5]} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'CTR']} />
                    <Bar dataKey="ctr" name="CTR %" radius={[4, 4, 0, 0]}>
                      {formatPerformance.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? IG_PINK : i === 1 ? FB_BLUE : '#4299e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {formatPerformance.map(f => (
                    <div key={f.format} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, background: 'rgba(255,255,255,0.04)', fontSize: '0.65rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{f.format}</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>ROAS {f.roas}x</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* iOS ATT影响卡 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <AlertTriangle size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>iOS ATT 隐私影响</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>ATT 同意率</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>34.2%</div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 6 }}>
                      <div style={{ width: '34.2%', height: '100%', background: '#f59e0b', borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>IDFA 缺失率</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171' }}>65.8%</div>
                  </div>
                  <div style={{ padding: '10px 12px', background: 'rgba(52,211,153,0.08)', borderRadius: 8, border: '1px solid rgba(52,211,153,0.2)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>CAPI 补偿归因</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>+38%</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>归因恢复率提升</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════ TAB 1 广告系列 ══════════════════════════ */}
        {tab === 1 && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 14 }}>广告系列列表</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['系列名称', '市场', '日预算', '核心指标', '平台', '广告格式', '状态'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, i) => {
                  const paused = c.status.includes('暂停')
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.62rem', background: 'rgba(24,119,242,0.1)', color: '#93c5fd' }}>{c.market}</span>
                      </td>
                      <td style={{ padding: '8px 10px', color: '#f59e0b', fontWeight: 600 }}>{c.budget}</td>
                      <td style={{ padding: '8px 10px', color: '#10b981', fontWeight: 700 }}>{c.metric}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {c.platform.includes('Facebook') && <Share2 size={12} color={FB_BLUE} />}
                          {c.platform.includes('Instagram') && <Image size={12} color={IG_PINK} />}
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.platform}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.format}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 5, fontSize: '0.62rem',
                          background: paused ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)',
                          color: paused ? '#f87171' : '#34d399',
                        }}>{c.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.7rem' }}>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>⚠ 合规提示：</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>护肤欧洲市场系列因 GDPR 合规审查暂停，PrivacySafe-Targeting 模型正在生成符合合规要求的替代定向策略，预计 24h 内恢复投放。</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════ TAB 2 受众管理 ══════════════════════════ */}
        {tab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* 受众列表 */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 12 }}>自定义受众 & Lookalike</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {audiences.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: a.type === 'Lookalike' ? `rgba(24,119,242,0.12)` : a.type === 'Interest' ? `rgba(225,48,108,0.12)` : 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Users size={14} color={a.type === 'Lookalike' ? FB_BLUE : a.type === 'Interest' ? IG_PINK : '#10b981'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 2 }}>{a.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.match} · {a.platform}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: FB_BLUE }}>{a.size}</div>
                      <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 4, background: a.type === 'Lookalike' ? `rgba(24,119,242,0.12)` : a.type === 'Interest' ? `rgba(225,48,108,0.12)` : 'rgba(16,185,129,0.12)', color: a.type === 'Lookalike' ? '#93c5fd' : a.type === 'Interest' ? '#f9a8d4' : '#6ee7b7' }}>{a.type}</span>
                    </div>
                    <div style={{ padding: '2px 8px', borderRadius: 5, fontSize: '0.62rem', background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>{a.status}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lookalike说明 */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Brain size={14} color={FB_BLUE} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>CrossBorder-Lookalike 模型状态</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: `rgba(24,119,242,0.06)`, borderRadius: 8, border: `1px solid rgba(24,119,242,0.15)`, marginBottom: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>种子受众</div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>国内高价值用户 · 12万人</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>LTV Top 10% · 基于消费行为 + 品类偏好</div>
                </div>
                <div style={{ padding: '0 16px', color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>美国相似受众</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: FB_BLUE }}>280 万</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2% Lookalike · 跨文化美妆消费特征映射</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>模型置信度</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>83%</div>
                </div>
              </div>
              <div style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.18)', fontSize: '0.7rem' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>⚠ GDPR限制：</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>EU受众不可使用行为定向，已切换为主题兴趣定向（美妆/护肤/时尚）。欧洲市场 Lookalike 扩展暂停，待合规方案审批通过后恢复。</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════ TAB 3 隐私合规 ══════════════════════════ */}
        {tab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* 合规评分 + GDPR状态 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>

              {/* 合规风险评分 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Shield size={14} color="#10b981" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>合规风险评分</span>
                </div>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>82</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>/ 100 · 低风险</div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: 14, maxWidth: 140, margin: '14px auto 0' }}>
                    <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
                  {[
                    { label: 'GDPR合规', score: 88, color: '#10b981' },
                    { label: 'CCPA合规', score: 85, color: '#10b981' },
                    { label: 'ATT适配', score: 72, color: '#f59e0b' },
                    { label: '数据安全', score: 91, color: '#10b981' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>{s.label}</span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                        <div style={{ width: `${s.score}%`, height: '100%', background: s.color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: s.color, width: 22, textAlign: 'right' }}>{s.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GDPR状态卡 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                  <Globe size={14} color={FB_BLUE} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>GDPR 合规状态 · 欧洲市场</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { item: '数据处理协议 (DPA)', ok: true, note: 'Meta DPA已签署' },
                    { item: 'Cookie 同意管理', ok: true, note: 'CMP已部署' },
                    { item: '数据最小化原则', ok: true, note: '仅收集必要字段' },
                    { item: '被遗忘权响应', ok: true, note: '72h内响应机制' },
                    { item: '行为定向广告', ok: false, note: 'GDPR限制，已暂停' },
                    { item: '跨境数据传输', ok: false, note: 'SCCs审查中' },
                  ].map((g, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: g.ok ? 'rgba(52,211,153,0.05)' : 'rgba(248,113,113,0.05)', borderRadius: 7, border: `1px solid ${g.ok ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)'}` }}>
                      <span style={{ fontSize: '0.75rem', color: g.ok ? '#34d399' : '#f87171', flexShrink: 0, marginTop: 1 }}>{g.ok ? '✓' : '✗'}</span>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 2 }}>{g.item}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{g.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ATT影响分析 + CAPI配置 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

              {/* ATT影响分析 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Lock size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>iOS ATT 影响分析</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'ATT 弹窗显示率', value: '98.2%', color: '#10b981', note: '几乎全量iOS用户触达' },
                    { label: 'ATT 同意率', value: '34.2%', color: '#f59e0b', note: '低于行业均值38%' },
                    { label: 'IDFA 可用率', value: '34.2%', color: '#f59e0b', note: '仅同意用户可追踪' },
                    { label: 'IDFA 缺失率', value: '65.8%', color: '#f87171', note: '归因链路断裂' },
                    { label: 'CAPI 补偿后归因率', value: '+38%', color: '#34d399', note: '服务端信号补充效果' },
                    { label: '模型归因覆盖率', value: '78.4%', color: '#10b981', note: '包含概率归因模型' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 500 }}>{a.label}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{a.note}</div>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: a.color }}>{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CAPI配置状态 */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Zap size={14} color={FB_BLUE} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Conversions API (CAPI) 配置</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { event: 'Purchase', matched: 68.4, status: '正常', volume: '1,240次/日' },
                    { event: 'AddToCart', matched: 72.1, status: '正常', volume: '4,820次/日' },
                    { event: 'ViewContent', matched: 81.3, status: '良好', volume: '28,400次/日' },
                    { event: 'InitiateCheckout', matched: 65.8, status: '优化中', volume: '2,150次/日' },
                    { event: 'Lead', matched: 58.2, status: '待优化', volume: '380次/日' },
                  ].map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 7 }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#93c5fd', width: 96, flexShrink: 0 }}>{e.event}</span>
                      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                        <div style={{ width: `${e.matched}%`, height: '100%', background: e.matched >= 70 ? '#34d399' : e.matched >= 60 ? '#f59e0b' : '#f87171', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: e.matched >= 70 ? '#34d399' : e.matched >= 60 ? '#f59e0b' : '#f87171', width: 36, textAlign: 'right', flexShrink: 0 }}>{e.matched}%</span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', width: 60, textAlign: 'right', flexShrink: 0 }}>{e.volume}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(24,119,242,0.06)', borderRadius: 7, border: `1px solid rgba(24,119,242,0.15)` }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>优化建议：上传用户邮箱哈希值可将 Purchase 事件匹配率提升至 <span style={{ color: '#34d399', fontWeight: 600 }}>~78%</span>，预计归因转化量 +15%。</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
