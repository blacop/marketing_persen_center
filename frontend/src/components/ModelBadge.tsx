import { useState, useRef, useEffect } from 'react'
import { Zap, Activity, TrendingUp, Brain, Database, RefreshCw, X } from 'lucide-react'

/* ─── 32模型快查数据 ─────────────────────────────── */
const MODEL_DB: Record<string, {
  type: string; group: string; framework: string; latency: string
  qps: number; accuracy: number; lastTrain: string; version: string; agents: string
}> = {
  'CTR-Predictor-DeepFM':     { type: '点击率预测',       group: '投放优化', framework: 'DeepFM (深度因子分解机)',           latency: '5ms',    qps: 120000, accuracy: 92.4, lastTrain: '每小时',      version: 'v4.5.0', agents: '抖音/小红书/快手投手、素材评估' },
  'CVR-Predictor-ESMM':       { type: '转化率预测',       group: '投放优化', framework: 'ESMM 多任务学习 (CTR×CVR)',         latency: '6ms',    qps: 95000,  accuracy: 89.7, lastTrain: '每小时',      version: 'v3.2.0', agents: 'oCPM出价、BidOptimizer、ROI预测' },
  'BidOptimizer-DQN':         { type: '出价优化',         group: '投放优化', framework: 'DQN (深度Q网络)',                   latency: '12ms',   qps: 45000,  accuracy: 94.2, lastTrain: '2小时前',     version: 'v3.8.1', agents: '抖音/小红书/快手智能投手、智能出价' },
  'TrafficPacing-RL':         { type: '预算时段节奏控制', group: '投放优化', framework: '在线强化学习 (在线PPO)',             latency: '8ms',    qps: 28000,  accuracy: 90.1, lastTrain: '实时更新',    version: 'v3.1.0', agents: '活动管理、直播间投流时段控制' },
  'CreativeFatigue-MAB':      { type: '素材疲劳检测',     group: '投放优化', framework: '多臂老虎机 (Thompson Sampling)',     latency: '3ms',    qps: 80000,  accuracy: 88.7, lastTrain: '实时更新',    version: 'v4.1.2', agents: '素材轮换智能体' },
  'BudgetMO-Optimizer':       { type: '多目标预算优化',   group: '投放优化', framework: '多目标强化学习 (MORL)',              latency: '65ms',   qps: 2000,   accuracy: 88.3, lastTrain: '每日更新',    version: 'v1.8.0', agents: '预算分配、跨平台协同' },
  'AudienceCluster-KM':       { type: '受众分群',         group: '投放优化', framework: 'K-Means + Embedding',               latency: '20ms',   qps: 8000,   accuracy: 85.3, lastTrain: '昨日',        version: 'v1.9.3', agents: '人群定向智能体' },
  'Lookalike-Expander':       { type: 'Lookalike受众扩展',group: '投放优化', framework: '双塔神经网络 + 余弦相似度',          latency: '55ms',   qps: 5500,   accuracy: 86.2, lastTrain: '每日更新',    version: 'v1.6.0', agents: '人群定向(种子扩量)、受众洞察' },
  'NewSKU-ColdStart':         { type: '新品冷启动',       group: '投放优化', framework: '元学习 (MAML) + 内容特征迁移',       latency: '32ms',   qps: 4200,   accuracy: 81.5, lastTrain: '新品上架触发', version: 'v1.3.0', agents: '新品首发投放、产品图生成' },
  'InventoryAware-Bidder':    { type: '库存感知投放决策', group: '投放优化', framework: 'XGBoost库存预测 + 规则引擎',          latency: '22ms',   qps: 3500,   accuracy: 91.3, lastTrain: '每30分钟',    version: 'v2.0.0', agents: '库存广告联动(低库存降投/高库存加投)' },
  'LiveGMV-LSTM':             { type: '直播GMV预测',      group: '投放优化', framework: 'LSTM + Attention Mechanism',         latency: '48ms',   qps: 4500,   accuracy: 85.6, lastTrain: '实时更新',    version: 'v2.3.0', agents: '直播间投流、直播排期' },
  'LiveEngagement-Predictor': { type: '直播互动热度预测', group: '投放优化', framework: '时序卷积网络 (TCN) + 弹幕语义',       latency: '15ms',   qps: 9000,   accuracy: 82.3, lastTrain: '实时更新',    version: 'v1.1.0', agents: '直播运营Hub、直播排期' },
  'VideoCompletion-Predictor':{ type: '完播率预测',       group: '投放优化', framework: '多模态Transformer (视频+音频+文本)', latency: '85ms',   qps: 6000,   accuracy: 83.8, lastTrain: '每日更新',    version: 'v1.9.0', agents: '快手剧情广告、直播切片' },
  'SearchQuery-Optimizer':    { type: '搜索词竞价优化',   group: '投放优化', framework: '强化学习 + 搜索词意图分类',           latency: '30ms',   qps: 16000,  accuracy: 88.9, lastTrain: '每小时',      version: 'v2.3.1', agents: '小红书聚光搜索、天猫品销宝' },
  'ContentLLM-Beauty':        { type: '内容创作LLM',      group: '内容生产', framework: 'Fine-tuned Qwen2.5 + LoRA',          latency: '180ms',  qps: 8000,   accuracy: 86.4, lastTrain: '每周更新',    version: 'v1.2.0', agents: '种草文案、短视频脚本、直播话术' },
  'ImageGen-SDXL-LoRA':       { type: '美妆图像生成',     group: '内容生产', framework: 'SDXL + 美妆专属LoRA',                latency: '2800ms', qps: 200,    accuracy: 91.0, lastTrain: '每月更新',    version: 'v2.0.1', agents: '产品图生成智能体' },
  'UGCQuality-Ranker':        { type: 'UGC内容质量评分',  group: '内容生产', framework: 'Multi-modal CLIP + Regression',       latency: '28ms',   qps: 15000,  accuracy: 82.9, lastTrain: '6小时前',     version: 'v1.3.2', agents: '用户UGC激励智能体' },
  'ComplianceNLP':            { type: '合规文本检测',     group: '内容生产', framework: 'Fine-tuned LLM + Rule Engine',        latency: '35ms',   qps: 10000,  accuracy: 99.2, lastTrain: '昨日',        version: 'v3.0.1', agents: '内容合规审核智能体' },
  'VideoCompletion-Predictor2':{ type: '视频爆点检测',    group: '内容生产', framework: '双流卷积网络 (SlowFast)',              latency: '340ms',  qps: 1200,   accuracy: 84.2, lastTrain: '昨日',        version: 'v1.7.3', agents: '试色视频、直播切片智能体' },
  'TrendRadar-TS':            { type: '趋势预测',         group: '内容生产', framework: '时序分析 (Prophet + LSTM)',            latency: '25ms',   qps: 3000,   accuracy: 78.5, lastTrain: '每日更新',    version: 'v1.5.0', agents: '爆款预测、实时趋势捕捉引擎' },
  'CrossPlatformAdapt-CV':    { type: '跨平台素材适配',   group: '内容生产', framework: '计算机视觉 + 平台规范分类器',          latency: '95ms',   qps: 2800,   accuracy: 93.8, lastTrain: '每周更新',    version: 'v1.0.2', agents: '本地化中心、素材库' },
  'AudienceCluster-KM2':      { type: '用户聚类分群',     group: '用户洞察', framework: 'K-Means + Embedding',                 latency: '20ms',   qps: 8000,   accuracy: 85.3, lastTrain: '昨日',        version: 'v1.9.3', agents: '人群定向、受众洞察' },
  'UserLTV-Predictor':        { type: '用户LTV预测',      group: '用户洞察', framework: 'DNN + Survival Analysis',             latency: '35ms',   qps: 9000,   accuracy: 83.7, lastTrain: '每日更新',    version: 'v2.1.0', agents: '社群运营、会员分层' },
  'SentimentAnalyzer':        { type: '用户情感分析',     group: '用户洞察', framework: 'RoBERTa + 细粒度情感分类',             latency: '42ms',   qps: 12000,  accuracy: 91.2, lastTrain: '昨日',        version: 'v3.0.0', agents: '消费者洞察引擎、舆情监控' },
  'CompetitorIntel-NLP':      { type: '竞品情报分析',     group: '用户洞察', framework: 'RoBERTa + 跨品牌对比检测',             latency: '60ms',   qps: 2500,   accuracy: 84.5, lastTrain: '每6小时',     version: 'v1.4.0', agents: '竞品内容监控、竞品监控中心' },
  'KOLScore-MultiDim':        { type: 'KOL多维综合评分',  group: '达人生态', framework: 'GBM + Graph Features',                latency: '55ms',   qps: 3000,   accuracy: 89.1, lastTrain: '每日更新',    version: 'v2.2.0', agents: 'KOL筛选、达人招募' },
  'FanFraud-GNN':             { type: '粉丝虚假识别',     group: '达人生态', framework: '图神经网络 (GraphSAGE)',               latency: '38ms',   qps: 18000,  accuracy: 93.5, lastTrain: '3小时前',     version: 'v3.1.0', agents: '粉丝质量检测智能体' },
  'FraudDetector-XGB':        { type: '广告反欺诈检测',   group: '风控安全', framework: 'XGBoost + Rules Engine',              latency: '15ms',   qps: 30000,  accuracy: 96.8, lastTrain: '6小时前',     version: 'v5.2.0', agents: '反欺诈中心、渠道质量监控' },
  'AnomalyDetector-LSTM':     { type: 'ROI异常检测',      group: '风控安全', framework: 'LSTM-Autoencoder + 动态阈值',          latency: '18ms',   qps: 25000,  accuracy: 95.1, lastTrain: '实时更新',    version: 'v4.0.2', agents: 'ROI监控、智能预警引擎' },
  'Shapley-Attribution':      { type: '多触点归因',       group: '归因预测', framework: 'Shapley值 + DNN 混合归因',             latency: '22ms',   qps: 6000,   accuracy: 87.8, lastTrain: '昨日',        version: 'v2.5.1', agents: '归因分析、种草→购买归因引擎' },
  'ROAS-Forecaster':          { type: 'ROAS预测',         group: '归因预测', framework: 'Gradient Boosting + NN',              latency: '8ms',    qps: 12000,  accuracy: 91.5, lastTrain: '今日 00:00',  version: 'v2.4.0', agents: '私域运营、复购价值分析' },
  'BayesianAB-Engine':        { type: '贝叶斯A/B实验引擎',group: '归因预测', framework: '贝叶斯推断 + Thompson Sampling',        latency: '12ms',   qps: 4000,   accuracy: 93.6, lastTrain: '实时更新',    version: 'v2.0.3', agents: '实验中心(统计显著性推断、自动全量)' },

  // ── 全球化专属模型（International） ──────────────────────────────────────────
  'MultiLingual-ContentLLM':  { type: '多语言内容生成',   group: '全球化', framework: 'GPT-4o + 多语言美妆LoRA (EN/FR/ES/JA/KO)', latency: '320ms',  qps: 5000,   accuracy: 88.5, lastTrain: '每周更新',    version: 'v1.0.0', agents: '国际素材生成、多语言文案、TikTok Global创意' },
  'CulturalAdapt-Classifier': { type: '文化适配检测',     group: '全球化', framework: 'CLIP + 跨文化向量分类器',                  latency: '45ms',   qps: 8000,   accuracy: 84.2, lastTrain: '每月更新',    version: 'v1.0.0', agents: '国际素材文化审核、禁忌内容过滤' },
  'MetaCAPI-Attribution':     { type: 'Meta转化API归因',  group: '全球化', framework: '服务端事件匹配 + 概率归因模型',              latency: '38ms',   qps: 12000,  accuracy: 82.3, lastTrain: '实时更新',    version: 'v2.1.0', agents: 'Facebook归因、iOS ATT补偿、隐私合规归因' },
  'PrivacySafe-Targeting':    { type: '隐私合规受众定向', group: '全球化', framework: '联邦学习 + 差分隐私 + 同态加密',             latency: '55ms',   qps: 6000,   accuracy: 79.8, lastTrain: '每日更新',    version: 'v1.2.0', agents: 'GDPR受众定向、Cookie-less投放、隐私合规中心' },
  'CrossBorder-Lookalike':    { type: '跨市场相似受众',   group: '全球化', framework: '双塔神经网络 + 跨市场迁移学习',              latency: '68ms',   qps: 3500,   accuracy: 81.4, lastTrain: '每日更新',    version: 'v1.1.0', agents: '国际Lookalike扩展、出海人群种子匹配' },
  'MultiCurrency-ROAS':       { type: '多币种ROAS预测',   group: '全球化', framework: 'Gradient Boosting + 实时汇率时序模型',       latency: '22ms',   qps: 9000,   accuracy: 87.6, lastTrain: '每小时',      version: 'v1.3.0', agents: '全球总控台、国际预算分配、多币种ROI核算' },
  'GlobalTrend-Radar':        { type: '全球趋势预测',     group: '全球化', framework: '时序预测 + 跨平台内容热度聚合',              latency: '120ms',  qps: 2000,   accuracy: 76.3, lastTrain: '每日更新',    version: 'v1.0.0', agents: 'TikTok热点预测、国际趋势洞察、话题追踪' },
  'IntlCreator-Scorer':       { type: '国际达人评分',     group: '全球化', framework: 'GBM + 跨平台社媒特征工程',                  latency: '62ms',   qps: 2500,   accuracy: 85.1, lastTrain: '每日更新',    version: 'v1.0.0', agents: 'TikTok Creator评估、Facebook Influencer筛选' },
  'KOLMatch-GNN':             { type: 'KOL智能匹配',      group: '达人生态', framework: '图神经网络 (GNN) + 品牌-达人相似度', latency: '48ms', qps: 4000, accuracy: 86.8, lastTrain: '每日更新', version: 'v1.5.0', agents: 'KOL发现、达人招募、品牌契合度评估' },
  'ChurnPredictor-GBM':       { type: '用户流失预测',     group: '用户洞察', framework: 'Gradient Boosting + 行为序列特征', latency: '28ms', qps: 7500, accuracy: 84.3, lastTrain: '每日更新', version: 'v2.0.0', agents: '私域运营唤醒、沉睡用户挽留、复购预测' },
}

const GROUP_COLORS: Record<string, string> = {
  '投放优化': '#e8365d', '内容生产': '#ec4899', '用户洞察': '#8b5cf6',
  '达人生态': '#06b6d4', '风控安全': '#f59e0b', '归因预测': '#10b981',
  '全球化':   '#0ea5e9',
}

interface ModelBadgeProps {
  name: string
  color: string
}

export default function ModelBadge({ name, color }: ModelBadgeProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const model = MODEL_DB[name]
  // 优先使用模型所属分组的标准色，保证徽章在任何背景下清晰可辨
  const badgeColor = model ? (GROUP_COLORS[model.group] ?? color) : color

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '2px 8px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 600,
          fontFamily: 'monospace', background: `${badgeColor}20`, color: badgeColor,
          border: `1px solid ${badgeColor}40`, cursor: 'pointer',
          transition: 'all 0.15s',
          boxShadow: open ? `0 0 0 2px ${badgeColor}40` : 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${badgeColor}32` }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${badgeColor}20` }}
      >
        {model ? model.type : name}
      </span>

      {open && model && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 9000,
          marginTop: 6, width: 320,
          background: 'var(--bg-primary)',
          border: `1px solid ${GROUP_COLORS[model.group] ?? color}44`,
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          animation: 'fadeInDown 0.18s ease',
        }}>
          {/* 头部 */}
          <div style={{
            padding: '12px 14px', borderBottom: '1px solid var(--border-light)',
            background: `${GROUP_COLORS[model.group] ?? color}08`,
            borderRadius: '12px 12px 0 0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    padding: '1px 7px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700,
                    background: `${GROUP_COLORS[model.group] ?? color}22`,
                    color: GROUP_COLORS[model.group] ?? color,
                  }}>{model.group}</span>
                  <span style={{ fontSize: '0.62rem', color: '#22c55e', fontWeight: 600 }}>● 在线</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{model.type}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 }}>{name}</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={13} color="var(--text-muted)" />
              </button>
            </div>
          </div>

          {/* 指标行 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border-light)', margin: '0' }}>
            {[
              { label: '延迟', value: model.latency, icon: <Zap size={11} color="#e8365d" /> },
              { label: 'QPS', value: `${(model.qps / 1000).toFixed(0)}K`, icon: <Activity size={11} color="#3b82f6" /> },
              { label: '准确率', value: `${model.accuracy}%`, icon: <TrendingUp size={11} color="#22c55e" /> },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg-card)', padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 3 }}>{m.icon}<span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{m.label}</span></div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* 框架 & 训练 */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <Brain size={11} color="#8b5cf6" />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>框架</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.4 }}>{model.framework}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={10} color="#22c55e" />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>训练：</span>
                <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 600 }}>{model.lastTrain}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Database size={10} color="#3b82f6" />
                <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontFamily: 'monospace', fontWeight: 600 }}>{model.version}</span>
              </div>
            </div>
          </div>

          {/* 智能体 */}
          <div style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 6 }}>覆盖智能体 & 模块</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {model.agents.split('、').map((a, i) => (
                <span key={i} style={{
                  padding: '2px 7px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 500,
                  background: 'rgba(232,54,93,0.07)', color: '#e8365d', border: '1px solid rgba(232,54,93,0.15)',
                }}>{a.trim()}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
