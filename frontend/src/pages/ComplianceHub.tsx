import { useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, XCircle, Globe, Lock, Eye, FileText, Users, Database, RefreshCw, TrendingUp, AlertCircle, Zap } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ─── Static Data ──────────────────────────────────────────────────────────────

const radarData = [
  { dim: '数据收集', GDPR: 75, CCPA: 90, ATT: 65, PIPL: 95 },
  { dim: '用户同意', GDPR: 82, CCPA: 88, ATT: 70, PIPL: 98 },
  { dim: '数据删除', GDPR: 80, CCPA: 92, ATT: 85, PIPL: 94 },
  { dim: '跨境传输', GDPR: 85, CCPA: 95, ATT: 90, PIPL: 96 },
  { dim: '第三方共享', GDPR: 78, CCPA: 89, ATT: 72, PIPL: 97 },
]

const complianceEvents = [
  { time: '今日 09:14', type: '整改完成', detail: '英国市场 Cookie Banner 更新至 ICO 最新标准', status: '完成', color: '#22c55e' },
  { time: '今日 08:52', type: '自动删除', detail: '已自动清除 3,284 条超期用户数据（PIPL 24个月留存期）', status: '完成', color: '#22c55e' },
  { time: '昨日 17:30', type: '数据主体请求', detail: '法国用户 USR-FR-2041 数据删除请求处理完毕', status: '完成', color: '#22c55e' },
  { time: '昨日 14:08', type: '待整改', detail: '德国市场检测到旧版 Cookie Banner，需升级至 TCF 2.2', status: '待处理', color: '#f59e0b' },
  { time: '3天前 10:20', type: 'CAPI 激活', detail: 'Meta Conversions API 上线，补偿 ATT 归因缺口 +12%', status: '完成', color: '#22c55e' },
]

const complianceCalendar = [
  { date: '2026-04-28', event: 'GDPR 年度数据保护影响评估 (DPIA)', urgency: '高', color: '#ef4444' },
  { date: '2026-05-15', event: 'CCPA 隐私政策季度更新', urgency: '中', color: '#f59e0b' },
  { date: '2026-06-01', event: 'PIPL 合规审计（中国区）', urgency: '高', color: '#ef4444' },
  { date: '2026-06-25', event: 'ATT 授权声明文案审核', urgency: '低', color: '#22c55e' },
]

const attMarketData = [
  { market: 'JP 日本', rate: 42 },
  { market: 'UK 英国', rate: 38 },
  { market: 'US 美国', rate: 34 },
  { market: 'DE 德国', rate: 29 },
]

const dataInventory = [
  { category: '广告点击数据', collected: '设备ID, IP, 时间戳', stored: 'EU / CN 双节点', access: '投放团队, BI团队', retention: '13个月', status: '合规' },
  { category: '用户行为事件', collected: '页面访问, 加购, 购买', stored: 'CN 节点', access: '数据团队', retention: '24个月', status: '合规' },
  { category: 'IDFA / GAID', collected: 'Apple ATT 授权后采集', stored: 'MMP 第三方', access: '投放团队', retention: '90天', status: '警告' },
  { category: '第三方 DMP 数据', collected: '兴趣标签, 人群包', stored: '第三方 DMP', access: '投放团队', retention: '按合同', status: '合规' },
  { category: '用户注册信息', collected: '手机号, 邮箱, 昵称', stored: 'CN 节点 (加密)', access: '隐私合规团队', retention: '法规要求', status: '合规' },
]

const thirdPartyAudit = [
  { vendor: 'Meta (Facebook)', type: '广告平台', data: '转化事件, 自定义受众', dpa: '已签署', lastAudit: '2026-02-10', status: '合规' },
  { vendor: 'Google Ads', type: '广告平台', data: '转化标签, 受众数据', dpa: '已签署', lastAudit: '2026-02-10', status: '合规' },
  { vendor: 'AppsFlyer (MMP)', type: '归因平台', data: 'IDFA, 安装事件', dpa: '已签署', lastAudit: '2026-01-15', status: '警告' },
  { vendor: 'TikTok for Business', type: '广告平台', data: '像素事件, 受众', dpa: '已签署', lastAudit: '2026-03-01', status: '合规' },
  { vendor: 'Criteo', type: 'DSP 重定向', data: 'Cookie, 行为数据', dpa: '待续签', lastAudit: '2025-11-20', status: '警告' },
]

const privacyChecklist = [
  { item: '数据最小化原则 — 仅收集必要字段', done: true },
  { item: '明确告知用户数据用途', done: true },
  { item: '获取有效用户同意（非预选勾选）', done: true },
  { item: '提供数据删除自助通道', done: true },
  { item: '第三方数据共享已获授权', done: false },
  { item: '跨境数据传输已进行 DPIA 评估', done: false },
  { item: 'PIPL 境内数据存储确认', done: true },
  { item: '24小时数据泄露响应预案', done: true },
]

const crossBorderTransfer = [
  { from: '中国大陆', to: '欧盟 (Meta CAPI)', mechanism: 'SCCs 标准合同条款', status: '合规', risk: '低' },
  { from: '中国大陆', to: '美国 (Google Ads)', mechanism: 'DPA + SCCs', status: '合规', risk: '低' },
  { from: '欧盟', to: '美国 (MMP)', mechanism: 'EU-US DPF', status: '警告', risk: '中' },
  { from: '中国大陆', to: '东南亚 (联盟)', mechanism: '待完善', status: '待整改', risk: '高' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ─── AI Config ────────────────────────────────────────────────────────────────

const complianceConfigGroups: AIConfigGroup[] = [
  {
    title: '隐私合规阈值',
    icon: <Shield size={15} />,
    params: [
      createParam('gdpr_consent_min', '最低 Cookie 同意率', 60, '%', 'GDPR 市场 Cookie 同意率低于此值触发告警并自动优化 Banner 文案', 65, 88, {
        min: 40, max: 90, step: 1, learningDataPoints: 28400,
        adjustHistory: [
          { time: '3天前', from: '55', to: '60', reason: 'DE市场同意率持续低迷，上调阈值以触发自动优化' },
          { time: '2周前', from: '60', to: '55', reason: '新 Banner 灰度测试期间临时放宽' },
        ],
      }),
      createParam('data_retention_gdpr', 'GDPR 数据保留上限', 18, '个月', '欧盟市场用户数据最长保留期限，超期自动触发匿名化或删除', 18, 95, {
        min: 6, max: 36, step: 1, autoTuneEnabled: false, learningDataPoints: 12300,
        adjustHistory: [
          { time: '1周前', from: '24', to: '18', reason: '法国 DPA 指导意见更新，手动收紧保留期至18个月' },
        ],
      }),
      createParam('pipl_cross_border_risk', 'PIPL 跨境风险评分上限', 60, '分', '中国区数据跨境传输风险评分超过此值时阻断传输并告警', 55, 82, {
        min: 30, max: 90, step: 5, learningDataPoints: 9800,
        adjustHistory: [
          { time: '昨日', from: '70', to: '60', reason: 'PIPL 执法趋严，AI收紧跨境风险阈值' },
        ],
      }),
    ],
  },
  {
    title: '同意率优化策略',
    icon: <Users size={15} />,
    params: [
      createParam('banner_ab_cycle', 'Banner A/B 轮换周期', 7, '天', '自动对 Cookie/ATT 弹窗文案进行 A/B 测试的轮换间隔', 5, 84, {
        min: 3, max: 30, step: 1, learningDataPoints: 34200,
        adjustHistory: [
          { time: '5天前', from: '14', to: '7', reason: 'AI发现7天可获统计显著性结论，缩短轮换周期' },
        ],
      }),
      createParam('att_prompt_delay', 'ATT 授权弹窗延迟', 3, '秒', 'App 首次启动后延迟多少秒展示 ATT 授权请求，过早弹窗降低同意率', 5, 79, {
        min: 0, max: 30, step: 1, learningDataPoints: 52700,
        adjustHistory: [
          { time: '4天前', from: '0', to: '3', reason: 'US市场实验表明3秒延迟提升同意率+4.2%' },
          { time: '2周前', from: '5', to: '0', reason: '测试即时弹窗影响，AI回滚至0秒' },
        ],
      }),
      createParam('consent_reminder_freq', '同意提醒频率', 90, '天', '对已拒绝用户重新展示隐私说明的间隔，不宜过频造成骚扰', 60, 76, {
        min: 30, max: 180, step: 15, learningDataPoints: 18900,
        adjustHistory: [
          { time: '1周前', from: '60', to: '90', reason: '过频提醒导致用户负面情绪，AI拉长间隔' },
        ],
      }),
    ],
  },
  {
    title: '数据删除自动化',
    icon: <Database size={15} />,
    params: [
      createParam('dsr_response_hours', '数据主体请求响应时限', 72, '小时', 'GDPR/CCPA 数据主体请求（删除/访问/携带）自动处理时限', 48, 91, {
        min: 24, max: 720, step: 24, learningDataPoints: 6700,
        adjustHistory: [
          { time: '2天前', from: '120', to: '72', reason: 'EU法规要求72小时内响应，AI自动收紧时限' },
        ],
      }),
      createParam('auto_purge_batch', '自动清除批次大小', 5000, '条/批', '每批次自动匿名化/删除超期数据的记录数，影响数据库负载', 3000, 87, {
        min: 1000, max: 20000, step: 1000, learningDataPoints: 14200,
        adjustHistory: [
          { time: '3天前', from: '10000', to: '5000', reason: '批次过大导致数据库读写延迟，AI拆小批次' },
        ],
      }),
      createParam('anonymize_threshold', '假名化触发阈值', 12, '个月', '用户数据超过此存储时长自动触发假名化处理', 12, 93, {
        min: 6, max: 24, step: 1, autoTuneEnabled: false, learningDataPoints: 8100,
        adjustHistory: [
          { time: '1周前', from: '18', to: '12', reason: '对齐GDPR最佳实践，手动收紧假名化阈值' },
        ],
      }),
    ],
  },
]

const learningStatus: AILearningStatus = {
  modelVersion: 'ComplianceNLP v3.0.1',
  lastTraining: '昨日 23:00',
  totalDataPoints: 284700,
  avgConfidence: 91.4,
  autoAdjustCount24h: 8,
  learningRate: '自适应',
  nextTraining: '今日 23:00',
  improvementRate: '+3.2%',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score, warn }: { score: number; warn?: boolean }) {
  const color = score >= 90 ? '#22c55e' : score >= 80 ? '#f59e0b' : '#ef4444'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace',
      background: `${color}18`, color, border: `1px solid ${color}40`,
    }}>
      {score}/100 {warn ? '⚠️' : score >= 90 ? '✓' : ''}
    </span>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ color: '#e8365d' }}>{icon}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px', ...style,
    }}>
      {children}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = { '合规': '#22c55e', '警告': '#f59e0b', '待整改': '#ef4444', '完成': '#22c55e', '待处理': '#f59e0b' }
  const color = map[status] ?? '#6b7280'
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 600,
      background: `${color}18`, color, border: `1px solid ${color}40`,
    }}>{status}</span>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function Tab0Overview() {
  const regulations = [
    {
      name: 'GDPR', flag: '🇪🇺', score: 82, warn: true,
      issues: ['Cookie banner需更新 (DE)', '数据保留期超标 (FR)'],
      regions: '德国 · 法国 · 英国 · 意大利', color: '#3b82f6',
    },
    {
      name: 'CCPA', flag: '🇺🇸', score: 91, warn: false,
      issues: [],
      regions: '加利福尼亚州', color: '#22c55e',
    },
    {
      name: 'ATT', flag: '🍎', score: 78, warn: true,
      issues: ['iOS 归因缺口 65.8%', 'IDFA 采集率偏低'],
      regions: 'iOS 全球市场', color: '#f59e0b',
    },
    {
      name: 'PIPL', flag: '🇨🇳', score: 96, warn: false,
      issues: [],
      regions: '中国大陆', color: '#22c55e',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Regulation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {regulations.map(r => (
          <Card key={r.name} style={{ borderTop: `3px solid ${r.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: 0.5 }}>{r.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.flag} {r.regions}</div>
              </div>
              <ScoreBadge score={r.score} warn={r.warn} />
            </div>
            {r.issues.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {r.issues.map((issue, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: '0.72rem', color: '#f59e0b' }}>
                    <AlertTriangle size={11} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#22c55e' }}>
                <CheckCircle size={12} />
                <span>无待整改事项</span>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Radar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <SectionTitle icon={<TrendingUp size={15} />} title="合规维度雷达图" />
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Radar name="GDPR" dataKey="GDPR" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="CCPA" dataKey="CCPA" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} />
              <Radar name="ATT" dataKey="ATT" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} />
              <Radar name="PIPL" dataKey="PIPL" stroke="#e8365d" fill="#e8365d" fillOpacity={0.10} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['GDPR', '#3b82f6'], ['CCPA', '#22c55e'], ['ATT', '#f59e0b'], ['PIPL', '#e8365d']].map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color as string }} />
                {name}
              </div>
            ))}
          </div>
        </Card>

        {/* Events */}
        <Card>
          <SectionTitle icon={<AlertCircle size={15} />} title="近期合规事件" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {complianceEvents.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 10px', borderRadius: 8, background: `${ev.color}08`, border: `1px solid ${ev.color}22` }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {ev.status === '完成'
                    ? <CheckCircle size={13} color="#22c55e" />
                    : <AlertTriangle size={13} color="#f59e0b" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{ev.type}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{ev.detail}</div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>{ev.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <SectionTitle icon={<FileText size={15} />} title="合规截止日历" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {complianceCalendar.map((item, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: `${item.color}0a`, border: `1px solid ${item.color}30` }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'monospace' }}>{item.date}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4, marginBottom: 6 }}>{item.event}</div>
              <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, background: `${item.color}20`, color: item.color }}>
                紧急度：{item.urgency}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Tab1GDPR() {
  const dsrData = [
    { label: '已收到', value: 12, color: '#3b82f6' },
    { label: '已完成', value: 10, color: '#22c55e' },
    { label: '待处理', value: 2, color: '#f59e0b' },
  ]

  const remediation = [
    { id: 1, market: '🇩🇪 德国', issue: 'Cookie banner 需更新至最新 TCF 2.2 标准', severity: '高', owner: '法务合规组', due: '2026-04-22' },
    { id: 2, market: '🇫🇷 法国', issue: '数据保留期需从 24 个月降至 18 个月 (CNIL 指导)', severity: '中', owner: '数据工程组', due: '2026-05-01' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'EU Cookie 同意率', value: '71.4%', sub: '目标 ≥ 75%', icon: <Eye size={16} />, color: '#f59e0b', warn: true },
          { label: '数据主体请求', value: '12 件', sub: '本月收到', icon: <Users size={16} />, color: '#3b82f6', warn: false },
          { label: '数据处理协议', value: '8 / 10', sub: '已签署 DPA', icon: <FileText size={16} />, color: '#22c55e', warn: false },
          { label: '数据最小化审计', value: '3天前', sub: '上次执行', icon: <RefreshCw size={16} />, color: '#22c55e', warn: false },
        ].map((item, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.warn ? '#f59e0b' : 'var(--text-primary)', fontFamily: 'monospace' }}>{item.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <SectionTitle icon={<Users size={15} />} title="数据主体请求（DSR）分布" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dsrData} barSize={36}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {dsrData.map((d, i) => (
                  <rect key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle icon={<AlertTriangle size={15} />} title="待整改事项" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {remediation.map(item => (
              <div key={item.id} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={13} color="#f59e0b" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.market}</span>
                  </div>
                  <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, background: item.severity === '高' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: item.severity === '高' ? '#ef4444' : '#f59e0b' }}>
                    {item.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{item.issue}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span>负责人：{item.owner}</span>
                  <span>截止：{item.due}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Tab2ATT() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[
          { label: 'IDFA 缺失率', value: '65.8%', sub: '全球 iOS 平均', color: '#ef4444', icon: <XCircle size={16} /> },
          { label: 'CAPI 补偿归因', value: '+38%', sub: '已恢复归因比例', color: '#22c55e', icon: <TrendingUp size={16} /> },
          { label: 'SKAdNetwork 贡献', value: '22%', sub: '转化归因占比', color: '#3b82f6', icon: <Zap size={16} /> },
          { label: 'AI 可再恢复', value: '+12%', sub: '增强型转化+CAPI', color: '#8b5cf6', icon: <Zap size={16} /> },
        ].map((item, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* ATT by market */}
        <Card>
          <SectionTitle icon={<Globe size={15} />} title="ATT 同意率 — 分市场" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attMarketData} layout="vertical" barSize={18}>
              <XAxis type="number" domain={[0, 60]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="market" width={70} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'ATT同意率']} />
              <Bar dataKey="rate" radius={[0, 6, 6, 0]} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Recommendation */}
        <Card>
          <SectionTitle icon={<Zap size={15} />} title="AI 模型建议 — 归因恢复" />
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={14} color="#8b5cf6" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8b5cf6' }}>AI 推荐方案</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>
              启用<strong> 增强型转化 (Enhanced Conversions)</strong> + <strong>Meta Conversions API</strong>，
              配合模型驱动归因 (MDA)，可再恢复约 <span style={{ color: '#22c55e', fontWeight: 700 }}>+12%</span> 的归因缺口。
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '当前 IDFA 覆盖', value: 34.2, total: 100, color: '#f59e0b' },
              { label: 'CAPI 补偿后', value: 54.7, total: 100, color: '#22c55e' },
              { label: 'AI方案激活后（预估）', value: 66.7, total: 100, color: '#8b5cf6' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.value}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span>驱动模型：</span>
            <ModelBadge name="MetaCAPI-Attribution" color="#22c55e" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function Tab3DataGovernance() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Data Inventory */}
      <Card>
        <SectionTitle icon={<Database size={15} />} title="数据资产清单" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                {['数据类型', '采集字段', '存储位置', '访问权限', '保留期', '状态'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataInventory.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.category}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.collected}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.stored}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.access}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{row.retention}</td>
                  <td style={{ padding: '10px 12px' }}><StatusPill status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* 3rd Party Audit */}
        <Card>
          <SectionTitle icon={<Lock size={15} />} title="第三方数据共享审计" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {thirdPartyAudit.map((v, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'var(--bg-primary, rgba(0,0,0,0.03))', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{v.vendor}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{v.type} · {v.data.slice(0, 22)}…</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusPill status={v.status} />
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>DPA: {v.dpa}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cross-border + Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle icon={<Globe size={15} />} title="跨境数据传输状态" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {crossBorderTransfer.map((item, i) => {
                const riskColor = item.risk === '低' ? '#22c55e' : item.risk === '中' ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, border: `1px solid ${riskColor}25`, background: `${riskColor}05` }}>
                    <div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.from} → {item.to}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.mechanism}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: riskColor, fontWeight: 600 }}>风险:{item.risk}</span>
                      <StatusPill status={item.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle icon={<CheckCircle size={15} />} title="Privacy by Design 检查清单" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {privacyChecklist.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.73rem' }}>
                  {item.done
                    ? <CheckCircle size={13} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
                    : <XCircle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ color: item.done ? 'var(--text-secondary)' : '#ef4444' }}>{item.item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = ['合规总览', 'GDPR管理', 'ATT归因影响', '数据治理']

export default function ComplianceHub() {
  const [activeTab, setActiveTab] = useState(0)

  useRegisterAIConfig(complianceConfigGroups, learningStatus, '全球合规中心')

  const overallScore = 86
  const ring = (score: number) => {
    const circumference = 2 * Math.PI * 42
    const offset = circumference - (score / 100) * circumference
    const color = score >= 90 ? '#22c55e' : score >= 80 ? '#f59e0b' : '#ef4444'
    return { circumference, offset, color }
  }
  const { circumference, offset, color: ringColor } = ring(overallScore)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px', minHeight: '100vh' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Shield size={22} color="#e8365d" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>全球合规中心</h1>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GDPR · CCPA · ATT · PIPL · 全球广告数据合规治理</div>
        </div>
        {/* Model Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>驱动模型：</span>
          {(['PrivacySafe-Targeting', 'MetaCAPI-Attribution', 'ComplianceNLP', 'FraudDetector-XGB'] as const).map(m => (
            <ModelBadge key={m} name={m} color="#e8365d" />
          ))}
        </div>
      </div>

      {/* Health Score Banner */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          {/* Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative', width: 100, height: 100 }}>
              <svg width={100} height={100} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={50} cy={50} r={42} fill="none" stroke="var(--border)" strokeWidth={8} />
                <circle
                  cx={50} cy={50} r={42} fill="none"
                  stroke={ringColor} strokeWidth={8}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: ringColor, fontFamily: 'monospace', lineHeight: 1 }}>{overallScore}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: 2 }}>/100</div>
              </div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>综合合规健康度</div>
          </div>

          {/* Score Breakdown */}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { name: 'GDPR', score: 82, warn: true, note: '2项待整改' },
              { name: 'CCPA', score: 91, warn: false, note: '全部达标' },
              { name: 'ATT', score: 78, warn: true, note: '归因缺口' },
              { name: 'PIPL', score: 96, warn: false, note: '全部达标' },
            ].map(item => {
              const c = item.score >= 90 ? '#22c55e' : item.score >= 80 ? '#f59e0b' : '#ef4444'
              return (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: c, fontFamily: 'monospace' }}>{item.score}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem' }}>
                    {item.warn
                      ? <AlertTriangle size={10} color="#f59e0b" />
                      : <CheckCircle size={10} color="#22c55e" />}
                    <span style={{ color: item.warn ? '#f59e0b' : '#22c55e' }}>{item.note}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick stats */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: '待处理 DSR', value: '2', color: '#f59e0b' },
              { label: '待整改项', value: '3', color: '#ef4444' },
              { label: '本月自动删除', value: '3,284', color: '#22c55e' },
              { label: 'CAPI 补偿率', value: '38%', color: '#3b82f6' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s',
              background: activeTab === i ? '#e8365d' : 'transparent',
              color: activeTab === i ? '#fff' : 'var(--text-muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && <Tab0Overview />}
      {activeTab === 1 && <Tab1GDPR />}
      {activeTab === 2 && <Tab2ATT />}
      {activeTab === 3 && <Tab3DataGovernance />}
    </div>
  )
}
