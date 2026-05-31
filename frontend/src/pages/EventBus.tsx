import React, { useState } from 'react'
import { kafkaEvents } from '../data/agents'
import {
  Zap, ArrowRight, Activity, Server, Clock,
  BarChart3, AlertTriangle, RefreshCw, Layers,
  Radio, Workflow, Shield, X
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Line
} from 'recharts'

/* ═══════════════════════════════════════════════════════════════
   协同数据总线 —— Apache Kafka事件驱动架构
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['实时事件流', '事件拓扑图', '集群监控', '死信与告警']

// ===== Tab1: 实时事件流 =====
const liveEvents = [
  { time: '14:23:05.234', topic: 'material.ctr_high', producer: '创意轮换智能体', consumer: '广告素材生成智能体', payload: '{"tags":["试色","对比测评"],"ctr":0.035}', latency: '2ms' },
  { time: '14:23:04.891', topic: 'conversion.attribution', producer: '投放数据分析智能体', consumer: '出价优化智能体', payload: '{"platform":"抖音","cvr":0.085,"roi":3.2}', latency: '3ms' },
  { time: '14:23:03.456', topic: 'content.created', producer: '种草内容生成智能体', consumer: '素材审核智能体', payload: '{"content_id":"c-2847","type":"grass_note","sku":"唇釉丝绒"}', latency: '1ms' },
  { time: '14:23:02.123', topic: 'video.rendered', producer: '视频生成智能体', consumer: '视频剪辑智能体', payload: '{"type":"试色视频","product":"唇釉丝绒","res":"1080p"}', latency: '4ms' },
  { time: '14:23:01.789', topic: 'material.generated', producer: '广告素材生成智能体', consumer: '创意轮换智能体', payload: '{"count":50,"type":"variant","source":"试色对比"}', latency: '2ms' },
  { time: '14:23:00.567', topic: 'trend.beauty', producer: '美妆趋势洞察智能体', consumer: '选品策略智能体', payload: '{"keyword":"防晒卸妆","growth":0.85,"platform":"小红书"}', latency: '5ms' },
  { time: '14:22:59.234', topic: 'budget.exhausted', producer: '预算管理智能体', consumer: '投放策略智能体', payload: '{"platform":"抖音","budget_used":0.95}', latency: '1ms' },
  { time: '14:22:58.901', topic: 'kol.matched', producer: 'KOL匹配智能体', consumer: '达人合作智能体', payload: '{"kol_id":"kol-2201","platform":"小红书","fans":"85w","category":"美妆"}', latency: '3ms' },
  { time: '14:22:57.678', topic: 'product.launched', producer: '产品管理智能体', consumer: '种草内容生成智能体', payload: '{"product":"唇釉丝绒新色","sku_count":3,"category":"唇部"}', latency: '2ms' },
  { time: '14:22:56.345', topic: 'placement.optimized', producer: 'AI出价引擎', consumer: '计划管理智能体', payload: '{"campaign":"CP-2401","action":"expand","delta":"+40%"}', latency: '1ms' },
  { time: '14:22:55.012', topic: 'roi.alert', producer: '反欺诈智能体', consumer: '告警引擎', payload: '{"platform":"抖音","type":"click_injection","blocked":156}', latency: '2ms' },
  { time: '14:22:53.678', topic: 'gmv.milestone', producer: '直播监控智能体', consumer: '数据分析引擎', payload: '{"livestream_id":"ls-5504","gmv":380000,"duration":"2h"}', latency: '3ms' },
  // 🌍 国际投放集群事件
  { time: '14:22:51.002', topic: 'meta.campaign.optimized', producer: 'Meta广告智能投手', consumer: '预算分配智能体', payload: '{"market":"US","roas":4.2,"action":"bid_up","delta":"+12%"}', latency: '4ms' },
  { time: '14:22:48.334', topic: 'tiktok_global.conversion', producer: 'TikTok全球投流智能体', consumer: '归因分析智能体', payload: '{"market":"JP","cvr":0.078,"roas":5.1,"product":"唇釉丝绒"}', latency: '3ms' },
  { time: '14:22:45.789', topic: 'currency.alert.triggered', producer: '汇率风险管理智能体', consumer: '跨平台协同智能体', payload: '{"pair":"EUR/CNY","change":0.028,"action":"hedge_activated"}', latency: '2ms' },
  { time: '14:22:42.115', topic: 'content.localized', producer: '跨境内容本地化智能体', consumer: 'Meta广告智能投手', payload: '{"langs":["en","ja","ko"],"assets":12,"quality_score":94}', latency: '5ms' },
  { time: '14:22:39.456', topic: 'compliance.gdpr.passed', producer: '全球隐私合规智能体', consumer: '国际受众建模智能体', payload: '{"region":"EU","result":"pass","pixel_capi_ready":true}', latency: '2ms' },
  { time: '14:22:36.890', topic: 'repurchase.wave.initiated', producer: '复购激活智能体', consumer: '社群运营智能体', payload: '{"users":8400,"segment":"dormant_30d","voucher":"8折专属券"}', latency: '3ms' },
  { time: '14:22:34.223', topic: 'inventory.alert.synced', producer: '库存联动投放智能体', consumer: '预算分配智能体', payload: '{"sku":"唇釉#105","stock":72,"action":"bid_down","delta":"-23%"}', latency: '2ms' },
  { time: '14:22:31.567', topic: 'ab.experiment.concluded', producer: 'A/B实验自动化引擎', consumer: '素材轮换智能体', payload: '{"experiment":"material_test_8","winner":"B","ctr_lift":0.28,"confidence":0.95}', latency: '4ms' },
  { time: '14:22:28.901', topic: 'seo.content.optimized', producer: '搜索内容优化智能体', consumer: '种草文案智能体', payload: '{"platform":"小红书","keywords":["哑光唇釉","丝绒口红"],"updated":12}', latency: '2ms' },
]

// ===== Tab2: 事件拓扑 =====
const eventFlows = [
  { from: '产品管理智能体', event: 'product.launched', to: '种草内容生成智能体', volume: '12/h', status: '正常' },
  { from: '种草内容生成智能体', event: 'content.created', to: '素材审核智能体', volume: '85/h', status: '正常' },
  { from: '素材审核智能体', event: 'material.approved', to: 'AI计划引擎', volume: '60/h', status: '正常' },
  { from: 'KOL匹配智能体', event: 'kol.matched', to: '达人合作智能体', volume: '25/h', status: '正常' },
  { from: '视频生成智能体', event: 'video.rendered', to: '素材审核智能体', volume: '45/h', status: '正常' },
  { from: '素材审核智能体', event: 'material.approved', to: 'AI计划引擎', volume: '38/h', status: '正常' },
  { from: 'AI计划引擎', event: 'campaign.created', to: '平台API', volume: '65/h', status: '正常' },
  { from: '平台API回调', event: 'conversion.attributed', to: '数据分析引擎', volume: '2,400/h', status: '正常' },
  { from: '数据分析引擎', event: 'insight.generated', to: 'AI学习引擎', volume: '150/h', status: '正常' },
  { from: 'AI学习引擎', event: 'model.updated', to: '创意生成智能体', volume: '12/h', status: '正常' },
  // 🌍 国际集群拓扑
  { from: 'Meta广告智能投手', event: 'meta.campaign.optimized', to: '预算分配智能体', volume: '8/h', status: '正常' },
  { from: 'TikTok全球投流智能体', event: 'tiktok_global.conversion', to: '归因分析智能体', volume: '45/h', status: '正常' },
  { from: '汇率风险管理智能体', event: 'currency.alert.triggered', to: '跨平台协同智能体', volume: '3/h', status: '正常' },
  { from: '跨境内容本地化智能体', event: 'content.localized', to: 'Meta广告智能投手', volume: '20/h', status: '正常' },
  { from: '全球隐私合规智能体', event: 'compliance.gdpr.passed', to: '国际受众建模智能体', volume: '15/h', status: '正常' },
  { from: '反欺诈检测引擎', event: 'fraud.blocked', to: 'ROI监控智能体', volume: '180/h', status: '正常' },
  { from: '数仓调度引擎', event: 'warehouse.etl.done', to: '消费者洞察引擎', volume: '24/h', status: '正常' },
  { from: '品牌舆情监测引擎', event: 'sentiment.crisis.alert', to: '智能预警引擎', volume: '6/h', status: '正常' },
]

// ===== Tab3: 集群监控 =====
const clusterStats = [
  { broker: 'broker-01 (cn-beijing)', partitions: 256, leaders: 128, throughput: '450/s', disk: '72%', status: '健康' },
  { broker: 'broker-02 (cn-hangzhou)', partitions: 256, leaders: 128, throughput: '420/s', disk: '68%', status: '健康' },
  { broker: 'broker-03 (cn-shanghai)', partitions: 128, leaders: 64, throughput: '380/s', disk: '55%', status: '健康' },
  { broker: 'broker-04 (cn-guangzhou)', partitions: 128, leaders: 64, throughput: '420/s', disk: '61%', status: '健康' },
  { broker: 'broker-05 (sg-singapore)', partitions: 128, leaders: 64, throughput: '285/s', disk: '48%', status: '健康' },
  { broker: 'broker-06 (us-east-virginia)', partitions: 128, leaders: 64, throughput: '320/s', disk: '52%', status: '健康' },
  { broker: 'broker-07 (eu-frankfurt)', partitions: 64, leaders: 32, throughput: '180/s', disk: '39%', status: '健康' },
]

const throughputTrend = [
  { time: '00:00', events: 850, latency: 2.1 },
  { time: '04:00', events: 420, latency: 1.5 },
  { time: '08:00', events: 680, latency: 1.8 },
  { time: '12:00', events: 1200, latency: 3.2 },
  { time: '14:00', events: 1450, latency: 3.8 },
  { time: '16:00', events: 1380, latency: 3.5 },
  { time: '18:00', events: 1100, latency: 2.8 },
  { time: '20:00', events: 950, latency: 2.4 },
]

const consumerGroups = [
  { group: 'creative-pipeline', topics: 5, lag: 0, status: '实时' },
  { group: 'placement-engine', topics: 8, lag: 12, status: '轻微延迟' },
  { group: 'analytics-engine', topics: 12, lag: 0, status: '实时' },
  { group: 'fraud-detection', topics: 4, lag: 0, status: '实时' },
  { group: 'kol-matching-service', topics: 3, lag: 5, status: '实时' },
  { group: 'alert-dispatcher', topics: 6, lag: 0, status: '实时' },
  { group: 'intl-placement-engine', topics: 6, lag: 8, status: '实时' },
  { group: 'intl-compliance-checker', topics: 3, lag: 0, status: '实时' },
  { group: 'global-attribution-service', topics: 5, lag: 0, status: '实时' },
  { group: 'currency-hedge-monitor', topics: 2, lag: 0, status: '实时' },
]

// ===== Tab4: 死信与告警 =====
const deadLetters = [
  { time: '14:15:32', topic: 'video.rendered', error: 'GPU OOM: 模型尺寸超限', retries: 3, status: '已转人工', originalPayload: '{"resolution":"4K","duration":"120s"}' },
  { time: '13:42:18', topic: 'conversion.attribution', error: '平台回调超时(>10s)', retries: 5, status: '已重试成功', originalPayload: '{"platform":"抖音","event":"purchase"}' },
  { time: '12:58:45', topic: 'campaign.created', error: '巨量引擎API rate limit(429)', retries: 2, status: '等待重试', originalPayload: '{"account":"act_12345","campaigns":8}' },
  { time: '11:30:22', topic: 'material.approved', error: '审核模型置信度<0.6', retries: 0, status: '已转人工', originalPayload: '{"material":"M-5512","confidence":0.55}' },
  { time: '10:15:08', topic: 'compliance.blocked', error: '合规审核评分<85，内容含敏感词', retries: 1, status: '已重试成功', originalPayload: '{"material":"M-5506","score":82}' },
]

const errorStats = [
  { hour: '08:00', timeout: 2, rateLimit: 0, oom: 0, quality: 1 },
  { hour: '09:00', timeout: 1, rateLimit: 1, oom: 0, quality: 0 },
  { hour: '10:00', timeout: 3, rateLimit: 2, oom: 1, quality: 2 },
  { hour: '11:00', timeout: 0, rateLimit: 1, oom: 0, quality: 1 },
  { hour: '12:00', timeout: 2, rateLimit: 3, oom: 0, quality: 0 },
  { hour: '13:00', timeout: 1, rateLimit: 0, oom: 0, quality: 1 },
  { hour: '14:00', timeout: 1, rateLimit: 1, oom: 1, quality: 0 },
]

const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }

// ─── Event Drill Panel ────────────────────────────────────────────────────────
type EventDrillTarget =
  | { kind: 'live'; data: typeof liveEvents[0] }
  | { kind: 'flow'; data: typeof eventFlows[0] }
  | { kind: 'dlq'; data: typeof deadLetters[0] }

function EventDrillPanel({ target, onClose }: { target: EventDrillTarget; onClose: () => void }) {
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
  const btn = (label: string, color = '#ff9eb5') => (
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
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: target.kind !== 'flow' ? 'monospace' : undefined }}>
              {target.kind === 'live' ? target.data.topic : target.kind === 'flow' ? target.data.event : target.data.topic}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {target.kind === 'live' ? `实时事件 · ${target.data.time}` : target.kind === 'flow' ? '事件拓扑' : '死信队列'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>

        {target.kind === 'live' && (() => {
          const d = target.data
          return (
            <>
              {row('事件类型', <span style={{ color: '#ff9eb5', fontFamily: 'monospace' }}>{d.topic}</span>)}
              {row('时间戳', d.time)}
              {row('生产者', d.producer)}
              {row('处理延迟', <span style={{ color: '#34d399' }}>{d.latency}</span>)}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>消费者列表</div>
                {[d.consumer, '分析引擎 (监听中)', '告警系统 (监听中)'].map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{c}</span>
                    <span style={{ color: '#34d399', fontWeight: 600, fontSize: '0.68rem' }}>{i === 0 ? '已处理' : '监听中'}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>事件载荷 (Payload)</div>
                <div style={{ padding: 12, background: 'var(--bg-primary, rgba(0,0,0,0.06))', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.8, color: '#ff9eb5', wordBreak: 'break-all' }}>
                  {d.payload}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>相关事件</div>
                {['上游: product.launched', '下游: material.approved', '下游: campaign.created'].map((rel, i) => (
                  <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{rel}</div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('查看完整Payload')}
                {btn('追踪上下游', '#3b82f6')}
              </div>
            </>
          )
        })()}

        {target.kind === 'flow' && (() => {
          const d = target.data
          return (
            <>
              {row('事件名', <span style={{ color: '#ff9eb5', fontFamily: 'monospace' }}>{d.event}</span>)}
              {row('生产者', d.from)}
              {row('消费者', d.to)}
              {row('事件量', d.volume)}
              {row('状态', <span style={{ color: '#34d399' }}>{d.status}</span>)}
              {row('平均延迟', '2.3ms')}
              {row('今日处理量', `${parseInt(d.volume) * 24}条`)}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>消费者服务列表</div>
                {[d.to, '监控系统 (旁路)'].map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{c}</span>
                    <span style={{ color: '#34d399', fontSize: '0.68rem', fontWeight: 600 }}>活跃</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('查看消息详情')}
                {btn('监控此Topic', '#3b82f6')}
              </div>
            </>
          )
        })()}

        {target.kind === 'dlq' && (() => {
          const d = target.data
          return (
            <>
              <div style={{ padding: 12, background: 'rgba(220,38,38,0.06)', borderRadius: 8, border: '1px solid rgba(220,38,38,0.2)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>死信原因: {d.error}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>状态: {d.status}</div>
              </div>
              {row('发生时间', d.time)}
              {row('Topic', <span style={{ fontFamily: 'monospace', color: '#ff9eb5' }}>{d.topic}</span>)}
              {row('错误原因', <span style={{ color: '#dc2626' }}>{d.error}</span>)}
              {row('重试次数', `${d.retries}次`)}
              {row('状态', d.status)}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>原始Payload</div>
                <div style={{ padding: 12, background: 'var(--bg-primary, rgba(0,0,0,0.06))', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.75rem', color: '#ff9eb5', wordBreak: 'break-all' }}>
                  {d.originalPayload}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('立即重试', '#e8365d')}
                {btn('人工处理', '#f97316')}
                {btn('忽略', '#6b7280')}
              </div>
            </>
          )
        })()}
      </div>
    </>
  )
}

export default function EventBus() {
  const [activeTab, setActiveTab] = useState(0)
  const [filter, setFilter] = useState('')
  const [eventDrill, setEventDrill] = useState<EventDrillTarget | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)

  const filteredEvents = liveEvents.filter(e => !filter || e.topic.includes(filter))

  // ── AI Config for 协同数据总线 ──
  const aiGroups: AIConfigGroup[] = [
    {
      title: '事件处理引擎',
      icon: <Radio size={18} />,
      params: [
        createParam('event_concurrency', '事件处理并发数', 500, '条/秒', '事件处理引擎的并发处理能力上限', 800, 86),
        createParam('event_backlog_threshold', '事件积压预警阈值', 10000, '条', '事件积压超过此值触发预警通知', 5000, 89),
        createParam('consumer_rebalance_strategy', '消费者组重平衡策略', '立即', '', '消费者组发生变更时的重平衡策略', 'AI优化', 84, { type: 'select', options: ['立即', '延迟', '渐进式', 'AI优化'] }),
        createParam('dlq_handling_strategy', '死信队列处理策略', '丢弃', '', '进入死信队列的消息处理策略', 'AI智能重试', 87, { type: 'select', options: ['丢弃', '重试3次', '人工审核', 'AI智能重试'] }),
      ],
    },
    {
      title: '智能体消息路由',
      icon: <Workflow size={18} />,
      params: [
        createParam('agent_msg_ttl', '智能体间消息TTL', 300, '秒', '智能体之间消息的存活时间, 超时自动丢弃', 180, 83),
        createParam('priority_queue_levels', '优先级队列层数', 3, '级', '消息优先级队列的分层数量', 5, 81),
        createParam('idempotency_window', '消息幂等性窗口', 3600, '秒', '消息幂等性检测的时间窗口, 窗口内重复消息自动去重', 1800, 85),
        createParam('routing_strategy', '路由策略', '轮询', '', '智能体间消息的路由分发策略', 'AI动态路由', 88, { type: 'select', options: ['轮询', '哈希', '最小负载', 'AI动态路由'] }),
      ],
    },
    {
      title: '流量控制',
      icon: <Shield size={18} />,
      params: [
        createParam('burst_rate_limit', '突发流量限流阈值', 2000, '条/秒', '突发流量超过此值触发限流保护', 1500, 87),
        createParam('backpressure_speed', '背压传播速度', 5, '秒', '背压信号从下游传播到上游的延迟时间', 3, 82),
        createParam('circuit_breaker_trigger', '自动熔断触发条件', 95, '%队列满', '队列使用率超过此值触发自动熔断', 90, 90),
        createParam('degradation_strategy', '降级策略', '关闭', '', '系统过载时的降级处理策略', 'AI自适应', 86, { type: 'select', options: ['关闭', '丢弃低优先级', '批量合并', 'AI自适应'] }),
      ],
    },
  ]

  const learningStatus: AILearningStatus = {
    modelVersion: 'v1.5.0-eventbus',
    lastTraining: '45分钟前',
    totalDataPoints: 450000,
    avgConfidence: 86,
    autoAdjustCount24h: 234,
    learningRate: '0.0005 (AdamW)',
    nextTraining: '2小时后',
    improvementRate: '+9.6%',
  }

  useRegisterAIConfig(aiGroups, learningStatus, '协同数据总线')

  return (
    <>
      {eventDrill && <EventDrillPanel target={eventDrill} onClose={() => setEventDrill(null)} />}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap style={{ color: 'var(--accent-primary)' }} size={28} />
              协同数据总线
            </h2>
            <p>Apache Kafka · 跨区域多集群 · 事件驱动架构 · 实时智能体协同</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', background: 'rgba(232,54,93,0.08)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <Activity size={16} />1,247 events/s
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', background: 'rgba(232,54,93,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <Clock size={16} />&lt;5ms 延迟
            </div>
          </div>
        </div>
      </div>

      {/* Model Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="AnomalyDetector-LSTM" color="#e8365d" />
        <ModelBadge name="AutoPipeline-Orchestrator" color="#e8365d" />
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '20px' }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`tab ${activeTab === i ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: 实时事件流 */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-4">
              {[
                { label: '事件吞吐', value: '1,247/s', icon: <Zap size={20} /> },
                { label: 'Topics', value: kafkaEvents.length.toString(), icon: <Layers size={20} /> },
                { label: '平均延迟', value: '<5ms', icon: <Clock size={20} /> },
                { label: '消费者组', value: '52', icon: <Server size={20} /> },
              ].map(s => (
                <div key={s.label} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'event_kpi', data: s})}>
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{s.icon}{s.label}</div>
                  <div className="card-value" style={{ color: '#ff9eb5' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* 核心事件类型 */}
            <div className="card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} style={{ color: 'var(--accent-primary)' }} />核心事件类型定义
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>事件类型</th>
                    <th>生产者</th>
                    <th>消费者</th>
                    <th>用途</th>
                  </tr>
                </thead>
                <tbody>
                  {kafkaEvents.map((e, i) => (
                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'kafka_event_type', data: e})}>
                      <td><span className="event-type">{e.type}</span></td>
                      <td>{e.producer}</td>
                      <td>{e.consumer}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{e.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 实时事件流 */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
                  <Activity size={16} style={{ color: 'var(--accent-primary)' }} />实时事件流
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['', 'material', 'content', 'conversion', 'placement', 'roi'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: filter === f ? 'rgba(232,54,93,0.08)' : 'rgba(232,54,93,0.06)',
                        color: filter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontWeight: filter === f ? 600 : 400,
                      }}>
                      {f || '全部'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {filteredEvents.map((e, i) => (
                  <div key={i} onClick={() => setEventDrill({ kind: 'live', data: e })} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = 'rgba(167,139,250,0.06)')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = '')}>
                    <span style={{ color: 'var(--text-muted)', width: '110px', flexShrink: 0 }}>{e.time}</span>
                    <span style={{ color: 'var(--accent-primary)', width: '160px', flexShrink: 0, fontWeight: 600 }}>{e.topic}</span>
                    <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{e.producer}</span>
                    <ArrowRight size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{e.consumer}</span>
                    <span style={{ color: 'var(--accent-primary)', width: '40px', flexShrink: 0 }}>{e.latency}</span>
                    <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.payload}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 事件拓扑图 */}
        {activeTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} style={{ color: 'var(--accent-primary)' }} />生产即投事件流水线
              </div>
              <div>
                {eventFlows.map((f, i) => (
                  <div key={i} onClick={() => setEventDrill({ kind: 'flow', data: f })} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = 'rgba(167,139,250,0.06)')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = '')}>
                    <span style={{ color: 'var(--text-primary)', width: '140px', flexShrink: 0, textAlign: 'right' }}>{f.from}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '0.75rem', width: '170px', flexShrink: 0 }}>{f.event}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-primary)', width: '140px', flexShrink: 0 }}>{f.to}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', width: '60px' }}>{f.volume}</span>
                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>{f.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-title">事件流闭环说明</div>
              <div style={{ background: 'rgba(232,54,93,0.06)', borderRadius: '8px', padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.8 }}>
                产品卖点提炼 → 种草文案生成 → 视频素材制作 → 合规审核 → AI建计划 → 平台API投放 → 转化回传 → 数据分析 → AI模型迭代 → 创意优化 → 循环
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 集群监控 */}
        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} style={{ color: 'var(--accent-primary)' }} />Kafka集群状态
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Broker</th>
                    <th>分区数</th>
                    <th>Leader数</th>
                    <th>吞吐</th>
                    <th>磁盘</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {clusterStats.map(b => (
                    <tr key={b.broker} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'broker', data: b})}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-primary)' }}>{b.broker}</td>
                      <td>{b.partitions}</td>
                      <td>{b.leaders}</td>
                      <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{b.throughput}</td>
                      <td style={{ color: parseInt(b.disk) > 70 ? '#d97706' : 'var(--accent-primary)' }}>{b.disk}</td>
                      <td style={{ color: 'var(--accent-primary)' }}>{b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="section-title">24h吞吐量与延迟</div>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={throughputTrend}>
                    <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area yAxisId="left" type="monotone" dataKey="events" name="事件/s" fill="#ff9eb5" fillOpacity={0.15} stroke="#ff9eb5" />
                    <Line yAxisId="right" type="monotone" dataKey="latency" name="延迟ms" stroke="#dc2626" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} style={{ color: 'var(--accent-primary)' }} />消费者组状态
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>消费者组</th>
                      <th>Topics</th>
                      <th>Lag</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumerGroups.map(g => (
                      <tr key={g.group} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'consumer_group', data: g})}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-primary)' }}>{g.group}</td>
                        <td>{g.topics}</td>
                        <td style={{ color: g.lag > 0 ? '#d97706' : 'var(--accent-primary)' }}>{g.lag}</td>
                        <td style={{ color: g.status === '实时' ? 'var(--accent-primary)' : '#d97706' }}>{g.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 死信与告警 */}
        {activeTab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-4">
              {[
                { label: '今日死信数', value: '12', color: '#dc2626' },
                { label: '已自动重试成功', value: '8', color: 'var(--accent-primary)' },
                { label: '转人工处理', value: '3', color: '#d97706' },
                { label: '等待重试', value: '1', color: 'var(--info)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'dlq_kpi', data: s})}>
                  <div className="card-title">{s.label}</div>
                  <div className="card-value" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#dc2626' }} />死信队列 (Dead Letter Queue)
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>Topic</th>
                    <th>错误原因</th>
                    <th>重试次数</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {deadLetters.map((d, i) => (
                    <tr key={i} onClick={() => setEventDrill({ kind: 'dlq', data: d })} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{d.time}</td>
                      <td><span className="event-type">{d.topic}</span></td>
                      <td style={{ color: '#dc2626', fontSize: '0.8rem' }}>{d.error}</td>
                      <td>{d.retries}</td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600, color: d.status === '已重试成功' ? 'var(--accent-primary)' : d.status === '已转人工' ? '#d97706' : 'var(--info)' }}>{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={16} style={{ color: 'var(--accent-primary)' }} />今日错误分布 (按小时)
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={errorStats}>
                  <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="timeout" name="超时" fill="#dc2626" stackId="a" />
                  <Bar dataKey="rateLimit" name="限流" fill="#d97706" stackId="a" />
                  <Bar dataKey="oom" name="OOM" fill="#ea580c" stackId="a" />
                  <Bar dataKey="quality" name="质量不达标" fill="#ff9eb5" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
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
                {selectedDetail.type === 'event_kpi' && `指标详情: ${selectedDetail.data.label}`}
                {selectedDetail.type === 'kafka_event_type' && `事件类型: ${selectedDetail.data.type}`}
                {selectedDetail.type === 'broker' && `Broker详情: ${selectedDetail.data.broker}`}
                {selectedDetail.type === 'consumer_group' && `消费者组: ${selectedDetail.data.group}`}
                {selectedDetail.type === 'dlq_kpi' && `死信统计: ${selectedDetail.data.label}`}
                {selectedDetail.type === 'broker_partition' && `分区详情`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'event_kpi' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff9eb5' }}>{selectedDetail.data.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedDetail.data.label}</div>
                </div>
                {[
                  { label: '1小时前', value: selectedDetail.data.value },
                  { label: '6小时前', value: selectedDetail.data.value },
                  { label: '24小时前', value: selectedDetail.data.value },
                  { label: '峰值 (今日)', value: selectedDetail.data.value },
                  { label: '均值 (7日)', value: selectedDetail.data.value },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedDetail.type === 'kafka_event_type' && (() => {
              const e = selectedDetail.data
              return (
                <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  {[
                    { label: '事件类型', value: e.type },
                    { label: '生产者', value: e.producer },
                    { label: '消费者', value: e.consumer },
                    { label: '描述', value: e.desc },
                    { label: '今日事件量', value: '12,450' },
                    { label: '平均延迟', value: '2.3ms' },
                    { label: '错误率', value: '0.01%' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )
            })()}

            {selectedDetail.type === 'broker' && (() => {
              const b = selectedDetail.data
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: '分区数', value: b.partitions, color: '#ff9eb5' },
                      { label: '吞吐', value: b.throughput, color: '#34d399' },
                      { label: '磁盘', value: b.disk, color: parseInt(b.disk) > 70 ? '#fbbf24' : '#ff9eb5' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>分区列表</div>
                  <table className="data-table">
                    <thead><tr><th>分区</th><th>Leader</th><th>ISR</th><th>消息量</th></tr></thead>
                    <tbody>
                      {[0, 1, 2, 3].map(p => (
                        <tr key={p} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'broker_partition', data: {broker: b.broker, partition: p}})}>
                          <td style={{ fontFamily: 'monospace' }}>partition-{p}</td>
                          <td>broker-01</td>
                          <td style={{ color: '#34d399' }}>3/3</td>
                          <td>{(12000 + p * 3200).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )
            })()}

            {selectedDetail.type === 'consumer_group' && (() => {
              const g = selectedDetail.data
              return (
                <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  {[
                    { label: '消费者组', value: g.group },
                    { label: 'Topics', value: g.topics },
                    { label: 'Lag', value: g.lag },
                    { label: '状态', value: g.status },
                    { label: '消费速率', value: '1,200/s' },
                    { label: '最近重平衡', value: '2小时前' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )
            })()}

            {selectedDetail.type === 'dlq_kpi' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: selectedDetail.data.color, marginBottom: 8 }}>{selectedDetail.data.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedDetail.data.label}</div>
              </div>
            )}

            {selectedDetail.type === 'broker_partition' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                {[
                  { label: 'Broker', value: selectedDetail.data.broker },
                  { label: '分区', value: `partition-${selectedDetail.data.partition}` },
                  { label: 'Leader', value: 'broker-01' },
                  { label: 'ISR', value: '3/3' },
                  { label: '消息量', value: (12000 + selectedDetail.data.partition * 3200).toLocaleString() },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
