import { useState } from 'react'
import {
  Users, UserPlus, MessageSquare, Star, TrendingUp,
  Activity, Target, Gift, BarChart3, Bot, Zap
} from 'lucide-react'
import {
  Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Line
} from 'recharts'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import ModelBadge from '../components/ModelBadge'
import { useRegisterAIConfig } from '../context/AIConfigContext'

/* ═══════════════════════════════════════════════════════════════
   达人与用户运营中心 —— KOL/KOC运营·消费者分层·活动自动化·社群客服
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['达人运营', '消费者分层', '活动自动化', '社群与客服']

// ===== Tab1: 达人运营 =====
const influencers = [
  { name: '李佳琦助播团', platform: '抖音', followers: '2.3M', tier: 'KOL', status: 'active', gmv: 234560, commission: 23456, ctr: 5.2, content: 156 },
  { name: '美妆日记Vivi', platform: '小红书', followers: '890K', tier: 'KOL', status: 'active', gmv: 182340, commission: 18234, ctr: 4.8, content: 89 },
  { name: '樱桃美妆', platform: '抖音', followers: '1.5M', tier: 'KOL', status: 'active', gmv: 345670, commission: 34567, ctr: 5.6, content: 203 },
  { name: '护肤成分党小F', platform: '小红书', followers: '670K', tier: 'KOC', status: 'active', gmv: 123450, commission: 12345, ctr: 4.1, content: 67 },
  { name: '快手美妆达人Linda', platform: '快手', followers: '3.1M', tier: 'KOL', status: 'pending', gmv: 0, commission: 0, ctr: 0, content: 0 },
  { name: '素人测评阿七', platform: '小红书', followers: '450K', tier: 'KOC', status: 'active', gmv: 89760, commission: 8976, ctr: 3.9, content: 45 },
  { name: '唇釉收藏家', platform: '抖音', followers: '780K', tier: 'KOC', status: 'active', gmv: 421500, commission: 42150, ctr: 6.2, content: 112 },
  { name: '美妆博主Momo', platform: '快手', followers: '1.8M', tier: 'KOL', status: 'active', gmv: 158900, commission: 15890, ctr: 4.8, content: 178 },
]

const influencerTrend = [
  { month: '10月', active: 120, new: 25, gmv: 180 },
  { month: '11月', active: 145, new: 30, gmv: 220 },
  { month: '12月', active: 168, new: 28, gmv: 285 },
  { month: '1月', active: 185, new: 22, gmv: 310 },
  { month: '2月', active: 205, new: 35, gmv: 345 },
  { month: '3月', active: 228, new: 38, gmv: 380 },
]

// ===== Tab2: 消费者分层 =====
const userSegments = [
  { segment: '高价值消费者', count: '2.3万', arpu: '¥850', retention30: '82%', ltv: '¥4,200', strategy: '专属VIP福利+新品优先体验', color: '#f59e0b' },
  { segment: '活跃种草用户', count: '12.8万', arpu: '¥250', retention30: '65%', ltv: '¥1,200', strategy: '内容种草引导+限时优惠', color: '#3b82f6' },
  { segment: '偶发购买用户', count: '45.6万', arpu: '¥85', retention30: '42%', ltv: '¥280', strategy: '复购提醒+场景种草', color: '#22c55e' },
  { segment: '浏览未购用户', count: '320万', arpu: '¥0', retention30: '18%', ltv: '¥35', strategy: '种草内容推送+首单优惠', color: '#6b7280' },
  { segment: '流失预警', count: '23.4万', arpu: '-', retention30: '<5%', ltv: '-', strategy: 'AI召回推送+专属优惠券', color: '#ef4444' },
]

const userFunnel = [
  { stage: '曝光触达', value: 456000, pct: 100 },
  { stage: '内容停留', value: 382000, pct: 83.8 },
  { stage: '加购收藏', value: 89000, pct: 19.5 },
  { stage: '首次下单', value: 42000, pct: 9.2 },
  { stage: '复购用户', value: 12500, pct: 2.7 },
]

const segmentTrend = [
  { month: '10月', highValue: 18000, active: 95000, casual: 380000 },
  { month: '11月', highValue: 19500, active: 105000, casual: 400000 },
  { month: '12月', highValue: 21000, active: 115000, casual: 420000 },
  { month: '1月', highValue: 22000, active: 120000, casual: 435000 },
  { month: '2月', highValue: 22500, active: 125000, casual: 448000 },
  { month: '3月', highValue: 23000, active: 128000, casual: 456000 },
]

// ===== Tab3: 活动自动化 =====
const activities = [
  { name: '新用户7天签到领小样', type: '留存', status: 'active', participants: 234567, conversion: 67, gmv: '¥125万', aiDesigned: true },
  { name: '邀请好友得优惠券', type: '裂变', status: 'active', participants: 89012, conversion: 34, gmv: '¥45万', aiDesigned: true },
  { name: '每日种草任务奖励', type: '活跃', status: 'active', participants: 456789, conversion: 82, gmv: '¥210万', aiDesigned: false },
  { name: '618大促新品首发礼包', type: '大促', status: 'active', participants: 12345, conversion: 45, gmv: '¥88万', aiDesigned: true },
  { name: 'KOC专属素材包', type: '分销', status: 'active', participants: 5678, conversion: 78, gmv: '¥32万', aiDesigned: false },
  { name: '周末限时折扣', type: '大促', status: 'scheduled', participants: 0, conversion: 0, gmv: '-', aiDesigned: true },
  { name: '新品试用申请活动', type: '留存', status: 'active', participants: 78900, conversion: 55, gmv: '¥165万', aiDesigned: true },
  { name: '美妆挑战赛话题', type: '活跃', status: 'active', participants: 34567, conversion: 72, gmv: '¥58万', aiDesigned: false },
]

const activityROI = [
  { type: '留存', avgROI: 3.8, count: 12, spend: '¥85万' },
  { type: '裂变', avgROI: 5.2, count: 8, spend: '¥45万' },
  { type: '大促', avgROI: 2.5, count: 15, spend: '¥120万' },
  { type: '活跃', avgROI: 4.1, count: 10, spend: '¥65万' },
]

// ===== Tab4: 社群与客服 =====
const customerServiceStats = {
  todaySessions: 45678,
  autoResolveRate: 96.8,
  avgResponseTime: '<3s',
  activeCommunities: 1234,
}

const topQuestions = [
  { question: '订单发货/物流查询', pct: 22, autoResolved: true },
  { question: '色号选择/肤色匹配建议', pct: 18, autoResolved: true },
  { question: '退换货相关', pct: 12, autoResolved: false },
  { question: '过敏/皮肤刺激咨询', pct: 10, autoResolved: false },
  { question: '活动优惠券未到账', pct: 8, autoResolved: true },
  { question: '产品成分咨询', pct: 7, autoResolved: true },
  { question: '赠品未收到', pct: 5, autoResolved: true },
]

const serviceTrend = [
  { day: '3/28', sessions: 42000, autoRate: 95.8 },
  { day: '3/29', sessions: 44500, autoRate: 96.1 },
  { day: '3/30', sessions: 48200, autoRate: 96.3 },
  { day: '3/31', sessions: 43800, autoRate: 96.5 },
  { day: '4/01', sessions: 45100, autoRate: 96.6 },
  { day: '4/02', sessions: 46200, autoRate: 96.7 },
  { day: '4/03', sessions: 45678, autoRate: 96.8 },
]

// ===== AI配置 =====
const opsAIConfigGroups: AIConfigGroup[] = [
  {
    title: '消费者分层模型',
    icon: <Users size={16} />,
    params: [
      createParam('ltv_threshold', '高价值用户复购价值阈值', 2000, '¥', '累计复购价值超过此值归为高价值消费者, 触发VIP运营策略和专属推送', 2500, 87, { min: 500, max: 10000, step: 100, learningDataPoints: 47200, adjustHistory: [
        { time: '昨日', from: '1500', to: '2000', reason: '高价值用户池过大导致运营资源稀释, AI上调阈值聚焦核心用户' },
        { time: '3天前', from: '2500', to: '1500', reason: '新品上市期用户GMV偏低, AI降低阈值扩大高价值覆盖' },
      ] }),
      createParam('churn_warning_days', '流失预警天数', 7, '天未互动', '用户连续N天未浏览或购买触发流失预警, 自动下发挽留推送/优惠券', 5, 85, { min: 2, max: 30, step: 1, learningDataPoints: 39800, adjustHistory: [
        { time: '2天前', from: '5', to: '7', reason: '美妆用户自然回归周期较长, AI延长预警天数减少误报' },
        { time: '5天前', from: '10', to: '5', reason: '挽留活动效果在5天内最佳, AI缩短预警窗口' },
      ] }),
      createParam('segment_refresh_freq', '自动分层刷新频率', 24, '小时', '消费者分层模型根据最新行为数据重新计算分层的间隔', 12, 83, { min: 4, max: 72, step: 4, learningDataPoints: 28600, adjustHistory: [
        { time: '昨日', from: '12', to: '24', reason: '频繁刷新消耗大量计算资源, AI拉长间隔' },
        { time: '4天前', from: '48', to: '12', reason: '促销期间用户行为变化快, AI加快刷新频率' },
      ] }),
      createParam('segment_features', '分层模型特征数', 50, '个', '消费者分层XGBoost模型使用的特征维度数(购买/浏览/收藏/评论等)', 80, 80, { min: 20, max: 200, step: 10, autoTuneEnabled: false, learningDataPoints: 15400, adjustHistory: [
        { time: '2周前', from: '30', to: '50', reason: '新增收藏和搜索行为特征, 手动扩展特征维度' },
      ] }),
      createParam('new_user_classify_speed', '新用户分类速度', 48, '小时', '新注册用户完成首次分层所需时间, 影响个性化运营的启动速度', 24, 82, { min: 6, max: 96, step: 6, learningDataPoints: 21300, adjustHistory: [
        { time: '3天前', from: '24', to: '48', reason: '快速分类导致准确率下降至72%, AI延长分类时间积累更多行为数据' },
        { time: '1周前', from: '72', to: '24', reason: '新用户流失率在48小时内最高, AI加速分类抢救窗口' },
      ] }),
    ],
  },
  {
    title: '活动自动化',
    icon: <Zap size={16} />,
    params: [
      createParam('activity_trigger_confidence', '活动自动触发置信度', 85, '%', 'AI根据用户行为数据自动触发限时活动(满减/赠品/优惠券)所需的最低置信度', 80, 89, { min: 60, max: 99, step: 1, learningDataPoints: 44700, adjustHistory: [
        { time: '4小时前', from: '80', to: '85', reason: '活动误触发导致优惠券成本超支¥3万, AI提高触发阈值' },
        { time: '2天前', from: '90', to: '80', reason: '活动触发率过低, 用户留存下降, AI降低阈值' },
      ] }),
      createParam('push_freq_limit', '推送频率上限', 3, '次/天', '每用户每天最大推送次数(含活动/挽留/新品通知), 超过可能触发退订', 2, 86, { min: 1, max: 10, step: 1, autoTuneEnabled: false, learningDataPoints: 56100, adjustHistory: [
        { time: '3天前', from: '5', to: '3', reason: '用户退订率上升2.3%, 手动降低推送频率' },
        { time: '2周前', from: '2', to: '5', reason: '大促期间手动放开推送上限' },
      ] }),
      createParam('coupon_cost_limit', '优惠券发放成本上限', 10, '%GMV', '优惠券(含首单优惠/复购折扣/流失挽留)总成本占GMV的红线', 8, 84, { min: 3, max: 20, step: 1, autoTuneEnabled: false, learningDataPoints: 32400, adjustHistory: [
        { time: '本周一', from: '8', to: '10', reason: '季度预算调整后手动放宽优惠券成本上限' },
        { time: '3周前', from: '12', to: '8', reason: '财务审计要求控制优惠券成本, 手动收紧' },
      ] }),
      createParam('activity_roi_target', '活动ROI最低目标', 3, 'x', '自动触发活动的ROI最低达标线, 低于此值的活动类型将被暂停', 3.5, 81, { min: 1.5, max: 8, step: 0.5, learningDataPoints: 25800, adjustHistory: [
        { time: '昨日', from: '2.5', to: '3', reason: 'AI分析近30天活动数据, 上调ROI底线淘汰低效活动' },
        { time: '5天前', from: '4', to: '2.5', reason: '新品上市期ROI预期偏低, AI降低目标' },
      ] }),
    ],
  },
  {
    title: 'AI客服',
    icon: <MessageSquare size={16} />,
    params: [
      createParam('auto_resolve_target', 'AI自动解决率目标', 70, '%', 'AI客服自动解决用户问题(发货/成分/退换/账号)的目标比例', 75, 88, { min: 40, max: 95, step: 5, learningDataPoints: 61200, adjustHistory: [
        { time: '2小时前', from: '65', to: '70', reason: 'AI新增色号匹配知识库后解决率提升, 上调目标' },
        { time: '3天前', from: '75', to: '65', reason: '新上线的敏感肌产品带来大量未训练问题, AI降低目标' },
      ] }),
      createParam('human_transfer_threshold', '人工转接阈值', 3, '轮对话', 'AI与用户对话超过此轮数仍未解决则自动转接人工客服', 2, 83, { min: 1, max: 10, step: 1, learningDataPoints: 48500, adjustHistory: [
        { time: '昨日', from: '2', to: '3', reason: 'AI多轮对话解决率提升至85%, AI增加对话轮数减少转人工' },
        { time: '4天前', from: '5', to: '2', reason: '用户投诉AI回复不准确, AI缩短对话轮数加快转人工' },
      ] }),
      createParam('emotion_sensitivity', '情绪识别灵敏度', 80, '%', '检测用户愤怒/焦虑/失望等负面情绪的灵敏度, 触发安抚话术或优先转人工', 85, 85, { min: 50, max: 99, step: 5, learningDataPoints: 35700, adjustHistory: [
        { time: '2天前', from: '75', to: '80', reason: '多条差评提到AI客服"不近人情", AI提升情绪检测灵敏度' },
        { time: '1周前', from: '90', to: '75', reason: '过度敏感导致频繁触发安抚话术影响效率, AI降低灵敏度' },
      ] }),
      createParam('response_time_target', '响应时间目标', 5, '秒', 'AI客服首次响应时间目标, 含意图识别+知识库检索+回复生成', 3, 90, { min: 1, max: 15, step: 1, learningDataPoints: 72300, adjustHistory: [
        { time: '昨日', from: '3', to: '5', reason: '多品类知识库扩展后推理耗时增加, AI放宽响应目标' },
        { time: '3天前', from: '8', to: '3', reason: '推理服务GPU升级完成, AI收紧响应时间目标' },
      ] }),
    ],
  },
  {
    title: '达人运营',
    icon: <Star size={16} />,
    params: [
      createParam('influencer_match_score', '达人匹配度评分阈值', 70, '分', '达人与产品(粉丝画像/内容调性/历史ROI)匹配度最低评分', 75, 84, { min: 40, max: 95, step: 5, learningDataPoints: 18900, adjustHistory: [
        { time: '3天前', from: '60', to: '70', reason: '低匹配度达人合作ROI普遍不达标, AI提升阈值' },
        { time: '1周前', from: '80', to: '60', reason: '可用达人池不足, AI降低阈值扩大合作范围' },
      ] }),
      createParam('influencer_recommend_count', '达人自动推荐数量', 10, '个/产品', '每个推广产品AI自动推荐的候选达人数量', 15, 81, { min: 3, max: 30, step: 1, learningDataPoints: 12600, adjustHistory: [
        { time: '2天前', from: '5', to: '10', reason: '运营团队反馈可选达人太少, AI增加推荐数量' },
        { time: '5天前', from: '20', to: '5', reason: '推荐过多导致决策效率低, AI减少推荐数量聚焦优质达人' },
      ] }),
      createParam('influencer_predict_confidence', '达人效果预测置信度', 75, '%', 'AI预测达人合作效果(CPM/互动率/GMV贡献)的最低置信度', 80, 82, { min: 50, max: 95, step: 5, learningDataPoints: 14200, adjustHistory: [
        { time: '4天前', from: '70', to: '75', reason: '多位达人实际效果与预测偏差超过30%, AI上调置信度阈值' },
      ] }),
      createParam('auto_renew_threshold', '合作自动续约阈值', 2, 'x ROI', '达人合作ROI超过此值时AI自动推荐续约, 减少人工干预', 2.5, 79, { min: 1.2, max: 5, step: 0.1, autoTuneEnabled: false, learningDataPoints: 8400, adjustHistory: [
        { time: '1周前', from: '1.5', to: '2', reason: '低ROI达人续约浪费预算, 手动上调自动续约门槛' },
      ] }),
    ],
  },
]

const opsAILearningStatus: AILearningStatus = {
  modelVersion: 'v2.6.1-beauty-ops',
  lastTraining: '2.5小时前',
  totalDataPoints: 312000,
  avgConfidence: 85,
  autoAdjustCount24h: 178,
  learningRate: '0.001 (AdamW)',
  nextTraining: '3.5小时后',
  improvementRate: '+10.7%',
}

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

// ── scheduled posts per influencer ──
const scheduledPosts: Record<string, { date: string; platform: string; type: string }[]> = {
  '李佳琦助播团': [{ date: '4/5 20:00', platform: '抖音', type: '直播种草' }, { date: '4/8 18:30', platform: '抖音', type: '短视频种草' }],
  '美妆日记Vivi': [{ date: '4/6 15:00', platform: '小红书', type: '试色笔记' }],
  '樱桃美妆': [{ date: '4/4 21:00', platform: '抖音', type: '妆容教程' }, { date: '4/7 19:00', platform: '抖音', type: '挑战视频' }, { date: '4/9 20:00', platform: '抖音', type: '福利直播' }],
  '护肤成分党小F': [{ date: '4/5 17:00', platform: '小红书', type: '成分科普' }],
  '快手美妆达人Linda': [],
  '素人测评阿七': [{ date: '4/6 16:00', platform: '小红书', type: '真实测评' }],
  '唇釉收藏家': [{ date: '4/4 22:00', platform: '抖音', type: '色号合集' }, { date: '4/7 21:00', platform: '抖音', type: '对比测评' }],
  '美妆博主Momo': [{ date: '4/5 19:00', platform: '快手', type: '变美挑战' }, { date: '4/8 20:00', platform: '快手', type: '联动活动' }],
}

// ── consumer segment detail ──
const segmentDetail: Record<string, {
  demographics: string; interests: string; behaviors: string
  platformAvail: string[]; bestCreative: string
  ltvEstimate: string; cpmRange: string
  histPerf: { metric: string; value: string }[]
}> = {
  '高价值消费者': { demographics: '25-40岁，高收入女性，购买力强', interests: '高端美妆、成分党、限定新品', behaviors: '每月购买3+次，月均消费¥850', platformAvail: ['抖音', '小红书', '天猫'], bestCreative: '限定礼盒+VIP专属内容', ltvEstimate: '¥4,200', cpmRange: '¥35-¥65', histPerf: [{ metric: 'CTR', value: '5.8%' }, { metric: '转化率', value: '12.5%' }, { metric: 'ROI', value: '6.2x' }] },
  '活跃种草用户': { demographics: '20-30岁，中等收入，种草敏感型', interests: '测评内容、限时优惠、美妆博主', behaviors: '每周浏览5+次，偶发购买', platformAvail: ['小红书', '抖音', '快手'], bestCreative: '限时优惠+KOL推荐', ltvEstimate: '¥1,200', cpmRange: '¥18-¥35', histPerf: [{ metric: 'CTR', value: '4.2%' }, { metric: '转化率', value: '6.8%' }, { metric: 'ROI', value: '3.1x' }] },
  '偶发购买用户': { demographics: '22-35岁，普通收入，品价格敏感', interests: '优惠活动、平价好物、节日礼品', behaviors: '节假日集中购买，平时较少互动', platformAvail: ['天猫', '京东', '抖音'], bestCreative: '大促优惠+礼盒套装', ltvEstimate: '¥280', cpmRange: '¥8-¥18', histPerf: [{ metric: 'CTR', value: '2.5%' }, { metric: '转化率', value: '2.1%' }, { metric: 'ROI', value: '1.4x' }] },
  '浏览未购用户': { demographics: '18-28岁，学生或初入职场', interests: '美妆教程、平价好物推荐', behaviors: '浏览内容多，购买转化低', platformAvail: ['小红书', '抖音'], bestCreative: '首单立减+小样试用', ltvEstimate: '¥35', cpmRange: '¥5-¥12', histPerf: [{ metric: 'CTR', value: '1.8%' }, { metric: '转化率', value: '0.5%' }, { metric: 'ROI', value: '0.8x' }] },
  '流失预警': { demographics: '曾经活跃用户，近7天未互动', interests: '原有兴趣标签', behaviors: '浏览频率骤降，购买停止', platformAvail: ['天猫', '京东', '抖音'], bestCreative: 'AI召回推送+专属优惠券', ltvEstimate: '-', cpmRange: '¥12-¥28', histPerf: [{ metric: '召回率', value: '18.5%' }, { metric: '成本/召回', value: '¥9.6' }, { metric: '复活ROI', value: '2.1x' }] },
}

const overlayStyleOps: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.45)', zIndex: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
}

export default function Operations() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedInfluencer, setSelectedInfluencer] = useState<typeof influencers[0] | null>(null)
  const [selectedSegment, setSelectedSegment] = useState<typeof userSegments[0] | null>(null)
  useRegisterAIConfig(opsAIConfigGroups, opsAILearningStatus, '达人与用户运营')

  return (
    <>
      {/* ══ Influencer Detail Panel ══ */}
      {selectedInfluencer && (() => {
        const inf = selectedInfluencer
        const posts = scheduledPosts[inf.name] || []
        return (
          <div style={overlayStyleOps} onClick={() => setSelectedInfluencer(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 460, height: '100vh', background: 'var(--bg-card)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{inf.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{inf.platform} · {inf.tier}</div>
                </div>
                <button onClick={() => setSelectedInfluencer(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
              </div>

              {/* Profile */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>达人画像</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: '平台', value: inf.platform },
                    { label: '粉丝', value: inf.followers },
                    { label: '类型', value: inf.tier },
                    { label: '互动率(CTR)', value: inf.ctr > 0 ? `${inf.ctr}%` : '-' },
                    { label: '合作状态', value: inf.status === 'active' ? '合作中' : '待入驻', color: inf.status === 'active' ? '#22c55e' : '#fbbf24' },
                    { label: '内容数', value: inf.content || '-' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: (item as { color?: string }).color || 'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past collaboration performance */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>合作表现</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: '本月GMV', value: inf.gmv > 0 ? `¥${inf.gmv.toLocaleString()}` : '-', color: '#e8365d' },
                    { label: '佣金', value: inf.commission > 0 ? `¥${inf.commission.toLocaleString()}` : '-', color: '#ff7a95' },
                    { label: 'ROI', value: inf.gmv > 0 ? `${(inf.gmv / (inf.commission || 1)).toFixed(1)}x` : '-', color: '#22c55e' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '12px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduled posts */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>即将发布内容</div>
                {posts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '14px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>暂无排期内容</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {posts.map((post, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#e8365d', width: 80, flexShrink: 0 }}>{post.date}</span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 8, background: 'rgba(232,54,93,0.1)', color: '#e8365d' }}>{post.platform}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{post.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '发起合作', primary: true },
                  { label: '查看内容', primary: false },
                  { label: '结算报酬', primary: false },
                ].map(btn => (
                  <button key={btn.label} onClick={() => setSelectedInfluencer(null)} style={{
                    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    border: btn.primary ? 'none' : '1px solid #e8365d',
                    background: btn.primary ? '#e8365d' : 'transparent',
                    color: btn.primary ? '#fff' : '#e8365d',
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ══ Consumer Segment Detail Panel ══ */}
      {selectedSegment && (() => {
        const seg = selectedSegment
        const det = segmentDetail[seg.segment]
        return (
          <div style={overlayStyleOps} onClick={() => setSelectedSegment(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 460, height: '100vh', background: 'var(--bg-card)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: seg.color }} />
                  <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{seg.segment}</span>
                </div>
                <button onClick={() => setSelectedSegment(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
              </div>

              {/* Definition */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>分层定义</div>
                {[
                  { label: '用户特征', value: det.demographics },
                  { label: '兴趣偏好', value: det.interests },
                  { label: '行为习惯', value: det.behaviors },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '7px 10px' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Key metrics */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>核心指标</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: '用户数', value: seg.count },
                    { label: 'ARPU', value: seg.arpu },
                    { label: 'D30留存', value: seg.retention30 },
                    { label: '复购价值', value: seg.ltv },
                    { label: 'CPM范围', value: det.cpmRange },
                    { label: '最佳素材', value: det.bestCreative },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '10px 8px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historical perf on our ads */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>历史广告表现</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {det.histPerf.map(h => (
                    <div key={h.metric} style={{ flex: 1, textAlign: 'center', padding: '12px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{h.metric}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e8365d' }}>{h.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform availability */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>可用平台</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {det.platformAvail.map(pl => (
                    <span key={pl} style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 20, background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontWeight: 600 }}>{pl}</span>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>复购价值预估</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: seg.color }}>{seg.ltv}</span>
                </div>
              </div>

              {/* AI strategy */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>AI运营策略</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{seg.strategy}</div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '创建计划', primary: true },
                  { label: '测试受众', primary: false },
                  { label: '保存受众包', primary: false },
                ].map(btn => (
                  <button key={btn.label} onClick={() => setSelectedSegment(null)} style={{
                    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    border: btn.primary ? 'none' : '1px solid #e8365d',
                    background: btn.primary ? '#e8365d' : 'transparent',
                    color: btn.primary ? '#fff' : '#e8365d',
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={24} style={{ color: '#e8365d' }} />
          达人与用户运营中心
        </h2>
        <p>KOL/KOC达人运营 · 美妆消费者分层 · 活动自动化 · 智能客服</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="KOLMatch-GNN" color="#e8365d" />
        <ModelBadge name="ChurnPredictor-GBM" color="#e8365d" />
        <ModelBadge name="Lookalike-Expander" color="#e8365d" />
      </div>
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`tab ${activeTab === i ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e8365d', background: 'rgba(232,54,93,0.08)', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600 }}>
            <Bot size={16} />
            <span>10个运营智能体运行中</span>
          </div>
        </div>

        {/* Tab 1: 达人运营 */}
        {activeTab === 0 && (
          <>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { label: '合作达人', value: '228', icon: <Users size={14} />, sub: '活跃中' },
                { label: '本月新增', value: '38', icon: <UserPlus size={14} />, sub: '位' },
                { label: '达人贡献GMV', value: '¥380万', icon: <TrendingUp size={14} />, sub: '本月' },
                { label: '平均CTR', value: '4.9%', icon: <TrendingUp size={14} />, sub: '' },
              ].map(s => (
                <div key={s.label} className="card">
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s.icon} {s.label}
                  </div>
                  <div className="card-value" style={{ color: '#e8365d' }}>
                    {s.value}
                    {s.sub && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>{s.sub}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">达人列表</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>达人</th>
                    <th>平台</th>
                    <th>粉丝</th>
                    <th>类型</th>
                    <th>状态</th>
                    <th>本月GMV</th>
                    <th>佣金</th>
                    <th>CTR</th>
                    <th>内容数</th>
                  </tr>
                </thead>
                <tbody>
                  {influencers.map(inf => (
                    <tr key={inf.name} onClick={() => setSelectedInfluencer(inf)} style={{ cursor: 'pointer' }}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inf.name}</td>
                      <td>{inf.platform}</td>
                      <td>{inf.followers}</td>
                      <td>{inf.tier}</td>
                      <td>
                        {inf.status === 'active'
                          ? <span className="status-badge running"><span className="status-dot running" /> 合作中</span>
                          : <span className="status-badge idle"><span className="status-dot idle" /> 待入驻</span>
                        }
                      </td>
                      <td>{inf.gmv > 0 ? `¥${inf.gmv.toLocaleString()}` : '-'}</td>
                      <td style={{ color: '#e8365d', fontWeight: 600 }}>{inf.commission > 0 ? `¥${inf.commission.toLocaleString()}` : '-'}</td>
                      <td style={{ fontWeight: 600, color: inf.ctr > 4 ? 'var(--success)' : inf.ctr > 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {inf.ctr > 0 ? `${inf.ctr}%` : '-'}
                      </td>
                      <td>{inf.content || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-title">达人增长与GMV趋势</div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={influencerTrend}>
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="active" name="活跃达人" fill="#e8365d" radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="left" dataKey="new" name="新增" fill="#ffb3c6" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="gmv" name="GMV(万¥)" stroke="#22c55e" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Tab 2: 消费者分层 */}
        {activeTab === 1 && (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">
                <Target size={16} style={{ color: '#e8365d' }} /> 消费者分层模型
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>分层</th>
                    <th>用户数</th>
                    <th>ARPU</th>
                    <th>D30留存</th>
                    <th>复购价值</th>
                    <th>AI运营策略</th>
                  </tr>
                </thead>
                <tbody>
                  {userSegments.map(s => (
                    <tr key={s.segment} onClick={() => setSelectedSegment(s)} style={{ cursor: 'pointer' }}>
                      <td style={{ color: s.color, fontWeight: 600 }}>{s.segment}</td>
                      <td>{s.count}</td>
                      <td>{s.arpu}</td>
                      <td>{s.retention30}</td>
                      <td style={{ color: '#e8365d', fontWeight: 600 }}>{s.ltv}</td>
                      <td style={{ fontSize: '0.75rem' }}>{s.strategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="section-title">消费者转化漏斗 (本月)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {userFunnel.map((s, i) => (
                    <div key={s.stage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 56, textAlign: 'right', flexShrink: 0 }}>{s.stage}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 24, background: 'rgba(232,54,93,0.08)', borderRadius: 6, overflow: 'hidden', width: `${s.pct}%` }}>
                          <div style={{ height: '100%', background: 'rgba(232,54,93,0.6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 600, opacity: 0.85 }}>
                            {s.value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 36 }}>{s.pct}%</span>
                      {i > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 44 }}>{((s.value / userFunnel[i-1].value) * 100).toFixed(1)}%</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="section-title">消费者分层趋势</div>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={segmentTrend}>
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="casual" name="偶发购买" fill="#22c55e" fillOpacity={0.1} stroke="#22c55e" />
                    <Line type="monotone" dataKey="active" name="活跃种草" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="highValue" name="高价值" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Tab 3: 活动自动化 */}
        {activeTab === 2 && (
          <>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {activityROI.map(a => (
                <div key={a.type} className="card">
                  <div className="card-title">{a.type}活动</div>
                  <div className="card-value" style={{ color: '#e8365d' }}>
                    {a.avgROI}x <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>ROI</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{a.count}个活动 · 花费{a.spend}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title">
                <Gift size={16} style={{ color: '#e8365d' }} /> 活动列表
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>活动名称</th>
                    <th>类型</th>
                    <th>状态</th>
                    <th>参与人数</th>
                    <th>转化率</th>
                    <th>贡献GMV</th>
                    <th>AI设计</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(a => (
                    <tr key={a.name}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.name}</td>
                      <td>
                        <span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.1)', color: '#e8365d' }}>{a.type}</span>
                      </td>
                      <td>
                        {a.status === 'active'
                          ? <span className="status-badge running"><span className="status-dot running" /> 进行中</span>
                          : <span className="status-badge idle"><span className="status-dot idle" /> 已排期</span>
                        }
                      </td>
                      <td>{a.participants > 0 ? a.participants.toLocaleString() : '-'}</td>
                      <td style={{ fontWeight: 600, color: a.conversion > 50 ? 'var(--success)' : a.conversion > 0 ? '#d97706' : 'var(--text-muted)' }}>
                        {a.conversion > 0 ? `${a.conversion}%` : '-'}
                      </td>
                      <td style={{ color: '#e8365d', fontWeight: 600 }}>{a.gmv}</td>
                      <td>{a.aiDesigned ? <Bot size={14} style={{ color: '#e8365d' }} /> : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>人工</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 4: 社群与客服 */}
        {activeTab === 3 && (
          <>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { label: '今日客服会话', value: customerServiceStats.todaySessions.toLocaleString(), icon: <MessageSquare size={14} /> },
                { label: '自动解决率', value: `${customerServiceStats.autoResolveRate}%`, icon: <Bot size={14} /> },
                { label: '平均响应', value: customerServiceStats.avgResponseTime, icon: <Activity size={14} /> },
                { label: '活跃社群', value: customerServiceStats.activeCommunities.toLocaleString(), icon: <Users size={14} /> },
              ].map(s => (
                <div key={s.label} className="card">
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {s.icon} {s.label}
                  </div>
                  <div className="card-value" style={{ color: '#e8365d' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="section-title">
                  <Star size={16} style={{ color: '#e8365d' }} /> 高频问题 Top7
                </div>
                <div>
                  {topQuestions.map(q => (
                    <div key={q.question} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{q.question}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 60, height: 6, background: 'rgba(232,54,93,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#e8365d', borderRadius: 3, width: `${(q.pct / 22) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', width: 28 }}>{q.pct}%</span>
                        </div>
                        {q.autoResolved
                          ? <span style={{ fontSize: '0.7rem', color: '#e8365d', fontWeight: 600 }}>AI</span>
                          : <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>人工</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="section-title">
                  <BarChart3 size={16} style={{ color: '#e8365d' }} /> 客服会话与自动解决趋势
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={serviceTrend}>
                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} domain={[94, 98]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar yAxisId="left" dataKey="sessions" name="会话数" fill="#e8365d" radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="autoRate" name="自动解决率%" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

      </div>
    </>
  )
}
