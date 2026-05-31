import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import {
  Shield, AlertTriangle, Clock, Ban,
  Zap, TrendingUp,
  ThumbsUp, ThumbsDown, BarChart3, RefreshCw,
  DollarSign, AlertCircle,
  ChevronUp, ChevronDown, Bot, X, CheckCircle, Users
} from 'lucide-react'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ===== 投放审核队列（按广告计划优先级排序）=====
const reviewQueue = [
  {
    id: 'RV-2401', materialId: 'M-5504', hook: '全网最低价！买一送一',
    campaign: 'AD-2024-0401', campaignName: '618唇釉丝绒系列投放',
    platform: '抖音', adAccount: '品牌-抖音-001', format: '9:16 视频 15s',
    launchDate: '2026-04-04', urgency: 'critical' as const,
    policyCheck: { 抖音: 'pass', content: 'review', copyright: 'pass', adlaw: 'review' } as Record<string, string>,
    aiVerdict: 'review' as const, confidence: 84.2,
    flags: ['广告法禁用词-最低价', '价格类违规'],
    submitTime: '14:32', stage: 'pending' as const,
  },
  {
    id: 'RV-2402', materialId: 'M-5505', hook: '玫瑰金眼影盘种草测评',
    campaign: 'AD-2024-0401', campaignName: '618唇釉丝绒系列投放',
    platform: '抖音', adAccount: '品牌-抖音-001', format: '9:16 视频 20s',
    launchDate: '2026-04-04', urgency: 'critical' as const,
    policyCheck: { 抖音: 'pass', content: 'pass', copyright: 'pass', adlaw: 'pass' } as Record<string, string>,
    aiVerdict: 'pass' as const, confidence: 96.8,
    flags: [],
    submitTime: '14:28', stage: 'pending' as const,
  },
  {
    id: 'RV-2403', materialId: 'M-5702', hook: '护肤品宣传"无添加"成分',
    campaign: 'AD-2024-0410', campaignName: '玫瑰金眼影盘 - 小红书种草',
    platform: '小红书', adAccount: '品牌-小红书-001', format: '16:9 视频 30s',
    launchDate: '2026-04-05', urgency: 'high' as const,
    policyCheck: { 小红书: 'pass', content: 'review', copyright: 'pass', efficacy: 'review' } as Record<string, string>,
    aiVerdict: 'review' as const, confidence: 78.5,
    flags: ['功效宣称不规范', '需提供检测报告'],
    submitTime: '14:15', stage: 'flagged' as const,
  },
  {
    id: 'RV-2404', materialId: 'M-5604', hook: 'KOL口红试色测评视频',
    campaign: 'AD-2024-0405', campaignName: '新品粉底液 - 抖音直播推广',
    platform: '抖音', adAccount: '品牌-抖音-001', format: '1:1 视频 15s',
    launchDate: '2026-04-04', urgency: 'high' as const,
    policyCheck: { 抖音: 'pass', content: 'pass', copyright: 'pass', adlaw: 'pass' } as Record<string, string>,
    aiVerdict: 'pass' as const, confidence: 97.5,
    flags: [],
    submitTime: '13:58', stage: 'approved' as const,
  },
  {
    id: 'RV-2405', materialId: 'M-5605', hook: 'KOL测评未标注广告标识',
    campaign: 'AD-2024-0405', campaignName: '新品粉底液 - 抖音直播推广',
    platform: '小红书', adAccount: '品牌-小红书-001', format: '9:16 视频 20s',
    launchDate: '2026-04-04', urgency: 'high' as const,
    policyCheck: { 小红书: 'review', content: 'pass', copyright: 'pass', adlaw: 'pass' } as Record<string, string>,
    aiVerdict: 'review' as const, confidence: 82.1,
    flags: ['未标注广告', '违反平台规范'],
    submitTime: '13:45', stage: 'pending' as const,
  },
  {
    id: 'RV-2406', materialId: 'M-NEW-001', hook: '春日护肤教程·早C晚A',
    campaign: 'AD-2024-0412', campaignName: '春季护肤系列·华东区域投放',
    platform: '快手', adAccount: '品牌-快手-001', format: '9:16 视频 15s',
    launchDate: '2026-04-06', urgency: 'medium' as const,
    policyCheck: { 快手: 'pass', content: 'pass', copyright: 'pass', adlaw: 'pass' } as Record<string, string>,
    aiVerdict: 'pass' as const, confidence: 95.3,
    flags: [],
    submitTime: '13:30', stage: 'approved' as const,
  },
  {
    id: 'RV-2407', materialId: 'M-NEW-002', hook: '直播片段宣称"医学级修复"',
    campaign: 'AD-2024-0398', campaignName: '618唇釉丝绒系列投放',
    platform: '微信广告', adAccount: '品牌-微信-001', format: '9:16 视频 25s',
    launchDate: '2026-04-05', urgency: 'high' as const,
    policyCheck: { 微信广告: 'pass', content: 'review', copyright: 'pass', efficacy: 'pass' } as Record<string, string>,
    aiVerdict: 'reject' as const, confidence: 91.2,
    flags: ['未认证医疗功效声明', '需审核资质'],
    submitTime: '13:12', stage: 'rejected' as const,
  },
  {
    id: 'RV-2408', materialId: 'M-5704', hook: '28天肌肤对比·使用前后',
    campaign: 'AD-2024-0410', campaignName: '玫瑰金眼影盘 - 小红书种草',
    platform: '小红书', adAccount: '品牌-小红书-001', format: '1:1 视频 30s',
    launchDate: '2026-04-05', urgency: 'high' as const,
    policyCheck: { 小红书: 'pass', content: 'pass', copyright: 'pass', adlaw: 'pass' } as Record<string, string>,
    aiVerdict: 'pass' as const, confidence: 94.8,
    flags: [],
    submitTime: '12:50', stage: 'approved' as const,
  },
]

// ===== 各平台政策合规状态 =====
const platformPolicies = [
  {
    platform: '抖音', icon: '🎵',
    categories: [
      { name: '广告法禁用词', rules: 34, synced: '2026-04-03 08:00', coverage: 98, violations: 3, topViolation: '极限词-最/第一/唯一' },
      { name: '功效宣称规范', rules: 18, synced: '2026-04-02 20:00', coverage: 95, violations: 1, topViolation: '未认证医疗功效声明' },
      { name: '广告标识要求', rules: 22, synced: '2026-04-03 08:00', coverage: 99, violations: 0, topViolation: '-' },
      { name: '直播实名认证', rules: 12, synced: '2026-04-01 12:00', coverage: 100, violations: 0, topViolation: '-' },
    ],
    pendingReview: 8, passRate: 94, avgReviewTime: '6s', dailyVolume: 156,
  },
  {
    platform: '小红书', icon: '📕',
    categories: [
      { name: '品牌合作标注', rules: 28, synced: '2026-04-03 06:00', coverage: 96, violations: 5, topViolation: '未标注#品牌合作' },
      { name: '功效夸大审查', rules: 42, synced: '2026-04-02 22:00', coverage: 93, violations: 4, topViolation: '合成对比图违规' },
      { name: '种草内容真实性', rules: 8, synced: '2026-04-03 00:00', coverage: 100, violations: 1, topViolation: '缺乏真实体验' },
      { name: '视频规格要求', rules: 6, synced: '2026-04-03 04:00', coverage: 100, violations: 0, topViolation: '-' },
    ],
    pendingReview: 5, passRate: 91, avgReviewTime: '8s', dailyVolume: 134,
  },
  {
    platform: '快手', icon: '⚡',
    categories: [
      { name: '价格对比规范', rules: 38, synced: '2026-04-03 02:00', coverage: 97, violations: 2, topViolation: '误导性价格对比' },
      { name: '未成年人保护', rules: 15, synced: '2026-04-02 18:00', coverage: 94, violations: 1, topViolation: '未成年人定向投放' },
      { name: '减肥类内容限制', rules: 20, synced: '2026-04-02 14:00', coverage: 96, violations: 1, topViolation: '暗示快速减肥' },
      { name: '广告标识审核', rules: 10, synced: '2026-04-01 20:00', coverage: 98, violations: 0, topViolation: '-' },
    ],
    pendingReview: 3, passRate: 96, avgReviewTime: '5s', dailyVolume: 89,
  },
  {
    platform: '微信广告', icon: '💬',
    categories: [
      { name: '朋友圈广告资质', rules: 18, synced: '2026-04-02 16:00', coverage: 95, violations: 1, topViolation: '资质证明缺失' },
      { name: '虚假承诺审核', rules: 8, synced: '2026-04-01 10:00', coverage: 100, violations: 0, topViolation: '-' },
    ],
    pendingReview: 1, passRate: 97, avgReviewTime: '4s', dailyVolume: 42,
  },
]

// ===== 拒审影响分析 =====
const rejectionImpact = [
  { campaign: 'AD-2024-0398', name: '618唇釉丝绒系列投放', platform: '微信广告', rejectedCount: 3, activeMaterials: 4, impactLevel: 'high' as const, dailyBudget: 2000, estimatedLoss: 1500, reason: '未认证医疗功效声明违反平台规范', suggestion: '删除医疗功效相关表述后重新提交' },
  { campaign: 'AD-2024-0410', name: '玫瑰金眼影盘 - 小红书种草', platform: '小红书', rejectedCount: 2, activeMaterials: 4, impactLevel: 'medium' as const, dailyBudget: 3000, estimatedLoss: 800, reason: '功效宣称不规范+未标注品牌合作', suggestion: '补充检测报告并添加#品牌合作标注' },
  { campaign: 'AD-2024-0405', name: '新品粉底液 - 抖音直播推广', platform: '抖音', rejectedCount: 1, activeMaterials: 6, impactLevel: 'low' as const, dailyBudget: 5000, estimatedLoss: 200, reason: '广告法禁用词-最低价表述', suggestion: '修改文案去除极限词，改用"限时优惠价"' },
]

// ===== 拒审原因分布 =====
const rejectionReasons = [
  { name: '广告法禁用词', value: 32, color: '#e8365d' },
  { name: '功效宣称不规范', value: 28, color: '#a855f7' },
  { name: '未标注广告标识', value: 18, color: '#c084fc' },
  { name: '未认证医疗声明', value: 10, color: '#d946ef' },
  { name: '版权/素材引用', value: 8, color: '#e879f9' },
  { name: '规格不符', value: 4, color: '#f0abfc' },
]

// ===== 审核效率趋势 =====
const reviewEfficiency = [
  { date: '03/28', passRate: 91, volume: 380, avgTime: 9 },
  { date: '03/29', passRate: 92, volume: 410, avgTime: 8 },
  { date: '03/30', passRate: 90, volume: 395, avgTime: 8 },
  { date: '03/31', passRate: 93, volume: 430, avgTime: 7 },
  { date: '04/01', passRate: 94, volume: 460, avgTime: 7 },
  { date: '04/02', passRate: 93, volume: 445, avgTime: 6 },
  { date: '04/03', passRate: 95, volume: 478, avgTime: 6 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

type ReviewStage = 'pending' | 'flagged' | 'approved' | 'rejected'
type ReviewItem = Omit<typeof reviewQueue[0], 'stage'> & { stage: ReviewStage }

// ===== Review Item Detail Panel =====
function ReviewDetailPanel({
  item,
  onClose,
  onApprove,
  onReject,
  onConditional,
  onEscalate,
}: {
  item: ReviewItem
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onConditional: (id: string) => void
  onEscalate: (id: string) => void
}) {
  const [actionMode, setActionMode] = useState<'reject' | 'conditional' | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [conditionText, setConditionText] = useState('')

  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', zIndex: 1000,
    overflowY: 'auto', display: 'flex', flexDirection: 'column',
  }
  const sectionStyle: React.CSSProperties = { padding: '14px 20px', borderBottom: '1px solid var(--border)' }
  const labelStyle: React.CSSProperties = { fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }
  const metricBox: React.CSSProperties = { padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8 }
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }

  const riskCategories = [
    { name: '广告法禁用词', score: item.flags.some(f => f.includes('广告法') || f.includes('禁用词') || f.includes('最低价')) ? 72 : 12, threshold: 85 },
    { name: '功效宣称违规', score: item.flags.some(f => f.includes('功效') || f.includes('宣称')) ? 68 : 8, threshold: 80 },
    { name: '未认证医疗声明', score: item.flags.some(f => f.includes('医疗') || f.includes('医学')) ? 60 : 5, threshold: 90 },
    { name: 'IP版权', score: item.policyCheck.copyright === 'review' ? 55 : 10, threshold: 85 },
    { name: '广告标识缺失', score: item.flags.some(f => f.includes('未标注') || f.includes('标识')) ? 50 : 8, threshold: 80 },
    { name: '平台规范违规', score: item.flags.some(f => f.includes('平台规范') || f.includes('违反')) ? 65 : 15, threshold: 75 },
  ]

  const flaggedSegments = item.flags.length > 0
    ? item.flags.map((f, i) => ({ time: `00:${String(i * 3 + 2).padStart(2, '0')}`, desc: f }))
    : [{ time: '-', desc: '无风险内容标记' }]

  const platformNotes: Record<string, string[]> = {
    '抖音': ['禁止未认证医疗功效声明', '须标注#广告标识', '直播需实名认证', '禁止极限词（最/第一/唯一）'],
    '小红书': ['禁止合成对比图', '须标注#品牌合作', '禁止夸大功效', '种草内容须有真实体验'],
    '快手': ['禁止误导性价格对比', '未成年保护规范须遵守', '禁止暗示快速减肥', '广告须明确标识'],
    '微信广告': ['朋友圈广告须有资质审核', '禁止虚假承诺', '禁止未经认证的医疗声明', '广告内容须与资质匹配'],
  }
  const notes = platformNotes[item.platform] || []

  const idNum = parseInt(item.id.replace('RV-', ''))
  const similarCases = [
    { id: `HIST-${idNum - 100}`, verdict: item.aiVerdict === 'pass' ? '通过' : '拒绝', reason: item.flags[0] || '无标记', resolution: item.aiVerdict === 'pass' ? '直接通过' : '裁剪后通过' },
    { id: `HIST-${idNum - 50}`, verdict: '条件通过', reason: '落地页链接需更新', resolution: '更新URL后批准' },
  ]

  return (
    <div style={panelStyle}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.materialId}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.campaignName} · {item.platform}</div>
        </div>
        <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <X size={14} />
        </button>
      </div>

      {/* Thumbnail + Basic Info */}
      <div style={sectionStyle}>
        <div style={labelStyle}>素材基本信息</div>
        <div style={{ width: '100%', height: 90, background: 'linear-gradient(135deg, rgba(232,54,93,0.08), rgba(168,85,247,0.12))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10, border: '1px dashed rgba(232,54,93,0.2)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{item.platform === '抖音' ? '🎵' : item.platform === '小红书' ? '📕' : item.platform === '快手' ? '⚡' : '💬'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.format} · {item.hook}</div>
          </div>
        </div>
        <div style={gridStyle}>
          <div style={metricBox}><div style={labelStyle}>素材ID</div><div style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600 }}>{item.materialId}</div></div>
          <div style={metricBox}><div style={labelStyle}>广告计划</div><div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{item.campaignName.split(' ')[0]}</div></div>
          <div style={metricBox}><div style={labelStyle}>格式</div><div style={{ fontWeight: 600 }}>{item.format}</div></div>
          <div style={metricBox}><div style={labelStyle}>上线日期</div><div style={{ fontWeight: 700, color: item.urgency === 'critical' ? '#dc2626' : 'var(--text-primary)' }}>{item.launchDate}</div></div>
          <div style={metricBox}><div style={labelStyle}>平台</div><div style={{ fontWeight: 700 }}>{item.platform}</div></div>
          <div style={metricBox}><div style={labelStyle}>广告账户</div><div style={{ fontFamily: 'monospace', fontSize: '0.68rem' }}>{item.adAccount}</div></div>
        </div>
      </div>

      {/* AI Risk Score Breakdown */}
      <div style={sectionStyle}>
        <div style={labelStyle}><Shield size={10} style={{ display: 'inline', marginRight: 4 }} />AI风险评分细项</div>
        <div style={{ marginTop: 10 }}>
          {riskCategories.map(cat => (
            <div key={cat.name} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '0.72rem', color: cat.score >= cat.threshold ? '#dc2626' : 'var(--text-secondary)' }}>{cat.name}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: cat.score >= cat.threshold ? '#dc2626' : cat.score >= 40 ? '#f59e0b' : '#16a34a' }}>{cat.score}</span>
              </div>
              <div className="progress-bar" style={{ height: 5 }}>
                <div className="progress-bar-fill" style={{ width: `${cat.score}%`, background: cat.score >= cat.threshold ? '#dc2626' : cat.score >= 40 ? '#f59e0b' : '#e8365d' }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(232,54,93,0.05)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>AI总判定</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700, background: item.aiVerdict === 'pass' ? 'rgba(232,54,93,0.1)' : item.aiVerdict === 'reject' ? '#fee2e2' : '#fef3c7', color: item.aiVerdict === 'pass' ? '#e8365d' : item.aiVerdict === 'reject' ? '#991b1b' : '#92400e' }}>
                {item.aiVerdict === 'pass' ? '通过' : item.aiVerdict === 'reject' ? '拒绝' : '需复核'}
              </span>
              <span style={{ fontSize: '0.7rem', color: item.confidence >= 95 ? '#e8365d' : '#f59e0b' }}>置信度 {item.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Content Timestamps */}
      <div style={sectionStyle}>
        <div style={labelStyle}><AlertTriangle size={10} style={{ display: 'inline', marginRight: 4, color: '#f59e0b' }} />标记内容 · 时间戳</div>
        <div style={{ marginTop: 10 }}>
          {flaggedSegments.map((seg, i) => (
            <div key={i} style={{ ...metricBox, marginBottom: 6, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 700, color: '#d97706', flexShrink: 0 }}>{seg.time}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{seg.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Compliance Notes */}
      <div style={sectionStyle}>
        <div style={labelStyle}>{item.platform} 平台合规要点</div>
        <div style={{ marginTop: 10 }}>
          {notes.filter(n => n).map((note, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 6 }}>
              <span style={{ color: '#e8365d', flexShrink: 0 }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Past Cases */}
      <div style={sectionStyle}>
        <div style={labelStyle}><Users size={10} style={{ display: 'inline', marginRight: 4 }} />相似历史案例</div>
        <div style={{ marginTop: 10 }}>
          {similarCases.map((c, i) => (
            <div key={i} style={{ ...metricBox, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 600 }}>{c.id}</span>
                <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 600, background: c.verdict === '通过' ? 'rgba(34,197,94,0.1)' : c.verdict === '拒绝' ? '#fee2e2' : '#fef3c7', color: c.verdict === '通过' ? '#16a34a' : c.verdict === '拒绝' ? '#dc2626' : '#92400e' }}>{c.verdict}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>标记: {c.reason}</div>
              <div style={{ fontSize: '0.72rem', color: '#e8365d', marginTop: 2 }}>处理: {c.resolution}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        {/* 驳回 inline reason form */}
        {actionMode === 'reject' && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(220,38,38,0.05)', borderRadius: 8, border: '1px solid rgba(220,38,38,0.25)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>填写驳回原因</div>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="请输入驳回原因，例如：含广告法禁用词，需删除后重新提交..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.3)', background: 'var(--bg-primary)', fontSize: '0.75rem', color: 'var(--text-primary)', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => { if (rejectReason.trim()) { onReject(item.id); onClose() } }} disabled={!rejectReason.trim()} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: rejectReason.trim() ? '#dc2626' : '#e5e7eb', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: rejectReason.trim() ? 'pointer' : 'not-allowed' }}>确认驳回</button>
              <button onClick={() => { setActionMode(null); setRejectReason('') }} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>取消</button>
            </div>
          </div>
        )}

        {/* 条件通过 inline condition form */}
        {actionMode === 'conditional' && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(245,158,11,0.05)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.25)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d97706', marginBottom: 8 }}>填写条件通过要求</div>
            <textarea
              value={conditionText}
              onChange={e => setConditionText(e.target.value)}
              placeholder="请输入整改要求，例如：删除'最低价'表述后重新提交，须在3个工作日内完成..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.3)', background: 'var(--bg-primary)', fontSize: '0.75rem', color: 'var(--text-primary)', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => { if (conditionText.trim()) { onConditional(item.id); onClose() } }} disabled={!conditionText.trim()} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: conditionText.trim() ? '#d97706' : '#e5e7eb', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: conditionText.trim() ? 'pointer' : 'not-allowed' }}>确认条件通过</button>
              <button onClick={() => { setActionMode(null); setConditionText('') }} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}>取消</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => { onApprove(item.id); onClose() }} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', background: '#16a34a', color: 'white', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
            <CheckCircle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />批准通过
          </button>
          <button onClick={() => setActionMode(actionMode === 'reject' ? null : 'reject')} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #dc2626', background: actionMode === 'reject' ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.05)', fontSize: '0.75rem', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}>
            <Ban size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />驳回
          </button>
          <button onClick={() => setActionMode(actionMode === 'conditional' ? null : 'conditional')} style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: actionMode === 'conditional' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.05)', fontSize: '0.75rem', cursor: 'pointer', color: '#d97706', fontWeight: 600 }}>
            <AlertTriangle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />条件通过
          </button>
          <button onClick={() => { onEscalate(item.id); onClose() }} style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(232,54,93,0.3)', background: 'rgba(232,54,93,0.05)', fontSize: '0.78rem', cursor: 'pointer', color: '#e8365d' }}>
            <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />转人工复核
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContentReview() {
  const [tab, setTab] = useState<'queue' | 'platform' | 'impact' | 'analytics'>('queue')
  const [queue, setQueue] = useState<ReviewItem[]>(reviewQueue)
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null)
  const [triggeredCampaigns, setTriggeredCampaigns] = useState<Set<string>>(new Set())

  const showToast = (message: string, color: string) => {
    setToast({ message, color })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = (id: string) => {
    setQueue(q => q.map(r => r.id === id ? { ...r, stage: 'approved' as const } : r))
    showToast(`素材 ${id} 已批准通过`, '#16a34a')
  }

  const handleReject = (id: string) => {
    setQueue(q => q.map(r => r.id === id ? { ...r, stage: 'rejected' as const } : r))
    showToast(`素材 ${id} 已驳回`, '#dc2626')
  }

  const handleConditional = (id: string) => {
    setQueue(q => q.map(r => r.id === id ? { ...r, stage: 'approved' as const, flags: [...r.flags, '条件通过-待跟进'] } : r))
    showToast(`素材 ${id} 条件通过，请跟进整改`, '#d97706')
  }

  const handleEscalate = (id: string) => {
    setQueue(q => q.map(r => r.id === id ? { ...r, stage: 'flagged' as const } : r))
    showToast(`素材 ${id} 已转人工复核队列`, '#e8365d')
  }

  const handleTriggerReplacement = (id: string) => {
    showToast(`素材 ${id} 替换生产任务已触发`, '#a855f7')
  }

  const handleTriggerFixProduction = (campaign: string) => {
    setTriggeredCampaigns(prev => new Set(prev).add(campaign))
    showToast(`广告计划 ${campaign} 修复生产任务已触发`, '#e8365d')
  }

  // AI审核配置 - 参数组和学习状态
  const [contentReviewGroups] = useState<AIConfigGroup[]>([
    {
      title: '自动审核引擎',
      icon: <Bot size={16} color="#e8365d" />,
      params: [
        createParam('auto-pass-confidence', '自动通过置信度阈值', 95, '%', '多模态审核模型置信度高于此值的素材自动通过, 无需人工复核', 93, 94, { min: 85, max: 99, step: 1, autoTuneEnabled: false, learningDataPoints: 67800, adjustHistory: [
          { time: '昨日', from: '93', to: '95', reason: '自动通过素材被抖音驳回2条, 手动提高阈值增强安全性' },
          { time: '4天前', from: '97', to: '93', reason: '人工复核积压严重, 手动降低阈值提升自动通过率' },
          { time: '2周前', from: '95', to: '97', reason: '广告法新规更新, 临时收紧自动通过阈值' },
        ] }),
        createParam('auto-reject-confidence', '自动拒绝置信度阈值', 90, '%', '违规检测模型置信度高于此值的素材自动拒绝, 含暴力/色情/欺诈内容', 92, 91, { min: 80, max: 99, step: 1, autoTuneEnabled: false, learningDataPoints: 54200, adjustHistory: [
          { time: '2天前', from: '88', to: '90', reason: '误拒率上升至3.5%, 手动提高阈值减少误判' },
          { time: '1周前', from: '92', to: '88', reason: '多条违规素材漏检, 临时降低阈值加强拦截' },
        ] }),
        createParam('review-queue-priority', '人工复核队列优先级', 'FIFO', '', '人工复核队列排序: 风险优先处理高风险素材, AI智能排序综合考虑风险+预算+时效', 'AI智能排序', 89, { type: 'select', options: ['FIFO', '风险优先', '金额优先', 'AI智能排序'], learningDataPoints: 38500, adjustHistory: [
          { time: '昨日', from: '金额优先', to: 'AI智能排序', reason: 'AI检测到高风险低预算素材被延迟处理, 切换智能排序' },
          { time: '5天前', from: 'FIFO', to: '金额优先', reason: '高预算计划素材审核延迟影响投放, 手动切换金额优先' },
        ] }),
        createParam('review-speed-target', '审核速度目标', 30, '秒/条', '单条素材AI+人工审核的端到端目标耗时, 含多模态分析+合规检查', 25, 83, { min: 10, max: 120, step: 5, learningDataPoints: 42100, adjustHistory: [
          { time: '3天前', from: '20', to: '30', reason: '审核质量下降, AI放宽速度目标换取更高准确率' },
          { time: '1周前', from: '45', to: '20', reason: '素材上线延迟影响投放窗口, AI加速审核' },
        ] }),
      ],
    },
    {
      title: '平台合规',
      icon: <Shield size={16} color="#e8365d" />,
      params: [
        createParam('douyin-compliance', '抖音政策合规覆盖率', 99, '%', '抖音广告政策(广告法禁用词/功效宣称/直播规范)合规检测的规则覆盖率', 99.5, 96, { min: 90, max: 100, step: 0.5, learningDataPoints: 71200, adjustHistory: [
          { time: '1小时前', from: '98.5', to: '99', reason: '抖音更新美妆广告法规, AI自动补充新规则提升覆盖率' },
          { time: '3天前', from: '99.5', to: '98.5', reason: '抖音新增功效宣称细则, 规则尚未覆盖' },
        ] }),
        createParam('xiaohongshu-compliance', '小红书政策合规覆盖率', 99, '%', '小红书广告政策(品牌合作标注/功效夸大/真实体验)合规检测覆盖率', 99.5, 95, { min: 90, max: 100, step: 0.5, learningDataPoints: 65800, adjustHistory: [
          { time: '昨日', from: '98', to: '99', reason: '小红书品牌合作规范更新后AI自动适配新规则' },
          { time: '1周前', from: '99.5', to: '98', reason: '小红书新增种草内容真实性条款, 规则库待更新' },
        ] }),
        createParam('kuaishou-compliance', '快手政策合规覆盖率', 98, '%', '快手广告政策(价格对比/未成年人保护/减肥类内容)合规检测覆盖率', 99, 93, { min: 85, max: 100, step: 0.5, learningDataPoints: 43600, adjustHistory: [
          { time: '2天前', from: '96', to: '98', reason: '快手未成年人保护规范补充完成' },
          { time: '5天前', from: '98', to: '96', reason: '快手新增减肥类广告限制, 覆盖率下降' },
        ] }),
        createParam('policy-auto-adapt', '政策更新自动适配', '关闭', '', '平台政策变更时自动更新审核规则, AI全自动可实时抓取政策文档并生成规则', 'AI全自动', 87, { type: 'select', options: ['关闭', '仅告警', '半自动', 'AI全自动'], autoTuneEnabled: false, learningDataPoints: 18900, adjustHistory: [
          { time: '1周前', from: '半自动', to: '关闭', reason: 'AI自动生成的规则误判率偏高, 手动关闭待优化' },
        ] }),
      ],
    },
    {
      title: '敏感内容检测',
      icon: <AlertTriangle size={16} color="#f59e0b" />,
      params: [
        createParam('adlaw-sensitivity', '违禁词检测灵敏度', 85, '%', '美妆广告中广告法违禁词(最/第一/唯一/全网最低)的检测灵敏度', 90, 92, { min: 50, max: 99, step: 5, learningDataPoints: 55300, adjustHistory: [
          { time: '昨日', from: '80', to: '85', reason: '美妆素材广告法禁用词频繁漏检, AI提升灵敏度' },
          { time: '3天前', from: '90', to: '80', reason: '正常促销文案被大量误判, AI降低灵敏度' },
        ] }),
        createParam('efficacy-sensitivity', '功效宣称检测', 95, '%', '美妆功效声明(医学级/纯天然/无添加)等功效宣称的检测灵敏度, 合规要求极高', 97, 95, { min: 80, max: 99, step: 1, autoTuneEnabled: false, learningDataPoints: 68400, adjustHistory: [
          { time: '2天前', from: '93', to: '95', reason: '抖音驳回含隐性医疗功效暗示的素材, 手动提升灵敏度' },
          { time: '1周前', from: '97', to: '93', reason: '美妆素材过度拦截影响上线速度, 手动适当降低' },
        ] }),
        createParam('misleading-sensitivity', '误导性信息检测灵敏度', 80, '%', '虚假价格对比/夸大功效/误导性促销等欺骗性内容的检测灵敏度', 85, 86, { min: 50, max: 99, step: 5, learningDataPoints: 31200, adjustHistory: [
          { time: '3天前', from: '75', to: '80', reason: '护肤素材"28天美白"误导表述漏检, AI提升灵敏度' },
          { time: '1周前', from: '85', to: '75', reason: '正常促销信息被误判为误导, AI降低灵敏度' },
        ] }),
        createParam('admark-sensitivity', '广告标识缺失检测', 75, '%', '针对各平台广告标识要求(#广告/#品牌合作)未标注内容的检测灵敏度', 80, 79, { min: 40, max: 95, step: 5, learningDataPoints: 17600, adjustHistory: [
          { time: '5天前', from: '70', to: '75', reason: 'KOL合作内容未标注广告标识问题增加, AI提升灵敏度' },
          { time: '2周前', from: '80', to: '70', reason: '过度敏感导致大量素材需人工确认, AI降低阈值' },
        ] }),
      ],
    },
    {
      title: '影响评估',
      icon: <BarChart3 size={16} color="#e8365d" />,
      params: [
        createParam('rejection-rate-alert', '驳回率预警阈值', 15, '%', '素材驳回率超过此比例触发告警, 可能意味着素材团队产出质量下降', 12, 88, { min: 5, max: 30, step: 1, learningDataPoints: 45800, adjustHistory: [
          { time: '昨日', from: '12', to: '15', reason: '新素材团队入职初期驳回率偏高, AI临时放宽预警线' },
          { time: '4天前', from: '20', to: '12', reason: '素材质量稳定后AI收紧预警阈值' },
        ] }),
        createParam('review-consistency', '审核一致性目标', 95, '%', 'AI审核结果与资深审核员判定的一致性比率, 衡量AI审核可靠性', 97, 90, { min: 80, max: 99, step: 1, autoTuneEnabled: false, learningDataPoints: 52600, adjustHistory: [
          { time: '3天前', from: '93', to: '95', reason: '月度审核一致性评估后手动上调目标' },
        ] }),
        createParam('false-positive-limit', '误判率容忍上限', 2, '%', '合规素材被误判为违规的比率上限, 过高会延迟素材上线影响投放', 1.5, 87, { min: 0.5, max: 5, step: 0.5, autoTuneEnabled: false, learningDataPoints: 48900, adjustHistory: [
          { time: '2天前', from: '3', to: '2', reason: '误判导致多条优质素材延迟上线, 手动收紧容忍上限' },
          { time: '1周前', from: '1.5', to: '3', reason: '灵敏度调高后误判率攀升, 临时放宽上限' },
        ] }),
        createParam('efficiency-improvement', '审核效率提升目标', 30, '%', 'AI辅助审核相比纯人工审核的效率提升目标, 按月考核', 40, 82, { min: 10, max: 80, step: 5, learningDataPoints: 23400, adjustHistory: [
          { time: '5天前', from: '25', to: '30', reason: 'AI模型迭代后审核速度提升, AI上调效率目标' },
          { time: '2周前', from: '40', to: '25', reason: '新增多语言审核导致效率下降, AI降低目标' },
        ] }),
      ],
    },
  ])

  const [contentReviewLearning] = useState<AILearningStatus>({
    modelVersion: 'v2.8.3-review',
    lastTraining: '1.5小时前',
    totalDataPoints: 195000,
    avgConfidence: 90,
    autoAdjustCount24h: 89,
    learningRate: '0.001 (AdamW)',
    nextTraining: '4小时后',
    improvementRate: '+8.6%',
  })

  useRegisterAIConfig(contentReviewGroups, contentReviewLearning, '内容审核')

  const [stageFilter, setStageFilter] = useState<string>('all')
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('抖音')
  const [panelItem, setPanelItem] = useState<ReviewItem | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)

  const pending = queue.filter(r => r.stage === 'pending').length
  const flagged = queue.filter(r => r.stage === 'flagged').length
  const approved = queue.filter(r => r.stage === 'approved').length
  const rejected = queue.filter(r => r.stage === 'rejected').length
  const criticalPending = queue.filter(r => (r.stage === 'pending' || r.stage === 'flagged') && r.urgency === 'critical').length

  const filteredQueue = stageFilter === 'all' ? queue : queue.filter(r => r.stage === stageFilter)

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 2000,
          padding: '12px 20px', borderRadius: 10,
          background: toast.color, color: 'white',
          fontSize: '0.85rem', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle size={16} />
          {toast.message}
        </div>
      )}
      {panelItem && (
        <>
          <div onClick={() => setPanelItem(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 999 }} />
          <ReviewDetailPanel
            item={panelItem}
            onClose={() => setPanelItem(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            onConditional={handleConditional}
            onEscalate={handleEscalate}
          />
        </>
      )}
      <div className="page-header">
        <h2>投放合规中心</h2>
        <p>素材→审核→投放 · 抖音/小红书/快手/微信广告政策实时同步 · 拒审影响分析 · AI预审+人工复核 · 确保素材合规上线</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="ComplianceNLP" color="#f59e0b" />
          <ModelBadge name="UGCQuality-Ranker" color="#ec4899" />
          <ModelBadge name="SentimentAnalyzer" color="#8b5cf6" />
          <ModelBadge name="ContentLLM-Beauty" color="#ec4899" />
          <ModelBadge name="FraudDetector-XGB" color="#f59e0b" />
        </div>

        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'待审核',value:pending+flagged,pending,flagged,criticalPending}})} style={{cursor:'pointer'}}>
            <div className="card-title"><Clock size={14} style={{ display: 'inline' }} /> 待审核</div>
            <div className="card-value">{pending + flagged}</div>
            <div className="card-change negative">{criticalPending > 0 ? `${criticalPending} 个紧急(明日上线)` : '无紧急'}</div>
          </div>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'今日通过率',value:'95%'}})} style={{cursor:'pointer'}}>
            <div className="card-title"><Zap size={14} style={{ display: 'inline' }} /> 今日通过率</div>
            <div className="card-value" style={{ color: '#e8365d' }}>95%</div>
            <div className="card-change positive">AI预审 6s/条</div>
          </div>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'拒审影响',value:`¥${(rejectionImpact.reduce((s, r) => s + r.estimatedLoss, 0)).toLocaleString()}`}})} style={{cursor:'pointer'}}>
            <div className="card-title"><Ban size={14} style={{ display: 'inline', color: '#dc2626' }} /> 拒审影响</div>
            <div className="card-value" style={{ color: '#dc2626' }}>¥{(rejectionImpact.reduce((s, r) => s + r.estimatedLoss, 0)).toLocaleString()}</div>
            <div className="card-change negative">预估日损失预算</div>
          </div>
          <div className="card" onClick={() => setSelectedDetail({type:'kpi',data:{label:'政策规则',value:platformPolicies.reduce((s, p) => s + p.categories.reduce((ss, c) => ss + c.rules, 0), 0)}})} style={{cursor:'pointer'}}>
            <div className="card-title"><Shield size={14} style={{ display: 'inline' }} /> 政策规则</div>
            <div className="card-value">{platformPolicies.reduce((s, p) => s + p.categories.reduce((ss, c) => ss + c.rules, 0), 0)}</div>
            <div className="card-change positive">4大国内平台实时同步</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'queue' ? 'active' : ''}`} onClick={() => setTab('queue')}>投放审核队列</button>
          <button className={`tab ${tab === 'platform' ? 'active' : ''}`} onClick={() => setTab('platform')}>平台政策合规</button>
          <button className={`tab ${tab === 'impact' ? 'active' : ''}`} onClick={() => setTab('impact')}>拒审影响分析</button>
          <button className={`tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>审核效能</button>
        </div>

        {/* ===== Tab 1: 投放审核队列 ===== */}
        {tab === 'queue' && (
          <>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>审核优先级 = 广告计划上线紧迫度</strong>：按广告计划的上线日期排序，明日上线的素材标记为"紧急"优先审核。拒审的素材会自动触发替换生产任务。
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { key: 'all', label: '全部' },
                { key: 'pending', label: `待审核 (${pending})` },
                { key: 'flagged', label: `需复核 (${flagged})` },
                { key: 'approved', label: `已通过 (${approved})` },
                { key: 'rejected', label: `已拒绝 (${rejected})` },
              ].map(f => (
                <button key={f.key} onClick={() => setStageFilter(f.key)} style={{
                  padding: '5px 14px', borderRadius: 6, border: '1px solid var(--border)',
                  background: stageFilter === f.key ? '#e8365d' : 'white',
                  color: stageFilter === f.key ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500
                }}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="card">
              <table className="data-table">
                <thead>
                  <tr><th>素材</th><th>广告计划</th><th>平台</th><th>上线日期</th><th>合规检查</th><th>AI判定</th><th>风险标记</th><th>状态</th><th>操作</th></tr>
                </thead>
                <tbody>
                  {filteredQueue.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setPanelItem(r)}>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text-muted)' }}>{r.materialId}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.hook}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{r.format}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>{r.campaignName}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: 'var(--text-muted)' }}>{r.campaign}</div>
                      </td>
                      <td>
                        <span className="cluster-tag" style={{
                          background: r.platform === '抖音' ? 'rgba(0,0,0,0.06)' : r.platform === '小红书' ? 'rgba(255,51,51,0.08)' : r.platform === '快手' ? 'rgba(255,166,0,0.1)' : 'rgba(9,187,7,0.08)',
                          color: r.platform === '抖音' ? '#1f2937' : r.platform === '小红书' ? '#e8365d' : r.platform === '快手' ? '#ca8a04' : '#059669'
                        }}>{r.platform}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: r.urgency === 'critical' ? 700 : 400, color: r.urgency === 'critical' ? '#dc2626' : r.urgency === 'high' ? '#f59e0b' : 'var(--text-primary)' }}>
                          {r.launchDate}
                        </div>
                        {r.urgency === 'critical' && <span style={{ fontSize: '0.6rem', color: '#dc2626', fontWeight: 600 }}>明日上线!</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {Object.entries(r.policyCheck).map(([key, val]) => (
                            <span key={key} style={{
                              padding: '1px 5px', borderRadius: 3, fontSize: '0.55rem', fontWeight: 600,
                              background: val === 'pass' ? 'rgba(34,197,94,0.1)' : val === 'review' ? 'rgba(245,158,11,0.1)' : 'rgba(220,38,38,0.1)',
                              color: val === 'pass' ? '#16a34a' : val === 'review' ? '#f59e0b' : '#dc2626'
                            }}>
                              {key} {val === 'pass' ? '✓' : val === 'review' ? '?' : '✗'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600,
                          background: r.aiVerdict === 'pass' ? 'rgba(232,54,93,0.1)' : r.aiVerdict === 'reject' ? '#fee2e2' : '#fef3c7',
                          color: r.aiVerdict === 'pass' ? '#e8365d' : r.aiVerdict === 'reject' ? '#991b1b' : '#92400e'
                        }}>
                          {r.aiVerdict === 'pass' ? '通过' : r.aiVerdict === 'reject' ? '拒绝' : '需复核'}
                        </span>
                        <div style={{ fontSize: '0.6rem', color: r.confidence >= 95 ? '#e8365d' : '#f59e0b', marginTop: 2 }}>
                          置信度 {r.confidence}%
                        </div>
                      </td>
                      <td>
                        {r.flags.length > 0 ? (
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            {r.flags.map((f, i) => (
                              <span key={i} style={{ padding: '1px 5px', borderRadius: 4, fontSize: '0.55rem', fontWeight: 600, background: '#fef3c7', color: '#92400e' }}>
                                <AlertTriangle size={8} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />{f}
                              </span>
                            ))}
                          </div>
                        ) : <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>无风险</span>}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          r.stage === 'approved' ? 'running' : r.stage === 'rejected' ? 'error' : r.stage === 'flagged' ? 'idle' : 'training'
                        }`}>
                          <span className={`status-dot ${
                            r.stage === 'approved' ? 'running' : r.stage === 'rejected' ? 'error' : r.stage === 'flagged' ? 'idle' : 'training'
                          }`} />
                          {r.stage === 'approved' ? '已通过' : r.stage === 'rejected' ? '已拒绝' : r.stage === 'flagged' ? '需复核' : '待审核'}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {(r.stage === 'pending' || r.stage === 'flagged') && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handleApprove(r.id)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', background: '#e8365d', color: 'white', fontSize: '0.65rem', cursor: 'pointer' }}>
                              <ThumbsUp size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />通过
                            </button>
                            <button onClick={() => handleReject(r.id)} style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #dc2626', background: 'white', color: '#dc2626', fontSize: '0.65rem', cursor: 'pointer' }}>
                              <ThumbsDown size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />拒绝
                            </button>
                          </div>
                        )}
                        {r.stage === 'rejected' && (
                          <button onClick={() => handleTriggerReplacement(r.id)} style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #f59e0b', background: 'white', color: '#f59e0b', fontSize: '0.65rem', cursor: 'pointer' }}>
                            <RefreshCw size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />触发替换
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== Tab 2: 平台政策合规 ===== */}
        {tab === 'platform' && (
          <>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(232,54,93,0.05)', borderColor: 'rgba(232,54,93,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#e8365d' }}>各平台广告政策独立管理</strong>：抖音/小红书/快手/微信广告各有不同的广告内容政策、广告法规范和合规要求。合规审核智能体实时爬取政策更新，自动调整审核标准。
              </div>
            </div>

            {platformPolicies.map(p => {
              const isExpanded = expandedPlatform === p.platform
              const totalRules = p.categories.reduce((s, c) => s + c.rules, 0)
              const totalViolations = p.categories.reduce((s, c) => s + c.violations, 0)

              return (
                <div key={p.platform} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                    onClick={() => setExpandedPlatform(isExpanded ? null : p.platform)}>
                    <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.platform} 广告政策</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {totalRules} 条规则 · {p.categories.length} 类别 · 待审 {p.pendingReview} 条 · 日审核量 {p.dailyVolume}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: p.passRate >= 95 ? '#e8365d' : p.passRate >= 90 ? '#a78bfa' : '#f59e0b' }}>{p.passRate}%</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>通过率</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: totalViolations > 3 ? '#dc2626' : totalViolations > 0 ? '#f59e0b' : '#22c55e' }}>{totalViolations}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>违规</div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                        <div style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8, fontSize: '0.72rem', flex: 1 }}>
                          <span style={{ color: 'var(--text-muted)' }}>平均审核耗时:</span> <strong>{p.avgReviewTime}</strong>
                        </div>
                        <div style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8, fontSize: '0.72rem', flex: 1 }}>
                          <span style={{ color: 'var(--text-muted)' }}>日审核量:</span> <strong>{p.dailyVolume}</strong>
                        </div>
                        <div style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8, fontSize: '0.72rem', flex: 1 }}>
                          <span style={{ color: 'var(--text-muted)' }}>待审核:</span> <strong style={{ color: p.pendingReview > 5 ? '#f59e0b' : '#e8365d' }}>{p.pendingReview}</strong>
                        </div>
                      </div>
                      <table className="data-table">
                        <thead>
                          <tr><th>政策类别</th><th>规则数</th><th>最近同步</th><th>覆盖率</th><th>近7日违规</th><th>主要违规</th></tr>
                        </thead>
                        <tbody>
                          {p.categories.map((c, i) => (
                            <tr key={i} onClick={() => setSelectedDetail({type:'policyCategory',data:{...c, platform: p.platform}})} style={{cursor:'pointer'}}>
                              <td style={{ fontWeight: 600 }}>{c.name}</td>
                              <td style={{ fontWeight: 600, color: '#e8365d' }}>{c.rules}</td>
                              <td style={{ fontSize: '0.75rem' }}>{c.synced}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div className="progress-bar" style={{ width: 60 }}>
                                    <div className="progress-bar-fill" style={{ width: `${c.coverage}%`, background: c.coverage >= 97 ? '#e8365d' : c.coverage >= 93 ? '#a78bfa' : '#f59e0b' }} />
                                  </div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.coverage}%</span>
                                </div>
                              </td>
                              <td style={{ fontWeight: 600, color: c.violations > 3 ? '#dc2626' : c.violations > 0 ? '#f59e0b' : '#22c55e' }}>
                                {c.violations}
                              </td>
                              <td style={{ fontSize: '0.75rem' }}>{c.topViolation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* ===== Tab 3: 拒审影响分析 ===== */}
        {tab === 'impact' && (
          <>
            <div className="card" style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(220,38,38,0.05)', borderColor: 'rgba(220,38,38,0.15)' }}>
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#dc2626' }}>拒审 = 投放损失</strong>：每一条被拒素材都意味着对应广告计划的可用弹药减少。当活跃素材数低于阈值，广告计划将无法有效跑量。系统自动评估拒审对各计划的影响并触发补充生产。
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title"><AlertCircle size={16} color="#dc2626" /> 受影响的广告计划</div>
              <table className="data-table">
                <thead>
                  <tr><th>广告计划</th><th>平台</th><th>被拒素材</th><th>活跃素材</th><th>影响等级</th><th>日预算</th><th>预估损失</th><th>拒审原因</th><th>建议</th></tr>
                </thead>
                <tbody>
                  {rejectionImpact.map(r => (
                    <tr key={r.campaign} onClick={() => setSelectedDetail({type:'rejection',data:r})} style={{cursor:'pointer'}}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.name}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{r.campaign}</div>
                      </td>
                      <td>
                        <span className="cluster-tag" style={{
                          background: r.platform === '抖音' ? 'rgba(0,0,0,0.06)' : r.platform === '小红书' ? 'rgba(255,51,51,0.08)' : r.platform === '快手' ? 'rgba(255,166,0,0.1)' : 'rgba(9,187,7,0.08)',
                          color: r.platform === '抖音' ? '#1f2937' : r.platform === '小红书' ? '#e8365d' : r.platform === '快手' ? '#ca8a04' : '#059669'
                        }}>{r.platform}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>{r.rejectedCount}</td>
                      <td style={{ fontWeight: 600 }}>{r.activeMaterials}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600,
                          background: r.impactLevel === 'high' ? '#fee2e2' : r.impactLevel === 'medium' ? '#fef3c7' : '#f3e8ff',
                          color: r.impactLevel === 'high' ? '#991b1b' : r.impactLevel === 'medium' ? '#92400e' : '#5b21b6'
                        }}>
                          {r.impactLevel === 'high' ? '严重' : r.impactLevel === 'medium' ? '中等' : '轻微'}
                        </span>
                      </td>
                      <td>¥{r.dailyBudget.toLocaleString()}/天</td>
                      <td style={{ fontWeight: 700, color: '#dc2626' }}>¥{r.estimatedLoss.toLocaleString()}/天</td>
                      <td style={{ fontSize: '0.75rem', maxWidth: 180 }}>{r.reason}</td>
                      <td>
                        <div style={{ fontSize: '0.72rem', color: '#e8365d', fontWeight: 600 }}>{r.suggestion}</div>
                        <button
                          onClick={e => { e.stopPropagation(); handleTriggerFixProduction(r.campaign) }}
                          disabled={triggeredCampaigns.has(r.campaign)}
                          style={{ marginTop: 4, padding: '2px 8px', borderRadius: 4, border: 'none', background: triggeredCampaigns.has(r.campaign) ? '#9ca3af' : '#e8365d', color: 'white', fontSize: '0.6rem', cursor: triggeredCampaigns.has(r.campaign) ? 'default' : 'pointer' }}>
                          {triggeredCampaigns.has(r.campaign) ? '已触发' : '触发修复生产'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="section-title"><BarChart3 size={16} /> 拒审原因分布（近7日）</div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={rejectionReasons} cx="50%" cy="50%" outerRadius={100} innerRadius={55} dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}>
                      {rejectionReasons.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="section-title"><DollarSign size={16} /> 拒审经济影响汇总</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: '总被拒素材', value: '6', desc: '近7日' },
                    { label: '总预估日损失', value: '¥2,500', desc: '可消耗预算浪费' },
                    { label: '平均修复耗时', value: '3.2h', desc: '从拒审到替换上线' },
                    { label: '修复后ROAS', value: '2.4x', desc: '替换素材平均表现' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: i < 2 ? '#dc2626' : '#e8365d' }}>{item.value}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== Tab 4: 审核效能 ===== */}
        {tab === 'analytics' && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><TrendingUp size={16} /> 审核通过率 & 日审核量趋势</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={reviewEfficiency}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" domain={[85, 100]} tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line yAxisId="left" type="monotone" dataKey="passRate" stroke="#e8365d" strokeWidth={2.5} name="通过率" dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="volume" stroke="#a855f7" strokeWidth={1.5} name="日审核量" dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="section-title"><Zap size={16} /> 各平台审核效率对比</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={platformPolicies.map(p => ({
                    platform: p.platform,
                    passRate: p.passRate,
                    avgTime: parseInt(p.avgReviewTime),
                    volume: p.dailyVolume,
                  }))}>
                    <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="passRate" fill="#e8365d" name="通过率(%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="volume" fill="#c084fc" name="日审核量" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="section-title"><Shield size={16} /> 合规审核关键指标</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: '日均审核量', value: '478', desc: 'AI自动+人工复核' },
                  { label: 'AI直接通过率', value: '87%', desc: '置信度>95%免人工' },
                  { label: '人工复核率', value: '13%', desc: '置信度<85%需人工' },
                  { label: '平均审核耗时', value: '6.2s', desc: '较纯人工快52倍' },
                  { label: '误判率', value: '0.2%', desc: '误拒+误通过' },
                  { label: '政策同步频率', value: '每6h', desc: '自动爬取更新' },
                  { label: '素材上线率', value: '95%', desc: '审核通过→投放' },
                  { label: '拒审修复率', value: '78%', desc: '修复后重审通过' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e8365d' }}>{item.value}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
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
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {selectedDetail.type === 'kpi' && `${selectedDetail.data.label} 详细分析`}
                {selectedDetail.type === 'rejection' && `拒审影响 · ${selectedDetail.data.name}`}
                {selectedDetail.type === 'policyCategory' && `${selectedDetail.data.platform} · ${selectedDetail.data.name}`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'kpi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">审核历史趋势</div>
                  <table className="data-table">
                    <thead><tr><th>日期</th><th>通过率</th><th>审核量</th><th>平均耗时</th><th>AI直通率</th></tr></thead>
                    <tbody>
                      {reviewEfficiency.map(r => (
                        <tr key={r.date}><td>{r.date}</td><td style={{fontWeight:600,color:'#e8365d'}}>{r.passRate}%</td><td>{r.volume}</td><td>{r.avgTime}s</td><td style={{color:'#16a34a'}}>{Math.round(r.passRate * 0.92)}%</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">AI vs 人工评分一致性</div>
                  <table className="data-table">
                    <thead><tr><th>平台</th><th>AI判定</th><th>人工复核</th><th>一致率</th><th>分歧处理</th></tr></thead>
                    <tbody>
                      {[{p:'抖音',ai:148,h:12,c:'97.2%',r:'以人工为准'},{p:'小红书',ai:126,h:18,c:'94.8%',r:'以人工为准'},{p:'快手',ai:85,h:6,c:'98.1%',r:'AI自动更新'},{p:'微信广告',ai:41,h:2,c:'99.1%',r:'AI自动更新'}].map(r => (
                        <tr key={r.p}><td style={{fontWeight:600}}>{r.p}</td><td>{r.ai}</td><td>{r.h}</td><td style={{fontWeight:700,color:'#e8365d'}}>{r.c}</td><td style={{fontSize:'0.72rem'}}>{r.r}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedDetail.type === 'rejection' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">拒审详情</div>
                  <table className="data-table">
                    <thead><tr><th>属性</th><th>值</th></tr></thead>
                    <tbody>
                      <tr><td>广告计划</td><td style={{fontWeight:600}}>{selectedDetail.data.name}</td></tr>
                      <tr><td>计划ID</td><td style={{fontFamily:'monospace'}}>{selectedDetail.data.campaign}</td></tr>
                      <tr><td>平台</td><td>{selectedDetail.data.platform}</td></tr>
                      <tr><td>被拒素材数</td><td style={{fontWeight:700,color:'#dc2626'}}>{selectedDetail.data.rejectedCount}</td></tr>
                      <tr><td>剩余活跃素材</td><td>{selectedDetail.data.activeMaterials}</td></tr>
                      <tr><td>日预算</td><td>¥{selectedDetail.data.dailyBudget.toLocaleString()}/天</td></tr>
                      <tr><td>预估日损失</td><td style={{fontWeight:700,color:'#dc2626'}}>¥{selectedDetail.data.estimatedLoss.toLocaleString()}/天</td></tr>
                      <tr><td>拒审原因</td><td>{selectedDetail.data.reason}</td></tr>
                      <tr><td>建议</td><td style={{color:'#e8365d',fontWeight:600}}>{selectedDetail.data.suggestion}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">合规检查清单</div>
                  <table className="data-table">
                    <thead><tr><th>检查项</th><th>结果</th><th>详情</th></tr></thead>
                    <tbody>
                      {[{c:'平台广告政策',r:'不通过',d:selectedDetail.data.reason},{c:'功效宣称合规',r: selectedDetail.data.impactLevel === 'high' ? '风险' : '通过',d:'需人工确认'},{c:'版权检查',r:'通过',d:'素材原创'},{c:'广告标识合规',r:'通过',d:'#广告标注完整'},{c:'广告法合规',r: selectedDetail.data.platform === '微信广告' ? '风险' : '通过',d:'国内法规合规检查'}].map((r,i) => (
                        <tr key={i}><td style={{fontWeight:600}}>{r.c}</td><td style={{fontWeight:600,color: r.r === '通过' ? '#16a34a' : '#dc2626'}}>{r.r}</td><td style={{fontSize:'0.72rem'}}>{r.d}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">申诉状态</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {[{s:'素材修改',d:'裁剪敏感片段',st:'进行中'},{s:'重新提交',d:'修改后重新提交审核',st:'待执行'},{s:'替换生产',d:'AI自动生成替代素材',st:'已触发'}].map((item,i) => (
                      <div key={i} style={{padding:'10px 14px',background:'var(--bg-card)',borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div><div style={{fontWeight:600,fontSize:'0.82rem'}}>{item.s}</div><div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{item.d}</div></div>
                        <span style={{fontSize:'0.72rem',fontWeight:600,color: item.st === '进行中' ? '#3b82f6' : item.st === '已触发' ? '#16a34a' : '#f59e0b'}}>{item.st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedDetail.type === 'policyCategory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">政策类别详情</div>
                  <table className="data-table">
                    <thead><tr><th>属性</th><th>值</th></tr></thead>
                    <tbody>
                      <tr><td>平台</td><td style={{fontWeight:600}}>{selectedDetail.data.platform}</td></tr>
                      <tr><td>类别</td><td style={{fontWeight:600}}>{selectedDetail.data.name}</td></tr>
                      <tr><td>规则数</td><td style={{fontWeight:700,color:'#e8365d'}}>{selectedDetail.data.rules}</td></tr>
                      <tr><td>最近同步</td><td>{selectedDetail.data.synced}</td></tr>
                      <tr><td>覆盖率</td><td style={{fontWeight:600}}>{selectedDetail.data.coverage}%</td></tr>
                      <tr><td>近7日违规</td><td style={{fontWeight:700,color: selectedDetail.data.violations > 0 ? '#dc2626' : '#16a34a'}}>{selectedDetail.data.violations}</td></tr>
                      <tr><td>主要违规</td><td>{selectedDetail.data.topViolation}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">规则变更记录</div>
                  <table className="data-table">
                    <thead><tr><th>日期</th><th>变更内容</th><th>影响</th><th>状态</th></tr></thead>
                    <tbody>
                      {[{d:'2026-04-03',c:'新增广告法禁用词检测规则',i:'美妆素材需重新审核极限词',s:'已生效'},{d:'2026-04-01',c:'功效宣称检测阈值调整',i:'华南华东区域规范更严格',s:'已生效'},{d:'2026-03-28',c:'广告标识合规检查',i:'KOL合作素材须标注#广告',s:'已生效'}].map((r,i) => (
                        <tr key={i}><td>{r.d}</td><td style={{fontWeight:600}}>{r.c}</td><td style={{fontSize:'0.72rem'}}>{r.i}</td><td style={{color:'#16a34a',fontSize:'0.72rem'}}>{r.s}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
