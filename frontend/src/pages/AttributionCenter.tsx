import { useState } from 'react'
import {
  Brain, TrendingUp, GitBranch, BarChart3, Target, Zap,
  ArrowRight, Layers, Eye, ShoppingCart, Search, Heart,
  Banknote, Clock, Users, Activity, X, ChevronRight,
  Star, Info, Award, BookOpen, Sparkles
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   归因分析中心 —— 跨平台归因分析 (玛丽黛佳)
   小红书种草 → 天猫购买 全链路归因追踪
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['全链路漏斗', '跨平台归因矩阵', '🌍 国际归因', '达人种草ROI', '归因模型对比']

// ── Tab 1: 全链路漏斗 ──

const funnelData = [
  { stage: '种草曝光', count: 8500000, rate: '100%', color: '#e8365d' },
  { stage: '内容互动(点赞/收藏/评论)', count: 425000, rate: '5.0%', color: '#ff6b8a' },
  { stage: '品牌搜索', count: 212500, rate: '2.5%', color: '#ff8aa5' },
  { stage: '进店浏览', count: 127500, rate: '1.5%', color: '#ffb4c6' },
  { stage: '加购', count: 51000, rate: '0.6%', color: '#ffd4e0' },
  { stage: '下单支付', count: 30600, rate: '0.36%', color: '#22c55e' },
]

const timeLagData = [
  { lag: '当天', pct: 15 },
  { lag: '1-3天', pct: 28 },
  { lag: '4-7天', pct: 25 },
  { lag: '8-14天', pct: 18 },
  { lag: '15-30天', pct: 10 },
  { lag: '30天+', pct: 4 },
]

const platformBreakdown = [
  { name: '抖音', 种草曝光: 4200000, 内容互动: 210000, 品牌搜索: 95000, 进店浏览: 58000, 加购: 24000, 下单支付: 15200 },
  { name: '小红书', 种草曝光: 2800000, 内容互动: 168000, 品牌搜索: 89000, 进店浏览: 52000, 加购: 20000, 下单支付: 11500 },
  { name: '快手', 种草曝光: 1500000, 内容互动: 47000, 品牌搜索: 28500, 进店浏览: 17500, 加购: 7000, 下单支付: 3900 },
]

const productBreakdown = [
  { name: '唇妆', 种草曝光: 3200000, 内容互动: 176000, 品牌搜索: 88000, 进店浏览: 55000, 加购: 22000, 下单支付: 13200 },
  { name: '护肤', 种草曝光: 2500000, 内容互动: 125000, 品牌搜索: 62000, 进店浏览: 38000, 加购: 15000, 下单支付: 8800 },
  { name: '眼妆', 种草曝光: 1800000, 内容互动: 81000, 品牌搜索: 40500, 进店浏览: 22500, 加购: 9000, 下单支付: 5400 },
  { name: '底妆', 种草曝光: 1000000, 内容互动: 43000, 品牌搜索: 22000, 进店浏览: 12000, 加购: 5000, 下单支付: 3200 },
]

// ── Funnel drill-down mock data ──

const funnelStageTrend: Record<string, { date: string; value: number }[]> = {
  '种草曝光': [
    { date: '3/1', value: 280000 }, { date: '3/5', value: 310000 }, { date: '3/10', value: 295000 },
    { date: '3/15', value: 340000 }, { date: '3/20', value: 320000 }, { date: '3/25', value: 355000 }, { date: '3/30', value: 380000 },
  ],
  '内容互动(点赞/收藏/评论)': [
    { date: '3/1', value: 12500 }, { date: '3/5', value: 14800 }, { date: '3/10', value: 13200 },
    { date: '3/15', value: 16500 }, { date: '3/20', value: 15800 }, { date: '3/25', value: 17200 }, { date: '3/30', value: 18500 },
  ],
  '品牌搜索': [
    { date: '3/1', value: 6200 }, { date: '3/5', value: 7100 }, { date: '3/10', value: 6800 },
    { date: '3/15', value: 8200 }, { date: '3/20', value: 7500 }, { date: '3/25', value: 8800 }, { date: '3/30', value: 9200 },
  ],
  '进店浏览': [
    { date: '3/1', value: 3800 }, { date: '3/5', value: 4200 }, { date: '3/10', value: 3950 },
    { date: '3/15', value: 4800 }, { date: '3/20', value: 4500 }, { date: '3/25', value: 5100 }, { date: '3/30', value: 5500 },
  ],
  '加购': [
    { date: '3/1', value: 1500 }, { date: '3/5', value: 1680 }, { date: '3/10', value: 1550 },
    { date: '3/15', value: 1920 }, { date: '3/20', value: 1800 }, { date: '3/25', value: 2050 }, { date: '3/30', value: 2200 },
  ],
  '下单支付': [
    { date: '3/1', value: 880 }, { date: '3/5', value: 1020 }, { date: '3/10', value: 950 },
    { date: '3/15', value: 1180 }, { date: '3/20', value: 1100 }, { date: '3/25', value: 1250 }, { date: '3/30', value: 1350 },
  ],
}

const platformCampaigns: Record<string, { name: string; gmv: string; conv: number; type: string }[]> = {
  '抖音': [
    { name: '春季唇妆新品挑战赛', gmv: '¥42万', conv: 3200, type: '挑战赛' },
    { name: '玛丽黛佳色彩实验室', gmv: '¥28万', conv: 2100, type: '品牌直播' },
    { name: '#口红试色大赏 话题', gmv: '¥18万', conv: 1500, type: '话题营销' },
  ],
  '小红书': [
    { name: '素人种草计划 - 唇釉篇', gmv: '¥35万', conv: 2800, type: '素人种草' },
    { name: 'KOC护肤品测评', gmv: '¥22万', conv: 1800, type: 'KOC合作' },
    { name: '开箱合集 - 春季限定', gmv: '¥15万', conv: 1200, type: '开箱视频' },
  ],
  '快手': [
    { name: '美妆直播专场', gmv: '¥18万', conv: 1400, type: '直播专场' },
    { name: '日常妆容教程', gmv: '¥10万', conv: 850, type: '教程内容' },
    { name: '工厂探秘系列', gmv: '¥6万', conv: 480, type: '溯源内容' },
  ],
}

const platformAudience: Record<string, { segment: string; pct: string }[]> = {
  '抖音': [
    { segment: '18-24岁女性', pct: '38%' }, { segment: '25-30岁女性', pct: '32%' },
    { segment: '31-35岁女性', pct: '18%' }, { segment: '其他', pct: '12%' },
  ],
  '小红书': [
    { segment: '20-25岁女性', pct: '42%' }, { segment: '26-30岁女性', pct: '28%' },
    { segment: '18-20岁女生', pct: '20%' }, { segment: '其他', pct: '10%' },
  ],
  '快手': [
    { segment: '22-28岁女性', pct: '35%' }, { segment: '29-35岁女性', pct: '28%' },
    { segment: '18-22岁女性', pct: '22%' }, { segment: '其他', pct: '15%' },
  ],
}

const platformContentTypes: Record<string, { type: string; count: number; avgEngagement: string }[]> = {
  '抖音': [
    { type: '短视频教程', count: 45, avgEngagement: '8.2%' },
    { type: '开箱/试色', count: 32, avgEngagement: '6.5%' },
    { type: '直播片段', count: 18, avgEngagement: '12.8%' },
  ],
  '小红书': [
    { type: '图文笔记', count: 128, avgEngagement: '4.8%' },
    { type: '视频笔记', count: 56, avgEngagement: '7.2%' },
    { type: '合集/测评', count: 24, avgEngagement: '9.5%' },
  ],
  '快手': [
    { type: '直播带货', count: 22, avgEngagement: '15.2%' },
    { type: '短视频', count: 38, avgEngagement: '5.8%' },
    { type: '日常分享', count: 15, avgEngagement: '4.2%' },
  ],
}

// Time lag drill-down
const timeLagDayByDay = [
  { day: '第0天', pct: 15, 唇妆: 18, 护肤: 8, 眼妆: 15, 底妆: 20 },
  { day: '第1天', pct: 12, 唇妆: 14, 护肤: 8, 眼妆: 12, 底妆: 15 },
  { day: '第2天', pct: 9, 唇妆: 10, 护肤: 7, 眼妆: 9, 底妆: 10 },
  { day: '第3天', pct: 7, 唇妆: 7, 护肤: 6, 眼妆: 7, 底妆: 8 },
  { day: '第4天', pct: 6, 唇妆: 6, 护肤: 6, 眼妆: 6, 底妆: 6 },
  { day: '第5天', pct: 6, 唇妆: 5, 护肤: 6, 眼妆: 7, 底妆: 5 },
  { day: '第6天', pct: 7, 唇妆: 5, 护肤: 7, 眼妆: 7, 底妆: 5 },
  { day: '第7天', pct: 6, 唇妆: 5, 护肤: 7, 眼妆: 6, 底妆: 4 },
  { day: '第8-10天', pct: 8, 唇妆: 6, 护肤: 10, 眼妆: 8, 底妆: 6 },
  { day: '第11-14天', pct: 10, 唇妆: 8, 护肤: 14, 眼妆: 10, 底妆: 8 },
  { day: '第15-20天', pct: 6, 唇妆: 5, 护肤: 8, 眼妆: 5, 底妆: 5 },
  { day: '第21-30天', pct: 4, 唇妆: 3, 护肤: 7, 眼妆: 4, 底妆: 4 },
  { day: '30天+', pct: 4, 唇妆: 3, 护肤: 6, 眼妆: 4, 底妆: 4 },
]

// ── Tab 2: 跨平台归因矩阵 ──

const destinations = ['抖音小店', '天猫', '京东', '快手小店', '微信小程序']

const matrix = [
  { source: '抖音短视频', 抖音小店: 85.2, 天猫: 42.8, 京东: 12.5, 快手小店: 8.2, 微信小程序: 5.8, total: 154.5 },
  { source: '小红书笔记', 抖音小店: 18.5, 天猫: 68.2, 京东: 22.8, 快手小店: 3.2, 微信小程序: 12.5, total: 125.2 },
  { source: '快手短视频', 抖音小店: 5.8, 天猫: 8.5, 京东: 3.2, 快手小店: 45.8, 微信小程序: 2.8, total: 66.1 },
  { source: 'KOL直播', 抖音小店: 52.5, 天猫: 28.5, 京东: 8.8, 快手小店: 22.5, 微信小程序: 5.2, total: 117.5 },
  { source: '微信内容', 抖音小店: 3.8, 天猫: 15.2, 京东: 8.5, 快手小店: 2.5, 微信小程序: 38.5, total: 68.5 },
]

const topPaths = [
  { path: '小红书笔记 → 天猫搜索 → 天猫下单', gmv: '¥68.2万', convDays: '平均3.5天', pct: '22.8%' },
  { path: '抖音短视频 → 抖音小店直接下单', gmv: '¥85.2万', convDays: '平均0.5天', pct: '28.5%' },
  { path: 'KOL直播 → 抖音小店下单', gmv: '¥52.5万', convDays: '当场', pct: '17.5%' },
  { path: '小红书笔记 → 京东搜索 → 京东下单', gmv: '¥22.8万', convDays: '平均5.2天', pct: '7.6%' },
  { path: '微信公众号 → 微信小程序下单', gmv: '¥38.5万', convDays: '平均1.2天', pct: '12.8%' },
]

// Matrix cell drill-down mock data
const matrixCellDetail: Record<string, {
  sampleJourneys: { user: string; path: string; product: string; amount: string; days: number }[];
  avgDays: number;
  topProducts: { name: string; gmv: string; pct: string }[];
  trend: { date: string; gmv: number }[];
}> = {}

// Generate cell details for each source-destination pair
matrix.forEach(row => {
  destinations.forEach(dest => {
    const key = `${row.source}→${dest}`
    const val = row[dest as keyof typeof row] as number
    matrixCellDetail[key] = {
      sampleJourneys: [
        { user: '用户A***8', path: `${row.source} → 搜索品牌 → ${dest}浏览 → 加购 → 支付`, product: '唇釉丝绒#105', amount: '¥129', days: 3 },
        { user: '用户B***2', path: `${row.source} → 直接点击 → ${dest}下单`, product: '眼影盘星空色', amount: '¥189', days: 0 },
        { user: '用户C***6', path: `${row.source} → 收藏 → 次日搜索 → ${dest}购买`, product: '精华液修护版', amount: '¥259', days: 1 },
        { user: '用户D***1', path: `${row.source} → 多次浏览 → ${dest}比价 → 下单`, product: '卸妆水温和版', amount: '¥89', days: 5 },
        { user: '用户E***9', path: `${row.source} → 关注品牌 → ${dest}活动下单`, product: '唇釉丝绒#208', amount: '¥129', days: 7 },
      ],
      avgDays: Math.round(val / 10) % 7 + 1,
      topProducts: [
        { name: '唇釉丝绒系列', gmv: `¥${(val * 0.35).toFixed(1)}万`, pct: '35%' },
        { name: '眼影盘星空色', gmv: `¥${(val * 0.25).toFixed(1)}万`, pct: '25%' },
        { name: '精华液修护版', gmv: `¥${(val * 0.22).toFixed(1)}万`, pct: '22%' },
        { name: '卸妆水温和版', gmv: `¥${(val * 0.18).toFixed(1)}万`, pct: '18%' },
      ],
      trend: [
        { date: '3/1', gmv: val * 0.8 }, { date: '3/5', gmv: val * 0.85 }, { date: '3/10', gmv: val * 0.92 },
        { date: '3/15', gmv: val * 1.05 }, { date: '3/20', gmv: val * 0.98 }, { date: '3/25', gmv: val * 1.08 },
        { date: '3/30', gmv: val * 1.12 },
      ],
    }
  })
})

// Top path drill-down
const topPathDetail: Record<string, {
  kols: { name: string; platform: string; contribution: string }[];
  contents: { title: string; type: string; views: string; convRate: string }[];
  suggestions: string[];
}> = {
  '小红书笔记 → 天猫搜索 → 天猫下单': {
    kols: [
      { name: '成分研究社', platform: '小红书', contribution: '¥18.5万' },
      { name: '粉粉的小仙女', platform: '小红书', contribution: '¥12.8万' },
      { name: '素颜美妆日记', platform: '小红书', contribution: '¥8.2万' },
    ],
    contents: [
      { title: '玛丽黛佳唇釉真实测评|持久度惊了', type: '图文笔记', views: '52万', convRate: '2.8%' },
      { title: '春季必入的国货彩妆合集', type: '视频笔记', views: '38万', convRate: '3.2%' },
      { title: '学生党平价唇釉推荐', type: '图文笔记', views: '28万', convRate: '2.1%' },
    ],
    suggestions: [
      '增加天猫搜索品牌词投放, 承接小红书种草流量',
      '优化天猫店铺首页展示, 匹配小红书爆款内容',
      '建立小红书→天猫专属优惠券链路',
    ],
  },
  '抖音短视频 → 抖音小店直接下单': {
    kols: [
      { name: '彩妆师小雅', platform: '抖音', contribution: '¥32.5万' },
      { name: '口红上新', platform: '抖音', contribution: '¥28.2万' },
      { name: '美妆达人Lisa', platform: '抖音', contribution: '¥15.8万' },
    ],
    contents: [
      { title: '一支唇釉搞定所有场合妆容', type: '短视频', views: '185万', convRate: '4.2%' },
      { title: '挑战全脸只用玛丽黛佳', type: '短视频', views: '120万', convRate: '3.8%' },
      { title: '真人试色合集|10支热门色号', type: '短视频', views: '95万', convRate: '3.5%' },
    ],
    suggestions: [
      '加大抖音小店即时转化组件投放',
      '优化短视频挂车商品排序',
      '增加限时闪购活动频次',
    ],
  },
  'KOL直播 → 抖音小店下单': {
    kols: [
      { name: '口红上新', platform: '抖音直播', contribution: '¥22.5万' },
      { name: '彩妆师小雅', platform: '抖音直播', contribution: '¥18.2万' },
      { name: '美妆小课堂', platform: '抖音直播', contribution: '¥8.8万' },
    ],
    contents: [
      { title: '玛丽黛佳春季新品首发直播', type: '直播', views: '280万', convRate: '5.8%' },
      { title: '买一送一超值专场', type: '直播', views: '150万', convRate: '8.2%' },
      { title: '彩妆师在线教学直播', type: '直播', views: '88万', convRate: '4.5%' },
    ],
    suggestions: [
      '增加直播场次和时长',
      '配合直播间专属优惠提升转化',
      '利用直播回放做二次种草',
    ],
  },
  '小红书笔记 → 京东搜索 → 京东下单': {
    kols: [
      { name: '成分研究社', platform: '小红书', contribution: '¥8.5万' },
      { name: '理性种草机', platform: '小红书', contribution: '¥6.2万' },
      { name: '粉粉的小仙女', platform: '小红书', contribution: '¥4.8万' },
    ],
    contents: [
      { title: '敏感肌也能用的国货底妆', type: '图文笔记', views: '32万', convRate: '1.8%' },
      { title: '618必囤的护肤好物清单', type: '图文笔记', views: '25万', convRate: '2.2%' },
      { title: '玛丽黛佳VS国际大牌对比测评', type: '视频笔记', views: '18万', convRate: '1.5%' },
    ],
    suggestions: [
      '京东搜索广告需加大品牌词覆盖',
      '利用京东PLUS会员权益做差异化',
      '增加京东旗舰店与小红书联合活动',
    ],
  },
  '微信公众号 → 微信小程序下单': {
    kols: [
      { name: '玛丽黛佳官方号', platform: '微信', contribution: '¥15.2万' },
      { name: '美妆种草日记', platform: '微信', contribution: '¥12.8万' },
      { name: '国货之光', platform: '微信', contribution: '¥8.5万' },
    ],
    contents: [
      { title: '会员专属|春季新品提前购', type: '公众号推文', views: '18万', convRate: '6.2%' },
      { title: '品牌日特惠|满199减50', type: '公众号推文', views: '12万', convRate: '5.8%' },
      { title: '新品唇釉色号投票活动', type: '互动H5', views: '8万', convRate: '3.5%' },
    ],
    suggestions: [
      '加强私域流量运营和复购引导',
      '优化小程序购物体验和加载速度',
      '增加社群专属优惠和拼团活动',
    ],
  },
}

// ── Tab 3: 达人种草ROI ──

const kolAttribution = [
  { kol: '彩妆师小雅', platform: '抖音', contentCount: 28, totalExposure: '1,250万', directConv: 4850, assistedConv: 12800, attributedGMV: '¥182万', cost: '¥38万', roi: 4.79, avgConvDays: 2.8, topProduct: '唇釉丝绒系列', costNum: 38, gmvNum: 182 },
  { kol: '成分研究社', platform: '小红书', contentCount: 45, totalExposure: '680万', directConv: 2200, assistedConv: 8500, attributedGMV: '¥95万', cost: '¥18万', roi: 5.28, avgConvDays: 5.2, topProduct: '精华液修护版', costNum: 18, gmvNum: 95 },
  { kol: '粉粉的小仙女', platform: '小红书', contentCount: 32, totalExposure: '420万', directConv: 1800, assistedConv: 5200, attributedGMV: '¥68万', cost: '¥12万', roi: 5.67, avgConvDays: 4.8, topProduct: '眼影盘星空色', costNum: 12, gmvNum: 68 },
  { kol: '口红上新', platform: '抖音直播', contentCount: 15, totalExposure: '2,800万', directConv: 8500, assistedConv: 3200, attributedGMV: '¥285万', cost: '¥62万', roi: 4.60, avgConvDays: 0.5, topProduct: '唇釉丝绒#105', costNum: 62, gmvNum: 285 },
  { kol: '小白兔变美记', platform: '快手', contentCount: 22, totalExposure: '350万', directConv: 1500, assistedConv: 4800, attributedGMV: '¥52万', cost: '¥8万', roi: 6.50, avgConvDays: 3.5, topProduct: '卸妆水温和版', costNum: 8, gmvNum: 52 },
]

// KOL content pieces mock data
const kolContentPieces: Record<string, {
  followers: string; category: string; audienceOverlap: string;
  costBreakdown: { item: string; amount: string }[];
  roiTrend: { month: string; roi: number }[];
  contents: { title: string; date: string; views: number; likes: number; saves: number; comments: number; gmv: string; type: string }[];
}> = {
  '彩妆师小雅': {
    followers: '528万', category: '美妆博主', audienceOverlap: '32%',
    costBreakdown: [
      { item: '短视频合作', amount: '¥22万' }, { item: '直播坑位费', amount: '¥10万' },
      { item: '专场佣金', amount: '¥4万' }, { item: '样品寄送', amount: '¥2万' },
    ],
    roiTrend: [
      { month: '1月', roi: 3.8 }, { month: '2月', roi: 4.2 }, { month: '3月', roi: 4.79 },
      { month: '4月', roi: 5.1 }, { month: '5月', roi: 4.9 }, { month: '6月', roi: 5.3 },
    ],
    contents: [
      { title: '一支唇釉搞定所有场合妆容', date: '3/28', views: 1850000, likes: 82000, saves: 15000, comments: 3200, gmv: '¥42万', type: '短视频' },
      { title: '挑战全脸只用玛丽黛佳', date: '3/22', views: 1200000, likes: 55000, saves: 12000, comments: 2800, gmv: '¥28万', type: '短视频' },
      { title: '春季妆容教程|日系清透', date: '3/18', views: 950000, likes: 42000, saves: 9500, comments: 1800, gmv: '¥22万', type: '短视频' },
      { title: '真人试色合集|10支热门色号', date: '3/12', views: 880000, likes: 38000, saves: 18000, comments: 4200, gmv: '¥35万', type: '短视频' },
      { title: '新品首发直播回顾', date: '3/8', views: 2200000, likes: 95000, saves: 8000, comments: 12000, gmv: '¥32万', type: '直播' },
      { title: '底妆持久测试|12小时实测', date: '3/2', views: 680000, likes: 28000, saves: 6500, comments: 1500, gmv: '¥12万', type: '短视频' },
      { title: '眼妆教程|放大双眼', date: '2/25', views: 520000, likes: 22000, saves: 5200, comments: 1200, gmv: '¥8万', type: '短视频' },
      { title: '卸妆水评测|温和不刺激', date: '2/18', views: 380000, likes: 15000, saves: 3800, comments: 800, gmv: '¥3万', type: '短视频' },
    ],
  },
  '成分研究社': {
    followers: '320万', category: '成分党/测评博主', audienceOverlap: '28%',
    costBreakdown: [
      { item: '图文笔记合作', amount: '¥8万' }, { item: '视频笔记合作', amount: '¥6万' },
      { item: '专题测评', amount: '¥3万' }, { item: '样品寄送', amount: '¥1万' },
    ],
    roiTrend: [
      { month: '1月', roi: 4.5 }, { month: '2月', roi: 4.8 }, { month: '3月', roi: 5.28 },
      { month: '4月', roi: 5.5 }, { month: '5月', roi: 5.2 }, { month: '6月', roi: 5.8 },
    ],
    contents: [
      { title: '玛丽黛佳精华液全成分解析', date: '3/25', views: 320000, likes: 18000, saves: 42000, comments: 2800, gmv: '¥18万', type: '图文笔记' },
      { title: '国货护肤品横评|性价比之王', date: '3/20', views: 280000, likes: 15000, saves: 35000, comments: 2200, gmv: '¥15万', type: '视频笔记' },
      { title: '敏感肌友好的底妆推荐', date: '3/15', views: 220000, likes: 12000, saves: 28000, comments: 1800, gmv: '¥12万', type: '图文笔记' },
      { title: '唇釉成分对比|安全性评估', date: '3/10', views: 180000, likes: 9500, saves: 22000, comments: 1500, gmv: '¥15万', type: '图文笔记' },
      { title: '眼影盘色素沉淀测试', date: '3/5', views: 150000, likes: 8000, saves: 18000, comments: 1200, gmv: '¥10万', type: '视频笔记' },
      { title: '卸妆水清洁力实验', date: '2/28', views: 125000, likes: 6500, saves: 15000, comments: 900, gmv: '¥8万', type: '视频笔记' },
      { title: '春季护肤套装拆箱', date: '2/22', views: 95000, likes: 5000, saves: 12000, comments: 800, gmv: '¥10万', type: '图文笔记' },
      { title: '玛丽黛佳VS某国际品牌对比', date: '2/15', views: 280000, likes: 14000, saves: 32000, comments: 3500, gmv: '¥7万', type: '视频笔记' },
    ],
  },
  '粉粉的小仙女': {
    followers: '215万', category: '少女风美妆博主', audienceOverlap: '35%',
    costBreakdown: [
      { item: '图文笔记合作', amount: '¥5万' }, { item: '视频笔记合作', amount: '¥4万' },
      { item: '品牌联名', amount: '¥2万' }, { item: '样品寄送', amount: '¥1万' },
    ],
    roiTrend: [
      { month: '1月', roi: 4.8 }, { month: '2月', roi: 5.2 }, { month: '3月', roi: 5.67 },
      { month: '4月', roi: 5.9 }, { month: '5月', roi: 5.5 }, { month: '6月', roi: 6.1 },
    ],
    contents: [
      { title: '学生党必入眼影盘推荐', date: '3/26', views: 180000, likes: 12000, saves: 25000, comments: 1800, gmv: '¥15万', type: '图文笔记' },
      { title: '日系甜妹妆容教程', date: '3/20', views: 155000, likes: 10000, saves: 20000, comments: 1500, gmv: '¥12万', type: '视频笔记' },
      { title: '平价唇釉合集|百元以内', date: '3/15', views: 220000, likes: 15000, saves: 32000, comments: 2200, gmv: '¥18万', type: '图文笔记' },
      { title: '开学季妆容|5分钟出门', date: '3/8', views: 120000, likes: 8000, saves: 15000, comments: 1200, gmv: '¥8万', type: '视频笔记' },
      { title: '粉色系眼妆教程', date: '3/2', views: 95000, likes: 6500, saves: 12000, comments: 900, gmv: '¥6万', type: '短视频' },
      { title: '春季限定色号试色', date: '2/25', views: 135000, likes: 9000, saves: 18000, comments: 1300, gmv: '¥9万', type: '图文笔记' },
    ],
  },
  '口红上新': {
    followers: '1,280万', category: '美妆直播达人', audienceOverlap: '25%',
    costBreakdown: [
      { item: '直播坑位费', amount: '¥35万' }, { item: '直播佣金', amount: '¥18万' },
      { item: '短视频预热', amount: '¥6万' }, { item: '样品寄送', amount: '¥3万' },
    ],
    roiTrend: [
      { month: '1月', roi: 3.8 }, { month: '2月', roi: 4.2 }, { month: '3月', roi: 4.60 },
      { month: '4月', roi: 4.8 }, { month: '5月', roi: 4.5 }, { month: '6月', roi: 5.0 },
    ],
    contents: [
      { title: '玛丽黛佳春季新品首发直播', date: '3/28', views: 8500000, likes: 380000, saves: 52000, comments: 85000, gmv: '¥85万', type: '直播' },
      { title: '买一送一超值专场直播', date: '3/20', views: 5200000, likes: 220000, saves: 35000, comments: 52000, gmv: '¥62万', type: '直播' },
      { title: '唇釉色号大合集直播', date: '3/12', views: 3800000, likes: 165000, saves: 28000, comments: 38000, gmv: '¥48万', type: '直播' },
      { title: '预热|春季新品剧透', date: '3/25', views: 2200000, likes: 95000, saves: 18000, comments: 12000, gmv: '¥28万', type: '短视频' },
      { title: '直播精彩片段合集', date: '3/22', views: 1800000, likes: 78000, saves: 15000, comments: 8000, gmv: '¥22万', type: '短视频' },
      { title: '新品试色|丝绒质地', date: '3/15', views: 1500000, likes: 65000, saves: 22000, comments: 5500, gmv: '¥18万', type: '短视频' },
      { title: '回购率最高的5支唇釉', date: '3/8', views: 1200000, likes: 52000, saves: 18000, comments: 4200, gmv: '¥15万', type: '短视频' },
      { title: '和粉丝一起试色', date: '3/2', views: 980000, likes: 42000, saves: 12000, comments: 6800, gmv: '¥7万', type: '直播' },
    ],
  },
  '小白兔变美记': {
    followers: '186万', category: '日常种草博主', audienceOverlap: '30%',
    costBreakdown: [
      { item: '短视频合作', amount: '¥4万' }, { item: '直播合作', amount: '¥2.5万' },
      { item: '好物推荐', amount: '¥1万' }, { item: '样品寄送', amount: '¥0.5万' },
    ],
    roiTrend: [
      { month: '1月', roi: 5.5 }, { month: '2月', roi: 5.8 }, { month: '3月', roi: 6.50 },
      { month: '4月', roi: 6.8 }, { month: '5月', roi: 6.2 }, { month: '6月', roi: 7.0 },
    ],
    contents: [
      { title: '卸妆水大横评|温和清洁', date: '3/28', views: 180000, likes: 9500, saves: 15000, comments: 1200, gmv: '¥12万', type: '短视频' },
      { title: '日常护肤分享|早晚护肤', date: '3/22', views: 150000, likes: 8000, saves: 12000, comments: 900, gmv: '¥8万', type: '短视频' },
      { title: '快手直播|好物分享', date: '3/18', views: 220000, likes: 12000, saves: 8000, comments: 3500, gmv: '¥10万', type: '直播' },
      { title: '国货彩妆好物推荐', date: '3/12', views: 135000, likes: 7000, saves: 10000, comments: 800, gmv: '¥8万', type: '短视频' },
      { title: '学生党护肤品推荐', date: '3/5', views: 120000, likes: 6500, saves: 9000, comments: 700, gmv: '¥6万', type: '短视频' },
      { title: '素颜也好看的底妆技巧', date: '2/28', views: 95000, likes: 5000, saves: 7500, comments: 600, gmv: '¥5万', type: '短视频' },
      { title: '一周妆容分享vlog', date: '2/20', views: 80000, likes: 4200, saves: 6000, comments: 500, gmv: '¥3万', type: '短视频' },
    ],
  },
}

const scatterColors: Record<string, string> = {
  '抖音': '#e8365d',
  '小红书': '#ff6b8a',
  '抖音直播': '#ff8aa5',
  '快手': '#ffd4e0',
}

// ── Tab 4: 归因模型对比 ──

const modelComparison = [
  { channel: '抖音短视频', firstTouch: 4.2, lastTouch: 3.8, linear: 4.0, timeDecay: 4.1, shapley: 3.9 },
  { channel: '小红书种草', firstTouch: 5.8, lastTouch: 3.2, linear: 4.5, timeDecay: 5.1, shapley: 4.8 },
  { channel: 'KOL直播', firstTouch: 3.5, lastTouch: 5.2, linear: 4.3, timeDecay: 4.0, shapley: 4.5 },
  { channel: '快手短视频', firstTouch: 4.8, lastTouch: 4.2, linear: 4.5, timeDecay: 4.6, shapley: 4.4 },
  { channel: '微信内容', firstTouch: 6.2, lastTouch: 3.8, linear: 5.0, timeDecay: 5.5, shapley: 5.2 },
]

const modelExplanations = [
  { name: '首触归因', key: 'firstTouch', desc: '将100%功劳给第一个触点 → 高估种草渠道', color: '#94a3b8' },
  { name: '末触归因', key: 'lastTouch', desc: '将100%功劳给最后一个触点 → 高估转化渠道', color: '#60a5fa' },
  { name: '线性归因', key: 'linear', desc: '平均分配功劳', color: '#a78bfa' },
  { name: '时间衰减', key: 'timeDecay', desc: '越靠近转化的触点获得越多功劳', color: '#fbbf24' },
  { name: 'Shapley值', key: 'shapley', desc: 'AI博弈论模型, 考虑各渠道边际贡献', color: '#e8365d' },
]

const modelBarColors: Record<string, string> = {
  firstTouch: '#94a3b8',
  lastTouch: '#60a5fa',
  linear: '#a78bfa',
  timeDecay: '#fbbf24',
  shapley: '#e8365d',
}

// Model detail data
const modelDetailData: Record<string, {
  fullName: string; formula: string; pros: string[]; cons: string[]; useCases: string[]; aiRecommendation: string;
}> = {
  firstTouch: {
    fullName: '首次触点归因模型 (First-Touch Attribution)',
    formula: 'Attribution(channel) = 1 if channel == first_touchpoint else 0',
    pros: ['简单直观, 易于实施', '适合评估品牌曝光和种草效果', '能识别用户旅程的起点渠道'],
    cons: ['忽略后续触点的贡献', '高估种草渠道, 低估转化渠道', '不适合多触点复杂路径'],
    useCases: ['品牌认知度评估', '种草渠道筛选', '新客获取渠道分析'],
    aiRecommendation: '适合评估小红书等种草平台的引流效果, 但不建议作为预算分配的唯一依据。建议与Shapley模型结合使用。',
  },
  lastTouch: {
    fullName: '末次触点归因模型 (Last-Touch Attribution)',
    formula: 'Attribution(channel) = 1 if channel == last_touchpoint else 0',
    pros: ['直接关联转化行为', '数据需求少, 实施简单', '适合短决策路径产品'],
    cons: ['忽略前期种草触点的价值', '高估转化渠道(如直播/电商)', '可能导致种草预算被错误削减'],
    useCases: ['直播转化效果评估', '电商渠道ROI计算', '促销活动效果分析'],
    aiRecommendation: '适合评估抖音直播等即时转化场景, 但会严重低估小红书种草的长期价值。不建议单独使用。',
  },
  linear: {
    fullName: '线性归因模型 (Linear Attribution)',
    formula: 'Attribution(channel_i) = 1 / N, where N = total touchpoints',
    pros: ['公平对待每个触点', '实施难度适中', '适合探索阶段的初步分析'],
    cons: ['未区分不同触点的实际贡献差异', '核心转化渠道和辅助渠道权重相同', '可能导致预算平均分配'],
    useCases: ['初期归因分析探索', '渠道效果初筛', '团队对齐和沟通'],
    aiRecommendation: '作为基准模型有参考价值, 但无法体现玛丽黛佳各渠道的差异化贡献。建议升级到Shapley模型。',
  },
  timeDecay: {
    fullName: '时间衰减归因模型 (Time-Decay Attribution)',
    formula: 'Attribution(channel_i) = 2^(-(t_conv - t_i) / half_life) / Sum',
    pros: ['考虑时间因素, 靠近转化的触点权重更高', '比线性模型更接近真实转化逻辑', '适合有明确转化路径的场景'],
    cons: ['半衰期参数需要调优', '可能低估早期种草的品牌建设价值', '对长决策周期产品不够精确'],
    useCases: ['彩妆品类短决策路径', '促销活动归因', '直播电商转化分析'],
    aiRecommendation: '对玛丽黛佳彩妆品类较为合适(决策周期短), 但护肤品线建议使用更长的衰减窗口。推荐作为Shapley的辅助参考。',
  },
  shapley: {
    fullName: 'Shapley值归因模型 (Shapley Value Attribution)',
    formula: 'φ_i = Σ_{S⊆N\\{i}} [|S|!(|N|-|S|-1)!/|N|!] × [v(S∪{i}) - v(S)]',
    pros: ['基于博弈论, 数学上唯一满足公平性公理', '考虑渠道间的协同效应和边际贡献', '能发现被其他模型忽略的渠道价值', 'AI自动学习最优参数'],
    cons: ['计算复杂度较高(指数级)', '需要大量数据支撑', '结果解释性不如简单模型直观'],
    useCases: ['全渠道预算优化', '跨平台协同效果评估', '精确ROI计算和渠道价值排名'],
    aiRecommendation: '强烈推荐作为玛丽黛佳的核心归因模型。基于285万数据点训练, 置信度88%, 能准确识别小红书种草→天猫转化等跨平台协同效应。',
  },
}

// Channel detail across models
const channelModelDetail: Record<string, {
  recommendedAttribution: string; budgetSuggestion: string; currentBudget: string; suggestedBudget: string; budgetChange: string;
  modelValues: { model: string; roi: number; color: string }[];
}> = {
  '抖音短视频': {
    recommendedAttribution: 'Shapley值模型 (3.9x)', budgetSuggestion: '维持当前投入水平, 优化内容质量',
    currentBudget: '¥45万/月', suggestedBudget: '¥42万/月', budgetChange: '-6.7%',
    modelValues: [
      { model: '首触归因', roi: 4.2, color: '#94a3b8' }, { model: '末触归因', roi: 3.8, color: '#60a5fa' },
      { model: '线性归因', roi: 4.0, color: '#a78bfa' }, { model: '时间衰减', roi: 4.1, color: '#fbbf24' },
      { model: 'Shapley值', roi: 3.9, color: '#e8365d' },
    ],
  },
  '小红书种草': {
    recommendedAttribution: 'Shapley值模型 (4.8x)', budgetSuggestion: '增加投入, 种草效果被首触模型高估但Shapley仍显示高价值',
    currentBudget: '¥30万/月', suggestedBudget: '¥38万/月', budgetChange: '+26.7%',
    modelValues: [
      { model: '首触归因', roi: 5.8, color: '#94a3b8' }, { model: '末触归因', roi: 3.2, color: '#60a5fa' },
      { model: '线性归因', roi: 4.5, color: '#a78bfa' }, { model: '时间衰减', roi: 5.1, color: '#fbbf24' },
      { model: 'Shapley值', roi: 4.8, color: '#e8365d' },
    ],
  },
  'KOL直播': {
    recommendedAttribution: 'Shapley值模型 (4.5x)', budgetSuggestion: '适当增加, 直播转化效率高但需控制成本',
    currentBudget: '¥62万/月', suggestedBudget: '¥58万/月', budgetChange: '-6.5%',
    modelValues: [
      { model: '首触归因', roi: 3.5, color: '#94a3b8' }, { model: '末触归因', roi: 5.2, color: '#60a5fa' },
      { model: '线性归因', roi: 4.3, color: '#a78bfa' }, { model: '时间衰减', roi: 4.0, color: '#fbbf24' },
      { model: 'Shapley值', roi: 4.5, color: '#e8365d' },
    ],
  },
  '快手短视频': {
    recommendedAttribution: 'Shapley值模型 (4.4x)', budgetSuggestion: '小幅增加, 性价比高的潜力渠道',
    currentBudget: '¥12万/月', suggestedBudget: '¥15万/月', budgetChange: '+25%',
    modelValues: [
      { model: '首触归因', roi: 4.8, color: '#94a3b8' }, { model: '末触归因', roi: 4.2, color: '#60a5fa' },
      { model: '线性归因', roi: 4.5, color: '#a78bfa' }, { model: '时间衰减', roi: 4.6, color: '#fbbf24' },
      { model: 'Shapley值', roi: 4.4, color: '#e8365d' },
    ],
  },
  '微信内容': {
    recommendedAttribution: 'Shapley值模型 (5.2x)', budgetSuggestion: '大幅增加, 私域价值被严重低估',
    currentBudget: '¥8万/月', suggestedBudget: '¥15万/月', budgetChange: '+87.5%',
    modelValues: [
      { model: '首触归因', roi: 6.2, color: '#94a3b8' }, { model: '末触归因', roi: 3.8, color: '#60a5fa' },
      { model: '线性归因', roi: 5.0, color: '#a78bfa' }, { model: '时间衰减', roi: 5.5, color: '#fbbf24' },
      { model: 'Shapley值', roi: 5.2, color: '#e8365d' },
    ],
  },
}

// ── Tooltip Style ──

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

// ── AI Configuration ──

const attributionAIConfigGroups: AIConfigGroup[] = [
  {
    title: '归因模型参数',
    icon: <Brain size={15} />,
    params: [
      createParam('attribution_window', '归因窗口期', 7, '天', '种草内容发布后追踪转化的最长时间窗口', 14, 86, {
        min: 1, max: 90, step: 1, learningDataPoints: 128000,
        adjustHistory: [
          { time: '昨日', from: '14', to: '7', reason: '彩妆品类决策周期短, AI缩短窗口提高归因精度' },
          { time: '1周前', from: '7', to: '14', reason: '护肤品复购决策周期较长, AI延长窗口' },
        ],
      }),
      createParam('attribution_model', '默认归因模型', 'shapley', '', '全链路归因分析使用的默认模型', 'shapley', 91, {
        type: 'select',
        options: ['first_touch', 'last_touch', 'linear', 'time_decay', 'shapley'],
        learningDataPoints: 95400,
      }),
      createParam('confidence_threshold', '归因置信度阈值', 80, '%', '低于此置信度的归因路径标记为"弱归因"', 75, 88, { min: 50, max: 95, step: 5 }),
      createParam('cross_device_match', '跨设备匹配精度', 85, '%', '同一用户在不同设备/平台上的身份匹配准确率', 90, 83, { min: 60, max: 99, step: 1 }),
    ],
  },
  {
    title: '种草归因配置',
    icon: <TrendingUp size={15} />,
    params: [
      createParam('grass_decay', '种草内容衰减周期', 14, '天', '种草笔记/视频发布后影响力的半衰期, 超过此期限归因权重减半', 21, 84, { min: 3, max: 60, step: 1 }),
      createParam('search_lift_weight', '搜索提升权重', 0.3, '', '种草内容带来的品牌搜索量增长在归因中的权重', 0.35, 82, { min: 0.1, max: 0.8, step: 0.05 }),
      createParam('assisted_weight', '助攻转化权重', 0.25, '', '非最终触点的转化贡献在归因中的权重', 0.3, 85, { min: 0.1, max: 0.6, step: 0.05 }),
    ],
  },
]

const attributionAILearningStatus: AILearningStatus = {
  modelVersion: 'v4.2.0-attribution',
  lastTraining: '30分钟前',
  totalDataPoints: 2850000,
  avgConfidence: 88,
  autoAdjustCount24h: 35,
  learningRate: '0.003',
  nextTraining: '1小时后',
  improvementRate: '+5.2%',
}

// ── Helpers ──

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 1000000 ? 0 : 1)}万`
  return n.toLocaleString()
}

function stageConvRate(from: number, to: number): string {
  return `${((to / from) * 100).toFixed(1)}%`
}

function heatmapBg(value: number, maxVal: number): string {
  const ratio = value / maxVal
  const alpha = 0.12 + ratio * 0.55
  return `rgba(232, 54, 93, ${alpha})`
}

function formatViews(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return n.toLocaleString()
}

// ── DrillPanel Component ──

type DrillPanelProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

function DrillPanel({ open, onClose, title, subtitle, children }: DrillPanelProps) {
  if (!open) return null
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 999, cursor: 'pointer',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 500,
        background: 'var(--bg-primary)', zIndex: 1000, overflowY: 'auto',
        borderLeft: '1px solid var(--border)', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 2,
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
            color: 'var(--text-muted)',
          }}>
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: 20, flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  )
}

function PanelRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function PanelSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  )
}

function ActionButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
      background: 'rgba(232,54,93,0.08)', color: '#e8365d', border: '1px solid rgba(232,54,93,0.2)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {label}
      <ChevronRight size={12} />
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function AttributionCenter() {
  const [activeTab, setActiveTab] = useState(0)
  const [attrScope, setAttrScope] = useState<'domestic' | 'intl' | 'all'>('all')
  const [breakdownMode, setBreakdownMode] = useState<'platform' | 'product'>('platform')
  useRegisterAIConfig(attributionAIConfigGroups, attributionAILearningStatus, '归因分析中心')

  // Drill-down states
  const [drillPanel, setDrillPanel] = useState<{
    type: string
    data?: Record<string, unknown>
  } | null>(null)

  const closePanel = () => setDrillPanel(null)

  const [toastMsg, setToastMsg] = useState<{text: string; color: string}|null>(null)
  const showToast = (text: string, color = '#22c55e') => {
    setToastMsg({text, color})
    setTimeout(() => setToastMsg(null), 3000)
  }

  const maxMatrixVal = Math.max(...matrix.flatMap(r => destinations.map(d => r[d as keyof typeof r] as number)))

  // ── Render drill panel content ──
  const renderDrillContent = () => {
    if (!drillPanel) return null
    const { type, data } = drillPanel

    // ── Funnel Stage drill-down ──
    if (type === 'funnelStage') {
      const stage = data?.stage as string
      const idx = data?.index as number
      const stageItem = funnelData[idx]
      const trendData = funnelStageTrend[stage] || []
      const nextStage = idx < funnelData.length - 1 ? funnelData[idx + 1] : null
      const convRateToNext = nextStage ? ((nextStage.count / stageItem.count) * 100).toFixed(2) : null
      return (
        <DrillPanel open title={`漏斗阶段: ${stage}`} subtitle={`${formatCount(stageItem.count)} | 占比 ${stageItem.rate}`} onClose={closePanel}>
          <PanelSection title="平台贡献分布" icon={<BarChart3 size={14} color="#e8365d" />}>
            {platformBreakdown.map(p => {
              const val = p[stage as keyof typeof p] as number || p['种草曝光' as keyof typeof p] as number
              const total = stageItem.count
              const pct = ((val / total) * 100).toFixed(1)
              return (
                <div
                  key={p.name}
                  onClick={() => setDrillPanel({ type: 'platformDetail', data: { platform: p.name, stage } })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6,
                    background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 50, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                  <div style={{ flex: 1, height: 8, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#e8365d', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e8365d', width: 50, textAlign: 'right' }}>{pct}%</div>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              )
            })}
          </PanelSection>

          <PanelSection title="产品线分布" icon={<Layers size={14} color="#ff6b8a" />}>
            {productBreakdown.map(p => {
              const stageKeys = ['种草曝光', '内容互动', '品牌搜索', '进店浏览', '加购', '下单支付'] as const
              const matchKey = stageKeys.find(k => stage.startsWith(k.substring(0, 2))) || '种草曝光'
              const val = p[matchKey as keyof typeof p] as number
              return (
                <div key={p.name} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.name}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCount(val)}</span>
                </div>
              )
            })}
          </PanelSection>

          <PanelSection title="该阶段趋势 (近30天)" icon={<TrendingUp size={14} color="#ff8aa5" />}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCount(v), stage]} />
                <Area type="monotone" dataKey="value" stroke="#e8365d" fill="rgba(232,54,93,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </PanelSection>

          {convRateToNext && nextStage && (
            <PanelSection title={`转化到下一阶段: ${nextStage.stage}`} icon={<ArrowRight size={14} color="#22c55e" />}>
              <div style={{ background: 'rgba(34,197,94,0.06)', borderRadius: 10, padding: 16, border: '1px solid rgba(34,197,94,0.15)' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e', marginBottom: 4 }}>{convRateToNext}%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>当前阶段 → 下一阶段转化率</div>
                <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  历史对比: 上月 {(parseFloat(convRateToNext) * 0.92).toFixed(2)}% | 上周 {(parseFloat(convRateToNext) * 0.97).toFixed(2)}%
                </div>
              </div>
            </PanelSection>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <ActionButton label="导出该阶段数据" onClick={() => { showToast('📥 阶段数据导出中...', '#e8365d') }} />
            <ActionButton label="设置监控告警" onClick={() => { showToast('🔔 告警规则已设置，当该阶段转化率下降5%时触发通知', '#f59e0b') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    // ── Platform Detail drill-down (from funnel stage) ──
    if (type === 'platformDetail') {
      const platform = data?.platform as string
      const stage = data?.stage as string
      const campaigns = platformCampaigns[platform] || []
      const audience = platformAudience[platform] || []
      const contentTypes = platformContentTypes[platform] || []
      return (
        <DrillPanel open title={`${platform} - ${stage}`} subtitle="平台详细分析" onClose={closePanel}>
          <PanelSection title="Top 表现活动" icon={<Award size={14} color="#e8365d" />}>
            {campaigns.map((c, i) => (
              <div key={i} style={{
                padding: '12px', marginBottom: 6, background: 'var(--bg-card)',
                borderRadius: 8, border: '1px solid var(--border-light)', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8365d' }}>{c.gmv}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>类型: {c.type}</span>
                  <span>转化: {c.conv.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="受众画像" icon={<Users size={14} color="#ff6b8a" />}>
            {audience.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <div style={{ width: 100, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.segment}</div>
                <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: a.pct, height: '100%', background: '#ff6b8a', borderRadius: 3 }} />
                </div>
                <div style={{ width: 35, fontSize: '0.75rem', fontWeight: 600, color: '#ff6b8a', textAlign: 'right' }}>{a.pct}</div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="内容类型表现" icon={<BookOpen size={14} color="#ff8aa5" />}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--text-muted)', fontWeight: 600 }}>类型</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--text-muted)', fontWeight: 600 }}>数量</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--text-muted)', fontWeight: 600 }}>平均互动率</th>
                </tr>
              </thead>
              <tbody>
                {contentTypes.map((ct, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                    <td style={{ padding: '8px 4px', color: 'var(--text-primary)' }}>{ct.type}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--text-secondary)' }}>{ct.count}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600, color: '#e8365d' }}>{ct.avgEngagement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelSection>

          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton label="查看全部活动" onClick={() => { showToast('📊 正在加载完整活动列表...', '#3b82f6') }} />
            <ActionButton label="导出平台报告" onClick={() => { showToast('📥 平台归因报告导出中...', '#e8365d') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    // ── Time Lag drill-down ──
    if (type === 'timeLag') {
      const lag = data?.lag as string
      return (
        <DrillPanel open title={`时间间隔: ${lag}`} subtitle="种草→购买时间间隔详情" onClose={closePanel}>
          <PanelSection title="逐日转化分布" icon={<Clock size={14} color="#e8365d" />}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeLagDayByDay} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pct" fill="#e8365d" radius={[4, 4, 0, 0]} maxBarSize={28} name="总体" />
              </BarChart>
            </ResponsiveContainer>
          </PanelSection>

          <PanelSection title="各品类转化分布差异" icon={<Layers size={14} color="#ff6b8a" />}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeLagDayByDay} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="唇妆" stroke="#e8365d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="护肤" stroke="#ff6b8a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="眼妆" stroke="#ff8aa5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="底妆" stroke="#ffb4c6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8, fontSize: '0.7rem' }}>
              {[{ name: '唇妆', color: '#e8365d' }, { name: '护肤', color: '#ff6b8a' }, { name: '眼妆', color: '#ff8aa5' }, { name: '底妆', color: '#ffb4c6' }].map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                  <span style={{ color: 'var(--text-muted)' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="品类洞察" icon={<Sparkles size={14} color="#fbbf24" />}>
            <div style={{ padding: 12, background: 'rgba(232,54,93,0.06)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#e8365d' }}>唇妆</strong>: 决策周期最短, 当天和1-3天转化占比高达32%, 适合即时转化策略</p>
              <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#ff6b8a' }}>护肤</strong>: 决策周期最长, 8-14天转化占比高达24%, 需要持续种草和信任建设</p>
              <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: '#ff8aa5' }}>眼妆</strong>: 中等决策周期, 4-7天是转化高峰, 可配合周末妆容教程引导</p>
              <p style={{ margin: 0 }}><strong style={{ color: '#ffb4c6' }}>底妆</strong>: 当天转化占比20%最高, 直播试色带动即时购买效果显著</p>
            </div>
          </PanelSection>

          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton label="优化归因窗口" onClick={() => { showToast('✅ AI已分析最优归因窗口为14天，已自动应用', '#22c55e') }} />
            <ActionButton label="导出时间分析" onClick={() => { showToast('📥 时间衰减分析报告导出中...', '#e8365d') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    // ── Matrix Cell drill-down ──
    if (type === 'matrixCell') {
      const source = data?.source as string
      const dest = data?.dest as string
      const val = data?.value as number
      const key = `${source}→${dest}`
      const detail = matrixCellDetail[key]
      if (!detail) return null
      return (
        <DrillPanel open title={`${source} → ${dest}`} subtitle={`归因GMV: ¥${val.toFixed(1)}万`} onClose={closePanel}>
          <PanelSection title="转化路径详情" icon={<GitBranch size={14} color="#e8365d" />}>
            <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
              <PanelRow label="归因GMV" value={`¥${val.toFixed(1)}万`} color="#e8365d" />
              <PanelRow label="平均转化天数" value={`${detail.avgDays}天`} />
              <PanelRow label="路径占总GMV比" value={`${((val / matrix.reduce((s, r) => s + r.total, 0)) * 100).toFixed(1)}%`} />
            </div>
          </PanelSection>

          <PanelSection title="用户旅程示例" icon={<Users size={14} color="#ff6b8a" />}>
            {detail.sampleJourneys.map((j, i) => (
              <div key={i} style={{
                padding: '10px 12px', marginBottom: 6, background: 'var(--bg-card)',
                borderRadius: 8, border: '1px solid var(--border-light)', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{j.user}</span>
                  <span style={{ fontSize: '0.72rem', color: '#e8365d', fontWeight: 600 }}>{j.amount}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{j.path}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span>商品: {j.product}</span>
                  <span>耗时: {j.days === 0 ? '当天' : `${j.days}天`}</span>
                </div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="Top转化商品" icon={<ShoppingCart size={14} color="#ff8aa5" />}>
            {detail.topProducts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: i === 0 ? '#e8365d' : 'var(--bg-card)',
                  color: i === 0 ? '#fff' : 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</div>
                <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e8365d' }}>{p.gmv}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 35 }}>{p.pct}</div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="近30天GMV趋势" icon={<TrendingUp size={14} color="#22c55e" />}>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={detail.trend} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`¥${v.toFixed(1)}万`, 'GMV']} />
                <Area type="monotone" dataKey="gmv" stroke="#e8365d" fill="rgba(232,54,93,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </PanelSection>

          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton label="优化该路径" onClick={() => { showToast('🤖 AI正在分析路径优化方案，预计5分钟后生成建议', '#8b5cf6') }} />
            <ActionButton label="查看完整用户旅程" onClick={() => { showToast('🗺️ 用户旅程地图加载中...', '#3b82f6') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    // ── Top Path drill-down ──
    if (type === 'topPath') {
      const path = data?.path as string
      const gmv = data?.gmv as string
      const convDays = data?.convDays as string
      const pct = data?.pct as string
      const detail = topPathDetail[path]
      if (!detail) return (
        <DrillPanel open title={path} subtitle={`GMV: ${gmv}`} onClose={closePanel}>
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            暂无详细数据
          </div>
        </DrillPanel>
      )
      return (
        <DrillPanel open title="转化路径详情" subtitle={path} onClose={closePanel}>
          <PanelSection title="路径概览" icon={<Zap size={14} color="#e8365d" />}>
            <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
              <PanelRow label="归因GMV" value={gmv} color="#e8365d" />
              <PanelRow label="转化周期" value={convDays} />
              <PanelRow label="路径占比" value={pct} color="#ff6b8a" />
            </div>
          </PanelSection>

          <PanelSection title="路径可视化" icon={<GitBranch size={14} color="#ff6b8a" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {path.split(' → ').map((step, i, arr) => (
                <div key={i}>
                  <div style={{
                    padding: '10px 14px', background: i === 0 ? 'rgba(232,54,93,0.1)' : i === arr.length - 1 ? 'rgba(34,197,94,0.1)' : 'var(--bg-card)',
                    borderRadius: 8, border: `1px solid ${i === 0 ? 'rgba(232,54,93,0.2)' : i === arr.length - 1 ? 'rgba(34,197,94,0.2)' : 'var(--border-light)'}`,
                    fontSize: '0.8rem', fontWeight: 600,
                    color: i === 0 ? '#e8365d' : i === arr.length - 1 ? '#22c55e' : 'var(--text-primary)',
                  }}>
                    {step}
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                      <ArrowRight size={14} color="var(--text-muted)" style={{ transform: 'rotate(90deg)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="贡献KOL" icon={<Star size={14} color="#fbbf24" />}>
            {detail.kols.map((k, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0',
                borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
              }}
              onClick={() => setDrillPanel({ type: 'kolDetail', data: { kol: k.name } })}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{k.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{k.platform}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e8365d' }}>{k.contribution}</span>
                  <ChevronRight size={14} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="驱动内容" icon={<BookOpen size={14} color="#ff8aa5" />}>
            {detail.contents.map((c, i) => (
              <div key={i} style={{
                padding: '10px 12px', marginBottom: 6, background: 'var(--bg-card)',
                borderRadius: 8, border: '1px solid var(--border-light)', cursor: 'pointer',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{c.title}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span>{c.type}</span>
                  <span>浏览: {c.views}</span>
                  <span>转化率: {c.convRate}</span>
                </div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="优化建议" icon={<Sparkles size={14} color="#fbbf24" />}>
            {detail.suggestions.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border-light)',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'rgba(232,54,93,0.1)',
                  color: '#e8365d', fontSize: '0.65rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{i + 1}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </PanelSection>

          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton label="应用优化建议" onClick={() => { showToast('✅ AI优化建议已应用，预计下次报告周期体现效果', '#22c55e') }} />
            <ActionButton label="导出路径报告" onClick={() => { showToast('📥 路径归因报告导出中...', '#e8365d') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    // ── KOL Detail drill-down ──
    if (type === 'kolDetail') {
      const kolName = data?.kol as string
      const kolInfo = kolAttribution.find(k => k.kol === kolName)
      const kolContent = kolContentPieces[kolName]
      if (!kolInfo || !kolContent) return null
      return (
        <DrillPanel open title={kolName} subtitle={`${kolInfo.platform} | ${kolContent.followers} 粉丝 | ${kolContent.category}`} onClose={closePanel}>
          <PanelSection title="达人概览" icon={<Users size={14} color="#e8365d" />}>
            <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
              <PanelRow label="平台" value={kolInfo.platform} />
              <PanelRow label="粉丝数" value={kolContent.followers} />
              <PanelRow label="类型" value={kolContent.category} />
              <PanelRow label="内容数" value={`${kolInfo.contentCount}篇`} />
              <PanelRow label="总曝光" value={kolInfo.totalExposure} />
              <PanelRow label="受众重合度" value={kolContent.audienceOverlap} color="#ff6b8a" />
            </div>
          </PanelSection>

          <PanelSection title="归因效果" icon={<Target size={14} color="#ff6b8a" />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '归因GMV', value: kolInfo.attributedGMV, color: '#e8365d' },
                { label: 'ROI', value: `${kolInfo.roi.toFixed(2)}x`, color: kolInfo.roi >= 6 ? '#22c55e' : kolInfo.roi >= 5 ? '#34d399' : '#fbbf24' },
                { label: '直接转化', value: kolInfo.directConv.toLocaleString(), color: 'var(--text-primary)' },
                { label: '助攻转化', value: kolInfo.assistedConv.toLocaleString(), color: 'var(--text-primary)' },
                { label: '平均转化天数', value: `${kolInfo.avgConvDays}天`, color: 'var(--text-primary)' },
                { label: '爆品', value: kolInfo.topProduct, color: '#ff6b8a' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '10px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)',
                }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="历史ROI趋势" icon={<TrendingUp size={14} color="#22c55e" />}>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={kolContent.roiTrend} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}x`, 'ROI']} />
                <Line type="monotone" dataKey="roi" stroke="#e8365d" strokeWidth={2} dot={{ fill: '#e8365d', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </PanelSection>

          <PanelSection title="成本明细" icon={<Banknote size={14} color="#fbbf24" />}>
            {kolContent.costBreakdown.map((c, i) => (
              <PanelRow key={i} label={c.item} value={c.amount} />
            ))}
            <PanelRow label="总成本" value={kolInfo.cost} color="#e8365d" />
          </PanelSection>

          <PanelSection title={`内容作品 (${kolContent.contents.length}篇)`} icon={<BookOpen size={14} color="#ff8aa5" />}>
            {kolContent.contents.map((c, i) => (
              <div key={i} style={{
                padding: '12px', marginBottom: 8, background: 'var(--bg-card)',
                borderRadius: 8, border: '1px solid var(--border-light)', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{c.title}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8365d', flexShrink: 0, marginLeft: 8 }}>{c.gmv}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, fontSize: '0.68rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '1px 6px', borderRadius: 4, background: 'rgba(232,54,93,0.08)', color: '#e8365d', fontWeight: 600,
                  }}>{c.type}</span>
                  <span>{c.date}</span>
                  <span>播放 {formatViews(c.views)}</span>
                  <span>赞 {formatViews(c.likes)}</span>
                  <span>藏 {formatViews(c.saves)}</span>
                  <span>评 {formatViews(c.comments)}</span>
                </div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="Top内容分析" icon={<Sparkles size={14} color="#fbbf24" />}>
            <div style={{ padding: 12, background: 'rgba(232,54,93,0.06)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: '#e8365d' }}>最佳内容特征: </strong>
              {kolName === '彩妆师小雅' && '教程类和试色合集表现最佳, 建议增加此类内容产出。直播预热短视频有效拉动直播GMV。'}
              {kolName === '成分研究社' && '深度成分解析类笔记收藏率最高(平均12%), 对高客单价护肤品转化贡献大。横评内容引流效果显著。'}
              {kolName === '粉粉的小仙女' && '少女风格妆容教程和学生党推荐内容互动率高, 带动平价产品线销量。限定色号内容稀缺性驱动转化。'}
              {kolName === '口红上新' && '直播场均GMV超¥50万, 买赠活动转化率最高(8.2%)。建议增加直播频次, 短视频预热可提升直播流量30%。'}
              {kolName === '小白兔变美记' && '日常种草和横评内容性价比最高, ROI稳定在6x以上。建议扩大合作规模, 是高性价比达人典范。'}
            </div>
          </PanelSection>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ActionButton label="续约达人" onClick={() => { showToast('📝 续约申请已提交至达人运营团队', '#22c55e') }} />
            <ActionButton label="调整合作方案" onClick={() => { showToast('🤝 合作方案调整申请已发送，运营将在24小时内回复', '#8b5cf6') }} />
            <ActionButton label="导出达人报告" onClick={() => { showToast('📥 KOL归因报告导出中...', '#e8365d') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    // ── Model Detail drill-down ──
    if (type === 'modelDetail') {
      const modelKey = data?.modelKey as string
      const detail = modelDetailData[modelKey]
      const modelInfo = modelExplanations.find(m => m.key === modelKey)
      if (!detail || !modelInfo) return null
      return (
        <DrillPanel open title={detail.fullName} subtitle={modelInfo.desc} onClose={closePanel}>
          <PanelSection title="模型概述" icon={<Brain size={14} color={modelInfo.color} />}>
            <div style={{
              padding: 12, background: 'var(--bg-card)', borderRadius: 8,
              border: `1px solid ${modelKey === 'shapley' ? 'rgba(232,54,93,0.3)' : 'var(--border-light)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: modelInfo.color }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{modelInfo.name}</span>
                {modelKey === 'shapley' && (
                  <span style={{ padding: '2px 8px', borderRadius: 10, background: '#e8365d', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>AI推荐</span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{modelInfo.desc}</div>
            </div>
          </PanelSection>

          <PanelSection title="数学公式" icon={<Info size={14} color="#ff6b8a" />}>
            <div style={{
              padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)',
              fontFamily: 'monospace', fontSize: '0.72rem', color: '#e8365d', overflowX: 'auto', whiteSpace: 'nowrap',
            }}>
              {detail.formula}
            </div>
          </PanelSection>

          <PanelSection title="优势" icon={<Star size={14} color="#22c55e" />}>
            {detail.pros.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>+</span>
                <span>{p}</span>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="劣势" icon={<Info size={14} color="#f59e0b" />}>
            {detail.cons.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>-</span>
                <span>{c}</span>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="适用场景" icon={<Target size={14} color="#a78bfa" />}>
            {detail.useCases.map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>*</span>
                <span>{u}</span>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="AI推荐意见" icon={<Sparkles size={14} color="#e8365d" />}>
            <div style={{
              padding: 12, background: 'rgba(232,54,93,0.06)', borderRadius: 8,
              border: '1px solid rgba(232,54,93,0.15)', fontSize: '0.75rem',
              color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              {detail.aiRecommendation}
            </div>
          </PanelSection>

          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton label="设为默认模型" onClick={() => { showToast('✅ 已设为默认归因模型，下次分析即生效', '#22c55e') }} />
            <ActionButton label="查看模型对比" onClick={() => { showToast('📊 模型对比分析加载中...', '#3b82f6') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    // ── Channel Detail drill-down (Tab 4) ──
    if (type === 'channelDetail') {
      const channel = data?.channel as string
      const detail = channelModelDetail[channel]
      if (!detail) return null
      return (
        <DrillPanel open title={`渠道详情: ${channel}`} subtitle="各归因模型对比分析" onClose={closePanel}>
          <PanelSection title="各模型归因ROI" icon={<BarChart3 size={14} color="#e8365d" />}>
            {detail.modelValues.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: m.color, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.model}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(m.roi / 7) * 100}%`, height: '100%', background: m.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: m.color, width: 35, textAlign: 'right' }}>{m.roi}x</span>
                </div>
              </div>
            ))}
          </PanelSection>

          <PanelSection title="推荐归因" icon={<Award size={14} color="#e8365d" />}>
            <div style={{
              padding: 14, background: 'rgba(232,54,93,0.06)', borderRadius: 10,
              border: '1px solid rgba(232,54,93,0.15)',
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e8365d', marginBottom: 6 }}>
                {detail.recommendedAttribution}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {detail.budgetSuggestion}
              </div>
            </div>
          </PanelSection>

          <PanelSection title="预算调整建议" icon={<Banknote size={14} color="#fbbf24" />}>
            <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
              <PanelRow label="当前月预算" value={detail.currentBudget} />
              <PanelRow label="建议月预算" value={detail.suggestedBudget} color="#e8365d" />
              <PanelRow
                label="调整幅度"
                value={detail.budgetChange}
                color={detail.budgetChange.startsWith('+') ? '#22c55e' : '#f59e0b'}
              />
            </div>
          </PanelSection>

          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton label="应用预算建议" onClick={() => { showToast('✅ AI预算分配建议已应用至广告计划', '#22c55e') }} />
            <ActionButton label="导出渠道报告" onClick={() => { showToast('📥 渠道ROI报告导出中...', '#e8365d') }} />
          </div>
          {toastMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${toastMsg.color}12`, border: `1px solid ${toastMsg.color}30`, fontSize: 12, color: toastMsg.color, fontWeight: 600 }}>
              {toastMsg.text}
            </div>
          )}
        </DrillPanel>
      )
    }

    return null
  }

  return (
    <>
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GitBranch size={22} color="#e8365d" />
          归因分析中心
        </h2>
        <p>跨平台归因分析 · 小红书种草→天猫购买 全链路追踪 · AI智能归因模型</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e8365d', background: 'rgba(232,54,93,0.08)', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, marginTop: 8 }}>
          <Brain size={14} />
          <span>Shapley归因模型置信度 88% · 覆盖285万数据点</span>
        </div>
      </div>

      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="Shapley-Attribution" color="#10b981" />
          <ModelBadge name="ROAS-Forecaster" color="#10b981" />
          <ModelBadge name="UserLTV-Predictor" color="#10b981" />
          <ModelBadge name="BayesianAB-Engine" color="#e8365d" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
          <ModelBadge name="CVR-Predictor-ESMM" color="#e8365d" />
        </div>

        {/* ── 归因维度切换 ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {([
            { key: 'domestic' as const, label: '\ud83c\udde8\ud83c\uddf3 \u56fd\u5185\u5f52\u56e0' },
            { key: 'intl' as const, label: '\ud83c\udf0d \u8de8\u5883\u5f52\u56e0' },
            { key: 'all' as const, label: '\u5168\u94fe\u8def' },
          ]).map(item => (
            <button
              key={item.key}
              onClick={() => setAttrScope(item.key)}
              style={{
                padding: '6px 18px', borderRadius: 20, fontWeight: 600, fontSize: '0.82rem',
                border: attrScope === item.key ? '2px solid #e8365d' : '1.5px solid var(--border-light)',
                background: attrScope === item.key ? 'rgba(232,54,93,0.10)' : 'var(--bg-card)',
                color: attrScope === item.key ? '#e8365d' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >{item.label}</button>
          ))}
        </div>

        <div className="tabs" style={{ marginBottom: 20 }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >{tab}</button>
          ))}
        </div>

        {/* ══════════════ Tab 1: 全链路漏斗 ══════════════ */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* KPI Cards */}
            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: '种草→搜索归因率', value: '2.5%', sub: '种草后产生品牌搜索的比例', icon: <Search size={18} />, color: '#e8365d' },
                { label: '种草→进店归因率', value: '1.5%', sub: '种草后进入品牌店铺浏览', icon: <Eye size={18} />, color: '#ff6b8a' },
                { label: '种草→购买归因率', value: '0.36%', sub: '种草后最终完成购买', icon: <ShoppingCart size={18} />, color: '#22c55e' },
                { label: '归因GMV', value: '¥295万', sub: '本月通过归因追踪到的GMV', icon: <Banknote size={18} />, color: '#fbbf24' },
              ].map(card => (
                <div key={card.label} className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, border: '1px solid var(--border-light)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{card.label}</div>
                    <div style={{ color: card.color, opacity: 0.7 }}>{card.icon}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Funnel Visualization */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color="#e8365d" />
                全链路归因漏斗
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击任意阶段查看详情</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {funnelData.map((item, i) => {
                  const maxCount = funnelData[0].count
                  const widthPct = Math.max((item.count / maxCount) * 100, 12)
                  return (
                    <div key={item.stage}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                        onClick={() => setDrillPanel({ type: 'funnelStage', data: { stage: item.stage, index: i } })}
                      >
                        <div style={{ width: 200, fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
                          {item.stage}
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <div style={{
                            width: `${widthPct}%`,
                            height: 36,
                            background: item.color,
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: 12,
                            transition: 'width 0.5s ease, opacity 0.2s',
                          }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: i < 3 ? '#fff' : 'var(--text-primary)' }}>
                              {formatCount(item.count)}
                            </span>
                          </div>
                        </div>
                        <div style={{ width: 60, fontSize: '0.78rem', fontWeight: 700, color: item.color, textAlign: 'right', flexShrink: 0 }}>
                          {item.rate}
                        </div>
                      </div>
                      {/* Conversion arrow between stages */}
                      {i < funnelData.length - 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '2px 0' }}>
                          <div style={{ width: 200 }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 16 }}>
                            <ArrowRight size={12} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              转化率 {stageConvRate(funnelData[i].count, funnelData[i + 1].count)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Breakdown Selector */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={16} color="#e8365d" />
                  分维度漏斗对比
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { key: 'platform' as const, label: '按平台' },
                    { key: 'product' as const, label: '按产品线' },
                  ].map(btn => (
                    <button
                      key={btn.key}
                      onClick={() => setBreakdownMode(btn.key)}
                      style={{
                        padding: '5px 14px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        border: breakdownMode === btn.key ? 'none' : '1px solid var(--border)',
                        background: breakdownMode === btn.key ? '#e8365d' : 'transparent',
                        color: breakdownMode === btn.key ? '#fff' : 'var(--text-muted)',
                      }}
                    >{btn.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {breakdownMode === 'platform' ? '平台' : '产品线'}
                      </th>
                      {['种草曝光', '内容互动', '品牌搜索', '进店浏览', '加购', '下单支付'].map(col => (
                        <th key={col} style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(breakdownMode === 'platform' ? platformBreakdown : productBreakdown).map(row => (
                      <tr
                        key={row.name}
                        style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                        onClick={() => breakdownMode === 'platform' && setDrillPanel({ type: 'platformDetail', data: { platform: row.name, stage: '种草曝光' } })}
                      >
                        <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</td>
                        {['种草曝光', '内容互动', '品牌搜索', '进店浏览', '加购', '下单支付'].map(col => (
                          <td key={col} style={{ textAlign: 'right', padding: '10px', color: 'var(--text-secondary)' }}>
                            {formatCount(row[col as keyof typeof row] as number)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Time Lag Distribution */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="#e8365d" />
                种草→购买 时间间隔分布
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击柱形查看详情</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={timeLagData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <XAxis dataKey="lag" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, '占比']} />
                  <Bar
                    dataKey="pct"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    onClick={(_: unknown, index: number) => setDrillPanel({ type: 'timeLag', data: { lag: timeLagData[index].lag } })}
                    style={{ cursor: 'pointer' }}
                  >
                    {timeLagData.map((_, i) => (
                      <Cell key={i} fill={i === 1 ? '#e8365d' : i === 2 ? '#ff6b8a' : '#ff8aa5'} style={{ cursor: 'pointer' }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                高峰: 种草后1-7天内完成购买占比 <span style={{ color: '#e8365d', fontWeight: 700 }}>53%</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 2: 跨平台归因矩阵 ══════════════ */}
        {activeTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Heatmap Matrix */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} color="#e8365d" />
                跨平台归因矩阵 (归因GMV, 万元)
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击单元格查看详情</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, minWidth: 120 }}>
                        种草平台 / 转化平台
                      </th>
                      {destinations.map(d => (
                        <th key={d} style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, minWidth: 90 }}>{d}</th>
                      ))}
                      <th style={{ textAlign: 'center', padding: '10px 12px', color: '#e8365d', fontWeight: 700, minWidth: 80 }}>合计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.map(row => (
                      <tr key={row.source} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.source}</td>
                        {destinations.map(d => {
                          const val = row[d as keyof typeof row] as number
                          return (
                            <td
                              key={d}
                              onClick={() => setDrillPanel({ type: 'matrixCell', data: { source: row.source, dest: d, value: val } })}
                              style={{
                                textAlign: 'center', padding: '10px 12px', fontWeight: 600,
                                background: heatmapBg(val, maxMatrixVal),
                                color: val > maxMatrixVal * 0.5 ? '#fff' : 'var(--text-primary)',
                                borderRadius: 0, cursor: 'pointer',
                              }}>
                              {val.toFixed(1)}
                            </td>
                          )
                        })}
                        <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, color: '#e8365d' }}>
                          {row.total.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                    {/* Column totals */}
                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#e8365d' }}>合计</td>
                      {destinations.map(d => {
                        const colTotal = matrix.reduce((sum, r) => sum + (r[d as keyof typeof r] as number), 0)
                        return (
                          <td key={d} style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, color: '#e8365d' }}>
                            {colTotal.toFixed(1)}
                          </td>
                        )
                      })}
                      <td style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 800, color: '#e8365d', fontSize: '0.85rem' }}>
                        {matrix.reduce((s, r) => s + r.total, 0).toFixed(1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>颜色深度表示归因GMV大小:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[0.15, 0.3, 0.45, 0.6].map((alpha, i) => (
                    <div key={i} style={{ width: 24, height: 12, background: `rgba(232,54,93,${alpha})`, borderRadius: 2 }} />
                  ))}
                  <span style={{ marginLeft: 4 }}>低 → 高</span>
                </div>
              </div>
            </div>

            {/* Top Conversion Paths */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="#e8365d" />
                Top 5 转化路径
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击路径查看详情</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topPaths.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => setDrillPanel({ type: 'topPath', data: { path: p.path, gmv: p.gmv, convDays: p.convDays, pct: p.pct } })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                      background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)',
                      cursor: 'pointer',
                    }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? '#e8365d' : i === 1 ? '#ff6b8a' : 'var(--bg-card)',
                      color: i < 2 ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {p.path}
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>转化周期: {p.convDays}</span>
                        <span>占比: {p.pct}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#e8365d' }}>{p.gmv}</div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 3: 🌍 国际归因 ══════════════ */}
        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 国际归因总览条 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {[
                { label: '国际总GMV', value: '$42.6万', delta: '+28.4%', color: '#0ea5e9' },
                { label: '综合ROAS', value: '4.08x', delta: '+0.32x', color: '#22c55e' },
                { label: '归因覆盖率', value: '81.2%', delta: '+6.8%', color: '#8b5cf6' },
                { label: 'iOS归因缺口', value: '18%', delta: 'Conversions API修复中', color: '#f59e0b' },
              ].map(k => (
                <div key={k.label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.delta}</div>
                </div>
              ))}
            </div>
            {/* 国际平台归因矩阵 */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>🌍 国际平台跨渠道归因矩阵（万USD）</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>种草渠道</th>
                      <th>Amazon</th>
                      <th>独立站</th>
                      <th>TikTok Shop</th>
                      <th>合计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { source: 'Meta Facebook广告', Amazon: 8.2, 独立站: 12.5, TikTok_Shop: 3.8, total: 24.5 },
                      { source: 'Instagram Reels', Amazon: 5.6, 独立站: 9.8, TikTok_Shop: 6.2, total: 21.6 },
                      { source: 'TikTok for Business', Amazon: 3.2, 独立站: 4.5, TikTok_Shop: 14.8, total: 22.5 },
                      { source: 'Google Shopping', Amazon: 6.8, 独立站: 8.2, TikTok_Shop: 1.2, total: 16.2 },
                      { source: 'YouTube视频广告', Amazon: 2.8, 独立站: 5.6, TikTok_Shop: 2.4, total: 10.8 },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{row.source}</td>
                        <td style={{ color: '#f59e0b' }}>${row.Amazon}</td>
                        <td style={{ color: '#0ea5e9' }}>${row.独立站}</td>
                        <td style={{ color: '#8b5cf6' }}>${row.TikTok_Shop}</td>
                        <td style={{ fontWeight: 700 }}>${row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Top 国际转化路径 */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 14 }}>Top 国际转化路径</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { path: 'TikTok短视频 → TikTok Shop直接下单', gmv: '$14.8万', days: '当场', pct: '34.8%', color: '#8b5cf6' },
                  { path: 'Instagram Reels → 独立站搜索 → 下单', gmv: '$9.8万', days: '平均2.1天', pct: '23.0%', color: '#ec4899' },
                  { path: 'Meta Facebook广告 → 独立站落地页 → 购买', gmv: '$12.5万', days: '平均1.5天', pct: '29.4%', color: '#1877f2' },
                  { path: 'Google Shopping → Amazon下单', gmv: '$6.8万', days: '平均0.8天', pct: '16.0%', color: '#22c55e' },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 3, height: 36, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{p.path}</div>
                      <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>GMV: <strong style={{ color: p.color }}>{p.gmv}</strong></span>
                        <span>平均转化周期: {p.days}</span>
                        <span>占比: <strong>{p.pct}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* iOS归因缺口说明 */}
            <div className="card" style={{ border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>⚠️ iOS归因缺口分析（ATT影响）</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  { market: '🇺🇸 美国', gap: '22%', fix: 'Conversions API已配置' },
                  { market: '🇬🇧 英国', gap: '19%', fix: 'CAPI覆盖率86%' },
                  { market: '🇯🇵 日本', gap: '14%', fix: '归因模型补偿中' },
                ].map(m => (
                  <div key={m.market} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{m.market}</div>
                    <div style={{ fontSize: '0.72rem', color: '#f59e0b', margin: '3px 0' }}>归因缺口: {m.gap}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.fix}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                AI建议：优先完成 Meta Conversions API 部署，配合 SKAdNetwork 4.0 数据建立 iOS 归因补偿模型，预计可恢复 60%+ 缺口转化数据。
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 4: 达人种草ROI ══════════════ */}
        {activeTab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* KOL Attribution Table */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} color="#e8365d" />
                达人种草归因ROI
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击达人行查看详情</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['达人', '平台', '内容数', '总曝光', '直接转化', '助攻转化', '归因GMV', '成本', 'ROI', '平均转化天数', '爆品'].map(col => (
                        <th key={col} style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kolAttribution.map(row => (
                      <tr
                        key={row.kol}
                        style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                        onClick={() => setDrillPanel({ type: 'kolDetail', data: { kol: row.kol } })}
                      >
                        <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{row.kol}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                            background: row.platform === '抖音' ? 'rgba(232,54,93,0.1)' : row.platform === '小红书' ? 'rgba(255,107,138,0.1)' : row.platform === '抖音直播' ? 'rgba(255,138,165,0.1)' : 'rgba(255,212,224,0.15)',
                            color: row.platform === '抖音' ? '#e8365d' : row.platform === '小红书' ? '#ff6b8a' : row.platform === '抖音直播' ? '#ff8aa5' : '#e8365d',
                          }}>{row.platform}</span>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{row.contentCount}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{row.totalExposure}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{row.directConv.toLocaleString()}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{row.assistedConv.toLocaleString()}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: '#e8365d' }}>{row.attributedGMV}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{row.cost}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            fontWeight: 700,
                            color: row.roi >= 6 ? '#22c55e' : row.roi >= 5 ? '#34d399' : '#fbbf24',
                          }}>{row.roi.toFixed(2)}x</span>
                        </td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{row.avgConvDays}天</td>
                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{row.topProduct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scatter Chart */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={16} color="#e8365d" />
                  成本 vs 归因GMV (气泡大小=内容数)
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击气泡查看达人详情</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem' }}>
                  {Object.entries(scatterColors).map(([platform, color]) => (
                    <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                      <span style={{ color: 'var(--text-muted)' }}>{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <XAxis
                    type="number" dataKey="costNum" name="成本"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
                    label={{ value: '成本 (万元)', position: 'bottom', fill: 'var(--text-muted)', fontSize: 11, offset: -2 }}
                  />
                  <YAxis
                    type="number" dataKey="gmvNum" name="归因GMV"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false}
                    label={{ value: '归因GMV (万元)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="contentCount" range={[80, 400]} name="内容数" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => {
                      if (name === '成本') return [`¥${value}万`, name]
                      if (name === '归因GMV') return [`¥${value}万`, name]
                      return [value, name]
                    }}
                    labelFormatter={() => ''}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null
                      const d = payload[0].payload
                      return (
                        <div style={{ ...tooltipStyle, padding: '10px 14px' }}>
                          <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.kol}</div>
                          <div>平台: {d.platform}</div>
                          <div>成本: ¥{d.costNum}万</div>
                          <div>归因GMV: ¥{d.gmvNum}万</div>
                          <div>ROI: {d.roi}x</div>
                          <div>内容数: {d.contentCount}</div>
                          <div style={{ marginTop: 4, fontSize: '0.65rem', color: '#e8365d' }}>点击查看详情</div>
                        </div>
                      )
                    }}
                  />
                  <Scatter
                    data={kolAttribution}
                    shape="circle"
                    onClick={(entry: { kol?: string }) => {
                      if (entry && entry.kol) {
                        setDrillPanel({ type: 'kolDetail', data: { kol: entry.kol } })
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {kolAttribution.map((entry, i) => (
                      <Cell key={i} fill={scatterColors[entry.platform] || '#e8365d'} fillOpacity={0.8} style={{ cursor: 'pointer' }} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 5: 归因模型对比 ══════════════ */}
        {activeTab === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Grouped Bar Chart */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={16} color="#e8365d" />
                  各渠道归因模型ROI对比
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击柱形查看渠道详情</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', flexWrap: 'wrap' }}>
                  {modelExplanations.map(m => (
                    <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: m.color }} />
                      <span style={{ color: 'var(--text-muted)' }}>
                        {m.name}
                        {m.key === 'shapley' && <span style={{ color: '#e8365d', fontWeight: 700, marginLeft: 2 }}>AI推荐</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  data={modelComparison}
                  margin={{ top: 10, right: 20, bottom: 5, left: 0 }}
                  onClick={(state: { activeLabel?: string } | null) => {
                    if (state && state.activeLabel) {
                      setDrillPanel({ type: 'channelDetail', data: { channel: state.activeLabel } })
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <XAxis dataKey="channel" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} label={{ value: 'ROI', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => {
                    const label = modelExplanations.find(m => m.key === name)?.name || name
                    return [`${v}x`, label]
                  }} />
                  {Object.entries(modelBarColors).map(([key, color]) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={color}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={24}
                      strokeWidth={key === 'shapley' ? 2 : 0}
                      stroke={key === 'shapley' ? '#e8365d' : 'none'}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Model comparison table */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={16} color="#e8365d" />
                模型ROI数值对比
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>渠道</th>
                      {modelExplanations.map(m => (
                        <th key={m.key} style={{
                          textAlign: 'center', padding: '10px 12px', fontWeight: 600,
                          color: m.key === 'shapley' ? '#e8365d' : 'var(--text-muted)',
                          background: m.key === 'shapley' ? 'rgba(232,54,93,0.06)' : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => setDrillPanel({ type: 'modelDetail', data: { modelKey: m.key } })}
                        >
                          {m.name}
                          {m.key === 'shapley' && <div style={{ fontSize: '0.6rem', color: '#e8365d', fontWeight: 700 }}>AI推荐</div>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modelComparison.map(row => {
                      const values = [row.firstTouch, row.lastTouch, row.linear, row.timeDecay, row.shapley]
                      const maxVal = Math.max(...values)
                      return (
                        <tr
                          key={row.channel}
                          style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                          onClick={() => setDrillPanel({ type: 'channelDetail', data: { channel: row.channel } })}
                        >
                          <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.channel}</td>
                          {modelExplanations.map(m => {
                            const val = row[m.key as keyof typeof row] as number
                            return (
                              <td key={m.key} style={{
                                textAlign: 'center', padding: '12px', fontWeight: 600,
                                color: val === maxVal ? '#22c55e' : 'var(--text-secondary)',
                                background: m.key === 'shapley' ? 'rgba(232,54,93,0.04)' : 'transparent',
                              }}>
                                {val.toFixed(1)}x
                                {val === maxVal && <span style={{ fontSize: '0.6rem', marginLeft: 2, color: '#22c55e' }}>▲</span>}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Explanations */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={16} color="#e8365d" />
                归因模型解读
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>点击模型卡片查看详情</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {modelExplanations.map(m => (
                  <div
                    key={m.key}
                    onClick={() => setDrillPanel({ type: 'modelDetail', data: { modelKey: m.key } })}
                    style={{
                      padding: '16px', borderRadius: 10, border: `1px solid ${m.key === 'shapley' ? '#e8365d' : 'var(--border-light)'}`,
                      background: m.key === 'shapley' ? 'rgba(232,54,93,0.06)' : 'var(--bg-primary)',
                      position: 'relative', cursor: 'pointer',
                    }}>
                    {m.key === 'shapley' && (
                      <div style={{
                        position: 'absolute', top: -8, right: 12,
                        background: '#e8365d', color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                        padding: '2px 10px', borderRadius: 10,
                      }}>
                        AI推荐模型
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: m.color }} />
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: m.key === 'shapley' ? '#e8365d' : 'var(--text-primary)' }}>
                        {m.name}
                      </div>
                      <ChevronRight size={14} color="var(--text-muted)" style={{ marginLeft: 'auto' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {m.desc}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 16, padding: '12px 16px', borderRadius: 8,
                background: 'rgba(232,54,93,0.06)', border: '1px solid rgba(232,54,93,0.15)',
                fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                <strong style={{ color: '#e8365d' }}>AI建议:</strong> 基于玛丽黛佳的跨平台营销特点, Shapley值归因模型能更准确评估各渠道的边际贡献。
                小红书种草在首触归因下被高估(5.8x→4.8x), KOL直播在末触归因下被高估(5.2x→4.5x)。
                建议使用Shapley模型作为预算分配的核心参考依据。
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ 跨境归因链路 · CAPI + MMP ══════════════ */}
        {(attrScope === 'all' || attrScope === 'intl') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>

            {/* ── 归因方式对比表 ── */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                {'\ud83c\udf0d'} 跨境归因链路 · CAPI + MMP
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                      {['归因方式', '覆盖率', '准确度', '适用平台', '状态'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { method: 'Meta CAPI (服务端)', coverage: '68.4%', accuracy: '高', platform: 'Facebook/Instagram', status: '\u2705 已接入', statusColor: '#22c55e' },
                      { method: 'TikTok Events API', coverage: '72.1%', accuracy: '高', platform: 'TikTok Global', status: '\u2705 已接入', statusColor: '#22c55e' },
                      { method: 'Google Enhanced Conv.', coverage: '81.3%', accuracy: '高', platform: 'Google/YouTube', status: '\u2705 已接入', statusColor: '#22c55e' },
                      { method: 'SKAdNetwork 4.0', coverage: '22%', accuracy: '中', platform: 'iOS全平台', status: '\ud83d\udfe1 部分', statusColor: '#eab308' },
                      { method: '概率归因模型 (AI)', coverage: '78.4%', accuracy: '中高', platform: '全平台补充', status: '\u2705 运行中', statusColor: '#22c55e' },
                      { method: 'Fingerprint (已废弃)', coverage: '—', accuracy: '—', platform: '—', status: '\u274c GDPR禁止', statusColor: '#ef4444' },
                    ].map(row => (
                      <tr key={row.method} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.method}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.coverage}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.accuracy}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{row.platform}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: row.statusColor }}>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── iOS ATT 归因缺口可视化 ── */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} color="#f97316" />
                iOS ATT 归因缺口可视化
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'IDFA可用率', value: 34.2, color: '#f97316' },
                  { label: 'CAPI补偿后', value: 54.7, color: '#22c55e' },
                  { label: 'AI模型补偿后', value: 78.4, color: '#a855f7' },
                ].map(bar => (
                  <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 110, fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right', flexShrink: 0 }}>{bar.label}</div>
                    <div style={{ flex: 1, height: 22, background: 'var(--border-light)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${bar.value}%`, height: '100%', background: bar.color, borderRadius: 6, transition: 'width 0.8s ease' }} />
                    </div>
                    <div style={{ width: 52, fontSize: '0.82rem', fontWeight: 700, color: bar.color, textAlign: 'right' }}>{bar.value}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 跨境归因AI洞察 ── */}
            <div style={{
              padding: '14px 18px', borderRadius: 10,
              background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.18)',
              fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={14} color="#0ea5e9" />
                <span style={{ fontWeight: 700, color: '#0ea5e9', fontSize: '0.82rem' }}>跨境归因AI洞察</span>
                <ModelBadge name="MetaCAPI-Attribution" color="#0ea5e9" />
              </div>
              <span>
                MetaCAPI-Attribution 模型检测到 UK 市场 Purchase 事件匹配率仅58%（低于阈值65%），建议上传用户邮箱哈希值以提升服务端匹配度。预计归因恢复+12%。
              </span>
            </div>

          </div>
        )}
      </div>

      {/* ══════════════ Drill-down Panel ══════════════ */}
      {renderDrillContent()}
    </>
  )
}
