import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposedChart, Area, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Bot, Brain, Zap, Target, TrendingUp, DollarSign, Activity, Shield,
  AlertTriangle, ArrowUpRight, ArrowDownRight, ShoppingBag,
  Clock, Check, X, Settings
} from 'lucide-react'
import { createParam } from '../components/AIConfigPanel'
import type { AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

const tabs = ['AI实时操作面板', '跨平台智能投放', '智能出价引擎', '多平台总控与预警']

const topMetrics = [
  { label: '今日AI操作次数', value: '2,148', icon: Bot, color: '#e8365d', sub: '+18% vs 昨日' },
  { label: '人工干预次数', value: '3', icon: Shield, color: '#22c55e', sub: '极少干预' },
  { label: '人工干预率', value: '0.14%', icon: Target, color: '#ff7a95', sub: '行业最低' },
  { label: 'AI节省人力', value: '≈14运营', icon: Brain, color: '#ff9eb5', sub: '节省¥164K/月' },
  { label: 'AI操作准确率', value: '97.2%', icon: Zap, color: '#f59e0b', sub: '↑0.4% vs上周' },
]

const operationLog = [
  { time: '11:52', platform: 'Meta', action: 'CAPI事件匹配率下降至64%→AI自动触发Pixel重新校验', confidence: 88, status: '执行中' },
  { time: '11:45', platform: '抖音', action: '唇釉系列CTR下降→AI自动降出价12%→观察2h', confidence: 92, status: '执行中' },
  { time: '11:42', platform: 'TikTok', action: 'US市场创意疲劳预警→AI自动替换为新版UGC素材→CTR+18%', confidence: 91, status: '已完成' },
  { time: '11:38', platform: '小红书', action: '眼影盘新笔记通过审核→AI自动建计划3个（成分党/颜值党/学生党）', confidence: 95, status: '已完成' },
  { time: '11:35', platform: 'Google', action: 'Performance Max活动预算耗尽预警→AI上调$200/日预算', confidence: 90, status: '已完成' },
  { time: '11:30', platform: '快手', action: '粉底液计划连续3h ROI<2.0→AI关停', confidence: 97, status: '已完成' },
  { time: '11:22', platform: '天猫', action: '预算分配：唇部+¥8K，眼部-¥3K→基于实时ROI', confidence: 89, status: '已完成' },
  { time: '11:18', platform: 'Meta', action: 'EU广告账户GDPR合规检测→AI切换至兴趣定向模式', confidence: 94, status: '已完成' },
  { time: '11:15', platform: '小红书', action: 'AI发现新受众"成分党25-34F"→建种草测试计划', confidence: 78, status: '待确认' },
  { time: '11:08', platform: '抖音', action: '试色视频衰退→已自动替换为对比测评视频→CTR恢复+28%', confidence: 94, status: '已完成' },
  { time: '10:58', platform: 'TikTok', action: 'JP市场ROAS 5.1x超目标→AI自动扩量，预算+$300', confidence: 96, status: '已完成' },
  { time: '10:42', platform: '天猫', action: '618大促预热期：唇部系列预算+¥20K加速起量', confidence: 85, status: '已完成' },
  { time: '10:30', platform: '小红书', action: '卸妆水爆款笔记放量→预算+¥5K→ROI 3.4x稳定', confidence: 96, status: '已完成' },
  { time: '10:18', platform: 'Google', action: 'YouTube TrueView Lip Rouge广告完播率62%→AI提高关联商品出价', confidence: 87, status: '已完成' },
  { time: '10:05', platform: '京东', action: '粉底液品牌词搜索广告提价→竞争加剧', confidence: 72, status: '待确认' },
  { time: '09:50', platform: '抖音', action: '唇釉系列批量建计划8个→覆盖颜值党/学生党/成分党', confidence: 90, status: '执行中' },
]

const platformCards = [
  { name: '抖音巨量', api: '已连接', plans: 285, spend: '¥38万', roi: 3.42, creatives: 220, aiCreated: 24, aiStopped: 8, budgetUtil: 94, region: '国内' },
  { name: '小红书聚光', api: '已连接', plans: 185, spend: '¥24万', roi: 3.62, creatives: 128, aiCreated: 18, aiStopped: 5, budgetUtil: 88, region: '国内' },
  { name: '快手磁力', api: '已连接', plans: 198, spend: '¥16万', roi: 3.25, creatives: 165, aiCreated: 14, aiStopped: 6, budgetUtil: 85, region: '国内' },
  { name: '天猫品销宝', api: '已连接', plans: 52, spend: '¥5.5万', roi: 3.18, creatives: 48, aiCreated: 8, aiStopped: 2, budgetUtil: 78, region: '国内' },
  { name: '京东京准通', api: '已连接', plans: 28, spend: '¥3万', roi: 2.98, creatives: 32, aiCreated: 5, aiStopped: 1, budgetUtil: 72, region: '国内' },
  { name: 'Meta Ads', api: '已连接', plans: 142, spend: '$9.2万', roi: 4.05, creatives: 96, aiCreated: 22, aiStopped: 4, budgetUtil: 82, region: '国际' },
  { name: 'TikTok Global', api: '已连接', plans: 98, spend: '$6.1万', roi: 4.38, creatives: 78, aiCreated: 16, aiStopped: 3, budgetUtil: 86, region: '国际' },
  { name: 'Google · YouTube', api: '已连接', plans: 118, spend: '$7.5万', roi: 3.92, creatives: 64, aiCreated: 14, aiStopped: 2, budgetUtil: 91, region: '国际' },
]

const spendDistribution = [
  { name: '抖音巨量', value: 380000, color: '#e8365d' },
  { name: '小红书聚光', value: 240000, color: '#ff7a95' },
  { name: '快手磁力', value: 160000, color: '#ff9eb5' },
  { name: '天猫品销宝', value: 55000, color: '#ffb3c6' },
  { name: '京东', value: 30000, color: '#ffc8d5' },
  { name: 'Meta Ads', value: 92000, color: '#1877f2' },
  { name: 'TikTok Global', value: 61000, color: '#010101' },
  { name: 'Google · YouTube', value: 75000, color: '#4285f4' },
]

const platformComparison = [
  { platform: '抖音', ROI: 3.42, CPA: 26.8 },
  { platform: '小红书', ROI: 3.62, CPA: 32.5 },
  { platform: '快手', ROI: 3.25, CPA: 28.0 },
  { platform: '天猫', ROI: 3.18, CPA: 38.5 },
  { platform: '京东', ROI: 2.98, CPA: 42.0 },
  { platform: 'Meta', ROI: 4.05, CPA: 18.2 },
  { platform: 'TikTok', ROI: 4.38, CPA: 15.8 },
  { platform: 'Google', ROI: 3.92, CPA: 21.4 },
]

const crossPlatformStrategies = [
  '唇釉试色视频在抖音CTR 7.2%但在快手仅3.8%→AI仅在抖音/小红书放量',
  '卸妆水品类小红书ROI 3.4x领先→AI增加该品类小红书预算+35%',
  '成分党人群在小红书搜索增量+38%→AI优先在小红书种草该人群',
  'TikTok Global JP市场ROAS 5.1x领先全球→AI自动将JP日预算+$300',
  'Meta EU市场因ATT限制导致CVR较US低18%→AI自动切换CAPI归因+兴趣定向',
  'Google YouTube完播率+唇釉品牌词搜索联动效果优异→AI提高YouTube出价',
]

const bidTrendData = [
  { hour: '05:00', 抖音: 28.5, 小红书: 35.2, 快手: 22.8, Meta: 12.4, TikTok: 10.8, Google: 18.2 },
  { hour: '07:00', 抖音: 32.1, 小红书: 38.5, 快手: 25.4, Meta: 15.2, TikTok: 14.5, Google: 22.8 },
  { hour: '08:00', 抖音: 38.5, 小红书: 42.0, 快手: 30.2, Meta: 18.5, TikTok: 17.2, Google: 26.4 },
  { hour: '09:00', 抖音: 42.8, 小红书: 48.5, 快手: 35.8, Meta: 22.4, TikTok: 20.8, Google: 31.5 },
  { hour: '10:00', 抖音: 40.2, 小红书: 45.8, 快手: 33.5, Meta: 24.8, TikTok: 22.5, Google: 34.2 },
  { hour: '11:00', 抖音: 44.5, 小红书: 50.2, 快手: 38.5, Meta: 28.2, TikTok: 25.4, Google: 38.8 },
  { hour: '12:00', 抖音: 48.0, 小红书: 52.5, 快手: 40.8, Meta: 32.5, TikTok: 29.8, Google: 42.5 },
]

const bidDecisions = [
  { plan: 'CP-2401', from: '¥35', to: '¥42', reason: '唇釉转化率高，ROI 3.8→提bid抢量', platform: '抖音' },
  { plan: 'CP-2389', from: '¥28', to: '¥24', reason: '凌晨竞争减弱→降低出价节省15%成本', platform: '快手' },
  { plan: 'CP-2403', from: '¥45', to: '¥0', reason: '粉底液连续3h ROI<2.0→关停止损', platform: '快手' },
  { plan: 'CP-2412', from: '¥0.8', to: '¥1.2', reason: '卸妆水新笔记CPE优秀→提价抢量 ROI 3.4x', platform: '小红书' },
  { plan: 'CP-2395', from: '¥38', to: '¥34', reason: 'CPA超目标10%→微调降价观察', platform: '抖音' },
]

const bidConfidence = [
  { name: '高信心(>90%)', value: 582, color: '#22c55e' },
  { name: '中信心(75-90%)', value: 168, color: '#f59e0b' },
  { name: '低信心(<75%)', value: 38, color: '#ef4444' },
]

const businessLines = [
  { name: '抖音', icon: ShoppingBag, spend: '¥38万', revenue: '¥124万', roi: 3.42, plans: 285, aiOps: 724, color: '#e8365d', route: '/ads/douyin', region: '国内' },
  { name: '小红书', icon: ShoppingBag, spend: '¥24万', revenue: '¥89万', roi: 3.62, plans: 185, aiOps: 518, color: '#ff7a95', route: '/ads/xiaohongshu', region: '国内' },
  { name: '快手', icon: ShoppingBag, spend: '¥16万', revenue: '¥52万', roi: 3.25, plans: 198, aiOps: 465, color: '#ff9eb5', route: '/ads/kuaishou', region: '国内' },
  { name: 'Meta Ads', icon: ShoppingBag, spend: '$9.2万', revenue: '$37万', roi: 4.05, plans: 142, aiOps: 386, color: '#1877f2', route: '/intl/facebook', region: '国际' },
  { name: 'TikTok Global', icon: ShoppingBag, spend: '$6.1万', revenue: '$26万', roi: 4.38, plans: 98, aiOps: 284, color: '#010101', route: '/intl/tiktok', region: '国际' },
  { name: 'Google · YouTube', icon: ShoppingBag, spend: '$7.5万', revenue: '$29万', roi: 3.92, plans: 118, aiOps: 318, color: '#4285f4', route: '/intl/google', region: '国际' },
]

const alerts = [
  { severity: 'red', title: '抖音账户消耗异常激增', desc: '账户AC-0012过去1h消耗¥12万，超日常3倍', aiAction: 'AI已自动降低该账户预算50%并暂停新建计划' },
  { severity: 'red', title: '小红书笔记审核拒绝率上升', desc: '最近10篇笔记中5篇被拒，可能触发平台合规风控', aiAction: 'AI已暂停该账户投放，建议人工检查笔记内容合规性' },
  { severity: 'red', title: 'Meta EU账户Policy违规警告', desc: 'EU广告账户因年龄定向问题收到Meta合规警告', aiAction: 'AI已暂停EU投放，切换至兴趣+行为定向，等待人工合规审查' },
  { severity: 'yellow', title: '快手CPM持续上升', desc: '过去6h CPM从¥32升至¥48，上涨50%', aiAction: 'AI建议降低快手预算15%，转移至抖音/小红书' },
  { severity: 'yellow', title: 'TikTok Global US创意疲劳预警', desc: '3支主力视频CTR连续下降，预计24h内进入疲劳区', aiAction: 'AI已准备3支备用素材，建议72h内完成替换' },
  { severity: 'yellow', title: '高光修容ROI边际下降', desc: '日ROI从2.8降至2.39，连续3日下滑趋势', aiAction: 'AI建议更换Top素材，测试"before/after"新角度' },
  { severity: 'yellow', title: 'Google UK汇率波动影响ROAS', desc: 'GBP/USD波动导致实际ROAS较目标低0.3x', aiAction: 'AI建议开启Google汇率对冲预算，分散风险' },
  { severity: 'green', title: 'TikTok JP市场爆发', desc: 'JP市场ROAS 5.1x超目标，唇釉品类热度↑↑', aiAction: 'AI已自动扩量，JP日预算+$300，持续放量' },
  { severity: 'green', title: '小红书卸妆水笔记表现突出', desc: '"敏感肌卸妆推荐"笔记互动率12.5%，ROI 3.8x', aiAction: 'AI已自动放量，预算+¥8K' },
  { severity: 'green', title: '抖音成分党定向效果优异', desc: '唇釉系列ROI 4.2x，环比增长18%', aiAction: 'AI维持当前策略，持续监控' },
  { severity: 'green', title: 'Meta US Advantage+受众扩展成功', desc: 'Advantage+智能受众ROAS 4.2x超手动定向1.3x', aiAction: 'AI已将US主力活动全面切换至Advantage+模式' },
]

const humanInterventions = [
  { title: '618大促预算翻倍决策：唇部系列+¥100K/天', desc: 'AI评估618期间唇部系列潜力大，建议大幅增加预算，但金额超自动审批阈值', confidence: 85 },
  { title: '达人合作方向决策：是否启用头部KOL', desc: 'A/B测试显示腰部KOC内容ROI更高，但头部KOL能带来更大品牌声量，需人工判断', confidence: 62 },
  { title: '跨品类素材方向：是否启用UGC风格种草', desc: 'AI测试数据显示UGC风格互动率高但品牌调性存疑，需人工审批', confidence: 68 },
]

const platformColorMap: Record<string, string> = {
  '抖音': '#e8365d', '小红书': '#ff7a95', '快手': '#ff9eb5', '天猫': '#ffb3c6', '京东': '#ffc8d5',
  'Meta': '#1877f2', 'TikTok': '#010101', 'Google': '#4285f4',
}

const severityIcon: Record<string, string> = { red: '🔴', yellow: '🟡', green: '🟢' }

function getStatusStyle(status: string): { background: string; color: string } {
  if (status === '执行中') return { background: 'rgba(232,54,93,0.15)', color: '#e8365d' }
  if (status === '已完成') return { background: 'rgba(34,197,94,0.15)', color: '#16a34a' }
  return { background: 'rgba(234,179,8,0.15)', color: '#ca8a04' }
}

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

export default function AdPlacement() {
  const [activeTab, setActiveTab] = useState(0)
  const navigate = useNavigate()
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [approvedItems, setApprovedItems] = useState<number[]>([])
  const [deferredItems, setDeferredItems] = useState<number[]>([])

  const showActionFeedback = (msg: string) => {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(null), 3500)
  }

  const adPlacementAIGroups: AIConfigGroup[] = [
    {
      title: 'DQN竞价引擎',
      icon: <Bot size={20} style={{ color: '#e8365d' }} />,
      params: [
        createParam('bid_lr', '出价学习率', 0.001, '', 'DQN竞价网络权重更新步长，影响出价策略收敛速度', 0.0008, 91, { min: 0.0001, max: 0.01, step: 0.0001, learningDataPoints: 58200, adjustHistory: [
          { time: '2小时前', from: '0.0012', to: '0.001', reason: '抖音CPC上涨8%，AI降低学习率避免过拟合' },
          { time: '昨日 14:00', from: '0.0015', to: '0.0012', reason: '竞价模型loss收敛变慢，自动微调步长' },
        ] }),
        createParam('epsilon', '探索率', 0.15, '', '平衡探索新出价策略与利用已知最优策略的比例', 0.12, 88, { min: 0.01, max: 0.5, step: 0.01, learningDataPoints: 45800, adjustHistory: [
          { time: '4小时前', from: '0.18', to: '0.15', reason: '模型已稳定收敛，AI降低探索率减少无效花费' },
          { time: '2天前', from: '0.12', to: '0.18', reason: '检测到竞品新策略，临时提高探索率' },
        ] }),
        createParam('gamma', '折扣因子', 0.95, '', '控制未来ROI奖励的折现权重，越高越关注长期回报', 0.97, 85, { min: 0.8, max: 0.99, step: 0.01, autoTuneEnabled: false, learningDataPoints: 52100, adjustHistory: [
          { time: '昨日', from: '0.93', to: '0.95', reason: '运营要求更关注长期GMV，手动提高折扣因子' },
        ] }),
        createParam('batch_size', '批量大小', 64, 'samples', '每次梯度更新使用的样本数', 128, 82, { min: 16, max: 512, step: 16, learningDataPoints: 31500, adjustHistory: [
          { time: '3天前', from: '32', to: '64', reason: '数据量增长，AI自动增大batch提升训练效率' },
        ] }),
      ],
    },
    {
      title: '跨平台预算',
      icon: <DollarSign size={20} style={{ color: '#e8365d' }} />,
      params: [
        createParam('douyin_budget_pct', '抖音预算占比', 44, '%', '抖音巨量引擎日预算分配比例', 42, 87, { min: 20, max: 70, step: 1, learningDataPoints: 42300, adjustHistory: [
          { time: '6小时前', from: '48', to: '44', reason: '小红书种草效率提升，AI调拨部分预算至小红书' },
          { time: '昨日 20:00', from: '42', to: '48', reason: '抖音618预热期，AI提升预算抢量' },
        ] }),
        createParam('xiaohongshu_budget_pct', '小红书预算占比', 28, '%', '小红书聚光平台日预算占比', 30, 86, { min: 15, max: 55, step: 1, learningDataPoints: 39800, adjustHistory: [
          { time: '6小时前', from: '25', to: '28', reason: '小红书种草指数提升，AI自动加码' },
          { time: '2天前', from: '28', to: '25', reason: '小红书大盘CPE上涨，AI临时收缩预算' },
        ] }),
        createParam('kuaishou_budget_pct', '快手预算占比', 18, '%', '快手磁力引擎日预算占比', 18, 90, { min: 10, max: 40, step: 1, learningDataPoints: 35200, adjustHistory: [
          { time: '昨日', from: '20', to: '18', reason: '快手CPM上升，AI降低快手预算占比' },
        ] }),
        createParam('dynamic_realloc_cap', '动态调拨幅度上限', 15, '%', '单次跨平台AI自动调拨预算的最大比例，超过需人工审批', 20, 83, { min: 5, max: 30, step: 1, autoTuneEnabled: false, learningDataPoints: 15600, adjustHistory: [
          { time: '1周前', from: '10', to: '15', reason: '运营团队评估后手动放宽调拨上限' },
        ] }),
      ],
    },
    {
      title: '平台ROI目标',
      icon: <TrendingUp size={20} style={{ color: '#e8365d' }} />,
      params: [
        createParam('douyin_roi', '抖音ROI目标', 3.2, 'x', '抖音巨量引擎综合ROI目标', 3.0, 89, { min: 1.5, max: 8.0, step: 0.1, learningDataPoints: 67800, adjustHistory: [
          { time: '1小时前', from: '3.0', to: '3.2', reason: '唇釉系列表现超预期，AI上调ROI目标' },
          { time: '昨日', from: '3.2', to: '3.0', reason: '新品冷启动期，AI临时下调目标' },
        ] }),
        createParam('xiaohongshu_roi', '小红书ROI目标', 3.5, 'x', '小红书聚光平台综合ROI目标（含种草GMV转化）', 3.2, 87, { min: 1.5, max: 8.0, step: 0.1, learningDataPoints: 54200, adjustHistory: [
          { time: '3小时前', from: '3.2', to: '3.5', reason: '小红书种草转化率提升，ROI稳步上升' },
          { time: '2天前', from: '3.5', to: '3.2', reason: '搜索广告竞价加剧，AI降低目标避免亏损' },
        ] }),
        createParam('kuaishou_roi', '快手ROI目标', 3.0, 'x', '快手磁力引擎ROI目标，短视频美妆带货驱动', 2.8, 85, { min: 1.5, max: 6.0, step: 0.1, learningDataPoints: 38900, adjustHistory: [
          { time: '昨日 22:00', from: '2.8', to: '3.0', reason: '快手晚间流量高峰转化好，AI上调ROI目标' },
        ] }),
        createParam('tmall_roi', '天猫ROI目标', 3.0, 'x', '天猫品销宝ROI目标，含旗舰店直通车', 2.8, 81, { min: 1.5, max: 8.0, step: 0.1, autoTuneEnabled: false, learningDataPoints: 22100, adjustHistory: [
          { time: '1周前', from: '2.5', to: '3.0', reason: '天猫618大促期间，手动上调ROI目标' },
        ] }),
      ],
    },
    {
      title: '投放策略',
      icon: <Settings size={20} style={{ color: '#e8365d' }} />,
      params: [
        createParam('time_bid_adjust', '时段出价调整', '关闭', '', '基于用户活跃时段自动调整出价，高峰期加价/低谷期降价', 'AI全时段优化', 93, { type: 'select', options: ['关闭', '高峰期加价', '低谷期降价', 'AI全时段优化'], learningDataPoints: 71200, adjustHistory: [
          { time: '30分钟前', from: '高峰期加价', to: 'AI全时段优化', reason: 'AI检测到凌晨时段ROI反超白天，切换全时段优化' },
        ] }),
        createParam('freq_cap', '频次控制', 3, '次/天/人', '单用户每天最大广告展示次数，防止过度曝光', 4, 84, { min: 1, max: 10, step: 1, learningDataPoints: 44600, adjustHistory: [
          { time: '昨日', from: '5', to: '3', reason: '用户屏蔽率上升，AI降低频次上限' },
        ] }),
        createParam('cold_start_budget', '新素材冷启动预算', 3000, '¥', '新创意素材首次投放的测试预算，用于快速验证素材效果', 5000, 80, { min: 500, max: 20000, step: 500, autoTuneEnabled: false, learningDataPoints: 12300, adjustHistory: [
          { time: '3天前', from: '2000', to: '3000', reason: '测试预算不足导致数据不稳定，手动上调' },
        ] }),
      ],
    },
  ]

  const adPlacementLearningStatus: AILearningStatus = {
    modelVersion: 'v4.1.0-beauty',
    lastTraining: '22分钟前',
    totalDataPoints: 1280000,
    avgConfidence: 91,
    autoAdjustCount24h: 2148,
    learningRate: '0.001 (Adam)',
    nextTraining: '38分钟后',
    improvementRate: '+7.2%',
  }
  useRegisterAIConfig(adPlacementAIGroups, adPlacementLearningStatus, '美妆智能投流总控台')

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 20px' }}>
        <div className="page-header">
          <h2>美妆智能投流总控台</h2>
          <p>抖音巨量 · 小红书聚光 · 快手磁力 · 天猫品销宝 · AI自动驾驶投放 · 今日消耗¥86.5万 / GMV¥295万</p>
        </div>
        <div className="page-content">
          {/* ── AI模型支撑 ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
            <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
            <ModelBadge name="CVR-Predictor-ESMM" color="#e8365d" />
            <ModelBadge name="BidOptimizer-DQN" color="#f97316" />
            <ModelBadge name="TrafficPacing-RL" color="#f97316" />
            <ModelBadge name="CreativeFatigue-MAB" color="#8b5cf6" />
            <ModelBadge name="BudgetMO-Optimizer" color="#06b6d4" />
            <ModelBadge name="AnomalyDetector-LSTM" color="#f59e0b" />
          </div>

          {/* ── AI决策中心 · 当前执行状态 ── */}
          {(() => {
            const activeDecisions = [
              { id: 'DC-001', title: '抖音底妆CPA飙升，建议降出价15%', confidence: 94, status: '执行中', model: 'BidOptimizer-DQN', platform: '抖音', impact: '预计节省¥3,200/日', time: '11:45' },
              { id: 'DC-008', title: '快手素材疲劳检测，自动轮换3组新素材', confidence: 88, status: '已完成', model: 'CreativeFatigue-MAB', platform: '快手', impact: 'CTR恢复+18%', time: '11:30' },
              { id: 'DC-012', title: '小红书竞品暂停投放，建议抢量扩充预算', confidence: 91, status: '待确认', model: 'CompetitorIntel-NLP', platform: '小红书', impact: '预计增量GMV ¥8,500', time: '11:15' },
              { id: 'DC-015', title: '预算时段重分配：21-23点黄金时段加码', confidence: 89, status: '执行中', model: 'TrafficPacing-RL', platform: '全平台', impact: '预计ROI+0.3x', time: '11:00' },
              { id: 'DC-019', title: '新品冷启动：唇釉2025新色号AI建计划', confidence: 85, status: '待确认', model: 'NewSKU-ColdStart', platform: '抖音+小红书', impact: '覆盖目标人群42万', time: '10:50' },
            ]
            const statusStyle: Record<string, { background: string; color: string }> = {
              '执行中': { background: 'rgba(52,211,153,0.12)', color: '#34d399' },
              '已完成': { background: 'rgba(99,102,241,0.12)', color: '#818cf8' },
              '待确认': { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
            }
            const platformColor: Record<string, string> = {
              '抖音': '#e8365d', '快手': '#f97316', '小红书': '#ec4899', '全平台': '#06b6d4', '抖音+小红书': '#8b5cf6',
            }
            return (
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 当前执行状态</span>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>实时同步</span>
                  </div>
                  <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.68rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 6, transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    查看全部决策 →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {activeDecisions.map(d => (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 36, flexShrink: 0 }}>{d.time}</span>
                      <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 6, background: `${platformColor[d.platform] || '#e8365d'}18`, color: platformColor[d.platform] || '#e8365d', flexShrink: 0, fontWeight: 600 }}>{d.platform}</span>
                      <span style={{ flex: 1, fontSize: '0.74rem' }}>{d.title}</span>
                      <ModelBadge name={d.model} color="#818cf8" />
                      <span style={{ fontSize: '0.65rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                      <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: 6, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                      <span style={{ fontSize: '0.62rem', color: d.confidence >= 90 ? '#34d399' : '#fbbf24', flexShrink: 0 }}>{d.confidence}%置信</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Top KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
            {topMetrics.map((m, i) => (
              <div key={i} className="card" style={{ borderTop: `3px solid ${m.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <m.icon size={18} color={m.color} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.label}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{m.value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 16 }}>
            {tabs.map((tab, i) => (
              <button key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>{tab}</button>
            ))}
          </div>

          {/* Tab 0: AI实时操作面板 */}
          {activeTab === 0 && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title"><Bot size={16} /> AI实时操作流水</div>
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {operationLog.map((op, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 38, flexShrink: 0, fontFamily: 'monospace' }}>{op.time}</span>
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: `${platformColorMap[op.platform] || '#e8365d'}20`, color: platformColorMap[op.platform] || '#e8365d', flexShrink: 0 }}>{op.platform}</span>
                      <span style={{ fontSize: '0.75rem', flex: 1 }}>{op.action}</span>
                      <span style={{ fontSize: '0.65rem', color: op.confidence >= 90 ? '#34d399' : op.confidence >= 80 ? '#fbbf24' : '#f87171' }}>{op.confidence}%</span>
                      <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: 4, ...getStatusStyle(op.status) }}>{op.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {businessLines.map((line, i) => (
                  <div key={i} className="card" style={{ cursor: 'pointer', borderLeft: `4px solid ${line.color}` }}
                    onClick={() => navigate(line.route)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <line.icon size={16} color={line.color} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{line.name}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>今日消耗</div><div style={{ fontWeight: 700 }}>{line.spend}</div></div>
                      <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>今日GMV</div><div style={{ fontWeight: 700 }}>{line.revenue}</div></div>
                      <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>ROI</div><div style={{ fontWeight: 700, color: line.roi >= 3.0 ? '#34d399' : '#fbbf24' }}>{line.roi}x</div></div>
                      <div><div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>AI操作</div><div style={{ fontWeight: 700, color: line.color }}>{line.aiOps}次</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 1: 跨平台智能投放 */}
          {activeTab === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
                {platformCards.map((p, i) => (
                  <div key={i} className="card" style={{ borderTop: '3px solid #e8365d' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>{p.name}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span style={{ padding: '1px 5px', borderRadius: 4, background: p.api === '已连接' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: p.api === '已连接' ? '#34d399' : '#fbbf24' }}>{p.api}</span>
                    </div>
                    {[
                      { label: '活跃计划', value: p.plans },
                      { label: '今日消耗', value: p.spend },
                      { label: 'ROI', value: `${p.roi}x` },
                      { label: 'AI建/停', value: `+${p.aiCreated}/-${p.aiStopped}` },
                      { label: '预算利用率', value: `${p.budgetUtil}%` },
                    ].map((m, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', padding: '3px 0', borderBottom: j < 4 ? '1px solid var(--border-light)' : 'none' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                        <span style={{ fontWeight: 600 }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="section-title">消耗分布</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <PieChart width={150} height={150}>
                      <Pie data={spendDistribution} cx={70} cy={70} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                        {spendDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                    <div style={{ flex: 1 }}>
                      {spendDistribution.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                          <span style={{ fontSize: '0.75rem', flex: 1 }}>{s.name}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>¥{(s.value / 10000).toFixed(0)}万</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="section-title">平台ROI & CPA对比</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={platformComparison}>
                      <XAxis dataKey="platform" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="ROI" fill="#e8365d" name="ROI" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ marginTop: 12 }}>
                <div className="section-title"><Zap size={16} /> 跨平台智能策略</div>
                {crossPlatformStrategies.map((s, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: i < crossPlatformStrategies.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: '0.78rem' }}>
                    <span style={{ color: '#e8365d', marginRight: 8 }}>✦</span>{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: 智能出价引擎 */}
          {activeTab === 2 && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title"><TrendingUp size={16} /> 各平台CPM实时趋势</div>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={bidTrendData}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `¥${v}`} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="抖音" stroke="#e8365d" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="小红书" stroke="#ff7a95" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="快手" stroke="#ff9eb5" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="section-title">AI出价决策记录</div>
                  {bidDecisions.map((b, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: i < bidDecisions.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{b.plan}</span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(232,54,93,0.1)', color: '#e8365d' }}>{b.platform}</span>
                        <span style={{ fontSize: '0.72rem', color: '#ef4444', marginLeft: 'auto' }}>{b.from}</span>
                        <span style={{ fontSize: '0.7rem' }}>→</span>
                        <span style={{ fontSize: '0.72rem', color: b.to === '¥0' ? '#ef4444' : '#34d399', fontWeight: 700 }}>{b.to}</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{b.reason}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="section-title">出价决策置信度分布</div>
                  <PieChart width={200} height={150} style={{ margin: '0 auto' }}>
                    <Pie data={bidConfidence} cx={95} cy={70} innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={2}>
                      {bidConfidence.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                  {bidConfidence.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: b.color }} />
                      <span style={{ fontSize: '0.72rem', flex: 1 }}>{b.name}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{b.value}次</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 总控与预警 */}
          {activeTab === 3 && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="section-title"><AlertTriangle size={16} /> 全平台预警（需人工关注）</div>
                {alerts.map((a, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < alerts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span>{severityIcon[a.severity]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{a.desc}</div>
                        <div style={{ fontSize: '0.72rem', color: '#e8365d' }}>AI行动：{a.aiAction}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-title"><Shield size={16} /> 需要人工决策的事项</div>
                {humanInterventions.map((h, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: i < humanInterventions.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{h.title}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, background: h.confidence >= 80 ? 'rgba(52,211,153,0.1)' : 'rgba(245,158,11,0.1)', color: h.confidence >= 80 ? '#34d399' : '#fbbf24' }}>置信度 {h.confidence}%</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{h.desc}</div>
                    {approvedItems.includes(i) ? (
                      <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>✅ 已批准执行，AI投手将在下个竞价周期生效</div>
                    ) : deferredItems.includes(i) ? (
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>⏸ 已暂缓，任务将在24小时后重新评估</div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          style={{ padding: '4px 12px', borderRadius: 6, background: '#e8365d', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.72rem' }}
                          onClick={() => { setApprovedItems(prev => [...prev, i]); showActionFeedback('✅ 已批准执行，AI投手将在下个竞价周期生效') }}
                        >批准执行</button>
                        <button
                          style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.72rem' }}
                          onClick={() => { setDeferredItems(prev => [...prev, i]); showActionFeedback('⏸ 已暂缓，任务将在24小时后重新评估') }}
                        >暂缓</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,30,40,0.92)', color: '#fff', padding: '10px 24px',
          borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none',
        }}>
          {actionFeedback}
        </div>
      )}
    </div>
  )
}
