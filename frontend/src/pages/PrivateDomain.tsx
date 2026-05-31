import { useState } from 'react'
import { Users, MessageCircle, ShoppingBag, TrendingUp, Crown, Star, Heart, Smartphone, UserCheck, Send, Award, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

// ── AI Config ──────────────────────────────────────────────────────────────────
const privateDomainAIGroups: AIConfigGroup[] = [
  {
    name: '社群运营策略',
    icon: <MessageCircle size={15} />,
    params: [
      createParam('push_frequency', '社群推送频率', 3, '次/天', '控制每日社群消息推送次数, 过高易造成用户反感, 过低则触达不足', 3, 88, { min: 1, max: 8, step: 1, learningDataPoints: 52000, adjustHistory: [
        { time: '昨日', from: '4', to: '3', reason: '检测到高频推送导致退群率上升, AI自动降频' },
        { time: '3天前', from: '2', to: '4', reason: '大促预热期, AI提升推送频率加强触达' },
      ] }),
      createParam('coupon_intensity', '优惠券力度', 15, '%', '社群专属优惠券折扣力度, 平衡利润与转化率', 15, 85, { min: 5, max: 30, step: 1, learningDataPoints: 38000, adjustHistory: [
        { time: '2小时前', from: '10', to: '15', reason: '复购率下降, AI提升优惠力度刺激转化' },
      ] }),
      createParam('segment_strategy', '分群策略', 'RFM模型', '', '社群用户分群方式, 影响精细化运营效果', 'AI聚类', 82, { type: 'select', options: ['标签分群', 'RFM模型', 'AI聚类'] }),
      createParam('silent_reactivate', '沉默唤醒周期', 7, '天', '用户沉默超过此天数触发唤醒策略, 过早唤醒浪费资源, 过晚则用户流失', 7, 86, { min: 3, max: 30, step: 1, learningDataPoints: 41000, adjustHistory: [
        { time: '1天前', from: '14', to: '7', reason: '沉默用户流失加速, AI缩短唤醒周期' },
      ] }),
    ],
  },
  {
    name: '会员运营配置',
    icon: <Crown size={15} />,
    params: [
      createParam('upgrade_threshold', '升级消费门槛', 500, '¥', '会员等级升级所需累计消费金额, 影响会员晋升速度', 500, 84, { min: 200, max: 2000, step: 50, learningDataPoints: 62000, adjustHistory: [
        { time: '昨日', from: '600', to: '500', reason: '新客转化率偏低, AI降低门槛促进升级' },
      ] }),
      createParam('points_multiplier', '积分倍率', 2.0, 'x', '消费积分倍率, 影响会员活跃度和忠诚度', 2.0, 87, { min: 1.0, max: 5.0, step: 0.5, learningDataPoints: 55000, adjustHistory: [
        { time: '2天前', from: '1.5', to: '2.0', reason: '积分兑换率下降, AI提升倍率增强吸引力' },
      ] }),
      createParam('churn_warning', '流失预警天数', 30, '天', '会员超过此天数未消费则标记为流失预警, 触发挽留策略', 30, 90, { min: 14, max: 90, step: 1, learningDataPoints: 48000, adjustHistory: [
        { time: '昨日', from: '45', to: '30', reason: '流失会员召回成功率随时间急剧下降, AI缩短预警窗口' },
      ] }),
      createParam('birthday_bonus', '生日礼遇力度', 20, '%', '会员生日专属折扣力度, 提升情感连接和复购', 20, 83, { min: 10, max: 50, step: 5, learningDataPoints: 32000, adjustHistory: [
        { time: '3天前', from: '15', to: '20', reason: '生日营销ROI表现优异, AI提升力度' },
      ] }),
    ],
  },
]

const privateDomainLearningStatus: AILearningStatus = {
  modelVersion: 'v1.8.0-private-domain',
  lastTraining: '1小时前',
  totalDataPoints: 680000,
  avgConfidence: 86,
  autoAdjustCount24h: 28,
  learningRate: '0.003',
  nextTraining: '30分钟后',
  improvementRate: '+4.2%',
}

// ── Static Data ────────────────────────────────────────────────────────────────

const tabs = ['社群管理', '会员CRM', '小程序数据', '企微导购', '积分兑换', '复购激活', '裂变增长', 'SCRM分析']

const kpiCards = [
  { label: '企微好友总数', value: '28.5万', icon: Users, color: '#e8365d' },
  { label: '社群总数', value: '1,842个', icon: MessageCircle, color: '#8b5cf6' },
  { label: '月复购率', value: '34.8%', icon: TrendingUp, color: '#22c55e' },
  { label: '私域GMV占比', value: '18.6%', icon: ShoppingBag, color: '#f59e0b' },
]

// Tab 1: 社群管理
const groupData = [
  { name: '玛丽黛佳VIP1群', platform: '企微群', members: 486, activeRate: '72.3%', gmv: '¥38,600', status: '活跃' },
  { name: '新品体验官群', platform: '企微群', members: 328, activeRate: '68.5%', gmv: '¥25,200', status: '活跃' },
  { name: '唇釉爱好者群', platform: '微信群', members: 452, activeRate: '55.2%', gmv: '¥18,900', status: '一般' },
  { name: '护肤达人交流群', platform: '企微群', members: 395, activeRate: '61.8%', gmv: '¥22,400', status: '活跃' },
  { name: '美妆学院1期', platform: '微信群', members: 267, activeRate: '42.6%', gmv: '¥12,300', status: '一般' },
  { name: '会员日福利群', platform: '企微群', members: 512, activeRate: '78.1%', gmv: '¥45,800', status: '活跃' },
  { name: '素颜养肤群', platform: '微信群', members: 189, activeRate: '28.4%', gmv: '¥5,600', status: '沉默' },
  { name: '彩妆教程互动群', platform: '企微群', members: 341, activeRate: '58.9%', gmv: '¥16,700', status: '一般' },
]

const groupMessageTrend = [
  { date: '03/30', 消息数: 2840, 互动数: 1560 },
  { date: '03/31', 消息数: 3120, 互动数: 1780 },
  { date: '04/01', 消息数: 3560, 互动数: 2100 },
  { date: '04/02', 消息数: 2960, 互动数: 1620 },
  { date: '04/03', 消息数: 3280, 互动数: 1890 },
  { date: '04/04', 消息数: 3680, 互动数: 2240 },
  { date: '04/05', 消息数: 3420, 互动数: 1960 },
]

// Tab 2: 会员CRM
const memberStats = [
  { label: '总会员数', value: '52.8万', icon: Users, color: '#e8365d' },
  { label: '本月新增', value: '1.2万', icon: UserCheck, color: '#8b5cf6' },
  { label: '活跃会员', value: '18.6万', icon: Heart, color: '#22c55e' },
  { label: '沉睡会员', value: '8.4万', icon: Star, color: '#f59e0b' },
]

const memberLevelPie = [
  { name: '普通会员', value: 58, color: '#ffb4c6' },
  { name: '银卡', value: 25, color: '#ff7a95' },
  { name: '金卡', value: 12, color: '#e8365d' },
  { name: '钻石', value: 5, color: '#8b5cf6' },
]

const repurchaseByLevel = [
  { level: '普通', 复购率: 18 },
  { level: '银卡', 复购率: 32 },
  { level: '金卡', 复购率: 48 },
  { level: '钻石', 复购率: 67 },
]

const ltvData = [
  { level: '普通会员', ltv: '¥280' },
  { level: '银卡会员', ltv: '¥680' },
  { level: '金卡会员', ltv: '¥1,450' },
  { level: '钻石会员', ltv: '¥3,800' },
]

// Tab 3: 小程序数据
const miniProgramKpis = [
  { label: '今日UV', value: '3.2万', icon: Smartphone, color: '#e8365d' },
  { label: '加购率', value: '12.5%', icon: ShoppingBag, color: '#8b5cf6' },
  { label: '转化率', value: '4.8%', icon: TrendingUp, color: '#22c55e' },
  { label: '客单价', value: '¥186', icon: Award, color: '#f59e0b' },
]

const miniProgramVisitTrend = [
  { date: '03/30', UV: 28600, PV: 86400 },
  { date: '03/31', UV: 30200, PV: 91800 },
  { date: '04/01', UV: 35400, PV: 108600 },
  { date: '04/02', UV: 29800, PV: 88200 },
  { date: '04/03', UV: 31600, PV: 95400 },
  { date: '04/04', UV: 34200, PV: 104800 },
  { date: '04/05', UV: 32000, PV: 97600 },
]

const hotProducts = [
  { name: '骑士唇釉#405复古红棕', views: 12800, addCart: 1680, sales: 620, rate: '4.8%' },
  { name: '原色无瑕粉底液 自然色', views: 10600, addCart: 1420, sales: 540, rate: '5.1%' },
  { name: '小蘑菇气垫 象牙白', views: 9800, addCart: 1180, sales: 480, rate: '4.9%' },
  { name: '睫毛膏 纤长卷翘款', views: 8400, addCart: 920, sales: 380, rate: '4.5%' },
  { name: '眼影盘 落日余晖12色', views: 7600, addCart: 860, sales: 340, rate: '4.5%' },
]

// Tab 4: 企微导购
const guideKpis = [
  { label: '导购人数', value: '186人', icon: Users, color: '#e8365d' },
  { label: '人均客户数', value: '1,532', icon: UserCheck, color: '#8b5cf6' },
  { label: '日均触达率', value: '45.2%', icon: Send, color: '#22c55e' },
  { label: '转化率', value: '8.6%', icon: TrendingUp, color: '#f59e0b' },
]

const guidePerformance = [
  { name: '李美琪', clients: 2180, touches: 986, amount: '¥128,600', rate: '12.4%', change: 'up' },
  { name: '张晓雯', clients: 2050, touches: 924, amount: '¥115,200', rate: '11.8%', change: 'up' },
  { name: '王芳芳', clients: 1920, touches: 865, amount: '¥98,400', rate: '10.2%', change: 'down' },
  { name: '陈思思', clients: 1860, touches: 842, amount: '¥92,800', rate: '9.6%', change: 'up' },
  { name: '刘婷婷', clients: 1780, touches: 798, amount: '¥86,500', rate: '9.1%', change: 'same' },
  { name: '赵小颖', clients: 1650, touches: 756, amount: '¥78,200', rate: '8.4%', change: 'down' },
  { name: '孙雅雅', clients: 1520, touches: 685, amount: '¥72,600', rate: '7.8%', change: 'up' },
  { name: '周丽丽', clients: 1480, touches: 668, amount: '¥68,900', rate: '7.2%', change: 'same' },
]

const top10GuideBar = [
  { name: '李美琪', 成交额: 128600 },
  { name: '张晓雯', 成交额: 115200 },
  { name: '王芳芳', 成交额: 98400 },
  { name: '陈思思', 成交额: 92800 },
  { name: '刘婷婷', 成交额: 86500 },
  { name: '赵小颖', 成交额: 78200 },
  { name: '孙雅雅', 成交额: 72600 },
  { name: '周丽丽', 成交额: 68900 },
  { name: '黄珊珊', 成交额: 62400 },
  { name: '吴佳佳', 成交额: 58100 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  '活跃': '#22c55e',
  '一般': '#f59e0b',
  '沉默': '#94a3b8',
}

const CHART_COLORS = ['#e8365d', '#ff7a95', '#ffb4c6', '#8b5cf6', '#22c55e', '#f59e0b']

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: 14,
  border: '1px solid var(--border-light)',
  padding: '18px 22px',
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function PrivateDomain() {
  useRegisterAIConfig(privateDomainAIGroups, privateDomainLearningStatus, '私域运营')
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div style={{ padding: '24px 28px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>私域运营中心</h1>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>企微社群 · 会员CRM · 小程序 · 导购管理</p>
      </div>

      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="UserLTV-Predictor" color="#10b981" />
        <ModelBadge name="AudienceCluster-KM" color="#8b5cf6" />
        <ModelBadge name="Lookalike-Expander" color="#e8365d" />
        <ModelBadge name="SentimentAnalyzer" color="#8b5cf6" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map((kpi) => (
          <div key={kpi.label} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{kpi.value}</div>
              </div>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: kpi.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, transition: 'all .2s',
              background: activeTab === i ? '#e8365d' : 'transparent',
              color: activeTab === i ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 0 && <TabGroupManagement />}
      {activeTab === 1 && <TabMemberCRM />}
      {activeTab === 2 && <TabMiniProgram />}
      {activeTab === 3 && <TabGuide />}
      {activeTab === 4 && <TabPointsExchange />}
      {activeTab === 5 && <TabRepurchaseActivation />}
      {activeTab === 6 && <TabViralGrowth />}
      {activeTab === 7 && <TabSCRM />}
    </div>
  )
}

// ── Tab 1: 社群管理 ────────────────────────────────────────────────────────────

function TabGroupManagement() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Groups Table */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>社群列表</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['群名称', '平台', '群人数', '7日活跃率', '本月GMV', '状态'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupData.map((g) => (
              <tr key={g.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{g.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 12,
                    background: g.platform === '企微群' ? '#e8365d18' : '#8b5cf618',
                    color: g.platform === '企微群' ? '#e8365d' : '#8b5cf6',
                  }}>{g.platform}</span>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{g.members}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{g.activeRate}</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{g.gmv}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                    background: statusColor[g.status] + '18',
                    color: statusColor[g.status],
                  }}>{g.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Group Message Trend */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>社群消息量趋势（近7日）</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={groupMessageTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="消息数" stroke="#e8365d" fill="#e8365d" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="互动数" stroke="#ff7a95" fill="#ff7a95" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Tab 2: 会员CRM ─────────────────────────────────────────────────────────────

function TabMemberCRM() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Member Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {memberStats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Pie: 会员等级分布 */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>会员等级分布</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={memberLevelPie}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={{ stroke: 'var(--text-tertiary)' }}
                style={{ fontSize: 12 }}
              >
                {memberLevelPie.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: 各等级复购率 */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>各等级复购率</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={repurchaseByLevel}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="level" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} unit="%" />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="复购率" radius={[6, 6, 0, 0]}>
                {repurchaseByLevel.map((_, idx) => (
                  <Cell key={idx} fill={CHART_COLORS[idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 复购价值 Table */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>会员生命周期复购价值</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>会员等级</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-tertiary)', fontWeight: 500 }}>生命周期价值</th>
            </tr>
          </thead>
          <tbody>
            {ltvData.map((row) => (
              <tr key={row.level} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{row.level}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#e8365d', fontWeight: 700, fontSize: 15 }}>{row.ltv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab 3: 小程序数据 ──────────────────────────────────────────────────────────

function TabMiniProgram() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {miniProgramKpis.map((kpi) => (
          <div key={kpi.label} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: kpi.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{kpi.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{kpi.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visit Trend */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>7日访问量趋势</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={miniProgramVisitTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="UV" stroke="#e8365d" strokeWidth={2} dot={{ fill: '#e8365d', r: 3 }} />
            <Line type="monotone" dataKey="PV" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hot Products */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>热销商品TOP5</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['商品名', '浏览量', '加购数', '成交数', '转化率'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hotProducts.map((p, idx) => (
              <tr key={p.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 20, height: 20, borderRadius: 4, fontSize: 11, fontWeight: 700, marginRight: 8,
                    background: idx < 3 ? '#e8365d' : 'var(--border-light)',
                    color: idx < 3 ? '#fff' : 'var(--text-tertiary)',
                  }}>{idx + 1}</span>
                  {p.name}
                </td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.views.toLocaleString()}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{p.addCart.toLocaleString()}</td>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{p.sales.toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#22c55e', fontWeight: 600 }}>{p.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab 4: 企微导购 ────────────────────────────────────────────────────────────

function TabGuide() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {guideKpis.map((kpi) => (
          <div key={kpi.label} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: kpi.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{kpi.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{kpi.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Guide Performance Table */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>导购绩效排名</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['导购姓名', '客户数', '本月触达', '成交额', '转化率', '排名变化'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guidePerformance.map((g) => (
              <tr key={g.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 500 }}>{g.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{g.clients.toLocaleString()}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{g.touches.toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#e8365d', fontWeight: 600 }}>{g.amount}</td>
                <td style={{ padding: '12px', color: '#22c55e', fontWeight: 600 }}>{g.rate}</td>
                <td style={{ padding: '12px' }}>
                  {g.change === 'up' && <ChevronUp size={16} color="#22c55e" />}
                  {g.change === 'down' && <ChevronDown size={16} color="#e8365d" />}
                  {g.change === 'same' && <Minus size={16} color="#94a3b8" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOP10 Guide Bar Chart */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: 'var(--text-primary)' }}>TOP10导购成交额</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10GuideBar} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} tickFormatter={(v: number) => `¥${(v / 10000).toFixed(1)}万`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} width={70} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }}
              formatter={(value: number) => [`¥${value.toLocaleString()}`, '成交额']}
            />
            <Bar dataKey="成交额" radius={[0, 6, 6, 0]}>
              {top10GuideBar.map((_, idx) => (
                <Cell key={idx} fill={idx < 3 ? '#e8365d' : idx < 6 ? '#ff7a95' : '#ffb4c6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Tab 5: 积分兑换 ────────────────────────────────────────────────────────────
const pointsExData = [
  { name: '100积分抵¥1券', used: 482600, stock: '不限', rate: '36.8%' },
  { name: '唇釉小样(10ml)', used: 124800, stock: '5,200份', rate: '62.4%' },
  { name: '限定礼袋', used: 48200, stock: '2,000份', rate: '89.2%' },
  { name: '生日礼盒', used: 28600, stock: '按需', rate: '54.6%' },
  { name: '积分抽奖', used: 386000, stock: '不限', rate: '28.4%' },
]

const pointsTrendData = [
  { date: '3/30', 新增: 2640, 消耗: 780 },
  { date: '3/31', 新增: 2880, 消耗: 920 },
  { date: '4/1', 新增: 3420, 消耗: 1080 },
  { date: '4/2', 新增: 2760, 消耗: 820 },
  { date: '4/3', 新增: 3180, 消耗: 960 },
  { date: '4/4', 新增: 3560, 消耗: 1140 },
  { date: '4/5', 新增: 2842, 消耗: 890 },
]

function TabPointsExchange() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: '今日新增积分', value: '2,842万', color: '#f59e0b' },
          { label: '今日消耗积分', value: '890万', color: '#e8365d' },
          { label: '待兑换积分总量', value: '18.6亿', color: '#8b5cf6' },
          { label: '积分兑换率', value: '24.8%', color: '#22c55e' },
        ].map(k => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>积分每日流水</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pointsTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="新增" fill="#22c55e" radius={[3,3,0,0]} name="新增(万分)" />
              <Bar dataKey="消耗" fill="#e8365d" radius={[3,3,0,0]} name="消耗(万分)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>会员升降卡</h3>
          {[
            { label: '本月升卡', value: '2,960人', color: '#22c55e' },
            { label: '本月降卡', value: '480人', color: '#ef4444' },
            { label: '净升卡', value: '+2,480人', color: '#3b82f6' },
            { label: '平均积分余额', value: '3,520分', color: '#f59e0b' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
              <span style={{ color: r.color, fontWeight: 700 }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>积分兑换商品排行</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['兑换商品', '本月使用量', '库存状态', '兑换率'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pointsExData.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.used.toLocaleString()}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.stock}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: r.rate, background: '#e8365d', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#e8365d', fontWeight: 600 }}>{r.rate}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab 6: 复购激活 ────────────────────────────────────────────────────────────
const rfmDataPD = [
  { segment: '冠军客户', users: '2.3万', gmv: '¥284万', r: 5, f: 5, m: 5, color: '#f59e0b', strategy: '专属礼遇+新品先享' },
  { segment: '忠诚客户', users: '8.6万', gmv: '¥186万', r: 4, f: 4, m: 4, color: '#e8365d', strategy: '会员权益升级+专属折扣' },
  { segment: '潜力客户', users: '24.8万', gmv: '¥124万', r: 3, f: 3, m: 3, color: '#8b5cf6', strategy: '复购提醒+搭配推荐' },
  { segment: '流失预警', users: '28.6万', gmv: '-', r: 1, f: 2, m: 2, color: '#ef4444', strategy: 'AI召回+专属优惠券' },
  { segment: '已流失', users: '52.4万', gmv: '-', r: 1, f: 1, m: 1, color: '#94a3b8', strategy: '情感唤醒+超值折扣' },
]

const repurchaseTrendPD = [
  { month: '10月', 复购率: 28.4 }, { month: '11月', 复购率: 29.8 },
  { month: '12月', 复购率: 31.2 }, { month: '1月', 复购率: 30.6 },
  { month: '2月', 复购率: 32.8 }, { month: '3月', 复购率: 33.4 },
  { month: '4月', 复购率: 34.8 },
]

function TabRepurchaseActivation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: '月复购率', value: '34.8%', color: '#22c55e' },
          { label: '平均复购间隔', value: '38天', color: '#e8365d' },
          { label: '二购转化率', value: '41.6%', color: '#8b5cf6' },
          { label: '复购GMV贡献', value: '¥682万', color: '#f59e0b' },
        ].map(k => (
          <div key={k.label} style={{ ...cardStyle, textAlign: 'center' as const }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>复购率趋势</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={repurchaseTrendPD}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} domain={[20, 40]} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`${v}%`, '复购率']} />
              <Line type="monotone" dataKey="复购率" stroke="#e8365d" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>召回活动实效</h3>
          {[
            { name: '30天沉睡唤醒', rate: '15.4%', gmv: '¥48.6万', status: '进行中' },
            { name: '60天失联召回', rate: '7.2%', gmv: '¥12.4万', status: '进行中' },
            { name: 'VIP专属礼召回', rate: '-', gmv: '-', status: '计划中' },
          ].map(c => (
            <div key={c.name} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-light)', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>{c.rate}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>GMV: {c.gmv} · {c.status}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>RFM用户分层与运营策略</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['分层', 'R', 'F', 'M', '用户数', '贡献GMV', '推荐策略'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rfmDataPD.map(r => (
              <tr key={r.segment} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: r.color, display: 'inline-block' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.segment}</span>
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' as const }}><span style={{ padding: '2px 8px', borderRadius: 4, background: `rgba(232,54,93,${r.r * 0.1})` }}>{r.r}</span></td>
                <td style={{ padding: '12px', textAlign: 'center' as const }}><span style={{ padding: '2px 8px', borderRadius: 4, background: `rgba(34,197,94,${r.f * 0.1})` }}>{r.f}</span></td>
                <td style={{ padding: '12px', textAlign: 'center' as const }}><span style={{ padding: '2px 8px', borderRadius: 4, background: `rgba(245,158,11,${r.m * 0.1})` }}>{r.m}</span></td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.users}</td>
                <td style={{ padding: '12px', color: '#e8365d', fontWeight: 700 }}>{r.gmv}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: 12 }}>{r.strategy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab 7: 裂变增长 ────────────────────────────────────────────────────────────
const viralProgramsPD = [
  { name: '老带新双倍奖励', participants: 48600, success: 28400, rate: '22.8%', cost: '¥18/单', roi: '4.8x' },
  { name: '分享得积分', participants: 164000, success: 124000, rate: '25.5%', cost: '¥8/单', roi: '6.2x' },
  { name: 'KOC专属推广码', participants: 8600, success: 68400, rate: '24.1%', cost: '¥12/单', roi: '5.4x' },
  { name: '拼团优惠', participants: 12400, success: 8200, rate: '21.2%', cost: '¥6/单', roi: '7.2x' },
]

const viralTrendPD = [
  { date: '3/30', 裂变新用户: 1840, 裂变GMV: 28400 },
  { date: '3/31', 裂变新用户: 2120, 裂变GMV: 32600 },
  { date: '4/1', 裂变新用户: 2840, 裂变GMV: 42800 },
  { date: '4/2', 裂变新用户: 2460, 裂变GMV: 38200 },
  { date: '4/3', 裂变新用户: 3180, 裂变GMV: 48600 },
  { date: '4/4', 裂变新用户: 2960, 裂变GMV: 44800 },
  { date: '4/5', 裂变新用户: 2840, 裂变GMV: 42800 },
]

function TabViralGrowth() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: '今日裂变新用户', value: '2,840', color: '#e8365d' },
          { label: '老带新成功率', value: '22.4%', color: '#22c55e' },
          { label: '病毒系数K', value: '0.28', color: '#f59e0b' },
          { label: '裂变GMV贡献', value: '¥48.6万', color: '#8b5cf6' },
        ].map(k => (
          <div key={k.label} style={{ ...cardStyle, textAlign: 'center' as const }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>裂变趋势（近7日）</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={viralTrendPD}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="裂变新用户" fill="#e8365d" radius={[3,3,0,0]} />
            <Bar dataKey="裂变GMV" fill="#8b5cf6" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>裂变项目效果</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['项目名称', '参与人数', '成功数', '成功率', '单位成本', 'ROI'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viralProgramsPD.map(r => (
              <tr key={r.name} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.participants.toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#22c55e', fontWeight: 600 }}>{r.success.toLocaleString()}</td>
                <td style={{ padding: '12px', color: '#f59e0b', fontWeight: 700 }}>{r.rate}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.cost}</td>
                <td style={{ padding: '12px', color: '#e8365d', fontWeight: 700 }}>{r.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab 8: SCRM分析 ────────────────────────────────────────────────────────────
const scrmStats = [
  { label: '社群触达效率', value: '78.4%', desc: '企微群消息已读率', color: '#22c55e' },
  { label: '导购转化贡献', value: '22.6%', desc: '私域GMV中导购带来', color: '#e8365d' },
  { label: '自动化覆盖率', value: '64.2%', desc: '自动回复处理比例', color: '#8b5cf6' },
  { label: '用户满意度', value: '4.6/5', desc: '私域服务NPS评分', color: '#f59e0b' },
]

const scrmChannelPerf = [
  { channel: '企微1v1', reach: '18.6万', openRate: '82.4%', cvr: '12.6%', gmv: '¥124万' },
  { channel: '企微群', reach: '64.2万', openRate: '56.8%', cvr: '6.8%', gmv: '¥186万' },
  { channel: '小程序消息', reach: '42.8万', openRate: '68.4%', cvr: '8.4%', gmv: '¥98万' },
  { channel: '公众号推文', reach: '28.4万', openRate: '12.6%', cvr: '2.4%', gmv: '¥28万' },
]

function TabSCRM() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {scrmStats.map(k => (
          <div key={k.label} style={cardStyle}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{k.desc}</div>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>SCRM各渠道触达效果</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
              {['触达渠道', '触达量', '打开率', '转化率', 'GMV贡献'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scrmChannelPerf.map(r => (
              <tr key={r.channel} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.channel}</td>
                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{r.reach}</td>
                <td style={{ padding: '12px', color: '#22c55e', fontWeight: 600 }}>{r.openRate}</td>
                <td style={{ padding: '12px', color: '#f59e0b', fontWeight: 600 }}>{r.cvr}</td>
                <td style={{ padding: '12px', color: '#e8365d', fontWeight: 700 }}>{r.gmv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>私域旅程健康度</h3>
          {[
            { stage: '公域引流入私域', health: 88, color: '#22c55e' },
            { stage: '首次互动激活', health: 72, color: '#3b82f6' },
            { stage: '社群/1v1培育', health: 64, color: '#f59e0b' },
            { stage: '首单转化', health: 58, color: '#e8365d' },
            { stage: '复购留存', health: 48, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.stage} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.stage}</span>
                <span style={{ color: s.color, fontWeight: 700 }}>{s.health}</span>
              </div>
              <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.health}%`, background: s.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', color: 'var(--text-primary)' }}>AI智能体建议</h3>
          {[
            { level: '高', text: '会员日福利群活跃率78.1%，建议每月会员日扩展3个高活跃群', color: '#e8365d' },
            { level: '中', text: '素颜养肤群活跃率仅28.4%，AI建议更换运营话题至成分科普', color: '#f59e0b' },
            { level: '中', text: '企微1v1转化率12.6%远超群消息，建议扩大1v1触达覆盖', color: '#f59e0b' },
            { level: '低', text: '公众号打开率12.6%处于行业低位，建议结合小程序跳转提升', color: '#22c55e' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '10px 12px', background: `${r.color}08`, borderRadius: 8, border: `1px solid ${r.color}20`, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: r.color, marginRight: 8 }}>优先级[{r.level}]</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
