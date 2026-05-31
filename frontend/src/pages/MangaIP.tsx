import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import {
  ShoppingBag, Star, Globe,
  Shield, DollarSign, Eye, AlertTriangle,
  Zap, BarChart3, X, TrendingUp, List, Target, Brain
} from 'lucide-react'
import { createParam } from '../components/AIConfigPanel'
import type { AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ===== 产品线数据 =====
const productLines = [
  {
    id: 'PL-001', name: '唇釉丝绒系列', category: '唇部', series: '经典系列',
    skuCount: 8, rating: 9.5, potential: 98, status: 'active' as const,
    platforms: ['抖音', '小红书', '天猫', '京东'], campaigns: 4,
    priceRange: { min: 89, max: 139 },
    evaluation: { productScore: 95, packagingScore: 92, marketFit: 98, contentability: 96, audienceSize: 94 },
    performance: { totalGMV: 12800000, avgCTR: 7.2, avgCVR: 4.8, roi: 3.85, topPlatform: '抖音' },
    tags: ['哑光', '丝绒质地', '显色度高', '长效持久'],
    grassIndex: 95, searchLift: 42,
  },
  {
    id: 'PL-002', name: '眼影盘星空', category: '眼部', series: '限定系列',
    skuCount: 3, rating: 9.2, potential: 92, status: 'active' as const,
    platforms: ['小红书', '抖音'], campaigns: 2,
    priceRange: { min: 168, max: 268 },
    evaluation: { productScore: 92, packagingScore: 96, marketFit: 90, contentability: 95, audienceSize: 88 },
    performance: { totalGMV: 8900000, avgCTR: 6.8, avgCVR: 4.2, roi: 3.52, topPlatform: '小红书' },
    tags: ['星空配色', '高显色', '哑光+闪光', '礼盒装'],
    grassIndex: 92, searchLift: 38,
  },
  {
    id: 'PL-003', name: '粉底液水光', category: '底妆', series: '主打系列',
    skuCount: 15, rating: 9.0, potential: 88, status: 'active' as const,
    platforms: ['抖音', '快手', '天猫'], campaigns: 3,
    priceRange: { min: 198, max: 298 },
    evaluation: { productScore: 90, packagingScore: 88, marketFit: 92, contentability: 85, audienceSize: 92 },
    performance: { totalGMV: 7500000, avgCTR: 5.8, avgCVR: 3.8, roi: 3.38, topPlatform: '天猫' },
    tags: ['15色号', '水光感', '遮瑕轻薄', '持妆12h'],
    grassIndex: 85, searchLift: 28,
  },
  {
    id: 'PL-004', name: '卸妆水温和', category: '卸妆', series: '温和系列',
    skuCount: 4, rating: 9.3, potential: 85, status: 'active' as const,
    platforms: ['小红书', '天猫', '京东'], campaigns: 2,
    priceRange: { min: 89, max: 168 },
    evaluation: { productScore: 93, packagingScore: 85, marketFit: 88, contentability: 90, audienceSize: 86 },
    performance: { totalGMV: 5800000, avgCTR: 5.2, avgCVR: 3.9, roi: 3.29, topPlatform: '小红书' },
    tags: ['成分温和', '敏感肌友好', '无刺激', '深层清洁'],
    grassIndex: 80, searchLift: 22,
  },
  {
    id: 'PL-005', name: '睫毛膏纤长', category: '眼部', series: '经典系列',
    skuCount: 3, rating: 8.8, potential: 80, status: 'developing' as const,
    platforms: ['抖音', '快手'], campaigns: 1,
    priceRange: { min: 79, max: 129 },
    evaluation: { productScore: 88, packagingScore: 82, marketFit: 82, contentability: 80, audienceSize: 78 },
    performance: { totalGMV: 2800000, avgCTR: 4.5, avgCVR: 3.2, roi: 3.14, topPlatform: '抖音' },
    tags: ['纤长加密', '不晕染', '亚洲睫毛适配', '防水'],
    grassIndex: 72, searchLift: 15,
  },
  {
    id: 'PL-006', name: '高光修容盘', category: '修容', series: '限定系列',
    skuCount: 5, rating: 8.5, potential: 75, status: 'developing' as const,
    platforms: ['小红书', '抖音'], campaigns: 1,
    priceRange: { min: 128, max: 198 },
    evaluation: { productScore: 85, packagingScore: 90, marketFit: 78, contentability: 82, audienceSize: 72 },
    performance: { totalGMV: 1500000, avgCTR: 3.8, avgCVR: 2.8, roi: 2.80, topPlatform: '小红书' },
    tags: ['高光+修容', '日系透亮', '显瘦轮廓', '礼盒限定'],
    grassIndex: 62, searchLift: 10,
  },
  {
    id: 'PL-007', name: '玫瑰限定联名', category: '限定联名', series: '联名系列',
    skuCount: 6, rating: 9.8, potential: 96, status: 'evaluating' as const,
    platforms: ['抖音', '小红书', '天猫'], campaigns: 0,
    priceRange: { min: 168, max: 388 },
    evaluation: { productScore: 98, packagingScore: 98, marketFit: 95, contentability: 98, audienceSize: 90 },
    performance: { totalGMV: 0, avgCTR: 0, avgCVR: 0, roi: 0, topPlatform: '-' },
    tags: ['限定联名', '礼盒豪华', '收藏价值高', '话题性强'],
    grassIndex: 0, searchLift: 0,
  },
  // ===== 🌍 国际版产品线 =====
  {
    id: 'PL-008', name: '唇釉Velvet · 全球版', category: '唇部', series: '国际系列',
    skuCount: 6, rating: 9.4, potential: 94, status: 'active' as const,
    platforms: ['Meta Ads', 'TikTok Global', 'Amazon'],  campaigns: 3,
    priceRange: { min: 18, max: 28 },
    evaluation: { productScore: 94, packagingScore: 90, marketFit: 96, contentability: 95, audienceSize: 88 },
    performance: { totalGMV: 1820000, avgCTR: 2.8, avgCVR: 6.2, roi: 4.04, topPlatform: 'TikTok Global' },
    tags: ['Berry Rose', 'Coral Nude', 'Dusty Pink', '国际色号', 'Velvet Finish'],
    grassIndex: 88, searchLift: 32,
  },
  {
    id: 'PL-009', name: 'Eye Shadow · Star Galaxy EN', category: '眼部', series: '国际限定',
    skuCount: 2, rating: 9.1, potential: 88, status: 'active' as const,
    platforms: ['Instagram', 'TikTok Global'],  campaigns: 2,
    priceRange: { min: 32, max: 48 },
    evaluation: { productScore: 91, packagingScore: 95, marketFit: 88, contentability: 94, audienceSize: 82 },
    performance: { totalGMV: 980000, avgCTR: 3.4, avgCVR: 5.8, roi: 3.65, topPlatform: 'Instagram' },
    tags: ['Holographic', 'Galaxy Theme', '日系包装', 'Cruelty-Free', '国际版'],
    grassIndex: 82, searchLift: 28,
  },
  {
    id: 'PL-010', name: '粉底液 · Skin-Fit Foundation', category: '底妆', series: '国际主打',
    skuCount: 10, rating: 8.9, potential: 85, status: 'developing' as const,
    platforms: ['Amazon', 'Google Shopping', 'Meta Ads'],  campaigns: 1,
    priceRange: { min: 38, max: 58 },
    evaluation: { productScore: 89, packagingScore: 86, marketFit: 90, contentability: 82, audienceSize: 85 },
    performance: { totalGMV: 620000, avgCTR: 4.2, avgCVR: 4.8, roi: 3.19, topPlatform: 'Google Shopping' },
    tags: ['10 Shades', 'SPF30', 'Long-Lasting', '适配欧美肤色', 'Satin Finish'],
    grassIndex: 75, searchLift: 22,
  },
]

// ===== 产品线评估雷达 =====
const productRadar = [
  { product: '唇釉丝绒', productScore: 95, packagingScore: 92, marketFit: 98, contentability: 96, audienceSize: 94 },
  { product: '眼影盘星空', productScore: 92, packagingScore: 96, marketFit: 90, contentability: 95, audienceSize: 88 },
  { product: '粉底液水光', productScore: 90, packagingScore: 88, marketFit: 92, contentability: 85, audienceSize: 92 },
  { product: '卸妆水温和', productScore: 93, packagingScore: 85, marketFit: 88, contentability: 90, audienceSize: 86 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

export default function MangaIP() {
  const [selectedProduct, setSelectedProduct] = useState<typeof productLines[0] | null>(null)
  const [activeTab, setActiveTab] = useState<'library' | 'evaluate' | 'radar'>('library')

  const productLineAIGroups: AIConfigGroup[] = [
    {
      title: '产品线投放策略',
      icon: <Target size={16} />,
      params: [
        createParam('star_product_budget', '明星产品预算占比', 45, '%', '唇釉等明星产品的预算优先占比', 42, 89, { min: 20, max: 70, step: 5, learningDataPoints: 45200, adjustHistory: [
          { time: '昨日', from: '42', to: '45', reason: '618预热期，明星产品需要更多曝光' },
        ] }),
        createParam('new_product_test_budget', '新品测试预算', 50000, '¥', '新产品首次投放的测试预算', 40000, 85, { min: 10000, max: 200000, step: 10000, autoTuneEnabled: false, learningDataPoints: 22100, adjustHistory: [
          { time: '1周前', from: '30000', to: '50000', reason: '睫毛膏新品需要更多测试数据' },
        ] }),
        createParam('cross_line_synergy', '跨产品线协同', '开启', '', '唇部+眼部+底妆套装组合种草协同效应', '开启', 88, { type: 'select', options: ['开启', '关闭'], learningDataPoints: 35000, adjustHistory: [
          { time: '3天前', from: '关闭', to: '开启', reason: '套装组合内容客单价提升32%' },
        ] }),
      ],
    },
    {
      title: '内容种草策略',
      icon: <Brain size={16} />,
      params: [
        createParam('grass_roi_min', '种草最低ROI', 2.5, '', '产品线种草投放的最低ROI门槛', 2.2, 86, { min: 1.5, max: 6.0, step: 0.1, learningDataPoints: 58300, adjustHistory: [
          { time: '2天前', from: '2.2', to: '2.5', reason: '整体ROI提升，AI上调种草门槛' },
        ] }),
        createParam('content_diversity', '内容形式多样性', 0.8, '分', '同一产品在投内容的形式多样性要求', 0.75, 84, { min: 0.3, max: 1.0, step: 0.05, learningDataPoints: 18900, adjustHistory: [
          { time: '3天前', from: '0.7', to: '0.8', reason: '内容同质化导致互动率下降，AI提升多样性要求' },
        ] }),
      ],
    },
  ]

  const productLineLearningStatus: AILearningStatus = {
    modelVersion: 'v2.5.0-product',
    lastTraining: '1小时前',
    totalDataPoints: 285000,
    avgConfidence: 87,
    autoAdjustCount24h: 95,
    learningRate: '0.0009',
    nextTraining: '3小时后',
    improvementRate: '+10.5%',
  }
  useRegisterAIConfig(productLineAIGroups, productLineLearningStatus, '产品线管理')

  const statusColors: Record<string, string> = {
    active: '#22c55e', developing: '#f59e0b', evaluating: '#60a5fa', discontinued: '#ef4444',
  }
  const statusLabels: Record<string, string> = {
    active: '在售推广中', developing: '开发推广中', evaluating: '评估测试', discontinued: '已下架',
  }

  return (
    <>
      <div className="page-header">
        <h2>产品线管理</h2>
        <p>玛丽黛佳全品线管理 · 唇部/眼部/底妆/卸妆/限定联名 · 种草指数评估 · AI投放策略匹配</p>
      </div>
      <div className="page-content">

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="GlobalTrend-Radar" color="#e8365d" />
          <ModelBadge name="ContentQuality-Scorer" color="#e8365d" />
        </div>

        {/* 汇总 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: '产品线总数', value: productLines.length, color: '#e8365d' },
            { label: '在售推广', value: productLines.filter(p => p.status === 'active').length, color: '#34d399' },
            { label: '总GMV', value: `¥${(productLines.reduce((s, p) => s + p.performance.totalGMV, 0) / 10000).toFixed(0)}万`, color: '#ff7a95' },
            { label: '最高ROI', value: `${Math.max(...productLines.filter(p => p.performance.roi > 0).map(p => p.performance.roi))}`, color: '#fbbf24' },
            { label: '平均种草指数', value: `${Math.round(productLines.filter(p => p.grassIndex > 0).reduce((s, p) => s + p.grassIndex, 0) / productLines.filter(p => p.grassIndex > 0).length)}`, color: '#60a5fa' },
          ].map((m, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className={`tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>产品线总览</button>
          <button className={`tab ${activeTab === 'evaluate' ? 'active' : ''}`} onClick={() => setActiveTab('evaluate')}>种草评估</button>
          <button className={`tab ${activeTab === 'radar' ? 'active' : ''}`} onClick={() => setActiveTab('radar')}>多维雷达</button>
        </div>

        {activeTab === 'library' && (
          <div>
            {productLines.map((pl, i) => (
              <div key={i} className="card" style={{ marginBottom: 10, cursor: 'pointer', borderLeft: `4px solid ${statusColors[pl.status]}` }}
                onClick={() => setSelectedProduct(selectedProduct?.id === pl.id ? null : pl)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <ShoppingBag size={16} color="#e8365d" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{pl.name}</span>
                  <span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontSize: '0.6rem' }}>{pl.category}</span>
                  <span className="cluster-tag" style={{ background: 'rgba(255,122,149,0.1)', color: '#ff7a95', fontSize: '0.6rem' }}>{pl.series}</span>
                  <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600, background: `${statusColors[pl.status]}20`, color: statusColors[pl.status] }}>
                    {statusLabels[pl.status]}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 8 }}>
                  {[
                    { label: 'SKU数量', value: `${pl.skuCount}款` },
                    { label: '价格区间', value: `¥${pl.priceRange.min}-${pl.priceRange.max}` },
                    { label: '总GMV', value: `¥${(pl.performance.totalGMV / 10000).toFixed(0)}万`, color: '#34d399' },
                    { label: 'ROI', value: pl.performance.roi > 0 ? `${pl.performance.roi}` : '-', color: pl.performance.roi >= 3.0 ? '#22c55e' : '#f59e0b' },
                    { label: 'CTR', value: pl.performance.avgCTR > 0 ? `${pl.performance.avgCTR}%` : '-' },
                    { label: '种草指数', value: pl.grassIndex > 0 ? `${pl.grassIndex}` : '待评估', color: pl.grassIndex >= 85 ? '#22c55e' : '#f59e0b' },
                    { label: '搜索提升', value: pl.searchLift > 0 ? `+${pl.searchLift}%` : '-', color: '#34d399' },
                    { label: '进行活动', value: `${pl.campaigns}个` },
                  ].map((kpi, j) => (
                    <div key={j} style={{ padding: '5px 6px', background: 'var(--bg-primary)', borderRadius: 5, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: (kpi as any).color || 'var(--text-primary)' }}>{kpi.value}</div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {pl.tags.map(t => (
                      <span key={t} style={{ fontSize: '0.58rem', padding: '2px 6px', borderRadius: 4, background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {pl.platforms.map(p => (
                      <span key={p} style={{ fontSize: '0.58rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(232,54,93,0.1)', color: '#e8365d' }}>{p}</span>
                    ))}
                  </div>
                </div>

                {selectedProduct?.id === pl.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      {[
                        { label: '产品力评分', value: pl.evaluation.productScore },
                        { label: '包装颜值', value: pl.evaluation.packagingScore },
                        { label: '市场匹配度', value: pl.evaluation.marketFit },
                        { label: '内容可玩性', value: pl.evaluation.contentability },
                        { label: '受众规模', value: pl.evaluation.audienceSize },
                      ].map((m, j) => (
                        <div key={j} style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.value >= 90 ? '#e8365d' : '#f59e0b' }}>{m.value}</div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Top平台：{pl.performance.topPlatform} | CTR {pl.performance.avgCTR}% | 转化率 {pl.performance.avgCVR}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'evaluate' && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-title"><BarChart3 size={16} /> 各产品线种草综合评分</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={productLines.filter(p => p.grassIndex > 0).map(p => ({ name: p.name.substring(0, 5), grassIndex: p.grassIndex, roi: p.performance.roi * 25 }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="grassIndex" fill="#e8365d" name="种草指数" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="roi" fill="#ff7a95" name="ROI×25" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="card">
            <div className="section-title"><Star size={16} /> 明星产品多维雷达对比</div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={[
                { metric: '产品力', 唇釉: 95, 眼影: 92, 粉底: 90, 卸妆: 93 },
                { metric: '颜值包装', 唇釉: 92, 眼影: 96, 粉底: 88, 卸妆: 85 },
                { metric: '市场契合', 唇釉: 98, 眼影: 90, 粉底: 92, 卸妆: 88 },
                { metric: '内容潜力', 唇釉: 96, 眼影: 95, 粉底: 85, 卸妆: 90 },
                { metric: '受众规模', 唇釉: 94, 眼影: 88, 粉底: 92, 卸妆: 86 },
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                <Radar name="唇釉丝绒" dataKey="唇釉" stroke="#e8365d" fill="rgba(232,54,93,0.15)" />
                <Radar name="眼影盘星空" dataKey="眼影" stroke="#ff7a95" fill="rgba(255,122,149,0.1)" />
                <Radar name="粉底液水光" dataKey="粉底" stroke="#ff9eb5" fill="rgba(255,158,181,0.1)" />
                <Radar name="卸妆水温和" dataKey="卸妆" stroke="#ffb3c6" fill="rgba(255,179,198,0.1)" />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </>
  )
}
