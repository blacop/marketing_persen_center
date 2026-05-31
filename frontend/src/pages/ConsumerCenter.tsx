import { useState } from 'react'
import {
  Users, TrendingUp, Heart, Gift, Target, Zap, BarChart3,
  Star, Crown, ShoppingBag, MessageCircle, Bell, Repeat,
  ArrowUpRight, ArrowDownRight, Sparkles, UserCheck, Share2,
  RefreshCw, Activity, Brain, Clock, Award, Send, Mail,
  Smartphone, ChevronRight, CheckCircle, AlertTriangle, Filter
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, FunnelChart, Funnel, LabelList
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── AI Config ────────────────────────────────────────────────────────────────
const consumerAIGroups: AIConfigGroup[] = [
  {
    title: '个性化推荐引擎',
    icon: <Sparkles size={16} />,
    params: [
      createParam('rec_diversity', '推荐多样性系数', 0.35, '', '控制推荐结果多样性，越高越能发现长尾商品，越低越精准', 0.35, 91, { min: 0.1, max: 0.9, step: 0.05, autoTuneEnabled: true, learningDataPoints: 182000, lastAdjusted: '1小时前' }),
      createParam('cold_start_boost', '冷启动加权', 1.8, 'x', '新用户冷启动期热门商品曝光加权倍率', 1.8, 88, { min: 1.0, max: 3.0, step: 0.1, autoTuneEnabled: true, learningDataPoints: 94000, lastAdjusted: '3小时前' }),
      createParam('rec_refresh_freq', '推荐刷新频率', 2, '小时', '用户行为驱动推荐列表刷新间隔', 2, 89, { min: 1, max: 24, autoTuneEnabled: true, learningDataPoints: 210000, lastAdjusted: '2小时前' }),
    ],
  },
  {
    title: '用户生命周期策略',
    icon: <Activity size={16} />,
    params: [
      createParam('churn_score_threshold', '流失预警分值', 0.72, '', '用户流失概率超过此值触发挽留流程，越低越敏感', 0.72, 86, { min: 0.5, max: 0.95, step: 0.01, autoTuneEnabled: true, learningDataPoints: 145000, lastAdjusted: '4小时前' }),
      createParam('winback_window', '召回窗口期', 45, '天', '沉睡用户在此天数内可触发召回，超过则标记流失', 45, 84, { min: 14, max: 120, autoTuneEnabled: true, learningDataPoints: 88000, lastAdjusted: '昨日' }),
      createParam('activation_nudge', '激活推送力度', 3, '次/周', '新用户激活期每周推送引导次数上限', 3, 87, { min: 1, max: 7, autoTuneEnabled: true, learningDataPoints: 62000, lastAdjusted: '2天前' }),
    ],
  },
]

const consumerLearningStatus: AILearningStatus = {
  modelVersion: 'v3.2.0-consumer-ops',
  lastTraining: '22分钟前',
  totalDataPoints: 4820000,
  avgConfidence: 91,
  autoAdjustCount24h: 312,
  learningRate: '0.001',
  nextTraining: '38分钟后',
  improvementRate: '+8.7%',
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)',
  padding: '20px 24px',
}
const COLORS = ['#e8365d', '#ff7a95', '#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#0ea5e9', '#f43f5e']
const tip = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.72rem' }

// ─── Tab Definitions ──────────────────────────────────────────────────────────
const TABS = ['用户总览', '生命周期', '会员积分', '个性化推荐', '全渠道触达', '复购激活', '留存分析', '社交裂变', '消费者洞察']

// ═══════════════════ Tab 1: 用户总览 ═══════════════════
const overviewKpis = [
  { label: '注册用户总量', value: '528.6万', sub: '月增+1.2万', icon: Users, color: '#e8365d', trend: 'up' },
  { label: '月活跃用户MAU', value: '186.4万', sub: '较上月+8.3%', icon: Activity, color: '#8b5cf6', trend: 'up' },
  { label: '付费转化率', value: '14.2%', sub: '较上月+1.8pp', icon: ShoppingBag, color: '#22c55e', trend: 'up' },
  { label: '用户平均LTV', value: '¥842', sub: '较上月+¥38', icon: TrendingUp, color: '#f59e0b', trend: 'up' },
  { label: '30日留存率', value: '61.4%', sub: '行业均值48%', icon: Heart, color: '#3b82f6', trend: 'up' },
  { label: '月复购率', value: '34.8%', sub: '较上月+2.1pp', icon: Repeat, color: '#0ea5e9', trend: 'up' },
  { label: '人均消费频次', value: '2.8次/月', sub: '较上月+0.3次', icon: Star, color: '#f43f5e', trend: 'up' },
  { label: '客户净推荐值NPS', value: '68', sub: '行业TOP 15%', icon: Award, color: '#10b981', trend: 'up' },
]

const userGrowthTrend = [
  { month: '10月', 新增用户: 12400, 活跃用户: 142000, 付费用户: 20200 },
  { month: '11月', 新增用户: 14800, 活跃用户: 151000, 付费用户: 22100 },
  { month: '12月', 新增用户: 18600, 新增用户2: 18600, 活跃用户: 162000, 付费用户: 24800 },
  { month: '1月', 新增用户: 11200, 活跃用户: 158000, 付费用户: 23400 },
  { month: '2月', 新增用户: 15600, 活跃用户: 171000, 付费用户: 26200 },
  { month: '3月', 新增用户: 17800, 活跃用户: 179000, 付费用户: 28100 },
  { month: '4月', 新增用户: 12000, 活跃用户: 186400, 付费用户: 26500 },
]

const lifecycleDist = [
  { name: '新用户(0-7天)', value: 8.2, color: '#3b82f6', count: '43.4万' },
  { name: '成长期(7-30天)', value: 14.6, color: '#22c55e', count: '77.2万' },
  { name: '活跃期(30-180天)', value: 38.4, color: '#8b5cf6', count: '203万' },
  { name: '成熟期(180天+)', value: 28.8, color: '#e8365d', count: '152万' },
  { name: '流失预警', value: 10.0, color: '#f59e0b', count: '52.8万' },
]

const channelAcqData = [
  { channel: '抖音', users: 182400, cost: '¥28.4', conversion: '11.2%', color: '#e8365d' },
  { channel: '小红书', users: 142800, cost: '¥35.2', conversion: '14.8%', color: '#ff7a95' },
  { channel: '快手', users: 98600, cost: '¥19.6', conversion: '8.4%', color: '#f59e0b' },
  { channel: 'KOL种草', users: 64200, cost: '¥52.1', conversion: '18.6%', color: '#8b5cf6' },
  { channel: '老带新', users: 48900, cost: '¥8.2', conversion: '22.4%', color: '#22c55e' },
  { channel: 'SEO/自然', users: 36400, cost: '¥4.8', conversion: '12.1%', color: '#3b82f6' },
]

// ═══════════════════ Tab 2: 生命周期 ═══════════════════
const lifecycleStages = [
  {
    stage: '获客', icon: '🎯', color: '#3b82f6',
    kpis: [
      { label: '本月新增', value: '12,000', unit: '人' },
      { label: '获客成本CAC', value: '¥28.4', unit: '' },
      { label: '渠道ROI', value: '3.8x', unit: '' },
    ],
    agents: ['Meta广告智能投手', 'TikTok全球投流智能体'],
    aiTip: 'KOL种草渠道ROI=5.2x，建议提升占比至35%；抖音DPA广告获客成本下降空间较大',
  },
  {
    stage: '激活', icon: '⚡', color: '#22c55e',
    kpis: [
      { label: '7日激活率', value: '68.4%', unit: '' },
      { label: '首购转化', value: '19.2%', unit: '' },
      { label: '平均激活天数', value: '3.2', unit: '天' },
    ],
    agents: ['复购激活智能体'],
    aiTip: '新用户第3天是激活关键节点，发送个性化色号推荐可提升激活率约12%',
  },
  {
    stage: '留存', icon: '💫', color: '#8b5cf6',
    kpis: [
      { label: '30日留存', value: '61.4%', unit: '' },
      { label: '90日留存', value: '42.8%', unit: '' },
      { label: '流失率/月', value: '8.6%', unit: '' },
    ],
    agents: ['搜索内容优化智能体', '直播间视觉优化智能体'],
    aiTip: '购买眼影盘的用户30日留存高出均值18pp，建议引导新用户首购眼影类产品',
  },
  {
    stage: '复购', icon: '🔄', color: '#e8365d',
    kpis: [
      { label: '月复购率', value: '34.8%', unit: '' },
      { label: '复购间隔', value: '38', unit: '天' },
      { label: '二购转化率', value: '41.6%', unit: '' },
    ],
    agents: ['复购激活智能体', '库存联动投放智能体'],
    aiTip: 'AI预测次月复购高风险用户18.4万人，提前7天个性化触达可回收GMV约¥280万',
  },
  {
    stage: '传播', icon: '📣', color: '#f59e0b',
    kpis: [
      { label: '老带新贡献率', value: '9.2%', unit: '' },
      { label: '分享率', value: '14.6%', unit: '' },
      { label: '转介绍客单价', value: '¥224', unit: '' },
    ],
    agents: ['内容分发协同智能体'],
    aiTip: '钻石会员分享率高达42%，激励政策ROI=6.8x，建议扩大裂变激励覆盖至金卡以上',
  },
]

const lifecycleFunnelData = [
  { name: '访客', value: 4560000, fill: '#3b82f6' },
  { name: '注册用户', value: 528600, fill: '#8b5cf6' },
  { name: '激活用户', value: 361400, fill: '#22c55e' },
  { name: '首购用户', value: 101500, fill: '#e8365d' },
  { name: '复购用户', value: 35300, fill: '#f59e0b' },
  { name: '高忠诚用户', value: 8400, fill: '#10b981' },
]

const churnPrediction = [
  { segment: '高净值用户', total: 23400, atRisk: 1820, riskRate: '7.8%', estimatedLoss: '¥145万', action: '专属客服1v1联系' },
  { segment: '活跃种草用户', total: 128000, atRisk: 14200, riskRate: '11.1%', estimatedLoss: '¥89万', action: '个性化推荐+限时优惠' },
  { segment: '普通购买用户', total: 456000, atRisk: 68400, riskRate: '15.0%', estimatedLoss: '¥162万', action: '自动化邮件/推送召回' },
]

const onboardingFlow = [
  { step: '注册成功', rate: 100, color: '#3b82f6' },
  { step: '完善资料', rate: 72.4, color: '#8b5cf6' },
  { step: '浏览首页', rate: 88.6, color: '#22c55e' },
  { step: '加购商品', rate: 34.2, color: '#f59e0b' },
  { step: '完成首购', rate: 19.2, color: '#e8365d' },
  { step: '7天复访', rate: 45.8, color: '#10b981' },
]

// ═══════════════════ Tab 3: 会员积分 ═══════════════════
const memberTiers = [
  { tier: '普通会员', icon: '⭐', color: '#94a3b8', threshold: '¥0', users: 306600, pct: 58, perks: ['免费生日礼', '积分1倍'], avgSpend: '¥186', retRate: '18%' },
  { tier: '银卡会员', icon: '🥈', color: '#64748b', threshold: '≥¥500', users: 132000, pct: 25, perks: ['专属折扣9.5折', '积分1.5倍', '优先客服'], avgSpend: '¥380', retRate: '32%' },
  { tier: '金卡会员', icon: '🥇', color: '#f59e0b', threshold: '≥¥1,500', users: 63400, pct: 12, perks: ['8.8折', '积分2倍', '新品优先', '免费小样'], avgSpend: '¥680', retRate: '48%' },
  { tier: '钻石会员', icon: '💎', color: '#8b5cf6', threshold: '≥¥5,000', users: 26400, pct: 5, perks: ['8折', '积分3倍', '专属活动', '1v1顾问', '生日礼盒'], avgSpend: '¥1,450', retRate: '67%' },
]

const pointsOverview = [
  { label: '今日新增积分', value: '2,842万', icon: Star, color: '#f59e0b' },
  { label: '今日消耗积分', value: '890万', icon: Gift, color: '#e8365d' },
  { label: '待兑换积分总量', value: '18.6亿', icon: Award, color: '#8b5cf6' },
  { label: '积分兑换率', value: '24.8%', icon: RefreshCw, color: '#22c55e' },
]

const pointsHistory = [
  { date: '3/30', 新增: 2640, 消耗: 780 },
  { date: '3/31', 新增: 2880, 消耗: 920 },
  { date: '4/1', 新增: 3420, 消耗: 1080 },
  { date: '4/2', 新增: 2760, 消耗: 820 },
  { date: '4/3', 新增: 3180, 消耗: 960 },
  { date: '4/4', 新增: 3560, 消耗: 1140 },
  { date: '4/5', 新增: 2842, 消耗: 890 },
]

const pointsExchangeItems = [
  { name: '满100积分抵1元券', used: 482600, stock: '不限', redemptionRate: '36.8%', cost: '¥0.01/分' },
  { name: '唇釉小样(10ml)', used: 124800, stock: '5,200份', redemptionRate: '62.4%', cost: '¥18/份' },
  { name: '限定礼袋(会员日)', used: 48200, stock: '2,000份', redemptionRate: '89.2%', cost: '¥38/份' },
  { name: '500积分兑换生日礼', used: 28600, stock: '按需', redemptionRate: '54.6%', cost: '¥25/份' },
  { name: '积分抽奖次数', used: 386000, stock: '不限', redemptionRate: '28.4%', cost: '¥2/次' },
]

const tierUpgradeData = [
  { month: '1月', 升卡数: 2840, 降卡数: 680 },
  { month: '2月', 升卡数: 3120, 降卡数: 540 },
  { month: '3月', 升卡数: 3680, 降卡数: 620 },
  { month: '4月', 升卡数: 2960, 降卡数: 480 },
]

// ═══════════════════ Tab 4: 个性化推荐 ═══════════════════
const recEngineMetrics = [
  { label: '推荐点击率CTR', value: '18.6%', sub: '↑2.4pp', icon: Target, color: '#e8365d' },
  { label: '推荐转化率CVR', value: '8.4%', sub: '↑1.1pp', icon: ShoppingBag, color: '#22c55e' },
  { label: '推荐贡献GMV', value: '¥284万', sub: '占比32.6%', icon: TrendingUp, color: '#f59e0b' },
  { label: '人均推荐曝光', value: '12.4次/日', sub: '↑1.8次', icon: Sparkles, color: '#8b5cf6' },
]

const recScenarios = [
  { scene: '首页猜你喜欢', model: 'DeepFM协同过滤', ctr: '22.4%', cvr: '9.6%', gmvContrib: '¥92万', status: 'online' },
  { scene: '商品详情页推荐', model: 'Item2Vec相似推荐', ctr: '16.8%', cvr: '7.2%', gmvContrib: '¥68万', status: 'online' },
  { scene: '购物车搭配推荐', model: '关联规则+MBR', ctr: '28.6%', cvr: '14.4%', gmvContrib: '¥54万', status: 'online' },
  { scene: '直播间实时推荐', model: 'LSTM序列预测', ctr: '19.2%', cvr: '11.8%', gmvContrib: '¥48万', status: 'online' },
  { scene: '社群内容推荐', model: 'BERT语义匹配', ctr: '14.4%', cvr: '5.8%', gmvContrib: '¥22万', status: 'online' },
  { scene: '离线Push推荐', model: 'Wide&Deep混合', ctr: '8.6%', cvr: '4.2%', gmvContrib: '¥18万', status: 'testing' },
]

const recUserProfiles = [
  { type: '唇妆爱好者', users: '42.8万', topRec: '唇釉/口红/唇线笔', avgCTR: '26.4%', insight: '对色号多样性敏感，喜欢试色内容' },
  { type: '底妆专注者', users: '38.6万', topRec: '粉底液/气垫/遮瑕膏', avgCTR: '22.8%', insight: '持续复购同类，注重成分和持妆力' },
  { type: '综合彩妆族', users: '96.4万', topRec: '眼影/腮红/高光套装', avgCTR: '18.2%', insight: '跟随KOL种草，对新品首发敏感' },
  { type: '护肤+彩妆跨界', users: '64.2万', topRec: '素颜霜/有色护肤品', avgCTR: '15.6%', insight: '追求简化妆容，功效诉求强' },
]

const recABTest = [
  { test: '协同过滤 vs DeepFM', winner: 'DeepFM', improvement: '+18.4% CVR', status: '已上线' },
  { test: '固定8格 vs 动态数量', winner: '动态数量', improvement: '+6.2% GMV', status: '已上线' },
  { test: '实时更新 vs 2小时缓存', winner: '实时更新', improvement: '+11.8% CTR', status: '测试中' },
  { test: '无解释 vs 推荐理由', winner: '推荐理由版', improvement: '+8.6% CTR', status: '已上线' },
]

// ═══════════════════ Tab 5: 全渠道触达 ═══════════════════
const channelStats = [
  { channel: 'Push通知', icon: Bell, color: '#e8365d', sent: '128.6万', openRate: '24.8%', ctr: '8.4%', cvr: '3.2%', gmv: '¥68万', trend: 'up' },
  { channel: '企微消息', icon: MessageCircle, color: '#22c55e', sent: '86.4万', openRate: '68.4%', ctr: '18.6%', cvr: '8.8%', gmv: '¥124万', trend: 'up' },
  { channel: '短信SMS', icon: Smartphone, color: '#8b5cf6', sent: '42.8万', openRate: '92.6%', ctr: '4.2%', cvr: '1.8%', gmv: '¥28万', trend: 'stable' },
  { channel: '邮件Email', icon: Mail, color: '#3b82f6', sent: '18.4万', openRate: '32.4%', ctr: '6.8%', cvr: '2.4%', gmv: '¥18万', trend: 'up' },
  { channel: '小程序内消息', icon: Send, color: '#f59e0b', sent: '64.2万', openRate: '54.6%', ctr: '12.8%', cvr: '6.4%', gmv: '¥86万', trend: 'up' },
]

const activeCampaigns = [
  { name: '春季新品焕新提醒', type: 'Push', status: '进行中', target: '活跃用户', sent: '28.6万', openRate: '26.4%', cvr: '3.8%', gmv: '¥18.4万', endDate: '4/10' },
  { name: '沉睡30天唤醒', type: '企微', status: '进行中', target: '沉睡用户', sent: '12.4万', openRate: '72.8%', cvr: '5.6%', gmv: '¥8.2万', endDate: '持续' },
  { name: '会员日专属礼包通知', type: '短信', status: '进行中', target: '金卡+钻石', sent: '8.9万', openRate: '94.2%', cvr: '12.4%', gmv: '¥24.6万', endDate: '4/15' },
  { name: '购物车遗弃挽回', type: 'Push', status: '自动化', target: '加购未付款', sent: '36.8万', openRate: '18.6%', cvr: '6.2%', gmv: '¥32.4万', endDate: '持续' },
  { name: '复购智能提醒', type: '企微', status: '自动化', target: 'AI预测复购', sent: '24.4万', openRate: '64.8%', cvr: '9.4%', gmv: '¥42.8万', endDate: '持续' },
  { name: '生日月专属福利', type: '全渠道', status: '自动化', target: '本月生日用户', sent: '6.8万', openRate: '82.4%', cvr: '18.6%', gmv: '¥28.4万', endDate: '持续' },
]

const journeyBuilder = [
  { step: '用户注册', trigger: '立即', action: '发送欢迎礼券 (满88减20)', channels: ['Push', '企微'], convRate: '72.4%' },
  { step: '第3天未购', trigger: '+3天', action: '发送个性化推荐+首单9折', channels: ['Push', '邮件'], convRate: '18.6%' },
  { step: '第7天未激活', trigger: '+7天', action: '发送KOL种草视频+场景种草', channels: ['Push', '企微'], convRate: '12.4%' },
  { step: '首购完成', trigger: '购后1天', action: '发送使用教程+搭配推荐', channels: ['企微', '邮件'], convRate: '48.6%' },
  { step: '购后14天', trigger: '+14天', action: '邀请评价+积分奖励', channels: ['Push', '短信'], convRate: '36.8%' },
  { step: '30天未复购', trigger: '+30天', action: '专属复购券+个性化色号推荐', channels: ['企微', 'Push'], convRate: '24.4%' },
]

// ═══════════════════ Tab 6: 复购激活 ═══════════════════
const repurchaseMetrics = [
  { label: '月复购率', value: '34.8%', sub: '↑2.1pp', color: '#22c55e' },
  { label: '平均复购间隔', value: '38天', sub: '↓4天', color: '#e8365d' },
  { label: '二购转化率', value: '41.6%', sub: '↑3.2pp', color: '#8b5cf6' },
  { label: '复购贡献GMV', value: '¥682万', sub: '占比46.8%', color: '#f59e0b' },
]

const rfmSegments = [
  { segment: '冠军客户', r: 5, f: 5, m: 5, users: '2.3万', gmv: '¥284万', strategy: '感恩回馈+新品先享+私信维系', color: '#f59e0b' },
  { segment: '忠诚客户', r: 4, f: 4, m: 4, users: '8.6万', gmv: '¥186万', strategy: '会员权益升级+专属折扣', color: '#e8365d' },
  { segment: '潜力客户', r: 3, f: 3, m: 3, users: '24.8万', gmv: '¥124万', strategy: '复购提醒+搭配推荐+场景内容', color: '#8b5cf6' },
  { segment: '新客户', r: 5, f: 1, m: 2, users: '12.4万', gmv: '¥42万', strategy: '新手引导+首单回馈+满减叠加', color: '#3b82f6' },
  { segment: '需要关注', r: 2, f: 2, m: 3, users: '38.4万', gmv: '¥68万', strategy: '限时优惠+个性化推荐', color: '#22c55e' },
  { segment: '流失预警', r: 1, f: 2, m: 2, users: '28.6万', gmv: '-', strategy: 'AI召回+老客专属优惠', color: '#ef4444' },
  { segment: '已流失', r: 1, f: 1, m: 1, users: '52.4万', gmv: '-', strategy: '情感唤醒+超值折扣+老客认证', color: '#94a3b8' },
]

const repurchaseTrend = [
  { month: '10月', 复购率: 28.4, 新客率: 71.6 },
  { month: '11月', 复购率: 29.8, 新客率: 70.2 },
  { month: '12月', 复购率: 31.2, 新客率: 68.8 },
  { month: '1月', 复购率: 30.6, 新客率: 69.4 },
  { month: '2月', 复购率: 32.8, 新客率: 67.2 },
  { month: '3月', 复购率: 33.4, 新客率: 66.6 },
  { month: '4月', 复购率: 34.8, 新客率: 65.2 },
]

const winbackCampaigns = [
  { name: '30天沉睡唤醒', status: '进行中', targetUsers: 28600, contacted: 18400, reconverted: 2840, rateStr: '15.4%', gmv: '¥48.6万' },
  { name: '60天深度流失召回', status: '进行中', targetUsers: 14200, contacted: 8600, reconverted: 620, rateStr: '7.2%', gmv: '¥12.4万' },
  { name: '90天失联VIP专属礼', status: '计划中', targetUsers: 3200, contacted: 0, reconverted: 0, rateStr: '-', gmv: '-' },
]

// ═══════════════════ Tab 7: 留存分析 ═══════════════════
const cohortData = [
  { cohort: '2月第1周', d1: 72.4, d3: 58.6, d7: 48.2, d14: 38.4, d30: 28.6, d60: 18.4, d90: 12.8 },
  { cohort: '2月第2周', d1: 71.8, d3: 57.4, d7: 46.8, d14: 37.2, d30: 27.4, d60: 17.8, d90: 12.2 },
  { cohort: '2月第3周', d1: 73.2, d3: 59.8, d7: 49.4, d14: 39.6, d30: 29.8, d60: 19.2, d90: 13.4 },
  { cohort: '2月第4周', d1: 74.6, d3: 61.2, d7: 51.8, d14: 41.4, d30: 31.6, d60: null, d90: null },
  { cohort: '3月第1周', d1: 75.8, d3: 62.4, d7: 52.6, d14: 42.8, d30: 32.4, d60: null, d90: null },
  { cohort: '3月第2周', d1: 76.2, d3: 63.8, d7: 53.4, d14: 43.6, d30: null, d60: null, d90: null },
  { cohort: '3月第3周', d1: 77.4, d3: 65.2, d7: 55.2, d14: null, d30: null, d60: null, d90: null },
  { cohort: '3月第4周', d1: 78.6, d3: 66.8, d7: null, d14: null, d30: null, d60: null, d90: null },
]

const retentionTrend = [
  { period: 'D1', 全体用户: 74.8, 活跃用户: 92.4, 付费用户: 96.8 },
  { period: 'D3', 全体用户: 58.6, 活跃用户: 82.6, 付费用户: 94.2 },
  { period: 'D7', 全体用户: 48.2, 活跃用户: 72.4, 付费用户: 88.6 },
  { period: 'D14', 全体用户: 38.4, 活跃用户: 62.8, 付费用户: 82.4 },
  { period: 'D30', 全体用户: 28.6, 活跃用户: 54.6, 付费用户: 74.8 },
  { period: 'D60', 全体用户: 18.4, 活跃用户: 44.8, 付费用户: 64.2 },
  { period: 'D90', 全体用户: 13.2, 活跃用户: 38.6, 付费用户: 58.4 },
]

const retentionBySource = [
  { source: 'KOL种草', d30: 38.6, d90: 24.8, ltv: '¥1,240' },
  { source: '抖音广告', d30: 28.4, d90: 16.2, ltv: '¥680' },
  { source: '老带新裂变', d30: 48.6, d90: 32.4, ltv: '¥1,620' },
  { source: '小红书种草', d30: 34.8, d90: 22.6, ltv: '¥920' },
  { source: 'SEO自然搜索', d30: 42.4, d90: 28.6, ltv: '¥1,080' },
  { source: '企微导购', d30: 58.6, d90: 42.4, ltv: '¥2,380' },
]

const churnReasons = [
  { reason: '价格偏高/性价比不足', pct: 32, action: '调整差异化定价/积分抵现' },
  { reason: '产品不符合预期', pct: 24, action: '改进产品描述+试用装引导' },
  { reason: '竞品有吸引力', pct: 18, action: '差异化内容/独家权益' },
  { reason: '触达太频繁/骚扰', pct: 12, action: '优化推送频率/偏好设置' },
  { reason: '忘记了品牌', pct: 14, action: '提升品牌内容曝光/情感连接' },
]

// ═══════════════════ Tab 8: 社交裂变 ═══════════════════
const viralMetrics = [
  { label: '今日新增裂变用户', value: '2,840', sub: '↑18.6%', icon: Share2, color: '#e8365d' },
  { label: '老带新成功率', value: '22.4%', sub: '↑2.8pp', icon: UserCheck, color: '#22c55e' },
  { label: '病毒系数K', value: '0.28', sub: '目标0.5', icon: Zap, color: '#f59e0b' },
  { label: '裂变GMV贡献', value: '¥48.6万', sub: '占比6.8%', icon: TrendingUp, color: '#8b5cf6' },
]

const referralPrograms = [
  { name: '老带新双倍奖励', type: '邀请注册', status: '进行中', participants: 48600, invites: 124800, success: 28400, rate: '22.8%', cost: '¥18/单', roi: '4.8x' },
  { name: '分享得积分', type: '内容分享', status: '进行中', participants: 164000, invites: 486000, success: 124000, rate: '25.5%', cost: '¥8/单', roi: '6.2x' },
  { name: 'KOC专属推广码', type: 'KOC裂变', status: '进行中', participants: 8600, invites: 284000, success: 68400, rate: '24.1%', cost: '¥12/单', roi: '5.4x' },
  { name: '拼团优惠', type: '拼团', status: '测试中', participants: 12400, invites: 38600, success: 8200, rate: '21.2%', cost: '¥6/单', roi: '7.2x' },
]

const viralTrend = [
  { date: '3/30', 裂变新用户: 1840, 裂变GMV: 28400 },
  { date: '3/31', 裂变新用户: 2120, 裂变GMV: 32600 },
  { date: '4/1', 裂变新用户: 2840, 裂变GMV: 42800 },
  { date: '4/2', 裂变新用户: 2460, 裂变GMV: 38200 },
  { date: '4/3', 裂变新用户: 3180, 裂变GMV: 48600 },
  { date: '4/4', 裂变新用户: 2960, 裂变GMV: 44800 },
  { date: '4/5', 裂变新用户: 2840, 裂变GMV: 42800 },
]

const topReferrers = [
  { userId: 'USR-**2819', tier: '钻石', referrals: 84, gmvGenerated: '¥12,640', rewardEarned: '¥1,512' },
  { userId: 'USR-**4402', tier: '金卡', referrals: 62, gmvGenerated: '¥9,300', rewardEarned: '¥1,116' },
  { userId: 'USR-**7831', tier: '钻石', referrals: 58, gmvGenerated: '¥8,700', rewardEarned: '¥1,044' },
  { userId: 'USR-**1265', tier: '银卡', referrals: 45, gmvGenerated: '¥6,750', rewardEarned: '¥810' },
  { userId: 'USR-**9024', tier: '金卡', referrals: 38, gmvGenerated: '¥5,700', rewardEarned: '¥684' },
]

// ═══════════════════ Tab 9: 消费者洞察 ═══════════════════
const ageDistribution = [
  { age: '18-22岁', value: 18.4, color: '#e8365d' },
  { age: '23-27岁', value: 32.6, color: '#ff7a95' },
  { age: '28-32岁', value: 26.8, color: '#8b5cf6' },
  { age: '33-38岁', value: 14.2, color: '#3b82f6' },
  { age: '39岁+', value: 8.0, color: '#94a3b8' },
]

const cityTierDist = [
  { tier: '一线城市', value: 34.2, gmvPct: 48.6 },
  { tier: '新一线', value: 28.6, gmvPct: 26.4 },
  { tier: '二线城市', value: 22.4, gmvPct: 16.8 },
  { tier: '三线及以下', value: 14.8, gmvPct: 8.2 },
]

const behaviorInsights = [
  { insight: '购买时段集中', detail: '晚上9-11点购买占比42.8%，周末下午3-5点次之', action: '集中该时段优化推送和直播' },
  { insight: '种草→购买均值', detail: '平均从看到种草内容到购买需要4.2天，高客单品7.8天', action: '在黄金窗口期加强触达和优惠' },
  { insight: '搭配购买规律', detail: '唇釉购买用户82%在3个月内购买粉底液，交叉销售机会明显', action: '设计唇妆+底妆套装推荐链路' },
  { insight: '价格敏感分析', detail: '满减活动日销量提升86%，但非活动日原价购买用户LTV高42%', action: '区分价格敏感与品质敏感用户运营策略' },
  { insight: '内容偏好分布', detail: '成分科普>试色测评>妆容教程>开箱>品牌故事，满足率依次递减', action: '加大成分科普内容生产，满足Z世代诉求' },
  { insight: '复购品类规律', detail: '唇釉平均36天复购，粉底液52天，眼影98天，体现品类复购周期差异', action: '按品类复购周期精准设置提醒时间' },
]

const productAffinityMatrix = [
  { from: '唇釉', to: '口红', affinity: 82 },
  { from: '唇釉', to: '粉底液', affinity: 64 },
  { from: '眼影', to: '眼线笔', affinity: 78 },
  { from: '粉底液', to: '遮瑕膏', affinity: 86 },
  { from: '腮红', to: '高光', affinity: 72 },
  { from: '睫毛膏', to: '眼影', affinity: 58 },
]

const satisfactionScore = [
  { dimension: '产品质量', score: 4.6, benchmark: 4.2 },
  { dimension: '包装设计', score: 4.7, benchmark: 4.0 },
  { dimension: '色号丰富度', score: 4.3, benchmark: 4.1 },
  { dimension: '性价比', score: 3.9, benchmark: 4.3 },
  { dimension: '配送速度', score: 4.4, benchmark: 4.4 },
  { dimension: '客服响应', score: 4.2, benchmark: 4.1 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, trend }: { label: string; value: string; sub: string; icon: any; color: string; trend?: string }) {
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>{children}</div>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    '进行中': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    '自动化': { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
    '计划中': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    '测试中': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    '已上线': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    'online':  { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    'testing': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  }
  const style = map[status] || { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: style.bg, color: style.color }}>
      {status}
    </span>
  )
}

// ─── Tab Components ───────────────────────────────────────────────────────────

function TabOverview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {overviewKpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* User Growth Trend */}
        <div style={card}>
          <SectionTitle>用户增长趋势（近7个月）</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={userGrowthTrend} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="活跃用户" fill="rgba(232,54,93,0.08)" stroke="#e8365d" strokeWidth={2} />
              <Bar dataKey="新增用户" fill="#8b5cf6" radius={[3,3,0,0]} />
              <Line type="monotone" dataKey="付费用户" stroke="#22c55e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Lifecycle Distribution */}
        <div style={card}>
          <SectionTitle>用户生命周期分布</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={lifecycleDist} cx="50%" cy="50%" innerRadius={46} outerRadius={72} dataKey="value" paddingAngle={2}>
                {lifecycleDist.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tip} formatter={(v: any) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {lifecycleDist.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>{d.count} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acquisition Channels */}
      <div style={card}>
        <SectionTitle>获客渠道效率分析</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['渠道', '新增用户', '获客成本CAC', '首购转化率', '渠道评级'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channelAcqData.map(r => (
              <tr key={r.channel} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '11px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: r.color, marginRight: 8 }} />
                  {r.channel}
                </td>
                <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{r.users.toLocaleString()}</td>
                <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{r.cost}</td>
                <td style={{ padding: '11px 12px', color: 'var(--text-secondary)' }}>{r.conversion}</td>
                <td style={{ padding: '11px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: r.conversion, background: r.color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: r.color, fontWeight: 600 }}>{r.conversion}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabLifecycle() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stage Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {lifecycleStages.map(s => (
          <div key={s.stage} style={{ ...card, borderTop: `3px solid ${s.color}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.stage}</span>
            </div>
            {s.kpis.map(k => (
              <div key={k.label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.label}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{k.value}<span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{k.unit}</span></div>
              </div>
            ))}
            <div style={{ padding: '8px 10px', background: s.color + '10', borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <span style={{ color: s.color, fontWeight: 600 }}>AI建议: </span>{s.aiTip}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {s.agents.map(a => <span key={a} style={{ display: 'inline-block', background: s.color + '15', color: s.color, borderRadius: 4, padding: '1px 6px', marginRight: 4, marginBottom: 3 }}>{a}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Funnel */}
        <div style={card}>
          <SectionTitle>用户转化漏斗</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lifecycleFunnelData.map((d, i) => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{d.name}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{d.value.toLocaleString()}</span>
                </div>
                <div style={{ height: 24, background: 'var(--border-light)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%', borderRadius: 6,
                    width: `${(d.value / lifecycleFunnelData[0].value) * 100}%`,
                    background: d.fill, opacity: 0.85
                  }} />
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--text-muted)' }}>
                    {((d.value / lifecycleFunnelData[0].value) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Flow */}
        <div style={card}>
          <SectionTitle>新用户激活路径</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {onboardingFlow.map((step, i) => (
              <div key={step.step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: step.color + '20', border: `2px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: step.color, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{step.step}</span>
                    <span style={{ color: step.color, fontWeight: 700 }}>{step.rate}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${step.rate}%`, background: step.color, borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Churn Prediction */}
      <div style={card}>
        <SectionTitle>AI流失预测与挽留计划</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['用户分群', '总用户数', '高风险用户', '风险率', '预计损失GMV', '建议挽留策略'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {churnPrediction.map(r => (
              <tr key={r.segment} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.segment}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.total.toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#f97316', fontWeight: 600 }}>{r.atRisk.toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#ef4444' }}>{r.riskRate}</td>
                <td style={{ padding: '12px', color: '#e8365d', fontWeight: 700 }}>{r.estimatedLoss}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: 12 }}>{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabMembership() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Points Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {pointsOverview.map(k => <KpiCard key={k.label} label={k.label} value={k.value} sub="" icon={k.icon} color={k.color} />)}
      </div>

      {/* Tier Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {memberTiers.map(t => (
          <div key={t.tier} style={{ ...card, borderTop: `3px solid ${t.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.tier}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>门槛: {t.threshold}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ textAlign: 'center', padding: 10, background: t.color + '10', borderRadius: 8 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: t.color }}>{t.users.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>人数({t.pct}%)</div>
              </div>
              <div style={{ textAlign: 'center', padding: 10, background: 'rgba(232,54,93,0.06)', borderRadius: 8 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#e8365d' }}>{t.retRate}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>30日留存</div>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>专属权益</div>
              {t.perks.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <CheckCircle size={12} color={t.color} />
                  {p}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              人均消费: <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.avgSpend}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Points trend */}
        <div style={card}>
          <SectionTitle>积分每日流水（近7日）</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pointsHistory} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="新增" fill="#22c55e" radius={[3,3,0,0]} name="新增(万分)" />
              <Bar dataKey="消耗" fill="#e8365d" radius={[3,3,0,0]} name="消耗(万分)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier upgrade */}
        <div style={card}>
          <SectionTitle>会员升降卡趋势</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tierUpgradeData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="升卡数" fill="#22c55e" radius={[3,3,0,0]} />
              <Bar dataKey="降卡数" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exchange Items */}
      <div style={card}>
        <SectionTitle>积分兑换商品表现</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['兑换商品', '本月使用量', '库存状态', '兑换率', '单位成本'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pointsExchangeItems.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.used.toLocaleString()}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.stock}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: r.redemptionRate, background: '#e8365d', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#e8365d', fontWeight: 600 }}>{r.redemptionRate}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabRecommendation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {recEngineMetrics.map(k => <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} icon={k.icon} color={k.color} />)}
      </div>

      {/* Recommendation Scenarios */}
      <div style={card}>
        <SectionTitle>推荐场景效果矩阵</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['推荐场景', '底层模型', '点击率CTR', '转化率CVR', 'GMV贡献', '状态'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recScenarios.map(r => (
              <tr key={r.scene} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.scene}</td>
                <td style={{ padding: '12px' }}><span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>{r.model}</span></td>
                <td style={{ padding: '12px', color: '#22c55e', fontWeight: 600 }}>{r.ctr}</td>
                <td style={{ padding: '12px', color: '#f59e0b', fontWeight: 600 }}>{r.cvr}</td>
                <td style={{ padding: '12px', color: '#e8365d', fontWeight: 700 }}>{r.gmvContrib}</td>
                <td style={{ padding: '12px' }}><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* User Profiles */}
        <div style={card}>
          <SectionTitle>用户推荐偏好分群</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recUserProfiles.map(u => (
              <div key={u.type} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{u.type}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.users}用户 · CTR {u.avgCTR}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8b5cf6', marginBottom: 4 }}>推荐品类: {u.topRec}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>洞察: {u.insight}</div>
              </div>
            ))}
          </div>
        </div>

        {/* A/B Tests */}
        <div style={card}>
          <SectionTitle>推荐算法A/B实验记录</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recABTest.map(t => (
              <div key={t.test} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-light)', background: 'var(--bg-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{t.test}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>胜出: {t.winner}</span>
                  <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>↑ {t.improvement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabChannels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Channel Performance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {channelStats.map(ch => (
          <div key={ch.channel} style={{ ...card, borderLeft: `4px solid ${ch.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ch.icon size={16} color={ch.color} />
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{ch.channel}</span>
            </div>
            {[
              { label: '发送量', value: ch.sent },
              { label: '打开率', value: ch.openRate },
              { label: '点击率', value: ch.ctr },
              { label: '转化率', value: ch.cvr },
              { label: 'GMV贡献', value: ch.gmv },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Active Campaigns */}
      <div style={card}>
        <SectionTitle>活跃营销活动（含自动化）</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['活动名称', '渠道', '状态', '目标用户', '发送量', '打开率', '转化率', 'GMV', '截止日期'].map(h => (
                <th key={h} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeCampaigns.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '11px 10px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{r.name}</td>
                <td style={{ padding: '11px 10px', fontSize: 11 }}><span style={{ padding: '2px 7px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>{r.type}</span></td>
                <td style={{ padding: '11px 10px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '11px 10px', color: 'var(--text-secondary)', fontSize: 12 }}>{r.target}</td>
                <td style={{ padding: '11px 10px', color: 'var(--text-secondary)' }}>{r.sent}</td>
                <td style={{ padding: '11px 10px', color: '#22c55e', fontWeight: 600 }}>{r.openRate}</td>
                <td style={{ padding: '11px 10px', color: '#f59e0b', fontWeight: 600 }}>{r.cvr}</td>
                <td style={{ padding: '11px 10px', color: '#e8365d', fontWeight: 700 }}>{r.gmv}</td>
                <td style={{ padding: '11px 10px', color: 'var(--text-muted)', fontSize: 12 }}>{r.endDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Journey Builder */}
      <div style={card}>
        <SectionTitle>自动化用户旅程（新用户激活流）</SectionTitle>
        <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', overflowX: 'auto', padding: '4px 0 8px' }}>
          {journeyBuilder.map((step, i) => (
            <div key={step.step} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: 168, padding: '14px 12px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{step.trigger}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{step.step}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{step.action}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                  {step.channels.map(ch => (
                    <span key={ch} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'rgba(232,54,93,0.1)', color: '#e8365d' }}>{ch}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>✓ {step.convRate}</div>
              </div>
              {i < journeyBuilder.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px', marginTop: 36 }}>
                  <ChevronRight size={18} color="#94a3b8" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabRepurchase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {repurchaseMetrics.map(k => (
          <div key={k.label} style={{ ...card, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>{k.label}</div>
            <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={card}>
          <SectionTitle>复购率趋势（月度）</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={repurchaseTrend} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} formatter={(v: any) => [`${v}%`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="复购率" stroke="#e8365d" fill="rgba(232,54,93,0.12)" strokeWidth={2} name="复购率(%)" />
              <Area type="monotone" dataKey="新客率" stroke="#3b82f6" fill="rgba(59,130,246,0.06)" strokeWidth={2} name="新客率(%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Win-back campaigns */}
        <div style={card}>
          <SectionTitle>召回活动实时效果</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {winbackCampaigns.map(c => (
              <div key={c.name} style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11 }}>
                  <span style={{ color: 'var(--text-muted)' }}>目标: <strong>{c.targetUsers.toLocaleString()}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>已触达: <strong>{c.contacted.toLocaleString()}</strong></span>
                  <span style={{ color: '#22c55e' }}>召回: <strong>{c.reconverted.toLocaleString()}</strong></span>
                  <span style={{ color: '#f59e0b' }}>召回率: <strong>{c.rateStr}</strong></span>
                </div>
                {c.gmv !== '-' && <div style={{ marginTop: 6, fontSize: 12, color: '#e8365d', fontWeight: 700 }}>贡献GMV: {c.gmv}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RFM Segments */}
      <div style={card}>
        <SectionTitle>RFM用户分层与精准运营策略</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['分层名称', 'R分', 'F分', 'M分', '用户数', '贡献GMV', '推荐策略'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rfmSegments.map(r => (
              <tr key={r.segment} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: r.color, display: 'inline-block' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.segment}</span>
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 4, background: `rgba(232,54,93,${r.r * 0.1})`, color: r.r >= 4 ? '#e8365d' : 'var(--text-secondary)' }}>{r.r}</span></td>
                <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 4, background: `rgba(34,197,94,${r.f * 0.1})`, color: r.f >= 4 ? '#22c55e' : 'var(--text-secondary)' }}>{r.f}</span></td>
                <td style={{ padding: '12px', textAlign: 'center' }}><span style={{ padding: '2px 8px', borderRadius: 4, background: `rgba(245,158,11,${r.m * 0.1})`, color: r.m >= 4 ? '#f59e0b' : 'var(--text-secondary)' }}>{r.m}</span></td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.users}</td>
                <td style={{ padding: '12px', color: '#e8365d', fontWeight: 700 }}>{r.gmv}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: 12 }}>{r.strategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabRetention() {
  const cohortCols = ['D1', 'D3', 'D7', 'D14', 'D30', 'D60', 'D90']
  const getVal = (row: any, col: string) => row[col.toLowerCase()]
  const getColor = (val: number | null) => {
    if (val === null) return 'transparent'
    if (val >= 70) return 'rgba(34,197,94,0.7)'
    if (val >= 50) return 'rgba(34,197,94,0.4)'
    if (val >= 30) return 'rgba(245,158,11,0.4)'
    if (val >= 15) return 'rgba(239,68,68,0.3)'
    return 'rgba(239,68,68,0.15)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Retention Trend */}
      <div style={card}>
        <SectionTitle>用户留存曲线（分用户类型）</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={retentionTrend} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="period" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={tip} formatter={(v: any) => [`${v}%`, '']} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="全体用户" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="活跃用户" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="付费用户" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cohort Heatmap */}
      <div style={card}>
        <SectionTitle>留存率队列热力图（Cohort Analysis）</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>队列</th>
                {cohortCols.map(c => (
                  <th key={c} style={{ padding: '8px 14px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map(row => (
                <tr key={row.cohort}>
                  <td style={{ padding: '8px 14px', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.cohort}</td>
                  {cohortCols.map(col => {
                    const val = getVal(row, col)
                    return (
                      <td key={col} style={{ padding: '6px 8px', textAlign: 'center', background: getColor(val), borderRadius: 4 }}>
                        {val !== null ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{val}%</span> : <span style={{ color: 'var(--border)', fontSize: 12 }}>—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          {[['#22c55e', '≥70%'], ['rgba(34,197,94,0.4)', '50-70%'], ['rgba(245,158,11,0.4)', '30-50%'], ['rgba(239,68,68,0.3)', '15-30%'], ['rgba(239,68,68,0.15)', '<15%']].map(([bg, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: bg }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Retention by Source */}
        <div style={card}>
          <SectionTitle>按获客来源留存率对比</SectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['获客来源', 'D30留存', 'D90留存', '用户LTV'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {retentionBySource.map(r => (
                <tr key={r.source} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px', fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{r.source}</td>
                  <td style={{ padding: '10px', color: r.d30 >= 40 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{r.d30}%</td>
                  <td style={{ padding: '10px', color: r.d90 >= 25 ? '#22c55e' : r.d90 >= 15 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>{r.d90}%</td>
                  <td style={{ padding: '10px', color: '#e8365d', fontWeight: 700 }}>{r.ltv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Churn Reasons */}
        <div style={card}>
          <SectionTitle>用户流失原因分析（NPS调研）</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {churnReasons.map(r => (
              <div key={r.reason}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.reason}</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{r.pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: '#ef4444', borderRadius: 3, opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: 11, color: '#22c55e' }}>建议: {r.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabViral() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {viralMetrics.map(k => <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} icon={k.icon} color={k.color} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={card}>
          <SectionTitle>裂变趋势（近7日）</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={viralTrend} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="r" orientation="right" tick={{ fill: '#9b8cb8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="l" dataKey="裂变新用户" fill="#8b5cf6" radius={[3,3,0,0]} />
              <Line yAxisId="r" type="monotone" dataKey="裂变GMV" stroke="#e8365d" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <SectionTitle>病毒系数追踪</SectionTitle>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#f59e0b' }}>0.28</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>当前K因子</div>
            <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'left' }}>
              <div style={{ marginBottom: 6 }}>🎯 目标K因子: <strong style={{ color: '#f59e0b' }}>0.5</strong></div>
              <div style={{ marginBottom: 6 }}>📈 每提升0.1的K值预估增加月新用户<strong style={{ color: '#22c55e' }}>+1.2万</strong></div>
              <div>💡 建议: 提升老带新奖励力度 + KOC裂变工具</div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div style={card}>
        <SectionTitle>裂变项目效果汇总</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['项目名称', '类型', '状态', '参与人数', '邀请总量', '成功数', '成功率', '单位成本', 'ROI'].map(h => (
                <th key={h} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referralPrograms.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '11px 10px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{r.name}</td>
                <td style={{ padding: '11px 10px', fontSize: 11 }}><span style={{ padding: '2px 6px', borderRadius: 3, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>{r.type}</span></td>
                <td style={{ padding: '11px 10px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '11px 10px', color: 'var(--text-secondary)' }}>{r.participants.toLocaleString()}</td>
                <td style={{ padding: '11px 10px', color: 'var(--text-secondary)' }}>{r.invites.toLocaleString()}</td>
                <td style={{ padding: '11px 10px', color: '#22c55e', fontWeight: 600 }}>{r.success.toLocaleString()}</td>
                <td style={{ padding: '11px 10px', color: '#f59e0b', fontWeight: 700 }}>{r.rate}</td>
                <td style={{ padding: '11px 10px', color: 'var(--text-secondary)' }}>{r.cost}</td>
                <td style={{ padding: '11px 10px', color: '#e8365d', fontWeight: 700 }}>{r.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Referrers */}
      <div style={card}>
        <SectionTitle>TOP裂变贡献用户</SectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['用户ID', '会员等级', '邀请成功数', '带来GMV', '获得奖励'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topReferrers.map((r, i) => (
              <tr key={r.userId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '11px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <span style={{ fontSize: 12, marginRight: 8, color: i < 3 ? '#f59e0b' : 'var(--text-muted)' }}>{i + 1}</span>
                  {r.userId}
                </td>
                <td style={{ padding: '11px 12px' }}>
                  <span style={{ padding: '2px 7px', borderRadius: 4, background: r.tier === '钻石' ? 'rgba(139,92,246,0.12)' : 'rgba(245,158,11,0.12)', color: r.tier === '钻石' ? '#8b5cf6' : '#f59e0b', fontSize: 12 }}>{r.tier}</span>
                </td>
                <td style={{ padding: '11px 12px', color: '#22c55e', fontWeight: 700 }}>{r.referrals}</td>
                <td style={{ padding: '11px 12px', color: '#e8365d', fontWeight: 700 }}>{r.gmvGenerated}</td>
                <td style={{ padding: '11px 12px', color: '#f59e0b', fontWeight: 700 }}>{r.rewardEarned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabInsights() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Age Distribution */}
        <div style={card}>
          <SectionTitle>年龄分布</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ageDistribution} cx="50%" cy="50%" innerRadius={44} outerRadius={70} dataKey="value" paddingAngle={2}>
                {ageDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tip} formatter={(v: any) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
            {ageDistribution.map(d => (
              <div key={d.age} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.age}</span>
                </span>
                <span style={{ color: d.color, fontWeight: 700 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* City Tier */}
        <div style={card}>
          <SectionTitle>城市线级分布</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {cityTierDist.map((c, i) => (
              <div key={c.tier}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{c.tier}</span>
                  <span style={{ color: COLORS[i], fontWeight: 700 }}>{c.value}% 用户 / {c.gmvPct}% GMV</span>
                </div>
                <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.gmvPct}%`, background: COLORS[i], borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '8px 10px', background: 'rgba(232,54,93,0.06)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            💡 一线城市用户仅占34.2%，但贡献48.6% GMV。高LTV用户集中，优先VIP运营策略。
          </div>
        </div>

        {/* Satisfaction */}
        <div style={card}>
          <SectionTitle>用户满意度评分（NPS调研）</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {satisfactionScore.map(s => (
              <div key={s.dimension}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.dimension}</span>
                  <span style={{ color: s.score >= s.benchmark ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{s.score}分 {s.score >= s.benchmark ? '↑' : '↓'}</span>
                </div>
                <div style={{ position: 'relative', height: 6, background: 'var(--border-light)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${(s.score / 5) * 100}%`, background: s.score >= s.benchmark ? '#22c55e' : '#ef4444', borderRadius: 3 }} />
                  <div style={{ position: 'absolute', top: -2, left: `${(s.benchmark / 5) * 100}%`, width: 2, height: 10, background: '#94a3b8', borderRadius: 1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behavioral Insights */}
      <div style={card}>
        <SectionTitle>消费者行为洞察 (AI分析)</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {behaviorInsights.map((ins, i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Brain size={14} color="#8b5cf6" />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ins.insight}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{ins.detail}</div>
              <div style={{ fontSize: 12, color: '#22c55e', padding: '6px 10px', background: 'rgba(34,197,94,0.08)', borderRadius: 6 }}>
                🎯 {ins.action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Affinity */}
      <div style={card}>
        <SectionTitle>商品品类关联购买矩阵</SectionTitle>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {productAffinityMatrix.map(r => (
            <div key={r.from + r.to} style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)', minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ padding: '3px 8px', borderRadius: 5, background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontSize: 12, fontWeight: 700 }}>{r.from}</span>
                <ArrowUpRight size={14} color="#94a3b8" />
                <span style={{ padding: '3px 8px', borderRadius: 5, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', fontSize: 12, fontWeight: 700 }}>{r.to}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>关联购买率</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.affinity}%`, background: '#e8365d', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#e8365d' }}>{r.affinity}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConsumerCenter() {
  useRegisterAIConfig(consumerAIGroups, consumerLearningStatus, '消费者运营中心')
  const [activeTab, setActiveTab] = useState(0)

  const tabContents = [
    <TabOverview />,
    <TabLifecycle />,
    <TabMembership />,
    <TabRecommendation />,
    <TabChannels />,
    <TabRepurchase />,
    <TabRetention />,
    <TabViral />,
    <TabInsights />,
  ]

  return (
    <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(232,54,93,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#e8365d" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>营销C端消费者运营中心</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
              用户生命周期 · 会员积分 · 个性化推荐 · 全渠道触达 · 复购激活 · 留存分析 · 社交裂变 · 消费者洞察
            </p>
          </div>
        </div>
      </div>

      {/* AI Models */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="UserLTV-Predictor" color="#10b981" />
        <ModelBadge name="ChurnPredictor-GBM" color="#8b5cf6" />
        <ModelBadge name="DeepFM协同过滤" color="#e8365d" />
        <ModelBadge name="BERT语义推荐" color="#3b82f6" />
        <ModelBadge name="Item2Vec" color="#f59e0b" />
        <ModelBadge name="RFM-Clustering" color="#22c55e" />
        <ModelBadge name="CohortAnalyzer" color="#0ea5e9" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all .18s',
              background: activeTab === i ? '#e8365d' : 'transparent',
              color: activeTab === i ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabContents[activeTab]}
    </div>
  )
}
