import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  Users, Target, TrendingUp, Brain, AlertTriangle, ArrowUpRight, Eye, Zap
} from 'lucide-react'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── Tab 1: 受众画像 Data ───
const kpiCards = [
  { label: '总触达消费者', value: '12.8M', sub: '近30天去重', icon: Users, color: '#e8365d' },
  { label: '购买用户', value: '890K', sub: '付费率 6.95%', icon: TrendingUp, color: '#10b981' },
  { label: '高价值用户', value: '42K', sub: 'GMV > ¥200', icon: Zap, color: '#f59e0b' },
  { label: 'AI新发现受众包', value: '8个', sub: '本周自动生成', icon: Brain, color: '#ff7a95' },
]

const audienceSegments = [
  { name: '18-28岁女性 唇妆爱好者', scale: '2.1M', roi: 2.4, platform: '小红书', creative: '种草钩子', action: '持续放量', actionColor: '#10b981' },
  { name: '20-30岁女性 成分党', scale: '3.5M', roi: 1.8, platform: '抖音', creative: '真实测评', action: '扩量中', actionColor: '#e8365d' },
  { name: '25-35岁女性 颜值党', scale: '1.2M', roi: 3.1, platform: '小红书', creative: '限定色号展示', action: '高价值定向', actionColor: '#f59e0b' },
  { name: '22-32岁女性 妆容教程粉', scale: '980K', roi: 2.7, platform: '抖音', creative: '妆容展示', action: '稳定投放', actionColor: '#10b981' },
  { name: '18-25岁 学生党', scale: '1.8M', roi: 1.5, platform: '快手', creative: '场景教程', action: '观望调优', actionColor: '#f59e0b' },
  { name: '28-38岁 精致妈妈', scale: '650K', roi: 2.9, platform: '天猫', creative: '成分科普', action: '加速放量', actionColor: '#10b981' },
  { name: '30-45岁 职场白领', scale: '1.4M', roi: 2.2, platform: '小红书', creative: '变美对比', action: '持续放量', actionColor: '#10b981' },
  { name: '18-24岁 美妆博主粉丝', scale: '4.2M', roi: 1.3, platform: '抖音', creative: '种草试色', action: '素材迭代', actionColor: '#ef4444' },
]

const roiCompareData = [
  { name: '唇妆爱好者F', ROI: 2.4 },
  { name: '成分党F', ROI: 1.8 },
  { name: '颜值党F', ROI: 3.1 },
  { name: '妆容教程粉F', ROI: 2.7 },
  { name: '学生党F', ROI: 1.5 },
  { name: '精致妈妈F', ROI: 2.9 },
  { name: '职场白领F', ROI: 2.2 },
  { name: '美妆博主粉丝', ROI: 1.3 },
]

// ─── Tab 2: AI受众扩展 Data ───
const discoveredAudiences = [
  {
    name: '华南28-38岁 精致妈妈潜力用户',
    seedBase: '25-35岁女性 颜值党',
    scale: '86万',
    similarity: 87,
    logic: '基于种子用户的小红书种草行为+天猫购买频率特征，在华南女性中发现相似高价值人群',
    status: '测试中',
    statusColor: '#e8365d',
  },
  {
    name: '华北25-35岁 成分党精准用户',
    seedBase: '20-30岁女性 成分党',
    scale: '42万',
    similarity: 92,
    logic: '从护肤品高频购买用户中提取成分关注特征，在华北职场女性中发现高转化潜力人群',
    status: '已验证',
    statusColor: '#10b981',
  },
  {
    name: '全国18-24岁 学生美妆新人群',
    seedBase: '18-24岁 美妆博主粉丝',
    scale: '165万',
    similarity: 79,
    logic: '结合短视频高活跃特征与平价彩妆偏好，在全国学生群体中发现增长信号',
    status: '待投放',
    statusColor: '#f59e0b',
  },
]

const overlapData = [
  { name: '唇妆爱好者F\nvs 职场白领F', overlap: 23, suggestion: '建议分时段投放，避免竞价抬升' },
  { name: '成分党F\nvs 美妆博主粉丝', overlap: 31, suggestion: '重叠较高，建议合并或排他定向' },
  { name: '颜值党F\nvs 精致妈妈F', overlap: 8, suggestion: '重叠极低，可并行投放' },
]

const fatigueWarnings = [
  { name: '18-24岁 美妆博主粉丝', signal: 'CTR连续5天下降12%，频次达4.8次/人', action: '建议更换素材或暂停3天冷却', severity: 'high' },
  { name: '18-25岁 学生党', signal: 'CPM上涨18%，转化率下降9%', action: '建议缩量并测试新创意方向', severity: 'medium' },
]

const overlapPieData = [
  { name: '独占A', value: 65 },
  { name: '重叠', value: 23 },
  { name: '独占B', value: 12 },
]
const overlapColors = ['#e8365d', '#f59e0b', '#ff7a95']

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ─── Tab 3: AI引擎配置 Data ───
const audienceAIConfigGroups: AIConfigGroup[] = [
  {
    title: 'AI受众扩展',
    icon: <Brain size={15} style={{ color: '#ff7a95' }} />,
    params: [
      createParam('lookalike_threshold', 'Lookalike相似度阈值', 85, '%', 'Lookalike受众与种子用户的最低特征相似度, 越高越精准但规模越小', 80, 88, { min: 50, max: 99, step: 1, learningDataPoints: 48300, adjustHistory: [
        { time: '2小时前', from: '80', to: '85', reason: 'Lookalike受众CPA偏高, AI提升相似度阈值聚焦高质量用户' },
        { time: '2天前', from: '90', to: '80', reason: '投放规模不足, AI降低阈值扩大Lookalike受众池' },
        { time: '5天前', from: '85', to: '90', reason: '高价值用户占比下降, AI收紧相似度提升精准度' },
      ] }),
      createParam('seed_min_sample', '种子用户最小样本量', 1000, '人', '构建Lookalike模型的最少种子用户数, 样本不足会导致模型泛化差', 500, 84, { min: 100, max: 10000, step: 100, autoTuneEnabled: false, learningDataPoints: 22100, adjustHistory: [
        { time: '1周前', from: '500', to: '1000', reason: '小样本Lookalike效果差, 手动提升最小样本量要求' },
      ] }),
      createParam('audience_refresh_cycle', '受众包自动刷新周期', 7, '天', '受众包特征数据的自动更新间隔, 过长导致受众过时', 5, 86, { min: 1, max: 30, step: 1, learningDataPoints: 35600, adjustHistory: [
        { time: '昨日', from: '5', to: '7', reason: '频繁刷新消耗大量计算资源, AI拉长刷新周期' },
        { time: '4天前', from: '14', to: '5', reason: '受众特征变化快导致定向不准, AI加快刷新频率' },
      ] }),
      createParam('expansion_factor', '扩展系数', 3, 'x', '基于种子用户规模的扩展倍数, 3x=1000种子扩展至3000目标用户', 5, 82, { min: 1, max: 10, step: 1, learningDataPoints: 18900, adjustHistory: [
        { time: '3天前', from: '5', to: '3', reason: '大规模扩展导致用户质量稀释, AI缩小扩展系数' },
        { time: '1周前', from: '2', to: '5', reason: '扩量阶段需要更大受众池, AI增大扩展系数' },
      ] }),
      createParam('high_value_feature_weight', '高价值用户特征权重', 70, '%', '购买用户行为特征(消费频次/金额/留存)在Lookalike模型中的权重', 75, 87, { min: 30, max: 95, step: 5, learningDataPoints: 41500, adjustHistory: [
        { time: '昨日', from: '60', to: '70', reason: '高价值用户获取成本上升, AI增加特征权重提升命中率' },
        { time: '5天前', from: '80', to: '60', reason: '过度聚焦高价值导致受众规模不足, AI降低权重' },
      ] }),
    ],
  },
  {
    title: '人群细分',
    icon: <Users size={15} style={{ color: '#e8365d' }} />,
    params: [
      createParam('max_segments', '自动分群数量上限', 20, '个', '聚类算法自动生成的最大人群分群数, 过多导致单群体规模过小', 15, 85, { min: 5, max: 50, step: 1, learningDataPoints: 29800, adjustHistory: [
        { time: '2天前', from: '15', to: '20', reason: '业务扩展至更多品类, AI增加分群数覆盖更多用户群体' },
        { time: '1周前', from: '25', to: '15', reason: '分群过多导致投放计划碎片化, AI减少分群数量' },
      ] }),
      createParam('min_segment_size', '分群最小人数', 5000, '人', '每个分群的最低用户数, 低于此值的分群将被合并至最近邻群', 3000, 81, { min: 500, max: 50000, step: 500, learningDataPoints: 21400, adjustHistory: [
        { time: '3天前', from: '3000', to: '5000', reason: '小规模分群投放效果波动大, AI提高最小人数要求' },
        { time: '2周前', from: '10000', to: '3000', reason: '新品类用户量少, AI降低阈值允许小规模精准定向' },
      ] }),
      createParam('behavior_analysis_window', '行为特征分析窗口', 30, '天', '分析用户行为特征(点击/付费/活跃)的时间回溯窗口', 14, 83, { min: 7, max: 90, step: 1, learningDataPoints: 33200, adjustHistory: [
        { time: '昨日', from: '14', to: '30', reason: '美妆用户复购周期较长, AI延长分析窗口捕捉完整购买决策行为' },
        { time: '4天前', from: '30', to: '14', reason: '彩妆热点趋势变化快, AI缩短窗口提升时效性' },
      ] }),
      createParam('interest_tag_discovery', '兴趣标签自动发现', '自动应用', '', '基于用户行为自动挖掘兴趣标签并应用于定向, AI动态根据效果调整', 'AI动态', 89, { type: 'select', options: ['关闭', '仅标记', '自动应用', 'AI动态'], learningDataPoints: 44100, adjustHistory: [
        { time: '2天前', from: '仅标记', to: '自动应用', reason: 'AI发现自动应用标签后CTR提升9%, 升级策略' },
        { time: '1周前', from: '自动应用', to: '仅标记', reason: '标签误分类导致定向偏移, AI降级为仅标记' },
      ] }),
    ],
  },
  {
    title: '跨平台定向',
    icon: <Target size={15} style={{ color: '#10b981' }} />,
    params: [
      createParam('cross_platform_match_rate', '跨平台受众匹配率目标', 60, '%', '小红书/天猫/抖音跨平台用户ID匹配成功率目标, 影响跨平台协同投放', 65, 84, { min: 30, max: 90, step: 5, learningDataPoints: 26700, adjustHistory: [
        { time: '昨日', from: '55', to: '60', reason: '新接入抖音 IDFA桥接, 匹配率提升, AI上调目标' },
        { time: '5天前', from: '70', to: '55', reason: 'iOS ATT限制加强, 跨平台匹配率下降, AI降低目标' },
      ] }),
      createParam('targeting_priority', '定向精度优先级', '平衡', '', '投放定向策略偏好: 覆盖优先追求规模, 精准优先追求转化率', 'AI动态', 91, { type: 'select', options: ['覆盖优先', '精准优先', '平衡', 'AI动态'], learningDataPoints: 51800, adjustHistory: [
        { time: '3小时前', from: '精准优先', to: '平衡', reason: '精准定向导致Impression不足, AI切换平衡模式' },
        { time: '2天前', from: '覆盖优先', to: '精准优先', reason: 'CPA偏高, AI切换精准优先控制成本' },
      ] }),
      createParam('exclusion_auto_update', '排除受众自动更新', '实时', '', '已转化/已流失用户排除列表的更新频率, 避免重复投放浪费预算', 'AI动态', 86, { type: 'select', options: ['关闭', '每日', '实时', 'AI动态'], learningDataPoints: 37400, adjustHistory: [
        { time: '昨日', from: '每日', to: '实时', reason: '发现大量预算浪费在已购买用户上, AI切换实时排除' },
      ] }),
      createParam('retargeting_window', '重定向窗口期', 14, '天', '用户浏览/点击后进行再营销的时间窗口, 超过窗口期用户不再被重定向', 7, 80, { min: 1, max: 60, step: 1, learningDataPoints: 19500, adjustHistory: [
        { time: '3天前', from: '7', to: '14', reason: '护肤品用户决策周期长, AI延长重定向窗口提升转化' },
        { time: '1周前', from: '30', to: '7', reason: '长窗口重定向效果衰减严重, AI缩短窗口聚焦高意向用户' },
      ] }),
    ],
  },
  {
    title: '预测模型',
    icon: <TrendingUp size={15} style={{ color: '#f59e0b' }} />,
    params: [
      createParam('ltv_confidence_threshold', '复购价值预测置信度阈值', 75, '%', '复购价值预测模型输出置信度低于此值时标记为低信度, 不用于自动出价', 80, 87, { min: 50, max: 95, step: 5, learningDataPoints: 43200, adjustHistory: [
        { time: '昨日', from: '70', to: '75', reason: '低信度复购价值预测导致出价偏高, AI提升阈值过滤不可靠预测' },
        { time: '4天前', from: '85', to: '70', reason: '新平台数据不足, AI降低阈值避免过多数据被过滤' },
      ] }),
      createParam('churn_warning_days', '流失预警提前天数', 7, '天', '预测用户流失前提前N天发送预警, 触发挽留活动', 5, 83, { min: 1, max: 30, step: 1, learningDataPoints: 28600, adjustHistory: [
        { time: '2天前', from: '5', to: '7', reason: 'AI分析发现挽留活动需要至少7天才能见效, 延长预警期' },
        { time: '1周前', from: '14', to: '5', reason: '过早预警导致挽留成本浪费, AI缩短预警天数' },
      ] }),
      createParam('payment_propensity_threshold', '付费倾向评分阈值', 0.6, '分', 'XGBoost付费倾向模型评分阈值, 高于此值的用户进入高价值投放池', 0.65, 85, { min: 0.3, max: 0.9, step: 0.05, learningDataPoints: 38100, adjustHistory: [
        { time: '昨日', from: '0.55', to: '0.6', reason: '高价值投放池用户质量下降, AI上调阈值提升精准度' },
        { time: '3天前', from: '0.7', to: '0.55', reason: '高价值池规模不足, AI降低阈值扩大覆盖' },
      ] }),
      createParam('model_update_frequency', '预测模型更新频率', 24, '小时', '复购价值/流失/付费倾向预测模型的增量训练间隔', 12, 82, { min: 4, max: 72, step: 4, learningDataPoints: 15800, adjustHistory: [
        { time: '3天前', from: '12', to: '24', reason: '模型训练占用大量GPU资源, AI延长更新间隔' },
        { time: '1周前', from: '48', to: '12', reason: '用户行为模式变化快, AI加快模型更新频率' },
      ] }),
    ],
  },
]

const audienceLearningStatus: AILearningStatus = {
  modelVersion: 'v2.9.0-audience',
  lastTraining: '2小时前',
  totalDataPoints: 456000,
  avgConfidence: 85,
  autoAdjustCount24h: 156,
  learningRate: '0.0008 (AdamW)',
  nextTraining: '4小时后',
  improvementRate: '+11.5%',
}

// ── Audience segment detail data ──
const audienceSegmentDetail: Record<string, {
  demographics: string; interests: string; behaviors: string
  platformAvail: { platform: string; available: boolean }[]
  ltv: string; cpmRange: string
  bestCreative: string; histPerf: { metric: string; value: string }[]
}> = {
  '18-28岁女性 唇妆爱好者': { demographics: '18-28岁女性，华东/华南，中等收入，短视频重度用户', interests: '彩妆教程、色号测评、口红种草、妆容分享', behaviors: '每日刷抖音2+小时，小红书高频种草，购买转化快', platformAvail: [{ platform: '小红书', available: true }, { platform: '抖音', available: true }, { platform: '天猫', available: true }, { platform: '快手', available: false }], ltv: '¥280', cpmRange: '¥28-¥65', bestCreative: '口红试色+上嘴效果对比，前3秒展示色号', histPerf: [{ metric: 'CTR', value: '8.4%' }, { metric: 'CVR', value: '5.2%' }, { metric: 'ROI', value: '4.2x' }] },
  '20-30岁女性 成分党': { demographics: '20-30岁女性，华东/华北，中高收入，理性消费', interests: '护肤成分、功效测评、皮肤科学、有效护肤', behaviors: '决策周期较长，信任KOL专业测评，复购率高', platformAvail: [{ platform: '抖音', available: true }, { platform: '小红书', available: true }, { platform: '天猫', available: true }, { platform: '快手', available: true }], ltv: '¥520', cpmRange: '¥35-¥80', bestCreative: '成分解析+使用前后对比，专业感设计', histPerf: [{ metric: 'CTR', value: '5.8%' }, { metric: 'CVR', value: '4.1%' }, { metric: 'ROI', value: '3.8x' }] },
  '25-35岁女性 颜值党': { demographics: '25-35岁女性，全国，中高收入，颜值敏感型消费', interests: '美妆潮流、变美技巧、网红同款、整体造型', behaviors: '高频购买，喜欢尝试新品，社交分享意愿强', platformAvail: [{ platform: '小红书', available: true }, { platform: '天猫', available: true }, { platform: '抖音', available: true }], ltv: '¥680', cpmRange: '¥42-¥95', bestCreative: '妆容变美对比+高颜值展示，情绪共鸣', histPerf: [{ metric: 'CTR', value: '7.2%' }, { metric: 'CVR', value: '6.8%' }, { metric: 'ROI', value: '5.1x' }] },
  '22-32岁女性 妆容教程粉': { demographics: '22-32岁女性，华东/华南，中等收入，美妆爱好者', interests: '妆容教程、手法分享、日韩妆容、仿妆挑战', behaviors: '长视频完播率高，收藏行为强，跟妆购买转化好', platformAvail: [{ platform: '抖音', available: true }, { platform: '小红书', available: true }, { platform: '天猫', available: true }], ltv: '¥380', cpmRange: '¥32-¥72', bestCreative: '教程步骤拆解+产品使用演示，细节展示', histPerf: [{ metric: 'CTR', value: '6.5%' }, { metric: 'CVR', value: '4.8%' }, { metric: 'ROI', value: '3.9x' }] },
  '18-25岁 学生党': { demographics: '18-25岁女性，全国，收入有限，学生群体', interests: '平价彩妆、学生党好物、CP色号、平替推荐', behaviors: '价格敏感，追热点快，传播力强，种草影响力大', platformAvail: [{ platform: '快手', available: true }, { platform: '小红书', available: true }, { platform: '抖音', available: true }], ltv: '¥125', cpmRange: '¥15-¥38', bestCreative: '平价好物推荐+学生视角种草，亲切感强', histPerf: [{ metric: 'CTR', value: '5.2%' }, { metric: 'CVR', value: '2.9%' }, { metric: 'ROI', value: '2.8x' }] },
  '28-38岁 精致妈妈': { demographics: '28-38岁女性，华东/华南，中高收入，宝妈群体', interests: '温和护肤、孕妇可用、成分安全、高品质美妆', behaviors: '消费力强，品质优先，品牌忠诚度高，圈子口碑传播', platformAvail: [{ platform: '天猫', available: true }, { platform: '小红书', available: true }, { platform: '抖音', available: true }], ltv: '¥850', cpmRange: '¥55-¥120', bestCreative: '成分安全背书+温和功效展示，信任感构建', histPerf: [{ metric: 'CTR', value: '4.8%' }, { metric: 'CVR', value: '7.5%' }, { metric: 'ROI', value: '5.5x' }] },
  '30-45岁 职场白领': { demographics: '30-45岁女性，一线城市，高收入，职场精英', interests: '高效护肤、精华类产品、抗衰老、职场妆容', behaviors: '时间有限，信任专业评测，品质敏感不价格敏感', platformAvail: [{ platform: '小红书', available: true }, { platform: '天猫', available: true }, { platform: '抖音', available: true }], ltv: '¥1,200', cpmRange: '¥68-¥150', bestCreative: '高效功效展示+职场场景带入，专业背书', histPerf: [{ metric: 'CTR', value: '4.2%' }, { metric: 'CVR', value: '8.1%' }, { metric: 'ROI', value: '4.8x' }] },
  '18-24岁 美妆博主粉丝': { demographics: '18-24岁女性，全国，收入有限，Z世代', interests: '美妆博主、潮流彩妆、网红同款、仿妆挑战', behaviors: '抖音/小红书高频用户，跟风速度快，传播裂变强', platformAvail: [{ platform: '抖音', available: true }, { platform: '小红书', available: true }, { platform: '快手', available: true }], ltv: '¥180', cpmRange: '¥18-¥45', bestCreative: '博主同款种草+限时优惠，潮流感驱动', histPerf: [{ metric: 'CTR', value: '6.8%' }, { metric: 'CVR', value: '3.5%' }, { metric: 'ROI', value: '3.2x' }] },
}

const overlayStyleAud: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.45)', zIndex: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
}

export default function AudienceInsights() {
  const [tab, setTab] = useState<'profile' | 'expansion'>('profile')
  const [selectedAudience, setSelectedAudience] = useState<typeof audienceSegments[0] | null>(null)

  useRegisterAIConfig(audienceAIConfigGroups, audienceLearningStatus, '受众洞察')

  return (
    <>
      {/* ══ Audience Segment Detail Slide-over ══ */}
      {selectedAudience && (() => {
        const seg = selectedAudience
        const det = audienceSegmentDetail[seg.name] || { demographics: '-', interests: '-', behaviors: '-', platformAvail: [], ltv: '-', cpmRange: '-', bestCreative: '-', histPerf: [] }
        return (
          <div style={overlayStyleAud} onClick={() => setSelectedAudience(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 480, height: '100vh', background: 'var(--bg-card)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#e8365d' }}>{seg.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>规模 {seg.scale} · 最佳平台 {seg.platform}</div>
                </div>
                <button onClick={() => setSelectedAudience(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>受众定义</div>
                {[
                  { label: '人口特征', value: det.demographics },
                  { label: '兴趣标签', value: det.interests },
                  { label: '行为特征', value: det.behaviors },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '7px 10px' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>核心数据</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: '规模估算', value: seg.scale, color: '#e8365d' },
                    { label: 'CPM区间', value: det.cpmRange, color: 'var(--text-primary)' },
                    { label: '复购价值估算', value: det.ltv, color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>我方广告历史表现</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {det.histPerf.map(h => (
                    <div key={h.metric} style={{ flex: 1, textAlign: 'center', padding: '12px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{h.metric}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e8365d' }}>{h.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>最佳素材类型</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '8px 10px' }}>{det.bestCreative}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AI推荐动作：</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, marginLeft: 6, padding: '2px 8px', borderRadius: 6, background: `${seg.actionColor}18`, color: seg.actionColor }}>{seg.action}</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>平台可用性</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {det.platformAvail.map(pl => (
                    <span key={pl.platform} style={{
                      fontSize: '0.78rem', padding: '4px 12px', borderRadius: 20, fontWeight: 600,
                      background: pl.available ? 'rgba(79,125,249,0.12)' : 'rgba(156,163,175,0.12)',
                      color: pl.available ? '#e8365d' : '#9ca3af',
                      border: `1px solid ${pl.available ? 'rgba(79,125,249,0.3)' : 'rgba(156,163,175,0.3)'}`,
                    }}>{pl.platform} {pl.available ? '✓' : '✕'}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '创建计划', primary: true },
                  { label: '测试受众', primary: false },
                  { label: '保存受众包', primary: false },
                ].map(btn => (
                  <button key={btn.label} onClick={() => setSelectedAudience(null)} style={{
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
        <h2>受众洞察</h2>
        <p>AI驱动的受众分析与智能人群扩展 · 跨平台精准定向</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="AudienceCluster-KM" color="#8b5cf6" />
          <ModelBadge name="Lookalike-Expander" color="#e8365d" />
          <ModelBadge name="UserLTV-Predictor" color="#10b981" />
          <ModelBadge name="CrossPlatformAdapt-CV" color="#e8365d" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'profile' as const, label: '受众画像', icon: Users },
            { key: 'expansion' as const, label: 'AI受众扩展', icon: Brain },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
                background: tab === t.key ? 'var(--accent)' : 'var(--surface)',
                color: tab === t.key ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <>
            {/* KPI Cards */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {kpiCards.map(c => (
                <div className="card" key={c.label}>
                  <div className="card-title"><c.icon size={14} style={{ verticalAlign: 'middle', color: c.color }} /> {c.label}</div>
                  <div className="card-value" style={{ color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Top Audience Segments Table */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 12 }}><Target size={14} style={{ verticalAlign: 'middle' }} /> 核心受众包</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['名称', '规模', '平均ROI', '最佳平台', '最佳素材类型', 'AI推荐动作'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {audienceSegments.map(seg => (
                      <tr key={seg.name} onClick={() => setSelectedAudience(seg)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                        <td style={{ padding: '10px', fontWeight: 600 }}>{seg.name}</td>
                        <td style={{ padding: '10px' }}>{seg.scale}</td>
                        <td style={{ padding: '10px', color: seg.roi >= 2.5 ? '#10b981' : seg.roi >= 1.8 ? '#f59e0b' : '#ef4444' }}>
                          {seg.roi}x
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(79,125,249,0.15)', color: '#e8365d', fontSize: '0.72rem' }}>
                            {seg.platform}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{seg.creative}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, background: `${seg.actionColor}22`, color: seg.actionColor, fontSize: '0.72rem', fontWeight: 600 }}>
                            {seg.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ROI Comparison Bar Chart */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}><TrendingUp size={14} style={{ verticalAlign: 'middle' }} /> 各受众包ROI对比</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roiCompareData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="ROI" radius={[6, 6, 0, 0]} fill="#e8365d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === 'expansion' && (
          <>
            {/* AI Lookalike Header */}
            <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,125,249,0.08))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Brain size={18} color="#ff7a95" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Lookalike 受众扩展</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                基于高价值种子用户的行为特征、消费模式和兴趣标签，AI自动在全球流量池中发现相似人群并生成可投放受众包
              </p>
            </div>

            {/* AI Discovered Audiences */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 12 }}><Eye size={14} style={{ verticalAlign: 'middle' }} /> 近期AI发现受众</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {discoveredAudiences.map(a => (
                  <div key={a.name} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.name}</span>
                      <span style={{ padding: '2px 10px', borderRadius: 4, background: `${a.statusColor}22`, color: a.statusColor, fontSize: '0.72rem', fontWeight: 600 }}>
                        {a.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                      <span>种子: {a.seedBase}</span>
                      <span>规模: {a.scale}</span>
                      <span>相似度: <span style={{ color: a.similarity >= 85 ? '#10b981' : '#f59e0b' }}>{a.similarity}%</span></span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.5 }}>
                      <ArrowUpRight size={12} style={{ verticalAlign: 'middle', color: '#ff7a95' }} /> {a.logic}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlap Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}><Target size={14} style={{ verticalAlign: 'middle' }} /> 受众重叠分析</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {overlapData.map(o => (
                    <div key={o.name} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'pre-line' }}>{o.name}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: o.overlap > 20 ? '#ef4444' : '#10b981' }}>
                          {o.overlap}%重叠
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}><Zap size={14} style={{ verticalAlign: 'middle' }} /> 重叠构成示例</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={overlapPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {overlapPieData.map((_, i) => (
                        <Cell key={i} fill={overlapColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {overlapPieData.map((d, i) => (
                    <span key={d.name}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: overlapColors[i], marginRight: 4 }} />{d.name} {d.value}%</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fatigue Warnings */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>
                <AlertTriangle size={14} style={{ verticalAlign: 'middle', color: '#ef4444' }} /> 受众衰退预警
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {fatigueWarnings.map(w => (
                  <div key={w.name} style={{
                    padding: 14, borderRadius: 10,
                    border: `1px solid ${w.severity === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    background: w.severity === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>
                      <AlertTriangle size={13} style={{ verticalAlign: 'middle', color: w.severity === 'high' ? '#ef4444' : '#f59e0b', marginRight: 6 }} />
                      {w.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: 4 }}>信号: {w.signal}</div>
                    <div style={{ fontSize: '0.75rem', color: w.severity === 'high' ? '#ef4444' : '#f59e0b' }}>建议: {w.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </>
  )
}
