import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageCircle, TrendingUp, AlertTriangle, Bot,
  Search, Filter, ThumbsUp, ThumbsDown, Minus,
  Clock, Eye, Reply, Flag, XCircle, CheckCircle,
  Shield, Bell, ChevronRight, RefreshCw, Brain,
  Hash, Zap, Star, MessageSquare, Send
} from 'lucide-react'
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  BarChart, Bar
} from 'recharts'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Comment {
  id: number
  user: string
  platform: string
  time: string
  content: string
  sentiment: '正面' | '中性' | '负面'
  product: string
  status: '未处理' | '已回复' | '已忽略'
}

interface Alert {
  id: number
  level: '严重' | '警告' | '提示'
  title: string
  source: string
  comment: string
  time: string
  status: '已处理' | '处理中' | '未处理'
}

interface Template {
  id: number
  name: string
  scene: string
  useCount: number
  satisfaction: number
  enabled: boolean
}

// ─── Static Data ───────────────────────────────────────────────────────────────
const sentimentPieData = [
  { name: '正面', value: 76.4, color: '#22c55e' },
  { name: '中性', value: 18.2, color: '#94a3b8' },
  { name: '负面', value: 5.4, color: '#ef4444' },
]

const trendData7d = [
  { day: '3/30', 正面: 5820, 中性: 1340, 负面: 380 },
  { day: '3/31', 正面: 6100, 中性: 1420, 负面: 410 },
  { day: '4/1', 正面: 6540, 中性: 1510, 负面: 450 },
  { day: '4/2', 正面: 6280, 中性: 1380, 负面: 520 },
  { day: '4/3', 正面: 6890, 中性: 1600, 负面: 390 },
  { day: '4/4', 正面: 7120, 中性: 1480, 负面: 460 },
  { day: '4/5', 正面: 6594, 中性: 1570, 负面: 478 },
]

const hotKeywords = [
  { word: '持久', freq: 892, sentiment: 'positive' },
  { word: '显色', freq: 756, sentiment: 'positive' },
  { word: '好用', freq: 680, sentiment: 'positive' },
  { word: '性价比', freq: 624, sentiment: 'positive' },
  { word: '不卡粉', freq: 578, sentiment: 'positive' },
  { word: '滋润', freq: 512, sentiment: 'positive' },
  { word: '包装好看', freq: 468, sentiment: 'positive' },
  { word: '颜色正', freq: 420, sentiment: 'positive' },
  { word: '味道好闻', freq: 380, sentiment: 'positive' },
  { word: '回购', freq: 345, sentiment: 'positive' },
  { word: '过敏', freq: 286, sentiment: 'negative' },
  { word: '假滑', freq: 224, sentiment: 'negative' },
  { word: '色差', freq: 198, sentiment: 'negative' },
]

const hotTopics = [
  { title: '春季新品唇釉色号测评', comments: 2340, sentiment: '正面', sentimentRate: 89, trend: '+12%' },
  { title: '粉底液持妆效果讨论', comments: 1860, sentiment: '正面', sentimentRate: 72, trend: '+5%' },
  { title: '眼影盘配色争议', comments: 1420, sentiment: '中性', sentimentRate: 58, trend: '-3%' },
]

const commentList: Comment[] = [
  { id: 1, user: '小仙女爱美妆', platform: '小红书', time: '10分钟前', content: '这款唇釉真的太绝了，颜色超正，涂上去显白好几个度，而且持久力很强，喝水吃饭都不掉色！', sentiment: '正面', product: '丝绒唇釉 #205', status: '已回复' },
  { id: 2, user: '美妆达人Lily', platform: '抖音', time: '25分钟前', content: '用了两天就过敏了，嘴巴周围起了一圈小红疹，敏感肌真的要慎入！', sentiment: '负面', product: '丝绒唇釉 #208', status: '未处理' },
  { id: 3, user: '素颜也好看', platform: '天猫', time: '32分钟前', content: '粉底液遮瑕力一般，痘印完全盖不住，不过妆感倒是挺自然的', sentiment: '中性', product: '轻薄粉底液', status: '未处理' },
  { id: 4, user: '回购狂魔', platform: '京东', time: '45分钟前', content: '回购第三支了，真的是我用过最好的眉笔，画出来很自然，不会结块', sentiment: '正面', product: '细芯眉笔 #03', status: '已回复' },
  { id: 5, user: '化妆小白', platform: '快手', time: '1小时前', content: '眼影盘颜色和图片有色差，实物没那么好看，有点失望', sentiment: '负面', product: '十二色眼影盘', status: '未处理' },
  { id: 6, user: '精致girl', platform: '小红书', time: '1小时前', content: '散粉控油效果还行吧，中规中矩的，没有特别惊艳也不算差', sentiment: '中性', product: '控油散粉', status: '已忽略' },
  { id: 7, user: '买买买不停', platform: '抖音', time: '2小时前', content: '腮红颜色太好看了！粉质细腻不飞粉，上脸自然，性价比超高', sentiment: '正面', product: '花瓣腮红 #01', status: '已回复' },
  { id: 8, user: '学生党平价', platform: '天猫', time: '2小时前', content: '睫毛膏刷头设计不太好，容易刷成苍蝇腿，而且不太好卸', sentiment: '负面', product: '纤长睫毛膏', status: '处理中' as Comment['status'] },
  { id: 9, user: 'beautyqueen_jp', platform: 'TikTok JP', time: '3小时前', content: 'This lip tint is absolutely gorgeous! The color is so vibrant and it stays on all day even after eating. 10/10 would repurchase!', sentiment: '正面', product: 'Velvet Lip Tint #205', status: '已回复' },
  { id: 10, user: 'makeupstudio_us', platform: 'Instagram', time: '4小时前', content: 'I was really excited about this foundation but it oxidized on my skin within 2 hours. The shade looked great initially but turned orange. Very disappointed.', sentiment: '负面', product: 'Skin-Fit Foundation', status: '未处理' },
  { id: 11, user: 'skincare_sg', platform: 'TikTok SEA', time: '5小时前', content: 'Average product, nothing special. The eyeshadow palette has decent pigmentation but fallout is quite heavy. Not sure if I would buy again.', sentiment: '中性', product: 'Eye Shadow Star Galaxy', status: '未处理' },
  { id: 12, user: 'lipstickaddict_uk', platform: 'TikTok EU', time: '6小时前', content: "Love the packaging and formula! But I'm concerned about the ingredient list - I found a potential allergen that's not prominently disclosed. Please improve your EU labeling.", sentiment: '中性', product: 'Velvet Lip Tint #208', status: '处理中' as Comment['status'] },
]

const alertList: Alert[] = [
  { id: 1, level: '严重', title: '过敏投诉集中爆发', source: '小红书', comment: '多位用户反馈唇釉#208导致过敏，24小时内新增18条投诉', time: '15分钟前', status: '处理中' },
  { id: 2, level: '严重', title: '小红书负面笔记传播中', source: '小红书', comment: '一篇关于粉底液假滑的笔记获赞2.3万，评论区负面情绪扩散', time: '30分钟前', status: '未处理' },
  { id: 3, level: '警告', title: '天猫差评增速异常', source: '天猫', comment: '眼影盘近3天差评率从1.2%升至3.8%，主要集中在色差问题', time: '1小时前', status: '已处理' },
  { id: 4, level: '警告', title: '抖音负面视频热度上升', source: '抖音', comment: 'KOL发布的吐槽视频播放量突破50万，评论区引发跟风', time: '2小时前', status: '已处理' },
  { id: 5, level: '提示', title: '京东物流投诉增加', source: '京东', comment: '近期物流延迟导致的投诉增加32%，影响整体评分', time: '3小时前', status: '已处理' },
  { id: 6, level: '提示', title: '快手用户反馈包装破损', source: '快手', comment: '3条关于快递包装破损导致产品受损的评论', time: '4小时前', status: '已处理' },
  { id: 7, level: '警告', title: 'Instagram负面帖子传播中', source: 'Instagram', comment: '美区用户发布粉底液氧化变色测评，获赞1.4万，评论区英语负面情绪持续扩散', time: '2小时前', status: '未处理' },
  { id: 8, level: '提示', title: 'TikTok EU成分合规质疑', source: 'TikTok EU', comment: 'EU用户质疑产品成分标注不符合欧盟规范，涉及3款产品，需确认INCI标签合规性', time: '3小时前', status: '处理中' },
  { id: 9, level: '提示', title: 'TikTok JP好评爆发', source: 'TikTok JP', comment: '日本区唇釉产品收到大量正面评价，#VelvetLipTint话题标签播放量突破200万', time: '4小时前', status: '已处理' },
]

const platformNegativeData = [
  { platform: '小红书', count: 42 },
  { platform: '抖音', count: 35 },
  { platform: '天猫', count: 28 },
  { platform: '京东', count: 18 },
  { platform: '快手', count: 12 },
  { platform: 'Instagram', count: 28 },
  { platform: 'TikTok海外', count: 22 },
]

const templateList: Template[] = [
  { id: 1, name: '好评感谢模板', scene: '正面评论自动回复', useCount: 12680, satisfaction: 95.2, enabled: true },
  { id: 2, name: '物流咨询模板', scene: '物流时效/快递查询', useCount: 4320, satisfaction: 88.6, enabled: true },
  { id: 3, name: '过敏安抚模板', scene: '过敏投诉回复', useCount: 860, satisfaction: 82.4, enabled: true },
  { id: 4, name: '色差解释模板', scene: '产品色差反馈', useCount: 1240, satisfaction: 79.8, enabled: true },
  { id: 5, name: '退换货指引模板', scene: '退换货流程说明', useCount: 2180, satisfaction: 91.0, enabled: true },
  { id: 6, name: '复购优惠模板', scene: '老客户复购引导', useCount: 3220, satisfaction: 93.6, enabled: false },
]

const replyTypePieData = [
  { name: 'AI自动', value: 45, color: '#e8365d' },
  { name: '模板回复', value: 35, color: '#ff7a95' },
  { name: '人工回复', value: 20, color: '#94a3b8' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ─── AI Config ─────────────────────────────────────────────────────────────────
const sentimentAIConfigGroups: AIConfigGroup[] = [
  {
    title: '情感分析配置',
    icon: <Brain size={16} />,
    params: [
      createParam('sentiment_sensitivity', '情感分析灵敏度', 75, '%', '情感分析模型对语义色彩的敏感程度，越高越容易捕捉微妙情感', 80, 89, { min: 50, max: 99, step: 1, learningDataPoints: 48200, adjustHistory: [
        { time: '2小时前', from: '72', to: '75', reason: 'AI发现部分中性评论含有隐性负面情绪，上调灵敏度' },
        { time: '2天前', from: '80', to: '72', reason: '正面评论被误判为中性比例过高，下调灵敏度' },
      ] }),
      createParam('negative_threshold', '负面预警阈值', 5, '条/小时', '每小时负面评论数达到此阈值时触发预警通知', 3, 86, { min: 1, max: 20, step: 1, learningDataPoints: 32400, adjustHistory: [
        { time: '昨日', from: '8', to: '5', reason: '漏报一次负面舆情事件，AI降低预警阈值提高灵敏度' },
        { time: '5天前', from: '3', to: '8', reason: '预警过多影响处理效率，AI上调阈值减少误报' },
      ] }),
      createParam('keyword_monitor', '敏感词监控数', 156, '个', '当前监控的敏感关键词总数，包括产品问题、竞品提及等', 180, 82, { min: 50, max: 500, step: 1, learningDataPoints: 28600, adjustHistory: [
        { time: '3天前', from: '142', to: '156', reason: 'AI自动新增14个与过敏相关的敏感词' },
      ] }),
      createParam('analysis_depth', '分析深度', '语义级', '', '情感分析的深度级别：关键词级(快速匹配)、语义级(上下文理解)、意图级(用户真实意图推断)', '意图级', 84, { type: 'select', options: ['关键词级', '语义级', '意图级'], learningDataPoints: 41000, adjustHistory: [
        { time: '1周前', from: '关键词级', to: '语义级', reason: '关键词级漏判反讽/隐喻类评论，AI升级为语义级分析' },
      ] }),
    ],
  },
  {
    title: '自动回复策略',
    icon: <Bot size={16} />,
    params: [
      createParam('auto_reply_mode', '自动回复模式', 'AI生成+人工审核', '', '回复生成方式：纯模板(固定话术)、AI生成(智能生成)、AI生成+人工审核(安全优先)', 'AI生成', 87, { type: 'select', options: ['纯模板', 'AI生成', 'AI生成+人工审核'], learningDataPoints: 38200, adjustHistory: [
        { time: '3天前', from: 'AI生成', to: 'AI生成+人工审核', reason: '自动回复出现一次措辞不当投诉，AI切换为人工审核模式' },
      ] }),
      createParam('reply_speed', '回复响应时效', 5, '分钟', '从评论发布到系统自动回复的目标响应时间', 3, 88, { min: 1, max: 30, step: 1, learningDataPoints: 35800, adjustHistory: [
        { time: '昨日', from: '10', to: '5', reason: '竞品回复速度加快，AI缩短响应时效提升用户体验' },
      ] }),
      createParam('positive_reply_rate', '好评回复比例', 60, '%', '正面评论的自动回复覆盖率，过高可能显得机械', 70, 83, { min: 20, max: 100, step: 5, learningDataPoints: 29400, adjustHistory: [
        { time: '2天前', from: '50', to: '60', reason: '好评回复率偏低影响粉丝粘性，AI上调覆盖率' },
      ] }),
      createParam('escalation_trigger', '人工升级触发词数', 3, '个', '评论中命中敏感词数达到此值时自动升级至人工处理', 2, 85, { min: 1, max: 10, step: 1, learningDataPoints: 26800, adjustHistory: [
        { time: '4天前', from: '5', to: '3', reason: '一条严重投诉被AI误回复，AI降低触发词数加强人工兜底' },
      ] }),
    ],
  },
]

const sentimentAILearningStatus: AILearningStatus = {
  modelVersion: 'v2.2.0-sentiment',
  lastTraining: '20分钟前',
  totalDataPoints: 1560000,
  avgConfidence: 91,
  autoAdjustCount24h: 56,
  learningRate: '0.001 (AdamW)',
  nextTraining: '2小时后',
  improvementRate: '+6.2%',
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: 14,
  border: '1px solid var(--border-light)',
  padding: 20,
}

const kpiCardStyle: React.CSSProperties = {
  ...cardStyle,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  minWidth: 200,
}

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 24px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  fontWeight: active ? 600 : 400,
  fontSize: '0.88rem',
  background: active ? '#e8365d' : 'transparent',
  color: active ? '#fff' : 'var(--text-secondary)',
  transition: 'all 0.2s',
})

const sentimentColor = (s: string) => {
  if (s === '正面') return '#22c55e'
  if (s === '负面') return '#ef4444'
  return '#94a3b8'
}

const alertLevelColor = (l: string) => {
  if (l === '严重') return '#ef4444'
  if (l === '警告') return '#f59e0b'
  return '#3b82f6'
}

const platformColor = (p: string) => {
  const map: Record<string, string> = {
    '抖音': '#000000', '小红书': '#fe2c55', '快手': '#ff6600',
    '天猫': '#ff0036', '京东': '#c91623',
  }
  return map[p] || '#94a3b8'
}

const statusColor = (s: string) => {
  if (s === '已处理' || s === '已回复') return '#22c55e'
  if (s === '处理中') return '#f59e0b'
  return '#94a3b8'
}

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 20,
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#fff',
  background: color,
})

const btnStyle: React.CSSProperties = {
  padding: '5px 12px',
  borderRadius: 8,
  border: '1px solid var(--border-light)',
  background: 'var(--bg-card)',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  transition: 'all 0.15s',
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SentimentCenter() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'overview' | 'comments' | 'alerts' | 'autoreply'>('overview')
  const [marketTab, setMarketTab] = useState<'all' | 'cn' | 'intl'>('all')
  const [platformFilter, setPlatformFilter] = useState('全部')
  const [sentimentFilter, setSentimentFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [comments, setComments] = useState(commentList)
  const [alerts] = useState(alertList)
  const [templates, setTemplates] = useState(templateList)
  const [markMenuId, setMarkMenuId] = useState<number | null>(null)
  const [markToast, setMarkToast] = useState<{message: string; visible: boolean}>({ message: '', visible: false })

  useRegisterAIConfig(sentimentAIConfigGroups, sentimentAILearningStatus, '评论舆情')

  const showMarkToast = (msg: string) => {
    setMarkToast({ message: msg, visible: true })
    setTimeout(() => setMarkToast({ message: '', visible: false }), 2800)
  }

  const handleMarkComment = (id: number, status: '已处理' | '需跟进' | '已忽略') => {
    const statusMap: Record<string, Comment['status']> = {
      '已处理': '已回复',
      '已忽略': '已忽略',
      '需跟进': '未处理',
    }
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: statusMap[status] } : c))
    setMarkMenuId(null)
    showMarkToast(`✅ 已标记为"${status}"`)
  }

  const filteredComments = comments.filter(c => {
    if (platformFilter !== '全部' && c.platform !== platformFilter) return false
    if (sentimentFilter !== '全部' && c.sentiment !== sentimentFilter) return false
    if (statusFilter !== '全部' && c.status !== statusFilter) return false
    return true
  })

  const handleCommentAction = (id: number, action: '已回复' | '已忽略') => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, status: action } : c))
  }

  const handleTemplateToggle = (id: number) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  // ─── KPI Cards ─────────────────────────────────────────────────────────────
  const kpiCards = [
    { label: '今日新增评论', value: '8,642', unit: '条', icon: <MessageCircle size={20} />, color: '#e8365d' },
    { label: '正面情感占比', value: '76.4', unit: '%', icon: <ThumbsUp size={20} />, color: '#22c55e' },
    { label: '负面预警', value: '12', unit: '条', icon: <AlertTriangle size={20} />, color: '#ef4444' },
    { label: 'AI自动回复率', value: '45.2', unit: '%', icon: <Bot size={20} />, color: '#8b5cf6' },
  ]

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }} onClick={() => markMenuId !== null && setMarkMenuId(null)}>
      {/* Mark Toast */}
      {markToast.visible && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#fff', padding: '12px 24px', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
          fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {markToast.message}
        </div>
      )}
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          评论舆情中心
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0' }}>
          全平台评论监控与AI情感分析，实时预警与智能回复
        </p>
        {/* 语言/市场切换 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {([
            ['all', '全部'],
            ['cn', '\ud83c\udde8\ud83c\uddf3 中文舆情'],
            ['intl', '\ud83c\udf0d 国际舆情'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMarketTab(key as typeof marketTab)}
              style={{
                padding: '6px 18px',
                borderRadius: 20,
                border: marketTab === key ? '1.5px solid #0ea5e9' : '1px solid var(--border-light)',
                cursor: 'pointer',
                fontWeight: marketTab === key ? 600 : 400,
                fontSize: '0.82rem',
                background: marketTab === key ? 'rgba(14,165,233,0.1)' : 'var(--bg-card)',
                color: marketTab === key ? '#0ea5e9' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="SentimentAnalyzer" color="#8b5cf6" />
        <ModelBadge name="ComplianceNLP" color="#f59e0b" />
        <ModelBadge name="UGCQuality-Ranker" color="#ec4899" />
        <ModelBadge name="CompetitorIntel-NLP" color="#8b5cf6" />
      </div>

      {/* ── AI决策中心 · 舆情响应决策联动 ── */}
      {(() => {
        const sentimentDecisions = [
          { topicId: 'ST-441', topicTitle: '「假货质疑」负面舆情快速扩散', trigger: 'SentimentAnalyzer', decision: '暂停相关计划 + 启动品牌公关响应', status: '待确认', impact: '风险口碑指数-0.3', time: '11:48' },
          { topicId: 'ST-438', topicTitle: '竞品花西子翻车事件', trigger: 'CompetitorIntel-NLP', decision: '触发DC-009 抢量决策', status: '已完成', impact: '搜索流量+35%', time: '11:20' },
          { topicId: 'ST-435', topicTitle: '低质UGC内容扩散(质量分<60)', trigger: 'UGCQuality-Ranker', decision: '下架低分内容 + 触发素材补充', status: '执行中', impact: '内容质量分+0.8', time: '11:05' },
          { topicId: 'ST-431', topicTitle: '敏感词检出率上升，合规风险', trigger: 'ComplianceNLP', decision: '暂停违规素材 + 触发审核流程', status: '已完成', impact: '合规风险归零', time: '10:40' },
        ]
        const statusStyle: Record<string, { bg: string; color: string }> = {
          '执行中': { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
          '已完成': { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
          '待确认': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
        }
        return (
          <div style={{ marginBottom: 20, padding: '14px 16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 舆情响应决策联动</span>
                <span style={{ fontSize: '0.62rem', padding: '1px 8px', borderRadius: 8, background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>舆情驱动 · 自动响应</span>
              </div>
              <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.68rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部决策 →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sentimentDecisions.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 34, flexShrink: 0 }}>{d.time}</span>
                  <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', flexShrink: 0 }}>{d.topicId}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', flexShrink: 0, maxWidth: 180 }}>{d.topicTitle}</span>
                  <ModelBadge name={d.trigger} color="#8b5cf6" />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: '0.72rem', flex: 1, fontWeight: 500 }}>{d.decision}</span>
                  <span style={{ fontSize: '0.62rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                  <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 5, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {kpiCards.map(k => (
          <div key={k.label} style={kpiCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ color: k.color }}>{k.icon}</div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{k.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{k.value}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{k.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', borderRadius: 12, padding: 4, border: '1px solid var(--border-light)' }}>
        {([
          ['overview', '舆情总览'],
          ['comments', '评论管理'],
          ['alerts', '负面预警'],
          ['autoreply', '自动回复'],
        ] as const).map(([key, label]) => (
          <button key={key} style={tabBtnStyle(tab === key)} onClick={() => setTab(key as typeof tab)}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: 舆情总览 */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
            {/* Sentiment Pie */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>情感分布</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={sentimentPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {sentimentPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
                {sentimentPieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-day Trend */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>7日情感趋势</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData7d}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="正面" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="中性" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="负面" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Keywords */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hash size={18} /> 高频关键词
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '8px 0' }}>
              {hotKeywords.map(kw => {
                const minSize = 0.78
                const maxSize = 1.3
                const maxFreq = hotKeywords[0].freq
                const minFreq = hotKeywords[hotKeywords.length - 1].freq
                const scale = minSize + ((kw.freq - minFreq) / (maxFreq - minFreq)) * (maxSize - minSize)
                const isNeg = kw.sentiment === 'negative'
                return (
                  <span
                    key={kw.word}
                    style={{
                      display: 'inline-block',
                      padding: '6px 16px',
                      borderRadius: 20,
                      fontSize: `${scale}rem`,
                      fontWeight: 500,
                      background: isNeg ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      color: isNeg ? '#ef4444' : '#22c55e',
                      border: `1px solid ${isNeg ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                      cursor: 'default',
                    }}
                  >
                    {kw.word}
                    <span style={{ fontSize: '0.7rem', marginLeft: 4, opacity: 0.7 }}>{kw.freq}</span>
                  </span>
                )
              })}
            </div>
          </div>

          {/* Hot Topics */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} /> 热门话题
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {hotTopics.map(topic => (
                <div key={topic.title} style={{ ...cardStyle, padding: 16, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 10, color: 'var(--text-primary)' }}>{topic.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>讨论量: {topic.comments.toLocaleString()}</span>
                    <span style={badgeStyle(sentimentColor(topic.sentiment))}>{topic.sentiment}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>正面率: {topic.sentimentRate}%</span>
                    <span style={{ color: topic.trend.startsWith('+') ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{topic.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: 评论管理 */}
      {tab === 'comments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters */}
          <div style={{ ...cardStyle, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', padding: 16 }}>
            <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>平台:</span>
              {['全部', '抖音', '小红书', '快手', '天猫', '京东'].map(p => (
                <button key={p} onClick={() => setPlatformFilter(p)} style={{ ...btnStyle, background: platformFilter === p ? '#e8365d' : 'var(--bg-card)', color: platformFilter === p ? '#fff' : 'var(--text-secondary)', borderColor: platformFilter === p ? '#e8365d' : 'var(--border-light)' }}>
                  {p}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>情感:</span>
              {['全部', '正面', '中性', '负面'].map(s => (
                <button key={s} onClick={() => setSentimentFilter(s)} style={{ ...btnStyle, background: sentimentFilter === s ? '#e8365d' : 'var(--bg-card)', color: sentimentFilter === s ? '#fff' : 'var(--text-secondary)', borderColor: sentimentFilter === s ? '#e8365d' : 'var(--border-light)' }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>状态:</span>
              {['全部', '未处理', '已回复', '已忽略'].map(st => (
                <button key={st} onClick={() => setStatusFilter(st)} style={{ ...btnStyle, background: statusFilter === st ? '#e8365d' : 'var(--bg-card)', color: statusFilter === st ? '#fff' : 'var(--text-secondary)', borderColor: statusFilter === st ? '#e8365d' : 'var(--border-light)' }}>
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Comment List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredComments.map(c => (
              <div key={c.id} style={{ ...cardStyle, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{c.user}</span>
                    <span style={{ ...badgeStyle(platformColor(c.platform)), fontSize: '0.68rem' }}>{c.platform}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{c.time}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={badgeStyle(sentimentColor(c.sentiment))}>{c.sentiment}</span>
                    <span style={badgeStyle(statusColor(c.status))}>{c.status}</span>
                  </div>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{c.content}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>关联商品: {c.product}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleCommentAction(c.id, '已回复')} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Reply size={13} /> 回复
                    </button>
                    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setMarkMenuId(markMenuId === c.id ? null : c.id)}
                        style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: 4, background: markMenuId === c.id ? 'rgba(232,54,93,0.08)' : 'var(--bg-card)', color: markMenuId === c.id ? '#e8365d' : 'var(--text-secondary)', borderColor: markMenuId === c.id ? '#e8365d' : 'var(--border-light)' }}>
                        <Flag size={13} /> 标记
                      </button>
                      {markMenuId === c.id && (
                        <div style={{
                          position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 100,
                          background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                          borderRadius: 10, padding: '4px 0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          minWidth: 120,
                        }}>
                          {([
                            { label: '已处理', color: '#22c55e' },
                            { label: '需跟进', color: '#f59e0b' },
                            { label: '已忽略', color: '#9ca3af' },
                          ] as { label: '已处理' | '需跟进' | '已忽略'; color: string }[]).map(opt => (
                            <button key={opt.label} onClick={() => handleMarkComment(c.id, opt.label)} style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              width: '100%', padding: '8px 14px', border: 'none',
                              background: 'transparent', cursor: 'pointer',
                              fontSize: '0.78rem', color: opt.color, fontWeight: 600,
                              textAlign: 'left',
                            }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleCommentAction(c.id, '已忽略')} style={{ ...btnStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <XCircle size={13} /> 忽略
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: 负面预警 */}
      {tab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Alert Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: '今日预警', value: '12条', color: '#e8365d', icon: <Bell size={18} /> },
              { label: '已处理', value: '8条', color: '#22c55e', icon: <CheckCircle size={18} /> },
              { label: '处理中', value: '3条', color: '#f59e0b', icon: <RefreshCw size={18} /> },
              { label: '未处理', value: '1条', color: '#ef4444', icon: <AlertTriangle size={18} /> },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map(a => (
              <div key={a.id} style={{ ...cardStyle, padding: 16, borderLeft: `4px solid ${alertLevelColor(a.level)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ ...badgeStyle(alertLevelColor(a.level)), minWidth: 40, textAlign: 'center' }}>{a.level}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{a.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.time}</span>
                    <span style={badgeStyle(statusColor(a.status))}>{a.status}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span style={{ ...badgeStyle(platformColor(a.source)), fontSize: '0.68rem', marginRight: 8 }}>{a.source}</span>
                  {a.comment}
                </div>
              </div>
            ))}
          </div>

          {/* Platform Negative Bar Chart */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>各平台负面评论分布</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={platformNegativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="platform" tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--text-secondary)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="负面评论数" radius={[6, 6, 0, 0]}>
                  {platformNegativeData.map((_, i) => (
                    <Cell key={i} fill={['#fe2c55', '#000000', '#ff0036', '#c91623', '#ff6600'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── 国际舆情实时监控 ── */}
      {(marketTab === 'all' || marketTab === 'intl') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 18px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {'\ud83c\udf0d'} 国际舆情实时监控
            </h3>

            {/* 多语言情感分析 */}
            <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>多语言情感分析</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { flag: '\ud83c\uddfa\ud83c\uddf8', lang: 'English', count: '1,240', pos: 72, neg: 8, neu: 20, words: ['"love the texture"', '"best foundation"'] },
                { flag: '\ud83c\uddec\ud83c\udde7', lang: 'English (UK)', count: '380', pos: 68, neg: 12, neu: 20, words: ['"brilliant coverage"', '"bit pricey"'] },
                { flag: '\ud83c\uddef\ud83c\uddf5', lang: '日本語', count: '520', pos: 81, neg: 4, neu: 15, words: ['"肌触り最高"', '"リピ確定"'] },
                { flag: '\ud83c\uddeb\ud83c\uddf7', lang: 'Fran\u00e7ais', count: '180', pos: 65, neg: 15, neu: 20, words: ['"texture l\u00e9g\u00e8re"', '"un peu cher"'] },
                { flag: '\ud83c\udde9\ud83c\uddea', lang: 'Deutsch', count: '140', pos: 70, neg: 10, neu: 20, words: ['"tolle Abdeckung"', '"schnelle Lieferung"'] },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: 'rgba(14,165,233,0.03)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                  {/* Flag + language */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 150, flexShrink: 0 }}>
                    <span style={{ fontSize: '1.2rem' }}>{row.flag}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{row.lang}</span>
                  </div>
                  {/* Count */}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 70, flexShrink: 0 }}>{row.count}条</span>
                  {/* Sentiment bar */}
                  <div style={{ display: 'flex', flex: 1, height: 18, borderRadius: 9, overflow: 'hidden', minWidth: 120 }}>
                    <div style={{ width: `${row.pos}%`, background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>{row.pos}%</span>
                    </div>
                    <div style={{ width: `${row.neg}%`, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>{row.neg}%</span>
                    </div>
                    <div style={{ width: `${row.neu}%`, background: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>{row.neu}%</span>
                    </div>
                  </div>
                  {/* Sentiment labels */}
                  <div style={{ display: 'flex', gap: 8, fontSize: '0.7rem', flexShrink: 0, minWidth: 180 }}>
                    <span style={{ color: '#22c55e' }}>正面{row.pos}%</span>
                    <span style={{ color: '#ef4444' }}>负面{row.neg}%</span>
                    <span style={{ color: '#94a3b8' }}>中性{row.neu}%</span>
                  </div>
                  {/* Hot words */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                    {row.words.map((w, j) => (
                      <span key={j} style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                        fontSize: '0.7rem', fontWeight: 500,
                        background: 'rgba(14,165,233,0.08)', color: '#0ea5e9',
                        border: '1px solid rgba(14,165,233,0.2)',
                      }}>
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 国际舆情危机预警 */}
            <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>国际舆情危机预警</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', borderLeft: '4px solid #ef4444' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{'\u26a0\ufe0f'}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    UK市场 "过敏反馈" 提及量3日增长280%
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    TikTok @beautyblend_uk 发布负面评测，需48小时内回应
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(245,158,11,0.05)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', borderLeft: '4px solid #f59e0b' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{'\ud83d\udfe1'}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    日本市场 "包装破损" 物流投诉增加
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Amazon JP差评+12条/日
                  </div>
                </div>
              </div>
            </div>

            {/* AI模型标注 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(14,165,233,0.06)', borderRadius: 10, border: '1px solid rgba(14,165,233,0.15)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>驱动模型：</span>
              <ModelBadge name="MultiLingual-ContentLLM" color="#0ea5e9" />
              <ModelBadge name="CulturalAdapt-Classifier" color="#0ea5e9" />
            </div>
          </div>
        </div>
      )}

      {/* Tab: 自动回复 */}
      {tab === 'autoreply' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: '回复模板数', value: '24', unit: '个', color: '#e8365d', icon: <MessageSquare size={18} /> },
              { label: '今日自动回复', value: '3,902', unit: '条', color: '#8b5cf6', icon: <Send size={18} /> },
              { label: '回复满意度', value: '92.4', unit: '%', color: '#22c55e', icon: <Star size={18} /> },
              { label: '人工介入率', value: '8.2', unit: '%', color: '#f59e0b', icon: <Shield size={18} /> },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Template List + Pie side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Templates */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>回复模板管理</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: 500 }}>模板名称</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: 500 }}>适用场景</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: 500 }}>使用次数</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: 500 }}>满意度</th>
                    <th style={{ textAlign: 'center', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: 500 }}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{t.scene}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-primary)' }}>{t.useCount.toLocaleString()}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: t.satisfaction >= 90 ? '#22c55e' : t.satisfaction >= 80 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{t.satisfaction}%</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleTemplateToggle(t.id)}
                          style={{
                            padding: '4px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600,
                            background: t.enabled ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
                            color: t.enabled ? '#22c55e' : '#94a3b8',
                          }}
                        >
                          {t.enabled ? '启用' : '停用'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reply Type Pie */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>回复类型分布</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={replyTypePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {replyTypePieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {replyTypePieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
