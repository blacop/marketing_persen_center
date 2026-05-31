import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposedChart, Area, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Bot, TrendingUp, DollarSign, Activity, Zap,
  BookOpen, ShoppingBag, Globe, ArrowUpRight,
  Brain, Shield, Clock, X, ChevronLeft, ArrowRight
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'

const dashboardAIGroups: AIConfigGroup[] = [
  {
    title: '全局投放策略',
    icon: <Brain size={16} />,
    params: [
      createParam('global_roi', '全局ROI目标', 3.2, '', '所有产品线的最低ROI安全线', 3.0, 91, { min: 1.0, max: 8.0, step: 0.1 }),
      createParam('daily_budget_cap', '日预算总额上限', 1500000, '¥', '平台单日最大消耗预算', 1420000, 88, { min: 500000, max: 5000000, step: 50000, autoTuneEnabled: false }),
      createParam('ai_confidence_threshold', 'AI自主决策置信阈值', 85, '%', 'AI操作需达到的最低置信度，低于此值转人工', 82, 93, { min: 60, max: 99, step: 1 }),
      createParam('human_intervention_target', '人工干预率目标', 0.15, '%', '目标人工干预占比，越低代表AI自主能力越强', 0.11, 90, { min: 0, max: 5, step: 0.01 }),
    ]
  },
  {
    title: '跨产品线资源调度',
    icon: <TrendingUp size={16} />,
    params: [
      createParam('douyin_budget_ratio', '抖音预算占比', 42, '%', '抖音平台预算占总消耗比例', 40, 87, { min: 10, max: 60, step: 1 }),
      createParam('xiaohongshu_budget_ratio', '小红书预算占比', 28, '%', '小红书平台预算占总消耗比例', 30, 85, { min: 10, max: 60, step: 1 }),
      createParam('kuaishou_budget_ratio', '快手预算占比', 20, '%', '快手平台预算占总消耗比例', 18, 89, { min: 10, max: 60, step: 1 }),
      createParam('cross_line_threshold', '跨线调拨触发阈值', 15, '%', 'ROI偏差超过此值时AI自动跨线调拨', 12, 82, { min: 5, max: 30, step: 1 }),
    ]
  },
  {
    title: '平台分发策略',
    icon: <Globe size={16} />,
    params: [
      createParam('douyin_budget_cap', '抖音占比上限', 50, '%', '抖音巨量平台预算占比上限', 45, 90, { min: 20, max: 70, step: 1, autoTuneEnabled: false }),
      createParam('xiaohongshu_budget_cap', '小红书占比上限', 35, '%', '小红书聚光平台预算占比上限', 30, 88, { min: 10, max: 50, step: 1, autoTuneEnabled: false }),
      createParam('explore_budget', '新平台探索预算', 5, '%', '用于测试新平台/新渠道的预算比例', 8, 79, { min: 2, max: 15, step: 1 }),
      createParam('rebalance_interval', '平台重分配周期', 4, 'h', 'AI重新评估平台预算分配的周期', 3, 84, { min: 1, max: 24, step: 1 }),
      createParam('intl_budget_ratio', '国际平台预算占比', 28, '%', '国际平台(Meta/TikTok/Google)占总预算比例，AI根据ROAS动态调节', 22, 82, { min: 5, max: 50, step: 1 }),
    ]
  },
]

const dashboardLearningStatus: AILearningStatus = {
  modelVersion: 'v4.0.0-beauty',
  lastTraining: '8分钟前',
  totalDataPoints: 2580000,
  avgConfidence: 89,
  autoAdjustCount24h: 347,
  learningRate: '0.001',
  nextTraining: '7分钟后',
  improvementRate: '+6.8%',
}

const trendData = [
  { date: '03/28', 消耗: 780000, GMV: 2320000 },
  { date: '03/29', 消耗: 820000, GMV: 2510000 },
  { date: '03/30', 消耗: 850000, GMV: 2680000 },
  { date: '03/31', 消耗: 840000, GMV: 2720000 },
  { date: '04/01', 消耗: 870000, GMV: 2810000 },
  { date: '04/02', 消耗: 880000, GMV: 2890000 },
  { date: '04/03', 消耗: 865000, GMV: 2950000 },
]

const platformData = [
  { name: '抖音', value: 380000, color: '#e8365d' },
  { name: '小红书', value: 240000, color: '#ff7a95' },
  { name: '快手', value: 160000, color: '#ff9eb5' },
  { name: '天猫', value: 55000, color: '#ffb3c6' },
  { name: '京东', value: 30000, color: '#ffc8d5' },
  { name: 'Meta', value: 90000, color: '#1877f2' },
  { name: 'TikTok Intl', value: 64000, color: '#8b5cf6' },
  { name: 'Google', value: 46000, color: '#22c55e' },
]

const efficiencyData = [
  { name: '建计划', AI: 18, 人工: 200, unit: '分钟' },
  { name: '日操作量', AI: 3200, 人工: 180, unit: '次' },
  { name: '响应速度', AI: 0.5, 人工: 30, unit: '分钟' },
  { name: '失误率', AI: 2.8, 人工: 8.2, unit: '%' },
]

const aiOperations = [
  { time: '11:45', platform: '抖音', color: '#e8365d', action: 'AI扩量唇釉丝绒系列+35%预算 → ROI 4.2', confidence: 94 },
  { time: '11:38', platform: '小红书', color: '#ff7a95', action: 'AI自动建种草计划3个 → 眼影盘星空 → 18-30岁女性', confidence: 92 },
  { time: '11:30', platform: '快手', color: '#ff9eb5', action: 'AI关停低效计划 → 粉底液测评ROI<1.5', confidence: 97 },
  { time: '11:22', platform: '天猫', color: '#ffb3c6', action: 'AI跨线调拨 → 唇部+¥8K，眼部-¥3K', confidence: 89 },
  { time: '11:15', platform: '小红书', color: '#ff7a95', action: 'AI发现新种草受众 → 成分党 25-34F', confidence: 78 },
  { time: '11:08', platform: '抖音', color: '#e8365d', action: 'AI素材替换 → 对比测评视频CTR+28%', confidence: 95 },
  { time: '10:58', platform: 'Meta', color: '#1877f2', action: 'AI扩量 Facebook US 唇釉Velvet系列+$1.2K/日 → ROAS 4.1', confidence: 91 },
  { time: '10:44', platform: 'TikTok Intl', color: '#8b5cf6', action: 'AI替换 TikTok JP 眼影素材 → 创意疲劳检测 CTR+24%', confidence: 88 },
]

const platforms = [
  { name: '抖音', color: '#e8365d' },
  { name: '小红书', color: '#ff7a95' },
  { name: '快手', color: '#ff9eb5' },
  { name: '天猫', color: '#ffb3c6' },
  { name: '京东', color: '#ffc8d5' },
  { name: 'Meta', color: '#1877f2' },
  { name: 'TikTok Intl', color: '#8b5cf6' },
  { name: 'Google', color: '#22c55e' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// Detail drill-down data
const kpiDetails: Record<string, { title: string; breakdown: { label: string; value: string; subLabel?: string }[]; hourly: { hour: string; value: number }[]; comparison: { label: string; today: string; yesterday: string; change: string }[] }> = {
  spend: {
    title: '今日广告消耗明细',
    breakdown: [
      { label: '抖音巨量', value: '¥380,000', subLabel: '43.9%' },
      { label: '小红书聚光', value: '¥240,000', subLabel: '27.7%' },
      { label: '快手磁力', value: '¥160,000', subLabel: '18.5%' },
      { label: '天猫品销宝', value: '¥55,000', subLabel: '6.4%' },
      { label: '京东', value: '¥30,000', subLabel: '3.5%' },
    ],
    hourly: [
      { hour: '00:00', value: 18000 }, { hour: '03:00', value: 12000 }, { hour: '06:00', value: 28000 },
      { hour: '09:00', value: 85000 }, { hour: '12:00', value: 120000 }, { hour: '15:00', value: 98000 },
      { hour: '18:00', value: 145000 }, { hour: '21:00', value: 159000 },
    ],
    comparison: [
      { label: '总消耗', today: '¥865,000', yesterday: '¥842,000', change: '+2.7%' },
      { label: 'CPM均值', today: '¥38.2', yesterday: '¥36.8', change: '+3.8%' },
      { label: 'CPC均值', today: '¥2.15', yesterday: '¥2.08', change: '+3.4%' },
      { label: '展示量', today: '22.6M', yesterday: '22.9M', change: '-1.3%' },
    ],
  },
  revenue: {
    title: '今日GMV明细',
    breakdown: [
      { label: '抖音电商', value: '¥1,240,000', subLabel: '42.0%' },
      { label: '天猫旗舰店', value: '¥890,000', subLabel: '30.2%' },
      { label: '小红书店铺', value: '¥520,000', subLabel: '17.6%' },
      { label: '快手小店', value: '¥300,000', subLabel: '10.2%' },
    ],
    hourly: [
      { hour: '00:00', value: 42000 }, { hour: '03:00', value: 28000 }, { hour: '06:00', value: 85000 },
      { hour: '09:00', value: 280000 }, { hour: '12:00', value: 420000 }, { hour: '15:00', value: 380000 },
      { hour: '18:00', value: 580000 }, { hour: '21:00', value: 635000 },
    ],
    comparison: [
      { label: '总GMV', today: '¥2,950,000', yesterday: '¥2,780,000', change: '+6.1%' },
      { label: 'ROI', today: '3.41', yesterday: '3.30', change: '+3.3%' },
      { label: '客单价', today: '¥268', yesterday: '¥255', change: '+5.1%' },
      { label: '付款用户', today: '11,006', yesterday: '10,902', change: '+1.0%' },
    ],
  },
  aiOps: {
    title: 'AI操作次数明细',
    breakdown: [
      { label: '自动调价', value: '1,380次', subLabel: '43.1%' },
      { label: '自动建计划', value: '420次', subLabel: '13.1%' },
      { label: '素材替换', value: '350次', subLabel: '10.9%' },
      { label: '预算调拨', value: '512次', subLabel: '16.0%' },
      { label: '关停低效', value: '320次', subLabel: '10.0%' },
      { label: '受众优化', value: '218次', subLabel: '6.8%' },
    ],
    hourly: [
      { hour: '00:00', value: 92 }, { hour: '03:00', value: 65 }, { hour: '06:00', value: 158 },
      { hour: '09:00', value: 340 }, { hour: '12:00', value: 428 }, { hour: '15:00', value: 385 },
      { hour: '18:00', value: 460 }, { hour: '21:00', value: 402 },
    ],
    comparison: [
      { label: '总操作', today: '3,200', yesterday: '3,020', change: '+6.0%' },
      { label: '人工干预', today: '3次', yesterday: '5次', change: '-40%' },
      { label: '干预率', today: '0.09%', yesterday: '0.17%', change: '-47%' },
      { label: '成功率', today: '98.1%', yesterday: '97.5%', change: '+0.6%' },
    ],
  },
  manpower: {
    title: 'AI节省人力明细',
    breakdown: [
      { label: '投放运营岗', value: '6人', subLabel: '月省¥72K' },
      { label: '内容优化岗', value: '4人', subLabel: '月省¥48K' },
      { label: '数据分析岗', value: '2人', subLabel: '月省¥24K' },
      { label: '创意审核岗', value: '2人', subLabel: '月省¥20K' },
    ],
    hourly: [
      { hour: '1月', value: 6 }, { hour: '2月', value: 8 }, { hour: '3月', value: 11 },
      { hour: '4月', value: 14 },
    ],
    comparison: [
      { label: '替代人力', today: '14人', yesterday: '11人', change: '+27%' },
      { label: '月节省', today: '¥164K', yesterday: '¥132K', change: '+24%' },
      { label: '效率倍数', today: '18x', yesterday: '15x', change: '+20%' },
      { label: '错误率降低', today: '65%', yesterday: '57%', change: '+14%' },
    ],
  },
}

const businessLineDetails: Record<string, { name: string; color: string; topCampaigns: { name: string; spend: string; roi: string; status: string }[]; recentOps: { time: string; action: string; result: string }[]; metrics: { label: string; value: string; trend: string }[] }> = {
  douyin: {
    name: '抖音投放',
    color: '#e8365d',
    topCampaigns: [
      { name: '唇釉丝绒618预热', spend: '¥85,000', roi: '4.20', status: '起量中' },
      { name: '眼影盘星空新品', spend: '¥62,000', roi: '3.85', status: '稳定' },
      { name: '粉底液水光夏日', spend: '¥48,000', roi: '3.52', status: '起量中' },
      { name: '睫毛膏纤长测评', spend: '¥35,000', roi: '2.98', status: '观察' },
      { name: '卸妆水温和系列', spend: '¥28,000', roi: '2.75', status: '衰退' },
    ],
    recentOps: [
      { time: '11:42', action: 'AI扩量唇釉丝绒+35%预算', result: 'ROI 3.8→4.2' },
      { time: '11:20', action: 'AI关停粉底液低效计划', result: '节省¥5.2K' },
      { time: '10:55', action: 'AI建计划眼影盘东南人群', result: '已起量' },
    ],
    metrics: [
      { label: '活跃计划', value: '68', trend: '+5' },
      { label: '平均CPA', value: '¥32', trend: '-6%' },
      { label: '素材数', value: '220', trend: '+18' },
      { label: '种草指数', value: '92', trend: '+4' },
    ],
  },
  xiaohongshu: {
    name: '小红书种草',
    color: '#ff7a95',
    topCampaigns: [
      { name: '唇釉成分党种草', spend: '¥45,000', roi: '3.62', status: '稳定' },
      { name: '眼影教程合集', spend: '¥38,000', roi: '3.28', status: '起量中' },
      { name: '卸妆水敏感肌测评', spend: '¥32,000', roi: '3.05', status: '观察' },
      { name: '高光修容技巧', spend: '¥25,000', roi: '2.88', status: '衰退' },
      { name: '粉底液色号选择', spend: '¥22,000', roi: '3.15', status: '稳定' },
    ],
    recentOps: [
      { time: '11:38', action: 'AI优化成分党定向', result: '种草指数+18%' },
      { time: '11:15', action: 'AI建笔记计划颜值党', result: '审核中' },
      { time: '10:42', action: 'AI关停低效种草内容', result: '节省¥3.2K' },
    ],
    metrics: [
      { label: '活跃计划', value: '45', trend: '+3' },
      { label: '平均CPE', value: '¥0.85', trend: '-4%' },
      { label: '种草笔记', value: '128', trend: '+12' },
      { label: '搜索增量', value: '+38%', trend: '+5%' },
    ],
  },
  kuaishou: {
    name: '快手投放',
    color: '#ff9eb5',
    topCampaigns: [
      { name: '唇釉试色短视频', spend: '¥52,000', roi: '3.42', status: '起量中' },
      { name: '粉底液对比测评', spend: '¥43,000', roi: '3.18', status: '稳定' },
      { name: '眼影盘开箱直播', spend: '¥35,000', roi: '3.05', status: '稳定' },
      { name: '卸妆教程合集', spend: '¥28,000', roi: '2.82', status: '观察' },
      { name: '睫毛膏变美挑战', spend: '¥22,000', roi: '2.95', status: '起量中' },
    ],
    recentOps: [
      { time: '11:45', action: 'AI扩量唇釉试色北方人群', result: 'ROI 3.42' },
      { time: '11:30', action: 'AI调拨¥8K从眼部至唇部', result: '已执行' },
      { time: '11:10', action: 'AI替换低效视频素材', result: 'CTR+18%' },
    ],
    metrics: [
      { label: '活跃计划', value: '52', trend: '+4' },
      { label: '平均CPA', value: '¥28', trend: '-5%' },
      { label: '素材数', value: '165', trend: '+14' },
      { label: '完播率', value: '68%', trend: '+3%' },
    ],
  },
}

const operationDetails: Record<number, { title: string; context: string; before: { label: string; value: string }[]; after: { label: string; value: string }[]; impact: string; relatedOps: { time: string; action: string }[] }> = {
  0: {
    title: 'AI扩量唇釉丝绒系列',
    context: '检测到唇釉丝绒系列在抖音巨量ROI持续走高(3.8)，超过目标值3.2达18.8%。AI决定扩量35%预算以获取更多高价值美妆消费者。',
    before: [{ label: '日预算', value: '¥30,000' }, { label: 'ROI', value: '3.80' }, { label: 'CPA', value: '¥28' }],
    after: [{ label: '日预算', value: '¥40,500' }, { label: '预测ROI', value: '3.65' }, { label: '预测CPA', value: '¥32' }],
    impact: '预计增加日GMV¥28,000，ROI可能小幅回落至3.65',
    relatedOps: [{ time: '10:30', action: '同计划试色视频CTR+22%' }, { time: '09:15', action: '25-34岁女性受众扩展' }],
  },
  1: {
    title: 'AI自动建种草计划 · 眼影盘星空',
    context: '眼影盘星空试色视频在A/B测试中表现优异，CTR 9.2%远超均值5.8%。AI决定在18-30岁女性精准受众建立3个种草计划。',
    before: [{ label: '覆盖人群', value: '泛女性18-45' }, { label: '日展示', value: '85K' }, { label: 'CTR', value: '9.2%' }],
    after: [{ label: '覆盖人群', value: '精准18-30F' }, { label: '预计日展示', value: '320K' }, { label: '预计CTR', value: '8.1%' }],
    impact: '预计增加日GMV¥18,500，种草指数提升22%',
    relatedOps: [{ time: '10:00', action: '眼影盘试色视频通过审核' }, { time: '09:30', action: '创意团队提交新素材批次' }],
  },
  2: {
    title: 'AI关停低效计划 · 粉底液测评',
    context: '粉底液测评计划连续3天ROI低于1.5，远低于安全线2.0。消耗¥8,200/日但GMV仅¥10,500。AI决定立即关停以止损。',
    before: [{ label: '日消耗', value: '¥8,200' }, { label: 'ROI', value: '1.28' }, { label: 'CPA', value: '¥65' }],
    after: [{ label: '日消耗', value: '¥0' }, { label: '节省', value: '¥8,200/日' }, { label: '预算释放', value: '可分配' }],
    impact: '止损¥8,200/日，释放预算可重新分配至高ROI计划',
    relatedOps: [{ time: '10:30', action: '该计划ROI降至1.28' }, { time: '09:00', action: 'AI发出ROI预警' }],
  },
  3: {
    title: 'AI跨线调拨 · 唇部+¥8K',
    context: '唇部系列当前ROI 4.2表现强劲且有扩量空间，眼部系列部分计划ROI偏低。AI决定从眼部线调拨¥8K至唇部，削减眼部¥3K低效预算。',
    before: [{ label: '唇部预算', value: '¥380K' }, { label: '眼部预算', value: '¥220K' }, { label: '整体ROI', value: '3.35' }],
    after: [{ label: '唇部预算', value: '¥388K' }, { label: '眼部预算', value: '¥217K' }, { label: '预测ROI', value: '3.41' }],
    impact: '整体ROI预计提升1.8%，唇部线获得更多高效预算',
    relatedOps: [{ time: '11:00', action: '唇部系列预算利用率达96%' }, { time: '10:45', action: '眼部系列3个计划ROI<2.0' }],
  },
  4: {
    title: 'AI发现新种草受众 · 成分党25-34F',
    context: 'AI通过受众分析发现25-34岁女性成分党对护肤类素材响应率高出均值58%。建议创建专属种草定向测试。',
    before: [{ label: '覆盖受众', value: '18-45 混合' }, { label: '成分党CTR', value: '5.8%' }, { label: '样本量', value: '小' }],
    after: [{ label: '新增定向', value: '成分党25-34F' }, { label: '预测CTR', value: '9.2%' }, { label: '置信度', value: '78%' }],
    impact: '潜在新受众池120W+，需测试验证后决定是否大规模投放',
    relatedOps: [{ time: '10:50', action: '小红书受众数据分析完成' }, { time: '10:20', action: '受众模型v3.5更新' }],
  },
  5: {
    title: 'AI素材替换 · 对比测评视频',
    context: '原试色视频在投放52小时后CTR从7.2%衰退至5.1%，AI自动检测到衰退趋势并替换为新对比测评视频，CTR恢复至6.5%。',
    before: [{ label: '素材', value: '原试色视频' }, { label: 'CTR', value: '5.1% (衰退)' }, { label: '投放时长', value: '52h' }],
    after: [{ label: '素材', value: '对比测评视频' }, { label: 'CTR', value: '6.5% (+28%)' }, { label: '投放时长', value: '3h' }],
    impact: 'CTR提升28%，预计日GMV增加¥4,200',
    relatedOps: [{ time: '10:30', action: '原试色视频CTR跌破6%预警线' }, { time: '10:00', action: '对比测评视频审核通过' }],
  },
  6: {
    title: 'AI扩量 Facebook US 唇釉Velvet系列',
    context: '检测到Facebook美国市场唇釉Velvet系列ROAS持续高于目标4.0，当前ROAS达4.1。AI决定追加$1,200/日预算，扩量至高价值美妆消费者人群。',
    before: [{ label: '日预算', value: '$3,200' }, { label: 'ROAS', value: '4.10' }, { label: 'CPA', value: '$12' }],
    after: [{ label: '日预算', value: '$4,400' }, { label: '预测ROAS', value: '3.90' }, { label: '预测CPA', value: '$14' }],
    impact: '预计日增GMV $3,800，新覆盖US 25-45岁女性购美客群',
    relatedOps: [{ time: '10:30', action: 'Facebook CAPI转化数据同步完成' }, { time: '09:45', action: '美国市场CPM环比下降8%，竞价环境改善' }],
  },
  7: {
    title: 'AI素材替换 · TikTok JP 眼影视频',
    context: 'TikTok日本市场眼影开箱视频投放44小时后CTR从6.8%衰退至5.2%，AI检测到创意疲劳趋势，自动替换为试色对比视频，CTR回升至6.4%。',
    before: [{ label: '素材', value: '眼影开箱视频' }, { label: 'CTR', value: '5.2% (衰退)' }, { label: '投放时长', value: '44h' }],
    after: [{ label: '素材', value: '试色对比视频' }, { label: 'CTR', value: '6.4% (+24%)' }, { label: '投放时长', value: '2h' }],
    impact: 'CTR提升24%，JP市场日GMV预计增加¥8,500',
    relatedOps: [{ time: '10:20', action: 'JP眼影视频CTR跌破6%预警线' }, { time: '09:55', action: '试色对比视频通过TikTok JP内容审核' }],
  },
}

const platformHealthDetails: Record<string, { status: string; latency: string; apiQuota: string; errorRate: string; lastIncident: string; recentEvents: { time: string; event: string }[] }> = {
  '抖音': { status: '正常', latency: '95ms', apiQuota: '78%', errorRate: '0.02%', lastIncident: '3天前 · API限流15分钟', recentEvents: [{ time: '11:30', event: 'API调用正常' }, { time: '10:00', event: '广告审核队列清空' }] },
  '小红书': { status: '正常', latency: '140ms', apiQuota: '62%', errorRate: '0.04%', lastIncident: '1天前 · 审核延迟20分钟', recentEvents: [{ time: '11:20', event: '审核队列积压8条' }, { time: '10:30', event: '新种草计划提交' }] },
  '快手': { status: '正常', latency: '120ms', apiQuota: '55%', errorRate: '0.03%', lastIncident: '5天前 · 数据延迟1小时', recentEvents: [{ time: '11:00', event: '磁力引擎同步正常' }, { time: '09:30', event: '转化数据同步完成' }] },
  '天猫': { status: '正常', latency: '88ms', apiQuota: '45%', errorRate: '0.01%', lastIncident: '7天前 · 品销宝异常', recentEvents: [{ time: '10:45', event: '品销宝计划创建成功' }, { time: '09:00', event: '日报数据拉取完成' }] },
  '京东': { status: '正常', latency: '105ms', apiQuota: '32%', errorRate: '0.02%', lastIncident: '10天前 · 接口超时', recentEvents: [{ time: '11:10', event: '京准通同步正常' }, { time: '10:00', event: '预算消耗正常' }] },
  'Meta': { status: '正常', latency: '62ms', apiQuota: '58%', errorRate: '0.03%', lastIncident: '2天前 · EU数据合规审查30分钟', recentEvents: [{ time: '11:50', event: 'Conversions API事件同步正常' }, { time: '10:20', event: 'US广告审核队列已清空' }] },
  'TikTok Intl': { status: '正常', latency: '85ms', apiQuota: '71%', errorRate: '0.04%', lastIncident: '4天前 · JP账户限流10分钟', recentEvents: [{ time: '11:40', event: 'TikTok for Business API正常' }, { time: '10:05', event: 'JP视频素材审核通过' }] },
  'Google': { status: '正常', latency: '48ms', apiQuota: '42%', errorRate: '0.01%', lastIncident: '8天前 · PMax策略异常2小时', recentEvents: [{ time: '11:25', event: 'Google Ads API调用正常' }, { time: '09:30', event: 'Performance Max策略已更新' }] },
}

export default function Dashboard() {
  const [selectedDetail, setSelectedDetail] = useState<{type: string, data: any} | null>(null)
  const [detailHistory, setDetailHistory] = useState<{type: string, data: any}[]>([])
  const [teamTab, setTeamTab] = useState<'all' | 'domestic' | 'intl'>('all')
  const navigate = useNavigate()
  useRegisterAIConfig(dashboardAIGroups, dashboardLearningStatus, '美妆投流驾驶舱')

  const drillDown = (type: string, data: any) => {
    if (selectedDetail) {
      setDetailHistory(prev => [...prev, selectedDetail])
    }
    setSelectedDetail({ type, data })
  }

  const drillBack = () => {
    const prev = detailHistory[detailHistory.length - 1]
    if (prev) {
      setDetailHistory(h => h.slice(0, -1))
      setSelectedDetail(prev)
    }
  }

  const closeDetail = () => {
    setSelectedDetail(null)
    setDetailHistory([])
  }

  const renderDetailContent = () => {
    if (!selectedDetail) return null
    const { type, data } = selectedDetail

    if (type === 'kpi') {
      const detail = kpiDetails[data.key as keyof typeof kpiDetails]
      if (!detail) return null
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {detailHistory.length > 0 && (
                <button onClick={drillBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><ChevronLeft size={18} /></button>
              )}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{detail.title}</h3>
            </div>
            <button onClick={closeDetail} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>

          <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e8365d', marginBottom: 10 }}>平台/产品线分布</div>
          <div className="card" style={{ marginBottom: 16, padding: 14 }}>
            {detail.breakdown.map((item, i) => (
              <div key={i} onClick={() => drillDown('breakdownItem', { ...item, parentTitle: detail.title })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < detail.breakdown.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,54,93,0.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.value}</span>
                  {item.subLabel && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.subLabel}</span>}
                  <ArrowRight size={12} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e8365d', marginBottom: 10 }}>时段趋势</div>
          <div className="card" style={{ marginBottom: 16, padding: 14 }}>
            {detail.hourly.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 40, flexShrink: 0, fontFamily: 'monospace' }}>{h.hour}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(h.value / Math.max(...detail.hourly.map(x => x.value))) * 100}%`, height: '100%', background: '#e8365d', borderRadius: 3, animation: 'progressFill 1s ease' }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, width: 50, textAlign: 'right' }}>{typeof h.value === 'number' && h.value > 1000 ? `¥${(h.value/1000).toFixed(1)}K` : h.value}</span>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e8365d', marginBottom: 10 }}>对比分析</div>
          <div className="card" style={{ padding: 14 }}>
            <div className="data-table">
              {detail.comparison.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < detail.comparison.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{c.today}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>vs {c.yesterday}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: c.change.startsWith('+') ? '#34d399' : c.change.startsWith('-') ? '#ef4444' : 'var(--text-muted)' }}>{c.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    }

    if (type === 'breakdownItem') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={drillBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><ChevronLeft size={18} /></button>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{data.label} 详情</h3>
            </div>
            <button onClick={closeDetail} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <div className="card" style={{ padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>来源</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8365d' }}>{data.parentTitle}</div>
          </div>
          <div className="card" style={{ padding: 14, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>数值</div><div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{data.value}</div></div>
              {data.subLabel && <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>占比</div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8365d' }}>{data.subLabel}</div></div>}
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 10 }}>趋势 (最近7日)</div>
            {[85, 92, 88, 95, 91, 98, 100].map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 40, fontFamily: 'monospace' }}>03/{28+i}</span>
                <div style={{ flex: 1, height: 5, background: 'var(--bg-primary)', borderRadius: 3 }}>
                  <div style={{ width: `${v}%`, height: '100%', background: '#ff7a95', borderRadius: 3, animation: 'progressFill 1s ease' }} />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, width: 30, textAlign: 'right' }}>{v}%</span>
              </div>
            ))}
          </div>
        </>
      )
    }

    if (type === 'businessLine') {
      const line = businessLineDetails[data.key as keyof typeof businessLineDetails]
      if (!line) return null
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {detailHistory.length > 0 && <button onClick={drillBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><ChevronLeft size={18} /></button>}
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${line.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={14} color={line.color} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{line.name} 详情</h3>
            </div>
            <button onClick={closeDetail} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>

          <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: line.color, marginBottom: 10 }}>关键指标</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
            {line.metrics.map((m, i) => (
              <div key={i} className="card" style={{ padding: 12, cursor: 'pointer' }} onClick={() => drillDown('metricDrill', { metric: m, lineName: line.name, lineColor: line.color })}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 12px ${line.color}25` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{m.value} <span style={{ fontSize: '0.7rem', color: m.trend.startsWith('+') || m.trend.startsWith('-') ? (m.trend.startsWith('+') ? '#34d399' : '#ef4444') : 'var(--text-muted)' }}>{m.trend}</span></div>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: line.color, marginBottom: 10 }}>Top计划</div>
          <div className="card" style={{ padding: 14, marginBottom: 16 }}>
            {line.topCampaigns.map((c, i) => (
              <div key={i} onClick={() => drillDown('campaignDrill', { campaign: c, lineName: line.name, lineColor: line.color })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < line.topCampaigns.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,54,93,0.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>消耗 {c.spend}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: parseFloat(c.roi) > 3.0 ? '#34d399' : '#fbbf24' }}>ROI {c.roi}</span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: c.status === '起量中' ? 'rgba(52,211,153,0.1)' : c.status === '稳定' ? 'rgba(96,165,250,0.1)' : c.status === '观察' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', color: c.status === '起量中' ? '#34d399' : c.status === '稳定' ? '#60a5fa' : c.status === '观察' ? '#fbbf24' : '#ef4444' }}>{c.status}</span>
                  <ArrowRight size={12} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ fontSize: '0.8rem', fontWeight: 600, color: line.color, marginBottom: 10 }}>近期AI操作</div>
          <div className="card" style={{ padding: 14 }}>
            {line.recentOps.map((op, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < line.recentOps.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 38, flexShrink: 0, fontFamily: 'monospace' }}>{op.time}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem' }}>{op.action}</div>
                  <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: 2 }}>{op.result}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )
    }

    if (type === 'operation') {
      const opDetail = operationDetails[data.index as number]
      if (!opDetail) return null
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {detailHistory.length > 0 && <button onClick={drillBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><ChevronLeft size={18} /></button>}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{opDetail.title}</h3>
            </div>
            <button onClick={closeDetail} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <div className="card" style={{ padding: 14, marginBottom: 16, background: 'rgba(232,54,93,0.04)', borderColor: 'rgba(232,54,93,0.15)' }}>
            <div style={{ fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{opDetail.context}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>操作前</div>
              {opDetail.before.map((b, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{b.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{b.value}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399', marginBottom: 8 }}>操作后</div>
              {opDetail.after.map((a, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{a.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{a.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>预期影响</div>
            <div style={{ fontSize: '0.82rem', color: '#e8365d', fontWeight: 600 }}>{opDetail.impact}</div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 8 }}>关联操作</div>
            {opDetail.relatedOps.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 38, fontFamily: 'monospace' }}>{r.time}</span>
                <span style={{ fontSize: '0.75rem' }}>{r.action}</span>
              </div>
            ))}
          </div>
        </>
      )
    }

    if (type === 'platform') {
      const ph = platformHealthDetails[data.name as string]
      if (!ph) return null
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {detailHistory.length > 0 && <button onClick={drillBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><ChevronLeft size={18} /></button>}
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{data.name} 平台健康</h3>
            </div>
            <button onClick={closeDetail} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: '状态', value: ph.status, color: '#34d399' },
              { label: '延迟', value: ph.latency, color: 'var(--text-primary)' },
              { label: 'API配额', value: ph.apiQuota, color: '#e8365d' },
              { label: '错误率', value: ph.errorRate, color: '#34d399' },
            ].map((m, i) => (
              <div key={i} className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>最近故障</div>
            <div style={{ fontSize: '0.82rem', color: '#fbbf24' }}>{ph.lastIncident}</div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, marginBottom: 8 }}>近期事件</div>
            {ph.recentEvents.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 38, fontFamily: 'monospace' }}>{e.time}</span>
                <span style={{ fontSize: '0.75rem' }}>{e.event}</span>
              </div>
            ))}
          </div>
        </>
      )
    }

    return null
  }

  const kpiCards = [
    {
      key: 'spend', icon: <Bot size={18} color="#e8365d" />, label: '智能体运行', value: '3,200',
      sub: '今日AI操作次数', change: '+5.9%', positive: true, color: '#e8365d',
    },
    {
      key: 'spend_amount', icon: <DollarSign size={18} color="#ff7a95" />, label: '今日广告消耗', value: '¥86.5万',
      sub: '较昨日+2.7%', change: '+2.7%', positive: true, color: '#ff7a95',
    },
    {
      key: 'revenue', icon: <TrendingUp size={18} color="#34d399" />, label: '今日GMV', value: '¥295万',
      sub: '整体ROI 3.41', change: '+6.1%', positive: true, color: '#34d399',
    },
    {
      key: 'aiOps', icon: <Activity size={18} color="#60a5fa" />, label: '种草内容', value: '328条',
      sub: '今日新增种草内容', change: '+12%', positive: true, color: '#60a5fa',
    },
    {
      key: 'manpower', icon: <Zap size={18} color="#fbbf24" />, label: 'AI节省人力', value: '≈14人',
      sub: '月省¥164K', change: '+27%', positive: true, color: '#fbbf24',
    },
  ]

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' }}>
        <div className="page-header">
          <h2>玛丽黛佳 · 美妆智能投放驾驶舱
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e', marginLeft: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'blinkDot 1.5s ease infinite' }} />
              实时更新
            </span>
          </h2>
          <p>多平台美妆广告 · 🇨🇳 抖音/小红书/快手/天猫/京东 · 🌍 Meta/TikTok/Google · ROI实时监控 · AI全球投放闭环</p>
        </div>
        <div className="page-content">

          {/* Team View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            {([
              { key: 'all', label: '全部' },
              { key: 'domestic', label: '🇨🇳 国内团队' },
              { key: 'intl', label: '🌍 国际团队' },
            ] as { key: 'all' | 'domestic' | 'intl'; label: string }[]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setTeamTab(tab.key)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: teamTab === tab.key ? '1px solid #0ea5e9' : '1px solid var(--border)',
                  background: teamTab === tab.key ? 'rgba(14,165,233,0.12)' : 'var(--bg-card)',
                  color: teamTab === tab.key ? '#0ea5e9' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: teamTab === tab.key ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Global Overview Strip — visible when tab is 'all' or 'intl' */}
          {(teamTab === 'all' || teamTab === 'intl') && (
            <div style={{
              marginBottom: 20,
              padding: '14px 20px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.06))',
              borderLeft: '4px solid #0ea5e9',
              border: '1px solid rgba(14,165,233,0.18)',
              borderLeftWidth: 4,
              animation: 'fadeInUp 0.4s ease both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Globe size={14} color="#0ea5e9" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0ea5e9' }}>全球总览</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                {[
                  { label: '全球总消耗', value: '¥892万', badge: '+12.4%', badgeColor: '#34d399' },
                  { label: '全球总GMV', value: '¥3,240万', badge: '+18.6%', badgeColor: '#34d399' },
                  { label: '综合ROAS', value: '3.63x', badge: undefined, badgeColor: undefined },
                  { label: '国际占比', value: '28%', badge: '↑ from 22%', badgeColor: '#0ea5e9' },
                  { label: '覆盖市场', value: '12个国家', badge: undefined, badgeColor: undefined },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.value}</span>
                      {item.badge && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: item.badgeColor }}>{item.badge}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPI Cards — hidden when tab is 'intl' only */}
          {teamTab !== 'intl' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
            {kpiCards.map((card, i) => (
              <div key={i} className="card"
                onClick={() => drillDown('kpi', { key: card.key })}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}20` }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}
                style={{ cursor: 'pointer', borderTop: `3px solid ${card.color}`, transition: 'all 0.2s ease', animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {card.icon}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4, animation: `countRoll 0.6s ease ${i * 0.12}s both` }}>{card.value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{card.sub}</span>
                  <span style={{ fontSize: '0.68rem', color: card.positive ? '#34d399' : '#ef4444', display: 'flex', alignItems: 'center' }}>
                    <ArrowUpRight size={10} />{card.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Main Charts + Business Lines — hidden when 'intl' only */}
          {teamTab !== 'intl' && (<>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            {/* GMV Trend Chart */}
            <div className="card" style={{ animation: 'fadeInUp 0.5s ease 0.4s both', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,54,93,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}>
              <div className="section-title"><TrendingUp size={16} /> 各平台GMV趋势（近7日）</div>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={trendData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${(v/10000).toFixed(0)}万`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `¥${(v/10000).toFixed(1)}万`} />
                  <Area yAxisId="right" type="monotone" dataKey="GMV" stroke="#34d399" fill="rgba(52,211,153,0.1)" strokeWidth={2} name="GMV" animationDuration={1000} isAnimationActive={true} />
                  <Line yAxisId="left" type="monotone" dataKey="消耗" stroke="#e8365d" strokeWidth={2} name="消耗" dot={{ r: 3 }} animationDuration={1000} isAnimationActive={true} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Platform Distribution */}
            <div className="card" style={{ animation: 'fadeInUp 0.5s ease 0.48s both', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,54,93,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}>
              <div className="section-title"><Globe size={16} /> 各平台消耗分布</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <PieChart width={140} height={140}>
                  <Pie data={platformData} cx={65} cy={65} innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2} animationDuration={1000} isAnimationActive={true}>
                    {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
                <div style={{ flex: 1 }}>
                  {platformData.map((p, i) => (
                    <div key={i} onClick={() => drillDown('platform', { name: p.name })} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', padding: '4px 6px', borderRadius: 6 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', flex: 1 }}>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>¥{(p.value / 1000).toFixed(0)}K</span>
                      <ArrowRight size={10} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Business Lines */}
          <div style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}><BookOpen size={16} /> 平台投放业务线</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { key: 'douyin', name: '抖音投放', color: '#e8365d', spend: '¥38.0万', gmv: '¥124万', roi: 3.42, plans: 68, status: '放量中' },
                { key: 'xiaohongshu', name: '小红书种草', color: '#ff7a95', spend: '¥24.0万', gmv: '¥89万', roi: 3.62, plans: 45, status: '稳定' },
                { key: 'kuaishou', name: '快手投放', color: '#ff9eb5', spend: '¥16.0万', gmv: '¥52万', roi: 3.25, plans: 52, status: '放量中' },
              ].map((line, idx) => (
                <div key={line.key} className="card" style={{ cursor: 'pointer', borderLeft: `4px solid ${line.color}`, transition: 'all 0.2s ease', animation: `fadeInUp 0.5s ease ${0.56 + idx * 0.08}s both` }}
                  onClick={() => drillDown('businessLine', { key: line.key })}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${line.color}20` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${line.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={14} color={line.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{line.name}</div>
                      <div style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, background: `${line.color}15`, color: line.color, display: 'inline-block', animation: line.status === '放量中' ? 'pulseScale 2s ease infinite' : undefined }}>{line.status}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    <div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>今日消耗</div><div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{line.spend}</div></div>
                    <div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>今日GMV</div><div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{line.gmv}</div></div>
                    <div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>ROI</div><div style={{ fontSize: '0.88rem', fontWeight: 700, color: line.roi >= 3.0 ? '#34d399' : '#fbbf24' }}>{line.roi}x</div></div>
                    <div><div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>活跃计划</div><div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{line.plans}</div></div>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.68rem', color: line.color }}>查看详情 →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>)}

          {/* International Team Realtime Status — visible when tab is 'all' or 'intl' */}
          {(teamTab === 'all' || teamTab === 'intl') && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}><Globe size={16} /> 国际团队实时状态</div>
            <div className="card" style={{ borderLeft: '4px solid #0ea5e9', animation: 'fadeInUp 0.5s ease 0.56s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0ea5e9' }}>今日国际投放 · 实时</span>
                <span style={{ fontSize: '0.65rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'blinkDot 1.5s ease infinite' }} />
                  实时同步
                </span>
              </div>
              {[
                { name: 'Facebook', flag: '🇺🇸', spend: '$12,480', roas: '3.82x', roasColor: '#34d399', route: '/intl/facebook', color: '#1877f2' },
                { name: 'TikTok', flag: '🌐', spend: '$8,920', roas: '4.15x', roasColor: '#34d399', route: '/intl/tiktok', color: '#010101' },
                { name: 'Google', flag: '🌍', spend: '$6,340', roas: '3.41x', roasColor: '#fbbf24', route: '/intl/google', color: '#4285f4' },
              ].map((platform, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: idx < 2 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${platform.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: platform.color }}>{platform.name.slice(0, 2)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{platform.flag} {platform.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>今日消耗 <strong style={{ color: 'var(--text-secondary)' }}>{platform.spend}</strong></div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 12 }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ROAS</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: platform.roasColor }}>{platform.roas}</div>
                  </div>
                  <button
                    onClick={() => navigate(platform.route)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 8,
                      border: `1px solid ${platform.color}40`,
                      background: `${platform.color}10`,
                      color: platform.color,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${platform.color}20` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${platform.color}10` }}
                  >
                    进入 <ArrowRight size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* AI Model Realtime Status Strip */}
          <div className="card" style={{ marginBottom: 20, padding: '12px 16px', animation: 'fadeInUp 0.5s ease 0.72s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="section-title" style={{ marginBottom: 0 }}><Brain size={15} /> AI模型实时状态</div>
              <span style={{ fontSize: '0.68rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'blinkDot 1.5s ease infinite' }} />
                32个模型全部在线
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {[
                { name: 'CTR-DeepFM', qps: '120K', latency: '5ms', acc: '92.4%', color: '#e8365d' },
                { name: 'CVR-ESMM', qps: '95K', latency: '6ms', acc: '89.7%', color: '#e8365d' },
                { name: 'BidOptimizer', qps: '45K', latency: '12ms', acc: '94.2%', color: '#f97316' },
                { name: 'FraudDet-XGB', qps: '30K', latency: '15ms', acc: '96.8%', color: '#f59e0b' },
                { name: 'AnomalyLSTM', qps: '25K', latency: '18ms', acc: '95.1%', color: '#f59e0b' },
                { name: 'ContentLLM', qps: '8K', latency: '180ms', acc: '86.4%', color: '#8b5cf6' },
              ].map((m, i) => (
                <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-primary)', borderRadius: 8, borderLeft: `3px solid ${m.color}`, cursor: 'pointer' }}
                  onClick={() => {}} title={`点击查看 ${m.name} 详情`}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>QPS <strong style={{ color: m.color }}>{m.qps}</strong></span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>延迟 <strong style={{ color: 'var(--text-secondary)' }}>{m.latency}</strong></span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>准确率 <strong style={{ color: '#22c55e' }}>{m.acc}</strong></span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, textAlign: 'right', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              日推理总量 <strong style={{ color: '#ff7a95' }}>38.6M</strong> 次 · 平均延迟 <strong style={{ color: '#ff7a95' }}>62ms</strong> · <span style={{ color: '#e8365d', cursor: 'pointer' }}>查看全部32个模型 →</span>
            </div>
          </div>

          {/* AI Operations Feed */}
          <div className="card" style={{ marginBottom: 20, animation: 'fadeInUp 0.5s ease 0.8s both', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,54,93,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}>
            <div className="section-title" style={{ marginBottom: 12 }}><Bot size={16} /> AI实时操作流水</div>
            <div>
              {aiOperations.map((op, i) => (
                <div key={i} onClick={() => drillDown('operation', { index: i })} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < aiOperations.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', animation: `slideInRight 0.4s ease ${0.9 + i * 0.06}s both` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,54,93,0.03)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 38, flexShrink: 0, fontFamily: 'monospace' }}>{op.time}</span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: `${op.color}20`, color: op.color, flexShrink: 0 }}>{op.platform}</span>
                  <span style={{ fontSize: '0.75rem', flex: 1 }}>{op.action}</span>
                  <span style={{ fontSize: '0.65rem', color: op.confidence >= 90 ? '#34d399' : op.confidence >= 80 ? '#fbbf24' : '#f87171', flexShrink: 0, animation: op.confidence >= 95 ? 'pulseScale 2s ease infinite' : undefined }}>{op.confidence}%</span>
                  <ArrowRight size={10} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Efficiency */}
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease 1.2s both', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,54,93,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' }}>
            <div className="section-title" style={{ marginBottom: 12 }}><Zap size={16} /> AI vs 人工效率对比</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {efficiencyData.map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>{item.name}</div>
                  <div style={{ display: 'flex', justify: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.62rem', color: '#e8365d', marginBottom: 2 }}>AI</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#e8365d' }}>{item.AI}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 2 }}>人工</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.人工}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{item.unit}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Detail Panel */}
      {selectedDetail && (
        <div style={{ width: 360, borderLeft: '1px solid var(--border)', overflowY: 'auto', padding: 20, background: 'var(--bg-card)', flexShrink: 0, animation: 'slideInRight 0.3s ease both' }}>
          {renderDetailContent()}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes countRoll { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulseScale { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        @keyframes progressFill { from { width: 0%; } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes blinkDot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  )
}
