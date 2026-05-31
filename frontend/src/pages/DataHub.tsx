import { useState, useEffect } from 'react'
import { Database, HardDrive, Clock, AlertTriangle, Shield, ChevronDown, ChevronRight, ShoppingBag, Megaphone, Eye, MessageCircle, Users, TrendingUp, Play, Pause, RotateCw, XCircle, CheckCircle, X, FileText, Settings, Globe } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ── AI Config ──────────────────────────────────────────────────────────────────
const dataHubAIGroups: AIConfigGroup[] = [
  {
    name: '采集频率策略',
    icon: <Database size={15} />,
    params: [
      createParam('crawl_freq_ecom', '电商数据采集频率', 15, '分钟', '抖音小店/天猫/京东/快手小店 SKU和GMV数据同步间隔', 10, 88, { min: 5, max: 60, step: 5, learningDataPoints: 42800, adjustHistory: [
        { time: '昨日', from: '30', to: '15', reason: '618大促期间数据变化加速, AI缩短采集间隔' },
        { time: '3天前', from: '15', to: '30', reason: '日常期间数据变化缓慢, AI延长间隔节省资源' },
      ] }),
      createParam('crawl_freq_ad', '广告数据同步频率', 5, '分钟', '巨量引擎/聚光/磁力广告效果数据同步间隔, 影响投放决策时效性', 3, 92, { min: 1, max: 30, step: 1, learningDataPoints: 85600, adjustHistory: [
        { time: '2小时前', from: '10', to: '5', reason: '直播期间需要更高频数据反馈, AI提升频率' },
      ] }),
      createParam('crawl_freq_intel', '情报数据采集频率', 60, '分钟', '蝉妈妈/飞瓜/新榜等第三方情报平台数据采集间隔', 45, 85, { min: 15, max: 180, step: 15, learningDataPoints: 28400, adjustHistory: [
        { time: '1天前', from: '120', to: '60', reason: '竞品完美日记大促期间, AI提升监控频率' },
      ] }),
      createParam('crawl_freq_social', '社交聆听频率', 30, '分钟', '小红书/微博品牌提及和舆情监控间隔', 20, 86, { min: 10, max: 120, step: 10, learningDataPoints: 35200, adjustHistory: [
        { time: '昨日', from: '60', to: '30', reason: '检测到品牌负面舆情信号, AI加密监控频率' },
      ] }),
      createParam('crawl_freq_intl_ad', '国际广告API同步频率', 5, '分钟', 'Meta Ads/TikTok for Business/Google Ads API数据同步间隔', 3, 89, { min: 1, max: 30, step: 1, learningDataPoints: 62400, adjustHistory: [
        { time: '3小时前', from: '10', to: '5', reason: '检测到Meta CAPI数据延迟，AI提升同步频率降低归因误差' },
      ] }),
    ],
  },
  {
    name: '数据质量控制',
    icon: <Shield size={15} />,
    params: [
      createParam('freshness_threshold', '数据新鲜度告警阈值', 30, '分钟', '数据超过此时间未更新则触发告警, 影响投放决策准确性', 20, 90, { min: 5, max: 120, step: 5 }),
      createParam('anomaly_sensitivity', '异常检测灵敏度', 2.5, 'σ', '数据量偏离均值超过此标准差时标记为异常', 2.0, 87, { min: 1.0, max: 5.0, step: 0.5 }),
      createParam('completeness_target', '数据完整度目标', 95, '%', '关键字段非空率目标, 低于此值触发数据修复', 98, 84, { min: 80, max: 100, step: 1 }),
      createParam('dedup_strategy', '数据去重策略', '语义去重', '', '数据去重方式: 精确匹配速度快, 语义去重准确率高', 'AI动态', 82, { type: 'select', options: ['精确匹配', '语义去重', 'AI动态'] }),
    ],
  },
]

const dataHubLearningStatus: AILearningStatus = {
  modelVersion: 'v2.1.0-data-quality',
  lastTraining: '45分钟前',
  totalDataPoints: 1250000,
  avgConfidence: 89,
  autoAdjustCount24h: 42,
  learningRate: '0.002',
  nextTraining: '15分钟后',
  improvementRate: '+6.8%',
}

// ── Static Data ────────────────────────────────────────────────────────────────

const tabs = ['数据源总览', '采集任务管理', '数据质量监控']

const kpiCards = [
  { label: '已接入数据源', value: '28个', icon: Database, color: '#e8365d' },
  { label: '今日采集量', value: '4,280万条', icon: HardDrive, color: '#8b5cf6' },
  { label: '数据新鲜度', value: '98.2%', icon: Clock, color: '#22c55e' },
  { label: '异常数据源', value: '1个', icon: AlertTriangle, color: '#f59e0b' },
]

interface DataSource {
  source: string
  api: string
  freq: string
  volume: string
  lastSync: string
  status: 'connected' | 'warning' | 'error'
  quality: number
  fields: string
}

interface DataCategory {
  name: string
  icon: React.ReactNode
  sources: DataSource[]
  region?: '国内' | '国际'
}

const dataCategories: DataCategory[] = [
  {
    name: '电商平台数据',
    icon: <ShoppingBag size={16} />,
    sources: [
      { source: '抖音小店', api: '巨量引擎API v3.0', freq: '15分钟', volume: '85万条/日', lastSync: '2分钟前', status: 'connected', quality: 99, fields: 'SKU日销量、客单价、转化率、退货率、店铺流量、搜索词' },
      { source: '天猫旗舰店', api: '淘宝开放平台', freq: '15分钟', volume: '120万条/日', lastSync: '5分钟前', status: 'connected', quality: 98, fields: '交易订单、商品数据、流量来源、搜索词、用户评价' },
      { source: '京东旗舰店', api: '京东宙斯API', freq: '30分钟', volume: '45万条/日', lastSync: '8分钟前', status: 'connected', quality: 97, fields: '订单数据、SKU销量、促销效果、评价数据' },
      { source: '快手小店', api: '快手电商API', freq: '15分钟', volume: '38万条/日', lastSync: '3分钟前', status: 'connected', quality: 98, fields: 'GMV、订单、退货、直播关联销售' },
    ],
  },
  {
    name: '广告平台数据',
    icon: <Megaphone size={16} />,
    sources: [
      { source: '巨量引擎', api: 'Marketing API v3', freq: '5分钟', volume: '620万条/日', lastSync: '1分钟前', status: 'connected', quality: 99, fields: '计划级CPM/CPC/CPA/ROI、素材级CTR/CVR/完播率、DMP人群包' },
      { source: '小红书聚光', api: '聚光平台API', freq: '5分钟', volume: '280万条/日', lastSync: '2分钟前', status: 'connected', quality: 97, fields: '笔记推广数据、种草值、互动成本、搜索广告效果' },
      { source: '快手磁力', api: '磁力引擎API', freq: '5分钟', volume: '185万条/日', lastSync: '1分钟前', status: 'connected', quality: 98, fields: '投放消耗、转化数据、直播投流ROI' },
      { source: '微信广告', api: '微信广告API', freq: '10分钟', volume: '95万条/日', lastSync: '4分钟前', status: 'connected', quality: 96, fields: '朋友圈广告效果、视频号推广、小程序导流' },
    ],
  },
  {
    name: '第三方情报',
    icon: <Eye size={16} />,
    sources: [
      { source: '蝉妈妈', api: 'API+爬虫', freq: '60分钟', volume: '52万条/日', lastSync: '15分钟前', status: 'connected', quality: 94, fields: '竞品直播间GMV、在线人数、达人带货排行、热销商品' },
      { source: '飞瓜数据', api: 'API', freq: '60分钟', volume: '38万条/日', lastSync: '22分钟前', status: 'connected', quality: 93, fields: '小红书竞品笔记分析、热门话题、博主数据' },
      { source: '新榜', api: 'API', freq: '120分钟', volume: '25万条/日', lastSync: '45分钟前', status: 'connected', quality: 95, fields: '多平台内容排行、爆款内容特征' },
      { source: '巨量算数', api: 'API', freq: '30分钟', volume: '180万条/日', lastSync: '8分钟前', status: 'connected', quality: 97, fields: '搜索趋势、热词排行、人群画像' },
    ],
  },
  {
    name: '社交聆听',
    icon: <MessageCircle size={16} />,
    sources: [
      { source: '小红书笔记监控', api: '爬虫+NLP', freq: '30分钟', volume: '85万条/日', lastSync: '12分钟前', status: 'connected', quality: 91, fields: '品牌提及、用户评价、种草/拔草内容、成分讨论' },
      { source: '微博舆情', api: '微博开放平台', freq: '15分钟', volume: '42万条/日', lastSync: '6分钟前', status: 'connected', quality: 93, fields: '品牌声量、话题热度、情感分析' },
      { source: '百度/微信指数', api: 'API+爬虫', freq: '60分钟', volume: '12万条/日', lastSync: '28分钟前', status: 'connected', quality: 96, fields: '搜索量趋势、需求图谱、人群画像' },
      { source: '电商评价分析', api: 'NLP处理', freq: '120分钟', volume: '35万条/日', lastSync: '55分钟前', status: 'warning', quality: 88, fields: '情感分析、用户痛点提取、需求聚类、竞品对比' },
    ],
  },
  {
    name: 'KOL达人数据',
    icon: <Users size={16} />,
    sources: [
      { source: '抖音达人库', api: '巨量星图API', freq: '60分钟', volume: '28万条/日', lastSync: '18分钟前', status: 'connected', quality: 95, fields: '粉丝量/互动率/粉丝画像/带货GMV/视频数据' },
      { source: '小红书博主', api: '蒲公英平台', freq: '60分钟', volume: '22万条/日', lastSync: '25分钟前', status: 'connected', quality: 94, fields: '粉丝量/笔记互动/种草转化率/合作报价' },
      { source: '快手达人', api: '快手联盟', freq: '60分钟', volume: '15万条/日', lastSync: '20分钟前', status: 'connected', quality: 93, fields: '粉丝量/直播数据/带货能力/退货率' },
      { source: '历史合作数据', api: '内部CRM', freq: '实时', volume: '3万条/日', lastSync: '刚刚', status: 'connected', quality: 99, fields: '坑位费/佣金率/退货率/复购率/ROI' },
    ],
  },
  {
    name: '行业趋势',
    icon: <TrendingUp size={16} />,
    sources: [
      { source: '美妆成分趋势', api: '聚合分析', freq: '日', volume: '5万条/日', lastSync: '2小时前', status: 'connected', quality: 92, fields: '玻尿酸/烟酰胺/视黄醇/神经酰胺 搜索量变化' },
      { source: '品类增速监控', api: '聚合分析', freq: '日', volume: '8万条/日', lastSync: '3小时前', status: 'connected', quality: 94, fields: '唇釉/粉底/眼影/卸妆 品类GMV月环比' },
      { source: '色彩趋势', api: '爬虫+AI分析', freq: '周', volume: '2万条/周', lastSync: '1天前', status: 'connected', quality: 90, fields: '流行色号、季节趋势、爆款色预测' },
    ],
  },
  {
    name: '🌍 国际广告平台',
    icon: <Globe size={16} />,
    region: '国际',
    sources: [
      { source: 'Meta Ads Manager', api: 'Marketing API v18.0', freq: '5分钟', volume: '185万条/日', lastSync: '2分钟前', status: 'connected', quality: 97, fields: 'ROAS/CPM/CPC/CTR、受众触达、Conversions API增强转化、Pixel事件、A/B测试结果' },
      { source: 'TikTok for Business', api: 'Business API v1.3', freq: '5分钟', volume: '142万条/日', lastSync: '1分钟前', status: 'connected', quality: 96, fields: '视频CTR/完播率/CPM/CPA、创意素材效果、TikTok Pixel转化、区域分市场数据' },
      { source: 'Google Ads', api: 'Google Ads API v15', freq: '10分钟', volume: '98万条/日', lastSync: '3分钟前', status: 'connected', quality: 98, fields: 'Search/Display/YouTube效果、PMax策略数据、转化跟踪、关键词竞价分析' },
      { source: 'Amazon DSP', api: 'Amazon Advertising API v3', freq: '30分钟', volume: '38万条/日', lastSync: '12分钟前', status: 'connected', quality: 94, fields: 'DSP展示广告、Sponsored Products效果、ASIN商品广告、Re-marketing数据' },
    ],
  },
]

const crawlJobs = [
  { id: 'JOB-001', source: '抖音小店', type: 'API同步', schedule: '每15分钟', lastRun: '14:32:18', nextRun: '14:47:18', status: '运行中', records: 56800, duration: '12s', errorRate: 0.02 },
  { id: 'JOB-002', source: '巨量引擎', type: 'API同步', schedule: '每5分钟', lastRun: '14:35:00', nextRun: '14:40:00', status: '运行中', records: 128500, duration: '8s', errorRate: 0.01 },
  { id: 'JOB-003', source: '小红书笔记', type: '定时爬虫', schedule: '每30分钟', lastRun: '14:20:00', nextRun: '14:50:00', status: '等待中', records: 42000, duration: '45s', errorRate: 0.15 },
  { id: 'JOB-004', source: '蝉妈妈竞品', type: 'API+爬虫', schedule: '每60分钟', lastRun: '14:00:00', nextRun: '15:00:00', status: '运行中', records: 18500, duration: '120s', errorRate: 0.08 },
  { id: 'JOB-005', source: '天猫订单', type: 'API同步', schedule: '每15分钟', lastRun: '14:30:00', nextRun: '14:45:00', status: '运行中', records: 85200, duration: '15s', errorRate: 0.01 },
  { id: 'JOB-006', source: '电商评价NLP', type: 'NLP处理', schedule: '每120分钟', lastRun: '13:00:00', nextRun: '15:00:00', status: '异常', records: 0, duration: '-', errorRate: 1.0 },
  { id: 'JOB-007', source: '微博舆情', type: '流式爬虫', schedule: '每15分钟', lastRun: '14:33:00', nextRun: '14:48:00', status: '运行中', records: 28400, duration: '20s', errorRate: 0.05 },
  { id: 'JOB-008', source: '百度指数', type: 'API', schedule: '每60分钟', lastRun: '14:00:00', nextRun: '15:00:00', status: '等待中', records: 8200, duration: '5s', errorRate: 0.0 },
  { id: 'JOB-009', source: 'Meta Ads Manager', type: 'API同步', schedule: '每5分钟', lastRun: '14:35:00', nextRun: '14:40:00', status: '运行中', records: 92500, duration: '10s', errorRate: 0.02 },
  { id: 'JOB-010', source: 'TikTok for Business', type: 'API同步', schedule: '每5分钟', lastRun: '14:35:00', nextRun: '14:40:00', status: '运行中', records: 71200, duration: '9s', errorRate: 0.03 },
  { id: 'JOB-011', source: 'Google Ads', type: 'API同步', schedule: '每10分钟', lastRun: '14:30:00', nextRun: '14:40:00', status: '运行中', records: 48800, duration: '7s', errorRate: 0.01 },
  { id: 'JOB-012', source: 'Amazon DSP', type: 'API同步', schedule: '每30分钟', lastRun: '14:20:00', nextRun: '14:50:00', status: '等待中', records: 19200, duration: '22s', errorRate: 0.05 },
]

const hourlyVolumeData = [
  { hour: '00:00', 电商: 120, 广告: 80, 情报: 20, 社交: 30, 达人: 10, 趋势: 5 },
  { hour: '01:00', 电商: 85, 广告: 45, 情报: 15, 社交: 20, 达人: 5, 趋势: 2 },
  { hour: '02:00', 电商: 60, 广告: 30, 情报: 10, 社交: 15, 达人: 3, 趋势: 1 },
  { hour: '03:00', 电商: 45, 广告: 20, 情报: 8, 社交: 10, 达人: 2, 趋势: 1 },
  { hour: '04:00', 电商: 40, 广告: 18, 情报: 6, 社交: 8, 达人: 2, 趋势: 1 },
  { hour: '05:00', 电商: 55, 广告: 25, 情报: 8, 社交: 12, 达人: 3, 趋势: 2 },
  { hour: '06:00', 电商: 90, 广告: 50, 情报: 12, 社交: 25, 达人: 5, 趋势: 3 },
  { hour: '07:00', 电商: 130, 广告: 85, 情报: 18, 社交: 35, 达人: 8, 趋势: 4 },
  { hour: '08:00', 电商: 180, 广告: 120, 情报: 25, 社交: 48, 达人: 12, 趋势: 5 },
  { hour: '09:00', 电商: 220, 广告: 180, 情报: 35, 社交: 62, 达人: 18, 趋势: 8 },
  { hour: '10:00', 电商: 260, 广告: 220, 情报: 42, 社交: 75, 达人: 22, 趋势: 8 },
  { hour: '11:00', 电商: 280, 广告: 250, 情报: 48, 社交: 80, 达人: 25, 趋势: 10 },
  { hour: '12:00', 电商: 310, 广告: 280, 情报: 52, 社交: 85, 达人: 28, 趋势: 10 },
  { hour: '13:00', 电商: 290, 广告: 260, 情报: 50, 社交: 78, 达人: 26, 趋势: 8 },
  { hour: '14:00', 电商: 305, 广告: 275, 情报: 55, 社交: 82, 达人: 28, 趋势: 9 },
]

const qualityCards = [
  { label: '数据完整度', value: '98.5%', color: '#22c55e' },
  { label: '字段覆盖率', value: '96.2%', color: '#3b82f6' },
  { label: '异常率', value: '0.3%', color: '#f59e0b' },
  { label: '延迟告警', value: '1个', color: '#ef4444' },
]

const freshnessData = [
  { source: '巨量引擎', minutes: 1, color: '#22c55e' },
  { source: '快手磁力', minutes: 1, color: '#22c55e' },
  { source: 'TikTok for Business', minutes: 1, color: '#22c55e' },
  { source: '抖音小店', minutes: 2, color: '#22c55e' },
  { source: '小红书聚光', minutes: 2, color: '#22c55e' },
  { source: 'Meta Ads Manager', minutes: 2, color: '#22c55e' },
  { source: '快手小店', minutes: 3, color: '#22c55e' },
  { source: 'Google Ads', minutes: 3, color: '#22c55e' },
  { source: '微信广告', minutes: 4, color: '#22c55e' },
  { source: '天猫旗舰店', minutes: 5, color: '#22c55e' },
  { source: '微博舆情', minutes: 6, color: '#f59e0b' },
  { source: '巨量算数', minutes: 8, color: '#f59e0b' },
  { source: '京东旗舰店', minutes: 8, color: '#f59e0b' },
  { source: '小红书笔记监控', minutes: 12, color: '#f59e0b' },
  { source: 'Amazon DSP', minutes: 12, color: '#f59e0b' },
  { source: '蝉妈妈', minutes: 15, color: '#f59e0b' },
  { source: '抖音达人库', minutes: 18, color: '#f59e0b' },
  { source: '飞瓜数据', minutes: 22, color: '#f59e0b' },
  { source: '小红书博主', minutes: 25, color: '#f59e0b' },
  { source: '百度/微信指数', minutes: 28, color: '#f59e0b' },
  { source: '新榜', minutes: 45, color: '#ef4444' },
  { source: '电商评价分析', minutes: 55, color: '#ef4444' },
]

const anomalyLog = [
  { time: '14:28:15', source: '电商评价NLP', type: '采集中断', severity: '严重', detail: 'NLP服务节点内存溢出, 已自动重启', resolved: false },
  { time: '14:15:00', source: '小红书笔记', type: '数据量异常', severity: '警告', detail: '采集量较昨日同时段下降42%, 疑似反爬策略更新', resolved: true },
  { time: '13:50:22', source: '飞瓜数据', type: 'API限流', severity: '提示', detail: 'API调用频率触发限流, 已自动降速', resolved: true },
  { time: '12:30:00', source: '天猫评价', type: '字段缺失', severity: '警告', detail: '评价情感分析字段缺失率升至8.5%, 模型可能需更新', resolved: false },
]

const dailyVolumeData = [
  { date: '3/30', volume: 3850, anomalyRate: 0.25 },
  { date: '3/31', volume: 4020, anomalyRate: 0.18 },
  { date: '4/1', volume: 4150, anomalyRate: 0.22 },
  { date: '4/2', volume: 4280, anomalyRate: 0.35 },
  { date: '4/3', volume: 4180, anomalyRate: 0.28 },
  { date: '4/4', volume: 4350, anomalyRate: 0.20 },
  { date: '4/5', volume: 4280, anomalyRate: 0.30 },
]

// ── Drill-down mock data ──────────────────────────────────────────────────────

const allSourcesList = [
  { name: '抖音小店', status: 'connected' as const, lastSync: '2分钟前', volume: '85万条/日' },
  { name: '天猫旗舰店', status: 'connected' as const, lastSync: '5分钟前', volume: '120万条/日' },
  { name: '京东旗舰店', status: 'connected' as const, lastSync: '8分钟前', volume: '45万条/日' },
  { name: '快手小店', status: 'connected' as const, lastSync: '3分钟前', volume: '38万条/日' },
  { name: '巨量引擎', status: 'connected' as const, lastSync: '1分钟前', volume: '620万条/日' },
  { name: '小红书聚光', status: 'connected' as const, lastSync: '2分钟前', volume: '280万条/日' },
  { name: '快手磁力', status: 'connected' as const, lastSync: '1分钟前', volume: '185万条/日' },
  { name: '微信广告', status: 'connected' as const, lastSync: '4分钟前', volume: '95万条/日' },
  { name: '蝉妈妈', status: 'connected' as const, lastSync: '15分钟前', volume: '52万条/日' },
  { name: '飞瓜数据', status: 'connected' as const, lastSync: '22分钟前', volume: '38万条/日' },
  { name: '新榜', status: 'connected' as const, lastSync: '45分钟前', volume: '25万条/日' },
  { name: '巨量算数', status: 'connected' as const, lastSync: '8分钟前', volume: '180万条/日' },
  { name: '小红书笔记监控', status: 'connected' as const, lastSync: '12分钟前', volume: '85万条/日' },
  { name: '微博舆情', status: 'connected' as const, lastSync: '6分钟前', volume: '42万条/日' },
  { name: '百度/微信指数', status: 'connected' as const, lastSync: '28分钟前', volume: '12万条/日' },
  { name: '电商评价分析', status: 'warning' as const, lastSync: '55分钟前', volume: '35万条/日' },
  { name: '抖音达人库', status: 'connected' as const, lastSync: '18分钟前', volume: '28万条/日' },
  { name: '小红书博主', status: 'connected' as const, lastSync: '25分钟前', volume: '22万条/日' },
  { name: '快手达人', status: 'connected' as const, lastSync: '20分钟前', volume: '15万条/日' },
  { name: '历史合作数据', status: 'connected' as const, lastSync: '刚刚', volume: '3万条/日' },
  { name: '美妆成分趋势', status: 'connected' as const, lastSync: '2小时前', volume: '5万条/日' },
  { name: '品类增速监控', status: 'connected' as const, lastSync: '3小时前', volume: '8万条/日' },
  { name: '色彩趋势', status: 'connected' as const, lastSync: '1天前', volume: '2万条/周' },
  { name: '微信公众号', status: 'connected' as const, lastSync: '10分钟前', volume: '6万条/日' },
  { name: 'Meta Ads Manager', status: 'connected' as const, lastSync: '2分钟前', volume: '185万条/日' },
  { name: 'TikTok for Business', status: 'connected' as const, lastSync: '1分钟前', volume: '142万条/日' },
  { name: 'Google Ads', status: 'connected' as const, lastSync: '3分钟前', volume: '98万条/日' },
  { name: 'Amazon DSP', status: 'connected' as const, lastSync: '12分钟前', volume: '38万条/日' },
]

const sampleDataMap: Record<string, { headers: string[]; rows: string[][] }> = {
  '抖音小店': {
    headers: ['SKU名称', '日销量', '客单价', '转化率', '退货率'],
    rows: [
      ['玛丽黛佳骑士唇釉#M208', '3,842', '¥89.00', '4.2%', '2.1%'],
      ['玛丽黛佳小蘑菇气垫BB', '2,156', '¥139.00', '3.8%', '1.5%'],
      ['玛丽黛佳睫毛膏纤长版', '1,928', '¥69.00', '5.1%', '0.8%'],
      ['玛丽黛佳十色眼影盘', '1,542', '¥119.00', '3.2%', '1.9%'],
      ['玛丽黛佳卸妆水300ml', '1,205', '¥59.00', '6.8%', '0.5%'],
    ],
  },
  '巨量引擎': {
    headers: ['计划ID', 'CPM', 'CPC', 'CPA', 'ROI', 'CTR'],
    rows: [
      ['AD-28501', '¥32.50', '¥1.85', '¥28.40', '3.52', '1.76%'],
      ['AD-28502', '¥28.80', '¥1.62', '¥24.10', '4.15', '1.92%'],
      ['AD-28503', '¥45.20', '¥2.10', '¥35.60', '2.81', '2.15%'],
      ['AD-28504', '¥22.10', '¥1.45', '¥18.90', '5.28', '1.52%'],
      ['AD-28505', '¥38.60', '¥1.98', '¥31.20', '3.21', '1.95%'],
    ],
  },
  '天猫旗舰店': {
    headers: ['订单号', '商品', '金额', '流量来源', '评价分'],
    rows: [
      ['TM-20260405-001', '骑士唇釉礼盒装', '¥268.00', '搜索', '4.9'],
      ['TM-20260405-002', '小蘑菇气垫+散粉套装', '¥199.00', '直播', '4.8'],
      ['TM-20260405-003', '睫毛膏+眼线笔组合', '¥128.00', '推荐', '4.7'],
      ['TM-20260405-004', '十色眼影盘(大地色)', '¥119.00', '搜索', '4.9'],
      ['TM-20260405-005', '卸妆水+洁面套装', '¥99.00', '活动', '4.6'],
    ],
  },
  '小红书聚光': {
    headers: ['笔记ID', '种草值', '互动成本', 'CPE', '搜索排名'],
    rows: [
      ['NOTE-8821', '92.5', '¥0.85', '¥2.10', '#3'],
      ['NOTE-8822', '88.3', '¥1.02', '¥2.45', '#7'],
      ['NOTE-8823', '95.1', '¥0.72', '¥1.88', '#1'],
      ['NOTE-8824', '78.6', '¥1.35', '¥3.20', '#12'],
      ['NOTE-8825', '85.9', '¥0.95', '¥2.30', '#5'],
    ],
  },
  'Meta Ads Manager': {
    headers: ['计划ID', 'CPM', 'CTR', 'ROAS', 'CPA', '覆盖用户'],
    rows: [
      ['AD-META-001', '$12.50', '2.8%', '4.15', '$8.40', '245,800'],
      ['AD-META-002', '$9.80', '3.2%', '4.62', '$6.80', '312,500'],
      ['AD-META-003', '$15.20', '1.9%', '3.28', '$11.20', '185,200'],
      ['AD-META-004', '$8.60', '4.1%', '5.10', '$5.90', '428,600'],
      ['AD-META-005', '$11.40', '2.5%', '3.85', '$9.20', '198,400'],
    ],
  },
  'TikTok for Business': {
    headers: ['计划ID', 'CPM', 'CTR', '完播率', 'CPA', '转化数'],
    rows: [
      ['TT-BIZ-001', '$8.20', '3.8%', '68%', '$6.20', '1,840'],
      ['TT-BIZ-002', '$6.50', '5.2%', '75%', '$4.80', '2,650'],
      ['TT-BIZ-003', '$10.80', '2.9%', '62%', '$8.50', '1,120'],
      ['TT-BIZ-004', '$7.40', '4.6%', '71%', '$5.60', '2,180'],
      ['TT-BIZ-005', '$9.20', '3.2%', '66%', '$7.10', '1,520'],
    ],
  },
  'Google Ads': {
    headers: ['计划ID', 'CPM', 'CTR', 'CPC', 'ROAS', '展示量'],
    rows: [
      ['GG-001', '$5.80', '1.2%', '$0.52', '3.42', '1,240,500'],
      ['GG-002', '$8.40', '2.1%', '$0.42', '4.08', '985,200'],
      ['GG-003', '$4.20', '0.9%', '$0.68', '2.85', '1,820,400'],
      ['GG-004', '$6.90', '1.8%', '$0.38', '4.52', '1,105,800'],
      ['GG-005', '$9.20', '3.2%', '$0.29', '5.18', '652,300'],
    ],
  },
  'Amazon DSP': {
    headers: ['计划ID', 'CPM', 'CTR', 'ACOS', 'ROAS', '展示量'],
    rows: [
      ['AMZ-001', '$6.40', '0.8%', '18.2%', '5.49', '985,200'],
      ['AMZ-002', '$9.20', '1.2%', '22.5%', '4.44', '752,800'],
      ['AMZ-003', '$5.10', '1.5%', '15.8%', '6.33', '1,120,400'],
      ['AMZ-004', '$7.80', '0.9%', '24.1%', '4.15', '820,600'],
      ['AMZ-005', '$4.60', '2.1%', '12.4%', '8.06', '1,480,200'],
    ],
  },
}

const defaultSampleData = {
  headers: ['记录ID', '时间', '数据项', '值', '状态'],
  rows: [
    ['REC-001', '14:32:00', '采集数据A', '1,250', '正常'],
    ['REC-002', '14:32:15', '采集数据B', '3,480', '正常'],
    ['REC-003', '14:32:30', '采集数据C', '892', '正常'],
    ['REC-004', '14:32:45', '采集数据D', '2,105', '告警'],
    ['REC-005', '14:33:00', '采集数据E', '1,678', '正常'],
  ],
}

const syncHistoryMock = [
  { time: '14:32:18', status: '成功', records: 56800, duration: '12s' },
  { time: '14:17:05', status: '成功', records: 55200, duration: '11s' },
  { time: '14:02:01', status: '成功', records: 58100, duration: '13s' },
  { time: '13:47:00', status: '成功', records: 54800, duration: '12s' },
  { time: '13:32:02', status: '成功', records: 56300, duration: '11s' },
  { time: '13:17:01', status: '部分失败', records: 48200, duration: '15s' },
  { time: '13:02:00', status: '成功', records: 57100, duration: '12s' },
  { time: '12:47:03', status: '成功', records: 55900, duration: '11s' },
  { time: '12:32:01', status: '成功', records: 56500, duration: '12s' },
  { time: '12:17:00', status: '成功', records: 54200, duration: '13s' },
]

const jobExecutionHistory = [
  { time: '14:32:18', status: '成功', records: 56800, duration: '12s', error: '' },
  { time: '14:17:05', status: '成功', records: 55200, duration: '11s', error: '' },
  { time: '14:02:01', status: '成功', records: 58100, duration: '13s', error: '' },
  { time: '13:47:00', status: '成功', records: 54800, duration: '12s', error: '' },
  { time: '13:32:02', status: '成功', records: 56300, duration: '11s', error: '' },
  { time: '13:17:01', status: '部分失败', records: 48200, duration: '15s', error: '3个字段解析异常, 已跳过' },
  { time: '13:02:00', status: '成功', records: 57100, duration: '12s', error: '' },
  { time: '12:47:03', status: '成功', records: 55900, duration: '11s', error: '' },
  { time: '12:32:01', status: '成功', records: 56500, duration: '12s', error: '' },
  { time: '12:17:00', status: '成功', records: 54200, duration: '13s', error: '' },
]

const freshnessRanking = [
  { source: '巨量引擎', freshness: 99.8, lastSync: '1分钟前', expected: '5分钟', actual: '1分钟' },
  { source: '快手磁力', freshness: 99.7, lastSync: '1分钟前', expected: '5分钟', actual: '1分钟' },
  { source: 'TikTok for Business', freshness: 99.6, lastSync: '1分钟前', expected: '5分钟', actual: '1分钟' },
  { source: '抖音小店', freshness: 99.5, lastSync: '2分钟前', expected: '15分钟', actual: '2分钟' },
  { source: '小红书聚光', freshness: 99.4, lastSync: '2分钟前', expected: '5分钟', actual: '2分钟' },
  { source: 'Meta Ads Manager', freshness: 99.3, lastSync: '2分钟前', expected: '5分钟', actual: '2分钟' },
  { source: '快手小店', freshness: 99.2, lastSync: '3分钟前', expected: '15分钟', actual: '3分钟' },
  { source: 'Google Ads', freshness: 98.8, lastSync: '3分钟前', expected: '10分钟', actual: '3分钟' },
  { source: '微信广告', freshness: 99.0, lastSync: '4分钟前', expected: '10分钟', actual: '4分钟' },
  { source: '天猫旗舰店', freshness: 98.8, lastSync: '5分钟前', expected: '15分钟', actual: '5分钟' },
  { source: '微博舆情', freshness: 98.0, lastSync: '6分钟前', expected: '15分钟', actual: '6分钟' },
  { source: '巨量算数', freshness: 97.2, lastSync: '8分钟前', expected: '30分钟', actual: '8分钟' },
  { source: '京东旗舰店', freshness: 97.0, lastSync: '8分钟前', expected: '30分钟', actual: '8分钟' },
  { source: '小红书笔记监控', freshness: 95.5, lastSync: '12分钟前', expected: '30分钟', actual: '12分钟' },
  { source: 'Amazon DSP', freshness: 95.0, lastSync: '12分钟前', expected: '30分钟', actual: '12分钟' },
  { source: '蝉妈妈', freshness: 94.0, lastSync: '15分钟前', expected: '60分钟', actual: '15分钟' },
  { source: '新榜', freshness: 82.5, lastSync: '45分钟前', expected: '120分钟', actual: '45分钟' },
  { source: '电商评价分析', freshness: 72.0, lastSync: '55分钟前', expected: '120分钟', actual: '55分钟' },
]

// ── Drill Target Types ────────────────────────────────────────────────────────

type DrillTarget =
  | { type: 'kpi-sources' }
  | { type: 'kpi-volume' }
  | { type: 'kpi-freshness' }
  | { type: 'kpi-anomaly' }
  | { type: 'data-source'; source: DataSource; categoryName: string }
  | { type: 'crawl-job'; job: typeof crawlJobs[number] }
  | { type: 'quality-card'; card: typeof qualityCards[number] }
  | { type: 'freshness-bar'; entry: typeof freshnessData[number] }
  | { type: 'anomaly-log'; entry: typeof anomalyLog[number] }

// ── Helpers ─────────────────────────────────────────────────────────────────────

const statusDot = (status: 'connected' | 'warning' | 'error') => {
  const colorMap = { connected: '#22c55e', warning: '#f59e0b', error: '#ef4444' }
  const labelMap = { connected: '正常', warning: '告警', error: '异常' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorMap[status], display: 'inline-block' }} />
      <span style={{ color: colorMap[status], fontSize: 12 }}>{labelMap[status]}</span>
    </span>
  )
}

const jobStatusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    '运行中': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', icon: <Play size={12} /> },
    '等待中': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', icon: <Pause size={12} /> },
    '异常': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', icon: <XCircle size={12} /> },
  }
  const s = map[status] || map['等待中']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 12, background: s.bg, color: s.color, fontSize: 12, fontWeight: 500 }}>
      {s.icon} {status}
    </span>
  )
}

const severityBadge = (severity: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    '严重': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    '警告': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    '提示': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  }
  const s = map[severity] || map['提示']
  return (
    <span style={{ padding: '2px 10px', borderRadius: 12, background: s.bg, color: s.color, fontSize: 12, fontWeight: 500 }}>{severity}</span>
  )
}

// ── DrillPanel Component ──────────────────────────────────────────────────────

function DrillRow({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor || 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function DrillPanel({ title, subtitle, onClose, children, actions }: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 9998,
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 500,
        background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {children}
        </div>
        {/* Actions */}
        {actions && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 10, flexShrink: 0,
          }}>
            {actions}
          </div>
        )}
      </div>
    </>
  )
}

function DrillButton({ label, color, onClick }: { label: string; color?: string; onClick?: () => void }) {
  const c = color || '#e8365d'
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
        background: `${c}18`, color: c, fontWeight: 600, fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function ActionToast({ msg, color, onDismiss }: { msg: string; color: string; onDismiss: () => void }) {
  return (
    <div style={{
      margin: '12px 0', padding: '10px 14px', borderRadius: 8,
      background: `${color}12`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    }}>
      <span style={{ fontSize: 12, color, fontWeight: 600 }}>{msg}</span>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color, padding: 0, lineHeight: 1 }}>
        <X size={13} />
      </button>
    </div>
  )
}

function SyncProgress({ source, onDone }: { source: string; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const steps = ['连接数据源...', '验证凭证...', '拉取增量数据...', '数据清洗与校验...', '写入数据仓库...', '同步完成 ✓']

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= steps.length - 1) { clearInterval(interval); return prev }
        return prev + 1
      })
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ margin: '12px 0', padding: 14, borderRadius: 8, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>正在同步: {source}</span>
        {step >= steps.length - 1 && (
          <button onClick={onDone} style={{ fontSize: 11, color: '#22c55e', background: 'none', border: '1px solid #22c55e30', borderRadius: 5, padding: '2px 8px', cursor: 'pointer' }}>完成</button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <span style={{ color: i < step ? '#22c55e' : i === step ? '#f59e0b' : 'var(--text-muted)', fontSize: 10 }}>
              {i < step ? '✓' : i === step ? '▶' : '○'}
            </span>
            <span style={{ color: i <= step ? (i < step ? '#22c55e' : '#f59e0b') : 'var(--text-muted)' }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: 'var(--border)' }}>
        <div style={{ width: `${(step / (steps.length - 1)) * 100}%`, height: '100%', borderRadius: 2, background: '#22c55e', transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

function ApiDocPanel({ source, onClose }: { source: string; onClose: () => void }) {
  return (
    <div style={{ margin: '12px 0', padding: 14, borderRadius: 8, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={13} /> {source} · API 文档
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>
      </div>
      {[
        { method: 'GET', path: '/v2/data/sync', desc: '触发增量数据同步' },
        { method: 'POST', path: '/v2/config/update', desc: '更新数据源配置' },
        { method: 'GET', path: '/v2/quality/report', desc: '获取数据质量报告' },
        { method: 'GET', path: '/v2/quota/status', desc: '查询API配额状态' },
      ].map(api => (
        <div key={api.path} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
          <span style={{ padding: '1px 7px', borderRadius: 4, background: api.method === 'GET' ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)', color: api.method === 'GET' ? '#22c55e' : '#f59e0b', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>{api.method}</span>
          <span style={{ fontFamily: 'monospace', color: '#3b82f6', flex: 1 }}>{api.path}</span>
          <span style={{ color: 'var(--text-muted)' }}>{api.desc}</span>
        </div>
      ))}
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Base URL: https://api.bea-platform.com · Auth: Bearer Token</div>
    </div>
  )
}

function EditConfigPanel({ source, onClose, onSave }: { source: string; onClose: () => void; onSave: (msg: string) => void }) {
  const [freq, setFreq] = useState('15')
  const [timeout, setTimeout_] = useState('300')
  const [retries, setRetries] = useState('3')
  const [alertThreshold, setAlertThreshold] = useState('30')
  return (
    <div style={{ margin: '12px 0', padding: 14, borderRadius: 8, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Settings size={13} /> 编辑配置: {source}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>
      </div>
      {[
        { label: '采集频率 (分钟)', val: freq, setVal: setFreq },
        { label: '超时时间 (秒)', val: timeout, setVal: setTimeout_ },
        { label: '失败重试次数', val: retries, setVal: setRetries },
        { label: '新鲜度告警阈值 (分钟)', val: alertThreshold, setVal: setAlertThreshold },
      ].map(f => (
        <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1 }}>{f.label}</span>
          <input value={f.val} onChange={e => f.setVal(e.target.value)}
            style={{ width: 80, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11, background: 'var(--bg-primary)', color: 'var(--text-primary)', textAlign: 'right' }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button onClick={() => onSave(`✅ ${source} 配置已保存，下次采集时生效`)}
          style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: 'none', background: '#8b5cf6', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          保存配置
        </button>
        <button onClick={onClose}
          style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
          取消
        </button>
      </div>
    </div>
  )
}

function TicketPanel({ entry, onClose, onSave }: { entry: string; onClose: () => void; onSave: (msg: string) => void }) {
  const [priority, setPriority] = useState('高')
  const [desc, setDesc] = useState(`数据源 ${entry} 发生异常，需要运维介入处理`)
  return (
    <div style={{ margin: '12px 0', padding: 14, borderRadius: 8, border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
          创建运维工单
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>优先级</div>
        <select value={priority} onChange={e => setPriority(e.target.value)}
          style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          {['低', '普通', '高', '紧急'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>问题描述</div>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
          style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 11, background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onSave(`✅ 工单已创建 #OPS-${Math.floor(Math.random() * 9000 + 1000)}，已通知运维团队`)}
          style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: 'none', background: '#3b82f6', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          提交工单
        </button>
        <button onClick={onClose}
          style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
          取消
        </button>
      </div>
    </div>
  )
}

function ThresholdPanel({ label, current, onClose, onSave }: { label: string; current: string; onClose: () => void; onSave: (msg: string) => void }) {
  const [val, setVal] = useState(current)
  return (
    <div style={{ margin: '12px 0', padding: 14, borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>修改阈值: {label}</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={12} /></button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <input type="number" value={val} onChange={e => setVal(e.target.value)}
          style={{ width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', fontSize: 14, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onSave(`✅ 阈值已更新为 ${val}，立即生效`)}
          style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: 'none', background: '#f59e0b', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          保存
        </button>
        <button onClick={onClose} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>取消</button>
      </div>
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 600, color: '#e8365d', marginTop: 20, marginBottom: 10,
      paddingBottom: 6, borderBottom: '1px solid var(--border)',
    }}>
      {text}
    </div>
  )
}

function MiniTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 8, marginTop: 8 }}>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', background: 'var(--bg-card)', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '7px 10px', color: 'var(--text-primary)', whiteSpace: 'nowrap', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Drill-down Content Renderers ──────────────────────────────────────────────

function KpiSourcesDrill({ onClose }: { onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  return (
    <DrillPanel
      title="已接入数据源详情"
      subtitle="共28个数据源 - 🇨🇳 国内24个 · 🌍 国际4个 · 27个正常, 1个告警"
      onClose={onClose}
      actions={<><DrillButton label="添加数据源" onClick={() => showToast('🔗 添加数据源向导已打开，请在平台配置页完成配置', '#e8365d')} /><DrillButton label="导出报告" color="#3b82f6" onClick={() => showToast('📥 数据源总览报告生成中，预计30秒后下载', '#3b82f6')} /></>}
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {allSourcesList.map((s) => (
          <div key={s.name} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
                background: s.status === 'connected' ? '#22c55e' : s.status === 'warning' ? '#f59e0b' : '#ef4444',
              }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{s.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{s.volume}</span>
              <span>{s.lastSync}</span>
            </div>
          </div>
        ))}
      </div>
    </DrillPanel>
  )
}

function KpiVolumeDrill({ onClose }: { onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [showThreshold, setShowThreshold] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  return (
    <DrillPanel
      title="今日采集量详情"
      subtitle="4,280万条 - 按类别和时段分布"
      onClose={onClose}
      actions={<><DrillButton label="下载明细" onClick={() => showToast('📥 采集量明细报表下载中...', '#e8365d')} /><DrillButton label="设置告警" color="#f59e0b" onClick={() => setShowThreshold(v => !v)} /></>}
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showThreshold && <ThresholdPanel label="日采集量告警下限 (万条)" current="3500" onClose={() => setShowThreshold(false)} onSave={(msg) => { showToast(msg); setShowThreshold(false) }} />}
      <SectionLabel text="按类别采集量" />
      <DrillRow label="电商平台数据" value="2,880万条" valueColor="#e8365d" />
      <DrillRow label="广告平台数据" value="1,180万条" valueColor="#8b5cf6" />
      <DrillRow label="第三方情报" value="295万条" valueColor="#3b82f6" />
      <DrillRow label="社交聆听" value="174万条" valueColor="#22c55e" />
      <DrillRow label="KOL达人数据" value="68万条" valueColor="#f59e0b" />
      <DrillRow label="行业趋势" value="15万条" valueColor="#06b6d4" />

      <SectionLabel text="今日小时级采集趋势" />
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <div>00:00-06:00 低谷期: 平均 85万条/小时</div>
        <div>06:00-09:00 爬坡期: 平均 185万条/小时</div>
        <div>09:00-12:00 高峰期: 平均 325万条/小时</div>
        <div>12:00-14:00 午高峰: 平均 340万条/小时</div>
        <div style={{ color: '#e8365d', fontWeight: 500 }}>14:00 当前时段: 305万条 (电商占比41%)</div>
      </div>

      <SectionLabel text="与昨日对比" />
      <DrillRow label="昨日同时段总量" value="4,150万条" />
      <DrillRow label="环比增长" value="+3.1%" valueColor="#22c55e" />
      <DrillRow label="峰值时段" value="12:00-13:00" />
      <DrillRow label="预计今日总量" value="5,120万条" valueColor="#e8365d" />
    </DrillPanel>
  )
}

function KpiFreshnessDrill({ onClose }: { onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [showSync, setShowSync] = useState(false)
  const [showThreshold, setShowThreshold] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  return (
    <DrillPanel
      title="数据新鲜度详情"
      subtitle="整体新鲜度 98.2% - 按数据源排名"
      onClose={onClose}
      actions={<><DrillButton label="刷新全部" onClick={() => setShowSync(true)} /><DrillButton label="调整阈值" color="#f59e0b" onClick={() => setShowThreshold(v => !v)} /></>}
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showSync && <SyncProgress source="所有数据源" onDone={() => { setShowSync(false); showToast('✅ 所有24个数据源已完成同步刷新') }} />}
      {showThreshold && <ThresholdPanel label="新鲜度告警阈值 (分钟)" current="30" onClose={() => setShowThreshold(false)} onSave={(msg) => { showToast(msg); setShowThreshold(false) }} />}
      <SectionLabel text="数据源新鲜度排名" />
      {freshnessRanking.map((r) => (
        <div key={r.source} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
              background: r.freshness >= 98 ? '#22c55e' : r.freshness >= 90 ? '#f59e0b' : '#ef4444',
            }} />
            <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{r.source}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.lastSync}</span>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: r.freshness >= 98 ? '#22c55e' : r.freshness >= 90 ? '#f59e0b' : '#ef4444',
            }}>
              {r.freshness}%
            </span>
          </div>
        </div>
      ))}

      <SectionLabel text="过期告警" />
      <div style={{
        padding: 12, background: 'rgba(239,68,68,0.08)', borderRadius: 8,
        border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, color: '#ef4444',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>电商评价分析 - 新鲜度 72.0%</div>
        <div style={{ color: 'var(--text-muted)' }}>上次同步: 55分钟前 | 预期频率: 120分钟</div>
        <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>原因: NLP服务节点异常, 采集任务JOB-006暂停中</div>
      </div>
    </DrillPanel>
  )
}

function KpiAnomalyDrill({ onClose }: { onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [showSync, setShowSync] = useState(false)
  const [showTicket, setShowTicket] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  return (
    <DrillPanel
      title="异常数据源详情"
      subtitle="1个数据源异常 - 电商评价分析"
      onClose={onClose}
      actions={<><DrillButton label="手动重启" color="#ef4444" onClick={() => setShowSync(true)} /><DrillButton label="联系运维" color="#3b82f6" onClick={() => setShowTicket(v => !v)} /></>}
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showSync && <SyncProgress source="电商评价分析 (NLP服务重启)" onDone={() => { setShowSync(false); showToast('✅ NLP服务重启成功，评价分析数据采集已恢复') }} />}
      {showTicket && <TicketPanel entry="电商评价NLP" onClose={() => setShowTicket(false)} onSave={(msg) => { showToast(msg); setShowTicket(false) }} />}
      <SectionLabel text="异常源: 电商评价分析" />
      <DrillRow label="状态" value={<span style={{ color: '#ef4444' }}>异常 - NLP服务中断</span>} />
      <DrillRow label="异常开始时间" value="14:28:15" />
      <DrillRow label="持续时间" value="约7分钟" valueColor="#ef4444" />
      <DrillRow label="影响范围" value="天猫/京东/抖音 评价情感分析" />
      <DrillRow label="关联任务" value="JOB-006" valueColor="#e8365d" />

      <SectionLabel text="错误日志" />
      <div style={{
        background: '#1a1a2e', borderRadius: 8, padding: 12, fontSize: 11,
        fontFamily: 'monospace', color: '#ff7a95', lineHeight: 1.8, overflowX: 'auto',
      }}>
        <div>[14:28:15] ERROR nlp-worker-03: OutOfMemoryError</div>
        <div>[14:28:15] ERROR heap space exceeded: 8192MB / 8192MB</div>
        <div>[14:28:16] INFO  auto-restart triggered for nlp-worker-03</div>
        <div>[14:28:20] INFO  nlp-worker-03 restarting... (attempt 1/3)</div>
        <div>[14:28:45] ERROR nlp-worker-03: restart failed - port 8443 in use</div>
        <div>[14:29:00] WARN  fallback to nlp-worker-04 (degraded mode)</div>
        <div>[14:30:02] INFO  nlp-worker-04 accepting requests (reduced capacity)</div>
      </div>

      <SectionLabel text="建议解决步骤" />
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 2 }}>
        <div>1. 检查 nlp-worker-03 内存配置, 建议扩容至 16GB</div>
        <div>2. 释放 port 8443 占用进程</div>
        <div>3. 重启 nlp-worker-03 服务</div>
        <div>4. 验证评价数据采集恢复正常</div>
        <div>5. 检查积压数据是否需要回补</div>
      </div>

      <SectionLabel text="历史异常记录" />
      <MiniTable
        headers={['时间', '类型', '持续', '解决方式']}
        rows={[
          ['4/3 09:12', '内存溢出', '15分钟', '自动重启'],
          ['4/1 16:45', 'API超时', '5分钟', '自动恢复'],
          ['3/28 11:20', '模型加载失败', '30分钟', '手动干预'],
        ]}
      />
    </DrillPanel>
  )
}

function DataSourceDrill({ source, categoryName, onClose }: { source: DataSource; categoryName: string; onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [showSync, setShowSync] = useState(false)
  const [showApiDoc, setShowApiDoc] = useState(false)
  const [showEditConfig, setShowEditConfig] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  const sample = sampleDataMap[source.source] || defaultSampleData
  const fieldList = source.fields.split(/[、/,，]/).map(f => f.trim()).filter(Boolean)
  return (
    <DrillPanel
      title={source.source}
      subtitle={`${categoryName} | ${source.api}`}
      onClose={onClose}
      actions={<><DrillButton label="强制同步" onClick={() => { setShowApiDoc(false); setShowEditConfig(false); setShowSync(true) }} /><DrillButton label="查看API文档" color="#3b82f6" onClick={() => { setShowSync(false); setShowEditConfig(false); setShowApiDoc(v => !v) }} /><DrillButton label="编辑配置" color="#8b5cf6" onClick={() => { setShowSync(false); setShowApiDoc(false); setShowEditConfig(v => !v) }} /></>}
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showSync && <SyncProgress source={source.source} onDone={() => { setShowSync(false); showToast(`✅ ${source.source} 同步完成，共拉取 ${source.volume} 数据`) }} />}
      {showApiDoc && <ApiDocPanel source={source.source} onClose={() => setShowApiDoc(false)} />}
      {showEditConfig && <EditConfigPanel source={source.source} onClose={() => setShowEditConfig(false)} onSave={(msg) => { showToast(msg); setShowEditConfig(false) }} />}
      <SectionLabel text="基本信息" />
      <DrillRow label="采集方式" value={source.api} />
      <DrillRow label="采集频率" value={source.freq} />
      <DrillRow label="日采集量" value={source.volume} />
      <DrillRow label="最近同步" value={source.lastSync} />
      <DrillRow label="状态" value={statusDot(source.status)} />
      <DrillRow label="质量分" value={`${source.quality}/100`} valueColor={source.quality >= 95 ? '#22c55e' : '#f59e0b'} />

      <SectionLabel text={`采集字段 (${fieldList.length}个)`} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {fieldList.map((f) => (
          <span key={f} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 12,
            background: '#e8365d12', color: '#e8365d', border: '1px solid #e8365d30',
          }}>
            {f}
          </span>
        ))}
      </div>

      <SectionLabel text="样本数据预览 (最近5条)" />
      <MiniTable headers={sample.headers} rows={sample.rows} />

      <SectionLabel text="同步历史 (最近10次)" />
      <MiniTable
        headers={['时间', '状态', '条数', '耗时']}
        rows={syncHistoryMock.map(h => [
          h.time,
          h.status,
          h.records.toLocaleString(),
          h.duration,
        ])}
      />

      <SectionLabel text="数据质量趋势 (近7日)" />
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60, marginTop: 8 }}>
        {[96, 97, 98, 97, 99, 98, source.quality].map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v}</span>
            <div style={{
              width: '100%', height: `${(v - 85) * 4}px`, borderRadius: 3,
              background: v >= 95 ? '#22c55e' : v >= 90 ? '#f59e0b' : '#ef4444',
              opacity: 0.7,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>3/30</span><span>3/31</span><span>4/1</span><span>4/2</span><span>4/3</span><span>4/4</span><span>今日</span>
      </div>

      <SectionLabel text="字段覆盖率" />
      <DrillRow label="必填字段覆盖" value="100%" valueColor="#22c55e" />
      <DrillRow label="可选字段覆盖" value={`${Math.round(source.quality * 0.98)}%`} valueColor="#3b82f6" />
      <DrillRow label="空值字段" value={source.quality >= 95 ? '0个' : '2个'} valueColor={source.quality >= 95 ? '#22c55e' : '#f59e0b'} />

      <SectionLabel text="API配额使用" />
      <DrillRow label="日请求量" value="12,850 / 50,000" />
      <DrillRow label="配额使用率" value="25.7%" valueColor="#22c55e" />
      <DrillRow label="速率限制" value="100次/分钟" />
      <DrillRow label="今日剩余配额" value="37,150次" />
      <div style={{
        marginTop: 8, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden',
      }}>
        <div style={{ width: '25.7%', height: '100%', borderRadius: 3, background: '#22c55e' }} />
      </div>
    </DrillPanel>
  )
}

function CrawlJobDrill({ job, onClose }: { job: typeof crawlJobs[number]; onClose: () => void }) {
  const isError = job.status === '异常'
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [showSync, setShowSync] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showEditConfig, setShowEditConfig] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  return (
    <DrillPanel
      title={`任务 ${job.id}`}
      subtitle={`${job.source} - ${job.type}`}
      onClose={onClose}
      actions={
        <>
          <DrillButton label="重新运行" color={isError ? '#ef4444' : '#22c55e'} onClick={() => { setShowEditConfig(false); setShowSync(true) }} />
          <DrillButton label={paused ? '恢复任务' : '暂停任务'} color="#f59e0b" onClick={() => { setPaused(v => !v); showToast(paused ? `▶️ ${job.id} 任务已恢复运行` : `⏸ ${job.id} 任务已暂停，队列已挂起`, '#f59e0b') }} />
          <DrillButton label="修改配置" color="#3b82f6" onClick={() => setShowEditConfig(v => !v)} />
        </>
      }
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showSync && <SyncProgress source={`${job.id} (${job.source})`} onDone={() => { setShowSync(false); showToast(`✅ ${job.id} 重新运行成功`) }} />}
      {showEditConfig && <EditConfigPanel source={job.source} onClose={() => setShowEditConfig(false)} onSave={(msg) => { showToast(msg); setShowEditConfig(false) }} />}
      <SectionLabel text="任务配置" />
      <DrillRow label="任务ID" value={job.id} valueColor="#e8365d" />
      <DrillRow label="数据源" value={job.source} />
      <DrillRow label="采集类型" value={job.type} />
      <DrillRow label="调度周期" value={job.schedule} />
      <DrillRow label="上次运行" value={job.lastRun} />
      <DrillRow label="下次运行" value={job.nextRun} />
      <DrillRow label="当前状态" value={jobStatusBadge(job.status)} />
      <DrillRow label="超时设置" value="300秒" />
      <DrillRow label="重试策略" value="最多3次, 间隔30秒" />

      <SectionLabel text="执行历史 (最近10次)" />
      <MiniTable
        headers={['时间', '状态', '条数', '耗时', '错误']}
        rows={(isError
          ? [
              { time: '13:00:00', status: '失败', records: 0, duration: '-', error: 'OOM' },
              { time: '11:00:00', status: '成功', records: 34200, duration: '95s', error: '' },
              ...jobExecutionHistory.slice(2),
            ]
          : jobExecutionHistory
        ).map(h => [
          h.time,
          h.status,
          h.records.toLocaleString(),
          h.duration,
          h.error || '-',
        ])}
      />

      {isError && (
        <>
          <SectionLabel text="错误详情" />
          <div style={{
            background: '#1a1a2e', borderRadius: 8, padding: 12, fontSize: 11,
            fontFamily: 'monospace', color: '#ff7a95', lineHeight: 1.8, overflowX: 'auto',
          }}>
            <div>[13:00:00] START  job={job.id} source={job.source}</div>
            <div>[13:00:01] INFO   connecting to NLP service cluster...</div>
            <div>[13:00:05] ERROR  connection refused: nlp-worker-03:8443</div>
            <div>[13:00:06] RETRY  attempt 1/3, waiting 30s...</div>
            <div>[13:00:36] ERROR  connection refused: nlp-worker-03:8443</div>
            <div>[13:00:37] RETRY  attempt 2/3, waiting 30s...</div>
            <div>[13:01:07] ERROR  connection refused: nlp-worker-03:8443</div>
            <div>[13:01:08] FAIL   max retries exceeded, job aborted</div>
          </div>
        </>
      )}

      <SectionLabel text="数据量趋势 (近7日每次执行)" />
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60, marginTop: 8 }}>
        {[48200, 52100, 55800, 54200, 56800, 0, 56800].map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{v > 0 ? `${(v / 1000).toFixed(0)}k` : '-'}</span>
            <div style={{
              width: '100%', height: v > 0 ? `${Math.max((v / 60000) * 50, 4)}px` : 4, borderRadius: 3,
              background: v > 0 ? '#e8365d' : '#ef4444',
              opacity: v > 0 ? 0.7 : 0.3,
            }} />
          </div>
        ))}
      </div>

      <SectionLabel text="性能指标" />
      <DrillRow label="平均耗时" value={job.duration} />
      <DrillRow label="平均记录数" value={job.records > 0 ? job.records.toLocaleString() : '-'} />
      <DrillRow label="错误率" value={`${(job.errorRate * 100).toFixed(1)}%`} valueColor={job.errorRate > 0.5 ? '#ef4444' : job.errorRate > 0.1 ? '#f59e0b' : '#22c55e'} />
      <DrillRow label="成功率(7日)" value={isError ? '85.7%' : '98.5%'} valueColor={isError ? '#f59e0b' : '#22c55e'} />
      <DrillRow label="平均吞吐量" value={job.records > 0 ? `${Math.round(job.records / parseInt(job.duration)).toLocaleString()} 条/秒` : '-'} />
    </DrillPanel>
  )
}

function QualityCardDrill({ card, onClose }: { card: typeof qualityCards[number]; onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [showThreshold, setShowThreshold] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  const breakdownMap: Record<string, { sources: { name: string; value: string; color: string }[]; trend: string[]; threshold: string }> = {
    '数据完整度': {
      sources: [
        { name: '巨量引擎', value: '99.8%', color: '#22c55e' },
        { name: '天猫旗舰店', value: '99.5%', color: '#22c55e' },
        { name: '抖音小店', value: '99.2%', color: '#22c55e' },
        { name: '小红书聚光', value: '98.8%', color: '#22c55e' },
        { name: '快手小店', value: '98.5%', color: '#22c55e' },
        { name: '蝉妈妈', value: '96.2%', color: '#f59e0b' },
        { name: '电商评价分析', value: '91.5%', color: '#f59e0b' },
      ],
      trend: ['97.8%', '98.0%', '98.2%', '98.1%', '98.4%', '98.3%', '98.5%'],
      threshold: '目标 >= 95%, 当前 98.5% (达标)',
    },
    '字段覆盖率': {
      sources: [
        { name: '历史合作数据', value: '99.9%', color: '#22c55e' },
        { name: '巨量引擎', value: '99.2%', color: '#22c55e' },
        { name: '抖音小店', value: '98.5%', color: '#22c55e' },
        { name: '天猫旗舰店', value: '97.8%', color: '#22c55e' },
        { name: '小红书笔记监控', value: '93.2%', color: '#f59e0b' },
        { name: '电商评价分析', value: '88.5%', color: '#f59e0b' },
      ],
      trend: ['95.5%', '95.8%', '96.0%', '95.9%', '96.1%', '96.0%', '96.2%'],
      threshold: '目标 >= 90%, 当前 96.2% (达标)',
    },
    '异常率': {
      sources: [
        { name: '电商评价NLP', value: '2.8%', color: '#ef4444' },
        { name: '小红书笔记', value: '0.5%', color: '#f59e0b' },
        { name: '蝉妈妈', value: '0.3%', color: '#f59e0b' },
        { name: '微博舆情', value: '0.1%', color: '#22c55e' },
        { name: '其他数据源', value: '0.0%', color: '#22c55e' },
      ],
      trend: ['0.25%', '0.18%', '0.22%', '0.35%', '0.28%', '0.20%', '0.30%'],
      threshold: '告警阈值 >= 1.0%, 当前 0.3% (正常)',
    },
    '延迟告警': {
      sources: [
        { name: '电商评价分析', value: '55分钟', color: '#ef4444' },
        { name: '新榜', value: '45分钟', color: '#f59e0b' },
        { name: '百度/微信指数', value: '28分钟', color: '#f59e0b' },
      ],
      trend: ['0个', '0个', '1个', '2个', '1个', '0个', '1个'],
      threshold: '超过预期频率2倍即触发告警',
    },
  }

  const info = breakdownMap[card.label] || breakdownMap['数据完整度']

  return (
    <DrillPanel
      title={card.label}
      subtitle={`当前值: ${card.value}`}
      onClose={onClose}
      actions={<><DrillButton label="导出详情" onClick={() => showToast('📥 质量详情报告导出中...')} /><DrillButton label="修改阈值" color="#f59e0b" onClick={() => setShowThreshold(v => !v)} /></>}
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showThreshold && <ThresholdPanel label={`${card.label}告警阈值`} current="95" onClose={() => setShowThreshold(false)} onSave={(msg) => { showToast(msg); setShowThreshold(false) }} />}
      <SectionLabel text="近7日趋势" />
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 50, marginTop: 8 }}>
        {info.trend.map((v, i) => {
          const numVal = parseFloat(v)
          const barH = card.label === '延迟告警' ? (parseInt(v) * 25 + 5) : Math.max((numVal - 85) * 3.5, 8)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v}</span>
              <div style={{
                width: '100%', height: barH, borderRadius: 3,
                background: card.color, opacity: i === info.trend.length - 1 ? 1 : 0.5,
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
        <span>3/30</span><span>3/31</span><span>4/1</span><span>4/2</span><span>4/3</span><span>4/4</span><span>今日</span>
      </div>

      <SectionLabel text="按数据源分布" />
      {info.sources.map((s) => (
        <div key={s.name} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 0', borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{s.name}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.value}</span>
        </div>
      ))}

      <SectionLabel text="阈值设置" />
      <div style={{
        padding: 12, background: 'var(--bg-card)', borderRadius: 8,
        border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)',
      }}>
        {info.threshold}
      </div>
    </DrillPanel>
  )
}

function FreshnessBarDrill({ entry, onClose }: { entry: typeof freshnessData[number]; onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [showSync, setShowSync] = useState(false)
  const [showThreshold, setShowThreshold] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  const matchedSource = allSourcesList.find(s => s.name === entry.source)
  const matchedRanking = freshnessRanking.find(r => r.source === entry.source)
  return (
    <DrillPanel
      title={entry.source}
      subtitle={`数据新鲜度 - 最近同步 ${entry.minutes} 分钟前`}
      onClose={onClose}
      actions={<><DrillButton label="立即同步" onClick={() => setShowSync(true)} /><DrillButton label="调整频率" color="#3b82f6" onClick={() => setShowThreshold(v => !v)} /></>}
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showSync && <SyncProgress source={entry.source} onDone={() => { setShowSync(false); showToast(`✅ ${entry.source} 同步完成，新鲜度已恢复至 100%`) }} />}
      {showThreshold && <ThresholdPanel label="采集频率 (分钟)" current={String(entry.minutes)} onClose={() => setShowThreshold(false)} onSave={(msg) => { showToast(msg); setShowThreshold(false) }} />}
      <SectionLabel text="同步状态" />
      <DrillRow label="当前延迟" value={`${entry.minutes} 分钟`} valueColor={entry.color} />
      <DrillRow label="预期频率" value={matchedRanking?.expected || '-'} />
      <DrillRow label="实际延迟" value={matchedRanking?.actual || `${entry.minutes}分钟`} />
      <DrillRow label="新鲜度评分" value={matchedRanking ? `${matchedRanking.freshness}%` : '-'} valueColor={entry.color} />
      <DrillRow label="日采集量" value={matchedSource?.volume || '-'} />
      <DrillRow label="状态" value={statusDot(matchedSource?.status || 'connected')} />

      <SectionLabel text="同步历史 (最近10次)" />
      <MiniTable
        headers={['时间', '状态', '延迟', '条数']}
        rows={[
          ['14:32', '成功', `${entry.minutes}min`, '56,800'],
          ['14:17', '成功', `${Math.max(entry.minutes - 1, 1)}min`, '55,200'],
          ['14:02', '成功', `${entry.minutes}min`, '58,100'],
          ['13:47', '成功', `${Math.max(entry.minutes - 1, 1)}min`, '54,800'],
          ['13:32', '成功', `${entry.minutes + 1}min`, '56,300'],
          ['13:17', '部分失败', `${entry.minutes + 3}min`, '48,200'],
          ['13:02', '成功', `${entry.minutes}min`, '57,100'],
          ['12:47', '成功', `${Math.max(entry.minutes - 1, 1)}min`, '55,900'],
          ['12:32', '成功', `${entry.minutes}min`, '56,500'],
          ['12:17', '成功', `${entry.minutes + 1}min`, '54,200'],
        ]}
      />

      <SectionLabel text="预期 vs 实际新鲜度" />
      <div style={{
        padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>预期</span>
          <span style={{ fontSize: 12, color: '#3b82f6' }}>{matchedRanking?.expected || '-'}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 3, background: '#3b82f6', opacity: 0.4 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>实际</span>
          <span style={{ fontSize: 12, color: entry.color }}>{entry.minutes}分钟</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min((entry.minutes / 60) * 100, 100)}%`,
            height: '100%', borderRadius: 3, background: entry.color,
          }} />
        </div>
      </div>
    </DrillPanel>
  )
}

function AnomalyLogDrill({ entry, onClose }: { entry: typeof anomalyLog[number]; onClose: () => void }) {
  const [toast, setToast] = useState<{msg: string; color: string}|null>(null)
  const [resolved, setResolved] = useState(entry.resolved)
  const [showTicket, setShowTicket] = useState(false)
  const [expandLog, setExpandLog] = useState(false)
  const showToast = (msg: string, color = '#22c55e') => { setToast({msg, color}); setTimeout(() => setToast(null), 3500) }
  return (
    <DrillPanel
      title={`异常事件: ${entry.type}`}
      subtitle={`${entry.source} | ${entry.time}`}
      onClose={onClose}
      actions={
        <>
          {!resolved && <DrillButton label="标记已解决" color="#22c55e" onClick={() => { setResolved(true); showToast('✅ 已标记为已解决，数据质量告警已消除') }} />}
          <DrillButton label="创建工单" color="#3b82f6" onClick={() => setShowTicket(v => !v)} />
          <DrillButton label={expandLog ? '收起日志' : '查看更多日志'} color="#8b5cf6" onClick={() => setExpandLog(v => !v)} />
        </>
      }
    >
      {toast && <ActionToast msg={toast.msg} color={toast.color} onDismiss={() => setToast(null)} />}
      {showTicket && <TicketPanel entry={entry.source} onClose={() => setShowTicket(false)} onSave={(msg) => { showToast(msg); setShowTicket(false) }} />}
      {resolved && !entry.resolved && (
        <div style={{ margin: '0 0 12px', padding: '8px 12px', borderRadius: 7, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
          ✅ 已标记为已解决 · 解决时间: 刚刚
        </div>
      )}
      <SectionLabel text="事件概要" />
      <DrillRow label="数据源" value={entry.source} />
      <DrillRow label="异常类型" value={entry.type} />
      <DrillRow label="严重程度" value={severityBadge(entry.severity)} />
      <DrillRow label="发生时间" value={entry.time} />
      <DrillRow label="状态" value={
        entry.resolved
          ? <span style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> 已解决</span>
          : <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={14} /> 待处理</span>
      } />
      <DrillRow label="详情" value={entry.detail} />

      <SectionLabel text="完整错误追踪" />
      <div style={{
        background: '#1a1a2e', borderRadius: 8, padding: 12, fontSize: 11,
        fontFamily: 'monospace', color: '#ff7a95', lineHeight: 1.8, overflowX: 'auto',
      }}>
        {entry.source === '电商评价NLP' && (
          <>
            <div>[{entry.time}] ERROR nlp-service: OutOfMemoryError in worker-03</div>
            <div>[{entry.time}] ERROR java.lang.OutOfMemoryError: Java heap space</div>
            <div>  at com.bea.nlp.SentimentAnalyzer.analyze(SentimentAnalyzer.java:128)</div>
            <div>  at com.bea.pipeline.ReviewPipeline.process(ReviewPipeline.java:56)</div>
            <div>[{entry.time}] INFO  auto-restart initiated for worker-03</div>
            <div>[{entry.time}] WARN  pending queue size: 12,500 reviews</div>
          </>
        )}
        {entry.source === '小红书笔记' && (
          <>
            <div>[{entry.time}] WARN  crawler: response_rate dropped to 58%</div>
            <div>[{entry.time}] WARN  expected ~85,000 records, got ~49,300</div>
            <div>[{entry.time}] INFO  anti-crawl detection: new captcha pattern identified</div>
            <div>[{entry.time}] INFO  switching to backup proxy pool (pool-3)</div>
            <div>[{entry.time}] INFO  rate limit reduced: 100/min -&gt; 60/min</div>
            <div>[{entry.time}] INFO  recovery successful, rate normalized</div>
          </>
        )}
        {entry.source === '飞瓜数据' && (
          <>
            <div>[{entry.time}] WARN  api: HTTP 429 Too Many Requests</div>
            <div>[{entry.time}] INFO  rate limiter: reducing from 120/min to 60/min</div>
            <div>[{entry.time}] INFO  backoff: waiting 30s before retry</div>
            <div>[{entry.time}] INFO  resumed at reduced rate, data flow restored</div>
          </>
        )}
        {entry.source === '天猫评价' && (
          <>
            <div>[{entry.time}] WARN  field_validator: sentiment_score null rate = 8.5%</div>
            <div>[{entry.time}] WARN  threshold exceeded (max 5.0%)</div>
            <div>[{entry.time}] INFO  model version: sentiment-v3.2.1 (last updated: 3/20)</div>
            <div>[{entry.time}] SUGGEST model retrain recommended with recent data</div>
          </>
        )}
      </div>

      <SectionLabel text="影响数据范围" />
      <DrillRow label="受影响记录数" value={
        entry.source === '电商评价NLP' ? '~12,500条待处理' :
        entry.source === '小红书笔记' ? '~35,700条 (42%降幅)' :
        entry.source === '飞瓜数据' ? '~8,200条延迟' : '~4,500条缺失字段'
      } />
      <DrillRow label="影响时间段" value={`${entry.time} - ${entry.resolved ? '已恢复' : '持续中'}`} />
      <DrillRow label="数据可回补" value={entry.resolved ? '已回补' : '等待恢复后回补'} />

      <SectionLabel text="建议解决步骤" />
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 2 }}>
        {entry.source === '电商评价NLP' && (
          <>
            <div>1. 检查NLP Worker-03内存使用, 扩容heap至16GB</div>
            <div>2. 重启服务并验证端口可用</div>
            <div>3. 处理积压的12,500条评价数据</div>
            <div>4. 设置内存使用率告警(阈值80%)</div>
          </>
        )}
        {entry.source === '小红书笔记' && (
          <>
            <div>1. 已自动切换至备用代理池</div>
            <div>2. 更新反爬虫策略(新验证码模式)</div>
            <div>3. 降频至60次/分钟避免触发限制</div>
            <div>4. 监控24小时确认恢复稳定</div>
          </>
        )}
        {entry.source === '飞瓜数据' && (
          <>
            <div>1. 已自动降速至60次/分钟</div>
            <div>2. 联系飞瓜数据确认API配额</div>
            <div>3. 考虑升级API套餐(当前: 基础版)</div>
          </>
        )}
        {entry.source === '天猫评价' && (
          <>
            <div>1. 检查NLP情感分析模型版本</div>
            <div>2. 收集最近2周数据重新训练模型</div>
            <div>3. 更新字段映射规则</div>
            <div>4. 回补缺失的情感分析字段</div>
          </>
        )}
      </div>

      <SectionLabel text="关联事件" />
      <MiniTable
        headers={['时间', '源', '类型', '状态']}
        rows={
          entry.source === '电商评价NLP' ? [
            ['4/3 09:12', '电商评价NLP', '内存溢出', '已解决'],
            ['4/1 16:45', '电商评价NLP', 'API超时', '已解决'],
          ] : entry.source === '小红书笔记' ? [
            ['4/2 10:30', '小红书笔记', '反爬触发', '已解决'],
            ['3/30 08:15', '小红书笔记', '数据量异常', '已解决'],
          ] : [
            ['4/1 14:20', entry.source, '类似异常', '已解决'],
          ]
        }
      />
    </DrillPanel>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function DataHub() {
  const [tab, setTab] = useState(0)
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true })
  const [regionFilter, setRegionFilter] = useState<'全部' | '国内' | '国际'>('全部')
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null)

  useRegisterAIConfig(dataHubAIGroups, dataHubLearningStatus, '数据采集中心')

  const toggleCategory = (idx: number) => {
    setExpandedCategories(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const closeDrill = () => setDrillTarget(null)

  // ── Drill-down Panel Router ─────────────────────────────────────────────────
  const renderDrillPanel = () => {
    if (!drillTarget) return null
    switch (drillTarget.type) {
      case 'kpi-sources': return <KpiSourcesDrill onClose={closeDrill} />
      case 'kpi-volume': return <KpiVolumeDrill onClose={closeDrill} />
      case 'kpi-freshness': return <KpiFreshnessDrill onClose={closeDrill} />
      case 'kpi-anomaly': return <KpiAnomalyDrill onClose={closeDrill} />
      case 'data-source': return <DataSourceDrill source={drillTarget.source} categoryName={drillTarget.categoryName} onClose={closeDrill} />
      case 'crawl-job': return <CrawlJobDrill job={drillTarget.job} onClose={closeDrill} />
      case 'quality-card': return <QualityCardDrill card={drillTarget.card} onClose={closeDrill} />
      case 'freshness-bar': return <FreshnessBarDrill entry={drillTarget.entry} onClose={closeDrill} />
      case 'anomaly-log': return <AnomalyLogDrill entry={drillTarget.entry} onClose={closeDrill} />
      default: return null
    }
  }

  const kpiClickHandlers: (() => void)[] = [
    () => setDrillTarget({ type: 'kpi-sources' }),
    () => setDrillTarget({ type: 'kpi-volume' }),
    () => setDrillTarget({ type: 'kpi-freshness' }),
    () => setDrillTarget({ type: 'kpi-anomaly' }),
  ]

  // ── Tab 1: 数据源总览 ──────────────────────────────────────────────────────
  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {kpiCards.map((kpi, kpiIdx) => (
          <div
            key={kpi.label}
            className="card"
            onClick={kpiClickHandlers[kpiIdx]}
            style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <kpi.icon size={24} style={{ color: kpi.color }} />
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{kpi.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Region Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>数据源区域：</span>
        {(['全部', '国内', '国际'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRegionFilter(r)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              border: regionFilter === r ? '1px solid #0ea5e9' : '1px solid var(--border)',
              background: regionFilter === r ? 'rgba(14,165,233,0.12)' : 'var(--bg-card)',
              color: regionFilter === r ? '#0ea5e9' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >
            {r === '全部' ? '全部' : r === '国内' ? '🇨🇳 国内' : '🌍 国际'}
          </button>
        ))}
        {regionFilter !== '全部' && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
            {regionFilter === '国内'
              ? `显示 ${dataCategories.filter(c => c.region !== '国际').length} 个国内类别`
              : `显示 ${dataCategories.filter(c => c.region === '国际').length} 个国际类别`}
          </span>
        )}
      </div>

      {/* Data Source Categories */}
      {dataCategories.map((cat, idx) => {
        const visible = regionFilter === '全部' ||
          (regionFilter === '国际' ? cat.region === '国际' : cat.region !== '国际')
        if (!visible) return null
        return (
        <div key={cat.name} className="card" style={{ overflow: 'hidden', borderLeft: cat.region === '国际' ? '3px solid #0ea5e9' : undefined }}>
          {/* Category Header */}
          <div
            onClick={() => toggleCategory(idx)}
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              borderBottom: expandedCategories[idx] ? '1px solid var(--border)' : 'none',
              userSelect: 'none',
            }}
          >
            {expandedCategories[idx] ? <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
            <span style={{ color: '#e8365d', display: 'flex', alignItems: 'center' }}>{cat.icon}</span>
            <span className="section-title" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{cat.name}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>
              {cat.sources.length} 个数据源
            </span>
          </div>

          {/* Table */}
          {expandedCategories[idx] && (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>数据源</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>API/采集方式</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>频率</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>日采集量</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>最近同步</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>状态</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>质量分</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.sources.map((s) => (
                    <tr
                      key={s.source}
                      onClick={() => setDrillTarget({ type: 'data-source', source: s, categoryName: cat.name })}
                      style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
                    >
                      <td style={{ padding: '10px 16px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{s.source}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{s.api}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{s.freq}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-primary)' }}>{s.volume}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{s.lastSync}</td>
                      <td style={{ padding: '10px 16px' }}>{statusDot(s.status)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          color: s.quality >= 95 ? '#22c55e' : s.quality >= 90 ? '#f59e0b' : '#ef4444',
                          fontWeight: 600,
                        }}>
                          {s.quality}
                          <span style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', display: 'inline-block' }}>
                            <span style={{ width: `${s.quality}%`, height: '100%', display: 'block', borderRadius: 2, background: s.quality >= 95 ? '#22c55e' : s.quality >= 90 ? '#f59e0b' : '#ef4444' }} />
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )
      })}
    </div>
  )

  // ── Tab 2: 采集任务管理 ────────────────────────────────────────────────────
  const renderJobs = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Jobs Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="section-title" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>采集任务列表</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: 12 }}>运行中 {crawlJobs.filter(j => j.status === '运行中').length}</span>
            <span style={{ fontSize: 12, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '4px 10px', borderRadius: 12 }}>等待中 {crawlJobs.filter(j => j.status === '等待中').length}</span>
            <span style={{ fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: 12 }}>异常 {crawlJobs.filter(j => j.status === '异常').length}</span>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                {['任务ID', '数据源', '类型', '调度周期', '上次运行', '下次运行', '状态', '采集条数', '耗时', '错误率'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {crawlJobs.map((job) => (
                <tr
                  key={job.id}
                  onClick={() => setDrillTarget({ type: 'crawl-job', job })}
                  style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#e8365d' }}>{job.id}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-primary)' }}>{job.source}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{job.type}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{job.schedule}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{job.lastRun}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{job.nextRun}</td>
                  <td style={{ padding: '10px 14px' }}>{jobStatusBadge(job.status)}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>{job.records > 0 ? job.records.toLocaleString() : '-'}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{job.duration}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      color: job.errorRate > 0.5 ? '#ef4444' : job.errorRate > 0.1 ? '#f59e0b' : '#22c55e',
                      fontWeight: 500,
                    }}>
                      {(job.errorRate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {job.status === '异常' ? (
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12 }}
                        >
                          <RotateCw size={12} /> 重启
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: 12 }}
                        >
                          <RotateCw size={12} /> 刷新
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 24-hour Volume Trend */}
      <div className="card" style={{ padding: 20 }}>
        <div className="section-title" style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>24小时数据采集量趋势 (万条)</div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={hourlyVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="hour" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="电商" stackId="1" stroke="#e8365d" fill="#e8365d" fillOpacity={0.6} />
            <Area type="monotone" dataKey="广告" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="情报" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="社交" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
            <Area type="monotone" dataKey="达人" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            <Area type="monotone" dataKey="趋势" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // ── Tab 3: 数据质量监控 ────────────────────────────────────────────────────
  const renderQuality = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Quality KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {qualityCards.map((q) => (
          <div
            key={q.label}
            className="card"
            onClick={() => setDrillTarget({ type: 'quality-card', card: q })}
            style={{ padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{q.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: q.color }}>{q.value}</div>
          </div>
        ))}
      </div>

      {/* Data Freshness Bar Chart */}
      <div className="card" style={{ padding: 20 }}>
        <div className="section-title" style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>数据新鲜度 (分钟数 - 距上次同步)</div>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={freshnessData} layout="vertical" margin={{ left: 110 }}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload.length > 0) {
                const clickedSource = data.activeLabel
                const entry = freshnessData.find(f => f.source === clickedSource)
                if (entry) setDrillTarget({ type: 'freshness-bar', entry })
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[0, 60]} />
            <YAxis dataKey="source" type="category" tick={{ fill: 'var(--text-primary)', fontSize: 11, cursor: 'pointer' } as object} width={100} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`${value} 分钟`, '延迟']} cursor={{ fill: 'rgba(232,54,93,0.08)' }} />
            <Bar dataKey="minutes" radius={[0, 4, 4, 0]} barSize={14} style={{ cursor: 'pointer' }}>
              {freshnessData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} cursor="pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#22c55e', display: 'inline-block' }} /> &lt;5分钟 (优秀)
          </span>
          <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b', display: 'inline-block' }} /> 5-30分钟 (正常)
          </span>
          <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444', display: 'inline-block' }} /> &gt;30分钟 (需关注)
          </span>
        </div>
      </div>

      {/* Anomaly Log */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <span className="section-title" style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>异常事件日志</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                {['时间', '数据源', '异常类型', '严重程度', '详情', '状态'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {anomalyLog.map((a, idx) => (
                <tr
                  key={idx}
                  onClick={() => setDrillTarget({ type: 'anomaly-log', entry: a })}
                  style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
                >
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{a.time}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-primary)' }}>{a.source}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{a.type}</td>
                  <td style={{ padding: '10px 14px' }}>{severityBadge(a.severity)}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.detail}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {a.resolved ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 12 }}><CheckCircle size={14} /> 已解决</span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12 }}><XCircle size={14} /> 待处理</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Volume + Anomaly Rate Trend */}
      <div className="card" style={{ padding: 20 }}>
        <div className="section-title" style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>近7日数据采集量与异常率</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={dailyVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} label={{ value: '万条', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-muted)', fontSize: 11 } }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} label={{ value: '异常率', angle: 90, position: 'insideRight', style: { fill: 'var(--text-muted)', fontSize: 11 } }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="left" dataKey="volume" name="日采集量(万条)" fill="#e8365d" fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={36} />
            <Line yAxisId="right" type="monotone" dataKey="anomalyRate" name="异常率(%)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>数据采集中心</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          玛丽黛佳全渠道数据采集与质量监控 - 24个数据源实时同步
        </p>
      </div>

      {/* Model Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="AnomalyDetector-LSTM" color="#e8365d" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)' }}>
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: tab === i ? 600 : 400,
              color: tab === i ? '#e8365d' : 'var(--text-muted)',
              background: 'transparent',
              border: 'none',
              borderBottom: tab === i ? '2px solid #e8365d' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 0 && renderOverview()}
      {tab === 1 && renderJobs()}
      {tab === 2 && renderQuality()}

      {/* Drill-down Panel */}
      {renderDrillPanel()}
    </div>
  )
}
