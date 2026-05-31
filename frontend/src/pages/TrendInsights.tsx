import { useState } from 'react'
import {
  FlaskConical, TrendingUp, Search, AlertCircle, Sparkles,
  ArrowUp, ArrowDown, Minus, Music, Zap, Package, Target,
  BarChart3, ShoppingCart, Star, ChevronRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, ComposedChart, Bar, BarChart,
  CartesianGrid, Legend, Cell
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   趋势洞察中心 —— 美妆行业趋势监控 (玛丽黛佳)
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['成分趋势', '品类趋势', '社交热点', '选品推荐']

// ── 成分趋势数据 ──
const ingredients = [
  { name: '玻尿酸', searchVol: 285000, growth: 12, category: '保湿', sentiment: 88, platforms: { 小红书: 45, 抖音: 32, 百度: 23 }, ourProducts: 8, ourShare: 15 },
  { name: '烟酰胺', searchVol: 248000, growth: 28, category: '美白', sentiment: 85, platforms: { 小红书: 52, 抖音: 28, 百度: 20 }, ourProducts: 5, ourShare: 12 },
  { name: '视黄醇', searchVol: 192000, growth: 35, category: '抗衰', sentiment: 82, platforms: { 小红书: 48, 抖音: 30, 百度: 22 }, ourProducts: 3, ourShare: 8 },
  { name: '神经酰胺', searchVol: 156000, growth: 42, category: '修护', sentiment: 90, platforms: { 小红书: 55, 抖音: 25, 百度: 20 }, ourProducts: 4, ourShare: 10 },
  { name: '水杨酸', searchVol: 138000, growth: 18, category: '祛痘', sentiment: 78, platforms: { 小红书: 40, 抖音: 35, 百度: 25 }, ourProducts: 2, ourShare: 5 },
  { name: '虾青素', searchVol: 95000, growth: 65, category: '抗氧化', sentiment: 92, platforms: { 小红书: 58, 抖音: 22, 百度: 20 }, ourProducts: 1, ourShare: 3 },
  { name: '壬二酸', searchVol: 82000, growth: 55, category: '祛痘', sentiment: 86, platforms: { 小红书: 52, 抖音: 28, 百度: 20 }, ourProducts: 0, ourShare: 0 },
  { name: '胜肽', searchVol: 78000, growth: 48, category: '抗衰', sentiment: 88, platforms: { 小红书: 50, 抖音: 25, 百度: 25 }, ourProducts: 2, ourShare: 6 },
]

// 6-month search volume trend (mock)
const months = ['11月', '12月', '1月', '2月', '3月', '4月']
const ingredientTrend = months.map((m, i) => {
  const base: Record<string, string | number> = { month: m }
  ingredients.slice(0, 6).forEach(ing => {
    const factor = 1 + ing.growth / 100
    const progress = (i + 1) / 6
    base[ing.name] = Math.round(ing.searchVol * (0.6 + 0.4 * Math.pow(progress, factor > 1.3 ? 1.5 : 1)))
  })
  return base
})

const scatterData = ingredients.map(ing => ({
  name: ing.name,
  x: ing.searchVol,
  y: ing.growth,
  z: ing.sentiment,
  category: ing.category,
}))

// ── 品类趋势数据 ──
const categories = [
  { category: '唇釉/唇泥', monthGMV: 185000, growth: 22, seasonalPeak: '双11/情人节', ourShare: 8.2, topCompetitor: '完美日记', competitorShare: 12.5, trend: 'up' },
  { category: '粉底液/气垫', monthGMV: 328000, growth: 15, seasonalPeak: '38节/双11', ourShare: 3.5, topCompetitor: '花西子', competitorShare: 9.8, trend: 'up' },
  { category: '眼影盘', monthGMV: 123000, growth: 28, seasonalPeak: '开学季/双11', ourShare: 5.8, topCompetitor: 'COLORKEY', competitorShare: 8.2, trend: 'up' },
  { category: '卸妆产品', monthGMV: 89000, growth: 18, seasonalPeak: '夏季/双11', ourShare: 4.2, topCompetitor: '花西子', competitorShare: 7.5, trend: 'stable' },
  { category: '防晒', monthGMV: 256000, growth: 45, seasonalPeak: '4-9月', ourShare: 1.2, topCompetitor: '薇诺娜', competitorShare: 15.2, trend: 'up' },
  { category: '面膜', monthGMV: 152000, growth: 8, seasonalPeak: '双11/618', ourShare: 2.1, topCompetitor: '完美日记', competitorShare: 5.8, trend: 'down' },
  { category: '精华液', monthGMV: 295000, growth: 32, seasonalPeak: '全年', ourShare: 2.8, topCompetitor: '珀莱雅', competitorShare: 11.2, trend: 'up' },
  { category: '隔离/妆前', monthGMV: 68000, growth: 12, seasonalPeak: '春夏', ourShare: 6.5, topCompetitor: 'UNNY', competitorShare: 8.0, trend: 'stable' },
]

// Seasonal heatmap data: rows=categories, cols=months 1-12
const seasonalHeatmap: Record<string, number[]> = {
  '唇釉/唇泥':   [60, 85, 50, 45, 55, 70, 55, 50, 65, 75, 100, 60],
  '粉底液/气垫': [55, 50, 90, 60, 55, 60, 50, 55, 65, 70, 100, 55],
  '眼影盘':      [50, 45, 55, 50, 55, 55, 50, 55, 85, 65, 100, 55],
  '卸妆产品':    [45, 40, 50, 55, 60, 80, 90, 85, 65, 55, 75, 45],
  '防晒':        [30, 35, 50, 80, 95, 100, 100, 90, 70, 45, 40, 30],
  '面膜':        [55, 50, 55, 55, 55, 75, 55, 55, 55, 55, 100, 55],
  '精华液':      [70, 65, 70, 70, 70, 75, 70, 70, 70, 70, 85, 70],
  '隔离/妆前':   [50, 45, 65, 80, 85, 75, 60, 55, 55, 50, 55, 45],
}

// ── 社交热点数据 ──
const socialTrends = [
  { topic: '#多巴胺妆容', platform: '抖音', mentions: 2850000, growth: 180, sentiment: 92, relevance: 88, peakDate: '04/02', status: '爆发期' },
  { topic: '#纯欲风底妆', platform: '小红书', mentions: 1920000, growth: 120, sentiment: 88, relevance: 95, peakDate: '04/01', status: '上升期' },
  { topic: '#氛围感眼妆', platform: '抖音', mentions: 1650000, growth: 95, sentiment: 90, relevance: 82, peakDate: '03/28', status: '平台期' },
  { topic: '#夏日防晒攻略', platform: '小红书', mentions: 1280000, growth: 210, sentiment: 85, relevance: 90, peakDate: '04/04', status: '爆发期' },
  { topic: '#平替彩妆', platform: '快手', mentions: 980000, growth: 75, sentiment: 82, relevance: 78, peakDate: '03/25', status: '平台期' },
  { topic: '#成分党护肤', platform: '小红书', mentions: 850000, growth: 55, sentiment: 94, relevance: 92, peakDate: '03/30', status: '上升期' },
  { topic: '#妆容挑战赛', platform: '抖音', mentions: 3200000, growth: 320, sentiment: 86, relevance: 75, peakDate: '04/03', status: '爆发期' },
  { topic: '#素颜好物推荐', platform: '小红书', mentions: 720000, growth: 42, sentiment: 90, relevance: 85, peakDate: '03/20', status: '衰退期' },
]

const trendingBGM = [
  { bgm: '《如愿》remix', uses: 128000, growth: 250, beautyRelated: true },
  { bgm: '《星辰大海》', uses: 95000, growth: 180, beautyRelated: false },
  { bgm: '甜蜜暴击bgm', uses: 82000, growth: 320, beautyRelated: true },
]

// ── 选品推荐数据 ──
const recommendations = [
  { rank: 1, product: '唇釉丝绒新色#108', category: '唇妆', price: 129, margin: 62, trendScore: 95, socialBuzz: 28500, competitorGap: '完美日记无同类色号', stock: 15000, aiSuggestion: '趋势色号+高毛利+竞品空白, 建议主推', confidence: 96, channels: ['抖音直播', '小红书种草'] },
  { rank: 2, product: '神经酰胺精华液', category: '护肤', price: 268, margin: 58, trendScore: 92, socialBuzz: 42000, competitorGap: '珀莱雅有类似但价格更高', stock: 8500, aiSuggestion: '成分趋势飙升+价格优势, 建议测试投放', confidence: 91, channels: ['小红书种草', '抖音信息流'] },
  { rank: 3, product: '防晒霜SPF50+清爽版', category: '防晒', price: 158, margin: 52, trendScore: 98, socialBuzz: 85000, competitorGap: '薇诺娜主导但我们性价比更高', stock: 20000, aiSuggestion: '夏季刚需+搜索量爆发, 立即加大投放', confidence: 94, channels: ['抖音直播', '快手信息流'] },
  { rank: 4, product: '眼影盘夏日限定', category: '眼妆', price: 189, margin: 55, trendScore: 88, socialBuzz: 18500, competitorGap: 'COLORKEY新品上市但配色一般', stock: 12000, aiSuggestion: '限定款稀缺性+社交话题性高', confidence: 87, channels: ['小红书种草', '抖音挑战赛'] },
  { rank: 5, product: '卸妆水温和大瓶装', category: '卸妆', price: 89, margin: 65, trendScore: 75, socialBuzz: 12000, competitorGap: '品类竞争弱', stock: 25000, aiSuggestion: '高毛利引流品, 建议直播间用作福利款', confidence: 85, channels: ['抖音直播', '快手直播'] },
]

// ── 通用样式 ──
const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }
const BRAND = '#e8365d'
const COLORS = ['#e8365d', '#f97316', '#8b5cf6', '#06b6d4', '#22c55e', '#eab308', '#ec4899', '#6366f1']

// ── AI配置 ──
const trendAIConfigGroups: AIConfigGroup[] = [
  {
    title: '趋势预测',
    icon: <TrendingUp size={15} />,
    params: [
      createParam('prediction_window', '趋势预测窗口', 30, '天', '基于历史数据预测未来趋势的时间窗口', 45, 84, { min: 7, max: 90, step: 7 }),
      createParam('trend_sensitivity', '热点捕捉灵敏度', 0.7, '', '社交热点检测的敏感度, 越高越容易触发热点预警', 0.8, 86, { min: 0.3, max: 1.0, step: 0.1 }),
      createParam('min_signal', '最小信号强度', 500, '次/天', '成分/话题每日搜索量低于此值不纳入趋势分析', 300, 82, { min: 100, max: 2000, step: 100 }),
      createParam('seasonal_weight', '季节性权重', 0.4, '', '趋势分析中季节因子的权重', 0.5, 83, { min: 0.1, max: 0.8, step: 0.1 }),
    ],
  },
  {
    title: '选品推荐',
    icon: <Sparkles size={15} />,
    params: [
      createParam('auto_select_confidence', '自动选品置信度', 85, '%', 'AI选品推荐的最低置信度, 低于此值标记为待人工确认', 80, 88, { min: 60, max: 99, step: 5 }),
      createParam('margin_threshold', '毛利率门槛', 40, '%', '选品推荐中毛利率低于此值的产品降低优先级', 45, 85, { min: 20, max: 80, step: 5 }),
      createParam('inventory_factor', '库存因子权重', 0.3, '', '库存充足度在选品评分中的权重', 0.25, 81, { min: 0.1, max: 0.6, step: 0.05 }),
    ],
  },
]

const trendAILearningStatus: AILearningStatus = {
  modelVersion: 'v2.5.0-trend-beauty',
  lastTraining: '30分钟前',
  totalDataPoints: 1580000,
  avgConfidence: 86,
  autoAdjustCount24h: 38,
  learningRate: '0.003',
  nextTraining: '1.5小时后',
  improvementRate: '+6.2%',
}

// ── Helpers ──
function formatNum(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function growthBadge(g: number) {
  const color = g >= 40 ? '#ef4444' : g >= 20 ? '#f97316' : g >= 0 ? '#22c55e' : '#6b7280'
  return (
    <span style={{ color, fontWeight: 700, fontSize: '0.8rem' }}>
      {g > 0 ? '+' : ''}{g}%
    </span>
  )
}

function heatColor(intensity: number): string {
  if (intensity >= 90) return BRAND
  if (intensity >= 75) return '#f06280'
  if (intensity >= 60) return '#f5a0b4'
  if (intensity >= 45) return '#fcc8d5'
  return '#fde8ee'
}

function statusStyle(status: string): { color: string; bg: string; icon: React.ReactNode } {
  switch (status) {
    case '爆发期': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <Zap size={14} /> }
    case '上升期': return { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: <ArrowUp size={14} /> }
    case '平台期': return { color: '#eab308', bg: 'rgba(234,179,8,0.1)', icon: <Minus size={14} /> }
    case '衰退期': return { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: <ArrowDown size={14} /> }
    default: return { color: '#6b7280', bg: 'transparent', icon: null }
  }
}

function trendIcon(t: string) {
  if (t === 'up') return <ArrowUp size={14} color="#22c55e" />
  if (t === 'down') return <ArrowDown size={14} color="#ef4444" />
  return <Minus size={14} color="#eab308" />
}

// ── Custom Scatter tooltip ──
function ScatterTooltipContent({ active, payload }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div style={{ ...tooltipStyle, padding: '8px 12px' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>搜索量: {formatNum(d.x)}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>增长率: +{d.y}%</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>好感度: {d.z}</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  Component
// ══════════════════════════════════════════════════════════════

export default function TrendInsights() {
  const [activeTab, setActiveTab] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  useRegisterAIConfig(trendAIConfigGroups, trendAILearningStatus, '趋势洞察')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // ── Tab 1: 成分趋势 ──
  const renderIngredientTab = () => (
    <>
      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: '监控成分数', value: '48个', icon: <FlaskConical size={20} />, color: BRAND },
          { label: '本周飙升成分', value: '虾青素 +65%', icon: <TrendingUp size={20} />, color: '#f97316' },
          { label: '消费者关注TOP', value: '烟酰胺', icon: <Search size={20} />, color: '#8b5cf6' },
          { label: '趋势预警', value: '2个', icon: <AlertCircle size={20} />, color: '#ef4444' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${kpi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Line Chart: 6-month trends */}
        <div className="card">
          <div className="section-title">成分搜索量趋势 (近6个月)</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ingredientTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={11} tickFormatter={v => formatNum(v)} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatNum(v)} />
              <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
              {ingredients.slice(0, 6).map((ing, i) => (
                <Line key={ing.name} type="monotone" dataKey={ing.name} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter Chart: search vol vs growth */}
        <div className="card">
          <div className="section-title">成分热度矩阵 (搜索量 x 增长率)</div>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis type="number" dataKey="x" name="搜索量" stroke="#6b7280" fontSize={11} tickFormatter={v => formatNum(v)} />
              <YAxis type="number" dataKey="y" name="增长率%" stroke="#6b7280" fontSize={11} />
              <ZAxis type="number" dataKey="z" range={[80, 400]} name="好感度" />
              <Tooltip content={<ScatterTooltipContent />} />
              <Scatter data={scatterData} fill={BRAND}>
                {scatterData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ingredient Table */}
      <div className="card">
        <div className="section-title">成分趋势总览</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>成分名称</th>
                <th>功效分类</th>
                <th>搜索量</th>
                <th>增长率</th>
                <th>好感度</th>
                <th>小红书</th>
                <th>抖音</th>
                <th>百度</th>
                <th>我方产品</th>
                <th>市场份额</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map(ing => (
                <tr key={ing.name}>
                  <td style={{ fontWeight: 700 }}>{ing.name}</td>
                  <td>
                    <span style={{ background: `${BRAND}15`, color: BRAND, padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>
                      {ing.category}
                    </span>
                  </td>
                  <td>{formatNum(ing.searchVol)}</td>
                  <td>{growthBadge(ing.growth)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 36, height: 5, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden' }}>
                        <div style={{ width: `${ing.sentiment}%`, height: '100%', borderRadius: 3, background: ing.sentiment >= 90 ? '#22c55e' : ing.sentiment >= 80 ? '#60a5fa' : '#fbbf24' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{ing.sentiment}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>{ing.platforms.小红书}%</td>
                  <td style={{ fontSize: '0.75rem' }}>{ing.platforms.抖音}%</td>
                  <td style={{ fontSize: '0.75rem' }}>{ing.platforms.百度}%</td>
                  <td style={{ fontWeight: 600 }}>{ing.ourProducts}</td>
                  <td>
                    {ing.ourShare > 0
                      ? <span style={{ fontWeight: 600, color: ing.ourShare >= 10 ? '#22c55e' : '#f97316' }}>{ing.ourShare}%</span>
                      : <span style={{ color: '#ef4444', fontWeight: 600 }}>空白</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )

  // ── Tab 2: 品类趋势 ──
  const renderCategoryTab = () => (
    <>
      {/* ComposedChart: GMV bars + growth line */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">品类月GMV与增长率</div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={categories} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="category" stroke="#6b7280" fontSize={11} angle={-20} textAnchor="end" height={60} />
            <YAxis yAxisId="left" stroke="#6b7280" fontSize={11} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
            <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={11} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => name === '增长率' ? `${v}%` : `¥${formatNum(v)}`} />
            <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
            <Bar yAxisId="left" dataKey="monthGMV" name="月GMV(¥)" fill={BRAND} fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="growth" name="增长率" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Seasonal Heatmap */}
        <div className="card">
          <div className="section-title">品类季节性需求热力图</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>品类</th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} style={{ padding: '6px 4px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', minWidth: 32 }}>
                      {i + 1}月
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(seasonalHeatmap).map(([cat, vals]) => (
                  <tr key={cat}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border-light)' }}>{cat}</td>
                    {vals.map((v, i) => (
                      <td key={i} style={{ padding: 4, textAlign: 'center', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 4,
                          background: heatColor(v),
                          color: v >= 75 ? '#fff' : '#333',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 600, margin: '0 auto',
                        }}>
                          {v}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Detail Table */}
        <div className="card">
          <div className="section-title">品类竞争格局</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>品类</th>
                  <th>趋势</th>
                  <th>我方份额</th>
                  <th>头部竞品</th>
                  <th>竞品份额</th>
                  <th>旺季</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.category}>
                    <td style={{ fontWeight: 600 }}>{c.category}</td>
                    <td>{trendIcon(c.trend)}</td>
                    <td style={{ fontWeight: 600, color: c.ourShare >= 5 ? '#22c55e' : '#f97316' }}>{c.ourShare}%</td>
                    <td style={{ fontSize: '0.75rem' }}>{c.topCompetitor}</td>
                    <td style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>{c.competitorShare}%</td>
                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.seasonalPeak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )

  // ── Tab 3: 社交热点 ──
  const renderSocialTab = () => (
    <>
      {/* Social Trend Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14, marginBottom: 20 }}>
        {socialTrends.map(t => {
          const s = statusStyle(t.status)
          return (
            <div key={t.topic} className="card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              {/* Status pulse for 爆发期 */}
              {t.status === '爆发期' && (
                <div style={{
                  position: 'absolute', top: 12, right: 12, width: 10, height: 10,
                  borderRadius: '50%', background: '#ef4444',
                  boxShadow: '0 0 0 3px rgba(239,68,68,0.3)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{t.topic}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {t.platform} / 峰值: {t.peakDate}
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
                  color: s.color, background: s.bg,
                }}>
                  {s.icon} {t.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: '提及量', value: formatNum(t.mentions) },
                  { label: '增长', value: `+${t.growth}%` },
                  { label: '好感度', value: `${t.sentiment}` },
                  { label: '相关度', value: `${t.relevance}%` },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.label}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Relevance bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                  <span>品牌相关度</span>
                  <span style={{ color: t.relevance >= 90 ? '#22c55e' : t.relevance >= 80 ? '#60a5fa' : '#fbbf24', fontWeight: 600 }}>{t.relevance}%</span>
                </div>
                <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--border-light)', overflow: 'hidden' }}>
                  <div style={{ width: `${t.relevance}%`, height: '100%', borderRadius: 2, background: t.relevance >= 90 ? '#22c55e' : t.relevance >= 80 ? '#60a5fa' : '#fbbf24' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Trending BGM */}
      <div className="card">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Music size={16} color={BRAND} /> 热门BGM趋势
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {trendingBGM.map(b => (
            <div key={b.bgm} style={{
              flex: '1 1 240px', maxWidth: 320,
              background: 'var(--bg-primary)', borderRadius: 10, padding: '14px 16px',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{b.bgm}</span>
                {b.beautyRelated && (
                  <span style={{ fontSize: '0.62rem', background: `${BRAND}18`, color: BRAND, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                    美妆相关
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>使用量: <strong style={{ color: 'var(--text-primary)' }}>{formatNum(b.uses)}</strong></span>
                <span>增长: <strong style={{ color: '#22c55e' }}>+{b.growth}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </>
  )

  // ── Tab 4: 选品推荐 ──
  const renderRecommendationTab = () => (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {recommendations.map(r => (
          <div key={r.rank} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Rank Badge */}
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: r.rank <= 3 ? `linear-gradient(135deg, ${BRAND}, #f97316)` : 'var(--bg-primary)',
                color: r.rank <= 3 ? '#fff' : 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '1.1rem',
              }}>
                {r.rank}
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-primary)' }}>{r.product}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {r.category} / ¥{r.price} / 毛利 {r.margin}%
                    </div>
                  </div>
                  {/* Confidence Meter */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>AI置信度</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${r.confidence}%`, height: '100%', borderRadius: 3,
                          background: r.confidence >= 90 ? '#22c55e' : r.confidence >= 85 ? '#60a5fa' : '#fbbf24',
                        }} />
                      </div>
                      <span style={{
                        fontWeight: 800, fontSize: '0.88rem',
                        color: r.confidence >= 90 ? '#22c55e' : r.confidence >= 85 ? '#60a5fa' : '#fbbf24',
                      }}>
                        {r.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '12px 0', background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 14px' }}>
                  {[
                    { label: '趋势评分', value: r.trendScore, icon: <TrendingUp size={13} color={BRAND} /> },
                    { label: '社交热度', value: formatNum(r.socialBuzz), icon: <BarChart3 size={13} color="#8b5cf6" /> },
                    { label: '库存', value: formatNum(r.stock), icon: <Package size={13} color="#06b6d4" /> },
                    { label: '毛利率', value: `${r.margin}%`, icon: <Target size={13} color="#22c55e" /> },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {m.icon}
                      <div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{m.label}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{m.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Reasoning */}
                <div style={{ background: `${BRAND}08`, border: `1px solid ${BRAND}20`, borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Sparkles size={13} color={BRAND} />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: BRAND }}>AI分析</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{r.aiSuggestion}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    竞品差异: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.competitorGap}</span>
                  </div>
                </div>

                {/* Channels + Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {r.channels.map(ch => (
                      <span key={ch} style={{
                        padding: '3px 10px', borderRadius: 12, fontSize: '0.68rem', fontWeight: 600,
                        background: ch.includes('小红书') ? '#ff224418' : ch.includes('抖音') ? '#00000012' : '#f9731618',
                        color: ch.includes('小红书') ? '#ff2244' : ch.includes('抖音') ? '#333' : '#f97316',
                      }}>
                        {ch}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: `1px solid ${BRAND}`,
                        background: 'transparent', color: BRAND, fontSize: '0.72rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                      onClick={() => showToast('✅ 已推送至直播排品计划，主播将在下次直播中展示')}
                    >
                      <ShoppingCart size={13} /> 推送到直播排品
                    </button>
                    <button
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: BRAND, color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                      onClick={() => showToast('✅ 已推送至内容生产队列，脚本工坊将优先处理')}
                    >
                      <Star size={13} /> 推送到内容生产
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <TrendingUp size={22} color={BRAND} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>趋势洞察中心</h2>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 4 }}>美妆行业趋势 & AI选品</span>
      </div>

      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="TrendRadar-TS" color="#ec4899" />
        <ModelBadge name="UGCQuality-Ranker" color="#ec4899" />
        <ModelBadge name="SentimentAnalyzer" color="#8b5cf6" />
        <ModelBadge name="CompetitorIntel-NLP" color="#8b5cf6" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border-light)' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '10px 22px', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === i ? 800 : 500,
              fontSize: '0.88rem',
              color: activeTab === i ? BRAND : 'var(--text-muted)',
              background: 'transparent',
              borderBottom: activeTab === i ? `2.5px solid ${BRAND}` : '2.5px solid transparent',
              marginBottom: -2,
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && renderIngredientTab()}
      {activeTab === 1 && renderCategoryTab()}
      {activeTab === 2 && renderSocialTab()}
      {activeTab === 3 && renderRecommendationTab()}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,30,40,0.92)', color: '#fff', padding: '10px 24px',
          borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}
