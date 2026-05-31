import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, TrendingUp, DollarSign, Download, Bot, Brain, Cpu, Zap,
  Target, Users, Activity, BarChart3, AlertTriangle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ===== 抖音巨量投放核心：ROI回收模型 + AI自动投放闭环 =====
// 美妆投放获客模式：消耗预算→触达目标消费者→点击跳转购买→GMV≥消耗=正ROI
// 核心公式：投放ROI = GMV / 广告消耗
// 转化周期：点击→加购→下单→支付→确认收货
// 种草系数：广告带来的自然搜索和口碑转化比例
// AI闭环：素材生产→自动建计划→智能出价→效果反馈→闭环学习

// ===== 消耗大盘 =====
const spendDashboard = {
  todaySpend: 380000, yesterdaySpend: 362000,
  todayOrders: 14200, yesterdayOrders: 13500,
  avgCPA: 26.8, yesterdayCPA: 26.8,
  roi: 3.42, yesterdayROI: 3.28,
  gmv: 1240000, yesterdayGMV: 1186000,
  totalPlans: 285, activePlans: 165, learningPlans: 38, deadPlans: 82,
  planSurvivalRate: 57.9,
  materialCount: 220, newToday: 18, firstDaySpendRate: 42.0,
  accountCount: 12, healthyAccounts: 10, warningAccounts: 2,
  grassIndex: 92, // 种草指数
}

// ===== 美妆产品投放看板 =====
const beautyProducts = [
  {
    name: '唇釉丝绒系列', category: '唇部', line: '经典系列',
    sku: 'LR-2024-VL', colors: 8,
    todaySpend: 85000, todayGMV: 312000, roi: 3.67, cpa: 22.5,
    orders: 3820, convRate: 4.8,
    d1Retention: 38, repeatPurchaseRate: 28,
    totalPlans: 68, activePlans: 42, planSurvivalRate: 61.8,
    materialsActive: 45, firstDaySpendRate: 48,
    topCreative: '口红试色对比 真实感', topCreativeCPA: 18.5,
    grassIndex: 95, searchLift: 32,
    status: 'scaling' as const,
    channels: { 抖音信息流: 55, 抖音搜索: 25, 抖音直播: 20 },
  },
  {
    name: '眼影盘星空', category: '眼部', line: '限定系列',
    sku: 'EY-2024-SK', colors: 12,
    todaySpend: 62000, todayGMV: 218000, roi: 3.52, cpa: 28.2,
    orders: 2480, convRate: 4.2,
    d1Retention: 42, repeatPurchaseRate: 32,
    totalPlans: 52, activePlans: 32, planSurvivalRate: 61.5,
    materialsActive: 38, firstDaySpendRate: 45,
    topCreative: '眼影盘开箱试色教程', topCreativeCPA: 24.0,
    grassIndex: 88, searchLift: 25,
    status: 'scaling' as const,
    channels: { 抖音信息流: 48, 抖音搜索: 30, 抖音直播: 22 },
  },
  {
    name: '粉底液水光', category: '底妆', line: '主打系列',
    sku: 'FD-2024-WG', colors: 15,
    todaySpend: 75000, todayGMV: 235000, roi: 3.13, cpa: 32.0,
    orders: 2650, convRate: 3.8,
    d1Retention: 35, repeatPurchaseRate: 22,
    totalPlans: 65, activePlans: 32, planSurvivalRate: 49.2,
    materialsActive: 28, firstDaySpendRate: 32,
    topCreative: '粉底液遮瑕力实测', topCreativeCPA: 28.5,
    grassIndex: 82, searchLift: 18,
    status: 'stable' as const,
    channels: { 抖音信息流: 60, 抖音搜索: 28, 抖音直播: 12 },
  },
  {
    name: '睫毛膏纤长', category: '眼部', line: '经典系列',
    sku: 'MA-2024-EL', colors: 3,
    todaySpend: 42000, todayGMV: 125000, roi: 2.98, cpa: 35.0,
    orders: 1580, convRate: 3.2,
    d1Retention: 28, repeatPurchaseRate: 18,
    totalPlans: 38, activePlans: 20, planSurvivalRate: 52.6,
    materialsActive: 22, firstDaySpendRate: 38,
    topCreative: '睫毛膏纤长效果对比', topCreativeCPA: 30.0,
    grassIndex: 78, searchLift: 15,
    status: 'learning' as const,
    channels: { 抖音信息流: 65, 抖音搜索: 25, 抖音直播: 10 },
  },
  {
    name: '卸妆水温和', category: '卸妆', line: '温和系列',
    sku: 'CL-2024-GL', colors: 1,
    todaySpend: 52000, todayGMV: 148000, roi: 2.85, cpa: 38.5,
    orders: 1680, convRate: 3.5,
    d1Retention: 32, repeatPurchaseRate: 35,
    totalPlans: 42, activePlans: 22, planSurvivalRate: 52.4,
    materialsActive: 18, firstDaySpendRate: 35,
    topCreative: '敏感肌卸妆温和测评', topCreativeCPA: 32.0,
    grassIndex: 72, searchLift: 12,
    status: 'stable' as const,
    channels: { 抖音信息流: 50, 抖音搜索: 35, 抖音直播: 15 },
  },
  {
    name: '高光修容盘', category: '修容', line: '限定系列',
    sku: 'HL-2024-GW', colors: 5,
    todaySpend: 35000, todayGMV: 98000, roi: 2.80, cpa: 42.0,
    orders: 980, convRate: 2.8,
    d1Retention: 25, repeatPurchaseRate: 20,
    totalPlans: 22, activePlans: 10, planSurvivalRate: 45.5,
    materialsActive: 12, firstDaySpendRate: 28,
    topCreative: '高光修容日常妆教程', topCreativeCPA: 38.0,
    grassIndex: 68, searchLift: 10,
    status: 'declining' as const,
    channels: { 抖音信息流: 55, 抖音搜索: 30, 抖音直播: 15 },
  },
]

// ===== ROI回收曲线 =====
const roiCurve = [
  { day: 'D1', roi: 2.85, target: 2.5 },
  { day: 'D3', roi: 3.12, target: 2.8 },
  { day: 'D7', roi: 3.42, target: 3.0 },
  { day: 'D14', roi: 3.68, target: 3.2 },
  { day: 'D30', roi: 3.95, target: 3.5 },
  { day: 'D60', roi: 4.12, target: 3.8 },
  { day: 'D90', roi: 4.35, target: 4.0 },
]

// ===== 消耗趋势 =====
const dailyTrend = [
  { date: '03/28', spend: 330000, gmv: 1080000, roi: 3.27, orders: 12200 },
  { date: '03/29', spend: 345000, gmv: 1120000, roi: 3.25, orders: 12600 },
  { date: '03/30', spend: 352000, gmv: 1155000, roi: 3.28, orders: 12900 },
  { date: '03/31', spend: 358000, gmv: 1180000, roi: 3.30, orders: 13200 },
  { date: '04/01', spend: 362000, gmv: 1186000, roi: 3.28, orders: 13500 },
  { date: '04/02', spend: 368000, gmv: 1210000, roi: 3.29, orders: 13800 },
  { date: '04/03', spend: 380000, gmv: 1240000, roi: 3.42, orders: 14200 },
]

// ===== 品类投放特征 =====
const categoryCharacteristics = [
  { category: '唇部', avgCPA: 22.5, convRate: 4.8, repeatRate: 28, bestChannel: '抖音信息流', volume: '高', difficulty: '低', note: 'CPA低量大，试色视频效果好，复购率中等' },
  { category: '眼部', avgCPA: 28.2, convRate: 4.2, repeatRate: 32, bestChannel: '抖音搜索', volume: '中', difficulty: '中', note: 'CPA中等，教程类内容转化好，忠实用户多' },
  { category: '底妆', avgCPA: 32.0, convRate: 3.8, repeatRate: 22, bestChannel: '抖音直播', volume: '中', difficulty: '中', note: '色号选择复杂，试色+遮瑕测评素材最佳' },
  { category: '卸妆', avgCPA: 38.5, convRate: 3.5, repeatRate: 35, bestChannel: '抖音搜索', volume: '低', difficulty: '中', note: '复购率高，敏感肌成分党种草效果好' },
  { category: '修容', avgCPA: 42.0, convRate: 2.8, repeatRate: 20, bestChannel: '抖音信息流', volume: '低', difficulty: '高', note: 'CPA最高，教程视频吸引初学者，技巧感强' },
]

// ===== 品类雷达 =====
const categoryRadar = [
  { category: '唇部', cpaEfficiency: 90, convRate: 90, roi: 85, volume: 95, grassIndex: 92 },
  { category: '眼部', cpaEfficiency: 78, convRate: 82, roi: 82, volume: 75, grassIndex: 88 },
  { category: '底妆', cpaEfficiency: 68, convRate: 72, roi: 75, volume: 72, grassIndex: 82 },
  { category: '卸妆', cpaEfficiency: 55, convRate: 65, roi: 68, volume: 55, grassIndex: 72 },
  { category: '修容', cpaEfficiency: 42, convRate: 52, roi: 60, volume: 40, grassIndex: 68 },
]

// ===== 投放预警 =====
const alerts = [
  { type: 'ROI下滑', severity: 'high' as const, product: '高光修容盘', detail: 'D7 ROI仅2.80（目标3.0），当前曲线难以达标，预计亏损¥12K', action: 'AI建议暂停低效计划，聚焦高ROI素材，或推人工评估是否调整出价策略', agentConfidence: 55 },
  { type: 'CPA飙升', severity: 'high' as const, product: '粉底液水光', detail: '粉底液CPA从¥28→¥32(+14%)，竞品加大投放导致流量成本上升', action: 'AI已将底妆预算降20%，转向精准人群（成分党/颜值党），计划存活率仅49%需补新计划', agentConfidence: 72 },
  { type: '素材衰退', severity: 'medium' as const, product: '唇釉丝绒', detail: 'Top素材"口红试色"已跑6天，CTR从6.8%降至4.5%，预计2天内跌破阈值', action: 'AI已触发3条替换素材（新色试色/节日限定/对比测评），1条已通过审核', agentConfidence: 90 },
  { type: '起量困难', severity: 'medium' as const, product: '睫毛膏纤长', detail: '新品上线9天，38个计划仅20个存活(52.6%)，日消耗¥4.2万远低于¥8万目标', action: 'AI建议从"控成本"切换到"最大转化量"出价，加速通过学习期', agentConfidence: 80 },
  { type: '种草指数偏低', severity: 'low' as const, product: '高光修容盘', detail: '修容品类种草指数68，低于品牌平均80，自然搜索提升仅10%', action: 'AI建议增加教程类内容比例，联动小红书种草，提升品类认知', agentConfidence: 82 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

export default function GameAds() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'dashboard' | 'products' | 'roi' | 'categories' | 'alerts' | 'ai-auto'>('dashboard')

  // AI规则配置 - 使用共享AIConfigPanel
  const douyinAIGroups: AIConfigGroup[] = [
    {
      title: '抖音投放核心',
      icon: <Target size={16} />,
      params: [
        createParam('roi_target', 'ROI目标值', 3.2, '', '所有抖音计划的最低ROI安全线，低于阈值的计划将被标记为低效', 3.0, 89, { min: 1.5, max: 8.0, step: 0.1, learningDataPoints: 58300, adjustHistory: [
          { time: '3小时前', from: '3.0', to: '3.2', reason: '近期美妆品类ROI持续走高，AI上调目标值' },
          { time: '2天前', from: '3.5', to: '3.0', reason: '新品冷启动期，AI降低阈值适应学习期' },
          { time: '5天前', from: '3.0', to: '3.5', reason: '唇釉系列ROI持续走高，AI提升整体目标' },
        ] }),
        createParam('bid_ceiling', '出价上限', 45, '¥', '单次转化出价上限（CPA出价），防止过高出价导致ROI亏损', 42, 91, { min: 15, max: 120, step: 1, autoTuneEnabled: false, learningDataPoints: 45200, adjustHistory: [
          { time: '昨日', from: '42', to: '45', reason: '新品推广期，手动放宽出价上限' },
          { time: '1周前', from: '50', to: '42', reason: '月末预算收紧，手动降低出价上限' },
        ] }),
        createParam('audience_precision', '人群定向精度', 3, '级', '1=宽泛/2=均衡/3=精准/4=超精准，精度越高CPA越低但量级越小', 3, 87, { min: 1, max: 4, step: 1, autoTuneEnabled: false, learningDataPoints: 38900, adjustHistory: [
          { time: '3天前', from: '2', to: '3', reason: '泛流量ROI偏低，手动收紧人群精度' },
          { time: '2周前', from: '4', to: '2', reason: '精准人群量级不足，手动放宽定向' },
        ] }),
        createParam('creative_rotation', '素材轮换频率', 5, '天', '美妆素材投放超过此天数CTR自然衰减，标记为疲劳并触发替换', 4, 84, { min: 2, max: 14, step: 1, learningDataPoints: 44600, adjustHistory: [
          { time: '昨日', from: '4', to: '5', reason: '新上线高质量试色视频衰减较慢，AI延长疲劳周期' },
          { time: '3天前', from: '7', to: '4', reason: '快速消费内容衰减快，AI缩短疲劳周期' },
        ] }),
        createParam('scale_success_time', '起量成功判定时间', 24, '小时', '新投放计划上线后积累足够数据判定起量是否成功的等待窗口', 18, 80, { min: 6, max: 72, step: 6, learningDataPoints: 22100, adjustHistory: [
          { time: '2天前', from: '18', to: '24', reason: '判定窗口太短导致误杀潜力计划，AI延长等待时间' },
          { time: '1周前', from: '48', to: '18', reason: '等待时间过长浪费预算，AI缩短判定窗口' },
        ] }),
      ],
    },
    {
      title: '转化优化',
      icon: <DollarSign size={16} />,
      params: [
        createParam('conv_rate_target', '转化率目标', 4.0, '%', '点击到下单的目标转化率，低于此值触发素材/落地页优化', 4.2, 85, { min: 1.0, max: 15.0, step: 0.5, learningDataPoints: 41800, adjustHistory: [
          { time: '昨日', from: '3.5', to: '4.0', reason: '落地页优化后转化率提升，AI上调目标' },
          { time: '4天前', from: '5.0', to: '3.5', reason: '新SKU冷启动，AI分品类下调目标' },
        ] }),
        createParam('gmv_target', 'GMV日目标', 1200000, '¥', '抖音渠道每日GMV目标，影响预算分配策略', 1150000, 82, { min: 500000, max: 5000000, step: 50000, learningDataPoints: 28600, adjustHistory: [
          { time: '3天前', from: '1100000', to: '1200000', reason: '唇釉系列热销，AI上调GMV目标' },
          { time: '1周前', from: '1400000', to: '1100000', reason: '新品期减少旗舰品预算，AI降低目标' },
        ] }),
        createParam('repeat_purchase_boost', '复购促进系数', 1.3, 'x', '对已购买用户的再营销出价倍数，复购成本更低ROI更高', 1.25, 88, { min: 1.0, max: 3.0, step: 0.1, learningDataPoints: 35400, adjustHistory: [
          { time: '2天前', from: '1.2', to: '1.3', reason: '复购用户LTV高，AI提高复购促进倍数' },
          { time: '5天前', from: '1.5', to: '1.2', reason: '复购人群已饱和，AI降低倍数' },
        ] }),
        createParam('basket_size_target', '客单价目标', 280, '¥', '目标客单价，影响商品组合推广策略', 265, 76, { min: 100, max: 800, step: 10, autoTuneEnabled: false, learningDataPoints: 15200, adjustHistory: [
          { time: '1周前', from: '250', to: '280', reason: '套装销售提升客单价，手动上调目标' },
        ] }),
      ],
    },
    {
      title: '素材与人群',
      icon: <Users size={16} />,
      params: [
        createParam('ctr_threshold', 'CTR最低阈值', 4.5, '%', '美妆素材CTR低于此值触发预警和替换流程', 4.0, 84, { min: 1.0, max: 12.0, step: 0.5, learningDataPoints: 44600, adjustHistory: [
          { time: '昨日', from: '4.0', to: '4.5', reason: '当前素材库质量提升，AI提高CTR基线' },
          { time: '3天前', from: '6.0', to: '4.0', reason: '新品测试期接受更多素材尝试，AI降低阈值' },
        ] }),
        createParam('audience_expand', '相似受众扩展系数', 3, '%', '基于高价值用户的相似扩展范围，越大覆盖越广但精准度越低', 5, 79, { min: 1, max: 10, step: 1, learningDataPoints: 21300, adjustHistory: [
          { time: '2天前', from: '5', to: '3', reason: '扩展范围过大导致用户质量下降，AI收缩扩展系数' },
          { time: '1周前', from: '2', to: '5', reason: '精准受众消耗殆尽，AI扩大扩展范围' },
        ] }),
        createParam('ab_min_sample', 'A/B测试最小样本量', 1200, '次曝光', '美妆素材A/B测试需达到此曝光量才出统计结论', 1500, 90, { min: 300, max: 5000, step: 100, learningDataPoints: 52800, adjustHistory: [
          { time: '3天前', from: '800', to: '1200', reason: '小样本导致胜出素材上线后效果反转，AI提升最小样本量' },
          { time: '1周前', from: '2000', to: '800', reason: '测试周期过长影响素材迭代速度，AI降低样本要求' },
        ] }),
        createParam('creative_diversity', '创意多样性阈值', 0.7, '分', '同一产品在投素材的风格多样性评分最低要求，防止素材同质化', 0.75, 81, { min: 0.3, max: 1.0, step: 0.05, learningDataPoints: 18900, adjustHistory: [
          { time: '2天前', from: '0.6', to: '0.7', reason: '素材同质化导致CTR整体下降，AI提升多样性要求' },
          { time: '5天前', from: '0.8', to: '0.6', reason: '过度多样化导致品牌调性模糊，AI降低阈值' },
        ] }),
      ],
    },
    {
      title: '平台竞价策略',
      icon: <BarChart3 size={16} />,
      params: [
        createParam('bid_strategy', '抖音出价策略', '目标成本', '', '抖音巨量引擎出价策略：最低成本适合探索，目标成本适合稳定期，最大转化适合冲量', 'AI动态', 94, { type: 'select', options: ['最低成本', '目标成本', '最大转化', 'AI动态'], learningDataPoints: 71200, adjustHistory: [
          { time: '2小时前', from: '目标成本', to: 'AI动态', reason: 'AI检测到转化率波动加大，切换动态策略自动适应' },
          { time: '昨日', from: 'AI动态', to: '目标成本', reason: '唇釉系列稳定投放期，AI切换目标成本策略控制CPA' },
          { time: '3天前', from: '最低成本', to: 'AI动态', reason: '新品冷启动完成，AI从最低成本切换至动态策略' },
        ] }),
        createParam('search_bid_multiplier', '搜索广告出价倍数', 1.2, 'x', '搜索广告相对信息流的出价倍数，搜索用户购买意向更强', 1.15, 92, { min: 0.5, max: 3.0, step: 0.1, learningDataPoints: 55800, adjustHistory: [
          { time: '昨日', from: '1.1', to: '1.2', reason: '搜索词ROI更高，AI提升搜索出价倍数' },
          { time: '4天前', from: '1.5', to: '1.1', reason: '搜索量级不足，AI降低倍数' },
        ] }),
        createParam('live_budget_ratio', '直播广告预算占比', 20, '%', '投向直播间广告的预算比例，直播带货直接引流下单', 18, 88, { min: 5, max: 50, step: 5, learningDataPoints: 38400, adjustHistory: [
          { time: '3天前', from: '15', to: '20', reason: '直播ROI提升，AI上调直播预算占比' },
          { time: '1周前', from: '25', to: '15', reason: '直播场次减少，AI降低直播预算' },
        ] }),
        createParam('cross_platform_budget', '跨平台预算自动调拨', '关闭', '', '在抖音/小红书/快手之间自动调拨预算：保守(5%上限), 均衡(15%), 激进(30%)', '均衡', 86, { type: 'select', options: ['关闭', '保守', '均衡', '激进'], autoTuneEnabled: false, learningDataPoints: 25600, adjustHistory: [
          { time: '5天前', from: '均衡', to: '关闭', reason: '跨平台调拨导致单平台学习数据不足，手动关闭' },
          { time: '2周前', from: '关闭', to: '均衡', reason: '抖音效果突然恶化，手动开启跨平台调拨' },
        ] }),
      ],
    },
  ]

  const douyinLearningStatus: AILearningStatus = {
    modelVersion: 'v3.2.0-douyin',
    lastTraining: '1小时前',
    totalDataPoints: 428000,
    avgConfidence: 89,
    autoAdjustCount24h: 248,
    learningRate: '0.0008 (AdamW)',
    nextTraining: '3小时后',
    improvementRate: '+12.4%',
  }
  useRegisterAIConfig(douyinAIGroups, douyinLearningStatus, '抖音投放')
  const [selectedProduct, setSelectedProduct] = useState<typeof beautyProducts[0] | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<typeof categoryCharacteristics[0] | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null)
  const d = spendDashboard
  const spendChange = ((d.todaySpend - d.yesterdaySpend) / d.yesterdaySpend * 100)
  const gmvChange = ((d.gmv - d.yesterdayGMV) / d.yesterdayGMV * 100)
  const roiChange = ((d.roi - d.yesterdayROI) / d.yesterdayROI * 100)

  return (
    <>
      <div className="page-header">
        <h2>抖音投放</h2>
        <p>玛丽黛佳抖音巨量引擎 · ROI+GMV+转化率 · {d.totalPlans}个计划/{d.materialCount}条素材 · 种草指数{d.grassIndex} · 智能出价闭环</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
          <ModelBadge name="CVR-Predictor-ESMM" color="#e8365d" />
          <ModelBadge name="BidOptimizer-DQN" color="#f97316" />
          <ModelBadge name="Lookalike-Expander" color="#06b6d4" />
          <ModelBadge name="SearchQuery-Optimizer" color="#10b981" />
        </div>

        {/* ── AI决策中心 · 抖音执行状态 ── */}
        {(() => {
          const douyinDecisions = [
            { id: 'DC-001', title: '底妆CPA飙升，降出价15%', confidence: 94, status: '执行中', model: 'BidOptimizer-DQN', impact: '节省¥3,200/日', time: '11:45' },
            { id: 'DC-005', title: '爆品素材达到疲劳阈值，触发A/B换组', confidence: 88, status: '已完成', model: 'CreativeFatigue-MAB', impact: 'CTR恢复+18%', time: '11:30' },
            { id: 'DC-015', title: '21-23点黄金时段预算加码30%', confidence: 89, status: '执行中', model: 'TrafficPacing-RL', impact: 'ROI+0.3x', time: '11:00' },
            { id: 'DC-019', title: '唇釉新色号冷启动计划审批通过', confidence: 85, status: '待确认', model: 'NewSKU-ColdStart', impact: '目标人群42万', time: '10:50' },
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 抖音执行状态</span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 7, background: 'rgba(232,54,93,0.15)', color: '#e8365d' }}>抖音巨量</span>
                </div>
                <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.65rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部 →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {douyinDecisions.map(d => (
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
            <div className="card-title"><DollarSign size={13} style={{ display: 'inline' }} /> 今日广告消耗</div>
            <div className="card-value">¥{(d.todaySpend / 10000).toFixed(1)}万</div>
            <div className={`card-change ${spendChange >= 0 ? 'positive' : 'negative'}`}>
              {spendChange >= 0 ? '+' : ''}{spendChange.toFixed(1)}% vs 昨日
            </div>
          </div>
          <div className="card" style={{ borderTop: '3px solid #34d399' }}>
            <div className="card-title"><TrendingUp size={13} style={{ display: 'inline' }} /> 今日GMV</div>
            <div className="card-value">¥{(d.gmv / 10000).toFixed(0)}万</div>
            <div className="card-change positive">+{gmvChange.toFixed(1)}%</div>
          </div>
          <div className="card" style={{ borderTop: `3px solid ${d.roi >= 3.0 ? '#22c55e' : '#f59e0b'}` }}>
            <div className="card-title"><Target size={13} style={{ display: 'inline' }} /> 整体ROI</div>
            <div className="card-value" style={{ color: d.roi >= 3.0 ? '#22c55e' : '#f59e0b' }}>{d.roi}</div>
            <div className={`card-change ${roiChange >= 0 ? 'positive' : 'negative'}`}>{roiChange >= 0 ? '+' : ''}{roiChange.toFixed(1)}% vs 昨日</div>
          </div>
          <div className="card" style={{ borderTop: '3px solid #60a5fa' }}>
            <div className="card-title"><Download size={13} style={{ display: 'inline' }} /> 今日订单</div>
            <div className="card-value">{(d.todayOrders / 1000).toFixed(1)}K</div>
            <div className="card-change positive">转化率 3.9%</div>
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
            { label: '种草指数', value: `${d.grassIndex}`, color: '#e8365d' },
            { label: '学习期计划', value: `${d.learningPlans}`, color: '#f59e0b' },
            { label: '素材首日跑量', value: `${d.firstDaySpendRate}%`, color: d.firstDaySpendRate >= 40 ? '#22c55e' : '#f59e0b' },
            { label: '健康账户', value: `${d.healthyAccounts}/${d.accountCount}`, color: '#22c55e' },
            { label: '今日新素材', value: `${d.newToday}`, color: '#e8365d' },
            { label: '平均CPA', value: `¥${d.avgCPA}`, color: '#f59e0b' },
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
          <button className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>产品投放看板</button>
          <button className={`tab ${tab === 'roi' ? 'active' : ''}`} onClick={() => setTab('roi')}>ROI周期分析</button>
          <button className={`tab ${tab === 'categories' ? 'active' : ''}`} onClick={() => setTab('categories')}>品类投放特征</button>
          <button className={`tab ${tab === 'alerts' ? 'active' : ''}`} onClick={() => setTab('alerts')}>
            投放预警 {alerts.filter(p => p.severity === 'high').length > 0 &&
              <span style={{ marginLeft: 4, padding: '1px 6px', borderRadius: 8, background: '#ef4444', color: 'white', fontSize: '0.6rem' }}>{alerts.filter(p => p.severity === 'high').length}</span>}
          </button>
          <button className={`tab ${tab === 'ai-auto' ? 'active' : ''}`} onClick={() => setTab('ai-auto')}>
            <Cpu size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />AI自动投放
          </button>
        </div>

        {/* Tab 1: 消耗趋势 */}
        {tab === 'dashboard' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title"><BarChart3 size={16} /> 每日消耗 & GMV趋势</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}万`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="spend" fill="#e8365d" name="消耗 ¥" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="gmv" stroke="#34d399" strokeWidth={2} name="GMV ¥" dot={{ r: 3 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="section-title"><TrendingUp size={16} /> ROI & 订单量趋势</div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[2.5, 4.0]} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line yAxisId="left" type="monotone" dataKey="roi" stroke="#e8365d" strokeWidth={2.5} name="ROI" dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} name="订单量" dot={{ r: 3 }} />
                </LineChart>
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
                  <ShoppingBag size={16} color="#e8365d" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.name}</span>
                  <span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontSize: '0.58rem' }}>{p.category}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SKU: {p.sku} · {p.colors}色</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>种草指数: {p.grassIndex} · 搜索提升+{p.searchLift}%</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600,
                      background: p.status === 'scaling' ? 'rgba(34,197,94,0.1)' : p.status === 'stable' ? 'rgba(96,165,250,0.1)' : p.status === 'learning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                      color: p.status === 'scaling' ? '#16a34a' : p.status === 'stable' ? '#60a5fa' : p.status === 'learning' ? '#f59e0b' : '#ef4444'
                    }}>
                      {p.status === 'scaling' ? '放量中' : p.status === 'stable' ? '稳定' : p.status === 'learning' ? '起量中' : '衰退'}
                    </span>
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4, marginBottom: 6 }}>
                  {[
                    { label: '日消耗', value: `¥${(p.todaySpend / 10000).toFixed(1)}万` },
                    { label: '日GMV', value: `¥${(p.todayGMV / 10000).toFixed(1)}万` },
                    { label: 'ROI', value: `${p.roi}`, color: p.roi >= 3.0 ? '#22c55e' : p.roi >= 2.5 ? '#f59e0b' : '#ef4444' },
                    { label: 'CPA', value: `¥${p.cpa}`, color: p.cpa < 30 ? '#22c55e' : p.cpa < 40 ? '#f59e0b' : '#ef4444' },
                    { label: '转化率', value: `${p.convRate}%`, color: p.convRate >= 4.0 ? '#22c55e' : '#f59e0b' },
                    { label: '复购率', value: `${p.repeatPurchaseRate}%`, color: p.repeatPurchaseRate >= 25 ? '#22c55e' : '#f59e0b' },
                    { label: '种草指数', value: `${p.grassIndex}`, color: p.grassIndex >= 85 ? '#22c55e' : '#f59e0b' },
                    { label: '计划存活', value: `${p.planSurvivalRate}%`, color: p.planSurvivalRate >= 55 ? '#22c55e' : '#f59e0b' },
                    { label: '搜索提升', value: `+${p.searchLift}%`, color: '#22c55e' },
                  ].map((kpi, i) => (
                    <div key={i} style={{ padding: 4, background: 'var(--bg-primary)', borderRadius: 4, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: kpi.color || 'var(--text-primary)' }}>{kpi.value}</div>
                      <div style={{ fontSize: '0.48rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Top素材: {p.topCreative} CPA¥{p.topCreativeCPA}
                    | 渠道: {Object.entries(p.channels).map(([k, v]) => `${k}${v}%`).join(' ')}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#e8365d', whiteSpace: 'nowrap', marginLeft: 8 }}>查看详情 →</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Tab 3: ROI周期 */}
        {tab === 'roi' && (
          <>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>美妆投放获客核心：ROI回收周期</strong>：不同于其他行业，美妆投放看的是<strong>实时ROI和复购ROI</strong>。当累计GMV/消耗≥3.0=达标。高复购品类(卸妆/护肤)D90 ROI可达4.0+，彩妆品类D30基本定型。<strong>种草系数</strong>是隐藏加分项——广告带来的自然搜索增量额外贡献GMV。
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><TrendingUp size={16} /> 全品类聚合ROI曲线</div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={roiCurve}>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 5]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="roi" stroke="#e8365d" fill="rgba(232,54,93,0.15)" strokeWidth={2.5} name="实际ROI" />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" name="目标ROI" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  粉色区域超过红色虚线(目标ROI) = 达标 | 当前D7 ROI 3.42
                </div>
              </div>
              <div className="card">
                <div className="section-title"><Users size={16} /> 各品类ROI对比</div>
                <table className="data-table">
                  <thead>
                    <tr><th>品类</th><th>平均CPA</th><th>转化率</th><th>复购率</th><th>ROI评估</th></tr>
                  </thead>
                  <tbody>
                    {categoryCharacteristics.map((c, i) => (
                      <tr key={i} onClick={() => setSelectedCategory(c)} style={{ cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}>
                        <td style={{ fontWeight: 600 }}>{c.category}</td>
                        <td style={{ color: c.avgCPA < 30 ? '#22c55e' : c.avgCPA < 40 ? '#f59e0b' : '#ef4444' }}>¥{c.avgCPA}</td>
                        <td>{c.convRate}%</td>
                        <td style={{ fontWeight: 700, color: c.repeatRate >= 30 ? '#22c55e' : c.repeatRate >= 20 ? '#f59e0b' : '#ef4444' }}>{c.repeatRate}%</td>
                        <td style={{ fontSize: '0.7rem', color: c.convRate >= 4.0 ? '#22c55e' : '#f59e0b' }}>
                          {c.convRate >= 4.0 ? 'ROI达标' : 'ROI优化中'}
                          <span style={{ color: '#e8365d', marginLeft: 4 }}>→</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab 4: 品类特征 */}
        {tab === 'categories' && (
          <>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="card">
                <div className="section-title"><BarChart3 size={16} /> 品类投放效率雷达</div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={categoryRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                    <Radar name="CPA效率" dataKey="cpaEfficiency" stroke="#e8365d" fill="rgba(232,54,93,0.2)" />
                    <Radar name="转化率" dataKey="convRate" stroke="#34d399" fill="rgba(52,211,153,0.1)" />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="section-title"><Activity size={16} /> 品类投放特征</div>
                <table className="data-table">
                  <thead>
                    <tr><th>品类</th><th>最佳渠道</th><th>量级</th><th>难度</th></tr>
                  </thead>
                  <tbody>
                    {categoryCharacteristics.map((c, i) => (
                      <tr key={i} onClick={() => setSelectedCategory(c)} style={{ cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}>
                        <td style={{ fontWeight: 600 }}>{c.category}</td>
                        <td style={{ fontSize: '0.7rem' }}>{c.bestChannel}</td>
                        <td><span style={{ color: c.volume === '高' ? '#22c55e' : c.volume === '中' ? '#f59e0b' : '#ef4444' }}>{c.volume}</span></td>
                        <td><span style={{ color: c.difficulty === '低' ? '#22c55e' : c.difficulty === '中' ? '#f59e0b' : '#ef4444' }}>{c.difficulty}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedCategory && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(232,54,93,0.05)', borderRadius: 8, fontSize: '0.75rem' }}>
                    <strong style={{ color: '#e8365d' }}>{selectedCategory.category}：</strong>{selectedCategory.note}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Tab 5: 投放预警 */}
        {tab === 'alerts' && (
          <div>
            {alerts.map((alert, i) => (
              <div key={i} className="card" style={{ marginBottom: 10, cursor: 'pointer', borderLeft: `4px solid ${alert.severity === 'high' ? '#ef4444' : alert.severity === 'medium' ? '#f59e0b' : '#60a5fa'}` }}
                onClick={() => setSelectedAlert(alert)}>
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

        {/* Tab 6: AI自动投放 */}
        {tab === 'ai-auto' && (
          <div>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>AI自动投放闭环</strong>：AI智能体全程接管抖音巨量引擎投放，包括自动建计划、智能出价、素材轮换、预算调拨、低效关停。今日AI操作<strong>248次</strong>，人工干预仅<strong>3次</strong>（干预率1.2%）。
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'AI今日操作', value: '248次', color: '#e8365d' },
                { label: '自动建计划', value: '32个', color: '#ff7a95' },
                { label: '自动关停', value: '18个', color: '#34d399' },
                { label: '人工干预率', value: '1.2%', color: '#60a5fa' },
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
                { time: '11:45', action: 'AI扩量唇釉丝绒系列+35%预算 → ROI 3.80→4.20', confidence: 94 },
                { time: '11:38', action: 'AI自动建计划3个 → 眼影盘星空 → 精准成分党人群', confidence: 92 },
                { time: '11:30', action: 'AI关停低效计划 → 高光修容ROI<2.0', confidence: 97 },
                { time: '11:22', action: 'AI跨线调拨 → 唇部+¥8K，眼部-¥3K', confidence: 89 },
                { time: '11:15', action: 'AI发现新受众 → 成分党25-34F 转化率高58%', confidence: 78 },
                { time: '11:08', action: 'AI素材替换 → 原试色视频→对比测评视频 CTR+28%', confidence: 95 },
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

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelectedProduct(null)}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, width: 520, maxHeight: '80vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: '#e8365d' }}>{selectedProduct.name} 详情</h3>
                <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: '日消耗', value: `¥${(selectedProduct.todaySpend / 10000).toFixed(1)}万` },
                  { label: '日GMV', value: `¥${(selectedProduct.todayGMV / 10000).toFixed(1)}万` },
                  { label: 'ROI', value: `${selectedProduct.roi}` },
                  { label: 'CPA', value: `¥${selectedProduct.cpa}` },
                  { label: '转化率', value: `${selectedProduct.convRate}%` },
                  { label: '种草指数', value: `${selectedProduct.grassIndex}` },
                ].map((m, i) => (
                  <div key={i} style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.label}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Top素材：{selectedProduct.topCreative} CPA¥{selectedProduct.topCreativeCPA}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>渠道分配：{Object.entries(selectedProduct.channels).map(([k, v]) => `${k} ${v}%`).join(' | ')}</div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
