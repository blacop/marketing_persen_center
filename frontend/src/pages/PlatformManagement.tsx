import { useState } from 'react'
import {
  Globe, Check, Activity, AlertTriangle, RefreshCw, Zap, Bot,
  Link2, Unlink, TestTube, Key, Webhook,
  Eye, EyeOff, Copy, CheckCircle, XCircle, Loader, ChevronDown, ChevronUp,
  Shield, RotateCcw, ExternalLink, DollarSign, X
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ── 类型 ── */
interface PlatformConfig {
  name: string
  api: string
  color: string
  region: '国内' | '国际'
  connected: boolean
  latency: number
  calls: number
  rateRemain: number
  tokenDays: number
  appId: string
  appSecret: string
  accessToken: string
  oauthUrl: string
  webhookUrl: string
  webhookEvents: string[]
  syncInterval: number // 分钟
  lastSync: string
  successRate: number
  autoRefreshToken: boolean
}

/* ── 平台数据 ── */
const initialPlatforms: PlatformConfig[] = [
  // ── 🇨🇳 国内平台 ──
  {
    name: '抖音巨量引擎', api: '巨量引擎 API v3.0', color: '#3b82f6', region: '国内', connected: true,
    latency: 12, calls: 12450, rateRemain: 85, tokenDays: 28,
    appId: '6834201745892', appSecret: '••••••••••••a3f2', accessToken: 'OYEd3...••••Kx9ZF',
    oauthUrl: 'https://ad.oceanengine.com/openapi/oauth2/authorize',
    webhookUrl: 'https://api.mariedalgar.com/webhook/douyin',
    webhookEvents: ['campaign.updated', 'adset.updated', 'ad.effective_status_changed', 'insights.ready'],
    syncInterval: 5, lastSync: '2分钟前', successRate: 99.8, autoRefreshToken: true,
  },
  {
    name: '小红书聚光', api: '聚光平台 API v2.0', color: '#ec4899', region: '国内', connected: true,
    latency: 18, calls: 8920, rateRemain: 72, tokenDays: 14,
    appId: '5621038492', appSecret: '••••••••••••e7b1', accessToken: 'xhs_...••••5c3a',
    oauthUrl: 'https://app.xhslink.com/oauth/authorize',
    webhookUrl: 'https://api.mariedalgar.com/webhook/xiaohongshu',
    webhookEvents: ['campaign.update', 'ad.status_change', 'report.ready', 'creative.audit'],
    syncInterval: 5, lastSync: '1分钟前', successRate: 99.6, autoRefreshToken: true,
  },
  {
    name: '快手磁力引擎', api: '磁力引擎 API v1.5', color: '#f59e0b', region: '国内', connected: true,
    latency: 15, calls: 6780, rateRemain: 90, tokenDays: 35,
    appId: 'KS-482-109-7362', appSecret: '••••••••••••x9d4', accessToken: 'ks29...••••jR8n',
    oauthUrl: 'https://auth.kwai.com/oauth/authorize',
    webhookUrl: 'https://api.mariedalgar.com/webhook/kuaishou',
    webhookEvents: ['campaign.change', 'budget.change', 'bidding.change', 'conversion.ready'],
    syncInterval: 10, lastSync: '3分钟前', successRate: 99.9, autoRefreshToken: true,
  },
  {
    name: '天猫品销宝', api: '品销宝 API v2.1', color: '#fbbf24', region: '国内', connected: false,
    latency: 0, calls: 0, rateRemain: 0, tokenDays: 0,
    appId: '', appSecret: '', accessToken: '',
    oauthUrl: 'https://auth.tmall.com/oauth/authorize',
    webhookUrl: '', webhookEvents: [],
    syncInterval: 15, lastSync: '-', successRate: 0, autoRefreshToken: false,
  },
  {
    name: '京东京准通', api: '京准通 API v1.2', color: '#f97316', region: '国内', connected: false,
    latency: 0, calls: 0, rateRemain: 0, tokenDays: 0,
    appId: '', appSecret: '', accessToken: '',
    oauthUrl: 'https://auth.jd.com/oauth/authorize',
    webhookUrl: '', webhookEvents: [],
    syncInterval: 15, lastSync: '-', successRate: 0, autoRefreshToken: false,
  },
  {
    name: '抖音DOU+', api: 'DOU+ API v2.0', color: '#ff7a95', region: '国内', connected: true,
    latency: 20, calls: 1890, rateRemain: 92, tokenDays: 60,
    appId: 'DOUPLUS.d4e5f6', appSecret: '••••••••••••p4k7', accessToken: 'dpJ8...••••Lq2W',
    oauthUrl: 'https://ad.oceanengine.com/openapi/dou_plus/authorize',
    webhookUrl: 'https://api.mariedalgar.com/webhook/douplus',
    webhookEvents: ['campaign.update', 'keyword.update', 'budget.alert'],
    syncInterval: 15, lastSync: '2分钟前', successRate: 99.9, autoRefreshToken: true,
  },
  // ── 🌍 国际平台 ──
  {
    name: 'Meta Ads (Facebook · Instagram)', api: 'Meta Marketing API v20.0', color: '#1877f2', region: '国际', connected: true,
    latency: 38, calls: 9240, rateRemain: 78, tokenDays: 45,
    appId: '498231047865321', appSecret: '••••••••••••c8a1', accessToken: 'EAAd7...••••Zm3T',
    oauthUrl: 'https://www.facebook.com/dialog/oauth',
    webhookUrl: 'https://api.mariedalgar.com/webhook/meta',
    webhookEvents: ['campaign.updated', 'adset.updated', 'ad.status_changed', 'insights.ready'],
    syncInterval: 5, lastSync: '4分钟前', successRate: 99.3, autoRefreshToken: true,
  },
  {
    name: 'TikTok for Business', api: 'TikTok Marketing API v1.3', color: '#010101', region: '国际', connected: true,
    latency: 52, calls: 6180, rateRemain: 83, tokenDays: 30,
    appId: 'TT-7B2491DE-F8C3', appSecret: '••••••••••••f2b9', accessToken: 'tikt...••••9pXm',
    oauthUrl: 'https://ads.tiktok.com/marketing_api/auth',
    webhookUrl: 'https://api.mariedalgar.com/webhook/tiktok-global',
    webhookEvents: ['campaign.updated', 'adgroup.updated', 'ad.status_changed', 'report.ready'],
    syncInterval: 5, lastSync: '6分钟前', successRate: 98.8, autoRefreshToken: true,
  },
  {
    name: 'Google Ads · YouTube', api: 'Google Ads API v17 + YouTube Data API v3', color: '#4285f4', region: '国际', connected: true,
    latency: 44, calls: 7560, rateRemain: 91, tokenDays: 60,
    appId: '812047193682-gads.apps.googleusercontent.com', appSecret: '••••••••••••d4e2', accessToken: 'ya29...••••HpKz',
    oauthUrl: 'https://accounts.google.com/o/oauth2/auth',
    webhookUrl: 'https://api.mariedalgar.com/webhook/google',
    webhookEvents: ['campaign.updated', 'bidstrategy.changed', 'conversion.ready', 'performance_max.updated'],
    syncInterval: 10, lastSync: '8分钟前', successRate: 99.5, autoRefreshToken: true,
  },
  {
    name: 'Amazon Ads', api: 'Amazon Advertising API v3', color: '#ff9900', region: '国际', connected: false,
    latency: 0, calls: 0, rateRemain: 0, tokenDays: 0,
    appId: '', appSecret: '', accessToken: '',
    oauthUrl: 'https://www.amazon.com/ap/oa',
    webhookUrl: '', webhookEvents: [],
    syncInterval: 15, lastSync: '-', successRate: 0, autoRefreshToken: false,
  },
  {
    name: 'Pinterest Ads', api: 'Pinterest Ads API v5', color: '#e60023', region: '国际', connected: false,
    latency: 0, calls: 0, rateRemain: 0, tokenDays: 0,
    appId: '', appSecret: '', accessToken: '',
    oauthUrl: 'https://www.pinterest.com/oauth',
    webhookUrl: '', webhookEvents: [],
    syncInterval: 30, lastSync: '-', successRate: 0, autoRefreshToken: false,
  },
  {
    name: 'Snapchat Ads', api: 'Snapchat Marketing API v1', color: '#fffc00', region: '国际', connected: false,
    latency: 0, calls: 0, rateRemain: 0, tokenDays: 0,
    appId: '', appSecret: '', accessToken: '',
    oauthUrl: 'https://accounts.snapchat.com/accounts/oauth2/auth',
    webhookUrl: '', webhookEvents: [],
    syncInterval: 30, lastSync: '-', successRate: 0, autoRefreshToken: false,
  },
]

const apiOpsDistribution = [
  { platform: '抖音', 建计划: 28, 调出价: 142, 关停: 15, 素材同步: 58, 受众更新: 18, 预算调整: 35 },
  { platform: '小红书', 建计划: 18, 调出价: 95, 关停: 12, 素材同步: 48, 受众更新: 12, 预算调整: 25 },
  { platform: '快手', 建计划: 12, 调出价: 56, 关停: 6, 素材同步: 28, 受众更新: 8, 预算调整: 18 },
  { platform: '天猫', 建计划: 4, 调出价: 20, 关停: 3, 素材同步: 12, 受众更新: 2, 预算调整: 6 },
  { platform: '京东', 建计划: 2, 调出价: 10, 关停: 1, 素材同步: 6, 受众更新: 1, 预算调整: 3 },
  { platform: 'DOU+', 建计划: 1, 调出价: 5, 关停: 1, 素材同步: 4, 受众更新: 1, 预算调整: 2 },
  { platform: 'Meta', 建计划: 22, 调出价: 118, 关停: 10, 素材同步: 44, 受众更新: 16, 预算调整: 28 },
  { platform: 'TikTok', 建计划: 15, 调出价: 72, 关停: 8, 素材同步: 32, 受众更新: 11, 预算调整: 19 },
  { platform: 'Google', 建计划: 18, 调出价: 96, 关停: 7, 素材同步: 26, 受众更新: 14, 预算调整: 22 },
]

const failedSyncs = [
  { time: '15:12:07', platform: 'Meta Ads (Facebook · Instagram)', region: '国际', type: 'CAPI事件回传', error: 'Access Token过期', retry: '自动刷新Token后重试成功', status: 'resolved' as const },
  { time: '14:32:05', platform: '小红书聚光', region: '国内', type: '素材同步', error: '网络超时', retry: '已自动重试成功', status: 'resolved' as const },
  { time: '13:48:21', platform: 'TikTok for Business', region: '国际', type: '受众包同步', error: 'API限频触发', retry: '等待60s后重试成功', status: 'resolved' as const },
  { time: '11:15:42', platform: '抖音巨量引擎', region: '国内', type: '受众包更新', error: 'API限频触发', retry: '等待30s后重试成功', status: 'resolved' as const },
  { time: '09:48:18', platform: '快手磁力引擎', region: '国内', type: '出价调整', error: '鉴权Token过期', retry: '自动刷新Token后重试成功', status: 'resolved' as const },
  { time: '08:23:44', platform: 'Google Ads · YouTube', region: '国际', type: '转化数据同步', error: 'OAuth授权失效', retry: '重新授权后同步成功', status: 'resolved' as const },
]

const platformRules = [
  { platform: '抖音巨量引擎', region: '国内', rules: '单账户100计划上限 · 素材2天审核期 · 智能放量优化 · 全域推广模式', ai: '自动拆分超限计划 · 预留审核时间 · 智能出价保护' },
  { platform: '小红书聚光', region: '国内', rules: '素材48h审核 · 图文笔记优先 · CPM/CPC混合 · 聚光薯条协同', ai: '提前提交素材 · 种草内容适配 · 出价策略匹配' },
  { platform: '快手磁力引擎', region: '国内', rules: '磁力金牛智能托管 · 短视频信息流 · 直播引流投放 · 粉丝通精准', ai: '投放计划自动优化 · 出价动态调整 · 直播场景适配' },
  { platform: '天猫品销宝', region: '国内', rules: '品销协同 · 搜索广告直通车 · 超级推荐 · 最低日预算¥100', ai: '搜索词自动拓展 · 创意A/B测试 · 预算下限保护' },
  { platform: '京东京准通', region: '国内', rules: '搜索广告精准触达 · 展示广告品牌曝光 · 部分API功能受限', ai: '功能降级兼容 · 手动补充API缺失功能 · 数据回传适配' },
  { platform: '抖音DOU+', region: '国内', rules: '内容加热投放 · 粉丝增长导流 · 视频播放加热 · 最低投放¥100', ai: '内容评分预判 · 目标受众自动扩展 · 预算分段投放' },
  { platform: 'Meta Ads (Facebook · Instagram)', region: '国际', rules: 'iOS ATT隐私限制 · GDPR/CCPA合规 · CAPI服务端事件上报 · 账户级每日预算上限$10万', ai: 'CAPI归因自动配置 · 受众扩展阈值管理 · EU定向模式自动切换' },
  { platform: 'TikTok for Business', region: '国际', rules: '创意疲劳阈值72h · TopView/In-Feed多格式 · Branded Hashtag Challenge · 市场级预算隔离', ai: '创意疲劳自动替换 · 出价策略跨市场优化 · Creator合作预算联动' },
  { platform: 'Google Ads · YouTube', region: '国际', rules: 'Performance Max自动出价 · Smart Bidding CPA/ROAS目标 · YouTube TrueView跳过限制 · 关键词匹配类型管控', ai: '关键词出价自动分级 · YouTube频率上限保护 · 展示网络受众相似扩展' },
  { platform: 'Amazon Ads', region: '国际', rules: 'Sponsored Products/Brands/Display三类广告 · ACoS目标优化 · 品牌词保护 · 最低竞价$0.02', ai: 'ACoS目标自动调整 · 关键词竞价智能出价 · 商品页面定向优化' },
  { platform: 'Pinterest Ads', region: '国际', rules: 'Pin格式素材2:3竖版最优 · 美妆兴趣定向覆盖率高 · 低CPM品牌曝光友好 · 购物广告Catalog集成', ai: '竖版素材自动适配 · 美妆受众兴趣标签匹配 · Catalog商品自动同步' },
  { platform: 'Snapchat Ads', region: '国际', rules: 'Gen Z核心受众 · Story/Collection Ads · AR试妆滤镜广告 · 最低日预算$5', ai: 'AR素材投放优先策略 · 年龄分层出价保护 · Story完播率优化' },
]

const opsStats = [
  { label: '自动建计划', value: 120, detail: '国内 65 · 国际 55 · 跨平台协同', icon: Zap, color: '#3b82f6' },
  { label: '自动调出价', value: 614, detail: '国内 328 · 国际 286 · ROI实时优化', icon: Activity, color: '#10b981' },
  { label: '自动关停计划', value: 63, detail: '国内 38 · 国际 25 · 低效识别关停', icon: AlertTriangle, color: '#ef4444' },
  { label: '素材同步', value: 258, detail: '国内 156 · 国际 102 · 跨平台分发', icon: RefreshCw, color: '#ff7a95' },
  { label: '受众包更新', value: 73, detail: '国内 42 · 国际 31 · 相似受众刷新', icon: Globe, color: '#f59e0b' },
  { label: '预算调整', value: 158, detail: '国内 89 · 国际 69 · 动态再分配', icon: Bot, color: '#ec4899' },
]

const allWebhookEvents: Record<string, string[]> = {
  '抖音巨量引擎': ['campaign.updated', 'adset.updated', 'ad.effective_status_changed', 'insights.ready', 'leadgen.update', 'account.spending_limit'],
  '小红书聚光': ['note.updated', 'ad.status_change', 'report.ready', 'creative.audit', 'balance.alert', 'kol.event'],
  '快手磁力引擎': ['campaign.change', 'budget.change', 'bidding.change', 'conversion.ready', 'keyword.match', 'account.alert'],
  '天猫品销宝': ['campaign.update', 'ad.status_change', 'insights.ready', 'shop.event', 'budget.alert'],
  '京东京准通': ['campaign.update', 'ad.status_change', 'report.ready', 'balance.alert'],
  '抖音DOU+': ['heat.update', 'video.status_change', 'budget.alert', 'follower.new', 'play.milestone'],
  'Meta Ads (Facebook · Instagram)': ['campaign.updated', 'adset.updated', 'ad.status_changed', 'insights.ready', 'lead.new', 'account.policy_violation', 'pixel.event_match'],
  'TikTok for Business': ['campaign.updated', 'adgroup.updated', 'ad.status_changed', 'report.ready', 'creative.fatigue', 'hashtag.trending', 'creator.event'],
  'Google Ads · YouTube': ['campaign.updated', 'bidstrategy.changed', 'conversion.ready', 'performance_max.updated', 'keyword.quality_score_changed', 'remarketing_list.updated'],
  'Amazon Ads': ['campaign.updated', 'keyword.bid_changed', 'acos.threshold', 'product.targeting_updated', 'budget.alert'],
  'Pinterest Ads': ['campaign.updated', 'pin.engagement', 'catalog.synced', 'audience.updated', 'budget.alert'],
  'Snapchat Ads': ['campaign.updated', 'creative.approved', 'ar_lens.impression', 'audience.updated', 'budget.alert'],
}

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

/* ── 按钮样式 ── */
const btnPrimary: React.CSSProperties = {
  padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
  fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'var(--accent-primary)', color: '#fff',
}
const btnOutline: React.CSSProperties = {
  padding: '6px 16px', borderRadius: 8, cursor: 'pointer',
  fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'transparent', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)',
}
const btnDanger: React.CSSProperties = {
  ...btnOutline, color: '#ef4444', borderColor: '#ef4444',
}
const btnSmall: React.CSSProperties = {
  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
  fontSize: '0.72rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'rgba(232,54,93,0.08)', color: 'var(--accent-primary)',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
  fontSize: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)',
  outline: 'none',
}

/* ── 组件 ── */
export default function PlatformManagement() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(initialPlatforms)
  const [activeTab, setActiveTab] = useState(0)
  const [regionFilter, setRegionFilter] = useState<'全部' | '国内' | '国际'>('全部')
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null)
  const [connectModal, setConnectModal] = useState<string | null>(null)
  const [connectStep, setConnectStep] = useState(0)
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'testing' | 'success' | 'fail'>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<Record<string, boolean>>({})
  const [refreshingToken, setRefreshingToken] = useState<Record<string, boolean>>({})
  const [tokenRefreshResult, setTokenRefreshResult] = useState<Record<string, 'success' | 'fail' | null>>({})
  // 手动配置密钥
  const [manualConfigModal, setManualConfigModal] = useState<string | null>(null)
  const [manualForm, setManualForm] = useState({ appId: '', appSecret: '', accessToken: '', webhookUrl: '' })
  const [manualTestState, setManualTestState] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle')
  const [manualShowSecrets, setManualShowSecrets] = useState<Record<string, boolean>>({})
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)
  const [platformToast, setPlatformToast] = useState<{message: string; visible: boolean}>({ message: '', visible: false })
  const showPlatformToast = (msg: string) => {
    setPlatformToast({ message: msg, visible: true })
    setTimeout(() => setPlatformToast({ message: '', visible: false }), 3500)
  }

  /* -- 模拟OAuth连接 -- */
  const handleConnect = (name: string) => {
    setConnectModal(name)
    setConnectStep(0)
  }
  const handleOAuthStart = () => {
    setConnectStep(1) // 模拟OAuth跳转中
    setTimeout(() => setConnectStep(2), 1500) // 授权回调
    setTimeout(() => {
      setConnectStep(3) // 获取Token成功
      setPlatforms(prev => prev.map(p =>
        p.name === connectModal ? {
          ...p, connected: true, latency: 20 + Math.floor(Math.random() * 15),
          calls: 0, rateRemain: 100, tokenDays: 30,
          appId: `APP_${Date.now().toString(36).toUpperCase()}`,
          appSecret: '••••••••••••' + Math.random().toString(36).slice(2, 6),
          accessToken: 'tok_...••••' + Math.random().toString(36).slice(2, 6),
          webhookUrl: `https://api.mariedalgar.com/webhook/${connectModal?.toLowerCase().replace(/\s+/g, '')}`,
          lastSync: '刚刚', successRate: 100, autoRefreshToken: true,
        } : p
      ))
    }, 3000)
  }
  const handleDisconnect = (name: string) => {
    setPlatforms(prev => prev.map(p =>
      p.name === name ? {
        ...p, connected: false, latency: 0, calls: 0, rateRemain: 0, tokenDays: 0,
        appId: '', appSecret: '', accessToken: '', webhookUrl: '', webhookEvents: [],
        lastSync: '-', successRate: 0, autoRefreshToken: false,
      } : p
    ))
  }

  /* -- 刷新Token -- */
  const handleRefreshToken = (name: string) => {
    setRefreshingToken(prev => ({ ...prev, [name]: true }))
    setTokenRefreshResult(prev => ({ ...prev, [name]: null }))
    setTimeout(() => {
      setRefreshingToken(prev => ({ ...prev, [name]: false }))
      setTokenRefreshResult(prev => ({ ...prev, [name]: 'success' }))
      setPlatforms(prev => prev.map(p =>
        p.name === name ? {
          ...p,
          tokenDays: 30,
          accessToken: 'tok_' + Date.now().toString(36).slice(-4) + '...••••' + Math.random().toString(36).slice(2, 6),
        } : p
      ))
      setTimeout(() => setTokenRefreshResult(prev => ({ ...prev, [name]: null })), 3000)
    }, 2000)
  }

  const platformConsoleUrls: Record<string, string> = {
    '抖音巨量引擎': 'https://ad.oceanengine.com/overture/home/index',
    '小红书聚光': 'https://app.xhslink.com/dashboard',
    '快手磁力引擎': 'https://ad.kuaishou.com/overview',
    '天猫品销宝': 'https://www.alimama.com/dashboard',
    '京东京准通': 'https://ad.jd.com/dashboard',
    '抖音DOU+': 'https://www.douyin.com/explore',
    'Meta Ads (Facebook · Instagram)': 'https://business.facebook.com/adsmanager',
    'TikTok for Business': 'https://ads.tiktok.com/i18n/dashboard',
    'Google Ads · YouTube': 'https://ads.google.com/aw/overview',
    'Amazon Ads': 'https://advertising.amazon.com',
    'Pinterest Ads': 'https://ads.pinterest.com',
    'Snapchat Ads': 'https://ads.snapchat.com',
  }

  /* -- 手动配置密钥 -- */
  const handleOpenManualConfig = (name: string) => {
    const p = platforms.find(pp => pp.name === name)
    setManualConfigModal(name)
    setManualForm({
      appId: p?.connected ? p.appId : '',
      appSecret: p?.connected ? p.appSecret.replace(/•/g, '') : '',
      accessToken: p?.connected ? p.accessToken.replace(/•/g, '') : '',
      webhookUrl: p?.connected ? p.webhookUrl : `https://api.mariedalgar.com/webhook/${name.toLowerCase().replace(/\s+/g, '')}`,
    })
    setManualTestState('idle')
    setManualShowSecrets({})
  }
  const handleManualTest = () => {
    if (!manualForm.appId || !manualForm.appSecret) {
      setManualTestState('fail')
      setTimeout(() => setManualTestState('idle'), 2500)
      return
    }
    setManualTestState('testing')
    setTimeout(() => {
      setManualTestState('success')
    }, 1800)
  }
  const handleManualSave = () => {
    if (!manualConfigModal || !manualForm.appId || !manualForm.appSecret || !manualForm.accessToken) return
    setPlatforms(prev => prev.map(p =>
      p.name === manualConfigModal ? {
        ...p,
        connected: true,
        latency: 15 + Math.floor(Math.random() * 20),
        calls: 0,
        rateRemain: 100,
        tokenDays: 30,
        appId: manualForm.appId,
        appSecret: manualForm.appSecret.length > 12 ? '••••••••••••' + manualForm.appSecret.slice(-4) : manualForm.appSecret,
        accessToken: manualForm.accessToken.length > 12 ? manualForm.accessToken.slice(0, 6) + '...••••' + manualForm.accessToken.slice(-4) : manualForm.accessToken,
        webhookUrl: manualForm.webhookUrl || `https://api.mariedalgar.com/webhook/${manualConfigModal.toLowerCase().replace(/\s+/g, '')}`,
        webhookEvents: allWebhookEvents[manualConfigModal]?.slice(0, 4) || [],
        lastSync: '刚刚',
        successRate: 100,
        autoRefreshToken: true,
      } : p
    ))
    setManualConfigModal(null)
    setManualForm({ appId: '', appSecret: '', accessToken: '', webhookUrl: '' })
  }

  /* -- 连接测试 -- */
  const handleTestConnection = (name: string) => {
    setTestResults(prev => ({ ...prev, [name]: 'testing' }))
    setTimeout(() => {
      const platform = platforms.find(p => p.name === name)
      setTestResults(prev => ({ ...prev, [name]: platform?.connected ? 'success' : 'fail' }))
      setTimeout(() => setTestResults(prev => ({ ...prev, [name]: 'idle' })), 3000)
    }, 1500)
  }

  /* -- 手动同步 -- */
  const handleSync = (name: string) => {
    setSyncing(prev => ({ ...prev, [name]: true }))
    setTimeout(() => {
      setSyncing(prev => ({ ...prev, [name]: false }))
      setPlatforms(prev => prev.map(p =>
        p.name === name ? { ...p, lastSync: '刚刚', successRate: Math.min(100, p.successRate + 0.01) } : p
      ))
    }, 2000)
  }

  /* -- 复制字段 -- */
  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  /* -- Webhook事件切换 -- */
  /* -- 平台详情面板 -- */
  const [selectedPlatformDetail, setSelectedPlatformDetail] = useState<string | null>(null)

  const platformDetailData: Record<string, {
    apiCallsToday: number; apiCallsWeek: number; apiCallsMonth: number
    errorRate: number; recentErrors: { code: string; msg: string; time: string }[]
    webhooks: { endpoint: string; status: 'healthy' | 'warn' | 'down' }[]
  }> = {
    '抖音巨量引擎': {
      apiCallsToday: 12450, apiCallsWeek: 86400, apiCallsMonth: 347000,
      errorRate: 0.2,
      recentErrors: [
        { code: '190', msg: 'Invalid OAuth access token', time: '09:48' },
        { code: '17', msg: 'User request limit reached', time: '11:15' },
        { code: '2654', msg: 'Ad account disabled', time: '3/31 16:22' },
        { code: '100', msg: 'Invalid parameter: targeting_spec', time: '3/30 14:10' },
        { code: '368', msg: 'Temporarily blocked, policy violation', time: '3/28 09:33' },
      ],
      webhooks: [
        { endpoint: '/webhook/douyin/campaign', status: 'healthy' },
        { endpoint: '/webhook/douyin/insights', status: 'healthy' },
        { endpoint: '/webhook/douyin/leads', status: 'warn' },
      ],
    },
    '小红书聚光': {
      apiCallsToday: 8920, apiCallsWeek: 62100, apiCallsMonth: 251000,
      errorRate: 0.4,
      recentErrors: [
        { code: '40001', msg: 'Token expired or invalid', time: '14:32' },
        { code: '40100', msg: 'Rate limit exceeded', time: '12:10' },
        { code: '50002', msg: 'Creative audit failed', time: '10:05' },
        { code: '40300', msg: 'Insufficient ad account permissions', time: '3/31 18:44' },
        { code: '40004', msg: 'Budget amount below minimum', time: '3/30 11:20' },
      ],
      webhooks: [
        { endpoint: '/webhook/xhs/note', status: 'healthy' },
        { endpoint: '/webhook/xhs/creative', status: 'warn' },
      ],
    },
    '快手磁力引擎': {
      apiCallsToday: 6780, apiCallsWeek: 47100, apiCallsMonth: 189000,
      errorRate: 0.1,
      recentErrors: [
        { code: 'AUTHENTICATION_ERROR', msg: 'OAuth token expired', time: '09:48' },
        { code: 'BUDGET_ERROR', msg: 'Campaign budget too low', time: '3/31 15:30' },
        { code: 'KEYWORD_ERROR', msg: 'Keyword too long or invalid', time: '3/30 10:12' },
        { code: 'QUOTA_ERROR', msg: 'Quota exceeded for the day', time: '3/29 17:55' },
        { code: 'INTERNAL_ERROR', msg: 'Temporary API service error', time: '3/27 22:10' },
      ],
      webhooks: [
        { endpoint: '/webhook/kuaishou/campaign', status: 'healthy' },
        { endpoint: '/webhook/kuaishou/conversion', status: 'healthy' },
      ],
    },
    '天猫品销宝': {
      apiCallsToday: 0, apiCallsWeek: 0, apiCallsMonth: 0,
      errorRate: 0,
      recentErrors: [],
      webhooks: [],
    },
    '京东京准通': {
      apiCallsToday: 0, apiCallsWeek: 0, apiCallsMonth: 0,
      errorRate: 0,
      recentErrors: [],
      webhooks: [],
    },
    '抖音DOU+': {
      apiCallsToday: 1890, apiCallsWeek: 13100, apiCallsMonth: 52800,
      errorRate: 0.1,
      recentErrors: [
        { code: 'UNAUTHORIZED', msg: 'API certificate expired', time: '3/30 08:20' },
        { code: 'RATE_LIMIT', msg: 'Too many requests per second', time: '3/28 14:05' },
        { code: 'CAMPAIGN_NOT_FOUND', msg: 'Campaign ID does not exist', time: '3/25 11:40' },
        { code: 'BUDGET_EXHAUSTED', msg: 'Daily budget cap reached', time: '3/22 23:59' },
        { code: 'BID_TOO_LOW', msg: 'CPT bid below minimum threshold', time: '3/20 10:30' },
      ],
      webhooks: [
        { endpoint: '/webhook/douplus/heat', status: 'healthy' },
        { endpoint: '/webhook/douplus/budget', status: 'healthy' },
        { endpoint: '/webhook/douplus/follower', status: 'healthy' },
      ],
    },
    'Meta Ads (Facebook · Instagram)': {
      apiCallsToday: 9240, apiCallsWeek: 64600, apiCallsMonth: 259000,
      errorRate: 0.7,
      recentErrors: [
        { code: '190', msg: 'Invalid OAuth access token (expired)', time: '13:24' },
        { code: '17', msg: 'User request limit reached (rate throttle)', time: '10:52' },
        { code: '2654', msg: 'Ad account temporarily disabled', time: '3/31 17:08' },
        { code: '294', msg: 'Managing Pages Not Allowed', time: '3/30 09:44' },
        { code: '368', msg: 'Temporarily blocked for policy violation', time: '3/28 11:20' },
      ],
      webhooks: [
        { endpoint: '/webhook/meta/campaign', status: 'healthy' },
        { endpoint: '/webhook/meta/pixel', status: 'healthy' },
        { endpoint: '/webhook/meta/leads', status: 'warn' },
      ],
    },
    'TikTok for Business': {
      apiCallsToday: 6180, apiCallsWeek: 43200, apiCallsMonth: 173000,
      errorRate: 1.2,
      recentErrors: [
        { code: '40100', msg: 'Access token expired or invalid', time: '15:03' },
        { code: '40200', msg: 'Rate limit exceeded for advertiser', time: '11:47' },
        { code: '50002', msg: 'Creative material audit rejected', time: '09:18' },
        { code: '40300', msg: 'Insufficient account permissions', time: '3/31 14:55' },
        { code: '50010', msg: 'Campaign budget below minimum threshold', time: '3/30 10:30' },
      ],
      webhooks: [
        { endpoint: '/webhook/tiktok-global/campaign', status: 'healthy' },
        { endpoint: '/webhook/tiktok-global/creative', status: 'healthy' },
        { endpoint: '/webhook/tiktok-global/creator', status: 'warn' },
      ],
    },
    'Google Ads · YouTube': {
      apiCallsToday: 7560, apiCallsWeek: 52800, apiCallsMonth: 211000,
      errorRate: 0.5,
      recentErrors: [
        { code: 'OAUTH_TOKEN_EXPIRED', msg: 'OAuth refresh token has expired', time: '12:30' },
        { code: 'CUSTOMER_NOT_FOUND', msg: 'Customer ID not found in hierarchy', time: '3/31 16:40' },
        { code: 'QUOTA_ERROR', msg: 'Quota exceeded for GetCampaigns', time: '3/30 08:15' },
        { code: 'POLICY_VIOLATION', msg: 'Ad creative violates advertising policies', time: '3/28 14:22' },
        { code: 'BID_TOO_LOW', msg: 'Bid below first-page CPC estimate', time: '3/27 09:55' },
      ],
      webhooks: [
        { endpoint: '/webhook/google/campaign', status: 'healthy' },
        { endpoint: '/webhook/google/conversion', status: 'healthy' },
        { endpoint: '/webhook/google/pmax', status: 'healthy' },
      ],
    },
    'Amazon Ads': {
      apiCallsToday: 0, apiCallsWeek: 0, apiCallsMonth: 0,
      errorRate: 0,
      recentErrors: [],
      webhooks: [],
    },
    'Pinterest Ads': {
      apiCallsToday: 0, apiCallsWeek: 0, apiCallsMonth: 0,
      errorRate: 0,
      recentErrors: [],
      webhooks: [],
    },
    'Snapchat Ads': {
      apiCallsToday: 0, apiCallsWeek: 0, apiCallsMonth: 0,
      errorRate: 0,
      recentErrors: [],
      webhooks: [],
    },
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
  }

  const toggleWebhookEvent = (platformName: string, event: string) => {
    setPlatforms(prev => prev.map(p => {
      if (p.name !== platformName) return p
      const events = p.webhookEvents.includes(event)
        ? p.webhookEvents.filter(e => e !== event)
        : [...p.webhookEvents, event]
      return { ...p, webhookEvents: events }
    }))
  }

  /* -- 同步间隔修改 -- */
  const updateSyncInterval = (name: string, interval: number) => {
    setPlatforms(prev => prev.map(p =>
      p.name === name ? { ...p, syncInterval: interval } : p
    ))
  }

  const tabs = ['平台连接管理', 'API操作统计', '同步监控', '平台规则适配']
  const connectedCount = platforms.filter(p => p.connected).length
  const domesticConnected = platforms.filter(p => p.region === '国内' && p.connected).length
  const domesticTotal = platforms.filter(p => p.region === '国内').length
  const intlConnected = platforms.filter(p => p.region === '国际' && p.connected).length
  const intlTotal = platforms.filter(p => p.region === '国际').length
  const filteredPlatforms = regionFilter === '全部' ? platforms : platforms.filter(p => p.region === regionFilter)

  // ── AI Config Registration ──
  const aiGroups: AIConfigGroup[] = [
    {
      title: 'API连接管理',
      icon: <Globe size={18} />,
      params: [
        createParam('api_timeout', 'API请求超时时间', 30, '秒', 'API请求的最大等待时间', 15, 87),
        createParam('api_retry_limit', '重试次数上限', 3, '次', 'API请求失败后最大重试次数', 5, 84),
        createParam('api_concurrency_limit', '并发连接数上限', 100, '个', '同时发起的API连接数上限', 200, 82),
        createParam('api_degrade_strategy', '降级策略', '关闭', '', 'API异常时的降级处理策略', 'AI自适应', 89, { options: ['关闭', '限流', '熔断', 'AI自适应'] }),
      ],
    },
    {
      title: '数据同步',
      icon: <RefreshCw size={18} />,
      params: [
        createParam('realtime_sync_delay', '实时数据同步延迟上限', 60, '秒', '实时数据同步的最大允许延迟', 30, 86),
        createParam('full_sync_interval', '全量同步周期', 24, '小时', '全量数据同步的执行周期', 12, 83),
        createParam('consistency_check_freq', '数据一致性检查频率', 6, '小时', '数据一致性校验的执行频率', 3, 85),
        createParam('auto_data_repair', '异常数据自动修复', '关闭', '', '检测到数据异常时的自动修复策略', 'AI全自动', 88, { options: ['关闭', '仅告警', '半自动', 'AI全自动'] }),
      ],
    },
    {
      title: '成本与配额',
      icon: <DollarSign size={18} />,
      params: [
        createParam('api_daily_budget', 'API调用日预算上限', 5000, '¥', '每日API调用费用预算上限', 8000, 80),
        createParam('rate_limit_margin', '速率限制安全余量', 20, '%', '距离平台速率限制的安全余量百分比', 30, 84),
        createParam('inefficient_api_optimize', '低效API自动优化', '关闭', '', '自动识别并优化低效API调用', 'AI优化', 86, { options: ['关闭', '建议', '半自动', 'AI优化'] }),
        createParam('platform_weight_alloc', '平台权重自动分配', '均匀', '', '多平台间的流量和预算权重分配策略', 'AI动态', 90, { options: ['均匀', '效果加权', 'ROI加权', 'AI动态'] }),
      ],
    },
  ]

  const learningStatus: AILearningStatus = {
    modelVersion: 'v1.8.0-platform',
    lastTraining: '3小时前',
    totalDataPoints: 135000,
    avgConfidence: 85,
    autoAdjustCount24h: 78,
    learningRate: '0.001 (AdamW)',
    nextTraining: '5小时后',
    improvementRate: '+7.2%',
  }

  useRegisterAIConfig(aiGroups, learningStatus, '平台API中心')

  return (
    <>
      {/* ══ Platform Toast ══ */}
      {platformToast.visible && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          color: '#fff', padding: '12px 24px', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
          fontSize: 14, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
          maxWidth: 420,
          animation: 'fadeInUp 0.3s ease',
        }}>
          {platformToast.message}
        </div>
      )}
      {/* ══ Platform Detail Slide-over ══ */}
      {selectedPlatformDetail && (() => {
        const p = platforms.find(pp => pp.name === selectedPlatformDetail)!
        const detail = platformDetailData[selectedPlatformDetail]
        return (
          <div style={overlayStyle} onClick={() => setSelectedPlatformDetail(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 480, height: '100vh', background: 'var(--bg-card)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${p.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Globe size={22} color={p.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.api}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedPlatformDetail(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)', padding: 4 }}>✕</button>
              </div>

              {/* Connection Status */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>连接状态</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: '状态', value: p.connected ? '已连接' : '未连接', color: p.connected ? '#22c55e' : '#94a3b8' },
                    { label: '延迟', value: p.connected ? `${p.latency}ms` : '-', color: p.latency < 20 ? '#22c55e' : p.latency < 50 ? '#fbbf24' : '#ef4444' },
                    { label: 'Token有效期', value: p.connected ? `${p.tokenDays}天` : '-', color: p.tokenDays > 14 ? '#22c55e' : '#fbbf24' },
                    { label: '成功率', value: p.connected ? `${p.successRate}%` : '-', color: '#22c55e' },
                    { label: 'API版本', value: p.api.split(' ').slice(-1)[0], color: 'var(--text-primary)' },
                    { label: '最后同步', value: p.lastSync, color: 'var(--text-secondary)' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Call Volume */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>API调用量</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: '今日', value: detail.apiCallsToday.toLocaleString() },
                    { label: '本周', value: detail.apiCallsWeek.toLocaleString() },
                    { label: '本月', value: detail.apiCallsMonth.toLocaleString() },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '12px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{p.connected ? item.value : '-'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>错误率</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: detail.errorRate < 0.5 ? '#22c55e' : '#ef4444' }}>{p.connected ? `${detail.errorRate}%` : '-'}</span>
                </div>
              </div>

              {/* Rate Limit */}
              {p.connected && (
                <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>速率限制</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>已用 / 总量</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{100 - p.rateRemain}% / 100%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${100 - p.rateRemain}%`, background: p.rateRemain > 30 ? 'var(--accent-primary)' : '#ef4444', borderRadius: 4, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>剩余配额 {p.rateRemain}%</div>
                </div>
              )}

              {/* Webhook Endpoints */}
              {p.connected && detail.webhooks.length > 0 && (
                <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Webhook端点</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {detail.webhooks.map(wh => (
                      <div key={wh.endpoint} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{wh.endpoint}</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                          background: wh.status === 'healthy' ? 'rgba(34,197,94,0.12)' : wh.status === 'warn' ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)',
                          color: wh.status === 'healthy' ? '#22c55e' : wh.status === 'warn' ? '#fbbf24' : '#ef4444' }}>
                          {wh.status === 'healthy' ? '正常' : wh.status === 'warn' ? '延迟' : '异常'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent API Errors */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>近期API错误 (最近5条)</div>
                {!p.connected || detail.recentErrors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.connected ? '暂无错误记录' : '平台未连接'}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {detail.recentErrors.map((err, i) => (
                      <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)', borderLeft: '3px solid #ef4444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}>ERR {err.code}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{err.time}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{err.msg}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 4 }}>
                {p.connected ? (
                  <>
                    <button style={btnOutline} onClick={() => { handleTestConnection(p.name); setSelectedPlatformDetail(null) }}>
                      <TestTube size={13} /> 测试连接
                    </button>
                    <button style={btnOutline} onClick={() => { handleSync(p.name); setSelectedPlatformDetail(null) }}>
                      <RefreshCw size={13} /> 手动同步
                    </button>
                    <button style={btnOutline} onClick={() => { handleRefreshToken(p.name); setSelectedPlatformDetail(null) }}>
                      <RotateCcw size={13} /> 刷新Token
                    </button>
                    <button style={btnOutline} onClick={() => window.open(platformConsoleUrls[p.name], '_blank')}>
                      <ExternalLink size={13} /> 查看文档
                    </button>
                  </>
                ) : (
                  <button style={btnPrimary} onClick={() => { handleConnect(p.name); setSelectedPlatformDetail(null) }}>
                    <Link2 size={13} /> 连接平台
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>平台API集成中心</h2>
            <p>国内 + 国际广告平台统一接入 · OAuth授权 · API密钥 · Webhook · 同步控制</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              {connectedCount}/{platforms.length} 已连接
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(232,54,93,0.08)', color: '#e8365d', fontSize: '0.78rem', fontWeight: 600 }}>
              🇨🇳 国内 {domesticConnected}/{domesticTotal}
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(59,130,246,0.08)', color: '#3b82f6', fontSize: '0.78rem', fontWeight: 600 }}>
              🌍 国际 {intlConnected}/{intlTotal}
            </div>
          </div>
        </div>
      </div>
      <div className="page-content">

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="MetaCAPI-Attribution" color="#e8365d" />
          <ModelBadge name="AnomalyDetector-LSTM" color="#e8365d" />
        </div>

        {/* 标签页 */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          {tabs.map((t, i) => (
            <div key={t} className={`tab${activeTab === i ? ' active' : ''}`} onClick={() => setActiveTab(i)}>{t}</div>
          ))}
        </div>

        {/* 国内 / 国际 筛选 */}
        {(activeTab === 0 || activeTab === 3) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['全部', '国内', '国际'] as const).map(r => (
              <button key={r} onClick={() => setRegionFilter(r)} style={{
                padding: '5px 16px', borderRadius: 20, cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                background: regionFilter === r
                  ? (r === '国内' ? '#e8365d' : r === '国际' ? '#3b82f6' : 'var(--accent-primary)')
                  : 'var(--bg-card)',
                color: regionFilter === r ? '#fff' : 'var(--text-muted)',
                border: regionFilter === r ? 'none' : '1px solid var(--border)',
              }}>
                {r === '国内' ? '🇨🇳 国内平台' : r === '国际' ? '🌍 国际平台' : '全部平台'}
              </button>
            ))}
          </div>
        )}

        {/* ════ Tab 0: 平台连接管理 ════ */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredPlatforms.map((p) => {
              const expanded = expandedPlatform === p.name
              const testState = testResults[p.name] || 'idle'
              return (
                <div key={p.name} style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${p.region === '国际' ? 'rgba(59,130,246,0.2)' : 'var(--border)'}`,
                  borderRadius: 12, overflow: 'hidden',
                }}>
                  {/* 平台卡片头部 */}
                  <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                      onClick={() => setSelectedPlatformDetail(p.name)}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={20} color={p.color} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{p.name}</span>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                            background: p.region === '国际' ? 'rgba(59,130,246,0.12)' : 'rgba(232,54,93,0.08)',
                            color: p.region === '国际' ? '#3b82f6' : '#e8365d',
                          }}>{p.region === '国际' ? '🌍 国际' : '🇨🇳 国内'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.api}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.connected ? '#22c55e' : '#94a3b8', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.78rem', color: p.connected ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>
                          {p.connected ? '已连接' : '未连接'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.connected && (
                        <>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 8 }}>
                            延迟 {p.latency}ms · 调用 {p.calls.toLocaleString()}/日 · Token {p.tokenDays}天
                          </div>
                          <button style={btnSmall} onClick={() => handleTestConnection(p.name)}>
                            {testState === 'testing' && <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> 测试中...</>}
                            {testState === 'success' && <><CheckCircle size={12} color="#22c55e" /> 连通正常</>}
                            {testState === 'fail' && <><XCircle size={12} color="#ef4444" /> 连接失败</>}
                            {testState === 'idle' && <><TestTube size={12} /> 测试连接</>}
                          </button>
                          <button style={btnSmall} onClick={() => handleSync(p.name)}>
                            {syncing[p.name]
                              ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> 同步中</>
                              : <><RefreshCw size={12} /> 手动同步</>}
                          </button>
                          <button style={btnDanger} onClick={() => handleDisconnect(p.name)}>
                            <Unlink size={12} /> 断开
                          </button>
                        </>
                      )}
                      {!p.connected && (
                        <button style={btnPrimary} onClick={() => handleConnect(p.name)}>
                          <Link2 size={14} /> 连接平台
                        </button>
                      )}
                      <button
                        style={{ ...btnSmall, background: expanded ? 'var(--rose-100)' : 'var(--rose-50)' }}
                        onClick={() => setExpandedPlatform(expanded ? null : p.name)}
                      >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expanded ? '收起' : '详情'}
                      </button>
                    </div>
                  </div>

                  {/* 展开详情面板 */}
                  {expanded && p.connected && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>

                        {/* 左: API密钥 */}
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                            <Key size={14} /> API密钥配置
                          </div>
                          {[
                            { label: 'App ID', key: 'appId', value: p.appId },
                            { label: 'App Secret', key: 'appSecret', value: p.appSecret },
                            { label: 'Access Token', key: 'accessToken', value: p.accessToken },
                          ].map(f => (
                            <div key={f.key} style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <div style={{ ...inputStyle, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span>{showSecrets[`${p.name}_${f.key}`] ? f.value.replace(/•/g, Math.random().toString(36).slice(2, 3)) : f.value}</span>
                                  <button
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                                    onClick={() => setShowSecrets(prev => ({ ...prev, [`${p.name}_${f.key}`]: !prev[`${p.name}_${f.key}`] }))}
                                  >
                                    {showSecrets[`${p.name}_${f.key}`] ? <EyeOff size={14} color="var(--text-muted)" /> : <Eye size={14} color="var(--text-muted)" />}
                                  </button>
                                </div>
                                <button
                                  style={btnSmall}
                                  onClick={() => handleCopy(`${p.name}_${f.key}`, f.value)}
                                >
                                  {copiedField === `${p.name}_${f.key}` ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <button style={btnOutline} onClick={() => handleOpenManualConfig(p.name)}>
                              <Key size={12} /> 修改密钥
                            </button>
                            <button
                              style={{ ...btnOutline, opacity: refreshingToken[p.name] ? 0.6 : 1 }}
                              onClick={() => handleRefreshToken(p.name)}
                              disabled={refreshingToken[p.name]}
                            >
                              {refreshingToken[p.name]
                                ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> 刷新中...</>
                                : tokenRefreshResult[p.name] === 'success'
                                  ? <><CheckCircle size={12} color="#22c55e" /> 已刷新(30天)</>
                                  : <><RotateCcw size={12} /> 刷新Token</>}
                            </button>
                            <button style={btnOutline} onClick={() => window.open(platformConsoleUrls[p.name], '_blank')}>
                              <ExternalLink size={12} /> 平台控制台
                            </button>
                          </div>
                          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              onClick={() => setPlatforms(prev => prev.map(pp => pp.name === p.name ? { ...pp, autoRefreshToken: !pp.autoRefreshToken } : pp))}
                              style={{
                                width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                                background: p.autoRefreshToken ? 'var(--accent-primary)' : 'var(--border)',
                                position: 'relative', transition: 'background 0.2s',
                              }}
                            >
                              <div style={{
                                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                position: 'absolute', top: 2, transition: 'left 0.2s',
                                left: p.autoRefreshToken ? 18 : 2,
                              }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Token到期自动刷新</span>
                          </div>
                        </div>

                        {/* 右: Webhook & 同步 */}
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                            <Webhook size={14} /> Webhook & 同步设置
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>回调URL</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <input style={{ ...inputStyle, flex: 1 }} value={p.webhookUrl} readOnly />
                              <button style={btnSmall} onClick={() => handleCopy(`${p.name}_webhook`, p.webhookUrl)}>
                                {copiedField === `${p.name}_webhook` ? <Check size={12} color="#22c55e" /> : <Copy size={12} />}
                              </button>
                            </div>
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>订阅事件</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {(allWebhookEvents[p.name] || []).map(evt => {
                                const active = p.webhookEvents.includes(evt)
                                return (
                                  <button
                                    key={evt}
                                    onClick={() => toggleWebhookEvent(p.name, evt)}
                                    style={{
                                      padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 500,
                                      border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border)'}`,
                                      background: active ? 'var(--rose-50)' : 'transparent',
                                      color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {active && <Check size={10} style={{ marginRight: 3 }} />}
                                    {evt}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>同步频率</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {[1, 5, 10, 15, 30].map(min => (
                                <button
                                  key={min}
                                  onClick={() => updateSyncInterval(p.name, min)}
                                  style={{
                                    padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                                    border: `1px solid ${p.syncInterval === min ? 'var(--accent-primary)' : 'var(--border)'}`,
                                    background: p.syncInterval === min ? 'var(--rose-50)' : 'transparent',
                                    color: p.syncInterval === min ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {min}min
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                              <span>上次同步</span><span style={{ color: 'var(--text-primary)' }}>{p.lastSync}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: 6 }}>
                              <span>同步成功率</span><span style={{ color: '#22c55e' }}>{p.successRate}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: 6 }}>
                              <span>限频余量</span>
                              <span style={{ color: p.rateRemain > 80 ? '#22c55e' : '#f59e0b' }}>{p.rateRemain}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 未连接展开 */}
                  {expanded && !p.connected && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                        <Globe size={32} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                          {p.name} 尚未连接
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                          点击下方按钮通过OAuth授权连接，或手动配置API密钥
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                          <button style={btnPrimary} onClick={() => handleConnect(p.name)}>
                            <Link2 size={14} /> OAuth授权连接
                          </button>
                          <button style={btnOutline} onClick={() => handleOpenManualConfig(p.name)}>
                            <Key size={14} /> 手动配置密钥
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ════ Tab 1: API操作统计 ════ */}
        {activeTab === 1 && (
          <>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={18} /> AI通过API自动操作统计（今日）
              </div>
              <div className="grid-3" style={{ marginBottom: 24 }}>
                {opsStats.map((s) => (
                  <div key={s.label} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'opsKpi', data: s })}>
                    <div className="card-title"><s.icon size={14} color={s.color} /> {s.label}</div>
                    <div className="card-value" style={{ color: s.color }}>{s.value}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 2 }}>次</span></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.detail}</div>
                  </div>
                ))}
              </div>
              <div className="section-title" style={{ marginBottom: 12 }}>各平台今日API操作分布</div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={apiOpsDistribution}>
                    <XAxis dataKey="platform" tick={{ fill: '#9b8cb8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9b8cb8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="建计划" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="调出价" stackId="a" fill="#10b981" />
                    <Bar dataKey="关停" stackId="a" fill="#ef4444" />
                    <Bar dataKey="素材同步" stackId="a" fill="#ff9eb5" />
                    <Bar dataKey="受众更新" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="预算调整" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ════ Tab 2: 同步监控 ════ */}
        {activeTab === 2 && (
          <>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} /> 实时同步状态
              </div>
              <div className="grid-3" style={{ marginBottom: 20 }}>
                {platforms.filter(p => p.connected).map((p) => (
                  <div key={p.name} className="card" style={{ cursor: 'pointer', borderColor: p.region === '国际' ? 'rgba(59,130,246,0.2)' : undefined }} onClick={() => setSelectedDetail({ type: 'platformApi', data: p })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8, marginTop: 3, display: 'inline-block',
                          background: p.region === '国际' ? 'rgba(59,130,246,0.12)' : 'rgba(232,54,93,0.08)',
                          color: p.region === '国际' ? '#3b82f6' : '#e8365d',
                        }}>{p.region === '国际' ? '🌍 国际' : '🇨🇳 国内'}</span>
                      </div>
                      <button
                        style={btnSmall}
                        onClick={() => handleSync(p.name)}
                      >
                        {syncing[p.name]
                          ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> 同步中</>
                          : <><RefreshCw size={12} /> 同步</>}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>上次同步</span>
                      <span style={{ color: 'var(--text-primary)' }}>{p.lastSync}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>成功率</span>
                      <span style={{ color: '#22c55e' }}>{p.successRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>同步频率</span>
                      <span style={{ color: 'var(--accent-primary)' }}>每{p.syncInterval}分钟</span>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>限频余量</span>
                        <span style={{ color: p.rateRemain > 80 ? '#22c55e' : '#f59e0b' }}>{p.rateRemain}%</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${p.rateRemain}%`, background: p.rateRemain > 80 ? '#22c55e' : '#f59e0b', borderRadius: 2, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> 异常同步日志
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {failedSyncs.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, fontSize: '0.78rem', cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'syncError', data: f })}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 60 }}>{f.time}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                      background: f.region === '国际' ? 'rgba(59,130,246,0.12)' : 'rgba(232,54,93,0.08)',
                      color: f.region === '国际' ? '#3b82f6' : '#e8365d',
                      whiteSpace: 'nowrap',
                    }}>{f.region === '国际' ? '🌍' : '🇨🇳'} {f.region}</span>
                    <span style={{ color: 'var(--text-primary)', minWidth: 90, fontWeight: 600 }}>{f.platform}</span>
                    <span style={{ color: 'var(--text-muted)', minWidth: 70 }}>{f.type}</span>
                    <span style={{ color: '#f87171', minWidth: 100 }}>{f.error}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', marginLeft: 'auto' }}>
                      <Check size={12} /> {f.retry}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.78rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Check size={14} /> 数据一致性检查：计划数同步一致 · 预算同步状态正常 · 无数据漂移
              </div>
            </div>
          </>
        )}

        {/* ════ Tab 3: 平台规则适配 ════ */}
        {activeTab === 3 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} /> 平台特性适配（AI自动遵循规则）
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>平台</th>
                  <th>区域</th>
                  <th>平台规则/限制</th>
                  <th>AI适配策略</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {platformRules
                  .filter(r => regionFilter === '全部' || r.region === regionFilter)
                  .map((r, i) => {
                    const connected = platforms.find(p => p.name === r.platform)?.connected
                    return (
                      <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'platformRule', data: r })}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{r.platform}</td>
                        <td>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                            background: r.region === '国际' ? 'rgba(59,130,246,0.12)' : 'rgba(232,54,93,0.08)',
                            color: r.region === '国际' ? '#3b82f6' : '#e8365d',
                          }}>{r.region === '国际' ? '🌍 国际' : '🇨🇳 国内'}</span>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.rules}</td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>{r.ai}</td>
                        <td>
                          <span className={`status-badge ${connected ? 'running' : 'idle'}`}>
                            {connected ? '已启用' : '未连接'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ══ OAuth连接弹窗 ══ */}
      {connectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => { setConnectModal(null); setConnectStep(0) }}>
          <div
            style={{
              background: 'var(--bg-card)', borderRadius: 16, padding: 32, width: 480,
              maxHeight: '85vh', overflowY: 'auto',
              border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              连接 {connectModal}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
              通过OAuth 2.0安全授权，无需手动输入密钥
            </div>

            {/* 步骤指示器 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['选择授权方式', '平台授权', '获取凭证', '连接完成'].map((s, i) => (
                <div key={s} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    background: connectStep >= i ? 'var(--accent-primary)' : 'var(--border-light)',
                    color: connectStep >= i ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.3s',
                  }}>
                    {connectStep > i ? <Check size={14} /> : i + 1}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: connectStep >= i ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</div>
                </div>
              ))}
            </div>

            {connectStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.85rem' }} onClick={handleOAuthStart}>
                  <ExternalLink size={16} /> 前往 {connectModal} 授权页面
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  将跳转至 {connectModal} 官方页面完成授权
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16, marginTop: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>授权范围</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['广告管理', '数据读取', '素材管理', '受众管理', '报告下载'].map(s => (
                      <span key={s} style={{ padding: '3px 10px', borderRadius: 12, background: 'rgba(232,54,93,0.08)', color: 'var(--accent-primary)', fontSize: '0.7rem' }}>
                        <Shield size={10} style={{ marginRight: 3 }} />{s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {connectStep === 1 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Loader size={32} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>正在跳转至 {connectModal}...</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>请在弹出窗口中完成授权</div>
              </div>
            )}

            {connectStep === 2 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Loader size={32} color="#22c55e" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>授权成功，正在获取Access Token...</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>正在交换authorization_code</div>
              </div>
            )}

            {connectStep === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={40} color="#22c55e" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>连接成功！</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  {connectModal} API已就绪，Token有效期30天，已启用自动刷新
                </div>
                <button style={{ ...btnPrimary, justifyContent: 'center', padding: '10px 24px' }} onClick={() => { setConnectModal(null); setConnectStep(0) }}>
                  <Check size={14} /> 完成
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ 手动配置密钥弹窗 ══ */}
      {manualConfigModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setManualConfigModal(null)}>
          <div
            style={{
              background: 'var(--bg-card)', borderRadius: 16, padding: 32, width: 520,
              maxHeight: '85vh', overflowY: 'auto',
              border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Key size={20} color="var(--accent-primary)" />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                手动配置 {manualConfigModal}
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
              在平台开发者后台获取API凭证，填入以下字段完成连接
            </div>

            {/* 平台开发者后台链接 */}
            <div style={{ padding: '10px 14px', background: 'rgba(232,54,93,0.08)', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                前往 <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{manualConfigModal}</span> 开发者后台获取凭证
              </div>
              <button style={btnSmall} onClick={() => {
                const url = platformConsoleUrls[manualConfigModal ?? '']
                showPlatformToast(`🔗 正在跳转至 ${manualConfigModal} 后台... (${url ?? '暂无链接'})`)
                if (url) window.open(url, '_blank', 'noopener,noreferrer')
              }}>
                <ExternalLink size={12} /> 打开后台
              </button>
            </div>

            {/* 表单字段 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* App ID */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  App ID <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <input
                  style={inputStyle}
                  placeholder="输入平台分配的App ID / Client ID"
                  value={manualForm.appId}
                  onChange={(e) => setManualForm(prev => ({ ...prev, appId: e.target.value }))}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  在{manualConfigModal}开发者后台 → 应用管理 → 基本信息中获取
                </div>
              </div>

              {/* App Secret */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  App Secret <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type={manualShowSecrets.secret ? 'text' : 'password'}
                    placeholder="输入App Secret / Client Secret"
                    value={manualForm.appSecret}
                    onChange={(e) => setManualForm(prev => ({ ...prev, appSecret: e.target.value }))}
                  />
                  <button style={btnSmall} onClick={() => setManualShowSecrets(prev => ({ ...prev, secret: !prev.secret }))}>
                    {manualShowSecrets.secret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Access Token */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Access Token <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    type={manualShowSecrets.token ? 'text' : 'password'}
                    placeholder="输入长期Access Token / Bearer Token"
                    value={manualForm.accessToken}
                    onChange={(e) => setManualForm(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                  <button style={btnSmall} onClick={() => setManualShowSecrets(prev => ({ ...prev, token: !prev.token }))}>
                    {manualShowSecrets.token ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  需要具备广告管理、数据读取、素材管理等权限
                </div>
              </div>

              {/* Webhook URL (可选) */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Webhook回调URL <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>（可选）</span>
                </div>
                <input
                  style={inputStyle}
                  placeholder="https://api.mariedalgar.com/webhook/..."
                  value={manualForm.webhookUrl}
                  onChange={(e) => setManualForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  用于接收平台推送的状态变更通知，留空将使用默认地址
                </div>
              </div>
            </div>

            {/* 测试连接结果 */}
            {manualTestState === 'success' && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.78rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={14} /> API连通性验证通过 · 权限检查正常 · Token有效
              </div>
            )}
            {manualTestState === 'fail' && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={14} /> 连接失败：请检查App ID和App Secret是否正确填写
              </div>
            )}

            {/* 安全提示 */}
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-light)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} color="var(--accent-primary)" />
              所有密钥均使用AES-256加密存储，传输过程采用TLS 1.3，仅授权服务可访问
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button style={btnOutline} onClick={() => setManualConfigModal(null)}>
                取消
              </button>
              <button
                style={{ ...btnOutline, opacity: (!manualForm.appId || !manualForm.appSecret) ? 0.5 : 1 }}
                onClick={handleManualTest}
                disabled={!manualForm.appId || !manualForm.appSecret}
              >
                {manualTestState === 'testing'
                  ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> 测试中...</>
                  : <><TestTube size={12} /> 测试连接</>}
              </button>
              <button
                style={{
                  ...btnPrimary,
                  opacity: (!manualForm.appId || !manualForm.appSecret || !manualForm.accessToken) ? 0.5 : 1,
                }}
                onClick={handleManualSave}
                disabled={!manualForm.appId || !manualForm.appSecret || !manualForm.accessToken}
              >
                <Check size={14} /> 保存并连接
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS动画 */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {selectedDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(46,16,101,0.18)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          paddingTop: 80,
        }} onClick={() => setSelectedDetail(null)}>
          <div style={{
            width: 720, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            background: 'var(--bg-primary)', borderRadius: 16,
            border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(46,16,101,0.15)',
            padding: 24,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>详情</h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'platformApi' && (() => {
              const d = selectedDetail.data as PlatformConfig
              const detail = platformDetailData[d.name]
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: d.color }}>{d.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{d.api} · 延迟 {d.latency}ms · Token {d.tokenDays}天有效</div>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Endpoint列表</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { endpoint: `/api/${d.name.toLowerCase().replace(/\s+/g, '')}/campaigns`, method: 'GET/POST', latency: `${d.latency}ms` },
                      { endpoint: `/api/${d.name.toLowerCase().replace(/\s+/g, '')}/adsets`, method: 'GET/POST', latency: `${d.latency + 3}ms` },
                      { endpoint: `/api/${d.name.toLowerCase().replace(/\s+/g, '')}/ads`, method: 'GET/POST/PUT', latency: `${d.latency + 5}ms` },
                      { endpoint: `/api/${d.name.toLowerCase().replace(/\s+/g, '')}/insights`, method: 'GET', latency: `${d.latency + 8}ms` },
                      { endpoint: `/api/${d.name.toLowerCase().replace(/\s+/g, '')}/creatives`, method: 'GET/POST', latency: `${d.latency + 2}ms` },
                    ].map(ep => (
                      <div key={ep.endpoint} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{ep.endpoint}</span>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>{ep.method}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ep.latency}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>延迟分析 (按Endpoint)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[{ label: 'campaigns', value: `${d.latency}ms` }, { label: 'adsets', value: `${d.latency + 3}ms` }, { label: 'ads', value: `${d.latency + 5}ms` }, { label: 'insights', value: `${d.latency + 8}ms` }, { label: 'creatives', value: `${d.latency + 2}ms` }, { label: '平均', value: `${d.latency + 4}ms` }].map(item => (
                      <div key={item.label} style={{ padding: 8, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: Number(item.value.replace('ms', '')) < 20 ? '#22c55e' : '#fbbf24' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>错误日志 (近期)</div>
                  {detail && detail.recentErrors.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {detail.recentErrors.map((err, i) => (
                        <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)', borderLeft: '3px solid #ef4444' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}>ERR {err.code}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{err.time}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{err.msg}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>暂无错误记录</div>
                  )}

                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>速率限制状态</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)' }}>配额使用率</span>
                      <span style={{ fontWeight: 700, color: d.rateRemain > 30 ? '#22c55e' : '#ef4444' }}>{100 - d.rateRemain}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${100 - d.rateRemain}%`, background: d.rateRemain > 30 ? 'var(--accent-primary)' : '#ef4444', borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>剩余配额 {d.rateRemain}% · 今日调用 {d.calls.toLocaleString()} 次</div>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Token轮换历史</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { time: '3天前', action: 'Token自动刷新', result: '成功', newExpiry: '30天' },
                      { time: '33天前', action: 'Token自动刷新', result: '成功', newExpiry: '30天' },
                      { time: '63天前', action: 'Token手动刷新', result: '成功', newExpiry: '30天' },
                    ].map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)', minWidth: 60 }}>{h.time}</span>
                        <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{h.action}</span>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>{h.result}</span>
                        <span style={{ color: 'var(--text-muted)' }}>有效期 {h.newExpiry}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'opsKpi' && (() => {
              const d = selectedDetail.data as typeof opsStats[0]
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: d.color, marginBottom: 8 }}>{d.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: d.color }}>{d.value}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 4 }}>次</span></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{d.detail}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>各平台分布</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[{ name: '抖音', pct: '35%' }, { name: '小红书', pct: '25%' }, { name: '快手', pct: '18%' }, { name: '天猫', pct: '10%' }, { name: '京东', pct: '7%' }, { name: 'DOU+', pct: '5%' }].map(s => (
                      <div key={s.name} style={{ padding: 8, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.pct}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Endpoint调用统计</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    campaigns: {Math.round(d.value * 0.2)}次 · adsets: {Math.round(d.value * 0.25)}次 · ads: {Math.round(d.value * 0.3)}次 · insights: {Math.round(d.value * 0.15)}次 · creatives: {Math.round(d.value * 0.1)}次
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>延迟分布</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    P50: 12ms · P90: 28ms · P99: 65ms · 平均: 15ms · 最大: 120ms
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'syncError' && (() => {
              const d = selectedDetail.data as typeof failedSyncs[0]
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{d.platform} · 同步异常详情</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>时间 {d.time} · 类型 {d.type} · 错误 {d.error}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>错误日志</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.8, color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                    [{d.time}] ERROR {d.platform}/{d.type}: {d.error}<br/>
                    [{d.time}] RETRY 自动重试中...<br/>
                    [{d.time}] INFO {d.retry}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>速率限制状态</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    {d.error === 'API限频触发' ? '当前速率: 98%已用 · 建议降低同步频率或启用请求队列' : d.error === '鉴权Token过期' ? 'Token已自动刷新 · 新Token有效期30天 · 建议启用Token到期前3天自动刷新' : '网络状态: 已恢复正常 · 建议增加超时时间至30s'}
                  </div>
                  <div style={{ padding: 12, background: 'rgba(34,197,94,0.06)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
                    状态: {d.status === 'resolved' ? '已解决' : '处理中'} · {d.retry}
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'platformRule' && (() => {
              const d = selectedDetail.data as typeof platformRules[0]
              const connected = platforms.find(p => p.name === d.platform)?.connected
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{d.platform} · 平台规则适配详情</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>状态: {connected ? '已启用' : '未连接'}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>平台规则/限制</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {d.rules.split(' · ').map(rule => (
                      <div key={rule} style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {rule}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>AI适配策略</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {d.ai.split(' · ').map(strategy => (
                      <div key={strategy} style={{ padding: '8px 12px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, fontSize: '0.75rem', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                        {strategy}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Endpoint列表</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[`/api/${d.platform.toLowerCase().replace(/\s+/g, '')}/campaigns`, `/api/${d.platform.toLowerCase().replace(/\s+/g, '')}/adsets`, `/api/${d.platform.toLowerCase().replace(/\s+/g, '')}/creatives`].map(ep => (
                      <div key={ep} style={{ padding: '6px 12px', background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {ep}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
