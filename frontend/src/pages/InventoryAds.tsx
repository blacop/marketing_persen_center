import { useState } from 'react'
import {
  Package, AlertTriangle, Zap, TrendingDown, Brain, Shield,
  Settings, FileText, BarChart3, Play, Pause, Eye, RefreshCw,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle,
  Filter, ChevronRight
} from 'lucide-react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   库存联动投放 —— 库存水位与广告投放自动联动
   低库存自动降投/停投, 充足库存自动加投
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['库存总览', '联动规则', '执行日志', '效果分析']

// ── Tab 1: 库存总览 ──

const inventoryData = [
  { sku: 'LP-105', name: '唇釉丝绒#105', line: '唇釉系列', stock: 8420, dailySales: 280, days: 30, status: '正常投放' },
  { sku: 'LP-208', name: '唇釉水光#208', line: '唇釉系列', stock: 1200, dailySales: 350, days: 3, status: '已降投' },
  { sku: 'FD-301', name: '轻透粉底液#自然色', line: '底妆系列', stock: 5680, dailySales: 180, days: 32, status: '正常投放' },
  { sku: 'FD-302', name: '轻透粉底液#象牙白', line: '底妆系列', stock: 420, dailySales: 200, days: 2, status: '已停投' },
  { sku: 'SK-001', name: '玻尿酸精华液', line: '护肤系列', stock: 12800, dailySales: 150, days: 85, status: '加速投放' },
  { sku: 'SK-002', name: '烟酰胺面膜10片装', line: '护肤系列', stock: 3200, dailySales: 420, days: 8, status: '降投预警' },
  { sku: 'EY-101', name: '十色眼影盘#日落盘', line: '眼妆系列', stock: 6500, dailySales: 95, days: 68, status: '正常投放' },
  { sku: 'EY-102', name: '极细眼线液笔', line: '眼妆系列', stock: 890, dailySales: 180, days: 5, status: '已降投' },
  { sku: 'CL-001', name: '卸妆水500ml', line: '清洁系列', stock: 15600, dailySales: 200, days: 78, status: '加速投放' },
  { sku: 'LP-310', name: '唇釉哑光#310', line: '唇釉系列', stock: 0, dailySales: 260, days: 0, status: '已停投' },
]

// ── Tab 2: 联动规则 ──

const rules = [
  {
    name: '断货保护', priority: 'P1', enabled: true,
    condition: '可售天数 < 3天',
    action: '停止所有平台投放',
    triggerCount: 15, lastTrigger: '今日 14:30',
  },
  {
    name: '低库存降投', priority: 'P1', enabled: true,
    condition: '可售天数 < 7天',
    action: '降低投放预算50%',
    triggerCount: 38, lastTrigger: '今日 15:12',
  },
  {
    name: '库存预警通知', priority: 'P2', enabled: true,
    condition: '可售天数 < 14天',
    action: '发送预警通知 + 降低投放20%',
    triggerCount: 52, lastTrigger: '今日 13:45',
  },
  {
    name: '爆品加投', priority: 'P2', enabled: true,
    condition: '可售天数 > 30天 且 转化率 > 5%',
    action: '提升投放预算30%',
    triggerCount: 28, lastTrigger: '今日 10:20',
  },
  {
    name: '新品推广', priority: 'P3', enabled: true,
    condition: '新品上架7天内',
    action: '自动开启测试投放',
    triggerCount: 8, lastTrigger: '昨日 09:00',
  },
  {
    name: '尾货清仓', priority: 'P3', enabled: false,
    condition: '库存 > 60天无动销',
    action: '启动清仓投放',
    triggerCount: 3, lastTrigger: '3天前',
  },
]

// ── Tab 3: 执行日志 ──

const executionLogs = [
  { time: '15:12', sku: 'LP-208', name: '唇釉水光#208', rule: '低库存降投', action: '降低投放', adjust: '-50%', platform: '抖音/小红书', status: '已执行' },
  { time: '14:30', sku: 'FD-302', name: '轻透粉底液#象牙白', rule: '断货保护', action: '停止投放', adjust: '-100%', platform: '全平台', status: '已执行' },
  { time: '14:15', sku: 'SK-002', name: '烟酰胺面膜10片装', rule: '库存预警通知', action: '降低投放', adjust: '-20%', platform: '快手/抖音', status: '已执行' },
  { time: '13:45', sku: 'EY-102', name: '极细眼线液笔', rule: '低库存降投', action: '降低投放', adjust: '-50%', platform: '小红书/天猫', status: '已执行' },
  { time: '12:00', sku: 'LP-310', name: '唇釉哑光#310', rule: '断货保护', action: '停止投放', adjust: '-100%', platform: '全平台', status: '已执行' },
  { time: '10:20', sku: 'SK-001', name: '玻尿酸精华液', rule: '爆品加投', action: '提升投放', adjust: '+30%', platform: '抖音/小红书', status: '已执行' },
  { time: '10:15', sku: 'CL-001', name: '卸妆水500ml', rule: '爆品加投', action: '提升投放', adjust: '+30%', platform: '快手/天猫', status: '已执行' },
  { time: '09:30', sku: 'LP-105', name: '唇釉丝绒#105', rule: '库存预警通知', action: '恢复投放', adjust: '恢复100%', platform: '全平台', status: '已执行' },
  { time: '09:00', sku: 'FD-301', name: '轻透粉底液#自然色', rule: '爆品加投', action: '提升投放', adjust: '+30%', platform: '抖音', status: '已执行' },
  { time: '08:30', sku: 'EY-101', name: '十色眼影盘#日落盘', rule: '库存预警通知', action: '恢复投放', adjust: '恢复100%', platform: '全平台', status: '已执行' },
]

// ── Tab 4: 效果分析 ──

const effectTrendData = [
  { day: '3/7', 节省预算: 0.8, 避免超卖: 2 },
  { day: '3/8', 节省预算: 1.2, 避免超卖: 5 },
  { day: '3/9', 节省预算: 0.6, 避免超卖: 1 },
  { day: '3/10', 节省预算: 1.5, 避免超卖: 4 },
  { day: '3/11', 节省预算: 2.1, 避免超卖: 6 },
  { day: '3/12', 节省预算: 1.8, 避免超卖: 3 },
  { day: '3/13', 节省预算: 0.9, 避免超卖: 2 },
  { day: '3/14', 节省预算: 1.3, 避免超卖: 5 },
  { day: '3/15', 节省预算: 2.5, 避免超卖: 7 },
  { day: '3/16', 节省预算: 1.6, 避免超卖: 4 },
  { day: '3/17', 节省预算: 1.1, 避免超卖: 3 },
  { day: '3/18', 节省预算: 2.0, 避免超卖: 6 },
  { day: '3/19', 节省预算: 1.4, 避免超卖: 4 },
  { day: '3/20', 节省预算: 1.7, 避免超卖: 5 },
  { day: '3/21', 节省预算: 2.3, 避免超卖: 8 },
  { day: '3/22', 节省预算: 1.9, 避免超卖: 3 },
  { day: '3/23', 节省预算: 1.0, 避免超卖: 2 },
  { day: '3/24', 节省预算: 2.2, 避免超卖: 5 },
  { day: '3/25', 节省预算: 1.5, 避免超卖: 4 },
  { day: '3/26', 节省预算: 1.8, 避免超卖: 6 },
  { day: '3/27', 节省预算: 2.6, 避免超卖: 7 },
  { day: '3/28', 节省预算: 1.3, 避免超卖: 3 },
  { day: '3/29', 节省预算: 0.7, 避免超卖: 2 },
  { day: '3/30', 节省预算: 1.9, 避免超卖: 5 },
  { day: '3/31', 节省预算: 2.4, 避免超卖: 6 },
  { day: '4/1', 节省预算: 1.6, 避免超卖: 4 },
  { day: '4/2', 节省预算: 2.1, 避免超卖: 8 },
  { day: '4/3', 节省预算: 1.8, 避免超卖: 5 },
  { day: '4/4', 节省预算: 2.0, 避免超卖: 6 },
  { day: '4/5', 节省预算: 1.2, 避免超卖: 3 },
]

const actionDistribution = [
  { name: '停投', value: 15, color: '#ef4444' },
  { name: '降投', value: 35, color: '#f59e0b' },
  { name: '加投', value: 30, color: '#22c55e' },
  { name: '恢复', value: 20, color: '#8b5cf6' },
]

// ── AI Config ──

const inventoryAIConfigGroups: AIConfigGroup[] = [
  {
    title: '库存安全策略',
    icon: <Shield size={15} />,
    params: [
      createParam('safety_days', '安全库存天数', 7, '天', '低于此天数的SKU触发降投保护', 7, 92, {
        min: 3, max: 30, step: 1, learningDataPoints: 85000,
        adjustHistory: [
          { time: '昨日', from: '10', to: '7', reason: 'AI根据补货周期数据缩短安全阈值' },
          { time: '3天前', from: '7', to: '10', reason: '大促期间AI提升安全库存阈值' },
        ],
      }),
      createParam('restock_predict', '补货预测窗口', 14, '天', '预测未来补货到达的时间窗口, 用于判断是否需要提前降投', 14, 88, {
        min: 7, max: 60, step: 1, learningDataPoints: 62000,
      }),
      createParam('emergency_threshold', '紧急停投阈值', 3, '天', '可售天数低于此值立即停止所有投放', 3, 95, {
        min: 1, max: 7, step: 1, learningDataPoints: 45000,
      }),
      createParam('seasonal_factor', '季节性系数', 1.2, 'x', '根据季节调整库存消耗预测, >1表示当前季节销量高于均值', 1.3, 85, {
        min: 0.5, max: 3.0, step: 0.1, learningDataPoints: 120000,
        adjustHistory: [
          { time: '1周前', from: '1.0', to: '1.2', reason: 'AI检测到春季美妆销售旺季, 提升系数' },
        ],
      }),
    ],
  },
  {
    title: '投放弹性配置',
    icon: <Zap size={15} />,
    params: [
      createParam('reduce_ratio', '降投幅度', 50, '%', '触发降投规则时默认降低的预算比例', 50, 90, {
        min: 20, max: 80, step: 5, learningDataPoints: 78000,
      }),
      createParam('boost_ratio', '加投幅度', 30, '%', '库存充足且转化率高时提升的预算比例', 30, 87, {
        min: 10, max: 100, step: 5, learningDataPoints: 55000,
      }),
      createParam('response_speed', '响应速度', '实时', '', '库存变化后触发投放调整的响应延迟', '实时', 93, {
        type: 'select',
        options: ['实时', '5分钟', '15分钟', '1小时'],
        learningDataPoints: 32000,
      }),
      createParam('platform_priority', '降投平台优先级', 'ROI最低优先', '', '需要降投时优先降低哪个平台的投放', 'ROI最低优先', 86, {
        type: 'select',
        options: ['ROI最低优先', '花费最高优先', '均匀降低'],
        learningDataPoints: 41000,
      }),
    ],
  },
]

const inventoryAILearningStatus: AILearningStatus = {
  modelVersion: 'v1.5.0-inventory',
  lastTraining: '15分钟前',
  totalDataPoints: 450000,
  avgConfidence: 90,
  autoAdjustCount24h: 68,
  learningRate: '0.005',
  nextTraining: '45分钟后',
  improvementRate: '+8.6%',
}

// ── Helpers ──

function daysColor(days: number): string {
  if (days < 7) return '#ef4444'
  if (days < 14) return '#f59e0b'
  return '#22c55e'
}

function daysBg(days: number): string {
  if (days < 7) return 'rgba(239,68,68,0.1)'
  if (days < 14) return 'rgba(245,158,11,0.1)'
  return 'rgba(34,197,94,0.1)'
}

function statusColor(status: string): string {
  switch (status) {
    case '正常投放': return '#3b82f6'
    case '加速投放': return '#22c55e'
    case '降投预警': return '#f59e0b'
    case '已降投': return '#f97316'
    case '已停投': return '#ef4444'
    default: return 'var(--text-muted)'
  }
}

function statusBg(status: string): string {
  switch (status) {
    case '正常投放': return 'rgba(59,130,246,0.1)'
    case '加速投放': return 'rgba(34,197,94,0.1)'
    case '降投预警': return 'rgba(245,158,11,0.1)'
    case '已降投': return 'rgba(249,115,22,0.1)'
    case '已停投': return 'rgba(239,68,68,0.1)'
    default: return 'transparent'
  }
}

function priorityColor(p: string): string {
  if (p === 'P1') return '#ef4444'
  if (p === 'P2') return '#f59e0b'
  return '#8b5cf6'
}

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.7rem',
  color: 'var(--text-primary)',
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function InventoryAds() {
  const [activeTab, setActiveTab] = useState(0)
  const [logFilter, setLogFilter] = useState('全部')
  const [toast, setToast] = useState<string | null>(null)
  const [selectedSku, setSelectedSku] = useState<string | null>(null)
  useRegisterAIConfig(inventoryAIConfigGroups, inventoryAILearningStatus, '库存联动')

  const showToast = (msg: string, duration = 2500) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }

  const filteredLogs = logFilter === '全部'
    ? executionLogs
    : executionLogs.filter(l => {
        if (logFilter === '停投') return l.action === '停止投放'
        if (logFilter === '降投') return l.action === '降低投放'
        if (logFilter === '加投') return l.action === '提升投放'
        if (logFilter === '恢复') return l.action === '恢复投放'
        return true
      })

  return (
    <>
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Package size={22} color="#e8365d" />
          库存联动投放
        </h2>
        <p>库存水位 × 广告投放自动联动 · 低库存自动降投/停投 · 充足库存智能加投</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e8365d', background: 'rgba(232,54,93,0.08)', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, marginTop: 8 }}>
          <Brain size={14} />
          <span>库存联动模型置信度 90% · 今日自动调量68次 · 节省预算¥12.8万</span>
        </div>
      </div>

      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="InventoryAware-Bidder" color="#e8365d" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
          <ModelBadge name="CVR-Predictor-ESMM" color="#e8365d" />
          <ModelBadge name="TrafficPacing-RL" color="#e8365d" />
          <ModelBadge name="AnomalyDetector-LSTM" color="#f59e0b" />
        </div>

        {/* KPI Cards */}
        <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: '监控SKU数', value: '486个', icon: <Eye size={18} />, color: '#e8365d', sub: '覆盖全品类' },
            { label: '库存预警', value: '23个', icon: <AlertTriangle size={18} />, color: '#f59e0b', sub: '较昨日+3' },
            { label: '今日自动调量', value: '68次', icon: <Zap size={18} />, color: '#8b5cf6', sub: '停投12 · 降投28 · 加投18 · 恢复10' },
            { label: '节省预算', value: '¥12.8万', icon: <TrendingDown size={18} />, color: '#22c55e', sub: '避免超卖损失' },
          ].map(card => (
            <div key={card.label} className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{card.label}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >{tab}</button>
          ))}
        </div>

        {/* ══════════════ Tab 1: 库存总览 ══════════════ */}
        {activeTab === 0 && (
          <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={16} color="#e8365d" />
              SKU库存与投放状态
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['SKU编号', '商品名称', '产品线', '当前库存', '日均销量', '可售天数', '投放状态', '操作'].map(h => (
                      <th key={h} style={{ padding: '12px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map(row => (
                    <tr key={row.sku} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#e8365d', fontFamily: 'monospace' }}>{row.sku}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{row.line}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.stock.toLocaleString()}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{row.dailySales}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                          fontWeight: 700, fontSize: '0.75rem',
                          color: daysColor(row.days), background: daysBg(row.days),
                        }}>
                          {row.days}天
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 6,
                          fontWeight: 600, fontSize: '0.72rem',
                          color: statusColor(row.status), background: statusBg(row.status),
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            style={{
                              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-light)',
                              background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.7rem',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            }}
                            onClick={() => showToast(`${row.name} 联动规则: ${row.status === '已停投' ? '断货保护(可售<3天停投)' : row.status === '已降投' ? '低库存降投(可售<7天降50%)' : row.status === '加速投放' ? '爆品加投(库存充足+高转化)' : '库存预警通知(可售<14天降20%)'}`)}
                          >
                            <Settings size={12} /> 规则
                          </button>
                          <button
                            style={{
                              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-light)',
                              background: selectedSku === row.sku ? 'rgba(232,54,93,0.08)' : 'var(--bg-primary)',
                              color: selectedSku === row.sku ? '#e8365d' : 'var(--text-secondary)', fontSize: '0.7rem',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            }}
                            onClick={() => { setSelectedSku(prev => prev === row.sku ? null : row.sku); showToast(`${row.name} · 库存${row.stock.toLocaleString()}件 · 日均销量${row.dailySales}件 · 可售${row.days}天`) }}
                          >
                            <BarChart3 size={12} /> 详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>可售天数:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#ef4444', display: 'inline-block' }} /> &lt;7天(紧急)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#f59e0b', display: 'inline-block' }} /> &lt;14天(预警)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#22c55e', display: 'inline-block' }} /> &ge;14天(充足)
              </span>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 2: 联动规则 ══════════════ */}
        {activeTab === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
            {rules.map((rule, i) => (
              <div key={i} className="data-card" style={{
                background: 'var(--bg-card)', borderRadius: 14, padding: 20,
                border: `1px solid ${rule.enabled ? 'var(--border-light)' : 'var(--border)'}`,
                opacity: rule.enabled ? 1 : 0.65,
                position: 'relative',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontWeight: 800, fontSize: '0.7rem',
                      color: '#fff', background: priorityColor(rule.priority),
                    }}>
                      {rule.priority}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rule.name}</span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                    color: rule.enabled ? '#22c55e' : 'var(--text-muted)',
                    background: rule.enabled ? 'rgba(34,197,94,0.1)' : 'var(--bg-primary)',
                  }}>
                    {rule.enabled ? <Play size={11} /> : <Pause size={11} />}
                    {rule.enabled ? '启用' : '停用'}
                  </div>
                </div>

                {/* Condition */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Filter size={11} /> 触发条件
                  </div>
                  <div style={{
                    padding: '8px 12px', borderRadius: 8, background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)', fontSize: '0.78rem', fontWeight: 600,
                    color: 'var(--text-primary)', fontFamily: 'monospace',
                  }}>
                    {rule.condition}
                  </div>
                </div>

                {/* Action */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Zap size={11} /> 执行动作
                  </div>
                  <div style={{
                    padding: '8px 12px', borderRadius: 8, background: 'rgba(232,54,93,0.05)',
                    border: '1px solid rgba(232,54,93,0.12)', fontSize: '0.78rem', fontWeight: 600,
                    color: '#e8365d',
                  }}>
                    <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {rule.action}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>已触发: <strong style={{ color: 'var(--text-primary)' }}>{rule.triggerCount}次</strong></span>
                  <span>最近: <strong style={{ color: 'var(--text-secondary)' }}>{rule.lastTrigger}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════════ Tab 3: 执行日志 ══════════════ */}
        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Clock size={14} /> 今日
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['全部', '停投', '降投', '加投', '恢复'].map(f => (
                  <button key={f} onClick={() => setLogFilter(f)} style={{
                    padding: '5px 14px', borderRadius: 8, border: '1px solid var(--border-light)',
                    background: logFilter === f ? '#e8365d' : 'var(--bg-card)',
                    color: logFilter === f ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Table */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="#e8365d" />
                执行日志
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['时间', 'SKU', '商品名', '触发规则', '执行动作', '调整幅度', '影响平台', '状态'].map(h => (
                        <th key={h} style={{ padding: '10px 8px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{log.time}</td>
                        <td style={{ padding: '10px 8px', color: '#e8365d', fontWeight: 600, fontFamily: 'monospace' }}>{log.sku}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-primary)', fontWeight: 600 }}>{log.name}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{log.rule}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '2px 8px', borderRadius: 5, fontSize: '0.72rem', fontWeight: 600,
                            color: log.action === '停止投放' ? '#ef4444' : log.action === '降低投放' ? '#f59e0b' : log.action === '提升投放' ? '#22c55e' : '#8b5cf6',
                            background: log.action === '停止投放' ? 'rgba(239,68,68,0.1)' : log.action === '降低投放' ? 'rgba(245,158,11,0.1)' : log.action === '提升投放' ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
                          }}>
                            {log.action === '停止投放' ? <XCircle size={11} /> : log.action === '提升投放' ? <ArrowUpRight size={11} /> : log.action === '降低投放' ? <ArrowDownRight size={11} /> : <RefreshCw size={11} />}
                            {log.action}
                          </span>
                        </td>
                        <td style={{
                          padding: '10px 8px', fontWeight: 700, fontFamily: 'monospace',
                          color: log.adjust.startsWith('+') ? '#22c55e' : log.adjust.startsWith('-') ? '#ef4444' : '#8b5cf6',
                        }}>
                          {log.adjust}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{log.platform}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            color: '#22c55e', fontSize: '0.72rem', fontWeight: 600,
                          }}>
                            <CheckCircle size={12} /> {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 4: 效果分析 ══════════════ */}
        {activeTab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Composed Chart */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="#e8365d" />
                库存联动效果 (30天)
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={effectTrendData}>
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} unit="万" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} unit="次" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="节省预算" fill="#e8365d" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Line yAxisId="right" type="monotone" dataKey="避免超卖" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: '本月节省预算', value: '¥45.6万', color: '#e8365d', icon: <TrendingDown size={16} /> },
                { label: '避免超卖', value: '128次', color: '#8b5cf6', icon: <Shield size={16} /> },
                { label: '平均响应时间', value: '2.3分钟', color: '#22c55e', icon: <Clock size={16} /> },
                { label: '库存周转提升', value: '+15.2%', color: '#f59e0b', icon: <ArrowUpRight size={16} /> },
              ].map(s => (
                <div key={s.label} className="data-card" style={{
                  background: 'var(--bg-card)', borderRadius: 12, padding: 20,
                  border: '1px solid var(--border-light)', textAlign: 'center',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, margin: '0 auto 10px' }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pie Chart: 调整动作分布 */}
            <div className="data-card" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="#e8365d" />
                调整动作分布
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                <ResponsiveContainer width="50%" height={260}>
                  <PieChart>
                    <Pie
                      data={actionDistribution}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={3} dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {actionDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {actionDistribution.map(a => (
                    <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: a.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: a.color }}>{a.value}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                          <div style={{ width: `${a.value}%`, height: '100%', borderRadius: 3, background: a.color, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{
                    marginTop: 8, padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(232,54,93,0.06)', border: '1px solid rgba(232,54,93,0.12)',
                    fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                  }}>
                    <strong style={{ color: '#e8365d' }}>AI洞察:</strong> 降投动作占比最高(35%), 表明当前库存整体偏紧。
                    建议关注唇釉系列补货进度, LP-208和LP-310急需补货以恢复投放。
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,30,40,0.92)', color: '#fff', padding: '10px 24px',
          borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none',
          maxWidth: '80vw', textAlign: 'center',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}
