import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts'
import {
  Zap, TrendingUp, RefreshCw, Play, BarChart3, Users, Target, Star,
  ArrowRight, CheckCircle, Activity, Database, Cpu, Globe, Heart,
  Film, Megaphone, Eye, ShoppingCart, RotateCcw, Brain
} from 'lucide-react'
import ModelBadge from '../components/ModelBadge'
import { apiFetch } from '../lib/apiClient'

async function fetchTotal(path: string, body: unknown): Promise<number> {
  try {
    const r = await apiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await r.json()
    return json?.data?.total ?? 0
  } catch {
    return 0
  }
}

// ── 颜色 & 样式 ─────────────────────────────────────────────────────────────
const C = {
  prod:  '#ec4899',  // 内容生产
  dist:  '#f59e0b',  // 投放分发
  attr:  '#10b981',  // 效果归因
  conv:  '#6366f1',  // 用户转化
  priv:  '#e8365d',  // 私域沉淀
  data:  '#0ea5e9',  // 数据反哺
}
const tt = { backgroundColor: '#4a1025', border: '1px solid #9b1339', borderRadius: '8px', fontSize: '0.75rem', color: '#fff5f7' }

// ── 飞轮概览数据 ───────────────────────────────────────────────────────────
const flywheelKPIs = [
  { label: '飞轮转速', value: '8.4x', sub: '循环/月', change: '+1.2x', pos: true, icon: RotateCcw, color: C.data },
  { label: '内容→投放转化', value: '94.2%', sub: '自动化率', change: '+3.1%', pos: true, icon: Play, color: C.prod },
  { label: '投放→转化效率', value: '12.6%', sub: '综合CVR', change: '+1.8%', pos: true, icon: Target, color: C.dist },
  { label: '私域反哺率', value: '38.5%', sub: '二次触达占比', change: '+5.2%', pos: true, icon: Heart, color: C.priv },
  { label: '数据闭环时长', value: '4.2h', sub: '从曝光到反馈', change: '-0.6h', pos: true, icon: RefreshCw, color: C.attr },
  { label: 'AI自动决策率', value: '87.3%', sub: '无人工干预', change: '+6.4%', pos: true, icon: Brain, color: C.conv },
]

const flywheelTrend = [
  { month: '10月', 内容产量: 320, 投放素材: 280, 转化用户: 42000, ROI: 5.2 },
  { month: '11月', 内容产量: 380, 投放素材: 340, 转化用户: 51000, ROI: 5.8 },
  { month: '12月', 内容产量: 420, 投放素材: 390, 转化用户: 58000, ROI: 6.1 },
  { month: '1月',  内容产量: 460, 投放素材: 430, 转化用户: 62000, ROI: 6.4 },
  { month: '2月',  内容产量: 510, 投放素材: 480, 转化用户: 69000, ROI: 6.9 },
  { month: '3月',  内容产量: 580, 投放素材: 545, 转化用户: 78000, ROI: 7.4 },
  { month: '4月',  内容产量: 640, 投放素材: 612, 转化用户: 88000, ROI: 8.1 },
]

const stageFlow = [
  { stage: '内容生产', value: 640, color: C.prod, icon: Film },
  { stage: '投放分发', value: 612, color: C.dist, icon: Megaphone },
  { stage: '效果采集', value: 589, color: C.attr, icon: Eye },
  { stage: '用户转化', value: 88000, color: C.conv, icon: ShoppingCart, isUsers: true },
  { stage: '私域沉淀', value: 34000, color: C.priv, icon: Heart, isUsers: true },
  { stage: '数据反哺', value: 640, color: C.data, icon: Database },
]

// ── 内容生产管道 ─────────────────────────────────────────────────────────
const contentPipelineSteps = [
  { step: '趋势捕捉', desc: 'TrendForecaster 实时扫描抖音/小红书/快手热词, 识别上升话题', model: 'TrendForecaster', latency: '25ms', auto: true, volume: '2400条/日' },
  { step: '脚本生成', desc: 'ContentLLM-Beauty 基于趋势 + SKU数据自动生成种草/剧情/教程脚本', model: 'ContentLLM-Beauty', latency: '180ms', auto: true, volume: '380条/日' },
  { step: '素材制作', desc: 'ImageGen-BeautySDXL 生成产品图/Banner; VideoHighlight 剪辑爆点视频', model: 'ImageGen-BeautySDXL', latency: '2800ms', auto: true, volume: '240条/日' },
  { step: '合规审核', desc: 'ComplianceNLP 自动扫描违禁词/违规宣称, 准确率99.2%', model: 'ComplianceNLP', latency: '35ms', auto: true, volume: '全量' },
  { step: '质量评分', desc: 'UGCQuality-Ranker + HookQuality-BERT 对每条内容打分排序', model: 'HookQuality-BERT', latency: '45ms', auto: true, volume: '全量' },
  { step: '进入素材库', desc: '合格素材自动入库, 打标分类, 关联SKU, 准备投放', model: '素材管理系统', latency: '-', auto: true, volume: '580条/日' },
]

const contentOutputStats = [
  { week: 'W1', 脚本: 88, 图片: 65, 视频: 42, 合规通过: 92 },
  { week: 'W2', 脚本: 94, 图片: 71, 视频: 47, 合规通过: 94 },
  { week: 'W3', 脚本: 102, 图片: 80, 视频: 53, 合规通过: 95 },
  { week: 'W4', 脚本: 115, 图片: 88, 视频: 60, 合规通过: 96 },
]

// ── 投放分发管道 ─────────────────────────────────────────────────────────
const distributionPipelineSteps = [
  { step: '受众定向', desc: 'AudienceCluster-KM 分群 + Lookalike-Expander 种子扩展, 精准触达目标人群', model: 'AudienceCluster-KM', latency: '20ms', platforms: '全平台' },
  { step: '智能出价', desc: 'BidOptimizer-DQN 实时优化oCPM出价, 动态调整每次曝光价值', model: 'BidOptimizer-DQN', latency: '12ms', platforms: '抖/快/小/B' },
  { step: 'CTR预测排序', desc: 'CTR-Predictor-DeepFM 对每个 <受众,素材> 对打CTR分值, 选最优素材', model: 'CTR-Predictor-DeepFM', latency: '5ms', platforms: '全平台' },
  { step: '预算节奏控制', desc: 'TrafficPacing-RL 按时段分配预算, 避免早段耗尽/晚段流量浪费', model: 'TrafficPacing-RL', latency: '8ms', platforms: '全平台' },
  { step: '素材轮换', desc: 'CreativeFatigue-MAB 检测素材疲劳, 自动退场旧素材引入新素材', model: 'CreativeFatigue-MAB', latency: '3ms', platforms: '全平台' },
  { step: '跨平台协同', desc: 'BudgetMO-Optimizer 跨6大平台多目标优化, 实现整体ROI最大化', model: 'BudgetMO-Optimizer', latency: '65ms', platforms: '全平台' },
]

const platformPerf = [
  { platform: '抖音', spend: 480, gmv: 2880, roi: 6.0, ctr: 3.2, cvr: 12.8 },
  { platform: '小红书', spend: 280, gmv: 1540, roi: 5.5, ctr: 4.1, cvr: 9.4 },
  { platform: '快手', spend: 320, gmv: 1760, roi: 5.5, ctr: 2.8, cvr: 11.2 },
  { platform: 'B站', spend: 120, gmv: 600, roi: 5.0, ctr: 5.2, cvr: 7.6 },
  { platform: 'TikTok', spend: 200, gmv: 980, roi: 4.9, ctr: 3.6, cvr: 8.8 },
  { platform: 'Meta', spend: 160, gmv: 800, roi: 5.0, ctr: 2.9, cvr: 8.1 },
]

// ── 效果归因 ─────────────────────────────────────────────────────────────
const attributionData = [
  { touchpoint: '小红书种草', contribution: 28.4, type: '首触' },
  { touchpoint: '抖音短视频', contribution: 22.1, type: '中途' },
  { touchpoint: '搜索广告', contribution: 18.7, type: '中途' },
  { touchpoint: 'KOL达人', contribution: 15.3, type: '中途' },
  { touchpoint: '直播间', contribution: 10.8, type: '末触' },
  { touchpoint: '企微私域', contribution: 4.7, type: '末触' },
]

const roiTrendData = [
  { date: '4/14', '小红书': 5.2, '抖音': 6.1, '快手': 5.4, '直播': 7.2 },
  { date: '4/15', '小红书': 5.4, '抖音': 6.3, '快手': 5.6, '直播': 7.0 },
  { date: '4/16', '小红书': 5.1, '抖音': 6.8, '快手': 5.3, '直播': 7.8 },
  { date: '4/17', '小红书': 5.6, '抖音': 6.5, '快手': 5.7, '直播': 7.4 },
  { date: '4/18', '小红书': 5.8, '抖音': 7.1, '快手': 5.9, '直播': 8.2 },
  { date: '4/19', '小红书': 6.0, '抖音': 7.4, '快手': 6.1, '直播': 8.5 },
  { date: '4/20', '小红书': 6.2, '抖音': 7.6, '快手': 6.3, '直播': 8.8 },
]

// ── 用户转化沉淀 ─────────────────────────────────────────────────────────
const conversionFunnel = [
  { stage: '曝光', users: 8200000, rate: 100, color: C.dist },
  { stage: '点击', users: 328000, rate: 4.0, color: '#f59e0b' },
  { stage: '商品页', users: 164000, rate: 2.0, color: '#8b5cf6' },
  { stage: '加购', users: 49200, rate: 0.6, color: C.conv },
  { stage: '下单', users: 32760, rate: 0.4, color: '#10b981' },
  { stage: '复购(90天)', users: 12616, rate: 0.15, color: C.priv },
]

const ltvDistribution = [
  { segment: '高价值', count: 12800, ltv: 2840, color: '#e8365d' },
  { segment: '中高价值', count: 28400, ltv: 1260, color: '#f59e0b' },
  { segment: '中价值', count: 54000, ltv: 520, color: '#6366f1' },
  { segment: '低价值', count: 87200, ltv: 180, color: '#94a3b8' },
]

const userJourneyData = [
  { day: 'D0', 新用户留存: 100, 复购率: 0 },
  { day: 'D7', 新用户留存: 62, 复购率: 8 },
  { day: 'D14', 新用户留存: 48, 复购率: 14 },
  { day: 'D30', 新用户留存: 38, 复购率: 22 },
  { day: 'D60', 新用户留存: 29, 复购率: 31 },
  { day: 'D90', 新用户留存: 24, 复购率: 38 },
]

// ── 私域运营闭环 ─────────────────────────────────────────────────────────
const privateDomainFlow = [
  { channel: '企微社群', members: 128000, activity: 68, conversion: 12.4, ltv: 1840 },
  { channel: '小程序会员', members: 284000, activity: 45, conversion: 8.2, ltv: 920 },
  { channel: 'APP推送', members: 96000, activity: 72, conversion: 9.8, ltv: 1240 },
  { channel: '直播回放', members: 64000, activity: 38, conversion: 15.6, ltv: 2100 },
  { channel: '朋友圈广告', members: 42000, activity: 22, conversion: 6.4, ltv: 680 },
]

const ugcData = [
  { week: 'W1', UGC产生: 2400, 优质UGC: 480, 引用投放: 120 },
  { week: 'W2', UGC产生: 2800, 优质UGC: 560, 引用投放: 148 },
  { week: 'W3', UGC产生: 3200, 优质UGC: 640, 引用投放: 172 },
  { week: 'W4', UGC产生: 3600, 优质UGC: 760, 引用投放: 208 },
]

// ── 数据反哺闭环 ─────────────────────────────────────────────────────────
const dataFeedbackLoops = [
  { loop: '转化数据 → 出价模型', dataType: '转化信号', volume: '32万条/日', latency: '10min', improvement: 'CVR +2.1%', color: C.conv },
  { loop: '点击行为 → CTR模型', dataType: '用户行为', volume: '120万条/日', latency: '1h', improvement: 'CTR +1.8%', color: C.dist },
  { loop: 'UGC内容 → 脚本模型', dataType: '高质量UGC', volume: '760条/周', latency: '每周', improvement: '素材质量 +3.2%', color: C.prod },
  { loop: '复购行为 → 推荐模型', dataType: '购买序列', volume: '12万条/日', latency: '每日', improvement: '推荐CVR +4.6%', color: C.priv },
  { loop: '舆情数据 → 趋势模型', dataType: '平台评论', volume: '8万条/日', latency: '6h', improvement: '趋势预测 +8.2%', color: '#8b5cf6' },
  { loop: '归因结果 → 预算模型', dataType: '渠道效率', volume: '全平台汇总', latency: '每日', improvement: 'ROI +0.8x', color: C.attr },
]

const modelUpdateHistory = [
  { date: '4/20', model: 'CTR-Predictor-DeepFM', trigger: '新增转化数据28万', delta: '+0.4%', version: 'v4.5.1' },
  { date: '4/19', model: 'BidOptimizer-DQN', trigger: 'ROI偏差超阈值', delta: '+1.2%', version: 'v3.8.2' },
  { date: '4/18', model: 'ContentLLM-Beauty', trigger: '周度UGC数据积累', delta: '+0.8%', version: 'v1.2.1' },
  { date: '4/17', model: 'TrendForecaster', trigger: '趋势预测误差过高', delta: '+2.1%', version: 'v1.5.1' },
  { date: '4/16', model: 'ChurnPredictor-GBM', trigger: '流失用户新标签', delta: '+1.6%', version: 'v1.1.0' },
]

// ── 飞轮速度指标 ─────────────────────────────────────────────────────────
const velocityMetrics = [
  { metric: '内容生产周期', current: '4.2h', baseline: '3天', improvement: '94%', color: C.prod },
  { metric: '素材→上线延迟', current: '28min', baseline: '4h', improvement: '88%', color: C.dist },
  { metric: '投放数据回流', current: '10min', baseline: '次日', improvement: '97%', color: C.attr },
  { metric: '用户行为分析', current: '实时', baseline: '24h', improvement: '100%', color: C.conv },
  { metric: '模型更新周期', current: '1h', baseline: '1周', improvement: '99%', color: C.data },
  { metric: '策略生效时间', current: '5min', baseline: '2h', improvement: '96%', color: C.priv },
]

const velocityTrend = [
  { month: '10月', 生产速度: 320, 投放速度: 280, 数据速度: 240, 决策速度: 200 },
  { month: '11月', 生产速度: 360, 投放速度: 320, 数据速度: 290, 决策速度: 250 },
  { month: '12月', 生产速度: 400, 投放速度: 370, 数据速度: 340, 决策速度: 310 },
  { month: '1月',  生产速度: 450, 投放速度: 420, 数据速度: 390, 决策速度: 360 },
  { month: '2月',  生产速度: 510, 投放速度: 480, 数据速度: 450, 决策速度: 420 },
  { month: '3月',  生产速度: 580, 投放速度: 550, 数据速度: 520, 决策速度: 490 },
  { month: '4月',  生产速度: 640, 投放速度: 612, 数据速度: 590, 决策速度: 560 },
]

// ── Flywheel Stage Pill ──────────────────────────────────────────────────
function StagePill({ label, color, active }: { label: string; color: string; active?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: active ? `${color}28` : 'transparent',
      border: `1px solid ${active ? color : 'var(--border)'}`,
      fontSize: '0.72rem', fontWeight: 600,
      color: active ? color : 'var(--text-muted)',
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? color : 'var(--text-muted)' }} />
      {label}
    </div>
  )
}

// ── Flywheel Visualization ────────────────────────────────────────────────
function FlywheelDiagram() {
  const stages = [
    { label: '🎨 内容生产', color: C.prod, angle: 270, kpi: '640条/日' },
    { label: '🚀 投放分发', color: C.dist, angle: 330, kpi: '6大平台' },
    { label: '📊 效果采集', color: C.attr, angle: 30, kpi: '4.2h回流' },
    { label: '👤 用户转化', color: C.conv, angle: 90, kpi: 'CVR 12.6%' },
    { label: '🔄 私域沉淀', color: C.priv, angle: 150, kpi: '38.5%留存' },
    { label: '📈 数据反哺', color: C.data, angle: 210, kpi: '6条反馈环' },
  ]
  const cx = 200, cy = 200, r = 130

  return (
    <svg width="400" height="400" viewBox="0 0 400 400">
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={45} fill="rgba(232,54,93,0.1)" stroke="#e8365d" strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#ff7a95" fontSize="11" fontWeight="700">AI飞轮</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#ff7a95" fontSize="10">引擎</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#ffb4c6" fontSize="9">8.4x/月</text>

      {/* Orbit ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

      {/* Arrows between stages (arcs) */}
      {stages.map((s, i) => {
        const next = stages[(i + 1) % stages.length]
        const a1 = (s.angle + 28) * Math.PI / 180
        const a2 = (next.angle - 28) * Math.PI / 180
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
        const mx = cx + (r + 18) * Math.cos((s.angle + (next.angle - s.angle) / 2 + (i === 5 ? 360 : 0)) * Math.PI / 180)
        const my = cy + (r + 18) * Math.sin((s.angle + (next.angle - s.angle) / 2 + (i === 5 ? 360 : 0)) * Math.PI / 180)
        return (
          <path key={i} d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
            fill="none" stroke={s.color} strokeWidth={1.5} strokeOpacity={0.5}
            markerEnd="url(#arrow)" />
        )
      })}

      {/* Arrow marker */}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.4)" />
        </marker>
      </defs>

      {/* Stage nodes */}
      {stages.map((s, i) => {
        const rad = s.angle * Math.PI / 180
        const nx = cx + r * Math.cos(rad)
        const ny = cy + r * Math.sin(rad)
        // Label position (further out)
        const lx = cx + (r + 52) * Math.cos(rad)
        const ly = cy + (r + 52) * Math.sin(rad)
        return (
          <g key={i}>
            <circle cx={nx} cy={ny} r={18} fill={`${s.color}25`} stroke={s.color} strokeWidth={1.5} />
            <text x={nx} y={ny + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11">{s.label.split(' ')[0]}</text>
            <text x={lx} y={ly - 5} textAnchor="middle" fill={s.color} fontSize="9.5" fontWeight="700">
              {s.label.split(' ')[1]}
            </text>
            <text x={lx} y={ly + 7} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="8.5">
              {s.kpi}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Pipeline Step Row ─────────────────────────────────────────────────────
function PipelineRow({ step, color }: { step: typeof contentPipelineSteps[0]; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${color}` }}>
      <CheckCircle size={13} color={color} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{step.step}</span>
          <ModelBadge modelName={step.model} />
          <span style={{ fontSize: '0.65rem', color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '1px 6px', borderRadius: 4 }}>
            全自动
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{step.desc}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>延迟</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{step.latency}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 72 }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>产量</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{step.volume}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ContentFlywheel() {
  const [activeTab, setActiveTab] = useState(0)

  // 真实数据统计
  const [deconstructionTotal, setDeconstructionTotal] = useState<number | null>(null)
  const [patternTotal, setPatternTotal] = useState<number | null>(null)
  const [structureCardTotal, setStructureCardTotal] = useState<number | null>(null)

  useEffect(() => {
    fetchTotal('/api/videoDeconstructionResult/listPage', { pageIndex: 1, pageSize: 1, skuId: 'SEED_CUSHION_2' })
      .then(setDeconstructionTotal)
    fetchTotal('/api/contentPatternKnowledge/listPage', { pageIndex: 1, pageSize: 1 })
      .then(setPatternTotal)
    fetchTotal('/api/contentStructureCard/listPage', { pageIndex: 1, pageSize: 1 })
      .then(setStructureCardTotal)
  }, [])

  const tabs = [
    { label: '飞轮总览', icon: RotateCcw, color: C.data },
    { label: '内容生产管道', icon: Film, color: C.prod },
    { label: '投放分发管道', icon: Megaphone, color: C.dist },
    { label: '效果归因', icon: Eye, color: C.attr },
    { label: '用户转化沉淀', icon: ShoppingCart, color: C.conv },
    { label: '私域运营闭环', icon: Heart, color: C.priv },
    { label: '数据反哺优化', icon: Database, color: C.data },
  ]

  return (
    <>
      <div className="page-header">
        <h2>🔄 AI内容飞轮引擎</h2>
        <p>内容自动生产 → 智能投放分发 → 实时效果采集 → 用户转化沉淀 → 私域运营闭环 → 数据反哺优化 · 形成完整闭环 · 飞轮转速 8.4x/月</p>
      </div>
      <div className="page-content">

        {/* 飞轮阶段指示器 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: 4, alignSelf: 'center' }}>闭环阶段:</span>
          {[
            { l: '🎨 内容生产', c: C.prod }, { l: '→', c: 'transparent' },
            { l: '🚀 投放分发', c: C.dist }, { l: '→', c: 'transparent' },
            { l: '📊 效果采集', c: C.attr }, { l: '→', c: 'transparent' },
            { l: '👤 用户转化', c: C.conv }, { l: '→', c: 'transparent' },
            { l: '🔄 私域沉淀', c: C.priv }, { l: '→', c: 'transparent' },
            { l: '📈 数据反哺', c: C.data },
          ].map((item, i) => item.l === '→'
            ? <ArrowRight key={i} size={12} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
            : <StagePill key={i} label={item.l} color={item.c} active />
          )}
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
              border: activeTab === i ? `1px solid ${t.color}` : '1px solid var(--border)',
              background: activeTab === i ? `${t.color}18` : 'transparent',
              color: activeTab === i ? t.color : 'var(--text-muted)',
              fontSize: '0.8rem', fontWeight: activeTab === i ? 700 : 500,
              transition: 'all 0.15s',
            }}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab 0: 飞轮总览 ── */}
        {activeTab === 0 && (
          <div>
            {/* 真实数据统计卡 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                {
                  label: '已拆解视频结果',
                  value: deconstructionTotal,
                  desc: 'SEED_CUSHION_2 · videoDeconstructionResult',
                  color: C.prod,
                },
                {
                  label: '内容模式知识条目',
                  value: patternTotal,
                  desc: '全品类 · contentPatternKnowledge',
                  color: C.attr,
                },
                {
                  label: '内容结构卡数量',
                  value: structureCardTotal,
                  desc: '全品类 · contentStructureCard',
                  color: C.conv,
                },
              ].map((item, i) => (
                <div key={i} className="card" style={{ borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: item.color, marginBottom: 4 }}>
                    {item.value === null ? '—' : item.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* KPI Cards */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
              {flywheelKPIs.map((k, i) => (
                <div className="card" key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <k.icon size={14} color={k.color} />
                    <span className="card-title" style={{ marginBottom: 0 }}>{k.label}</span>
                  </div>
                  <div className="card-value" style={{ color: k.color }}>{k.value}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{k.sub}</span>
                    <span className={`card-change ${k.pos ? 'positive' : 'negative'}`}>{k.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              {/* Flywheel Diagram */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="section-title" style={{ alignSelf: 'flex-start' }}><RotateCcw size={15} /> 飞轮运转示意图</div>
                <FlywheelDiagram />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
                  6大阶段全AI驱动 · 52个智能体协同运转 · 40+模型持续优化
                </div>
              </div>

              {/* Stage Flow */}
              <div className="card">
                <div className="section-title"><Activity size={15} /> 各阶段本月数据快照</div>
                {stageFlow.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${s.color}` }}>
                    <s.icon size={14} color={s.color} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1 }}>{s.stage}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: s.color }}>
                      {s.isUsers ? `${(s.value as number / 10000).toFixed(1)}万人` : `${s.value}条`}
                    </span>
                    {i < stageFlow.length - 1 && (
                      <ArrowRight size={10} color="var(--text-muted)" />
                    )}
                    {i === stageFlow.length - 1 && (
                      <RotateCcw size={10} color={s.color} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flywheel Growth Trend */}
            <div className="card">
              <div className="section-title"><TrendingUp size={15} /> 飞轮加速趋势 (近7个月)</div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={flywheelTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={v => `${v}x`} domain={[4, 10]} />
                  <Tooltip contentStyle={tt} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="内容产量" fill={C.prod} radius={[3, 3, 0, 0]} opacity={0.8} />
                  <Bar yAxisId="left" dataKey="投放素材" fill={C.dist} radius={[3, 3, 0, 0]} opacity={0.8} />
                  <Line yAxisId="right" type="monotone" dataKey="ROI" stroke={C.data} strokeWidth={2.5} dot={{ fill: C.data, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Tab 1: 内容生产管道 ── */}
        {activeTab === 1 && (
          <div>
            <div className="card" style={{ marginBottom: 16, background: 'rgba(236,72,153,0.08)', borderColor: 'rgba(236,72,153,0.2)' }}>
              <div style={{ fontSize: '0.82rem' }}>
                <strong style={{ color: '#f9a8d4' }}>🎨 AI内容自动生产管道</strong>：从趋势捕捉到合规审核全流程AI化，
                平均内容生产周期从 <strong style={{ color: '#f9a8d4' }}>3天</strong> 压缩至 <strong style={{ color: '#f9a8d4' }}>4.2小时</strong>，
                日均产出 <strong style={{ color: '#f9a8d4' }}>640+</strong> 条多元内容，自动化率 <strong style={{ color: '#f9a8d4' }}>94.2%</strong>。
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><Film size={15} /> 生产管道步骤</div>
                {contentPipelineSteps.map((s, i) => (
                  <PipelineRow key={i} step={s} color={C.prod} />
                ))}
              </div>
              <div className="card">
                <div className="section-title"><BarChart3 size={15} /> 周产量统计</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={contentOutputStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tt} />
                    <Legend />
                    <Bar dataKey="脚本" fill={C.prod} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="图片" fill="#f472b6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="视频" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div style={{ marginTop: 14 }}>
                  <div className="section-title" style={{ marginBottom: 8 }}><Brain size={14} /> 关键AI模型</div>
                  {[
                    { name: 'ContentLLM-Beauty v1.2.0', role: '脚本 / 文案 / 话术生成', acc: '86.4%', color: C.prod },
                    { name: 'ImageGen-BeautySDXL v2.0.1', role: '产品图 / Banner 生成', acc: '91.0%', color: '#f472b6' },
                    { name: 'VideoHighlight-Detector v1.7.3', role: '视频爆点检测 / 剪辑', acc: '84.2%', color: '#a78bfa' },
                    { name: 'ComplianceNLP v3.0.1', role: '全量合规审核', acc: '99.2%', color: '#22c55e' },
                    { name: 'TrendForecaster v1.5.0', role: '热词 / 趋势预测', acc: '78.5%', color: C.data },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-primary)', borderRadius: 6, marginBottom: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, flex: 1 }}>{m.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.role}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.color }}>{m.acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: 投放分发管道 ── */}
        {activeTab === 2 && (
          <div>
            <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: '0.82rem' }}>
                <strong style={{ color: '#fcd34d' }}>🚀 智能投放分发管道</strong>：素材从入库到上线 <strong style={{ color: '#fcd34d' }}>28分钟</strong>，
                AI智能体全自动完成受众定向→出价→预算→轮换，
                覆盖 <strong style={{ color: '#fcd34d' }}>6大平台</strong>，
                综合ROI <strong style={{ color: '#fcd34d' }}>6.2x</strong>，
                日消耗 <strong style={{ color: '#fcd34d' }}>156万+</strong>。
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><Megaphone size={15} /> 投放管道步骤</div>
                {distributionPipelineSteps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${C.dist}` }}>
                    <CheckCircle size={13} color={C.dist} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{s.step}</span>
                        <ModelBadge modelName={s.model} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.platforms}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.dist }}>{s.latency}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-title"><Globe size={15} /> 分平台投放效果</div>
                <table className="data-table">
                  <thead>
                    <tr><th>平台</th><th>消耗(万)</th><th>GMV(万)</th><th>ROI</th><th>CTR</th><th>CVR</th></tr>
                  </thead>
                  <tbody>
                    {platformPerf.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{p.platform}</td>
                        <td>{p.spend}</td>
                        <td>{p.gmv}</td>
                        <td style={{ color: p.roi >= 6 ? '#22c55e' : p.roi >= 5 ? C.dist : '#f87171', fontWeight: 700 }}>{p.roi}x</td>
                        <td>{p.ctr}%</td>
                        <td>{p.cvr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: 14 }}>
                  <div className="section-title" style={{ marginBottom: 8 }}><Cpu size={14} /> 核心投放模型</div>
                  {[
                    { name: 'CTR-Predictor-DeepFM', qps: '120K', latency: '5ms', color: C.dist },
                    { name: 'BidOptimizer-DQN', qps: '45K', latency: '12ms', color: '#f59e0b' },
                    { name: 'TrafficPacing-RL', qps: '28K', latency: '8ms', color: '#8b5cf6' },
                    { name: 'CreativeFatigue-MAB', qps: '80K', latency: '3ms', color: C.attr },
                    { name: 'BudgetMO-Optimizer', qps: '2K', latency: '65ms', color: C.data },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 6, marginBottom: 4 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: m.color }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, flex: 1 }}>{m.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.qps} QPS</span>
                      <span style={{ fontSize: '0.72rem', color: m.color, fontWeight: 700 }}>{m.latency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: 效果归因 ── */}
        {activeTab === 3 && (
          <div>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><Eye size={15} /> 多触点归因贡献</div>
                <div style={{ marginBottom: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Attribution-Shapley v2.5.1 · Shapley值 + DNN混合归因 · 准确率 87.8%
                </div>
                {attributionData.map((a, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{a.touchpoint}</span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4,
                          background: a.type === '首触' ? 'rgba(16,185,129,0.15)' : a.type === '末触' ? 'rgba(232,54,93,0.15)' : 'rgba(99,102,241,0.15)',
                          color: a.type === '首触' ? '#10b981' : a.type === '末触' ? '#e8365d' : '#6366f1',
                        }}>{a.type}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.attr }}>{a.contribution}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${a.contribution / 30 * 100}%`, background: C.attr, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-title"><TrendingUp size={15} /> 渠道ROI趋势 (近7天)</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={roiTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[4, 10]} tickFormatter={v => `${v}x`} />
                    <Tooltip contentStyle={tt} formatter={(v) => [`${v}x`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="小红书" stroke={C.prod} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="抖音" stroke={C.dist} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="快手" stroke={C.attr} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="直播" stroke={C.conv} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="section-title"><Database size={15} /> 归因 AI 模型矩阵</div>
              <div className="grid-3">
                {[
                  { name: 'Attribution-Shapley', desc: '多触点Shapley值归因，精准量化每个渠道的真实贡献', acc: '87.8%', update: '昨日', color: C.attr },
                  { name: 'BayesianAB-Engine', desc: '贝叶斯A/B实验引擎，统计显著性验证策略效果', acc: '93.6%', update: '实时', color: '#10b981' },
                  { name: 'MetaCAPI-Attribution', desc: 'Meta服务端转化API归因，iOS ATT隐私合规补偿', acc: '82.3%', update: '实时', color: C.data },
                  { name: 'AnomalyDetector-LSTM', desc: 'ROI异常检测，归因数据质量监控', acc: '95.1%', update: '实时', color: '#f59e0b' },
                  { name: 'MultiCurrency-ROAS', desc: '多币种ROAS预测，全球化汇率影响修正', acc: '87.6%', update: '1h', color: '#6366f1' },
                  { name: 'TrafficPacing-RL', desc: '基于归因结果动态调整预算时段分配', acc: '90.1%', update: '实时', color: C.priv },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8, borderLeft: `3px solid ${m.color}` }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 4, color: m.color }}>{m.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>{m.desc}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>准确率</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: m.color }}>{m.acc}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>更新频率</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.update}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 4: 用户转化沉淀 ── */}
        {activeTab === 4 && (
          <div>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><ShoppingCart size={15} /> 转化漏斗</div>
                {conversionFunnel.map((f, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{f.stage}</span>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: '0.78rem', color: f.color, fontWeight: 700 }}>
                          {f.users >= 10000 ? `${(f.users / 10000).toFixed(1)}万` : f.users.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{f.rate}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${Math.min(f.rate * 25, 100)}%`, background: f.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-title"><Users size={15} /> 用户LTV分层</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={ltvDistribution} dataKey="count" nameKey="segment" cx="50%" cy="50%" outerRadius={80} label={({ segment, percent }) => `${segment} ${(percent * 100).toFixed(0)}%`}>
                      {ltvDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tt} formatter={(v, n, p) => [`${Number(v).toLocaleString()}人 · LTV¥${p.payload.ltv}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 8 }}>
                  {ltvDistribution.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, flex: 1 }}>{d.segment}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.count.toLocaleString()}人</span>
                      <span style={{ fontSize: '0.78rem', color: d.color, fontWeight: 700 }}>LTV ¥{d.ltv}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title"><TrendingUp size={15} /> 用户留存 & 复购曲线</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={userJourneyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={tt} formatter={(v) => [`${v}%`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="新用户留存" stroke={C.conv} strokeWidth={2.5} dot={{ fill: C.conv, r: 4 }} />
                  <Line type="monotone" dataKey="复购率" stroke={C.priv} strokeWidth={2.5} dot={{ fill: C.priv, r: 4 }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Tab 5: 私域运营闭环 ── */}
        {activeTab === 5 && (
          <div>
            <div className="card" style={{ marginBottom: 16, background: 'rgba(232,54,93,0.08)', borderColor: 'rgba(232,54,93,0.2)' }}>
              <div style={{ fontSize: '0.82rem' }}>
                <strong style={{ color: '#ffb4c6' }}>🔄 私域运营闭环</strong>：用户完成首购后自动导入私域体系，
                企微+小程序+APP三端联动，私域用户 LTV 是公域用户的 <strong style={{ color: '#ffb4c6' }}>3.2x</strong>，
                UGC内容自动回流至内容生产管道形成闭环。
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><Heart size={15} /> 私域渠道矩阵</div>
                <table className="data-table">
                  <thead>
                    <tr><th>渠道</th><th>会员数</th><th>活跃度</th><th>转化率</th><th>LTV</th></tr>
                  </thead>
                  <tbody>
                    {privateDomainFlow.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{p.channel}</td>
                        <td>{(p.members / 10000).toFixed(1)}万</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${p.activity}%`, background: p.activity > 60 ? '#22c55e' : p.activity > 40 ? C.dist : '#94a3b8', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: '0.72rem' }}>{p.activity}%</span>
                          </div>
                        </td>
                        <td style={{ color: C.priv, fontWeight: 700 }}>{p.conversion}%</td>
                        <td style={{ color: '#22c55e', fontWeight: 700 }}>¥{p.ltv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div className="section-title"><Star size={15} /> UGC生产 → 投放回流</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                  用户生成内容经质量评分后自动进入素材库，直接用于投放，形成内容闭环
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ugcData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tt} />
                    <Legend />
                    <Bar dataKey="UGC产生" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="优质UGC" fill={C.priv} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="引用投放" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Private domain journey */}
            <div className="card">
              <div className="section-title"><RefreshCw size={15} /> 私域运营旅程闭环</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
                {[
                  { step: '首购用户', action: '自动导入企微', model: 'LTV-Predictor', color: C.conv },
                  { step: '分层运营', action: 'RFM分群+个性化触达', model: 'RFM-Clustering', color: C.priv },
                  { step: '内容触达', action: 'ContentLLM生成个性化推送', model: 'ContentLLM-Beauty', color: C.prod },
                  { step: '复购激活', action: 'ChurnPredictor预判流失', model: 'ChurnPredictor-GBM', color: '#f59e0b' },
                  { step: 'UGC激励', action: '优质UGC奖励+入库', model: 'UGCQuality-Ranker', color: C.data },
                  { step: '数据反哺', action: '行为数据→模型优化', model: 'Attribution-Shapley', color: C.attr },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120, flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${s.color}20`, border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: s.color, textAlign: 'center', lineHeight: 1.3 }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, marginTop: 6, textAlign: 'center' }}>{s.step}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 3 }}>{s.action}</div>
                    <div style={{ marginTop: 5 }}><ModelBadge modelName={s.model} /></div>
                    {i < 5 && <ArrowRight size={10} color="var(--text-muted)" style={{ marginTop: 8 }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 6: 数据反哺优化 ── */}
        {activeTab === 6 && (
          <div>
            <div className="card" style={{ marginBottom: 16, background: 'rgba(14,165,233,0.08)', borderColor: 'rgba(14,165,233,0.2)' }}>
              <div style={{ fontSize: '0.82rem' }}>
                <strong style={{ color: '#7dd3fc' }}>📈 数据反哺优化闭环</strong>：投放效果、用户行为、UGC质量数据实时回流，
                驱动 <strong style={{ color: '#7dd3fc' }}>6条反馈环</strong> 自动优化模型，
                模型更新延迟从 <strong style={{ color: '#7dd3fc' }}>1周</strong> 压缩至 <strong style={{ color: '#7dd3fc' }}>1小时</strong>，
                飞轮每转一圈ROI提升 <strong style={{ color: '#7dd3fc' }}>约0.3x</strong>。
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><Database size={15} /> 6条数据反馈环</div>
                {dataFeedbackLoops.map((l, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6, borderLeft: `3px solid ${l.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{l.loop}</span>
                      <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700 }}>{l.improvement}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>数据: {l.dataType}</span>
                      <span>量: {l.volume}</span>
                      <span>延迟: {l.latency}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-title"><RefreshCw size={15} /> 近期模型更新记录</div>
                <table className="data-table">
                  <thead>
                    <tr><th>日期</th><th>模型</th><th>触发原因</th><th>准确率提升</th><th>版本</th></tr>
                  </thead>
                  <tbody>
                    {modelUpdateHistory.map((m, i) => (
                      <tr key={i}>
                        <td>{m.date}</td>
                        <td style={{ fontWeight: 700, color: C.data }}>{m.model}</td>
                        <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.trigger}</td>
                        <td style={{ color: '#22c55e', fontWeight: 700 }}>{m.delta}</td>
                        <td style={{ fontSize: '0.72rem' }}>{m.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: 16 }}>
                  <div className="section-title" style={{ marginBottom: 8 }}><Zap size={14} /> 飞轮速度指标</div>
                  {velocityMetrics.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--bg-primary)', borderRadius: 6, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, flex: 1 }}>{v.metric}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{v.baseline}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: v.color }}>{v.current}</span>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '1px 6px', borderRadius: 4 }}>↑{v.improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Velocity Trend Chart */}
            <div className="card">
              <div className="section-title"><TrendingUp size={15} /> 飞轮各维度速度提升趋势</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={velocityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tt} />
                  <Legend />
                  <Area type="monotone" dataKey="生产速度" stroke={C.prod} fill={`${C.prod}18`} strokeWidth={2} />
                  <Area type="monotone" dataKey="投放速度" stroke={C.dist} fill={`${C.dist}18`} strokeWidth={2} />
                  <Area type="monotone" dataKey="数据速度" stroke={C.data} fill={`${C.data}18`} strokeWidth={2} />
                  <Area type="monotone" dataKey="决策速度" stroke={C.conv} fill={`${C.conv}18`} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
