import { useState } from 'react'
import {
  Database, HardDrive, Clock, Table2, Settings2, Layers, ArrowRight,
  CheckCircle, AlertTriangle, XCircle, Play, RotateCw, ChevronDown,
  ChevronRight, ShoppingBag, Megaphone, Eye, Users, Star, BarChart3,
  Shield, FileText, Zap, RefreshCw, GitBranch, Activity, X, Pause,
  TrendingUp, AlertCircle, Search, Download
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ── Colors ────────────────────────────────────────────────────────────────────
const COLORS = ['#e8365d', '#ff7a95', '#ffb4c6', '#8b5cf6', '#22c55e', '#f59e0b']

// ── AI Config ─────────────────────────────────────────────────────────────────
const warehouseAIGroups: AIConfigGroup[] = [
  {
    title: '数据治理策略',
    icon: <Shield size={15} />,
    params: [
      createParam('etl_retry_count', 'ETL重试次数', 3, '次', 'ETL任务失败后自动重试次数', 5, 88, { min: 1, max: 10, step: 1, learningDataPoints: 52000, adjustHistory: [
        { time: '昨日', from: '2', to: '3', reason: '近期网络波动增加, AI提升重试次数保障数据完整' },
        { time: '3天前', from: '5', to: '2', reason: '网络稳定期, AI降低重试减少资源占用' },
      ] }),
      createParam('data_retention', '数据保留周期', 90, '天', '历史数据保留时长, 影响存储成本与分析深度', 120, 85, { min: 30, max: 365, step: 10, learningDataPoints: 38000, adjustHistory: [
        { time: '1周前', from: '60', to: '90', reason: '季度分析需求增加, AI延长保留周期' },
      ] }),
      createParam('quality_threshold', '质量告警阈值', 95, '%', '数据质量评分低于此值触发告警', 96, 91, { min: 80, max: 99, step: 1, learningDataPoints: 72000, adjustHistory: [
        { time: '2小时前', from: '93', to: '95', reason: '模型训练对数据质量要求提升, AI上调阈值' },
      ] }),
      createParam('dedup_mode', '去重策略', '语义去重', '', '数据去重方式: 精确匹配速度快, 语义去重准确率高, AI智能自动选择', 'AI智能', 83, { type: 'select', options: ['精确匹配', '语义去重', 'AI智能'], learningDataPoints: 45000, adjustHistory: [
        { time: '昨日', from: '精确匹配', to: '语义去重', reason: '内容素材数据存在大量近似重复, AI切换为语义去重' },
      ] }),
    ],
  },
  {
    title: '数据分层配置',
    icon: <Layers size={15} />,
    params: [
      createParam('ods_sync_delay', 'ODS同步延迟', 5, '分钟', '原始数据层同步最大允许延迟', 3, 89, { min: 1, max: 30, step: 1, learningDataPoints: 68000, adjustHistory: [
        { time: '4小时前', from: '10', to: '5', reason: '直播高峰期数据时效要求提升, AI缩短延迟' },
      ] }),
      createParam('dwd_batch_size', 'DWD批处理量', 10000, '条', '明细数据层每批次处理记录数', 15000, 86, { min: 1000, max: 100000, step: 1000, learningDataPoints: 55000, adjustHistory: [
        { time: '昨日', from: '5000', to: '10000', reason: '集群资源充足, AI提升批处理量加速数据处理' },
      ] }),
      createParam('dws_agg_window', 'DWS聚合窗口', 24, '小时', '汇总数据层聚合时间窗口', 12, 84, { min: 1, max: 72, step: 1, learningDataPoints: 42000, adjustHistory: [
        { time: '2天前', from: '12', to: '24', reason: '日维度报表需求增加, AI扩大聚合窗口' },
      ] }),
      createParam('ads_refresh', 'ADS层刷新频率', 15, '分钟', '应用数据层向AI模型供给数据的刷新间隔', 10, 90, { min: 5, max: 60, step: 5, learningDataPoints: 78000, adjustHistory: [
        { time: '1小时前', from: '30', to: '15', reason: '投放决策频率加快, AI提升刷新频率' },
      ] }),
    ],
  },
]

const warehouseLearningStatus: AILearningStatus = {
  modelVersion: 'v2.0.0-warehouse',
  lastTraining: '30分钟前',
  totalDataPoints: 680000,
  avgConfidence: 89,
  autoAdjustCount24h: 36,
  learningRate: '0.0018',
  nextTraining: '30分钟后',
  improvementRate: '+5.2%',
}

// ── Static Data ───────────────────────────────────────────────────────────────

const tabs = ['数据资产总览', 'ETL任务管理', '数据血缘', '数据质量']

const kpiCards = [
  { label: '数据总量', value: '28.6亿条', icon: Database, color: '#e8365d' },
  { label: '今日入库', value: '4,280万条', icon: HardDrive, color: '#8b5cf6' },
  { label: '数据表数量', value: '186张', icon: Table2, color: '#22c55e' },
  { label: 'ETL任务', value: '42个运行中', icon: Settings2, color: '#f59e0b' },
]

// ── Tab 1: 数据资产总览 ──
interface DomainTable {
  name: string
  keyFields: string
}

interface DataDomain {
  name: string
  icon: React.ReactNode
  color: string
  tableCount: number
  rowCount: string
  lastUpdate: string
  qualityScore: number
  tables: DomainTable[]
}

const dataDomains: DataDomain[] = [
  {
    name: '广告投放域', icon: <Megaphone size={18} />, color: '#e8365d',
    tableCount: 32, rowCount: '8.2亿', lastUpdate: '2分钟前', qualityScore: 97.5,
    tables: [
      { name: '广告计划表', keyFields: '计划ID/平台/状态/日预算' },
      { name: '广告组表', keyFields: 'CPA/CPC/CTR/CVR' },
      { name: '创意素材表', keyFields: '素材ID/类型/尺寸/标签' },
      { name: '出价记录表', keyFields: '出价时间/策略/金额' },
      { name: '投放日志表', keyFields: '曝光/点击/转化/花费' },
    ],
  },
  {
    name: '电商交易域', icon: <ShoppingBag size={18} />, color: '#8b5cf6',
    tableCount: 28, rowCount: '12.4亿', lastUpdate: '1分钟前', qualityScore: 98.1,
    tables: [
      { name: '订单表', keyFields: '订单ID/GMV/客单价/支付方式' },
      { name: '商品表', keyFields: '商品ID/品类/价格/销量' },
      { name: 'SKU库存表', keyFields: 'SKU/库存量/预警值' },
      { name: '退款表', keyFields: '退款原因/金额/时间' },
      { name: '购物车表', keyFields: '商品信息/加购时间/数量' },
    ],
  },
  {
    name: '内容素材域', icon: <Eye size={18} />, color: '#22c55e',
    tableCount: 24, rowCount: '3.8亿', lastUpdate: '5分钟前', qualityScore: 95.8,
    tables: [
      { name: '素材表', keyFields: '素材ID/类型/CTR/CVR' },
      { name: '笔记表', keyFields: '笔记ID/点赞/收藏/评论' },
      { name: '短视频表', keyFields: '视频ID/播放量/完播率' },
      { name: '直播记录表', keyFields: '场次/GMV/在线人数' },
      { name: '评论表', keyFields: '生命周期/标签/情感倾向' },
    ],
  },
  {
    name: '用户画像域', icon: <Users size={18} />, color: '#f59e0b',
    tableCount: 18, rowCount: '2.1亿', lastUpdate: '15分钟前', qualityScore: 96.4,
    tables: [
      { name: '用户基础表', keyFields: '用户ID/年龄/性别/地域' },
      { name: '行为日志表', keyFields: '行为类型/时间/频次' },
      { name: '标签表', keyFields: '兴趣标签/消费偏好' },
      { name: '会员等级表', keyFields: '等级/积分/权益' },
      { name: '复购价值预测表', keyFields: '复购价值/复购概率/流失风险' },
    ],
  },
  {
    name: '达人生态域', icon: <Star size={18} />, color: '#ff7a95',
    tableCount: 15, rowCount: '0.8亿', lastUpdate: '10分钟前', qualityScore: 94.2,
    tables: [
      { name: '达人档案表', keyFields: '达人ID/平台/粉丝数' },
      { name: '合作记录表', keyFields: '合作次数/费用/ROI' },
      { name: '种草效果表', keyFields: '互动率/归因GMV' },
      { name: '粉丝画像表', keyFields: '年龄/性别/兴趣分布' },
    ],
  },
  {
    name: '市场情报域', icon: <BarChart3 size={18} />, color: '#06b6d4',
    tableCount: 12, rowCount: '1.3亿', lastUpdate: '30分钟前', qualityScore: 93.8,
    tables: [
      { name: '竞品广告表', keyFields: '竞品/品类/投放量' },
      { name: '行业趋势表', keyFields: '品类增速/热搜指数' },
      { name: '成分热度表', keyFields: '成分/热度/趋势方向' },
      { name: '价格监控表', keyFields: '价格变化/市场份额' },
    ],
  },
]

// ── Tab 2: ETL任务管理 ──
interface ETLTask {
  name: string
  source: string
  target: string
  frequency: string
  lastRun: string
  duration: string
  status: '成功' | '运行中' | '失败'
  dataVolume: string
}

const etlTasks: ETLTask[] = [
  { name: '抖音广告数据同步', source: 'douyin_ad_api', target: 'ods_ad_douyin', frequency: '每15分钟', lastRun: '14:32', duration: '2m18s', status: '成功', dataVolume: '128万条' },
  { name: '天猫订单实时入库', source: 'tmall_order_api', target: 'ods_order_tmall', frequency: '每5分钟', lastRun: '14:45', duration: '运行中', status: '运行中', dataVolume: '56万条' },
  { name: '小红书笔记数据采集', source: 'xhs_note_api', target: 'ods_content_xhs', frequency: '每30分钟', lastRun: '14:30', duration: '4m52s', status: '成功', dataVolume: '82万条' },
  { name: '用户画像标签更新', source: 'dws_user_*', target: 'ads_user_profile', frequency: '每日凌晨', lastRun: '03:00', duration: '18m32s', status: '成功', dataVolume: '2,100万条' },
  { name: '达人粉丝画像同步', source: 'kol_platform_api', target: 'ods_kol_fans', frequency: '每小时', lastRun: '14:00', duration: '6m15s', status: '成功', dataVolume: '340万条' },
  { name: '竞品广告监控', source: 'competitor_api', target: 'ods_competitor_ad', frequency: '每小时', lastRun: '14:00', duration: '3m42s', status: '成功', dataVolume: '45万条' },
  { name: '库存数据同步', source: 'erp_stock_api', target: 'ods_inventory', frequency: '每10分钟', lastRun: '14:40', duration: '运行中', status: '运行中', dataVolume: '18万条' },
  { name: '直播实时数据流', source: 'live_stream_kafka', target: 'ods_live_realtime', frequency: '实时', lastRun: '持续运行', duration: '-', status: '成功', dataVolume: '1,580万条' },
]

const pipelineSteps = ['数据采集', '数据清洗', '数据转换', '数据加载', '质量校验']

// ── Tab 3: 数据血缘层级 ──
const lineageLayers = [
  { name: '数据源层', color: '#e8365d', items: ['抖音API', '天猫API', '小红书API', '快手API', '京东API', '微信API'] },
  { name: 'ODS层 (原始数据层)', color: '#ff7a95', items: ['ads_raw', 'ecom_raw', 'content_raw', 'user_raw'] },
  { name: 'DWD层 (明细数据层)', color: '#8b5cf6', items: ['fact_ad_delivery', 'fact_order', 'fact_content_perf', 'dim_user'] },
  { name: 'DWS层 (汇总数据层)', color: '#f59e0b', items: ['dws_ad_daily', 'dws_product_daily', 'dws_kol_daily'] },
  { name: 'ADS层 (应用数据层)', color: '#22c55e', items: ['ads_ai_decision', 'ads_roi_report', 'ads_trend_insight'] },
]

// ── Tab 4: 数据质量 ──
const qualityDimensions = [
  { name: '完整性', score: 98.2, desc: '必填字段非空率', icon: <CheckCircle size={18} /> },
  { name: '准确性', score: 97.1, desc: '数据范围/格式校验通过率', icon: <Shield size={18} /> },
  { name: '及时性', score: 95.8, desc: '数据在SLA内到达率', icon: <Clock size={18} /> },
  { name: '一致性', score: 96.2, desc: '跨源数据一致率', icon: <GitBranch size={18} /> },
]

const qualityByDomain = [
  { domain: '广告投放域', score: 97.5 },
  { domain: '电商交易域', score: 98.1 },
  { domain: '内容素材域', score: 95.8 },
  { domain: '用户画像域', score: 96.4 },
  { domain: '达人生态域', score: 94.2 },
  { domain: '市场情报域', score: 93.8 },
]

const qualityAlerts = [
  { time: '14:38', table: 'ods_ad_douyin', issue: '字段缺失', severity: '中', scope: '广告投放域 3.2万条', status: '处理中' },
  { time: '13:15', table: 'ods_order_tmall', issue: '数据延迟', severity: '高', scope: '电商交易域 全量', status: '已恢复' },
  { time: '12:02', table: 'dws_kol_daily', issue: '聚合异常', severity: '低', scope: '达人生态域 1,200条', status: '已修复' },
  { time: '10:45', table: 'ods_content_xhs', issue: '格式错误', severity: '中', scope: '内容素材域 8,500条', status: '处理中' },
  { time: '09:20', table: 'ads_user_profile', issue: '一致性冲突', severity: '低', scope: '用户画像域 560条', status: '已修复' },
]

// ── Data Volume Trend (for Tab 1) ──
const dataVolumeTrend = [
  { date: '03-30', total: 26.2, newData: 3800 },
  { date: '03-31', total: 26.6, newData: 4020 },
  { date: '04-01', total: 27.0, newData: 4150 },
  { date: '04-02', total: 27.5, newData: 4380 },
  { date: '04-03', total: 27.9, newData: 4120 },
  { date: '04-04', total: 28.2, newData: 3960 },
  { date: '04-05', total: 28.6, newData: 4280 },
]

// ── ETL Stats (for Tab 2) ──
const etlStats = [
  { label: '运行中任务', value: '42', color: '#2563eb' },
  { label: '今日成功', value: '1,286', color: '#22c55e' },
  { label: '今日失败', value: '3', color: '#ef4444' },
  { label: '平均耗时', value: '4m32s', color: '#f59e0b' },
]

const etlHourlyData = [
  { hour: '00:00', success: 42, fail: 0 },
  { hour: '02:00', success: 38, fail: 1 },
  { hour: '04:00', success: 45, fail: 0 },
  { hour: '06:00', success: 52, fail: 0 },
  { hour: '08:00', success: 86, fail: 1 },
  { hour: '10:00', success: 108, fail: 0 },
  { hour: '12:00', success: 95, fail: 1 },
  { hour: '14:00', success: 112, fail: 0 },
]

// ── Quality Trend (for Tab 4) ──
const qualityTrend = [
  { date: '03-30', score: 96.1 },
  { date: '03-31', score: 96.3 },
  { date: '04-01', score: 95.8 },
  { date: '04-02', score: 96.5 },
  { date: '04-03', score: 96.9 },
  { date: '04-04', score: 96.6 },
  { date: '04-05', score: 96.8 },
]

// ══════════════════════════════════════════════════════════════════════════════
// Drill-down Mock Data
// ══════════════════════════════════════════════════════════════════════════════

// KPI drill-down data
const kpiDomainBreakdown = [
  { domain: '广告投放域', count: '8.2亿', pct: 28.7, color: '#e8365d' },
  { domain: '电商交易域', count: '12.4亿', pct: 43.4, color: '#8b5cf6' },
  { domain: '内容素材域', count: '3.8亿', pct: 13.3, color: '#22c55e' },
  { domain: '用户画像域', count: '2.1亿', pct: 7.3, color: '#f59e0b' },
  { domain: '达人生态域', count: '0.8亿', pct: 2.8, color: '#ff7a95' },
  { domain: '市场情报域', count: '1.3亿', pct: 4.5, color: '#06b6d4' },
]

const kpiDailyGrowth = [
  { date: '03-30', growth: 3800 }, { date: '03-31', growth: 4020 },
  { date: '04-01', growth: 4150 }, { date: '04-02', growth: 4380 },
  { date: '04-03', growth: 4120 }, { date: '04-04', growth: 3960 },
  { date: '04-05', growth: 4280 },
]

const kpiHourlyIngestion = [
  { hour: '00:00', volume: 82 }, { hour: '01:00', volume: 65 },
  { hour: '02:00', volume: 58 }, { hour: '03:00', volume: 120 },
  { hour: '04:00', volume: 72 }, { hour: '05:00', volume: 68 },
  { hour: '06:00', volume: 95 }, { hour: '07:00', volume: 148 },
  { hour: '08:00', volume: 265 }, { hour: '09:00', volume: 342 },
  { hour: '10:00', volume: 398 }, { hour: '11:00', volume: 425 },
  { hour: '12:00', volume: 310 }, { hour: '13:00', volume: 365 },
  { hour: '14:00', volume: 412 },
]

const kpiSourceVolume = [
  { source: '抖音广告API', volume: '1,280万', pct: 29.9 },
  { source: '天猫订单API', volume: '980万', pct: 22.9 },
  { source: '小红书笔记API', volume: '820万', pct: 19.2 },
  { source: '快手直播API', volume: '560万', pct: 13.1 },
  { source: '京东商品API', volume: '380万', pct: 8.9 },
  { source: '微信CRM API', volume: '260万', pct: 6.1 },
]

const kpiTablesByDomain = [
  { domain: '广告投放域', tables: 32, healthy: 30, warning: 2, error: 0 },
  { domain: '电商交易域', tables: 28, healthy: 27, warning: 1, error: 0 },
  { domain: '内容素材域', tables: 24, healthy: 22, warning: 1, error: 1 },
  { domain: '用户画像域', tables: 18, healthy: 18, warning: 0, error: 0 },
  { domain: '达人生态域', tables: 15, healthy: 14, warning: 1, error: 0 },
  { domain: '市场情报域', tables: 12, healthy: 11, warning: 1, error: 0 },
]

const kpiEtlSummary = {
  running: 42, success: 1286, failed: 3, queued: 8,
  recentFailures: [
    { name: '小红书评论增量同步', time: '13:22', error: '接口超时, 已自动重试' },
    { name: '竞品价格监控采集', time: '11:05', error: 'API限流, 等待冷却期' },
    { name: '微信CRM标签同步', time: '09:48', error: '字段映射异常, 需人工处理' },
  ],
}

// Domain drill-down extended data
const domainDetailData: Record<string, {
  tables: { name: string; rows: string; updateTime: string; quality: number; storage: string; hotQueries: number }[]
  storageTotal: string
  schemaPreview: { column: string; type: string; desc: string }[]
}> = {
  '广告投放域': {
    storageTotal: '2.4TB',
    tables: [
      { name: '广告计划表', rows: '1.2亿', updateTime: '2分钟前', quality: 98.2, storage: '680GB', hotQueries: 1420 },
      { name: '广告组表', rows: '2.8亿', updateTime: '2分钟前', quality: 97.8, storage: '520GB', hotQueries: 2180 },
      { name: '创意素材表', rows: '1.5亿', updateTime: '5分钟前', quality: 96.5, storage: '420GB', hotQueries: 890 },
      { name: '出价记录表', rows: '1.8亿', updateTime: '3分钟前', quality: 98.1, storage: '380GB', hotQueries: 560 },
      { name: '投放日志表', rows: '0.9亿', updateTime: '1分钟前', quality: 97.2, storage: '400GB', hotQueries: 3200 },
    ],
    schemaPreview: [
      { column: 'plan_id', type: 'BIGINT', desc: '广告计划唯一标识' },
      { column: 'platform', type: 'VARCHAR(32)', desc: '投放平台 (抖音/快手/小红书)' },
      { column: 'budget_daily', type: 'DECIMAL(12,2)', desc: '日预算金额(元)' },
      { column: 'status', type: 'TINYINT', desc: '状态: 0=暂停 1=投放中 2=已结束' },
      { column: 'created_at', type: 'TIMESTAMP', desc: '创建时间' },
    ],
  },
  '电商交易域': {
    storageTotal: '3.8TB',
    tables: [
      { name: '订单表', rows: '4.2亿', updateTime: '1分钟前', quality: 98.8, storage: '1.2TB', hotQueries: 4500 },
      { name: '商品表', rows: '3.6亿', updateTime: '3分钟前', quality: 98.2, storage: '890GB', hotQueries: 3200 },
      { name: 'SKU库存表', rows: '2.1亿', updateTime: '2分钟前', quality: 97.5, storage: '620GB', hotQueries: 1800 },
      { name: '退款表', rows: '1.8亿', updateTime: '5分钟前', quality: 97.9, storage: '580GB', hotQueries: 920 },
      { name: '购物车表', rows: '0.7亿', updateTime: '1分钟前', quality: 98.0, storage: '510GB', hotQueries: 680 },
    ],
    schemaPreview: [
      { column: 'order_id', type: 'BIGINT', desc: '订单唯一标识' },
      { column: 'user_id', type: 'BIGINT', desc: '用户ID' },
      { column: 'gmv', type: 'DECIMAL(12,2)', desc: '订单金额(元)' },
      { column: 'pay_method', type: 'VARCHAR(16)', desc: '支付方式' },
      { column: 'order_time', type: 'TIMESTAMP', desc: '下单时间' },
    ],
  },
  '内容素材域': {
    storageTotal: '1.6TB',
    tables: [
      { name: '素材表', rows: '1.2亿', updateTime: '5分钟前', quality: 96.2, storage: '480GB', hotQueries: 1100 },
      { name: '笔记表', rows: '0.9亿', updateTime: '8分钟前', quality: 95.8, storage: '350GB', hotQueries: 2400 },
      { name: '短视频表', rows: '0.8亿', updateTime: '6分钟前', quality: 95.2, storage: '420GB', hotQueries: 1800 },
      { name: '直播记录表', rows: '0.5亿', updateTime: '3分钟前', quality: 96.5, storage: '210GB', hotQueries: 3600 },
      { name: '评论表', rows: '0.4亿', updateTime: '10分钟前', quality: 95.0, storage: '140GB', hotQueries: 520 },
    ],
    schemaPreview: [
      { column: 'content_id', type: 'BIGINT', desc: '素材唯一标识' },
      { column: 'content_type', type: 'VARCHAR(16)', desc: '类型: 图文/短视频/直播' },
      { column: 'ctr', type: 'DECIMAL(6,4)', desc: '点击率' },
      { column: 'cvr', type: 'DECIMAL(6,4)', desc: '转化率' },
      { column: 'publish_time', type: 'TIMESTAMP', desc: '发布时间' },
    ],
  },
  '用户画像域': {
    storageTotal: '0.9TB',
    tables: [
      { name: '用户基础表', rows: '0.6亿', updateTime: '15分钟前', quality: 97.2, storage: '280GB', hotQueries: 2800 },
      { name: '行为日志表', rows: '0.8亿', updateTime: '10分钟前', quality: 96.0, storage: '320GB', hotQueries: 1500 },
      { name: '标签表', rows: '0.3亿', updateTime: '20分钟前', quality: 96.8, storage: '150GB', hotQueries: 3400 },
      { name: '会员等级表', rows: '0.2亿', updateTime: '30分钟前', quality: 97.5, storage: '80GB', hotQueries: 600 },
      { name: '复购价值预测表', rows: '0.2亿', updateTime: '1小时前', quality: 95.5, storage: '70GB', hotQueries: 4200 },
    ],
    schemaPreview: [
      { column: 'user_id', type: 'BIGINT', desc: '用户唯一标识' },
      { column: 'age_group', type: 'VARCHAR(16)', desc: '年龄段' },
      { column: 'gender', type: 'TINYINT', desc: '性别: 0=未知 1=女 2=男' },
      { column: 'region', type: 'VARCHAR(32)', desc: '地域' },
      { column: 'skin_type', type: 'VARCHAR(16)', desc: '肤质类型' },
    ],
  },
  '达人生态域': {
    storageTotal: '0.4TB',
    tables: [
      { name: '达人档案表', rows: '0.2亿', updateTime: '10分钟前', quality: 95.0, storage: '120GB', hotQueries: 1200 },
      { name: '合作记录表', rows: '0.3亿', updateTime: '15分钟前', quality: 94.5, storage: '140GB', hotQueries: 800 },
      { name: '种草效果表', rows: '0.2亿', updateTime: '20分钟前', quality: 93.8, storage: '90GB', hotQueries: 2100 },
      { name: '粉丝画像表', rows: '0.1亿', updateTime: '30分钟前', quality: 93.5, storage: '50GB', hotQueries: 450 },
    ],
    schemaPreview: [
      { column: 'kol_id', type: 'BIGINT', desc: '达人唯一标识' },
      { column: 'platform', type: 'VARCHAR(16)', desc: '平台' },
      { column: 'followers', type: 'BIGINT', desc: '粉丝数' },
      { column: 'avg_engagement', type: 'DECIMAL(6,4)', desc: '平均互动率' },
      { column: 'category', type: 'VARCHAR(32)', desc: '美妆/护肤/彩妆分类' },
    ],
  },
  '市场情报域': {
    storageTotal: '0.6TB',
    tables: [
      { name: '竞品广告表', rows: '0.4亿', updateTime: '30分钟前', quality: 94.2, storage: '180GB', hotQueries: 680 },
      { name: '行业趋势表', rows: '0.3亿', updateTime: '1小时前', quality: 93.5, storage: '160GB', hotQueries: 1500 },
      { name: '成分热度表', rows: '0.3亿', updateTime: '45分钟前', quality: 93.8, storage: '140GB', hotQueries: 2200 },
      { name: '价格监控表', rows: '0.3亿', updateTime: '20分钟前', quality: 93.6, storage: '120GB', hotQueries: 900 },
    ],
    schemaPreview: [
      { column: 'competitor_id', type: 'BIGINT', desc: '竞品唯一标识' },
      { column: 'brand', type: 'VARCHAR(64)', desc: '品牌名称' },
      { column: 'category', type: 'VARCHAR(32)', desc: '品类' },
      { column: 'spend_daily', type: 'DECIMAL(12,2)', desc: '日投放金额(元)' },
      { column: 'market_share', type: 'DECIMAL(6,4)', desc: '市场份额' },
    ],
  },
}

// Table drill-down data
const tableDetailData: Record<string, {
  columns: { name: string; type: string; nullable: boolean; desc: string }[]
  sampleData: Record<string, string>[]
  lineage: { upstream: string[]; downstream: string[] }
  queryFreq: string
  owner: string
}> = {
  '广告计划表': {
    columns: [
      { name: 'plan_id', type: 'BIGINT', nullable: false, desc: '广告计划唯一ID' },
      { name: 'plan_name', type: 'VARCHAR(128)', nullable: false, desc: '计划名称' },
      { name: 'platform', type: 'VARCHAR(32)', nullable: false, desc: '投放平台' },
      { name: 'status', type: 'TINYINT', nullable: false, desc: '状态' },
      { name: 'budget_daily', type: 'DECIMAL(12,2)', nullable: true, desc: '日预算' },
      { name: 'target_audience', type: 'JSON', nullable: true, desc: '定向人群' },
      { name: 'bid_strategy', type: 'VARCHAR(32)', nullable: true, desc: '出价策略' },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, desc: '创建时间' },
    ],
    sampleData: [
      { plan_id: '100281', plan_name: '春季美白精华推广', platform: '抖音', status: '投放中', budget_daily: '15,000' },
      { plan_id: '100282', plan_name: '防晒霜618预热', platform: '小红书', status: '投放中', budget_daily: '8,500' },
      { plan_id: '100283', plan_name: '口红新色号种草', platform: '抖音', status: '暂停', budget_daily: '12,000' },
      { plan_id: '100284', plan_name: '眼霜抗皱测评', platform: '快手', status: '投放中', budget_daily: '6,800' },
      { plan_id: '100285', plan_name: '面膜买赠活动', platform: '天猫', status: '已结束', budget_daily: '20,000' },
    ],
    lineage: {
      upstream: ['douyin_ad_api', 'xhs_ad_api', 'kuaishou_ad_api'],
      downstream: ['dwd_fact_ad_delivery', 'dws_ad_daily', 'ads_roi_report'],
    },
    queryFreq: '1,420次/小时',
    owner: '数据团队 - 张明',
  },
  '订单表': {
    columns: [
      { name: 'order_id', type: 'BIGINT', nullable: false, desc: '订单唯一ID' },
      { name: 'user_id', type: 'BIGINT', nullable: false, desc: '用户ID' },
      { name: 'gmv', type: 'DECIMAL(12,2)', nullable: false, desc: '订单金额' },
      { name: 'pay_method', type: 'VARCHAR(16)', nullable: true, desc: '支付方式' },
      { name: 'sku_list', type: 'JSON', nullable: false, desc: 'SKU列表' },
      { name: 'coupon_id', type: 'BIGINT', nullable: true, desc: '优惠券ID' },
      { name: 'channel', type: 'VARCHAR(32)', nullable: true, desc: '渠道来源' },
      { name: 'order_time', type: 'TIMESTAMP', nullable: false, desc: '下单时间' },
    ],
    sampleData: [
      { order_id: '2024040512001', user_id: '88021', gmv: '299.00', pay_method: '支付宝', sku_list: '美白精华x1' },
      { order_id: '2024040512002', user_id: '76543', gmv: '158.00', pay_method: '微信', sku_list: '防晒霜x2' },
      { order_id: '2024040512003', user_id: '92310', gmv: '489.00', pay_method: '花呗', sku_list: '面膜套装x1' },
      { order_id: '2024040512004', user_id: '61028', gmv: '79.00', pay_method: '微信', sku_list: '口红x1' },
      { order_id: '2024040512005', user_id: '45892', gmv: '1,280.00', pay_method: '支付宝', sku_list: '护肤套装x1' },
    ],
    lineage: {
      upstream: ['tmall_order_api', 'jd_order_api', 'douyin_shop_api'],
      downstream: ['dwd_fact_order', 'dws_product_daily', 'ads_roi_report'],
    },
    queryFreq: '4,500次/小时',
    owner: '数据团队 - 李雪',
  },
}

// ETL drill-down data
const etlDetailData: Record<string, {
  dagSteps: { step: string; desc: string; status: string; duration: string }[]
  history: { time: string; status: string; duration: string; rows: string }[]
  errorLogs: { time: string; level: string; message: string }[]
  volumePerRun: { run: string; volume: number }[]
  perfTrend: { date: string; duration: number }[]
}> = {
  '抖音广告数据同步': {
    dagSteps: [
      { step: '数据抽取', desc: '从抖音广告API拉取增量数据', status: '完成', duration: '0m42s' },
      { step: '格式清洗', desc: '字段标准化, NULL值处理, 编码转换', status: '完成', duration: '0m28s' },
      { step: '维度转换', desc: '广告计划/广告组/创意维度拆分', status: '完成', duration: '0m35s' },
      { step: '数据加载', desc: '写入ODS层ods_ad_douyin表', status: '完成', duration: '0m18s' },
      { step: '质量校验', desc: '完整性/准确性/一致性三重校验', status: '完成', duration: '0m15s' },
    ],
    history: [
      { time: '14:32', status: '成功', duration: '2m18s', rows: '128万' },
      { time: '14:17', status: '成功', duration: '2m05s', rows: '115万' },
      { time: '14:02', status: '成功', duration: '2m22s', rows: '132万' },
      { time: '13:47', status: '成功', duration: '1m58s', rows: '108万' },
      { time: '13:32', status: '失败', duration: '1m42s', rows: '0' },
      { time: '13:17', status: '成功', duration: '2m12s', rows: '121万' },
      { time: '13:02', status: '成功', duration: '2m08s', rows: '118万' },
      { time: '12:47', status: '成功', duration: '2m15s', rows: '125万' },
      { time: '12:32', status: '成功', duration: '2m20s', rows: '130万' },
      { time: '12:17', status: '成功', duration: '1m55s', rows: '102万' },
    ],
    errorLogs: [
      { time: '13:32:15', level: 'ERROR', message: 'HTTP 429 Too Many Requests - 抖音API限流, 触发重试机制' },
      { time: '13:33:42', level: 'WARN', message: '第2次重试仍失败, 等待30秒后第3次重试' },
      { time: '13:34:18', level: 'ERROR', message: '达到最大重试次数(3次), 任务标记为失败' },
      { time: '13:34:19', level: 'INFO', message: '已自动发送告警至数据团队钉钉群' },
    ],
    volumePerRun: [
      { run: '12:17', volume: 102 }, { run: '12:32', volume: 130 },
      { run: '12:47', volume: 125 }, { run: '13:02', volume: 118 },
      { run: '13:17', volume: 121 }, { run: '13:32', volume: 0 },
      { run: '13:47', volume: 108 }, { run: '14:02', volume: 132 },
      { run: '14:17', volume: 115 }, { run: '14:32', volume: 128 },
    ],
    perfTrend: [
      { date: '03-30', duration: 2.5 }, { date: '03-31', duration: 2.3 },
      { date: '04-01', duration: 2.8 }, { date: '04-02', duration: 2.1 },
      { date: '04-03', duration: 2.4 }, { date: '04-04', duration: 2.2 },
      { date: '04-05', duration: 2.3 },
    ],
  },
  '天猫订单实时入库': {
    dagSteps: [
      { step: '数据抽取', desc: '从天猫开放平台拉取实时订单', status: '运行中', duration: '0m35s' },
      { step: '格式清洗', desc: '订单金额校验, 地址标准化', status: '等待中', duration: '-' },
      { step: '维度转换', desc: '订单/商品/用户维度关联', status: '等待中', duration: '-' },
      { step: '数据加载', desc: '写入ODS层ods_order_tmall表', status: '等待中', duration: '-' },
      { step: '质量校验', desc: '金额一致性, 库存联动校验', status: '等待中', duration: '-' },
    ],
    history: [
      { time: '14:45', status: '运行中', duration: '-', rows: '56万' },
      { time: '14:40', status: '成功', duration: '1m42s', rows: '48万' },
      { time: '14:35', status: '成功', duration: '1m38s', rows: '52万' },
      { time: '14:30', status: '成功', duration: '1m45s', rows: '55万' },
      { time: '14:25', status: '成功', duration: '1m40s', rows: '50万' },
      { time: '14:20', status: '成功', duration: '1m35s', rows: '46万' },
      { time: '14:15', status: '成功', duration: '1m48s', rows: '58万' },
      { time: '14:10', status: '成功', duration: '1m32s', rows: '42万' },
      { time: '14:05', status: '成功', duration: '1m44s', rows: '53万' },
      { time: '14:00', status: '成功', duration: '1m36s', rows: '47万' },
    ],
    errorLogs: [
      { time: '11:22:08', level: 'WARN', message: '天猫API响应延迟增加至2.5s, 监控中' },
      { time: '11:25:32', level: 'INFO', message: 'API响应恢复正常(< 500ms)' },
    ],
    volumePerRun: [
      { run: '14:00', volume: 47 }, { run: '14:05', volume: 53 },
      { run: '14:10', volume: 42 }, { run: '14:15', volume: 58 },
      { run: '14:20', volume: 46 }, { run: '14:25', volume: 50 },
      { run: '14:30', volume: 55 }, { run: '14:35', volume: 52 },
      { run: '14:40', volume: 48 }, { run: '14:45', volume: 56 },
    ],
    perfTrend: [
      { date: '03-30', duration: 1.6 }, { date: '03-31', duration: 1.5 },
      { date: '04-01', duration: 1.8 }, { date: '04-02', duration: 1.4 },
      { date: '04-03', duration: 1.7 }, { date: '04-04', duration: 1.5 },
      { date: '04-05', duration: 1.6 },
    ],
  },
}

// Lineage drill-down data
const lineageDetailData: Record<string, {
  upstream: string[]
  downstream: string[]
  freshness: string
  transformRules: string[]
  sampleSQL: string
}> = {
  '抖音API': { upstream: ['抖音广告后台', '巨量引擎'], downstream: ['ads_raw', 'ods_ad_douyin'], freshness: '实时', transformRules: ['原始JSON解析', '字段名映射', '时区转换UTC+8'], sampleSQL: "SELECT ad_id, campaign_id, spend, impressions, clicks\nFROM douyin_ad_api.ad_performance\nWHERE date = CURRENT_DATE" },
  '天猫API': { upstream: ['天猫开放平台', '聚石塔'], downstream: ['ecom_raw', 'ods_order_tmall'], freshness: '实时', transformRules: ['订单状态映射', 'SKU信息拆分', '金额精度统一'], sampleSQL: "SELECT order_id, buyer_id, total_fee, pay_time\nFROM tmall_trade_api.trade_fullinfo\nWHERE modified > :last_sync_time" },
  '小红书API': { upstream: ['小红书开放平台', '蒲公英'], downstream: ['content_raw', 'ods_content_xhs'], freshness: '< 5min', transformRules: ['笔记内容清洗', '标签体系映射', '图片URL标准化'], sampleSQL: "SELECT note_id, title, likes, collects, comments\nFROM xhs_content_api.note_detail\nWHERE update_time > :last_sync_time" },
  '快手API': { upstream: ['快手磁力金牛', '快手电商'], downstream: ['ads_raw', 'content_raw'], freshness: '< 3min', transformRules: ['直播数据聚合', '商品信息关联', '粉丝互动统计'], sampleSQL: "SELECT live_id, anchor_id, gmv, viewers_peak\nFROM kuaishou_live_api.live_stats\nWHERE end_time > :last_sync_time" },
  '京东API': { upstream: ['京东开放平台', '京东云'], downstream: ['ecom_raw', 'ods_order_jd'], freshness: '< 5min', transformRules: ['订单字段标准化', '物流状态映射', '促销信息解析'], sampleSQL: "SELECT order_id, sku_id, price, order_state\nFROM jd_pop_api.order_search\nWHERE modified > :last_sync_time" },
  '微信API': { upstream: ['微信CRM', '企业微信'], downstream: ['user_raw', 'ods_user_wechat'], freshness: '< 10min', transformRules: ['用户ID加密脱敏', '标签体系对齐', '行为事件标准化'], sampleSQL: "SELECT openid, unionid, tags, last_active\nFROM wechat_crm_api.user_profile\nWHERE update_time > :last_sync_time" },
  'ads_raw': { upstream: ['抖音API', '快手API'], downstream: ['fact_ad_delivery'], freshness: '< 2min', transformRules: ['多平台字段统一', '编码转UTF-8', '去除测试数据'], sampleSQL: "INSERT INTO ods.ads_raw\nSELECT * FROM staging.ads_incoming\nWHERE is_test = 0" },
  'ecom_raw': { upstream: ['天猫API', '京东API'], downstream: ['fact_order'], freshness: '< 3min', transformRules: ['订单状态统一编码', '金额单位统一(分→元)', '时区校正'], sampleSQL: "INSERT INTO ods.ecom_raw\nSELECT *, amount/100.0 as amount_yuan\nFROM staging.ecom_incoming" },
  'content_raw': { upstream: ['小红书API', '快手API'], downstream: ['fact_content_perf'], freshness: '< 5min', transformRules: ['内容分类标准化', '互动指标归一化', '文本清洗去噪'], sampleSQL: "INSERT INTO ods.content_raw\nSELECT *, normalize_metrics(likes, views)\nFROM staging.content_incoming" },
  'user_raw': { upstream: ['微信API'], downstream: ['dim_user'], freshness: '< 10min', transformRules: ['PII数据脱敏加密', '地域标准化', 'ID-Mapping关联'], sampleSQL: "INSERT INTO ods.user_raw\nSELECT encrypt(openid), region_normalize(city)\nFROM staging.user_incoming" },
  'fact_ad_delivery': { upstream: ['ads_raw'], downstream: ['dws_ad_daily', 'ads_ai_decision'], freshness: '< 10min', transformRules: ['广告维度拆分', '效果指标计算(CTR/CVR/CPA)', '归因窗口关联'], sampleSQL: "SELECT ad_id, sum(spend) as total_spend,\n  sum(clicks)/sum(impressions) as ctr\nFROM ods.ads_raw\nGROUP BY ad_id, date" },
  'fact_order': { upstream: ['ecom_raw'], downstream: ['dws_product_daily', 'ads_roi_report'], freshness: '< 10min', transformRules: ['订单明细展开', 'SKU粒度拆分', '退款关联'], sampleSQL: "SELECT order_id, sku_id, quantity, unit_price,\n  total_amount, channel\nFROM ods.ecom_raw\nJOIN dim.sku ON sku_id = sku.id" },
  'fact_content_perf': { upstream: ['content_raw'], downstream: ['dws_kol_daily', 'ads_trend_insight'], freshness: '< 15min', transformRules: ['内容效果评分', '达人关联', '品牌提及提取'], sampleSQL: "SELECT content_id, kol_id, engagement_score,\n  brand_mentions, sentiment\nFROM ods.content_raw\nJOIN dim.kol ON author_id = kol.id" },
  'dim_user': { upstream: ['user_raw'], downstream: ['dws_ad_daily', 'ads_ai_decision'], freshness: '< 30min', transformRules: ['用户宽表构建', '标签合并', '复购价值预测值更新'], sampleSQL: "SELECT user_id, age_group, gender, region,\n  skin_type, ltv_score, rfm_segment\nFROM ods.user_raw\nJOIN model.user_ltv ON user_id" },
  'dws_ad_daily': { upstream: ['fact_ad_delivery', 'dim_user'], downstream: ['ads_ai_decision', 'ads_roi_report'], freshness: '< 1h', transformRules: ['日粒度聚合', '人群维度交叉', '环比计算'], sampleSQL: "SELECT date, platform, audience_segment,\n  sum(spend), sum(conversions), avg(cpa)\nFROM dwd.fact_ad_delivery\nJOIN dwd.dim_user ON user_id\nGROUP BY date, platform, audience_segment" },
  'dws_product_daily': { upstream: ['fact_order'], downstream: ['ads_roi_report', 'ads_trend_insight'], freshness: '< 1h', transformRules: ['商品日销聚合', '品类维度汇总', '库存联动'], sampleSQL: "SELECT date, product_id, category,\n  sum(quantity), sum(gmv), count(distinct user_id)\nFROM dwd.fact_order\nGROUP BY date, product_id, category" },
  'dws_kol_daily': { upstream: ['fact_content_perf'], downstream: ['ads_trend_insight'], freshness: '< 1h', transformRules: ['达人日度效果汇总', 'ROI计算', '内容评分'], sampleSQL: "SELECT date, kol_id, platform,\n  sum(gmv_attributed), avg(engagement_rate)\nFROM dwd.fact_content_perf\nGROUP BY date, kol_id, platform" },
  'ads_ai_decision': { upstream: ['dws_ad_daily', 'dim_user'], downstream: ['AI投放决策引擎'], freshness: '< 15min', transformRules: ['特征工程', '模型输入标准化', '决策结果输出'], sampleSQL: "SELECT campaign_id, predicted_cpa, optimal_bid,\n  target_audience_json, confidence_score\nFROM dws.dws_ad_daily\nJOIN model.bid_optimizer ON campaign_id" },
  'ads_roi_report': { upstream: ['dws_ad_daily', 'dws_product_daily'], downstream: ['BI报表系统', '管理层看板'], freshness: '< 15min', transformRules: ['ROI归因计算', '多渠道合并', '同环比指标'], sampleSQL: "SELECT date, channel, campaign_name,\n  spend, gmv, gmv/spend as roi\nFROM dws.dws_ad_daily\nJOIN dws.dws_product_daily ON date, channel" },
  'ads_trend_insight': { upstream: ['dws_product_daily', 'dws_kol_daily'], downstream: ['趋势分析引擎', '选品推荐'], freshness: '< 15min', transformRules: ['趋势检测算法', '热度评分', '成分关联'], sampleSQL: "SELECT category, ingredient, trend_score,\n  growth_rate_7d, top_kol_list\nFROM dws.dws_product_daily\nJOIN dws.dws_kol_daily ON category" },
}

// Quality dimension drill-down
const qualityDimensionDetail: Record<string, {
  domainBreakdown: { domain: string; score: number }[]
  trend7d: { date: string; score: number }[]
  anomalies: { time: string; table: string; desc: string; severity: string }[]
  remediation: string[]
}> = {
  '完整性': {
    domainBreakdown: [
      { domain: '广告投放域', score: 98.8 }, { domain: '电商交易域', score: 99.1 },
      { domain: '内容素材域', score: 97.2 }, { domain: '用户画像域', score: 98.0 },
      { domain: '达人生态域', score: 97.5 }, { domain: '市场情报域', score: 96.8 },
    ],
    trend7d: [
      { date: '03-30', score: 97.8 }, { date: '03-31', score: 98.0 },
      { date: '04-01', score: 97.5 }, { date: '04-02', score: 98.1 },
      { date: '04-03', score: 98.4 }, { date: '04-04', score: 98.0 },
      { date: '04-05', score: 98.2 },
    ],
    anomalies: [
      { time: '14:38', table: 'ods_ad_douyin', desc: 'ad_group_id字段缺失率达2.1%', severity: '中' },
      { time: '10:15', table: 'ods_content_xhs', desc: 'author_id字段存在NULL值(0.8%)', severity: '低' },
    ],
    remediation: [
      '设置NOT NULL约束并配置默认值填充策略',
      '上游API增加字段必填校验',
      '配置实时监控告警, 缺失率>1%立即通知',
      '建立数据修复自动化流程, 从备份源补全',
    ],
  },
  '准确性': {
    domainBreakdown: [
      { domain: '广告投放域', score: 97.5 }, { domain: '电商交易域', score: 98.2 },
      { domain: '内容素材域', score: 96.0 }, { domain: '用户画像域', score: 96.8 },
      { domain: '达人生态域', score: 96.2 }, { domain: '市场情报域', score: 95.5 },
    ],
    trend7d: [
      { date: '03-30', score: 96.5 }, { date: '03-31', score: 96.8 },
      { date: '04-01', score: 96.2 }, { date: '04-02', score: 97.0 },
      { date: '04-03', score: 97.2 }, { date: '04-04', score: 96.9 },
      { date: '04-05', score: 97.1 },
    ],
    anomalies: [
      { time: '11:22', table: 'ods_order_tmall', desc: '订单金额出现负值(-58.00), 疑似数据异常', severity: '高' },
      { time: '09:45', table: 'dws_kol_daily', desc: '粉丝数超出合理范围(>1亿), 可能为爬虫错误', severity: '中' },
    ],
    remediation: [
      '增加数值范围校验规则(金额>=0, 比率0~1)',
      '建立异常值检测模型, 自动标记离群点',
      '配置数据源交叉验证, 多源比对确认',
      '定期执行数据质量审计报告',
    ],
  },
  '及时性': {
    domainBreakdown: [
      { domain: '广告投放域', score: 96.5 }, { domain: '电商交易域', score: 97.0 },
      { domain: '内容素材域', score: 94.8 }, { domain: '用户画像域', score: 95.0 },
      { domain: '达人生态域', score: 94.5 }, { domain: '市场情报域', score: 93.2 },
    ],
    trend7d: [
      { date: '03-30', score: 95.2 }, { date: '03-31', score: 95.5 },
      { date: '04-01', score: 94.8 }, { date: '04-02', score: 95.8 },
      { date: '04-03', score: 96.0 }, { date: '04-04', score: 95.6 },
      { date: '04-05', score: 95.8 },
    ],
    anomalies: [
      { time: '13:15', table: 'ods_order_tmall', desc: '天猫API响应延迟, 数据到达超出SLA(>5min)', severity: '高' },
      { time: '08:30', table: 'ods_kol_fans', desc: '达人粉丝数据同步延迟12分钟', severity: '中' },
    ],
    remediation: [
      '优化API调用策略, 增加并发数和超时重试',
      '部署数据到达监控, SLA超时自动告警',
      '建立数据同步优先级队列, 核心表优先处理',
      '考虑增加数据缓存层减少API依赖',
    ],
  },
  '一致性': {
    domainBreakdown: [
      { domain: '广告投放域', score: 96.8 }, { domain: '电商交易域', score: 97.2 },
      { domain: '内容素材域', score: 95.5 }, { domain: '用户画像域', score: 96.0 },
      { domain: '达人生态域', score: 95.2 }, { domain: '市场情报域', score: 94.8 },
    ],
    trend7d: [
      { date: '03-30', score: 95.8 }, { date: '03-31', score: 96.0 },
      { date: '04-01', score: 95.5 }, { date: '04-02', score: 96.2 },
      { date: '04-03', score: 96.5 }, { date: '04-04', score: 96.0 },
      { date: '04-05', score: 96.2 },
    ],
    anomalies: [
      { time: '09:20', table: 'ads_user_profile', desc: '用户标签在CRM与画像系统间存在冲突(560条)', severity: '低' },
      { time: '07:45', table: 'dws_ad_daily', desc: '广告花费汇总与明细不一致, 差异0.3%', severity: '低' },
    ],
    remediation: [
      '建立主数据管理(MDM)体系, 统一数据标准',
      '配置跨源一致性校验任务, 定期比对',
      '使用Change Data Capture确保数据同步一致',
      '建立数据血缘追踪, 快速定位不一致根因',
    ],
  },
}


// ── Helper ────────────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 95) return '#22c55e'
  if (score >= 90) return '#f59e0b'
  return '#ef4444'
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    '成功': { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={12} /> },
    '运行中': { bg: '#dbeafe', color: '#2563eb', icon: <RefreshCw size={12} style={{ animation: 'spin 2s linear infinite' }} /> },
    '失败': { bg: '#fee2e2', color: '#dc2626', icon: <XCircle size={12} /> },
    '处理中': { bg: '#fef3c7', color: '#d97706', icon: <RefreshCw size={12} /> },
    '已恢复': { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={12} /> },
    '已修复': { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={12} /> },
  }
  const s = map[status] || map['成功']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 12, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      {s.icon} {status}
    </span>
  )
}

function severityBadge(severity: string) {
  const map: Record<string, { bg: string; color: string }> = {
    '高': { bg: '#fee2e2', color: '#dc2626' },
    '中': { bg: '#fef3c7', color: '#d97706' },
    '低': { bg: '#dbeafe', color: '#2563eb' },
  }
  const s = map[severity] || map['低']
  return (
    <span style={{ padding: '2px 10px', borderRadius: 12, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      {severity}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// DrillPanel Component
// ══════════════════════════════════════════════════════════════════════════════
function DrillPanel({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 1000,
          transition: 'opacity 0.2s',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 500,
        background: '#fff', zIndex: 1001, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #e8365d08, #ff7a9508)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{title}</div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid #f0f0f0',
              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#888',
            }}
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {children}
        </div>
      </div>
    </>
  )
}

// Section helper for drill panels
function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#e8365d', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: '#e8365d' }} />
        {title}
      </div>
      {children}
    </div>
  )
}

// Mini card helper
function MiniCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: `${color}08`, borderRadius: 8, padding: '10px 12px', border: `1px solid ${color}20`, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

// Action button helper
function ActionBtn({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
      borderRadius: 8, border: `1px solid ${color}30`, background: `${color}08`,
      color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    }}>
      {icon} {label}
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════
export default function DataWarehouse() {
  const [activeTab, setActiveTab] = useState(0)
  const [expandedDomains, setExpandedDomains] = useState<Set<number>>(new Set())

  // Drill-down state
  const [drillType, setDrillType] = useState<string | null>(null)
  const [drillKey, setDrillKey] = useState<string>('')

  useRegisterAIConfig(warehouseAIGroups, warehouseLearningStatus, '数据仓库')

  const toggleDomain = (idx: number) => {
    setExpandedDomains(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const [actionMsg, setActionMsg] = useState<{text: string; color: string}|null>(null)
  const triggerMsg = (text: string, color = '#22c55e') => {
    setActionMsg({text, color})
    setTimeout(() => setActionMsg(null), 3000)
  }

  const openDrill = (type: string, key: string) => {
    setDrillType(type)
    setDrillKey(key)
  }
  const closeDrill = () => { setDrillType(null); setDrillKey('') }

  // ── Drill Panels Content ──

  const renderKpiDrill = () => {
    if (drillKey === '数据总量') return (
      <>
        <PanelSection title="各数据域数据量分布">
          {kpiDomainBreakdown.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 100, fontSize: 12, color: '#666', flexShrink: 0 }}>{d.domain}</div>
              <div style={{ flex: 1, height: 20, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${d.pct}%`, height: '100%', background: d.color, borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', minWidth: 60, textAlign: 'right' }}>{d.count}</div>
              <div style={{ fontSize: 11, color: '#888', minWidth: 36, textAlign: 'right' }}>{d.pct}%</div>
            </div>
          ))}
        </PanelSection>
        <PanelSection title="日增长趋势 (万条)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={kpiDailyGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="growth" fill="#e8365d" radius={[4, 4, 0, 0]} name="日增长(万)" />
            </BarChart>
          </ResponsiveContainer>
        </PanelSection>
        <PanelSection title="存储概览">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniCard label="总存储" value="9.7TB" color="#e8365d" />
            <MiniCard label="日均增长" value="42GB" color="#8b5cf6" />
            <MiniCard label="压缩率" value="3.2:1" color="#22c55e" />
            <MiniCard label="冷数据占比" value="38%" color="#f59e0b" />
          </div>
        </PanelSection>
      </>
    )
    if (drillKey === '今日入库') return (
      <>
        <PanelSection title="今日按小时入库量 (万条)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kpiHourlyIngestion} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}万`, '入库量']} />
              <Bar dataKey="volume" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelSection>
        <PanelSection title="各数据源入库量">
          {kpiSourceVolume.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 10px', background: '#fafafa', borderRadius: 8 }}>
              <div style={{ flex: 1, fontSize: 13, color: '#1a1a2e', fontWeight: 500 }}>{s.source}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6' }}>{s.volume}</div>
              <div style={{ fontSize: 11, color: '#888', minWidth: 36 }}>{s.pct}%</div>
            </div>
          ))}
        </PanelSection>
        <PanelSection title="入库状态">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniCard label="当前速率" value="32万/min" color="#8b5cf6" />
            <MiniCard label="峰值速率" value="48万/min" color="#e8365d" />
            <MiniCard label="延迟告警" value="1次" color="#f59e0b" />
            <MiniCard label="数据去重" value="0.3%" color="#22c55e" />
          </div>
        </PanelSection>
      </>
    )
    if (drillKey === '数据表数量') return (
      <>
        <PanelSection title="各数据域表分布与健康状态">
          {kpiTablesByDomain.map((d, i) => (
            <div key={i} style={{ padding: '10px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{d.domain}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#e8365d' }}>{d.tables}张</span>
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                <span style={{ color: '#22c55e' }}>正常 {d.healthy}</span>
                <span style={{ color: '#f59e0b' }}>告警 {d.warning}</span>
                <span style={{ color: '#ef4444' }}>异常 {d.error}</span>
              </div>
              <div style={{ marginTop: 6, height: 4, background: '#eee', borderRadius: 2, display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${(d.healthy / d.tables) * 100}%`, background: '#22c55e' }} />
                <div style={{ width: `${(d.warning / d.tables) * 100}%`, background: '#f59e0b' }} />
                <div style={{ width: `${(d.error / d.tables) * 100}%`, background: '#ef4444' }} />
              </div>
            </div>
          ))}
        </PanelSection>
        <PanelSection title="汇总">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <MiniCard label="正常" value="122" color="#22c55e" />
            <MiniCard label="告警" value="6" color="#f59e0b" />
            <MiniCard label="异常" value="1" color="#ef4444" />
          </div>
        </PanelSection>
      </>
    )
    if (drillKey === 'ETL任务') return (
      <>
        <PanelSection title="任务状态分布">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniCard label="运行中" value={String(kpiEtlSummary.running)} color="#2563eb" />
            <MiniCard label="今日成功" value={String(kpiEtlSummary.success)} color="#22c55e" />
            <MiniCard label="今日失败" value={String(kpiEtlSummary.failed)} color="#ef4444" />
            <MiniCard label="队列等待" value={String(kpiEtlSummary.queued)} color="#f59e0b" />
          </div>
        </PanelSection>
        <PanelSection title="最近失败任务">
          {kpiEtlSummary.recentFailures.map((f, i) => (
            <div key={i} style={{ padding: '10px 12px', background: '#fef2f2', borderRadius: 8, marginBottom: 8, border: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>{f.name}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{f.time}</span>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>{f.error}</div>
            </div>
          ))}
        </PanelSection>
        <PanelSection title="队列深度 (按优先级)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[{ level: 'P0 (实时)', count: 3, color: '#ef4444' }, { level: 'P1 (高优)', count: 2, color: '#f59e0b' }, { level: 'P2 (常规)', count: 3, color: '#2563eb' }].map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: '#fafafa', borderRadius: 6 }}>
                <span style={{ fontSize: 12, color: q.color, fontWeight: 600, minWidth: 80 }}>{q.level}</span>
                <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 3 }}>
                  <div style={{ width: `${(q.count / 8) * 100}%`, height: '100%', background: q.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{q.count}</span>
              </div>
            ))}
          </div>
        </PanelSection>
      </>
    )
    return null
  }

  const renderDomainDrill = () => {
    const detail = domainDetailData[drillKey]
    if (!detail) return <div style={{ color: '#888', fontSize: 13 }}>暂无详情数据</div>
    return (
      <>
        <PanelSection title="数据表列表">
          {detail.tables.map((t, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); openDrill('table', t.name) }}
              style={{ padding: '10px 12px', background: '#fafafa', borderRadius: 8, marginBottom: 8, cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#e8365d40')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileText size={12} color="#e8365d" /> {t.name}
                </span>
                <ChevronRight size={14} color="#ccc" />
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#888' }}>
                <span>{t.rows}条</span>
                <span>更新: {t.updateTime}</span>
                <span style={{ color: scoreColor(t.quality) }}>质量: {t.quality}%</span>
                <span>{t.storage}</span>
                <span>查询: {t.hotQueries}/h</span>
              </div>
            </div>
          ))}
        </PanelSection>
        <PanelSection title="Schema 预览">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#888', fontWeight: 500 }}>字段名</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#888', fontWeight: 500 }}>类型</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: '#888', fontWeight: 500 }}>说明</th>
                </tr>
              </thead>
              <tbody>
                {detail.schemaPreview.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                    <td style={{ padding: '5px 8px', fontFamily: 'monospace', color: '#e8365d', fontWeight: 500 }}>{c.column}</td>
                    <td style={{ padding: '5px 8px', fontFamily: 'monospace', color: '#666' }}>{c.type}</td>
                    <td style={{ padding: '5px 8px', color: '#888' }}>{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelSection>
        <PanelSection title="存储与查询">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniCard label="总存储" value={detail.storageTotal} color="#e8365d" />
            <MiniCard label="总查询量" value={`${detail.tables.reduce((s, t) => s + t.hotQueries, 0).toLocaleString()}/h`} color="#8b5cf6" />
          </div>
        </PanelSection>
      </>
    )
  }

  const renderTableDrill = () => {
    const detail = tableDetailData[drillKey]
    if (!detail) return (
      <div style={{ color: '#888', fontSize: 13 }}>
        <PanelSection title="基本信息">
          <div style={{ padding: '10px 12px', background: '#fafafa', borderRadius: 8, fontSize: 12, color: '#666' }}>
            表名: <span style={{ fontFamily: 'monospace', color: '#e8365d', fontWeight: 600 }}>{drillKey}</span>
          </div>
        </PanelSection>
        <PanelSection title="字段列表">
          <div style={{ fontSize: 12, color: '#888' }}>点击上级域卡片中的核心表可查看更详细信息</div>
        </PanelSection>
      </div>
    )
    return (
      <>
        <PanelSection title="字段列表">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '5px 6px', color: '#888', fontWeight: 500 }}>字段名</th>
                  <th style={{ textAlign: 'left', padding: '5px 6px', color: '#888', fontWeight: 500 }}>类型</th>
                  <th style={{ textAlign: 'left', padding: '5px 6px', color: '#888', fontWeight: 500 }}>可空</th>
                  <th style={{ textAlign: 'left', padding: '5px 6px', color: '#888', fontWeight: 500 }}>说明</th>
                </tr>
              </thead>
              <tbody>
                {detail.columns.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                    <td style={{ padding: '4px 6px', fontFamily: 'monospace', color: '#e8365d', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '4px 6px', fontFamily: 'monospace', color: '#666', fontSize: 11 }}>{c.type}</td>
                    <td style={{ padding: '4px 6px' }}>{c.nullable ? <span style={{ color: '#f59e0b' }}>Y</span> : <span style={{ color: '#22c55e' }}>N</span>}</td>
                    <td style={{ padding: '4px 6px', color: '#888' }}>{c.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelSection>
        <PanelSection title="样本数据 (5行)">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: 11, borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {Object.keys(detail.sampleData[0]).map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '4px 8px', color: '#888', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.sampleData.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} style={{ padding: '4px 8px', color: '#1a1a2e', fontFamily: 'monospace' }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelSection>
        <PanelSection title="数据血缘">
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>上游来源</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {detail.lineage.upstream.map((u, i) => (
                <span key={i} style={{ padding: '3px 10px', borderRadius: 6, background: '#e8365d10', color: '#e8365d', fontSize: 11, fontFamily: 'monospace', fontWeight: 500 }}>{u}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>下游消费</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {detail.lineage.downstream.map((d, i) => (
                <span key={i} style={{ padding: '3px 10px', borderRadius: 6, background: '#22c55e10', color: '#22c55e', fontSize: 11, fontFamily: 'monospace', fontWeight: 500 }}>{d}</span>
              ))}
            </div>
          </div>
        </PanelSection>
        <PanelSection title="查询与归属">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MiniCard label="查询频率" value={detail.queryFreq} color="#8b5cf6" />
            <MiniCard label="负责人" value={detail.owner.split(' - ')[1]} color="#e8365d" />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>归属: {detail.owner}</div>
        </PanelSection>
      </>
    )
  }

  const renderEtlDrill = () => {
    const detail = etlDetailData[drillKey]
    if (!detail) {
      // Generic fallback for tasks without detailed mock data
      return (
        <>
          <PanelSection title="DAG 执行流程">
            {['数据抽取', '格式清洗', '维度转换', '数据加载', '质量校验'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: '#22c55e15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={12} color="#22c55e" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{step}</div>
                </div>
              </div>
            ))}
          </PanelSection>
          <PanelSection title="手动操作">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <ActionBtn icon={<Play size={12} />} label="立即执行" color="#22c55e" onClick={() => triggerMsg('▶️ 任务已加入执行队列，预计1-3分钟完成')} />
              <ActionBtn icon={<Pause size={12} />} label="暂停" color="#f59e0b" onClick={() => triggerMsg('⏸ 任务已暂停，当前批次执行完毕后停止', '#f59e0b')} />
              <ActionBtn icon={<Search size={12} />} label="查看配置" color="#2563eb" onClick={() => triggerMsg('📋 配置信息：调度周期 每日03:00, 超时 300s, 重试 3次', '#3b82f6')} />
              <ActionBtn icon={<RotateCw size={12} />} label="重跑" color="#e8365d" onClick={() => triggerMsg('🔄 任务重跑中...历史数据将从昨日00:00重新计算', '#ef4444')} />
            </div>
            {actionMsg && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${actionMsg.color}12`, border: `1px solid ${actionMsg.color}30`, fontSize: 12, color: actionMsg.color, fontWeight: 600 }}>
                {actionMsg.text}
              </div>
            )}
          </PanelSection>
        </>
      )
    }
    return (
      <>
        <PanelSection title="DAG 执行流程">
          {detail.dagSteps.map((step, i) => {
            const isComplete = step.status === '完成'
            const isRunning = step.status === '运行中'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: isComplete ? '#22c55e15' : isRunning ? '#2563eb15' : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isComplete ? <CheckCircle size={12} color="#22c55e" /> : isRunning ? <RefreshCw size={12} color="#2563eb" style={{ animation: 'spin 2s linear infinite' }} /> : <Clock size={12} color="#ccc" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{step.step}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>{step.duration}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{step.desc}</div>
                </div>
              </div>
            )
          })}
        </PanelSection>
        <PanelSection title="执行历史 (最近10次)">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  {['时间', '状态', '耗时', '数据量'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '4px 6px', color: '#888', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.history.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                    <td style={{ padding: '4px 6px', color: '#888' }}>{h.time}</td>
                    <td style={{ padding: '4px 6px' }}>{statusBadge(h.status)}</td>
                    <td style={{ padding: '4px 6px', color: '#888' }}>{h.duration}</td>
                    <td style={{ padding: '4px 6px', color: '#1a1a2e', fontWeight: 500 }}>{h.rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelSection>
        <PanelSection title="错误日志">
          {detail.errorLogs.map((log, i) => (
            <div key={i} style={{
              padding: '6px 10px', marginBottom: 4, borderRadius: 6, fontSize: 11, fontFamily: 'monospace',
              background: log.level === 'ERROR' ? '#fef2f2' : log.level === 'WARN' ? '#fffbeb' : '#f0f9ff',
              color: log.level === 'ERROR' ? '#dc2626' : log.level === 'WARN' ? '#d97706' : '#2563eb',
            }}>
              <span style={{ opacity: 0.7 }}>[{log.time}]</span> <span style={{ fontWeight: 600 }}>[{log.level}]</span> {log.message}
            </div>
          ))}
        </PanelSection>
        <PanelSection title="每次运行数据量 (万条)">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={detail.volumePerRun} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="run" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v}万`, '数据量']} />
              <Bar dataKey="volume" fill="#ff7a95" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </PanelSection>
        <PanelSection title="性能趋势 (近7日平均耗时/分)">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={detail.perfTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit="min" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="duration" stroke="#e8365d" strokeWidth={2} dot={{ r: 3 }} name="耗时(min)" />
            </LineChart>
          </ResponsiveContainer>
        </PanelSection>
        <PanelSection title="手动操作">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <ActionBtn icon={<Play size={12} />} label="立即执行" color="#22c55e" onClick={() => triggerMsg('▶️ 任务已加入执行队列，预计1-3分钟完成')} />
            <ActionBtn icon={<Pause size={12} />} label="暂停" color="#f59e0b" onClick={() => triggerMsg('⏸ 任务已暂停，当前批次执行完毕后停止', '#f59e0b')} />
            <ActionBtn icon={<Search size={12} />} label="查看配置" color="#2563eb" onClick={() => triggerMsg('📋 配置信息：调度周期 每日03:00, 超时 300s, 重试 3次', '#3b82f6')} />
            <ActionBtn icon={<RotateCw size={12} />} label="重跑" color="#e8365d" onClick={() => triggerMsg('🔄 任务重跑中...历史数据将从昨日00:00重新计算', '#ef4444')} />
          </div>
          {actionMsg && (
            <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 7, background: `${actionMsg.color}12`, border: `1px solid ${actionMsg.color}30`, fontSize: 12, color: actionMsg.color, fontWeight: 600 }}>
              {actionMsg.text}
            </div>
          )}
        </PanelSection>
      </>
    )
  }

  const renderLineageDrill = () => {
    const detail = lineageDetailData[drillKey]
    if (!detail) return <div style={{ color: '#888', fontSize: 13 }}>暂无 "{drillKey}" 的血缘详情</div>
    return (
      <>
        <PanelSection title="上游数据源">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {detail.upstream.map((u, i) => (
              <span key={i} onClick={() => openDrill('lineage', u)} style={{ padding: '5px 12px', borderRadius: 6, background: '#e8365d10', color: '#e8365d', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid #e8365d20' }}>{u}</span>
            ))}
          </div>
        </PanelSection>
        <PanelSection title="下游消费者">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {detail.downstream.map((d, i) => (
              <span key={i} onClick={() => openDrill('lineage', d)} style={{ padding: '5px 12px', borderRadius: 6, background: '#22c55e10', color: '#22c55e', fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid #22c55e20' }}>{d}</span>
            ))}
          </div>
        </PanelSection>
        <PanelSection title="数据新鲜度">
          <MiniCard label="延迟" value={detail.freshness} color="#8b5cf6" />
        </PanelSection>
        <PanelSection title="转换规则">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {detail.transformRules.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#fafafa', borderRadius: 6 }}>
                <ArrowRight size={10} color="#e8365d" />
                <span style={{ fontSize: 12, color: '#666' }}>{r}</span>
              </div>
            ))}
          </div>
        </PanelSection>
        <PanelSection title="示例SQL/逻辑">
          <pre style={{
            background: '#1a1a2e', color: '#e8365d', padding: 14, borderRadius: 8,
            fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5,
            overflowX: 'auto',
          }}>
            {detail.sampleSQL}
          </pre>
        </PanelSection>
      </>
    )
  }

  const renderQualityDrill = () => {
    const detail = qualityDimensionDetail[drillKey]
    if (!detail) return <div style={{ color: '#888', fontSize: 13 }}>暂无 "{drillKey}" 的质量详情</div>
    return (
      <>
        <PanelSection title="各数据域评分">
          {detail.domainBreakdown.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 80, fontSize: 12, color: '#666', flexShrink: 0 }}>{d.domain}</div>
              <div style={{ flex: 1, height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${d.score}%`, height: '100%', background: scoreColor(d.score), borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(d.score), minWidth: 45, textAlign: 'right' }}>{d.score}%</div>
            </div>
          ))}
        </PanelSection>
        <PanelSection title="近7日趋势">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={detail.trend7d} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[93, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v}%`, drillKey]} />
              <Line type="monotone" dataKey="score" stroke="#e8365d" strokeWidth={2} dot={{ r: 3, fill: '#e8365d' }} />
            </LineChart>
          </ResponsiveContainer>
        </PanelSection>
        <PanelSection title="异常检测结果">
          {detail.anomalies.length === 0 ? (
            <div style={{ fontSize: 12, color: '#22c55e', padding: '8px 10px', background: '#dcfce7', borderRadius: 6 }}>暂无异常</div>
          ) : detail.anomalies.map((a, i) => (
            <div key={i} style={{ padding: '8px 10px', background: '#fafafa', borderRadius: 6, marginBottom: 6, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8365d', fontWeight: 500 }}>{a.table}</span>
                <span style={{ fontSize: 11, color: '#888' }}>{a.time}</span>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{a.desc}</div>
              {severityBadge(a.severity)}
            </div>
          ))}
        </PanelSection>
        <PanelSection title="修复建议">
          {detail.remediation.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: '#e8365d10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#e8365d' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </PanelSection>
      </>
    )
  }

  // Determine drill panel title and content
  const getDrillTitle = () => {
    if (drillType === 'kpi') return `KPI 详情 - ${drillKey}`
    if (drillType === 'domain') return `数据域详情 - ${drillKey}`
    if (drillType === 'table') return `数据表详情 - ${drillKey}`
    if (drillType === 'etl') return `ETL任务详情 - ${drillKey}`
    if (drillType === 'lineage') return `血缘详情 - ${drillKey}`
    if (drillType === 'quality') return `质量维度 - ${drillKey}`
    return ''
  }

  const getDrillContent = () => {
    if (drillType === 'kpi') return renderKpiDrill()
    if (drillType === 'domain') return renderDomainDrill()
    if (drillType === 'table') return renderTableDrill()
    if (drillType === 'etl') return renderEtlDrill()
    if (drillType === 'lineage') return renderLineageDrill()
    if (drillType === 'quality') return renderQualityDrill()
    return null
  }

  // ── Render Tab 1: 数据资产总览 ──
  const renderAssetOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Data Volume Trend */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1a1a2e' }}>数据增长趋势 (近7日)</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dataVolumeTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} unit="亿" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} unit="万" />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="total" stroke="#e8365d" strokeWidth={2} name="数据总量(亿条)" dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="newData" stroke="#8b5cf6" strokeWidth={2} name="日新增(万条)" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Domain Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 16 }}>
      {dataDomains.map((domain, i) => {
        const expanded = expandedDomains.has(i)
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: expanded ? '0 4px 16px rgba(0,0,0,0.08)' : 'none' }}>
            <div
              onClick={() => toggleDomain(i)}
              style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: expanded ? '1px solid #f0f0f0' : 'none' }}
            >
              <div
                onClick={(e) => { e.stopPropagation(); openDrill('domain', domain.name) }}
                style={{ width: 40, height: 40, borderRadius: 10, background: `${domain.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: domain.color, cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {domain.icon}
              </div>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); openDrill('domain', domain.name) }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{domain.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {domain.tableCount}张表 · {domain.rowCount}条 · 更新于{domain.lastUpdate}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#888' }}>质量评分</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(domain.qualityScore) }}>
                    {domain.qualityScore}%
                  </div>
                </div>
                {expanded ? <ChevronDown size={16} color="#888" /> : <ChevronRight size={16} color="#888" />}
              </div>
            </div>
            {expanded && (
              <div style={{ padding: '12px 20px 16px' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: '#888', fontWeight: 500 }}>数据表</th>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: '#888', fontWeight: 500 }}>关键字段</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domain.tables.map((t, j) => (
                      <tr
                        key={j}
                        style={{ borderBottom: '1px solid #fafafa', cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => openDrill('table', t.name)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '6px 8px', color: '#1a1a2e', fontWeight: 500 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FileText size={12} color={domain.color} /> {t.name}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', color: '#666', fontSize: 12 }}>{t.keyFields}</td>
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
    </div>
  )

  // ── Render Tab 2: ETL任务管理 ──
  const renderETL = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ETL Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {etlStats.map((stat, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0', textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            onClick={() => openDrill('kpi', 'ETL任务')}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(232,54,93,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ETL Hourly Chart */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1a1a2e' }}>今日ETL执行统计 (按小时)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={etlHourlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="success" fill="#22c55e" name="成功" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fail" fill="#ef4444" name="失败" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pipeline Steps */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1a1a2e' }}>ETL Pipeline</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {pipelineSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '10px 20px', borderRadius: 8,
                background: `${COLORS[i]}15`, border: `1px solid ${COLORS[i]}30`,
                color: COLORS[i], fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {step}
              </div>
              {i < pipelineSteps.length - 1 && (
                <ArrowRight size={18} color="#ccc" style={{ margin: '0 8px', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task Table */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0', overflowX: 'auto' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1a1a2e' }}>任务列表</div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              {['任务名', '源表', '目标表', '调度频率', '上次运行', '耗时', '状态', '数据量'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#888', fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {etlTasks.map((task, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => openDrill('etl', task.name)}
                onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px', fontWeight: 600, color: '#1a1a2e' }}>{task.name}</td>
                <td style={{ padding: '10px', color: '#666', fontFamily: 'monospace', fontSize: 12 }}>{task.source}</td>
                <td style={{ padding: '10px', color: '#666', fontFamily: 'monospace', fontSize: 12 }}>{task.target}</td>
                <td style={{ padding: '10px', color: '#888' }}>{task.frequency}</td>
                <td style={{ padding: '10px', color: '#888' }}>{task.lastRun}</td>
                <td style={{ padding: '10px', color: '#888' }}>{task.duration}</td>
                <td style={{ padding: '10px' }}>{statusBadge(task.status)}</td>
                <td style={{ padding: '10px', color: '#1a1a2e', fontWeight: 500 }}>{task.dataVolume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── Render Tab 3: 数据血缘 ──
  const renderLineage = () => (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #f0f0f0' }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 24, color: '#1a1a2e' }}>数据血缘关系图</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        {lineageLayers.map((layer, li) => (
          <div key={li}>
            {/* Layer Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: layer.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: layer.color }}>{layer.name}</span>
            </div>
            {/* Items */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginLeft: 16, marginBottom: 4 }}>
              {layer.items.map((item, ii) => (
                <div
                  key={ii}
                  onClick={() => openDrill('lineage', item)}
                  style={{
                    padding: '8px 16px', borderRadius: 8,
                    background: `${layer.color}10`, border: `1px solid ${layer.color}30`,
                    color: layer.color, fontSize: 13, fontWeight: 500,
                    fontFamily: li >= 1 ? 'monospace' : 'inherit',
                    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${layer.color}25` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {item}
                </div>
              ))}
            </div>
            {/* Connector Arrow */}
            {li < lineageLayers.length - 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0', marginLeft: 16 }}>
                <div style={{ width: 2, height: 16, background: 'linear-gradient(to bottom, #ddd, #bbb)' }} />
                <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid #bbb' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ marginTop: 24, padding: 16, background: '#fafafa', borderRadius: 8, fontSize: 12, color: '#888' }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#666' }}>数据流转说明</div>
        <div>数据源层 → ODS层(原始数据1:1映射) → DWD层(清洗/拆分/标准化) → DWS层(多维聚合) → ADS层(服务AI模型与报表)</div>
      </div>

      {/* Layer Statistics */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {[
          { layer: '数据源层', tables: 24, rows: '28.6亿', freshness: '实时', color: '#e8365d' },
          { layer: 'ODS层', tables: 48, rows: '28.6亿', freshness: '< 5min', color: '#ff7a95' },
          { layer: 'DWD层', tables: 62, rows: '22.4亿', freshness: '< 15min', color: '#8b5cf6' },
          { layer: 'DWS层', tables: 38, rows: '3.2亿', freshness: '< 1h', color: '#f59e0b' },
          { layer: 'ADS层', tables: 18, rows: '0.8亿', freshness: '< 15min', color: '#22c55e' },
        ].map((l, i) => (
          <div key={i} style={{
            background: `${l.color}08`, borderRadius: 10, padding: 14,
            border: `1px solid ${l.color}20`, textAlign: 'center', cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${l.color}20` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: l.color, marginBottom: 8 }}>{l.layer}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{l.tables}</span> 张表
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{l.rows}</span> 条
            </div>
            <div style={{ fontSize: 11, color: '#888' }}>
              延迟: <span style={{ color: l.color, fontWeight: 600 }}>{l.freshness}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Render Tab 4: 数据质量 ──
  const renderQuality = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overall Score */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>综合数据质量评分</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#22c55e' }}>96.8%</div>
      </div>

      {/* 4 dimension cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {qualityDimensions.map((dim, i) => (
          <div
            key={i}
            onClick={() => openDrill('quality', dim.name)}
            style={{
              background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0',
              textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,54,93,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ color: scoreColor(dim.score), marginBottom: 8 }}>{dim.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: scoreColor(dim.score) }}>{dim.score}%</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginTop: 4 }}>{dim.name}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{dim.desc}</div>
          </div>
        ))}
      </div>

      {/* Quality BarChart by domain */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1a1a2e' }}>各数据域质量评分对比</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={qualityByDomain} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
            <YAxis domain={[88, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, '质量评分']}
              contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {qualityByDomain.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quality Trend */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1a1a2e' }}>质量评分趋势 (近7日)</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={qualityTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[94, 98]} tick={{ fontSize: 12 }} unit="%" />
            <Tooltip
              formatter={(value: number) => [`${value}%`, '质量评分']}
              contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
            />
            <Line type="monotone" dataKey="score" stroke="#e8365d" strokeWidth={2} name="综合质量评分" dot={{ r: 4, fill: '#e8365d' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quality alert table */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0', overflowX: 'auto' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1a1a2e' }}>质量告警记录</div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
              {['告警时间', '数据表', '问题类型', '严重程度', '影响范围', '状态'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#888', fontWeight: 500, fontSize: 12 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {qualityAlerts.map((alert, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => openDrill('table', alert.table)}
                onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '10px', color: '#888' }}>{alert.time}</td>
                <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: 12, color: '#1a1a2e', fontWeight: 500 }}>{alert.table}</td>
                <td style={{ padding: '10px', color: '#666' }}>{alert.issue}</td>
                <td style={{ padding: '10px' }}>{severityBadge(alert.severity)}</td>
                <td style={{ padding: '10px', color: '#666', fontSize: 12 }}>{alert.scope}</td>
                <td style={{ padding: '10px' }}>{statusBadge(alert.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>数据仓库</h1>
        <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
          数据采集中心 → <span style={{ color: '#e8365d', fontWeight: 700 }}>数据仓库</span> → AI模型中心 → AI决策中心
        </p>
      </div>

      {/* Model Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="AnomalyDetector-LSTM" color="#e8365d" />
        <ModelBadge name="ChurnPredictor-GBM" color="#e8365d" />
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            onClick={() => openDrill('kpi', kpi.label)}
            style={{
              background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0',
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
              transition: 'box-shadow 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(232,54,93,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
              <kpi.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>{kpi.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', marginTop: 2 }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #f0f0f0', width: 'fit-content' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
              background: activeTab === i ? '#e8365d' : 'transparent',
              color: activeTab === i ? '#fff' : '#666',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && renderAssetOverview()}
      {activeTab === 1 && renderETL()}
      {activeTab === 2 && renderLineage()}
      {activeTab === 3 && renderQuality()}

      {/* Drill-down Panel */}
      <DrillPanel open={drillType !== null} title={getDrillTitle()} onClose={closeDrill}>
        {getDrillContent()}
      </DrillPanel>

      {/* Spin animation for running status */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
