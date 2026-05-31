import { useState } from 'react'
import {
  Radio, ShoppingBag, Users, TrendingUp, Eye, Clock, Zap,
  Star, Package, BarChart3, Award, Target, ChevronRight
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   直播数据中心 —— 玛丽黛佳 (Marie Dalgar) 直播电商数据分析平台
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['实时直播监控', '🌍 国际直播', '直播复盘', '主播绩效', '直播选品']

const BRAND_COLOR = '#e8365d'

// ── Tab 1: 实时直播监控 ──

const liveRooms = [
  { roomId: 'LIVE-001', host: '彩妆师小雅', platform: '抖音', status: '直播中', startTime: '13:00', duration: '1h32m', currentViewers: 8542, peakViewers: 12847, gmv: 856000, orders: 1285, convRate: 4.8, interactionRate: 12.5, avgStayTime: '4m28s', currentProduct: '唇釉丝绒#105', adSpend: 125000, liveROI: 6.85 },
  { roomId: 'LIVE-002', host: '护肤顾问Lucy', platform: '快手', status: '直播中', startTime: '14:00', duration: '32m', currentViewers: 3218, peakViewers: 4520, gmv: 285000, orders: 428, convRate: 3.2, interactionRate: 8.8, avgStayTime: '3m15s', currentProduct: '精华液修护版', adSpend: 45000, liveROI: 6.33 },
  { roomId: 'LIVE-003', host: '底妆达人小米', platform: '抖音', status: '预热中', startTime: '15:00', duration: '-', currentViewers: 856, peakViewers: 856, gmv: 0, orders: 0, convRate: 0, interactionRate: 15.2, avgStayTime: '1m20s', currentProduct: '预热中...', adSpend: 8000, liveROI: 0 },
  { roomId: 'LIVE-004', host: '品牌直播间', platform: '天猫直播', status: '已结束', startTime: '10:00', duration: '3h', currentViewers: 0, peakViewers: 9200, gmv: 425000, orders: 892, convRate: 5.1, interactionRate: 10.2, avgStayTime: '5m42s', currentProduct: '-', adSpend: 85000, liveROI: 5.0 },
]

const realtimeTimeSeries = [
  { time: '13:00', viewers: 1200, gmv: 0 },
  { time: '13:10', viewers: 3500, gmv: 85000 },
  { time: '13:20', viewers: 5800, gmv: 195000 },
  { time: '13:30', viewers: 8200, gmv: 320000 },
  { time: '13:40', viewers: 12847, gmv: 485000 },
  { time: '13:50', viewers: 10500, gmv: 625000 },
  { time: '14:00', viewers: 9800, gmv: 728000 },
  { time: '14:10', viewers: 8542, gmv: 856000 },
]

const productTimeline = [
  { product: '唇釉丝绒#105', showTime: '13:05-13:18', clicks: 3200, convRate: 12.8, orders: 410, gmv: 118000 },
  { product: '眼影盘星空色', showTime: '13:20-13:35', clicks: 2800, convRate: 10.5, orders: 294, gmv: 98000 },
  { product: '粉底液持妆版', showTime: '13:38-13:52', clicks: 2100, convRate: 9.2, orders: 193, gmv: 85000 },
  { product: '精华液修护版', showTime: '13:55-14:10', clicks: 1800, convRate: 8.8, orders: 158, gmv: 68000 },
]

// ── Room-specific real-time metrics ──
const roomRealtimeMetrics: Record<string, { label: string; value: string; trend: string; color: string }[]> = {
  'LIVE-001': [
    { label: '当前UV价值', value: '¥100.2', trend: '+12.5%', color: '#22c55e' },
    { label: '弹幕密度', value: '285条/min', trend: '+8.2%', color: '#3b82f6' },
    { label: '加购率', value: '8.5%', trend: '+1.2%', color: BRAND_COLOR },
    { label: '退出率', value: '3.2%', trend: '-0.5%', color: '#22c55e' },
  ],
  'LIVE-002': [
    { label: '当前UV价值', value: '¥88.5', trend: '+6.8%', color: '#22c55e' },
    { label: '弹幕密度', value: '142条/min', trend: '+3.5%', color: '#3b82f6' },
    { label: '加购率', value: '6.2%', trend: '+0.8%', color: BRAND_COLOR },
    { label: '退出率', value: '4.5%', trend: '+0.3%', color: '#f59e0b' },
  ],
  'LIVE-003': [
    { label: '当前UV价值', value: '-', trend: '-', color: 'var(--text-muted)' },
    { label: '弹幕密度', value: '58条/min', trend: '-', color: '#3b82f6' },
    { label: '加购率', value: '-', trend: '-', color: 'var(--text-muted)' },
    { label: '退出率', value: '-', trend: '-', color: 'var(--text-muted)' },
  ],
  'LIVE-004': [
    { label: '当前UV价值', value: '¥46.2', trend: '-', color: 'var(--text-muted)' },
    { label: '弹幕密度', value: '-', trend: '-', color: 'var(--text-muted)' },
    { label: '加购率', value: '7.8%', trend: '-', color: 'var(--text-muted)' },
    { label: '退出率', value: '2.8%', trend: '-', color: 'var(--text-muted)' },
  ],
}

// ── Tab 2: 直播复盘 ──

const historicalSessions = [
  { id: 'S-0405-01', date: '04/05', host: '品牌直播间', platform: '天猫直播', duration: '3h', totalGMV: 425000, peakViewers: 9200, avgViewers: 5800, totalOrders: 892, productsShown: 12, topProduct: '唇釉丝绒礼盒', topProductGMV: '¥8.5万', convRate: 5.1, followerGain: 1250, adSpend: 85000, roi: 5.0 },
  { id: 'S-0404-01', date: '04/04', host: '彩妆师小雅', platform: '抖音', duration: '2h', totalGMV: 680000, peakViewers: 15200, avgViewers: 8900, totalOrders: 1580, productsShown: 8, topProduct: '眼影盘星空色', topProductGMV: '¥12.8万', convRate: 5.8, followerGain: 2800, adSpend: 120000, roi: 5.67 },
  { id: 'S-0404-02', date: '04/04', host: '护肤顾问Lucy', platform: '快手', duration: '1.5h', totalGMV: 320000, peakViewers: 6800, avgViewers: 4200, totalOrders: 685, productsShown: 6, topProduct: '卸妆水温和版', topProductGMV: '¥5.2万', convRate: 4.2, followerGain: 950, adSpend: 55000, roi: 5.82 },
  { id: 'S-0403-01', date: '04/03', host: '底妆达人小米', platform: '抖音', duration: '2.5h', totalGMV: 520000, peakViewers: 11500, avgViewers: 7200, totalOrders: 1120, productsShown: 10, topProduct: '粉底液持妆版', topProductGMV: '¥9.8万', convRate: 4.5, followerGain: 1800, adSpend: 95000, roi: 5.47 },
  { id: 'S-0402-01', date: '04/02', host: '彩妆师小雅', platform: '抖音', duration: '2h', totalGMV: 580000, peakViewers: 13800, avgViewers: 8200, totalOrders: 1350, productsShown: 8, topProduct: '唇釉丝绒#105', topProductGMV: '¥11.2万', convRate: 5.5, followerGain: 2200, adSpend: 110000, roi: 5.27 },
]

const sessionProductDetails: Record<string, { product: string; showTime: string; clicks: number; orders: number; gmv: number; convRate: number }[]> = {
  'S-0405-01': [
    { product: '唇釉丝绒礼盒', showTime: '10:15-10:35', clicks: 2200, orders: 285, gmv: 85000, convRate: 13.0 },
    { product: '粉底液持妆版', showTime: '10:38-10:55', clicks: 1800, orders: 195, gmv: 68000, convRate: 10.8 },
    { product: '眼线笔防水款', showTime: '11:00-11:18', clicks: 1500, orders: 142, gmv: 42600, convRate: 9.5 },
    { product: '散粉定妆版', showTime: '11:22-11:40', clicks: 1200, orders: 108, gmv: 32400, convRate: 9.0 },
  ],
  'S-0404-01': [
    { product: '唇釉丝绒#105', showTime: '13:15-13:28', clicks: 2850, orders: 385, gmv: 112000, convRate: 13.5 },
    { product: '眼影盘星空色', showTime: '13:30-13:45', clicks: 2100, orders: 280, gmv: 98000, convRate: 13.3 },
    { product: '粉底液持妆版', showTime: '13:48-14:02', clicks: 1800, orders: 195, gmv: 85500, convRate: 10.8 },
    { product: '腮红蜜桃色', showTime: '14:05-14:18', clicks: 1500, orders: 168, gmv: 50400, convRate: 11.2 },
  ],
  'S-0404-02': [
    { product: '卸妆水温和版', showTime: '19:00-19:20', clicks: 1800, orders: 210, gmv: 52000, convRate: 11.7 },
    { product: '精华液修护版', showTime: '19:25-19:42', clicks: 1500, orders: 165, gmv: 88000, convRate: 11.0 },
    { product: '面膜补水套装', showTime: '19:45-20:00', clicks: 1200, orders: 128, gmv: 38400, convRate: 10.7 },
  ],
  'S-0403-01': [
    { product: '粉底液持妆版', showTime: '14:00-14:22', clicks: 2500, orders: 320, gmv: 98000, convRate: 12.8 },
    { product: '遮瑕液高覆盖', showTime: '14:25-14:42', clicks: 1800, orders: 195, gmv: 58500, convRate: 10.8 },
    { product: '散粉控油版', showTime: '14:45-15:02', clicks: 1500, orders: 145, gmv: 43500, convRate: 9.7 },
  ],
  'S-0402-01': [
    { product: '唇釉丝绒#105', showTime: '20:00-20:18', clicks: 2800, orders: 365, gmv: 112000, convRate: 13.0 },
    { product: '眼影盘日落色', showTime: '20:22-20:38', clicks: 2100, orders: 258, gmv: 86000, convRate: 12.3 },
    { product: '眉笔自然款', showTime: '20:42-20:58', clicks: 1600, orders: 185, gmv: 37000, convRate: 11.6 },
  ],
}

// ── Tab 3: 主播绩效 ──

const hostPerformance = [
  { name: '彩妆师小雅', sessions30d: 22, totalGMV: '¥1,280万', avgGMV: '¥58.2万', avgViewers: 9500, avgConvRate: 5.5, avgStayTime: '4m35s', followerGrowth: '+4.8万', topCategory: '彩妆', rating: 4.8 },
  { name: '护肤顾问Lucy', sessions30d: 18, totalGMV: '¥620万', avgGMV: '¥34.4万', avgViewers: 4800, avgConvRate: 4.2, avgStayTime: '3m28s', followerGrowth: '+2.1万', topCategory: '护肤', rating: 4.5 },
  { name: '底妆达人小米', sessions30d: 15, totalGMV: '¥850万', avgGMV: '¥56.7万', avgViewers: 7800, avgConvRate: 4.8, avgStayTime: '3m55s', followerGrowth: '+3.5万', topCategory: '底妆', rating: 4.6 },
  { name: '品牌直播间', sessions30d: 28, totalGMV: '¥980万', avgGMV: '¥35.0万', avgViewers: 5200, avgConvRate: 4.5, avgStayTime: '5m10s', followerGrowth: '+2.8万', topCategory: '全品类', rating: 4.3 },
]

const hostRadarData = [
  { dimension: 'GMV能力', 小雅: 95, Lucy: 65, 小米: 88 },
  { dimension: '转化率', 小雅: 92, Lucy: 72, 小米: 80 },
  { dimension: '互动率', 小雅: 85, Lucy: 78, 小米: 75 },
  { dimension: '涨粉力', 小雅: 90, Lucy: 60, 小米: 78 },
  { dimension: '时长稳定性', 小雅: 80, Lucy: 85, 小米: 72 },
  { dimension: '选品能力', 小雅: 88, Lucy: 82, 小米: 85 },
]

const hostGMVTrend = [
  { week: 'W1', 小雅: 285, Lucy: 145, 小米: 198, 品牌: 225 },
  { week: 'W2', 小雅: 320, Lucy: 158, 小米: 215, 品牌: 248 },
  { week: 'W3', 小雅: 298, Lucy: 162, 小米: 228, 品牌: 235 },
  { week: 'W4', 小雅: 377, Lucy: 155, 小米: 209, 品牌: 272 },
]

// ── Tab 4: 直播选品 ──

const productRecommendations = [
  { rank: 1, product: '唇釉丝绒新色#108', category: '唇妆', price: '¥129', margin: 62, trendScore: 95, histConvRate: 12.8, stock: 15000, recommendation: '热门趋势色+高毛利, 建议作为主推品', confidence: 94 },
  { rank: 2, product: '精华液修护升级版', category: '护肤', price: '¥268', margin: 58, trendScore: 88, histConvRate: 8.5, stock: 8500, recommendation: '成分趋势(神经酰胺)上升, 复购率高', confidence: 91 },
  { rank: 3, product: '眼影盘夏日限定', category: '眼妆', price: '¥189', margin: 55, trendScore: 92, histConvRate: 10.2, stock: 12000, recommendation: '季节性新品, 社交热度高', confidence: 89 },
  { rank: 4, product: '防晒霜SPF50+', category: '防晒', price: '¥158', margin: 52, trendScore: 98, histConvRate: 9.8, stock: 20000, recommendation: '夏季刚需品, 搜索量环比+45%', confidence: 92 },
  { rank: 5, product: '卸妆水温和大瓶装', category: '卸妆', price: '¥89', margin: 65, trendScore: 75, histConvRate: 15.2, stock: 25000, recommendation: '高转化引流品, 建议限时特价', confidence: 87 },
]

// ── AI Config ──

const livestreamAIConfigGroups: AIConfigGroup[] = [
  {
    title: '直播投流策略',
    icon: <Radio size={15} />,
    params: [
      createParam('realtime_bid_adjust', '实时出价调整幅度', 20, '%', '直播期间AI根据在线人数和转化数据实时调整广告出价的最大幅度', 25, 88, { min: 5, max: 50, step: 5, learningDataPoints: 65400 }),
      createParam('viewer_threshold', '投流加速触发人数', 500, '人', '在线人数超过此阈值时AI自动加大投流预算', 800, 85, { min: 100, max: 5000, step: 100 }),
      createParam('gmv_velocity', 'GMV时速目标', 50000, '¥/h', 'AI以此目标调控投流节奏, 低于目标时自动提升出价', 80000, 82, { min: 10000, max: 200000, step: 10000 }),
      createParam('cooldown', '投流冷却期', 15, '分钟', '两次大幅调价之间的最短间隔, 避免频繁波动', 10, 86, { min: 5, max: 60, step: 5 }),
    ],
  },
  {
    title: '商品排序优化',
    icon: <ShoppingBag size={15} />,
    params: [
      createParam('rotation_interval', '商品轮换间隔', 8, '分钟', '直播间商品展示轮换的建议间隔', 10, 83, { min: 3, max: 20, step: 1 }),
      createParam('flash_trigger', '闪购触发人数', 2000, '人', '在线人数达到此值时AI建议发起闪购活动', 3000, 80, { min: 500, max: 10000, step: 500 }),
      createParam('price_sensitivity', '价格敏感度', 0.6, '', '商品排序中价格因子权重, 越高则越倾向推荐低价引流品', 0.5, 84, { min: 0.1, max: 1.0, step: 0.1 }),
    ],
  },
]

const livestreamAILearningStatus: AILearningStatus = {
  modelVersion: 'v3.0.0-livestream',
  lastTraining: '30分钟前',
  totalDataPoints: 820000,
  avgConfidence: 87,
  autoAdjustCount24h: 156,
  learningRate: '0.003',
  nextTraining: '1小时后',
  improvementRate: '+12.3%',
}

// ── Shared styles ──

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)', borderRadius: 12, padding: 20,
  border: '1px solid var(--border-light)',
}

const statusColor = (s: string) =>
  s === '直播中' ? '#22c55e' : s === '预热中' ? '#eab308' : '#9ca3af'

const statusBg = (s: string) =>
  s === '直播中' ? 'rgba(34,197,94,0.12)' : s === '预热中' ? 'rgba(234,179,8,0.12)' : 'rgba(156,163,175,0.12)'

const formatGMV = (v: number) => {
  if (v >= 10000) return `¥${(v / 10000).toFixed(1)}万`
  return `¥${v.toLocaleString()}`
}

// ── Component ──

export default function LivestreamHub() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState('LIVE-001')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set())

  useRegisterAIConfig(livestreamAIConfigGroups, livestreamAILearningStatus, '直播数据中心')

  const kpiCards = [
    { label: '今日直播场次', value: '8场', icon: Radio, color: BRAND_COLOR },
    { label: '累计GMV', value: '¥128.5万', icon: ShoppingBag, color: '#22c55e' },
    { label: '在线峰值', value: '12,847人', icon: Users, color: '#3b82f6' },
    { label: '平均转化率', value: '4.8%', icon: TrendingUp, color: '#f59e0b' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="LiveGMV-LSTM" color="#e8365d" />
        <ModelBadge name="LiveEngagement-Predictor" color="#e8365d" />
        <ModelBadge name="VideoCompletion-Predictor" color="#ec4899" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        <ModelBadge name="BidOptimizer-DQN" color="#e8365d" />
      </div>

      {/* ══ Tab Bar ══ */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 10, padding: 4, border: '1px solid var(--border-light)' }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: activeTab === i ? 700 : 500,
            background: activeTab === i ? BRAND_COLOR : 'transparent',
            color: activeTab === i ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}>{tab}</button>
        ))}
      </div>

      {/* ══════════════ Tab 1: 实时直播监控 ══════════════ */}
      {activeTab === 0 && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {kpiCards.map(kpi => {
              const Icon = kpi.icon
              return (
                <div key={kpi.label} className="card" style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${kpi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={kpi.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{kpi.label}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live Room List */}
          <div className="card" style={cardStyle}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>直播间实时状态</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {liveRooms.map(room => (
                <div key={room.roomId} onClick={() => setSelectedRoom(room.roomId)} style={{
                  display: 'grid', gridTemplateColumns: '120px 100px 80px 1fr 100px 100px 100px 80px',
                  alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10,
                  background: selectedRoom === room.roomId ? `${BRAND_COLOR}0a` : 'var(--bg-primary)',
                  border: selectedRoom === room.roomId ? `1px solid ${BRAND_COLOR}40` : '1px solid var(--border-light)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{room.host}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{room.roomId}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{room.platform}</div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    color: statusColor(room.status), background: statusBg(room.status),
                    display: 'inline-block', textAlign: 'center',
                  }}>{room.status}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {room.currentProduct}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{room.currentViewers.toLocaleString()}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>在线</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#22c55e' }}>{formatGMV(room.gmv)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>GMV</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: BRAND_COLOR }}>{room.convRate}%</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>转化</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6' }}>{room.liveROI}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ROI</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Real-time Metrics */}
          {roomRealtimeMetrics[selectedRoom] && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {roomRealtimeMetrics[selectedRoom].map(m => (
                <div key={m.label} className="card" style={{ ...cardStyle, padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</span>
                    {m.trend !== '-' && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600,
                        color: m.trend.startsWith('+') ? '#22c55e' : m.trend.startsWith('-') ? (m.label === '退出率' ? '#22c55e' : '#ef4444') : 'var(--text-muted)',
                      }}>{m.trend}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real-time Dual-Axis Chart */}
          <div className="card" style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                实时数据趋势 — {liveRooms.find(r => r.roomId === selectedRoom)?.host || '-'}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 3, borderRadius: 2, background: '#3b82f6', display: 'inline-block' }} /> 在线人数
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 3, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} /> 累计GMV (¥)
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={realtimeTimeSeries}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#3b82f6" tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#22c55e" tickFormatter={v => `¥${(v / 10000).toFixed(0)}万`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => {
                  if (name === 'viewers') return [value.toLocaleString(), '在线人数']
                  return [formatGMV(value), '累计GMV']
                }} />
                <Line yAxisId="left" type="monotone" dataKey="viewers" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="gmv" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Product Timeline Cards */}
          <div className="card" style={cardStyle}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>商品展示时间线</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {productTimeline.map((p, i) => (
                <div key={i} style={{
                  padding: 14, borderRadius: 10, background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: BRAND_COLOR, marginBottom: 6 }}>{p.product}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <Clock size={12} /> {p.showTime}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>点击 <strong style={{ color: 'var(--text-primary)' }}>{p.clicks.toLocaleString()}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>转化 <strong style={{ color: '#22c55e' }}>{p.convRate}%</strong></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>下单 <strong style={{ color: '#3b82f6' }}>{p.orders}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>GMV <strong style={{ color: '#22c55e' }}>{formatGMV(p.gmv)}</strong></span>
                  </div>
                  {/* Mini progress bar showing relative GMV */}
                  <div style={{ marginTop: 8, height: 3, borderRadius: 2, background: 'var(--border-light)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: BRAND_COLOR, width: `${(p.gmv / 118000) * 100}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ══════════════ Tab 2: 🌍 国际直播 ══════════════ */}
      {activeTab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 国际直播总览 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: '国际直播场次(今日)', value: '3场', delta: '同步进行', color: '#0ea5e9' },
              { label: '国际直播GMV', value: '$8.6万', delta: '+34.2% vs昨日', color: '#22c55e' },
              { label: '海外观众峰值', value: '24,800', delta: 'JP+US+SEA', color: '#8b5cf6' },
              { label: '综合直播ROAS', value: '4.2x', delta: '超目标+0.7x', color: '#f59e0b' },
            ].map(k => (
              <div key={k.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.delta}</div>
              </div>
            ))}
          </div>

          {/* 国际直播间实时状态 */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>🌍 国际直播间实时监控</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { id: 'INTL-001', host: 'BeautyCreator JP · 山田あかり', platform: 'TikTok Live 🇯🇵', status: '直播中', viewers: 12840, gmv: '$3.2万', adSpend: '$4,200', roi: 7.6, product: '唇釉丝绒#105 JP限定色', lang: '日语', startTime: '13:00 JST', color: '#8b5cf6' },
                { id: 'INTL-002', host: 'MarieD Official US · Sarah K.', platform: 'TikTok Live 🇺🇸', status: '直播中', viewers: 8920, gmv: '$3.8万', adSpend: '$6,800', roi: 5.6, product: 'Velvet Lip Glaze · Berry Rose', lang: '英语', startTime: '21:00 PT', color: '#0ea5e9' },
                { id: 'INTL-003', host: 'KOL合作 · BeautyMuse SG', platform: 'TikTok Live 🇸🇬', status: '直播中', viewers: 3040, gmv: '$1.6万', adSpend: '$2,100', roi: 7.6, product: 'Eye Shadow Palette · Star Galaxy', lang: '英/中', startTime: '20:00 SGT', color: '#06b6d4' },
                { id: 'INTL-004', host: 'MarieD YouTube · Official', platform: 'YouTube Live 🌍', status: '预热中', viewers: 1240, gmv: '-', adSpend: '$1,500', roi: 0, product: '新品发布 · 即将开始', lang: '英语', startTime: '19:00 GMT', color: '#ef4444' },
              ].map(room => (
                <div key={room.id} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${room.color}28`, background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{room.host}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{room.platform} · {room.lang} · 开播 {room.startTime}</div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 700, background: room.status === '直播中' ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)', color: room.status === '直播中' ? '#22c55e' : '#fbbf24' }}>
                      {room.status === '直播中' && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 4, verticalAlign: 'middle' }} />}
                      {room.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                    {[
                      { label: '观众数', value: room.viewers.toLocaleString(), color: room.color },
                      { label: 'GMV', value: room.gmv, color: '#22c55e' },
                      { label: '广告消耗', value: room.adSpend, color: '#f59e0b' },
                      { label: 'ROI', value: room.roi > 0 ? `${room.roi}x` : '-', color: room.roi >= 5 ? '#22c55e' : room.roi > 0 ? '#f59e0b' : 'var(--text-muted)' },
                      { label: '在售商品', value: room.product, color: 'var(--text-secondary)' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 7, padding: '6px 8px' }}>
                        <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: m.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 国际直播 AI 实时建议 */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>🤖 AI国际直播实时建议</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { time: '14:28', platform: 'TikTok JP', color: '#8b5cf6', msg: 'INTL-001弹幕热词"#105好看"激增，AI建议立即触发专属优惠券推送，预计转化提升+18%', confidence: 92 },
                { time: '14:21', platform: 'TikTok US', color: '#0ea5e9', msg: 'INTL-002在线人数8,920超预测9.2%，AI自动加大引流投放+$800，维持峰值热度', confidence: 88 },
                { time: '14:15', platform: 'YouTube', color: '#ef4444', msg: 'INTL-004预热观看量1,240，建议预热期追加Google广告引流，目标首播观众5,000+', confidence: 82 },
              ].map((tip, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${tip.color}25`, background: `${tip.color}08`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0, marginTop: 2 }}>{tip.time}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: tip.color, flexShrink: 0, marginTop: 2 }}>{tip.platform}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{tip.msg}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#22c55e', flexShrink: 0 }}>置信度 {tip.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ Tab 3: 直播复盘 ══════════════ */}
      {activeTab === 2 && (
        <>
          {/* Summary Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { label: '近7日场次', value: '18场', color: BRAND_COLOR },
              { label: '近7日GMV', value: '¥252.5万', color: '#22c55e' },
              { label: '平均ROI', value: '5.45', color: '#3b82f6' },
              { label: '总涨粉', value: '9,000', color: '#f59e0b' },
              { label: '平均转化率', value: '5.0%', color: BRAND_COLOR },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ ...cardStyle, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={cardStyle}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>历史直播场次</div>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '80px 100px 80px 60px 90px 80px 80px 90px 80px 70px 60px',
              gap: 8, padding: '8px 12px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-light)', marginBottom: 6,
            }}>
              <div>场次ID</div><div>主播</div><div>平台</div><div>时长</div><div>GMV</div>
              <div>峰值观众</div><div>订单数</div><div>王牌商品</div><div>转化率</div><div>ROI</div><div></div>
            </div>
            {historicalSessions.map(s => (
              <div key={s.id} onClick={() => setSelectedSession(selectedSession === s.id ? null : s.id)} style={{
                display: 'grid', gridTemplateColumns: '80px 100px 80px 60px 90px 80px 80px 90px 80px 70px 60px',
                gap: 8, padding: '10px 12px', fontSize: '0.75rem', borderRadius: 8, cursor: 'pointer',
                background: selectedSession === s.id ? `${BRAND_COLOR}08` : 'transparent',
                border: selectedSession === s.id ? `1px solid ${BRAND_COLOR}30` : '1px solid transparent',
                transition: 'all 0.15s', alignItems: 'center',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.id}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{s.host}</div>
                <div style={{ color: 'var(--text-muted)' }}>{s.platform}</div>
                <div style={{ color: 'var(--text-muted)' }}>{s.duration}</div>
                <div style={{ fontWeight: 700, color: '#22c55e' }}>{formatGMV(s.totalGMV)}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{s.peakViewers.toLocaleString()}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{s.totalOrders.toLocaleString()}</div>
                <div style={{ color: BRAND_COLOR, fontWeight: 600, fontSize: '0.7rem' }}>{s.topProduct}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.convRate}%</div>
                <div style={{ fontWeight: 700, color: s.roi >= 5.5 ? '#22c55e' : '#f59e0b' }}>{s.roi}</div>
                <div style={{ textAlign: 'right' }}>
                  <ChevronRight size={14} color="var(--text-muted)" style={{ transform: selectedSession === s.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Session Detail Panel */}
          {selectedSession && sessionProductDetails[selectedSession] && (
            <div className="card" style={{ ...cardStyle, borderLeft: `3px solid ${BRAND_COLOR}` }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                商品明细 — {selectedSession}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                {historicalSessions.find(s => s.id === selectedSession)?.host} · {historicalSessions.find(s => s.id === selectedSession)?.platform}
              </div>

              {/* Product header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '140px 110px 80px 80px 90px 80px',
                gap: 8, padding: '6px 10px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-light)', marginBottom: 6,
              }}>
                <div>商品</div><div>展示时段</div><div>点击数</div><div>下单数</div><div>GMV</div><div>转化率</div>
              </div>
              {sessionProductDetails[selectedSession].map((p, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '140px 110px 80px 80px 90px 80px',
                  gap: 8, padding: '10px 10px', fontSize: '0.75rem', borderRadius: 6,
                  background: i % 2 === 0 ? 'var(--bg-primary)' : 'transparent',
                  alignItems: 'center',
                }}>
                  <div style={{ fontWeight: 600, color: BRAND_COLOR }}>{p.product}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{p.showTime}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{p.clicks.toLocaleString()}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{p.orders.toLocaleString()}</div>
                  <div style={{ fontWeight: 700, color: '#22c55e' }}>{formatGMV(p.gmv)}</div>
                  <div style={{ fontWeight: 600, color: p.convRate >= 12 ? '#22c55e' : '#f59e0b' }}>{p.convRate}%</div>
                </div>
              ))}

              {/* Product GMV Bar Chart */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>商品GMV对比</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={sessionProductDetails[selectedSession]}>
                    <XAxis dataKey="product" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" tickFormatter={v => `¥${(v / 10000).toFixed(0)}万`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatGMV(value), 'GMV']} />
                    <Bar dataKey="gmv" fill={BRAND_COLOR} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════ Tab 4: 主播绩效 ══════════════ */}
      {activeTab === 3 && (
        <>
          {/* Host Performance Table */}
          <div className="card" style={cardStyle}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>主播30日绩效排名</div>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '110px 60px 100px 90px 80px 80px 80px 80px 70px 60px',
              gap: 8, padding: '8px 12px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-light)', marginBottom: 6,
            }}>
              <div>主播</div><div>场次</div><div>总GMV</div><div>场均GMV</div><div>均观众</div>
              <div>转化率</div><div>均停留</div><div>涨粉</div><div>主品类</div><div>评分</div>
            </div>
            {hostPerformance.map((h, idx) => (
              <div key={h.name} style={{
                display: 'grid', gridTemplateColumns: '110px 60px 100px 90px 80px 80px 80px 80px 70px 60px',
                gap: 8, padding: '12px 12px', fontSize: '0.75rem', borderRadius: 8, alignItems: 'center',
                background: idx % 2 === 0 ? 'var(--bg-primary)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 800,
                    background: idx === 0 ? '#fbbf2430' : idx === 1 ? '#9ca3af25' : idx === 2 ? '#d9764030' : 'var(--bg-card)',
                    color: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#d97640' : 'var(--text-muted)',
                  }}>{idx + 1}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{h.sessions30d}</div>
                <div style={{ fontWeight: 700, color: '#22c55e' }}>{h.totalGMV}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.avgGMV}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{h.avgViewers.toLocaleString()}</div>
                <div style={{ fontWeight: 600, color: BRAND_COLOR }}>{h.avgConvRate}%</div>
                <div style={{ color: 'var(--text-muted)' }}>{h.avgStayTime}</div>
                <div style={{ fontWeight: 600, color: '#3b82f6' }}>{h.followerGrowth}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{h.topCategory}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={12} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{h.rating}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="card" style={cardStyle}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>TOP 3 主播能力雷达图</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>六维能力对比: GMV能力 / 转化率 / 互动率 / 涨粉力 / 时长稳定性 / 选品能力</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem' }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: BRAND_COLOR, display: 'inline-block' }} /> 彩妆师小雅
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem' }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: '#3b82f6', display: 'inline-block' }} /> 护肤顾问Lucy
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem' }}>
                <span style={{ width: 10, height: 3, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} /> 底妆达人小米
              </span>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={hostRadarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--border-light)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                <Radar name="彩妆师小雅" dataKey="小雅" stroke={BRAND_COLOR} fill={BRAND_COLOR} fillOpacity={0.2} strokeWidth={2} />
                <Radar name="护肤顾问Lucy" dataKey="Lucy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                <Radar name="底妆达人小米" dataKey="小米" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly GMV Trend */}
          <div className="card" style={cardStyle}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>主播周GMV趋势 (万元)</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>近4周各主播GMV对比趋势</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', marginBottom: 8 }}>
              {[
                { name: '彩妆师小雅', color: BRAND_COLOR },
                { name: '护肤顾问Lucy', color: '#3b82f6' },
                { name: '底妆达人小米', color: '#22c55e' },
                { name: '品牌直播间', color: '#f59e0b' },
              ].map(h => (
                <span key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}>
                  <span style={{ width: 10, height: 3, borderRadius: 2, background: h.color, display: 'inline-block' }} /> {h.name}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hostGMVTrend}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`¥${value}万`, name]} />
                <Bar dataKey="小雅" fill={BRAND_COLOR} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Lucy" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="小米" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="品牌" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Host Detail Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {hostPerformance.map(h => (
              <div key={h.name} className="card" style={{ ...cardStyle, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{h.topCategory} 主播 · 30日{h.sessions30d}场</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={13} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24' }}>{h.rating}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { label: '总GMV', value: h.totalGMV, color: '#22c55e' },
                    { label: '场均GMV', value: h.avgGMV, color: 'var(--text-primary)' },
                    { label: '涨粉', value: h.followerGrowth, color: '#3b82f6' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <div style={{
                    flex: 1, height: 4, borderRadius: 2, background: 'var(--border-light)', overflow: 'hidden',
                  }}>
                    <div style={{ height: '100%', borderRadius: 2, background: BRAND_COLOR, width: `${h.avgConvRate * 18}%` }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>转化 {h.avgConvRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════ Tab 5: 直播选品 ══════════════ */}
      {activeTab === 4 && (
        <>
          <div className="card" style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI智能选品推荐</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>基于趋势分析、历史转化和库存情况的综合推荐</div>
              </div>
              <div style={{
                fontSize: '0.7rem', padding: '5px 12px', borderRadius: 20,
                background: `${BRAND_COLOR}15`, color: BRAND_COLOR, fontWeight: 600,
              }}>
                <Zap size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                AI推荐
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {productRecommendations.map(p => (
                <div key={p.rank} style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr 280px 90px',
                  gap: 16, padding: '16px 18px', borderRadius: 12, alignItems: 'center',
                  background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.85rem',
                    background: p.rank <= 3 ? `${BRAND_COLOR}18` : 'var(--bg-card)',
                    color: p.rank <= 3 ? BRAND_COLOR : 'var(--text-muted)',
                  }}>{p.rank}</div>

                  {/* Product Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.product}</span>
                      <span style={{
                        fontSize: '0.65rem', padding: '2px 8px', borderRadius: 12,
                        background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600,
                      }}>{p.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>价格 <strong style={{ color: 'var(--text-primary)' }}>{p.price}</strong></span>
                      <span>毛利 <strong style={{ color: '#22c55e' }}>{p.margin}%</strong></span>
                      <span>趋势分 <strong style={{ color: p.trendScore >= 90 ? '#22c55e' : '#f59e0b' }}>{p.trendScore}</strong></span>
                      <span>历史转化 <strong style={{ color: BRAND_COLOR }}>{p.histConvRate}%</strong></span>
                      <span>库存 <strong style={{ color: 'var(--text-secondary)' }}>{p.stock.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '8px 12px',
                    background: 'var(--bg-card)', borderRadius: 8, lineHeight: 1.5,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <Target size={11} color={BRAND_COLOR} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.7rem' }}>AI建议</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#22c55e', fontWeight: 600 }}>置信度 {p.confidence}%</span>
                    </div>
                    {p.recommendation}
                  </div>

                  {/* Action */}
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => {
                      setAddedProducts(prev => {
                        const next = new Set(prev)
                        if (next.has(p.rank)) next.delete(p.rank)
                        else next.add(p.rank)
                        return next
                      })
                    }} style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s',
                      background: addedProducts.has(p.rank) ? '#22c55e' : BRAND_COLOR,
                      color: '#fff',
                    }}>
                      {addedProducts.has(p.rank) ? '已加入' : '加入排品'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Added Products Summary */}
          {addedProducts.size > 0 && (
            <div className="card" style={{ ...cardStyle, borderLeft: `3px solid #22c55e` }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                <Package size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                已选排品清单 ({addedProducts.size}件)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {productRecommendations.filter(p => addedProducts.has(p.rank)).map(p => (
                  <span key={p.rank} style={{
                    fontSize: '0.75rem', padding: '5px 14px', borderRadius: 20,
                    background: `${BRAND_COLOR}12`, color: BRAND_COLOR, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {p.product} <span style={{ color: 'var(--text-muted)' }}>{p.price}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
