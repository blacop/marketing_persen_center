import { useState, useEffect, useRef } from 'react'
import {
  Image, Video, FileText, Filter, TrendingUp, Archive,
  Upload, Eye, Clock, Tag, Layers, RefreshCw,
  Monitor, Smartphone, Sparkles, BarChart3, PieChart as PieChartIcon, Zap,
  Film, Scissors, X, ChevronRight, Star,
} from 'lucide-react'
import { loadGeneratedAssets, saveGeneratedAsset, type GeneratedAsset } from '../lib/generatedAssetStore'
import { videoAssetApi, productionApi, getVideoStreamUrl, type VideoDeconstructionDetail, type VideoAssemblyTask, type VideoSegment, type ScriptBlueprintResult } from '../lib/agentApi'
import SegmentClip from '../components/SegmentClip'
import AssemblyPlanStrip from '../components/AssemblyPlanStrip'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line, Area
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   素材资产库 —— 跨平台创意素材管理与智能适配
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['全部素材', '素材', '成片', '效果排行', '平台适配', '素材回收站']

const kpiCards = [
  { label: '素材总量', value: '12,847个', icon: <Layers size={20} />, color: '#e8365d' },
  { label: '本周新增', value: '328个', icon: <Upload size={20} />, color: '#ff7a95' },
  { label: '使用中素材', value: '4,562个', icon: <Eye size={20} />, color: '#22c55e' },
  { label: '待审核', value: '86个', icon: <Clock size={20} />, color: '#f59e0b' },
]

const assetList = [
  { id: 'A-001', name: '唇釉丝绒#105种草视频', type: '视频', product: '唇釉系列', platforms: ['抖音', '小红书'], ctr: 5.8, cvr: 3.2, status: '使用中', date: '2026-03-28' },
  { id: 'A-002', name: '玻尿酸精华成分解析图', type: '图片', product: '护肤系列', platforms: ['小红书'], ctr: 4.2, cvr: 2.8, status: '使用中', date: '2026-03-25' },
  { id: 'A-003', name: '底妆教程15s竖版', type: '视频', product: '底妆系列', platforms: ['抖音', '快手'], ctr: 6.1, cvr: 3.5, status: '使用中', date: '2026-03-22' },
  { id: 'A-004', name: '小红书眼影盘图文', type: '图片', product: '眼妆系列', platforms: ['小红书'], ctr: 5.5, cvr: 2.9, status: '待审核', date: '2026-04-01' },
  { id: 'A-005', name: '春季限定色号文案', type: '文案', product: '唇釉系列', platforms: ['微信', '小红书'], ctr: 3.8, cvr: 2.1, status: '使用中', date: '2026-03-18' },
  { id: 'A-006', name: '持妆测试24h对比图', type: '图片', product: '底妆系列', platforms: ['抖音', '小红书', '快手'], ctr: 7.2, cvr: 4.1, status: '使用中', date: '2026-03-15' },
  { id: 'A-007', name: '敏感肌护肤科普短片', type: '视频', product: '护肤系列', platforms: ['抖音'], ctr: 4.8, cvr: 2.5, status: '待审核', date: '2026-04-02' },
  { id: 'A-008', name: '眼妆教程烟熏妆30s', type: '视频', product: '眼妆系列', platforms: ['抖音', '快手'], ctr: 5.1, cvr: 3.0, status: '已归档', date: '2026-02-20' },
  { id: 'A-009', name: '618大促主图banner', type: '图片', product: '唇釉系列', platforms: ['微信', '抖音'], ctr: 6.5, cvr: 3.8, status: '使用中', date: '2026-03-30' },
]

const topCTRData = [
  { name: '持妆测试24h对比图', ctr: 7.2 },
  { name: '618大促主图banner', ctr: 6.5 },
  { name: '底妆教程15s竖版', ctr: 6.1 },
  { name: '唇釉丝绒#105种草视频', ctr: 5.8 },
  { name: '小红书眼影盘图文', ctr: 5.5 },
  { name: '眼妆教程烟熏妆30s', ctr: 5.1 },
  { name: '敏感肌护肤科普短片', ctr: 4.8 },
  { name: '玻尿酸精华成分解析图', ctr: 4.2 },
  { name: '春季限定色号文案', ctr: 3.8 },
  { name: '唇釉色卡合集图', ctr: 3.5 },
]

const effectDetail = [
  { name: '持妆测试24h对比图', type: '图片', platform: '抖音', impressions: '285万', ctr: 7.2, cvr: 4.1, useCount: 38, status: '使用中' },
  { name: '618大促主图banner', type: '图片', platform: '微信', impressions: '198万', ctr: 6.5, cvr: 3.8, useCount: 25, status: '使用中' },
  { name: '底妆教程15s竖版', type: '视频', platform: '抖音', impressions: '352万', ctr: 6.1, cvr: 3.5, useCount: 42, status: '使用中' },
  { name: '唇釉丝绒#105种草视频', type: '视频', platform: '小红书', impressions: '215万', ctr: 5.8, cvr: 3.2, useCount: 31, status: '使用中' },
  { name: '小红书眼影盘图文', type: '图片', platform: '小红书', impressions: '128万', ctr: 5.5, cvr: 2.9, useCount: 18, status: '待审核' },
  { name: '眼妆教程烟熏妆30s', type: '视频', platform: '快手', impressions: '95万', ctr: 5.1, cvr: 3.0, useCount: 22, status: '已归档' },
  { name: '敏感肌护肤科普短片', type: '视频', platform: '抖音', impressions: '168万', ctr: 4.8, cvr: 2.5, useCount: 15, status: '待审核' },
  { name: '玻尿酸精华成分解析图', type: '图片', platform: '小红书', impressions: '86万', ctr: 4.2, cvr: 2.8, useCount: 20, status: '使用中' },
]

const platformAdaptStats = [
  { platform: '抖音', adapted: 3842, pending: 156, color: '#3b82f6' },
  { platform: '小红书', adapted: 2960, pending: 203, color: '#ef4444' },
  { platform: '快手', adapted: 2186, pending: 312, color: '#f97316' },
  { platform: '微信视频号', adapted: 1420, pending: 445, color: '#22c55e' },
]

const assetTypeDist = [
  { name: '视频', value: 45, color: '#e8365d' },
  { name: '图片', value: 35, color: '#ff7a95' },
  { name: '文案', value: 15, color: '#ffb4c6' },
  { name: '混合', value: 5, color: '#8b5cf6' },
]

const adaptationLog = [
  { source: '唇釉丝绒#105种草视频', direction: '抖音 → 小红书', status: '已完成', time: '2小时前', quality: 95 },
  { source: '底妆教程15s竖版', direction: '抖音 → 快手', status: '已完成', time: '3小时前', quality: 92 },
  { source: '玻尿酸精华成分解析图', direction: '小红书 → 微信', status: '适配中', time: '30分钟前', quality: 0 },
  { source: '618大促主图banner', direction: '微信 → 抖音', status: '已完成', time: '5小时前', quality: 88 },
  { source: '敏感肌护肤科普短片', direction: '抖音 → 小红书', status: '待审核', time: '1小时前', quality: 91 },
]

const weeklyTrendData = [
  { day: '周一', images: 18, videos: 12, copy: 8 },
  { day: '周二', images: 22, videos: 15, copy: 6 },
  { day: '周三', images: 15, videos: 20, copy: 10 },
  { day: '周四', images: 25, videos: 18, copy: 12 },
  { day: '周五', images: 30, videos: 22, copy: 14 },
  { day: '周六', images: 12, videos: 8, copy: 4 },
  { day: '周日', images: 10, videos: 6, copy: 3 },
]

const recycledAssets = [
  { name: '情人节限定礼盒主图', type: '图片', reason: '活动结束', archivedDate: '2026-02-15', historyCTR: 6.8 },
  { name: '双11预售倒计时视频', type: '视频', reason: '活动结束', archivedDate: '2025-11-12', historyCTR: 7.5 },
  { name: '旧款唇膏色号展示', type: '图片', reason: '产品下架', archivedDate: '2026-01-08', historyCTR: 3.2 },
  { name: '秋冬护肤routine短片', type: '视频', reason: '效果衰减', archivedDate: '2026-03-01', historyCTR: 2.1 },
  { name: '年货节满减文案', type: '文案', reason: '活动结束', archivedDate: '2026-02-10', historyCTR: 4.5 },
  { name: '早期粉底液测评图', type: '图片', reason: '效果衰减', archivedDate: '2026-02-28', historyCTR: 1.8 },
]

const lifecycleData = [
  { week: '第1周', ctr: 6.8, cvr: 3.9 },
  { week: '第2周', ctr: 7.2, cvr: 4.2 },
  { week: '第3周', ctr: 6.5, cvr: 3.6 },
  { week: '第4周', ctr: 5.8, cvr: 3.1 },
  { week: '第5周', ctr: 4.9, cvr: 2.5 },
  { week: '第6周', ctr: 4.1, cvr: 2.0 },
  { week: '第7周', ctr: 3.3, cvr: 1.6 },
  { week: '第8周', ctr: 2.6, cvr: 1.2 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

// ── AI配置 ──
const assetAIConfigGroups: AIConfigGroup[] = [
  {
    title: '智能标签与推荐',
    icon: <Tag size={16} />,
    params: [
      createParam('auto_tag_confidence', '自动标签置信度', 85, '%', 'AI自动为素材打标签时所需的最低置信度', 85, 88, { min: 70, max: 99 }),
      createParam('recommend_threshold', '素材推荐阈值', 0.7, '', '当素材历史CTR高于此阈值时推荐复用', 0.7, 85, { min: 0.3, max: 0.95, step: 0.05 }),
      createParam('expire_warning', '效果衰减预警', 20, '%', '当素材CTR下降超过此比例时触发预警', 20, 82, { min: 10, max: 50 }),
      createParam('similarity_threshold', '素材查重阈值', 90, '%', '相似度超过此值的素材将被标记为重复', 90, 86, { min: 70, max: 99 }),
    ],
  },
  {
    title: '跨平台适配',
    icon: <Monitor size={16} />,
    params: [
      createParam('auto_adapt', '自动适配模式', '智能裁剪', '', '跨平台适配时的画面处理方式', '智能裁剪', 90, { type: 'select', options: ['等比缩放', '智能裁剪', 'AI重构'] }),
      createParam('text_overlay', '文字叠加策略', '平台规范', '', '适配时文字层的处理方式', '平台规范', 87, { type: 'select', options: ['保持原样', '平台规范', 'AI优化'] }),
      createParam('quality_target', '适配质量目标', 92, '%', '适配后素材质量评分需达到的最低值', 92, 91, { min: 80, max: 99 }),
      createParam('batch_size', '批量适配数量', 50, '个/批', '每批次自动适配处理的素材数量上限', 50, 83, { min: 10, max: 200 }),
    ],
  },
]

const assetAILearningStatus: AILearningStatus = {
  modelVersion: 'v2.0.0-asset-mgmt',
  lastTraining: '30分钟前',
  totalDataPoints: 920000,
  avgConfidence: 88,
  autoAdjustCount24h: 35,
  learningRate: '0.004',
  nextTraining: '1.5小时后',
  improvementRate: '+6.2%',
}

// ── 辅助函数 ──
const typeIcon = (type: string) => {
  if (type === '视频') return <Video size={18} color="#e8365d" />
  if (type === '图片') return <Image size={18} color="#ff7a95" />
  return <FileText size={18} color="#8b5cf6" />
}

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    '使用中': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    '待审核': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    '已归档': { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
    '已完成': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    '适配中': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    'READY': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    'SUCCEEDED': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    'FAILED': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    'PENDING': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  }
  const s = map[status] || { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' }
  return (
    <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

const platformTag = (p: string) => {
  const colors: Record<string, string> = { '抖音': '#3b82f6', '小红书': '#ef4444', '快手': '#f97316', '微信': '#22c55e', 'DOUYIN': '#3b82f6', 'XIAOHONGSHU': '#ef4444' }
  const labelMap: Record<string, string> = { 'DOUYIN': '抖音', 'XIAOHONGSHU': '小红书', 'KUAISHOU': '快手', 'TIANMAO': '天猫' }
  const label = labelMap[p] || p
  const c = colors[p] || colors[label] || '#94a3b8'
  return (
    <span key={p} style={{ padding: '1px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600, background: `${c}18`, color: c, marginRight: 4 }}>
      {label}
    </span>
  )
}

const genTypeIcon = (type: GeneratedAsset['type']) => {
  if (type === '视频装配') return <Video size={18} color="#e8365d" />
  if (type === '脚本蓝图') return <FileText size={18} color="#8b5cf6" />
  if (type === '视频拆解') return <Zap size={18} color="#f59e0b" />
  return <Sparkles size={18} color="#3b82f6" />
}

function SignalStars({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} fill={i <= n ? '#f59e0b' : 'none'} color={i <= n ? '#f59e0b' : '#cbd5e1'} />
      ))}
    </span>
  )
}

// ── Detail Drawer ──
function DrawerOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 999,
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
        background: 'var(--bg-card)', zIndex: 1000, overflowY: 'auto',
        borderLeft: '1px solid var(--border-light)', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        padding: '24px',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-muted)', padding: 4,
        }}><X size={20} /></button>
        {children}
      </div>
    </>
  )
}

// ── Deconstruction Detail Drawer ──
function DeconstructionDrawer({ item, onClose }: { item: VideoDeconstructionDetail; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<VideoDeconstructionDetail>(item)
  const [activeSegIdx, setActiveSegIdx] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!item.segments && item.id) {
      setLoading(true)
      videoAssetApi.getDeconstructionDetail(item.id!)
        .then(d => setDetail(d))
        .catch(() => {/* ignore */})
        .finally(() => setLoading(false))
    }
  }, [item.id])

  // videoId 可能是完整 URL（远程视频）或 taskId（本地上传），统一通过 getVideoStreamUrl 转为可播放 URL
  const videoPlayUrl = getVideoStreamUrl(detail.videoId)

  const seekTo = (segIdx: number, startSec?: number) => {
    setActiveSegIdx(segIdx)
    if (videoRef.current && startSec != null) {
      videoRef.current.currentTime = startSec
      videoRef.current.play().catch(() => {/* user gesture required on some browsers */})
    }
  }

  const tags = (raw?: string) => {
    if (!raw) return []
    try { return JSON.parse(raw) as string[] } catch { return raw.split(/[,，]/).filter(Boolean) }
  }

  return (
    <DrawerOverlay onClose={onClose}>
      <div style={{ marginBottom: 16, paddingRight: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Scissors size={18} color="#f59e0b" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>视频拆解详情</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          SKU: <strong>{detail.skuId}</strong> · {detail.createAt?.slice(0, 10) ?? '—'}
        </div>
      </div>

      {/* Source video player */}
      {videoPlayUrl ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            源视频
            {activeSegIdx != null && detail.segments?.[activeSegIdx] && (
              <span style={{ marginLeft: 8, color: '#f59e0b', fontWeight: 600 }}>
                ▶ 片段 {activeSegIdx + 1}（{detail.segments[activeSegIdx].startSec}s – {detail.segments[activeSegIdx].endSec}s）
              </span>
            )}
          </div>
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 220, display: 'block' }}
          >
            <source src={videoPlayUrl} />
          </video>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            点击下方片段可跳转到对应时间段
          </p>
        </div>
      ) : null}

      {/* Tags */}
      {[
        { label: 'Hook类型', val: detail.hookType },
        { label: '标题模式', val: detail.titlePattern },
      ].map(r => r.val && (
        <div key={r.label} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{r.label}</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.val}</span>
        </div>
      ))}

      {[
        { label: '场景标签', raw: detail.sceneTags, color: '#3b82f6' },
        { label: '卖点标签', raw: detail.sellingPointTags, color: '#e8365d' },
        { label: '情感标签', raw: detail.emotionTags, color: '#8b5cf6' },
        { label: '目标人群', raw: detail.targetAudienceTags, color: '#22c55e' },
      ].map(g => tags(g.raw).length > 0 && (
        <div key={g.label} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 6 }}>{g.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {tags(g.raw).map(t => (
              <span key={t} style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600, background: `${g.color}18`, color: g.color }}>{t}</span>
            ))}
          </div>
        </div>
      ))}

      {detail.actualPerformanceScore != null && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 8 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>实际效果评分 </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8365d' }}>{Number(detail.actualPerformanceScore).toFixed(1)}</span>
        </div>
      )}

      {/* Segments — click to seek source video */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16, marginTop: 4 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Scissors size={14} color="#f59e0b" />
          视频片段 {loading ? '加载中…' : `(${detail.segments?.length ?? 0} 段)`}
        </div>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '20px 0' }}>加载中…</div>
        ) : !detail.segments?.length ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '20px 0' }}>暂无片段数据</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {detail.segments.map((seg: VideoSegment, i: number) => (
              <div
                key={i}
                onClick={() => seekTo(i, seg.startSec)}
                style={{
                  border: `1px solid ${activeSegIdx === i ? '#f59e0b60' : 'var(--border-light)'}`,
                  borderRadius: 10, padding: '12px 14px',
                  background: activeSegIdx === i ? 'rgba(245,158,11,0.06)' : 'var(--bg-primary)',
                  cursor: videoPlayUrl ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  display: 'grid', gridTemplateColumns: videoPlayUrl && seg.startSec != null && seg.endSec != null ? '160px 1fr' : '1fr', gap: 12, alignItems: 'flex-start',
                }}
              >
                {videoPlayUrl && seg.startSec != null && seg.endSec != null && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <SegmentClip
                      src={videoPlayUrl}
                      startSec={seg.startSec}
                      endSec={seg.endSec}
                      label={seg.structureTag}
                      height={100}
                    />
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: activeSegIdx === i ? '#f59e0b' : '#f59e0b80', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                        {seg.index ?? i + 1}
                      </span>
                      {seg.structureTag && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{seg.structureTag}</span>
                      )}
                      {seg.startSec != null && seg.endSec != null && (
                        <span style={{ fontSize: '0.65rem', color: activeSegIdx === i ? '#f59e0b' : 'var(--text-muted)', fontWeight: activeSegIdx === i ? 700 : 400 }}>
                          {seg.startSec}s – {seg.endSec}s
                          {videoPlayUrl && <span style={{ marginLeft: 4 }}>▶ 跳转源视频</span>}
                        </span>
                      )}
                    </div>
                    {seg.signalStrength != null && <SignalStars n={seg.signalStrength} />}
                  </div>
                  {seg.keyPhrase && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e8365d', marginBottom: 4 }}>「{seg.keyPhrase}」</div>
                  )}
                  {seg.script && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>{seg.script}</div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {seg.sellingPoint && <span style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(232,54,93,0.10)', color: '#e8365d', fontWeight: 600 }}>{seg.sellingPoint}</span>}
                    {seg.scene && <span style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(59,130,246,0.10)', color: '#3b82f6', fontWeight: 600 }}>{seg.scene}</span>}
                    {seg.technique && <span style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(139,92,246,0.10)', color: '#8b5cf6', fontWeight: 600 }}>{seg.technique}</span>}
                    {seg.decisiveFrame && <span style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(245,158,11,0.10)', color: '#f59e0b', fontWeight: 600 }}>决定性画面</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full deconstruction JSON */}
      {detail.deconstructionJson && (() => {
        let rendered: React.ReactNode
        try {
          const parsed = JSON.parse(detail.deconstructionJson)
          rendered = (
            <pre style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderRadius: 8, padding: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 300, overflowY: 'auto', lineHeight: 1.5 }}>
              {JSON.stringify(parsed, null, 2)}
            </pre>
          )
        } catch {
          rendered = (
            <pre style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderRadius: 8, padding: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflowY: 'auto' }}>
              {detail.deconstructionJson}
            </pre>
          )
        }
        return (
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16, marginTop: 16 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>完整拆解数据</div>
            {rendered}
          </div>
        )
      })()}
    </DrawerOverlay>
  )
}

// ── Assembly Detail Drawer ──
function AssemblyDrawer({ item, onClose }: { item: VideoAssemblyTask; onClose: () => void }) {
  const statusDisplayMap: Record<string, string> = { READY: '待执行', SUCCEEDED: '已完成', FAILED: '失败', PENDING: '等待中' }
  return (
    <DrawerOverlay onClose={onClose}>
      <div style={{ marginBottom: 20, paddingRight: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Film size={18} color="#e8365d" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>成片任务详情</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.taskCode}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: '状态', val: statusDisplayMap[item.status ?? ''] || item.status },
          { label: '平台', val: item.platform },
          { label: '目标时长', val: item.targetDuration ? `${item.targetDuration}s` : '—' },
          { label: '蓝图', val: item.blueprintCode },
          { label: '创建人', val: item.createName },
          { label: '创建时间', val: item.createAt?.slice(0, 10) },
        ].map(r => (
          <div key={r.label} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>{r.label}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{r.val || '—'}</div>
          </div>
        ))}
      </div>

      {item.resultVideoUrl && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8 }}>成片视频</div>
          <video
            controls
            style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 280, display: 'block' }}
          >
            <source src={item.resultVideoUrl} />
          </video>
          <a href={item.resultVideoUrl} target="_blank" rel="noreferrer"
            style={{ display: 'block', fontSize: '0.68rem', color: '#3b82f6', marginTop: 6, wordBreak: 'break-all' }}>
            🔗 {item.resultVideoUrl}
          </a>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <AssemblyPlanStrip planSections={item.planSections} candidates={item.candidates} />
      </div>

      {item.summaryJson && (() => {
        try {
          const summary = JSON.parse(item.summaryJson)
          return (
            <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>装配摘要</div>
              <pre style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                {JSON.stringify(summary, null, 2)}
              </pre>
            </div>
          )
        } catch { return null }
      })()}
    </DrawerOverlay>
  )
}

// ── Generated Asset Detail Drawer ──
function GeneratedAssetDrawer({ asset, onClose }: { asset: GeneratedAsset; onClose: () => void }) {
  const [blueprintDetail, setBlueprintDetail] = useState<ScriptBlueprintResult | null>(null)
  const [assemblyDetail, setAssemblyDetail] = useState<VideoAssemblyTask | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (asset.type === '脚本蓝图' && asset.blueprintCode) {
      setDetailLoading(true)
      productionApi.getBlueprint(asset.blueprintCode)
        .then(r => setBlueprintDetail(r))
        .catch(() => {/* ignore */})
        .finally(() => setDetailLoading(false))
    } else if (asset.type === '视频装配' && asset.assemblyTaskCode) {
      setDetailLoading(true)
      videoAssetApi.getAssemblyDetail(asset.assemblyTaskCode)
        .then(r => setAssemblyDetail(r))
        .catch(() => {/* ignore */})
        .finally(() => setDetailLoading(false))
    }
  }, [asset.blueprintCode, asset.assemblyTaskCode, asset.type])

  return (
    <DrawerOverlay onClose={onClose}>
      <div style={{ marginBottom: 20, paddingRight: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          {genTypeIcon(asset.type)}
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{asset.name}</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {asset.type} · {asset.skuId} · {asset.date}
        </div>
      </div>

      {detailLoading && (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '0.78rem' }}>加载中…</div>
      )}

      {/* 脚本蓝图 */}
      {asset.type === '脚本蓝图' && blueprintDetail && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>蓝图代码</div>
            <code style={{ fontSize: '0.78rem', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 6, color: '#8b5cf6' }}>
              {blueprintDetail.blueprintCode}
            </code>
          </div>
          {blueprintDetail.marketingNode && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>营销节点：</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{blueprintDetail.marketingNode}</span>
            </div>
          )}
          {blueprintDetail.recommendedTemplateName && (
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>推荐模板：</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e8365d' }}>{blueprintDetail.recommendedTemplateName}</span>
            </div>
          )}
          {blueprintDetail.blueprintSummary && (
            <div style={{ marginBottom: 14, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {blueprintDetail.blueprintSummary}
            </div>
          )}
          {blueprintDetail.sections && blueprintDetail.sections.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>内容结构</div>
              {blueprintDetail.sections.map(s => (
                <div key={s.sectionNo} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#e8365d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                      {s.sectionNo}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.stageName}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4, marginLeft: 26 }}>{s.semanticIntent}</div>
                  {s.narrationHint && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: 26 }}>{s.narrationHint}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {asset.type === '脚本蓝图' && !detailLoading && !blueprintDetail && asset.blueprintCode && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
          无法加载蓝图详情（{asset.blueprintCode}）
        </div>
      )}

      {/* 视频装配 */}
      {asset.type === '视频装配' && assemblyDetail && (
        <>
          {assemblyDetail.resultVideoUrl && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8 }}>成片视频</div>
              <video controls style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: 280, display: 'block' }}>
                <source src={assemblyDetail.resultVideoUrl} />
              </video>
              <a href={assemblyDetail.resultVideoUrl} target="_blank" rel="noreferrer"
                style={{ display: 'block', fontSize: '0.68rem', color: '#3b82f6', marginTop: 6, wordBreak: 'break-all' }}>
                🔗 {assemblyDetail.resultVideoUrl}
              </a>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([
              ['任务代码', assemblyDetail.taskCode],
              ['状态', assemblyDetail.status],
              ['平台', assemblyDetail.platform],
              ['目标时长', assemblyDetail.targetDuration ? `${assemblyDetail.targetDuration}s` : '—'],
              ['蓝图', assemblyDetail.blueprintCode],
              ['创建时间', assemblyDetail.createAt?.slice(0, 10)],
            ] as [string, string | number | undefined][]).map(([label, val]) => (
              <div key={String(label)} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{val || '—'}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {asset.type === '视频装配' && !detailLoading && !assemblyDetail && asset.assemblyTaskCode && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
          无法加载成片详情（{asset.assemblyTaskCode}）
        </div>
      )}

      {/* 其他类型 */}
      {asset.type !== '脚本蓝图' && asset.type !== '视频装配' && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
          <div><strong>类型：</strong>{asset.type}</div>
          <div><strong>SKU：</strong>{asset.skuId}</div>
          <div><strong>状态：</strong>{asset.status}</div>
          {asset.blueprintCode && <div><strong>蓝图代码：</strong>{asset.blueprintCode}</div>}
        </div>
      )}
    </DrawerOverlay>
  )
}

export default function AssetLibrary() {
  const [activeTab, setActiveTab] = useState(0)
  const [platformFilter, setPlatformFilter] = useState('全部')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [productFilter, setProductFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([])

  // 素材 tab state
  const [deconList, setDeconList] = useState<VideoDeconstructionDetail[]>([])
  const [deconLoading, setDeconLoading] = useState(false)
  const [deconTotal, setDeconTotal] = useState(0)
  const [selectedDecon, setSelectedDecon] = useState<VideoDeconstructionDetail | null>(null)

  // 成片 tab state
  const [assemblyList, setAssemblyList] = useState<VideoAssemblyTask[]>([])
  const [assemblyLoading, setAssemblyLoading] = useState(false)
  const [assemblyTotal, setAssemblyTotal] = useState(0)
  const [selectedAssembly, setSelectedAssembly] = useState<VideoAssemblyTask | null>(null)

  // AI生成素材 drawer state
  const [selectedGeneratedAsset, setSelectedGeneratedAsset] = useState<GeneratedAsset | null>(null)

  // chain trigger state
  const [chainBusy, setChainBusy] = useState<string | null>(null)
  const [chainToast, setChainToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setChainToast(msg)
    setTimeout(() => setChainToast(null), 2800)
  }

  const triggerBlueprint = async (e: React.MouseEvent, item: VideoDeconstructionDetail) => {
    e.stopPropagation()
    if (!item.skuId) { showToast('⚠️ 该拆解结果缺少 skuId'); return }
    const key = `bp-${item.id}`
    setChainBusy(key)
    try {
      const bp = await productionApi.generateBlueprint({ skuId: item.skuId, marketingGoal: 'SEEDING', marketingNode: '日常投放', platform: 'DOUYIN' })
      saveGeneratedAsset({
        name: `蓝图 · ${bp.recommendedTemplateName ?? item.skuId}`,
        type: '脚本蓝图',
        skuId: item.skuId,
        platforms: ['DOUYIN'],
        status: '已生成',
        blueprintCode: bp.blueprintCode,
        sourceCode: String(item.id ?? ''),
      })
      setGeneratedAssets(loadGeneratedAssets())
      showToast(`✓ Agent B 已下发：脚本蓝图 ${bp.blueprintCode.slice(0, 14)}…`)
      setActiveTab(0)
    } catch (err) {
      showToast(`⚠️ 生成蓝图失败：${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setChainBusy(null)
    }
  }

  const triggerAssembly = async (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation()
    if (!asset.blueprintCode) { showToast('⚠️ 该蓝图缺少 blueprintCode'); return }
    const key = `as-${asset.id}`
    setChainBusy(key)
    try {
      const ta = await productionApi.generateAssembly(asset.blueprintCode)
      saveGeneratedAsset({
        name: `成片 · ${asset.skuId}`,
        type: '视频装配',
        skuId: asset.skuId,
        platforms: asset.platforms,
        status: '已生成',
        assemblyTaskCode: ta.taskCode,
        blueprintCode: asset.blueprintCode,
      })
      setGeneratedAssets(loadGeneratedAssets())
      showToast(`✓ Agent C 已下发：装配任务 ${ta.taskCode.slice(0, 14)}…`)
    } catch (err) {
      showToast(`⚠️ 装配失败：${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setChainBusy(null)
    }
  }

  const triggerLaunch = (e: React.MouseEvent, asset: GeneratedAsset) => {
    e.stopPropagation()
    showToast(`✓ Mock：成片 ${asset.assemblyTaskCode?.slice(0, 14) ?? asset.skuId} 已下发到投放 Agent（千川）`)
  }

  useEffect(() => {
    setGeneratedAssets(loadGeneratedAssets())
  }, [activeTab])

  // Load 素材 tab
  useEffect(() => {
    if (activeTab !== 1) return
    setDeconLoading(true)
    videoAssetApi.listDeconstructionResults({ pageSize: 20 })
      .then(r => { setDeconList(r.records); setDeconTotal(r.total) })
      .catch(() => {/* ignore */})
      .finally(() => setDeconLoading(false))
  }, [activeTab])

  // Load 成片 tab
  useEffect(() => {
    if (activeTab !== 2) return
    setAssemblyLoading(true)
    videoAssetApi.listAssemblyTasks({ pageSize: 20 })
      .then(r => { setAssemblyList(r.records); setAssemblyTotal(r.total) })
      .catch(() => {/* ignore */})
      .finally(() => setAssemblyLoading(false))
  }, [activeTab])

  useRegisterAIConfig(assetAIConfigGroups, assetAILearningStatus, '素材资产库')

  const filteredAssets = assetList.filter(a => {
    if (platformFilter !== '全部' && !a.platforms.includes(platformFilter)) return false
    if (typeFilter !== '全部' && a.type !== typeFilter) return false
    if (productFilter !== '全部' && a.product !== productFilter) return false
    if (statusFilter !== '全部' && a.status !== statusFilter) return false
    return true
  })

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

      {chainToast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, padding: '10px 18px', borderRadius: 10,
          background: 'linear-gradient(135deg,#e8365d,#ff7a95)', color: '#fff',
          fontSize: '0.82rem', fontWeight: 600, boxShadow: '0 8px 24px rgba(232,54,93,0.35)',
        }}>{chainToast}</div>
      )}

      {/* Drawers */}
      {selectedDecon && <DeconstructionDrawer item={selectedDecon} onClose={() => setSelectedDecon(null)} />}
      {selectedAssembly && <AssemblyDrawer item={selectedAssembly} onClose={() => setSelectedAssembly(null)} />}
      {selectedGeneratedAsset && <GeneratedAssetDrawer asset={selectedGeneratedAsset} onClose={() => setSelectedGeneratedAsset(null)} />}

      {/* ══ 页面标题 ══ */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          <Layers size={22} style={{ marginRight: 8, verticalAlign: 'middle', color: '#e8365d' }} />
          素材资产库
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          玛丽黛佳全渠道创意素材管理 · 跨平台智能适配 · AI效果分析
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="CreativeFatigue-MAB" color="#e8365d" />
        <ModelBadge name="ContentQuality-Scorer" color="#e8365d" />
        <ModelBadge name="CulturalAdapt-Classifier" color="#e8365d" />
      </div>

      {/* ══ KPI Cards ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(card => (
          <div key={card.label} style={{
            background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)',
            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{card.label}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ Tabs ══ */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22, borderBottom: '1px solid var(--border-light)', paddingBottom: 0, flexWrap: 'wrap' }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            padding: '8px 18px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
            background: activeTab === i ? '#e8365d' : 'transparent',
            color: activeTab === i ? '#fff' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {tab === '素材' && <Scissors size={13} />}
            {tab === '成片' && <Film size={13} />}
            {tab}
          </button>
        ))}
      </div>

      {/* ══ Tab 0: 全部素材 ══ */}
      {activeTab === 0 && (
        <div>
          {/* Summary Stats */}
          <div style={{
            display: 'flex', gap: 20, marginBottom: 16, padding: '12px 18px',
            background: 'linear-gradient(135deg, #e8365d08, #ff7a9508)',
            borderRadius: 12, border: '1px solid var(--border-light)',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Sparkles size={12} style={{ marginRight: 4, verticalAlign: 'middle', color: '#e8365d' }} />
              AI推荐素材: <strong style={{ color: '#e8365d' }}>156个</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <TrendingUp size={12} style={{ marginRight: 4, verticalAlign: 'middle', color: '#22c55e' }} />
              本周CTR均值: <strong style={{ color: '#22c55e' }}>5.2%</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={12} style={{ marginRight: 4, verticalAlign: 'middle', color: '#3b82f6' }} />
              今日新增适配: <strong style={{ color: '#3b82f6' }}>42个</strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Archive size={12} style={{ marginRight: 4, verticalAlign: 'middle', color: '#f59e0b' }} />
              即将过期: <strong style={{ color: '#f59e0b' }}>23个</strong>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
            background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '12px 16px',
          }}>
            <Filter size={15} color="var(--text-muted)" />
            <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} style={selectStyle}>
              {['全部', '抖音', '小红书', '快手', '微信'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
              {['全部', '图片', '视频', '文案'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={productFilter} onChange={e => setProductFilter(e.target.value)} style={selectStyle}>
              {['全部', '唇釉系列', '护肤系列', '底妆系列', '眼妆系列'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              {['全部', '使用中', '已归档', '待审核'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* AI生成素材 */}
          {generatedAssets.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Zap size={15} color="#e8365d" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI生成素材</span>
                <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700, background: '#e8365d', color: '#fff' }}>
                  {generatedAssets.length} NEW
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {generatedAssets.map(asset => (
                  <div key={asset.id} onClick={() => setSelectedGeneratedAsset(asset)} style={{
                    position: 'relative',
                    background: 'var(--bg-card)', borderRadius: 14,
                    border: '1.5px solid #e8365d40',
                    padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 2px 12px rgba(232,54,93,0.10)',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(232,54,93,0.18)'; (e.currentTarget as HTMLElement).style.borderColor = '#e8365d80' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(232,54,93,0.10)'; (e.currentTarget as HTMLElement).style.borderColor = '#e8365d40' }}
                  >
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#e8365d,#ff7a95)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>NEW</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(232,54,93,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {genTypeIcon(asset.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 36 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{asset.type}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: '#e8365d12', color: '#e8365d' }}>{asset.skuId}</span>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      {asset.platforms.map(p => platformTag(p))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>{asset.status}</span>
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 6, marginBottom: 8 }}>
                      <Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                      {asset.date}
                      {asset.blueprintCode && (
                        <span style={{ marginLeft: 8, color: '#94a3b8' }}>{asset.blueprintCode.slice(0, 14)}…</span>
                      )}
                    </div>

                    {asset.type === '脚本蓝图' && asset.blueprintCode && (
                      <button onClick={(e) => triggerAssembly(e, asset)} disabled={chainBusy === `as-${asset.id}`}
                        style={{
                          width: '100%', padding: '6px 10px', borderRadius: 8,
                          border: '1px solid #e8365d', background: 'rgba(232,54,93,0.08)',
                          color: '#e8365d', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}>
                        <Film size={11} />
                        {chainBusy === `as-${asset.id}` ? '调用 Agent C…' : '→ 装配此蓝图（Agent C）'}
                      </button>
                    )}
                    {asset.type === '视频装配' && asset.assemblyTaskCode && (
                      <button onClick={(e) => triggerLaunch(e, asset)}
                        style={{
                          width: '100%', padding: '6px 10px', borderRadius: 8,
                          border: '1px solid #f59e0b', background: 'rgba(245,158,11,0.08)',
                          color: '#f59e0b', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}>
                        <Zap size={11} />
                        → 投放此成片（千川 mock）
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: 'var(--border-light)', margin: '20px 0' }} />
            </div>
          )}

          {/* Asset Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {filteredAssets.map(asset => (
              <div key={asset.id} style={{
                background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)',
                padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(232,54,93,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = '#e8365d40' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {typeIcon(asset.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{asset.type}</div>
                  </div>
                  {statusBadge(asset.status)}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 600, background: '#e8365d12', color: '#e8365d' }}>{asset.product}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  {asset.platforms.map(p => platformTag(p))}
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                  <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CTR </span><span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e8365d' }}>{asset.ctr}%</span></div>
                  <div><span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CVR </span><span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>{asset.cvr}%</span></div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                  {asset.date}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Upload Trend */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
              本周素材上传趋势
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyTrendData}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="images" stackId="a" fill="#ff7a95" name="图片" />
                <Bar dataKey="videos" stackId="a" fill="#e8365d" name="视频" />
                <Bar dataKey="copy" stackId="a" fill="#ffb4c6" name="文案" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══ Tab 1: 素材（视频拆解片段）══ */}
      {activeTab === 1 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <Scissors size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#f59e0b' }} />
                视频拆解素材库
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                AI拆解视频产生的最小单元片段 · 共 {deconTotal} 条记录 · 点击查看片段详情
              </div>
            </div>
          </div>

          {deconLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '18px 20px', height: 160 }}>
                  <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-primary)', marginBottom: 8 }} />
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-primary)', width: '60%' }} />
                </div>
              ))}
            </div>
          ) : deconList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Scissors size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>暂无拆解素材</div>
              <div style={{ fontSize: '0.75rem' }}>通过 Beukay Agent 或 视频拆解 功能生成后，素材将在此显示</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {deconList.map((item, idx) => {
                const tags = (raw?: string) => {
                  if (!raw) return []
                  try { return (JSON.parse(raw) as string[]).slice(0, 3) } catch { return raw.split(/[,，]/).filter(Boolean).slice(0, 3) }
                }
                return (
                  <div key={`${item.id ?? 'noid'}-${item.recordId ?? idx}`} onClick={() => setSelectedDecon(item)}
                    style={{
                      background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)',
                      padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(245,158,11,0.14)'; (e.currentTarget as HTMLElement).style.borderColor = '#f59e0b50' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245,158,11,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Scissors size={18} color="#f59e0b" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8365d', marginBottom: 2 }}>{item.skuId}</div>
                          {item.hookType && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.hookType}</div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.65rem' }}>详情</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>

                    {item.titlePattern && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>{item.titlePattern}</div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {tags(item.sellingPointTags).map(t => (
                        <span key={t} style={{ padding: '1px 7px', borderRadius: 99, fontSize: '0.62rem', fontWeight: 600, background: 'rgba(232,54,93,0.10)', color: '#e8365d' }}>{t}</span>
                      ))}
                      {tags(item.sceneTags).map(t => (
                        <span key={t} style={{ padding: '1px 7px', borderRadius: 99, fontSize: '0.62rem', fontWeight: 600, background: 'rgba(59,130,246,0.10)', color: '#3b82f6' }}>{t}</span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        <Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                        {item.createAt?.slice(0, 10) ?? '—'}
                      </div>
                      {item.actualPerformanceScore != null && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e8365d' }}>
                          效果 {Number(item.actualPerformanceScore).toFixed(1)}
                        </span>
                      )}
                    </div>

                    <button onClick={(e) => triggerBlueprint(e, item)} disabled={chainBusy === `bp-${item.id}`}
                      style={{
                        width: '100%', padding: '6px 10px', borderRadius: 8,
                        border: '1px solid #8b5cf6', background: 'rgba(139,92,246,0.08)',
                        color: '#8b5cf6', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                      <Sparkles size={11} />
                      {chainBusy === `bp-${item.id}` ? '调用 Agent B…' : '→ 生成脚本蓝图（Agent B）'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab 2: 成片（视频装配）══ */}
      {activeTab === 2 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <Film size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
                成片装配库
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Beukay Agent 生成的视频装配任务 · 共 {assemblyTotal} 条记录 · 点击查看成片详情
              </div>
            </div>
          </div>

          {assemblyLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '18px 20px', height: 160 }}>
                  <div style={{ height: 12, borderRadius: 6, background: 'var(--bg-primary)', marginBottom: 8 }} />
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-primary)', width: '60%' }} />
                </div>
              ))}
            </div>
          ) : assemblyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Film size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>暂无成片任务</div>
              <div style={{ fontSize: '0.75rem' }}>通过 Beukay Agent 执行视频装配流程后，成片将在此显示</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {assemblyList.map((item, idx) => {
                const statusMap: Record<string, { label: string; color: string }> = {
                  READY: { label: '待执行', color: '#3b82f6' },
                  SUCCEEDED: { label: '已完成', color: '#22c55e' },
                  FAILED: { label: '失败', color: '#ef4444' },
                  PENDING: { label: '等待中', color: '#f59e0b' },
                }
                const s = statusMap[item.status ?? ''] || { label: item.status ?? '—', color: '#94a3b8' }
                return (
                  <div key={`${item.taskCode ?? item.id ?? idx}`} onClick={() => setSelectedAssembly(item)}
                    style={{
                      background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)',
                      padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(232,54,93,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = '#e8365d40' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(232,54,93,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Film size={18} color="#e8365d" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.taskCode}
                          </div>
                          {item.blueprintCode && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              蓝图: {item.blueprintCode}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.65rem' }}>详情</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600, background: `${s.color}18`, color: s.color }}>
                        {s.label}
                      </span>
                      {item.platform && platformTag(item.platform)}
                      {item.targetDuration && (
                        <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(139,92,246,0.10)', color: '#8b5cf6' }}>
                          {item.targetDuration}s
                        </span>
                      )}
                    </div>

                    {item.resultVideoUrl && (
                      <div style={{ fontSize: '0.68rem', color: '#3b82f6', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🎬 成片已生成
                      </div>
                    )}

                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      <Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                      {item.createAt?.slice(0, 10) ?? '—'}
                      {item.createName && <span style={{ marginLeft: 8 }}>{item.createName}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ Tab 3: 效果排行 ══ */}
      {activeTab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              <BarChart3 size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
              TOP10素材CTR排行
            </h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topCTRData} layout="vertical" margin={{ left: 140, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={130} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${String(v)}%`, 'CTR']} />
                <Bar dataKey="ctr" fill="#e8365d" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: '平均CTR', value: '5.4%', delta: '+0.8%', up: true },
              { label: '平均CVR', value: '3.2%', delta: '+0.3%', up: true },
              { label: '总曝光量', value: '1,533万', delta: '+12%', up: true },
              { label: '素材复用率', value: '68%', delta: '-2%', up: false },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '14px 16px' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: m.up ? '#22c55e' : '#ef4444' }}>{m.delta}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>素材效果明细</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {['素材名称', '类型', '平台', '曝光量', '点击率CTR', '转化率CVR', '使用次数', '状态'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {effectDetail.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={tdStyle}>{row.name}</td>
                      <td style={tdStyle}>{row.type}</td>
                      <td style={tdStyle}>{row.platform}</td>
                      <td style={tdStyle}>{row.impressions}</td>
                      <td style={{ ...tdStyle, color: '#e8365d', fontWeight: 700 }}>{row.ctr}%</td>
                      <td style={{ ...tdStyle, color: '#8b5cf6', fontWeight: 700 }}>{row.cvr}%</td>
                      <td style={tdStyle}>{row.useCount}</td>
                      <td style={tdStyle}>{statusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ Tab 4: 平台适配 ══ */}
      {activeTab === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {platformAdaptStats.map(p => (
              <div key={p.platform} style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.platform}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>已适配</div><div style={{ fontSize: '1.05rem', fontWeight: 800, color: p.color }}>{p.adapted.toLocaleString()}个</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>待适配</div><div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b' }}>{p.pending}个</div></div>
                </div>
                <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: p.color, width: `${(p.adapted / (p.adapted + p.pending) * 100).toFixed(1)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '16px 20px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
              <Smartphone size={15} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
              平台素材规范
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { name: '抖音', video: '9:16竖版', maxLen: '60s', imgSize: '1080x1920', color: '#3b82f6' },
                { name: '小红书', video: '3:4/1:1', maxLen: '5min', imgSize: '1080x1440', color: '#ef4444' },
                { name: '快手', video: '9:16竖版', maxLen: '57s', imgSize: '720x1280', color: '#f97316' },
                { name: '微信视频号', video: '9:16/16:9', maxLen: '30min', imgSize: '1080x1920', color: '#22c55e' },
              ].map(spec => (
                <div key={spec.name} style={{ padding: '12px 14px', borderRadius: 10, background: `${spec.color}08`, border: `1px solid ${spec.color}20` }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: spec.color, marginBottom: 8 }}>{spec.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    视频比例: {spec.video}<br />时长上限: {spec.maxLen}<br />封面尺寸: {spec.imgSize}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                <PieChartIcon size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
                素材类型分布
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={assetTypeDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {assetTypeDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${String(v)}%`, '占比']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                {assetTypeDist.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    {d.name} {d.value}%
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                <RefreshCw size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
                最近适配记录
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {['源素材', '适配方向', '适配状态', '质量评分', '时间'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adaptationLog.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={tdStyle}>{row.source}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#e8365d' }}>{row.direction}</td>
                      <td style={tdStyle}>{statusBadge(row.status)}</td>
                      <td style={tdStyle}>{row.quality > 0 ? <span style={{ fontWeight: 700, color: row.quality >= 90 ? '#22c55e' : '#f59e0b' }}>{row.quality}分</span> : <span style={{ color: 'var(--text-muted)' }}>--</span>}</td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ Tab 5: 素材回收站 ══ */}
      {activeTab === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: '已归档总量', value: '1,285个', sub: '占素材总量10%', color: '#94a3b8' },
              { label: '效果衰减归档', value: '486个', sub: '可能恢复: 52个', color: '#ef4444' },
              { label: '活动/产品下架', value: '799个', sub: '本月新增: 38个', color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '18px 20px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              <Archive size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#94a3b8' }} />
              已归档素材
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  {['素材名称', '类型', '过期原因', '归档日期', '历史效果'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recycledAssets.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={tdStyle}>{row.name}</td>
                    <td style={tdStyle}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{typeIcon(row.type)}{row.type}</span></td>
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 600, background: row.reason === '效果衰减' ? '#ef444418' : row.reason === '活动结束' ? '#3b82f618' : '#f9731618', color: row.reason === '效果衰减' ? '#ef4444' : row.reason === '活动结束' ? '#3b82f6' : '#f97316' }}>
                        {row.reason}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{row.archivedDate}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#e8365d' }}>CTR {row.historyCTR}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
              素材生命周期分析
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={lifecycleData}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="ctr" fill="#e8365d20" stroke="#e8365d" strokeWidth={2} name="CTR" />
                <Line type="monotone" dataKey="cvr" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} name="CVR" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 共享样式 ──
const selectStyle: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-light)',
  background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.75rem',
  fontWeight: 600, cursor: 'pointer', outline: 'none',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.76rem',
}
