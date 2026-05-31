import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video, TrendingUp, DollarSign, Bot,
  Activity, Eye, Zap,
  BarChart3, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Target,
  Brain, Cpu, Play
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ===== 快手磁力引擎投放核心：短视频美妆带货 + AI自动投放 =====
// 快手商业模式：短视频/直播带货→消费者下单→商家发货→GMV
// 核心公式：投放ROI = GMV / 广告消耗
// 关键指标：完播率/CPM/点击率/下单转化/复购率
// AI自动投放：AI智能体自主操作投放全流程，闭环学习持续优化

// ===== 消耗大盘 =====
const spendDashboard = {
  todaySpend: 160000, yesterdaySpend: 152000,
  todayGMV: 520000, yesterdayGMV: 492000,
  roi: 3.25, yesterdayROI: 3.24,
  totalPlans: 198, activePlans: 112, learningPlans: 30, deadPlans: 56,
  planSurvivalRate: 56.6,
  avgCPM: 38.5,
  materialCount: 165, newToday: 14, firstDaySpendRate: 42.0,
  accountCount: 8, healthyAccounts: 7, warningAccounts: 1,
  completionRate: 68.5, // 完播率
  orderConvRate: 3.8,
}

// ===== 产品视频投放看板 =====
const videoProducts = [
  {
    name: '唇釉丝绒试色', product: '唇釉丝绒系列', category: '唇部',
    videoType: '试色视频', duration: 42,
    todaySpend: 35000, todayGMV: 128000, roi: 3.66, cpm: 32.5,
    views: 1280000, completionRate: 72.5, clickRate: 4.8, convRate: 4.2,
    orders: 2850, avgOrderValue: 45,
    totalPlans: 45, activePlans: 28, planSurvivalRate: 62.2,
    topVideo: '唇釉试色|哑光豆沙色上嘴效果', topVideoViews: 380000,
    status: 'scaling' as const,
    channels: { 信息流: 55, 搜索: 25, 直播前: 20 },
  },
  {
    name: '眼影盘教程', product: '眼影盘星空', category: '眼部',
    videoType: '妆容教程', duration: 65,
    todaySpend: 28000, todayGMV: 98000, roi: 3.50, cpm: 42.0,
    views: 980000, completionRate: 68.2, clickRate: 4.2, convRate: 3.8,
    orders: 2180, avgOrderValue: 55,
    totalPlans: 38, activePlans: 22, planSurvivalRate: 57.9,
    topVideo: '眼影盘教程|星空烟熏妆步骤详解', topVideoViews: 285000,
    status: 'scaling' as const,
    channels: { 信息流: 48, 搜索: 28, 直播前: 24 },
  },
  {
    name: '粉底液对比测评', product: '粉底液水光', category: '底妆',
    videoType: '对比测评', duration: 55,
    todaySpend: 32000, todayGMV: 108000, roi: 3.38, cpm: 38.0,
    views: 1120000, completionRate: 65.8, clickRate: 3.8, convRate: 3.5,
    orders: 2450, avgOrderValue: 48,
    totalPlans: 42, activePlans: 22, planSurvivalRate: 52.4,
    topVideo: '粉底液对比|5款底妆控油持妆测试', topVideoViews: 320000,
    status: 'stable' as const,
    channels: { 信息流: 60, 搜索: 28, 直播前: 12 },
  },
  {
    name: '卸妆水开箱', product: '卸妆水温和', category: '卸妆',
    videoType: '开箱视频', duration: 38,
    todaySpend: 25000, todayGMV: 78000, roi: 3.12, cpm: 35.5,
    views: 820000, completionRate: 75.2, clickRate: 4.5, convRate: 3.9,
    orders: 1650, avgOrderValue: 52,
    totalPlans: 32, activePlans: 18, planSurvivalRate: 56.3,
    topVideo: '卸妆水开箱|成分党敏感肌必看评测', topVideoViews: 245000,
    status: 'stable' as const,
    channels: { 信息流: 52, 搜索: 32, 直播前: 16 },
  },
  {
    name: '睫毛膏变美挑战', product: '睫毛膏纤长', category: '眼部',
    videoType: '变美挑战', duration: 28,
    todaySpend: 22000, todayGMV: 65000, roi: 2.95, cpm: 42.5,
    views: 680000, completionRate: 78.5, clickRate: 3.5, convRate: 2.9,
    orders: 1380, avgOrderValue: 48,
    totalPlans: 28, activePlans: 14, planSurvivalRate: 50.0,
    topVideo: '睫毛膏变美挑战|亚洲平睫翘睫对比', topVideoViews: 198000,
    status: 'learning' as const,
    channels: { 信息流: 65, 搜索: 22, 直播前: 13 },
  },
  {
    name: '高光修容技巧', product: '高光修容盘', category: '修容',
    videoType: '技巧教程', duration: 58,
    todaySpend: 18000, todayGMV: 43000, roi: 2.39, cpm: 48.5,
    views: 480000, completionRate: 62.5, clickRate: 3.1, convRate: 2.2,
    orders: 850, avgOrderValue: 55,
    totalPlans: 18, activePlans: 8, planSurvivalRate: 44.4,
    topVideo: '修容教程|零基础日系清透妆高光打法', topVideoViews: 142000,
    status: 'declining' as const,
    channels: { 信息流: 58, 搜索: 28, 直播前: 14 },
  },
]

// ===== 消耗趋势 =====
const dailyTrend = [
  { date: '03/28', spend: 138000, gmv: 448000, roi: 3.25, completionRate: 65.2 },
  { date: '03/29', spend: 142000, gmv: 465000, roi: 3.27, completionRate: 66.0 },
  { date: '03/30', spend: 148000, gmv: 482000, roi: 3.26, completionRate: 66.8 },
  { date: '03/31', spend: 152000, gmv: 492000, roi: 3.24, completionRate: 67.2 },
  { date: '04/01', spend: 155000, gmv: 502000, roi: 3.24, completionRate: 67.5 },
  { date: '04/02', spend: 152000, gmv: 492000, roi: 3.24, completionRate: 68.0 },
  { date: '04/03', spend: 160000, gmv: 520000, roi: 3.25, completionRate: 68.5 },
]

// ===== 视频类型分析 =====
const videoTypeAnalysis = [
  { type: '试色视频', count: 48, avgCPM: 32.5, avgCompletionRate: 72.5, avgROI: 3.5, bestProduct: '唇釉系列', note: '直观展示产品效果，完播率高，转化效果最佳' },
  { type: '妆容教程', count: 38, avgCPM: 42.0, avgCompletionRate: 68.0, avgROI: 3.3, bestProduct: '眼影盘', note: '内容丰富，教育性强，适合复杂产品种草' },
  { type: '对比测评', count: 32, avgCPM: 38.0, avgCompletionRate: 65.0, avgROI: 3.2, bestProduct: '粉底液', note: '对比逻辑清晰，信任感强，底妆产品首选' },
  { type: '开箱视频', count: 28, avgCPM: 35.5, avgCompletionRate: 75.0, avgROI: 3.1, bestProduct: '卸妆水', note: '新鲜感强，适合新品发布和礼盒类产品' },
  { type: '变美挑战', count: 22, avgCPM: 42.5, avgCompletionRate: 78.0, avgROI: 2.9, bestProduct: '睫毛膏', note: '互动性强，年轻人喜欢，适合眼部产品' },
  { type: '技巧教程', count: 18, avgCPM: 48.5, avgCompletionRate: 62.0, avgROI: 2.5, bestProduct: '高光修容', note: '专业感强，需一定化妆基础，受众较窄' },
]

// ===== 消耗分布 =====
const spendDistribution = [
  { name: '信息流', value: 92800, color: '#e8365d' },
  { name: '搜索广告', value: 43200, color: '#ff7a95' },
  { name: '直播前贴片', value: 24000, color: '#ffb3c6' },
]

// ===== 投放预警 =====
const alerts = [
  { type: 'ROI下滑', severity: 'high' as const, product: '高光修容技巧', detail: 'ROI仅2.39（目标3.0），完播率62.5%低于均值68.5%，视频内容吸引力不足', action: 'AI建议更换视频素材，试水"before/after"变美对比类内容，降低视频时长至30s内', agentConfidence: 62 },
  { type: 'CPM飙升', severity: 'high' as const, product: '眼影盘教程', detail: 'CPM从¥38→¥42(+10.5%)，快手美妆赛道竞争加剧，618预热期竞品加大投放', action: 'AI已调整出价策略至"目标ROI"模式，转向精准人群降低CPM波动', agentConfidence: 75 },
  { type: '完播率下降', severity: 'medium' as const, product: '唇釉丝绒试色', detail: 'Top视频完播率从75%→72.5%，观众跳出点在视频第28秒', action: 'AI已触发视频剪辑优化：缩短前3秒引导，第28秒前加入关键看点', agentConfidence: 88 },
  { type: '起量困难', severity: 'medium' as const, product: '睫毛膏变美挑战', detail: '新视频上线8天，28个计划仅14个存活(50%)，日消耗¥2.2万低于¥5万目标', action: 'AI建议切换"最大播放量"出价，先冲曝光量通过学习期，再切ROI出价', agentConfidence: 82 },
  { type: '素材疲劳', severity: 'low' as const, product: '粉底液对比测评', detail: '"5款底妆对比"视频已投放9天，点击率从4.5%降至3.8%', action: 'AI已安排更新对比视频（增加新竞品/新色号），预计3天内完成', agentConfidence: 90 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

export default function DramaAds() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'dashboard' | 'videos' | 'videotypes' | 'alerts' | 'ai-auto'>('dashboard')
  const [selectedVideo, setSelectedVideo] = useState<typeof videoProducts[0] | null>(null)

  // AI规则配置
  const kuaishouAIGroups: AIConfigGroup[] = [
    {
      title: '快手投放核心',
      icon: <Target size={16} />,
      params: [
        createParam('completion_rate_target', '完播率目标阈值', 65, '%', '视频完播率目标，低于阈值触发内容优化或素材替换', 68, 89, { min: 30, max: 90, step: 1, learningDataPoints: 58300, adjustHistory: [
          { time: '3小时前', from: '62', to: '65', reason: '近期视频质量提升，AI上调完播率基线' },
          { time: '2天前', from: '70', to: '62', reason: '新品冷启动期，AI降低阈值适应新内容' },
        ] }),
        createParam('cpm_ceiling', 'CPM上限', 50, '¥', '千次展示成本上限，防止过高CPM导致ROI亏损', 45, 88, { min: 15, max: 120, step: 5, autoTuneEnabled: false, learningDataPoints: 45200, adjustHistory: [
          { time: '昨日', from: '45', to: '50', reason: '618预热期流量成本上升，手动放宽CPM上限' },
          { time: '1周前', from: '55', to: '45', reason: '月末预算收紧，手动降低CPM上限' },
        ] }),
        createParam('roi_target', 'ROI目标值', 3.0, '', '快手渠道整体ROI目标，低于此值触发出价调整', 2.8, 85, { min: 1.5, max: 8.0, step: 0.1, learningDataPoints: 38900, adjustHistory: [
          { time: '3天前', from: '2.8', to: '3.0', reason: '整体ROI持续达标，AI上调目标值' },
        ] }),
        createParam('bid_strategy', '快手出价策略', '目标成本', '', '快手磁力引擎出价策略：最低成本/目标成本/最大转化/按播放量付费', 'AI动态', 87, { type: 'select', options: ['最低成本', '目标成本', '最大转化', '按播放付费', 'AI动态'], learningDataPoints: 71200, adjustHistory: [
          { time: '2小时前', from: '目标成本', to: 'AI动态', reason: 'AI检测到转化率波动加大，切换动态策略' },
          { time: '昨日', from: 'AI动态', to: '目标成本', reason: '唇釉系列稳定期，AI切回目标成本策略' },
        ] }),
      ],
    },
    {
      title: '视频内容优化',
      icon: <Video size={16} />,
      params: [
        createParam('video_duration_optimal', '最优视频时长', 42, '秒', '美妆类视频最佳完播率对应的视频时长', 45, 84, { min: 15, max: 90, step: 5, learningDataPoints: 44600, adjustHistory: [
          { time: '昨日', from: '45', to: '42', reason: '数据显示42秒视频完播率最高，AI调整建议时长' },
          { time: '3天前', from: '38', to: '45', reason: '短视频内容信息量不足，AI建议适当延长' },
        ] }),
        createParam('creative_fatigue_days', '素材疲劳天数', 7, '天', '视频素材投放超过此天数点击率自然衰减，触发替换', 6, 86, { min: 3, max: 21, step: 1, learningDataPoints: 21300, adjustHistory: [
          { time: '2天前', from: '6', to: '7', reason: '高质量视频衰减较慢，AI延长疲劳周期' },
        ] }),
        createParam('hook_test_count', 'Hook测试数量', 3, '个', '每个视频需同时测试的不同Hook版本数量', 4, 82, { min: 2, max: 8, step: 1, learningDataPoints: 35400, adjustHistory: [
          { time: '3天前', from: '4', to: '3', reason: 'Hook测试过多导致预算分散，AI降低测试数量' },
        ] }),
        createParam('live_linkage', '直播联动开关', '开启', '', '是否在短视频投放同时联动直播间，形成流量协同效应', '开启', 90, { type: 'select', options: ['开启', '关闭'], autoTuneEnabled: false, learningDataPoints: 25600, adjustHistory: [
          { time: '5天前', from: '关闭', to: '开启', reason: '直播间联动后GMV提升18%，手动开启' },
        ] }),
      ],
    },
    {
      title: '人群与出价',
      icon: <Brain size={16} />,
      params: [
        createParam('audience_type', '核心受众类型', '美妆爱好者', '', '快手核心种草人群类型，决定定向和内容风格', '精准美妆', 88, { type: 'select', options: ['泛美妆', '美妆爱好者', '精准美妆', 'AI动态'], learningDataPoints: 55800, adjustHistory: [
          { time: '2天前', from: '泛美妆', to: '美妆爱好者', reason: '精准人群ROI更高，AI调整受众类型' },
        ] }),
        createParam('age_group', '目标年龄段', '18-35', '岁', '快手美妆广告目标年龄范围', '18-30', 85, { type: 'select', options: ['16-25', '18-30', '18-35', '22-40', '全年龄'], learningDataPoints: 38400, adjustHistory: [
          { time: '3天前', from: '18-30', to: '18-35', reason: '扩大年龄段后GMV提升，AI调整目标范围' },
        ] }),
        createParam('budget_allocation', '预算分配方式', '均衡', '', '各产品线预算分配策略：均衡/按ROI动态/手动指定', 'AI动态', 86, { type: 'select', options: ['均衡', '按ROI动态', '手动指定', 'AI动态'], autoTuneEnabled: false, learningDataPoints: 25600, adjustHistory: [
          { time: '2天前', from: 'AI动态', to: '按ROI动态', reason: '手动调整各产品线预算比例后效果更好' },
        ] }),
      ],
    },
  ]

  const kuaishouLearningStatus: AILearningStatus = {
    modelVersion: 'v2.9.0-kuaishou',
    lastTraining: '2小时前',
    totalDataPoints: 318000,
    avgConfidence: 87,
    autoAdjustCount24h: 165,
    learningRate: '0.0009',
    nextTraining: '4小时后',
    improvementRate: '+8.5%',
  }
  useRegisterAIConfig(kuaishouAIGroups, kuaishouLearningStatus, '快手投放')

  const d = spendDashboard
  const spendChange = ((d.todaySpend - d.yesterdaySpend) / d.yesterdaySpend * 100)
  const gmvChange = ((d.todayGMV - d.yesterdayGMV) / d.yesterdayGMV * 100)

  return (
    <>
      <div className="page-header">
        <h2>快手投放</h2>
        <p>玛丽黛佳快手磁力引擎 · 完播率/CPM/下单转化 · {d.totalPlans}个计划/{d.materialCount}条视频 · 完播率{d.completionRate}% · AI视频优化</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="VideoCompletion-Predictor" color="#ec4899" />
          <ModelBadge name="BidOptimizer-DQN" color="#f97316" />
          <ModelBadge name="LiveGMV-LSTM" color="#e8365d" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
          <ModelBadge name="CreativeFatigue-MAB" color="#8b5cf6" />
        </div>

        {/* ── AI决策中心 · 快手执行状态 ── */}
        {(() => {
          const kuaishouDecisions = [
            { id: 'DC-008', title: '素材疲劳检测，自动轮换3组新素材', confidence: 88, status: '已完成', model: 'CreativeFatigue-MAB', impact: 'CTR恢复+18%', time: '11:30' },
            { id: 'DC-011', title: '直播间高峰期实时提价，保量曝光', confidence: 92, status: '执行中', model: 'BidOptimizer-DQN', impact: 'GMV+¥15,000', time: '11:20' },
            { id: 'DC-014', title: '视频完播率下滑，建议替换开头3秒', confidence: 83, status: '待确认', model: 'VideoCompletion-Predictor', impact: '预估完播率+12%', time: '11:05' },
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 快手执行状态</span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 7, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>快手磁力</span>
                </div>
                <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.65rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部 →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {kuaishouDecisions.map(d => (
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

        {/* 消耗大盘 */}
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
          <div className="card" style={{ borderTop: `3px solid ${d.roi >= 3.0 ? '#22c55e' : '#f59e0b'}` }}>
            <div className="card-title"><Target size={13} style={{ display: 'inline' }} /> 整体ROI</div>
            <div className="card-value" style={{ color: d.roi >= 3.0 ? '#22c55e' : '#f59e0b' }}>{d.roi}</div>
            <div className="card-change positive">较昨日 {d.roi >= d.yesterdayROI ? '+' : ''}{((d.roi - d.yesterdayROI) / d.yesterdayROI * 100).toFixed(1)}%</div>
          </div>
          <div className="card" style={{ borderTop: `3px solid ${d.completionRate >= 65 ? '#22c55e' : '#f59e0b'}` }}>
            <div className="card-title"><Play size={13} style={{ display: 'inline' }} /> 完播率</div>
            <div className="card-value" style={{ color: d.completionRate >= 65 ? '#22c55e' : '#f59e0b' }}>{d.completionRate}%</div>
            <div className="card-change positive">下单转化 {d.orderConvRate}%</div>
          </div>
          <div className="card" style={{ borderTop: `3px solid ${d.planSurvivalRate >= 55 ? '#22c55e' : '#f59e0b'}` }}>
            <div className="card-title"><Activity size={13} style={{ display: 'inline' }} /> 计划存活率</div>
            <div className="card-value">{d.planSurvivalRate}%</div>
            <div className="card-change positive">{d.activePlans}活跃 / {d.totalPlans}总</div>
          </div>
        </div>

        {/* 二级指标 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: '平均CPM', value: `¥${d.avgCPM}`, color: '#e8365d' },
            { label: '学习期计划', value: `${d.learningPlans}`, color: '#f59e0b' },
            { label: '素材首日跑量', value: `${d.firstDaySpendRate}%`, color: d.firstDaySpendRate >= 40 ? '#22c55e' : '#f59e0b' },
            { label: '健康账户', value: `${d.healthyAccounts}/${d.accountCount}`, color: '#22c55e' },
            { label: '今日新视频', value: `${d.newToday}`, color: '#e8365d' },
            { label: '下单转化率', value: `${d.orderConvRate}%`, color: '#f59e0b' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>消耗×GMV趋势</button>
          <button className={`tab ${tab === 'videos' ? 'active' : ''}`} onClick={() => setTab('videos')}>视频投放看板</button>
          <button className={`tab ${tab === 'videotypes' ? 'active' : ''}`} onClick={() => setTab('videotypes')}>视频类型分析</button>
          <button className={`tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
            投放预警 {alerts.filter(a => a.severity === 'high').length > 0 &&
              <span style={{ marginLeft: 4, padding: '1px 6px', borderRadius: 8, background: '#ef4444', color: 'white', fontSize: '0.6rem' }}>{alerts.filter(a => a.severity === 'high').length}</span>}
          </button>
          <button className={`tab ${tab === 'ai-auto' ? 'active' : ''}`} onClick={() => setTab('ai-auto')}>
            <Cpu size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />AI自动投放
          </button>
        </div>

        {/* Tab 1: 趋势 */}
        {tab === 'dashboard' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title"><BarChart3 size={16} /> 每日消耗 & GMV趋势</div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area yAxisId="right" type="monotone" dataKey="gmv" stroke="#34d399" fill="rgba(52,211,153,0.1)" strokeWidth={2} name="GMV" />
                  <Area yAxisId="left" type="monotone" dataKey="spend" stroke="#e8365d" fill="rgba(232,54,93,0.08)" strokeWidth={2} name="消耗" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="card" style={{ flex: 1 }}>
                <div className="section-title"><Play size={16} /> 完播率趋势</div>
                <ResponsiveContainer width="100%" height={115}>
                  <AreaChart data={dailyTrend}>
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} domain={[60, 80]} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="completionRate" stroke="#e8365d" fill="rgba(232,54,93,0.1)" strokeWidth={2} name="完播率%" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="card" style={{ flex: 1 }}>
                <div className="section-title"><Eye size={16} /> 消耗分布</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <PieChart width={80} height={80}>
                    <Pie data={spendDistribution} cx={35} cy={35} innerRadius={20} outerRadius={35} dataKey="value" paddingAngle={2}>
                      {spendDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div style={{ flex: 1 }}>
                    {spendDistribution.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 2, background: s.color }} />
                        <span style={{ fontSize: '0.72rem', flex: 1 }}>{s.name}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>¥{(s.value / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 视频看板 */}
        {tab === 'videos' && (
          <>
            {videoProducts.map((v, idx) => (
              <div key={idx} className="card" onClick={() => setSelectedVideo(v)} style={{
                marginBottom: 10,
                borderLeft: `4px solid ${v.status === 'scaling' ? '#22c55e' : v.status === 'stable' ? '#60a5fa' : v.status === 'learning' ? '#f59e0b' : '#ef4444'}`,
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Video size={16} color="#e8365d" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{v.name}</span>
                  <span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontSize: '0.58rem' }}>{v.videoType}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>时长: {v.duration}s · 产品: {v.product}</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>CPM ¥{v.cpm}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600,
                      background: v.status === 'scaling' ? 'rgba(34,197,94,0.1)' : v.status === 'stable' ? 'rgba(96,165,250,0.1)' : v.status === 'learning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: v.status === 'scaling' ? '#16a34a' : v.status === 'stable' ? '#60a5fa' : v.status === 'learning' ? '#f59e0b' : '#ef4444'
                    }}>
                      {v.status === 'scaling' ? '放量中' : v.status === 'stable' ? '稳定' : v.status === 'learning' ? '起量中' : '下滑'}
                    </span>
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4, marginBottom: 6 }}>
                  {[
                    { label: '日消耗', value: `¥${(v.todaySpend / 10000).toFixed(1)}万` },
                    { label: '日GMV', value: `¥${(v.todayGMV / 10000).toFixed(1)}万` },
                    { label: 'ROI', value: `${v.roi}`, color: v.roi >= 3.0 ? '#22c55e' : '#f59e0b' },
                    { label: '完播率', value: `${v.completionRate}%`, color: v.completionRate >= 68 ? '#22c55e' : '#f59e0b' },
                    { label: '点击率', value: `${v.clickRate}%`, color: v.clickRate >= 4.0 ? '#22c55e' : '#f59e0b' },
                    { label: '下单转化', value: `${v.convRate}%`, color: v.convRate >= 3.8 ? '#22c55e' : '#f59e0b' },
                    { label: '日订单', value: `${(v.orders / 1000).toFixed(1)}K` },
                    { label: '客单价', value: `¥${v.avgOrderValue}` },
                    { label: '计划存活', value: `${v.planSurvivalRate}%`, color: v.planSurvivalRate >= 55 ? '#22c55e' : '#f59e0b' },
                  ].map((kpi, i) => (
                    <div key={i} style={{ padding: 4, background: 'var(--bg-primary)', borderRadius: 4, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: kpi.color || 'var(--text-primary)' }}>{kpi.value}</div>
                      <div style={{ fontSize: '0.48rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Top视频: {v.topVideo} 播放{(v.topVideoViews / 10000).toFixed(0)}万
                    | 渠道: {Object.entries(v.channels).map(([k, val]) => `${k}${val}%`).join(' ')}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#e8365d', whiteSpace: 'nowrap', marginLeft: 8 }}>查看详情 →</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tab 3: 视频类型分析 */}
        {tab === 'videotypes' && (
          <div>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>快手美妆视频类型分析</strong>：不同类型视频适合不同产品和营销目标。<strong>试色视频</strong>完播率最高转化最好，适合彩妆；<strong>对比测评</strong>适合底妆/护肤；<strong>变美挑战</strong>互动性强但CPM较高。AI根据产品特性智能匹配最优视频类型。
              </div>
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="section-title"><BarChart3 size={16} /> 各类型ROI对比</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={videoTypeAnalysis} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 4]} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="avgROI" fill="#e8365d" name="平均ROI" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="section-title"><Play size={16} /> 完播率 & CPM对比</div>
                <table className="data-table">
                  <thead>
                    <tr><th>类型</th><th>完播率</th><th>CPM</th><th>适合产品</th></tr>
                  </thead>
                  <tbody>
                    {videoTypeAnalysis.map((vt, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{vt.type}</td>
                        <td style={{ color: vt.avgCompletionRate >= 70 ? '#22c55e' : '#f59e0b' }}>{vt.avgCompletionRate}%</td>
                        <td style={{ color: vt.avgCPM < 40 ? '#22c55e' : '#f59e0b' }}>¥{vt.avgCPM}</td>
                        <td style={{ fontSize: '0.7rem' }}>{vt.bestProduct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 投放预警 */}
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

        {/* Tab 5: AI自动投放 */}
        {tab === 'ai-auto' && (
          <div>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>AI自动投放闭环</strong>：AI智能体全程接管快手磁力引擎投放，包括视频质量评分、完播率监控、CPM自动调价、低效视频替换。今日AI操作<strong>165次</strong>，完播率较昨日提升<strong>+0.5%</strong>。
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'AI今日操作', value: '165次', color: '#e8365d' },
                { label: '自动建计划', value: '24个', color: '#ff7a95' },
                { label: '视频素材替换', value: '12条', color: '#34d399' },
                { label: '人工干预率', value: '1.8%', color: '#60a5fa' },
              ].map((m, i) => (
                <div key={i} className="card" style={{ textAlign: 'center', padding: 14 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="section-title"><Bot size={16} /> AI操作日志</div>
              {[
                { time: '11:45', action: 'AI扩量唇釉试色视频+30%预算 → ROI 3.5→3.66, 完播率72.5%', confidence: 94 },
                { time: '11:38', action: 'AI优化眼影盘视频Hook → 前3秒吸睛度提升，预计完播率+5%', confidence: 90 },
                { time: '11:30', action: 'AI关停高光修容低效计划6个 → ROI<2.0，节省¥4.2K', confidence: 97 },
                { time: '11:22', action: 'AI触发粉底液视频素材替换 → 点击率下滑至3.8%', confidence: 88 },
                { time: '11:15', action: 'AI调整睫毛膏出价策略 → 最低成本→目标成本，CPC降18%', confidence: 82 },
                { time: '11:08', action: 'AI卸妆水视频扩展直播前贴片 → 直播间引流+22%', confidence: 92 },
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

        {/* Video Detail Modal */}
        {selectedVideo && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelectedVideo(null)}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, width: 520, maxHeight: '80vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: '#e8365d' }}>{selectedVideo.name} 详情</h3>
                <button onClick={() => setSelectedVideo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: '日消耗', value: `¥${(selectedVideo.todaySpend / 10000).toFixed(1)}万` },
                  { label: '日GMV', value: `¥${(selectedVideo.todayGMV / 10000).toFixed(1)}万` },
                  { label: 'ROI', value: `${selectedVideo.roi}` },
                  { label: '完播率', value: `${selectedVideo.completionRate}%` },
                  { label: 'CPM', value: `¥${selectedVideo.cpm}` },
                  { label: '下单转化', value: `${selectedVideo.convRate}%` },
                ].map((m, i) => (
                  <div key={i} style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Top视频：{selectedVideo.topVideo} 播放{(selectedVideo.topVideoViews / 10000).toFixed(0)}万</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>渠道分配：{Object.entries(selectedVideo.channels).map(([k, val]) => `${k} ${val}%`).join(' | ')}</div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
