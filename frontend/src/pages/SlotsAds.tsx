import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, TrendingUp, DollarSign, Users, Shield, Target,
  Bot, Activity, Globe, UserCheck,
  AlertTriangle, ArrowUpRight, ArrowDownRight,
  Brain, Cpu, Zap, Search, Star
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   小红书聚光投放 —— 种草营销平台
   核心链路: 投放→曝光→种草互动→搜索增量→进店转化→下单
   KPI: 种草指数, 搜索增量, 笔记互动率, 进店转化率, GMV
   特色: KOL/KOC分层, 内容质量评分, 成分党/颜值党/学生党人群
   AI自动投放: 自主建计划/内容优化/人群扩量/笔记种草，闭环学习
   ═══════════════════════════════════════════════════════════════ */

// ===== 投放大盘 =====
const spendDashboard = {
  todaySpend: 240000, yesterdaySpend: 228000,
  todayNotes: 320, yesterdayNotes: 298,
  avgCPE: 0.75, yesterdayCPE: 0.72,
  todayGMV: 892000, yesterdayGMV: 845000,
  grassIndex: 88, yesterdayGrassIndex: 84,
  searchLift: 35, yesterdaySearchLift: 32,
  activePlans: 185, learningPlans: 28, decayPlans: 18,
  planSurvival: 72.5,
  avgInteractionRate: 8.5,
  materialTotal: 128, newToday: 15, firstDayRunRate: 62.3,
  storeConvRate: 4.2,
  accountCount: 8, healthyAccounts: 7,
}

// ===== 产品种草看板 =====
const beautyProducts = [
  {
    name: '唇釉丝绒系列', category: '唇部', series: '经典系列',
    todaySpend: 52000, todayGMV: 198000, roi: 3.81,
    notes: 68, kocNotes: 42, interactionRate: 9.5,
    grassIndex: 95, searchLift: 42, storeConvRate: 5.2,
    cpe: 0.65, cpa: 22.5,
    topNote: '唇釉试色｜亚洲肤色必备色号测评', topNoteLikes: 8200,
    audience: '颜值党/口红爱好者', ageGroup: '18-28岁',
    activePlans: 42, survivalRate: 76.2,
    keywordCoverage: 85, searchRank: 3,
    status: 'scaling' as const
  },
  {
    name: '眼影盘星空', category: '眼部', series: '限定系列',
    todaySpend: 38000, todayGMV: 142000, roi: 3.74,
    notes: 52, kocNotes: 35, interactionRate: 10.2,
    grassIndex: 92, searchLift: 38, storeConvRate: 4.8,
    cpe: 0.72, cpa: 26.5,
    topNote: '眼影盘开箱｜星空色系上手测评', topNoteLikes: 6800,
    audience: '彩妆爱好者/学生党', ageGroup: '16-26岁',
    activePlans: 35, survivalRate: 74.5,
    keywordCoverage: 78, searchRank: 5,
    status: 'scaling' as const
  },
  {
    name: '粉底液水光', category: '底妆', series: '主打系列',
    todaySpend: 48000, todayGMV: 168000, roi: 3.50,
    notes: 45, kocNotes: 28, interactionRate: 8.2,
    grassIndex: 85, searchLift: 28, storeConvRate: 4.1,
    cpe: 0.82, cpa: 32.0,
    topNote: '粉底液测评｜干皮/油皮/混合肤测试', topNoteLikes: 5200,
    audience: '成分党/底妆初学者', ageGroup: '20-32岁',
    activePlans: 32, survivalRate: 68.8,
    keywordCoverage: 72, searchRank: 8,
    status: 'stable' as const
  },
  {
    name: '卸妆水温和', category: '卸妆', series: '温和系列',
    todaySpend: 35000, todayGMV: 115000, roi: 3.29,
    notes: 38, kocNotes: 22, interactionRate: 9.8,
    grassIndex: 80, searchLift: 22, storeConvRate: 3.8,
    cpe: 0.78, cpa: 38.5,
    topNote: '敏感肌卸妆推荐｜成分安全实测', topNoteLikes: 9500,
    audience: '成分党/敏感肌人群', ageGroup: '22-35岁',
    activePlans: 25, survivalRate: 72.0,
    keywordCoverage: 68, searchRank: 6,
    status: 'stable' as const
  },
  {
    name: '睫毛膏纤长', category: '眼部', series: '经典系列',
    todaySpend: 28000, todayGMV: 88000, roi: 3.14,
    notes: 32, kocNotes: 18, interactionRate: 7.5,
    grassIndex: 72, searchLift: 15, storeConvRate: 3.2,
    cpe: 0.88, cpa: 35.0,
    topNote: '睫毛膏测评｜亚洲平睫毛挑战', topNoteLikes: 4800,
    audience: '彩妆新手/学生党', ageGroup: '18-26岁',
    activePlans: 20, survivalRate: 62.5,
    keywordCoverage: 55, searchRank: 12,
    status: 'learning' as const
  },
  {
    name: '高光修容盘', category: '修容', series: '限定系列',
    todaySpend: 22000, todayGMV: 65000, roi: 2.95,
    notes: 25, kocNotes: 12, interactionRate: 6.8,
    grassIndex: 62, searchLift: 10, storeConvRate: 2.8,
    cpe: 0.95, cpa: 42.0,
    topNote: '高光修容教程｜日系清透妆容', topNoteLikes: 3800,
    audience: '化妆进阶用户', ageGroup: '22-35岁',
    activePlans: 15, survivalRate: 56.0,
    keywordCoverage: 45, searchRank: 18,
    status: 'declining' as const
  },
]

// ===== 种草趋势 =====
const dailyTrend = [
  { date: '03/28', spend: 210000, gmv: 785000, grassIndex: 82, notes: 285 },
  { date: '03/29', spend: 218000, gmv: 808000, grassIndex: 84, notes: 292 },
  { date: '03/30', spend: 225000, gmv: 828000, grassIndex: 85, notes: 302 },
  { date: '03/31', spend: 228000, gmv: 842000, grassIndex: 85, notes: 308 },
  { date: '04/01', spend: 232000, gmv: 852000, grassIndex: 86, notes: 312 },
  { date: '04/02', spend: 228000, gmv: 845000, grassIndex: 84, notes: 298 },
  { date: '04/03', spend: 240000, gmv: 892000, grassIndex: 88, notes: 320 },
]

// ===== 人群分层 =====
const audienceSegments = [
  { segment: '成分党', size: 280000, grassIndex: 95, convRate: 5.8, cpe: 0.62, note: '关注成分安全/功效，高互动高转化，适合卸妆/护肤种草' },
  { segment: '颜值党', size: 520000, grassIndex: 88, convRate: 4.5, cpe: 0.75, note: '关注颜值外观，量级最大，适合彩妆颜色/包装类内容' },
  { segment: '学生党', size: 380000, grassIndex: 82, convRate: 3.8, cpe: 0.68, note: '价格敏感，量级大，适合平价好物/学生穿搭类种草' },
  { segment: '精致妈妈', size: 180000, grassIndex: 85, convRate: 5.2, cpe: 0.88, note: '消费力强，关注安全温和，适合卸妆/敏感肌产品' },
  { segment: '职场白领', size: 240000, grassIndex: 80, convRate: 4.2, cpe: 0.85, note: '日常通勤妆，追求高效实用，适合底妆/口红类内容' },
  { segment: '美妆博主粉丝', size: 150000, grassIndex: 92, convRate: 6.5, cpe: 0.92, note: 'KOL信任度高，购买转化强，适合KOL种草内容投放' },
]

// ===== 关键词覆盖 =====
const keywordData = [
  { keyword: '唇釉推荐', searchVol: 128000, rank: 3, coverage: 85, trend: '+22%' },
  { keyword: '眼影盘测评', searchVol: 98000, rank: 5, coverage: 78, trend: '+18%' },
  { keyword: '粉底液哪款好', searchVol: 185000, rank: 8, coverage: 72, trend: '+12%' },
  { keyword: '卸妆水推荐敏感肌', searchVol: 72000, rank: 6, coverage: 68, trend: '+25%' },
  { keyword: '睫毛膏不晕染', searchVol: 55000, rank: 12, coverage: 55, trend: '+8%' },
  { keyword: '修容高光推荐', searchVol: 42000, rank: 18, coverage: 45, trend: '+5%' },
]

// ===== 投放预警 =====
const alerts = [
  { type: '种草效率下滑', severity: 'high' as const, product: '高光修容盘', detail: '种草指数62（目标75），搜索增量仅10%，笔记互动率6.8%低于均值8.5%', action: 'AI建议增加KOL教程类内容，聚焦化妆进阶人群，或联动抖音算法外溢', agentConfidence: 65 },
  { type: '关键词排名下滑', severity: 'high' as const, product: '粉底液水光', detail: '"粉底液哪款好"关键词排名从第5→第8，竞品加大笔记投放', action: 'AI已追加相关关键词笔记5篇，建议增加KOC素人真实测评内容', agentConfidence: 78 },
  { type: '互动率下降', severity: 'medium' as const, product: '唇釉丝绒', detail: 'Top笔记互动率从11%降至9.5%，内容新鲜度下降', action: 'AI已触发新笔记策划3篇（新色试色/节日限定/对比测评），1篇已发布', agentConfidence: 88 },
  { type: '进店转化偏低', severity: 'medium' as const, product: '睫毛膏纤长', detail: '进店转化率3.2%（目标4%），落地页停留时间偏短', action: 'AI建议优化主图和详情页，增加使用前后对比图，提升转化说服力', agentConfidence: 82 },
  { type: '预算利用率偏低', severity: 'low' as const, product: '高光修容盘', detail: '预算利用率仅68%，出价竞争力不足，流量获取有限', action: 'AI建议提高CPE出价至¥1.2，扩大人群定向范围至化妆进阶用户', agentConfidence: 85 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

export default function SlotsAds() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'dashboard' | 'products' | 'audience' | 'keywords' | 'alerts' | 'ai-auto'>('dashboard')
  const [selectedProduct, setSelectedProduct] = useState<typeof beautyProducts[0] | null>(null)

  // AI配置
  const xiaohongshuAIGroups: AIConfigGroup[] = [
    {
      title: '种草核心策略',
      icon: <Star size={16} />,
      params: [
        createParam('grass_index_target', '种草指数目标', 85, '', '小红书种草综合效率指标，包含曝光/互动/转化多维度评分', 82, 89, { min: 50, max: 100, step: 1, learningDataPoints: 58300, adjustHistory: [
          { time: '2小时前', from: '82', to: '85', reason: '近期种草效率持续提升，AI上调目标值' },
          { time: '3天前', from: '88', to: '82', reason: '新品冷启动期，AI降低阈值适应新内容积累' },
        ] }),
        createParam('cpe_ceiling', 'CPE出价上限', 1.2, '¥', '每次有效互动（点赞/收藏/评论）的最高成本', 1.1, 88, { min: 0.3, max: 5.0, step: 0.1, autoTuneEnabled: false, learningDataPoints: 45200, adjustHistory: [
          { time: '昨日', from: '1.1', to: '1.2', reason: '新品推广期，手动放宽CPE上限' },
          { time: '1周前', from: '1.5', to: '1.1', reason: '月末预算收紧，手动降低出价上限' },
        ] }),
        createParam('search_lift_target', '搜索增量目标', 30, '%', '广告投放后带动自然搜索量提升的目标百分比', 28, 85, { min: 5, max: 80, step: 5, learningDataPoints: 38900, adjustHistory: [
          { time: '3天前', from: '25', to: '30', reason: '品牌搜索量提升显著，AI上调搜索增量目标' },
          { time: '2周前', from: '35', to: '25', reason: '竞品加大投放，搜索流量竞争加剧，AI下调目标' },
        ] }),
        createParam('store_conv_target', '进店转化率目标', 4.0, '%', '从笔记点击到进入店铺的转化率目标', 3.8, 84, { min: 1.0, max: 15.0, step: 0.5, learningDataPoints: 44600, adjustHistory: [
          { time: '昨日', from: '3.5', to: '4.0', reason: '落地页优化后转化提升，AI上调目标' },
          { time: '3天前', from: '5.0', to: '3.5', reason: '新品认知度低，AI降低转化目标' },
        ] }),
      ],
    },
    {
      title: '内容质量控制',
      icon: <BookOpen size={16} />,
      params: [
        createParam('note_quality_min', '笔记质量最低分', 75, '分', '投放笔记质量评分最低要求，低于此分的笔记不参与投放', 78, 91, { min: 50, max: 95, step: 5, learningDataPoints: 41800, adjustHistory: [
          { time: '2天前', from: '70', to: '75', reason: '低质量笔记种草效果差，AI提高质量门槛' },
          { time: '1周前', from: '80', to: '70', reason: '高质量笔记数量不足，AI临时降低门槛补充投放' },
        ] }),
        createParam('kol_koc_ratio', 'KOL/KOC笔记比例', 30, '%', 'KOL（大V）笔记占总投放笔记的比例，其余为KOC素人笔记', 28, 82, { min: 10, max: 70, step: 5, learningDataPoints: 28600, adjustHistory: [
          { time: '3天前', from: '25', to: '30', reason: '品牌声量需要KOL背书，AI提高KOL比例' },
          { time: '1周前', from: '40', to: '25', reason: 'KOC素人内容ROI更高，AI降低KOL比例' },
        ] }),
        createParam('content_diversity', '内容类型多样性', 0.75, '分', '笔记内容类型多样性要求：教程/测评/开箱/对比/日常等', 0.72, 88, { min: 0.3, max: 1.0, step: 0.05, learningDataPoints: 35400, adjustHistory: [
          { time: '2天前', from: '0.65', to: '0.75', reason: '内容同质化导致互动率下降，AI提升多样性要求' },
        ] }),
        createParam('refresh_cycle', '内容刷新周期', 5, '天', '同一产品投放笔记内容的更新周期，防止内容疲劳', 4, 76, { min: 1, max: 14, step: 1, autoTuneEnabled: false, learningDataPoints: 15200, adjustHistory: [
          { time: '1周前', from: '7', to: '5', reason: '小红书用户内容消费速度快，手动缩短刷新周期' },
        ] }),
      ],
    },
    {
      title: '人群定向策略',
      icon: <Users size={16} />,
      params: [
        createParam('core_audience', '核心种草人群', '成分党', '', '重点种草的核心目标人群，决定内容方向和关键词策略', '颜值党', 90, { type: 'select', options: ['成分党', '颜值党', '学生党', '精致妈妈', '职场白领', 'AI动态'], learningDataPoints: 71200, adjustHistory: [
          { time: '昨日', from: '颜值党', to: '成分党', reason: 'AI检测到成分党人群转化率显著提升，切换核心人群' },
          { time: '3天前', from: '成分党', to: '颜值党', reason: '颜值党量级更大，品牌曝光期优先扩量' },
        ] }),
        createParam('age_range', '目标年龄段', '18-30', '岁', '种草内容的目标年龄范围，影响内容风格和关键词', '18-30', 85, { type: 'select', options: ['16-22', '18-28', '18-30', '22-35', '25-40', '全年龄'], learningDataPoints: 55800, adjustHistory: [
          { time: '2天前', from: '22-35', to: '18-30', reason: '年轻用户种草传播力更强，AI调整目标年龄段' },
        ] }),
        createParam('interest_expand', '兴趣扩展系数', 2, '%', '基于核心人群的兴趣扩展范围，越大覆盖越广但精准度越低', 3, 79, { min: 1, max: 8, step: 1, learningDataPoints: 21300, adjustHistory: [
          { time: '2天前', from: '3', to: '2', reason: '扩展过度导致互动质量下降，AI收缩扩展系数' },
        ] }),
        createParam('geo_target', '地域定向', '全国', '', '种草内容的地域覆盖策略，重点城市vs全国投放', '重点城市', 86, { type: 'select', options: ['全国', '一线城市', '重点城市', 'AI动态'], autoTuneEnabled: false, learningDataPoints: 25600, adjustHistory: [
          { time: '1周前', from: '一线城市', to: '全国', reason: '下沉市场美妆消费快速增长，手动扩展地域' },
        ] }),
      ],
    },
  ]

  const xiaohongshuLearningStatus: AILearningStatus = {
    modelVersion: 'v2.8.0-xiaohongshu',
    lastTraining: '45分钟前',
    totalDataPoints: 285000,
    avgConfidence: 86,
    autoAdjustCount24h: 182,
    learningRate: '0.001',
    nextTraining: '2小时后',
    improvementRate: '+9.8%',
  }
  useRegisterAIConfig(xiaohongshuAIGroups, xiaohongshuLearningStatus, '小红书种草')

  const d = spendDashboard
  const spendChange = ((d.todaySpend - d.yesterdaySpend) / d.yesterdaySpend * 100)
  const gmvChange = ((d.todayGMV - d.yesterdayGMV) / d.yesterdayGMV * 100)
  const grassChange = ((d.grassIndex - d.yesterdayGrassIndex) / d.yesterdayGrassIndex * 100)

  return (
    <>
      <div className="page-header">
        <h2>小红书种草投放</h2>
        <p>玛丽黛佳小红书聚光平台 · 种草指数/搜索增量/进店转化 · {d.activePlans}个计划/{d.materialTotal}条笔记 · 种草指数{d.grassIndex} · AI内容优化</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="SearchQuery-Optimizer" color="#10b981" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
          <ModelBadge name="UGCQuality-Ranker" color="#ec4899" />
          <ModelBadge name="AudienceCluster-KM" color="#06b6d4" />
          <ModelBadge name="ComplianceNLP" color="#f59e0b" />
        </div>

        {/* ── AI决策中心 · 小红书执行状态 ── */}
        {(() => {
          const xhsDecisions = [
            { id: 'DC-012', title: '竞品暂停投放，建议抢量扩充预算', confidence: 91, status: '待确认', model: 'CompetitorIntel-NLP', impact: '增量GMV ¥8,500', time: '11:15' },
            { id: 'DC-017', title: 'UGC笔记质量下降，暂停低分素材', confidence: 86, status: '执行中', model: 'UGCQuality-Ranker', impact: '内容评分+0.8', time: '10:55' },
            { id: 'DC-021', title: '成分党人群种草指数回升，追投精华', confidence: 88, status: '执行中', model: 'AudienceCluster-KM', impact: '种草指数+15%', time: '10:40' },
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 小红书执行状态</span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 7, background: 'rgba(236,72,153,0.15)', color: '#ec4899' }}>小红书聚光</span>
                </div>
                <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.65rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部 →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {xhsDecisions.map(d => (
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

        {/* 大盘指标 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ borderTop: '3px solid #e8365d' }}>
            <div className="card-title"><DollarSign size={13} style={{ display: 'inline' }} /> 今日消耗</div>
            <div className="card-value">¥{(d.todaySpend / 10000).toFixed(1)}万</div>
            <div className={`card-change ${spendChange >= 0 ? 'positive' : 'negative'}`}>
              {spendChange >= 0 ? '+' : ''}{spendChange.toFixed(1)}% vs 昨日
            </div>
          </div>
          <div className="card" style={{ borderTop: '3px solid #34d399' }}>
            <div className="card-title"><TrendingUp size={13} style={{ display: 'inline' }} /> 今日GMV</div>
            <div className="card-value">¥{(d.todayGMV / 10000).toFixed(0)}万</div>
            <div className="card-change positive">+{gmvChange.toFixed(1)}%</div>
          </div>
          <div className="card" style={{ borderTop: `3px solid ${d.grassIndex >= 85 ? '#22c55e' : '#f59e0b'}` }}>
            <div className="card-title"><Star size={13} style={{ display: 'inline' }} /> 种草指数</div>
            <div className="card-value" style={{ color: d.grassIndex >= 85 ? '#22c55e' : '#f59e0b' }}>{d.grassIndex}</div>
            <div className={`card-change ${grassChange >= 0 ? 'positive' : 'negative'}`}>{grassChange >= 0 ? '+' : ''}{grassChange.toFixed(1)}% vs 昨日</div>
          </div>
          <div className="card" style={{ borderTop: '3px solid #60a5fa' }}>
            <div className="card-title"><Search size={13} style={{ display: 'inline' }} /> 搜索增量</div>
            <div className="card-value">+{d.searchLift}%</div>
            <div className="card-change positive">昨日 +{d.yesterdaySearchLift}%</div>
          </div>
          <div className="card" style={{ borderTop: `3px solid ${d.storeConvRate >= 4.0 ? '#22c55e' : '#f59e0b'}` }}>
            <div className="card-title"><Activity size={13} style={{ display: 'inline' }} /> 进店转化率</div>
            <div className="card-value">{d.storeConvRate}%</div>
            <div className="card-change positive">{d.activePlans}活跃计划</div>
          </div>
        </div>

        {/* 二级指标 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: '今日笔记数', value: `${d.todayNotes}`, color: '#e8365d' },
            { label: '学习期计划', value: `${d.learningPlans}`, color: '#f59e0b' },
            { label: '笔记互动率', value: `${d.avgInteractionRate}%`, color: d.avgInteractionRate >= 8.0 ? '#22c55e' : '#f59e0b' },
            { label: '健康账户', value: `${d.healthyAccounts}/${d.accountCount}`, color: '#22c55e' },
            { label: '今日新笔记', value: `${d.newToday}`, color: '#e8365d' },
            { label: '平均CPE', value: `¥${d.avgCPE}`, color: '#f59e0b' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>种草趋势</button>
          <button className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>产品种草看板</button>
          <button className={`tab ${tab === 'audience' ? 'active' : ''}`} onClick={() => setTab('audience')}>人群分层分析</button>
          <button className={`tab ${tab === 'keywords' ? 'active' : ''}`} onClick={() => setTab('keywords')}>关键词覆盖</button>
          <button className={`tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
            种草预警 {alerts.filter(a => a.severity === 'high').length > 0 &&
              <span style={{ marginLeft: 4, padding: '1px 6px', borderRadius: 8, background: '#ef4444', color: 'white', fontSize: '0.6rem' }}>{alerts.filter(a => a.severity === 'high').length}</span>}
          </button>
          <button className={`tab ${tab === 'ai-auto' ? 'active' : ''}`} onClick={() => setTab('ai-auto')}>
            <Cpu size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />AI自动种草
          </button>
        </div>

        {/* Tab 1: 趋势 */}
        {tab === 'dashboard' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title"><TrendingUp size={16} /> 种草指数 & GMV趋势</div>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={dailyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[78, 92]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area yAxisId="right" type="monotone" dataKey="gmv" stroke="#34d399" fill="rgba(52,211,153,0.1)" strokeWidth={2} name="GMV" />
                  <Line yAxisId="left" type="monotone" dataKey="grassIndex" stroke="#e8365d" strokeWidth={2.5} name="种草指数" dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="section-title"><BookOpen size={16} /> 日消耗 & 笔记数趋势</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="spend" fill="#e8365d" name="消耗 ¥" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="notes" stroke="#60a5fa" strokeWidth={2} name="笔记数" dot={{ r: 3 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: 产品看板 */}
        {tab === 'products' && (
          <>
            {beautyProducts.map((p, idx) => (
              <div key={idx} className="card" onClick={() => setSelectedProduct(p)} style={{
                marginBottom: 10,
                borderLeft: `4px solid ${p.status === 'scaling' ? '#22c55e' : p.status === 'stable' ? '#60a5fa' : p.status === 'learning' ? '#f59e0b' : '#ef4444'}`,
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Star size={16} color="#e8365d" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.name}</span>
                  <span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontSize: '0.58rem' }}>{p.category}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>受众: {p.audience} · {p.ageGroup}</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>关键词覆盖: {p.keywordCoverage}% · 搜索排名第{p.searchRank}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600,
                      background: p.status === 'scaling' ? 'rgba(34,197,94,0.1)' : p.status === 'stable' ? 'rgba(96,165,250,0.1)' : p.status === 'learning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: p.status === 'scaling' ? '#16a34a' : p.status === 'stable' ? '#60a5fa' : p.status === 'learning' ? '#f59e0b' : '#ef4444'
                    }}>
                      {p.status === 'scaling' ? '起量中' : p.status === 'stable' ? '稳定' : p.status === 'learning' ? '培育中' : '下滑'}
                    </span>
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4, marginBottom: 6 }}>
                  {[
                    { label: '日消耗', value: `¥${(p.todaySpend / 10000).toFixed(1)}万` },
                    { label: '日GMV', value: `¥${(p.todayGMV / 10000).toFixed(1)}万` },
                    { label: 'ROI', value: `${p.roi}`, color: p.roi >= 3.5 ? '#22c55e' : '#f59e0b' },
                    { label: '种草指数', value: `${p.grassIndex}`, color: p.grassIndex >= 85 ? '#22c55e' : '#f59e0b' },
                    { label: '搜索增量', value: `+${p.searchLift}%`, color: '#22c55e' },
                    { label: '互动率', value: `${p.interactionRate}%`, color: p.interactionRate >= 9.0 ? '#22c55e' : '#f59e0b' },
                    { label: '进店转化', value: `${p.storeConvRate}%`, color: p.storeConvRate >= 4.5 ? '#22c55e' : '#f59e0b' },
                    { label: 'CPE', value: `¥${p.cpe}`, color: p.cpe < 0.8 ? '#22c55e' : '#f59e0b' },
                    { label: '计划存活', value: `${p.survivalRate}%`, color: p.survivalRate >= 70 ? '#22c55e' : '#f59e0b' },
                  ].map((kpi, i) => (
                    <div key={i} style={{ padding: 4, background: 'var(--bg-primary)', borderRadius: 4, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: kpi.color || 'var(--text-primary)' }}>{kpi.value}</div>
                      <div style={{ fontSize: '0.48rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Top笔记: {p.topNote} 点赞{(p.topNoteLikes / 1000).toFixed(1)}K
                    | KOC笔记 {p.kocNotes}/{p.notes}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#e8365d', whiteSpace: 'nowrap', marginLeft: 8 }}>查看详情 →</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tab 3: 人群分层 */}
        {tab === 'audience' && (
          <div>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>小红书人群分层策略</strong>：小红书用户有明显的兴趣圈层属性。<strong>成分党</strong>转化率最高(5.8%)但量级小；<strong>颜值党</strong>量级最大但转化一般；<strong>学生党</strong>价格敏感但传播力强。AI根据不同圈层特征动态调整内容策略和出价。
              </div>
            </div>
            {audienceSegments.map((seg, i) => (
              <div key={i} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <UserCheck size={16} color="#e8365d" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{seg.segment}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>受众规模: {(seg.size / 10000).toFixed(0)}万</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 8 }}>
                  {[
                    { label: '种草指数', value: `${seg.grassIndex}`, color: seg.grassIndex >= 90 ? '#22c55e' : '#f59e0b' },
                    { label: '转化率', value: `${seg.convRate}%`, color: seg.convRate >= 5.0 ? '#22c55e' : '#f59e0b' },
                    { label: 'CPE', value: `¥${seg.cpe}`, color: seg.cpe < 0.7 ? '#22c55e' : '#f59e0b' },
                    { label: '受众规模', value: `${(seg.size / 10000).toFixed(0)}万`, color: 'var(--text-primary)' },
                    { label: '推荐产品', value: seg.grassIndex >= 90 ? '唇釉/眼影' : '护肤/卸妆', color: '#e8365d' },
                  ].map((m, j) => (
                    <div key={j} style={{ padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{seg.note}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: 关键词覆盖 */}
        {tab === 'keywords' && (
          <div>
            <div className="card">
              <div className="section-title"><Search size={16} /> 关键词覆盖监控</div>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>关键词</th>
                    <th>月搜索量</th>
                    <th>当前排名</th>
                    <th>笔记覆盖率</th>
                    <th>搜索趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordData.map((kw, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{kw.keyword}</td>
                      <td>{(kw.searchVol / 10000).toFixed(0)}万</td>
                      <td style={{ color: kw.rank <= 5 ? '#22c55e' : kw.rank <= 10 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>第{kw.rank}位</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg-primary)', borderRadius: 3 }}>
                            <div style={{ width: `${kw.coverage}%`, height: '100%', background: kw.coverage >= 75 ? '#e8365d' : '#f59e0b', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{kw.coverage}%</span>
                        </div>
                      </td>
                      <td style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>{kw.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: 种草预警 */}
        {tab === 'alerts' && (
          <div>
            {alerts.map((alert, i) => (
              <div key={i} className="card" style={{ marginBottom: 10, borderLeft: `4px solid ${alert.severity === 'high' ? '#ef4444' : alert.severity === 'medium' ? '#f59e0b' : '#60a5fa'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <AlertTriangle size={14} color={alert.severity === 'high' ? '#ef4444' : '#f59e0b'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{alert.type}</span>
                  <span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontSize: '0.58rem' }}>{alert.product}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)' }}>AI置信度: {alert.agentConfidence}%</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{alert.detail}</div>
                <div style={{ fontSize: '0.72rem', color: '#e8365d' }}>建议: {alert.action}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: AI自动种草 */}
        {tab === 'ai-auto' && (
          <div>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>AI自动种草闭环</strong>：AI智能体全程接管小红书聚光投放，包括笔记质量评分、关键词优化、人群动态调整、内容刷新触发。今日AI操作<strong>182次</strong>，种草指数提升<strong>+4点</strong>。
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'AI今日操作', value: '182次', color: '#e8365d' },
                { label: '自动优化笔记', value: '28篇', color: '#ff7a95' },
                { label: '关键词自动扩展', value: '45个', color: '#34d399' },
                { label: '人工干预率', value: '1.6%', color: '#60a5fa' },
              ].map((m, i) => (
                <div key={i} className="card" style={{ textAlign: 'center', padding: 14 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="section-title"><Bot size={16} /> AI种草操作日志</div>
              {[
                { time: '11:45', action: 'AI扩量唇釉成分党定向+30%预算 → 种草指数 88→92', confidence: 92 },
                { time: '11:38', action: 'AI建种草计划3个 → 眼影盘星空 → 学生党/颜值党人群', confidence: 90 },
                { time: '11:30', action: 'AI优化关键词 → 新增"唇釉哑光"等5个长尾词', confidence: 95 },
                { time: '11:22', action: 'AI触发内容刷新 → 唇釉笔记互动率下滑→新增3篇对比测评', confidence: 88 },
                { time: '11:15', action: 'AI发现高转化笔记 → "卸妆水温和"搜索增量+25%', confidence: 82 },
                { time: '11:08', action: 'AI调整高光修容出价 → CPE ¥0.95→¥1.2 提升竞争力', confidence: 78 },
              ].map((op, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border-light)' : 'none' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 38, fontFamily: 'monospace' }}>{op.time}</span>
                  <span style={{ fontSize: '0.75rem', flex: 1 }}>{op.action}</span>
                  <span style={{ fontSize: '0.65rem', color: op.confidence >= 90 ? '#34d399' : '#fbbf24' }}>{op.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
