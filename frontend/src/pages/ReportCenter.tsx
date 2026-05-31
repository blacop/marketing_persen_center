import { useState } from 'react'
import {
  FileText, TrendingUp, BarChart3, Send, Bell, Clock, Users,
  Calendar, Download, Settings, Plus, CheckCircle, AlertCircle,
  Mail, MessageSquare, Brain, Zap, Star, ShoppingBag, Eye,
  ChevronRight, Edit3, Trash2, Play, Pause, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   ROI报告中心 —— 日报/周报自动生成与推送 (玛丽黛佳)
   自动生成投放报告 · 钉钉/飞书推送 · AI智能洞察
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['今日日报', '本周周报', '自定义报告', '推送设置']

// ── Tab 1: 今日日报 ──

const coreMetrics = [
  { label: 'GMV', value: '¥68.5万', vsYesterday: '+12.3%', vsLastWeek: '+8.7%', upY: true, upW: true },
  { label: '广告花费', value: '¥17.9万', vsYesterday: '-3.2%', vsLastWeek: '+5.1%', upY: false, upW: true },
  { label: '整体ROI', value: '3.82', vsYesterday: '+16.1%', vsLastWeek: '+3.4%', upY: true, upW: true },
  { label: '新客获取', value: '2,840人', vsYesterday: '+8.5%', vsLastWeek: '+12.2%', upY: true, upW: true },
  { label: '客单价', value: '¥241', vsYesterday: '+3.6%', vsLastWeek: '-1.2%', upY: true, upW: false },
  { label: '订单数', value: '2,842单', vsYesterday: '+8.3%', vsLastWeek: '+9.8%', upY: true, upW: true },
]

const platformDetail = [
  { platform: '抖音巨量', gmv: '¥32.8万', cost: '¥8.2万', roi: 4.00, newCustomers: '1,420', vsYesterday: '+15.2%', up: true },
  { platform: '小红书聚光', gmv: '¥18.6万', cost: '¥5.1万', roi: 3.65, newCustomers: '860', vsYesterday: '+8.6%', up: true },
  { platform: '快手磁力', gmv: '¥12.4万', cost: '¥3.2万', roi: 3.88, newCustomers: '380', vsYesterday: '+11.3%', up: true },
  { platform: '微信广告', gmv: '¥4.7万', cost: '¥1.4万', roi: 3.36, newCustomers: '180', vsYesterday: '+4.2%', up: true },
  { platform: 'Meta Ads 🌍', gmv: '$18.2万', cost: '$4.5万', roi: 4.04, newCustomers: '1,280', vsYesterday: '+18.6%', up: true },
  { platform: 'TikTok Global 🌍', gmv: '$15.8万', cost: '$3.4万', roi: 4.65, newCustomers: '1,620', vsYesterday: '+28.4%', up: true },
  { platform: 'Google·YT 🌍', gmv: '$8.6万', cost: '$2.7万', roi: 3.19, newCustomers: '440', vsYesterday: '+5.8%', up: true },
]

const platformROIChart = [
  { platform: '抖音巨量', ROI: 4.00 },
  { platform: '小红书聚光', ROI: 3.65 },
  { platform: '快手磁力', ROI: 3.88 },
  { platform: '微信广告', ROI: 3.36 },
  { platform: 'Meta Ads', ROI: 4.04 },
  { platform: 'TikTok Global', ROI: 4.65 },
  { platform: 'Google·YT', ROI: 3.19 },
]

// ── Tab 2: 本周周报 ──

const weeklyTrend = [
  { day: '周一', GMV: 52.3, ROI: 3.65 },
  { day: '周二', GMV: 58.1, ROI: 3.72 },
  { day: '周三', GMV: 61.8, ROI: 3.78 },
  { day: '周四', GMV: 65.2, ROI: 3.85 },
  { day: '周五', GMV: 68.5, ROI: 3.82 },
  { day: '周六', GMV: 62.4, ROI: 3.91 },
  { day: '周日', GMV: 60.3, ROI: 3.88 },
]

const top5Products = [
  { name: '唇釉丝绒#105色号', sales: '1,280', gmv: '¥38.6万', roi: 4.52 },
  { name: '精华液修护版30ml', sales: '960', gmv: '¥28.8万', roi: 4.18 },
  { name: '眼影盘星空色系列', sales: '850', gmv: '¥25.5万', roi: 3.95 },
  { name: '气垫BB霜自然色', sales: '720', gmv: '¥21.6万', roi: 3.72 },
  { name: '卸妆水温和版500ml', sales: '680', gmv: '¥13.6万', roi: 3.88 },
]

const top5Creatives = [
  { name: '唇釉试色合集短视频', ctr: '5.8%', cvr: '3.2%', gmv: '¥12.8万' },
  { name: '素颜vs妆后对比图文', ctr: '4.9%', cvr: '2.8%', gmv: '¥10.5万' },
  { name: '成分解析长图文', ctr: '4.5%', cvr: '3.5%', gmv: '¥9.8万' },
  { name: '达人开箱实测视频', ctr: '4.2%', cvr: '2.6%', gmv: '¥8.6万' },
  { name: '限时折扣海报素材', ctr: '6.1%', cvr: '2.1%', gmv: '¥7.2万' },
]

const top5KOLs = [
  { name: '彩妆师小雅', contentCount: 12, gmv: '¥18.5万', roi: 5.20 },
  { name: '成分研究社', contentCount: 8, gmv: '¥14.2万', roi: 4.85 },
  { name: '粉粉的小仙女', contentCount: 10, gmv: '¥12.8万', roi: 4.62 },
  { name: '口红上新', contentCount: 6, gmv: '¥11.5万', roi: 4.30 },
  { name: '小白兔变美记', contentCount: 9, gmv: '¥9.8万', roi: 5.10 },
]

const aiInsights = [
  { text: '唇釉系列ROI环比提升23%, 建议加大投放预算', type: 'positive' as const },
  { text: '小红书种草→天猫转化路径效率提升, 建议增加种草内容产出', type: 'positive' as const },
  { text: '快手下午14-16时段ROI最高, 建议集中预算投放', type: 'tip' as const },
  { text: 'TikTok Global ROAS 4.65x创近90日新高（JP+US市场共振），建议海外预算提升15%', type: 'positive' as const },
  { text: 'Meta EU iOS归因缺口约18%，建议优先启用Conversions API增强转化数据精度', type: 'tip' as const },
]

// ── Tab 3: 自定义报告 ──

const savedReports = [
  { name: '每日ROI总览', creator: '张经理', frequency: '每日', lastGenerated: '2026-04-05 09:00', status: '正常' },
  { name: '产品线周报', creator: '李总监', frequency: '每周一', lastGenerated: '2026-03-31 09:00', status: '正常' },
  { name: '达人效果月报', creator: '王运营', frequency: '每月1日', lastGenerated: '2026-04-01 09:00', status: '正常' },
  { name: '竞品对标季报', creator: '赵分析师', frequency: '每季度', lastGenerated: '2026-04-01 10:00', status: '暂停' },
]

// ── Tab 4: 推送设置 ──

const pushChannels = [
  { name: '钉钉群', icon: <MessageSquare size={20} />, enabled: true, config: '已配置Webhook', pushTime: '每日9:00 + 18:00', receivers: 28, color: '#3b82f6' },
  { name: '飞书群', icon: <Send size={20} />, enabled: true, config: '已配置Webhook', pushTime: '每日9:30', receivers: 15, color: '#8b5cf6' },
  { name: '企业微信', icon: <Users size={20} />, enabled: true, config: '已配置Webhook', pushTime: '异常时即时推送', receivers: 8, color: '#22c55e' },
  { name: '邮件', icon: <Mail size={20} />, enabled: true, config: '已配置SMTP', pushTime: '周报每周一9:00', receivers: 12, color: '#f59e0b' },
]

const pushRecords = [
  { time: '2026-04-05 09:00', type: '日报', channel: '钉钉群', receivers: '投放团队(28人)', status: '成功', openRate: '89%' },
  { time: '2026-04-05 09:30', type: '日报', channel: '飞书群', receivers: '管理层(15人)', status: '成功', openRate: '73%' },
  { time: '2026-04-05 09:00', type: '日报', channel: '邮件', receivers: '全员(12人)', status: '成功', openRate: '62%' },
  { time: '2026-04-04 18:00', type: '晚报', channel: '钉钉群', receivers: '投放团队(28人)', status: '成功', openRate: '85%' },
  { time: '2026-04-04 14:32', type: '异常告警', channel: '企业微信', receivers: '值班组(8人)', status: '成功', openRate: '100%' },
  { time: '2026-04-04 09:00', type: '日报', channel: '钉钉群', receivers: '投放团队(28人)', status: '失败', openRate: '-' },
]

// ── Tooltip Style ──

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

// ── Chart Colors ──

const COLORS = ['#e8365d', '#ff7a95', '#ffb4c6', '#8b5cf6', '#22c55e', '#f59e0b']

// ── AI Configuration ──

const reportAIConfigGroups: AIConfigGroup[] = [
  {
    title: '报告洞察配置',
    icon: <Brain size={15} />,
    params: [
      createParam('insight_depth', '洞察分析深度', '趋势+归因', '', '报告中AI自动生成洞察的分析深度', '趋势+归因', 88, {
        type: 'select',
        options: ['基础统计', '趋势分析', '趋势+归因', '全链路洞察'],
        learningDataPoints: 95000,
        adjustHistory: [
          { time: '昨日', from: '趋势分析', to: '趋势+归因', reason: 'AI检测到归因数据充足, 自动提升分析深度' },
        ],
      }),
      createParam('anomaly_highlight', '异常标注灵敏度', 15, '%', '超过此偏差幅度的指标将被高亮标注为异常', 12, 85, {
        min: 5, max: 30, step: 1,
        learningDataPoints: 88000,
        adjustHistory: [
          { time: '3天前', from: '20', to: '15', reason: '近期数据波动加大, AI降低阈值以捕捉更多异常' },
        ],
      }),
      createParam('suggestion_count', '建议生成数量', 3, '条', '每份报告中AI自动生成的优化建议数量', 3, 87, {
        min: 1, max: 10, step: 1,
        learningDataPoints: 72000,
      }),
      createParam('compare_mode', '默认对比模式', '环比+同比', '', '报告中指标默认的对比维度', '环比+同比', 90, {
        type: 'select',
        options: ['仅环比', '仅同比', '环比+同比'],
        learningDataPoints: 65000,
      }),
    ],
  },
  {
    title: '推送策略',
    icon: <Send size={15} />,
    params: [
      createParam('daily_push_time', '日报推送时间', '09:00', '', '每日投放报告的自动推送时间', '09:00', 92, {
        learningDataPoints: 42000,
        adjustHistory: [
          { time: '1周前', from: '08:30', to: '09:00', reason: '分析团队成员活跃时段, 调整至最佳阅读时间' },
        ],
      }),
      createParam('weekly_push_day', '周报推送日', '周一', '', '每周投放周报的推送日期', '周一', 89, {
        type: 'select',
        options: ['周一', '周二', '周三', '周四', '周五'],
        learningDataPoints: 38000,
      }),
      createParam('alert_push', '异常即时推送', '开启', '', '当检测到投放异常时是否立即推送告警', '开启', 91, {
        type: 'select',
        options: ['开启', '关闭', '仅严重'],
        learningDataPoints: 55000,
      }),
      createParam('digest_mode', '摘要模式', '图文摘要', '', '推送报告的内容展示格式', '图文摘要', 86, {
        type: 'select',
        options: ['纯文字', '图文摘要', '完整报告'],
        learningDataPoints: 40000,
      }),
    ],
  },
]

const reportAILearningStatus: AILearningStatus = {
  modelVersion: 'v1.6.0-reporting',
  lastTraining: '2小时前',
  totalDataPoints: 380000,
  avgConfidence: 87,
  autoAdjustCount24h: 18,
  learningRate: '0.002',
  nextTraining: '4小时后',
  improvementRate: '+3.8%',
}

// ── International Team Data ──

const intlPlatformRows = [
  { platform: 'Facebook', cost: '$6.8万', gmv: '$28万', roas: '4.1x', newUsers: '1,240', firstOrderRate: '32%', wow: '+8%', up: true },
  { platform: 'Instagram', cost: '$4.2万', gmv: '$18万', roas: '4.3x', newUsers: '890', firstOrderRate: '28%', wow: '+14%', up: true },
  { platform: 'TikTok Global', cost: '$4.8万', gmv: '$22万', roas: '4.6x', newUsers: '1,680', firstOrderRate: '41%', wow: '+28%', up: true },
  { platform: 'Google/YT', cost: '$2.6万', gmv: '$8.2万', roas: '3.2x', newUsers: '440', firstOrderRate: '22%', wow: '+5%', up: true },
]

const marketRows = [
  { flag: '🇺🇸', market: '美国', cost: '$5.2万', gmv: '$21.8万', roas: '4.2x', platform: 'Facebook + TikTok', hero: '唇釉105#', up: true },
  { flag: '🇬🇧', market: '英国', cost: '$3.1万', gmv: '$12.4万', roas: '4.0x', platform: 'Instagram + TikTok', hero: '精华液修护版', up: true },
  { flag: '🇯🇵', market: '日本', cost: '$3.8万', gmv: '$16.5万', roas: '4.3x', platform: 'TikTok + Google', hero: '眼影盘星空系列', up: true },
  { flag: '🇸🇬', market: '新加坡', cost: '$2.0万', gmv: '$8.2万', roas: '4.1x', platform: 'Facebook + Instagram', hero: '气垫BB霜', up: true },
  { flag: '🇩🇪', market: '德国', cost: '$2.4万', gmv: '$9.1万', roas: '3.8x', platform: 'Instagram + Google', hero: '卸妆水温和版', up: true },
  { flag: '🇫🇷', market: '法国', cost: '$1.9万', gmv: '$8.2万', roas: '4.3x', platform: 'TikTok + Instagram', hero: '唇釉丝绒系列', up: true },
]

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export default function ReportCenter() {
  const [activeTab, setActiveTab] = useState(0)
  const [reportDimension, setReportDimension] = useState('combined')
  const [reportName, setReportName] = useState('')
  const [timeRange, setTimeRange] = useState('今日')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['GMV', '花费', 'ROI', '新客'])
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['按平台'])
  const [compareDimension, setCompareDimension] = useState('环比')
  const [toast, setToast] = useState<string | null>(null)
  const [savedReportsList, setSavedReportsList] = useState(savedReports)
  const [editingReport, setEditingReport] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deletingReport, setDeletingReport] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  useRegisterAIConfig(reportAIConfigGroups, reportAILearningStatus, 'ROI报告')

  const showToast = (msg: string, duration = 2500) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }

  const toggleMetric = (m: string) => {
    setSelectedMetrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }
  const toggleDimension = (d: string) => {
    setSelectedDimensions(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  return (
    <>
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={22} color="#e8365d" />
          ROI报告中心
        </h2>
        <p>日报/周报自动生成 · 钉钉/飞书智能推送 · AI洞察分析</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e8365d', background: 'rgba(232,54,93,0.08)', padding: '6px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, marginTop: 8 }}>
          <Brain size={14} />
          <span>报告引擎置信度 87% · 覆盖38万数据点 · 今日已推送3份</span>
        </div>
      </div>

      <div className="page-content">
        {/* ── 报告维度切换 ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'combined', label: '综合报告' },
            { key: 'domestic', label: '🇨🇳 国内团队' },
            { key: 'international', label: '🌍 国际团队' },
            { key: 'market', label: '分市场报告' },
          ].map(dim => (
            <button
              key={dim.key}
              onClick={() => setReportDimension(dim.key)}
              style={{
                padding: '7px 18px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                border: reportDimension === dim.key ? '1px solid #e8365d' : '1px solid var(--border)',
                background: reportDimension === dim.key ? 'rgba(232,54,93,0.10)' : 'var(--bg-card)',
                color: reportDimension === dim.key ? '#e8365d' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >{dim.label}</button>
          ))}
        </div>

        {/* ══════════════ 国际团队 View ══════════════ */}
        {reportDimension === 'international' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* KPI Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: '国际总消耗', value: '$18.4万/周', sub: '+22% 周环比', color: '#0ea5e9', icon: <Zap size={18} /> },
                { label: '国际GMV', value: '$76.2万/周', sub: '+31% 周环比', color: '#22c55e', icon: <TrendingUp size={18} /> },
                { label: '综合ROAS', value: '4.14x', sub: '优于基准 +0.3x', color: '#e8365d', icon: <BarChart3 size={18} /> },
                { label: '覆盖市场', value: '12国', sub: '本周新增 1 个市场', color: '#8b5cf6', icon: <ChevronRight size={18} /> },
              ].map(card => (
                <div key={card.label} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{card.label}</div>
                    <div style={{ color: card.color, opacity: 0.7 }}>{card.icon}</div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* 平台周报表 */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="#0ea5e9" />
                平台周报表
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['平台', '消耗', 'GMV', 'ROAS', '新用户', '首单率', '周环比'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {intlPlatformRows.map(row => (
                      <tr key={row.platform} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.platform}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.cost}</td>
                        <td style={{ padding: '12px', color: '#0ea5e9', fontWeight: 700 }}>{row.gmv}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: parseFloat(row.roas) >= 4.0 ? '#22c55e' : '#f59e0b' }}>{row.roas}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.newUsers}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.firstOrderRate}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: row.up ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{row.up ? '↑' : '↓'}{row.wow}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI洞察 */}
            <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <Brain size={18} color="#0ea5e9" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI洞察</span>
                  <ModelBadge name="MultiCurrency-ROAS" color="#0ea5e9" />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  MultiCurrency-ROAS 模型 · 本周汇率波动导致实际GMV低于预期1.8%，建议启用汇率对冲策略
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ 分市场报告 View ══════════════ */}
        {reportDimension === 'market' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Market Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#0ea5e9" />
                分市场报告
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['市场', '消耗', 'GMV', 'ROAS', '主力平台', '爆品'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {marketRows.map(row => (
                      <tr key={row.market} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.flag} {row.market}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.cost}</td>
                        <td style={{ padding: '12px', color: '#0ea5e9', fontWeight: 700 }}>{row.gmv}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: parseFloat(row.roas) >= 4.0 ? '#22c55e' : '#f59e0b' }}>{row.roas}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{row.platform}</td>
                        <td style={{ padding: '12px', color: '#e8365d', fontWeight: 600 }}>{row.hero}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI洞察 */}
            <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <Brain size={18} color="#0ea5e9" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI洞察</span>
                  <ModelBadge name="MultiCurrency-ROAS" color="#0ea5e9" />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  MultiCurrency-ROAS 模型 · 本周汇率波动导致实际GMV低于预期1.8%，建议启用汇率对冲策略
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show standard tabs only when in combined or domestic dimension */}
        {(reportDimension === 'combined' || reportDimension === 'domestic') && (
          <>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: '今日ROI', value: '3.82', sub: '环比昨日 +16.1%', icon: <TrendingUp size={18} />, color: '#e8365d' },
            { label: '今日GMV', value: '¥68.5万', sub: '环比昨日 +12.3%', icon: <BarChart3 size={18} />, color: '#ff7a95' },
            { label: '今日花费', value: '¥17.9万', sub: '环比昨日 -3.2%', icon: <Zap size={18} />, color: '#8b5cf6' },
            { label: '报告推送', value: '已推送3份', sub: '钉钉2份 + 飞书1份', icon: <Send size={18} />, color: '#22c55e' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{card.label}</div>
                <div style={{ color: card.color, opacity: 0.7 }}>{card.icon}</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.sub}</div>
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

        {/* ══════════════ Tab 1: 今日日报 ══════════════ */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} color="#e8365d" />
                    玛丽黛佳 · 广告投放日报
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    日期: 2026年4月5日 · 数据截至: 2026-04-05 23:59:59
                  </div>
                </div>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => showToast('⬇️ 报告导出中，预计10秒完成，将自动下载至本地')}
                >
                  <Download size={14} />
                  导出报告
                </button>
              </div>
            </div>

            {/* 核心指标 */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="#e8365d" />
                核心指标
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {coreMetrics.map(m => (
                  <div key={m.label} style={{ background: 'var(--bg-main)', borderRadius: 10, padding: 16, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>{m.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e8365d', marginBottom: 10 }}>{m.value}</div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ fontSize: '0.68rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>vs昨日 </span>
                        <span style={{ color: m.upY ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                          {m.upY ? '↑' : '↓'}{m.vsYesterday}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>vs上周 </span>
                        <span style={{ color: m.upW ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                          {m.upW ? '↑' : '↓'}{m.vsLastWeek}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 平台明细 */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={16} color="#e8365d" />
                平台明细
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['平台', 'GMV', '花费', 'ROI', '新客', 'vs昨日'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {platformDetail.map(p => (
                      <tr key={p.platform} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.platform}</td>
                        <td style={{ padding: '12px', color: '#e8365d', fontWeight: 700 }}>{p.gmv}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.cost}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: p.roi >= 3.8 ? '#22c55e' : '#f59e0b' }}>{p.roi.toFixed(2)}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.newCustomers}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: p.up ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                            {p.up ? '↑' : '↓'}{p.vsYesterday}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 各平台ROI对比 BarChart */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} color="#e8365d" />
                各平台ROI对比
              </div>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={platformROIChart} layout="vertical" margin={{ left: 100 }}>
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis type="category" dataKey="platform" tick={{ fontSize: 11, fill: 'var(--text-primary)' }} width={100} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="ROI" radius={[0, 6, 6, 0]} barSize={28}>
                    {platformROIChart.map((_, i) => (
                      <rect key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 2: 本周周报 ══════════════ */}
        {activeTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 周汇总 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: '周GMV', value: '¥428.6万', color: '#e8365d' },
                { label: '周花费', value: '¥112.4万', color: '#ff7a95' },
                { label: '周ROI', value: '3.81', color: '#8b5cf6' },
                { label: '周新客', value: '18,640', color: '#22c55e' },
              ].map(card => (
                <div key={card.label} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* 本周每日趋势 */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#e8365d" />
                本周每日GMV + ROI趋势
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} label={{ value: 'GMV(万)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'var(--text-muted)' } }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} domain={[3.4, 4.2]} label={{ value: 'ROI', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: 'var(--text-muted)' } }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Bar yAxisId="left" dataKey="GMV" fill="#ffb4c6" radius={[4, 4, 0, 0]} barSize={32} name="GMV(万)" />
                  <Line yAxisId="right" type="monotone" dataKey="ROI" stroke="#e8365d" strokeWidth={2.5} dot={{ fill: '#e8365d', r: 4 }} name="ROI" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* TOP5 sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {/* TOP5 爆款商品 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShoppingBag size={15} color="#e8365d" />
                  TOP5 爆款商品
                </div>
                {top5Products.map((p, i) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < 3 ? '#e8365d' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: i < 3 ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>销量 {p.sales} · GMV {p.gmv}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e8365d', flexShrink: 0 }}>ROI {p.roi}</div>
                  </div>
                ))}
              </div>

              {/* TOP5 优质素材 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={15} color="#ff7a95" />
                  TOP5 优质素材
                </div>
                {top5Creatives.map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < 3 ? '#ff7a95' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: i < 3 ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CTR {c.ctr} · CVR {c.cvr}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ff7a95', flexShrink: 0 }}>{c.gmv}</div>
                  </div>
                ))}
              </div>

              {/* TOP5 高效达人 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={15} color="#8b5cf6" />
                  TOP5 高效达人
                </div>
                {top5KOLs.map((k, i) => (
                  <div key={k.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < 3 ? '#8b5cf6' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: i < 3 ? '#fff' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{k.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>种草内容 {k.contentCount}篇 · 归因GMV {k.gmv}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8b5cf6', flexShrink: 0 }}>ROI {k.roi}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI洞察 */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={16} color="#e8365d" />
                AI智能洞察
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {aiInsights.map((insight, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10,
                    background: insight.type === 'positive' ? 'rgba(34,197,94,0.06)' : 'rgba(232,54,93,0.06)',
                    border: `1px solid ${insight.type === 'positive' ? 'rgba(34,197,94,0.15)' : 'rgba(232,54,93,0.15)'}`,
                  }}>
                    {insight.type === 'positive' ? (
                      <TrendingUp size={16} color="#22c55e" style={{ flexShrink: 0 }} />
                    ) : (
                      <Zap size={16} color="#e8365d" style={{ flexShrink: 0 }} />
                    )}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{insight.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 3: 自定义报告 ══════════════ */}
        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Report Builder */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={16} color="#e8365d" />
                创建自定义报告
              </div>

              {/* 报告名称 */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>报告名称</label>
                <input
                  type="text"
                  placeholder="请输入报告名称..."
                  value={reportName}
                  onChange={e => setReportName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* 时间范围 */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>时间范围</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['今日', '昨日', '近7天', '近30天', '自定义'].map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      style={{
                        padding: '7px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        border: timeRange === range ? '1px solid #e8365d' : '1px solid var(--border)',
                        background: timeRange === range ? 'rgba(232,54,93,0.08)' : 'var(--bg-main)',
                        color: timeRange === range ? '#e8365d' : 'var(--text-secondary)',
                      }}
                    >{range}</button>
                  ))}
                </div>
              </div>

              {/* 指标选择 */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>指标选择</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['GMV', '花费', 'ROI', '新客', 'CTR', 'CVR', '客单价', '订单数'].map(metric => (
                    <label key={metric} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${selectedMetrics.includes(metric) ? '#e8365d' : 'var(--border)'}`, background: selectedMetrics.includes(metric) ? 'rgba(232,54,93,0.06)' : 'var(--bg-main)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: selectedMetrics.includes(metric) ? '#e8365d' : 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={selectedMetrics.includes(metric)} onChange={() => toggleMetric(metric)} style={{ display: 'none' }} />
                      {selectedMetrics.includes(metric) && <CheckCircle size={13} color="#e8365d" />}
                      {metric}
                    </label>
                  ))}
                </div>
              </div>

              {/* 维度选择 */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>维度选择</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['按平台', '按产品线', '按达人', '按素材类型'].map(dim => (
                    <label key={dim} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${selectedDimensions.includes(dim) ? '#8b5cf6' : 'var(--border)'}`, background: selectedDimensions.includes(dim) ? 'rgba(139,92,246,0.06)' : 'var(--bg-main)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: selectedDimensions.includes(dim) ? '#8b5cf6' : 'var(--text-secondary)' }}>
                      <input type="checkbox" checked={selectedDimensions.includes(dim)} onChange={() => toggleDimension(dim)} style={{ display: 'none' }} />
                      {selectedDimensions.includes(dim) && <CheckCircle size={13} color="#8b5cf6" />}
                      {dim}
                    </label>
                  ))}
                </div>
              </div>

              {/* 对比维度 */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>对比维度</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['无', '环比', '同比'].map(comp => (
                    <button
                      key={comp}
                      onClick={() => setCompareDimension(comp)}
                      style={{
                        padding: '7px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                        border: compareDimension === comp ? '1px solid #f59e0b' : '1px solid var(--border)',
                        background: compareDimension === comp ? 'rgba(245,158,11,0.08)' : 'var(--bg-main)',
                        color: compareDimension === comp ? '#f59e0b' : 'var(--text-secondary)',
                      }}
                    >{comp}</button>
                  ))}
                </div>
              </div>

              <button
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #e8365d, #ff7a95)', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => {
                  showToast('生成中...')
                  setTimeout(() => showToast('报告已生成'), 1800)
                }}
              >
                <Play size={14} />
                生成报告
              </button>
            </div>

            {/* 已保存报告 */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="#e8365d" />
                已保存报告
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['报告名', '创建人', '更新频率', '最近生成', '状态', '操作'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {savedReportsList.map(r => (
                      <>
                        <tr key={r.name} style={{ borderBottom: editingReport === r.name || deletingReport === r.name ? 'none' : '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.creator}</td>
                          <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.frequency}</td>
                          <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{r.lastGenerated}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                              background: generatingReport === r.name ? 'rgba(245,158,11,0.1)' : r.status === '正常' ? 'rgba(34,197,94,0.1)' : 'rgba(156,163,175,0.1)',
                              color: generatingReport === r.name ? '#f59e0b' : r.status === '正常' ? '#22c55e' : '#9ca3af',
                            }}>{generatingReport === r.name ? '生成中...' : r.status}</span>
                          </td>
                          <td style={{ padding: '12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: editingReport === r.name ? '#e8365d' : 'var(--text-muted)', padding: 4 }}
                              title="编辑"
                              onClick={() => { setEditingReport(prev => prev === r.name ? null : r.name); setEditingName(r.name); setDeletingReport(null) }}
                            ><Edit3 size={14} /></button>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: deletingReport === r.name ? '#ef4444' : 'var(--text-muted)', padding: 4 }}
                              title="删除"
                              onClick={() => { setDeletingReport(prev => prev === r.name ? null : r.name); setEditingReport(null) }}
                            ><Trash2 size={14} /></button>
                            <button
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e8365d', padding: 4 }}
                              title="立即生成"
                              onClick={() => {
                                if (generatingReport === r.name) return
                                setGeneratingReport(r.name)
                                const pages = Math.floor(Math.random() * 8) + 4
                                setTimeout(() => {
                                  setGeneratingReport(null)
                                  showToast(`✅ 报告生成成功，共${pages}页`, 3500)
                                }, 1800)
                              }}
                            ><RefreshCw size={14} /></button>
                          </td>
                        </tr>
                        {editingReport === r.name && (
                          <tr key={r.name + '_edit'} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td colSpan={6} style={{ padding: '8px 12px', background: 'rgba(232,54,93,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>报告名称：</span>
                                <input
                                  value={editingName}
                                  onChange={e => setEditingName(e.target.value)}
                                  style={{ flex: 1, padding: '4px 10px', borderRadius: 6, border: '1px solid #e8365d', fontSize: '0.78rem', background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                                />
                                <button
                                  style={{ padding: '4px 12px', borderRadius: 6, background: '#e8365d', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                                  onClick={() => {
                                    setSavedReportsList(prev => prev.map(x => x.name === r.name ? { ...x, name: editingName } : x))
                                    setEditingReport(null)
                                    showToast('✅ 报告名称已更新', 3500)
                                  }}
                                >保存</button>
                                <button
                                  style={{ padding: '4px 10px', borderRadius: 6, background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.72rem' }}
                                  onClick={() => setEditingReport(null)}
                                >取消</button>
                              </div>
                            </td>
                          </tr>
                        )}
                        {deletingReport === r.name && (
                          <tr key={r.name + '_del'} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td colSpan={6} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>确认删除「{r.name}」？此操作不可撤销。</span>
                                <button
                                  style={{ padding: '4px 12px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                                  onClick={() => {
                                    setSavedReportsList(prev => prev.filter(x => x.name !== r.name))
                                    setDeletingReport(null)
                                    showToast(`🗑 已删除报告「${r.name}」`, 3500)
                                  }}
                                >确认删除</button>
                                <button
                                  style={{ padding: '4px 10px', borderRadius: 6, background: 'none', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.72rem' }}
                                  onClick={() => setDeletingReport(null)}
                                >取消</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ Tab 4: 推送设置 ══════════════ */}
        {activeTab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 推送渠道 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {pushChannels.map(ch => (
                <div key={ch.name} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 20, border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ color: ch.color }}>{ch.icon}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ch.name}</div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
                      background: ch.enabled ? 'rgba(34,197,94,0.1)' : 'rgba(156,163,175,0.1)',
                      color: ch.enabled ? '#22c55e' : '#9ca3af',
                    }}>{ch.enabled ? '已启用' : '已停用'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>配置状态</span>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>{ch.config}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>推送时间</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ch.pushTime}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>接收人数</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ch.receivers}人</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    <button
                      style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => showToast(`${ch.name} 配置已保存`)}
                    >
                      <Settings size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />配置
                    </button>
                    <button
                      style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-main)', color: '#e8365d', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => { showToast(`正在测试 ${ch.name} 连接...`); setTimeout(() => showToast(`${ch.name} 连接测试成功`), 1500) }}
                    >
                      <Send size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />测试
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 推送记录 */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color="#e8365d" />
                推送记录
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      {['时间', '报告类型', '推送渠道', '接收人', '状态', '打开率'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pushRecords.map((rec, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{rec.time}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{rec.type}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{rec.channel}</td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{rec.receivers}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
                            background: rec.status === '成功' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: rec.status === '成功' ? '#22c55e' : '#ef4444',
                          }}>
                            {rec.status === '成功' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                            {rec.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 700, color: rec.openRate === '-' ? 'var(--text-muted)' : '#e8365d' }}>{rec.openRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(30,30,40,0.92)', color: '#fff', padding: '10px 24px',
          borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}
