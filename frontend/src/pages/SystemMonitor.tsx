import React, { useState } from 'react'
import { kafkaEvents } from '../data/agents'
import { Cpu, Database, Cloud, Zap, Server, HardDrive, Wifi, Monitor, Brain, Wrench, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

const infraComponents = [
  { name: 'API Gateway (Kong)', status: 'healthy', cpu: 23, memory: 45, icon: Wifi },
  { name: 'Kubernetes 主集群', status: 'healthy', cpu: 67, memory: 72, icon: Server },
  { name: 'Kafka 协同总线', status: 'healthy', cpu: 45, memory: 58, icon: Zap },
  { name: 'PostgreSQL', status: 'healthy', cpu: 34, memory: 61, icon: Database },
  { name: 'Redis 缓存', status: 'healthy', cpu: 18, memory: 43, icon: HardDrive },
  { name: 'Milvus 向量库', status: 'healthy', cpu: 56, memory: 78, icon: Database },
  { name: 'Neo4j 图数据库', status: 'healthy', cpu: 41, memory: 55, icon: Database },
  { name: 'GPU集群 (A100)', status: 'healthy', cpu: 89, memory: 85, icon: Cpu },
  { name: 'Triton 推理服务', status: 'healthy', cpu: 78, memory: 82, icon: Server },
  { name: 'CloudFront CDN', status: 'healthy', cpu: 12, memory: 25, icon: Cloud },
  { name: 'S3 对象存储', status: 'healthy', cpu: 5, memory: 34, icon: HardDrive },
  { name: 'Flink 实时流', status: 'healthy', cpu: 62, memory: 71, icon: Zap },
]

const modelInfo = [
  // ── 投放核心 ──
  { name: 'CTR-Predictor-DeepFM',      type: '点击率预测',     tuning: '全参数微调 + 特征交叉', optimization: 'TensorRT, FP16量化',        lastTrain: '今日 01:00', latency: '5ms',    qps: 120000, accuracy: 92.4, status: 'running', group: '投放优化' },
  { name: 'CVR-Predictor-ESMM',        type: '转化率预测',     tuning: '多任务联合训练',         optimization: 'ONNX导出, vLLM serving',    lastTrain: '今日 01:05', latency: '6ms',    qps: 95000,  accuracy: 89.7, status: 'running', group: '投放优化' },
  { name: 'BidOptimizer-DQN',          type: '出价优化',       tuning: '在线强化学习',           optimization: '经验回放, 目标网络',          lastTrain: '今日 00:18', latency: '12ms',   qps: 45000,  accuracy: 94.2, status: 'running', group: '投放优化' },
  { name: 'CreativeFatigue-MAB',       type: '素材疲劳检测',   tuning: '实时上下文学习',         optimization: 'Thompson Sampling在线更新',  lastTrain: '实时更新',   latency: '3ms',    qps: 80000,  accuracy: 88.7, status: 'running', group: '投放优化' },
  { name: 'TrafficPacing-RL',          type: '预算时段节奏',   tuning: '在线PPO',               optimization: '梯度裁剪, KL惩罚',           lastTrain: '实时更新',   latency: '8ms',    qps: 28000,  accuracy: 90.1, status: 'running', group: '投放优化' },
  { name: 'SearchQuery-Optimizer',     type: '搜索词竞价优化', tuning: '强化学习+意图分类',      optimization: '每小时增量训练',              lastTrain: '1小时前',    latency: '30ms',   qps: 16000,  accuracy: 88.9, status: 'running', group: '投放优化' },
  { name: 'BudgetMO-Optimizer',        type: '多目标预算优化', tuning: 'MORL多目标',            optimization: 'Pareto前沿采样',             lastTrain: '每日更新',   latency: '65ms',   qps: 2000,   accuracy: 88.3, status: 'running', group: '投放优化' },
  { name: 'LiveGMV-LSTM',             type: '直播GMV预测',    tuning: 'LSTM+Attention',        optimization: '滑动窗口在线学习',            lastTrain: '实时更新',   latency: '48ms',   qps: 4500,   accuracy: 85.6, status: 'running', group: '投放优化' },
  { name: 'Lookalike-Expander',        type: 'Lookalike扩展',  tuning: '双塔对比学习',           optimization: '近似最近邻 (Faiss)',          lastTrain: '每日更新',   latency: '55ms',   qps: 5500,   accuracy: 86.2, status: 'running', group: '投放优化' },
  { name: 'NewSKU-ColdStart',          type: '新品冷启动',     tuning: 'MAML元学习',            optimization: '内容特征迁移',               lastTrain: '上新触发',   latency: '32ms',   qps: 4200,   accuracy: 81.5, status: 'running', group: '投放优化' },
  // ── 内容生产 ──
  { name: 'ContentLLM-Finetuned',      type: '内容创作LLM',    tuning: 'LoRA (Qwen2.5)',        optimization: '4-bit量化, vLLM',           lastTrain: '每周更新',   latency: '180ms',  qps: 8000,   accuracy: 86.4, status: 'running', group: '内容生产' },
  { name: 'ImageGen-BeautySDXL',       type: '美妆图像生成',   tuning: 'LoRA (美妆专属)',       optimization: '梯度累积, xFormers',         lastTrain: '每月更新',   latency: '2800ms', qps: 200,    accuracy: 91.0, status: 'running', group: '内容生产' },
  { name: 'VideoHighlight-Detector',   type: '视频爆点检测',   tuning: 'SlowFast全参数',         optimization: '混合精度, 视频块并行',        lastTrain: '昨日',       latency: '340ms',  qps: 1200,   accuracy: 84.2, status: 'running', group: '内容生产' },
  { name: 'ComplianceNLP',            type: '合规文本检测',   tuning: 'LoRA微调+规则',         optimization: '敏感词缓存, Trie树',         lastTrain: '昨日',       latency: '35ms',   qps: 10000,  accuracy: 99.2, status: 'running', group: '内容生产' },
  // ── 风控安全 ──
  { name: 'FraudDetector-XGB',        type: '广告反欺诈',     tuning: '半监督+规则注入',        optimization: '树模型剪枝, SHAP解释',       lastTrain: '6小时前',    latency: '15ms',   qps: 30000,  accuracy: 96.8, status: 'running', group: '风控安全' },
  { name: 'FanFraud-GNN',             type: '粉丝虚假识别',   tuning: 'GraphSAGE半监督',        optimization: '图采样, 邻居聚合',           lastTrain: '3小时前',    latency: '38ms',   qps: 18000,  accuracy: 93.5, status: 'running', group: '风控安全' },
  { name: 'AnomalyDetector-LSTM',     type: 'ROI异常检测',    tuning: 'LSTM-AE无监督',         optimization: '动态阈值自适应',             lastTrain: '实时更新',   latency: '18ms',   qps: 25000,  accuracy: 95.1, status: 'running', group: '风控安全' },
  // ── 用户洞察 ──
  { name: 'SentimentNLP-Analyzer',    type: '用户情感分析',   tuning: 'RoBERTa细粒度',         optimization: 'ONNX量化, 批处理',          lastTrain: '昨日',       latency: '42ms',   qps: 12000,  accuracy: 91.2, status: 'running', group: '用户洞察' },
  { name: 'LTV-Predictor-DNN',        type: '用户LTV预测',    tuning: 'DNN+存活分析',          optimization: '特征嵌入缓存',               lastTrain: '每日更新',   latency: '35ms',   qps: 9000,   accuracy: 83.7, status: 'running', group: '用户洞察' },
  { name: 'KOLScore-MultiDim',        type: 'KOL多维评分',    tuning: 'GBM+图特征',            optimization: 'XGBoost列并行',             lastTrain: '每日更新',   latency: '55ms',   qps: 3000,   accuracy: 89.1, status: 'running', group: '达人生态' },
  // ── 归因预测 ──
  { name: 'Attribution-Shapley',      type: '多触点归因',     tuning: 'Shapley+DNN',           optimization: '蒙特卡洛采样加速',           lastTrain: '昨日',       latency: '22ms',   qps: 6000,   accuracy: 87.8, status: 'running', group: '归因预测' },
  { name: 'BayesianAB-Engine',        type: '贝叶斯AB实验',   tuning: 'Thompson Sampling',     optimization: '先验更新在线',               lastTrain: '实时更新',   latency: '12ms',   qps: 4000,   accuracy: 93.6, status: 'running', group: '归因预测' },
]

const GROUP_COLORS_SYS: Record<string, string> = {
  '投放优化': '#e8365d', '内容生产': '#ec4899', '风控安全': '#f59e0b',
  '用户洞察': '#8b5cf6', '达人生态': '#06b6d4', '归因预测': '#10b981',
}

const regions = [
  { name: '华北节点', location: 'cn-beijing', agents: 52, status: 'active', latency: '5ms' },
  { name: '华东节点', location: 'cn-hangzhou', agents: 52, status: 'active', latency: '4ms' },
  { name: '华南节点', location: 'cn-guangzhou', agents: 52, status: 'active', latency: '6ms' },
]

type InfraComp = typeof infraComponents[0]
type ModelItem = typeof modelInfo[0]

function ServiceDrillPanel({ comp, onClose }: { comp: InfraComp; onClose: () => void }) {
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
  const respData = Array.from({ length: 24 }, (_, i) => ({
    h: `${String(i).padStart(2,'0')}:00`,
    rt: parseFloat((20 + Math.sin(i * 0.8) * 15 + Math.random() * 5).toFixed(1)),
    err: parseFloat((0.2 + Math.random() * 0.5).toFixed(2)),
  }))
  const tooltipStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-primary)' }
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{comp.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>基础设施组件 · 状态: 健康</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>
        <div style={{ padding: 14, background: 'var(--bg-primary, rgba(0,0,0,0.04))', borderRadius: 10, border: '1px solid var(--border)' }}>
          {row('服务名称', comp.name)}
          {row('版本', 'v2024.03.1')}
          {row('运行时长', '99.97% (30天)')}
          {row('CPU 使用率', <span style={{ color: comp.cpu > 80 ? '#ef4444' : '#e8365d' }}>{comp.cpu}%</span>)}
          {row('内存使用率', <span style={{ color: comp.memory > 80 ? '#ef4444' : '#e8365d' }}>{comp.memory}%</span>)}
          {row('错误率', '0.12%')}
          {row('吞吐量', '2,847 req/s')}
        </div>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>响应时间趋势 (24h, ms)</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={respData}>
              <XAxis dataKey="h" tick={{ fontSize: 9, fill: '#9b8cb8' }} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: '#9b8cb8' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="rt" name="响应时间(ms)" stroke="#ff9eb5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>近期异常事件</div>
          {[
            { time: '03:42', desc: '内存使用率短暂超80%，已自动扩容', severity: '低' },
            { time: '昨日 18:15', desc: '响应时间P99超过200ms，持续2分钟', severity: '中' },
            { time: '3天前', desc: '计划内维护重启，服务中断4分钟', severity: '低' },
          ].map((inc, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 60 }}>{inc.time}</span>
              <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{inc.desc}</span>
              <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.68rem', background: inc.severity === '低' ? 'rgba(22,163,74,0.15)' : 'rgba(245,158,11,0.15)', color: inc.severity === '低' ? '#16a34a' : '#d97706', fontWeight: 600 }}>{inc.severity}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>依赖服务健康</div>
          {['PostgreSQL', 'Redis缓存', 'API Gateway'].map(dep => (
            <div key={dep} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{dep}</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>健康</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {btn('重启服务', '#ef4444')}
          {btn('查看日志', '#6366f1')}
          {btn('告警设置', '#f97316')}
        </div>
      </div>
    </>
  )
}

function ModelDrillPanel({ model, onClose }: { model: ModelItem; onClose: () => void }) {
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
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{model.name}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{model.type} · {model.tuning}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>
        <div style={{ padding: 14, background: 'var(--bg-primary, rgba(0,0,0,0.04))', borderRadius: 10, border: '1px solid var(--border)' }}>
          {row('用途', model.type)}
          {row('微调方式', model.tuning)}
          {row('优化手段', model.optimization)}
          {row('上次训练', model.lastTrain)}
          {row('下次训练', '明日 00:00 UTC')}
          {row('训练数据量', '8.5M 样本')}
          {row('准确率', <span style={{ color: '#34d399' }}>94.2%</span>)}
          {row('AUC', '0.78')}
          {row('RMSE', '0.023')}
        </div>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>A/B测试 vs 上一版本</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ label: '当前版本', val: 'AUC 0.78', color: '#34d399' }, { label: '上一版本', val: 'AUC 0.76', color: '#9b8cb8' }].map(v => (
              <div key={v.label} style={{ textAlign: 'center', padding: 10, background: 'var(--bg-primary, rgba(0,0,0,0.04))', borderRadius: 8 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{v.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: v.color }}>{v.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>Top 10 特征重要性</div>
          {['用户历史CTR', '广告新鲜度', '时段因子', '设备类型', '地区系数', '创意评分', '受众匹配度', '历史CVR', '竞价压力', '素材质量分'].map((f, i) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 16 }}>{i + 1}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1 }}>{f}</span>
              <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${100 - i * 9}%`, height: '100%', background: '#e8365d', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: '0.68rem', color: '#ff9eb5', minWidth: 32, textAlign: 'right' }}>{(10 - i * 0.8).toFixed(1)}%</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {btn('部署新版本', '#e8365d')}
          {btn('回滚', '#f97316')}
          {btn('触发重训练', '#3b82f6')}
          {btn('查看特征', '#6366f1')}
        </div>
      </div>
    </>
  )
}

export default function SystemMonitor() {
  const [tab, setTab] = useState<'infra' | 'models' | 'arch'>('infra')
  const [serviceDrill, setServiceDrill] = useState<InfraComp | null>(null)
  const [modelDrill, setModelDrill] = useState<ModelItem | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)

  // ── AI Config Registration ──
  const aiGroups: AIConfigGroup[] = [
    {
      title: '系统健康监控',
      icon: <Monitor size={18} />,
      params: [
        createParam('cpu_alert_threshold', 'CPU使用率预警阈值', 85, '%', 'CPU使用率超过此值触发告警', 80, 90),
        createParam('memory_alert_threshold', '内存使用率预警阈值', 80, '%', '内存使用率超过此值触发告警', 75, 88),
        createParam('disk_alert_threshold', '磁盘空间预警阈值', 90, '%', '磁盘空间使用率超过此值触发告警', 85, 92),
        createParam('response_time_p99', '服务响应时间P99上限', 200, 'ms', '服务P99响应时间超过此值触发告警', 100, 86),
      ],
    },
    {
      title: 'AI模型运行监控',
      icon: <Brain size={18} />,
      params: [
        createParam('ctr_latency_limit', 'CTR-DeepFM推理延迟上限', 10, 'ms', 'CTR点击率预测模型单次推理延迟上限，超出触发降级', 8, 92),
        createParam('bid_latency_limit', 'BidOptimizer-DQN延迟上限', 20, 'ms', 'DQN出价模型单次推理延迟上限', 15, 88),
        createParam('llm_latency_limit', 'ContentLLM推理延迟上限', 300, 'ms', '内容创作LLM单次推理延迟上限', 250, 84),
        createParam('gnn_latency_limit', 'FanFraud-GNN延迟上限', 80, 'ms', '粉丝虚假识别GNN模型延迟上限', 60, 85),
      ],
    },
    {
      title: '自动运维',
      icon: <Wrench size={18} />,
      params: [
        createParam('autoscale_cpu_trigger', '自动扩容触发CPU', 80, '%', 'CPU使用率超过此值触发自动扩容', 75, 89),
        createParam('autoscale_cooldown', '自动缩容等待时间', 300, '秒', '缩容前等待的冷却时间', 180, 83),
        createParam('self_heal_max_retry', '故障自愈最大重试', 3, '次', '故障自动恢复最大重试次数', 5, 86),
        createParam('ops_strategy', '运维策略', '手动', '', '自动运维策略模式', 'AI全自动', 87, { options: ['手动', '半自动', 'AI辅助', 'AI全自动'] }),
      ],
    },
  ]

  const learningStatus: AILearningStatus = {
    modelVersion: 'v2.1.0-sysmon',
    lastTraining: '10分钟前',
    totalDataPoints: 920000,
    avgConfidence: 88,
    autoAdjustCount24h: 456,
    learningRate: '0.0002 (AdamW)',
    nextTraining: '30分钟后',
    improvementRate: '+8.5%',
  }

  useRegisterAIConfig(aiGroups, learningStatus, '系统监控')

  return (
    <>
      {serviceDrill && <ServiceDrillPanel comp={serviceDrill} onClose={() => setServiceDrill(null)} />}
      {modelDrill && <ModelDrillPanel model={modelDrill} onClose={() => setModelDrill(null)} />}
      <div className="page-header">
        <h2>系统监控</h2>
        <p>技术架构 · 基础设施监控 · 模型训练状态 · 全球部署</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="AnomalyDetector-LSTM" color="#e8365d" />
        <ModelBadge name="AutoPipeline-Orchestrator" color="#e8365d" />
      </div>
      <div className="page-content">
        <div className="tabs">
          <button className={`tab ${tab === 'infra' ? 'active' : ''}`} onClick={() => setTab('infra')}>基础设施</button>
          <button className={`tab ${tab === 'models' ? 'active' : ''}`} onClick={() => setTab('models')}>模型服务</button>
          <button className={`tab ${tab === 'arch' ? 'active' : ''}`} onClick={() => setTab('arch')}>技术架构</button>
        </div>

        {tab === 'infra' && (
          <>
            {/* Global nodes */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
              {regions.map((r, i) => (
                <div key={i} className="card" style={{ borderLeft: '3px solid #ff9eb5', cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'region', data: r})}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Cloud size={18} color="#ff9eb5" />
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    <span className="status-badge running" style={{ marginLeft: 'auto' }}>
                      <span className="status-dot running" /> 活跃
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>区域: <strong style={{ color: 'var(--text-primary)' }}>{r.location}</strong></span>
                    <span>延迟: <strong style={{ color: '#ff9eb5' }}>{r.latency}</strong></span>
                    <span>智能体: <strong style={{ color: 'var(--text-primary)' }}>{r.agents}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Infrastructure grid */}
            <div className="section-title"><Server size={16} /> 基础设施组件</div>
            <div className="grid-3">
              {infraComponents.map((comp, i) => (
                <div key={i} className="card" style={{ padding: 14, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onClick={() => setServiceDrill(comp)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,54,93,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <comp.icon size={16} color="#e8365d" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{comp.name}</span>
                    <span className="status-badge running" style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '2px 6px' }}>
                      <span className="status-dot running" />
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>CPU {comp.cpu}%</div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{
                          width: `${comp.cpu}%`,
                          background: comp.cpu > 80 ? '#e8365d' : comp.cpu > 60 ? '#c084fc' : '#ff9eb5'
                        }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>MEM {comp.memory}%</div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{
                          width: `${comp.memory}%`,
                          background: comp.memory > 80 ? '#e8365d' : comp.memory > 60 ? '#c084fc' : '#ff9eb5'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'models' && (
          <>
            <div className="card" style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>每日自动训练流水线（UTC 0点触发）</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                数据准备 → LoRA/全参数微调 → 历史数据回测 + A/B测试 → 效果提升&gt;阈值自动发布（蓝绿切换）
              </div>
            </div>
            <div className="card" style={{ marginBottom: 12, padding: '10px 16px', background: 'rgba(232,54,93,0.06)', borderColor: 'rgba(232,54,93,0.15)', fontSize: '0.78rem' }}>
              <strong style={{ color: '#ffb4c6' }}>模型服务总览</strong>：当前在线 <strong style={{ color: '#ff7a95' }}>{modelInfo.length}</strong> 个模型，
              覆盖投放优化·内容生产·风控安全·用户洞察·达人生态·归因预测 6大类，全部由 Triton 推理服务托管，支持 A/B 灰度发布与自动回滚。
            </div>
            <div className="card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>模型名称</th>
                    <th>类型</th>
                    <th>延迟</th>
                    <th>QPS峰值</th>
                    <th>准确率</th>
                    <th>微调方式</th>
                    <th>上次训练</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {modelInfo.map((m, i) => (
                    <tr key={i} onClick={() => setModelDrill(m)} style={{ cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{m.name}</td>
                      <td>
                        <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600,
                          background: `${GROUP_COLORS_SYS[m.group] ?? '#e8365d'}20`,
                          color: GROUP_COLORS_SYS[m.group] ?? '#ffb4c6' }}>
                          {m.type}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{m.latency}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{m.qps.toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: m.accuracy > 95 ? '#22c55e' : m.accuracy > 85 ? '#ff7a95' : '#f59e0b' }}>{m.accuracy}%</td>
                      <td><span style={{ padding: '2px 8px', background: 'rgba(99,102,241,0.15)', borderRadius: 4, fontSize: '0.68rem', color: '#c4b5fd' }}>{m.tuning}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.lastTrain}</td>
                      <td><span className="status-badge running"><span className="status-dot running" /> 在线</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'arch' && (
          <div className="card">
            <div className="section-title">「玛丽黛佳」技术架构全景</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Layer 1: API Gateway */}
              <div style={{ padding: 16, background: 'rgba(232,54,93,0.1)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff7a95', marginBottom: 8 }}>接入层（API Gateway · Kong/Apisix）</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['抖音巨量API', '小红书聚光API', '快手磁力API', '天猫品销宝API'].map(api => (
                    <div key={api} style={{ padding: '6px 14px', background: 'rgba(232,54,93,0.15)', borderRadius: 6, fontSize: '0.75rem', color: '#ff9eb5' }}>{api}</div>
                  ))}
                </div>
              </div>
              {/* Layer 2: Agent Runtime */}
              <div style={{ padding: 16, background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffb3c6', marginBottom: 8 }}>智能体运行时层（Kubernetes 全球多集群）</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e8365d' }}>25</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>内容生产集群</div>
                  </div>
                  <div style={{ flex: 1, padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7' }}>12</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>投放集群</div>
                  </div>
                  <div style={{ flex: 1, padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#c084fc' }}>10</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>运营集群</div>
                  </div>
                  <div style={{ flex: 1, padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ff7a95' }}>5</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>协同引擎</div>
                  </div>
                </div>
              </div>
              {/* Layer 3: Kafka */}
              <div style={{ padding: 16, background: 'rgba(168,85,247,0.1)', borderRadius: 10, border: '1px solid rgba(168,85,247,0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: 8 }}>协同数据总线（Apache Kafka · 跨区域多集群）</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {kafkaEvents.map((e, i) => (
                    <span key={i} className="event-type">{e.type}</span>
                  ))}
                </div>
              </div>
              {/* Layer 4: Data */}
              <div style={{ padding: 16, background: 'rgba(232,54,93,0.1)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff9eb5', marginBottom: 8 }}>数据层</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { name: 'Iceberg', desc: '数据湖' },
                    { name: 'Feast', desc: '特征存储' },
                    { name: 'Neo4j', desc: '图数据库' },
                    { name: 'Milvus', desc: '向量数据库' },
                    { name: 'PostgreSQL', desc: '关系数据库' },
                    { name: 'Redis', desc: '缓存' },
                  ].map(d => (
                    <div key={d.name} style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Layer 5: Models */}
              <div style={{ padding: 16, background: 'rgba(168,85,247,0.1)', borderRadius: 10, border: '1px solid rgba(168,85,247,0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: 8 }}>模型层</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { name: 'ContentGPT', desc: 'LLM' },
                    { name: 'DiT', desc: '多模态生成' },
                    { name: 'Ray RLlib', desc: '强化学习' },
                    { name: 'Triton', desc: '推理服务' },
                  ].map(d => (
                    <div key={d.name} style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Layer 6: Infra */}
              <div style={{ padding: 16, background: 'rgba(109,40,217,0.1)', borderRadius: 10, border: '1px solid rgba(109,40,217,0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8365d', marginBottom: 8 }}>基础设施层</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { name: 'GPU A100/H100', desc: 'GPU集群' },
                    { name: '全球边缘节点', desc: '边缘部署' },
                    { name: 'S3/OSS', desc: '对象存储' },
                    { name: 'CloudFront', desc: 'CDN' },
                  ].map(d => (
                    <div key={d.name} style={{ flex: 1, padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{d.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
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
                {selectedDetail.type === 'region' && `区域详情: ${selectedDetail.data.name}`}
                {selectedDetail.type === 'arch_layer' && `架构层: ${selectedDetail.data.name}`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'region' && (() => {
              const r = selectedDetail.data
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: '状态', value: r.status, color: '#34d399' },
                      { label: '延迟', value: r.latency, color: '#ff9eb5' },
                      { label: '智能体', value: r.agents, color: '#c084fc' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', marginBottom: 16 }}>
                    {[
                      { label: '节点名称', value: r.name },
                      { label: '区域', value: r.location },
                      { label: '运行时长', value: '99.97%' },
                      { label: '带宽使用', value: '2.4 Gbps' },
                      { label: '连接数', value: '12,450' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                        <span style={{ fontWeight: 600 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>节点服务列表</div>
                  <table className="data-table">
                    <thead><tr><th>服务</th><th>CPU</th><th>内存</th><th>状态</th></tr></thead>
                    <tbody>
                      {['API Gateway', 'Kubernetes', 'Kafka', 'Redis'].map((svc, i) => (
                        <tr key={svc} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'arch_layer', data: {name: svc, region: r.name}})}>
                          <td style={{ fontWeight: 500 }}>{svc}</td>
                          <td>{[23, 67, 45, 18][i]}%</td>
                          <td>{[45, 72, 58, 43][i]}%</td>
                          <td style={{ color: '#34d399' }}>健康</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )
            })()}

            {selectedDetail.type === 'arch_layer' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                {[
                  { label: '服务名称', value: selectedDetail.data.name },
                  { label: '所属区域', value: selectedDetail.data.region },
                  { label: '版本', value: 'v2024.03.1' },
                  { label: '运行时长', value: '99.95%' },
                  { label: '最近异常', value: '无' },
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
