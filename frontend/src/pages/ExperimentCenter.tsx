import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, TrendingUp, Activity, Clock, Brain, ArrowUpRight, X } from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

const experimentAIGroups: AIConfigGroup[] = [
  {
    title: '实验设计',
    icon: <Target size={16} />,
    params: [
      createParam('min_sample_size', '最小样本量', 5000, '个', '实验达到统计显著性所需的最小样本量', 5000, 91, { min: 100, max: 100000, step: 100, autoTuneEnabled: true, learningDataPoints: 12000, lastAdjusted: '8小时前', adjustHistory: [{ time: '1周前', from: '3000', to: '4000', reason: '样本量不足导致误判率偏高' }, { time: '3天前', from: '4000', to: '5000', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('significance_threshold', '统计显著性阈值', 95, '%', '实验结论成立所需的最低统计显著性水平', 95, 94, { min: 80, max: 99, type: 'percentage', autoTuneEnabled: true, learningDataPoints: 15000, lastAdjusted: '12小时前', adjustHistory: [{ time: '1周前', from: '90', to: '93', reason: '提升实验结论可信度' }, { time: '3天前', from: '93', to: '95', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('max_experiment_days', '实验最长运行天数', 14, '天', '实验超过此天数将自动结束并输出结论', 14, 88, { min: 1, max: 60, autoTuneEnabled: true, learningDataPoints: 8000, lastAdjusted: '6小时前', adjustHistory: [{ time: '5天前', from: '21', to: '18', reason: '缩短实验周期提升迭代速度' }, { time: '昨日', from: '18', to: '14', reason: 'AI根据近7日数据自动优化' }] }),
    ],
  },
  {
    title: '自动化实验',
    icon: <Brain size={16} />,
    params: [
      createParam('auto_split_ratio', '自动分流比例', 10, '%', '新实验自动分配的流量比例', 10, 87, { min: 1, max: 50, type: 'percentage', autoTuneEnabled: true, learningDataPoints: 10000, lastAdjusted: '4小时前', adjustHistory: [{ time: '4天前', from: '5', to: '8', reason: '实验速度偏慢，增大分流' }, { time: '昨日', from: '8', to: '10', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('mab_exploration', 'MAB探索系数', 0.15, '', '多臂赌博机算法的探索与利用平衡系数', 0.15, 85, { min: 0.01, max: 1.0, step: 0.01, autoTuneEnabled: true, learningDataPoints: 9000, lastAdjusted: '3小时前', adjustHistory: [{ time: '3天前', from: '0.2', to: '0.18', reason: '探索过多导致收敛慢' }, { time: '昨日', from: '0.18', to: '0.15', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('auto_graduate_threshold', '胜出变体自动全量阈值', 95, '%', '变体胜出概率达到此值时自动推全量', 95, 90, { min: 90, max: 99, type: 'percentage', autoTuneEnabled: true, learningDataPoints: 11000, lastAdjusted: '10小时前', adjustHistory: [{ time: '1周前', from: '92', to: '93', reason: '降低误推全量风险' }, { time: '3天前', from: '93', to: '95', reason: 'AI根据近7日数据自动优化' }] }),
    ],
  },
]

const experimentLearningStatus: AILearningStatus = {
  modelVersion: 'v1.9.0-experiment',
  lastTraining: '35分钟前',
  totalDataPoints: 89000,
  avgConfidence: 87,
  autoAdjustCount24h: 8,
  learningRate: '0.003',
  nextTraining: '25分钟后',
  improvementRate: '+7.5%',
}

const kpis = [
  { label: '进行中实验', value: '12', icon: Target, color: '#6366f1' },
  { label: '今日新增', value: '3', icon: TrendingUp, color: '#22c55e' },
  { label: '平均实验周期', value: '4.2天', icon: Clock, color: '#f59e0b' },
  { label: '实验→正式采纳率', value: '34%', icon: Activity, color: '#ec4899' },
]

const activeExperiments = [
  { name: '反转Hook vs 悬疑Hook', type: '素材', variantA: '反转Hook开头', variantB: '悬疑Hook开头', metricLabel: 'CTR', metricA: '5.8%', metricB: '4.2%', significance: 97, status: '已达显著', recommendation: '推荐采纳A', endDate: '04-06' },
  { name: '抖音oCPM vs oCPC出价对比', type: '出价', variantA: 'oCPM智能出价', variantB: 'oCPC手动出价', metricLabel: 'ROI', metricA: '1.8x', metricB: '1.5x', significance: 85, status: '收集中', recommendation: null, endDate: '04-10' },
  { name: '25-34F vs 18-45F', type: '受众', variantA: '25-34岁女性', variantB: '18-45岁女性', metricLabel: 'CPA', metricA: '¥80', metricB: '¥120', significance: 92, status: '已达显著', recommendation: '推荐采纳A', endDate: '04-05' },
  { name: '竖版 vs 横版素材', type: '素材', variantA: '9:16竖版', variantB: '16:9横版', metricLabel: 'CVR', metricA: '3.2%', metricB: '2.8%', significance: 68, status: '收集中', recommendation: null, endDate: '04-12' },
  { name: '兴趣定向 vs Lookalike', type: '定向', variantA: '兴趣关键词定向', variantB: '1% Lookalike', metricLabel: 'ROI', metricA: '1.6x', metricB: '1.9x', significance: 91, status: '已达显著', recommendation: '推荐采纳B', endDate: '04-07' },
  { name: '最低成本 vs 目标成本', type: '出价', variantA: '最低成本策略', variantB: '目标成本¥100', metricLabel: 'CPA', metricA: '¥73', metricB: '¥93', significance: 78, status: '待决策', recommendation: null, endDate: '04-09' },
]

const completedExperiments = [
  { name: '真人出镜 vs 动画素材', winner: 'A', lift: '+22% CTR', applied: '唇釉系列、眼影盘' },
  { name: '前3秒节奏快剪 vs 慢入', winner: 'A', lift: '+18% 完播率', applied: '全业务线' },
  { name: 'Broad定向 vs 精准定向', winner: 'B', lift: '+15% ROI', applied: '粉底液系列' },
  { name: 'oCPM vs oCPC', winner: 'A', lift: '+8% CVR', applied: '唇釉系列、护肤套装' },
  { name: '文案情感诉求 vs 理性诉求', winner: 'A', lift: '+12% CTR', applied: '眼影盘' },
  { name: '落地页长表单 vs 短表单', winner: 'B', lift: '+25% CVR', applied: '全业务线' },
  { name: '周末投放 vs 工作日投放', winner: 'A', lift: '+10% CPA降低', applied: '唇釉系列' },
  { name: '自动版位 vs 手动版位', winner: 'A', lift: '+6% ROI', applied: '粉底液、护肤套装' },
  { name: '高预算快速学习 vs 低预算慢学习', winner: 'B', lift: '+14% 稳定性', applied: '眼影盘' },
  { name: '多语言本地化 vs 英文统一', winner: 'A', lift: '+30% CTR', applied: '全业务线' },
]

const typeChartData = [
  { type: '素材', total: 28, success: 19 },
  { type: '受众', total: 16, success: 9 },
  { type: '出价', total: 14, success: 8 },
  { type: '定向', total: 10, success: 6 },
]

const aiExperiments = [
  { name: 'AI发现: 夜间时段CTR异常高', reason: '系统检测到22:00-01:00 CTR比均值高35%，自动创建时段对比实验', status: '已启动' },
  { name: 'AI发现: 新素材风格转化潜力', reason: '基于近期高CTR素材特征，自动生成变体测试', status: '准备中' },
  { name: 'AI发现: 受众疲劳信号', reason: '核心受众CTR连续3天下降，自动启动扩展受众实验', status: '已启动' },
]

const typeColors: Record<string, string> = { '素材': '#6366f1', '受众': '#22c55e', '出价': '#f59e0b', '定向': '#ec4899' }

// ─── Experiment Drill Panel ───────────────────────────────────────────────────
function ExperimentDrillPanel({ exp, onClose }: { exp: typeof activeExperiments[0]; onClose: () => void }) {
  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--surface)', borderLeft: '1px solid var(--border)',
    zIndex: 900, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
    padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16,
  }
  const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 899 }
  const row = (label: string, value: React.ReactNode) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
  const btn = (label: string, color = '#6366f1') => (
    <button key={label} onClick={onClose} style={{
      padding: '8px 14px', borderRadius: 8, border: `1px solid ${color}`,
      background: `${color}20`, color, fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
    }}>{label}</button>
  )
  const sampleSize = Math.round(45000 + Math.random() * 10000)
  const ciLow = (exp.significance - 4).toFixed(1)
  const ciHigh = (exp.significance + 2).toFixed(1)
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exp.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{exp.type}实验 · 截止 {exp.endDate}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>

        <div style={{ padding: 14, background: 'rgba(99,102,241,0.06)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: '#6366f1' }}>假设 & 实验设计</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            假设 "{exp.variantA}" 比 "{exp.variantB}" 在 {exp.metricLabel} 上表现更优，
            通过 50/50 随机流量分配进行 A/B 测试，目标 {exp.metricLabel} 提升 ≥ 10%，
            显著性水平 α=0.05，期望功效 80%。
          </div>
        </div>

        <div style={{ padding: 14, background: 'var(--bg-primary, rgba(0,0,0,0.04))', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 10 }}>样本 & 显著性</div>
          {row('样本量 (A+B)', sampleSize.toLocaleString())}
          {row('显著性水平', <span style={{ color: exp.significance >= 95 ? '#22c55e' : exp.significance >= 85 ? '#f59e0b' : '#ef4444' }}>{exp.significance}%</span>)}
          {row('置信区间', `${ciLow}% ~ ${ciHigh}%`)}
          {row('期望功效', '80%')}
          {row('最小可检测效应', '5%')}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: '变体A', name: exp.variantA, metric: exp.metricA, color: '#6366f1' },
            { label: '变体B', name: exp.variantB, metric: exp.metricB, color: '#f59e0b' },
          ].map(v => (
            <div key={v.label} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${v.color}40`, background: `${v.color}08` }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{v.label}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 6 }}>{v.name}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: v.color }}>{exp.metricLabel} {v.metric}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>CTR 4.2% · CVR 2.1% · ROAS 1.8x</div>
            </div>
          ))}
        </div>

        {exp.recommendation && (
          <div style={{ padding: 12, background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>胜出结论</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {exp.recommendation} — 实验已达统计显著性 ({exp.significance}%)，建议推全量。
              预计提升效益: {exp.metricLabel} +{(parseFloat(exp.metricA) - parseFloat(exp.metricB)).toFixed(1) || '1.6'}pp
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>推广计划</div>
          {[
            { phase: '第1阶段 (当前)', traffic: '50%', desc: 'A/B 随机分流测试' },
            { phase: '第2阶段', traffic: '80%', desc: '胜出变体扩量灰度' },
            { phase: '第3阶段', traffic: '100%', desc: '全量推送' },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start', fontSize: '0.75rem' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.phase} · 流量 {p.traffic}</div>
                <div style={{ color: 'var(--text-muted)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {btn('推全量', '#22c55e')}
          {btn('延长测试', '#6366f1')}
          {btn('停止测试', '#ef4444')}
          {btn('复制实验', '#f59e0b')}
        </div>
      </div>
    </>
  )
}

function CompletedDrillPanel({ exp, onClose }: { exp: typeof completedExperiments[0]; onClose: () => void }) {
  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--surface)', borderLeft: '1px solid var(--border)',
    zIndex: 900, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
    padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16,
  }
  const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 899 }
  const row = (label: string, value: React.ReactNode) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
  const btn = (label: string, color = '#6366f1') => (
    <button key={label} onClick={onClose} style={{
      padding: '8px 14px', borderRadius: 8, border: `1px solid ${color}`,
      background: `${color}20`, color, fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
    }}>{label}</button>
  )
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exp.name}</div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>
        <div style={{ padding: 12, background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>胜出: 变体{exp.winner}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>提升幅度: {exp.lift} · 已应用于: {exp.applied}</div>
        </div>
        {row('实验名称', exp.name)}
        {row('胜出变体', `变体${exp.winner}`)}
        {row('提升效果', <span style={{ color: '#22c55e' }}>{exp.lift}</span>)}
        {row('应用范围', exp.applied)}
        {row('CTR A vs B', '5.2% vs 3.8%')}
        {row('CVR A vs B', '3.1% vs 2.6%')}
        {row('ROAS A vs B', '1.85x vs 1.62x')}
        {row('最终显著性', '97.3%')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {btn('复制实验', '#6366f1')}
          {btn('查看报告', '#22c55e')}
        </div>
      </div>
    </>
  )
}

const statusStyles: Record<string, { bg: string; color: string }> = {
  '收集中': { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  '已达显著': { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  '待决策': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
}

export default function ExperimentCenter() {
  useRegisterAIConfig(experimentAIGroups, experimentLearningStatus, '实验中心')
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [drillActive, setDrillActive] = useState<typeof activeExperiments[0] | null>(null)
  const [drillCompleted, setDrillCompleted] = useState<typeof completedExperiments[0] | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)

  const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }

  return (
    <div style={{ padding: '32px' }}>
      {drillActive && <ExperimentDrillPanel exp={drillActive} onClose={() => setDrillActive(null)} />}
      {drillCompleted && <CompletedDrillPanel exp={drillCompleted} onClose={() => setDrillCompleted(null)} />}
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>A/B 实验中心</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>科学化实验设计与结果分析，驱动增长决策</p>

      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="BayesianAB-Engine" color="#e8365d" />
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        <ModelBadge name="CVR-Predictor-ESMM" color="#e8365d" />
        <ModelBadge name="Shapley-Attribution" color="#10b981" />
        <ModelBadge name="ROAS-Forecaster" color="#10b981" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([['active', '进行中的实验'], ['history', '实验历史与洞察']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            background: tab === key ? '#6366f1' : 'var(--surface)', color: tab === key ? '#fff' : 'var(--text-muted)',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'active' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {kpis.map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{...card, cursor: 'pointer'}} onClick={() => setSelectedDetail({type:'kpi',data:{label,value,color}})}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
                  <Icon size={16} style={{ color }} />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>进行中实验</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {activeExperiments.map((exp) => {
              const sSt = statusStyles[exp.status] || statusStyles['收集中']
              return (
                <div key={exp.name} style={{ ...card, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => setDrillActive(exp)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exp.name}</span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: typeColors[exp.type] + '22', color: typeColors[exp.type] }}>{exp.type}实验</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: 'rgba(99,102,241,0.08)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>变体A</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{exp.variantA}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4, color: '#818cf8' }}>{exp.metricLabel} {exp.metricA}</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>变体B</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{exp.variantB}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4, color: '#f59e0b' }}>{exp.metricLabel} {exp.metricB}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6, background: sSt.bg, color: sSt.color }}>{exp.status}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>显著性 {exp.significance}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {exp.recommendation && <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>{exp.recommendation}</span>}
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>预计 {exp.endDate}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'history' && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>已完成实验</h2>
          <div style={{ ...card, marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['实验名称', '胜出方', '提升幅度', '已应用业务线'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedExperiments.map((exp) => (
                  <tr key={exp.name} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => setDrillCompleted(exp)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '10px 16px', fontWeight: 500 }}>{exp.name}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>变体{exp.winner}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#22c55e', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowUpRight size={13} />{exp.lift}</span>
                    </td>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{exp.applied}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>各类型实验数量与成功率</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeChartData} barGap={4}>
                  <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="total" name="总实验数" fill="#6366f1" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(data: any) => { if (data && data.type) setSelectedDetail({type:'typeChart',data}) }} />
                  <Bar dataKey="success" name="成功数" fill="#22c55e" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(data: any) => { if (data && data.type) setSelectedDetail({type:'typeChart',data}) }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Brain size={16} style={{ color: '#ff9eb5' }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>AI 自动实验</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {aiExperiments.map((ai) => (
                  <div key={ai.name} onClick={() => setSelectedDetail({type:'aiExp',data:ai})} style={{ background: 'rgba(167,139,250,0.08)', borderRadius: 8, padding: '12px 14px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{ai.name}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, background: ai.status === '已启动' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: ai.status === '已启动' ? '#22c55e' : '#f59e0b' }}>{ai.status}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{ai.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
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
                {selectedDetail.type === 'kpi' && `${selectedDetail.data.label} 详情`}
                {selectedDetail.type === 'aiExp' && `AI自动实验 · ${selectedDetail.data.name}`}
                {selectedDetail.type === 'typeChart' && `${selectedDetail.data.type}类实验详情`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'kpi' && (() => {
              const kpiLabel = selectedDetail.data.label
              if (kpiLabel === '进行中实验') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#6366f1'}}>12</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>进行中实验</div>
                  </div>
                  <table className="data-table">
                    <thead><tr><th>实验名称</th><th>类型</th><th>显著性</th><th>状态</th></tr></thead>
                    <tbody>
                      {activeExperiments.map(exp => (
                        <tr key={exp.name} onClick={() => { setSelectedDetail(null); setDrillActive(exp); }} style={{cursor:'pointer'}}>
                          <td style={{fontWeight:600,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{exp.name}</td>
                          <td><span style={{fontSize:'0.7rem',padding:'2px 6px',borderRadius:4,background:(typeColors[exp.type]||'#6366f1')+'22',color:typeColors[exp.type]}}>{exp.type}</span></td>
                          <td style={{fontWeight:600,color: exp.significance >= 95 ? '#22c55e' : '#f59e0b'}}>{exp.significance}%</td>
                          <td>{exp.status}</td>
                        </tr>
                      ))}
                      {/* Extra experiments to reach 12 */}
                      {[{n:'新落地页A/B',t:'素材',sig:'72%',s:'收集中'},{n:'高价品出价策略',t:'出价',sig:'58%',s:'收集中'},{n:'节假日定向测试',t:'定向',sig:'45%',s:'收集中'},{n:'视频封面优化',t:'素材',sig:'63%',s:'收集中'},{n:'社群用户专属投放',t:'受众',sig:'81%',s:'收集中'},{n:'夜间时段加码测试',t:'定向',sig:'77%',s:'待决策'}].map(e=>(
                        <tr key={e.n}><td style={{fontWeight:600}}>{e.n}</td><td><span style={{fontSize:'0.7rem',padding:'2px 6px',borderRadius:4,background:(typeColors[e.t]||'#6366f1')+'22',color:typeColors[e.t]||'#6366f1'}}>{e.t}</span></td><td style={{fontWeight:600,color:'#f59e0b'}}>{e.sig}</td><td>{e.s}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
              if (kpiLabel === '今日新增') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#22c55e'}}>3</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>今日新增实验</div>
                  </div>
                  {[
                    {name:'反转Hook vs 悬疑Hook',type:'素材',creator:'AI自动创建',time:'10:15',reason:'AI检测到Hook类型对CTR影响显著，自动创建对比实验'},
                    {name:'社群用户专属投放',type:'受众',creator:'运营-李婷',time:'11:30',reason:'私域社群用户画像独特，需验证专属投放策略效果'},
                    {name:'夜间时段加码测试',type:'定向',creator:'AI自动创建',time:'14:08',reason:'系统检测到22:00-01:00 CTR异常高35%，自动创建验证实验'},
                  ].map(exp=>(
                    <div key={exp.name} style={{padding:16,background:'rgba(34,197,94,0.04)',borderRadius:10,border:'1px solid rgba(34,197,94,0.15)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <span style={{fontWeight:700,fontSize:'0.9rem'}}>{exp.name}</span>
                        <span style={{fontSize:'0.7rem',padding:'2px 8px',borderRadius:6,background:(typeColors[exp.type]||'#6366f1')+'22',color:typeColors[exp.type]||'#6366f1'}}>{exp.type}</span>
                      </div>
                      {[{l:'创建者',v:exp.creator},{l:'创建时间',v:`今天 ${exp.time}`},{l:'创建原因',v:exp.reason}].map(r=>(
                        <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',fontSize:'0.78rem',borderBottom:'1px solid rgba(0,0,0,0.04)',gap:8}}>
                          <span style={{color:'var(--text-muted)',flexShrink:0}}>{r.l}</span>
                          <span style={{fontWeight:500,textAlign:'right'}}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
              if (kpiLabel === '平均实验周期') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#f59e0b'}}>4.2天</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>平均实验周期</div>
                  </div>
                  <table className="data-table">
                    <thead><tr><th>实验类型</th><th>平均周期</th><th>最短</th><th>最长</th><th>实验数</th></tr></thead>
                    <tbody>
                      {[{t:'素材',avg:'3.5天',min:'2天',max:'7天',n:28},{t:'受众',avg:'4.8天',min:'3天',max:'10天',n:16},{t:'出价',avg:'5.2天',min:'3天',max:'14天',n:14},{t:'定向',avg:'3.8天',min:'2天',max:'8天',n:10}].map(r=>(
                        <tr key={r.t}><td style={{fontWeight:600}}><span style={{padding:'2px 6px',borderRadius:4,background:(typeColors[r.t]||'#6366f1')+'22',color:typeColors[r.t]||'#6366f1',fontSize:'0.72rem'}}>{r.t}</span></td><td style={{fontWeight:700,color:'#f59e0b'}}>{r.avg}</td><td>{r.min}</td><td>{r.max}</td><td>{r.n}个</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{padding:12,background:'rgba(245,158,11,0.08)',borderRadius:8,fontSize:'0.78rem',color:'var(--text-muted)',lineHeight:1.6}}>
                    素材类实验周期最短（平均3.5天），因为CTR/CVR等指标波动较小，较快达到统计显著性。出价类实验周期最长（平均5.2天），需要更多数据验证ROI稳定性。AI建议将最小样本量从5000提高到8000以提升结论可靠性。
                  </div>
                </div>
              )
              // 实验→正式采纳率 34%
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#ec4899'}}>34%</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>实验→正式采纳率</div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                    {[{l:'总完成实验',v:'68',c:'#6366f1'},{l:'已采纳',v:'23',c:'#22c55e'},{l:'累计提升',v:'+18.5% ROI',c:'#ec4899'}].map(s=>(
                      <div key={s.l} style={{textAlign:'center',padding:12,background:`${s.c}10`,borderRadius:8}}>
                        <div style={{fontSize:'1.2rem',fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>已采纳实验及影响</div>
                    {completedExperiments.slice(0,6).map(exp=>(
                      <div key={exp.name} style={{padding:'10px 14px',background:'rgba(34,197,94,0.04)',borderRadius:8,border:'1px solid rgba(34,197,94,0.1)',marginBottom:8,cursor:'pointer'}}
                        onClick={()=>{setSelectedDetail(null);setDrillCompleted(exp)}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{fontWeight:600,fontSize:'0.82rem'}}>{exp.name}</span>
                          <span style={{color:'#22c55e',fontWeight:600,fontSize:'0.78rem'}}>{exp.lift}</span>
                        </div>
                        <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:2}}>胜出: 变体{exp.winner} · 已应用: {exp.applied}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'aiExp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">实验概要</div>
                  <table className="data-table">
                    <thead><tr><th>属性</th><th>值</th></tr></thead>
                    <tbody>
                      <tr><td>实验名称</td><td style={{fontWeight:600}}>{selectedDetail.data.name}</td></tr>
                      <tr><td>发现原因</td><td>{selectedDetail.data.reason}</td></tr>
                      <tr><td>状态</td><td style={{fontWeight:600,color: selectedDetail.data.status === '已启动' ? '#22c55e' : '#f59e0b'}}>{selectedDetail.data.status}</td></tr>
                      <tr><td>检测时间</td><td>2026-04-04 10:30</td></tr>
                      <tr><td>预期完成</td><td>2026-04-11</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">变体设计</div>
                  <table className="data-table">
                    <thead><tr><th>变体</th><th>描述</th><th>流量占比</th><th>预期提升</th></tr></thead>
                    <tbody>
                      <tr><td style={{fontWeight:600}}>Control</td><td>当前策略（不变）</td><td>50%</td><td>-</td></tr>
                      <tr><td style={{fontWeight:600}}>Treatment</td><td>AI建议的新策略</td><td>50%</td><td style={{color:'#22c55e'}}>+15~25%</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">指标监控</div>
                  <table className="data-table">
                    <thead><tr><th>指标</th><th>Control</th><th>Treatment</th><th>差异</th><th>置信度</th></tr></thead>
                    <tbody>
                      {[{m:'CTR',c:'3.8%',t:'4.6%',d:'+21.1%',ci:'72%'},{m:'CVR',c:'2.1%',t:'2.4%',d:'+14.3%',ci:'65%'},{m:'CPA',c:'¥95',t:'¥85',d:'-10.5%',ci:'58%'}].map(r => (
                        <tr key={r.m}><td style={{fontWeight:600}}>{r.m}</td><td>{r.c}</td><td>{r.t}</td><td style={{color:'#22c55e',fontWeight:600}}>{r.d}</td><td style={{color:'#f59e0b'}}>{r.ci}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedDetail.type === 'typeChart' && (() => {
              const d = selectedDetail.data
              const typeExps = activeExperiments.filter(e => e.type === d.type)
              const typeCompleted = completedExperiments.filter(e => {
                const expType = e.name.includes('素材') || e.name.includes('真人') || e.name.includes('节奏') || e.name.includes('文案') ? '素材' :
                  e.name.includes('定向') || e.name.includes('Broad') || e.name.includes('版位') ? '定向' :
                  e.name.includes('出价') || e.name.includes('oCPM') || e.name.includes('预算') ? '出价' : '受众'
                return expType === d.type
              })
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{display:'inline-block',padding:'4px 14px',borderRadius:8,background:(typeColors[d.type]||'#6366f1')+'22',color:typeColors[d.type],fontWeight:700,fontSize:'0.85rem',marginBottom:8}}>{d.type}实验</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {[{l:'总实验数',v:d.total,c:typeColors[d.type]||'#6366f1'},{l:'成功数',v:d.success,c:'#22c55e'},{l:'成功率',v:`${Math.round(d.success/d.total*100)}%`,c:'#f59e0b'}].map(s=>(
                        <div key={s.l} style={{textAlign:'center',padding:10,background:`${s.c}10`,borderRadius:8}}>
                          <div style={{fontSize:'1.3rem',fontWeight:700,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {typeExps.length > 0 && (
                    <div>
                      <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>进行中的{d.type}实验</div>
                      {typeExps.map(exp=>(
                        <div key={exp.name} style={{padding:12,background:'rgba(99,102,241,0.04)',borderRadius:8,border:'1px solid rgba(99,102,241,0.1)',marginBottom:8,cursor:'pointer'}}
                          onClick={()=>{setSelectedDetail(null);setDrillActive(exp)}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontWeight:600,fontSize:'0.82rem'}}>{exp.name}</span>
                            <span style={{fontSize:'0.72rem',padding:'2px 6px',borderRadius:4,background:statusStyles[exp.status]?.bg,color:statusStyles[exp.status]?.color}}>{exp.status}</span>
                          </div>
                          <div style={{display:'flex',gap:12,marginTop:6,fontSize:'0.72rem',color:'var(--text-muted)'}}>
                            <span>A: {exp.metricLabel} {exp.metricA}</span>
                            <span>B: {exp.metricLabel} {exp.metricB}</span>
                            <span>显著性: {exp.significance}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {typeCompleted.length > 0 && (
                    <div>
                      <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>已完成的{d.type}实验</div>
                      {typeCompleted.map(exp=>(
                        <div key={exp.name} style={{padding:12,background:'rgba(34,197,94,0.04)',borderRadius:8,border:'1px solid rgba(34,197,94,0.1)',marginBottom:8,cursor:'pointer'}}
                          onClick={()=>{setSelectedDetail(null);setDrillCompleted(exp)}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontWeight:600,fontSize:'0.82rem'}}>{exp.name}</span>
                            <span style={{color:'#22c55e',fontWeight:600,fontSize:'0.78rem'}}>{exp.lift}</span>
                          </div>
                          <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:2}}>胜出: 变体{exp.winner} · 应用: {exp.applied}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{padding:12,background:`${typeColors[d.type]||'#6366f1'}08`,borderRadius:8,fontSize:'0.78rem',color:'var(--text-muted)',lineHeight:1.6}}>
                    {d.type}类实验是玛丽黛佳投放优化的{d.type === '素材' ? '核心手段' : d.type === '受众' ? '精准触达关键' : d.type === '出价' ? '成本控制关键' : '流量优化手段'}。
                    成功率 {Math.round(d.success/d.total*100)}% {Math.round(d.success/d.total*100) > 65 ? '表现优秀' : '仍有提升空间'}。
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
