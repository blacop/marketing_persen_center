import { useState } from 'react'
import {
  Users, Search, TrendingUp, DollarSign, Star, Globe,
  BarChart3, Activity, Eye, Heart, MessageCircle, Share2, Brain
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   KOL智能发现 —— AI驱动达人匹配与合作管理
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['达人智能发现', '达人画像分析', '合作ROI追踪', '竞品达人监控']

const discoveryStats = {
  totalKOL: '32.4万',
  dailyNew: 12847,
  activeCollabs: 8291,
  aiMatchAccuracy: 91.2,
}

const recommendedKOLs = [
  { id: 'K-001', name: '美妆博主@雪肤小颜', platform: '抖音', region: '华东', followers: '382万', engagement: 8.5, category: '美妆测评', matchScore: 96, avgCPM: '¥45', estROI: 4.2, status: 'AI推荐' },
  { id: 'K-002', name: '护肤科普@成分研究社', platform: '小红书', region: '华南', followers: '156万', engagement: 9.2, category: '护肤科普', matchScore: 94, avgCPM: '¥38', estROI: 3.8, status: 'AI推荐' },
  { id: 'K-003', name: '彩妆达人@晚晚makeup', platform: '抖音', region: '华北', followers: '850万', engagement: 7.8, category: '彩妆教程', matchScore: 92, avgCPM: '¥82', estROI: 3.5, status: '洽谈中' },
  { id: 'K-004', name: '美妆种草@粉粉的小仙女', platform: '小红书', region: '华东', followers: '89万', engagement: 11.3, category: '种草分享', matchScore: 91, avgCPM: '¥28', estROI: 5.1, status: 'AI推荐' },
  { id: 'K-005', name: '直播带货@口红上新', platform: '抖音直播', region: '华南', followers: '215万', engagement: 6.8, category: '直播带货', matchScore: 89, avgCPM: '¥65', estROI: 4.8, status: '已合作' },
  { id: 'K-006', name: '快美博主@小白兔变美记', platform: '快手', region: '华北', followers: '128万', engagement: 10.1, category: '平价美妆', matchScore: 88, avgCPM: '¥22', estROI: 5.3, status: 'AI推荐' },
  { id: 'K-007', name: '成分党@皮肤科学研究所', platform: '小红书', region: '华东', followers: '68万', engagement: 12.5, category: '成分科普', matchScore: 87, avgCPM: '¥18', estROI: 6.2, status: '洽谈中' },
  { id: 'K-008', name: '美妆视频@彩妆师小雅', platform: '抖音', region: '华中', followers: '445万', engagement: 7.2, category: '彩妆教程', matchScore: 85, avgCPM: '¥55', estROI: 3.9, status: 'AI推荐' },
]

const profileRadar = [
  { metric: '粉丝质量', value: 88 },
  { metric: '互动率', value: 92 },
  { metric: '内容相关度', value: 85 },
  { metric: '商业价值', value: 90 },
  { metric: '成长潜力', value: 78 },
  { metric: '受众匹配', value: 95 },
]

const audienceBreakdown = [
  { age: '13-17', pct: 8 },
  { age: '18-24', pct: 35 },
  { age: '25-34', pct: 32 },
  { age: '35-44', pct: 15 },
  { age: '45+', pct: 10 },
]

const contentPerformance = [
  { type: '彩妆教程', views: '85万', engagement: 9.2, convRate: 5.8 },
  { type: '护肤测评', views: '62万', engagement: 8.8, convRate: 4.2 },
  { type: '种草分享', views: '48万', engagement: 11.5, convRate: 7.1 },
  { type: '直播切片', views: '125万', engagement: 6.5, convRate: 8.9 },
  { type: '成分科普', views: '35万', engagement: 13.2, convRate: 3.8 },
]

const collabROI = [
  { kol: '雪肤小颜', product: '唇釉丝绒系列-抖音', spend: '¥45,000', impressions: '285万', installs: 0, cpi: '-', revenue: '¥189,000', roi: 4.20, status: '进行中' },
  { kol: '成分研究社', product: '护肤套装-小红书', spend: '¥28,000', impressions: '156万', installs: 0, cpi: '-', revenue: '¥106,000', roi: 3.79, status: '已结束' },
  { kol: '粉粉的小仙女', product: '眼影盘星空色-小红书', spend: '¥18,500', impressions: '98万', installs: 0, cpi: '-', revenue: '¥95,000', roi: 5.13, status: '进行中' },
  { kol: '口红上新', product: '粉底液-抖音直播', spend: '¥62,000', impressions: '425万', installs: 0, cpi: '-', revenue: '¥298,000', roi: 4.81, status: '进行中' },
  { kol: '小白兔变美记', product: '平价彩妆套装-快手', spend: '¥15,000', impressions: '88万', installs: 0, cpi: '-', revenue: '¥79,500', roi: 5.30, status: '已结束' },
]

const roiTrend = [
  { month: '10月', tutorial: 3.2, review: 2.8, live: 3.8 },
  { month: '11月', tutorial: 3.5, review: 3.1, live: 4.1 },
  { month: '12月', tutorial: 3.8, review: 3.4, live: 4.5 },
  { month: '1月', tutorial: 3.6, review: 3.2, live: 4.8 },
  { month: '2月', tutorial: 4.1, review: 3.7, live: 5.0 },
  { month: '3月', tutorial: 4.3, review: 3.9, live: 5.2 },
]

const competitorKOLs = [
  { competitor: '完美日记', kol: '@完子心选测评', platform: '抖音', followers: '520万', estSpend: '¥80K/月', frequency: '日更', ourAdvantage: '可争取' },
  { competitor: '花西子', kol: '@美妆研习所', platform: '小红书', followers: '280万', estSpend: '¥45K/月', frequency: '3次/周', ourAdvantage: '已接触' },
  { competitor: 'COLORKEY', kol: '@色号控', platform: '抖音', followers: '195万', estSpend: '¥32K/月', frequency: '2次/周', ourAdvantage: '价格优势' },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

// ── KOL detail extra data ──
const kolDetailExtra: Record<string, {
  contentStyle: string; audienceDemographics: string
  pastBrands: string[]; predictedROI: { vertical: string; roi: number }[]
}> = {
  'K-001': { contentStyle: '彩妆测评+上妆教程，节奏明快，高互动', audienceDemographics: '92% 女性，18-30岁，华东为主', pastBrands: ['玛丽黛佳', '花西子', '完美日记'], predictedROI: [{ vertical: '彩妆', roi: 4.2 }, { vertical: '护肤', roi: 3.1 }, { vertical: '直播', roi: 5.0 }] },
  'K-002': { contentStyle: '成分科普+护肤测评，专业学术风格', audienceDemographics: '88% 女性，22-35岁，华南用户', pastBrands: ['薇诺娜', '珂拉琪', 'HomeFacialPro'], predictedROI: [{ vertical: '护肤', roi: 3.8 }, { vertical: '彩妆', roi: 2.5 }, { vertical: '直播', roi: 3.2 }] },
  'K-003': { contentStyle: '彩妆仿妆+色号测评，强视觉冲击', audienceDemographics: '90% 女性，18-28岁，华北', pastBrands: ['3CE', 'COLORKEY', 'UNNY'], predictedROI: [{ vertical: '彩妆', roi: 3.5 }, { vertical: '护肤', roi: 2.1 }, { vertical: '直播', roi: 4.2 }] },
  'K-004': { contentStyle: '种草分享+日常妆容，亲和力强', audienceDemographics: '95% 女性，18-26岁，华东', pastBrands: ['完美日记', '橘朵', '酵色'], predictedROI: [{ vertical: '彩妆', roi: 5.1 }, { vertical: '护肤', roi: 3.8 }, { vertical: '直播', roi: 5.5 }] },
  'K-005': { contentStyle: '直播带货+新品首发，实时互动强', audienceDemographics: '93% 女性，20-35岁，华南', pastBrands: ['玛丽黛佳', 'MAC', 'NARS'], predictedROI: [{ vertical: '直播', roi: 4.8 }, { vertical: '彩妆', roi: 3.9 }, { vertical: '护肤', roi: 3.2 }] },
  'K-006': { contentStyle: '平价美妆测评+平民种草，高性价比', audienceDemographics: '91% 女性，18-25岁，华北', pastBrands: ['橘朵', '稚优泉', 'UNNY'], predictedROI: [{ vertical: '彩妆', roi: 5.3 }, { vertical: '护肤', roi: 3.5 }, { vertical: '直播', roi: 4.1 }] },
  'K-007': { contentStyle: '成分解析+皮肤科学，深度科普内容', audienceDemographics: '85% 女性，22-38岁，华东', pastBrands: ['薇诺娜', '修丽可', '科颜氏'], predictedROI: [{ vertical: '护肤', roi: 6.2 }, { vertical: '彩妆', roi: 2.8 }, { vertical: '直播', roi: 3.5 }] },
  'K-008': { contentStyle: '专业彩妆教程+妆容复盘，干货满满', audienceDemographics: '94% 女性，20-32岁，华中', pastBrands: ['玛丽黛佳', '花西子', 'MAC'], predictedROI: [{ vertical: '彩妆', roi: 3.9 }, { vertical: '护肤', roi: 2.9 }, { vertical: '直播', roi: 4.3 }] },
}

const overlayStyleKOL: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.45)', zIndex: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
}

// ── AI配置: KOL发现 ──
const kolAIConfigGroups: AIConfigGroup[] = [
  {
    title: 'KOL评估模型',
    icon: <Brain size={16} />,
    params: [
      createParam('followerQualityWeight', '粉丝质量权重', 35, '%', '粉丝真实度与活跃度在综合评分中的权重', 35, 84, { min: 0, max: 100 }),
      createParam('engagementRateThreshold', '互动率阈值', 3.5, '%', '低于此互动率的KOL不进入推荐池', 3.5, 87, { min: 0.1, max: 20, step: 0.1 }),
      createParam('contentMatchMinScore', '内容匹配度最低分', 65, '', '基于NLP分析的内容-产品匹配评分下限', 65, 81, { min: 0, max: 100 }),
      createParam('costEfficiencyWeight', '性价比评估权重', 25, '%', 'CPM/CPE性价比在综合评分中的权重', 25, 83, { min: 0, max: 100 }),
    ],
  },
  {
    title: '合作推荐策略',
    icon: <Star size={16} />,
    params: [
      createParam('poolRefreshFrequency', '推荐池刷新频率', 6, '小时', '重新计算KOL推荐排序的间隔', 6, 79, { min: 1, max: 72 }),
      createParam('similarKolThreshold', '相似KOL关联度阈值', 70, '%', '推荐相似KOL时的最低关联度要求', 70, 82, { min: 0, max: 100 }),
      createParam('budgetMatchTolerance', '预算匹配容差', 15, '%', '允许推荐报价在预算上下浮动的比例', 15, 86, { min: 0, max: 50 }),
    ],
  },
]

const kolAILearningStatus: AILearningStatus = {
  modelVersion: 'v1.5.0-kol',
  lastTraining: '1小时前',
  totalDataPoints: 156000,
  avgConfidence: 82,
  autoAdjustCount24h: 23,
  learningRate: '0.005',
  nextTraining: '2小时后',
  improvementRate: '+8.7%',
}

// ── 国际达人数据 ──
const intlCreators = [
  { id: 'I-001', handle: '@beautybyella',   country: '🇺🇸', market: '美国', platform: 'TikTok',    followers: '2.4M', engagement: 7.8, category: '美妆',   roas: 5.2, aiScore: 92, status: '合作中' },
  { id: 'I-002', handle: '@makeupbymia',    country: '🇬🇧', market: '英国', platform: 'Instagram', followers: '890K', engagement: 6.5, category: '护肤',   roas: 4.8, aiScore: 88, status: 'AI推荐' },
  { id: 'I-003', handle: '@glowwithjenny', country: '🇸🇬', market: '新加坡', platform: 'TikTok',  followers: '1.1M', engagement: 9.1, category: '美妆',   roas: 6.1, aiScore: 94, status: '合作中' },
  { id: 'I-004', handle: '@sakura_beauty',  country: '🇯🇵', market: '日本', platform: 'YouTube',   followers: '650K', engagement: 5.9, category: '护肤',   roas: 4.2, aiScore: 82, status: 'AI推荐' },
  { id: 'I-005', handle: '@luxelooks',      country: '🇺🇸', market: '美国', platform: 'Instagram', followers: '3.2M', engagement: 4.8, category: '生活方式', roas: 3.9, aiScore: 79, status: '洽谈中' },
  { id: 'I-006', handle: '@beautyblend_uk', country: '🇬🇧', market: '英国', platform: 'TikTok',   followers: '780K', engagement: 8.3, category: '美妆',   roas: 5.5, aiScore: 91, status: 'AI推荐' },
]

const intlAutoMatched = [
  { handle: '@glowwithjenny', country: '🇸🇬', platform: 'TikTok',    aiScore: 94, roas: 6.1, reason: '受众与玛丽黛佳目标人群高度重叠，东南亚美妆市场增速+38%' },
  { handle: '@beautybyella',  country: '🇺🇸', platform: 'TikTok',    aiScore: 92, roas: 5.2, reason: '美国TikTok美妆赛道头部，内容风格与品牌调性匹配度96%' },
  { handle: '@beautyblend_uk',country: '🇬🇧', platform: 'TikTok',    aiScore: 91, roas: 5.5, reason: '英国Z世代护肤/美妆高互动，预计带动欧洲市场ROI 5.5x' },
]

const platformBadgeColor: Record<string, string> = {
  TikTok: '#010101',
  Instagram: '#e1306c',
  YouTube: '#ff0000',
}

export default function KOLDiscovery() {
  const [activeTab, setActiveTab] = useState(0)
  const [marketTab, setMarketTab] = useState<'domestic' | 'international'>('domestic')
  const [intlPlatform, setIntlPlatform] = useState('全部')
  const [intlMarket, setIntlMarket] = useState('全部')
  const [intlCategory, setIntlCategory] = useState('全部')
  useRegisterAIConfig(kolAIConfigGroups, kolAILearningStatus, 'KOL发现')
  const [selectedKOL, setSelectedKOL] = useState<typeof recommendedKOLs[0] | null>(null)

  const matchColor = (score: number) =>
    score >= 90 ? '#34d399' : score >= 80 ? '#60a5fa' : '#fbbf24'

  const statusColor = (s: string) =>
    s === 'AI推荐' ? '#ff7a95' : s === '已合作' ? '#34d399' : '#fbbf24'

  return (
    <>
      {/* ══ KOL Detail Slide-over ══ */}
      {selectedKOL && (() => {
        const k = selectedKOL
        const extra = kolDetailExtra[k.id] || { contentStyle: '-', audienceDemographics: '-', pastBrands: [], predictedROI: [] }
        return (
          <div style={overlayStyleKOL} onClick={() => setSelectedKOL(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 480, height: '100vh', background: 'var(--bg-card)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ff7a95' }}>{k.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{k.platform} · {k.region} · {k.category}</div>
                </div>
                <button onClick={() => setSelectedKOL(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>达人档案</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: '粉丝', value: k.followers, color: '#ff7a95' },
                    { label: '互动率', value: `${k.engagement}%`, color: k.engagement > 7 ? '#22c55e' : '#fbbf24' },
                    { label: '预估CPM', value: k.avgCPM, color: 'var(--text-primary)' },
                    { label: '匹配度', value: `${k.matchScore}`, color: matchColor(k.matchScore) },
                    { label: '预估ROI', value: `${k.estROI}x`, color: '#22c55e' },
                    { label: '状态', value: k.status, color: statusColor(k.status) },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>内容风格与受众</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>内容风格分析</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '8px 10px' }}>{extra.contentStyle}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>受众画像</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '8px 10px' }}>{extra.audienceDemographics}</div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>历史品牌合作</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {extra.pastBrands.length > 0 ? extra.pastBrands.map(brand => (
                    <span key={brand} style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: 20, background: 'rgba(167,139,250,0.12)', color: '#ff7a95', fontWeight: 600 }}>{brand}</span>
                  )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>暂无记录</span>}
                </div>
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>我方垂类预测ROI (彩妆/护肤/直播)</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {extra.predictedROI.map(v => (
                    <div key={v.vertical} style={{ flex: 1, textAlign: 'center', padding: '12px 6px', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{v.vertical}</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: v.roi >= 3 ? '#22c55e' : v.roi >= 2 ? '#fbbf24' : '#ef4444' }}>{v.roi}x</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '立即邀约', primary: true },
                  { label: '加入候选', primary: false },
                  { label: '查看主页', primary: false },
                  { label: '价格谈判', primary: false },
                ].map(btn => (
                  <button key={btn.label} onClick={() => setSelectedKOL(null)} style={{
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    border: btn.primary ? 'none' : '1px solid #ff7a95',
                    background: btn.primary ? '#ff7a95' : 'transparent',
                    color: btn.primary ? '#fff' : '#ff7a95',
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={22} color="#ff7a95" />
          KOL智能发现
        </h2>
        <p>AI驱动达人匹配 · 自动评估ROI · 竞品达人监控</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ff7a95', background: 'var(--rose-50, #f5f3ff)', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, marginTop: 8 }}>
          <Search size={14} />
          <span>AI匹配准确率 {discoveryStats.aiMatchAccuracy}%</span>
        </div>
      </div>

      <div className="page-content">
        {/* ── 市场切换 ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: '4px', background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)', width: 'fit-content' }}>
          {([
            { key: 'domestic',      label: '🇨🇳 国内达人' },
            { key: 'international', label: '🌍 国际达人' },
          ] as { key: 'domestic' | 'international'; label: string }[]).map(m => (
            <button
              key={m.key}
              onClick={() => setMarketTab(m.key)}
              style={{
                padding: '7px 20px', borderRadius: 9, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                border: 'none',
                background: marketTab === m.key ? '#ff7a95' : 'transparent',
                color: marketTab === m.key ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.18s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ══ 国际达人 Tab ══ */}
        {marketTab === 'international' && (
          <>
            {/* 搜索/过滤栏 */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
              {/* Platform filter */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>平台</span>
                {['全部', 'TikTok', 'Instagram', 'YouTube'].map(p => (
                  <button key={p} onClick={() => setIntlPlatform(p)} style={{
                    padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    border: `1px solid ${intlPlatform === p ? '#ff7a95' : 'var(--border)'}`,
                    background: intlPlatform === p ? 'rgba(255,122,149,0.12)' : 'transparent',
                    color: intlPlatform === p ? '#ff7a95' : 'var(--text-secondary)',
                  }}>{p}</button>
                ))}
              </div>
              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
              {/* Market filter */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>市场</span>
                {['全部', '🇺🇸 美国', '🇬🇧 英国', '🇯🇵 日本', '🇸🇬 新加坡'].map(mk => (
                  <button key={mk} onClick={() => setIntlMarket(mk)} style={{
                    padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    border: `1px solid ${intlMarket === mk ? '#ff7a95' : 'var(--border)'}`,
                    background: intlMarket === mk ? 'rgba(255,122,149,0.12)' : 'transparent',
                    color: intlMarket === mk ? '#ff7a95' : 'var(--text-secondary)',
                  }}>{mk}</button>
                ))}
              </div>
              <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
              {/* Category filter */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>类目</span>
                {['全部', '美妆', '护肤', '生活方式'].map(cat => (
                  <button key={cat} onClick={() => setIntlCategory(cat)} style={{
                    padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    border: `1px solid ${intlCategory === cat ? '#ff7a95' : 'var(--border)'}`,
                    background: intlCategory === cat ? 'rgba(255,122,149,0.12)' : 'transparent',
                    color: intlCategory === cat ? '#ff7a95' : 'var(--text-secondary)',
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Creator cards 3×2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {intlCreators
                .filter(c => intlPlatform === '全部' || c.platform === intlPlatform)
                .filter(c => intlMarket === '全部' || intlMarket.includes(c.market))
                .filter(c => intlCategory === '全部' || c.category === intlCategory)
                .map(c => (
                  <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Avatar + handle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #ff7a95, #c084fc)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', fontWeight: 800, color: '#fff',
                      }}>
                        {c.handle[1].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.handle}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                          {/* Platform badge */}
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                            background: platformBadgeColor[c.platform] ?? '#444',
                            color: '#fff',
                          }}>{c.platform}</span>
                          {/* Country flag */}
                          <span style={{ fontSize: '0.8rem' }}>{c.country}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.market}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { label: '粉丝数', value: c.followers, color: '#ff7a95' },
                        { label: '互动率', value: `${c.engagement}%`, color: c.engagement >= 7 ? '#22c55e' : '#fbbf24' },
                        { label: 'ROAS', value: `${c.roas}x`, color: '#34d399' },
                        { label: '类目', value: c.category, color: 'var(--text-primary)' },
                      ].map(m => (
                        <div key={m.label} style={{ background: 'var(--bg-primary)', borderRadius: 7, padding: '7px 10px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* AI综合评分 */}
                    <div style={{ background: 'rgba(255,122,149,0.07)', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(255,122,149,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginBottom: 2 }}>AI综合评分</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: c.aiScore >= 90 ? '#22c55e' : c.aiScore >= 80 ? '#60a5fa' : '#fbbf24' }}>{c.aiScore}</div>
                      </div>
                      <ModelBadge name="IntlCreator-Scorer" color="#8b5cf6" />
                    </div>

                    {/* 合作状态 button */}
                    <button style={{
                      padding: '7px 0', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                      border: c.status === '合作中' ? 'none' : `1px solid #ff7a95`,
                      background: c.status === '合作中' ? '#ff7a95' : 'transparent',
                      color: c.status === '合作中' ? '#fff' : '#ff7a95',
                      width: '100%',
                    }}>
                      {c.status === '合作中' ? '✓ 合作中' : c.status === 'AI推荐' ? '+ 发起合作' : '洽谈中...'}
                    </button>
                  </div>
                ))}
            </div>

            {/* AI智能匹配 panel */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>
                  <Brain size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> AI智能匹配
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>为玛丽黛佳美妆匹配最佳国际达人</span>
                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                  <ModelBadge name="KOLMatch-GNN" color="#06b6d4" />
                  <ModelBadge name="IntlCreator-Scorer" color="#8b5cf6" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {intlAutoMatched.map((m, i) => (
                  <div key={m.handle} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: ['#ff7a95', '#60a5fa', '#34d399'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '0.78rem', flexShrink: 0 }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.handle}</span>
                        <span style={{ fontSize: '0.8rem' }}>{m.country}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: platformBadgeColor[m.platform] ?? '#444', color: '#fff' }}>{m.platform}</span>
                        <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>AI评分 {m.aiScore}</span>
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>ROAS {m.roas}x</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.reason}</div>
                    </div>
                    <button style={{ padding: '6px 14px', borderRadius: 7, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, border: 'none', background: '#ff7a95', color: '#fff', flexShrink: 0 }}>
                      立即匹配
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══ 国内达人 Tab ══ */}
        {marketTab === 'domestic' && (
          <>

        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="KOLScore-MultiDim" color="#06b6d4" />
          <ModelBadge name="FanFraud-GNN" color="#f59e0b" />
          <ModelBadge name="CompetitorIntel-NLP" color="#8b5cf6" />
          <ModelBadge name="AudienceCluster-KM" color="#8b5cf6" />
          <ModelBadge name="Lookalike-Expander" color="#e8365d" />
        </div>

        <div className="tabs" style={{ marginBottom: 20 }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: 达人智能发现 */}
        {activeTab === 0 && (
          <>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { label: '达人库总量', value: discoveryStats.totalKOL, icon: <Users size={14} style={{ verticalAlign: 'middle' }} /> },
                { label: '日新增发现', value: discoveryStats.dailyNew.toLocaleString(), icon: <Search size={14} style={{ verticalAlign: 'middle' }} /> },
                { label: '活跃合作中', value: discoveryStats.activeCollabs.toLocaleString(), icon: <Activity size={14} style={{ verticalAlign: 'middle' }} /> },
                { label: 'AI匹配准确率', value: `${discoveryStats.aiMatchAccuracy}%`, icon: <Star size={14} style={{ verticalAlign: 'middle' }} /> },
              ].map(s => (
                <div className="card" key={s.label}>
                  <div className="card-title">{s.icon} {s.label}</div>
                  <div className="card-value" style={{ color: '#ff7a95' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">
                <Star size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> AI智能推荐达人
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>达人</th>
                    <th>平台</th>
                    <th>区域</th>
                    <th>粉丝</th>
                    <th>互动率</th>
                    <th>类目</th>
                    <th>匹配度</th>
                    <th>预估CPM</th>
                    <th>预估ROI</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedKOLs.map(k => (
                    <tr key={k.id} onClick={() => setSelectedKOL(k)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 600 }}>{k.name}</td>
                      <td>{k.platform}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{k.region}</td>
                      <td>{k.followers}</td>
                      <td>{k.engagement}%</td>
                      <td>{k.category}</td>
                      <td style={{ fontWeight: 700, color: matchColor(k.matchScore) }}>{k.matchScore}</td>
                      <td>{k.avgCPM}</td>
                      <td style={{ color: '#34d399', fontWeight: 600 }}>{k.estROI}x</td>
                      <td style={{ fontWeight: 600, color: statusColor(k.status) }}>{k.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-title">
                <TrendingUp size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> AI匹配逻辑
              </div>
              <div style={{ background: 'var(--rose-50, #f5f3ff)', borderRadius: 8, padding: 14, fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.8, border: '1px solid var(--border-light)' }}>
                产品画像(彩妆·国内) → 受众特征(18-30F·美妆爱好者) → 达人库筛选(美妆类·抖音/小红书·粉丝50W+) → 互动率加权 → 历史合作ROI参考 → 匹配度排序 → Top8推荐
              </div>
            </div>
          </>
        )}

        {/* Tab 2: 达人画像分析 */}
        {activeTab === 1 && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title">
                  <Eye size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> 达人详情 — 美妆博主@雪肤小颜
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: '平台', value: '抖音' },
                    { label: '粉丝', value: '382万' },
                    { label: '平均播放', value: '45万' },
                    { label: '互动率', value: '8.5%' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>受众地区分布</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['华东 42%', '华南 28%', '华北 18%', '华中 12%'].map(r => (
                      <span key={r} style={{ fontSize: '0.7rem', background: 'var(--rose-50, #f5f3ff)', color: '#ff7a95', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="section-title">达人综合评分</div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={profileRadar}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#ff7a95" fill="#ff7a95" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title">受众年龄分布</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={audienceBreakdown}>
                    <XAxis dataKey="age" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="pct" name="占比%" fill="#ff7a95" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div className="section-title">
                  <MessageCircle size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> 内容类型表现
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>内容类型</th>
                      <th>平均播放</th>
                      <th>互动率</th>
                      <th>转化率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentPerformance.map(c => (
                      <tr key={c.type}>
                        <td>{c.type}</td>
                        <td>{c.views}</td>
                        <td style={{ color: '#ff7a95' }}>{c.engagement}%</td>
                        <td style={{ color: '#34d399' }}>{c.convRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="section-title">社交互动指标</div>
              <div className="grid-4">
                {[
                  { label: '平均点赞', value: '45.2K', icon: <Heart size={18} color="#f87171" />, change: '+12%' },
                  { label: '平均评论', value: '3,800', icon: <MessageCircle size={18} color="#60a5fa" />, change: '+8%' },
                  { label: '平均分享', value: '12.5K', icon: <Share2 size={18} color="#34d399" />, change: '+15%' },
                  { label: '平均播放', value: '450K', icon: <Eye size={18} color="#ff7a95" />, change: '+5%' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{m.icon}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{m.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: 4 }}>{m.change}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab 3: 合作ROI追踪 */}
        {activeTab === 2 && (
          <>
            <div className="grid-3" style={{ marginBottom: 20 }}>
              {[
                { category: '教程KOL', avgROI: 4.3, collabs: 45, totalSpend: '¥280万' },
                { category: '测评KOL', avgROI: 3.9, collabs: 32, totalSpend: '¥180万' },
                { category: '直播KOL', avgROI: 5.2, collabs: 18, totalSpend: '¥350万' },
              ].map(c => (
                <div className="card" key={c.category}>
                  <div className="card-title">{c.category}</div>
                  <div className="card-value" style={{ color: '#ff7a95' }}>
                    {c.avgROI}x <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>平均ROI</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>{c.collabs}次合作</span>
                    <span>总花费 {c.totalSpend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">
                <TrendingUp size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> KOL合作ROI趋势 (6个月)
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={roiTrend}>
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="tutorial" name="教程KOL" fill="#ff7a95" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="review" name="测评KOL" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="live" name="直播KOL" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="section-title">
                <DollarSign size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> 合作ROI明细
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>达人</th>
                    <th>产品</th>
                    <th>花费</th>
                    <th>曝光</th>
                    <th>GMV</th>
                    <th>ROI</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {collabROI.map(c => (
                    <tr key={c.kol + c.product}>
                      <td style={{ fontWeight: 600 }}>{c.kol}</td>
                      <td>{c.product}</td>
                      <td>{c.spend}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.impressions}</td>
                      <td style={{ color: '#34d399' }}>{c.revenue}</td>
                      <td style={{ fontWeight: 700, color: c.roi >= 3.0 ? '#34d399' : c.roi >= 2.0 ? '#60a5fa' : '#fbbf24' }}>{c.roi}x</td>
                      <td style={{ color: c.status === '进行中' ? '#34d399' : 'var(--text-muted)' }}>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 4: 竞品达人监控 */}
        {activeTab === 3 && (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">
                <Globe size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> 竞品达人使用情报
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>竞品</th>
                    <th>达人</th>
                    <th>平台</th>
                    <th>粉丝</th>
                    <th>预估月花费</th>
                    <th>投放频率</th>
                    <th>我方策略</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorKOLs.map((c, i) => (
                    <tr key={i}>
                      <td>{c.competitor}</td>
                      <td style={{ fontWeight: 600 }}>{c.kol}</td>
                      <td>{c.platform}</td>
                      <td>{c.followers}</td>
                      <td style={{ color: '#fbbf24' }}>{c.estSpend}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.frequency}</td>
                      <td style={{ fontWeight: 600, color: c.ourAdvantage === '独家签' ? '#34d399' : c.ourAdvantage === '已接触' || c.ourAdvantage === '已报价' ? '#60a5fa' : '#ff7a95' }}>{c.ourAdvantage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid-3" style={{ marginBottom: 20 }}>
              {[
                { competitor: '完美日记', kolCount: 35, monthlySpend: '¥450万', topPlatform: '抖音', strategy: '高频彩妆教程推广' },
                { competitor: '花西子', kolCount: 22, monthlySpend: '¥380万', topPlatform: '小红书', strategy: '东方美学深度合作' },
                { competitor: 'COLORKEY', kolCount: 18, monthlySpend: '¥220万', topPlatform: '抖音', strategy: '口红色号种草' },
              ].map(c => (
                <div className="card" key={c.competitor}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>{c.competitor}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>合作达人</span><span>{c.kolCount}位</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>月投放预估</span><span style={{ color: '#fbbf24' }}>{c.monthlySpend}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>主平台</span><span>{c.topPlatform}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>策略</span><span style={{ color: '#ff7a95' }}>{c.strategy}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title">
                <BarChart3 size={16} color="#ff7a95" style={{ verticalAlign: 'middle' }} /> AI竞品达人洞察
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  '完美日记 近期加大抖音彩妆教程KOL投入，建议争抢 @晚晚makeup(850万粉丝，尚未独占)',
                  '花西子 开始接触成分科普领域KOL，可能拓展护肤赛道，建议提前锁定 @皮肤科学研究所',
                  '快手平台KOL成本仅为抖音1/3，但转化率更高(5.3x vs 4.2x)，建议加大快手KOL合作',
                  '直播类KOL整体ROI最高(5.2x)，建议将更多预算向直播带货KOL倾斜，优先抖音直播品类',
                ].map((insight, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--rose-50, #f5f3ff)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border-light)' }}>{insight}</div>
                ))}
              </div>
            </div>
          </>
        )}

          </>
        )}
      </div>
    </>
  )
}
