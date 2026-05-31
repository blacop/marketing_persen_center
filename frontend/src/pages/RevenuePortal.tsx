import React, { useState, useEffect, useCallback } from 'react'
import { exportCsv, exportObjectsCsv } from '../utils/exportCsv'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell,
  BarChart, AreaChart, Area,
} from 'recharts'
import {
  DollarSign, BookOpen, TrendingUp, Download,
  Plus, ChevronRight, AlertTriangle, CheckCircle, Clock,
  Shield, BarChart3, RefreshCw,
  X, Eye, Copy, ExternalLink, Info, Check,
  FileText, Trash2, Pause, Edit, Brain
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── Types ──────────────────────────────────────────────────────────────────
interface Toast {
  id: number
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const monthlyTrend = [
  { month: '4月', 消耗: 820000,  GMV: 246000 },
  { month: '5月', 消耗: 940000,  GMV: 282000 },
  { month: '6月', 消耗: 1080000, GMV: 324000 },
  { month: '7月', 消耗: 1230000, GMV: 369000 },
  { month: '8月', 消耗: 1150000, GMV: 345000 },
  { month: '9月', 消耗: 1340000, GMV: 402000 },
  { month: '10月', 消耗: 1560000, GMV: 468000 },
  { month: '11月', 消耗: 1820000, GMV: 546000 },
  { month: '12月', 消耗: 2100000, GMV: 630000 },
  { month: '1月', 消耗: 1780000, GMV: 534000 },
  { month: '2月', 消耗: 1920000, GMV: 576000 },
  { month: '3月', 消耗: 4130000, GMV: 1239000 },
]

const revenueSourcePie = [
  { name: '唇妆系列',  value: 38, color: '#e8365d' },
  { name: '眼妆系列',  value: 26, color: '#ff7a95' },
  { name: '底妆系列',  value: 22, color: '#ff9eb5' },
  { name: 'KOL佣金',  value: 9,  color: '#ffb3c6' },
  { name: '其他',     value: 5,  color: '#ffc8d5' },
]

const topIPs = [
  { name: '唇釉丝绒系列', revenue: 3120000 },
  { name: '眼影盘星空',   revenue: 2670000 },
  { name: '粉底液水光',   revenue: 2340000 },
  { name: '睫毛膏纤长',   revenue: 1980000 },
  { name: '卸妆水温和',   revenue: 1560000 },
]

const ipDetail = [
  { name: '唇釉丝绒系列', type: '唇妆新品', adaptations: 8, monthSpend: '¥412万', monthShare: '¥1,236万', ratio: '抖音/小红书', roi: 4.2, status: '热投中' },
  { name: '眼影盘星空',   type: '眼妆爆款', adaptations: 6, monthSpend: '¥356万', monthShare: '¥1,068万', ratio: '抖音/快手',   roi: 3.8, status: '热投中' },
  { name: '粉底液水光',   type: '底妆主力', adaptations: 5, monthSpend: '¥312万', monthShare: '¥936万',   ratio: '小红书/天猫', roi: 3.5, status: '热投中' },
  { name: '睫毛膏纤长',   type: '眼妆单品', adaptations: 4, monthSpend: '¥264万', monthShare: '¥660万',   ratio: '抖音/京东',   roi: 3.1, status: '增长中' },
  { name: '卸妆水温和',   type: '护肤辅助', adaptations: 7, monthSpend: '¥208万', monthShare: '¥520万',   ratio: '小红书/天猫', roi: 2.9, status: '增长中' },
  { name: '高光修容盘',   type: '修容新品', adaptations: 3, monthSpend: '¥156万', monthShare: '¥390万',   ratio: '抖音/小红书', roi: 2.7, status: '测试中' },
  { name: '防晒隔离霜',   type: '护肤防护', adaptations: 2, monthSpend: '¥98万',  monthShare: '¥245万',   ratio: '小红书',     roi: 2.4, status: '测试中' },
  { name: '气垫粉底',     type: '底妆新品', adaptations: 5, monthSpend: '¥187万', monthShare: '¥467万',   ratio: '抖音/天猫',   roi: 3.0, status: '增长中' },
  { name: '眼线液笔',     type: '眼妆单品', adaptations: 4, monthSpend: '¥143万', monthShare: '¥429万',   ratio: '快手/京东',   roi: 3.3, status: '增长中' },
  { name: '定妆散粉',     type: '底妆辅助', adaptations: 3, monthSpend: '¥112万', monthShare: '¥336万',   ratio: '抖音',       roi: 2.6, status: '测试中' },
  { name: '腮红系列',     type: '修容单品', adaptations: 6, monthSpend: '¥234万', monthShare: '¥702万',   ratio: '小红书/天猫', roi: 3.4, status: '增长中' },
  { name: '护肤礼盒',     type: '礼赠套装', adaptations: 4, monthSpend: '¥89万',  monthShare: '¥222万',   ratio: '天猫/京东',   roi: 2.2, status: '暂停' },
]

const ip7DayTrend: { day: string; revenue: number }[][] = ipDetail.map((ip, i) =>
  Array.from({ length: 7 }, (_, d) => ({
    day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][d],
    revenue: Math.round((parseFloat(ip.monthShare.replace(/[¥万]/g, '')) * 10000 / 30) * (0.8 + Math.sin((d + i) * 0.7) * 0.25 + Math.random() * 0.1)),
  }))
)

const settlementRecords = [
  { id: 'STL-20240401', partner: '唇釉丝绒系列', type: '月度GMV结算', amount: '¥1,236,000', currency: 'CNY', status: '已结算', hash: '0x7f3a...e821', time: '2026-04-01 02:18:34' },
  { id: 'STL-20240402', partner: '眼影盘星空',   type: '月度GMV结算', amount: '¥1,068,000', currency: 'CNY', status: '已结算', hash: '0x4b2c...d439', time: '2026-04-01 02:21:07' },
  { id: 'STL-20240403', partner: '粉底液水光',   type: '月度GMV结算', amount: '¥936,000',  currency: 'CNY', status: '已结算', hash: '0x9e1f...c762', time: '2026-04-01 02:23:45' },
  { id: 'STL-20240404', partner: '睫毛膏纤长',   type: '里程碑结算', amount: '¥660,000', currency: 'CNY', status: '处理中', hash: '0x2d8b...a104', time: '2026-04-02 10:05:22' },
  { id: 'STL-20240405', partner: '卸妆水温和',   type: '月度GMV结算', amount: '¥520,000',  currency: 'CNY', status: '已结算', hash: '0x6a5e...f317', time: '2026-04-01 02:30:11' },
  { id: 'STL-20240406', partner: '腮红系列',     type: '月度GMV结算', amount: '¥702,000',  currency: 'CNY', status: '已结算', hash: '0x1c7d...b928', time: '2026-04-01 02:31:58' },
  { id: 'STL-20240407', partner: '气垫粉底',     type: '里程碑结算', amount: '¥467,500', currency: 'CNY', status: '处理中', hash: '0x8f3c...e045', time: '2026-04-02 11:12:39' },
  { id: 'STL-20240408', partner: '眼线液笔',     type: '月度GMV结算', amount: '¥429,000',  currency: 'CNY', status: '已结算', hash: '0x3e9a...c673', time: '2026-04-01 02:35:44' },
  { id: 'STL-20240409', partner: '高光修容盘',   type: '新品期结算', amount: '¥390,000', currency: 'CNY', status: '已结算', hash: '0x5b2f...d190', time: '2026-04-01 02:37:22' },
  { id: 'STL-20240410', partner: '定妆散粉',     type: '月度GMV结算', amount: '¥336,000',  currency: 'CNY', status: '失败', hash: '---', time: '2026-04-02 09:44:15' },
  { id: 'STL-20240411', partner: '防晒隔离霜',   type: '新品期结算', amount: '¥245,000', currency: 'CNY', status: '已结算', hash: '0xc4d1...a882', time: '2026-04-01 02:41:03' },
  { id: 'STL-20240412', partner: '护肤礼盒',     type: '暂停期结算', amount: '¥222,500', currency: 'CNY', status: '处理中', hash: '0x7a4e...f561', time: '2026-04-02 13:27:48' },
  { id: 'STL-20240413', partner: '唇釉丝绒系列', type: 'T+0快速结算', amount: '¥84,000', currency: 'CNY', status: '已结算', hash: '0x2b6c...e934', time: '2026-04-03 00:01:12' },
  { id: 'STL-20240414', partner: '眼影盘星空',   type: 'T+0快速结算', amount: '¥72,000', currency: 'CNY', status: '已结算', hash: '0x9f1d...b277', time: '2026-04-03 00:01:18' },
  { id: 'STL-20240415', partner: '粉底液水光',   type: 'T+0快速结算', amount: '¥63,000', currency: 'CNY', status: '处理中', hash: '0x4c8a...d653', time: '2026-04-03 00:01:24' },
]

const contracts = [
  { partner: '抖音巨量引擎', ips: 3, ratio: '合约ROI 3.5x', startDate: '2025-01-01', endDate: '2026-12-31', status: '生效', daysLeft: 273 },
  { partner: '小红书聚光',   ips: 2, ratio: '合约ROI 3.2x', startDate: '2025-06-01', endDate: '2026-05-31', status: '生效', daysLeft: 58 },
  { partner: '快手磁力引擎', ips: 4, ratio: '合约ROI 2.8x', startDate: '2025-03-01', endDate: '2026-02-28', status: '即将到期', daysLeft: 22 },
  { partner: '天猫品销宝',   ips: 2, ratio: '合约ROI 3.8x', startDate: '2026-02-01', endDate: '2027-01-31', status: '生效', daysLeft: 304 },
  { partner: '京东京准通',   ips: 1, ratio: '合约ROI 2.9x', startDate: '2025-11-01', endDate: '2026-10-31', status: '生效', daysLeft: 211 },
  { partner: 'KOL代运营',   ips: 2, ratio: '合约ROI 4.1x', startDate: '2026-01-15', endDate: '2026-04-15', status: '即将到期', daysLeft: 12 },
]

const predictionData = [
  { month: '4月(预测)', p10: 9800000,  p50: 12400000, p90: 15400000 },
  { month: '5月(预测)', p10: 10500000, p50: 13800000, p90: 17200000 },
  { month: '6月(预测)', p10: 11200000, p50: 15100000, p90: 18900000 },
]

const ipPrediction = [
  { name: '唇釉丝绒系列', current: 1236000, predicted: 1580000, growth: '+27.8%', confidence: 87, risk: '低' },
  { name: '眼影盘星空',   current: 1068000, predicted: 1380000, growth: '+29.2%', confidence: 84, risk: '低' },
  { name: '粉底液水光',   current: 936000,  predicted: 1150000, growth: '+22.9%', confidence: 81, risk: '低' },
  { name: '睫毛膏纤长',   current: 660000,  predicted: 890000,  growth: '+34.8%', confidence: 76, risk: '中' },
  { name: '卸妆水温和',   current: 520000,  predicted: 640000,  growth: '+23.1%', confidence: 79, risk: '低' },
  { name: '高光修容盘',   current: 390000,  predicted: 580000,  growth: '+48.7%', confidence: 64, risk: '高' },
]

const scenarioBudget = [
  { boost: '+10%', revIncrease: '+¥142万', roi: '4.1x', topIP: '唇釉丝绒 +¥38万' },
  { boost: '+20%', revIncrease: '+¥268万', roi: '4.0x', topIP: '唇釉丝绒 +¥71万' },
  { boost: '+50%', revIncrease: '+¥580万', roi: '3.7x', topIP: '唇釉丝绒 +¥154万' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

function fmt(n: number): string {
  if (n >= 1e8) return `¥${(n / 1e8).toFixed(2)}亿`
  if (n >= 1e4) return `¥${(n / 1e4).toFixed(0)}万`
  return `¥${n}`
}

// ─── Overlay Styles ──────────────────────────────────────────────────────────
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

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon: Icon, accent, onClick }: {
  title: string; value: string; sub: string; icon: React.ElementType; accent: string; onClick?: () => void
}) {
  return (
    <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.15s' }}
      onClick={onClick}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, background: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color="white" />
      </div>
      <div>
        <div className="card-title">{title}</div>
        <div className="card-value" style={{ fontSize: '1.45rem' }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
        {onClick && <div style={{ fontSize: '0.65rem', color: '#e8365d', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10} /> 点击查看详情</div>}
      </div>
    </div>
  )
}

// ─── Tab 1: Revenue Overview ──────────────────────────────────────────────────
function RevenueOverviewTab({ addToast }: { addToast: (msg: string, type: Toast['type']) => void }) {
  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="card-title">12个月月度GMV趋势</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => addToast('趋势图数据已刷新', 'info')} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'white',
              cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
            }}><RefreshCw size={12} /> 刷新</button>
            <button onClick={() => { exportCsv('收入趋势', ['月份','消耗','GMV'], monthlyTrend.map(r => [r.month, r.消耗, r.GMV])); addToast('趋势数据已导出', 'success') }} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'white',
              cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
            }}><Download size={12} /> 导出</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={tooltipStyle} formatter={((v: number, name: string) => [`$${(v / 1000).toFixed(0)}K`, name]) as any} />
            <Legend />
            <Bar yAxisId="left" dataKey="消耗" fill="#ffb3c6" radius={[4, 4, 0, 0]} opacity={0.7} />
            <Line yAxisId="right" type="monotone" dataKey="GMV" stroke="#e8365d" strokeWidth={2.5} dot={{ fill: '#e8365d', r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="grid-2" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>GMV来源分布</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={revenueSourcePie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}
                  style={{ cursor: 'pointer' }}
                  onClick={(_, index) => addToast(`${revenueSourcePie[index].name}: ${revenueSourcePie[index].value}%`, 'info')}>
                  {revenueSourcePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [`${v}%`, '']) as any} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {revenueSourcePie.map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer', padding: '2px 4px', borderRadius: 4, transition: 'background 0.15s' }}
                  onClick={() => addToast(`${r.name}: 占比 ${r.value}%`, 'info')}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff0f3')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{r.name}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>收益TOP5 IP排行</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topIPs} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={70} />
              <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [`$${(v / 1000).toFixed(0)}K`, '本月GMV']) as any} />
              <Bar dataKey="revenue" fill="var(--accent-primary)" radius={[0, 6, 6, 0]}
                style={{ cursor: 'pointer' }}
                onClick={(data) => addToast(`${(data as any).name}: $${((data as any).revenue / 1000).toFixed(0)}K 本月GMV`, 'info')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ─── Revenue Drill Panel ──────────────────────────────────────────────────────
function RevenueDrillPanel({ ip, idx, onClose, addToast }: {
  ip: typeof ipDetail[0]; idx: number; onClose: () => void; addToast: (m: string, t: Toast['type']) => void
}) {
  const panels: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
    zIndex: 1500, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
    padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 14,
  }
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1499 }
  const row = (label: string, value: React.ReactNode) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
  const share = parseFloat(ip.monthShare.replace(/[$K]/g, '')) * 1000
  const netRev = share * 0.87
  const chargebackRate = (1.2 + idx * 0.15).toFixed(1)
  const fraudRate = (0.3 + idx * 0.08).toFixed(1)
  const mom = parseFloat(ip.monthShare.replace(/[$K]/g, '')) * 0.08
  const yoy = parseFloat(ip.monthShare.replace(/[$K]/g, '')) * 0.24
  const dateBreakdown = [
    { week: '第1周', rev: Math.round(share * 0.22), pct: 22 },
    { week: '第2周', rev: Math.round(share * 0.26), pct: 26 },
    { week: '第3周', rev: Math.round(share * 0.28), pct: 28 },
    { week: '第4周', rev: Math.round(share * 0.24), pct: 24 },
  ]
  const platformBreak = [
    { name: '抖音巨量', pct: 42 }, { name: '小红书聚光', pct: 28 }, { name: '快手磁力', pct: 18 }, { name: '其他', pct: 12 }
  ]
  const regionBreak = [
    { name: '华东', pct: 42 }, { name: '华南', pct: 28 }, { name: '华北', pct: 18 }, { name: '其他', pct: 12 }
  ]
  const processors = [
    { name: '支付宝', pct: 48, fee: '0.6%' }, { name: '微信支付', pct: 32, fee: '0.6%' }, { name: '银行转账', pct: 20, fee: '0.1%' }
  ]
  const btnStyle = (color = '#e8365d'): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 8, border: `1px solid ${color}`,
    background: `${color}20`, color, fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
  })
  return (
    <>
      <div style={overlay} onClick={onClose} />
      <div style={panels}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ip.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{ip.type} · {ip.adaptations}部改编</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>

        <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>收入概览</div>
          {row('本月消耗', ip.monthSpend)}
          {row('本月GMV', <span style={{ color: '#e8365d' }}>{ip.monthShare}</span>)}
          {row('扣除平台费&退款后净收入', `$${(netRev / 1000).toFixed(1)}K`)}
          {row('平台费率', '10%')}
          {row('退款金额', `$${(share * 0.03 / 1000).toFixed(1)}K`)}
          {row('ROI', <span style={{ color: ip.roi >= 3.5 ? '#059669' : '#e8365d' }}>{ip.roi}x</span>)}
          {row('MoM 增长', <span style={{ color: '#059669' }}>+${mom.toFixed(0)}K (+8.2%)</span>)}
          {row('YoY 增长', <span style={{ color: '#059669' }}>+${yoy.toFixed(0)}K (+24.1%)</span>)}
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>按日期分布（本月）</div>
          {dateBreakdown.map(d => (
            <div key={d.week} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 3 }}>
                <span style={{ color: 'var(--text-muted)' }}>{d.week}</span>
                <span style={{ fontWeight: 600 }}>${(d.rev / 1000).toFixed(1)}K ({d.pct}%)</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${d.pct * 2.5}%`, height: '100%', background: '#e8365d', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>平台分布</div>
          {platformBreak.map(p => (
            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
              <span style={{ fontWeight: 600 }}>{p.pct}%  ·  ${((share * p.pct / 100) / 1000).toFixed(1)}K</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>地区分布</div>
          {regionBreak.map(r => (
            <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{r.name}</span>
              <span style={{ fontWeight: 600 }}>{r.pct}%</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>支付渠道分布</div>
          {processors.map(p => (
            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
              <span style={{ fontWeight: 600 }}>{p.pct}% · 费率 {p.fee}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: 12, background: 'rgba(239,68,68,0.06)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>风险指标</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>退款率</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706' }}>{chargebackRate}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>欺诈率</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>{fraudRate}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>净利润率</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>87.3%</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btnStyle()} onClick={() => addToast(`${ip.name} 详情报告已导出`, 'success')}>导出报告</button>
          <button style={btnStyle('#059669')} onClick={() => addToast(`${ip.name} 已加入优先追投`, 'success')}>优先追投</button>
          <button style={btnStyle('#d97706')} onClick={() => addToast(`${ip.name} 分成谈判已发起`, 'info')}>调整分成</button>
        </div>
      </div>
    </>
  )
}

// ─── Tab 2: IP Detail ─────────────────────────────────────────────────────────
function IPDetailTab({ addToast, setShowIPModal }: {
  addToast: (msg: string, type: Toast['type']) => void
  setShowIPModal: (v: number | null) => void
}) {
  const [selectedIP, setSelectedIP] = useState<number | null>(null)
  const [drillIP, setDrillIP] = useState<number | null>(null)

  const ip = selectedIP !== null ? ipDetail[selectedIP] : null
  const trendData = selectedIP !== null ? ip7DayTrend[selectedIP] : []

  const platformBreakdown = [
    { name: '抖音巨量', pct: 42 }, { name: '小红书聚光', pct: 28 },
    { name: '快手磁力', pct: 18 }, { name: '其他', pct: 12 },
  ]

  const statusColor = (s: string) => {
    if (s === '热投中') return { bg: '#ede9fe', color: '#e8365d' }
    if (s === '增长中') return { bg: '#d1fae5', color: '#065f46' }
    if (s === '测试中') return { bg: '#fef3c7', color: '#92400e' }
    return { bg: '#ede9fe', color: '#c9264a' }
  }

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {drillIP !== null && (
        <RevenueDrillPanel
          ip={ipDetail[drillIP]}
          idx={drillIP}
          onClose={() => setDrillIP(null)}
          addToast={addToast}
        />
      )}
      {/* Table */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>共 {ipDetail.length} 个IP</span>
            <button onClick={() => { exportObjectsCsv('产品线明细', ipDetail.map(ip => ({ 产品名称: ip.name, 类型: ip.type, 改编数: ip.adaptations, 月消耗: ip.monthSpend, 月GMV: ip.monthShare, GMV比例: ip.ratio, ROI: ip.roi, 状态: ip.status }))); addToast('产品线明细已导出', 'success') }} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'white',
              cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
            }}><Download size={12} /> 导出</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>产品名称</th><th>类型</th><th>改编数</th><th>本月消耗</th>
                <th>本月GMV</th><th>平台</th><th>ROI</th><th>状态</th>
              </tr>
            </thead>
            <tbody>
              {ipDetail.map((ip, i) => {
                const sc = statusColor(ip.status)
                return (
                  <tr
                    key={i}
                    style={{ cursor: 'pointer', background: selectedIP === i ? 'rgba(232,54,93,0.06)' : undefined }}
                    onClick={() => setSelectedIP(selectedIP === i ? null : i)}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline dotted' }}
                          onClick={e => { e.stopPropagation(); setDrillIP(i) }}>{ip.name}</span>
                        {selectedIP === i && <ChevronRight size={14} color="var(--accent-primary)" />}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>{ip.type}</td>
                    <td style={{ textAlign: 'center' }}>{ip.adaptations}</td>
                    <td style={{ fontWeight: 500 }}>{ip.monthSpend}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{ip.monthShare}</td>
                    <td>{ip.ratio}</td>
                    <td style={{ fontWeight: 700, color: ip.roi >= 3.5 ? '#059669' : ip.roi >= 3 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                      {ip.roi}x
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {ip.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {ip && (
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{ip.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>{ip.type} · {ip.adaptations}部改编</div>
              </div>
              <button onClick={() => setShowIPModal(selectedIP)} style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(232,54,93,0.3)',
                background: 'rgba(232,54,93,0.06)', color: '#e8365d', fontSize: '0.68rem', cursor: 'pointer', fontWeight: 600,
              }}><Eye size={10} /> 详情</button>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>近7日收益趋势</div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8365d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e8365d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                <Tooltip contentStyle={{ ...tooltipStyle, fontSize: '0.65rem' }} formatter={((v: number) => [`$${v.toLocaleString()}`, 'GMV']) as any} />
                <Area type="monotone" dataKey="revenue" stroke="#e8365d" strokeWidth={2} fill="url(#miniGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>平台分布</div>
            {platformBreakdown.map(p => (
              <div key={p.name} style={{ marginBottom: 8, cursor: 'pointer' }}
                onClick={() => addToast(`${ip.name} - ${p.name}: ${p.pct}%`, 'info')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${p.pct}%`, background: 'var(--gradient-1)' }} />
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, cursor: 'pointer' }}
              onClick={() => addToast(`${ip.name}: ${ip.adaptations * 12}套素材`, 'info')}>
              <span style={{ color: 'var(--text-muted)' }}>顶级素材数</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ip.adaptations * 12}套</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, cursor: 'pointer' }}
              onClick={() => addToast('下次结算日: 2026-05-01', 'info')}>
              <span style={{ color: 'var(--text-muted)' }}>下次结算日</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>2026-05-01</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => addToast(`预计结算: ${ip.monthShare}`, 'info')}>
              <span style={{ color: 'var(--text-muted)' }}>预计结算金额</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{ip.monthShare}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => addToast(`${ip.name} 分析报告已分享`, 'success')} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)',
              background: 'white', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}><ExternalLink size={12} /> 分享</button>
            <button onClick={() => { const d = ipDetail.find(x => x.name === ip.name); if (d) exportObjectsCsv(ip.name, [{ 产品名称: d.name, 类型: d.type, 月消耗: d.monthSpend, 月GMV: d.monthShare, ROI: d.roi, 状态: d.status }]); addToast(`${ip.name} 数据已导出`, 'success') }} style={{
              flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
              background: '#e8365d', color: 'white', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}><Download size={12} /> 导出</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 3: Settlement Records ────────────────────────────────────────────────
function SettlementTab({ addToast, setShowSettlementDetail, setShowConfirmDialog }: {
  addToast: (msg: string, type: Toast['type']) => void
  setShowSettlementDetail: (v: typeof settlementRecords[0] | null) => void
  setShowConfirmDialog: (v: { title: string; message: string; onConfirm: () => void } | null) => void
}) {
  const [filterStatus, setFilterStatus] = useState('全部')
  const [filterType, setFilterType] = useState('全部')

  const statuses = ['全部', '已结算', '处理中', '失败']
  const types = ['全部', '月度GMV结算', '里程碑结算', 'T+0快速结算', '测试期结算', '暂停期结算']

  const filtered = settlementRecords.filter(r =>
    (filterStatus === '全部' || r.status === filterStatus) &&
    (filterType === '全部' || r.type === filterType)
  )

  const totals = {
    settled: settlementRecords.filter(r => r.status === '已结算').reduce((a, r) => a + parseFloat(r.amount.replace(/[$,]/g, '')), 0),
    pending: settlementRecords.filter(r => r.status === '处理中').reduce((a, r) => a + parseFloat(r.amount.replace(/[$,]/g, '')), 0),
    failed: settlementRecords.filter(r => r.status === '失败').reduce((a, r) => a + parseFloat(r.amount.replace(/[$,]/g, '')), 0),
  }

  const statusColor = (s: string) => {
    if (s === '已结算') return { bg: '#d1fae5', color: '#065f46' }
    if (s === '处理中') return { bg: '#fef3c7', color: '#92400e' }
    return { bg: '#ede9fe', color: '#c9264a' }
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {statuses.map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); addToast(`筛选: ${s}`, 'info') }} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem',
              border: '1px solid var(--border)',
              background: filterStatus === s ? 'var(--gradient-1)' : 'white',
              color: filterStatus === s ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: filterStatus === s ? 600 : 400,
            }}>{s}</button>
          ))}
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); addToast(`类型筛选: ${e.target.value}`, 'info') }}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'white' }}>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={() => { exportObjectsCsv('结算记录', settlementRecords.map(r => ({ 结算ID: r.id, 合作方: r.partner, 类型: r.type, 金额: r.amount, 币种: r.currency, 状态: r.status, 链上哈希: r.hash, 时间: r.time }))); addToast('结算数据CSV已导出', 'success') }} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
          borderRadius: 8, border: '1px solid var(--border)', background: 'white',
          color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
        }}>
          <Download size={14} /> 导出CSV
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>结算ID</th><th>IP/合作方</th><th>类型</th><th>金额</th>
              <th>币种</th><th>状态</th><th>区块链哈希</th><th>时间</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const sc = statusColor(r.status)
              return (
                <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setShowSettlementDetail(r)}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{r.id}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.partner}</td>
                  <td style={{ fontSize: '0.75rem' }}>{r.type}</td>
                  <td style={{ fontWeight: 700 }}>{r.amount}</td>
                  <td>
                    <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', background: 'rgba(232,54,93,0.08)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {r.currency}
                    </span>
                  </td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: sc.bg, color: sc.color }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: r.hash === '---' ? 'var(--text-muted)' : 'var(--accent-primary)' }}>{r.hash}</td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.time}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: '已结算总额', value: fmt(totals.settled), color: '#059669', icon: CheckCircle, action: '查看已结算明细' },
          { label: '处理中', value: fmt(totals.pending), color: '#d97706', icon: Clock, action: '催促结算' },
          { label: '失败待重试', value: fmt(totals.failed), color: '#e8365d', icon: AlertTriangle, action: '重试结算' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 0.15s' }}
            onClick={() => {
              if (s.label === '失败待重试') {
                setShowConfirmDialog({
                  title: '重试失败结算',
                  message: `确定要重试 ${fmt(totals.failed)} 的失败结算吗？`,
                  onConfirm: () => addToast('失败结算已重新提交', 'success'),
                })
              } else {
                addToast(s.action, 'info')
              }
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            <s.icon size={22} color={s.color} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab 4: Contract Management ───────────────────────────────────────────────
function ContractTab({ addToast, setShowConfirmDialog, setShowContractModal }: {
  addToast: (msg: string, type: Toast['type']) => void
  setShowConfirmDialog: (v: { title: string; message: string; onConfirm: () => void } | null) => void
  setShowContractModal: (v: typeof contracts[0] | null) => void
}) {
  const expiring = contracts.filter(c => c.daysLeft <= 60)

  const statusStyle = (s: string) => {
    if (s === '生效') return { bg: '#d1fae5', color: '#065f46', dot: '#059669' }
    if (s === '即将到期') return { bg: '#fef3c7', color: '#92400e', dot: '#d97706' }
    return { bg: '#ede9fe', color: '#c9264a', dot: '#e8365d' }
  }

  return (
    <div>
      {/* Expiring alert */}
      {expiring.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a',
          marginBottom: 20,
        }}>
          <AlertTriangle size={18} color="#d97706" />
          <div style={{ fontSize: '0.82rem', color: '#92400e' }}>
            <strong>{expiring.length} 份合同</strong>将在 60 天内到期（
            {expiring.map(c => `${c.partner} (${c.daysLeft}天)`).join('、')}），请尽快续签。
          </div>
          <button onClick={() => {
            setShowConfirmDialog({
              title: '批量续签合同',
              message: `确定要为 ${expiring.map(c => c.partner).join('、')} 启动续签流程吗？`,
              onConfirm: () => addToast('续签流程已启动，将通知相关合作方', 'success'),
            })
          }} style={{
            marginLeft: 'auto', padding: '5px 12px', borderRadius: 6, background: '#d97706',
            color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          }}>立即续签</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          共 {contracts.length} 份合同
        </span>
        <button onClick={() => addToast('新增合作方表单已打开', 'info')} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
          background: 'var(--gradient-1)', color: 'white', border: 'none',
          borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={14} /> 新增合作方
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {contracts.map((c, i) => {
          const ss = statusStyle(c.status)
          return (
            <div key={i} className="card" style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--gradient-1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.85rem',
                }}>{c.partner[0]}</div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem',
                  fontWeight: 600, background: ss.bg, color: ss.color, cursor: 'pointer',
                }} onClick={() => addToast(`${c.partner}: ${c.status} · 剩余 ${c.daysLeft} 天`, 'info')}>{c.status}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>{c.partner}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                {c.startDate} ~ {c.endDate}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: '8px', background: 'rgba(232,54,93,0.06)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => addToast(`${c.partner} 平台: ${c.ratio}`, 'info')}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>平台</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{c.ratio}</div>
                </div>
                <div style={{ padding: '8px', background: 'rgba(232,54,93,0.06)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => addToast(`${c.partner}: ${c.ips} 个IP`, 'info')}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>产品数量</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.ips}</div>
                </div>
              </div>
              {c.daysLeft <= 60 && (
                <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600, marginBottom: 8 }}>
                  WARN 剩余 {c.daysLeft} 天到期
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowContractModal(c)} style={{
                  flex: 1, padding: '6px 0', borderRadius: 6,
                  border: '1px solid var(--border)', background: 'white',
                  color: 'var(--text-secondary)', fontSize: '0.72rem', cursor: 'pointer',
                }}>查看详情</button>
                <button onClick={() => addToast(`${c.partner} 合同上传窗口已打开`, 'info')} style={{
                  flex: 1, padding: '6px 0', borderRadius: 6,
                  border: '1px solid rgba(232,54,93,0.3)', background: 'rgba(232,54,93,0.06)',
                  color: 'var(--accent-primary)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
                }}>上传合同</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Tab 5: Prediction Analysis ───────────────────────────────────────────────
function PredictionTab({ addToast }: { addToast: (msg: string, type: Toast['type']) => void }) {
  const [budgetBoost, setBudgetBoost] = useState('+20%')

  return (
    <div>
      {/* 3-month revenue prediction */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <TrendingUp size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>AI收益预测 · 未来3个月</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'rgba(232,54,93,0.08)', borderRadius: 4 }}>
            置信区间 P10-P90
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => addToast('预测模型已重新训练，数据已更新', 'success')} style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'white',
            cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
          }}><RefreshCw size={12} /> 重算</button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={tooltipStyle} formatter={((v: number, name: string) => [`$${(v / 1000).toFixed(0)}K`, name]) as any} />
            <Legend />
            <Bar dataKey="p10" name="悲观预测(P10)" fill="#ede9fe" radius={[4, 4, 0, 0]} />
            <Bar dataKey="p90" name="乐观预测(P90)" fill="#ffb3c6" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="p50" name="基准预测(P50)" stroke="#e8365d" strokeWidth={3} dot={{ fill: '#e8365d', r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        {/* Per-IP prediction */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>各IPGMV预测（下月）</div>
          {ipPrediction.map((ip, i) => (
            <div key={i} style={{ marginBottom: 12, cursor: 'pointer', padding: '4px 6px', borderRadius: 6, transition: 'background 0.15s' }}
              onClick={() => addToast(`${ip.name}: 预测 $${ip.predicted.toLocaleString()} (${ip.growth})，置信度 ${ip.confidence}%`, 'info')}
              onMouseEnter={e => (e.currentTarget.style.background = '#fff0f3')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ip.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>{ip.growth}</span>
                  <span style={{
                    padding: '1px 6px', borderRadius: 4, fontSize: '0.65rem',
                    background: ip.risk === '低' ? '#d1fae5' : ip.risk === '中' ? '#fef3c7' : '#ede9fe',
                    color: ip.risk === '低' ? '#065f46' : ip.risk === '中' ? '#92400e' : '#c9264a',
                    fontWeight: 600,
                  }}>风险:{ip.risk}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-bar-fill" style={{
                    width: `${ip.confidence}%`,
                    background: ip.confidence >= 80 ? 'var(--gradient-1)' : 'linear-gradient(90deg,#d97706,#f59e0b)',
                  }} />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>置信度 {ip.confidence}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>当前: <strong style={{ color: 'var(--text-primary)' }}>${ip.current.toLocaleString()}</strong></span>
                <span>预测: <strong style={{ color: 'var(--accent-primary)' }}>${ip.predicted.toLocaleString()}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* AI recommendation + scenario planning */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* AI recommendation */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: 6, borderRadius: 8, background: 'var(--gradient-1)' }}>
                <RefreshCw size={14} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>最优化分成策略建议</span>
            </div>
            {[
              { ip: '唇釉丝绒系列', current: 'ROI 4.2x', suggested: 'ROI 4.5x', reason: '种草转化持续超预期，建议加大投放预算' },
              { ip: '末世求生', current: '25%', suggested: '28%', reason: '动作类需求上升，抢占市场窗口期' },
              { ip: '青春无悔', current: '25%', suggested: '22%', reason: '校园题材竞争激烈，ROI偏低，建议降低' },
            ].map((r, i) => (
              <div key={i} style={{
                padding: '10px 12px', background: 'rgba(232,54,93,0.06)', borderRadius: 8,
                marginBottom: 8, borderLeft: '3px solid var(--accent-primary)', cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
                onClick={() => addToast(`已标记 ${r.ip} 分成策略建议: ${r.current} -> ${r.suggested}`, 'success')}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}>
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                  {r.ip}: {r.current} → <span style={{ color: 'var(--accent-primary)' }}>{r.suggested}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.reason}</div>
              </div>
            ))}
            <button onClick={() => addToast('所有分成建议已批量应用', 'success')} style={{
              width: '100%', padding: '8px 0', borderRadius: 8, border: 'none',
              background: '#e8365d', color: 'white', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
              marginTop: 4,
            }}>批量应用建议</button>
          </div>

          {/* Scenario planning */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 12 }}>预算情景规划</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>预算增加比例</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['+10%', '+20%', '+50%'].map(b => (
                  <button key={b} onClick={() => setBudgetBoost(b)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 6, fontSize: '0.8rem',
                    border: '1px solid var(--border)',
                    background: budgetBoost === b ? 'var(--gradient-1)' : 'white',
                    color: budgetBoost === b ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer', fontWeight: budgetBoost === b ? 700 : 400,
                  }}>{b}</button>
                ))}
              </div>
            </div>
            {scenarioBudget.filter(s => s.boost === budgetBoost).map(s => (
              <div key={s.boost}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <div style={{ padding: '10px', background: 'rgba(232,54,93,0.06)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => addToast(`预算${s.boost}: 预计收益增量 ${s.revIncrease}`, 'info')}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>预计收益增量</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{s.revIncrease}</div>
                  </div>
                  <div style={{ padding: '10px', background: 'rgba(232,54,93,0.06)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => addToast(`预算${s.boost}: 预测ROI ${s.roi}`, 'info')}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>预测ROI</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{s.roi}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '8px 12px', background: 'rgba(232,54,93,0.06)', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => addToast(`最大受益: ${s.topIP}`, 'info')}>
                  最大受益IP: <strong style={{ color: 'var(--accent-primary)' }}>{s.topIP}</strong>
                </div>
              </div>
            ))}
            <button onClick={() => addToast(`已提交预算${budgetBoost}方案到审批流程`, 'success')} style={{
              width: '100%', padding: '8px 0', borderRadius: 8, border: 'none',
              background: '#e8365d', color: 'white', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
              marginTop: 12,
            }}>提交方案审批</button>
          </div>
        </div>
      </div>

      {/* Risk analysis */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Shield size={16} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>IP市场饱和度 & 风险评估</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {ipPrediction.map(ip => (
            <div key={ip.name} style={{
              padding: '12px', borderRadius: 10, border: '1px solid var(--border)',
              background: ip.risk === '高' ? '#fff7ed' : ip.risk === '中' ? '#fffbeb' : 'rgba(232,54,93,0.06)',
              cursor: 'pointer', transition: 'transform 0.15s',
            }}
              onClick={() => addToast(`${ip.name}: 风险${ip.risk} · 饱和度${100 - ip.confidence}% · 置信度${ip.confidence}%`, 'info')}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 6 }}>{ip.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>市场饱和度</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: ip.confidence > 80 ? '#059669' : ip.confidence > 70 ? '#d97706' : '#e8365d' }}>
                  {100 - ip.confidence}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{
                  width: `${100 - ip.confidence}%`,
                  background: ip.confidence > 80 ? '#a7f3d0' : ip.confidence > 70 ? '#fde68a' : '#ffb3c6',
                }} />
              </div>
              <div style={{
                marginTop: 8, fontSize: '0.68rem', fontWeight: 700,
                color: ip.risk === '低' ? '#065f46' : ip.risk === '中' ? '#92400e' : '#c9264a',
              }}>
                风险等级: {ip.risk}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
type TabId = 'overview' | 'ip' | 'settlement' | 'contracts' | 'prediction'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',    label: '收益总览' },
  { id: 'ip',         label: '产品线明细' },
  { id: 'settlement', label: '结算记录' },
  { id: 'contracts',  label: '合同管理' },
  { id: 'prediction', label: '预测分析' },
]

// ── AI配置: 版权收益 ──
const revenueAIConfigGroups: AIConfigGroup[] = [
  {
    title: '收益预测模型',
    icon: <Brain size={16} />,
    params: [
      createParam('revenueForecastWindow', '收益预测窗口', 30, '天', 'AI收益预测的时间跨度', 30, 86, { min: 1, max: 90 }),
      createParam('splitOptimizationFrequency', 'GMV比例优化频率', 7, '天', 'AI重新评估GMV比例的周期', 7, 83, { min: 1, max: 30 }),
      createParam('arpuConfidenceThreshold', 'ARPU预测置信度门槛', 80, '%', '低于此置信度的ARPU预测标记为待验证', 80, 88, { min: 0, max: 100 }),
    ],
  },
  {
    title: '版权方结算',
    icon: <Shield size={16} />,
    params: [
      createParam('settlementCycleOptimization', '结算周期优化', '双周结', '', 'AI根据现金流和版权方偏好推荐最优结算周期', '双周结', 85, { type: 'select', options: ['周结', '双周结', '月结'] }),
      createParam('anomalyRevenueDetection', '异常收益检测灵敏度', 6, '', '1-10档，越高越容易触发异常收益告警', 6, 87, { min: 1, max: 10 }),
      createParam('minSettlementAmount', '最低结算金额', 100, '$', '低于此金额的收益累积到下期结算', 100, 90, { min: 10, max: 1000, step: 10 }),
    ],
  },
]

const revenueAILearningStatus: AILearningStatus = {
  modelVersion: 'v1.8.0-revenue',
  lastTraining: '1.5小时前',
  totalDataPoints: 124000,
  avgConfidence: 84,
  autoAdjustCount24h: 12,
  learningRate: '0.006',
  nextTraining: '3小时后',
  improvementRate: '+6.3%',
}

export default function RevenuePortal() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [totalShare, setTotalShare] = useState(1240000)
  const [pendingShare, setPendingShare] = useState(234000)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showKpiModal, setShowKpiModal] = useState<string | null>(null)
  useRegisterAIConfig(revenueAIConfigGroups, revenueAILearningStatus, '版权收益')
  const [showIPModal, setShowIPModal] = useState<number | null>(null)
  const [showSettlementDetail, setShowSettlementDetail] = useState<typeof settlementRecords[0] | null>(null)
  const [showContractModal, setShowContractModal] = useState<typeof contracts[0] | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null)
  const [ipModalTab, setIpModalTab] = useState<'overview' | 'trend' | 'settings'>('overview')

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTotalShare(v => v + Math.floor(Math.random() * 150 + 20))
      setPendingShare(v => Math.max(0, v - Math.floor(Math.random() * 80)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const toastBg = (type: Toast['type']) => {
    if (type === 'success') return '#059669'
    if (type === 'info') return '#e8365d'
    if (type === 'warning') return '#d97706'
    return '#dc2626'
  }

  return (
    <div>
      {/* Toast Notifications */}
      <div style={toastContainerStyle}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 20px', borderRadius: 10, color: 'white', fontWeight: 600,
            fontSize: '0.85rem', background: toastBg(t.type), boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {t.type === 'success' && <Check size={16} />}
            {t.type === 'info' && <Info size={16} />}
            {t.type === 'warning' && <AlertTriangle size={16} />}
            {t.message}
          </div>
        ))}
      </div>

      {/* KPI Detail Modal */}
      {showKpiModal && (
        <div style={overlayStyle} onClick={() => setShowKpiModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#e8365d', fontSize: '1.1rem' }}>
                {showKpiModal === 'total' ? '本月GMV趋势' :
                 showKpiModal === 'pending' ? '待结算队列详情' :
                 showKpiModal === 'partners' ? '合作方明细' : '产品线GMV排行'}
              </h3>
              <button onClick={() => setShowKpiModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyTrend.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [`$${(v / 1000).toFixed(0)}K`, '']) as any} />
                <Area type="monotone" dataKey="GMV" stroke="#e8365d" fill="#e8365d" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff0f3', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {showKpiModal === 'total' && '本月GMV持续增长，3月达到历史峰值¥2156万。'}
              {showKpiModal === 'pending' && '当前4笔结算处理中，预计24小时内完成。'}
              {showKpiModal === 'partners' && '28家合作方中，6家即将到期需续签。'}
              {showKpiModal === 'topip' && '唇釉丝绒系列连续3个月蝉联GMV冠军。'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => { addToast('报告已导出', 'success'); setShowKpiModal(null) }} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', gap: 6,
              }}><Download size={14} /> 导出</button>
              <button onClick={() => setShowKpiModal(null)} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', background: '#e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
              }}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* IP Detail Modal */}
      {showIPModal !== null && (
        <div style={overlayStyle} onClick={() => setShowIPModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#e8365d' }}>{ipDetail[showIPModal].name} 详情</h3>
              <button onClick={() => setShowIPModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <div className="tabs" style={{ marginBottom: 16 }}>
              {([['overview', '概览'], ['trend', '趋势'], ['settings', '设置']] as const).map(([k, l]) => (
                <button key={k} className={`tab ${ipModalTab === k ? 'active' : ''}`}
                  onClick={() => setIpModalTab(k)}>{l}</button>
              ))}
            </div>
            {ipModalTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: '本月消耗', value: ipDetail[showIPModal].monthSpend },
                    { label: '本月GMV', value: ipDetail[showIPModal].monthShare },
                    { label: '平台', value: ipDetail[showIPModal].ratio },
                    { label: 'ROI', value: `${ipDetail[showIPModal].roi}x` },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '8px', background: '#fff0f3', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#e8365d' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <p>类型: {ipDetail[showIPModal].type} · 改编数: {ipDetail[showIPModal].adaptations}部</p>
                  <p>状态: {ipDetail[showIPModal].status} · 素材总数: {ipDetail[showIPModal].adaptations * 12}套</p>
                </div>
              </div>
            )}
            {ipModalTab === 'trend' && (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={ip7DayTrend[showIPModal]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={((v: number) => [`$${v.toLocaleString()}`, 'GMV']) as any} />
                  <Area type="monotone" dataKey="revenue" stroke="#e8365d" fill="#e8365d" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
            {ipModalTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => { addToast(`已调整 ${ipDetail[showIPModal].name} 平台`, 'success'); setShowIPModal(null) }} style={{
                  padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: 'white',
                  cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
                }}><Edit size={16} color="#e8365d" /> 调整平台</button>
                <button onClick={() => { addToast(`${ipDetail[showIPModal].name} 投放已暂停`, 'warning'); setShowIPModal(null) }} style={{
                  padding: '12px', borderRadius: 8, border: '1px solid var(--border)', background: 'white',
                  cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
                }}><Pause size={16} color="#d97706" /> 暂停投放</button>
                <button onClick={() => {
                  setShowConfirmDialog({
                    title: '终止IP合作',
                    message: `确定要终止与 ${ipDetail[showIPModal].name} 的合作吗？此操作不可撤销。`,
                    onConfirm: () => { addToast('合作终止已提交审批', 'warning'); setShowIPModal(null) },
                  })
                }} style={{
                  padding: '12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff1f2',
                  cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626',
                }}><Trash2 size={16} /> 终止合作</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settlement Detail Modal */}
      {showSettlementDetail && (
        <div style={overlayStyle} onClick={() => setShowSettlementDetail(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#e8365d' }}>结算详情 {showSettlementDetail.id}</h3>
              <button onClick={() => setShowSettlementDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'IP/合作方', value: showSettlementDetail.partner },
                { label: '类型', value: showSettlementDetail.type },
                { label: '金额', value: showSettlementDetail.amount },
                { label: '状态', value: showSettlementDetail.status },
                { label: '币种', value: showSettlementDetail.currency },
                { label: '时间', value: showSettlementDetail.time },
              ].map(m => (
                <div key={m.label} style={{ padding: '10px 12px', background: '#fff0f3', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{m.value}</div>
                </div>
              ))}
            </div>
            {showSettlementDetail.hash !== '---' && (
              <div style={{ padding: '10px 12px', background: '#fff0f3', borderRadius: 8, marginBottom: 16 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>区块链哈希</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#e8365d', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {showSettlementDetail.hash}
                  <button onClick={() => addToast('哈希已复制', 'success')} style={{
                    padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(232,54,93,0.3)',
                    background: 'white', cursor: 'pointer', fontSize: '0.68rem', color: '#e8365d',
                  }}><Copy size={10} /></button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {showSettlementDetail.status === '失败' && (
                <button onClick={() => {
                  addToast(`${showSettlementDetail.id} 已重新提交`, 'success')
                  setShowSettlementDetail(null)
                }} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#d97706', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
                }}>重试结算</button>
              )}
              <button onClick={() => { addToast('结算凭证已下载', 'success'); setShowSettlementDetail(null) }} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white',
                cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6,
              }}><FileText size={14} /> 下载凭证</button>
              <button onClick={() => setShowSettlementDetail(null)} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', background: '#e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
              }}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Detail Modal */}
      {showContractModal && (
        <div style={overlayStyle} onClick={() => setShowContractModal(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#e8365d' }}>{showContractModal.partner} 合同详情</h3>
              <button onClick={() => setShowContractModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: '产品数量', value: `${showContractModal.ips}` },
                { label: '平台', value: showContractModal.ratio },
                { label: '剩余天数', value: `${showContractModal.daysLeft}天` },
              ].map(m => (
                <div key={m.label} style={{ padding: '12px', background: '#fff0f3', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e8365d' }}>{m.value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              <p>合同期限: {showContractModal.startDate} ~ {showContractModal.endDate}</p>
              <p>状态: {showContractModal.status}</p>
              <p>合作方: {showContractModal.partner}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => { addToast(`${showContractModal.partner} 合同已下载`, 'success'); setShowContractModal(null) }} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white',
                cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6,
              }}><Download size={14} /> 下载合同</button>
              {showContractModal.daysLeft <= 60 && (
                <button onClick={() => {
                  addToast(`${showContractModal.partner} 续签流程已启动`, 'success')
                  setShowContractModal(null)
                }} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#d97706', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
                }}>发起续签</button>
              )}
              <button onClick={() => setShowContractModal(null)} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', background: '#e8365d', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
              }}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div style={overlayStyle} onClick={() => setShowConfirmDialog(null)}>
          <div style={{ ...modalStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={22} color="#d97706" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>{showConfirmDialog.title}</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>{showConfirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowConfirmDialog(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '0.82rem' }}>取消</button>
              <button onClick={() => { showConfirmDialog.onConfirm(); setShowConfirmDialog(null) }} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
              }}>确认</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DollarSign size={24} color="var(--accent-primary)" />
          GMV收益中心
        </h2>
        <p>产品线GMV智能体 · 实时收益追踪 · T+0结算 · 多产品多维度分析</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="BudgetMO-Optimizer" color="#e8365d" />
        <ModelBadge name="MultiCurrency-ROAS" color="#e8365d" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
      </div>

      <div className="page-content">
        {/* KPI Cards - All Clickable */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <KpiCard
            title="本月总GMV"
            value={`¥${(totalShare / 10000).toFixed(0)}万`}
            sub="实时更新 · 智能合约结算"
            icon={DollarSign}
            accent="linear-gradient(135deg, #e8365d, #ff7a95)"
            onClick={() => setShowKpiModal('total')}
          />
          <KpiCard
            title="待结算"
            value={`¥${(pendingShare / 10000).toFixed(0)}万`}
            sub="处理中 · T+0结算队列"
            icon={Clock}
            accent="linear-gradient(135deg, #d97706, #f59e0b)"
            onClick={() => setShowKpiModal('pending')}
          />
          <KpiCard
            title="合作渠道数"
            value="28家"
            sub="活跃产品线"
            icon={BookOpen}
            accent="linear-gradient(135deg, #e8365d, #ff7a95)"
            onClick={() => setShowKpiModal('partners')}
          />
          <KpiCard
            title="产品线GMV TOP1"
            value="¥3,120万"
            sub="唇釉丝绒系列 · 本月冠军"
            icon={BarChart3}
            accent="linear-gradient(135deg, #c9264a, #e8365d)"
            onClick={() => setShowKpiModal('topip')}
          />
        </div>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview'    && <RevenueOverviewTab addToast={addToast} />}
        {activeTab === 'ip'         && <IPDetailTab addToast={addToast} setShowIPModal={setShowIPModal} />}
        {activeTab === 'settlement' && <SettlementTab addToast={addToast} setShowSettlementDetail={setShowSettlementDetail} setShowConfirmDialog={setShowConfirmDialog} />}
        {activeTab === 'contracts'  && <ContractTab addToast={addToast} setShowConfirmDialog={setShowConfirmDialog} setShowContractModal={setShowContractModal} />}
        {activeTab === 'prediction' && <PredictionTab addToast={addToast} />}
      </div>
    </div>
  )
}
