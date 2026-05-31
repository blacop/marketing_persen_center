import { useState, useEffect, useCallback } from 'react'
import { exportObjectsCsv } from '../utils/exportCsv'
import {
  TrendingUp, TrendingDown, Globe, Zap, AlertTriangle,
  Search, Filter, ChevronRight, Bell,
  Star, Activity, X, Eye, Download, ExternalLink,
  Info, Check, RefreshCw, Brain
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
  AreaChart, Area, CartesianGrid
} from 'recharts'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CompAd {
  competitor: string
  platform: string
  type: string
  firstSeen: string
  market: string
  estSpend: string
  creative: string
  perfEst: string
}

interface Keyword {
  keyword: string
  searchVol: number
  competition: string
  ourRank: number
  compRank: string
  cpc: string
  suggestion: string
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
}

// ─── Static Data ───────────────────────────────────────────────────────────────
const competitors = ['完美日记', '花西子', 'COLORKEY', 'UNNY', 'Fenty Beauty', 'Charlotte Tilbury', 'e.l.f.']

const monthlySpendData = [
  { month: '10月', '玛丽黛佳': 2340, '完美日记': 1820, '花西子': 1540, 'COLORKEY': 980, 'UNNY': 720 },
  { month: '11月', '玛丽黛佳': 2780, '完美日记': 1950, '花西子': 1680, 'COLORKEY': 1120, 'UNNY': 840 },
  { month: '12月', '玛丽黛佳': 3120, '完美日记': 2240, '花西子': 1820, 'COLORKEY': 1350, 'UNNY': 960 },
  { month: '1月',  '玛丽黛佳': 2890, '完美日记': 2580, '花西子': 1980, 'COLORKEY': 1480, 'UNNY': 1020 },
  { month: '2月',  '玛丽黛佳': 3340, '完美日记': 2840, '花西子': 2150, 'COLORKEY': 1640, 'UNNY': 1180 },
  { month: '3月',  '玛丽黛佳': 3890, '完美日记': 3120, '花西子': 2380, 'COLORKEY': 1820, 'UNNY': 1340 },
  { month: '🌍4月', '玛丽黛佳': 4280, '完美日记': 3340, '花西子': 2560, 'COLORKEY': 1980, 'UNNY': 1460, 'Fenty Beauty': 8200, 'Charlotte Tilbury': 6400, 'e.l.f.': 3100 },
]

const marketShareData = [
  { name: '玛丽黛佳', value: 28.4, color: '##e8365d' },
  { name: '完美日记',    value: 24.1, color: '#ff7a95' },
  { name: '花西子',    value: 18.3, color: '#ff7a95' },
  { name: 'COLORKEY',    value: 13.8, color: '#c084fc' },
  { name: 'UNNY',    value: 10.2, color: '#ddd6fe' },
  { name: '其他',     value: 5.2,  color: '#e5e7eb' },
]

// 🌍 International Market Share (Global)
const intlMarketShareData = [
  { name: 'Fenty Beauty',       value: 18.4, color: '#e8365d' },
  { name: 'Charlotte Tilbury',  value: 14.2, color: '#ff7a95' },
  { name: 'e.l.f.',             value: 11.8, color: '#f59e0b' },
  { name: '玛丽黛佳 (Intl)',    value: 7.2,  color: '#0ea5e9' },
  { name: 'COLORKEY (Intl)',    value: 5.6,  color: '#8b5cf6' },
  { name: '其他国际品牌',        value: 42.8, color: '#e5e7eb' },
]

const competitorTimeline = [
  { date: '4月3日 14:22', company: '完美日记', event: '加大抖音巨量投放300%，预估日消耗从¥8万→¥32万', level: 'danger', icon: TrendingUp },
  { date: '4月3日 11:47', company: '花西子', event: '新增小红书聚光种草素材18套，重点布局华北市场', level: 'warning', icon: Globe },
  { date: '4月2日 16:33', company: 'COLORKEY', event: 'CPM下降15.3%（¥38→¥32），疑似更换新出价模型', level: 'warning', icon: TrendingDown },
  { date: '4月2日 09:15', company: '完美日记', event: '推出"显白唇釉"新色系5款，与当前热点高度重合', level: 'danger', icon: AlertTriangle },
  { date: '4月1日 19:42', company: 'UNNY', event: '与KOL@护肤博主小橘子 (285万粉) 签约独家合作', level: 'info', icon: Star },
  { date: '4月1日 14:08', company: '花西子', event: '小红书广告系列ROI提升至3.2，创历史最高', level: 'warning', icon: TrendingUp },
  { date: '3月31日 22:19', company: '完美日记', event: '推出AI虚拟试妆功能，宣称10分钟生产1条彩妆教程素材', level: 'info', icon: Zap },
  { date: '3月31日 10:55', company: 'COLORKEY', event: '加入快手磁力平台投放，上线平价口红本地化内容', level: 'info', icon: Globe },
  { date: '4月4日 09:20', company: 'Fenty Beauty', event: '🌍 TikTok Global JP+KR 美妆广告系列日消耗$28,000，ROI≈5.2x，大力拓展亚太市场', level: 'danger', icon: TrendingUp },
  { date: '4月3日 16:38', company: 'Charlotte Tilbury', event: '🌍 Meta EU Reels广告测试多款新品，利用苹果iOS17 SKAN4.0归因重新布局iOS受众投放', level: 'warning', icon: Globe },
  { date: '4月2日 13:22', company: 'e.l.f.', event: '🌍 Amazon DSP平台DSP投放GMV同比增长42%，扩大亚马逊Prime用户覆盖', level: 'warning', icon: TrendingUp },
  { date: '4月1日 08:55', company: 'Fenty Beauty', event: '🌍 与TikTok签署全球独家彩妆品类品牌合作，获得TikTok Shop Global优先流量扶持', level: 'danger', icon: AlertTriangle },
]

const competitorAds: CompAd[] = [
  { competitor: '完美日记', platform: '抖音巨量', type: '竖版视频(15s)', firstSeen: '04/03 09:12', market: '华东/华南', estSpend: '¥22,000/天', creative: '唇釉推荐+眼妆教程双线叙事，前3秒强反转钩子', perfEst: 'CTR≈3.8%,CPM≈¥28' },
  { competitor: '花西子', platform: '小红书聚光', type: '图文种草', firstSeen: '04/03 07:44', market: '全国', estSpend: '¥12,000/天', creative: '东方美学护肤理念，成分讲解+使用前后对比', perfEst: 'CTR≈2.1%,CPM≈¥45' },
  { competitor: '完美日记', platform: '抖音巨量', type: '竖版视频(30s)', firstSeen: '04/02 16:30', market: '华北/华东', estSpend: '¥35,000/天', creative: '眼影配色教程展示，KOL仿妆挑战', perfEst: 'CTR≈1.9%,CPM≈¥55' },
  { competitor: 'COLORKEY', platform: '小红书聚光', type: '图文轮播', firstSeen: '04/02 11:17', market: '华东/华南', estSpend: '¥14,000/天', creative: '真实用户口红色号测评，素颜对比显白', perfEst: 'CTR≈2.7%,CPM≈¥33' },
  { competitor: 'UNNY', platform: '抖音巨量', type: '竖版视频(60s)', firstSeen: '04/01 20:55', market: '华北/华中', estSpend: '¥8,500/天', creative: 'KOL日系清纯妆容教程+产品口播植入', perfEst: 'CTR≈4.2%,CPM≈¥25' },
  { competitor: '花西子', platform: '快手磁力', type: '竖版视频(30s)', firstSeen: '04/01 14:22', market: '华北/全国', estSpend: '¥9,200/天', creative: '国风彩妆对比测评，粉底护肤一体化', perfEst: 'CTR≈3.1%,CPM≈¥18' },
  { competitor: '完美日记', platform: '微信广告', type: '朋友圈广告', firstSeen: '03/31 18:44', market: '全国', estSpend: '¥28,000/天', creative: '前3秒新品发布强视觉冲击，限定色号预购', perfEst: 'CTR≈1.4%,CPM≈¥72' },
  { competitor: 'COLORKEY', platform: '抖音巨量', type: '竖版视频(15s)', firstSeen: '03/31 09:08', market: '华南/华东', estSpend: '¥6,500/天', creative: 'AI生成唇色试色效果+真实感特效，低成本高产出', perfEst: 'CTR≈2.9%,CPM≈¥20' },
  { competitor: 'UNNY', platform: '小红书聚光', type: '单图广告', firstSeen: '03/30 15:39', market: '华东/华南', estSpend: '¥7,800/天', creative: '日系极简护肤设计语言，成分简单卖点', perfEst: 'CTR≈1.7%,CPM≈¥60' },
  { competitor: '花西子', platform: '微信广告', type: '视频号广告', firstSeen: '03/29 11:22', market: '全国', estSpend: '¥11,000/天', creative: '国风直播切片+品牌故事短片，深度内容', perfEst: 'CTR≈5.1%,CPM≈¥82' },
  { competitor: 'Fenty Beauty', platform: 'TikTok Global', type: '竖版视频(15s)', firstSeen: '04/04 08:20', market: 'JP/KR/AU', estSpend: '$28,000/天', creative: '多种族模特肤色适配展示，包容性多元化营销', perfEst: 'CTR≈4.8%,CPM≈$12' },
  { competitor: 'Charlotte Tilbury', platform: 'Meta EU', type: 'Reels广告', firstSeen: '04/03 15:10', market: 'UK/DE/FR', estSpend: '€18,000/天', creative: '名媛奢华妆容教程，高端形象+明星背书', perfEst: 'CTR≈2.9%,CPM≈€38' },
  { competitor: 'e.l.f.', platform: 'Amazon DSP', type: '展示广告', firstSeen: '04/02 11:00', market: 'US', estSpend: '$12,000/天', creative: '价格对比+成分透明度卖点，平价高品质定位', perfEst: 'CTR≈1.6%,CPM≈$8' },
]

const selectedAdDetail = {
  hooks: ['前3秒极强反转情节吸引注意力', '唇釉推荐角色刻板印象快速激活共鸣', '悬念结局驱动点击了解更多'],
  strategies: ['双线叙事：主角线+竞争者线并行推进', '短视频情绪弧线：低谷→高潮→悬念', '本地化语言：华南地区口语化表达'],
  triggers: ['爱情+权力双重情感触发', '紧迫感：限时独家内容', '社会认同：展示"已有XXX万人追看"'],
  score: 87,
}

const creativeTrendData = Array.from({ length: 30 }, (_, i) => {
  const day = new Date(2026, 2, 4 + i)
  const label = `${day.getMonth() + 1}/${day.getDate()}`
  return {
    day: label,
    唇釉推荐: Math.floor(78 + Math.sin(i * 0.3) * 15 + Math.random() * 8),
    眼妆教程: Math.floor(65 + Math.cos(i * 0.25) * 12 + Math.random() * 6),
    对比测评: Math.floor(42 + Math.sin(i * 0.4 + 1) * 18 + Math.random() * 10),
    美妆内容: Math.floor(38 + i * 1.2 + Math.random() * 12),
    开箱视频: Math.floor(31 + Math.cos(i * 0.35) * 10 + Math.random() * 5),
    变美挑战: Math.floor(55 + Math.sin(i * 0.2) * 8 + Math.random() * 7),
  }
})

const creativeElements = [
  { element: '前5秒震惊钩子', frequency: '78%', avgCtr: '4.2%', trend: 'up' },
  { element: 'BGM情感共鸣配乐', frequency: '71%', avgCtr: '3.8%', trend: 'up' },
  { element: '黑白对比字幕', frequency: '64%', avgCtr: '3.1%', trend: 'up' },
  { element: '真实评论截图', frequency: '58%', avgCtr: '2.9%', trend: 'stable' },
  { element: '倒计时紧迫感', frequency: '52%', avgCtr: '3.5%', trend: 'up' },
  { element: '唇釉推荐类型角色', frequency: '67%', avgCtr: '3.4%', trend: 'stable' },
  { element: '竖版全屏布局', frequency: '89%', avgCtr: '3.3%', trend: 'stable' },
  { element: '人物特写镜头', frequency: '74%', avgCtr: '2.7%', trend: 'down' },
  { element: '反转情节设计', frequency: '61%', avgCtr: '4.1%', trend: 'up' },
  { element: '本地KOL出镜', frequency: '43%', avgCtr: '5.2%', trend: 'up' },
]

const keywordChartData = [
  { kw: '唇釉推荐种草内容', vol: 892000 }, { kw: '眼影测评', vol: 743000 },
  { kw: '彩妆教程合集', vol: 621000 }, { kw: '唇釉显白', vol: 558000 },
  { kw: '粉底肤感', vol: 487000 }, { kw: '眼影配色', vol: 412000 },
  { kw: '睫毛纤长', vol: 378000 },   { kw: '限定色号', vol: 334000 },
  { kw: '底妆技巧', vol: 298000 },   { kw: '成分解析', vol: 276000 },
]

const keywords: Keyword[] = [
  { keyword: '唇釉推荐种草内容', searchVol: 892000, competition: '极高', ourRank: 2, compRank: '完美日记:#1', cpc: '¥1.82', suggestion: '加大预算竞争第1位' },
  { keyword: '眼影测评', searchVol: 743000, competition: '高', ourRank: 3, compRank: '花西子:#1,完美日记:#2', cpc: '¥1.24', suggestion: '优化落地页提升转化' },
  { keyword: '彩妆教程合集', searchVol: 621000, competition: '高', ourRank: 5, compRank: 'COLORKEY:#1', cpc: '¥0.98', suggestion: '新增眼妆题材内容' },
  { keyword: '唇釉显白', searchVol: 558000, competition: '中高', ourRank: 1, compRank: '完美日记:#2', cpc: '¥1.15', suggestion: '维持现有投入' },
  { keyword: '粉底肤感', searchVol: 487000, competition: '中', ourRank: 4, compRank: 'UNNY:#1', cpc: '¥0.76', suggestion: '创意差异化突破' },
  { keyword: '眼影配色', searchVol: 412000, competition: '中', ourRank: 2, compRank: '完美日记:#1', cpc: '¥0.89', suggestion: '关联推荐扩展流量' },
  { keyword: '睫毛纤长', searchVol: 378000, competition: '中', ourRank: 1, compRank: '花西子:#2', cpc: '¥0.95', suggestion: '持续保持领先' },
  { keyword: '限定色号', searchVol: 334000, competition: '低', ourRank: 3, compRank: '完美日记:#1', cpc: '¥0.67', suggestion: '增加素材测试' },
  { keyword: '底妆技巧', searchVol: 298000, competition: '低', ourRank: 6, compRank: 'COLORKEY:#1', cpc: '¥0.52', suggestion: '评估是否值得投入' },
  { keyword: '成分解析', searchVol: 276000, competition: '中', ourRank: 2, compRank: '完美日记:#1', cpc: '¥0.83', suggestion: '差异化角度切入' },
  { keyword: '口红色号', searchVol: 245000, competition: '低', ourRank: 1, compRank: 'UNNY:#3', cpc: '¥0.61', suggestion: '先发优势维持' },
  { keyword: '轻薄粉底', searchVol: 218000, competition: '低', ourRank: 4, compRank: '花西子:#1', cpc: '¥0.71', suggestion: '测试小预算投入' },
  { keyword: '变美挑战', searchVol: 334000, competition: '高', ourRank: 5, compRank: '完美日记:#2,COLORKEY:#3', cpc: '¥1.34', suggestion: '细化受众定向' },
  { keyword: '仿妆教程', searchVol: 456000, competition: '高', ourRank: 3, compRank: '完美日记:#1', cpc: '¥1.08', suggestion: '提升出价竞争' },
  { keyword: '新品种草', searchVol: 187000, competition: '低', ourRank: 2, compRank: 'UNNY:#1', cpc: '¥0.59', suggestion: '低竞争高回报机会' },
]

const alertRules = [
  { id: 'CA001', name: '竞品消耗大幅增长', condition: '任意竞品单日消耗增长 > 50%', enabled: true, lastTriggered: '今日 11:23' },
  { id: 'CA002', name: '竞品进入新市场', condition: '检测到竞品在新地区上线广告', enabled: true, lastTriggered: '昨日 16:44' },
  { id: 'CA003', name: 'COLORKEY CPM显著下降', condition: 'COLORKEY CPM较上周下降 > 20%', enabled: true, lastTriggered: '2天前' },
  { id: 'CA004', name: '热门创意标签涌现', condition: '新创意标签7日增速 > 100%', enabled: true, lastTriggered: '今日 09:17' },
  { id: 'CA005', name: '竞品关键词排名超越', condition: '竞品在我方TOP10关键词中排名 > 我方', enabled: false, lastTriggered: '5天前' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

const lineColors = ['##e8365d', '#f97316', '#ff7a95', '#ff7a95', '#0ea5e9', '#eab308']

const kpiTrendData = [
  { day: '3/28', monitors: 6, ads: 178, share: 26.1, alerts: 1 },
  { day: '3/29', monitors: 7, ads: 192, share: 26.5, alerts: 2 },
  { day: '3/30', monitors: 7, ads: 201, share: 27.0, alerts: 1 },
  { day: '3/31', monitors: 8, ads: 215, share: 27.4, alerts: 3 },
  { day: '4/1', monitors: 8, ads: 222, share: 27.9, alerts: 2 },
  { day: '4/2', monitors: 8, ads: 228, share: 28.1, alerts: 2 },
  { day: '4/3', monitors: 8, ads: 234, share: 28.4, alerts: 3 },
]

const kwTrendData = Array.from({ length: 14 }, (_, i) => ({
  day: `3/${20 + i}`,
  ourRank: Math.max(1, Math.floor(3 - Math.sin(i * 0.4) * 1.5)),
  compRank: Math.max(1, Math.floor(2 + Math.cos(i * 0.3) * 1.2)),
}))

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const modalStyle: React.CSSProperties = {
  background: 'white', borderRadius: 16, padding: 24,
  maxWidth: 600, width: '90%', maxHeight: '85vh', overflowY: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
}

const toastContainerStyle: React.CSSProperties = {
  position: 'fixed', top: 20, right: 20, zIndex: 2000,
  display: 'flex', flexDirection: 'column', gap: 8,
}

// ─── AI Config ────────────────────────────────────────────────────────────────
const compAIConfigGroups: AIConfigGroup[] = [
  {
    title: 'AI竞品追踪引擎',
    icon: <Eye size={16} />,
    params: [
      createParam('comp_crawl_freq', '竞品数据抓取频率', 15, '分钟', '通过API/爬虫抓取竞品广告数据(素材/出价/定向)的时间间隔', 10, 85, { min: 5, max: 60, step: 5, learningDataPoints: 42100, adjustHistory: [
        { time: '2小时前', from: '10', to: '15', reason: 'API限流告警, AI拉长抓取间隔避免被封禁' },
        { time: '2天前', from: '30', to: '10', reason: '完美日记大规模上新素材, AI加快抓取频率跟踪动态' },
      ] }),
      createParam('comp_identify_threshold', '竞品识别置信度阈值', 80, '%', 'NLP+视觉模型识别新竞品的最低置信度, 低于阈值的结果进入人工确认队列', 85, 88, { min: 60, max: 99, step: 5, learningDataPoints: 35800, adjustHistory: [
        { time: '昨日', from: '75', to: '80', reason: '误识别非竞品品牌浪费监控资源, AI上调阈值' },
        { time: '4天前', from: '85', to: '75', reason: '遗漏新入场竞品, AI降低阈值扩大识别范围' },
      ] }),
      createParam('comp_auto_discover', '新竞品自动发现', 'AI全自动', '', '自动发现并追踪新出现的竞品: 仅告警(通知人工), 自动追踪(加入监控列表), AI全自动(追踪+分析)', 'AI全自动', 83, { type: 'select', options: ['关闭', '仅告警', '自动追踪', 'AI全自动'], learningDataPoints: 28400, adjustHistory: [
        { time: '3天前', from: '自动追踪', to: 'AI全自动', reason: 'AI发现3个新竞品需要深度分析, 升级为全自动' },
        { time: '1周前', from: 'AI全自动', to: '自动追踪', reason: '误追踪非相关品牌浪费API额度, 降级为自动追踪' },
      ] }),
      createParam('creative_similarity_threshold', '素材相似度检测阈值', 70, '%', '竞品素材与我方素材的视觉/文案相似度超过此值触发侵权/抄袭预警', 75, 86, { min: 40, max: 95, step: 5, learningDataPoints: 31200, adjustHistory: [
        { time: '昨日', from: '65', to: '70', reason: '误报侵权过多影响运营, AI上调相似度阈值' },
        { time: '3天前', from: '80', to: '65', reason: '竞品抄袭我方素材未被检出, AI降低阈值增强检测' },
      ] }),
    ],
  },
  {
    title: '威胁评估模型',
    icon: <AlertTriangle size={16} />,
    params: [
      createParam('threat_score_alert', '威胁评分预警阈值', 70, '分', '综合威胁评分(投放量/增速/重叠受众/素材竞争力)超过此值触发预警', 65, 87, { min: 30, max: 90, step: 5, learningDataPoints: 38600, adjustHistory: [
        { time: '4小时前', from: '65', to: '70', reason: '预警过于频繁, AI上调阈值聚焦真正威胁' },
        { time: '3天前', from: '80', to: '65', reason: '花西子低调扩量未被预警, AI降低阈值' },
      ] }),
      createParam('market_share_alert', '市场份额变化预警', 5, '%', '我方市场份额(按广告Impression/Install计)变化超过此比例触发预警', 3, 84, { min: 1, max: 15, step: 1, learningDataPoints: 25300, adjustHistory: [
        { time: '昨日', from: '3', to: '5', reason: '自然波动频繁触发预警, AI放宽变化阈值' },
        { time: '5天前', from: '8', to: '3', reason: '市场份额连续下滑但未触发预警, AI收紧阈值' },
      ] }),
      createParam('comp_cpa_drop_alert', '竞品CPM下降预警', 10, '%', '竞品CPM显著下降意味着其投放效率提升, 需关注是否调整策略', 8, 82, { min: 3, max: 25, step: 1, learningDataPoints: 19700, adjustHistory: [
        { time: '2天前', from: '8', to: '10', reason: 'COLORKEY CPM正常波动范围较大, AI放宽预警线' },
        { time: '1周前', from: '15', to: '8', reason: 'COLORKEY CPM骤降20%但未预警, AI收紧阈值' },
      ] }),
      createParam('prediction_window', '预测模型时间窗口', 30, '天', '竞品趋势预测模型使用的历史数据时间范围, 越长越稳定但对近期变化不敏感', 14, 79, { min: 7, max: 90, step: 7, learningDataPoints: 12400, adjustHistory: [
        { time: '4天前', from: '14', to: '30', reason: '短期数据波动导致预测不稳定, AI延长时间窗口' },
        { time: '2周前', from: '60', to: '14', reason: '市场变化加快, AI缩短窗口提升预测时效性' },
      ] }),
    ],
  },
  {
    title: '策略响应',
    icon: <Zap size={16} />,
    params: [
      createParam('auto_bid_trigger', '自动出价调整触发', 'AI全自动', '', '检测到竞品出价变化时自动调整我方出价: 仅建议(推送建议), AI全自动(直接调整)', 'AI全自动', 81, { type: 'select', options: ['关闭', '仅建议', '半自动', 'AI全自动'], autoTuneEnabled: false, learningDataPoints: 22800, adjustHistory: [
        { time: '3天前', from: '半自动', to: 'AI全自动', reason: '手动确认延迟导致竞价失利, 手动升级为全自动' },
        { time: '2周前', from: 'AI全自动', to: '半自动', reason: 'AI过度反应竞品出价变化导致成本上升, 手动降级' },
      ] }),
      createParam('comp_creative_analysis', '竞品素材自动分析', 'AI深度分析', '', '自动分析竞品素材的卖点/Hook/风格/目标受众, 生成竞品素材报告', 'AI深度分析', 89, { type: 'select', options: ['关闭', '每日汇总', '实时分析', 'AI深度分析'], learningDataPoints: 46200, adjustHistory: [
        { time: '昨日', from: '实时分析', to: 'AI深度分析', reason: 'AI检测到竞品素材策略转型, 升级为深度分析' },
        { time: '4天前', from: 'AI深度分析', to: '实时分析', reason: '深度分析API成本过高, AI临时降级' },
      ] }),
      createParam('defense_budget_increase', '防御性预算自动增加', 20, '%', '竞品在我方核心受众加大投放时, AI自动增加防御性预算的比例上限', 15, 78, { min: 5, max: 50, step: 5, autoTuneEnabled: false, learningDataPoints: 11500, adjustHistory: [
        { time: '5天前', from: '15', to: '20', reason: 'COLORKEY大规模抢量导致我方曝光下降, 手动放宽防御预算上限' },
        { time: '3周前', from: '30', to: '15', reason: '防御性支出ROI偏低, 手动收紧预算增加上限' },
      ] }),
      createParam('diff_creative_auto_gen', '差异化素材自动生成', '半自动', '', '基于竞品素材分析自动生成差异化创意: 半自动(生成后人工审核), AI全自动(直接投放)', '半自动', 76, { type: 'select', options: ['关闭', '仅建议', '半自动', 'AI全自动'], learningDataPoints: 8900, adjustHistory: [
        { time: '1周前', from: '仅建议', to: '半自动', reason: 'AI生成的差异化素材CTR表现好, 升级为半自动' },
      ] }),
    ],
  },
  {
    title: '数据源与覆盖',
    icon: <Globe size={16} />,
    params: [
      createParam('monitor_platform_count', '监控平台数量', 5, '个', '同时监控的广告平台数(抖音巨量/小红书聚光/快手磁力/微信广告等)', 8, 90, { min: 1, max: 15, step: 1, autoTuneEnabled: false, learningDataPoints: 55200, adjustHistory: [
        { time: '3天前', from: '4', to: '5', reason: '新增微信广告监控覆盖, 手动增加平台数' },
        { time: '2周前', from: '6', to: '4', reason: 'API预算超支, 手动减少监控平台数' },
      ] }),
      createParam('region_coverage', '地区覆盖', 7, '个市场', '竞品监控覆盖的国内市场数量(华东/华南/华北/华中/西南等)', 7, 82, { min: 1, max: 10, step: 1, autoTuneEnabled: false, learningDataPoints: 28700, adjustHistory: [
        { time: '1周前', from: '5', to: '7', reason: '新增西南和东北市场监控, 手动扩展覆盖' },
      ] }),
      createParam('data_retention', '数据保留周期', 90, '天', '竞品历史数据的保留时间, 用于趋势分析和同比对比', 180, 85, { min: 30, max: 365, step: 30, autoTuneEnabled: false, learningDataPoints: 38400, adjustHistory: [
        { time: '2周前', from: '60', to: '90', reason: '需要更长历史数据做季度趋势分析, 手动延长保留周期' },
      ] }),
      createParam('api_budget_limit', 'API调用预算上限', 30000, '¥/月', '第三方竞品情报API(蝉妈妈/新榜/飞瓜数据)月度预算上限', 50000, 77, { min: 5000, max: 100000, step: 5000, autoTuneEnabled: false, learningDataPoints: 6200, adjustHistory: [
        { time: '本月初', from: '25000', to: '30000', reason: '新增飞瓜数据API接入, 手动增加API预算' },
        { time: '上月', from: '50000', to: '25000', reason: '季度预算缩减, 手动压缩API费用' },
      ] }),
    ],
  },
]

const compAILearningStatus: AILearningStatus = {
  modelVersion: 'v2.2.1-competitive',
  lastTraining: '4小时前',
  totalDataPoints: 95000,
  avgConfidence: 84,
  autoAdjustCount24h: 67,
  learningRate: '0.002 (AdamW)',
  nextTraining: '6小时后',
  improvementRate: '+9.8%',
}

// ─── Competitor detail data ────────────────────────────────────────────────────
interface CompetitorDetail {
  name: string; estSpend: string; activeCreatives: number
  adCopyAnalysis: string; creativeStrategy: string
  audienceOverlap: number; trend: 'gaining' | 'losing' | 'stable'
  counterStrategy: string
}

const competitorDetails: CompetitorDetail[] = [
  { name: '完美日记', estSpend: '¥820万/月', activeCreatives: 45, adCopyAnalysis: '主打唇釉推荐+彩妆教程题材，前3秒强钩子，情感共鸣BGM，抖音高频投放', creativeStrategy: '高频多素材，竖版短视频为主，抖音/小红书本地KOL植入', audienceOverlap: 68, trend: 'gaining', counterStrategy: 'AI建议：差异化角度切入，强化"眼妆教程+现代都市"题材，在小红书种草赛道避开正面竞争' },
  { name: '花西子', estSpend: '¥580万/月', activeCreatives: 32, adCopyAnalysis: '国风东方美学定位强，小红书种草内容质量高，成分讲解+对比测评风格为主', creativeStrategy: '精细化内容运营，小红书图文+抖音短视频并行，品牌故事深度内容', audienceOverlap: 42, trend: 'stable', counterStrategy: 'AI建议：强化平价彩妆赛道差异化，快速在快手和抖音直播填补花西子的价格空白' },
  { name: 'COLORKEY', estSpend: '¥320万/月', activeCreatives: 28, adCopyAnalysis: 'CPM持续下降，疑似采用新型出价模型，色号种草内容加速', creativeStrategy: '真实用户色号测评截图，显白对比聚合，抖音巨量信息流为主', audienceOverlap: 35, trend: 'gaining', counterStrategy: 'AI建议：监控其出价策略变化，在抖音口红色号关键词上提前布局防御性投放' },
  { name: 'UNNY', estSpend: '¥210万/月', activeCreatives: 18, adCopyAnalysis: 'KOL独家签约策略，日系清纯风格为主，护肤底妆一体化广告效果突出', creativeStrategy: '达人独占+长期合作，小红书聚光种草，深度品牌内容运营', audienceOverlap: 28, trend: 'stable', counterStrategy: 'AI建议：快速接触同类日系风格KOL，抢占护肤底妆一体化赛道，在华东华南市场加大投入' },
]

const overlayStyleComp: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.45)', zIndex: 1100,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CompetitiveMonitor() {
  const [tab, setTab] = useState<'overview' | 'tracking' | 'creative' | 'keywords' | 'alerts'>('overview')
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorDetail | null>(null)
  const [monitorCount] = useState(8)
  const [newAdsToday, setNewAdsToday] = useState(234)
  const [marketRank] = useState('#3 → #2')
  const [strategyAlerts, setStrategyAlerts] = useState(3)
  const [selectedAd, setSelectedAd] = useState<CompAd | null>(null)
  const [searchKw, setSearchKw] = useState('')
  const [platformFilter, setPlatformFilter] = useState('全部')
  const [compFilter, setCompFilter] = useState('全部')
  const [alertRuleList, setAlertRuleList] = useState(alertRules)
  const [showKpiModal, setShowKpiModal] = useState<string | null>(null)
  const [showTimelineDetail, setShowTimelineDetail] = useState<number | null>(null)
  const [showKeywordDetail, setShowKeywordDetail] = useState<Keyword | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)
  const [showNewAlertModal, setShowNewAlertModal] = useState(false)
  const [showCreativeDetail, setShowCreativeDetail] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [selectedCreativeTab, setSelectedCreativeTab] = useState<'analysis' | 'history' | 'recommend'>('analysis')
  useRegisterAIConfig(compAIConfigGroups, compAILearningStatus, '竞品监控')

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const simulateAction = useCallback((actionName: string, onDone?: () => void) => {
    setLoadingAction(actionName)
    setTimeout(() => { setLoadingAction(null); if (onDone) onDone() }, 1200)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      setNewAdsToday(c => c + Math.floor(Math.random() * 3))
      setStrategyAlerts(c => Math.max(0, c + (Math.random() > 0.8 ? 1 : 0)))
    }, 4000)
    return () => clearInterval(iv)
  }, [])

  const filteredAds = competitorAds.filter(ad => {
    if (platformFilter !== '全部' && ad.platform !== platformFilter) return false
    if (compFilter !== '全部' && ad.competitor !== compFilter) return false
    return true
  })

  const filteredKw = keywords.filter(kw => searchKw === '' || kw.keyword.includes(searchKw))

  const tabs = [
    { key: 'overview', label: '市场概览' },
    { key: 'tracking', label: '竞品广告追踪' },
    { key: 'creative', label: '创意趋势' },
    { key: 'keywords', label: '关键词竞争' },
    { key: 'alerts', label: '预警设置' },
  ]

  const toastBg = (type: Toast['type']) => type === 'success' ? '#059669' : type === 'info' ? '##e8365d' : type === 'warning' ? '#d97706' : '#dc2626'

  return (
    <>
      {/* ══ Competitor Detail Slide-over ══ */}
      {selectedCompetitor && (
        <div style={overlayStyleComp} onClick={() => setSelectedCompetitor(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 480, height: '100vh', background: 'var(--bg-card)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
            display: 'flex', flexDirection: 'column', gap: 18,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '##e8365d' }}>{selectedCompetitor.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>竞品详细分析</div>
              </div>
              <button onClick={() => setSelectedCompetitor(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Spend + creatives */}
            <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>投放规模</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: '预估月消耗', value: selectedCompetitor.estSpend, color: '#f59e0b' },
                  { label: '活跃素材数', value: `${selectedCompetitor.activeCreatives}套`, color: '##e8365d' },
                  { label: '受众重叠度', value: `${selectedCompetitor.audienceOverlap}%`, color: selectedCompetitor.audienceOverlap > 50 ? '#ef4444' : '#10b981' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', padding: '12px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>市场趋势</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: selectedCompetitor.trend === 'gaining' ? '#ef4444' : selectedCompetitor.trend === 'losing' ? '#10b981' : '#f59e0b' }}>
                  {selectedCompetitor.trend === 'gaining' ? '市场份额增长中' : selectedCompetitor.trend === 'losing' ? '市场份额下滑' : '市场份额稳定'}
                </span>
              </div>
            </div>

            {/* Ad copy analysis */}
            <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>广告文案分析</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '8px 10px' }}>{selectedCompetitor.adCopyAnalysis}</div>
            </div>

            {/* Creative strategy */}
            <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>创意投放策略</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '8px 10px' }}>{selectedCompetitor.creativeStrategy}</div>
            </div>

            {/* Audience overlap */}
            <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>与我方受众重叠</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>重叠度</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: selectedCompetitor.audienceOverlap > 50 ? '#ef4444' : '#10b981' }}>{selectedCompetitor.audienceOverlap}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${selectedCompetitor.audienceOverlap}%`, background: selectedCompetitor.audienceOverlap > 50 ? '#ef4444' : '##e8365d', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                {selectedCompetitor.audienceOverlap > 50 ? '高重叠 - 建议受众差异化定向' : '低重叠 - 可并行投放'}
              </div>
            </div>

            {/* AI counter-strategy */}
            <div style={{ background: 'rgba(232,54,93,0.08)', border: '1px solid rgba(232,54,93,0.2)', borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Brain size={15} color="##e8365d" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '##e8365d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI推荐反制策略</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedCompetitor.counterStrategy}</div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: '追踪竞品', primary: true },
                { label: '生成对标素材', primary: false },
                { label: '导出报告', primary: false },
              ].map(btn => (
                <button key={btn.label} onClick={() => { addToast(`${btn.label}: ${selectedCompetitor.name}`, 'success'); setSelectedCompetitor(null) }} style={{
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  border: btn.primary ? 'none' : '1px solid ##e8365d',
                  background: btn.primary ? '##e8365d' : 'transparent',
                  color: btn.primary ? '#fff' : '##e8365d',
                }}>{btn.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={toastContainerStyle}>
        {toasts.map(t => (
          <div key={t.id} style={{ padding: '12px 20px', borderRadius: 10, color: 'white', fontWeight: 600, fontSize: '0.85rem', background: toastBg(t.type), boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.type === 'success' && <Check size={16} />}{t.type === 'info' && <Info size={16} />}{t.type === 'warning' && <AlertTriangle size={16} />}{t.message}
          </div>
        ))}
      </div>

      {showKpiModal && (
        <div style={overlayStyle} onClick={() => setShowKpiModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '##e8365d', fontSize: '1.1rem' }}>
                {showKpiModal === 'monitors' ? '监控竞品详情' : showKpiModal === 'ads' ? '今日新增广告趋势' : showKpiModal === 'share' ? '市场份额变化趋势' : '策略变化预警详情'}
              </h3>
              <button onClick={() => setShowKpiModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={20} color="var(--text-muted)" /></button>
            </div>
            {showKpiModal === 'monitors' ? (
              <div>{competitors.map((c, i) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 6, background: i % 2 === 0 ? '#f5f3ff' : 'white', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => { setShowKpiModal(null); const det = competitorDetails[i]; if (det) setSelectedCompetitor(det); else addToast(`正在查看 ${c} 详细数据`, 'info') }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '##e8365d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{String.fromCharCode(65 + i)}</div>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>监控中 · 最近更新 {Math.floor(Math.random() * 30 + 5)}分钟前</div></div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}</div>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={kpiTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey={showKpiModal === 'ads' ? 'ads' : showKpiModal === 'share' ? 'share' : 'alerts'} stroke="##e8365d" fill="##e8365d" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 12, padding: '10px 14px', background: '#f5f3ff', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {showKpiModal === 'ads' && '近7天新增竞品广告持续上升，建议加强素材产出能力。'}
                  {showKpiModal === 'share' && '市场份额稳步增长至28.4%，距离第一名仅差4.3个百分点。'}
                  {showKpiModal === 'alerts' && '今日触发3条策略预警，涉及完美日记和COLORKEY的重大动态。'}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => { exportObjectsCsv('竞品监控报告', kpiTrendData.map(d => ({ 日期: d.day, 监控竞品数: d.monitors, 新增广告数: d.ads, 市场份额: d.share, 预警数: d.alerts }))); addToast('报告已导出到邮箱', 'success'); setShowKpiModal(null) }} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> 导出报告</button>
              <button onClick={() => setShowKpiModal(null)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '##e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {showTimelineDetail !== null && (() => { const item = competitorTimeline[showTimelineDetail]; return (
        <div style={overlayStyle} onClick={() => setShowTimelineDetail(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '##e8365d' }}>竞品动态详情</h3>
              <button onClick={() => setShowTimelineDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
            </div>
            <div style={{ padding: '14px', background: '#f5f3ff', borderRadius: 10, marginBottom: 16, borderLeft: '4px solid ##e8365d' }}>
              <div style={{ fontWeight: 700, color: '##e8365d', marginBottom: 4 }}>{item.company}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.event}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>{item.date}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '10px', background: '#fef3c7', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: '#92400e' }}>威胁等级</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#d97706' }}>{item.level === 'danger' ? '高' : item.level === 'warning' ? '中' : '低'}</div></div>
              <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>预计影响周期</div><div style={{ fontSize: '1.2rem', fontWeight: 700, color: '##e8365d' }}>{item.level === 'danger' ? '2-4周' : '1-2周'}</div></div>
            </div>
            <button onClick={() => { addToast('已创建应对任务', 'success'); setShowTimelineDetail(null) }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '##e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>创建应对任务</button>
          </div>
        </div>
      )})()}

      {showKeywordDetail && (
        <div style={overlayStyle} onClick={() => setShowKeywordDetail(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '##e8365d' }}>#{showKeywordDetail.keyword} 关键词详情</h3>
              <button onClick={() => setShowKeywordDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>月搜索量</div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: '##e8365d' }}>{showKeywordDetail.searchVol.toLocaleString()}</div></div>
              <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>我方排名</div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c9264e' }}>#{showKeywordDetail.ourRank}</div></div>
              <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CPC</div><div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9b1339' }}>{showKeywordDetail.cpc}</div></div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={kwTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis reversed tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[1, 6]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="ourRank" stroke="##e8365d" strokeWidth={2.5} name="我方排名" />
                <Line type="monotone" dataKey="compRank" stroke="#f97316" strokeWidth={2} strokeDasharray="5 3" name="竞品排名" />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f5f3ff', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>AI建议: {showKeywordDetail.suggestion}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { addToast(`已为 #${showKeywordDetail.keyword} 创建优化任务`, 'success'); setShowKeywordDetail(null) }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '##e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>执行建议</button>
            </div>
          </div>
        </div>
      )}

      {showCreativeDetail !== null && (
        <div style={overlayStyle} onClick={() => setShowCreativeDetail(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '##e8365d' }}>{creativeElements[showCreativeDetail].element} 详情</h3>
              <button onClick={() => setShowCreativeDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
            </div>
            <div className="tabs" style={{ marginBottom: 16 }}>
              {([['analysis', '效果分析'], ['history', '使用历史'], ['recommend', '优化建议']] as const).map(([k, l]) => (
                <button key={k} className={`tab ${selectedCreativeTab === k ? 'active' : ''}`} onClick={() => setSelectedCreativeTab(k)}>{l}</button>
              ))}
            </div>
            {selectedCreativeTab === 'analysis' && (<div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: '12px', background: '#f5f3ff', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>行业使用频率</div><div style={{ fontSize: '1.3rem', fontWeight: 700, color: '##e8365d' }}>{creativeElements[showCreativeDetail].frequency}</div></div>
                <div style={{ padding: '12px', background: '#f5f3ff', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>平均CTR提升</div><div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c9264e' }}>{creativeElements[showCreativeDetail].avgCtr}</div></div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={kpiTrendData.map((d, i) => ({ ...d, usage: 50 + i * 4 + Math.random() * 10 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} /><YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} /><Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="usage" stroke="##e8365d" fill="##e8365d" fillOpacity={0.15} name="使用率%" />
                </AreaChart>
              </ResponsiveContainer>
            </div>)}
            {selectedCreativeTab === 'history' && (<div>{['完美日记 - 抖音巨量 (04/02)', '花西子 - 小红书聚光 (04/01)', '完美日记 - 微信广告 (03/31)', 'COLORKEY - 抖音巨量 (03/30)'].map((item, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 6, background: i % 2 === 0 ? '#f5f3ff' : 'white', border: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item}</div>
            ))}</div>)}
            {selectedCreativeTab === 'recommend' && (<div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}><p>基于AI分析，建议：</p><ul style={{ paddingLeft: 20 }}><li>将该元素与当前热门话题结合</li><li>在华南/华东市场加大使用比例</li><li>结合短视频平台算法偏好调整</li></ul></div>)}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { addToast('已加入素材库优化队列', 'success'); setShowCreativeDetail(null) }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '##e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>应用建议</button>
            </div>
          </div>
        </div>
      )}

      {showNewAlertModal && (
        <div style={overlayStyle} onClick={() => setShowNewAlertModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '##e8365d' }}>新建预警规则</h3>
              <button onClick={() => setShowNewAlertModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
            </div>
            <div style={{ marginBottom: 14 }}><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>规则名称</div><input type="text" placeholder="输入规则名称..." style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.85rem' }} /></div>
            <div style={{ marginBottom: 14 }}><div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>触发条件</div><input type="text" placeholder="描述触发条件..." style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.85rem' }} /></div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowNewAlertModal(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.82rem' }}>取消</button>
              <button onClick={() => { simulateAction('createAlert', () => { setAlertRuleList(prev => [...prev, { id: `CA00${prev.length + 1}`, name: '新建规则', condition: '自定义条件', enabled: true, lastTriggered: '未触发' }]); addToast('预警规则创建成功', 'success'); setShowNewAlertModal(false) }) }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '##e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, opacity: loadingAction === 'createAlert' ? 0.7 : 1 }}>
                {loadingAction === 'createAlert' ? '创建中...' : '确认创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div style={overlayStyle} onClick={() => setShowConfirmDialog(null)}>
          <div style={{ ...modalStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><AlertTriangle size={22} color="#d97706" /><h3 style={{ margin: 0, fontSize: '1rem' }}>{showConfirmDialog.title}</h3></div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>{showConfirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowConfirmDialog(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.82rem' }}>取消</button>
              <button onClick={() => { showConfirmDialog.onConfirm(); setShowConfirmDialog(null) }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>确认</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h2 style={{ margin: 0 }}>竞品监控</h2>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(232,54,93,0.1)', color: '##e8365d', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(232,54,93,0.25)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '##e8365d', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />AI实时侦测中
          </span>
        </div>
        <p>AI竞品追踪智能体 · 广告策略侦测 · 市场份额分析 · 创意趋势洞察</p>
      </div>

      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="CompetitorIntel-NLP" color="#8b5cf6" />
          <ModelBadge name="UGCQuality-Ranker" color="#ec4899" />
          <ModelBadge name="TrendRadar-TS" color="#ec4899" />
          <ModelBadge name="SentimentAnalyzer" color="#8b5cf6" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { key: 'monitors', title: '监控竞品数', value: monitorCount, sub: competitors.slice(0, 3).join(' · ') + '...', color: '##e8365d' },
            { key: 'ads', title: '今日新增竞品广告', value: newAdsToday, sub: '实时追踪，较昨日 +34', color: '#ff7a95' },
            { key: 'share', title: '市场份额排名', value: marketRank, sub: '占市场份额 28.4% ↑2.1%', color: '#ff7a95' },
            { key: 'alerts', title: '竞品策略变化预警', value: strategyAlerts, sub: '需立即关注', color: '##e8365d' },
          ].map(kpi => (
            <div key={kpi.key} className="card" style={{ borderTop: `3px solid ${kpi.color}`, cursor: 'pointer', transition: 'transform 0.15s' }}
              onClick={() => setShowKpiModal(kpi.key)}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div className="card-title">{kpi.title}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {kpi.value}{kpi.key === 'share' && <TrendingUp size={20} color="##e8365d" />}
              </div>
              <div style={{ fontSize: '0.75rem', color: kpi.key === 'ads' ? '#059669' : kpi.color, marginTop: 4, fontWeight: kpi.key === 'ads' ? 400 : 600 }}>{kpi.sub}</div>
              <div style={{ fontSize: '0.68rem', color: '##e8365d', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> 点击查看详情</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          {tabs.map(t => (<button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key as typeof tab)}>{t.label}</button>))}
        </div>

        {tab === 'overview' && (<>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="card-title">各竞品月度广告消耗对比（万元）</div>
              <button onClick={() => addToast('图表数据已刷新', 'info')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}><RefreshCw size={12} /> 刷新</button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySpendData} barCategoryGap="20%"><XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} /><YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Bar dataKey="玛丽黛佳" fill="##e8365d" radius={[3,3,0,0]} /><Bar dataKey="完美日记" fill="#6366f1" radius={[3,3,0,0]} /><Bar dataKey="花西子" fill="#ff7a95" radius={[3,3,0,0]} /><Bar dataKey="COLORKEY" fill="#c084fc" radius={[3,3,0,0]} /><Bar dataKey="UNNY" fill="#ddd6fe" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>市场份额分布</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart><Pie data={marketShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={2} label={({ name, value }) => `${name} ${value}%`} style={{ cursor: 'pointer' }}
                  onClick={(_, index) => addToast(`${marketShareData[index].name}: 市场份额 ${marketShareData[index].value}%`, 'info')}>
                  {marketShareData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, '市场份额']} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>竞品动态（近7日）</div>
              {competitorTimeline.map((item, i) => { const Icon = item.icon; const color = item.level === 'danger' ? '##e8365d' : item.level === 'warning' ? '#f97316' : '#ff7a95'; return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < competitorTimeline.length - 1 ? '1px solid var(--border-light)' : 'none', alignItems: 'flex-start', cursor: 'pointer' }}
                  onClick={() => setShowTimelineDetail(i)}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}><Icon size={13} color={color} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}><span style={{ fontSize: '0.72rem', fontWeight: 700, color, background: `${color}12`, padding: '1px 7px', borderRadius: 10 }}>{item.company}</span><span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.date}</span></div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.event}</p>
                  </div>
                  <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 6 }} />
                </div>
              )})}
            </div>
          </div>
        </>)}

        {tab === 'tracking' && (
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Filter size={14} color="var(--text-muted)" /><span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>平台：</span>
                  {['全部', '抖音巨量', '小红书聚光', '快手磁力', '微信广告'].map(p => (
                    <button key={p} onClick={() => setPlatformFilter(p)} style={{ padding: '3px 10px', borderRadius: 14, fontSize: '0.75rem', fontWeight: 500, border: platformFilter === p ? '1px solid #e8365d' : '1px solid var(--border)', background: platformFilter === p ? 'rgba(232,54,93,0.08)' : 'white', color: platformFilter === p ? 'var(--rose-700)' : 'var(--text-secondary)', cursor: 'pointer' }}>{p}</button>
                  ))}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>竞品：</span>
                  {['全部', '完美日记', '花西子', 'COLORKEY', 'UNNY'].map(c => (
                    <button key={c} onClick={() => setCompFilter(c)} style={{ padding: '3px 10px', borderRadius: 14, fontSize: '0.75rem', fontWeight: 500, border: compFilter === c ? '1px solid #e8365d' : '1px solid var(--border)', background: compFilter === c ? 'rgba(232,54,93,0.08)' : 'white', color: compFilter === c ? 'var(--rose-700)' : 'var(--text-secondary)', cursor: 'pointer' }}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>共 {filteredAds.length} 条广告</span>
                  <button onClick={() => { exportObjectsCsv('竞品广告数据', filteredAds.map(ad => ({ 竞品: ad.competitor, 平台: ad.platform, 素材类型: ad.type, 首次发现: ad.firstSeen, 投放市场: ad.market, 估算消耗: ad.estSpend, 创意特征: ad.creative, 效果预估: ad.perfEst }))); addToast('广告数据已导出', 'success') }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} /> 导出</button>
                </div>
                <table className="data-table"><thead><tr><th>竞品</th><th>平台</th><th>素材类型</th><th>首次发现</th><th>投放市场</th><th>估算消耗</th><th>创意特征</th><th>效果预估</th></tr></thead>
                  <tbody>{filteredAds.map((ad, i) => (
                    <tr key={i} onClick={() => setSelectedAd(ad)} style={{ cursor: 'pointer' }}>
                      <td><span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--rose-700)' }}>{ad.competitor}</span></td>
                      <td><span style={{ fontSize: '0.78rem', padding: '2px 7px', borderRadius: 10, background: 'var(--rose-50)', color: 'var(--rose-700)', border: '1px solid var(--rose-200)' }}>{ad.platform}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{ad.type}</td><td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{ad.firstSeen}</td><td style={{ fontSize: '0.78rem' }}>{ad.market}</td>
                      <td style={{ fontWeight: 600, color: '##e8365d', fontSize: '0.82rem' }}>{ad.estSpend}</td>
                      <td style={{ maxWidth: 160, fontSize: '0.77rem', color: 'var(--text-secondary)' }}>{ad.creative.length > 40 ? ad.creative.slice(0, 40) + '...' : ad.creative}</td>
                      <td style={{ fontSize: '0.77rem', color: '#ff7a95', fontFamily: 'monospace' }}>{ad.perfEst}</td>
                    </tr>
                  ))}</tbody></table>
              </div>
            </div>
            {selectedAd && (
              <div style={{ width: 300, flexShrink: 0 }}>
                <div className="card" style={{ position: 'sticky', top: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>竞品素材分析</span>
                    <button onClick={() => setSelectedAd(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>x</button>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--rose-50)', border: '1px solid var(--rose-200)', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>分析对象</div>
                    <div style={{ fontWeight: 700, color: 'var(--rose-700)' }}>{selectedAd.competitor}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{selectedAd.platform} · {selectedAd.type}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px 0', marginBottom: 12 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f97316' }}>{selectedAdDetail.score}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI威胁评分 (0-100)</div>
                    <div className="progress-bar" style={{ marginTop: 6 }}><div className="progress-bar-fill" style={{ width: `${selectedAdDetail.score}%`, background: 'linear-gradient(90deg, #f97316, ##e8365d)' }} /></div>
                  </div>
                  {selectedAdDetail.hooks.map((h, i) => (<div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6, cursor: 'pointer' }} onClick={() => addToast(`策略: ${h}`, 'info')}><ChevronRight size={14} color="#e8365d" style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{h}</span></div>))}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                    {selectedAdDetail.triggers.map((t, i) => (<span key={i} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 12, background: 'rgba(232,54,93,0.1)', color: '##e8365d', border: '1px solid rgba(232,54,93,0.2)', cursor: 'pointer' }} onClick={() => addToast(`触发器: ${t}`, 'info')}>{t}</span>))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button onClick={() => addToast('分析报告已发送', 'success')} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><ExternalLink size={12} /> 分享</button>
                    <button onClick={() => simulateAction('counter', () => addToast('已生成反制策略方案', 'success'))} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '##e8365d', color: 'white', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, opacity: loadingAction === 'counter' ? 0.7 : 1 }}>{loadingAction === 'counter' ? '生成中...' : '生成反制策略'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'creative' && (<>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>行业热门创意标签趋势（近30天）</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={creativeTrendData}><XAxis dataKey="day" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={4} /><YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                  {['唇釉推荐', '眼妆教程', '对比测评', '美妆内容', '开箱视频', '变美挑战'].map((key, i) => (<Line key={key} type="monotone" dataKey={key} stroke={lineColors[i]} strokeWidth={2} dot={false} />))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>AI洞察 · 趋势预判</div>
              {[
                { tag: '美妆内容', change: '+124%', insight: '受《凡人美妆内容传》IP爆火带动，建议抢先布局', level: 'hot' },
                { tag: '对比测评反转', change: '+67%', insight: '完播率高出行业42%', level: 'rising' },
                { tag: '唇釉推荐', change: '+12%', insight: '已进入成熟期，建议差异化突围', level: 'stable' },
                { tag: '开箱视频', change: '-18%', insight: '部分平台收紧审核，建议暂缓', level: 'declining' },
              ].map((item, i) => { const lc = item.level === 'hot' ? '##e8365d' : item.level === 'rising' ? '#f97316' : item.level === 'stable' ? '##e8365d' : '#9b8cb8'; return (
                <div key={i} style={{ padding: '12px', borderRadius: 10, background: `${lc}08`, border: `1px solid ${lc}25`, cursor: 'pointer', marginBottom: 10 }}
                  onClick={() => addToast(`已将 #${item.tag} 添加到关注列表`, 'success')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><span style={{ fontWeight: 700, fontSize: '0.88rem', color: lc }}>#{item.tag}</span><span style={{ fontSize: '0.75rem', fontWeight: 700, color: lc }}>{item.change}</span></div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.insight}</p>
                </div>
              )})}
            </div>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>热门素材特征排行</div>
            <table className="data-table"><thead><tr><th>#</th><th>创意特征元素</th><th>行业使用频率</th><th>平均CTR提升</th><th>我方使用率</th><th>趋势</th><th>建议</th></tr></thead>
              <tbody>{creativeElements.map((el, i) => (
                <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setShowCreativeDetail(i)}>
                  <td style={{ fontWeight: 700, color: i < 3 ? '#f97316' : 'var(--text-muted)', fontSize: '0.9rem' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{el.element}</td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="progress-bar" style={{ width: 80 }}><div className="progress-bar-fill" style={{ width: el.frequency, background: 'var(--gradient-1)' }} /></div><span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{el.frequency}</span></div></td>
                  <td style={{ fontWeight: 700, color: '##e8365d' }}>{el.avgCtr}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{Math.floor(parseInt(el.frequency) * 0.7)}%</td>
                  <td>{el.trend === 'up' ? <span style={{ color: '##e8365d', display: 'flex', alignItems: 'center', gap: 3 }}><TrendingUp size={13} /> 上升</span> : el.trend === 'stable' ? <span style={{ color: 'var(--text-muted)' }}>-- 稳定</span> : <span style={{ color: '##e8365d', display: 'flex', alignItems: 'center', gap: 3 }}><TrendingDown size={13} /> 下降</span>}</td>
                  <td style={{ fontSize: '0.75rem', color: '##e8365d' }}>{el.trend === 'up' ? '加大使用' : el.trend === 'stable' ? '维持现有' : '考虑减少'}</td>
                </tr>
              ))}</tbody></table>
          </div>
        </>)}

        {tab === 'keywords' && (<>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 12 }}>TOP10关键词搜索量</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={keywordChartData} layout="vertical"><XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} /><YAxis dataKey="kw" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} /><Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toLocaleString()}`, '搜索量']} />
                <Bar dataKey="vol" fill="##e8365d" radius={[0,4,4,0]} style={{ cursor: 'pointer' }} onClick={(data) => { const kw = keywords.find(k => k.keyword === (data as any).kw); if (kw) setShowKeywordDetail(kw) }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ position: 'relative', flex: 1 }}><Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} /><input type="text" value={searchKw} onChange={e => setSearchKw(e.target.value)} placeholder="搜索关键词..." style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }} /></div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>共 {filteredKw.length} 个关键词</span>
              <button onClick={() => { exportObjectsCsv('关键词报告', filteredKw.map(kw => ({ 关键词: kw.keyword, 搜索量: kw.searchVol, 竞争度: kw.competition, 我方排名: kw.ourRank, 竞品排名: kw.compRank, CPC: kw.cpc, 建议操作: kw.suggestion }))); addToast('关键词报告已导出', 'success') }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} /> 导出</button>
            </div>
            <table className="data-table"><thead><tr><th>关键词</th><th>搜索量</th><th>竞争度</th><th>我方排名</th><th>竞品排名</th><th>CPC</th><th>建议操作</th></tr></thead>
              <tbody>{filteredKw.map((kw, i) => { const rankColor = kw.ourRank === 1 ? '##e8365d' : kw.ourRank <= 3 ? '#ff7a95' : kw.ourRank <= 5 ? '#ff7a95' : '#9b8cb8'; const compColor = kw.competition === '极高' ? '##e8365d' : kw.competition === '高' ? '#f97316' : '##e8365d'; return (
                <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setShowKeywordDetail(kw)}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{kw.keyword}</td><td style={{ fontWeight: 600 }}>{kw.searchVol.toLocaleString()}</td>
                  <td><span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10, background: `${compColor}15`, color: compColor, fontWeight: 600 }}>{kw.competition}</span></td>
                  <td><span style={{ fontSize: '1rem', fontWeight: 800, color: rankColor }}>#{kw.ourRank}</span></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{kw.compRank}</td><td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{kw.cpc}</td>
                  <td><span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 10, fontWeight: 600, background: kw.ourRank === 1 ? 'rgba(232,54,93,0.1)' : 'rgba(249,115,22,0.1)', color: kw.ourRank === 1 ? '##e8365d' : '#c2410c' }}>{kw.suggestion}</span></td>
                </tr>
              )})}</tbody></table>
          </div>
        </>)}

        {tab === 'alerts' && (<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>配置竞品动向预警规则，AI智能体将实时监控并推送告警</p>
            <button onClick={() => setShowNewAlertModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--gradient-1)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}><Bell size={14} /> 新建预警规则</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alertRuleList.map((rule, i) => (
              <div key={rule.id} className="card" style={{ borderLeft: `4px solid ${rule.enabled ? '##e8365d' : '#d1d5db'}`, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: rule.enabled ? 'rgba(232,54,93,0.08)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => addToast(`查看 ${rule.name} 历史记录`, 'info')}><AlertTriangle size={18} color={rule.enabled ? '#e8365d' : '#9ca3af'} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => addToast(`${rule.id}: ${rule.condition}`, 'info')}>{rule.name}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rule.id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>触发条件：<strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{rule.condition}</strong></span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>最近触发：{rule.lastTriggered}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <button onClick={() => setShowConfirmDialog({ title: '删除预警规则', message: `确定要删除 "${rule.name}" 吗？`, onConfirm: () => { setAlertRuleList(prev => prev.filter((_, ri) => ri !== i)); addToast(`已删除: ${rule.name}`, 'warning') } })} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff1f2', color: '#dc2626', fontSize: '0.72rem', cursor: 'pointer' }}>删除</button>
                    <div onClick={() => { setAlertRuleList(prev => prev.map((r, ri) => ri === i ? { ...r, enabled: !r.enabled } : r)); addToast(`${rule.name} 已${rule.enabled ? '禁用' : '启用'}`, rule.enabled ? 'warning' : 'success') }}
                      style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: rule.enabled ? '##e8365d' : '#d1d5db', position: 'relative', transition: 'background 0.2s' }}>
                      <div style={{ position: 'absolute', top: 3, left: rule.enabled ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: rule.enabled ? '#e8365d' : 'var(--text-muted)', minWidth: 36 }}>{rule.enabled ? '启用' : '禁用'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '16px 20px', borderRadius: 12, background: 'var(--rose-50)', border: '1px solid var(--rose-200)' }}>
            <div style={{ display: 'flex', gap: 10 }}><Activity size={16} color="#e8365d" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--rose-700)', marginBottom: 4 }}>竞品监控智能体运行状态</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>AI竞品追踪智能体正在实时监控 <strong>8家</strong> 竞品，每 <strong>15分钟</strong> 抓取一次广告数据。</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose-700)', fontWeight: 600, cursor: 'pointer' }} onClick={() => addToast('今日数据抓取详情已打开', 'info')}>今日抓取: 8,234条</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose-700)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setTab('tracking'); addToast('已跳转到广告追踪', 'info') }}>新广告: {newAdsToday}条</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--rose-700)', fontWeight: 600, cursor: 'pointer' }} onClick={() => addToast(`今日触发 ${strategyAlerts} 条预警`, 'info')}>预警: {strategyAlerts}次</span>
                </div>
              </div>
            </div>
          </div>
        </>)}

      </div>
    </>
  )
}
