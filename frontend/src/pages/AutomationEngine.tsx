import React, { useState } from 'react'
import {
  Bot, Zap, Target, Activity, Clock, AlertTriangle,
  ArrowUpRight, Settings, RefreshCw, Shield, X
} from 'lucide-react'
import ModelBadge from '../components/ModelBadge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'

const automationAIGroups: AIConfigGroup[] = [
  {
    title: '规则引擎',
    icon: <Settings size={16} />,
    params: [
      createParam('rule_exec_frequency', '规则执行频率', 5, '分钟', '自动化规则的执行检查间隔', 5, 92, { min: 1, max: 60, autoTuneEnabled: true, learningDataPoints: 22000, lastAdjusted: '1小时前' }),
      createParam('condition_trigger_delay', '条件触发延迟', 10, '秒', '条件满足后延迟执行的等待时间，防止误触发', 10, 89, { min: 0, max: 300, autoTuneEnabled: true, learningDataPoints: 18000, lastAdjusted: '2小时前' }),
      createParam('conflict_detection_sensitivity', '规则冲突检测灵敏度', 8, '', '规则间冲突检测的灵敏度等级，越高越严格', 8, 91, { min: 1, max: 10, autoTuneEnabled: true, learningDataPoints: 15000, lastAdjusted: '4小时前' }),
    ],
  },
  {
    title: '自动化安全',
    icon: <Shield size={16} />,
    params: [
      createParam('max_ops_per_action', '单次最大操作数', 100, '个', '单次自动化执行允许的最大操作数量', 100, 93, { min: 1, max: 1000, autoTuneEnabled: true, learningDataPoints: 20000, lastAdjusted: '3小时前' }),
      createParam('manual_approval_threshold', '人工审批金额阈值', 5000, '¥', '超过此金额的操作需人工审批', 5000, 90, { min: 100, max: 100000, autoTuneEnabled: true, learningDataPoints: 16000, lastAdjusted: '6小时前' }),
      createParam('auto_rollback_trigger', '自动回滚触发条件', 'ROI下降>20%', '', '触发自动回滚的条件', 'ROI下降>20%', 88, { type: 'select', options: ['ROI下降>10%', 'ROI下降>20%', 'ROI下降>30%', 'CPA上升>50%'], autoTuneEnabled: true, learningDataPoints: 12000, lastAdjusted: '8小时前' }),
    ],
  },
]

const automationLearningStatus: AILearningStatus = {
  modelVersion: 'v2.0.0-automation',
  lastTraining: '35分钟前',
  totalDataPoints: 167000,
  avgConfidence: 90,
  autoAdjustCount24h: 142,
  learningRate: '0.003',
  nextTraining: '25分钟后',
  improvementRate: '+13.6%',
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = '规则引擎' | '工作流看板' | '触发日志'
type Priority = '紧急' | '高' | '中' | '低'
type RuleStatus = '启用' | '暂停'
type TriggerResult = '成功' | '失败'

interface Rule {
  name: string
  condition: string
  action: string
  bizLine: string
  priority: Priority
  todayTriggers: number
  status: RuleStatus
}

interface Workflow {
  name: string
  steps: string[]
  todayRuns: number
  successRate: number
  avgDuration: string
}

interface TriggerLog {
  time: string
  ruleName: string
  condition: string
  action: string
  result: TriggerResult
  scope: string
}

// ─── Static Data ───────────────────────────────────────────────────────────────
const priorityColors: Record<Priority, string> = {
  紧急: '#ef4444',
  高: '#f97316',
  中: '#eab308',
  低: '#6b7280',
}

const rules: Rule[] = [
  { name: '低效计划关停', condition: 'ROI<0.8 且 消耗>¥500', action: '自动关停', bizLine: '全线', priority: '高', todayTriggers: 38, status: '启用' },
  { name: '素材衰退替换', condition: 'CTR下降>30% 且 运行>3天', action: '降权+触发替换', bizLine: '全线', priority: '高', todayTriggers: 22, status: '启用' },
  { name: '预算超标保护', condition: '日消耗>预算95%', action: '降速50%', bizLine: '全线', priority: '紧急', todayTriggers: 5, status: '启用' },
  { name: '起量放大', condition: '新计划ROI>1.5 且 消耗>¥200', action: '扩预算+50%', bizLine: '全线', priority: '中', todayTriggers: 32, status: '启用' },
  { name: '冷启动加速', condition: '新计划曝光<1000 且 运行>2h', action: '提价20%+扩受众', bizLine: '新品', priority: '中', todayTriggers: 18, status: '启用' },
  { name: '高频点击异常', condition: '同IP点击>20次/h', action: '标记+屏蔽IP', bizLine: '全线', priority: '高', todayTriggers: 67, status: '启用' },
  { name: '深夜降速', condition: '0:00-6:00时段', action: '降速70%', bizLine: '直播', priority: '低', todayTriggers: 12, status: '启用' },
  { name: '竞品抢量', condition: 'CPM上涨>40%且同赛道', action: '切换备用素材+提价10%', bizLine: '种草', priority: '高', todayTriggers: 8, status: '暂停' },
  { name: '合规自动下架', condition: '素材含敏感词/画面', action: '立即下架+通知', bizLine: '全线', priority: '紧急', todayTriggers: 3, status: '启用' },
  { name: '周末放量', condition: '周六日且ROI>1.0', action: '扩预算+30%', bizLine: '全线', priority: '中', todayTriggers: 15, status: '启用' },
  { name: 'Meta跨市场预算调拨', condition: 'EU ROI>3.0 且 US ROI<2.0', action: '将US预算20%转移至EU', bizLine: '国际投放', priority: '高', todayTriggers: 4, status: '启用' },
  { name: 'TikTok全球起量保护', condition: 'TikTok计划消耗<¥500且运行>4h', action: '提价15%+扩相似受众', bizLine: '国际投放', priority: '中', todayTriggers: 7, status: '启用' },
  { name: '汇率波动熔断', condition: 'EUR/CNY波动>1.5%/小时', action: '锁定预算+触发汇率对冲', bizLine: '国际投放', priority: '紧急', todayTriggers: 2, status: '启用' },
  { name: '跨境合规自检', condition: '新素材上传至GDPR地区', action: '隐私合规扫描+数据标注', bizLine: '国际投放', priority: '高', todayTriggers: 12, status: '启用' },
]

const workflows: Workflow[] = [
  { name: '生产即投流水线', steps: ['AI生成', '审核', '建计划', '上线'], todayRuns: 38, successRate: 94.7, avgDuration: '12min' },
  { name: '素材替换流水线', steps: ['衰退检测', '生成替换', '切换', '验证'], todayRuns: 22, successRate: 91.3, avgDuration: '18min' },
  { name: '预算再平衡', steps: ['小时ROI计算', '跨平台调拨', '执行'], todayRuns: 24, successRate: 98.2, avgDuration: '3min' },
  { name: '新受众探索', steps: ['高ROI人群分析', 'lookalike', '测试计划'], todayRuns: 8, successRate: 87.5, avgDuration: '25min' },
  { name: '合规自检', steps: ['素材扫描', '政策匹配', '标记/通过'], todayRuns: 478, successRate: 99.6, avgDuration: '8s' },
  { name: '异常处理', steps: ['监控指标', '判断异常', '告警/自动处理'], todayRuns: 156, successRate: 96.8, avgDuration: '45s' },
  { name: '🌍 国际投放流水线', steps: ['受众建模', 'CAPI归因校验', '多币种出价', '上线'], todayRuns: 18, successRate: 92.1, avgDuration: '15min' },
  { name: '🌍 全球预算再平衡', steps: ['各市场ROI汇总', '汇率转换', '跨市场调拨', '执行'], todayRuns: 6, successRate: 97.4, avgDuration: '5min' },
]

const triggerLogs: TriggerLog[] = [
  { time: '14:32:18', ruleName: '低效计划关停', condition: '计划#A8821 ROI=0.62 消耗¥780', action: '已关停', result: '成功', scope: '1个计划' },
  { time: '14:28:05', ruleName: '素材衰退替换', condition: '素材#M4412 CTR从2.1%降至1.3%', action: '降权并触发AI生成替换素材', result: '成功', scope: '3个广告组' },
  { time: '14:25:33', ruleName: '起量放大', condition: '计划#B2209 ROI=1.82 消耗¥340', action: '预算从¥500提至¥750', result: '成功', scope: '1个计划' },
  { time: '14:21:47', ruleName: '高频点击异常', condition: 'IP 103.xx.xx.45 点击38次/h', action: '已屏蔽该IP', result: '成功', scope: '全账户' },
  { time: '14:18:12', ruleName: '预算超标保护', condition: '账户C日消耗¥9,620/预算¥10,000', action: '降速50%', result: '成功', scope: '1个账户' },
  { time: '14:15:09', ruleName: '冷启动加速', condition: '计划#D3301 曝光680 运行2.5h', action: '提价20%+扩受众', result: '成功', scope: '1个计划' },
  { time: '14:10:44', ruleName: '合规自动下架', condition: '素材#M5501 检出敏感画面', action: '立即下架并通知运营', result: '成功', scope: '2个广告组' },
  { time: '14:05:21', ruleName: '低效计划关停', condition: '计划#A9102 ROI=0.71 消耗¥920', action: '已关停', result: '成功', scope: '1个计划' },
  { time: '13:58:36', ruleName: '竞品抢量', condition: 'CPM上涨52% 美妆赛道', action: '切换备用素材', result: '失败', scope: '规则已暂停' },
  { time: '13:52:18', ruleName: '起量放大', condition: '计划#B3380 ROI=1.67 消耗¥280', action: '预算从¥400提至¥600', result: '成功', scope: '1个计划' },
  { time: '13:45:02', ruleName: '深夜降速', condition: '测试触发(手动)', action: '降速70%', result: '成功', scope: '直播全线' },
  { time: '13:38:55', ruleName: '素材衰退替换', condition: '素材#M3298 CTR从1.8%降至1.1%', action: '降权并触发替换', result: '成功', scope: '2个广告组' },
  { time: '13:22:11', ruleName: '汇率波动熔断', condition: 'EUR/CNY 1小时内波动1.67%', action: '锁定欧洲区预算¥46,000', result: '成功', scope: '国际投放全线' },
  { time: '13:08:44', ruleName: 'Meta跨市场预算调拨', condition: 'EU ROI=3.8 US ROI=1.7', action: 'US→EU转移预算¥9,200', result: '成功', scope: '2个账户' },
  { time: '12:55:30', ruleName: 'TikTok全球起量保护', condition: 'TikTok JP计划消耗¥320 运行4.5h', action: '提价15%+扩相似受众', result: '成功', scope: '3个计划' },
  { time: '12:40:18', ruleName: '跨境合规自检', condition: '新素材#G8821上传至EU投放', action: 'GDPR合规扫描通过', result: '成功', scope: '1个素材' },
]

const categoryTriggerData = [
  { category: '效果优化', count: 70 },
  { category: '预算管控', count: 29 },
  { category: '素材管理', count: 44 },
  { category: '风控合规', count: 70 },
  { category: '冷启动', count: 18 },
  { category: '时段策略', count: 27 },
  { category: '竞品应对', count: 8 },
  { category: '国际投放', count: 25 },
]

// ─── Automation Drill Panel ───────────────────────────────────────────────────
type AutoDrillTarget =
  | { kind: 'rule'; data: Rule }
  | { kind: 'workflow'; data: Workflow }
  | { kind: 'log'; data: TriggerLog }

function AutoDrillPanel({ target, onClose }: { target: AutoDrillTarget; onClose: () => void }) {
  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
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
  const btn = (label: string, color = '#e8365d') => (
    <button key={label} onClick={onClose} style={{
      padding: '8px 14px', borderRadius: 8, border: `1px solid ${color}`,
      background: `${color}20`, color, fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
    }}>{label}</button>
  )
  const execHistory = [
    { time: '14:32:18', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '14:18:05', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '14:05:41', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '13:52:30', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '13:38:12', outcome: '失败', detail: '条件边界值，执行中断' },
    { time: '13:24:55', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '13:11:22', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '12:58:09', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '12:44:47', outcome: '成功', detail: '满足触发条件，执行完成' },
    { time: '12:31:30', outcome: '成功', detail: '满足触发条件，执行完成' },
  ]
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {target.kind === 'rule' ? target.data.name : target.kind === 'workflow' ? target.data.name : target.data.ruleName}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {target.kind === 'rule' ? `自动化规则 · ${(target.data as Rule).bizLine}` : target.kind === 'workflow' ? '工作流' : '触发日志'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>

        {target.kind === 'rule' && (() => {
          const d = target.data
          const successRate = 94.2
          const avgTimeSaved = '8.3分钟/次'
          return (
            <>
              <div style={{ padding: 14, background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {row('规则名称', d.name)}
                {row('触发条件', d.condition)}
                {row('执行动作', d.action)}
                {row('业务线', d.bizLine)}
                {row('优先级', <span style={{ color: priorityColors[d.priority], fontWeight: 700 }}>{d.priority}</span>)}
                {row('今日触发', `${d.todayTriggers}次`)}
                {row('状态', <span style={{ color: d.status === '启用' ? '#16a34a' : '#6b7280' }}>{d.status}</span>)}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>执行历史 (最近10次)</div>
                {execHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: '0.75rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 72 }}>{h.time}</span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{h.detail}</span>
                    <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, background: h.outcome === '成功' ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)', color: h.outcome === '成功' ? '#16a34a' : '#ef4444' }}>{h.outcome}</span>
                  </div>
                ))}
              </div>
              {row('成功率', <span style={{ color: '#16a34a' }}>{successRate}%</span>)}
              {row('平均节省时间', avgTimeSaved)}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('编辑规则')}
                {btn(d.status === '启用' ? '暂停' : '启用', d.status === '启用' ? '#f97316' : '#16a34a')}
                {btn('立即执行', '#3b82f6')}
                {btn('复制规则', '#6366f1')}
              </div>
            </>
          )
        })()}

        {target.kind === 'workflow' && (() => {
          const d = target.data
          return (
            <>
              <div style={{ padding: 14, background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {row('工作流名称', d.name)}
                {row('今日运行', `${d.todayRuns}次`)}
                {row('成功率', <span style={{ color: '#16a34a' }}>{d.successRate}%</span>)}
                {row('平均耗时', d.avgDuration)}
                {row('状态', <span style={{ color: '#16a34a' }}>活跃</span>)}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>流水线步骤</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {d.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ padding: '6px 10px', background: 'rgba(232,54,93,0.1)', color: '#e8365d', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>{step}</span>
                      {i < d.steps.length - 1 && <ArrowUpRight size={12} color="#9b8cb8" />}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>执行历史 (最近10次)</div>
                {execHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: '0.75rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 72 }}>{h.time}</span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{h.detail}</span>
                    <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600, background: h.outcome === '成功' ? 'rgba(22,163,74,0.15)' : 'rgba(239,68,68,0.15)', color: h.outcome === '成功' ? '#16a34a' : '#ef4444' }}>{h.outcome}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('编辑规则')}
                {btn('暂停', '#f97316')}
                {btn('立即执行', '#3b82f6')}
                {btn('复制规则', '#6366f1')}
              </div>
            </>
          )
        })()}

        {target.kind === 'log' && (() => {
          const d = target.data
          return (
            <>
              <div style={{ padding: 14, background: d.result === '成功' ? 'rgba(22,163,74,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 10, border: `1px solid ${d.result === '成功' ? 'rgba(22,163,74,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: d.result === '成功' ? '#16a34a' : '#ef4444', marginBottom: 4 }}>执行结果: {d.result}</div>
              </div>
              {row('时间', d.time)}
              {row('规则名', d.ruleName)}
              {row('触发条件', d.condition)}
              {row('执行动作', d.action)}
              {row('影响范围', d.scope)}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('查看规则', '#e8365d')}
                {btn('重新执行', '#3b82f6')}
              </div>
            </>
          )
        })()}
      </div>
    </>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AutomationEngine() {
  useRegisterAIConfig(automationAIGroups, automationLearningStatus, '自动化引擎')
  const [activeTab, setActiveTab] = useState<Tab>('规则引擎')
  const [autoDrill, setAutoDrill] = useState<AutoDrillTarget | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)
  const [autoActionMsg, setAutoActionMsg] = useState<{text: string; color: string} | null>(null)
  const [showAutoEdit, setShowAutoEdit] = useState(false)
  const [showAutoLog, setShowAutoLog] = useState(false)

  const tabs: Tab[] = ['规则引擎', '工作流看板', '触发日志']

  const summaryCards = [
    { label: '活跃规则数', value: '156', icon: Settings, color: '#e8365d' },
    { label: '今日触发', value: '847次', icon: Zap, color: '#f97316' },
    { label: '规则准确率', value: '96.2%', icon: Target, color: '#22c55e' },
    { label: '误触发率', value: '1.8%', icon: AlertTriangle, color: '#ef4444' },
  ]

  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {autoDrill && <AutoDrillPanel target={autoDrill} onClose={() => setAutoDrill(null)} />}
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,54,93,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="#e8365d" />
          </div>
          <div>
            <h1 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.5rem' }}>自动化引擎</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>规则引擎 &amp; 工作流自动化 — 驱动AI投放运营</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <Activity size={16} color="#22c55e" />
          <span>引擎运行中</span>
          <span style={{ marginLeft: 8 }}>最近刷新: 30s前</span>
        </div>
      </div>

      {/* ── AI模型支撑 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        <ModelBadge name="BidOptimizer-DQN" color="#e8365d" />
        <ModelBadge name="AnomalyDetector-LSTM" color="#f59e0b" />
        <ModelBadge name="TrafficPacing-RL" color="#e8365d" />
        <ModelBadge name="BudgetMO-Optimizer" color="#e8365d" />
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {summaryCards.map((card) => (
          <div key={card.label} onClick={() => setSelectedDetail({type:'kpi',data:card})} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{card.label}</span>
              <card.icon size={20} color={card.color} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: 10, padding: 4, border: '1px solid var(--border-light)', width: 'fit-content' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: activeTab === tab ? 'rgba(232,54,93,0.12)' : 'transparent',
              color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === '规则引擎' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>自动化规则列表</h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>共 156 条规则，显示核心规则</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>规则名称</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>触发条件</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>执行动作</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>业务线</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>优先级</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 600 }}>今日触发</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>状态</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                    onClick={() => setAutoDrill({ kind: 'rule', data: rule })}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontWeight: 600 }}>{rule.name}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', maxWidth: 200 }}>{rule.condition}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{rule.action}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{rule.bizLine}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: priorityColors[rule.priority],
                          backgroundColor: `${priorityColors[rule.priority]}20`,
                        }}
                      >
                        {rule.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-primary)' }}>{rule.todayTriggers}次</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span
                        style={
                          rule.status === '启用'
                            ? { color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }
                            : { color: 'var(--text-muted)', background: 'rgba(107,114,128,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }
                        }
                      >
                        {rule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === '工作流看板' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {workflows.map((wf, i) => (
            <div key={i} onClick={() => setAutoDrill({ kind: 'workflow', data: wf })} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,54,93,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{wf.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#22c55e' }}>
                  <RefreshCw size={12} color="#22c55e" />
                  运行中
                </div>
              </div>

              {/* Pipeline steps */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                {wf.steps.map((step, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span
                      onClick={(e) => { e.stopPropagation(); setSelectedDetail({type:'workflowStep',data:{step,stepIndex:j,totalSteps:wf.steps.length,workflow:wf.name,todayRuns:wf.todayRuns}}) }}
                      style={{ padding: '4px 8px', background: 'rgba(232,54,93,0.1)', color: 'var(--accent-primary)', borderRadius: 6, fontSize: '0.72rem', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.1)')}>
                      {step}
                    </span>
                    {j < wf.steps.length - 1 && (
                      <ArrowUpRight size={12} color="#9b8cb8" />
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>今日运行</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{wf.todayRuns}次</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>成功率</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#16a34a' }}>{wf.successRate}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>平均耗时</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} color="#9b8cb8" />
                    {wf.avgDuration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === '触发日志' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Log table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>最近触发记录</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>时间</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>规则名</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>触发条件</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>执行动作</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 600 }}>结果</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 600 }}>影响范围</th>
                  </tr>
                </thead>
                <tbody>
                  {triggerLogs.map((log, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                      onClick={() => setAutoDrill({ kind: 'log', data: log })}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} color="#9b8cb8" />
                          {log.time}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{log.ruleName}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.condition}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{log.action}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <span
                          style={
                            log.result === '成功'
                              ? { color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }
                              : { color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }
                          }
                        >
                          {log.result}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{log.scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bar chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>各规则类别触发次数分布</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryTriggerData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="category" tick={{ fill: '#9b8cb8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9b8cb8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-muted)' }}
                />
                <Bar dataKey="count" name="触发次数" fill="#e8365d" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(data: any) => { if (data && data.category) setSelectedDetail({type:'category',data}) }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
                {selectedDetail.type === 'kpi' && `${selectedDetail.data.label} 详细分析`}
                {selectedDetail.type === 'category' && `规则类别: ${selectedDetail.data.category}`}
                {selectedDetail.type === 'workflowStep' && `步骤详情: ${selectedDetail.data.step}`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'kpi' && (() => {
              const kpiLabel = selectedDetail.data.label
              if (kpiLabel === '活跃规则数') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#e8365d'}}>156</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>活跃规则总数</div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                    {[{l:'效果优化',v:'42',c:'#e8365d'},{l:'预算管控',v:'28',c:'#f97316'},{l:'素材管理',v:'35',c:'#6366f1'},{l:'风控合规',v:'51',c:'#ef4444'}].map(s=>(
                      <div key={s.l} style={{textAlign:'center',padding:12,background:`${s.c}10`,borderRadius:8}}>
                        <div style={{fontSize:'1.2rem',fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <table className="data-table">
                    <thead><tr><th>规则名</th><th>优先级</th><th>今日触发</th><th>状态</th></tr></thead>
                    <tbody>
                      {rules.map((rule, i) => (
                        <tr key={i} onClick={() => { setSelectedDetail(null); setAutoDrill({ kind: 'rule', data: rule }); }} style={{cursor:'pointer'}}><td style={{fontWeight:600}}>{rule.name}</td><td style={{color:priorityColors[rule.priority]}}>{rule.priority}</td><td>{rule.todayTriggers}次</td><td style={{color: rule.status === '启用' ? '#16a34a' : '#6b7280'}}>{rule.status}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
              if (kpiLabel === '今日触发') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#f97316'}}>847次</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>今日触发总次数</div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div className="section-title">按小时分布</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
                      {[{h:'08:00',v:45},{h:'09:00',v:68},{h:'10:00',v:92},{h:'11:00',v:110},{h:'12:00',v:85},{h:'13:00',v:120},{h:'14:00',v:135},{h:'15:00',v:98},{h:'16:00',v:62},{h:'17:00',v:32}].map(t=>(
                        <div key={t.h} style={{textAlign:'center',padding:6}}>
                          <div style={{height:40,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                            <div style={{width:16,height:`${t.v/135*40}px`,background:'#e8365d',borderRadius:'3px 3px 0 0'}}/>
                          </div>
                          <div style={{fontSize:'0.6rem',color:'var(--text-muted)',marginTop:2}}>{t.h}</div>
                          <div style={{fontSize:'0.65rem',fontWeight:600}}>{t.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div className="section-title">最近触发记录</div>
                    <table className="data-table">
                      <thead><tr><th>时间</th><th>规则</th><th>动作</th><th>结果</th></tr></thead>
                      <tbody>
                        {triggerLogs.slice(0, 8).map((log, i) => (
                          <tr key={i} onClick={() => { setSelectedDetail(null); setAutoDrill({ kind: 'log', data: log }); }} style={{cursor:'pointer'}}><td style={{fontFamily:'monospace',fontSize:'0.72rem'}}>{log.time}</td><td style={{fontWeight:600}}>{log.ruleName}</td><td style={{fontSize:'0.72rem'}}>{log.action}</td><td style={{fontWeight:600,color: log.result === '成功' ? '#16a34a' : '#ef4444'}}>{log.result}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
              if (kpiLabel === '规则准确率') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#22c55e'}}>96.2%</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>规则准确率</div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                    {[{l:'成功执行',v:'833',c:'#16a34a'},{l:'失败/中断',v:'14',c:'#ef4444'},{l:'节省人力时间',v:'68h',c:'#3b82f6'}].map(s=>(
                      <div key={s.l} style={{textAlign:'center',padding:12,background:`${s.c}10`,borderRadius:8}}>
                        <div style={{fontSize:'1.2rem',fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="card" style={{padding:16}}>
                    <div className="section-title">各类别准确率</div>
                    <table className="data-table">
                      <thead><tr><th>类别</th><th>触发次数</th><th>成功数</th><th>准确率</th></tr></thead>
                      <tbody>
                        {[{c:'效果优化',t:70,s:68,r:'97.1%'},{c:'预算管控',t:29,s:28,r:'96.6%'},{c:'素材管理',t:44,s:42,r:'95.5%'},{c:'风控合规',t:70,s:69,r:'98.6%'},{c:'冷启动',t:18,s:17,r:'94.4%'},{c:'时段策略',t:27,s:26,r:'96.3%'}].map(r=>(
                          <tr key={r.c}><td style={{fontWeight:600}}>{r.c}</td><td>{r.t}</td><td>{r.s}</td><td style={{fontWeight:700,color:'#22c55e'}}>{r.r}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
              // 误触发率
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#ef4444'}}>1.8%</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>误触发率 · 14次/847次</div>
                  </div>
                  <div className="card" style={{padding:16}}>
                    <div className="section-title">误触发详情</div>
                    <table className="data-table">
                      <thead><tr><th>时间</th><th>规则</th><th>误触原因</th><th>影响</th></tr></thead>
                      <tbody>
                        {[{t:'14:32',r:'竞品抢量',reason:'CPM波动为正常市场变化',impact:'无实际影响'},{t:'13:15',r:'低效计划关停',reason:'ROI临界值波动',impact:'1个计划误关，已恢复'},{t:'11:42',r:'素材衰退替换',reason:'CTR季节性下降非衰退',impact:'不必要的素材替换'},{t:'10:08',r:'高频点击异常',reason:'内部测试流量',impact:'内部IP被误屏蔽'}].map((r,i)=>(
                          <tr key={i}><td style={{fontFamily:'monospace',fontSize:'0.72rem'}}>{r.t}</td><td style={{fontWeight:600}}>{r.r}</td><td style={{fontSize:'0.72rem'}}>{r.reason}</td><td style={{fontSize:'0.72rem',color:'#f97316'}}>{r.impact}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{padding:12,background:'rgba(245,158,11,0.08)',borderRadius:8,fontSize:'0.78rem',color:'var(--text-muted)',lineHeight:1.6,border:'1px solid rgba(245,158,11,0.2)'}}>
                    <strong style={{color:'#f59e0b'}}>AI建议:</strong> 建议将"竞品抢量"规则的CPM上涨阈值从40%提高至55%，可减少约30%的误触发。同时建议将内部IP段加入白名单。
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'category' && (() => {
              const cat = selectedDetail.data
              const categoryRules: Record<string,string[]> = {
                '效果优化': ['低效计划关停','起量放大','周末放量'],
                '预算管控': ['预算超标保护'],
                '素材管理': ['素材衰退替换'],
                '风控合规': ['高频点击异常','合规自动下架'],
                '冷启动': ['冷启动加速'],
                '时段策略': ['深夜降速'],
                '竞品应对': ['竞品抢量'],
              }
              const matchedRules = rules.filter(r => (categoryRules[cat.category] || []).includes(r.name))
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{textAlign:'center',marginBottom:8}}>
                    <div style={{fontSize:'2.5rem',fontWeight:700,color:'#e8365d'}}>{cat.count}次</div>
                    <div style={{fontSize:'0.85rem',color:'var(--text-muted)'}}>「{cat.category}」类别今日触发次数</div>
                  </div>
                  {matchedRules.length > 0 && (
                    <div className="card" style={{padding:16}}>
                      <div className="section-title">该类别下的规则</div>
                      <table className="data-table">
                        <thead><tr><th>规则名</th><th>条件</th><th>动作</th><th>今日触发</th><th>状态</th></tr></thead>
                        <tbody>
                          {matchedRules.map((rule,i)=>(
                            <tr key={i} onClick={()=>{setSelectedDetail(null);setAutoDrill({kind:'rule',data:rule})}} style={{cursor:'pointer'}}>
                              <td style={{fontWeight:600}}>{rule.name}</td>
                              <td style={{fontSize:'0.72rem'}}>{rule.condition}</td>
                              <td style={{fontSize:'0.72rem'}}>{rule.action}</td>
                              <td>{rule.todayTriggers}次</td>
                              <td style={{color: rule.status === '启用' ? '#16a34a' : '#6b7280'}}>{rule.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="card" style={{padding:16}}>
                    <div className="section-title">该类别触发日志</div>
                    <table className="data-table">
                      <thead><tr><th>时间</th><th>规则</th><th>动作</th><th>结果</th></tr></thead>
                      <tbody>
                        {triggerLogs.filter(l => matchedRules.some(r => r.name === l.ruleName)).slice(0,6).map((log,i)=>(
                          <tr key={i} onClick={()=>{setSelectedDetail(null);setAutoDrill({kind:'log',data:log})}} style={{cursor:'pointer'}}>
                            <td style={{fontFamily:'monospace',fontSize:'0.72rem'}}>{log.time}</td>
                            <td style={{fontWeight:600}}>{log.ruleName}</td>
                            <td style={{fontSize:'0.72rem'}}>{log.action}</td>
                            <td style={{fontWeight:600,color: log.result === '成功' ? '#16a34a' : '#ef4444'}}>{log.result}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{padding:12,background:'rgba(232,54,93,0.06)',borderRadius:8,fontSize:'0.78rem',color:'var(--text-muted)',lineHeight:1.6}}>
                    「{cat.category}」类别占总触发量的 {Math.round(cat.count / 847 * 100)}%。
                    {cat.count > 50 ? ' 触发频率较高，建议关注规则条件是否过于宽松。' : ' 触发频率正常。'}
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'workflowStep' && (() => {
              const d = selectedDetail.data
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{padding:16,background:'rgba(232,54,93,0.06)',borderRadius:12,textAlign:'center'}}>
                    <div style={{fontSize:'1.2rem',fontWeight:700,color:'#e8365d',marginBottom:4}}>{d.step}</div>
                    <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>工作流: {d.workflow} · 步骤 {d.stepIndex + 1}/{d.totalSteps}</div>
                  </div>
                  <div style={{background:'var(--bg-card)',borderRadius:10,padding:14,border:'1px solid var(--border)'}}>
                    {[
                      {label:'步骤名称',value:d.step},
                      {label:'所属工作流',value:d.workflow},
                      {label:'步骤顺序',value:`第 ${d.stepIndex + 1} 步 / 共 ${d.totalSteps} 步`},
                      {label:'平均耗时',value:['3s','8s','5s','2s'][d.stepIndex % 4]},
                      {label:'今日执行次数',value:`${d.todayRuns}次`},
                      {label:'步骤成功率',value:`${(95 + Math.random() * 4.5).toFixed(1)}%`},
                      {label:'失败重试策略',value:'最多重试3次，间隔30秒'},
                      {label:'超时设置',value:'60秒'},
                    ].map(row=>(
                      <div key={row.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:'0.78rem'}}>
                        <span style={{color:'var(--text-muted)'}}>{row.label}</span>
                        <span style={{fontWeight:600}}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>最近执行记录</div>
                    {[
                      {time:'14:32:18',status:'成功',duration:'2.1s'},
                      {time:'14:18:05',status:'成功',duration:'3.4s'},
                      {time:'14:05:41',status:'成功',duration:'1.8s'},
                      {time:'13:52:30',status:'失败',duration:'60s (超时)'},
                      {time:'13:38:12',status:'成功',duration:'2.6s'},
                    ].map((h,i)=>(
                      <div key={i} style={{display:'flex',gap:10,marginBottom:6,fontSize:'0.75rem',alignItems:'center'}}>
                        <span style={{color:'var(--text-muted)',fontFamily:'monospace',minWidth:72}}>{h.time}</span>
                        <span style={{padding:'1px 6px',borderRadius:4,fontSize:'0.68rem',fontWeight:600,
                          background: h.status==='成功'?'rgba(22,163,74,0.15)':'rgba(239,68,68,0.15)',
                          color: h.status==='成功'?'#16a34a':'#ef4444'
                        }}>{h.status}</span>
                        <span style={{color:'var(--text-secondary)'}}>{h.duration}</span>
                      </div>
                    ))}
                  </div>
                  {autoActionMsg && (
                    <div style={{padding:'10px 14px',borderRadius:8,background:`${autoActionMsg.color}18`,border:`1px solid ${autoActionMsg.color}40`,fontSize:'0.78rem',color:autoActionMsg.color,fontWeight:600}}>{autoActionMsg.text}</div>
                  )}
                  {showAutoEdit && (
                    <div style={{padding:14,borderRadius:10,background:'rgba(232,54,93,0.05)',border:'1px solid rgba(232,54,93,0.2)'}}>
                      <div style={{fontSize:'0.82rem',fontWeight:700,color:'#e8365d',marginBottom:10}}>✏️ 编辑自动化步骤</div>
                      {['触发条件', '执行动作', '超时时间', '重试次数'].map(field => (
                        <div key={field} style={{marginBottom:8}}>
                          <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:3}}>{field}</div>
                          <input defaultValue={field==='超时时间'?'30s':field==='重试次数'?'3':''} placeholder={`请输入${field}...`} style={{width:'100%',padding:'6px 10px',borderRadius:6,border:'1px solid var(--border)',fontSize:'0.78rem',background:'var(--bg-primary)',color:'var(--text-primary)',boxSizing:'border-box'}} />
                        </div>
                      ))}
                      <div style={{display:'flex',gap:8,marginTop:4}}>
                        <button onClick={()=>{setShowAutoEdit(false);setAutoActionMsg({text:'✅ 步骤配置已保存，下次执行时生效',color:'#22c55e'});setTimeout(()=>setAutoActionMsg(null),4000)}} style={{padding:'6px 14px',borderRadius:7,border:'none',background:'#e8365d',color:'white',fontSize:'0.75rem',fontWeight:600,cursor:'pointer'}}>保存</button>
                        <button onClick={()=>setShowAutoEdit(false)} style={{padding:'6px 14px',borderRadius:7,border:'1px solid var(--border)',background:'none',color:'var(--text-muted)',fontSize:'0.75rem',cursor:'pointer'}}>取消</button>
                      </div>
                    </div>
                  )}
                  {showAutoLog && (
                    <div style={{borderRadius:10,overflow:'hidden',border:'1px solid var(--border)'}}>
                      <div style={{padding:'8px 14px',background:'#0f172a',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontSize:'0.75rem',color:'#94a3b8',fontFamily:'monospace'}}>执行日志</span>
                        <button onClick={()=>setShowAutoLog(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:'0.75rem'}}>收起</button>
                      </div>
                      <div style={{background:'#0f172a',padding:'10px 14px',fontFamily:'monospace',fontSize:'0.72rem',maxHeight:180,overflowY:'auto'}}>
                        {[
                          {time:'14:32:01',level:'INFO',msg:'自动化任务启动'},
                          {time:'14:32:02',level:'INFO',msg:'获取平台数据 OK'},
                          {time:'14:32:05',level:'SUCCESS',msg:'规则匹配成功，触发执行'},
                          {time:'14:32:06',level:'INFO',msg:'调用 API: POST /ads/budget/adjust'},
                          {time:'14:32:07',level:'SUCCESS',msg:'预算调整完成，响应 200'},
                          {time:'14:32:08',level:'INFO',msg:'任务结束，耗时 7s'},
                        ].map((log,i)=>(
                          <div key={i} style={{display:'flex',gap:10,marginBottom:5,color:log.level==='SUCCESS'?'#4ade80':log.level==='WARN'?'#fbbf24':'#94a3b8'}}>
                            <span style={{color:'#475569'}}>{log.time}</span>
                            <span style={{color:log.level==='SUCCESS'?'#4ade80':'#6366f1',minWidth:55}}>[{log.level}]</span>
                            <span>{log.msg}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>{setShowAutoEdit(v=>!v);setShowAutoLog(false)}} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #e8365d',background:showAutoEdit?'#e8365d':'#e8365d20',color:showAutoEdit?'white':'#e8365d',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>编辑步骤</button>
                    <button onClick={()=>{setShowAutoLog(v=>!v);setShowAutoEdit(false)}} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #3b82f6',background:showAutoLog?'#3b82f6':'#3b82f620',color:showAutoLog?'white':'#3b82f6',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>查看日志</button>
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
