import { useState } from 'react'
import {
  ComposedChart, Area, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Bot, Brain, Zap, Target, TrendingUp, Activity, RefreshCw, Clock,
  ArrowUpRight, ArrowDownRight, Layers, AlertTriangle, ChevronDown,
  ChevronUp, Sparkles, Star, Eye, Cpu, GitBranch, Globe
} from 'lucide-react'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── Tab 1: Pipeline Data ───
const pipelineStages = [
  { name: 'AI生成', count: 28, color: '#e8365d', icon: Bot },
  { name: '智能审核', count: 25, color: '#ff7a95', icon: Eye },
  { name: '自动建计划', count: 23, color: '#ff7a95', icon: Layers },
  { name: '学习期', count: 18, color: '#c084fc', icon: Brain },
  { name: '起量', count: 12, color: '#d8b4fe', icon: TrendingUp },
  { name: '跑量', count: 8, color: '#e9d5ff', icon: Zap },
]

const pipelineMetrics = [
  { label: '日均产出量', value: '38', sub: '素材/天', icon: Activity },
  { label: '审核通过率', value: '89%', sub: '↑3.2%', icon: Eye },
  { label: '从生产到上线平均时间', value: '23', sub: '分钟', icon: Clock },
  { label: '首日跑量率', value: '52.6%', sub: '↑8.1%', icon: TrendingUp },
  { label: '全流程0人工率', value: '94.2%', sub: '行业领先', icon: Cpu },
]

const pipelineItems = [
  {
    id: 'M-5501', hook: '"用了这支唇釉，男友非要知道色号"',
    platform: '抖音', targeting: '女性 18-35 兴趣:彩妆',
    created: '10:08', stage: 'AI生成', elapsed: '12分钟',
    status: 'processing',
  },
  {
    id: 'M-5502', hook: '"皮肤科医生都说这款卸妆水温和"',
    platform: '小红书', targeting: '女性 25-35 兴趣:护肤',
    created: '09:45', stage: '自动建计划', elapsed: '35分钟',
    status: 'building',
  },
  {
    id: 'M-5503', hook: '"30秒眼妆教程，新手也能学会"',
    platform: '快手', targeting: '女性 18-28 兴趣:美妆教程',
    created: '09:12', stage: '跑量', elapsed: '1小时22分',
    status: 'running',
  },
]

// ─── Tab 2: AI Learning Data ───
const learningMetrics = [
  { label: '模型迭代次数', value: '第847次', icon: RefreshCw },
  { label: '累计学习素材数', value: '12,450', icon: Layers },
  { label: 'CTR预测准确率', value: '87.3%', icon: Target },
  { label: 'ROI预测准确率', value: '82.1%', icon: TrendingUp },
]

const learningHistory = [
  { cycle: '周期1', predicted: 1.8, actual: 2.1, accuracy: 72 },
  { cycle: '周期2', predicted: 2.3, actual: 2.5, accuracy: 76 },
  { cycle: '周期3', predicted: 2.7, actual: 2.6, accuracy: 80 },
  { cycle: '周期4', predicted: 3.1, actual: 3.0, accuracy: 83 },
  { cycle: '周期5', predicted: 3.4, actual: 3.3, accuracy: 85 },
  { cycle: '周期6', predicted: 3.6, actual: 3.5, accuracy: 86 },
  { cycle: '周期7', predicted: 3.8, actual: 3.7, accuracy: 87 },
]

const aiInsights = [
  { text: '抖音前3秒展示肤质对比，完播率提升65%', confidence: 94 },
  { text: '小红书真实素人测评比品牌广告CTR高42%', confidence: 91 },
  { text: '唇釉色号展示+教程组合素材CPA降低35%', confidence: 89 },
  { text: '618大促前7天预热素材ROI比平时高80%', confidence: 87 },
]

const businessLineLearning = [
  { line: '护肤品', icon: Sparkles, best: '真实测评+成分解析', ctr: '8.4%', insight: '前3秒展示肤质改变效果最佳' },
  { line: '彩妆', icon: Star, best: '教程类+色彩展示', ctr: '7.2%', insight: '完播率高的视频转化率提升3倍' },
  { line: '直播切片', icon: Layers, best: '爆款时刻+优惠提示', ctr: '6.8%', insight: '直播高光片段搭配限时优惠效果最佳' },
]

// ─── Tab 3: Real-time Performance Data ───
const campaignMaterials = [
  {
    campaign: '抖音-唇釉系列-Q2-01',
    materials: [
      { id: 'M-5501', hook: '用了这支唇釉，男友非要知道色号', platform: '抖音', ctr: 8.4, cvr: 3.2, roas: 4.2, spend: 18500, status: '跑量', confidence: 94 },
      { id: 'M-5502', hook: '皮肤科医生都说这款卸妆水温和', platform: '小红书', ctr: 6.8, cvr: 2.9, roas: 3.8, spend: 12300, status: '测试', confidence: 82 },
    ],
  },
  {
    campaign: '美妆教程-快手-Q2-03',
    materials: [
      { id: 'M-5503', hook: '30秒眼妆教程，新手也能学会', platform: '快手', ctr: 5.5, cvr: 2.1, roas: 3.1, spend: 8900, status: '衰退', confidence: 48 },
      { id: 'M-5504', hook: '这个粉底液遮瑕力绝了！', platform: '抖音直播', ctr: 7.2, cvr: 4.5, roas: 5.1, spend: 22000, status: '跑量', confidence: 91 },
    ],
  },
]

const autoActionLogs = [
  { time: '10:32', action: 'AI检测M-5503 CTR下降35% → 自动降权 → 触发替换素材M-5504', type: 'warning' },
  { time: '10:15', action: 'AI发现M-5502跑量稳定 → 自动扩量+30%预算', type: 'success' },
  { time: '09:58', action: 'M-5501通过学习期 → 自动进入起量阶段 → 预算+50%', type: 'success' },
  { time: '09:40', action: 'AI预判M-5499即将衰退 → 预生成3条替换素材待命', type: 'info' },
  { time: '09:22', action: '新素材M-5505生成完成 → 自动创建抖音+小红书双平台计划', type: 'info' },
]

const healthData = [
  { hour: '06:00', m5501: 4.2, m5502: 5.0, m5503: 3.8, m5504: 3.9 },
  { hour: '07:00', m5501: 4.5, m5502: 5.1, m5503: 3.5, m5504: 4.0 },
  { hour: '08:00', m5501: 4.8, m5502: 5.3, m5503: 3.2, m5504: 4.1 },
  { hour: '09:00', m5501: 4.6, m5502: 5.2, m5503: 2.8, m5504: 4.3 },
  { hour: '10:00', m5501: 4.8, m5502: 5.2, m5503: 2.5, m5504: 4.1 },
]

// ─── Tab 4: Auto-replacement Data ───
const replacementEvents = [
  { original: 'M-5480', replacement: 'M-5495', oldCtr: 2.1, newCtr: 4.3, time: '09:12', reason: 'CTR较峰值下降42%，AI判断素材疲劳' },
  { original: 'M-5463', replacement: 'M-5488', oldCtr: 1.8, newCtr: 3.9, time: '08:45', reason: '连续3小时CVR持续走低，触发替换阈值' },
  { original: 'M-5471', replacement: 'M-5491', oldCtr: 2.5, newCtr: 4.1, time: '07:30', reason: 'ROI降至1.2以下，自动切换同类高分素材' },
  { original: 'M-5455', replacement: 'M-5483', oldCtr: 1.5, newCtr: 3.7, time: '06:15', reason: '受众重合度过高导致频次上升，AI重新定向' },
  { original: 'M-5448', replacement: 'M-5479', oldCtr: 2.0, newCtr: 3.5, time: '05:40', reason: '竞品素材相似度上升，AI生成差异化素材替换' },
]

const replacementMetrics = [
  { label: '平均替换时间', value: '4.2', sub: '分钟', icon: Clock },
  { label: '替换后CTR恢复率', value: '78%', sub: '↑5.3%', icon: TrendingUp },
  { label: '0人工替换率', value: '96%', sub: '全自动', icon: Cpu },
]

const upcomingReplacements = [
  { id: 'M-5503', currentCtr: 2.5, peakCtr: 3.8, decline: 34, predictedTime: '约6小时后', replacement: 'M-5510(预生成)' },
  { id: 'M-5499', currentCtr: 3.1, peakCtr: 4.5, decline: 31, predictedTime: '约12小时后', replacement: 'M-5511(预生成)' },
  { id: 'M-5487', currentCtr: 2.8, peakCtr: 3.9, decline: 28, predictedTime: '约18小时后', replacement: '待AI生成' },
]

const replacementTrend = [
  { day: '03/28', count: 5, recovery: 72 },
  { day: '03/29', count: 7, recovery: 75 },
  { day: '03/30', count: 4, recovery: 78 },
  { day: '03/31', count: 6, recovery: 80 },
  { day: '04/01', count: 8, recovery: 76 },
  { day: '04/02', count: 5, recovery: 82 },
  { day: '04/03', count: 3, recovery: 78 },
]

// ─── Tab 5: AI Config Data ───
const creativeAIConfigGroups: AIConfigGroup[] = [
  {
    title: '素材生成引擎',
    icon: <Bot size={18} />,
    params: [
      createParam('gen_speed', 'AI素材生成速度目标', 12, '分钟/条', '单条视频/图片素材从Prompt触发到成品产出的端到端目标耗时', 10, 86, { min: 3, max: 30, step: 1, learningDataPoints: 34500, adjustHistory: [
        { time: '3小时前', from: '10', to: '12', reason: '新增4K视频模板导致渲染耗时增加, AI放宽速度目标' },
        { time: '2天前', from: '15', to: '10', reason: 'GPU集群扩容完成, AI收紧生成速度目标' },
      ] }),
      createParam('min_quality', '素材质量最低评分', 75, '分', '多维评分(画面清晰度/文案匹配度/合规性/创意新颖度)低于此值自动丢弃', 80, 89, { min: 50, max: 95, step: 5, learningDataPoints: 52800, adjustHistory: [
        { time: '昨日', from: '70', to: '75', reason: '低质量素材上线后CTR表现差, AI提升质量底线' },
        { time: '4天前', from: '85', to: '70', reason: '产能不足急需素材, AI临时降低质量要求' },
        { time: '1周前', from: '75', to: '85', reason: '素材质量稳定, AI提升标准优化整体表现' },
      ] }),
      createParam('daily_limit', '每日自动生成上限', 50, '条', '每日AI自动生成的素材总量(含视频/图片/文案), 防止GPU资源耗尽', 60, 83, { min: 10, max: 200, step: 10, autoTuneEnabled: false, learningDataPoints: 18900, adjustHistory: [
        { time: '本周一', from: '30', to: '50', reason: '素材消耗加速, 手动增加每日生成上限' },
        { time: '2周前', from: '50', to: '30', reason: 'GPU成本超预算, 手动降低生成上限' },
      ] }),
      createParam('diversity', '创意多样性系数', 0.7, '', '控制AIGC生成素材的风格多样性, 越高越倾向尝试新风格/新叙事', 0.8, 81, { min: 0.3, max: 1.0, step: 0.05, learningDataPoints: 23400, adjustHistory: [
        { time: '2天前', from: '0.6', to: '0.7', reason: '素材同质化严重CTR下降, AI提升多样性系数' },
        { time: '5天前', from: '0.9', to: '0.6', reason: '过度多样化导致品牌调性不统一, AI降低系数' },
      ] }),
      createParam('competitor_weight', '竞品素材参考权重', 30, '%', '生成素材时参考竞品热门素材(风格/叙事/Hook)的权重, 过高可能导致素材雷同', 25, 77, { min: 0, max: 60, step: 5, learningDataPoints: 14200, adjustHistory: [
        { time: '3天前', from: '20', to: '30', reason: '竞品新素材CTR表现突出, AI增加参考权重学习' },
        { time: '1周前', from: '40', to: '20', reason: '素材与竞品过于相似被用户投诉, AI降低参考权重' },
      ] }),
    ],
  },
  {
    title: '素材疲劳管理',
    icon: <RefreshCw size={18} />,
    params: [
      createParam('ctr_warning', 'CTR下降预警阈值', -20, '%', '素材CTR较峰值下降达到此比例触发疲劳预警, 提前准备替换素材', -15, 91, { min: -50, max: -5, step: 5, learningDataPoints: 61200, adjustHistory: [
        { time: '1小时前', from: '-15', to: '-20', reason: '预警过于频繁影响运营效率, AI放宽CTR下降预警线' },
        { time: '3天前', from: '-25', to: '-15', reason: '素材衰退未被及时发现导致CPA上升, AI收紧预警阈值' },
      ] }),
      createParam('auto_offline', '素材自动下架阈值', -35, '%CTR下降', '素材CTR较峰值下降超过此比例自动下架, 触发替换素材上线', -30, 88, { min: -60, max: -15, step: 5, autoTuneEnabled: false, learningDataPoints: 47800, adjustHistory: [
        { time: '2天前', from: '-30', to: '-35', reason: '部分素材CTR波动被误下架, 手动放宽自动下架阈值' },
        { time: '1周前', from: '-40', to: '-30', reason: '衰退素材持续消耗预算, 手动收紧下架阈值' },
      ] }),
      createParam('fatigue_window', '疲劳检测窗口', 48, '小时', '检测素材CTR趋势变化的时间窗口, 过短易受波动影响, 过长检测滞后', 36, 84, { min: 12, max: 96, step: 6, learningDataPoints: 38900, adjustHistory: [
        { time: '昨日', from: '36', to: '48', reason: '短周期波动导致误判疲劳, AI延长检测窗口' },
        { time: '4天前', from: '72', to: '36', reason: '素材衰退检测太慢, AI缩短窗口加快响应' },
      ] }),
      createParam('pre_gen_count', '替换素材预生成数量', 3, '条', '提前为每个活跃计划预生成的替换素材数, 确保疲劳下架时立即有替补', 5, 82, { min: 1, max: 10, step: 1, learningDataPoints: 16700, adjustHistory: [
        { time: '3天前', from: '2', to: '3', reason: '替换素材不足导致计划空窗期, AI增加预生成数量' },
        { time: '1周前', from: '5', to: '2', reason: 'GPU资源紧张, AI减少预生成数量节省算力' },
      ] }),
    ],
  },
  {
    title: 'A/B测试优化',
    icon: <Target size={18} />,
    params: [
      createParam('min_sample', '最小测试样本量', 1000, '次曝光', '素材A/B测试达到此曝光量后才计算统计指标并判定胜负', 1500, 90, { min: 200, max: 5000, step: 100, learningDataPoints: 55600, adjustHistory: [
        { time: '昨日', from: '800', to: '1000', reason: '小样本判定结果波动大, AI提升最小样本量' },
        { time: '3天前', from: '1500', to: '800', reason: '素材测试周期过长, AI降低样本量加速迭代' },
      ] }),
      createParam('significance', '统计显著性阈值', 95, '%', 'A/B测试达到此统计显著性(p-value<0.05)才宣布胜出素材', 95, 95, { min: 80, max: 99, step: 1, autoTuneEnabled: false, learningDataPoints: 68200, adjustHistory: [
        { time: '2周前', from: '90', to: '95', reason: '手动提升显著性要求减少假阳性判定' },
      ] }),
      createParam('auto_scale', '胜出素材自动扩量', '保守扩量', '', '胜出素材的预算自动放大策略: 保守(+20%/天), 标准(+50%/天), AI动态按效果调整', 'AI动态', 87, { type: 'select', options: ['关闭', '保守扩量', '标准扩量', 'AI动态'], learningDataPoints: 41300, adjustHistory: [
        { time: '2天前', from: '标准扩量', to: 'AI动态', reason: 'AI检测到不同品类最优扩量速度不同, 切换动态策略' },
        { time: '5天前', from: '保守扩量', to: '标准扩量', reason: '扩量速度太慢错过最佳投放窗口, AI升级策略' },
      ] }),
      createParam('max_variants', '同时测试版本上限', 5, '个', '同一投放计划同时测试的素材版本数, 过多分散流量影响显著性', 4, 83, { min: 2, max: 10, step: 1, learningDataPoints: 29700, adjustHistory: [
        { time: '3天前', from: '4', to: '5', reason: '素材团队产能提升, AI增加同时测试版本数' },
        { time: '1周前', from: '8', to: '4', reason: '版本过多导致单版本样本不足, AI减少测试版本数' },
      ] }),
    ],
  },
  {
    title: '跨平台适配',
    icon: <Globe size={18} />,
    params: [
      createParam('auto_resize', '自动尺寸适配', '智能重构', '', '素材跨平台尺寸适配: 仅裁剪(简单裁切), 智能重构(重排版), AI全自动(重新构图)', 'AI全自动', 92, { type: 'select', options: ['关闭', '仅裁剪', '智能重构', 'AI全自动'], learningDataPoints: 58400, adjustHistory: [
        { time: '昨日', from: '仅裁剪', to: '智能重构', reason: 'AI检测到裁剪后素材关键元素丢失, 升级为智能重构' },
        { time: '3天前', from: 'AI全自动', to: '仅裁剪', reason: '全自动重构耗时过长, 临时降级为裁剪' },
      ] }),
      createParam('auto_translate', '文案本地化自动翻译', '文化适配', '', '多语言文案处理策略: 仅翻译(直译), 文化适配(本地化俚语/习惯), AI创意本地化(重写文案)', 'AI创意本地化', 85, { type: 'select', options: ['关闭', '仅翻译', '文化适配', 'AI创意本地化'], learningDataPoints: 31800, adjustHistory: [
        { time: '2天前', from: '仅翻译', to: '文化适配', reason: 'AI发现直译文案在日本市场CTR偏低, 升级为文化适配' },
        { time: '1周前', from: '文化适配', to: '仅翻译', reason: '文化适配模型中东语言支持不足, 临时降级' },
      ] }),
      createParam('style_adapt', '平台风格适配强度', 80, '%', '根据各平台视觉风格(抖音竖版/小红书图文/快手短视频)调整素材的力度', 85, 83, { min: 30, max: 100, step: 5, learningDataPoints: 26500, adjustHistory: [
        { time: '昨日', from: '70', to: '80', reason: '抖音原生风格素材CTR高出40%, AI增强平台适配强度' },
        { time: '4天前', from: '90', to: '70', reason: '过度适配导致品牌识别度下降, AI降低适配强度' },
      ] }),
      createParam('multi_publish', '多平台一键发布', '半自动', '', '素材发布至抖音/小红书/快手/微信视频号的自动化程度, 全自动需确保各平台素材规格合规', '全自动', 88, { type: 'select', options: ['手动', '半自动', '全自动'], autoTuneEnabled: false, learningDataPoints: 42100, adjustHistory: [
        { time: '5天前', from: '全自动', to: '半自动', reason: '全自动发布导致不合规素材上线小红书, 手动降级为半自动' },
      ] }),
    ],
  },
]

const creativeAILearningStatus: AILearningStatus = {
  modelVersion: 'v2.5.0-creative',
  lastTraining: '3小时前',
  totalDataPoints: 168000,
  avgConfidence: 86,
  autoAdjustCount24h: 124,
  learningRate: '0.001 (AdamW)',
  nextTraining: '5小时后',
  improvementRate: '+14.2%',
}

const tabs = ['生产即投流水线', 'AI闭环学习', '素材×效果实时联动', '自动替换引擎']

// ─── Material Detail Mock Data ───
type MaterialDetail = {
  id: string
  hook: string
  platform: string
  targeting: string
  stage: string
  stageProgress: number
  aiScores: { hook: number; visual: number; cta: number; platformFit: number }
  variants: string[]
  forecastCTR: [number, number]
  audienceMatch: number
  budget: number
  bid: number
  autoTargeting: string
}

const materialDetailMap: Record<string, MaterialDetail> = {
  'M-5501': {
    id: 'M-5501', hook: '"用了这支唇釉，男友非要知道色号"',
    platform: '抖音', targeting: '女性 18-35 兴趣:彩妆',
    stage: 'AI生成', stageProgress: 65,
    aiScores: { hook: 88, visual: 72, cta: 80, platformFit: 91 },
    variants: ['M-5501-A (色号展示+教程)', 'M-5501-B (素人测评)'],
    forecastCTR: [6.8, 9.2], audienceMatch: 87,
    budget: 200, bid: 0.45, autoTargeting: '彩妆兴趣 + 相似受众扩展',
  },
  'M-5502': {
    id: 'M-5502', hook: '"皮肤科医生都说这款卸妆水温和"',
    platform: '小红书', targeting: '女性 25-35 兴趣:护肤',
    stage: '自动建计划', stageProgress: 90,
    aiScores: { hook: 76, visual: 85, cta: 68, platformFit: 88 },
    variants: ['M-5502-A (成分解析)', 'M-5502-B (使用前后对比)'],
    forecastCTR: [5.5, 7.8], audienceMatch: 79,
    budget: 150, bid: 0.32, autoTargeting: '护肤兴趣 + 行为定向',
  },
  'M-5503': {
    id: 'M-5503', hook: '"30秒眼妆教程，新手也能学会"',
    platform: '快手', targeting: '女性 18-28 兴趣:美妆教程',
    stage: '跑量', stageProgress: 100,
    aiScores: { hook: 92, visual: 78, cta: 85, platformFit: 83 },
    variants: ['M-5503-A (步骤分解)', 'M-5503-B (成品展示)'],
    forecastCTR: [4.8, 6.5], audienceMatch: 91,
    budget: 500, bid: 1.20, autoTargeting: '美妆教程关键词 + 达人粉丝定向',
  },
}

// ─── Pipeline Stage Detail Mock Data ───
type PipelineStageDetail = {
  name: string
  itemsInStage: number
  avgProcessingTime: string
  successRate: number
  failureRate: number
  queuedItems: number
}

const pipelineStageDetailMap: Record<string, PipelineStageDetail> = {
  'AI生成': { name: 'AI生成', itemsInStage: 28, avgProcessingTime: '12分钟', successRate: 89, failureRate: 11, queuedItems: 14 },
  '智能审核': { name: '智能审核', itemsInStage: 25, avgProcessingTime: '6秒/条', successRate: 95, failureRate: 5, queuedItems: 8 },
  '自动建计划': { name: '自动建计划', itemsInStage: 23, avgProcessingTime: '2分钟', successRate: 98, failureRate: 2, queuedItems: 5 },
  '学习期': { name: '学习期', itemsInStage: 18, avgProcessingTime: '48小时', successRate: 72, failureRate: 28, queuedItems: 3 },
  '起量': { name: '起量', itemsInStage: 12, avgProcessingTime: '24-72小时', successRate: 81, failureRate: 19, queuedItems: 0 },
  '跑量': { name: '跑量', itemsInStage: 8, avgProcessingTime: '持续', successRate: 94, failureRate: 6, queuedItems: 0 },
}

// ─── Shared Styles ───
const card: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 24,
}
const cardInner: React.CSSProperties = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: 10,
  padding: 16,
}
const sectionTitle: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 700,
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}
const metricCard: React.CSSProperties = {
  ...card,
  padding: 20,
}
const label: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginBottom: 6,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}
const bigNum: React.CSSProperties = {
  fontSize: '1.8rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
}
const subText: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--accent-primary)',
  marginTop: 4,
}
const tooltipStyle = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: '0.78rem',
}

export default function CreativeStudio() {
  const [activeTab, setActiveTab] = useState(0)
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(0)
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [studioToast, setStudioToast] = useState<string | null>(null)
  const [assetPanelOpen, setAssetPanelOpen] = useState(false)
  const [interventionNote, setInterventionNote] = useState('')
  const [interventionSubmitted, setInterventionSubmitted] = useState(false)
  const [materialPaused, setMaterialPaused] = useState(false)
  const [langMode, setLangMode] = useState<'zh' | 'intl'>('zh')
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['en', 'ja'])
  useRegisterAIConfig(creativeAIConfigGroups, creativeAILearningStatus, 'AI素材工厂')

  const showStudioToast = (msg: string) => {
    setStudioToast(msg)
    setTimeout(() => setStudioToast(null), 3500)
  }

  const matDetail = selectedMaterial ? materialDetailMap[selectedMaterial] : null
  const stgDetail = selectedStage ? pipelineStageDetailMap[selectedStage] : null
  const stgInfo = selectedStage ? pipelineStages.find(s => s.name === selectedStage) : null

  const statusColor = (s: string) =>
    s === '跑量' ? '#16a34a' : s === '测试' ? '#ca8a04' : '#dc2626'

  const logBorder = (t: string) =>
    t === 'success' ? '#22c55e' : t === 'warning' ? '#eab308' : '#ff7a95'
  const logBg = (t: string) =>
    t === 'success' ? 'rgba(34,197,94,0.06)' : t === 'warning' ? 'rgba(234,179,8,0.06)' : 'rgba(232,54,93,0.06)'

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--gradient-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Cpu size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>AI创意工厂 — 生产即投引擎</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>全自动闭环：AI生成 → 自动投放 → 数据回流 → 模型进化</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e88' }} />
          <span style={{ color: '#22c55e', fontWeight: 600 }}>系统运行中</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>引擎版本 v3.8.47</span>
        </div>
      </div>

      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="ContentLLM-Beauty" color="#ec4899" />
        <ModelBadge name="ImageGen-SDXL-LoRA" color="#ec4899" />
        <ModelBadge name="UGCQuality-Ranker" color="#ec4899" />
        <ModelBadge name="CreativeFatigue-MAB" color="#e8365d" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
      </div>

      {/* ── 语言/市场选择 ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([
          { key: 'zh' as const, label: '\ud83c\udde8\ud83c\uddf3 中文素材' },
          { key: 'intl' as const, label: '\ud83c\udf0d 多语言素材' },
        ]).map(opt => (
          <button
            key={opt.key}
            onClick={() => setLangMode(opt.key)}
            style={{
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: '0.85rem',
              fontWeight: 600,
              border: langMode === opt.key ? '2px solid var(--accent-primary)' : '2px solid var(--border-light)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: langMode === opt.key ? 'rgba(232,54,93,0.10)' : 'var(--bg-primary)',
              color: langMode === opt.key ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── 多语言素材 Section ── */}
      {langMode === 'intl' && (() => {
        const langOptions = [
          { key: 'en', flag: '\ud83c\uddfa\ud83c\uddf8', label: 'English' },
          { key: 'ja', flag: '\ud83c\uddef\ud83c\uddf5', label: '日本語' },
          { key: 'fr', flag: '\ud83c\uddeb\ud83c\uddf7', label: 'Fran\u00e7ais' },
          { key: 'de', flag: '\ud83c\udde9\ud83c\uddea', label: 'Deutsch' },
          { key: 'es', flag: '\ud83c\uddea\ud83c\uddf8', label: 'Espa\u00f1ol' },
        ]
        const toggleLang = (key: string) => {
          setSelectedLangs(prev => prev.includes(key) ? prev.filter(l => l !== key) : [...prev, key])
        }
        const templateCards = [
          {
            lang: 'en', flag: '\ud83c\uddfa\ud83c\uddf8', label: 'English',
            text: 'Marie Dalgar new foundation \u2014 lightweight, all-day wear',
            confidence: 92,
            note: '\u76f4\u8bd1+\u5e7f\u544a\u6587\u6848\u98ce\u683c\u4f18\u5316\uff0c\u7b26\u5408\u6b27\u7f8e\u7b80\u6d01\u8868\u8fbe',
          },
          {
            lang: 'ja', flag: '\ud83c\uddef\ud83c\uddf5', label: '日本語',
            text: '\u30de\u30ea\u30fc\u30c0\u30eb\u30ac\u30fc\u65b0\u4f5c\u30d5\u30a1\u30f3\u30c7\u3001\u8efd\u3084\u304b\u306b\u4e00\u65e5\u4e2d\u30ad\u30fc\u30d7',
            confidence: 88,
            note: 'J-beauty\u5ba1\u7f8e\u98ce\u683c\u9002\u914d\uff0c\u52a0\u5165\u201c\u8efd\u3084\u304b\u201d\u7b49\u65e5\u8bed\u7f8e\u5986\u8bcd\u6c47',
          },
          {
            lang: 'zh', flag: '\ud83c\udde8\ud83c\uddf3', label: '\u539f\u6587(\u4e2d\u6587)',
            text: '\u739b\u4e3d\u9edb\u4f73\u5e95\u5986\u65b0\u54c1\uff0c\u8f7b\u8584\u6301\u5986\u4e00\u6574\u5929',
            confidence: 100,
            note: '\u539f\u59cb\u7d20\u6750\u6587\u6848',
          },
        ]
        const culturalChecks = [
          { icon: '\u2705', market: 'US\u5e02\u573a', text: '\u65e0\u6587\u5316\u654f\u611f\u8bcd\u68c0\u6d4b\u901a\u8fc7', color: '#16a34a' },
          { icon: '\u26a0\ufe0f', market: '\u4e2d\u4e1c\u5e02\u573a', text: '\u68c0\u6d4b\u5230\u9732\u80a4\u5143\u7d20\uff0c\u5efa\u8bae\u8c03\u6574\u7d20\u6750', color: '#eab308' },
          { icon: '\u2705', market: '\u65e5\u672c\u5e02\u573a', text: '\u7b26\u5408J-beauty\u5ba1\u7f8e\u6807\u51c6', color: '#16a34a' },
          { icon: '\ud83d\udfe1', market: '\u6cd5\u56fd\u5e02\u573a', text: '\u5efa\u8bae\u589e\u52a0\u6210\u5206\u900f\u660e\u5ea6\u63cf\u8ff0(EU\u6cd5\u89c4)', color: '#eab308' },
        ]
        return (
          <div style={{ ...card, marginBottom: 24 }}>
            <h3 style={sectionTitle}>
              <Globe size={18} color="#0ea5e9" /> \ud83c\udf0d AI\u591a\u8bed\u8a00\u7d20\u6750\u751f\u6210
            </h3>

            {/* 目标语言选择 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>\u76ee\u6807\u8bed\u8a00\u9009\u62e9</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {langOptions.map(lo => {
                  const active = selectedLangs.includes(lo.key)
                  return (
                    <button
                      key={lo.key}
                      onClick={() => toggleLang(lo.key)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 20,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: active ? '2px solid #0ea5e9' : '2px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: active ? 'rgba(14,165,233,0.10)' : 'var(--bg-primary)',
                        color: active ? '#0ea5e9' : 'var(--text-muted)',
                      }}
                    >
                      {lo.flag} {lo.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 素材模板预览 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>\u7d20\u6750\u6a21\u677f\u9884\u89c8</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {templateCards.map(tc => (
                  <div key={tc.lang} style={{ ...cardInner, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{tc.flag} {tc.label}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700,
                        background: tc.confidence >= 90 ? 'rgba(22,163,74,0.12)' : 'rgba(234,179,8,0.12)',
                        color: tc.confidence >= 90 ? '#16a34a' : '#ca8a04',
                      }}>
                        AI\u7f6e\u4fe1\u5ea6 {tc.confidence}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                      {tc.text}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: 8 }}>
                      \ud83d\udcdd \u6587\u5316\u9002\u914d: {tc.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 文化适配检测 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>\u6587\u5316\u9002\u914d\u68c0\u6d4b</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {culturalChecks.map((ck, i) => (
                  <div key={i} style={{
                    ...cardInner,
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                    borderLeft: `3px solid ${ck.color}`,
                  }}>
                    <span style={{ fontSize: '1rem' }}>{ck.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 72 }}>{ck.market}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ck.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI模型标注 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 14px', background: 'rgba(14,165,233,0.06)', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>\u9a71\u52a8\u6a21\u578b\uff1a</span>
              <ModelBadge name="MultiLingual-ContentLLM" color="#0ea5e9" />
              <ModelBadge name="CulturalAdapt-Classifier" color="#0ea5e9" />
            </div>
          </div>
        )
      })()}

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid var(--border-light)' }}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === i ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === i ? '#fff' : 'var(--text-muted)',
              boxShadow: activeTab === i ? '0 2px 8px rgba(232,54,93,0.25)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ══════ Tab 1: Pipeline ══════ */}
      {activeTab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {pipelineMetrics.map((m) => (
              <div key={m.label} style={metricCard}>
                <div style={label}><m.icon size={14} color="var(--accent-primary)" /> {m.label}</div>
                <div style={bigNum}>{m.value}</div>
                <div style={subText}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Pipeline Visualization */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <GitBranch size={18} color="var(--accent-primary)" /> 实时流水线状态
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {pipelineStages.map((stage, i) => (
                <div key={stage.name} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                    onClick={() => setSelectedStage(stage.name)}
                  >
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', fontWeight: 700, color: stage.color,
                      border: `2px solid ${selectedStage === stage.name ? stage.color : stage.color}`,
                      backgroundColor: stage.color + '18',
                      boxShadow: selectedStage === stage.name ? `0 0 0 4px ${stage.color}35` : 'none',
                      transition: 'box-shadow 0.15s',
                    }}>
                      {stage.count}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: '0.82rem' }}>
                      <stage.icon size={14} color={stage.color} />
                      <span style={{ color: 'var(--text-secondary)' }}>{stage.name}</span>
                    </div>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', margin: '0 12px' }}>
                      <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg, var(--rose-400), var(--rose-200))', opacity: 0.5 }} />
                      <ArrowUpRight size={16} color="var(--accent-light)" style={{ marginLeft: -4 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Items */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Activity size={18} color="var(--accent-primary)" /> 流水线实时素材
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pipelineItems.map((item) => (
                <div key={item.id}
                  onClick={() => setSelectedMaterial(item.id)}
                  style={{
                    ...cardInner,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: selectedMaterial === item.id ? '0 0 0 2px #e8365d' : undefined,
                    transition: 'box-shadow 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div>
                      <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontWeight: 700 }}>{item.id}</span>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.hook}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>平台</div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.platform}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>自动定向</div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.targeting}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>创建时间</div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.created}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>当前阶段</div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{item.stage}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>阶段耗时</div>
                      <span style={{ fontSize: '0.82rem', color: '#ca8a04' }}>{item.elapsed}</span>
                    </div>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: item.status === 'running' ? '#22c55e' : '#eab308',
                      display: 'inline-block',
                      boxShadow: `0 0 6px ${item.status === 'running' ? '#22c55e88' : '#eab30888'}`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ Tab 2: AI Learning ══════ */}
      {activeTab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Learning Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {learningMetrics.map((m) => (
              <div key={m.label} style={metricCard}>
                <div style={label}><m.icon size={14} color="var(--accent-primary)" /> {m.label}</div>
                <div style={bigNum}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Learning Loop Diagram */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Brain size={18} color="var(--accent-primary)" /> AI闭环学习流程
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '16px 0' }}>
              {['投放数据\n(CTR/CVR/ROI)', '特征提取', '模型训练', '创意策略更新', '新素材产出'].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    background: 'rgba(232,54,93,0.08)',
                    border: '1px solid rgba(232,54,93,0.25)',
                    borderRadius: 10, padding: '12px 16px',
                    textAlign: 'center', fontSize: '0.82rem',
                    whiteSpace: 'pre-line', minWidth: 100,
                    color: 'var(--text-primary)',
                  }}>
                    {step}
                  </div>
                  {i < 4 && <ArrowUpRight size={18} color="var(--accent-primary)" style={{ margin: '0 8px' }} />}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
                <RefreshCw size={14} /> 循环反馈 — 每次投放结果自动回流至模型
              </div>
            </div>
          </div>

          {/* Learning History Chart */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <TrendingUp size={18} color="var(--accent-primary)" /> 学习迭代趋势 — CTR预测 vs 实际
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={learningHistory}>
                <XAxis dataKey="cycle" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="accuracy" fill="rgba(232,54,93,0.08)" stroke="none" />
                <Line type="monotone" dataKey="predicted" stroke="#ff7a95" strokeWidth={2} dot={{ r: 4 }} name="AI预测CTR" />
                <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="实际CTR" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Bot size={18} color="var(--accent-primary)" /> AI发现的规律
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiInsights.map((insight, i) => (
                <div key={i} style={{
                  ...cardInner,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '0.82rem' }}>#{i + 1}</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{insight.text}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>置信度</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{insight.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Per-business Line */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Target size={18} color="var(--accent-primary)" /> 业务线学习成果
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {businessLineLearning.map((bl) => (
                <div key={bl.line} style={cardInner}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <bl.icon size={18} color="var(--accent-primary)" />
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{bl.line}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>最优Hook类型：</span><span>{bl.best}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>最优CTR：</span><span style={{ color: '#16a34a', fontWeight: 600 }}>{bl.ctr}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>核心洞察：</span><span style={{ color: 'var(--text-secondary)' }}>{bl.insight}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ Tab 3: Real-time Performance ══════ */}
      {activeTab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Campaign Materials */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Layers size={18} color="var(--accent-primary)" /> 素材效果实时看板
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {campaignMaterials.map((campaign, ci) => (
                <div key={campaign.campaign} style={{ ...cardInner, padding: 0, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedCampaign(expandedCampaign === ci ? null : ci)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: 16, background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-primary)', fontSize: '0.9rem',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{campaign.campaign}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                      <span style={{ fontSize: '0.82rem' }}>{campaign.materials.length} 条素材</span>
                      {expandedCampaign === ci ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>
                  {expandedCampaign === ci && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 600 }}>素材ID</th>
                            <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 600 }}>Hook文本</th>
                            <th style={{ textAlign: 'left', paddingBottom: 8, fontWeight: 600 }}>平台</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>CTR</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>CVR</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>ROAS</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>消耗</th>
                            <th style={{ textAlign: 'center', paddingBottom: 8, fontWeight: 600 }}>状态</th>
                            <th style={{ textAlign: 'right', paddingBottom: 8, fontWeight: 600 }}>AI置信度</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaign.materials.map((m) => (
                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '10px 0', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{m.id}</td>
                              <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>{m.hook}</td>
                              <td style={{ padding: '10px 0' }}>{m.platform}</td>
                              <td style={{ padding: '10px 0', textAlign: 'right' }}>{m.ctr}%</td>
                              <td style={{ padding: '10px 0', textAlign: 'right' }}>{m.cvr}%</td>
                              <td style={{ padding: '10px 0', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{m.roas}x</td>
                              <td style={{ padding: '10px 0', textAlign: 'right' }}>¥{m.spend}</td>
                              <td style={{ padding: '10px 0', textAlign: 'center', fontWeight: 600, color: statusColor(m.status) }}>{m.status}</td>
                              <td style={{ padding: '10px 0', textAlign: 'right' }}>
                                <span style={{ color: m.confidence >= 80 ? '#16a34a' : m.confidence >= 60 ? '#ca8a04' : '#dc2626', fontWeight: 600 }}>
                                  {m.confidence}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Auto Action Logs */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Zap size={18} color="var(--accent-primary)" /> AI自动操作日志
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {autoActionLogs.map((log, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: 12, borderRadius: 8,
                  borderLeft: `3px solid ${logBorder(log.type)}`,
                  background: logBg(log.type),
                }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem', flexShrink: 0 }}>{log.time}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{log.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health Chart */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Activity size={18} color="var(--accent-primary)" /> 素材健康度趋势 (CTR%)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={healthData}>
                <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="m5501" stroke="#ff7a95" strokeWidth={2} name="M-5501" />
                <Line type="monotone" dataKey="m5502" stroke="#6366f1" strokeWidth={2} name="M-5502" />
                <Line type="monotone" dataKey="m5503" stroke="#dc2626" strokeWidth={2} name="M-5503" />
                <Line type="monotone" dataKey="m5504" stroke="#16a34a" strokeWidth={2} name="M-5504" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════ Tab 4: Auto Replacement ══════ */}
      {activeTab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Replacement Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {replacementMetrics.map((m) => (
              <div key={m.label} style={metricCard}>
                <div style={label}><m.icon size={14} color="var(--accent-primary)" /> {m.label}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</div>
                <div style={subText}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Detection Rule */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <AlertTriangle size={18} color="#ca8a04" /> 衰退检测规则
            </h3>
            <p style={{
              ...cardInner,
              fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8,
            }}>
              当素材CTR较峰值下降 <span style={{ color: '#dc2626', fontWeight: 700 }}>&gt;30%</span>，AI自动触发替换流程：
              预生成替换素材 → 继承原定向配置 → 无缝切换 → 全程0人工干预
            </p>
          </div>

          {/* Replacement Events */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <RefreshCw size={18} color="var(--accent-primary)" /> 近期替换事件
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {replacementEvents.map((evt, i) => (
                <div key={i} style={cardInner}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#dc2626', fontFamily: 'monospace', fontWeight: 600 }}>{evt.original}</span>
                        <ArrowUpRight size={14} color="var(--text-muted)" />
                        <span style={{ color: '#16a34a', fontFamily: 'monospace', fontWeight: 600 }}>{evt.replacement}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>CTR:</span>
                        <span style={{ color: '#dc2626' }}>{evt.oldCtr}%</span>
                        <ArrowUpRight size={12} color="var(--text-muted)" />
                        <span style={{ color: '#16a34a' }}>{evt.newCtr}%</span>
                        <ArrowUpRight size={14} color="#16a34a" />
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{evt.time}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bot size={14} color="var(--accent-primary)" /> AI决策：{evt.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Replacement Trend Chart */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <TrendingUp size={18} color="var(--accent-primary)" /> 替换趋势
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={replacementTrend}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#e8365d" radius={[4, 4, 0, 0]} name="替换次数" />
                <Bar dataKey="recovery" fill="rgba(168,85,247,0.15)" stroke="#ff7a95" radius={[4, 4, 0, 0]} name="恢复率%" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Replacements */}
          <div style={card}>
            <h3 style={sectionTitle}>
              <Clock size={18} color="#ca8a04" /> 预计24小时内需替换素材
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcomingReplacements.map((item) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg-primary)', borderRadius: 10, padding: 16,
                  border: '1px solid rgba(202,138,4,0.2)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ color: '#ca8a04', fontFamily: 'monospace', fontWeight: 700 }}>{item.id}</span>
                    <div style={{ fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>当前CTR </span>
                      <span>{item.currentCtr}%</span>
                      <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>峰值 </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.peakCtr}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
                      <ArrowDownRight size={14} color="#dc2626" />
                      <span style={{ color: '#dc2626' }}>-{item.decline}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{item.predictedTime}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{item.replacement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ Material Detail Panel ══════ */}
      {selectedMaterial && matDetail && (
        <>
          <div
            onClick={() => setSelectedMaterial(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }}
          />
          <div style={{
            position: 'fixed', right: 0, top: 0, bottom: 0, width: 500,
            background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
            zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(232,54,93,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e8365d', fontFamily: 'monospace' }}>{matDetail.id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3, maxWidth: 380 }}>{matDetail.hook}</div>
              </div>
              <button onClick={() => setSelectedMaterial(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: '平台', value: matDetail.platform },
                  { label: '受众定向', value: matDetail.targeting },
                  { label: '当前阶段', value: matDetail.stage },
                  { label: '阶段进度', value: `${matDetail.stageProgress}%` },
                ].map(r => (
                  <div key={r.label} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3 }}>{r.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.value}</div>
                  </div>
                ))}
              </div>

              {/* Stage Progress Bar */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>流水线进度 — {matDetail.stage}</div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, width: `${matDetail.stageProgress}%`, background: 'linear-gradient(90deg, #e8365d, #ff7a95)', transition: 'width 0.4s' }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#e8365d', marginTop: 4, fontWeight: 700 }}>{matDetail.stageProgress}%</div>
              </div>

              {/* AI Quality Scores */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>AI质量评分</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Hook强度', value: matDetail.aiScores.hook },
                    { label: '视觉质量', value: matDetail.aiScores.visual },
                    { label: 'CTA清晰度', value: matDetail.aiScores.cta },
                    { label: '平台适配', value: matDetail.aiScores.platformFit },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 80, fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{s.label}</div>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, width: `${s.value}%`, background: s.value >= 85 ? '#16a34a' : s.value >= 70 ? '#ff7a95' : '#f59e0b' }} />
                      </div>
                      <div style={{ width: 36, fontSize: '0.78rem', fontWeight: 700, color: s.value >= 85 ? '#16a34a' : s.value >= 70 ? '#e8365d' : '#f59e0b', textAlign: 'right', flexShrink: 0 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* A/B Variants */}
              {matDetail.variants.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>A/B 变体</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matDetail.variants.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(232,54,93,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#e8365d', flexShrink: 0 }}>{i === 0 ? 'A' : 'B'}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Forecast */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>效果预测</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3 }}>预测CTR区间</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e8365d' }}>{matDetail.forecastCTR[0]}% – {matDetail.forecastCTR[1]}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3 }}>受众匹配度</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: matDetail.audienceMatch >= 85 ? '#16a34a' : '#ff7a95' }}>{matDetail.audienceMatch}%</div>
                  </div>
                </div>
              </div>

              {/* Auto-investment Plan */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>自动投放计划</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>预算/日</span>
                    <span style={{ fontWeight: 600 }}>¥{matDetail.budget}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>出价</span>
                    <span style={{ fontWeight: 600 }}>¥{matDetail.bid} CPC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>AI定向策略</span>
                    <span style={{ fontWeight: 600, color: '#e8365d' }}>{matDetail.autoTargeting}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>操作</div>

                {/* 查看素材 */}
                <button
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e8365d40', background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => setAssetPanelOpen(prev => !prev)}
                >
                  {assetPanelOpen ? '▲ 收起素材' : '查看素材'}
                </button>
                {assetPanelOpen && (
                  <div style={{ borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-main)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ width: '100%', height: 80, borderRadius: 6, background: 'linear-gradient(135deg,#e8365d22,#ff7a9522)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      📷 素材预览图（唇釉试色短视频封面）
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, fontSize: '0.7rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>CTR</span><br /><b style={{ color: '#e8365d' }}>5.8%</b></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>尺寸</span><br /><b>1080×1920</b></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>格式</span><br /><b>MP4 / 15s</b></div>
                    </div>
                  </div>
                )}

                {/* 手动干预 */}
                <button
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #ff7a9540', background: 'rgba(168,85,247,0.1)', color: '#ff7a95', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => { setInterventionSubmitted(false); setInterventionNote('') }}
                >
                  手动干预
                </button>
                {!interventionSubmitted ? (
                  <div style={{ borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-main)', padding: 10, display: 'flex', gap: 8 }}>
                    <input
                      value={interventionNote}
                      onChange={e => setInterventionNote(e.target.value)}
                      placeholder="输入干预备注…"
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.75rem', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <button
                      style={{ padding: '6px 12px', borderRadius: 6, background: '#ff7a95', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                      onClick={() => {
                        if (!interventionNote.trim()) return
                        setInterventionSubmitted(true)
                        showStudioToast('✅ 干预备注已提交，AI投手已收到指令')
                      }}
                    >提交</button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#22c55e', padding: '6px 0', fontWeight: 600 }}>✅ 干预备注已提交：{interventionNote}</div>
                )}

                {/* 优先投放 */}
                <button
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #16a34a40', background: 'rgba(22,163,74,0.08)', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => showStudioToast('✅ 已设为优先投放，将在下一个出价周期中首先投出')}
                >
                  优先投放
                </button>

                {/* 暂停 / 恢复投放 */}
                <button
                  style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${materialPaused ? '#f59e0b40' : '#dc262640'}`, background: materialPaused ? 'rgba(245,158,11,0.08)' : 'rgba(220,38,38,0.08)', color: materialPaused ? '#f59e0b' : '#dc2626', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => {
                    const next = !materialPaused
                    setMaterialPaused(next)
                    showStudioToast(next ? '⏸ 素材已暂停投放' : '▶ 素材已恢复投放')
                  }}
                >
                  {materialPaused ? '恢复投放' : '暂停'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════ Pipeline Stage Popup ══════ */}
      {selectedStage && stgDetail && stgInfo && (
        <>
          <div
            onClick={() => setSelectedStage(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 360, background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
            zIndex: 1000, overflow: 'hidden',
          }}>
            {/* Popup Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: `${stgInfo.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <stgInfo.icon size={18} color={stgInfo.color} />
                <span style={{ fontWeight: 700, color: stgInfo.color, fontSize: '1rem' }}>{stgDetail.name}</span>
              </div>
              <button onClick={() => setSelectedStage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            {/* Popup Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>当前阶段素材数</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stgInfo.color }}>{stgDetail.itemsInStage}</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>队列等待</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: stgDetail.queuedItems > 5 ? '#f59e0b' : 'var(--text-primary)' }}>{stgDetail.queuedItems}</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>平均处理时长</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stgDetail.avgProcessingTime}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>今日通过率 / 失败率</div>
                <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ flex: stgDetail.successRate, background: '#16a34a' }} />
                  <div style={{ flex: stgDetail.failureRate, background: '#dc2626' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem' }}>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>通过 {stgDetail.successRate}%</span>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>失败 {stgDetail.failureRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Studio Toast */}
      {studioToast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,30,40,0.92)', color: '#fff', padding: '10px 24px',
          borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none',
        }}>
          {studioToast}
        </div>
      )}
    </div>
  )
}
