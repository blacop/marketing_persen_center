import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Inbox, Bot, AlertTriangle, Clock, Check, X, Shield, Zap, Brain, MessageCircle, BarChart2, Users, Bell, Send, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

type TaskPriority = '紧急' | '高' | '中'
type TaskStatus = 'pending' | 'approved' | 'rejected'

interface Task {
  id: number
  priority: TaskPriority
  source: string
  description: string
  suggestion: string
  confidence: number
  status: TaskStatus
}

const initialTasks: Task[] = [
  { id: 1, priority: '紧急', source: 'AI投手', description: '抖音直播间ROI突降至1.8（目标3.0），在线人数正常但转化率腰斩', suggestion: 'AI建议：立即更换逼单话术素材包，调用备用直播间素材', confidence: 88, status: 'pending' },
  { id: 2, priority: '紧急', source: 'AI预算', description: '小红书聚光日预算使用率97%，剩余预算仅¥3,200，预计1.5h耗尽', suggestion: 'AI建议：从快手磁力调拨¥20,000至小红书', confidence: 85, status: 'pending' },
  { id: 3, priority: '高', source: 'AI合规', description: '唇釉618促销素材含"全网最低价"违禁词，已在3个平台投放', suggestion: 'AI建议：立即下架3条素材，启用合规备选版本', confidence: 97, status: 'pending' },
  { id: 4, priority: '高', source: 'AI达人', description: '头部KOL @彩妆师小雅 直播数据异常，互动率骤降70%', suggestion: 'AI建议：暂停该达人合作，触发虚假粉丝检测', confidence: 74, status: 'pending' },
  { id: 5, priority: '中', source: 'AI创意', description: '玻璃唇教程素材CTR 8.4%，是平均值3x，A/B测试显著', suggestion: 'AI建议：批量生产20条同类素材', confidence: 91, status: 'pending' },
  { id: 6, priority: '中', source: 'AI投手', description: '快手磁力引擎oCPM出价连续2日偏高，CPA ¥45 vs 目标¥28', suggestion: 'AI建议：重置出价策略，降低oCPM上限', confidence: 82, status: 'pending' },
  { id: 7, priority: '高', source: 'AI舆情', description: '竞品完美日记发布新款唇釉与我品同色号，小红书声量激增', suggestion: 'AI建议：加急生产对比测评内容', confidence: 78, status: 'pending' },
  { id: 8, priority: '中', source: 'AI运营', description: '新品粉底液上市首日种草笔记互动率超预期+45%', suggestion: 'AI建议：追加¥15万小红书投放预算', confidence: 86, status: 'pending' },
]

const autoSummary = [
  { label: '自动调价', count: 412, icon: Zap },
  { label: '素材轮换', count: 57, icon: Brain },
  { label: '直播监控', count: 184, icon: Bot },
  { label: '合规拦截', count: 23, icon: Shield },
  { label: '预算调拨', count: 96, icon: Clock },
]

const priorityConfig: Record<TaskPriority, { color: string; bg: string; borderColor: string; dot: string }> = {
  '紧急': { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', borderColor: 'rgba(220,38,38,0.25)', dot: '🔴' },
  '高': { color: '#ca8a04', bg: 'rgba(202,138,4,0.08)', borderColor: 'rgba(202,138,4,0.25)', dot: '🟡' },
  '中': { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', borderColor: 'rgba(22,163,74,0.25)', dot: '🟢' },
}

const taskImpact: Record<number, { budgetAtStake: string; affectedCampaigns: string; fullSuggestion: string; dataPoints: string[] }> = {
  1: { budgetAtStake: '¥86,000/日', affectedCampaigns: '抖音直播间 · 玛丽黛佳官方旗舰店', fullSuggestion: '直播间ROI从3.2骤降至1.8，目标ROI为3.0，偏离率达40%。在线人数稳定在1,200人，但转化率从4.2%暴跌至1.9%。AI分析原因为当前话术素材包已疲劳，建议立即切换至备用逼单话术素材包B组，同时上架限时赠品福袋刺激转化。', dataPoints: ['当前ROI: 1.8 (↓44%)', '目标ROI: 3.0', '在线人数: 1,200（正常）', '转化率: 1.9% (↓55%)'] },
  2: { budgetAtStake: '¥20,000（调拨）', affectedCampaigns: '小红书聚光 · 快手磁力引擎', fullSuggestion: '小红书聚光日预算¥32,000已消耗97%，剩余仅¥3,200，按当前消耗速率预计1.5小时内耗尽。快手磁力当前日预算利用率仅68%，有充足余量。AI建议紧急从快手磁力调拨¥20,000至小红书聚光，保障高效率投放计划不断档。', dataPoints: ['小红书剩余预算: ¥3,200', '预计耗尽时间: 1.5h后', '快手磁力余量: ¥28,000', '小红书当前ROI: 2.85'] },
  3: { budgetAtStake: '¥52,000（风险敞口）', affectedCampaigns: '抖音/小红书/微博 · 618唇釉促销3条素材', fullSuggestion: '系统检测到3条618促销素材含"全网最低价"违禁词，已在抖音、小红书、微博3个平台投放。该词汇违反《广告法》第九条规定，存在平台下架和监管处罚双重风险。AI建议立即下架全部3条素材，启用已通过合规审核的备选版本"品质之选·超值特惠"替代。', dataPoints: ['违规素材数量: 3条', '投放平台: 抖音/小红书/微博', '违禁词: "全网最低价"', '合规备选版本: 已就绪'] },
  4: { budgetAtStake: '¥38,000（合作费用）', affectedCampaigns: '@彩妆师小雅 · 本月直播合作计划', fullSuggestion: '头部KOL @彩妆师小雅 近3场直播互动率从均值8.2%骤降至2.4%，降幅70%。点赞/评论比异常偏高，疑似存在虚假粉丝互动行为。AI建议立即暂停该达人本月剩余合作场次，启动第三方虚假粉丝检测，结果未出前冻结尾款支付。', dataPoints: ['当前互动率: 2.4% (↓70%)', '历史均值互动率: 8.2%', '点赞/评论比: 异常（>200:1）', '合作剩余费用: ¥38,000'] },
  5: { budgetAtStake: '¥30,000（新增投入）', affectedCampaigns: '抖音/小红书短视频 · 玻璃唇系列', fullSuggestion: '玻璃唇教程系列素材在A/B测试中CTR达8.4%，是账户平均CTR 2.8%的3倍，测试样本量超6,000次点击，统计显著性强（置信度91%）。AI建议以¥30,000预算批量生产20条同类素材，预计每月可带来额外¥120,000+销售额。', dataPoints: ['测试CTR: 8.4% vs 均值2.8%', '提升倍数: 3.0x', '测试样本: 6,142次点击', '预计额外月销售额: ¥120,000+'] },
  6: { budgetAtStake: '¥74,000/日', affectedCampaigns: '快手磁力引擎 · 全线美妆计划', fullSuggestion: '快手磁力oCPM出价连续2日高于目标，当前CPA ¥45 vs 目标¥28，偏离率+61%。分析原因为近期素材批量更新导致系统重新进入学习期，出价策略未及时收敛。AI建议重置oCPM上限至¥30，同时暂停表现最差的3个广告组，待系统稳定后再逐步放量。', dataPoints: ['当前CPA: ¥45', '目标CPA: ¥28', '偏离率: +61%', '涉及日预算: ¥74,000'] },
  7: { budgetAtStake: '¥50,000（紧急预算）', affectedCampaigns: '小红书 · 竞品对比内容矩阵', fullSuggestion: '竞品完美日记昨日发布新款"镜面唇釉"，与玛丽黛佳MR302色号高度相似，小红书相关话题24小时内声量激增300%。AI建议立即启动对比测评内容计划，申请紧急¥50,000制作预算，在48小时内上线10篇KOC种草笔记强调玛丽黛佳的配方差异化优势。', dataPoints: ['竞品声量增幅: +300%（24h）', '涉及色号: MR302', '目标平台: 小红书', '建议内容数量: 10篇KOC笔记'] },
  8: { budgetAtStake: '¥150,000（追加预算）', affectedCampaigns: '小红书聚光 · 粉底液新品上市计划', fullSuggestion: '新品粉底液上市首日，自然种草笔记互动率达6.8%，超预期目标4.7%的+45%。搜索量同比上周增长220%，用户评价以"持妆""自然"等正向关键词为主，市场反馈显著优于预期。AI建议把握新品流量窗口，追加¥15万小红书聚光投放预算，扩大曝光覆盖，加速新品爆发。', dataPoints: ['首日互动率: 6.8% (目标4.7%)', '超预期幅度: +45%', '搜索量增幅: +220%', '建议追加预算: ¥150,000'] },
}

// AI 补充说明（预置回复，按任务ID）
const aiClarifyReplies: Record<number, string> = {
  1: '补充说明：ROI下降主要集中在20:00-22:00黄金时段（当前1.6x，历史4.1x）。当前话术素材已运行23天，超行业疲劳阈值（15-18天）。备用素材包B组上周A/B测试CTR领先31%，可立即切换，预计6小时内ROI回升至2.8x+。',
  2: '补充说明：预算将于约17:32耗尽（1.4h后）。快手磁力今日ROI 2.3x < 小红书2.85x，调拨不影响整体效率。建议分两步：先调拨¥10,000，若15分钟内消耗率超50%再追加¥10,000，避免一次性操作风险。',
  3: '补充说明：3条违规素材ID为V-0823、V-0831、P-0819，均含"全网最低价"。备选合规版本已通过法务审核（审核号C2024-0118），可直接启用。建议同步向各平台提交主动整改申请，可有效降低处罚风险50%以上。',
  4: '补充说明：@彩妆师小雅 异常持续3场/11天。新榜粉丝质量评分从89分跌至61分，蝉妈妈同步确认。合同第8.3条：虚假粉丝比例超15%可要求退款。建议冻结尾款¥38,000并委托第三方检测，预计2个工作日出结果。',
  5: '补充说明：A/B测试样本6,142次点击，p<0.001，高度显著。历史同类爆款批量生产后CTR保持率约87%，折算后预期月增收仍超¥100,000。建议生产通勤/约会/拍照3个场景版本，最大化人群覆盖。',
  6: '补充说明：素材批量更新于3天前，oCPM系统学习期通常3-5天，当前处于尾声。建议观察48h后再评估，频繁干预会延长学习期。若48h后CPA仍超目标20%，系统已稳定，届时重置效果更可控。',
  7: '补充说明：完美日记"镜面唇釉"定价¥79，MR302定价¥68，有价格优势。#镜面唇釉# 话题24h阅读量从12万增至47万（+292%）。KOC内容建议主打"温和成分+更亲肤"差异化，避免直接价格对比引发负面舆情。',
  8: '补充说明：首日搜索词以"玛丽黛佳粉底液""新品粉底液"为主，品牌主动搜索驱动效果强。¥15万预算建议：¥8万用于关键词竞价买断，¥7万用于信息流扩量。预计7日内ROI达2.5x+，新品爆发窗口期约10-14天。',
}

// 完整数据指标（按任务ID）
type MetricRow = { label: string; value: string; trend: 'up' | 'down' | 'flat'; note?: string }
const fullMetricsData: Record<number, { metrics: MetricRow[]; timeline: string[] }> = {
  1: {
    metrics: [
      { label: '直播间ROI', value: '1.8x', trend: 'down', note: '目标 3.0x，偏离 -40%' },
      { label: '在线人数', value: '1,200人', trend: 'flat', note: '正常水平' },
      { label: '转化率', value: '1.9%', trend: 'down', note: '历史均值 4.2%，↓55%' },
      { label: '客单价', value: '¥68', trend: 'up', note: '环比 +3%' },
      { label: '话术素材使用天数', value: '23天', trend: 'down', note: '疲劳阈值 15-18天' },
      { label: '备用素材B组胜率', value: 'CTR +31%', trend: 'up', note: '置信度 95%' },
    ],
    timeline: ['19:42 AI检测ROI异常下滑', '19:47 排查非流量问题', '19:51 定位为话术疲劳', '19:55 推送至人工工作台'],
  },
  2: {
    metrics: [
      { label: '小红书剩余预算', value: '¥3,200', trend: 'down', note: '日预算 ¥32,000 的 10%' },
      { label: '预计耗尽时间', value: '约1.4h后', trend: 'down', note: '按当前消耗速率' },
      { label: '快手磁力余量', value: '¥28,000', trend: 'up', note: '日预算使用率 68%' },
      { label: '小红书当前ROI', value: '2.85x', trend: 'up', note: '高于快手 2.3x' },
      { label: '调拨风险评估', value: '低', trend: 'flat', note: '快手预算充足' },
      { label: '预计恢复投放时长', value: '≤10分钟', trend: 'up', note: '调拨即时生效' },
    ],
    timeline: ['16:03 聚光预算预警触发', '16:08 AI核验快手余量', '16:12 生成调拨建议', '16:18 推送至人工工作台'],
  },
  3: {
    metrics: [
      { label: '违规素材数量', value: '3条', trend: 'down', note: 'V-0823 / V-0831 / P-0819' },
      { label: '累计曝光量', value: '214万次', trend: 'down', note: '抖音/小红书/微博' },
      { label: '违禁词类型', value: '极限用语', trend: 'down', note: '"全网最低价"' },
      { label: '处罚风险级别', value: '高', trend: 'down', note: '违反《广告法》第九条' },
      { label: '合规备选版本', value: '已就绪', trend: 'up', note: '审核号 C2024-0118' },
      { label: '预计处理耗时', value: '≤30分钟', trend: 'up', note: '可立即下架替换' },
    ],
    timeline: ['14:21 合规扫描检测到违禁词', '14:23 确认3条素材受影响', '14:26 核验备选版本可用性', '14:31 推送至人工工作台'],
  },
  4: {
    metrics: [
      { label: '当前互动率', value: '2.4%', trend: 'down', note: '历史均值 8.2%，↓70%' },
      { label: '连续异常场次', value: '3场', trend: 'down', note: '持续11天' },
      { label: '点赞/评论比', value: '>200:1', trend: 'down', note: '正常值 <50:1' },
      { label: '新榜粉丝质量评分', value: '61分', trend: 'down', note: '原89分，↓31%' },
      { label: '合同剩余费用', value: '¥38,000', trend: 'flat', note: '可依条款8.3冻结' },
      { label: '第三方检测周期', value: '2个工作日', trend: 'flat', note: '新榜/蝉妈妈' },
    ],
    timeline: ['11:15 AI达人监控发现异动', '11:22 横向对比3场直播数据', '11:30 触发虚假粉丝预警', '11:38 推送至人工工作台'],
  },
  5: {
    metrics: [
      { label: '测试CTR', value: '8.4%', trend: 'up', note: '账户均值 2.8%，提升 3x' },
      { label: 'A/B测试样本量', value: '6,142次', trend: 'up', note: '统计显著性 p<0.001' },
      { label: '置信度', value: '91%', trend: 'up', note: '高于决策阈值 85%' },
      { label: '历史同类CTR保持率', value: '87%', trend: 'up', note: '批量生产后均值' },
      { label: '预计月增GMV', value: '¥120,000+', trend: 'up', note: '按保守估算' },
      { label: '建议生产数量', value: '20条', trend: 'up', note: '3个场景版本' },
    ],
    timeline: ['09:00 A/B测试达到样本阈值', '09:04 AI统计显著性验证', '09:08 生成扩量建议', '09:15 推送至人工工作台'],
  },
  6: {
    metrics: [
      { label: '当前CPA', value: '¥45', trend: 'down', note: '目标 ¥28，偏离 +61%' },
      { label: 'oCPM出价偏高天数', value: '2天', trend: 'down', note: '连续超标' },
      { label: '系统学习进度', value: '约70%', trend: 'up', note: '3天/预计4.5天' },
      { label: '涉及广告组', value: '8组', trend: 'flat', note: '建议暂停最差3组' },
      { label: '涉及日预算', value: '¥74,000', trend: 'flat', note: '全线美妆计划' },
      { label: '建议oCPM上限', value: '¥30', trend: 'up', note: '较当前降低33%' },
    ],
    timeline: ['08:00 CPA连续2日超标预警', '08:12 AI溯源素材更新记录', '08:18 定位为学习期出价收敛慢', '08:25 推送至人工工作台'],
  },
  7: {
    metrics: [
      { label: '竞品声量增幅', value: '+292%', trend: 'down', note: '#镜面唇釉# 24h内' },
      { label: '竞品定价', value: '¥79', trend: 'flat', note: 'vs 玛丽黛佳 MR302 ¥68' },
      { label: '相似色号重叠度', value: '高', trend: 'down', note: 'AI色彩比对结果' },
      { label: '响应建议窗口', value: '48小时内', trend: 'down', note: '超时热度衰减50%' },
      { label: '建议KOC笔记数', value: '10篇', trend: 'up', note: '紧急预算 ¥50,000' },
      { label: '差异化卖点', value: '成分/亲肤感', trend: 'up', note: '避免直接价格比较' },
    ],
    timeline: ['10:05 舆情监控检测到竞品动态', '10:11 AI色彩相似度比对', '10:18 评估市场影响范围', '10:24 推送至人工工作台'],
  },
  8: {
    metrics: [
      { label: '首日互动率', value: '6.8%', trend: 'up', note: '目标 4.7%，超预期 +45%' },
      { label: '搜索量增幅', value: '+220%', trend: 'up', note: 'vs 上周同期' },
      { label: '主要搜索词', value: '品牌主动搜', trend: 'up', note: '"玛丽黛佳粉底液"' },
      { label: '新品爆发窗口', value: '10-14天', trend: 'up', note: '行业新品规律' },
      { label: '建议追加预算', value: '¥150,000', trend: 'up', note: '关键词+信息流' },
      { label: '预计7日ROI', value: '2.5x+', trend: 'up', note: '保守估算' },
    ],
    timeline: ['08:00 新品上市监控启动', '09:30 互动率超预期阈值触发', '10:15 AI评估爆发潜力', '10:22 推送至人工工作台'],
  },
}


export default function Workbench() {
  const location = useLocation()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [panelProcessed, setPanelProcessed] = useState<Record<number, 'approved' | 'rejected' | 'clarify' | null>>({})
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'confirm' | 'alert' | 'auto'>('all')
  const [showClarify, setShowClarify] = useState<number | null>(null)
  const [clarifyInput, setClarifyInput] = useState('')
  const [clarifyReplied, setClarifyReplied] = useState<Set<number>>(new Set())
  const [dataModalId, setDataModalId] = useState<number | null>(null)
  const [clarifyLoading, setClarifyLoading] = useState(false)
  const clarifyRef = useRef<HTMLTextAreaElement>(null)

  // Auto-open task if navigated from AI Decision Center
  useEffect(() => {
    const taskId = (location.state as { taskId?: number } | null)?.taskId
    if (taskId) {
      const match = initialTasks.find(t => t.id === taskId)
      if (match) setSelectedTask(match)
    }
  }, [location.state])

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const approvalCount = tasks.filter(t => t.priority === '紧急' && t.status === 'pending').length
  const confirmCount = tasks.filter(t => t.priority !== '紧急' && t.status === 'pending').length
  const alertCount = tasks.filter(t => t.confidence < 75 && t.status === 'pending').length

  const filteredTasks = activeFilter === 'all' ? tasks
    : activeFilter === 'urgent' ? tasks.filter(t => t.priority === '紧急' && t.status === 'pending')
    : activeFilter === 'confirm' ? tasks.filter(t => t.priority !== '紧急' && t.status === 'pending')
    : activeFilter === 'alert' ? tasks.filter(t => t.confidence < 75 && t.status === 'pending')
    : []  // 'auto' — handled separately

  const filterLabels: Record<typeof activeFilter, string> = {
    all: '需人工决策队列',
    urgent: '待审批 · 紧急事项',
    confirm: '待确认 · 需人工判断',
    alert: '异常告警 · 低置信度',
    auto: '今日AI自动处理摘要',
  }

  const handleAction = (id: number, action: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: action } : t))
  }

  const handlePanelAction = (id: number, action: 'approved' | 'rejected' | 'clarify') => {
    setPanelProcessed(prev => ({ ...prev, [id]: action }))
    if (action === 'approved' || action === 'rejected') {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: action } : t))
    }
  }

  // ── AI Config for 人工工作台 ──
  const aiGroups: AIConfigGroup[] = [
    {
      title: 'AI辅助决策',
      icon: <Bot size={18} />,
      params: [
        createParam('decision_confidence_threshold', '决策置信度阈值', 75, '%', 'AI建议置信度低于此值不展示给运营人员', 60, 87),
        createParam('auto_execute_threshold', '自动执行开关阈值', 92, '%', 'AI建议置信度超过此值自动执行，无需人工确认', 88, 90),
        createParam('emergency_response_time', '紧急任务响应时间', 5, '分钟', '紧急级别任务从触发到推送运营人员的最大时限', 3, 93),
        createParam('suggestion_priority_sort', '建议优先级排序', '紧急度', '', 'AI建议在工作台中的排序方式', 'AI综合排序', 88, { type: 'select', options: ['时间', '紧急度', '影响度', 'AI综合排序'] }),
      ],
    },
    {
      title: '人机协作',
      icon: <Users size={18} />,
      params: [
        createParam('manual_review_whitelist', '人工审核白名单', '合规/达人', '', '此类任务始终需要人工确认，不可自动执行', 'KOL签约', 95, { type: 'select', options: ['合规/达人', 'KOL签约', '大额预算', '全部关键决策'] }),
        createParam('batch_operation_limit', '批量操作上限', 50, '条', '单次批量操作允许的最大任务数', 100, 81),
        createParam('ai_learn_from_human', 'AI自动学习人工决策', '轻度学习', '', 'AI是否从人工审核决策中学习优化自身模型', 'AI深度学习', 87, { type: 'select', options: ['关闭', '仅记录', '轻度学习', 'AI深度学习'] }),
        createParam('operation_rollback_window', '操作回退窗口', 60, '分钟', '操作执行后允许回退的时间窗口', 30, 83),
      ],
    },
    {
      title: '通知与效率',
      icon: <Bell size={18} />,
      params: [
        createParam('critical_alert_delay', '重要告警推送延迟', 5, '秒', '重要告警从触发到推送至运营人员的最大延迟', 1, 91),
        createParam('task_auto_assign', '任务自动分配', '技能匹配', '', '任务在运营人员之间的分配策略', 'AI智能分配', 88, { type: 'select', options: ['手动', '轮询', '技能匹配', 'AI智能分配'] }),
        createParam('workload_balance_threshold', '工作负载均衡阈值', 80, '%', '单个运营人员工作负载超过此值触发任务重分配', 70, 85),
        createParam('efficiency_report_cycle', '效率报表周期', '每日', '', '工作台效率报表的生成周期', 'AI自适应', 83, { type: 'select', options: ['每日', '每周', '实时', 'AI自适应'] }),
      ],
    },
  ]

  const learningStatus: AILearningStatus = {
    modelVersion: 'v3.1.2-beauty',
    lastTraining: '2.1小时前',
    totalDataPoints: 142000,
    avgConfidence: 88,
    autoAdjustCount24h: 92,
    learningRate: '0.001 (AdamW)',
    nextTraining: '3.9小时后',
    improvementRate: '+11.3%',
  }

  useRegisterAIConfig(aiGroups, learningStatus, '人工工作台')

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Inbox size={28} color="#e8365d" />
          人工工作台
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>AI推送需要人工判断的事项 · 审批/拒绝/修改 · 其余全部自动化</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="BidOptimizer-DQN" color="#e8365d" />
        <ModelBadge name="CreativeFatigue-MAB" color="#e8365d" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
      </div>

      {/* Section 1: 待处理概览 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={20} color="#ca8a04" />
          待处理概览
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          {([
            { label: '待审批', value: approvalCount, color: '#dc2626', sub: '紧急事项', icon: Shield, filter: 'urgent' as const },
            { label: '待确认', value: confirmCount, color: '#ca8a04', sub: '需人工判断', icon: Clock, filter: 'confirm' as const },
            { label: '异常告警', value: alertCount, color: '#ea580c', sub: '低置信度', icon: AlertTriangle, filter: 'alert' as const },
            { label: '已自动处理', value: '3,472', color: '#16a34a', sub: '无需关注', icon: Bot, filter: 'auto' as const },
          ] as const).map(({ label, value, color, sub, icon: Icon, filter }) => {
            const isActive = activeFilter === filter
            return (
              <div
                key={label}
                onClick={() => setActiveFilter(isActive ? 'all' : filter)}
                style={{
                  background: isActive ? `${color}14` : 'var(--bg-primary)',
                  borderRadius: 10, padding: 16,
                  border: isActive ? `2px solid ${color}` : '1px solid var(--border-light)',
                  cursor: 'pointer', transition: 'all 0.18s',
                  boxShadow: isActive ? `0 2px 12px ${color}22` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: isActive ? color : 'var(--text-muted)', fontWeight: isActive ? 600 : 400 }}>{label}</span>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
                {isActive && (
                  <div style={{ marginTop: 6, fontSize: '0.65rem', color, fontWeight: 600 }}>▼ 当前筛选</div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ background: 'rgba(232,54,93,0.08)', border: '1px solid rgba(232,54,93,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#e8365d', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flexShrink: 0 }}>
            <Bot size={16} color="#e8365d" />
          </div>
          今日AI自动处理 <span style={{ fontWeight: 700, color: '#e8365d' }}>3,472</span> 项，仅 <span style={{ fontWeight: 700, color: '#ca8a04' }}>{pendingCount}</span> 项需要您的关注
        </div>
      </div>

      {/* Section 2: 决策队列（根据筛选切换） */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            {activeFilter === 'auto' ? <Bot size={20} color="#16a34a" /> : <Inbox size={20} color="#e8365d" />}
            {filterLabels[activeFilter]}
            {activeFilter !== 'auto' && (
              <span style={{ fontSize: '0.72rem', background: 'rgba(232,54,93,0.1)', color: '#e8365d', padding: '2px 8px', borderRadius: 20 }}>
                {filteredTasks.length} 项
              </span>
            )}
          </h2>
          {activeFilter !== 'all' && (
            <button onClick={() => setActiveFilter('all')} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
              清除筛选
            </button>
          )}
        </div>

        {/* 已自动处理视图 */}
        {activeFilter === 'auto' ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}>
              {autoSummary.map(({ label, count, icon: Icon }) => (
                <div key={label} style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <Icon size={20} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 10, padding: '12px 16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="#16a34a" /> AI全自动处理率
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>99.8%</span>
            </div>
          </div>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              当前分类暂无待处理任务 ✓
            </div>
          )}
          {filteredTasks.map(task => {
            const pri = priorityConfig[task.priority]
            const isDone = task.status !== 'pending'
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={
                  isDone
                    ? { borderRadius: 10, border: '1px solid var(--border)', padding: 16, opacity: 0.6, cursor: 'pointer' }
                    : { borderRadius: 10, border: `1px solid ${pri.borderColor}`, padding: 16, background: pri.bg, cursor: 'pointer' }
                }
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem' }}>{pri.dot}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: pri.color }}>{task.priority}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>|</span>
                      <span style={{ fontSize: '0.72rem', color: '#e8365d', fontWeight: 600 }}>{task.source}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{task.description}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{task.suggestion}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {/* Confidence */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>置信度</div>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: task.confidence >= 85 ? '#16a34a' : task.confidence >= 75 ? '#ca8a04' : '#dc2626'
                      }}>
                        {task.confidence}%
                        {task.confidence < 75 && <span style={{ fontSize: '0.72rem', marginLeft: 4 }}>→ 需确认</span>}
                      </div>
                    </div>
                    {/* Actions */}
                    {isDone ? (
                      <span style={
                        task.status === 'approved'
                          ? { fontSize: '0.72rem', background: 'rgba(22,163,74,0.12)', color: '#16a34a', padding: '6px 12px', borderRadius: 8, fontWeight: 600 }
                          : { fontSize: '0.72rem', background: 'rgba(220,38,38,0.12)', color: '#dc2626', padding: '6px 12px', borderRadius: 8, fontWeight: 600 }
                      }>
                        {task.status === 'approved' ? '已批准' : '已拒绝'}
                      </span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleAction(task.id, 'approved') }}
                          style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)', padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Check size={14} /> 批准
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleAction(task.id, 'rejected') }}
                          style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.3)', padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <X size={14} /> 拒绝
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </div>

      {/* Section 3: 今日AI自动处理摘要 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={20} color="#16a34a" />
          今日AI自动处理摘要
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}>
          {autoSummary.map(({ label, count, icon: Icon }) => (
            <div key={label} style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16, border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <Icon size={20} color="var(--text-muted)" />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 10, padding: '12px 16px' }}>
          <span style={{ fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#16a34a" />
            AI全自动处理率
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>99.8%</span>
        </div>
      </div>

      {/* Task detail panel overlay */}
      {selectedTask && (() => {
        const pri = priorityConfig[selectedTask.priority]
        const impact = taskImpact[selectedTask.id]
        const isDone = selectedTask.status !== 'pending'
        const panelAction = panelProcessed[selectedTask.id]
        return (
          <>
            {/* Overlay backdrop */}
            <div
              onClick={() => setSelectedTask(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 200, backdropFilter: 'blur(1px)' }}
            />
            {/* Detail Panel */}
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
              background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
              zIndex: 201, display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', overflowY: 'auto',
            }}>
              {/* Panel header */}
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.85rem' }}>{pri.dot}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pri.color }}>{selectedTask.priority}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>|</span>
                      <span style={{ fontSize: '0.72rem', color: '#e8365d', fontWeight: 600 }}>{selectedTask.source}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{selectedTask.description}</div>
                  </div>
                  <button
                    onClick={() => setSelectedTask(null)}
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '16px 24px', flex: 1 }}>
                {/* AI Recommendation */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bot size={13} color="#e8365d" />
                    AI建议
                  </div>
                  <div style={{ background: 'rgba(232,54,93,0.06)', border: '1px solid rgba(232,54,93,0.2)', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{impact?.fullSuggestion || selectedTask.suggestion}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>置信度</span>
                      <div style={{ flex: 1, height: 5, background: 'var(--bg-primary)', borderRadius: 3 }}>
                        <div style={{ width: `${selectedTask.confidence}%`, height: '100%', borderRadius: 3, background: selectedTask.confidence >= 85 ? '#16a34a' : selectedTask.confidence >= 75 ? '#ca8a04' : '#dc2626' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: selectedTask.confidence >= 85 ? '#16a34a' : selectedTask.confidence >= 75 ? '#ca8a04' : '#dc2626' }}>
                        {selectedTask.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Impact Analysis */}
                {impact && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BarChart2 size={13} color="#ca8a04" />
                      影响分析
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>涉及预算</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: pri.color }}>{impact.budgetAtStake}</div>
                      </div>
                      <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>影响计划</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{impact.affectedCampaigns}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {impact.dataPoints.map((pt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', padding: '5px 10px', background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border-light)' }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#e8365d', flexShrink: 0 }} />
                          <span style={{ color: 'var(--text-secondary)' }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ marginTop: 20 }}>
                  {(isDone || panelAction === 'approved' || panelAction === 'rejected') ? (
                    <div style={{
                      textAlign: 'center', padding: '16px', borderRadius: 10,
                      background: panelAction === 'approved' || selectedTask.status === 'approved' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                      border: `1px solid ${panelAction === 'approved' || selectedTask.status === 'approved' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
                      color: panelAction === 'approved' || selectedTask.status === 'approved' ? '#16a34a' : '#dc2626',
                      fontSize: '0.85rem', fontWeight: 700,
                    }}>
                      已处理 · {panelAction === 'approved' || selectedTask.status === 'approved' ? '已批准' : '已拒绝'}
                    </div>
                  ) : panelAction === 'clarify' ? (
                    <div style={{ textAlign: 'center', padding: '16px', borderRadius: 10, background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.25)', color: '#0891b2', fontSize: '0.85rem', fontWeight: 700 }}>
                      已处理 · 已要求AI补充说明
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        onClick={() => handlePanelAction(selectedTask.id, 'approved')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 12px', borderRadius: 8, border: '1px solid rgba(22,163,74,0.35)', background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Check size={15} /> 批准
                      </button>
                      <button
                        onClick={() => handlePanelAction(selectedTask.id, 'rejected')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 12px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.35)', background: 'rgba(220,38,38,0.1)', color: '#dc2626', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <X size={15} /> 拒绝
                      </button>
                      <button
                        onClick={() => { setShowClarify(showClarify === selectedTask.id ? null : selectedTask.id); setClarifyInput(''); setTimeout(() => clarifyRef.current?.focus(), 50) }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 12px', borderRadius: 8, border: `1px solid ${showClarify === selectedTask.id ? 'rgba(8,145,178,0.6)' : 'rgba(8,145,178,0.35)'}`, background: showClarify === selectedTask.id ? 'rgba(8,145,178,0.15)' : 'rgba(8,145,178,0.08)', color: '#0891b2', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <MessageCircle size={15} /> 要求补充说明
                      </button>
                      <button
                        onClick={() => setDataModalId(selectedTask.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <BarChart2 size={15} /> 查看完整数据
                      </button>
                    </div>
                  )}
                </div>

                {/* ── 要求补充说明 内嵌区 ── */}
                {showClarify === selectedTask.id && (
                  <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    {clarifyReplied.has(selectedTask.id) ? (
                      <div style={{ background: 'rgba(8,145,178,0.06)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0891b2', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Bot size={12} /> AI 补充说明
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                          {aiClarifyReplies[selectedTask.id]}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <MessageCircle size={12} color="#0891b2" /> 请说明您希望AI补充的问题（可选）
                        </div>
                        <textarea
                          ref={clarifyRef}
                          value={clarifyInput}
                          onChange={e => setClarifyInput(e.target.value)}
                          placeholder="例如：这个决策的风险有多大？有没有替代方案？"
                          rows={3}
                          style={{
                            width: '100%', borderRadius: 8, border: '1px solid rgba(8,145,178,0.3)',
                            background: 'rgba(8,145,178,0.04)', padding: '10px 12px',
                            fontSize: '0.82rem', color: 'var(--text-primary)', resize: 'none',
                            outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                          }}
                        />
                        <button
                          onClick={() => {
                            setClarifyLoading(true)
                            setTimeout(() => {
                              setClarifyReplied(prev => new Set([...prev, selectedTask.id]))
                              setClarifyLoading(false)
                            }, 1200)
                          }}
                          disabled={clarifyLoading}
                          style={{
                            marginTop: 8, display: 'flex', alignItems: 'center', gap: 6,
                            padding: '9px 18px', borderRadius: 8, border: 'none',
                            background: clarifyLoading ? 'rgba(8,145,178,0.4)' : '#0891b2',
                            color: '#fff', fontSize: '0.82rem', fontWeight: 600, cursor: clarifyLoading ? 'default' : 'pointer',
                          }}
                        >
                          {clarifyLoading
                            ? <><span style={{ display: 'inline-block', animation: 'ai-spin 1s linear infinite', fontSize: 14 }}>⟳</span> AI分析中...</>
                            : <><Send size={14} /> 发送给AI</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )
      })()}

      {/* ── 查看完整数据 浮层 ── */}
      {dataModalId && (() => {
        const task = tasks.find(t => t.id === dataModalId)
        const impact = taskImpact[dataModalId]
        const fullData = fullMetricsData[dataModalId]
        const pri = task ? priorityConfig[task.priority] : null
        if (!task || !fullData || !pri) return null
        return (
          <>
            <div onClick={() => setDataModalId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 400, backdropFilter: 'blur(2px)' }} />
            <div style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 580, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto',
              background: 'var(--bg-card)', borderRadius: 16, zIndex: 401,
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)', padding: '24px 28px',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '0.85rem' }}>{pri.dot}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: pri.color, background: pri.bg, padding: '2px 8px', borderRadius: 6 }}>{task.priority}</span>
                    <span style={{ fontSize: '0.72rem', color: '#e8365d', fontWeight: 600, background: 'rgba(232,54,93,0.1)', padding: '2px 8px', borderRadius: 6 }}>{task.source}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{task.description}</div>
                </div>
                <button onClick={() => setDataModalId(null)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>

              {/* Metrics Grid */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChart2 size={13} color="#ca8a04" /> 完整指标数据
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {fullData.metrics.map((m, i) => (
                    <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: m.trend === 'up' ? '#16a34a' : m.trend === 'down' ? '#dc2626' : 'var(--text-primary)' }}>{m.value}</span>
                        {m.trend === 'up' && <TrendingUp size={14} color="#16a34a" />}
                        {m.trend === 'down' && <TrendingDown size={14} color="#dc2626" />}
                        {m.trend === 'flat' && <Minus size={14} color="var(--text-muted)" />}
                      </div>
                      {m.note && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>{m.note}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI建议摘要 */}
              {impact && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bot size={13} color="#e8365d" /> AI分析摘要
                  </div>
                  <div style={{ background: 'rgba(232,54,93,0.05)', border: '1px solid rgba(232,54,93,0.15)', borderRadius: 10, padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {impact.fullSuggestion}
                  </div>
                </div>
              )}

              {/* 事件时间线 */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} color="#6366f1" /> AI检测时间线
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {fullData.timeline.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === fullData.timeline.length - 1 ? '#e8365d' : '#6366f1', marginTop: 4 }} />
                        {i < fullData.timeline.length - 1 && <div style={{ width: 2, height: 24, background: 'var(--border)' }} />}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: i === fullData.timeline.length - 1 ? '#e8365d' : 'var(--text-secondary)', fontWeight: i === fullData.timeline.length - 1 ? 600 : 400, paddingBottom: 16 }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}
