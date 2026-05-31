import { useState } from 'react'
import {
  Radio, Heart, Megaphone, Users, ChevronRight, ChevronLeft, Check,
  Rocket, Sparkles, Star, TrendingUp, Target, Play, Image, Film,
  Monitor, BarChart3, Clock, Shield, Zap, ArrowRight, Eye
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   AI投放向导 —— 玛丽黛佳 (Marie Dalgar) 新手智能投放引导
   ═══════════════════════════════════════════════════════════════ */

const STEPS_CN = ['选择投放目标', 'AI智能选品', 'AI素材策略', 'AI投放策略', '确认发布']
const STEPS_EN = ['Select Goal', 'AI Products', 'AI Creatives', 'AI Strategy', 'Confirm & Launch']

const BRAND = '#e8365d'
const BRAND_LIGHT = '#ff7a95'

// ── Step 1: Business Goals ──

const businessGoals = [
  { id: 'livestream', name: '直播带货', icon: <Radio size={32} />, description: '直播间引流+商品成交，AI优化在线人数和GMV', budgetRange: '¥3,000-¥20,000/日', platforms: '抖音、快手、视频号', aiSuccessRate: 94, region: '国内' as const },
  { id: 'seeding', name: '种草引流', icon: <Heart size={32} />, description: '种草内容→电商转化，AI优化种草到购买全链路', budgetRange: '¥2,000-¥15,000/日', platforms: '小红书、抖音、快手', aiSuccessRate: 91, region: '国内' as const },
  { id: 'brand', name: '品牌曝光', icon: <Megaphone size={32} />, description: '品牌知名度提升，AI优化CPM和品牌搜索量', budgetRange: '¥5,000-¥50,000/日', platforms: '全平台', aiSuccessRate: 88, region: '全球' as const },
  { id: 'private', name: '私域引流', icon: <Users size={32} />, description: '公域流量导入私域，AI优化加微/入群成本', budgetRange: '¥1,000-¥8,000/日', platforms: '微信、抖音、小红书', aiSuccessRate: 86, region: '国内' as const },
  { id: 'overseas', name: '海外拓客', icon: <Monitor size={32} />, description: '开拓美国/东南亚/日本市场，AI优化跨境ROAS与合规', budgetRange: '$500-$5,000/日', platforms: 'Meta · TikTok Global · Google', aiSuccessRate: 83, region: '国际' as const },
]

// ── Step 2: Products by Goal ──

const productsByGoal: Record<string, { id: string; title: string; aiScore: number; tags: string[]; market: string; trend: string; competition: string; reason: string }[]> = {
  livestream: [
    { id: 'p1', title: '唇釉丝绒#105 经典红', aiScore: 96, tags: ['爆款王', '高转化'], market: '全平台', trend: '热度↑↑', competition: '竞品少', reason: '该色号连续3周直播间销量TOP1，转化率8.5%远超均值3.2%，库存充足8,420件' },
    { id: 'p2', title: '玻尿酸精华液 30ml', aiScore: 92, tags: ['明星单品', '高复购'], market: '抖音+小红书', trend: '稳定增长', competition: '竞争中等', reason: '复购率34%行业领先，小红书种草笔记超2万篇，搜索热度持续上升' },
    { id: 'p3', title: '轻透粉底液 自然色', aiScore: 88, tags: ['底妆第一', '新品推'], market: '全平台', trend: '上升中', competition: '竞品多', reason: '新配方上市30天好评率96%，适合春夏换季推广，与竞品价格优势15%' },
    { id: 'p4', title: '十色眼影盘 日落盘', aiScore: 84, tags: ['高客单', '组合装'], market: '抖音+快手', trend: '持续热门', competition: '竞品少', reason: '客单价¥168带动整体客单价提升，适合直播间做限时折扣引爆' },
  ],
  seeding: [
    { id: 's1', title: '烟酰胺面膜 10片装', aiScore: 94, tags: ['成分党最爱', '高传播'], market: '小红书+抖音', trend: '热度↑↑', competition: '竞品少', reason: '烟酰胺成分搜索量月增65%，该品单片成本低适合大量种草试用' },
    { id: 's2', title: '唇釉水光#208 蜜桃色', aiScore: 90, tags: ['新色号', '高颜值'], market: '小红书', trend: '新上升', competition: '竞争中等', reason: '蜜桃色系是本季流行色，包装颜值适合种草开箱，预计UGC传播率高' },
    { id: 's3', title: '卸妆水 500ml', aiScore: 86, tags: ['性价比', '日常刚需'], market: '抖音+快手', trend: '稳定', competition: '竞品多', reason: '500ml大容量高性价比，适合做对比测评类种草内容，转化路径短' },
  ],
  brand: [
    { id: 'b1', title: 'Global Brand Hero Campaign', aiScore: 93, tags: ['Brand Story', 'Awareness'], market: 'US · UK · JP · SEA', trend: 'Brand equity ↑', competition: '-', reason: 'AI analysis: brand search index declined 8% in target markets. Hero video campaign across Meta + YouTube needed to rebuild brand recall and drive upper-funnel demand.' },
    { id: 'b2', title: 'Spring Collection Global Launch', aiScore: 89, tags: ['New Launch', 'Multi-market'], market: 'Meta · TikTok · Google', trend: 'Seasonal window', competition: '-', reason: 'Competitor spring launches dense in April. AI recommends occupying TikTok TopView + Meta Reels in week 1. Pair with 20 micro-influencer seedings across US, UK, JP markets.' },
  ],
  private: [
    { id: 'v1', title: '试用装申领活动', aiScore: 95, tags: ['加微引流', '低门槛'], market: '抖音+小红书', trend: '验证有效', competition: '-', reason: '历史数据：试用装活动加微成本¥3.2/人，远低于行业均值¥8.5/人' },
    { id: 'v2', title: '会员日专属福利', aiScore: 88, tags: ['入群引流', '高粘性'], market: '微信+抖音', trend: '稳定', competition: '-', reason: '会员日转化率比日常高3.2倍，适合引导加入企微社群' },
  ],
  overseas: [
    { id: 'o1', title: 'Velvet Lip Glaze #105 Classic Red', aiScore: 94, tags: ['Hero SKU', 'High Conv.'], market: 'US+UK', trend: 'Trending ↑↑', competition: 'Low', reason: 'Top-performing lip product in Asian beauty niche, TikTok viral potential high. US market CPA $4.2, 3x lower than category avg.' },
    { id: 'o2', title: 'Hyaluronic Serum 30ml', aiScore: 91, tags: ['K-beauty Appeal', 'Repeat Buy'], market: 'US+JP+SG', trend: 'Growing', competition: 'Medium', reason: 'Asian skincare trend rising in US/JP. Instagram Reels engagement 2.8x category avg. Repeat rate 28% in test markets.' },
    { id: 'o3', title: 'Light Foundation – Natural', aiScore: 87, tags: ['New Launch', 'Broad Appeal'], market: 'Global', trend: 'New Entry', competition: 'High', reason: 'Spring launch window. Google Search interest for "lightweight foundation" up 45% YoY in US/UK. Price 20% below Western competitors.' },
  ],
}

// ── Step 3: Creative Formats ──

const creativeFormats = [
  { id: 'video', name: '竖版短视频 9:16', icon: <Play size={24} />, label: '主力素材', count: 8, ctr: 4.8 },
  { id: 'graphic', name: '图文笔记', icon: <Image size={24} />, label: '种草素材', count: 6, ctr: 3.5 },
  { id: 'clip', name: '直播切片', icon: <Film size={24} />, label: '引流素材', count: 4, ctr: 5.2 },
]

const creativeFormatsIntl = [
  { id: 'video', name: 'Vertical Video 9:16', icon: <Play size={24} />, label: 'Hero Creative', count: 8, ctr: 5.1 },
  { id: 'graphic', name: 'Carousel / Image Ads', icon: <Image size={24} />, label: 'Consideration', count: 6, ctr: 3.8 },
  { id: 'clip', name: 'Story Ads', icon: <Film size={24} />, label: 'Retargeting', count: 4, ctr: 4.6 },
]

const styleMix = [
  { name: '产品测评型', pct: 40, color: '#e8365d' },
  { name: '教程教学型', pct: 30, color: '#ff7a95' },
  { name: '种草开箱型', pct: 30, color: '#f59e0b' },
]

const styleMixIntl = [
  { name: 'Product Review', pct: 40, color: '#3b82f6' },
  { name: 'Tutorial / How-to', pct: 35, color: '#0ea5e9' },
  { name: 'Unboxing / UGC', pct: 25, color: '#6366f1' },
]

// ── Step 4: Platform Options ──

const platformOptions = [
  // 国内平台
  { id: 'douyin', name: '抖音巨量', recommended: true, region: '国内' as const },
  { id: 'xiaohongshu', name: '小红书聚光', recommended: true, region: '国内' as const },
  { id: 'kuaishou', name: '快手磁力', recommended: false, region: '国内' as const },
  { id: 'wechat', name: '微信广告', recommended: false, region: '国内' as const },
  // 国际平台
  { id: 'meta', name: 'Meta Ads', recommended: false, region: '国际' as const },
  { id: 'tiktok_global', name: 'TikTok for Business', recommended: false, region: '国际' as const },
  { id: 'google', name: 'Google · YouTube', recommended: false, region: '国际' as const },
]

const audienceSegments = [
  { name: '美妆深度爱好者', desc: '频繁搜索+购买美妆', score: 96, region: '国内' as const },
  { name: '成分党研究型', desc: '关注成分/功效/评测', score: 91, region: '国内' as const },
  { name: '直播购物达人', desc: '高频直播间消费用户', score: 88, region: '国内' as const },
  { name: '时尚潮流关注者', desc: '关注穿搭/彩妆教程', score: 84, region: '国内' as const },
  { name: 'Beauty Enthusiasts (US/UK)', desc: 'High-intent beauty buyers on Instagram & TikTok', score: 93, region: '国际' as const },
  { name: 'Skincare Ingredient Seekers', desc: 'Searches for K-beauty & Asian skincare routines', score: 89, region: '国际' as const },
  { name: 'Gen Z Makeup Creators (SEA/JP)', desc: 'TikTok-native content creators & buyers', score: 87, region: '国际' as const },
]

// ── AI Config (static domestic version — dynamic intl version built inside component) ──

const aiConfigGroupsCN: AIConfigGroup[] = [
  {
    title: '向导推荐策略',
    icon: <Sparkles size={16} />,
    params: [
      createParam('content_score_weight', '内容质量权重', 0.35, '', 'AI选品时内容传播力评分权重', 0.35, 89, { min: 0.1, max: 0.6, step: 0.05 }),
      createParam('market_match_weight', '市场匹配权重', 0.25, '', '产品与平台用户偏好匹配度权重', 0.25, 87, { min: 0.1, max: 0.5, step: 0.05 }),
      createParam('competition_weight', '竞争环境权重', 0.2, '', '竞品密度和差异化空间权重', 0.2, 85, { min: 0.05, max: 0.4, step: 0.05 }),
      createParam('trend_weight', '趋势热度权重', 0.2, '', '搜索热度和社交趋势权重', 0.2, 86, { min: 0.05, max: 0.4, step: 0.05 }),
      createParam('min_ai_score', '最低AI评分', 80, '分', '低于此评分的选品不会被推荐', 80, 92, { min: 60, max: 95, step: 5 }),
      createParam('creative_diversity', '素材多样性', 0.7, '', '不同素材风格的混合程度', 0.7, 88, { min: 0.3, max: 1.0, step: 0.1 }),
    ],
  },
  {
    title: '自动发布参数',
    icon: <Rocket size={16} />,
    params: [
      createParam('auto_bid_factor', '智能出价系数', 1.15, 'x', 'AI自动出价时的基础乘数', 1.15, 91, { min: 0.8, max: 1.5, step: 0.05 }),
      createParam('budget_safety_margin', '预算安全余量', 0.1, '', '预算消耗到90%时触发保护', 0.1, 93, { min: 0.05, max: 0.3, step: 0.05 }),
      createParam('audience_expansion_rate', '受众扩展率', 0.2, '', 'AI自动扩展相似受众的比例', 0.2, 86, { min: 0.05, max: 0.5, step: 0.05 }),
      createParam('creative_rotation_interval', '素材轮换周期', 4, 'h', '素材自动轮换的时间间隔', 4, 88, { min: 1, max: 24, step: 1 }),
      createParam('peak_hour_boost', '高峰时段加码', 1.3, 'x', '高转化时段的出价加成', 1.3, 90, { min: 1.0, max: 2.0, step: 0.1 }),
      createParam('min_roas_gate', '最低ROAS门槛', 2.0, '', '低于此ROAS自动暂停投放计划', 2.0, 94, { min: 1.0, max: 5.0, step: 0.5 }),
    ],
  },
]

const aiConfigGroupsEN: AIConfigGroup[] = [
  {
    title: 'Wizard Recommendation Strategy',
    icon: <Sparkles size={16} />,
    params: [
      createParam('content_score_weight', 'Content Quality Weight', 0.35, '', 'Weighting for content virality score during AI product selection', 0.35, 89, { min: 0.1, max: 0.6, step: 0.05 }),
      createParam('market_match_weight', 'Market Match Weight', 0.25, '', 'Weighting for product-to-platform audience fit', 0.25, 87, { min: 0.1, max: 0.5, step: 0.05 }),
      createParam('competition_weight', 'Competition Weight', 0.2, '', 'Weighting for competitor density and differentiation space', 0.2, 85, { min: 0.05, max: 0.4, step: 0.05 }),
      createParam('trend_weight', 'Trend Weight', 0.2, '', 'Weighting for search interest and social trend signals', 0.2, 86, { min: 0.05, max: 0.4, step: 0.05 }),
      createParam('min_ai_score', 'Min AI Score', 80, 'pts', 'Products below this AI score are excluded from recommendations', 80, 92, { min: 60, max: 95, step: 5 }),
      createParam('creative_diversity', 'Creative Diversity', 0.7, '', 'Degree of creative style variety in the recommended mix', 0.7, 88, { min: 0.3, max: 1.0, step: 0.1 }),
    ],
  },
  {
    title: 'Auto-Launch Parameters',
    icon: <Rocket size={16} />,
    params: [
      createParam('auto_bid_factor', 'Smart Bid Multiplier', 1.15, 'x', 'Base multiplier applied during AI auto-bidding', 1.15, 91, { min: 0.8, max: 1.5, step: 0.05 }),
      createParam('budget_safety_margin', 'Budget Safety Margin', 0.1, '', 'Budget protection triggers when 90% consumed', 0.1, 93, { min: 0.05, max: 0.3, step: 0.05 }),
      createParam('audience_expansion_rate', 'Audience Expansion Rate', 0.2, '', 'Share of lookalike audience AI auto-expands to', 0.2, 86, { min: 0.05, max: 0.5, step: 0.05 }),
      createParam('creative_rotation_interval', 'Creative Rotation Interval', 4, 'h', 'Time interval for automatic creative rotation', 4, 88, { min: 1, max: 24, step: 1 }),
      createParam('peak_hour_boost', 'Peak Hour Boost', 1.3, 'x', 'Bid multiplier during high-conversion time windows', 1.3, 90, { min: 1.0, max: 2.0, step: 0.1 }),
      createParam('min_roas_gate', 'Min ROAS Gate', 2.0, '', 'Campaign auto-pauses if ROAS falls below this threshold', 2.0, 94, { min: 1.0, max: 5.0, step: 0.5 }),
    ],
  },
]

const learningStatusCN: AILearningStatus = {
  modelVersion: 'v3.8.2-beauty-wizard',
  lastTraining: '38分钟前',
  totalDataPoints: 1860000,
  avgConfidence: 91,
  autoAdjustCount24h: 26,
  learningRate: '收敛中',
  nextTraining: '22分钟后',
  improvementRate: '+2.8%',
}

const learningStatusEN: AILearningStatus = {
  modelVersion: 'v3.8.2-beauty-wizard',
  lastTraining: '38 min ago',
  totalDataPoints: 1860000,
  avgConfidence: 91,
  autoAdjustCount24h: 26,
  learningRate: 'Converging',
  nextTraining: 'in 22 min',
  improvementRate: '+2.8%',
}

// ═══════════════════════════════════════════════════════════════
//   Component
// ═══════════════════════════════════════════════════════════════

export default function AIGuidedLaunch() {
  const [step, setStep] = useState(0)
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['video', 'graphic', 'clip'])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['douyin', 'xiaohongshu'])
  const [dailyBudget, setDailyBudget] = useState(8000)
  const [bidStrategy, setBidStrategy] = useState('ai')
  const [timeStrategy, setTimeStrategy] = useState('ai')
  const [launched, setLaunched] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [regionTab, setRegionTab] = useState<'domestic' | 'intl'>('domestic')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [nextHover, setNextHover] = useState(false)
  const [launchHover, setLaunchHover] = useState(false)
  const [drillPanel, setDrillPanel] = useState<{type: string; data: any} | null>(null)

  // 根据选择的目标判断是否国际投放
  const goalObj = businessGoals.find(g => g.id === selectedGoal)
  const isIntl = selectedGoal === 'overseas' || selectedGoal === 'brand'

  useRegisterAIConfig(
    isIntl ? aiConfigGroupsEN : aiConfigGroupsCN,
    isIntl ? learningStatusEN : learningStatusCN,
    isIntl ? 'AI Campaign Wizard' : 'AI投放向导'
  )
  const currencySymbol = isIntl ? '$' : '¥'
  const budgetMin = isIntl ? 500 : 1000
  const budgetMax = isIntl ? 10000 : 50000
  const budgetStep = isIntl ? 100 : 500
  const budgetDefault = isIntl ? 2000 : 8000
  const aiCPA = isIntl ? '$6.8' : '¥18.5'
  const industryCPA = isIntl ? '$12.5' : '¥24.2'

  const canNext = () => {
    if (step === 0) return selectedGoal !== ''
    if (step === 1) return selectedProducts.length > 0
    if (step === 2) return selectedFormats.length > 0
    if (step === 3) return selectedPlatforms.length > 0
    return true
  }

  const handleLaunch = () => {
    setLaunching(true)
    setTimeout(() => { setLaunching(false); setLaunched(true) }, 2200)
  }

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const toggleFormat = (id: string) => {
    setSelectedFormats(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  // ── Stepper ──

  const renderStepper = () => {
    const STEPS = isIntl ? STEPS_EN : STEPS_CN
    const stepAccent = isIntl ? '#3b82f6' : BRAND
    const stepAccentLight = isIntl ? '#93c5fd' : BRAND_LIGHT
    return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            onClick={() => { if (i < step) { setDirection(i < step ? 'back' : 'forward'); setStep(i) } }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, cursor: i < step ? 'pointer' : 'default',
              padding: '8px 16px', borderRadius: 20,
              background: i === step ? `linear-gradient(135deg, ${stepAccent}, ${stepAccentLight})` : i < step ? stepAccent : '#f1f5f9',
              color: i <= step ? '#fff' : '#94a3b8',
              fontWeight: i === step ? 700 : 500, fontSize: 13,
              boxShadow: i === step ? `0 0 16px ${stepAccent}44` : 'none',
              transition: 'all 0.3s',
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: i <= step ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: i <= step ? '#fff' : '#94a3b8',
            }}>
              {i < step ? <Check size={13} /> : i + 1}
            </span>
            {s}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width: 32, height: 2, background: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
              {i < step && <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', background: stepAccent, animation: 'progressFill 0.5s ease' }} />}
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  // ── Step 1: Goal Selection ──

  const renderStep1 = () => {
    const domesticGoals = businessGoals.filter(g => g.region === '国内')
    const intlGoals = businessGoals.filter(g => g.region === '国际' || g.region === '全球')
    const filteredGoals = regionTab === 'domestic' ? domesticGoals : intlGoals
    const tabAccent = regionTab === 'intl' ? '#0ea5e9' : BRAND
    const tabAccentLight = regionTab === 'intl' ? '#7dd3fc' : BRAND_LIGHT

    return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{regionTab === 'intl' ? 'What is your campaign goal?' : '您希望达成什么目标?'}</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{regionTab === 'intl' ? 'AI will recommend the best strategy based on your goal' : 'AI将根据您的目标推荐最优方案，新手必看'}</p>
      </div>

      {/* 国内 / 国际 页签 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
        {([
          { key: 'domestic' as const, label: '🇨🇳 国内投放', sub: '抖音·小红书·快手·微信', color: BRAND },
          { key: 'intl' as const, label: '🌍 国际投放', sub: 'Meta·TikTok·Google·YouTube', color: '#0ea5e9' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => { setRegionTab(t.key); setSelectedGoal(''); setSelectedProducts([]); setSelectedPlatforms(t.key === 'domestic' ? ['douyin', 'xiaohongshu'] : ['meta', 'tiktok_global']); setDailyBudget(t.key === 'domestic' ? 8000 : 2000) }}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: regionTab === t.key ? '#fff' : 'transparent',
              boxShadow: regionTab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: regionTab === t.key ? t.color : '#94a3b8', marginBottom: 2 }}>{t.label}</div>
            <div style={{ fontSize: 11, color: regionTab === t.key ? '#64748b' : '#c4c4c4' }}>{t.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: filteredGoals.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', gap: 16 }}>
        {filteredGoals.map(g => {
          const active = selectedGoal === g.id
          const accent = (g.region === '国际' || g.region === '全球') ? '#0ea5e9' : BRAND
          const accentLight = (g.region === '国际' || g.region === '全球') ? '#7dd3fc' : BRAND_LIGHT
          return (
            <div
              key={g.id}
              onClick={() => { setSelectedGoal(g.id); setDailyBudget(g.region === '国际' || g.region === '全球' ? 2000 : 8000) }}
              style={{
                padding: 20, borderRadius: 14, cursor: 'pointer',
                border: `2px solid ${active ? accent : '#e2e8f0'}`,
                background: active ? `linear-gradient(135deg, ${accent}08, ${accentLight}12)` : '#fff',
                transition: 'all 0.25s', position: 'relative',
              }}
            >
              {active && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={14} color="#fff" />
                </div>
              )}
              <div style={{ color: active ? accent : '#64748b', marginBottom: 10 }}>{g.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{g.name}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 12 }}>{g.description}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11 }}>
                <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, color: '#475569' }}>{g.budgetRange}</span>
                <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, color: '#475569' }}>{g.platforms}</span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={13} color={accent} />
                <span style={{ fontSize: 12, color: accent, fontWeight: 600 }}>{(g.region === '国际' || g.region === '全球') ? 'AI Success Rate' : 'AI成功率'} {g.aiSuccessRate}%</span>
                <div style={{ flex: 1, height: 4, background: `${accent}15`, borderRadius: 2, marginLeft: 4 }}>
                  <div style={{ width: `${g.aiSuccessRate}%`, height: '100%', background: `linear-gradient(90deg, ${accent}, ${accentLight})`, borderRadius: 2 }} />
                </div>
                <span onClick={(e) => { e.stopPropagation(); setDrillPanel({type:'goal',data:g}) }} style={{ fontSize: 11, color: accent, cursor: 'pointer', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: `${accent}10`, marginLeft: 4 }}>{(g.region === '国际' || g.region === '全球') ? 'Details →' : '详情 →'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )}

  // ── Step 2: Product Selection ──

  const renderStep2 = () => {
    const products = productsByGoal[selectedGoal] || []
    const s2Accent = isIntl ? '#3b82f6' : BRAND
    const s2AccentLight = isIntl ? '#93c5fd' : BRAND_LIGHT
    const s2TagBg = isIntl ? 'rgba(59,130,246,0.1)' : '#fce7f3'
    const s2ActiveBg = isIntl ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #fff5f7, #ffe4e9)'
    const s2InnerBg = isIntl ? '#eff6ff' : '#fff5f7'
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isIntl ? 'AI Product Selection' : 'AI为您智能选品'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
            <Sparkles size={14} style={{ verticalAlign: -2, marginRight: 4 }} color={s2Accent} />
            {isIntl
              ? `Based on "${businessGoals.find(g => g.id === selectedGoal)?.name}" goal · AI filtered top SKUs from 186 products`
              : `基于「${businessGoals.find(g => g.id === selectedGoal)?.name}」目标，AI从 186 个SKU中筛选出最优商品`}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {products.map((p, idx) => {
            const active = selectedProducts.includes(p.id)
            return (
              <div
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                style={{
                  padding: 18, borderRadius: 14, cursor: 'pointer',
                  border: `2px solid ${active ? s2Accent : '#e2e8f0'}`,
                  background: active ? s2ActiveBg : '#fff',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: active ? 'scale(1.01)' : 'scale(1)',
                  animation: `fadeInUp 0.4s ease ${idx * 0.1}s both`,
                }}
              >
                {/* AI Score Circle */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: `conic-gradient(${s2Accent} ${p.aiScore * 3.6}deg, #f1f5f9 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: `scoreReveal 0.5s ease ${idx * 0.15}s both`,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: active ? s2InnerBg : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: s2Accent, lineHeight: 1 }}>{p.aiScore}</span>
                    <span style={{ fontSize: 8, color: '#94a3b8' }}>{isIntl ? 'AI' : 'AI分'}</span>
                  </div>
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {idx === 0 && <span style={{ background: `linear-gradient(135deg, ${s2Accent}, ${s2AccentLight})`, color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{isIntl ? 'AI Top Pick' : 'AI首推'}</span>}
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{p.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    {p.tags.map(t => <span key={t} style={{ background: s2TagBg, color: s2Accent, fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{t}</span>)}
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{p.market}</span>
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{p.trend}</span>
                    <span style={{ background: '#f1f5f9', color: '#475569', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>{p.competition}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, background: '#f8fafc', padding: '8px 12px', borderRadius: 8, borderLeft: `3px solid ${s2Accent}` }}>
                    <Sparkles size={12} style={{ verticalAlign: -1, marginRight: 4 }} color={s2Accent} />
                    <strong>{isIntl ? 'AI Rationale: ' : 'AI推荐理由：'}</strong>{p.reason}
                  </div>
                  <span onClick={(e) => { e.stopPropagation(); setDrillPanel({type:'product',data:p}) }} style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: s2Accent, cursor: 'pointer', fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: s2TagBg }}>{isIntl ? 'View Details →' : '查看商品详情 →'}</span>
                </div>
                {/* Checkbox */}
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 4,
                  border: `2px solid ${active ? s2Accent : '#d1d5db'}`,
                  background: active ? s2Accent : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {active && <Check size={14} color="#fff" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Step 3: Creative Strategy ──

  const renderStep3 = () => {
    const formats = isIntl ? creativeFormatsIntl : creativeFormats
    const mix = isIntl ? styleMixIntl : styleMix
    const accentColor = isIntl ? '#3b82f6' : BRAND
    const tagBg = isIntl ? 'rgba(59,130,246,0.08)' : '#fce7f3'
    const tagColor = isIntl ? '#3b82f6' : BRAND
    return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>AI{isIntl ? ' Creative Strategy' : '素材策略'}</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
          {isIntl
            ? `AI has planned the optimal creative mix based on your products and goal — ${formats.reduce((s, f) => s + f.count, 0)} creatives total`
            : `AI已根据选品和目标规划最优素材组合，共 ${formats.reduce((s, f) => s + f.count, 0)} 组素材`}
        </p>
      </div>

      {/* Format Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {formats.map(f => {
          const active = selectedFormats.includes(f.id)
          return (
            <div
              key={f.id}
              onClick={() => toggleFormat(f.id)}
              style={{
                padding: 20, borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${active ? accentColor : '#e2e8f0'}`,
                background: active ? (isIntl ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #fff5f7, #ffe4e9)') : '#fff',
                transition: 'all 0.25s',
              }}
            >
              <div style={{ color: active ? accentColor : '#64748b', marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{f.name}</div>
              <span style={{ background: tagBg, color: tagColor, fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{f.label}</span>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>{isIntl ? 'Units' : '数量'}: <strong style={{ color: '#0f172a' }}>{f.count}</strong></span>
                <span style={{ color: '#64748b' }}>CTR: <strong style={{ color: accentColor }}>{f.ctr}%</strong></span>
              </div>
              <div style={{ marginTop: 10 }}>
                <span onClick={(e) => { e.stopPropagation(); setDrillPanel({type:'format',data:f}) }} style={{ fontSize: 11, color: accentColor, cursor: 'pointer', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: tagBg }}>{isIntl ? 'Details →' : '详情 →'}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Style Mix */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={16} color={accentColor} />{isIntl ? 'AI-Recommended Creative Mix' : 'AI推荐风格配比'}
        </div>
        {/* Bar */}
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 28, marginBottom: 14 }}>
          {mix.map(s => (
            <div key={s.name} style={{ width: `${s.pct}%`, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, transition: 'width 0.3s' }}>
              {s.pct}%
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {mix.map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
              <span style={{ color: '#475569' }}>{s.name}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{s.pct}%</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, lineHeight: 1.6 }}>
          <Sparkles size={12} style={{ verticalAlign: -1, marginRight: 4 }} color={accentColor} />
          {isIntl
            ? <><strong>AI Strategy:</strong> Product Review content drives highest CTR (5.1%), allocated 40% as hero creative. Tutorial/How-to builds trust and purchase intent. UGC/Unboxing amplifies social proof across Meta & TikTok.</>
            : <><strong>AI策略说明：</strong>产品测评型内容转化率最高(5.2%)，占比40%为主力；教程教学型提升用户信任度，种草开箱型增加传播分享率，三者协同覆盖用户决策全链路。</>
          }
        </div>
      </div>
    </div>
  )}

  // ── Step 4: Campaign Strategy ──

  const renderStep4 = () => (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{isIntl ? 'AI Campaign Strategy' : 'AI投放策略'}</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{isIntl ? 'AI has pre-configured the optimal campaign parameters — review and confirm' : 'AI已为您配置最优投放参数，直接确认即可'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Platforms */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 12 }}>{isIntl ? 'Ad Platforms' : '投放平台'}</div>
            {!isIntl ? (
              /* 国内平台 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {platformOptions.filter(pl => pl.region === '国内').map(pl => {
                  const active = selectedPlatforms.includes(pl.id)
                  return (
                    <div
                      key={pl.id}
                      onClick={() => togglePlatform(pl.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${active ? BRAND : '#e2e8f0'}`,
                        background: active ? '#fff5f7' : '#fff', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 4,
                        border: `2px solid ${active ? BRAND : '#d1d5db'}`,
                        background: active ? BRAND : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {active && <Check size={12} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{pl.name}</span>
                      {pl.recommended && (
                        <span style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`, color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>AI推荐</span>
                      )}
                      <span onClick={(e) => { e.stopPropagation(); setDrillPanel({type:'platform',data:pl}) }} style={{ marginLeft: 'auto', fontSize: 11, color: BRAND, cursor: 'pointer', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#fce7f3' }}>详情</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* 国际平台 */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {platformOptions.filter(pl => pl.region === '国际').map(pl => {
                  const active = selectedPlatforms.includes(pl.id)
                  return (
                    <div
                      key={pl.id}
                      onClick={() => togglePlatform(pl.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${active ? '#3b82f6' : '#e2e8f0'}`,
                        background: active ? '#eff6ff' : '#fff', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 4,
                        border: `2px solid ${active ? '#3b82f6' : '#d1d5db'}`,
                        background: active ? '#3b82f6' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {active && <Check size={12} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{pl.name}</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>Global</span>
                      <span onClick={(e) => { e.stopPropagation(); setDrillPanel({type:'platform',data:pl}) }} style={{ marginLeft: 'auto', fontSize: 11, color: '#3b82f6', cursor: 'pointer', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.08)' }}>Details</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Budget */}
          <div style={{ background: '#fff', border: `1px solid ${isIntl ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{isIntl ? 'Daily Budget' : '日预算'}</span>
              {isIntl && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', fontWeight: 600 }}>🌍 Global</span>}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{isIntl ? `AI recommended ${currencySymbol}${budgetDefault.toLocaleString()}/day (based on goal & market)` : `AI推荐 ${currencySymbol}${budgetDefault.toLocaleString()}/日 (基于目标和竞争环境)`}</div>
            <input
              type="range" min={budgetMin} max={budgetMax} step={budgetStep} value={dailyBudget}
              onChange={e => setDailyBudget(Number(e.target.value))}
              style={{ width: '100%', accentColor: isIntl ? '#0ea5e9' : BRAND }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              <span>{currencySymbol}{budgetMin.toLocaleString()}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: isIntl ? '#0ea5e9' : BRAND }}>{currencySymbol}{dailyBudget.toLocaleString()}</span>
              <span>{currencySymbol}{budgetMax.toLocaleString()}</span>
            </div>
          </div>

          {/* Bid & Time Strategy */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>{isIntl?'Target CPA':'目标出价'}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>AI {isIntl?'suggested CPA:':'建议CPA:'} <strong style={{ color: isIntl ? '#3b82f6' : BRAND }}>{aiCPA}</strong> ({isIntl?'Industry avg.':'行业均值'} {industryCPA})</div>

            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 8, marginTop: 14 }}>{isIntl?'Bidding Strategy':'出价策略'}</div>
            {['ai', 'manual', 'maxconv'].map((s, i) => {
              const labels = isIntl ? ['AI Smart Bidding (Recommended)', 'Manual CPC', 'Maximize Conversions'] : ['AI智能出价(推荐)', '手动出价', '最大转化量']
              const bidAccent = isIntl ? '#3b82f6' : BRAND
              const bidTagBg = isIntl ? 'rgba(59,130,246,0.1)' : '#fce7f3'
              return (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${bidStrategy === s ? bidAccent : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {bidStrategy === s && <div style={{ width: 10, height: 10, borderRadius: '50%', background: bidAccent }} />}
                  </div>
                  <span onClick={() => setBidStrategy(s)}>{labels[i]}</span>
                  {s === 'ai' && <span style={{ background: bidTagBg, color: bidAccent, fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{isIntl?'Recommended':'推荐'}</span>}
                </label>
              )
            })}

            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 8, marginTop: 14 }}>{isIntl?'Scheduling':'投放时段'}</div>
            {['ai', 'allday', 'custom'].map((s, i) => {
              const labels = isIntl ? ['AI Smart Scheduling (Recommended)', 'All Day Even', 'Custom Hours'] : ['AI智能分时(推荐)', '全天均匀', '自定义']
              const timeAccent = isIntl ? '#3b82f6' : BRAND
              const timeTagBg = isIntl ? 'rgba(59,130,246,0.1)' : '#fce7f3'
              return (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${timeStrategy === s ? timeAccent : '#d1d5db'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {timeStrategy === s && <div style={{ width: 10, height: 10, borderRadius: '50%', background: timeAccent }} />}
                  </div>
                  <span onClick={() => setTimeStrategy(s)}>{labels[i]}</span>
                  {s === 'ai' && <span style={{ background: timeTagBg, color: timeAccent, fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{isIntl?'Recommended':'推荐'}</span>}
                </label>
              )
            })}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Audience Targeting */}
          <div style={{ background: '#fff', border: `1px solid ${isIntl ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14 }}>{isIntl ? 'Audience Targeting (AI)' : '受众定向 (AI推荐)'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b' }}>{isIntl ? 'Age' : '年龄'}</span>
                {isIntl
                  ? <span style={{ color: '#0f172a', fontWeight: 600 }}>18–44 <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginLeft: 4 }}>Core 22–34</span></span>
                  : <span style={{ color: '#0f172a', fontWeight: 600 }}>18-45岁 <span style={{ background: '#fce7f3', color: BRAND, fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginLeft: 4 }}>核心25-35</span></span>
                }
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b' }}>{isIntl ? 'Gender' : '性别'}</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{isIntl ? 'Female-focused (75%+)' : '女性为主'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                <span style={{ color: '#64748b' }}>{isIntl ? 'Interests' : '兴趣标签'}</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{isIntl ? 'Beauty & Skincare / Fashion / Lifestyle' : '美妆护肤 / 时尚穿搭 / 生活方式'}</span>
              </div>
              {isIntl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ color: '#64748b' }}>Markets</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>US · UK · JP · SG · AU</span>
                </div>
              )}
            </div>
          </div>

          {/* Audience Segments */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color={isIntl ? '#3b82f6' : BRAND} />{isIntl ? 'AI Audience Segments' : 'AI推荐受众人群'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {audienceSegments.filter(seg => seg.region === (isIntl ? '国际' : '国内')).map(seg => {
                const accentColor = isIntl ? '#3b82f6' : BRAND
                return (
                  <div key={seg.name} style={{ padding: 14, borderRadius: 10, background: isIntl ? '#f0f7ff' : '#f8fafc', border: `1px solid ${isIntl ? '#bfdbfe' : '#e2e8f0'}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                    onClick={() => setDrillPanel({type:'audience',data:seg})}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 2px 12px ${accentColor}22`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: '#0f172a', lineHeight: 1.3 }}>{seg.name}</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: accentColor }}>{seg.score}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>{seg.desc}</div>
                    <div style={{ marginTop: 6, height: 3, background: isIntl ? '#dbeafe' : '#fce7f3', borderRadius: 2 }}>
                      <div style={{ width: `${seg.score}%`, height: '100%', background: `linear-gradient(90deg, ${accentColor}, ${isIntl ? '#93c5fd' : BRAND_LIGHT})`, borderRadius: 2 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI Market Insight */}
          <div style={{ background: isIntl ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #fff5f7, #ffe4e9)', border: `1px solid ${isIntl ? '#93c5fd' : BRAND}22`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: isIntl ? '#3b82f6' : BRAND, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} />{isIntl ? 'AI Market Insight' : 'AI市场洞察'}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
              {isIntl ? (
                <>
                  Global beauty category competition: <strong style={{ color: '#3b82f6' }}>Medium-High</strong> (US/UK/JP markets)<br />
                  Best window: Weekdays 8–10 AM EST · Weekends 2–5 PM local. Avoid Monday CPM peaks (+28%).<br />
                  Category avg. ROAS (7-day): <strong style={{ color: '#3b82f6' }}>3.2</strong> · AI estimated this campaign: <strong style={{ color: '#3b82f6' }}>3.2–4.8</strong>
                </>
              ) : (
                <>
                  当前美妆赛道投放竞争度: <strong style={{ color: BRAND }}>中等偏高</strong><br />
                  建议避开周末高峰(CPM溢价32%)，工作日19:00-22:00转化率最高。<br />
                  同类品牌近7日平均ROAS: <strong style={{ color: BRAND }}>3.8</strong>，AI预估本次投放ROAS: <strong style={{ color: BRAND }}>4.2-5.5</strong>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 5: Confirm & Launch ──

  const allProducts = Object.values(productsByGoal).flat()
  const selectedProductObjs = allProducts.filter(p => selectedProducts.includes(p.id))

  const renderStep5 = () => {
    if (launching) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>
            <div style={{ animation: 'rocketLaunch 2s ease-in-out forwards' }}>
              <Rocket size={64} color={isIntl ? '#3b82f6' : BRAND} style={{ animation: 'pulse 0.6s ease-in-out infinite alternate' }} />
            </div>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{isIntl?'Launching Campaign...':'AI正在发布投放计划...'}</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>{isIntl?'Syncing to Meta, TikTok & Google Ads Manager. ~15 seconds.':'正在同步至各平台广告后台，预计15秒完成'}</p>
          <div style={{ width: 200, height: 4, background: isIntl ? '#dbeafe' : '#fce7f3', borderRadius: 2, margin: '20px auto' }}>
            <div style={{ width: '70%', height: '100%', background: isIntl ? 'linear-gradient(90deg, #3b82f6, #93c5fd)' : `linear-gradient(90deg, ${BRAND}, ${BRAND_LIGHT})`, borderRadius: 2, animation: 'progressGrow 2s ease-in-out forwards' }} />
          </div>
        </div>
      )
    }

    if (launched) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', position: 'relative' }}>
          {/* Confetti particles */}
          {['#e8365d', '#ff7a95', '#f59e0b', '#22c55e', '#8b5cf6'].map((color, i) => (
            <div key={i} style={{
              position: 'absolute', width: 8, height: 8, borderRadius: '50%',
              background: color,
              left: `${20 + i * 15}%`, top: -20,
              animation: `confetti 1s ease ${i * 0.1}s both`,
            }} />
          ))}
          <div style={{ animation: 'scaleIn 0.5s ease both' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: isIntl ? 'linear-gradient(135deg, #3b82f6, #93c5fd)' : `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: isIntl ? '0 0 24px rgba(59,130,246,0.4)' : `0 0 24px ${BRAND}44` }}>
              <Check size={36} color="#fff" />
            </div>
          </div>
          <div style={{ animation: 'fadeInUp 0.5s ease 0.2s both' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{isIntl?'Campaign Live!':'投放计划已发布!'}</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>{isIntl?'AI will continuously optimize performance. View real-time data in your dashboard.':'AI将持续优化投放效果，您可以在数据看板查看实时数据'}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, maxWidth: 600, margin: '0 auto' }}>
            {[
              { label: isIntl?'Platforms':'投放平台', value: isIntl?`${selectedPlatforms.length}`:`${selectedPlatforms.length}个`, icon: <Monitor size={18} /> },
              { label: isIntl?'Products':'推广商品', value: isIntl?`${selectedProducts.length}`:`${selectedProducts.length}个`, icon: <Star size={18} /> },
              { label: isIntl?'Daily Budget':'日预算', value: `${currencySymbol}${dailyBudget.toLocaleString()}`, icon: <BarChart3 size={18} /> },
              { label: 'Est. ROAS', value: isIntl ? '3.2–4.8' : '4.2–5.5', icon: <TrendingUp size={18} /> },
            ].map((s, i) => (
              <div key={s.label} style={{ background: '#f8fafc', borderRadius: 12, padding: 16, textAlign: 'center', animation: `countUp 0.4s ease ${0.3 + i * 0.1}s both` }}>
                <div style={{ color: isIntl?'#3b82f6':BRAND, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>{isIntl?'Confirm Campaign Plan':'确认投放方案'}</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>{isIntl?'Review all settings below and click Launch to go live':'请确认以下信息，点击发布即可开始投放'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Goal */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            onClick={() => setDrillPanel({type:'summary',data:{label:isIntl?'Campaign Goal':'投放目标',value:goalObj?.name,recommended:goalObj?.name}})}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: isIntl?'#eff6ff':'#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isIntl?'#3b82f6':BRAND }}><Target size={20} /></div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{isIntl?'Campaign Goal':'投放目标'}</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{goalObj?.name}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: isIntl?'#3b82f6':BRAND, fontWeight: 600 }}>{isIntl?'AI Success Rate':'AI成功率'} {goalObj?.aiSuccessRate}%</div>
          </div>
          {/* Products */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{isIntl?`Products (${selectedProductObjs.length})`:`推广商品 (${selectedProductObjs.length}个)`}</div>
            {selectedProductObjs.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                onClick={() => setDrillPanel({type:'product',data:p})}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{p.title}</span>
                <span style={{ fontSize: 12, color: isIntl?'#3b82f6':BRAND, fontWeight: 700, marginLeft: 'auto' }}>AI {p.aiScore}{isIntl?' pts':'分'}</span>
              </div>
            ))}
          </div>
          {/* Creative */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            onClick={() => setDrillPanel({type:'summary',data:{label:isIntl?'Creative Strategy':'素材策略',value:`${selectedFormats.length} formats / ${(isIntl?creativeFormatsIntl:creativeFormats).reduce((s, f) => s + f.count, 0)} creatives`}})}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: isIntl?'#eff6ff':'#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isIntl?'#3b82f6':BRAND }}><Film size={20} /></div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{isIntl?'Creative Strategy':'素材策略'}</div>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedFormats.length} {isIntl?'formats':'种格式'} / {(isIntl?creativeFormatsIntl:creativeFormats).reduce((s, f) => s + f.count, 0)} {isIntl?'creatives':'组素材'}</div>
            </div>
          </div>
          {/* Strategy */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{isIntl?'Campaign Settings':'投放配置'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{isIntl?'Platforms':'平台'}</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedPlatforms.map(id => platformOptions.find(p => p.id === id)?.name).join(', ')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{isIntl?'Daily Budget':'日预算'}</span><span style={{ fontWeight: 600, color: isIntl ? '#3b82f6' : BRAND }}>{currencySymbol}{dailyBudget.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{isIntl?'Bidding':'出价策略'}</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{isIntl?(bidStrategy==='ai'?'AI Smart Bidding':bidStrategy==='manual'?'Manual CPC':'Max Conversions'):(bidStrategy === 'ai' ? 'AI智能出价' : bidStrategy === 'manual' ? '手动出价' : '最大转化量')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>{isIntl?'Scheduling':'投放时段'}</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{isIntl?(timeStrategy==='ai'?'AI Smart Schedule':timeStrategy==='allday'?'All Day':'Custom'):(timeStrategy === 'ai' ? 'AI智能分时' : timeStrategy === 'allday' ? '全天均匀' : '自定义')}</span></div>
            </div>
          </div>
          {/* AI Prediction */}
          <div style={{ background: isIntl ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'linear-gradient(135deg, #fff5f7, #ffe4e9)', border: `1px solid ${isIntl ? '#3b82f6' : BRAND}22`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: isIntl ? '#3b82f6' : BRAND, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} />{isIntl ? 'AI Performance Forecast' : 'AI效果预测'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {(isIntl ? [
                { label: 'Est. Daily Reach', value: '800K–1.2M' },
                { label: 'Est. Daily Clicks', value: '32K–48K' },
                { label: 'Est. ROAS', value: '3.2–4.8' },
              ] : [
                { label: '预估日曝光', value: '85-120万' },
                { label: '预估日点击', value: '3.4-4.8万' },
                { label: '预估ROAS', value: '4.2-5.5' },
              ]).map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: isIntl ? '#3b82f6' : BRAND }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render ──

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }
        @keyframes progressGrow { from { width: 0%; } to { width: 100%; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes scoreReveal { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes rocketLaunch { 0% { transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { transform: translateY(-200px) scale(0.5); opacity: 0; } }
        @keyframes countUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(-60px) rotate(360deg); opacity: 0; } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(232,54,93,0.3); } 50% { box-shadow: 0 0 0 12px rgba(232,54,93,0); } }
        @keyframes pulseGlowBlue { 0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); } 50% { box-shadow: 0 0 0 12px rgba(59,130,246,0); } }
        @keyframes progressFill { from { width: 0; } }
      `}</style>

      {/* ── AI模型支撑 ── */}
      {(() => {
        const mdlColor = isIntl ? '#3b82f6' : '#e8365d'
        const mdlBg = isIntl ? 'rgba(59,130,246,0.06)' : 'rgba(232,54,93,0.06)'
        const mdlBorder = isIntl ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(232,54,93,0.15)'
        return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20, padding: '8px 14px', background: mdlBg, borderRadius: 10, border: mdlBorder }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>{isIntl ? 'Decision Engine Models:' : '决策引擎模型：'}</span>
          <ModelBadge name="CTR-Predictor-DeepFM" color={mdlColor} />
          <ModelBadge name="CVR-Predictor-ESMM" color={mdlColor} />
          <ModelBadge name="BidOptimizer-DQN" color={mdlColor} />
          <ModelBadge name="NewSKU-ColdStart" color={mdlColor} />
          <ModelBadge name="BudgetMO-Optimizer" color={mdlColor} />
          <ModelBadge name="TrafficPacing-RL" color={mdlColor} />
        </div>
        )
      })()}

      {/* Drill-down Panel */}
      {drillPanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 899, background: 'rgba(0,0,0,0.3)' }} onClick={() => setDrillPanel(null)}>
          <div style={{
            position: 'fixed', top: 0, right: 0, width: 520, height: '100vh',
            background: '#fff', borderLeft: `2px solid ${isIntl ? 'rgba(59,130,246,0.2)' : `${BRAND}20`}`,
            zIndex: 900, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
            padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16,
          }} onClick={e => e.stopPropagation()}>
            {(() => {
              const panelIsIntl = drillPanel.type === 'goal'
                ? (drillPanel.data.region === '国际' || drillPanel.data.region === '全球')
                : drillPanel.type === 'platform'
                ? ['meta','tiktok_global','google'].includes(drillPanel.data.id)
                : drillPanel.type === 'audience'
                ? drillPanel.data.region === '国际'
                : isIntl
              const panelAccent = panelIsIntl ? '#3b82f6' : BRAND
              return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: panelAccent }}>
                  {drillPanel.type === 'goal' && (panelIsIntl ? `Goal Details: ${drillPanel.data.name}` : `目标详情: ${drillPanel.data.name}`)}
                  {drillPanel.type === 'product' && (isIntl ? `Product: ${drillPanel.data.title}` : `商品详情: ${drillPanel.data.title}`)}
                  {drillPanel.type === 'format' && (isIntl ? `Creative Format: ${drillPanel.data.name}` : `素材格式: ${drillPanel.data.name}`)}
                  {drillPanel.type === 'platform' && (panelIsIntl ? `Platform: ${drillPanel.data.name}` : `平台详情: ${drillPanel.data.name}`)}
                  {drillPanel.type === 'audience' && (panelIsIntl ? `Audience: ${drillPanel.data.name}` : `人群详情: ${drillPanel.data.name}`)}
                  {drillPanel.type === 'summary' && (isIntl ? 'Setting Details' : '配置详情')}
                </div>
                <button onClick={() => setDrillPanel(null)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: '#94a3b8', fontSize: '0.8rem' }}>{isIntl ? '× Close' : '× 关闭'}</button>
              </div>
              )
            })()}

            {drillPanel.type === 'goal' && (() => {
              const g = drillPanel.data
              const gIsIntl = g.region === '国际' || g.region === '全球'
              const gAccent = gIsIntl ? '#3b82f6' : BRAND
              const gAccentLight = gIsIntl ? '#93c5fd' : BRAND_LIGHT
              const gBg = gIsIntl ? '#eff6ff' : '#fff5f7'
              return (
                <>
                  <div style={{ padding: 16, background: gBg, borderRadius: 12, border: `1px solid ${gAccent}20` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ color: gAccent }}>{g.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{g.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{g.description}</div>
                      </div>
                    </div>
                    {(gIsIntl?[{l:'Budget Range',v:g.budgetRange},{l:'Platforms',v:g.platforms},{l:'AI Success Rate',v:`${g.aiSuccessRate}%`},{l:'Avg. ROAS',v:g.id==='brand'?'2.5x':'3.6x'},{l:'Time to First Result',v:g.id==='brand'?'7–14 days':'3–5 days'}]:[{l:'推荐预算',v:g.budgetRange},{l:'适用平台',v:g.platforms},{l:'AI成功率',v:`${g.aiSuccessRate}%`},{l:'平均ROI',v:g.id==='livestream'?'3.8x':g.id==='seeding'?'4.2x':g.id==='brand'?'2.5x':'5.1x'},{l:'首次起效时间',v:g.id==='livestream'?'2-4小时':g.id==='seeding'?'3-7天':g.id==='brand'?'7-14天':'1-3天'}]).map(r=>(
                      <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:'0.82rem'}}>
                        <span style={{color:'#64748b'}}>{r.l}</span>
                        <span style={{fontWeight:600,color:'#0f172a'}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10,color:'#0f172a'}}>{gIsIntl ? 'Strategy Overview' : '策略详解'}</div>
                    <div style={{fontSize:12,color:'#64748b',lineHeight:1.8,background:'#f8fafc',padding:14,borderRadius:10}}>
                      {g.id==='livestream' && '直播带货策略以实时流量获取为核心，AI通过预测直播间人气峰值时段进行精准投放。系统会自动监测在线人数、互动率和成交转化率，动态调整出价和受众定向。建议配合直播间福袋、秒杀活动使用，ROI可提升40%以上。'}
                      {g.id==='seeding' && '种草引流策略采用"种草-搜索-转化"三阶段模型。第一阶段通过KOL/KOC内容种草建立产品认知；第二阶段AI捕获搜索意图用户进行精准投放；第三阶段通过电商详情页完成转化。全链路平均转化周期3-7天。'}
                      {g.id==='brand' && 'Global brand awareness strategy targets CPM efficiency across Meta, TikTok, and YouTube simultaneously. AI allocates budget dynamically across markets (US/UK/JP/SEA) based on real-time engagement signals. Recommended to pair with influencer seeding on Instagram and TikTok creator partnerships.'}
                      {g.id==='private' && '私域引流策略将公域流量转化为品牌私域资产。AI优化加微/入群成本，通过试用装申领、专属优惠等钩子吸引用户进入企微社群。平均加微成本可控制在¥3-5/人，远低于行业均值¥8-10/人。'}
                      {g.id==='overseas' && 'Cross-border expansion strategy targets US, UK, Japan, and SEA markets through Meta Ads + TikTok for Business + Google. AI optimizes creative rotation per market, adjusting bids based on local CPM benchmarks and conversion windows. Compliance checks run automatically for each target market. Average time-to-first-sale: 3–5 days.'}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10,color:'#0f172a'}}>{gIsIntl ? 'Historical Performance' : '历史表现数据'}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {(gIsIntl?[
                        {l:'Campaigns (30d)',v:g.id==='brand'?'8':'12',c:gAccent},
                        {l:'Avg. ROAS',v:g.id==='brand'?'2.5x':'3.6x',c:'#22c55e'},
                        {l:'Peak Daily Revenue',v:g.id==='brand'?'$18,200':'$28,400',c:'#f59e0b'},
                      ]:[
                        {l:'近30天投放次数',v:g.id==='livestream'?'28':g.id==='seeding'?'15':'8',c:BRAND},
                        {l:'平均ROAS',v:g.id==='livestream'?'3.8':g.id==='seeding'?'4.2':'5.1',c:'#22c55e'},
                        {l:'最高单日GMV',v:g.id==='livestream'?'¥12.8万':g.id==='seeding'?'¥8.4万':'¥6.8万',c:'#f59e0b'},
                      ]).map(s=>(
                        <div key={s.l} style={{textAlign:'center',padding:12,background:`${s.c}08`,borderRadius:8,border:`1px solid ${s.c}20`}}>
                          <div style={{fontSize:'1.2rem',fontWeight:700,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:'0.68rem',color:'#94a3b8'}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10,color:'#0f172a'}}>{gIsIntl ? 'Budget Allocation' : '推荐预算分配'}</div>
                    {(gIsIntl?[
                      {n:'Creative Production',p:'12%',v:g.id==='brand'?'$600':'$240'},
                      {n:'Platform Ads',p:'72%',v:g.id==='brand'?'$3,600':'$1,440'},
                      {n:'Influencer/UGC',p:'11%',v:g.id==='brand'?'$550':'$220'},
                      {n:'Contingency',p:'5%',v:g.id==='brand'?'$250':'$100'},
                    ]:[
                      {n:'素材制作',p:'15%',v:'¥1,200'},
                      {n:'平台投放',p:'70%',v:'¥5,600'},
                      {n:'达人合作',p:'10%',v:'¥800'},
                      {n:'应急储备',p:'5%',v:'¥400'},
                    ]).map(b=>(
                      <div key={b.n} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                        <span style={{fontSize:'0.78rem',color:'#475569',width:80}}>{b.n}</span>
                        <div style={{flex:1,height:8,background:'#f1f5f9',borderRadius:4,overflow:'hidden'}}>
                          <div style={{width:b.p,height:'100%',background:`linear-gradient(90deg, ${gAccent}, ${gAccentLight})`,borderRadius:4}}/>
                        </div>
                        <span style={{fontSize:'0.72rem',color:gAccent,fontWeight:600,minWidth:50,textAlign:'right'}}>{b.v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10,color:'#0f172a'}}>{gIsIntl ? 'Success Stories' : '成功案例'}</div>
                    {(gIsIntl?[
                      {title:g.id==='brand'?'Global Brand Awareness Campaign (Q4)':'US/UK Lip Glaze Launch Campaign',result:g.id==='brand'?'ROAS 2.8x, Brand Search +45%':'ROAS 4.1x, Revenue $42,000',days:g.id==='brand'?'21 days':'14 days'},
                      {title:g.id==='brand'?'Spring Collection Launch – US/JP':'Japan Skincare Market Entry',result:g.id==='brand'?'Brand recall +32%, CPM $9.8':'ROAS 3.8x, Revenue $28,500',days:g.id==='brand'?'14 days':'21 days'},
                    ]:[
                      {title:'2026春季唇釉推广',result:'ROI 4.8x, GMV ¥38万',days:'7天'},
                      {title:'2025双11粉底液',result:'ROI 5.2x, GMV ¥85万',days:'15天'},
                    ]).map(c=>(
                      <div key={c.title} style={{padding:12,background:'#f8fafc',borderRadius:8,marginBottom:8,border:'1px solid #e2e8f0'}}>
                        <div style={{fontWeight:600,fontSize:13,color:'#0f172a'}}>{c.title}</div>
                        <div style={{fontSize:11,color:'#64748b',marginTop:4}}>{c.result} · {gIsIntl?'Duration':'投放周期'}: {c.days}</div>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}

            {drillPanel.type === 'product' && (() => {
              const p = drillPanel.data
              return (
                <>
                  {(() => {
                    const pdAccent = isIntl ? '#3b82f6' : BRAND
                    const pdBg = isIntl ? '#eff6ff' : '#fff5f7'
                    const pdTagBg = isIntl ? 'rgba(59,130,246,0.1)' : '#fce7f3'
                    return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: pdBg, borderRadius: 12 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                      background: `conic-gradient(${pdAccent} ${p.aiScore * 3.6}deg, #f1f5f9 0deg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: pdBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: pdAccent }}>{p.aiScore}</span>
                        <span style={{ fontSize: 9, color: '#94a3b8' }}>{isIntl ? 'AI' : 'AI分'}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{p.title}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {p.tags.map((t: string) => <span key={t} style={{ background: pdTagBg, color: pdAccent, fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{t}</span>)}
                      </div>
                    </div>
                  </div>
                    )
                  })()}
                  <div style={{padding:14,background:'#f8fafc',borderRadius:10,border:'1px solid #e2e8f0'}}>
                    {(isIntl?[{l:'Target Market',v:p.market},{l:'Trend',v:p.trend},{l:'Competition',v:p.competition},{l:'AI Recommendation',v:p.reason}]:[{l:'适用市场',v:p.market},{l:'热度趋势',v:p.trend},{l:'竞争环境',v:p.competition},{l:'AI推荐理由',v:p.reason}]).map(r=>(
                      <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e2e8f0',fontSize:'0.82rem',gap:12}}>
                        <span style={{color:'#64748b',flexShrink:0}}>{r.l}</span>
                        <span style={{fontWeight:500,color:'#0f172a',textAlign:'right'}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl?'Sales History (Last 30 Days)':'销售历史 (近30天)'}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {(isIntl?[
                        {l:'Total Units',v:p.aiScore>90?'8,420':'3,840',c:'#3b82f6'},
                        {l:'Daily Avg.',v:p.aiScore>90?'281':'128',c:'#22c55e'},
                        {l:'Repeat Rate',v:p.aiScore>90?'28%':'18%',c:'#6366f1'},
                      ]:[
                        {l:'总销量',v:p.aiScore>90?'12,840':'6,520',c:BRAND},
                        {l:'日均销量',v:p.aiScore>90?'428':'217',c:'#22c55e'},
                        {l:'复购率',v:p.aiScore>90?'34%':'22%',c:'#6366f1'},
                      ]).map(s=>(
                        <div key={s.l} style={{textAlign:'center',padding:10,background:`${s.c}08`,borderRadius:8}}>
                          <div style={{fontSize:'1.1rem',fontWeight:700,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:'0.65rem',color:'#94a3b8'}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl ? 'Platform Performance' : '各平台表现'}</div>
                    <table style={{width:'100%',fontSize:'0.78rem',borderCollapse:'collapse'}}>
                      <thead><tr style={{borderBottom:'1px solid #e2e8f0',color:'#94a3b8'}}><th style={{textAlign:'left',padding:'8px 0'}}>{isIntl ? 'Platform' : '平台'}</th><th>{isIntl ? 'Sales' : '销量'}</th><th>CVR</th><th>ROI</th></tr></thead>
                      <tbody>
                        {(isIntl ? [
                          {p:'Meta Ads',s:'4,820',cvr:'3.2%',roi:'3.8x'},
                          {p:'TikTok for Business',s:'3,640',cvr:'4.1%',roi:'4.5x'},
                          {p:'Google · YouTube',s:'2,180',cvr:'2.6%',roi:'3.1x'},
                        ] : [
                          {p:'抖音',s:'5,240',cvr:'3.8%',roi:'4.2x'},
                          {p:'小红书',s:'3,180',cvr:'4.5%',roi:'5.1x'},
                          {p:'快手',s:'2,420',cvr:'2.9%',roi:'3.5x'},
                          {p:'微信',s:'2,000',cvr:'3.2%',roi:'3.8x'},
                        ]).map(r=>(
                          <tr key={r.p} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 0',fontWeight:600}}>{r.p}</td><td style={{textAlign:'center'}}>{r.s}</td><td style={{textAlign:'center',color:isIntl?'#3b82f6':BRAND}}>{r.cvr}</td><td style={{textAlign:'center',color:'#22c55e',fontWeight:600}}>{r.roi}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl ? 'Competitor Comparison' : '竞品对比'}</div>
                    {(isIntl ? [
                      {n:'Competitor A – Western Beauty Brand',price:'$28',adv:'Strong brand recognition',disadv:'Limited shade range'},
                      {n:'Competitor B – K-Beauty Brand',price:'$22',adv:'Popular in Asia',disadv:'Lower durability'},
                    ] : [
                      {n:'竞品A - 某品牌唇釉',price:'¥89',adv:'包装设计感强',disadv:'色号偏少'},
                      {n:'竞品B - 某品牌唇泥',price:'¥69',adv:'价格更低',disadv:'持久度不足'},
                    ]).map(c=>(
                      <div key={c.n} style={{padding:10,background:'#f8fafc',borderRadius:8,marginBottom:8,fontSize:12,border:'1px solid #e2e8f0'}}>
                        <div style={{fontWeight:600,color:'#0f172a',marginBottom:4}}>{c.n} · {c.price}</div>
                        <div style={{color:'#64748b'}}>{isIntl ? 'Pros' : '优势'}: {c.adv} · {isIntl ? 'Cons' : '劣势'}: {c.disadv}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl?'Inventory & Margin':'库存与利润'}</div>
                    {(isIntl?[
                      {l:'Current Stock',v:p.aiScore>90?'6,200 units':'2,400 units'},
                      {l:'Safety Stock',v:'800 units'},
                      {l:'Gross Margin',v:p.aiScore>90?'72%':'65%'},
                      {l:'Est. 7-day Consumption',v:'~1,600 units'},
                    ]:[
                      {l:'当前库存',v:p.aiScore>90?'8,420件':'3,150件'},
                      {l:'安全库存',v:'1,000件'},
                      {l:'毛利率',v:p.aiScore>90?'68%':'62%'},
                      {l:'投放后预估消耗',v:'7天内约2,100件'},
                    ]).map(r=>(
                      <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',fontSize:'0.78rem',borderBottom:'1px solid #f1f5f9'}}>
                        <span style={{color:'#64748b'}}>{r.l}</span>
                        <span style={{fontWeight:600}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl?'AI Score Breakdown':'AI评分拆解'}</div>
                    {(isIntl?[
                      {n:'Conv. Rate',s:p.aiScore>90?94:80},
                      {n:'Market Trend',s:p.aiScore>90?91:76},
                      {n:'Competition',s:p.aiScore>90?87:73},
                      {n:'Margin',s:p.aiScore>90?95:79},
                      {n:'Stock Health',s:p.aiScore>90?89:68},
                    ]:[
                      {n:'转化率评分',s:p.aiScore>90?95:82},
                      {n:'市场热度',s:p.aiScore>90?92:78},
                      {n:'竞争优势',s:p.aiScore>90?88:75},
                      {n:'利润空间',s:p.aiScore>90?96:80},
                      {n:'库存健康度',s:p.aiScore>90?90:70},
                    ]).map(item=>(
                      <div key={item.n} style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                        <span style={{fontSize:'0.72rem',color:'#475569',width:80}}>{item.n}</span>
                        <div style={{flex:1,height:6,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}>
                          <div style={{width:`${item.s}%`,height:'100%',background:`linear-gradient(90deg, ${isIntl?'#3b82f6':BRAND}, ${isIntl?'#93c5fd':BRAND_LIGHT})`,borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:'0.72rem',color:isIntl?'#3b82f6':BRAND,fontWeight:600,minWidth:28}}>{item.s}</span>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}

            {drillPanel.type === 'format' && (() => {
              const f = drillPanel.data
              return (
                <>
                  {(() => {
                    const fmtAccent = isIntl ? '#3b82f6' : BRAND
                    const fmtBg = isIntl ? '#eff6ff' : '#fff5f7'
                    return (
                  <div style={{padding:16,background:fmtBg,borderRadius:12,textAlign:'center'}}>
                    <div style={{color:fmtAccent,marginBottom:8}}>{f.icon}</div>
                    <div style={{fontWeight:700,fontSize:16}}>{f.name}</div>
                    <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:10}}>
                      <div><span style={{fontSize:'1.3rem',fontWeight:700,color:fmtAccent}}>{f.count}</span><div style={{fontSize:10,color:'#94a3b8'}}>{isIntl ? 'creatives' : '组素材'}</div></div>
                      <div><span style={{fontSize:'1.3rem',fontWeight:700,color:'#22c55e'}}>{f.ctr}%</span><div style={{fontSize:10,color:'#94a3b8'}}>{isIntl ? 'est. CTR' : '预估CTR'}</div></div>
                    </div>
                  </div>
                    )
                  })()}
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl?'Best Practices':'最佳实践'}</div>
                    <div style={{fontSize:12,color:'#64748b',lineHeight:1.8,background:'#f8fafc',padding:14,borderRadius:10}}>
                      {isIntl ? (
                        <>
                          {f.id==='video' && 'Vertical video optimal length: 15–30s. First 3 seconds must hook with a surprise, question, or transformation reveal. Use authentic UGC-style presentation over polished ads. Add closed captions (85% watch without sound). End with clear CTA and product link.'}
                          {f.id==='graphic' && 'Carousel ads: 3–6 cards. First card must stop the scroll — use bold color contrast or a question. Each card should tell one benefit. Final card = offer + CTA. Keep copy under 25 words per card. Use lifestyle imagery over pure product shots.'}
                          {f.id==='clip' && 'Story Ads: 6–15s for full-screen impact. Full bleed visuals, text in upper-third safe zone. Swipe-up/tap CTA must be clear. Use motion graphics to maintain attention. A/B test with and without voiceover. Best for retargeting warm audiences.'}
                        </>
                      ) : (
                        <>
                          {f.id==='video' && '竖版短视频最佳时长15-30秒，前3秒必须有强hook（悬疑/反转/痛点提问）。建议使用真人出镜+产品特写组合，背景音乐选择当下热门BGM。字幕需在安全区域内，重点信息用高亮色标注。'}
                          {f.id==='graphic' && '图文笔记建议4-6张图片，首图需要有强视觉冲击力。标题使用数字+痛点公式（如"3步打造XX妆容"）。正文控制在200-500字，分段清晰，多用emoji提升阅读体验。'}
                          {f.id==='clip' && '直播切片最佳时长10-20秒，需捕捉主播试用产品的高光时刻。建议加入产品价格标签和购买引导文字。音质需清晰，避免嘈杂背景音。'}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl?'Platform Specs':'平台尺寸要求'}</div>
                    <table style={{width:'100%',fontSize:'0.78rem',borderCollapse:'collapse'}}>
                      <thead><tr style={{borderBottom:'1px solid #e2e8f0',color:'#94a3b8'}}><th style={{textAlign:'left',padding:'8px 0'}}>{isIntl?'Platform':'平台'}</th><th>{isIntl?'Resolution':'尺寸'}</th><th>{isIntl?'Length/Count':'时长/数量'}</th><th>{isIntl?'Format':'文件要求'}</th></tr></thead>
                      <tbody>
                        {(isIntl ? (
                          f.id==='video'?[{p:'TikTok for Business',s:'1080×1920',d:'9–60s',r:'MP4, <500MB'},{p:'Meta Reels',s:'1080×1920',d:'3–90s',r:'MP4, <4GB'},{p:'YouTube Shorts',s:'1080×1920',d:'up to 60s',r:'MP4/MOV'}]
                          :f.id==='graphic'?[{p:'Meta Carousel',s:'1080×1080',d:'2–10 cards',r:'JPG/PNG, <30MB'},{p:'Google Discovery',s:'1200×628',d:'3–5 images',r:'JPG/PNG, <5MB'}]
                          :[{p:'Meta Stories',s:'1080×1920',d:'max 15s',r:'MP4, <4GB'},{p:'TikTok TopView',s:'1080×1920',d:'5–60s',r:'MP4, <500MB'}]
                        ) : (
                          f.id==='video'?[{p:'抖音',s:'1080x1920',d:'15-60秒',r:'MP4, <500MB'},{p:'快手',s:'1080x1920',d:'15-57秒',r:'MP4, <500MB'},{p:'视频号',s:'1080x1920',d:'15-60秒',r:'MP4, <1GB'}]
                          :f.id==='graphic'?[{p:'小红书',s:'1080x1440',d:'4-18张',r:'JPG/PNG, <20MB'},{p:'抖音图文',s:'1080x1440',d:'2-12张',r:'JPG/PNG, <10MB'}]
                          :[{p:'抖音',s:'1080x1920',d:'10-30秒',r:'MP4, <200MB'},{p:'快手',s:'1080x1920',d:'10-20秒',r:'MP4, <200MB'}]
                        )).map(r=>(
                          <tr key={r.p} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 0',fontWeight:600}}>{r.p}</td><td>{r.s}</td><td>{r.d}</td><td style={{color:'#94a3b8'}}>{r.r}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl?'Performance Benchmarks':'历史CTR/CVR数据'}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                      {(isIntl?[
                        {l:'Avg CTR',v:`${f.ctr}%`,c:'#3b82f6'},
                        {l:'Avg CVR',v:`${(f.ctr*0.62).toFixed(1)}%`,c:'#22c55e'},
                        {l:'View-through',v:f.id==='video'?'38%':f.id==='clip'?'44%':'N/A',c:'#6366f1'},
                        {l:'Share Rate',v:f.id==='graphic'?'5.8%':'2.9%',c:'#f59e0b'},
                      ]:[
                        {l:'平均CTR',v:`${f.ctr}%`,c:BRAND},
                        {l:'平均CVR',v:`${(f.ctr*0.65).toFixed(1)}%`,c:'#22c55e'},
                        {l:'完播率',v:f.id==='video'?'45%':f.id==='clip'?'52%':'N/A',c:'#6366f1'},
                        {l:'分享率',v:f.id==='graphic'?'8.2%':'3.5%',c:'#f59e0b'},
                      ]).map(s=>(
                        <div key={s.l} style={{textAlign:'center',padding:10,background:`${s.c}08`,borderRadius:8}}>
                          <div style={{fontSize:'1.1rem',fontWeight:700,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:'0.65rem',color:'#94a3b8'}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isIntl?'Creative Examples':'素材示例描述'}</div>
                    {(isIntl ? (
                      f.id==='video'?['Hook 0–3s: "Is this drugstore or luxury?" (transformation reveal)','Mid: authentic try-on + ingredient close-up + before/after','CTA: "Shop now — link in bio" + discount overlay']
                      :f.id==='graphic'?['Card 1: Bold headline "The lip glaze that broke TikTok"','Cards 2–4: Shade swatches + skin-tone pairings','Last card: "$X off today only" + Shop CTA']
                      :['Story 1: Influencer first reaction on-camera','Story 2: Product texture close-up + ingredient callout','Story 3: Swipe-up discount with countdown timer']
                    ) : (
                      f.id==='video'?['开头3秒: 反转hook "你以为这是大牌?其实只要¥79"','中间展示: 真人试色+特写+对比','结尾引导: 限时优惠+购物车引导']
                      :f.id==='graphic'?['封面: 产品平铺+高级感背景+大字标题','详情: 使用步骤图解+对比图','尾图: 购买信息+优惠引导']
                      :['切片1: 主播首次试色惊艳反应','切片2: 产品功效实测对比','切片3: 限时秒杀倒计时氛围']
                    )).map((desc,i)=>(
                      <div key={i} style={{padding:8,background:'#f8fafc',borderRadius:6,marginBottom:6,fontSize:12,color:'#64748b',borderLeft:`3px solid ${isIntl?'#3b82f6':BRAND}`}}>
                        {desc}
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}

            {drillPanel.type === 'platform' && (() => {
              const pl = drillPanel.data
              const isPlIntl = ['meta','tiktok_global','google'].includes(pl.id)
              const accentPl = isPlIntl ? '#3b82f6' : BRAND
              const accentPlLight = isPlIntl ? '#93c5fd' : BRAND_LIGHT
              const detailsDomestic: Record<string,{audience:string,cpm:string,bestContent:string,peak:string,demo:string}> = {
                douyin:{audience:'6.8亿月活，18-35岁女性占比62%',cpm:'¥18-45',bestContent:'短视频种草、直播带货、图文笔记',peak:'12:00-14:00, 19:00-22:00',demo:'一二线城市为主，消费力强，美妆兴趣浓度高'},
                xiaohongshu:{audience:'3.2亿月活，18-34岁女性占比78%',cpm:'¥22-60',bestContent:'图文笔记种草、视频测评、好物分享',peak:'12:00-13:00, 20:00-23:00',demo:'一二线城市年轻女性，注重品质和颜值，种草转化率高'},
                kuaishou:{audience:'5.6亿月活，下沉市场占比高',cpm:'¥12-30',bestContent:'直播带货、短视频、老铁文化内容',peak:'19:00-22:00',demo:'二三线及以下城市，性价比敏感，信任感驱动消费'},
                wechat:{audience:'12亿月活，全年龄段覆盖',cpm:'¥25-80',bestContent:'朋友圈广告、公众号软文、小程序直购',peak:'8:00-9:00, 12:00-13:00, 21:00-22:00',demo:'全年龄段，私域沉淀能力最强，适合高客单价产品'},
              }
              const detailsIntl: Record<string,{audience:string,cpm:string,bestContent:string,peak:string,demo:string}> = {
                meta:{audience:'3.1B MAU globally; US/UK female 18-44 beauty index 2.4x avg',cpm:'$8–22',bestContent:'Reels (vertical video), Carousel Ads, Collection Ads, Stories',peak:'Tue–Thu 11am–2pm EST; Weekend 1–4pm local',demo:'High-intent beauty shoppers; strong in US, UK, AU. Instagram Reels drives 62% of conversions for beauty brands.'},
                tiktok_global:{audience:'1.5B MAU; Gen Z/Millennial female-dominant in US, UK, SEA, JP',cpm:'$6–18',bestContent:'In-feed vertical video, TopView, Spark Ads, Branded Hashtag',peak:'Daily 7–9pm local; Friday–Sunday peaks',demo:'Viral discovery engine. Beauty & skincare is top-3 category. TikTok Shop integrations accelerate US/UK conversions.'},
                google:{audience:'Search intent targeting; YouTube 2.7B MAU; strong in JP, AU, US',cpm:'$5–15 (display); $10–35 (YouTube)',bestContent:'YouTube Skippable In-stream, Discovery Ads, Shopping Ads',peak:'Weekday morning 8–10am; Evening 7–10pm',demo:'High purchase intent via search. YouTube beauty tutorials drive 45% of product discovery in US/UK. Strong retargeting via Google Display Network.'},
              }
              const d = isPlIntl ? (detailsIntl[pl.id] || detailsIntl.meta) : (detailsDomestic[pl.id] || detailsDomestic.douyin)
              return (
                <>
                  <div style={{padding:16,background:isPlIntl?'#eff6ff':'#fff5f7',borderRadius:12,display:'flex',alignItems:'center',gap:14}}>
                    <Monitor size={32} color={accentPl}/>
                    <div>
                      <div style={{fontWeight:700,fontSize:16}}>{pl.name}</div>
                      {pl.recommended && <span style={{background:`linear-gradient(135deg, ${accentPl}, ${accentPlLight})`,color:'#fff',fontSize:10,padding:'2px 8px',borderRadius:4,fontWeight:700}}>{isPlIntl?'AI Recommended':'AI推荐'}</span>}
                      {isPlIntl && <span style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6',fontSize:10,padding:'2px 8px',borderRadius:4,fontWeight:600,marginLeft:6}}>Global Platform</span>}
                    </div>
                  </div>
                  <div style={{padding:14,background:'#f8fafc',borderRadius:10,border:'1px solid #e2e8f0'}}>
                    {(isPlIntl?[{l:'Audience Scale',v:d.audience},{l:'CPM Range',v:d.cpm},{l:'Best Content Types',v:d.bestContent},{l:'Peak Hours',v:d.peak}]:[{l:'受众规模',v:d.audience},{l:'CPM范围',v:d.cpm},{l:'最佳内容类型',v:d.bestContent},{l:'高峰时段',v:d.peak}]).map(r=>(
                      <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e2e8f0',fontSize:'0.78rem',gap:12}}>
                        <span style={{color:'#64748b',flexShrink:0}}>{r.l}</span>
                        <span style={{fontWeight:500,color:'#0f172a',textAlign:'right'}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isPlIntl?'Audience Profile':'受众画像'}</div>
                    <div style={{fontSize:12,color:'#64748b',lineHeight:1.8,background:'#f8fafc',padding:14,borderRadius:10}}>
                      {d.demo}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isPlIntl?'Marie Dalgar Historical Data':'玛丽黛佳历史投放数据'}</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {(isPlIntl?[
                        {l:'30-Day Spend',v:pl.id==='meta'?'$12,400':pl.id==='tiktok_global'?'$8,800':'$5,200',c:accentPl},
                        {l:'Avg. ROAS',v:pl.id==='meta'?'3.8x':pl.id==='tiktok_global'?'4.5x':'3.1x',c:'#22c55e'},
                        {l:'CPA',v:pl.id==='meta'?'$6.4':pl.id==='tiktok_global'?'$5.2':'$8.1',c:'#f59e0b'},
                      ]:[
                        {l:'近30天投放',v:pl.id==='douyin'?'¥18.5万':'¥8.2万',c:accentPl},
                        {l:'平均ROI',v:pl.id==='douyin'?'4.2x':'3.8x',c:'#22c55e'},
                        {l:'转化成本',v:pl.id==='douyin'?'¥18.5':'¥22.3',c:'#f59e0b'},
                      ]).map(s=>(
                        <div key={s.l} style={{textAlign:'center',padding:10,background:`${s.c}08`,borderRadius:8}}>
                          <div style={{fontSize:'1.1rem',fontWeight:700,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:'0.65rem',color:'#94a3b8'}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )
            })()}

            {drillPanel.type === 'audience' && (() => {
              const seg = drillPanel.data
              const isSegIntl = seg.region === '国际'
              const segAccent = isSegIntl ? '#3b82f6' : BRAND
              const segTagBg = isSegIntl ? 'rgba(59,130,246,0.1)' : '#fce7f3'
              return (
                <>
                  <div style={{padding:16,background:isSegIntl?'#eff6ff':'#fff5f7',borderRadius:12,textAlign:'center'}}>
                    <div style={{fontSize:'2rem',fontWeight:700,color:segAccent}}>{seg.score}</div>
                    <div style={{fontSize:14,fontWeight:700,marginTop:4}}>{seg.name}</div>
                    <div style={{fontSize:12,color:'#94a3b8',marginTop:4}}>{seg.desc}</div>
                  </div>
                  <div style={{padding:14,background:'#f8fafc',borderRadius:10,border:'1px solid #e2e8f0'}}>
                    {(isSegIntl?[
                      {l:'Audience Size',v:seg.score>92?'18.4M':'9.2M'},
                      {l:'Brand Buyer Overlap',v:seg.score>92?'38%':'24%'},
                      {l:'Avg. Purchase Freq.',v:seg.score>92?'3.1×/mo':'1.9×/mo'},
                      {l:'Avg. Order Value',v:seg.score>92?'$42':'$28'},
                      {l:'Est. CVR',v:seg.score>92?'3.8%':'2.4%'},
                      {l:'Est. CPA',v:seg.score>92?'$6.2':'$9.8'},
                    ]:[
                      {l:'人群规模',v:seg.score>92?'2,840万':'1,560万'},
                      {l:'与品牌购买者重合度',v:seg.score>92?'42%':'28%'},
                      {l:'月均消费频次',v:seg.score>92?'4.2次':'2.8次'},
                      {l:'客单价',v:seg.score>92?'¥186':'¥125'},
                      {l:'预估转化率',v:seg.score>92?'4.8%':'3.2%'},
                      {l:'预估CPA',v:seg.score>92?'¥15.2':'¥22.8'},
                    ]).map(r=>(
                      <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #e2e8f0',fontSize:'0.78rem'}}>
                        <span style={{color:'#64748b'}}>{r.l}</span>
                        <span style={{fontWeight:600}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isSegIntl?'Behavioral Signals':'行为特征'}</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {(isSegIntl ? (seg.score>92
                        ?['Watches 20+ beauty videos/week','Follows 15+ beauty creators','Buys 3+ beauty items/month','Early adopter of new launches','Engages with brand content','Shares reviews & hauls']
                        :['Researches before buying','Compares multiple brands','Reads ingredient labels','Watches review videos','Price-conscious shopper','Moderate brand loyalty']
                      ) : (seg.score>92
                        ?['每周浏览美妆内容20+次','关注10+美妆博主','月均购买3+件美妆','主动搜索新品','参与品牌活动','分享美妆心得']
                        :['定期关注美妆趋势','比较多品牌后购买','注重成分安全性','阅读评测报告','关注价格优惠','复购忠诚度中等']
                      )).map(t=>(
                        <span key={t} style={{background:segTagBg,color:segAccent,fontSize:11,padding:'4px 10px',borderRadius:6,fontWeight:500}}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>{isSegIntl?'Recommended Messaging':'推荐沟通策略'}</div>
                    <div style={{fontSize:12,color:'#64748b',lineHeight:1.8,background:'#f8fafc',padding:14,borderRadius:10,borderLeft:`3px solid ${segAccent}`}}>
                      {isSegIntl ? (seg.score>92
                        ? 'Deep beauty enthusiasts respond to authentic creator content and expert reviews. Lead with product uniqueness (K-beauty heritage, clean ingredients). Use limited-edition drops and shade exclusives to create urgency.'
                        : 'Ingredient-savvy audience. Lead with science-backed claims and transparent formulation. Avoid hype; focus on real results. Comparison content and clinical test data perform well.'
                      ) : (seg.score>92
                        ? '该人群对美妆有深度热爱，建议使用专业测评+真人试色内容，突出产品独特卖点和专业成分。可适当使用限量版/独家色号等稀缺性话术。'
                        : '该人群注重理性消费，建议使用对比测评+成分分析内容，强调性价比和产品功效数据。避免过度营销，以真实体验为主。')}
                    </div>
                  </div>
                </>
              )
            })()}

            {drillPanel.type === 'summary' && (() => {
              const d = drillPanel.data
              const sumAccent = isIntl ? '#3b82f6' : BRAND
              const sumAccentLight = isIntl ? '#93c5fd' : BRAND_LIGHT
              return (
                <>
                  <div style={{padding:14,background:'#f8fafc',borderRadius:10,border:'1px solid #e2e8f0'}}>
                    {(isIntl ? [
                      {l:'Setting',v:d.label},
                      {l:'Current Value',v:d.value},
                      {l:'AI Recommended',v:d.recommended || d.value},
                      {l:'Source',v:'AI Auto-optimization'},
                    ] : [
                      {l:'配置项',v:d.label},
                      {l:'当前值',v:d.value},
                      {l:'AI推荐值',v:d.recommended || d.value},
                      {l:'配置来源',v:'AI智能推荐'},
                    ]).map(r=>(
                      <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e2e8f0',fontSize:'0.82rem'}}>
                        <span style={{color:'#64748b'}}>{r.l}</span>
                        <span style={{fontWeight:600}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:12,background:isIntl?'rgba(59,130,246,0.06)':'rgba(232,54,93,0.06)',borderRadius:8,fontSize:12,color:'#64748b',lineHeight:1.8}}>
                    <Sparkles size={12} style={{verticalAlign:-1,marginRight:4}} color={sumAccent}/>
                    {isIntl
                      ? 'AI has optimized this setting based on Marie Dalgar historical campaign data, current market competition, and seasonal signals. Edit by returning to the relevant step.'
                      : 'AI已根据玛丽黛佳历史投放数据、当前市场竞争环境和季节因素智能优化此配置。如需调整，请返回对应步骤修改。'}
                  </div>
                  <button onClick={() => { setDrillPanel(null); const stepMap: Record<string,number> = {'投放目标':0,'Campaign Goal':0,'推广商品':1,'Products':1,'素材策略':2,'Creative Strategy':2,'投放平台':3,'Platforms':3,'日预算':3,'Daily Budget':3,'出价策略':3,'Bidding':3}; const s = stepMap[d.label]; if (s !== undefined) { setDirection('back'); setStep(s); }}} style={{
                    padding:'10px 20px',borderRadius:8,border:'none',
                    background:`linear-gradient(135deg, ${sumAccent}, ${sumAccentLight})`,
                    color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',alignSelf:'flex-start'
                  }}>{isIntl ? 'Go Back to Edit' : '返回修改'}</button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: isIntl ? 'linear-gradient(135deg, #3b82f6, #93c5fd)' : `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Rocket size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isIntl ? 'AI Campaign Wizard' : 'AI投放向导'}
            <span style={{ background: isIntl ? 'rgba(59,130,246,0.1)' : '#fce7f3', color: isIntl ? '#3b82f6' : BRAND, fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{isIntl ? 'Global Mode' : '新手必看'}</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{isIntl ? '5 steps to launch globally · AI guides every decision' : '5步完成从零到投放，AI全程指导决策'}</p>
        </div>
      </div>

      {/* Stepper */}
      {!launched && renderStepper()}

      {/* Step Content */}
      <div style={{ minHeight: 400 }}>
        <div key={step} style={{ animation: `${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.35s ease` }}>
          {step === 0 && renderStep1()}
          {step === 1 && renderStep2()}
          {step === 2 && renderStep3()}
          {step === 3 && renderStep4()}
          {step === 4 && renderStep5()}
        </div>
      </div>

      {/* Bottom Navigation */}
      {!launched && !launching && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
          {step > 0 ? (
            <button
              onClick={() => { setDirection('back'); setStep(s => s - 1) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 24px', borderRadius: 10, border: '1px solid #e2e8f0',
                background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} />{isIntl ? 'Back' : '上一步'}
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => { if (canNext()) { setDirection('forward'); setStep(s => s + 1) } }}
              disabled={!canNext()}
              onMouseEnter={() => setNextHover(true)}
              onMouseLeave={() => setNextHover(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 28px', borderRadius: 10, border: 'none',
                background: canNext() ? (isIntl ? 'linear-gradient(135deg, #3b82f6, #93c5fd)' : `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`) : '#e2e8f0',
                color: canNext() ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: 700,
                cursor: canNext() ? 'pointer' : 'not-allowed',
                boxShadow: canNext() ? (isIntl ? '0 4px 14px rgba(59,130,246,0.4)' : `0 4px 14px ${BRAND}44`) : 'none',
                transform: canNext() && nextHover ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {isIntl ? 'Next' : '下一步'}<ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              onMouseEnter={() => setLaunchHover(true)}
              onMouseLeave={() => setLaunchHover(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 32px', borderRadius: 10, border: 'none',
                background: isIntl ? 'linear-gradient(135deg, #3b82f6, #93c5fd)' : `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`,
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', boxShadow: isIntl ? '0 4px 14px rgba(59,130,246,0.4)' : `0 4px 14px ${BRAND}44`,
                animation: `${isIntl ? 'pulseGlowBlue' : 'pulseGlow'} 2s ease-in-out infinite`,
                transform: launchHover ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
            >
              <Rocket size={18} />{isIntl ? 'Launch Campaign' : '确认发布'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
