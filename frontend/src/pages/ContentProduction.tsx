import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import {
  BookOpen, Pen, Video, Package, CheckSquare, Megaphone, TrendingUp,
  ArrowRight, Zap, Activity,
  DollarSign, Target, AlertTriangle, Cpu, Layers, BarChart3,
  RefreshCw, Brain, Send
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

const contentProductionAIGroups: AIConfigGroup[] = [
  {
    title: '生产节奏调控',
    icon: <Zap size={16} />,
    params: [
      createParam('daily_production_target', '内容日产量目标', 45, '个', '每日AI生产种草内容的目标数量', 45, 90, { min: 1, max: 200, autoTuneEnabled: true, learningDataPoints: 32000, lastAdjusted: '3小时前', adjustHistory: [{ time: '3天前', from: '35', to: '40', reason: '产能提升，AI自动上调目标' }, { time: '昨日', from: '40', to: '45', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('review_pass_rate_target', '审核通过率目标', 92, '%', '种草内容审核通过率的目标值', 92, 93, { min: 0, max: 100, type: 'percentage', autoTuneEnabled: true, learningDataPoints: 28000, lastAdjusted: '2小时前', adjustHistory: [{ time: '4天前', from: '88', to: '90', reason: '审核模型升级' }, { time: '昨日', from: '90', to: '92', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('reuse_decay_cycle', '内容复用衰减周期', 7, '天', '内容复用效果开始显著衰减的天数', 7, 87, { min: 1, max: 30, autoTuneEnabled: true, learningDataPoints: 25000, lastAdjusted: '5小时前', adjustHistory: [{ time: '5天前', from: '10', to: '8', reason: '内容衰退速度加快' }, { time: '昨日', from: '8', to: '7', reason: 'AI根据近7日数据自动优化' }] }),
    ],
  },
  {
    title: '飞轮效率优化',
    icon: <Brain size={16} />,
    params: [
      createParam('production_to_launch_max', '从生产到投放最大时长', 4, '小时', '种草内容从生产完成到上线投放的最大允许时长', 4, 91, { min: 1, max: 72, autoTuneEnabled: true, learningDataPoints: 30000, lastAdjusted: '1小时前', adjustHistory: [{ time: '3天前', from: '8', to: '6', reason: '流水线效率提升' }, { time: '昨日', from: '6', to: '4', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('elimination_ctr_threshold', '内容淘汰CTR阈值', 3.5, '%', 'CTR低于此值的内容将被自动淘汰', 3.5, 89, { min: 0, max: 15, step: 0.5, type: 'percentage', autoTuneEnabled: true, learningDataPoints: 35000, lastAdjusted: '4小时前', adjustHistory: [{ time: '4天前', from: '4.5', to: '4.0', reason: '低效内容过滤不足' }, { time: '昨日', from: '4.0', to: '3.5', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('auto_scale_roi_trigger', '自动扩量触发ROI', 3.0, '', '内容ROI达到此值时自动触发扩量', 3.0, 88, { min: 1.5, max: 8.0, step: 0.1, autoTuneEnabled: true, learningDataPoints: 27000, lastAdjusted: '6小时前', adjustHistory: [{ time: '5天前', from: '2.5', to: '2.8', reason: '扩量ROI门槛上调' }, { time: '昨日', from: '2.8', to: '3.0', reason: 'AI根据近7日数据自动优化' }] }),
    ],
  },
]

const contentProductionLearningStatus: AILearningStatus = {
  modelVersion: 'v2.8.0-grass',
  lastTraining: '35分钟前',
  totalDataPoints: 428000,
  avgConfidence: 90,
  autoAdjustCount24h: 78,
  learningRate: '0.003',
  nextTraining: '25分钟后',
  improvementRate: '+13.2%',
}

// ===== 种草飞轮各环节实时状态 =====
const flywheelStages = [
  { key: 'product', name: '产品卖点提炼', icon: BookOpen, color: '#e8365d', activeTasks: 4, throughput: '3 SKU/天', health: 'good' as const, detail: '4个产品卖点分析中，2个成分党向，2个颜值向', link: '/content/products' },
  { key: 'script', name: '种草文案生产', icon: Pen, color: '#ff5580', activeTasks: 8, throughput: '12篇/天', health: 'good' as const, detail: '跨6个产品线生产中，1个需重生成', link: '/content/script' },
  { key: 'video', name: '视频素材制作', icon: Video, color: '#ff7a95', activeTasks: 12, throughput: '8条/天', health: 'warning' as const, detail: 'GPU 87%负载，3个排队中', link: '/content/video' },
  { key: 'material', name: '种草内容生成', icon: Package, color: '#ff9eb5', activeTasks: 18, throughput: '320条/天', health: 'good' as const, detail: '165条跑量中，52条衰退预警', link: '/content/creative' },
  { key: 'review', name: '合规审核', icon: CheckSquare, color: '#ffb3c6', activeTasks: 22, throughput: '512条/天', health: 'good' as const, detail: '通过率92%，AI预审5s/条', link: '/content/review' },
  { key: 'placement', name: '广告投放', icon: Megaphone, color: '#ffc8d5', activeTasks: 28, throughput: '¥86.5万/天', health: 'good' as const, detail: '5平台投放中，整体ROI 3.41', link: '/ads' },
  { key: 'data', name: '数据回流', icon: TrendingUp, color: '#e8365d', activeTasks: 0, throughput: '实时', health: 'good' as const, detail: '驱动8类生产任务，今日触发18条', link: '/analytics' },
]

// ===== 飞轮核心KPI =====
const flywheelKPIs = {
  product2Material: 8.5,   // 产品→内容平均天数
  material2Live: 0.017,    // 内容→上线平均天数 (≈24分钟)
  dataFeedback: 18.2,      // 日均数据驱动任务数
  overallROI: 3.41,
  flywheelSpeed: 96,       // 飞轮转速指数(0-100)
  bottleneck: '视频素材制作',
  todayProduced: 45,       // 今日AI生产内容
  todayAutoLaunched: 82,   // 今日自动建计划
  autoRate: 96.5,          // 全流程零人工率%
  aiOps: 3200,             // 今日AI操作总次数
  humanIntervention: 3,    // 人工干预次数
}

// ===== 数据回流驱动的生产决策 =====
const dataFeedbackActions = [
  { time: '14:45', source: '投放数据', signal: '唇釉试色视频CTR降至4.2%（衰退）', action: '触发3条替换素材生产（新色试色/对比测评/节日限定）', target: '内容生成', impact: '保障唇釉计划不断档', status: 'executing' as const },
  { time: '14:30', source: '受众洞察', signal: '成分党25-34F转化率高58%', action: '追加成分向种草文案8篇', target: '文案生产', impact: '定向高转化人群', status: 'executing' as const },
  { time: '14:15', source: 'A/B测试', signal: '"before/after对比" > "单纯展示" 35%', action: '文案模板参数更新（增加对比元素）', target: '文案生产', impact: '提升后续内容CTR', status: 'completed' as const },
  { time: '13:50', source: '竞品情报', signal: '竞品使用"成分解析"格式效果好', action: '生产成分科普+种草组合内容5篇', target: '内容生成', impact: '验证新内容形式', status: 'queued' as const },
  { time: '13:20', source: '投放数据', signal: '眼影盘教程视频完播率78%（优秀）', action: '复制5条同类型变体', target: '内容生成', impact: '放大高效内容效果', status: 'executing' as const },
  { time: '12:40', source: '市场趋势', signal: '"防晒+卸妆"话题搜索量+85%', action: '优先推进防晒卸妆组合内容', target: '文案/视频', impact: '抢占趋势窗口', status: 'executing' as const },
  { time: '12:00', source: '投放数据', signal: '卸妆水敏感肌内容ROI 4.2x全品最高', action: '追加敏感肌向内容12篇', target: '内容生成', impact: '放大高ROI品类', status: 'completed' as const },
  { time: '11:15', source: '产品表现', signal: '唇釉丝绒618预热效果显著', action: '启动618大促专题内容策划', target: '产品卖点', impact: '复制618爆款模式', status: 'executing' as const },
]

// ===== 今日内容产量 =====
const productionToday = {
  grassNotes: 28,         // 种草笔记
  videoMaterials: 12,     // 视频素材
  kocBriefs: 8,           // KOC创作简报
  reviewPassed: 42,       // 审核通过
  autoLaunched: 82,       // 自动建计划
  totalCreatives: 320,    // 在投素材
}

// ===== 内容类型分布 =====
const contentTypeData = [
  { type: '试色视频', count: 85, roi: 3.85, ctr: 7.2 },
  { type: '妆容教程', count: 68, roi: 3.52, ctr: 6.8 },
  { type: '对比测评', count: 58, roi: 3.38, ctr: 6.5 },
  { type: '开箱视频', count: 42, roi: 3.29, ctr: 7.5 },
  { type: '成分科普', count: 35, roi: 3.15, ctr: 5.8 },
  { type: '变美挑战', count: 32, roi: 2.95, ctr: 8.2 },
]

// ===== 瓶颈与优化 =====
const bottleneckAnalysis = {
  current: '视频素材制作',
  utilization: 87,
  queueLength: 3,
  avgWait: '28分钟',
  suggestion: '建议增加GPU节点或优化DiT视频生成并行度，可将吞吐量提升40%',
  impact: '解决瓶颈后预计AI操作次数从3200提升至4500，种草效率提升30%',
}

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

const healthColor = { good: '#22c55e', warning: '#f59e0b', error: '#ef4444' }

export default function ContentProduction() {
  const [tab, setTab] = useState<'flywheel' | 'feedback' | 'output'>('flywheel')
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  useRegisterAIConfig(contentProductionAIGroups, contentProductionLearningStatus, '种草内容生产飞轮')

  const handleDispatch = (e: React.MouseEvent, fromIdx: number) => {
    e.stopPropagation()
    const next = flywheelStages[(fromIdx + 1) % flywheelStages.length]
    const cur = flywheelStages[fromIdx]
    setToast(`✓ ${cur.name} 已下发到 ${next.name}（agent 调度模拟）`)
    setTimeout(() => setToast(null), 2200)
    setTimeout(() => navigate(next.link), 600)
  }

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, padding: '10px 18px', borderRadius: 10,
          background: 'linear-gradient(135deg,#e8365d,#ff7a95)', color: '#fff',
          fontSize: '0.82rem', fontWeight: 600, boxShadow: '0 8px 24px rgba(232,54,93,0.35)',
        }}>{toast}</div>
      )}
      <div className="page-header">
        <h2>种草内容生产飞轮总控台</h2>
        <p>卖点提炼→文案→素材→审核→分发 · AI驱动全流程 · 今日产量{flywheelKPIs.todayProduced}条 · 自动建计划{flywheelKPIs.todayAutoLaunched}个 · 零人工率{flywheelKPIs.autoRate}%</p>
      </div>
      <div className="page-content">

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="CreativeFatigue-MAB" color="#e8365d" />
          <ModelBadge name="ContentQuality-Scorer" color="#e8365d" />
          <ModelBadge name="MultiLingual-ContentLLM" color="#e8365d" />
        </div>

        {/* KPI总览 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: '飞轮转速', value: `${flywheelKPIs.flywheelSpeed}`, unit: '/100', color: '#e8365d' },
            { label: '今日内容产量', value: `${flywheelKPIs.todayProduced}`, unit: '条', color: '#ff7a95' },
            { label: '自动建计划', value: `${flywheelKPIs.todayAutoLaunched}`, unit: '个', color: '#34d399' },
            { label: '零人工率', value: `${flywheelKPIs.autoRate}`, unit: '%', color: '#60a5fa' },
            { label: 'AI操作总次数', value: `${flywheelKPIs.aiOps}`, unit: '次', color: '#fbbf24' },
            { label: '整体ROI', value: `${flywheelKPIs.overallROI}`, unit: 'x', color: '#e8365d' },
            { label: '当前瓶颈', value: flywheelKPIs.bottleneck, unit: '', color: '#f59e0b' },
          ].map((m, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: 12 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color }}>{m.value}<span style={{ fontSize: '0.6rem' }}>{m.unit}</span></div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className={`tab ${tab === 'flywheel' ? 'active' : ''}`} onClick={() => setTab('flywheel')}>种草飞轮总览</button>
          <button className={`tab ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>数据回流驱动</button>
          <button className={`tab ${tab === 'output' ? 'active' : ''}`} onClick={() => setTab('output')}>内容产量分析</button>
        </div>

        {tab === 'flywheel' && (
          <>
            {/* 飞轮可视化 */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-title"><RefreshCw size={16} /> 种草内容生产飞轮</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', padding: '8px 0' }}>
                {flywheelStages.map((stage, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div onClick={() => navigate(stage.link)} style={{ width: 130, padding: '12px 10px', borderRadius: 10, border: `2px solid ${stage.color}`, background: `${stage.color}10`, textAlign: 'center', cursor: 'pointer' }}>
                      <stage.icon size={18} color={stage.color} style={{ marginBottom: 4 }} />
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: stage.color, marginBottom: 4 }}>{stage.name}</div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: 4 }}>{stage.throughput}</div>
                      <div style={{ fontSize: '0.58rem', padding: '2px 6px', borderRadius: 4, background: `${healthColor[stage.health]}20`, color: healthColor[stage.health], display: 'inline-block' }}>
                        {stage.health === 'good' ? '正常' : stage.health === 'warning' ? '注意' : '异常'}
                      </div>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: 4 }}>{stage.detail}</div>
                      <button onClick={(e) => handleDispatch(e, i)} style={{
                        marginTop: 6, width: '100%', padding: '4px 6px', border: `1px solid ${stage.color}`,
                        background: 'transparent', color: stage.color, borderRadius: 6,
                        fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3,
                      }}>
                        <Send size={9} /> 下发到 {flywheelStages[(i + 1) % flywheelStages.length].name}
                      </button>
                    </div>
                    {i < flywheelStages.length - 1 && (
                      <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                ))}
                <ArrowRight size={16} color="var(--text-muted)" />
                <div style={{ fontSize: '0.65rem', color: '#e8365d', fontWeight: 600, flexShrink: 0 }}>↑ 驱动上游</div>
              </div>
            </div>

            {/* 瓶颈分析 */}
            <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}>
              <div className="section-title"><AlertTriangle size={16} color="#f59e0b" /> 当前瓶颈：{bottleneckAnalysis.current}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'GPU利用率', value: `${bottleneckAnalysis.utilization}%`, color: '#f59e0b' },
                  { label: '队列积压', value: `${bottleneckAnalysis.queueLength}个`, color: '#f59e0b' },
                  { label: '平均等待', value: bottleneckAnalysis.avgWait, color: '#f59e0b' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginBottom: 6 }}>AI建议：{bottleneckAnalysis.suggestion}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>预期影响：{bottleneckAnalysis.impact}</div>
            </div>

            {/* 今日产量快览 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {[
                { label: '种草笔记', value: productionToday.grassNotes, color: '#e8365d' },
                { label: '视频素材', value: productionToday.videoMaterials, color: '#ff7a95' },
                { label: 'KOC创作简报', value: productionToday.kocBriefs, color: '#ff9eb5' },
                { label: '审核通过', value: productionToday.reviewPassed, color: '#34d399' },
                { label: '自动建计划', value: productionToday.autoLaunched, color: '#60a5fa' },
                { label: '总在投内容', value: productionToday.totalCreatives, color: '#fbbf24' },
              ].map((m, i) => (
                <div key={i} className="card" style={{ textAlign: 'center', padding: 12 }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'feedback' && (
          <div className="card">
            <div className="section-title"><Activity size={16} /> 数据回流驱动决策（今日18条）</div>
            {dataFeedbackActions.map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < dataFeedbackActions.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 38, flexShrink: 0, fontFamily: 'monospace' }}>{action.time}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 4, background: 'rgba(232,54,93,0.08)', color: '#e8365d' }}>{action.source}</span>
                    <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: 4, background: action.status === 'executing' ? 'rgba(52,211,153,0.1)' : action.status === 'completed' ? 'rgba(96,165,250,0.1)' : 'rgba(245,158,11,0.1)', color: action.status === 'executing' ? '#34d399' : action.status === 'completed' ? '#60a5fa' : '#fbbf24' }}>
                      {action.status === 'executing' ? '执行中' : action.status === 'completed' ? '已完成' : '队列中'}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>→ {action.target}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>信号：{action.signal}</div>
                  <div style={{ fontSize: '0.72rem' }}>行动：{action.action}</div>
                  <div style={{ fontSize: '0.68rem', color: '#34d399' }}>预期：{action.impact}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'output' && (
          <div>
            <div className="grid-2">
              <div className="card">
                <div className="section-title"><BarChart3 size={16} /> 内容类型ROI对比</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={contentTypeData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={65} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="roi" fill="#e8365d" name="ROI" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="section-title"><Activity size={16} /> 各类型CTR对比</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={contentTypeData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={65} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="ctr" fill="#ff7a95" name="CTR%" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
