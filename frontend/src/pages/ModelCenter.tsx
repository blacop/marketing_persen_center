import React, { useState } from 'react'
import {
  ComposedChart, Area, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Brain, Cpu, Activity, TrendingUp, Clock,
  Zap, Target, RefreshCw, AlertTriangle, X
} from 'lucide-react'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'

const models = [
  { name: 'CTR预测模型', version: 'v3.2', metric: 'AUC 0.78', volume: '日推理 12.4万次', lastTrain: '2h前', gpu: 'A100×2', status: '运行中', color: '#e8365d' },
  { name: 'CVR预测模型', version: 'v2.8', metric: 'AUC 0.72', volume: '日推理 8.6万次', lastTrain: '6h前', gpu: 'A100×1', status: '运行中', color: '#6366f1' },
  { name: '素材生成模型', version: 'DiT-v3', metric: '质量评分 87/100', volume: '日生成 38条', lastTrain: '1天前', gpu: 'A100×4', status: '训练中', color: '#ff7a95' },
  { name: '出价优化模型', version: 'v4.1', metric: 'MAPE 8.2%', volume: '日决策 1,847次', lastTrain: '4h前', gpu: 'A100×1', status: '运行中', color: '#ff7a95' },
  { name: '受众扩展模型', version: 'v2.5', metric: '扩展精度 74.5%', volume: '日请求 3,200次', lastTrain: '3天前', gpu: '-', status: '运行中', color: '#3b82f6' },
  { name: '合规检测模型', version: 'v3.0', metric: '准确率 96.8%', volume: '日审核 478条', lastTrain: '12h前', gpu: 'A100×1', status: '运行中', color: '#10b981' },
  { name: '素材疲劳预测', version: 'v1.8', metric: '准确率 72%', volume: '日预测 591条', lastTrain: '2天前', gpu: '-', status: '待部署', color: '#f59e0b' },
  { name: '跨平台预算分配', version: 'v2.2', metric: '收益 +12%', volume: '日决策 24次', lastTrain: '1天前', gpu: '-', status: '运行中', color: '#ec4899' },
]

const modelDetails: Record<string, string> = {
  'CTR预测模型': 'GPU: A100×2',
  'CVR预测模型': '日推理量稳定',
  '素材生成模型': 'GPU: A100×4 · 微调中',
  '出价优化模型': '实时在线推理',
  '受众扩展模型': 'Lookalike命中率 68%',
  '合规检测模型': '误判率 1.2%',
  '素材疲劳预测': '预警成功率 65%',
  '跨平台预算分配': 'vs 均匀分配基线',
}

const trainingQueue = [
  { name: '素材生成模型 DiT-v3.1', progress: 72, eta: '~48min', gpu: 'A100×4' },
  { name: 'CTR预测模型 v3.3', progress: 35, eta: '~2.1h', gpu: 'A100×2' },
  { name: '合规检测模型 v3.1', progress: 8, eta: '~5.4h', gpu: 'A100×1' },
]

const versionHistory = [
  { version: 'v2.6', AUC: 0.69, 准确率: 91.2 },
  { version: 'v2.7', AUC: 0.71, 准确率: 92.0 },
  { version: 'v2.8', AUC: 0.72, 准确率: 93.1 },
  { version: 'v2.9', AUC: 0.73, 准确率: 93.8 },
  { version: 'v3.0', AUC: 0.75, 准确率: 94.5 },
  { version: 'v3.1', AUC: 0.76, 准确率: 95.9 },
  { version: 'v3.2', AUC: 0.78, 准确率: 96.8 },
]

const abTests = [
  { model: 'CTR预测模型', champion: 'v3.2 (AUC 0.78)', challenger: 'v3.3-beta (AUC 0.79)', traffic: '10%', days: 3, lift: '+1.3%' },
  { model: '出价优化模型', champion: 'v4.1 (MAPE 8.2%)', challenger: 'v4.2-beta (MAPE 7.8%)', traffic: '5%', days: 1, lift: '+5.1%' },
]

const gpuMetrics = [
  { time: '08:00', 使用率: 62, 吞吐量: 1200 },
  { time: '10:00', 使用率: 78, 吞吐量: 1580 },
  { time: '12:00', 使用率: 85, 吞吐量: 1820 },
  { time: '14:00', 使用率: 91, 吞吐量: 1950 },
  { time: '16:00', 使用率: 88, 吞吐量: 1870 },
  { time: '18:00', 使用率: 74, 吞吐量: 1420 },
  { time: '20:00', 使用率: 68, 吞吐量: 1310 },
]

const recentDeployments = [
  { model: 'CTR预测模型', from: 'v3.1', to: 'v3.2', date: '04/01', result: 'AUC +0.02', status: '成功' },
  { model: '合规检测模型', from: 'v2.9', to: 'v3.0', date: '03/28', result: '准确率 +1.3%', status: '成功' },
  { model: '出价优化模型', from: 'v4.0', to: 'v4.1', date: '03/25', result: 'MAPE -0.5%', status: '成功' },
  { model: '受众扩展模型', from: 'v2.4', to: 'v2.5', date: '03/22', result: '精度 +2.1%', status: '成功' },
]

const gpuAllocation = [
  { name: 'CTR预测', gpus: 2, util: 87 },
  { name: '素材生成', gpus: 4, util: 94 },
  { name: '出价优化', gpus: 1, util: 72 },
  { name: '合规检测', gpus: 1, util: 58 },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  '运行中': { bg: '#dcfce7', text: '#16a34a' },
  '训练中': { bg: '#fef3c7', text: '#d97706' },
  '待部署': { bg: '#e0e7ff', text: '#6366f1' },
}

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ─── Model Drill Panel ────────────────────────────────────────────────────────
type ModelDrillItem = typeof models[0]

function ModelDrillPanel({ model, onClose }: { model: ModelDrillItem; onClose: () => void }) {
  const [actionMsg, setActionMsg] = useState<{text: string; color: string} | null>(null)
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false)
  const [retraining, setRetraining] = useState(false)
  const [showFeatureDetail, setShowFeatureDetail] = useState(false)

  const triggerAction = (text: string, color = '#22c55e') => {
    setActionMsg({ text, color })
    setTimeout(() => setActionMsg(null), 3500)
  }

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
  const sc = statusColors[model.status]
  const typeLabel = model.name.includes('CTR') ? 'CTR预测' : model.name.includes('CVR') ? 'CVR预测' : model.name.includes('出价') ? '出价优化' : model.name.includes('素材') ? '素材生成/评分' : '其他'
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: model.color }}>{model.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{model.version} · {typeLabel}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>
        <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: sc.bg, color: sc.text }}>{model.status}</span>

        <div style={{ padding: 14, background: 'var(--bg-primary, rgba(0,0,0,0.04))', borderRadius: 10, border: '1px solid var(--border)' }}>
          {row('模型名称', model.name)}
          {row('版本', model.version)}
          {row('类型', typeLabel)}
          {row('GPU资源', model.gpu)}
          {row('日推理量', model.volume)}
          {row('上次训练', model.lastTrain)}
          {row('下次计划训练', '明日 00:00 UTC')}
          {row('训练数据量', '8.5M 样本')}
        </div>

        <div style={{ padding: 14, background: `${model.color}10`, borderRadius: 10, border: `1px solid ${model.color}30` }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 10, color: model.color }}>性能指标</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: '准确率', val: '94.2%' },
              { label: 'AUC', val: '0.78' },
              { label: 'RMSE', val: '0.023' },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center', padding: 10, background: 'rgba(0,0,0,0.08)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: model.color }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>A/B测试 vs 上一版本</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: 12, background: `${model.color}12`, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>当前版本</div>
              <div style={{ fontWeight: 700, color: model.color }}>{model.metric}</div>
            </div>
            <div style={{ padding: 12, background: 'rgba(107,114,128,0.08)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>上一版本</div>
              <div style={{ fontWeight: 700, color: '#6b7280' }}>{model.metric.replace(/[\d.]+/, v => (parseFloat(v) * 0.97).toFixed(2))}</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>Top 10 特征重要性</div>
          {['用户历史CTR', '广告新鲜度', '时段因子', '设备类型', '地区系数', '创意评分', '受众匹配度', '历史CVR', '竞价压力', '素材质量分'].map((f, i) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 16 }}>{i + 1}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{f}</span>
              <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${100 - i * 9}%`, height: '100%', background: model.color, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: '0.68rem', color: model.color, minWidth: 32, textAlign: 'right' }}>{(10 - i * 0.8).toFixed(1)}%</span>
            </div>
          ))}
        </div>

        {/* 操作反馈提示 */}
        {actionMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: `${actionMsg.color}18`, border: `1px solid ${actionMsg.color}40`, fontSize: '0.78rem', color: actionMsg.color, fontWeight: 600 }}>
            {actionMsg.text}
          </div>
        )}

        {/* 回滚确认 */}
        {showRollbackConfirm && (
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f97316', marginBottom: 6 }}>⚠️ 确认回滚？</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              将回滚至上一稳定版本 {model.version.replace(/\d+$/, v => String(parseInt(v)-1))}，当前版本将停止推理服务，约需 2 分钟。
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowRollbackConfirm(false); triggerAction('✅ 回滚任务已提交，预计 2 分钟内完成，旧版本将自动恢复服务', '#f97316') }} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#f97316', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>确认回滚</button>
              <button onClick={() => setShowRollbackConfirm(false)} style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>取消</button>
            </div>
          </div>
        )}

        {/* 特征详情展开 */}
        {showFeatureDetail && (
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6366f1', marginBottom: 10 }}>📐 特征工程详情</div>
            {[
              { name: '用户历史CTR', type: '行为序列', dim: 128, status: '✅ 正常' },
              { name: '广告新鲜度', type: '时间衰减', dim: 1, status: '✅ 正常' },
              { name: '时段因子', type: '周期编码', dim: 24, status: '✅ 正常' },
              { name: '设备类型', type: 'Embedding', dim: 16, status: '✅ 正常' },
              { name: '地区系数', type: '分桶统计', dim: 32, status: '⚠️ 缺失率2.1%' },
            ].map(f => (
              <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 600 }}>{f.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{f.type} · dim={f.dim}</span>
                <span style={{ color: f.status.startsWith('✅') ? '#22c55e' : '#f59e0b' }}>{f.status}</span>
              </div>
            ))}
            <button onClick={() => setShowFeatureDetail(false)} style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>收起 ↑</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => triggerAction('🚀 部署任务已提交！新版本灰度发布中，预计 5 分钟完成，当前版本继续服务...')} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e8365d', background: '#e8365d20', color: '#e8365d', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer' }}>部署新版本</button>
          <button onClick={() => { setShowRollbackConfirm(true); setShowFeatureDetail(false) }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #f97316', background: '#f9731620', color: '#f97316', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer' }}>回滚</button>
          <button disabled={retraining} onClick={() => { setRetraining(true); triggerAction('🔄 重训练任务已加入队列，位置 #4，预计等待 2.1h，完成后自动通知', '#3b82f6'); setTimeout(() => setRetraining(false), 5000) }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #3b82f6', background: '#3b82f620', color: retraining ? '#94a3b8' : '#3b82f6', fontSize: '0.77rem', fontWeight: 600, cursor: retraining ? 'not-allowed' : 'pointer' }}>{retraining ? '排队中...' : '触发重训练'}</button>
          <button onClick={() => { setShowFeatureDetail(v => !v); setShowRollbackConfirm(false) }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #6366f1', background: showFeatureDetail ? '#6366f1' : '#6366f120', color: showFeatureDetail ? 'white' : '#6366f1', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer' }}>查看特征</button>
        </div>
      </div>
    </>
  )
}

export default function ModelCenter() {
  const [tab, setTab] = useState<'dashboard' | 'training'>('dashboard')
  const [modelDrill, setModelDrill] = useState<ModelDrillItem | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)
  const [detailActionMsg, setDetailActionMsg] = useState<{text: string; color: string} | null>(null)
  const [detailConfirm, setDetailConfirm] = useState<{action: string; label: string; color: string} | null>(null)

  const triggerDetailAction = (text: string, color = '#22c55e') => {
    setDetailActionMsg({ text, color })
    setDetailConfirm(null)
    setTimeout(() => setDetailActionMsg(null), 4000)
  }

  const modelCenterAIConfigGroups: AIConfigGroup[] = [
    {
      title: '模型训练',
      icon: <Brain size={16} />,
      params: [
        createParam('min_training_samples', '训练数据最小样本量', 10000, '条', '启动模型训练所需的最小数据样本量', 50000, 89, { min: 1000, max: 500000, step: 1000, learningDataPoints: 120000, adjustHistory: [
          { time: '昨日', from: '5000', to: '10000', reason: 'AI检测到小样本训练导致过拟合，提升最低样本量' },
        ] }),
        createParam('early_stop_patience', '早停patience', 5, 'epochs', '验证集指标无改善时等待的epoch数，超过则提前终止训练', 10, 85, { min: 1, max: 30, step: 1, learningDataPoints: 89000, adjustHistory: [
          { time: '2天前', from: '3', to: '5', reason: '训练过早停止导致欠拟合，AI增加patience' },
        ] }),
        createParam('lr_decay_strategy', '学习率衰减策略', '固定', '', '训练过程中学习率的调整策略', 'AI自适应', 92, { type: 'select', options: ['固定', '余弦退火', '线性衰减', 'AI自适应'], learningDataPoints: 156000, adjustHistory: [
          { time: '3天前', from: '余弦退火', to: '固定', reason: '团队调试时手动切换至固定学习率' },
        ] }),
        createParam('batch_size', '批量大小', 64, 'samples', '每次训练迭代的样本数量，影响训练速度和收敛质量', 128, 83, { min: 8, max: 512, step: 8, learningDataPoints: 95000, adjustHistory: [
          { time: '昨日', from: '32', to: '64', reason: 'GPU内存余量充足，AI增大批量以加速训练' },
        ] }),
      ],
    },
    {
      title: '模型部署',
      icon: <Zap size={16} />,
      params: [
        createParam('canary_release_ratio', '灰度发布比例', 10, '%', '新版本模型上线时的初始流量分配比例', 5, 87, { min: 1, max: 50, step: 1, learningDataPoints: 78000, adjustHistory: [
          { time: '2天前', from: '5', to: '10', reason: 'AI检测到模型稳定性高，加快灰度节奏' },
        ] }),
        createParam('ab_test_min_duration', 'A/B测试最小时长', 24, '小时', 'A/B测试必须运行的最短时间，确保统计显著性', 48, 84, { min: 1, max: 168, step: 1, learningDataPoints: 52000, adjustHistory: [
          { time: '3天前', from: '48', to: '24', reason: '团队需要快速验证，手动缩短测试时长' },
        ] }),
        createParam('rollback_threshold', '回滚触发阈值', -5, '%效果下降', '模型效果相比基准下降超过此值时自动回滚', -3, 90, { min: -20, max: -1, step: 1, learningDataPoints: 67000, adjustHistory: [
          { time: '昨日', from: '-3', to: '-5', reason: '新模型初期波动较大，AI放宽回滚阈值避免误触发' },
        ] }),
        createParam('model_cache_ttl', '模型缓存TTL', 3600, '秒', '模型推理结果的缓存有效时间', 1800, 81, { min: 60, max: 86400, step: 60, learningDataPoints: 43000, adjustHistory: [
          { time: '2天前', from: '1800', to: '3600', reason: '数据变化频率低，AI延长缓存时间减少计算开销' },
        ] }),
      ],
    },
    {
      title: '性能监控',
      icon: <Activity size={16} />,
      params: [
        createParam('inference_latency_p99', '推理延迟P99上限', 100, 'ms', '模型推理P99延迟的最大容忍值，超出触发告警', 50, 88, { min: 10, max: 1000, step: 10, learningDataPoints: 210000, adjustHistory: [
          { time: '昨日', from: '80', to: '100', reason: '新模型复杂度增加，AI临时放宽延迟上限' },
        ] }),
        createParam('model_drift_window', '模型漂移检测窗口', 7, '天', '检测模型漂移的数据窗口大小', 3, 86, { min: 1, max: 30, step: 1, learningDataPoints: 145000, adjustHistory: [
          { time: '3天前', from: '14', to: '7', reason: 'AI发现短窗口能更快捕获分布变化' },
        ] }),
        createParam('accuracy_min_threshold', '准确率最低阈值', 90, '%', '模型准确率的最低可接受值，低于此值触发重训练', 92, 91, { min: 70, max: 99, step: 1, learningDataPoints: 178000, adjustHistory: [
          { time: '2天前', from: '88', to: '90', reason: 'AI根据业务需求自动提升准确率要求' },
        ] }),
        createParam('auto_retrain_trigger', '自动重训触发条件', '手动', '', '模型自动重训练的触发策略', 'AI全自动', 87, { type: 'select', options: ['手动', '定时', '漂移触发', 'AI全自动'], learningDataPoints: 132000, adjustHistory: [
          { time: '1周前', from: '定时', to: '手动', reason: '团队进行基础设施升级，手动暂停自动重训' },
        ] }),
      ],
    },
  ]

  const modelCenterAILearningStatus: AILearningStatus = {
    modelVersion: 'v3.5.0-models',
    lastTraining: '30分钟前',
    totalDataPoints: 780000,
    avgConfidence: 88,
    autoAdjustCount24h: 345,
    learningRate: '0.0003 (AdamW)',
    nextTraining: '1小时后',
    improvementRate: '+19.3%',
  }

  useRegisterAIConfig(modelCenterAIConfigGroups, modelCenterAILearningStatus, 'AI模型中心')

  return (
    <>
      {modelDrill && <ModelDrillPanel model={modelDrill} onClose={() => setModelDrill(null)} />}
      <div className="page-header">
        <h2><Brain size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />AI模型中心</h2>
        <p>模型全生命周期管理 · 8个在线模型 · 3个训练任务 · 2个A/B测试进行中</p>
      </div>
      <div className="page-content">
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'dashboard' as const, label: '模型看板', icon: <Cpu size={14} /> },
            { key: 'training' as const, label: '训练与迭代', icon: <RefreshCw size={14} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
              background: tab === t.key ? 'var(--accent-primary)' : 'var(--bg-hover)',
              color: tab === t.key ? '#fff' : 'var(--text-secondary)',
            }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <>
            {/* KPI row */}
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { icon: <Brain size={14} />, label: '在线模型', value: '8', sub: '运行中 6 · 训练中 1 · 待部署 1', color: '#e8365d' },
                { icon: <Zap size={14} />, label: '日推理总量', value: '24.7万', sub: '较昨日 +3.2%', color: '#3b82f6' },
                { icon: <Target size={14} />, label: '平均AUC', value: '0.75', sub: '核心预测模型', color: '#10b981' },
                { icon: <Cpu size={14} />, label: 'GPU集群', value: 'A100×8', sub: '使用率 82.4%', color: '#f59e0b' },
              ].map(kpi => (
                <div className="card" key={kpi.label} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'model_kpi', data: kpi})}>
                  <div className="card-title">{kpi.icon} {kpi.label}</div>
                  <div className="card-value" style={{ color: kpi.color }}>{kpi.value}</div>
                  <div className="card-change positive">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Model cards grid: 4 columns, 2 rows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              {models.map(m => (
                <div className="card" key={m.name} style={{ borderLeft: `3px solid ${m.color}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => setModelDrill(m)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 4px 20px ${m.color}30`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{m.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.version}</div>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                      background: statusColors[m.status].bg, color: statusColors[m.status].text,
                    }}>{m.status}</span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color, marginBottom: 8 }}>{m.metric}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <Activity size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{m.volume}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />最近训练: {m.lastTrain}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{modelDetails[m.name]}</div>
                </div>
              ))}
            </div>

            {/* Recent deployments */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Zap size={16} color="#e8365d" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>近期模型上线</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>最近30天</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {recentDeployments.map((d, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 10, border: '1px solid var(--border-light)',
                    background: 'var(--bg-hover)', cursor: 'pointer',
                  }} onClick={() => setSelectedDetail({type: 'deployment', data: d})}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>{d.model}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                      {d.from} → {d.to}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{d.date}</span>
                      <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>{d.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'training' && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              {/* Training queue */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <RefreshCw size={16} color="#e8365d" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>训练队列</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>3 个任务</span>
                </div>
                {trainingQueue.map((t, i) => (
                  <div key={i} style={{ marginBottom: 14, cursor: 'pointer', padding: 8, borderRadius: 8, transition: 'background 0.15s' }}
                    onClick={() => setSelectedDetail({type: 'training', data: t})}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600 }}>{t.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{t.gpu} · ETA {t.eta}</span>
                    </div>
                    <div style={{ background: 'var(--bg-hover)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                      <div style={{
                        width: `${t.progress}%`, height: '100%', borderRadius: 6,
                        background: t.progress > 50 ? 'var(--accent-primary)' : 'var(--accent-light)',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2, textAlign: 'right' }}>{t.progress}%</div>
                  </div>
                ))}
              </div>

              {/* Version history chart */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TrendingUp size={16} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>模型迭代历史</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>CTR预测模型 7个版本</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={versionHistory}>
                    <XAxis dataKey="version" tick={{ fontSize: 11, fill: '#9b8cb8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" domain={[0.65, 0.82]} tick={{ fontSize: 11, fill: '#9b8cb8' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" domain={[88, 100]} tick={{ fontSize: 11, fill: '#9b8cb8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area yAxisId="right" type="monotone" dataKey="准确率" fill="#e8365d20" stroke="#e8365d" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="AUC" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', cursor: 'pointer' }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2, cursor: 'pointer', onClick: (_: any, payload: any) => { if (payload && payload.payload) setSelectedDetail({type: 'version', data: payload.payload}) } }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              {/* A/B Tests */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertTriangle size={16} color="#f59e0b" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>A/B测试</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>2 个进行中</span>
                </div>
                {abTests.map((test, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 10, marginBottom: i < abTests.length - 1 ? 10 : 0,
                    border: '1px solid var(--border-light)', background: 'var(--bg-hover)',
                    cursor: 'pointer', transition: 'box-shadow 0.15s',
                  }}
                  onClick={() => setSelectedDetail({type: 'abtest', data: test})}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(232,54,93,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>{test.model}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.72rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Champion: </span>
                        <span style={{ fontWeight: 600 }}>{test.champion}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Challenger: </span>
                        <span style={{ fontWeight: 600, color: '#e8365d' }}>{test.challenger}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>流量: {test.traffic}</span>
                      <span>已运行: {test.days}天</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Lift: {test.lift}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* GPU resource monitor */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Cpu size={16} color="#3b82f6" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>资源监控</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#f59e0b', fontWeight: 600 }}>GPU 82.4%</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={gpuMetrics}>
                    <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9b8cb8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9b8cb8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="使用率" fill="#e8365d" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="吞吐量" fill="#ff9eb540" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GPU allocation detail */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Activity size={16} color="#ff7a95" />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>GPU分配详情</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-muted)' }}>A100×8 集群</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {gpuAllocation.map((g, i) => (
                  <div key={i} style={{
                    padding: 14, borderRadius: 10, border: '1px solid var(--border-light)',
                    background: 'var(--bg-hover)', textAlign: 'center', cursor: 'pointer',
                  }} onClick={() => setSelectedDetail({type: 'gpu_alloc', data: g})}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>{g.name}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e8365d', marginBottom: 4 }}>
                      {g.gpus} GPU
                    </div>
                    <div style={{ background: 'var(--border-light)', borderRadius: 6, height: 6, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{
                        width: `${g.util}%`, height: '100%', borderRadius: 6,
                        background: g.util > 90 ? '#ef4444' : g.util > 75 ? '#f59e0b' : '#10b981',
                      }} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>利用率 {g.util}%</div>
                  </div>
                ))}
              </div>
              <div style={{
                display: 'flex', gap: 24, marginTop: 14, padding: '10px 14px',
                borderRadius: 8, background: 'var(--rose-50, #faf5ff)', border: '1px solid var(--border-light)',
                fontSize: '0.72rem', color: 'var(--text-secondary)',
              }}>
                <span><strong style={{ color: 'var(--text-primary)' }}>总GPU:</strong> 8×A100 80GB</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>已分配:</strong> 8/8</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>平均利用率:</strong> 82.4%</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>日均训练:</strong> 2.3个模型</span>
                <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 600 }}>
                  <AlertTriangle size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                  素材生成模型GPU利用率偏高
                </span>
              </div>
            </div>
          </>
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
                {selectedDetail.type === 'model_kpi' && `KPI详情: ${selectedDetail.data.label}`}
                {selectedDetail.type === 'deployment' && `部署详情: ${selectedDetail.data.model}`}
                {selectedDetail.type === 'gpu_alloc' && `GPU分配: ${selectedDetail.data.name}`}
                {selectedDetail.type === 'gpu_process' && `GPU进程详情`}
                {selectedDetail.type === 'training' && `训练详情: ${selectedDetail.data.name}`}
                {selectedDetail.type === 'abtest' && `A/B测试: ${selectedDetail.data.model}`}
                {selectedDetail.type === 'version' && `版本详情: ${selectedDetail.data.version}`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'model_kpi' && (() => {
              const kpiLabel = selectedDetail.data.label
              const kpiColor = selectedDetail.data.color
              if (kpiLabel === '在线模型') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: kpiColor }}>8</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>在线模型总数</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[{l:'运行中',v:'6',c:'#16a34a'},{l:'训练中',v:'1',c:'#d97706'},{l:'待部署',v:'1',c:'#6366f1'}].map(s=>(
                      <div key={s.l} style={{textAlign:'center',padding:12,background:`${s.c}10`,borderRadius:8,border:`1px solid ${s.c}30`}}>
                        <div style={{fontSize:'1.5rem',fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <table className="data-table">
                    <thead><tr><th>模型</th><th>版本</th><th>状态</th><th>指标</th></tr></thead>
                    <tbody>
                      {models.map(m=>(
                        <tr key={m.name} style={{cursor:'pointer'}} onClick={()=>{setSelectedDetail(null);setModelDrill(m)}}>
                          <td style={{fontWeight:600}}>{m.name}</td><td>{m.version}</td>
                          <td style={{color:statusColors[m.status]?.text}}>{m.status}</td>
                          <td style={{color:m.color,fontWeight:600}}>{m.metric}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
              if (kpiLabel === '日推理总量') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: kpiColor }}>24.7万</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>日推理总量 · 较昨日 +3.2%</div>
                  </div>
                  <table className="data-table">
                    <thead><tr><th>模型</th><th>日推理量</th><th>占比</th><th>趋势</th></tr></thead>
                    <tbody>
                      {[{n:'CTR预测模型',v:'12.4万',p:'50.2%',t:'+2.1%'},{n:'CVR预测模型',v:'8.6万',p:'34.8%',t:'+4.5%'},{n:'出价优化模型',v:'1,847',p:'0.7%',t:'-1.2%'},{n:'受众扩展模型',v:'3,200',p:'1.3%',t:'+8.3%'},{n:'合规检测模型',v:'478',p:'0.2%',t:'+12.0%'},{n:'素材疲劳预测',v:'591',p:'0.2%',t:'+3.7%'},{n:'跨平台预算分配',v:'24',p:'<0.1%',t:'稳定'}].map(r=>(
                        <tr key={r.n}><td style={{fontWeight:600}}>{r.n}</td><td>{r.v}</td><td>{r.p}</td><td style={{color:'#22c55e',fontWeight:600}}>{r.t}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{padding:12,background:'rgba(59,130,246,0.06)',borderRadius:8,fontSize:'0.75rem',color:'var(--text-muted)',lineHeight:1.6}}>
                    峰值时段: 14:00-16:00 (3.8万次/小时) · 低谷时段: 02:00-06:00 (0.4万次/小时)<br/>
                    P99延迟: 42ms · 平均延迟: 12ms · 失败率: 0.02%
                  </div>
                </div>
              )
              if (kpiLabel === '平均AUC') return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: kpiColor }}>0.75</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>核心预测模型平均AUC</div>
                  </div>
                  <table className="data-table">
                    <thead><tr><th>模型</th><th>AUC</th><th>上版本</th><th>提升</th></tr></thead>
                    <tbody>
                      {[{n:'CTR预测模型',v:'0.78',p:'0.76',d:'+0.02'},{n:'CVR预测模型',v:'0.72',p:'0.70',d:'+0.02'},{n:'出价优化模型',v:'0.75(MAPE)',p:'0.74',d:'+0.01'}].map(r=>(
                        <tr key={r.n}><td style={{fontWeight:600}}>{r.n}</td><td style={{fontWeight:700,color:'#10b981'}}>{r.v}</td><td>{r.p}</td><td style={{color:'#22c55e'}}>{r.d}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{padding:12,background:'rgba(16,185,129,0.06)',borderRadius:8,fontSize:'0.75rem',color:'var(--text-muted)',lineHeight:1.6}}>
                    过去30天AUC整体提升 +0.03 · 模型漂移检测: 正常 · 下次大版本迭代: 预计4月15日
                  </div>
                </div>
              )
              // GPU集群
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: kpiColor }}>A100x8</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GPU集群 · 使用率 82.4%</div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                    {gpuAllocation.map(g=>(
                      <div key={g.name} style={{textAlign:'center',padding:12,background:'var(--bg-card)',borderRadius:8,border:'1px solid var(--border)'}}>
                        <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:4}}>{g.name}</div>
                        <div style={{fontSize:'1.2rem',fontWeight:700,color:'#e8365d'}}>{g.gpus} GPU</div>
                        <div style={{fontSize:'0.7rem',color: g.util > 90 ? '#ef4444' : g.util > 75 ? '#f59e0b' : '#10b981',fontWeight:600,marginTop:2}}>{g.util}%</div>
                      </div>
                    ))}
                  </div>
                  <table className="data-table">
                    <thead><tr><th>指标</th><th>值</th></tr></thead>
                    <tbody>
                      {[{m:'总显存',v:'640 GB (8x80GB)'},{m:'已使用显存',v:'528 GB (82.5%)'},{m:'日均训练任务',v:'2.3个模型'},{m:'排队任务',v:'1个'},{m:'平均GPU温度',v:'68°C'},{m:'电力消耗',v:'2.4 kW/h'}].map(r=>(
                        <tr key={r.m}><td>{r.m}</td><td style={{fontWeight:600}}>{r.v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}

            {selectedDetail.type === 'deployment' && (() => {
              const d = selectedDetail.data
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>旧版本</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6b7280' }}>{d.from}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', color: '#e8365d' }}>→</div>
                    <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>新版本</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#e8365d' }}>{d.to}</div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                    {[
                      { label: '模型', value: d.model },
                      { label: '部署日期', value: d.date },
                      { label: '效果提升', value: d.result },
                      { label: '部署状态', value: d.status },
                      { label: '部署耗时', value: '4分钟' },
                      { label: '灰度比例', value: '10% → 50% → 100%' },
                      { label: '回滚次数', value: '0' },
                      { label: '部署方式', value: '蓝绿部署 + Canary' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                        <span style={{ fontWeight: 600 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>性能对比 (新 vs 旧)</div>
                    <table className="data-table">
                      <thead><tr><th>指标</th><th>{d.from}</th><th>{d.to}</th><th>变化</th></tr></thead>
                      <tbody>
                        {[{m:'P99延迟',o:'45ms',n:'42ms',d:'-3ms'},{m:'吞吐量',o:'1,800/s',n:'1,950/s',d:'+8.3%'},{m:'错误率',o:'0.05%',n:'0.03%',d:'-40%'},{m:'内存占用',o:'32GB',n:'34GB',d:'+6.3%'}].map(r=>(
                          <tr key={r.m}><td>{r.m}</td><td>{r.o}</td><td style={{fontWeight:600}}>{r.n}</td><td style={{color:'#22c55e',fontWeight:600}}>{r.d}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>关联投放计划</div>
                    {['玛丽黛佳唇釉春季推广','粉底液抖音种草计划','眼影盘直播带货'].map(c=>(
                      <div key={c} style={{padding:'8px 12px',marginBottom:6,background:'rgba(232,54,93,0.04)',borderRadius:6,fontSize:'0.78rem',border:'1px solid var(--border)'}}>
                        {c} <span style={{color:'#22c55e',fontWeight:600,marginLeft:8}}>已同步</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setSelectedDetail(null)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #f97316', background: '#f9731620', color: '#f97316', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer' }}>一键回滚至 {d.from}</button>
                    <button onClick={() => setSelectedDetail(null)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #3b82f6', background: '#3b82f620', color: '#3b82f6', fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer' }}>查看完整日志</button>
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'gpu_alloc' && (() => {
              const g = selectedDetail.data
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'GPU数量', value: `${g.gpus} GPU`, color: '#e8365d' },
                      { label: '利用率', value: `${g.util}%`, color: g.util > 90 ? '#ef4444' : g.util > 75 ? '#f59e0b' : '#10b981' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>GPU进程列表</div>
                  <table className="data-table">
                    <thead><tr><th>进程</th><th>显存</th><th>利用率</th></tr></thead>
                    <tbody>
                      {['推理服务', '训练任务', '数据预处理'].map((proc, i) => (
                        <tr key={proc} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'gpu_process', data: {name: g.name, process: proc}})}>
                          <td style={{ fontWeight: 500 }}>{proc}</td>
                          <td>{[45, 30, 5][i]} GB</td>
                          <td style={{ color: '#ff9eb5' }}>{[g.util * 0.6, g.util * 0.3, g.util * 0.1].map(v => v.toFixed(0))[i]}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )
            })()}

            {selectedDetail.type === 'gpu_process' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                {[
                  { label: '模型', value: selectedDetail.data.name },
                  { label: '进程', value: selectedDetail.data.process },
                  { label: 'PID', value: '12345' },
                  { label: '运行时间', value: '4小时' },
                  { label: '状态', value: '运行中' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedDetail.type === 'training' && (() => {
              const t = selectedDetail.data
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[{l:'进度',v:`${t.progress}%`,c:'#e8365d'},{l:'GPU',v:t.gpu,c:'#3b82f6'},{l:'预计完成',v:t.eta,c:'#f59e0b'}].map(s=>(
                      <div key={s.l} style={{textAlign:'center',padding:14,background:`${s.c}10`,borderRadius:10,border:`1px solid ${s.c}30`}}>
                        <div style={{fontSize:'1.3rem',fontWeight:700,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'var(--bg-hover)',borderRadius:8,height:12,overflow:'hidden'}}>
                    <div style={{width:`${t.progress}%`,height:'100%',borderRadius:8,background:'linear-gradient(90deg, #e8365d, #ff7a95)',transition:'width 0.5s'}}/>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                    {[
                      {label:'任务名称',value:t.name},
                      {label:'GPU资源',value:t.gpu},
                      {label:'当前Epoch',value:`${Math.round(t.progress * 0.5)}/50`},
                      {label:'当前Loss',value:(0.35 - t.progress * 0.003).toFixed(4)},
                      {label:'验证集Loss',value:(0.38 - t.progress * 0.003).toFixed(4)},
                      {label:'学习率',value:'3e-4 (余弦退火)'},
                      {label:'批量大小',value:'64'},
                      {label:'训练数据量',value:'8.5M样本'},
                      {label:'GPU利用率',value:`${85 + Math.round(Math.random()*10)}%`},
                      {label:'显存使用',value:`${t.gpu.includes('×4') ? '296' : t.gpu.includes('×2') ? '148' : '74'} GB / ${t.gpu.includes('×4') ? '320' : t.gpu.includes('×2') ? '160' : '80'} GB`},
                      {label:'启动时间',value:'2026-04-05 09:15:00'},
                      {label:'预计完成',value:t.eta},
                    ].map(row=>(
                      <div key={row.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:'0.78rem'}}>
                        <span style={{color:'var(--text-muted)'}}>{row.label}</span>
                        <span style={{fontWeight:600}}>{String(row.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>Loss曲线趋势</div>
                    <div style={{padding:12,background:'var(--bg-card)',borderRadius:8,border:'1px solid var(--border)',fontSize:'0.75rem',color:'var(--text-muted)',lineHeight:1.8}}>
                      Epoch 1-10: Loss从0.85快速下降至0.42 (快速收敛阶段)<br/>
                      Epoch 10-20: Loss从0.42缓慢降至0.35 (精细调优阶段)<br/>
                      Epoch 20-{Math.round(t.progress * 0.5)}: Loss在0.35附近波动，验证集Loss同步下降<br/>
                      <span style={{color:'#22c55e',fontWeight:600}}>趋势正常，无过拟合迹象</span>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>最近训练日志</div>
                    {[
                      {time:'10:32:15',msg:`Epoch ${Math.round(t.progress*0.5)} completed, loss=0.${350-t.progress*3}`,level:'INFO'},
                      {time:'10:28:44',msg:'Checkpoint saved: model_best.pth',level:'INFO'},
                      {time:'10:15:02',msg:'Learning rate adjusted: 3e-4 → 2.8e-4',level:'INFO'},
                      {time:'09:58:30',msg:'Validation AUC improved: 0.776 → 0.779',level:'SUCCESS'},
                      {time:'09:45:11',msg:'GPU memory spike detected, auto-recovered',level:'WARN'},
                    ].map((log,i)=>(
                      <div key={i} style={{display:'flex',gap:10,marginBottom:6,fontSize:'0.72rem',alignItems:'center'}}>
                        <span style={{color:'var(--text-muted)',fontFamily:'monospace',minWidth:64}}>{log.time}</span>
                        <span style={{padding:'1px 6px',borderRadius:4,fontSize:'0.65rem',fontWeight:600,
                          background: log.level==='SUCCESS'?'rgba(22,163,74,0.15)':log.level==='WARN'?'rgba(245,158,11,0.15)':'rgba(99,102,241,0.1)',
                          color: log.level==='SUCCESS'?'#16a34a':log.level==='WARN'?'#f59e0b':'#6366f1'
                        }}>{log.level}</span>
                        <span style={{color:'var(--text-secondary)',flex:1}}>{log.msg}</span>
                      </div>
                    ))}
                  </div>
                  {detailActionMsg && (
                    <div style={{padding:'10px 14px',borderRadius:8,background:`${detailActionMsg.color}18`,border:`1px solid ${detailActionMsg.color}40`,fontSize:'0.78rem',color:detailActionMsg.color,fontWeight:600}}>{detailActionMsg.text}</div>
                  )}
                  {detailConfirm?.action === 'stop' && (
                    <div style={{padding:12,borderRadius:8,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)'}}>
                      <div style={{fontSize:'0.8rem',fontWeight:700,color:'#ef4444',marginBottom:6}}>⚠️ 确认停止训练？</div>
                      <div style={{fontSize:'0.73rem',color:'var(--text-muted)',marginBottom:10}}>当前训练进度将保留 Checkpoint，可随时从此处继续。</div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>triggerDetailAction('🛑 训练已停止，Checkpoint 已保存至 model_checkpoint_latest.pth', '#ef4444')} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#ef4444',color:'white',fontSize:'0.73rem',fontWeight:600,cursor:'pointer'}}>确认停止</button>
                        <button onClick={()=>setDetailConfirm(null)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid var(--border)',background:'none',color:'var(--text-muted)',fontSize:'0.73rem',cursor:'pointer'}}>取消</button>
                      </div>
                    </div>
                  )}
                  {detailConfirm?.action === 'params' && (
                    <div style={{padding:12,borderRadius:8,background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.2)'}}>
                      <div style={{fontSize:'0.8rem',fontWeight:700,color:'#3b82f6',marginBottom:10}}>⚙️ 调整训练参数</div>
                      {[{label:'学习率',val:'3e-4'},{label:'Batch Size',val:'64'},{label:'Early Stop',val:'5 epochs'}].map(p=>(
                        <div key={p.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,fontSize:'0.75rem'}}>
                          <span style={{color:'var(--text-muted)'}}>{p.label}</span>
                          <input defaultValue={p.val} style={{width:100,padding:'3px 8px',borderRadius:5,border:'1px solid var(--border)',fontSize:'0.75rem',background:'var(--bg-primary)',color:'var(--text-primary)'}} />
                        </div>
                      ))}
                      <button onClick={()=>triggerDetailAction('✅ 参数已更新，将在下一个 Epoch 生效', '#3b82f6')} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#3b82f6',color:'white',fontSize:'0.73rem',fontWeight:600,cursor:'pointer',marginTop:4}}>应用参数</button>
                    </div>
                  )}
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setDetailConfirm({action:'stop',label:'停止训练',color:'#ef4444'})} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #ef4444',background:'#ef444420',color:'#ef4444',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>停止训练</button>
                    <button onClick={()=>setDetailConfirm({action:'params',label:'调整参数',color:'#3b82f6'})} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #3b82f6',background:'#3b82f620',color:'#3b82f6',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>调整参数</button>
                    <button onClick={()=>triggerDetailAction('🔗 TensorBoard 已在新标签打开：http://train-server:6006 · 实时监控 Loss/AUC 曲线', '#6366f1')} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #6366f1',background:'#6366f120',color:'#6366f1',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>查看TensorBoard</button>
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'abtest' && (() => {
              const test = selectedDetail.data
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.2)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Champion</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>{test.champion}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.2)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Challenger</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e8365d' }}>{test.challenger}</div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                    {[
                      {label:'模型',value:test.model},
                      {label:'流量分配',value:`Challenger ${test.traffic} / Champion ${100-parseInt(test.traffic)}%`},
                      {label:'已运行',value:`${test.days}天`},
                      {label:'样本量 (Champion)',value:'42,380'},
                      {label:'样本量 (Challenger)',value: parseInt(test.traffic) === 10 ? '4,710' : '2,119'},
                      {label:'当前Lift',value:test.lift},
                      {label:'统计显著性',value: test.days >= 3 ? '92.4%' : '67.8%'},
                      {label:'P-value',value: test.days >= 3 ? '0.038' : '0.142'},
                      {label:'预计达标天数',value: test.days >= 3 ? '已达标' : `还需 ${5-test.days} 天`},
                    ].map(row=>(
                      <div key={row.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:'0.78rem'}}>
                        <span style={{color:'var(--text-muted)'}}>{row.label}</span>
                        <span style={{fontWeight:600}}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>每日指标趋势</div>
                    <table className="data-table">
                      <thead><tr><th>日期</th><th>Champion指标</th><th>Challenger指标</th><th>Lift</th></tr></thead>
                      <tbody>
                        {Array.from({length:test.days},(_,i)=>({
                          date:`04/${String(5-test.days+1+i).padStart(2,'0')}`,
                          c: (0.78+i*0.001).toFixed(3),
                          t: (0.79+i*0.002).toFixed(3),
                          lift:`+${(1.0+i*0.3).toFixed(1)}%`
                        })).map(r=>(
                          <tr key={r.date}><td>{r.date}</td><td>{r.c}</td><td style={{fontWeight:600,color:'#e8365d'}}>{r.t}</td><td style={{color:'#22c55e'}}>{r.lift}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{padding:12,background: test.days >= 3 ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',borderRadius:8,border:`1px solid ${test.days >= 3 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`}}>
                    <div style={{fontSize:'0.82rem',fontWeight:700,color: test.days >= 3 ? '#22c55e' : '#f59e0b',marginBottom:4}}>
                      {test.days >= 3 ? 'AI建议: 可以推全量' : 'AI建议: 继续观察'}
                    </div>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)',lineHeight:1.6}}>
                      {test.days >= 3
                        ? `Challenger版本在${test.days}天测试中稳定领先，Lift ${test.lift}，统计显著性已达92.4%，建议逐步扩大Challenger流量至100%。`
                        : `当前测试仅运行${test.days}天，样本量不足以得出可靠结论。建议至少再观察${5-test.days}天以达到95%统计显著性。`
                      }
                    </div>
                  </div>
                  {detailActionMsg && (
                    <div style={{padding:'10px 14px',borderRadius:8,background:`${detailActionMsg.color}18`,border:`1px solid ${detailActionMsg.color}40`,fontSize:'0.78rem',color:detailActionMsg.color,fontWeight:600}}>{detailActionMsg.text}</div>
                  )}
                  {detailConfirm?.action === 'rollout' && (
                    <div style={{padding:12,borderRadius:8,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.3)'}}>
                      <div style={{fontSize:'0.8rem',fontWeight:700,color:'#22c55e',marginBottom:6}}>🚀 确认推全量？</div>
                      <div style={{fontSize:'0.73rem',color:'var(--text-muted)',marginBottom:10}}>Challenger 将承接 100% 流量，Champion 进入备用状态。</div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>triggerDetailAction('✅ 已推全量！Challenger 版本现在承接 100% 流量，Champion 已归档', '#22c55e')} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#22c55e',color:'white',fontSize:'0.73rem',fontWeight:600,cursor:'pointer'}}>确认推全量</button>
                        <button onClick={()=>setDetailConfirm(null)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid var(--border)',background:'none',color:'var(--text-muted)',fontSize:'0.73rem',cursor:'pointer'}}>取消</button>
                      </div>
                    </div>
                  )}
                  {detailConfirm?.action === 'expand' && (
                    <div style={{padding:12,borderRadius:8,background:'rgba(249,115,22,0.06)',border:'1px solid rgba(249,115,22,0.2)'}}>
                      <div style={{fontSize:'0.8rem',fontWeight:700,color:'#f97316',marginBottom:8}}>📈 扩大 Challenger 流量</div>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                        <span style={{fontSize:'0.73rem',color:'var(--text-muted)'}}>当前</span>
                        <span style={{fontWeight:700,color:'#f97316'}}>10%</span>
                        <span style={{fontSize:'0.73rem',color:'var(--text-muted)'}}>→ 目标</span>
                        <input type="range" min={10} max={50} defaultValue={20} style={{flex:1}} />
                        <span style={{fontSize:'0.73rem',fontWeight:600}}>20%</span>
                      </div>
                      <button onClick={()=>triggerDetailAction('✅ 流量已调整至 20%，持续观察 24h 后再次评估', '#f97316')} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#f97316',color:'white',fontSize:'0.73rem',fontWeight:600,cursor:'pointer'}}>确认扩流量</button>
                    </div>
                  )}
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setDetailConfirm({action:'rollout',label:'推全量',color:'#22c55e'})} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #22c55e',background:'#22c55e20',color:'#22c55e',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>推全量</button>
                    <button onClick={()=>setDetailConfirm({action:'expand',label:'扩大流量',color:'#f97316'})} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #f97316',background:'#f9731620',color:'#f97316',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>扩大流量</button>
                    <button onClick={()=>triggerDetailAction('🛑 A/B 测试已终止，数据已归档，可在历史记录中查看', '#ef4444')} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #ef4444',background:'#ef444420',color:'#ef4444',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>终止测试</button>
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'version' && (() => {
              const v = selectedDetail.data
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    <div style={{textAlign:'center',padding:14,background:'rgba(16,185,129,0.06)',borderRadius:10,border:'1px solid rgba(16,185,129,0.2)'}}>
                      <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:4}}>AUC</div>
                      <div style={{fontSize:'1.5rem',fontWeight:700,color:'#10b981'}}>{v.AUC}</div>
                    </div>
                    <div style={{textAlign:'center',padding:14,background:'rgba(232,54,93,0.06)',borderRadius:10,border:'1px solid rgba(232,54,93,0.2)'}}>
                      <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:4}}>准确率</div>
                      <div style={{fontSize:'1.5rem',fontWeight:700,color:'#e8365d'}}>{v['准确率']}%</div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                    {[
                      {label:'版本号',value:v.version},
                      {label:'模型',value:'CTR预测模型'},
                      {label:'AUC',value:v.AUC},
                      {label:'准确率',value:`${v['准确率']}%`},
                      {label:'训练日期',value:`2026-0${3+Math.round(v.AUC*10)%2}-${10+Math.round(v.AUC*100)%20}`},
                      {label:'训练样本量',value:`${(6+v.AUC*3).toFixed(1)}M`},
                      {label:'训练时长',value:`${2+Math.round(v.AUC*5)}小时`},
                      {label:'特征数量',value:`${180+Math.round(v.AUC*50)}`},
                      {label:'模型大小',value:`${(1.2+v.AUC*0.5).toFixed(1)} GB`},
                    ].map(row=>(
                      <div key={row.label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:'0.78rem'}}>
                        <span style={{color:'var(--text-muted)'}}>{row.label}</span>
                        <span style={{fontWeight:600}}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:'0.82rem',fontWeight:600,marginBottom:8}}>版本变更说明</div>
                    <div style={{padding:12,background:'rgba(99,102,241,0.06)',borderRadius:8,fontSize:'0.75rem',color:'var(--text-muted)',lineHeight:1.8}}>
                      {v.version === 'v3.2' ? '新增用户行为序列特征，优化注意力机制，AUC提升0.02' :
                       v.version === 'v3.1' ? '特征工程优化，加入时段交叉特征，训练数据扩充20%' :
                       v.version === 'v3.0' ? '模型架构升级为Transformer，大幅提升非线性特征捕获能力' :
                       `常规训练迭代，数据更新，超参数微调`}
                    </div>
                  </div>
                  {detailActionMsg && (
                    <div style={{padding:'10px 14px',borderRadius:8,background:`${detailActionMsg.color}18`,border:`1px solid ${detailActionMsg.color}40`,fontSize:'0.78rem',color:detailActionMsg.color,fontWeight:600}}>{detailActionMsg.text}</div>
                  )}
                  {detailConfirm?.action === 'rollback_ver' && (
                    <div style={{padding:12,borderRadius:8,background:'rgba(232,54,93,0.08)',border:'1px solid rgba(232,54,93,0.3)'}}>
                      <div style={{fontSize:'0.8rem',fontWeight:700,color:'#e8365d',marginBottom:6}}>⚠️ 确认回滚至 {v.version}？</div>
                      <div style={{fontSize:'0.73rem',color:'var(--text-muted)',marginBottom:10}}>当前运行的最新版本将停止服务，{v.version} 将在约 3 分钟内上线。</div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>triggerDetailAction(`✅ 回滚任务已提交！${v.version} 正在拉起，预计 3 分钟后完成切换`, '#e8365d')} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#e8365d',color:'white',fontSize:'0.73rem',fontWeight:600,cursor:'pointer'}}>确认回滚</button>
                        <button onClick={()=>setDetailConfirm(null)} style={{padding:'5px 12px',borderRadius:6,border:'1px solid var(--border)',background:'none',color:'var(--text-muted)',fontSize:'0.73rem',cursor:'pointer'}}>取消</button>
                      </div>
                    </div>
                  )}
                  {detailConfirm?.action === 'compare' && (
                    <div style={{padding:12,borderRadius:8,background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.2)'}}>
                      <div style={{fontSize:'0.8rem',fontWeight:700,color:'#6366f1',marginBottom:8}}>📊 与当前版本对比</div>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.75rem'}}>
                        <thead><tr style={{color:'var(--text-muted)'}}>
                          <th style={{textAlign:'left',paddingBottom:6}}>指标</th>
                          <th style={{textAlign:'right',paddingBottom:6}}>{v.version}</th>
                          <th style={{textAlign:'right',paddingBottom:6}}>当前 v3.2</th>
                          <th style={{textAlign:'right',paddingBottom:6}}>差异</th>
                        </tr></thead>
                        <tbody>
                          {[{label:'AUC',old:v.AUC,now:0.78},{label:'准确率',old:v['准确率'],now:96.8}].map(r=>(
                            <tr key={r.label} style={{borderTop:'1px solid var(--border)'}}>
                              <td style={{padding:'5px 0',color:'var(--text-muted)'}}>{r.label}</td>
                              <td style={{textAlign:'right',padding:'5px 0'}}>{r.old}</td>
                              <td style={{textAlign:'right',padding:'5px 0',fontWeight:600,color:'#e8365d'}}>{r.now}</td>
                              <td style={{textAlign:'right',padding:'5px 0',color:'#22c55e'}}>+{(r.now-r.old).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>setDetailConfirm({action:'rollback_ver',label:'回滚',color:'#e8365d'})} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #e8365d',background:'#e8365d20',color:'#e8365d',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>回滚至此版本</button>
                    <button onClick={()=>setDetailConfirm({action:'compare',label:'对比',color:'#6366f1'})} style={{padding:'8px 14px',borderRadius:8,border:'1px solid #6366f1',background:'#6366f120',color:'#6366f1',fontSize:'0.77rem',fontWeight:600,cursor:'pointer'}}>对比其他版本</button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
