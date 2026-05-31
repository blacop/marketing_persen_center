import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, Sparkles, Banknote, Users, Radio, Heart,
  Brain, TrendingUp, ChevronDown, ChevronUp, Check,
  Clock, Zap, BarChart3, Loader2, AlertCircle,
  ArrowUpRight, Shield, Database, Activity, Bot,
  X, Eye, ArrowRight, ExternalLink, Globe
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = 'urgent' | 'high' | 'medium' | 'low'
type Category = '投放优化' | '素材策略' | '预算调控' | '达人种草' | '直播运营' | '私域转化' | '国际投放'

interface Decision {
  id: string
  title: string
  category: Category
  priority: Priority
  evidence: string
  aiAction: string
  impact: string
  confidence: number
  timestamp: string
}

// ─── Priority Metadata ───────────────────────────────────────────────────────
const priorityMeta: Record<Priority, { label: string; color: string; bg: string; stripe: string }> = {
  urgent: { label: '紧急', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', stripe: '#ef4444' },
  high:   { label: '高',   color: '#f97316', bg: 'rgba(249,115,22,0.12)', stripe: '#f97316' },
  medium: { label: '中',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', stripe: '#3b82f6' },
  low:    { label: '低',   color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', stripe: '#9ca3af' },
}

// ─── Category Metadata ───────────────────────────────────────────────────────
const categoryMeta: Record<Category, { icon: React.ElementType; color: string }> = {
  投放优化: { icon: Target,   color: '#e8365d' },
  素材策略: { icon: Sparkles, color: '#ec4899' },
  预算调控: { icon: Banknote, color: '#f59e0b' },
  达人种草: { icon: Users,    color: '#06b6d4' },
  直播运营: { icon: Radio,    color: '#10b981' },
  私域转化: { icon: Heart,    color: '#8b5cf6' },
  国际投放: { icon: Globe,    color: '#0ea5e9' },
}

// ─── Mock Decision Data ──────────────────────────────────────────────────────
const decisions: Decision[] = [
  {
    id: 'DC-001',
    title: '抖音唇釉系列CPA飙升42%，建议立即调整出价策略',
    category: '投放优化',
    priority: 'urgent',
    evidence: '过去4小时唇釉系列CPA从¥18升至¥25.6，分析发现竞品完美日记正在做大促抢量，导致流量成本上涨',
    aiAction: '① 唇釉系列出价从¥25.6降至¥19 ② 同时切换至oCPM智能出价 ③ 定向调整为"美妆兴趣+竞品粉丝"人群包',
    impact: '预计节省 ¥6,800/日',
    confidence: 96,
    timestamp: '3分钟前',
  },
  {
    id: 'DC-002',
    title: '小红书爆文素材CTR骤降，素材疲劳需紧急更换',
    category: '素材策略',
    priority: 'urgent',
    evidence: '小红书"玻尿酸精华测评"笔记素材CTR从5.8%降至1.9%，已投放15天，互动率下降72%',
    aiAction: '① 暂停当前疲劳素材 ② 启用AI生成的3组新素材(成分科普型/对比测评型/使用教程型) ③ 设置48小时A/B测试',
    impact: '预计CTR恢复至4.5%+',
    confidence: 91,
    timestamp: '5分钟前',
  },
  {
    id: 'DC-003',
    title: '快手底妆系列ROI突破4.2x，建议加大预算抢量',
    category: '预算调控',
    priority: 'high',
    evidence: '连续5天ROI > 3.5x，目标人群(25-35女性)未饱和，快手粉底液品类竞争度本周下降18%',
    aiAction: '① 快手底妆日预算从¥8,000提至¥12,000 ② 分3次阶梯加量(每次+¥1,300) ③ 同时扩展相似人群包',
    impact: '预计增加GMV ¥28,000/日',
    confidence: 89,
    timestamp: '8分钟前',
  },
  {
    id: 'DC-004',
    title: '达人"成分研究社"种草视频转化率是均值3.6倍，建议追加合作',
    category: '达人种草',
    priority: 'high',
    evidence: '该达人近期3条种草视频平均CTR 8.2%, 归因GMV ¥12.8万, 粉丝画像与品牌高度吻合(25-35女性/一线城市)',
    aiAction: '① 追加3条视频合作(预算¥4.5万) ② 申请品牌专属优惠券绑定 ③ 同步在小红书做内容二创',
    impact: '预计归因GMV ¥18万+',
    confidence: 87,
    timestamp: '12分钟前',
  },
  {
    id: 'DC-005',
    title: '今晚8点直播间流量预测峰值，建议提前加投引流',
    category: '直播运营',
    priority: 'high',
    evidence: '根据历史数据和今日种草内容热度，预测今晚20:00-22:00直播间在线人数将达峰值8,500+，但当前引流预算不足',
    aiAction: '① 19:30开始投放直播间引流广告(预算¥5,000) ② 主推唇釉丝绒#105(库存充足) ③ 设置直播间专属券',
    impact: '预计直播GMV提升¥15,000',
    confidence: 85,
    timestamp: '15分钟前',
  },
  {
    id: 'DC-006',
    title: '抖音下午14-16时段转化率是白天2.8倍',
    category: '投放优化',
    priority: 'medium',
    evidence: '30天数据分析：14:00-16:00 CVR 6.2%, 其他时段平均2.2%，该时段用户多为午休浏览美妆内容',
    aiAction: '① 调整分时出价策略：午后高峰+35%出价 ② 凌晨0-6点降低50% ③ 素材匹配"午间种草"标签',
    impact: '预计节省 ¥4,200/日',
    confidence: 92,
    timestamp: '20分钟前',
  },
  {
    id: 'DC-007',
    title: '私域社群沉睡用户唤醒窗口期到来',
    category: '私域转化',
    priority: 'medium',
    evidence: '8,400名沉睡会员(30天未购买)中，68%上次购买为唇釉/眼影，新品上市节点适合唤醒',
    aiAction: '① 向沉睡用户推送新品上市通知+专属8折券 ② 配合企微1v1触达 ③ 设置7天有效期制造紧迫感',
    impact: '预计唤醒率18%，带来GMV ¥6.2万',
    confidence: 84,
    timestamp: '25分钟前',
  },
  {
    id: 'DC-008',
    title: '眼影盘库存充足(68天可售)，建议启动清仓加投',
    category: '预算调控',
    priority: 'medium',
    evidence: '十色眼影盘库存6,500件，日销95件，可售68天，远超安全库存，占用资金¥45万',
    aiAction: '① 启动"限时特惠"清仓投放(9折) ② 在抖音+快手同步开启直播专场 ③ 搭配唇釉做组合装',
    impact: '预计30天消化库存3,000件',
    confidence: 88,
    timestamp: '30分钟前',
  },
  {
    id: 'DC-009',
    title: '竞品花西子暂停小红书投放，建议趁机抢量',
    category: '投放优化',
    priority: 'medium',
    evidence: '监测到花西子24小时内小红书广告量下降90%，可能在调整策略或更换服务商',
    aiAction: '① 小红书聚光出价提高8%抢占空白流量 ② 增加底妆对比类素材(vs竞品) ③ 为期5天测试',
    impact: '预计获取竞品流失流量 3,000+/日',
    confidence: 82,
    timestamp: '35分钟前',
  },
  {
    id: 'DC-010',
    title: '烟酰胺面膜小红书种草→天猫购买转化链路效率提升',
    category: '达人种草',
    priority: 'medium',
    evidence: '归因数据显示：小红书种草笔记→天猫搜索→购买的转化率从0.8%提升至1.5%，主要得益于成分科普类内容',
    aiAction: '① 增加10篇成分科普类种草笔记投放 ② 天猫搜索词竞价增加"烟酰胺面膜"关键词 ③ 笔记评论区引导搜索',
    impact: '预计增加天猫GMV ¥8,500/日',
    confidence: 86,
    timestamp: '42分钟前',
  },
  {
    id: 'DC-011',
    title: '微信视频号直播流量成本低于抖音35%，建议扩展',
    category: '直播运营',
    priority: 'low',
    evidence: '视频号直播测试数据：UV价值¥85(抖音¥72)，引流CPC ¥0.8(抖音¥1.2)，但流量规模较小',
    aiAction: '① 视频号直播频率从每周2场增至4场 ② 日预算从¥2,000增至¥5,000 ③ 测试私域导流模式',
    impact: '预计新增月GMV ¥12万',
    confidence: 78,
    timestamp: '1小时前',
  },
  {
    id: 'DC-012',
    title: '建议测试京东快车投放渠道',
    category: '投放优化',
    priority: 'low',
    evidence: '京东美妆品类搜索流量月均增长12%，品牌京东旗舰店自然流量占比仅15%，付费流量有增长空间',
    aiAction: '① 开通京东快车账户 ② 配置底妆+护肤品类关键词计划(日预算¥1,500) ③ 测试7天后评估ROI',
    impact: '新增潜在月GMV ¥8万+',
    confidence: 75,
    timestamp: '1小时前',
  },
  {
    id: 'DC-013',
    title: 'Meta EU广告iOS归因缺口18%，Conversions API未完全部署',
    category: '国际投放',
    priority: 'urgent',
    evidence: 'Meta Events Manager检测到欧洲市场iOS事件匹配率仅82%，归因缺口导致ROAS虚低约0.6x，影响出价策略准确性',
    aiAction: '① 立即完成Meta Pixel + Conversions API双重部署 ② 启用SKAdNetwork 4.0数据补偿 ③ 重新校准EU市场出价基准+0.6x',
    impact: '预计恢复归因GMV $2.8万/月',
    confidence: 93,
    timestamp: '6分钟前',
  },
  {
    id: 'DC-014',
    title: 'TikTok日本市场ROAS达5.1x近90日新高，建议加速放量',
    category: '国际投放',
    priority: 'high',
    evidence: 'TikTok JP过去7天平均ROAS 5.1x，US市场同步ROAS 4.2x，双市场算法共振，目标人群18-28岁女性覆盖度不足35%',
    aiAction: '① JP日预算从¥4.5万提升至¥7.2万 ② US预算同步+30% ③ 追加UGC测评类素材比例至60% ④ 分3天阶梯加量',
    impact: '预计海外GMV增量$4.2万/周',
    confidence: 91,
    timestamp: '18分钟前',
  },
  {
    id: 'DC-015',
    title: 'EUR/CNY汇率7日累计波动2.8%，建议启动对冲保护',
    category: '国际投放',
    priority: 'high',
    evidence: 'EUR/CNY本周从7.68→7.90，欧洲市场实际广告成本较预算高出¥3,200，若持续1个月影响欧洲ROAS约0.3x',
    aiAction: '① 启动汇率对冲缓冲，EU出价自动下调3% ② 向财务团队申请锁汇30天 ③ 欧洲预算每日实时按汇率动态换算',
    impact: '预计降低汇率风险损失¥8,500/月',
    confidence: 89,
    timestamp: '32分钟前',
  },
  {
    id: 'DC-016',
    title: 'Google Shopping美国市场唇妆品类竞价成本下降12%，可趁机扩量',
    category: '国际投放',
    priority: 'medium',
    evidence: '过去48h Google Shopping US"lip gloss/lipstick"品类CPC从$1.42降至$1.25，竞品减少出价，流量红利窗口约3-5天',
    aiAction: '① US Google Shopping出价提高15% ② 追加美妆品类关键词覆盖(新增"velvet lip"/"satin finish") ③ 连接Amazon Store做落地承接',
    impact: '预计3天内多获客1,200+，GMV $1.8万',
    confidence: 84,
    timestamp: '45分钟前',
  },
]

// ─── Decision → AI投手执行元数据 ─────────────────────────────────────────────
// 每条决策对应：底层模型 / AI投手执行状态 / 跳转页面路由 / 页面显示名
type ExecStatus = '执行中' | '已完成' | '待确认' | '计划中'
interface DecisionMeta {
  model: string
  status: ExecStatus
  page: string
  pageLabel: string
}
const DECISION_META: Record<string, DecisionMeta> = {
  'DC-001': { model: 'BidOptimizer-DQN',       status: '执行中', page: '/ad-placement',       pageLabel: '投放总控台'  },
  'DC-002': { model: 'CreativeFatigue-MAB',     status: '执行中', page: '/slots-ads',          pageLabel: '小红书聚光'  },
  'DC-003': { model: 'BudgetMO-Optimizer',      status: '已完成', page: '/drama-ads',          pageLabel: '快手磁力'   },
  'DC-004': { model: 'KOLMatch-GNN',            status: '待确认', page: '/kol-discovery',      pageLabel: 'KOL发现'    },
  'DC-005': { model: 'LiveGMV-LSTM',            status: '执行中', page: '/ad-placement',       pageLabel: '投放总控台'  },
  'DC-006': { model: 'TrafficPacing-RL',        status: '已完成', page: '/ad-placement',       pageLabel: '投放总控台'  },
  'DC-007': { model: 'ChurnPredictor-GBM',      status: '待确认', page: '/private-domain',     pageLabel: '私域运营'   },
  'DC-008': { model: 'BudgetMO-Optimizer',      status: '执行中', page: '/campaign-management',pageLabel: '计划管理'   },
  'DC-009': { model: 'CompetitorIntel-NLP',     status: '已完成', page: '/slots-ads',          pageLabel: '小红书聚光'  },
  'DC-010': { model: 'ContentLLM-Beauty',       status: '待确认', page: '/kol-discovery',      pageLabel: 'KOL发现'    },
  'DC-011': { model: 'LiveGMV-LSTM',            status: '计划中', page: '/ad-placement',       pageLabel: '投放总控台'  },
  'DC-012': { model: 'CTR-Predictor-DeepFM',    status: '计划中', page: '/campaign-management',pageLabel: '计划管理'   },
  'DC-013': { model: 'ComplianceNLP',            status: '执行中', page: '/intl/facebook',      pageLabel: 'Meta Ads'   },
  'DC-014': { model: 'CTR-Predictor-DeepFM',    status: '执行中', page: '/ads/tiktok-global',  pageLabel: 'TikTok全球' },
  'DC-015': { model: 'AnomalyDetector-LSTM',     status: '待确认', page: '/intl/dashboard',     pageLabel: '全球总览'   },
  'DC-016': { model: 'SearchQuery-Optimizer',    status: '计划中', page: '/ads/google',         pageLabel: 'Google Ads' },
}

const execStatusStyle: Record<ExecStatus, { bg: string; color: string; dot: string }> = {
  '执行中': { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', dot: '#34d399' },
  '已完成': { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', dot: '#818cf8' },
  '待确认': { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', dot: '#fbbf24' },
  '计划中': { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', dot: '#94a3b8' },
}

// ─── Sidebar Chart Data ──────────────────────────────────────────────────────
const trendData = [
  { day: '周一', 执行数: 38, 节省金额: 8.2 },
  { day: '周二', 执行数: 42, 节省金额: 9.5 },
  { day: '周三', 执行数: 35, 节省金额: 7.8 },
  { day: '周四', 执行数: 51, 节省金额: 12.1 },
  { day: '周五', 执行数: 47, 节省金额: 11.3 },
  { day: '周六', 执行数: 55, 节省金额: 14.6 },
  { day: '周日', 执行数: 47, 节省金额: 12.8 },
]

const categoryDistribution: { name: Category; count: number }[] = [
  { name: '投放优化', count: 8 },
  { name: '国际投放', count: 4 },
  { name: '素材策略', count: 5 },
  { name: '预算调控', count: 4 },
  { name: '达人种草', count: 3 },
  { name: '直播运营', count: 2 },
  { name: '私域转化', count: 1 },
]

// ─── Tooltip Style ───────────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.7rem',
  color: 'var(--text-primary)',
}

// ─── Drill-Down Mock Data ────────────────────────────────────────────────────
const pendingDecisionsByPriority = [
  { priority: 'urgent' as Priority, count: 2, items: ['DC-001 唇釉CPA飙升42%', 'DC-002 素材CTR骤降'] },
  { priority: 'high' as Priority, count: 5, items: ['DC-003 底妆ROI突破4.2x', 'DC-004 达人追加合作', 'DC-005 直播间引流', 'DC-013 抖音DOU+效果测试', 'DC-014 小红书信息流'] },
  { priority: 'medium' as Priority, count: 11, items: ['DC-006 分时出价调整', 'DC-007 沉睡用户唤醒', 'DC-008 眼影盘清仓', 'DC-009 抢花西子流量', 'DC-010 种草链路加投', '...等6条'] },
  { priority: 'low' as Priority, count: 5, items: ['DC-011 视频号直播扩展', 'DC-012 京东快车测试', '...等3条'] },
]

const executedTodayList = [
  { id: 'EX-001', title: '抖音护肤品出价下调15%', predicted: 'CPA降至¥22', actual: 'CPA降至¥20.5', rating: '超预期' },
  { id: 'EX-002', title: '快手彩妆预算加量20%', predicted: 'GMV增¥1.5万', actual: 'GMV增¥1.8万', rating: '超预期' },
  { id: 'EX-003', title: '小红书眼影笔记素材更换', predicted: 'CTR恢复至3.8%', actual: 'CTR恢复至3.6%', rating: '符合预期' },
  { id: 'EX-004', title: '私域会员专属推送', predicted: '打开率25%', actual: '打开率23.2%', rating: '符合预期' },
  { id: 'EX-005', title: '直播间引流广告加投', predicted: '在线人数+2000', actual: '在线人数+2400', rating: '超预期' },
  { id: 'EX-006', title: '抖音底妆定向优化', predicted: 'CVR提升15%', actual: 'CVR提升18%', rating: '超预期' },
  { id: 'EX-007', title: '达人合作视频二创', predicted: '播放量50万', actual: '播放量42万', rating: '略低预期' },
]

const savingsBreakdown: { category: Category; daily: string; pct: number; trend: string }[] = [
  { category: '投放优化', daily: '¥5.2万', pct: 40.6, trend: '+12%' },
  { category: '素材策略', daily: '¥2.8万', pct: 21.9, trend: '+8%' },
  { category: '预算调控', daily: '¥2.1万', pct: 16.4, trend: '+22%' },
  { category: '达人种草', daily: '¥1.5万', pct: 11.7, trend: '+5%' },
  { category: '直播运营', daily: '¥0.8万', pct: 6.3, trend: '+15%' },
  { category: '私域转化', daily: '¥0.4万', pct: 3.1, trend: '+3%' },
]

const coverageByBusiness = [
  { line: '抖音投放', coverage: 95, uncovered: '长尾关键词自动拓展' },
  { line: '小红书种草', coverage: 88, uncovered: '评论区互动策略' },
  { line: '快手投放', coverage: 92, uncovered: '直播切片素材优化' },
  { line: '私域运营', coverage: 78, uncovered: '社群活动自动化' },
  { line: '达人合作', coverage: 82, uncovered: '达人选品推荐' },
  { line: '直播运营', coverage: 85, uncovered: '实时话术建议' },
]

const chartDayDetails: Record<string, { decisions: number; saves: number; topDecisions: string[] }> = {
  '周一': { decisions: 38, saves: 82000, topDecisions: ['护肤品出价调整(节省¥2.1万)', '底妆预算优化(节省¥1.8万)', '素材轮换(节省¥1.5万)'] },
  '周二': { decisions: 42, saves: 95000, topDecisions: ['竞品流量抢占(节省¥2.5万)', '分时出价(节省¥2.0万)', '达人加投(节省¥1.8万)'] },
  '周三': { decisions: 35, saves: 78000, topDecisions: ['私域唤醒(节省¥1.9万)', '库存清仓(节省¥1.6万)', 'DOU+优化(节省¥1.2万)'] },
  '周四': { decisions: 51, saves: 121000, topDecisions: ['大促预算调控(节省¥3.8万)', '直播引流(节省¥2.5万)', '素材更换(节省¥2.1万)'] },
  '周五': { decisions: 47, saves: 113000, topDecisions: ['ROI优化(节省¥3.2万)', '人群包扩展(节省¥2.4万)', '出价策略(节省¥1.9万)'] },
  '周六': { decisions: 55, saves: 146000, topDecisions: ['周末流量加投(节省¥4.1万)', '直播加投(节省¥3.2万)', '素材优化(节省¥2.5万)'] },
  '周日': { decisions: 47, saves: 128000, topDecisions: ['尾量收割(节省¥3.5万)', '预算回收(节省¥2.8万)', '定向优化(节省¥2.1万)'] },
}

const categoryDetailStats: Record<Category, { total: number; avgConfidence: number; successRate: string; topDecision: string; recentTrend: string }> = {
  投放优化: { total: 52, avgConfidence: 89, successRate: '93.2%', topDecision: 'CPA优化策略', recentTrend: '决策量+15%' },
  素材策略: { total: 38, avgConfidence: 87, successRate: '89.5%', topDecision: '素材疲劳检测', recentTrend: '准确率+3%' },
  预算调控: { total: 31, avgConfidence: 90, successRate: '92.8%', topDecision: 'ROI驱动加量', recentTrend: '节省额+22%' },
  达人种草: { total: 28, avgConfidence: 85, successRate: '88.2%', topDecision: '达人匹配推荐', recentTrend: 'GMV+18%' },
  直播运营: { total: 22, avgConfidence: 86, successRate: '91.5%', topDecision: '流量峰值预测', recentTrend: '在线峰值+12%' },
  私域转化: { total: 15, avgConfidence: 82, successRate: '85.6%', topDecision: '沉睡用户唤醒', recentTrend: '唤醒率+5%' },
}

const learningMetricDetails: Record<string, { history: string[]; currentValue: string; improvement: string; description: string }> = {
  '模型版本': { history: ['v4.0-base → v4.1-tune → v4.2-beauty'], currentValue: 'v4.2-beauty', improvement: '每版本准确率+1.5%', description: '模型从通用版本逐步针对美妆行业微调，v4.2版本针对美妆品类数据进行专项训练' },
  '训练数据': { history: ['800K → 1.0M → 1.2M 数据点'], currentValue: '1.2M 数据点', improvement: '数据量+50%', description: '训练数据覆盖抖音/小红书/快手等全平台，包含120万条投放效果数据' },
  '平均置信度': { history: ['82% → 85% → 87%'], currentValue: '87%', improvement: '+5%', description: '模型整体预测置信度持续提升，高置信度(>90%)决策占比从35%提升至42%' },
  '最近训练': { history: ['每小时增量训练', '每日全量训练', '异常时即时训练'], currentValue: '12分钟前', improvement: '训练频率+30%', description: '采用增量训练+全量训练双模式，确保模型及时学习最新数据' },
  '下次训练': { history: ['触发条件: 新数据>5000条 或 准确率下降>2%'], currentValue: '48分钟后', improvement: '自适应调度', description: '基于数据积累速度和模型准确率变化自动调度训练时间' },
  '24h自动调整': { history: ['1,200次 → 2,100次 → 2,847次'], currentValue: '2,847 次', improvement: '+37%', description: '模型24小时内自动调整出价、预算、定向等参数的总次数，覆盖全平台投放计划' },
}

// ─── AI Config ───────────────────────────────────────────────────────────────
const aiConfigGroups: AIConfigGroup[] = [
  {
    title: '决策生成策略',
    icon: <Brain size={16} />,
    params: [
      createParam('decision_confidence_min', '最低决策置信度', 75, '%', '低于该置信度的决策不会展示给用户', 78, 91, { min: 50, max: 99 }),
      createParam('data_lookback_window', '数据回溯窗口', 7, '天', '生成决策时回溯分析的历史数据天数', 7, 88, { min: 1, max: 30 }),
      createParam('decision_refresh_interval', '决策刷新周期', 15, '分钟', '自动刷新并重新生成决策的时间间隔', 10, 85, { min: 5, max: 60 }),
      createParam('max_daily_decisions', '每日最大决策数', 80, '条', '每天生成的最大决策数量上限', 80, 90, { min: 20, max: 200 }),
      createParam('urgent_threshold', '紧急阈值', 30, '%', '指标波动超过该阈值则标记为紧急', 25, 87, { min: 10, max: 50 }),
    ],
  },
  {
    title: '执行风控参数',
    icon: <Shield size={16} />,
    params: [
      createParam('auto_execute_confidence', '自动执行置信阈值', 95, '%', '高于该置信度的决策可自动执行无需审批', 95, 93, { min: 80, max: 99 }),
      createParam('max_budget_change_pct', '单次最大预算调整', 50, '%', '单次预算增减不可超过该比例', 50, 90, { min: 10, max: 100 }),
      createParam('bid_change_limit', '出价调整上限', 30, '%', '单次出价调整不可超过该比例', 25, 88, { min: 5, max: 50 }),
      createParam('rollback_timeout', '自动回滚时限', 120, '分钟', '执行后若效果恶化则在此时限内自动回滚', 120, 86, { min: 30, max: 360 }),
      createParam('daily_execute_cap', '日执行上限', 60, '条', '每天自动执行的最大决策数', 60, 89, { min: 10, max: 100 }),
    ],
  },
]

const aiLearningStatus: AILearningStatus = {
  modelVersion: 'v4.2-beauty',
  lastTraining: '12分钟前',
  totalDataPoints: 1200000,
  avgConfidence: 87,
  autoAdjustCount24h: 2847,
  learningRate: '0.001',
  nextTraining: '48分钟后',
  improvementRate: '+2.3%',
}

// ─── Tab Definitions ─────────────────────────────────────────────────────────
type TabKey = 'all' | 'urgent' | '投放优化' | '素材策略' | '达人种草' | '直播运营' | 'executed'

// ─── Drill-down panel types ──────────────────────────────────────────────────
type DrillDownType = null | 'kpi-pending' | 'kpi-executed' | 'kpi-savings' | 'kpi-coverage'
  | 'chart-day' | 'category-detail' | 'learning-metric' | 'decision-detail'

// ─── Shared Panel Wrapper ────────────────────────────────────────────────────
function DrillDownPanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', zIndex: 999,
      background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.3s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px', borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, rgba(232,54,93,0.06), rgba(255,122,149,0.04))',
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        <button onClick={onClose} style={{
          background: 'var(--bg-secondary)', border: 'none', borderRadius: 8, width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)',
        }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function AIDecisionCenter() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set())
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set())
  const [executedIds, setExecutedIds] = useState<Set<string>>(new Set())
  const [executeStage, setExecuteStage] = useState<Record<string, 'pulse' | 'spin' | 'done'>>({})
  const [toast, setToast] = useState<{message: string, visible: boolean}>({message: '', visible: false})
  const [drillDown, setDrillDown] = useState<DrillDownType>(null)
  const [drillDownData, setDrillDownData] = useState<string>('')
  const [deferredIds, setDeferredIds] = useState<Set<string>>(new Set())

  // Register AI Config
  useRegisterAIConfig(aiConfigGroups, aiLearningStatus, 'AI决策中心')

  // ── Toggle evidence expand ──
  const toggleEvidence = useCallback((id: string) => {
    setExpandedEvidence(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  // ── Execute decision (3-stage animation) ──
  const handleExecute = useCallback((id: string) => {
    setExecutingIds(prev => new Set(prev).add(id))
    // Stage 1: pulse (0-500ms)
    setExecuteStage(prev => ({ ...prev, [id]: 'pulse' }))
    setTimeout(() => {
      // Stage 2: spin (500-1500ms)
      setExecuteStage(prev => ({ ...prev, [id]: 'spin' }))
    }, 500)
    setTimeout(() => {
      // Stage 3: done with success glow (1500-1800ms)
      setExecuteStage(prev => ({ ...prev, [id]: 'done' }))
      setExecutingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setExecutedIds(prev => new Set(prev).add(id))
      const decision = decisions.find(d => d.id === id)
      setToast({ message: `✓ "${decision?.title?.slice(0, 20)}..." 已成功执行`, visible: true })
      setTimeout(() => setToast({ message: '', visible: false }), 3000)
    }, 1500)
  }, [])

  // ── Defer decision (暂不处理) ──
  const handleDefer = useCallback((id: string) => {
    setDeferredIds(prev => new Set(prev).add(id))
    const decision = decisions.find(d => d.id === id)
    setToast({ message: `⏸ "${decision?.title?.slice(0, 20)}..." 已暂缓处理`, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }, [])

  // ── Filter decisions by tab ──
  const filtered = decisions.filter(d => {
    if (activeTab === 'all') return !executedIds.has(d.id) && !deferredIds.has(d.id)
    if (activeTab === 'urgent') return d.priority === 'urgent' && !executedIds.has(d.id) && !deferredIds.has(d.id)
    if (activeTab === 'executed') return executedIds.has(d.id)
    return d.category === activeTab && !executedIds.has(d.id) && !deferredIds.has(d.id)
  })

  // ── Tab counts ──
  const allCount = decisions.filter(d => !executedIds.has(d.id) && !deferredIds.has(d.id)).length
  const urgentCount = decisions.filter(d => d.priority === 'urgent' && !executedIds.has(d.id) && !deferredIds.has(d.id)).length
  const catCount = (c: Category) => decisions.filter(d => d.category === c && !executedIds.has(d.id) && !deferredIds.has(d.id)).length
  const executedCount = executedIds.size

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all', label: '全部决策', count: allCount },
    { key: 'urgent', label: '\ud83d\udd34 紧急', count: urgentCount },
    { key: '投放优化', label: '投放优化', count: catCount('投放优化') },
    { key: '素材策略', label: '素材策略', count: catCount('素材策略') },
    { key: '达人种草', label: '达人种草' },
    { key: '直播运营', label: '直播运营' },
    { key: 'executed', label: '已执行', count: executedCount },
  ]

  // ── Priority stats for sidebar ──
  const prioStats = {
    urgent: decisions.filter(d => d.priority === 'urgent' && !executedIds.has(d.id)).length,
    high: decisions.filter(d => d.priority === 'high' && !executedIds.has(d.id)).length,
    medium: decisions.filter(d => d.priority === 'medium' && !executedIds.has(d.id)).length,
    low: decisions.filter(d => d.priority === 'low' && !executedIds.has(d.id)).length,
  }

  const maxCategoryCount = Math.max(...categoryDistribution.map(c => c.count))

  // ── Drill-down handlers ──
  const openDrillDown = (type: DrillDownType, data?: string) => {
    setDrillDown(type)
    setDrillDownData(data || '')
  }
  const closeDrillDown = () => { setDrillDown(null); setDrillDownData('') }

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      {/* ── Toast Notification ── */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#fff', padding: '12px 24px', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
          fontSize: 14, fontWeight: 600,
          animation: 'fadeInUp 0.3s ease',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={16} /> {toast.message}
        </div>
      )}

      {/* ── Drill-Down Overlay ── */}
      {drillDown && (
        <div onClick={closeDrillDown} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.3)', animation: 'fadeIn 0.2s ease',
        }} />
      )}

      {/* ── Drill-Down Panels ── */}
      {drillDown === 'kpi-pending' && (
        <DrillDownPanel title="待处理决策详情 (23条)" onClose={closeDrillDown}>
          {pendingDecisionsByPriority.map((group, gi) => {
            const pm = priorityMeta[group.priority]
            return (
              <div key={gi} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{
                    background: pm.bg, color: pm.color, borderRadius: 6,
                    padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, border: `1px solid ${pm.color}30`,
                  }}>{pm.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{group.count} 条</span>
                </div>
                {group.items.map((item, ii) => (
                  <div key={ii} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', marginBottom: 6, borderRadius: 8,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{item}</span>
                    {!item.startsWith('...') && (
                      <button onClick={() => {
                        const msg = `✅ 已执行：${item.slice(0, 20)}…`
                        setToast({ message: msg, visible: true })
                        setTimeout(() => setToast({ message: '', visible: false }), 3000)
                      }} style={{
                        background: 'linear-gradient(135deg, #e8365d, #ff7a95)', color: '#fff',
                        border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: '0.68rem',
                        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Zap size={10} /> 执行
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
          <div style={{
            padding: 14, borderRadius: 10, background: 'rgba(232,54,93,0.06)',
            border: '1px solid rgba(232,54,93,0.12)', marginTop: 10,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e8365d', marginBottom: 6 }}>优先级建议</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              建议优先处理2条紧急决策(CPA飙升/素材疲劳)，预计可立即节省¥1.1万/日。高优先级5条建议在2小时内处理。
            </p>
          </div>
        </DrillDownPanel>
      )}

      {drillDown === 'kpi-executed' && (
        <DrillDownPanel title="今日已执行决策 (47条)" onClose={closeDrillDown}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20,
          }}>
            {[
              { label: '超预期', count: 12, color: '#22c55e' },
              { label: '符合预期', count: 28, color: '#3b82f6' },
              { label: '低于预期', count: 7, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 10, textAlign: 'center',
                background: `${s.color}10`, border: `1px solid ${s.color}20`,
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: '0.7rem', color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, margin: '0 0 12px', color: 'var(--text-primary)' }}>最近执行列表</h4>
          {executedTodayList.map((item, i) => (
            <div key={i} style={{
              padding: '12px 14px', marginBottom: 8, borderRadius: 10,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#e8365d', fontWeight: 600 }}>{item.id}</span>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600, borderRadius: 6, padding: '2px 8px',
                  background: item.rating === '超预期' ? 'rgba(34,197,94,0.12)' : item.rating === '符合预期' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)',
                  color: item.rating === '超预期' ? '#22c55e' : item.rating === '符合预期' ? '#3b82f6' : '#f59e0b',
                }}>{item.rating}</span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span>预测: {item.predicted}</span>
                <span>实际: {item.actual}</span>
              </div>
            </div>
          ))}
        </DrillDownPanel>
      )}

      {drillDown === 'kpi-savings' && (
        <DrillDownPanel title="预计节省详情 (¥12.8万/日)" onClose={closeDrillDown}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>按类别节省明细</h4>
          {savingsBreakdown.map((item, i) => {
            const meta = categoryMeta[item.category]
            const CIcon = meta.icon
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                marginBottom: 8, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CIcon size={14} color={meta.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.category}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: meta.color }}>{item.daily}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${item.pct}%`, height: '100%', borderRadius: 2, background: meta.color }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 600 }}>{item.trend}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{
            padding: 16, borderRadius: 10, background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.12)', marginTop: 16,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>日节省趋势</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
              {[8.2, 9.5, 7.8, 12.1, 11.3, 14.6, 12.8].map((v, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: `${(v / 15) * 50}px`, borderRadius: 3,
                    background: i === 6 ? '#f59e0b' : 'rgba(245,158,11,0.3)',
                  }} />
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-tertiary)' }}>{['一', '二', '三', '四', '五', '六', '日'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </DrillDownPanel>
      )}

      {drillDown === 'kpi-coverage' && (
        <DrillDownPanel title="AI决策覆盖率详情 (87.3%)" onClose={closeDrillDown}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>各业务线覆盖情况</h4>
          {coverageByBusiness.map((item, i) => (
            <div key={i} style={{
              padding: '14px 14px', marginBottom: 8, borderRadius: 10,
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.line}</span>
                <span style={{
                  fontSize: '0.82rem', fontWeight: 700,
                  color: item.coverage >= 90 ? '#22c55e' : item.coverage >= 85 ? '#3b82f6' : '#f59e0b',
                }}>{item.coverage}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  width: `${item.coverage}%`, height: '100%', borderRadius: 3,
                  background: item.coverage >= 90 ? '#22c55e' : item.coverage >= 85 ? '#3b82f6' : '#f59e0b',
                }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                <AlertCircle size={10} style={{ verticalAlign: -1, marginRight: 4 }} />
                未覆盖: {item.uncovered}
              </div>
            </div>
          ))}
          <div style={{
            padding: 14, borderRadius: 10, background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.12)', marginTop: 16,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', marginBottom: 6 }}>改进建议</div>
            <ul style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
              <li>私域运营覆盖率最低(78%)，建议接入社群自动化工具</li>
              <li>达人合作选品推荐模块开发中，预计覆盖率可提升至90%</li>
              <li>直播实时话术建议需要接入ASR能力</li>
            </ul>
          </div>
        </DrillDownPanel>
      )}

      {drillDown === 'chart-day' && (
        <DrillDownPanel title={`${drillDownData} 决策执行详情`} onClose={closeDrillDown}>
          {chartDayDetails[drillDownData] && (() => {
            const detail = chartDayDetails[drillDownData]
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: 14, borderRadius: 10, background: 'rgba(232,54,93,0.06)', border: '1px solid rgba(232,54,93,0.12)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e8365d' }}>{detail.decisions}</div>
                    <div style={{ fontSize: '0.7rem', color: '#e8365d' }}>执行决策数</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>¥{(detail.saves / 10000).toFixed(1)}万</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>实际节省</div>
                  </div>
                </div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 600, margin: '0 0 12px', color: 'var(--text-primary)' }}>TOP节省决策</h4>
                {detail.topDecisions.map((d, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    marginBottom: 6, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#e8365d',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{d}</span>
                  </div>
                ))}
              </>
            )
          })()}
        </DrillDownPanel>
      )}

      {drillDown === 'category-detail' && (
        <DrillDownPanel title={`${drillDownData} 决策分析`} onClose={closeDrillDown}>
          {categoryDetailStats[drillDownData as Category] && (() => {
            const stats = categoryDetailStats[drillDownData as Category]
            const meta = categoryMeta[drillDownData as Category]
            const CIcon = meta.icon
            const categoryDecisions = decisions.filter(d => d.category === drillDownData)
            return (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                  padding: 16, borderRadius: 12, background: `${meta.color}08`, border: `1px solid ${meta.color}20`,
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CIcon size={20} color={meta.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{drillDownData}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>累计 {stats.total} 条决策</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: '平均置信度', value: `${stats.avgConfidence}%`, color: '#e8365d' },
                    { label: '成功率', value: stats.successRate, color: '#22c55e' },
                    { label: '核心策略', value: stats.topDecision, color: '#3b82f6' },
                    { label: '近期趋势', value: stats.recentTrend, color: '#f59e0b' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      padding: 12, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 600, margin: '0 0 12px', color: 'var(--text-primary)' }}>当前待处理决策</h4>
                {categoryDecisions.map((d, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', marginBottom: 6, borderRadius: 8,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderLeft: `3px solid ${priorityMeta[d.priority].stripe}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#e8365d' }}>{d.id}</span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, borderRadius: 6, padding: '1px 8px',
                        background: priorityMeta[d.priority].bg, color: priorityMeta[d.priority].color,
                      }}>{priorityMeta[d.priority].label}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{d.title}</div>
                    <div style={{ fontSize: '0.68rem', color: '#10b981', marginTop: 4 }}>{d.impact}</div>
                  </div>
                ))}
              </>
            )
          })()}
        </DrillDownPanel>
      )}

      {drillDown === 'learning-metric' && (
        <DrillDownPanel title={`${drillDownData} 详情`} onClose={closeDrillDown}>
          {learningMetricDetails[drillDownData] && (() => {
            const detail = learningMetricDetails[drillDownData]
            return (
              <>
                <div style={{
                  padding: 16, borderRadius: 12, background: 'rgba(232,54,93,0.06)',
                  border: '1px solid rgba(232,54,93,0.12)', marginBottom: 20,
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>当前值</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e8365d' }}>{detail.currentValue}</div>
                </div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 600, margin: '0 0 12px', color: 'var(--text-primary)' }}>演进历史</h4>
                {detail.history.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    marginBottom: 6, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  }}>
                    <ArrowRight size={12} color="#e8365d" />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>{h}</span>
                  </div>
                ))}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16,
                }}>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>改进幅度</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22c55e' }}>{detail.improvement}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>状态</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#3b82f6' }}>正常</div>
                  </div>
                </div>
                <div style={{
                  padding: 14, borderRadius: 10, background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', marginTop: 16,
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>说明</div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                    {detail.description}
                  </p>
                </div>
              </>
            )
          })()}
        </DrillDownPanel>
      )}

      {drillDown === 'decision-detail' && (() => {
        const d = decisions.find(dec => dec.id === drillDownData)
        if (!d) return null
        const pm = priorityMeta[d.priority]
        const cm = categoryMeta[d.category]
        const CIcon = cm.icon
        return (
          <DrillDownPanel title={`决策详情 · ${d.id}`} onClose={closeDrillDown}>
            {/* 优先级 + 分类 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ background: pm.bg, color: pm.color, borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, border: `1px solid ${pm.color}30` }}>{pm.label}</span>
              <span style={{ background: `${cm.color}15`, color: cm.color, borderRadius: 6, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CIcon size={11} />{d.category}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{d.timestamp}</span>
            </div>
            {/* 标题 */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', lineHeight: 1.5 }}>{d.title}</h4>
            {/* 置信度 */}
            <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>AI置信度</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: d.confidence >= 90 ? '#22c55e' : d.confidence >= 80 ? '#3b82f6' : '#f59e0b' }}>{d.confidence}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${d.confidence}%`, height: '100%', borderRadius: 4, background: d.confidence >= 90 ? 'linear-gradient(90deg,#e8365d,#ff7a95)' : d.confidence >= 80 ? 'linear-gradient(90deg,#3b82f6,#60a5fa)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />
              </div>
            </div>
            {/* AI分析依据 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Database size={13} color="#3b82f6" /> AI分析依据
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 14, borderRadius: 10, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
                {d.evidence}
              </div>
            </div>
            {/* 建议操作 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={13} color="#e8365d" /> AI建议操作
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.8, padding: 14, borderRadius: 10, background: 'rgba(232,54,93,0.05)', border: '1px solid rgba(232,54,93,0.12)' }}>
                {d.aiAction}
              </div>
            </div>
            {/* 预期影响 */}
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 20 }}>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600, marginBottom: 4 }}>预期影响</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>{d.impact}</div>
            </div>
            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { closeDrillDown(); navigate('/workbench', { state: { taskId: parseInt(d.id.replace('DC-', '')) } }) }} style={{
                flex: 1, background: 'linear-gradient(135deg,#e8365d,#ff7a95)', color: '#fff',
                border: 'none', borderRadius: 8, padding: '10px 0', fontSize: '0.82rem',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <ExternalLink size={14} /> 前往工作台
              </button>
              <button onClick={() => { closeDrillDown(); handleDefer(d.id) }} style={{
                flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', borderRadius: 8, padding: '10px 0', fontSize: '0.82rem',
                fontWeight: 500, cursor: 'pointer',
              }}>
                暂不处理
              </button>
            </div>
          </DrillDownPanel>
        )
      })()}

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #e8365d, #ff7a95)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '24px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '100%', background: 'radial-gradient(circle at 80% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Brain size={28} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>AI决策中心</h1>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '3px 12px',
            fontSize: '0.72rem',
            fontWeight: 500,
          }}>
            <Activity size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            实时运行中
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.92, maxWidth: '700px', lineHeight: 1.6 }}>
          AI实时分析全平台数据 → 生成可执行决策 → 超出AI处理范围自动流转工作台，让新手也能成为投流高手
        </p>
      </div>

      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>决策引擎模型：</span>
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        <ModelBadge name="CVR-Predictor-ESMM" color="#e8365d" />
        <ModelBadge name="BidOptimizer-DQN" color="#e8365d" />
        <ModelBadge name="BudgetMO-Optimizer" color="#e8365d" />
        <ModelBadge name="BayesianAB-Engine" color="#e8365d" />
        <ModelBadge name="Shapley-Attribution" color="#10b981" />
        <ModelBadge name="AnomalyDetector-LSTM" color="#f59e0b" />
      </div>

      {/* ── KPI Cards (clickable drill-down) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '待处理决策', value: '23', unit: '条', sub: '+5 vs昨日', color: '#e8365d', icon: AlertCircle, drill: 'kpi-pending' as DrillDownType },
          { label: '今日已执行', value: '47', unit: '条', sub: '准确率 94.7%', color: '#10b981', icon: Check, drill: 'kpi-executed' as DrillDownType },
          { label: '预计节省', value: '¥12.8万', unit: '/日', sub: '+18.3% vs上周', color: '#f59e0b', icon: TrendingUp, drill: 'kpi-savings' as DrillDownType },
          { label: 'AI决策覆盖率', value: '87.3', unit: '%', sub: '+2.1% vs昨日', color: '#3b82f6', icon: Bot, drill: 'kpi-coverage' as DrillDownType },
        ].map((kpi, i) => (
          <div key={i} onClick={() => openDrillDown(kpi.drill)} style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: `radial-gradient(circle, ${kpi.color}15 0%, transparent 70%)` }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${kpi.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={16} color={kpi.color} />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{kpi.label}</span>
              <Eye size={12} color="var(--text-tertiary)" style={{ marginLeft: 'auto' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>{kpi.value}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{kpi.unit}</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: kpi.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight size={12} />
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid: Content + Sidebar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* ═══ Left Column ═══ */}
        <div>
          {/* ── Tabs ── */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '20px',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '6px',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                  background: activeTab === tab.key
                    ? 'linear-gradient(135deg, #e8365d, #ff7a95)'
                    : 'transparent',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{
                    background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--bg-secondary)',
                    borderRadius: '10px',
                    padding: '1px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    animation: 'countPulse 0.3s ease',
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Batch Execute Urgent ── */}
          {urgentCount > 0 && activeTab !== 'executed' && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', marginBottom: 12, borderRadius: 10,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
                <AlertCircle size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
                {urgentCount} 条紧急决策待处理
              </span>
              <button onClick={() => navigate('/workbench')} style={{
                padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <ExternalLink size={12} /> 前往工作台查看
              </button>
            </div>
          )}

          {/* ── Decision Cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.length === 0 && (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
              }}>
                {activeTab === 'executed' ? '暂无已执行决策' : '当前分类暂无待处理决策'}
              </div>
            )}

            {filtered.map((d, index) => {
              const pm = priorityMeta[d.priority]
              const cm = categoryMeta[d.category]
              const CatIcon = cm.icon
              const isExecuting = executingIds.has(d.id)
              const isExecuted = executedIds.has(d.id)
              const evidenceOpen = expandedEvidence.has(d.id)
              const stage = executeStage[d.id]

              return (
                <div
                  key={d.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    position: 'relative',
                    opacity: isExecuted ? 0.65 : 1,
                    transition: 'all 0.3s',
                    animation: isExecuted && stage === 'done'
                      ? 'successGlow 0.6s ease'
                      : `fadeInUp 0.3s ease ${index * 0.05}s both`,
                  }}
                >
                  {/* Priority stripe */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: pm.stripe,
                  }} />

                  <div style={{ padding: '18px 20px 18px 24px' }}>
                    {/* Top row: badges + timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      {/* Priority badge */}
                      <span style={{
                        background: pm.bg,
                        color: pm.color,
                        borderRadius: '6px',
                        padding: '2px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        border: `1px solid ${pm.color}30`,
                      }}>
                        {pm.label}
                      </span>
                      {/* Category badge */}
                      <span style={{
                        background: `${cm.color}15`,
                        color: cm.color,
                        borderRadius: '6px',
                        padding: '2px 10px',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: `1px solid ${cm.color}25`,
                      }}>
                        <CatIcon size={11} />
                        {d.category}
                      </span>
                      {/* ID */}
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{d.id}</span>
                      {/* 底层模型 */}
                      {DECISION_META[d.id] && (
                        <ModelBadge name={DECISION_META[d.id].model} color="#818cf8" />
                      )}
                      {/* 执行状态小徽章 */}
                      {DECISION_META[d.id] && (() => {
                        const es = execStatusStyle[DECISION_META[d.id].status]
                        return (
                          <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 6, background: es.bg, color: es.color, border: `1px solid ${es.dot}30`, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: es.dot, display: 'inline-block' }} />
                            {DECISION_META[d.id].status}
                          </span>
                        )
                      })()}
                      {/* Timestamp pushed right */}
                      <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        {d.timestamp}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {d.title}
                    </h3>

                    {/* Evidence toggle */}
                    <button
                      onClick={() => toggleEvidence(d.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#e8365d',
                        fontSize: '0.76rem',
                        fontWeight: 500,
                        padding: '4px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: evidenceOpen ? '8px' : '12px',
                      }}
                    >
                      {evidenceOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      AI分析依据
                    </button>

                    {/* Evidence content */}
                    {evidenceOpen && (
                      <div style={{ overflow: 'hidden', animation: 'slideDown 0.3s ease forwards' }}>
                        <div style={{
                          background: 'var(--bg-secondary)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.7,
                          marginBottom: '12px',
                          borderLeft: `3px solid ${cm.color}60`,
                        }}>
                          {d.evidence}
                        </div>
                      </div>
                    )}

                    {/* AI Action box */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(232,54,93,0.06), rgba(255,122,149,0.06))',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      marginBottom: '14px',
                      border: '1px solid rgba(232,54,93,0.12)',
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#e8365d', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={12} />
                        AI建议操作
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
                        {d.aiAction}
                      </div>
                    </div>

                    {/* Impact + Confidence */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      {/* Impact */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={14} color="#10b981" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>{d.impact}</span>
                      </div>
                      {/* Confidence bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>置信度</span>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: 'var(--bg-secondary)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${d.confidence}%`,
                            height: '100%',
                            borderRadius: '3px',
                            background: d.confidence >= 90 ? 'linear-gradient(90deg, #e8365d, #ff7a95)' :
                                         d.confidence >= 80 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                                         'linear-gradient(90deg, #3b82f6, #60a5fa)',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '32px' }}>{d.confidence}%</span>
                      </div>
                    </div>

                    {/* ── AI投手执行状态栏 ── */}
                    {DECISION_META[d.id] && (() => {
                      const meta = DECISION_META[d.id]
                      const es = execStatusStyle[meta.status]
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 12, background: es.bg, borderRadius: 8, border: `1px solid ${es.dot}25` }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: es.dot, flexShrink: 0, boxShadow: meta.status === '执行中' ? `0 0 6px ${es.dot}` : 'none' }} />
                          <span style={{ fontSize: '0.72rem', color: es.color, fontWeight: 600 }}>AI投手 · {meta.status}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            已下发至 <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{meta.pageLabel}</span>
                          </span>
                          <ModelBadge name={meta.model} color="#818cf8" />
                          <button
                            onClick={() => navigate(meta.page)}
                            style={{ marginLeft: 'auto', fontSize: '0.65rem', color: es.color, background: 'transparent', border: `1px solid ${es.dot}40`, borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
                          >
                            前往查看 →
                          </button>
                        </div>
                      )
                    })()}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {/* 前往工作台 */}
                      <button
                        onClick={() => navigate('/workbench', { state: { taskId: parseInt(d.id.replace('DC-', '')) } })}
                        style={{
                          background: 'linear-gradient(135deg, #e8365d, #ff7a95)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s',
                        }}
                      >
                        <ExternalLink size={14} />
                        前往工作台
                      </button>
                      {/* 查看详情 */}
                      <button onClick={() => openDrillDown('decision-detail', d.id)} style={{
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}>
                        查看详情
                      </button>
                      {/* 暂不处理 */}
                      <button onClick={() => handleDefer(d.id)} style={{
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        opacity: 0.7,
                        transition: 'all 0.2s',
                      }}>
                        暂不处理
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ Right Sidebar ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── Widget 1: AI决策效果 (clickable chart) ── */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BarChart3 size={16} color="#e8365d" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>AI决策效果</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>近7天 · 点击查看</span>
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  onClick={(e: { activeLabel?: string }) => {
                    if (e && e.activeLabel) openDrillDown('chart-day', e.activeLabel)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <defs>
                    <linearGradient id="dc-grad-exec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e8365d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e8365d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dc-grad-save" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7a95" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff7a95" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="执行数" stroke="#e8365d" fill="url(#dc-grad-exec)" strokeWidth={2} />
                  <Area type="monotone" dataKey="节省金额" stroke="#ff7a95" fill="url(#dc-grad-save)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#e8365d' }} />
                执行数
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ff7a95' }} />
                节省金额(万)
              </div>
            </div>
          </div>

          {/* ── Widget 2: 今日决策分布 (clickable category badges) ── */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Target size={16} color="#e8365d" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>今日决策分布</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryDistribution.map(cat => {
                const meta = categoryMeta[cat.name]
                const CIcon = meta.icon
                const barWidth = maxCategoryCount > 0 ? (cat.count / maxCategoryCount) * 100 : 0
                return (
                  <div key={cat.name}
                    onClick={() => openDrillDown('category-detail', cat.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 6px', borderRadius: 6, transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80px', flexShrink: 0 }}>
                      <CIcon size={12} color={meta.color} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{cat.name}</span>
                    </div>
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: meta.color,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: '20px', textAlign: 'right' }}>{cat.count}</span>
                    <Eye size={10} color="var(--text-tertiary)" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Widget 3: AI学习状态 (clickable metrics) ── */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Brain size={16} color="#e8365d" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>AI学习状态</span>
              <span style={{
                marginLeft: 'auto',
                background: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '0.65rem',
                fontWeight: 500,
              }}>运行正常</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: '模型版本', value: aiLearningStatus.modelVersion, icon: Database },
                { label: '训练数据', value: '1.2M 数据点', icon: Database },
                { label: '平均置信度', value: `${aiLearningStatus.avgConfidence}%`, icon: Activity },
                { label: '最近训练', value: aiLearningStatus.lastTraining, icon: Clock },
                { label: '下次训练', value: aiLearningStatus.nextTraining, icon: Clock },
                { label: '24h自动调整', value: `${aiLearningStatus.autoAdjustCount24h.toLocaleString()} 次`, icon: Zap },
              ].map((item, i) => {
                const ItemIcon = item.icon
                return (
                  <div key={i}
                    onClick={() => openDrillDown('learning-metric', item.label)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', padding: '4px 6px', borderRadius: 6, transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ItemIcon size={12} color="var(--text-secondary)" />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{item.value}</span>
                      <Eye size={10} color="var(--text-tertiary)" />
                    </div>
                  </div>
                )
              })}
            </div>
            {/* Confidence progress */}
            <div style={{ marginTop: '14px', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>模型整体置信度</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#e8365d' }}>{aiLearningStatus.avgConfidence}%</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${aiLearningStatus.avgConfidence}%`,
                  height: '100%',
                  borderRadius: '3px',
                  background: 'linear-gradient(90deg, #e8365d, #ff7a95)',
                }} />
              </div>
            </div>
          </div>

          {/* ── Widget 4: 实时统计 ── */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '18px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity size={16} color="#e8365d" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>实时统计</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {([
                { priority: 'urgent' as Priority, count: prioStats.urgent },
                { priority: 'high' as Priority, count: prioStats.high },
                { priority: 'medium' as Priority, count: prioStats.medium },
                { priority: 'low' as Priority, count: prioStats.low },
              ]).map((item, i) => {
                const meta = priorityMeta[item.priority]
                return (
                  <div key={i} style={{
                    background: meta.bg,
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    border: `1px solid ${meta.color}20`,
                  }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: meta.color }}>{item.count}</div>
                    <div style={{ fontSize: '0.68rem', color: meta.color, marginTop: '2px' }}>{meta.label}决策</div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes slideDown { from { max-height: 0; opacity: 0; } to { max-height: 300px; opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes successGlow { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
        @keyframes countPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .ai-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
