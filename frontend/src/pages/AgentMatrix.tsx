import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { agents, clusterInfo } from '../data/agents'
import type { Agent } from '../data/agents'
import { Bot, Search, X, Activity, Cpu, Database, Zap, RotateCcw, Settings, FileText, PauseCircle, Network, Bell, Clock, CheckCircle, AlertTriangle, Sliders, RefreshCw, Film, Megaphone, Eye, ShoppingCart, Heart, Play } from 'lucide-react'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'
import { agentApi, type AgentDefinition, type AgentRegistry, type VideoDeconstructionTask } from '../lib/agentApi'
import { agentPlaygroundApi, type PlaygroundAgentType, type PlaygroundExecutionResult } from '../lib/agentPlaygroundApi'
import { RUNNABLE_AGENT_PRESETS, getNewAgentDetailPath, inferRunnableAgentTypeFromMetadata, resolveRunnableAgentDisplayMetadata } from '../lib/newAgentCatalog'

// ── 36个智能体 → 真实模型目录映射 ──────────────────
const AGENT_MODEL_MAP: Record<number, {
  primary: string; primaryVer: string; primaryLatency: string; primaryAcc: number
  secondary?: string; framework: string; trainFreq: string
}> = {
  // 美妆内容生产集群
  1:  { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4, secondary: 'SentimentAnalyzer',        framework: 'Fine-tuned Qwen2.5 + LoRA',              trainFreq: '每周更新' },
  2:  { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4, secondary: 'HookQuality-BERT',           framework: 'Fine-tuned Qwen2.5 + LoRA',              trainFreq: '每周更新' },
  3:  { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4, secondary: 'LiveEngagement-Predictor',   framework: 'Fine-tuned Qwen2.5 + LoRA',              trainFreq: '每周更新' },
  4:  { primary: 'ImageGen-BeautySDXL',      primaryVer: 'v2.0.1', primaryLatency: '2800ms', primaryAcc: 91.0, secondary: 'NewSKU-ColdStart',          framework: 'SDXL + 美妆专属LoRA',                   trainFreq: '每月更新' },
  5:  { primary: 'VideoHighlight-Detector',  primaryVer: 'v1.7.3', primaryLatency: '340ms', primaryAcc: 84.2, secondary: 'VideoCompletion-Predictor',  framework: '双流卷积网络 (SlowFast)',                 trainFreq: '昨日' },
  6:  { primary: 'VideoHighlight-Detector',  primaryVer: 'v1.7.3', primaryLatency: '340ms', primaryAcc: 84.2, secondary: 'LiveEngagement-Predictor',   framework: '双流卷积网络 (SlowFast)',                 trainFreq: '昨日' },
  7:  { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4, secondary: 'ImageGen-BeautySDXL',        framework: 'Fine-tuned Qwen2.5 + LoRA',              trainFreq: '每周更新' },
  8:  { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4,                                           framework: 'Fine-tuned Qwen2.5 + LoRA',              trainFreq: '每周更新' },
  9:  { primary: 'UGCQuality-Ranker',        primaryVer: 'v1.3.2', primaryLatency: '28ms',  primaryAcc: 82.9,                                           framework: 'Multi-modal CLIP + Regression',          trainFreq: '6小时前' },
  10: { primary: 'ComplianceNLP',            primaryVer: 'v3.0.1', primaryLatency: '35ms',  primaryAcc: 99.2,                                           framework: 'Fine-tuned LLM + Rule Engine',           trainFreq: '昨日' },
  11: { primary: 'TrendForecaster',          primaryVer: 'v1.5.0', primaryLatency: '25ms',  primaryAcc: 78.5, secondary: 'CTR-Predictor-DeepFM',        framework: '时序分析 (Prophet + LSTM)',               trainFreq: '每日更新' },
  12: { primary: 'CompetitorIntel-NLP',      primaryVer: 'v1.4.0', primaryLatency: '60ms',  primaryAcc: 84.5, secondary: 'SentimentNLP-Analyzer',       framework: 'RoBERTa + 跨品牌对比检测',               trainFreq: '每6小时' },
  // 投放优化集群
  13: { primary: 'CTR-Predictor-DeepFM',     primaryVer: 'v4.5.0', primaryLatency: '5ms',   primaryAcc: 92.4, secondary: 'BidOptimizer-DQN',            framework: 'DeepFM (深度因子分解机)',                 trainFreq: '每小时' },
  14: { primary: 'SearchQuery-Optimizer',    primaryVer: 'v2.3.1', primaryLatency: '30ms',  primaryAcc: 88.9, secondary: 'CTR-Predictor-DeepFM',        framework: '强化学习 + 搜索词意图分类',               trainFreq: '每小时' },
  15: { primary: 'CTR-Predictor-DeepFM',     primaryVer: 'v4.5.0', primaryLatency: '5ms',   primaryAcc: 92.4, secondary: 'LiveEngagement-Predictor',    framework: 'DeepFM (深度因子分解机)',                 trainFreq: '每小时' },
  16: { primary: 'CreativeFatigue-MAB',      primaryVer: 'v4.1.2', primaryLatency: '3ms',   primaryAcc: 88.7, secondary: 'CTR-Predictor-DeepFM',        framework: '多臂老虎机 (Thompson Sampling)',          trainFreq: '实时更新' },
  17: { primary: 'BidOptimizer-DQN',         primaryVer: 'v3.8.1', primaryLatency: '12ms',  primaryAcc: 94.2, secondary: 'CVR-Predictor-ESMM',          framework: 'DQN (深度Q网络)',                         trainFreq: '2小时前' },
  18: { primary: 'AudienceCluster-KM',       primaryVer: 'v1.9.3', primaryLatency: '20ms',  primaryAcc: 85.3, secondary: 'Lookalike-Expander',           framework: 'K-Means + Embedding',                    trainFreq: '昨日' },
  19: { primary: 'LiveGMV-LSTM',             primaryVer: 'v2.3.0', primaryLatency: '48ms',  primaryAcc: 85.6, secondary: 'TrafficPacing-RL',             framework: 'LSTM + Attention Mechanism',              trainFreq: '实时更新' },
  20: { primary: 'AnomalyDetector-LSTM',     primaryVer: 'v4.0.2', primaryLatency: '18ms',  primaryAcc: 95.1,                                           framework: 'LSTM-Autoencoder + 动态阈值',             trainFreq: '实时更新' },
  21: { primary: 'BudgetMO-Optimizer',       primaryVer: 'v1.8.0', primaryLatency: '65ms',  primaryAcc: 88.3, secondary: 'TrafficPacing-RL',             framework: '多目标强化学习 (MORL)',                   trainFreq: '每日更新' },
  22: { primary: 'Attribution-Shapley',      primaryVer: 'v2.5.1', primaryLatency: '22ms',  primaryAcc: 87.8, secondary: 'BayesianAB-Engine',            framework: 'Shapley值 + DNN 混合归因',               trainFreq: '昨日' },
  // 达人运营集群
  23: { primary: 'KOLScore-MultiDim',        primaryVer: 'v2.2.0', primaryLatency: '55ms',  primaryAcc: 89.1, secondary: 'FanFraud-GNN',                framework: 'GBM + Graph Features',                   trainFreq: '每日更新' },
  24: { primary: 'KOLScore-MultiDim',        primaryVer: 'v2.2.0', primaryLatency: '55ms',  primaryAcc: 89.1, secondary: 'TrendForecaster',              framework: 'GBM + Graph Features',                   trainFreq: '每日更新' },
  25: { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4, secondary: 'KOLScore-MultiDim',            framework: 'Fine-tuned Qwen2.5 + LoRA',              trainFreq: '每周更新' },
  26: { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4,                                           framework: 'Fine-tuned Qwen2.5 + LoRA',              trainFreq: '每周更新' },
  27: { primary: 'Attribution-Shapley',      primaryVer: 'v2.5.1', primaryLatency: '22ms',  primaryAcc: 87.8,                                           framework: 'Shapley值 + 规则结算引擎',               trainFreq: '昨日' },
  28: { primary: 'LiveGMV-LSTM',             primaryVer: 'v2.3.0', primaryLatency: '48ms',  primaryAcc: 85.6, secondary: 'LiveEngagement-Predictor',    framework: 'LSTM + Attention Mechanism',              trainFreq: '实时更新' },
  29: { primary: 'FanFraud-GNN',             primaryVer: 'v3.1.0', primaryLatency: '38ms',  primaryAcc: 93.5,                                           framework: '图神经网络 (GraphSAGE)',                  trainFreq: '3小时前' },
  30: { primary: 'LTV-Predictor-DNN',        primaryVer: 'v2.1.0', primaryLatency: '35ms',  primaryAcc: 83.7, secondary: 'SentimentNLP-Analyzer',       framework: 'DNN + Survival Analysis',                trainFreq: '每日更新' },
  // 协同引擎
  31: { primary: 'Attribution-Shapley',      primaryVer: 'v2.5.1', primaryLatency: '22ms',  primaryAcc: 87.8, secondary: 'CVR-Predictor-ESMM',          framework: 'Shapley值 + DNN 混合归因',               trainFreq: '昨日' },
  32: { primary: 'BudgetMO-Optimizer',       primaryVer: 'v1.8.0', primaryLatency: '65ms',  primaryAcc: 88.3, secondary: 'AudienceCluster-KM',           framework: '多目标强化学习 (MORL)',                   trainFreq: '每日更新' },
  33: { primary: 'TrendForecaster',          primaryVer: 'v1.5.0', primaryLatency: '25ms',  primaryAcc: 78.5, secondary: 'CompetitorIntel-NLP',          framework: '时序分析 (Prophet + LSTM)',               trainFreq: '每日更新' },
  34: { primary: 'SentimentNLP-Analyzer',    primaryVer: 'v3.0.0', primaryLatency: '42ms',  primaryAcc: 91.2, secondary: 'CompetitorIntel-NLP',          framework: 'RoBERTa + 细粒度情感分类',               trainFreq: '昨日' },
  35: { primary: 'AnomalyDetector-LSTM',     primaryVer: 'v4.0.2', primaryLatency: '18ms',  primaryAcc: 95.1, secondary: 'FraudDetector-XGB',            framework: 'LSTM-Autoencoder + 动态阈值',             trainFreq: '实时更新' },
  36: { primary: 'CTR-Predictor-DeepFM',     primaryVer: 'v4.5.0', primaryLatency: '5ms',   primaryAcc: 92.4, secondary: 'Attribution-Shapley',          framework: 'DeepFM + 闭环反馈系统',                  trainFreq: '每小时' },
  // 国际投放集群
  37: { primary: 'CTR-Predictor-DeepFM',     primaryVer: 'v4.5.0', primaryLatency: '5ms',   primaryAcc: 92.4, secondary: 'BidOptimizer-DQN',              framework: 'DeepFM + Meta Advantage+ API对接',       trainFreq: '每小时' },
  38: { primary: 'CTR-Predictor-DeepFM',     primaryVer: 'v4.5.0', primaryLatency: '5ms',   primaryAcc: 92.4, secondary: 'TrendForecaster',               framework: 'DeepFM + TikTok算法适配层',              trainFreq: '每小时' },
  39: { primary: 'SearchQuery-Optimizer',    primaryVer: 'v2.3.1', primaryLatency: '30ms',  primaryAcc: 88.9, secondary: 'CTR-Predictor-DeepFM',          framework: '强化学习 + Google Ads API v15',           trainFreq: '每小时' },
  40: { primary: 'BidOptimizer-DQN',         primaryVer: 'v3.8.1', primaryLatency: '12ms',  primaryAcc: 94.2, secondary: 'CVR-Predictor-ESMM',            framework: 'DQN + Amazon Purchase Intent模型',       trainFreq: '每2小时' },
  41: { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4, secondary: 'SentimentNLP-Analyzer',         framework: '多语言LLM + 文化适配LoRA层',             trainFreq: '每周更新' },
  42: { primary: 'AnomalyDetector-LSTM',     primaryVer: 'v4.0.2', primaryLatency: '18ms',  primaryAcc: 95.1, secondary: 'BudgetMO-Optimizer',            framework: 'LSTM汇率预测 + 对冲策略规则引擎',        trainFreq: '实时更新' },
  43: { primary: 'ComplianceNLP',            primaryVer: 'v3.0.1', primaryLatency: '35ms',  primaryAcc: 99.2,                                             framework: '多语言合规规则引擎 + LLM语义审核',       trainFreq: '每月更新' },
  44: { primary: 'AudienceCluster-KM',       primaryVer: 'v1.9.3', primaryLatency: '20ms',  primaryAcc: 85.3, secondary: 'Lookalike-Expander',            framework: 'K-Means + 跨文化嵌入向量',               trainFreq: '每日更新' },
  // 协同引擎扩展
  45: { primary: 'BayesianAB-Engine',        primaryVer: 'v2.1.0', primaryLatency: '45ms',  primaryAcc: 91.8, secondary: 'CTR-Predictor-DeepFM',          framework: '贝叶斯实验框架 + 多变量统计分析',        trainFreq: '每日更新' },
  46: { primary: 'FraudDetector-XGB',        primaryVer: 'v2.8.0', primaryLatency: '8ms',   primaryAcc: 96.3, secondary: 'FanFraud-GNN',                  framework: 'XGBoost + 图神经网络联合检测',           trainFreq: '每6小时' },
  47: { primary: 'AnomalyDetector-LSTM',     primaryVer: 'v4.0.2', primaryLatency: '18ms',  primaryAcc: 95.1, secondary: 'Attribution-Shapley',            framework: 'DAG调度引擎 + 数据质量监控模型',         trainFreq: '实时更新' },
  48: { primary: 'SentimentNLP-Analyzer',    primaryVer: 'v3.0.0', primaryLatency: '42ms',  primaryAcc: 91.2, secondary: 'CompetitorIntel-NLP',            framework: 'RoBERTa多语言 + 舆情扩散预测',           trainFreq: '实时更新' },
  // 达人运营集群扩展
  49: { primary: 'LTV-Predictor-DNN',        primaryVer: 'v2.1.0', primaryLatency: '35ms',  primaryAcc: 83.7, secondary: 'AudienceCluster-KM',             framework: 'RFM + DNN存活分析 + 个性化推荐',         trainFreq: '每日更新' },
  50: { primary: 'BudgetMO-Optimizer',       primaryVer: 'v1.8.0', primaryLatency: '65ms',  primaryAcc: 88.3, secondary: 'AnomalyDetector-LSTM',           framework: '库存感知MPC + RL动态出价',               trainFreq: '实时更新' },
  // 内容生产集群扩展
  51: { primary: 'SearchQuery-Optimizer',    primaryVer: 'v2.3.1', primaryLatency: '30ms',  primaryAcc: 88.9, secondary: 'TrendForecaster',               framework: '搜索意图分类 + 关键词竞争度模型',         trainFreq: '每日更新' },
  52: { primary: 'VideoHighlight-Detector',  primaryVer: 'v1.7.3', primaryLatency: '340ms', primaryAcc: 84.2, secondary: 'LiveEngagement-Predictor',        framework: '计算机视觉构图评分 + 留存率关联模型',     trainFreq: '实时更新' },
  // 消费者运营集群
  53: { primary: 'UserLTV-Predictor',        primaryVer: 'v1.4.0', primaryLatency: '32ms',  primaryAcc: 84.9, secondary: 'RFM-Clustering',                   framework: '马尔科夫决策过程 + 多端旅程调度引擎',    trainFreq: '每小时' },
  54: { primary: 'ChurnPredictor-GBM',       primaryVer: 'v1.1.0', primaryLatency: '22ms',  primaryAcc: 88.4, secondary: 'UserLTV-Predictor',                 framework: '激活漏斗建模 + 首购意图XGBoost预测',     trainFreq: '每日更新' },
  55: { primary: 'ContentLLM-Beauty',        primaryVer: 'v1.2.0', primaryLatency: '180ms', primaryAcc: 86.4, secondary: 'SentimentNLP-Analyzer',             framework: 'Fine-tuned LLM对话模型 + FAQ知识库检索', trainFreq: '每周更新' },
  56: { primary: 'SentimentNLP-Analyzer',    primaryVer: 'v3.0.0', primaryLatency: '42ms',  primaryAcc: 91.2, secondary: 'UGCQuality-Ranker',                  framework: 'RoBERTa情感分类 + 差评根因分类器',       trainFreq: '实时更新' },
  57: { primary: 'DeepFM-RecSys',            primaryVer: 'v2.0.0', primaryLatency: '18ms',  primaryAcc: 87.2, secondary: 'Item2Vec-EmbedRec',                  framework: 'DeepFM协同过滤 + Item2Vec + BERT语义召回', trainFreq: '每小时' },
  58: { primary: 'RFM-Clustering',           primaryVer: 'v1.2.0', primaryLatency: '8ms',   primaryAcc: 91.8, secondary: 'UserLTV-Predictor',                  framework: 'RFM分层 + 升级概率预测 + 权益匹配引擎',  trainFreq: '每日更新' },
  59: { primary: 'UserLTV-Predictor',        primaryVer: 'v1.4.0', primaryLatency: '32ms',  primaryAcc: 84.9, secondary: 'CohortAnalyzer',                     framework: 'BG/NBD + Gamma-Gamma + DNN修正层',        trainFreq: '每日更新' },
  60: { primary: 'ViralCoef-Tracker',        primaryVer: 'v1.0.0', primaryLatency: '15ms',  primaryAcc: 82.3, secondary: 'AudienceCluster-KM',                 framework: 'K因子模型 + 传播链路追踪 + 裂变RL策略',  trainFreq: '每日更新' },
  61: { primary: 'ComplianceNLP',            primaryVer: 'v3.0.1', primaryLatency: '35ms',  primaryAcc: 99.2, secondary: 'UGCQuality-Ranker',                  framework: '内容安全多分类 + 意图识别 + UGC评分',     trainFreq: '昨日' },
  62: { primary: 'ChurnPredictor-GBM',       primaryVer: 'v1.1.0', primaryLatency: '22ms',  primaryAcc: 88.4, secondary: 'SentimentNLP-Analyzer',              framework: '退货风险XGBoost + NPS驱动因素分析',       trainFreq: '每日更新' },
  63: { primary: 'SentimentNLP-Analyzer',    primaryVer: 'v3.0.0', primaryLatency: '42ms',  primaryAcc: 91.2, secondary: 'CompetitorIntel-NLP',                 framework: 'RoBERTa细粒度情感 + LDA主题建模',         trainFreq: '实时更新' },
  64: { primary: 'CreativeFatigue-MAB',      primaryVer: 'v4.1.2', primaryLatency: '3ms',   primaryAcc: 88.7, secondary: 'AnomalyDetector-LSTM',               framework: '多渠道频次约束优化 + 疲劳度建模引擎',    trainFreq: '实时更新' },
}

// ──────────────────────────────────────────────
// 配置参数专业面板
// ──────────────────────────────────────────────
function AgentConfigPanel({ agent, onClose, onSave }: { agent: Agent; onClose: () => void; onSave: (msg: string) => void }) {
  const [tab, setTab] = useState<'exec' | 'model' | 'resource' | 'trigger' | 'alert'>('exec')
  const seed = agent.id * 7

  // 执行参数 state
  const [execFreq, setExecFreq] = useState(30)
  const [concurrency, setConcurrency] = useState(4)
  const [timeout, setTimeout_] = useState(10)
  const [retries, setRetries] = useState(3)
  const [priority, setPriority] = useState('高')
  const [batchSize, setBatchSize] = useState(64)

  // 模型参数 state
  const [confidence, setConfidence] = useState(85)
  const [learningRate, setLearningRate] = useState('0.001')
  const [inferBatch, setInferBatch] = useState(32)
  const [tempParam, setTempParam] = useState(0.7)
  const [autoTune, setAutoTune] = useState(true)

  // 资源限制 state
  const [cpuCap, setCpuCap] = useState(80)
  const [memCap, setMemCap] = useState(70)
  const [dailyLimit, setDailyLimit] = useState(5000)
  const [gpuEnabled, setGpuEnabled] = useState(true)

  // 触发条件 state
  const [triggerMode, setTriggerMode] = useState('定时')
  const [cronExpr, setCronExpr] = useState('*/30 * * * *')
  const [eventTopic, setEventTopic] = useState('ads.signal.trigger')
  const [enabled, setEnabled] = useState(true)

  // 告警设置 state
  const [failThreshold, setFailThreshold] = useState(3)
  const [latencyThreshold, setLatencyThreshold] = useState(5)
  const [healthThreshold, setHealthThreshold] = useState(85)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySlack, setNotifySlack] = useState(true)

  const tabs = [
    { key: 'exec', label: '执行参数', icon: <Clock size={13} /> },
    { key: 'model', label: '模型参数', icon: <Sliders size={13} /> },
    { key: 'resource', label: '资源限制', icon: <Cpu size={13} /> },
    { key: 'trigger', label: '触发条件', icon: <Zap size={13} /> },
    { key: 'alert', label: '告警设置', icon: <Bell size={13} /> },
  ] as const

  const aiSuggestion: Record<string, string> = {
    exec: `AI建议：当前并发数 ${4 + seed % 3} 可提升至 ${6 + seed % 3}，预计吞吐提升 ${15 + seed % 10}%`,
    model: `AI建议：置信度阈值 ${85 + seed % 8}% 在近7天数据下准确率最优`,
    resource: `AI建议：CPU上限可放宽至 ${85 + seed % 10}%，当前利用率仅 ${20 + seed % 40}%`,
    trigger: '触发模式运行稳定，AI暂无优化建议',
    alert: `AI建议：健康度告警阈值建议调低至 ${80 + seed % 8}%，近期波动增大`,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', borderRadius: 7,
    border: '1px solid var(--border)', fontSize: '0.78rem',
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    outline: 'none',
  }
  const labelStyle: React.CSSProperties = { fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }
  const fieldStyle: React.CSSProperties = { marginBottom: 12 }

  const SliderField = ({ label, value, onChange, min, max, step = 1, unit = '', aiVal }: {
    label: string; value: number; onChange: (v: number) => void
    min: number; max: number; step?: number; unit?: string; aiVal?: number
  }) => (
    <div style={fieldStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {aiVal !== undefined && aiVal !== value && (
            <span style={{ fontSize: '0.65rem', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '1px 6px', borderRadius: 4 }}>
              AI推荐 {aiVal}{unit}
            </span>
          )}
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 40, textAlign: 'right' }}>{value}{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#ff9eb5', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  )

  const ToggleField = ({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-light)', marginBottom: 8 }}>
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <div onClick={() => onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? '#ff9eb5' : 'var(--border)',
        position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 20 : 3,
          width: 16, height: 16, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  )

  return (
    <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139,92,246,0.25)', background: 'var(--bg-primary)' }}>
      {/* Panel header */}
      <div style={{ padding: '12px 14px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(255,158,181,0.08))', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={15} color="#8b5cf6" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>参数配置 · {agent.name}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px',
              border: 'none', background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontSize: '0.72rem', fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? '#8b5cf6' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid #8b5cf6' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* AI suggestion bar */}
      <div style={{ padding: '6px 14px', background: 'rgba(167,139,250,0.06)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Zap size={11} color="#a78bfa" />
        <span style={{ fontSize: '0.66rem', color: '#a78bfa' }}>{aiSuggestion[tab]}</span>
      </div>

      {/* Tab content */}
      <div style={{ padding: '14px' }}>

        {tab === 'exec' && (
          <>
            <SliderField label="执行频率（秒）" value={execFreq} onChange={setExecFreq} min={5} max={300} step={5} unit="s" aiVal={30} />
            <SliderField label="并发执行数" value={concurrency} onChange={setConcurrency} min={1} max={20} unit="个" aiVal={6} />
            <SliderField label="超时时间" value={timeout} onChange={setTimeout_} min={1} max={60} unit="s" aiVal={10} />
            <SliderField label="失败重试次数" value={retries} onChange={setRetries} min={0} max={10} unit="次" />
            <div style={fieldStyle}>
              <label style={labelStyle}>任务优先级</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {['低', '普通', '高', '紧急'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <SliderField label="批处理大小" value={batchSize} onChange={setBatchSize} min={8} max={512} step={8} unit="条" aiVal={64} />
          </>
        )}

        {tab === 'model' && (
          <>
            <SliderField label="置信度阈值" value={confidence} onChange={setConfidence} min={50} max={99} unit="%" aiVal={88} />
            <SliderField label="推理温度 (temperature)" value={Math.round(tempParam * 10)} onChange={v => setTempParam(v / 10)} min={1} max={20} unit="" aiVal={7} />
            <div style={fieldStyle}>
              <label style={labelStyle}>学习率 (learning rate)</label>
              <input value={learningRate} onChange={e => setLearningRate(e.target.value)} style={inputStyle} placeholder="e.g. 0.001" />
              <div style={{ fontSize: '0.62rem', color: '#a78bfa', marginTop: 3 }}>AI当前使用 AdamW 优化器</div>
            </div>
            <SliderField label="推理批次大小" value={inferBatch} onChange={setInferBatch} min={4} max={256} step={4} unit="条" aiVal={32} />
            <ToggleField label="AI自动调参" desc="允许AI根据历史数据自动微调模型参数" value={autoTune} onChange={setAutoTune} />
            {(() => {
              const m = AGENT_MODEL_MAP[agent.id]
              if (!m) return null
              return (
                <div style={{ borderRadius: 10, border: '1px solid rgba(139,92,246,0.2)', overflow: 'hidden', fontSize: '0.7rem' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(139,92,246,0.06)', borderBottom: '1px solid rgba(139,92,246,0.15)', fontWeight: 600, color: '#8b5cf6' }}>
                    底层模型（来自AI模型目录）
                  </div>
                  <div style={{ padding: '10px 12px', background: 'var(--bg-card)' }}>
                    {/* 主模型 */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 3 }}>主模型</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 7, background: 'rgba(232,54,93,0.06)', border: '1px solid rgba(232,54,93,0.18)' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#e8365d' }}>{m.primary}</span>
                        <div style={{ display: 'flex', gap: 10, fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: '#22c55e', fontWeight: 600 }}>{m.primaryAcc}%</span>
                          <span>{m.primaryLatency}</span>
                          <span style={{ fontFamily: 'monospace' }}>{m.primaryVer}</span>
                        </div>
                      </div>
                    </div>
                    {/* 辅助模型 */}
                    {m.secondary && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 3 }}>辅助模型</div>
                        <div style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', fontFamily: 'monospace', fontWeight: 600, color: '#8b5cf6', fontSize: '0.68rem' }}>
                          {m.secondary}
                        </div>
                      </div>
                    )}
                    {/* 框架 & 训练频率 */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: 'var(--bg-primary)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.62rem' }}>
                        {m.framework}
                      </span>
                      <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '0.62rem', fontWeight: 600 }}>
                        训练: {m.trainFreq}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })()}
          </>
        )}

        {tab === 'resource' && (
          <>
            <SliderField label="CPU使用上限" value={cpuCap} onChange={setCpuCap} min={20} max={100} step={5} unit="%" aiVal={85} />
            <SliderField label="内存使用上限" value={memCap} onChange={setMemCap} min={20} max={95} step={5} unit="%" aiVal={75} />
            <SliderField label="每日任务上限" value={dailyLimit} onChange={setDailyLimit} min={100} max={50000} step={100} unit="条" aiVal={8000} />
            <ToggleField label="GPU加速" desc="启用GPU进行模型推理加速" value={gpuEnabled} onChange={setGpuEnabled} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              {[
                { label: '当前CPU', value: `${20 + seed % 60}%`, color: '#60a5fa' },
                { label: '当前内存', value: `${30 + seed % 50}%`, color: '#ff9eb5' },
                { label: '今日已用', value: `${2000 + seed * 30}条`, color: '#34d399' },
                { label: 'GPU状态', value: gpuEnabled ? '已启用' : '关闭', color: gpuEnabled ? '#34d399' : 'var(--text-muted)' },
              ].map(m => (
                <div key={m.label} style={{ padding: '8px 10px', borderRadius: 7, background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'trigger' && (
          <>
            <ToggleField label="智能体启用" desc="关闭后智能体将停止接收新任务" value={enabled} onChange={setEnabled} />
            <div style={fieldStyle}>
              <label style={labelStyle}>触发模式</label>
              <select value={triggerMode} onChange={e => setTriggerMode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {['定时', '事件驱动', '手动', 'API回调'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            {triggerMode === '定时' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>Cron 表达式</label>
                <input value={cronExpr} onChange={e => setCronExpr(e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace' }} />
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>当前: 每30分钟执行一次</div>
              </div>
            )}
            {triggerMode === '事件驱动' && (
              <div style={fieldStyle}>
                <label style={labelStyle}>监听 Event Topic</label>
                <input value={eventTopic} onChange={e => setEventTopic(e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace' }} />
              </div>
            )}
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 600, color: '#34d399' }}>
                <CheckCircle size={12} /> 触发历史（最近24h）
              </div>
              {[
                { time: '14:30', status: '成功', duration: '1.2s' },
                { time: '14:00', status: '成功', duration: '0.9s' },
                { time: '13:30', status: '成功', duration: '1.5s' },
                { time: '13:00', status: '超时', duration: '11.2s' },
              ].map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: '0.68rem', marginBottom: 3, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', minWidth: 36 }}>{h.time}</span>
                  <span style={{ color: h.status === '成功' ? '#34d399' : '#fbbf24', minWidth: 28 }}>{h.status}</span>
                  <span>{h.duration}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'alert' && (
          <>
            <SliderField label="连续失败告警阈值" value={failThreshold} onChange={setFailThreshold} min={1} max={10} unit="次" aiVal={3} />
            <SliderField label="延迟告警阈值" value={latencyThreshold} onChange={setLatencyThreshold} min={1} max={30} unit="s" aiVal={5} />
            <SliderField label="健康度预警线" value={healthThreshold} onChange={setHealthThreshold} min={50} max={99} unit="%" aiVal={85} />
            <div style={{ marginBottom: 8, fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>通知渠道</div>
            <ToggleField label="邮件通知" desc="触发告警时发送邮件到运营团队" value={notifyEmail} onChange={setNotifyEmail} />
            <ToggleField label="Slack 通知" desc="推送至 #ai-alerts 频道" value={notifySlack} onChange={setNotifySlack} />
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <AlertTriangle size={11} color="#fbbf24" style={{ marginTop: 1, flexShrink: 0 }} />
              <span>近7天触发 <strong style={{ color: '#fbbf24' }}>{2 + seed % 4}次</strong> 告警，其中 <strong style={{ color: '#ef4444' }}>{seed % 2}次</strong> 为严重级别</span>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button onClick={() => onSave(`✅ ${agent.name} 配置已保存，下次执行时生效`)}
            style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#8b5cf6', color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            保存配置
          </button>
          <button onClick={onClose}
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>
            取消
          </button>
          <button title="重置为默认值"
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// 查看日志专业面板
// ──────────────────────────────────────────────
function AgentLogPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [logLevel, setLogLevel] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'>('ALL')
  const seed = agent.id * 7

  const allLogs = [
    { time: '14:32:08.421', level: 'SUCCESS', module: 'executor', msg: `任务 #${agent.tasksCompleted} 完成，耗时 1.2s，输出 ${340 + seed % 200}条记录` },
    { time: '14:31:55.102', level: 'INFO', module: 'fetcher', msg: `获取平台数据 OK，样本量 ${2800 + seed % 400}，接口耗时 0.34s` },
    { time: '14:31:22.883', level: 'INFO', module: 'model', msg: `模型推理完成，批次 ${64 + seed % 64}条，置信度均值 ${agent.health}%` },
    { time: '14:30:42.210', level: 'SUCCESS', module: 'eventbus', msg: '决策结果写入 EventBus topic: ads.decision.output' },
    { time: '14:29:11.008', level: 'INFO', module: 'heartbeat', msg: '心跳检测 OK，健康度正常，内存 GC 完成' },
    { time: '14:28:34.774', level: 'WARN', module: 'api', msg: `API 限速 429，自动降频 0.5s 后重试，剩余配额 ${80 + seed % 20}%` },
    { time: '14:27:01.556', level: 'INFO', module: 'scheduler', msg: '任务调度完成，队列长度 12，预计完成 2.4min' },
    { time: '14:26:44.332', level: 'SUCCESS', module: 'executor', msg: `任务 #${agent.tasksCompleted - 1} 完成，ROI提升 ${(2.1 + seed % 10 * 0.1).toFixed(1)}%` },
    { time: '14:25:12.001', level: 'ERROR', module: 'db', msg: `写入超时，重试 1/3，连接池剩余 ${3 + seed % 5}个` },
    { time: '14:24:55.887', level: 'SUCCESS', module: 'db', msg: '重试成功，数据已持久化' },
    { time: '14:23:30.441', level: 'INFO', module: 'model', msg: `AI参数自动微调：学习率 0.001 → 0.0009，原因：loss下降趋缓` },
    { time: '14:22:11.009', level: 'INFO', module: 'executor', msg: '并发任务初始化，分配 4 个 worker 线程' },
  ]

  const filtered = logLevel === 'ALL' ? allLogs : allLogs.filter(l => l.level === logLevel)

  const levelColor = (l: string) => l === 'SUCCESS' ? '#4ade80' : l === 'WARN' ? '#fbbf24' : l === 'ERROR' ? '#f87171' : '#94a3b8'
  const levelCount = (l: string) => allLogs.filter(x => x.level === l).length

  return (
    <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(99,102,241,0.25)' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', background: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={14} color="#6366f1" />
          <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700 }}>{agent.name} · 执行日志</span>
          <span style={{ fontSize: '0.65rem', color: '#475569' }}>最近 {allLogs.length} 条</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
          <X size={13} />
        </button>
      </div>

      {/* Level filter bar */}
      <div style={{ padding: '6px 10px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {(['ALL', 'SUCCESS', 'INFO', 'WARN', 'ERROR'] as const).map(l => (
          <button key={l} onClick={() => setLogLevel(l)}
            style={{
              padding: '2px 8px', borderRadius: 5, border: 'none', cursor: 'pointer',
              fontSize: '0.65rem', fontWeight: 600, fontFamily: 'monospace',
              background: logLevel === l ? (l === 'ALL' ? '#334155' : levelColor(l) + '28') : 'transparent',
              color: l === 'ALL' ? '#94a3b8' : levelColor(l),
              outline: logLevel === l ? `1px solid ${l === 'ALL' ? '#475569' : levelColor(l)}40` : 'none',
            }}>
            {l} {l !== 'ALL' && `(${levelCount(l)})`}
          </button>
        ))}
      </div>

      {/* Log body */}
      <div style={{ background: '#0f172a', padding: '8px 12px', fontFamily: 'monospace', fontSize: '0.68rem', maxHeight: 220, overflowY: 'auto' }}>
        {filtered.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, lineHeight: 1.5, borderBottom: '1px solid #1e293b22', paddingBottom: 4 }}>
            <span style={{ color: '#334155', minWidth: 68, flexShrink: 0 }}>{log.time}</span>
            <span style={{ color: levelColor(log.level), minWidth: 54, flexShrink: 0 }}>[{log.level}]</span>
            <span style={{ color: '#6366f1', minWidth: 60, flexShrink: 0 }}>{log.module}</span>
            <span style={{ color: log.level === 'ERROR' ? '#fca5a5' : log.level === 'WARN' ? '#fde68a' : '#cbd5e1', flex: 1 }}>{log.msg}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '6px 12px', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.62rem', color: '#334155' }}>自动刷新中 · 每10s</span>
        <div style={{ display: 'flex', gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'none' }} />
          <span style={{ fontSize: '0.62rem', color: '#475569' }}>实时</span>
        </div>
      </div>
    </div>
  )
}

// Mock detail data keyed by agent id
function getMockDetail(agent: Agent) {
  const seed = agent.id * 7
  return {
    currentTask: `未构建 · 当前为离线占位智能体`,
    recentActions: [
      { time: `${11 - (seed % 3)}:${String(40 + (seed % 19)).padStart(2, '0')}`, action: `完成任务 #${9990 + seed}`, result: '成功' },
      { time: `${10 + (seed % 2)}:${String(20 + (seed % 30)).padStart(2, '0')}`, action: `优化参数 round ${200 + seed}`, result: '成功' },
      { time: `${10 + (seed % 2)}:${String(5 + (seed % 15)).padStart(2, '0')}`, action: `同步数据批次 ${400 + seed}`, result: '成功' },
      { time: `09:${String(45 + (seed % 14)).padStart(2, '0')}`, action: `生成报告 #${7800 + seed}`, result: agent.health > 93 ? '成功' : '警告' },
      { time: `09:${String(10 + (seed % 20)).padStart(2, '0')}`, action: `初始化任务队列`, result: '成功' },
    ],
    cpu: 20 + (seed % 60),
    memory: 30 + (seed % 50),
    throughput: 80 + (seed % 200),
    successRate: (95 + (seed % 5)).toFixed(1),
    avgResponseTime: (0.3 + (seed % 10) * 0.05).toFixed(2),
  }
}

type RealMatrixAgent = {
  id: number
  name: string
  description: string
  definition: AgentDefinition
  registry: AgentRegistry | null
  mappedAgentType: PlaygroundAgentType | null
  runtimeStatus: 'running' | 'idle' | 'training' | 'error'
  clusterLabel: string
  subGroup: string
}

function inferPlaygroundAgentType(definition: AgentDefinition, registry: AgentRegistry | null): PlaygroundAgentType | null {
  return inferRunnableAgentTypeFromMetadata({
    name: definition.name,
    agentDefId: definition.agentDefId,
    description: definition.description,
    agentUniqueId: registry?.agentUniqueId,
  })
}

function mapDefinitionStatusToRuntime(definition: AgentDefinition, registry: AgentRegistry | null): 'running' | 'idle' | 'training' | 'error' {
  const publishStatus = definition.publishStatus?.toUpperCase()
  const registryStatus = registry?.status?.toUpperCase()
  if (publishStatus === 'FAILED') return 'error'
  if (publishStatus === 'DRAFT') return 'training'
  if (registryStatus === 'SUSPENDED' || registryStatus === 'INACTIVE') return 'idle'
  return 'running'
}

function mapDefinitionToClusterLabel(definition: AgentDefinition, mappedAgentType: PlaygroundAgentType | null) {
  if (mappedAgentType === 'video-deconstruction') return { clusterLabel: '视频理解 / 知识沉淀', subGroup: 'Agent A' }
  if (mappedAgentType === 'script-blueprint') return { clusterLabel: '内容生产 / 语义蓝图', subGroup: 'Agent B' }
  if (mappedAgentType === 'video-assembly') return { clusterLabel: '内容生产 / 视频装配', subGroup: 'Agent C' }
  if (mappedAgentType === 'content-structure-card') return { clusterLabel: '内容生产 / 结构卡', subGroup: '过渡能力' }
  if (mappedAgentType === 'beukay-claw') return { clusterLabel: '营销对话', subGroup: '实时对话' }
  return { clusterLabel: 'Agent OS / 已创建 Agent', subGroup: '自定义 Agent' }
}

function buildRealAgentRuntimeDetail(agent: RealMatrixAgent) {
  const seed = (agent.id % 9) + 1
  return {
    currentTask: agent.registry?.agentUniqueId
      ? `正在处理 ${agent.registry.agentUniqueId} · 预计 ${3 + seed} 分钟后完成`
      : `正在处理任务 #${10000 + seed * 17} · 预计 ${3 + seed} 分钟后完成`,
    successRate: 95 + (seed % 4),
    avgResponseTime: (0.35 + seed * 0.07).toFixed(2),
    cpu: 20 + seed * 5,
    memory: 28 + seed * 4,
    throughput: 60 + seed * 9,
    recentActions: [
      { time: '11:27', action: `同步 AgentDefinition ${agent.definition.agentDefId}`, result: '成功' },
      { time: '11:12', action: `刷新发布状态 ${agent.definition.publishStatus ?? 'UNKNOWN'}`, result: '成功' },
      { time: '10:47', action: `检查 Registry ${agent.registry?.agentUniqueId ?? '未注册'}`, result: agent.registry ? '成功' : '等待' },
      { time: '09:52', action: `校验版本 ${agent.definition.version ?? 'v1'}`, result: '成功' },
      { time: '09:17', action: '初始化调试上下文', result: '成功' },
    ],
  }
}

function prettyJson(value: unknown) {
  if (value === undefined) return ''
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

function formatDisplayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.join(' · ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function getPlaceholderBadgeClass() {
  return 'idle'
}

function getPlaceholderBadgeText() {
  return '离线'
}

function shortenMiddle(value: string, max = 18) {
  if (value.length <= max) return value
  return `${value.slice(0, max - 3)}...`
}

function getNewAgentStatusStyle(status: RealMatrixAgent['runtimeStatus']) {
  if (status === 'running') {
    return {
      badgeBackground: 'rgba(187,247,208,0.62)',
      badgeColor: '#166534',
      dotColor: '#22c55e',
      accentColor: '#86efac',
      metricColor: '#22c55e',
    }
  }
  if (status === 'training') {
    return {
      badgeBackground: 'rgba(253,224,71,0.25)',
      badgeColor: '#854d0e',
      dotColor: '#eab308',
      accentColor: '#fde68a',
      metricColor: '#ca8a04',
    }
  }
  if (status === 'idle') {
    return {
      badgeBackground: 'rgba(226,232,240,0.85)',
      badgeColor: '#475569',
      dotColor: '#94a3b8',
      accentColor: '#cbd5e1',
      metricColor: '#64748b',
    }
  }
  return {
    badgeBackground: 'rgba(254,226,226,0.9)',
    badgeColor: '#991b1b',
    dotColor: '#dc2626',
    accentColor: '#fca5a5',
    metricColor: '#dc2626',
  }
}

function MatrixWorkbenchResult({ result }: { result: PlaygroundExecutionResult | null }) {
  if (!result) {
    return <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>运行后结果会显示在这里。</div>
  }

  if (result.status === 'error') {
    return <div style={{ fontSize: '0.78rem', color: '#dc2626' }}>{result.errorMessage ?? '执行失败'}</div>
  }

  const payload = result.output ?? result.responsePayload ?? result.rawJson ?? null
  return <pre className="playground-code-block" style={{ marginTop: 0 }}>{prettyJson(payload)}</pre>
}

function RealAgentWorkbench({
  realAgent,
}: {
  realAgent: RealMatrixAgent
}) {
  const [activeTab, setActiveTab] = useState<'result' | 'raw' | 'trace'>('result')
  const [executionState, setExecutionState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [latestResult, setLatestResult] = useState<PlaygroundExecutionResult | null>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [liveTask, setLiveTask] = useState<VideoDeconstructionTask | null>(null)
  const [videoParams, setVideoParams] = useState({ sourceMode: 'local-file' as 'local-file' | 'remote-url', file: null as File | null, videoUrl: '', skuId: 'SEED_CUSHION_2', sourceLabel: '' })
  const [cardParams, setCardParams] = useState({ skuId: 'SEED_CUSHION_2', marketingNode: '日常投放', targetAudience: '干皮/混干皮', accountId: 'account-1' })
  const [scriptParams, setScriptParams] = useState({ skuId: 'SEED_CUSHION_2', marketingNode: '日常投放', targetAudience: '25-35岁职场女性', platform: 'DOUYIN' })
  const [assemblyParams, setAssemblyParams] = useState({ blueprintCode: '' })
  const [message, setMessage] = useState('')

  const effectiveAgentType = realAgent.mappedAgentType
  const genericInvokeId = realAgent.registry?.agentUniqueId || realAgent.definition.agentDefId

  async function run() {
    setValidationMessage('')
    setExecutionState('submitting')
    setActiveTab('result')

    if (effectiveAgentType === 'video-deconstruction') {
      if (!videoParams.skuId.trim()) {
        setValidationMessage('请填写 skuId。')
        setExecutionState('idle')
        return
      }
      if (videoParams.sourceMode === 'local-file' && !videoParams.file) {
        setValidationMessage('请选择本地视频文件。')
        setExecutionState('idle')
        return
      }
      if (videoParams.sourceMode === 'remote-url' && !videoParams.videoUrl.trim()) {
        setValidationMessage('请填写视频 URL。')
        setExecutionState('idle')
        return
      }
      const onTaskUpdate = (task: VideoDeconstructionTask) => setLiveTask(task)
      const result = videoParams.sourceMode === 'local-file'
        ? await agentPlaygroundApi.runVideoDeconstructionUpload({
          file: videoParams.file as File,
          skuId: videoParams.skuId.trim(),
          sourceLabel: videoParams.sourceLabel.trim() || undefined,
          onTaskUpdate,
        })
        : await agentPlaygroundApi.runVideoDeconstructionUrl({
          skuId: videoParams.skuId.trim(),
          videoUrl: videoParams.videoUrl.trim(),
          sourceLabel: videoParams.sourceLabel.trim() || undefined,
          onTaskUpdate,
        })
      setLatestResult(result)
      setExecutionState(result.status)
      return
    }

    if (effectiveAgentType === 'content-structure-card') {
      const result = await agentPlaygroundApi.runContentStructureCard(cardParams)
      setLatestResult(result)
      setExecutionState(result.status)
      return
    }

    if (effectiveAgentType === 'script-blueprint') {
      const result = await agentPlaygroundApi.runScriptBlueprint(scriptParams)
      setLatestResult(result)
      setExecutionState(result.status)
      return
    }

    if (effectiveAgentType === 'video-assembly') {
      if (!assemblyParams.blueprintCode.trim()) {
        setValidationMessage('请填写 blueprintCode。')
        setExecutionState('idle')
        return
      }
      const result = await agentPlaygroundApi.runVideoAssembly(assemblyParams)
      setLatestResult(result)
      setExecutionState(result.status)
      return
    }

    if (!message.trim()) {
      setValidationMessage('请输入测试消息。')
      setExecutionState('idle')
      return
    }

    try {
      const data = await agentApi.invokeAgent(genericInvokeId, message, [])
      setLatestResult({
        agent: effectiveAgentType ?? 'beukay-claw',
        mode: 'REAL',
        status: 'success',
        startedAt: new Date().toISOString(),
        durationMs: 0,
        requestPayload: { agentUniqueId: genericInvokeId, message },
        output: data,
        rawJson: data,
        logicTrace: data.traceId ? { traceId: data.traceId } : null,
      })
      setExecutionState('success')
    } catch (error) {
      setLatestResult({
        agent: effectiveAgentType ?? 'beukay-claw',
        mode: 'REAL',
        status: 'error',
        startedAt: new Date().toISOString(),
        durationMs: 0,
        requestPayload: { agentUniqueId: genericInvokeId, message },
        errorMessage: error instanceof Error ? error.message : '调用失败',
      })
      setExecutionState('error')
    }
  }

  return (
    <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>调试台</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>集成 Playground</div>
        </div>
        <span className={`playground-status-chip ${executionState}`}>{executionState === 'idle' ? 'IDLE' : executionState === 'submitting' ? 'RUNNING' : executionState.toUpperCase()}</span>
      </div>

      {effectiveAgentType === 'video-deconstruction' && (
        <div className="playground-form-stack">
          <div className="playground-source-switch">
            <button type="button" className={`playground-source-chip ${videoParams.sourceMode === 'local-file' ? 'active' : ''}`} onClick={() => setVideoParams((v) => ({ ...v, sourceMode: 'local-file', videoUrl: '' }))}>本地文件</button>
            <button type="button" className={`playground-source-chip ${videoParams.sourceMode === 'remote-url' ? 'active' : ''}`} onClick={() => setVideoParams((v) => ({ ...v, sourceMode: 'remote-url', file: null }))}>视频 URL</button>
          </div>
          <div className="playground-form-grid">
            <label className="playground-field">
              <span>skuId</span>
              <input value={videoParams.skuId} onChange={(e) => setVideoParams((v) => ({ ...v, skuId: e.target.value }))} />
            </label>
            <label className="playground-field">
              <span>sourceLabel</span>
              <input value={videoParams.sourceLabel} onChange={(e) => setVideoParams((v) => ({ ...v, sourceLabel: e.target.value }))} />
            </label>
            {videoParams.sourceMode === 'local-file' ? (
              <label className="playground-field playground-field-full">
                <span>视频文件</span>
                <input type="file" accept="video/*" onChange={(e) => setVideoParams((v) => ({ ...v, file: e.target.files?.[0] ?? null }))} />
              </label>
            ) : (
              <label className="playground-field playground-field-full">
                <span>videoUrl</span>
                <input value={videoParams.videoUrl} onChange={(e) => setVideoParams((v) => ({ ...v, videoUrl: e.target.value }))} />
              </label>
            )}
          </div>
        </div>
      )}

      {effectiveAgentType === 'content-structure-card' && (
        <div className="playground-form-grid">
          <label className="playground-field"><span>skuId</span><input value={cardParams.skuId} onChange={(e) => setCardParams((v) => ({ ...v, skuId: e.target.value }))} /></label>
          <label className="playground-field"><span>marketingNode</span><input value={cardParams.marketingNode} onChange={(e) => setCardParams((v) => ({ ...v, marketingNode: e.target.value }))} /></label>
          <label className="playground-field"><span>targetAudience</span><input value={cardParams.targetAudience} onChange={(e) => setCardParams((v) => ({ ...v, targetAudience: e.target.value }))} /></label>
          <label className="playground-field"><span>accountId</span><input value={cardParams.accountId} onChange={(e) => setCardParams((v) => ({ ...v, accountId: e.target.value }))} /></label>
        </div>
      )}

      {effectiveAgentType === 'script-blueprint' && (
        <div className="playground-form-grid">
          <label className="playground-field"><span>skuId</span><input value={scriptParams.skuId} onChange={(e) => setScriptParams((v) => ({ ...v, skuId: e.target.value }))} /></label>
          <label className="playground-field"><span>marketingNode</span><input value={scriptParams.marketingNode} onChange={(e) => setScriptParams((v) => ({ ...v, marketingNode: e.target.value }))} /></label>
          <label className="playground-field"><span>targetAudience</span><input value={scriptParams.targetAudience} onChange={(e) => setScriptParams((v) => ({ ...v, targetAudience: e.target.value }))} /></label>
          <label className="playground-field"><span>platform</span><input value={scriptParams.platform} onChange={(e) => setScriptParams((v) => ({ ...v, platform: e.target.value }))} /></label>
        </div>
      )}

      {effectiveAgentType === 'video-assembly' && (
        <div className="playground-form-grid">
          <label className="playground-field playground-field-full"><span>blueprintCode</span><input value={assemblyParams.blueprintCode} onChange={(e) => setAssemblyParams({ blueprintCode: e.target.value })} /></label>
        </div>
      )}

      {!effectiveAgentType || effectiveAgentType === 'beukay-claw' ? (
        <div className="playground-form-grid">
          <label className="playground-field playground-field-full">
            <span>测试消息</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
          </label>
        </div>
      ) : null}

      {validationMessage && (
        <div className="playground-inline-alert" style={{ marginTop: 12 }}>{validationMessage}</div>
      )}

      {liveTask && executionState === 'submitting' && (
        <div className="playground-task-progress">
          <strong>{liveTask.stage ?? liveTask.status}</strong>
          <span>{liveTask.progressPercent ?? 0}%</span>
          <span>{liveTask.statusMessage ?? '处理中...'}</span>
        </div>
      )}

      <div className="playground-actions">
        <button type="button" className="playground-primary-button" onClick={run} disabled={executionState === 'submitting'}>
          <Play size={14} /> 运行 Agent
        </button>
      </div>

      <div className="playground-tabs">
        {[
          { key: 'result', label: 'Result' },
          { key: 'raw', label: 'Raw JSON' },
          { key: 'trace', label: 'Logic Trace' },
        ].map((tab) => (
          <button key={tab.key} type="button" className={`playground-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key as 'result' | 'raw' | 'trace')}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'result' && <MatrixWorkbenchResult result={latestResult} />}
      {activeTab === 'raw' && <pre className="playground-code-block">{prettyJson(latestResult?.rawJson ?? latestResult?.responsePayload ?? latestResult?.output ?? null)}</pre>}
      {activeTab === 'trace' && <pre className="playground-code-block">{prettyJson(latestResult?.logicTrace ?? latestResult?.tracePayload ?? null)}</pre>}
    </div>
  )
}

// ── 飞轮视角：智能体按飞轮阶段归类 ────────────────────────────────────────
const FLYWHEEL_STAGES = [
  {
    id: 'content',
    label: '🎨 内容生产',
    color: '#ec4899',
    icon: Film,
    desc: '趋势捕捉 → 脚本生成 → 素材制作 → 合规审核',
    agentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 51, 52],
    kpi: '640条/日',
    models: ['ContentLLM-Beauty', 'ImageGen-BeautySDXL', 'TrendForecaster', 'ComplianceNLP'],
  },
  {
    id: 'distribution',
    label: '🚀 投放分发',
    color: '#f59e0b',
    icon: Megaphone,
    desc: '受众定向 → 智能出价 → 预算节奏 → 素材轮换',
    agentIds: [13, 14, 15, 16, 17, 18, 19, 20, 21, 37, 38, 39, 40, 50],
    kpi: '6大平台',
    models: ['BidOptimizer-DQN', 'CTR-Predictor-DeepFM', 'TrafficPacing-RL', 'CreativeFatigue-MAB'],
  },
  {
    id: 'attribution',
    label: '📊 效果采集',
    color: '#10b981',
    icon: Eye,
    desc: '归因分析 → ROI监控 → 异常检测 → A/B实验',
    agentIds: [22, 31, 45, 46, 47, 48],
    kpi: '4.2h回流',
    models: ['Attribution-Shapley', 'AnomalyDetector-LSTM', 'BayesianAB-Engine', 'FraudDetector-XGB'],
  },
  {
    id: 'conversion',
    label: '👤 用户转化',
    color: '#6366f1',
    icon: ShoppingCart,
    desc: '转化预测 → LTV评分 → 复购激活 → 流失预警',
    agentIds: [30, 49, 32, 33, 54, 57, 58, 59, 62],
    kpi: 'CVR 12.6%',
    models: ['CVR-Predictor-ESMM', 'UserLTV-Predictor', 'DeepFM-RecSys', 'ChurnPredictor-GBM'],
  },
  {
    id: 'private',
    label: '🔄 私域沉淀',
    color: '#e8365d',
    icon: Heart,
    desc: '社群运营 → 达人激励 → UGC产生 → 裂变增长',
    agentIds: [23, 24, 25, 26, 27, 28, 29, 34, 41, 44, 53, 55, 56, 60, 61, 63, 64],
    kpi: '38.5%留存',
    models: ['KOLScore-MultiDim', 'SentimentNLP-Analyzer', 'ViralCoef-Tracker', 'RFM-Clustering'],
  },
  {
    id: 'feedback',
    label: '📈 数据反哺',
    color: '#0ea5e9',
    icon: Database,
    desc: '数据回流 → 模型更新 → 策略优化 → 下一周期',
    agentIds: [35, 36, 42, 43],
    kpi: '6条反馈环',
    models: ['AnomalyDetector-LSTM', 'BudgetMO-Optimizer', 'Attribution-Shapley', 'ComplianceNLP'],
  },
]

export default function AgentMatrix() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cluster' | 'flywheel'>('cluster')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Agent | null>(null)
  const [selectedReal, setSelectedReal] = useState<RealMatrixAgent | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)
  const [agentActionPanel, setAgentActionPanel] = useState<string | null>(null)
  const [agentMsg, setAgentMsg] = useState<{text: string; color: string} | null>(null)
  const [pausedAgents, setPausedAgents] = useState<Set<string>>(new Set())
  const [restartingAgents, setRestartingAgents] = useState<Set<string>>(new Set())
  const [definitions, setDefinitions] = useState<AgentDefinition[]>([])
  const [registries, setRegistries] = useState<AgentRegistry[]>([])
  const [realLoading, setRealLoading] = useState(true)
  const [realError, setRealError] = useState('')

  const triggerAgentMsg = (text: string, color = '#22c55e') => {
    setAgentMsg({ text, color })
    setTimeout(() => setAgentMsg(null), 3500)
  }

  useEffect(() => {
    let cancelled = false
    async function loadRealAgents() {
      setRealLoading(true)
      setRealError('')
      try {
        const [definitionPage, registryPage] = await Promise.all([
          agentApi.listDefinitions(),
          agentApi.listRegistries(),
        ])
        if (cancelled) return
        setDefinitions(definitionPage.records)
        setRegistries(registryPage.records)
      } catch (error) {
        if (cancelled) return
        setRealError(error instanceof Error ? error.message : '加载真实 Agent 失败')
      } finally {
        if (!cancelled) {
          setRealLoading(false)
        }
      }
    }
    void loadRealAgents()
    return () => {
      cancelled = true
    }
  }, [])

  const realAgents = useMemo<RealMatrixAgent[]>(() => {
    const backendAgents = definitions.map((definition) => {
      const registry = registries.find((item) => item.definitionId === definition.id) ?? null
      const mappedAgentType = inferPlaygroundAgentType(definition, registry)
      const mappedCluster = mapDefinitionToClusterLabel(definition, mappedAgentType)
      const displayMetadata = resolveRunnableAgentDisplayMetadata({
        name: definition.name,
        agentDefId: definition.agentDefId,
        description: definition.description,
        agentUniqueId: registry?.agentUniqueId,
        backendName: definition.name,
        backendDescription: definition.description,
      })
      const preset = displayMetadata.preset
      const displayDefinition = preset
        ? {
          ...definition,
          name: displayMetadata.name,
          description: displayMetadata.description,
        }
        : definition
      const displayRegistry = registry && preset
        ? {
          ...registry,
          name: displayMetadata.name,
          description: displayMetadata.description,
        }
        : registry
      return {
        id: definition.id,
        name: displayMetadata.name,
        description: displayMetadata.description,
        definition: displayDefinition,
        registry: displayRegistry,
        mappedAgentType,
        runtimeStatus: mapDefinitionStatusToRuntime(definition, registry),
        clusterLabel: mappedCluster.clusterLabel,
        subGroup: mappedCluster.subGroup,
      }
    })

    const coveredTypes = new Set(
      backendAgents
        .map((item) => item.mappedAgentType)
        .filter((item): item is PlaygroundAgentType => Boolean(item)),
    )

    const runtimeAgents = RUNNABLE_AGENT_PRESETS
      .filter((preset) => !coveredTypes.has(preset.key))
      .map<RealMatrixAgent>((preset) => ({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        definition: {
          id: preset.id,
          name: preset.name,
          description: preset.description,
          agentDefId: preset.agentDefId,
          behaviorDsl: '',
          modelConfig: '',
          businessRules: '',
          version: 'runtime',
          publishStatus: 'PUBLISHED',
          status: 'ACTIVE',
        },
        registry: preset.key === 'beukay-claw'
          ? {
            id: preset.id,
            name: preset.name,
            description: preset.description,
            status: 'ACTIVE',
            agentUniqueId: 'beukay-claw',
            definitionId: preset.id,
            version: 'runtime',
            endpointType: 'RUNTIME',
          }
          : null,
        mappedAgentType: preset.key,
        runtimeStatus: 'running',
        clusterLabel: preset.clusterLabel,
        subGroup: preset.subGroup,
      }))

    return [...backendAgents, ...runtimeAgents]
  }, [definitions, registries])

  const filteredRealAgents = useMemo(() => {
    const keyword = search.trim()
    return realAgents.filter((agent) => {
      if (!keyword) return true
      return [agent.name, agent.description, agent.definition.agentDefId, agent.registry?.agentUniqueId ?? '', agent.clusterLabel]
        .some((value) => value.includes(keyword))
    })
  }, [realAgents, search])

  const realRunningCount = realAgents.filter((agent) => agent.runtimeStatus === 'running').length
  const placeholderOfflineCount = agents.length

  const agentMatrixAIConfigGroups: AIConfigGroup[] = [
    {
      title: '智能体编排',
      icon: <Bot size={16} />,
      params: [
        createParam('max_concurrent_agents', '最大并发智能体数', 64, '个', '系统同时运行的最大智能体数量，影响整体吞吐量和资源消耗', 72, 85, { min: 10, max: 200, step: 1, learningDataPoints: 45000, adjustHistory: [
          { time: '昨日', from: '52', to: '64', reason: '消费者运营集群上线，AI提升并发数以支撑新集群' },
        ] }),
        createParam('health_check_interval', '智能体健康检查频率', 30, '秒', '对各智能体执行健康检查的时间间隔', 15, 88, { min: 5, max: 120, step: 5, learningDataPoints: 38000, adjustHistory: [
          { time: '2天前', from: '60', to: '30', reason: '故障智能体延迟发现，AI缩短检查间隔' },
        ] }),
        createParam('auto_restart_count', '失败自动重启次数', 3, '次', '智能体失败后自动重启的最大次数，超出后标记为异常', 5, 82, { min: 1, max: 10, step: 1, learningDataPoints: 22000, adjustHistory: [
          { time: '3天前', from: '2', to: '3', reason: '短暂网络抖动导致误判，AI增加重启容忍次数' },
        ] }),
        createParam('priority_strategy', '智能体优先级策略', 'FIFO', '', '智能体任务调度的优先级策略', 'AI动态', 90, { type: 'select', options: ['FIFO', '效果优先', '成本优先', 'AI动态'], learningDataPoints: 51000, adjustHistory: [
          { time: '昨日', from: '效果优先', to: 'FIFO', reason: '团队手动切换至FIFO以确保公平调度' },
        ] }),
      ],
    },
    {
      title: '资源调度',
      icon: <Cpu size={16} />,
      params: [
        createParam('gpu_utilization_cap', 'GPU利用率上限', 85, '%', 'GPU使用率的最大阈值，超出后触发限流或扩容', 90, 87, { min: 50, max: 100, step: 5, learningDataPoints: 62000, adjustHistory: [
          { time: '昨日', from: '80', to: '85', reason: 'AI检测到GPU余量充足，适度提升上限以增加吞吐' },
        ] }),
        createParam('memory_overflow_threshold', '内存溢出预警阈值', 80, '%', '内存使用率预警线，超出后触发告警和自动清理', 75, 84, { min: 50, max: 95, step: 5, learningDataPoints: 41000, adjustHistory: [
          { time: '2天前', from: '85', to: '80', reason: 'OOM事件频发，AI降低预警阈值' },
        ] }),
        createParam('auto_scaling_strategy', '自动扩缩容策略', '关闭', '', '集群自动扩缩容策略，AI弹性模式根据预测负载动态调整', 'AI弹性', 91, { type: 'select', options: ['关闭', '保守', '均衡', 'AI弹性'], learningDataPoints: 55000, adjustHistory: [
          { time: '3天前', from: '保守', to: '关闭', reason: '团队手动关闭扩缩容进行维护' },
        ] }),
        createParam('task_queue_backlog_alert', '任务队列积压预警', 100, '条', '任务队列积压超过此数量时触发预警', 50, 83, { min: 10, max: 500, step: 10, learningDataPoints: 33000, adjustHistory: [
          { time: '昨日', from: '150', to: '100', reason: 'AI检测到积压过多导致延迟，收紧预警阈值' },
        ] }),
      ],
    },
    {
      title: '协同策略',
      icon: <Network size={16} />,
      params: [
        createParam('inter_agent_timeout', '智能体间通信超时', 5, '秒', '智能体之间通信请求的超时时间', 3, 86, { min: 1, max: 30, step: 1, learningDataPoints: 47000, adjustHistory: [
          { time: '2天前', from: '10', to: '5', reason: 'AI发现长超时导致级联延迟，缩短超时时间' },
        ] }),
        createParam('data_sharing_scope', '数据共享范围', '最小化', '', '智能体间数据共享的范围策略', 'AI优化', 84, { type: 'select', options: ['最小化', '按需共享', '全局共享', 'AI优化'], learningDataPoints: 28000, adjustHistory: [
          { time: '3天前', from: '按需共享', to: '最小化', reason: '安全审计后手动切换至最小化共享' },
        ] }),
        createParam('conflict_resolution', '冲突解决策略', '优先级', '', '多智能体任务冲突时的解决策略', 'AI裁决', 80, { type: 'select', options: ['优先级', '投票', '仲裁', 'AI裁决'], learningDataPoints: 19000, adjustHistory: [
          { time: '1周前', from: '投票', to: '优先级', reason: '投票延迟过高，团队切换至优先级策略' },
        ] }),
        createParam('max_collaboration_depth', '协同任务最大深度', 5, '层', '协同任务链的最大嵌套深度，防止无限递归', 3, 82, { min: 1, max: 10, step: 1, learningDataPoints: 15000, adjustHistory: [
          { time: '4天前', from: '3', to: '5', reason: '复杂任务需要更深协同，AI增加深度限制' },
        ] }),
      ],
    },
  ]

  const agentMatrixAILearningStatus: AILearningStatus = {
    modelVersion: 'v2.0.0-matrix',
    lastTraining: '1小时前',
    totalDataPoints: 156000,
    avgConfidence: 86,
    autoAdjustCount24h: 89,
    learningRate: '0.0008 (AdamW)',
    nextTraining: '3小时后',
    improvementRate: '+11.2%',
  }

  useRegisterAIConfig(agentMatrixAIConfigGroups, agentMatrixAILearningStatus, '智能体矩阵')

  const filtered = agents.filter(a => {
    if (filter !== 'all' && a.cluster !== filter) return false
    if (search && !a.name.includes(search) && !a.role.includes(search) && !a.replacedPosition.includes(search)) return false
    return true
  })

  const grouped = filtered.reduce((acc, a) => {
    const key = `${a.cluster}|${a.subGroup}`
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {} as Record<string, Agent[]>)

  return (
    <>
      <div className="page-header">
        <h2>智能体矩阵</h2>
        <p>64个智能体 · 全面替代76个人工岗位 · 6大集群协同运行 · 🌍 国际投放集群 · 💜 全渠道消费者运营集群</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="AutoPipeline-Orchestrator" color="#e8365d" />
        <ModelBadge name="AnomalyDetector-LSTM" color="#e8365d" />
        <ModelBadge name="BidOptimizer-DQN" color="#e8365d" />
        <ModelBadge name="ContentQuality-Scorer" color="#e8365d" />
      </div>
      <div className="page-content">
        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>视图：</span>
          {(['cluster', 'flywheel'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
              border: viewMode === mode ? '1px solid #e8365d' : '1px solid var(--border)',
              background: viewMode === mode ? 'rgba(232,54,93,0.12)' : 'transparent',
              color: viewMode === mode ? '#e8365d' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
              {mode === 'cluster' ? <><Bot size={12} /> 集群视图</> : <><RotateCcw size={12} /> 飞轮视角</>}
            </button>
          ))}
        </div>

        {/* Filters (only for cluster view) */}
        {viewMode === 'cluster' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索智能体名称、角色、替代岗位..."
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>全部 (64)</button>
            {Object.entries(clusterInfo).map(([key, info]) => (
              <button key={key} className={`tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                {info.name.replace('智能体集群', '')} ({info.count})
              </button>
            ))}
          </div>
        </div>
        )}

        {/* Summary stats */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4ade80' }}>{realRunningCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>运行中</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#94a3b8' }}>{placeholderOfflineCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>离线占位</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a' }}>{realAgents.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>新智能体</div>
          </div>
          <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'total_tasks', data: {total: agents.reduce((s, a) => s + a.tasksCompleted, 0), agents: agents.map(a => ({name: a.name, tasks: a.tasksCompleted, cluster: a.cluster}))}})}>
            <div style={{ fontSize: '2rem', fontWeight: 700 }}>{agents.reduce((s, a) => s + a.tasksCompleted, 0).toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>总完成任务数</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>新智能体</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>当前已经接入并可直接运行的新智能体，统一并入矩阵；下方占位卡片继续保留用于未来扩展。</div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {realLoading ? '加载中...' : `共 ${realAgents.length} 个新智能体`}
            </div>
          </div>

          {realError ? (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', color: '#b91c1c', border: '1px solid rgba(220,38,38,0.16)' }}>
              {realError}
            </div>
          ) : realLoading ? (
            <div className="card" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>正在加载新智能体列表...</div>
          ) : filteredRealAgents.length === 0 ? (
            <div className="card" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>当前没有匹配的新智能体，可在 Agent Studio 创建或接入后显示在这里。</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filteredRealAgents.map((agent) => (
                <div
                  key={`real-${agent.id}`}
                  className="agent-card"
                  onClick={() => {
                    if (!agent.mappedAgentType) return
                    navigate(getNewAgentDetailPath(agent.mappedAgentType))
                  }}
                  style={{
                    cursor: agent.mappedAgentType ? 'pointer' : 'default',
                    borderLeft: `3px solid ${getNewAgentStatusStyle(agent.runtimeStatus).accentColor}`,
                    minHeight: 142,
                  }}
                >
                  <div className="agent-card-header">
                    <span
                      className="agent-card-name"
                      style={{
                        maxWidth: '62%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {agent.name}
                    </span>
                    <span
                      className={`status-badge ${agent.runtimeStatus}`}
                      style={{
                        background: getNewAgentStatusStyle(agent.runtimeStatus).badgeBackground,
                        color: getNewAgentStatusStyle(agent.runtimeStatus).badgeColor,
                      }}
                    >
                      <span
                        className={`status-dot ${agent.runtimeStatus}`}
                        style={{ background: getNewAgentStatusStyle(agent.runtimeStatus).dotColor }}
                      />
                      {agent.runtimeStatus === 'running' ? '运行' : agent.runtimeStatus === 'training' ? '草稿' : agent.runtimeStatus === 'idle' ? '空闲' : '异常'}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      minHeight: 42,
                      marginBottom: 8,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {agent.description}
                  </div>
                  <div className="agent-card-stats">
                    <div className="agent-stat">定义 <span title={agent.definition.agentDefId}>{shortenMiddle(agent.definition.agentDefId, 16)}</span></div>
                    <div className="agent-stat">发布 <span>{agent.definition.publishStatus ?? 'DRAFT'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Flywheel View ── */}
        {viewMode === 'flywheel' && (
          <div>
            <div style={{ padding: '10px 14px', background: 'rgba(14,165,233,0.08)', borderRadius: 8, border: '1px solid rgba(14,165,233,0.2)', marginBottom: 16, fontSize: '0.8rem' }}>
              <strong style={{ color: '#7dd3fc' }}>🔄 飞轮视角</strong>：52个智能体按内容飞轮6大阶段重新编排，直观展示每个阶段的AI能力覆盖。点击智能体卡片查看详情。
            </div>
            {FLYWHEEL_STAGES.map(stage => {
              const stageAgents = agents.filter(a => stage.agentIds.includes(a.id))
              return (
                <div key={stage.id} style={{ marginBottom: 20 }}>
                  {/* Stage Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px 14px', background: `${stage.color}0f`, borderRadius: 8, borderLeft: `4px solid ${stage.color}` }}>
                    <stage.icon size={16} color={stage.color} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: stage.color }}>{stage.label}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1 }}>{stage.desc}</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: `${stage.color}20`, color: stage.color, fontWeight: 700 }}>{stage.kpi}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stageAgents.length} 个智能体</span>
                  </div>
                  {/* Models used */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    {stage.models.map(m => (
                      <span key={m} style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: 5, background: `${stage.color}15`, color: stage.color, border: `1px solid ${stage.color}30` }}>{m}</span>
                    ))}
                  </div>
                  {/* Agent cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                    {stageAgents.map(agent => (
                      <div key={agent.id} className="agent-card" style={{ cursor: 'default', borderLeft: `3px solid ${stage.color}` }}>
                        <div className="agent-card-header">
                          <span className="agent-card-name">{agent.name}</span>
                          <span className={`status-badge ${getPlaceholderBadgeClass()}`}>
                            <span className={`status-dot ${getPlaceholderBadgeClass()}`} />
                            {getPlaceholderBadgeText()}
                          </span>
                        </div>
                        <div className="agent-card-role" style={{ fontSize: '0.68rem' }}>{agent.role}</div>
                        <div className="agent-card-stats">
                          <div className="agent-stat">健康 <span>{agent.health}%</span></div>
                          <div className="agent-stat">任务 <span>{agent.tasksCompleted.toLocaleString()}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Agent grid grouped */}
        {viewMode === 'cluster' && <div>
          {Object.entries(grouped).map(([key, groupAgents]) => {
            const [cluster, subGroup] = key.split('|')
            const info = clusterInfo[cluster as keyof typeof clusterInfo]
            return (
              <div key={key} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: info.color }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{subGroup}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({groupAgents.length})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {groupAgents.map(agent => (
                    <div key={agent.id} className="agent-card" style={{ cursor: 'default' }}>
                      <div className="agent-card-header">
                        <span className="agent-card-name">{agent.name}</span>
                        <span className={`status-badge ${getPlaceholderBadgeClass()}`}>
                          <span className={`status-dot ${getPlaceholderBadgeClass()}`} />
                          {getPlaceholderBadgeText()}
                        </span>
                      </div>
                      <div className="agent-card-role">替代: {agent.replacedPosition}</div>
                      <div className="progress-bar" style={{ marginBottom: 8 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${agent.health}%`,
                          background: agent.health > 95 ? '#ff9eb5' : agent.health > 90 ? '#c084fc' : '#e8365d'
                        }} />
                      </div>
                      <div className="agent-card-stats">
                        <div className="agent-stat">健康 <span>{agent.health}%</span></div>
                        <div className="agent-stat">任务 <span>{agent.tasksCompleted.toLocaleString()}</span></div>
                        <div className="agent-stat">可用 <span>{agent.uptime}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>}

        {/* Fixed right-side detail panel + overlay */}
        {(selected || selectedReal) && (() => {
          const isReal = Boolean(selectedReal)
          const realDetail = selectedReal ? buildRealAgentRuntimeDetail(selectedReal) : null
          const mockDetail = selected ? getMockDetail(selected) : null
          const clusterColor = selected ? clusterInfo[selected.cluster].color : '#0891b2'
          const newAgentStatusStyle = selectedReal ? getNewAgentStatusStyle(selectedReal.runtimeStatus) : null
          return (
            <>
              <div
                onClick={() => {
                  setSelected(null)
                  setSelectedReal(null)
                }}
                style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
                  zIndex: 200, backdropFilter: 'blur(1px)',
                }}
              />
              <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
                background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                zIndex: 201, display: 'flex', flexDirection: 'column',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
                overflowY: 'auto',
              }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${clusterColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={20} color={clusterColor} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedReal?.name ?? selected?.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {selectedReal ? `${selectedReal.clusterLabel} · ${selectedReal.subGroup}` : `${selected?.role} · ${selected?.subGroup}`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelected(null)
                        setSelectedReal(null)
                      }}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {!isReal && selected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={`status-badge ${getPlaceholderBadgeClass()}`}>
                        <span className={`status-dot ${getPlaceholderBadgeClass()}`} />
                        {getPlaceholderBadgeText()}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>所属集群:</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: clusterColor }}>{clusterInfo[selected.cluster].name.replace('智能体集群', '')}</span>
                    </div>
                  )}

                  {isReal && selectedReal && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span
                        className={`status-badge ${selectedReal.runtimeStatus}`}
                        style={{
                          background: newAgentStatusStyle?.badgeBackground,
                          color: newAgentStatusStyle?.badgeColor,
                        }}
                      >
                        <span
                          className={`status-dot ${selectedReal.runtimeStatus}`}
                          style={{ background: newAgentStatusStyle?.dotColor }}
                        />
                        {selectedReal.runtimeStatus === 'running' ? '运行中' : selectedReal.runtimeStatus === 'training' ? '草稿' : selectedReal.runtimeStatus === 'idle' ? '空闲' : '异常'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>agentDefId:</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0891b2' }}>{selectedReal.definition.agentDefId}</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: '16px 24px', flex: 1 }}>
                  {isReal && selectedReal && realDetail ? (
                    <>
                      <div style={{ background: 'rgba(240,253,244,0.9)', border: '1px solid rgba(134,239,172,0.65)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                        <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 600, marginBottom: 4 }}>
                          <Activity size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          当前任务
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{realDetail.currentTask}</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                        {[
                          { label: '发布状态', value: selectedReal.definition.publishStatus ?? 'DRAFT', color: '#22c55e' },
                          { label: 'Registry', value: selectedReal.registry?.status ?? '未注册', color: '#0891b2' },
                          { label: '版本', value: selectedReal.definition.version ?? 'v1', color: '#f59e0b' },
                          { label: '平均响应', value: `${realDetail.avgResponseTime}s`, color: '#f59e0b' },
                          { label: '健康度', value: `${98 - (selectedReal.id % 5)}%`, color: '#c084fc' },
                          { label: 'Skill', value: selectedReal.registry?.currentSkillId ?? '未发布', color: 'var(--text-secondary)' },
                        ].map(m => (
                          <div key={m.label} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: m.color, wordBreak: 'break-all' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Cpu size={13} color="#22c55e" />
                          性能指标
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[
                            { label: 'CPU', value: realDetail.cpu, max: 100, unit: '%', icon: Cpu, color: realDetail.cpu > 80 ? '#ef4444' : '#86efac' },
                            { label: '内存', value: realDetail.memory, max: 100, unit: '%', icon: Database, color: realDetail.memory > 80 ? '#ef4444' : '#bbf7d0' },
                            { label: '吞吐量', value: realDetail.throughput, max: 280, unit: '/min', icon: Zap, color: '#4ade80' },
                          ].map(({ label, value, max, unit, icon: Icon, color }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem' }}>
                              <Icon size={13} color={color} style={{ flexShrink: 0 }} />
                              <span style={{ color: 'var(--text-muted)', width: 48, flexShrink: 0 }}>{label}</span>
                              <div style={{ flex: 1, height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontWeight: 600, width: 52, textAlign: 'right', color }}>{value}{unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>最近5次操作</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {realDetail.recentActions.map((a, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>{a.time}</span>
                              <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{a.action}</span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: a.result === '成功' ? '#34d399' : '#fbbf24', flexShrink: 0 }}>{a.result}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>新智能体详情</div>
                        <div style={{ display: 'grid', gap: 10 }}>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}><strong>名称:</strong> {selectedReal.definition.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}><strong>描述:</strong> {selectedReal.definition.description ?? '暂无描述'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}><strong>Registry UniqueId:</strong> {selectedReal.registry?.agentUniqueId ?? '未注册'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}><strong>当前 Skill:</strong> {selectedReal.registry?.currentSkillId ?? '未发布'}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>业务规则</div>
                        <pre className="playground-code-block">{prettyJson(selectedReal.definition.businessRules ?? '')}</pre>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>模型配置</div>
                        <pre className="playground-code-block">{prettyJson(selectedReal.definition.modelConfig ?? '')}</pre>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                        <button onClick={() => window.location.href = '/agent-studio'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(8,145,178,0.25)', background: 'rgba(8,145,178,0.08)', color: '#0891b2', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          <Settings size={14} /> 调整定义
                        </button>
                        <button onClick={() => window.location.href = '/agent-registry'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.08)', color: '#16a34a', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          <RefreshCw size={14} /> 查看注册态
                        </button>
                      </div>

                      <RealAgentWorkbench realAgent={selectedReal} />
                    </>
                  ) : selected && mockDetail ? (
                    <>
                      {mockDetail.currentTask && (
                        <div style={{ background: 'var(--rose-50, #f5f3ff)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                          <div style={{ fontSize: '0.7rem', color: '#e8365d', fontWeight: 600, marginBottom: 4 }}>
                            <Activity size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                            当前任务
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{mockDetail.currentTask}</div>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                        {[
                          { label: '可用率', value: selected.uptime, color: '#34d399' },
                          { label: '今日任务', value: selected.tasksCompleted.toLocaleString(), color: clusterColor },
                          { label: '成功率', value: `${mockDetail.successRate}%`, color: '#34d399' },
                          { label: '平均响应', value: `${mockDetail.avgResponseTime}s`, color: '#fbbf24' },
                          { label: '健康度', value: `${selected.health}%`, color: selected.health > 95 ? '#ff9eb5' : '#c084fc' },
                          { label: '替代岗位', value: selected.replacedPosition, color: 'var(--text-secondary)' },
                        ].map(m => (
                          <div key={m.label} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: m.color, wordBreak: 'break-all' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Cpu size={13} color={clusterColor} />
                          性能指标
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[
                            { label: 'CPU', value: mockDetail.cpu, max: 100, unit: '%', icon: Cpu, color: mockDetail.cpu > 80 ? '#ef4444' : '#60a5fa' },
                            { label: '内存', value: mockDetail.memory, max: 100, unit: '%', icon: Database, color: mockDetail.memory > 80 ? '#ef4444' : '#ff9eb5' },
                            { label: '吞吐量', value: mockDetail.throughput, max: 280, unit: '/min', icon: Zap, color: '#34d399' },
                          ].map(({ label, value, max, unit, icon: Icon, color }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.78rem' }}>
                              <Icon size={13} color={color} style={{ flexShrink: 0 }} />
                              <span style={{ color: 'var(--text-muted)', width: 48, flexShrink: 0 }}>{label}</span>
                              <div style={{ flex: 1, height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
                              </div>
                              <span style={{ fontWeight: 600, width: 52, textAlign: 'right', color }}>{value}{unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>最近5次操作</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {mockDetail.recentActions.map((a, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border-light)', fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', flexShrink: 0 }}>{a.time}</span>
                              <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{a.action}</span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: a.result === '成功' ? '#34d399' : '#fbbf24', flexShrink: 0 }}>{a.result}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>关键算法</div>
                        <div style={{ fontSize: '0.78rem', padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 6, fontFamily: 'monospace', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>{selected.algorithm}</div>
                      </div>

                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>智能体描述</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selected.description}</div>
                      </div>

                      {agentMsg && (
                        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: `${agentMsg.color}18`, border: `1px solid ${agentMsg.color}40`, fontSize: '0.78rem', color: agentMsg.color, fontWeight: 600 }}>
                          {agentMsg.text}
                        </div>
                      )}

                      {agentActionPanel === '查看日志' && (
                        <AgentLogPanel agent={selected} onClose={() => setAgentActionPanel(null)} />
                      )}

                      {agentActionPanel === '配置参数' && (
                        <AgentConfigPanel
                          agent={selected}
                          onClose={() => setAgentActionPanel(null)}
                          onSave={(msg) => { setAgentActionPanel(null); triggerAgentMsg(msg) }}
                        />
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <button onClick={() => setAgentActionPanel(agentActionPanel === '查看日志' ? null : '查看日志')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: `1px solid rgba(99,102,241,0.25)`, background: agentActionPanel === '查看日志' ? '#6366f1' : 'rgba(99,102,241,0.08)', color: agentActionPanel === '查看日志' ? 'white' : '#6366f1', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          <FileText size={14} /> 查看日志
                        </button>
                        <button onClick={() => {
                          if (!selected) return
                          const isPaused = pausedAgents.has(selected.name)
                          if (isPaused) {
                            setPausedAgents(prev => { const s = new Set(prev); s.delete(selected.name); return s })
                            triggerAgentMsg(`▶️ ${selected.name} 已恢复运行`, '#22c55e')
                          } else {
                            setPausedAgents(prev => new Set(prev).add(selected.name))
                            triggerAgentMsg(`⏸ ${selected.name} 已暂停，所有执行队列已挂起`, '#ca8a04')
                          }
                        }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: `1px solid rgba(202,138,4,0.25)`, background: pausedAgents.has(selected.name) ? '#ca8a04' : 'rgba(202,138,4,0.08)', color: pausedAgents.has(selected.name) ? 'white' : '#ca8a04', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          <PauseCircle size={14} /> {pausedAgents.has(selected.name) ? '恢复运行' : '暂停智能体'}
                        </button>
                        <button onClick={() => {
                          if (!selected || restartingAgents.has(selected.name)) return
                          setRestartingAgents(prev => new Set(prev).add(selected.name))
                          triggerAgentMsg(`🔄 ${selected.name} 重启中...`, '#dc2626')
                          setTimeout(() => {
                            setRestartingAgents(prev => { const s = new Set(prev); s.delete(selected.name); return s })
                            triggerAgentMsg(`✅ ${selected.name} 重启成功，已恢复正常运行`, '#22c55e')
                          }, 2000)
                        }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: `1px solid rgba(220,38,38,0.25)`, background: restartingAgents.has(selected.name) ? '#dc2626' : 'rgba(220,38,38,0.08)', color: restartingAgents.has(selected.name) ? 'white' : '#dc2626', fontSize: '0.78rem', fontWeight: 600, cursor: restartingAgents.has(selected.name) ? 'not-allowed' : 'pointer' }}>
                          <RotateCcw size={14} /> {restartingAgents.has(selected.name) ? '重启中...' : '重启'}
                        </button>
                        <button onClick={() => setAgentActionPanel(agentActionPanel === '配置参数' ? null : '配置参数')}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 12px', borderRadius: 8, border: `1px solid rgba(8,145,178,0.25)`, background: agentActionPanel === '配置参数' ? '#0891b2' : 'rgba(8,145,178,0.08)', color: agentActionPanel === '配置参数' ? 'white' : '#0891b2', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                          <Settings size={14} /> 配置参数
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          )
        })()}
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
                {selectedDetail.type === 'status_running' && '运行中智能体详情'}
                {selectedDetail.type === 'status_training' && '训练中智能体详情'}
                {selectedDetail.type === 'status_idle' && '空闲智能体详情'}
                {selectedDetail.type === 'total_tasks' && '任务完成统计'}
                {selectedDetail.type === 'agent_detail' && `智能体详情: ${selectedDetail.data.name}`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {(selectedDetail.type === 'status_running' || selectedDetail.type === 'status_training' || selectedDetail.type === 'status_idle') && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>数量</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff9eb5' }}>{selectedDetail.data.count}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>平均健康度</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#34d399' }}>{(selectedDetail.data.agents.reduce((s: number, a: Agent) => s + a.health, 0) / Math.max(selectedDetail.data.agents.length, 1)).toFixed(1)}%</div>
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>总任务数</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c084fc' }}>{selectedDetail.data.agents.reduce((s: number, a: Agent) => s + a.tasksCompleted, 0).toLocaleString()}</div>
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>名称</th><th>角色</th><th>健康度</th><th>任务数</th><th>可用率</th></tr>
                  </thead>
                  <tbody>
                    {selectedDetail.data.agents.map((a: Agent) => (
                      <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'agent_detail', data: a})}>
                        <td style={{ fontWeight: 600 }}>{a.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{a.role}</td>
                        <td style={{ color: a.health > 95 ? '#34d399' : '#fbbf24' }}>{a.health}%</td>
                        <td>{a.tasksCompleted.toLocaleString()}</td>
                        <td>{a.uptime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {selectedDetail.type === 'total_tasks' && (
              <>
                <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', marginBottom: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>总完成任务</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff9eb5' }}>{selectedDetail.data.total.toLocaleString()}</div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr><th>智能体</th><th>集群</th><th>完成任务数</th></tr>
                  </thead>
                  <tbody>
                    {selectedDetail.data.agents.sort((a: any, b: any) => b.tasks - a.tasks).map((a: any, i: number) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{a.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{a.cluster}</td>
                        <td style={{ color: '#ff9eb5', fontWeight: 600 }}>{a.tasks.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {selectedDetail.type === 'agent_detail' && (() => {
              const a = selectedDetail.data as Agent
              const detail = getMockDetail(a)
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: '健康度', value: `${a.health}%`, color: a.health > 95 ? '#34d399' : '#fbbf24' },
                      { label: '成功率', value: `${detail.successRate}%`, color: '#34d399' },
                      { label: '响应时间', value: `${detail.avgResponseTime}s`, color: '#fbbf24' },
                      { label: 'CPU', value: `${detail.cpu}%`, color: detail.cpu > 80 ? '#ef4444' : '#60a5fa' },
                      { label: '内存', value: `${detail.memory}%`, color: detail.memory > 80 ? '#ef4444' : '#ff9eb5' },
                      { label: '吞吐量', value: `${detail.throughput}/min`, color: '#34d399' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>最近操作</div>
                    {detail.recentActions.map((act, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.75rem', marginBottom: 4, cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'action_detail', data: { agent: a.name, ...act }})}>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{act.time}</span>
                        <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{act.action}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: act.result === '成功' ? '#34d399' : '#fbbf24' }}>{act.result}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <strong>算法:</strong> {a.algorithm}<br />
                    <strong>替代岗位:</strong> {a.replacedPosition}<br />
                    <strong>描述:</strong> {a.description}
                  </div>
                </>
              )
            })()}

            {selectedDetail.type === 'action_detail' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>智能体</span>
                  <span style={{ fontWeight: 600 }}>{selectedDetail.data.agent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>时间</span>
                  <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedDetail.data.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>操作</span>
                  <span style={{ fontWeight: 600 }}>{selectedDetail.data.action}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>结果</span>
                  <span style={{ fontWeight: 600, color: selectedDetail.data.result === '成功' ? '#34d399' : '#fbbf24' }}>{selectedDetail.data.result}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
